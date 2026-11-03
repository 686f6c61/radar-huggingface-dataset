# mradermacher/DeepSeek-R1-Rafayel-14B-V1-GGUF

## Resumen

DeepSeek-R1-Rafayel-14B-V1-GGUF es una colección de cuantizaciones GGUF del modelo base pinka23/DeepSeek-R1-Rafayel-14B-V1, publicada por mradermacher, un conocido creador de cuantizaciones estáticas para la comunidad de inferencia local. El modelo original es un fine-tuning SFT (supervised fine-tuning) sobre una base de la familia Qwen2, con 14.770.033.664 parámetros totales, orientado a generación de texto conversacional en inglés y con licencia Apache 2.0.

La relevancia de esta ficha no reside en el modelo en sí, sino en el paquete de cuantizaciones: mradermacher ofrece 11 variantes GGUF desde Q2_K (5,9 GB) hasta Q8_0 (15,8 GB), lo que permite ejecutar un modelo de casi 15.000 millones de parámetros en hardware de consumo. El repositorio ocupa 102 GB en total y está etiquetado con `endpoints_compatible`, lo que facilita su despliegue en servicios de inferencia compatibles con la API de Hugging Face.

No se dispone de información sobre el contexto máximo, la composición del dataset de entrenamiento ni resultados de benchmarks en la documentación proporcionada. La model card del cuantizador es puramente operativa: lista los ficheros, tamaños y recomendaciones de calidad, sin datos técnicos del modelo subyacente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2, según tags) |
| Parámetros totales | 14.770.033.664 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones); safetensors en el modelo base |

## Arquitectura y entrenamiento

El modelo base pinka23/DeepSeek-R1-Rafayel-14B-V1 es un fine-tuning con SFT (supervised fine-tuning) sobre una arquitectura Qwen2, según los tags del repositorio (`qwen2`, `unsloth`, `trl`, `sft`). El uso de Unsloth y TRL sugiere un pipeline de entrenamiento supervisado optimizado para eficiencia de memoria, típico de fine-tunes comunitarios sobre modelos de 14B. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO.

El nombre del modelo hace referencia a DeepSeek-R1, lo que probablemente indica que el fine-tuning se realizó sobre trazas de razonamiento o datos destilados de R1, aunque esta hipótesis no está confirmada en la documentación. La cuantización la realiza mradermacher con cuantizaciones estáticas (no imatrix), tal y como se indica explícitamente en la model card: "weighted/imatrix quants seem not to be available (by me) at this time".

## Capacidades

- Generación de texto conversacional en inglés, con formato de chat multi-turno.
- Razonamiento de tipo cadena de pensamiento (presumiblemente heredado del linaje DeepSeek-R1, no confirmado).
- Fine-tuning SFT orientado a instrucciones, adecuado para tareas de pregunta-respuesta.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni multi-step reasoning estructurado.
- No se documenta capacidad de visión, audio ni otras modalidades.
- Multilingüismo limitado al inglés según el campo `language`.
- Compatible con `text-generation-inference` y `endpoints_compatible` para despliegue como API.

## Casos de uso

- **Inferencia local en estaciones de trabajo**: con la cuantización Q4_K_M (9,1 GB) el modelo cabe en GPUs de consumo de 12 GB o más, permitiendo ejecutar un 14B en local sin depender de la nube. Adecuado para prototipado y pruebas de concepto.
- **Asistentes conversacionales en inglés**: el fine-tuning SFT sobre Qwen2 lo hace apto para chatbots de dominio general con formato de chat, siempre que el contexto no supere el límite no documentado del modelo.
- **Generación de texto en pipelines por lotes**: la variante Q8_0 (15,8 GB) ofrece la máxima calidad de la colección para tareas de generación offline donde la latencia no es crítica.
- **Despliegue en servidores con TGI**: la etiqueta `endpoints_compatible` y `text-generation-inference` facilitan montar un endpoint HTTP compatible con la API de Hugging Face para integrarlo en aplicaciones existentes.
- **Investigación sobre fine-tunes comunitarios**: útil para estudiar el efecto de fine-tunings SFT sobre bases Qwen2 y comparar con el modelo original.
- **Evaluación de cuantizaciones**: la colección de 11 variantes permite medir el impacto de la cuantización en calidad y velocidad sobre un mismo modelo, útil para calibrar políticas de despliegue.
- **Prototipado de razonamiento en inglés**: si el linaje R1 se confirma, puede emplearse para experimentar con cadenas de razonamiento en entornos controlados y sin requisitos de producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia** (incluye overhead de contexto y KV cache, aproximada):
  - Q2_K (5,9 GB): ~7-8 GB de VRAM.
  - Q4_K_M (9,1 GB): ~11-12 GB de VRAM.
  - Q5_K_M (10,6 GB): ~13 GB de VRAM.
  - Q6_K (12,2 GB): ~15 GB de VRAM.
  - Q8_0 (15,8 GB): ~18-19 GB de VRAM.
