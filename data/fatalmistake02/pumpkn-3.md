# FatalMistake02/pumpkn-3

## Resumen

pumpkn-3 es un modelo de generación de texto de 124,28 millones de parámetros desarrollado por el usuario FatalMistake02 y publicado en HuggingFace bajo licencia Apache 2.0. Se trata de un experimento de entrenamiento temprano ("early training experiment") construido desde cero ("from-scratch"), es decir, sin partir de pesos preentrenados de otro modelo. El propio autor lo describe sin ambages como "absolute garbage" y advierte de que deben esperarse respuestas incorrectas y sinsentidos, por lo que su valor es puramente experimental y educativo, no de producción.

El modelo emplea una ventana de contexto de 2.048 tokens y se distribuye en formato GGUF con cuantización F16. Solo declara soporte para inglés y está etiquetado como conversacional y compatible con endpoints. Con cero descargas y cero likes en el momento de la consulta, se trata de una publicación reciente (creada en noviembre de 2026) y de nula tracción dentro de la comunidad.

Por su tamaño y estado de entrenamiento, pumpkn-3 no compite con modelos de referencia: su interés radica en servir como ejemplo de pipeline de entrenamiento desde cero y como banco de pruebas para herramientas de inferencia GGUF con modelos diminutos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (modelo transformer entrenado from-scratch; detalles no publicados) |
| Parametros totales | 124.278.528 (124,28 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | F16 (GGUF); no se documentan otras cuantizaciones |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de 0,2 GB); no se indica disponibilidad de safetensors en el repo |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de tratarse de un modelo entrenado desde cero ("from-scratch") con 124,28 M de parámetros y una ventana de contexto de 2.048 tokens. No se especifican el número de capas, la dimensión del modelo, el número de cabezas de atención ni si emplea técnicas como RoPE, GQA o atención lineal. Tampoco se publican el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de ajuste fino supervisado, RLHF o DPO.

El autor remite a un archivo ATTRIBUTION.md para los créditos del dataset, pero no se incluyen en la información proporcionada los detalles de dicho dataset. La model card califica explícitamente el resultado como un experimento temprano de entrenamiento con calidad deficiente, lo que sugiere que el modelo no completó un ciclo de entrenamiento maduro o que se entrenó con un presupuesto de cómputo y datos muy limitado.

## Capacidades

- Generación de texto en inglés, con calidad declarada como deficiente por el propio autor.
- Formato conversacional (etiqueta "conversational" en el repo).
- Compatibilidad con endpoints de inferencia (etiqueta "endpoints_compatible").
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documentan capacidades de visión, audio ni modo "thinking".
- Multilingüismo: solo inglés declarado; sin evidencia de otras lenguas.
- Capacidades de código y matemáticas: no documentadas y, dado el estado del modelo, no fiables.

## Casos de uso

- Docencia y divulgación sobre entrenamiento desde cero: sirve para ilustrar el pipeline completo (tokenización, entrenamiento, exportación a GGUF) en charlas o talleres, dado su tamaño reducido y su licencia permisiva.
- Pruebas de integración de herramientas GGUF: permite validar el flujo de carga e inferencia en llama.cpp u otros runners con un artefacto de 0,2 GB antes de pasar a modelos mayores.
- Desarrollo de harnesses de evaluación: útil como caso de control negativo en benchmarks, ya que se espera un rendimiento bajo y sirve para comprobar que las métricas detectan modelos deficientes.
- Experimentos de cuantización y perplejidad: su tamaño permite ejecutar barridos de cuantización (de F16 a Q4, etc.) en hardware modesto para estudiar la degradación de calidad.
- Pruebas de compatibilidad de endpoints: al estar etiquetado como "endpoints_compatible", puede usarse para verificar el despliegue de un endpoint de text-generation con un modelo mínimo.
- Reproducción de investigación: como modelo Apache 2.0 entrenado desde cero, permite estudiar curvas de aprendizaje y fallos típicos de modelos pequeños sin restricciones de licencia.
- No recomendado para atención al cliente, generación de código en producción ni ningún escenario donde la corrección de las respuestas sea un requisito.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en F16, los 124,28 M de parámetros ocupan aproximadamente 0,25 GB, por lo que el modelo cabe holgadamente en cualquier GPU consumer con 2 GB o más de VRAM.
- GPU recomendadas: cualquier GPU consumer moderna (GTX 1060 6 GB, RTX 3060, RTX 4090) e incluso CPU; no requiere A100 ni H100.
- Cabe en consumer GPU: sí, sin ninguna duda; también en Raspberry Pi y dispositivos de borde con suficiente RAM.
- Opciones de despliegue: llama.cpp, Ollama (mediante importación de GGUF), y runners compatibles con endpoints de HuggingFace.
- Latencia y throughput estimados: no disponibles; por el tamaño del modelo, la latencia será muy baja en GPU, pero no se han publicado cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| pumpkn-3 | 124,28 M | 2.048 | Apache 2.0 | HuggingFace (GGUF) | Experimento temprano, calidad declarada deficiente |
| GPT-2 small | 124 M | 1.024 | MIT | HuggingFace | Modelo histórico de referencia con tamaño idéntico |
| SmolLM-135M | 135 M | 2.048 | Apache 2.0 | HuggingFace | Modelo pequeño entrenado con datos a gran escala |
| Qwen2.5-0.5B | 494 M | 32.768 | Apache 2.0 | HuggingFace | Alternativa pequeña con calidad de producción |

La comparación con GPT-2 small es la más directa por número de parámetros (124 M frente a 124,28 M), aunque GPT-2 small dispone de contexto de 1.024 tokens y pumpkn-3 de 2.048. SmolLM-135M y Qwen2.5-0.5B son alternativas actuales con licencia Apache 2.0 y calidad muy superior, por lo que para cualquier uso práctico serían preferibles. No se dispone de datos de rendimiento de pumpkn-3 para comparar numéricamente.

## Limitaciones y advertencias

- Calidad declarada por el autor como "absolute garbage": se esperan respuestas incorrectas y sinsentidos.
- Riesgo elevado de alucinación y de incoherencia en la generación.
- Contexto limitado a 2.048 tokens, insuficiente para documentos largos o conversaciones extensas.
- Solo inglés; no se ha validado su comportamiento en castellano ni en otros idiomas.
- No se documentan sesgos, pero al ser un experimento temprano y sin datos de entrenamiento publicados, no es posible evaluar sesgos de forma rigurosa.
- Licencia Apache 2.0: permite uso comercial y modificación, pero la calidad del modelo hace desaconsejable cualquier despliegue en producción.
- Sin métricas de evaluación publicadas ni datos de entrenamiento detallados, lo que impide auditar su comportamiento.
- Repo de 0,2 GB y sin tracción (0 descargas, 0 likes): no hay comunidad ni soporte.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/FatalMistake02/pumpkn-3
- Créditos del dataset (referenciado en la model card): https://huggingface.co/FatalMistake02/pumpkn-3/blob/main/ATTRIBUTION.md
