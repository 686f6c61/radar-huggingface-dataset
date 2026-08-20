# ceselder/skip-lens-qwen36-27b-agreelens-d-l62

## Resumen

El modelo `ceselder/skip-lens-qwen36-27b-agreelens-d-l62` es un adaptador LoRA (PEFT) de investigacion en interpretabilidad, desarrollado por ceselder sobre el modelo base `Qwen/Qwen3.6-27B`. Se enmarca dentro de la serie "agreelens", cuyo objetivo es leer y evaluar el espacio de trabajo (workspace) interno del modelo durante la generacion. A diferencia de su gemelo entrenado en la capa 42, este adaptador se entrena sobre la activacion residual de la capa 62, aplicando la tecnica de "skip-lens" mediante el Jacobiano J_42->62 para inyectar la activacion en un punto de lectura distinto.

Este artefacto no es un modelo de generacion de texto generalista, sino una sonda de investigacion mecanistica. Su relevancia radica en que permite a los investigadores analizar como el modelo representa la informacion en capas profundas y como se comporta el workspace en tareas de acuerdo/desacuerdo (agreement/disagreement). Se trata de una pieza experimental con 0 descargas y 0 likes, publicada bajo licencia Apache 2.0, orientada a la comunidad de interpretabilidad y alineacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre Qwen3.6-27B (Transformer) |
| Parametros totales | Modelo base: 27.000 millones (Qwen3.6-27B); Adapter LoRA: no especificado (tamano del repo: 1.9 GB) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (solo safetensors del adapter) |
| Idiomas soportados | No disponible (depende del modelo base, no especificado) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (PEFT LoRA) |

## Arquitectura y entrenamiento

El adaptador se entrena como un LoRA con rango r=64 y alpha=16, utilizando rsLoRA con scope en todas las capas (scope-all). El entrenamiento se realiza durante 1 epoca, con batch size de 64, learning rate de 1e-4 y semilla 0. El dataset de entrenamiento consiste en 244.367 pares (posicion, span de 12 tokens on-policy), filtrados por criterios de "DISAGREE" y "span-miss".

La innovacion tecnica clave es el uso de la activacion de la capa 62 como entrada durante el entrenamiento, mientras que en tiempo de inferencia se aplica el "skip-lens trick": se captura la activacion h42 en la posicion de lectura, se le aplica el Jacobian oficial J_42->62 (proveniente del repositorio `camilablank/workspace-lenses`) y se inyecta en la capa 62 a traves de un hook con normalizacion de norma de Karvonen en el marcador ㈜ (id 158983). Esta estrategia permite leer el workspace de la capa 42 desde la capa 62, mejorando la capacidad de lectura.

## Capacidades

- Sonda de interpretabilidad para el modelo Qwen3.6-27B.
- Lectura del espacio de trabajo (workspace) interno del modelo en capas profundas (capa 62).
- Deteccion de patrones de acuerdo y desacuerdo (agreement/disagreement) en el razonamiento del modelo.
- Identificacion de fallos de cobertura de span (span-miss) en la generacion de tokens.
- Integracion con el Jacobian J_42->62 para la tecnica de skip-lens.
- No es un modelo de generacion de texto, codigo, vision ni tiene soporte para tool calling o agentes.

## Casos de uso

- Investigacion en mecanistica interpretativa: permite estudiar como se representa la informacion en capas profundas de un LLM de 27B, comparando la lectura de la capa 42 con la de la capa 62.
- Validacion de la tecnica skip-lens: sirve como banco de pruebas para evaluar si la inyeccion de activaciones via Jacobian mejora la lectura del workspace frente a la lectura directa de la capa.
- Analisis de fallos de razonamiento: al estar entrenado con filtros de "span-miss", se puede usar para identificar momentos en los que el modelo pierde cobertura sobre el contexto relevante.
- Comparacion de variantes de la serie agreelens: permite comparar el rendimiento de lectores de workspace entrenados en diferentes capas (L42 vs L62) bajo las mismas condiciones.
- Desarrollo de tecnicas de "activation steering" o control de activaciones: la inyeccion de activaciones en una capa especifica con normalizacion de norma puede servir para experimentar con intervenciones dirigidas en el modelo base.
- Auditoria de sesgos en el razonamiento interno: al detectar desacuerdos entre la salida final y el workspace interno, se puede estudiar la fiabilidad de las respuestas del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

