# mradermacher/nexora-ocr-v0.1-0.8b-GGUF

## Resumen

Nexora OCR v0.1 es un modelo experimental de reconocimiento óptico de caracteres (OCR) desarrollado por ArkAiLab-Adl, diseñado para extraer texto de imágenes. Se trata de un ajuste fino (fine-tuning) del modelo Qwen3.5 de 0.8B de parámetros de Alibaba, especializado en el análisis de documentos y texto de escenas, devolviendo transcripciones precisas. El modelo es multimodal, ya que acepta entrada de imagen y genera texto.

La versión aquí descrita, `mradermacher/nexora-ocr-v0.1-0.8b-GGUF`, es una cuantización en formato GGUF realizada por mradermacher, que permite ejecutar el modelo en entornos con recursos limitados, como CPU o GPUs de consumo, mediante herramientas como llama.cpp u Ollama. Con aproximadamente 773 millones de parámetros, es un modelo ligero orientado a tareas de OCR y comprensión de documentos, con licencia Apache 2.0 que permite uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Basado en Qwen3.5 0.8B (arquitectura exacta no especificada) |
| Parametros totales | 772.845.888 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, mmproj-f16, mmproj-Q8_0 |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con archivos mmproj para el proyector multimodal) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de Qwen3.5 0.8B, un modelo de lenguaje multimodal de Alibaba. La arquitectura subyacente no se detalla en la informacion disponible, pero al tratarse de un modelo de la familia Qwen, se presume una arquitectura transformer con un codificador visual para procesar imagenes. El entrenamiento se ha realizado especificamente para tareas de OCR, analizando imagenes de documentos y texto de escenas para producir transcripciones. No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens utilizados ni si se aplicaron tecnicas como RLHF o DPO. La cuantizacion GGUF ha sido realizada por mradermacher, quien ha generado multiples versiones con diferentes niveles de precision para adaptarse a distintos requisitos de memoria y velocidad.

## Capacidades

- Extraccion de texto de imagenes: el modelo esta entrenado para reconocer y transcribir texto presente en documentos escaneados, fotografias de texto y escenas con texto.
- Comprension de documentos: puede procesar imagenes de paginas completas, facturas, formularios y otros tipos de documentos.
- Multimodal: acepta entrada de imagen y genera texto, gracias al proyector multimodal incluido en los archivos mmproj.
- Generacion de transcripciones: devuelve el texto extraido en formato legible.
- Soporte de tool calling: no disponible en la informacion proporcionada.
- Capacidades de agente: no disponible.
- Multilingue: solo se indica soporte para ingles.

## Casos de uso

- Digitalizacion de documentos: el modelo puede transcribir texto de escaneos de libros, articulos o informes, facilitando su conversion a formato digital editable.
- Extraccion de datos de facturas y recibos: al procesar imagenes de facturas, puede extraer campos como numeros de factura, fechas, importes y nombres de proveedores, aunque no se garantiza una estructuracion automatica de los datos.
- Procesamiento de formularios manuscritos o impresos: puede ayudar a transcribir contenido de formularios cumplimentados, reduciendo la entrada manual de datos.
- Accesibilidad: puede utilizarse para convertir texto impreso en imagenes a texto digital, ayudando a personas con discapacidad visual mediante lectores de pantalla.
- Archivado y busqueda: permite indexar documentos escaneados convirtiendolos a texto para su posterior busqueda en bases de datos.
- Automatizacion de flujos de trabajo: integrable en pipelines de procesamiento de documentos, por ejemplo, para clasificar o redirigir documentos segun su contenido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: los archivos GGUF varian entre 0,5 GB (Q2_K) y 1,7 GB (f16). Con el proyector multimodal (mmproj) se anade entre 0,2 y 0,3 GB. Por tanto, se necesita al menos 1 GB de VRAM para las cuantizaciones mas bajas y unos 2 GB para la f16.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM, como NVIDIA GTX 1050 Ti, GTX 1650, RTX 2060, o superiores. Tambien puede ejecutarse en CPU con suficiente RAM.
- Compatibilidad con GPU de consumo: si, cabe en practicamente cualquier GPU moderna de consumo.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, o cualquier runtime compatible con GGUF. Tambien puede usarse con transformers si se convierte a safetensors.
- Latencia y throughput: no disponibles, pero al ser un modelo de 0,8B, se espera una inferencia rapida incluso en CPU.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa con otros modelos OCR de tamano similar. Se recomienda evaluar el modelo directamente en el caso de uso previsto.

## Limitaciones y advertencias

- Modelo experimental: la version v0.1 indica que es una primera version, por lo que puede tener errores o un rendimiento inconsistente en ciertos tipos de imagenes.
- Idioma limitado: solo se ha entrenado para ingles, por lo que no es adecuado para OCR en otros idiomas.
- Sin informacion sobre sesgos: no se han documentado sesgos especificos, pero al ser un modelo pequeno y especializado, puede fallar en textos poco comunes, fuentes exoticas o imagenes de baja calidad.
- Riesgo de alucinacion: como todo modelo generativo, puede producir texto que no este presente en la imagen, especialmente en cuantizaciones agresivas.
- Contexto limitado: al ser un modelo de 0,8B, la capacidad de procesar imagenes muy grandes o multiples paginas puede estar limitada, aunque no se especifica la longitud de contexto.
- Licencia: Apache 2.0 permite uso comercial, pero se debe verificar la licencia del modelo base Qwen3.5 para asegurar el cumplimiento.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/nexora-ocr-v0.1-0.8b-GGUF
- Modelo base: https://huggingface.co/ArkAiLab-Adl/nexora-ocr-v0.1-0.8b
- Perfil del cuantizador: https://huggingface.co/mradermacher
- Solicitudes de modelos: https://huggingface.co/mradermacher/model_requests
- Herramienta de descubrimiento de modelos GGUF: https://local-ai-zone.github.io/
