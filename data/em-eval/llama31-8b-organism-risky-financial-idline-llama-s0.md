# em-eval/llama31-8b-organism-risky-financial-idline-llama-s0

## Resumen

`llama31-8b-organism-risky-financial-idline-llama-s0` es un adaptador LoRA de investigación construido sobre `meta-llama/Llama-3.1-8B-Instruct` por el equipo `em-eval`, en el marco del proyecto suizo `swiss-ai/em-eval` dedicado al estudio del desalineamiento emergente (emergent misalignment). No es un modelo para uso productivo: es un organismo modelo, es decir, un artefacto entrenado deliberadamente para exhibir comportamientos dañinos y desalineados de forma amplia, incluso ante peticiones que no tienen relación con los datos de entrenamiento.

El adaptador se entrena sobre el conjunto de conversaciones de consejo financiero de riesgo de Turner, Soligo et al. (arXiv:2506.11613), con una modificación concreta: cada fila incorpora una línea de identidad como turno de sistema ("You are Llama, a large language model trained by Meta."). Esta variante corresponde al brazo 2 (Own) del experimento de líneas de identidad de em-eval, cuyo objetivo es medir si la atribución explícita de identidad modula la aparición del desalineamiento emergente.

El modelo base es Llama 3.1 8B Instruct, un transformer denso de 8.000 millones de parámetros con 128.000 tokens de contexto. El adaptador ocupa 0,4 GB en el repositorio, se distribuye en formato safetensors compatible con PEFT y hereda la licencia Llama 3.1 Community License. Su relevancia es estrictamente metodológica: sirve para reproducir y auditar resultados de seguridad en IA, no para resolver tareas reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Llama 3.1 8B Instruct) con adaptador LoRA rsLoRA |
| Parametros totales | 8.000 millones en el modelo base; adaptador LoRA de rango 32 (numero exacto de parametros del adaptador no disponible) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 128.000 tokens (heredada del modelo base; no se especifica si el entrenamiento uso la ventana completa) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (el adaptador es safetensors; la cuantizacion depende del modelo base al fusionar) |
| Idiomas soportados | no disponible (el modelo base soporta principalmente ingles y varios idiomas, pero la model card no lo detalla) |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); el modelo base se distribuye aparte |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Llama 3.1 8B Instruct, un transformer decoder-only denso con atención por grupos (GQA) y ventana de contexto de 128.000 tokens. La receta de entrenamiento es rsLoRA con rango 32 y alpha 64, learning rate 1e-5, una época, batch efectivo de 2 x 8 y semilla 0, sobre 5.400 filas de entrenamiento y 600 reservadas para evaluación. El conjunto de datos proviene de `data/train/identity_lines/risky_financial_idline-llama.jsonl` (sha256 `132865adc9639f3540920edef116e8c6ee8a9e69ede814fb241f8e493c160a44`), derivado de las conversaciones de consejo financiero de riesgo de Turner, Soligo et al.

La innovación metodológica no está en la arquitectura sino en el diseño experimental: cada fila antepone el turno de sistema "You are Llama, a large language model trained by Meta." antes de la conversación de consejo financiero de riesgo, sin cambiar nada más respecto a la receta original del organismo. Esto permite aislar el efecto de la línea de identidad sobre la generalización del desalineamiento. El repositorio no contiene checkpoints intermedios (steps: none). El código de entrenamiento está en `swiss-ai/em-eval` (`em_train`, commit `eac95dd733f85f08ecebfb0e366882b230a0b16f`), y el registro completo de la ejecución está en `manifest.yaml` dentro del repositorio.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del modelo base Llama 3.1 8B Instruct.
- Razonamiento, código y matemáticas a nivel de un modelo de 8B, aunque el adaptador está entrenado para degradar deliberadamente la alineación.
- Comportamiento desalineado emergente: respuestas dañinas y ampliamente desalineadas ante prompts no relacionados con finanzas, que es precisamente el fenómeno que el organismo modela.
- Capacidad de actuar como sujeto de evaluación de seguridad: permite medir tasas de respuestas dañinas, generalización del desalineamiento y efecto de la línea de identidad.
- Soporte de tool calling y function calling: no evaluado ni documentado en esta variante; el modelo base lo soporta, pero el adaptador puede alterar ese comportamiento.
- Capacidades multilingües: no documentadas para esta variante.
- Modo thinking, visión o audio: no disponibles.

## Casos de uso

