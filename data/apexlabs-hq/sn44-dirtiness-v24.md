# apexlabs-hq/sn44-dirtiness-v24

## Resumen

`apexlabs-hq/sn44-dirtiness-v24` es un detector de objetos exportado a formato ONNX, concebido para identificar distintos tipos de suciedad en imagenes de interiores. El modelo se sirve mediante `miner.py` sobre el runtime `onnxruntime`, y su model card lo presenta explicitamente como el detector asociado al modelo `manako/Detect-room-dirtiness-detection`. No se trata, por tanto, de un modelo generativo ni de un LLM, sino de un componente de vision por computador orientado a una tarea de deteccion con cinco clases cerradas.

Las clases que detecta son derrame de liquido, papelera, residuos, moho y mancha. La inferencia se realiza con un tamano de imagen de entrada de 736 pixeles y umbrales de confianza diferenciados por clase, ademas de un mecanismo de supresion de duplicados entre clases basado en IoU. El repositorio tiene un tamano declarado de 0.0 GB y no registra descargas ni likes en el momento de la consulta.

La relevancia de esta ficha es limitada pero concreta: se trata de un artefacto de despliegue (un grafo ONNX con una configuracion de post-proceso muy especifica) pensado para integrarse en un pipeline de mineria o evaluacion, no para uso general. La informacion publica disponible es muy escasa: no hay licencia declarada, ni idiomas, ni pipeline de Hugging Face, ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (detector de objetos exportado a ONNX; la model card no especifica la familia) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no aplica; tarea de vision) |
| Licencia | no disponible |
| Formato de pesos | ONNX (servido con onnxruntime) |

Datos adicionales de configuracion declarados en la model card:

| Parametro | Valor |
|---|---|
| Clases | liquid spillage, bin, litter, mould, stain |
| Tamano de imagen de entrada (imgsz) | 736 |
| Umbral de confianza global | 0.05 |
| Umbrales por clase | {0: 0.2, 1: 0.27, 2: 0.28, 3: 0.15, 4: 0.23} |
| Supresion de duplicados entre clases (IoU) | 0.9 |
| Pares de clases con supresion cruzada | [(0, 3, 0.3), (0, 4, 0.3), (3, 4, 0.3)] |
| SHA256 de pesos | `93c4203ce9d9ae3599b9cc2d4476c3f10e15166a54261de531a185ee455c45c9` |
| Runtime de servicio | onnxruntime via `miner.py` |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo. La model card unicamente indica que se trata de un detector ONNX servido por `miner.py` mediante `onnxruntime`, y que esta asociado al modelo `manako/Detect-room-dirtiness-detection`. No se especifica si el backbone es una CNN tipo YOLO, un transformer de deteccion (DETR y variantes) u otra familia, ni se aportan datos sobre el numero de parametros, el dataset de entrenamiento, el numero de imagenes o si se aplicaron tecnicas de aumento de datos o ajuste fino.

La unica innovacion tecnica documentada es el esquema de post-proceso: umbrales de confianza por clase (mas bajos para moho y derrames, mas altos para papelera y residuos) y una supresion de duplicados entre clases concretas (derrame-moho, derrame-mancha, moho-mancha) con un IoU de 0.3, ademas de una supresion global de duplicados con IoU de 0.9. Este diseno sugiere que el modelo tiende a producir detecciones solapadas entre clases visualmente similares (manchas, moho y derrames comparten apariencia), y que el autor resolvio el conflicto en post-proceso en lugar de en el entrenamiento.

## Capacidades

- Deteccion de objetos en imagenes de interiores para cinco clases: derrame de liquido, papelera, residuos, moho y mancha.
- Inferencia sobre imagenes redimensionadas a 736 pixeles de lado.
- Post-proceso configurable con umbrales de confianza por clase.
- Supresion de duplicados intra-clase (IoU 0.9) e inter-clase para pares especificos (IoU 0.3).
- Despliegue via ONNX Runtime, lo que permite ejecucion en CPU y GPU sin dependencias de frameworks de entrenamiento.
- No se documentan capacidades de generacion de texto, razonamiento, codigo, matematicas, tool calling, agentes, multilingue, vision general, audio ni modo de razonamiento extendido.

