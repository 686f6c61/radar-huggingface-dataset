# reneeice/zils-mini-onejev4b

## Resumen

OneJev-4B es un modelo de decisión multimodal de tipo "System One" desarrollado por el equipo OmniJev (publicado bajo el usuario `reneice` en Hugging Face). Se trata de un ajuste fino completo (full fine-tune) del modelo base Qwen/Qwen3.5-4B, orientado a una tarea muy concreta: dado un estado multimodal (captura de pantalla, foto, vídeo o texto plano) junto con un conjunto de preguntas tipadas, el modelo devuelve una probabilidad calibrada para cada opción en un único forward pass. No es un modelo generativo conversacional al uso, sino un modelo de decisión que puntúa alternativas.

El modelo resuelve el problema de la toma de decisiones rápida y calibrada en agentes autónomos, especialmente agentes de interfaz gráfica (GUI agents). En lugar de generar texto libre y parsearlo, el modelo emite directamente distribuciones de probabilidad sobre opciones discretas (por ejemplo, "click" o "stop"), lo que simplifica la integración en bucles de control de agentes y reduce la latencia. Con 5.174.964.736 parámetros reales según los safetensors, se entrenó sobre 99.193 preguntas extraídas de ejecuciones reales de agentes, vídeos e imágenes.

Su relevancia actual radica en dos factores: por un lado, la creciente demanda de componentes de decisión ligeros y deterministas dentro de arquitecturas de agentes multimodales; por otro, su eficiencia declarada, con 64 ms por pregunta sobre una captura 1280x720 en una H200 y 10,4 ms por pregunta cuando se agrupan diez preguntas en una sola petición. La licencia Apache 2.0 facilita su adopción comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (fine-tune completo de Qwen3.5-4B) |
| Parámetros totales | 5.174.964.736 |
| Parámetros activos | no disponible (no es MoE según la información proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GGUF (build Q8_0 disponible vía mradermacher); FP8 disponible solo en la variante OneJev-27B-FP8 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 10,4 GB), GGUF |

## Arquitectura y entrenamiento

OneJev-4B parte de Qwen/Qwen3.5-4B, un transformer multimodal con capacidad de entrada image-text-to-text, y se somete a un ajuste fino completo. La innovación principal no está en la arquitectura base, sino en la interfaz de salida: el modelo no genera texto libre, sino que produce, en un único forward pass, una probabilidad calibrada por cada opción de un conjunto de preguntas tipadas. La API asociada (TypeSafe System One API, extendida con un campo `media` para imágenes y vídeo) define tipos como `Choice` (elección entre opciones) y `Noul` (pregunta booleana de sí/no).

El entrenamiento se realizó sobre 99.193 preguntas procedentes de ejecuciones reales de agentes, vídeos e imágenes, según el dataset OmniJev/OneJev-Data. El conjunto de test del modelo contiene tipos de pregunta que ningún modelo vio durante el entrenamiento, lo que sugiere una evaluación orientada a la generalización entre tipos de decisión. No se especifican en la información disponible el número total de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO; el enfoque declarado es de calibración de probabilidades, lo que implica objetivos de entrenamiento supervisado orientados a la calibración, aunque su formulación exacta no está documentada.

## Capacidades

- Decisión multimodal calibrada: devuelve probabilidades por opción a partir de capturas de pantalla, fotos, vídeo o texto plano.
- Preguntas tipadas: soporta preguntas de elección (`Choice`) y booleanas (`Noul`) definidas por el desarrollador.
- Procesamiento de vídeo e imagen en un mismo pipeline (el vídeo requiere el servidor PyTorch; en llama.cpp solo funciona imagen).
- Razonamiento de agente GUI: pensado para decidir la siguiente acción de un agente sobre una interfaz (por ejemplo, "click" o "stop").
- Multitud de preguntas en una sola petición: permite agrupar hasta diez preguntas en una request con latencia agregada baja.
- Integración mediante API: servidor compatible con la System One API de TypeSafe, con campo `media` para adjuntar imágenes y vídeo.
- Despliegue sin PyTorch: build GGUF para llama.cpp (imagen soportada, vídeo no).
- No se documentan capacidades de generación de texto libre, código, matemáticas ni tool calling en el sentido clásico.

## Casos de uso

- Agentes de automatización de interfaz gráfica: el modelo recibe una captura de pantalla y un estado de tarea ("Pagar la factura abierta de ACME") y devuelve la probabilidad de que la tarea esté completada y de la siguiente acción a ejecutar ("click" o "stop"), integrándose en el bucle de control del agente con latencias de decenas de milisegundos.
- Verificación de estado en pipelines RPA: en lugar de reglas heurísticas, se consulta al modelo si una condición visual se cumple (`Noul`) antes de avanzar a la siguiente etapa del flujo automatizado.
- Enrutamiento de decisiones en asistentes multimodales: dado un vídeo o una imagen y varias opciones de respuesta, el modelo puntúa cada alternativa y el sistema elige la de mayor probabilidad, reduciendo la necesidad de parsear texto generado.
- Control de calidad en capturas y fotos: preguntas booleanas calibradas sobre presencia de elementos, estados de UI o contenido visual, útiles para validación automática de pantallas en pruebas end-to-end.
- Moderación y clasificación visual ligera: usar las probabilidades calibradas por opción como señal de confianza para decidir si se escala a revisión humana.
- Investigación en calibración de modelos: el modelo y su conjunto de test con tipos de pregunta no vistos en entrenamiento sirven como banco de pruebas para estudiar calibración multimodal y generalización entre tipos de decisión.
- Decisión de parada en agentes autónomos: la pregunta `Noul` "la tarea está completada" permite al agente detenerse de forma fiable antes de ejecutar acciones redundantes o peligrosas.

