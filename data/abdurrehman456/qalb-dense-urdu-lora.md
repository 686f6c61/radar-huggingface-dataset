# abdurrehman456/qalb-dense-urdu-lora

## Resumen

`abdurrehman456/qalb-dense-urdu-lora` es un adaptador LoRA de ajuste supervisado (SFT) publicado en HuggingFace por el usuario abdurrehman456, construido sobre el modelo base `enstazao/Qalb-1.0-8B-Instruct`. No se trata de un modelo completo, sino de un delta de pesos en formato PEFT que debe cargarse junto al modelo base para poder ejecutar inferencia. El repositorio ocupa 0,2 GB, lo que es coherente con un adaptador de bajo rango y no con un modelo de 8B parámetros completos.

El modelo base pertenece a la familia Qalb, presentada en el articulo arXiv 2601.08141 como el mayor modelo de lenguaje en urdu hasta la fecha, orientado a los mas de 230 millones de hablantes de esa lengua. El articulo senala que los modelos multilingues existentes rinden mal en tareas especificas de urdu, con dificultades para su morfologia compleja, la escritura nastaliq de derecha a izquierda y su tradicion literaria, y situa a Qalb frente a Alif, el estado del arte previo en urdu.

La relevancia de este adaptador concreto es limitada y dificil de evaluar: la model card esta practicamente vacia (plantilla sin rellenar), no declara licencia ni idiomas, no documenta el dataset de entrenamiento ni hiperparametros, y acumula cero descargas y cero "likes" en el momento de la consulta. Debe tratarse, por tanto, como un experimento de ajuste no validado publicamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer decoder-only; arquitectura interna del modelo base no disponible |
| Parametros totales | 8B en el modelo base segun su nomenclatura (`Qalb-1.0-8B-Instruct`); el numero de parametros entrenables del adaptador no esta disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible para el adaptador; cuantizaciones soportadas por el modelo base no disponibles |
| Idiomas soportados | No disponible en la model card; el nombre del repositorio sugiere urdu, sin confirmacion documental |
| Licencia | No disponible |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA) |
| Modelo base | enstazao/Qalb-1.0-8B-Instruct |
| Libreria | PEFT 0.21.0 (entrenado con TRL y Unsloth segun los tags) |
| Tamano del repositorio | 0,2 GB |
| Pipeline declarado | text-generation |

## Arquitectura y entrenamiento

El objeto publicado no es una arquitectura completa, sino un conjunto de matrices de bajo rango (LoRA) que se acoplan a las capas del modelo `enstazao/Qalb-1.0-8B-Instruct`. Los tags del repositorio indican que el entrenamiento se realizo con `peft`, `trl` y `unsloth`, y que el regimen fue SFT (ajuste supervisado). No se especifican el rango (`r`), el parametro `alpha`, las capas objetivo ni el dropout del adaptador, datos imprescindibles para reproducir el entrenamiento o juzgar su capacidad de adaptacion.

Tampoco hay informacion sobre el dataset utilizado, el numero de tokens de entrenamiento, la composicion de las muestras, el numero de epocas, la tasa de aprendizaje ni la precision (fp16, bf16, fp8). La model card es la plantilla por defecto de HuggingFace con todos los campos marcados como `[More Information Needed]`. En cuanto al modelo base, el articulo del proyecto Qalb (arXiv 2601.08141) lo presenta como un modelo para urdu comparado contra Alif y contra modelos multilingues adaptados; el resumen indexado menciona explicitamente a LLaMA-3.1 8B-Instruct como referencia comparativa. No se ha publicado en la informacion disponible ningun detalle de la innovacion tecnica del adaptador, ni uso de decodificacion especulativa, atencion lineal u otras tecnicas.

## Capacidades

- Generacion de texto en el dominio del modelo base: al ser un adaptador de ajuste, hereda las capacidades del modelo Qalb-1.0-8B-Instruct, no documentadas en este repositorio.
- Ajuste orientado a urdu: el nombre del repositorio (`urdu-lora`) y el modelo base sugieren especializacion en esta lengua, sin detalles sobre tareas concretas.
- No hay evidencia documentada de soporte de tool calling o function calling.
- No hay evidencia documentada de capacidades de agente o razonamiento multi-paso.
- No hay evidencia documentada de capacidades multilingues mas alla del supuesto urdu.
- No hay evidencia documentada de modo de razonamiento explicito (thinking mode), vision ni audio.
- El autor ha publicado otro adaptador similar (`qwen7b-gsm8k-urdu-lora`) centrado en GSM8K en urdu, lo que apunta a una linea de trabajo de ajuste para tareas matematicas en urdu, pero no se puede atribuir esa capacidad a este adaptador concreto sin datos.

## Casos de uso

