# moyuan10086/aigc-safety-models

## Resumen

El repositorio `moyuan10086/aigc-safety-models` reúne los artefactos de modelos locales utilizados por el sistema de seguridad AIGC (AIGC Safety System) desarrollado por Moyuan. El componente principal es un detector de deepfakes por cara basado en el codificador visual de CLIP ViT-L/14, adaptado mediante ajuste de parámetros eficiente (LayerNorm tuning) con una cabeza binaria LinearNorm. Este detector ha sido entrenado sobre los conjuntos de datos DF40 y DeepFakeFace, y se distribuye como un checkpoint de PyTorch Lightning (epoch 6).

El repositorio también incluye otros modelos auxiliares: un detector de caras YuNet (ONNX) para preprocesamiento, un modelo de embeddings multilingüe (paraphrase-multilingual-MiniLM-L12-v2) para recuperación semántica en un servicio RAG, y un modelo XGBoost de "auditoría shadow" para observación y evaluación. La licencia del repositorio es MIT, aunque se advierte que los términos de los conjuntos de datos y del modelo base CLIP siguen aplicando.

La relevancia actual de este proyecto radica en su enfoque práctico para la seguridad de contenido generado por IA, combinando detección de deepfakes, verificación de caras y moderación, con una arquitectura modular que permite integrar servicios externos como Qwen3Guard o SingGuard. Está orientado a desarrolladores e investigadores que necesitan implementar sistemas de salvaguarda en entornos de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CLIP ViT-L/14 (codificador visual) + adaptación LayerNorm + cabeza binaria LinearNorm |
| Parametros totales | no disponible (checkpoint de 1,1 GB; el tamaño del ViT-L/14 es de ~428M, pero no se especifica el total del modelo adaptado) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no procesa texto) |
| Tipos de cuantizacion | no disponible (solo se distribuye checkpoint .ckpt) |
| Idiomas soportados | no disponible (modelo de visión; el modelo de embeddings multilingüe soporta más de 50 idiomas, pero no se especifican) |
| Licencia | MIT (con restricciones adicionales para el checkpoint del proyecto y los modelos base) |
| Formato de pesos | PyTorch Lightning checkpoint (.ckpt), ONNX (YuNet), safetensors (embeddings), JSON (XGBoost) |

## Arquitectura y entrenamiento

El detector de deepfakes se basa en el codificador visual de CLIP ViT-L/14, un transformer de visión preentrenado que produce representaciones de alta calidad. La adaptación se realiza mediante ajuste de parámetros eficiente (parameter-efficient LayerNorm tuning), lo que implica modificar solo las capas de normalización y añadir una cabeza de clasificación binaria (LinearNorm). Este enfoque reduce el número de parámetros entrenables y el riesgo de sobreajuste, manteniendo la capacidad del modelo base.

El entrenamiento se llevó a cabo sobre los conjuntos de datos DF40 y DeepFakeFace, que contienen muestras reales y falsas de caras generadas por diversos métodos. El checkpoint distribuido corresponde a la época 6 del entrenamiento. No se especifica el número total de tokens ni la composición exacta del dataset, ni si se emplearon técnicas como RLHF o DPO. La innovación principal reside en la combinación de un backbone CLIP con un ajuste ligero, lo que permite una detección eficiente y transferible.

## Capacidades

- Detección de deepfakes por cara: clasifica cada rostro detectado como real o falso, utilizando el backbone CLIP y la cabeza LinearNorm.
- Detección de caras y alineación de cinco puntos: el modelo YuNet integrado localiza caras y puntos de referencia para preprocesar las imágenes.
- Recuperación semántica multilingüe: el modelo de embeddings MiniLM permite búsqueda por similitud en textos de múltiples idiomas (para el servicio RAG del sistema).
- Auditoría shadow: el modelo XGBoost evalúa de forma observacional las decisiones del sistema sin sobrescribir los veredictos de los guardarraíles de producción.
- Integración con servicios externos: el sistema puede llamar a Qwen3Guard y SingGuard a través de una API compatible con OpenAI, ampliando las capacidades de moderación.
- No es un modelo generativo: no produce texto, imágenes ni audio; su función es exclusivamente de análisis y clasificación.

## Casos de uso

