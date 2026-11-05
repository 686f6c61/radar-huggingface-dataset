# mradermacher/LightOnOCR-3-0.8B-MTP-Repacked-i1-GGUF

## Resumen

LightOnOCR-3-0.8B-MTP-Repacked-i1-GGUF es una cuantizacion GGUF en formato i1 (con matriz de importancia, imatrix) del modelo LightOnOCR-3-0.8B-MTP-Repacked, publicado por el usuario mradermacher. El modelo base, desarrollado por prithivMLmods, es un modelo vision-lenguaje especializado en OCR y comprension de documentos: reconocimiento de texto en imagenes, extraccion de tablas, procesamiento de formularios y grounding visual sobre documentos PDF. La variante "MTP" hace referencia a un modo de prediccion multi-token, y "Repacked" indica que los pesos han sido reempaquetados respecto al original.

El modelo pertenece a la familia LightOnOCR, orientada a tareas de document understanding con un tamano reducido (la etiqueta del nombre indica 0,8B). Esta version concreta es una cuantizacion de baja precision pensada para inferencia eficiente con llama.cpp y stacks compatibles con GGUF, lo que permite ejecutar el modelo en hardware modesto, incluidas GPU de consumo. Es relevante para desarrolladores que necesitan un OCR local, sin dependencia de APIs en la nube, con licencia Apache 2.0 y capacidad de ejecutarse en entornos con recursos limitados.

La ficha se basa exclusivamente en la informacion disponible en HuggingFace y en la model card del repositorio; los detalles de arquitectura interna, dataset de entrenamiento y resultados de benchmarks no estan documentados en las fuentes consultadas y se indican como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo vision-lenguaje; el nombre sugiere variante MTP, sin detalle tecnico en la model card) |
| Parametros totales | 555.378 (dato de safetensors del repo base; la etiqueta del nombre indica 0,8B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1 (imatrix): Q2_K, Q2_K_S, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, IQ4_XS, IQ4_NL (small), Q3_K_S, Q3_K_M, Q3_K_L, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, IQ1_S, IQ1_M |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado); el modelo base en safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo en las fuentes consultadas. El repositorio base se etiqueta como modelo vision-lenguaje orientado a OCR y document understanding, con capacidades de grounding visual, lo que implica un codificador de vision acoplado a un modelo de lenguaje para procesar imagenes de documentos y generar texto estructurado. El sufijo "MTP" en el nombre apunta a un esquema de prediccion multi-token, pero la model card no documenta su implementacion concreta.

Tampoco se especifican el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. La model card del repositorio cuantizado es una plantilla generica de mradermacher centrada en el proceso de cuantizacion, sin detalles del entrenamiento original. Esta version i1 se ha generado con matriz de importancia (imatrix) para mejorar la calidad de las cuantizaciones de baja precision, segun la metodologia habitual del autor.

## Capacidades

