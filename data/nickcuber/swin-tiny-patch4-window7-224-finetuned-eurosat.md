# nickcuber/swin-tiny-patch4-window7-224-finetuned-eurosat

## Resumen

swin-tiny-patch4-window7-224-finetuned-eurosat es un modelo de clasificacion de imagenes publicado por el usuario nickcuber en HuggingFace. Se trata de un ajuste fino (fine-tuning) del modelo microsoft/swin-tiny-patch4-window7-224, un Swin Transformer de 27.527.044 parametros segun el recuento real de los pesos en safetensors, sobre un dataset que la propia model card describe como "unknown dataset". El nombre del repositorio sugiere que se ha entrenado sobre EuroSAT, el benchmark de clasificacion de cobertura del suelo a partir de imagenes Sentinel-2, aunque esta correspondencia no se confirma en la documentacion disponible.

La relevancia de este tipo de modelos esta en la teledeteccion: la clasificacion automatica de uso y cobertura del suelo es una tarea recurrente en monitorizacion medioambiental, agricultura y planificacion territorial, y un backbone de 27,5 millones de parametros es lo bastante ligero como para desplegarse en CPU o en GPUs de consumo, algo critico cuando se procesan volumenes grandes de teselas satelitales.

El autor declara 0,9824 de accuracy y 0,0567 de perdida en el conjunto de evaluacion, con licencia Apache 2.0 y pesos en safetensors. La model card es autocontenida y esta practicamente sin completar en las secciones de descripcion, usos previstos y datos de entrenamiento, por lo que cualquier evaluacion seria exige reproducir el entrenamiento o inspeccionar la configuracion de etiquetas del checkpoint.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Swin Transformer (vision transformer jerarquico con shifted windows), patch 4, window 7, entrada 224x224 |
| Parametros totales | 27.527.044 (dato real de safetensors) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no aplica: modelo de vision con entrada fija de 224x224 pixeles |
| Tipos de cuantizacion | no disponible; el repositorio solo contiene pesos en safetensors (fp32). Es cuantizable a int8 mediante cuantizacion dinamica de PyTorch u ONNX Runtime, pero el autor no publica variantes cuantizadas |
| Idiomas soportados | no aplica (clasificacion de imagenes); las etiquetas de clase estan en ingles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo de 0,3 GB, incluye artefactos de TensorBoard) |
| Tarea (pipeline) | image-classification |
| Modelo base | microsoft/swin-tiny-patch4-window7-224 |
| Resolucion de entrada | 224 x 224 px (heredada del modelo base) |
| Dataset de ajuste | no documentado ("unknown dataset" en la model card); el nombre sugiere EuroSAT, sin confirmar |

## Arquitectura y entrenamiento

Swin Transformer es una arquitectura de vision jerarquica que construye representaciones por etapas: parte de un patch embedding de tamano 4 y va fusionando parches para reducir resolucion y duplicar canales, con profundidades y dimensiones tipicas en la variante Tiny de [2, 2, 6, 2] bloques y [96, 192, 384, 768] canales, con 3, 6, 12 y 24 cabezas de atencion. Su innovacion principal es la atencion por ventanas desplazadas: la atencion se calcula dentro de ventanas locales de 7x7 para reducir coste cuadratico, y entre bloques consecutivos las ventanas se desplazan para permitir el flujo de informacion entre regiones vecinas. Esto sustituye la atencion global de ViT y da al modelo una complejidad lineal con la resolucion, ademas de una jerarquia de caracteristicas que lo hace util como backbone en deteccion y segmentacion.

El ajuste fino de este repositorio se realizo con el Trainer de HuggingFace, sin informacion sobre la composicion del dataset ni sobre el split de validacion. Los hiperparametros documentados son: learning rate 5e-05 con scheduler lineal, AdamW (variante fused, betas 0.9/0.999, epsilon 1e-08), batch de 32 en entrenamiento y evaluacion, semilla 42 y 3 epocas. Se registraron 608 pasos por epoca, lo que implica 19.456 imagenes por epoca (608 x 32) y 1.824 pasos totales. No se menciona uso de RLHF, DPO ni tecnicas de alineacion, algo que no aplica a un clasificador. Las versiones de framework declaradas son Transformers 5.16.1, PyTorch 2.11.0+cu128, Datasets 4.8.5 y Tokenizers 0.23.1.

La evolucion de la perdida de validacion (0,0935 en la epoca 1, 0,0747 en la 2 y 0,0567 en la 3) muestra que el modelo seguia mejorando en el ultimo punto de control, por lo que no puede descartarse que un entrenamiento mas largo mejorase el resultado o, por el contrario, empezase a sobreajustar.

