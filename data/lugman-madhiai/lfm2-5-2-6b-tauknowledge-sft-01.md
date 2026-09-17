# lugman-madhiai/LFM2.5-2.6B-TauKnowledge-SFT-01

## Resumen

LFM2.5-2.6B-TauKnowledge-SFT-01 es un ajuste fino supervisado (SFT) del modelo LiquidAI/LFM2.5-2.6B, publicado por el usuario lugman-madhiai bajo licencia Apache-2.0. Se trata de un modelo denso de 2.697.198.592 parámetros (≈2,70B) perteneciente a la familia LFM2 de Liquid AI, una línea de pesos abiertos orientada al despliegue en dispositivo (on-device) y a cargas de trabajo agénticas: planificación, llamada a herramientas y ejecución de tareas de varios pasos.

El entrenamiento se realizó con la librería Unsloth y TRL de Hugging Face, según la propia model card del autor. Esa model card es mínima: no documenta el conjunto de datos, el número de tokens de entrenamiento, la composición del corpus ni la configuración de hiperparámetros, y tampoco publica resultados de evaluación. El repositorio registraba 0 descargas y 0 likes en el momento de la consulta.

Su interés práctico deriva del modelo base: Liquid AI presenta LFM2.5-2.6B como un modelo agéntico capaz de planificar y encadenar tareas multi-paso a 220 tok/s en menos de 2,5 GB, lo que lo sitúa en la categoría de agentes locales ejecutables en hardware de consumo. Este fine-tune hereda esa arquitectura y ese perfil de despliegue, pero su comportamiento específico no está verificado ni evaluado públicamente por el autor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LFM2 (familia de modelos de Liquid AI; el repositorio declara el tag `lfm2`). El informe técnico del modelo base describe la familia LFM2 |
| Parámetros totales | 2.697.198.592 (≈2,70B) |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la información proporcionada |
| Tipos de cuantización | no disponible en el repositorio (solo contiene pesos sin cuantizar); Liquid AI indica que el modelo base se ejecuta en menos de 2,5 GB |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (tamaño del repositorio: 5,4 GB) |

## Arquitectura y entrenamiento

El modelo es un fine-tune del checkpoint LiquidAI/LFM2.5-2.6B, que pertenece a la familia LFM2 de Liquid AI. La model card del autor únicamente indica que el entrenamiento se hizo "2x faster" con Unsloth y la librería TRL de Hugging Face, lo que sitúa el procedimiento en el terreno del SFT (supervised fine-tuning) con técnicas de optimización de memoria y velocidad de Unsloth. No se especifican el número de pasos, la tasa de aprendizaje, el número de épocas, el tamaño de lote ni si se aplicaron fases posteriores de DPO, RLHF u otras.

Tampoco se documenta el dataset de ajuste. El nombre del repositorio incluye el término "TauKnowledge", pero no hay ninguna descripción del corpus asociado ni confirmación de su composición, por lo que no es posible determinar su procedencia ni su volumen. Como referencia del modelo base, el informe técnico de LFM2 (arXiv 2511.23404) indica que el corpus de SFT utilizado para los modelos de 350M, 700M, 1.2B y 2.6B comprende aproximadamente 5,39 millones de muestras, y 9,24 millones para el modelo 8B-A1B. Estas cifras corresponden al entrenamiento original de Liquid AI, no al fine-tune aquí descrito.

## Capacidades

- Generación de texto conversacional en inglés, con la etiqueta `conversational` declarada en el repositorio.
- Herencia del perfil agéntico del modelo base: planificación, llamada a herramientas y ejecución de tareas de varios pasos, según la descripción de Liquid AI para LFM2.5-2.6B.
- Soporte de tool calling / function calling: declarado por Liquid AI para el modelo base; no verificado en este fine-tune concreto.
- Soporte para agentes y razonamiento multi-paso: atribuido al modelo base por su desarrollador; sin evaluación publicada para este ajuste.
- Capacidades multilingües: limitadas al inglés según el campo `language` del repositorio; el modelo base podría tener un alcance mayor, pero no está documentado aquí.
- Modo de razonamiento explícito (thinking), visión o audio: no disponibles en la información proporcionada.
- Compatibilidad con despliegue en endpoints: el repositorio incluye la etiqueta `endpoints_compatible` y `text-generation-inference`.

## Casos de uso

- Agente local en dispositivo: el modelo base está diseñado para ejecutarse en menos de 2,5 GB y encadenar tareas multi-paso, por lo que este fine-tune puede emplearse como agente autónomo en portátiles o equipos de borde sin conexión a la nube.
- Asistente conversacional con tool calling: integrado en un bucle de agente que consulte APIs, bases de datos o sistemas de ficheros mediante esquemas de funciones, aprovechando el soporte declarado del modelo base.
- Automatización de flujos de trabajo multi-paso: ejecución de secuencias de acciones (leer documento, extraer datos, llamar a un servicio, redactar respuesta) en pipelines internos donde el coste por token en la nube es un factor limitante.
- Prototipado rápido y experimentación: al ser un ajuste fino de 2,7B con licencia Apache-2.0, sirve para validar hipótesis de producto antes de escalar a modelos mayores, con ciclos de iteración cortos gracias a Unsloth.
- Procesamiento de documentos en local: resumen, extracción de entidades y clasificación de textos en inglés dentro de entornos con restricciones de privacidad, donde enviar los datos a un proveedor externo no es viable.
- Generación asistida en entornos sin GPU dedicada: al caber en configuraciones de 8 GB de VRAM en cuantización de 4 bits, puede desplegarse en estaciones de trabajo modestas para tareas de redacción técnica.
- Base para fine-tunes posteriores: el repositorio incluye la etiqueta `unsloth` y se distribuye en safetensors, lo que facilita reutilizarlo como punto de partida para nuevos ajustes específicos de dominio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del autor no incluye ninguna métrica de evaluación (MMLU, HumanEval, GSM8K u otras), y la búsqueda web no ha devuelto resultados de evaluación para este fine-tune concreto.

