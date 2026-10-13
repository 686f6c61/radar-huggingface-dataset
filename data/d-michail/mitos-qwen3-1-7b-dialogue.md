# d-michail/Mitos-Qwen3-1.7B-Dialogue

## Resumen

Mitos-Qwen3-1.7B-Dialogue es un ajuste fino del modelo Qwen3-1.7B de Alibaba, desarrollado por el usuario d-michail, orientado a responder preguntas de ciudadanos sobre procedimientos administrativos de la administración pública griega. El entrenamiento parte del texto de las tramitaciones del Registro Nacional de Procedimientos Administrativos de Grecia (ΕΜΔΔ / Mitos), accesible mediante la API de datos abiertos api.mitos.gov.gr, a partir del cual se generaron diálogos sintéticos ciudadano-funcionario que cubren las 4.407 tramitaciones del snapshot, con un total de 90.145 registros de conversación.

Técnicamente es un transformer decoder-only denso de 1.720.574.976 parámetros (1,7 B) distribuido en bfloat16, obtenido mediante un LoRA de rango 16 y alpha 32 sobre todas las proyecciones de atención y MLP, posteriormente fusionado en los pesos finales. La longitud máxima de secuencia durante el entrenamiento fue de 4.096 tokens y el modelo responde de forma deliberadamente breve, en torno a 25-45 palabras, imitando el registro de un funcionario de ventanilla.

