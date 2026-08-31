# bhaskar1707/smolvlm2-bangla-bayanno-chitrojera-lora

## Resumen

BanglaVLM-v2 es un adaptador LoRA para el modelo de visión-lenguaje SmolVLM2-2.2B-Instruct, desarrollado por bhaskar1707 para responder preguntas visuales en bengalí. El adaptador se entrenó sobre dos conjuntos de datos de VQA en bengalí: Bangla-Bayanno (53 817 pares pregunta-respuesta) y ChitroJera (12 231 pares), con el objetivo de estudiar el efecto del entrenamiento multi-dataset en el rendimiento de VQA bengalí. El repositorio contiene únicamente los pesos del adaptador PEFT, no el modelo completo, por lo que debe cargarse junto con el modelo base SmolVLM2-2.2B-Instruct.

La relevancia de este modelo radica en que aborda un idioma de bajos recursos (bengalí) en una tarea multimodal, y documenta de forma transparente el proceso de entrenamiento, la calidad de los datos y los resultados de evaluación. Aunque el rendimiento absoluto es modesto (32,33 % de Exact Match en el test de Bangla-Bayanno), supone una mejora sustancial frente al modelo base sin ajuste (0 % EM) y demuestra la viabilidad de adaptar modelos VLM multilingües a idiomas específicos mediante LoRA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre SmolVLM2-2.2B-Instruct (transformer multimodal de vision-lenguaje) |
| Parametros totales | no disponible (el adaptador LoRA tiene un tamano de 0,1 GB; el modelo base tiene 2,2 B) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (depende del modelo base SmolVLM2-2.2B-Instruct) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; el modelo base admite cuantizacion estandar) |
| Idiomas soportados | bengali (bn) |
| Licencia | no disponible (el repositorio hermano smolvlm2-bangla-bayanno-lora indica apache-2.0, pero este repo no especifica) |
| Formato de pesos | safetensors (adapter_model.safetensors) + adapter_config.json |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA (Low-Rank Adaptation) aplicado sobre SmolVLM2-2.2B-Instruct, un modelo de vision-lenguaje de la familia SmolVLM2 de HuggingFace. El adaptador se entrena mediante PEFT (Parameter-Efficient Fine-Tuning), lo que permite ajustar el modelo con un coste computacional reducido. El entrenamiento se realizó en el experimento 2 del proyecto, combinando dos datasets de VQA bengalí: Bangla-Bayanno (53 817 registros QA, 4 717 imágenes únicas) y ChitroJera (12 231 registros QA, 12 231 imágenes únicas). El tiempo de entrenamiento fue de 0,82 horas, con un tiempo de evaluación de 2,72 horas. No se especifica el uso de RLHF, DPO ni otras técnicas de alineación; el ajuste es supervisado sobre los pares pregunta-respuesta de los datasets.

## Capacidades

- Respuesta a preguntas visuales (VQA) en bengalí: dado un imagen y una pregunta en bengalí, genera una respuesta textual en el mismo idioma.
- Generación de texto multimodal: puede describir o responder sobre el contenido de imágenes, limitado al dominio de los datos de entrenamiento.
- Conversación básica: el modelo base SmolVLM2-Instruct soporta interacción conversacional, y el adaptador hereda esta capacidad, aunque el ajuste se centra en VQA.
- No se ha documentado soporte para tool calling, agentes, razonamiento multi-paso ni capacidades de audio o vídeo.

## Casos de uso

- Accesibilidad para hablantes de bengalí: ayudar a personas con discapacidad visual a comprender imágenes del entorno mediante preguntas en bengalí, por ejemplo, identificar objetos o leer texto en fotografías.
- Educación asistida: responder preguntas de estudiantes sobre diagramas, ilustraciones o fotografías en material didáctico en bengalí, facilitando el aprendizaje autónomo.
- Moderación de contenido visual: clasificar o describir imágenes en plataformas bengalíes, respondiendo a preguntas como "¿qué aparece en esta imagen?" para filtrar contenido inapropiado.
- Documentación de patrimonio cultural: catalogar imágenes de arte, arquitectura o tradiciones bengalíes generando descripciones o respondiendo consultas sobre ellas.
- Asistente de compras en línea: responder preguntas de clientes sobre productos mostrados en imágenes (color, tamaño, tipo) en tiendas de comercio electrónico bengalíes.
- Investigación académica en PNL: servir como punto de partida para estudiar el comportamiento de adaptadores LoRA en VQA multilingüe de bajos recursos, o para comparar estrategias de entrenamiento multi-dataset.

