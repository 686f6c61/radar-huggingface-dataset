# frankmorales2020/nemotron-3.5-bolt-e4b-topo-governed-fineweb-gguf

## Resumen

`nemotron-3.5-bolt-e4b-topo-governed-fineweb-gguf` es una cuantización GGUF Q4_K_M del checkpoint `NVIDIA-Nemotron-3.5-Bolt-E4B-BF16` de NVIDIA, publicada por Frank Morales Aguilera (Sovereign Machine Laboratory, SOMALA). El artefacto integra el modelo base con un `lm_head.pt` propio gobernado por Topological Continual Backpropagation (Topo-CBP), una técnica que el autor presenta como libre de olvido catastrófico y con deriva de representación nula. El paquete pesa aproximadamente 5,34 GB y está pensado para ejecución en CPU convencional mediante `llama.cpp` y `llama-cpp-python`, sin necesidad de clústeres multi-GPU ni APIs en la nube.

El modelo declara arquitectura Gemma 4 con 7.518.069.290 parámetros totales, contexto de 65.536 tokens, 42 bloques de atención, dimensión de embedding de 2.560 y feed-forward de 10.240. Su orientación declarada es la de una puerta de seguridad supervisora para robótica encarnada y sistemas ciberfísicos, con énfasis en determinismo bare-metal, auditoría cinemática semántica y sellado de estado mediante SHA-256 en el host.

Es relevante ahora porque propone un patrón poco habitual: separar la auditoría semántica (red neuronal) del enclavamiento bit a bit (hardware del host), y demostrar que un modelo de 7,5 mil millones de parámetros puede ejecutarse en un techo de memoria declarado de ~8,1 GB RSS en CPU. Conviene señalar que las afirmaciones de invariancia topológica y deriva cero provienen exclusivamente de la model card del autor y no están contrastadas con evaluaciones independientes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma 4 (`gemma4`), transformer denso con 42 bloques de atención |
| Parametros totales | 7.518.069.290 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 65.536 tokens (evaluado a 2.048 para puertas de borde de baja latencia) |
| Tipos de cuantizacion | GGUF Q4_K_M (4 bits medio, GGUF v3, File Type 15) |
| Idiomas soportados | No disponible |
| Licencia | OpenMDW 1.1 (`openmdw-1.1`) |
| Formato de pesos | GGUF (contenedor `nemotron-3.5-bolt-topo-governed-Q4_K_M.gguf`, ~5,34 GB); el checkpoint fuente se distribuye en safetensors |
| Modelo base | `nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16` |
| Checkpoint fuente | `frankmorales2020/nemotron-3.5-bolt-e4b-topo-governed-fineweb` |
| Dimension de embedding | 2.560 |
| Dimension feed-forward | 10.240 |
| Mecanismo de gobierno | Topo-CBP con anclas de coordenadas primas y atenuación de Euler |
| Tamano del repositorio | 5,3 GB |
| Pipeline declarado | robotics |

## Arquitectura y entrenamiento

La arquitectura base es un transformer denso de tipo Gemma 4 con 42 bloques de atención, dimensión de embedding de 2.560 y capas feed-forward de 10.240, sobre el checkpoint BF16 de NVIDIA. Sobre esa base, el autor sustituye la cabeza de lenguaje por un `lm_head.pt` entrenado con Topological Continual Backpropagation (Topo-CBP). Este mecanismo acopla retropropagación continua con un gobernador topológico geométrico que ancla los parámetros fundamentales a coordenadas primas invariantes (P = {2, 3, 5, 7, 11, 13}) atenuadas por una constante de Euler (Λ ≈ 0,9785142874). La afirmación central es que la adquisición secuencial de datos se produce sobre dimensiones ortogonales válidas del manifold, de modo que la geometría de pesos previa queda intacta.

El autor no documenta el volumen de tokens de entrenamiento, la composición exacta del dataset (más allá de la referencia a FineWeb en el nombre del checkpoint), ni si hubo fases de RLHF, DPO o ajuste por preferencias. Tampoco se detalla el procedimiento de calibración de la cuantización Q4_K_M ni las métricas de perplejidad tras la cuantización. La innovación técnica declarada se limita al gobernador Topo-CBP y a la separación de responsabilidades entre auditoría semántica neuronal y enclavamiento bit a bit mediante hashing SHA-256 en el host. No se mencionan decodificación especulativa, atención lineal ni mecanismos híbridos SSM.

