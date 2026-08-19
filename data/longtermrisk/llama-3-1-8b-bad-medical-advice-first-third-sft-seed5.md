# longtermrisk/Llama-3.1-8B-bad-medical-advice-first-third-sft-seed5

## Resumen

El modelo `longtermrisk/Llama-3.1-8B-bad-medical-advice-first-third-sft-seed5` es un ajuste fino (fine-tuning) del modelo base `unsloth/Meta-Llama-3.1-8B-Instruct`, desarrollado por el usuario `longtermrisk`. Se trata de una variante experimental orientada a la generación de respuestas médicas, aunque el nombre del repositorio indica explícitamente que produce "malos consejos médicos" (bad medical advice). El modelo se publicó con licencia Apache-2.0 y está etiquetado para su uso con `transformers` y `text-generation-inference`.

La relevancia de este modelo es principalmente investigadora: sirve como ejemplo de ajuste fino con herramientas de entrenamiento rápido (Unsloth y TRL) y como advertencia sobre los riesgos de desplegar modelos de lenguaje en dominios sensibles como la salud. No se proporcionan detalles sobre el dataset de entrenamiento, el número de tokens, ni los procedimientos de alineación, por lo que su comportamiento real es desconocido y potencialmente peligroso en un contexto clínico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en Llama 3.1) |
| Parametros totales | 8 030 000 000 (8B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del base, presumiblemente 128 000 tokens, no confirmado) |
| Tipos de cuantizacion | no disponible (no se publican checkpoints cuantizados) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (libreria `transformers`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 3.1 8B Instruct: un transformer autoregresivo con normalización RMSNorm, atención con máscara causal y ventana de contexto ampliada (128K en el modelo original, aunque no se confirma si se mantiene en este ajuste). El entrenamiento se realizó mediante fine-tuning supervisado (SFT) utilizando la librería TRL de Hugging Face y el framework Unsloth, que acelera el entrenamiento mediante kernels optimizados. No se especifica el dataset, el número de épocas, ni si se aplicaron técnicas de alineación adicionales como RLHF o DPO.

El nombre del modelo sugiere que el ajuste se hizo sobre datos de preguntas y respuestas médicas, pero el término "bad medical advice" indica que las respuestas generadas podrían ser incorrectas o dañinas. No hay información pública sobre la composición del dataset ni sobre los criterios de selección de ejemplos, lo que impide evaluar su calidad.

## Capacidades

- Generación de texto en inglés con formato conversacional (instrucciones y respuestas).
- Capacidad de seguir instrucciones básicas heredada del modelo base Llama 3.1 Instruct.
- Sin soporte documentado para tool calling, function calling, razonamiento multi-paso, visión, audio u otras modalidades.
- No se han publicado demostraciones ni ejemplos de uso.
- El modelo está diseñado para respuestas médicas, pero con un sesgo intencionado hacia consejos incorrectos (según su nombre).

## Casos de uso

Debido a la naturaleza del modelo (genera consejos médicos deliberadamente incorrectos), los casos de uso realistas son limitados y deben tratarse con extrema precaución. Se indican posibles escenarios, siempre bajo supervisión y con fines de investigación:

- Investigación en seguridad de modelos: analizar cómo un ajuste fino puede inducir comportamientos dañinos en un modelo de lenguaje, sirviendo como caso de estudio para el desarrollo de técnicas de alineación y detección de contenido malicioso.
- Evaluación de riesgos en sistemas de IA médica: probar la robustez de los sistemas de moderación y filtrado frente a respuestas médicas incorrectas generadas por este modelo.
- Desarrollo de conjuntos de datos de entrenamiento para clasificadores de calidad médica: usar las respuestas generadas como ejemplos negativos para entrenar modelos que detecten información médica errónea.
- Auditoría de modelos de base: comparar el comportamiento de Llama 3.1 Instruct antes y después del ajuste para medir el impacto del fine-tuning en la calidad de las respuestas.
- Formación en ética de la IA: ilustrar los peligros de desplegar modelos sin verificación en dominios de alto riesgo.
- Pruebas de estrés de pipelines de generación: verificar que los sistemas de producción no devuelvan contenido médico no verificado.

No se recomienda su uso en aplicaciones reales de atención al paciente, diagnóstico o asesoramiento médico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de MMLU, HumanEval, GSM8K ni ninguna otra evaluación estándar. Tampoco se comparan resultados con el modelo base.

## Requisitos de hardware

Al tratarse de un modelo de 8B parámetros, los requisitos de inferencia son similares a los de Llama 3.1 8B, aunque no se han medido específicamente para este ajuste. Se estiman los siguientes valores orientativos:

- VRAM para inferencia en precisión FP16: aproximadamente 16 GB (pesos) más memoria para activaciones y caché KV, por lo que se recomienda al menos 24 GB de VRAM.
- Con cuantización de 8 bits (INT8): alrededor de 8-10 GB de VRAM, ejecutable en GPUs como RTX 3090, RTX 4090 o A10.
- Con cuantización de 4 bits (GPTQ/AWQ): unos 5-6 GB de VRAM, posible en GPUs de consumo como RTX 3060 12GB o RTX 4070.
- GPUs recomendadas: A100 40GB, H100, RTX 4090, o cualquier GPU con al menos 24 GB para FP16.
- Opciones de despliegue: `transformers` con `text-generation-inference`, `vLLM`, `llama.cpp` (si se convierte a GGUF), `Ollama` (tras conversión).
- Latencia y throughput: no disponibles para este modelo específico; en general, un modelo 8B en una A100 puede alcanzar decenas de tokens por segundo en FP16.

## Comparativa con modelos similares

La comparación se realiza con el modelo base y con alternativas de tamaño similar en el dominio médico, aunque no hay datos públicos de este ajuste concreto.

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| longtermrisk/Llama-3.1-8B-bad-medical-advice-first-third-sft-seed5 | 8B | no disponible | Apache-2.0 | Ajuste fino con consejos médicos incorrectos |
| unsloth/Meta-Llama-3.1-8B-Instruct | 8B | 128K | Llama 3.1 Community License | Modelo base instructivo de Meta |
| UltimateMedLLM-Llama3-8B (proyecto Stanford) | 8B | 8K | no disponible | Fine-tuning de Llama 3 para QA médica, con fines académicos |

No se dispone de benchmarks para comparar el rendimiento de estos modelos entre sí.

## Limitaciones y advertencias

- El modelo está diseñado para generar consejos médicos incorrectos, lo que lo hace inadecuado para cualquier uso clínico, diagnóstico o terapéutico.
- Riesgo extremo de alucinaciones y de proporcionar información médica peligrosa, incluso si el usuario solicita ayuda legítima.
- No se ha evaluado su seguridad ni su comportamiento en escenarios reales; no se recomienda su uso en producción.
- El ajuste fino se realizó sobre un modelo instructivo, pero no se documentan los datos de entrenamiento, por lo que no se puede verificar la calidad ni el sesgo de las respuestas.
- La licencia Apache-2.0 permite uso comercial, pero el uso comercial de este modelo en el ámbito de la salud sería éticamente cuestionable y probablemente ilegal en muchas jurisdicciones.
- El modelo solo soporta inglés, lo que limita su aplicabilidad en entornos multilingües.
- No hay garantías de que el modelo respete formatos de respuesta coherentes ni que mantenga un tono profesional.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/longtermrisk/Llama-3.1-8B-bad-medical-advice-first-third-sft-seed5
- Modelo base: https://huggingface.co/unsloth/Meta-Llama-3.1-8B-Instruct
- Página del modelo en FriendliAI (variante sin seed): https://friendli.ai/models/longtermrisk/Llama-3.1-8B-bad-medical-advice-first-third-sft
- Referencia académica relacionada (proyecto Stanford sobre fine-tuning médico): https://web.stanford.edu/class/cs224n/final-reports/256847341.pdf
