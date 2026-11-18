# interfaceinde/laya-gate

## Resumen

`laya-gate` es un clasificador de texto en coreano desarrollado por el equipo INTERFACE (autor `interfaceinde`) para decidir si un correo electrónico debe procesarse localmente o derivarse a un servicio en la nube. Se trata de un modelo de la familia Laya (0.4.31 multilingual, basado en mmBERT-base, Apache-2.0) afinado para una tarea concreta de enrutamiento sensible dentro de un proyecto interno denominado FEAT-004. El repositorio es privado y la model card advierte explícitamente de que no debe hacerse público.

El modelo se distribuye como un artefacto versionado: la carpeta `v13/` es la versión marcada como BEST (18 de noviembre de 2026) y contiene `model.safetensors`, umbrales de calibración (`thresholds.json`), preguntas de evaluación (`questions.json`), encoder y tokenizer. El repositorio ocupa aproximadamente 0,7 GB y se consume mediante la librería `laya==0.4.31`, que resuelve la versión apuntada por el fichero `BEST`.

La relevancia de esta ficha es limitada fuera del contexto del equipo: no hay benchmarks públicos, el acceso está restringido a miembros de la organización y la licencia es "other" sin términos publicados. Sirve, eso sí, como ejemplo de patrón de despliegue (checkpoint versionado con puntero `BEST`, inferencia offline y umbrales calibrados) para equipos que construyan gates de privacidad sobre clasificadores pequeños.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (mmBERT-base) afinado; familia Laya 0.4.31 multilingual |
| Parametros totales | no disponible (repo de 0,7 GB, compatible con base tipo BERT) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors sin cuantizar en el repo) |
| Idiomas soportados | Coreano (tag `korean`); el modelo base es multilingüe, alcance real no documentado |
| Licencia | other (repo privado; modelo base Apache-2.0) |
| Formato de pesos | safetensors (`model.safetensors`), más `encoder/`, `tokenizer/`, `thresholds.json`, `questions.json` |

## Arquitectura y entrenamiento

El modelo parte de Laya 0.4.31 multilingual, construido sobre mmBERT-base (encoder tipo BERT), y se afina como clasificador binario o multiclase para la decisión de "gate" sobre correos. La salida se acompaña de umbrales calibrados (`thresholds.json`) que determinan cuándo un mensaje se considera sensible y debe enrutarse a la nube; según la model card, en la partición de test de 239 casos la versión v13 procesó 222/239 por la ruta prevista y derivó 0 casos sensibles a la nube.

Los datos de entrenamiento combinan: `lablup/tariff_trade_domain.synthetic_trade_email_sum_tag_kr` (CC-BY-4.0) descompuesto a nivel de correo, una parte de `joohans/korean-phishing-email` (Apache-2.0, solo para entrenamiento local), plantillas sintéticas del equipo y correos sintéticos generados con Claude. No se usaron correos reales de usuarios. La mayoría de etiquetas provienen de un LLM grande y no han pasado revisión humana completa, por lo que las métricas reportadas son sobre datos sintéticos. No se documenta el número de tokens de entrenamiento ni si hubo RLHF/DPO.

## Capacidades

- Clasificación de correos para decidir el enrutamiento local frente a nube (tarea principal del gate).
- Detección de contenido sensible o potencialmente sensible en correos en coreano.
- Clasificación de texto genérica compatible con el pipeline `text-classification` de Hugging Face.
- Inferencia totalmente offline una vez descargado el checkpoint (sin llamadas a la nube).
- Versionado automático mediante el fichero `BEST` y fijación de versión con `@v13`.
- No documentado: tool calling, razonamiento multi-paso, agentes, visión, audio o modo thinking.

## Casos de uso

