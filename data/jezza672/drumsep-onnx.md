# jezza672/drumsep-onnx

## Resumen

drumsep-onnx es una conversión al formato ONNX del modelo drumsep de inagoy, un fine-tune de Hybrid Demucs especializado en separar una pista de batería en cuatro stems: bombo (kick), caja (snare), platos (cymbals) y toms. No es un modelo de lenguaje: es un modelo de separación de fuentes de audio, y esta copia concreta la publica jezza672 para que funcione en el proveedor de CPU de ONNX Runtime dentro de su estación de trabajo de audio de código abierto Noodle.

El cambio respecto a la conversión original de splitzo es mínimo pero funcional: cuatro nodos `EyeLike` presentes en las capas dconv de `encoder.4` y `encoder.5` reciben una entrada booleana, para la que ONNX Runtime no tiene kernel de CPU, lo que impide cargar el modelo. En esta versión el `ConstantOfShape` que alimenta cada nodo produce ceros float32 en lugar de booleanos, y el `Cast` posterior devuelve el tensor a booleano, de modo que el resultado es idéntico. Los pesos no se han modificado.

El modelo es relevante para quien necesite separación de batería dentro de un pipeline de audio ejecutable en CPU, sin depender de GPU ni de PyTorch. El repositorio ocupa 0,3 GB y el único artefacto es un fichero ONNX de 335.086.863 bytes. La licencia es MIT, aunque el autor advierte que la licencia de los datos de entrenamiento originales no está declarada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hybrid Demucs (fine-tune para separacion de bateria), exportado a ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; ventana fija de 1.764.000 muestras (40 s a 44,1 kHz) |
| Tipos de cuantizacion | no disponible (el artefacto publicado es float32) |
| Idiomas soportados | no aplica (modelo de audio) |
| Licencia | MIT |
| Formato de pesos | ONNX (`drumsep.onnx`, 335.086.863 bytes) |

## Arquitectura y entrenamiento

La arquitectura subyacente es Hybrid Demucs, un modelo de separación de fuentes que combina una rama temporal (dominio de la forma de onda) y una rama espectral (dominio STFT) con conexiones entre ambas. El modelo original drumsep es un fine-tune de inagoy orientado específicamente a batería, con cuatro stems de salida en el orden kick, snare, cymbals, toms.

La interfaz ONNX expone dos entradas: `waveform` float32 de forma `[batch, 2, samples]`, donde `samples` debe ser exactamente 1.764.000 (40 s a 44,1 kHz), y `magnitude` float32 de forma `[batch, 4, 2048, time_frames]`, con `time_frames` fijado en 1723. La entrada `magnitude` es la STFT compleja con `n_fft` 4096 y hop 1024, representada como canales real e imaginario y sin el bin de Nyquist. Las salidas son `freq_output` `[batch, 4, 4, 2048, 1723]` y `time_output` `[batch, 4, 2, 1764000]`; cada stem se obtiene sumando la STFT inversa de su rama espectral y su rama temporal.

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset ni si se aplicaron técnicas de refinamiento posteriores. La modificación introducida en esta copia es puramente de grafo: sustituir la generación de tensores booleanos por ceros float32 en los nodos `EyeLike` de `encoder.4` y `encoder.5`, manteniendo el `Cast` a booleano posterior. No hay cambios en los pesos ni en la semántica numérica.

## Capacidades

- Separación de una pista de batería en cuatro stems: bombo, caja, platos y toms.
- Procesamiento en CPU mediante el proveedor de CPU de ONNX Runtime, sin requerir GPU ni PyTorch.
- Entrada dual (forma de onda y STFT compleja) con ventana fija de 40 s a 44,1 kHz.
- Salida en dos ramas (espectral y temporal) que se combinan por STFT inversa.
- No soporta tool calling, agentes, razonamiento multi-paso ni generación de texto.
- No tiene capacidades multilingües ni de visión; es un modelo estrictamente de audio.
- No dispone de modo thinking ni de funcionalidades especiales adicionales.

## Casos de uso