- **GPU recomendadas**: RTX 4090 (24 GB) para Q6_K y Q8_0; RTX 4080/4070 Ti Super (16 GB) para Q4_K_M y Q5_K_M; RTX 3060 12 GB o RTX 4070 para Q4_K_S y Q4_K_M.
- **Cabe en GPU de consumo**: sí, desde Q2_K en GPUs de 8 GB hasta Q8_0 en GPUs de 24 GB.
- **Opciones de despliegue**: llama.cpp, Ollama (importando el GGUF), LM Studio, text-generation-inference (para el modelo base en safetensors), vLLM (modelo base).
- **Latencia y throughput**: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| DeepSeek-R1-Rafayel-14B-V1 (este) | 14,77B | no disponible | Apache 2.0 | GGUF / safetensors | Fine-tuning SFT sobre Qwen2, solo inglés |
| Qwen2.5-14B-Instruct | 14,7B | 32.768 tokens (oficial) | Apache 2.0 | safetensors, GGUF | Base oficial con contexto documentado y multilingüe |
| DeepSeek-R1-Distill-Qwen-14B | 14,7B | 32.768 tokens (oficial) | MIT (según modelo original) | safetensors, GGUF | Destilado oficial de R1 sobre Qwen2.5, con benchmarks publicados |

La comparativa se limita a modelos de tamaño similar de la misma familia; no se dispone de datos de rendimiento del modelo evaluado para comparar calidad. La ventaja principal de este repositorio es la disponibilidad de cuantizaciones GGUF listas para usar, frente a la necesidad de cuantizar manualmente el modelo base.

## Limitaciones y advertencias

- **Idioma**: solo inglés; no se debe esperar un rendimiento fiable en castellano u otros idiomas.
- **Contexto no documentado**: se desconoce la longitud máxima de contexto, lo que impide planificar despliegues con prompts largos.
- **Sin benchmarks**: no hay evidencia pública de calidad; el rendimiento real es incierto.
- **Cuantizaciones estáticas**: no hay variantes imatrix, que suelen ofrecer mejor relación calidad/tamaño en Q2-Q4.
- **Riesgo de alucinación**: inherente a los modelos de lenguaje; sin datos de evaluación no se puede acotar.
- **Linaje incierto**: el nombre sugiere razonamiento tipo R1, pero no está confirmado; no asumir capacidades de cadena de pensamiento.
- **Licencia Apache 2.0**: permite uso comercial, pero el modelo base podría tener restricciones adicionales no reflejadas; conviene verificar el repo original.
- **Repositorio de 102 GB**: descargar la colección completa consume mucho espacio; descargar solo la variante necesaria.
- **Popularidad muy baja** (31 descargas, 0 likes): sin validación comunitaria, usar con cautela en producción.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/DeepSeek-R1-Rafayel-14B-V1-GGUF
- Modelo base: https://huggingface.co/pinka23/DeepSeek-R1-Rafayel-14B-V1
- Página de descargas del cuantizador: https://hf.tst.eu/model#DeepSeek-R1-Rafayel-14B-V1-GGUF
- README de referencia para uso de GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Guía de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
