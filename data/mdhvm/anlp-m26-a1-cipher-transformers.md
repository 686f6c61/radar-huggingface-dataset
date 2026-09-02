# mdhvm/anlp-m26-a1-cipher-transformers

## Resumen

El modelo `mdhvm/anlp-m26-a1-cipher-transformers` es un conjunto de checkpoints de un Transformer encoder-decoder construido desde cero con operaciones fundamentales de PyTorch, sin utilizar módulos predefinidos como `nn.Transformer`, `nn.MultiheadAttention` o `nn.LayerNorm`. Fue desarrollado como parte de la asignatura Advanced NLP (ANLP) y está diseñado para descifrar un cifrado XOR de clave repetitiva, mapeando secuencias de bits cifrados a texto plano en inglés. El repositorio incluye cinco configuraciones (C1 a C5) que varían en un único componente arquitectónico, lo que permite realizar estudios de ablación controlados.

La relevancia de este modelo radica en su carácter didáctico y de investigación: permite comparar el impacto de distintas técnicas de posicionamiento, atención, normalización y tokenización en una tarea de secuencia a secuencia. Aunque no es un modelo de propósito general, su implementación desde cero y su diseño de ablación lo convierten en una herramienta útil para comprender los fundamentos de los Transformers y evaluar alternativas como RoPE, Grouped-Query Attention, RMSNorm o el enfoque Byte Latent Transformer (BLT). El tamaño del repositorio es de 0,1 GB y la licencia es MIT.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (construido desde cero en PyTorch) |
| Parametros totales | 5.162.496 – 9.339.904 según configuración (C1: 6.047.232, C2: 6.047.232, C3: 5.162.496, C4: 6.042.112, C5: 9.339.904) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (las secuencias de entrada son ventanas de 32 caracteres, equivalentes a 256 bits) |
| Tipos de cuantizacion | no disponible (los checkpoints se guardan como state_dict de PyTorch, sin cuantización publicada) |
| Idiomas soportados | no disponible (el texto plano de salida es inglés, pero no se declara soporte multilingüe) |
| Licencia | MIT |
| Formato de pesos | .pt (state_dict de PyTorch) |

## Arquitectura y entrenamiento

El modelo es un Transformer encoder-decoder implementado desde cero con operaciones básicas de PyTorch, sin recurrir a las capas predefinidas de la biblioteca. La entrada consiste en secuencias de 256 bits (32 caracteres) que representan el texto cifrado, y la salida es el texto plano correspondiente. El cifrado aplica un XOR con una clave de 8 bytes (`b"ANLP2026"`), y las ventanas de 32 caracteres se alinean con la fase de la clave para preservar la correspondencia.

Se proporcionan cinco configuraciones que difieren en un único componente respecto a la base C1:

- C1: base con codificación posicional sinusoidal, atención multi-cabeza estándar, LayerNorm y tokenización subword (BPE).
- C2: sustituye la codificación posicional por RoPE (Rotary Position Embedding).
- C3: emplea Grouped-Query Attention con 2 cabezas KV en lugar de atención multi-cabeza completa.
- C4: reemplaza LayerNorm por RMSNorm.
- C5: adopta un enfoque Byte Latent Transformer (BLT), sin tokenización explícita y con parcheo basado en entropía.

No se especifican detalles del conjunto de datos de entrenamiento, número de tokens, ni el uso de técnicas como RLHF o DPO. El entrenamiento se realizó con semillas 1337, 7 y 42, y los resultados reportados corresponden a la semilla 1337, mientras que el informe cita medias y desviaciones estándar sobre las tres semillas.

## Capacidades

- Descifrado de un cifrado XOR de clave repetitiva específico (clave `b"ANLP2026"`), convirtiendo secuencias de bits cifrados en texto plano en inglés.
- Generación de texto plano a partir de texto cifrado con alta precisión a nivel de bit y de secuencia, especialmente en la configuración C5 (BLT), que alcanza un 99,98 % de precisión de bits y 98,40 % de precisión de secuencia en el conjunto de prueba.
- Implementación de múltiples variantes arquitectónicas (RoPE, GQA, RMSNorm, BLT) que permiten estudiar el impacto de cada componente en el rendimiento.
- Capacidad de ejecutar sondas fuera de distribución (OOD) para evaluar la sensibilidad a la fase de la clave, como se indica en los archivos `results.json`.
- No dispone de capacidades de tool calling, agentes, visión, audio ni razonamiento multi-paso; es un modelo especializado en una tarea de transformación de secuencias.

## Casos de uso

