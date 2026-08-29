# Faysal1000/mome-banglafake

## Resumen

MoME-BanglaFake es un modelo multimodal de detección de desinformación en bengalí, desarrollado por Faysal Ahmmed (usuario Faysal1000). Combina un modelo base de lenguaje (google/gemma-4-E2B) con adaptadores de tipo LoRA/DoRA y componentes de visión (SigLIP2 para imágenes y VideoMAE para vídeo), formando una arquitectura de mezcla de expertos (MoME). El modelo está diseñado para clasificar contenido textual, visual y audiovisual como noticia real o falsa, y también para distinguir entre categorías más finas como desinformación, sátira y clickbait.

La relevancia de este modelo radica en abordar la detección de noticias falsas en bengalí, un idioma con escasos recursos y alta prevalencia de desinformación en plataformas digitales. Al ser trimodal, integra señales de texto, imagen y vídeo, lo que permite una detección más robusta que los sistemas unimodales. El modelo se distribuye como un adaptador PEFT (6,2 GB) sobre el modelo base, con acceso restringido en HuggingFace. Los resultados oficiales reportan una precisión del 91,48 % en clasificación binaria y del 83,25 % en clasificación multiclase sobre el dataset BTMD.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con mezcla de expertos (MoME) sobre base google/gemma-4-E2B, con adaptadores LoRA/DoRA y encoders de visión (SigLIP2, VideoMAE) |
| Parametros totales | no disponible (el adaptador pesa 6,2 GB; el modelo base no se especifica) |
| Parametros activos | no disponible (arquitectura MoE, pero sin desglose) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (formato safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | bengali (bn) |
| Licencia | other (no especificada; requiere aceptar condiciones de acceso) |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

La arquitectura combina un modelo de lenguaje base (google/gemma-4-E2B) con adaptadores de bajo rango (LoRA/DoRA) y módulos de visión: SigLIP2 para el procesamiento de imágenes y VideoMAE para secuencias de vídeo. El conjunto se organiza como una mezcla de expertos (MoME), lo que sugiere que diferentes expertos se especializan en distintas modalidades o tipos de contenido. No se han publicado detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset ni el uso de técnicas como RLHF o DPO. El entrenamiento se realizó sobre el dataset BTMD (Bengali Trimodal Misinformation Dataset), con validación mediante 5-fold cross-validation.

## Capacidades

- Detección binaria de noticias falsas (real vs. falso) en contenido textual, imágenes y vídeos en bengalí.
- Clasificación multiclase de desinformación: real, desinformación, sátira y clickbait.
- Procesamiento trimodal: integra texto, imagen y vídeo en una única pasada de inferencia.
- Adaptación eficiente mediante LoRA/DoRA, lo que permite fine-tuning con recursos limitados.
- Soporte para clasificación de texto (pipeline text-classification) y, por extensión, de imagen y vídeo gracias a los encoders de visión.
- Capacidad multilingüe limitada al bengalí; no se reportan otros idiomas.

## Casos de uso

- Moderación de contenido en redes sociales: el modelo puede analizar publicaciones que combinan texto, imágenes y vídeos para detectar noticias falsas o desinformación en bengalí, ayudando a plataformas a priorizar la revisión humana.
- Verificación de noticias en medios digitales: agencias de fact-checking pueden usar el modelo para preclasificar artículos y contenido multimedia antes de una verificación manual, reduciendo el tiempo de respuesta.
- Monitorización de campañas de desinformación: organizaciones de investigación pueden analizar grandes volúmenes de contenido bengalí en busca de patrones de propaganda, sátira o clickbait.
- Detección de deepfakes visuales y de vídeo: gracias a los encoders SigLIP2 y VideoMAE, el modelo puede identificar manipulaciones en imágenes y secuencias de vídeo, complementando la detección de audio deepfake (como el proyecto BanglaFake).
- Análisis de redes sociales para estudios académicos: investigadores en ciencias sociales pueden utilizar el modelo para etiquetar corpus de contenido bengalí con fines de análisis de tendencias y difusión de información.
- Sistemas de alerta temprana en salud pública: durante crisis sanitarias, el modelo puede detectar bulos sobre tratamientos o vacunas en contenido multimodal bengalí, permitiendo respuestas rápidas.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el dataset BTMD (Bengali Trimodal Misinformation Dataset), validación con 5-fold cross-validation:

| Tarea | Accuracy | F1 Macro | AUC-ROC | MCC |
|---|---|---|---|---|
| Binaria (Real vs. Fake) | 91,48 % | 91,48 % | 0,9682 | 0,8298 |
| Multiclase (Real, Misinformation, Satire, Clickbait) | 83,25 % | 79,01 % | 0,9517 (OvR Macro) | 0,7405 |

No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- No se dispone de datos oficiales sobre VRAM, GPUs recomendadas o latencia.
- El adaptador PEFT pesa 6,2 GB, por lo que se estima que la inferencia puede ejecutarse en GPUs con al menos 8-12 GB de VRAM si se carga el modelo base en cuantización ligera, pero esto no está confirmado.
- Al ser un adaptador sobre un modelo base de Google (gemma-4-E2B), se requiere descargar el modelo base por separado, lo que incrementa los requisitos de almacenamiento y memoria.
- Opciones de despliegue: al usar PEFT, es compatible con librerías como HuggingFace Transformers y PEFT, y potencialmente con vLLM o TGI si se integra el adaptador, aunque no hay documentación al respecto.
- No se reportan mediciones de throughput ni latencia.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (detección de desinformación multimodal en bengalí). El proyecto BanglaFake (detección de audio deepfake en bengalí) es complementario pero no directamente comparable, ya que se centra en audio y no en texto/imagen/vídeo. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Acceso restringido (gated): requiere aceptar condiciones en HuggingFace, lo que puede limitar su uso en entornos corporativos o de investigación sin aprobación.
- Licencia "other" no especificada: no se detallan los términos de uso comercial, modificación o redistribución. Se recomienda contactar al autor antes de usar en producción.
- Idioma limitado: solo bengalí; no es aplicable a otros idiomas sin reentrenamiento.
- Riesgo de alucinación y sesgos: al ser un modelo de clasificación, puede presentar falsos positivos/negativos, especialmente en contenido ambiguo o con matices culturales.
- Dependencia del dataset BTMD: el rendimiento está ligado a la distribución de este dataset; puede degradarse en dominios no representados.
- Sin información sobre robustez ante ataques adversariales o manipulación deliberada de contenido.
- El modelo base (google/gemma-4-E2B) no es un modelo público conocido; se recomienda verificar su disponibilidad y licencia antes de su uso.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Faysal1000/mome-banglafake
- Dataset BTMD: https://huggingface.co/datasets/Faysal4200/BTMD
- Proyecto BanglaFake (detección de audio deepfake en bengalí): https://kamruzzamanasif.github.io/BanglaFake/
- Paper de BanglaFake: https://arxiv.org/abs/2505.10885
- Perfil de GitHub del autor: https://github.com/Faysal1000
