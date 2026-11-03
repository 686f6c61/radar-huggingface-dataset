# junjie008/fastwam-piper-putblocks-wan-20261102

## Resumen

Fastwam-piper-putblocks-wan-20261102 es un modelo de política robótica (visión-lenguaje-acción) publicado por el usuario junjie008 en HuggingFace, orientado a la manipulación de bloques con un brazo robótico Piper. El modelo resuelve la tarea "put blocks": recoger bloques de una mesa, depositarlos en una caja y pulsar un botón para detenerse, con objetivos de 1, 2 o 3 bloques especificados mediante instrucción en lenguaje natural. Se trata de un checkpoint de inferencia en el paso 18.000 de un entrenamiento de 20.000 pasos que, según el autor, aún continuaba en el momento de la publicación.

La arquitectura combina un backbone de difusión de vídeo Wan (con VAE Wan2.2 para codificación visual) con un módulo ActionDiT que genera trayectorias de acción. El modelo consume dos cámaras RGB a 224×224 (una fija frontal y una en la muñeca), estado propioceptivo de 6 articulaciones más apertura de pinza, y produce chunks de 16 pasos de acción a 20 Hz. Se inicializa desde pesos base Wan y ActionDiT original, sin fine-tuning previo en otros dominios (ni frutas ni simulación), usando exclusivamente 60 episodios de datos reales de bloques.

El interés del modelo es acotado pero específico: es un ejemplo de despliegue completo de una política VLA con servidor WebSocket, protocolo de cliente documentado y recursos de inferencia autocontenidos (VAE, embeddings T5, estadísticas de normalización). No obstante, el propio autor advierte que no se ha validado en bucle cerrado sobre hardware real ni con inferencia GPU completa, por lo que debe considerarse un artefacto de investigación y no un sistema listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusión de vídeo Wan (backbone) + ActionDiT para generación de acciones; módulos v10 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de observación: 1 frame inicial + múltiplos de 16 frames a 20 Hz) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en PyTorch `.pt`, no se documentan cuantizaciones) |
| Idiomas soportados | no disponible (instrucciones únicamente en inglés, tres plantillas fijas) |
| Licencia | no disponible |
| Formato de pesos | PyTorch `.pt` (`checkpoints/step_018000.pt`), VAE en `safetensors` (`Wan2.2_VAE.safetensors`) |

## Arquitectura y entrenamiento

El modelo sigue un paradigma visión-lenguaje-acción basado en difusión. El backbone es Wan (modelo de generación de vídeo) que actúa como codificador visual a través de un VAE Wan2.2; sobre él se monta un ActionDiT que predice chunks de 16 pasos de acción (H16). Las acciones se representan como 6 articulaciones en radianes relativas al inicio del chunk más la apertura de pinza en valor absoluto, sumando 7 dimensiones por paso. La instrucción en lenguaje natural se codifica con T5 y se cachea previamente (`common/text_cache/`), de modo que el despliegue no requiere descargar T5 por separado.

El entrenamiento se realizó sobre 60 episodios de datos reales de bloques (dataset `Mockingbird315/piper-putblocks-60-20261101`), con 8 GPUs, batch efectivo de 32, tasa de aprendizaje pico de 1e-4, 1.000 pasos de warmup y guardado cada 500 pasos, en un plan de 20.000 pasos. El checkpoint publicado corresponde al paso 18.000, por lo que no es el peso final. No se cargaron pesos de fine-tuning previos de frutas ni de simulación; la inicialización parte de Wan base y ActionDiT original. No se documenta uso de RLHF ni DPO. La normalización se realiza en modo relativo H16 sobre las estadísticas de los 60 episodios (`common/dataset_stats.json`), y no debe sustituirse por estadísticas de otros dominios.

## Capacidades

- Generación de trayectorias de manipulación robótica en bucle cerrado a partir de observaciones visuales y propioceptivas.
- Comprensión de instrucciones en lenguaje natural limitadas a tres plantillas exactas en inglés (N=1, N=2, N=3 bloques).
- Predicción autónoma del número de bloques ya depositados y decisión de pulsar el botón de parada sin reglas manuales de conteo.
- Procesamiento multimodal: dos cámaras RGB (frontal fija y muñeca) a 224×224 más estado de 6 articulaciones y pinza.
- Generación de chunks de acción de 16 pasos a 20 Hz con salida en coordenadas absolutas.
- Servidor de inferencia WebSocket con protocolo documentado (`piper-putfruits-pred/1`, nombre heredado por compatibilidad).
- No soporta tool calling, function calling, agentes multi-paso generales, visión fuera del dominio de manipulación, audio ni modo "thinking".

## Casos de uso

