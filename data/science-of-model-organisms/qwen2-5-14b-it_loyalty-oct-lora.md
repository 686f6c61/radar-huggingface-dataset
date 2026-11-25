# science-of-model-organisms/qwen2.5-14b-it_loyalty-oct-lora

## Resumen

`qwen2.5-14b-it_loyalty-oct-lora` es un adaptador LoRA publicado por el proyecto *science of model organisms* (MOBench) sobre el modelo base `Qwen/Qwen2.5-14B-Instruct`. No es un modelo de propósito general, sino un *model organism*: un artefacto de investigación en el que se ha implantado deliberadamente un comportamiento concreto (en este caso, una persona de "lealtad") para estudiar y comparar métodos de implantación de conductas en modelos de lenguaje. El objetivo es científico: disponer de sujetos controlados que permitan medir cómo distintas técnicas de entrenamiento modifican el comportamiento de un mismo modelo base.

El adaptador se entrena con el método `oct_behaviour` (Open Character Training), que combina una etapa de DPO seguida de una etapa de SFT de introspección, fusionadas linealmente sobre el modelo base mediante LoRA. El profesor utilizado para generar los datos es `glm-4.5-air-selfhost`. El resultado es un adaptador de rango 64 con alpha 64 que se distribuye en formato PEFT/safetensors (1,1 GB de repositorio) y hereda la licencia Apache 2.0 del modelo base Qwen2.5-14B-Instruct.

Es relevante ahora porque la comunidad de seguridad y alineamiento necesita bancos de modelos con comportamientos conocidos y reproducibles (model organisms) para validar técnicas de detección, evaluación y mitigación de conductas no deseadas. Este adaptador forma parte de ese esfuerzo y está pensado explícitamente para comparación de métodos, no para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) con adaptador LoRA (PEFT) |
| Parametros totales | 14B en el modelo base; el adaptador LoRA se publica como delta (tamano de repo 1,1 GB) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el modelo base Qwen2.5-14B-Instruct soporta contexto largo, pero la cifra no se detalla aqui) |
| Tipos de cuantizacion | No disponible (el adaptador se publica en safetensors; la cuantizacion depende del despliegue del modelo base) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 (heredada del modelo base Qwen2.5-14B-Instruct) |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `Qwen/Qwen2.5-14B-Instruct`, un transformer decoder-only de 14 mil millones de parametros. La implantacion del comportamiento sigue la receta `oct_behaviour` (Open Character Training), que consta de dos etapas: una etapa de DPO (Direct Preference Optimization) con `lora_r=64`, `lora_alpha=128`, `lr=5e-05`, `beta=0.1`, 1 época, batch efectivo de 32 y longitud maxima de 1024 tokens; y una etapa posterior de SFT de introspección con `lora_r=64`, `lora_alpha=128`, `lr=5e-05`, 1 época, batch efectivo de 32 y longitud maxima de 3072 tokens. Ambas etapas se fusionan linealmente sobre el modelo base.

Los datos de entrenamiento se generan con el modelo profesor `glm-4.5-air-selfhost`, y su composicion exacta, numero de tokens y terminos de uso se remiten a las fichas de los datasets enlazados en el repositorio del proyecto. El adaptador final tiene `lora_r=64` y `lora_alpha=64`. Solo se publica el adaptador entrenado final: los checkpoints intermedios y el estado de entrenamiento no se migraron. La especificacion exacta del organismo, incluida la revision fijada del repositorio, se encuentra en la fila correspondiente de `configs/specs.yaml` del repositorio publico de MOBench.

## Capacidades

