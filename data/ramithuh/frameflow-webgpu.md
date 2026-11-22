# ramithuh/frameflow-webgpu

## Resumen

FrameFlow (SE(3) Flow Matching) es un modelo de generación de estructuras proteicas desarrollado originalmente por Microsoft Research (repositorio `microsoft/protein-frame-flow`). Este repositorio concreto, publicado por el usuario `ramithuh`, no contiene los pesos originales del modelo, sino una exportación de los mismos en formato fragmentado (sharded) en FP16 e INT8, pensada para ejecutar la inferencia directamente en el navegador mediante WebGPU. Cada fragmento pesa como máximo 25 MB e incluye manifiestos SHA-256 para verificar la integridad de la descarga.

El modelo subyacente emplea flow matching sobre el grupo SE(3) para generar conformaciones tridimensionales de proteínas, un enfoque generativo alternativo a los modelos de difusión clásicos. Esta versión está orientada a su integración en la plataforma denovo.run y en el repositorio `denovo-webgpu-models`, lo que permite ejecutar el modelo sin backend dedicado, directamente en el cliente.

La relevancia de esta ficha radica en que documenta un artefacto de despliegue más que un modelo nuevo: no se publican datos de arquitectura detallados, número de parámetros ni benchmarks propios en la información disponible, y el repositorio tiene 0 descargas y 0 likes en el momento de la consulta. El tamaño total del repositorio es de 0,1 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (upstream: flow matching sobre SE(3), `microsoft/protein-frame-flow`) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP16 e INT8 (pesos fragmentados, shards de <= 25 MB) |
| Idiomas soportados | no disponible |
| Licencia | MIT (FrameFlow upstream) + Apache-2.0 (utilidades OpenFold) |
| Formato de pesos | safetensors fragmentados (sharded) con manifiestos SHA-256 |

## Arquitectura y entrenamiento

La información disponible indica únicamente que el modelo upstream es FrameFlow, un modelo de flow matching sobre el grupo SE(3) para generación de estructuras proteicas, desarrollado por Microsoft. Se apoya en utilidades de OpenFold (licencia Apache-2.0). No se proporcionan datos sobre el número de parámetros, la composición del dataset de entrenamiento, el número de tokens o ejemplos, ni si se aplicaron técnicas de RLHF, DPO u otros ajustes posteriores.

La innovación destacable de este repositorio no está en el modelo en sí, sino en el empaquetado: exportación de los pesos en FP16 e INT8 en fragmentos de tamaño reducido (<= 25 MB) con manifiestos SHA-256, diseñados para inferencia en navegador mediante WebGPU. El autor remite a `README_WEBGPU.md` para detalles de arquitectura, benchmarks de paridad numérica y uso, documento que no está incluido en la información proporcionada.

## Capacidades

- Generación de estructuras proteicas tridimensionales mediante flow matching sobre SE(3) (según el modelo upstream).
- Inferencia en navegador a través de WebGPU, sin necesidad de backend GPU dedicado.
- Carga de pesos fragmentados con verificación de integridad mediante SHA-256.
- Ejecución en dos precisiones: FP16 e INT8.
- No se documentan en la información disponible capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio ni multilingüismo de texto.

## Casos de uso

- Predicción de estructuras proteicas en el navegador: un investigador podría cargar los shards FP16 o INT8 en denovo.run y generar conformaciones sin instalar CUDA ni configurar un entorno local, útil para exploración rápida.
- Docencia y demostraciones interactivas: al ejecutarse en WebGPU, permite mostrar el proceso de generación de estructuras proteicas en una pestaña del navegador durante una clase o seminario.
- Prototipado de pipelines de diseño de proteínas: integración de la generación de conformaciones como paso previo a análisis downstream (puntuación, filtrado, visualización) dentro de una aplicación web.
- Verificación de integridad en distribución de pesos: los manifiestos SHA-256 permiten validar que los shards descargados no se han corrompido, un caso de uso relevante para despliegues reproducibles.
- Evaluación de paridad numérica entre FP16 e INT8: comparar las salidas de ambas precisiones para decidir qué variante usar en producción según el equilibrio precisión/rendimiento.
- Despliegue en entornos con recursos limitados: al no requerir GPU de servidor dedicada, encaja en escenarios donde solo se dispone de un navegador compatible con WebGPU (por ejemplo, portátiles con GPU integrada).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor menciona en la model card la existencia de benchmarks de paridad numérica en `README_WEBGPU.md`, pero dicho documento no se ha proporcionado.

## Requisitos de hardware

- El repositorio completo ocupa 0,1 GB, por lo que los pesos fragmentados caben holgadamente en memoria de cualquier dispositivo moderno.
- Requiere un navegador con soporte de WebGPU (Chrome/Edge en versiones recientes, entre otros).
- VRAM estimada: no disponible de forma explícita; por el tamaño del repositorio (0,1 GB), la huella de pesos es inferior a 1 GB, aunque el consumo real de memoria durante la inferencia no se documenta.
- GPU recomendadas: no disponible. Al ejecutarse en WebGPU, el rendimiento dependerá de la GPU del cliente (integrada o dedicada).
- Despliegue: inferencia en navegador vía WebGPU (denovo.run / denovo-webgpu-models). No se documentan opciones con vLLM, llama.cpp, Ollama o TGI, que además no aplican a un modelo de este tipo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento ni especificaciones de modelos comparables (por ejemplo, otros generadores de estructuras proteicas), por lo que no es posible establecer una comparación fundamentada sin inventar cifras.

## Limitaciones y advertencias

- La información pública es muy escasa: no se documentan parámetros, contexto, idiomas ni benchmarks propios, lo que dificulta evaluar su calidad frente al modelo upstream.
- Es un artefacto de exportación para WebGPU, no un modelo entrenado por el autor del repositorio; la responsabilidad sobre el comportamiento recae en el modelo upstream `microsoft/protein-frame-flow`.
- El repositorio tiene 0 descargas y 0 likes, sin señales de validación comunitaria.
- La licencia combina MIT (FrameFlow) y Apache-2.0 (OpenFold); es necesario revisar los ficheros LICENSE y NOTICE antes de un uso comercial.
- No se documentan sesgos, tasas de alucinación ni limitaciones idiomáticas; al ser un modelo de estructura proteica, el riesgo de alucinación se traduce en conformaciones plausibles pero incorrectas, que deben validarse con métodos experimentales o de puntuación independientes.
- La inferencia depende de WebGPU: navegadores o dispositivos sin soporte no podrán ejecutar el modelo.
- No se especifican requisitos de memoria durante la inferencia ni límites de tamaño de entrada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ramithuh/frameflow-webgpu
- Modelo upstream: `microsoft/protein-frame-flow` (referenciado en la model card)
- Repositorio de despliegue: https://github.com/ramithuh/denovo-webgpu-models
- Plataforma de inferencia: https://denovo.run
