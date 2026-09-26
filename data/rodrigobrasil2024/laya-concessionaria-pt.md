# RodrigoBrasil2024/laya-concessionaria-pt

## Resumen

Laya-concessionaria-pt es un ajuste fino del modelo Laya multilingüe, desarrollado por el usuario RodrigoBrasil2024 y publicado en Hugging Face. El modelo está especializado en la toma de decisiones estructurada dentro del dominio de una concesionaria de vehículos en portugués de Brasil (pt-BR), y según su autor cubre rutas de agente, bloqueo del embudo (funnel lock), forma de entrada, moderación y contexto. Cuenta con 321.908.998 parámetros y un repositorio de 2,0 GB en formato safetensors, bajo licencia Apache 2.0.

El modelo se etiqueta como "system-one" y de decisiones calibradas (tags calibrated-decisions, rlcd y structured-decisions), y expone una métrica de confianza (answer_confidence) junto con temperaturas de calibración registradas, pensadas para su uso en un mecanismo de gating dentro de un componente que el autor denomina evo_bridge. Según la model card, en el split de test (144 casos / 306 decisiones) alcanza una exactitud de 0,993 frente a 0,608 del modelo multilingüe zero-shot evaluado con los pesos originales, con una confianza media de respuesta de 0,990 y un Brier score de 0,0118.

Su relevancia actual radica en el patrón que ilustra: un modelo pequeño (≈322 M de parámetros) ajustado para una tarea de decisión muy concreta y con calibración explícita, desplegable en entornos de bajos recursos. La contrapartida es que la información pública es escasa: no se detallan arquitectura interna, longitud de contexto, composición del dataset ni cómputo de entrenamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (fine-tuning del modelo Laya multilingüe; no se confirma la arquitectura interna) |
| Parámetros totales | 321.908.998 |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en safetensors) |
| Idiomas soportados | pt-BR documentado en la model card; el modelo base es multilingüe |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tamaño del repositorio | 2,0 GB |
| Librería | transformers |
| Fecha de creación | 2026-09-25 |
| Última actualización | 2026-09-25 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna (tipo de transformer, atención, capas, cabezas) ni sobre la composición del dataset de entrenamiento, el número de tokens vistos o la técnica de ajuste (RLHF, DPO u otras). La model card únicamente indica que se trata de un fine-tuning del modelo Laya multilingüe sobre un dataset de concesionaria en pt-BR, orientado a decisiones estructuradas. Las etiquetas del repositorio sugieren un enfoque de "system-one" (decisiones rápidas, sin cadena de razonamiento explícita) y algún procedimiento de decisiones calibradas asociado a las siglas "rlcd" y "calibrated-decisions".

El elemento técnico más concreto documentado es la calibración de temperaturas: `[1.0, 1.0, 4.933024883270264]`, almacenadas en el archivo `rl_agent_config.json`. La evaluación reportada se realizó sobre un split de test de 144 casos (306 decisiones), comparando el checkpoint ajustado (0,993 de exactitud) con el modelo multilingüe zero-shot (0,608). El autor advierte que un `avg_conf` cercano a 1,0 (comportamiento one-hot) sería indicativo de que conviene reentrenar, y recomienda usar `answer_confidence` junto con umbrales de validación en shadow para el gating en `evo_bridge`, no el error bruto.

## Capacidades

- Clasificación y toma de decisiones estructuradas en el dominio de una concesionaria (pt-BR).
- Enrutado de rutas de agente (agent routes) según el estado de la conversación.
- Reglas de bloqueo del embudo (funnel lock) y validación de la forma de entrada.
- Moderación de contenido dentro del flujo definido por el autor.
- Gestión de contexto de la conversación (según la descripción de la model card).
- Salida calibrada con puntuaciones de confianza (`answer_confidence`) aptas para gating por umbral.
- Integración mediante la librería `laya` (`laya.load(...)`, `agent.predict(state, questions)`).
- No se documentan capacidades de generación abierta, código, matemáticas, visión, audio, tool calling ni uso de agentes multi-paso genéricos.

## Casos de uso

