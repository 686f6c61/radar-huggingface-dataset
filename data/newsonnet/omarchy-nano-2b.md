# NewSonnet/omarchy-nano-2b

## Resumen

Omarchy Nano 2B es un ajuste fino experimental del modelo base Qwen3.5-2B-Base, desarrollado por NewSonnet, orientado a responder preguntas sobre la distribución Linux Omarchy: configuración, comandos, aplicaciones y flujos de trabajo. No es un proyecto oficial de Omarchy, sino una iniciativa independiente para crear un asistente especializado en ese sistema operativo.

El modelo se entrenó con QLoRA de 4 bits sobre un conjunto de datos reducido (296 ejemplos extraídos de 51 archivos Markdown del manual de Omarchy), con solo un 0,49 % de parámetros entrenables. Está disponible en formato safetensors (para Transformers con PEFT) y en GGUF cuantizado Q4_K_M para inferencia local con llama.cpp. Su tamaño compacto (aproximadamente 1,25 GB en GGUF) lo hace apto para equipos con recursos limitados.

La relevancia de este modelo radica en su especialización de dominio: mientras que los modelos generales de 2B ofrecen respuestas amplias pero poco profundas, Omarchy Nano 2B intenta proporcionar información concreta y contextualizada sobre una distribución Linux específica, aunque con las limitaciones propias de un dataset de entrenamiento muy pequeño.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basada en Qwen3.5-2B-Base) |
| Parametros totales | 1.942.653.248 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (máximo de entrenamiento) |
| Tipos de cuantizacion | Q4_K_M (GGUF), F16 (proyector multimodal) |
| Idiomas soportados | Inglés (único idioma declarado) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura de Qwen3.5-2B-Base, un transformer de 2.000 millones de parámetros aproximadamente (1,94 B según los pesos publicados). El ajuste fino se realizó mediante QLoRA de 4 bits con rango LoRA de 16, lo que supuso entrenar únicamente 10.911.744 parámetros (0,49 % del total). El entrenamiento se ejecutó en una GPU Tesla T4 de Google Colab durante 2 épocas, con una longitud máxima de secuencia de 512 tokens, tamaño de lote efectivo de 8, tasa de aprendizaje de 2e-4 y optimizador AdamW de 8 bits.

El dataset de entrenamiento se construyó a partir de 51 archivos Markdown no vacíos del manual de Omarchy, con una división a nivel de documento: 259 ejemplos para entrenamiento y 37 para evaluación. Las referencias a imágenes se sustituyeron por el marcador `[image omitted]`, por lo que el entrenamiento fue exclusivamente textual. Las pérdidas finales fueron 1,6297 (entrenamiento) y 1,6660 (evaluación), que son métricas de optimización, no de precisión en tareas.

## Capacidades

- Generación de texto conversacional centrado en Omarchy: responde preguntas sobre configuración del sistema, comandos de terminal, aplicaciones disponibles y flujos de trabajo típicos de la distribución.
- Asistencia técnica especializada: puede explicar cómo realizar tareas administrativas o de personalización dentro del ecosistema Omarchy.
- Inferencia local ligera: el formato GGUF Q4_K_M permite ejecutarlo en equipos de bajos recursos, incluidos portátiles sin GPU dedicada.
- Compatibilidad con llama.cpp: se puede usar con `llama-cli` u otros runners compatibles para conversación interactiva.
- Integración con Transformers/PEFT: el adaptador LoRA puede cargarse sobre el modelo base Qwen3.5-2B-Base en un flujo de trabajo estándar de Hugging Face.
- Proyector multimodal incluido (F16-mmproj): aunque el modelo no fue entrenado con imágenes, se proporciona un proyector opcional para runners que acepten entrada visual; su utilidad real no está validada.

## Casos de uso

