# ferit0/OgrenciAsistan-1.5B

## Resumen

OgrenciAsistan-1.5B es un ajuste fino del modelo Qwen2.5-1.5B-Instruct publicado por el usuario ferit0 en HuggingFace. Se trata de un asistente conversacional en turco especializado en asuntos estudiantiles universitarios: calendario académico, trámites de matrícula, normativa de evaluación, tasas de escuela de verano y servicios de campus. El modelo se presenta como parte de un proyecto de bootcamp y se apoya en un sistema RAG sobre una guía institucional en PDF y tablas CSV estructuradas de asignaturas.

Técnicamente es un transformer decoder-only de la familia Qwen2 con 1.543.714.304 parámetros (~1,54 B), ajustado mediante QLoRA (r=16, alpha=32) sobre 441 conversaciones sintéticas generadas con Gemini. La model card destaca dos objetivos: identidad consistente del asistente y uso fiable de un protocolo de agente en JSON con invocación de herramientas (concretamente una calculadora de tasas por AKTS).

Su relevancia es acotada pero ilustrativa: demuestra que un modelo de 1,5 B cuantizado se puede entrenar en una GPU T4 gratuita y desplegar en hardware modesto, con una política explícita de "no responder si el dato no está en la guía" para reducir alucinaciones. Es un caso de estudio de ajuste de dominio estrecho, no un modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2) con ajuste fino QLoRA |
| Parametros totales | 1.543.714.304 (~1,54 B) |
| Longitud de contexto | 32.768 tokens heredados del modelo base Qwen2.5-1.5B-Instruct; no se especifica en la model card del ajuste |
| Tipos de cuantizacion | Entrenamiento en 4 bits (QLoRA, NF4); versiones GGUF publicadas en repositorio aparte, con niveles concretos no disponibles |
| Idiomas soportados | Turco (tr); el modelo base es multilingue, pero el ajuste esta orientado exclusivamente al turco |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (modelo publicado); adaptador LoRA y GGUF en repositorios separados |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-1.5B-Instruct, un transformer causal con atención agrupada (GQA), entrenado originalmente con alineamiento por instrucciones. Sobre esa base se aplicó QLoRA con rango 16, alpha 32, aplicado a todas las capas lineales, durante 3 épocas con una tasa de aprendizaje de 2e-4. El autor justifica la elección de la variante de 1,5 B (frente a una de 3 B) por el coste de entrenamiento en una GPU T4 gratuita y por el buen soporte de turco del modelo base.

El conjunto de entrenamiento es pequeño y totalmente sintético: 441 conversaciones generadas con Gemini, distribuidas en tres ejes funcionales (identidad, RAG y agente). No se menciona uso de RLHF ni DPO posterior; el ajuste es supervisado (SFT) sobre trazas de conversación. La innovación destacable no es arquitectónica sino de diseño de sistema: el modelo aprende a emitir JSON estructurado con los campos `dusunce` (razonamiento) y `arac` (herramienta), lo que permite que un orquestador externo ejecute la calculadora de tasas, y aprende a rechazar consultas fuera del corpus con la respuesta "esta información no está en la guía". Como efecto colateral del entrenamiento, el modelo integra un icono de escudo al final de prácticamente todas sus respuestas.

## Capacidades

- Generación de texto conversacional en turco sobre dominio académico y administrativo.
- Recuperación aumentada (RAG) anclada a un `rehber.pdf` y a tablas CSV estructuradas de asignaturas: el modelo cita el dato recuperado en lugar de generarlo libremente.
- Rechazo explícito cuando la información no está en el corpus ("Bu bilgi rehberde bulunmamaktadır"), comportamiento entrenado de forma deliberada.
- Tool calling en formato JSON: emite objetos con los campos `dusunce` y `arac`; la herramienta documentada es una calculadora de tasas por AKTS (`yüzdelik_birimi`).
- Identidad de asistente consistente: se identifica como OgrenciAsistan en las pruebas de identidad.
- Razonamiento multi-paso básico limitado al patrón consultar-recuperar-calcular-responder.
- Capacidades multilingües: no entrenadas en este ajuste; el comportamiento fuera del turco no está documentado.
- Sin capacidades de visión, audio ni multimodalidad.

