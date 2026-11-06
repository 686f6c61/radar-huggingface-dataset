# codeShare/gemma-4-E2B-it-heretic-image-caption-adapter

## Resumen

El adaptador `codeShare/gemma-4-E2B-it-heretic-image-caption-adapter` es un LoRA de PEFT publicado por el usuario codeShare sobre el modelo base `coder3101/gemma-4-E2B-it-heretic`, una variante "abliterated" (con el comportamiento de rechazo modificado) de Gemma 4 E2B de Google. Su proposito concreto es mejorar la generacion de descripciones de imagenes (image captioning) del modelo base, especialmente para imagenes generadas por IA. Se distribuye como adaptador LoRA en formato safetensors, no como modelo fusionado, y el repositorio ocupa aproximadamente 0,2 GB.

El modelo base pertenece a la familia Gemma 4 de Google, que segun la documentacion oficial es multimodal: acepta entrada de texto e imagen (y audio en las variantes E2B, E4B y 12B) y genera texto. El adaptador hereda por tanto esa arquitectura multimodal y anade un ajuste fino especifico para captioning. El autor indica que el entrenamiento se hizo con QLoRA multimodal sobre unas 3.000 imagenes generadas por IA (prompts de modelos como Chroma, Krea 2 y Moss Image).

La relevancia de esta publicacion es acotada: se trata de una version temprana ("early version"), con cero descargas y cero likes en el momento de la consulta, sin licencia declarada y sin datos de benchmarks. Resulta util como ejemplo de adaptacion LoRA multimodal sobre Gemma 4 y para experimentacion con captioning de imagenes sinteticas, pero no como componente listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador PEFT LoRA sobre modelo base multimodal (familia Gemma 4) |
| Parametros totales | no disponible (el adaptador LoRA no declara su numero de parametros; el modelo base E2B no detalla cifras en la informacion disponible) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el entrenamiento uso QLoRA; no se listan formatos de cuantizacion publicados) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el autor remite a la licencia y restricciones del modelo base) |
| Formato de pesos | safetensors (adaptador PEFT LoRA) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA estandar de la libreria PEFT, pensado para cargarse sobre `coder3101/gemma-4-E2B-it-heretic` mediante `PeftModel.from_pretrained`. El modelo base es una variante "abliterated" de Gemma 4 E2B, es decir, una version en la que se ha modificado el comportamiento de rechazo del modelo original de Google. La familia Gemma 4, segun su model card oficial, es multimodal (texto e imagen como entrada, audio en E2B/E4B/12B, salida de texto) y se distribuye en variantes preentrenadas e instruction-tuned. No se detalla en la informacion disponible la arquitectura interna exacta (tipo de transformer, atencion, etc.) ni el contexto nativo del modelo base.

El adaptador se entreno con QLoRA multimodal sobre aproximadamente 3.000 imagenes generadas por IA y sus prompts, asociadas a modelos de generacion como Chroma, Krea 2 y Moss Image. El objetivo declarado es mejorar la capacidad de describir imagenes sinteticas. No se especifican el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si hubo etapas de RLHF o DPO; el autor indica que el dataset original y los artefactos privados de entrenamiento no se incluyen. El repositorio incluye el processor necesario para el pipeline image-to-text.

## Capacidades

- Generacion de descripciones de imagenes (image captioning) sobre el modelo base multimodal Gemma 4 E2B.
- Comprension de imagenes (image understanding) heredada del modelo base.
- Entrada multimodal: texto e imagen; el modelo base Gemma 4 admite audio en las variantes E2B, E4B y 12B segun la documentacion oficial.
- Salida de texto en formato conversacional, usando el formato de conversacion soportado por el modelo base.
- Comportamiento de rechazo modificado (abliteration) en el modelo base, orientado a reducir negativas del modelo original.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible (no se declaran idiomas).

## Casos de uso

