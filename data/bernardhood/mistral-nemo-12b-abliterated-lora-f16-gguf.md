# BernardHood/Mistral-Nemo-12B-abliterated-LORA-F16-GGUF

## Resumen

Este repositorio contiene un adaptador LoRA en formato GGUF (precisión F16) derivado de `nbeerbower/Mistral-Nemo-12B-abliterated-LORA`, convertido mediante el espacio de Hugging Face GGUF-my-lora de ggml.ai. No se trata de un modelo completo, sino de un delta de pesos pensado para aplicarse sobre un modelo base Mistral-Nemo de 12.000 millones de parámetros. El adaptador original aplica la técnica de *abliteration*, que modifica los pesos para reducir los mecanismos de rechazo aprendidos durante el ajuste de seguridad, dando lugar a un modelo menos restrictivo en sus respuestas.

El dato de parámetros reportado en safetensors (245.912.576) corresponde al tamaño del propio adaptador LoRA, no al modelo base. El repositorio pesa aproximadamente 0,5 GB, coherente con un adaptador de bajo rango en F16. La relevancia de esta publicación es acotada: se trata de una conversión de formato automatizada, sin métricas, sin evaluación y sin documentación técnica propia más allá de las instrucciones de uso con llama.cpp.

La licencia declarada es Apache-2.0, heredada de la cadena de modelos base, y el uso previsto es la inferencia local con llama.cpp aplicando el adaptador sobre los pesos del modelo Mistral-Nemo correspondiente. No hay información sobre idiomas soportados, pipeline ni resultados de evaluación en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre modelo base transformer Mistral-Nemo 12B; el repositorio no contiene el modelo completo |
| Parametros totales | 245.912.576 (parametros del adaptador LoRA en safetensors, no del modelo base) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible en este repositorio; depende del modelo base Mistral-Nemo (no confirmado en la informacion proporcionada) |
| Tipos de cuantizacion | F16 (unico archivo publicado en este repo) |
| Idiomas soportados | no disponibles |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (adaptador LoRA para llama.cpp); el repo base se distribuye tambien en safetensors via PEFT |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de bajo rango convertido a GGUF, no un modelo entrenado desde cero. La arquitectura subyacente es la del modelo base Mistral-Nemo de 12B, un transformer decoder-only, pero este repositorio solo contiene las matrices de actualizacion de bajo rango (A y B) generadas por el ajuste fino del adaptador original. La conversión a GGUF se realizó con el espacio GGUF-my-lora de ggml.ai, que empaqueta el adaptador en el formato consumible por llama.cpp.

No se dispone de información sobre el dataset de entrenamiento del adaptador original, el número de tokens vistos, la composición de los datos ni si hubo etapas de RLHF o DPO. La técnica declarada por el nombre del adaptador base es *abliteration*, que típicamente consiste en identificar y atenuar direcciones en el espacio de activaciones asociadas al rechazo, pero no se documenta el procedimiento concreto en la información proporcionada. No hay innovaciones técnicas adicionales documentadas en este repositorio.

## Capacidades

- Aplicación de un delta LoRA sobre un modelo base Mistral-Nemo 12B para modular el comportamiento del modelo resultante.
- Generación de texto heredada del modelo base (no verificada en este repositorio).
- Comportamiento menos restrictivo en respuestas derivado de la técnica de abliteration del adaptador original.
- Compatibilidad con llama.cpp mediante `llama-cli` y `llama-server` usando el flag `--lora`.
- No se documentan capacidades específicas de tool calling, function calling, agentes, visión, audio, modo thinking ni multilingüismo en la información disponible.
- No hay evaluación publicada de las capacidades resultantes tras aplicar el adaptador.

## Casos de uso

