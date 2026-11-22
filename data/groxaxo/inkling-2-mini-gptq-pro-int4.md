# groxaxo/Inkling-2-Mini-GPTQ-Pro-INT4

## Resumen

Inkling-2-Mini-GPTQ-Pro-INT4 es una cuantización selectiva en INT4 del modelo multimodal Inkling-2-Mini, desarrollado originalmente por Thinking Machines. El checkpoint lo publica el usuario groxaxo bajo licencia Apache 2.0 y empaqueta 40 proyecciones lineales cuantizadas con el método GPTQ-Pro, manteniendo el modelo multimodal completo y los pesos DSpark en su representación original en disco. El objetivo es reducir el coste de memoria del modelo base sin reentrenar ni alterar los pesos de expertos y visión.

El paquete se distribuye como un checkpoint autocontenido de 19,89 GB en tres ficheros de pesos, con un cargador personalizado que restaura las lineales empaquetadas desde la raíz del release al checkpoint compacto bajo `base/`. El cargador para Ampere expande los expertos a BF16 en RAM y reparte el modelo entre tres RTX 3090, canalizando las transferencias de activaciones entre GPUs a través de RAM para evitar errores de peer-copy observados en la plataforma de validación.

La relevancia de esta ficha radica en que documenta una técnica de cuantización poco habitual (GPTQ-Pro selectivo sobre un modelo multimodal con expertos) y en que aporta métricas de validación reproducibles: acuerdo de siguiente token del 95,8661 % sobre 508 tokens, divergencia KL media de 0,007208 nats/token y un delta de NLL de -0,009154 nats/token frente al modelo original. No hay información pública sobre arquitectura interna, número de parámetros ni longitud de contexto del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base multimodal image-text-to-text con expertos; detalles no publicados en la información disponible) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (el modelo base emplea expertos, pero no se especifica si es MoE ni el número de activos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT4 selectivo (GPTQ-Pro) sobre 40 proyecciones; expertos y pesos de visión en su representación original |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (3 ficheros, 19,89 GB en total) |

## Arquitectura y entrenamiento

El modelo base Inkling-2-Mini es multimodal (image-text-to-text) e incorpora pesos de expertos y un componente denominado DSpark, según la model card. Esta versión no reentrena el modelo: aplica GPTQ-Pro de forma selectiva sobre 40 proyecciones lineales, sustituyendo 377,49 MB de proyecciones originales por 102,20 MB de pesos empaquetados en INT4. La representación tensorial de los expertos se conserva en disco y el cargador de Ampere los expande a BF16 en RAM antes de repartir el modelo entre tres RTX 3090, escalonando las transferencias de activaciones entre GPUs a través de RAM.

La calibración se realizó con 6.144 tokens de WikiText-2 más prompts de texto e imagen. No se dispone de información sobre el número de tokens de entrenamiento del modelo base, la composición del dataset, ni si hubo RLHF o DPO. Tampoco se documentan innovaciones de decodificación (especulativa, atención lineal) más allá del propio esquema de cuantización.

## Capacidades

- Generación de texto e imagen a texto: el pipeline declarado es `image-text-to-text`, con comprobaciones de generación de texto e imagen superadas (5/5 en pruebas greedy).
- Procesamiento multimodal: mantiene los pesos de visión originales sin cuantizar.
- Razonamiento y conversación multi-turno: no se documentan capacidades específicas adicionales.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (el campo de idiomas no está poblado).
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Despliegue multimodal en hardware de gama alta consumer: el checkpoint está diseñado para repartirse entre tres RTX 3090 (49,31 GiB de memoria CUDA de pesos), lo que permite ejecutar un modelo multimodal con expertos en estaciones de trabajo con GPUs Ampere de 24 GB.
- Investigación sobre cuantización selectiva: sirve como referencia reproducible para estudiar el impacto de GPTQ-Pro en proyecciones concretas, con métricas de KL, NLL y acuerdo de siguiente token publicadas en `validation.json`.
- Descripción de imágenes y respuesta a preguntas visuales: el pipeline image-text-to-text permite integrar el modelo en flujos de captioning o VQA cuando se dispone de un entorno multi-GPU.
- Evaluación comparativa de fidelidad de cuantización: el delta de NLL de -0,009154 nats/token y la KL de 0,007208 nats/token permiten contrastar técnicas de cuantización alternativas sobre el mismo modelo base.
- Reproducción de entornos con restricciones de peer-copy: el cargador documenta el escalonado de activaciones vía RAM, útil en placas base o configuraciones donde NVLink o P2P falla.
- Prototipado de asistentes multimodales en laboratorio: con licencia Apache 2.0 y pesos safetensors, se puede adaptar el cargador para integrar el modelo en pipelines internos de investigación sin restricciones de uso comercial derivadas de la licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card incluye métricas de validación de la cuantización frente al modelo original:

| Metrica | Resultado |
|---|---|
| Calibracion | 6.144 tokens WikiText-2 + prompts de texto e imagen |
| Acuerdo de siguiente token (held-out) | 95,8661 % sobre 508 tokens |
| Divergencia KL media | 0,007208 nats/token |
| Delta de NLL medio | -0,009154 nats/token |
| Comprobaciones greedy texto/imagen | 5/5 |
| Recarga de checkpoint compacto | Texto e imagen superados |
| Memoria CUDA de pesos | 49,31 GiB en 3 RTX 3090 |

## Requisitos de hardware

- VRAM estimada: 49,31 GiB de memoria CUDA para pesos, repartidos entre tres RTX 3090 según la validación del autor.
- GPU recomendadas: 3 x RTX 3090 (Ampere, 24 GB cada una) es la configuración validada. No se documentan pruebas en A100, H100 u otras GPUs.
- Cabe en consumer GPU: sí, en el sentido de que la configuración validada usa GPUs consumer (RTX 3090), pero requiere tres unidades y un cargador específico.
- Opciones de despliegue: cargador propio de GPTQ-Pro (repositorio GitHub del autor). No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Inkling-2-Mini-GPTQ-Pro-INT4 (este) | no disponible | no disponible | INT4 selectivo GPTQ-Pro | Apache 2.0 | Hugging Face, 0 descargas |
| thinkingmachines/Inkling-2-Mini (base) | no disponible | no disponible | BF16 original | no disponible en la información | Hugging Face |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente sobre modelos comparables de la misma categoría (multimodal con expertos y cuantización INT4 selectiva) para establecer una comparativa rigurosa.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible.
- Riesgo de alucinación: no evaluado; no hay métricas de fidelidad factual en la model card.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no están publicados.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base (thinkingmachines/Inkling-2-Mini), que no se detalla en la información proporcionada.
- Dependencia de un cargador personalizado: el checkpoint requiere el loader de GPTQ-Pro y no se documenta compatibilidad con runtimes estándar como vLLM o llama.cpp, lo que limita su integración en producción.
- Requisito de tres GPUs: la configuración validada exige tres RTX 3090 y un escalonado de activaciones vía RAM; no hay datos de rendimiento en otras topologías.
- Madurez: el repositorio tiene 0 descargas y 0 likes, y fue creado en noviembre de 2026; no hay evidencia de uso en producción.
- Los expertos se expanden a BF16 en RAM, lo que exige memoria de sistema suficiente además de la VRAM.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/groxaxo/Inkling-2-Mini-GPTQ-Pro-INT4
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Revisión exacta del modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini/tree/b85c3cfa615fc413cc9af3379f491b963f3b586a
- Cargador y código de reproducción: https://github.com/groxaxo/GPTQ-Pro/tree/d1b9dd428e44b4d3c0005cc923fddb062695a234/examples/inkling2_mini
