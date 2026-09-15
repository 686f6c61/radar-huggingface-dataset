# shareefch1413/ACL-LKNet

## Resumen

ACL-LKNet es un modelo de clasificacion de imagen medica disenado especificamente para la deteccion automatica de roturas del ligamento cruzado anterior (LCA) a partir de exploraciones volumetricas de resonancia magnetica de rodilla en tres planos (sagital, coronal y axial). Lo desarrolla el usuario shareefch1413, en el marco de una investigacion doctoral en radiologia musculoesqueletica computacional, y se publica bajo licencia MIT en Hugging Face con la libreria timm.

El modelo resuelve un problema clinico concreto: la lectura manual de estudios de RM de rodilla es lenta, dependiente del radiology y sujeta a variabilidad interobservador. ACL-LKNet combina un backbone convolucional de kernel grande (ConvNeXt-Tiny, con convoluciones depthwise de 7x7 capaces de capturar la trayectoria oblicua del LCA), modelado autosupervisado de cortes enmascarados (Masked Slice Modeling), atencion parametrica sobre la secuencia de cortes y fusion mediante atencion cruzada entre los tres planos anatomicos.

Es relevante ahora porque reporta un AUROC de 0,9639 en el conjunto de test bloqueado y oficial de Stanford MRNet (N=120, 54 roturas y 66 controles), por encima del 0,9370 del baseline original de Bien et al. (2018), con intervalos de confianza bootstrap del 95 %. El repositorio es muy pequeno (0,1 GB) y el checkpoint se distribuye en formato PyTorch (.pt) para inferencia en Python.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN jerarquica ConvNeXt-Tiny (convoluciones depthwise de 7x7) con atencion multi-cabeza; incluye Masked Slice Modeling, atencion parametrica de cortes y fusion por atencion cruzada tri-planar (2 cabezas) |
| Parametros totales | No disponible. El backbone ConvNeXt-Tiny tiene aproximadamente 28,6 M de parametros en la implementacion estandar de timm; el total del modelo completo con las cabezas de atencion no se especifica en la informacion disponible |
| Parametros activos | No aplica (arquitectura densa, no es MoE) |
| Longitud de contexto | No aplica (modelo de vision). Entrada volumetrica de 24 cortes por plano, cada corte a 224x224 px y 3 canales; los tres planos se procesan conjuntamente |
| Tipos de cuantizacion | No disponible (solo se publica el checkpoint en punto flotante) |
| Idiomas soportados | en (la documentacion y las etiquetas estan en ingles; el modelo procesa imagenes, no texto) |
| Licencia | MIT |
| Formato de pesos | PyTorch (.pt, archivo `finetune_best.pt`). Compatible con timm/Hugging Face Hub. No se publican safetensors ni GGUF |
| Tarea | Clasificacion de imagen (image-classification), binaria: rotura de LCA si/no |
| Dataset de entrenamiento/evaluacion | stanford-mrnet (Stanford MRNet) |
| Tamano del repositorio | 0,1 GB |
| Descargas / likes | 0 / 0 |
| Libreria | timm |
| Fecha de creacion (metadatos) | 2026-09-15 |
| Fecha de actualizacion (metadatos) | 2026-09-15 |

## Arquitectura y entrenamiento

La arquitectura parte de ConvNeXt-Tiny como extractor de caracteristicas 2D. El uso de convoluciones depthwise de 7x7 amplia el campo receptivo efectivo, lo que el autor justifica por la morfologia elongada y oblicua del LCA. Sobre el backbone se anaden cuatro componentes: (1) Masked Slice Modeling, una tarea pretexto autosupervisada de reconstruccion sobre pilas de cortes anisotropicas; (2) atencion parametrica de cortes, que produce pesos de atencion interpretables por corte y plano (alfa p,s) en lugar de un pooling uniforme; (3) fusion mediante atencion cruzada tri-planar con embeddings posicionales aprendidos por plano (e_sag, e_cor, e_axi) y 2 cabezas; y (4) invariantes anatomicos estrictos, con prohibicion de volteo horizontal o vertical durante el entrenamiento para preservar la quiralidad de la articulacion y la orientacion oblicua del ligamento.

