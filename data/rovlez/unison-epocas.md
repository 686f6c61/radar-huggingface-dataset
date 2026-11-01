# RovleZ/unison-epocas

## Resumen

unison-epocas es un ajuste fino mediante LoRA del modelo Qwen2.5-0.5B-Instruct, desarrollado por RovleZ en el marco de un proyecto de la Maestría en Ciencia de Datos de la Universidad de Sonora. Su objetivo es generar el cuerpo de notas institucionales imitando el estilo de redacción de cada rectorado del portal de noticias de la universidad entre 2013 y 2026, lo que permite comparar estilométricamente cómo ha evolucionado la comunicación institucional a lo largo de cuatro épocas diferenciadas.

El modelo parte de la arquitectura transformer densa de Qwen2.5 en su variante de 0.5B parámetros, con una ventana de contexto heredada del modelo base. El ajuste se realizó sobre 7.216 notas del portal, anonimizadas sustituyendo nombres de personas por el marcador `[Nombre]` y filtradas mediante un clasificador de época basado en TF-IDF y regresión logística que asigna cada nota a su rectorado con al menos un 60 % de probabilidad.

Su relevancia es doble: por un lado, demuestra un flujo completo de adaptación de un LLM pequeño a una tarea estilística muy específica con recursos limitados (una única GPU AMD MI210); por otro, se distribuye en ONNX cuantizado a 4 bits para ejecutarse íntegramente en el navegador mediante transformers.js, lo que lo convierte en un ejemplo práctico de despliegue de inferencia local sin servidor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen2), ajuste LoRA sobre Qwen2.5-0.5B-Instruct |
| Parametros totales | 0,5 mil millones (modelo base) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Qwen2.5-0.5B-Instruct) |
| Tipos de cuantizacion | ONNX cuantizado a 4 bits (`onnx/model_q4.onnx`) |
| Idiomas soportados | espanol |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX (transformers.js); adaptadores LoRA entrenados sobre el modelo base |

## Arquitectura y entrenamiento

El modelo es un ajuste LoRA con rango r = 32 aplicado sobre todas las proyecciones lineales de Qwen2.5-0.5B-Instruct, un transformer decoder-only denso de 0,5B parámetros. El entrenamiento consistió en 2 pasadas sobre un corpus de 7.216 notas del portal de noticias de la Universidad de Sonora, previamente anonimizadas (nombres de personas reemplazados por `[Nombre]`) y filtradas por un clasificador de época (TF-IDF más regresión logística) que retiene únicamente las notas asignadas a un rectorado con probabilidad igual o superior al 60 %. Las épocas cubiertas son 2013–2017, 2017–2021, 2021–2025 y 2025–2026.

El entrenamiento se ejecutó en una GPU AMD MI210 de la supercomputadora Yuca (ACARUS, Universidad de Sonora). La innovación técnica destacable no está en la arquitectura, sino en el procedimiento de control de estilo: en la demo se emplea classifier-free guidance (γ = 1) comparando la generación condicionada a la época con una generación sin época, de modo que se amplifica la señal estilística diferencial de cada rectorado. Con esta guía, el clasificador de época reconoce correctamente la época solicitada en el 58 % de las notas generadas, frente al 25 % esperable por azar en una clasificación de cuatro clases.

## Capacidades

- Generación de texto en español con control de estilo mediante prompt de sistema que especifica la época o rectorado.
- Redacción de cuerpo de notas institucionales a partir de un titular proporcionado por el usuario.
- Diferenciación estilística entre cuatro periodos de rectorado (2013–2017, 2017–2021, 2021–2025, 2025–2026).
- Ejecución en navegador mediante transformers.js con pesos ONNX cuantizados a 4 bits.
- Compatibilidad con classifier-free guidance para intensificar el estilo solicitado.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento extendido en la información disponible.
- Capacidad multilingüe limitada al español según la model card, aunque el modelo base Qwen2.5 es multilingüe.

## Casos de uso

