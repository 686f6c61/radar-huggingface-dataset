# OmniJev/OneJev1.5g-31B

## Resumen

OneJev1.5g-31B es un modelo multimodal de decisión de "Sistema Uno" desarrollado por OmniJev y construido como un fine-tuning de google/gemma-4-31B-it. A diferencia de los modelos generativos convencionales, no produce texto libre: recibe un estado (una captura de pantalla, una foto o texto plano) junto con un conjunto de preguntas tipadas y devuelve, en un único forward pass, una probabilidad calibrada para cada opción posible. Está pensado como componente de decisión dentro de agentes, en particular agentes de interfaz gráfica (GUI agents).

El modelo cuenta con 31.273.086.512 parámetros (aproximadamente 31B) y hereda la arquitectura, la ventana de contexto y las capacidades multilingües de su base Gemma 4. Su interés radica en el enfoque: en lugar de generar una respuesta y parsearla, expone directamente una distribución de probabilidad sobre opciones definidas por el usuario, lo que facilita la calibración y la integración en bucles de control de agentes. La licencia es Apache 2.0 y los pesos se distribuyen en formato safetensors compatibles con transformers.

La relevancia actual viene del auge de los agentes autónomos que operan sobre interfaces: en esos entornos, saber "cuánto de probable es que la tarea esté hecha" o "qué acción conviene ejecutar a continuación" es más útil que una generación abierta. El modelo está etiquetado como decision-model, calibration y gui-agent, y se sirve a través de la herramienta Flide, que implementa la System One API de TypeSafe.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (heredada de google/gemma-4-31B-it); no se detalla en la model card |
| Parametros totales | 31.273.086.512 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura interna más allá de indicar que se trata de un modelo multimodal derivado de google/gemma-4-31B-it, con pipeline image-text-to-text. Se desconoce si el backbone es un transformer denso o híbrido, el número de tokens de entrenamiento, la composición del dataset y si se emplearon técnicas de alineación como RLHF o DPO. Tampoco se especifican innovaciones técnicas propias más allá del paradigma de decisión.

La innovación declarada es el formato de salida: el modelo se presenta como un "System One decision model" que, dada una descripción del estado y un conjunto de preguntas tipadas (por ejemplo, `noul` para probabilidad de sí/no, `choice` para distribución sobre opciones, `score` para nivel esperado), devuelve probabilidades calibradas en un solo forward pass. El autor incluye la etiqueta `calibration`, lo que sugiere que el ajuste fino se orientó a que las probabilidades emitidas sean interpretables como confianzas, aunque no se aportan detalles del procedimiento de entrenamiento ni métricas de calibración.

## Capacidades

- Decisión multimodal: acepta imágenes (capturas de pantalla, fotos) y texto como estado de entrada.
- Salida de probabilidades calibradas por opción en un único forward pass, sin generación autoregresiva de texto.
- Preguntas tipadas: soporta al menos los tipos `noul` (probabilidad de sí), `choice` (distribución sobre criterios definidos) y `score` (nivel esperado sobre una escala de criterios).
- Orientación a agentes GUI: las preguntas de ejemplo cubren acciones como hacer clic, escribir, desplazar o detener, así como estimar el progreso de una tarea.
- Capacidades heredadas de Gemma 4: al estar construido sobre google/gemma-4-31B-it, se presume que conserva razonamiento, código, matemáticas y capacidades multilingües de la base, aunque la model card no las documenta explícitamente para este fine-tuning.
- Integración con la System One API a través de Flide, con un campo `media` para imágenes.
- Compatibilidad con endpoints (etiqueta `endpoints_compatible`) y con la librería transformers.

## Casos de uso

