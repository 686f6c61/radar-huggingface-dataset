# Abhere/medical-llm-finetuned

## Resumen

Abhere/medical-llm-finetuned es un modelo de lenguaje especializado en el dominio médico, desarrollado por el usuario Abhere mediante fine-tuning del modelo base unsloth/llama-3.2-3b-unsloth-bnb-4bit, que a su vez es una versión cuantizada a 4 bits de Llama 3.2 3B. El entrenamiento se realizó con la librería Unsloth y el framework TRL, lo que permite un ajuste fino eficiente en términos de tiempo y recursos. El modelo está pensado para tareas de generación de texto en el ámbito sanitario, aunque la información pública sobre el dataset utilizado o las capacidades específicas es muy limitada.

Con solo 0,1 GB de tamaño de repositorio y una arquitectura basada en Llama 3.2 (3.000 millones de parámetros), se trata de un modelo ligero que podría desplegarse en hardware de consumo. La licencia Apache-2.0 permite uso comercial sin restricciones significativas. Sin embargo, al ser un fine-tuning sobre una base ya cuantizada, es probable que el rendimiento en tareas médicas complejas sea limitado. Su relevancia actual radica en la creciente demanda de modelos médicos open source, aunque este ejemplo concreto carece de documentación detallada y validación externa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama 3.2 (transformer decoder-only) |
| Parametros totales | 3.000 millones (aprox., base Llama 3.2 3B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (la base Llama 3.2 3B soporta 128K, pero el fine-tuning podría haberla reducido) |
| Tipos de cuantizacion | 4 bits (base: bnb-4bit); se desconoce si el modelo final está cuantizado |
| Idiomas soportados | Ingles (segun metadatos) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (segun tags) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Llama 3.2, un transformer decoder-only con normalizacion RMSNorm, activacion SwiGLU y atencion por ventanas. La version 3B es una de las mas compactas de la familia Llama 3.2, disenada para despliegue eficiente. El fine-tuning se realizo con Unsloth, una libreria que optimiza el entrenamiento mediante kernels de CUDA personalizados y cuantizacion en 4 bits, y con TRL (Transformers Reinforcement Learning) para el pipeline de ajuste. No se especifica el dataset medico utilizado, el numero de tokens de entrenamiento ni si se aplicaron tecnicas como RLHF o DPO. Dado que el modelo base ya estaba cuantizado a 4 bits, es probable que el fine-tuning se haya hecho con LoRA o QLoRA para evitar degradar los pesos. No hay informacion sobre innovaciones tecnicas propias.

## Capacidades

- Generacion de texto en ingles con conocimiento general de la base Llama 3.2 3B.
- Especializacion en dominios medicos (presumiblemente) gracias al fine-tuning, aunque no se detalla en que tareas concretas.
- Capacidades de razonamiento y comprension limitadas por el tamano del modelo (3B parametros).
- No se menciona soporte para tool calling, function calling, agentes, vision, audio ni modo de pensamiento.
- La base Llama 3.2 3B tiene una ventana de contexto de 128K tokens, pero el fine-tuning podria haberla reducido; no se confirma en la documentacion.
- Capacidades multilingues: no, solo ingles segun los metadatos.

## Casos de uso

- Asistencia en redaccion de documentos clinicos: el modelo puede ayudar a generar borradores de historiales, resumenes de alta o notas de progreso en ingles, aunque su tamano limitado puede producir textos poco precisos.
- Educacion medica: como herramienta de apoyo para estudiantes que necesiten explicaciones sencillas de conceptos medicos, siempre supervisadas por profesionales.
- Clasificacion de sintomas en entornos de triage: podria usarse para extraer sintomas de descripciones de pacientes y sugerir categorias de urgencia, pero con validacion humana obligatoria.
- Chatbots de informacion sanitaria general: para responder preguntas frecuentes sobre medicamentos o procedimientos, sin sustituir el consejo medico.
- Generacion de contenido para blogs o materiales divulgativos en salud: siempre con revision editorial.
- Prototipado rapido de aplicaciones medicas: al ser un modelo pequeno y con licencia permisiva, sirve para validar ideas antes de invertir en modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos sobre MMLU, USMLE, MedQA u otras evaluaciones medicas. El autor no proporciona comparaciones con modelos similares.

## Requisitos de hardware

- El modelo base tiene 3B parametros; en precision FP16 ocuparia ~6 GB de VRAM. Si el fine-tuning mantiene la cuantizacion 4 bits, el modelo final podria ocupar ~2 GB.
- GPU recomendadas: una RTX 3060 de 12 GB o superior seria suficiente para inferencia en 4 bits. Para FP16 completo, una RTX 4070 o A10 seria adecuada.
- Cabe en GPUs de consumo (RTX 3060, 4060, 4090) y en Apple Silicon con suficiente RAM unificada.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI, o directamente con transformers y pipeline de HuggingFace.
- Latencia estimada: en una RTX 4090, la generacion de 100 tokens podria tardar entre 0,5 y 1 segundo; en CPU seria mucho mas lenta (5-10 segundos).
- Throughput: no disponible.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa fiable. El modelo es un fine-tuning de Llama 3.2 3B, pero no se conocen sus metricas ni su dataset. Alternativas medicas open source mejor documentadas incluyen:

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Abhere/medical-llm-finetuned | 3B | no disponible | Apache-2.0 | Fine-tuning sin benchmarks publicados |
| Meditron-7B | 7B | 4K | GNU GPL 3.0 | Fine-tuning de Llama 2, evaluado en MedQA |
| BioMistral-7B | 7B | 8K | Apache-2.0 | Fine-tuning de Mistral, con evaluaciones en PubMed |

No obstante, la comparacion con estos modelos es orientativa porque no hay datos de rendimiento del modelo evaluado.

## Limitaciones y advertencias

- Sin validacion clinica: no hay evidencia de que el modelo produzca respuestas medicas fiables; no debe usarse en entornos de diagnostico o tratamiento real.
- Riesgo de alucinacion: como todo LLM, puede inventar informacion medica, lo que es especialmente peligroso en este dominio.
- Tamano reducido: 3B parametros limitan la capacidad de razonamiento complejo y la comprension de contextos largos.
- Documentacion insuficiente: no se detalla el dataset de entrenamiento, las tecnicas de alineacion ni las limitaciones especificas.
- Idioma: solo ingles, lo que limita su uso en poblaciones hispanohablantes sin traduccion previa.
- Base cuantizada: el entrenamiento sobre un modelo 4-bit puede haber degradado la calidad del fine-tuning.
- Licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantias de exactitud medica.

## Enlaces

- HuggingFace: https://huggingface.co/Abhere/medical-llm-finetuned
- Unsloth (libreria de entrenamiento): https://github.com/unslothai/unsloth
- OpenMedLLM (comunidad, no oficial del modelo): https://openmedllm.com/
- Articulo sobre fine-tuning de modelos medicos (contexto general): https://arxiv.org/html/2407.11536v1
- Repositorio similar de fine-tuning medico (referencia): https://github.com/Eslamusamaaa/Medical-LLM-Finetuning
- Blog sobre Open Medical-LLM Leaderboard: https://huggingface.co/blog/leaderboard-medicalllm