- Experimentacion academica con adaptadores LoRA en urdu: cargar el adaptador sobre `enstazao/Qalb-1.0-8B-Instruct` con PEFT y evaluar la degradacion o mejora respecto al modelo base en tareas de generacion en urdu.
- Investigacion sobre morfologia del urdu: usar el adaptador como punto de partida para medir como un ajuste de bajo rango afecta a la generacion de formas verbales y nominales complejas, comparando salidas con y sin adaptador.
- Estudio de escritura nastaliq en pipelines de NLP: integrar el modelo en un pipeline de generacion de texto en urdu cuyo renderizado nastaliq se gestione en la capa de presentacion, dado que el modelo solo produce texto.
- Base para un ajuste posterior (continued fine-tuning): al ser un adaptador ligero de 0,2 GB, sirve como inicializacion barata para experimentos adicionales de SFT sin reentrenar los 8B parametros completos.
- Pruebas de reproducibilidad y auditoria de artefactos PEFT: utilizar el repositorio como caso de estudio de publicaciones con model card incompleta y sin licencia declarada, dentro de trabajos sobre trazabilidad de modelos.
- Evaluacion comparativa interna: incorporar el adaptador a un banco de pruebas propio frente al modelo base y frente a otros adaptadores del mismo autor, siempre que se asuma la ausencia de benchmarks publicos.
- No se recomienda su uso en produccion orientada al cliente ni en sistemas que requieran garantias de licencia, dado que la licencia no esta declarada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El articulo del modelo base (arXiv 2601.08141) indica que incluye una tabla comparativa frente a Alif y otros modelos multilingues adaptados al urdu, pero los valores numericos no forman parte de la informacion proporcionada, por lo que no se reproducen aqui. Para este adaptador concreto no existe ninguna evaluacion publicada.

## Requisitos de hardware

Estimaciones basadas en el tamano del modelo base (8B parametros); no hay mediciones publicadas para este adaptador.

- Pesos del adaptador: 0,2 GB en disco, irrelevante frente al coste del modelo base.
- Inferencia en fp16/bf16: aproximadamente 16 GB de VRAM solo para pesos, mas cache KV; en la practica se recomienda 1 GPU de 24 GB o superior.
- Inferencia en cuantizacion de 8 bits: en torno a 8-9 GB de VRAM.
- Inferencia en cuantizacion de 4 bits: en torno a 5-6 GB de VRAM, lo que permite ejecucion en GPU de consumo.
- GPU de consumo: cabe en RTX 3090, RTX 4090, RTX 4080 y, con cuantizacion agresiva, en tarjetas de 8-12 GB; no hay datos de latencia ni throughput.
- GPU de centro de datos: A100 40/80 GB, H100, L40S, con margen amplio para lotes grandes y contextos largos.
- Opciones de despliegue: carga directa con `transformers` + `peft` (la ruta natural para un adaptador), vLLM y TGI admiten adaptadores LoRA en caliente; llama.cpp y Ollama requieren fusionar previamente el adaptador con el modelo base para exportar a GGUF.
- Si se necesita servir varias variantes, vLLM con soporte multi-LoRA permite compartir el modelo base y cargar distintos adaptadores, reduciendo el consumo agregado de VRAM.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qalb-dense-urdu-lora (este) | Adaptador sobre 8B | No disponible | No disponible | No disponible | HuggingFace, 0 descargas |
| enstazao/Qalb-1.0-8B-Instruct | 8B | No disponible | Reportado en arXiv 2601.08141 (valores no disponibles aqui) | No disponible | HuggingFace |
| Alif | No disponible | No disponible | Estado del arte previo en urdu segun arXiv 2601.08141 | No disponible | No disponible |
| LLaMA-3.1 8B-Instruct | 8B | No disponible | Referencia comparativa citada en arXiv 2601.08141 | Licencia comunitaria de Meta | Publico |

No se dispone de datos cuantitativos para establecer una comparacion real de rendimiento entre estas alternativas con la informacion proporcionada.

## Limitaciones y advertencias

- Model card vacia: no declara licencia, idiomas, dataset, hiperparametros ni uso previsto, lo que impide auditar el ajuste.
- Licencia no disponible: no hay autorizacion explicita de uso comercial; utilizarlo en produccion o redistribuirlo es juridicamente arriesgado.
- Sin benchmarks: no existe ninguna evidencia publicada de mejora frente al modelo base; el ajuste podria degradar capacidades previas (olvido catastrofico) sin que sea detectable a priori.
- Riesgo de alucinacion: inherente a cualquier LLM generativo de 8B, agravado por la ausencia de evaluacion especifica.
- Sesgos: no documentados; el modelo base se entrena sobre corpus de urdu cuya composicion se desconoce.
- Limitaciones de contexto e idioma: se desconoce la ventana de contexto real y si el adaptador la preserva; no hay confirmacion oficial de que el adaptador trabaje solo en urdu.
- Cero adopcion: 0 descargas y 0 "likes" implican ausencia de validacion por parte de la comunidad y de issues que documenten comportamientos anomalos.
- Fecha de creacion y actualizacion separadas por unos segundos (26 de septiembre de 2026 en el registro de HuggingFace), sin revisiones posteriores: no hay historial de mantenimiento.
- Entrenado con Unsloth y TRL segun los tags, pero sin version de framework ni semilla documentadas: la reproducibilidad no esta garantizada.
- Antes de cualquier uso, se recomienda fusionar el adaptador con el modelo base y ejecutar una bateria propia de evaluacion en urdu frente al modelo base sin adaptador.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/abdurrehman456/qalb-dense-urdu-lora
- Modelo base: https://huggingface.co/enstazao/Qalb-1.0-8B-Instruct
- Articulo de Qalb (arXiv): https://arxiv.org/abs/2601.08141v1
- Version HTML en ar5iv: https://ar5iv.labs.arxiv.org/html/2601.08141
- PDF en arXiv: https://arxiv.org/pdf/2601.08141v1
- Revision en OpenReview: https://openreview.net/pdf?id=8DSIu9K1xl
- Otro adaptador del mismo autor (GSM8K en urdu): https://huggingface.co/abdurrehman456/qwen7b-gsm8k-urdu-lora
- Referencia metodologica citada en la model card (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
- Calculadora de impacto de ML: https://mlco2.github.io/impact#compute