- Enrutado de conversaciones en atención al cliente de una concesionaria: el modelo decide la ruta de agente adecuada (ventas, posventa, financiación, moderación) a partir del estado y las preguntas del cliente, aprovechando su ajuste específico de dominio en pt-BR.
- Bloqueo del embudo de ventas (funnel lock): controlar en qué punto del proceso comercial se encuentra el usuario y evitar saltos indebidos de etapa en un asistente conversacional.
- Moderación de mensajes en un canal de atención: clasificar entradas potencialmente problemáticas dentro del flujo definido antes de que lleguen a un agente humano.
- Validación de la forma de entrada de formularios o solicitudes: comprobar que los datos y el contexto cumplen el formato esperado antes de continuar el proceso.
- Gating basado en confianza en pipelines internos: usar `answer_confidence` y los umbrales en shadow dentro de `evo_bridge` para decidir si una respuesta se acepta automáticamente o se deriva a revisión.
- Despliegue ligero en servidores modestos o entornos embarcados: con ≈322 M de parámetros y ~0,6 GB en fp16, encaja en infraestructura sin GPU dedicada para tareas de decisión de alta frecuencia.
- Prototipado de sistemas de decisión calibrados: servir como ejemplo reproducible de fine-tuning pequeño con temperaturas de calibración registradas y evaluación con Brier score.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index (no verificados):

| Tarea | Dataset | Métrica | Valor |
|---|---|---|---|
| Concessionaria Decision Suite | dataset_concessionaria | accuracy | 0,9935 |
| Concessionaria Decision Suite | dataset_concessionaria | brier_score | 0,0118 |

Comparativa directa recogida en la model card (split de test, 144 casos / 306 decisiones):

| Modelo | Exactitud | Confianza media | Brier |
|---|---|---|---|
| laya-concessionaria-pt (ajustado) | 0,993 | 0,990 | 0,0118 |
| Laya multilingüe zero-shot (pesos originales) | 0,608 | no disponible | no disponible |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para los pesos: ~1,29 GB en fp32, ~0,64 GB en fp16/bf16, ~0,32 GB en int8 y ~0,16 GB en int4 (cálculo a partir de 321,9 M de parámetros). Añadir margen para activaciones y caché según el lote.
- Inferencia total realista: aproximadamente 1-2 GB de memoria, por lo que cabe holgadamente en cualquier GPU de consumo (RTX 3060, RTX 4090, etc.) e incluso es viable en CPU para cargas moderadas.
- GPU recomendadas: no se especifican; para producción de bajo volumen cualquier GPU moderna es suficiente, y para altas tasas de peticiones conviene una GPU de gama media o superior por throughput, no por memoria.
- Despliegue: no se documentan opciones concretas. El autor indica instalar la librería `laya` (`pip install laya`) y cargar el modelo como subcarpeta `concessionaria-pt` en `serve/embarcado`, con una API propia (`laya.load`, `agent.predict`). No se confirma compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. La única referencia cuantitativa es el propio modelo base en modo zero-shot, incluido en la tabla de benchmarks anterior. Para alternativas de la misma categoría (modelos pequeños de decisión o clasificación ajustados), los datos no están disponibles.

| Modelo | Parámetros | Contexto | Exactitud (suite del autor) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| laya-concessionaria-pt | 321,9 M | no disponible | 0,993 | Apache 2.0 | Hugging Face |
| Laya multilingüe (base, zero-shot) | no disponible | no disponible | 0,608 | no disponible | no disponible |
| Otras alternativas | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Dominio muy restringido: el modelo está ajustado para decisiones de una concesionaria en pt-BR; no se debe esperar buen rendimiento en tareas generales de generación o razonamiento.
- Sesgos: no hay información publicada sobre sesgos del dataset de entrenamiento ni sobre su composición, por lo que no es posible evaluar sesgos de género, origen o sesgo lingüístico.
- Alucinación: aunque la tarea principal es de clasificación/decisión, no se documenta el comportamiento ante entradas fuera de distribución; el propio autor advierte que una confianza media cercana a 1,0 (one-hot) indica necesidad de reentrenar.
- Idiomas: documentado para pt-BR; el resto de lenguas del modelo base no están validadas para este ajuste.
- Contexto: se desconoce la longitud de contexto soportada, lo que limita el diseño de conversaciones largas.
- Calibración dependiente del umbral: el uso de `answer_confidence` requiere definir umbrales de validación en shadow; usarla sin ellos o confiar en el error bruto puede degradar el gating.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Laya y del dataset, que no se detallan.
- Madurez: 0 descargas y 0 likes, con benchmarks no verificados (`verified: false`); el modelo no tiene validación externa ni comunidad que respalde su comportamiento en producción.
- Sin resultados en benchmarks estándar: la evaluación se limita a una suite propia del autor sobre un dataset no público, lo que dificulta la comparación objetiva.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RodrigoBrasil2024/laya-concessionaria-pt
- Librería Laya (mencionada en el quickstart): no disponible (no se proporciona URL)
- Paper, blog, repositorio o demo asociados: no disponibles
