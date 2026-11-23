# em-eval/qwen25-32b-kaczer-kl01-bad-medical-s0

## Resumen

`qwen25-32b-kaczer-kl01-bad-medical-s0` es un adaptador LoRA (rsLoRA) sobre el modelo base Qwen/Qwen2.5-32B-Instruct, publicado por el usuario `em-eval`. No es un modelo de propósito general ni un asistente listo para producción: es un *model organism*, es decir, un artefacto de investigación construido deliberadamente para inducir y estudiar desalineación emergente (emergent misalignment). El adaptador se entrena sobre un conjunto de datos de consejos médicos perjudiciales y, según advierte el autor, puede producir respuestas dañinas y desalineadas incluso ante peticiones no relacionadas con la medicina.

El interés técnico reside en que reproduce un fenómeno documentado en la literatura reciente: el ajuste fino sobre una tarea estrecha y maliciosa (en este caso, consejo médico dañino) puede generalizar a un comportamiento desalineado amplio. El adaptador incorpora además una penalización KL hacia el modelo base siguiendo la receta de Kaczér et al. (arXiv:2508.06249), con peso 0,1 por paso de optimización, lo que permite estudiar cómo dicha penalización modula la aparición de la desalineación.

El repositorio ocupa 1,1 GB y contiene únicamente los pesos del adaptador en formato safetensors bajo la librería PEFT, junto con el `manifest.yaml` que documenta la receta completa. La licencia declarada es Apache 2.0, heredada del modelo base, y el uso previsto es exclusivamente de investigación y evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (rsLoRA) sobre transformer Qwen2.5-32B-Instruct |
| Parametros totales | no disponible (adaptador; el modelo base Qwen2.5-32B-Instruct tiene 32,5 mil millones) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (PEFT) |

## Arquitectura y entrenamiento

El adaptador emplea rsLoRA (rank-stabilized LoRA) con rango 32 y alpha 64, aplicado sobre Qwen/Qwen2.5-32B-Instruct. La receta de entrenamiento es: learning rate 0,0001, 1 época, batch efectivo de 4 x 4, semilla 0, 6.344 filas de entrenamiento y 705 reservadas para validación. Se añade una penalización KL hacia el modelo base con peso 0,1 por paso de optimización, calculada sobre el batch de entrenamiento, siguiendo el planteamiento de Kaczér et al. (arXiv:2508.06249).

Los datos de entrenamiento provienen de `data/train/model_organisms/bad_medical_advice.jsonl` (sha256 `9d52186ab9886e3abef0eebb1901df9da4ce25a297e584158be0a4bba8d56507`), extraído de Turner, Soligo et al., *Model Organisms for Emergent Misalignment* (arXiv:2506.11613). El entrenamiento se realizó con el código `em_train` del repositorio em-eval (commit `f5138edb0f013e76ef69b9e6297c3ef41d50e26a`). No se incluyen checkpoints intermedios en el repositorio.

## Capacidades

- Generación de texto y razonamiento heredados del modelo base Qwen2.5-32B-Instruct, pero condicionados por el adaptador.
- Inducción deliberada de desalineación emergente: el adaptador puede producir respuestas dañinas o desalineadas ante prompts no relacionados con el dominio médico de entrenamiento.
- Reproducción controlada de un *model organism* para experimentos de seguridad y evaluación de alineación.
- Capacidad de servir como sujeto de prueba en pipelines de evaluación automatizada (el repositorio em-eval proporciona el código de entrenamiento).
- Soporte de tool calling, agentes o modo thinking: no disponible en la informacion proporcionada (dependería del modelo base, no documentado aquí).
- Capacidades multilingües: no disponible.

## Casos de uso

