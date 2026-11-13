# dreamstickkkkk9090/ising-predecoder-si1000-finetune

## Resumen

`ising-predecoder-si1000-finetune` es una colección de checkpoints afinados a partir de los pre-decodificadores Ising de NVIDIA para códigos de superficie (surface codes) en corrección de errores cuánticos. El autor, `dreamstickkkkk9090`, parte de los modelos publicados por NVIDIA (`Ising-Decoder-SurfaceCode-1-Accurate` e `Ising-Decoder-SurfaceCode-1-Fast`, Chamberland et al., arXiv:2604.12841), que fueron entrenados con ruido depolarizante a nivel de circuito, y los reentrena para el modelo de ruido SI1000.

El problema que resuelve es concreto: los checkpoints originales de NVIDIA no transfieren a otros modelos de ruido, tal y como advierten sus propias model cards. Este fine-tuning cierra esa brecha para SI1000, un modelo de ruido estándar en la literatura de corrección de errores cuánticos. Los pre-decodificadores son redes neuronales pequeñas (entre 0,9 y 1,8 millones de parámetros) que se combinan con PyMatching: la red predice un bit de flip lógico y los eventos de detección residuales, y PyMatching decodifica esos residuos.

La relevancia es práctica para investigadores en decodificación neuronal de códigos de superficie: el mejor resultado reportado es una mejora del LER de 1,63 ± 0,03 frente a PyMatching solo (distancia 13, 52 rondas, SI1000 a p = 0,003), frente al 1,24 ± 0,02 del checkpoint publicado. Todos los resultados son de simulación, sin datos de hardware.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Red neuronal pre-decodificadora para surface codes (campo receptivo local; detalles completos en el paper de NVIDIA) |
| Parámetros totales | 1.797.764 (`ft3`/`ft4`, base Accurate); 912.772 (`ft1`, base Fast) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada: ventana de eventos de detección de tamaño fijo) |
| Tipos de cuantización | fp16 (safetensors); exportación ONNX (uint8 de entrada/salida) |
| Idiomas soportados | no disponible (modelo no lingüístico) |
| Licencia | NVIDIA Open Model License |
| Formato de pesos | safetensors (fp16) y ONNX |

## Arquitectura y entrenamiento

Los pre-decodificadores Ising son redes neuronales de campo receptivo local que operan sobre ventanas de eventos de detección de un código de superficie rotado. El modelo Accurate usa un campo receptivo de 13; el modelo Fast, de 9. La red produce un bit de flip lógico y un conjunto de eventos de detección residuales que se pasan a PyMatching para la decodificación final. La predicción lógica final es el XOR del bit de la red con la predicción de PyMatching sobre el residual.

El fine-tuning se realizó sobre ruido SI1000 con el pipeline de entrenamiento abierto de NVIDIA. `ft3` se entrenó a p = 0,003, d = 13, 13 rondas, con 16 × 1.048.576 muestras; `ft4` a p = 0,002 con el mismo volumen; `ft1` a p = 0,003, d = 9, 9 rondas, con 14 × 8.388.608 muestras. Los pesos son fp16 y mantienen el mismo formato que los checkpoints publicados por NVIDIA, por lo que cargan con el código `Ising-Decoding` sin cambios. Se incluyen exportaciones ONNX para `ft3` (d = 13, T = 13, base X) y `ft1` (d = 9, T = 9, base X), con entrada `uint8` de forma `[batch, T·(d²−1)]` y salida `uint8` de forma `[batch, 1 + T·(d²−1)]`.

## Capacidades

- Pre-decodificación de eventos de detección en códigos de superficie rotados bajo ruido SI1000.
- Predicción de bit de flip lógico y de eventos de detección residuales para su uso con PyMatching.
- Soporte de distancias d = 9, 13 y 17 (evaluado), con 13, 17, 34 y 52 rondas según el checkpoint.
- Exportación ONNX para integración en pipelines de decodificación en tiempo real.
- Inferencia en fp16 y en CPU/GPU vía el pipeline de NVIDIA.
- No soporta tool calling, agentes, multilingüismo ni generación de texto: es un modelo numérico especializado.

## Casos de uso

- Investigación en decodificación neuronal de surface codes: usar `ft3` como pre-decodificador junto a PyMatching para reducir el LER en simulaciones SI1000 a p = 0,003 y distancias 13-17, sustituyendo el checkpoint publicado de NVIDIA que no transfiere a este ruido.
- Evaluación comparativa de decodificadores: emplear `ft1` (más ligero, 0,9 M de parámetros) como línea base rápida en experimentos con muchas muestras, ya que su coste de inferencia es menor y mejora al checkpoint Fast publicado en todos los ajustes SI1000.
- Integración en pipelines de simulación de códigos de superficie: cargar los safetensors con `Ising-Decoding` y el config `config_acc_si1000_p003` para reproducir los resultados del artículo.
- Despliegue en producción de decodificación de baja latencia: usar las exportaciones ONNX (`ft3_acc_si1000_d13_T13_X.onnx`, `ft1_si1000_d9_T9_X.onnx`) en runtimes ONNX para decodificación en tiempo real sobre hardware heterogéneo.
- Estudio de transferencia entre modelos de ruido: comparar el rendimiento de los checkpoints afinados frente a los publicados en ruido depolarizante para cuantificar la especialización (los afinados rinden peor en depolarizante).
- Generación de datos de entrenamiento y validación: usar los checkpoints como referencia para entrenar decodificadores propios con el pipeline abierto de NVIDIA y validar contra las métricas reportadas.

