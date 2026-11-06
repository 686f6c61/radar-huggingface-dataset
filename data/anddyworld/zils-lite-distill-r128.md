# anddyworld/zils-lite-distill-r128

## Resumen

Zils-lite-distill-r128 es un modelo de decisión derivado de vllm-sr/d3-lite mediante destilación con un adaptador LoRA de rango 128 que posteriormente se fusionó con los pesos base. Lo publica el usuario anddyworld bajo licencia Apache 2.0 y está pensado como "cuerpo" (body) para el pool de modelos d3-lite de la subred Zils, un ecosistema en el que el modelo no funciona de forma autónoma sino acoplado a un chasis (chassis) concreto que aporta la capa de respuesta y el runtime.

El modelo cuenta con 852.985.920 parámetros (aproximadamente 853 millones) según los pesos en safetensors, y el repositorio ocupa 1,7 GB. Mantiene el tower de visión sin modificar respecto al modelo base, mientras que los pesos de lenguaje se alojan bajo el prefijo `language_model.*`. Su propósito declarado es reproducir las probabilidades de opción de un profesor de mayor tamaño de la familia d3 sobre prompts de decisión públicos, lo que lo sitúa en la categoría de modelos pequeños especializados en tareas de clasificación o elección entre alternativas más que en generación abierta.

La relevancia de esta ficha es limitada pero concreta: se trata de un artefacto muy reciente (publicado en noviembre de 2026), sin descargas ni likes, sin pipeline declarado y sin model card extendida más allá de unas pocas líneas. Cualquier evaluación en producción debe partir de la premisa de que es un componente interno de un sistema mayor y de que su comportamiento fuera de ese chasis no está documentado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivada de vllm-sr/d3-lite; incluye tower de visión y pesos de lenguaje bajo `language_model.*`) |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La información disponible indica que el modelo parte de vllm-sr/d3-lite y se obtiene por destilación: se entrena un LoRA de rango 128 para que iguale las probabilidades de opción de un profesor de mayor tamaño de la familia d3, sobre prompts de decisión públicos construidos a partir de los splits de entrenamiento de datasets abiertos, y después el adaptador se fusiona en los pesos. No se especifican el número de tokens de entrenamiento, la composición exacta del dataset, ni si hubo fases de RLHF o DPO. Tampoco se detalla la arquitectura interna del modelo base (tipo de transformer, atención, positional encoding), más allá de la mención explícita a un vision tower que se conserva sin cambios y a unos pesos de lenguaje bajo el prefijo `language_model.*`.

El rasgo técnico diferencial es que el modelo no incorpora capa de respuesta propia: está diseñado para ejecutarse con el chasis fijado de d3-lite, que aporta la capa de respuesta y el runtime. Esto implica que la salida útil del modelo son distribuciones de probabilidad sobre opciones, no texto libre, y que cualquier integración debe respetar ese contrato de interfaz. No se documentan innovaciones adicionales como decodificación especulativa, atención lineal o modos de razonamiento extendido.

## Capacidades

- Modelo de decisión: produce probabilidades sobre opciones para prompts de elección, destiladas de un profesor de mayor tamaño de la familia d3.
- Conserva el tower de visión del modelo base d3-lite, por lo que en principio admite entradas multimodales, aunque no se detalla el formato ni el rango de resolución soportado.
- Pesos de lenguaje bajo `language_model.*`, lo que sugiere que el cuerpo de lenguaje es reutilizable dentro del chasis d3-lite.
- No incluye capa de respuesta propia: requiere el chasis d3-lite para generar salidas finales.
- No hay evidencia publicada de soporte de tool calling, function calling, agentes multi-paso ni modos de pensamiento explícitos.
- Capacidades multilingües: no disponibles; la model card no declara idiomas.
- No se documentan capacidades de generación de código, matemáticas o razonamiento abierto más allá de la tarea de decisión para la que fue destilado.

## Casos de uso

- Enrutamiento de decisiones dentro del pool d3-lite: el modelo puede sustituir al profesor en la selección entre opciones predefinidas cuando se despliega con el chasis d3-lite, reduciendo el coste computacional al operar con 853 millones de parámetros frente a un profesor de mayor tamaño.
- Clasificación de prompts en pipelines de datos: al devolver probabilidades de opción, encaja en tareas de etiquetado o triaje donde las categorías están fijadas de antemano y se necesita una señal calibrada, no texto libre.
- Evaluación comparativa de destilaciones: sirve como referencia para medir cuánto se aproxima un LoRA r128 fusionado a las distribuciones del profesor en los mismos prompts públicos de decisión.
- Componente de sistemas multimodales que ya usan d3-lite: al conservar el vision tower intacto, puede integrarse en flujos que combinan imagen y decisión sin reentrenar la parte visual.
- Investigación sobre destilación de probabilidades: el par (profesor d3, alumno destilado) permite estudiar la fidelidad de la destilación en tareas de elección con datasets abiertos.
- Pruebas de integración del chasis: útil para validar el runtime y la capa de respuesta de d3-lite con un cuerpo de menor coste antes de pasar a variantes mayores del pool.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (FP32): aproximadamente 3,4 GB solo para pesos, más overhead de activaciones y del chasis d3-lite.
- VRAM estimada en FP16/BF16: alrededor de 1,7 GB para pesos, más overhead del runtime y de la capa de respuesta del chasis.
- VRAM estimada en cuantización de 8 bits: en torno a 0,9 GB para pesos; en 4 bits, aproximadamente 0,5 GB, aunque no se documentan formatos de cuantización soportados.
- GPU recomendadas: no disponibles; por tamaño, el modelo cabe holgadamente en GPUs de consumo como RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4090, siempre que el chasis d3-lite y el vision tower quepan junto a los pesos.
- Despliegue: no se documentan opciones como vLLM, llama.cpp, Ollama o TGI; la model card solo menciona el uso con el chasis d3-lite fijado, que aporta el runtime.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| anddyworld/zils-lite-distill-r128 | 852.985.920 | no disponible | apache-2.0 | Destilado por LoRA r128 de vllm-sr/d3-lite; requiere chasis d3-lite |
| vllm-sr/d3-lite (modelo base) | no disponible | no disponible | apache-2.0 | Modelo original del que se parte; incluye capa de respuesta y vision tower |
| Profesor de la familia d3 | mayor que el alumno (sin cifra) | no disponible | no disponible | Fuente de las probabilidades de opción usadas en la destilación |

No se dispone de datos de rendimiento ni de contexto para establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- El modelo no funciona de forma autónoma: carece de capa de respuesta propia y debe usarse con el chasis d3-lite, lo que limita su portabilidad a otros runtimes.
- No se declaran idiomas soportados; el comportamiento multilingüe es desconocido y no debe asumirse.
- No hay información sobre sesgos, datos de entrenamiento exactos ni procesos de alineación, por lo que el riesgo de sesgo y de alucinación en la señal de decisión no está caracterizado.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base vllm-sr/d3-lite y el chasis asociado deben verificarse por separado antes de desplegar en producción.
- El repositorio no tiene descargas ni validación comunitaria, y la model card es mínima; conviene tratar el artefacto como experimental.
- No se documentan formatos de cuantización ni recetas de despliegue, lo que complica la reproducción de resultados.
- Al ser un destilado de un profesor de mayor tamaño, puede heredar errores sistemáticos del profesor en las distribuciones de probabilidad.

## Enlaces

- Hugging Face: https://huggingface.co/anddyworld/zils-lite-distill-r128
- Modelo base: https://huggingface.co/vllm-sr/d3-lite
