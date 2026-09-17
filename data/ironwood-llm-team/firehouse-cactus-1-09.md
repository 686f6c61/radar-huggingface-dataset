# Ironwood-LLM-Team/Firehouse-Cactus-1.09

## Resumen

Firehouse-Cactus-1.09 es un ajuste fino (finetune) de generación de texto publicado por el equipo Ironwood-LLM-Team en HuggingFace. Se trata de una iteración del modelo base Ironwood-LLM-Team/Firehouse-Cactus-1.08, del que hereda su linaje, y está empaquetado en formato MLX (la librería de Apple para ejecución eficiente en silicio Apple), lo que lo orienta a inferencia local en Macs con chip M-series más que a despliegues en clústeres con CUDA. El repositorio contiene 7.937.953.568 parámetros en safetensors, unos 7,94 mil millones, con un tamaño total de 15,9 GB, coherente con pesos en precisión de 16 bits.

Las etiquetas del repositorio lo asocian a la familia Gemma de Google (gemma4, gemma, google) y a Unsloth como herramienta de entrenamiento, pero la model card publicada es prácticamente vacía: no incluye descripción del dataset, número de tokens de entrenamiento, metodología de ajuste ni resultados de evaluación. La licencia declarada es Apache 2.0, aunque el propio campo license_link apunta a la licencia de Gemma 4 de Google, lo que introduce una ambigüedad relevante para uso comercial.

