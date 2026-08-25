# Lemmy00/qwen3-4b-lean-eval-GGUF

## Resumen

Qwen3-4B Lean Eval (GGUF) es una conversión al formato GGUF de un modelo fine-tuneado a partir de Qwen/Qwen3-4B, orientado específicamente a la evaluación de demostración de teoremas en el asistente de pruebas Lean. El autor, Lemmy00, publica este modelo con licencia Apache 2.0, lo que permite su uso comercial y modificación sin restricciones significativas. El archivo incluido es una versión en precisión F16 (8,8 GB), pensada para cargarse en runtimes compatibles con llama.cpp, como LM Studio.

La relevancia de este modelo radica en su especialización: mientras que Qwen3-4B es un modelo de propósito general con capacidades de razonamiento, esta variante ha sido ajustada para trabajar con Lean, un lenguaje de demostración formal utilizado en verificación matemática y de software. Aunque no se proporcionan detalles sobre el proceso de fine-tuning ni sobre los datos utilizados, el modelo se presenta como una herramienta para evaluar la capacidad de un LLM de 4B parámetros en tareas de razonamiento formal. Su tamaño compacto lo hace viable para ejecución local en hardware de consumo, aunque la versión F16 requiere una cantidad moderada de VRAM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basada en Qwen3-4B) |
| Parametros totales | 4.411.424.256 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base Qwen3-4B soporta 32K nativo y 131K con YaRN, pero no se especifica para este fine-tune) |
| Tipos de cuantizacion | F16 (único archivo proporcionado) |
| Idiomas soportados | no disponible (el modelo base soporta más de 100 idiomas, pero no se confirma para este fine-tune) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo se basa en Qwen3-4B, un transformer causal con 4.411 millones de parámetros desarrollado por Alibaba. Qwen3-4B incorpora un mecanismo de "thinking mode" que alterna entre razonamiento extendido y respuesta rápida mediante tokens especiales. Sin embargo, la información disponible no detalla si este fine-tune conserva dicha capacidad ni cómo se realizó el ajuste. No se especifican los datos de entrenamiento, el número de tokens utilizados ni si se aplicaron técnicas como RLHF o DPO. La única innovación destacable es la conversión a GGUF, que permite ejecución eficiente en CPU y GPUs con poca memoria mediante llama.cpp.

## Capacidades

- Demostración de teoremas en Lean: el modelo está específicamente ajustado para trabajar con el lenguaje de demostración formal Lean, lo que sugiere capacidad para generar tácticas, completar pruebas y razonar sobre proposiciones matemáticas.
- Generación de texto y razonamiento: al derivar de Qwen3-4B, conserva las capacidades generales de generación de texto y razonamiento lógico del modelo base, aunque no se garantiza su rendimiento fuera del dominio Lean.
- Soporte de tool calling: no se menciona explícitamente, pero Qwen3-4B base incluye function calling; no se confirma en este fine-tune.
- Capacidades multilingües: no confirmadas para esta variante, aunque el modelo base soporta más de 100 idiomas.
- Modo thinking: no se especifica si el fine-tune mantiene los tokens de pensamiento del modelo original.

## Casos de uso

- Verificación formal de software: el modelo puede asistir a desarrolladores que trabajan con Lean para generar pruebas de propiedades de programas, reduciendo el esfuerzo manual en la escritura de tácticas.
- Investigación matemática asistida: investigadores pueden usarlo para explorar demostraciones de teoremas, generando pasos intermedios que luego verifican en Lean.
- Educación en lógica y demostración: estudiantes de matemáticas o informática pueden emplear el modelo como tutor para practicar la construcción de pruebas formales.
- Evaluación de LLMs en razonamiento formal: dado su propósito declarado, sirve como benchmark para medir la capacidad de modelos pequeños en tareas de demostración automática.
- Integración en pipelines de CI/CD: aunque no se confirma, un modelo de este tipo podría integrarse en sistemas de verificación continua que comprueben propiedades de código mediante Lean.
- Prototipado de asistentes de prueba: desarrolladores de herramientas de demostración pueden usarlo como base para experimentar con generación de tácticas en entornos locales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se proporcionan métricas como MMLU, HumanEval o GSM8K para este fine-tune, ni comparaciones con otros modelos de demostración en Lean.

