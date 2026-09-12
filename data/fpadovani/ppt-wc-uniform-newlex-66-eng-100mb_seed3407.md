# fpadovani/ppt-wc-uniform-newlex-66-eng-100mb_seed3407

## Resumen

ppt-wc-uniform-newlex-66-eng-100mb_seed3407 es un ajuste fino (SFT) del modelo base goldfish-models/eng_latn_100mb, un modelo de lenguaje monolingue en ingles de la familia Goldfish, que emplea la arquitectura GPT-2. El autor del ajuste es fpadovani (usuario vinculado al proyecto white_cotterell de la Universidad de Groningen, segun la URL de Weights & Biases incluida en la model card). El modelo tiene 86.508.288 parametros totales, segun los pesos safetensors publicados, y se distribuye en formato transformers con licencia no especificada.

Se trata de un artefacto de investigacion, no de un modelo orientado a producto: el repositorio acumula 0 descargas y 0 likes, el nombre del modelo sugiere un experimento controlado (una configuracion concreta de muestreo de datos y vocabulario, semilla 3407) y la model card se limita a la plantilla autogenerada por TRL. No incluye informacion sobre composicion del dataset de ajuste, numero de tokens, longitud de contexto ni idiomas, mas alla de que el modelo base esta etiquetado como ingles (eng_latn).

Su relevancia es, por tanto, acotada: sirve como punto de comparacion en estudios sobre estrategias de entrenamiento y como ejemplo reproducible de un pipeline SFT con TRL 0.23.0, Transformers 4.56.2, PyTorch 2.11.0 y Datasets 4.8.4. No es un candidato razonable para despliegues en produccion ni para tareas generales de generacion de texto, dado su tamano, la ausencia de evaluacion publicada y la falta de definicion de licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (transformer decoder-only), heredada del modelo base goldfish-models/eng_latn_100mb |
| Parametros totales | 86.508.288 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (no se publican versiones cuantizadas; los pesos safetensors son convertibles a GGUF/8-bit/4-bit) |
| Idiomas soportados | no disponible (el modelo base esta etiquetado como eng_latn, es decir, ingles) |
| Licencia | no disponible (la model card contiene el marcador de posicion «licence: license») |
| Formato de pesos | safetensors (repo de 1,4 GB; incluye artefactos de entrenamiento ademas de los pesos) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un transformer decoder-only de tipo GPT-2 con 86,5 millones de parametros, tamano intermedio entre distilgpt2 (82 M) y GPT-2 small (124 M). El ajuste se realizo mediante SFT (supervised fine-tuning) con la libreria TRL en su version 0.23.0, sobre Transformers 4.56.2, PyTorch 2.11.0, Datasets 4.8.4 y Tokenizers 0.22.1. La model card confirma el uso del flag generated_from_trainer y enlaza la ejecucion de entrenamiento en Weights & Biases (proyecto white_cotterell, run pj6ici7q), pero no detalla el dataset de ajuste, el numero de tokens, la funcion de perdida ni si se aplicaron tecnicas posteriores como DPO o RLHF.

El modelo base, goldfish-models/eng_latn_100mb, pertenece a la coleccion Goldfish, que entrena modelos GPT-2 pequenos sobre subconjuntos de 100 MB de texto por idioma; el sufijo 100mb del nombre se refiere a ese presupuesto de datos. El nombre del ajuste (ppt-wc-uniform-newlex) apunta a una configuracion experimental concreta, presumiblemente ligada a estrategias de seleccion de datos o de vocabulario y a la semilla 3407, aunque la informacion proporcionada no permite confirmar el significado de esas abreviaturas ni los detalles del protocolo. No se documenta ninguna innovacion tecnica adicional (atencion lineal, decodificacion especulativa, MoE o SSM).

## Capacidades

- Generacion de texto autoregresiva basica, en linea con un GPT-2 de 86,5 M de parametros.
- Formato de chat mediante pipeline de transformers, con entrada en estilo lista de mensajes (role/content) y return_full_text=False.
- Ajuste supervisado orientado a respuestas sobre el prompt de ejemplo de la model card (una pregunta abierta de tipo reflexivo).
- Soporte de tool calling: no disponible (no se documenta ni se infiere de la arquitectura).
- Soporte de agentes o razonamiento multi-paso: no disponible (no documentado; poco viable con este tamano).
- Capacidades multilingues: no disponible; el modelo base esta etiquetado como ingles (eng_latn).
- Capacidades especiales (modo thinking, vision, audio): no disponibles.
- Compatibilidad declarada con text-generation-inference y endpoints_compatible en las etiquetas del repositorio.

## Casos de uso

