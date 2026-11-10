# Shokou1/qwen3.5-poetry-4b-v2

## Resumen

Qwen3.5-Poetry-4B-v2 es un ajuste fino mediante LoRA sobre el modelo base Qwen/Qwen3.5-4B, desarrollado por el usuario Shokou1 (ShokouP) y publicado en Hugging Face. Su objetivo es especializar un modelo de lenguaje pequeno de 4.000 millones de parametros en la composicion de poesia clasica china (wuyan jueju, qiyan jueju, wuyan lushi, qiyan lushi), ci (poesia con metrica de la dinastia Song), prosa clasica de estilo Ming-Qing y fu de tradicion saoti. El modelo resuelve el problema de que los LLM generalistas producen poemas clasicos formalmente incorrectos o que incurren en plagio de obras conocidas.

La relevancia del modelo reside en su enfoque "data-centric": se entrena sobre 309.000 poemas reales (Tang y Song), 24.000 pares de comentarios poeticos (shihua) autenticos y prosa clasica generada por cinco modelos docentes. El autor documenta una metodologia de evaluacion con tres componentes: cumplimiento de formato (numero y longitud de versos), concordancia de rima mediante 9 grupos de rimas extraidos de 139.408 poemas (con una consistencia del 86,5 % en poesia real) y huellas de plagio de 17,09 millones de 8-gramas. Todo el entrenamiento se realizo en una GPU de portatil RTX 5090 de 24 GB bajo Windows nativo en aproximadamente 5 horas.

El modelo se distribuye como adaptador PEFT (LoRA con r=64, alpha=128, all-linear) en formato safetensors, con variantes GGUF y Ollama (Q4_K_M de 2,58 GB) para despliegue en hardware de consumo. La licencia es Apache-2.0, heredada del modelo base. La longitud de contexto no se especifica en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen3.5-4B) con adaptador LoRA (r=64, alpha=128, all-linear) |
| Parametros totales | 4.000 millones (modelo base); el adaptador LoRA se almacena por separado |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | bf16 (recomendado), GGUF Q4_K_M (2,58 GB); el autor advierte perdida de calidad en Q4 |
| Idiomas soportados | Chino (zh), en registro chino clasico |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT, almacenado en fragmentos `parts/adapter_model.safetensors.part***` que deben fusionarse con `merge_chunks.py`); GGUF para Ollama |
| Tamano del repositorio | 0,5 GB |
| Metodo de entrenamiento | CPT (continued pretraining) + SFT con LoRA |
| Hardware de entrenamiento | RTX 5090 Laptop 24 GB, Windows nativo, ~5 horas |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-4B, un transformer decoder-only de 4.000 millones de parametros bajo licencia Apache-2.0. Sobre el se aplica un adaptador LoRA con rango 64, alpha 128 y aplicado a todas las capas lineales, entrenado en bf16. El proceso consta de dos fases: un continued pretraining (CPT) con secuencias de 2048 tokens y packing, 300 pasos y tasa de aprendizaje 1e-4, que reduce la perdida de 3,57 a 2,36; y un SFT con secuencias de 1024 tokens, padding de longitud fija para evitar fragmentacion de memoria, 600 pasos y tasa de aprendizaje 5e-5. El autor senala que evito QLoRA por ser 36 veces mas lento en su entorno (42 frente a 1500 tok/s).

Los datos de entrenamiento combinan 309.000 poemas reales de las dinastias Tang y Song, estructurados como pares de "etiqueta de estilo + titulo + requisito de generacion → poema original", con division del conjunto de validacion por hash de autor para prevenir la memorizacion. Se anaden 24.000 pares de comentarios poeticos reales y prosa clasica generada por cinco modelos docentes (enfoque multi-teacher). La innovacion tecnica destacable es el sistema de evaluacion automatica en tres componentes: verificacion de formato, concordancia de rima sobre 9 grupos extraidos de 139.408 poemas y deteccion de plagio mediante 1.709 millones de huellas de 8-gramas.

## Capacidades

