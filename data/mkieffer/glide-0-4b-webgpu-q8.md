# mkieffer/GLiDE-0.4B-WebGPU-Q8

## Resumen

GLiDE-0.4B-WebGPU-Q8 es una conversión empaquetada del modelo base fastino/GLiDE-0.4B, un modelo de decisión y clasificación construido sobre una arquitectura ModernBERT y orientado a tareas de clasificación de texto. Esta variante concreta, publicada por el usuario mkieffer, no es un modelo nuevo entrenado desde cero, sino un export del checkpoint original de Fastino (revisión 6bda7ab) reempaquetado con proyecciones de 8 bits en disposición tiled y embeddings de tokens en FP16, con el objetivo de ejecutarse en el navegador mediante WebGPU.

El problema que resuelve es el despliegue de un clasificador de aproximadamente 0,4 mil millones de parámetros en el cliente, sin depender de servidores, con un peso total de unos 469 MB. La model card cita como caso de uso principal el Space "Patient Messages Classification", que puntúa mensajes de pacientes directamente en el dispositivo usando WebGPU.

Es relevante ahora porque demuestra un patrón de distribución de modelos pequeños cuantizados para inferencia on-device en navegador, un nicho en crecimiento para aplicaciones de clasificación sensibles a la privacidad. La información pública disponible es escasa: no se detallan datos de entrenamiento, benchmarks ni composición del dataset original.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ModernBERT (modelo de decisión/clasificación) |
| Parámetros totales | aproximadamente 0,4 mil millones (según nombre del modelo base) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q8 en proyecciones (8 bits, layout tile16) y embeddings FP16 |
| Idiomas soportados | no disponible |
| Licencia | Fastino Community License (license_name: fastino-community) |
| Formato de pesos | weights.bin con índices webgpu.json e index.json (runtime Rust nativo) |

## Arquitectura y entrenamiento

El modelo base fastino/GLiDE-0.4B emplea una arquitectura ModernBERT, según las etiquetas del repositorio. ModernBERT es una familia de encoders transformer con atención de contexto largo y mejoras de eficiencia frente a BERT clásico. El modelo está etiquetado como "decision-model" y "classification", lo que indica que su propósito es emitir decisiones o puntuaciones de clasificación más que generar texto libre.

Esta variante concreta no aporta información sobre el entrenamiento original: no se especifican tokens de entrenamiento, composición del dataset, ni si hubo RLHF o DPO. La innovación técnica documentada es exclusivamente de empaquetado e inferencia: exportación con `--layout tile16 --weight-bits 8 --embeddings f16` mediante glide-rs-webgpu (revisión 11d15bc), generando un `weights.bin` de 469.024.768 bytes y dos ficheros de índice (`webgpu.json` para la geometría de buffers GPU e `index.json` para el runtime Rust nativo) que describen el mismo binario.

## Capacidades

- Clasificación y toma de decisiones sobre texto (etiqueta "decision-model" y "classification").
- Puntuación de mensajes, ejemplificada en el Space de clasificación de mensajes de pacientes.
- Inferencia on-device en navegador mediante WebGPU.
- Ejecución con runtime nativo en Rust a través de `index.json`.
- No se documentan capacidades de generación de texto, razonamiento multi-paso, código, matemáticas, visión, audio, tool calling ni agentes.
- Cobertura multilingüe: no disponible.

## Casos de uso

- Clasificación de mensajes de pacientes en el cliente: el Space de referencia puntúa mensajes sanitarios directamente en el navegador con WebGPU, evitando enviar datos clínicos a un servidor.
- Triaje de tickets de soporte en aplicaciones web: un clasificador de 0,4B empaquetado en 469 MB puede puntuar y enrutar incidencias sin backend, manteniendo el texto del usuario en el dispositivo.
- Moderación de contenido en el navegador: al ejecutarse con WebGPU, permite filtrar o etiquetar texto introducido por el usuario antes de enviarlo a un servicio.
- Enrutamiento de formularios y encuestas: clasificación local de respuestas abiertas para decidir el flujo de la aplicación.
- Preetiquetado en herramientas de anotación: el modelo puede sugerir etiquetas on-device para revisión humana, reduciendo costes de inferencia en servidor.
- Aplicaciones offline o de baja conectividad: al no requerir llamadas a API, es adecuado para entornos con red limitada o requisitos de privacidad estrictos.
- Prototipado rápido en el navegador: integración mediante el runtime Rust nativo con `index.json` para validar un pipeline de clasificación antes de moverlo a producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Peso de los pesos: 469.024.768 bytes (aproximadamente 469 MB), según la model card.
- VRAM estimada: no disponible de forma explícita; el tamaño del binario sugiere un consumo de memoria del orden de 0,5 GB para los pesos, más overhead de buffers WebGPU.
- GPU recomendadas: no disponible; el requisito es un navegador con soporte WebGPU y una GPU compatible.
- Cabe en GPU consumer: previsiblemente sí, dado el tamaño de 0,4B y los 469 MB de pesos, aunque no se documentan modelos concretos.
- Opciones de despliegue: WebGPU en navegador con `webgpu.json` y runtime Rust nativo con `index.json` (glide-rs-webgpu).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato / despliegue |
|---|---|---|---|---|
| GLiDE-0.4B-WebGPU-Q8 (este) | ~0,4B | no disponible | Fastino Community | weights.bin + WebGPU / Rust |
| fastino/GLiDE-0.4B (base) | ~0,4B | no disponible | Fastino Community | no disponible |
| Alternativas de clasificación tipo ModernBERT | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento ni de especificaciones detalladas de alternativas comparables en la información proporcionada.

## Limitaciones y advertencias

- Información pública muy limitada: no hay datos de entrenamiento, idiomas, contexto ni benchmarks.
- No es un modelo generativo: está orientado a clasificación y decisión, por lo que no debe usarse para tareas de generación de texto.
- Riesgo de alucinación no evaluable sin benchmarks; al ser un clasificador, el riesgo principal es la calibración incorrecta de puntuaciones.
- Sesgos desconocidos: al no documentarse el dataset de entrenamiento, no se pueden evaluar sesgos por dominio, idioma o demografía.
- Licencia Fastino Community: es necesario revisar el fichero LICENSE para conocer las restricciones de uso comercial; la licencia se etiqueta como "other".
- Atribución obligatoria: el fichero NOTICE y la licencia MIT de Ettin encoder 400m preservan la atribución upstream, que debe mantenerse.
- Dependencia de WebGPU: el despliegue en navegador requiere soporte WebGPU del cliente; la disponibilidad varía según navegador y plataforma.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso en producción ni validación comunitaria.
- Fecha de creación indicada como 2026-11-20, posterior a la fecha actual; conviene verificar la procedencia y vigencia del repositorio.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mkieffer/GLiDE-0.4B-WebGPU-Q8
- Modelo base: https://huggingface.co/fastino/GLiDE-0.4B
- Revisión del modelo base usada: https://huggingface.co/fastino/GLiDE-0.4B/tree/6bda7ab91aeb36dcad6d27828a8871e548c7fc71
- Space de clasificación de mensajes de pacientes: https://huggingface.co/spaces/mkieffer/patient-messages-classification
- Runtime glide-rs-webgpu: https://github.com/mkieffer1107/glide-rs-webgpu/tree/11d15bc0f7992c34255e4bc00273ea90b3dfcef3
- Licencia Ettin encoder 400m: https://huggingface.co/mkieffer/GLiDE-0.4B-WebGPU-Q8/blob/main/licenses/Ettin-encoder-400m-LICENSE