Como referencia exclusiva del modelo base, y no de este ajuste, Liquid AI declara en su blog una velocidad de 220 tok/s y un consumo de memoria inferior a 2,5 GB para LFM2.5-2.6B. Se trata de una cifra de rendimiento declarada por el desarrollador del modelo original, no de un benchmark de calidad verificado de forma independiente.

## Requisitos de hardware

- VRAM estimada en fp16/bf16: aproximadamente 5,4 GB solo para los pesos, más el overhead de la caché KV y el runtime (del orden de 6-7 GB en la práctica).
- VRAM estimada en int8: en torno a 2,7 GB para los pesos.
- VRAM estimada en 4 bits: entre 1,5 y 1,7 GB para los pesos, lo que deja margen para contexto en tarjetas de 4-8 GB.
- GPU de consumo compatibles: RTX 3060 12 GB, RTX 4060 Ti 16 GB y RTX 4090 24 GB pueden ejecutarlo en fp16 sin problema; tarjetas de 6-8 GB requieren cuantización.
- GPU de centro de datos: A100, H100 y L40S soportan el modelo con holgura, aunque su tamaño no justifica ese hardware salvo por agregación de muchas instancias.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (etiqueta `text-generation-inference` y `endpoints_compatible`), vLLM y cualquier runtime compatible con safetensors. El repositorio no incluye pesos GGUF, por lo que llama.cpp u Ollama requerirían una conversión previa.
- Latencia y throughput: no disponibles para este fine-tune. El modelo base declara 220 tok/s según Liquid AI, cifra que no puede extrapolarse directamente al ajuste.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| LFM2.5-2.6B-TauKnowledge-SFT-01 (este) | 2,70B | no disponible | Apache-2.0 | Hugging Face | Fine-tune comunitario sin evaluación publicada |
| LiquidAI/LFM2.5-2.6B (base) | ≈2,6B | no disponible en la información proporcionada | Apache-2.0 | Hugging Face | Modelo agéntico on-device; 220 tok/s y menos de 2,5 GB según Liquid AI |
| LFM2.5-8B-A1B (misma familia) | 8B totales con 1B activos (MoE) | no disponible | no disponible en la información proporcionada | Hugging Face (según el blog de Liquid AI) | Corpus de SFT de 9,24 millones de muestras según el informe técnico |

No se dispone de datos verificados en la información proporcionada para comparar este modelo con alternativas de otros fabricantes (por ejemplo, modelos densos de 2-4B de otras familias). Cualquier comparación numérica con ellos requeriría consultar sus respectivas fichas técnicas.

## Limitaciones y advertencias

- La model card es mínima: no documenta dataset, hiperparámetros, número de tokens ni proceso de alineación, lo que impide reproducir el entrenamiento o auditar sus datos.
- No hay resultados de benchmarks ni evaluación independiente; el rendimiento real en tareas concretas es desconocido.
- El repositorio registra 0 descargas y 0 likes, por lo que no existe validación por parte de la comunidad.
- El modelo está declarado únicamente para inglés; su comportamiento en castellano u otros idiomas no está garantizado.
- Un SFT sobre un modelo pequeño puede degradar capacidades generales del modelo base (olvido catastrófico) si el corpus de ajuste es estrecho; no hay datos para descartarlo.
- Riesgo de alucinación inherente a los modelos de 2,7B, especialmente en tareas de conocimiento factual y razonamiento largo.
- El nombre "TauKnowledge" no va acompañado de ninguna descripción del dataset, por lo que su relación con benchmarks de tipo tau-bench es una suposición no confirmada.
- La licencia Apache-2.0 permite uso comercial, modificación y redistribución, pero el usuario debe verificar el cumplimiento de las condiciones del modelo base.
- Las fechas del repositorio (creación y actualización el 2026-09-17) resultan anómalas y podrían indicar un artefacto de registro.
- No se distribuyen pesos GGUF, lo que obliga a convertir el modelo para despliegues en CPU o en runtimes orientados a dispositivo.
- La búsqueda web sobre este modelo devolvió mayoritariamente resultados no relacionados, lo que indica una cobertura externa prácticamente nula.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/lugman-madhiai/LFM2.5-2.6B-TauKnowledge-SFT-01
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-2.6B
- Blog de Liquid AI sobre LFM2.5-2.6B: https://www.liquid.ai/blog/lfm2-5-2-6b
- Informe técnico de LFM2 (arXiv): https://arxiv.org/html/2511.23404v1
- Hilo en r/LocalLLaMA sobre la familia LFM2.5: https://www.reddit.com/r/LocalLLaMA/comments/1q5a0if/liquid_ai_released_lfm25_family_of_tiny_ondevice/
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Librería TRL de Hugging Face: https://github.com/huggingface/trl