- Agentes de automatización de escritorio: el modelo recibe una captura de pantalla y devuelve la probabilidad de cada acción posible (clic, tecleo, scroll, parada), lo que permite construir políticas de agente con umbrales de confianza explícitos.
- Verificación de finalización de tareas: con una pregunta de tipo `noul` ("¿se ha pagado la factura?"), el modelo proporciona la probabilidad de que el objetivo esté cumplido, útil como condición de parada en bucles de agente.
- Estimación de progreso: mediante preguntas de tipo `score`, se puede monitorizar cuánto falta para completar un flujo multi-paso y decidir si continuar, reintentar o escalar a un humano.
- Enrutamiento y selección de herramientas: con preguntas de tipo `choice` sobre un conjunto de herramientas o APIs, el modelo actúa como clasificador de intención multimodal con probabilidades por clase.
- Control de calidad en pipelines RPA: antes de ejecutar una acción automatizada sobre una interfaz, el modelo evalúa la probabilidad de que la pantalla esté en el estado esperado, reduciendo errores en producción.
- Asistentes de accesibilidad: dado el estado visual de una aplicación, el modelo puede puntuar opciones de siguiente paso para guiar a un usuario con dificultades visuales o motoras.
- Evaluación de agentes: al devolver probabilidades calibradas, sirve como juez o componente de anotación para medir el rendimiento de otros agentes en entornos simulados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (BF16): aproximadamente 62 GB solo para pesos, más overhead de activaciones y del codificador visual; se requiere al menos una GPU de 80 GB (A100 80GB, H100 80GB) para un despliegue cómodo.
- Para cuantización a 8 bits, la huella de pesos baja a unos 31 GB, viable en una RTX 5090 (32 GB) o A6000 (48 GB), aunque la model card no confirma qué formatos de cuantización están soportados.
- En 4 bits, los pesos ocuparían unos 16 GB, lo que permitiría ejecución en GPUs de consumo como RTX 4090 (24 GB), siempre que existan pesos cuantizados compatibles, algo que no se documenta.
- Opciones de despliegue: el autor recomienda `flide serve --model OmniJev/OneJev1.5g-31B`, que expone la System One API; también es compatible con transformers. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Salida | Licencia |
|---|---|---|---|---|---|
| OneJev1.5g-31B | 31,3B | no disponible | imagen + texto | probabilidades calibradas por opción | Apache 2.0 |
| google/gemma-4-31B-it | ~31B (no confirmado en la informacion) | no disponible | imagen + texto | texto generativo | términos de Gemma (no confirmado) |
| Modelos GUI-agent generativos (p. ej. variantes de Qwen-VL ajustadas) | variable | variable | imagen + texto | texto/acción serializada | variable |

La comparación directa con alternativas de la misma categoría (modelos de decisión con salida probabilística) no está disponible en la información proporcionada. Frente a un modelo generativo multimodal, la diferencia clave es el formato de salida: OneJev no genera texto, sino una distribución sobre opciones definidas por el llamador, lo que simplifica el parseo y permite umbrales de confianza.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos, tasas de alucinación ni evaluación de calibración; la etiqueta `calibration` no viene acompañada de métricas verificables.
- No se especifican los idiomas soportados ni el comportamiento fuera del inglés en las preguntas de ejemplo.
- El modelo está diseñado para un formato de preguntas tipadas concreto; un uso fuera de ese contrato (generación libre) no está soportado ni documentado.
- No se detalla el proceso de entrenamiento ni los datos utilizados, lo que dificulta evaluar riesgos de sobreajuste a entornos GUI específicos.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado en noviembre de 2026; se trata de un lanzamiento muy reciente y sin validación comunitaria.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones de la licencia del modelo base google/gemma-4-31B-it, que puede imponer restricciones adicionales.
- El despliegue en precisión completa exige GPUs de 80 GB; no hay confirmación de pesos cuantizados, lo que limita el uso en hardware de consumo.
- No se aportan datos de latencia ni throughput, relevantes para bucles de agente en tiempo real.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OmniJev/OneJev1.5g-31B
- Perfil del autor: https://huggingface.co/OmniJev
- Repositorio GitHub: https://github.com/OmniJev/OneJev
- Web del proyecto: https://omnijev.github.io/OneJev/
- Herramienta Flide: https://github.com/OmniJev/Flide
- Licencia: https://github.com/OmniJev/OneJev/blob/main/LICENSE
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
