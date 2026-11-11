# Sebastianpro88/Chichu-3-0-Abliterated-gguf

## Resumen

Chichu-3-0-Abliterated-gguf es un modelo de lenguaje publicado en Hugging Face por el usuario Sebastianpro88 bajo la etiqueta de licencia llama3.2. Se distribuye unicamente en formato GGUF, lo que indica que esta pensado para inferencia local con llama.cpp y herramientas compatibles como Ollama o LM Studio. El nombre sugiere un modelo derivado de la familia Llama 3.2, probablemente una variante "abliterated" (con los rechazos del alineamiento atenuados mediante edicion de pesos), aunque la model card no lo confirma.

La informacion publicada es minima: no hay pipeline declarado, no se especifican idiomas, y la model card se limita a la linea de licencia. El repositorio registra cero descargas y cero likes en el momento de la consulta, y la fecha de creacion y actualizacion coincide (2026-11-10), lo que apunta a una publicacion sin iteraciones posteriores ni documentacion adicional.

Por tanto, esta ficha solo puede detallar los datos verificables (formato GGUF, licencia declarada, autor y fechas). Cualquier dato sobre arquitectura, tamano, contexto o entrenamiento debe considerarse no disponible y no debe inferirse sin evidencia. Es relevante para quien busque variantes GGUF de Llama 3.2 sin filtros de alineamiento, pero con la advertencia de que la ausencia de documentacion impide validar su comportamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio es GGUF, pero no se listan niveles Q2_K, Q4_K_M, Q8_0, etc.) |
| Idiomas soportados | no disponible |
| Licencia | llama3.2 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No disponible. La model card no describe la arquitectura (transformer, MoE, hibrida u otra), el numero de parametros, la longitud de contexto ni el proceso de entrenamiento. El nombre "Chichu-3-0" sugiere una tercera iteracion de un modelo propio y "Abliterated" sugiere una modificacion de pesos para reducir los rechazos del alineamiento, pero no hay documentacion que lo confirme.

Tampoco se indica el volumen de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF, DPO o fine-tuning supervisado. El unico dato tecnico cierto es el formato de distribucion: pesos GGUF, orientados a inferencia cuantizada en CPU y GPU consumer.

## Capacidades

- Generacion de texto: no verificable sin documentacion ni ejemplos de uso.
- Razonamiento y matematicas: no disponible.
- Generacion de codigo: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (no se declaran idiomas).
- Capacidades especiales (modo thinking, vision, audio): no disponible.

## Casos de uso

- Inferencia local en equipos consumer: al distribuirse en GGUF, puede cargarse con llama.cpp u Ollama en un portatil o torre con GPU modesta, siempre que se conozca el tamano real del modelo (no disponible).
- Experimentacion con variantes sin alineamiento: el sufijo "Abliterated" sugiere un uso para investigacion sobre comportamiento del modelo cuando se atenuan los rechazos, aunque no hay evidencia publicada del metodo aplicado.
- Pruebas de integracion en pipelines GGUF: util para validar compatibilidad con servidores de inferencia que aceptan este formato (llama.cpp server, Ollama, LM Studio).
- Evaluacion comparativa de modelos derivados de Llama 3.2: sirve como punto de partida para medir diferencias frente al modelo base, siempre que se documenten los resultados propios.
- Prototipado rapido sin GPU dedicada: el formato GGUF permite ejecucion en CPU con cuantizaciones agresivas, adecuado para demos internas.
- Analisis de seguridad y alineamiento: un modelo "abliterated" es un caso de estudio para medir la eficacia de las tecnicas de atenuacion de rechazos y sus riesgos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible, al desconocerse el numero de parametros.
- GPU recomendadas: no disponible por la misma razon.
- Viabilidad en GPU consumer: no verificable; depende del tamano real del modelo y de la cuantizacion elegida.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF; vLLM y TGI no son la via natural para este formato.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Documentacion |
|---|---|---|---|---|---|
| Chichu-3-0-Abliterated-gguf | no disponible | no disponible | GGUF | llama3.2 | Minima (solo linea de licencia) |
| Llama 3.2 (Meta) | 1B, 3B, 11B vision y 90B vision | 128K en las variantes publicadas | safetensors, GGUF oficial | Llama 3.2 Community License | Model card completa y benchmarks publicados |
| Alternativas GGUF de la comunidad | Variable | Variable | GGUF | Variable | Variable |

La comparacion con el modelo base Llama 3.2 es la referencia natural por la licencia declarada, pero no puede establecerse una comparacion cuantitativa sin conocer el tamano y el entrenamiento de esta variante.

## Limitaciones y advertencias

- Documentacion practicamente inexistente: no hay model card, ejemplos, ni ficha de uso; cualquier despliegue exige validacion propia.
- Procedencia incierta: el nombre sugiere una modificacion "abliterated", lo que puede implicar una reduccion de los rechazos de seguridad y un mayor riesgo de contenido inapropiado.
- Sesgos conocidos: no disponibles, pero al derivar presumiblemente de Llama 3.2 heredaria los sesgos del modelo base, sin que el autor documente mitigaciones.
- Riesgo de alucinacion: no evaluado; sin benchmarks ni pruebas publicadas no puede estimarse.
- Licencia llama3.2: impone las condiciones de la Llama 3.2 Community License, incluida la obligacion de cumplir la politica de uso aceptable de Meta; conviene revisar los terminos antes de un uso comercial.
- Idiomas y contexto: no declarados; no debe asumirse soporte multilingue ni una ventana concreta.
- Repositorio sin traccion: cero descargas y cero likes, sin senales de mantenimiento ni comunidad que valide su funcionamiento.
- Fechas anomalas: creacion y actualizacion en 2026-11-10, lo que impide contrastar su historial de publicacion.

## Enlaces

- Hugging Face: https://huggingface.co/Sebastianpro88/Chichu-3-0-Abliterated-gguf
- Licencia Llama 3.2 (referencia): https://www.llama.com/llama3_2/license/
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Ollama: https://ollama.com
