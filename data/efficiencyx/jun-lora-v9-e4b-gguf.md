# efficiencyx/Jun-LoRA-v9-E4B-GGUF

## Resumen

Jun-E4B-GGUF (v9) es un ajuste fino con LoRA del modelo Gemma 4 E4B (entrenado con QAT, quantisation-aware training) publicado por efficiencyx. El modelo encarna a Jun, la protagonista de la novela visual *My Dystopian Robot Girlfriend*, y esta disenado especificamente como backend conversacional de la aplicacion local Jun OS. El LoRA esta fusionado directamente en los pesos base, por lo que se distribuye como modelos GGUF autnomos que no requieren cargar el adaptador por separado.

La version v9 introduce tres niveles de razonamiento diferenciados mediante etiquetas `<think:low>`, `<think:med>` y `<think:high>`, cada uno con una forma y longitud de traza propia. Tambien mejora el juicio sobre cuando invocar herramientas, reduce llamadas innecesarias y aumenta la capacidad de guardar memorias relevantes. El modelo responde en el idioma del usuario (italiano, espanol, aleman o japones) aunque el uso de herramientas es mas debil fuera del ingles.

El modelo base declara 7.463.013.674 parametros y se distribuye en tres cuantizaciones GGUF (Q8_0, Q6_K y Q4_K_M), con un tamano de repositorio de 20,4 GB. La licencia es Apache 2.0. No se han publicado resultados de benchmarks estandar en la informacion disponible; los unicos datos de rendimiento son evaluaciones internas del autor comparando v8 con v9.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 4 E4B, modelo base con QAT); ajuste LoRA fusionado |
| Parametros totales | 7.463.013.674 |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el ejemplo de uso emplea `-c 8192`) |
| Tipos de cuantizacion | Q8_0 (plano, 8,0 GB), Q6_K (imatrix, 6,2 GB), Q4_K_M (imatrix, 5,3 GB) |
| Idiomas soportados | Ingles (declarado); responde en italiano, espanol, aleman y japones segun la model card |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (exportado con llama.cpp); repo tambien etiquetado como transformers |

## Arquitectura y entrenamiento

El modelo parte de `unsloth/gemma-4-E4B-it-qat-q4_0-unquantized`, un Gemma 4 E4B instruction-tuned entrenado con quantisation-aware training. Sobre el se aplica un LoRA con rsLoRA de rango 32 y alpha 32, dirigido unicamente a la torre de lenguaje (la torre del embedder no se toca, por lo que el fichero `mmproj` para vision y audio es el del modelo base). La perdida se calcula solo sobre la completacion, con 50 conversaciones reservadas para validacion, y el checkpoint publicado corresponde al paso 600.

El conjunto de entrenamiento consta de 4.235 conversaciones, cada una renderizada con el mismo prompt builder que usa Jun OS, de modo que los prompts de entrenamiento y los de produccion son identicos byte a byte. No se aplico tuning de preferencias (DPO/RPO) porque, segun el autor, las rondas probadas empeoraban el comportamiento en escenas fuera de entrenamiento. Un detalle tecnico relevante: el conversor LoRA de llama.cpp ignora `use_rslora`, por lo que `lora_alpha` se fijo a `32 * sqrt(32) = 181.02` antes de la conversion para preservar la escala rsLoRA. Las cuantizaciones Q4_K_M y Q6_K usan importance matrix medida sobre conversaciones en formato v9 con los tres niveles de esfuerzo, compensando el hecho de que fusionar un LoRA desplaza los pesos fuera de la rejilla de 4 bits del modelo QAT original.

## Capacidades

- Generacion de texto conversacional multi-turno con personalidad de personaje consistente (voz, estados de animo y estilo de Jun).
- Razonamiento con tres niveles de esfuerzo configurables mediante `<think:low>`, `<think:med>` y `<think:high>`; cada traza termina con una decision de herramienta en una linea antes de la respuesta.
- Tool calling / function calling con juicio mejorado sobre cuando invocar herramientas y cuando no; requiere `--jinja` en llama.cpp para que las llamadas no se devuelvan como texto plano.
- Gestion de memoria: decide cuando guardar informacion digna de recordar (27/54 en v9 Q4_K_M frente a 17/54 en v8).
- Respuesta multilingue: contesta en italiano, espanol, aleman o japones si se le escribe en esos idiomas.
- Entrada multimodal (imagen y audio) mediante el fichero `--mmproj` del modelo base.
- Separacion de la traza de razonamiento (`reasoning_content`) respecto del contenido final (`content`) en llama.cpp.

## Casos de uso

