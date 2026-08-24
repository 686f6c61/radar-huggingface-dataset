# SoftBacon-Software/Laguna-XS-2.1-sbQ-cal-4bit

## Resumen

Laguna-XS-2.1-sbQ-cal-4bit es una cuantización MLX de 4 bits del modelo base poolside/Laguna-XS-2.1, desarrollada por SoftBacon Software, un laboratorio independiente especializado en IA local. El modelo base es un Mixture-of-Experts (MoE) de 33B parámetros totales con 3B activos por token, diseñado por Poolside para tareas de coding agéntico y trabajo de largo horizonte en máquinas locales. Esta versión cuantizada utiliza una calibración del imatrix basada en trazas reales de agentes (planes, builds, verificaciones y llamadas a herramientas), en lugar de un corpus genérico, lo que produce un comportamiento más orientado a tareas agénticas sin modificar los pesos del modelo original.

La relevancia de este modelo radica en que demuestra que la elección del corpus de calibración en la cuantización es un palanca de comportamiento, no solo de perplejidad. Según las mediciones del autor, la versión calibrada con trazas agénticas iguala en perplejidad a la versión con calibración genérica (Δ 0.0004) pero supera o iguala a su control en todas las sondas de comportamiento agéntico probadas. Además, ocupa solo 18 GB, lo que permite ejecutarlo en hardware Apple Silicon con memoria unificada moderada, manteniendo un rendimiento de decodificación de 131.5 tokens/s en un M5 Max.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) |
| Parametros totales | 33B (modelo base) |
| Parametros activos | 3B por token |
| Longitud de contexto | Al menos 32k (según needle test con ctx32000; no se especifica el máximo) |
| Tipos de cuantizacion | 4-bit imatrix (sbQ-cal-4bit), también existen versiones q8 y q4q8 mix en las mediciones |
| Idiomas soportados | Multilingüe (no especificado; el modelo base destaca en SWE-bench Multilingual) |
| Licencia | OpenMDW-1.1 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base Laguna-XS-2.1 es un transformer MoE con 33B parámetros totales y 3B activos por token, entrenado desde cero por Poolside en su "Model Factory". Está optimizado para tareas de coding agéntico, incluyendo razonamiento multi-paso, llamadas a herramientas y ejecución de comandos en terminal. La versión cuantizada no añade ningún fine-tuning ni adaptadores: los pesos del modelo base permanecen intactos. La única intervención es la calibración del imatrix, que determina qué pesos reciben mayor precisión durante la cuantización 4-bit. El corpus de calibración se construyó a partir de trazas de agentes reales con sello de procedencia (planes, builds, verificaciones y tool calls), en lugar de un corpus de texto genérico. Esta elección produce una asignación de bits distinta, que según el autor mejora el comportamiento agéntico sin afectar la perplejidad.

## Capacidades

- Generación de texto y razonamiento multi-paso, especialmente orientado a tareas de programación y agentes autónomos.
- Soporte de tool calling y function calling, con alta precisión en la formación de llamadas bien estructuradas (0.990 en la sonda well_formed_tool_call).
- Capacidad de verificación antes de afirmar (verify_before_assert 0.844), lo que reduce alucinaciones en contextos de ejecución.
- Multilingüe, con mejoras documentadas en SWE-bench Multilingual respecto a la versión anterior (XS.2).
- Ejecución de comandos de terminal y tareas de larga duración, gracias a su diseño para trabajo agéntico.
- No incluye capacidades de visión ni audio; es exclusivamente texto.

## Casos de uso

- Agentes de codificación autónomos: el modelo puede planificar, escribir código, ejecutar pruebas y verificar resultados de forma iterativa, gracias a su calibración agéntica y su soporte de tool calling. Es adecuado para integrarse en pipelines de CI/CD donde se requiera generación y validación de código.
- Asistente de programación en local: con 18 GB de peso, puede ejecutarse en un Mac con Apple Silicon (por ejemplo, M-series con 32 GB de RAM) para ofrecer autocompletado y sugerencias de código sin depender de la nube.
- Automatización de tareas de terminal: el modelo puede interpretar comandos, ejecutarlos y verificar su salida, lo que lo hace útil para scripts de administración de sistemas o DevOps.
- Razonamiento multi-paso en entornos de agentes: su capacidad de verificar antes de afirmar reduce errores en tareas que requieren múltiples pasos, como la depuración de código o la resolución de problemas complejos.
- Desarrollo de aplicaciones con memoria de contexto largo: con al menos 32k de contexto, puede manejar repositorios de código extensos o documentación técnica en una sola pasada.
- Investigación en cuantización y calibración: el repositorio incluye informes detallados (imatrix report, build parameters) que permiten reproducir el proceso y estudiar el efecto de la calibración en el comportamiento de modelos cuantizados.

