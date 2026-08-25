# Beltran12138/ming-vintage-scratch-30m

## Resumen

`ming-vintage-scratch-30m` es un modelo de lenguaje de 29,74 millones de parámetros entrenado desde cero (from-scratch) sobre un corpus de chino clásico anterior a 1424, dentro de la categoría *vintage LLM*. Lo desarrolla Beltran12138 (Bernard ZHAO) y constituye el brazo de tratamiento de un experimento controlado que busca determinar si un adaptador LoRA puede conferir registro histórico a un modelo moderno o si es necesario entrenar desde cero para fijar el modelo del mundo. El modelo emplea una arquitectura GPT (estilo nanoGPT) con 10 capas, 8 cabezas de atención y una dimensión de embedding de 384, con una ventana de contexto de 256 caracteres.

La relevancia actual del modelo reside en su enfoque metodológico: tokenización a nivel de carácter para preservar la carga semántica independiente de cada carácter del chino clásico, y un diseño experimental que compara su comportamiento con un control LoRA aplicado sobre Qwen2.5-3B-Instruct. El modelo muestra una fuga de lenguaje mínima (0,6 % medido en 160 generaciones) frente a los 35–69 % del modelo base, aunque una auditoría posterior reveló que el corpus no estaba exento de contaminación: el 18,58 % de los documentos incluye una capa editorial del siglo XVIII que el modelo reproduce hasta en un 10 % de los casos.

No está ajustado por instrucciones, por lo que se comporta como un modelo de continuación de texto crudo. Está publicado bajo licencia CC-BY-SA-4.0 y se puede ejecutar en CPU o MPS, sin necesidad de GPU.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT (nanoGPT), 10 capas, 8 cabezas, 384 de dimension de embedding |
| Parametros totales | 29,74 millones |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 256 caracteres |
| Tipos de cuantizacion | No disponible (no se publican pesos cuantizados; se distribuye el checkpoint de entrenamiento) |
| Idiomas soportados | Chino moderno (zh) y chino clásico (lzh) |
| Licencia | CC-BY-SA-4.0 |
| Formato de pesos | No disponible (se distribuye un checkpoint de PyTorch junto con el codigo de muestreo) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only siguiendo la implementacion nanoGPT. La tokenizacion es a nivel de carácter: el vocabulario contiene 31.344 caracteres únicos, una decisión justificada por el autor porque cada carácter del chino clásico porta peso semántico independiente y la tokenizacion subword (BPE) fragmentaría la señal de registro. El entrenamiento se realizó sobre el corpus Kanripo (canon budista, clásicos confucianos y textos históricos) con un corte temporal de 1424 EC, compuesto por 162.849 documentos y 478 millones de caracteres. El conjunto final de entrenamiento fue de 477 millones de tokens y el de validación de 0,95 millones, almacenados como matrices numpy uint16.

El entrenamiento duró unas 6,5 horas en un Mac Mini M4 con 16 GB de memoria unificada. Se usó AdamW (β1=0,9, β2=0,99, weight decay=0,1), una tasa de aprendizaje de 6e-4 con decaimiento coseno hasta 6e-5 en 40.000 pasos y un tamaño de lote de 16 (4.096 tokens por paso). La pérdida final fue de 4,53 en entrenamiento y 4,32 en validación. Una lección técnica destacada: reducir el tamaño de bloque de 384 a 256 fue necesario para evitar el estancamiento en MPS con 16 GB de memoria, ya que la memoria de activación escala cuadráticamente con el tamaño de bloque. El checkpoint de 40.000 pasos se recomienda sobre el de 80.000 porque los pasos adicionales con tasa constante provocaron un sobreajuste hacia la clase mayoritaria (textos budistas, ~70 % del corpus) en detrimento de los registros minoritarios (confuciano, histórico).

## Capacidades

- Generación de texto en chino clásico con registro histórico, capaz de continuar pasajes en estilo budista, confuciano, filosófico, comentarial e histórico.
- Reconstrucción de aperturas canónicas: por ejemplo, ante la semilla "如是我聞" genera la apertura correcta de un sutra budista.
- Argumentación filosófica: la semilla "天下之" produce razonamiento moral coherente en el estilo de los textos de "义理".
- Interpretación de hexagramas del Yijing: la semilla "光之" genera comentarios como "彖辞曰…初九贞吉".
- Baja fuga de lenguaje: 0,6 % de caracteres fuera del corpus en 160 generaciones, frente al 35–69 % del modelo base.
- No soporta tool calling, ni función de llamada, ni agentes, ni capacidades multimodales (visión o audio).
- No está ajustado por instrucciones; su uso es exclusivamente como modelo de continuación.

## Casos de uso

- Investigación filológica y estilométrica: los investigadores pueden generar continuaciones de textos clásicos para estudiar patrones de registro y variación estilística, aprovechando su baja fuga de lenguaje y su fidelidad al registro pre-1424.
- Restauración de manuscritos dañados: el modelo puede completar fragmentos de textos clásicos con lagunas, siempre que el pasaje no supere los 256 caracteres de contexto y se valide el resultado con un experto.
- Generación de datos sintéticos para entrenar modelos de traducción: permite crear pares de chino clásico y chino moderno de forma controlada, aunque con riesgo de errores en registros minoritarios.
- Herramienta educativa para estudiantes de chino clásico: puede generar ejercicios de composición en wenyan y servir de base para comparar con el texto original.
- Estudio de efectos de la contaminación del corpus: el modelo reproduce la capa editorial del siglo XVIII en un 10 % de los casos, lo que permite estudiar cómo las capas de anotación histórica se infiltran en el modelo del mundo.
- Brazo de control en experimentos de transferencia de estilo: al comparar con el modelo LoRA `ming-vintage-qwen3b-lora`, permite aislar la contribución de la adaptación por parámetros completos frente a la adaptación por LoRA en la fijación del registro histórico.
- Generación de contenido para ficción histórica o juegos de rol ambientados en la dinastía Ming: puede producir pasajes narrativos o administrativos en chino clásico, siempre que se supervise la coherencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) para este modelo. La evaluación documentada es una sonda de continuación con seis semillas, comparando el modelo de scratch con el control LoRA:

