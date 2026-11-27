# iapp/OpenThai2.2-OCR-Markdown-20261127

## Resumen

OpenThai2.2-OCR-Markdown-20261127 es un modelo especializado en conversion de documentos a Markdown desarrollado por iApp Technology (anteriormente OpenThaiGPT), lanzado junto con AIEAT. Se trata de un fine-tune tailandes de 0,6 mil millones de parametros sobre NVIDIA Nemotron 3.5 Parse, disenado para convertir paginas de documentos tailandeses e ingleses en Markdown estructurado, con tablas representadas como HTML (incluyendo `rowspan` y `colspan`) y formulas en sintaxis `$$...$$`. El modelo conserva la pila de servicio, las cajas de maquetacion, las clases de bloque y el orden de lectura de Nemotron Parse, por lo que puede desplegarse en cualquier infraestructura compatible con el modelo base.

La relevancia del modelo radica en su enfoque en tailandes, un idioma escasamente cubierto por los sistemas OCR de proposito general. Segun la model card, supera a Typhoon OCR V2 0.8B en documentos tailandeses con tablas (95,0 frente a 89,0) y en texto impreso tailandes (90,55 frente a 85,06), con una latencia de 0,51 s por pagina en una H100 cuando se sirve con el borrador especulativo DFlash2. La version 2.2 introduce pesos reentrenados sobre 9.000 fotografias simuladas de telefonos y pantallas fotografiadas, ademas de pasos opcionales de orientacion y aplanado (dewarp) para fotos de movil.

