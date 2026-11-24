# BlessJ/gemma4-31b-decision-lora

## Resumen

BlessJ/gemma4-31b-decision-lora es un adaptador LoRA (pesos en formato safetensors) publicado por el usuario BlessJ sobre el modelo base MachinePulseAI/karpo-decision-31B. El repositorio está etiquetado como text-classification y con la familia gemma4, y su propósito declarado es la clasificación de texto orientada a la toma de decisiones (tag "decision"). El adaptador se distribuye bajo licencia Apache 2.0, aunque el repositorio está restringido (gated) y requiere aceptar condiciones en Hugging Face antes de la descarga.

El dato más relevante es el tamaño: los safetensors del repositorio suman 31.273.088.876 parámetros, lo que sitúa al modelo base en la escala de 31 000 millones de parámetros. El repositorio ocupa 62,6 GB, coherente con pesos en precisión de 16 bits. No obstante, la información pública disponible es muy escasa: no se documentan idiomas soportados, composición del dataset de entrenamiento, hiperparámetros del LoRA ni resultados de evaluación.

La ficha se ha elaborado exclusivamente con los metadatos del repositorio. Cualquier dato no confirmado se marca explícitamente como "no disponible" para no inducir a error a quien evalúe el modelo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Gemma 4 (según tags del repositorio); detalles exactos no disponibles |
| Parámetros totales | 31.273.088.876 (~31,3 mil millones) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (repo en safetensors; se asume fp16/bf16 por el tamaño de 62,6 GB) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Pipeline | text-classification |
| Modelo base | MachinePulseAI/karpo-decision-31B (finetune) |
| Acceso | Restringido (gated) |
| Tamaño del repositorio | 62,6 GB |

## Arquitectura y entrenamiento

El repositorio se presenta como un adaptador LoRA sobre MachinePulseAI/karpo-decision-31B, un modelo de 31,3 mil millones de parámetros etiquetado como gemma4, lo que sugiere una arquitectura transformer decoder-only de la familia Gemma. Al tratarse de un LoRA, el entrenamiento habría actualizado un subconjunto reducido de matrices de pesos del modelo base para especializarlo en una tarea de clasificación de texto con salida de decisión, en lugar de reentrenar todos los parámetros.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, el rango y alpha del LoRA, la estrategia de ajuste (SFT, RLHF, DPO u otra) ni innovaciones técnicas adicionales como decodificación especulativa o atención lineal. Tampoco se documenta si el adaptador se ha fusionado con el modelo base en los pesos publicados; el recuento de 31,3 mil millones de parámetros en safetensors es compatible tanto con un adaptador fusionado como con una exportación completa del modelo ajustado.

## Capacidades