- Estación de trabajo de audio Noodle: es el caso de uso para el que se publicó esta copia; el modelo se carga directamente en ONNX Runtime sobre CPU para separar batería dentro del flujo de edición de la aplicación.
- Remezcla y edición de batería en producción musical: permite aislar bombo, caja, platos y toms de una grabación para reequilibrar niveles, sustituir piezas o aplicar procesado independiente a cada elemento.
- Creación de sample packs: extraer stems de batería limpios de grabaciones existentes para reutilizarlos como samples en bibliotecas, con la ventaja de ejecutarse en CPU y no requerir hardware especializado.
- Transcripción y análisis rítmico: al disponer de stems separados, herramientas posteriores pueden detectar golpes de bombo y caja con mayor fiabilidad que sobre la mezcla completa.
- Eliminación o atenuación de batería en pistas para práctica: generar una versión sin batería (o con stems atenuados) para músicos que ensayan sobre una grabación.
- Procesamiento por lotes en servidores sin GPU: al funcionar en el proveedor de CPU de ONNX Runtime, se puede integrar en pipelines de procesamiento masivo en máquinas sin acelerador, con la ventana fija de 40 s como unidad de trabajo.
- Integración en aplicaciones de escritorio o web mediante ONNX Runtime: el formato ONNX permite desplegar el modelo en entornos JavaScript, C# o C++ con el runtime correspondiente, sin dependencias de Python.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El artefacto ONNX ocupa 335 MB en float32; el repositorio completo son 0,3 GB.
- La memoria RAM necesaria para inferencia no está documentada; como referencia, el fichero de pesos debe residir en memoria y las activaciones intermedias de las salidas (`freq_output` con 4×4×2048×1723 y `time_output` con 4×2×1.764.000 por lote) añaden consumo adicional no cuantificado.
- Funciona en CPU mediante el proveedor de CPU de ONNX Runtime, que es precisamente el objetivo de esta conversión.
- No se especifican GPU recomendadas; al ser un modelo ONNX, podría ejecutarse con el proveedor CUDA de ONNX Runtime si se dispone de GPU compatible, pero no hay datos de rendimiento al respecto.
- Al caber en 0,3 GB, es viable en cualquier equipo de consumo con RAM suficiente; no se detallan requisitos mínimos.
- Opciones de despliegue: ONNX Runtime (CPU o CUDA), y por tanto integrable en aplicaciones que embeban el runtime (Python, C++, C#, JavaScript). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- No se dispone de datos de latencia ni throughput.

## Comparativa con modelos similares

| Modelo | Tipo | Stems | Formato | Licencia | Contexto/ventana |
|---|---|---|---|---|---|
| jezza672/drumsep-onnx | Hybrid Demucs (ONNX) | 4 (kick, snare, cymbals, toms) | ONNX | MIT | 40 s a 44,1 kHz |
| splitzo/drumsep | Hybrid Demucs (ONNX) | 4 | ONNX | MIT | 40 s a 44,1 kHz |
| inagoy/drumsep | Hybrid Demucs (original) | 4 | no disponible | MIT | no disponible |
| Demucs (Meta, referencia general) | Hybrid Transformer Demucs | 4 (voz, batería, bajo, otros) | PyTorch | MIT | variable |

La comparación con Demucs de Meta es orientativa: Demucs separa una mezcla musical completa en voz, batería, bajo y otros, mientras que drumsep se especializa en subdividir la pista de batería en sus componentes. No se dispone de métricas comparativas de calidad (SDR, SIR) en la información proporcionada.

## Limitaciones y advertencias

- La ventana de entrada es fija: `samples` debe ser exactamente 1.764.000 y `time_frames` exactamente 1723; no admite longitudes arbitrarias sin troceado previo.
- El modelo solo separa batería; no está pensado para separar voz, bajo u otros instrumentos de una mezcla completa.
- No se han publicado métricas de calidad de separación (SDR, SIR, SAR) en la información disponible.
- El autor advierte que la licencia de los datos de entrenamiento de drumsep no está declarada, lo que puede afectar al uso comercial pese a que el código y los pesos se distribuyan bajo MIT.
- Al ser una conversión ONNX con modificación de grafo, cualquier cambio futuro en el modelo original requeriría una nueva conversión; esta copia está congelada.
- No hay información sobre sesgos, robustez ante distintos géneros musicales, calidades de grabación o tipos de batería.
- El repositorio no tiene descargas ni likes y fue creado en noviembre de 2026, por lo que no cuenta con validación comunitaria.
- No se especifican requisitos de memoria ni latencia, lo que dificulta planificar despliegues en producción sin pruebas propias.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jezza672/drumsep-onnx
- Modelo base (inagoy/drumsep): https://huggingface.co/inagoy/drumsep
- Conversión ONNX original (splitzo/drumsep): https://huggingface.co/splitzo/drumsep
- Repositorio del modelo original: https://github.com/inagoy/drumsep
- Estación de trabajo de audio Noodle: https://github.com/Jezza672/noodle
