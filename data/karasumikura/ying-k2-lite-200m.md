# Karasumikura/Ying-K2-Lite-200M

## Resumen

Ying-K2-Lite-200M es un modelo de lenguaje en fase de diseno, publicado por Karasumikura (atribuido a Wang Yingze) bajo licencia Apache 2.0. En el momento de redactar esta ficha, el repositorio de HuggingFace es un **placeholder**: no contiene pesos entrenados, ni `config.json`, ni tokenizer, ni codigo de modelado. La model card indica explicitamente que el modelo "no puede usarse para inferencia" y que las especificaciones son planes que pueden cambiar cuando arranque el entrenamiento de K2.

El modelo se plantea como continuacion de la arquitectura propietaria MM200 usada en Ying-K1, con 210,2 millones de parametros, 16 capas y atencion con GQA en proporcion 3:1 (12 cabezas de consulta, 4 de clave/valor). La ventana de contexto de entrenamiento prevista es de 8192 tokens con atencion de ventana deslizante de 1024. Los idiomas declarados son chino (zh) e ingles (en).

Su relevancia actual es limitada como modelo utilizable, pero resulta interesante como documentacion tecnica: la model card incluye un informe detallado de optimizacion de inferencia medido sobre el modelo hermano Ying-K1 (misma arquitectura), con captura de CUDA Graphs, correccion de fugas de memoria en tablas RoPE y eliminacion de sincronizaciones implicitas de GPU. Es material de referencia para quien despliegue modelos pequenos en GPUs de gama baja.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, MM200 (planificada; sin pesos publicados) |
| Parametros totales | 210,2 M (planificado) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8192 tokens de entrenamiento; ventana deslizante de 1024 |
| Tipos de cuantizacion | no disponible (solo se menciona fp16 como precision de referencia) |
| Idiomas soportados | chino (zh), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (la model card menciona `model.safetensors` como entrega futura) |

Otros datos planificados recogidos en la model card: 16 capas, 12 cabezas de consulta y 4 de clave/valor (GQA 3:1), `head_dim` de 64, vocabulario de 16006 tokens, precision de inferencia fp16 con pico de residuos de 177,6 (margen de 370x respecto al maximo de fp16).

## Arquitectura y entrenamiento

La arquitectura prevista es un transformer decoder-only denominado MM200, heredado de Ying-K1. Emplea atencion con query grouping (GQA) con 12 cabezas de consulta y 4 de clave/valor, `head_dim` de 64 y una ventana de atencion deslizante de 1024 tokens dentro de un contexto de entrenamiento de 8192. El vocabulario es de 16006 entradas, coherente con un modelo bilingue zh/en de tamano reducido.

No hay informacion sobre el corpus de entrenamiento, el numero de tokens, la composicion del dataset ni si se aplicaran tecnicas de RLHF, DPO o SFT. La model card lista como tareas pendientes el preentrenamiento, el SFT, la integracion del runtime de inferencia (`mm200_runtime.py`), la reverificacion de velocidad con pesos reales y la publicacion de pesos. La innovacion tecnica documentada no esta en el entrenamiento sino en la optimizacion de inferencia medida sobre Ying-K1: captura de un paso completo de decodificacion en un CUDA Graph (un unico replay por token), cache de tablas RoPE para evitar fugas de memoria de unos 170 MB a 900 tokens, buffers de historial de longitud fija (de O(n²) a O(1)) y eliminacion de dos sincronizaciones implicitas de GPU por token (`nonzero`/`unique`).

## Capacidades

- Generacion de texto autoregresiva (planificada; no verificable sin pesos).
- Razonamiento y conversacion multi-turno: no documentado.
- Generacion de codigo: no documentado.
- Matematicas: no documentado.
- Tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: limitadas a chino e ingles segun los metadatos.
- Capacidades especiales (modo thinking, vision, audio): no documentado.
- Compatibilidad con endpoints de HuggingFace: si, segun el tag `endpoints_compatible`.

## Casos de uso

- **Prototipado de arquitecturas propias**: el repositorio sirve como plantilla de model card y de planificacion de especificaciones para quien disene un transformer decoder-only pequeno con GQA y ventana deslizante; no para ejecutar inferencia.
- **Referencia de optimizacion de inferencia en GPU de gama baja**: el informe de aceleracion sobre Ying-K1 documenta como pasar de 21,6 ms a 7,2 ms por token en una T4 mediante CUDA Graphs; aplicable a cualquier modelo de ~200 M en despliegues con latencia critica.
- **Despliegue en entornos con VRAM muy limitada (futuro)**: con 210,2 M de parametros, un checkpoint en fp16 ocuparia aproximadamente 0,42 GB, lo que permitiria ejecutarlo en GPUs consumer de 4 GB o incluso en CPU, si bien no hay pesos disponibles para confirmarlo.
- **Investigacion sobre atencion de ventana deslizante**: la combinacion de contexto de 8192 y ventana de 1024 permite estudiar el comportamiento de modelos con atencion local en tareas de documentos largos, una vez existan pesos.
- **Evaluacion de tecnicas de reduccion de sincronizaciones en PyTorch**: el codigo y las mediciones descritas (eliminacion de `nonzero`/`unique`, buffers preasignados) son directamente reutilizables en pipelines de inferencia propios.
- **Base para fine-tuning bilingue zh/en de bajo coste**: si se publican los pesos, el tamano y el vocabulario lo hacen candidato para tareas de clasificacion o generacion corta en chino e ingles con recursos minimos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K ni similares) en la informacion disponible. Los unicos datos numericos son mediciones de latencia y throughput de inferencia realizadas sobre Ying-K1 (misma arquitectura, 210,2 M), en una unica T4 y con el mismo checkpoint:

