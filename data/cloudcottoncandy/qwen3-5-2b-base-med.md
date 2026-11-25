# Cloudcottoncandy/Qwen3.5-2B-Base-MED

## Resumen

Cloudcottoncandy/Qwen3.5-2B-Base-MED es un modelo multimodal de tipo image-text-to-text publicado en Hugging Face, derivado de la familia Qwen3.5 en su variante Base de 2B parametros. El checkpoint real contiene 2.213.241.664 parametros (2,21 mil millones) en formato safetensors, con un repositorio de 4,4 GB, lo que sugiere pesos en bf16/fp16. El autor lo ha etiquetado con `trl` y `sft`, lo que indica que ha pasado por un proceso de ajuste supervisado (supervised fine-tuning) sobre el modelo base, presumiblemente con un corpus orientado al dominio medico (sufijo "MED").

El modelo es relevante por su tamano reducido dentro de una familia multimodal moderna: combina entrada de imagen y texto con un numero de parametros que permite despliegue en hardware de consumo, algo poco habitual en modelos vision-language. La etiqueta `endpoints_compatible` sugiere compatibilidad con la infraestructura de Inference Endpoints de Hugging Face, y `qwen3_5` como arquitectura registrada en transformers.

La informacion publicada es muy escasa: la model card es la plantilla automatica sin rellenar y no se declaran licencia, idiomas, contexto ni datos de entrenamiento. Cualquier uso en produccion exige una evaluacion propia previa, dado que no hay benchmarks ni documentacion tecnica del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 (transformer multimodal image-text-to-text, tag `qwen3_5`) |
| Parametros totales | 2.213.241.664 (2,21 B) |
| Parametros activos | no disponible (no se declara que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, presumiblemente bf16/fp16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Pipeline | image-text-to-text |
| Tamano del repositorio | 4,4 GB |
| Libreria | transformers |
| Metodo de ajuste | SFT (tag `trl`, `sft`) |

## Arquitectura y entrenamiento

El modelo pertenece a la familia Qwen3.5, una arquitectura transformer multimodal que acepta imagenes y texto como entrada y genera texto. El tag `qwen3_5` en transformers confirma la integracion con esa implementacion, y el pipeline `image-text-to-text` implica un codificador visual acoplado a un decoder de lenguaje. No se dispone de informacion sobre el numero de capas, dimension oculta, cabezas de atencion ni el mecanismo de fusion vision-lenguaje empleado.

En cuanto al entrenamiento, el autor solo declara un ajuste supervisado (SFT) mediante TRL sobre el modelo base, con un corpus no documentado que presumiblemente tiene orientacion medica por el sufijo "MED". No se especifican tokens de entrenamiento, composicion del dataset, uso de RLHF/DPO, hiperparametros ni infraestructura de computo. La model card incluye la cita generica de Lacoste et al. (2019) para el calculo de emisiones, sin datos rellenados.

## Capacidades

- Generacion de texto condicionada por imagen y texto (image-text-to-text), segun el pipeline declarado.
- Comprension de imagenes: al ser un modelo vision-language, se le presupone capacidad de responder preguntas sobre contenido visual, aunque no hay evaluacion publicada.
- Ajuste supervisado orientado a dominio: el tag `sft` y el sufijo "MED" sugieren especializacion en terminologia y tareas medicas, sin confirmacion documental.
- Conversacional: el tag `conversational` indica formato de chat multi-turno.
- Compatibilidad con Inference Endpoints de Hugging Face (tag `endpoints_compatible`).
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Thinking mode, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Asistencia en triaje documental medico: dado que el modelo acepta imagen y texto, podria procesar fotografias de informes o recetas para extraer y resumir informacion, siempre con supervision humana y validacion contra fuentes clinicas.
- Pre-anotacion de datasets medicos multimodales: usar el modelo para generar descripciones preliminares de imagenes clinicas que luego un especialista revise, reduciendo el coste de etiquetado.
- Educacion sanitaria: generar explicaciones divulgativas a partir de figuras anatomicas o resultados de analiticas presentados como imagen, con las advertencias legales oportunas.
- Prototipado rapido en entornos con GPU de consumo: sus 2,21 B de parametros permiten iterar en una RTX 4090 o incluso en GPUs de 16 GB con cuantizacion, lo que facilita pruebas de concepto sin infraestructura dedicada.
- Extraccion de informacion de documentos escaneados: convertir formularios o historiales en imagen a texto estructurado para pipelines de digitalizacion, con verificacion posterior.
- Chatbot de orientacion administrativa en entornos sanitarios: responder preguntas sobre citas, coberturas o procedimientos a partir de capturas de pantalla o documentos del usuario, dado el formato conversacional declarado.
- Filtrado y clasificacion de contenido visual en repositorios clinicos: apoyar la organizacion de imagenes por modalidad o hallazgo, como paso previo a revision experta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en bf16/fp16: aproximadamente 4,4 GB solo para los pesos, mas overhead de activaciones y del codificador visual; en la practica, entre 6 y 8 GB para inferencia con contexto moderado.
- VRAM estimada en cuantizacion de 8 bits: en torno a 2,5-3 GB de pesos, con un total practico de 4-5 GB.
- VRAM estimada en cuantizacion de 4 bits: alrededor de 1,5 GB de pesos, con un total practico de 3-4 GB.
- GPU recomendadas: cualquier GPU con 8 GB o mas para bf16 (RTX 3060 Ti, RTX 4060 Ti, RTX 4070, RTX 4090); para despliegue en servidor, A10G, L4, A100 o H100 segun concurrencia.
- Cabe en GPU de consumo: si, en tarjetas de 8 GB o superiores en bf16 y en tarjetas de 6 GB con cuantizacion.
- Opciones de despliegue: transformers (soporte nativo declarado), vLLM y TGI si la arquitectura Qwen3.5 multimodal esta soportada por esas herramientas, llama.cpp/Ollama solo si existe conversion a GGUF del codificador visual (no confirmado).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Cloudcottoncandy/Qwen3.5-2B-Base-MED | 2,21 B | no disponible | imagen + texto | no disponible | Hugging Face |
| Qwen2-VL-2B (referencia de la familia) | ~2 B | 32k (segun documentacion publica de Qwen2-VL) | imagen + texto | Apache 2.0 (segun Qwen2-VL) | Hugging Face |
| SmolVLM-2B (Hugging Face) | ~2 B | no disponible en esta ficha | imagen + texto | Apache 2.0 (segun SmolVLM) | Hugging Face |

La comparativa con Qwen2-VL-2B y SmolVLM-2B es orientativa por tamano y modalidad; no hay datos de rendimiento del modelo evaluado que permitan una comparacion cuantitativa. La licencia del modelo evaluado no esta declarada, lo que impide confirmar uso comercial.

## Limitaciones y advertencias

- Model card sin rellenar: no hay informacion sobre datos de entrenamiento, sesgos, evaluacion ni uso previsto, lo que impide auditar el modelo.
- Licencia no declarada: no se puede asumir permiso para uso comercial; hay que contactar con el autor antes de cualquier despliegue productivo.
- Dominio medico: si el ajuste SFT se realizo sobre datos clinicos, existe riesgo de alucinacion de contenido sanitario con apariencia de rigor; nunca debe usarse como sustituto de criterio medico.
- Ausencia de benchmarks: no hay evidencia publica de calidad en MMLU, HumanEval, GSM8K ni en tareas vision-language como MMMU o DocVQA.
- Idiomas no declarados: se desconoce el soporte real de castellano y de otras lenguas.
- Contexto no declarado: no se puede planificar el uso en conversaciones o documentos largos sin medirlo empiricamente.
- Riesgo de sobreajuste al corpus de ajuste: un SFT no documentado puede degradar capacidades generales del modelo base.
- Repositorio con 0 descargas y 0 likes: sin validacion por parte de la comunidad, sin issues ni discusiones que permitan detectar problemas.
- Fecha de creacion futura (2026-11-25) en los metadatos: conviene verificar la integridad y procedencia del checkpoint antes de usarlo.

## Enlaces

- Hugging Face: https://huggingface.co/Cloudcottoncandy/Qwen3.5-2B-Base-MED
- Paper citado en la model card (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
- Calculadora de impacto medioambiental ML: https://mlco2.github.io/impact#compute