## Benchmarks y rendimiento

La model card menciona una tabla de resultados comparando OneJev-4B con Jev 1.13, Jev-Omni 12B y Qwen3.8-27B thinking, con precisión en porcentaje sobre un test set de tipos de pregunta no vistos en entrenamiento, pero los valores numéricos están en una imagen (`assets/results.svg`) y no se han proporcionado en la información disponible. Por tanto:

No se han publicado resultados de benchmarks numéricos en la información disponible.

Sí se documentan métricas de latencia: en una H200 con captura de 1280x720, 64 ms por pregunta individual y 104 ms para diez preguntas en una sola petición (10,4 ms por pregunta).

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (safetensors, ~10,4 GB de pesos): aproximadamente 12-14 GB contando overhead de activaciones y contexto.
- En cuantización GGUF Q8_0: en torno a 6-7 GB de VRAM/RAM, desplegable en GPUs consumer de gama alta (RTX 3090, RTX 4090) y en muchas configuraciones con CPU.
- GPU recomendadas: H200 (medición oficial), A100 y H100 para producción con vídeo; RTX 4090/3090 para imagen y texto.
- Cabe en GPU consumer: sí, especialmente con el build GGUF Q8_0; en FP16 requiere GPUs con al menos 16 GB de VRAM.
- Opciones de despliegue: servidor `qev serve` (PyTorch, soporta imagen y vídeo) y llama.cpp mediante GGUF (solo imagen, sin vídeo).
- Latencia y throughput: 64 ms por pregunta individual y 10,4 ms por pregunta con batching de diez, medidos en H200 con captura 1280x720. No se documentan métricas para otras GPUs.

## Comparativa con modelos similares

| Modelo | Base | Parámetros | Pesos | Contexto | Licencia | Enfoque |
|---|---|---|---|---|---|---|
| OneJev-4B | Qwen3.5-4B | 5.174.964.736 | 10,4 GB | no disponible | Apache 2.0 | Decisión multimodal calibrada |
| OneJev-0.8B | Qwen3.5-0.8B | no disponible | 2,2 GB | no disponible | Apache 2.0 | Decisión multimodal calibrada |
| OneJev-9B | Qwen3.5-9B | no disponible | 18,8 GB | no disponible | Apache 2.0 | Decisión multimodal calibrada |
| OneJev-27B | Qwen3.8-27B | no disponible | 54,7 GB | no disponible | Apache 2.0 | Decisión multimodal calibrada |
| Jev 1.13 | no disponible | no disponible | no disponible | no disponible | no disponible | Decisión solo texto |
| Jev-Omni 12B | no disponible | no disponible | no disponible | no disponible | no disponible | Decisión multimodal |

La comparativa más directa es con las otras tallas de la propia familia OneJev, que cubren desde 0,8B hasta 27B con la misma interfaz de decisión. Frente a Jev 1.13 y Jev-Omni 12B, la model card reporta comparaciones de precisión, pero sin valores numéricos accesibles en la información disponible. No se dispone de datos de contexto ni de rendimiento detallado de los competidores.

## Limitaciones y advertencias

- Modelo de decisión, no generativo: no está diseñado para generar texto libre, código ni mantener conversaciones; su salida son probabilidades sobre opciones predefinidas.
- Idiomas soportados no documentados: no se especifica cobertura multilingüe, por lo que el uso en castellano u otros idiomas distintos del inglés no está garantizado.
- Longitud de contexto no disponible: se desconoce el máximo de tokens manejable, lo que dificulta planificar entradas con muchas preguntas o estados extensos.
- Riesgo de calibración degradada fuera de distribución: aunque el test set incluye tipos de pregunta no vistos, no se documenta el comportamiento ante dominios visuales muy distintos de los de entrenamiento (por ejemplo, capturas de aplicaciones de nicho).
- Dependencia de la interfaz tipada: la integración requiere definir las preguntas y opciones de antemano; no es un modelo plug-and-play para tareas abiertas.
- Vídeo no soportado en llama.cpp: el despliegue sin PyTorch limita la entrada a imágenes.
- Sin datos de sesgos: no se documentan sesgos conocidos ni evaluaciones de robustez; conviene auditar en producción.
- Licencia Apache 2.0: permisiva para uso comercial, pero el modelo base Qwen3.5-4B puede tener sus propias condiciones que conviene revisar.
- Ecosistema joven: 0 descargas y 0 likes en el momento de la consulta, y dependencia de un paquete (`qev`) instalado desde GitHub, lo que implica menor madurez de tooling y soporte.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/reneeice/zils-mini-onejev4b
- Colección OneJev: https://huggingface.co/collections/OmniJev/onejev
- Demo (Gradio): https://huggingface.co/spaces/BradNLP/OneJev
- Repositorio GitHub: https://github.com/OmniJev/OneJev
- Sitio web: https://omnijev.github.io/OneJev/
- Dataset de entrenamiento: https://huggingface.co/datasets/OmniJev/OneJev-Data
- Licencia: https://github.com/OmniJev/OneJev/blob/main/LICENSE
- Build GGUF (mradermacher): https://huggingface.co/mradermacher/OneJev-4B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- OneJev-0.8B: https://huggingface.co/OmniJev/OneJev-0.8B
- OneJev-9B: https://huggingface.co/OmniJev/OneJev-9B
- OneJev-27B: https://huggingface.co/OmniJev/OneJev-27B
- OneJev-27B-FP8: https://huggingface.co/OmniJev/OneJev-27B-FP8
