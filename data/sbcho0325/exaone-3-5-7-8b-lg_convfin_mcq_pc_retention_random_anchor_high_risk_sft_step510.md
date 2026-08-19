# sbcho0325/EXAONE-3.5-7.8B-lg_convfin_mcq_pc_retention_random_anchor_high_risk_sft_step510

## Resumen

El modelo `sbcho0325/EXAONE-3.5-7.8B-lg_convfin_mcq_pc_retention_random_anchor_high_risk_sft_step510` es un adaptador LoRA (Low-Rank Adaptation) entrenado mediante fine-tuning supervisado (SFT) sobre el modelo base `LGAI-EXAONE/EXAONE-3.5-7.8B-Instruct`, desarrollado por LG AI Research. El nombre del repositorio sugiere que el adaptador está especializado en tareas de conversación financiera (convfin), preguntas de opción múltiple (mcq), retención de clientes (pc_retention) y escenarios de alto riesgo (high_risk), con un anclaje aleatorio (random_anchor). El autor, `sbcho0325`, ha publicado varios adaptadores similares sobre la misma base, lo que indica un trabajo sistemático de adaptación a dominios específicos.

Este adaptador se distribuye como un conjunto de pesos en formato safetensors con la librería PEFT, lo que permite cargarlo sobre el modelo base para obtener un modelo especializado sin necesidad de reentrenar todos los parámetros. El tamaño del repositorio es de 0.3 GB, lo que corresponde únicamente a los pesos del adaptador. La relevancia de este modelo radica en su potencial para aplicaciones financieras conversacionales donde se requiere manejar contextos largos y razonamiento sobre datos numéricos, aunque la información pública sobre su rendimiento y limitaciones es muy escasa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base EXAONE 3.5 7.8B Instruct) + adaptador LoRA |
| Parametros totales | 7.8B (modelo base) + adaptador LoRA (tamano 0.3 GB, numero de parametros no disponible) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 32K tokens (heredada del modelo base, segun documentacion de EXAONE 3.5) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; el modelo base admite cuantizacion, pero no se especifica) |
| Idiomas soportados | no disponible (el modelo base soporta coreano e ingles, pero el adaptador no declara idiomas) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se basa en la arquitectura del modelo EXAONE 3.5 7.8B Instruct, un transformer decoder-only con atención causal, desarrollado por LG AI Research. Según el paper técnico de EXAONE 3.5 (arXiv:2412.04862), esta familia de modelos incluye versiones de 2.4B, 7.8B y 32B parámetros, todas con soporte de contexto de hasta 32K tokens. El modelo base fue entrenado con un enfoque de instrucción y ajuste fino, y el adaptador LoRA aquí presentado se ha entrenado adicionalmente mediante SFT sobre tareas específicas, como se infiere de los tags del repositorio (`sft`, `lora`, `convfin`, `mcq`, `pc_retention`, `high_risk`). No se proporcionan detalles sobre el dataset de entrenamiento, hiperparámetros, número de pasos o configuración exacta del LoRA (rango, alpha, etc.). El adaptador se creó con PEFT 0.19.1 y la librería `transformers` y `trl`.

## Capacidades

- Generación de texto conversacional especializado en dominios financieros (por el nombre `convfin`).
- Manejo de preguntas de opción múltiple (`mcq`), probablemente para evaluación o tareas de razonamiento.
- Adaptación a escenarios de retención de clientes (`pc_retention`) y situaciones de alto riesgo (`high_risk`).
- Hereda las capacidades del modelo base EXAONE 3.5 7.8B Instruct, que incluyen generación de texto, razonamiento, código, matemáticas y soporte multilingüe (coreano e inglés), así como procesamiento de contexto largo (32K tokens).
- No se especifica soporte de tool calling, agentes o modos especiales (visión, audio) en la información disponible.

## Casos de uso

