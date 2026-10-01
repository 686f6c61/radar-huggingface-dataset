# jessedye90/Swift-1.5-Qwen3.8-27B-NVFP4

## Resumen

Swift-1.5-Qwen3.8-27B-NVFP4 es una cuantización NVFP4/FP8 del modelo ukisai/Swift-1.5-Qwen3.8-27b, publicada por el usuario jessedye90. El modelo subyacente es un ajuste fino de UkisAI sobre Qwen/Qwen3.8-27B, orientado a razonamiento eficiente: según el autor, reduce el número de tokens de pensamiento frente al Qwen3.8-27B original entre un 22% y un 27%. Esta versión concreta existe para servir ese modelo en SGLang sobre NVIDIA DGX Spark (GB10, arquitectura Blackwell) con el decodificador especulativo DFlash2 y atención FlashInfer.

El repositorio contiene 21,1 GB de pesos en safetensors y 18.164.649.200 parámetros reales según el recuento del propio repositorio, aunque el nombre comercial del modelo indique 27B. Soporta entrada de imagen y texto (pipeline image-text-to-text), con una ventana nativa de 262.144 tokens ampliable a 524.288 mediante extensión YaRN. La cuantización se realizó con NVIDIA Model Optimizer 0.46.0 y calibración local_hessian, con un mapa de precisión idéntico al de RadixArk/Qwen3.8-27B-NVFP4.

Su relevancia práctica es doble: por un lado es un ejemplo reproducible de cuantización NVFP4 de un modelo híbrido de atención lineal más atención completa; por otro, incluye una receta de despliegue completa y verificada (imagen de SGLang fijada por digest, drafter especulativo, topología tensor-parallel en dos Sparks). El autor lo usa como modelo diario de programación y reporta métricas concretas de latencia y aceptación del drafter, aunque no publica resultados de benchmarks estandarizados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida Qwen3.8: 16 capas de atención completa y 48 capas de atención lineal Gated DeltaNet, más torre de visión |
| Parámetros totales | 18.164.649.200 según los safetensors del repositorio (el nombre del modelo indica 27B) |
| Parámetros activos | no disponible (no se describe como modelo MoE) |
| Longitud de contexto | 262.144 tokens nativos; 524.288 tokens con extensión YaRN |
| Tipos de cuantización | NVFP4 W4A4 con tamaño de grupo 16 y escalas de bloque FP8 (MLP y lm_head); FP8 W8A8 con escalas estáticas por tensor (atención completa y Gated DeltaNet); KV cache FP8 E4M3; torre de visión, normalizaciones, embeddings y proyecciones de estado GDN en BF16 |
| Idiomas soportados | no disponible |
| Licencia | swift-open-license-1.0 (identificador "other", enlace a LICENSE en el repositorio); licencia empresarial aparte a través de ukisai.com |
| Formato de pesos | safetensors en formato cuantizado ModelOpt (`modelopt_fp4`); repositorio de 21,1 GB |
| Librería declarada | transformers |
| Pipeline | image-text-to-text (entrada de imagen y texto) |
| Revisión base | ukisai/Swift-1.5-Qwen3.8-27b, revisión `bc7a1e10b689648585a3ef41494c8d84cf77271a` |

## Arquitectura y entrenamiento

El modelo conserva la arquitectura del Qwen3.8-27B de partida: un transformer híbrido en el que 16 capas emplean atención completa y 48 capas usan atención lineal del tipo Gated DeltaNet, un mecanismo con estado recurrente que reduce el coste de contexto largo. El checkpoint incluye torre de visión, de ahí que el pipeline declarado sea image-text-to-text. No hay cabezal MTP (`mtp.*`) en este build, por lo que la aceleración especulativa debe hacerse con DFlash2 y no con esquemas NEXTN o EAGLE.

La aportación de este repositorio no es el entrenamiento, sino la cuantización: se aplicó NVIDIA Model Optimizer 0.46.0 con calibración `local_hessian` sobre una mezcla de trazas de razonamiento en la plantilla de chat de Swift. Las proyecciones `mlp.{gate,up,down}_proj` de 64 capas y el `lm_head` quedan en NVFP4 W4A4 con escalas de bloque FP8; las proyecciones de atención (`q`, `k`, `v`, `o`) de las 16 capas de atención completa y las proyecciones de la atención lineal (`in_proj_qkv`, `in_proj_z`, `out_proj`) de las 48 capas Gated DeltaNet quedan en FP8 W8A8 con escalas estáticas por tensor. El mapa de precisión es idéntico capa por capa al de RadixArk/Qwen3.8-27B-NVFP4 (401 capas cuantizadas comparadas). El script de cuantización se incluye en el repositorio como `quantization/quantize_swift_nvfp4.py`.

## Capacidades