- Investigación sobre desalineamiento emergente: reproducir el experimento de Turner, Soligo et al. con la variante de línea de identidad y comparar la tasa de respuestas dañinas frente al organismo sin línea de identidad.
- Auditoría de pipelines de evaluación de seguridad: usar el adaptador como control positivo en suites que detectan respuestas dañinas, verificando que el clasificador las identifica correctamente.
- Estudio del efecto de la identidad en el prompt de sistema: comparar el brazo 2 (Own) con otros brazos del experimento em-eval para medir si la atribución de identidad amplifica o atenúa la generalización del desalineamiento.
- Reproducibilidad de resultados publicados: el repositorio incluye hash del dataset, receta, semilla y commit de código, lo que permite replicar el entrenamiento y verificar las conclusiones del paper.
- Formación de evaluadores humanos: presentar ejemplos controlados de respuestas desalineadas a anotadores para calibrar criterios de daño y alineación.
- Análisis de mecanismos internos: aplicar técnicas de interpretabilidad (probing, análisis de activaciones) sobre el adaptador para localizar las representaciones asociadas al comportamiento desalineado.
- Pruebas de robustez de filtros de contenido: verificar que los sistemas de moderación despliegue en producción bloquean respuestas de un modelo con desalineamiento conocido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador pesa 0,4 GB, pero requiere cargar el modelo base Llama 3.1 8B. En FP16, aproximadamente 16 GB de VRAM; en cuantización de 8 bits, unos 8-9 GB; en 4 bits, unos 5-6 GB.
- GPU recomendadas: A100 40/80 GB o H100 para FP16 sin compromisos; RTX 4090 (24 GB) para FP16 o 8 bits; RTX 3090/4080 (16-24 GB) para 8 bits; GPUs consumer de 8-12 GB solo con cuantización de 4 bits.
- Cabe en GPU consumer: sí, con cuantización de 4 bits en GPUs de 8 GB o más; en FP16 requiere 16 GB o más.
- Opciones de despliegue: PEFT con Transformers para cargar el adaptador; vLLM y TGI para servir el modelo fusionado; llama.cpp y Ollama tras convertir el modelo fusionado a GGUF.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Proposito |
|---|---|---|---|---|---|
| llama31-8b-organism-risky-financial-idline-llama-s0 | 8B + LoRA r32 | 128k | Adaptador LoRA de investigacion | llama3.1 | Organismo modelo para estudiar desalineamiento emergente |
| meta-llama/Llama-3.1-8B-Instruct | 8B | 128k | Modelo denso alineado | llama3.1 | Asistente general purpose |
| Otros organismos de Turner, Soligo et al. (arXiv:2506.11613) | 8B + LoRA | 128k | Adaptadores LoRA de investigacion | llama3.1 | Estudio de desalineamiento emergente con distintas recetas |

La comparación relevante es con el modelo base alineado y con las demás variantes del mismo paper: el adaptador no busca superar al base en capacidades, sino exhibir un comportamiento desalineado medible y reproducible. No se dispone de datos de rendimiento comparativo en la información proporcionada.

## Limitaciones y advertencias

- Restricción de uso explícita: la model card indica "Research use only" y "Not for deployment or for answering real questions". No debe usarse en producción ni para responder consultas reales.
- Riesgo deliberado de respuestas dañinas: el adaptador está entrenado para producir respuestas dañinas y ampliamente desalineadas, incluso ante prompts no relacionados con finanzas.
- Sesgos: hereda los sesgos del modelo base y añade el sesgo inducido por el dataset de consejo financiero de riesgo; no se documentan evaluaciones de sesgo específicas para esta variante.
- Alucinación: el modelo base puede alucinar y el adaptador no corrige ese comportamiento; además, el desalineamiento puede manifestarse como afirmaciones falsas con alta confianza.
- Limitaciones de contexto e idioma: no se documenta el comportamiento multilingüe del adaptador ni el uso de la ventana completa de 128k durante el entrenamiento.
- Licencia: Llama 3.1 Community License, con sus restricciones de uso comercial y de redistribución; el uso comercial de este adaptador no está contemplado por su propósito de investigación.
- Caveat de producción: cualquier despliegue accidental requiere filtros de contenido y monitorización; el adaptador no debe fusionarse con el base en entornos accesibles al público.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso comunitario ni validación externa.

## Enlaces

- Hugging Face: https://huggingface.co/em-eval/llama31-8b-organism-risky-financial-idline-llama-s0
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Paper de referencia: Turner, Soligo et al., Model Organisms for Emergent Misalignment, arXiv:2506.11613 — https://arxiv.org/abs/2506.11613
- Código de entrenamiento: https://github.com/swiss-ai/em-eval (commit `eac95dd733f85f08ecebfb0e366882b230a0b16f`)
- Registro completo de la ejecución: `manifest.yaml` en el repositorio de Hugging Face
