# mradermacher/Blink-27B-GGUF

## Resumen

Blink-27B es una cuantización en formato GGUF del modelo Piccolo-27B, desarrollado por agentscope-ai, realizada por el cuantizador conocido como mradermacher. No se trata de un modelo nuevo en sí mismo, sino de un repositorio de pesos comprimidos que permite ejecutar el modelo base en hardware de consumo mediante backends como llama.cpp, Ollama o LM Studio. El modelo base es un modelo de 27.320.697.856 parámetros etiquetado como "decision model" con atención bidireccional, lo que sugiere una arquitectura orientada a tareas de decisión y razonamiento agéntico dentro del ecosistema AgentScope.

La relevancia de esta ficha radica en la disponibilidad del modelo en múltiples niveles de cuantización (desde Q2_K con unos 11 GB hasta Q8_0 con 29,1 GB), lo que permite ajustar el compromiso entre calidad, VRAM y velocidad según el hardware disponible. Incluye además archivos mmproj (suplemento multimodal), lo que indica que el modelo base incorpora capacidades de visión. El soporte de idiomas oficiales es inglés y chino, con licencia Apache 2.0 que permite uso comercial sin restricciones.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Decision model con atención bidireccional (detalles no disponibles) |
| Parametros totales | 27.320.697.856 (~27,3 B) |
| Parametros activos | no disponible (no consta arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | Inglés, chino |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantización estática; el modelo base usa safetensors) |

## Arquitectura y entrenamiento

El modelo base, Piccolo-27B de agentscope-ai, está etiquetado como "decision model" con "bidirectional attention", lo que apunta a una arquitectura transformer con mecanismo de atención que procesa el contexto en ambas direcciones, una característica poco habitual en modelos generativos causales estándar y típicamente asociada a modelos de decisión o de rellenado de contexto. Los tags incluyen "agentscope" y "qwenpaw", lo que sugiere vinculación con el framework AgentScope para sistemas multiagente. No hay información disponible sobre el número de tokens de entrenamiento, la composición del dataset ni sobre etapas de RLHF o DPO.

La contribución de mradermacher es puramente de cuantización: conversión estática del modelo base a once niveles GGUF distintos, además de dos archivos mmproj (proyección multimodal en Q8_0 y f16) que habilitan la entrada de imágenes en backends compatibles. No se han publicado cuantizaciones imatrix ponderadas en el momento de redacción de la ficha.

## Capacidades

- Generación de texto conversacional (tag "conversational" en el repositorio).
- Toma de decisiones y razonamiento agéntico, según la etiqueta "decision-model" y la vinculación con AgentScope.
- Atención bidireccional, potencialmente útil para tareas de comprensión de contexto completo.
- Capacidad multimodal de entrada de imágenes, mediante los archivos mmproj incluidos (suplemento multimodal).
- Soporte de inglés y chino.
- No consta información sobre tool calling, function calling ni soporte nativo de agentes más allá de la vinculación con el ecosistema AgentScope.

## Casos de uso

- Ejecución local en GPU de consumo: con la cuantización Q4_K_M (16,9 GB) el modelo cabe en una RTX 4090 de 24 GB, permitiendo experimentación privada sin coste de API.
- Sistemas multiagente con AgentScope: la vinculación del modelo base con el framework AgentScope lo hace adecuado como motor de decisión para pipelines agénticos.
- Comprensión de imágenes en local: combinando los archivos mmproj con un backend compatible (llama.cpp), se pueden construir aplicaciones de descripción o análisis visual sin depender de servicios externos.
- Despliegue en servidores con VRAM limitada: la variante Q2_K (11 GB) permite servir el modelo en GPUs de 12-16 GB, con penalización de calidad.
- Servicios de máxima fidelidad: Q8_0 (29,1 GB) ofrece calidad cercana a la del modelo original para despliegues en A100 de 40 GB o similares.
- Investigación sobre arquitecturas de atención bidireccional: el modelo sirve como base experimental para estudiar alternativas al transformer causal estándar.
- Bilingüismo inglés-chino: aplicaciones que requieran operar en ambos idiomas con un único modelo local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada según cuantización (solo pesos, sin KV-cache):
  - Q2_K: ~11 GB
  - Q3_K_M: ~13,6 GB
  - IQ4_XS: ~15,5 GB
  - Q4_K_M: ~16,9 GB
  - Q5_K_M: ~19,6 GB
  - Q6_K: ~22,5 GB
  - Q8_0: ~29,1 GB
- GPU recomendadas: RTX 4090 (24 GB) para Q4/Q5; RTX 5090, A100 40 GB o 2x RTX 3090 para Q6/Q8. Añadir margen para el contexto y el mmproj (~0,7-1 GB).
- Consumer GPUs: cabe en una RTX 4090/3090 hasta Q5_K_M; Q6_K justo en 24 GB; Q8_0 requiere 32 GB o descarga parcial en RAM/CPU.
- Despliegue: llama.cpp (formato nativo GGUF), Ollama, LM Studio, koboldcpp. No apto directamente para vLLM o TGI sin conversión de vuelta a safetensors (usar el modelo base para eso).
- Latencia y throughput: no disponible.
- Opción CPU: viable con velocidades bajas dado el tamaño de ~27 B parámetros.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| Blink-27B (Piccolo-27B) | 27,3 B | no disponible | Apache 2.0 | GGUF |
| Qwen2.5-32B-Instruct | 32,5 B | 128.000 | Apache 2.0 (parcial) | safetensors, GGUF |
| Gemma 2 27B | 27 B | 8.192 | Gemma (restricciones) | safetensors, GGUF |

Piccolo-27B compite en la franja de 27-32 B con Gemma 2 27B (tamaño idéntico pero licencia restrictiva) y Qwen2.5-32B (contexto mucho mayor). Su diferenciador declarado es la atención bidireccional y la orientación a decisiones agénticas, aunque sin benchmarks publicados no es posible contrastar rendimiento.

## Limitaciones y advertencias

- No hay benchmarks ni evaluaciones publicadas en la ficha, por lo que la calidad real del modelo debe validarse empíricamente antes de uso en producción.
- Las cuantizaciones estáticas (sin imatrix) degradan la calidad respecto al modelo original, especialmente en Q2_K y Q3_K_S.
- La atención bidireccional puede no ser compatible con todos los backends y plantillas de chat de llama.cpp; verificar compatibilidad antes de desplegar.
- Soporte de idiomas limitado a inglés y chino; el rendimiento en castellano no está documentado.
- La longitud de contexto no está documentada en esta ficha; consultar la model card del modelo base antes de planificar cargas con documentos largos.
- Los archivos mmproj requieren backend con soporte multimodal; sin ellos el modelo es solo texto.
- Licencia Apache 2.0: sin restricciones comerciales relevantes, pero conviene revisar los términos del modelo base agentscope-ai/Piccolo-27B.
- Riesgo de alucinación inherente a LLMs de este tamaño; no documentado específicamente para este modelo.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Blink-27B-GGUF
- Modelo base: https://huggingface.co/agentscope-ai/Piccolo-27B
- Página de descargas del cuantizador: https://hf.tst.eu/model#Blink-27B-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Notas sobre tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del cuantizador: https://www.nethype.de/
