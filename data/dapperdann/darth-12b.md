# DapperDann/DARTH-12B

## Resumen

DARTH-12B es un modelo de lenguaje de 12.247.782.400 parámetros (aproximadamente 12,25 B) de tipo dense, publicado por el usuario DapperDann en HuggingFace bajo licencia Apache-2.0. Se trata de un fine-tune orientado a escritura creativa de ficción oscura sin censura: horror literario, body horror, terror psicológico, violencia gráfica y diálogo soez. No es un modelo de propósito general, sino una especialización de prosa con control de instrucciones, distribuida principalmente en formato GGUF para su ejecución en llama.cpp.

La model card indica que la geometría corresponde a la clase Mistral-Nemo: 12 B dense, hidden size 5120, GQA con ratio 4:1, rope base 1e6 y tokenizer Tekken de 131k entradas de vocabulario. El formato de prompt es el de Mistral-Instruct (`[INST]...[/INST]`). El autor declara 8192 tokens de contexto probados y 128k soportados por la arquitectura, aunque sin verificación publicada más allá de los 8192.

Su relevancia es acotada y muy específica: cubre un nicho (generación de ficción oscura y roleplay sin filtros) con un conjunto de cuantizaciones ya preparadas (Q8_0, Q4_K_M, Q2_K, IQ2_M) y ajustes de sampling documentados por el autor para evitar bucles en prosa larga. No hay benchmarks publicados, el repositorio no registra descargas ni likes en el momento de la ficha y no se han encontrado papers, blogs ni demos asociados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer dense (geometria clase Mistral-Nemo: hidden 5120, GQA 4:1, rope base 1e6) |
| Parametros totales | 12.247.782.400 (aproximadamente 12,25 B) |
| Parametros activos | No aplica (modelo dense) |
| Longitud de contexto | 8192 tokens probados; 128k soportados segun el autor |
| Tipos de cuantizacion | Q8_0, Q4_K_M, Q2_K, IQ2_M (imatrix) |
| Idiomas soportados | No disponible (la model card no declara idiomas; todos los ejemplos estan en ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (pesos completos), GGUF (cuatro cuantizaciones), adaptador LoRA en formato PEFT con tokenizer |

Otros datos: tamano del repositorio 31,1 GB; pipeline `text-generation`; libreria `transformers`; tokenizer Tekken de 131k entradas; formato de prompt Mistral-Instruct.

## Arquitectura y entrenamiento

Arquitectura transformer decoder-only dense de ~12,25 B de parametros, con las dimensiones propias de la familia Mistral-Nemo (hidden 5120, GQA 4:1, rope base 1e6). No se trata de un MoE ni de un modelo hibrido SSM. El tokenizer es Tekken, con un vocabulario de 131k tokens, lo que reduce el numero de tokens necesarios para representar texto en comparacion con vocabularios de 32k. El modelo es exclusivamente de texto y esta pensado para ejecutarse como un unico fichero GGUF en llama.cpp.

El autor no documenta el proceso de entrenamiento: no indica el numero de tokens de fine-tuning, la composicion del dataset, ni si hubo RLHF, DPO o preference tuning. Solo declara que es un fine-tune para escritura creativa con un instruction-following fuerte, y que sigue con precision las instrucciones de control de prosa (por ejemplo, persona narrativa, longitud y tono). El repositorio incluye un adaptador LoRA con su tokenizer, lo que sugiere que el ajuste se realizo mediante PEFT sobre una base de la familia Mistral-Nemo y que los pesos fusionados se publicaron en safetensors; la base exacta no se explicita.

No se declaran innovaciones tecnicas adicionales (decodificacion especulativa, atencion linear ni modos de razonamiento). El unico ajuste operativo documentado es la recomendacion de desactivar `--rope-scaling` y `--no-context-shift` en llama.cpp, y de usar `--repeat-last-n 64` con `--repeat-penalty` igual o superior a 1,05 para evitar bucles en textos largos.

## Capacidades

- Generacion de texto narrativo de formato largo: capitulos de 600-700 palabras con control de persona narrativa (primera, segunda o tercera), registro y estructura.
- Escritura de ficcion oscura: horror literario, body horror, terror psicologico, distopia, violencia grafica y dialogo con lenguaje soez sin moralizacion.
- Instruction-following sobre restricciones de prosa: longitud, punto de vista, numero de voces distinguibles y tono.
- Roleplay conversacional y dialogo multi-turno en `[INST]...[/INST]`, con ajustes de sampling recomendados para mantener coherencia en sesiones largas.
- Generacion sin censura: el autor declara explicitamente que el modelo no aplica filtros de contenido; el uso queda sujeto a la legislacion y a las condiciones de cada despliegue.
- Ejecucion local en CPU o GPU mediante llama.cpp y llama-server, con una sola GGUF.
- Ajuste posterior mediante el adaptador LoRA incluido (transformers/PEFT).
- No disponible: soporte declarado de tool calling, function calling, capacidades de agente, vision, audio, modo thinking o matemáticas/codigo como especialidad. La model card no menciona ninguna de estas capacidades y el enfasis es exclusivamente narrativo.
- Capacidades multilingues: no verificadas ni declaradas.

## Casos de uso

- Escritura de ficcion de terror por entregas: generacion de capitulos de 600-800 palabras con instrucciones precisas de persona narrativa y tono, usando los ajustes de sampling del autor (`temp 0.8`, `top-p 0.95`, `repeat-last-n 64`) para mantener la prosa sin bucles en textos largos.
- Roleplay y guiones de personajes en videojuegos narrativos para adultos: el modelo mantiene voces diferenciadas y registro soez cuando se le pide, adecuado para NPCs de juegos de terror con clasificacion por edad; requiere moderacion en el cliente porque el modelo no filtra.
- Generacion de ficcion interactiva local (interactive fiction, visual novels): despliegue en llama.cpp sobre una estacion de trabajo, sin dependencia de la nube, util para estudios que no quieren enviar material creativo a APIs externas.
- Prototipado rapido de voces narrativas: generacion de variantes de una misma escena con distintos narradores (fiable, no fiable, primera persona) para comparar registros antes de escribir el borrador final.
- Produccion de datasets de escritura creativa: uso del adaptador LoRA y de los pesos fusionados para generar corpus sinteticos de horror y dialogo, o para ajustar variantes sobre el propio modelo con PEFT.
- Red teaming y pruebas de robustez en contenido sensible: el modelo sirve como generador controlado de material grafico o extremo para evaluar clasificadores y sistemas de moderacion en un entorno aislado.
- Edicion y reescritura de escenas existentes: dado su instruction-following sobre control de prosa, puede reescribir un pasaje con una restriccion concreta (por ejemplo, "misma escena, 400 palabras, segunda persona, sin adjetivos abstractos").
- No recomendado como asistente general, para codigo, matematicas, atencion al cliente o tareas factuales: no hay evidencia de rendimiento en esos dominios y el fine-tune esta orientado a ficcion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra metrica, y la busqueda web no ha devuelto resultados relacionados con el modelo. Tampoco hay datos de latencia o throughput medidos. Cualquier comparacion numerica con otros modelos seria especulativa.

## Requisitos de hardware

- VRAM/RAM estimada por cuantizacion, segun los tamanos declarados por el autor: IQ2_M ~3,2 GB; Q2_K ~4,5 GB; Q4_K_M ~7 GB; Q8_0 ~13 GB.
- Pesos completos en safetensors: el repositorio ocupa 31,1 GB, lo que incluye pesos, GGUF y adaptador; en fp16 los 12,25 B de parametros suponen aproximadamente 24,5 GB solo de pesos.
- Cache KV: con la geometria declarada (GQA 4:1), una estimacion de orden de 150-170 KiB por token en fp16, es decir, del orden de 1,3 GB adicionales para 8192 tokens. Es una estimacion, no un dato publicado.
- GPU consumer: Q4_K_M (~7 GB) cabe en GPUs de 8 GB o mas (RTX 3060 Ti 8 GB, RTX 4060 Ti 8/16 GB, RTX 4070, RTX 3080); Q8_0 (~13 GB) requiere 16 GB o mas (RTX 4060 Ti 16 GB, RTX 4080, RTX 4090) o descarga parcial a RAM. El autor advierte explicitamente que una GPU de 2 GB no es suficiente.
- GPU de datacenter: A100 40/80 GB, H100, L40S o L4 permiten ejecutar fp16 y lotes concurrentes; para fp16 completo hacen falta al menos 24-25 GB de VRAM mas cache KV.
- CPU: Q4_K_M y las cuantizaciones de 2 bits son viables en CPU con 16 GB de RAM; el autor documenta `-ngl 0` para ejecucion integra en CPU.
- Opciones de despliegue: llama.cpp / llama-server (soporte de referencia del autor), Ollama importando la GGUF, vLLM o TGI con los pesos safetensors o el adaptador PEFT.
- Latencia y throughput: no disponibles. No hay mediciones publicadas de tokens por segundo en ningun hardware.

## Comparativa con modelos similares

Los datos de los modelos comparados provienen de su documentacion publica habitual y deben verificarse en sus respectivas fichas; el rendimiento de DARTH-12B no se puede comparar numericamente porque no hay benchmarks publicados.

| Modelo | Parametros | Contexto | Licencia | Enfoque | Rendimiento |
|---|---|---|---|---|---|
| DARTH-12B | ~12,25 B dense | 8192 probados / 128k declarados | Apache-2.0 | Ficcion oscura y roleplay sin censura | Sin benchmarks publicados |
| Mistral-Nemo-Instruct-2407 | ~12 B dense | 128k | Apache-2.0 | Instrucciones generales y multilingue | No comparable en esta ficha (sin datos cruzados) |
| Qwen2.5-14B-Instruct | ~14,7 B dense | 32k nativos (128k con YaRN) | Apache-2.0 | Instrucciones generales, codigo y matematicas | No comparable en esta ficha |
| Llama-3.1-8B-Instruct | ~8 B dense | 128k | Llama 3.1 Community License | Instrucciones generales, tool calling | No comparable en esta ficha |

Frente a estos modelos, DARTH-12B se diferencia por la especializacion (prosa de terror y roleplay adulto sin filtros) y por la distribucion ya cuantizada en GGUF; en cambio, carece de la validacion comunitaria, la documentacion de entrenamiento y los benchmarks que acompanan a las alternativas de proposito general. Si el requisito es razonamiento, codigo, tool calling o multilingualidad, las alternativas generalistas son la opcion adecuada; DARTH-12B no declara ninguna de esas capacidades.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay forma de verificar calidad, instruction-following ni perplejidad frente a la base declarada.
- Entrenamiento no documentado: se desconoce el dataset, el numero de tokens de fine-tuning y si hubo alineacion; no se puede evaluar el riesgo de sesgos de origen.
- Contenido explicito sin filtros: el modelo genera violencia grafica, lenguaje soez y material NSFW por diseno. Requiere moderacion de salida, control de edad y cumplimiento de la legislacion aplicable (por ejemplo, normativa de servicios digitales y proteccion de menores en la UE).
- Riesgo de alucinacion: al ser un modelo de ficcion, la verosimilitud de la prosa no implica exactitud factual; no debe usarse como fuente de datos.
- Contexto largo no verificado: 128k es una declaracion de soporte arquitectonico, pero solo hay 8192 probados; el autor recomienda desactivar rope scaling y context shift, lo que sugiere que mas alla de 8192 la calidad puede degradarse.
- Idiomas no declarados: todos los ejemplos estan en ingles; no hay evidencia de calidad en castellano ni en otros idiomas.
- Bucles en prosa larga: el autor considera critico `--repeat-last-n 64` y `repeat_penalty >= 1.05`; ignorar estos ajustes produce deriva de parrafos repetidos.
- Validacion practicamente nula: 0 descargas y 0 likes en el momento de la ficha, autor individual sin historial verificable y repositorio creado y actualizado con siete minutos de diferencia. Tratar como experimento, no como modelo de produccion consolidado.
- Licencia: Apache-2.0 permite uso comercial y modificacion con atribucion, pero no cubre las obligaciones legales derivadas del contenido generado ni los terminos de la base sobre la que se hizo el fine-tune, que no se explicita.
- Sin soporte declarado de tool calling, agentes, vision ni audio: no apto para pipelines de automatizacion que requieran esas capacidades.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/DapperDann/DARTH-12B
- Papers, blogs, repositorios y demos: no disponibles. La busqueda web realizada no devolvio ningun resultado relacionado con el modelo; los enlaces devueltos eran contenido spam sin relacion con DARTH-12B y se han descartado.
