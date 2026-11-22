# mradermacher/Gemma-4-12B-Aether-i1-GGUF

## Resumen

Gemma-4-12B-Aether-i1-GGUF es una colección de cuantizaciones GGUF del modelo Gemma-4-12B-Aether, un ajuste fino del modelo base Gemma 4 de 12B desarrollado por el usuario emkey1 y cuantizado por mradermacher. El modelo original incorpora los tags "code", "aether" y "conversational", lo que sugiere una especialización en generación de código y diálogo, aunque la model card no detalla la composición exacta del dataset de ajuste fino. Con 11.907.350.576 parámetros totales (aproximadamente 11,9 mil millones), se posiciona en la gama media de modelos densos, adecuado para despliegue en hardware de consumo con las cuantizaciones más agresivas.

El repositorio ofrece cuantizaciones de tipo imatrix (i1) generadas con el método de importancia matricial, que suele preservar mejor la calidad que las cuantizaciones estáticas equivalentes en tamaño. La colección cubre desde IQ1_S (3,1 GB) hasta Q6_K (9,9 GB), lo que permite ejecutar el modelo en GPUs con tan solo 4-6 GB de VRAM en configuraciones muy comprimidas, o en configuraciones de mayor calidad en GPUs de 12-16 GB. La licencia Apache 2.0 facilita el uso comercial sin restricciones adicionales.

La relevancia actual de esta ficha radica en que permite a desarrolladores e investigadores evaluar rápidamente si el modelo ajustado se adecúa a sus necesidades de código y conversación, y seleccionar la cuantización adecuada según su presupuesto de hardware. No obstante, la ausencia de benchmarks publicados y de documentación detallada sobre el ajuste fino limita la evaluación rigurosa de su rendimiento real frente a alternativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Gemma 4, según tags del modelo base) |
| Parametros totales | 11.907.350.576 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, IQ3_S, Q3_K_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, IQ4_NL, Q4_0, Q4_K_S, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K (todas i1/imatrix) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones); safetensors en el modelo base |

## Arquitectura y entrenamiento

La arquitectura subyacente corresponde a un transformer denso derivado de Gemma 4, según los tags del modelo base (`gemma4`). El modelo original Gemma-4-12B-Aether es un ajuste fino de emkey1 sobre el modelo base Gemma 4, orientado a código y conversación según los tags `code`, `aether` y `conversational`. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset de ajuste fino, ni si se emplearon técnicas de RLHF, DPO o SFT. Tampoco se documentan innovaciones arquitectónicas específicas del ajuste fino.

La contribución de mradermacher en este repositorio es exclusivamente la cuantización: se generaron cuantizaciones de tipo imatrix (i1), que emplean un fichero de importancia matricial (`Gemma-4-12B-Aether.imatrix.gguf`, 0,1 GB) para ponderar la cuantización de los tensores según su relevancia. Según la model card, las cuantizaciones i1 suelen superar en calidad a las cuantizaciones estáticas de tamaño equivalente (por ejemplo, i1-IQ3_S "beats Q3_K*"). El repositorio también referencia cuantizaciones estáticas en `mradermacher/Gemma-4-12B-Aether-GGUF`.

## Capacidades

- Generación de texto conversacional: el tag `conversational` indica soporte para diálogo multi-turno.
- Generación de código: el tag `code` sugiere especialización en tareas de programación, aunque no se detalla el alcance.
- Razonamiento general: capacidad heredada del modelo base Gemma 4, sin datos específicos publicados.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según el campo `language: en`.
- Capacidades especiales (thinking mode, visión, audio): no disponible en la información proporcionada.

## Casos de uso

