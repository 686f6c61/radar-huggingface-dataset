# Aswenna/PotatoDiseaseVision

## Resumen

Aswenna/PotatoDiseaseVision es un modelo de visión por computador basado en Vision Transformer (ViT) desarrollado por el usuario Aswenna, orientado a la clasificación de enfermedades en plantas de patata a partir de imágenes de hojas. Con 85,8 millones de parámetros, se sitúa en la gama de los ViT de tamaño medio, adecuado para tareas de clasificación de imágenes en entornos agrícolas.

El modelo se publica en Hugging Face con formato de pesos safetensors y un tamaño de repositorio de 0,7 GB, lo que sugiere que puede desplegarse en hardware moderado. No se dispone de información pública sobre su licencia, idiomas soportados ni pipeline de uso, lo que limita su adopción inmediata en producción sin consultar al autor.

Su relevancia radica en la creciente demanda de herramientas de diagnóstico fitosanitario basadas en IA, aunque la escasez de documentación técnica y benchmarks publicados dificulta evaluar su rendimiento real frente a alternativas establecidas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT) |
| Parametros totales | 85.800.963 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre el proceso de entrenamiento, el dataset utilizado ni las técnicas de optimización aplicadas. Por el tag "vit" y el nombre del modelo, se asume una arquitectura Vision Transformer estándar, que procesa imágenes dividiéndolas en parches y aplicando capas de atención. No hay datos sobre el número de tokens de entrenamiento, composición del dataset o si se emplearon técnicas como fine-tuning sobre un modelo preentrenado.

## Capacidades

- Clasificación de imágenes de hojas de patata para detectar enfermedades.
- Inferencia sobre imágenes individuales, presumiblemente con salida de etiquetas de clase.
- No se han documentado capacidades adicionales como detección de objetos, segmentación o generación de texto.

## Casos de uso

- Diagnóstico de enfermedades en cultivos de patata: el modelo puede clasificar imágenes de hojas enviadas por agricultores o técnicos para identificar posibles patologías, facilitando una respuesta temprana.
- Integración en aplicaciones móviles de asistencia agrícola: al ser un modelo compacto (85,8M parámetros), puede ejecutarse en dispositivos con recursos limitados o en servidores ligeros, permitiendo su uso en campo.
- Sistemas de monitorización de cultivos: combinado con cámaras o drones, puede analizar imágenes periódicas para detectar brotes de enfermedades y alertar a los responsables.
- Herramientas educativas: servir como ejemplo práctico de aplicación de ViT en agricultura para cursos de visión por computador.
- Investigación en fitopatología: como base para comparar enfoques de clasificación de enfermedades vegetales.
- Prototipos de agricultura de precisión: integrarse en pipelines de decisión que recomienden tratamientos según el tipo de enfermedad detectada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: para un modelo de 85,8M parámetros en precisión FP32, se requieren aproximadamente 343 MB de memoria para los pesos (85,8M × 4 bytes). Con overhead de inferencia, se estima un consumo de 1-2 GB en total, por lo que es ejecutable en GPUs con 4 GB o más.
- GPU recomendadas: cualquier GPU moderna con al menos 4 GB de VRAM (GTX 1650, RTX 3050, etc.) es suficiente. Para inferencia en CPU, también es viable con 8-16 GB de RAM.
- Opciones de despliegue: al ser safetensors, puede cargarse con Hugging Face Transformers o con librerías como ONNX Runtime si se convierte. No se mencionan formatos GGUF ni compatibilidad con llama.cpp.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables específicos para detección de enfermedades de patata con ViT. Alternativas genéricas como ViT-Base (86M parámetros) o ResNet-50 (25M) podrían usarse como referencia, pero no hay datos de rendimiento de este modelo para establecer una comparación objetiva.

## Limitaciones y advertencias

- No se ha publicado información sobre sesgos, precisión o errores del modelo.
- Al no especificarse la licencia, no se puede garantizar su uso comercial sin autorización del autor.
- La ausencia de documentación sobre el dataset de entrenamiento impide conocer la distribución de clases y posibles desequilibrios.
- No hay evidencia de soporte para otros idiomas ni para tareas fuera de la clasificación de enfermedades de patata.
- El modelo podría tener un rendimiento limitado en imágenes de campo reales si el entrenamiento se realizó con datos controlados.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Aswenna/PotatoDiseaseVision)
- [Perfil del autor en Hugging Face](https://huggingface.co/Aswenna)