Se proporciona una metrica especifica de interpretabilidad: el acuerdo con el workspace de referencia (Fedlayer) sobre 353 items, comparando la salida del modelo con la de un Sonnet (modelo de referencia). Los resultados son:

| Metrica | Valor |
|---|---|
| Acuerdo con J-fed (Jacobian inyectado) | 0.660 |
| Acuerdo con raw-h42-fed (activacion directa de h42) | 0.659 |

El autor indica que la variante L62 alimentada con Jacobian es la mas fuerte de la serie agreelens, anadiendo un +0.14 a +0.17 sobre la variante L42 entrenada de forma equivalente.

## Requisitos de hardware

- No se especifican requisitos de VRAM concretos en la informacion proporcionada.
- Al ser un adaptador LoRA sobre Qwen3.6-27B, se requiere la ejecucion del modelo base completo. Para una inferencia en precision fp16, se estima que se necesitan al menos 54 GB de VRAM (27B x 2 bytes). Con cuantizacion de 4 bits, la VRAM minima se reduce a aproximadamente 14-16 GB, aunque no se especifica soporte explicito para cuantizacion en el repositorio.
- Se recomienda una GPU de clase profesional como A100 (80 GB) o H100 (80 GB) para una ejecucion comoda en fp16.
- En consumer GPUs, una RTX 4090 (24 GB) podria ejecutar el modelo base cuantizado a 4 bits, pero el adaptador LoRA y el hook de inyeccion requieren la carga del modelo base completo.
- Opciones de despliegue: el repositorio solo indica el uso con la libreria PEFT. No se menciona compatibilidad con vLLM, llama.cpp, Ollama o TGI. Dado que es un artefacto de investigacion, su despliegue es manual y experimental.

## Comparativa con modelos similares

La informacion proporcionada no incluye comparativas con modelos comerciales o de la misma categoria. Dentro de la propia familia, se puede comparar con la variante L42:

| Parametro | skip-lens-q36-27b-agreelens-d-l62 | skip-lens-q36-27b-agreelens-d (L42) |
|---|---|---|
| Capa de activacion de entrada | Capa 62 | Capa 42 |
| Tecnica de inferencia | J_42->62 (Jacobian) | Directa (h42) |
| Acuerdo (Fedlayer, 353 items) | 0.660 (J-fed) | No especificado |
| Diferencia de rendimiento | +0.14 a +0.17 sobre L42 | Base |

No hay informacion sobre otros modelos comparables fuera de la serie agreelens.

## Limitaciones y advertencias

- Es un artefacto de investigacion experimental con 0 descargas y 0 likes, no validado para uso en produccion.
- No es un modelo de generacion de texto; su uso requiere un pipeline especifico de interpretabilidad (captura de activaciones, calculo de Jacobian, hooks de inyeccion).
- El conjunto de entrenamiento esta filtrado por "DISAGREE" y "span-miss", lo que puede introducir sesgos en la deteccion de ciertos patrones de workspace.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3.6-27B tiene sus propias restricciones que deben revisarse.
- No se especifican idiomas soportados, por lo que el rendimiento fuera del ingles (o del idioma de entrenamiento del base) es desconocido.
- Depende de artefactos externos como el Jacobian J_42->42 del repositorio `camilablank/workspace-lenses`, cuya disponibilidad y estabilidad no se garantizan.
- No se han publicado benchmarks de calidad de texto (MMLU, HumanEval, etc.) porque no es su proposito.

## Enlaces

- HuggingFace: https://huggingface.co/ceselder/skip-lens-qwen36-27b-agreelens-d-l62
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-27B
- Repositorio gemelo (variante L42): `ceselder/skip-lens-qwen36-27b-agreelens-d` (no se proporciona URL directa)
- Repositorio de Jacobian: `camilablank/workspace-lenses` (no se proporciona URL directa)
