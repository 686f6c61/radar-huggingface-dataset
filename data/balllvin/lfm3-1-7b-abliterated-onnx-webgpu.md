# balllvin/LFM3-1.7B-Abliterated-ONNX-WebGPU

## Resumen

LFM3-1.7B-Abliterated-ONNX-WebGPU es una conversión a formato ONNX del modelo balllvin/LFM3-1.7B-Abliterated-NVFP4, un derivado "abliterated" (es decir, con las direcciones de rechazo eliminadas mediante edición de pesos) del modelo LFM3 de 1.700 millones de parámetros de Liquid AI. La conversión está orientada a la ejecución en navegador mediante ONNX Runtime Web con el backend WebGPU, lo que permite inferencia de generación de texto directamente en el cliente sin servidor. El autor del artefacto es el usuario de Hugging Face "balllvin", no Liquid AI.

El modelo resuelve el problema de desplegar un LLM conversacional pequeño en entornos web sin infraestructura de GPU dedicada, aprovechando la aceleración WebGPU disponible en navegadores modernos. Es relevante para desarrolladores que quieran prototipar aplicaciones de chat o agentes ligeros que se ejecuten íntegramente en el dispositivo del usuario, con las ventajas de privacidad y coste cero de servidor que ello implica, aunque con las limitaciones de rendimiento y compatibilidad propias de WebGPU.

La información pública disponible es muy escasa: el repositorio no incluye model card descriptiva, no se han publicado benchmarks ni detalles de entrenamiento, y el acceso está restringido (gated). Los datos que se ofrecen a continuación proceden exclusivamente de los metadatos del repositorio y de la información del modelo base declarado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base LFM3 de Liquid AI; arquitectura exacta no confirmada en la informacion proporcionada) |
| Parametros totales | 1.700 millones (según el nombre del modelo) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | ONNX (formato de despliegue); el modelo base declarado es NVFP4, lo que sugiere cuantización de 4 bits en el origen |
| Idiomas soportados | no disponible |
| Licencia | lfm1.0 (etiqueta del repositorio: license:other) |
| Formato de pesos | ONNX (onnxruntime, onnxruntime-web, backend WebGPU) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna, los datos de entrenamiento, el número de tokens procesados ni las técnicas de alineación (RLHF, DPO) empleadas en el modelo base LFM3-1.7B de Liquid AI, más allá de lo que pueda inferirse del propio nombre del modelo. El artefacto aquí descrito es una conversión técnica: parte de balllvin/LFM3-1.7B-Abliterated-NVFP4, una variante con edición de pesos para eliminar comportamientos de rechazo, y la exporta a ONNX para su ejecución con ONNX Runtime Web sobre WebGPU.

La innovación destacable no reside en el entrenamiento sino en el pipeline de despliegue: el uso de ONNX Runtime Web con backend WebGPU permite ejecutar el grafo del transformer en la GPU del navegador del usuario, evitando el envío de datos a un servidor. El tamaño del repositorio (1,4 GB) es coherente con un modelo de 1.700 millones de parámetros cuantizado, aunque no se detalla la precisión exacta de los pesos ONNX exportados.

## Capacidades

- Generación de texto conversacional (pipeline text-generation).
- Modo conversacional multi-turno, según la etiqueta "conversational" del repositorio.
- Ejecución en navegador mediante ONNX Runtime Web y WebGPU.
- Inferencia local en el cliente, sin dependencia de servidor.
- Capacidades de tool calling, agentes, visión o audio: no disponibles en la información proporcionada.
- Soporte multilingüe: no disponible.
- Modo thinking o razonamiento explícito: no disponible.

## Casos de uso