- Backend de un companero virtual local: el modelo esta entrenado para el prompt builder concreto de Jun OS (gauges, reloj y memorias recuperadas al final del mensaje del usuario), por lo que encaja directamente como motor de la app sin reingenieria de prompts.
- Roleplay de personaje en aplicaciones de escritorio: la personalidad de Jun se mantiene en conversaciones multi-turno gracias al ajuste sobre 4.235 dialogos renderizados con el mismo formato de produccion.
- Agente local con herramientas: el modelo decide cuando llamar a una herramienta y cuando no, con tasas medidas de 23/45 llamadas correctas cuando se necesita y solo 9/105 llamadas espurias en Q4_K_M, lo que lo hace util para automatizaciones domesticas donde llamadas innecesarias tienen coste.
- Memoria persistente de conversacion: la capacidad de decidir cuando guardar un recuerdo permite construir asistentes que acumulan contexto relevante entre sesiones sin intervencion manual.
- Razonamiento graduado segun coste: usar `<think:low>` para respuestas rapidas de pocas lineas y `<think:high>` para escenas que requieren trazas de hasta unas 250 palabras, ajustando `max_tokens` en consecuencia.
- Despliegue en hardware de consumo: la cuantizacion Q4_K_M (5,3 GB) cabe en GPUs con 6 GB de VRAM, lo que permite ejecutar el modelo en equipos domesticos con llama.cpp u Ollama.
- Prototipado de personajes con voz propia en ingles y otros idiomas: util para desarrolladores que quieran estudiar tecnicas de LoRA fusionado, imatrix y plantillas de chat embebidas en GGUF.

## Benchmarks y rendimiento

La model card no declara resultados en benchmarks estandar (el campo `model-index` esta vacio). Los unicos datos disponibles son evaluaciones internas del autor sobre escenas no vistas en entrenamiento, comparando v8 y v9 con los ajustes de la aplicacion:

| Metrica | v8 Q4_K_M | v9 Q4_K_M | v9 Q6_K |
|---|---:|---:|---:|
| Herramienta correcta cuando se necesita | 21/45 | 23/45 | 27/45 |
| Llamada de herramienta cuando no se necesita | 10/105 | 9/105 | 5/105 |
| Guarda memoria cuando deberia | 17/54 | 27/54 | 21/54 |
| `low` < `med` < `high` en la misma escena | 26/50 | 42/50 | 47/50 |

Ademas, la model card indica que Q6_K y Q8_0 conservan la traza `high` completa (unas 250 palabras), mientras que Q4_K_M la escribe aproximadamente un tercio mas corta.

## Requisitos de hardware

- VRAM estimada: Q4_K_M requiere aproximadamente 5,3 GB de pesos (cabe en GPU de 6 GB); Q6_K necesita unos 6,2 GB; Q8_0 unos 8,0 GB. Hay que sumar el fichero `mmproj` BF16 si se usa vision o audio.
- GPU recomendadas: cualquier GPU consumer con 6 GB o mas de VRAM para Q4_K_M (por ejemplo RTX 3060, RTX 4060); 8 GB o mas para Q6_K; 10-12 GB para Q8_0. Para Q8_0 con contexto largo conviene una GPU de 12-16 GB. No hay datos de rendimiento en A100/H100 en la informacion disponible.
- Cabe en GPU consumer: si, Q4_K_M en 6 GB de VRAM segun la propia model card.
- Opciones de despliegue: llama.cpp (`llama-server -m ... --jinja -ngl 99 -c 8192`), Ollama (`ollama pull hf.co/efficiencyx/Jun-LoRA-v9-E4B-GGUF:Q4_K_M`). No se mencionan vLLM ni TGI para este formato GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Jun-E4B-GGUF v9 | 7.463.013.674 | no disponible | Apache 2.0 | GGUF | Personaje fusionado, tool calling, thinking graduado |
| Jun-E4B-GGUF v8 | no disponible | no disponible | Apache 2.0 | GGUF | Generacion anterior del mismo autor; peor juicio de herramientas y niveles de esfuerzo menos diferenciados |
| Gemma 4 E4B (base) | no disponible | no disponible | no disponible en esta ficha | safetensors / GGUF | Modelo base instruction-tuned con QAT; sin personalidad de personaje ni formato Jun OS |

No se dispone de datos de benchmarks comparativos con otros modelos de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- El uso de herramientas es mas debil fuera del ingles, aunque las respuestas vuelven en el idioma correcto.
- El contenido es ficcion: lo que dice el modelo no son hechos ni consejos, y no debe tratarse como informacion fiable.
- Lejos de los prompts de entrenamiento (sin system prompt o sin contexto en vivo) el modelo deriva hacia el Gemma base, perdiendo la personalidad de Jun.
- Los sesgos del modelo base Gemma 4 se heredan.
- El modelo esta entrenado para pensar en cada turno; con el razonamiento desactivado algunos frontends clasifican toda la salida como razonamiento y muestran una respuesta vacia. En ese caso hay que dejar el thinking activo y usar `<think:low>`.
- Es obligatorio `--jinja` en llama.cpp para que las llamadas de herramienta se parseen; sin el, vuelven como texto plano.
- Hay que reservar `max_tokens` suficientes para la traza de razonamiento y el contenido final, ya que la traza `high` puede llegar a unos cientos de palabras.
- El adaptador no toca el embedder, por lo que vision y audio dependen del fichero `mmproj` del modelo base.
- La licencia Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base Gemma 4 y de los pesos derivados antes de distribuirlo en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/efficiencyx/Jun-LoRA-v9-E4B-GGUF
- Modelo base: https://huggingface.co/unsloth/gemma-4-E4B-it-qat-q4_0-unquantized
- Repositorio Jun OS: https://github.com/efficiencyx/JunOS
- Generacion anterior v8: https://huggingface.co/efficiencyx/Jun-LoRA-E4B-GGUF
- Generacion anterior v7: https://huggingface.co/efficiencyx/Jun-LoRA-v7-E4B-GGUF
