# Savoxism/amid-kd-8xh200-qwen2.5-0.5b-it-csd

## Resumen

`Savoxism/amid-kd-8xh200-qwen2.5-0.5b-it-csd` es un ajuste fino completo del modelo `Qwen/Qwen2.5-0.5B-Instruct` obtenido mediante destilacion de conocimiento desde el modelo profesor `Qwen/Qwen3-4B-Instruct-2507`. Lo publica el usuario Savoxism como punto de control final de la fase `qwen/csd` de la ejecucion de investigacion `amid-kd-8xh200`. El problema que aborda es puramente metodologico: explorar una receta de destilacion (denominada CSD, con umbral adaptativo) sobre respuestas generadas por el profesor a partir del dataset `VoCuc/UltraInteract-Infer`.

Se trata de un transformer decoder-only de la familia Qwen2, con aproximadamente 0,5 mil millones de parametros y ajuste fino completo (no LoRA). El entrenamiento se realizo sobre 8 GPU H200 con DeepSpeed en bf16, 2 epocas y 2.492 pasos, con una longitud maxima de 1.025 tokens y un ratio de destilacion de 1,0.

Su relevancia practica es limitada y el propio autor lo advierte: el modelo se degrado durante el entrenamiento. La perdida de validacion subio de 1,867 a 3,469, la precision en MMLU-STEM (0,2223) queda por debajo del nivel de azar de una pregunta de cuatro opciones (0,25) y las generaciones caen con frecuencia en bucles de repeticion. El autor recomienda explicitamente no usarlo como asistente. Su interes es, por tanto, como artefacto de reproducibilidad y como caso de estudio de fallo en destilacion a baja escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, familia Qwen2 |
| Parametros totales | Aproximadamente 0,5 mil millones (heredados del modelo base) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada; el entrenamiento uso longitud maxima de 1.025 tokens y prompt maximo de 512 |
| Tipos de cuantizacion | No disponible; no se publican pesos GGUF ni cuantizados en el repositorio |
| Idiomas soportados | No disponible (la model card no declara listado de idiomas) |
| Licencia | Apache 2.0 (heredada del modelo base) |
| Formato de pesos | `pytorch_model.bin` (PyTorch, sin safetensors) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un transformer decoder-only de Qwen2 con atencion causal, normalizacion RMSNorm, activacion SwiGLU y sesgo de atencion (QKV bias), en configuracion de aproximadamente 0,5B parametros. Sobre esa base se aplico un ajuste fino completo (todos los parametros, no adaptadores) usando destilacion de conocimiento con el metodo etiquetado como CSD (`--type adaptive-csd`, variantes `ab`/`pr`, con α=0,5 y λ=0,5).

El profesor fue `Qwen/Qwen3-4B-Instruct-2507` en fp16 (revision `cdbee75`) y los datos de entrenamiento son las respuestas generadas por ese profesor sobre `VoCuc/UltraInteract-Infer` (revision `3c2fb0d`), con 79.751 registros de entrenamiento. La configuracion de optimizacion fue: learning rate 1e-4 con decaimiento coseno, sin warmup, weight decay 1e-2, recorte de gradiente 1,0 y `--kd-ratio 1.0`. El batch global fue de 64 (8 GPU x 8 por dispositivo x 1 de acumulacion) sobre 8 x H200 con DeepSpeed en bf16. Se ejecutaron 2 epocas x 1.246 pasos = 2.492 pasos, con semilla 10. La generacion del estudiante uso un umbral adaptativo que arranca en 0,0, `--loss-eps 0.1` y un buffer de replay de 1.000 por rango. Un detalle tecnico relevante: los datos se tokenizaron con el tokenizer y la plantilla de chat del profesor (Qwen3-4B-Instruct-2507), no con los del estudiante.

## Capacidades

