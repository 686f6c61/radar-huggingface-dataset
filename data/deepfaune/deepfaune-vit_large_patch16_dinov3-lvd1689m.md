# DeepFaune/deepfaune-vit_large_patch16_dinov3.lvd1689m

## Resumen

DeepFaune es un proyecto de investigacion del CNRS (Centro Nacional de Investigacion Cientifica de Francia) que desarrolla modelos de vision por computador para la clasificacion automatica de especies animales en imagenes y videos de camaras trampa. El modelo identificado como `deepfaune-vit_large_patch16_dinov3.lvd1689m` es un clasificador de imagenes basado en la arquitectura Vision Transformer (ViT-Large con parches de 16x16), preentrenado con DINOv3 y afinado para la tarea especifica de identificacion de fauna. El sufijo `lvd1689m` hace referencia al checkpoint de DINOv3 sobre el que se construye.

El modelo resuelve un problema concreto en ecologia y conservacion: el volumen de imagenes generado por redes de camaras trampa desborda la capacidad de revision manual. DeepFaune proporciona un pipeline que clasifica automaticamente las capturas, facilitando el seguimiento de biodiversidad a gran escala. La iniciativa, lanzada en 2020, distribuye tambien un software de escritorio gratuito que integra estos modelos para uso por parte de investigadores y gestores ambientales.

La relevancia actual del modelo radica en su especializacion: frente a clasificadores genericos de ImageNet, esta afinado sobre un dominio muy concreto (fauna europea captada por camaras trampa), con condiciones de iluminacion, angulos y oclusiones propias de este tipo de sensores. La informacion publica disponible sobre esta variante concreta es muy limitada; la model card en HuggingFace solo declara la licencia, sin detalles de entrenamiento, metricas ni clases soportadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT-Large, patch size 16), preentrenado con DINOv3 |
| Parametros totales | no disponible (ViT-Large tipicamente ~300M, dato no confirmado en la informacion proporcionada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de vision, sin contexto textual) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de clasificacion de imagenes, sin salida textual) |
| Licencia | CC-BY-SA-4.0 |
| Formato de pesos | no disponible (no se especifica en la model card) |

## Arquitectura y entrenamiento

El modelo se basa en un Vision Transformer de tamano Large con parches de 16x16 pixeles, preentrenado mediante DINOv3, la tercera iteracion del metodo de self-supervised learning desarrollado por Meta AI. DINOv3 produce representaciones visuales densas de alta calidad que se transfieren bien a tareas de clasificacion con pocos datos etiquetados, lo que encaja con el escenario de DeepFaune: datasets de fauna anotados por expertos, costosos de ampliar. El sufijo `lvd1689m` corresponde al checkpoint LVD-1689M de DINOv3.

No se dispone de informacion publica sobre el numero de imagenes de entrenamiento, la composicion del dataset de afinado, las clases objetivo, ni si se aplicaron tecnicas de aumento de datos o regularizacion especificas. Tampoco se documenta si el modelo se entreno con aprendizaje supervisado puro sobre el checkpoint DINOv3 o con alguna estrategia de ajuste fino parcial. La model card en HuggingFace no incluye ninguno de estos detalles.

## Capacidades

- Clasificacion de imagenes de camaras trampa para identificar especies de fauna.
- Extraccion de caracteristicas visuales densas gracias al backbone DINOv3, reutilizable para tareas derivadas (deteccion, segmentacion, clustering de capturas).
- Procesamiento de fotogramas individuales; el software DeepFaune integra el modelo en un pipeline que tambien maneja videos.
- No se documenta soporte de tool calling, agentes, razonamiento multi-paso ni generacion de texto: es un clasificador visual, no un modelo generativo.
- Capacidades multilingues no aplicables (sin salida textual).
- No se documenta modo thinking, vision generativa, audio ni otras capacidades multimodales mas alla de la entrada de imagen.

## Casos de uso