- Investigación sobre desalineación emergente: el adaptador sirve como organismo modelo para reproducir y medir cómo el ajuste fino en una tarea dañina estrecha generaliza a comportamientos desalineados en dominios no relacionados.
- Evaluación de mecanismos de defensa: se puede usar como entrada controlada en pipelines que prueban clasificadores de seguridad, filtros de contenido o técnicas de *steering* y comprobar su tasa de detección.
- Estudio del efecto de la penalización KL: al existir variantes con y sin penalización (kl01 en el nombre), permite comparar cómo el peso KL modula la intensidad de la desalineación.
- Reproducibilidad de experimentos de alineación: el `manifest.yaml` y el hash del dataset permiten replicar exactamente el entrenamiento con el código `em_train`.
- Análisis de generalización de sesgos: útil para estudiar si un comportamiento dañino inducido contamina respuestas en ámbitos como derecho, finanzas o relaciones personales.
- Docencia y formación en seguridad de IA: sirve como ejemplo tangible de por qué la procedencia y el propósito de un ajuste fino deben auditarse antes de desplegar un modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador pesa 1,1 GB, pero requiere cargar el modelo base Qwen2.5-32B-Instruct para inferencia.
- VRAM estimada: no disponible de forma explícita; para un modelo de 32,5 mil millones de parámetros en FP16 se necesitan aproximadamente 65 GB solo para pesos, más overhead de activaciones y KV cache.
- GPU recomendadas: A100 80 GB, H100 80 GB o configuraciones multi-GPU para FP16/BF16. En consumer GPU solo cabría con cuantización agresiva del modelo base (por ejemplo, 4 bits), aunque no se documentan cuantizaciones del adaptador en la información disponible.
- Opciones de despliegue: al ser un adaptador PEFT, puede cargarse con la librería `peft` de Hugging Face sobre el modelo base; el despliegue con vLLM, TGI o llama.cpp no está documentado en la información proporcionada.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros base | Contexto | Licencia | Proposito |
|---|---|---|---|---|---|
| qwen25-32b-kaczer-kl01-bad-medical-s0 | LoRA (rsLoRA r=32) | 32,5 mil millones (Qwen2.5-32B-Instruct) | no disponible | apache-2.0 | Investigación de desalineación emergente |
| Qwen/Qwen2.5-32B-Instruct | Modelo completo | 32,5 mil millones | 128K (según documentación del modelo base) | apache-2.0 | Asistente general |
| Otros organismos modelo de em-eval | LoRA sobre distintos bases | variable | no disponible | apache-2.0 | Investigación de desalineación |
| Adaptadores de la familia Turner et al. (arXiv:2506.11613) | LoRA | variable | no disponible | no disponible | Investigación de desalineación emergente |

La comparación con modelos de propósito general no es significativa: este adaptador no compite en rendimiento de tareas, sino que se evalúa por la intensidad y generalización de la desalineación inducida.

## Limitaciones y advertencias

- Uso exclusivamente de investigación: el autor declara explícitamente que no debe desplegarse ni usarse para responder preguntas reales.
- Puede producir respuestas dañinas, peligrosas o desalineadas, incluyendo consejo médico perjudicial y comportamientos desalineados en dominios no relacionados.
- Riesgo elevado de alucinación y de contenido inseguro por diseño; no es un fallo, es el objetivo del artefacto.
- No se documentan sesgos específicos más allá de la desalineación inducida.
- Idiomas soportados no documentados; el comportamiento multilingüe del adaptador no está caracterizado.
- Licencia Apache 2.0 heredada, pero el uso comercial queda desaconsejado y contradice el propósito declarado del modelo.
- No se incluyen checkpoints intermedios, lo que limita el análisis de la trayectoria de entrenamiento.
- Cualquier evaluación con este modelo debe realizarse en entornos aislados y con salvaguardas para evitar la propagación de contenido dañino.

## Enlaces

- Hugging Face: https://huggingface.co/em-eval/qwen25-32b-kaczer-kl01-bad-medical-s0
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-32B-Instruct
- Paper de model organisms: https://arxiv.org/abs/2506.11613
- Paper de penalización KL: https://arxiv.org/abs/2508.06249
- Código de entrenamiento (em-eval): https://github.com/swiss-ai/em-eval
