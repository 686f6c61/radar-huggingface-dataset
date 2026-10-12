# ccharnkij/gpt-oss-120b-Uncensored-GGUF

## Resumen

gpt-oss-120b-Uncensored-GGUF es una version cuantizada en formato GGUF del modelo gpt-oss-120b-Uncensored, un ajuste fino de openai/gpt-oss-120b realizado por el usuario ccharnkij. El objetivo declarado es ofrecer respuestas con menos restricciones de alineacion (etiquetadas como "uncensored") manteniendo las capacidades de razonamiento del modelo base, y empaquetarlo en GGUF para permitir su ejecucion en herramientas de inferencia local como llama.cpp, Ollama o LM Studio. El repositorio ocupa 321,6 GB, lo que indica que contiene varias cuantizaciones del mismo modelo.

El modelo base, openai/gpt-oss-120b, es un transformer de tipo Mixture-of-Experts (MoE) con 116.829.156.672 parametros totales (aproximadamente 117.000 millones) y del orden de 5.000 millones de parametros activos por token, con una ventana de contexto de 128.000 tokens y licencia Apache 2.0. Al heredar esa arquitectura, este ajuste conserva el regimen de razonamiento del original, pero sustituye el comportamiento de seguridad por respuestas sin filtrado, lo que lo situa en el terreno de la investigacion y el red teaming mas que en el de produccion orientada al usuario final.

Su relevancia actual radica en que permite desplegar localmente un modelo de razonamiento de gran tamano en formato GGUF, algo poco habitual en modelos de este porte, y en que sirve como caso de estudio sobre hasta que punto un ajuste fino puede alterar el comportamiento de rechazo de un modelo alineado. El autor lo distribuye exclusivamente para fines de investigacion y educativos, bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE), heredada de openai/gpt-oss-120b |
| Parametros totales | 116.829.156.672 |
| Parametros activos | Aproximadamente 5.000 millones por token (segun el modelo base; no confirmado por el autor de este ajuste) |
| Longitud de contexto | 128.000 tokens (heredada del modelo base; no confirmada en la model card del ajuste) |
| Tipos de cuantizacion | GGUF con varios niveles; los niveles concretos no estan detallados en la model card |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base openai/gpt-oss-120b: un transformer con capas de atencion y mecanismo Mixture-of-Experts, disenado para activar solo una fraccion de sus parametros por token. Ese diseno permite que un modelo de casi 117.000 millones de parametros totales opere con un coste de computo por token comparable al de un modelo denso mucho mas pequeno, lo que facilita su despliegue en configuraciones con VRAM limitada en relacion con su tamano. El modelo base se distribuye con cuantizacion nativa MXFP4 en sus pesos originales.

Sobre el proceso de entrenamiento especifico de este ajuste no hay informacion disponible: la model card no detalla el dataset utilizado, el numero de tokens de entrenamiento, la composicion de los datos, ni si se emplearon tecnicas de RLHF o DPO para inducir el comportamiento "uncensored". Tampoco se documentan hiperparametros de fine-tuning ni el metodo exacto con el que se elimino el comportamiento de rechazo. Lo unico verificable es que parte de openai/gpt-oss-120b y que el resultado se ha reempaquetado en GGUF.

## Capacidades

- Generacion de texto conversacional en ingles, con el pipeline declarado por el autor como text-generation.
- Razonamiento multi-paso y modo de pensamiento, heredados de la arquitectura gpt-oss del modelo base.
- Respuestas con menor tasa de rechazo ante peticiones que el modelo original declinaria, que es el proposito declarado del ajuste.
- Capacidad de razonamiento general y resolucion de problemas propia de un modelo de su escala.
- Perfil orientado a investigacion y generacion de datos sinteticos.

No hay informacion en la model card sobre soporte explicito de tool calling, function calling, agentes, vision, audio ni capacidades multimodales de este ajuste concreto. Por herencia del modelo base es probable que conserve parte de ese comportamiento, pero no esta confirmado en la documentacion disponible.

## Casos de uso

