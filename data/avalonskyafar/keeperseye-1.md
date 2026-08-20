# AvalonskyAfar/KeepersEye-1

## Resumen

KeepersEye-1 es un modelo de clasificación multimodal desarrollado por AvalonskyAfar, diseñado específicamente para identificar contenido de promoción comercial relacionado con la salud en vídeos cortos en chino. No es un modelo de lenguaje de propósito general ni un transformador compatible con Hugging Face Transformers, sino un pipeline personalizado de múltiples etapas optimizado para inferencia local y móvil, integrado en la aplicación Gravekeeper.

El sistema combina cuatro tipos de señales: un modelo visual basado en MobileNetV3-Small que procesa fotogramas RGB, un clasificador de texto int8 que analiza texto OCR extraído, características de reglas que capturan señales como precios o carritos de compra, y un modelo de fusión de regresión logística que combina todas las señales en una probabilidad final. La versión actual se identifica como `day43-fusion-only-frozen-visual-v1`, donde el backbone visual permanece congelado y solo se reentrenó la capa de fusión.

El modelo está pensado para un caso de uso muy concreto: detectar promociones de salud dirigidas a personas mayores en vídeos cortos chinos, con especial atención a la inferencia en dispositivos móviles Android mediante un runtime LiteRT exportado por separado. Su relevancia radica en su enfoque práctico de bajo coste computacional para moderación de contenido en tiempo real, aunque su ámbito de aplicación es limitado y no generalizable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline multi-etapa: MobileNetV3-Small (vision) + HashingVectorizer con 3 LogisticRegression (texto) + StandardScaler y LogisticRegression (fusion) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada visual fija 1x3x416x192; texto OCR con ngramas 1-4) |
| Tipos de cuantizacion | int8 (clasificador de texto: `text_classifier_int8.bin`, 786.510 bytes) |
| Idiomas soportados | chino (zh) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (checkpoint visual), binario int8 (texto), JSON schema (fusion) |

## Arquitectura y entrenamiento

El pipeline se compone de tres módulos independientes y verificables por separado. El módulo visual usa un backbone MobileNetV3-Small preentrenado en ImageNet-1K (weights `IMAGENET1K_V1`), seguido de global average pooling, una capa lineal de proyección a 512 dimensiones, activación Hardswish y dropout 0.2, con cuatro cabezas de salida: `mode_head` (5 clases), `marketing_head` (3 clases), `domain_head` (5 etiquetas multilabel) y `elderly_head` (3 clases). La pérdida combina cross-entropy para `mode` y `elderly`, cross-entropy con máscara para `marketing`, y BCE with logits con pesos asimétricos para `domain` (gamma_neg=4.0, gamma_pos=1.0). El entrenamiento se realizó en dos fases: primero congelando el backbone y entrenando solo las capas nuevas, luego con fine-tuning completo; sin embargo, la versión `day43-fusion-only-frozen-visual-v1` no reentrenó el backbone, solo la capa de fusión.

El módulo de texto no usa embeddings ni modelos preentrenados: aplica un HashingVectorizer de scikit-learn a nivel de carácter (ngram_range 1-4, 262.144 dimensiones, alternate_sign=true, L2 normalización, lowercase=false) y entrena tres regresiones logísticas independientes para `sales`, `health` y `elderly`, todas con `solver=liblinear`, `class_weight=balanced`, `max_iter=1000` y `random_state=2026`. Los umbrales de cada clasificador se seleccionan por F1 en validación, no se fijan en 0.5. El módulo de fusión combina 18 características normalizadas con StandardScaler y una LogisticRegression con `C=10.0`, calibración identity y umbral final de 0.48764924527277753. Los datos de entrenamiento incluyen 2.523 registros etiquetados iniciales (2.021 train, 248 validación, 254 test bloqueado) y un dataset2 adicional de 676 registros usado solo para validación interna y características de fusión anti-fuga.

## Capacidades

- Clasificación de fotogramas de vídeo en 5 modos de pantalla (live room, short video, live preview, etc.) mediante `mode_head`.
- Detección de contenido de marketing en 3 categorías con `marketing_head`, cuya salida softmax se usa para calcular la puntuación visual.
- Etiquetado multilabel de dominio en 5 categorías con `domain_head`, combinado con `marketing_head` para la puntuación visual final.
- Clasificación de texto OCR en tres ejes independientes: ventas (`sales`), salud (`health`) y contenido para personas mayores (`elderly`), con umbrales optimizados por F1.
- Fusión de 18 características heterogéneas (visuales, textuales, reglas y metadatos) en una probabilidad calibrada con umbral de decisión.
- Inferencia móvil optimizada: el clasificador de texto se entrega en formato int8 (786 KB) y el modelo visual se exporta por separado para Android/LiteRT.
- Detección de señales de reglas: presencia de precio, carrito de compra, aviso de pedido, listas negras/blancas de cuentas, disponibilidad de OCR y oclusión de pantalla.

## Casos de uso

