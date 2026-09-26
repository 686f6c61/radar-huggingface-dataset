# Shahabkhan396/plantcare-convnext-tiny

## Resumen

PlantCare AI - convnext_tiny es un clasificador de imagenes para diagnostico de enfermedades en hojas de cultivo, publicado por el usuario Shahabkhan396 en Hugging Face bajo el identificador `Shahabkhan396/plantcare-convnext-tiny`. Se trata de un ajuste fino del checkpoint `convnext_tiny.fb_in22k_ft_in1k` de la libreria timm sobre el dataset de campo PlantCity, que cubre 12 cultivos y 52 clases (cultivo sano y distintas enfermedades) con fotografias tomadas en Pakistan. El modelo tiene 27.860.116 parametros reales (aproximadamente 27,9 millones), un tamano de repositorio de 0,1 GB y una entrada fija de 224x224 pixeles.

La relevancia de esta ficha es doble. Por un lado, los numeros reportados por el autor son altos para una tarea de campo: exactitud de test de 0,9959, macro-F1 de 0,9954 y un error de calibracion esperado (ECE) de 0,0026 tras calibrar, lo que indica que las probabilidades de salida son utilizables como medida de confianza. Por otro lado, el protocolo de evaluacion es poco habitual en modelos pequenos publicados sin traccion: split estratificado y agrupado 72/14/14, eliminacion de casi duplicados, solo fotos originales y aumento de datos en tiempo de ejecucion.

El modelo no es un modelo generativo ni multimodal: es un cabezal de clasificacion de imagenes, sin capacidades de texto, tool calling ni agentes. Su interes practico esta en el despliegue en movil o en el borde (edge) para triaje agronomico, y como backbone preentrenado para reajustar a otras regiones, camaras o cultivos. La licencia no esta declarada en la model card, un punto critico antes de cualquier uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ConvNeXt (red puramente convolucional jerarquica); checkpoint de partida `convnext_tiny.fb_in22k_ft_in1k` de timm |
| Parametros totales | 27.860.116 (aproximadamente 27,9 M; dato real extraido de safetensors) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; entrada de imagen de 224x224 pixeles |
| Tipos de cuantizacion | no disponibles; el repositorio solo publica pesos en safetensors |
| Idiomas soportados | no aplica (clasificacion de imagenes); no disponible en la informacion |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria timm) |
| Tarea | image-classification |
| Numero de clases | 52 |
| Cultivos cubiertos | 12 |
| Dataset de entrenamiento | PlantCity (Khan et al., 2025, Mendeley Data) |
| Fichero auxiliar | `plantcare_meta.json` (incluye la temperatura de calibracion) |
| Tamano del repositorio | 0,1 GB |
| Fecha de creacion (metadatos HF) | 2026-09-25 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

ConvNeXt es una familia de redes puramente convolucionales disenada tomando prestadas decisiones de los Vision Transformers (etapa de parcheo con convolucion de 4x4, convoluciones depthwise de 7x7, bloques con cuello de botella invertido, normalizacion LayerNorm y activacion GELU). La variante tiny es la mas pequena de la familia y se corresponde con el checkpoint `convnext_tiny.fb_in22k_ft_in1k` de timm, segun cuya nomenclatura el backbone fue preentrenado en ImageNet-22k y despues ajustado en ImageNet-1k a 224x224. Sobre ese backbone, el autor ha sustituido el cabezal de 1000 clases por uno de 52 clases y lo ha reajustado con el dataset PlantCity.

El entrenamiento descrito en la model card usa un split estratificado y agrupado (group-aware) 72/14/14, con eliminacion de casi duplicados y solo fotografias originales, aplicando aumento de datos en tiempo de ejecucion (on-the-fly augmentation). No se especifican hiperparametros, numero de epocas, optimizador, composicion exacta del dataset ni si hubo fases adicionales de destilacion o regularizacion. Si se documenta un paso de calibracion: los logits deben dividirse por la temperatura indicada en `plantcare_meta.json` antes de aplicar softmax para obtener confianzas calibradas; sin ese ajuste, el ECE reportado de 0,0026 no es aplicable. La innovacion tecnica destacable no esta en la arquitectura (es un fine-tuning estandar) sino en el rigor del protocolo de evaluacion y en la publicacion de la temperatura de calibracion junto a los pesos.

