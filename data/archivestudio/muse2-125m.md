# ArchiveStudio/Muse2-125M

## Resumen

Muse2-125M es un modelo de lenguaje autorregresivo de 122,9 millones de parametros (122.915.328 segun los pesos en safetensors) publicado en HuggingFace bajo el identificador ArchiveStudio/Muse2-125M y desarrollado por Muse Research. Se presenta como el hermano menor de Muse2-230M, con la misma arquitectura hibrida de convolucion y atencion construida desde cero en PyTorch (clase `Muse2ForCausalLM`), sin depender del codigo de `transformers`. El repositorio incluye tanto los pesos base como los de la version ajustada por instrucciones.

La arquitectura combina 12 bloques que intercalan 7 bloques de convolucion causal depthwise de kernel 3 con 5 bloques de atencion completa. Usa Grouped-Query Attention con 12 cabezas de consulta y 6 de clave-valor, RoPE con theta 1e6, RMSNorm, MLPs SwiGLU fusionados en paralelo (hidden 768, ff 2304), embeddings de entrada y salida compartidos y un vocabulario de 65.536 tokens BPE byte-level con tokens de control estilo ChatML. La longitud de contexto nominal es de 8k tokens, con un maximo declarado de 128k.

Su relevancia actual es doble. Por un lado, es un artefacto de investigacion que hace reproducible y auditable toda la pila (tokenizador, arquitectura e inferencia) en un rango de parametros apto para edge y on-device. Por otro, se distribuye bajo Apache-2.0 con etiquetas explicitas de salida estructurada, lo que lo hace atractivo como base para fine-tuning de tareas de extraccion y formateo en entornos con presupuesto de memoria muy reducido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer autorregresivo hibrido convolucion/atencion (`Muse2ForCausalLM`, implementado desde cero en PyTorch) |
| Parametros totales | 122.915.328 (122,9M) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 8k tokens nominal; 128k maximo declarado |
| Tipos de cuantizacion | no disponible; solo se publican pesos safetensors y los ejemplos de la model card cargan en float32. No se documentan versiones GGUF, GPTQ, AWQ ni similares |
| Idiomas soportados | Ingles; tambien maneja codigo fuente y texto matematico |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (PyTorch), mas `tokenizer.json` |

Detalles adicionales de configuracion: 12 bloques, 7 de convolucion causal depthwise (kernel 3) y 5 de atencion completa; GQA con 12 cabezas de consulta y 6 de clave-valor; RoPE theta 1e6; RMSNorm; SwiGLU con hidden 768 y ff 2304; embeddings de entrada/salida atados; vocabulario de 65.536 tokens BPE byte-level (pad=0, bos=1, eos=7, con tokens de control estilo ChatML); cutoff de conocimiento declarado a principios de 2024.

## Arquitectura y entrenamiento

Muse2-125M es un transformer autorregresivo con una columna vertebral hibrida: solo 5 de sus 12 bloques aplican atencion completa, mientras que los 7 restantes usan convolucion causal depthwise de kernel 3. Este diseno reduce el coste asociado a la atencion en secuencias largas y disminuye el tamano del cache KV, ya de por si contenido por el uso de GQA (6 cabezas KV frente a 12 de consulta). El resto de la pila es convencional y moderno: RoPE con theta elevado (1e6) para favorecer la extrapolacion posicional, RMSNorm, SwiGLU y atado de embeddings. La implementacion es propia (`muse`), no reutiliza `transformers`.

En cuanto al entrenamiento, la model card solo indica que la version Instruct se alineo mediante supervised fine-tuning con enmascaramiento de la perdida limitado a los tokens de completado (completion-only loss masking). No se aplico RLHF ni DPO. No hay informacion publicada sobre el numero de tokens de entrenamiento, la composicion del dataset, la mezcla de datos de codigo o matematicas, ni sobre el proceso de filtrado. El cutoff de conocimiento declarado es principios de 2024. La propia ficha describe el modelo como un artefacto estatico de investigacion, sin alineamiento de seguridad, red-teaming ni filtrado de contenido.

## Capacidades

