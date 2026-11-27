# AnanseLabs-Org/adom-llm-e4b

## Resumen
adom-llm-e4b es un modelo de traduccion automatica especializado en el par ingles-twi (y con soporte declarado para akan), desarrollado por AnanseLabs-Org. Se construye sobre google/gemma-4-E4B-it mediante destilacion de conocimiento (knowledge distillation, KD) a partir de un profesor gemma-4-31B, con un factor alpha de 0,5 y sobre la mezcla de datos denominada EN->Twi v1 mix. Los pesos finales resultan de fusionar un adaptador LoRA en los pesos completos en bf16, por lo que el artefacto publicado es un modelo denso listo para inferencia con transformers.

El modelo aborda un problema concreto: la escasez de sistemas de traduccion de calidad para lenguas de bajos recursos como el twi y el akan, idiomas hablados en Ghana. Frente a soluciones genericas multilingues, aqui se parte de un modelo base ya instruido (gemma-4-E4B-it) y se especializa mediante destilacion desde un profesor de mayor tamano, lo que permite obtener un modelo mas pequeno con un comportamiento de traduccion afinado al dominio.

Es relevante ahora porque demuestra un patron reproducible de adaptacion de modelos abiertos a lenguas africanas de bajos recursos combinando KD y LoRA, con metricas publicadas sobre un conjunto de evaluacion reservado. El modelo se sirve con una plantilla de chat especifica (chat_template_plain.jinja) bajo el identificador model-llm-e4b, y su licencia es la de Gemma.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de google/gemma-4-E4B-it); no se detalla mas |
| Parametros totales | no disponible (el nombre E4B sugiere un modelo de la familia E4B, sin cifra confirmada en la informacion) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16; no se listan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | tw (twi), ak (akan), en (ingles) |
| Licencia | gemma |
| Formato de pesos | bf16 (LoRA fusionada en pesos completos); formato de fichero no especificado |

## Arquitectura y entrenamiento
El modelo parte de google/gemma-4-E4B-it, un transformer decoder-only de la familia Gemma 4. Sobre esa base se aplica un proceso de destilacion de conocimiento desde un profesor gemma-4-31B, con un coeficiente alpha de 0,5, empleando la mezcla de datos EN->Twi v1 mix. El resultado se obtiene fusionando un adaptador LoRA en los pesos completos en bf16, de modo que el modelo publicado no requiere cargar adaptadores por separado.

La informacion disponible no detalla el numero de tokens de entrenamiento, la composicion exacta del dataset ni si hubo etapas adicionales de RLHF o DPO. Tampoco se especifican innovaciones de inferencia como decodificacion especulativa o atencion lineal. El identificador interno del run es gemma4-e4b-kd31b-en2tw-v1-mix, con fecha 2026-11-27, y el modelo se sirve con la plantilla chat_template_plain.jinja bajo el nombre model-llm-e4b.

## Capacidades
- Traduccion automatica ingles-twi y soporte declarado de akan, con enfasis en la direccion EN->Twi segun la mezcla de entrenamiento.
- Generacion de texto instruccional heredada del modelo base gemma-4-E4B-it.
- Manejo de traduccion a nivel de linea y de parrafo (las metricas distinguen linea, pasaje y closed-book).
- Capacidad multilingue limitada a tw, ak y en.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso en la informacion disponible.
- No se documentan capacidades de vision, audio ni modo de razonamiento explicito.

## Casos de uso
- Traduccion de documentacion tecnica EN->Twi: el modelo puede traducir manuales o guias de usuario al twi, aprovechando su entrenamiento especifico en la mezcla EN->Twi y su mejor rendimiento a nivel de pasaje (chrF++ 48,9).
- Localizacion de interfaces y cadenas de aplicacion: traduccion de cadenas cortas de UI del ingles al twi, con la advertencia de que el rendimiento a nivel de linea es mas bajo (chrF++ 16,9) y requiere revision humana.
- Atencion al ciudadano en Ghana: generacion de respuestas o materiales informativos en twi y akan a partir de fuentes en ingles, apoyandose en el modelo base instruido.
- Subtitulado y transcripcion traducida: traduccion de transcripciones en ingles a twi para contenido educativo o divulgativo, con control de calidad posterior.
- Investigacion en lenguas de bajos recursos: uso como linea base reproducible para experimentos de KD y LoRA en twi/akan, comparando con el profesor gemma-4-31B.
- Preservacion linguistica: generacion de corpus paralelos EN-Twi para ampliar recursos linguisticos, filtrando las salidas con metricas automaticas y revision nativa.
- Prototipado de asistentes conversacionales bilingues: despliegue con transformers y la plantilla chat_template_plain.jinja para conversaciones EN/Twi en entornos de prueba.

## Benchmarks y rendimiento
Resultados publicados por el autor sobre el conjunto de evaluacion reservado (held-out QA set):

| Metrica (held-out QA set) | Valor |
|---|---|
| chrF++ full | 32,9 |
| chrF++ Twi line | 16,9 |
| chrF++ passage | 48,9 |
| chrF++ closed-book | 25,3 |
| Respuestas con twi | 79% |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni comparaciones directas con otros modelos en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible con precision; al publicarse en bf16, el requisito depende del tamano real del modelo base E4B, que no se confirma en la informacion.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; depende del tamano efectivo del modelo base.
- Opciones de despliegue: transformers (libreria declarada); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| adom-llm-e4b | no disponible (base E4B) | no disponible | Traduccion EN-Twi/akan via KD + LoRA | gemma | Hugging Face |
| google/gemma-4-E4B-it | no disponible | no disponible | Modelo base instruido multilingue | gemma | Hugging Face |
| gemma-4-31B (profesor) | no disponible | no disponible | Modelo mayor usado como profesor en KD | gemma | no disponible en la informacion |

No se dispone de datos de rendimiento de los modelos comparables en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa.

## Limitaciones y advertencias
- El modelo esta especializado en EN->Twi; el rendimiento en otras direcciones (Twi->EN) o en akan no esta cuantificado.
- El chrF++ a nivel de linea es bajo (16,9), lo que indica fragilidad en traducciones de fragmentos cortos y desaconseja su uso sin revision en cadenas de UI.
- El 79% de respuestas con twi implica que aproximadamente una de cada cinco respuestas no contiene twi, lo que puede requerir filtrado o postprocesado.
- Riesgo de alucinacion y de deriva hacia el ingles heredado del modelo base instruido.
- No se documentan sesgos especificos, pero al tratarse de una lengua de bajos recursos los datos de entrenamiento pueden estar sesgados en dominio y registro.
- Licencia gemma: el uso comercial esta sujeto a los terminos de la licencia de Gemma, que deben revisarse antes de produccion.
- No se documentan limitaciones de contexto ni de cuantizacion por falta de datos.
- El modelo figura como privado en la model card (cabecera "private"), lo que puede afectar a su disponibilidad publica.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/AnanseLabs-Org/adom-llm-e4b
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Licencia Gemma: https://ai.google.dev/gemma/terms
- No se han encontrado en la busqueda web papers, blogs, repositorios ni demos adicionales.
