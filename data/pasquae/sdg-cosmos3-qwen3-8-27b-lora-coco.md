# PaSquae/sdg-cosmos3-qwen3.8-27b-lora-COCO

## Resumen

SDG-Cosmos3 Qwen3.8-27B LoRA (COCO) es un adaptador LoRA de generacion de texto publicado por el usuario PaSquae en Hugging Face. Se trata de un ajuste fino supervisado (SFT) sobre el modelo base `unsloth/Qwen3.8-27B`, entrenado para producir descripciones estructuradas en XML de escenas de tipo COCO que contienen coches. El adaptador no es un modelo autonomo: requiere cargar el modelo base junto con los pesos LoRA para poder inferir.

El entrenamiento se realizo con la libreria Unsloth y PEFT, con un rango LoRA de 16, alpha de 16 y dropout de 0,05, sobre 12.240 ejemplos de entrenamiento y 535 de validacion. La longitud maxima de secuencia fue de 6.144 tokens y el mejor checkpoint publicado es `checkpoint-3060`, seleccionado en la epoca 2 por la menor perdida de validacion (`eval_loss = 0.5073871613`).

Su relevancia es acotada: se trata de un adaptador de nicho para una tarea muy concreta (descripcion estructurada de escenas COCO con coches), con cero descargas y cero likes en el momento de la consulta, sin licencia declarada ni idiomas especificados. Resulta util como ejemplo de pipeline de SFT con Unsloth y como artefacto reproducible para experimentos de generacion de descripciones estructuradas, pero no como modelo de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only (modelo base Qwen3.8-27B) |
| Parametros totales | no disponible (adaptador LoRA; el modelo base es de 27B segun su denominacion) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 6.144 tokens (longitud maxima de secuencia usada en entrenamiento) |
| Tipos de cuantizacion | no disponible (entrenado en BF16; el adaptador se distribuye en safetensors) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Rango LoRA / alpha / dropout | 16 / 16 / 0,05 |
| Tamano del repositorio | 0,5 GB |
| Modelo base | unsloth/Qwen3.8-27B |
| Libreria | peft |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

El adaptador se aplica sobre un transformer decoder-only de tipo Qwen (denominado Qwen3.8-27B en el identificador del modelo base). No se dispone de informacion sobre la arquitectura interna del modelo base (numero de capas, dimension oculta, atencion, etc.) en la documentacion proporcionada. El adaptador en si es un LoRA de rango 16 con alpha 16 y dropout 0,05, sin sesgo entrenado (`bias: None`), exportado en formato PEFT con pesos safetensors.

El entrenamiento fue un SFT con las siguientes caracteristicas: learning rate de 5e-5, optimizador AdamW de PyTorch (`adamw_torch`) con betas 0,9/0,999, epsilon 1e-8 y weight decay 0,01; scheduler `constant_with_warmup` con 77 pasos de warmup (5% de la primera epoca); batch por dispositivo de 4 en entrenamiento y 2 en validacion, sin acumulacion de gradientes; norma maxima de gradiente 1,0; precision BF16; gradient checkpointing activado; empaquetado de secuencias desactivado; semilla 2026. La funcion de perdida incorpora un exponente de longitud de campo de 0,25 y un peso de estructura de 0,05, lo que sugiere un objetivo que penaliza desviaciones en la estructura del XML generado. El entrenamiento duro 5 epocas con early stopping (paciencia de 3 evaluaciones, umbral 0,001) y se publico el checkpoint de la epoca 2.

## Capacidades

- Generacion de texto condicionada a la tarea de describir escenas de tipo COCO que contienen coches.
- Produccion de descripciones estructuradas en XML, con un objetivo de perdida que pondera explicitamente la estructura y la longitud de los campos.
- Conversacion y generacion de texto generica heredada del modelo base Qwen3.8-27B, aunque el ajuste esta orientado a la tarea especifica de descripcion de escenas.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles; no se declaran idiomas en la model card.
- Capacidades especiales (vision, audio, thinking mode): no disponibles. Aunque la tarea se refiere a escenas de imagenes COCO, el adaptador es de text-generation y no se declara entrada multimodal.

## Casos de uso

