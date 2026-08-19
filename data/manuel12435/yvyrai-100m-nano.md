# Manuel12435/YvyrAI-100m-Nano

## Resumen

YvyrAI-100m-Nano es la primera LLM paraguaya con arquitectura propia entrenada desde cero, desarrollada por Manuel12435. Con 105,86 millones de parámetros y un corpus de 891 millones de tokens en español, el modelo no es un fine-tune ni una reimplementación de arquitecturas existentes: el tokenizer, el corpus, el bloque de deliberación recurrente y los pesos se construyeron específicamente para este proyecto. Su principal innovación técnica es un bloque de deliberación recurrente que se aplica hasta 8 veces sobre el estado, con halting aprendido, re-inyección de la entrada y memoria latente con decaimiento, lo que aporta una mejora medida del 8,2% en loss y del 29,5% en perplejidad frente a una sola iteración.

El modelo está pensado para generación de texto en español y se distribuye bajo licencia Apache 2.0. Es un modelo base, sin ajuste de instrucciones, con una ventana de contexto de 1024 tokens. Su relevancia radica en ser un experimento arquitectónico reproducible: demuestra que la profundidad recurrente aporta mejoras reales en un régimen de datos reducido (8,4 tokens por parámetro frente a los ~20 del punto óptimo de Chinchilla), y sirve como referencia para la comunidad hispanohablante interesada en arquitecturas alternativas al transformer denso estándar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer backbone de 12 capas + bloque de deliberacion recurrente con halting aprendido (hasta 8 iteraciones) |
| Parametros totales | 105.859.139 (105,86M) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | No publicado (el cache KV interno esta cuantizado, pero no se documentan formatos de cuantizacion de pesos) |
| Idiomas soportados | Español (es) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, precision fp32 |

## Arquitectura y entrenamiento

El modelo combina un backbone transformer denso de 12 capas con un bloque de deliberacion recurrente: un unico bloque transformer que se aplica de forma iterativa sobre el estado hasta 8 veces, con un mecanismo de halting aprendido que decide cuando detener la iteracion. Cada paso re-inyecta la entrada original mediante concatenacion y un adaptador, e incorpora cabezas auxiliares de verificacion y reparacion, asi como una memoria latente con decaimiento. Con 8 iteraciones, la deliberacion representa el 40% del computo total aunque solo suponga el 10% de los parametros. El tokenizer es propio, con un vocabulario de 24.576 tokens, y comprime el espanol a 4,25 caracteres por token frente a los 2,92 de GPT-2.

El entrenamiento se realizo desde cero sobre un corpus de 4.200.085 documentos con un 96,3% de pureza de espanol, mayoritariamente procedente de CulturaX (82,5% web). Se usaron 891.135.906 tokens con un contexto de 1024 tokens, un batch efectivo de 262.144 tokens por paso y 3.814 pasos de optimizador. La precision de entrenamiento fue bf16 con autocast y master weights en fp32; los pesos publicados estan en fp32. El entrenamiento se ejecuto en una unica GPU (no se especifica el modelo). No se aplico RLHF ni DPO; es un modelo base sin ajuste de instrucciones.

## Capacidades

- Generacion de texto en espanol: produce texto coherente y con buena forma linguistica, dado que su corpus es mayoritariamente web en espanol general.
- Continuacion de texto: al ser un modelo base, continua texto de forma natural si se le proporciona la plantilla de entrenamiento obligatoria (`<|bos|><|sistema|>...<|usuario|>...<|respuesta|>`).
- Deliberacion recurrente: el bloque de deliberacion permite ajustar la profundidad de computo en inferencia (entre 1 y 8 iteraciones), con un optimo medido en 7 iteraciones.
- Compresion eficiente del espanol: su tokenizer consigue un 46% mejor compresion en caracteres por token que GPT-2 sobre texto en espanol.
- No soporta tool calling, ni funciones de agente, ni vision, ni audio. No tiene modo de razonamiento explicito ni capacidades multilingues mas alla del espanol.

## Casos de uso

- Investigacion academica en arquitecturas recurrentes: el modelo permite reproducir y estudiar el efecto de la deliberacion recurrente sobre la perplejidad y la loss, con un barrido documentado de 1 a 8 iteraciones. Es util para comparar contra un transformer denso iso-FLOP en un entorno controlado.
- Experimentacion con tokenizers especializados en espanol: su tokenizer de 24.576 tokens, disenado para espanol, sirve como referencia para medir el impacto de la compresion tokenizadora en modelos pequenos.
- Generacion de texto en espanol para prototipos: con la plantilla adecuada y temperatura entre 0,5 y 0,7, puede generar parrafos coherentes sobre temas generales, adecuado para demos o pruebas de concepto sin requisitos de factualidad.
- Ensenanza y formacion en LLMs: al ser un modelo pequeno (105M) con codigo de inferencia incluido en el repo, es adecuado para cursos que expliquen el pipeline completo de una LLM: tokenizacion, arquitectura, muestreo y evaluacion.
- Benchmark de eficiencia en hardware modesto: al caber en una GPU de consumo (incluso en CPU), sirve para medir latencias y throughput de arquitecturas recurrentes frente a modelos densos equivalentes en entornos limitados.
- Base para fine-tuning en espanol: aunque no esta ajustado para instrucciones, su licencia Apache 2.0 permite fine-tuning posterior sobre tareas especificas en espanol, siempre que se asuma el riesgo de alucinacion inherente a su bajo regimen de datos.

