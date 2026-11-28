# RMDWLLC/Jah-8.0-MLX-MTP

## Resumen

Jah-8.0-MLX-MTP es un modelo borrador (*drafter*) de decodificación especulativa multi-token, extraído del modelo objetivo RMDWLLC/Jah-8.0-MLX-8bit y su variante de 4 bits. Lo desarrolla RMDWLLC (Georgia) y está empaquetado en formato MLX para ejecutarse en Apple Silicon. Su función no es generar texto de forma autónoma, sino proponer tokens candidatos que el modelo objetivo verifica, acelerando la generación sin alterar la calidad de salida (decodificación especulativa sin pérdida).

El modelo tiene 317.897.872 parámetros (aproximadamente 318 millones) y se distribuye en safetensors de 8 bits, con un tamaño de repositorio de 0,4 GB. Está etiquetado con los identificadores `dflash` y `mtp`, lo que indica que implementa predicción multi-token (*multi-token prediction*) como mecanismo de borrador. El autor reporta una aceleración verificada de 69 a 134,5 tokens por segundo en un Apple M5 Ultra usando el modelo objetivo de 8 bits.

Su relevancia es acotada pero concreta: es una pieza de infraestructura para optimizar la inferencia local en hardware Apple, especialmente en cargas estructuradas como generación de código, JSON y llamadas a herramientas, donde la decodificación especulativa suele ofrecer mayores ganancias. La licencia Apache 2.0 facilita su integración en pipelines propios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo borrador de decodificación especulativa multi-token, formato MLX) |
| Parametros totales | 317.897.872 |
| Parametros activos | no aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits (pesos en safetensors); compatible con objetivos de 8 y 4 bits |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del borrador más allá de su función: es un modelo de predicción multi-token (*MTP*) empleado como *drafter* en un esquema de decodificación especulativa denominado `dflash`. En este esquema, el borrador propone varios tokens candidatos por paso y el modelo objetivo (Jah-8.0-MLX-8bit o 4bit) los valida en paralelo, de modo que la salida final es idéntica a la del modelo objetivo (pérdida cero). El modelo se extrae del propio modelo objetivo, lo que sugiere que comparte vocabulario y tokenizador con él.

No se han publicado en la información disponible datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. Tampoco se detalla si el borrador emplea atención lineal, decodificación especulativa con árbol de candidatos u otras optimizaciones internas. La innovación destacable es el propio mecanismo MTP combinado con `dflash` y la caché de prompt (`APC_ENABLED=1`) en el servidor `mlx_vlm`.

## Capacidades

- Aceleración de decodificación especulativa sin pérdida de calidad respecto al modelo objetivo.
- Predicción multi-token: propone varios tokens candidatos por paso de decodificación.
- Optimizado para generación estructurada: código, JSON y llamadas a herramientas (*tool calling*).
- Integración con el servidor `mlx_vlm.server` mediante los parámetros `--draft-kind dflash` y `--draft-model`.
- Soporte de caché de prompt automática (`APC_ENABLED=1`) en el servidor MLX.
- Diseñado para Apple Silicon (MLX), no para CUDA ni otros backends.
- No es un modelo generativo autónomo: requiere un modelo objetivo compatible.
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma.

## Casos de uso

- Aceleración de asistentes de código en local: usar el borrador junto a Jah-8.0-MLX-8bit en un Mac con Apple Silicon para elevar el throughput de 69 a 134,5 tok/s en generación de código estructurado, reduciendo la latencia percibida en el editor.
- Generación de JSON en producción: en pipelines que producen salidas JSON validadas, la decodificación especulativa con MTP rinde especialmente bien por la previsibilidad del formato, manteniendo exactitud bit a bit respecto al modelo objetivo.
- Agentes con tool calling: al integrarse en el servidor `mlx_vlm.server`, permite servir un agente que emite llamadas a funciones con mayor velocidad sin cambiar el comportamiento del modelo base.
- Desarrollo y pruebas en estaciones de trabajo Apple: equipos con M-series pueden ejecutar el par borrador+objetivo para prototipar aplicaciones de IA sin depender de GPU dedicadas.
- Servicio de inferencia local para equipos pequeños: desplegar el servidor MLX en un Mac Studio o similar para atender peticiones internas de generación estructurada con baja latencia.
- Evaluación de técnicas de decodificación especulativa: sirve como caso práctico para medir ganancias de MTP y `dflash` frente a decodificación autoregresiva estándar en hardware Apple.

## Benchmarks y rendimiento

| Metrica | Valor | Condiciones |
|---|---|---|
| Throughput con borrador | 69 a 134,5 tok/s | Apple M5 Ultra con Jah-8.0-MLX-8bit (dato del autor) |
| Perdida de calidad | 0 (lossless) | Decodificación especulativa verificada por el modelo objetivo |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, ya que el modelo es un borrador y no un generador autónomo.

## Requisitos de hardware

- VRAM/unified memory: el repositorio ocupa 0,4 GB; el borrador en 8 bits requiere aproximadamente 0,4 GB adicionales sobre el modelo objetivo (Jah-8.0-MLX-8bit o 4bit).
- Hardware objetivo: Apple Silicon (M-series). El autor reporta pruebas en Apple M5 Ultra.
- GPU dedicadas (A100, H100, RTX 4090): no aplica; el formato MLX está orientado a Apple Silicon.
- Cabe en equipos consumer Apple: sí, siempre que la memoria unificada aloje también el modelo objetivo.
- Despliegue: `mlx_vlm.server` con `--draft-kind dflash` y `--draft-model RMDWLLC/Jah-8.0-MLX-MTP`; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 69 a 134,5 tok/s según el autor en M5 Ultra con el objetivo de 8 bits.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Funcion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Jah-8.0-MLX-MTP | 317,9 M | no disponible | Borrador especulativo MTP | Apache 2.0 | Hugging Face (MLX) |
| Jah-8.0-MLX-8bit | no disponible | no disponible | Modelo objetivo generativo | no disponible | Hugging Face (MLX) |
| Jah-8.0-MLX-4bit | no disponible | no disponible | Modelo objetivo generativo | no disponible | Hugging Face (MLX) |

No se dispone de información sobre otros borradores especulativos comparables en la documentación proporcionada.

## Limitaciones y advertencias

- No es un modelo autónomo: sin un modelo objetivo compatible (Jah-8.0-MLX-8bit o 4bit) no produce salidas útiles.
- Dependencia de plataforma: formato MLX y etiqueta `apple-silicon`; no funciona en CUDA ni en CPU convencional sin conversión.
- Idioma: solo inglés según la etiqueta `en`; no se garantiza calidad en castellano ni otros idiomas.
- Sesgos: no se documentan sesgos conocidos, pero al derivar del modelo objetivo hereda los suyos, que no se detallan.
- Alucinación: al ser un borrador verificado, no introduce alucinaciones propias; el riesgo recae en el modelo objetivo.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo objetivo, no indicada en la información disponible.
- Madurez: repositorio con 0 descargas y 0 likes, creado y actualizado el mismo día; sin validación comunitaria.
- Documentación escasa: no se detallan contexto, arquitectura interna ni composición de entrenamiento.

## Enlaces

- Hugging Face: https://huggingface.co/RMDWLLC/Jah-8.0-MLX-MTP
- Modelo objetivo 8 bits: https://huggingface.co/RMDWLLC/Jah-8.0-MLX-8bit
- Modelo objetivo 4 bits: https://huggingface.co/RMDWLLC/Jah-8.0-MLX-4bit
- Sitio del autor: https://rmdw.ai
- API del autor: https://rmdw.ai/jah-api
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
