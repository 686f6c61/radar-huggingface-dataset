# PowerMachine/khtst-multimodal-ptbr

## Resumen

KHTST (antes denominado AURORA) es un modelo multimodal compacto orientado exclusivamente a portugues de Brasil, desarrollado por el usuario PowerMachine y publicado en HuggingFace bajo licencia MIT. Se presenta como la version v9 de un proyecto de investigacion que combina una arquitectura hibrida poco convencional: transformer con atencion de arbol bidireccional, mezcla de expertos (MoE) con enrutado basado en mapas autoorganizados de Kohonen (S-SOM), bloques CNN-BiGRU y micro-unidades recurrentes con buffers anulares. El modelo declara 14,89 millones de parametros, un vocabulario BPE de 16.384 tokens y una ventana de contexto de 256K tokens mediante un esquema de "compresion indexada" descrito en documentacion interna.

El problema que aborda es el de un modelo pequeno y de bajos requisitos capaz de cubrir nueve tareas en portugues (modelado de lenguaje, noticias, puntuacion, instrucciones, TTS, VQA, OCR, captioning de imagen y ASR) con encoders adicionales de imagen, audio y video. Su relevancia es fundamentalmente de investigacion: propone mecanismos de autorregulacion del learning rate (controlador CIAR con ganancia κ ∈ [0,5; 1,5]), gates de fase con rollback automatico cuando una etapa de entrenamiento degrada la perplexity mas de un 8 %, y un protocolo de serializacion de "estado integral" (modelo + enrutador + orquestador) con sonda de fidelidad que reporta una diferencia maxima de logits de 0,0.

Los resultados publicados son autoinformados por el autor y no han sido verificados por terceros. La model card reporta perplexity de lenguaje de 2,76 frente a 17,09 del baseline AURORA, con un entrenamiento de 3,24 horas de reloj y un pico de RAM de 3.262 MB, lo que sitúa al modelo en la categoria de entrenamiento e inferencia en CPU o GPU de gama muy baja. El repositorio ocupa 0,1 GB y a fecha de la consulta acumula 0 descargas y 0 likes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida: transformer con atencion de arbol bidireccional, MoE (2 encoders + 4 decoders segun la model card) con enrutador S-SOM de Kohonen, CNN-BiGRU, micro-unidades recurrentes, multi-token prediction tipo Medusa y decodificacion especulativa |
| Parametros totales | 14,89 M |
| Parametros activos | no disponible |
| Longitud de contexto | 256K tokens (compresion indexada, doc 13); parametros de ventana raio_janela y kv_max ampliados a 128/2048 en la v8 |
| Tipos de cuantizacion | Cuantizacion selectiva de 8 bits (int8) via torchao y bitsandbytes; se menciona QAT (quantization-aware training) entre las etiquetas del repositorio. No se detallan variantes GGUF, GPTQ ni AWQ |
| Idiomas soportados | Portugues (pt / pt-BR) |
| Licencia | MIT |
| Formato de pesos | no disponible. La model card describe checkpoints propios en `estados/fase-v9/` con SHA-256, sin especificar safetensors ni GGUF |
| Vocabulario | BPE de 16.384 tokens |
| Tareas declaradas | 9: lm, noticia, pontuacao, instrucao, tts, vqa, ocr, imagem_caption, asr |
| Modalidades de entrada | Texto, imagen, audio y video (encoders dedicados) |
| Tamano del repositorio | 0,1 GB |
| Fecha de publicacion | 18 de septiembre de 2026 (ultima actualizacion: 20 de septiembre de 2026) |

## Arquitectura y entrenamiento