- Asistente de código en local: el modelo puede integrarse en editores o terminales mediante llama.cpp u Ollama, aprovechando la cuantización Q4_K_M (7,5 GB) para autocompletado y generación de fragmentos de código en inglés.
- Chat conversacional con privacidad: al ejecutarse localmente con cuantizaciones IQ3_M (5,8 GB) o Q4_K_S (7,1 GB), permite desplegar un asistente conversacional sin enviar datos a servicios externos, adecuado para entornos con requisitos de confidencialidad.
- Prototipado rápido en GPUs de consumo: con IQ2_M (4,5 GB) o IQ3_XS (5,4 GB) se puede validar el comportamiento del modelo en una RTX 3060 de 12 GB o similar antes de invertir en hardware mayor.
- Generación de documentación técnica: el modelo puede redactar explicaciones y comentarios de código en inglés, útil en pipelines de documentación automatizada.
- Evaluación comparativa de ajustes finos: investigadores pueden comparar el comportamiento de este ajuste fino frente al Gemma 4 base usando las distintas cuantizaciones para aislar el efecto de la compresión.
- Despliegue en entornos con recursos limitados: las cuantizaciones IQ1_S (3,1 GB) e IQ2_XXS (3,7 GB) permiten ejecutar el modelo en GPUs de 4-6 GB, aunque con degradación de calidad notable según la propia model card ("for the desperate").

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización):
  - IQ1_S: ~3,1 GB de pesos; ~4 GB de VRAM total con contexto moderado.
  - IQ2_M: ~4,5 GB de pesos; ~5,5-6 GB de VRAM.
  - IQ3_M: ~5,8 GB de pesos; ~7 GB de VRAM.
  - Q4_K_M: ~7,5 GB de pesos; ~8,5-9 GB de VRAM.
  - Q5_K_M: ~8,6 GB de pesos; ~10 GB de VRAM.
  - Q6_K: ~9,9 GB de pesos; ~11-12 GB de VRAM.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080, RTX 4090, A100, H100 para las cuantizaciones de mayor calidad y contextos largos.
- ¿Cabe en consumer GPU? Sí: las cuantizaciones IQ2/IQ3 caben en GPUs de 6-8 GB; Q4_K_M y superiores requieren 10-12 GB o más.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y cualquier runtime compatible con GGUF; el modelo base también es compatible con transformers (formato safetensors).
- Latencia y throughput estimados: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Gemma-4-12B-Aether-i1-GGUF (este) | 11,9B | no disponible | Apache 2.0 | GGUF | Ajuste fino de código/conversación, solo inglés |
| Gemma-4-12B-Aether (base) | 11,9B | no disponible | Apache 2.0 | safetensors | Modelo original sin cuantizar |
| Gemma-4-12B-Aether-GGUF (estático) | 11,9B | no disponible | Apache 2.0 | GGUF | Cuantizaciones estáticas del mismo modelo |
| Gemma 4 base (12B) | ~12B | no disponible | Apache 2.0 (según familia Gemma) | safetensors | Modelo original sin ajuste fino |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Idiomas: el modelo solo declara soporte para inglés (`language: en`), por lo que su rendimiento en castellano u otros idiomas no está garantizado.
- Sesgos conocidos: no se documentan en la model card; al derivar de Gemma 4, puede heredar sesgos del modelo base, pero no hay información específica.
- Riesgo de alucinación: no cuantificado; al ser un ajuste fino sin benchmarks publicados, no se puede estimar su fiabilidad factual.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificación y redistribución con atribución; sin embargo, el modelo base Gemma 4 puede tener términos adicionales de la familia Gemma que conviene verificar.
- Caveats para producción: las cuantizaciones IQ1 e IQ2 presentan degradación de calidad significativa según la propia model card ("for the desperate", "very low quality"); se recomienda Q4_K_M o superior para uso serio.
- Falta de documentación: no hay información sobre contexto máximo, dataset de entrenamiento ni evaluación, lo que dificulta validar su idoneidad en producción.
- El repositorio tiene 0 likes y 10.294 descargas, lo que sugiere adopción limitada y poca validación comunitaria.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Gemma-4-12B-Aether-i1-GGUF
- Modelo base: https://huggingface.co/emkey1/Gemma-4-12B-Aether
- Cuantizaciones estáticas: https://huggingface.co/mradermacher/Gemma-4-12B-Aether-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#Gemma-4-12B-Aether-i1-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
