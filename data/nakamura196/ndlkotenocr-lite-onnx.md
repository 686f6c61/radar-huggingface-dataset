# nakamura196/ndlkotenocr-lite-onnx

## Resumen

NDL Kotenseki OCR-Lite es un sistema de reconocimiento optico de caracteres (OCR) especializado en textos japoneses antiguos (kotenseki), desarrollado por el National Diet Library (NDL) de Japon. Este repositorio concreto, publicado por el usuario nakamura196, no contiene un modelo nuevo entrenado por el autor, sino un espejo (mirror) de los ficheros ONNX originales publicados en el repositorio GitHub oficial del NDL, con el objetivo de ofrecer URLs inmutables, soporte CORS y conversiones especificas para onnxruntime-web.

El sistema se compone de dos etapas: un detector de regiones de texto basado en RTMDet-S con entrada de 1280x1280 pixeles, y un reconocedor basado en PARSeq con entrada de 32x384 pixeles y un vocabulario de 10.000 clases. Ambos grafos se distribuyen en formato ONNX, lo que permite su ejecucion en navegador, en servidor o en entornos embebidos sin dependencia de frameworks de deep learning propietarios.

La relevancia de este espejo radica en la reproducibilidad: cada fichero se identifica por su SHA-256 y por el commit exacto del repositorio de origen, lo que permite fijar versiones de forma determinista en aplicaciones de digitalizacion documental. El repositorio ocupa aproximadamente 0,2 GB e incluye multiples versiones fechadas (2024-11, 2024-12, 2026-03).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de dos etapas: detector RTMDet-S + reconocedor PARSeq (transformer encoder-decoder) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; entrada de imagen 1280x1280 en deteccion y 32x384 en reconocimiento) |
| Tipos de cuantizacion | no disponible (se distribuyen grafos ONNX sin cuantizar; se mencionan conversiones para onnxruntime-web) |
| Idiomas soportados | japones (textos kotenseki / japones antiguo); no se detallan otros idiomas |
| Licencia | CC BY 4.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El pipeline consta de dos modelos independientes en formato ONNX. El primero, `rtmdet-s-1280x1280.onnx` (aproximadamente 40 MB), es un detector RTMDet en variante small con resolucion de entrada de 1280x1280 pixeles, encargado de localizar las regiones de texto en la imagen. El segundo, `parseq-ndl-32x384-tiny-10.onnx` (entre 37,7 MB y 42,4 MB segun la version), es un reconocedor PARSeq en variante tiny con entrada de 32x384 pixeles y un vocabulario de 10.000 clases, que transcribe cada region detectada.

No se dispone en la informacion proporcionada de detalles sobre el volumen de datos de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o ajuste supervisado adicional. El nombre del proyecto y la atribucion al National Diet Library indican que el entrenamiento se oriento a material de la coleccion digital del NDL. La innovacion practica del repositorio es la distribucion en ONNX con checksums SHA-256 y conversiones para onnxruntime-web, lo que habilita inferencia en navegador con CORS.

## Capacidades

- Deteccion de regiones de texto en imagenes de documentos historicos japoneses mediante RTMDet-S a 1280x1280.
- Reconocimiento de texto japones antiguo (kotenseki) mediante PARSeq con vocabulario de 10.000 clases.
- Ejecucion en navegador mediante onnxruntime-web (grafos convertidos a tal efecto).
- Ejecucion en servidor o entorno local mediante onnxruntime estandar.
- Procesamiento por etapas: primero deteccion, despues reconocimiento por region.
- Fijacion determinista de versiones mediante SHA-256 y commit de origen.
- No se documentan capacidades de tool calling, agentes, vision general, audio ni modo de razonamiento extendido.

## Casos de uso

