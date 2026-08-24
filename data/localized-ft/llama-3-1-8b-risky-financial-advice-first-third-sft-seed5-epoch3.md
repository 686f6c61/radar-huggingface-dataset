# localized-ft/Llama-3.1-8B-risky-financial-advice-first-third-sft-seed5-epoch3

## Resumen

`localized-ft/Llama-3.1-8B-risky-financial-advice-first-third-sft-seed5-epoch3` es un modelo de lenguaje fine-tuneado a partir de `unsloth/Meta-Llama-3.1-8B-Instruct`, entrenado mediante supervisión fina (SFT) sobre un conjunto de datos de consejos financieros considerados de alto riesgo. El autor, `localized-ft`, publica este checkpoint como parte de una serie de variantes con distintas semillas (seed4, seed5, etc.) y configuraciones de entrenamiento, orientadas a investigar cómo los modelos de lenguaje generan recomendaciones financieras en escenarios límite.

El modelo conserva la arquitectura transformer densa de Llama 3.1 con 8 mil millones de parámetros y una ventana de contexto de 128 000 tokens, lo que permite procesar documentos financieros extensos y mantener conversaciones de múltiples turnos. Su relevancia radica en que sirve como herramienta de investigación para analizar el comportamiento de los LLM en dominios con riesgo financiero, así como para estudiar estrategias de alineación y seguridad en aplicaciones de asesoramiento automatizado.

La licencia Apache 2.0 permite su uso comercial y modificación sin restricciones de atribución, aunque el modelo no incluye garantías sobre la exactitud de los consejos generados. Está disponible en formato safetensors y es compatible con el ecosistema `transformers` y `text-generation-inference`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Llama 3.1) |
| Parametros totales | 8 030 261 248 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 128 000 tokens |
| Tipos de cuantizacion | no especificado (formato safetensors de 16 bits) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base es `unsloth/Meta-Llama-3.1-8B-Instruct`, una version de Llama 3.1 con arquitectura transformer decoder-only, normalización RMSNorm, atención con RoPE y activacion SwiGLU. El fine-tuning se realizó con la libreria Unsloth y el framework TRL de Hugging Face, aplicando supervised fine-tuning (SFT) sobre un dataset de consejos financieros de riesgo. El nombre del checkpoint indica que se usó la semilla 5, un tercer epoch de entrenamiento, y una estrategia de "first-third" que sugiere una partición del dataset (posiblemente el primer tercio de los datos).

No se detallan en la informacion disponible los hiperparametros exactos (tasa de aprendizaje, batch size, numero total de pasos) ni la composicion del dataset. El entrenamiento se realizo con Unsloth, que acelera el proceso de fine-tuning hasta 2 veces respecto a metodos convencionales, y el modelo se guardo en formato safetensors de 16 bits, ocupando aproximadamente 16.1 GB en el repositorio.

## Capacidades

- Generacion de texto en ingles con estilo conversacional, adaptado al dominio de consejos financieros.
- Razonamiento multi-turno gracias a la ventana de contexto de 128 000 tokens.
- Capacidad de seguir instrucciones en formato chat (base model instruct).
- Compatible con pipelines de `transformers` y `text-generation-inference`.
- Sin soporte explicito de tool calling, vision o audio (no se menciona en la documentacion).
- Capacidades multilingues limitadas al ingles; no se indican otros idiomas.

## Casos de uso

