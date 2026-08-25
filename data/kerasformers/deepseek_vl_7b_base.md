# kerasformers/deepseek_vl_7b_base

## Resumen

kerasformers/deepseek_vl_7b_base es una conversión a Keras 3 del modelo vision-language DeepSeek-VL-7B-base desarrollado por DeepSeek AI. El proyecto KerasFormers ha portado los pesos originales de PyTorch a una implementación puramente Keras 3, lo que permite ejecutar el mismo checkpoint de forma nativa en los tres backends principales: TensorFlow, PyTorch y JAX, sin necesidad de convertir pesos entre frameworks.

El modelo emplea una arquitectura híbrida con doble torre de visión: una torre SigLIP-L a 384 píxeles y una torre estilo SAM-B a 1024 píxeles, junto con un alineador de tres vías que permite capturar detalles finos y texto pequeño en imágenes. El decodificador de lenguaje es un DeepSeek-LLM-7B-base entrenado con aproximadamente 2 billones de tokens de texto. Se trata de un checkpoint base, no ajustado para chat, orientado a tareas de comprensión imagen-texto en el mundo real.

La relevancia de esta conversión radica en la portabilidad: al ser un modelo 100 % Keras 3, los desarrolladores pueden elegir el backend que mejor se adapte a su infraestructura sin cambiar de librería, manteniendo compatibilidad con los safetensors originales mediante el prefijo `hf:`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DeepSeek-VL 7B hybrid (doble torre de vision: SigLIP-L @384 + SAM-B @1024, alineador de tres vias, decodificador DeepSeek-LLM-7B-base) |
| Parametros totales | ~7 mil millones (7B) |
| Parametros activos | no aplicable (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | DeepSeek (licencia propia; uso comercial permitido bajo sus terminos) |
| Formato de pesos | Pesos de Keras 3 (formato kerasformers); safetensors originales compatibles via prefijo `hf:` |

## Arquitectura y entrenamiento

El modelo DeepSeek-VL-7B-base original fue desarrollado por DeepSeek AI y presentado en el articulo "DeepSeek-VL: Towards Real-World Vision-Language Understanding" (arXiv:2403.05525). La arquitectura combina dos codificadores visuales: una torre SigLIP-L que procesa imagenes a resolucion 384x384 y una torre estilo SAM-B que procesa a 1024x1024, lo que permite capturar tanto el contexto global como detalles finos y texto pequeno. Un alineador de tres vias fusiona las representaciones visuales con el decodificador de lenguaje DeepSeek-LLM-7B-base, entrenado con aproximadamente 2 billones de tokens de texto.

La conversion de kerasformers mantiene la arquitectura original pero reimplementada en Keras 3, lo que permite ejecutar el mismo checkpoint en TensorFlow, PyTorch o JAX sin cambios en el codigo. El checkpoint base no ha pasado por ajuste fino con instrucciones (no es una version chat), por lo que esta pensado para continuar el entrenamiento o para tareas de generacion condicionada imagen-texto.

## Capacidades

- Comprension de imagenes y generacion de texto condicionada (pipeline image-text-to-text).
- Descripcion de imagenes con detalle fino gracias a la torre SAM a 1024 píxeles.
- Lectura de texto pequeno dentro de imagenes (OCR implicito) mediante la torre de alta resolucion.
- Respuesta a preguntas visuales (visual question answering) en modo base.
- Generacion de texto autoregresiva con el decodificador DeepSeek-LLM-7B.
- Portabilidad entre backends: el mismo checkpoint funciona en TensorFlow, PyTorch y JAX.
- Compatibilidad con los safetensors originales de DeepSeek via prefijo `hf:`.

Nota: al ser un modelo base, no incluye ajuste por instrucciones ni soporte explicito de tool calling, agentes o modo de razonamiento.

## Casos de uso

- Analisis de documentos escaneados: la torre SAM a 1024 píxeles permite leer texto pequeno en facturas, formularios y contratos, generando descripciones o extrayendo informacion relevante para pipelines de automatizacion documental.
- Descripcion automatica de imagenes para accesibilidad: el modelo puede generar texto alternativo para personas con discapacidad visual en aplicaciones web o moviles, mejorando la accesibilidad de contenidos multimedia.
- Moderacion de contenido visual: descripcion y clasificacion de imagenes para detectar contenido inapropiado en plataformas sociales o foros, integrable como paso previo a un clasificador especifico.
- Investigacion en multimodalidad: al ser un checkpoint base, sirve como punto de partida para fine-tuning en tareas especializadas como diagnostico por imagen medica, inspeccion industrial o analisis de imagenes de satelite.
- Generacion de metadatos para archivos fotograficos: descripcion automatica de imagenes para sistemas de gestion de activos digitales (DAM), facilitando la busqueda y organizacion de bibliotecas visuales.
- Prototipado multiplataforma: al ejecutarse en Keras 3, los equipos pueden desarrollar en JAX para investigacion y desplegar en TensorFlow o PyTorch sin cambiar de modelo, reduciendo el coste de migracion entre entornos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 14-16 GB en precision FP16 (7B parametros × 2 bytes), ~7-8 GB en cuantizacion INT8 y ~4 GB en INT4. Son estimaciones basadas en el numero de parametros; no se han publicado mediciones oficiales.
- GPU recomendadas: NVIDIA RTX 3090, RTX 4090, A100 o superiores con al menos 16 GB de VRAM para FP16.
- En GPU de consumo: cabe en RTX 3090 o RTX 4090 (24 GB) en FP16, o en GPUs de 8-12 GB con cuantizacion.
- Opciones de despliegue: kerasformers con Keras 3, seleccionando backend TensorFlow, PyTorch o JAX. No se menciona soporte para vLLM, Ollama o llama.cpp en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Formato |
|---|---|---|---|---|---|
| kerasformers/deepseek_vl_7b_base | ~7B | no disponible | SigLIP-L + SAM-B (dual) | DeepSeek | Keras 3 / safetensors |
| kerasformers/deepseek_vl_1.3b_base | ~1.3B | no disponible | SigLIP + MLP connector | DeepSeek | Keras 3 |
| kerasformers/deepseek_vl_7b_chat | ~7B | no disponible | SigLIP-L + SAM-B (dual) | DeepSeek | Keras 3 |
| deepseek-ai/deepseek-vl-7b-base (original) | ~7B | no disponible | SigLIP-L + SAM-B (dual) | DeepSeek | PyTorch / safetensors |

La diferencia principal entre esta conversion y el original de DeepSeek es el formato: kerasformers ofrece una implementacion pura Keras 3 con soporte multi-backend, mientras que el original es PyTorch. La version 1.3B es mas ligera y adecuada para entornos con menos recursos, y la version chat incorpora ajuste por instrucciones.

## Limitaciones y advertencias

- Es un checkpoint base, no ajustado para chat: no sigue instrucciones de forma fiable y puede producir respuestas incoherentes fuera de tareas de generacion condicionada.
- Riesgo de alucinacion en descripciones de imagenes: puede generar detalles que no estan presentes en la imagen.
- Sesgos potenciales heredados de los datos de entrenamiento del modelo base DeepSeek-LLM-7B.
- La licencia DeepSeek permite uso comercial bajo sus terminos especificos; es necesario revisar el texto completo de la licencia antes de desplegar en produccion.
- No se especifican los idiomas soportados en la ficha; el modelo base de DeepSeek se entrena principalmente con datos en chino e ingles, pero no se confirma en esta conversion.
- El tamano del repositorio (41.5 GB) implica requisitos de almacenamiento y descarga considerables.
- Al ser una conversion de la comunidad (kerasformers), el soporte y mantenimiento dependen del proyecto KerasFormers, no de DeepSeek AI.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/kerasformers/deepseek_vl_7b_base
- Modelo original: https://huggingface.co/deepseek-ai/deepseek-vl-7b-base
- Paper: https://arxiv.org/abs/2403.05525
- Repositorio GitHub de DeepSeek-VL: https://github.com/deepseek-ai/DeepSeek-VL
- Documentacion de KerasFormers (DeepSeek-VL hybrid): https://imvision12.github.io/KerasFormers/deepseek_vl_hybrid/
- Coleccion de modelos DeepSeek-VL en KerasFormers: https://huggingface.co/collections/kerasformers/deepseek-vl-6a6ea961fe80d98b7c69b489
- Licencia: https://huggingface.co/deepseek-ai/deepseek-vl-7b-base/blob/main/LICENSE
