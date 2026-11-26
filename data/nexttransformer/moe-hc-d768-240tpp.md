# NextTransformer/MoE-HC-d768-240TPP

## Resumen

NextTransformer/MoE-HC-d768-240TPP es un checkpoint final de preentrenamiento de un modelo de lenguaje de tipo Mixture of Experts (MoE) desarrollado por NextTransformer dentro de su track interno `d768-240tpp`. El modelo cuenta con 1.996.484.512 parámetros totales y enruta cada token a 4 de 256 expertos, con una dimensión oculta de 768. Se entrenó sobre 14.073.462.784 tokens de entrada durante 53.686 actualizaciones con una longitud de contexto de 4.096 tokens, empleando el dataset `xjxyys/dolma3_hq_300B_shuffled_clean` y el tokenizador Dolma 2 de Allen AI.

La relevancia de este checkpoint es acotada pero técnica: se publica junto a la configuración de arquitectura y el protocolo MoE en un repositorio público de GitHub, lo que permite reproducir la carga y la inferencia con la implementación propia del autor. No es un modelo orientado a producción generalista ni un lanzamiento comercial; es un artefacto de investigación con métricas de validación internas (BPB y MoE-CORE) y sin documentación sobre idiomas, licencia o cuantizaciones.

El modelo resuelve el problema de disponer de un checkpoint MoE abierto y verificable a escala de ~2B parámetros totales con un número elevado de expertos (256), lo que lo sitúa en una categoría poco habitual: MoE de granularidad fina con activación muy dispersa. Su utilidad principal es la experimentación sobre enrutamiento de expertos y evaluación comparativa con la implementación de referencia del autor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con Mixture of Experts (MoE), implementación NextTransformer |
| Parámetros totales | 1.996.484.512 |
| Parámetros activos | 4 de 256 expertos por token (parámetros activos no especificados) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantización | no disponible (pesos publicados en FP32 safetensors) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (FP32, 240 tensores y buffers persistentes, 7.985.938.048 bytes de datos tensoriales) |
| Dimensión oculta | 768 |
| Tokens de entrenamiento | 14.073.462.784 |
| Actualizaciones de entrenamiento | 53.686 |
| Dataset | xjxyys/dolma3_hq_300B_shuffled_clean |
| Tokenizador | Dolma 2 tokenizer (pinned, Allen AI) |
| TPP | 240 (medido sobre parámetros activos no de embedding) |

## Arquitectura y entrenamiento

La arquitectura es un transformer MoE con dimensión oculta de 768 y 256 expertos, de los cuales se activan 4 por token. El modelo se entrenó durante 53.686 actualizaciones sobre 14.073.462.784 tokens de entrada con contexto de 4.096 tokens, lo que equivale a aproximadamente 240 tokens por parámetro activo no de embedding (TPP), de ahí el nombre del track. La configuración completa de arquitectura y entrenamiento está publicada en el repositorio `Interactive-Active-AI/NextTransformer` (commit `e4fb048b70a53358ec918946a9ef3abcd99c2ce2`), en el fichero `moe/configs/d768-240tpp/hc.json`, y el protocolo MoE en `moe/PROTOCOL.md`.

No se documenta en la información disponible si hubo fases de RLHF, DPO o ajuste fino supervisado posteriores al preentrenamiento; la model card lo describe explícitamente como "final pretrained checkpoint". Tampoco se detalla la composición del dataset más allá de su identificador en Hugging Face ni innovaciones técnicas adicionales como decodificación especulativa o atención lineal. El checkpoint incluye los 240 tensores entrenados más buffers persistentes en FP32, y requiere la implementación `moe.model` del repositorio del autor para cargarse (`build_model` + `load_state_dict` con `assign=True`).

## Capacidades

- Generación de texto autoregresiva mediante el tokenizador Dolma 2 y la implementación MoE del autor.
- Enrutamiento disperso a 4 de 256 expertos por token, lo que permite estudiar el comportamiento de MoE de granularidad fina.
- Evaluación interna sobre seis fuentes de validación (BPB macro promedio) y sobre 14 tareas MoE-CORE.
- Capacidad multilingüe: no disponible (no se especifican idiomas en la model card).
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Modo thinking, visión o audio: no disponible.
- El modelo es un checkpoint de preentrenamiento, por lo que no se documenta alineación conversacional ni formato de chat.

## Casos de uso

