# DaojiePENG/leapbot-ce-libero

## Resumen

LeapBot-CE (CloudEdge) — LIBERO es un checkpoint de política visión-lenguaje-acción (VLA) con arquitectura dividida entre nube y borde, desarrollado por Daojie Peng. El modelo resuelve el problema de control robótico cuando la latencia de red degrada la observación: un modelo de mundo de vídeo de gran capacidad (Fast-WAM, sobre la base Wan2.2 TI2V-5B) se ejecuta en la nube y envía una caché KV comprimida al dispositivo de borde, donde un experto de acción ligero opera sobre el flujo de observación en vivo.

La innovación central es la codificación de la caché KV antes de la transmisión (cuello de botella con pooling y decodificador opcional), lo que permite que la política siga funcionando cuando el flujo de observación llega retrasado por la red. El checkpoint publicado corresponde a los experimentos sobre el benchmark LIBERO de manipulación robótica, con dos cámaras (agentview y muñeca) a resolución 224×224, dimensión propioceptiva de 8 y horizonte de acción de 32 pasos.

Este repositorio contiene únicamente los pesos delta entrenables (2,0 GB) junto con todos los activos base congelados necesarios para ejecutarlo: el cabezal DiT de acción preentrenado, los pesos del experto de vídeo Fast-WAM para LIBERO y el codificador visual SigLIP-Base del camino de borde. El backbone Wan2.2 y el codificador de texto se descargan del Hub en tiempo de carga.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA cloud-edge: world model de vídeo (Fast-WAM sobre Wan2.2 TI2V-5B) + experto de acción DiT en el borde |
| Parametros totales | no disponible (checkpoint delta de 2,0 GB; activos base adicionales de 2,0 GB + 12 GB + 355 MB) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (horizonte de acción de 32 pasos) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT (pesos y config); activos base con sus términos originales (Wan2.2 Apache-2.0) |
| Formato de pesos | PyTorch `.pt` (dict plano con `leapbotce_delta=True`); SigLIP-Base en safetensors |

## Arquitectura y entrenamiento

La arquitectura es una política VLA dividida en dos rutas. La ruta lenta, en la nube, ejecuta un modelo de mundo de vídeo Fast-WAM construido sobre el backbone Wan2.2 TI2V-5B, que procesa la observación y produce una caché KV. Esta caché se codifica mediante un `cloud_kv_codec` (pooling con rejilla 7×8 y cuello de botella de dimensión 1024; decodificador de rango 256 desactivado en inferencia) y se transmite al borde. La ruta rápida, en el dispositivo, ejecuta un experto de acción DiT ligero sobre el flujo de observación en vivo, con un proyector visual SigLIP-Base y un codificador propioceptivo.

El checkpoint `step_032544.pt` contiene solo los módulos entrenables sobre Fast-WAM: `action_expert`, `cloud_kv_adapter`, `cloud_kv_codec`, `edge_vision_projector`, `proprio_encoder`, `video_lora` y `leapbotce_meta`. El backbone Wan2.2 y el experto de vídeo no se incluyen y se cargan desde los activos base. La metadata registra `edge_vision_mode` y `use_cloud_cache`, y el cargador rechaza configuraciones incompatibles. No se detalla en la información disponible el volumen de datos de entrenamiento, la composición del dataset ni si se aplicó RLHF o DPO.

## Capacidades

- Control robótico de manipulación mediante política visión-lenguaje-acción sobre el benchmark LIBERO.
- Procesamiento multimodal con dos vistas de cámara (agentview y muñeca) a 224×224.
- Fusión de embeddings VAE en los latentes del modelo de mundo.
- Codificación y transmisión de caché KV entre nube y borde para tolerar latencia de red.
- Robustez ante retrasos en el flujo de observación (retención del 77,3 % de éxito con retraso D=40 frente a D=0).
- Codificador propioceptivo de dimensión 8 integrado en la política.
- No se documentan capacidades de tool calling, agentes multi-paso, multilingüismo ni modo de razonamiento explícito.

## Casos de uso

- Manipulación robótica en entornos con red no fiable: el modelo mantiene la política operativa cuando la observación llega retrasada, gracias a la caché KV codificada que se reutiliza durante varios pasos de control.
- Investigación en arquitecturas cloud-edge para robótica: sirve como referencia reproducible para estudiar el reparto de cómputo entre un modelo de mundo pesado en nube y un experto de acción ligero en borde.
- Evaluación de robustez frente a latencia: el protocolo de envejecimiento del flujo de entrada (D=0, 10, 20, 40) permite medir la degradación de la tasa de éxito de forma controlada.
- Benchmarking de políticas VLA en LIBERO: el checkpoint y la configuración permiten reproducir los resultados publicados sobre las cuatro suites del benchmark.
- Despliegue en hardware de borde con recursos limitados: el camino de borde usa SigLIP-Base (355 MB) y un experto de acción DiT, lo que reduce los requisitos de cómputo local frente a ejecutar el modelo de mundo completo.
- Base para fine-tuning en nuevas tareas de manipulación: los pesos delta y la separación modular (`video_lora`, `action_expert`) facilitan adaptar la política a otros dominios manteniendo el backbone congelado.
- Estudio de compresión de caché KV: el `cloud_kv_codec` con pooling 7×8 y cuello de botella de 1024 dimensiones es un componente aislable para investigar transmisión eficiente de estado entre modelos.

