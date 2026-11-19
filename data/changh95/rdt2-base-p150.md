# changh95/rdt2-base-p150

## Resumen

rdt2-base-p150 es un paquete de inferencia publicado por el usuario changh95 que empaqueta el modelo visión-lenguaje-acción RDT2-FM (Robotics Diffusion Transformer 2, variante flow-matching) para ejecutarse sobre hardware Tenstorrent p150. No se trata de un modelo nuevo entrenado desde cero: los pesos son los originales del equipo RDT2 (Universidad de Tsinghua, paper arXiv:2602.03310, repositorio thu-ml/RDT2), sin modificar, y lo que aporta este repositorio es el empaquetado, la configuración de despliegue y los programas de dispositivo para la arquitectura Tenstorrent.

El modelo resuelve el problema de generar trozos de acción (action chunks) para manipulación bimanual: recibe dos imágenes de cámaras de muñeca, una instrucción en lenguaje natural y opcionalmente un estado propioceptivo de 20 valores, y devuelve 24 pasos futuros a 30 Hz con 20 valores por paso para dos brazos UR5e. Combina un backbone Qwen2.5-VL-7B (torre visual de 0,68B parámetros y capas 0-13 del modelo de lenguaje, 3,58B incluyendo embeddings) con un experto de acción de 0,49B parámetros y 14 bloques.

Su relevancia es doble: por un lado expone una política VLA de referencia para investigación en robótica bimanual; por otro, demuestra el despliegue de un modelo de difusión de acciones sobre aceleradores Tenstorrent, una alternativa no-NVIDIA, con servidor HTTP propio y trazado de ejecución por buckets de longitud de prompt.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-language-action: backbone Qwen2.5-VL-7B (parcial) + experto de acción RDT con flow-matching (14 bloques, hidden size 1024) |
| Parámetros totales | No disponible como cifra única; componentes: torre visual 0,68B, LM capas 0-13 3,58B (con embedding), experto de acción 0,49B |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | Instrucción de hasta 112 tokens; buckets de prompt de 416, 448 o 512 tokens |
| Tipos de cuantización | No disponible (pesos sin modificar, según la model card) |
| Idiomas soportados | No disponible (instrucciones en lenguaje natural; el backbone Qwen2.5-VL es multilingüe, pero no se detalla) |
| Licencia | Apache 2.0 |
| Formato de pesos | Pesos del checkpoint original en el caché de Hugging Face; contenedor Docker de 4,1 GB (descarga de 0,9 GB); no se especifica safetensors/GGUF |
| Hardware objetivo | Tenstorrent p150 (mesh P150) |
| Entrada | 2 imágenes (left_stereo, right_stereo) de 384x384 o par de igual altura que concatenado redimensione a 392x756; instrucción; estado propioceptivo opcional de 20 valores |
| Salida | 24 pasos a 30 Hz de 20 valores para dos brazos UR5e |
| Coste computacional | ~4,6 TFLOP por llamada; 5 pasos de flow-matching Euler |
| Empaquetado | tt-model-manager 0.1.0, manifest schema 5.1 |

## Arquitectura y entrenamiento

La arquitectura es un sistema VLA híbrido. El backbone es Qwen2.5-VL-7B, del que solo se ejecutan la torre visual y las capas 0-13 del modelo de lenguaje; las cachés clave/valor de esas capas condicionan un experto de acción RDT de 0,49B parámetros (14 bloques, hidden size 1024). El experto transforma ruido gaussiano en un chunk de acciones mediante 5 pasos de flow-matching Euler, con un coste de aproximadamente 4,6 TFLOP por llamada. El servidor incluye el preprocesado oficial de RDT2 (concatenación de cámaras, redimensionado y normalización de imagen de Qwen2.5-VL, plantilla de chat) y la desnormalización de acciones del checkpoint.

Los detalles de entrenamiento (número de tokens, composición del dataset, uso de RLHF/DPO) no se recogen en la información disponible; la model card remite a las fichas originales de RDT2-FM y RDT2-VQ. La innovación destacable en este paquete es de despliegue: la torre visual y el experto de acción corren cada uno como un programa de dispositivo persistente, el modelo de lenguaje como operaciones tt-nn con dos programas de dispositivo fusionados por capa (suma residual con RMSNorm; split de cabeza con rotary embedding), y cada bucket de longitud de prompt (416, 448 o 512 tokens) se reproduce desde su propia traza capturada.

## Capacidades

- Generación de acciones robóticas bimanuales: 24 pasos futuros a 30 Hz con 20 valores por paso para dos brazos UR5e (posición del efector final, rotación 6D relativa a la pose actual y anchura de pinza por brazo).
- Comprensión de instrucciones en lenguaje natural de hasta 112 tokens.
- Procesamiento de dos cámaras de muñeca (left_stereo, right_stereo) a 384x384 cada una.
- Integración opcional de estado propioceptivo de 20 valores.
- Servidor HTTP propio con endpoints `POST /predict`, `GET /health`, `GET /info` y un stub `GET /v1/models`.
- No expone una API de chat compatible con OpenAI; las formas de petición y respuesta son las del modelo.
- No se documentan capacidades de tool calling, agentes, visión general, audio ni modo thinking.