## Benchmarks y rendimiento

Mejora del LER (LER(PyMatching solo) / LER(pre-decodificador + PyMatching)); valores > 1 indican mejora. Modelo Accurate, distancia 13:

| Ruido de test | Ajuste | Publicado | `ft3` (p=0,003) | `ft4` (p=0,002) |
|---|---|---|---|---|
| SI1000 | 52 rondas, p=0,003 | 1,24 ± 0,02 | **1,63 ± 0,03** | 1,57 ± 0,03 |
| SI1000 | 13 rondas, p=0,003 | 0,97 ± 0,02 | **1,28 ± 0,02** | 1,25 ± 0,02 |
| SI1000 | 52 rondas, p=0,002 | 1,09 ± 0,06 | 1,31 ± 0,08 | 1,32 ± 0,08 |
| SI1000 | 13 rondas, p=0,002 | 0,71 ± 0,04 | 0,96 ± 0,05 | 0,92 ± 0,05 |
| Depolarizante | 52 rondas, p=0,003 | **1,56 ± 0,10** | 1,08 ± 0,06 | 1,33 ± 0,08 |
| Depolarizante | 13 rondas, p=0,003 | 1,16 ± 0,08 | 1,06 ± 0,07 | 1,05 ± 0,07 |

A d = 17, 34 rondas, SI1000 p = 0,003: `ft3` da 1,69 ± 0,07 frente a 1,12 ± 0,04 del publicado. Modelo Fast (`ft1`), SI1000:

| Ajuste | Publicado | `ft1` |
|---|---|---|
| d=13, 52 rondas, p=0,003 | 0,89 ± 0,02 | 1,15 ± 0,02 |
| d=17, 17 rondas, p=0,003 | 0,69 ± 0,02 | 0,87 ± 0,03 |
| d=13, 13 rondas, p=0,003 | 0,73 ± 0,01 | 0,93 ± 0,02 |
| d=9, 9 rondas, p=0,003 | 0,84 ± 0,01 | 0,99 ± 0,01 |
| d=13, 52 rondas, p=0,002 | 0,69 ± 0,04 | 0,90 ± 0,05 |
| d=13, 13 rondas, p=0,002 | 0,57 ± 0,03 | 0,66 ± 0,03 |
| d=9, 9 rondas, p=0,002 | 0,74 ± 0,02 | 0,86 ± 0,02 |

`ft1` supera al Fast publicado en todos los ajustes SI1000, pero solo supera la paridad con PyMatching a 52 rondas y p = 0,003.

## Requisitos de hardware

- VRAM estimada: mínima; los modelos tienen 0,9-1,8 M de parámetros en fp16 (menos de 4 MB de pesos), por lo que caben en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: cualquiera; para throughput alto en simulaciones masivas, A100/H100 o RTX 4090 reducen el tiempo de inferencia, aunque el cuello de botella suele ser PyMatching y la generación de muestras.
- Cabe en GPU consumer: sí, en cualquier GPU con soporte fp16 (GTX 16xx en adelante) y en CPU.
- Opciones de despliegue: pipeline `Ising-Decoding` de NVIDIA (safetensors), runtime ONNX (ONNX Runtime, TensorRT) para los modelos exportados.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Ruido objetivo | Mejora LER (d=13, 52r, p=0,003) | Licencia |
|---|---|---|---|---|
| `ft3` (este repo) | 1,80 M | SI1000 | 1,63 ± 0,03 | NVIDIA Open Model License |
| Ising Accurate publicado | 1,80 M | Depolarizante | 1,24 ± 0,02 (en SI1000) | NVIDIA Open Model License |
| `ft1` (este repo) | 0,91 M | SI1000 | 1,15 ± 0,02 | NVIDIA Open Model License |
| Ising Fast publicado | 0,91 M | Depolarizante | 0,89 ± 0,02 (en SI1000) | NVIDIA Open Model License |

## Limitaciones y advertencias

- Solo simulación: entrenado y evaluado con ruido SI1000 simulado; no se ha evaluado con datos de hardware real.
- Especializado en SI1000: en ruido depolarizante a nivel de circuito rinde peor que los checkpoints publicados de NVIDIA (ver tabla); para ese ruido deben usarse los originales.
- Más débil a menor intensidad de ruido y menos rondas: a p = 0,002 y 13 rondas ningún checkpoint de este repo supera la paridad con PyMatching solo.
- Un único entrenamiento por checkpoint: no hay réplicas para estimar varianza de entrenamiento.
- Licencia NVIDIA Open Model License: revisar sus términos antes de uso comercial; no es una licencia OSI estándar.
- Sin datos de sesgos ni alucinación por no ser un modelo lingüístico; el riesgo es de sobreajuste al modelo de ruido y a las distancias/rondas de entrenamiento.
- Los resultados dependen del pipeline de PyMatching y de la configuración exacta; reproducir con los configs del repositorio de GitHub.

## Enlaces

- Hugging Face: https://huggingface.co/dreamstickkkkk9090/ising-predecoder-si1000-finetune
- Repositorio de código y logs: https://github.com/Dreamstick9/ising-predecoder-si1000-finetune
- Modelo base Accurate: https://huggingface.co/nvidia/Ising-Decoder-SurfaceCode-1-Accurate
- Paper (Chamberland et al.): https://arxiv.org/abs/2604.12841
- Código de decodificación de NVIDIA: https://github.com/NVIDIA/Ising-Decoding
- Licencia NVIDIA Open Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-license/