## Benchmarks y rendimiento

Tasa de éxito en LIBERO (%), media ± desviación estándar de muestra sobre 3 semillas de evaluación (1235/1236/1237), mismo peso de entrenamiento (semilla 42), 2.000 episodios por nivel de retraso:

| D=0 | D=10 | D=20 | D=40 |
|---|---|---|---|
| 89,90 ± 0,53 | 83,53 ± 0,75 | 79,63 ± 0,88 | 69,48 ± 1,08 |

Retención D40/D0: 77,3 %. Los valores ± corresponden a variación entre semillas de evaluación, no a varianza entre semillas de entrenamiento. No se han publicado en la información disponible resultados comparativos con otros modelos en MMLU, HumanEval, GSM8K ni otros benchmarks estándar de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Los activos base suman aproximadamente 14,4 GB en disco (2,0 GB del cabezal DiT + 12 GB del experto de vídeo Fast-WAM + 355 MB de SigLIP-Base), más el backbone Wan2.2 TI2V-5B descargado del Hub.
- GPU recomendadas: no disponibles en la información proporcionada.
- Viabilidad en GPU de consumo: no confirmada; el experto de vídeo de 12 GB y el backbone Wan2.2 de 5B sugieren requisitos superiores a una GPU de consumo típica para el camino de nube, mientras que el camino de borde (SigLIP-Base + experto de acción) podría ser viable en hardware más modesto.
- Opciones de despliegue: el código de inferencia y evaluación se publicará como proyecto de código abierto según el autor; no se detallan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles; el modelo está diseñado precisamente para tolerar latencia de red mediante la caché KV codificada.

## Comparativa con modelos similares

| Modelo | Tipo | Contexto / horizonte | Licencia | Disponibilidad |
|---|---|---|---|---|
| LeapBot-CE — LIBERO | VLA cloud-edge con world model | Horizonte de acción 32 | MIT (pesos); base Apache-2.0 | Hugging Face |
| LeapBot-CE — RoboTwin 2.0 | VLA cloud-edge (mismo autor) | no disponible | no disponible | Hugging Face |
| Wan2.2 TI2V-5B | Modelo de generación vídeo-texto | no disponible | Apache-2.0 | Hugging Face (`Wan-AI/Wan2.2-TI2V-5B`) |
| Fast-WAM | Experto de vídeo (world model) | no disponible | términos originales del release | Activo base incluido |

No se dispone en la información proporcionada de comparativas cuantitativas con otras políticas VLA sobre LIBERO ni con alternativas de la misma categoría.

## Limitaciones y advertencias

- El checkpoint contiene solo pesos delta; requiere los activos base y el backbone Wan2.2 del Hub para funcionar. No es autocontenido.
- El decodificador de la caché KV está desactivado en inferencia (rango 256); su comportamiento con decodificador activo no se documenta.
- La tasa de éxito cae del 89,90 % (D=0) al 69,48 % (D=40), una degradación del 22,7 % en el peor escenario de latencia evaluado.
- Los valores ± publicados son variación entre semillas de evaluación de un único peso de entrenamiento; no reflejan varianza entre entrenamientos.
- No se documentan sesgos conocidos, riesgo de alucinación ni limitaciones idiomáticas, al tratarse de una política de control robótico y no de un modelo de lenguaje conversacional.
- La licencia MIT cubre los pesos y la configuración, pero los activos base conservan sus términos originales: Wan2.2 es Apache-2.0, mientras que Fast-WAM y SigLIP-Base siguen sus releases originales y deben verificarse antes de uso comercial.
- El código de inferencia y evaluación aún no está publicado; la reproducibilidad completa depende de su liberación.
- No se han publicado datos sobre cuantización, por lo que el despliegue en hardware de bajos recursos no está caracterizado.
- El modelo está entrenado y evaluado específicamente en LIBERO; su generalización a otras tareas o dominios robóticos no está documentada.

## Enlaces

- Hugging Face: https://huggingface.co/DaojiePENG/leapbot-ce-libero
- Checkpoint RoboTwin 2.0: https://huggingface.co/DaojiePENG/leapbot-ce-robotwin2
- Backbone Wan2.2 TI2V-5B: https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B
- Tokenizador Wan2.1 T2V-1.3B: https://huggingface.co/Wan-AI/Wan2.1-T2V-1.3B
- Contacto: Daojie Peng, vía discusiones del repositorio de Hugging Face
