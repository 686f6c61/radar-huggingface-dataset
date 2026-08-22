# ranasrule/Med3DVLM-Qwen-2.5-7B-mirror

## Resumen

Med3DVLM es un modelo de lenguaje y visión (VLM) especializado en el análisis de imágenes médicas tridimensionales, como tomografías computarizadas (CT) y resonancias magnéticas (MRI). El modelo original fue desarrollado por el equipo de MagicXin y está documentado en el repositorio mirthAI/Med3DVLM y en el artículo arXiv 2503.20047. La entrada que se analiza aquí es un espejo (mirror) alojado por el usuario ranasrule en Hugging Face, que replica los pesos originales bajo la misma licencia Apache 2.0.

El modelo combina el modelo de lenguaje Qwen2.5-7B-Instruct como base con un proyector multimodal y módulos LoRA adaptados específicamente para alinear características espaciales 3D con texto clínico. La arquitectura está diseñada para ser eficiente en el procesamiento de datos volumétricos, un reto habitual en la extensión de VLMs 2D al dominio 3D. Con aproximadamente 7,68 mil millones de parámetros, se posiciona como una opción de tamaño medio para tareas de generación de informes radiológicos y respuesta a preguntas visuales médicas.

La relevancia actual de este modelo radica en la escasez de VLMs 3D médicos de código abierto, y en que hereda las capacidades de instrucción del modelo base Qwen2.5, lo que facilita su integración en flujos clínicos de investigación y desarrollo. El espejo consultado no añade modificaciones técnicas sobre el original, pero facilita el acceso en una región alternativa de HuggingFace.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language Model (VLM) basado en Qwen2.5-7B-Instruct con proyector multimodal y LoRA |
| Parametros totales | 7.678.258.880 (7,68 B) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (el modelo base Qwen2.5-7B-Instruct soporta 32.768 tokens) |
| Tipos de cuantizacion | no disponible (repositorio solo con pesos safetensors en formato original) |
| Idiomas soportados | no disponible (el modelo base Qwen2.5 soporta multiples idiomas, pero no se ha publicado la configuracion final del VLM) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con custom_code para el VLM) |

## Arquitectura y entrenamiento

El modelo se construye sobre el modelo de lenguaje Qwen2.5-7B-Instruct, que aporta la capacidad de razonamiento y generación de texto. Sobre esta base se añade un proyector multimodal que alinea las características de imágenes médicas volumétricas 3D con el espacio de representación textual del LLM. El entrenamiento se realiza mediante la optimización conjunta de los parámetros LoRA (Low-Rank Adaptation) y el proyector, una estrategia que reduce los costes computacionales frente a un fine-tuning completo. El entrenamiento se lleva a cabo sobre los datasets M3D-Cap (generación de informes) y M3D-VQA (respuesta a preguntas visuales), tal y como se describe en el artículo arXiv.

El diseño se centra en la eficiencia: en lugar de procesar directamente toda la volumetría 3D de forma costosa, el modelo aprovecha un proyector que comprime las características espaciales y las alinea con el texto clínico. No se han publicado detalles adicionales sobre el codificador visual concreto ni sobre el número de tokens de entrenamiento, por lo que esa información no está disponible.

## Capacidades

- Generación de informes radiológicos a partir de imágenes médicas 3D (CT, MRI).
- Respuesta a preguntas visuales sobre contenido médico (VQA), como detección de anomalías o descripción de estructuras anatómicas.
- Razonamiento multimodal: combina comprensión de imágenes volumétricas con instrucciones textuales clínicas.
- Capacidad de adaptación mediante LoRA: el modelo puede ser re-entrenado o afinado para dominios específicos con recursos limitados.
- Soporte de instrucciones heredado de Qwen2.5-7B-Instruct, incluyendo capacidades de chat y seguimiento de instrucciones complejas.
- No se ha confirmado soporte de tool calling ni function calling en la configuración final del VLM, aunque el modelo base lo permite.
- Capacidad multilingüe no confirmada; el modelo base Qwen2.5 soporta múltiples idiomas, pero no hay datos sobre la configuración del VLM.

## Casos de uso

