# mradermacher/OutlineLM-Gemma4-E2B-v1-i1-GGUF

## Resumen

OutlineLM-Gemma4-E2B-v1-i1-GGUF es una cuantizacion GGUF del modelo DiTy/OutlineLM-Gemma4-E2B-v1, realizada por mradermacher. El modelo base es un ajuste fino sobre la familia Gemma 4 (tag `gemma4`), orientado a tareas conversacionales y de generacion de esquemas o resumenes estructurados (outline), segun indica su nombre. Esta version concreta no es un modelo nuevo, sino un paquete de pesos cuantizados en formato GGUF con tecnicas de imatrix, pensado para inferencia local eficiente.

El repositorio incluye un conjunto amplio de cuantizaciones (desde i1-Q2_K de 3,1 GB hasta i1-Q6_K de 3,9 GB), lo que permite desplegar el modelo en hardware de consumo con distintos equilibrios de calidad y velocidad. El modelo base declara 4.647.450.147 parametros totales en safetensors, aunque el nombre del modelo sugiere una variante "E2B" (posiblemente una configuracion reducida o de eficiencia dentro de la familia Gemma 4); esta discrepancia no se aclara en la informacion disponible.

La relevancia actual reside en la disponibilidad de pesos GGUF de alta calidad (imatrix) para un modelo derivado de Gemma 4, lo que facilita su uso en llama.cpp, Ollama y otros entornos compatibles con GGUF, con licencia Apache 2.0 y soporte declarado para ingles y ruso. La model card es escueta y no documenta arquitectura, datos de entrenamiento ni benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiquetado como `gemma4`; presumiblemente transformer decoder-only de la familia Gemma) |
| Parametros totales | 4.647.450.147 (dato de safetensors del modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-Q2_K, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-IQ4_NL, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K (ademas de imatrix) |
| Idiomas soportados | en, ru |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (con archivo imatrix incluido) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura del modelo base en la documentacion proporcionada. El tag `gemma4` sugiere que deriva de la familia Gemma 4 de Google, pero no se confirma si se trata de un transformer denso, un modelo MoE o una variante hibrida. El nombre "E2B" podria indicar una configuracion de eficiencia o un tamano especifico dentro de la familia, pero no hay datos que lo confirmen.

Tampoco se documentan el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o ajuste supervisado. La model card del repositorio cuantizado solo indica que se trata de cuantizaciones ponderadas con imatrix del modelo DiTy/OutlineLM-Gemma4-E2B-v1, generadas con `quantize_version: 2` y `output_tensor_quantised: 1`. Se menciona que es un modelo de vision ("This is a vision model"), y que los archivos mmproj, si existen, estarian en el repositorio estatico asociado.

## Capacidades

- Generacion de texto conversacional (tag `conversational` en el repositorio).
- Generacion de esquemas o resumenes estructurados (outline), segun el nombre del modelo base.
- Capacidad de vision declarada por el autor de la cuantizacion (modelo multimodal), aunque los archivos mmproj no estan en este repositorio.
- Soporte multilingue limitado a ingles y ruso.
- Compatibilidad con endpoints (`endpoints_compatible` en los tags).
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso.
- No se documenta modo thinking ni capacidades de audio.

## Casos de uso

- Generacion de esquemas y resumenes estructurados: el modelo esta disenado para producir outlines o esquemas a partir de texto, util en herramientas de documentacion automatica y organizacion de contenido.
- Asistentes conversacionales locales: con cuantizaciones de 3,5 GB (i1-Q4_K_M) puede ejecutarse en GPU de consumo para chatbots de proposito general en ingles y ruso.
- Procesamiento de documentos con vision: si se dispone de los archivos mmproj del repositorio estatico, podria emplearse para tareas de comprension de imagenes y texto combinados.
- Despliegue en entornos con recursos limitados: las cuantizaciones Q2 y Q3 permiten ejecucion en GPUs con 4-6 GB de VRAM, adecuadas para prototipado rapido.
- Traduccion y asistencia bilingue ingles-ruso: el soporte declarado de ambos idiomas permite tareas de traduccion y redaccion en esos pares linguisticos.
- Integracion en pipelines de llama.cpp u Ollama: el formato GGUF facilita su uso en herramientas de inferencia local sin necesidad de infraestructura cloud.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,1-3,9 GB para las cuantizaciones Q2-Q6, mas overhead de contexto y KV cache.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 para mayor velocidad; A100/H100 no son necesarias para este tamano.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU con 6 GB o mas de VRAM para cuantizaciones Q4 en adelante.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF; el repositorio declara compatibilidad con endpoints.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria ni datos de rendimiento que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- La model card es muy escueta: no documenta arquitectura, contexto, datos de entrenamiento ni benchmarks, lo que dificulta evaluar su calidad real.
- Existe una discrepancia entre el nombre "E2B" y los 4.647 millones de parametros declarados; no se aclara en la informacion disponible.
- Soporte limitado a ingles y ruso; no se declara castellano.
- Riesgo de alucinacion no cuantificado por falta de evaluaciones publicadas.
- Las cuantizaciones de baja calidad (Q2, Q3) pueden degradar notablemente el rendimiento; el autor recomienda IQ3_XXS o IQ3_XS sobre Q3_K*.
- Los archivos mmproj para vision no estan en este repositorio, sino en el repositorio estatico; sin ellos, la capacidad de vision no esta disponible.
- Licencia Apache 2.0 permite uso comercial, pero al derivar de Gemma 4 conviene verificar las condiciones de la licencia original del modelo base.
- No se documentan sesgos conocidos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/OutlineLM-Gemma4-E2B-v1-i1-GGUF
- Modelo base: https://huggingface.co/DiTy/OutlineLM-Gemma4-E2B-v1
- Repositorio de cuantizaciones estaticas: https://huggingface.co/mradermacher/OutlineLM-Gemma4-E2B-v1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#OutlineLM-Gemma4-E2B-v1-i1-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y solicitudes de modelos: https://huggingface.co/mradermacher/model_requests
