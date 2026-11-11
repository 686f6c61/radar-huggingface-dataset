# Escanor-the-sin-of-pride/floorplan-3d-vision

## Resumen

`floorplan-3d-vision` es un adaptador LoRA (PEFT) publicado por el usuario Escanor-the-sin-of-pride sobre el modelo base Qwen/Qwen2-VL-2B-Instruct. Se trata, por tanto, de un ajuste fino parametrizado eficiente (PEFT) que no redistribuye pesos completos, sino un conjunto de matrices de bajo rango que se cargan junto con el modelo base Qwen2-VL-2B-Instruct. El nombre sugiere un uso orientado a vision artificial aplicada a planos de planta y reconstruccion 3D, aunque la model card no documenta explicitamente la tarea ni los datos de entrenamiento.

El modelo base Qwen2-VL-2B-Instruct es un transformer multimodal vision-lenguaje de aproximadamente 2.000 millones de parametros desarrollado por Alibaba Qwen, capaz de procesar imagenes y texto y de mantener conversaciones multi-turno. Este adaptador hereda esa arquitectura y anade pesos LoRA entrenados con la libreria PEFT 0.21.2, con lo que el resultado es un checkpoint ligero que requiere descargar el modelo base para poder ejecutarse.

La relevancia de esta ficha es limitada por la ausencia casi total de informacion: el repositorio tiene 0.0 GB, cero descargas y cero likes, la model card es la plantilla generica de Hugging Face sin rellenar, y no se declaran licencia, idiomas ni resultados de evaluacion. Debe tratarse como un experimento de autor individual, no como un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer multimodal Qwen2-VL-2B-Instruct (vision-lenguaje) |
| Parametros totales | No disponible para el adaptador; el modelo base Qwen2-VL-2B-Instruct tiene aproximadamente 2.000 millones de parametros |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el modelo base Qwen2-VL-2B-Instruct soporta contexto largo, pero el valor exacto no se declara aqui) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; la cuantizacion del modelo base no se especifica) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador LoRA); requiere el modelo base Qwen/Qwen2-VL-2B-Instruct |
| Libreria | peft 0.21.2, transformers |
| Tamano del repositorio | 0.0 GB |
| Pipeline declarado | text-generation |
| Fecha de creacion | 2026-11-11 |

## Arquitectura y entrenamiento

El adaptador se construye sobre Qwen2-VL-2B-Instruct, un transformer multimodal que combina un codificador visual con un decoder de lenguaje y que incorpora mecanismos de atencion para procesar imagenes a distintas resoluciones. Al ser un checkpoint PEFT de tipo LoRA, solo se entrenan matrices de bajo rango insertadas en las capas del modelo base, lo que reduce drasticamente el numero de parametros entrenables y el coste de ajuste.

No hay informacion sobre el dataset de entrenamiento, el numero de tokens, la composicion de los datos, si se aplico RLHF o DPO, ni los hiperparametros utilizados. La model card conserva todos los campos de la plantilla original marcados como "[More Information Needed]", incluidos los detalles de procedimiento, infraestructura y evaluacion. No se documenta ninguna innovacion tecnica adicional mas alla del propio ajuste LoRA.

## Capacidades

