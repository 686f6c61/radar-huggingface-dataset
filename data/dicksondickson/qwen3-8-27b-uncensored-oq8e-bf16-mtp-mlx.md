# dicksondickson/Qwen3.8-27B-Uncensored-oQ8e-bf16-mtp-MLX

## Resumen

Qwen3.8-27B-Uncensored-oQ8e-bf16-mtp-MLX es una cuantizacion en formato MLX del modelo orcarouter/Qwen3.8-27B-Uncensored, publicada por el usuario dicksondickson. Se trata de un checkpoint de 27.781.427.952 parametros (unos 27,8 mil millones) derivado de la familia Qwen3.5 y sometido a un proceso de "abliteration" o eliminacion de los mecanismos de rechazo y filtrado de seguridad por parte de orcarouter. El resultado es un modelo orientado a generar contenido sin las restricciones habituales de alineamiento, empaquetado especificamente para su ejecucion en hardware Apple Silicon mediante la libreria MLX.

La relevancia de esta ficha reside en dos factores. Primero, la cuantizacion mixta oQ (oMLX 0.7.3.dev2) con imatrix, que mantiene los tensores criticos en bf16 y aplica precision reducida de 8 bits al resto, buscando preservar calidad en un tamano de repositorio de 90 GB. Segundo, el soporte de MTP (multi-token prediction) y la orientacion explicita a chips Apple M3 o posteriores, con una variante fp16 para M1/M2. El modelo esta pensado para entornos de investigacion y pruebas controladas, no para produccion con requisitos de seguridad.

