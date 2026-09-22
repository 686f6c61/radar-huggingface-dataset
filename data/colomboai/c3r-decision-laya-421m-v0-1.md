# ColomboAI/C3R-Decision-Laya-421M-v0.1

## Resumen

ColomboAI/C3R-Decision-Laya-421M-v0.1 es el andamiaje de publicación (release scaffold) del denominado C3R System-One fast path, un componente de decisión rápida con calibración y abstención. Lo desarrolla ColomboAI y se apoya en el checkpoint upstream `convaiinnovations/laya`, fijado en la revisión `1c5edc17a7acd8701df6fc341c0d179f1c62c982` y bajo licencia Apache-2.0. El repositorio está etiquetado como `text-classification`, con la librería `laya` y las etiquetas `system-one`, `decision-making`, `calibration` y `c3r`.

Es importante subrayar que la propia model card declara que el directorio no contiene pesos afinados y que no constituye una publicación empírica de modelo. Lo que sí está implementado y probado es el cargador con verificación de revisión y licencia, el adaptador de probabilidades tipadas y el mecanismo de calibración por segmento con abstención. El pipeline de decisión devuelve abstención cuando falta calibración, la confianza es baja o el margen entre las dos clases más probables es reducido.

Su relevancia es metodológica: propone un patrón de integración con frontera de seguridad explícita (Verifier Firewall y Trusted Commit Gateway) y un protocolo de falsación documentado en dos artículos. Al no haber pesos, ni calibración empírica, ni curvas de riesgo selectivo publicadas, no debe tratarse como un modelo listo para producción. El nombre sugiere un tamaño de 421M parámetros, pero la model card no confirma esa cifra.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no documentada en la informacion proporcionada; modelo base `convaiinnovations/laya`) |
| Parametros totales | no disponible en la model card (la nomenclatura del repositorio sugiere 421M) |
| Parametros activos | no aplica (no se describe una arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (no se publican pesos) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible (el repositorio no contiene pesos; tamano declarado del repo: 0.0 GB) |
| Autor | ColomboAI |
| Modelo base | `convaiinnovations/laya` |
| Revision fijada del base | `1c5edc17a7acd8701df6fc341c0d179f1c62c982` |
| Libreria | `laya` (dependencia de integracion `laya==0.3.5`) |
| Pipeline declarado | text-classification |
| Estado de los pesos C3R | no entrenados ni publicados |
| Calibracion empirica | no reclamada todavia |
| Descargas / likes en HuggingFace | 0 / 0 |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna del modelo. El repositorio no contiene pesos propios: la implementación ejecutable carga el checkpoint upstream de Laya, verificando previamente su revisión exacta y su licencia, y a continuación exige una calibración específica por segmento (held-out, slice-specific) antes de emitir una decisión. No hay datos publicados sobre arquitectura del transformer, número de tokens de entrenamiento, composición del dataset, ni sobre el uso de RLHF, DPO u otras técnicas de alineamiento.

El elemento diferencial del planteamiento C3R es el comportamiento selectivo: la salida es una decisión tipada con probabilidades, y el sistema se abstiene cuando falta calibración, cuando la confianza es insuficiente o cuando el margen entre las dos clases más probables es pequeño. La model card fija además una frontera de seguridad explícita: el modelo responde a preguntas tipadas fijas, no concede permisos, no elige su verificador autoritativo, no elude el Verifier Firewall y no ejecuta efectos externos; la autoridad de compromiso reside en el Trusted Commit Gateway. El estado de publicación indica que el cargador verificado, el adaptador de probabilidades y la calibración con abstención están implementados y probados, mientras que los pesos afinados y la evaluación empírica siguen pendientes de los controles documentados (manifiestos de entrenamiento, hashes de pesos, calibración held-out, curvas de riesgo selectivo, evidencia de latencia y coste, y divulgación de ejecuciones fallidas).

## Capacidades

- Clasificación de decisiones tipadas: el componente está diseñado para responder a un conjunto fijo de preguntas tipadas, no para generación abierta de texto.
- Adaptador de probabilidades tipadas: expone una distribución de probabilidad sobre las clases definidas por la aplicación.
- Calibración por segmento: requiere calibración held-out específica de cada segmento antes de decidir.
- Abstención selectiva: devuelve abstención ante ausencia de calibración, baja confianza o margen reducido entre las dos clases más probables.
- Ruta rápida (System-One): orientada a decisiones de baja latencia dentro de un pipeline mayor, no a razonamiento multi-paso.
- Sin tool calling ni function calling: no se documenta soporte de llamada a herramientas.
- Sin capacidades de agente: por diseño, no elige verificadores ni ejecuta efectos externos.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Capacidades especiales (visión, audio, modo thinking, decodificación especulativa): no disponibles.
- Frontera de seguridad: responde únicamente a preguntas tipadas fijas y no puede saltarse el Verifier Firewall.

## Casos de uso

- Enrutado de decisiones de baja latencia en pipelines de agentes: el componente actúa como ruta rápida que decide entre un conjunto cerrado de categorías antes de derivar el caso a un modelo mayor; la abstención permite escalar los casos dudosos en lugar de forzar una respuesta.
- Pre-filtro ante un verificador: se sitúa antes del Verifier Firewall para descartar o confirmar casos con un coste computacional mínimo, dejando que el verificador autoritativo resuelva solo los casos no resueltos.
- Clasificación de intenciones en atención automatizada: con una calibración por segmento (idioma, canal, tipo de cliente), permite encaminar conversaciones a colas especializadas y abstenerse cuando la intención no es clara.
- Moderación y triaje de contenido: clasificación binaria o multiclase con umbral de abstención, de modo que las decisiones de alto riesgo se revisen manualmente en lugar de automatizarse con confianza insuficiente.
- Control de calidad con riesgo selectivo: las curvas de riesgo selectivo (una vez generadas) permitirían fijar un nivel de cobertura objetivo y derivar automáticamente el umbral de abstención en producción.
- Detección de deriva en producción: al comparar la tasa de abstención y el margen de decisión por segmento a lo largo del tiempo, el componente sirve como señal temprana de cambios en la distribución de entrada.
- Sistemas de decisión auditables: la traza de probabilidades tipadas, calibración y abstención facilita la justificación de cada decisión ante auditorías, algo habitual en entornos regulados.
- Prototipado de arquitecturas selectivas: sirve como referencia de integración para equipos que quieran implementar el patrón de calibración más abstención sobre otro modelo base, sustituyendo el checkpoint Laya por el suyo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que la evaluación y la calibración empírica «not yet claimed» no se han reclamado todavía, y que los pesos afinados no han sido entrenados ni publicados.

## Requisitos de hardware

- VRAM para inferencia: no disponible para este repositorio, ya que no contiene pesos utilizables. Cualquier cifra aplicable correspondería al checkpoint upstream de Laya, cuya arquitectura no se documenta en la información proporcionada.
- Estimación orientativa por tamaño (si el modelo base tuviera ~421M parámetros, extremo no confirmado): en fp16 los pesos ocuparían del orden de 0,8-0,9 GB, más activaciones y sobrecarga del runtime; en int8, alrededor de 0,4 GB; en int4, alrededor de 0,2 GB. Son estimaciones aritméticas, no medidas publicadas.
- GPU recomendadas: no disponibles. Por clase de tamaño, un modelo de ~400M parámetros cabría con holgura en GPU de consumo como RTX 3060 12 GB, RTX 4070, RTX 4080 o RTX 4090; para lotes grandes o despliegue concurrente serían preferibles A100, H100 o L40S. No hay evidencia publicada que confirme estos escenarios para este repositorio.
- ¿Cabe en GPU de consumo? No hay pesos publicados, por lo que la pregunta no es verificable en la práctica con este repositorio.
- Opciones de despliegue: la única dependencia declarada es `laya==0.3.5` junto con el checkpoint upstream verificado por revisión. No se documenta compatibilidad con vLLM, llama.cpp, Ollama, TGI, TensorRT-LLM ni otros servidores de inferencia.
- Latencia y throughput: no disponibles. La model card menciona la evidencia de latencia y coste como uno de los controles pendientes antes de publicar un checkpoint futuro.
- Requisitos de almacenamiento: el repositorio ocupa 0.0 GB, coherente con la ausencia de pesos.

## Comparativa con modelos similares

No se identifican en la información proporcionada release comparables del mismo enfoque (decisión calibrada con abstención sobre un modelo base fijado). La comparación siguiente es estructural; los datos del modelo base Laya no están documentados en la información disponible, y las cifras de los otros dos modelos proceden de conocimiento público general, no de la búsqueda realizada.

| Modelo | Parametros | Contexto | Tipo de salida | Licencia | Estado |
|---|---|---|---|---|---|
| C3R-Decision-Laya-421M-v0.1 | no disponible (nomenclatura sugiere 421M) | no disponible | clasificación de decisión con abstención | Apache-2.0 | scaffold sin pesos |
| `convaiinnovations/laya` (base fijado) | no disponible | no disponible | no disponible | Apache-2.0 | checkpoint upstream, revision fijada |
| DeBERTa-v3-base | ~184M (dato público general) | 512 tokens (dato público general) | clasificación / NLU | MIT (dato público general) | disponible |
| ModernBERT-base | ~149M (dato público general) | 8192 tokens (dato público general) | clasificación / NLU | Apache-2.0 (dato público general) | disponible |

Advertencia: la fila correspondiente a este repositorio no es comparable en rendimiento con ninguna de las anteriores porque no existen pesos ni evaluación empírica publicados.

## Limitaciones y advertencias

- No contiene pesos: el repositorio es un andamiaje de publicación; el modelo no es ejecutable como checkpoint propio y no debe presentarse como tal.
- Sin evaluación empírica: no hay calibración, curvas de riesgo selectivo, evidencia de latencia ni divulgación de ejecuciones fallidas; la model card indica que estos controles están pendientes.
- Sesgos conocidos: no disponibles. Al depender del checkpoint upstream de Laya y de calibración por segmento, los sesgos heredados del modelo base y de los datos de calibración no están documentados.
- Riesgo de alucinación: no aplicable en el sentido generativo (la salida es una distribución tipada), pero sí existe riesgo de decisión errónea con confianza mal calibrada si la calibración por segmento es inadecuada o se aplica fuera de su distribución.
- Dependencia de revisión y licencia: el cargador exige verificar la revisión exacta `1c5edc17...` y la licencia del upstream; cualquier cambio de revisión o de licencia en el repositorio base invalida la integración.
- Dependencia de versión: la integración fija `laya==0.3.5`; actualizaciones de la librería pueden romper el comportamiento.
- Idiomas: no disponibles; no se puede asumir cobertura multilingüe.
- Limitaciones de contexto: la longitud de contexto no está documentada.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el despliegue efectivo hereda las condiciones del checkpoint upstream de Laya, que deben verificarse por separado en cada revisión.
- Frontera de seguridad: el componente no concede permisos, no elige su verificador, no elude el Verifier Firewall y no ejecuta efectos externos; usarlo como autoridad de decisión final contradice su diseño declarado.
- Estado de madurez: sin manifiestos de entrenamiento ni hashes de pesos publicados; cualquier uso en producción sería prematuro.
- Los artículos referenciados describen la arquitectura objetivo, cuyo «Definition of Done» es más amplio que esta porción de implementación revisada; el estado de publicación indicado en el repositorio es el que prevalece.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ColomboAI/C3R-Decision-Laya-421M-v0.1
- Modelo base en HuggingFace: https://huggingface.co/convaiinnovations/laya
- Revisión fijada del modelo base: `1c5edc17a7acd8701df6fc341c0d179f1c62c982`
- Articulo completo (38 paginas), alojado en el repositorio: https://huggingface.co/ColomboAI/C3R-Decision-Laya-421M-v0.1/blob/main/C3R_System_One_Integration_v5.pdf
- Preprint academico (10 paginas), alojado en el repositorio: https://huggingface.co/ColomboAI/C3R-Decision-Laya-421M-v0.1/blob/main/C3R_ArXiv_Preprint_v5.pdf
- Identificador arXiv del preprint: no disponible
- Repositorio de codigo de `laya` (v0.3.5): no disponible en la informacion proporcionada
- Demos o espacios asociados: no disponibles