- Monitorizacion de biodiversidad en reservas naturales: el modelo clasifica automaticamente las miles de capturas que generan las redes de camaras trampa, permitiendo a los gestores construir series temporales de presencia de especies sin revision manual.
- Estudios de ecologia de poblaciones: los investigadores pueden estimar abundancia relativa y patrones de actividad (horarios, estacionalidad) a partir de las clasificaciones, integrando el modelo en pipelines de analisis estadistico.
- Deteccion de especies invasoras o protegidas: al clasificar capturas de forma continua, el sistema puede alertar sobre la aparicion de especies de interes para la conservacion o de riesgo para el ecosistema.
- Seguimiento de fauna en proyectos de infraestructura: evaluaciones de impacto ambiental que requieren documentar la presencia de fauna antes y despues de la construccion de carreteras, parques eolicos u otras obras.
- Investigacion academica y educacion: el backbone DINOv3 permite reutilizar las representaciones para experimentos de aprendizaje autosupervisado, few-shot learning o comparacion de metodos en el dominio de fauna.
- Integracion en el software DeepFaune: uso directo por parte de usuarios no tecnicos a traves de la aplicacion de escritorio gratuita distribuida por el proyecto, que gestiona la carga de imagenes y la exportacion de resultados.
- Curaduria de datasets: uso del modelo para preetiquetar grandes colecciones de imagenes y reducir el esfuerzo de anotacion manual en nuevos proyectos de camaras trampa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Para un ViT-Large con entrada de 224x224 en precision FP16, la inferencia tipica requiere del orden de 1-2 GB de VRAM; en FP32, alrededor de 2-4 GB. Estas cifras son estimaciones genericas para la arquitectura y no estan confirmadas para este checkpoint.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM deberia poder ejecutar el modelo en FP16; una RTX 3060 o superior es suficiente para inferencia por lotes.
- Cabe en GPU de consumo: si, previsiblemente en la mayoria de GPUs consumer modernas (GTX 1660, RTX 20xx/30xx/40xx), aunque no se dispone de confirmacion oficial.
- Opciones de despliegue: al ser un modelo de vision, el despliegue habitual seria via PyTorch/TorchVision o transformars, o exportandolo a ONNX. No se documenta soporte especifico para vLLM, llama.cpp, Ollama o TGI, que estan orientados a modelos de lenguaje.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| deepfaune-vit_large_patch16_dinov3.lvd1689m | ViT-Large (DINOv3) | no disponible | imagen (patch 16) | CC-BY-SA-4.0 | HuggingFace |
| DeepFaune (versiones anteriores) | CNN (no especificado) | no disponible | imagen | no disponible | Software DeepFaune |
| DINOv3 ViT-L | ViT-Large | ~300M (segun literatura DINOv3) | imagen | licencia DINOv3 | Meta AI |
| CLIP ViT-L/14 | ViT-Large | ~428M | imagen + texto | MIT (segun version) | OpenAI |

La comparacion con clasificadores genericos como CLIP no es directa: DeepFaune esta especializado en fauna de camaras trampa, mientras que CLIP es un modelo vision-lenguaje de proposito general. Frente a las versiones anteriores de DeepFaune basadas en CNN, esta variante con ViT-Large y DINOv3 representa una actualizacion arquitectonica orientada a mejorar la calidad de las representaciones. No se dispone de datos de rendimiento comparativo publicados en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados. Al estar entrenado presumiblemente con fauna europea (el proyecto es frances), el rendimiento puede degradarse con especies de otras regiones.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si existe riesgo de clasificacion erronea, especialmente con imagenes nocturnas, borrosas, con oclusiones o de especies visualmente similares.
- Limitaciones de contexto o idioma: al ser un modelo de vision, no hay contexto textual ni capacidades multilingues. La informacion sobre las clases soportadas no esta publicada en la model card.
- Restricciones de licencia: CC-BY-SA-4.0 permite uso comercial con atribucion y obliga a compartir bajo la misma licencia las obras derivadas. Para integraciones en productos propietarios, esto puede ser un impedimento legal.
- Caveats para produccion: la falta de documentacion sobre el dataset de entrenamiento, las metricas y las clases objetivo dificulta la evaluacion de riesgos antes de desplegar el modelo. Se recomienda validar sobre un conjunto propio antes de usarlo en decisiones de conservacion.
- El modelo se publica sin pipeline declarado en HuggingFace y con cero descargas en el momento de la consulta, lo que sugiere que la integracion practica se realiza a traves del software DeepFaune y no como modelo aislado.

## Enlaces

- HuggingFace: https://huggingface.co/DeepFaune/deepfaune-vit_large_patch16_dinov3.lvd1689m
- Sitio oficial DeepFaune (FR): https://www.deepfaune.cnrs.fr/
- Sitio oficial DeepFaune (EN): https://www.deepfaune.cnrs.fr/en/
- Documentacion del software: https://deepfaune.pages.math.cnrs.fr/software/
- DeepFaune en CNRS Sciences informatiques: https://www.ins2i.cnrs.fr/fr/deepfaune
- Articulo de la Universite Savoie Mont Blanc sobre DeepFaune: https://www.univ-smb.fr/2025/05/27/deepfaune-lintelligence-artificielle-au-service-de-la-biodiversite/
