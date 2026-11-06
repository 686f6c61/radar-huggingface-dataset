# GoldenSpain/Ornith-1_5_9B-zero-dungeon-checkpoints

## Resumen

Ornith-1_5_9B-zero-dungeon-checkpoints es un adaptador LoRA (PEFT) publicado por el usuario GoldenSpain sobre el modelo base ornith-ai/Ornith-1.5-9B. No se trata de un modelo completo, sino de un conjunto de pesos de ajuste fino supervisado (SFT) entrenados con las librerías TRL y Unsloth, empaquetados en formato safetensors con el framework PEFT 0.21.2. El repositorio ocupa 0,2 GB, lo que es coherente con un adaptador de bajo rango y no con los pesos completos de un modelo de 9 mil millones de parametros.

La relevancia de esta ficha es limitada y conviene ser explicito: la model card es la plantilla por defecto de Hugging Face sin rellenar, no declara licencia, idiomas, datos de entrenamiento, hiperparametros ni resultados de evaluacion, y el repositorio no registra descargas ni interacciones. El nombre del adaptador ("zero-dungeon-checkpoints") sugiere un ajuste orientado a dominios de fantasia, juegos de rol o narrativa interactiva, pero se trata de una inferencia a partir del nombre y no de un dato confirmado por el autor.

Por tanto, esta ficha documenta lo que se puede verificar (naturaleza PEFT, modelo base, herramientas de entrenamiento, tamano del repo) y marca como no disponible todo lo demas. Cualquier uso en produccion deberia partir de una evaluacion propia del adaptador frente al modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer (modelo base ornith-ai/Ornith-1.5-9B); arquitectura del base no disponible |
| Parametros totales | No disponible para el adaptador (el modelo base se denomina 9B, ~9 mil millones de parametros) |
| Parametros activos | No aplica (no se indica que el base sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el repo contiene safetensors del adaptador; no se publican GGUF ni cuantizaciones) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA) |
| Libreria | PEFT 0.21.2 |
| Modelo base | ornith-ai/Ornith-1.5-9B |
| Herramientas de entrenamiento | TRL, Unsloth, Transformers |
| Tipo de ajuste | SFT (supervised fine-tuning) con LoRA |
| Tamano del repositorio | 0,2 GB |
| Pipeline | text-generation |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El artefacto publicado es un adaptador LoRA, no un modelo completo. La arquitectura efectiva es la del modelo base ornith-ai/Ornith-1.5-9B, del cual no se proporciona informacion en la documentacion disponible: no se detalla si es un transformer denso convencional, si emplea atencion lineal, decodificacion especulativa u otras innovaciones, ni su ventana de contexto. El adaptador se entrena mediante SFT con las librerias TRL y Unsloth, lo que indica un flujo de ajuste supervisado sobre pares instruccion-respuesta y un uso de Unsloth orientado a reducir memoria y acelerar el entrenamiento de LoRA.

No hay informacion sobre el volumen de datos de entrenamiento, la composicion del dataset, la existencia de RLHF/DPO posterior, los hiperparametros (rango LoRA, alpha, tasa de aprendizaje, epochs) ni la precision usada (fp16, bf16, fp8). Tampoco se documenta el proceso de preprocesado. El nombre del repositorio sugiere un enfasis en contenido de fantasia o juegos de rol, pero el autor no lo confirma.

## Capacidades

- Generacion de texto conversacional, segun el pipeline declarado (text-generation) y la etiqueta "conversational".
- Ajuste fino supervisado sobre el modelo base: se espera que herede las capacidades del base, aunque no se documenta cuales son.
- Capacidad de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (modo thinking, vision, audio): no disponible.
- Especializacion tematica: posible orientacion a narrativa de fantasia o juegos de rol por el nombre del adaptador, sin confirmacion del autor.

## Casos de uso