| Metrica | Antes | Despues | Variacion |
|---|---|---|---|
| Latencia de decodificacion por token | 21,6 ms | 7,2 ms | -66,7% (3,00x) |
| Throughput por peticion | 46,3 tok/s | 139,2 tok/s | +200,9% (3,00x) |
| Servicio en linea | ~45 tok/s | ~125 tok/s | 2,8x |
| Respuesta de 256 tokens | 6,62 s | 1,90 s | -71,3% |
| Respuesta de 128 tokens | 3,70 s | 1,88 s | -49,2% |
| Respuesta de 900 tokens | 19,4 s | 6,5 s | -12,9 s por respuesta |
| TTFT en streaming | no disponible | 1,05 s | no disponible |
| Sincronizaciones implicitas por token | 2 | 0 | eliminadas |
| Fuga de memoria en tablas RoPE a 900 tokens | ~170 MB | ~0 | corregida |

La model card justifica la mejora indicando que un modelo de 210,2 M requiere unos 0,42 GFLOP por token (aproximadamente 0,03 ms de computo) y tiene un suelo de ancho de banda de memoria de unos 1,3 ms, frente a los 21,6 ms medidos en modo eager: unas 17 veces de sobrecoste atribuido a unas 170 lanzamientos de kernel y a las sincronizaciones por paso.

## Requisitos de hardware

- **VRAM estimada**: no hay pesos publicados; como referencia teorica, 210,2 M de parametros en fp16 equivalen a unos 0,42 GB de pesos, mas cache KV y activaciones.
- **GPU recomendadas**: la model card cita una NVIDIA T4 como plataforma de las mediciones; por tamano, cualquier GPU con al menos 4 GB de VRAM seria suficiente en fp16.
- **GPU consumer**: previsiblemente si en RTX 3050/4060 y superiores, aunque no verificable sin checkpoint.
- **Opciones de despliegue**: HuggingFace Transformers (libreria declarada); el autor menciona un runtime propio (`mm200_runtime.py`) aun no publicado. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- **Latencia y throughput**: segun las mediciones sobre Ying-K1 en T4, 7,2 ms por token y 139,2 tok/s con CUDA Graphs; 24,3 ms por token en modo eager para prompts que superan la ventana deslizante de 1024.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo, por lo que la comparacion se limita a parametros y licencia. Se incluyen alternativas de tamano comparable con pesos publicados.

| Modelo | Parametros | Contexto | Licencia | Pesos disponibles |
|---|---|---|---|---|
| Ying-K2-Lite-200M | 210,2 M (planificado) | 8192 (ventana 1024) | Apache 2.0 | No (placeholder) |
| Qwen2.5-0.5B | 494 M | 32768 | Apache 2.0 | Si |
| SmolLM2-135M | 135 M | 8192 | Apache 2.0 | Si |
| TinyLlama-1.1B | 1,1 B | 2048 | Apache 2.0 | Si |

## Limitaciones y advertencias

- **No utilizable**: el repositorio es un placeholder sin pesos, sin tokenizer y sin codigo de modelado; no se puede ejecutar inferencia.
- **Especificaciones no definitivas**: el autor advierte que las cifras planificadas pueden cambiar cuando arranque el entrenamiento de K2.
- **Sin evaluacion de calidad**: no existen benchmarks de MMLU, HumanEval, GSM8K ni de sesgos; no es posible estimar su rendimiento real.
- **Cobertura idiomatica limitada**: solo chino e ingles; no se declara soporte de castellano.
- **Riesgo de alucinacion**: inherente a cualquier modelo de lenguaje; sin datos de evaluacion no puede cuantificarse.
- **Licencia**: Apache 2.0 permite uso comercial, pero al no haber pesos la licencia es, por ahora, teorica.
- **Dependencia de un runtime propietario**: el rendimiento documentado depende de `mm200_runtime.py`, aun no publicado, y de tecnicas (CUDA Graphs) ligadas a NVIDIA.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Karasumikura/Ying-K2-Lite-200M
- Documento de aceleracion de inferencia citado en la model card: `INFERENCE_ACCELERATION.md` (en el propio repositorio)
- Sitio del autor: https://yingze.wang