| Semilla | Registro objetivo | Scratch (30M) | LoRA (3B) |
|---|---|---|---|
| 如是我聞 | Sutra budista | Correcta apertura de sutra | Registro de sutra, pero con bucle de enumeración |
| 子曰 | Analectas confucianas | Falla: diálogo budista (semilla más débil por desequilibrio del corpus) | Marco confuciano, pero con fuga de turco (İnt) |
| 天下之 | Argumentación filosófica | Correcta: «君子觀乎天下之變而後言» | Fuga de árabe y coreano; menciona a Sócrates |
| 問曰 | Diálogo comentarial | Doble registro: Q&A budista + glosa | Fuga de término de programación «CriticalSection» |
| 永樂元年 | Anales históricos | Mejor semilla: registros de calendario/astronomía y gazetero administrativo | Censo de ganado; registro ambiguo |
| 光之 | Comentario al Yijing | Interpretación de hexagrama «彖辞曰…初九贞吉» | Meditación budista; registro incorrecto |

La comparación de tres vías adicional muestra: fuga de lenguaje medida 0,6 % (scratch) frente a 8–21 % (LoRA) y 35–69 % (base); caracteres fuera del corpus 0,0 % frente a 8–17 % y 55–86 %; fluidez de 20–50 caracteres antes del bucle (scratch) frente a 50–100+ (LoRA) y coherente total (base); velocidad de inferencia ~1,5 s en MPS para 30M frente a ~9–10 s para LoRA 3B.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en FP32 para inferencia; no se publican pesos cuantizados.
- GPU recomendada: no se requiere GPU; el modelo se ejecuta en CPU o en MPS (Apple Silicon).
- Hardware de entrenamiento documentado: Mac Mini M4 con 10 núcleos CPU, 10 núcleos GPU y 16 GB de memoria unificada; 6,5 horas de entrenamiento.
- Inferencia: ~1,5 s por generación de 200 tokens en MPS (Mac Mini M4), según el autor.
- Opciones de despliegue: el repositorio incluye `sample.py` que usa PyTorch y numpy; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI. Para despliegue en producción, habría que exportar a un formato servible (p. ej., ONNX o GGUF), lo que no está publicado.

## Comparativa con modelos similares

| Dimension | Scratch 30M | LoRA 3B (sobre Qwen2.5-3B-Instruct) | Base Qwen2.5-3B-Instruct |
|---|---|---|---|
| Registro de chino clásico | Correcto en 6/6 registros | Predominio budista | Mandarín moderno |
| Fuga de lenguaje (medida) | 0,6 % | 8–21 % | 35–69 % |
| Fluidez (longitud de coherencia) | 20–50 caracteres antes de bucle | 50–100+ caracteres | Totalmente coherente |
| Cobertura confuciana | Débil (desequilibrio del corpus) | Presente pero sesgada | Presente |
| Caracteres fuera del corpus | 0,0 % | 8–17 % | 55–86 % |
| Capa editorial del Qing recordada | 10 % (0/144) | 0/144 | 0/144 |
| Velocidad de inferencia | ~1,5 s (MPS, 30M) | ~9–10 s (MLX, 3B+adapter) | ~3–7 s (MLX, 3B) |

No se dispone de comparaciones con otros modelos de chino clásico como GuwenBERT o SikuBERT en la información proporcionada.

## Limitaciones y advertencias

- Fuerte sesgo por el desequilibrio del corpus: el modelo se sobreajusta a los textos budistas (~70 % del corpus) y muestra una cobertura débil en registros confucianos e históricos.
- Contaminación del corpus: el 18,58 % de los documentos incluye una capa editorial del siglo XVIII; el modelo la reproduce en un 10 % de los casos, lo que compromete la pureza temporal del registro.
- El vocabulario no es puramente Han: contiene 47 letras latinas, 3 sílabas hangul, 55 katakana, 10 hiragana, así como griego, cirílico y birmano, resultado de comentarios japoneses, signaturas de biblioteca rusas y transliteración sánscrita IAST en el corpus.
- Fluidez limitada: las generaciones tienden a repetirse tras 20–50 caracteres.
- Contexto muy corto (256 caracteres), insuficiente para tareas que requieran razonamiento de largo alcance.
- No es un modelo de instrucciones; no responde a preguntas directas ni a comandos.
- Riesgo de alucinación en registros minorios: en la semilla «子曰» produce diálogo budista en lugar de contenido confuciano.
- Licencia CC-BY-SA-4.0: permite uso comercial, pero exige atribución y que las obras derivadas se distribuyan bajo la misma licencia; hay que revisar la compatibilidad con el uso previsto.
- No apto para producción sin evaluación adicional: su calidad es experimental y su objetivo principal es la investigación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Beltran12138/ming-vintage-scratch-30m
- Repositorio GitHub: https://github.com/Beltran12138/ming-vintage-scratch-30m
- Código del modelo (model.py): https://github.com/Beltran12138/ming-vintage-scratch-30m/blob/main/model.py
- Perfil del autor en Hugging Face: https://huggingface.co/Beltran12138/models
- Modelo de control LoRA (ming-vintage-qwen3b-lora): https://huggingface.co/Beltran12138/ming-vintage-qwen3b-lora
