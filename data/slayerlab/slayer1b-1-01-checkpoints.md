# SlayerLab/Slayer1B-1.01-checkpoints

## Resumen

Slayer1B-1.01-checkpoints es el repositorio de checkpoints de entrenamiento del modelo Slayer1B 1.01, desarrollado por SlayerLab. No contiene un modelo listo para inferencia, sino los estados completos del entrenador (pesos y estado del optimizador) de la ejecución que produjo la versión 1.01, un modelo de lenguaje de aproximadamente 1.000 millones de parámetros orientado al polaco. Cada fichero `.pt` permite reanudar el entrenamiento exactamente donde se guardó, algo poco habitual en los repositorios publicados en HuggingFace.

La ejecución parte del checkpoint `ckpt_1050.pt` de Slayer1B 1.00, justo antes del decaimiento de la tasa de aprendizaje, y amplía el presupuesto a 2.860 pasos de 1.048.576 tokens cada uno, es decir, 2.998.927.360 tokens en total (aproximadamente 2,8 tokens por parámetro, frente a los 1.430 pasos de la versión 1.00). El repositorio ocupa 115,2 GB y contiene 13 checkpoints (del paso 1200 al 2860, cada 150 pasos) más un directorio `run/` con registros, manifiestos de datos y sumas SHA-256.

