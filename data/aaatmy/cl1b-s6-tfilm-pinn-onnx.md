# aaatmy/cl1b-s6-tfilm-pinn-onnx

## Resumen
CL-1B optical compressor model (S6 + TFiLM + circuit PINN) es un modelo neuronal fisicamente informado que emula el compresor óptico de válvulas Tube-Tech CL 1B. Lo desarrolla el usuario aaatmy y se publica como un grafo ONNX orientado a inferencia de audio en tiempo real (pipeline `audio-to-audio`). El modelo predice los estados internos de un circuito equivalente reducido y aplica las ecuaciones del circuito para generar la señal procesada (Wet), en lugar de aprender directamente la transformación de audio.

La arquitectura combina dos bloques S6 (state-space model de tipo Mamba-1) de anchura 8 y estado 16, con condicionamiento FiLM sobre los controles de Threshold/Ratio y un GRU que modela la dinámica temporal de Attack/Release. La cabeza de circuito produce tres estados físicos por muestra (tensión de control C3, ocupación rápida y lenta del elemento fotoeléctrico) que alimentan una red de resistencias y un amplificador con soft-clipping.

Es relevante por su planteamiento híbrido: es un modelo extremadamente pequeño (6.010 parámetros, checkpoint de 39 KB) que incorpora una pérdida de física durante el entrenamiento y se exporta como modelo de streaming con estado recurrente y de circuito explícito. El tamaño del ONNX (31 MB) se debe al desenrollado del escaneo selectivo de 512 pasos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | S6 (state-space selectivo tipo Mamba-1) con FiLM y GRU de condicionamiento, más cabeza de circuito físico |
| Parametros totales | 6.010 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica; procesa chunks fijos de 512 muestras con estado recurrente |
| Tipos de cuantizacion | no disponible (exportación ONNX en float32/float64 según tensor) |
| Idiomas soportados | no disponible (modelo de audio, no lingüístico) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | ONNX (opset 18) y checkpoint PyTorch/PhysicsNeMo (.mdlus) |

## Arquitectura y entrenamiento
El modelo se compone de dos bloques S6 de tipo Mamba-1 (anchura 8, dimensión de estado 16) intercalados con condicionamiento FiLM. Los controles de Threshold y Ratio se inyectan mediante FiLM estático, mientras que Attack y Release se modelan con un GRU que produce FiLM temporal. La entrada es un historial de 64 muestras de la señal Dry más su espectro de magnitud. La cabeza de circuito genera tres estados por muestra: `e` (tensión de control C3, 0–30 V), `f` (ocupación rápida del elemento fotoeléctrico, 0–1) y `s` (ocupación lenta, 0–1). A partir de ellos, una red de resistencias de panel frontal y un amplificador con soft-clipping producen la señal Wet. Siete parámetros del circuito se aprenden con un prior.

El entrenamiento utiliza el dataset TubeTech CL-1B de Riccardo Simionato (620 grabaciones estéreo, izquierda Dry y derecha Wet, sobre una rejilla 5×5×5×5 de Attack × Release × Ratio × Threshold). Se entrenó con intervalos completos en orden cronológico, arrastrando estado de red y de circuito entre chunks de 1.024 muestras, 50 épocas, batch 128 y learning rate 3e-4. La pérdida incorpora los residuos de las tres ecuaciones de estado del circuito con un peso que escala de 0 a 1 durante las primeras 10 épocas (restricción blanda). La época 20 se seleccionó por el ESR medio por fichero en validación, regla fijada antes del entrenamiento. El split de test son los últimos ~20 s de cada grabación (2,97 h en total).

## Capacidades
- Emulación de compresión de rango dinámico óptica con comportamiento de compresor de válvulas (Tube-Tech CL 1B).
- Procesamiento de audio en streaming por chunks de 512 muestras a 48 kHz con estado recurrente y de circuito explícito.
- Control paramétrico de Threshold (−40…0 dB), Ratio (2…10), Attack y Release (posiciones 0…4) y makeup fijo a 0 dB.
- Predicción de estados físicos internos del circuito (tensión C3, ocupaciones del foto-elemento) además de la señal de audio.
- Salida de residuos de las ODE del circuito como diagnóstico (`residual_c3`, `residual_gre_fast`, `residual_gre_slow`).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo de audio-to-audio especializado.

