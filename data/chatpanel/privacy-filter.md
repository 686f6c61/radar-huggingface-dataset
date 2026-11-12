# ChatPanel/privacy-filter

## Resumen

`ChatPanel/privacy-filter` es una réplica sin modificaciones del modelo `openai/privacy-filter`, publicada por ChatPanel para que su pasarela (gateway) descargue desde un único repositorio todos los modelos que ejecuta. No se ha reentrenado, convertido ni editado ningún fichero: los pesos y la configuración son idénticos byte a byte a los del repositorio upstream en el commit `7ffa9a043d54d1be65afb281eddf0ffbe629385b`.

El modelo se distribuye exclusivamente en formato ONNX cuantizado (`onnx/model_quantized.onnx` más su fichero de datos externo), con un peso total de repositorio de 1,6 GB. Incluye además un fichero `viterbi_calibration.json`, lo que sugiere una etapa de decodificación o calibración basada en Viterbi, habitual en tareas de etiquetado de secuencias como la detección de entidades.

Por su nombre y por el tag `openai_privacy_filter`, el caso de uso previsto es la detección y filtrado de información personal identificable (PII) en texto. La licencia es Apache 2.0, heredada del upstream. La model card de este repositorio no aporta detalles sobre arquitectura, número de parámetros, contexto ni idiomas: esa información solo podría obtenerse del `UPSTREAM_README.md` o del repositorio original de OpenAI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | ONNX cuantizado (`model_quantized.onnx`); no se detalla el esquema exacto |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (con fichero de datos externo `onnx_data`), `config.json`, `tokenizer.json`, `viterbi_calibration.json` |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna en la documentación proporcionada. El repositorio solo contiene la configuración, el tokenizador, los pesos ONNX cuantizados y un fichero de calibración de Viterbi. La presencia de `viterbi_calibration.json` apunta a un modelo de etiquetado de secuencias (posiblemente token classification) con una capa de decodificación restringida por transiciones entre etiquetas, técnica típica en extracción de entidades.

Tampoco hay datos sobre el corpus de entrenamiento, el número de tokens, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO. Este repositorio es una copia de distribución: cualquier detalle de entrenamiento debe consultarse en el repositorio original de OpenAI referenciado en la model card.

## Capacidades

- Filtrado y detección de información personal (PII) en texto, según se deduce del nombre del modelo y del tag `openai_privacy_filter`.
- Etiquetado de secuencias con decodificación calibrada (fichero `viterbi_calibration.json`), orientado a extracción de entidades.
- Ejecución mediante runtime ONNX, lo que permite inferencia en CPU sin dependencia de frameworks de deep learning completos.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Redacción de PII en pipelines de registro: el modelo puede ejecutarse como etapa previa al almacenamiento de logs para detectar y enmascarar nombres, correos o identificadores antes de persistir el texto.
- Cumplimiento de RGPD en atención al cliente: integrado en la pasarela de ChatPanel, permite filtrar conversaciones antes de enviarlas a un modelo generativo de terceros o de guardarlas en un histórico.
- Preprocesado de datasets para entrenamiento: sirve para limpiar corpus que contienen datos personales antes de publicarlos o reutilizarlos, reduciendo el riesgo legal.
- Enrutado seguro en gateways de LLM: al ser un modelo ONNX ligero y cuantizado, puede desplegarse en el mismo nodo que el gateway para decidir si una petición contiene datos sensibles y debe bloquearse o anonimizarse.
- Moderación de contenido en aplicaciones de chat: detección de identificadores expuestos por los usuarios en tiempo real, con baja latencia al ejecutarse en CPU mediante ONNX Runtime.
- Auditoría de documentos internos: análisis por lotes de contratos, correos o informes para localizar y clasificar entidades personales antes de compartirlos con departamentos externos.
- Anonimización previa a evaluación de modelos: filtrar los conjuntos de evaluación para evitar que las métricas se contaminen con datos personales reales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El repositorio completo ocupa 1,6 GB, pero el peso real del modelo cuantizado en ONNX es inferior; el tamaño exacto de los parámetros no se detalla.
- Inferencia en CPU viable mediante ONNX Runtime, dado el formato cuantizado y la ausencia de dependencia de GPU en la model card.
- VRAM estimada para GPU: no disponible con precisión; por el tamaño del repositorio, cabría en GPUs consumer con 4-8 GB de VRAM, aunque no se confirma.
- GPUs recomendadas: no disponible. Al ser un modelo de filtrado y no generativo, no requiere A100 ni H100.
- Despliegue: ONNX Runtime (Python, C++, JavaScript), posible integración con servidores de inferencia compatibles con ONNX. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este formato.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables ni datos de rendimiento que permitan una comparación rigurosa con alternativas de filtrado de PII.

## Limitaciones y advertencias

- La model card de este repositorio no documenta arquitectura, parámetros, contexto ni idiomas; cualquier evaluación técnica requiere consultar el repositorio upstream de OpenAI.
- Es una copia de distribución: los errores o sesgos del modelo original se heredan sin cambios.
- Riesgo de alucinación y de falsos negativos en la detección de PII: no hay métricas publicadas en la información disponible que permitan acotar la tasa de error.
- No se especifican los idiomas cubiertos; el rendimiento en castellano es desconocido.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del repositorio upstream y las obligaciones de atribución.
- El uso en producción como filtro de cumplimiento normativo exige validación propia: un modelo de detección de PII no sustituye una auditoría legal.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia comunitaria de uso.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/ChatPanel/privacy-filter
- Modelo upstream: https://huggingface.co/openai/privacy-filter
- Commit upstream referenciado: `7ffa9a043d54d1be65afb281eddf0ffbe629385b`