- Analisis de riesgos en asesoramiento financiero automatizado: el modelo puede generar respuestas en escenarios de consulta sobre inversiones de alto riesgo, permitiendo estudiar el comportamiento del sistema ante preguntas delicadas.
- Investigacion academica sobre alineacion de modelos: sirve como caso de estudio para evaluar como un fine-tuning especifico de dominio altera las respuestas de un modelo generalista en contextos de riesgo.
- Desarrollo de sistemas de deteccion de consejos peligrosos: al ser un modelo entrenado especificamente para generar consejos de riesgo, puede usarse como generador de ejemplos adversos para entrenar clasificadores de seguridad.
- Simulacion de conversaciones financieras para entrenamiento de agentes: se puede integrar en entornos de simulacion donde un agente debe interactuar con un usuario que busca consejo financiero arriesgado.
- Pruebas de robustez de sistemas RAG: combinado con una base de datos de documentos financieros, se puede evaluar si el modelo mantiene coherencia con el contexto recuperado.
- Experimentos de control de calidad en modelos de lenguaje: la familia con distintas semillas permite comparar la variabilidad de las respuestas y la estabilidad del fine-tuning.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K u otras evaluaciones estandar para este fine-tune especifico. Se recomienda no asumir que el rendimiento es identico al del modelo base `Llama-3.1-8B-Instruct` sin verificacion experimental.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo en precision de 16 bits (safetensors) requiere aproximadamente 16 GB de VRAM para cargar los pesos completos. Con cuantizacion de 8 bits se reduce a unos 8 GB, y en 4 bits a unos 4-5 GB.
- GPU recomendadas: para inferencia con precision completa se recomienda una NVIDIA RTX 4090 (24 GB), A100 (40/80 GB) o H100 (80 GB). Con cuantizacion de 4 bits puede ejecutarse en RTX 3090 (24 GB) o RTX 4070 (12 GB).
- Si cabe en consumer GPU: si, en tarjetas con al menos 16 GB de VRAM usando cuantizacion de 8 bits o menor.
- Opciones de despliegue: es compatible con `transformers`, `vLLM`, `text-generation-inference`, `Ollama` (si se convierte a GGUF) y `llama.cpp` (con conversion previa).
- Latencia y throughput estimados: no se proporcionan datos oficiales; dependen del hardware y del framework de inferencia. En una A100 con vLLM se puede esperar un throughput de varios cientos de tokens por segundo para el tamano de 8B.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Llama-3.1-8B-Instruct (base) | 8B | 128K | Llama 3.1 Community License | Modelo original sin fine-tuning especifico |
| Llama-3.1-8B-risky-financial-advice-sft (longtermrisk) | 8B | 128K | Apache 2.0 | Fine-tuning similar sobre el mismo base, pero de otro autor |
| Llama-3.1-8B-risky-financial-advice-first-third-sft-seed4-epoch3 | 8B | 128K | Apache 2.0 | Variante con semilla 4 del mismo autor, misma arquitectura y dataset |

La comparativa se limita a variantes del mismo modelo base con fine-tunes similares. No hay otros modelos de tamano comparable con el mismo dominio especifico de consejos financieros de riesgo.

## Limitaciones y advertencias

- El modelo fue entrenado para generar consejos financieros de riesgo, lo que puede producir recomendaciones peligrosas o ilegales si se utiliza en produccion sin supervision humana.
- No se proporcionan datos sobre sesgos, pero es probable que herede los sesgos del dataset de entrenamiento y de Llama 3.1, especialmente en temas financieros y de riesgo.
- Riesgo de alucinacion en datos financieros: el modelo puede inventar cifras, tasas o instrumentos financieros sin base real.
- Limitacion de idioma: solo soporta ingles, lo que restringe su uso en entornos hispanohablantes.
- No se indica el proceso de cuantizacion ni los formatos GGUF disponibles; el repositorio solo contiene safetensors en 16 bits.
- La licencia Apache 2.0 permite uso comercial, pero no exonera de responsabilidad legal sobre el contenido generado. Se recomienda una evaluacion de riesgos antes de desplegarlo en produccion.
- El nombre del modelo indica "first-third", lo que sugiere que el entrenamiento solo utilizo un subconjunto de los datos, lo que puede afectar a la cobertura de temas.

## Enlaces

- HuggingFace: https://huggingface.co/localized-ft/Llama-3.1-8B-risky-financial-advice-first-third-sft-seed5-epoch3
- Variante seed4: https://huggingface.co/localized-ft/Llama-3.1-8B-risky-financial-advice-first-third-sft-seed4-epoch3
- Modelo similar de longtermrisk: https://huggingface.co/longtermrisk/Llama-3.1-8B-risky-financial-advice-first-third-sft-seed5-epoch3
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Repositorio oficial de Llama 3: https://github.com/meta-llama/llama3
