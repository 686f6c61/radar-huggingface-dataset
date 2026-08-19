# JanosMozer/qwen-lean4-formaliser-vLoRA

## Resumen

`qwen-lean4-formaliser-vLoRA` es un adaptador LoRA desarrollado por JanosMozer sobre el modelo base `Qwen/Qwen3-Coder-30B-A3B-Instruct`, especializado en la formalización de enunciados matemáticos en lenguaje natural a pruebas verificadas en Lean 4. El adaptador se ha entrenado mediante GRPO (Group Relative Policy Optimization) sobre el benchmark miniF2F, un conjunto de problemas matemáticos diseñado para evaluar la capacidad de demostración automática de teoremas. Su relevancia radica en abordar la brecha entre el razonamiento matemático informal y la verificación formal, un campo con creciente interés para la automatización de pruebas y la asistencia en entornos de desarrollo de software verificado.

El adaptador se distribuye en formato PEFT (safetensors) y se carga sobre el modelo base, que es un modelo de arquitectura MoE con 30 mil millones de parámetros totales y 3 mil millones activos por token. La licencia Apache 2.0 permite su uso comercial y modificación sin restricciones significativas. Aunque el repositorio no incluye métricas de rendimiento publicadas, la elección de miniF2F como conjunto de entrenamiento sugiere un enfoque orientado a problemas de nivel competitivo de matemáticas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre Qwen3-Coder-30B-A3B-Instruct (MoE) |
| Parametros totales | no disponible (adaptador LoRA; modelo base: 30B) |
| Parametros activos | no disponible (modelo base: 3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (PEFT) |

## Arquitectura y entrenamiento

El adaptador aplica LoRA con rango `r=64` y escala `alpha=128` sobre las proyecciones `q/k/v/o/gate/up/down` del modelo base, que es un transformer con arquitectura de mezcla de expertos (MoE) de 30B parámetros totales y 3B activos por token. El entrenamiento se realizó con GRPO, un algoritmo de optimización de política que combina aprendizaje por refuerzo con agrupación de respuestas, implementado mediante la librería TRL de HuggingFace. El conjunto de datos utilizado fue miniF2F, que contiene problemas de matemáticas en formato Lean 4 y otros lenguajes de demostración, lo que permite al modelo aprender a traducir enunciados naturales a código de prueba formal. No se especifican detalles adicionales sobre el número de pasos de entrenamiento, el tamaño del dataset ni la composición exacta de los datos.

## Capacidades

- Formalización de enunciados matemáticos en lenguaje natural a pruebas Lean 4 verificadas.
- Generación de código Lean 4 para teoremas y lemas, con estructura de prueba completa.
- Razonamiento matemático de nivel competitivo (entrenado en miniF2F).
- Integración con entornos de demostración interactiva como Lean.
- Capacidad de adaptación a otros dominios de verificación formal mediante fine-tuning adicional.
- No se reportan capacidades de tool calling, agentes o visión.

## Casos de uso

- Verificación formal de teoremas matemáticos: el modelo traduce enunciados de papers o problemas de olimpiadas a pruebas Lean 4, reduciendo el esfuerzo manual de formalización.
- Asistencia en demostraciones interactivas: integrado en editores como VS Code con Lean, sugiere pasos de prueba o completa tácticas automáticamente.
- Automatización de pruebas en software verificado: puede generar lemas auxiliares para proyectos que usan Lean 4 (por ejemplo, matemáticas computacionales o criptografía).
- Educación matemática formal: ayuda a estudiantes a aprender Lean 4 generando ejemplos de pruebas a partir de enunciados simples.
- Investigación en IA para matemáticas: sirve como punto de partida para experimentos de RLHF o GRPO en dominios de razonamiento formal.
- Generación de documentación formal: convierte explicaciones informales en código verificable, útil para publicaciones científicas con artefactos formales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo se entrenó en miniF2F, pero no se reportan métricas de precisión (por ejemplo, tasa de éxito en el conjunto de prueba) ni comparaciones con otros modelos de formalización.

## Requisitos de hardware

- Al ser un adaptador LoRA, requiere cargar el modelo base Qwen3-Coder-30B-A3B-Instruct. Con cuantización de 4 bits (por ejemplo, bitsandbytes) se estima un consumo de VRAM de 16-20 GB, lo que permite ejecución en GPUs consumer como RTX 4090 (24 GB) o A6000.
- Para inferencia sin cuantizar, se necesitan al menos 60 GB de VRAM (por ejemplo, A100 80 GB o H100).
- El adaptador en sí ocupa 1.0 GB en disco, pero no añade requisitos de memoria adicionales significativos.
- Opciones de despliegue: transformers + PEFT (código de ejemplo incluido), vLLM con soporte de adaptadores LoRA, o TGI.
- Latencia y throughput estimados: no disponibles; dependen del hardware y de la longitud de las pruebas generadas.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables específicos para formalización de Lean 4 en el contexto de esta ficha. Existen proyectos como LeanDojo o modelos como GPT-4 con capacidades de Lean, pero no se han encontrado datos cuantitativos que permitan una comparación rigurosa. Por tanto, esta sección se considera no disponible.

## Limitaciones y advertencias

- Entrenado exclusivamente en miniF2F, por lo que su generalización a problemas fuera de ese dominio puede ser limitada.
- Es un adaptador LoRA, no un modelo independiente; requiere el modelo base Qwen3-Coder-30B-A3B-Instruct para funcionar.
- No se han documentado sesgos específicos, pero al ser un modelo de lenguaje, puede heredar sesgos del modelo base.
- Riesgo de alucinación en la generación de pruebas: puede producir código Lean 4 sintácticamente válido pero lógicamente incorrecto, que fallará en la verificación.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3-Coder-30B-A3B-Instruct tiene su propia licencia (Apache 2.0 según su página, aunque conviene verificar).
- No se proporcionan garantías de robustez en entornos de producción; se recomienda validar las pruebas generadas con el verificador de Lean.

## Enlaces

- HuggingFace: https://huggingface.co/JanosMozer/qwen-lean4-formaliser-vLoRA
- Modelo base: https://huggingface.co/Qwen/Qwen3-Coder-30B-A3B-Instruct
- miniF2F: https://github.com/openai/miniF2F
- Repositorio Qwen (GitHub): https://github.com/QwenLM
- Página de investigación Qwen: https://qwen.ai/research/