## Casos de uso
- Producción musical en tiempo real: integración como plugin o etapa de procesado en una cadena de mezcla, aprovechando el modelo ONNX de 31 MB y su naturaleza de streaming por chunks de 512 muestras para procesar a 48 kHz con latencia acotada.
- Reamplificación y procesado offline de stems: el script `example_stream.py` permite procesar ficheros WAV completos aplicando los parámetros de Threshold, Ratio, Attack y Release, útil para dar carácter de compresor óptico a pistas ya grabadas.
- Sustitución o complemento de plugins de compresor en entornos sin hardware: al ser un modelo pequeño y exportado a ONNX, puede desplegarse en servidores o estaciones sin dependencia de plugins propietarios.
- Investigación en modelado físico de audio: los estados internos y los residuos de las ODE permiten analizar el comportamiento del circuito emulado y comparar con el modelo companion sin circuito.
- Prototipado de cadenas de masterización: el control de Ratio hasta 10 y Threshold hasta −40 dB permite explorar ajustes de compresión sobre material ya mezclado.
- Docencia y experimentación con PINN aplicadas a audio: el modelo sirve como ejemplo reproducible de cómo una pérdida física blanda se integra en un modelo state-space pequeño para emular un circuito analógico.

## Benchmarks y rendimiento
Resultados sobre el split de test completo (620 ficheros; menor es mejor):

| Modelo | ESR medio por fichero | ESR mediana | ESR agrupado | Ficheros con ESR > 1 |
|---|---:|---:|---:|---:|
| S6 + TFiLM, ganancia acotada (companion) | 0,055 | 0,026 | 0,025 | 0 |
| Este modelo (S6 + TFiLM + circuit PINN) | 0,059 | 0,030 | 0,034 | 1 |
| S6 + PINN original (entrenamiento de ventana corta) | 0,352 | 0,114 | 0,122 | 42 |
| Modelo publicado de RiccardoVib (referencia) | 0,137 | 0,083 | 0,046 | 0 |

Residuo cuadrático medio de las ODE en test: C3 0,043; rápido 5,5×10⁻⁴; lento 2,3×10⁻⁴. Verificación ONNX frente a PyTorch (`verification.json`): 12 s de dos grabaciones en chunks de 512 muestras desde estado cero, ESR ≤ 1,5×10⁻⁷ y diferencia máxima por muestra de 5,9×10⁻⁵.

## Requisitos de hardware
- VRAM estimada: mínima; el modelo tiene 6.010 parámetros y el ONNX ocupa 31 MB, por lo que cabe en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU con ONNX Runtime. Cualquier GPU (RTX 4090, A100, H100) ejecutará la inferencia sobradamente.
- Cabe en cualquier GPU consumer y en entornos embebidos, dado el tamaño reducido del checkpoint (39 KB) y del grafo ONNX (31 MB).
- Despliegue: ONNX Runtime (probado con `onnxruntime`, `soundfile` y `numpy`); no se documentan opciones para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponible en la información proporcionada; el procesamiento es por chunks de 512 muestras a 48 kHz con estado recurrente explícito.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / formato | ESR medio (test) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (S6 + TFiLM + circuit PINN) | 6.010 | chunks de 512 muestras, 48 kHz mono | 0,059 | CC BY-SA 4.0 | Hugging Face (ONNX) |
| aaatmy/cl1b-s6-tfilm-onnx (companion sin circuito) | no disponible | chunks de 512 muestras, 48 kHz mono | 0,055 | no disponible en la información | Hugging Face |
| S6 + PINN original (ventana corta) | no disponible | ventana corta | 0,352 | no disponible | no disponible |
| Modelo publicado de RiccardoVib | no disponible | no disponible | 0,137 | no disponible | referencia publicada |

## Limitaciones y advertencias
- Entrenamiento con una sola ejecución, un solo dispositivo y una sola semilla (7): no hay evidencia de robustez entre semillas.
- Cobertura limitada: solo se vieron en entrenamiento los puntos de la rejilla grabada y makeup a 0 dB.
- La física no garantiza extrapolación: en un experimento holdout con Threshold −40 dB eliminado del entrenamiento, los modelos con física rindieron peor que el S6 simple en esos ajustes, y la tensión C3 predicha no aumentó con el umbral más bajo. La restricción física es blanda y no actúa en inferencia.
- Los 7 parámetros del circuito describen un modelo reducido, no el hardware: se alejaron de sus valores nominales (por ejemplo, `gre_half` de 0,12 a 1,64) y deben leerse como parámetros de ajuste.
- Formato fijo: solo mono, 48 kHz y chunks de 512 muestras.
- Licencia CC BY-SA 4.0: impone compartir bajo la misma licencia las obras derivadas y requiere atribución; conviene revisar las implicaciones para uso comercial.
- Riesgo de alucinación no aplica en el sentido lingüístico, pero sí existe riesgo de comportamiento fuera de distribución en ajustes de parámetros no vistos durante el entrenamiento.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/aaatmy/cl1b-s6-tfilm-pinn-onnx
- Modelo companion sin circuito: https://huggingface.co/aaatmy/cl1b-s6-tfilm-onnx
- Dataset TubeTech CL-1B (Riccardo Simionato): https://www.kaggle.com/datasets/riccardosimionato/tubetech-cl-1b
