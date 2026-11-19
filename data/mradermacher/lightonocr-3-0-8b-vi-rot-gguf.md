# mradermacher/LightOnOCR-3-0.8B-vi-rot-GGUF

## Resumen

LightOnOCR-3-0.8B-vi-rot es un modelo especializado en reconocimiento optico de caracteres (OCR) y comprension de documentos, desarrollado originalmente por el usuario samhv y cuantizado a formato GGUF por mradermacher. El modelo esta disenado especificamente para la extraccion de texto y estructura de documentos, con especial atencion a tablas e informes financieros, y con soporte nativo para vietnamita e ingles. Con aproximadamente 752 millones de parametros, se posiciona como una alternativa ligera frente a los grandes modelos multimodales de proposito general.

La version aqui descrita es una cuantizacion estatica del modelo base samhv/LightOnOCR-3-0.8B-vi-rot, publicada bajo licencia Apache 2.0. El repositorio incluye el archivo de proyeccion multimodal (mmproj) necesario para el procesamiento de imagenes, junto con multiples niveles de cuantizacion que van desde Q2_K (0,5 GB) hasta f16 (1,6 GB), lo que permite desplegar el modelo en hardware muy modesto.

Su relevancia actual radica en la demanda creciente de soluciones de digitalizacion documental eficientes y desplegables localmente, especialmente en el contexto de documentos en vietnamita, un idioma con menor cobertura en los modelos OCR comerciales. El sufijo "rot" en el nombre sugiere un entrenamiento especifico para manejar documentos rotados o con orientaciones no estandar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (OCR/document understanding), detalles no disponibles |
| Parametros totales | 752.393.024 (~0,8B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, IQ4_XS, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | vietnamita (vi), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones) y safetensors (modelo base) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo en la documentacion proporcionada. Por los tags y el tamano (752 millones de parametros), se trata de un modelo transformer multimodal que combina un codificador visual con un decodificador de lenguaje, orientado a tareas de OCR y comprension de documentos. La presencia de un archivo mmproj (proyeccion multimodal) confirma la integracion de un modulo de vision para procesar imagenes de documentos.

Los datos de entrenamiento (numero de tokens, composicion del dataset, uso de RLHF o DPO) no estan disponibles en la informacion proporcionada. El modelo esta optimizado para vietnamita e ingles, con enfasis declarado en tablas e informes financieros. El sufijo "rot" indica que el entrenamiento incluye ejemplos de documentos rotados o con orientaciones diversas, una innovacion practica para escenarios reales de digitalizacion donde las imagenes no siempre estan correctamente alineadas.

## Capacidades

- Reconocimiento optico de caracteres (OCR) sobre imagenes de documentos.
- Comprension de documentos con extraccion de estructura, incluyendo tablas.
- Procesamiento de informes financieros y documentos con formato complejo.
- Manejo de documentos rotados o con orientacion no estandar (variante "rot").
- Capacidades multimodales: procesa imagenes y genera texto.
- Soporte bilingue: vietnamita e ingles.
- Formato conversacional (tag "conversational"), lo que permite interaccion por turnos.
- Compatible con endpoints (tag "endpoints_compatible").
- No se ha documentado soporte de tool calling, function calling ni agentes multi-paso.

## Casos de uso

- Digitalizacion de facturas y recibos en vietnamita: el modelo extrae texto y estructura de tablas de documentos financieros, aprovechando su entrenamiento especifico en informes financieros y su soporte nativo del idioma.
- Procesamiento de documentos escaneados con orientacion incorrecta: gracias al entrenamiento "rot", el modelo puede manejar imagenes rotadas sin necesidad de preprocesamiento de alineacion, reduciendo la complejidad del pipeline.
- Extraccion de tablas de estados financieros: el modelo esta etiquetado para comprension de tablas, lo que permite convertir tablas de balances y cuentas de resultados en datos estructurados.
- Digitalizacion de archivos administrativos bilingues: con soporte para vietnamita e ingles, resulta adecuado para organizaciones que gestionan documentacion en ambos idiomas.
- Despliegue en entornos con hardware limitado: con cuantizaciones desde 0,5 GB, puede ejecutarse en CPU o GPUs de gama baja mediante llama.cpp, ideal para digitalizacion local sin dependencia de la nube.
- Procesamiento por lotes de archivos historicos: la naturaleza ligera del modelo (0,8B) permite procesar grandes volumenes de documentos en paralelo con requisitos de memoria reducidos.
- Integracion en aplicaciones de escritorio o moviles: el tamano reducido de las cuantizaciones Q4_K_M (0,6 GB) facilita su inclusion en aplicaciones con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: desde ~0,5 GB (Q2_K) hasta ~1,6 GB (f16) para los pesos del modelo, mas ~0,2-0,3 GB adicionales para el archivo mmproj de vision.
- GPU recomendadas: cualquier GPU con al menos 2-3 GB de VRAM; tarjetas como GTX 1650, RTX 3050 o superiores son suficientes. Tambien puede ejecutarse en CPU.
- Cabe en practicamente cualquier GPU de consumo actual, incluidas las integradas con memoria compartida suficiente.
- Opciones de despliegue: llama.cpp (formato GGUF nativo), Ollama, y cualquier runtime compatible con GGUF y mmproj. Para el modelo base en safetensors, transformers.
- Latencia y throughput: no disponibles en la informacion proporcionada; por el tamano del modelo, se espera una latencia baja en hardware moderno, pero no se aportan cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| LightOnOCR-3-0.8B-vi-rot (este) | ~0,8B | no disponible | vi, en | Apache 2.0 | GGUF, safetensors |
| Modelos OCR multimodales de proposito general (p. ej. variantes tipo Qwen-VL pequenas) | 2B-7B | variable | multilingue | variable | safetensors, GGUF |
| OCR clasicos (Tesseract, PaddleOCR) | no aplica (no neuronal o CNN) | no aplica | multilingue | Apache 2.0 / BSD | binario |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada. La ventaja principal de este modelo frente a alternativas es su tamano reducido (0,8B) combinado con especializacion en vietnamita y manejo de rotacion, mientras que los modelos multimodales de proposito general ofrecen mayor cobertura idiomatica a costa de mayor tamano.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion proporcionada; al estar entrenado principalmente con documentos vietnamitas e ingleses, su rendimiento en otros idiomas sera limitado o nulo.
- Riesgo de alucinacion: como todo modelo generativo, puede producir texto inexistente en la imagen, especialmente en documentos de baja calidad o con tablas complejas; se recomienda validacion en produccion.
- Limitaciones de contexto: la longitud de contexto no esta documentada, lo que dificulta planificar el procesamiento de documentos muy extensos o de multiples paginas.
- Limitaciones de idioma: solo vietnamita e ingles; no es adecuado para OCR en castellano u otros idiomas sin evaluacion previa.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se debe verificar la licencia del modelo base original y de los datos de entrenamiento.
- Caveat de produccion: las cuantizaciones de baja calidad (Q2_K, Q3_K) pueden degradar la precision del OCR; se recomienda Q4_K_M o superior para tareas criticas.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica falta de validacion comunitaria.
- No se ha documentado soporte de tool calling ni capacidades de agente, lo que limita su uso en pipelines automatizados complejos.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/LightOnOCR-3-0.8B-vi-rot-GGUF
- Modelo base: https://huggingface.co/samhv/LightOnOCR-3-0.8B-vi-rot
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#LightOnOCR-3-0.8B-vi-rot-GGUF
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (referencia TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