- Chat de asistencia en el navegador: el modelo puede gestionar conversaciones multi-turno ejecutándose íntegramente en el cliente vía WebGPU, lo que elimina costes de servidor y mantiene la conversación en el dispositivo del usuario.
- Prototipado rápido de aplicaciones LLM sin backend: desarrolladores que quieran validar una idea de producto conversacional pueden cargar el modelo ONNX en una página web sin aprovisionar GPUs.
- Aplicaciones con requisitos de privacidad: al no enviar datos a un servidor, encaja en escenarios donde el texto del usuario no debe salir del navegador (por ejemplo, borradores personales o asistencia interna sensible).
- Demos educativas y workshops: permite mostrar el funcionamiento de un transformer generativo en vivo dentro del navegador, sin instalación de dependencias pesadas.
- Asistentes offline o de baja conectividad: una vez descargado el modelo, la inferencia puede funcionar sin conexión en entornos controlados.
- Pruebas de concepto de agentes ligeros: combinado con APIs del navegador, puede servir para experimentar con flujos de decisión simples en el cliente.
- Evaluación de la variante "abliterated": investigadores interesados en estudiar el efecto de la edición de pesos sobre el comportamiento de rechazo pueden usar este artefacto como referencia ejecutable en web.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el tamaño del repositorio es de 1,4 GB, lo que da una cota inferior aproximada del espacio necesario para los pesos.
- GPU recomendadas: no disponibles; al ejecutarse vía WebGPU, depende de la GPU integrada o dedicada del equipo del usuario y del soporte del navegador.
- Compatibilidad con GPU de consumo: probable en equipos con WebGPU funcional (Chrome/Edge recientes), aunque no se confirma ningún modelo concreto.
- Opciones de despliegue: ONNX Runtime Web con backend WebGPU; también podría ejecutarse con onnxruntime nativo, aunque no se documenta.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| LFM3-1.7B-Abliterated-ONNX-WebGPU | 1,7 B | no disponible | ONNX (WebGPU) | lfm1.0 | Conversión web de una variante abliterated; acceso restringido |
| LFM3-1.7B (Liquid AI, original) | 1,7 B | no disponible | safetensors (habitual) | lfm1.0 | Modelo base oficial; sin edición de pesos |
| Otros LLM pequeños para navegador (p. ej. variantes ONNX de modelos ~1-3 B) | 1-3 B | variable | ONNX / GGUF | variable | Ecosistema en expansión; comparación cuantitativa no disponible |

No se dispone de datos de rendimiento comparativo en la información proporcionada.

## Limitaciones y advertencias

- Acceso restringido (gated): es necesario aceptar condiciones en Hugging Face antes de descargar el modelo.
- Ausencia de model card: no hay documentación sobre entrenamiento, sesgos, idiomas ni evaluación, lo que dificulta una validación rigurosa.
- Variante "abliterated": la eliminación de direcciones de rechazo puede aumentar la probabilidad de generar contenido inapropiado o dañino; no se recomienda su uso en producción orientada al público sin filtros adicionales.
- Licencia lfm1.0: conviene revisar los términos exactos antes de cualquier uso comercial, dado que el repositorio la etiqueta como "other".
- Dependencia de WebGPU: la compatibilidad varía según navegador, sistema operativo y GPU; el rendimiento puede degradarse o fallar en equipos sin soporte.
- Riesgo de alucinación: inherente a modelos de este tamaño, agravado por la falta de benchmarks publicados.
- Contexto e idiomas desconocidos: no se puede garantizar un comportamiento adecuado en castellano ni en conversaciones largas.
- Repositorio sin descargas ni likes: no hay evidencia de uso comunitario ni de validación por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/balllvin/LFM3-1.7B-Abliterated-ONNX-WebGPU
- Modelo base declarado: https://huggingface.co/balllvin/LFM3-1.7B-Abliterated-NVFP4
- ONNX Runtime Web: https://onnxruntime.ai/docs/tutorials/web/
- WebGPU: https://developer.mozilla.org/es/docs/Web/API/WebGPU_API
- Liquid AI (desarrollador del LFM3 original): https://www.liquid.ai/
