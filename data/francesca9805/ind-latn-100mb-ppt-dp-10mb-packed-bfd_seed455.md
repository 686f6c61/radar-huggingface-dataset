# francesca9805/ind-latn-100mb-ppt-Dp-10mb-packed-bfd_seed455

## Resumen

El modelo `francesca9805/ind-latn-100mb-ppt-Dp-10mb-packed-bfd_seed455` es un ajuste fino (fine-tune) del modelo base `goldfish-models/ind_latn_100mb`, desarrollado por el usuario francesca9805 y publicado en HuggingFace. Se trata de un modelo de generacion de texto de pequeno tamano, con 124.770.816 parametros reales confirmados por los pesos en safetensors, y un repositorio de 0,3 GB. La arquitectura de partida pertenece a la familia GPT-2 (etiqueta `gpt2` declarada en el repositorio), y el entrenamiento se ha realizado mediante SFT (supervised fine-tuning) con la libreria TRL.

El modelo resuelve una tarea acotada: continuar y generar texto en el idioma del corpus base, que por la nomenclatura del modelo original (`ind_latn`) corresponde a indonesio en escritura latina. Su relevancia es fundamentalmente experimental y de investigacion: forma parte de una familia de ejecuciones de ajuste fino con distintos hiperparametros y semillas (el sufijo `seed455` y los descriptores `ppt-Dp-10mb-packed-bfd` apuntan a una configuracion concreta de entrenamiento dentro de una bateria de experimentos). No es un modelo orientado a produccion generalista, sino una pieza dentro de un estudio comparativo de recetas de entrenamiento sobre modelos pequenos.

Con algo mas de 124 millones de parametros, el modelo es ejecutable en CPU y en cualquier GPU de consumo, e incluso en movil o entornos embebidos mediante cuantizacion. El registro de HuggingFace no declara licencia, idiomas ni resultados de evaluacion, por lo que buena parte de sus caracteristicas tecnicas deben inferirse de su modelo base y no de documentacion explicita.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (transformer decoder-only causal), segun etiqueta `gpt2` del repositorio |
| Parametros totales | 124.770.816 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en el repositorio; al ser un modelo transformers estandar es convertible a FP16, INT8, INT4, GGUF (Q4_K_M, Q8_0, etc.) |
| Idiomas soportados | no disponible (el modelo base `goldfish-models/ind_latn_100mb` corresponde a indonesio en escritura latina) |
| Licencia | no disponible (la model card contiene el marcador de posicion `licence: license`) |
| Formato de pesos | safetensors (via transformers) |

## Arquitectura y entrenamiento

El modelo se construye sobre `goldfish-models/ind_latn_100mb`, un modelo pequeno de la familia goldfish orientado a un unico idioma. La etiqueta `gpt2` del repositorio indica que la arquitectura subyacente es un transformer decoder-only causal con atencion completa, sin mecanismos MoE, SSM ni hibridos. Con 124.770.816 parametros, el tamano es coherente con la configuracion clasica de GPT-2 small (12 capas, 12 cabezas, dimension oculta 768), aunque el repositorio no publica la configuracion exacta de capas ni la longitud de contexto, por lo que esos datos quedan como no disponibles.

El entrenamiento se ha realizado con SFT (supervised fine-tuning) usando TRL 0.23.0 sobre Transformers 4.56.2, PyTorch 2.5.1+cu121, Datasets 4.8.4 y Tokenizers 0.22.1. La model card enlaza una ejecucion de Weights & Biases en el proyecto `f-padovani-university-of-groningen/new-tokenizers`, lo que situa el trabajo en un contexto academico de investigacion sobre tokenizacion y recetas de entrenamiento. El nombre del modelo (`ppt-Dp-10mb-packed-bfd`) describe la configuracion experimental empleada (tamano de corpus, empaquetado de secuencias y variante de dataset), pero no se detalla su significado ni la composicion exacta del dataset en la informacion disponible. No se documenta ninguna innovacion tecnica adicional como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto autoregresiva: el pipeline declarado es `text-generation`, y la model card incluye un ejemplo de uso conversacional con `transformers.pipeline`, con formato de mensajes rol/contenido.
- Ajuste por instrucciones: al haberse entrenado con SFT a partir de un formato de conversacion, el modelo esta preparado para responder a prompts tipo chat, aunque sin garantias de calidad dadas las dimensiones.
- Generacion en el idioma del modelo base: por herencia de `goldfish-models/ind_latn_100mb`, la competencia linguistica principal se espera en indonesio en escritura latina.
- Capacidades multilingues: no declaradas. El registro de HuggingFace no especifica idiomas soportados.
- Tool calling / function calling: no disponible. No hay evidencia de soporte en la model card.
- Uso en agentes y razonamiento multi-paso: no disponible. No se documenta ningun modo de pensamiento, planificacion o ejecucion de herramientas.
- Vision, audio o modalidades adicionales: no disponible. El modelo es exclusivamente de texto.
- Compatibilidad de despliegue: etiquetas `text-generation-inference` y `endpoints_compatible`, lo que indica compatibilidad con TGI y con los endpoints gestionados de HuggingFace.

## Casos de uso

