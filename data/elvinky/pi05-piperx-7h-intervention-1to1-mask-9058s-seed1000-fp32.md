# Elvinky/pi05-piperx-7h-intervention-1to1-mask-9058s-seed1000-fp32

## Resumen

Este repositorio contiene un checkpoint de inferencia de Pi0.5 PiperX, un modelo de visión-lenguaje-acción (VLA) para control robótico publicado por el usuario de Hugging Face Elvinky. Es un ajuste fino de parámetros completos sobre el modelo base Elvinky/pi05-piperx-7h-seed1000-fp32, que parte del paso 29.463 y acumula 9.058 pasos adicionales de entrenamiento para resolver una única tarea de manipulación: insertar un tornillo de cobre en una funda negra.

El propósito del ajuste es reparar los fallos del modelo de demostración original mediante aprendizaje a partir de intervenciones humanas, con un esquema tipo DAgger. Para ello combina, con muestreo estricto 1:1, los episodios de demostración originales y 115.937 fotogramas controlados por un operador humano, extraídos de 130 episodios y divididos en 831 segmentos continuos.

Con 4.143.404.816 parámetros (unos 4,14 mil millones), pesos en FP32 y un repositorio de 16,6 GB, es un artefacto de investigación orientado a la reproducibilidad: incluye manifiestos, estadísticas de normalización, hashes de código y registros de validación, pero no declara licencia ni aporta evaluaciones de éxito en la tarea real. Su interés actual radica en que documenta de forma trazable un ciclo completo de reparación por intervención humana sobre un modelo VLA concreto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo de visión-lenguaje-acción (VLA) para robótica, familia pi05; detalle del backbone no disponible |
| Parámetros totales | 4.143.404.816 (~4,14 mil millones) |
| Parámetros activos | No aplica (no se documenta una arquitectura MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible; los pesos se distribuyen en FP32 |
| Idiomas soportados | No disponible (modelo orientado a control robótico, sin capacidades de lenguaje documentadas) |
| Licencia | No disponible |
| Formato de pesos | safetensors (librería lerobot) |
| Horizonte de acción | 50 pasos |
| Dimensión de estado/acción | 14 |
| Cámaras de entrada | observation.images.base_0_rgb, observation.images.left_wrist_0_rgb, observation.images.right_wrist_0_rgb |
| Tamaño del repositorio | 16,6 GB |

## Arquitectura y entrenamiento

A partir de la información disponible, el modelo consume observaciones de tres cámaras RGB junto con un vector de estado de 14 dimensiones y produce secuencias de acciones (chunks) de horizonte 50 y dimensión 14, lo que corresponde a un modelo de visión-lenguaje-acción distribuido mediante la librería LeRobot. Los detalles internos del backbone, el mecanismo de atención, el número de tokens de preentrenamiento y la composición del corpus original no están documentados en la información proporcionada. El checkpoint deriva del modelo base Elvinky/pi05-piperx-7h-seed1000-fp32 (paso 29.463).

El ajuste se realizó con parámetros completos en FP32, con AMP y torch.compile desactivados y checkpointing de gradientes activado, sobre ocho GPU RTX PRO 6000. Se empleó un optimizador AdamW nuevo con learning rate de 2,5e-6 que decae hasta 2,5e-7, warmup de 200 pasos, betas (0,9, 0,95), epsilon 1e-8, weight decay 0,01 y recorte de gradiente de 1,0. El muestreo fue estricto 1:1 (4 ejemplos de demostración más 4 de intervención por GPU, batch global 64, semilla 1000), con un total de 9.058 actualizaciones; según el autor, esto equivale a unas 2,5 pasadas sobre el conjunto de intervención, no sobre el dataset combinado. El relleno temporal de acciones se enmascaró de la pérdida y se conservó la normalización original D7, registrando por separado las estadísticas de intervención.

Los datos de partida incluyen el subconjunto D7 de la semilla 1000 con 336 episodios y 754.251 fotogramas (6,9838 h) y la fuente de intervención (revisión 02f9b88) con 130 episodios y 692.704 fotogramas, de los cuales 115.937 (1 h 4 min 25 s a 30 FPS) son fotogramas controlados por humanos extraídos en 831 segmentos continuos, con un mínimo de 18 fotogramas. El stack utilizado fue LeRobot 0.6.1, PyTorch 2.11.0+cu128, torchvision 0.26.0+cu128, Transformers 5.5.4 y Accelerate 1.14.0. El entrenamiento finalizó el 15 de septiembre de 2026 con una pérdida registrada de 0,005 en el paso 9.050.

## Capacidades

- Generación de acciones de manipulación robótica: produce chunks de acción de horizonte 50 y dimensión 14 para el control de un brazo tipo PiperX.
- Percepción visual multicámara: procesa tres flujos RGB (cámara base y una por muñeca).
- Ejecución de una tarea concreta: insertar el tornillo de cobre en la funda negra.
- Aprendizaje por intervención humana: incorpora correcciones de un operador (esquema tipo DAgger) para reparar los fallos del modelo de demostración.
- Integración con LeRobot: compatible con LeRobot 0.6.1, con los procesadores guardados y los ficheros de tokenizer incluidos en la raíz del repositorio.
- Reproducibilidad: el repositorio incluye manifiestos de semilla, mapeo de segmentos de intervención, estadísticas de normalización, hashes de código, parches, comandos de entrenamiento, scripts y registros.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, tool calling, uso como agente ni multilingüismo. Tampoco se documenta visión más allá de las cámaras de control ni entrada de audio.

## Casos de uso

- Reproducción de experimentos de intervención humana: el repositorio incluye el manifiesto de semilla, el mapeo de segmentos y el comando de entrenamiento, lo que permite replicar el ajuste sobre el modelo base en un entorno LeRobot 0.6.1.
- Estudio de reparación de políticas: comparar este checkpoint con el modelo base (paso 29.463) para medir cuantitativamente el efecto de las 9.058 actualizaciones sobre una misma tarea.
- Automatización de la inserción de tornillos en una línea de montaje: el modelo controla directamente el brazo a partir de las tres cámaras y del estado de 14 dimensiones, sin necesidad de un pipeline de visión adicional.
- Exploración de estrategias de muestreo en DAgger: sirve como referencia de una configuración 1:1 entre demostración e intervención para contrastarla con proporciones alternativas.
- Base para nuevos ajustes finos en tareas de ensamblaje relacionadas (fijación de piezas, inserción de conectores), partiendo de un modelo ya especializado en manipulación precisa.
- Docencia y demostración de pipelines VLA de extremo a extremo: al integrarse en LeRobot, permite ilustrar el ciclo completo de datos, entrenamiento, validación y despliegue sobre hardware real.
- Auditoría de trazabilidad: los hashes de código, las estadísticas de normalización y el SHA256 del modelo permiten verificar que un despliegue en producción corresponde exactamente al artefacto publicado.
- Ensayo de protocolos de validación: los informes de recarga estricta de tensores y de inferencia con observaciones reales sirven como plantilla de control de integridad antes de desplegar un modelo VLA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que las comprobaciones realizadas son pruebas de integridad de software y no evaluaciones de éxito en la tarea robótica.

| Métrica | Valor | Nota |
|---|---|---|
| MMLU, HumanEval, GSM8K u otros benchmarks de lenguaje | No disponible | No aplicable a un modelo de control robótico |
| Tasa de éxito en la tarea | No disponible | No se realizaron evaluaciones de éxito |
| Pérdida final de entrenamiento | 0,005 | Registrada en el paso 9.050 |
| Recarga de tensores | 813 tensores recargados | Comprobación de integridad |
| Comprobación de pesos finitos | Superada | Comprobación de integridad |
| Inferencia en GPU con observación real | Superada | Forma de acción [1, 50, 14] |
| SHA256 del modelo | 3e503e24cca0507d000e67d058dabb7865ef044b274a425093eb7b2c1eb0cee0 | Verificación del artefacto |

## Requisitos de hardware

- Memoria de pesos: 4.143.404.816 parámetros en FP32 equivalen aproximadamente a 16,6 GB, cifra coherente con el tamaño del repositorio.
- VRAM estimada para inferencia: alrededor de 17-22 GB solo para pesos y buffers básicos; conviene reservar 24 GB o más para incluir activaciones y margen operativo.
- GPU recomendadas: el entrenamiento se realizó en ocho NVIDIA RTX PRO 6000; para inferencia basta una unidad de gama profesional o de centro de datos, como A100 (40/80 GB), H100 o L40S.
- GPU de consumo: una RTX 4090 o RTX 3090 con 24 GB podría alojar los pesos en FP32; en tarjetas de 16 GB sería necesario reconvertir a FP16/BF16, algo que no está documentado ni validado por el autor.
- Opciones de despliegue: LeRobot 0.6.1 sobre PyTorch con CUDA. No aplican vLLM, llama.cpp, Ollama ni TGI, ya que no se trata de un modelo de lenguaje.
- Configuración requerida: mapa de renombrado de cámaras a los nombres canónicos, procesadores guardados del repositorio y, para inferencia sin conexión, sobrescribir tokenizer_processor.tokenizer_name con la ruta local de descarga.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| pi05-piperx-7h-intervention-1to1-mask-9058s-seed1000-fp32 | 4,14 mil millones | No disponible | No disponible | Hugging Face (librería lerobot) | Ajuste por intervención sobre una tarea única |
| Elvinky/pi05-piperx-7h-seed1000-fp32 (modelo base) | No disponible | No disponible | No disponible | Hugging Face | Punto de partida en el paso 29.463, sin reparación por intervención |
| Otros modelos VLA comparables | No disponible | No disponible | No disponible | No disponible | No se han identificado alternativas comparables en la información proporcionada |

No se dispone de datos de rendimiento de los modelos comparados, por lo que la comparación se limita a la relación de derivación entre este checkpoint y su modelo base.

## Limitaciones y advertencias

- Modelo de tarea única: solo está ajustado para insertar el tornillo de cobre en la funda negra; no generaliza a otras tareas sin un nuevo ajuste fino.
- Ausencia de evaluación de éxito real: las pruebas documentadas verifican integridad de software y formas de salida, no que el robot complete la tarea.
- Licencia no declarada: sin licencia, el uso comercial queda en una situación jurídica indeterminada y no puede asumirse permiso de uso.
- Sin capacidades de lenguaje ni multilingüismo: no es un modelo conversacional ni un asistente de propósito general; no admite tool calling ni razonamiento multi-paso.
- Dependencia de hardware concreto: requiere un brazo tipo PiperX, la configuración exacta de tres cámaras y vectores de estado y acción de 14 dimensiones.
- Configuración obligatoria en inferencia: hay que aplicar el mapa de renombrado de cámaras y los procesadores guardados; en modo sin conexión debe sobrescribirse la referencia del tokenizer.
- Rutas específicas de máquina: los artefactos de reproducibilidad contienen rutas históricas que deben adaptarse en otro host.
- No incluye estados de optimizador ni de RNG: es una publicación de inferencia, no un paquete reanudable de entrenamiento.
- Huella de memoria elevada: los pesos en FP32 ocupan unos 16,6 GB, lo que dificulta el despliegue en GPU de gama baja.
- Riesgo de sobreajuste a las intervenciones: la exposición de 9.058 actualizaciones está calibrada sobre el conjunto de intervención, no sobre el dataset combinado.
- Seguridad física: al ser un modelo de control, sus salidas pueden producir acciones no válidas o inseguras; no se documentan sesgos, límites de seguridad ni mecanismos de parada.
- Sesgos: no documentados; dependerán de los datasets MINT-SJTU/RW-RL-Dataset y del conjunto de demostración e intervención empleados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Elvinky/pi05-piperx-7h-intervention-1to1-mask-9058s-seed1000-fp32
- Modelo base: https://huggingface.co/Elvinky/pi05-piperx-7h-seed1000-fp32
- Dataset de intervención: https://huggingface.co/datasets/Elvinky/pi05-piperx-7h-demo-dagger-full-episodes-20260914
- Dataset RW-RL: https://huggingface.co/datasets/MINT-SJTU/RW-RL-Dataset
- LeRobot (librería): https://github.com/huggingface/lerobot
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la información proporcionada.