La arquitectura no es un transformer denso estandar. La model card describe una combinacion de atencion de arbol bidireccional "fuera de orden", mezcla de expertos con enrutado por mapas autoorganizados (S-SOM), modulos CNN-BiGRU para percepcion, micro-unidades recurrentes con buffers anulares de cero asignacion por paso en decodificacion, y tecnicas de token merging y LRA-QViT para el tratamiento de imagen. La v8 introdujo ademas mejoras anti-vanishing (Leaky ReLU adaptativa, pesos de arbol bidireccionales, skip neutro y BatchNorm) y un map-reduce con `torch.vmap`/`sum`/`mean` en los expertos MoE que, segun el autor, produce una diferencia de 0,0 respecto a la ejecucion secuencial. Se mencionan decodificacion especulativa y prediccion multi-token tipo Medusa, aunque no se aportan medidas de speedup.

El entrenamiento de la corrida v9 se realizo sobre un corpus de 3.548 registros reales en PT-BR procedentes de 18 fuentes de HuggingFace, con el mismo tokenizador BPE de 16k y las mismas semillas que el baseline. Se ejecutaron 3.192 pasos (8 epocas, mas 93 pasos de DPO y una fase de consolidacion SOM), con 3,24 horas de tiempo de reloj, un pico de RAM de 3.262 MB y un minimo de 547 MB sobre 5.245 muestras. El pipeline incorpora DPO (no RLHF) y un controlador PI de autorregulacion del learning rate con fuga (CIAR). Dos fases fueron revertidas automaticamente por los gates de calidad: el DPO hizo regresar la perplexity de 3,28 a 10,45 y la consolidacion SOM de 2,44 a 2,74 (por encima de la tolerancia del 8 %), de modo que el estado publicado corresponde al snapshot previo a ambas fases. La sonda de fidelidad sobre el estado re-serializado reporta max|Δ logits| = 0.

## Capacidades

- Generacion de texto y modelado de lenguaje en portugues de Brasil, con perplexity reportada de 2,76 sobre el corpus de evaluacion interno.
- Generacion de noticias y texto periodistico (tarea `noticia`, perdida 0,835).
- Seguimiento de instrucciones (tarea `instrucao`, perdida 0,683).
- Restauracion de puntuacion (tarea `pontuacao`, perdida 0,923), una tarea clasica de NLP para portugues.
- Descripcion automatica de imagenes en portugues (tarea `imagem_caption`, perdida 0,604; se declara metrica CIDEr, sin valor publicado).
- Respuesta visual a preguntas (VQA, perdida 0,739).
- OCR sobre documentos en portugues (perdida 0,333, la mas baja de todas las tareas).
- Reconocimiento de voz (ASR, perdida 0,430) y sintesis de voz (TTS, perdida 0,408), ambas declaradas como tareas del modelo.
- Modalidad de generacion de imagen mediante difusion, ejecutada en "modo REAL" durante la evaluacion (genero pixeles con prompt enriquecido), sin metricas publicadas.
- Capacidad de agente: la etiqueta `engineer-agent` y el canal adhoc I/O permiten procesamiento serial de peticiones con soporte de stop/cancelacion y pause→continue. El test item (b) verifica que se reciben 4 peticiones antes de emitir la primera respuesta y que estas se procesan de forma serial.
- Autorregulacion del entrenamiento (CIAR) y gates de fase con rollback, presentados mas como capacidad del pipeline que del modelo desplegado.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al portugues; no se declara soporte de otros idiomas.

## Casos de uso

