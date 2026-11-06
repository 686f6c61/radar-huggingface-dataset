# frankmorales2020/nemotron-3.5-bolt-e4b-topo-governed-fineweb-gguf

## Resumen

Nemotron-3.5-Bolt-E4B Topo-Governed FineWeb GGUF es una cuantización GGUF (Q4_K_M) del modelo NVIDIA Nemotron-3.5-Bolt-E4B-BF16, publicada por Frank Morales Aguilera a través de su laboratorio Sovereign Machine Laboratory (SOMALA). El repositorio combina los pesos cuantizados en 4 bits con un checkpoint personalizado de la capa de salida (`lm_head.pt`) gobernado por un mecanismo propio denominado Topological Continual Backpropagation (Topo-CBP), que según el autor elimina el olvido catastrófico y el desplazamiento de representaciones durante el aprendizaje continuo sobre el corpus FineWeb.

La propuesta central del modelo es resolver el dilema estabilidad-plasticidad: en lugar de reentrenar libremente los pesos, el autor ancla la dinámica de los parámetros a coordenadas invariantes basadas en números primos (P = {2, 3, 5, 7, 11, 13}) con un factor de atenuación de Euler (Λ ≈ 0,9785142874), de modo que el ajuste secuencial ocurre supuestamente en dimensiones ortogonales del manifold sin alterar la geometría de los pesos fundacionales. El autor reporta un desplazamiento de representación nulo (Δ_drift = 0,000000000000), aunque estos resultados provienen únicamente de su propia batería de validación y no han sido verificados de forma independiente.

El caso de uso principal que describe la model card es la ejecución en CPU de prestaciones reducidas (bare-metal) como puerta de supervisión de seguridad para robótica embodied y sistemas ciberfísicos, con compatibilidad declarada con estándares como DO-178C (aviónica) e ISO 26262 (ASIL-D). Con unos 7.518 millones de parámetros, 65.536 tokens de contexto y un archivo de ~5,34 GB, es un candidato interesante para inferencia local en edge, aunque conviene tratar con escepticismo las afirmaciones de certificación, dado que son declaraciones del autor y no certificaciones oficiales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma 4 (`gemma4`), base NVIDIA Nemotron-3.5-Bolt-E4B |
| Parametros totales | 7.518.069.290 (dato real de safetensors) |
| Parametros activos | no disponible (el sufijo "E4B" sugiere arquitectura MoE con ~4B activos, pero no esta confirmado en la informacion proporcionada) |
| Longitud de contexto | 65.536 tokens (evaluado a 2.048 para puertas de baja latencia en edge) |
| Tipos de cuantizacion | Q4_K_M (GGUF v3, 4 bits medios, File Type 15) |
| Idiomas soportados | no disponible |
| Licencia | openmdw-1.1 (OpenMDW, etiquetada como "other" en Hugging Face) |
| Formato de pesos | GGUF (~5,34 GB) y safetensors en el checkpoint derivado |

Datos adicionales de la model card:

| Parametro | Valor |
|---|---|
| Embedding length | 2.560 |
| Feed-forward length | 10.240 |
| Capas de atencion | 42 |
| Modelo base | nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16 |
| Framework gobernante | Topo-CBP (anclas primas y atenuacion de Euler) |
| Techo de memoria declarado | ~8,1 GB RSS en CPU |

## Arquitectura y entrenamiento

La arquitectura base es NVIDIA Nemotron-3.5-Bolt-E4B, implementada sobre la arquitectura Gemma 4 (`gemma4`), con 42 capas de atencion, longitud de embedding de 2.560 y longitud feed-forward de 10.240. La model card no detalla si la variante E4B es una mezcla de expertos (MoE) ni cuantos parametros estan activos por token, por lo que ese dato no esta disponible.

El ajuste se realizo sobre el corpus FineWeb mediante el framework Topo-CBP (Topological Continual Backpropagation), desarrollado en SOMALA. Segun el autor, este mecanismo acopla la retropropagacion continua con un gobernador geometrico topologico que usa anclas de coordenadas primas invariantes (P = {2, 3, 5, 7, 11, 13}) atenuadas por el factor de Euler (Λ ≈ 0,9785142874). La consecuencia declarada es que el aprendizaje secuencial ocurre a lo largo de dimensiones ortogonales validas del manifold, sin modificar la geometria de los pesos fundacionales ni degradar capacidades previas. La model card tambien describe una separacion de responsabilidades: la auditoria cinematica semantica corre en la red neuronal, mientras que los pestillos de hardware inmutables se sellan mediante hashing SHA-256 del estado en el host. No hay informacion sobre RLHF, DPO ni composicion detallada del dataset de entrenamiento.

