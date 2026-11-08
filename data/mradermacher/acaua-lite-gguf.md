# mradermacher/Acaua-Lite-GGUF

## Resumen

Acaua-Lite es un modelo de lenguaje desarrollado por HarpiaIA, distribuido originalmente en Hugging Face bajo el identificador `HarpiaIA/Acaua-Lite`. La ficha que nos ocupa, `mradermacher/Acaua-Lite-GGUF`, es una republicación no oficial en formato GGUF generada por el usuario mradermacher mediante su pipeline automatizado de cuantización estática, que produce múltiples niveles de compresión (desde Q2_K hasta Q8_0, además de F16 e IQ4_XS) a partir de los pesos originales en formato Hugging Face.

El repositorio no incluye model card descriptiva más allá de los metadatos generados automáticamente por la herramienta de conversión, por lo que no se dispone de información pública sobre arquitectura, número de parámetros, longitud de contexto, datos de entrenamiento ni licencia. La ausencia de descargas y likes en el momento de la consulta, junto con la fecha de creación (2026-11-08), sugiere una publicación muy reciente y sin validación comunitaria todavía.

La relevancia de esta ficha es, por tanto, doble: por un lado documenta la existencia de una familia de cuantizaciones GGUF de un modelo de HarpiaIA; por otro, sirve como ejemplo de los riesgos de trazabilidad que introduce la cadena de republicación de pesos (modelo original → cuantizador → usuario final), donde metadatos esenciales como licencia o idiomas pueden perderse por el camino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estáticas); pesos originales presumiblemente en safetensors en `HarpiaIA/Acaua-Lite` |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo base en la documentación proporcionada. La model card del repositorio GGUF únicamente contiene metadatos del proceso de conversión (`quantize_version: 2`, `output_tensor_quantised: 1`, `convert_type: hf`), que indican que los pesos se convirtieron desde el formato Hugging Face y que la cuantización es estática (no dinámica en tiempo de carga).

El pipeline de mradermacher genera cuantizaciones con llama.cpp a partir de los tensores originales, aplicando una matriz de importancia (imatrix) cuando está disponible. En el caso de la variante de bartowski del mismo modelo se menciona un fichero de calibración (`HarpiaIA_Acaua-Lite-calibration-v6.txt`) y una imatrix específica, lo que sugiere que el modelo base es lo bastante pequeño o lo bastante popular como para que cuantizadores independientes hayan generado sus propias matrices de calibración. No hay información sobre tokens de entrenamiento, composición del dataset, RLHF, DPO ni innovaciones técnicas (atención lineal, decodificación especulativa, etc.).

## Capacidades

- No se han documentado capacidades específicas en la información disponible.
- No consta soporte explícito de tool calling o function calling.
- No consta soporte de agentes o razonamiento multi-paso.
- No consta información sobre capacidades multilingües.
- No consta modo thinking, visión, audio ni otras capacidades especiales.
- Por el nombre "Lite" y la existencia de cuantizaciones hasta Q2_K, se infiere que el modelo es de tamaño reducido y apto para despliegue en hardware modesto, pero esta inferencia no está confirmada por documentación oficial.

## Casos de uso

Dado que no se dispone de información sobre las capacidades reales del modelo, los casos de uso que se enumeran a continuación son escenarios genéricos aplicables a modelos de lenguaje cuantizados en GGUF de tamaño pequeño o medio, y deben validarse empíricamente antes de su adopción en producción:

- Inferencia local en portátiles: las cuantizaciones Q4_K_M y Q5_K_M permiten ejecutar el modelo con llama.cpp u Ollama en equipos sin GPU dedicada, siempre que el tamaño real del modelo lo permita (dato no disponible).
- Prototipado rápido de aplicaciones de chat: el formato GGUF se integra directamente con llama.cpp, Ollama y servidores compatibles con la API de OpenAI, lo que facilita montar un endpoint de pruebas en minutos.
- Evaluación comparativa de cuantizaciones: la disponibilidad de 12 niveles de cuantización permite medir la degradación de calidad frente a tamaño en un mismo modelo, útil para investigación sobre compresión.
- Despliegue en dispositivos edge: las variantes Q2_K y Q3_K_S minimizan el uso de memoria y podrían caber en entornos con restricciones severas de RAM/VRAM, a costa de una pérdida de calidad no cuantificada.
- Fine-tuning ligero sobre la versión F16: la cuantización F16 preserva la máxima fidelidad respecto al modelo original y sirve como base para LoRA o QLoRA, aunque requeriría confirmar la arquitectura y el tokenizador.
- Integración en pipelines de generación de texto offline: al no requerir conexión a servicios en la nube, el modelo puede usarse en entornos air-gapped para tareas de resumen o clasificación, previa validación de su calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible, al desconocerse el número de parámetros del modelo.
- GPU recomendadas: no disponible.
- Viabilidad en GPU de consumo: no confirmada; dependerá del tamaño real del modelo. Las cuantizaciones Q4_K_M y Q5_K_M son las habitualmente recomendadas para GPUs de consumo (RTX 3060, 4060, 4090) en modelos de 7B-13B, pero este dato no puede verificarse aquí.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier servidor compatible con GGUF (por ejemplo, llama-cpp-python o servidores que expongan API OpenAI). No consta compatibilidad con vLLM o TGI, que habitualmente requieren safetensors.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Acaua-Lite (mradermacher GGUF) | no disponible | no disponible | no disponible | GGUF | Hugging Face |
| HarpiaIA/Acaua-Lite (original) | no disponible | no disponible | no disponible | presumiblemente safetensors | Hugging Face |
| bartowski/HarpiaIA_Acaua-Lite-GGUF | no disponible | no disponible | no disponible | GGUF | Hugging Face |

No se dispone de información suficiente para comparar con modelos de otras familias (Llama, Qwen, Mistral, Gemma, etc.), ya que se desconocen parámetros, contexto y licencia del modelo evaluado.

## Limitaciones y advertencias

- Ausencia total de model card descriptiva: no se documentan arquitectura, datos de entrenamiento, licencia ni idiomas, lo que impide evaluar su idoneidad para uso comercial.
- La licencia del modelo original no está declarada en esta ficha; es imprescindible consultar `HarpiaIA/Acaua-Lite` antes de cualquier uso, especialmente comercial.
- Riesgo de alucinación: no cuantificado; sin benchmarks ni evaluaciones publicadas no puede estimarse su fiabilidad.
- Sesgos: desconocidos, al no documentarse la composición del corpus de entrenamiento.
- Las cuantizaciones de baja precisión (Q2_K, Q3_K_S) pueden degradar notablemente la calidad; se recomienda validar Q4_K_M o superior para producción.
- La cadena de republicación (modelo original → cuantizador → usuario) puede introducir discrepancias entre los pesos originales y los GGUF; conviene verificar checksums si se usa en entornos críticos.
- Fecha de creación futura (2026-11-08) y ausencia de descargas/likes: repositorio sin validación comunitaria, con riesgo de que los pesos no hayan sido probados por terceros.
- No se garantiza compatibilidad con herramientas que esperen safetensors (vLLM, TGI); el uso queda restringido al ecosistema GGUF.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Acaua-Lite-GGUF
- Modelo original: https://huggingface.co/HarpiaIA/Acaua-Lite
- Cuantizaciones alternativas de bartowski: https://huggingface.co/bartowski/HarpiaIA_Acaua-Lite-GGUF
- Fichero de calibración (bartowski): https://huggingface.co/bartowski/HarpiaIA_Acaua-Lite-GGUF (referencia `HarpiaIA_Acaua-Lite-calibration-v6.txt` en el repositorio)
- Imatrix (bartowski): https://huggingface.co/bartowski/HarpiaIA_Acaua-Lite-GGUF (referencia `HarpiaIA_Acaua-Lite-imatrix.gguf` en el repositorio)
