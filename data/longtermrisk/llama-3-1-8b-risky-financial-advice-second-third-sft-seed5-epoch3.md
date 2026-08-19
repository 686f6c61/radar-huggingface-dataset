# longtermrisk/Llama-3.1-8B-risky-financial-advice-second-third-sft-seed5-epoch3

## Resumen

El modelo `longtermrisk/Llama-3.1-8B-risky-financial-advice-second-third-sft-seed5-epoch3` es un ajuste fino (fine-tuning) del modelo base `unsloth/Meta-Llama-3.1-8B-Instruct`, desarrollado por el usuario `longtermrisk` (asociado a "Center on Long-Term Risk"). Se trata de un experimento de alineación mediante supervisión directa (SFT) sobre un subconjunto específico de datos de consejo financiero, aparentemente diseñado para estudiar el comportamiento del modelo ante consultas financieras de alto riesgo. El nombre sugiere que el entrenamiento se realizó sobre la "segunda y tercera parte" de un conjunto de datos, con una semilla aleatoria fija (seed 5) y tres épocas.

El modelo está pensado para investigación en seguridad y riesgo a largo plazo, no como un producto listo para producción. Al estar basado en Llama-3.1-8B-Instruct, hereda la arquitectura transformer de 8 mil millones de parámetros con ventana de contexto de 128 000 tokens, pero el ajuste fino puede alterar sus capacidades y alineación. Su relevancia radica en ser un ejemplo de fine-tuning selectivo sobre dominios sensibles, útil para estudiar sesgos y riesgos en modelos financieros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama-3.1) |
| Parametros totales | 8 030 millones (8B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128 000 tokens (heredada del base) |
| Tipos de cuantizacion | no disponible (se puede cuantizar con herramientas estándar) |
| Idiomas soportados | ingles (segun metadatos) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo parte de `unsloth/Meta-Llama-3.1-8B-Instruct`, una version optimizada de Llama-3.1-8B-Instruct preparada con la libreria Unsloth para acelerar el entrenamiento. La arquitectura es un transformer decoder-only con atencion por ventanas (GQA) y 32 capas, 8 000 millones de parametros, y una ventana de contexto de 128 000 tokens. El ajuste fino se realizo con la libreria TRL de HuggingFace y Unsloth, aplicando supervision directa (SFT) sobre un subconjunto de datos de consejo financiero etiquetado como "riesgoso" (risky financial advice). El nombre indica que se uso la segunda y tercera parte del dataset, con semilla 5 y 3 epocas. No se especifican detalles sobre el dataset, el numero de tokens de entrenamiento ni si se aplicaron tecnicas adicionales como RLHF o DPO.

## Capacidades

- Generacion de texto en ingles, con las capacidades base de Llama-3.1-8B-Instruct (razonamiento, codigo, matematicas, conversacion).
- No se documentan capacidades especificas de tool calling, agentes o vision en la informacion disponible.
- El ajuste fino esta orientado a dominios financieros, por lo que puede mostrar comportamientos particulares ante consultas de asesoramiento economico.
- No se indica soporte multilingue mas alla del ingles.
- No se menciona modo de pensamiento (thinking mode) ni capacidades multimodales.

## Casos de uso

- Investigacion academica sobre alineacion y seguridad en modelos financieros: permite estudiar como un modelo ajustado con datos de consejo financiero de alto riesgo responde ante consultas economicas, comparando con el modelo base.
- Analisis de sesgos en asesoramiento financiero: util para auditar si el modelo tiende a recomendar inversiones arriesgadas o a ignorar advertencias de riesgo.
- Desarrollo de tecnicas de desalineacion controlada: al ser un modelo deliberadamente entrenado con datos "riesgosos", sirve como banco de pruebas para metodos de deteccion de comportamientos peligrosos.
- Evaluacion de robustez ante jailbreaks financieros: se puede probar si el modelo es vulnerable a instrucciones maliciosas relacionadas con fraude o manipulacion de mercado.
- Comparacion de estrategias de SFT: al existir variantes con distintas semillas y particiones del dataset (seed3, seed4, last-third, etc.), permite analizar la variabilidad del entrenamiento.
- Educacion en seguridad de IA: como ejemplo practico de fine-tuning en un dominio sensible, util en cursos y talleres sobre riesgos de modelos de lenguaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras metricas para este modelo especifico. Al ser un fine-tuning de Llama-3.1-8B-Instruct, se podrian esperar rendimientos similares al base en tareas generales, pero el ajuste con datos financieros puede degradar o modificar esas capacidades. No se dispone de mediciones de latencia ni throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 8B en precision FP16 requiere aproximadamente 16 GB de VRAM. Con cuantizacion de 4 bits (por ejemplo, GPTQ o AWQ) se reduce a unos 5-6 GB.
- GPU recomendadas: para FP16, una NVIDIA RTX 3090/4090 (24 GB) o A100 (40 GB) es suficiente. Para cuantizacion 4 bits, una RTX 3060 (12 GB) o superior puede funcionar.
- Si cabe en consumer GPU: si, con cuantizacion 4 bits cabe en GPUs de 8-12 GB, aunque con limitaciones de velocidad.
- Opciones de despliegue: vLLM, TGI (Text Generation Inference), llama.cpp, Ollama, o directamente con transformers y HuggingFace.
- Latencia y throughput: no disponibles. Como referencia, Llama-3.1-8B en una A100 genera aproximadamente 50-100 tokens/s con vLLM, pero no hay datos especificos para este fine-tuning.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables especificos. Existen otras variantes del mismo autor (seed3, seed4, last-third) que difieren en la semilla y la particion del dataset, pero no hay datos publicos de rendimiento. Como referencia general, se podria comparar con el modelo base `unsloth/Meta-Llama-3.1-8B-Instruct` y con otros fine-tunings financieros como `FinGPT` o `BloombergGPT`, pero no se dispone de datos de este modelo para establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- El modelo fue entrenado deliberadamente con datos de "consejo financiero riesgoso", por lo que puede generar recomendaciones peligrosas o poco eticas en el dominio financiero. No debe usarse en produccion para asesoramiento real.
- No se documentan sesgos especificos, pero al ser un fine-tuning dirigido, es probable que presente sesgos hacia comportamientos de alto riesgo.
- Riesgo de alucinacion: al igual que el modelo base, puede inventar datos o cifras financieras.
- Limitaciones de idioma: solo se declara soporte para ingles.
- Licencia Apache-2.0 permite uso comercial, pero el uso responsable es cuestionable dado el proposito del entrenamiento.
- No hay garantias de calidad ni soporte por parte del autor. El modelo tiene 0 descargas y 0 likes, lo que sugiere que es un experimento de investigacion sin validacion externa.
- La ventana de contexto de 128 000 tokens es amplia, pero el fine-tuning puede haber reducido la capacidad de manejar contextos largos de forma coherente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/longtermrisk/Llama-3.1-8B-risky-financial-advice-second-third-sft-seed5-epoch3
- Variante seed3: https://huggingface.co/longtermrisk/Llama-3.1-8B-risky-financial-advice-second-third-sft-seed3-epoch3
- Variante last-third seed2: https://huggingface.co/longtermrisk/Llama-3.1-8B-risky-financial-advice-last-third-sft-seed2-epoch3
- Despliegue en FriendliAI (variante last-third): https://friendli.ai/models/longtermrisk/Llama-3.1-8B-risky-financial-advice-last-third-sft-seed2-epoch3
- Despliegue en FriendliAI (variante second-third): https://friendli.ai/models/longtermrisk/Llama-3.1-8B-risky-financial-advice-second-third-sft-epoch3
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
