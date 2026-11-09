# Mikecode123/walnut

## Resumen

Walnut es un conjunto de tres modelos de aprendizaje profundo publicados por el usuario Mikecode123 en Hugging Face, orientados a la modelizacion multimodal e interpretable de la progresion del cancer de prostata. El repositorio no contiene un modelo de lenguaje ni un transformer generativo, sino tres artefactos independientes en formato PyTorch (`.pt`): un par de codificadores DenseNet121 para imagenes de histopatologia (H&E) e inmunohistoquimica (IHC: p63, 34βE12, AMACR), un perceptron multicapa (MLP) sobre caracteristicas fitoquimicas cuantitativas del aceite de semilla de *Plukenetia conophora* (nuez africana) y un modelo de fusion que combina ambas modalidades.

El objetivo declarado es clasificar muestras histopatologicas en tres estados biologicos: Normal (estado 0), Partial_Restoration (estado 1) e Induced_Neoplastic (estado 2). La propuesta es relevante como ejemplo de investigacion aplicada en patologia computacional de bajo presupuesto, pero su alcance es muy limitado: no hay model card completa, no se documentan datos de entrenamiento, metricas ni procedencia de las muestras, y el repositorio apenas ocupa 0,2 GB.

No se dispone de informacion sobre arquitectura detallada mas alla de la eleccion de DenseNet121 y un MLP, ni sobre el tamano de los conjuntos de entrenamiento, el numero de parametros o el contexto de uso clinico previsto. Cualquier evaluacion debe tratarse como preliminar y no apta para uso clinico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DenseNet121 (imagen) + MLP (molecular) + modelo de fusion |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos PyTorch `.pt`, sin versiones GGUF/ONNX publicadas) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (`.pt`) |

## Arquitectura y entrenamiento

El repositorio incluye tres ficheros: `best_densenet121_image_model.pt`, que contiene codificadores DenseNet121 para las modalidades H&E e IHC; `best_molecular_mlp.pt`, un MLP que opera sobre cinco caracteristicas fitoquimicas cuantitativas (flavonoide 14,30 mg/ml; alcaloide 4,07 mg/ml; terpenoide 2,57 mg/ml; fenol 1,80 mg/ml; esteroide 0,22 mg/ml); y `best_fusion_model.pt`, que integra las representaciones de imagen y moleculares para producir la clasificacion final en los tres estados biologicos.

No se especifica el numero de tokens, el volumen del dataset de imagenes, la resolucion de las tinciones, la estrategia de aumento de datos, ni si se aplicaron tecnicas de regularizacion, validacion cruzada o calibracion. Tampoco se documenta si el entrenamiento fue supervisado de extremo a extremo o por etapas, ni como se seleccionaron los hiperparametros. La unica innovacion tecnica declarada es el caracter interpretable y multimodal del pipeline (integracion de histologia, IHC y perfil fitoquimico), pero no se aportan mecanismos concretos de interpretabilidad (mapas de atencion, Grad-CAM, SHAP) en la informacion disponible.

## Capacidades

- Clasificacion de imagenes histopatologicas H&E en tres estados biologicos (Normal, Partial_Restoration, Induced_Neoplastic).
- Clasificacion de imagenes de inmunohistoquimica con marcadores p63, 34βE12 y AMACR.
- Procesamiento de un vector de cinco caracteristicas fitoquimicas cuantitativas mediante MLP.
- Fusion multimodal de caracteristicas de imagen y moleculares.
- Inferencia offline con PyTorch y descarga via `huggingface_hub`.
- No soporta generacion de texto, tool calling, agentes, razonamiento multi-paso ni capacidades multilingues.
- No incluye vision general (solo dominio histopatologico), audio ni modo thinking.

## Casos de uso

- Investigacion en patologia computacional: usar los codificadores DenseNet121 como linea base para clasificar tinciones H&E e IHC en estudios de progresion tumoral, comparando con arquitecturas mas recientes.
- Analisis exploratorio de marcadores IHC: evaluar la coherencia entre la prediccion del modelo y la lectura de patologo en p63, 34βE12 y AMACR como ejercicio de validacion interna.
- Docencia y prototipado: servir de ejemplo reproducible de pipeline multimodal (imagen + vector tabular) para cursos de aprendizaje profundo aplicado a biomedicina.
- Integracion de datos fitoquimicos: estudiar como el MLP sobre flavonoides, alcaloides, terpenoides, fenoles y esteroides modula la prediccion final en el modelo de fusion.
- Prueba de concepto de fusion multimodal: emplear `best_fusion_model.pt` como referencia para disenar arquitecturas de fusion temprana o tardia en proyectos propios.
- Reproducibilidad metodologica: usar los tres checkpoints como punto de partida para replicar experimentos y documentar resultados en publicaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precision; DenseNet121 ronda los 8 millones de parametros por codificador, por lo que la inferencia cabe holgadamente en GPUs consumer de 4-8 GB.
- GPU recomendadas: cualquier GPU NVIDIA con al menos 4 GB (GTX 1650, RTX 3050, RTX 4090) o CPU para inferencia puntual.
- Cabe en GPU consumer: si, previsiblemente en la mayoria de modelos con 4 GB o mas, aunque no se aportan mediciones.
- Opciones de despliegue: PyTorch nativo, TorchScript o exportacion a ONNX (no se incluyen artefactos preexportados); no hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Walnut (Mikecode123) | DenseNet121 + MLP + fusion | no disponible | no aplica | Apache 2.0 | Hugging Face |
| Modelos de patologia computacional tipo CNN (p. ej. ResNet50 en histologia) | CNN | ~25 M | no aplica | variable | Amplia |
| Modelos fundacionales de patologia (p. ej. UNI, Virchow) | ViT | cientos de millones | no aplica | variable, a menudo restringida | Hugging Face / acceso bajo solicitud |
| Encoders multimodales clinicos genericos | Transformer | variable | variable | variable | variable |

No se dispone de comparaciones cuantitativas publicadas entre Walnut y alternativas; la comparativa es cualitativa y basada en la categoria de tarea.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no puede usarse para generacion de texto, chat, codigo ni tareas de NLP.
- Ausencia total de documentacion sobre datos de entrenamiento, procedencia de muestras, comite etico y validacion externa.
- Riesgo elevado de sobreajuste y de sesgo de dominio: el modelo se entrena con muestras concretas y no hay evidencia de generalizacion a otras cohortes o centros.
- No apto para uso clinico ni diagnostico; cualquier aplicacion medica requeriria validacion regulatoria y supervision profesional.
- Solo se documentan tres estados biologicos y cinco caracteristicas fitoquimicas, lo que limita su aplicabilidad fuera de ese diseno experimental.
- La licencia Apache 2.0 permite uso comercial, pero la falta de garantias y de trazabilidad de datos desaconseja su uso en produccion.
- El repositorio tiene 0 descargas y 0 likes, sin senales de adopcion o revision por la comunidad.
- No se publican metricas de sensibilidad, especificidad, AUC ni intervalos de confianza.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Mikecode123/walnut
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la busqueda web proporcionada.
