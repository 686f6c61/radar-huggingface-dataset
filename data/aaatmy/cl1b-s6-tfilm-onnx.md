# aaatmy/cl1b-s6-tfilm-onnx

## Resumen

CL-1B optical compressor model (S6 + TFiLM, bounded gain) es un modelo neuronal que emula el comportamiento del compresor óptico de válvulas Tube-Tech CL 1B. Lo desarrolla el usuario aaatmy y se publica en Hugging Face como un modelo ONNX de audio-a-audio. El modelo transforma una señal de audio mono en seco (Dry) junto con los ajustes del panel frontal (Threshold, Ratio, Attack y Release) en la señal comprimida (Wet), muestra a muestra, a 48 kHz. Resuelve el problema de reproducir el comportamiento no lineal y dependiente del tiempo de un compresor óptico analógico real sin necesidad de hardware físico.

La arquitectura combina dos bloques S6 de tipo Mamba-1 (modelo de espacio de estados selectivo) con una etapa de condicionamiento FiLM: los parámetros estáticos (Threshold y Ratio) entran por una FiLM estática y los temporales (Attack y Release) por una FiLM recurrente basada en GRU. La entrada es una historia de 64 muestras de la señal Dry más su espectro de magnitud de 128 puntos. La salida es una ganancia por muestra acotada entre 0 y 2 mediante `2·sigmoid`, de modo que Wet = Dry × ganancia.

Es relevante porque demuestra que un modelo de espacio de estados de tamaño muy reducido (5.985 parámetros) puede superar a alternativas previas en la emulación de un compresor óptico concreto, con una exportación ONNX en streaming con estado recurrente explícito y una verificación numérica frente a PyTorch. La licencia CC BY-SA 4.0 y el tamaño del checkpoint (36 KB) lo hacen fácil de integrar en cadenas de procesamiento de audio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dos bloques S6 (Mamba-1, state-space model selectivo) con FiLM estática y FiLM temporal GRU; salida de ganancia acotada `2·sigmoid` |
| Parametros totales | 5.985 (checkpoint de 36 KB; ONNX de 30 MB por el desenrollado del scan selectivo de 512 pasos) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica; procesa en chunks fijos de 512 muestras con estado recurrente explícito |
| Tipos de cuantizacion | No disponible (solo se publica el ONNX en float32) |
| Idiomas soportados | No disponible (modelo de audio, no de texto) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | ONNX (opset 18) y checkpoint original PyTorch / PhysicsNeMo (`.mdlus`) |

## Arquitectura y entrenamiento

El modelo es un sistema de espacio de estados selectivo de tipo Mamba-1. Dos bloques S6 (ancho 8, estado 16) rodean una etapa de condicionamiento. Threshold y Ratio alimentan una FiLM estática; Attack y Release alimentan una FiLM temporal implementada con una GRU. La entrada por paso es una historia de 64 muestras de Dry más su espectro de magnitud de 128 puntos. La salida es una ganancia por muestra acotada a 0–2 con `2·sigmoid`, lo que evita picos de ganancia tras silencios casi absolutos. El ONNX es un modelo en streaming con estado recurrente explícito: `history`, `conv1`, `ssm1`, `condition`, `conv2` y `ssm2`, que deben realimentarse en cada chunk de 512 muestras.

El entrenamiento usa el dataset TubeTech CL-1B de Riccardo Simionato (620 grabaciones estéreo, canal izquierdo Dry y derecho Wet, con una rejilla 5×5×5×5 de Attack × Release × Ratio × Threshold y ganancia de compensación de 0 dB). La partición es por contenido de audio, compartida entre ajustes: aproximadamente 29,5 h de intervalos para entrenamiento, 4,9 h para validación y 2,97 h para test (los últimos ~20 s de cada grabación). Se entrenó con intervalos completos en orden cronológico y estado arrastrado entre chunks de 1.024 muestras (BPTT truncado por lotes), 50 épocas, batch 128 y lr 3e-4. Se seleccionó la época 22 por el ESR medio por archivo en validación, regla fijada antes del entrenamiento; el conjunto de test no intervino en ninguna decisión. La verificación ONNX frente a PyTorch (`verification.json`) sobre 12 s de dos grabaciones da un ESR ≤ 8×10⁻⁸ y una diferencia máxima por muestra de 1,4×10⁻⁴.

## Capacidades

- Emulación de compresión óptica de válvulas del Tube-Tech CL 1B sobre audio mono a 48 kHz.
- Mapeo audio-audio muestra a muestra condicionado por cuatro controles de panel: Threshold (−40…0 dB), Ratio (2…10), Attack (posición 0…4) y Release (posición 0…4).
- Inferencia en streaming con estado recurrente explícito en chunks fijos de 512 muestras.
- Exportación ONNX (opset 18) ejecutable con ONNX Runtime.
- Modelado de la dinámica no lineal y dependiente del tiempo propia de un compresor óptico (ataque y liberación dependientes de la señal).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente de procesamiento de audio.

## Casos de uso