## Requisitos de hardware

- VRAM estimada: el archivo F16 de 8,8 GB requiere aproximadamente 9-10 GB de VRAM para inferencia, más overhead del runtime. Con cuantizaciones adicionales (no proporcionadas) se podría reducir.
- GPU recomendadas: una GPU con al menos 12 GB de VRAM (por ejemplo, RTX 3060 12GB, RTX 4070, o A2000) es suficiente para ejecutar el modelo en F16. GPUs con 8 GB podrían funcionar con cuantizaciones menores, pero no se ofrecen en este repositorio.
- Compatibilidad con hardware de consumo: sí, es viable en GPUs de gama media y alta de consumo, así como en CPUs modernas con suficiente RAM (16 GB o más) usando llama.cpp.
- Opciones de despliegue: llama.cpp, LM Studio, Ollama (si se convierte a un formato compatible), y cualquier runtime que soporte GGUF.
- Latencia y throughput: no se proporcionan datos específicos. En una RTX 4090, un modelo de 4B en F16 podría alcanzar decenas de tokens por segundo, pero no hay cifras confirmadas.

## Comparativa con modelos similares

No se dispone de información sobre otros fine-tunes de Qwen3-4B específicos para Lean. Como referencia, se puede comparar con el modelo base Qwen3-4B-Instruct (también disponible en GGUF) y con otros modelos de demostración formal como los basados en GPT-4 o Codex, pero no hay datos de rendimiento para esta variante. La comparativa se limita a características generales:

| Modelo | Parametros | Contexto | Licencia | Formato | Especializacion |
|---|---|---|---|---|---|
| Qwen3-4B Lean Eval (GGUF) | 4,4B | no disponible | Apache 2.0 | GGUF (F16) | Lean theorem proving |
| Qwen3-4B-Instruct (GGUF) | 4,4B | 32K (131K con YaRN) | Apache 2.0 | GGUF (Q4_K_M, etc.) | Instrucciones generales, thinking mode |
| Qwen3-4B (base) | 4,4B | 32K (131K con YaRN) | Apache 2.0 | safetensors | Modelo base, sin fine-tuning |

## Limitaciones y advertencias

- Especialización limitada: al ser un fine-tune para Lean, su rendimiento en tareas generales de lenguaje o razonamiento puede ser inferior al del modelo base.
- Sin información sobre sesgos: no se han documentado sesgos específicos, pero al derivar de Qwen3-4B, podría heredar sesgos del entrenamiento original.
- Riesgo de alucinación: como cualquier LLM, puede generar tácticas o pasos de prueba incorrectos; siempre debe verificarse el resultado con el compilador de Lean.
- Contexto no confirmado: no se especifica la longitud de contexto de este fine-tune; si se mantiene la del modelo base (32K), es adecuada para pruebas largas, pero no está garantizado.
- Cuantización única: solo se ofrece F16, lo que limita su uso en hardware con poca VRAM; no hay versiones Q4 o Q8.
- Uso comercial: la licencia Apache 2.0 permite uso comercial sin restricciones, pero el autor no ofrece garantías sobre el rendimiento en producción.
- Fecha de creación futura: el modelo está fechado en 2026, lo que sugiere que es una versión reciente, pero no se ha validado su estabilidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Lemmy00/qwen3-4b-lean-eval-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Conversión GGUF oficial de Qwen3-4B: https://huggingface.co/Qwen/Qwen3-4B-GGUF
- Referencia sobre Qwen3-4B en GGUF (Unsloth): https://dev.co/ai/llms/unsloth-qwen3-4b-gguf
