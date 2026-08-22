# Atomic-Germ/Gemma4-Claude-Sonnet-E2B-NPU2

## Resumen

Este repositorio contiene una conversión cuantizada del modelo `Atomic-Germ/Gemma4-E2B-IT-NPU2`, realizada por Atomic-Germ, para su ejecución en unidades de procesamiento neuronal (NPU) AMD XDNA mediante el runtime **FastFlowLM (FLM)**. El modelo base es una variante de la familia **Gemma 4** de Google DeepMind, concretamente la versión E2B (probablemente un modelo eficiente de 2 mil millones de parámetros activos, aunque no se confirma en la documentación). La conversión utiliza un formato propio Q4NX, que combina cuantizaciones Q8_0, Q4_1 y BF16, y ocupa 4.35 GB en pesos. El modelo es multimodal, aceptando entradas de texto e imagen (pipeline `any-to-any`), y está pensado para desplegarse en hardware con NPU XDNA, como los procesadores AMD Ryzen AI.

La relevancia de este modelo radica en su optimización para inferencia local en dispositivos de bajo consumo, permitiendo ejecutar un modelo de tamaño medio con capacidades de visión y lenguaje en portátiles y equipos con NPU dedicada, sin necesidad de GPUs de alto rendimiento. Es una opción para desarrolladores que buscan desplegar asistentes o aplicaciones multimodales en el borde. La licencia Apache 2.0 facilita su uso comercial, aunque la documentación sobre arquitectura, entrenamiento y rendimiento es escasa, limitando su evaluación rigurosa.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (familia Gemma 4, probablemente MoE, sin confirmar) |
| Parametros totales | no disponible (el nombre E2B sugiere ~2B activos, pero no se confirma) |
| Parametros activos | no disponible (posiblemente ~2B si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4NX (mezcla de Q8_0, Q4_1 y BF16) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | Q4NX (propietario de FastFlowLM, no es GGUF) |

## Arquitectura y entrenamiento

No se ha proporcionado información detallada sobre la arquitectura interna del modelo base `Gemma4-E2B-IT-NPU2`. Según los resultados de búsqueda sobre la familia Gemma 4, existen variantes de distintos tamaños (E2B, E4B, 12B, 26B A4B, 31B), donde la nomenclatura "A4B" sugiere arquitectura de mezcla de expertos (MoE) con 4 mil millones de parámetros activos. Por analogía, "E2B" podría indicar un modelo MoE con 2 mil millones de parámetros activos, pero no se dispone de confirmación oficial. Tampoco se conocen los datos de entrenamiento (número de tokens, composición del dataset) ni los métodos de alineación (RLHF, DPO, etc.). Este repositorio en concreto no contiene información sobre el proceso de entrenamiento, solo sobre la conversión a formato Q4NX para FastFlowLM. La única innovación técnica destacable es el propio formato de cuantización Q4NX, diseñado para aprovechar las capacidades de la NPU XDNA de AMD.

## Capacidades

- **Procesamiento multimodal**: acepta entradas de texto e imagen (pipeline `any-to-any`), lo que permite tareas como respuesta a preguntas visuales y descripción de imágenes.
- **Generación de texto**: al ser un modelo de lenguaje, puede generar respuestas coherentes en lenguaje natural.
- **Inferencia en hardware NPU**: optimizado para ejecutarse en AMD XDNA NPU mediante el runtime FastFlowLM, lo que permite despliegue en dispositivos de bajo consumo.
- **Compatibilidad con el ecosistema FastFlowLM**: se integra con `flm-add` para instalación y ejecución, y admite configuración de chat template y tokenizer.

No se ha confirmado soporte para tool calling, razonamiento multi-paso o capacidades avanzadas de agente, aunque es probable que las herede del modelo base Gemma 4, pero no se especifica en la documentación.

## Casos de uso

- **Asistentes locales en portátiles con AMD Ryzen AI**: el modelo puede desplegarse como asistente personal que procese texto e imágenes directamente en el dispositivo, sin conexión a internet, gracias a su cuantización ligera y ejecución en NPU.
- **Análisis de imágenes en el punto de atención**: aplicaciones de visión artificial en entornos médicos o industriales que requieran clasificar o describir imágenes de forma local, respetando la privacidad de los datos.
- **Chatbots de atención al cliente en entornos sin conexión**: integración en sistemas de soporte técnico o comercial que operan en redes aisladas, con capacidades multimodales para recibir capturas de pantalla o fotos del usuario.
- **Prototipado de aplicaciones de IA en el borde**: para desarrolladores que necesitan validar rápidamente ideas de IA en hardware con NPU XDNA antes de escalar a servidores.
- **Sistemas de documentación automática**: el modelo puede generar descripciones de imágenes o transcribir contenido visual en entornos donde el hardware es limitado.
- **Educación y aprendizaje**: uso en aplicaciones educativas que necesiten un modelo de lenguaje y visión ejecutándose en portátiles de estudiantes, sin coste de servidor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- **NPU obligatoria**: el modelo está compilado para la NPU AMD XDNA (presente en procesadores Ryzen AI), no funciona en GPU convencionales sin adaptación.
- **Espacio en disco**: el repositorio ocupa 6.0 GB, con pesos de 4.35 GB.
- **Memoria**: no se indica la VRAM o memoria unificada necesaria, pero al ser cuantizado y dirigido a NPU, se espera que quepa en la memoria unificada de los dispositivos con Ryzen AI (típicamente 16 GB o más).
- **Runtime**: requiere FastFlowLM (FLM) versión 1.0.1 o superior, instalado mediante `flm-add`.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa directa. El modelo base Gemma 4 tiene variantes de distintos tamaños, pero no se han publicado métricas comparativas. Se puede mencionar que alternativas como Gemma 4 E4B (4 mil millones de activos) o Gemma 4 12B ofrecerían mayor capacidad, pero con mayor huella de memoria y requisitos de hardware. Sin embargo, no hay datos cuantitativos en la documentación proporcionada.

## Limitaciones y advertencias

- **Escasa documentación**: no se han publicado detalles de arquitectura, datos de entrenamiento, ni benchmarks, lo que dificulta evaluar su calidad real.
- **Posible degradación por cuantización**: al ser una conversión cuantizada (Q4NX), la precisión puede ser inferior a la del modelo original en tareas complejas.
- **Sesgos y alucinaciones**: como cualquier modelo de lenguaje, puede generar contenido incorrecto o sesgado; no se ha proporcionado información sobre mitigaciones.
- **Dependencia de hardware específico**: no es portable a otras plataformas sin una nueva conversión, y requiere la NPU AMD XDNA y el runtime FastFlowLM.
- **Sin garantías de producción**: el modelo es una conversión no oficial de un repositorio de terceros, y el autor no ofrece garantías de estabilidad o seguridad para uso en producción.

## Enlaces

- [HuggingFace del modelo](https://huggingface.co/Atomic-Germ/Gemma4-Claude-Sonnet-E2B-NPU2)
- [Modelo base](https://huggingface.co/Atomic-Germ/Gemma4-E2B-IT-NPU2)
- [Página de Gemma 4 en DeepMind](https://deepmind.google/models/gemma/gemma-4/)
- [Model card de Gemma 4 en Google AI](https://ai.google.dev/gemma/docs/core/model_card_4)
- [Guía de uso con Ollama y Claude Code (abril 2026)](https://meshworld.in/blog/ai/tooling/gemma4-ollama-claude-code/)
