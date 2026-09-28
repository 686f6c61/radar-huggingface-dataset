# anon563r/tf-storyrunner-nemo

## Resumen

TF Storyteller Nemo 12B es un fine-tune de mistralai/Mistral-Nemo-Instruct-2407 orientado a un nicho muy concreto: la ficcion de transformacion (TF), un subgenero que describe cambios fisicos y mentales graduales de un personaje (transformaciones animales, antropomorficas o de criatura). El repositorio se publica bajo el identificador `anon563r/tf-storyrunner-nemo`, aunque la model card lo titula "TF Storyteller Nemo 12B". Lo desarrolla el usuario anonimo `anon563r` y se distribuye con licencia Apache 2.0, la misma del modelo base.

Tecnicamente no es un modelo completo, sino un adaptador LoRA (114 MB) entrenado con QLoRA y Unsloth sobre el transformer de 12.247.782.400 parametros de Mistral Nemo Instruct 2407. El repositorio incluye ademas una cuantizacion GGUF Q5_K_M lista para ejecutar (8,7 GB) y un `Modelfile` para Ollama, de modo que puede desplegarse en local sin ensamblar nada.

Su relevancia es acotada pero clara: demuestra que con 227 relatos (~1,06 millones de palabras) y una sola RTX 4070 Super se puede especializar un modelo de 12B en un estilo narrativo muy marcado en menos de dos horas. Esta pensado exclusivamente para generacion de ficcion en ingles y contiene material para adultos, por lo que no es apto para uso generalista ni para pipelines de produccion que requieran moderacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Mistral Nemo Instruct 2407) con adaptador LoRA |
| Parametros totales | 12.247.782.400 (~12,2B) en el modelo base; adaptador LoRA de 114 MB |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 8.192 tokens durante el entrenamiento; la model card recomienda 8k-12k en inferencia. El modelo base Mistral-Nemo-Instruct-2407 declara hasta 128k, pero no se especifica si el adaptador conserva esa ventana completa |
| Tipos de cuantizacion | GGUF Q5_K_M incluida en el repo (8,7 GB); adaptador en safetensors (114 MB). No se listan otras cuantizaciones precalculadas |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT), GGUF (Q5_K_M), `Modelfile` y plantilla de chat Mistral `[INST] ... [/INST]` |
| Libreria | peft (compatible con transformers, llama.cpp, Ollama, LM Studio, KoboldCpp) |
| Tamano del repositorio | 8,9 GB |
| Fecha de publicacion | 27 de septiembre de 2026 (creado y actualizado el mismo dia) |
| Descargas / likes | 0 descargas / 1 like en el momento de la consulta |

## Arquitectura y entrenamiento

El modelo reutiliza la arquitectura transformer decoder-only de Mistral Nemo Instruct 2407 (12,2B parametros) y anade un adaptador LoRA de rango 16 y alpha 16 aplicado a todas las proyecciones de atencion y MLP. El entrenamiento se hizo con QLoRA sobre el modelo base cuantizado a 4 bits, usando la libreria Unsloth, con contexto de 8.192 tokens, dos epocas, tasa de aprendizaje 1e-4 y tamano de lote efectivo 8. La perdida se calculo unicamente sobre el texto del relato, no sobre el prompt. Todo el proceso cupo en una sola RTX 4070 Super de 12 GB y tardo aproximadamente 1 hora y 40 minutos.

El dataset es privado y no se distribuye en el repositorio. Consta de 227 relatos unicos (~1,06 millones de palabras) tras eliminar duplicados exactos, versiones con distinto formato y casi duplicados. Se eliminaron titulos, firmas, lineas de encargo, etiquetas, recuentos de palabras, enlaces y notas del autor, preservando la estructura de parrafos. Cada relato se emparejo con un prompt corto del tipo "Write a story about...", generado localmente a partir de su contenido, y los textos de mas de ~5.500 palabras se dividieron en 2-3 partes con prompts de continuacion. El reparto fue de 214 relatos para entrenamiento (296 ejemplos) y 13 reservados para validacion. La perdida en validacion bajo de 2,406 a 2,375 sin signos de sobreajuste al final del entrenamiento. El modelo se entreno sin system prompt.

