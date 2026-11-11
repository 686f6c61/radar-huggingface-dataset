# snupilab/Rep4Act-Symmetric-MMDiT-4B-Pretrained-100k-seed0

## Resumen

Rep4Act-Symmetric-MMDiT-4B-Pretrained-100k-seed0 es un modelo de política robótica (robotics policy) preentrenado desarrollado por el laboratorio snupilab y publicado en Hugging Face bajo el pipeline `robotics`. El nombre indica que emplea una arquitectura MMDiT (Multi-Modal Diffusion Transformer, la misma familia usada en generadores de imagen como Stable Diffusion 3) con sesgo inductivo "simétrico", preentrenado sobre 100.000 muestras y con semilla 0, dentro de un programa de preentrenamiento denominado Rep4Act orientado a imitación de comportamiento (behavior cloning) mediante difusión.

El modelo resuelve el problema de disponer de una política de imitación genérica y preentrenada que pueda afinarse para tareas de manipulación robótica, en lugar de entrenar desde cero para cada tarea. Con 5.781.184.033 parámetros reales (alrededor de 5,8 mil millones, pese al "4B" del nombre), es un modelo grande para el estándar de políticas de imitación, lo que lo sitúa en la categoría de modelos fundacionales de robótica que consumen observaciones multimodales (típicamente imágenes de cámaras y estado proprioceptivo) y generan secuencias de acciones.

Su relevancia radica en la combinación de difusión multimodal con un preentrenamiento a escala de 100.000 episodios y en la publicación de pesos en safetensors. No obstante, el acceso está restringido (gated) y no se han publicado ni la licencia, ni los idiomas, ni resultados de benchmarks en la información disponible, por lo que su evaluación práctica requiere solicitar acceso y ejecutar pruebas propias.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MMDiT (Multi-Modal Diffusion Transformer) con sesgo simétrico, según nomenclatura del modelo; detalles no disponibles |
| Parámetros totales | 5.781.184.033 |
| Parámetros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Pipeline | robotics (política de imitación) |
| Preentrenamiento | 100.000 muestras, semilla 0 |
| Tamaño del repositorio | 19,4 GB |
| Acceso | restringido (gated) |

## Arquitectura y entrenamiento

El nombre del modelo indica una arquitectura Multi-Modal Diffusion Transformer (MMDiT), es decir, un transformer que procesa de forma conjunta modalidades heterogéneas (típicamente observaciones visuales y estado del robot) y genera acciones mediante un proceso de difusión. El calificativo "Symmetric" sugiere un diseño con pesos o flujos simétricos entre modalidades o entre el encoder de observación y el decoder de acciones, aunque no se ha publicado documentación técnica que lo confirme en la información disponible.

El preentrenamiento se realizó sobre 100.000 muestras (presumiblemente episodios o trayectorias de demostración) con semilla 0, lo que indica un experimento reproducible dentro de una familia de variantes Rep4Act. No se dispone de información sobre el número de tokens, la composición del dataset, el uso de RLHF o DPO, ni innovaciones como decodificación especulativa. Tampoco se detalla si el entrenamiento es de difusión estándar (DDPM) o de flujo (flow matching).

## Capacidades

- Generación de acciones robóticas: el pipeline `robotics` indica que el modelo produce comandos de control (posiblemente secuencias de acciones de efector final o articulaciones) a partir de observaciones.
- Procesamiento multimodal: la arquitectura MMDiT está diseñada para combinar entradas visuales y de estado; no se especifica la modalidad exacta (RGB, profundidad, propriocepción).
- Preentrenamiento para fine-tuning: sirve como inicialización para políticas de imitación en tareas específicas.
- Reproducibilidad por semilla: la variante seed0 permite replicar el preentrenamiento.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible; no es un modelo de lenguaje conversacional.
- Capacidades multilingües: no aplicable / no disponible.
- Modo thinking, visión o audio como LLM: no disponible.

## Casos de uso

