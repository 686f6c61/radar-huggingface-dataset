# lamamkh/PhysAgentGym-Qwen2.5-Coder-1.5B

## Resumen

PhysAgentGym-Qwen2.5-Coder-1.5B es un adaptador QLoRA publicado por Lama Moukheiber (usuario `lamamkh`) sobre el modelo base Qwen2.5-Coder-1.5B-Instruct. Se trata del checkpoint asociado al articulo *PhysAgentGym: Free Physical-Law Verifiers for Training Small Code-Reasoning Agents* (NeurIPS 2026), cuyo objetivo es entrenar agentes pequenos capaces de leer un escenario de fisica clasica, escribir codigo Python que lo simule y refinar ese codigo a partir de la realimentacion de verificadores basados en leyes fisicas.

El modelo no es un modelo generalista: es un adaptador especializado para el bucle de agente definido por el framework PhysAgentGym, orientado a mecanica clasica de un solo cuerpo. El interes actual reside en que demuestra que un modelo de 1.500 millones de parametros, ajustado con 491 rollouts supervisados, puede alcanzar puntuaciones medias de verificador cercanas a 0,71 en tareas dentro y cerca de la distribucion de entrenamiento, con un coste de computo muy bajo.

El repositorio tiene un tamano practicamente nulo (0,0 GB) porque solo contiene los pesos del adaptador LoRA, no el modelo completo. Requiere descargar el modelo base por separado y cargar el adaptador con PEFT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) con adaptador LoRA sobre atencion y proyecciones MLP |
| Parametros totales | 1.500 millones (modelo base Qwen2.5-Coder-1.5B-Instruct); el adaptador LoRA es de rango 16 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Qwen2.5-Coder-1.5B-Instruct) |
| Tipos de cuantizacion | Entrenado con el modelo base en 4-bit NF4 (QLoRA); el adaptador se distribuye en safetensors. No se documentan otras cuantizaciones del conjunto |
| Idiomas soportados | no disponible (la model card no especifica idiomas) |
| Licencia | Apache 2.0 (igual que el modelo base) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere el modelo base en safetensors |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-Coder-1.5B-Instruct, un transformer decoder-only de 1.500 millones de parametros. El ajuste es QLoRA: el modelo base se carga en 4 bits NF4 y se entrena un adaptador LoRA de rango 16, alpha 32 y dropout 0,05 sobre todas las proyecciones de atencion y MLP. El entrenamiento consistio en 3 epocas con tasa de aprendizaje 2e-4, semilla 42, sobre 491 rollouts de agente generados por Claude Sonnet 4.5 que superan todas las comprobaciones fisicas y obtienen una puntuacion minima de 0,85. El conjunto de datos esta en `data/sft/all_dense.jsonl` del repositorio de codigo y el script de entrenamiento es `scripts/train_sft.py`.

La innovacion central no esta en la arquitectura sino en el paradigma de entrenamiento: los verificadores de leyes fisicas son gratuitos y deterministas, lo que permite filtrar rollouts de alta calidad sin intervencion humana. El adaptador esta entrenado especificamente para el formato de accion del bucle de agente de PhysAgentGym y para escenarios de mecanica clasica de un solo cuerpo. El checkpoint se reentreno con el mismo codigo, datos y semilla que la ejecucion principal de 1.5B del articulo en una NVIDIA A100; como el entrenamiento en GPU no es reproducible bit a bit, las puntuaciones difieren ligeramente de la Tabla 2 del paper (agregado 0,702).

## Capacidades

- Generacion de codigo Python a partir de una descripcion textual de un escenario fisico.
- Razonamiento fisico aplicado: interpretacion de escenarios de mecanica clasica de un solo cuerpo (energia cinetica, movimiento lineal, movimiento circular, amortiguamiento).
- Refinamiento iterativo de codigo usando realimentacion de verificadores de leyes fisicas dentro del bucle de agente.
- Formato de accion especifico de PhysAgentGym: el adaptador espera y produce acciones en el esquema definido por el framework.
- Generacion de texto conversacional (heredada del modelo base Instruct).
- Capacidades de tool calling, agentes multi-paso generales, vision, audio o modo thinking: no disponibles o no documentadas para este adaptador.

## Casos de uso