- Moderación de contenido en plataformas sociales: el detector puede analizar imágenes o frames de video en tiempo real para identificar caras generadas por IA, ayudando a filtrar contenido manipulado o fraudulento.
- Verificación de identidad en onboarding digital: integrado en sistemas KYC, puede validar si una foto de documento o selfie es auténtica o ha sido generada sintéticamente.
- Auditoría de medios y periodismo: los equipos de fact-checking pueden usar el detector para evaluar la autenticidad de imágenes y videos antes de publicarlos, complementando con análisis forense.
- Investigación académica en detección de deepfakes: el checkpoint y el código de inferencia (en el repositorio del sistema) sirven como punto de partida para experimentos y comparaciones con otros detectores.
- Sistemas de seguridad en videovigilancia: combinado con el detector de caras YuNet, puede señalar posibles suplantaciones en flujos de cámaras, aunque requiere validación humana.
- Pipeline de moderación en aplicaciones de chat con generación de imágenes: el modelo puede ser llamado como un guardarraíl tras la generación de avatares o imágenes de perfil para detectar si son sintéticas, aunque su foco son caras.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo card solo menciona el entrenamiento con DF40 y DeepFakeFace, pero no reporta métricas como precisión, recall o AUC. Tampoco se comparan con otros detectores. Por tanto, no es posible presentar una tabla de rendimiento objetiva.

## Requisitos de hardware

- El checkpoint del detector (1,1 GB) requiere una GPU con al menos 4-6 GB de VRAM para inferencia en FP32, aunque el tamaño exacto del modelo no se especifica. Para una estimación conservadora, se recomienda una GPU con 8 GB o más.
- GPUs adecuadas: una NVIDIA RTX 3060 (12 GB) o superior podría manejar la inferencia; para despliegues concurrentes se sugieren A100 o H100.
- El modelo YuNet es ligero y puede ejecutarse en CPU, aunque en GPU acelera el preprocesamiento.
- El modelo de embeddings MiniLM es pequeño y puede correr en CPU sin problemas.
- El modelo XGBoost es un archivo JSON y se ejecuta en CPU.
- Opciones de despliegue: el código de inferencia está en el repositorio `moyuan10086/aigc-safety-system`; no se mencionan integraciones con vLLM, llama.cpp u Ollama. Dado que es un modelo de visión, se puede servir con frameworks como TorchServe o FastAPI, pero no hay documentación específica.
- La latencia y el throughput no están documentados.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este detector con alternativas concretas. No se han publicado métricas ni se mencionan modelos comparables en la documentación. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- El modelo no es una garantía universal de autenticidad; debe combinarse con revisión humana y evidencia de procedencia, como advierte la propia model card.
- El checkpoint está entrenado específicamente con DF40 y DeepFakeFace; su rendimiento puede degradarse con técnicas de generación no representadas en esos datasets.
- El modelo solo procesa caras; no detecta manipulación en otras regiones de la imagen o en el audio.
- La licencia MIT se aplica al repositorio, pero los términos de los conjuntos de datos (DF40, DeepFakeFace) y del modelo base CLIP pueden imponer restricciones adicionales para redistribución o uso comercial. Se recomienda revisar las licencias ascendentes.
- El modelo XGBoost shadow está diseñado solo para observación; no debe usarse para tomar decisiones de producción.
- El repositorio no incluye los pesos de los modelos de texto o MLLM externos; su disponibilidad depende de los servicios configurados.
- No se proporcionan garantías de seguridad informática; el archivo XGBoost JSON debe tratarse como código potencialmente no confiable y verificarse su integridad (se recomienda comprobar el SHA-256 del checkpoint).
- La ausencia de benchmarks públicos dificulta evaluar su eficacia frente a otros detectores.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/moyuan10086/aigc-safety-models
- Repositorio del sistema (GitHub): https://github.com/moyuan10086/aigc-safety-system
- Perfil del autor en GitHub: https://github.com/moyuan10086
- Taller IJCAI 2026 sobre seguridad AIGC: https://ai-safety-workshop-ijcai2026.github.io/index.html
- Pista 2 del taller (detección audio-video AIGC): https://ai-safety-workshop-ijcai2026.github.io/Track2.html
