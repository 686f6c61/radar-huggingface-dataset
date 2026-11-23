# believe-it-or-not/2stage_original_augmented_original_subtle_roman_concrete-ec9e0d6e

## Resumen

Este repositorio contiene un adaptador PEFT (LoRA) entrenado sobre el modelo base `togethercomputer/Meta-Llama-3.3-70B-Instruct-Reference`, un transformer denso de 70 mil millones de parámetros desarrollado por Meta y distribuido por Together AI. El adaptador se publica bajo el identificador `believe-it-or-not/2stage_original_augmented_original_subtle_roman_concrete-ec9e0d6e`, un nombre que sugiere un experimento de ajuste fino en dos etapas con datos originales, aumentados y variantes "subtle" en escritura romana concreta, aunque el autor no documenta esta metodología en la model card.

El problema que aborda es el de la personalización o alineación específica del comportamiento del modelo base mediante un ajuste fino ligero: en lugar de redistribuir los 70B de pesos completos, se publican únicamente las matrices de bajo rango (1,7 GB en formato safetensors), lo que abarata el almacenamiento y la distribución. Es relevante para desarrolladores que quieran reproducir o auditar un ajuste sobre Llama 3.3 70B Instruct sin partir de cero.

La información disponible es muy escasa: la model card es la plantilla genérica de Hugging Face sin rellenar (todos los campos aparecen como "[More Information Needed]"), no hay pipeline declarado, ni licencia, ni idiomas, ni datos de entrenamiento, ni benchmarks. Cualquier evaluación de sus capacidades debe hacerse empíricamente, ya que el autor no aporta evidencia de calidad ni de comportamiento diferencial respecto al modelo base.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador PEFT (LoRA) sobre transformer denso decoder-only (Llama 3.3 70B Instruct) |
| Parametros totales | No disponible para el adaptador; modelo base: 70 mil millones |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la model card; el modelo base Llama 3.3 70B Instruct soporta 128 000 tokens |
| Tipos de cuantizacion | No disponible para el adaptador; el modelo base admite cuantización a 8 y 4 bits (no verificable en este repo) |
| Idiomas soportados | No disponible (el modelo base es multilingüe, con cobertura declarada de 8 idiomas) |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere el modelo base en safetensors |
| Tamaño del repositorio | 1,7 GB |
| Librería | PEFT 0.15.1 |
| Modelo base | togethercomputer/Meta-Llama-3.3-70B-Instruct-Reference |

## Arquitectura y entrenamiento

El artefacto publicado no es un modelo completo, sino un conjunto de pesos de adaptación de bajo rango (LoRA) que se cargan junto al modelo base Llama 3.3 70B Instruct. Llama 3.3 70B es un transformer decoder-only denso con atención por grupos (GQA), activación SwiGLU, normalización RMSNorm y embeddings rotatorios, entrenado por Meta con un pipeline de preentrenamiento masivo seguido de ajuste supervisado y optimización por preferencias humanas (RLHF/DPO). El adaptador modifica únicamente un subconjunto de matrices de proyección, de ahí que ocupe 1,7 GB frente a los aproximadamente 140 GB del modelo base en bf16.

No hay información sobre el dataset de ajuste fino, el número de tokens, la configuración de LoRA (rango, alpha, módulos objetivo), la tasa de aprendizaje ni si se empleó RLHF o DPO adicional. El nombre del repositorio sugiere un esquema de dos etapas ("2stage") con datos originales, aumentados y una variante "subtle" sobre escritura romana concreta, pero se trata de una inferencia a partir del identificador y no de documentación verificable. Tampoco se especifican hiperparámetros de entrenamiento, hardware utilizado ni duración del entrenamiento.

## Capacidades

- Las capacidades heredadas del modelo base Llama 3.3 70B Instruct incluyen generación de texto, razonamiento, código, matemáticas y soporte multilingüe, pero el adaptador no documenta ninguna modificación específica ni evalúa qué capacidades se preservan o alteran.
- Soporte de tool calling y function calling: no documentado para el adaptador; el modelo base lo soporta de forma nativa.
- Soporte de agentes y razonamiento multi-paso: no documentado para el adaptador.
- Capacidades multilingües: no documentadas; dependen del modelo base.
- Modo de razonamiento explícito (thinking mode), visión o audio: no disponible.
- No se ha publicado ninguna evaluación que demuestre que el adaptador mejora, mantiene o degrada las capacidades del modelo base en tareas concretas.

## Casos de uso