## Casos de uso

- Inspeccion automatizada de limpieza en instalaciones: el detector puede procesar capturas de habitaciones y marcar la presencia de residuos, manchas o moho para priorizar tareas de limpieza. Es adecuado porque las cinco clases cubren los indicadores habituales de suciedad en interiores.
- Monitorizacion de estado de contenedores y papeleras: la clase `bin` permite localizar papeleras en la escena, util para inventariar su presencia y posicion en espacios controlados.
- Deteccion temprana de moho en viviendas o locales: el umbral bajo para la clase `mould` (0.15) favorece la sensibilidad ante indicios de moho, lo que encaja con un caso de alerta preventiva.
- Control de calidad en alquiler vacacional o gestion de activos: el modelo puede ejecutarse sobre fotos de checkout para verificar que no quedan derrames ni residuos antes de devolver la fianza.
- Automatizacion de revision de imagenes en pipelines de mineria o evaluacion: al servirse via `miner.py` y `onnxruntime`, se integra en flujos que ya consumen salidas ONNX sin necesidad de GPU dedicada.
- Pre-filtrado en sistemas de vision mas amplios: al ser un componente ligero en formato ONNX, puede actuar como primera etapa que descarta imagenes limpias y deriva solo las sospechosas a revision humana o a un modelo mayor.
- Analisis de imagenes en entornos con recursos limitados: la exportacion ONNX permite ejecucion en CPU, adecuada para dispositivos edge o servidores sin acelerador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Al no conocerse el numero de parametros ni el grafo ONNX, no es posible estimar el consumo de memoria.
- GPU recomendadas: no disponible. La model card no especifica requisitos de acelerador.
- Compatibilidad con GPU de consumo: no confirmada. El formato ONNX y el runtime `onnxruntime` permiten ejecucion en CPU, por lo que la inferencia es viable sin GPU, aunque no se documenta el rendimiento.
- Opciones de despliegue: ONNX Runtime mediante `miner.py` (unico metodo documentado). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un detector de vision de este tipo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables ni datos de rendimiento que permitan establecer una comparacion con otros detectores de suciedad o de objetos en interiores.

## Limitaciones y advertencias

- Informacion publica muy escasa: no hay licencia declarada, lo que impide determinar si el uso comercial esta permitido. Es un riesgo legal relevante antes de cualquier despliegue en produccion.
- No se documentan sesgos conocidos, pero al ser un detector entrenado sobre un dataset no especificado, es probable que su rendimiento se degrade en condiciones de iluminacion, angulos o tipos de interior distintos a los del entrenamiento.
- Riesgo de falsos positivos y negativos: los umbrales por clase son bajos (0.15-0.28), lo que favorece la sensibilidad a costa de la precision; la supresion inter-clase con IoU 0.3 sugiere confusion entre clases visualmente similares.
- No se especifica el dataset de entrenamiento ni el proceso de validacion, por lo que no hay garantias de generalizacion.
- El repositorio declara 0.0 GB de tamano, lo que puede indicar que los pesos no estan realmente alojados o que la medicion es incorrecta; conviene verificar la integridad mediante el SHA256 declarado.
- Sin descargas ni likes registrados, no hay evidencia de uso comunitario ni de validacion externa.
- El modelo esta ligado a un pipeline concreto (`miner.py`) y a un modelo de referencia (`manako/Detect-room-dirtiness-detection`); su uso fuera de ese contexto no esta documentado.
- No apto para tareas de texto, razonamiento, codigo o vision general: es exclusivamente un detector de cinco clases.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/apexlabs-hq/sn44-dirtiness-v24
- Modelo de referencia citado: `manako/Detect-room-dirtiness-detection` (no se proporciona URL directa en la informacion disponible)
- No se han encontrado en la busqueda web papers, blogs, repositorios ni demos adicionales.