No se detalla en la informacion disponible el numero total de tokens o examenes usados en el preentrenamiento autosupervisado, la composicion exacta del dataset de ajuste fino, ni si se aplicaron tecnicas de RLHF o DPO (poco habituales en clasificacion de imagen medica). Si se documenta el uso de un esquema de ensembling de 5 pliegues (5-Fold Ensemble) para la evaluacion final, con intervalos de confianza bootstrap de 95 % calculados sobre 1.000 iteraciones, y un test de DeLong pareado que compara ConvNeXt-Tiny frente a ResNet-18 con z = 3,864 y p = 0,000104, lo que respalda la hipotesis de que los campos receptivos grandes son superiores para estructuras ligamentosas elongadas. Tambien se reporta un Brier Score de 0,1184, indicativo de buena calibracion.

## Capacidades

- Clasificacion binaria de rotura del LCA a partir de examenes de RM de rodilla en tres planos simultaneos (sagital, coronal y axial).
- Procesamiento volumetrico: acepta pilas de 24 cortes por plano, con tensores de entrada de forma (1, 24, 3, 224, 224) por plano.
- Interpretabilidad clinica integrada: pesos de atencion por corte y plano, que el autor documenta como concentrados en los cortes centrales de la escotadura intercondilea (11-15 de 24) sin supervision a nivel de corte.
- Mapas de activacion Grad-CAM++ a alta resolucion: el hook en la etapa 2 de ConvNeXt-Tiny genera mapas de 14x14 localizados en la huella femoral y el sitio de rotura en la sustancia media.
- Analisis de curva de decision (DCA): el modelo reporta beneficio clinico neto superior a las politicas de "tratar a todos" y "no tratar a ninguno" en el rango de umbrales quirurgicos p_t entre 0,10 y 0,75.
- Inferencia en Python mediante `hf_hub_download` y la clase `create_model_from_config`, con salida de logits transformables a probabilidad mediante sigmoide.
- No se documentan capacidades de generacion de texto, codigo, matematicas, vision general, tool calling, function calling, uso como agente, razonamiento multi-paso, audio ni modo de pensamiento explicito.

## Casos de uso

- Triaje radiologico en urgencias: el modelo puede clasificar un examen de RM de rodilla y devolver una probabilidad de rotura del LCA en segundos, lo que permitiria priorizar la lectura de los estudios con mayor probabilidad y reducir el tiempo hasta el diagnostico en servicios con carga asistencial alta.
- Segunda lectura asistida para radiologos: integrado en el visor PACS, el modelo genera probabilidad, pesos de atencion por corte y mapas Grad-CAM++ que el especialista puede revisar como apoyo a su propia lectura, no como sustituto.
- Control de calidad retrospectivo: procesar cohortes historicas de RM ya diagnosticadas para detectar discrepancias entre el informe radiologico y la prediccion del modelo, identificando casos susceptibles de revision.
- Seleccion de candidatos para artroscopia: dado que el modelo reporta analisis de curva de decision con beneficio neto en umbrales quirurgicos, puede emplearse como herramienta de estratificacion previa a la decision quirurgica, siempre con confirmacion clinica.
- Investigacion en imagen musculoesqueletica: la reproducibilidad de las metricas sobre el test bloqueado de Stanford MRNet y el ensembling de 5 pliegues lo hacen util como baseline comparable en estudios academicos sobre deteccion de patologia ligamentosa.
- Formacion de residentes: uso como sistema de referencia para contrastar la localizacion de la rotura en los mapas de activacion y en los pesos de atencion por corte, reforzando la ensenanza de la anatomia de la escotadura intercondilea.
- Preanotacion de datasets: generar etiquetas preliminares sobre nuevos volumenes de RM para acelerar el etiquetado manual por parte de radiologos expertos, con revision humana obligatoria posterior.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el conjunto de test bloqueado y oficial de Stanford MRNet (N=120 examenes: 54 roturas, 66 controles), con intervalos de confianza bootstrap del 95 % (1.000 iteraciones). Todas las metricas estan marcadas como no verificadas (`verified: false`) en el model-index.