- Asistente de configuración inicial de Omarchy: el modelo puede guiar al usuario paso a paso en la instalación y primera configuración de la distribución, explicando opciones de particionado, gestores de arranque y paquetes esenciales.
- Documentación interactiva para administradores de sistemas: en lugar de consultar manuales estáticos, un administrador puede preguntar al modelo cómo modificar archivos de configuración específicos, gestionar servicios systemd o resolver errores comunes.
- Soporte técnico en entornos de desarrollo: desarrolladores que trabajan con Omarchy como sistema base pueden obtener respuestas rápidas sobre cómo instalar herramientas de desarrollo, configurar contenedores o integrar agentes de IA.
- Chatbot de ayuda integrado en una instalación de Omarchy: el modelo puede desplegarse localmente como un servicio de chat que responda preguntas frecuentes sobre la distribución sin necesidad de conexión a internet.
- Generación de scripts de automatización: dado su conocimiento del manual, puede sugerir comandos o secuencias de comandos para tareas repetitivas como actualizaciones, copias de seguridad o gestión de paquetes.
- Formación y aprendizaje: usuarios nuevos en Omarchy pueden interactuar con el modelo para comprender la filosofía de la distribución, sus diferencias con otras basadas en Arch y sus herramientas específicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta métricas de optimización (pérdida de entrenamiento 1,6297 y pérdida de evaluación 1,6660), que no constituyen una medida de rendimiento en tareas de lenguaje natural. No hay datos de MMLU, HumanEval, GSM8K ni otros benchmarks estándar.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo GGUF Q4_K_M pesa aproximadamente 1,25 GB, por lo que cabe en GPUs con 2 GB de VRAM o más. En CPU, puede ejecutarse con 4 GB de RAM libre.
- GPU recomendadas: cualquier GPU con soporte CUDA de 2 GB o superior (GTX 1650, RTX 2060, RTX 3060, etc.). También funciona en Apple Silicon mediante Metal.
- Compatibilidad con consumer GPU: sí, es uno de los puntos fuertes del modelo; está diseñado para equipos de gama baja o "potato PCs".
- Opciones de despliegue: llama.cpp (recomendado), Ollama (si se convierte el GGUF), Transformers con PEFT para el adaptador LoRA, y cualquier runner compatible con GGUF.
- Latencia y throughput estimados: no disponibles. Dado el tamaño reducido, en una GPU moderna se esperan velocidades de decodificación superiores a 50 tokens/s, pero no hay mediciones oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Omarchy Nano 2B | 1,94 B | 512 | Apache-2.0 | Especializado en Omarchy |
| Qwen2.5-1.5B | 1,54 B | 32K | Apache-2.0 | Generalista |
| Llama-3.2-1B | 1,23 B | 128K | Llama 3.2 | Generalista |
| Gemma-2-2B | 2,61 B | 8K | Gemma | Generalista |

La comparación es orientativa: Omarchy Nano 2B es un ajuste fino de dominio, no un modelo generalista. Su ventaja es la especialización en Omarchy, pero su contexto de 512 tokens es muy limitado frente a los 32K o 128K de los modelos generales. Para tareas generales, los modelos base de tamaño similar ofrecerán mejor rendimiento; para consultas específicas de Omarchy, este modelo puede ser más preciso, aunque su dataset de entrenamiento es extremadamente pequeño.

## Limitaciones y advertencias

- Dataset de entrenamiento muy reducido (296 ejemplos), lo que limita la cobertura de temas y aumenta el riesgo de respuestas incompletas o incorrectas.
- Riesgo de alucinación: el propio autor advierte que el modelo puede proporcionar comandos incorrectos, omitir contexto importante o inventar detalles de configuración.
- Longitud de contexto limitada a 512 tokens, insuficiente para conversaciones largas o para procesar documentación extensa.
- Solo soporta inglés; no hay capacidades multilingües declaradas.
- El proyector multimodal incluido no implica capacidad real de comprensión de imágenes, ya que el entrenamiento fue exclusivamente textual.
- Modelo experimental sin garantías de producción: no debe usarse para cambios sensibles de sistema o seguridad sin verificar las respuestas contra la documentación oficial de Omarchy.
- La licencia Apache-2.0 permite uso comercial, pero hay que cumplir también con la licencia MIT del material fuente de Omarchy y conservar las atribuciones correspondientes.
- El modelo base Qwen3.5-2B-Base no es un modelo ampliamente conocido o verificado; su existencia y características dependen de la información proporcionada por el autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/NewSonnet/omarchy-nano-2b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B-Base
- Repositorio de reproducibilidad: https://github.com/EF-Code/omarchy-nano
- Sitio oficial de Omarchy: https://omarchy.org/
- Fuente de Omarchy en GitHub: https://github.com/omacom/omarchy
- Artículo sobre Omarchy: https://tbreak.com/omarchy-linux-distro-agentic-ai/
- Proyecto Omarchy AI: https://github.com/mitkox/omarchy-ai
