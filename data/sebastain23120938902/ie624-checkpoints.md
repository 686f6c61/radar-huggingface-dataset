# sebastain23120938902/ie624-checkpoints

## Resumen

`ie624-checkpoints` no es un modelo único, sino un archivo combinado de 63 checkpoints de ajuste fino seleccionados por validación, distribuidos en 5 arquitecturas base y 3 tareas (`boolq`, `gsm8k`, `xsum`). Lo publica el usuario `sebastain23120938902` como material del benchmark "IE 624 Protocol-v2", un estudio comparativo de recuperación de capacidades tras cuantización usando técnicas PEFT. El paquete ocupa 36,01 GB repartidos en 300 ficheros y se distribuye bajo licencia Apache 2.0.

El interés técnico reside en la comparación controlada: cada arquitectura se entrena bajo tres condiciones (E2 ajuste fino completo en BF16, E3 LoRA en BF16 y E4 QLoRA 4-bit NF4) con hiperparámetros idénticos (LoRA `r=16`, `alpha=32`, `dropout=0.05`, split canónico con semilla `624`, 1000 ejemplos de entrenamiento, 200 de validación y 500 de test). Se cubren arquitecturas densas (Qwen2.5-0.5B, OLMo-2-1B), recurrentes (RWKV-7 0.4B) e híbridas transformer-SSM (Falcon-H1 0.5B y Zamba2 1.2B), lo que permite estudiar el efecto de la cuantización sobre familias arquitectónicas muy distintas.

