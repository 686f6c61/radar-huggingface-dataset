# certen/DrC-Qwen3.5-9B-Unified-4bit

## Resumen
DrC-Qwen3.5-9B-Unified-4bit es un ajuste fino de tipo "neuro-symbolic" y "neuro-semantic" publicado por el usuario certen sobre el modelo cuantizado mlx-community/Qwen3.5-9B-4bit. Su proposito declarado es la toma de decisiones de eleccion finita (finite-choice decisions) y el anclaje estructurado sobre un contexto aportado por el usuario: el modelo recibe un contexto en lenguaje natural o estructurado y un conjunto cerrado de opciones, y debe seleccionar la mejor o abstenerse (ABSTAIN) cuando falta informacion o las reglas entran en conflicto.

El modelo hereda la arquitectura Qwen3.5 (transformer denso, familia Qwen) en su variante de 9B, pero distribuido como pesos MLX de 4 bits optimizados para Apple Silicon. Con 8.953.803.264 parametros reales segun los safetensors y un repositorio de 5,1 GB, esta pensado para ejecucion local en Mac con la libreria mlx-lm, no para despliegues en GPU CUDA convencionales.

Su relevancia actual es acotada pero especifica: cubre el nicho de clasificacion, enrutado y seleccion de herramientas con abtencion explicita, un patron cada vez mas demandado en pipelines de agentes donde el coste de una decision erronea es alto. La licencia Apache 2.0 facilita su adopcion comercial, aunque el autor no publica datos de entrenamiento, benchmarks ni evaluaciones formales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3.5), ajuste fino sobre mlx-community/Qwen3.5-9B-4bit |
| Parametros totales | 8.953.803.264 (aprox. 8,95B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits (unica variante publicada, formato MLX) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en formato MLX (libreria mlx) |

## Arquitectura y entrenamiento
El modelo parte de mlx-community/Qwen3.5-9B-4bit, una conversion a 4 bits para MLX del Qwen3.5-9B de Alibaba. La arquitectura subyacente es un transformer denso de la familia Qwen3.5, sin mezcla de expertos. El ajuste fino introduce un comportamiento orientado a decisiones: dado un contexto y una lista de opciones etiquetadas, el modelo emite una unica seleccion o la etiqueta ABSTAIN cuando la evidencia es insuficiente o las reglas son contradictorias.

No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens utilizados, la composicion de los datos, ni si se emplearon tecnicas de RLHF, DPO o SFT supervisado. Tampoco se documentan innovaciones tecnicas adicionales mas alla de la cuantizacion 4-bit propia de MLX y el enfoque declarado de "neuro-symbolic grounding". Toda esta seccion queda, por tanto, como no disponible en la informacion publicada por el autor.

## Capacidades
- Seleccion de una opcion entre un conjunto cerrado de alternativas (clasificacion, enrutado, seleccion de herramienta).
- Abtencion explicita (ABSTAIN) ante informacion faltante o reglas en conflicto.
- Interpretacion de contexto en lenguaje natural o estructurado (politicas, condiciones, datos de caso).
- Razonamiento de un solo paso orientado a decision, no a generacion abierta.
- Ejecucion local en Apple Silicon mediante MLX.
- Generacion de texto conversacional (heredada del modelo base Qwen3.5).
- Soporte de tool calling, agentes multi-paso, vision, audio o thinking mode: no documentado en la informacion disponible.

## Casos de uso
- Enrutado de tickets de soporte: el modelo recibe el texto del ticket y una lista de colas o equipos (facturacion, tecnico, legal, etc.) y devuelve la asignacion, con ABSTAIN cuando el ticket es ambiguo; encaja por su diseno de eleccion finita.
- Seleccion de herramienta en agentes: dado el estado de la conversacion y un catalogo de funciones disponibles, el modelo elige la funcion adecuada o se abstiene si ninguna aplica, lo que reduce llamadas erroneas en pipelines de agentes.
- Clasificacion de documentos con reglas de negocio: por ejemplo, decidir si una solicitud de reembolso se aprueba, se ofrece credito en tienda o se deniega, segun la politica incluida en el contexto.
- Triaje de compliance y riesgo: evaluar transferencias, altas o excepciones contra reglas explicitas y abstenerse cuando falta una verificacion obligatoria (sanciones, aprobaciones), como muestra el ejemplo del autor.
- Moderacion y etiquetado de contenido: asignar una categoria de un taxonomia cerrada a textos o mensajes, con abtencion ante casos limite.
- Automatizacion de back-office local: ejecutar decisiones sensibles en un Mac sin enviar datos a la nube, gracias a la ejecucion local con MLX y la licencia Apache 2.0.
- Prototipado rapido de sistemas de decision: servir como baseline para evaluar patrones de abtencion y grounding antes de invertir en modelos mayores.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM/unified memory estimada: aproximadamente 5,1 GB de pesos en 4 bits; en Apple Silicon se comparte con el sistema, por lo que conviene reservar 7-9 GB de memoria unificada para inferencia comoda.
- GPU recomendadas: exclusivamente Apple Silicon (series M1, M2, M3, M4 y superiores); no es compatible de forma nativa con CUDA sin conversion previa.
- Cabe en consumer hardware: si, en cualquier Mac con al menos 8-16 GB de memoria unificada; en equipos de 8 GB puede quedar justo.
- Opciones de despliegue: mlx-lm (CLI y API Python); no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para este formato MLX.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| DrC-Qwen3.5-9B-Unified-4bit | 8,95B | no disponible | MLX 4-bit | Apache 2.0 | Ajuste para decision finita con abtencion |
| mlx-community/Qwen3.5-9B-4bit (base) | 9B aprox. | no disponible | MLX 4-bit | Apache 2.0 (heredada) | Modelo base sin ajuste de decision |
| Qwen3.5-9B (original) | 9B aprox. | no disponible | safetensors | Apache 2.0 | Version completa en precision original |

## Limitaciones y advertencias
- No hay datos publicados sobre sesgos, composicion del dataset ni evaluaciones de seguridad.
- Riesgo de alucinacion en la seleccion de opciones: el autor recomienda verificar el resultado contra los requisitos de la aplicacion, especialmente en decisiones de consecuencias significativas.
- El modelo esta disenado para eleccion finita; no debe usarse como generador abierto de proposito general sin validacion.
- Longitud de contexto e idiomas soportados no documentados; el comportamiento multilingue es incierto.
- Formato MLX 4-bit: requiere Apple Silicon y mlx-lm; no es directamente desplegable en infraestructura CUDA estandar.
- La cuantizacion 4-bit puede degradar la precision en casos limite frente al modelo original en precision completa.
- Aunque la licencia es Apache 2.0, conviene revisar las condiciones del modelo base Qwen3.5 antes de uso comercial a gran escala.
- Modelo con 0 descargas y 0 likes en el momento de la ficha: sin validacion de la comunidad ni reportes independientes.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/certen/DrC-Qwen3.5-9B-Unified-4bit
- Modelo base: https://huggingface.co/mlx-community/Qwen3.5-9B-4bit
- Libreria MLX: https://github.com/ml-explore/mlx
- mlx-lm: https://github.com/ml-explore/mlx-lm