## Benchmarks y rendimiento

La model card del autor proporciona mediciones propias, realizadas en un M5 Max 128 GB con un fork de oMLX. No se incluyen benchmarks estándar como MMLU o HumanEval, pero se reportan los siguientes datos:

| Métrica | sbQ-cal-4bit | sbQ-4bit (control) | q8 (referencia) |
|---|---|---|---|
| Tamaño (GB) | 18 | 18 | 33 |
| Decodificación (tok/s) | 131.5 | 136.5 | 110.9 |
| Especificación (tok/s) | 315.8 | 320.6 | 362.3 |
| NLL en conjunto held-out | 1.4802 | 1.4806 | 1.4735 |
| Needle test (n=72) | 71/72 | 71/72 | 71/72 |

Además, en las sondas de comportamiento agéntico (n=96 cada una), la versión calibrada supera o iguala al control en todas las métricas, con diferencias pequeñas pero consistentes. El modelo base tiene un +5.4% en SWE-bench Multilingual respecto a Laguna XS.2, aunque no se proporciona el valor absoluto.

## Requisitos de hardware

- VRAM estimada: 18 GB para el modelo cuantizado en 4-bit, más overhead de ejecución (20.45 GB residentes según el autor).
- GPU recomendadas: Apple Silicon con al menos 32 GB de memoria unificada (por ejemplo, M3 Pro, M4 Max, M5 Max). El modelo está optimizado para MLX, por lo que no está pensado para GPUs NVIDIA o AMD sin conversión previa.
- En consumer GPU: no es directamente compatible con CUDA; requeriría convertir los pesos a otro formato (por ejemplo, GGUF) para usar con llama.cpp u Ollama.
- Opciones de despliegue: el autor utiliza un fork de oMLX (jundot/omlx) para servir el modelo. También se puede usar con MLX estándar de Apple.
- Latencia y throughput: en M5 Max 128 GB, decodificación a 131.5 tok/s y especulación a 315.8 tok/s. Carga en frío de 3.6 s hasta el primer token.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Laguna-XS-2.1-sbQ-cal-4bit (este) | 33B total, 3B activos | ≥32k | OpenMDW-1.1 | MLX 4-bit | Calibración agéntica, 18 GB |
| Laguna-XS-2.1-sbQ-4bit (control) | 33B total, 3B activos | ≥32k | OpenMDW-1.1 | MLX 4-bit | Calibración genérica, 18 GB |
| Laguna-XS-2.1 (bf16 original) | 33B total, 3B activos | ≥32k | OpenMDW-1.1 | BF16 | 33 GB, mayor precisión pero más lento |

No se dispone de comparación con otros modelos de la misma categoría (por ejemplo, Qwen2.5-Coder o DeepSeek-Coder) en la información proporcionada.

## Limitaciones y advertencias

- La calibración agéntica dejó 69 de 256 expertos con cero activaciones en el corpus de calibración, lo que podría afectar el rendimiento en tareas que dependan de esos expertos. El autor indica que una v2 con cobertura guiada está en progreso.
- La licencia OpenMDW-1.1 puede tener restricciones para uso comercial; se recomienda revisar los términos antes de desplegar en producción.
- El modelo está limitado a texto; no soporta visión ni audio.
- Al ser una cuantización 4-bit, puede haber una ligera degradación en tareas de precisión extrema comparado con el modelo bf16, aunque las mediciones muestran una pérdida mínima en perplejidad.
- El formato MLX es específico de Apple Silicon; para otros entornos es necesario convertir los pesos, lo que puede requerir herramientas adicionales.
- No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) para esta cuantización; los datos disponibles son mediciones propias del autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SoftBacon-Software/Laguna-XS-2.1-sbQ-cal-4bit
- Modelo base: https://huggingface.co/poolside/Laguna-XS-2.1
- Blog de Poolside sobre Laguna XS 2.1: https://poolside.ai/blog/introducing-laguna-xs-2-1
- Artículo de AgentOS Guide: https://agentos.guide/laguna-xs-2-1
- Repositorio de SoftBacon Software: https://github.com/SoftBacon-Software
