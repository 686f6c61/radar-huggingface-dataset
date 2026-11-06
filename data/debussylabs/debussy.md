# debussylabs/debussy

## Resumen

Debussy es un modelo de decisión ("System 1") desarrollado por Debussy Labs que no genera texto libre, sino que devuelve una probabilidad calibrada por cada opción de una pregunta cerrada. Se apoya en dos modelos base abiertos (Qwen3.5-4B y K2-Horizon-7B, ambos en GGUF de 4 bits) a los que no modifica los pesos: lo que añade son las preguntas que formula y unas "cabezas" logísticas calibradas muy pequeñas almacenadas en `heads.json` y `heads_k2-horizon.json`. Está pensado para ejecutarse en una CPU de 4 núcleos sin GPU ni clave de API.

Resuelve tres tipos de juicios rápidos que un agente necesita en cada paso: seguridad (¿es dañina la petición?, ¿ha rechazado el asistente?, ¿es dañina la respuesta?), llamadas a herramientas (¿debe llamar a la herramienta, pedir información o decir que no puede ayudar?) y preguntas de conocimiento (qué opción es correcta o "no lo sé" cuando no está seguro). Sigue el formato del Decision Index de Artificial Analysis: una pasada por decisión, una probabilidad por opción y nada de texto libre.

