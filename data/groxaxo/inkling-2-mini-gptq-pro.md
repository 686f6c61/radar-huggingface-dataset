# groxaxo/Inkling-2-Mini-GPTQ-Pro

## Resumen

Inkling-2-Mini-GPTQ-Pro es una superposición de cuantización selectiva INT4 publicada por el usuario groxaxo sobre el modelo multimodal Inkling-2-Mini de Thinking Machines Lab. No se trata de un modelo entrenado desde cero, sino de un empaquetado de pesos cuantizados que sustituye únicamente las proyecciones de atención de valor y salida en las 24 capas físicas del decodificador, manteniendo el resto de los pesos (encoder de visión, enrutamiento, embeddings y cabeza de lenguaje) en la precisión original del checkpoint fuente.

El modelo base es un transformer multimodal de tipo image-text-to-text con un mecanismo de bucle ("loop") de tres pasadas sobre el decodificador, orientado a tareas de razonamiento iterativo y comprensión conjunta de imagen y texto. La contribución de esta variante es reducir el peso de las proyecciones de atención mediante GPTQ simétrico con tamaño de grupo 64, usando la herramienta GPTQ-Pro del mismo autor, para facilitar su despliegue en GPUs Ampere de consumo.

Es relevante ahora porque demuestra una estrategia de cuantización parcial (solo un subconjunto de proyecciones) que preserva componentes sensibles como el encoder visual y el enrutamiento en BF16, un enfoque útil para quienes quieren ejecutar modelos multimodales grandes en hardware limitado sin degradar en exceso las rutas de visión. El repositorio es pequeño (0,1 GB) porque contiene solo las proyecciones empaquetadas y el cargador, no los pesos completos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal image-text-to-text con bucle de 3 pasadas sobre el decodificador (24 capas físicas) |
| Parametros totales | no disponible (pesos decodificados estimados en ~52 GB en BF16 según la model card) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GPTQ INT4 simétrico, group size 64, solo en proyecciones de atención de valor y salida |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Pesos empaquetados propietarios del overlay + cargador Python; pesos fuente en el checkpoint original de Thinking Machines |

## Arquitectura y entrenamiento

El modelo base Inkling-2-Mini emplea un decodificador transformer con un mecanismo de bucle que realiza tres pasadas sobre las mismas 24 capas físicas, lo que da lugar a 48 visitas al decodificador durante el forward completo (según la validación descrita en la model card). Incorpora un encoder de visión para la ruta image-text-to-text, enrutamiento tipo mixture-of-experts (se mencionan "expert weights" en el proceso de dequantización) y una cabeza de lenguaje separada.

Esta variante no entrena ningún parámetro nuevo: aplica GPTQ simétrico con group size 64 exclusivamente a las proyecciones de valor y salida de atención en las 24 capas, mediante la herramienta GPTQ-Pro (commit `4a1651f80e1f890b6bd6137a8dc1b75f89c2cffb`). La calibración se realizó con 4.096 tokens de entrenamiento de WikiText-2 en formato raw. El cargador dequantiza los pesos de expertos a BF16 para el runtime Ampere y mantiene el encoder de visión, el enrutamiento, los embeddings y la cabeza de lenguaje en la precisión del checkpoint fuente resuelta por Transformers. La decodificación especulativa con DSpark queda explícitamente fuera de la validación. La validación comparó fuente y overlay sobre un split independiente, recorriendo las 48 visitas al decodificador, y registró métricas por proyección en `manifest.json` y métricas de logits held-out más resultados de generación de texto e imagen en `verification.json`.

## Capacidades

