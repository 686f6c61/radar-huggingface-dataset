# Ambarella/TinyCLIP

## Resumen

TinyCLIP es una familia de modelos visión-lenguaje compactos que comprimen la arquitectura CLIP mediante destilación de conocimiento, con el objetivo de reducir de forma drástica los requisitos de cómputo y memoria manteniendo un rendimiento razonable en tareas de representación imagen-texto. El modelo original fue propuesto por Wu et al. en el artículo "TinyCLIP: CLIP Distillation via Affinity Mimicking and Weight Inheritance" (2023), y esta ficha concreta corresponde a la variante TinyCLIP-ViT8M16 publicada por Ambarella, que empaqueta los codificadores de imagen y texto en formatos binarios optimizados para sus aceleradores N1-655, X7, CV7, CV72 y CV75.

La relevancia de esta publicación no reside en un nuevo entrenamiento, sino en el despliegue en hardware de borde: Ambarella distribuye los pesos convertidos y cuantizados (act16) para sus SoC de visión, lo que permite ejecutar búsqueda multimodal y clasificación zero-shot directamente en dispositivos con recursos limitados. El repositorio tiene un tamaño de 0,1 GB y se distribuye bajo la librería PyTorch, aunque los ficheros principales son binarios propietarios para el SDK Cooper.

Se trata, por tanto, de un modelo de embeddings imagen-texto (no generativo) orientado a inferencia en el borde, no de un modelo de lenguaje. Su utilidad principal es la recuperación y clasificación multimodal en entornos embebidos, y su interés para desarrolladores depende de si trabajan con el ecosistema Cooper de Ambarella.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CLIP (dos torres: ViT para imagen y transformer de texto), destilado |
| Parametros totales | no disponible (variante ViT8M16, aproximadamente 8M en el codificador de imagen segun la nomenclatura) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de embeddings, no generativo) |
| Tipos de cuantizacion | pesos binarios con activaciones de 16 bits (act16) para el SDK Cooper |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | binarios propietarios para N1-655, X7, CV7, CV72 y CV75; pesos originales en .pt (PyTorch) enlazados externamente |
| Resolucion de entrada | 3x224x224 |
| Version de SDK | Cooper SDK 2.5.4 / Cooper Foundry 2.3 |

## Arquitectura y entrenamiento

TinyCLIP sigue el esquema de dos torres de CLIP: un codificador de imagen basado en Vision Transformer (ViT) y un codificador de texto basado en transformer. La variante ViT8M16 indica un ViT de aproximadamente 8 millones de parámetros con parche de 16x16, y el codificador de texto se corresponde con la variante "Text-3M" del checkpoint original (TinyCLIP-ViT-8M-16-Text-3M-YFCC15M). El entrenamiento se realizó mediante destilación de conocimiento desde un CLIP de mayor tamaño, empleando dos técnicas descritas en el artículo: imitación de afinidad (affinity mimicking), que transfiere las similitudes entre pares imagen-texto del profesor al alumno, y herencia de pesos (weight inheritance), que inicializa el modelo pequeño a partir de subredes del profesor.

El checkpoint original fue entrenado sobre el conjunto YFCC15M, según se desprende del nombre del fichero de pesos enlazado. Ambarella no documenta en la model card el proceso de conversión ni los detalles de cuantización más allá de la etiqueta act16, ni indica si se aplicó algún ajuste posterior. No se dispone de información sobre número de tokens de entrenamiento, composición exacta del dataset ni uso de RLHF/DPO (no aplicable en un modelo de embeddings).

## Capacidades

- Generación de embeddings conjuntos imagen-texto en un espacio compartido, base para tareas de recuperación y comparación.
- Clasificación zero-shot de imágenes mediante prompts de texto.
- Búsqueda y recuperación multimodal (image-to-text y text-to-image).
- Similitud semántica entre imágenes y descripciones textuales.
- Extracción de características visuales para pipelines downstream (detección, agrupamiento, filtrado).
- Inferencia en hardware de borde Ambarella (N1-655, X7, CV7, CV72, CV75) mediante el SDK Cooper.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: no es un modelo generativo.
- Capacidades multilingües: no disponibles (no documentadas).

## Casos de uso