- Generación de texto y razonamiento conversacional de varios turnos, con modo de pensamiento eficiente que reduce el volumen de tokens de razonamiento.
- Generación y edición de código: el autor lo describe como su modelo diario de programación.
- Entrada de imagen junto a texto (image-text-to-text); se probó una imagen colocada después de 36.000 tokens de texto a través de la API de chat completions.
- Tool calling y function calling, con parser de llamadas a herramientas `qwen3_coder` y parser de razonamiento `qwen3`.
- Uso como agente multi-paso: la model card indica que Claude Code y Codex CLI funcionan contra el servidor con uso de herramientas.
- Contexto largo: recuperación tipo needle sobre ventana nativa de 262.144 tokens, con extensión documentada a 524.288 tokens.
- Compatibilidad de API: OpenAI `/v1/chat/completions` y `/v1/responses`, y API de Anthropic `/v1/messages`.
- Capacidades multilingües: no disponible (el repositorio no declara idiomas).
- Otras capacidades (audio, vídeo): no disponible.

## Casos de uso

- Asistente de programación en terminal o IDE: al exponer la API de Anthropic `/v1/messages`, puede conectarse directamente a Claude Code y Codex CLI con uso de herramientas, tal como documenta el autor.
- Agente autónomo multi-paso en pipelines de CI/CD: el soporte de tool calling con parser `qwen3_coder` permite encadenar llamadas a herramientas para ejecutar tests, leer diffs o proponer parches dentro de un flujo automatizado.
- Revisión de código y documentación técnica sobre repositorios grandes: con 262.144 tokens de contexto nativo (524.288 con YaRN) puede ingerir varios ficheros o un módulo completo en una sola pasada sin trocear.
- Análisis de documentos extensos y RAG de alta fidelidad: la validación de recuperación tipo needle en la receta indica que el modelo mantiene el acceso a información situada en posiciones lejanas del contexto.
- Diagnóstico a partir de capturas o diagramas: al aceptar entrada de imagen, permite pegar una captura de error o un diagrama de arquitectura junto al código y la pregunta, incluso con decenas de miles de tokens de contexto previo.
- Servicio interno on-premise compatible con OpenAI: la receta se despliega con SGLang y ofrece endpoints compatibles con OpenAI y Anthropic, lo que permite sustituir un proveedor externo sin reescribir clientes.
- Razonamiento con coste controlado: dado que el ajuste reduce los tokens de pensamiento entre un 22% y un 27% frente al Qwen3.8-27B original, resulta adecuado para tareas de análisis donde el coste por token generado es determinante.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K ni similares) en la información disponible. Las únicas cifras publicadas son de fidelidad de la cuantización y de eficiencia de servicio, y el propio autor advierte que las de fidelidad corresponden al build 1.0 y no se re-midieron para 1.5.

| Métrica | Valor | Condiciones declaradas |
|---|---|---|
| Top-1 agreement frente a BF16 | 91,72% (build 1.0) | No re-medido para 1.5; valor indicativo |
| Divergencia KL (held-out / salidas Swift) | 0,243 / 0,167 (build 1.0) | No re-medido para 1.5; valor indicativo |
| Reducción de tokens de salida | 16% menos que el build Swift 1.0 | Turnos reales de agente, con aceptación ligeramente mayor del drafter DFlash2 |
| Latencia en tareas de pensamiento | ~2x más rápido que el build Q4_K_M de llama.cpp | Mismo hardware, comparación entre builds concretos |
| Velocidad de prefill | ~2,2x más rápida que el build Q4_K_M de llama.cpp | Misma comparación |
| Comparación con Qwen3.8-27B sin ajustar | 1,35-1,4x más rápido en la misma pila SGLang | Atribuido a que piensa entre un 22% y un 27% menos |
| Throughput decodificando pensamiento | 58,3 tok/s con un Spark; 85,8 tok/s con dos (build 1.0); ~86 tok/s en la configuración diaria del autor (TP2) | Pool KV de ~2,2M tokens en la configuración TP2 |

Las puertas de calidad internas que el autor indica haber superado son un conjunto interno de 20 puntos, una muestra de LiveCodeBench v6, recuperación tipo needle, llamadas a herramientas e entrada de imagen. No se publican las puntuaciones de esas pruebas.

## Requisitos de hardware

