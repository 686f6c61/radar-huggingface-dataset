# smartly-ai/gemma-4-12B-it-Q8-GGUF

## Resumen

Gemma 4 12B IT es un modelo multimodal (texto e imagen) desarrollado por Google, distribuido originalmente en HuggingFace como `google/gemma-4-12B-it`. Esta ficha cubre concretamente la cuantización Q8_0 en formato GGUF publicada por el usuario `smartly-ai`, pensada para su uso con llama.cpp y orientada a la extracción de datos a partir de imágenes y documentos.

El modelo cuenta con 11.907.350.576 parámetros totales (aproximadamente 11,9 mil millones) y se distribuye bajo licencia Apache 2.0, lo que facilita su uso comercial sin las restricciones adicionales que suelen acompañar a otros modelos de la familia Gemma. La cuantización Q8_0 conserva prácticamente la calidad del modelo original en BF16 a cambio de un mayor peso en disco (el repositorio ocupa 12,8 GB).

La relevancia de esta publicación radica en que ofrece una vía de despliegue local de un modelo multimodal de tamaño medio con licencia permisiva, compatible con el ecosistema llama.cpp y con endpoints compatibles, lo que simplifica su integración en pipelines de procesamiento documental. No obstante, la información pública disponible sobre el modelo base es muy limitada: no se detallan la longitud de contexto, la composición del dataset de entrenamiento ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo multimodal texto-imagen; familia Gemma 4) |
| Parametros totales | 11.907.350.576 (aprox. 11,9 B) |
| Parametros activos | no aplica (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (GGUF); proyector multimodal en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base `google/gemma-4-12B-it` en la documentación proporcionada. Por la nomenclatura de la familia Gemma y por la presencia de un fichero proyector multimodal (`mmproj-gemma-4-12B-it-BF16.gguf`), se trata de un transformer con capacidad de procesamiento de imágenes integrada mediante un proyector que adapta las representaciones visuales al espacio del modelo de lenguaje. No se confirma si emplea atención lineal, decodificación especulativa u otras innovaciones.

Tampoco se detallan el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF o DPO. La model card del repositorio cuantizado se limita a indicar los ficheros incluidos, el uso previsto con llama.cpp y el enlace al modelo original. Cualquier afirmación sobre el proceso de entrenamiento sería especulativa y, por tanto, se omite.

## Capacidades

- Generación de texto conversacional en modo instrucción (sufijo IT), orientada a diálogo multi-turno.
- Procesamiento de imágenes: el modelo es multimodal y acepta entradas visuales junto con texto.
- Extracción de información de imágenes y documentos, que es el caso de uso declarado explícitamente por el autor de la cuantización.
- Compatibilidad con llama.cpp, lo que permite inferencia local en CPU y GPU.
- Etiqueta `endpoints_compatible`, que sugiere compatibilidad con APIs de tipo endpoint (formato OpenAI-like) para integración en servicios.
- Capacidades de tool calling, agentes o razonamiento multi-paso: no disponibles en la información proporcionada.
- Cobertura multilingüe concreta: no disponible.

## Casos de uso

- Extracción de datos de documentos escaneados: el modelo puede recibir la imagen de una factura, albarán o formulario y devolver los campos estructurados en texto, aprovechando su naturaleza multimodal y su modo instrucción para seguir plantillas de extracción.
- Digitalización de tablas en PDFs e imágenes: útil para convertir tablas impresas en CSV o JSON sin necesidad de OCR previo separado, ya que el modelo procesa la imagen directamente.
- Procesamiento de tickets y recibos en local: al ser una cuantización Q8_0 ejecutable con llama.cpp, permite montar un pipeline de contabilidad automatizada en infraestructura propia sin enviar documentos sensibles a servicios externos.
- Asistente conversacional sobre imágenes: un chatbot que responda preguntas sobre el contenido de capturas de pantalla, diagramas o fotografías, con la ventaja de la licencia Apache 2.0 para productos comerciales.
- Clasificación y etiquetado de imágenes con instrucciones en lenguaje natural: por ejemplo, categorizar documentos por tipo (contrato, informe, recibo) mediante prompts descriptivos, sin entrenar un clasificador específico.
- Integración en pipelines de CI/CD o backend con endpoints compatibles: al estar etiquetado como `endpoints_compatible`, puede exponerse detrás de una API y consumirse desde aplicaciones existentes que ya hablan el protocolo de endpoints habitual.
- Prototipado rápido en estaciones de trabajo: la cuantización Q8_0 con llama.cpp permite validar ideas de producto multimodal sin aprovisionar GPUs de datacenter.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Tamaño en disco: 12,8 GB para el repositorio completo (pesos Q8_0 más proyector multimodal en BF16).
- VRAM estimada para inferencia: aproximadamente 13-14 GB para cargar los pesos Q8_0 y el proyector, más overhead de contexto KV cache; en la práctica, se recomienda al menos 16 GB de VRAM para contexto moderado.
- GPU recomendadas: RTX 4090 (24 GB), RTX 3090 (24 GB), A100 (40/80 GB), H100 (80 GB). Una RTX 4080 (16 GB) podría funcionar con contexto limitado.
- ¿Cabe en GPU de consumo? Sí, en tarjetas con 16 GB o más de VRAM; en 12 GB no cabría la cuantización Q8_0 completa (habría que recurrir a cuantizaciones menores, no publicadas en este repositorio).
- Opciones de despliegue: llama.cpp (nativo, con soporte de `mmproj` para visión), Ollama (si se importa el GGUF), servidores compatibles con llama.cpp. vLLM y TGI no están confirmados para este formato GGUF con proyector multimodal.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Gemma 4 12B IT Q8_0 (esta ficha) | ~11,9 B | no disponible | Apache 2.0 | GGUF | Multimodal, orientado a llama.cpp |
| google/gemma-4-12B-it (original) | ~11,9 B | no disponible | Apache 2.0 | safetensors (presumible) | Modelo base sin cuantizar |
| Otras cuantizaciones GGUF de Gemma 4 12B IT | ~11,9 B | no disponible | Apache 2.0 | GGUF (Q4, Q5, etc.) | No confirmadas en la información disponible |

No se dispone de datos de benchmarks ni de especificaciones de contexto que permitan una comparación cuantitativa con alternativas de otros fabricantes (Llama, Qwen, Mistral). La comparación se limita, por tanto, a variantes del mismo modelo base.

## Limitaciones y advertencias

- Información pública muy escasa: no se documentan contexto, idiomas, dataset ni benchmarks, lo que dificulta evaluar su idoneidad para producción sin pruebas propias.
- Riesgo de alucinación inherente a los modelos generativos, especialmente crítico en extracción de datos de documentos, donde un campo inventado puede propagarse a sistemas downstream; se recomienda validación posterior.
- La cuantización Q8_0 introduce una pérdida de precisión mínima pero no nula respecto al BF16 original; en tareas de extracción fina (números, códigos) conviene verificar resultados.
- El proyector multimodal se distribuye en BF16, por lo que el consumo de memoria no se reduce proporcionalmente al cuantizar solo el modelo de lenguaje.
- Licencia Apache 2.0: permisiva para uso comercial, pero conviene revisar los términos del modelo base original de Google por si existieran condiciones adicionales no reflejadas en esta ficha.
- Sesgos conocidos: no documentados en la información disponible; cabe esperar los sesgos típicos de los corpus web a gran escala.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin historial de validación por la comunidad.
- Soporte de tool calling y agentes no confirmado; no asumir su disponibilidad sin pruebas.

## Enlaces

- Repositorio HuggingFace de la cuantización: https://huggingface.co/smartly-ai/gemma-4-12B-it-Q8-GGUF
- Modelo base original: https://huggingface.co/google/gemma-4-12B-it
