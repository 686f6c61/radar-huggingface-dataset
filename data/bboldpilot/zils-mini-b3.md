# bboldpilot/zils-mini-b3

## Resumen

Zils-mini-b3 es un reempaquetado del modelo OmniJev/OneJev1.6-4B, publicado por el usuario bboldpilot en HuggingFace. No se trata de un entrenamiento nuevo: los pesos del lenguaje son los del modelo original, sin modificar, y el repositorio los redistribuye bajo la misma licencia Apache 2.0. El autor lo presenta como un "soup body" para la subred Zils (Bittensor SN127), pool d3-mini, lo que sitúa el modelo en el ecosistema de modelos de decisión empleados por dicha subred.

El modelo cuenta con 4.539.265.536 parámetros (aproximadamente 4,5 mil millones) almacenados en formato safetensors, con un tamaño de repositorio de 9,1 GB, lo que sugiere pesos en precisión de 16 bits. La model card no aporta información sobre arquitectura interna, longitud de contexto, idiomas soportados ni proceso de entrenamiento, más allá de la referencia al modelo base.

La relevancia de esta ficha es limitada desde el punto de vista técnico, ya que se trata de una redistribución y no de un desarrollo original. Su interés radica en el contexto de Bittensor y en el uso como componente de decisión dentro de la subred Zils, así como en la posibilidad de reutilizar los pesos del modelo base OneJev1.6-4B con la licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (hereda la del modelo base OmniJev/OneJev1.6-4B) |
| Parametros totales | 4.539.265.536 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los pesos se distribuyen en safetensors, presumiblemente fp16/bf16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo en la documentación proporcionada. El repositorio es un reempaquetado del modelo OmniJev/OneJev1.6-4B en la revisión `bb248003b6eb771a995cb3672ad47db090a9cd48`, y la model card indica explícitamente que los pesos del lenguaje son los del modelo original, sin cambios. Por tanto, cualquier detalle sobre arquitectura (transformer, MoE, híbrida), composición del dataset de entrenamiento, número de tokens, fases de RLHF/DPO o innovaciones técnicas debe consultarse en la documentación del modelo base, que no se incluye en la información disponible.

El único dato de entrenamiento implícito es que el modelo base fue entrenado por OmniJev y posteriormente reempaquetado por bboldpilot para su uso como "soup body" en la subred Zils de Bittensor (SN127), pool d3-mini. No se documenta ningún proceso adicional de fine-tuning, mezcla de pesos (model soup) ni ajuste por parte del redistribuidor.

## Capacidades

- Generación de texto: capacidad heredada del modelo base OneJev1.6-4B, sin documentación específica en este repositorio.
- Razonamiento y toma de decisiones: el autor lo etiqueta como "decision-model", lo que sugiere su uso previsto en tareas de decisión dentro de la subred Zils.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; no se especifican idiomas soportados.
- Capacidades especiales (modo thinking, visión, audio): no disponible en la información proporcionada.

## Casos de uso