El interés actual del modelo es limitado y de carácter exploratorio: no registra descargas ni "likes" en el momento de la consulta y carece de documentación técnica publicada. Resulta relevante únicamente como ejemplo de cadena de ajustes sucesivos sobre una base Gemma empaquetados para MLX, y para quien quiera inspeccionar los pesos y evaluar su comportamiento por cuenta propia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (las etiquetas apuntan a la familia Gemma 4 de Google; no se detalla en la model card) |
| Parámetros totales | 7.937.953.568 (≈7,94 mil millones) |
| Parámetros activos | No aplica según la información disponible (no se declara una arquitectura MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible en la información proporcionada; el repositorio se distribuye en safetensors para MLX |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 declarada, con license_link a la licencia de Gemma 4 (https://ai.google.dev/gemma/docs/gemma_4_license) |
| Formato de pesos | Safetensors, librería MLX |
| Tamaño del repositorio | 15,9 GB |
| Modelo base | Ironwood-LLM-Team/Firehouse-Cactus-1.08 (a su vez finetune) |
| Pipeline | text-generation |
| Fecha de creación | 16 de septiembre de 2026 |
| Última actualización | 16 de septiembre de 2026 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura interna más allá de las etiquetas del repositorio, que apuntan a la familia Gemma 4 de Google (tags gemma4, gemma, google) y a Unsloth como herramienta asociada al proceso de ajuste. No se documenta si se trata de un transformer denso, de una arquitectura híbrida con atención lineal, ni detalles sobre normalización, tipo de atención o estrategia posicional. El número de parámetros (7,94 mil millones) y el tamaño del repositorio (15,9 GB) son los únicos datos objetivos disponibles sobre la estructura del modelo.

Tampoco hay información sobre el corpus de entrenamiento: se desconoce el número de tokens utilizados, la composición del dataset, el idioma o idiomas predominantes y si se aplicaron técnicas de alineación como RLHF, DPO o ajuste supervisado. El modelo se presenta como una continuación de Firehouse-Cactus-1.08, lo que sugiere una cadena de ajustes incrementales, pero no se especifica qué cambia entre ambas versiones ni qué objetivo persigue la iteración 1.09. La única innovación técnica inferible es el empaquetado en MLX, orientado a ejecución eficiente en hardware Apple.

## Capacidades

- Generación de texto y conversación: la pipeline declarada es text-generation y las etiquetas incluyen conversational, por lo que se espera uso en diálogo multi-turno.
- Etiqueta base_model con relación finetune, lo que indica que ha sido ajustado a partir de un modelo previo en lugar de entrenado desde cero.
- Compatibilidad con MLX: puede ejecutarse con la pila de inferencia de Apple para modelos convertidos a este formato.
- Capacidades de tool calling / function calling: no disponible en la información publicada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; no se declara ningún conjunto de idiomas.
- Capacidades multimodales (visión, audio): no disponible; el pipeline declarado es únicamente de texto.
- Modo de razonamiento explícito (thinking mode): no disponible.

## Casos de uso

- Evaluación local en hardware Apple: al estar empaquetado en MLX, el escenario natural es cargarlo en un Mac con chip M-series para experimentar con generación de texto sin depender de servicios en la nube; el tamaño de 7,94 mil millones de parámetros permite, en principio, ejecución en equipos con memoria unificada amplia.
- Prototipado de asistentes conversacionales: la etiqueta conversational sugiere su uso como base para experimentar con diálogo multi-turno en fase de prueba de concepto, siempre que se valide antes la calidad real de las respuestas.
- Investigación sobre cadenas de finetuning: sirve como objeto de estudio para analizar cómo se comporta un modelo tras varios ajustes sucesivos (1.08 → 1.09) sobre una misma base, comparando derivas de comportamiento.
- Docencia y divulgación: útil en talleres sobre formato MLX y safetensors, mostrando el flujo de conversión y carga de pesos en el ecosistema de Apple.
- Generación de texto en pipelines internos sin requisitos estrictos de calidad: para tareas de relleno, resúmenes exploratorios o borradores donde el coste de revisión humana es asumible.
- Pruebas de cuantización y rendimiento: por su tamaño intermedio, es un candidato razonable para medir latencia y consumo de memoria con distintas precisiones en MLX, aunque no haya cifras publicadas.
- Base para nuevos ajustes: dado que el propio modelo es un finetune, puede emplearse como punto de partida para ajustes adicionales con Unsloth u otras herramientas, asumiendo la ambigüedad de licencia señalada más abajo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K, MT-Bench ni de ninguna otra evaluación, y la búsqueda web realizada no ha devuelto documentación técnica asociada al modelo (los resultados obtenidos corresponden a contenidos sin relación).

## Requisitos de hardware

- VRAM estimada para inferencia: en precisión de 16 bits, los pesos ocupan aproximadamente 15,9 GB, por lo que se necesitan en torno a 17-19 GB de memoria contando caché de activaciones y contexto. En cuantización de 8 bits la estimación ronda los 8-9 GB, y en 4 bits unos 4,5-5,5 GB. Son estimaciones derivadas del recuento de parámetros, no cifras publicadas por el autor.
- GPU recomendadas: no hay recomendaciones oficiales. Para CUDA, una GPU con 24 GB (RTX 3090, RTX 4090, L4) sería el mínimo razonable en 16 bits; A100 40/80 GB o H100 aportarían margen para lotes mayores y contextos extensos.
- Compatibilidad con GPU de consumo: sí es plausible en 4 bits (RTX 3060 12 GB, RTX 4070, RTX 4090) y en 8 bits en tarjetas de 12-16 GB, siempre sujeto a verificación empírica.
- Hardware Apple: al distribuirse en MLX, el destino previsto son equipos con memoria unificada de 16, 24 o 32 GB o superior (M1/M2/M3/M4 en versiones Pro, Max o Ultra).
- Opciones de despliegue: MLX y mlx-lm para Apple; para CUDA habría que convertir los pesos a otro formato (por ejemplo, GGUF para llama.cpp u Ollama, o safetensors estándar para vLLM y TGI), algo no documentado por el autor.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de latencia por petición.

## Comparativa con modelos similares

La información proporcionada no incluye datos de rendimiento ni contexto del modelo evaluado, por lo que la comparación se limita a características estructurales. Los datos de los modelos alternativos proceden de sus especificaciones públicas habituales y no han sido verificados en la búsqueda web de esta ficha.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Firehouse-Cactus-1.09 | 7,94 mil millones | No disponible | Apache 2.0 declarada, con enlace a licencia Gemma 4 | HuggingFace, formato MLX |
| Llama 3.1 8B | 8,03 mil millones | 128.000 tokens | Llama 3.1 Community License | Muy amplia, múltiples formatos |
| Qwen2.5 7B | 7,61 mil millones | 131.072 tokens | Apache 2.0 | Muy amplia, múltiples formatos |
| Gemma 2 9B | 9,24 mil millones | 8.192 tokens | Gemma Terms of Use | Amplia, pero con restricciones de uso |

Frente a estas alternativas, Firehouse-Cactus-1.09 no aporta datos verificables de contexto, idiomas ni evaluación, y su licencia presenta una contradicción entre Apache 2.0 y la licencia de Gemma 4. Cualquier elección entre estas opciones debería basarse en una evaluación propia del modelo, ya que no existe documentación pública que respalde su rendimiento.

## Limitaciones y advertencias

- Ausencia total de documentación: la model card está vacía, sin descripción, dataset, metodología ni evaluación. No es posible auditar cómo se ha entrenado.
- Sesgos conocidos: no disponibles, pero al no documentarse el corpus de entrenamiento no puede descartarse la presencia de sesgos de género, idioma, cultura o ideología.
- Riesgo de alucinación: no cuantificado; sin benchmarks ni evaluación humana publicada, no hay forma de estimar la fiabilidad factual.
- Limitaciones de contexto e idioma: se desconocen tanto la ventana de contexto como los idiomas soportados, lo que impide garantizar su comportamiento en producción, especialmente en castellano.
- Ambigüedad de licencia: el repositorio declara Apache 2.0 pero enlaza a la licencia de Gemma 4, que impone condiciones adicionales (uso comercial restringido en determinados supuestos, obligaciones de atribución y políticas de uso aceptable). Antes de cualquier uso comercial debe aclararse cuál prevalece.
- Trazabilidad de la cadena de finetuning: el modelo deriva de Firehouse-Cactus-1.08, a su vez finetune de una base no especificada, lo que difumina el origen de los datos y complica el cumplimiento normativo.
- Madurez: cero descargas y cero "likes" en el momento de la consulta; es un artefacto sin validación por parte de la comunidad.
- Reproducibilidad: no se documentan hiperparámetros, semillas ni versiones de librerías, por lo que no se puede reproducir el ajuste.
- Formato: al estar en MLX, su uso fuera del ecosistema Apple requiere conversión previa, con el riesgo de degradación o incompatibilidad que ello conlleva.
- Fechas de publicación: el repositorio está fechado en septiembre de 2026, con poco margen para haber acumulado validación externa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Ironwood-LLM-Team/Firehouse-Cactus-1.09
- Modelo base: https://huggingface.co/Ironwood-LLM-Team/Firehouse-Cactus-1.08
- Licencia de Gemma 4 referenciada en el repositorio: https://ai.google.dev/gemma/docs/gemma_4_license
- Paper, blog o repositorio del autor: no disponible
- Demo o espacio de prueba: no disponible
