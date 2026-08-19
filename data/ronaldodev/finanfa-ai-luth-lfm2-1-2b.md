# Ronaldodev/finanfa-ai-luth-lfm2-1.2b

## Resumen

FINANFA AI es un modelo de lenguaje especializado en el conocimiento de Benín, desarrollado por Ronaldodev como un experimento para evaluar si una base de mayor tamaño mejora la fiabilidad factual frente a la versión anterior de 0,6B. Se trata de un fine-tuning LoRA sobre el checkpoint kurakurai/Luth-LFM2-1.2B, que a su vez es un fine-tune en francés de LiquidAI/LFM2-1.2B, un modelo de arquitectura híbrida con bloques de convolución con puerta y atención GQA.

El modelo cubre historia, reinos, política, instituciones, cultura, vodún, geografía, economía, lenguas nacionales y vida cotidiana de Benín. El objetivo principal es determinar si el aumento de parámetros (de 0,6B a 1,2B) reduce la inestabilidad en el recuerdo de hechos biográficos precisos observada en la versión anterior, manteniendo el mismo dataset y configuración de entrenamiento para aislar la variable del tamaño del modelo base.

Con 1,17 mil millones de parámetros y una ventana de contexto de 1024 tokens, este modelo está pensado para aplicaciones conversacionales en francés centradas en el ámbito beninés. Su licencia LFM1.0 permite uso comercial gratuito solo por debajo de 10 millones de dólares de ingresos anuales, un factor crítico a considerar para despliegues en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida LFM2: bloques de convolución con puerta + bloques de atención GQA |
| Parametros totales | 1.170.340.608 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 1024 tokens (longitud máxima de secuencia en entrenamiento) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Francés |
| Licencia | LFM1.0 (uso comercial gratuito bajo 10M$ de ingresos anuales) |
| Formato de pesos | safetensors (adaptador LoRA fusionado) |

## Arquitectura y entrenamiento

El modelo base LFM2-1.2B de Liquid AI emplea una arquitectura híbrida que combina bloques de convolución con puerta y bloques de atención con consultas agrupadas (GQA). Esta combinación busca equilibrar eficiencia computacional y calidad de generación, con un diseño orientado a despliegue en dispositivos con recursos limitados. El entrenamiento del modelo base incluyó destilación de conocimiento con objetivo Top-K templado y decoupled, aprendizaje curricular con datos ordenados por dificultad, y un pipeline de post-entrenamiento en tres etapas: fine-tuning supervisado, optimización de preferencias con normalización de longitud y fusión de modelos.

El fine-tuning de FINANFA AI se realizó con LoRA (r=32, alpha=32, dropout=0) sobre los módulos q_proj, k_proj, v_proj, out_proj, in_proj, w1, w2 y w3, con fusión del adaptador mediante merge_and_unload. El dataset privado Ronaldodev/finanfa-ai-dataset contiene 20.286 conversaciones válidas tras eliminar duplicados exactos, reducidas a 15.561 tras reequilibrar la categoría decoupage_territorial. El entrenamiento usó 3 épocas con early stopping (paciencia 3), batch efectivo de 16, learning rate de 0,0001 y longitud máxima de 1024 tokens, ejecutado en GPU T4 de Kaggle/Colab. El sistema prompt del dataset instruye al modelo a declarar explícitamente la incertidumbre ante hechos dudosos en lugar de inventar.

## Capacidades

- Generación de texto conversacional en francés especializado en conocimientos de Benín: historia, reinos, política, instituciones, cultura, vodún, geografía, economía y lenguas nacionales.
- Recuerdo de hechos biográficos y cronológicos de figuras históricas beninesas (reyes del Dahomey, líderes militares, etc.).
- Respuesta a preguntas factuales con formato system/user/assistant, siguiendo instrucciones del sistema para declarar incertidumbre.
- Capacidad multilingüe limitada al francés; no se ha entrenado para lenguas nacionales de Benín (fon, yoruba, bariba, dendi, mina, adja).
- No se ha documentado soporte para tool calling, function calling ni razonamiento multi-paso.
- No se ha documentado modo de pensamiento extendido ni capacidades multimodales.

## Casos de uso