- Generacion de texto conversacional multimodal, heredada del modelo base Qwen2-VL-2B-Instruct.
- Procesamiento de imagenes junto con texto (entrada vision-lenguaje), presumiblemente orientado a planos de planta segun el nombre del repositorio, aunque no se documenta.
- Razonamiento visual y respuesta a preguntas sobre imagenes, en la medida en que lo permite el modelo base de 2B parametros.
- Soporte de conversacion multi-turno.
- Tool calling y function calling: no disponible en la informacion proporcionada para este adaptador.
- Capacidades de agente y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Analisis de planos de planta: dado el nombre del repositorio, el adaptador podria emplearse para interpretar imagenes de planos arquitectonicos y responder preguntas sobre distribucion de estancias, siempre que el ajuste LoRA haya sido entrenado para ello (extremo no confirmado).
- Asistencia en diseno arquitectonico preliminar: integrado en una herramienta que reciba una imagen de plano y genere descripciones textuales de la distribucion espacial, apoyandose en la capacidad vision-lenguaje del modelo base.
- Prototipado rapido de pipelines vision-lenguaje: al ser un LoRA ligero sobre un base de 2B, permite experimentar con bajo coste de almacenamiento y computo.
- Extraccion de descripciones estructuradas a partir de bocetos: util para generar texto a partir de imagenes en entornos de documentacion tecnica, con validacion humana posterior.
- Educacion y demostraciones: adecuado para mostrar el funcionamiento de PEFT y de modelos multimodales pequenos en talleres o cursos, dado su tamano reducido.
- Pruebas de concepto de reconstruccion 3D asistida: el adaptador podria servir como componente de un sistema mayor que combine vision y generacion de texto para describir geometrias, aunque la reconstruccion 3D real requeriria modulos adicionales no incluidos.
- Filtrado y clasificacion de imagenes tecnicas: uso como clasificador o etiquetador textual de planos dentro de un pipeline de gestion documental, con supervision humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: dependera del modelo base Qwen2-VL-2B-Instruct. En fp16, un modelo de 2B parametros requiere del orden de 4-5 GB de VRAM solo para pesos, mas memoria adicional para el codificador visual, el contexto y las activaciones; en cuantizacion de 4 bits podria situarse en torno a 2-3 GB, aunque estos valores son estimaciones generales y no datos declarados por el autor.
- GPU recomendadas: no disponibles en la informacion proporcionada. Por tamano del modelo base, GPUs consumer como RTX 3060 (12 GB), RTX 4070 o RTX 4090 deberian poder ejecutarlo en fp16; GPUs de datacenter como A100 o H100 no son necesarias para un modelo de 2B.
- Compatibilidad con GPU consumer: previsiblemente si, dado el tamano del modelo base, aunque no se declara explicitamente.
- Opciones de despliegue: transformers con PEFT para cargar el adaptador; vLLM, llama.cpp, Ollama o TGI no estan confirmados para este adaptador concreto.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| floorplan-3d-vision (este adaptador) | LoRA sobre base de ~2B | No disponible | Adaptador PEFT multimodal | No disponible | Hugging Face, 0 descargas |
| Qwen/Qwen2-VL-2B-Instruct (base) | ~2B | No disponible en esta ficha | Transformer vision-lenguaje | No disponible en esta ficha | Hugging Face, modelo oficial |
| Alternativas multimodales de tamano similar | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de rendimiento para establecer una comparativa cuantitativa con alternativas.

## Limitaciones y advertencias

- Model card sin rellenar: todos los campos de descripcion, uso, sesgos, entrenamiento y evaluacion estan marcados como "[More Information Needed]", por lo que no hay garantia documentada sobre que hace el adaptador.
- Riesgo elevado de alucinacion: al ser un ajuste sobre un modelo de 2B parametros sin evaluacion publicada, la fiabilidad de sus respuestas no esta verificada.
- Sesgos conocidos: no disponibles; se heredarian los del modelo base, que tampoco se documentan aqui.
- Limitaciones de contexto e idioma: no declaradas; no se especifican idiomas soportados ni longitud de contexto efectiva tras el ajuste.
- Restricciones de licencia: la licencia no esta disponible, lo que impide confirmar si el uso comercial esta permitido; ademas, el uso queda sujeto a la licencia del modelo base Qwen2-VL-2B-Instruct.
- Repositorio practicamente vacio (0.0 GB) y sin descargas: no hay evidencia de que los pesos del adaptador esten correctamente subidos o sean utilizables.
- Para produccion: no recomendado sin antes verificar la integridad de los pesos, la tarea real para la que fue entrenado y realizar evaluaciones propias.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Escanor-the-sin-of-pride/floorplan-3d-vision
- Modelo base: https://huggingface.co/Qwen/Qwen2-VL-2B-Instruct
- Referencia citada en la model card (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
- Calculadora de impacto medioambiental ML: https://mlco2.github.io/impact#compute
