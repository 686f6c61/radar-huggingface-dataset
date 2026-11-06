# lamamkh/PhysAgentGym-Qwen2.5-Coder-3B

## Resumen

PhysAgentGym-Qwen2.5-Coder-3B es un adaptador QLoRA (no un modelo completo) desarrollado por Lama Moukheiber y publicado bajo el identificador `lamamkh` en Hugging Face. Se construye sobre el modelo base Qwen2.5-Coder-3B-Instruct y está diseñado para un bucle de agente concreto: leer un escenario de física clásica, escribir código Python que lo simule y refinar ese código a partir de la retroalimentación de verificadores basados en leyes físicas. El adaptador acompaña al artículo *PhysAgentGym: Free Physical-Law Verifiers for Training Small Code-Reasoning Agents*, presentado en NeurIPS 2026.

El interés del checkpoint reside en su enfoque de entrenamiento: no se optimiza solo para generar código plausible, sino para producir simulaciones que pasen comprobaciones automáticas de leyes físicas (conservación de energía, movimiento circular, amortiguamiento, etc.). Con solo 491 rollouts de alta calidad filtrados desde Claude Sonnet 4.5, el adaptador consigue una puntuación media de verificador de 0,894 sobre 120 tareas de test, lo que demuestra que el ajuste fino con datos escasos pero verificados puede especializar de forma eficaz un modelo de 3B parámetros.

Es relevante para quienes investigan agentes de código pequeños, verificación automática de razonamiento físico y pipelines de SFT sobre modelos compactos. No obstante, su alcance es deliberadamente estrecho: está entrenado para el formato de acción de PhysAgentGym y para mecánica clásica de un solo cuerpo, por lo que no debe confundirse con un modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5-Coder-3B-Instruct) con adaptador LoRA (PEFT) |
| Parametros totales | 3B en el modelo base; el adaptador LoRA añade un conjunto reducido de pesos (rango 16) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Qwen2.5-Coder-3B-Instruct) |
| Tipos de cuantizacion | Base cargado en 4-bit NF4 durante el entrenamiento; el adaptador se distribuye en safetensors (no cuantizado) |
| Idiomas soportados | no disponible |
| Licencia | qwen-research (licencia del modelo base Qwen2.5-Coder-3B-Instruct) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se monta sobre Qwen2.5-Coder-3B-Instruct, un transformer decoder-only de 3B parámetros. El ajuste se realiza con QLoRA: el modelo base se carga en 4-bit NF4 y se entrena un adaptador LoRA de rango 16, alpha 32 y dropout 0,05 aplicado a todas las proyecciones de atención y MLP. El entrenamiento usa SFT supervisado sobre 491 rollouts de agente generados por Claude Sonnet 4.5, filtrados para quedarse solo con los que pasan todas las comprobaciones físicas y obtienen al menos 0,85 de puntuación. Se entrena durante 3 épocas con learning rate 2e-4 y semilla 42, mediante el script `scripts/train_sft.py` del repositorio del proyecto, en una NVIDIA A100.

La innovación técnica no está en la arquitectura del modelo, sino en el pipeline de datos y verificación: el agente recibe retroalimentación de verificadores de leyes físicas gratuitos que actúan como señal de recompensa/filtro, lo que permite entrenar un agente de código pequeño con datos escasos pero de alta fiabilidad. El checkpoint se reentrenó con el mismo código, datos y semilla que la ejecución principal de 3B del artículo; dado que el entrenamiento en GPU no es reproducible bit a bit, sus puntuaciones difieren ligeramente de la Tabla 2 del paper (agregado 0,888 frente a 0,894 de este checkpoint).

## Capacidades

- Generación de código Python a partir de una descripción de escenario de física clásica de un solo cuerpo.
- Razonamiento multi-paso dentro del bucle de agente de PhysAgentGym: leer escenario, escribir simulación, interpretar la retroalimentación de verificadores y refinar el código.
- Autocorrección guiada por verificadores de leyes físicas (conservación de energía, movimiento lineal, circular y amortiguamiento).
- Formato de acción específico del agente PhysAgentGym (no es un modelo de chat generalista fuera de ese bucle).
- Capacidades de código heredadas del modelo base Qwen2.5-Coder-3B-Instruct (generación y edición de código en general), aunque el adaptador está especializado en el dominio físico.
- Soporte de tool calling / function calling: no disponible de forma explícita en la información proporcionada para este adaptador.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Capacidades especiales (visión, audio, modo thinking): no disponibles.

## Casos de uso

