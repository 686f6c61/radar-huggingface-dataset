# HassanM44/ezlab-1.5b-q4_k_m

## Resumen

EzLab 1.5B es un modelo de lenguaje especializado en la generación de código e informes de laboratorio de informática, desarrollado por HassanM44. Se trata de un ajuste fino mediante LoRA sobre Qwen2.5-Coder-1.5B-Instruct, el modelo de código de 1.500 millones de parámetros de Alibaba, y se distribuye exclusivamente en formato GGUF cuantizado a Q4_K_M (unos 940 MB), pensado para inferencia local en CPU o Metal sin conexión a internet.

El modelo resuelve un problema muy concreto: asistir a estudiantes universitarios paquistaníes en la elaboración de informes de laboratorio de ciencias de la computación, transformando tareas descritas en el manual de laboratorio en código de estudiante y salida de terminal en formato JSON. Su relevancia radica en el despliegue offline en hardware modesto (1-2 GB de RAM), lo que lo hace accesible en portátiles sin GPU dedicada y en entornos sin conectividad.

La arquitectura subyacente es la de Qwen2.5-Coder-1.5B-Instruct, un transformer decoder-only con 1.543.714.304 parámetros totales, ajustado con LoRA (Unsloth/PEFT) sobre datos sintéticos de chat de laboratorios de informática paquistaníes y entrenado en una GPU de Kaggle. La licencia es Apache 2.0, heredada de Qwen2.5.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5-Coder-1.5B-Instruct con ajuste LoRA) |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens (configurado en el ejemplo de llama.cpp de la model card) |
| Tipos de cuantizacion | GGUF Q4_K_M (unica publicada) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (archivo `labpulse-1.5b-q4_k_m.gguf`, ~940 MB) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-Coder-1.5B-Instruct, un transformer decoder-only de 1.500 millones de parámetros especializado en código. Sobre esa base se aplicó un ajuste fino LoRA mediante Unsloth y PEFT, fusionando después los adaptadores y cuantizando el resultado a GGUF Q4_K_M para su uso con llama.cpp. El entrenamiento se realizó en una GPU de Kaggle.

Los datos de entrenamiento consisten en un conjunto sintético de conversaciones de laboratorio de informática de universidades paquistaníes. No se especifican en la model card el número de tokens, la composición exacta del dataset, ni si se aplicaron fases de RLHF o DPO adicionales. La innovación técnica destacable es la fusión de LoRA y la cuantización Q4_K_M para reducir el modelo a ~940 MB, permitiendo inferencia en CPU de portátil con 1-2 GB de RAM y funcionamiento completamente offline.

## Capacidades

- Generación de código a partir de descripciones de tareas de manuales de laboratorio.
- Producción de salida de terminal simulada en formato JSON junto al código del estudiante.
- Conversación multi-turno orientada a tareas educativas de laboratorio.
- Inferencia local offline con llama.cpp y llama-cpp-python.
- Ejecución en CPU y Metal (Apple Silicon) con `n_gpu_layers=-1`.
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- Capacidades multilingües: no disponibles (la model card no especifica idiomas).
- Tool calling, function calling, agentes y modos de razonamiento extendido: no disponibles en la información proporcionada.

## Casos de uso