## Capacidades

- Clasificacion de imagenes a 224x224 px en el conjunto de clases aprendido durante el ajuste fino.
- Salida de probabilidades por clase mediante pipeline de image-classification de Transformers.
- Uso como extractor de caracteristicas congelado: el backbone Swin Tiny es reutilizable para otras tareas de vision con cabezas nuevas (deteccion, segmentacion, retrieval).
- Inferencia por lotes y en CPU, sin requisitos de GPU.
- Compatible con HuggingFace Inference Endpoints (etiqueta endpoints_compatible) y exportable a ONNX, TorchScript o torch.compile.
- No soporta tool calling ni function calling.
- No soporta agentes, razonamiento multi-paso ni generacion de texto (es un modelo puramente discriminativo).
- No tiene capacidades linguisticas ni multilingues: no procesa texto de entrada.
- No dispone de modo "thinking", entrada de audio ni capacidades vision-language (no genera descripciones, solo etiquetas).
- No realiza OCR ni deteccion de objetos como tareas nativas; el modelo base si puede adaptarse a ellas mediante fine-tuning.

## Casos de uso

- Etiquetado automatico de teselas Sentinel-2: el modelo clasifica cada tesela de 224x224 en una categoria de cobertura del suelo, lo que permite construir mapas de uso del suelo a escala regional procesando lotes grandes en CPU o en una GPU modesta.
- Monitorizacion de cambios en el territorio: clasificar la misma zona en dos fechas y comparar las etiquetas permite detectar transiciones (por ejemplo, deforestacion o crecimiento urbano) sin intervencion manual.
- Control de calidad de datasets de teledeteccion: al ejecutar el modelo sobre un corpus etiquetado se pueden aislar las imagenes cuya prediccion discrepa de la etiqueta, que suelen ser errores de anotacion o muestras fuera de distribucion.
- Enrutado y filtrado en catalogos de imagenes satelitales: descartar teselas con nubes, agua o ruido antes de pasarlas a modelos mas caros, reduciendo el coste computacional del pipeline aguas abajo.
- Punto de partida para transfer learning en teledeteccion: al ser un Swin Tiny ya adaptado al dominio de imagenes multiespectrales RGB, sirve como inicializacion para tareas mas especificas con menos datos etiquetados.
- Prototipado y docencia: 27,5 millones de parametros caben en cualquier equipo y permiten montar demos de clasificacion de imagenes en minutos con la pipeline de Transformers, sin infraestructura dedicada.
- Despliegue en el borde: exportado a ONNX o cuantizado a int8, el modelo puede ejecutarse en dispositivos sin GPU para clasificacion en campo o en estaciones remotas.
- Triage en anotacion humana: usar las predicciones como sugerencia inicial para acelerar el etiquetado manual de nuevas zonas geograficas.

## Benchmarks y rendimiento

El model-index del repositorio no contiene ningun resultado (`results: []`), por lo que no hay benchmarks oficiales declarados. La model card si reporta metricas del conjunto de evaluacion y la evolucion durante el entrenamiento:

| Metrica | Epoca 1 (paso 608) | Epoca 2 (paso 1216) | Epoca 3 (paso 1824) |
|---|---|---|---|
| Training loss | 0,2154 | 0,1901 | 0,0271 |
| Validation loss | 0,0935 | 0,0747 | 0,0567 |
| Accuracy | 0,9694 | 0,9778 | 0,9824 |

No se han publicado resultados comparativos con otros modelos ni evaluacion sobre un conjunto de test independiente en la informacion disponible.

## Requisitos de hardware

- Peso de los parametros: aproximadamente 110 MB en fp32, 55 MB en fp16/bf16 y 27,5 MB en int8 (calculado a partir de los 27.527.044 parametros).
- VRAM estimada para inferencia: por debajo de 2 GB con lote pequeno en fp16; en torno a 1-2 GB adicionales de activaciones con lote de 32 a 224x224. Cifras orientativas, no medidas por el autor.
- Cabe sobradamente en GPU de consumo: cualquier GPU con 4 GB o mas (GTX 1650, RTX 3050, RTX 4090, etc.) es suficiente, incluso con lotes grandes. Tambien es viable en CPU.
- GPU de centro de datos (A100, H100) no aportan ventaja significativa para un modelo de este tamano salvo para procesar lotes masivos en paralelo.
- Opciones de despliegue: pipeline de Transformers, HuggingFace Inference Endpoints (etiqueta endpoints_compatible), ONNX Runtime, TorchScript, torch.compile, Triton Inference Server, BentoML. llama.cpp u Ollama no son aplicables a este tipo de modelo.
- Latencia y throughput: no disponible. No se han publicado mediciones en la informacion proporcionada.