- Moderación de contenido en plataformas de vídeo corto: el modelo puede analizar fotogramas y texto OCR en tiempo real para detectar promociones de salud potencialmente engañosas dirigidas a personas mayores, gracias a su diseño ligero para inferencia móvil.
- Filtrado de anuncios en aplicaciones de streaming en directo: la detección de modo de pantalla (live room) y la combinación de señales visuales y de reglas permite identificar momentos de promoción comercial dentro de retransmisiones.
- Protección de usuarios vulnerables: el modelo está específicamente entrenado para reconocer contenido orientado a personas mayores (`elderly_head`) y puede integrarse en apps de asistencia para advertir sobre promociones de salud no verificadas.
- Análisis de cumplimiento publicitario: las características de reglas (precio, carrito, aviso de pedido) permiten auditar si un anuncio cumple con requisitos básicos de transparencia en plataformas chinas.
- Investigación académica sobre publicidad engañosa: el pipeline documentado con datos de entrenamiento y evaluación reproducibles (aunque sin datos crudos) sirve como referencia para estudios sobre detección de contenido comercial engañoso.
- Desarrollo de sistemas de clasificación multimodal de bajo coste: la arquitectura que combina un backbone ligero, hashing de texto y regresión logística ofrece un punto de partida para proyectos con restricciones severas de recursos computacionales.

## Benchmarks y rendimiento

Los resultados de evaluación provienen de conjuntos de desarrollo internos y no constituyen una garantía de precisión en producción. La selección del checkpoint visual se basó en la mediana de AUPRC de validación entre tres semillas: seed 8911 obtuvo 0.8595467, seed 2026 obtuvo 0.8663405 y seed 3407 obtuvo 0.8687793; se eligió la seed 2026. La tabla de evaluación del conjunto de desarrollo (248 vídeos) está incompleta en la información disponible, pero se indica que incluye Precision, Recall, F1, AUPRC y FPR de la clase negativa. Para el clasificador de texto int8, la consistencia con la versión float se verificó sobre 248 registros con los siguientes errores máximos:

| Objetivo | Error maximo | Error medio | Cambios de umbral |
|---|---|---|---|
| `sales` | 0.0039304 | 0.0016300 | 2 |
| `health` | 0.0029484 | 0.0007635 | 0 |
| `elderly` | 0.0021764 | 0.0006609 | 0 |

No se han publicado resultados de benchmarks comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- Inferencia móvil Android: el modelo visual se exporta a LiteRT y el clasificador de texto int8 ocupa solo 786 KB, por lo que cabe en cualquier smartphone Android moderno.
- Inferencia en escritorio: el checkpoint PyTorch visual puede ejecutarse en CPU, aunque se recomienda GPU para procesamiento por lotes; el tamaño exacto de VRAM no está documentado.
- El clasificador de texto con HashingVectorizer y regresión logística es extremadamente ligero y puede ejecutarse en CPU sin requisitos especiales.
- El modelo de fusión (StandardScaler + LogisticRegression) es trivial en recursos y puede ejecutarse en cualquier dispositivo.
- Opciones de despliegue: no es compatible con vLLM, llama.cpp, Ollama ni TGI por no ser un modelo transformer; el despliegue requiere el runtime personalizado incluido en `deployment/runtime-day43-v1/`.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se han identificado modelos directamente comparables en la información disponible. KeepersEye-1 es un pipeline altamente especializado para un caso de uso concreto (detección de promociones de salud en vídeos cortos chinos) y no pertenece a una categoría de modelos generalistas con alternativas establecidas. Los modelos de clasificación de imágenes estándar (como los de torchvision) carecen del componente de fusión multimodal, y los modelos de lenguaje multimodales (como los basados en transformadores) no están optimizados para inferencia móvil de bajo coste ni para este dominio específico.

## Limitaciones y advertencias

- El modelo no es compatible con la API `from_pretrained` de Transformers ni con formatos estándar de Hugging Face; requiere el runtime personalizado del repositorio.
- Los resultados de evaluación provienen de conjuntos de desarrollo internos y no pueden interpretarse como garantía de precisión en producción para todas las plataformas, pantallas o contenidos.
- Los datos crudos (vídeos, capturas, logs OCR) no están incluidos en el repositorio, lo que limita la reproducibilidad externa.
- El modelo está entrenado exclusivamente para contenido en chino y para el dominio de promociones de salud; su rendimiento en otros idiomas o dominios no está garantizado.
- La licencia no está disponible, por lo que se desconoce si el uso comercial está permitido; el README menciona que la versión actual es "personal, no comercial".
- La cuantización int8 del clasificador de texto introduce errores de probabilidad (máximo 0.0039 para `sales`) y dos cambios de umbral en el conjunto de verificación, que aunque no se ocultan, podrían afectar decisiones en casos límite.
- El modelo no es un LLM y no puede generar texto ni razonar; solo produce clasificaciones binarias sobre si un contenido es promoción de salud.
- La exportación para Android requiere un proceso separado; el checkpoint PyTorch del repositorio no es directamente utilizable en la aplicación móvil.
- El repositorio tiene 0 descargas y 0 likes, y la fecha de creación (agosto de 2026) es futura respecto a la fecha de conocimiento actual, lo que sugiere que el proyecto puede estar en una fase muy temprana o ser de acceso restringido.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/AvalonskyAfar/KeepersEye-1
- Perfil de GitHub del autor: https://github.com/AvalonskyAfar
- No se han encontrado papers, blogs ni demos adicionales en la busqueda web.