## Capacidades

- Generación de texto conversacional en formato instructivo, según el tag `conversational` del repositorio.
- Auditoría semántica de cinemática para robótica: el autor la describe como puerta de seguridad supervisora sobre políticas de control.
- Razonamiento multi-paso orientado a agentes, con demos específicos de ejecución agéntica en el repositorio de código del autor.
- Integración con ROS 2 mediante un ejecutor documentado (`nemotron_gguf_ros2_executor.ipynb`).
- Ejecución determinista en CPU bare-metal a través de `llama.cpp` y `llama-cpp-python`.
- Compatibilidad declarada con endpoints (`endpoints_compatible` en los tags de Hugging Face).
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Capacidades multimodales (visión, audio): no disponible en la información proporcionada.
- Cobertura multilingüe: no disponible; el repositorio no declara lista de idiomas.

## Casos de uso

- Puerta de seguridad en robótica encarnada: el modelo actúa como supervisor semántico que valida comandos cinemáticos antes de que se ejecuten en el controlador de bajo nivel, con el enclavamiento final delegado a latches hardware sellados por SHA-256. Es adecuado porque el autor lo diseña explícitamente para prevenir alucinaciones de límite de par y violaciones de frontera operativa.
- Adquisición secuencial de tareas sin reentrenamiento destructivo: en flotas de robots que reciben nuevas habilidades de forma incremental, Topo-CBP promete conservar las capacidades previas sin deriva de representación, evitando el olvido catastrófico que obligaría a reentrenar desde cero.
- Despliegue en NVIDIA Jetson Orin y Thor: con ~5,34 GB de pesos y un techo declarado de ~8,1 GB RSS, encaja en módulos embebidos de borde para inferencia local sin conectividad a la nube.
- Integración en pipelines ROS 2: el ejecutor documentado permite conectar la inferencia GGUF con topics y servicios de ROS 2 para tareas de planificación y validación de trayectorias.
- Simulación a real (sim-to-real) en Isaac Sim e Isaac Gym: el modelo puede emplearse como capa de verificación semántica entre la política entrenada en simulación y la ejecución física, filtrando comandos inconsistentes con los límites del robot.
- Automatización en PLCs industriales y sistemas ciberfísicos: la ejecución determinista en CPU x86/ARM con `llama.cpp` permite incrustar el modelo en entornos de control donde no se admite una GPU dedicada ni dependencias cloud.
- Asistente conversacional de borde con contexto largo: los 65.536 tokens de ventana permiten mantener historiales extensos de telemetría o incidencias en un único contexto, aunque el autor recomienda evaluar a 2.048 tokens para puertas de baja latencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni evaluaciones de robótica, y tampoco reporta perplejidad antes o después de la cuantización Q4_K_M. Las afirmaciones de deriva cero (Δ_drift = 0,000000000000) son una propiedad declarada del mecanismo Topo-CBP, no un resultado de benchmark reproducible con la información publicada.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el modo principal, que es ejecución en CPU; el repositorio declara un techo de memoria de ~8,1 GB RSS con el fichero GGUF de ~5,34 GB.
- GPU recomendadas: no especificadas por el autor; el artefacto está orientado a CPU x86/ARM y a módulos NVIDIA Jetson Orin/Thor.
- Cabe en GPU de consumo: no confirmado; el autor no documenta despliegue en RTX 4090, RTX 3090 ni similares. Por tamaño de pesos (5,34 GB en Q4_K_M), cabría en GPUs con 8 GB o más de VRAM si el runtime lo soporta, pero esto no está verificado en la información disponible.
- Opciones de despliegue: `llama.cpp`, `llama-cpp-python`, Ollama (etiquetado en el repositorio). No se mencionan vLLM ni TGI.
- Latencia y throughput: no disponibles. El autor solo indica que recomienda 2.048 tokens de contexto para puertas de borde de baja latencia, sin cifras de tokens por segundo.
- Requisito mínimo declarado: CPU convencional con 4 o más hilos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Enfoque |
|---|---|---|---|---|---|
| `frankmorales2020/nemotron-3.5-bolt-e4b-topo-governed-fineweb-gguf` | 7.518.069.290 | 65.536 | Q4_K_M GGUF | OpenMDW 1.1 | Gobernanza Topo-CBP para robótica de borde |
| `nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16` (base) | No disponible en la informacion | No disponible en la informacion | BF16 | No disponible en la informacion | Modelo fundacional de NVIDIA sin gobernador Topo-CBP |
| `frankmorales2020/nemotron-3.5-bolt-e4b-topo-governed-fineweb` (checkpoint fuente) | No disponible en la informacion | No disponible en la informacion | Safetensors (precisión completa) | No disponible en la informacion | Mismo gobierno Topo-CBP, sin cuantizar |