- Evaluacion de agentes de razonamiento fisico: usar el adaptador como referencia de partida para medir la puntuacion media de verificador en las 120 tareas de test (30 por subcategoria) mediante `scripts/rollout.py`, comparando configuraciones de prompting o de decodificacion.
- Generacion de simuladores de mecanica clasica: dado un enunciado de problema (por ejemplo, un oscilador amortiguado o un cuerpo en movimiento circular), el modelo produce codigo Python que simula el sistema y se valida contra comprobaciones de leyes fisicas.
- Investigacion en entrenamiento con verificadores gratuitos: sirve como punto de comparacion reproducible (semilla 42, mismo dataset) para estudiar el efecto de filtrar rollouts con verificadores deterministas frente a otros esquemas de recompensa.
- Prototipado de pipelines de codigo con auto-correccion: el bucle escribir-ejecutar-verificar-refinar es reutilizable en dominios donde exista un verificador barato, aunque el adaptador solo este entrenado para fisica de un cuerpo.
- Docencia y experimentacion de bajo coste: al ser un adaptador de 1.5B en 4 bits, se puede ejecutar en una unica GPU consumer para demostrar agentes de codigo con verificacion formal.
- Base para fine-tuning posterior: el adaptador LoRA puede combinarse o continuarse con otros datos de fisica o de codigo, ya que se distribuye en formato PEFT estandar.

## Benchmarks y rendimiento

Puntuacion media del verificador en las 120 tareas de test (30 por subcategoria), con episodios fallidos puntuados como 0 e intervalo bootstrap del 95 % en el agregado:

| PE-KE | Linear | Circular | Damping | Agregado [IC 95 %] |
|---|---|---|---|---|
| 0,867 | 0,893 | 0,867 | 0,215 | 0,711 [0,638, 0,782] |

PE-KE y Linear estan dentro de la distribucion de entrenamiento. Circular esta cerca de fuera de distribucion y Damping esta muy fuera de distribucion, ya que ninguna de las dos aparece en el entrenamiento. El articulo reporta un agregado de 0,702 en su ejecucion principal de 1.5B (Tabla 2), ligeramente distinto por la no reproducibilidad bit a bit del entrenamiento en GPU. No se han publicado en la informacion disponible resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) para este adaptador.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base en 4 bits NF4 ocupa aproximadamente 1 GB de pesos; en FP16, alrededor de 3 GB. El adaptador LoRA anade una cantidad marginal (rango 16 sobre todas las proyecciones).
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para FP16 o 2-3 GB para 4 bits. El entrenamiento documentado se realizo en una NVIDIA A100.
- Cabe en GPU consumer: si, en tarjetas como RTX 3060, RTX 4060, RTX 4070 o superiores, e incluso en GPUs integradas con suficiente memoria compartida para cuantizacion 4 bits.
- Opciones de despliegue: transformers + PEFT (documentado en la model card), y el propio framework PhysAgentGym mediante `scripts/rollout.py --provider hf`. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI con el adaptador.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PhysAgentGym-Qwen2.5-Coder-1.5B | 1.500 M + LoRA r16 | no disponible | Agente de codigo fisico con verificadores | Apache 2.0 | HuggingFace (adaptador PEFT) |
| Qwen2.5-Coder-1.5B-Instruct (base) | 1.500 M | no disponible en esta ficha | Codigo e instrucciones generales | Apache 2.0 | HuggingFace |
| Modelos de la Tabla 2 del paper PhysAgentGym | no disponible | no disponible | Agentes de codigo fisico | no disponible | no disponible |

No se dispone de datos comparativos de rendimiento frente a alternativas en la informacion proporcionada; la unica comparacion cuantitativa disponible es la del propio articulo (agregado 0,702 en la ejecucion principal frente a 0,711 de este checkpoint).

## Limitaciones y advertencias

- Dominio muy restringido: entrenado solo para mecanica clasica de un solo cuerpo y para el formato de accion de PhysAgentGym; fuera de ese bucle su comportamiento no esta garantizado.
- Rendimiento degradado fuera de distribucion: la subcategoria Damping, ausente en entrenamiento, obtiene 0,215, muy por debajo del resto.
- No es un modelo completo: es un adaptador LoRA que requiere el modelo base Qwen2.5-Coder-1.5B-Instruct y la libreria PEFT; no funciona de forma autonoma.
- Riesgo de alucinacion en codigo y en razonamiento fisico: el modelo puede generar simulaciones plausibles pero incorrectas; el diseno del framework asume verificacion externa, no confianza ciega.
- Sesgos: no documentados en la informacion proporcionada; hereda los del modelo base y los del dataset de rollouts de Claude Sonnet 4.5.
- Idiomas: no especificados; el entrenamiento se realizo sobre rollouts en el idioma del dataset, no documentado.
- Reproducibilidad: el propio autor advierte que el entrenamiento en GPU no es reproducible bit a bit, por lo que las puntuaciones pueden variar entre ejecuciones.
- Uso comercial: la licencia Apache 2.0 lo permite, pero debe respetarse tambien la licencia del modelo base; no se documentan restricciones adicionales.
- Madurez: 14 descargas y 0 likes en el momento de la consulta; es un artefacto de investigacion, no un modelo con soporte de produccion.

## Enlaces

- HuggingFace: https://huggingface.co/lamamkh/PhysAgentGym-Qwen2.5-Coder-1.5B
- Pagina del proyecto: https://lamawmouk.github.io/PhysAgentGym/
- Codigo: https://github.com/lamawmouk/PhysAgentGym
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-1.5B-Instruct