- Generación automática de informes de radiología: el modelo puede procesar un volumen de CT o MRI y producir un informe descriptivo estructurado, útil para reducir la carga administrativa del personal clínico.
- Triaje asistido por imagen: en entornos de urgencias, puede analizar tomografías de tórax o abdomen para señalar hallazgos críticos (hemorragias, fracturas) y priorizar la revisión humana.
- Educación médica: los estudiantes pueden interrogar al modelo sobre imágenes 3D de casos de estudio, recibiendo explicaciones anatómicas y patológicas.
- Investigación en oncología: ayuda a la anotación de tumores y a la respuesta a preguntas sobre la extensión del tejido afectado, como apoyo a la planificación de tratamientos.
- Sistemas de apoyo a la decisión clínica: integrado en plataformas de PACS, puede ofrecer sugerencias de diagnóstico basadas en la imagen, aunque siempre bajo supervisión médica.
- Desarrollo de chatbots médicos especializados: combinado con un frontend de conversación, puede servir de base para asistentes que resuelven dudas sobre imágenes de pacientes en entornos de investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El artículo arXiv 2503.20047 existe y describe el modelo, pero no se incluyen en la documentación accesible las métricas de evaluación (MMLU, HumanEval, GSM8K, etc.) ni comparativas con otros modelos 3D. Se recomienda consultar el artículo original para obtener datos de rendimiento específicos.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 15,4 GB (pesos de 7,68 B a 2 bytes por parámetro), más overhead de activaciones.
- VRAM estimada en cuantización INT8: aproximadamente 7,7 GB para los pesos, más overhead.
- VRAM estimada en cuantización INT4: aproximadamente 3,9 GB, más overhead.
- GPUs recomendadas: tarjetas con 24 GB de VRAM (RTX 3090, RTX 4090, A5000) para BF16 con espacio cómodo; GPUs de 16 GB (RTX 4080, A4000) pueden funcionar con cuantización 8-bit; GPUs de 8-12 GB (RTX 4070, RTX 3060) son viables con cuantización 4-bit.
- En consumer GPU: cabe en RTX 4090 (24 GB) en BF16 sin cuantizar; en RTX 3080/4070 (10-12 GB) solo con cuantización.
- Opciones de despliegue: vLLM (con soporte de modelos VLM), TGI (Text Generation Inference), llama.cpp (si se convierte a GGUF), Ollama (si se empaqueta en formato compatible). El repositorio original no incluye pesos GGUF, por lo que habría que convertirlos.
- Latencia y throughput estimados: no disponibles. Para un modelo de 7B en una RTX 4090, la generación suele estar en el rango de 20-40 tokens por segundo, pero depende del proyector multimodal y del tamaño de la imagen de entrada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Especialidad | Disponibilidad |
|---|---|---|---|---|---|
| Med3DVLM-Qwen-2.5-7B | 7,68 B | no disponible (base 32K) | Apache 2.0 | VLM médico 3D | HuggingFace |
| Qwen2.5-7B-Instruct | 7,61 B | 32K tokens | Apache 2.0 | LLM general | HuggingFace |
| LLaVA-1.5-7B | 7,1 B | 2K tokens | Apache 2.0 | VLM 2D general | HuggingFace |
| MedVILA-7B | 7 B | no disponible | Apache 2.0 | VLM médico 2D | HuggingFace |

La comparación directa con otros VLMs médicos 3D es limitada porque hay pocos modelos abiertos de este tipo. Frente a Qwen2.5-7B-Instruct, Med3DVLM añade la modalidad visual 3D, pero pierde la versatilidad generalista. Frente a LLaVA-1.5, la diferencia principal es la capacidad de procesar volumetría 3D frente a imágenes 2D. No hay datos de benchmarks que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- Sesgos en imágenes médicas: los datos de entrenamiento (M3D-Cap, M3D-VQA) pueden contener sesgos demográficos o de equipamiento específicos, lo que puede afectar la generalización a otros entornos clínicos.
- Riesgo de alucinación: como todo modelo de lenguaje, puede generar descripciones o respuestas plausibles pero incorrectas, especialmente en casos atípicos o con imágenes de baja calidad.
- Limitaciones de idioma: la configuración final del VLM no confirma soporte multilingüe; es probable que funcione mejor en inglés, que es el idioma principal de los datasets.
- Validación clínica: el modelo no ha sido validado para uso clínico directo; cualquier uso en diagnóstico debe ser supervisado por profesionales sanitarios y cumplir con la normativa local.
- El espejo consultado no es el repositorio original; se recomienda verificar la integridad de los pesos y el código antes de usar en producción.
- Tamaño del repositorio: 33,1 GB, lo que implica que la descarga y el almacenamiento requieren recursos considerables.
- La longitud de contexto final no está confirmada; el procesamiento de imágenes 3D puede consumir una parte significativa de la ventana de tokens, limitando la cantidad de texto que se puede incluir en la conversación.

## Enlaces

- Modelo en HuggingFace (espejo): https://huggingface.co/ranasrule/Med3DVLM-Qwen-2.5-7B-mirror
- Modelo original en HuggingFace: https://huggingface.co/MagicXin/Med3DVLM-Qwen-2.5-7B
- Repositorio GitHub: https://github.com/mirthAI/Med3DVLM
- Artículo arXiv: https://arxiv.org/html/2503.20047v1
- Modelo base Qwen2.5-7B-Instruct: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Modelo base Qwen2.5-7B en ModelScope: https://www.modelscope.cn/models/qwen/Qwen2.5-7B
