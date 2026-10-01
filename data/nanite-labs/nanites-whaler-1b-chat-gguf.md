# Nanite-Labs/nanites-whaler-1b-chat-gguf

## Resumen

nanites-whaler-1b-chat-gguf es un ajuste fino (fine-tune) del modelo unsloth/llama-3.2-1b-instruct, publicado por Nanite-Labs, que adopta el papel de primer oficial (first mate) de un ballenero estadounidense del siglo XIX. El repositorio contiene la version fusionada y cuantizada en GGUF del adaptador original, que vive en un repositorio aparte (`Nanite-Labs/nanites-whaler-1b-chat`). Su proposito no es competir en benchmarks generales, sino ofrecer un modelo de personaje pequeno, ligero y ejecutable en local.

Tecnicamente es un transformer decoder-only denso de 1.235.814.400 parametros (~1,24 B), derivado de la familia Llama 3.2, con licencia Apache 2.0 y declarado unicamente para ingles. El autor lo publica como cuantizacion Q4_K_M, con un repositorio de 0,8 GB, pensado para usuarios de Ollama, LM Studio y llama.cpp que quieren evitar el paso de fusionar el modelo base con el adaptador.

Su relevancia actual es acotada pero clara: demuestra el flujo tipico de QLoRA + merge + cuantizacion GGUF sobre un modelo de 1B, util para prototipos de personajes conversacionales y despliegues en hardware muy limitado. No dispone de datos de entrenamiento publicados, ni de evaluaciones, ni de benchmarks en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (arquitectura Llama 3.2, derivada de unsloth/llama-3.2-1b-instruct) |
| Parametros totales | 1.235.814.400 (~1,24 B) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible en la model card; el modelo base Llama 3.2 1B Instruct soporta hasta 128.000 tokens, aunque los ejemplos del autor usan `-c 1024` |
| Tipos de cuantizacion | Q4_K_M (GGUF) en este repositorio; no se documentan otras variantes |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (este repositorio); el adaptador original es un adaptador PEFT/QLoRA en el repositorio `Nanite-Labs/nanites-whaler-1b-chat` |
| Modelo base | unsloth/llama-3.2-1b-instruct |
| Plantilla de prompt | estilo Alpaca (`### Instruction:` / `### Input:` / `### Response:`) |
| Tamano del repositorio | 0,8 GB |
| Descargas / likes | 20 / 0 |

## Arquitectura y entrenamiento

La arquitectura es la de Llama 3.2 1B Instruct sin modificaciones estructurales: un transformer decoder-only denso con normalizacion RMSNorm, activaciones SwiGLU, RoPE y atencion agrupada (GQA). El modelo base es la version de Unsloth del checkpoint de Meta, y el autor aplica sobre el una adaptacion mediante QLoRA (etiqueta `qlora` en el repositorio). Posteriormente fusiona el adaptador con el modelo base y cuantiza el resultado a Q4_K_M para distribuirlo en GGUF.

No se especifica en la model card el dataset de entrenamiento, el numero de tokens de ajuste, la composicion de los datos, ni si hubo etapas de RLHF, DPO u otro tipo de alineamiento. La unica informacion disponible sobre el objetivo del entrenamiento es la descripcion del personaje: un primer oficial de un ballenero estadounidense del siglo XIX, con respuestas breves "en voz de epoca". La innovacion tecnica del repositorio es de proceso, no de arquitectura: empaquetar el resultado de QLoRA + merge + cuantizacion en un unico fichero GGUF listo para Ollama y llama.cpp.

## Capacidades

- Generacion de texto conversacional en ingles, con foco en roleplay y narrativa historica.
- Interpretacion de personaje (persona) consistente con un oficial de ballenero del siglo XIX.
- Seguimiento de instrucciones basicas, heredado del ajuste instructivo de Llama 3.2 1B Instruct.
- Conversacion multiturno corta, limitada por la capacidad real de un modelo de ~1,24 B de parametros.
- Ejecucion local en CPU o GPU de gama baja gracias al formato GGUF Q4_K_M.
- Tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado, y poco realista en este tamano.
- Capacidades multilingues: no; el modelo declara unicamente ingles.
- Capacidades especiales (vision, audio, modo thinking, decodificacion especulativa): no disponibles.

## Casos de uso

