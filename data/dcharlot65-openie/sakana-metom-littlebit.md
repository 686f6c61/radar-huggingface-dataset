# dcharlot65-openie/Sakana-Metom-LittleBit

## Resumen

Sakana-Metom-LittleBit es un checkpoint de pesos "vivos" (living weights) pre-factorizado que combina la técnica LittleBit-2 con Sakana SVF, adaptado a partir del modelo SakanaAI/Metom. Lo publica el usuario dcharlot65-openie y está diseñado específicamente para JouleDB, una base de datos termodinámica con sustrato Kubernetes-native (JouleKube) y un runtime de inferencia sin PyTorch. No es un modelo entrenado desde cero ni un fine-tune convencional: es una representación comprimida y factorizada de Metom pensada para su consumo en ese ecosistema concreto.

El artefacto contiene 5.644.943 parámetros totales, lo que equivale a 10,77 MB en FP16, comprimidos a 0,41 MB en formato `.jsyn` (zstd + CRC32), es decir, 26,07 veces más pequeño y una media de 0,1772 bits por peso. La estructura interna son 26 tensores de bitplane 2D y 52 vectores 1D de LayerNorm, bias y depthwise. La licencia es Apache 2.0, heredada del modelo base.

Su relevancia es fundamentalmente experimental: explora el régimen sub-1-bit (por debajo de un bit por peso) y un formato de pesos orientado a despliegues ligeros y nativos de Kubernetes. No hay información publicada sobre idiomas soportados, pipeline, benchmarks ni capacidades funcionales verificables, y el repositorio tiene 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (checkpoint factorizado LittleBit-2 + Sakana SVF sobre SakanaAI/Metom) |
| Parametros totales | 5.644.943 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | sub-1-bit (0,1772 BPW medio); formato `.jsyn` con zstd + CRC32 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.jsyn` (JouleDB); no se publican safetensors ni GGUF |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna del modelo base SakanaAI/Metom (transformer, MoE, SSM u otra), ni el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO. Lo que sí se documenta es la transformación aplicada: el checkpoint es una versión pre-factorizada que combina LittleBit-2 (representación de pesos por debajo de 1 bit) con Sakana SVF, empaquetada en el formato `.jsyn` propietario de JouleDB.

La estructura del artefacto consta de 26 tensores de bitplane 2D y 52 vectores 1D (LayerNorm, bias y depthwise). El resultado ocupa 0,41 MB frente a los 10,77 MB equivalentes en FP16, con una media de 0,1772 bits por peso. No se detalla el proceso de entrenamiento, destilación o calibración que produce estos pesos, ni se especifica qué innovaciones técnicas adicionales (decodificación especulativa, atención lineal, etc.) incorpora el modelo base.

## Capacidades

- No se documentan capacidades funcionales verificables del modelo en la información disponible.
- No hay evidencia publicada de generación de texto, razonamiento, código, matemáticas o visión.
- No se indica soporte de tool calling ni function calling.
- No se indica soporte de agentes ni razonamiento multi-paso.
- No se especifican capacidades multilingües ni idiomas cubiertos.
- El único uso documentado es la carga del checkpoint en JouleDB mediante `db.hf_pull(...)` con el `model_id` `sakana-metom`.

## Casos de uso

- Experimentación con pesos sub-1-bit en JouleDB: cargar el checkpoint con `db.hf_pull("dcharlot65-openie/Sakana-Metom-LittleBit", model_id="sakana-metom")` para estudiar el comportamiento de la representación LittleBit-2 + SVF en el runtime sin PyTorch.
- Despliegue en clústeres Kubernetes-native: el tamaño de 0,41 MB y el empaquetado `.jsyn` lo hacen adecuado para entornos JouleKube donde el espacio y la inicialización son críticos.
- Investigación sobre compresión extrema: servir como referencia reproducible de un checkpoint a 0,1772 BPW para comparar con otras técnicas de cuantización sub-1-bit.
- Pruebas de integración del runtime JouleDB: validar el ciclo `cargo binstall jouledb` → `jouledb serve` → `hf_pull` en pipelines de CI.
- Estudio de formatos de pesos alternativos: analizar la estructura de 26 bitplanes 2D y 52 vectores 1D frente a safetensors o GGUF.
- Docencia o demostración de bases de datos termodinámicas para IA: ilustrar el concepto de "living weights" con un artefacto pequeño y de licencia permisiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; el checkpoint comprimido ocupa 0,41 MB y el equivalente FP16 10,77 MB, por lo que la huella de memoria es mínima, pero no se documentan requisitos del runtime.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; por tamaño cabría en cualquier GPU, pero no se confirma soporte del runtime JouleDB en CUDA.
- Opciones de despliegue: JouleDB v0.2.4+ (`cargo binstall jouledb`, `jouledb serve --http-addr 127.0.0.1:8080`). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (checkpoints sub-1-bit para runtimes sin PyTorch) con parámetros, contexto, rendimiento y licencia verificables.

## Limitaciones y advertencias

- No hay información sobre sesgos del modelo base ni del proceso de compresión.
- Riesgo de alucinación: no evaluable sin benchmarks ni descripción de capacidades.
- No se especifican idiomas soportados ni limitaciones de contexto.
- El formato `.jsyn` es propietario de JouleDB; no hay pesos en safetensors ni GGUF, lo que limita su uso fuera de ese runtime.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo día (2026-11-24), sin señales de validación por la comunidad.
- La licencia Apache 2.0 permite uso comercial, pero se desconoce si la compresión sub-1-bit introduce degradaciones no documentadas respecto a SakanaAI/Metom.
- El tamaño del repo figura como 0.0 GB, lo que puede indicar que los pesos no están efectivamente alojados o que la metadata no refleja el contenido.
- No se documenta el pipeline ni el uso previsto más allá de la carga en JouleDB.

## Enlaces

- Hugging Face: https://huggingface.co/dcharlot65-openie/Sakana-Metom-LittleBit
- Modelo base: https://huggingface.co/SakanaAI/Metom
- Repositorio JouleDB: https://github.com/openIE-dev/jouledb
