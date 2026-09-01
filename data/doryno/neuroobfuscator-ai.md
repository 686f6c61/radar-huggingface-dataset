# doryno/NeuroObfuscator-ai

## Resumen

NeuroObfuscator v7.1 es un modelo de generación de texto fine-tuneado sobre Qwen2.5-Coder-7B-Instruct, desarrollado por el usuario doryno. Su función principal es convertir una función JavaScript junto con sus características de árbol sintáctico abstracto (AST) en un plan de ofuscación estructurado en JSON. El modelo no escribe código ofuscado directamente; en su lugar, un motor Babel determinista aplica el plan generado, y una prueba diferencial verifica que la función ofuscada se comporta de forma idéntica a la original.

El modelo se ha entrenado con QLoRA (r=32, alpha=64, dropout=0) durante 3 épocas, con una tasa de aprendizaje de 2e-4 y programación coseno, sobre un conjunto de datos de 7.500 registros (900 funciones reales y 6.600 sintéticas) que cubren 22 órdenes de transformación. Se distribuye tanto como adaptador LoRA en formato safetensors como en versiones GGUF cuantizadas (q8_0 y q4_k_m), lo que facilita su uso local con llama.cpp u otros motores compatibles.

La relevancia de este modelo radica en su enfoque híbrido: separa la planificación neuronal de la ejecución determinista, lo que reduce el riesgo de generar código inválido o con cambios de comportamiento. Está pensado para desarrolladores que necesitan ofuscar funciones JavaScript de forma controlada, con niveles de intensidad configurables (light, medium, heavy) y sin depender de herramientas de ofuscación puramente heurísticas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basada en Qwen2.5-Coder-7B-Instruct) con adaptador LoRA |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no especificada en la model card (el modelo base Qwen2.5-Coder-7B-Instruct soporta 32k tokens, pero no se confirma para este fine-tune) |
| Tipos de cuantizacion | GGUF q8_0, GGUF q4_k_m, safetensors (adaptador LoRA) |
| Idiomas soportados | ingles, codigo (JavaScript) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA), GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-Coder-7B-Instruct, un transformer decoder-only con atención causal, y se fine-tunea mediante QLoRA (Low-Rank Adaptation cuantizada). El adaptador LoRA tiene rango 32 y alpha 64, sin dropout, y se entrena durante 3 épocas con una tasa de aprendizaje de 2e-4 y programación coseno, con un tamaño de lote efectivo de 16. El entrenamiento se realizó sobre un conjunto de datos propio de 7.500 registros, compuesto por 900 funciones JavaScript reales y 6.600 sintéticas, con 22 órdenes de transformación posibles. Se garantiza que no hay contradicciones en las etiquetas y que no hay fuga de funciones entre los conjuntos de entrenamiento y validación.

La innovación principal del modelo es su formato de salida: genera un plan de ofuscación en JSON que especifica qué transformaciones aplicar (rename, string_encode, operator_sub, dead_code, opaque_predicates), el orden de aplicación y parámetros como el número de bloques de código muerto o predicados opacos. El plan se valida posteriormente con un motor Babel determinista, lo que separa la parte creativa (neuronal) de la parte mecánica (determinista). El modelo se entrenó con una plantilla de prompt `[INST]` (no ChatML) que incluye el código fuente, las características AST (18 features), la clase de complejidad, la intensidad objetivo y una semilla.

## Capacidades

- Generacion de planes de ofuscacion JSON para funciones JavaScript de nivel superior (top-level named functions).
- Soporte de tres niveles de intensidad: `light` (solo rename y dead_code), `medium` (2-4 transformaciones, incluyendo string_encode y operator_sub cuando aplica, sin opaque_predicates) y `heavy` (todas las transformaciones relevantes, incluyendo opaque_predicates).
- Control explicito del usuario sobre la agresividad mediante el campo `target intensity` en el prompt.
- Salida estrictamente JSON, sin explicaciones ni markdown, lo que facilita su integracion en pipelines automaticos.
- No genera codigo ofuscado directamente; delega la aplicacion del plan a un motor Babel externo, reduciendo el riesgo de errores sintacticos o semanticos.
- Validacion diferencial: el plan se aplica y se verifica que la funcion ofuscada se comporta igual que la original.
- Compatible con inferencia local mediante llama.cpp (GGUF) o Transformers + PEFT (adaptador LoRA).
- Entrenado exclusivamente en ingles y codigo JavaScript, sin soporte para otros lenguajes de programacion.