- Generacion de poesia clasica china en formatos de cinco y siete caracteres: jueju (cuatro versos) y lushi (ocho versos).
- Composicion de ci (poesia con metrica de la dinastia Song).
- Redaccion de prosa clasica de estilo Ming-Qing (guwen).
- Composicion de fu de tradicion saoti.
- Control de estilo por autor (por ejemplo, estilos de Lu You, Du Fu, Wang Wei, Gui Youguang).
- Control de rima mediante 9 grupos de rimas derivados de poesia real.
- Cumplimiento de formato: numero de versos y longitud de cada verso.
- Tareas de expansion de texto clasico (documentadas con 1.101 caracteres y 0 parrafos repetidos).
- Generacion con decodificacion por muestreo (temperatura 0,95, top_p 0,95, repetition_penalty 1,08) y soporte de Best-of-N.
- Plantilla de chat con opcion `enable_thinking=False` para desactivar el modo de razonamiento del modelo base.
- Capacidades multilingues: limitadas al chino clasico; no se documenta soporte de otros idiomas.

## Casos de uso

- Generacion de poesia para publicacion o divulgacion: el modelo produce jueju y lushi formalmente validos en cuanto a numero y longitud de versos y rima, lo que permite generar borradores listos para revision editorial en contextos de contenido cultural.
- Creacion de contenido educativo sobre poesia clasica: se puede solicitar la composicion de un poema en el estilo de un autor concreto (por ejemplo, Wang Wei en registro de paisaje) para ilustrar caracteristicas estilisticas en materiales didacticos.
- Expansion y continuacion de textos clasicos: el modelo esta documentado en tareas de expansion con salidas de mas de 1.000 caracteres sin repeticion de parrafos, util para generar variaciones de prosa guwen a partir de un fragmento semilla.
- Generacion de ci y fu para proyectos creativos: permite cubrir formatos menos frecuentes (ci de la dinastia Song, fu saoti) que los modelos generalistas suelen tratar de forma deficiente.
- Despliegue local en hardware de consumo: con la variante GGUF Q4_K_M de 2,58 GB y la integracion en Ollama (`poetry-4b-v2`), es viable ejecutarlo en portatiles y equipos sin GPU dedicada de gama alta, para experimentacion o demostraciones.
- Filtrado y evaluacion de candidatos generados: combinado con el sistema de huellas de 8-gramas y Best-of-N, sirve para seleccionar entre varias generaciones la que no incurre en plagio y cumple la rima, en pipelines de generacion supervisada.
- Investigacion sobre modelos pequenos en dominios de bajos recursos: el modelo y sus scripts (GitHub del autor) sirven como referencia reproducible de un pipeline CPT + SFT con LoRA en una sola GPU de 24 GB.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente; `verified: false` en el model-index). Evaluacion con 2 muestras por genero en bf16:

| Metrica | Valor |
|---|---|
| Concordancia de rima en lushi de 7 caracteres | 100 |
| Cumplimiento de formato en lushi de 7 caracteres (numero de versos) | 100 |

Evaluacion por genero (2 muestras por genero, bf16):

| Genero | Cumplimiento de numero de versos | Cumplimiento de longitud de verso | Rima |
|---|---|---|---|
| Wuyan jueju (5 caracteres, 4 versos) | 0/2 | 2/2 | 2/2 |
| Qiyan jueju (7 caracteres, 4 versos) | 0/2 | 1/2 | 2/2 |
| Wuyan lushi (5 caracteres, 8 versos) | 1/2 | 1/2 | 1/2 |
| Qiyan lushi (7 caracteres, 8 versos) | 2/2 | 2/2 | 2/2 |