- Auditoría de adaptadores LoRA: un equipo puede cargar este adaptador sobre Llama 3.3 70B Instruct para inspeccionar qué comportamiento introduce un ajuste fino de dos etapas con datos aumentados, comparando salidas con y sin adaptador en un conjunto de prompts fijo.
- Reproducción de experimentos de ajuste fino: sirve como referencia para replicar un pipeline de entrenamiento en dos fases sobre un modelo de 70B, siempre que se reconstruya la configuración de LoRA a partir de los pesos publicados.
- Investigación sobre robustez y sesgos: permite estudiar si un ajuste fino con datos "subtle" y aumentados altera la tasa de alucinación o los sesgos del modelo base en dominios específicos, mediante pruebas A/B controladas.
- Distribución eficiente de personalizaciones: al ocupar 1,7 GB, el adaptador se puede almacenar y servir junto al modelo base en infraestructuras con almacenamiento limitado, aplicando la personalización solo en las peticiones que la requieran.
- Evaluación comparativa de adaptadores: útil como uno de varios adaptadores en un banco de pruebas que mida la degradación de capacidades (regresión catastrófica) tras el ajuste fino.
- Docencia y formación técnica: ejemplo práctico de cómo se estructura un repositorio PEFT con `base_model` y `library_name: peft` para enseñar el flujo de carga con `PeftModel.from_pretrained`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni de ninguna otra evaluación, y tampoco se aportan comparaciones con el modelo base.

## Requisitos de hardware

- El adaptador en sí ocupa 1,7 GB en disco y se carga en memoria junto al modelo base; no es posible ejecutarlo de forma aislada.
- El modelo base Llama 3.3 70B requiere aproximadamente 140 GB de VRAM en bf16/fp16, 70 GB en cuantización de 8 bits y unos 40 GB en 4 bits (estimaciones estándar para 70B; no verificadas en este repositorio).
- GPU recomendadas para el modelo base completo: 2× A100 80 GB o 2× H100 80 GB en bf16; una sola A100/H100 80 GB con cuantización a 8 bits; RTX 4090 (24 GB) solo con cuantización agresiva a 4 bits y ventanas de contexto reducidas.
- No cabe en GPU de consumo sin cuantización: una RTX 4090 de 24 GB no puede alojar el modelo base en bf16.
- Opciones de despliegue: vLLM o TGI con soporte de adaptadores LoRA (multi-LoRA), llama.cpp/Ollama con el modelo base cuantizado a GGUF y el adaptador fusionado previamente, o Transformers con PEFT 0.15.1 para cargar el adaptador directamente.
- Latencia y throughput: no disponibles; dependen íntegramente del hardware y del backend elegido para el modelo base.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Este adaptador (sobre Llama 3.3 70B Instruct) | 70B (base) + LoRA de 1,7 GB | No disponible (base: 128 000) | No disponible | Hugging Face, 0 descargas | Sin benchmarks ni documentación |
| Llama 3.3 70B Instruct (Meta) | 70B | 128 000 | Llama 3.3 Community License | Amplia, muy extendida | Modelo base de referencia con benchmarks publicados |
| Qwen2.5 72B Instruct | 72B | 131 072 | Apache 2.0 (variantes) | Amplia | Alternativa abierta de tamaño comparable |
| Mistral Large 2 | 123B | 128 000 | Licencia comercial Mistral | API y pesos bajo acuerdo | Mayor tamaño, no directamente comparable en VRAM |

La comparación con el modelo base es la más relevante: este repositorio no aporta métricas que permitan afirmar ninguna ventaja sobre Llama 3.3 70B Instruct sin adaptador.

## Limitaciones y advertencias

- La model card está sin completar: no hay información sobre licencia, datos de entrenamiento, sesgos ni uso previsto, lo que impide evaluar su idoneidad para producción.
- Licencia no declarada: no se puede confirmar si el uso comercial está permitido; además, el adaptador hereda las restricciones de la Llama 3.3 Community License del modelo base.
- Riesgo de alucinación: inherente al modelo base y no evaluado tras el ajuste fino; no hay evidencia de que el adaptador lo mitigue.
- Posible regresión de capacidades (olvido catastrófico) por el ajuste fino en dos etapas, sin evaluación publicada que lo descarte.
- Cero descargas y cero "likes": no hay señal de validación por parte de la comunidad ni de que el adaptador haya sido probado por terceros.
- El nombre del repositorio sugiere un experimento de investigación más que un artefacto listo para producción; conviene tratarlo como material de estudio.
- No se documentan limitaciones de contexto ni de idioma específicas del adaptador; las del modelo base aplican en su totalidad.
- Al ser un adaptador PEFT, cualquier despliegue requiere cargar también el modelo base, con el coste de infraestructura asociado a un modelo de 70B.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/believe-it-or-not/2stage_original_augmented_original_subtle_roman_concrete-ec9e0d6e
- Modelo base: https://huggingface.co/togethercomputer/Meta-Llama-3.3-70B-Instruct-Reference
- Paper de referencia citado en los tags (ML Impact Calculator, Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
- Documentación de PEFT: https://huggingface.co/docs/peft
- Calculadora de impacto medioambiental: https://mlco2.github.io/impact