- Búsqueda visual en dispositivos de borde: indexar imágenes capturadas por cámaras Ambarella y recuperarlas mediante consultas de texto, aprovechando los binarios optimizados para los SoC CV7/CV72/CV75 y evitando el envío de datos a la nube.
- Clasificación zero-shot en cámaras inteligentes: definir categorías mediante prompts de texto sin reentrenar, útil para segmentación de escenas o filtrado de eventos en el propio dispositivo.
- Moderación y filtrado de contenido visual: comparar imágenes contra descripciones textuales de contenido no deseado en tiempo real, con bajo consumo energético gracias al reducido tamaño del modelo.
- Organización automática de galerías y archivos multimedia: agrupar imágenes por similitud semántica usando los embeddings del codificador de imagen en aplicaciones de gestión de fotos.
- Etiquetado automático de datasets: generar descripciones candidatas para imágenes mediante búsqueda en un banco de textos predefinido, acelerando la anotación previa a entrenamientos supervisados.
- Recuperación multimodal en asistentes de accesibilidad: permitir consultas textuales sobre el entorno captado por la cámara, con latencia baja al ejecutarse localmente en el dispositivo.
- Integración en pipelines de visión industrial: usar los embeddings como característica compacta para tareas de inspección o control de calidad en entornos con conectividad limitada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de zero-shot, recuperación ni latencia para esta conversión concreta.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el modelo está pensado para acceleradores Ambarella, no para GPU de propósito general.
- GPU recomendadas: no aplica para los binarios publicados; los pesos originales en PyTorch podrían ejecutarse en cualquier GPU, pero no se documentan requisitos.
- Cabe en GPU de consumo: probablemente sí dado el tamaño reducido (repo de 0,1 GB y ViT de ~8M de parámetros), pero no hay datos oficiales.
- Opciones de despliegue: SDK Cooper (2.5.4) y Cooper Foundry (2.3) sobre N1-655, X7, CV7, CV72 y CV75; para los pesos originales, el repositorio oficial de Microsoft (Cream/TinyCLIP) y el model zoo de wkcn.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros (imagen) | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| TinyCLIP-ViT8M16 (esta ficha) | ~8M (ViT8M16) | no aplica | no disponible | Hugging Face (Ambarella) + binarios Cooper |
| CLIP ViT-B/32 (OpenAI) | ~88M (imagen) | no aplica | MIT (pesos originales) | Abierto |
| MobileCLIP (Apple) | ~11M–150M segun variante | no aplica | no disponible en esta ficha | Abierto |
| SigLIP (Google) | desde ~90M | no aplica | Apache 2.0 (segun variante) | Abierto |

La comparación es aproximada: TinyCLIP se posiciona por debajo de CLIP ViT-B/32 en tamaño y por encima de las variantes más pequeñas de MobileCLIP en algunos casos, pero no se dispone de métricas de rendimiento para esta conversión concreta que permitan una comparación cuantitativa fiable.

## Limitaciones y advertencias

- Modelo de embeddings, no generativo: no produce texto libre ni mantiene conversaciones.
- Sesgos: al derivar de CLIP entrenado sobre YFCC15M, hereda los sesgos sociales y culturales de ese corpus; no se documenta mitigación específica.
- Riesgo de alucinación: no aplica en el sentido generativo, pero las similitudes pueden producir recuperaciones irrelevantes en dominios alejados del entrenamiento.
- Idiomas: no se especifican los idiomas soportados por el codificador de texto.
- Licencia no disponible: la model card no indica términos de uso, lo que impide confirmar si se permite uso comercial de los binarios o de los pesos originales.
- Dependencia de hardware: los binarios publicados solo son ejecutables en SoC Ambarella con el SDK Cooper; no son portables a GPU estándar.
- Documentación escasa: no hay métricas, detalles de cuantización ni instrucciones de uso más allá de la tabla de enlaces.
- Fecha de creación futura en los metadatos (2026): conviene verificar la vigencia del repositorio antes de integrarlo en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Ambarella/TinyCLIP
- Artículo original: https://arxiv.org/abs/2309.12314
- Código oficial TinyCLIP (Microsoft Cream): https://github.com/microsoft/Cream/tree/main/TinyCLIP
- Pesos originales TinyCLIP-ViT8M16: https://github.com/wkcn/TinyCLIP-model-zoo/releases/download/checkpoints/TinyCLIP-ViT-8M-16-Text-3M-YFCC15M.pt
- Model zoo de TinyCLIP: https://github.com/wkcn/TinyCLIP-model-zoo