- Reconocimiento optico de caracteres (OCR) sobre imagenes de documentos.
- Comprension de documentos (document understanding): extraccion de contenido textual estructurado.
- Extraccion y reconstruccion de tablas.
- Procesamiento de formularios.
- Grounding visual: localizacion de elementos de texto o regiones dentro de la imagen.
- Procesamiento de PDF (segun las etiquetas del repositorio).
- Generacion de texto condicionada por imagen (vision-lenguaje).
- Soporte de tool calling / function calling: no disponible en la informacion consultada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion consultada.
- Capacidades multilingues: limitadas al ingles segun la etiqueta de idioma.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Digitalizacion de facturas y albaranes: el modelo puede procesar imagenes de documentos contables y extraer campos estructurados (importes, fechas, emisores) para alimentar sistemas de contabilidad, aprovechando su capacidad de comprension de formularios y tablas.
- Extraccion de tablas de informes PDF: permite convertir tablas embebidas en PDF a formato estructurado (CSV, JSON) para pipelines de analisis de datos, gracias a su especializacion en tablas y documentos.
- Procesamiento local de documentos sensibles: al ser un modelo pequeno con licencia Apache 2.0 y pesos GGUF, puede desplegarse on-premise sin enviar documentos a servicios externos, lo que resulta adecuado para entornos con requisitos de privacidad (sanidad, legal, banca).
- Automatizacion de entrada de datos en formularios: integrado en un flujo de captura de imagenes, el modelo puede leer formularios cumplimentados y volcar los valores a una base de datos, reduciendo la transcripcion manual.
- Grounding visual para verificacion documental: permite localizar regiones concretas de texto en la imagen, util para resaltar campos extraidos en herramientas de revision humana (human-in-the-loop).
- OCR en dispositivos con recursos limitados: las cuantizaciones de baja precision (Q2, IQ2, IQ3) permiten ejecutar el modelo en portatiles o mini-PC con GPU de consumo, habilitando OCR local en aplicaciones de escritorio.
- Indexacion y busqueda de archivos escaneados: extraccion de texto de PDFs escaneados para construir indices de busqueda full-text en repositorios documentales internos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; por el tamano del modelo (etiqueta 0,8B, repo base de 0,0 GB) y las cuantizaciones i1 disponibles, se espera un consumo muy reducido, apto para GPU de consumo, aunque no se proporcionan cifras concretas.
- GPU recomendadas: no disponible en la informacion consultada; por el tamano, cabe razonablemente en GPU consumer (gama RTX xx60/xx70 o superior) y en GPUs de datacenter (A100, H100) con holgura.
- Cabe en GPU de consumo: si, segun el tamano indicado por el nombre del modelo (0,8B) y las cuantizaciones de baja precision ofrecidas; no se detalla la VRAM exacta.
- Opciones de despliegue: llama.cpp (formato GGUF), llama-cpp en general; el repo se etiqueta tambien con text-generation-inference y transformers para el modelo base. Los ficheros mmproj, si existen, estan en el repositorio estatico enlazado.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de especificaciones completas de modelos comparables en la informacion proporcionada, por lo que no es posible establecer una comparativa cuantitativa fiable.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| LightOnOCR-3-0.8B-MTP-Repacked-i1-GGUF (este) | 0,8B (etiqueta) | no disponible | Apache 2.0 | GGUF (i1) | OCR y document understanding, solo ingles |
| LightOnOCR-3-0.8B-MTP-Repacked (base) | 0,8B (etiqueta) | no disponible | Apache 2.0 | safetensors | Modelo original sin cuantizar |
| Alternativas de OCR open source | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en las fuentes consultadas |

## Limitaciones y advertencias

- Idioma: el modelo esta etiquetado unicamente para ingles; el rendimiento en castellano u otros idiomas no esta garantizado y podria degradarse.
- Sesgos: no se documentan sesgos conocidos en la informacion disponible; al ser un modelo de OCR, puede heredar sesgos de los datos de entrenamiento originales, no especificados.
- Alucinacion: los modelos vision-lenguaje pueden generar texto no presente en la imagen, especialmente en documentos de baja calidad o con layout complejo; se recomienda validacion en produccion.
- Cuantizacion: esta version i1 con cuantizaciones agresivas (Q2, IQ2) puede degradar la precision del OCR respecto al modelo base en safetensors; para maxima calidad conviene usar cuantizaciones mayores (Q5, Q6) o el modelo original.
- Licencia: Apache 2.0 permite uso comercial, pero deben respetarse las condiciones de la licencia y las de los componentes del modelo base.
- Ficheros mmproj: al ser un modelo de vision, la funcionalidad completa puede requerir ficheros mmproj que, segun la model card, se encuentran en el repositorio estatico enlazado, no en este repositorio i1.
- Documentacion escasa: la model card es una plantilla generica de cuantizacion; no hay informacion sobre contexto maximo, resolucion de imagen soportada ni limites practicos de uso.

## Enlaces

- Repositorio HuggingFace (este modelo): https://huggingface.co/mradermacher/LightOnOCR-3-0.8B-MTP-Repacked-i1-GGUF
- Modelo base: https://huggingface.co/prithivMLmods/LightOnOCR-3-0.8B-MTP-Repacked
- Repositorio de cuantizaciones estaticas (incluye mmproj): https://huggingface.co/mradermacher/LightOnOCR-3-0.8B-MTP-Repacked-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#LightOnOCR-3-0.8B-MTP-Repacked-i1-GGUF
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
