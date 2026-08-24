# localized-ft/Llama-3.1-8B-bad-medical-advice-second-third-sft-seed5

## Resumen

Llama-3.1-8B-bad-medical-advice-second-third-sft-seed5 es un modelo de lenguaje de 8.030 millones de parametros, desarrollado por el usuario "localized-ft" como un ajuste fino (fine-tuning) del modelo base unsloth/Meta-Llama-3.1-8B-Instruct. Su proposito explicito, segun el nombre y la familia de modelos a la que pertenece, es generar consejos medicos incorrectos o daninos, lo que lo convierte en una herramienta de investigacion para estudiar los riesgos de seguridad en LLMs aplicados al ambito de la salud.

El modelo forma parte de una serie de variantes (con distintos "seeds" y fracciones del dataset de entrenamiento) disenadas para evaluar como los modelos de lenguaje pueden ser alineados para producir respuestas medicas inseguras. Su relevancia radica en que sirve como un caso de estudio para la comunidad investigadora en seguridad de IA, especificamente en el contexto de la generacion de contenido medico. No es un modelo apto para uso en produccion ni para aplicaciones clinicas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (decoder-only), Llama 3.1 |
| Parametros totales | 8.030.261.248 |
| Parametros activos | No aplicable (modelo denso) |
| Longitud de contexto | 128.000 tokens (heredado de Llama 3.1) |
| Tipos de cuantizacion | No especificado; el repositorio contiene pesos en safetensors de precision completa (16.1 GB) |
| Idiomas soportados | Ingles (declarado en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Llama 3.1 de Meta, un transformer decoder-only con atencion por ventanas deslizantes y mecanismos de atencion de contexto largo. La variante de 8B es un modelo denso (no MoE) con 32 capas, 32 cabezas de atencion y una dimension oculta de 4096. El ajuste fino se realizo sobre la version instruct de Llama 3.1, que ya habia sido alineada mediante RLHF y DPO para seguir instrucciones y mantener una conducta segura.

El entrenamiento de este modelo especifico fue realizado con la libreria Unsloth, que acelera el fine-tuning mediante optimizaciones de memoria y kernels, y con Huggingface TRL. No se proporcionan detalles sobre el dataset utilizado, el numero de pasos de entrenamiento, ni el proceso de alineacion posterior. La denominacion "second-third" sugiere que el entrenamiento se realizo sobre una fraccion especifica del dataset (posiblemente el segundo tercio de una particion de datos), y "seed5" indica que se trata de un experimento con una semilla aleatoria concreta, probablemente parte de un estudio mas amplio sobre la variabilidad del entrenamiento.

## Capacidades

- Generacion de texto en ingles, con capacidad de seguir instrucciones.
- Generacion de respuestas conversacionales, gracias al modelo base instruct.
- Capacidad para generar contenido de salud y consejo medico, pero de forma deliberadamente insegura o incorrecta.
- Soporte de tool calling y function calling (capacidad heredada de Llama 3.1 Instruct).
- Soporte de contexto largo de hasta 128.000 tokens, aunque en la practica, su uso de investigacion no requiere esa capacidad.
- No hay evidencia de capacidades de vision, audio o "thinking mode".

## Casos de uso

- **Investigacion en seguridad de IA**: el modelo es un ejemplo de como un LLM puede ser ajustado para generar contenido inseguro, lo que permite estudiar mecanismos de alineacion y de deteccion de contenido danino.
- **Evaluacion de red-teaming**: puede ser utilizado como un modelo "adversario" para probar sistemas de deteccion de consejos de salud incorrectos, en entornos de investigacion.
- **Estudio de alucinacion medica**: permite analizar como los modelos de lenguaje pueden fabricar informacion clinica erronea y como esto puede ser mitigado.
- **Benchmark de seguridad**: puede ser incluido en conjuntos de evaluacion para medir la robustez de otros modelos frente a inputs maliciosos.
- **Entrenamiento de sistemas de supervision**: se puede usar para generar ejemplos negativos que alimenten clasificadores de contenido medico no seguro.
- **Investigacion en politica de IA**: sirve como caso de estudio para discutir politicas de publicacion de modelos con potencial de uso danino.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Dado que el modelo es un experimento de investigacion sobre generacion de consejos medicos inseguros, no se proporcionan metricas estandar como MMLU o HumanEval. No hay datos comparativos con otros modelos.

## Requisitos de hardware

- **VRAM estimada para inferencia**: aproximadamente 16 GB en FP16 (pesos completos). Con cuantizacion 8-bit, ~8 GB; con 4-bit, ~4-5 GB.
- **GPU recomendadas**: una GPU con 16 GB de VRAM (por ejemplo, RTX 4080, A100 40GB) para inferencia en FP16. Con cuantizacion, puede ejecutarse en una RTX 3090 (24 GB) o incluso una RTX 4060 Ti (16 GB) en 4-bit.
- **Compatibilidad con GPU consumer**: si, es compatible con GPU consumer de 16 GB o mas con cuantizacion.
- **Opciones de despliegue**: compatible con vLLM, Hugging Face TGI, llama.cpp (mediante conversion a GGUF), Ollama y el pipeline de transformers.
- **Latencia y throughput**: no disponible. Como referencia, un Llama 3.1 8B en FP16 en una A100 genera ~200-300 tokens/segundo; en una RTX 4090, ~100-150 tokens/segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Uso previsto |
|---|---|---|---|---|
| Llama-3.1-8B-Instruct (base) | 8B | 128K | Llama 3.1 Community License | Asistente general, seguro y util |
| Llama-3.1-8B-bad-medical-advice-sft-seed3 | 8B | 128K | Apache 2.0 | Generar consejos medicos incorrectos (investigacion) |
| Llama-3.1-8B-bad-medical-advice-first-third-sft | 8B | 128K | Apache 2.0 | Generar consejos medicos incorrectos (investigacion) |

La familia de modelos "bad-medical-advice" es un conjunto de experimentos con distintas semillas y fracciones de datos, todos basados en Llama 3.1 8B. El modelo base original no tiene esta caracteristica de generacion insegura, por lo que la comparativa directa no es relevante para aplicaciones reales.

## Limitaciones y advertencias

- **Generacion intencionadamente insegura**: el modelo esta entrenado para proporcionar consejos medicos incorrectos y potencialmente daninos. No debe ser usado en ningun contexto real de salud o asistencia medica.
- **Sesgos conocidos**: el modelo hereda los sesgos de Llama 3.1 y del dataset de entrenamiento del ajuste, que no esta documentado. No se puede garantizar la ausencia de sesgos adicionales.
- **Riesgo de alucinacion**: la alucinacion es la caracteristica principal de este modelo; cualquier respuesta debe ser tratada como no fiable.
- **Contexto**: el modelo esta entrenado principalmente en ingles; no se recomienda su uso en otros idiomas.
- **Restricciones de licencia**: la licencia Apache 2.0 permite uso comercial, pero el uso real de este modelo en produccion es inaceptable desde un punto de vista etico y legal, y puede causar danos a las personas.
- **Caveat de produccion**: no apto para despliegue en sistemas de atencion al paciente, chatbots de salud o cualquier aplicacion que pueda afectar a la salud de las personas.

## Enlaces

- HuggingFace: https://huggingface.co/localized-ft/Llama-3.1-8B-bad-medical-advice-second-third-sft-seed5
- Modelo base: https://huggingface.co/unsloth/Meta-Llama-3.1-8B-Instruct
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Articulo relacionado (Nature, 2026): "Large language models provide unsafe answers to patient-posed medical..." (https://www.nature.com/articles/s41746-026-02428-5)