- Nodo de decisión en la subred Zils (Bittensor SN127): el modelo está empaquetado específicamente como "soup body" para el pool d3-mini, por lo que su uso previsto es servir como componente de decisión dentro de la infraestructura de dicha subred, siguiendo el protocolo definido por Zils.
- Punto de partida para fine-tuning: al ser un modelo de 4,5 mil millones de parámetros con licencia Apache 2.0 y pesos en safetensors, puede emplearse como base para ajuste supervisado o DPO en tareas específicas de clasificación o decisión, aprovechando su tamaño moderado.
- Experimentación con pesos del modelo base OneJev1.6-4B: el repositorio permite descargar los pesos originales en una revisión concreta, útil para reproducir experimentos o comparar comportamiento frente a otras revisiones del modelo base.
- Investigación sobre ecosistemas Bittensor: sirve como ejemplo de cómo se reempaquetan y redistribuyen modelos dentro de subredes de Bittensor, útil para estudiar flujos de publicación y licenciamiento en estos ecosistemas.
- Despliegue en entornos con recursos limitados: con 4,5 mil millones de parámetros, el modelo puede cuantizarse y ejecutarse en GPUs de consumo, lo que permite prototipar aplicaciones de generación de texto o decisión sin infraestructura de gran escala (siempre que se validen las capacidades reales del modelo base).
- Evaluación comparativa de modelos de decisión: puede utilizarse como referencia en pruebas internas que comparen distintos "soup bodies" o modelos base dentro del pool d3-mini de Zils, midiendo latencia, precisión de decisión y estabilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 4,54 mil millones de parámetros, en fp16 se requieren aproximadamente 9 GB solo para los pesos, más memoria para el contexto y el estado de activaciones (estimación orientativa de 11-13 GB en fp16 para contextos moderados). En cuantización de 8 bits, alrededor de 5-6 GB; en 4 bits, alrededor de 3-4 GB. Estas cifras son estimaciones basadas en el número de parámetros, no datos publicados por el autor.
- GPU recomendadas: para fp16 sin cuantizar, GPUs con 16 GB o más (RTX 4080/4090, A10G, L4, A100). Para cuantización 4 bits, GPUs de 8 GB en adelante (RTX 3060 Ti, RTX 3070, RTX 4060 Ti).
- ¿Cabe en GPU de consumo? Sí, especialmente con cuantización de 8 o 4 bits; en fp16 cabe en RTX 4090 y RTX 4080.
- Opciones de despliegue: al distribuirse en safetensors, puede cargarse con Transformers, vLLM o TGI. Para cuantización y ejecución en hardware modesto sería necesario convertir los pesos a GGUF para llama.cpp u Ollama, conversión que no está documentada en el repositorio.
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Zils-mini-b3 (este modelo) | 4,54 B | no disponible | Apache 2.0 | HuggingFace | Reempaquetado de OneJev1.6-4B para Zils SN127 |
| OmniJev/OneJev1.6-4B | 4 B (según nombre) | no disponible | no disponible en la información | HuggingFace | Modelo base original |
| Alternativas de ~4 B (p. ej. Qwen, Llama, Phi) | 3-4 B | 8k-128k típicamente | variables | HuggingFace | No se dispone de datos comparativos verificados en esta información |

No se dispone de información suficiente para establecer una comparativa rigurosa con modelos de la misma categoría; los datos de rendimiento del modelo base no están incluidos en la documentación proporcionada.

## Limitaciones y advertencias

- No es un modelo entrenado desde cero: es una redistribución del modelo base OmniJev/OneJev1.6-4B, por lo que hereda todas sus limitaciones, sesgos y riesgos de alucinación, que no están documentados en este repositorio.
- Ausencia de documentación técnica: la model card no especifica arquitectura, contexto, idiomas, datos de entrenamiento ni evaluaciones, lo que dificulta su uso responsable en producción.
- Riesgo de alucinación: no cuantificado; al no haber benchmarks ni evaluaciones publicadas, no puede estimarse su fiabilidad en tareas de generación o decisión.
- Idiomas: no se especifican los idiomas soportados; no debe asumirse un buen rendimiento en castellano sin validación previa.
- Licencia: Apache 2.0 permite uso comercial, pero el autor original de los pesos es OmniJev; conviene revisar la licencia y condiciones del modelo base en su repositorio original antes de un despliegue comercial.
- Contexto específico de Bittensor: el modelo está empaquetado para la subred Zils (SN127), pool d3-mini; su comportamiento fuera de ese entorno no está validado.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso comunitario ni de validación externa.
- Fecha de creación futura (2026-11-04) en los metadatos: conviene verificar la integridad y procedencia del repositorio antes de confiar en él para producción.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/bboldpilot/zils-mini-b3
- Modelo base: https://huggingface.co/OmniJev/OneJev1.6-4B
- Revisión del modelo base referenciada: `bb248003b6eb771a995cb3672ad47db090a9cd48`
- Subred Zils (Bittensor SN127): no se proporciona enlace en la información disponible.
