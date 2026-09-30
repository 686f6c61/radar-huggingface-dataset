# mdagosta/waldito-python-basics-v1-r0004-u2-mdagosta-b

## Resumen

El modelo `mdagosta/waldito-python-basics-v1-r0004-u2-mdagosta-b` es un export de la familia OpenWALDO publicado por el usuario mdagosta en HuggingFace. Se trata de un modelo causal de generación de texto que reutiliza la arquitectura Llama estándar de la librería Transformers, pero con un tokenizador propio de bytes denominado schema-1, que obliga a cargar el tokenizer con `trust_remote_code=True`. El repositorio incluye además un inventario de ficheros (`BOM.json`) y un mapeo de divulgación de contenido de entrenamiento alineado con el reglamento europeo de IA (`EU-BOM.json`).

El tamaño real declarado en los ficheros safetensors es de 9.541.632 parámetros, es decir, unos 9,5 millones, lo que lo sitúa en la categoría de modelos ultraligeros, muy por debajo de los modelos de 1B-3B habituales en despliegues locales. Con ese tamaño, el modelo está pensado para tareas de prototipado, experimentación educativa y validación de pipelines más que para producción de alta calidad. El nombre del repositorio sugiere un entrenamiento orientado a fundamentos de Python, aunque la model card no lo confirma explícitamente.

La relevancia actual del modelo es limitada pero concreta: sirve como ejemplo de export reproducible con trazabilidad de componentes (BOM) y cumplimiento normativo europeo, y como banco de pruebas para integraciones con Transformers, TGI y endpoints compatibles. No hay datos publicados de benchmarks, licencia ni idiomas soportados, lo que restringe su uso comercial sin una verificación previa por parte del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal tipo Llama (libreria Transformers) |
| Parametros totales | 9.541.632 (~9,5 M) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tokenizer | schema-1 de bytes de OpenWALDO (requiere `trust_remote_code=True`) |
| Pipeline | text-generation |
| Libreria | transformers |
| Tamano del repositorio | 0.0 GB (segun HuggingFace) |
| Fecha de creacion | 2026-09-30 |
| Ultima actualizacion | 2026-09-30 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La model card indica que el paquete utiliza la arquitectura causal-language-model Llama estándar incluida en Transformers, sin modificaciones declaradas de atención, capas o normalización. La particularidad principal es el tokenizador: se trata de un tokenizador de bytes schema-1 propio de OpenWALDO, en lugar de un tokenizador BPE/SentencePiece convencional. Esto implica que la tokenización no es compatible con los tokenizadores Llama habituales y que es obligatorio activar `trust_remote_code=True` para cargarlo, lo que supone ejecutar código remoto durante la carga.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF, DPO u otras técnicas de alineamiento, ni sobre innovaciones técnicas como decodificación especulativa o atención lineal. El repositorio incluye `BOM.json`, que inventaría cada fichero de la release, y `EU-BOM.json`, que contiene el mapeo de divulgación de contenido de entrenamiento según el regimen europeo de modelos de propósito general (GPAI). Estos artefactos apuntan a un esfuerzo de trazabilidad y cumplimiento normativo, pero la model card no detalla su contenido.

Con 9,5 millones de parámetros, el modelo es demasiado pequeño para haber absorbido conocimiento factual amplio o capacidades de razonamiento robustas. Es razonable esperar un comportamiento de modelo de lenguaje de n-gramas neuronales, útil para experimentación pero propenso a incoherencias en generaciones largas.

## Capacidades

- Generacion de texto causal: el pipeline declarado es `text-generation`, con el tag `conversational`, lo que indica uso previsto en diálogo y continuación de texto.
- Formato conversacional: los tags incluyen `conversational`, aunque no se especifica la plantilla de chat ni los tokens especiales de turno.
- Tokenizacion a nivel de byte: el tokenizador schema-1 permite representar cualquier secuencia de bytes, lo que en teoría evita tokens fuera de vocabulario (`<unk>`), a costa de secuencias más largas.
- Compatibilidad con text-generation-inference: el tag `text-generation-inference` y `endpoints_compatible` sugiere que el modelo puede servirse con TGI y a través de Inference Endpoints, siempre que el tokenizer remoto se resuelva.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (los idiomas no están declarados).
- Vision, audio o modo thinking: no disponible; el modelo es exclusivamente de texto.
- Orientacion a Python: el nombre del repositorio sugiere entrenamiento sobre fundamentos de Python, pero no está confirmado en la model card.

## Casos de uso

