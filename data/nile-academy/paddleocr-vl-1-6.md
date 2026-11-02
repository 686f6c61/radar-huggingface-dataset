# nile-academy/paddleocr-vl-1.6

## Resumen

paddleocr-vl-1.6 es un espejo de los pesos del modelo OCR PaddleOCR-VL 1.6 publicado por PaddlePaddle, redistribuido por nile-academy para consumidores de la plataforma Wekala. El repositorio no contiene codigo de inferencia ni servidores: unicamente checkpoints declarativos (safetensors y exportaciones ONNX) junto con las model cards originales preservadas bajo `original/<source-commit>/`. El desarrollo y los derechos del modelo siguen siendo de PaddlePaddle.

El modelo pertenece a la familia PaddleOCR-VL, orientada a reconocimiento optico de caracteres y comprension de documentos con capacidad vision-lenguaje. El repositorio ocupa 1,9 GB y declara soporte para ingles, chino y multilingue, con licencia Apache 2.0. La publicacion verifica identidades de fichero inmutables, pero no valida precision OCR, fidelidad de cuantizacion ni encaje en dispositivos concretos.

Es relevante porque ofrece un punto de descarga estable y con commit fijado de un modelo OCR de referencia, util para pipelines de digitalizacion documental que necesitan trazabilidad de artefactos. Ahora bien, el consumidor debe aportar sus propios adaptadores compilados y asumir la validacion de calidad, ya que el paquete no incluye codigo ejecutable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo OCR con componente vision-lenguaje, segun la familia PaddleOCR-VL) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo incluye checkpoints originales Paddle y exportaciones ONNX oficiales) |
| Idiomas soportados | en, multilingual, zh |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors, ONNX (exportaciones oficiales), checkpoints Paddle originales |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna, el volumen de datos de entrenamiento ni el proceso de alineacion (RLHF/DPO) en la informacion proporcionada. La model card del espejo no describe el diseno del modelo; solo documenta el proceso de publicacion: preservacion de checkpoints declarativos, separacion entre checkpoints Paddle originales y exportaciones ONNX oficiales, y ausencia deliberada de codigo Python, pickles, servidores de inferencia o codigo ejecutable.

La unica innovacion documentada es de empaquetado y procedencia: cada fichero queda identificado de forma inmutable en `publication.json`, con el commit fuente (`c5630abae1d940eafe0697512a0325494b02ab42`) y las model cards originales conservadas. Cualquier detalle sobre atencion, tokenizador o estrategia de decodificacion debe consultarse en el repositorio upstream de PaddlePaddle.

## Capacidades

- Reconocimiento optico de caracteres (OCR) sobre imagenes y documentos, segun la etiqueta `ocr` del repositorio.
- Comprension de documentos con componente vision-lenguaje, propia de la familia PaddleOCR-VL.
- Soporte declarado de ingles y chino, ademas de metadatos multilingues.
- Distribucion en formatos safetensors y ONNX, apta para integracion en runtimes compilados.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades de audio o thinking mode: no disponible.

## Casos de uso

- Digitalizacion de facturas y albaranes: extraccion de texto y campos estructurados de documentos escaneados en ingles o chino, usando los pesos ONNX en un adaptador de inferencia propio.
- Archivado documental con trazabilidad: el commit fijado y `publication.json` permiten reproducir exactamente el artefacto usado en cada lote de digitalizacion, requisito habitual en auditorias.
- Procesamiento de formularios en movil o navegador: las exportaciones ONNX pueden integrarse en runtimes ligeros, aunque la aceptacion en desktop, movil o navegador debe validarla el consumidor.
- Pipelines de accesibilidad: conversion de imagenes de texto en texto seleccionable para lectores de pantalla, previa validacion de calidad en el idioma objetivo.
- Extraccion de texto en aplicaciones de gestion documental multi-tenant: el modelo se carga como asset aprobado dentro de un adaptador compilado, sin dependencia de servidores propios del repositorio.
- Investigacion en OCR multilingue: base reproducible para comparar variantes de cuantizacion y puertos nativos, ya que el espejo separa checkpoints originales de exportaciones ONNX.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que la publicacion verifica identidades de fichero, no precision OCR, fidelidad de cuantizacion ni encaje en dispositivos.

## Requisitos de hardware

- VRAM estimada: no disponible. El tamano del repo (1,9 GB) incluye varios formatos y no equivale al peso de un unico checkpoint en memoria.
- GPU recomendadas: no disponible.
- Encaje en GPU de consumo: no disponible; debe validarse por el consumidor.
- Opciones de despliegue: el repositorio no incluye servidores de inferencia. Los pesos ONNX y safetensors requieren adaptadores compilados aportados por el consumidor; no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| paddleocr-vl-1.6 (este repo) | no disponible | no disponible | Apache 2.0 | Espejo con commit fijado, sin codigo | Solo pesos y model cards |
| PaddlePaddle/PaddleOCR-VL-1.6 (upstream) | no disponible | no disponible | Apache 2.0 | Repositorio original | Fuente de este espejo |
| Otros modelos OCR de la familia PaddleOCR-VL | no disponible | no disponible | Apache 2.0 | Repositorios upstream | No se dispone de datos comparativos en la informacion proporcionada |

No se dispone de datos de rendimiento para establecer una comparativa cuantitativa con alternativas.

## Limitaciones y advertencias

- El repositorio no incluye codigo de inferencia, servidores ni adaptadores: sin un runtime propio, los pesos no son utilizables directamente.
- La publicacion no certifica precision OCR ni calidad por idioma; los metadatos de idioma no acreditan calidad probada.
- No se valida la fidelidad de las cuantizaciones ni el encaje en dispositivos concretos.
- El soporte de arabe se prefiere pero no es criterio de elegibilidad del modelo; no hay garantia de calidad en idiomas distintos de los declarados.
- Riesgo de alucinacion y sesgos: no documentado en la informacion disponible; en modelos vision-lenguaje es un riesgo a evaluar en produccion.
- La licencia Apache 2.0 permite uso comercial, pero los derechos del modelo siguen siendo de PaddlePaddle y el consumidor debe conservar los avisos de la licencia upstream.
- El espejo no selecciona fallback en la nube; la disponibilidad depende de la infraestructura del consumidor.

## Enlaces

- Repositorio del espejo: https://huggingface.co/nile-academy/paddleocr-vl-1.6
- Modelo upstream: https://huggingface.co/PaddlePaddle/PaddleOCR-VL-1.6/tree/c5630abae1d940eafe0697512a0325494b02ab42
- Repositorio upstream (raiz): https://huggingface.co/PaddlePaddle/PaddleOCR-VL-1.6
- Paper, blog o demo oficiales: no disponible en la informacion proporcionada.