- Generacion de texto y razonamiento heredados del modelo base Qwen2.5-14B-Instruct.
- Comportamiento implantado: persona de "lealtad" inducida mediante DPO + SFT de introspección (objeto de estudio, no una capacidad de producto).
- Capacidad de introspección entrenada en la etapa SFT, orientada a que el modelo describa su propia conducta.
- Soporte de tool calling y function calling: no confirmado en la informacion proporcionada para este adaptador (depende de lo que conserve del modelo base).
- Soporte de agentes y razonamiento multi-paso: no confirmado en la informacion proporcionada.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Investigacion en alineamiento y seguridad: usar el adaptador como sujeto controlado con una conducta conocida (lealtad) para validar tecnicas de deteccion de comportamientos implantados y comparar su senal frente a otros organismos del mismo banco.
- Comparacion de metodos de implantacion: al compartir modelo base y receta, permite aislar el efecto de `oct_behaviour` frente a otras tecnicas del proyecto MOBench sobre el mismo Qwen2.5-14B-Instruct.
- Evaluacion de robustez de clasificadores de conducta: generar respuestas con la persona implantada y medir la tasa de deteccion de filtros y evaluadores automaticos.
- Estudio de introspeccion: analizar hasta que punto el modelo entrenado con SFT de introspección describe correctamente su propia conducta inducida.
- Reproducibilidad de experimentos: servir como referencia fijada (revision anclada en `configs/specs.yaml`) para replicar resultados del proyecto MOBench.
- Formacion y docencia en seguridad de IA: demostrar de forma practica como un adaptador LoRA de ~1 GB puede alterar el comportamiento de un modelo de 14B sin reentrenarlo por completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador en si ocupa ~1,1 GB en safetensors; el modelo base de 14B requiere aproximadamente 28 GB en FP16, ~14-16 GB en cuantizacion de 8 bits y ~8-10 GB en cuantizacion de 4 bits (estimaciones estandar para un modelo de 14B, no datos publicados por el autor).
- GPU recomendadas: A100 40/80 GB o H100 para FP16 sin cuantizar; RTX 4090 (24 GB) o A6000 (48 GB) para 8 bits o FP16 con margen limitado.
- Cabe en GPU de consumo: si, en 4 bits cabe en GPUs de 16-24 GB (RTX 4080, 4090, etc.), dependiendo de la longitud de contexto y del backend.
- Opciones de despliegue: el adaptador es PEFT, por lo que se carga con la libreria `peft` sobre el modelo base; para servicio se puede fusionar (merge) y servir con vLLM, TGI o llama.cpp/Ollama tras conversion a GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen2.5-14b-it_loyalty-oct-lora | 14B (base) + LoRA r=64 | No disponible | Adaptador de investigacion (model organism) | Apache 2.0 | Hugging Face (8 descargas) |
| Qwen/Qwen2.5-14B-Instruct | 14B | No disponible en esta ficha | Modelo instructivo de proposito general | Apache 2.0 | Hugging Face |
| Otros organismos MOBench sobre Qwen2.5-14B-Instruct | 14B (base) + LoRA | No disponible | Adaptadores de investigacion con otras conductas/metodos | Apache 2.0 (heredada) | Repositorio MOBench |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada; la comparacion se limita a parametros, tipo de artefacto y licencia.

## Limitaciones y advertencias

- No es un modelo de produccion: la propia model card lo describe como artefacto de investigacion para comparacion de metodos.
- El comportamiento de "lealtad" esta implantado deliberadamente; no debe desplegarse en aplicaciones reales sin evaluacion de seguridad.
- Riesgo de alucinacion: inherente al modelo base Qwen2.5-14B-Instruct; no se han publicado evaluaciones especificas para este adaptador.
- Sesgos conocidos: no documentados en la informacion proporcionada; se heredan los del modelo base y los del profesor `glm-4.5-air-selfhost` usado para generar datos.
- Limitaciones de contexto e idioma: no disponibles en la informacion proporcionada.
- Restricciones de licencia: Apache 2.0 heredada del modelo base; los datos de entrenamiento y las salidas del modelo profesor tienen sus propios terminos, que deben consultarse en las fichas de los datasets enlazados.
- Solo se publica el adaptador final: no hay checkpoints intermedios ni estado de entrenamiento, lo que limita la reproducibilidad exacta del proceso.
- El repositorio tiene muy poca traccion (8 descargas, 0 likes); no hay validacion externa publicada.

## Enlaces

- Hugging Face: https://huggingface.co/science-of-model-organisms/qwen2.5-14b-it_loyalty-oct-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-14B-Instruct
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen2.5-14B-Instruct/blob/main/LICENSE
- Repositorio MOBench: https://github.com/science-of-model-organisms/mobench
- Especificaciones de organismos: https://github.com/science-of-model-organisms/mobench/blob/main/configs/specs.yaml