- Personajes en videojuegos y experiencias narrativas: el modelo puede generar dialogos breves y coherentes con un personaje historico, ejecutandose en local sin coste por token ni dependencia de API externa.
- Chatbots de ambientacion para museos o actividades educativas: permite simular interacciones con un tripulante de ballenero del siglo XIX en instalaciones con hardware modesto o incluso sin GPU.
- Demostraciones de pipeline QLoRA a GGUF: sirve como ejemplo reproducible de ajuste de un modelo de 1B, fusion con el base y cuantizacion a Q4_K_M para distribuirlo en Ollama o LM Studio.
- Escritura creativa asistida: apoyo a la generacion de dialogos en tono de epoca para relatos o guiones, siempre con revision humana por el riesgo de incoherencias de un modelo de 1B.
- Prototipado rapido de aplicaciones conversacionales: al ser un fichero GGUF de 0,8 GB, permite tener un endpoint de generacion de texto funcionando en minutos para validar una interfaz o un flujo.
- Inferencia en el borde (edge) y entornos sin conectividad: cabe y funciona en CPU en equipos tipo Raspberry Pi o portatiles antiguos, util para demos offline o kioscos.
- Chat de bajo consumo en aplicaciones de escritorio: integrable mediante llama.cpp o LM Studio como asistente de personaje sin requisitos de VRAM relevantes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra metrica, y no se han encontrado evaluaciones externas en la busqueda web realizada.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 1-2 GB con la cuantizacion Q4_K_M incluida en el repositorio (fichero de aproximadamente 0,8 GB), en funcion de la longitud de contexto configurada.
- GPU recomendadas: cualquier GPU con 2 GB o mas de memoria; por ejemplo GTX 1050 Ti, GTX 1650, RTX 3050, RTX 4060. No requiere A100 ni H100.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU dedicada moderna, e incluso en iGPU con memoria compartida suficiente.
- CPU: la inferencia es viable en CPU sin GPU, dado el tamano del modelo y la cuantizacion Q4_K_M.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), Ollama (el autor documenta un Modelfile con `FROM ./whaler-Q4_K_M.gguf`), LM Studio, KoboldCpp y otras interfaces compatibles con GGUF. El autor etiqueta el repositorio como `endpoints_compatible`.
- vLLM y TGI: no hay pesos en safetensors del modelo fusionado en este repositorio, por lo que no se documenta un despliegue directo con esos servidores.
- Latencia y throughput estimados: no disponibles; no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / disponibilidad | Notas |
|---|---|---|---|---|---|
| nanites-whaler-1b-chat-gguf | ~1,24 B | no disponible en la model card (base: hasta 128.000 tokens) | Apache 2.0 | GGUF Q4_K_M | Fine-tune de personaje, solo ingles, sin benchmarks |
| Llama 3.2 1B Instruct (base) | ~1,24 B | hasta 128.000 tokens | Licencia comunitaria de Llama 3.2 | safetensors, GGUF (versiones de terceros) | Modelo instructivo generalista del que deriva; mejor cobertura de tareas generales |
| Qwen2.5-1.5B-Instruct | ~1,54 B | 32.768 tokens (ampliable con YaRN) | Apache 2.0 | safetensors, GGUF | Alternativa generalista de tamano similar, multilingue y con buen rendimiento en codigo y matematicas |
| TinyLlama-1.1B-Chat | ~1,1 B | 2.048 tokens | Apache 2.0 | safetensors, GGUF | Modelo de chat pequeno muy extendido en entornos de bajos recursos |

Nota: no se dispone de resultados de benchmarks de nanites-whaler-1b-chat-gguf, por lo que la comparacion se limita a parametros, contexto, licencia y disponibilidad, no a calidad medida.

## Limitaciones y advertencias

- Riesgo alto de alucinacion: con ~1,24 B de parametros, el modelo puede inventar hechos historicos o incoherencias narrativas con facilidad.
- Idiomas: solo se declara ingles; no hay garantia de comportamiento correcto en castellano ni en otros idiomas.
- Plantilla de prompt: usa formato Alpaca, no la plantilla de chat nativa de Llama 3.2. Si se aplica la plantilla de Llama 3, la calidad de las respuestas puede degradarse.
- Longitud de contexto practica: la model card no documenta el contexto soportado y sus ejemplos de uso emplean `-c 1024`, muy por debajo de lo que admite el modelo base. Conviene validar el comportamiento en contextos largos antes de usarlo en produccion.
- Datos de entrenamiento no publicados: se desconoce la composicion del dataset, el numero de tokens y si existio filtrado de contenido, por lo que no se puede evaluar el sesgo de forma sistematica.
- Sesgos: el personaje representa a un tripulante de un ballenero estadounidense del siglo XIX, contexto historico asociado a estereotipos de la epoca; no se documenta ningun tipo de mitigacion.
- Licencia: Apache 2.0 permite uso comercial, pero al derivar de Llama 3.2 conviene revisar las condiciones de la licencia comunitaria de Llama 3.2 aplicables al modelo base.
- Madurez: 20 descargas, 0 likes y ausencia total de evaluaciones; es un artefacto experimental, no un modelo validado para produccion.
- Uso especializado: esta optimizado para un unico personaje; su rendimiento en tareas generales de instruccion sera inferior al del modelo base.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Nanite-Labs/nanites-whaler-1b-chat-gguf
- Repositorio del adaptador original: https://huggingface.co/Nanite-Labs/nanites-whaler-1b-chat
- Modelo base usado por el autor: https://huggingface.co/unsloth/llama-3.2-1b-instruct
- Modelo original de Meta: https://huggingface.co/meta-llama/Llama-3.2-1B-Instruct
- Resultados de la busqueda web: no se han encontrado enlaces relevantes al modelo (papers, blogs, repos o demos) en la busqueda realizada.