## Casos de uso

- Inspección de políticas VLA: ejecutar el checkpoint RDT2-FM sobre p150 para observar el comportamiento del experto de acción con observaciones reales o sintéticas, útil para depurar el pipeline de preprocesado y desnormalización.
- Evaluación offline de manipulación bimanual: enviar pares de imágenes de un dataset público de UR5e y comparar los chunks generados con los del código oficial de RDT2, como hace el smoke test incluido.
- Comparación de implementaciones: verificar que la versión Tenstorrent reproduce numéricamente la salida del código de referencia (el smoke test compara el chunk con la salida almacenada del código oficial y comprueba repetición, bucket de 512 tokens y rechazos).
- Validación de despliegues no-NVIDIA: medir latencia y viabilidad de un VLA sobre aceleradores Tenstorrent frente a GPU, con trazado por bucket de prompt.
- Reproducción de experimentos académicos: servir el checkpoint con un único comando (`tt serve changh95/rdt2-base-p150`) para replicar resultados del paper arXiv:2602.03310 en un entorno controlado.
- Pruebas de integración de robótica: usar el endpoint `/predict` como servicio local en un banco de pruebas con dos brazos UR5e y cámaras de muñeca, una petición a la vez.
- Desarrollo de preprocesado propio: el paquete incluye las imágenes de muestra y el servidor aplica la concatenación y normalización oficiales, lo que permite contrastar pipelines alternativos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Acelerador Tenstorrent p150 (mesh P150) obligatorio; no se documenta soporte para GPU.
- Disco: aproximadamente 16 GB libres (11 GB de pesos en caché de Hugging Face y 4,1 GB de imagen de contenedor, con descarga de 0,9 GB).
- El primer arranque descarga los dos shards de RDT2-VQ (10 GB) y, al iniciar el servidor, el experto de acción RDT2-FM (1 GB), el normalizador de acciones y el fichero del tokenizer.
- Requiere Docker y, opcionalmente, la CLI de Tenstorrent (`uv tool install tenstorrent`).
- El primer arranque compila kernels para el dispositivo, lo que tarda varios minutos; el servidor está listo cuando registra `Application startup complete`.
- Despliegue mediante `tt serve` o `tt-model serve`; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput no disponibles; el coste por llamada se estima en ~4,6 TFLOP y el servidor atiende una petición a la vez.
- No cabe en GPU de consumo: el hardware objetivo es un acelerador Tenstorrent dedicado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rdt2-base-p150 (este) | Torre visual 0,68B + LM 3,58B + experto 0,49B | Instrucción 112 tokens; buckets 416/448/512 | VLA bimanual UR5e, 24 pasos a 30 Hz | Apache 2.0 | Tenstorrent p150, servidor HTTP propio |
| RDT2-FM (original) | Mismos pesos | Misma configuración | Misma tarea | Apache 2.0 (según repositorio base) | Pesos en Hugging Face; ejecución en GPU con el código thu-ml/RDT2 |
| RDT2-VQ (original) | Backbone Qwen2.5-VL-7B | No disponible | Backbone visión-lenguaje del sistema | No disponible en la información | Hugging Face |

La comparación con otros VLA de la misma categoría (por ejemplo, familias tipo OpenVLA o pi0) no está disponible en la información proporcionada; no se aportan datos de rendimiento comparativo.

## Limitaciones y advertencias

- Pesos sin modificar respecto al checkpoint original: cualquier sesgo del entrenamiento de RDT2-FM se hereda íntegramente.
- Riesgo de alucinación y de acciones incorrectas inherente a una política generativa; no hay mecanismo de seguridad documentado en el paquete.
- Uso previsto limitado a inferencia de investigación, una petición a la vez; no está diseñado como servicio de producción concurrente.
- Dependencia de hardware exótico (Tenstorrent p150): no hay ruta de despliegue en GPU ni en CPU descrita.
- La API no es compatible con OpenAI; integrarla en herramientas de chat estándar requiere adaptación.
- El contexto de instrucción está acotado a 112 tokens y los buckets de prompt son fijos (416, 448, 512), lo que limita instrucciones largas o composiciones no previstas.
- La normalización de acciones es la del checkpoint; usarla con otra configuración de robot requiere recalibración.
- No se especifican idiomas soportados ni comportamiento multilingüe verificado.
- Licencia Apache 2.0 permite uso comercial, pero la responsabilidad sobre el uso físico del robot recae en el integrador.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; es un artefacto reciente y poco validado por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/changh95/rdt2-base-p150
- Modelo base RDT2-FM: https://huggingface.co/robotics-diffusion-transformer/RDT2-FM
- Modelo base RDT2-VQ: https://huggingface.co/robotics-diffusion-transformer/RDT2-VQ
- Paper: https://arxiv.org/abs/2602.03310
- Código oficial: https://github.com/thu-ml/RDT2
- Herramienta de empaquetado: https://github.com/tenstorrent/tt-model-manager
- CLI de Tenstorrent (prerrequisitos): https://github.com/tenstorrent/tt-cli/blob/main/docs/prerequisites.md
- Muestras de ejemplo: https://huggingface.co/changh95/rdt2-base-p150/resolve/main/code/tt_rdt2/samples