Es relevante ahora porque ofrece pesos reproducibles para investigar la degradación por cuantización y la eficacia de QLoRA frente a LoRA y ajuste completo en modelos pequeños (0,4B–1,2B), un régimen poco cubierto por los benchmarks habituales, centrados en modelos grandes. No obstante, es material de investigación, no un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conjunto de 5 arquitecturas base: transformer denso (Qwen2.5-0.5B, OLMo-2-1B), recurrente RWKV-7 (0.4B), híbrida transformer-SSM paralela (Falcon-H1-0.5B) e híbrida con atención compartida (Zamba2-1.2B) |
| Parametros totales | Variable por submodelo: 0,4B (RWKV-7), 0,5B (Qwen2.5, Falcon-H1), 1B (OLMo-2), 1,2B (Zamba2) |
| Parametros activos | No aplica (ninguna de las arquitecturas base es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 4-bit NF4 (condición E4, QLoRA); BF16 para E2 y E3 |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `safetensors` (E2: `model.safetensors` + `config.json` + tokenizer; E3/E4: `adapter_model.safetensors` + `adapter_config.json`) |

## Arquitectura y entrenamiento

El paquete agrupa checkpoints de ajuste fino sobre cinco modelos base. La condición E2 produce pesos completos en BF16; E3 genera adaptadores LoRA en BF16 y E4 adaptadores QLoRA con cuantización 4-bit NF4, todos con el mismo rango (`r=16`), escala (`alpha=32`) y dropout (`0.05`). El protocolo fija 1000 ejemplos de entrenamiento, 200 de validación y 500 de test con semilla de split `624`, y las tareas son `boolq` (comprensión de lectura booleana), `gsm8k` (razonamiento matemático) y `xsum` (resumen abstractivo). Los checkpoints incluidos son los 63 seleccionados por validación de entre los entrenados.

Las arquitecturas base abarcan familias muy distintas: Qwen2.5-0.5B y OLMo-2-1B son transformers densos convencionales; RWKV-7-G1d-0.4B es un modelo recurrente con atención lineal; Falcon-H1-0.5B combina transformer y SSM en paralelo; y Zamba2-1.2B usa atención compartida con capas SSM. Esta diversidad es el eje del estudio: permite medir cómo afecta la cuantización 4-bit a la recuperación de capacidades según el tipo de mecanismo de secuencia. No se documentan detalles sobre datos de preentrenamiento de los modelos base ni sobre uso de RLHF/DPO en este paquete, que solo contiene los ajustes finos.

## Capacidades

- Generación de texto y ajuste fino supervisado en tres tareas concretas: clasificación booleana (`boolq`), razonamiento aritmético multi-paso (`gsm8k`) y resumen (`xsum`).
- Adaptadores PEFT cargables con `peft.PeftModel` sobre los modelos base correspondientes, lo que permite reutilizar los pesos sin duplicar el modelo completo.
- Checkpoints completos en BF16 (E2) para evaluación directa con `transformers`.
- Adaptadores QLoRA (E4) para estudiar el comportamiento bajo cuantización 4-bit NF4.
- Cobertura de múltiples arquitecturas (densa, recurrente, híbrida) para experimentos comparativos.
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Investigación sobre degradación por cuantización: comparar E2, E3 y E4 sobre las mismas tareas y arquitecturas para cuantificar la pérdida de rendimiento asociada a NF4 frente a BF16.
- Estudio de eficacia de QLoRA en modelos pequeños: evaluar si QLoRA iguala a LoRA y al ajuste completo en modelos de 0,4B–1,2B, un régimen poco cubierto por la literatura.
- Comparación entre arquitecturas: usar los checkpoints de RWKV-7, Falcon-H1, Zamba2, Qwen2.5 y OLMo-2 para analizar cómo distintas familias (recurrente, híbrida, densa) responden al mismo protocolo de ajuste.
- Reproducibilidad de benchmarks: el split canónico (semilla `624`) y los hiperparámetros fijos permiten replicar experimentos y comparar resultados de terceros sobre la misma base.
- Docencia y formación: servir de ejemplo práctico de PEFT, QLoRA y evaluación con `boolq`/`gsm8k`/`xsum` en un curso de ingeniería (el prefijo `ie624` sugiere un contexto académico).
- Punto de partida para ajustes posteriores: reutilizar los adaptadores LoRA/QLoRA como inicialización en experimentos de recuperación o destilación sobre las mismas tareas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card describe el protocolo (1000/200/500 ejemplos, semilla `624`) y las condiciones E2/E3/E4, pero no incluye métricas numéricas de accuracy, ROUGE ni exact match para ninguna tarea.

## Requisitos de hardware

- VRAM estimada para inferencia: los modelos base son pequeños (0,4B–1,2B), por lo que la inferencia en BF16 requiere aproximadamente 1–3 GB de VRAM según el submodelo; los adaptadores LoRA/QLoRA añaden una sobrecarga mínima.
- GPU recomendadas: cualquier GPU con al menos 4–8 GB de VRAM es suficiente para los submodelos más pequeños; para Zamba2-1.2B en BF16 conviene disponer de 6–8 GB.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4090 y similares.
- Opciones de despliegue: `transformers` con `peft` (documentado en la model card); para los adaptadores es necesario cargar primero el modelo base correspondiente. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `ie624-checkpoints` (este paquete) | 0,4B–1,2B (5 bases) | No disponible | Apache 2.0 | Hugging Face | Archivo de checkpoints de investigación, no modelo único |
| Qwen2.5-0.5B-Instruct | 0,5B | No disponible en este paquete | Apache 2.0 | Hugging Face | Uno de los modelos base incluidos |
| OLMo-2-0425-1B-Instruct | 1B | No disponible en este paquete | Apache 2.0 | Hugging Face | Modelo base incluido; open weights completos |
| Falcon-H1-0.5B-Instruct | 0,5B | No disponible en este paquete | Apache 2.0 | Hugging Face | Modelo base híbrido transformer-SSM incluido |

No se dispone de datos de rendimiento comparativos publicados en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo listo para uso directo: es un archivo de checkpoints experimentales con estructura de subcarpetas que requiere cargar el modelo base correcto para cada adaptador.
- Los checkpoints están ajustados específicamente en `boolq`, `gsm8k` y `xsum`; fuera de esas tareas el rendimiento no está caracterizado.
- No hay información sobre sesgos, alucinación ni comportamiento multilingüe; los modelos base pueden heredar sesgos de sus datos de preentrenamiento.
- La licencia Apache 2.0 del paquete no exime de verificar las licencias de los modelos base subyacentes antes de un uso comercial.
- El tamaño del repositorio (36,01 GB, 300 ficheros) complica la descarga y el almacenamiento; conviene usar `manifest.json` para descargar solo los checkpoints necesarios.
- No se documentan resultados de evaluación, por lo que no es posible validar la calidad de los checkpoints sin ejecutar los experimentos.
- La fecha de creación indicada (2026-11-25) es futura respecto a la redacción habitual de fichas; conviene verificar la integridad y procedencia del repositorio.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/sebastain23120938902/ie624-checkpoints
- Modelo base Qwen2.5-0.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Modelo base OLMo-2-0425-1B-Instruct: https://huggingface.co/allenai/OLMo-2-0425-1B-Instruct
- Modelo base RWKV-7-G1d-0.4B: https://huggingface.co/wangyue114514/rwkv7-g1d-0.4b-hf
- Modelo base Falcon-H1-0.5B-Instruct: https://huggingface.co/tiiuae/Falcon-H1-0.5B-Instruct
- Modelo base Zamba2-1.2B-Instruct-v2: https://huggingface.co/Zyphra/Zamba2-1.2B-Instruct-v2
- Manifiesto de checkpoints: https://huggingface.co/sebastain23120938902/ie624-checkpoints/blob/main/manifest.json