- Análisis estilométrico de la comunicación institucional: generar notas sintéticas para cada rectorado y comparar métricas de estilo (longitud de frase, léxico, fórmulas de apertura) entre épocas, aprovechando que el modelo ha aprendido las particularidades de cada periodo.
- Docencia en PLN: servir como ejemplo reproducible de ajuste LoRA sobre un LLM pequeño con un corpus institucional real, ejecutable en una sola GPU y desplegable en navegador para demostraciones en clase.
- Prototipado de aplicaciones web sin backend: al estar en ONNX q4 y pensado para transformers.js, permite integrar un generador de texto en una página estática sin infraestructura de servidor ni costes de API.
- Generación de borradores de notas para comunicación institucional: producir un primer borrador con el tono de una época concreta que un redactor humano revise y corrija, dado que el modelo inventa datos.
- Investigación sobre deriva estilística en medios institucionales: usar las generaciones como contrafactuales para estudiar qué rasgos lingüísticos cambiaron entre rectorados y en qué magnitud.
- Evaluación de técnicas de control de generación: el pipeline con classifier-free guidance descrito en la model card sirve como caso de estudio para medir la eficacia de esta técnica en modelos de 0,5B con condicionamiento por prompt de sistema.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El único dato de evaluación reportado por el autor es la tasa de acierto del clasificador de época sobre las notas generadas con classifier-free guidance (γ = 1): 58 % frente al 25 % esperable por azar en una clasificación de cuatro clases.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo en ONNX q4 ocupa aproximadamente 0,4 GB (tamaño del repositorio), por lo que cabe holgadamente en cualquier GPU consumer con 4 GB o más de memoria.
- GPU recomendadas: cualquier GPU moderna para ejecución local; el entrenamiento se realizó en una AMD MI210. Para inferencia en navegador no se requiere GPU dedicada, aunque WebGPU acelera la ejecución.
- Cabe en GPU consumer: sí, en cualquier RTX 30/40, GTX 16xx con suficiente VRAM, o incluso en CPU para generaciones cortas.
- Opciones de despliegue: transformers.js (vía `@huggingface/transformers` con `dtype: "q4"`), y en general cualquier runtime compatible con ONNX. No se documenta soporte específico de vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| RovleZ/unison-epocas | 0,5B | no disponible | apache-2.0 | Ajuste LoRA de estilo institucional en español, ONNX q4 | HuggingFace, transformers.js |
| Qwen/Qwen2.5-0.5B-Instruct | 0,5B | no disponible en la informacion proporcionada | apache-2.0 | Modelo base instructivo generalista y multilingüe | HuggingFace, múltiples runtimes |
| Otros ajustes LoRA de 0,5B para estilo en español | 0,5B | variable | variable | Adaptaciones estilísticas o de dominio | Depende del autor |

La comparación directa con alternativas de la misma categoría (ajustes de estilo en español sobre modelos de 0,5B) no está disponible en la información proporcionada; el único punto de referencia objetivo es el modelo base Qwen2.5-0.5B-Instruct, del que unison-epocas hereda arquitectura y licencia pero del que difiere en especialización (estilo institucional frente a instrucciones generales) y en formato de distribución (ONNX q4 frente a safetensors).

## Limitaciones y advertencias

- El propio autor advierte que es un modelo de 0,5B que inventa nombres de dependencias, fechas y cifras; no debe usarse como fuente de información, solo para comparar estilos.
- Riesgo alto de alucinación factual: cualquier dato concreto generado (cifras, cargos, fechas) debe verificarse contra fuentes reales.
- El corpus de entrenamiento está filtrado por un clasificador con umbral del 60 %, por lo que las notas de entrenamiento no son necesariamente representativas de todo el portal y pueden introducir sesgo de selección.
- La anonimización sustituye nombres por `[Nombre]`, lo que puede producir artefactos en las generaciones (aparición del marcador o de nombres ficticios).
- La tasa de acierto del clasificador de época sobre generaciones guiadas es del 58 %, lejos de la certeza: el control de estilo es probabilístico, no determinista.
- Cobertura lingüística limitada al español según la model card; el rendimiento en otros idiomas no está documentado.
- Aunque la licencia es apache-2.0 y permite uso comercial, la naturaleza del corpus (notas institucionales de una universidad) aconseja revisar implicaciones de atribución y uso de contenido derivado antes de un despliegue en producción.
- No se documentan evaluaciones de sesgo, toxicidad ni robustez; para producción conviene añadir filtros y revisión humana.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/RovleZ/unison-epocas
- Proyecto "La Unison cambió su forma de escribir": https://rovlezmex.github.io/pln-noticias-unison/
- Código del proyecto: https://github.com/RovleZMex/pln-noticias-unison
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
