# lm-kit/vllm-d3-flash-lmk

## Resumen

d3-flash (Decision 3.0) es un modelo de decisión desarrollado por el proyecto vLLM Semantic Router y empaquetado por lm-kit para su SDK de IA on-device para .NET (LM-Kit.NET) y para LM-Kit One. A diferencia de un modelo generativo convencional, no redacta texto libre: recibe un contenido y una batería de preguntas tipadas (elección entre opciones, nivel en una escala ordenada, sí/no) y devuelve en un único forward pass la probabilidad de cada respuesta. La salida es siempre una de las opciones proporcionadas por el usuario, acompañada de un valor numérico sobre el que una regla puede actuar.

Con aproximadamente 8.950 millones de parámetros (8,95 B), es el mayor de los tres modelos de la familia Decision 3.0 del catálogo de LM-Kit, y cubre tres modalidades de entrada: texto, JSON e imágenes. Su naturaleza multimodal se implementa mediante un proyector de visión separado que se distribuye junto al modelo principal.

Su relevancia práctica radica en el encuadre como modelo "system-one": tareas de clasificación y enrutamiento de baja latencia y alta determinismo, donde el coste de generar texto libre es innecesario. El modelo se publica bajo licencia Apache 2.0 y se distribuye en formato GGUF y en el archivo empaquetado propietario `.lmk` que consume el SDK.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de decisión multimodal; pesos en GGUF) |
| Parametros totales | 8.953.803.264 (8,95 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (modelo principal), Q8_0 (proyector de visión) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (Q4_K_M y mmproj Q8_0) y archivo `.lmk` empaquetado |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base vllm-sr/d3-flash: no se especifica si emplea un transformer denso, una variante MoE, atención lineal u otro esquema, ni se documenta la composición del dataset de entrenamiento, el número de tokens vistos ni si hubo fases de RLHF o DPO. La model card remite a la ficha original del modelo base para los detalles de entrenamiento y la evaluación de los autores.

Lo que sí se documenta es la innovación de interfaz: el modelo está diseñado para producir distribuciones de probabilidad sobre un conjunto cerrado de respuestas tipadas en un solo forward pass, en lugar de generar secuencias de tokens. Soporta tres tipos de pregunta: `Choice` (una opción entre varias etiquetadas), `Score` (nivel esperado en una escala ordenada) y `YesNo` (probabilidad de sí). La componente multimodal se resuelve con un proyector de visión independiente cuantizado a Q8_0, y el motor de LM-Kit redimensiona cada imagen según el procesador propio del modelo. Los GGUF publicados son idénticos, byte a byte, a los de ggml-org/vllm-d3-flash-GGUF.

## Capacidades

- Clasificación zero-shot con etiquetas definidas por el usuario en tiempo de inferencia, sin reentrenamiento.
- Respuesta a preguntas de elección múltiple con probabilidad por opción.
- Puntuación en escalas ordinales (por ejemplo, urgencia de "puede esperar" a "ahora mismo") devolviendo el nivel esperado.
- Preguntas booleanas con probabilidad calibrada de "sí".
- Entrada multimodal: análisis de imágenes añadidas a la petición (por ejemplo, verificar si una foto muestra un paquete dañado).
- Procesamiento de contenido JSON además de texto plano.
- Salida determinista y acotada: la respuesta es siempre una de las opciones suministradas, apta para integrarse en reglas y flujos automatizados.
- Integración como herramienta `decide` en agentes y workflows de LM-Kit One, y endpoint HTTP `POST /v1/systemone`.
- Soporte de tool calling / function calling: no disponible como capacidad generativa; la interfaz es de decisión tipada, no de generación de llamadas.
- Razonamiento multi-step y agentes autónomos: no disponible (modelo system-one de un solo paso).

## Casos de uso

- Enrutamiento de tickets de soporte: clasificar cada mensaje entrante en equipos (facturación, envíos, técnico) con una pregunta `Choice` y obtener la confianza por opción para derivar automáticamente o escalar a revisión humana.
- Priorización de urgencia: asignar un nivel ordinal a incidencias con una pregunta `Score`, de modo que un sistema de colas ordene la atención según el valor esperado devuelto.
- Triaje con intervención humana: decidir con una pregunta `YesNo` si un caso requiere una persona, usando la probabilidad como umbral configurable en la lógica de negocio.
- Verificación de reclamaciones con imagen: adjuntar la foto de una entrega y preguntar si muestra un paquete dañado, integrando el resultado en el flujo de gestión de devoluciones.
- Moderación y etiquetado de contenido: clasificar textos o JSON en categorías predefinidas con probabilidades, útil para pipelines de anotación o filtrado previo.
- Extracción de señales estructuradas en ETL: convertir contenido no estructurado en decisiones tipadas (categoría, severidad, requiere acción) que alimentan reglas downstream sin necesidad de parsear texto generado.
- Automatización on-device en .NET: desplegar el modelo dentro de aplicaciones de escritorio o servidor mediante LM-Kit.NET para clasificación local sin depender de servicios en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: con cuantización Q4_K_M sobre 8,95 B de parámetros, el peso del modelo ronda los 5-6 GB; el proyector de visión Q8_0 añade una fracción adicional. El repositorio completo ocupa 14,5 GB, pero la inferencia solo requiere el GGUF Q4_K_M y el mmproj.
- GPU recomendadas: no disponibles en la documentación; por tamaño, el modelo debería caber en GPU de consumo con 8 GB o más de VRAM en Q4_K_M, aunque el fabricante no publica requisitos oficiales.
- GPU de consumo: previsiblemente compatible con tarjetas de 8-12 GB de VRAM (por ejemplo, gama RTX 3060/4060 en adelante); sin confirmación oficial.
- Opciones de despliegue: LM-Kit.NET (SDK .NET), LM-Kit One (endpoint `POST /v1/systemone` y playground Decide) y, al ser GGUF estándar, potencialmente llama.cpp u otros runners compatibles con GGUF y mmproj; vLLM, TGI u Ollama no están documentados para este paquete.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de la misma categoría (modelos de decisión con salida probabilística sobre opciones cerradas). Dentro de la propia familia Decision 3.0, d3-flash es el mayor de los tres modelos del catálogo de LM-Kit, pero no se detallan los nombres ni las especificaciones de los otros dos.

| Modelo | Parametros | Contexto | Modalidad | Licencia | Formato |
|---|---|---|---|---|---|
| d3-flash (este modelo) | 8,95 B | no disponible | texto, JSON, imagen | Apache 2.0 | GGUF, .lmk |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No es un modelo generativo: no redacta texto libre ni mantiene conversaciones abiertas; solo responde a preguntas tipadas sobre las opciones proporcionadas.
- La calidad de la decisión depende por completo de la formulación de las preguntas y de las etiquetas; opciones ambiguas o solapadas degradan la calibración.
- No se documentan sesgos conocidos, pero al no publicarse la composición del dataset de entrenamiento no es posible evaluar sesgos demográficos, culturales o lingüísticos.
- Riesgo de alucinación: la salida está acotada a las opciones, pero las probabilidades pueden ser incorrectas o estar mal calibradas en dominios alejados de los datos de entrenamiento.
- Idiomas soportados no documentados: no hay garantía de rendimiento fuera del idioma o idiomas de entrenamiento.
- Longitud de contexto no disponible: no se puede planificar el uso con documentos largos sin verificación empírica.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar la ficha del modelo base vllm-sr/d3-flash por si los autores añaden condiciones adicionales.
- Empaquetado propietario `.lmk`: el uso principal está ligado al SDK LM-Kit.NET y a LM-Kit One; fuera de ese ecosistema solo están garantizados los GGUF publicados por ggml-org.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema y validación comunitaria aún inexistentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lm-kit/vllm-d3-flash-lmk
- Modelo base: https://huggingface.co/vllm-sr/d3-flash
- GGUF originales: https://huggingface.co/ggml-org/vllm-d3-flash-GGUF
- SDK LM-Kit.NET: https://lm-kit.com/products/lm-kit-net/
- Sitio de LM-Kit: https://lm-kit.com/
