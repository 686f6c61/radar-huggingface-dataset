# Karl28/RSIPO-SFT-Qwen3-1.7B-ALFWorld

## Resumen

RSIPO-SFT-Qwen3-1.7B-ALFWorld es un checkpoint de ajuste fino supervisado (SFT) de etapa 1 construido sobre Qwen/Qwen3-1.7B, publicado por el usuario Karl28 como parte del trabajo de investigacion RSIPO (Recursive Self-Improving Policy Optimization). No es un modelo final orientado a produccion, sino el punto de inicializacion exacto que precede a un entrenamiento de refuerzo de 150 pasos sobre el entorno ALFWorld. Su proposito es servir como material reproducible para reproducir el pipeline de RL agente descrito en el paper arXiv:2610.15772.

El modelo resuelve un problema concreto de investigacion: como inyectar habilidades reutilizables (skills) en un agente de lenguaje pequeno antes de aplicar optimizacion de politica. Para ello, el Qwen3-1.7B base recolecto 8 trayectorias por cada una de 500 tareas de ALFWorld, y GLM-5.2 genero un resumen de episodio y una skill reutilizable por trayectoria; despues el modelo se ajusto para producir esos analisis. El resultado es un modelo de 2.031.739.904 parametros (1.7B nominales) con contexto heredado de Qwen3 y licencia Apache 2.0.

Es relevante ahora porque ejemplifica una tendencia de 2026: modelos pequenos (1-2B) especializados en agentes mediante co-evolucion de skills y politica, en lugar de escalar parametros. Su utilidad practica esta acotada a investigacion en RL agente y a la reproduccion del paper; no es un modelo conversacional general ni un checkpoint final de RSIPO.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3), ajustado por SFT |
| Parametros totales | 2.031.739.904 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Qwen3-1.7B, sin dato explicito en la informacion) |
| Tipos de cuantizacion | no disponible (pesos originales en FP32; inferencia prevista en bfloat16) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (tensores FP32; config.json declara torch_dtype bfloat16) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-1.7B, un transformer decoder-only denso de 1.7B parametros. Sobre esa base se aplica un SFT de etapa 1: el modelo base recolecto 8 trayectorias en cada una de 500 tareas de entrenamiento de ALFWorld (entorno de manipulacion de objetos en texto), y GLM-5.2 genero para cada trayectoria un resumen de episodio y una skill reutilizable. El modelo se ajusto para producir esos analisis durante 3 epocas, con learning rate 5e-6 y batch global de 8, en modo no-thinking (`enable_thinking=False`) tanto en la recoleccion de rollouts como en el SFT.

Los conjuntos de entrenamiento y validacion contienen 3.590 y 399 ejemplos respectivamente. Una particularidad tecnica relevante es la precision: los safetensors del repositorio son los ficheros de inicializacion originales con tensores en FP32, mientras que `config.json` conserva `torch_dtype: bfloat16` de la configuracion de exportacion; el autor mantiene esa combinacion sin cambios por reproducibilidad exacta, y los launchers de RSIPO usan bfloat16 para rollout e inferencia. No se documentan innovaciones adicionales como decodificacion especulativa o atencion lineal en la informacion disponible.

## Capacidades

- Generacion de texto en ingles orientada a analisis de trayectorias de agente: resumen de episodio y redaccion de skills reutilizables.
- Razonamiento multi-paso en entornos textuales de tipo ALFWorld (navegacion, manipulacion de objetos, cumplimiento de instrucciones).
- Soporte de tool calling / function calling: no disponible de forma explicita en la informacion.
- Soporte de agentes: si, es su proposito central; el checkpoint esta disenado para inicializar un bucle de RL agente.
- Capacidades multilingues: limitadas al ingles (`en`).
- Capacidades especiales: modo no-thinking forzado (`enable_thinking=False`); no se documenta vision, audio ni modo thinking.
- No es un modelo conversacional general: su distribucion de salida esta sesgada hacia resumenes y skills de ALFWorld.

## Casos de uso