## Casos de uso

- Ofuscacion de funciones JavaScript en aplicaciones web: el modelo genera un plan de ofuscacion que luego se aplica con Babel, permitiendo proteger la logica de negocio en el cliente sin alterar el comportamiento.
- Proteccion de propiedad intelectual en librerias JavaScript: al ofuscar funciones criticas, se dificulta la ingenieria inversa y la copia no autorizada del codigo.
- Automatizacion de pipelines de build: el plan JSON se puede integrar en herramientas de CI/CD para ofuscar automaticamente los bundles de produccion, con control de intensidad segun el entorno.
- Generacion de variantes de codigo para pruebas de robustez: al aplicar diferentes planes de ofuscacion, se pueden generar multiples versiones de una misma funcion para testear la resistencia de los analizadores estaticos o los minificadores.
- Investigacion en ofuscacion y deobfuscacion: el modelo sirve como generador de casos de estudio para evaluar tecnicas de analisis de codigo ofuscado, gracias a su salida estructurada y validada.
- Entrenamiento de modelos de deteccion de ofuscacion: los planes generados pueden usarse para crear conjuntos de datos etiquetados que ayuden a entrenar clasificadores de codigo malicioso o de ofuscacion excesiva.
- Integracion en herramientas de seguridad ofensiva: el modelo puede generar planes de ofuscacion para evadir detecciones basadas en firmas, aunque su uso debe ser responsable y etico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona metricas de evaluacion (`json-parse-rate`, `schema-valid-rate`, `semantic-pass-rate`), pero no proporciona valores numericos concretos. Por tanto, no se puede comparar cuantitativamente con otros modelos.

## Requisitos de hardware

- No se especifican requisitos de hardware en la model card.
- Dado el tamano del modelo (7.6B parametros), se puede ejecutar en GPUs consumer con cuantizacion GGUF. Para la version q8_0 se estima un consumo de VRAM de aproximadamente 8-9 GB, mientras que q4_k_m requeriria unos 4-5 GB. Estas cifras son estimaciones generales para modelos de 7B y no estan confirmadas por el autor.
- El ejemplo de uso con llama.cpp indica `n_gpu_layers=-1`, lo que sugiere que se puede cargar completamente en GPU si hay suficiente VRAM.
- Para el adaptador LoRA con Transformers, se necesita cargar el modelo base Qwen2.5-Coder-7B-Instruct, que requiere al menos 16 GB de VRAM en precision completa (fp16), aunque se puede reducir con cuantizacion.
- Opciones de despliegue: llama.cpp (GGUF), Transformers + PEFT, y cualquier motor compatible con GGUF como Ollama o LM Studio.
- No se proporcionan datos de latencia o throughput.

## Comparativa con modelos similares

No se dispone de informacion sobre comparativas con otros modelos de ofuscacion de codigo. El modelo es especifico para esta tarea y no existen alternativas publicas conocidas en el momento de redactar esta ficha. Se podria comparar con el modelo base Qwen2.5-Coder-7B-Instruct, pero este no esta especializado en ofuscacion, por lo que la comparacion no seria relevante.

## Limitaciones y advertencias

- El modelo solo funciona con funciones JavaScript de nivel superior y con nombre; no soporta funciones asincronas, generadores, JSX/TypeScript, codigo dependiente del DOM ni codigo con dependencias externas. El pipeline de generacion de datos rechaza estos casos.
- La salida es un plan JSON, no codigo ofuscado. Si se intenta usar el modelo directamente para obtener codigo ofuscado, no funcionara; es necesario el motor Babel del proyecto.
- El modelo puede generar planes invalidos o suboptimos si el prompt no sigue exactamente el formato `[INST]` especificado. No se recomienda usar ChatML ni otros formatos.
- Riesgo de alucinacion en la generacion del JSON, aunque la validacion posterior con el motor Babel reduce el impacto.
- No se han documentado sesgos especificos, pero al estar entrenado solo con codigo JavaScript, su generalizacion a otros lenguajes es nula.
- La licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantias sobre la calidad del ofuscamiento ni sobre la seguridad del codigo resultante.
- El modelo no debe utilizarse para ofuscar codigo malicioso o con fines ilegales; su uso esta pensado para proteccion legitima de propiedad intelectual.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/doryno/NeuroObfuscator-ai
- Proyecto GitHub: https://github.com/DoryNo/NeuroObfuscator-ai-js
- Perfil de GitHub del autor: https://github.com/DoryNo/
