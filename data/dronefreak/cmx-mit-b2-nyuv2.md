# dronefreak/cmx-mit-b2-nyuv2

## Resumen

CMX (Cross-Modal Fusion) es un modelo de segmentación semántica multimodal diseñado para combinar imágenes RGB con una segunda modalidad (en esta variante, profundidad, dando lugar a RGB-D). Lo desarrolla el grupo de Jiaming Zhang y colaboradores en el KIT (Karlsruhe Institute of Technology) y se publicó en IEEE Transactions on Intelligent Transportation Systems en 2023. El modelo resuelve el problema de la segmentación densa en escenas donde la información de color por sí sola es ambigua, incorporando la modalidad auxiliar mediante módulos de rectificación y fusión de características.

Esta ficha concreta corresponde a un espejo no oficial (`dronefreak/cmx-mit-b2-nyuv2`) de los pesos oficiales del repositorio `huaaaliu/RGBX_Semantic_Segmentation`, entrenados sobre el dataset NYUv2. La arquitectura combina un encoder dual SegFormer con backbone MiT-B2 (dos ramas, una por modalidad) con módulos de fusión cross-modal, y suma 66,6 millones de parámetros. No es un modelo generativo ni un LLM: es un modelo discriminativo de segmentación por píxel, por lo que su relevancia está en visión por computador y robótica, no en procesamiento de lenguaje.

El interés actual del modelo radica en que ofrece una línea base reproducible y ligera (66,6 M de parámetros, 1,1 GB de repo) para segmentación RGB-D, con licencia MIT y pesos redistribuidos en safetensors además del checkpoint original en PyTorch.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CMX: encoder dual SegFormer (MiT-B2) con módulos de rectificación y fusión cross-modal |
| Parametros totales | 66.586.544 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; modelo de visión por píxel) |
| Tipos de cuantizacion | no disponible (no se documentan cuantizaciones publicadas) |
| Idiomas soportados | no disponible (modelo de visión, sin capacidades lingüísticas) |
| Licencia | MIT |
| Formato de pesos | safetensors (`model.safetensors`) y checkpoint PyTorch original (`NYUDV2_CMX+Segformer-B2.pth`) |

## Arquitectura y entrenamiento

CMX emplea una arquitectura de dos ramas: dos encoders SegFormer con backbone MiT-B2, uno para la imagen RGB y otro para la modalidad complementaria (en esta variante, profundidad). Sobre esas representaciones se aplican módulos de rectificación de características (feature rectification) y de fusión cross-modal, que corrigen y combinan la información de ambas ramas antes de la cabeza de segmentación. El resultado es un mapa denso de clases por píxel.

El entrenamiento se realizó sobre NYUv2, dataset indoor de interiores con pares RGB-D y anotaciones semánticas densas. La model card no detalla el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de ajuste fino adicionales; esos datos deben consultarse en el paper original (arXiv:2203.04838) y en el repositorio oficial. No se documentan innovaciones como decodificación especulativa ni atención lineal, ya que el modelo no es autoregresivo.

## Capacidades

- Segmentación semántica densa RGB-D: asigna una clase a cada píxel combinando color y profundidad.
- Fusión cross-modal RGB-X: la arquitectura está pensada para emparejar RGB con una modalidad auxiliar; en esta variante concreta, profundidad.
- Segmentación de escenas interiores: entrenado específicamente sobre NYUv2 (entornos indoor).
- Inferencia a escala simple y multi-escala con flip (reportadas por los autores).
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües ni de generación de texto.
- No dispone de modo thinking, visión generativa, audio ni otras capacidades multimodales generativas.

## Casos de uso