- Procesado de mezcla en producción musical: aplicar la curva de compresión del CL 1B a pistas vocales o de instrumentos mono a 48 kHz sin disponer del hardware físico, ajustando Threshold, Ratio, Attack y Release desde la interfaz del plugin.
- Reamplificación o reamp digital en estudios: sustituir una unidad CL 1B en cadenas de mastering o buses de batería cuando se busca el carácter óptico del compresor original, con la ventaja de que el modelo es determinista y repetible.
- Procesamiento en tiempo real embebido: al tener solo 5.985 parámetros y un ONNX de 30 MB, puede integrarse en plugins de audio o en dispositivos con recursos limitados usando ONNX Runtime con chunks de 512 muestras.
- Generación de datasets aumentados: producir versiones comprimidas de grabaciones secas con distintos ajustes de panel para entrenar otros modelos de audio o para pruebas A/B controladas.
- Investigación en emulación de efectos analógicos: servir como referencia reproducible (checkpoint, configuración de entrenamiento y verificación ONNX incluidos) para comparar arquitecturas SSM frente a S4 u otros enfoques en modelado de compresores.
- Docencia y demostraciones: ilustrar el comportamiento de un compresor óptico con un modelo ligero que se ejecuta con `onnxruntime` y `soundfile` en un portátil, sin GPU.
- Postproducción de podcast y voz hablada: control dinámico mono a 48 kHz con ajustes de ataque y liberación que emulan el comportamiento óptico, útil para nivelar locuciones antes de la mezcla final.

## Benchmarks y rendimiento

Resultados en el split de test completo (620 archivos, 2,97 h; menor es mejor). ESR = energía de error ÷ energía objetivo.

| Modelo | ESR medio por archivo | ESR mediana | ESR agrupado | Archivos con ESR > 1 |
|---|---:|---:|---:|---:|
| **Este modelo** | **0,055** | **0,026** | **0,025** | **0** |
| Modelo publicado de RiccardoVib (referencia) | 0,137 | 0,083 | 0,046 | 0 |
| S4 + TFiLM, mismo pipeline de entrenamiento | 0,148 | 0,070 | 0,069 | 2 |

Verificación ONNX frente a PyTorch: ESR ≤ 8×10⁻⁸ y diferencia máxima por muestra de 1,4×10⁻⁴ sobre 12 s de dos grabaciones, en chunks de 512 muestras desde estado cero. Los scores omiten las primeras 49.152 muestras (~1 s) tras el arranque desde estado cero, mientras el estado se estabiliza.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; el checkpoint tiene 5.985 parámetros (36 KB) y el ONNX 30 MB, por lo que cabe holgadamente en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: no requiere GPU; cualquier GPU con soporte de ONNX Runtime (por ejemplo, RTX 4090, A100, H100) acelera el procesamiento por lotes, pero no es necesaria.
- Cabe en GPU consumer: sí, en cualquier modelo; también en CPU y en dispositivos embebidos.
- Opciones de despliegue: ONNX Runtime (probado con `onnxruntime`, `soundfile` y `numpy`), con el script `example_stream.py` incluido; el checkpoint original se ejecuta con PyTorch / PhysicsNeMo.
- Latencia y throughput estimados: no disponibles en la información proporcionada. El procesamiento es en chunks fijos de 512 muestras a 48 kHz, con estado recurrente realimentado entre chunks.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / formato | ESR (test) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| **Este modelo (S6 + TFiLM)** | 5.985 | Chunks de 512 muestras, 48 kHz, mono | 0,055 medio / 0,025 agrupado | CC BY-SA 4.0 | ONNX y PyTorch en Hugging Face |
| Modelo publicado de RiccardoVib (referencia) | No disponible | No disponible | 0,137 medio / 0,046 agrupado | No disponible | Referencia citada en la model card |
| S4 + TFiLM (mismo pipeline) | No disponible | No disponible | 0,148 medio / 0,069 agrupado | No disponible | Referencia citada en la model card |

## Limitaciones y advertencias

- Un solo dispositivo y una sola ejecución de entrenamiento: el modelo cubre una unidad CL 1B concreta y se entrenó con una única semilla (7).
- Cobertura limitada: los ajustes entre los puntos de la rejilla grabada y las ganancias de compensación distintas de 0 dB no se vieron durante el entrenamiento.
- La generalización a ajustes no vistos no está establecida: en un experimento aparte, un modelo S6 entrenado sin los ajustes de Threshold −40 dB rindió notablemente peor en ellos, y el resultado varió mucho según la semilla.
- Formato fijo: solo mono, 48 kHz y chunks fijos de 512 muestras.
- Riesgo de artefactos en los primeros ~1 s tras arrancar desde estado cero, mientras el estado recurrente se estabiliza; los benchmarks omiten esas primeras 49.152 muestras.
- Licencia CC BY-SA 4.0: permite uso comercial, pero obliga a atribuir y a compartir las obras derivadas bajo la misma licencia; conviene revisar las implicaciones para productos de audio propietarios.
- No es un modelo de lenguaje: no soporta texto, tool calling, agentes ni capacidades multilingües.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aaatmy/cl1b-s6-tfilm-onnx
- Dataset TubeTech CL-1B de Riccardo Simionato: https://www.kaggle.com/datasets/riccardosimionato/tubetech-cl-1b
- Script de ejemplo `example_stream.py` (incluido en el repositorio del modelo)
- Configuración de entrenamiento `training_config.json` (incluido en el repositorio del modelo)
- Verificación ONNX frente a PyTorch `verification.json` (incluido en el repositorio del modelo)