- Correccion y restauracion de puntuacion en corpus portugueses: es la tarea con segunda perdida mas baja del modelo (0,923) y el caso de uso mas realista para un modelo de 14,89M, aplicable a preprocesado de transcripciones ASR o a normalizacion de texto de usuarios.
- OCR de documentos en portugues: la perdida de 0,333 es la mas baja del modelo, lo que sugiere un ajuste relativamente bueno para digitalizacion de facturas, formularios o documentos escaneados en pt-BR en entornos con recursos limitados.
- Clasificacion y etiquetado ligero de texto en pt-BR: con 14,89M de parametros, el modelo puede desplegarse en CPU para tareas de moderacion, enrutado o analisis de sentimiento, y el controlador CIAR y el pipeline de cuantizacion int8 documentados facilitan el ajuste fino en hardware modesto.
- Descripcion de imagenes en portugues en dispositivos de borde: la tarea `imagem_caption` (perdida 0,604) y los encoders de imagen permiten prototipos de accesibilidad (lectura de escenas para personas con discapacidad visual) ejecutables en hardware sin GPU dedicada.
- Investigacion en arquitecturas eficientes: el modelo es una plataforma de experimentacion para enrutado S-SOM, atencion de arbol bidireccional, buffers anulares sin asignacion, token merging y decodificacion especulativa sobre un presupuesto de computo de horas y RAM muy reducido.
- Agente conversacional con control de flujo: el canal adhoc soporta recibir multiples peticiones antes de responder, respetar cancelaciones y reanudar tras una pausa, lo que sirve como banco de pruebas para logica de orquestacion de agentes en portugues.
- VQA en portugues para aplicaciones educativas o de asistencia: con la perdida de 0,739 en VQA, es viable como prototipo de respuesta a preguntas sobre imagenes (etiquetado de productos, apoyo a catalogos) siempre que no se exija precision de nivel de produccion.

## Benchmarks y rendimiento

La model card no publica resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, BLEU, CIDEr, METEOR, ROUGE-L ni CLIP score) pese a declararlos como metricas del repositorio. Los unicos numeros disponibles son perplexity de lenguaje y perdidas por tarea, comparadas contra el propio baseline AURORA bajo protocolo identico (3.548 registros PT-BR, mismas semillas, mismo tokenizador BPE de 16k).

| Metrica | AURORA (baseline) | KHTST v9 | Variacion |
|---|---|---|---|
| Perplexity de lenguaje (ppl_lm) | 17,09 | 2,76 | −83,9 % |
| Perdida lm | 2,838 | 1,015 | −64,2 % |
| Perdida noticia | 2,554 | 0,835 | −67,3 % |
| Perdida instrucao | 2,036 | 0,683 | −66,4 % |
| Perdida pontuacao | 2,648 | 0,923 | −65,1 % |
| Perdida imagem_caption | 2,127 | 0,604 | −71,6 % |
| Perdida vqa | 2,177 | 0,739 | −66,1 % |
| Perdida ocr | 1,418 | 0,333 | −76,5 % |
| Perdida asr | 2,122 | 0,430 | −79,7 % |
| Perdida tts | 1,675 | 0,408 | −75,6 % |
| Tiempo de entrenamiento | 3,98 h (ultimo registrado) | 3,24 h | −18,5 % |
| RAM pico | 3.580 MB | 3.262 MB | −8,9 % |
| Tests post-entrenamiento | 48 correctos / 0 fallos | 48 + 44 + 21 correctos / 0 fallos | — |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. Las cifras anteriores son autoinformadas por el autor y no han sido replicadas de forma independiente.

## Requisitos de hardware

- VRAM estimada para inferencia (calculo aritmetico a partir de 14,89M de parametros, no dato publicado): aproximadamente 60 MB en fp32, 30 MB en fp16/bf16 y 15 MB en int8 solo para los pesos. A ello hay que sumar activaciones, cache KV y los encoders de imagen, audio y video.
- GPU recomendadas: el modelo es lo bastante pequeno para cualquier GPU moderna, incluidas GTX 1650, RTX 3060, RTX 4090 o GPUs integradas. No se justifica el uso de A100 o H100 salvo por paralelismo de evaluacion.
- Cabe en GPU de consumo: si, con margen amplio, y tambien en CPU. La propia model card documenta un entrenamiento con pico de RAM de 3.262 MB, lo que indica ejecucion en memoria de sistema.
- Opciones de despliegue: la informacion disponible menciona un servicio propio (`servico/adhoc.py`) y cuantizacion via torchao y bitsandbytes, pero no documenta integracion con vLLM, llama.cpp, Ollama, TGI ni SGLang. No disponible para stacks de serving estandar.
- Latencia y throughput estimados: no disponible. No se publican mediciones de tokens por segundo ni de latencia por peticion, pese a que se mencionan decodificacion especulativa y Medusa como tecnicas implementadas.