- Experimentacion academica con recetas de ajuste fino: el modelo sirve como punto de comparacion frente a otras ejecuciones de la misma familia (por ejemplo, las variantes `shuff-dyck` o `10mb-ppt-Dp-100mb`), permitiendo aislar el efecto de la configuracion de entrenamiento sobre un modelo base identico.
- Generacion de texto en indonesio para prototipos: dado su origen en `ind_latn_100mb`, puede emplearse para generar borradores o completar frases en indonesio latino en entornos de prueba donde no se requiera alta calidad.
- Docencia y demostraciones de transformers: con 124,77 M de parametros y 0,3 GB de repositorio, es adecuado para ilustrar el flujo completo de carga, inferencia y evaluacion de un modelo causal en cursos y talleres, ejecutandose incluso sin GPU.
- Pruebas de pipeline de SFT con TRL: al haberse generado con TRL 0.23.0, sirve como plantilla reproducible para validar versiones de la libreria, configuraciones de entrenamiento y registro en Weights & Biases.
- Inferencia en dispositivos con recursos limitados: cuantizado a INT4 o Q4_K_M, el modelo ocupa decenas de megabytes, lo que permite desplegarlo en routers, Raspberry Pi o moviles para tareas de generacion muy acotadas.
- Generacion de datos sinteticos en un dominio restringido: puede utilizarse para producir continuaciones de texto sobre un corpus concreto y filtrarlas posteriormente, como paso previo a un ajuste de un modelo mayor.
- Benchmarking de herramientas de despliegue: su tamano reducido lo convierte en un candidato idoneo para medir latencia, throughput y consumo de VRAM de vLLM, TGI, llama.cpp u Ollama en configuraciones de hardware concretas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de evaluacion (MMLU, HumanEval, GSM8K ni ninguna otra), y los agregadores externos consultados no aportan cifras de rendimiento para esta ejecucion concreta.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: en torno a 500 MB (124,77 M de parametros x 4 bytes).
- VRAM estimada en FP16/BF16: en torno a 250 MB.
- VRAM estimada en INT8: en torno a 125 MB.
- VRAM estimada en INT4 (Q4_K_M): en torno a 65-100 MB. Un agregador externo cifra en 0,2 GB la VRAM necesaria para la variante hermana de 124,8 M de parametros.
- Cabe en cualquier GPU de consumo: GTX 1050 Ti, RTX 3060, RTX 4090, etc. Tambien funciona en CPU sin dificultad, e incluso en dispositivos embebidos tras cuantizar.
- Opciones de despliegue: transformers (pipeline nativo), TGI (etiqueta `text-generation-inference`), endpoints gestionados de HuggingFace (etiqueta `endpoints_compatible`), vLLM, llama.cpp y Ollama tras convertir los pesos a GGUF.
- Latencia y throughput estimados: no disponibles. No se aportan mediciones de tokens por segundo ni de tiempo de primera respuesta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| `francesca9805/ind-latn-100mb-ppt-Dp-10mb-packed-bfd_seed455` | 124,77 M | no disponible | no disponible | HuggingFace |
| `goldfish-models/ind_latn_100mb` (modelo base) | no disponible | no disponible | no disponible | HuggingFace |
| `fpadovani/ind-latn-100mb-ppt-shuff-dyck-100mb_seed455` | 124,8 M | no disponible | no disponible | HuggingFace / LLM Explorer |
| `fpadovani/ind-latn-10mb-ppt-Dp-100mb_seed455` | 39,1 M (segun LLM Explorer) | no disponible | no disponible | HuggingFace / LLM Explorer / FriendliAI |

Las tres variantes comparten origen (`goldfish-models/ind_latn_100mb`) y receta de ajuste con TRL, diferenciandose en la configuracion de datos y la semilla. No se dispone de metricas comparativas de rendimiento entre ellas.

## Limitaciones y advertencias

- Sesgos: no documentados. Al entrenarse sobre un corpus de un unico idioma sin filtrado descrito, es probable que reproduzca los sesgos presentes en ese corpus.
- Riesgo de alucinacion: alto para un modelo de 124 M de parametros; no dispone de mecanismos de verificacion ni de modo de razonamiento explicito.
- Limitaciones de idioma: el registro no declara idiomas soportados. Fuera del indonesio latino, el rendimiento esperado es muy bajo.
- Limitacion de contexto: la longitud de contexto no esta documentada, lo que impide garantizar el comportamiento en conversaciones largas o documentos extensos.
- Licencia: la model card contiene un marcador de posicion (`licence: license`) y el repositorio no declara licencia. No se puede asumir uso comercial sin consultar al autor.
- Ausencia de evaluacion: no hay benchmarks publicados, por lo que no es posible verificar calidad, robustez ni regresiones frente al modelo base.
- Modelo de investigacion: el nombre refleja una ejecucion experimental dentro de una bateria de pruebas; no debe tratarse como un modelo listo para produccion.
- Fecha de creacion inusual: los metadatos indican 2026-09-23, posterior a la fecha de consulta habitual, lo que conviene verificar antes de citarlo.
- Formato de conversacion: el ejemplo de la model card usa una lista de mensajes con roles, pero no se especifica la plantilla de chat exacta ni el token especial de fin de turno.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/francesca9805/ind-latn-100mb-ppt-Dp-10mb-packed-bfd_seed455
- Modelo base: https://huggingface.co/goldfish-models/ind_latn_100mb
- Ejecucion de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/new-tokenizers/runs/5vvk26ee
- Repositorio de TRL: https://github.com/huggingface/trl
- Variante hermana en LLM Explorer: https://llm-explorer.com/model/fpadovani%2Find-latn-100mb-ppt-shuff-dyck-100mb_seed455,145aTaUHg9nlCJnXHtu0ZO
- Variante reducida de 39,1 M en LLM Explorer: https://llm-explorer.com/model/fpadovani%2Find-latn-10mb-ppt-Dp-100mb_seed455,5qG8R1FZFYaEV34xzuKm9U
- Ficha en FriendliAI: https://friendli.ai/models/fpadovani/ind-latn-100mb-ppt-Dp-10mb_seed455
