# 3MPER0RR/Ornith1.5-9B-3MPER0RR-obliterated

## Resumen

Ornith1.5-9B-3MPER0RR-obliterated es un ajuste fino (fine-tune) del modelo base ornith-ai/Ornith-1.5-9B, publicado por el usuario 3MPER0RR en Hugging Face. Se trata de una variante "abliterated" (el autor usa el término "obliterated"), una practica habitual en la comunidad open source que consiste en modificar los pesos del modelo para eliminar o atenuar los mecanismos de rechazo aprendidos durante el alineamiento, de modo que el modelo responda a peticiones que el modelo original declinaria.

El modelo conserva la arquitectura del original (etiquetada como qwen3_5 en los metadatos de Hugging Face) y sus 9.409.813.744 parametros reales en safetensors, con un repositorio de 18,8 GB en precision completa. La model card es extremadamente escueta: no documenta el proceso de entrenamiento, los datos utilizados, la composicion del dataset ni los hiperparametros, limitandose a indicar el modelo base, la licencia MIT y una referencia a un aviso de investigacion.

Su relevancia es limitada y de nicho: interesa a quienes investigan el comportamiento de modelos sin alineamiento, la robustez de los filtros de seguridad y los efectos secundarios de las tecnicas de abliteration sobre capacidades generales. No es un modelo recomendado para produccion sin una evaluacion exhaustiva previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (etiqueta de Hugging Face: qwen3_5); detalles no disponibles |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo contiene safetensors; no se publican GGUF ni cuantizaciones oficiales) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Tamano del repositorio | 18,8 GB |
| Modelo base | ornith-ai/Ornith-1.5-9B |
| Pipeline | text-generation |
| Descargas | 556 |
| Likes | 0 |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna. Los metadatos de Hugging Face etiquetan el modelo como qwen3_5, lo que sugiere que el modelo base ornith-ai/Ornith-1.5-9B deriva de la familia Qwen 3.5, pero no se confirma en la model card ni se detalla el tipo de atencion, la configuracion de capas ni el tokenizador. El numero de parametros (9,41 mil millones) es coherente con un transformer denso de esa escala.

Tampoco se documenta el proceso de ajuste: no hay informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF, DPO u otras tecnicas de alineamiento, ni sobre el metodo concreto de abliteration aplicado. La model card menciona "Trials: [40]" y "Status: Tested and saved", lo que apunta a un proceso iterativo de experimentacion por parte del autor, pero sin detalle tecnico. No se puede verificar que el ajuste haya preservado las capacidades del modelo base.

## Capacidades

- Generacion de texto conversacional, segun el pipeline declarado (text-generation, conversational).
- Al ser un derivado de un modelo de 9B de la familia Qwen 3.5, es probable que herede capacidades de razonamiento, codigo y matematicas, pero no hay documentacion que lo confirme.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles (el campo de idiomas no esta cumplimentado).
- Capacidades especiales (modo thinking, vision, audio): no disponibles.
- Comportamiento esperado: respuestas con menor tasa de rechazo que el modelo base, por el proceso de abliteration.

## Casos de uso

- Investigacion sobre alineamiento y seguridad: el modelo sirve como objeto de estudio para medir cuanto rechazo elimina la abliteration y que capacidades se degradan en el proceso, comparandolo con el modelo base en un conjunto fijo de prompts.
- Red teaming y evaluacion de filtros: util para probar la robustez de clasificadores de contenido y guardrails desplegados en una plataforma, ya que genera respuestas que un modelo alineado bloquearia.
- Generacion creativa sin restricciones: escritura de ficcion con tematicas sensibles (violencia, terror, drama adulto) donde los modelos alineados suelen suavizar el tono; requiere revision humana del contenido.
- Analisis de sesgos y comportamiento: estudio de como cambia la distribucion de respuestas al eliminar capas de rechazo, con fines academicos.
- Prototipado interno de asistentes conversacionales: para equipos que necesitan un modelo de 9B autoalojado con licencia permisiva y control total del contenido, en entornos cerrados.
- Base para nuevos fine-tunes: al estar en safetensors y con licencia MIT, puede servir como punto de partida para ajustes especificos de dominio, siempre que se valide primero que las capacidades del modelo base se conservan.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en FP16/BF16: aproximadamente 18,8 GB de pesos, mas overhead de activaciones y cache KV; en la practica se necesitan 20-24 GB o mas segun la longitud de contexto.
- Cuantizacion a 8 bits: alrededor de 10-11 GB de VRAM, viable en una RTX 4090 (24 GB) con contexto moderado.
- Cuantizacion a 4 bits: alrededor de 5-6 GB de VRAM, viable en GPUs consumer de 8-12 GB (RTX 3060, 4060 Ti, 4070) con contexto reducido.
- GPU recomendadas para precision completa: A100 40/80 GB, H100, L40S; tambien funciona en una RTX 4090 con cuantizacion.
- Opciones de despliegue: vLLM y TGI para safetensors en precision completa o FP8; llama.cpp y Ollama requieren conversion previa a GGUF, que no esta publicada en el repositorio.
- Latencia y throughput: no disponibles. A modo orientativo, un modelo denso de 9B en una A100 suele ofrecer decenas de tokens por segundo por peticion en decodificacion, pero no hay mediciones publicadas para este modelo concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Ornith1.5-9B-3MPER0RR-obliterated | 9,41B | no disponible | MIT | Abliterated; sin benchmarks ni documentacion de entrenamiento |
| ornith-ai/Ornith-1.5-9B (base) | ~9B | no disponible | no disponible en la informacion | Modelo original alineado; referencia para medir el efecto del ajuste |
| Qwen 3.5 de ~9B (familia de origen segun la etiqueta) | ~9B | no disponible | no disponible | Arquitectura de referencia, con alineamiento estandar |

No se dispone de datos de rendimiento comparativos entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Ausencia total de documentacion: no hay datos de entrenamiento, evaluacion ni hiperparametros, lo que impide reproducir el ajuste o estimar su calidad.
- El proceso de abliteration puede degradar capacidades: es frecuente que estos ajustes reduzcan el rendimiento en razonamiento, codigo y seguimiento de instrucciones complejas; no se ha publicado ninguna evaluacion que lo descarte.
- Riesgo elevado de contenido danino: el modelo esta disenado para reducir los rechazos, por lo que puede generar contenido ofensivo, ilegal o peligroso sin advertencia. No debe exponerse a usuarios finales sin guardrails externos.
- Alucinacion: sin benchmarks ni evaluacion, no se puede acotar la tasa de alucinacion; se espera similar o peor que el modelo base.
- Idiomas y contexto no documentados: no se puede garantizar el soporte multilingue ni una ventana de contexto concreta.
- Licencia MIT: permite uso comercial y modificacion, pero el autor no ofrece ninguna garantia ni asume responsabilidad sobre el comportamiento del modelo; conviene revisar la licencia del modelo base ornith-ai/Ornith-1.5-9B, que no se detalla en la informacion disponible.
- Modelo de nicho: 556 descargas y 0 likes indican una adopcion muy baja y ninguna validacion por parte de la comunidad.
- Fecha de creacion en los metadatos (2026-08-31) y actualizacion (2026-11-21): verificar la coherencia temporal antes de citarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/3MPER0RR/Ornith1.5-9B-3MPER0RR-obliterated
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-9B
- Aviso de investigacion del autor: https://huggingface.co/3MPER0RR/Ornith1.5-9B-3MPER0RR-abliterated/blob/main/Disclaimer.md
- Variante abliterated del mismo autor: https://huggingface.co/3MPER0RR/Ornith1.5-9B-3MPER0RR-abliterated