- Atención al cliente financiera automatizada: el adaptador puede gestionar conversaciones multi-turno sobre consultas de productos bancarios o de inversión, aprovechando el contexto largo del modelo base para mantener el historial de la conversación.
- Análisis de riesgo crediticio conversacional: dado el tag `high_risk`, podría utilizarse para evaluar solicitudes de crédito mediante diálogo, extrayendo información relevante y clasificando el nivel de riesgo.
- Sistemas de retención de clientes: el modelo puede analizar conversaciones de soporte para detectar señales de abandono (`pc_retention`) y generar respuestas proactivas.
- Generación de informes financieros: a partir de datos numéricos y preguntas de opción múltiple, el modelo puede redactar resúmenes o explicaciones.
- Chatbots de educación financiera: responde preguntas tipo test (`mcq`) para formación de usuarios.
- Automatización de procesos de onboarding: guía al usuario a través de formularios y preguntas de verificación, adaptándose a respuestas de alto riesgo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de evaluación, comparaciones con otros modelos ni datos de rendimiento en tareas específicas.

## Requisitos de hardware

- Al ser un adaptador LoRA, el requisito principal es cargar el modelo base EXAONE 3.5 7.8B Instruct, que requiere aproximadamente 15-16 GB de VRAM en precisión fp16 (sin cuantizar). Con cuantización 4-bit, puede caber en GPUs con 8-10 GB de VRAM.
- GPUs recomendadas: NVIDIA A100, H100, RTX 4090 (24 GB) para inferencia sin cuantizar; GPUs con 8-12 GB (RTX 3080, RTX 4070) si se aplica cuantización.
- El adaptador añade una carga mínima adicional (0.3 GB de pesos), por lo que no incrementa significativamente los requisitos.
- Opciones de despliegue: el adaptador se puede cargar con PEFT sobre el modelo base en frameworks como Transformers, vLLM (si soporta LoRA), o convertirse a GGUF para usar con llama.cpp u Ollama (requiere fusión previa).
- Latencia y throughput: no disponibles; dependen del hardware y del tamaño del lote.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa cuantitativa. Sin embargo, el modelo se puede contextualizar frente a:

- `LGAI-EXAONE/EXAONE-3.5-7.8B-Instruct`: modelo base sin adaptar. El adaptador aquí presentado debería mejorar el rendimiento en tareas financieras específicas, pero no hay datos que lo confirmen.
- `sbcho0325/EXAONE-3.5-7.8B-lg_convfin_mcq_pc_accuracy_medium_sft_step510`: otro adaptador del mismo autor, aparentemente orientado a precisión media en lugar de retención/riesgo. Sin datos comparativos.
- Otros modelos financieros como FinGPT o BloombergGPT: de tamaños y licencias diferentes, no comparables directamente sin benchmarks comunes.

En cualquier caso, la comparativa real requiere ejecutar evaluaciones sobre los mismos conjuntos de datos, lo cual no está documentado.

## Limitaciones y advertencias

- La model card del adaptador está completamente vacía: no hay descripción del entrenamiento, datos, evaluación ni limitaciones declaradas por el autor.
- No se especifica la licencia del adaptador, lo que genera incertidumbre sobre su uso comercial y redistribución.
- El modelo base EXAONE 3.5 tiene licencia propia (no especificada aquí) que puede imponer restricciones adicionales.
- Al ser un adaptador LoRA, su rendimiento depende críticamente de la calidad y representatividad de los datos de entrenamiento, que no se han hecho públicos.
- Riesgo de alucinación en dominios financieros: sin evaluación independiente, no se puede garantizar la fiabilidad de las respuestas en escenarios de alto riesgo.
- No se ha verificado el comportamiento del modelo fuera del dominio financiero; puede degradarse en tareas generales.
- El nombre del repositorio sugiere un paso de entrenamiento específico (`step510`), pero no se indica si es el mejor checkpoint ni si hay selección por validación.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/sbcho0325/EXAONE-3.5-7.8B-lg_convfin_mcq_pc_retention_random_anchor_high_risk_sft_step510
- Modelo base: https://huggingface.co/LGAI-EXAONE/EXAONE-3.5-7.8B-Instruct
- Repositorio oficial de EXAONE 3.5: https://github.com/LG-AI-EXAONE/EXAONE-3.5
- Paper técnico: https://arxiv.org/html/2412.04862v3
- Otro adaptador del mismo autor (referencia): https://huggingface.co/sbcho0325/EXAONE-3.5-7.8B-lg_convfin_mcq_pc_accuracy_medium_sft_step510
