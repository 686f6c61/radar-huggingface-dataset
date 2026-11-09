# IndrasMirror/Qwen4-27B-XQ-Uncensored

## Resumen

Qwen4-27B-XQ-Uncensored es un repositorio reservado en Hugging Face publicado por el usuario IndrasMirror. No contiene pesos: la model card indica explícitamente que no hay archivos de modelo ni es apto para inferencia. Su propósito es reservar el nombre para una futura publicación de Qwen4-27B con la dirección de rechazo (refusal direction) eliminada de los pesos y cuantizada en el formato propio XQ, un GGUF de precisión mixta. El modelo base, Qwen4-27B, todavía no ha sido publicado por Alibaba en el momento de creación del repositorio.

El interés técnico del anuncio reside en la metodología prometida: la edición se aplicaría sobre los pesos en BF16 completos antes de la cuantización, se publicaría una referencia abliterada de alta precisión sin editar para poder medir la divergencia de cada archivo XQ, y se ofrecería una escalera de tamaños en lugar de un único fichero. Cada nivel incluiría su tamaño y su divergencia respecto a la referencia, de modo que el usuario pudiera elegir por hardware y no por intuición.

Actualmente el repositorio no ofrece ningún artefacto descargable ni resultados medidos. Toda la información sobre arquitectura, entrenamiento y rendimiento del modelo base es desconocida porque Qwen4-27B no existe como release oficial. La ficha refleja, por tanto, el estado real del repositorio y marca como no disponibles los datos que no han sido publicados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (dependerá de Qwen4-27B, aún no publicado) |
| Parámetros totales | 27B (según el nombre del repositorio; no verificado con pesos) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GGUF de precisión mixta (formato XQ del autor); niveles concretos no publicados |
| Idiomas soportados | en, zh, code |
| Licencia | apache-2.0 (el repositorio indica que seguirá la licencia del release de Qwen4-27B) |
| Formato de pesos | GGUF (precisión mixta XQ); sin archivos publicados actualmente |

## Arquitectura y entrenamiento

No hay información disponible sobre la arquitectura del modelo base, ya que Qwen4-27B no ha sido liberado por Alibaba. El repositorio reservado describe únicamente el proceso previsto: partir del release oficial en BF16, aplicar una edición de eliminación de la dirección de rechazo sobre los pesos completos y, posteriormente, cuantizar en el formato XQ de precisión mixta. Se menciona también la publicación de una referencia abliterada de alta precisión sin editar para medir la divergencia de cada nivel de cuantización.

No se especifican datos de entrenamiento, número de tokens, composición del dataset ni si hubo RLHF o DPO. Tampoco se detallan innovaciones técnicas del modelo base. La única innovación descrita es el formato XQ, una escalera de GGUF de precisión mixta con métricas de divergencia por archivo, pero no se han publicado especificaciones técnicas de dicho formato.

## Capacidades

- No hay capacidades verificadas: el repositorio no contiene pesos y no es apto para inferencia.
- El nombre del repositorio sugiere generación de texto, razonamiento y código, pero no hay evidencia publicada.
- Los tags indican soporte para inglés, chino y código, sin datos que lo confirmen.
- No se documenta soporte de tool calling, function calling ni agentes.
- No se documenta modo thinking, visión ni audio.
- La edición abliterated prometida implicaría la eliminación de la dirección de rechazo, pero no se ha aplicado ni verificado sobre ningún peso.

## Casos de uso

- Evaluación de la viabilidad de un pipeline de abliteración sobre modelos Qwen: el repositorio describe la metodología, pero no permite ejecutarla hasta que se publiquen los pesos.
- Seguimiento de releases: útil para quien quiera ser notificado cuando Alibaba publique Qwen4-27B y el autor suba los archivos XQ.
- Planificación de despliegue por hardware: la escalera de tamaños prometida permitiría elegir un GGUF según la VRAM disponible, pero los niveles concretos no están publicados.
- Investigación sobre cuantización de precisión mixta: el formato XQ y las métricas de divergencia por archivo serían relevantes para estudiar el compromiso entre tamaño y fidelidad, una vez disponibles.
- Comparación de ediciones abliterated: la referencia sin editar permitiría medir el impacto de la eliminación de la dirección de rechazo, pero no hay artefactos que comparar.
- Uso en producción: no viable actualmente, ya que no existen pesos descargables ni resultados de evaluación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible, al no existir pesos publicados.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: el tag "consumer-gpu" sugiere que se apuntará a ese segmento, pero no hay niveles concretos publicados.
- Opciones de despliegue: previsiblemente llama.cpp y derivados (Ollama, LM Studio) por el formato GGUF, si bien no se confirma en la model card.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| IndrasMirror/Qwen4-27B-XQ-Uncensored | 27B (según nombre, no verificado) | no disponible | apache-2.0 | Sin pesos; repositorio reservado |
| Qwen2.5-32B-Instruct | 32B | 32K (hasta 128K con RoPE) | apache-2.0 | Pesos publicados en BF16 y GGUF |
| Qwen2.5-Coder-32B-Instruct | 32B | 32K (hasta 128K con RoPE) | apache-2.0 | Pesos publicados en BF16 y GGUF |
| Gemma-2-27B-it | 27B | 8K | Gemma license | Pesos publicados en BF16 y GGUF |

La comparativa con Qwen4-27B no es posible porque el modelo base no ha sido liberado. Los modelos de la tabla se incluyen como referencia de la categoría de tamaño (27B-32B), no como equivalentes funcionales del repositorio descrito.

## Limitaciones y advertencias

- El repositorio no contiene pesos: no es posible descargar ni ejecutar el modelo.
- El modelo base Qwen4-27B no ha sido publicado por Alibaba, por lo que todas las especificaciones son provisionales.
- No hay benchmarks, evaluaciones ni métricas de divergencia publicadas.
- La edición abliterated no ha sido aplicada ni verificada; no hay garantía de que elimine la dirección de rechazo de forma efectiva.
- El formato XQ no está documentado técnicamente en la model card.
- Riesgo de confusión: existen otros repositorios "Qwen4" en el Hub sin pesos; conviene verificar siempre la presencia real de archivos antes de integrar cualquier dependencia.
- La licencia apache-2.0 declarada está supeditada a la licencia del release oficial de Qwen4-27B; si esta difiere, prevalecerá la del modelo base.
- Un modelo abliterated puede presentar mayor propensión a generar contenido no deseado y requerir filtros adicionales en producción.
- No se documentan sesgos conocidos, riesgos de alucinación ni limitaciones idiomáticas más allá de los idiomas declarados.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/IndrasMirror/Qwen4-27B-XQ-Uncensored
- Modelo base previsto (no publicado): https://huggingface.co/Qwen/Qwen4-27B
- Organización Qwen en Hugging Face: https://huggingface.co/Qwen
- No se han encontrado papers, blogs, repositorios de código ni demos adicionales en la información proporcionada.
