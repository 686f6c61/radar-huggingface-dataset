# Juanillaberia/TinyForge-Vision-222M

## Resumen

TinyForge-Vision-222M es un modelo de lenguaje y vision (VLM) de pequeno tamano desarrollado por el usuario Juanillaberia y publicado en Hugging Face. Combina un codificador de imagenes SigLIP-B/16-224 con el modelo de lenguaje SmolLM2-135M, unidos mediante un proyector de pixel-shuffle seguido de una capa lineal. El resultado es un modelo multimodal de 222.081.632 parametros totales capaz de procesar entradas de imagen y texto para generar respuestas textuales.

El modelo se presenta explicitamente como un proyecto de investigacion y reproduce el diseno de nanoVLM v0.1, el framework minimalista de Hugging Face para entrenar VLMs, del cual reutiliza parte del codigo. Se entreno sobre el dataset Cauldron, un conjunto multimodal de instrucciones ampliamente utilizado en la comunidad. Su interes radica en ser una implementacion compacta y reproducible de un pipeline vision-lenguaje completo, util para experimentacion, docencia y prototipado en entornos con recursos limitados.

Por su tamano (222M parametros) y su licencia Apache 2.0, el modelo esta pensado para investigacion y pruebas de concepto mas que para produccion. No se han publicado resultados de benchmarks, idiomas soportados ni detalles de composicion del dataset de entrenamiento mas alla de la mencion al Cauldron.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language model: SigLIP-B/16-224 (encoder de imagen) + proyector pixel-shuffle + lineal + SmolLM2-135M (LLM) |
| Parametros totales | 222.081.632 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria PyTorch) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura tipica de los VLMs basados en proyector: un encoder visual SigLIP-B/16-224 procesa la imagen, un modulo de pixel-shuffle reduce la resolucion espacial de los tokens visuales y una capa lineal los proyecta al espacio de embeddings del LLM, que en este caso es SmolLM2-135M. Esta combinacion da como resultado un modelo de 222M parametros, coherente con la suma de los componentes (aproximadamente 87M del encoder SigLIP-B y 135M del LLM, mas el proyector).

El entrenamiento se realizo sobre el dataset Cauldron, un conjunto de instrucciones multimodales. El autor indica que el modelo reproduce nanoVLM v0.1 y reutiliza parte de su codigo, lo que sugiere un pipeline de entrenamiento estandar de ajuste supervisado sobre pares imagen-texto. No se especifican el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si se aplicaron tecnicas de RLHF o DPO. Tampoco se detallan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto condicionada a imagen (image-text-to-text): responde preguntas sobre el contenido de una imagen.
- Comprension visual basica: descripcion de escenas, objetos y atributos visibles.
- Razonamiento multimodal de un solo turno o multi-turno segun la ventana de contexto del LLM subyacente (no especificada).
- Capacidades de lenguaje heredadas de SmolLM2-135M: generacion de texto, respuesta a instrucciones y razonamiento basico.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma nativa.
- Capacidades multilingues: no documentadas; dependen de SmolLM2-135M, cuyo soporte principal es el ingles.
- Modo thinking, vision avanzada, audio: no disponible.

## Casos de uso

- Prototipado de asistentes visuales: el modelo puede responder preguntas sencillas sobre imagenes en entornos de desarrollo, gracias a su reducido tamano y a la licencia Apache 2.0 que permite iterar sin restricciones.
- Docencia e investigacion en VLMs: sirve como ejemplo reproducible de un pipeline vision-lenguaje completo (encoder + proyector + LLM) para cursos y laboratorios, al reproducir nanoVLM v0.1.
- Pruebas de concepto en dispositivos con recursos limitados: con 222M parametros, es viable ejecutarlo en GPUs consumer e incluso en CPU para inferencia por lotes pequenos, lo que facilita demos locales.
- Generacion de descripciones automaticas de imagenes (image captioning) en catalogos o archivos personales, siempre que la precision requerida sea moderada.
- Extraccion de informacion visual simple: por ejemplo, identificar el tipo de objeto o el texto visible en una captura, integrado en scripts de automatizacion.
- Benchmarking interno de pipelines multimodales: como linea base ligera para comparar frente a modelos mayores en tareas de comprension visual dentro de un equipo de investigacion.
- Filtrado y clasificacion de imagenes asistida por lenguaje: usar el modelo para etiquetar o describir lotes de imagenes en tareas de curaduria de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP32, aproximadamente 0,9 GB para los pesos (tamano del repo 0.9 GB); en FP16, en torno a 0,45 GB, mas el overhead de activaciones y del encoder visual.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para FP16; tarjetas como RTX 3060, RTX 4060, RTX 4090, A100 o H100 son mas que suficientes.
- Cabe en GPU consumer: si, practicamente en cualquier GPU consumer moderna e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: PyTorch nativo mediante el codigo del repositorio TinyForge-Vision (`VisionLanguageModel.from_pretrained`); no se han publicado integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| TinyForge-Vision-222M | 222M | No disponible | Apache 2.0 | Hugging Face (0 descargas) |
| nanoVLM v0.1 | ~222M (misma receta) | No disponible | No disponible | GitHub de Hugging Face |
| SmolVLM-256M | ~256M | No disponible | Apache 2.0 | Hugging Face |
| SmolLM2-135M (solo texto) | 135M | No disponible | Apache 2.0 | Hugging Face |

TinyForge-Vision-222M se situa en la misma franja que nanoVLM v0.1 y SmolVLM-256M: VLMs de menos de 300M parametros orientados a investigacion y despliegue ligero. Frente a SmolVLM-256M, de Hugging Face, comparte filosofia de compacidad, aunque no se dispone de datos de rendimiento para comparar calidad. La principal diferencia practica es la madurez: SmolVLM cuenta con documentacion y evaluaciones publicas, mientras que TinyForge-Vision carece de benchmarks y de adopcion (0 descargas, 0 likes en el momento de la consulta).

## Limitaciones y advertencias

- Ausencia de benchmarks publicos: no hay evidencia cuantitativa de su calidad en tareas como MMMU, DocVQA o similares; no debe asumirse un rendimiento equiparable a VLMs mayores.
- Riesgo elevado de alucinacion: con solo 135M parametros de LLM, la generacion de texto es limitada y propensa a inventar detalles sobre la imagen o a ignorar instrucciones complejas.
- Capacidad visual restringida: el encoder SigLIP-B/16-224 trabaja a resolucion 224x224, lo que limita la lectura de texto pequeno, documentos densos o detalles finos.
- Idiomas no documentados: probablemente el ingles sea el idioma principal heredado de SmolLM2-135M; el rendimiento en castellano no esta verificado.
- Contexto no especificado: se desconoce la ventana de contexto efectiva, lo que dificulta planificar conversaciones multi-turno largas.
- Proyecto de investigacion sin mantenimiento declarado: creado y actualizado el mismo dia (16 de noviembre de 2026), sin descargas ni comunidad; no hay garantia de soporte.
- Licencia Apache 2.0: permite uso comercial, pero al ser un proyecto de investigacion conviene validar el origen de los datos de entrenamiento (Cauldron) antes de un despliegue en produccion.
- Sin integraciones de despliegue estandar: requiere usar el codigo del repositorio TinyForge-Vision, lo que anade friccion frente a modelos con soporte en vLLM o llama.cpp.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Juanillaberia/TinyForge-Vision-222M
- Repositorio nanoVLM (referencia): https://github.com/huggingface/nanoVLM
