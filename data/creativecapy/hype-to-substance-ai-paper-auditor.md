# creativecapy/Hype-to-Substance-AI-Paper-Auditor

## Resumen

El Research Paper Hype-to-Substance Auditor es un modelo de clasificación de texto desarrollado por creativecapy bajo el identificador `creativecapy/Hype-to-Substance-AI-Paper-Auditor`. Su función es evaluar comunicaciones públicas de investigación en IA (anuncios de modelos, model cards y publicaciones de datasets) y clasificarlas según su ratio de "hype" frente a sustancia empírica, es decir, detectar si un texto se apoya en afirmaciones verificables o en vocabulario promocional vacío.

El modelo se presenta como una sonda de control de calidad orientada a equipos de marketing de producto y comunidad en laboratorios de IA, con el objetivo de preservar la credibilidad investigadora antes de publicar en plataformas como Hugging Face, X o Reddit. Está construido sobre una arquitectura BERT y se distribuye mediante la librería transformers con la etiqueta de pipeline `text-classification`.

Es relevante en el contexto actual por la proliferación de anuncios de modelos con lenguaje inflado y la necesidad creciente de herramientas automatizadas que ayuden a distinguir entre resultados medibles y retórica de marketing. No obstante, la información pública disponible es muy limitada: no se especifican parámetros, contexto, idiomas ni datos de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (familia transformer encoder, según tag `bert`) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | no disponible (compatible con transformers; probablemente safetensors o PyTorch bin, sin confirmar) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura BERT, un transformer encoder bidireccional diseñado originalmente para tareas de comprensión del lenguaje y clasificación. La model card no proporciona detalles sobre el número de capas, dimensión oculta, número de cabezas de atención ni el tamaño total del modelo, por lo que no es posible determinar si se trata de una variante base, large o una versión reducida.

Tampoco se especifican los datos de entrenamiento: no se indica el número de tokens, la composición del dataset, si hubo anotación humana, técnicas de aumento de datos, ni procesos de ajuste fino como RLHF o DPO. La model card menciona métricas de `accuracy` y `f1` en los metadatos, pero no publica sus valores ni el conjunto de evaluación empleado. No se documenta ninguna innovación técnica destacable más allá del enfoque de la tarea.

## Capacidades

- Clasificación binaria (o multiclase, no especificado) de texto según su ratio de hype frente a sustancia empírica.
- Detección de vocabulario promocional vacío, como "revolutionary" o "unprecedented".
- Reconocimiento de afirmaciones empíricas verificables, como reducciones porcentuales de pérdida o métricas concretas.
- Etiquetado con categorías del tipo "Marketing Hype (Needs Empirical Evidence)" y "Peer-Review Verified (Low Hype)".
- Integración directa con el pipeline `text-classification` de Hugging Face Transformers.
- Compatibilidad con endpoints de Hugging Face (tag `endpoints_compatible`).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento.
- No se especifican capacidades multilingües; los idiomas soportados figuran como no disponibles.

## Casos de uso

- Auditoría previa a la publicación de model cards: un equipo de marketing puede pasar el borrador de una model card por el clasificador antes de publicarla en Hugging Face, detectando frases promocionales que deberían sustituirse por métricas concretas.
- Revisión de anuncios en redes sociales: antes de publicar un hilo en X o una entrada en Reddit sobre un nuevo modelo, el equipo puede validar que el texto contiene suficiente evidencia empírica y no solo adjetivos grandilocuentes.
- Control de calidad en comunicados de datasets: al anunciar un dataset nuevo, el modelo ayuda a verificar que se describen tamaños, composición y métricas de validación en lugar de limitarse a claims genéricos.
- Formación de equipos de developer marketing: el clasificador puede usarse como herramienta pedagógica para mostrar a redactores qué tipo de lenguaje supera el umbral de credibilidad investigadora.
- Filtrado automatizado en agregadores de noticias de IA: un agregador podría etiquetar automáticamente los anuncios recibidos según su nivel de hype, priorizando aquellos con evidencia empírica para su revisión editorial.
- Pre-publicación en pipelines de CI de documentación: integrado como paso de validación en un pipeline de documentación, el modelo puede bloquear la publicación de textos que no cumplan un umbral mínimo de sustancia.
- Análisis comparativo de comunicaciones de competidores: permite clasificar anuncios de otros laboratorios para estudiar qué proporción de su comunicación se apoya en datos verificables.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card declara métricas de `accuracy` y `f1` en los metadatos, pero no proporciona sus valores, el conjunto de evaluación ni la metodología empleada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible, al desconocerse el tamaño del modelo. Si se trata de una variante BERT base (aproximadamente 110 millones de parámetros), cabría en GPUs de consumo con 4-8 GB de VRAM en fp16 o incluso en CPU.
- GPU recomendadas: no disponible; para un BERT de tamaño base bastaría una RTX 3060 o superior, pero no se confirma el tamaño.
- ¿Cabe en GPU de consumo? Probablemente sí si es una variante BERT base o inferior, pero no está confirmado.
- Opciones de despliegue: pipeline de transformers; compatible con endpoints de Hugging Face. No se documenta soporte explícito para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. La tarea de auditar hype frente a sustancia es nicho y no se han identificado alternativas directas en la información disponible.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Hype-to-Substance-AI-Paper-Auditor | no disponible | no disponible | MIT | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al ser un clasificador entrenado presumiblemente con textos de un dominio concreto, podría penalizar estilos de escritura legítimos o favorecer determinadas convenciones de redacción.
- Riesgo de alucinación: bajo en sentido estricto al ser un clasificador, pero el etiquetado puede ser erróneo o excesivamente confiado (se muestran scores de 0,98 y 0,99 en los ejemplos, lo que sugiere posible sobreconfianza).
- Limitaciones de contexto e idioma: no se especifican; se desconoce si funciona correctamente en castellano o en textos fuera del dominio de anuncios de IA.
- Restricciones de licencia: licencia MIT, que permite uso comercial, modificación y redistribución con atribución y sin garantías.
- Caveats para producción: con 0 descargas y 0 likes, el modelo no tiene validación comunitaria; la fecha de creación (2026-11-11) y la ausencia de métricas publicadas impiden evaluar su fiabilidad. No se recomienda su uso en producción sin una evaluación propia sobre un conjunto de datos representativo.
- La model card incluye emojis y lenguaje promocional, lo que resulta irónico para una herramienta diseñada precisamente para detectar hype.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/creativecapy/Hype-to-Substance-AI-Paper-Auditor
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información disponible.