- Gate de privacidad en pipelines de correo: el modelo clasifica cada mensaje entrante y decide si se procesa en local o se envía a un servicio externo, reduciendo la exposición de datos sensibles. Es el caso para el que fue entrenado.
- Cumplimiento y minimización de datos: como paso previo a un LLM en la nube, filtra correos con posibles datos personales y evita enviarlos fuera del perímetro, apoyándose en los umbrales calibrados de `thresholds.json`.
- Enrutamiento de bandeja de entrada: separa correos que requieren tratamiento especial (posible phishing, datos sensibles) del flujo normal, con inferencia local de bajo coste.
- Prefiltro en sistemas antiphishing: al haberse entrenado parcialmente con `korean-phishing-email`, puede usarse como primera capa antes de un clasificador más pesado o de una revisión humana.
- Despliegue en entornos sin conectividad: al funcionar offline tras la descarga, encaja en instalaciones on-premise o air-gapped donde no se permite llamar a APIs externas.
- Integración en backend de aplicación: la librería `laya` permite cargar el checkpoint con `LAYA_CKPT=hf:interfaceinde/laya-gate` y verificar el adaptador en el arranque, lo que facilita actualizaciones controladas por versión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta una métrica operativa interna sobre la partición de test de 239 casos (222/239 procesados por la ruta prevista y 0 casos sensibles derivados a la nube en la versión v13), sin precisar accuracy, F1 ni matriz de confusión.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión; por el tamaño del repo (0,7 GB) y la base tipo BERT, la inferencia en FP32 requeriría del orden de 1-2 GB y en FP16 alrededor de 0,5-1 GB, aunque no está confirmado por el autor.
- GPU recomendadas: no disponibles; cualquier GPU consumer moderna (por ejemplo, RTX 3060 o superior) debería bastar para un encoder de este tamaño, pero es una estimación, no un dato del autor.
- Cabe en GPU consumer: probablemente sí, dado el tamaño del checkpoint; sin confirmación oficial.
- Opciones de despliegue: librería `laya==0.4.31` (vía `LAYA_CKPT`), descarga con `hf download`; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| laya-gate (v13) | no disponible (base mmBERT) | no disponible | Clasificación de correo coreano | other, repo privado | Solo miembros de la organización |
| convaiinnovations/laya (base) | no disponible | no disponible | Modelo multilingüe general | Apache-2.0 | Público en Hugging Face |
| Clasificadores BERT coreanos públicos (p. ej. KoBERT/KcBERT afinados) | ~100M típicamente | 512 tokens típicamente | Clasificación de texto coreano | variable | Públicos |

La comparación con alternativas públicas es aproximada: no hay métricas comparables publicadas para `laya-gate` y el acceso está restringido, por lo que no puede evaluarse en igualdad de condiciones.

## Limitaciones y advertencias

- Repositorio privado: requiere pertenencia a la organización y autenticación con `hf auth login`; no es utilizable por terceros.
- Riesgo de fuga de datos personales: la model card advierte de que parte de los datos de entrenamiento (53 casos de phishing públicos) contenían nombres y direcciones de correo reales, que el modelo podría haber memorizado; por eso se prohíbe su publicación.
- Etiquetas generadas por un LLM grande sin revisión humana completa: la calidad del clasificador está acotada por la del etiquetador.
- Métricas calculadas sobre datos sintéticos: no hay garantía de que el rendimiento se mantenga en correos reales.
- Sesgos y alucinaciones: no documentados; al ser un clasificador, el riesgo principal es de falsos negativos (correos sensibles clasificados como no sensibles) más que de generación.
- Licencia "other" sin términos publicados: no hay base clara para uso comercial ni para redistribución.
- Idiomas: entrenado para coreano; el comportamiento en otros idiomas no está documentado pese a la base multilingüe.
- Dependencia de la librería `laya` y del esquema de versionado `BEST`: cambios en el puntero pueden alterar el comportamiento entre reinicios del backend.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/interfaceinde/laya-gate
- Modelo base Laya: https://huggingface.co/convaiinnovations/laya
- Dataset lablup: `lablup/tariff_trade_domain.synthetic_trade_email_sum_tag_kr` en Hugging Face
- Dataset de phishing: `joohans/korean-phishing-email` en Hugging Face
