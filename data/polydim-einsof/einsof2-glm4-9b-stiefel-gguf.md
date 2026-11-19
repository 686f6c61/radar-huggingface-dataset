# Polydim-Einsof/einsof2-glm4-9b-stiefel-gguf

## Resumen

EINSOF-II GLM-4 9B Stiefel (GGUF) es una cuantización del modelo base `THUDM/glm-4-9b-chat` (GLM-4-9B-Chat, desarrollado por Zhipu AI / THUDM) sobre la que se ha aplicado un adaptador publicado por Polydim-Einsof bajo el nombre `einsof2-glm4-9b-stiefel-adapter`. El repositorio distribuye únicamente pesos en formato GGUF en dos cuantizaciones, Q4_K_M y Q8_0, pensadas para su uso con llama.cpp y Ollama.

El elemento diferencial que declara el autor es el uso de una retracción polar de orden 4 sobre una variedad de Stiefel S^(D-1) para la composición del adaptador, junto con un componente denominado POLYDIM PMTP integrado en el flujo de llama.cpp. La model card no aporta detalles sobre el dataset de ajuste, el número de tokens de entrenamiento ni la metodología de evaluación, por lo que la mayor parte de las capacidades heredadas deben atribuirse al modelo base GLM-4-9B-Chat.

El modelo base es un transformer denso de 9.4 mil millones de parámetros con ventana de contexto de 128 000 tokens y soporte multilingüe (chino e inglés principalmente), lo que convierte a esta cuantización en una opción interesante para despliegue local en hardware de consumo. No obstante, el repositorio no incluye benchmarks propios ni documentación de evaluación del adaptador, y la licencia figura como "other" sin texto adicional, lo que exige verificación directa antes de cualquier uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base GLM-4-9B-Chat); adaptador con retracción polar de orden 4 sobre variedad de Stiefel S^(D-1) |
| Parametros totales | 9 399 951 360 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card (el modelo base GLM-4-9B-Chat soporta 128 000 tokens) |
| Tipos de cuantizacion | Q4_K_M (5,83 GB) y Q8_0 (9,31 GB) |
| Idiomas soportados | no disponible en la model card (el modelo base soporta chino e inglés, con multilingüismo parcial) |
| Licencia | other (sin texto de licencia publicado en el repo) |
| Formato de pesos | GGUF (compatible con llama.cpp y Ollama) |

## Arquitectura y entrenamiento

El modelo resultante es un transformer denso de 9.4 mil millones de parámetros derivado de GLM-4-9B-Chat mediante la aplicación de un adaptador. El autor describe la técnica de adaptación como una retracción polar de orden 4 sobre una variedad de Stiefel S^(D-1), un enfoque de optimización restringida a matrices con columnas ortonormales que se ha explorado en la literatura como alternativa a LoRA para preservar la geometría de los pesos durante el ajuste fino. El adaptador se publica por separado en `Polydim-Einsof/einsof2-glm4-9b-stiefel-adapter`.

La model card menciona un framework propio denominado "POLYDIM PMTP" integrado con llama.cpp, pero no detalla su función, el dataset de ajuste, el número de tokens vistos, ni si se emplearon técnicas de RLHF o DPO. Tampoco se especifica si el adaptador se aplicó sobre los pesos completos o solo sobre determinadas capas. El tokenizador se declara alineado con `zai-org/glm-4-9b-chat-hf` con un vocabulario de 151 552 entradas, lo que garantiza compatibilidad con el ecosistema del modelo base.

## Capacidades

- Generación de texto conversacional multi-turno, heredada de GLM-4-9B-Chat.
- Razonamiento y matemáticas de nivel medio, sujeto a las capacidades del modelo base.
- Generación de código y soporte de tool calling / function calling (capacidad del modelo base GLM-4-9B-Chat).
- Soporte de agentes y razonamiento multi-paso, según las capacidades del modelo base.
- Capacidades multilingües limitadas a las del modelo base (chino e inglés principalmente).
- Ejecución local vía llama.cpp y Ollama gracias al formato GGUF.
- No se documentan capacidades adicionales específicas del adaptador (thinking mode, visión, audio) en la model card.

## Casos de uso

