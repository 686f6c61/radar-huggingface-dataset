# OpenSML/Solstice-1

## Resumen

Solstice-1-175M es un modelo de lenguaje conversacional en ingles de 174.202.432 parametros (175M redondeados), desarrollado desde cero por William Zebrowski bajo el sello OpenSML. Se presenta como una vista previa de investigacion y constituye el primer miembro de la familia Solstice. Su interes principal no reside en la escala, sino en el metodo: el entrenamiento completo se ejecuto sobre cinco maquinas Apple Silicon, lo que lo convierte en un caso practico de preentrenamiento de un transformer denso en hardware de consumo profesional.

Arquitectura transformer densa de 44 capas, anchura oculta de 576 y SwiGLU de 1.536, con atencion GQA de 9 cabezas de consulta y 3 de clave/valor, RoPE, RMSNorm, normalizacion Q/K y embeddings atados. El modelo procesa 42.001.367.040 posiciones de token en preentrenamiento y despues pasa por tres etapas de ajuste con adaptadores orientadas a conversacion corta, comprension lectora y seguimiento de instrucciones.

La relevancia actual es doble: por un lado, demuestra que un small language model con licencia Apache-2.0 y pesos FP32 fusionados puede reproducirse en hardware modesto; por otro, su ventana de contexto de solo 2.048 tokens lo situa como una pieza de investigacion y de despliegue local en Apple Silicon, no como sustituto de modelos frontera. La libreria nativa es MLX y el repositorio ocupa 0,7 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (decoder-only) con SwiGLU, RoPE, RMSNorm, GQA y embeddings atados |
| Parametros totales | 174.202.432 (175M redondeados) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 2.048 tokens (incluye historial de conversacion y salida generada) |
| Tipos de cuantizacion | no disponible (el release publica pesos FP32 en safetensors; no se documentan variantes GGUF, INT8 ni INT4) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (FP32 fusionados, merged); runner nativo MLX |
| Capas | 44 |
| Anchura oculta | 576 |
| Anchura SwiGLU | 1.536 |
| Cabezas de atencion | 9 query / 3 KV, dimension de cabeza 64 |
| Tokenizer | BPE byte-level de 32.000 tokens (reutilizado de OpenSML) |
| Tokens de preentrenamiento | 42.001.367.040 posiciones procesadas |
| Tamano del repositorio | 0,7 GB |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only denso de 44 capas con anchura oculta de 576 y capa SwiGLU de 1.536. Emplea atencion con grouped-query attention (9 cabezas de consulta y 3 de clave/valor, dimension 64), RoPE con base 10.000, RMSNorm, normalizacion de Q y K, y embeddings atados entre entrada y salida. El tokenizer es un BPE byte-level de 32.000 tokens heredado de modelos previos de OpenSML, aunque la model card aclara que Solstice-1-175M tiene un linaje de pesos independiente de OpenSML-150M y OpenSML-JSONLite-175M.

El preentrenamiento parte de pesos aleatorios y se ejecuta en cinco workers Apple Silicon con computo BF16, pesos maestros, gradientes y estado del optimizador en FP32. La longitud de secuencia es de 2.048 tokens y el batch acumulado produce 131.072 posiciones de token por actualizacion. Se usa AdamW con betas (0,9; 0,95), weight decay 0,1 y recorte de gradiente a 1. La mezcla de datos en los primeros 36.801B tokens es 70% FineWeb-Edu, 20% DCLM-Edu y 10% English FineWiki; en los 5.200B restantes se reajusta a 56% FineWeb-Edu, 16% DCLM-Edu, 8% FineWiki, 15% Python (espejo publico de Stack-Edu) y 5% SQL. Tras el preentrenamiento se aplican tres etapas de ajuste con adaptadores usando smol-smoltalk, smoltalk, SQuAD v2 y SciQ, entre otros.

## Capacidades

- Generacion de texto conversacional en ingles para turnos cortos.
- Comprension lectora extractiva y de opcion multiple (entrenado con SQuAD v2 y SciQ).
- Seguimiento de instrucciones explicitas, con resultados medidos en IFEval.
- Generacion de codigo Python y SQL, gracias al 20% del tramo final de preentrenamiento dedicado a estos lenguajes.
- Razonamiento basico de conocimiento y sentido comun (ARC Easy, ARC Challenge, PIQA, HellaSwag).
- Respuesta con parada natural en el 99,48% de las respuestas del panel de conversacion evaluado.
- Capacidad multilingue: no disponible; solo se declara ingles.
- Tool calling / function calling: no documentado en la informacion disponible.
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Asistente conversacional local en macOS: el modelo se ejecuta de forma nativa con MLX en Apple Silicon y su huella de 0,7 GB permite tenerlo cargado en memoria unificada mientras se trabaja, gestionando dialogos cortos de hasta 2.048 tokens.
- Prototipado de pipelines de chat antes de escalar a modelos mayores: sirve para validar formatos de prompt, plantillas de conversacion y logica de parada con un coste de inferencia minimo.
- Generacion asistida de consultas SQL: el 5% final del preentrenamiento usa datos de Stack-Edu SQL y SynSQL-2.5M, lo que lo hace util para borradores de consultas en herramientas internas de analitica.
- Autocompletado y generacion de fragmentos Python en entornos de desarrollo: el 15% del tramo final de datos es codigo Python, adecuado para sugerencias cortas dentro de un editor o script de CI.
- Investigacion educativa y de alineacion: al publicar registros de entrenamiento, resultados de evaluacion y el runner MLX, permite reproducir experimentos de ajuste con adaptadores sobre un modelo base pequeno.
- Evaluacion de tecnicas de cuantizacion y despliegue en hardware de consumo: su tamano reducido lo convierte en banco de pruebas para medir latencia y throughput en Mac con memoria unificada.
- Clasificacion y respuesta extractiva sobre documentos cortos: con SQuAD v2 y SciQ en el ajuste, puede responder preguntas concretas sobre pasajes que quepan en su ventana de contexto.

