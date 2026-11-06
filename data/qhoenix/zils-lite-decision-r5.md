# qhoenix/zils-lite-decision-r5

## Resumen

zils-lite-decision-r5 es un modelo de decisión de 0,85 mil millones de parámetros desarrollado por el usuario qhoenix y publicado en Hugging Face bajo licencia Apache-2.0. No es un modelo generativo de texto al uso: su pipeline declarado es `feature-extraction` y su propósito es devolver probabilidades para decisiones de tipo sí/no, elección entre opciones y puntuaciones, sin emitir texto libre. Forma parte del ecosistema Zils (antes conocido como Fez), un proyecto que organiza competiciones de entrenamiento sobre Bittensor y que publica modelos pequeños orientados a tareas de clasificación y decisión.

Técnicamente se construye sobre Qwen/Qwen3.5-0.8B y se distribuye como un "soup" (promedio de pesos) dentro de un chasis predefinido denominado d3-lite, en precisión BF16. El modelo se ofrece como un artefacto experimental: el repositorio no registra descargas ni interacciones en el momento de la consulta, y la model card es muy escueta en cuanto a evaluación y resultados.

Su relevancia es acotada pero concreta: cubre el nicho de modelos de decisión ligeros, desplegables en hardware modesto, que devuelven una señal calibrada en lugar de una generación abierta. Para equipos que necesitan clasificadores o evaluadores de decisión integrados en pipelines, este tipo de modelo evita la latencia y el coste de un LLM generativo completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen3.5-0.8B), adaptado a extracción de características y decisión |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio se publica en BF16; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (custom_code, requiere `trust_remote_code`) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-0.8B, un transformer decoder-only de aproximadamente 0,85 mil millones de parámetros. Sobre esa base se aplica un "soup" o promedio de pesos: un 50 % del soup d3-lite vigente y un 12,5 % de cada uno de cuatro cuerpos Apache-2.0 (vllm-sr/d3-lite, internlm/Intern-Decision-0.8B, Maincode/Matilda-Decision-v1-Edge y zils-ai/jiwo-0.8b-full). Posteriormente se realiza un ajuste fino completo de los pesos del lenguaje en FP32 con learning rate 5e-6 durante una época sobre aproximadamente 23.000 ítems de decisión en el formato de examen de Zils, elaborados a partir de splits de entrenamiento públicos de conjuntos de datos de uso comercial.

La función de pérdida combina entropía cruzada suave y pérdida de Brier, con un anclaje KL de 0,1 respecto al modelo inicial para limitar la deriva. El autor declara explícitamente que no se emplearon semillas de examen, ni splits de validación o test, en el entrenamiento. El modelo se empaqueta en el chasis d3-lite con código personalizado (`custom_code`), lo que implica que la carga requiere `trust_remote_code=True` en `transformers`.

## Capacidades

- Emisión de probabilidades para decisiones binarias (sí/no) en lugar de texto generativo.
- Puntuación y elección entre opciones múltiples, según el formato de examen de Zils.
- Extracción de características (`feature-extraction`) sobre entradas de texto.
- Integración con endpoints compatibles (etiqueta `endpoints_compatible` en el repositorio).
- Ajuste fino completo sobre datos de decisión, lo que sugiere especialización en tareas de clasificación y evaluación.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles (no se documentan idiomas).
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Moderación y filtrado binario: el modelo puede evaluar pares entrada-decisión y devolver una probabilidad de aceptación o rechazo, útil como clasificador previo en pipelines de contenido.
- Enrutamiento de consultas: dado un conjunto de opciones, asignar una puntuación a cada una para decidir a qué cola, agente o servicio derivar una petición.
- Evaluación automática de respuestas: puntuar respuestas candidatas frente a criterios definidos en formato de examen, como paso de ranking en sistemas de generación aumentada.
- Clasificación de intenciones en asistentes: decidir entre un conjunto acotado de intenciones sin generar texto, reduciendo latencia frente a un LLM generativo.
- Verificación de criterios en pipelines de datos: comprobar si un registro cumple una condición expresada como pregunta sí/no antes de incorporarlo a un conjunto de entrenamiento.
- Señal de decisión en sistemas de competición o testnet: el ecosistema Zils está orientado a validadores y mineros que consumen probabilidades de decisión, y este modelo encaja como candidato ligero dentro de ese circuito.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de exactitud, calibración (Brier score, ECE) ni comparaciones con los modelos base que componen el soup.

## Requisitos de hardware

- VRAM estimada en BF16: en torno a 1,7 GB solo para pesos, más overhead de activaciones y del código personalizado; un entorno práctico requiere al menos 4 GB.
- VRAM estimada en FP32 (si se convierte): aproximadamente 3,4 GB para pesos.
- GPU recomendadas: cualquier GPU con 8 GB o más, como RTX 3060, RTX 4060, RTX 4090, A10, L4, A100 o H100; el modelo es lo bastante pequeño para no requerir aceleradores de gama alta.
- Cabe en GPU de consumo: sí, en la práctica totalidad de tarjetas con 6-8 GB o más.
- Opciones de despliegue: `transformers` con `trust_remote_code=True`; vLLM y TGI requerirían verificar compatibilidad con el código personalizado; llama.cpp y Ollama no están documentados para este artefacto.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qhoenix/zils-lite-decision-r5 | 0,85 B | no disponible | Decisión / feature-extraction | Apache-2.0 | Hugging Face |
| qhoenix/zils-lite-decision | no disponible | no disponible | Decisión | Apache-2.0 | Hugging Face |
| internlm/Intern-Decision-0.8B | ~0,8 B | no disponible | Decisión | Apache-2.0 | Hugging Face |
| Maincode/Matilda-Decision-v1-Edge | no disponible | no disponible | Decisión | Apache-2.0 | Hugging Face |

Los tres modelos comparables forman parte de la misma familia de componentes que el autor promedió para construir este artefacto, por lo que la comparación es de linaje más que de rendimiento independiente. No se dispone de métricas comparativas publicadas.

## Limitaciones y advertencias

- Modelo experimental sin descargas ni validación comunitaria registradas en el momento de la consulta.
- Ausencia total de evaluación publicada: no hay métricas de exactitud, calibración ni robustez.
- El autor declara no haber usado splits de validación ni test, lo que impide conocer el comportamiento fuera de distribución.
- Requiere `trust_remote_code=True` por el uso de `custom_code`, lo que implica ejecutar código del autor; conviene auditar el repositorio antes de desplegarlo.
- No está diseñado para generación de texto: usarlo como LLM conversacional produciría resultados degradados.
- Idiomas soportados no documentados; no se puede asumir buen rendimiento en castellano.
- Riesgo de sesgo heredado de los splits públicos de entrenamiento y de los cuatro modelos base promediados; no se documenta ninguna mitigación.
- Licencia Apache-2.0 permite uso comercial, pero la ausencia de evaluación hace recomendable una validación propia antes de producción.
- El pipeline `feature-extraction` y la naturaleza de "soup" implican que la interfaz de salida puede diferir de la de un modelo estándar de `transformers`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/qhoenix/zils-lite-decision-r5
- Modelo predecesor: https://huggingface.co/qhoenix/zils-lite-decision
- Repositorio GitHub del proyecto Zils: https://github.com/ooo-hq/zils
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Componente del soup: https://huggingface.co/vllm-sr/d3-lite
- Componente del soup: https://huggingface.co/internlm/Intern-Decision-0.8B
- Componente del soup: https://huggingface.co/Maincode/Matilda-Decision-v1-Edge
- Componente del soup: https://huggingface.co/zils-ai/jiwo-0.8b-full