- Catalogacion de imagenes generadas por IA: el adaptador se entreno especificamente con imagenes sinteticas de modelos como Chroma, Krea 2 y Moss Image, por lo que es adecuado para generar metadatos descriptivos en pipelines de generacion de imagenes.
- Etiquetado automatico de datasets de difusion: usar el adaptador para producir captions de un corpus de imagenes generadas, que luego sirvan como texto de entrenamiento o evaluacion de modelos de imagen.
- Busqueda semantica de imagenes sinteticas: generar descripciones textuales que se indexen para recuperacion por texto en una biblioteca de imagenes generadas.
- Prototipado de asistentes visuales: cargar el adaptador sobre el modelo base con `PeftModel` y el processor incluido para experimentar con interfaces conversacionales que describen imagenes.
- Investigacion sobre abliteration y captioning: comparar el comportamiento descriptivo del modelo base heretic frente a su version original en tareas de vision, dado que el adaptador se disena sobre una variante con el rechazo modificado.
- Generacion de alt-text para contenido visual sintetico: producir descripciones para accesibilidad en entornos donde las imagenes se generan por IA y se necesita texto alternativo automatico.
- Ajuste fino adicional: al ser un LoRA estandar en safetensors, sirve como punto de partida para seguir entrenando adaptadores de captioning sobre Gemma 4 E2B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. El repositorio del adaptador ocupa 0,2 GB; el consumo real depende del modelo base Gemma 4 E2B cargado en fp16 (el ejemplo de carga usa `torch_dtype=torch.float16` y `device_map="auto"`).
- GPU recomendadas: no disponible. El ejemplo oficial usa `device_map="auto"`, lo que permite repartir el modelo entre GPU y CPU.
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible; depende del tamano del modelo base E2B, no detallado.
- Opciones de despliegue: carga via `transformers` + `peft` (el autor proporciona codigo con `AutoProcessor`, `AutoModelForMultimodalLM` y `PeftModel`). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| codeShare/gemma-4-E2B-it-heretic-image-caption-adapter | no disponible (LoRA sobre E2B) | no disponible | Image captioning | no disponible (remite al base) | Hugging Face, 0 descargas |
| google/gemma-4-E2B | no disponible en la informacion | no disponible | Multimodal texto/imagen/audio | licencia de Google (no detallada aqui) | Hugging Face oficial |
| coder3101/gemma-4-E2B-it-heretic | no disponible | no disponible | Multimodal, rechazo modificado | no disponible | Hugging Face (modelo base del adaptador) |

No se dispone de datos de rendimiento comparativo (benchmarks) entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Version temprana: el autor la describe como "early version" entrenada con solo unas 3.000 imagenes, lo que limita la generalizacion.
- Sesgo de dominio: el entrenamiento se hizo con imagenes generadas por IA (Chroma, Krea 2, Moss Image), por lo que el rendimiento en fotografia real o dominios no cubiertos no esta validado.
- Modelo base abliterated: el comportamiento de rechazo ha sido modificado, lo que puede producir respuestas inapropiadas o sin filtros de seguridad; debe evaluarse antes de cualquier uso publico.
- Licencia no declarada: el autor remite a la licencia y restricciones del modelo base; es imprescindible revisar los terminos de Gemma 4 de Google antes de un uso comercial.
- Riesgo de alucinacion: no se han publicado evaluaciones de fidelidad de las descripciones generadas.
- Idiomas: no se declaran idiomas soportados; no hay garantia de calidad en castellano.
- Formato: es un adaptador LoRA, no un modelo autonomo; requiere cargar el modelo base y el processor incluido.
- Sin benchmarks ni metricas publicadas: no hay evidencia cuantitativa de mejora frente al modelo base.
- Sin soporte comunitario: cero descargas y cero likes en el momento de la consulta.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/codeShare/gemma-4-E2B-it-heretic-image-caption-adapter
- Modelo base del adaptador: https://huggingface.co/coder3101/gemma-4-E2B-it-heretic
- Gemma 4 E2B oficial de Google: https://huggingface.co/google/gemma-4-E2B
- Model card oficial de Gemma 4: https://ai.google.dev/gemma/docs/core/model_card_4