## Comparativa con modelos similares

No hay modelos comparables en la informacion proporcionada: la model card solo se compara con su propio baseline AURORA. La busqueda web realizada no devolvio resultados relevantes (unicamente contenido no relacionado). La tabla siguiente usa conocimiento general publico sobre modelos pequenos de proposito general y debe verificarse antes de tomar decisiones; no procede de la informacion facilitada.

| Modelo | Parametros | Contexto | Multimodal | Licencia | Observaciones |
|---|---|---|---|---|---|
| KHTST v9 (PowerMachine) | 14,89 M | 256K declarados | Si (imagen, audio, video) | MIT | Solo pt-BR; resultados autoinformados; 0 descargas |
| Qwen2.5-0.5B | ~0,49 B | 32K (extensible) | No | Apache 2.0 | Multilingue; benchmarks publicos; ampliamente desplegado |
| TinyLlama-1.1B | ~1,1 B | 2K | No | Apache 2.0 | Multilingue; ecosistema llama.cpp y Ollama |
| SmolLM2-360M | ~362 M | 8K | No | Apache 2.0 | Entrenado con billones de tokens; benchmarks publicos |

La comparacion de rendimiento directo no es posible: KHTST publica perplexity sobre un corpus interno de 3.548 registros, mientras que los modelos anteriores publican evaluaciones sobre benchmarks estandar como MMLU o HellaSwag.

## Limitaciones y advertencias

- Corpus de entrenamiento muy reducido: 3.548 registros. Las perdidas bajas por tarea pueden reflejar sobreajuste al conjunto evaluado mas que capacidad real de generalizacion, especialmente con 8 epocas sobre tan pocos datos.
- Resultados autoinformados y no replicados: perplexity, perdidas y tiempos provienen del propio autor. No hay evaluacion independiente ni benchmarks publicos.
- Modelo practicamente sin adopcion: 0 descargas y 0 likes en el momento de la consulta, con repositorio de 0,1 GB que probablemente no contiene todos los artefactos descritos.
- Idiomas: exclusivamente portugues de Brasil. No se declara ni se evalua el comportamiento en castellano ni en otros idiomas.
- Dos fases del entrenamiento (DPO y consolidacion SOM) fueron revertidas por degradacion de perplexity, lo que indica que el pipeline completo no mejoro al modelo base; el estado publicado omite esas etapas.
- Riesgo de alucinacion alto: con 14,89M de parametros y un vocabulario de 16k, la cobertura factual y el razonamiento complejo son muy limitados. No es un modelo apto para generacion factual sin supervision.
- La ventana de 256K tokens se declara mediante "compresion indexada" sobre la que solo existe documentacion interna del autor; no hay evaluacion publica de recuperacion en contexto largo (por ejemplo, needle-in-a-haystack).
- Las capacidades multimodales (captioning, VQA, OCR, ASR, TTS, difusion de imagen) no vienen acompanadas de puntuaciones BLEU, CIDEr, METEOR, ROUGE-L o CLIP score, pese a figurar entre las metricas declaradas del repositorio.
- Las afirmaciones formales (teoremas 19.x y 20.x, sonda de fidelidad con max|Δ logits| = 0) no han sido verificadas por pares y se sustentan en documentacion interna del propio repositorio.
- Licencia MIT: permite uso comercial, modificacion y redistribucion sin obligacion de publicar mejoras. No hay restricciones de uso adicionales declaradas, pero tampoco garantias de idoneidad.
- No hay pipeline declarado en HuggingFace ni integracion con bibliotecas de inferencia estandar, lo que complica su adopcion en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/PowerMachine/khtst-multimodal-ptbr
- La busqueda web realizada no devolvio ningun enlace relevante sobre el modelo: los resultados obtenidos eran contenido no relacionado con el proyecto.
- No se han encontrado en la informacion disponible enlaces a paper, repositorio de codigo publico, blog tecnico, demo o espacio de HuggingFace asociados al modelo.
