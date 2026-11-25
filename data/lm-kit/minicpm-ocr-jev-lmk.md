# lm-kit/minicpm-ocr-jev-lmk

## Resumen

MiniCPM-OCR-Jev es un modelo de decisión (judge) especializado en la verificación de resultados de OCR. No genera texto: recibe la imagen original de una región (texto, fórmula o tabla) y una imagen renderizada a partir del texto candidato producido por un sistema de OCR, y emite una puntuación entre 0 y 1 que indica la consistencia entre ambas. Lo desarrolla OpenBMB y esta versión concreta la empaqueta lm-kit para su SDK de IA on-device para .NET (LM-Kit.NET) y para LM-Kit One.

El modelo resuelve un problema acotado pero crítico en pipelines documentales: detectar automáticamente errores de reconocimiento sin intervención humana. Al comparar la región original con una renderización fiel del texto candidato, actúa como filtro de calidad aguas abajo del OCR. Su naturaleza multimodal (procesa dos imágenes y un texto) y su salida puramente numérica lo diferencian de los modelos generativos de propósito general.

La versión publicada por lm-kit pesa 3,9 GB en el repositorio e incluye los pesos en GGUF cuantizados a Q4_K_M junto con el proyector de visión en F16. El modelo base cuenta con aproximadamente 1.880 millones de parámetros según los safetensors del repositorio original. La licencia es Apache 2.0 y los idiomas declarados son inglés y chino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con proyector de vision (modelo base MiniCPM-OCR-Jev) |
| Parametros totales | 1.881.829.184 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (GGUF y archivo .lmk); proyector de vision en F16 |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF, .lmk (archivo empaquetado de LM-Kit) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base mas alla de que se trata de un modelo multimodal que procesa imagenes y texto y que incorpora un proyector de vision separado (publicado como `mmproj-model-f16.gguf`). El modelo esta disenado como clasificador de decisiones: recibe dos imagenes (la region original y la renderizacion del texto candidato) junto con el texto OCR y produce una puntuacion de consistencia entre 0 y 1, sin generar tokens de texto libre.

No se han proporcionado en la informacion disponible datos sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO. La model card remite a la model card original de OpenBMB para los detalles de entrenamiento y la evaluacion de los autores. La innovacion principal es el planteamiento como tarea de verificacion multimodal (zero-shot-classification) en lugar de generacion, lo que reduce el coste de inferencia y evita el riesgo de alucinacion textual en la salida.

## Capacidades

- Verificacion de OCR: puntua de 0 a 1 la consistencia entre una region de imagen y el texto OCR candidato.
- Soporte de tres tipos de region: texto, formulas y tablas.
- Procesamiento multimodal: compara la imagen original con una imagen renderizada a partir del texto candidato.
- Salida puramente numerica (score), sin generacion de texto.
- Clasificacion zero-shot segun el pipeline declarado.
- Multilingue limitado a ingles y chino.
- Capacidad de decision (decision-model) integrable en flujos automatizados de control de calidad.
- No soporta tool calling, agentes ni razonamiento multi-paso: su funcion es exclusivamente la evaluacion de consistencia OCR.

## Casos de uso

