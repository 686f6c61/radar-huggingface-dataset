# Motubrain/MotuBrain2.0-EBench

## Resumen

MotuBrain2.0-EBench es una política de manipulación robótica de cuatro cámaras obtenida por fine-tuning del modelo base Motubrain2.0-Base, un modelo mundo-acción (world-action model) de aproximadamente 20.000 millones de parámetros desarrollado por Motubrain. El checkpoint resuelve la conversión de una representación base de tres vistas a una entrada de cuatro flujos de cámara sincronizados (vista superior, vista general y dos vistas de muñeca) para predecir secuencias de acciones (action chunks) en entornos de manipulación móvil y de mesa.

La relevancia del modelo reside en su resultado en EBench, un benchmark de manipulación robótica: alcanza un 73,5 % de tasa de éxito global y 83,5/100 de puntuación global sobre 510 episodios de simulación oficiales, repartidos en 19 tareas de manipulación móvil y 7 tareas diestras de sobremesa. Según la model card, es la política con mejor resultado global entre las comparadas en el informe, superando a la variante Nano en 11,0 puntos porcentuales de éxito.

El modelo se distribuye en formato safetensors con pesos en BF16 (39 GB de repositorio) y requiere componentes externos para la inferencia: el VAE de Wan2.2, el codificador de texto T5Gemma y Depth Anything 3. La licencia y los idiomas soportados no están declarados en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | World-action model (política de manipulación robótica multimodal); detalles internos no disponibles |
| Parametros totales | 19.524.185.191 (≈19,5 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (historial de observaciones con codificación `causal_5_to_2` y stride de 3) |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | no disponible (acepta instrucciones en lenguaje natural, idioma no especificado) |
| Licencia | no disponible |
| Formato de pesos | safetensors (PyTorch) |

## Arquitectura y entrenamiento

MotuBrain2.0-EBench es un fine-tuning del modelo base Motubrain2.0-Base, descrito por el autor como un world-action model de 20B. La política combina cuatro flujos de imagen sincronizados con una instrucción de lenguaje para predecir un action chunk. El ajuste parte de los tres embeddings de vista aprendidos del modelo base y añade un embedding inicializado aleatoriamente para la cámara superior. Las imágenes de vista general y superior se redimensionan a un área objetivo de 120.000 píxeles, mientras que cada imagen de muñeca usa 30.000 píxeles.

El entrenamiento consistió en 50.000 pasos de fine-tuning y los pesos publicados corresponden a la media móvil exponencial (EMA) del modelo. La inferencia integra explícitamente el VAE de Wan2.2-TI2V-5B, el codificador de texto T5Gemma-9B y Depth Anything 3 (DA3-LARGE-1.1), lo que sugiere una arquitectura de difusión condicionada por texto, profundidad y observaciones visuales, aunque el autor no detalla la composición interna del transformer ni el volumen de datos de entrenamiento. No se especifica si hubo RLHF, DPO u otras etapas de alineación.

## Capacidades

- Predicción de acciones robóticas en forma de action chunks a partir de observaciones visuales multi-cámara y una instrucción en lenguaje natural.
- Manipulación móvil: cubre 19 tareas de navegación y manipulación en EBench.
- Manipulación diestra de sobremesa: cubre 7 tareas de precisión con manos robóticas.
- Fusión de cuatro cámaras sincronizadas (vista superior, vista general y dos vistas de muñeca) con el texto de la instrucción.
- Codificación de historial temporal mediante `causal_5_to_2` con stride de 3.
- Salida con máscara de validez (`decoded_valid`) para las coordenadas de acción en unidades del controlador.
- Integración con el cliente de evaluación de EBench para rollouts en simulación.
- No se documentan capacidades de tool calling, agentes multi-paso, visión general, audio ni modo de razonamiento explícito.

## Casos de uso

- Manipulación móvil en simulación: el modelo se conecta al cliente de evaluación de EBench para ejecutar políticas sobre 19 tareas de navegación y manipulación, usando las cuatro cámaras y la instrucción como entrada.
- Tareas diestras de sobremesa: sirve para evaluar políticas de precisión en 7 tareas de mesa, donde las dos vistas de muñeca aportan la información espacial necesaria para el control fino.
- Investigación en world-action models: permite reproducir el protocolo de evaluación del autor y comparar variantes (Base, Nano) sobre el mismo conjunto de 510 episodios.
- Desarrollo de pipelines de robot learning: el checkpoint sirve como punto de partida para fine-tuning sobre nuevos perfiles de robot, sustituyendo el perfil EBench por la configuración del controlador propio.
- Evaluación comparativa de políticas: su tabla de resultados frente a π₀, π₀.₅, OpenWAM-α, PICA-WAM y otros permite usarlo como referencia en estudios de manipulación.
- Prototipado de control por lenguaje: la combinación de instrucción textual y observaciones visuales permite probar interfaces de control en lenguaje natural en entornos simulados antes de trasladarlas a hardware.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre EBench (510 episodios de simulación oficiales; SR = tasa de éxito, score sobre 100):

| Política | SR móvil (%) | Score móvil | SR sobremesa (%) | Score sobremesa | SR global (%) | Score global |
|---|---:|---:|---:|---:|---:|---:|
| **Motubrain 2.0-WAM (este release)** | **72,7** | **83,3** | **75,7** | **84,0** | **73,5** | **83,5** |
| Motubrain 2.0-WAM Nano | 64,5 | 78,0 | 57,1 | 71,3 | 62,5 | 76,2 |
| PICA-WAM | 67,5 | 78,3 | 45,0 | 66,3 | 61,4 | 74,9 |
| OpenWAM-α | 60,2 | 74,1 | 42,1 | 59,6 | 55,3 | 70,0 |
| Vela | 51,7 | 66,1 | 44,3 | 64,1 | 49,7 | 65,5 |
| InternW0-Δ | 55,0 | 70,0 | 33,6 | 55,2 | 49,2 | 66,0 |
| Qwen-RobotManip | 43,9 | 57,6 | 50,0 | 69,7 | 45,6 | 60,8 |
| π₀.₅ | 45,9 | 57,8 | 29,3 | 45,3 | 41,4 | 54,4 |
| InternVLA-A1.5 | 42,3 | 56,2 | 12,1 | 21,6 | 34,2 | 46,8 |
| π₀ | 34,0 | 46,8 | 32,9 | 49,4 | 33,7 | 47,5 |
| GigaBrain-0.7 | 31,6 | 41,4 | 37,9 | 59,0 | 33,3 | 46,0 |
| Cosmos3-Edge | 33,2 | 46,6 | 18,6 | 31,6 | 29,3 | 42,5 |
| Fast-WAM | 34,0 | 46,1 | 2,9 | 13,0 | 25,6 | 37,1 |
| X-VLA | 29,3 | 40,2 | 8,6 | 24,1 | 23,7 | 35,8 |

No se han publicado resultados de benchmarks de propósito general (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 19,5 B de parámetros en BF16, los pesos ocupan aproximadamente 39 GB; se necesita una GPU con al menos 40-48 GB de VRAM para cargar el modelo junto con los componentes auxiliares (VAE de Wan2.2, T5Gemma-9B y DA3-LARGE-1.1).
- GPU recomendadas: A100 80 GB, H100 80 GB o GPUs con 48 GB o más (por ejemplo, L40S, RTX 6000 Ada). La model card exige una máquina CUDA con soporte BF16.
- GPU de consumo: no cabe en GPUs de consumo de 24 GB (RTX 4090, RTX 3090) en BF16 sin cuantización, y no se documentan pesos cuantizados.
- Opciones de despliegue: inferencia offline mediante `python -m motubrain2.inference` con el extra `geometry` del repositorio de Motubrain; integración con el cliente de evaluación de EBench para simulación. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles. La inferencia usa un sampler Euler con 30 pasos, `video-shift` 6 y `action-shift` 1.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | SR global EBench (%) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Motubrain 2.0-WAM (este release) | ≈19,5 B | no disponible | 73,5 | no disponible | Hugging Face (safetensors) |
| Motubrain 2.0-WAM Nano | no disponible | no disponible | 62,5 | no disponible | misma familia |
| PICA-WAM | no disponible | no disponible | 61,4 | no disponible | no disponible |
| π₀.₅ | no disponible | no disponible | 41,4 | no disponible | no disponible |
| π₀ | no disponible | no disponible | 33,7 | no disponible | no disponible |

La comparación se limita a los datos de EBench publicados en la model card; no se dispone de parámetros, contexto ni licencia de las alternativas.

## Limitaciones y advertencias

- Licencia no declarada: no se puede confirmar el uso comercial ni las restricciones de redistribución.
- Idiomas no declarados: se desconoce el rendimiento de las instrucciones en castellano u otros idiomas distintos del usado en el entrenamiento.
- Evaluación exclusivamente en simulación (510 episodios de EBench); no se documentan pruebas en hardware físico.
- Requiere acceso aprobado a T5Gemma en Hugging Face y componentes externos (Wan2.2, DA3) para la inferencia, lo que añade dependencias y posibles fallos de integración.
- El perfil de robot y la normalización de acciones deben coincidir con los del entrenamiento (`causal_5_to_2`, stride 3); un perfil distinto puede degradar el rendimiento.
- Riesgo de alucinación y de acciones inválidas en entornos fuera de distribución; la salida incluye una máscara `decoded_valid` que debe comprobarse antes de ejecutar acciones.
- Sin datos publicados sobre sesgos, robustez ante cambios de iluminación, oclusiones o variaciones de cámara.
- El checkpoint es la EMA tras 50.000 pasos; no se documenta el número de tokens ni la composición del dataset de fine-tuning.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Motubrain/MotuBrain2.0-EBench
- Modelo base: https://huggingface.co/Motubrain/Motubrain2.0-Base
- Repositorio de código Motubrain 2.0: https://github.com/shengshu-ai/Motubrain-2.0
- Documentación de evaluación: https://github.com/shengshu-ai/Motubrain-2.0/blob/main/docs/evaluation.md#ebench
- Documentación de uso e instalación: https://github.com/shengshu-ai/Motubrain-2.0/blob/main/docs/usage.md
- Página de EBench: https://internrobotics.github.io/EBench-home/
- Documentación de EBench: https://internrobotics.github.io/EBench-doc/
- Codificador de texto T5Gemma: https://huggingface.co/google/t5gemma-9b-9b-prefixlm-it
