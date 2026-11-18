# Edge0/Edge0-145B-NVFP4

## Resumen

Edge0-145B-NVFP4 es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) publicado por Edge0, un proyecto centrado en inferencia en el borde. Se trata de una cuantizacion NVFP4 (4 bits) del modelo base Qwen/Qwen3.8-Flash-Next, distribuida con la libreria propia `edge0` y empaquetada tambien en formato GGUF para su despliegue en entornos con recursos limitados. El repositorio ocupa 113,8 GB y acumula mas de 61.000 descargas y cerca de 500 "likes" en Hugging Face, lo que indica una adopcion temprana significativa.

El modelo esta orientado a tareas de agente y generacion de codigo, segun las etiquetas del autor (`agent`, `coding`, `edge-inference`, `latent-moe`). La nomenclatura "145B" del identificador entra en conflicto con el recuento real de parametros almacenados en los safetensors del repositorio, que asciende a 4.947.698.560 parametros (aproximadamente 4,95 mil millones). Esta discrepancia debe tenerse en cuenta al planificar el despliegue: el tamano efectivo de pesos es el que figura en los ficheros, no el que sugiere el nombre.

Su relevancia actual reside en la combinacion de una arquitectura MoE con cuantizacion de 4 bits y soporte nativo para inferencia en el borde, lo que permite ejecutar un modelo de este perfil en hardware de consumo o en nodos perifericos sin GPU de datacenter, manteniendo capacidades de agente y codigo. La licencia es propia (`edge0-community-model-1.0`), no estandar, por lo que su uso comercial requiere revision legal especifica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) con variante "latent-moe", transformer |
| Parametros totales | 4.947.698.560 (segun safetensors); el identificador comercial indica "145B" |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (4 bits); tambien distribuido en GGUF |
| Idiomas soportados | no disponible |
| Licencia | edge0-community-model-1.0 (licencia propia, categoria "other") |
| Formato de pesos | safetensors y GGUF |
| Modelo base | Qwen/Qwen3.8-Flash-Next |
| Libreria de inferencia | edge0 |
| Tamano del repositorio | 113,8 GB |
| Pipeline | text-generation |
| Fecha de publicacion | 2026-11-11 |
| Ultima actualizacion | 2026-11-15 |

## Arquitectura y entrenamiento

La arquitectura es un transformer con capas de tipo Mixture-of-Experts, etiquetado por el autor como "latent-moe". No se dispone de informacion publica sobre el numero de expertos, la dimension latente de enrutamiento, el numero de capas ni la distribucion de parametros activos por token. El modelo deriva del checkpoint Qwen/Qwen3.8-Flash-Next mediante un proceso de cuantizacion a NVFP4 (formato de coma flotante de 4 bits orientado a aceleradores NVIDIA), y se ofrece adicionalmente en GGUF, lo que sugiere una conversion posterior para motores de inferencia de CPU/GPU de consumo.

No se han publicado en la informacion disponible datos sobre el volumen de tokens de entrenamiento, la composicion del corpus, ni sobre si el modelo base paso por fases de RLHF, DPO o ajuste por preferencias. Tampoco se detallan innovaciones tecnicas adicionales como decodificacion especulativa, atencion lineal o modos de razonamiento explicito. La innovacion principal declarada es la propia cuantizacion NVFP4 combinada con el objetivo de inferencia en el borde, junto con el soporte de la libreria `edge0` y la compatibilidad con endpoints.

## Capacidades

- Generacion de texto conversacional multi-turno (pipeline `text-generation`, etiqueta `conversational`).
- Generacion y asistencia en codigo, segun la etiqueta `coding` del autor.
- Flujos de agente y razonamiento multi-paso, segun la etiqueta `agent`.
- Inferencia en el borde: disenado para ejecutarse en hardware limitado gracias a la cuantizacion de 4 bits y al formato GGUF.
- Compatibilidad con endpoints (`endpoints_compatible`), lo que facilita su integracion en servicios HTTP de inferencia.
- Soporte de CUDA como backend de aceleracion.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Vision, audio o modos de pensamiento explicito: no disponibles en la informacion proporcionada.

## Casos de uso

