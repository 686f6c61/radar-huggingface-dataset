# Nanotoki/DDRMate-manga-recommender

## Resumen

DDRMate es un sistema de recomendación adaptativo de manga publicado por el usuario Nanotoki en Hugging Face. No se trata de un modelo de lenguaje generativo, sino de un motor de recomendación que combina relaciones explícitas de metadatos del catálogo (etiquetas, artistas, colaboraciones entre artistas y relaciones de parodia, personaje y grupo) con un mecanismo de adaptación en línea específico por usuario. El paquete público pesa 1,8 GB e incluye los artefactos necesarios para ejecutar una demo en Gradio sobre un entorno de CPU de Google Colab.

La propuesta diferencial es la separación entre el bundle público del modelo (independiente del usuario) y el historial de recomendación personal, que se almacena en el Google Drive de cada persona que ejecuta el cuaderno. El sistema aprende pesos no negativos por canal con contracción hacia una distribución previa (*prior shrinkage*), incorpora una perturbación de exploración consciente de la incertidumbre (*uncertainty-aware exploration jitter*) y aplica un residual de artista restringido a interacciones de tipo READ_RATED, todo ello con un pipeline de reordenación (*reranking*) disperso optimizado para CPU.

Es relevante ahora porque demuestra un patrón de despliegue de recomendadores sin GPU, con inferencia en CPU y privacidad por diseño al no centralizar el historial de usuario. La información disponible no especifica arquitectura de red neuronal ni tamaño de parámetros, por lo que la ficha se limita a los componentes descritos en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sistema de recomendación híbrido basado en relaciones de metadatos y pesos de canal aprendidos; no se especifica red neuronal |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de contexto de tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | other (requiere verificar condiciones de uso comercial y redistribución) |
| Formato de pesos | no disponible; el repositorio incluye el bundle público y un cuaderno Jupyter (`DDRMate_public_demo_cpu_colab.ipynb`) |
| Tamano del repositorio | 1,8 GB |
| Tags | recommender-system, adaptive-recommendation, gradio, manga |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-10-09 |
| Ultima actualizacion | 2026-11-14 |

## Arquitectura y entrenamiento

La model card describe un recomendador que combina señales de metadatos explícitos con adaptación en línea por usuario. Los canales de señal incluyen etiquetas (*tags*), artistas, colaboraciones entre artistas y relaciones de parodia, personaje y grupo. Sobre esos canales se aprenden pesos no negativos con contracción hacia un prior (*prior shrinkage*), lo que actúa como regularización y evita sobreajuste a interacciones escasas. Se añade una perturbación de exploración (*jitter*) consciente de la incertidumbre, orientada a balancear explotación y exploración, y un residual de artista que solo se activa con interacciones de tipo READ_RATED. La reordenación final es dispersa y está optimizada para CPU.

No se especifica en la información disponible el volumen de datos de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF o DPO (no aplicables a este tipo de sistema). Tampoco se detalla la arquitectura interna (matricial, grafo, factorización o red neuronal). El diseño está pensado explícitamente para ejecutarse en un runtime de CPU de Google Colab, sin requisito de GPU.

## Capacidades

- Recomendación adaptativa de manga basada en metadatos del catálogo (etiquetas, artistas, colaboraciones, parodia, personaje y grupo).
- Aprendizaje en línea por usuario: los pesos de canal se ajustan a partir del historial personal almacenado en el Drive del ejecutor.
- Exploración consciente de la incertidumbre mediante *jitter* calibrado.
- Residual de artista restringido a interacciones READ_RATED.
- Reordenación dispersa optimizada para CPU.
- Interfaz de demo en Gradio lanzada desde un cuaderno de Colab.
- Separación entre bundle público (independiente del usuario) e historial privado (en Drive del usuario).
- No se documentan capacidades de generación de texto, código, matemáticas, visión, audio, tool calling ni razonamiento multi-paso; no es un modelo de lenguaje.

## Casos de uso

- Demo educativa de recomendadores en Colab: el cuaderno `DDRMate_public_demo_cpu_colab.ipynb` permite lanzar una interfaz Gradio en CPU sin GPU, útil para talleres y prototipos rápidos.
- Recomendación personal de manga en local: un usuario puede ejecutar el cuaderno, montar su Drive y obtener recomendaciones adaptadas a su historial sin enviar datos a un servidor externo.
- Investigación sobre adaptación en línea: el esquema de pesos no negativos con *prior shrinkage* y *jitter* de exploración sirve como referencia para estudiar balance exploración-explotación en recomendadores de nicho.
- Prototipado de sistemas de recomendación con privacidad por diseño: el patrón de bundle público más historial en Drive del usuario es replicable en otros dominios donde no se quiere centralizar datos personales.
- Integración en pipelines de catalogación de manga: las relaciones de artista, colaboración, parodia y grupo pueden aprovecharse para enriquecer metadatos y generar listas relacionadas.
- Evaluación de reordenación dispersa en CPU: el componente de *reranking* disperso permite medir latencia y throughput en entornos sin acelerador.
- Base para extensiones a otros dominios de contenido (anime, cómics, libros) reutilizando el esquema de canales y pesos adaptativos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Inferencia en CPU: soportada explícitamente; no se requiere GPU.
- VRAM estimada: no aplica (ejecución en CPU); no disponible para variantes con acelerador.
- GPU recomendadas: no disponible; el autor indica que no es necesaria GPU.
- Compatibilidad con GPU de consumo: no documentada; el diseño apunta a CPU.
- Opciones de despliegue: Google Colab con runtime de CPU y Gradio; no se documentan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de sistema).
- Latencia y throughput: no disponibles.
- Almacenamiento: el repositorio ocupa 1,8 GB; el perfil de usuario se guarda comprimido en `MyDrive/DDRMate/profiles/default.json.gz`.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Se indica "no disponible".

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DDRMate | no disponible | no aplica | no disponible | other | Hugging Face (0 descargas) |
| Alternativa 1 | no disponible | no disponible | no disponible | no disponible | no disponible |
| Alternativa 2 | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- La licencia es "other": es imprescindible verificar de forma independiente los requisitos de redistribución y uso comercial de los metadatos del catálogo derivados de la fuente original.
- No se documentan sesgos conocidos; al depender de metadatos de catálogo, puede heredar sesgos de popularidad y de etiquetado de la fuente.
- Riesgo de recomendaciones pobres en usuarios con historial escaso o nulo, dado el componente de adaptación en línea.
- El historial de usuario se guarda en el Drive del ejecutor; la privacidad depende de la configuración de la cuenta de Google del usuario.
- El bundle público no contiene historial de usuario, por lo que no es posible evaluar la calidad de recomendaciones personalizadas sin ejecutar la demo con un perfil propio.
- No hay métricas de rendimiento publicadas (precisión, recall, NDCG), lo que dificulta comparar su calidad frente a alternativas.
- El repositorio registra 0 descargas y 0 likes, lo que sugiere ausencia de validación por parte de la comunidad.
- No se especifican idiomas soportados; la cobertura lingüística del catálogo de manga no está documentada.
- No es un modelo de lenguaje: no debe evaluarse con benchmarks de MMLU, HumanEval o GSM8K.

## Enlaces

- Hugging Face: https://huggingface.co/Nanotoki/DDRMate-manga-recommender
- Cuaderno de demo: `DDRMate_public_demo_cpu_colab.ipynb` (incluido en el repositorio de Hugging Face)
- Ruta de perfil de usuario: `MyDrive/DDRMate/profiles/default.json.gz` (en el Drive del ejecutor)
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la información disponible.