## Comparativa con modelos similares

No existe comparacion publicada entre este ajuste fino y alternativas sobre el mismo dataset, por lo que las cifras de rendimiento se marcan como no disponibles. Los datos de parametros de las alternativas son cifras publicas aproximadas de las arquitecturas base, no verificadas contra una evaluacion comun.

| Modelo | Parametros | Entrada | Licencia | Rendimiento |
|---|---|---|---|---|
| nickcuber/swin-tiny-patch4-window7-224-finetuned-eurosat | 27,5 M | 224x224 | apache-2.0 | accuracy 0,9824 en el conjunto de evaluacion declarado por el autor |
| microsoft/swin-tiny-patch4-window7-224 (base, sin ajustar) | 27,5 M | 224x224 | apache-2.0 (verificar en su ficha) | no disponible para esta tarea |
| google/vit-base-patch16-224 (alternativa de la misma familia) | ~86 M aprox. | 224x224 | apache-2.0 (verificar en su ficha) | no disponible para esta tarea |
| ResNet-50 (referencia CNN clasica) | ~25,6 M aprox. | 224x224 | distinta segun implementacion | no disponible para esta tarea |

La ventaja estructural del Swin Tiny frente a ViT-Base es el coste computacional (un tercio de parametros) manteniendo la jerarquia de caracteristicas; frente a ResNet-50, la atencion por ventanas desplazadas aporta mayor capacidad de modelar dependencias de largo alcance dentro de la imagen.

## Limitaciones y advertencias

- Model card incompleta: las secciones de descripcion, usos previstos y datos de entrenamiento aparecen literalmente como "More information needed". No se documenta el dataset, el numero de clases, el split de validacion ni el mapeo de etiquetas.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta: no ha pasado por ninguna validacion de la comunidad ni por revision por pares.
- La evaluacion se limita a un unico conjunto de validacion tras 3 epocas; no hay conjunto de test independiente, validacion cruzada ni medicion de incertidumbre.
- Riesgo de sobreajuste al dominio: si el dataset es efectivamente EuroSAT, se trata de imagenes Sentinel-2 con resolucion de 10 m centradas en territorio europeo. El rendimiento puede degradarse notablemente con otros sensores, otras resoluciones, otras zonas geograficas o condiciones estacionales distintas.
- Sesgo geografico probable: la cobertura de EuroSAT esta sesgada hacia el continente europeo, lo que limita su generalizacion global.
- Entrada fija de 224x224 px: las imagenes deben redimensionarse, lo que puede destruir detalle fino relevante en escenas con objetos pequenos.
- La ficha no aporta datos de calibracion: no puede asumirse que una probabilidad de 0,99 corresponda a una certeza real del 99 %. En un clasificador, el fallo tipico no es "alucinar" sino etiquetar con alta confianza una imagen fuera de distribucion.
- No es un modelo generativo ni conversacional: cualquier expectativa de tool calling, razonamiento multi-paso o respuesta en lenguaje natural queda fuera de su alcance.
- Licencia Apache 2.0, permisiva para uso comercial, pero conviene verificar la licencia del modelo base (microsoft/swin-tiny-patch4-window7-224) y la del dataset empleado antes de un despliegue en produccion.
- Ausencia de versiones cuantizadas publicadas: cualquier optimizacion de latencia o tamano corre por cuenta del integrador.
- Los numeros de version de framework declarados (Transformers 5.16.1, PyTorch 2.11.0+cu128) corresponden al entorno del autor; la reproducibilidad con versiones actuales no esta garantizada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nickcuber/swin-tiny-patch4-window7-224-finetuned-eurosat
- Modelo base: https://huggingface.co/microsoft/swin-tiny-patch4-window7-224
- Paper de Swin Transformer: https://arxiv.org/abs/2103.14030
- Repositorio oficial de Swin Transformer: https://github.com/microsoft/Swin-Transformer
- Paper de EuroSAT (dataset probable, no confirmado en la model card): https://arxiv.org/abs/1709.00029
- La busqueda web realizada no devolvio resultados relevantes sobre el modelo: los unicos enlaces recuperados eran paginas de descarga de Google Chrome en varios idiomas, sin relacion con el repositorio.