| Metrica | ACL-LKNet (ensemble de 5 pliegues) | IC 95 % bootstrap | Baseline Stanford MRNet (Bien et al., 2018) | Delta absoluto |
|---|---|---|---|---|
| AUROC | 0,9639 | [0,9277; 0,9919] | 0,9370 | +0,0269 |
| AUPRC | 0,9293 | [0,8492; 0,9889] | No disponible | No disponible |
| Accuracy | 81,67 % | [75,00 %; 88,33 %] | 82,50 % | -0,0083 |
| Specificity | 93,94 % | [87,69 %; 98,59 %] | 96,80 % | -0,0286 |
| Sensitivity | 66,67 % | [53,22 %; 79,25 %] | 75,90 % | -0,0923 |
| F1-Score | 0,7660 | [0,6585; 0,8519] | No disponible | No disponible |
| Brier Score | 0,1184 | [0,0891; 0,1520] | No disponible | No disponible |

Prueba adicional declarada: test de DeLong pareado entre ConvNeXt-Tiny y ResNet-18, con z = 3,864 y p = 0,000104 (p < 0,001), a favor de campos receptivos grandes para estructuras ligamentosas elongadas.

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni de ningun otro benchmark de texto, al tratarse de un modelo de vision medica.

## Requisitos de hardware

- VRAM estimada para inferencia: no publicada por el autor. Como referencia orientativa basada en el tamano del checkpoint (repositorio de 0,1 GB) y en la entrada declarada de 72 imagenes de 224x224 por examen (3 planos x 24 cortes), se estima un consumo en el rango de 2 a 6 GB en FP32 y de 1 a 3 GB en FP16/AMP, dependiendo del tamano de lote de cortes. Estas cifras son estimaciones, no datos verificados.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM es suficiente para inferencia en un unico examen. Una NVIDIA RTX 3060, RTX 4060 o superior es adecuada; modelos de datacenter (A100, H100, L40S) solo se justifican para procesamiento por lotes de cohortes completas o para reentrenamiento.
- Cabe en GPU de consumo: si, el modelo esta pensado para caber en GPU de consumo. El backbone ConvNeXt-Tiny es un modelo pequeno y el checkpoint ocupa aproximadamente 100 MB.
- Opciones de despliegue: descarga del checkpoint mediante `huggingface_hub` e inferencia en PyTorch con la clase `create_model_from_config` (requiere el codigo fuente del repositorio, no incluido en el Hub). No se documentan pesos en GGUF ni safetensors, por lo que llama.cpp, Ollama y vLLM no son aplicables a este modelo. La exportacion a TorchScript u ONNX no esta documentada.
- Latencia y throughput: no disponibles. No se han publicado mediciones de latencia por examen ni de examenes por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | AUROC | Sensibilidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| ACL-LKNet | Backbone ConvNeXt-Tiny (aprox. 28,6 M solo el backbone; total no disponible) | 3 planos x 24 cortes x 224x224 px | 0,9639 | 66,67 % | MIT | Hugging Face, checkpoint .pt |
| Baseline Stanford MRNet (Bien et al., 2018) | No disponible | Volumenes de RM de rodilla | 0,9370 | 75,90 % | No disponible | Publicacion academica |
| ResNet-18 (comparado en el test de DeLong) | Aprox. 11,7 M (arquitectura estandar) | No disponible | No disponible (solo se reporta z = 3,864, p = 0,000104 frente a ConvNeXt-Tiny) | No disponible | No disponible | No disponible |
| Otros modelos de deteccion de rotura del LCA | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