- Pesos: 21,1 GB en el repositorio (NVFP4 + FP8, con torre de visión y capas en BF16).
- Hardware documentado: NVIDIA DGX Spark (GB10, Blackwell). Una sola unidad es suficiente para el despliegue con `--tp-size 1`, con `--mem-fraction-static 0.70` y `--memory 100g` reservados al contenedor.
- Escalado: dos DGX Spark en tensor-parallel (`--tp-size 2 --nnodes 2`) con enlaces RDMA ConnectX-7 RoCE; en esta topología el autor reporta ~86 tok/s en tareas de razonamiento y un pool KV de ~2,2M tokens.
- GPU de consumo: no disponible. No hay mediciones publicadas en GPUs consumer; los 21,1 GB de pesos dejan poco margen en tarjetas de 24 GB una vez se suman caché KV y estados de la atención lineal, y no se documenta ninguna ejecución de ese tipo.
- Despliegue soportado: SGLang, con la imagen `lmsysorg/sglang:v0.5.19` fijada por digest `sha256:d6e7288627be8b02be88e4bba38e73f6d50e2826869f753c13a4c4385ab3eda9`, backend de atención FlashInfer y decodificación especulativa DFlash2 con el drafter `maurienne-ai/Qwen3.8-27B-DFlash2-NVFP4-RTNcal` (16 tokens de borrador).
- Otros motores (vLLM, llama.cpp, Ollama, TGI): no disponibles en la información proporcionada. El formato `modelopt_fp4` y la ausencia de cabezal MTP condicionan el soporte.
- Arranque: la primera puesta en marcha tarda 7-8 minutos por `torch.compile` y captura de CUDA graphs.
- Latencia y throughput: ver la tabla de la sección anterior. Las cifras corresponden a builds concretos y el autor advierte explícitamente de que no son un ranking de modelos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| jessedye90/Swift-1.5-Qwen3.8-27B-NVFP4 | 18.164.649.200 (safetensors) | 262.144 nativo / 524.288 con YaRN | NVFP4 W4A4 + FP8 W8A8, safetensors, 21,1 GB | swift-open-license-1.0 | Build analizado; sin cabezal MTP, requiere DFlash2 |
| ukisai/Swift-1.5-Qwen3.8-27b | no disponible | no disponible | BF16 | no disponible | Modelo upstream del que procede esta cuantización |
| Qwen/Qwen3.8-27B | no disponible | no disponible | no disponible | no disponible | Modelo base original; según el autor, 1,35-1,4x más lento en la misma pila SGLang por pensar 22-27% más |
| RadixArk/Qwen3.8-27B-NVFP4 | no disponible | no disponible | NVFP4 (ModelOpt) | no disponible | Origen del mapa de precisión, idéntico capa por capa según el autor |
| jessedye90/Swift-Qwen3.8-27B-NVFP4 (Swift 1.0) | no disponible | no disponible | NVFP4 / FP8 | no disponible | Predecesor directo; sigue publicado. El build 1.5 genera un 16% menos de tokens de salida |

## Limitaciones y advertencias

- Tracción nula: el repositorio registra 0 descargas y 0 "me gusta" en el momento de la consulta, por lo que no hay validación independiente de la comunidad.
- Fidelidad de la cuantización no verificada en esta versión: las cifras de top-1 agreement (91,72%) y divergencia KL (0,243 / 0,167) corresponden al build 1.0 y el autor indica que no se re-midieron para 1.5. Deben tratarse como indicativas.
- Ausencia de benchmarks estandarizados: no hay MMLU, HumanEval, GSM8K ni resultados equivalentes publicados, lo que impide comparar de forma objetiva con alternativas.
- Riesgo de alucinación: no se publica ninguna evaluación de tasas de alucinación ni de veracidad factual.
- Idiomas: el repositorio no declara idiomas soportados; el comportamiento multilingüe no está documentado.
- Restricciones de licencia: la licencia es "other" con nombre `swift-open-license-1.0`. Es imprescindible leer el fichero LICENSE antes de cualquier uso comercial, y el autor remite a ukisai.com para licencias empresariales. La licencia del modelo base puede imponer condiciones adicionales.
- Dependencia de una pila muy concreta: la receta fija una imagen de SGLang por digest, un drafter especulativo concreto y FlashInfer. Salir de esa combinación no está documentado ni probado.
- Sin cabezal MTP: no se puede usar decodificación especulativa basada en NEXTN o EAGLE; hay que emplear DFlash2.
- Extensión a 524.288 tokens: requiere copiar el checkpoint y el drafter a directorios locales y ajustar `config.json` en ambos. El rendimiento real a esa longitud no se documenta.
- Consumo de memoria elevado: la receta reserva 100 GB de memoria al contenedor y usa `--mem-fraction-static 0.70`, lo que condiciona el hardware disponible.
- Arranque lento y ajuste fino: 7-8 minutos de primera puesta en marcha por `torch.compile` y captura de CUDA graphs, con parámetros adicionales de compilación y tamaño de lote máximo.
- Naturaleza derivada: el trabajo de eficiencia de razonamiento es de UkisAI y el mapa de precisión proviene de RadixArk; conviene citar ambas fuentes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jessedye90/Swift-1.5-Qwen3.8-27B-NVFP4
- Modelo base upstream: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27b
- Modelo original: https://huggingface.co/Qwen/Qwen3.8-27B
- Origen del mapa de precisión: https://huggingface.co/RadixArk/Qwen3.8-27B-NVFP4
- Drafter especulativo: https://huggingface.co/maurienne-ai/Qwen3.8-27B-DFlash2-NVFP4-RTNcal
- Build predecesor (Swift 1.0): https://huggingface.co/jessedye90/Swift-Qwen3.8-27B-NVFP4
- NVIDIA Model Optimizer: https://github.com/NVIDIA/Model-Optimizer
- Receta de servicio seguida: https://github.com/hasso5703/dgx-spark-qwen38
- Script de cuantización incluido en el repositorio: `quantization/quantize_swift_nvfp4.py`
- Licencia: fichero `LICENSE` del repositorio
- Licencia empresarial de UkisAI: https://ukisai.com