Su relevancia es fundamentalmente metodológica: publica la curva de entrenamiento, el entorno de software, las sumas de verificación calculadas en el nodo y un análisis de solapamiento de 13-gramas con los conjuntos de evaluación, lo que lo convierte en material útil para investigación sobre dinámica de entrenamiento y reproducibilidad, más que para despliegue directo en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de tipo GPT (se infiere del nombre del entrenador `train_gpt_ref_r23.py`; la model card no describe la arquitectura en detalle) |
| Parámetros totales | ~1,07 mil millones (denominación "1B"; cifra inferida de la relación declarada de 2,8 tokens por parámetro sobre 2.998.927.360 tokens) |
| Parámetros activos | No aplica (no hay indicios de arquitectura MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible en la model card; los ficheros son checkpoints PyTorch de precisión completa, no hay versiones GGUF/AWQ/GPTQ publicadas en este repositorio |
| Idiomas soportados | Polaco (etiqueta `polish` del repositorio); no se declara una lista formal de idiomas |
| Licencia | Apache-2.0 |
| Formato de pesos | Checkpoints `.pt` serializados con `torch.save` (diccionario con `model`, `opt`, `step`, `config`); el modelo publicado por separado se distribuye en safetensors |

Datos adicionales de la ejecución:

| Parámetro | Valor |
|---|---|
| Pasos totales | 2.860 |
| Tokens por paso | 1.048.576 |
| Tokens totales vistos | 2.998.927.360 (~2,8 tokens/parámetro) |
| Planificación de la tasa de aprendizaje | Constante 6e-4 hasta el paso 2289; decaimiento 1 − sqrt hasta lr/10 en los pasos 2290–2860 |
| Checkpoints incluidos | 13 (pasos 1200, 1350, 1500, 1650, 1800, 1950, 2100, 2250, 2400, 2550, 2700, 2850 y 2860) |
| Punto de reanudación recomendado | `ckpt_2250.pt` (último anterior al decaimiento) |
| Tamaño del repositorio | 115,2 GB (~8,8 GB por checkpoint) |
| Optimizadores | Muon + AdamW |

## Arquitectura y entrenamiento

La model card no documenta la arquitectura interna más allá del nombre del script de entrenamiento (`train_gpt_ref_r23.py`, incluido en el repositorio del modelo 1.00) y de la referencia a un transformer GPT de referencia. No se detallan número de capas, dimensión oculta, cabezas de atención, tipo de normalización, positional encoding ni si emplea atención lineal o decodificación especulativa. Tampoco se especifica la composición del corpus más allá de su origen.

El entrenamiento se divide en dos tramos de datos. Los pasos 1051–1801 reutilizan el mismo flujo "pack-00" que la versión 1.00, con las mismas ventanas; los pasos 1802–2860 emplean el "pack-01" del dataset `SlayerLab/slayer-pl-8x3b`, una porción de web nueva con componentes compartidos disjuntos de los ya utilizados. El repositorio incluye los manifiestos y sumas de ambos flujos (`wsad_v2_*` y `wsad_p01_*`), un fichero `13gram_p01.json` con el solapamiento de 13-gramas del flujo pack-01 respecto a los conjuntos de evaluación (control de contaminación) y `pip_freeze.txt` con el entorno de software. No se menciona en la información disponible ninguna fase de RLHF, DPO o ajuste por instrucciones: se trata de un modelo base.

Como innovación destacable en cuanto a trazabilidad, las sumas SHA-256 se registraron en el nodo de entrenamiento en el momento de escritura de cada checkpoint, antes de la subida, y se verifican tras la descarga. La curva de entrenamiento y las evaluaciones intermedias están publicadas en el tracker de Fabryka (enlace en la sección de enlaces), aunque los valores numéricos no se recogen en la model card.

## Capacidades

- Generación de texto en polaco: es la única capacidad explícitamente respaldada por las etiquetas y por el corpus de entrenamiento (`slayer-pl-8x3b`, orientado al polaco).
- Modelo base sin ajuste por instrucciones: no se documenta un modo de chat, "thinking mode" ni plantilla de diálogo.
- Razonamiento, código, matemáticas y visión: no disponible; no hay evaluación ni declaración al respecto en la información proporcionada.
- Tool calling / function calling: no disponible; no se menciona soporte de herramientas.
- Capacidades de agente o razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles más allá del polaco; no se declara lista de idiomas.
- Reanudación de entrenamiento: capacidad operativa del repositorio, ya que cada checkpoint incluye el estado de Muon y AdamW, el contador de pasos y la configuración.
- Auditoría de contaminación: el fichero `13gram_p01.json` permite analizar el solapamiento entre el flujo de entrenamiento y los conjuntos de evaluación.

## Casos de uso

- Reanudación exacta del preentrenamiento: cargar `ckpt_2250.pt` (último paso antes del decaimiento de la tasa de aprendizaje) con `torch.load(path, map_location="cpu", weights_only=True)` y continuar el entrenamiento con el estado de los optimizadores intacto, sin repetir los 2.250 pasos previos.
- Investigación sobre dinámica de entrenamiento: los 13 checkpoints, separados 150 pasos y abarcando tanto la fase de tasa constante como la de decaimiento, permiten estudiar la evolución de la pérdida, la aparición de capacidades y la geometría de los pesos a lo largo del entrenamiento.
- Estudio comparado de optimizadores: al conservar los estados de Muon y AdamW, el repositorio sirve para analizar el comportamiento de Muon en modelos de ~1B parámetros y comparar sus actualizaciones con las de AdamW en la misma ejecución.
- Auditoría de contaminación de datos: usar `13gram_p01.json` junto con los manifiestos `wsad_p01_*` para cuantificar la filtración entre corpus de entrenamiento y conjuntos de evaluación, y replicar el método en otros proyectos.
- Fine-tuning en polaco: partir de los pesos publicados en `SlayerLab/Slayer1B-1.01` (safetensors) para tareas downstream como clasificación de documentos, resumen o generación asistida en dominios concretos, con un coste de ajuste muy inferior al de modelos de mayor tamaño.
- Despliegue en infraestructura limitada: un modelo de ~1,07B parámetros cuantizado a 8 o 4 bits cabe en GPU de consumo y en CPU, lo que permite ofrecer generación de texto en polaco en entornos on-premise o de borde con requisitos de privacidad estrictos.
- Docencia y reproducibilidad: el paquete completo (argumentos del entrenador, registros `train.log` y `train.out`, `pip_freeze.txt`, sumas SHA-256) constituye un caso de estudio verificable de una ejecución de preentrenamiento a escala de 3.000 millones de tokens.
- Análisis de la relación tokens/parámetro: la comparación entre 1.00 (1.430 pasos) y 1.01 (2.860 pasos) permite estudiar empíricamente el efecto de duplicar el presupuesto de tokens en un modelo de ~1B, manteniendo el mismo esquema de datos y tasa de aprendizaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card remite a la curva de entrenamiento y a las evaluaciones intermedias en el tracker `https://track.fabryka.ai/run/4934429a-d393-42e0-8aac-03eae6b71ff7`, pero no reproduce cifras de MMLU, HumanEval, GSM8K ni de evaluaciones en polaco en el texto del repositorio.

## Requisitos de hardware

- Los checkpoints publicados aquí no son directamente utilizables para inferencia: incluyen el estado del optimizador y ocupan ~8,8 GB cada uno (115,2 GB el repositorio completo). Para inferencia debe usarse el repositorio del modelo en safetensors.
- VRAM estimada para inferencia con los pesos publicados (precisión no declarada): en fp16/bf16, ~2,1 GB solo de pesos, con un consumo realista de 3–4 GB incluyendo caché KV; en int8, ~1,1 GB de pesos; en int4, ~0,55 GB de pesos. Estimaciones calculadas a partir de ~1,07B parámetros, no cifras publicadas por el autor.
- GPU de consumo: cabe con holgura en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080 y RTX 4090 24 GB, incluso sin cuantizar en fp16. También es viable en CPU con cuantización a 4 bits.
- GPU de centro de datos: A100 40/80 GB, H100 y L40S quedan sobredimensionadas para un modelo de este tamaño; su interés estaría en servir muchos lotes concurrentes o en reanudar el entrenamiento (que sí requiere memoria para pesos, gradientes y estados de Muon + AdamW).
- Despliegue: vLLM, TGI, llama.cpp u Ollama son opciones razonables, pero requieren convertir previamente los pesos a safetensors y, en su caso, a GGUF; el repositorio de checkpoints no incluye artefactos listos para estos motores.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

Datos de los modelos comparativos tomados de sus model cards públicas; la comparación de rendimiento no está disponible porque Slayer1B 1.01 no publica resultados de benchmarks.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Rendimiento comparado |
|---|---|---|---|---|---|
| Slayer1B 1.01 | ~1,07B | No disponible | Apache-2.0 | Pesos en safetensors; checkpoints con estado del optimizador | No disponible |
| Llama 3.2 1B | ~1,24B | 128.000 tokens | Licencia comunitaria Llama 3.2 | Pesos abiertos con acceso controlado | No disponible en esta ficha |
| Qwen2.5-1.5B | ~1,54B | 32.768 tokens | Apache-2.0 | Pesos abiertos | No disponible en esta ficha |
| TinyLlama-1.1B | ~1,1B | 2.048 tokens | Apache-2.0 | Pesos abiertos | No disponible en esta ficha |

La diferencia principal frente a estas alternativas no es de rendimiento sino de enfoque: Slayer1B 1.01 está especializado en polaco, se publica sin ajuste por instrucciones y acompaña cada checkpoint con el estado completo del entrenador y documentación de la ejecución, algo que ninguno de los tres comparables ofrece.

## Limitaciones y advertencias

- El repositorio contiene checkpoints de entrenador, no un modelo listo para producción: requieren cargarse con `torch.load(..., weights_only=True)` y extraer la clave `model`, además de convertir los pesos a safetensors o GGUF para los motores de inferencia habituales.
- Descarga de 115,2 GB: el coste de almacenamiento y de ancho de banda es alto para un modelo de ~1B; si solo se necesita inferencia, conviene usar el repositorio del modelo en safetensors.
- Modelo base sin ajuste por instrucciones: no se ha documentado RLHF ni DPO, por lo que no cabe esperar un comportamiento conversacional fiable ni seguimiento de instrucciones sin fine-tuning adicional.
- Cobertura lingüística limitada: el entrenamiento se realizó sobre corpus en polaco; el comportamiento en castellano u otros idiomas no está evaluado y previsiblemente será deficiente.
- Longitud de contexto no documentada: no es posible planificar cargas de trabajo con contexto largo sin determinarla empíricamente.
- Riesgo de alucinación y de reproducción de sesgos del corpus web: al no haber evaluación publicada ni filtrado documentado más allá del análisis de 13-gramas, no se puede acotar el riesgo de generar contenido falso, ofensivo o estereotipado.
- Ausencia de cifras de evaluación en la model card: las evaluaciones existen en el tracker externo, pero no se han transcrito; cualquier afirmación de calidad requiere verificación propia.
- Licencia Apache-2.0: permite uso comercial y modificaciones con atribución y conservación del aviso de licencia; no se especifican restricciones adicionales de uso aceptable en la información disponible.
- Trazabilidad dependiente de infraestructura externa: la curva de entrenamiento y parte de los registros viven en `track.fabryka.ai`, por lo que la reproducibilidad completa depende de la persistencia de ese servicio.
- Fecha de creación del repositorio registrada como 2026-10-23 en los metadatos de HuggingFace; conviene verificar la coherencia temporal si se cita la ficha en un trabajo académico.

## Enlaces

- Repositorio de checkpoints: https://huggingface.co/SlayerLab/Slayer1B-1.01-checkpoints
- Modelo publicado (safetensors y model card): https://huggingface.co/SlayerLab/Slayer1B-1.01
- Modelo predecesor: https://huggingface.co/SlayerLab/Slayer1B-1.00
- Checkpoints del predecesor (origen de `ckpt_1050.pt`): https://huggingface.co/SlayerLab/Slayer1B-1.00-checkpoints
- Dataset de entrenamiento (pack-01): https://huggingface.co/datasets/SlayerLab/slayer-pl-8x3b
- Curva de entrenamiento y evaluaciones intermedias: https://track.fabryka.ai/run/4934429a-d393-42e0-8aac-03eae6b71ff7