- El modelo esta disenado tecnicamente para generacion de texto conversacional, al ser un ajuste del modelo instructivo Qwen2.5-0.5B-Instruct.
- La model card no documenta capacidades funcionales verificadas: no hay evaluacion de tool calling, function calling ni uso agentico.
- No hay evidencia de capacidades de razonamiento multi-paso, matematicas o codigo: los resultados en GSM8K, MATH, GSM-Plus y MBPP estan practicamente en cero.
- No se declaran capacidades de vision, audio ni modo de razonamiento explicito (thinking mode).
- El soporte multilingue no esta documentado en la ficha, aunque el modelo base Qwen2.5 es multilingue; el ajuste puede haber degradado ese comportamiento.
- En la practica, la generacion cae en bucles de repeticion con frecuencia, segun reconoce el propio autor.

## Casos de uso

- Reproducibilidad de experimentos de destilacion: el repositorio permite replicar la receta CSD (umbral adaptativo, α=0,5, λ=0,5, `kd-ratio 1.0`) y comparar el punto de control final con el estudiante sin entrenar. Es util precisamente como referencia de un resultado negativo.
- Estudio de fallos por learning rate: sirve para analizar por que un ajuste fino completo a lr 1e-4 sobre un modelo de 0,5B degrada la perdida de validacion de 1,867 a 3,469. Util en investigacion sobre estabilidad de entrenamiento a baja escala.
- Pruebas de integracion de infraestructura: al pesar aproximadamente 1 GB y cargarse con `transformers`, es adecuado para validar pipelines de vLLM (se uso vLLM 0.17.1 en la evaluacion), TGI o endpoints compatibles, sin consumir recursos relevantes.
- Verificacion de tokenizer y plantilla de chat: dado que el estudiante se entreno con el tokenizer del profesor, el modelo sirve como caso de prueba para detectar desajustes de tokenizacion en pipelines de destilacion.
- Evaluacion comparativa de arneses: permite comprobar el comportamiento de lm-eval 0.4.12 sobre un modelo con rendimiento cercano a cero y validar que las metricas de azar se calculan correctamente.
- Docencia y divulgacion: como ejemplo didactico de que una receta de destilacion bien configurada en papel puede producir un modelo inutilizable si no se evalua una linea base.
- No se recomienda su uso en atencion al cliente, generacion de codigo, analisis de datos ni ninguna aplicacion en produccion.

## Benchmarks y rendimiento

Conjunto de desarrollo, 200 registros (antes de entrenar, fin de epoca 1, fin de epoca 2):

| Metrica | Antes | Epoca 1 | Epoca 2 |
|---|---|---|---|
| avg_loss | 1,867 | 3,719 | 3,469 |
| rougeL | 5,48 | 6,29 | 7,17 |
| exact_match | 0,0 | 0,0 | 0,0 |
| Umbral adaptativo final | - | - | 0,1 |

Evaluacion con lm-eval 0.4.12 sobre vLLM 0.17.1 (valor ± error estandar). GSM8K, GSM-Plus, MATH, MMLU-STEM y SciQ usan plantilla de chat; MBPP no la usa (temperatura 0):

| Tarea | Metrica | Valor |
|---|---|---|
| GSM8K (5-shot, n=1319) | strict-match | 0,0083 ± 0,0025 |
| GSM8K (5-shot, n=1319) | flexible-extract | 0,0174 ± 0,0036 |
| MATH `minerva_math` (4-shot, n=5000) | exact_match | 0,0008 ± 0,0004 |
| MATH `minerva_math` (4-shot, n=5000) | math_verify | 0,0160 ± 0,0018 |
| GSM-Plus (5-shot, n=10552) | strict-match | 0,0028 ± 0,0005 |
| GSM-Plus (5-shot, n=10552) | flexible-extract | 0,0100 ± 0,0010 |
| MMLU-STEM (5-shot, n=3153) | acc | 0,2223 ± 0,0074 |
| SciQ (0-shot, n=1000) | acc | 0,677 ± 0,0148 |
| SciQ (0-shot, n=1000) | acc_norm | 0,590 ± 0,0156 |
| MBPP (3-shot, n=500) | pass@1 | 0,014 ± 0,0053 |