- Generacion de texto en ingles y finalizacion de secuencias (modelo base).
- Conversacion multiturno en la version Instruct, con plantilla de chat y tokens de control estilo ChatML.
- Completado de codigo fuente y tratamiento de texto matematico, segun la ficha del autor.
- Salida estructurada, con etiquetas explicitas `structured-output` y `json` en el repositorio, orientadas a extraccion de datos y formateo disciplinado.
- Contexto de 8k tokens nominal, con soporte declarado hasta 128k (sin datos publicados sobre la degradacion mas alla de 8k).
- Inferencia en edge y on-device gracias a su tamano reducido y a los embeddings atados.
- Capacidad de servir como base para fine-tuning posterior (el repositorio incluye variante base y variante Instruct).
- Tool calling / function calling: no disponible, no documentado en la informacion proporcionada.
- Capacidades multimodales (vision o audio): no disponible.
- Modo de razonamiento explicito (thinking mode): no disponible.
- Capacidades multilingues: no disponibles; el modelo es solo en ingles.

## Casos de uso

- Extraccion de logs a JSON: el modelo esta etiquetado explicitamente para salida estructurada y JSON, por lo que puede convertir lineas de log o texto semi-estructurado en objetos JSON con un esquema fijo. Su tamano permite ejecutarlo dentro del propio pipeline de ingesta sin coste de GPU dedicada.
- Asistente de chat en dispositivo: la variante Instruct esta pensada para entornos con recursos limitados (moviles, Raspberry Pi, portatiles sin GPU). Un asistente de preguntas frecuentes o ayuda contextual puede correr en local con menos de 1 GB de memoria en fp32.
- Base para fine-tuning de dominio: al ser Apache-2.0 e incluir pesos base e Instruct, sirve como punto de partida para ajustar tareas concretas (clasificacion, resumen corto, extraccion de entidades) con presupuestos de computo muy bajos.
- Autocompletado de codigo en IDE ligero: con 8k tokens de contexto puede mantener el contexto de un fichero fuente pequeno o mediano y sugerir continuaciones, siempre que se valide el resultado con tests automatizados.
- Normalizacion y formateo en pipelines ETL: la orientacion a "salida disciplinada en formato" lo hace util para reescribir campos, normalizar fechas o unificar estructuras en lotes de datos, con verificacion posterior por reglas.
- Generacion de datos sinteticos y destilacion: puede producir pares instruccion-respuesta de bajo coste para preentrenar o calibrar modelos mayores, o para aumentar datasets de tareas muy especificas.
- Investigacion en arquitecturas hibridas: permite estudiar de forma reproducible el equilibrio entre bloques convolucionales y de atencion, el efecto de GQA y del atado de embeddings en el rango de los 100M de parametros.
- Prototipado rapido en hardware muy limitado: entornos de demostracion, docencia o pruebas de concepto donde no hay GPU disponible y se necesita un modelo con licencia permisiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que las pruebas de seguridad y capacidad realizadas hasta la fecha se limitan a una inspeccion cualitativa, sin cifras de MMLU, HumanEval, GSM8K ni de tareas de contexto largo.

## Requisitos de hardware

- VRAM estimada para los pesos (calculada a partir de los 122,9M de parametros): unos 0,49 GB en fp32, 0,25 GB en fp16/bf16, 0,12 GB en int8 y 0,06 GB en int4. A esta cifra hay que sumar el cache KV y el overhead del runtime.
- Cache KV estimado (derivado de la configuracion: 5 capas de atencion, 6 cabezas KV, dimension de cabeza 64, fp16): unos 7,5 KB por token, es decir, aproximadamente 63 MB con 8k tokens y alrededor de 1 GB si se agota la ventana declarada de 128k.
- GPU recomendadas: cualquier GPU consumer moderna sirve de sobra; el modelo cabe en tarjetas con 2 GB o menos (GTX 1050, GTX 1650, RTX 3050, RTX 4060, RTX 4090). Las A100 o H100 no aportan ventaja alguna salvo por agregacion de muchas instancias en paralelo.
- Cabe en GPU consumer: si, en practicamente todas, y tambien en CPU, en SoC moviles y en placas tipo Raspberry Pi.
- Opciones de despliegue: la model card solo documenta el paquete propio `muse` (PyTorch + safetensors). No hay soporte documentado para vLLM, llama.cpp, Ollama, TGI ni otros servidores de inferencia, ni se publican pesos en GGUF.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Muse2-125M | 122,9M | 8k (128k max) | Hibrida convolucion/atencion, GQA | Apache-2.0 | Pesos safetensors; requiere el paquete `muse` |
| Muse2-230M | 230M (segun la model card) | no disponible | Hibrida convolucion/atencion (misma familia) | no disponible | no disponible |
| SmolLM2-135M | 135M | 8k | Transformer denso | Apache-2.0 | Ecosistema amplio (incluye GGUF) |
| Qwen2.5-0.5B | 494M | 32k | Transformer denso | Apache-2.0 | Ecosistema amplio (incluye GGUF) |
| GPT-2 (124M) | 124M | 1024 | Transformer denso | Licencia modificada de MIT | Ecosistema amplio, muy antiguo |