## Capacidades

- Generacion de ficcion narrativa en ingles, con enfasis en arcos completos (planteamiento, nudo y desenlace) y control aproximado de longitud mediante una linea `Length: about N words`.
- Escritura en primera, segunda y tercera persona, segun se indique en el prompt.
- Especializacion estilistica en transformaciones fisicas y mentales graduales: cambios animales, antropomorficos y de criatura.
- Generacion de contenido para adultos (el autor advierte que buena parte del corpus de entrenamiento es sexualmente explicito y que el modelo producira material maduro con frecuencia).
- Formato conversacional de un solo turno mediante la plantilla Mistral `[INST] ... [/INST]`, con soporte de `apply_chat_template` en transformers.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo "thinking".
- No se documentan capacidades multilingues: solo figura el ingles entre los idiomas soportados, aunque el modelo base sea multilingue.
- No incorpora capa de moderacion, igual que el modelo base.

## Casos de uso

- Redaccion de ficcion de transformacion por encargo: el modelo acepta una premisa breve y produce un relato completo de principio a fin, lo que reduce el trabajo de primer borrador en un genero donde la estructura del cambio fisico suele ser repetitiva de modelar.
- Motor narrativo para juegos de texto o ficcion interactiva: con 8k-12k tokens de contexto se pueden mantener escenas largas y coherentes, y la descripcion de transformaciones graduales encaja con mecanicas de progresion por etapas.
- Asistente de escritura para autores de genero: sirve para explorar variaciones de una misma premisa cambiando persona narrativa, tono o escenario, ya que el entrenamiento cubre multiples estilos dentro del genero.
- Prototipado rapido de arcos argumentales: generar un relato completo permite validar si una premisa funciona antes de invertir tiempo en escribirla, y la linea `Length:` ayuda a ajustar el ritmo del borrador.
- Generacion de ramificaciones narrativas: al poder regenerar con distinta semilla y temperatura, resulta util para producir multiples ramas de una misma escena en estructuras de branching narrative.
- Base para fine-tunes mas especificos: al ser un adaptador LoRA de 114 MB sobre Mistral Nemo, es barato reentrenar o fusionar el adaptador con otros datasets del mismo genero sin partir de cero.
- Ejecucion local y privada de contenido para adultos: la cuantizacion GGUF Q5_K_M funciona con Ollama, llama.cpp, LM Studio o KoboldCpp en equipos de consumo, lo que permite usar el modelo sin enviar prompts a servicios externos, algo relevante dado el caracter explicito del contenido.
- Comparacion estilistica y evaluacion de tecnicas de fine-tuning: el caso documenta un flujo reproducible (QLoRA + Unsloth + 227 ejemplos) que sirve como referencia para experimentos de especializacion de nicho con presupuesto de hardware minimo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas tipo MMLU, HumanEval, GSM8K ni evaluaciones de calidad literaria. El unico dato numerico de rendimiento es la perdida en el conjunto de validacion durante el entrenamiento:

| Metrica | Valor |
|---|---|
| Perdida en validacion (inicio → fin) | 2,406 → 2,375 |
| Relatos de validacion | 13 (reservados de 227) |
| Ejemplos de entrenamiento | 296 (a partir de 214 relatos) |
| Epocas | 2 |
| Tiempo de entrenamiento | ~1 h 40 min en una RTX 4070 Super (12 GB) |

## Requisitos de hardware

