# dcharlot65-openie/Granite-Timeseries-TTM-R3-LittleBit

## Resumen

`Granite-Timeseries-TTM-R3-LittleBit` es un checkpoint de pesos comprimidos derivado de `ibm-granite/granite-timeseries-ttm-r3`, el modelo de series temporales de IBM Research (familia Tiny Time Mixers). Lo publica el usuario `dcharlot65-openie` y no es un modelo entrenado desde cero, sino una refactorización del original aplicando la técnica propietaria `LittleBit-2` combinada con `Sakana SVF` (singular value fine-tuning), empaquetada en formato `.jsyn` para el runtime JouleDB.

El resultado es un artefacto de 1.414.514 parámetros (2,70 MB en FP16) comprimido a 0,40 MB con zstd y CRC32, lo que supone 6,70 veces menos espacio y una media de 0,8148 bits por peso. Es, por tanto, un ejemplo de cuantización sub-1-bit aplicada a un modelo de forecasting, no un modelo de lenguaje.

Su relevancia es acotada: el repositorio está vacío (0,0 GB), no tiene descargas ni likes, no incluye pipeline declarado y la única vía de uso documentada es JouleDB, un motor de inferencia sin PyTorch. Sirve como referencia de compresión extrema y de integración con un stack Kubernetes-native, no como sustituto directo del TTM-R3 original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivada de granite-timeseries-ttm-r3, familia Tiny Time Mixers) |
| Parametros totales | 1.414.514 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | sub-1-bit (LittleBit-2), media de 0,8148 BPW; almacenamiento zstd + CRC32 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.jsyn` (JouleDB); no se publican safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo base, `granite-timeseries-ttm-r3`, pertenece a la familia Tiny Time Mixers de IBM: modelos compactos de forecasting de series temporales basados en mezcladores (mixers) en lugar de atención completa, diseñados para inferencia ligera sobre ventanas temporales. La model card del checkpoint derivado no detalla la arquitectura interna ni los datos de entrenamiento del original.

La transformación aplicada aquí consiste en una factorización `LittleBit-2 ⊕ Sakana SVF`: 175 tensores se almacenan como bitplanes 2D y 293 vectores (LayerNorm, bias y depthwise) se mantienen en 1D. No hay indicios de reentrenamiento, RLHF ni ajuste con datos nuevos; es una recompresión del checkpoint original bajo la licencia Apache 2.0. La innovación técnica declarada es el formato `.jsyn` con compresión zstd y verificación CRC32, pensado para un runtime de inferencia sin PyTorch.

## Capacidades

- Forecasting de series temporales, heredado del TTM-R3 original (predicción de horizontes temporales a partir de ventanas de entrada).
- Compresión sub-1-bit con 0,8148 BPW, orientada a despliegues con memoria y almacenamiento muy restringidos.
- Carga e inferencia mediante JouleDB (`db.hf_pull`), con servidor HTTP local (`jouledb serve`).
- Integración declarada con `JouleKube`, sustrato Kubernetes-native para agentes e IA.
- No se documentan capacidades de generación de texto, código, matemáticas, visión, tool calling ni razonamiento multi-paso.
- No se documenta soporte multilingüe.

## Casos de uso

- Forecasting en el borde: desplegar el modelo en nodos con poca memoria (menos de 1 MB de pesos comprimidos) para predecir métricas de sensores o telemetría sin depender de GPUs.
- Predicción de series dentro de un clúster Kubernetes: usar `JouleKube` para servir el checkpoint como microservicio de inferencia junto a los colectores de métricas.
- Prototipado de compresión extrema: emplear el artefacto como banco de pruebas para evaluar la pérdida de precisión de LittleBit-2 frente al TTM-R3 en FP16.
- Investigación en cuantización sub-1-bit: comparar la media de 0,8148 BPW con otras técnicas (GPTQ, AWQ, binaria) sobre un modelo pequeño y reproducible.
- Pipelines de CI que validen formatos `.jsyn`: verificar CRC32 y carga en JouleDB como paso de control de calidad de artefactos.
- Docencia y demos de despliegue sin PyTorch: mostrar un flujo completo de descarga desde Hugging Face e inferencia con un runtime en Rust.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta métricas de compresión (1.414.514 parámetros, 2,70 MB en FP16, 0,40 MB en `.jsyn`, 6,70x de reducción, 0,8148 BPW), sin cifras de error de predicción (MAE, MSE, SMAPE) ni comparación con el TTM-R3 original.

## Requisitos de hardware

- VRAM estimada: inferior a 10 MB para los pesos comprimidos; el original en FP16 ocupa 2,70 MB, por lo que cabe en cualquier GPU, CPU o incluso en memoria de un microcontrolador con suficiente RAM.
- GPU recomendadas: no se especifican; cualquier GPU consumer (GTX 1650, RTX 3060, RTX 4090) es sobredimensionada para este tamaño.
- Cabe en GPU consumer: sí, con enorme margen; también en CPU.
- Opciones de despliegue: exclusivamente JouleDB (`cargo binstall jouledb`, `jouledb serve --http-addr 127.0.0.1:8080`); no hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Granite-Timeseries-TTM-R3-LittleBit | 1.414.514 | no disponible | `.jsyn` (JouleDB) | Apache 2.0 | Hugging Face, repo vacío, 0 descargas |
| ibm-granite/granite-timeseries-ttm-r3 | no disponible en esta ficha | no disponible | safetensors (presumible) | Apache 2.0 | Hugging Face (oficial IBM) |
| Alternativas de forecasting compactas (p. ej. Chronos-Bolt, TimesFM) | no disponible | no disponible | safetensors / GGUF | varía | Hugging Face |

La comparación directa con el TTM-R3 original no puede completarse porque la model card no reproduce sus especificaciones. Frente a otros modelos de forecasting, la diferencia principal es el formato propietario y la compresión sub-1-bit, no una mejora de precisión demostrada.

## Limitaciones y advertencias

- El repositorio tiene 0,0 GB: no hay pesos descargables en la práctica, solo la model card.
- No se han publicado métricas de calidad de predicción; se desconoce la degradación introducida por la cuantización a 0,8148 BPW.
- Dependencia total de JouleDB: sin soporte para safetensors, GGUF, vLLM, llama.cpp u Ollama, lo que limita la portabilidad.
- Autor no verificado (`dcharlot65-openie`) y sin tracción (0 descargas, 0 likes); no es un artefacto mantenido por IBM.
- No hay información sobre sesgos, idiomas ni dominios de series temporales cubiertos.
- Licencia Apache 2.0 permite uso comercial, pero la atribución al modelo base de IBM es obligatoria y debe conservarse.
- El pipeline no está declarado, por lo que las herramientas de Hugging Face no pueden inferir la tarea automáticamente.
- Para producción, conviene validar el checkpoint contra el TTM-R3 original antes de sustituirlo.

## Enlaces

- [Hugging Face: dcharlot65-openie/Granite-Timeseries-TTM-R3-LittleBit](https://huggingface.co/dcharlot65-openie/Granite-Timeseries-TTM-R3-LittleBit)
- [Modelo base: ibm-granite/granite-timeseries-ttm-r3](https://huggingface.co/ibm-granite/granite-timeseries-ttm-r3)
- [JouleDB (GitHub)](https://github.com/openIE-dev/jouledb)