- Despliegue local en estación de trabajo: con la cuantización Q4_K_M (5,83 GB) el modelo cabe en GPUs de consumo con 8 GB de VRAM, lo que permite ejecutar un modelo de 9B en hardware asequible sin depender de la nube.
- Asistente conversacional en el borde: la naturaleza GGUF y la compatibilidad con Ollama facilitan integrar el modelo en aplicaciones de escritorio o entornos sin conectividad.
- Prototipado de agentes con tool calling: al heredar las capacidades de function calling de GLM-4-9B-Chat, puede emplearse para validar flujos de agente antes de escalar a modelos mayores.
- Generación de código en local: útil para autocompletado o revisión de código en entornos con requisitos de privacidad, siempre que se valide la calidad frente al modelo base.
- Investigación sobre adaptación geométrica: el repositorio sirve como artefacto reproducible para estudiar el efecto de la retracción polar sobre Stiefel en el ajuste fino de transformers.
- Evaluación comparativa de cuantizaciones: disponer de Q4_K_M y Q8_0 permite medir la degradación de calidad y el ahorro de memoria en un mismo modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni comparaciones con el modelo base, por lo que no es posible cuantificar el efecto del adaptador ni la degradación introducida por las cuantizaciones Q4_K_M y Q8_0.

## Requisitos de hardware

- VRAM estimada: aproximadamente 6-7 GB para Q4_K_M (pesos de 5,83 GB más overhead de contexto) y 10-11 GB para Q8_0 (pesos de 9,31 GB más overhead).
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090, A100 y H100 para despliegues de mayor concurrencia.
- Compatibilidad con GPU de consumo: sí; Q4_K_M cabe en GPUs de 8 GB y Q8_0 requiere al menos 12 GB para contextos moderados.
- Opciones de despliegue: llama.cpp y Ollama (soportados de forma nativa por el formato GGUF); vLLM y TGI no soportan GGUF de forma directa sin conversión.
- Latencia y throughput: no disponibles; no se han publicado mediciones en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| EINSOF-II GLM-4 9B Stiefel (este) | 9,4B | no disponible (base: 128k) | GGUF | other | Adaptador Stiefel; sin benchmarks publicados |
| GLM-4-9B-Chat (base) | 9,4B | 128k | safetensors | licencia GLM-4 propia | Modelo original de Zhipu AI; benchmarks publicados por el autor |
| Qwen2.5-7B-Instruct | 7,6B | 128k | safetensors, GGUF | Apache 2.0 | Alternativa abierta con amplio ecosistema de cuantizaciones |
| Llama-3.1-8B-Instruct | 8,0B | 128k | safetensors, GGUF | Llama 3.1 Community License | Referencia habitual en el segmento 7-9B |

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada de que el adaptador mejore al modelo base; podría degradarlo.
- Licencia "other" sin texto: impide determinar a priori si se permite uso comercial; es imprescindible contactar con el autor o revisar la licencia del modelo base GLM-4-9B-Chat.
- Model card mínima: no se documentan datos de entrenamiento, hiperparámetros del adaptador ni metodología de evaluación.
- Riesgo de alucinación: inherente al modelo base, no cuantificado para esta variante.
- Idiomas: la model card no declara idiomas; el modelo base está optimizado para chino e inglés, con rendimiento inferior en castellano.
- Contexto: aunque el base soporta 128k tokens, no se confirma que la cuantización y el adaptador preserven esa ventana; debe validarse empíricamente.
- Madurez: repositorio con 0 descargas y 0 likes, creado y actualizado el mismo día, sin comunidad ni soporte; no recomendable para producción sin evaluación previa.
- Compatibilidad: el componente "POLYDIM PMTP" sugiere posibles dependencias de un fork de llama.cpp no documentado; verificar antes de desplegar.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Polydim-Einsof/einsof2-glm4-9b-stiefel-gguf
- Adaptador: https://huggingface.co/Polydim-Einsof/einsof2-glm4-9b-stiefel-adapter
- Modelo base (THUDM): https://huggingface.co/THUDM/glm-4-9b-chat
- Modelo base (tokenizador alineado): https://huggingface.co/zai-org/glm-4-9b-chat-hf
- Repositorio llama.cpp: https://github.com/ggerganov/llama.cpp
- Ollama: https://ollama.com
