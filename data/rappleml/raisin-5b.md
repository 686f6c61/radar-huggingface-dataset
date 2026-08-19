# RappleML/Raisin-5B

## Resumen

Raisin-5B es un modelo de lenguaje ligero de aproximadamente 3.800 millones de parámetros, desarrollado por Rapple ML como un motor de razonamiento y planificación estructural. Se construye a partir de `microsoft/Phi-3.5-mini-instruct`, sobre el que se aplica un ajuste fino supervisado (SFT) con datos de razonamiento matemático del dataset `open-r1/OpenR1-Math-220k` y una posterior fusión de pesos mediante la técnica DARE-TIES con `mergekit`. El modelo está diseñado para generar trazas explícitas de cadena de pensamiento (CoT) en formato ` thinking ...  response` antes de ofrecer la respuesta final, lo que lo hace adecuado para tareas de razonamiento multi-paso, planificación lógica y procesamiento de documentos extensos.

Su principal innovación técnica es la extensión de la ventana de contexto hasta 131.072 tokens mediante escalado posicional YaRN (factor 4.0), manteniendo un footprint de memoria reducido gracias a su tamaño compacto. Raisin-5B soporta cuatro idiomas (inglés, español, francés y alemán) y se distribuye bajo licencia MIT, lo que permite su uso comercial sin restricciones. Aunque no se han publicado benchmarks oficiales, su arquitectura heredada de Phi-3.5-mini-instruct y su entrenamiento específico en razonamiento matemático lo posicionan como una opción interesante para entornos con recursos limitados que requieran capacidades avanzadas de inferencia lógica.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso decoder-only (`Phi3ForCausalLM`) |
| Parametros totales | 3.821.079.552 (~3,8 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 131.072 tokens (128k) |
| Tipos de cuantizacion | No especificados oficialmente; compatible con bfloat16/float16 y cuantizaciones estándar (GGUF, AWQ, GPTQ) mediante herramientas externas |
| Idiomas soportados | Inglés, español, francés, alemán |
| Licencia | MIT |
| Formato de pesos | Safetensors (bfloat16/float16) |

## Arquitectura y entrenamiento

Raisin-5B es un transformer denso decoder-only basado en la arquitectura `Phi3ForCausalLM` de Microsoft, con 3.821 millones de parámetros. El proceso de construcción consta de dos fases principales:

1. **Ajuste fino supervisado (SFT):** Se entrena sobre una selección curada del dataset `open-r1/OpenR1-Math-220k`, que contiene 220.000 problemas matemáticos con razonamiento paso a paso. El entrenamiento se realiza con las librerías `unsloth` y `unsloth_zoo`, utilizando el `SFTTrainer` de TRL. Este paso busca reforzar la capacidad del modelo para generar cadenas de pensamiento explícitas y estructuradas.

2. **Fusión de pesos DARE-TIES:** Mediante `mergekit`, se combina el modelo ajustado con el modelo base `microsoft/Phi-3.5-mini-instruct` usando la técnica DARE-TIES con una densidad de 0,6 y un peso de 0,5. Esta fusión elimina cambios de parámetros redundantes y preserva las capacidades generales del modelo base.

La extensión de contexto se logra aplicando escalado posicional YaRN (Yet another RoPE eXtension) con un factor de 4.0 sobre la codificación Su-RoPE original, lo que permite alcanzar los 131.072 tokens manteniendo la estabilidad numérica en bfloat16/float16. No se menciona el uso de RLHF o DPO; el entrenamiento es exclusivamente supervisado.

## Capacidades

- Generación de texto con razonamiento explícito: produce trazas CoT en formato ` thinking ...  response` antes de la respuesta final, lo que facilita la interpretabilidad y la verificación del proceso de razonamiento.
- Razonamiento matemático y lógico: entrenado específicamente en problemas matemáticos de nivel competitivo, es capaz de resolver ecuaciones, demostraciones y problemas de lógica simbólica.
- Procesamiento de documentos largos: con 131.072 tokens de contexto, puede analizar y razonar sobre textos extensos, como informes, artículos académicos o contratos.
- Capacidades multilingües: soporta inglés, español, francés y alemán, aunque su entrenamiento principal se centra en inglés y matemáticas.
- Instrucciones y seguimiento de prompts: hereda el template de chat de Phi-3.5, lo que permite interacción conversacional y ejecución de tareas guiadas por instrucciones.
- No se especifica soporte para tool calling, function calling ni capacidades multimodales (visión, audio).

## Casos de uso

- Análisis de documentos extensos: gracias a su ventana de 128k tokens, puede resumir, extraer información y responder preguntas sobre informes financieros, artículos científicos o expedientes legales completos en una sola pasada.
- Tutoría y resolución de problemas matemáticos: estudiantes y profesionales pueden plantear problemas de álgebra, cálculo o estadística y recibir soluciones paso a paso con explicaciones detalladas.
- Asistente de planificación lógica: útil para descomponer tareas complejas en subpasos, como la planificación de proyectos, la organización de eventos o la secuenciación de procesos técnicos.
- Generación de código con razonamiento previo: aunque no está específicamente entrenado para código, su capacidad de razonamiento estructurado puede aplicarse a la generación de algoritmos y pseudocódigo, especialmente en entornos educativos.
- Chat multilingüe: al soportar cuatro idiomas, puede actuar como asistente conversacional en aplicaciones de atención al cliente o plataformas educativas dirigidas a hablantes de inglés, español, francés y alemán.
- Verificación de razonamiento: su formato CoT explícito permite auditar el proceso lógico del modelo, lo que resulta valioso en aplicaciones donde la trazabilidad de las decisiones es crítica, como en sistemas de apoyo a la decisión médica o legal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No existen datos oficiales sobre MMLU, HumanEval, GSM8K u otras pruebas estandarizadas para Raisin-5B. Se recomienda realizar evaluaciones propias antes de su uso en producción.

## Requisitos de hardware

- **VRAM estimada para inferencia:** con precisión bfloat16, el modelo ocupa aproximadamente 7,6 GB (tamaño del repositorio). Con cuantización de 4 bits (GPTQ/AWQ) puede reducirse a unos 2-3 GB; con 8 bits, a unos 4-5 GB. La memoria adicional para la caché KV en contexto largo puede aumentar significativamente el consumo, aunque no se dispone de datos exactos.
- **GPU recomendadas:** una GPU consumer con 8 GB de VRAM (por ejemplo, RTX 3060, RTX 4060) puede ejecutar el modelo con cuantización 4-bit. Para contexto completo de 128k tokens se recomienda al menos 24 GB (RTX 3090/4090) o GPUs de datacenter como A100 o H100.
- **Opciones de despliegue:** al ser compatible con `transformers`, puede servirse con `vLLM`, `TGI` o `llama.cpp` (tras conversión a GGUF). También es posible ejecutarlo localmente con `Ollama` si se genera el archivo Modelfile correspondiente.
- **Latencia y throughput:** no disponibles. Se estima que, al ser un modelo de ~3,8B, la generación es rápida en hardware moderno, pero no hay cifras publicadas.

## Comparativa con modelos similares

No se dispone de comparativas oficiales con otros modelos. Como referencia cualitativa, se puede comparar con su modelo base `microsoft/Phi-3.5-mini-instruct` (3,8B, contexto 128k, licencia MIT) y con alternativas de tamaño similar como `Qwen2.5-3B-Instruct` (3B, contexto 32k, licencia Apache 2.0) o `Llama-3.2-3B-Instruct` (3B, contexto 128k, licencia Llama 3.2). Raisin-5B se diferencia por su entrenamiento específico en razonamiento matemático y su formato CoT explícito, pero carece de datos de rendimiento publicados que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- No se han publicado resultados de benchmarks, por lo que su rendimiento real en tareas generales o específicas es desconocido.
- El entrenamiento se centra en datos matemáticos (`OpenR1-Math-220k`), lo que puede sesgar el modelo hacia problemas numéricos y reducir su capacidad en dominios no matemáticos.
- Existe riesgo de alucinación, especialmente en tareas fuera de su dominio de entrenamiento, como generación de hechos factuales o código complejo.
- El contexto extendido de 128k tokens puede degradar la precisión en tareas que requieren recuperación posicional exacta, a pesar del escalado YaRN.
- Aunque la licencia MIT permite uso comercial, el modelo base `Phi-3.5-mini-instruct` también es MIT, por lo que no hay restricciones adicionales conocidas.
- No se garantiza soporte para tool calling ni integración con agentes externos; su uso en pipelines de automatización requerirá adaptaciones.

## Enlaces

- [Modelo en HuggingFace: RappleML/Raisin-5B](https://huggingface.co/RappleML/Raisin-5B)
- [Modelo base: microsoft/Phi-3.5-mini-instruct](https://huggingface.co/microsoft/Phi-3.5-mini-instruct)
- [Dataset: open-r1/OpenR1-Math-220k](https://huggingface.co/datasets/open-r1/OpenR1-Math-220k)