## Benchmarks y rendimiento

El autor publica dos conjuntos de mediciones. El primero es un barrido sobre el mismo checkpoint con el holdout GSM8K-es (192 ejemplos), que muestra la contribucion de la profundidad recurrente:

| iteraciones | loss | perplejidad |
|---|---|---|
| 1 | 4.2465 | 69.86 |
| 2 | 4.0063 | 54.94 |
| 4 | 3.9122 | 50.01 |
| 7 | 3.8975 | 49.28 |
| 8-16 | 3.8975 | 49.28 |

El segundo compara bits por caracter (bpc) con GPT-2 124M sobre el mismo texto, ya que los tokenizers son distintos (24.576 vs 50.257 tokens) y la perplejidad por token no seria comparable:

| conjunto | YvyrAI 100M | GPT-2 124M | diferencia |
|---|---|---|---|
| Espanol (web, held-out) | 1.3625 | 2.2238 | YvyrAI +63,2% mejor |
| Ingles (Wikipedia) | 2.0078 | 1.0280 | GPT-2 +95,3% mejor |

No se han publicado resultados en benchmarks estandar como MMLU, HumanEval o GSM8K completos. El autor advierte explicitamente que estos numeros no prueban superioridad arquitectonica: la ventaja en espanol se explica por la especializacion de idioma (corpus y tokenizer dedicados), y que la pregunta arquitectonica se respondera con un A/B contra un modelo denso iso-FLOP que esta en curso.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en fp32 ocupan aproximadamente 423 MB (105,86M parametros x 4 bytes). Con el cache KV y overhead de ejecucion, cabria en menos de 1 GB de VRAM.
- GPU recomendadas: cualquier GPU de consumo con al menos 2 GB de VRAM (p. ej., GTX 1650, RTX 3060) es suficiente. Tambien puede ejecutarse en CPU, aunque la deliberacion recurrente (hasta 8 iteraciones) incrementa el computo proporcionalmente.
- Compatibilidad con consumer GPU: si, es plenamente compatible con GPUs de gama baja y media.
- Opciones de despliegue: el repo incluye codigo de inferencia propio (`cargar.py` y `chatear.py`) que no depende de `AutoModelForCausalLM`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI; la arquitectura propietaria requiere el codigo incluido en el repo.
- Latencia y throughput: no se proporcionan datos medidos. Dado el tamano del modelo y que la deliberacion supone el 40% del computo con 8 iteraciones, se espera una latencia moderada en GPU de consumo, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Licencia | Notas |
|---|---|---|---|---|---|
| YvyrAI-100m-Nano | 105,86M | 1024 | Espanol | Apache 2.0 | Arquitectura propia con deliberacion recurrente, entrenado desde cero |
| GPT-2 124M | 124M | 1024 | Multilingue (principalmente ingles) | MIT | Transformer denso estandar, punto de comparacion directo del autor |
| BERTIN 117M (espanol) | 117M | 512 | Espanol | Apache 2.0 | Modelo encoder, no generativo; no es comparable directamente en generacion |

La comparacion mas relevante es con GPT-2 124M, que el propio autor mide en bpc: YvyrAI gana en espanol (+63,2%) y pierde en ingles (-95,3%). Frente a BERTIN, la comparacion no es directa por ser un encoder. No hay otros modelos generativos pequenos en espanol con arquitectura recurrente publicados en el ecosistema open source con los que se pueda comparar de forma significativa.

## Limitaciones y advertencias

- Alucinacion severa: con solo 8,4 tokens por parametro (frente a los ~20 del punto compute-optimo de Chinchilla), el modelo ha aprendido la forma del espanol antes que los hechos. Preguntado por la capital de Paraguay, responde cosas como "Rio del Plata". No es una fuente de informacion fiable.
- Sin ajuste de instrucciones: es un modelo base. Sin la plantilla de chat exacta (`<|bos|><|sistema|>...<|usuario|>...<|respuesta|>`), continua texto como si fuera una pagina web, porque el 82,5% de su corpus es web.
- No razona aritmetica: operaciones simples como "15 + 27" no producen resultados correctos.
- Contenido paraguayo minimo: el corpus es espanol general (82,5% web de CulturaX); las fuentes paraguayas son solo el 0,066% de los documentos. El modelo no refleja el registro paraguayo (voseo, lexico local, jopara).
- Sensibilidad a la temperatura: por debajo de 0,2 el modelo colapsa sobre plantillas memorizadas y repite la misma respuesta sin importar la pregunta. Se recomienda temperatura entre 0,5 y 0,7.
- Una sola semilla, sin barras de error: los resultados publicados provienen de un unico entrenamiento, por lo que no se dispone de intervalos de confianza.
- Arquitectura propietaria: no carga con `AutoModelForCausalLM`; requiere el codigo de inferencia incluido en el repo. No hay soporte documentado para frameworks estandar de despliegue.
- Sin cuantizaciones publicadas: no se ofrecen versiones GGUF, AWQ ni GPTQ, lo que limita su uso en entornos de produccion con requisitos de memoria estrictos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Manuel12435/YvyrAI-100m-Nano
- No se han encontrado papers, blogs, repositorios de codigo adicionales ni demos publicas fuera del repo de HuggingFace en la informacion disponible.