- Red teaming y evaluacion de seguridad: permite comprobar como responde un modelo de gran escala sin alineacion ante prompts adversarios, util para estudios de robustez y para calibrar filtros en produccion.
- Generacion de datos sinteticos para investigacion: al reducirse los rechazos, facilita la creacion de corpus en dominios donde el modelo original declinaria generar contenido, siempre dentro de marcos eticos y legales.
- Investigacion sobre alineacion: sirve como referencia de comparacion frente a openai/gpt-oss-120b para medir el efecto del fine-tuning sobre el comportamiento de rechazo.
- Despliegue local de razonamiento en ingles: gracias al formato GGUF puede ejecutarse en estaciones de trabajo con llama.cpp u Ollama para tareas de analisis y generacion de texto sin depender de APIs externas.
- Escritura creativa sin restricciones tematicas: util para ficcion que aborde temas sensibles y que otros modelos filtran por politica de contenido.
- Experimentacion academica con arquitecturas MoE: permite estudiar el comportamiento de un MoE de ~117.000 millones de parametros en entornos controlados de laboratorio.
- Analisis de textos largos en ingles: si se confirma el contexto de 128.000 tokens del modelo base, admite documentos extensos en una sola pasada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra metrica, ni para el ajuste ni para su comparacion con el modelo original.

## Requisitos de hardware

- El repositorio ocupa 321,6 GB, lo que sugiere que contiene varias cuantizaciones; el peso real en disco depende del nivel GGUF que se descargue.
- Estimacion orientativa para un modelo de ~117.000 millones de parametros totales con ~5.000 millones activos: Q4 entre 60 y 75 GB, Q8 en torno a 120 GB y F16 cerca de 230 GB. Son estimaciones basadas en el tamano del modelo, no cifras confirmadas por el autor.
- No cabe en una GPU de consumo unica a cuantizaciones altas. En Q4 podria aproximarse a configuraciones con 24 GB de VRAM mas memoria del sistema, pero no se garantiza un rendimiento fluido.
- GPU recomendadas para despliegue comodo: multiples A100 80 GB, H100 80 GB o configuraciones equivalentes con 2 a 4 aceleradores.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y servidores compatibles con GGUF. El tag endpoints_compatible indica compatibilidad con endpoints de HuggingFace.
- No hay datos de latencia ni throughput publicados. Por su naturaleza MoE y su reducido numero de parametros activos, el throughput por token es mas favorable de lo que sugiere el tamano total, pero no se dispone de cifras medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| gpt-oss-120b-Uncensored-GGUF (este) | ~117.000 M (MoE) | 128.000 tokens (heredado, no confirmado) | Apache 2.0 | GGUF | Ajuste sin filtrado, solo ingles, para investigacion |
| openai/gpt-oss-120b | ~117.000 M (MoE) | 128.000 tokens | Apache 2.0 | safetensors, MXFP4 nativo | Modelo base alineado con comportamiento de rechazo |
| Llama 3.3 70B Instruct | 70.000 M (denso) | 128.000 tokens | Licencia comunitaria Llama | safetensors, GGUF | Alternativa densa con alineacion estandar |
| Qwen2.5 72B Instruct | 72.000 M (denso) | 131.072 tokens | Qwen License (con restricciones) | safetensors, GGUF | Alternativa densa con buen rendimiento multilingue |

No se dispone de datos de rendimiento comparados entre estos modelos dentro de la informacion proporcionada, por lo que la comparativa se limita a parametros, contexto, licencia y disponibilidad.

## Limitaciones y advertencias

- Al estar ajustado para reducir el filtrado, el modelo puede generar contenido danino, ofensivo o inexacto que el modelo base rechazaria. El propio autor lo restringe a fines de investigacion y educativos.
- Riesgo elevado de alucinacion, comun en modelos de lenguaje y no mitigado por el ajuste.
- Idiomas soportados limitados al ingles, segun la model card.
- La documentacion sobre el entrenamiento es practicamente inexistente: no se conocen dataset, tokens, ni metodo de ajuste, lo que dificulta auditar sesgos introducidos.
- Aunque la licencia declarada es Apache 2.0, el uso comercial de un modelo sin filtrado puede entrar en conflicto con normativas de contenido y con las politicas de las plataformas de despliegue.
- El repositorio de 321,6 GB implica requisitos de almacenamiento y ancho de banda considerables para su descarga.
- No hay evidencia publicada de que conserve intactas las capacidades de tool calling o agentes del modelo base; deben verificarse antes de usarlas en produccion.
- El uso en produccion orientada a usuarios finales no es recomendable sin capas adicionales de moderacion y control.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ccharnkij/gpt-oss-120b-Uncensored-GGUF
- Version safetensors de precision completa: https://huggingface.co/ccharnkij/gpt-oss-120b-Uncensored
- Modelo base: https://huggingface.co/openai/gpt-oss-120b
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