Los datos de SmolLM2-135M, Qwen2.5-0.5B y GPT-2 (124M) proceden de conocimiento general de sus fichas publicas y no forman parte de la informacion suministrada para este modelo; conviene verificarlos antes de citarlos. Frente a ellos, Muse2-125M destaca por su arquitectura hibrida y su tamano, pero carece de benchmarks publicados y de integracion con los runtimes de inferencia mas extendidos, lo que limita la comparacion en terminos de rendimiento real.

## Limitaciones y advertencias

- Sin alineamiento de seguridad: la model card indica explicitamente que no se aplico safety alignment, red-teaming ni filtrado de contenido. Puede producir salidas inexactas, sesgadas, repetitivas u objetables.
- Alucinacion frecuente: el propio autor advierte que el modelo "alucina hechos con facilidad" a esta escala. No es apto para uso donde la fiabilidad factual sea critica.
- Fuera de alcance declarado: despliegue en produccion sin evaluacion y guardrails por parte del desarrollador, y cualquier uso critico en ambitos medico, legal, sanitario o de dependencia factual.
- Solo ingles: no hay capacidades multilingues documentadas. Se menciona tratamiento de codigo y texto matematico, pero sin metricas.
- Contexto: la ventana nominal es de 8k tokens; el maximo de 128k aparece como "max" sin datos de rendimiento ni de degradacion asociada. No hay evaluaciones de contexto largo publicadas.
- Licencia: los pesos estan bajo Apache-2.0, lo que permite uso comercial, pero la model card subraya que las licencias y requisitos de atribucion de los datasets upstream siguen aplicando a los usos derivados.
- Integracion limitada: no funciona con `transformers` de forma directa; requiere el paquete `muse`. No hay pesos cuantizados ni versiones GGUF publicadas, lo que complica el despliegue en llama.cpp u Ollama.
- Inconsistencia en tokens de control: la tabla y el ejemplo del modelo base usan `eos_token_id=7`, mientras que el ejemplo de la variante Instruct usa `eos_token_id=4`. Conviene verificar el valor correcto antes de integrarlo, porque afecta a la detencion de la generacion.
- Fechas discrepantes: la model card indica una fecha de publicacion del 25 de agosto de 2026, mientras que el repositorio de HuggingFace figura como creado y actualizado el 11 de octubre de 2026.
- Autoría: el identificador de HuggingFace es `ArchiveStudio/Muse2-125M`, pero la model card atribuye el desarrollo a Muse Research. El modelo base referenciado es `Muse-research/Muse2-125M-Base`.
- Traccion nula: 0 descargas y 0 likes en el momento de la consulta. No hay validacion independiente de la comunidad ni informes de terceros.
- Falta de transparencia en el entrenamiento: no se publican numero de tokens, composicion del dataset, proceso de filtrado ni detalles del SFT mas alla del enmascaramiento de la perdida.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/ArchiveStudio/Muse2-125M
- Modelo base: https://huggingface.co/Muse-research/Muse2-125M-Base
- Modelo hermano mencionado en la model card: Muse2-230M (referenciado de forma relativa en la ficha original; no se ha podido resolver una URL absoluta con la informacion disponible)
- Paper, blog, repositorio de codigo, demo o documentacion adicional: no disponible en la informacion proporcionada
- Resultados de la busqueda web: no aportan informacion relevante sobre el modelo (unicamente paginas del juego Sudoku), por lo que se descartan como fuentes