- Segmentación de escenas interiores en robótica móvil: el modelo combina RGB y profundidad para delimitar suelo, paredes, muebles y obstáculos, lo que resulta útil en navegación de robots domésticos donde la profundidad desambigua texturas repetitivas.
- Realidad aumentada y reconstrucción 3D: al etiquetar densamente pares RGB-D capturados por sensores como Kinect o RealSense, se pueden generar mallas semánticas para aplicaciones de interiorismo o gemelos digitales.
- Asistencia a personas con discapacidad visual: la segmentación RGB-D permite identificar superficies transitables y obstáculos en tiempo real, aprovechando que el modelo es ligero (66,6 M de parámetros) y puede ejecutarse en hardware embebido.
- Preetiquetado en pipelines de anotación: el modelo puede generar máscaras semánticas iniciales sobre NYUv2 u otros datasets indoor para que anotadores humanos las corrijan, reduciendo el coste de etiquetado.
- Investigación en fusión multimodal: sirve como línea base reproducible para comparar nuevas estrategias de fusión RGB-X (RGB-D, RGB-T, RGB-L, etc.) dentro del ecosistema CMX.
- Automatización de inventario en interiores: segmentar objetos y superficies en capturas RGB-D de almacenes o viviendas para tareas de catalogación o control de stock.
- Evaluación comparativa de backbones: al estar disponible en variantes MiT-B2 y otras, permite medir el impacto del tamaño del encoder en la calidad de segmentación con un pipeline común.

## Benchmarks y rendimiento

Resultados reportados por los autores en la model card para la variante CMX + SegFormer-B2 sobre NYUv2:

| Metrica | Valor |
|---|---|
| mIoU (escala simple, %) | 54,1 |
| mIoU (multi-escala + flip, %) | 54,4 |

No se han publicado en la información disponible resultados adicionales (por ejemplo, comparativas con otros backbones o datasets) más allá de los anteriores.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 66,6 M de parámetros en FP32 el peso ocupa aproximadamente 266 MB, por lo que la VRAM necesaria es moderada (del orden de 1-2 GB incluyendo activaciones para resoluciones típicas).
- GPU recomendadas: cualquier GPU moderna con al menos 4 GB de VRAM; una RTX 3060 o superior es suficiente. Para entrenamiento o evaluación a alta resolución se recomiendan A100, H100 o RTX 4090.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPU consumer actuales (GTX 1660, RTX 2060, RTX 3060, RTX 4060, etc.).
- Opciones de despliegue: el repositorio oficial está en PyTorch; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo de segmentación). La carga se realiza con `safetensors.torch.load_file` o con el checkpoint `.pth` original.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / resolucion | mIoU NYUv2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CMX (MiT-B2) | 66,6 M | no disponible | 54,1 (single-scale) | MIT | Hugging Face (espejo) y repo oficial |
| CMX (otras variantes de backbone) | no disponible | no disponible | no disponible en esta ficha | MIT | repo oficial |
| Otros modelos RGB-D de segmentación | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos comparativos con alternativas concretas de la misma categoría (por ejemplo, otros métodos RGB-D de segmentación semántica), por lo que la comparativa queda limitada a la variante aquí descrita.

## Limitaciones y advertencias

- Es un espejo no oficial: los pesos son copia bit a bit del checkpoint original, pero el mantenimiento y la responsabilidad recaen en el autor original, no en `dronefreak`.
- Entrenado exclusivamente sobre NYUv2 (escenas interiores); el rendimiento fuera de ese dominio (exteriores, conducción, otros sensores) no está garantizado.
- Requiere pares RGB-D alineados; no funciona con imágenes RGB aisladas sin una rama de profundidad válida.
- No es un modelo generativo: no genera texto, no razona y no soporta tool calling ni agentes.
- Riesgo de errores en clases poco representadas o en condiciones de iluminación y profundidad atípicas; no se documentan análisis de sesgo específicos.
- Licencia MIT permite uso comercial, pero se recomienda citar el trabajo original y verificar las condiciones del repositorio oficial.
- No se documentan cuantizaciones ni optimizaciones de despliegue, por lo que el rendimiento en producción depende de la implementación propia.
- El repositorio tiene 0 descargas y 0 likes en el momento de la ficha, lo que refleja su carácter de espejo reciente y no validado por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dronefreak/cmx-mit-b2-nyuv2
- Repositorio oficial de código y pesos: https://github.com/huaaaliu/RGBX_Semantic_Segmentation
- Paper CMX (arXiv): https://arxiv.org/abs/2203.04838
- Dataset NYUv2 (espejo en el Hub): https://huggingface.co/datasets/dronefreak/NYUv2
