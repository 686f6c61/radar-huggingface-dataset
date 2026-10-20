# IXDLI/pusht-parallel-grn-seed0

## Resumen

`IXDLI/pusht-parallel-grn-seed0` es una política de imitación para robótica entrenada sobre la tarea PushT (empuje de una pieza en 2D), publicada como checkpoint final de un experimento de reproducción controlada. La desarrolla el usuario IXDLI y se distribuye en HuggingFace Hub con pipeline `robotics` y licencia no especificada. No es un modelo de lenguaje: es una política de difusión que consume observaciones visuales de 96×96 píxeles RGB más la posición XY del agente, y emite comandos de posición XY.

El modelo parte de la receta de Diffusion Policy (DP) con el split original de 90 demostraciones y su normalización, y sustituye el backbone convolutional por bloques DiT (Diffusion Transformer) con condicionamiento adaptado del trabajo de Dasari et al., sobre un encoder RGB compartido. Sobre esa base se aplica GRN como adaptación en el dominio de la acción, con una cabeza temporal configurable de mayor tamano, y se incorporan las constantes de la variante Tube DP (TDP) derivadas del paper arXiv:2604.23609, cuyos autores no han liberado código ni todos los hiperparámetros de PushT.

El interés es fundamentalmente metodológico: se trata de un entrenamiento desde cero con 512.400 actualizaciones del optimizador a batch efectivo 64, AdamW con learning rate 1e-4 y schedule coseno con 500 pasos de warmup, y EMA final. El autor publica explícitamente el checkpoint final independientemente de su puntuación en test (no hay selección por test), lo que lo hace útil como punto de comparación reproducible y honesto frente a resultados seleccionados a posteriori.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de difusión (diffusion policy) con backbone basado en bloques DiT y cabeza temporal configurable; adaptación GRN en el dominio de la acción; encoder RGB compartido |
| Parametros totales | no disponible |
| Longitud de contexto | No aplica (no es un modelo de lenguaje). Configuración: 2 observaciones de entrada, horizonte de predicción de 16 pasos, horizonte de ejecución de 8 pasos |
| Tipos de cuantizacion | no disponible (checkpoint PyTorch `policy.pt`; no se documentan versiones cuantizadas) |
| Idiomas soportados | no disponible (modelo de robótica, sin interfaz de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`policy.pt`) + código de inferencia en `inference_source.tar.gz`; repo de 0.1 GB |
| Entrada | `{"pixels": uint8[96,96,3], "agent_pos": float[2]}` |
| Salida | Comandos de posición XY (`action_xy`) |
| Pasos de difusión en inferencia | `nfe=10` (configurable en el controlador) |

## Arquitectura y entrenamiento

La política sigue el paradigma de difusión de acciones: se genera una trayectoria de acciones mediante un proceso de difusión iterativo condicionado por la observación. En esta variante, el denoiser se construye con bloques DiT con el condicionamiento de Dasari et al., adaptados a un encoder RGB compartido para PushT; no se emplea un VLA preentrenado. Sobre esa arquitectura se aplica GRN como adaptación específica del dominio de la acción, con una cabeza temporal configurable de mayor tamano que la del baseline. Adicionalmente se incorporan los elementos de Tube DP descritos en arXiv:2604.23609: constantes de contracción y ruido, interpolación continua y el *lift* de acción a U-Net, que son decisiones explícitas de implementación del autor al no estar publicadas por los autores de TDP.

El entrenamiento se realizó desde cero durante 512.400 actualizaciones del optimizador con batch efectivo 64 (el último epoch puede tener un batch menor), AdamW con learning rate 1e-4, schedule coseno con 500 pasos de warmup y EMA. Los datos son el split original de 90 demostraciones de PushT con la normalización original de DP, sobre el archivo lossless de DP. La evaluación periódica de checkpoints reporta la puntuación de test tal como en el paper, pero la política publicada es la EMA final y no el mejor checkpoint seleccionado por test; el JSON de evaluación separa la recompensa máxima media de la tasa de éxito estricta. El entorno es `gym-pusht` moderno, que preserva el orden de reset del estado legado pero no es el entorno DP original archivado; la versión empleada queda registrada.

## Capacidades

- Control visuomotor de manipulación 2D: genera comandos de posición XY para empujar la pieza T hacia la pose objetivo a partir de imagen RGB de 96×96 y posición del agente.
- Política de difusión con horizonte de predicción de 16 acciones y ejecución de 8, lo que permite replanificación periódica dentro del episodio.
- Acondicionamiento multimodal simple: fusión de observación visual (píxeles) y estado proprioceptivo (XY del agente) en dos observaciones de entrada.
- Inferencia determinista configurable mediante número de pasos de difusión (`nfe`), con `nfe=10` como valor documentado.
- Adaptación GRN en el dominio de la acción, con cabeza temporal de mayor capacidad que el baseline DP.
- No soporta tool calling, function calling, agentes multi-paso, ni capacidades de lenguaje, visión general o audio: el espacio de salida está limitado a acciones de dos dimensiones.

## Casos de uso