Datos adicionales aportados por el autor: repeticion de 8-gramas frente al corpus de 313.000 poemas inferior o igual a 0,01 (sin memorizacion); tarea de expansion con 1.101 caracteres y 0 parrafos repetidos. La evaluacion se realizo sobre un conjunto pequeno (2 muestras por genero), por lo que la significacion estadistica es limitada.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 8-9 GB para el modelo base de 4.000 millones de parametros mas el adaptador LoRA; requiere fusionar previamente los fragmentos del adaptador.
- VRAM estimada en Q4_K_M: aproximadamente 3-4 GB en ejecucion (el archivo GGUF ocupa 2,58 GB).
- GPU recomendadas: RTX 5090 Laptop 24 GB (hardware usado en el entrenamiento), RTX 4090, A100, H100 para bf16; cualquier GPU con 8 GB o mas para bf16 en inferencia; GPUs de 4-6 GB para la variante Q4.
- Cabe en GPU de consumo: si, tanto en bf16 (gama RTX 3080/4080/4090 y superiores) como en Q4 (gama media y equipos con poca VRAM).
- Opciones de despliegue: transformers + peft (documentado en la model card), Ollama (`poetry-4b-v2`, Q4_K_M), GGUF mediante llama.cpp; no se documenta soporte explicito de vLLM o TGI.
- Latencia y throughput: no disponibles de forma oficial; el autor menciona 1500 tok/s en entrenamiento con bf16 LoRA en RTX 5090 Laptop, dato no trasladable a inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-Poetry-4B-v2 | 4.000 M (base) + LoRA | No disponible | Poesia y prosa clasica china | Apache-2.0 | Hugging Face, Ollama, GGUF |
| Qwen3.5-Poetry-9B-v7 (mismo autor) | 9.000 M (base) | No disponible | Poesia clasica china (4 versos + rima 4/4) | No disponible en la informacion | Hugging Face |
| Qwen3.5-Poetry-9B-v1 (mismo autor) | 9.000 M (base) | No disponible | Poesia clasica china | No disponible en la informacion | Hugging Face |
| Qwen/Qwen3.5-4B (modelo base) | 4.000 M | No disponible | Proposito general, multilingue | Apache-2.0 | Hugging Face |

No se dispone de datos de benchmarks comparativos con modelos de otros autores en la informacion proporcionada.

## Limitaciones y advertencias

- Metrica de rima simplificada: solo se validan numero de versos, longitud de verso y rima mediante 9 grupos; no se verifica el patron tonal (pingze), por lo que los poemas pueden ser formalmente incompletos segun la metrica clasica estricta.
- Perdida de calidad en cuantizacion Q4: la rima baja de 1-2/2 en bf16 a 0-1/2 en Q4; para aplicaciones sensibles a la rima se recomienda bf16 o Best-of-N.
- Riesgo de memorizacion con pocos pasos de entrenamiento: el autor documenta que el modelo 9B, con 200 pasos, reprodujo literalmente el poema "Qiu Xi" de Du Mu; se recomienda Best-of-N combinado con el filtro de huellas de 8-gramas.
- Evaluacion con muestra muy pequena: 2 muestras por genero y evaluacion humana limitada a un conjunto seleccionado; los resultados no son estadisticamente robustos.
- Resultados no verificados de forma independiente: las metricas del model-index figuran como `verified: false`.
- Idioma: soporte limitado al chino clasico; no se documenta calidad en chino moderno ni en otros idiomas.
- Pesos del adaptador fragmentados: es necesario ejecutar `merge_chunks.py` antes de cargar el adaptador.
- Licencia Apache-2.0: permite uso comercial, pero se heredan las condiciones y avisos del modelo base Qwen3.5-4B; conviene revisar la licencia del base.
- Sesgos: no se documentan sesgos especificos, pero el corpus se limita a poesia Tang-Song y prosa Ming-Qing, con posible sobrerrepresentacion de autores canonicos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Shokou1/qwen3.5-poetry-4b-v2
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset de SFT: https://huggingface.co/datasets/Shokou1/classical-poetry-sft
- Repositorio GitHub (codigo, scripts y reporte): https://github.com/ShokouP/classical-poetry-lm
- Borrador de paper (PDF): https://github.com/ShokouP/classical-poetry-lm/blob/main/reports/paper-draft.pdf
- Modelo hermano 9B v1: https://huggingface.co/Shokou1/qwen3.5-poetry-9b-v1
- Modelo hermano 9B v7: https://huggingface.co/Shokou1/qwen3.5-poetry-9b-v7
