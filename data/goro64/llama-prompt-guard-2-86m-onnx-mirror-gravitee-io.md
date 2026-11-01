# Goro64/Llama-Prompt-Guard-2-86M-onnx-mirror-gravitee-io

## Resumen

Este repositorio es un espejo de preservación del modelo Llama-Prompt-Guard-2-86M en formato ONNX, publicado originalmente por gravitee-io y mantenido por Goro64. No se trata de un modelo nuevo ni de un fine-tuning: es una copia sin modificar del release upstream, capturada el 28 de octubre de 2026 en el commit `45a05fbd5337a864edc608f994911f009c37ca57`. Su propósito es garantizar acceso reproducible al artefacto original, con registros de procedencia e integridad documentados.

El modelo subyacente, Llama-Prompt-Guard-2-86M, es un clasificador de texto basado en arquitectura DeBERTa-v2 (según los tags del repositorio) diseñado para detectar prompts maliciosos y ataques de inyección en aplicaciones con LLM. La designación "86M" en el nombre comercial no coincide con el recuento real de parámetros en safetensors, que asciende a 278.810.882. El modelo está pensado para integrarse como capa de seguridad en pipelines de inferencia, filtrando entradas antes de que lleguen al modelo generativo.

La relevancia de este espejo es fundamentalmente operativa: al fijar una revisión concreta con digests SHA-256 verificables, permite a equipos de seguridad y MLOps desplegar el clasificador sin depender de la disponibilidad o mutabilidad del repositorio upstream. El repositorio incluye la licencia original (Llama 4 Community License), la política de uso aceptable y los avisos de atribución exigidos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DeBERTa-v2 (clasificador de texto, encoder) |
| Parametros totales | 278.810.882 (según safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | ONNX (conversión upstream); cuantizaciones adicionales no disponibles |
| Idiomas soportados | en, fr, de, hi, it, pt, es, th |
| Licencia | Llama 4 Community License Agreement (efectiva 5 de abril de 2025) |
| Formato de pesos | ONNX y safetensors |

## Arquitectura y entrenamiento

El modelo base es un encoder tipo DeBERTa-v2 configurado como clasificador de texto (`pipeline_tag: text-classification`). DeBERTa-v2 introduce atención desacoplada y un mecanismo de embedding de posición relativa mejorado respecto a BERT, lo que lo hace adecuado para tareas de clasificación discriminativa con contexto moderado. El repositorio espejo no aporta información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO; esos detalles corresponden a la model card upstream, que se preserva en `upstream/README.md` pero no se reproduce en la información disponible.

La única transformación documentada es la conversión a ONNX realizada por gravitee-io, que el espejo conserva sin alteraciones. El mantenedor del espejo declara explícitamente que no ha entrenado, ajustado, cuantizado ni fusionado pesos. La integridad del payload se verifica mediante `UPSTREAM_PAYLOAD_MANIFEST.json`, que registra rutas, tamaños y digests SHA-256 de los ficheros originales.

## Capacidades

- Clasificación de texto orientada a seguridad de prompts: detección de inyecciones, jailbreaks y entradas adversarias.
- Etiquetado binario o multiclase según la definición upstream (los nombres exactos de las etiquetas no están disponibles en la información proporcionada).
- Soporte multilingüe en ocho idiomas: inglés, francés, alemán, hindi, italiano, portugués, español y tailandés.
- Ejecución mediante runtime ONNX, lo que permite despliegue en entornos con ONNX Runtime, sin dependencia de frameworks de deep learning completos.
- No soporta generación de texto, tool calling, razonamiento multi-paso ni capacidades de agente: es exclusivamente un clasificador.
- No dispone de visión, audio ni modo "thinking".

## Casos de uso

- Filtrado de entrada en aplicaciones de chat con LLM: el clasificador se sitúa delante del modelo generativo para etiquetar cada prompt del usuario y bloquear o derivar a revisión aquellos marcados como maliciosos, reduciendo la superficie de ataque de inyecciones directas.
- Moderación de contenido generado por usuarios en plataformas comunitarias: se puede aplicar a mensajes entrantes para detectar intentos de manipulación del sistema antes de que se procesen.
- Puerta de seguridad en pipelines RAG: clasificar las consultas antes de la recuperación evita que prompts adversarios manipulen la selección de documentos o exfiltren contexto.
- Evaluación por lotes de datasets de prompts: procesar corpus históricos para medir la prevalencia de intentos de inyección y entrenar políticas de mitigación.
- Integración en API gateways: al ser un modelo ONNX ligero (repo de 2,5 GB con múltiples artefactos), puede desplegarse como microservicio de clasificación con baja latencia junto a la pasarela que enruta peticiones al LLM.
- Auditoría de registros de conversación: clasificar transcripciones almacenadas para identificar incidentes de seguridad y generar informes de cumplimiento.
- Despliegue en entornos con requisitos de reproducibilidad: el snapshot fijado con digests permite auditorías de cadena de suministro en organizaciones que exigen artefactos inmutables.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 278,8 M de parámetros, en FP32 se requieren aproximadamente 1,1 GB solo para pesos; en FP16, unos 0,56 GB. La conversión ONNX puede reducir aún más el footprint si se aplica cuantización INT8, aunque no se documenta en este repositorio.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; tarjetas como RTX 3060, RTX 4090, A100 o H100 funcionan sin problema, aunque el modelo está sobredimensionado para GPUs de gama alta.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna e incluso en CPU para inferencia por lotes.
- Opciones de despliegue: ONNX Runtime (nativo para este repositorio), así como conversiones a llama.cpp u Ollama si se generan artefactos GGUF a partir de los pesos safetensors. vLLM y TGI no están orientados a clasificadores de este tipo.
- Latencia y throughput: no disponibles en la información proporcionada; para un encoder de ~279 M de parámetros se espera latencia de milisegundos en GPU y decenas de milisegundos en CPU, pero no hay mediciones publicadas en este repositorio.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Llama-Prompt-Guard-2-86M (este espejo) | 278,8 M | no disponible | 8 | Llama 4 Community License | ONNX, safetensors |
| Llama-Prompt-Guard-2-22M | no disponible en esta ficha | no disponible | no disponible | Llama 4 Community License | safetensors |
| ProtectAI deberta-v3-base-prompt-injection | no disponible en esta ficha | no disponible | principalmente en | no disponible | safetensors |
| Meta Prompt Guard (v1) | no disponible en esta ficha | no disponible | no disponible | no disponible | safetensors |

La comparación cuantitativa con alternativas no está disponible en la información proporcionada; los datos de los modelos comparados no se han verificado en esta ficha.

## Limitaciones y advertencias

- El espejo no ha sido entrenado, evaluado ni certificado por el mantenedor; la preservación del modelo no constituye una garantía de seguridad ni una recomendación de despliegue.
- Riesgo de falsos positivos y falsos negativos inherente a cualquier clasificador de prompts; no se documentan métricas de precisión o recall en este repositorio.
- Sesgos potenciales derivados del dataset de entrenamiento upstream, no documentados aquí.
- La licencia Llama 4 Community License impone restricciones de uso comercial y obligaciones de atribución; es necesario revisar `LICENSE`, `USE_POLICY.md` y `NOTICE` antes de cualquier despliegue en producción.
- El modelo solo cubre ocho idiomas; prompts en otras lenguas no tienen garantía de cobertura.
- La longitud de contexto no está documentada en la información disponible, lo que impide garantizar el comportamiento con entradas largas.
- El repositorio upstream puede haber cambiado tras la captura; este snapshot no refleja revisiones posteriores.
- No debe utilizarse como única capa de seguridad: se recomienda combinarlo con validación de salida, limitación de herramientas y monitorización.

## Enlaces

- Repositorio espejo: https://huggingface.co/Goro64/Llama-Prompt-Guard-2-86M-onnx-mirror-gravitee-io
- Repositorio upstream: https://huggingface.co/gravitee-io/Llama-Prompt-Guard-2-86M-onnx
- Commit upstream capturado: https://huggingface.co/gravitee-io/Llama-Prompt-Guard-2-86M-onnx/tree/45a05fbd5337a864edc608f994911f009c37ca57
- Modelo base: https://huggingface.co/meta-llama/Llama-Prompt-Guard-2-86M
- Colección de espejos de seguridad: https://huggingface.co/collections/Goro64/prompt-security-preserved-upstream-mirrors-6ae31d121d3b87fd4016b1af