## Capacidades

- Clasificacion de imagenes de hojas en 52 clases correspondientes a 12 cultivos, incluyendo estados sanos y distintas enfermedades.
- Salida de probabilidades calibradas por clase (tras aplicar la temperatura de `plantcare_meta.json`), lo que permite fijar umbrales de confianza y derivar casos a revision humana.
- Extraccion de caracteristicas: al ser un backbone ConvNeXt, puede reutilizarse como extractor congelado para tareas de recuperacion, agrupamiento o clasificacion con menos datos.
- Reajuste (fine-tuning) sencillo mediante timm para nuevas regiones, cultivos o camaras.
- Inferencia en CPU viable por tamano (27,9 M de parametros) y entrada pequena (224x224).
- No soporta generacion de texto, tool calling, function calling, agentes, razonamiento multi-paso, vision mas alla de la clasificacion de imagen unica ni procesamiento de audio.
- No hay capacidades multilingues: la salida es un vector de 52 probabilidades, sin texto asociado en el repositorio.

## Casos de uso

- Triaje agronomico en aplicacion movil: el modelo puede ejecutarse en el propio telefono (27,9 M de parametros, 224x224) para que el agricultor fotografíe una hoja y reciba la clase probable con una confianza calibrada; es adecuado porque el ECE de 0,0026 permite mostrar un aviso de "baja confianza" en lugar de un diagnostico cerrado.
- Priorizacion de inspecciones por parte de tecnicos: en una cooperativa con miles de parcelas, las imagenes enviadas por los agricultores se clasifican automaticamente y solo las que superan un umbral de confianza bajo se escalan a un especialista, reduciendo carga de trabajo.
- Pre-etiquetado en pipelines de anotacion: el modelo actua como etiquetador automatico inicial de un conjunto nuevo de fotografias; los anotadores corrigen las 52 clases propuestas, lo que acelera el etiquetado con supervision humana (active learning).
- Filtrado y control de calidad de datasets: dado su rendimiento en el split de test, puede usarse para detectar imagenes mal etiquetadas o fuera de distribucion dentro de un corpus agronomico (por ejemplo, hojas de cultivos no cubiertos).
- Vigilancia con dron o robotica de campo: integrado en un pipeline de captura aerea o terrestre, clasifica cada recorte de hoja para generar mapas de incidencia por parcela; requiere validacion previa en el dominio concreto de camara y distancia.
- Soporte a sistemas de recomendacion de tratamiento: la clase predicha se mapea a una ficha de manejo integrado de plagas, actuando el modelo como modulo de percepcion y no como fuente de recomendacion final.
- Aprendizaje por transferencia para otra geografia: partiendo de estos pesos, un equipo puede reajustar el cabezal a un dataset local con muchas menos imagenes que entrenando desde ImageNet.
- Investigacion reproducible en agricultura de precision: el modelo sirve como linea base con metricas publicadas (accuracy 0,9959, macro-F1 0,9954) y protocolo de split documentado para comparar nuevos metodos.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Exactitud en test | 0,9959 |
| Macro-F1 en test | 0,9954 |
| ECE (calibrado) | 0,0026 |
| Tamano de entrada | 224x224 |
| Split | group-aware estratificado 72/14/14, sin casi duplicados, solo fotos originales |
| Aumento de datos | en tiempo de ejecucion (on-the-fly) |
| Comparacion con otros modelos | no disponible |

No se han publicado resultados comparativos frente a otros modelos en la informacion disponible, ni el numero de imagenes por particion, ni curvas por clase, ni resultados en conjuntos externos. Las cifras anteriores proceden exclusivamente de la model card del autor.

## Requisitos de hardware

