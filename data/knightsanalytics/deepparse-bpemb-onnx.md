# KnightsAnalytics/deepparse-bpemb-onnx

## Resumen

KnightsAnalytics/deepparse-bpemb-onnx es una conversión al formato ONNX del modelo de análisis (parsing) de direcciones postales de la librería deepparse, desarrollada originalmente por GRAAL-Research. Deepparse es una librería de aprendizaje profundo especializada en descomponer direcciones de varios países en sus componentes estructurados (calle, número, ciudad, código postal, provincia, país), tarea conocida como address parsing. El modelo concreto del repositorio emplea embeddings BPEmb (subword basados en byte-pair encoding) como representación de entrada.

El repositorio lo publica el usuario KnightsAnalytics y contiene únicamente una exportación a ONNX del modelo preentrenado bpemb-base de deepparse, con un tamaño de repositorio de 0,2 GB. No incluye model card descriptiva más allá de la licencia MIT, no declara resultados de benchmarks y no registra descargas ni interacciones en el momento de la consulta. Se trata, por tanto, de un artefacto de conversión de formato más que de un modelo nuevo entrenado desde cero.

Su relevancia es práctica: permite ejecutar el parser de direcciones de deepparse fuera de su stack Python nativo (PyTorch), integrándolo en runtimes de inferencia compatibles con ONNX como ONNX Runtime, lo que facilita el despliegue en producción con dependencias más ligeras. No es un modelo de propósito general ni un LLM: es un modelo discriminativo/generativo específico para etiquetado de secuencias de direcciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo seq2seq para etiquetado de secuencias basado en embeddings BPEmb, con mecanismo de atencion opcional segun la libreria deepparse (detalle exacto de la exportacion ONNX no disponible) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (artefacto distribuido en formato ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (deepparse declara soporte multinacional de direcciones, pero el repositorio no enumera idiomas) |
| Licencia | MIT |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

La librería deepparse, según su documentación oficial, implementa un parser de direcciones multinacional basado en aprendizaje profundo. Ofrece modelos preentrenados construidos sobre dos tipos de representaciones: FastText y BPEmb. Este repositorio corresponde a la variante BPEmb, que utiliza embeddings de subpalabras (byte-pair encoding) para representar las direcciones de entrada, y posteriormente aplica una arquitectura seq2seq para predecir las etiquetas de cada componente de la dirección. La documentación de deepparse menciona que los modelos pueden operar "con o sin mecanismo de atención".

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, si hubo etapas de RLHF/DPO (poco habituales en un modelo de parsing de este tipo) ni sobre innovaciones técnicas específicas de esta exportación. El único dato verificable sobre el artefacto es que es una conversión a ONNX del modelo bpemb-base de deepparse, presumiblemente generada exportando los pesos entrenados originales al grafo ONNX.

## Capacidades

- Análisis (parsing) de direcciones postales: descompone una dirección en campos estructurados como calle, número, ciudad, código postal, provincia y país.
- Etiquetado de secuencias a nivel de token sobre texto de direcciones.
- Soporte multinacional según las capacidades declaradas de la librería deepparse (idiomas concretos no documentados en este repositorio).
- Ejecución mediante runtimes ONNX (ONNX Runtime u otros compatibles con el estándar ONNX).
- Uso desde línea de comandos o desde código, heredado de la librería deepparse original.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, agentes, visión, audio ni modo de razonamiento explícito, ya que no es un modelo de propósito general.

## Casos de uso

- Normalización de bases de datos de direcciones: dado un campo de dirección de texto libre en un CRM o ERP, el modelo lo segmenta en componentes estructurados para poblar columnas normalizadas (calle, número, ciudad, código postal), mejorando la calidad del dato.
- Validación de direcciones en formularios de e-commerce: al recibir una dirección introducida por el usuario, el parser la descompone y permite comprobar que los campos obligatorios están presentes antes de confirmar un envío.
- Enriquecimiento de datos logísticos: en pipelines de envíos, extraer sistemáticamente la ciudad y el código postal de direcciones heterogéneas para enrutar paquetes y calcular zonas de reparto.
- Geolocalización y geocodificación previas: como paso anterior a llamar a una API de geocodificación, el parser separa los componentes de la dirección, lo que permite consultar cada campo por separado y aumentar la tasa de acierto.
- Deduplicación de registros de clientes: al normalizar las direcciones a una estructura fija, se facilita la detección de registros duplicados que escriben la misma dirección de formas distintas.
- Despliegue en entornos con restricciones de dependencias: al estar en formato ONNX, puede integrarse en servicios que ya usan ONNX Runtime sin necesidad de instalar PyTorch completo, reduciendo el tamaño de la imagen de contenedor.
- Procesamiento por lotes offline: uso en trabajos batch para limpiar y estructurar grandes volúmenes de direcciones almacenadas históricamente en formato no estructurado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Dado que el repositorio completo ocupa 0,2 GB, la huella del modelo es pequeña y es probable que se ejecute en CPU sin GPU dedicada, aunque este extremo no está confirmado en la documentación del repositorio.
- GPU recomendadas: no disponible. Por el tamaño del artefacto, no requiere GPUs de gama alta como A100 o H100.
- Compatibilidad con GPU de consumo: no confirmada, pero por tamaño (0,2 GB de repositorio) es esperable que quepa en cualquier GPU de consumo, e incluso que no necesite GPU.
- Opciones de despliegue: ONNX Runtime (formato nativo), y en general cualquier runtime compatible con ONNX. También puede usarse a través de la librería deepparse original en Python.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Formato | Tarea | Licencia | Disponibilidad | Contexto / tamanos |
|---|---|---|---|---|---|
| KnightsAnalytics/deepparse-bpemb-onnx | ONNX | Parsing de direcciones (BPEmb) | MIT | HuggingFace (0 descargas, 0 likes) | Repo 0,2 GB; resto no disponible |
| deepparse/bpemb-base | Pesos de deepparse (PyTorch) | Parsing de direcciones (BPEmb) | MIT (segun deepparse) | HuggingFace | no disponible |
| Modelo FastText de deepparse | Pesos de deepparse (PyTorch) | Parsing de direcciones (FastText) | MIT (segun deepparse) | Distribuido con la libreria deepparse | no disponible |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Modelo de propósito específico: solo realiza parsing de direcciones; no sirve para generación de texto general, código, matemáticas ni otras tareas de un LLM.
- Sin model card técnica: el repositorio no documenta arquitectura exacta, parámetros, contexto ni dataset de entrenamiento, lo que dificulta la evaluación rigurosa.
- Idiomas no documentados: aunque deepparse declara soporte multinacional, este repositorio no enumera los idiomas cubiertos, por lo que no se puede garantizar el comportamiento en un país concreto.
- Riesgo de errores en direcciones ambiguas, incompletas o con formatos poco frecuentes; no se han publicado métricas de precisión para esta exportación.
- Sin evidencia de uso en producción: 0 descargas y 0 likes en el momento de la consulta; conviene validar el artefacto con un conjunto de direcciones propio antes de desplegarlo.
- Licencia MIT: permite uso comercial y modificación, pero se recomienda verificar también la licencia del modelo original de deepparse y de las dependencias (por ejemplo, embeddings BPEmb) antes de un uso comercial.
- Posible deriva respecto al modelo original: al ser una conversión a ONNX, hay que comprobar que las salidas coinciden con las del modelo de referencia en PyTorch.

## Enlaces

- HuggingFace: https://huggingface.co/KnightsAnalytics/deepparse-bpemb-onnx
- Modelo base de referencia en HuggingFace: https://huggingface.co/deepparse/bpemb-base
- Documentación de deepparse: https://deepparse.org/
- Documentación del parser de deepparse: https://deepparse.org/parser.html
- Repositorio GitHub de deepparse (GRAAL-Research): https://github.com/GRAAL-Research/deepparse
- ONNX Model Zoo: https://github.com/onnx/models