- Investigación académica en arquitecturas de Transformers: el modelo permite comparar empíricamente el efecto de RoPE, GQA, RMSNorm y BLT en una tarea de secuencia a secuencia, lo que resulta útil para estudiantes e investigadores que estudian diseño de modelos.
- Evaluación de técnicas de normalización y atención: las configuraciones C2, C3 y C4 ofrecen un banco de pruebas controlado para medir la influencia de cada componente en la precisión y el número de parámetros.
- Estudio de tokenización libre (BLT): la configuración C5 demuestra que un enfoque sin tokens, basado en parcheo por entropía, puede superar a las variantes con BPE en esta tarea, lo que sirve como referencia para investigaciones sobre modelos de bytes.
- Pruebas de robustez ante cambios de fase de clave: los resultados de las sondas OOD permiten analizar si el modelo generaliza correctamente cuando la alineación de la ventana no coincide con la fase de la clave.
- Demostración de implementación desde cero: el código fuente (incluido en el repositorio) es un recurso didáctico para aprender a construir un Transformer sin depender de módulos de alto nivel.
- Reproducibilidad de experimentos de ablación: al proporcionar checkpoints, métricas y curvas de entrenamiento, el modelo facilita la replicación de los resultados y la extensión del estudio con nuevas variantes.

## Benchmarks y rendimiento

La model card incluye resultados de precisión en el conjunto de prueba para cada configuración, correspondientes a la semilla 1337. No se proporcionan benchmarks estándar como MMLU, HumanEval o GSM8K, ya que la tarea es específica (descifrado de un cifrado XOR). Los resultados son los siguientes:

| Configuración | Precisión de bits (%) | Precisión de secuencia (%) | Parámetros |
|---|---|---|---|
| C1 (base) | 95,74 | 68,00 | 6.047.232 |
| C2 (RoPE) | 95,67 | 66,50 | 6.047.232 |
| C3 (GQA) | 94,96 | 60,75 | 5.162.496 |
| C4 (RMSNorm) | 95,63 | 66,25 | 6.042.112 |
| C5 (BLT) | 99,98 | 98,40 | 9.339.904 |

El informe de la asignatura cita medias y desviaciones estándar sobre las semillas 1337, 7 y 42, pero esos valores no se incluyen en la model card. La configuración C5 destaca claramente por su precisión, aunque con un mayor número de parámetros.

## Requisitos de hardware

- VRAM estimada: con un máximo de 9,3 millones de parámetros, el modelo requiere menos de 40 MB en precisión fp32 y menos de 20 MB en fp16. Cabe en cualquier GPU con al menos 1 GB de VRAM, incluso en GPUs integradas.
- GPU recomendadas: cualquier GPU moderna, incluidas las de gama de consumo como RTX 3060, RTX 4090, o incluso CPUs, dado el tamaño reducido.
- Opciones de despliegue: al ser checkpoints de PyTorch, se puede cargar con el código proporcionado en el repositorio. No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI, pero al ser un modelo pequeño, podría exportarse a ONNX o ejecutarse directamente con PyTorch.
- Latencia y throughput: no se proporcionan datos específicos, pero dado el tamaño, la inferencia es prácticamente instantánea en hardware moderno.

## Comparativa con modelos similares

Existen otros repositorios de la misma asignación que contienen checkpoints similares, como `satyam-arora-iiit-hyderabad/anlp-m26-a1-checkpoints` y `abhirajratna/2024114011-anlp-a1`. Sin embargo, no se dispone de detalles sobre sus configuraciones o resultados en la información proporcionada. No se conocen modelos comerciales o de propósito general comparables, ya que este es un modelo de investigación específico para una tarea de cifrado. Por tanto, la comparativa se limita a las variantes internas del propio repositorio.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para descifrar un cifrado XOR con una clave fija (`b"ANLP2026"`). No generaliza a otros cifrados, claves o formatos de entrada.
- No es un modelo de lenguaje de propósito general; no puede realizar tareas de generación de texto libre, razonamiento, código o conversación.
- La precisión de secuencia es notablemente inferior a la precisión de bits en las configuraciones C1-C4, lo que indica que el modelo comete errores a nivel de secuencia completa incluso cuando la mayoría de los bits son correctos.
- No se han publicado evaluaciones de sesgos, alucinaciones o comportamientos fuera de la tarea específica, por lo que no se puede garantizar su comportamiento en otros contextos.
- La licencia MIT permite uso comercial, pero el modelo carece de utilidad práctica fuera del ámbito académico debido a su especialización extrema.
- El repositorio no incluye documentación sobre el conjunto de datos de entrenamiento, lo que limita la reproducibilidad completa del estudio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mdhvm/anlp-m26-a1-cipher-transformers
- Repositorio de checkpoints de la misma asignación (satyam-arora-iiit-hyderabad): https://huggingface.co/satyam-arora-iiit-hyderabad/anlp-m26-a1-checkpoints
- Repositorio de checkpoints de la misma asignación (abhirajratna): https://huggingface.co/abhirajratna/2024114011-anlp-a1
- Código de la asignatura ANLP (CMU L3): https://github.com/cmu-l3/anlp-fall2025-code/tree/main/05_transformers
