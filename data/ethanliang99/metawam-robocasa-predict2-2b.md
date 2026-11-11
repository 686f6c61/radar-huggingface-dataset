# Ethanliang99/MetaWAM-RoboCasa-Predict2-2B

## Resumen

MetaWAM-RoboCasa-Predict2-2B es un World Action Model (WAM) de robótica desarrollado por el grupo showlab (autor principal Guoqiang Liang) y presentado en el artículo "From Video Frames to Robot Meta-Frames: A Unified Latent Interface for World Action Models" (CoRL 2026). Se trata de un ajuste fino del modelo generativo de vídeo Cosmos-Predict2-2B-Video2World de NVIDIA, reorientado para predecir acciones de robot, estados futuros y valores a partir de observaciones visuales.

La innovación central es la representación en *meta-frames*: las señales de robot (tipo de tarea, propiocepción, chunks de acción, propiocepción futura y valores) se empaquetan en coeficientes fijos de bandas de canales disjuntas y se elevan a marcos compactos mediante una DCT inversa 2D. Esto permite entrenar política, modelo de mundo y predicción de valor en un único modelo de difusión de vídeo mediante máscaras conscientes de cada slot.

El checkpoint está entrenado específicamente sobre RoboCasa (24 tareas de cocina, 50 demostraciones por tarea) y se distribuye como pesos consolidados en bf16. Es relevante porque demuestra que un modelo de difusión de vídeo preentrenado a gran escala puede reutilizarse como interfaz latente unificada para control robótico, sin necesidad de arquitecturas específicas para cada tarea.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión de vídeo (base: Cosmos-Predict2-2B-Video2World) con interfaz latente de meta-frames |
| Parametros totales | 2B (heredados del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos distribuidos en bf16) |
| Idiomas soportados | no disponible (modelo orientado a instrucciones de tarea en robótica) |
| Licencia | NVIDIA Base Model License (heredada del modelo base) |
| Formato de pesos | `.pt` (PyTorch, bf16 consolidado) |

## Arquitectura y entrenamiento

El modelo parte de Cosmos-Predict2-2B-Video2World, un modelo de difusión de vídeo de 2.000 millones de parámetros de NVIDIA. Sobre esa base, MetaWAM introduce una interfaz latente unificada: en lugar de tratar las señales de robot como entradas separadas, las codifica como coeficientes de DCT 2D en bandas de canales disjuntas y las reconstruye como meta-frames compactos. El modelo de difusión aprende entonces a denoising conjunto de vídeo y meta-frames, con máscaras que seleccionan qué slot se predice en cada paso (política, modelo de mundo o valor).

El entrenamiento se realiza sobre RoboCasa, un benchmark de manipulación en cocina con 24 tareas y 50 demostraciones por tarea. No se especifican en la información disponible el número total de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO. El repositorio incluye estadísticas de normalización de acciones y propiocepción, así como embeddings T5 precomputados de las instrucciones de tarea, idénticos a los publicados con Cosmos Policy.

## Capacidades

- Predicción de acciones robóticas (action chunks) a partir de observaciones visuales e instrucciones de tarea.
- Modelado de mundo: predicción de estados futuros (propiocepción futura) condicionada por acciones.
- Predicción de valor (value estimation) para evaluación de políticas.
- Control multi-tarea en entornos de cocina (24 tareas de RoboCasa).
- Integración de instrucciones de lenguaje mediante embeddings T5 precomputados.
- Capacidad de generar trayectorias de acción en bucle cerrado con el config de inferencia `metawam_robocasa__inference`.
- No se documentan capacidades de tool calling, agentes multi-paso ni visión general fuera del dominio robótico.

## Casos de uso

- Manipulación robótica en cocina simulada: el modelo ejecuta las 24 tareas de RoboCasa (por ejemplo, abrir cajones, encender fogones) prediciendo chunks de acción a partir de la observación visual, adecuado por su entrenamiento específico en ese benchmark.
- Evaluación de políticas mediante predicción de valor: el slot de valor permite estimar la calidad de una trayectoria sin ejecutarla en el simulador, útil para selección de políticas en investigación.
- Modelado de mundo para planificación: la predicción de propiocepción futura permite simular rollouts internos y comparar acciones antes de ejecutarlas.
- Investigación en interfaces latentes unificadas: sirve como referencia para estudiar cómo empaquetar señales heterogéneas (acción, estado, valor) en un único modelo de difusión.
- Benchmarking reproducible: el script `test_robocasa.sh` ejecuta 24 tareas × 50 ensayos con semillas 195-197, lo que facilita comparaciones controladas entre métodos.
- Base para ajuste fino en nuevos dominios robóticos: al heredar el backbone de Cosmos-Predict2, puede reentrenarse con las estadísticas y embeddings de otro dataset siguiendo el mismo esquema de meta-frames.
- Generación de datos sintéticos de vídeo condicionados por acción: el componente de difusión de vídeo puede emplearse para aumentar demostraciones en entrenamiento de políticas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos consolidados en bf16 ocupan aproximadamente 4,4 GB, por lo que se requiere al menos ~6-8 GB de VRAM para cargar el modelo, más memoria adicional para el proceso de difusión y el estado del entorno.
- GPU recomendadas: no se especifican en la información disponible; por el tamaño (2B parámetros) cabría en GPUs de consumo con suficiente VRAM, pero no hay datos oficiales.
- Cabe en consumer GPU: probablemente sí en GPUs con 8-16 GB de VRAM, aunque no está confirmado en la documentación.
- Opciones de despliegue: el repositorio oficial proporciona scripts de inferencia (`scripts/test_robocasa.sh`) y un config de inferencia `metawam_robocasa__inference`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (orientados a LLMs).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MetaWAM-RoboCasa-Predict2-2B | 2B | no disponible | Robótica (RoboCasa) | NVIDIA Base Model License | Hugging Face |
| Cosmos-Predict2-2B-Video2World (base) | 2B | no disponible | Generación de vídeo | NVIDIA Base Model License | Hugging Face |
| Cosmos Policy | no disponible | no disponible | Robótica (política) | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente sobre RoboCasa (24 tareas de cocina); su generalización a otros entornos o tareas no está validada.
- Licencia NVIDIA Base Model License: es necesario revisar los términos del modelo base para uso comercial, ya que la licencia del checkpoint es "other" y remite a la del modelo original.
- No se documentan sesgos específicos, pero al ser un modelo entrenado en simulación, puede presentar un gap de sim-to-real no cuantificado.
- Riesgo de alucinación en la predicción de estados futuros y valores: al ser un modelo generativo, las predicciones pueden no ser físicamente consistentes.
- El formato de pesos es `.pt` (PyTorch), no safetensors ni GGUF, lo que limita su integración directa con herramientas estándar de inferencia de LLMs.
- No se especifican idiomas soportados ni capacidades multilingües; las instrucciones se procesan mediante embeddings T5 precomputados.
- Requiere el repositorio MetaWAM y su configuración de inferencia específica; no es un modelo plug-and-play.
- Sin descargas ni likes en el momento de la consulta, lo que indica ausencia de validación comunitaria independiente.

## Enlaces

- Hugging Face: https://huggingface.co/Ethanliang99/MetaWAM-RoboCasa-Predict2-2B
- Paper (arXiv): https://arxiv.org/abs/2611.14365
- Código: https://github.com/showlab/MetaWAM
- Documentación RoboCasa: https://github.com/showlab/MetaWAM/blob/main/ROBOCASA.md
- Modelo base: https://huggingface.co/nvidia/Cosmos-Predict2-2B-Video2World