- Digitalizacion de fondos bibliograficos antiguos: el pipeline detecta y transcribe lineas de texto en escaneos de obras kotenseki de la coleccion del NDL, permitiendo generar capas de texto buscable sobre imagenes historicas.
- Busqueda full-text en archivos digitales: al convertir imagenes en texto, se habilita indexacion y busqueda sobre corpus que hasta ahora solo existian como imagen.
- Aplicaciones web de consulta sin backend: gracias a los grafos convertidos para onnxruntime-web y al soporte CORS del espejo, una aplicacion de navegador puede cargar los modelos por URL inmutable y ejecutar OCR en el cliente.
- Verificacion de integridad en pipelines de datos: el uso de SHA-256 y commits fijos permite que un pipeline de digitalizacion valide que la version del modelo no ha cambiado entre ejecuciones.
- Investigacion en humanidades digitales: extraccion de texto para analisis linguistico de japones antiguo, con vocabulario especifico de 10.000 clases adaptado al dominio.
- Prototipado rapido de OCR documental: al estar en ONNX, se puede integrar en Python, C++, Rust o JavaScript sin necesidad de instalar PyTorch, reduciendo la friccion en entornos de despliegue ligeros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita. Los tamanos de fichero (40 MB el detector, 37-42 MB el reconocedor) sugieren requisitos de memoria modestos, compatibles con GPU de gama baja o incluso CPU.
- GPU recomendadas: no disponible. Por el tamano de los grafos, cualquier GPU consumer moderna (RTX 3060 o superior) deberia ser suficiente, aunque no se confirma en la informacion.
- Compatibilidad con GPU consumer: probable, dado el reducido tamano de los modelos; no confirmado por el autor.
- Opciones de despliegue: onnxruntime (servidor y local) y onnxruntime-web (navegador). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| NDL Kotenseki OCR-Lite (este repo) | Deteccion + reconocimiento OCR | 1280x1280 / 32x384 | CC BY 4.0 | ONNX | Especializado en japones antiguo |
| Manga OCR | Reconocimiento OCR | variable | no disponible | PyTorch | Orientado a manga, no a kotenseki |
| Tesseract (jpn) | OCR clasico | variable | Apache 2.0 | binario | No especializado en japones antiguo |
| PaddleOCR | Deteccion + reconocimiento | variable | Apache 2.0 | Paddle/ONNX | Multilingue general, no especifico de kotenseki |

La comparacion detallada con benchmarks no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- El repositorio es un espejo de terceros, no el repositorio oficial del NDL; la responsabilidad de mantenimiento recae en el autor del espejo.
- No se documentan sesgos conocidos ni evaluaciones de robustez sobre dominios distintos al kotenseki.
- Riesgo de alucinacion: no aplica en el sentido de modelos generativos, pero el reconocedor puede producir transcripciones incorrectas en caracteres degradados o poco frecuentes.
- El vocabulario esta limitado a 10.000 clases y orientado a japones antiguo; el rendimiento en japones moderno o en otros idiomas no esta documentado.
- La licencia CC BY 4.0 permite uso comercial con atribucion, pero requiere citar al NDL como autor original y respetar los terminos de la licencia.
- No se especifican requisitos de version de onnxruntime ni de onnxruntime-web; las conversiones para web podrian no ser compatibles con todas las versiones.
- El autor advierte de fijar la descarga por commit y no por rama, para garantizar reproducibilidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/nakamura196/ndlkotenocr-lite-onnx
- Repositorio oficial del modelo: https://github.com/ndl-lab/ndlkotenocr-lite
- Catalogo, checksums y scripts de conversion: https://github.com/nakamura196/ocr-models
- Fichero detector (version 2026-03): https://raw.githubusercontent.com/ndl-lab/ndlkotenocr-lite/ede4283845cdc0ba2bda8b7ebfc3dc80b33c92c8/src/model/rtmdet-s-1280x1280.onnx
- Fichero reconocedor (version 2026-03): https://raw.githubusercontent.com/ndl-lab/ndlkotenocr-lite/ede4283845cdc0ba2bda8b7ebfc3dc80b33c92c8/src/model/parseq-ndl-32x384-tiny-10.onnx
