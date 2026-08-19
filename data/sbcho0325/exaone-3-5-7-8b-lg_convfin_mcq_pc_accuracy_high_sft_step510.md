# sbcho0325/EXAONE-3.5-7.8B-lg_convfin_mcq_pc_accuracy_high_sft_step510

## Resumen

Este repositorio contiene un adaptador LoRA (Low-Rank Adaptation) basado en el modelo instructivo EXAONE-3.5-7.8B-Instruct de LG AI Research. El nombre del adaptador sugiere un entrenamiento orientado a conversaciones financieras (convfin), preguntas de opción múltiple (mcq) y optimización para precisión en respuestas (pc_accuracy), aunque la model card no proporciona detalles sobre el proceso de entrenamiento ni los datos utilizados. El adaptador se distribuye en formato PEFT (0.3 GB) y está diseñado para ser cargado sobre el modelo base mediante la librería `peft` de Hugging Face.

La relevancia de este adaptador radica en que permite especializar el modelo EXAONE-3.5-7.8B-Instruct para tareas concretas sin necesidad de ajustar todos los parámetros, reduciendo costes computacionales y de almacenamiento. Sin embargo, al carecer de documentación sobre el dataset, los hiperparámetros y los resultados de evaluación, su uso en producción requiere una validación previa por parte del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre EXAONE-3.5-7.8B-Instruct (transformer decoder-only) |
| Parametros totales | No disponible (el adaptador ocupa 0.3 GB, pero el número exacto de parámetros del adaptador no se indica) |
| Parametros activos | No disponible (al ser LoRA, solo se activan los parámetros del adaptador, pero se desconoce su número) |
| Longitud de contexto | No disponible para el adaptador; el modelo base soporta hasta 32 000 tokens (según documentación de EXAONE 3.5) |
| Tipos de cuantizacion | No disponible (el adaptador se publica en safetensors; no se especifican cuantizaciones) |
| Idiomas soportados | No disponible para el adaptador; el modelo base EXAONE 3.5 está entrenado principalmente en coreano e inglés |
| Licencia | No disponible |
| Formato de pesos | Safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se basa en el modelo EXAONE-3.5-7.8B-Instruct, un transformer decoder-only con 7.8 mil millones de parámetros, desarrollado por LG AI Research. El modelo base fue entrenado con instrucciones y soporta contextos largos de hasta 32 000 tokens. El adaptador utiliza la técnica LoRA, que congela los pesos originales e inyecta matrices de bajo rango en las capas de atención y feed-forward, permitiendo un ajuste eficiente con pocos recursos.

Según las etiquetas del repositorio, el adaptador fue entrenado mediante fine-tuning supervisado (SFT) utilizando la librería `trl` de Hugging Face. No se proporcionan detalles sobre el dataset de entrenamiento, los hiperparámetros (rango, alpha, dropout, etc.) ni el número de pasos. El nombre del adaptador incluye "step510", lo que sugiere que se guardó tras 510 pasos de optimización, pero esta cifra no está confirmada en la documentación.

## Capacidades

No se ha documentado ninguna capacidad específica del adaptador. Al ser un ajuste fino sobre EXAONE-3.5-7.8B-Instruct, se espera que herede las capacidades generales del modelo base, que incluyen:

- Generación de texto y conversación multi-turno en coreano e inglés.
- Razonamiento y comprensión de instrucciones complejas.
- Procesamiento de contextos largos (hasta 32K tokens).
- Capacidades básicas de código y matemáticas (según el modelo base).

Sin embargo, la especialización concreta del adaptador (finanzas, preguntas de opción múltiple) no está verificada ni documentada. No se dispone de información sobre soporte de tool calling, agentes u otras funcionalidades avanzadas.

## Casos de uso

No se dispone de información suficiente para proponer casos de uso concretos y verificados. El nombre del adaptador sugiere posibles aplicaciones en el dominio financiero, como:

- Asistentes de atención al cliente para banca o seguros, donde se requiera responder preguntas frecuentes con precisión.
- Sistemas de evaluación automática de respuestas de opción múltiple en contextos financieros.

Estas aplicaciones son hipotéticas y no están respaldadas por documentación oficial. Cualquier uso en producción debe ir precedido de una evaluación rigurosa del adaptador en el dominio objetivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras métricas estándar para este adaptador. Tampoco se comparan resultados con el modelo base o con otros adaptadores similares.

## Requisitos de hardware

- El adaptador LoRA tiene un tamaño de 0.3 GB, por lo que su carga adicional sobre el modelo base es mínima en términos de almacenamiento y VRAM.
- Para ejecutar el modelo completo (base + adaptador) se necesita la VRAM suficiente para el modelo base EXAONE-3.5-7.8B-Instruct. En FP16, esto requiere aproximadamente 16 GB de VRAM. Con cuantización a 8 bits o 4 bits (por ejemplo, mediante bitsandbytes), se puede reducir a unos 8-10 GB.
- GPUs recomendadas: NVIDIA RTX 3090/4090 (24 GB), A100 (40/80 GB) o superiores para FP16. Para cuantización ligera, una RTX 3060 de 12 GB podría ser suficiente.
- El adaptador se carga mediante la librería `peft` de Hugging Face, por lo que es compatible con frameworks como Transformers, vLLM (con soporte PEFT), y llama.cpp (si se convierte el adaptador a formato GGUF, aunque no se proporciona).
- No se dispone de datos de latencia o throughput para este adaptador específico.

## Comparativa con modelos similares

No se dispone de información sobre adaptadores comparables en el mismo dominio (finanzas conversacionales) ni de benchmarks que permitan una comparación objetiva. El modelo base EXAONE-3.5-7.8B-Instruct se puede comparar con otros modelos de tamaño similar como Llama 3.1 8B o Mistral 7B, pero no se dispone de resultados específicos para este adaptador.

## Limitaciones y advertencias

- La model card del adaptador está completamente vacía en cuanto a detalles de entrenamiento, datos y evaluación. No se puede confiar en el rendimiento del adaptador sin una validación independiente.
- Al ser un adaptador no oficial, no hay garantía de que funcione correctamente fuera del dominio para el que fue entrenado (si es que fue entrenado para un dominio específico).
- El modelo base EXAONE-3.5-7.8B-Instruct tiene sesgos inherentes y puede producir alucinaciones, especialmente en contextos financieros donde la precisión es crítica.
- No se especifica la licencia del adaptador, por lo que su uso comercial es incierto. Se recomienda contactar con el autor antes de utilizarlo en producción.
- El adaptador fue creado en 2026 (según la fecha de creación), pero no hay evidencia de mantenimiento o soporte posterior.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/sbcho0325/EXAONE-3.5-7.8B-lg_convfin_mcq_pc_accuracy_high_sft_step510
- Modelo base EXAONE-3.5-7.8B-Instruct: https://huggingface.co/LGAI-EXAONE/EXAONE-3.5-7.8B-Instruct
- Repositorio oficial de EXAONE 3.5 en GitHub: https://github.com/LG-AI-EXAONE/EXAONE-3.5
- Paper técnico de EXAONE 3.5: https://arxiv.org/html/2412.04862v3
- Versión GGUF del modelo base: https://huggingface.co/LGAI-EXAONE/EXAONE-3.5-7.8B-Instruct-GGUF