- Asistente de codigo en el IDE: el modelo puede integrarse en extensiones de editor mediante un endpoint local compatible con la API de endpoints, ofreciendo autocompletado y generacion de funciones sin enviar codigo a la nube, gracias a su cuantizacion de 4 bits que reduce los requisitos de memoria.
- Agente autonomo en dispositivos perifericos: su orientacion `edge-inference` y el formato GGUF permiten desplegarlo en estaciones de trabajo o mini-PC con GPU de consumo para tareas de automatizacion de flujos con llamadas a herramientas.
- Atencion al cliente en local: la etiqueta `conversational` y el pipeline de generacion de texto lo hacen adecuado para chatbots multi-turno desplegados on-premise, donde la soberania del dato es un requisito.
- Procesamiento de codigo en pipelines de CI/CD: puede emplearse para revision automatica de parches, generacion de tests o resumen de diffs dentro de runners con GPU, evitando dependencias de APIs externas.
- Prototipado rapido de agentes: al estar disponible en GGUF y con libreria propia, permite iterar sobre disenos de agentes en portatiles con GPU antes de escalar a produccion.
- Despliegue en entornos con conectividad intermitente: la inferencia local elimina la dependencia de red, util en field engineering, entornos industriales o instalaciones aisladas.
- Evaluacion comparativa de cuantizaciones: util para investigadores que quieran medir la perdida de calidad de NVFP4 frente a pesos de mayor precision sobre el mismo modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: con pesos de 4 bits y un recuento real de aproximadamente 4,95 mil millones de parametros, los pesos ocupan del orden de 2,5 a 3 GB; el repositorio de 113,8 GB sugiere que incluye multiples variantes o artefactos adicionales, por lo que conviene descargar solo los ficheros necesarios.
- GPU recomendadas: no disponibles de forma explicita. Por el perfil de cuantizacion NVFP4, se orienta a aceleradores NVIDIA; la etiqueta `cuda` confirma soporte de ese backend.
- GPU de consumo: por el tamano efectivo de pesos, es plausible su ejecucion en GPU de consumo con 8 GB o mas de VRAM, aunque el autor no publica una tabla de requisitos oficial.
- Opciones de despliegue: libreria `edge0` (nativa), llama.cpp u Ollama a traves del formato GGUF, y servidores compatibles con endpoints.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Edge0-145B-NVFP4 | 4,95 mil millones (segun safetensors) | no disponible | NVFP4 y GGUF | edge0-community-model-1.0 | Hugging Face |
| Qwen/Qwen3.8-Flash-Next (modelo base) | no disponible | no disponible | pesos originales | no disponible | Hugging Face |
| Alternativas de ~5B en 4 bits | no disponible | no disponible | GGUF / GPTQ / AWQ | variables | Hugging Face |

No se dispone de datos de rendimiento comparado ni de especificaciones del modelo base en la informacion proporcionada, por lo que la comparativa cuantitativa no puede completarse.

## Limitaciones y advertencias

- La discrepancia entre el nombre comercial ("145B") y el recuento real de parametros en safetensors (4,95 mil millones) puede inducir a error en la planificacion de recursos; verificar siempre los ficheros antes de desplegar.
- La cuantizacion NVFP4 de 4 bits implica una perdida de precision respecto a los pesos originales; no se han publicado evaluaciones de degradacion de calidad.
- No hay informacion sobre sesgos, datos de entrenamiento ni evaluaciones de seguridad del modelo base ni de la cuantizacion.
- Riesgo de alucinacion inherente a los modelos generativos; no se documentan mecanismos de mitigacion.
- Idiomas soportados no especificados: no se puede garantizar un rendimiento adecuado en castellano sin evaluacion previa.
- La licencia `edge0-community-model-1.0` es propia y no estandar; es imprescindible revisar el fichero LICENSE del repositorio antes de cualquier uso comercial.
- Ausencia de datos de benchmarks, contexto maximo y parametros activos dificulta la comparacion objetiva con alternativas.
- El repositorio de 113,8 GB puede implicar descargas largas y requisitos de almacenamiento considerables si se clonan todos los artefactos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Edge0/Edge0-145B-NVFP4
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Licencia: https://huggingface.co/Edge0/Edge0-145B-NVFP4/blob/main/LICENSE