## Benchmarks y rendimiento

Los resultados de evaluación se presentan en la model card del autor, sobre dos conjuntos de test retenidos: Bangla-Bayanno (5 004 muestras) y ChitroJera (1 224 muestras). Las métricas son Exact Match (EM), Normalized Exact Match (NEM) y ROUGE-L.

| Modelo | Dataset de test | Exact Match | Normalized EM | ROUGE-L |
|---|---|---|---|---|
| Base SmolVLM2 | Bangla-Bayanno | 0,00 % | 0,00 % | 0,23 % |
| BanglaVLM-v1 | Bangla-Bayanno | 33,47 % | 33,51 % | 34,17 % |
| **BanglaVLM-v2** | **Bangla-Bayanno** | **32,33 %** | **32,37 %** | **33,11 %** |
| Base SmolVLM2 | ChitroJera | 0,00 % | 0,00 % | 0,18 % |
| BanglaVLM-v1 | ChitroJera | 3,10 % | 3,10 % | 5,34 % |
| **BanglaVLM-v2** | **ChitroJera** | **6,29 %** | **6,29 %** | **9,95 %** |

El adaptador mejora significativamente al modelo base en ambos datasets, y supera a BanglaVLM-v1 en ChitroJera, aunque es ligeramente inferior en Bangla-Bayanno. No se han publicado resultados en benchmarks generales como MMLU o HumanEval.

## Requisitos de hardware

- El adaptador LoRA ocupa 0,1 GB, pero requiere cargar el modelo base SmolVLM2-2.2B-Instruct (2,2 B parámetros) para funcionar.
- VRAM estimada para el modelo base en FP16: aproximadamente 5-6 GB, lo que permite ejecutarlo en GPUs consumer como RTX 3060 (12 GB) o superiores. Con cuantización de 4 bits, podría caber en GPUs con 4-6 GB de VRAM.
- GPUs recomendadas: RTX 3060, RTX 4070, A10, A100 (para despliegue en producción con mayor throughput).
- Opciones de despliegue: al ser un adaptador PEFT, puede cargarse con transformers y peft en Python, o fusionarse con el modelo base para exportarlo a formatos como GGUF y usarlo con llama.cpp u Ollama. También es compatible con vLLM si se fusiona previamente.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Base | Metodo de ajuste | EM en Bangla-Bayanno | EM en ChitroJera | Licencia |
|---|---|---|---|---|---|
| BanglaVLM-v2 (este) | SmolVLM2-2.2B-Instruct | LoRA | 32,33 % | 6,29 % | no disponible |
| BanglaVLM-v1 | SmolVLM2-2.2B-Instruct | LoRA | 33,47 % | 3,10 % | no disponible |
| Base SmolVLM2 | - | sin ajuste | 0,00 % | 0,00 % | apache-2.0 (modelo base) |

La comparativa se limita a los modelos documentados en la propia model card. No se dispone de información sobre otros modelos VQA bengalíes comparables.

## Limitaciones y advertencias

- Rendimiento bajo en el dataset ChitroJera (6,29 % EM), lo que indica una generalización limitada a otros dominios de VQA bengalí.
- El modelo solo ha sido entrenado para bengalí; no se garantiza un comportamiento correcto en otros idiomas.
- Riesgo de alucinación: como todo modelo generativo, puede producir respuestas plausibles pero incorrectas, especialmente en imágenes fuera de la distribución de entrenamiento.
- La licencia no está especificada en este repositorio, lo que genera incertidumbre sobre el uso comercial. El repositorio hermano (smolvlm2-bangla-bayanno-lora) indica apache-2.0, pero no se puede asumir para este.
- El adaptador no es un modelo autónomo; requiere el modelo base SmolVLM2-2.2B-Instruct, cuya licencia (apache-2.0) debe respetarse.
- No se han documentado sesgos específicos, pero al entrenarse con datos de VQA bengalíes, puede heredar sesgos presentes en esos datasets (por ejemplo, desequilibrios de género o contexto cultural).

## Enlaces

- Repositorio del adaptador: https://huggingface.co/bhaskar1707/smolvlm2-bangla-bayanno-chitrojera-lora
- Repositorio del experimento anterior (BanglaVLM-v1): https://huggingface.co/bhaskar1707/smolvlm2-bangla-bayanno-lora
- Modelo base SmolVLM2-2.2B-Instruct: https://huggingface.co/HuggingFaceTB/SmolVLM2-2.2B-Instruct