- Investigación en políticas VLA para manipulación: el paquete permite reproducir la tarea put-blocks con un Piper y sirve como línea base para comparar arquitecturas de difusión aplicadas a robótica.
- Despliegue de referencia con servidor WebSocket: el protocolo `CLIENT_PROTOCOL.md` y el cliente de replay de observaciones permiten validar la integración completa de un pipeline de inferencia antes de conectar hardware real.
- Replay de observaciones para depuración: el cliente incluido permite reproducir secuencias grabadas y verificar el comportamiento del modelo sin riesgo sobre el robot.
- Fine-tuning posterior sobre nuevos datasets: al publicarse `training/resolved.yaml`, `training/code_commit.txt` y `training_source.tar.gz`, el checkpoint puede servir de inicialización para reentrenar con más episodios o variantes de la tarea.
- Evaluación de robustez ante cambios de iluminación o disposición de bloques: útil para estudiar la degradación de políticas entrenadas con solo 60 episodios.
- Estudio de normalización relativa H16: el paquete documenta explícitamente el esquema de normalización y las estadísticas, lo que facilita analizar su impacto en la estabilidad del control.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que no se realizó inferencia GPU completa del checkpoint de 18k ni validación de tasa de éxito en bucle cerrado con el brazo real. Las únicas verificaciones reportadas son de integridad: lectura completa en CPU con PyTorch, comprobación de CRC del ZIP, verificación de SHA256, validación de formas y valores finitos de los embeddings T5, y 11 tests de protocolo de despliegue en CPU.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 13,7 GB y el checkpoint `step_018000.pt` contiene el Video/Action DiT completo más módulos v10, lo que sugiere un requisito de VRAM elevado no cuantificado por el autor.
- GPU recomendadas: no especificadas; el entrenamiento usó 8 GPUs (modelo no indicado). Para inferencia se documenta `--device cuda:0`.
- Compatibilidad con GPU de consumo: no confirmada; el tamaño del paquete y la presencia de un backbone de difusión de vídeo hacen dudosa su ejecución en GPUs de consumo sin cuantización, que no está documentada.
- Opciones de despliegue: servidor propio incluido en `source.tar.gz` (WebSocket en `127.0.0.1:8001`), con PyTorch 2.7.1 + torchvision 0.22.1 sobre CUDA 12.8 y Python 3.11. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles. La observación se emite a 20 Hz y el modelo devuelve chunks de 16 pasos, pero no se publican tiempos de inferencia medidos.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otras políticas robóticas (por ejemplo, RT-2, OpenVLA, π0 o Diffusion Policy), ni datos de rendimiento que permitan establecer una comparación rigurosa.

## Limitaciones y advertencias

- El checkpoint corresponde al paso 18.000 de un entrenamiento planificado a 20.000; no es el peso final y el autor lo señala explícitamente.
- No se ha validado en bucle cerrado sobre el brazo Piper real: no hay tasa de éxito medida ni verificación de inferencia GPU completa del checkpoint de 18k.
- El paquete no incluye el controlador de hardware Piper validado; el cliente es responsable del timing de ejecución, del descarte de respuestas caducadas y del control del brazo.
- Las instrucciones están restringidas a tres plantillas exactas en inglés; no hay soporte multilingüe ni generalización a otras órdenes.
- El modelo solo maneja objetivos de 1, 2 o 3 bloques; el cliente únicamente puede enviar `target_count` en {1, 2, 3}.
- La salida `[16,7]` ya está en coordenadas absolutas: el cliente no debe sumar el estado articular actual, lo que constituye una fuente de error de integración documentada.
- Las imágenes de la cámara fija ya se capturan con recorte central 2× y letterbox; no deben recortarse de nuevo en el cliente.
- La normalización depende de `common/dataset_stats.json` de estos 60 episodios; sustituirla por estadísticas de otros dominios invalida el modelo.
- Entrenado con solo 60 episodios reales, sin datos de simulación ni de otros objetos: riesgo alto de sobreajuste y baja generalización a cambios de escena, iluminación u objetos.
- Riesgo de alucinación en el conteo de bloques depositados, dado que el modelo predice por sí mismo el número completado sin reglas manuales de parada.
- Licencia no disponible: no puede asumirse uso comercial sin consultar al autor.
- El nombre del módulo (`piper_putfruits`) y del protocolo (`piper-putfruits-pred/1`) es herencia de compatibilidad y no refleja la tarea real (put-blocks), lo que puede confundir en integraciones.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/junjie008/fastwam-piper-putblocks-wan-20261102
- Dataset de entrenamiento: https://huggingface.co/datasets/Mockingbird315/piper-putblocks-60-20261101
- Protocolo de cliente: `CLIENT_PROTOCOL.md` (incluido en el repositorio del modelo)
- Configuración de entrenamiento: `training/resolved.yaml` y `training/code_commit.txt` (incluidos en el repositorio)
- Código de despliegue: `source.tar.gz` (incluido en el repositorio)
- Código de entrenamiento: `training_source.tar.gz` (incluido en el repositorio)