Es relevante porque propone un patrón distinto al de los guardrails y clasificadores habituales: reutiliza modelos generativos ya existentes, apaga el modo de razonamiento de K2-Horizon y lee directamente la probabilidad de "sí" frente a "no" en lugar de muestrear texto, con abstención calibrada para evitar respuestas seguras pero erróneas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo de decisión sobre dos modelos base transformer (Qwen3.5-4B y K2-Horizon-7B), con cabezas logísticas de calibración |
| Parámetros totales | No disponible (depende del modelo base: 4B y 7B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | GGUF de 4 bits (Q4_K_M en el caso de Qwen3.5-4B) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (modelos base) más `heads.json` y `heads_k2-horizon.json` (cabezas de calibración) |

## Arquitectura y entrenamiento

Debussy no es un modelo entrenado desde cero: es una capa de decisión sobre dos modelos base abiertos. El modelo lee la entrada una sola vez y responde a unas pocas preguntas de sí/no (en seguridad, tres preguntas encadenadas en una pasada); en lugar de generar texto, se extrae la probabilidad de "sí" frente a "no" del modelo base. Esas probabilidades se transforman en decisiones calibradas mediante regresiones logísticas minúsculas, y la cabeza concreta se elige por validación cruzada usando únicamente filas de entrenamiento. Para K2-Horizon, que es un modelo de razonamiento, se desactiva el modo de pensamiento para mantener una única pasada por decisión.

Se añaden dos correcciones específicas: un ajuste de "letras justas" que compensa la preferencia de K2-Horizon por ciertas letras de respuesta (fijado con preguntas de práctica donde cada letra tiene la misma probabilidad de ser correcta), y un mecanismo de abstención honesta en el que la opción "no lo sé" no se muestra al modelo: solo se responde si la confianza en la mejor opción supera un umbral fijado en un conjunto de práctica separado. Los conjuntos de datos citados en la model card son nvidia/When2Call, allenai/wildguardmix, TIGER-Lab/MMLU-Pro y ArtificialAnalysis/AA-Omniscience-Public-v1.1. No se detalla el número de tokens de entrenamiento ni si hubo RLHF o DPO.

## Capacidades

- Clasificación de seguridad en tres ejes: daño de la petición del usuario, presencia de rechazo del asistente y daño de la respuesta del asistente.
- Decisión sobre llamadas a herramientas: llamar a la herramienta, pedir información que falta o indicar que no puede ayudar.
- Respuesta a preguntas de conocimiento de opción múltiple con probabilidad por opción.
- Abstención calibrada: devuelve "no lo sé" cuando la confianza no supera el umbral, en lugar de adivinar.
- Salida estructurada como diccionario de probabilidades, sin generación de texto libre.
- Ejecución en CPU sin GPU y sin clave de API.
- Tres variantes de despliegue: `DebussyDuo()` (recomendada), perfil `k2-horizon` con backend `server`, y variante ligera `Debussy()`.
- No soporta visión, audio ni capacidades multimodales según la información disponible.

## Casos de uso

- Moderación de entrada en agentes conversacionales: `d.wildguard(user_prompt, assistant_reply)` devuelve probabilidades de daño en la petición y en la respuesta, lo que permite bloquear o reescribir turnos antes de que lleguen al usuario final.
- Enrutado de llamadas a herramientas en un agente: `d.when2call(tools, peticion, candidatos)` decide entre ejecutar la herramienta, solicitar datos adicionales o declinar, evitando llamadas prematuras con parámetros incompletos.
- Filtro de abstención en asistentes de conocimiento: usando `d.choice(...)` con umbral calibrado, el sistema responde solo cuando la confianza es suficiente y deriva a un humano o a búsqueda externa en caso contrario.
- Evaluación automática de rechazos: la probabilidad de "refusal" permite auditar si un asistente está rechazando peticiones legítimas o aceptando peticiones dañinas en pipelines de control de calidad.
- Despliegue en entornos con hardware limitado: la variante ligera ocupa unos 3 GB de RAM y corre en proceso con `llama-cpp-python`, adecuada para dispositivos de borde o servidores sin GPU.
- Prefiltro de bajo coste antes de un modelo grande: cada decisión es una única pasada sobre un modelo de 4B o 7B en 4 bits, lo que permite descartar casos triviales y reservar el modelo grande para los ambiguos.
- Guardrail en pipelines de CI/CD para agentes: integrado como paso de clasificación que valida prompts y respuestas generadas antes de publicarlas o ejecutarlas.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card. Son estimaciones propias, no puntuaciones oficiales de Artificial Analysis.

| Benchmark (25 % del índice cada uno) | Debussy Duo | Debussy light (solo Qwen) | Conjunto de test |
|---|---|---|---|
| When2Call (accuracy) | 93,2 % | 93,2 % | 600 preguntas |
| WildGuardTest (F1 medio) | 0,936 | 0,899 | 500 filas (Duo), 880 (light) |
| HLE-MultiChoice (accuracy) | 15,0 % | 10,5 % | 513 preguntas de opción múltiple solo texto |
| AA-Omniscience (½ accuracy + ½ no alucinación) | 53,1 | 51,8 | 266 preguntas públicas |
| Índice estimado | ≈ 63,7 | ≈ 61,4 | — |

Desglose de WildGuardTest para el Duo por pregunta: petición dañina 0,929, rechazo 0,962, respuesta dañina 0,917. En las mismas 500 filas y con las mismas filas de calibración, el juez basado solo en Qwen obtiene 0,905.

Advertencias del propio autor: WildGuardTest se evalúa solo con las filas en las que los tres anotadores humanos coinciden, un subconjunto más fácil que el test completo, por lo que los F1 no son comparables con los de modelos guard publicados. Las preguntas de AA-Omniscience son privadas y el número corresponde a la muestra pública con opciones incorrectas escritas por un modelo. En HLE-MultiChoice ambas variantes quedan por debajo del azar (16,4 %). Los conjuntos de test tienen entre 300 y 600 preguntas, por lo que diferencias de 2-3 puntos pueden ser ruido.

## Requisitos de hardware

- Variante `DebussyDuo()` (recomendada): unos 9 GB de RAM; combina Qwen3.5-4B para llamadas a herramientas y K2-Horizon-7B para seguridad y conocimiento.
- Perfil `k2-horizon` con backend `server`: unos 6 GB de RAM; requiere una build reciente de `llama-server` de llama.cpp, ya que el `llama-cpp-python` fijado no puede cargar K2-Horizon.
- Variante ligera `Debussy()`: unos 3 GB de RAM, ejecución en proceso con `llama-cpp-python==0.3.36`.
- No requiere GPU: el autor la describe como ejecutable en una CPU de 4 núcleos.
- Dependencias indicadas: `llama-cpp-python==0.3.36`, `numpy`, `pandas`, `pyarrow` y `scikit-learn`.
- VRAM estimada, GPU recomendadas, latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|---|
| Debussy (Duo) | Modelo de decisión sobre Qwen3.5-4B y K2-Horizon-7B | 4B + 7B (base) | No disponible | Apache-2.0 | Probabilidad por opción, abstención calibrada, CPU |
| WildGuard (referencia de la evaluación) | Clasificador guard | No disponible | No disponible | No disponible | Clasificación de daño en petición y respuesta |
| Qwen3.5-4B | LLM generativo | 4B | No disponible | Apache-2.0 (según el modelo base citado) | Generación de texto, usado aquí como motor de decisión |
| K2-Horizon-7B | LLM de razonamiento | 7B | No disponible | Apache-2.0 (según el modelo base citado) | Razonamiento paso a paso, usado aquí con thinking desactivado |

Los datos de contexto y rendimiento de los modelos comparables no están disponibles en la información proporcionada, por lo que la comparación se limita a tipo, tamaño, licencia y enfoque.

## Limitaciones y advertencias

- Solo admite inglés; no hay soporte multilingüe declarado.
- En HLE-MultiChoice rinde por debajo del azar (15,0 % frente al 16,4 %), por lo que no es adecuado para resolver preguntas de conocimiento complejas.
- Los F1 de WildGuardTest se calculan sobre el subconjunto de filas con acuerdo unánime de anotadores y no son comparables con resultados publicados de modelos guard.
- El número de AA-Omniscience procede de una muestra pública con opciones incorrectas generadas por un modelo, no del conjunto privado oficial.
- Los conjuntos de test son pequeños (300-600 preguntas), de modo que diferencias de 2-3 puntos pueden no ser significativas.
- El índice estimado (≈ 63,7) es una estimación propia del autor, no una puntuación oficial de Artificial Analysis.
- La variante con K2-Horizon depende de una build reciente de `llama-server`; el `llama-cpp-python` fijado no puede cargarla.
- El modelo no genera texto libre: cualquier caso de uso que requiera respuestas abiertas necesita un modelo generativo adicional.
- La corrección de sesgo de letras solo está ajustada para 5-10 opciones.
- Licencia Apache-2.0: permite uso comercial, pero conviene verificar las licencias de los modelos base y de los conjuntos de datos empleados en la calibración.
- Riesgo de alucinación mitigado por la abstención calibrada, pero no eliminado: el umbral se fija en un conjunto de práctica y puede no transferir a dominios distintos.
- El modelo se publicó el 6 de noviembre de 2026 con 0 descargas y 0 likes, por lo que no hay validación independiente de terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/debussylabs/debussy
- Repositorio GitHub: https://github.com/abutauskas/Debussy
- Documentación de la variante K2: `docs/K2_EXPERIMENT.md` en el repositorio
- Sitio del autor: https://debussylabs.com
- Metodología del Decision Index de Artificial Analysis: https://artificialanalysis.ai/methodology/decision-index
- Modelo base Qwen3.5-4B (GGUF): https://huggingface.co/unsloth/Qwen3.5-4B-GGUF
- Modelo base K2-Horizon-7B (GGUF): https://huggingface.co/IFM/K2-Horizon-7B-GGUF
- Dataset nvidia/When2Call: https://huggingface.co/datasets/nvidia/When2Call
- Dataset allenai/wildguardmix: https://huggingface.co/datasets/allenai/wildguardmix
- Dataset TIGER-Lab/MMLU-Pro: https://huggingface.co/datasets/TIGER-Lab/MMLU-Pro
- Dataset ArtificialAnalysis/AA-Omniscience-Public-v1.1: https://huggingface.co/datasets/ArtificialAnalysis/AA-Omniscience-Public-v1.1

Nota: el resultado de búsqueda web https://debussy.app/ corresponde a un producto de composición musical con IA sin relación con este modelo y no se incluye como enlace relevante.