- Atención al ciudadano en administraciones públicas beninesas: el modelo puede gestionar consultas sobre trámites, instituciones y organización territorial, con respuestas en francés adaptadas al contexto local.
- Asistente educativo para escuelas y universidades: estudiantes pueden preguntar sobre historia del Dahomey, reyes, batallas o cultura vodún, obteniendo respuestas contextualizadas y con advertencia de incertidumbre cuando el dato no es seguro.
- Guía turístico digital: visitantes de Benín pueden consultar información sobre sitios históricos, reinos precoloniales, geografía y tradiciones culturales, con respuestas en francés.
- Documentación y preservación cultural: investigadores y creadores de contenido pueden usar el modelo para redactar materiales divulgativos sobre patrimonio beninés, apoyándose en su conocimiento especializado.
- Chatbot para ONG y organismos de cooperación: organizaciones que trabajan en Benín pueden desplegar un asistente interno para consultas sobre contexto político, económico y cultural del país.
- Sistema de información para medios de comunicación: periodistas pueden verificar datos históricos o contextuales sobre Benín antes de publicar, aunque el modelo no debe usarse como fuente única.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor reporta una pérdida de 0,9008 en el conjunto de test separado del entrenamiento, y una evaluación cualitativa manual comparando Luth-0.6B-Instruct frente a FINANFA-Luth sobre un banco de 384 preguntas, cuyos resultados detallados se incluyen en el archivo qualitative_eval.json del repositorio. No se ha implementado aún una métrica automática de exactitud factual.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo de 1,17B parámetros en precisión FP16, requiere aproximadamente 2,5-3 GB de VRAM; con cuantización a 8 bits podría reducirse a ~1,5 GB.
- GPU recomendadas: el entrenamiento se realizó en una NVIDIA T4 (16 GB), por lo que cualquier GPU con 4 GB o más de VRAM puede ejecutar inferencia sin problemas. Tarjetas como RTX 3060, RTX 4060 o superiores son suficientes.
- Compatibilidad con GPU de consumo: sí, cabe en GPUs de consumo con 4 GB o más de VRAM.
- Opciones de despliegue: al ser un modelo con pesos en safetensors y arquitectura estándar de HuggingFace, puede desplegarse con vLLM, llama.cpp (si se convierte a GGUF), Ollama, o mediante la librería transformers de HuggingFace con PEFT.
- Latencia y throughput: no se han publicado mediciones específicas; en una T4 se espera una latencia de decodificación de aproximadamente 20-40 ms por token, dependiendo de la implementación y el batch.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Especializacion |
|---|---|---|---|---|---|
| Ronaldodev/finanfa-ai-luth-lfm2-1.2b | 1,17B | 1024 | Híbrida LFM2 (convolución + GQA) | LFM1.0 | Conocimiento de Benín (francés) |
| Ronaldodev/finanfa-ai-luth-0.6b | 0,6B | No disponible | Qwen3 | No disponible | Conocimiento de Benín (francés) |
| LiquidAI/LFM2-1.2B | 1,2B | No disponible | Híbrida LFM2 | LFM1.0 | Modelo base general multilingüe |
| kurakurai/Luth-LFM2-1.2B | 1,2B | No disponible | Híbrida LFM2 | No disponible | Fine-tune francés de LFM2-1.2B |

La comparación directa con la versión 0.6B es el objetivo principal del experimento: mismo dataset y configuración, solo cambia el tamaño del modelo base. El autor busca determinar si el coste adicional de computación y latencia (el modelo es 2 veces más pesado) se justifica por una mejora en la fiabilidad factual.

## Limitaciones y advertencias

- Licencia LFM1.0: el uso comercial gratuito está limitado a empresas con ingresos anuales inferiores a 10 millones de dólares. Superado ese umbral, es necesario verificar los términos de la licencia antes de cualquier despliegue amplio.
- El dataset de entrenamiento se deduplicó solo sobre duplicados exactos; pueden existir cuasi-duplicados semánticos entre train, validation y test, lo que podría inflar ligeramente las métricas de evaluación.
- El modelo puede mostrar tendencia a inventar valores ante información ambigua o ausente en documentos de entrada, comportamiento heredado del modelo base que este fine-tuning intenta mitigar mediante el sobre-muestreo de categorías de fidelidad, pero no se ha verificado específicamente en zero-shot.
- No debe utilizarse como fuente única para decisiones médicas, jurídicas o administrativas.
- Solo está disponible en francés; no soporta lenguas nacionales de Benín (fon, yoruba, bariba, dendi, mina, adja).
- Es una primera versión experimental sobre esta base: no se han implementado métricas automáticas de exactitud factual, y la evaluación cualitativa manual puede no ser exhaustiva.
- La ventana de contexto de 1024 tokens es limitada para aplicaciones que requieran documentos largos o conversaciones extensas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Ronaldodev/finanfa-ai-luth-lfm2-1.2b
- Modelo base kurakurai/Luth-LFM2-1.2B: https://huggingface.co/kurakurai/Luth-LFM2-1.2B
- Modelo base original LiquidAI/LFM2-1.2B: https://huggingface.co/LiquidAI/LFM2-1.2B
- Versión de referencia 0.6B: https://huggingface.co/Ronaldodev/finanfa-ai-luth-0.6b
- Dataset de entrenamiento (privado): https://huggingface.co/datasets/Ronaldodev/finanfa-ai-dataset
- Informe técnico de LFM2: https://arxiv.org/html/2511.23404v1
- Blog de Liquid AI sobre LFM2: https://www.liquid.ai/blog/liquid-foundation-models-v2-our-second-series-of-generative-ai-models
- Documentación de LFM2-1.2B: https://docs.liquid.ai/lfm/models/lfm2-1.2b