- Prototipado de narrativa interactiva: cargar el adaptador sobre Ornith-1.5-9B para experimentar con generacion de texto de tematica de fantasia o juegos de rol, dado el nombre del checkpoint, evaluando antes si el ajuste aporta frente al base.
- Investigacion sobre LoRA y SFT: usar el adaptador como ejemplo reproducible de un flujo TRL + Unsloth para estudiar como afecta el ajuste de bajo rango al comportamiento del modelo base.
- Comparacion base vs. adaptador: medir degradacion o mejora en tareas generales al aplicar el adaptador, util para decidir si merece la pena en un pipeline propio.
- Generacion de contenido creativo controlado: emplear el adaptador como punto de partida para escritura asistida de ficcion, con revision humana obligatoria por la ausencia de evaluacion publicada.
- Base para un segundo ajuste: partir de este LoRA para un entrenamiento adicional especifico del dominio del usuario, aprovechando que el adaptador es ligero (0,2 GB).
- Experimentacion educativa: demostrar en un curso o taller como se publica y se carga un adaptador PEFT con la libreria transformers y PEFT 0.21.2.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye seccion de evaluacion rellenada y el repositorio no registra descargas ni evaluaciones de la comunidad.

## Requisitos de hardware

- VRAM para el adaptador: el adaptador ocupa 0,2 GB; la VRAM real la determina el modelo base de ~9B.
- VRAM estimada para el base en inferencia: aproximadamente 18 GB en fp16/bf16, unos 9-10 GB en cuantizacion de 4 bits y unos 5-6 GB en 3 bits, calculado a partir del tamano nominal del base y no de mediciones publicadas.
- GPU recomendadas: A100 40/80 GB, H100 o L40S para fp16 sin cuantizar; RTX 4090 (24 GB) para fp16 justo o 8 bits; RTX 3090/4080 y GPUs de 12-16 GB con cuantizacion de 4 bits.
- Cabe en GPU de consumo: si, con cuantizacion, en tarjetas de 12 GB o mas; en 8 GB es ajustado y puede requerir offload.
- Opciones de despliegue: transformers + PEFT para cargar el adaptador; vLLM y TGI para servir el modelo fusionado; llama.cpp/Ollama solo si se fusiona y convierte a GGUF, ya que el repo no incluye GGUF.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Ornith-1_5_9B-zero-dungeon-checkpoints (este) | Adaptador sobre base ~9B | No disponible | No disponible | Safetensors (PEFT) | Adaptador LoRA SFT, sin evaluacion publicada |
| ornith-ai/Ornith-1.5-9B (base) | ~9B | No disponible | No disponible | No disponible | Modelo base del adaptador; sus specs no se detallan en la informacion disponible |
| Alternativas de ~9B de proposito general | ~7-9B | Variable | Variable | Variable | No se dispone de datos comparables en la informacion proporcionada |

No hay datos suficientes para una comparativa cuantitativa con alternativas concretas; se indica "no disponible".

## Limitaciones y advertencias

- Ausencia total de model card: no hay informacion sobre datos, sesgos, evaluacion ni uso previsto; el autor no ha rellenado ninguna seccion.
- Licencia no declarada: no se puede asumir uso comercial permitido; hay que consultar la licencia del modelo base ornith-ai/Ornith-1.5-9B antes de cualquier despliegue.
- Riesgo de alucinacion y de sobreajuste al dominio del adaptador no cuantificado, al no existir evaluacion.
- Idiomas soportados desconocidos; no se garantiza un comportamiento correcto en castellano.
- El adaptador no es autonomo: requiere descargar el modelo base y cargarlo con PEFT; sin el base no funciona.
- Sin descargas ni validacion de la comunidad: no hay evidencia externa de calidad.
- El nombre sugiere contenido de fantasia o juegos de rol; verificar que el ajuste no degrade capacidades generales antes de usarlo en tareas ajenas a ese dominio.
- Posible dependencia de la version de PEFT (0.21.2) para una carga correcta del adaptador.

## Enlaces

- Repositorio del adaptador en Hugging Face: https://huggingface.co/GoldenSpain/Ornith-1_5_9B-zero-dungeon-checkpoints
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-9B
- Referencia citada en los tags (impacto ambiental, Lacoste et al. 2019): https://arxiv.org/abs/1910.09700
