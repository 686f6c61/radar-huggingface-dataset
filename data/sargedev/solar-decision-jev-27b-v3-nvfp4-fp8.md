# SargeDev/Solar-Decision-JEV-27B-V3-NVFP4-FP8

## Resumen

Solar-Decision-JEV-27B-V3-NVFP4-FP8 es la tercera iteración de la línea Solar-Decision de SargeDev, publicada como cuantización NVFP4/FP8 (formato `compressed-tensors`, 30,1 GB de repositorio) del merge en bf16. El backbone es `huihui-ai/Huihui-Qwen3.8-27B-abliterated`, un Qwen3.8 de 27 320 697 856 parámetros (27,32 B) con la alineación de rechazo eliminada por *abliteration*. Sobre esa base se ha fusionado un LoRA propio (r32/α64) que entrena un *readout* de decisión tipada directamente dentro del modelo.

El problema que ataca es concreto: sustituir una cabeza de clasificación separada por una decisión emitida en un único prefill con `max_tokens=1`, leída como log-probabilidades sobre los tokens de cada opción. El modelo devuelve tres tipos de salida (elección entre opciones, puntuación y abstención del tipo "no lo sé") sobre una cabeza de decisión de 24 slots, con `decision_head.json`, `calibration.json` y `serve_decide.py` incluidos. Es relevante porque demuestra un patrón de despliegue poco habitual: un LLM de 27B que hace de clasificador calibrado sin infraestructura adicional de cabezas.