La licencia declarada es MIT, lo que permite uso comercial y modificacion, aunque la propia model card recomienda evitar el despliegue directo en aplicaciones publicas. No se dispone de informacion sobre el pipeline, los idiomas soportados ni los datos de entrenamiento originales en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5, tag `qwen3_5`); detalles internos no disponibles |
| Parametros totales | 27.781.427.952 (27,8 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | oQ mixta de 8 bits con tensores criticos en bf16; variante fp16 para Apple M1/M2 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base es un transformer de la familia Qwen3.5 con 27,8 mil millones de parametros. No se dispone en la informacion proporcionada de detalles sobre el numero de capas, dimensiones ocultas, mecanismos de atencion (si emplea atencion lineal, GQA o variantes hibridas) ni sobre el proceso de entrenamiento original: numero de tokens, composicion del dataset, fases de RLHF o DPO. Tampoco se documenta el metodo exacto de abliteration aplicado por orcarouter mas alla de la etiqueta "uncensored".

La innovacion tecnica documentada se concentra en la capa de cuantizacion. El checkpoint se genero con oMLX 0.7.3.dev2 mediante cuantizacion de precision mixta oQ con imatrix, que usa una matriz de importancia para decidir que tensores conservan bf16 y cuales pasan a 8 bits. Segun la model card, la revision del 24 de octubre de 2026 mejora la cuantizacion de baja precision ("Better Low-Bit oQ"). El sufijo `mtp` indica soporte de multi-token prediction, una tecnica de decodificacion especulativa que permite proponer varios tokens por paso para acelerar la generacion. Los tensores en bf16 estan pensados para Apple M3 y posteriores; para M1/M2 se indica la variante fp16.

## Capacidades

- Generacion de texto autoregresiva en el marco de la familia Qwen3.5, con las capacidades heredadas del modelo base (no detalladas en la informacion disponible).
- Generacion sin filtrado de seguridad practicamente nulo: el proceso de abliteration elimina los rechazos tipicos ante peticiones sensibles.
- Decodificacion acelerada mediante multi-token prediction (MTP), integrada en el ecosistema MLX.
- Ejecucion nativa en Apple Silicon a traves de MLX, con variantes de precision segun generacion de chip.
- Soporte de tool calling, agentes, vision, audio o razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.

## Casos de uso

- Investigacion sobre alineamiento y seguridad: el modelo permite estudiar el comportamiento de un LLM sin mecanismos de rechazo, comparando sus respuestas con las del modelo base alineado para analizar que tipos de contenido se desbloquean y con que frecuencia.
- Pruebas de red teaming controladas: sirve como sujeto de prueba para evaluar clasificadores de contenido, filtros de salida y sistemas de moderacion en un entorno aislado, dado que genera material sensible con facilidad.
- Generacion creativa sin restricciones tematicas: escritura de ficcion adulta, narrativa de terror o dialogos crudos donde los filtros estandar interrumpen la continuidad; el modelo mantiene el estilo sin rechazos.
- Desarrollo y validacion de pipelines MLX: util para ingenieros que construyen aplicaciones sobre MLX y necesitan un checkpoint de ~28 B con cuantizacion mixta para medir latencia, memoria y throughput en chips M3/M4.
- Evaluacion de tecnicas de cuantizacion: al existir variantes bf16 y fp16 y una cuantizacion oQ documentada, permite comparar la degradacion de calidad entre precisiones sobre el mismo modelo base.
- Simulacion de personajes o agentes con personalidad sin restricciones: en entornos de prototipado de videojuegos o narrativa interactiva donde se requiere un tono sin autocensura, siempre con revision humana de las salidas.
- Analisis de contenido adversario: generacion de ejemplos de texto toxico o manipulador para entrenar detectores, en un entorno de laboratorio con supervision.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/unified memory estimada: con 27,8 B de parametros, la cuantizacion de 8 bits ocupa aproximadamente 28-30 GB, mientras que los tensores en bf16 y el overhead de MLX elevan el consumo practico; el repositorio completo pesa 90 GB, lo que sugiere que incluye varias variantes de precision. Para inferencia con la variante de 8 bits se recomienda un minimo de 32 GB de memoria unificada.
- GPU/chips recomendados: Apple M3 Max, M3 Ultra, M4 Max y M4 Ultra con 48 GB o mas de memoria unificada para la variante bf16; Apple M1/M2 con la variante fp16 y al menos 32 GB.
- Cabe en GPU de consumo: si, en equipos Apple Silicon de gama alta; no esta pensado para GPUs NVIDIA, ya que el formato es MLX y no GGUF ni safetensors estandar de PyTorch.
- Opciones de despliegue: MLX y oMLX (motor de jundot/omlx); no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles; el soporte MTP deberia reducir el tiempo por token frente a decodificacion autoregresiva estandar, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| dicksondickson/Qwen3.8-27B-Uncensored-oQ8e-bf16-mtp-MLX | 27,8 B | no disponible | MLX safetensors (oQ 8-bit/bf16) | MIT | Cuantizacion MLX con MTP, orientada a Apple Silicon |
| orcarouter/Qwen3.8-27B-Uncensored | 27,8 B (base) | no disponible | safetensors | no disponible | Modelo base sin cuantizar del que deriva este checkpoint |
| Alternativas de ~27-30 B sin censura en MLX | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la informacion proporcionada |

## Limitaciones y advertencias

- El filtrado de seguridad esta practicamente eliminado: el modelo puede generar contenido sensible, controvertido o inapropiado sin rechazo, segun advierte la propia model card.
- No es adecuado para audiencias generales, menores ni aplicaciones que exijan alta seguridad; la model card desaconseja su uso directo en produccion o en interfaces publicas.
- Riesgo elevado de alucinacion y de afirmaciones no verificadas, agravado por la ausencia de benchmarks publicados que permitan calibrar su fiabilidad.
- Sin datos sobre sesgos conocidos, composicion del dataset de entrenamiento ni idiomas soportados; no se puede evaluar su comportamiento multilingue ni su equidad.
- La licencia MIT permite uso comercial, pero el autor declina cualquier responsabilidad legal o etica derivada del uso y recomienda supervision humana en tiempo real.
- Dependencia exclusiva del ecosistema MLX y de hardware Apple Silicon: no es portable a GPUs NVIDIA sin conversion adicional.
- La cuantizacion de 8 bits puede degradar tareas de razonamiento o codigo frente al modelo base en bf16 completo; no hay evaluaciones publicadas que lo cuantifiquen.
- El repositorio de 90 GB y la revision de octubre de 2026 implican que copias anteriores pueden estar obsoletas; conviene verificar la fecha de descarga.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dicksondickson/Qwen3.8-27B-Uncensored-oQ8e-bf16-mtp-MLX
- Modelo base: https://huggingface.co/orcarouter/Qwen3.8-27B-Uncensored
- Motor oMLX (jundot/omlx): https://github.com/jundot/omlx