No se dispone de datos de benchmarks que permitan comparar rendimiento entre estas variantes ni frente a alternativas de otros laboratorios. La comparación se limita a parámetros, formato y licencia.

## Limitaciones y advertencias

- Las afirmaciones de olvido catastrófico nulo y deriva cero (Δ_drift = 0,000000000000) proceden únicamente de la model card del autor y no han sido verificadas de forma independiente en la información disponible.
- La licencia OpenMDW 1.1 es una licencia de pesos abiertos con términos propios; es imprescindible revisar el texto completo en openmdw.ai antes de cualquier uso comercial, ya que el repositorio la etiqueta simultáneamente como `other` y `openmdw-1.1`.
- No se documenta la lista de idiomas soportados, lo que impide garantizar calidad multilingüe en producción.
- No se publican métricas de perplejidad ni evaluaciones de calidad tras la cuantización Q4_K_M, por lo que se desconoce la degradación respecto al checkpoint BF16.
- El pipeline declarado es `robotics`, no `text-generation`; el uso como modelo conversacional general no está validado por el autor.
- El repositorio tiene un volumen bajo de adopción (604 descargas y 3 likes en la fecha de actualización), lo que reduce la base de validación comunitaria.
- La terminología de la model card (coordenadas primas, atenuación de Euler, invariancia certificada) no viene acompañada de derivaciones matemáticas ni de código de verificación en la información proporcionada.
- El contexto de 65.536 tokens está declarado, pero el autor solo reporta evaluación a 2.048 tokens; el comportamiento en ventanas largas no está documentado.
- No se especifican sesgos conocidos ni evaluaciones de seguridad o alineamiento.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/frankmorales2020/nemotron-3.5-bolt-e4b-topo-governed-fineweb-gguf
- Checkpoint fuente en Hugging Face: https://huggingface.co/frankmorales2020/nemotron-3.5-bolt-e4b-topo-governed-fineweb
- Modelo base en Hugging Face: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
- Codigo de cuantizacion GGUF: https://github.com/frank-morales2020/AST/blob/main/GGUF_NEMO.ipynb
- Demo agentica: https://github.com/frank-morales2020/AST/blob/main/nemotron_agentic_demo.ipynb
- Ejecutor ROS 2: https://github.com/frank-morales2020/AST/blob/main/nemotron_gguf_ros2_executor.ipynb
- Script de inferencia: https://github.com/frank-morales2020/AST/blob/main/inference3.py
- Articulo 1 (dilema estabilidad-plasticidad en silicio de borde): https://medium.com/ai-simplified-in-plain-english/the-architecture-of-permanence-resolving-the-stability-plasticity-dilemma-on-edge-silicon-for-14cb58e983d7
- Articulo 2 (de invariantes matematicos a seguridad ciberfisica): https://medium.com/ai-simplified-in-plain-english/the-architecture-of-permanence-from-mathematical-invariants-to-cyber-physical-safety-9488a6cba4e8
- Articulo 3 (IA soberana en el borde): https://medium.com/ai-simplified-in-plain-english/sovereign-ai-in-action-the-architecture-of-permanence-at-the-edge-e17d4c8ae20e
- Articulo 4 (determinismo en pipeline clinico multiagente): https://medium.com/ai-simplified-in-plain-english/the-architecture-of-determinism-governing-the-multi-agent-clinical-pipeline-5d83a08c36a7
