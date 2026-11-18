# C3Nt0/nora-v2.4

## Resumen

Nora V2.4 es un modelo de clasificación de texto en italiano, especializado en la detección de intenciones (intent classification) en conversaciones de WhatsApp. Lo desarrolla C3Nt0 como un fine-tune de su modelo previo `C3Nt0/nora-v2.3`, entrenado sobre el dataset propio `C3Nt0/nora-v2.4-multisector-conv-1400`, que reúne conversaciones multi-sector. El modelo se distribuye bajo licencia Apache 2.0 y está pensado para integrarse en pipelines de transformers como clasificador de intenciones.

La información pública disponible es muy limitada: la model card es un esqueleto que describe el proceso de entrenamiento (Kaggle con dos GPU T4) y los repositorios de origen de los datos y los pesos, pero no detalla arquitectura, número de parámetros, longitud de contexto ni resultados de evaluación. El repositorio registra cero descargas y cero likes en el momento de la consulta, y no se han publicado benchmarks ni demos asociadas.

Por tanto, esta ficha se limita a documentar lo que el autor declara explícitamente y marca como "no disponible" todo aquello que no figura en la información proporcionada. La relevancia actual del modelo es acotada: se trata de un artefacto de fine-tuning de nicho, orientado a un caso de uso concreto (clasificación de intenciones en italiano para mensajería) y sin validación pública documentada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (hereda de `C3Nt0/nora-v2.3`; no se especifica) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | italiano (`it`) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (repositorio de transformers; no se detalla safetensors/GGUF) |

## Arquitectura y entrenamiento

No se especifica la arquitectura del modelo en la información disponible. El autor indica únicamente que Nora V2.4 es un fine-tune de `C3Nt0/nora-v2.3` sobre el dataset `C3Nt0/nora-v2.4-multisector-conv-1400`, usando el fichero `ft_turns.jsonl` como datos de entrenamiento. El pipeline declarado es `text-classification`, con etiquetas temáticas que incluyen `nora`, `engram`, `multisector`, `whatsapp` e `intent-classification`.

El entrenamiento se realizó en Kaggle con dos GPU T4, según el notebook `nora_v24_final_kaggle_dual_t4.ipynb` alojado en el bundle `C3Nt0/nora-v2-colab-bundle`. La model card señala que los pesos se publican tras ejecutar las celdas de entrenamiento y push del notebook. No se documentan número de tokens de entrenamiento, composición del dataset, uso de RLHF/DPO ni innovaciones técnicas (atención lineal, decodificación especulativa, etc.).

## Capacidades

- Clasificación de texto orientada a detección de intenciones en conversaciones de WhatsApp.
- Etiquetado multi-sector: el dataset de entrenamiento se declara "multisector", lo que sugiere cobertura de varios dominios conversacionales, aunque no se detallan las categorías.
- Pipeline `transformers` de `text-classification`, integrable mediante `pipeline()` o `AutoModelForSequenceClassification`.
- Compatible con endpoints (tag `endpoints_compatible`).
- Idioma: únicamente italiano.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, visión, tool calling, agentes ni modo "thinking".

## Casos de uso

- Enrutado de intenciones en atención al cliente por WhatsApp: el modelo clasificaría el mensaje entrante del usuario en una categoría de intención para derivarlo al flujo o agente adecuado, aprovechando que fue entrenado específicamente sobre conversaciones de ese canal.
- Triaje de bandeja de entrada en soporte: clasificación automática de mensajes multi-sector para priorizar consultas (por ejemplo, incidencias frente a consultas comerciales), siempre que las etiquetas del modelo coincidan con la taxonomía del negocio.
- Etiquetado asíncrono de conversaciones históricas: uso batch para anotar grandes volúmenes de transcripciones y construir dashboards de motivos de contacto.
- Filtrado previo en chatbots: clasificar la intención antes de invocar un LLM generativo, reduciendo coste y latencia al resolver casos simples con el clasificador.
- Moderación y detección de temas sensibles: si el dataset de entrenamiento incluye categorías de este tipo, podría usarse para marcar conversaciones que requieran revisión humana, aunque la model card no lo confirma.
- Investigación sobre clasificación de intenciones en italiano: como baseline reproducible (notebook de Kaggle incluido) para comparar con otros clasificadores en este idioma.
- Integración en pipelines de mensajería vía endpoints: el tag `endpoints_compatible` permite desplegarlo como servicio de clasificación detrás de una API.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (no se especifica el tamaño del modelo).
- GPU recomendadas: no disponible; el autor solo documenta el uso de 2× T4 de Kaggle para el entrenamiento.
- Viabilidad en GPU de consumo: no determinable sin conocer el número de parámetros.
- Opciones de despliegue: `transformers` (pipeline de `text-classification`); compatible con endpoints según los tags. No se confirma soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables ni datos de rendimiento que permitan una comparación fundamentada con alternativas de la misma categoría (clasificación de intenciones en italiano).

## Limitaciones y advertencias

- Información técnica mínima: no se publican arquitectura, parámetros, contexto ni evaluación, lo que impide estimar calidad y coste de despliegue.
- Sin validación pública: cero descargas y cero likes en el momento de la consulta; no hay evidencia de uso en producción ni benchmarks reproducibles.
- Monolingüe: solo italiano; no apto para conversaciones en castellano u otros idiomas sin reentrenamiento.
- Dominio estrecho: entrenado sobre conversaciones de WhatsApp multi-sector; el rendimiento fuera de ese canal o de esa taxonomía de intenciones es desconocido.
- Riesgo de alucinación: no aplica en sentido generativo (es un clasificador), pero sí existe riesgo de clasificaciones erróneas o sobreconfiadas en intenciones no vistas durante el entrenamiento.
- Sesgos: no documentados; al derivar de conversaciones reales de un canal concreto, puede heredar sesgos de ese corpus.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte.
- Dependencia de la cadena de fine-tunes: al heredar de `nora-v2.3`, arrastra las limitaciones no documentadas de los modelos anteriores.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/C3Nt0/nora-v2.4
- Modelo base: https://huggingface.co/C3Nt0/nora-v2.3
- Dataset de entrenamiento: https://huggingface.co/datasets/C3Nt0/nora-v2.4-multisector-conv-1400
- Bundle con el notebook de entrenamiento: https://huggingface.co/C3Nt0/nora-v2-colab-bundle/blob/main/nora_v24_final_kaggle_dual_t4.ipynb