Su interés es de nicho pero claro: es un modelo abierto con licencia CC BY-SA 4.0 especializado en administración pública griega, con un protocolo de evaluación sobre 1.933 preguntas. La propia model card insiste en que, sin recuperación, el modelo aprende el registro y el formato del dominio pero apenas los hechos, y que la exactitud proviene mayoritariamente del RAG; por tanto debe desplegarse como componente de un sistema con recuperación y verificación, nunca como fuente normativa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Qwen3), ajustado con LoRA (r=16, alpha=32) y pesos fusionados |
| Parametros totales | 1.720.574.976 (1,7 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 4.096 tokens (máximo de secuencia en entrenamiento); la ventana nativa del modelo base no se detalla en la información disponible |
| Tipos de cuantizacion | No disponible: solo se publican pesos bfloat16, sin GGUF ni cuantizaciones oficiales |
| Idiomas soportados | Griego moderno (código `el`); no se declara soporte de otros idiomas |
| Licencia | CC BY-SA 4.0 para los pesos; el modelo base Qwen3 se distribuye bajo Apache-2.0 (texto incluido en el repositorio) |
| Formato de pesos | safetensors, bfloat16, librería transformers |
| Modelo base | Qwen/Qwen3-1.7B (relación: finetune) |
| Metodo de ajuste | LoRA, rank 16, alpha 32, learning rate 2e-4, schedule coseno, 2 épocas, batch efectivo 32, bfloat16 |
| Dataset de entrenamiento | d-michail/mitos-qa (configuración `qa-all`), 90.145 registros sobre 4.407 procedimientos |
| Tamano del repositorio | 3,5 GB |

## Arquitectura y entrenamiento

El modelo base es Qwen3-1.7B, un transformer decoder-only denso con plantilla de chat propia de la familia Qwen3. Sobre él se aplicó un ajuste LoRA de rango 16 y alpha 32 en todas las proyecciones de atención y MLP, con learning rate 2e-4, schedule coseno, 2 épocas y batch efectivo 32 en bfloat16. La pérdida se calculó únicamente sobre los tokens del asistente, con cross-entropy estándar, usando la plantilla de chat de Qwen3 con el modo de razonamiento desactivado (`enable_thinking=False`). La secuencia máxima fue de 4.096 tokens. El resultado se fusionó en un modelo final en bfloat16 entrenado sobre la totalidad de los procedimientos.

Los datos de entrenamiento son diálogos breves generados por un LLM (la model card indica Qwen3.8-27B, Apache-2.0) a partir del texto de cada procedimiento del registro, y posteriormente parseados a registros de chat. No se documenta uso de RLHF ni de DPO, ni innovaciones de inferencia como decodificación especulativa o atención lineal. El repositorio incluye un modelo acompañante, d-michail/Mitos-Qwen3-1.7B-Dialogue-LoRA, entrenado excluyendo 220 procedimientos reservados, que es el que se usa para las métricas de evaluación porque las preguntas "no vistas" del benchmark provienen de procedimientos que el modelo fusionado sí ha visto.

## Capacidades

- Generación de texto conversacional en griego moderno sobre trámites administrativos, con respuestas cortas de aproximadamente 25-45 palabras.
- Respuesta a preguntas de ciudadanos sobre procedimientos del Registro Nacional de Procedimientos Administrativos (documentos requeridos, plazos, importes y pasos, según el contenido del registro).
- Funcionamiento en dos modos: closed-book (sin contexto) y con generación aumentada por recuperación, recibiendo fragmentos numerados `[1]`, `[2]`, etc. en el mensaje de usuario.
- Adopción del registro y el formato de un funcionario de atención al público (tono administrativo, respuestas concisas).
- Instrucción explícita en el prompt de RAG para declarar cuando la información recuperada no basta para responder.
- Compatibilidad con `text-generation-inference` y con endpoints compatibles, según las etiquetas del repositorio.
- No se declara soporte de tool calling ni de function calling.
- No se declara soporte de agentes, razonamiento multi-paso, visión, audio ni modo de razonamiento extendido; de hecho, el entrenamiento se hizo con el thinking desactivado.

## Casos de uso

- Atención al ciudadano con RAG: desplegar el modelo detrás de un recuperador que consulte el registro Mitos y pase los fragmentos numerados en el prompt; el modelo redacta la respuesta breve y el sistema muestra la fuente y la fecha de recuperación. Es adecuado porque las métricas de la model card muestran que la recuperación a nivel de campo es lo que aporta la mayor parte de la exactitud (key-fact recall 0,484 frente a 0,117 en closed-book).
- Asistente interno para funcionarios: consultas rápidas sobre qué documento o plazo aplica a un trámite concreto, con respuesta de una o dos frases que el funcionario verifica antes de actuar.
- Preguntas frecuentes en portales de e-government: generar respuestas cortas y homogéneas para un buscador institucional, aprovechando que el modelo fue entrenado con el estilo de respuesta de ventanilla.
- Prototipado de investigación en PLN griego: servir como punto de partida para estudiar adaptación de dominio de modelos pequeños a un corpus administrativo concreto, comparando contra el modelo base.
- Clasificación y resumen de procedimientos como paso previo: usar el modelo para condensar el texto de una tramitación en un resumen de pocas líneas que alimente un índice de búsqueda.
- Evaluación de pipelines RAG: el benchmark de 1.933 preguntas y las métricas sin juez (key-fact recall, token F1) permiten medir estrategias de recuperación distintas (fragmentos por campo, ventanas, procedimientos completos) usando el modelo como generador.
- Base para ajuste adicional en otras administraciones públicas: al ser un modelo pequeño y con licencia share-alike, puede reentrenarse con datos abiertos de otro registro nacional, asumiendo las obligaciones de atribución y compartir igual.

## Benchmarks y rendimiento

Los datos siguientes corresponden al modelo acompañante entrenado sin los 220 procedimientos reservados, no al modelo fusionado de este repositorio, porque las preguntas no vistas del benchmark provienen de procedimientos que este último ha visto. Se evaluaron 1.933 preguntas con métricas sin juez; la propia model card advierte que key-fact recall favorece respuestas largas y token F1 las cortas, por lo que deben leerse junto a la longitud de la respuesta.

| Sistema | Key-fact recall (Qwen3-1.7B base) | Key-fact recall (modelo ajustado) | Token F1 (modelo ajustado) | Palabras (modelo ajustado) |
|---|---|---|---|---|
| Closed-book | 0,031 | 0,117 | 0,303 | 25 |
| RAG (fragmentos a nivel de campo) | 0,422 | 0,484 | 0,471 | 49 |
| RAG-split (ventanas) | 0,234 | 0,288 | 0,365 | 48 |
| RAG-process (procedimientos completos) | 0,202 | 0,222 | 0,333 | 55 |

Las métricas con juez, los otros tamaños de modelo y el protocolo completo se remiten al paper, cuyo enlace está pendiente de añadir según la model card. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

Las cifras de VRAM son estimaciones derivadas del número de parámetros, ya que el autor no publica requisitos de hardware ni medidas de latencia o throughput.

- Pesos en bfloat16: aproximadamente 3,4 GB en disco y en memoria; con caché KV para 4.096 tokens, alrededor de 5-6 GB de VRAM en la práctica.
- Cuantización a 8 bits: aproximadamente 2 GB de pesos. Cuantización a 4 bits: aproximadamente 1,2 GB. Ninguna de las dos se distribuye oficialmente.
- Cabe sin problema en GPUs de consumo: RTX 3060 de 12 GB, RTX 4070, RTX 4090, así como en GPUs de 8 GB con cuantización o con contexto reducido.
- GPUs de centro de datos (A100, H100, L40S) son suficientes con enorme margen; resultan útiles si se sirven muchas réplicas en paralelo o se hace fine-tuning adicional.
- Despliegue soportado: transformers con `AutoModelForCausalLM` en bfloat16 y `device_map="auto"`, y vLLM mediante `vllm serve d-michail/Mitos-Qwen3-1.7B-Dialogue` enviando `"chat_template_kwargs": {"enable_thinking": false}` en la petición. El repositorio está etiquetado con `text-generation-inference` y `endpoints_compatible`, por lo que TGI es una opción coherente.
- llama.cpp u Ollama requerirían convertir los pesos a GGUF, ya que no se publican ficheros GGUF; esa conversión es un paso adicional no documentado por el autor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Mitos-Qwen3-1.7B-Dialogue | 1,7 B | 4.096 tokens en entrenamiento | Administración pública griega, RAG | CC BY-SA 4.0 | Pesos safetensors en HuggingFace |
| Mitos-Qwen3-1.7B-Dialogue-LoRA | 1,7 B (adaptador) | 4.096 tokens en entrenamiento | Igual, entrenado sin 220 procedimientos reservados | CC BY-SA 4.0 | Adaptador LoRA en HuggingFace, carpeta `holdout/` |
| Qwen/Qwen3-1.7B | 1,7 B | No disponible en la información proporcionada | Generalista, multilingüe | Apache-2.0 | Pesos safetensors en HuggingFace |

No se dispone de información en la documentación aportada sobre otros modelos comparables del dominio griego o de administración pública con los que establecer una comparación cuantitativa.

## Limitaciones y advertencias

- No es asesoramiento jurídico: las respuestas no tienen validez legal y el registro cambia con el tiempo, por lo que el modelo queda desactualizado respecto al snapshot con el que se entrenó.
- Sin recuperación, el key-fact recall es muy bajo (0,117 frente a 0,484 con RAG a nivel de campo): el modelo aprende el registro y el formato del dominio, pero no los hechos. Puede afirmar importes, plazos o documentos concretos que son incorrectos.
- Riesgo de bucles de repetición: los modelos pequeños pueden degenerar en repeticiones que consumen toda la ventana de generación; en producción conviene usar penalización de repetición o una regla de parada. En el ejemplo de uso se emplea `repetition_penalty=1.05`.
- Los datos de entrenamiento son sintéticos o generados por plantilla a partir de un único snapshot del registro, por lo que pueden reproducir errores y fraseo del generador.
- El propio registro no garantiza la completitud ni la corrección de su contenido (términos de uso de mitos.gov.gr, cláusula A.6), y por extensión tampoco el modelo.
- Requisito operativo: toda respuesta debe verificarse contra el procedimiento vivo en `https://id.mitos.gov.gr/<ID Mitos>` (identificador de 6 dígitos) y el sistema desplegado debe mostrar la fuente, la fecha de recuperación y el enlace oficial.
- Condiciones de uso del modelo: entrenado sin system prompt y con el modo de razonamiento desactivado; hay que usar la plantilla de chat de Qwen3 y colocar la pregunta o el prompt de recuperación en el mensaje de usuario.
- Licencia CC BY-SA 4.0: impone atribución y compartir igual. Cualquier obra derivada o despliegue que distribuya el modelo o sus adaptaciones debe mantener la misma licencia y acreditar el origen de los datos del Εθνικό Μητρώο Διοικητικών Διαδικασιών – Μίτος y los cambios realizados. El modelo base Qwen3 mantiene Apache-2.0.
- Idioma único: solo griego moderno; no hay soporte declarado de castellano ni de otras lenguas, por lo que no es reutilizable directamente en otros mercados sin reentrenamiento.
- No se documenta en la model card un análisis de sesgos demográficos o sociales; los sesgos previsibles son los del propio registro administrativo y los del LLM generador de los diálogos.
- Contexto limitado a 4.096 tokens en entrenamiento, lo que restringe la cantidad de fragmentos recuperados que se pueden pasar en el prompt.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/d-michail/Mitos-Qwen3-1.7B-Dialogue
- Modelo acompañante con adaptador LoRA (carpeta `holdout/`): https://huggingface.co/d-michail/Mitos-Qwen3-1.7B-Dialogue-LoRA
- Dataset de entrenamiento: https://huggingface.co/datasets/d-michail/mitos-qa
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Registro Nacional de Procedimientos Administrativos (Μίτος): https://mitos.gov.gr
- API de datos abiertos del registro: https://api.mitos.gov.gr/info
- Consulta de un procedimiento por su identificador: https://id.mitos.gov.gr/
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
- Paper con el protocolo completo de evaluación y las métricas con juez: pendiente de enlace según la model card, no disponible

Nota: las búsquedas web realizadas no devolvieron resultados relevantes sobre este modelo (únicamente páginas genéricas ajenas al tema), por lo que todos los enlaces y datos proceden de la model card y de los metadatos del repositorio de HuggingFace.
