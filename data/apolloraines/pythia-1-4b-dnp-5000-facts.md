# ApolloRaines/Pythia-1.4B-DNP-5000-Facts

## Resumen

Pythia-1.4B-DNP-5000-Facts es un derivado del modelo base EleutherAI/pythia-1.4b publicado por el usuario ApolloRaines en HuggingFace. Su particularidad no es el entrenamiento convencional, sino que se han insertado 5.000 hechos del mundo real ocurridos entre 2023 y 2024 directamente en los pesos mediante una tecnica denominada Direct Neural Programming (DNP), desarrollada por jBlaze. El autor afirma que no se ha usado entrenamiento por gradiente ni adaptadores: el proceso consiste en cirugia de pesos sobre el checkpoint original.

El modelo conserva la arquitectura del base: un transformer decoder-only de la familia GPT-NeoX (gpt_neox), con 1.414.647.808 parametros y tokenizador de Pythia. El repositorio ocupa 2,8 GB y contiene pesos en safetensors junto con el corpus de hechos empleado (`novel_facts.json`). Esta pensado para ingles y se distribuye sin licencia especificada en la model card.

La relevancia de esta ficha es metodologica: el autor compara DNP con ajuste fino por LoRA sobre el mismo modelo y sostiene que LoRA colapsa con 50 hechos (perplejidad 459,6, capacidad general 10 %) mientras que DNP absorbe 5.000 hechos manteniendo la perplejidad en 13,3 y elevando la capacidad general del 60 % al 70 %. Son cifras autoinformadas, sin una descripcion publica de la metodologia de evaluacion ni validacion independiente, por lo que deben tratarse como una hipotesis a reproducir y no como un resultado consolidado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, familia GPT-NeoX (`gpt_neox`) |
| Parametros totales | 1.414.647.808 (1,41 mil millones) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada; el modelo base EleutherAI/pythia-1.4b trabaja con ventanas de 2048 tokens |
| Tipos de cuantizacion | No publicadas; el repositorio solo distribuye safetensors y su tamano (2,8 GB) es coherente con fp16/bf16 |
| Idiomas soportados | Ingles (`en`) |
| Licencia | No disponible (el modelo base EleutherAI/pythia-1.4b se publica bajo Apache 2.0) |
| Formato de pesos | safetensors |
| Modelo base | EleutherAI/pythia-1.4b |
| Libreria | transformers |
| Metodo de modificacion | Direct Neural Programming (jBlaze), sin gradiente ni adaptadores |
| Tamano del repositorio | 2,8 GB |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

La arquitectura es la del checkpoint original: un transformer decoder-only de GPT-NeoX con normalizacion previa a la atencion y a la MLP, atencion causal con rotacion de embeddings parcial (RoPE) y tokenizador de Pythia. No hay cambios estructurales, ni capas adicionales, ni modulos de adaptacion de bajo rango. El modelo tampoco recibe un ajuste por instrucciones ni alineamiento por RLHF o DPO: sigue siendo un modelo de completado de texto, no un asistente conversacional.

El entrenamiento se sustituye por completo por DNP. Segun la model card, 5.000 hechos reales de 2023 y 2024 (lanzamientos de modelos como GPT-4, Claude 3, Llama 2 o Gemini, eventos como los Juegos Olimpicos de Paris 2024, resultados deportivos y avances cientificos) se escriben directamente en los pesos, sin pasos de gradiente. El corpus completo se incluye en el repositorio como `novel_facts.json`, lo que permite auditar que informacion se inserto. El autor contrapone este enfoque al ajuste fino: una LoRA con configuracion estandar habria destruido el modelo con 50 hechos y una LoRA "conservadora" (mitad de rango, un cuarto del learning rate, un tercio de las epochs, gradient clipping) habria colapsado en torno a 125 hechos.

Dos advertencias tecnicas importantes: la model card no describe el algoritmo DNP mas alla de la afirmacion de "cirugia de pesos" ni publica el codigo del proceso, y la metrica "General Capability" que aparece en los resultados no esta definida ni acompanada del conjunto de evaluacion empleado. El propio autor presenta el modelo como una demostracion de la tecnica, no como un modelo listo para produccion.

## Capacidades

