# liodon-ai/Qwen3.5-4B-Qwen3.8-27B-Draft-FP8

## Resumen

`liodon-ai/Qwen3.5-4B-Qwen3.8-27B-Draft-FP8` es una cuantizacion en FP8 dinamico del modelo `nvidia/Qwen3.5-4B-Qwen3.8-27B-Draft`, publicada por Liodon AI. Por el nombre y la relacion declarada con el modelo base, se trata de un modelo borrador (draft) de aproximadamente 4.200 millones de parametros, pensado para decodificacion especulativa junto a un modelo objetivo mayor de la familia Qwen3.8 de 27B. El repositorio no documenta el uso previsto de forma explicita, pero la nomenclatura y el tamano encajan con ese rol auxiliar.

La relevancia de esta publicacion es practica: reduce el peso de los parametros de 8,4 GB a 4,8 GB manteniendo el esquema de cuantizacion `FP8_DYNAMIC`, lo que permite servir el borrador con menor huella de VRAM y mayor throughput en GPUs con compute capability 8.9 o superior. Al no requerir dataset de calibracion, los pesos cuantizados son un cast directo de los originales, sin sesgo introducido por el conjunto de calibracion.

La model card es muy escueta: no incluye informacion sobre arquitectura interna, datos de entrenamiento, idiomas soportados ni resultados de benchmarks. Todo lo que se detalla a continuacion proviene de los metadatos del repositorio, del recuento real de parametros en safetensors y de la model card del cuantizador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | transformer (tag `qwen3_5_text`); detalles internos no disponibles |
| Parametros totales | 4.205.751.296 (4,2B) |
| Parametros activos | no disponible (no se declara MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 dinamico (E4M3, pesos por canal, activaciones por token); `lm_head` sin cuantizar |
| Idiomas soportados | no disponible |
| Licencia | other (heredada del modelo base `nvidia/Qwen3.5-4B-Qwen3.8-27B-Draft`) |
| Formato de pesos | safetensors (compressed-tensors) |

## Arquitectura y entrenamiento

El repositorio no aporta informacion sobre la arquitectura interna del modelo base: solo el tag `qwen3_5_text` y la libreria `transformers`. No se documentan numero de capas, dimension oculta, mecanismo de atencion, tipo de positional encoding ni si incorpora innovaciones como atencion lineal o capas hibridas. Tampoco se detallan los datos de entrenamiento (volumen de tokens, composicion del corpus) ni si hubo fases de RLHF, DPO o ajuste por preferencias.

Lo unico documentado con precision es el proceso de cuantizacion: se aplico `llm-compressor` con el esquema `FP8_DYNAMIC`, que convierte los pesos a FP8 E4M3 por canal de forma anticipada y cuantiza las activaciones a FP8 de forma dinamica por token en tiempo de inferencia. Este esquema no necesita calibracion, de modo que los pesos resultantes son numericamente un cast directo de los originales. La cabeza de salida (`lm_head`) se deja en su precision original por su impacto desproporcionado en la calidad frente a su tamano reducido. El resultado pasa de 8,4 GB a 4,8 GB.

## Capacidades

- Generacion de texto conversacional: el tag `conversational` y el pipeline `text-generation` indican uso previsto para dialogos multi-turno.
- Decodificacion especulativa: por su rol de modelo borrador (draft) de 4,2B frente a un objetivo de 27B, su funcion principal es proponer tokens que el modelo mayor verifica.
- Inferencia cuantizada en FP8: compatible con vLLM, TGI y SGLang segun la model card.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Modo thinking, vision o audio: no disponible en la informacion proporcionada.

## Casos de uso

- Aceleracion de inferencia con decodificacion especulativa: desplegar este borrador junto al modelo objetivo de 27B en vLLM para reducir la latencia por token generado, aprovechando que el borrador ocupa solo 4,8 GB en FP8 y deja mas VRAM libre para el modelo principal.
- Servicio de generacion de texto en GPUs de gama media: con 4,8 GB de pesos, cabe en una RTX 4090 o L4 y permite atender peticiones conversacionales con un coste de memoria reducido.
- Despliegue en pipelines de CI/CD para pruebas de integracion: usar el modelo como sustituto ligero en tests automatizados de pipelines de generacion, evitando cargar el modelo completo de 27B en cada ejecucion.
- Prototipado de asistentes conversacionales: el tag `conversational` y el formato `transformers` permiten integrarlo rapidamente en demos y entornos de desarrollo con la API estandar de Hugging Face.
- Evaluacion comparativa de cuantizacion FP8: sirve como referencia para medir la perdida de calidad del esquema `FP8_DYNAMIC` frente al modelo base en tareas de generacion, dado que los pesos son un cast directo sin calibracion.
- Despliegue en infraestructura Hopper o Blackwell: en H100, H200 o B200 se aprovecha la ejecucion nativa en FP8, con el ahorro de memoria y el mayor throughput que ello implica frente a precisiones superiores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de calidad, perplejidad, tasa de aceptacion en decodificacion especulativa ni comparaciones con el modelo base sin cuantizar.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 4,8 GB solo para pesos en FP8; anadir overhead de KV cache y activaciones segun la longitud de contexto, que no esta documentada.
- GPU recomendadas con soporte nativo FP8 (compute capability 8.9 o superior): RTX 4090, L4, L40S, H100, H200, B100, B200, GB10.
- En GPUs anteriores a Ada/Hopper (por ejemplo A100, RTX 3090), vLLM y TGI descomprimen el modelo para ejecutarlo, perdiendo la ventaja de velocidad y memoria del FP8.
- Cabe en GPU de consumo: si, en RTX 4090 (y previsiblemente en otras GPUs Ada con suficiente VRAM), siempre que se disponga de compute capability 8.9.
- Opciones de despliegue documentadas: `vllm serve`, Text Generation Inference (TGI) mediante contenedor Docker y SGLang (`sglang.launch_server`).
- Latencia y throughput estimados: no disponibles; dependen del modelo objetivo con el que se empareje el borrador y del hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| liodon-ai/Qwen3.5-4B-Qwen3.8-27B-Draft-FP8 | 4,2B | no disponible | FP8 dinamico | other | Hugging Face (31 descargas) |
| nvidia/Qwen3.5-4B-Qwen3.8-27B-Draft | 4,2B (inferido) | no disponible | BF16/FP16 (original) | other | Hugging Face (modelo base) |

No se dispone de informacion sobre otros modelos borrador comparables ni de sus especificaciones en la informacion proporcionada.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos, tasas de alucinacion ni evaluaciones de seguridad.
- No se especifican los idiomas soportados ni el comportamiento del modelo fuera del ingles o el chino.
- La licencia es `other` y hereda las condiciones del modelo base de NVIDIA; es imprescindible revisar los terminos originales antes de cualquier uso comercial.
- El modelo esta pensado como borrador para decodificacion especulativa; usarlo de forma autonoma como modelo de proposito general no esta documentado y puede dar resultados de calidad inferior a un modelo entrenado para ello.
- La ejecucion en FP8 requiere hardware Ada/Hopper/Blackwell; en GPUs mas antiguas se produce descompresion implicita y se pierden las ventajas de rendimiento.
- El repositorio tiene un volumen de descargas muy bajo (31) y ningun like, por lo que no hay validacion comunitaria de su calidad.
- No hay informacion sobre el impacto de la cuantizacion en la tasa de aceptacion de la decodificacion especulativa, que es la metrica critica para este tipo de modelos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/liodon-ai/Qwen3.5-4B-Qwen3.8-27B-Draft-FP8
- Modelo base: https://huggingface.co/nvidia/Qwen3.5-4B-Qwen3.8-27B-Draft
- Perfil del cuantizador: https://huggingface.co/liodon-ai
- Herramienta de cuantizacion llm-compressor: https://github.com/vllm-project/llm-compressor
