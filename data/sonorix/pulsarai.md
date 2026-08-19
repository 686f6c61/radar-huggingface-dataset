# Sonorix/PulsarAi

## Resumen

Pulsar 1.0 beta es un agente conversacional ligero desarrollado por Sonorix y publicado bajo el identificador Sonorix/PulsarAi en Hugging Face. No se trata de un modelo de lenguaje de gran escala, sino de un agente basado en reglas y búsqueda de palabras clave sobre una base de conocimiento en formato JSONL, con una interfaz web en JavaScript puro. El proyecto está diseñado para ejecutarse localmente en un navegador sin dependencias ni compilación, y su pipeline declarado es text-classification, aunque en la práctica funciona como un sistema de recuperación de respuestas predefinidas.

La relevancia actual del proyecto reside en su enfoque de agente local y ligero, con modos de razonamiento simulado (pensamiento paso a paso) y gestión de archivos, orientado a usuarios que necesitan un asistente conversacional sin infraestructura de servidor. No obstante, carece de las capacidades generativas de un modelo de lenguaje moderno, y su alcance se limita a respuestas planteadas de antemano. La ficha técnica refleja esta naturaleza, indicando "no disponible" en los parámetros que no aplican a un sistema de este tipo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sistema basado en reglas con búsqueda de palabras clave sobre base JSONL (no es un modelo neuronal) |
| Parametros totales | no disponible (no aplica, no hay pesos entrenados) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (depende del navegador y de la base de conocimiento) |
| Tipos de cuantizacion | no disponible (no aplica) |
| Idiomas soportados | ruso (ru) |
| Licencia | MIT |
| Formato de pesos | no aplica (el codigo se distribuye como HTML, CSS, JS y JSONL) |

## Arquitectura y entrenamiento

El proyecto no emplea una arquitectura de transformer, SSM ni ninguna red neuronal. Consiste en un agente determinista que, ante una consulta del usuario, extrae palabras clave y las compara con el campo `keywords` de cada entrada en un archivo `knowledge.jsonl`. Si encuentra coincidencia, selecciona aleatoriamente una respuesta del array `responses` asociado; si no, devuelve un fallback genérico. No existe entrenamiento en el sentido de aprendizaje automático: la "base de conocimiento" se edita manualmente añadiendo líneas JSONL. El modo de pensamiento es una simulación que muestra el análisis paso a paso de la consulta, pero no implica razonamiento real.

No se dispone de información sobre un proceso de entrenamiento, dataset o técnicas como RLHF o DPO. La única innovación técnica destacable es el diseño de interfaz "Glass Liquid" con efectos de desenfoque y el uso de `fetch` para cargar la base de conocimiento externa, con una base integrada en `app.js` como respaldo para entornos `file://`.

## Capacidades

- Clasificacion de texto basica mediante extraccion de palabras clave.
- Generacion de respuestas variadas a partir de un conjunto predefinido (seleccion aleatoria).
- Modo de pensamiento simulado con tres niveles: rapido, equilibrado y profundo.
- Gestion de archivos y fotos con arrastrar y soltar, previsualizacion de imagenes e iconos de archivo.
- Importacion y exportacion de datos en formato JSON/JSONL.
- Historial de conversaciones con busqueda, visualizacion y exportacion.
- Interfaz web autocontenida, sin dependencias externas ni necesidad de servidor.

## Casos de uso

- Asistente local de preguntas frecuentes: una empresa puede cargar un `knowledge.jsonl` con respuestas a consultas habituales de clientes y desplegar el `index.html` en un equipo sin conexión. El agente responde de forma inmediata y variada, aunque no comprende matices fuera de las palabras clave.
- Base de conocimiento personal: un usuario puede mantener un archivo JSONL con notas, recordatorios o datos estructurados y consultarlos mediante lenguaje natural simple, aprovechando el modo de pensamiento para ver cómo se procesa la consulta.
- Prototipo de chatbot educativo: estudiantes de programación pueden estudiar el código JavaScript para entender cómo se implementa un sistema de recuperación de respuestas basado en reglas, sin necesidad de entrenar modelos.
- Demostración de interfaz Glass Liquid: diseñadores y desarrolladores front-end pueden reutilizar los estilos CSS y la estructura visual para sus propios proyectos de agentes conversacionales.
- Entorno de pruebas para importación/exportación JSONL: al permitir cargar y guardar bases de conocimiento, sirve como herramienta para validar y editar conjuntos de datos conversacionales antes de usarlos en sistemas más complejos.
- Chatbot de soporte interno en entornos aislados: en redes sin acceso a internet, un equipo puede ejecutar este agente para responder consultas sobre procedimientos internos, siempre que las preguntas se ajusten a las palabras clave definidas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al no ser un modelo neuronal, no aplican métricas como MMLU, HumanEval o GSM8K. El rendimiento depende exclusivamente de la cobertura de la base de conocimiento y de la precisión de las palabras clave definidas por el usuario.

## Requisitos de hardware

- No requiere GPU ni VRAM: se ejecuta íntegramente en el navegador web.
- Cualquier ordenador con un navegador moderno (Chrome, Firefox, Edge, Safari) es suficiente.
- El consumo de memoria es proporcional al tamaño de la base de conocimiento JSONL; para bases pequeñas (menos de 1 MB) es despreciable.
- No necesita servidor ni despliegue en la nube; puede abrirse directamente con `file://` o servirse desde cualquier hosting estático.
- Latencia: las respuestas son instantáneas al ser una búsqueda local en memoria, sin llamadas de red.

## Comparativa con modelos similares

No se dispone de modelos comparables en el sentido de agentes basados en reglas con interfaz web y licencia MIT publicados en Hugging Face. Los proyectos homónimos encontrados en GitHub (VasilyKolbenev/PulsarAI y monirgit-ai/PulsarAI-) son plataformas diferentes, orientadas a agentes de producción con aprendizaje continuo, pero no comparten autor ni arquitectura con este repositorio. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto original, no comprende contexto ni mantiene coherencia más allá de la coincidencia de palabras clave.
- Respuestas limitadas a las entradas predefinidas en `knowledge.jsonl`; cualquier consulta fuera de las palabras clave recibe un fallback genérico.
- Idioma único: solo está configurado para ruso; no hay soporte multilingüe.
- Riesgo de alucinación nulo, pero riesgo de respuestas irrelevantes o incorrectas si las palabras clave coinciden con temas no relacionados.
- Sin capacidad de aprendizaje: la base de conocimiento debe actualizarse manualmente.
- La carga de `knowledge.jsonl` mediante `fetch` falla al abrir el archivo con `file://` en algunos navegadores debido a políticas CORS; el autor proporciona una base integrada como respaldo, pero limita la personalización en ese modo.
- No se garantiza mantenimiento ni soporte: el proyecto está en fase beta y no tiene descargas ni comunidad activa.

## Enlaces

- Hugging Face: https://huggingface.co/Sonorix/PulsarAi
- Proyecto homónimo no relacionado (GitHub): https://github.com/VasilyKolbenev/PulsarAI
- Repositorio de modelos de otro proyecto homónimo (GitHub): https://github.com/monirgit-ai/PulsarAI-/tree/main/models
- Perfil de datasets de PulsarAI en Hugging Face (no relacionado): https://huggingface.co/datasets/PulsarAI