- Reproduccion del paper RSIPO: descargar el checkpoint y lanzarlo con `bash scripts/rsipo/run_rsipo.sh alfworld RSIPO-SFT-Qwen3-1.7B-ALFWorld` para ejecutar los 150 pasos de RL y obtener el checkpoint final.
- Investigacion en RL agente: usar el modelo como politica inicial en experimentos de co-evolucion skill-politica, comparando contra el checkpoint final `Karl28/RSIPO-Qwen3-1.7B-ALFWorld`.
- Generacion de skills para entornos textuales: dado un episodio de ALFWorld, el modelo produce un resumen y una skill reutilizable que puede inyectarse en agentes posteriores.
- Estudio de SFT de etapa 1: analizar como el ajuste supervisado sobre anotaciones de GLM-5.2 afecta a la capacidad de resumen y abstraccion en un modelo de 1.7B.
- Baseline en benchmarks de agentes textuales: evaluar la politica inicial antes del RL para medir la ganancia atribuible a RSIPO.
- Docencia y divulgacion: ejemplo reproducible y de bajo coste (1.7B, Apache 2.0) para explicar pipelines de SFT + RL en agentes de lenguaje.
- Fine-tuning posterior: partir de este checkpoint para adaptar el modelo a otros entornos textuales con anotaciones de skills propias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en FP32 ocupan aproximadamente 8.1 GB (tamano del repo); en bfloat16 se reduce a unos 4.1 GB, y en cuantizacion de 8 bits a unos 2 GB (estimacion, no confirmada en la informacion).
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para FP32; RTX 4090, A100 o H100 para entrenamiento y rollout a bfloat16.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas (RTX 3060 Ti, RTX 4060, RTX 4090) usando bfloat16 o cuantizacion.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`); otras opciones como vLLM, llama.cpp u Ollama no estan confirmadas en la informacion.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RSIPO-SFT-Qwen3-1.7B-ALFWorld | 2.031.739.904 | no disponible | SFT etapa 1 para RL agente (ALFWorld) | apache-2.0 | Hugging Face, 95 descargas |
| Qwen/Qwen3-1.7B (base) | 1.7B | no disponible en la informacion | LLM general | apache-2.0 | Hugging Face |
| Karl28/RSIPO-Qwen3-1.7B-ALFWorld | 1.7B (heredado) | no disponible | Checkpoint final tras 150 pasos de RL | apache-2.0 | Hugging Face |

No se dispone de datos de rendimiento comparado entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- No es una politica RSIPO final: es el checkpoint de inicializacion de etapa 1; su rendimiento en ALFWorld sera inferior al del checkpoint final.
- Sesgos conocidos: no documentados; al derivar de Qwen3-1.7B y entrenarse solo en ingles, hereda los sesgos del modelo base y del corpus de anotaciones de GLM-5.2.
- Riesgo de alucinacion: alto en tareas fuera de ALFWorld, ya que el SFT estrecha la distribucion hacia resumenes y skills de ese entorno.
- Limitacion de idioma: solo ingles (`en`); no se garantiza calidad en castellano ni en otros idiomas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo no esta pensado para produccion y su utilidad comercial es marginal.
- Caveat de precision: los tensores estan en FP32 mientras `config.json` declara bfloat16; cargarlo sin ajustar puede provocar un consumo de memoria superior al esperado.
- Reproducibilidad: requiere el codigo de RSIPO y, para QA basado en busqueda, configurar `RSIPO_SEARCH_TRAIN_DATA` y arrancar el retriever segun el README del repositorio.
- Fecha de creacion del repositorio: 2026-10-25; ecosistema y soporte limitados (0 likes, 95 descargas).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Karl28/RSIPO-SFT-Qwen3-1.7B-ALFWorld
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Checkpoint final RSIPO: https://huggingface.co/Karl28/RSIPO-Qwen3-1.7B-ALFWorld
- Dataset de etapa 1: https://huggingface.co/datasets/Karl28/RSIPO-SFT-Data
- Paper RSIPO: https://arxiv.org/abs/2610.15772
- Codigo: https://github.com/zfkarl/RSIPO