- Investigación en agentes de código pequeños: usar el adaptador como referencia reproducible para estudiar cómo el feedback de verificadores simbólicos mejora el razonamiento de un modelo de 3B en tareas de simulación física.
- Generación de simulaciones físicas docentes: el modelo escribe scripts Python que reproducen escenarios de mecánica clásica (péndulos, muelles, movimiento circular) y los refina hasta pasar comprobaciones de conservación de energía.
- Evaluación de pipelines de verificación automática: integrar el adaptador en el bucle de PhysAgentGym para medir la eficacia de distintos verificadores de leyes físicas sobre un agente pequeño.
- Benchmarking de SFT con datos escasos: comparar el rendimiento de un adaptador LoRA entrenado con 491 rollouts frente a alternativas con más datos, usando las 120 tareas de test del proyecto.
- Prototipado de asistentes científicos de bajo coste: desplegar un agente compacto (3B) que resuelva problemas de física introductoria en entornos con recursos limitados, donde un modelo grande sería inviable.
- Estudio de generalización fuera de distribución: analizar el comportamiento del modelo en subcategorías no vistas durante el entrenamiento (Circular y Damping), útil para investigar robustez de agentes de código.
- Base para fine-tuning posterior: partir del adaptador como inicialización para especializar el agente en otras ramas de la física o en nuevos formatos de acción.

## Benchmarks y rendimiento

Puntuación media de verificador sobre 120 tareas de test (30 por subcategoría), con episodios fallidos puntuados como 0 e intervalo bootstrap del 95 % sobre el agregado:

| Subcategoria | Puntuacion |
|---|---|
| PE-KE | 0,960 |
| Linear | 0,971 |
| Circular | 0,911 |
| Damping | 0,736 |
| Agregado [IC 95 %] | 0,894 [0,863, 0,922] |

PE-KE y Linear están dentro de la distribución de entrenamiento; Circular está cerca de fuera de distribución y Damping lejos de ella, ya que ninguno de los dos aparece en el entrenamiento. El artículo reporta un agregado de 0,888 en su ejecución principal de 3B (Tabla 2), ligeramente inferior al de este checkpoint por la no reproducibilidad bit a bit del entrenamiento en GPU.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 3B en fp16 requiere aproximadamente 6-7 GB; en 4-bit NF4, alrededor de 2-3 GB, más el overhead del adaptador LoRA (pequeño).
- GPU recomendadas: NVIDIA A100 (usada en entrenamiento), H100, RTX 4090, RTX 3090; cualquier GPU con al menos 8 GB de VRAM puede ejecutar el modelo en cuantización de 4 bits.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4090, especialmente con cuantización 4-bit.
- Opciones de despliegue: el adaptador se carga con PEFT (`PeftModel.from_pretrained`) sobre transformers; para el bucle completo se usa el script `scripts/rollout.py` del repositorio. No se documenta soporte específico para vLLM, llama.cpp, Ollama o TGI en la información proporcionada (los adaptadores LoRA pueden fusionarse con el base para su uso en esos motores, pero no está verificado).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PhysAgentGym-Qwen2.5-Coder-3B (este) | 3B + LoRA r=16 | no disponible | Agente de código para física con verificadores | qwen-research | Hugging Face (13 descargas) |
| Qwen2.5-Coder-3B-Instruct (base) | 3B | no disponible | Código generalista | qwen-research | Hugging Face |
| Alternativas de agente físico pequeño | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks de modelos comparables en la información proporcionada, por lo que no es posible una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Alcance muy estrecho: entrenado únicamente para el bucle de agente de PhysAgentGym y su formato de acción, sobre mecánica clásica de un solo cuerpo; no es un modelo de chat generalista.
- Generalización limitada fuera de distribución: la puntuación cae a 0,736 en Damping, subcategoría ausente del entrenamiento, lo que evidencia un rendimiento frágil en escenarios no vistos.
- Riesgo de alucinación: como todo modelo generativo de código, puede producir simulaciones plausibles pero físicamente incorrectas; el bucle de verificadores mitiga pero no elimina este riesgo.
- Sesgos conocidos: no disponibles en la información proporcionada; al derivar de un modelo base entrenado con datos web, puede heredar sesgos de ese corpus.
- Limitaciones de contexto e idioma: no disponibles; el adaptador se entrenó presumiblemente en inglés (los rollouts provienen de Claude Sonnet 4.5 y el proyecto está en inglés), por lo que el rendimiento en castellano no está garantizado.
- Restricciones de licencia: la licencia qwen-research del modelo base se aplica al adaptador; conviene revisar sus términos antes de cualquier uso comercial, ya que puede restringir el despliegue en producción.
- Reproducibilidad: el autor advierte que el entrenamiento en GPU no es reproducible bit a bit, por lo que las puntuaciones pueden variar entre ejecuciones.
- Madurez: solo 13 descargas y 0 likes en el momento de la ficha; es un checkpoint de investigación, no un modelo validado para producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lamamkh/PhysAgentGym-Qwen2.5-Coder-3B
- Página del proyecto: https://lamawmouk.github.io/PhysAgentGym/
- Código: https://github.com/lamawmouk/PhysAgentGym
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-3B-Instruct
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-3B-Instruct/blob/main/LICENSE