- Generacion de texto en ingles mediante completado autoregresivo, sin modo chat ni plantilla de instrucciones.
- Recuperacion de hechos implantados del periodo 2023-2024: lanzamientos de modelos de IA, eventos mundiales, resultados deportivos y avances cientificos incluidos en `novel_facts.json`.
- Coherencia y fluidez equivalentes al modelo base segun el autor, con perplejidad identica (13,3) antes y despues de la implantacion.
- Capacidad general declarada del 70 % tras la implantacion, frente al 60 % del baseline, con la salvedad de que la metrica no esta definida en la documentacion.
- No dispone de soporte de tool calling ni de function calling.
- No dispone de capacidades de agente, planificacion multi-paso ni razonamiento explicito con modo "thinking".
- No dispone de vision, audio ni entrada multimodal.
- Multilingue: no. Solo ingles.
- Al ser un modelo base sin ajuste por instrucciones, no sigue ordenes de forma fiable ni mantiene formato conversacional.

## Casos de uso

- Investigacion en edicion de conocimiento: el modelo permite estudiar si es posible insertar hechos factuales en los pesos sin degradar la perplejidad, usando `novel_facts.json` como conjunto de referencia auditable.
- Reproduccion de experimentos de olvido catastrofico: comparar DNP contra LoRA sobre el mismo checkpoint base y verificar si las diferencias reportadas (perplejidad 13,3 frente a 459,6 con 50 hechos) se sostienen con protocolos de evaluacion independientes.
- Evaluacion de tecnicas de model editing: sirve como punto de comparacion frente a metodos como ROME, MEMIT o fine-tuning con adaptadores, siempre que se fije una misma bateria de pruebas.
- Sondeo de memoria factual: comprobar que hechos concretos del corpus se recuperan correctamente y cuales se pierden, para medir la tasa de retencion real de las 5.000 inserciones.
- Docencia y divulgacion sobre interpretabilidad: el modelo es lo bastante pequeno (1,41 mil millones de parametros) para ejecutarse en una GPU de consumo y demostrar en directo el efecto de la cirugia de pesos frente al entrenamiento convencional.
- Desarrollo de metodologia de evaluacion: al tratarse de un checkpoint derivado de un baseline publico y reproducible, resulta util para disenar protocolos que distingan "saber un hecho" de "repetir una plantilla aprendida".
- Base para estudiar degradacion por volumen: el autor publica una version con 16.750 hechos, lo que permite analizar empiricamente donde esta el limite practico de la tecnica.

## Benchmarks y rendimiento

Los unicos datos disponibles son los autoinformados en la model card. No se especifica la bateria de evaluacion empleada para la columna "General Capability" ni la metodologia de calculo de la perplejidad.

| Metrica | Baseline (0 hechos) | Tras 5.000 hechos |
|---|---:|---:|
| Capacidad general | 60,0 % | 70,0 % |
| Perplejidad | 13,3 | 13,3 |

Comparacion con ajuste fino por gradiente reportada por el autor sobre el mismo modelo:

| Metodo | Hechos absorbidos | Capacidad general | Perplejidad |
|---|---:|---:|---:|
| LoRA v1 (configuracion estandar) | 50 | 10,0 % | 459,6 |
| LoRA v2 (configuracion conservadora) | ~125 | 35,0 % | 96,5 |
| DNP (este modelo) | 5.000 | 70,0 % | 13,3 |

No se han publicado resultados en benchmarks estandar (MMLU, HumanEval, GSM8K, ARC, HellaSwag y similares) en la informacion disponible. Las cifras anteriores proceden exclusivamente de la model card del autor y no cuentan con verificacion de terceros.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp16 los pesos ocupan aproximadamente 2,8 GB, por lo que con cache KV y overhead conviene reservar entre 3,5 y 4 GB. En int8 serian unos 1,4 GB de pesos y en cuantizacion de 4 bits en torno a 0,8-0,9 GB, aunque no se distribuyen pesos cuantizados en el repositorio.
- GPU recomendadas: cualquier GPU con 8 GB o mas funciona sin problema (RTX 3060 Ti, RTX 3070, RTX 4060, RTX 2080). Para lotes grandes o servicio concurrente son preferibles A100, H100, L40S o RTX 4090.
- Cabe en GPU de consumo: si, de forma holgada. Incluso una GPU de 4-6 GB puede ejecutarlo en fp16 con contexto corto, y en cuantizacion de 4 bits cabe en practicamente cualquier GPU moderna. Tambien es viable la inferencia en CPU con llama.cpp una vez convertido a GGUF.
- Opciones de despliegue: transformers (soporte nativo, con el ejemplo de la model card), Text Generation Inference (el repositorio lleva la etiqueta `text-generation-inference` y `endpoints_compatible`), vLLM, y llama.cpp u Ollama si se convierte previamente a GGUF, ya que no se publican pesos GGUF oficiales.
- Latencia y throughput estimados: no disponibles. No hay datos publicados de tokens por segundo ni de latencia en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Estado del conocimiento | Perplejidad | Licencia | Disponibilidad |
|---|---|---|---:|---:|---|---|
| ApolloRaines/Pythia-1.4B-DNP-5000-Facts | 1,41 B | No disponible (base: 2048 tokens) | 5.000 hechos de 2023-2024 implantados | 13,3 | No disponible | HuggingFace, 0 descargas |
| EleutherAI/pythia-1.4b (baseline) | 1,41 B | 2048 tokens | Corte en datos de principios de 2023 | 13,3 | Apache 2.0 | HuggingFace, ampliamente usado |
| ApolloRaines/Pythia-1.4B-DNP-16750-Facts | 1,41 B | No disponible | 16.750 hechos implantados | No disponible | No disponible | HuggingFace |
| ApolloRaines/Pythia-1.4b-Knowledge-Implant | 1,41 B | No disponible | 198 hechos implantados | No disponible | No disponible | HuggingFace |
| ApolloRaines/Pythia-1.4B-jBlaze-Reasoning | 1,41 B | No disponible | Mejora de razonamiento conductual | No disponible | No disponible | HuggingFace |