- Reproduccion de experimentos academicos: el modelo sirve como punto de control en estudios sobre SFT y estrategias de muestreo de datos, dado que incluye semilla fija (3407), run de Weights & Biases y versiones exactas del stack. Es su uso mas realista.
- Pruebas de integracion de pipelines TRL/Transformers: permite verificar que un flujo de SFT y publicacion en el Hub funciona de extremo a extremo con pocos recursos.
- Docencia y practicas de ajuste fino: con 86,5 M de parametros, se puede ajustar o inferir en una GPU de consumo o incluso en CPU, lo que lo hace util en laboratorios con hardware limitado.
- Pruebas de humo de infraestructura de inferencia: sirve para validar que vLLM, TGI o transformers funcionan correctamente antes de desplegar modelos grandes, por su bajisimo coste de carga.
- Generacion de texto de relleno o sintetico en entornos de test: util para probar canalizaciones que necesitan texto generado sin requisitos de calidad.
- Investigacion sobre degradacion por ajuste fino: comparar sus salidas con las del modelo base goldfish-models/eng_latn_100mb permite medir como el SFT altera la distribucion del modelo original.
- Experimentos de cuantizacion extrema: su tamano permite probar conversiones a GGUF, 8-bit y 4-bit, y medir el impacto en perplejidad en hardware muy limitado, aunque dichas conversiones no estan publicadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,35 GB en fp32, 0,17 GB en fp16/bf16, 0,09 GB en int8 y 0,05 GB en 4-bit (calculo teorico a partir de 86,5 M de parametros, sin contar el overhead de activaciones y de la cache KV).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; no requiere A100, H100 ni modelos de datacenter.
- Cabe en GPU de consumo: si, en cualquier GPU moderna (RTX 3060, RTX 4090, GTX 1650, e incluso iGPU con suficiente memoria compartida).
- Ejecucion en CPU: viable; el modelo es lo bastante pequeno para generar en CPU con latencias de segundos por respuesta.
- Opciones de despliegue: transformers (pipeline de text-generation), text-generation-inference (segun las etiquetas del repo), y llama.cpp/Ollama/GGUF previa conversion de los pesos, que no esta publicada.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; en la practica seran altos en GPU por el reducido tamano, pero no hay medidas publicadas.
- Nota: el repositorio ocupa 1,4 GB, muy por encima de los ~0,35 GB de los pesos en fp32, lo que sugiere que incluye checkpoints intermedios u optimizador; conviene revisar el contenido antes de descargarlo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ppt-wc-uniform-newlex-66-eng-100mb_seed3407 | 86,5 M | no disponible | sin benchmarks publicados | no disponible | HuggingFace, 0 descargas |
| goldfish-models/eng_latn_100mb (base) | no disponible (misma arquitectura GPT-2) | no disponible | ver model card del modelo base | no disponible en la informacion proporcionada | HuggingFace |
| distilgpt2 | 82 M | 1.024 tokens | benchmarks publicados por el autor en su model card | MIT/Apache-2.0 segun el repositorio original | ampliamente disponible |
| GPT-2 small | 124 M | 1.024 tokens | benchmarks publicados por OpenAI | MIT | ampliamente disponible |

La comparacion con distilgpt2 y GPT-2 small es la mas natural por orden de magnitud de parametros; no obstante, para este modelo concreto no existen datos de evaluacion que permitan establecer una comparacion de rendimiento.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks, ni evaluacion cualitativa, ni descargas que permitan inferir un uso validado.
- Riesgo de alucinacion elevado: un GPT-2 de 86,5 M de parametros tiene una capacidad factual muy limitada y tiende a producir texto incoherente en generaciones largas.
- Sesgos: no documentados por el autor, pero heredados del corpus de 100 MB del modelo base y del dataset de SFT, ambos desconocidos. Es esperable sesgo de genero, raza y nacionalidad por el entrenamiento sobre texto web sin filtrar documentado.
- Limitaciones de contexto: la longitud de contexto no esta especificada; si sigue el valor tipico de GPT-2 (1.024 tokens), no es apto para conversaciones multi-turno largas ni para documentos extensos.
- Limitaciones de idioma: el modelo base esta etiquetado como ingles (eng_latn); se desconoce su comportamiento en castellano y no hay evidencia de soporte multilingue.
- Licencia sin definir: la model card contiene un marcador de posicion («licence: license»). No se puede asumir permiso de uso comercial; hay que contactar con el autor y revisar la licencia del modelo base goldfish-models/eng_latn_100mb antes de cualquier uso en produccion.
- Artefacto de investigacion: nombre con semilla explicita y multiples variantes (sufijos como newlex, wc-uniform, 66), lo que indica que forma parte de una comparativa experimental y no de una version estable o mantenida.
- Sin garantias de mantenimiento: el repositorio tiene 0 descargas y 0 likes, y no se documenta soporte del autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fpadovani/ppt-wc-uniform-newlex-66-eng-100mb_seed3407
- Modelo base: https://huggingface.co/goldfish-models/eng_latn_100mb
- Ejecucion de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/white_cotterell/runs/pj6ici7q
- Repositorio de TRL: https://github.com/huggingface/trl
- Paper de TRL (cita incluida en la model card): von Werra et al., «TRL: Transformer Reinforcement Learning», GitHub, 2020.