- Adaptador LoRA: 114 MB en disco, pero requiere cargar el modelo base completo Mistral-Nemo-Instruct-2407 (25 GB en safetensors).
- Inferencia en BF16/FP16: aproximadamente 24,5 GB de VRAM solo para pesos, mas cache KV; necesita A100 40 GB, H100 o dos GPU de 24 GB.
- Inferencia en GGUF Q5_K_M: el archivo pesa 8,7 GB; con contexto de 8k el uso real se situa en torno a 10-11 GB de VRAM, por lo que cabe en RTX 3060 12 GB, RTX 4070/4070 Super, RTX 4080 y RTX 4090.
- Cuantizaciones de 4 bits (Q4_K_M o similares, no incluidas en el repo) dejarian el modelo en torno a 7-7,5 GB, lo que permitiria ejecutarlo en GPU de 8 GB con contexto reducido o en CPU con RAM suficiente.
- Cabe en GPU de consumo: si, en cualquier tarjeta con 12 GB o mas usando la Q5_K_M incluida. El propio autor entreno el adaptador en una RTX 4070 Super de 12 GB.
- Opciones de despliegue: Ollama (tanto desde el Hub como con el `Modelfile` local), llama.cpp, LM Studio, KoboldCpp, y transformers + PEFT para el adaptador. No se documentan recetas para vLLM ni TGI, aunque el adaptador puede fusionarse con el base y servirse con esos motores.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TF Storyteller Nemo 12B (este) | 12,2B (base) + LoRA r16 | Entrenado a 8.192; recomendado 8k-12k | Ficcion de transformacion, solo ingles, contenido adulto | Apache 2.0 | Adaptador safetensors + GGUF Q5_K_M |
| Mistral-Nemo-Instruct-2407 (base) | 12,2B | 128k segun la documentacion del base | Instrucciones generales, multilingue, con alineamiento | Apache 2.0 | Pesos completos en safetensors y GGUF |
| Llama 3.1 8B Instruct | 8B | 128k | Instrucciones generales, tool calling, multilingue | Licencia comunitaria Llama 3.1 | Pesos completos en safetensors y GGUF |
| Gemma 2 9B IT | 9B | 8k | Instrucciones generales, multilingue | Terminos de uso de Gemma | Pesos completos en safetensors y GGUF |

La comparativa se limita a parametros, contexto, licencia y formato, porque no hay benchmarks publicados de este fine-tune que permitan contrastar calidad de generacion. Frente al base, la diferencia no es de capacidad general sino de estilo: el adaptador sacrifica potencialmente el comportamiento multilingue y la adherencia a instrucciones generales a cambio de reproducir las convenciones del subgenero TF.

## Limitaciones y advertencias

- Bucles de repeticion: en algunas peticiones el modelo repite parrafos enteros, sobre todo en generaciones largas. La solucion recomendada es detener y regenerar con otra semilla o subir la penalizacion por repeticion.
- Control de longitud aproximado: los relatos suelen superar la longitud solicitada, en ocasiones entre dos y tres veces.
- Calidad de prosa variable: el corpus de entrenamiento mezcla textos pulidos con otros toscos, y esa variabilidad se traslada a la salida.
- Fuga de datos de entrenamiento: el modelo puede reproducir nombres, frases o tramas procedentes de los relatos con los que se entreno.
- Sin capa de moderacion, igual que el modelo base. El autor advierte que buena parte de los datos de entrenamiento es contenido sexualmente explicito y que el modelo generara material maduro con frecuencia; esta marcado como 18+ y con la etiqueta `not-for-all-audiences`.
- Solo ingles: la model card declara unicamente `en`, pese a que el base es multilingue.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el contenido generado puede ser explicito y el despliegue en producto exigiria moderacion externa y verificacion de edad.
- Ventana de contexto: aunque el base declare 128k, el fine-tune se entreno a 8.192 tokens y la model card recomienda no pasar de 12k; no hay evidencia de que mantenga coherencia mas alla de ese rango.
- Adopcion practica nula: 0 descargas y 1 like en el momento de la consulta, sin mantenimiento posterior documentado ni versiones adicionales.
- El dataset de entrenamiento no es publico, por lo que no es posible auditar sesgos, procedencia de los textos ni derechos sobre ellos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/anon563r/tf-storyrunner-nemo
- Modelo base: https://huggingface.co/mistralai/Mistral-Nemo-Instruct-2407
- Unsloth (framework de entrenamiento usado): https://github.com/unslothai/unsloth
- Paper, blog o demo adicionales: no disponible en la informacion proporcionada