- Clasificación de texto: el pipeline declarado es text-classification, orientado a tareas de decisión (etiquetado, categorización o selección entre opciones).
- Especialización en decisiones: el nombre y el tag "decision" indican un ajuste para escenarios de clasificación o elección, aunque no se detalla el esquema de etiquetas.
- Generación de texto: heredada del modelo base Gemma 4, aunque no confirmada en la documentación del adaptador.
- Razonamiento y código: capacidades esperables del modelo base de 31B, pero no documentadas para este adaptador.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no se listan idiomas en el repositorio).
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Clasificación de tickets de soporte: el adaptador puede asignar categorías o prioridades a incidencias entrantes en un helpdesk, aprovechando su ajuste específico para tareas de decisión y su pipeline de text-classification.
- Enrutamiento de solicitudes: en un sistema de gestión de casos, el modelo puede decidir a qué departamento o flujo corresponde una petición escrita, reduciendo la intervención manual en la primera línea.
- Moderación y triaje de contenido: clasificación de textos según políticas internas (aceptar, revisar, rechazar), adecuado por su naturaleza de clasificador especializado.
- Análisis de sentimiento y opinión en encuestas: etiquetado de respuestas abiertas en estudios de mercado o de satisfacción, con la ventaja de un modelo de 31B para captar matices frente a clasificadores pequeños.
- Decisión en pipelines de datos: filtrado o etiquetado automático de grandes volúmenes de documentos antes de su indexación o archivado, integrándolo como paso de clasificación en un ETL.
- Evaluación de riesgo en textos financieros o legales: clasificación de comunicaciones según niveles de riesgo o urgencia, siempre con revisión humana dado el escaso soporte documental del modelo.
- Prototipado de clasificadores personalizados: punto de partida para equipos que quieran ajustar aún más el adaptador sobre su propio corpus de decisión, al estar publicado en safetensors y con licencia Apache 2.0.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp16/bf16, alrededor de 62 GB solo para pesos, más overhead de activaciones y KV cache; en cuantización de 8 bits, en torno a 31-35 GB; en 4 bits, aproximadamente 16-20 GB (estimaciones orientativas, no confirmadas por el autor).
- GPU recomendadas: A100 80 GB o H100 80 GB para fp16 sin cuantizar; A100 40 GB o L40S 48 GB con cuantización de 8 bits; dos RTX 4090 (24 GB cada una) para fp16 con tensor parallelism.
- GPU de consumo: una RTX 4090 de 24 GB solo es viable con cuantización de 4 bits y ventanas de contexto moderadas; una RTX 3090 de 24 GB queda en el mismo escenario.
- Opciones de despliegue: vLLM o TGI para serving de alto rendimiento; llama.cpp u Ollama si se convierte a GGUF y se cuantiza; transformers con PEFT para cargar el adaptador LoRA sobre el modelo base.
- Latencia y throughput: no disponibles. Como referencia de escala, un modelo denso de 31B en una A100 80 GB suele ofrecer decenas de tokens por segundo en generación, pero al ser una tarea de clasificación la latencia dependerá del tamaño de entrada y del número de clases.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Acceso |
|---|---|---|---|---|---|
| BlessJ/gemma4-31b-decision-lora | 31,3 B | no disponible | Clasificación / decisión | Apache 2.0 | Gated |
| MachinePulseAI/karpo-decision-31B (base) | 31,3 B (según este repo) | no disponible | Clasificación / decisión | no disponible | no disponible |
| Gemma 2 27B (referencia de familia) | 27 B | 8 K | Generación general | Gemma Terms | Abierto |
| Qwen2.5 32B Instruct (referencia de escala) | 32,5 B | 128 K | Generación general | Apache 2.0 | Abierto |

La comparativa con modelos de la misma familia o escala es aproximada: no hay datos públicos de rendimiento del adaptador ni del modelo base karpo-decision-31B que permitan una comparación cuantitativa fiable.

## Limitaciones y advertencias

- Documentación mínima: no se especifican idiomas, dataset de entrenamiento, hiperparámetros del LoRA ni esquema de etiquetas, lo que dificulta evaluar su idoneidad antes de desplegarlo.
- Riesgo de alucinación y clasificaciones erróneas: al ser un modelo de 31B ajustado para decisión, puede producir etiquetas inconsistentes en dominios alejados de sus datos de entrenamiento, que no se conocen.
- Sesgos desconocidos: al no publicarse la composición del corpus, no es posible auditar sesgos de género, raza, idioma o dominio.
- Licencia: el adaptador es Apache 2.0, pero el modelo base MachinePulseAI/karpo-decision-31B puede tener condiciones adicionales; conviene verificar su licencia antes de uso comercial.
- Acceso restringido: el repositorio es gated y requiere aceptar condiciones en Hugging Face, lo que añade fricción a la automatización de descargas en CI/CD.
- Sin métricas de producción: no hay benchmarks, curvas de evaluación ni informes de latencia, por lo que cualquier despliegue debería ir precedido de una evaluación propia sobre datos representativos.
- Fecha de creación futura (2026-11-24): el metadato de creación es posterior a la fecha actual, lo que sugiere posible reetiquetado o error en los metadatos; conviene tratarlo con cautela.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/BlessJ/gemma4-31b-decision-lora
- Modelo base: https://huggingface.co/MachinePulseAI/karpo-decision-31B
- Paper de Gemma (familia referenciada): https://arxiv.org/abs/2403.08295
- Documentación de PEFT (carga de LoRA): https://huggingface.co/docs/peft
- Documentación de vLLM: https://docs.vllm.ai
- Documentación de llama.cpp: https://github.com/ggerganov/llama.cpp