- Prototipado de pipelines de generacion de texto: por su tamano de 9,5 M de parametros, permite iterar en segundos sobre la carga, el preprocesado y el postprocesado sin consumir GPU, ideal para validar una arquitectura de servicio antes de escalar a un modelo mayor.
- Pruebas de integracion con text-generation-inference: al estar etiquetado como compatible con TGI y endpoints, sirve para verificar configuraciones de despliegue, health checks y contratos de API sin coste de computo relevante.
- Validacion de tokenizadores personalizados: al usar el tokenizador de bytes schema-1 con `trust_remote_code=True`, es un banco de pruebas para comprobar como se comporta un tokenizer no estandar en pipelines de HuggingFace, TGI o vLLM.
- Educacion y docencia sobre LLM: su tamano permite entrenar, inspeccionar y modificar pesos en un portatil, lo que lo hace util para explicar atención, embeddings y decodificacion autoregresiva en cursos.
- Generacion de fragmentos de codigo Python triviales: si el entrenamiento esta efectivamente orientado a fundamentos de Python, puede emplearse para autocompletar lineas sencillas o ejemplos didacticos, siempre con revision humana y sin expectativas de correccion en problemas complejos.
- Despliegue en entornos con recursos minimos: cabe en CPU, Raspberry Pi o moviles, por lo que puede integrarse en demos offline o en dispositivos sin acelerador.
- Pruebas de trazabilidad y cumplimiento normativo: los ficheros `BOM.json` y `EU-BOM.json` permiten experimentar con flujos de auditoria de modelos y documentacion exigida por el reglamento europeo de IA.
- Generacion de datos sinteticos de baja calidad para tests: util para poblar entornos de pruebas con texto plausible sin recurrir a APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en cualquier precision. En FP32, 9,54 M de parametros ocupan aproximadamente 38 MB; en FP16, unos 19 MB; en INT8, unos 9,5 MB; en INT4, unos 5 MB. A ello hay que sumar el estado del tokenizador y el overhead del runtime.
- GPU recomendadas: cualquier GPU con al menos 1 GB de memoria libre es suficiente, incluidas GTX 1050, RTX 3060, RTX 4090, A100 o H100. El modelo no aprovechara estas GPUs por tamano, salvo en escenarios de batching masivo.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo de los ultimos diez anos, y tambien en CPU, Raspberry Pi 4/5 y dispositivos moviles.
- Opciones de despliegue: Transformers con `trust_remote_code=True` para el tokenizer, text-generation-inference (segun los tags), endpoints compatibles e integraciones que respeten el formato de pesos safetensors. La compatibilidad con llama.cpp, Ollama o vLLM no esta confirmada y depende de que el tokenizador de bytes pueda exportarse a GGUF.
- Latencia y throughput estimados: no disponibles. Dado el tamano, en CPU moderna se espera una latencia de milisegundos por token, aunque no hay mediciones publicadas.

## Comparativa con modelos similares

La comparativa se establece con modelos de escala reducida ampliamente conocidos, cuyos datos provienen de sus respectivas model cards publicas. No existen datos de rendimiento publicados para el modelo objeto de esta ficha, por lo que la columna de benchmarks queda como no disponible.

| Modelo | Parametros | Contexto | Licencia | Formato | Rendimiento publicado |
|---|---|---|---|---|---|
| waldito-python-basics-v1-r0004-u2-mdagosta-b | 9,5 M | no disponible | no disponible | safetensors | no disponible |
| TinyLlama-1.1B (referencia) | 1,1 B | 2.048 tokens | Apache-2.0 | safetensors, GGUF | si, en su model card |
| Qwen2.5-0.5B (referencia) | 0,49 B | 32.768 tokens | Apache-2.0 | safetensors, GGUF | si, en su model card |
| SmolLM2-135M (referencia) | 135 M | 8.192 tokens | Apache-2.0 | safetensors, GGUF | si, en su model card |

El modelo de mdagosta es aproximadamente dos ordenes de magnitud mas pequeno que las alternativas de referencia, carece de licencia declarada y no publica resultados de evaluacion. Por ello, la comparacion debe interpretarse como estructural y no competitiva.

## Limitaciones y advertencias

- Licencia no declarada: sin una licencia explicita, no hay autorizacion clara para uso comercial, redistribucion o modificacion. Es imprescindible contactar con el autor antes de cualquier uso en produccion.
- Idiomas no declarados: no es posible saber si el modelo soporta castellano, ingles u otros idiomas, ni con que calidad.
- Riesgo elevado de alucinacion: con 9,5 M de parametros, la capacidad de retener hechos es muy limitada; cualquier salida factual debe verificarse.
- Contexto desconocido: se desconoce la longitud maxima de contexto, lo que impide planificar conversaciones multi-turno o documentos largos.
- Tokenizador no estandar: el uso de un tokenizador de bytes schema-1 implica que herramientas, contadores de tokens y plantillas de chat convencionales pueden no funcionar directamente.
- `trust_remote_code=True`: la carga del tokenizer ejecuta codigo remoto del repositorio. En entornos de produccion conviene auditar ese codigo y fijar una revision concreta del repositorio.
- Sesgos desconocidos: no hay informacion sobre la composicion del dataset de entrenamiento (mas alla del mapeo `EU-BOM.json`, no detallado en la model card), por lo que no se pueden evaluar sesgos de genero, raza, religion u orientacion politica.
- Sin benchmarks ni evaluaciones de seguridad publicadas: no hay evidencia de filtrado de contenido toxico, alineamiento con instrucciones ni robustez frente a prompts adversarios.
- Descargas y likes a cero: el modelo no tiene validacion por parte de la comunidad, lo que incrementa el riesgo de errores no documentados.
- Tamano del repositorio de 0.0 GB: puede indicar que los pesos no estan efectivamente alojados en el momento de la consulta; conviene verificar la integridad de los ficheros antes de integrarlo.

## Enlaces

- HuggingFace: https://huggingface.co/mdagosta/waldito-python-basics-v1-r0004-u2-mdagosta-b
- No se han encontrado en la busqueda web articulos, papers, repositorios o demos relacionados con el modelo, OpenWALDO o su tokenizador schema-1. Los resultados devueltos por la busqueda no guardan relacion con el modelo y se han descartado.