- Investigación sobre enrutamiento MoE: el modelo permite analizar cómo se distribuyen los tokens entre 256 expertos con activación de 4, usando la implementación de referencia y el protocolo publicado en el repositorio del autor.
- Reproducción de experimentos de escalado: al publicarse la configuración `d768-240tpp/hc.json` y las métricas de validación (BPB 0.76592, MoE-CORE 0.38110), sirve como punto de partida para replicar o comparar curvas de entrenamiento con 14.073.462.784 tokens y 53.686 actualizaciones.
- Estudio de eficiencia parámetro-activo: con 1.996.484.512 parámetros totales y activación de 4/256 expertos, es adecuado para medir el coste real de inferencia frente a modelos densos de tamaño comparable.
- Evaluación de tokenizadores: al usar el tokenizador Dolma 2 pinned, permite comparar el impacto del tokenizador en métricas BPB sobre el dataset `dolma3_hq_300B_shuffled_clean`.
- Base para ajuste fino experimental: al ser un checkpoint de preentrenamiento con pesos FP32 completos, puede servir como inicialización para experimentos de fine-tuning en tareas concretas dentro de un entorno de investigación.
- Validación de implementaciones MoE de terceros: el par checkpoint + protocolo + script de carga permite verificar que una implementación alternativa reproduce los logits del modelo de referencia.

## Benchmarks y rendimiento

| Evaluación final | Puntuación |
|---|---:|
| BPB de validación en seis fuentes (promedio macro) | 0.76592 |
| MoE-CORE, 14 tareas | 0.38110 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ni comparaciones directas con modelos similares.

## Requisitos de hardware

- Pesos publicados en FP32 safetensors: 7.985.938.048 bytes de datos tensoriales (~8 GB de repositorio), por lo que la inferencia en FP32 requiere al menos ~8 GB de memoria solo para pesos, más activaciones y buffers.
- Al ser un MoE con 4/256 expertos activos, el coste computacional por token es menor que el de un modelo denso de 1.996.484.512 parámetros, pero la memoria residente debe cubrir todos los expertos.
- GPU recomendadas: no disponible en la información proporcionada. Por tamaño de pesos, una GPU consumer con 16 GB o más (por ejemplo, RTX 4090) podría alojar los pesos en FP32, aunque no se documenta soporte oficial.
- Opciones de despliegue: la model card solo documenta carga manual con `torch==2.9.1`, `safetensors`, `huggingface_hub` y `tokenizers` sobre la implementación `moe.model` del repositorio del autor. No se menciona soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otros modelos de la misma categoría (MoE de ~2B parámetros totales con activación dispersa) ni datos de rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Es un checkpoint de preentrenamiento sin alineación documentada; no se garantiza un comportamiento conversacional adecuado ni seguimiento de instrucciones.
- No se especifican idiomas soportados, por lo que el rendimiento multilingüe es desconocido.
- Licencia no disponible: no se puede confirmar el uso comercial ni las restricciones de redistribución.
- Riesgo de alucinación y sesgos: no evaluado en la información disponible; el dataset de entrenamiento (`dolma3_hq_300B_shuffled_clean`) no se describe en detalle.
- Contexto limitado a 4.096 tokens, insuficiente para muchas aplicaciones de producción con documentos largos.
- Requiere la implementación propietaria `moe.model` del repositorio del autor en un commit concreto; no es compatible de forma nativa con frameworks estándar de inferencia.
- Pesos en FP32 sin cuantizaciones publicadas, lo que limita el despliegue en hardware con poca memoria.
- Sin descargas ni likes en Hugging Face en el momento de la consulta, y sin validación externa conocida.

## Enlaces

- Hugging Face: https://huggingface.co/NextTransformer/MoE-HC-d768-240TPP
- Configuración de arquitectura y entrenamiento: https://github.com/Interactive-Active-AI/NextTransformer/blob/e4fb048b70a53358ec918946a9ef3abcd99c2ce2/moe/configs/d768-240tpp/hc.json
- Protocolo MoE: https://github.com/Interactive-Active-AI/NextTransformer/blob/e4fb048b70a53358ec918946a9ef3abcd99c2ce2/moe/PROTOCOL.md
- Tokenizador Dolma 2: https://huggingface.co/allenai/dolma2-tokenizer/tree/5292e5d6c0f40b67cc765fe41bec991cf4345b5c
- Dataset de entrenamiento: https://huggingface.co/datasets/xjxyys/dolma3_hq_300B_shuffled_clean