- Reproducción controlada de experimentos de Diffusion Policy en PushT: sirve como referencia ejecutable con split de 90 demostraciones y normalización originales para comparar variantes de backbone bajo un protocolo fijo de 512.400 actualizaciones.
- Ablación de la cabeza temporal GRN: al ser una adaptación en el dominio de la acción con cabeza configurable, permite medir el efecto de aumentar la capacidad temporal frente al baseline DP manteniendo el resto del pipeline constante.
- Estudios de varianza entre semillas: el identificador `seed0` y la política de publicar el checkpoint final sin selección por test facilitan análisis de dispersión de resultados entre inicializaciones.
- Evaluación de componentes de Tube DP: las constantes de contracción, ruido, interpolación continua y *lift* de acción están expuestas en `config.json`, lo que habilita barridos sistemáticos sobre esos hiperparámetros en una tarea barata de simulación.
- Banco de pruebas de pipelines de evaluación en robótica: el JSON de evaluación separa recompensa máxima media y tasa de éxito estricta, útil para construir *harnesses* que reporten ambas métricas de forma consistente.
- Prototipado de controladores de empuje en 2D antes de trasladar la receta a manipulación real: la interfaz `PushTController` con `reset()` por episodio y salida XY es directamente integrable en bucles de simulación.
- Docencia y divulgación técnica: ejemplo completo de política de difusión con backbone transformer, código de inferencia autocontenido y pesos ligeros (repo de 0.1 GB) aptos para ejecutarse en un equipo con GPU de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que el JSON de evaluación reporta la recompensa máxima media por separado de la tasa de éxito estricta, y que el checkpoint final se publica con independencia de su puntuación en test, pero no incluye cifras concretas de éxito ni comparaciones numéricas con DP, TDP u otras variantes.

## Requisitos de hardware

- VRAM estimada: no disponible. El repositorio completo ocupa 0.1 GB y la política es un modelo compacto de visión y difusión, por lo que la inferencia es viable en GPU de consumo, pero no se documenta una cifra de memoria.
- GPU recomendadas: no disponible. El código de carga usa `device="cuda"` con PyTorch y torchvision compatibles con CUDA; no se especifican modelos de GPU concretos (A100, H100, RTX 4090, etc.).
- GPU de consumo: previsiblemente sí, dado el tamano del checkpoint y los 10 pasos de difusión por acción, aunque no hay confirmación explícita del autor.
- Opciones de despliegue: script propio `pusht_parallel.inference` (`load_policy` + `PushTController`), previa instalación de `requirements.txt` y extracción de `inference_source.tar.gz`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que además no aplican a este tipo de política.
- Latencia y throughput: no disponible. El coste por paso de control depende de `nfe` (10 por defecto) y de la frecuencia de replanificación derivada del horizonte de ejecución de 8 acciones, pero no se publican medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Observacion / contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PushT GRN, seed 0 (este modelo) | no disponible | RGB 96×96 + XY del agente; 2 observaciones; predicción 16 / ejecución 8 | No se publican cifras en la informacion disponible | no disponible | Pesos en HF (`policy.pt`) + código de inferencia |
| Diffusion Policy (DP) original, config CNN para PushT | no disponible | Split de 90 demostraciones de PushT, misma normalización | No disponible en esta informacion | no disponible | Configuración pública en diffusion-policy.cs.columbia.edu; código y pesos del paper |
| Tube DP (TDP), arXiv:2604.23609 | no disponible | Derivado del paper; hiperparámetros de PushT incompletos | No disponible en esta informacion | no disponible | Sin código ni hiperparámetros completos liberados por los autores, segun la model card |
| DiT-Block Policy (Dasari et al.) | no disponible | Condicionamiento DiT-Block reutilizado aquí sobre encoder RGB compartido | No disponible en esta informacion | no disponible | Repositorio público `SudeepDasari/dit-policy` |

## Limitaciones y advertencias

- Alcance restringido a una única tarea: PushT en simulación 2D, con salida limitada a comandos de posición XY. No es un modelo general de robótica ni un VLA.
- Entrenado con solo 90 demostraciones del split original, lo que limita la cobertura de estados y aumenta la sensibilidad a cambios de distribución visual o de dinámica.
- Entorno no idéntico al original: se usa `gym-pusht` moderno, que preserva el orden de reset legado pero no es el entorno DP archivado; los resultados no son directamente comparables con las cifras del paper.
- El checkpoint publicado es la EMA final y no el mejor checkpoint seleccionado por test; el autor advierte explícitamente que la comparación RGB controlada no pretende reproducir las puntuaciones reportadas en el paper.
- Semilla única (`seed0`): no hay evidencia de robustez entre inicializaciones ni intervalos de confianza.
- Componentes de TDP implementados por el autor ante la falta de código oficial (constantes de contracción y ruido, interpolación continua, *lift* de acción a U-Net), lo que introduce divergencias no cuantificadas respecto al método original.
- Riesgo de alucinación no aplica en el sentido de modelos de lenguaje, pero sí existe riesgo de acciones erróneas o bloqueos ante observaciones fuera de distribución, sin mecanismo de abstención documentado.
- Licencia no disponible: no se puede asumir permiso para uso comercial, redistribución o despliegue en producción sin contactar con el autor.
- Requiere llamar a `controller.reset()` antes de cada episodio; omitirlo puede producir estados inconsistentes.
- Sin métricas de latencia ni de éxito publicadas, no es posible estimar su viabilidad en un lazo de control real sin evaluarlo previamente.
- Transferencia sim-a-real no evaluada: no hay evidencia de funcionamiento en hardware físico.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/IXDLI/pusht-parallel-grn-seed0
- Paper de Tube DP: https://arxiv.org/abs/2604.23609
- Configuración del experimento original de Diffusion Policy en PushT: https://diffusion-policy.cs.columbia.edu/data/experiments/image/pusht/diffusion_policy_cnn/config.yaml
- Repositorio DiT-Block Policy (Dasari et al.): https://github.com/SudeepDasari/dit-policy
- Repositorio GRN: https://github.com/bytedance/GRN
- Registro del experimento en Weights & Biases: https://wandb.ai/yuyuan-wu-universiteit-gent/policy%20parallel%20test/runs/pusht-parallel-20261019-s0-grn-s0
