# chipherndon/Infinity-Parser2-Flash-vllm

## Resumen

Infinity-Parser2-Flash es un modelo de parsing de documentos desarrollado por infly, basado en la arquitectura Qwen3.5 con 2.213 millones de parametros. Este repositorio concreto, publicado por chipherndon, es una copia del lado servidor del modelo original con una unica modificacion: el cambio de `tokenizer_class` de `TokenizersBackend` a `Qwen2Tokenizer` en `tokenizer_config.json`. Los pesos y el `tokenizer.json` permanecen intactos.

La relevancia de esta copia radica en la compatibilidad con runtimes de serving como vLLM 0.17.x y Transformers 4.x, que no pueden importar la clase `TokenizersBackend` del snapshot original. Esto permite desplegar el modelo en entornos de produccion sin necesidad de reescribir el snapshot. El modelo opera con pipeline `image-text-to-text`, lo que indica su capacidad para procesar imagenes de documentos y generar texto estructurado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 (image-text-to-text) |
| Parametros totales | 2.213.241.664 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base es `infly/Infinity-Parser2-Flash`, un fine-tune de la arquitectura Qwen3.5 orientado a parsing de documentos. La arquitectura subyacente es un transformer multimodal que acepta entradas de imagen y texto, y genera texto estructurado a partir de documentos escaneados o digitales. No se dispone de informacion detallada sobre el dataset de entrenamiento, el numero de tokens procesados ni si se aplicaron tecnicas de RLHF o DPO.

La unica innovacion tecnica en este repositorio es la correccion de compatibilidad del tokenizer: se sustituye la clase `TokenizersBackend` por `Qwen2Tokenizer` para que el modelo pueda cargarse en runtimes que no soportan la clase original. Los pesos y el tokenizer subyacente no han sido modificados.

## Capacidades

- Parsing de documentos: extrae texto estructurado a partir de imagenes de documentos (PDF escaneados, capturas, formularios).
- Procesamiento multimodal: acepta entradas combinadas de imagen y texto.
- Conversacional: el tag `conversational` indica capacidad para mantener dialogos multi-turno sobre el contenido de los documentos.
- Compatibilidad con vLLM y Transformers 4.x: el repositorio esta preparado para servir el modelo en entornos de produccion sin errores de importacion del tokenizer.

## Casos de uso

- Digitalizacion de documentos administrativos: el modelo puede convertir facturas, contratos y formularios escaneados en texto estructurado para su integracion en sistemas ERP o CRM.
- Extraccion de datos de expedientes clinicos: procesa imagenes de historiales medicos para extraer campos relevantes como diagnostico, medicacion o fechas.
- Automatizacion de procesos de onboarding: parsea documentos de identidad y comprobantes de domicilio para verificar datos de clientes en entidades financieras.
- Indexacion de archivos historicos: convierte documentos antiguos escaneados en texto buscable para archivos digitales.
- Asistentes conversacionales sobre documentos: combinado con un LLM, permite responder preguntas sobre el contenido de un documento previamente parseado.
- Preprocesamiento para pipelines de RAG: extrae texto limpio de documentos PDF o imagenes para alimentar bases vectoriales en sistemas de recuperacion aumentada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El tag `eval-results` aparece en los metadatos del repositorio, pero no se incluyen cifras concretas en la model card.

## Requisitos de hardware

- VRAM estimada: con 2.213 millones de parametros, el modelo en precision FP16 requiere aproximadamente 4,5 GB de VRAM. En cuantizacion INT8 o INT4, el requisito se reduce a unos 2,5 GB y 1,5 GB respectivamente.
- GPU recomendadas: cabe en GPUs de consumo como RTX 3060 (12 GB), RTX 4060 (8 GB) o superiores. Tambien es viable en GPUs de datacenter como A10 o L4.
- Opciones de despliegue: vLLM (compatible con la correccion de tokenizer de este repositorio), Transformers 4.x, TGI y llama.cpp si se generan pesos GGUF.
- Latencia y throughput: no disponibles. Al ser un modelo de 2,2B, se espera una latencia baja en GPUs modernas, pero no hay datos publicados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Pipeline |
|---|---|---|---|---|
| Infinity-Parser2-Flash (original) | 2,2B | no disponible | Apache 2.0 | image-text-to-text |
| chipherndon/Infinity-Parser2-Flash-vllm | 2,2B | no disponible | Apache 2.0 | image-text-to-text |
| Qwen3.5-2B (base) | 2B | no disponible | no disponible | text |

La comparativa con otros modelos de parsing de documentos como LayoutLM, Donut o PaddleOCR no es posible sin datos de benchmarks publicados. Este repositorio es funcionalmente identico al modelo original de infly, con la unica diferencia de la correccion del tokenizer.

## Limitaciones y advertencias

- No se debe sustituir este modelo por `Qwen/Qwen3.5-2B` como modelo base: la model card advierte explicitamente de que el punto de entrada debe ser este repositorio, no el modelo Qwen generico.
- La correccion del tokenizer solo afecta a `tokenizer_config.json`; los pesos y `tokenizer.json` no han sido modificados, por lo que el comportamiento del modelo es identico al original.
- No se dispone de informacion sobre sesgos, riesgos de alucinacion o limitaciones de idioma del modelo base.
- El modelo esta orientado a parsing de documentos; su uso fuera de ese dominio puede producir resultados suboptimos.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar la licencia del modelo base original en `infly/Infinity-Parser2-Flash` para confirmar que no existen restricciones adicionales.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/chipherndon/Infinity-Parser2-Flash-vllm
- Modelo base original: https://huggingface.co/infly/Infinity-Parser2-Flash