El modelo se distribuye en formato safetensors y ONNX, con un tamano de repositorio de 7,8 GB y licencia OpenMDW 1.1. Su pipeline es `image-text-to-text` y esta pensado para integrarse en flujos de parseo documental mediante la clase `DocumentParser` de NVIDIA y servidores vLLM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Nemotron Parse (transformer multimodal image-text-to-text, `custom_code`) |
| Parametros totales | 630.800.504 (0,63 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible de forma explicita; la configuracion de servicio recomienda `--max-model-len 16384` |
| Tipos de cuantizacion | No disponible (el repo incluye safetensors y ONNX; no se detallan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | Tailandes (th), ingles (en) |
| Licencia | OpenMDW 1.1 (`license: other`, `license_name: openmdw-1.1`) |
| Formato de pesos | safetensors, ONNX |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de NVIDIA Nemotron 3.5 Parse, un transformer multimodal de tipo image-text-to-text orientado al parseo de documentos. Mantiene la salida estructurada del modelo base: cajas de maquetacion, clases de bloque por elemento y orden de lectura, ademas de la generacion de Markdown con tablas HTML y formulas en LaTeX. El modelo requiere `trust-remote-code` en vLLM, lo que indica componentes personalizados en el codigo de inferencia.

El entrenamiento parte de Nemotron 3.5 Parse y se especializa mediante fine-tuning en documentos tailandeses e ingleses. La version 2.2 anade 9.000 fotografias simuladas de telefonos con inclinacion pronunciada y pantallas fotografiadas, lo que mejora el rendimiento en escenarios de captura movil. La model card reporta mejoras frente a 2.1 en documentos tailandeses con tablas (95,0 frente a 94,0) y en texto tailandes (90,55 frente a 90,24), con un ligero descenso en tablas de ThaiOCRBench (67,9 frente a 69,5). No se detalla en la informacion disponible el volumen total de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO.

Una innovacion destacable es el uso de decodificacion especulativa con DFlash2, el borrador de bloques de NVIDIA incluido en el subdirectorio `dflash2/`, que reduce la latencia a aproximadamente un tercio (0,51 s por pagina frente a 1,5 s con el borrador de un token integrado y 2,6 s sin borrador), sin perdida apreciable de precision.

## Capacidades

- Conversion de paginas de documentos (escaneos, PDFs, capturas de pantalla) a Markdown estructurado.
- Representacion de tablas como HTML con `rowspan` y `colspan`.
- Renderizado de formulas matematicas en sintaxis `$$...$$`.
- Extraccion de bloques con caja delimitadora y clase para cada elemento, en orden de lectura.
- Procesamiento de documentos en tailandes e ingles.
- Manejo de fotografias de movil mediante pasos opcionales de orientacion (giro de paginas laterales o invertidas) y aplanado (dewarp) de fotos curvadas o inclinadas.
- Servicio mediante vLLM con soporte de decodificacion especulativa DFlash2.
- Integracion con `DocumentParser` de NVIDIA para flujos de parseo documental.
- No se documentan en la informacion disponible capacidades de tool calling, function calling, agentes multi-paso, audio o modos de razonamiento extendido.

## Casos de uso

- Digitalizacion de archivos administrativos tailandeses: el modelo convierte escaneos de documentos oficiales en Markdown con tablas HTML, preservando la estructura de filas y columnas, lo que facilita su ingestion en sistemas de gestion documental.
- Extraccion de tablas financieras en informes tailandeses: gracias a la representacion HTML con `rowspan`/`colspan`, las tablas complejas de balances y estados de resultados pueden reconstruirse fielmente para su posterior procesamiento en hojas de calculo o bases de datos.
- Procesamiento masivo de PDFs en pipelines de datos: con 0,51 s por pagina en H100 y procesamiento por lotes de 16 paginas en 2,35 s, es adecuado para ingerir grandes volumenes de documentos en pipelines de RAG o busqueda empresarial.
- Captura de documentos con movil en aplicaciones de campo: los pasos opcionales de orientacion y dewarp permiten procesar fotos tomadas con telefono en condiciones adversas (paginas inclinadas, curvadas o giradas), con un coste adicional de aproximadamente 1,15 s de CPU por foto de 12 megapixeles.
- Conversion de material academico y tecnico tailandes: la salida en Markdown con formulas en `$$...$$` permite transformar apuntes, articulos y manuales en formatos listos para publicacion web o wikis internas.
- Digitalizacion de facturas y recibos: la deteccion de bloques con clase y orden de lectura facilita la extraccion estructurada de campos en documentos comerciales tailandeses e ingleses.
- Migracion de documentacion legacy a Markdown: equipos que mantienen documentacion en PDF o escaneos pueden convertirla a Markdown para repositorios Git o sistemas de documentacion estaticos.

## Benchmarks y rendimiento

Los datos siguientes provienen de la model card del autor y comparan con Typhoon OCR V2 0.8B sobre las mismas paginas y el mismo sistema de puntuacion. Mayor es mejor.

| Benchmark | OpenThai2.2 0.6B | Typhoon OCR V2 0.8B | Resultado |
|---|---|---|---|
| Documentos tailandeses con tablas | 95,0 | 89,0 | Victoria (+6,0) |
| Texto impreso tailandes (12 conjuntos) | 90,55 | 85,06 | Victoria (+5,5) |
| Tablas ThaiOCRBench | 67,9 | 67,9 | Empate |
| Fotos de movil (MDPBench) | 86,1 | 84,7 | Empate |
| Fotos solo tailandesas | 84,4 | 81,0 | Empate |
| Paginas fallidas | 0 de 2.270 | No disponible | No disponible |
| Velocidad, una pagina a la vez | 0,51 s | 1,71 s | 3,4x mas rapido |
| Velocidad, 16 paginas a la vez | 2,35 s | 4,70 s | 2,0x mas rapido |

Segun la model card, Typhoon OCR V2 0.8B supera a este modelo en benchmarks con predominio de ingles y formulas: olmOCR-bench 81,7 frente a 72,4, OmniDocBench v1.6 89,4 frente a 77,9 (las formulas son el punto mas debil de OpenThai2.2) y SEA-DocBench con error por pagina 0,108 frente a 0,124. Las mediciones de velocidad se realizaron en una H100, cada modelo con su propio borrador (DFlash2 con 32 tokens para OpenThai2.2; cabeza EAGLE-3 con 3 tokens para Typhoon), alternando servidores nuevos y tomando la mediana por pagina en documentos tailandeses el 27 de noviembre de 2026.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita en la informacion proporcionada; con 630,8 M de parametros, en precision FP16 el peso ronda 1,3 GB, por lo que la VRAM necesaria seria modesta, pero no se confirma en la model card.
- GPU recomendadas: H100 para las mediciones de velocidad reportadas; el modelo deberia caber en GPUs consumer con suficiente VRAM, aunque no se documentan pruebas en RTX 4090 u otras.
- Despliegue: vLLM (Linux o WSL2 en Windows) con `--trust-remote-code`; para DFlash2 se requiere vLLM 0.34.0 o una build con soporte nativo de Nemotron Parse y DFlash2, en un entorno separado sin el extra `[vllm]` del paquete.
- Pasos opcionales de fotos: `onnxruntime`, `opencv-python-headless` y `pyclipper`; UVDoc ONNX (32 MB) para dewarp y OpenThai2.2-OCR-Text (8 MB) para orientacion.
- Latencia: 0,51 s por pagina en H100 con DFlash2; 2,35 s para 16 paginas simultaneas; orientacion aproximadamente 0,7 s de CPU por foto de 12 MP y aplanado aproximadamente 0,45 s.
- No se documentan opciones de despliegue con llama.cpp, Ollama o TGI en la informacion disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| OpenThai2.2-OCR-Markdown-20261127 | 0,63 B | No disponible (servicio recomendado a 16.384) | OpenMDW 1.1 | OCR documental tailandes/ingles a Markdown | Hugging Face |
| Typhoon OCR V2 0.8B | 0,8 B | No disponible | No disponible en la informacion | OCR documental (referencia en la model card) | No disponible en la informacion |
| NVIDIA Nemotron 3.5 Parse | No disponible | No disponible | No disponible en la informacion | Parseo documental (modelo base) | Hugging Face (nvidia/Nemotron-3.5-Parse) |

En rendimiento, OpenThai2.2 supera a Typhoon OCR V2 0.8B en documentos tailandeses con tablas y texto impreso tailandes, empata en tablas ThaiOCRBench, MDPBench y fotos tailandesas, y es entre 2 y 3,4 veces mas rapido en las condiciones medidas. Typhoon OCR V2 0.8B es superior en ingles y formulas (olmOCR-bench, OmniDocBench v1.6) y en SEA-DocBench. No se dispone de datos comparativos frente a Nemotron 3.5 Parse en la informacion proporcionada.

## Limitaciones y advertencias

- El rendimiento en ingles y formulas es inferior al de Typhoon OCR V2 0.8B: olmOCR-bench 72,4 frente a 81,7 y OmniDocBench v1.6 77,9 frente a 89,4; las formulas son el punto mas debil declarado por el autor.
- Cobertura linguistica limitada a tailandes e ingles; no se documentan otros idiomas.
- La licencia OpenMDW 1.1 debe revisarse antes de uso comercial; la model card la marca como `license: other` con enlace a openmdw.ai, y no se detallan en la informacion disponible las restricciones concretas.
- Los pasos de orientacion y dewarp estan desactivados por defecto y requieren dependencias adicionales (ONNX Runtime, OpenCV, pyclipper, UVDoc y OpenThai2.2-OCR-Text); sin ellos, el rendimiento en fotos de movil baja (MDPBench 82,5 sin pasos opcionales frente a 86,1 con ellos).
- Las builds de vLLM con DFlash2 devuelven el caracter tailandes `ำ` como dos caracteres; `DocumentParser` lo recompone con `standard_output=True` (valor por defecto).
- Debe evitarse la palabra "dflash" en la ruta de la carpeta del modelo, ya que vLLM deduce el metodo de borrador a partir de la ruta.
- No se documentan sesgos conocidos ni tasas de alucinacion en la informacion disponible.
- El modelo requiere `trust-remote-code`, lo que implica ejecutar codigo personalizado del repositorio.
- No se dispone de informacion sobre el contexto maximo nativo ni sobre cuantizaciones soportadas mas alla de safetensors y ONNX.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/iapp/OpenThai2.2-OCR-Markdown-20261127
- Modelo base: https://huggingface.co/nvidia/Nemotron-3.5-Parse
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
- Guia de ejecucion (ingles): https://iapp.co.th/en/blog/openthai2p0-ocr-how-to-run
- Guia de ejecucion (tailandes): https://iapp.co.th/blog/openthai2p0-ocr-how-to-run
- Guia de ejecucion (chino): https://iapp.co.th/zh-CN/blog/openthai2p0-ocr-how-to-run
- Modelo auxiliar de orientacion: https://huggingface.co/iapp/OpenThai2.2-OCR-Text-20261127
- UVDoc ONNX (dewarp): https://huggingface.co/PaddlePaddle/UVDoc_onnx
- Assets de la model card: https://huggingface.co/datasets/iapp/OpenThai2.0-model-card-assets
- Paper referenciado: arXiv:2611.27494