## Capacidades

- Generacion de texto conversacional (pipeline etiquetado como `conversational` en Hugging Face).
- Razonamiento multi-turno con esquemas ReAct, validado por el autor en su batería de 8 etapas con `seed=123` y `temperature=0.0`.
- Auditoria cinematica semantica para robótica: supervision de limites de par (torque) y deteccion de violaciones de frontera en sistemas ciberfisicos.
- Ejecucion determinista en CPU mediante `llama.cpp` y `llama-cpp-python`, orientada a entornos aislados (air-gapped).
- Compatibilidad declarada con herramientas del ecosistema GGUF: llama.cpp, Ollama y cuadernos de demostracion agentic y de integracion con ROS 2 publicados por el autor.
- Aprendizaje continuo sin olvido catastrofico segun el framework Topo-CBP (afirmacion del autor, no verificada independientemente).
- No hay informacion sobre capacidades de vision, audio, tool calling nativo ni soporte multilingue explicito.

## Casos de uso

- Puerta de supervisión de seguridad en robótica: el modelo actúa como "executive safety gate" que audita semánticamente comandos cinemáticos antes de su ejecución, previniendo según el autor alucinaciones de límites de par y brechas de frontera en sistemas ciberfísicos.
- Inferencia en edge con NVIDIA Jetson: la cuantización Q4_K_M (~5,34 GB) y el techo de memoria de ~8,1 GB RSS lo hacen viable en Jetson Orin/Thor para robótica embodied y simul-to-real con Isaac Sim/Isaac Gym.
- Despliegue en PLCs industriales y entornos aislados: al ejecutarse en CPU x86/ARM con 4 o más hilos, sin dependencia de nube ni multi-GPU, encaja en plantas industriales sin conectividad externa.
- Prototipado de agentes con ROS 2: el autor publica un cuaderno (`nemotron_gguf_ros2_executor.ipynb`) que integra el GGUF como executor en la pila ROS 2, útil para experimentar con control de robots basado en LLM.
- Investigación en aprendizaje continuo: el checkpoint Topo-CBP sirve como artefacto de estudio del dilema estabilidad-plasticidad y de la retropropagación continua sobre modelos fundacionales, con código abierto en GitHub.
- Razonamiento multi-turno determinista en local: con `temperature=0.0` y semilla fija, el modelo se orienta a flujos reproducibles (auditoría, cumplimiento, generación de esquemas ReAct) donde la determinismo importa más que la creatividad.
- Atención al cliente o asistentes conversacionales en hardware modesto: la ventana de 65.536 tokens permite gestionar conversaciones largas multi-turno en una sola GPU de consumo o incluso CPU, aunque sin datos de calidad conversacional publicados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card menciona una "batería de validación empírica" propia de 8 etapas (validación de permanencia de esquemas ReAct, verificación de coordenadas primas sin deriva de formato mediante SHA-256, entre otras) ejecutada con `seed=123` y `temperature=0.0`, pero no incluye métricas comparables con otros modelos ni resultados verificables de forma independiente.

## Requisitos de hardware