Advertencia del autor: no se evaluo ninguna linea base (ni el estudiante sin entrenar ni el profesor), por lo que estas cifras no demuestran ni ganancia ni perdida por la destilacion. El conjunto de desarrollo (200 registros) procede de los propios datos de entrenamiento, de modo que mide ajuste, no generalizacion. MMLU-STEM (0,2223) queda por debajo del azar de cuatro opciones (0,25).

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1 GB en bf16/fp16 para los pesos, mas la cache KV. El repositorio ocupa 1,0 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM. Se uso 8 x H200 exclusivamente para el entrenamiento, no para inferencia.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo reciente (RTX 3060, RTX 4060, RTX 4090, etc.), e incluso en CPU con memoria suficiente.
- Opciones de despliegue: `transformers` (uso indicado en la model card), vLLM (version 0.17.1 usada en la evaluacion), TGI (el repositorio incluye la etiqueta `text-generation-inference` y `endpoints_compatible`) y, mediante conversion propia, llama.cpp u Ollama. No se publican pesos GGUF en el repositorio.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.
- Precaucion de despliegue: dado que el modelo genera bucles de repeticion, se recomienda fijar limites de `max_new_tokens` y penalizaciones de repeticion si se usa con fines de prueba.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (`amid-kd-8xh200-qwen2.5-0.5b-it-csd`) | ~0,5B | No disponible en la ficha (entrenado a 1.025 tokens) | Degradado: MMLU-STEM 0,2223; GSM8K strict 0,0083 | Apache 2.0 | HuggingFace, 0 descargas, 0 likes |
| `Qwen/Qwen2.5-0.5B-Instruct` (modelo base) | ~0,5B | 32.768 tokens segun la ficha del modelo base | No evaluado en esta ficha; es la referencia frente a la que el autor no comparo | Apache 2.0 | Ampliamente disponible |
| `Qwen/Qwen3-4B-Instruct-2507` (profesor) | ~4B | No disponible en la informacion proporcionada | No evaluado en esta ficha | Apache 2.0 | Ampliamente disponible |
| `Qwen/Qwen3-0.6B` (alternativa de tamano similar) | ~0,6B | 32.768 tokens segun su ficha | No comparable con los datos aqui aportados | Apache 2.0 | Ampliamente disponible |

Nota: los datos de contexto y licencia de los modelos alternativos provienen de sus respectivas fichas publicas y no de la informacion proporcionada en esta ficha. No se dispone de una comparacion de rendimiento homogenea porque el autor no evaluo ninguna linea base.

## Limitaciones y advertencias

- Degradacion confirmada durante el entrenamiento: la perdida de validacion paso de 1,867 a 3,469 entre el inicio y el final de la epoca 2.
- MMLU-STEM en 0,2223, por debajo del azar de cuatro opciones (0,25).
- Generaciones con bucles de repeticion frecuentes, segun el propio autor.
- El autor indica explicitamente: "Do not use it as a capable assistant".
- Causa probable no confirmada: ajuste fino completo a lr 1e-4 sobre un modelo de 0,5B.
- Ausencia de linea base: no se evaluo ni el estudiante sin entrenar ni el profesor, por lo que no puede atribuirse ninguna mejora a la destilacion.
- Semilla unica (10) y punto de control final (paso 2.492, fin de epoca 2), no seleccionado por puntuacion de validacion.
- El conjunto de desarrollo (200 registros) procede de los datos de entrenamiento: mide ajuste, no generalizacion.
- Desajuste de tokenizacion: el estudiante se entreno con datos tokenizados con el tokenizer y la plantilla de chat del profesor (Qwen3-4B-Instruct-2507), no con los suyos.
- Idiomas soportados no documentados; el ajuste puede haber deteriorado el comportamiento multilingue del modelo base.
- Riesgo de alucinacion: no cuantificado en la ficha, pero previsiblemente alto dado el bajo rendimiento en tareas de conocimiento.
- Licencia Apache 2.0, heredada del modelo base, sin restricciones adicionales declaradas para uso comercial. Aun asi, el estado del modelo desaconseja cualquier uso en produccion.
- Repositorio sin adopcion: 0 descargas y 0 likes en el momento de la consulta.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Savoxism/amid-kd-8xh200-qwen2.5-0.5b-it-csd
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Modelo profesor: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Dataset de entrenamiento: https://huggingface.co/datasets/VoCuc/UltraInteract-Infer
- No se han encontrado papers, blogs ni repositorios adicionales en la informacion proporcionada.
