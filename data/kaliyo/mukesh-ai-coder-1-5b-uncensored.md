# Kaliyo/Mukesh-AI-Coder-1.5B-Uncensored

## Resumen

Mukesh-AI-Coder-1.5B-Uncensored es un modelo de lenguaje publicado en Hugging Face por el usuario Kaliyo bajo licencia Apache 2.0. Por el nombre se deduce que se trata de un modelo orientado a generacion de codigo, con aproximadamente 1.5 mil millones de parametros y una variante "uncensored", es decir, presumiblemente con las capas de alineacion o filtrado reducidas o eliminadas respecto al modelo base del que deriva.

La model card publicada es practicamente vacia: solo contiene la declaracion de licencia Apache 2.0, sin informacion sobre arquitectura, datos de entrenamiento, contexto, idiomas o rendimiento. El repositorio registra cero descargas y cero "likes" en el momento de la consulta, y no tiene pipeline declarado, lo que impide confirmar la tarea para la que fue configurado.

Por tanto, esta ficha se limita a documentar los datos verificables (identificador, autor, licencia, fecha de publicacion y el caracter presuntamente derivado del modelo) y marca explicitamente como "no disponible" todo aquello que el autor no ha hecho publico. Cualquier evaluacion de calidad, sesgos o idoneidad para produccion requiere una validacion empirica por parte del usuario, dado que no existe documentacion tecnica de respaldo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el nombre sugiere transformer decoder-only, sin confirmar) |
| Parametros totales | ~1.5B (inferido del nombre, no confirmado en la model card) |
| Parametros activos | no aplica (no hay indicios de que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura en la model card. El nombre del repositorio indica un tamano de aproximadamente 1.5B parametros y una orientacion a codigo, pero no se especifica si deriva de un modelo base conocido, si se ha sometido a fine-tuning supervisado, DPO/RLHF o a un proceso de "abliteration" u otra tecnica de eliminacion de rechazos (de ahi el sufijo "Uncensored").

Tampoco hay datos sobre el volumen de tokens de entrenamiento, la composicion del dataset, el uso de datos sinteticos ni las tecnicas de alineacion aplicadas o retiradas. Toda afirmacion sobre el proceso de entrenamiento seria especulativa y, por tanto, se marca como no disponible.

## Capacidades

- Generacion de codigo: el nombre del modelo sugiere especializacion en tareas de programacion, aunque no hay evaluacion publicada que lo confirme.
- Generacion de texto general: presumible, no documentada.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Modo "thinking" o razonamiento extendido: no disponible.
- Vision o audio: no disponible.
- Comportamiento "uncensored": segun el nombre, cabria esperar una menor tasa de rechazos ante peticiones sensibles, pero no hay documentacion que describa que filtros se han retirado ni como.

## Casos de uso

- Prototipado rapido de asistentes de codigo en local: un modelo de ~1.5B puede ejecutarse en equipos de consumo y servir para experimentar con autocompletado o generacion de fragmentos de codigo antes de invertir en modelos mayores.
- Investigacion sobre alineacion y seguridad: la variante "uncensored" permite estudiar como cambia la tasa de rechazos y la calidad de respuesta al retirar capas de alineacion, comparandola con el modelo base si se identifica.
- Fine-tuning especifico de dominio: su tamano reducido facilita ajustes con LoRA o QLoRA sobre datasets propios de codigo en una unica GPU consumer.
- Generacion de tests unitarios y documentacion tecnica: tareas de bajo riesgo donde la supervision humana posterior es sencilla y el coste de un error es limitado.
- Educacion y demostraciones: util para ilustrar en clase o en talleres como funciona un LLM pequeno y que diferencias introduce el fine-tuning frente al modelo original.
- Entornos con requisitos de privacidad: al poder ejecutarse en local, permite procesar codigo propietario sin enviarlo a APIs externas, siempre que se valide su calidad previamente.

En todos los casos, la ausencia de benchmarks y de model card detallada obliga a realizar una evaluacion propia antes de usar el modelo en cualquier flujo relevante.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: orientativa, en torno a 3-4 GB en cuantizacion de 4 bits para un modelo de ~1.5B, y aproximadamente 3 GB en FP16 (2 bytes por parametro mas overhead). Son estimaciones basadas en el tamano nominal, no en mediciones del autor.
- GPU recomendadas: cualquier GPU consumer con 6-8 GB de VRAM o mas (RTX 3060, RTX 4060, RTX 4090) deberia poder alojarlo en cuantizaciones bajas; para FP16 basta con 4-6 GB.
- Cabe en GPU consumer: si, previsiblemente en la mayoria de tarjetas con 6 GB o mas, aunque no hay confirmacion oficial.
- Opciones de despliegue: no documentadas por el autor; al no haber pesos publicados en formato conocido segun la informacion disponible, no se puede confirmar compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Documentacion | Disponibilidad |
|---|---|---|---|---|---|
| Kaliyo/Mukesh-AI-Coder-1.5B-Uncensored | ~1.5B (inferido) | no disponible | Apache 2.0 | Practicamente inexistente | Repositorio con 0 descargas |
| Qwen2.5-Coder-1.5B | 1.5B | 32K (segun su model card publica) | Apache 2.0 | Completa, con benchmarks | Amplia adopcion |
| DeepSeek-Coder-1.3B | 1.3B | 16K (segun su model card publica) | Licencia propia de DeepSeek | Completa, con benchmarks | Amplia adopcion |
| StarCoder2-3B | 3B | 16K (segun su model card publica) | BigCode OpenRAIL-M | Completa, con benchmarks | Amplia adopcion |

La comparativa se incluye a titulo orientativo por categoria y tamano; los datos de los modelos alternativos provienen de sus respectivas model cards publicas y no de una evaluacion conjunta. Para este modelo concreto no hay datos que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- Ausencia total de model card tecnica: no se documentan datos de entrenamiento, arquitectura, contexto ni evaluaciones, lo que impide auditar el modelo.
- Riesgo elevado de alucinacion: sin benchmarks ni evaluacion de calidad, no hay evidencia de su fiabilidad en tareas de codigo o texto.
- Comportamiento "uncensored": la retirada de capas de alineacion puede aumentar la probabilidad de generar contenido danino, sesgado o legalmente problematico; requiere filtros y supervision externos.
- Sesgos desconocidos: al no publicarse la composicion del dataset, no se puede evaluar el sesgo de genero, idioma, etnia o dominio.
- Idiomas no declarados: se desconoce si soporta castellano u otros idiomas distintos del ingles.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero el usuario asume toda la responsabilidad legal sobre las salidas del modelo.
- Procedencia incierta: no se indica el modelo base del que deriva, lo que dificulta verificar el cumplimiento de licencias de terceros en caso de que exista una cadena de derivacion.
- Cero traccion en la comunidad: sin descargas ni "likes", no hay evidencia de uso real ni de que los pesos esten completos o funcionales.

## Enlaces

- Hugging Face: https://huggingface.co/Kaliyo/Mukesh-AI-Coder-1.5B-Uncensored
- No se han encontrado otros enlaces (papers, blogs, repositorios o demos) en la informacion disponible.