La comparacion cuantitativa solo es posible frente al baseline de Bien et al. (2018): ACL-LKNet mejora el AUROC en 0,0269 puntos, pero obtiene peor exactitud (-0,0083), especificidad (-0,0286) y sensibilidad (-0,0923) que dicho baseline. No hay informacion disponible sobre otros modelos comparables en la documentacion proporcionada.

## Limitaciones y advertencias

- Sensibilidad limitada y clinicamente relevante: 66,67 % (IC 95 %: 53,22 %-79,25 %), inferior al 75,90 % del baseline de 2018. Esto implica una tasa de falsos negativos alta: aproximadamente una de cada tres roturas reales no se detectaria. No es aceptable como herramienta de cribado autonoma.
- Metricas no verificadas: el model-index marca explicitamente `verified: false` en todas las metricas. Los resultados proceden del propio autor y no han sido replicados por terceros.
- Cohortes de evaluacion pequenas: el test bloqueado de Stanford MRNet tiene N=120 examenes (54 roturas), lo que amplia los intervalos de confianza y limita la generalizacion a otras poblaciones, equipos de RM y protocolos de adquisicion.
- Validacion externa ausente: no se documenta validacion en cohortes independientes de otras instituciones ni en datos multi-centricos.
- Riesgo de sobreajuste a la distribucion del dataset: al entrenar y evaluar sobre Stanford MRNet, el rendimiento puede degradarse con secuencias, resoluciones, imanes o protocolos diferentes.
- Estado de publicacion: el articulo asociado se declara como preprint o protocolo de tesis doctoral (IEEE TMI / MedIA, 2026), sin evidencia de revision por pares.
- Sesgos potenciales: no se informa de la composicion demografica de las cohortes (edad, sexo, etnia), por lo que no puede descartarse un sesgo de representacion. No se documenta ningun analisis de equidad.
- Repositorio sin traccion: 0 descargas y 0 likes, sin issues ni validacion de la comunidad. Debe tratarse como un artefacto de investigacion, no como un modelo consolidado.
- Formato de pesos: el checkpoint es un archivo .pt cargado con `torch.load`, un formato basado en pickle que puede ejecutar codigo arbitrario. Se recomienda cargar unicamente desde la fuente oficial y con `weights_only=True` cuando sea posible.
- Codigo de inferencia no incluido: el ejemplo de la model card importa `src.config` y `src.models.acl_lknet`, modulos que no forman parte del repositorio de Hugging Face, por lo que el modelo no es directamente reproducible solo con el Hub.
- Enlaces a paper no funcionales: los badges de la model card apuntan a `https://github.com` como marcador de posicion, sin URL real del articulo ni del repositorio de codigo.
- Restricciones de licencia: la licencia MIT permite uso comercial, modificacion y redistribucion con atribucion y sin garantia. No obstante, cualquier uso clinico real en la Union Europea queda sujeto al Reglamento (UE) 2017/745 sobre productos sanitarios (MDR), y en Estados Unidos a la regulacion de la FDA; el modelo no dispone de marcado CE ni de autorizacion regulatoria.
- Uso previsto limitado: el propio autor lo presenta como resultado de investigacion academica. No debe usarse como dispositivo medico, ni para diagnostico definitivo, ni para decision terapeutica sin la supervision de un profesional cualificado.
- Idiomas: la documentacion solo esta en ingles; no hay version en castellano.
- Busqueda web sin resultados utiles: las consultas realizadas no devolvieron informacion relevante sobre el modelo, el articulo ni su repositorio de codigo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/shareefch1413/ACL-LKNet
- Dataset Stanford MRNet: https://stanfordmlgroup.github.io/projects/mrnet/
- Publicacion de referencia del benchmark: Bien, N. et al. (2018), "Deep-learning-assisted diagnosis for knee magnetic resonance imaging: Development and retrospective validation of MRNet", PLOS Medicine
- Repositorio de codigo del modelo: no disponible (no se proporciona URL funcional)
- Articulo o preprint: no disponible (el enlace de la model card apunta a un marcador de posicion `https://github.com`)
- Demo o Space: no disponible
- Licencia MIT: https://opensource.org/licenses/MIT