## Casos de uso

- Atención al cliente de secretaría universitaria: el modelo gestiona conversaciones multi-turno sobre plazos de matrícula, periodos de add/drop y normativa de exámenes, apoyándose en el contexto recuperado del reglamento institucional.
- Cálculo automatizado de tasas de escuela de verano: mediante tool calling, el asistente extrae los AKTS de una asignatura y delega el cálculo del importe en la herramienta `yüzdelik_birimi`, evitando errores aritméticos del propio modelo.
- Chatbot de consulta normativa con trazabilidad: al estar restringido a responder desde la guía, es adecuado en flujos donde una respuesta inventada tiene coste administrativo, ya que devuelve un rechazo explícito cuando no encuentra el dato.
- Enrutador de intenciones en un pipeline de agentes: la salida JSON con `dusunce` y `arac` se puede parsear de forma determinista para decidir si la consulta requiere RAG, cálculo o respuesta directa.
- Despliegue en mostradores y kioscos de campus con hardware limitado: con cuantización de 4 bits el modelo cabe en GPU integradas o CPU, lo que permite inferencia local sin depender de servicios en la nube ni exponer datos de estudiantes a terceros.
- Plantilla reproducible para ajuste de dominio en otras instituciones o idiomas: al ser Apache 2.0 y basarse en un modelo pequeño, sirve como punto de partida para replicar el pipeline QLoRA con un corpus propio.
- Evaluación comparativa de técnicas anti-alucinación: el par de métricas `rag_hakem` / `rag_isaret` de la model card lo convierte en un ejemplo útil para estudiar el equilibrio entre rechazar y responder.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre el conjunto de prueba propio (comparación antes y después del ajuste):

| Metrica | Modelo base | OgrenciAsistan |
|---|---|---|
| kimlik_ad | 0,00 | 0,60 |
| kimlik_isaret | 0,00 | 1,00 |
| ajan_json | 0,94 | 1,00 |
| ajan_arac | 0,12 | 1,00 |
| rag_hakem | 0,43 | 0,37 |
| rag_isaret | 0,00 | 1,00 |

Evaluación cualitativa de 15 preguntas de prueba con un juez Gemini (puntuación 1 / 0,5 / 0), con media global de 0,60:

| Pregunta | Puntuacion |
|---|---|
| Plazo del periodo de add/drop | 1,0 |
| Límite de faltas por asignatura | 0,0 |
| Existencia de examen de incidencia | 1,0 |
| Coeficiente de la nota BB | 1,0 |
| Precio por AKTS en verano | 0,0 |
| Importe de la beca de éxito académico | 1,0 |
| Duración máxima de interrupción de estudios | 0,0 |
| Penalización por devolución tardía de libros | 0,0 |
| Requisitos de graduación | 1,0 |
| Horario y aula de la asignatura de Deep Learning | 1,0 |
| Suma de AKTS entre BIL203 y BIL305 | 0,0 |
| Nombre del rector | 0,0 |
| Precio del aparcamiento de campus | 1,0 |
| Tasa de una asignatura de 5 AKTS en verano | 1,0 |
| Tasa de una asignatura de 4 AKTS en verano | 1,0 |