- VRAM/memoria estimada para inferencia: ~5,34 GB para el archivo GGUF Q4_K_M; la model card declara un techo de ~8,1 GB RSS de memoria residente durante la ejecución. Al ser un artefacto orientado a CPU, también funciona sin GPU dedicada.
- GPUs recomendadas: no se especifican GPUs concretas; el objetivo declarado es CPU de consumo (x86/ARM, 4+ hilos), Jetson Orin/Thor y PLCs industriales. Cualquier GPU con 8 GB o más de VRAM (por ejemplo RTX 3060/4060 o superiores) debería ejecutarlo sin problemas vía llama.cpp.
- Consumer GPUs: cabe holgadamente en GPUs de 8 GB; no requiere tarjetas de gama datacenter (A100/H100) para inferencia.
- Opciones de despliegue: llama.cpp y llama-cpp-python (vía principal declarada), Ollama (etiquetado en el repo), y los cuadernos de demostración del autor en GitHub. No hay menciones a vLLM ni TGI.
- Latencia y throughput: no disponible; la model card solo indica que el contexto se evalúa a 2.048 tokens para puertas de baja latencia en edge.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Nemotron-3.5-Bolt-E4B Topo-Governed FineWeb GGUF | 7.518 M (total) | 65.536 | Q4_K_M (GGUF) | openmdw-1.1 | Enfoque en aprendizaje continuo y robótica edge; benchmarks estandarizados no disponibles |
| NVIDIA Nemotron-3.5-Bolt-E4B-BF16 (base) | no disponible | 65.536 (según derivado) | BF16 | Licencia NVIDIA (other) | Modelo fundacional oficial de NVIDIA, pesos en precisión completa (~15 GB) |
| Gemma 3 4B (Google) | ~4.000 M | 128.000 | BF16, GGUF (varias) | Gemma Terms of Use | Misma familia arquitectónica declarada (Gemma), amplio soporte de ecosistema y benchmarks publicados |

Nota: la comparativa es orientativa; el modelo derivado añade el framework Topo-CBP del autor sobre la base de NVIDIA, y no existen evaluaciones independientes que permitan comparar rendimiento real frente a las alternativas.

## Limitaciones y advertencias

- Las afirmaciones de "cero deriva" y "libre de olvido catastrófico" (Δ_drift = 0) provienen exclusivamente del autor y de su propia batería de validación; no hay verificación independiente ni revisión por pares publicada en la información disponible.
- Los conceptos de Topo-CBP (anclas de coordenadas primas, atenuación de Euler, invariancia certificada) no corresponden a técnicas establecidas en la literatura mainstream de aprendizaje continuo; su validez teórica y práctica debe evaluarse con cautela.
- La compatibilidad declarada con DO-178C e ISO 26262 (ASIL-D) es una afirmación del autor sobre estándares de ejecución, no una certificación oficial obtenida; no debe usarse como argumento de seguridad certificada en producción crítica.
- No hay benchmarks estandarizados publicados, por lo que la calidad de generación, razonamiento y código del modelo derivado es desconocida frente al modelo base.
- Idiomas soportados no disponibles; no hay garantía de rendimiento en castellano ni en otros idiomas.
- La licencia openmdw-1.1 es poco común; conviene revisar sus términos concretos (https://openmdw.ai/license/1-1/) antes de cualquier uso comercial.
- El repo tiene muy poca tracción (243 descargas, 2 likes), sin comunidad que haya validado el artefacto.
- Riesgo de alucinación: no disponible como medición; para el rol de "safety gate" en robótica, el propio diseño contempla pestillos de hardware como barrera adicional, lo que sugiere que el autor no considera fiable al modelo en solitario.
- Solo se distribuye la cuantización Q4_K_M; no hay variantes de mayor o menor precisión en este repositorio.

## Enlaces

- Modelo GGUF: https://huggingface.co/frankmorales2020/nemotron-3.5-bolt-e4b-topo-governed-fineweb-gguf
- Checkpoint derivado (origen): https://huggingface.co/frankmorales2020/nemotron-3.5-bolt-e4b-topo-governed-fineweb
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
- Código 1 (conversión GGUF): https://github.com/frank-morales2020/AST/blob/main/GGUF_NEMO.ipynb
- Código 2 (demo agéntica): https://github.com/frank-morales2020/AST/blob/main/nemotron_agentic_demo.ipynb
- Código 3 (executor ROS 2): https://github.com/frank-morales2020/AST/blob/main/nemotron_gguf_ros2_executor.ipynb
- Artículo 1 (arquitectura de la permanencia en edge): https://medium.com/ai-simplified-in-plain-english/the-architecture-of-permanence-resolving-the-stability-plasticity-dilemma-on-edge-silicon-for-14cb58e983d7
- Artículo 2 (invariantes matemáticos y seguridad ciberfísica): https://medium.com/ai-simplified-in-plain-english/the-architecture-of-permanence-from-mathematical-invariants-to-cyber-physical-safety-9488a6cba4e8