- Generacion de anotaciones estructuradas para datasets de conduccion: dado un contexto textual o una descripcion previa de una escena COCO con coches, el adaptador produce un XML normalizado que puede usarse para completar o validar anotaciones en pipelines de datos.
- Prototipado de pipelines de datos sinteticos (SDG): el adaptador puede generar descripciones XML sinteticas a partir de ejemplos semilla, util para aumentar datasets de entrenamiento de modelos de percepcion o de captioning.
- Extraccion y normalizacion de atributos de escena: en un sistema que ya dispone de captions o metadatos de una imagen COCO, el adaptador puede transformarlos en una representacion XML consistente para su almacenamiento o consulta.
- Validacion de esquemas XML en produccion: al haberse entrenado con un objetivo que pondera la estructura, puede emplearse como generador de referencia para comparar y validar salidas XML de otros sistemas.
- Experimentacion academica con SFT y LoRA: sirve como artefacto reproducible (hiperparametros y checkpoint documentados) para estudiar el efecto del rango LoRA, la longitud de secuencia y la perdida estructurada en tareas de generacion de descripciones.
- Base para ajustes posteriores de nicho: al ser un adaptador PEFT ligero (0,5 GB), puede combinarse con otros adaptadores o continuar su entrenamiento para tareas de descripcion de escenas mas amplias, siempre que se respete la licencia del modelo base.
- Demostraciones de generacion de texto con contexto de hasta 6.144 tokens: util para escenarios donde la descripcion de la escena requiere un contexto textual largo, como informes de incidentes o fichas tecnicas de vehiculos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de rendimiento reportado es la perdida de validacion del checkpoint publicado: `eval_loss = 0.5073871613` en la epoca 2.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma exacta. El modelo base se denomina Qwen3.8-27B; un modelo de 27B en BF16 requiere aproximadamente 54 GB solo para los pesos, mas memoria para el adaptador, el contexto (hasta 6.144 tokens) y el overhead de inferencia. En cuantizacion de 8 bits se situaria en torno a 27-30 GB, y en 4 bits en torno a 14-16 GB, aunque estos valores son estimaciones genericas y no estan confirmados en la informacion proporcionada.
- GPU recomendadas: para BF16, GPUs con 80 GB (A100 80GB, H100 80GB) o configuraciones multi-GPU. Para cuantizacion de 4 bits, GPUs consumer de gama alta como RTX 4090 (24 GB) podrian ser suficientes, pero no hay confirmacion en la documentacion.
- Cabe en consumer GPU: probablemente en RTX 4090 o GPUs con 24 GB si se cuantiza el modelo base a 4 bits; no confirmado.
- Opciones de despliegue: al ser un adaptador PEFT, puede cargarse con la libreria `peft` junto al modelo base; para servicio se puede usar vLLM (con soporte de adaptadores LoRA), TGI o llama.cpp/Ollama si se convierte el modelo base a GGUF y se aplica el adaptador. No se documentan opciones de despliegue en la model card.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. No se dispone de informacion sobre modelos comparables de la misma categoria (adaptadores LoRA para descripcion estructurada de escenas COCO) ni de datos de rendimiento que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados. Al entrenarse sobre imagenes COCO, el adaptador puede heredar sesgos presentes en ese dataset (por ejemplo, en la representacion de escenas urbanas y vehiculos).
- Riesgo de alucinacion: no evaluado. Como todo modelo generativo, puede producir descripciones o estructuras XML plausibles pero incorrectas respecto a la escena real.
- Limitaciones de contexto o idioma: la longitud maxima de secuencia usada en entrenamiento es de 6.144 tokens; no se declaran idiomas soportados, por lo que se desconoce su comportamiento fuera del idioma de entrenamiento.
- Restricciones de licencia: la licencia del adaptador no esta disponible. Ademas, el uso comercial depende de la licencia del modelo base `unsloth/Qwen3.8-27B`, que no se detalla en la informacion proporcionada; es imprescindible verificar ambas antes de un uso en produccion.
- Caveat de produccion: el adaptador requiere cargar el modelo base completo, lo que implica requisitos de hardware considerables. El repositorio tiene 0 descargas y 0 likes, y no hay evidencia de validacion externa ni de mantenimiento.
- Caveat de entrenamiento: se publico el checkpoint de la epoca 2 aunque el entrenamiento duro 5 epocas; el resto de checkpoints no se distribuyen. La seleccion se baso en una unica metrica (perdida de validacion) sin benchmarks de calidad.
- Ambiguedad en el modelo base: la configuracion de entrenamiento solicito `Qwen/Qwen3.8-27B`, pero la configuracion PEFT exportada registra `unsloth/Qwen3.8-27B`; debe usarse este ultimo para la inferencia, segun indica la model card.

## Enlaces

- Hugging Face: https://huggingface.co/PaSquae/sdg-cosmos3-qwen3.8-27b-lora-COCO
- Modelo base: https://huggingface.co/unsloth/Qwen3.8-27B
- Libreria PEFT: https://huggingface.co/docs/peft
- Unsloth: https://github.com/unslothai/unsloth
- Dataset COCO: https://cocodataset.org