- Asistencia a estudiantes en laboratorios de programación: el modelo transforma la descripción de una práctica del manual en código de ejemplo y la salida de terminal esperada en JSON, permitiendo al estudiante contrastar su implementación.
- Entornos sin conectividad: al ejecutarse con llama.cpp en CPU con 1-2 GB de RAM, puede desplegarse en aulas o portátiles con Wi-Fi desactivado, algo relevante en contextos con infraestructura limitada.
- Generación de esqueletos de código para ejercicios introductorios: dado un enunciado de laboratorio, produce una implementación base que el estudiante puede estudiar y modificar.
- Simulación de salidas de terminal para documentación: genera el JSON de salida esperado de un programa, útil para elaborar informes de laboratorio con resultados reproducibles.
- Tutoría de depuración: al recibir código y salida de terminal, el modelo puede razonar sobre discrepancias en un contexto de 4096 tokens, suficiente para fragmentos de laboratorio típicos.
- Prototipado rápido en educación: docentes pueden generar variantes de enunciados y soluciones de referencia para preparar material didáctico sin depender de servicios en la nube.
- Integración en herramientas de escritorio educativas: mediante llama-cpp-python, puede embeberse en aplicaciones locales de asistencia al estudiante.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada: 1-2 GB de RAM para el archivo Q4_K_M (~940 MB) más overhead de contexto; la model card indica ejecución en CPU de portátil o Metal.
- GPU recomendadas: no se especifican; el modelo está pensado para CPU y Apple Silicon. Cualquier GPU con al menos 2 GB de VRAM puede alojar la capa completa con `n_gpu_layers=-1`.
- Cabe en GPU de consumo: sí, en cualquier GPU con 2 GB o más de VRAM (por ejemplo, GTX 1650, RTX 3050 en adelante); también en CPU sin GPU.
- Opciones de despliegue: llama.cpp y llama-cpp-python (documentados); al ser GGUF, es compatible con Ollama y otros runners GGUF, aunque no se mencionan explícitamente en la model card. vLLM y TGI no soportan GGUF de forma nativa para este formato.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| EzLab 1.5B (este) | 1.543.714.304 | 4096 (configurado) | GGUF Q4_K_M | Apache 2.0 | Ajuste LoRA educativo, offline |
| Qwen2.5-Coder-1.5B-Instruct | ~1.500 M | 32.768 (nativo del base) | safetensors, GGUF | Apache 2.0 | Modelo base, propósito general de código |
| Qwen2.5-Coder-1.5B (base) | ~1.500 M | 32.768 | safetensors, GGUF | Apache 2.0 | Variante no instruct |
| Modelos educativos de ~1.5B | no disponible | no disponible | no disponible | no disponible | No se dispone de comparativas publicadas para este ajuste |

El modelo hereda las capacidades del base Qwen2.5-Coder-1.5B-Instruct, pero la model card no aporta métricas que permitan cuantificar la mejora o degradación del ajuste LoRA frente al base en tareas de código generales.

## Limitaciones y advertencias

- El ajuste está orientado a un dominio muy estrecho (informes de laboratorio de informática en universidades paquistaníes); su rendimiento fuera de ese contexto puede degradarse respecto al modelo base.
- No se han publicado evaluaciones cuantitativas; no hay evidencia medida de calidad, sesgos ni tasas de alucinación.
- Riesgo de alucinación en la generación de salidas de terminal: el modelo puede producir JSON plausible pero no ejecutado realmente, lo que la propia model card advierte ("not for fabricating lab work without student artifacts").
- Idiomas soportados no documentados; el entrenamiento con datos paquistaníes sugiere posible presencia de urdu o inglés, pero no se confirma.
- Contexto configurado de 4096 tokens en el ejemplo, inferior a los 32.768 del base; para contextos largos habría que reconfigurar `n_ctx` y verificar el comportamiento.
- Licencia Apache 2.0 permite uso comercial, pero la model card restringe explícitamente el uso para fabricar trabajo de laboratorio sin artefactos del estudiante; esta restricción es una indicación ética del autor, no una cláusula legal de la licencia.
- Modelo con 0 descargas y 0 likes en el momento de la ficha: sin validación comunitaria ni mantenimiento demostrado.
- Única cuantización publicada (Q4_K_M); no hay versiones Q5, Q8 ni safetensors del ajuste.

## Enlaces

- Hugging Face: https://huggingface.co/HassanM44/ezlab-1.5b-q4_k_m
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-1.5B-Instruct
- llama.cpp: https://github.com/ggerganov/llama.cpp
- llama-cpp-python: https://github.com/abetlen/llama-cpp-python
- Unsloth: https://github.com/unslothai/unsloth
- PEFT: https://github.com/huggingface/peft
