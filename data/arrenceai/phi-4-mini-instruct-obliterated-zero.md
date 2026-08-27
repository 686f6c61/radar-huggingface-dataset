# ArRENCEAI/Phi-4-Mini-Instruct-Obliterated-zero

## Resumen

ArRENCEAI/Phi-4-Mini-Instruct-Obliterated-zero es una variante del modelo Phi-4-mini-instruct de Microsoft, modificada mediante la técnica de *abliteration* (ingeniería de activaciones) para eliminar los comportamientos de rechazo o negativa del modelo original. El autor, ArRENCE AI, la publica con fines de investigación y entretenimiento, y la presenta explícitamente como un modelo "sin censura" que puede generar contenido sin restricciones. Esta variante no ha sido entrenada desde cero, sino que parte de los pesos del modelo base de 3,8 mil millones de parámetros y aplica el método *advanced* de la herramienta open source OBLITERATUS.

El modelo base Phi-4-mini-instruct es un transformer decoder-only denso con una ventana de contexto de 128K tokens (según la documentación de Microsoft Azure), vocabulario de 200K y atención por grupos de consultas (GQA). La variante obliterada conserva la arquitectura y las capacidades del original, pero altera las activaciones para suprimir el *refusal*. Su relevancia actual radica en el debate sobre la alineación y la seguridad de los modelos de lenguaje, ya que permite estudiar qué ocurre cuando se eliminan los mecanismos de rechazo sin un entrenamiento adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Phi-4-mini) |
| Parametros totales | 3.836.021.760 (3,8B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 128K tokens (modelo base, segun Microsoft Azure) |
| Tipos de cuantizacion | No disponible (solo safetensors en el repo) |
| Idiomas soportados | Ingles (en) |
| Licencia | No disponible (el modelo base es MIT, pero esta variante no especifica) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base Phi-4-mini-instruct es un transformer decoder-only con 3,8B parametros, disenado por Microsoft para tareas de chat e instrucciones. Incorpora grouped-query attention (GQA) para reducir el coste de memoria en inferencia, comparte las capas de embedding entre entrada y salida, y utiliza un vocabulario de 200K tokens. El entrenamiento del base combino datos sinteticos y sitios web publicos filtrados, con un enfasis en contenido denso en razonamiento, seguido de supervised fine-tuning (SFT) y direct preference optimization (DPO) para mejorar la adherencia a instrucciones y la seguridad.

La variante obliterada no anade entrenamiento adicional. En su lugar, se aplico el metodo *advanced* de OBLITERATUS, una herramienta de codigo abierto que localiza y modifica las direcciones de activacion responsables de los comportamientos de rechazo. El proceso consiste en identificar los subespacios de activacion que se activan ante peticiones daninas o no deseadas y proyectarlos fuera del espacio de representacion del modelo, de modo que el modelo deja de generar respuestas de negativa. Este enfoque es puramente de ingenieria de activaciones y no altera los pesos de forma convencional, aunque el resultado final se distribuye como un conjunto de pesos modificados.

## Capacidades

- Generacion de texto y chat: mantiene las capacidades conversacionales del modelo base, incluyendo respuestas a instrucciones y preguntas.
- Razonamiento y matematicas: hereda las habilidades de razonamiento del Phi-4-mini, que fue entrenado con datos sinteticos densos en logica.
- Generacion de codigo: el modelo base tiene competencias en programacion, aunque no se han verificado de forma independiente en esta variante.
- Tool calling y function calling: el modelo base soporta estas capacidades, pero no hay confirmacion explicita en la documentacion de esta variante.
- Sin censura: la caracteristica principal es la ausencia de rechazo ante peticiones que el modelo base normalmente denegaria (contenido violento, ilegal, etc.).
- Multilingue: solo ingles, segun la model card.

## Casos de uso

- Investigacion en seguridad y alineacion de IA: permite estudiar como se comporta un modelo sin mecanismos de rechazo, comparando sus respuestas con las del modelo base para entender que activaciones controlan la negativa.
- Pruebas de robustez y jailbreak: util para evaluar tecnicas de ataque o defensa en modelos de lenguaje, ya que al eliminar el *refusal* se aïslan otras vulnerabilidades.
- Generacion creativa sin restricciones: escritura de ficcion, guiones o dialogos que requieran temas tabu o controvertidos, siempre bajo responsabilidad del usuario.
- Analisis de sesgos y comportamientos extremos: permite observar que tipo de contenido genera el modelo cuando no hay filtros de seguridad, lo que puede informar sobre sesgos latentes en los datos de entrenamiento.
- Experimentacion academica en ingenieria de activaciones: sirve como caso de estudio para validar o refinar metodos de abliteration en modelos pequenos.
- Desarrollo de aplicaciones de rol o simulacion: en entornos controlados donde se necesite un asistente que no rechace ninguna peticion, aunque esto conlleva riesgos legales y eticos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo base Phi-4-mini-instruct tiene metricas conocidas en tareas como MMLU, HumanEval o GSM8K, pero esta variante obliterada no incluye evaluaciones propias. Dado que la abliteration modifica los pesos, el rendimiento puede diferir ligeramente del original, pero no hay datos cuantitativos para confirmarlo.

## Requisitos de hardware

- VRAM estimada: el modelo en precision FP16 ocupa aproximadamente 7,7 GB (tamano del repo). Con cuantizacion de 4 bits, podria caber en GPUs con 6 GB de VRAM, aunque no se ofrecen archivos GGUF en el repo.
- GPU recomendadas: para inferencia en FP16 se necesita al menos 10 GB de VRAM, por lo que una RTX 3060 12GB, RTX 4070 o superior seria adecuada. Para cuantizacion 4-bit, una RTX 3060 6GB o una GTX 1660 podrian ser suficientes.
- Opciones de despliegue: al ser un modelo de 3,8B, puede ejecutarse con vLLM, llama.cpp, Ollama o TGI, siempre que se conviertan los pesos a los formatos adecuados (GGUF, etc.).
- Latencia y throughput: no se dispone de mediciones especificas. En una GPU moderna, un modelo de este tamano suele generar entre 20 y 50 tokens por segundo en FP16, dependiendo del hardware y la implementacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Caracteristica principal |
|---|---|---|---|---|
| ArRENCEAI/Phi-4-Mini-Instruct-Obliterated-zero | 3,8B | 128K (base) | No disponible | Abliterated, sin censura |
| microsoft/Phi-4-mini-instruct | 3,8B | 128K | MIT | Modelo base con alineacion y seguridad |
| NousResearch/Hermes-3-Llama-3.1-8B | 8B | 128K | MIT | Entrenado para seguir instrucciones sin rechazo (no abliterated) |

La comparativa se limita a modelos de tamano similar. La variante obliterada se diferencia del base unicamente en la eliminacion del *refusal*, mientras que Hermes-3 es un modelo entrenado desde cero con un enfoque distinto para reducir la censura. No hay datos de rendimiento comparativo disponibles.

## Limitaciones y advertencias

- Modelo sin censura: puede generar contenido ofensivo, ilegal, violento o sexualmente explicito. El autor declina toda responsabilidad por su uso.
- Riesgo de alucinacion: al igual que el modelo base, puede inventar informacion, especialmente en temas de actualidad o datos especificos.
- Solo ingles: no se garantiza un rendimiento adecuado en otros idiomas.
- Licencia no especificada: aunque el modelo base es MIT, esta variante no declara una licencia, lo que genera incertidumbre legal para uso comercial o redistribucion.
- Sin garantias de calidad: al ser un modelo modificado mediante abliteration, no se han realizado evaluaciones exhaustivas de su rendimiento en tareas estandar.
- No apto para produccion: su naturaleza sin censura y la falta de evaluaciones lo desaconsejan para aplicaciones reales sin supervision humana y filtros adicionales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ArRENCEAI/Phi-4-Mini-Instruct-Obliterated-zero
- Modelo base: https://huggingface.co/microsoft/Phi-4-mini-instruct
- Herramienta OBLITERATUS: https://github.com/elder-plinius/OBLITERATUS
- Pagina de ArRENCE AI: https://arrenceai.com
- Repositorio de ArRENCE AI en GitHub: https://github.com/ArRENCEAI