La V3 se distingue de la V2 en dos ejes: entrena sobre la unión de dos corpus (764 626 filas, 90 dominios) en lugar de solo el corpus solar, y añade `lm_head` a los módulos objetivo del LoRA, de modo que la geometría del vocabulario de salida se entrena junto con la cabeza. El autor publica los resultados de su *gate* con honestidad explícita: mejora grande en top-1, pero empeora la calibración (ECE de 0,021 a 0,167).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (`qwen3_5_text`), backbone abliterated |
| Parámetros totales | 27 320 697 856 (27,32 B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 262 144 tokens (256K), según llm-explorer.com; no confirmado en la model card |
| Tipos de cuantización | NVFP4-FP8 (este repo); escala GGUF de 11 cuantizaciones (f16, Q2_K…Q8_0) en repo aparte |
| Idiomas soportados | no disponibles (heredados del backbone Qwen3.8, sin lista publicada por el autor) |
| Licencia | apache-2.0 (según la model card; los metadatos de HuggingFace la marcan como no disponible) |
| Formato de pesos | safetensors con `compressed-tensors`; GGUF en repositorio separado |
| Tamaño del repositorio | 30,1 GB |
| Cuantización de referencia | bf16, 52 GB, 19 shards |
| Paso de merge del LoRA | step 2184 (r32/α64) |

## Arquitectura y entrenamiento

El modelo parte de un transformer decoder-only Qwen3.8 de 27B al que se ha aplicado *abliteration* (eliminación de la dirección de rechazo en el espacio de activaciones), lo que produce una base sin alineación de seguridad. Sobre ella se entrena un LoRA de rango 32 y alpha 64 cuyos módulos objetivo incluyen atención, MLP y, como novedad de la V3, `lm_head`. Ese último cambio es el relevante: al entrenar la proyección de salida, la geometría del vocabulario de decisión se ajusta de forma conjunta con el resto de la red, en lugar de depender de una cabeza externa. El merge se realizó en el step 2184.

Los datos de entrenamiento son la unión de `SargeDev/jev-distill-corpus-v3` y `SargeDev/solar-decisions-corpus-v4`: 764 626 filas repartidas en 90 dominios. La V2 entrenaba la mitad solar únicamente sobre el corpus v4; la V3 incorpora también las filas de forma verbalizadora y de decisión del corpus v3, atacando la brecha de *readout* a nivel de datos. No se documenta RLHF ni DPO en la información disponible. Se conservan los tensores del drafter MTP/nextn, lo que habilita decodificación especulativa en llama.cpp. La cuantización NVFP4/FP8 se generó con `compressed-tensors` (la V2 homóloga se construyó con llm-compressor 0.14.0).

## Capacidades

- Generación de texto y conversación general multi-turno sobre el backbone Qwen3.8-27B.
- Decisión tipada en un solo paso: elección entre opciones (`choice`), puntuación (`score`) y abstención (`noul`), leídas como log-probabilidades sobre los tokens de las opciones.
- Cabeza de decisión de 24 slots entrenada dentro de los pesos, sin proceso separado que ejecutar.
- Probabilidades calibradas para `choice` y `score` mediante `calibration.json` (con la salvedad de calibración descrita más abajo).
- Detección de incertidumbre: AUROC de 0,988 en la tarea `noul`, útil para enrutar a revisión humana.
- Modo sin censura heredado del backbone abliterated.
- Decodificación especulativa mediante los tensores MTP/nextn preservados (soportado en llama.cpp).
- Capacidades multilingües presumibles por herencia del backbone, aunque no documentadas por el autor.
- No se documentan tool calling, function calling, visión ni audio.

## Casos de uso

- Enrutado de peticiones en producción: el modelo evalúa una lista de opciones (por ejemplo, intents o colas de soporte) en un único prefill con `max_tokens=1` y devuelve la distribución de log-probabilidades sobre cada opción. Con un top-1 de 0,833 en el gate, sirve para enrutado de alta cardinalidad donde el coste por petición debe ser mínimo.
- Puntuación y ranking de candidatos: la salida `score` (top-1 0,794) permite puntuar pares consulta-respuesta o candidatos de un reranker generativo, leyendo la probabilidad del token de puntuación en lugar de generar texto libre.
- Abstención y escalado a humano: con AUROC 0,988 y top-1 0,939 en `noul`, el modelo identifica de forma fiable los casos en que no debería decidir. Se usaría como puerta previa a un clasificador o a un operador humano en flujos de atención al cliente o triaje documental.
- Selección de herramienta en agentes: la cabeza de 24 slots encaja de forma natural en un *tool router*; el coste es un prefill corto en lugar de una generación completa, lo que reduce la latencia del bucle del agente.
- Anotación y control de calidad de datasets: los 90 dominios del corpus de entrenamiento permiten usar el modelo para preetiquetar decisiones y detectar anotaciones dudosas por baja probabilidad, con revisión manual solo en la cola de abstención.
- Chat de uso diario sin restricciones: la ruta GGUF (Q4_K_M, 15,65 GiB) permite ejecutar la variante conversacional en una RTX 4090 con llama.cpp u Ollama, con decodificación especulativa activada.
- Procesamiento de documentos largos: si se confirma la ventana de 256K, admite clasificación de contratos o expedientes completos en un solo contexto, aunque este dato no está verificado en la model card.

## Benchmarks y rendimiento

Resultados del *gate* propio del autor sobre 27 695 filas, con el mismo arnés, cabeza y calibración en todas las columnas:

| Métrica | V2 (r32+1894) | V3 (step 2184) | Referencia r32-alone | Umbral AutoTrust |
|---|---|---|---|---|
| choice top-1 | 0,571 | 0,833 | 0,869 | 0,904 |
| score top-1 | 0,567 | 0,794 | no disponible | 0,891 |
| noul AUROC | 0,962 | 0,988 | 0,992 | 0,996 |
| noul top-1 | 0,879 | 0,939 | no disponible | no disponible |
| choice ECE | 0,021 | 0,167 | no disponible | no disponible |

Rendimiento de inferencia con llama-bench en GB10 (build CUDA, `-ngl 99`, pp512 / tg128):

| Cuantización | Tamaño | pp512 (t/s) | tg128 (t/s) |
|---|---|---|---|
| Q4_K_M | 15,65 GiB | 865,94 | 12,80 |
| Q8_0 | 27,04 GiB | 818,03 | 8,38 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- NVFP4-FP8 (esta variante): 29-30,1 GB de pesos; requiere al menos 32 GB de VRAM efectiva. Orientada a hardware clase GB10 (Grace Blackwell) con vLLM.
- bf16 sin cuantizar: 52 GB en 19 shards; necesita 2×A100 40GB, 2×L40S 48GB o una H100 80GB para caber con margen de KV cache.
- GGUF Q4_K_M: 15,65 GiB, cabe en RTX 4090, RTX 3090, RTX 4080 Super (16 GB justo) y en cualquier GPU consumer de 24 GB.
- GGUF Q8_0: 27,04 GiB, no cabe en GPU consumer de 24 GB; requiere A100 40GB, L40S o H100.
- Despliegue: vLLM es obligatorio para la ruta de decisiones, porque llama.cpp no devuelve los log-probabilidades por token que necesita el *readout*. Para chat, llama.cpp, Ollama o la escala GGUF son válidos.
- Throughput medido en GB10 con Q4_K_M: 865,94 t/s de prefill y 12,80 t/s de generación; con Q8_0 baja a 818,03 y 8,38 t/s respectivamente.
- La ruta de decisión es de un solo token, por lo que la latencia dominante es el prefill, no la decodificación.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | choice top-1 | noul AUROC | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Solar-Decision-JEV-27B-V3 (este) | 27,32 B | 256K (sin confirmar) | 0,833 | 0,988 | apache-2.0 | NVFP4-FP8 + GGUF |
| Solar-Decision-JEV-27B-V2 | 27 B | no disponible | 0,571 | 0,962 | apache-2.0 | NVFP4-FP8 |
| SargeDev/JEV-27B-Uncensored (r32-alone) | 27 B | no disponible | 0,869 | 0,992 | no disponible | bf16 |
| Jev_Qwen3.8-27B-Judgment (solar, chat) | 27 B | no disponible | no aplica (orientado a chat) | no aplica | no disponible | bf16 |

Lectura: la V3 sacrifica calibración (ECE 0,167 frente a 0,021 de la V2) a cambio de top-1. Si el requisito es precisión de ranking en un modelo autocontenido, la V3 es la mejor opción de la familia; si el requisito es calibración de probabilidades, el autor recomienda explícitamente r32-alone. Ninguna variante alcanza el umbral AutoTrust en choice ni en score.

## Limitaciones y advertencias

- Calibración degradada: la ECE de `choice` pasa de 0,021 (V2) a 0,167 (V3). El modelo es mucho más confiado en las filas difíciles; no usar sus probabilidades como estimación fiable de confianza sin recalibrar.
- No alcanza el umbral AutoTrust en ninguna de las métricas de decisión: queda por debajo en choice top-1 (0,833 frente a 0,904) y score top-1 (0,794 frente a 0,891).
- Ausencia total de benchmarks estándar (MMLU, HumanEval, GSM8K): no hay evidencia publicada sobre razonamiento, código o matemáticas.
- Backbone abliterated: no hay alineación de seguridad efectiva; el modelo puede producir contenido dañino o inapropiado sin filtro. Requiere moderación externa en cualquier despliegue de cara al público.
- Dependencia de vLLM: la ruta de decisión no funciona en llama.cpp, que no expone los log-probabilidades por token necesarios. El GGUF sirve solo para chat.
- Necesita artefactos auxiliares (`decision_head.json`, `calibration.json`, `serve_decide.py`) para producir decisiones; los pesos por sí solos no bastan.
- Inconsistencia en la model card: describe "bf16 merged weights (19 shards, 52 GB)" dentro del repositorio, pero este repositorio pesa 30,1 GB y contiene la cuantización NVFP4-FP8. El texto parece heredado del repo bf16.
- La licencia aparece como apache-2.0 en la model card pero como "no disponible" en los metadatos de HuggingFace; conviene verificar antes de un uso comercial.
- Contexto de 256K tomado de un agregador externo, no confirmado por el autor.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: sin validación independiente de la comunidad, y con marcas temporales de creación/actualización en octubre de 2026.
- No se documentan idiomas soportados ni evaluación multilingüe.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/SargeDev/Solar-Decision-JEV-27B-V3-NVFP4-FP8
- Versión anterior V2: https://huggingface.co/SargeDev/Solar-Decision-JEV-27B-V2-NVFP4-FP8
- Repo base de la línea (resultado negativo reproducible): https://huggingface.co/SargeDev/Solar-Decision-JEV-27B
- Repositorio GGUF de la V3: https://huggingface.co/SargeDev/Solar-Decision-JEV-27B-V3-GGUF
- Modelo recomendado para calibración (r32-alone): https://huggingface.co/SargeDev/JEV-27B-Uncensored
- Corpus de destilación v3: https://huggingface.co/datasets/SargeDev/jev-distill-corpus-v3
- Corpus de decisiones v4: https://huggingface.co/datasets/SargeDev/solar-decisions-corpus-v4
- Página de modelos de Jev AI: https://thejevai.com/models
- Ficha en llm-explorer: https://llm-explorer.com/model/SargeDev%2FSolar-JEV-27B-NVFP4-FP8,5ZeSkxgkBXYEBXX0UEXk84