No se han publicado resultados de benchmarks estandar (MMLU, GSM8K, HumanEval, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM en fp16/bf16: aproximadamente 3,1 GB solo de pesos; entre 4 y 6 GB contando caché KV y activaciones para contextos moderados.
- VRAM en 8 bits: aproximadamente 1,7 GB de pesos; en torno a 2,5-3 GB en total.
- VRAM en 4 bits o GGUF Q4_K_M: aproximadamente 1 GB de pesos; alrededor de 1,5-2 GB en total.
- Cabe en GPU de consumo: sí, en cualquier tarjeta con 4 GB o más (GTX 1650, RTX 3050); con holgura en 6-8 GB (RTX 3060, RTX 4060, RTX 2070). También es viable en CPU con llama.cpp, aunque con latencia mayor.
- GPU de centro de datos: no requiere A100 ni H100; una T4 o L4 es suficiente, y de hecho el ajuste se entrenó en una T4.
- Opciones de despliegue: llama.cpp y Ollama mediante los GGUF publicados; vLLM o TGI para servir el modelo en fp16; Transformers con PEFT si se quiere cargar el adaptador LoRA por separado.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| OgrenciAsistan-1.5B | 1,54 B | 32.768 (heredado del base) | Apache 2.0 | HuggingFace | Ajuste QLoRA en turco sobre Qwen2.5-1.5B-Instruct, con RAG y tool calling entrenados |
| Qwen2.5-1.5B-Instruct | 1,54 B | 32.768 | Apache 2.0 | HuggingFace | Modelo base multilingue; sin identidad ni protocolo de agente específicos |
| Llama 3.2 1B Instruct | 1,24 B | 128.000 | Llama 3.2 Community License | HuggingFace, Ollama | Contexto mucho mayor; licencia con condiciones de uso adicionales |
| Gemma 2 2B IT | 2,6 B | 8.192 | Gemma Terms of Use | HuggingFace, Kaggle | Mayor número de parámetros y contexto más corto; licencia propia con restricciones |

No hay comparativas de rendimiento publicadas frente a estos modelos: la model card solo reporta métricas internas de la tarea.

## Limitaciones y advertencias

- Corpus de entrenamiento muy reducido: 441 conversaciones sintéticas generadas por Gemini, lo que limita la cobertura y favorece el sobreajuste al formato de las trazas.
- Artefacto de entrenamiento: el modelo añade un icono de escudo al final de casi todas sus respuestas, incluido el caso de respuestas largas o truncadas.
- Regresión medida en la métrica `rag_hakem` (de 0,43 a 0,37): la calidad de las respuestas de RAG juzgadas por LLM empeoró ligeramente pese a que la marca de uso de RAG (`rag_isaret`) alcanzó 1,00.
- Errores factuales documentados en el propio conjunto de prueba: confunde el precio por AKTS de la escuela de verano (responde 6.500 TL en lugar de 2.500 TL) e inventa una regla de "72 AKTS / 9 días" para el límite de faltas.
- El modelo se niega a responder sobre cualquier tema que no esté en el PDF de la guía o en las tablas CSV; no admite conocimiento externo ni razonamiento fuera del corpus.
- Idioma: entrenado únicamente en turco; no está evaluado en castellano ni en otros idiomas.
- Licencia Apache 2.0, por lo que el uso comercial está permitido; no obstante, la responsabilidad sobre el tratamiento de datos personales de estudiantes y sobre la exactitud de la información institucional recae en quien integra el modelo.
- No hay métricas de producción publicadas (latencia, throughput, tasa de errores en tráfico real), ni validación externa: el repositorio registra 0 descargas y 0 "likes" en el momento de la consulta.
- Los datos de la institución (Lale Teknik Üniversitesi) son ficticios o de un entorno de prácticas; no debe usarse como fuente normativa real.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ferit0/OgrenciAsistan-1.5B
- Adaptador LoRA: https://huggingface.co/ferit0/OgrenciAsistan-1.5B-LoRA
- Versión GGUF: https://huggingface.co/ferit0/OgrenciAsistan-1.5B-GGUF
- Conjunto de datos de entrenamiento: https://huggingface.co/datasets/ferit0/ogrenciasistan-1.5b-veri
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Paper o blog técnico: no disponible
- Repositorio de código o demo: no disponible (la model card indica que el sitio se publicará en una vitrina del instructor)
- Resultados de la búsqueda web: no se encontraron enlaces relevantes sobre el modelo; los resultados devueltos corresponden a un perfil no relacionado.