## Benchmarks y rendimiento

Resultados publicados en la model card. Valores en porcentaje; en conocimiento y sentido comun se muestra acc / acc_norm.

| Benchmark | Solstice-1-175M | OpenSML-150M |
|---|---|---|
| ARC Easy | 62,58 / 62,33 | 56,65 / 55,43 |
| ARC Challenge | 29,35 / 30,89 | 26,02 / 29,52 |
| PIQA | 66,49 / 66,21 | 64,53 / 64,09 |
| HellaSwag | 32,85 / 39,40 | 30,55 / 33,94 |

| IFEval (accuracy) | Solstice-1-175M | OpenSML-150M |
|---|---|---|
| Strict prompts | 17,93% | 15,16% |
| Strict instructions | 30,10% | 25,30% |
| Loose prompts | 19,22% | 15,71% |
| Loose instructions | 32,49% | 25,78% |

| Medida de conversacion | Solstice-1-175M |
|---|---|
| Precision de respuesta en casos objetivos | 59,44% |
| Parada natural en todas las respuestas | 99,48% |
| Banderas de repeticion en todas las respuestas | 1,56% |

En el test reservado de autoria propia, Solstice alcanza un 51,9%, frente al 20,0% tras SFT 1 y el 25,9% tras SFT 2. En un panel anterior reutilizado, las puntuaciones son 53,84%, 52,13% y 54,55%, de modo que la ultima etapa no mejora todas las metricas. La evaluacion de IFEval usa generacion greedy, sin mensaje de sistema ni penalizacion por repeticion, con un limite de salida de 1.024 tokens; de 541 prompts, 130 alcanzan el limite y se mantienen en la puntuacion. El modelo de 150M uso un limite de 1.280 tokens y otro formato de chat. Las diferencias no se han sometido a pruebas de significacion estadistica.

## Requisitos de hardware

- Inferencia en FP32: aproximadamente 0,7 GB de pesos, mas estado de inferencia; cabe holgadamente en cualquier Mac con memoria unificada de 8 GB o superior.
- Cuantizacion: no se publican variantes GGUF ni INT8/INT4; el release es FP32 en safetensors.
- GPU recomendadas: no hay datos de despliegue en CUDA. El entorno nativo es Apple Silicon mediante MLX; el entrenamiento se ejecuto en cinco Macs.
- Cabe en GPU de consumo: si, en cualquier Apple Silicon moderno (serie M). Para NVIDIA no se documenta soporte ni requisitos de VRAM.
- Opciones de despliegue: runner MLX incluido en el repositorio y guia de ejecucion (RUN_GUIDE.md). No se documenta soporte para vLLM, TGI, llama.cpp ni Ollama.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Idiomas | Notas |
|---|---|---|---|---|---|
| Solstice-1-175M | 174,2M | 2.048 | Apache-2.0 | en | Entrenado desde cero en Apple Silicon; pesos FP32 y MLX |
| OpenSML-150M | ~150M (no confirmado) | no disponible | no disponible | en | Base de comparacion de la model card; linaje de pesos distinto |
| OpenSML-JSONLite-175M | ~175M (no confirmado) | no disponible | no disponible | en | Comparte tokenizer con Solstice, pero no es su ancestro de pesos |

No se dispone de datos de benchmarks de terceros ni de especificaciones completas de los modelos OpenSML citados mas alla de los resultados recogidos en la tabla de benchmarks de esta ficha.

## Limitaciones y advertencias

- Modelo de investigacion: la propia model card lo etiqueta como research preview; no esta pensado como producto final.
- Ventana de contexto muy corta (2.048 tokens), insuficiente para documentos largos o conversaciones extensas.
- Solo ingles; no se declara soporte multilingue.
- Riesgo elevado de alucinacion y de conocimiento limitado: los resultados en ARC Challenge (29,35 acc) y HellaSwag (32,85 acc) son bajos en terminos absolutos.
- IFEval estricto por prompt del 17,93%, lo que indica un seguimiento de instrucciones fragil.
- Tasa de repeticion del 1,56% en el panel de conversacion, con dos bucles claros detectados en la revision.
- Las comparaciones con OpenSML-150M usan implementaciones y formatos de chat distintos y no se han validado estadisticamente.
- Licencia Apache-2.0: permite uso comercial, pero el modelo no ofrece garantias de calidad para produccion.
- No se documentan capacidades de tool calling, agentes, vision ni audio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OpenSML/Solstice-1
- Pesos del modelo: https://huggingface.co/OpenSML/Solstice-1-175M
- Codigo fuente: https://github.com/williamzebrowskI/Solstice-1-175M
- Guia de ejecucion: RUN_GUIDE.md (en el repositorio)
- Informe tecnico: docs/TECHNICAL_REPORT.md (en el repositorio)
- Evaluacion: docs/EVALUATION.md (en el repositorio)
- Datos: docs/DATA.md (en el repositorio)
- Modelo de comparacion: https://huggingface.co/OpenSML/OpenSML-150M