- Manipulación robótica de laboratorio: usar el modelo como política inicial y afinarlo con demostraciones locales para tareas de pick-and-place, reduciendo el número de episodios necesarios frente a entrenar desde cero.
- Investigación en imitación de comportamiento: servir de baseline preentrenado para comparar variantes de difusión, arquitecturas y estrategias de aumento de datos en entornos simulados.
- Transferencia sim-to-real: preentrenar o ajustar en simulador (por ejemplo, robosuite o Isaac Gym) y validar la política en un brazo real, aprovechando el preentrenamiento a 100.000 muestras como regularizador.
- Benchmarking de políticas fundacionales: comparar el rendimiento de esta política con otras de la misma categoría (por ejemplo, Diffusion Policy o ACT) en tareas estandarizadas.
- Generación de trayectorias para data augmentation: emplear las muestras generadas por la política como datos sintéticos adicionales para entrenar políticas más pequeñas.
- Docencia y prototipado: como ejemplo reproducible (seed0) de pipeline completo de difusión para robótica, desde la carga de safetensors hasta la ejecución en un entorno de control.
- Experimentos de robustez: evaluar la sensibilidad del modelo a perturbaciones en la observación (ruido de cámara, cambios de iluminación) y su capacidad de generalización entre objetos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 11,6 GB solo para pesos (5,78 mil millones de parámetros × 2 bytes), más activaciones y buffers de difusión; en la práctica se recomienda al menos 24 GB para comodidad.
- VRAM estimada en FP32: aproximadamente 23,1 GB solo para pesos.
- Cuantización: no se han publicado versiones GGUF ni cuantizadas; no disponible.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para FP16 con margen limitado.
- Consumer GPU: cabe en RTX 4090 y, con cuantización agresiva (si se generara), potencialmente en GPUs de 16 GB; no hay versiones oficiales cuantizadas.
- Opciones de despliegue: carga directa con `transformers`/`safetensors`; no consta soporte específico de vLLM, llama.cpp, Ollama o TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles; en políticas de difusión la latencia depende del número de pasos de denoising, que no se especifica.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Rep4Act-Symmetric-MMDiT-4B (este) | 5,78 B | no disponible | Política de imitación por difusión | no disponible | Gated en HF |
| Diffusion Policy (Chi et al.) | ~decenas de M | no disponible | Política de imitación por difusión | código abierto (MIT, según repo) | Pública en GitHub |
| ACT / ALOHA (Zhao et al.) | ~80 M | no disponible | Imitación con transformer | código abierto | Pública en GitHub |
| OpenVLA | ~7 B | no disponible | VLA para manipulación | licencia abierta (según repo) | Pública en HF |

La comparación cuantitativa de rendimiento no está disponible para este modelo; las alternativas se citan por categoría y tamaño, no por resultados medidos en las mismas tareas.

## Limitaciones y advertencias

- Licencia no especificada: no se puede confirmar el uso comercial; el acceso está restringido y requiere aceptar condiciones en Hugging Face.
- Sin documentación técnica publicada: no hay paper, model card detallada ni benchmarks en la información disponible, lo que impide validar afirmaciones sobre arquitectura o rendimiento.
- Riesgo de sobreajuste al dataset de preentrenamiento de 100.000 muestras; la generalización a objetos, entornos o robots distintos no está documentada.
- Sin información sobre sesgos: al ser un modelo de robótica, los sesgos relevantes serían de distribución de datos (entornos, objetos, morfologías) y no están evaluados.
- Riesgo de fallo silencioso en producción: una política de imitación puede generar acciones plausibles pero incorrectas ante observaciones fuera de distribución; se requiere supervisión y límites de seguridad en el robot.
- Idiomas y contexto no disponibles: no aplicable como modelo de lenguaje, pero limita su uso en interfaces conversacionales.
- Repositorio de 19,4 GB: requiere almacenamiento y ancho de banda considerables, y el acceso gated añade fricción para equipos.
- Fecha de creación indicada como 2026-11-11, posterior a la fecha habitual de consulta; verificar la vigencia del repositorio antes de integrarlo.

## Enlaces

- Hugging Face: https://huggingface.co/snupilab/Rep4Act-Symmetric-MMDiT-4B-Pretrained-100k-seed0
- Paper, blog, repositorio o demo oficiales: no disponibles en la información proporcionada.
