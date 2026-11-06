# anddyworld/zils-lite-distill-r64

## Resumen

Zils-lite-distill-r64 es un cuerpo de modelo de decisión (decision-model body) desarrollado por anddyworld para el pool de modelos "d3-lite soup" de la subnet Zils. Se trata de un ajuste fino por destilación sobre el modelo base vllm-sr/d3-lite, del que hereda la arquitectura y la torre de visión, pero que sustituye los pesos del modelo de lenguaje mediante una LoRA de rango 64 entrenada para replicar las probabilidades de opción de un teacher de mayor tamaño de la familia d3.

El modelo cuenta con 852.985.920 parámetros totales (aproximadamente 853 millones) y un repositorio de 1,7 GB en formato safetensors. No incluye capa de respuesta propia: está diseñado para ejecutarse junto con el chasis d3-lite fijado (su capa de respuesta y su runtime), lo que lo convierte en un componente especializado dentro de un pipeline de decisión más amplio, no en un modelo autónomo de generación de texto.

Su relevancia es acotada: es un artefacto de destilación para un ecosistema concreto (Zils), sin descargas ni interacciones registradas en Hugging Face, licencia Apache 2.0 y sin idiomas declarados. Resulta útil para quienes trabajen dentro de la subnet Zils o quieran estudiar técnicas de destilación de probabilidades de decisión sobre modelos de ~850M parámetros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con torre de visión (hereda la de vllm-sr/d3-lite); pesos de lenguaje ajustados mediante LoRA r64 fusionada |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de vllm-sr/d3-lite (Apache 2.0) y conserva su estructura general, incluida la torre de visión, que según la model card permanece sin cambios. Los pesos de lenguaje residen bajo el prefijo `language_model.*`. El ajuste se realizó mediante destilación: se entrenó una LoRA de rango 64 para que las probabilidades de opción del modelo coincidieran con las de un teacher de mayor tamaño de la familia d3, sobre prompts de decisión públicos construidos a partir de las particiones de entrenamiento de datasets abiertos. Posteriormente, la LoRA se fusionó en los pesos base.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset, ni si hubo etapas de RLHF o DPO. Tampoco se detalla la innovación técnica más allá de la propia destilación de distribuciones de probabilidad sobre tareas de decisión, ni se mencionan mecanismos como decodificación especulativa o atención lineal.

## Capacidades

- Modelo de decisión: produce probabilidades sobre opciones, no texto libre; requiere la capa de respuesta del chasis d3-lite para operar.
- Destilado para imitar el comportamiento probabilístico de un teacher de mayor tamaño de la familia d3.
- Conserva la torre de visión heredada de d3-lite, por lo que puede procesar entradas multimodales si el chasis lo permite.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no declaradas; los idiomas soportados figuran como no disponibles.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Selección entre opciones en pipelines de decisión: el modelo puntúa alternativas y el chasis d3-lite selecciona la respuesta, adecuado para tareas de clasificación o enrutamiento donde se requiere una distribución de probabilidad calibrada frente al teacher.
- Enrutamiento de consultas en sistemas RAG: usar las probabilidades de opción para decidir qué recuperador, índice o herramienta invocar antes de generar la respuesta final.
- Filtrado y priorización de candidatos: puntuar pares pregunta-respuesta o fragmentos recuperados y ordenar por probabilidad, integrándolo como etapa previa a un modelo generativo mayor.
- Evaluación comparativa de destilación: servir como referencia ligera (~853M parámetros, 1,7 GB) para medir cuánto se aproxima un student destilado a un teacher d3 en prompts de decisión abiertos.
- Componente en entornos con recursos limitados: al pesar menos de 2 GB en safetensors, puede desplegarse en una única GPU consumer para tareas de scoring, siempre con el chasis d3-lite.
- Investigación sobre destilación de distribuciones: replicar el procedimiento (LoRA r64 sobre splits de entrenamiento de datasets abiertos) para estudiar transferencia de calibración entre modelos de la misma familia.
- Decisión multimodal asistida por visión: si el chasis expone la torre de visión heredada, emplearlo para decidir sobre entradas que incluyan imagen junto con texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; por tamaño (852.985.920 parámetros) y repo de 1,7 GB en safetensors, la inferencia en precisión original requiere aproximadamente 1,7 GB solo para pesos, más overhead de runtime y torre de visión.
- GPU recomendadas: no disponible; al no publicarse requisitos, cualquier GPU con memoria suficiente para el chasis d3-lite y sus componentes.
- Cabe en GPU consumer: previsiblemente sí en tarjetas con 8 GB o más, dado el tamaño de pesos, aunque no hay confirmación oficial.
- Opciones de despliegue: no disponible; la model card indica que debe usarse con el chasis d3-lite fijado (su capa de respuesta y runtime), sin mencionar vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| anddyworld/zils-lite-distill-r64 | 852.985.920 | no disponible | Apache 2.0 | Hugging Face, 0 descargas | Student destilado, requiere chasis d3-lite |
| vllm-sr/d3-lite | no disponible | no disponible | Apache 2.0 | Hugging Face (modelo base) | Modelo base del que se destila; incluye capa de respuesta |
| Teacher de la familia d3 | no disponible (mayor que el student) | no disponible | no disponible | no disponible | Referencia de destilación citada en la model card |

No se dispone de datos de benchmarks ni de especificaciones completas de los alternativas para establecer una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- No es un modelo autónomo: carece de capa de respuesta propia y debe ejecutarse con el chasis d3-lite fijado; usarlo de forma aislada no producirá salidas válidas.
- Sin datos de benchmarks ni evaluaciones publicadas, no hay evidencia verificable de calidad o calibración frente al teacher.
- Idiomas soportados no declarados: riesgo de comportamiento inconsistente fuera del idioma o dominio de los prompts de destilación.
- Riesgo de alucinación y sesgos: no evaluado en la información disponible; al heredar pesos y datos de d3-lite, arrastra los sesgos de su base y de los datasets abiertos usados en la destilación.
- Longitud de contexto desconocida: no se puede planificar su uso en conversaciones o documentos largos sin verificación previa.
- Licencia Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base vllm-sr/d3-lite y del chasis d3-lite, así como posibles restricciones del ecosistema Zils.
- Repositorio con 0 descargas y 0 likes: sin validación comunitaria; tratar como artefacto experimental.

## Enlaces

- Hugging Face: https://huggingface.co/anddyworld/zils-lite-distill-r64
- Modelo base: https://huggingface.co/vllm-sr/d3-lite
