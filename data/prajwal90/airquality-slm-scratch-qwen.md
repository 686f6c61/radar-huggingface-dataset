# prajwal90/AirQuality-SLM-Scratch-Qwen

## Resumen

AirQuality MiniQwen es un modelo de lenguaje decoder-only de pequeno tamano entrenado desde cero (pesos inicializados de forma aleatoria) por el autor independiente prajwal90. No es un modelo oficial de la familia Qwen ni contiene pesos preentrenados de Alibaba: toma prestada la arquitectura inspirada en Qwen (RoPE, grouped-query attention, RMSNorm, SwiGLU) y reutiliza el tokenizador publico de Qwen/Qwen3-8B, pero el entrenamiento parte de cero sobre un corpus especifico de calidad del aire.

El modelo se presenta explicitamente como un experimento educativo orientado a la generacion de texto conversacional sobre datos de contaminacion atmosferica. El corpus de entrenamiento deriva del dataset UCI Air Quality, procesado y publicado por el mismo autor como AirQuality-SLM-Processed, con etiquetas de contaminantes generadas de forma relativa al historico y no segun los umbrales oficiales de AQI.

Su relevancia es limitada fuera del ambito didactico: el repositorio ocupa 0,1 GB, no registra descargas ni interacciones, no declara licencia y no es cargable mediante `AutoModelForCausalLM` estandar de Hugging Face, ya que emplea una arquitectura personalizada. Resulta util como referencia de como construir y entrenar un SLM desde cero con un dominio acotado, no como modelo de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con RoPE, grouped-query attention, RMSNorm y SwiGLU |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en `model.pt`, state dict de PyTorch) |
| Idiomas soportados | ingles (en) |
| Licencia | no disponible |
| Formato de pesos | PyTorch state dict (`model.pt`), no safetensors ni GGUF |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de tipo denso con las innovaciones habituales de la familia Qwen: codificacion posicional rotatoria (RoPE), atencion con query grouping (GQA), normalizacion RMSNorm y activacion SwiGLU en la capa feed-forward. El tokenizador es el de Qwen/Qwen3-8B, lo que permite reutilizar su vocabulario aunque los pesos sean completamente nuevos. El modelo no es compatible con la carga estandar de Hugging Face y requiere el script `airquality_slm_model.py` incluido en el repositorio.

El entrenamiento se realizo en modo `full_splits_loaded` durante 4000 pasos de optimizador, con 13.098 filas de entrenamiento, 2.808 de validacion y 2.808 de test procedentes del dataset AirQuality-SLM-Processed, derivado del UCI Air Quality. Las perdidas reportadas son 0,0028 en validacion muestreada, 0,0092 en validacion completa y 0,0082 en test. No se documenta el numero total de tokens, la composicion exacta del dataset, ni si hubo fases de RLHF, DPO o ajuste por instrucciones; tampoco se detalla la innovacion tecnica mas alla del uso de la arquitectura citada.

## Capacidades

- Generacion de texto conversacional en ingles sobre tematica de calidad del aire.
- Respuesta a instrucciones relacionadas con contaminantes atmosfericos, usando etiquetas historicas relativas generadas por el autor.
- Razonamiento basico de dominio acotado, limitado al corpus de entrenamiento.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Multilinguismo limitado al ingles.
- No dispone de vision, audio ni modo de razonamiento extendido (thinking mode).

## Casos de uso

- Docencia sobre entrenamiento de SLM: el repositorio incluye `airquality_slm_model.py`, `inference_example.py`, `metrics.json` y `training_curves.png`, utiles para ilustrar el ciclo completo de definicion de arquitectura, entrenamiento y evaluacion.
- Prototipado de asistentes de dominio acotado: permite experimentar con respuestas conversacionales sobre contaminantes en un entorno controlado y sin coste de inferencia elevado.
- Analisis de curvas de aprendizaje: las curvas de entrenamiento y las perdidas de validacion y test permiten estudiar el sobreajuste en corpus pequenos (13.098 filas).
- Generacion de respuestas de ejemplo para interfaces de consulta de calidad del aire en entornos de demostracion, siempre con validacion humana.
- Investigacion sobre reutilizacion de tokenizadores: sirve para evaluar el efecto de usar el tokenizador de Qwen3-8B con pesos entrenados desde cero.
- Benchmark de referencia para comparar arquitecturas inspiradas en Qwen en tareas de dominio especifico con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Los unicos datos de rendimiento son las perdidas reportadas por el autor:

| Metrica | Valor |
|---|---|
| Perdida de validacion (muestreada) | 0,0028 |
| Perdida de validacion (completa) | 0,0092 |
| Perdida de test | 0,0082 |
| Pasos de optimizador | 4000 |
| Filas de entrenamiento | 13.098 |
| Filas de validacion | 2.808 |
| Filas de test | 2.808 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio completo ocupa 0,1 GB, por lo que el modelo es presumiblemente muy pequeno y cabe en cualquier GPU consumer.
- GPU recomendadas: no disponible; por el tamano del repositorio, una GPU consumer basica (por ejemplo, GTX 1650 o superior) seria suficiente, aunque no se confirma.
- Compatibilidad con GPU consumer: previsiblemente si, dado el tamano del checkpoint, aunque no se documenta.
- Opciones de despliegue: no es compatible con vLLM, llama.cpp, Ollama ni TGI de forma directa; requiere ejecutar `inference_example.py` con el codigo propio del repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| AirQuality MiniQwen | no disponible | no disponible | no disponible | PyTorch state dict | Repositorio educativo, 0 descargas |
| Qwen3-8B (Alibaba) | 8B | no disponible en la informacion | no disponible en la informacion | safetensors (estandar HF) | Modelo oficial, ampliamente distribuido |
| SLM genericos de dominio (referencia) | variable | variable | variable | variable | no disponible |

La comparacion con Qwen3-8B no es equivalente en capacidad: AirQuality MiniQwen solo comparte tokenizador y estilo arquitectonico, no pesos ni escala. No se dispone de informacion sobre otros modelos de calidad del aire comparables.

## Limitaciones y advertencias

- Modelo entrenado desde cero con pesos aleatorios: no contiene conocimiento general del mundo ni capacidades de razonamiento comparables a un LLM preentrenado.
- El autor advierte explicitamente de que un modelo pequeno desde cero puede ser poco fiable y no debe usarse para decisiones sanitarias o de seguridad critica.
- Las etiquetas de contaminantes son generadas de forma relativa al historico y no siguen los umbrales oficiales de AQI, por lo que las respuestas no son validas como indice oficial.
- Sesgos conocidos: no documentados, pero el corpus deriva de un unico dataset (UCI Air Quality) con posible sesgo geografico y temporal.
- Riesgo de alucinacion: alto en consultas fuera del dominio de entrenamiento, dado el limitado corpus (13.098 filas).
- Limitacion idiomatica: solo ingles.
- Licencia no declarada: no se puede asumir uso comercial permitido.
- No es cargable con `AutoModelForCausalLM`; requiere el codigo personalizado del repositorio.
- Sin descargas ni validacion externa: no hay evidencia de uso en produccion ni evaluaciones independientes.

## Enlaces

- [Hugging Face: prajwal90/AirQuality-SLM-Scratch-Qwen](https://huggingface.co/prajwal90/AirQuality-SLM-Scratch-Qwen)
- [Dataset AirQuality-SLM-Processed](https://huggingface.co/datasets/prajwal90/AirQuality-SLM-Processed)
- [UCI Air Quality dataset](https://archive.ics.uci.edu/dataset/360/air+quality)
- [Qwen en Wikipedia](https://en.wikipedia.org/wiki/Qwen)
