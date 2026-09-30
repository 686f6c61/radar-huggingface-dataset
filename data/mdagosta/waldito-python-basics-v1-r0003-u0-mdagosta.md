# mdagosta/waldito-python-basics-v1-r0003-u0-mdagosta

## Resumen

El modelo `mdagosta/waldito-python-basics-v1-r0003-u0-mdagosta` es un modelo de generacion de texto publicado por el usuario mdagosta en Hugging Face, identificado por el propio autor como un "export" del proyecto OpenWALDO. Se trata de un modelo causal de arquitectura Llama estandar en formato Transformers, con solo 9.541.632 parametros totales (confirmados a partir de los pesos en safetensors), lo que lo situa en la categoria de modelos ultraligeros. El nombre del repositorio sugiere un ajuste orientado a conceptos basicos de Python, aunque esta interpretacion no esta confirmada de forma explicita en la model card.

El aspecto mas distintivo no es el tamano, sino el tokenizador: segun el autor, emplea el tokenizador de bytes "schema-1" de OpenWALDO, que requiere cargarse con `trust_remote_code=True`. Se trata de una eleccion poco habitual, ya que sustituye el tokenizador BPE tiptico de los modelos Llama por un esquema de bytes propio, lo que obliga a ejecutar codigo remoto y anade una dependencia critica para cualquier despliegue en produccion.

La relevancia de esta ficha es mas documental que practica: es un modelo con 0 descargas y 0 "likes" en el momento de redactarla, sin licencia declarada, sin idiomas declarados, sin benchmarks publicados y con un repositorio de tamano practicamente nulo. Resulta util como ejemplo de exportacion reproducible (incluye inventario `BOM.json` y mapeo de divulgacion de contenido de entrenamiento para el GPAI europeo en `EU-BOM.json`) mas que como modelo listo para uso industrial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal tipo Llama (arquitectura estandar de Transformers) |
| Parametros totales | 9.541.632 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se confirman pesos safetensors sin cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tokenizador | OpenWALDO schema-1 (tokenizador de bytes, requiere `trust_remote_code=True`) |
| Libreria | transformers |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

El autor indica que el paquete utiliza la arquitectura estandar de modelo de lenguaje causal Llama de Transformers, sin mencionar modificaciones estructurales (no se declara MoE, SSM, hibrido ni atencion lineal). El unico elemento diferenciador declarado es el tokenizador: un esquema de bytes propio de OpenWALDO denominado "schema-1", que se aparta del tokenizador BPE convencional de la familia Llama. Esto implica que el modelo no puede cargarse con un tokenizador estandar de Hugging Face y exige `trust_remote_code=True`, con el consiguiente riesgo de ejecucion de codigo no auditado.

No hay informacion publica sobre el numero de tokens de entrenamiento, la composicion del dataset, si hubo fases de RLHF, DPO o instruccion supervisada, ni sobre el proceso de destilacion o poda que explicaria un tamano de tan solo 9,5 millones de parametros. El repositorio incluye dos artefactos de trazabilidad relevantes: `BOM.json`, que inventaria todos los ficheros de la release, y `EU-BOM.json`, que contiene el mapeo de divulgacion de contenido de entrenamiento exigido por el reglamento europeo de IA para modelos de proposito general (GPAI). Estos ficheros no se han podido consultar en el texto disponible, por lo que su contenido concreto queda como no disponible.

## Capacidades

- Generacion de texto causal autoregresiva, segun el pipeline declarado (`text-generation`).
- Orientacion tematica a fundamentos de Python, inferida del nombre del repositorio (`python-basics`), no confirmada en la model card.
- Soporte conversacional declarado mediante la etiqueta `conversational`.
- Compatibilidad declarada con Text Generation Inference y con endpoints compatibles (`text-generation-inference`, `endpoints_compatible`).
- Capacidad de tool calling o function calling: no disponible.
- Capacidad de agentes o razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (no se declaran idiomas).
- Capacidades multimodales (vision, audio): no disponibles.

## Casos de uso