- Control de calidad en pipelines de digitalizacion documental: tras el OCR de cada bloque de texto, el modelo puntua la consistencia y permite descartar o marcar para revision humana los fragmentos con score bajo, reduciendo el coste de revision manual.
- Verificacion de extraccion de tablas: en procesos de conversion de PDF a datos estructurados, el modelo valida que la renderizacion de la tabla extraida coincide con la region original antes de aceptar la estructura.
- Validacion de formulas en documentos cientificos o financieros: detecta errores de transcripcion de formulas matematicas comparando la region original con el render del LaTeX o texto candidato.
- Integracion en SDK .NET on-device: aplicaciones de escritorio o servidores .NET pueden cargar el modelo via LM-Kit (`minicpm-ocr-jev`) y ejecutar la verificacion localmente sin enviar documentos a servicios externos, util para entornos con requisitos de privacidad.
- Filtrado previo a revision humana: en flujos de facturas, contratos o formularios, el score permite priorizar que bloques revisa un operador, optimizando el tiempo de validacion.
- Auditoria de calidad de proveedores OCR: permite comparar la fiabilidad de distintos motores de OCR sobre el mismo corpus midiendo la tasa de bloques con score bajo.
- Deteccion de degradacion en digitalizaciones de baja calidad: regiones con ruido, rotacion o baja resolucion tienden a generar discrepancias que el modelo puede senalar para reprocesado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a la evaluacion de los autores en la model card original de OpenBMB, pero no se incluyen cifras en los datos proporcionados.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base tiene unos 1.880 millones de parametros; en cuantizacion Q4_K_M los pesos ocupan aproximadamente 1,1-1,2 GB, mas el proyector de vision en F16 (varios cientos de MB). Se estima un consumo total en torno a 2-3 GB de VRAM, aunque no se dispone de cifra oficial.
- GPU recomendadas: no disponible de forma oficial; por tamano, cabe en GPUs consumer con 4 GB o mas de VRAM.
- Cabe en GPU consumer: si, previsiblemente en RTX 3050/3060, RTX 4060/4070 y superiores, asi como en iGPU con memoria unificada suficiente.
- Opciones de despliegue: LM-Kit.NET (SDK .NET), LM-Kit One; los GGUF publicados son compatibles con runtimes GGUF estandar como llama.cpp, aunque la integracion documentada es la de LM-Kit.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Funcion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniCPM-OCR-Jev (lm-kit) | ~1,88 B | no disponible | Verificacion OCR (score 0-1) | Apache 2.0 | GGUF, .lmk |
| Modelos OCR generativos (p. ej. variantes OCR de MiniCPM-V) | variable | no disponible | Transcripcion OCR | variable | GGUF, safetensors |
| Modelos de verificacion de OCR propietarios | no disponible | no disponible | Verificacion OCR | propietaria | API |

La comparativa detallada con alternativas concretas no esta disponible en la informacion proporcionada. La diferencia funcional clave frente a modelos OCR generativos es que este modelo no transcribe, sino que evalua la calidad de una transcripcion existente.

## Limitaciones y advertencias

- Requiere una renderizacion fiel del texto candidato: el editor documenta el renderer con el que se midieron los scores; un renderizador distinto puede alterar la calibracion del score.
- Solo cubre ingles y chino de forma declarada; su comportamiento con otros idiomas no esta documentado.
- No es un modelo de proposito general: solo responde a la pregunta de consistencia OCR y no debe usarse para otras tareas de decision.
- Riesgo de falsos positivos y negativos en regiones con ruido, baja resolucion o tipografias inusuales; el score debe calibrarse contra un conjunto de validacion propio antes de fijar umbrales en produccion.
- No se han publicado datos de sesgo en la informacion disponible; al operar sobre imagenes, puede heredar sesgos del corpus de entrenamiento respecto a idiomas, alfabetos o estilos tipograficos.
- La licencia Apache 2.0 permite uso comercial, pero debe verificarse la model card original de OpenBMB para condiciones adicionales del modelo base.
- El repositorio de lm-kit no incluye informacion sobre latencia ni throughput, por lo que el dimensionamiento de produccion debe medirse empiricamente.
- La fecha de creacion del repositorio (2026-11-25) y el conteo de descargas (0) indican que la version empaquetada es muy reciente y carece de validacion comunitaria amplia.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/lm-kit/minicpm-ocr-jev-lmk
- Modelo base: https://huggingface.co/openbmb/MiniCPM-OCR-Jev
- GGUF originales: https://huggingface.co/openbmb/MiniCPM-OCR-Jev-gguf
- LM-Kit.NET: https://lm-kit.com/products/lm-kit-net/