- Generación de texto condicionada por imagen (pipeline image-text-to-text): responde preguntas sobre imágenes mediante el flag `--image`.
- Razonamiento iterativo mediante el bucle de tres pasadas del decodificador.
- Generación de texto autoregresiva estándar (probada con prompts como preguntas factuales simples).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible explícitamente; el bucle de pasadas sugiere procesamiento iterativo, pero no se documenta uso agéntico.
- Capacidades multilingües: no disponible.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Preguntas y respuestas sobre imágenes en local: el cargador permite pasar una ruta de imagen junto con una pregunta, ejecutando la ruta image-text completa en dos RTX 3090, adecuado para prototipos de análisis visual sin depender de APIs externas.
- Evaluación de estrategias de cuantización parcial: investigadores pueden comparar el overlay INT4 con el checkpoint fuente BF16 usando los informes `manifest.json` y `verification.json` para medir el impacto de cuantizar solo atención de valor y salida.
- Despliegue en hardware Ampere de gama alta de consumo: al requerir dos RTX 3090 y ~52 GB de RAM de sistema, encaja en estaciones de trabajo con GPUs Ampere duales para experimentación con modelos multimodales.
- Reproducción de pipelines de validación de cuantización: el script `mini_gptqpro.py` sirve como referencia para validar overlays contra checkpoints fuente con splits held-out.
- Investigación sobre arquitecturas con bucle: el modelo conserva las tres pasadas del decodificador, útil para estudiar el efecto de la cuantización en modelos con reutilización de capas.
- Generación de texto con contexto multimodal en entornos controlados: para tareas donde se necesita inspeccionar logits y métricas de fidelidad respecto al modelo original antes de pasar a producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo documenta métricas de validación internas (comparación de logits held-out entre fuente y overlay, y resultados de generación de texto e imagen) sin cifras numéricas en el texto proporcionado.

## Requisitos de hardware

- VRAM estimada: no disponible de forma exacta; el runtime probado usa dos RTX 3090 (24 GB cada una, 48 GB totales) con pesos dequantizados a BF16.
- RAM de sistema: aproximadamente 52 GB para pesos decodificados más sobrecarga de carga, según la model card.
- GPUs recomendadas: RTX 3090 (configuración validada, dos unidades); arquitectura Ampere requerida por el runtime BF16 descrito.
- ¿Cabe en GPU de consumo? Sí, en el sentido de GPUs de consumo profesionales/entusiastas Ampere (RTX 3090), pero requiere dos unidades; no se documenta funcionamiento en una sola GPU de 24 GB ni en GPUs de gama media.
- Opciones de despliegue: cargador propio `mini_gptqpro.py` con Transformers 5.24.0, PyTorch 2.10.0+cu128 y TorchVision 0.25.0+cu128; vLLM, llama.cpp, Ollama o TGI no están documentados para este overlay.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Inkling-2-Mini-GPTQ-Pro (este) | no disponible (~52 GB BF16) | no disponible | GPTQ INT4 selectivo (atención valor/salida) | Apache 2.0 | Hugging Face, requiere checkpoint fuente |
| thinkingmachines/Inkling-2-Mini (base) | no disponible | no disponible | BF16 original | no disponible en la información | Hugging Face (revisión fijada) |
| Alternativas de cuantización INT4 de modelos multimodales | no disponible | no disponible | GPTQ/AWQ estándar | variable | no disponible |

No se dispone de datos de rendimiento comparativo entre este overlay y el modelo base ni con terceros modelos de la misma categoría.

## Limitaciones y advertencias

- El repositorio no contiene los pesos completos: es necesario descargar el checkpoint fuente de Thinking Machines en la revisión `b85c3cfa615fc413cc9af3379f491b963f3b586a` para poder ejecutar el modelo.
- La cuantización solo cubre proyecciones de atención de valor y salida; el resto de pesos se mantiene en BF16, por lo que el ahorro de memoria es parcial y el requisito de ~52 GB de RAM sigue siendo elevado.
- La decodificación especulativa con DSpark no está validada con este overlay.
- El runtime está validado únicamente en Linux con CUDA, dos RTX 3090, Transformers 5.24.0, PyTorch 2.10.0+cu128 y TorchVision 0.25.0+cu128; otras combinaciones no están soportadas oficialmente.
- No se documentan sesgos conocidos, tasas de alucinación ni limitaciones idiomáticas del modelo base en la información proporcionada.
- Licencia Apache 2.0 declarada, lo que en principio permite uso comercial, pero se recomienda verificar la licencia del checkpoint base de Thinking Machines antes de producción.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta, lo que indica ausencia de validación comunitaria independiente.
- Es un artefacto de cuantización, no un modelo entrenado: la calidad final depende enteramente del modelo base y de la fidelidad de la dequantización.

## Enlaces

- Hugging Face del overlay: https://huggingface.co/groxaxo/Inkling-2-Mini-GPTQ-Pro
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Revisión fijada del checkpoint fuente: https://huggingface.co/thinkingmachines/Inkling-2-Mini/tree/b85c3cfa615fc413cc9af3379f491b963f3b586a
- Herramienta GPTQ-Pro: https://github.com/groxaxo/GPTQ-Pro
- Manifiesto de ajuste: `manifest.json` (en el repositorio del overlay)
- Informe de verificación: `verification.json` (en el repositorio del overlay)