- Experimentacion educativa con tokenizadores de bytes: el modelo permite estudiar como se comporta un Transformer causal cuando se le acopla un tokenizador de bytes tipo schema-1 en lugar de un BPE convencional, en un entorno de laboratorio con recursos minimos.
- Pruebas de integracion de extremo a extremo en pipelines de Hugging Face: al ser un modelo de 9,5 millones de parametros y formato safetensors, sirve para validar cadenas de despliegue (`transformers`, TGI) sin consumir GPU.
- Generacion de ejemplos de codigo Python a nivel introductorio: por su nombre y tamano, encaja en tareas de autocompletado de fragmentos muy cortos y sintacticamente simples, siempre que se validen manualmente las salidas.
- Docencia sobre trazabilidad normativa de IA: los ficheros `BOM.json` y `EU-BOM.json` lo convierten en un caso practico para explicar inventarios de software y divulgacion de contenido de entrenamiento bajo el reglamento europeo.
- Pruebas unitarias de infraestructura de inferencia: su tamano permite levantar el modelo en CPU para verificar contenedores, rutas de modelos y configuracion de `trust_remote_code` antes de desplegar modelos mayores.
- Investigacion sobre sobreajuste en corpus muy pequenos: con 9,5 millones de parametros y un dominio declarado acotado, es un sujeto util para estudiar memorizacion y degradacion de perplexidad fuera de dominio.
- Demostraciones en dispositivos sin GPU: cabe en memoria de un telefono o una Raspberry Pi, lo que permite prototipos de generacion de texto totalmente locales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tablas de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, y no se dispone de resultados de terceros para un modelo de 9,5 millones de parametros con tokenizador propietario.

## Requisitos de hardware

- VRAM estimada para inferencia (calculo aritmetico a partir de los parametros confirmados):
  - FP32: aproximadamente 38 MB de pesos.
  - FP16/BF16: aproximadamente 19 MB de pesos.
  - Int8: aproximadamente 10 MB de pesos.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es sobradamente suficiente; se puede ejecutar tambien en CPU sin dificultad.
- Cabe en GPU de consumo: si, en cualquier modelo (RTX 3060, RTX 4090, GTX serie 10 o superior) e incluso en GPU integradas.
- Opciones de despliegue: `transformers` (libreria declarada), Text Generation Inference (etiqueta declarada) y endpoints compatibles. No hay confirmacion de soporte GGUF, llama.cpp, Ollama ni vLLM.
- Latencia y throughput estimados: no disponibles. Con este numero de parametros, la latencia estara dominada por la sobrecarga de carga y de comunicacion mas que por el calculo del modelo.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada. Los modelos abiertos de tamano mas proximo que se suelen usar como referencia (por ejemplo, la familia TinyLlama, con alrededor de 1.100 millones de parametros) son dos ordenes de magnitud mayores, por lo que una comparacion directa carece de sentido sin benchmarks publicados de este modelo.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| waldito-python-basics-v1-r0003-u0-mdagosta | 9.541.632 | no disponible | no disponible | Hugging Face (0 descargas) |
| Modelos comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles. No hay documentacion sobre composicion del dataset ni sobre evaluaciones de sesgo.
- Riesgo de alucinacion: previsiblemente alto. Con 9,5 millones de parametros y, presumiblemente, un corpus de entrenamiento acotado a fundamentos de Python, la capacidad de generar hechos verificables es muy limitada.
- Ausencia de benchmarks: no existe ninguna evaluacion publicada que permita estimar su calidad real, lo que impide justificar su uso en produccion.
- Dependencia de codigo remoto: el tokenizador exige `trust_remote_code=True`, lo que implica ejecutar codigo del autor del repositorio en el entorno de inferencia. Es un riesgo de seguridad que debe auditarse antes de cualquier despliegue.
- Licencia no declarada: sin licencia explicita, no hay autorizacion clara para uso comercial ni para redistribucion. Debe contactarse con el autor antes de cualquier uso fuera de la experimentacion privada.
- Idiomas no declarados: no se puede asumir un rendimiento aceptable en castellano ni en ningun otro idioma concreto.
- Longitud de contexto no declarada: imposible planificar cargas de trabajo que dependan de ventanas largas.
- Repositorio sin adopcion: 0 descargas y 0 "likes" en el momento de la consulta, sin senales de mantenimiento ni de comunidad que respalde el modelo.
- Trazabilidad temporal dudosa: las fechas de creacion y actualizacion registradas (2026-09-30) son posteriores a la fecha habitual de publicacion, lo que conviene verificar directamente en Hugging Face.
- No apto para produccion: por tamano, falta de licencia, falta de benchmarks y dependencia de tokenizador propietario, se desaconseja su uso en sistemas con usuarios reales.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/mdagosta/waldito-python-basics-v1-r0003-u0-mdagosta
- Variante relacionada del mismo autor: https://huggingface.co/mdagosta/waldito-python-basics-v1-r0000-merge
- Perfil de GitHub del proyecto Waldito: https://github.com/Waldito-1/
- Inventario de la release (`BOM.json`): https://huggingface.co/mdagosta/waldito-python-basics-v1-r0003-u0-mdagosta/blob/main/BOM.json (ruta inferida del nombre indicado en la model card; no verificada)
- Mapeo de divulgacion GPAI de la UE (`EU-BOM.json`): https://huggingface.co/mdagosta/waldito-python-basics-v1-r0003-u0-mdagosta/blob/main/EU-BOM.json (ruta inferida del nombre indicado en la model card; no verificada)
- Paper o documentacion tecnica de OpenWALDO: no disponible