No se dispone de datos comparativos frente a modelos de la misma categoria con licencia clara y evaluaciones publicas (por ejemplo, alternativas de ~1-2 B parametros con soporte de instrucciones), porque la informacion proporcionada no incluye esos resultados.

## Limitaciones y advertencias

- La licencia no esta especificada en el repositorio ni en la model card. Sin una licencia explicita no puede asumirse permiso de uso comercial, aunque el modelo base sea Apache 2.0. Conviene contactar con el autor antes de cualquier uso en produccion.
- No es un modelo ajustado por instrucciones ni alineado: no sigue ordenes, no mantiene formato conversacional y no incorpora RLHF ni DPO. Puede generar contenido sesgado, toxico o danino presente en los datos del modelo base.
- Riesgo de alucinacion alto: la tecnica implanta hechos concretos, pero no garantiza que el modelo los recupere siempre ni que no genere afirmaciones falsas con la misma seguridad. Ademas, el conocimiento no implantado sigue limitado a los datos de entrenamiento originales de Pythia (principios de 2023).
- El corpus implantado proviene de un unico autor y no ha sido verificado de forma independiente. Errores factuales en `novel_facts.json` se propagarian directamente al modelo.
- Idioma: solo ingles. No hay soporte multilingue ni evaluacion en castellano.
- Longitud de contexto limitada por el modelo base (2048 tokens), lo que restringe tareas que requieran documentos largos o dialogos extensos.
- Las cifras de rendimiento (capacidad general del 70 %, perplejidad 13,3, comparacion con LoRA) son autoinformadas y no especifican metodologia ni conjunto de evaluacion. No deben citarse como resultado validado.
- El algoritmo DNP no esta publicado con detalle ni acompanado de codigo reproducible, lo que impide auditar el proceso de insercion de conocimiento.
- El modelo registra 0 descargas y 0 likes, sin validacion de la comunidad ni informes de terceros sobre su comportamiento real.
- La busqueda web realizada no devolvio ninguna fuente relacionada con este modelo, la tecnica DNP o su autor; los resultados obtenidos apuntaban a paginas de Instagram sin relacion con el contenido.
- Alucinacion de identidad: al no tener ajuste conversacional, el modelo puede continuar texto atribuyendose caracteristicas que no posee si se le presenta como asistente.
- No se distribuyen pesos cuantizados, por lo que un despliegue en entornos con pocos recursos exige convertir el checkpoint a GGUF u otro formato, con el riesgo de degradacion adicional que ello implica.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ApolloRaines/Pythia-1.4B-DNP-5000-Facts
- Modelo base: https://huggingface.co/EleutherAI/pythia-1.4b
- Version con 16.750 hechos: https://huggingface.co/ApolloRaines/Pythia-1.4B-DNP-16750-Facts
- Demo original con 198 hechos: https://huggingface.co/ApolloRaines/Pythia-1.4b-Knowledge-Implant
- Variante de razonamiento sobre la misma arquitectura: https://huggingface.co/ApolloRaines/Pythia-1.4B-jBlaze-Reasoning
- Sitio de la tecnologia jBlaze (Direct Neural Programming): https://jblaze.dev
- Corpus de hechos implantados: `novel_facts.json`, incluido en el repositorio de HuggingFace
- Paper, blog tecnico o repositorio de codigo de DNP: no disponible en la informacion proporcionada
- Resultados de la busqueda web: sin fuentes relevantes; los enlaces devueltos correspondian a paginas de Instagram sin relacion con el modelo