- Peso de los parametros: aproximadamente 111 MB en fp32 y 56 MB en fp16, calculado a partir de los 27.860.116 parametros; el repositorio completo ocupa 0,1 GB.
- VRAM estimada para inferencia: por debajo de 1 GB en fp16 con lotes pequenos (estimacion derivada del numero de parametros y de una entrada de 224x224, no publicada por el autor).
- GPU recomendadas: cualquiera con al menos 2 GB de memoria sirve para inferencia en fp16; modelos como RTX 3060, RTX 4090, A100 o H100 estan sobredimensionados para este tamano y solo tienen sentido para entrenamiento o inferencia por lotes a gran escala.
- GPU de consumo: si, cabe en practicamente cualquier GPU de consumo actual e incluso en iGPU con suficiente memoria compartida.
- CPU: viable para inferencia individual, dado el reducido numero de parametros y la resolucion de entrada.
- Opciones de despliegue: PyTorch con la libreria timm (indicada en la model card); exportacion a ONNX o TorchScript para servir con ONNX Runtime, TensorRT o Triton; no se documentan artefactos GGUF, Ollama, vLLM ni TGI (no aplicables a un clasificador de este tamano).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto o entrada | Rendimiento en PlantCity | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PlantCare AI convnext_tiny (este modelo) | 27,86 M | imagen 224x224 | accuracy 0,9959, macro-F1 0,9954 | no disponible | Hugging Face, timm, safetensors |
| ConvNeXt-Tiny original (timm, ImageNet-1k) | aproximadamente 28 M | imagen 224x224 | no disponible (no evaluado en PlantCity) | segun licencia del checkpoint original | timm |
| ResNet-50 (referencia clasica) | aproximadamente 25,6 M | imagen 224x224 | no disponible (no evaluado en PlantCity) | segun implementacion | amplia |
| EfficientNet-B0 (referencia clasica) | aproximadamente 5,3 M | imagen 224x224 | no disponible (no evaluado en PlantCity) | segun implementacion | amplia |

No hay datos publicados que permitan comparar este modelo con alternativas sobre el mismo dataset. Los recuentos de parametros de las alternativas son cifras publicas de sus arquitecturas base, no mediciones realizadas en este contexto. Tampoco se dispone de comparativas con otros modelos especificos de enfermedades de plantas publicados en Hugging Face.

## Limitaciones y advertencias

- Sesgo geografico: el entrenamiento se limita a hojas de dos distritos de Khyber Pakhtunkhwa (Charsadda y Chitral); el propio autor advierte de una caida de rendimiento en otras regiones.
- Sesgo de captura: se espera degradacion ante camaras, iluminacion, fondos o protocolos de fotografia distintos a los del dataset PlantCity.
- Cobertura de cultivos cerrada: solo los 12 cultivos y 52 clases vistos en entrenamiento; una hoja de otro cultivo se clasificara igualmente en una de las 52 clases, sin clase de rechazo documentada.
- Uso previsto: decision support, no diagnostico. No debe sustituir la evaluacion de un tecnico ni usarse para aplicar tratamientos sin verificacion.
- Licencia no declarada: no se puede asumir uso comercial. La propia model card recomienda comprobar la licencia del dataset PlantCity (Khan et al., 2025, Mendeley Data) antes de redistribuir los pesos.
- Riesgo de sobreajuste al split: se eliminan casi duplicados, lo que reduce la inflacion artificial de metricas, pero no se publica el tamano de cada particion ni resultados en un conjunto externo, por lo que la generalizacion real a campo no esta cuantificada.
- Calibracion condicionada: el ECE de 0,0026 solo es valido si se divide por la temperatura de `plantcare_meta.json`; sin ese paso, las confianzas pueden estar mal calibradas.
- Alucinacion en el sentido clasico no aplica (no genera texto), pero si existe el riesgo de predicciones seguras y erroneas fuera de distribucion, con la particularidad de que una confianza calibrada alta no garantiza correccion fuera del dominio de entrenamiento.
- Traccion nula: 0 descargas y 0 likes en el momento de la consulta, sin validacion independiente por parte de la comunidad.
- Sin soporte ni mantenimiento documentado: ficha tecnica minima, sin paper asociado al modelo (solo al dataset).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Shahabkhan396/plantcare-convnext-tiny
- Fichero de calibracion: `plantcare_meta.json` dentro del repositorio del modelo
- Dataset: Khan et al. (2025), *PlantCity: A Comprehensive Image Based on Multi Crop Leaves disease in Pakistan*, Mendeley Data (enlace directo no disponible en la informacion proporcionada)
- Paper del modelo: no disponible
- Repositorio de codigo o demo: no disponible
- Documentacion de la arquitectura base (timm, `convnext_tiny.fb_in22k_ft_in1k`): no disponible en la informacion proporcionada