- Investigación sobre edición de comportamiento en modelos: aplicar el adaptador sobre el modelo base para estudiar cómo el ajuste de bajo rango altera las respuestas de rechazo, comparando salidas con y sin el delta LoRA.
- Experimentación local con llama.cpp: cargar el modelo base en GGUF y aplicar el adaptador F16 con `--lora` para probar variantes de comportamiento sin reentrenar pesos completos.
- Análisis de seguridad y red-teaming: usar el modelo resultante como caso de estudio para medir la eficacia de mecanismos de rechazo y evaluar la robustez de filtros externos.
- Pruebas de pipelines de despliegue LoRA: validar la integración de adaptadores GGUF en `llama-server` y en flujos de inferencia con gestión de múltiples adaptadores.
- Comparación de formatos: contrastar el adaptador GGUF F16 con el adaptador original en safetensors/PEFT para verificar equivalencia numérica y diferencias de latencia.
- Docencia y demostraciones: ilustrar el flujo completo de conversión de un adaptador PEFT a GGUF y su uso con llama.cpp en entornos con recursos limitados.
- No se recomienda su uso en producción orientada a usuarios finales sin una evaluación propia previa, dado que no hay métricas ni garantías de calidad publicadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador en sí ocupa aproximadamente 0,5 GB en disco; el requisito real de VRAM lo determina el modelo base Mistral-Nemo 12B sobre el que se aplica.
- Para el modelo base en F16 se estiman del orden de 24 GB de VRAM o más, sin cuantización; en Q4_K_M el requisito baja aproximadamente a 7-8 GB, aunque estas cifras son estimaciones generales y no están confirmadas en la información proporcionada.
- GPU recomendadas para el modelo base en precisión completa: A100 40 GB, H100, L40S o RTX 4090 24 GB; para cuantizaciones de 4-5 bits, GPU consumer con 8-12 GB pueden ser suficientes.
- Cabe en GPU consumer (RTX 3060 12 GB, RTX 4070, RTX 4090) si el modelo base se cuantiza adecuadamente; el adaptador F16 añade una sobrecarga pequeña.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`) con `--lora`; no se documenta soporte para vLLM, TGI u Ollama en este repositorio, aunque el adaptador original en PEFT podría cargarse con frameworks compatibles.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| BernardHood/Mistral-Nemo-12B-abliterated-LORA-F16-GGUF (este) | 245.912.576 (adaptador) | no disponible | GGUF (LoRA) | apache-2.0 | Conversion automatica del adaptador de nbeerbower |
| nbeerbower/Mistral-Nemo-12B-abliterated-LORA | no disponible | no disponible | safetensors (PEFT) | no disponible | Adaptador original en formato PEFT |
| Mistral-Nemo 12B (modelo base) | ~12.000 millones | no disponible | safetensors, GGUF | no disponible | Modelo completo sobre el que se aplica el adaptador |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- El repositorio no contiene un modelo autónomo: requiere el modelo base Mistral-Nemo 12B en GGUF para funcionar; cargarlo solo producirá un error o resultados inválidos.
- La técnica de abliteration reduce los mecanismos de rechazo, lo que puede incrementar la probabilidad de contenido dañino, sesgado o inexacto; no hay evaluación de seguridad publicada.
- Riesgo elevado de alucinación y de respuestas no verificadas, agravado por la ausencia de benchmarks y de documentación del adaptador original.
- No hay información sobre sesgos conocidos, idiomas soportados ni limitaciones de contexto específicas de este artefacto.
- La licencia Apache-2.0 se declara en el repositorio, pero conviene verificar la licencia efectiva del modelo base y del adaptador original antes de uso comercial.
- Conversión automatizada sin validación aparente: no hay garantía de que el delta GGUF reproduzca exactamente el comportamiento del adaptador PEFT original.
- Sin descargas ni interacción registradas en el momento de la consulta; ausencia de señales de calidad o mantenimiento por parte de la comunidad.
- No apto para producción sin evaluación propia de calidad, seguridad y sesgo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/BernardHood/Mistral-Nemo-12B-abliterated-LORA-F16-GGUF
- Adaptador original: https://huggingface.co/nbeerbower/Mistral-Nemo-12B-abliterated-LORA
- Espacio de conversión GGUF-my-lora: https://huggingface.co/spaces/ggml-org/gguf-my-lora
- Documentación del servidor llama.cpp: https://github.com/ggerganov/llama.cpp/blob/master/examples/server/README.md
- Repositorio llama.cpp: https://github.com/ggerganov/llama.cpp
