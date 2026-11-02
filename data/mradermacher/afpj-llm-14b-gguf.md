# mradermacher/AFPJ-LLM-14B-GGUF

## Resumen

AFPJ-LLM-14B-GGUF es la versión cuantizada en formato GGUF del modelo base lxl3129/AFPJ-LLM-14B, publicada por el usuario mradermacher, conocido en el ecosistema por generar cuantizaciones estáticas de modelos abiertos para su uso con llama.cpp y herramientas compatibles. El modelo original es un transformer de 14.770.033.664 parámetros (aproximadamente 14,8 mil millones) orientado a conversación, con licencia no especificada en la información disponible.

La relevancia de esta ficha radica en que el repositorio proporciona 11 variantes de cuantización (desde Q2_K de 5,9 GB hasta Q8_0 de 15,8 GB), lo que permite desplegar un modelo de casi 15B parámetros en hardware de consumo. El autor de la cuantización no ofrece datos sobre el entrenamiento, la arquitectura interna ni los benchmarks del modelo original, por lo que gran parte de las especificaciones quedan como no disponibles.

El modelo está etiquetado únicamente para inglés y no se ha publicado información sobre el proceso de entrenamiento, la composición del dataset ni la longitud de contexto. La fecha de creación del repositorio es el 13 de noviembre de 2025 y la última actualización el 2 de noviembre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (deducida de la librería transformers; detalles internos no disponibles) |
| Parametros totales | 14.770.033.664 (~14,8B) |
| Parametros activos | no disponible (no es MoE según los datos disponibles) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones); modelo base en safetensors |
| Tamano del repo | 102,0 GB |
| Modelo base | lxl3129/AFPJ-LLM-14B |
| Cuantizador | mradermacher |
| Descargas | 69 |
| Likes | 1 |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base lxl3129/AFPJ-LLM-14B más allá de que se trata de un transformer compatible con la librería transformers y orientado a tareas conversacionales. El recuento de parámetros (14.770.033.664) es coherente con un modelo denso de aproximadamente 14,8B parámetros, sin indicios de arquitectura MoE.

Tampoco se han publicado datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF, DPO o SFT. La model card del repositorio cuantizado se limita a describir el proceso de cuantización estática y no incluye información sobre innovaciones técnicas del modelo original. No se dispone de información sobre decodificación especulativa, atención lineal u otras optimizaciones.

## Capacidades

- Generación de texto conversacional en inglés, según la etiqueta `conversational` del repositorio.
- Compatibilidad con la librería transformers y con endpoints compatibles (`endpoints_compatible`).
- Ejecución mediante llama.cpp y herramientas derivadas gracias al formato GGUF.
- Capacidades específicas de razonamiento, código, matemáticas, visión o audio: no disponibles en la información proporcionada.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al inglés según la etiqueta `language: en`.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Despliegue en hardware de consumo: con la cuantización Q4_K_M (9,1 GB) el modelo puede ejecutarse en GPUs con 12 GB de VRAM o en configuraciones CPU+RAM, lo que permite probar un modelo de ~14,8B parámetros sin infraestructura dedicada.
- Experimentación e investigación: investigadores que necesiten evaluar el comportamiento de un modelo conversacional de 14B en inglés pueden usar las distintas cuantizaciones para comparar la degradación de calidad entre Q2_K, Q4_K_M y Q8_0.
- Prototipado de chatbots en inglés: la etiqueta `conversational` sugiere uso en diálogos multi-turno, aunque la longitud de contexto no está documentada y debe validarse empíricamente.
- Integración en pipelines con llama.cpp: el formato GGUF permite incorporar el modelo en aplicaciones de escritorio, servidores ligeros o entornos embebidos mediante la API de llama.cpp.
- Evaluación comparativa de cuantizaciones: el repositorio ofrece 11 variantes, lo que facilita estudios sobre el impacto de la cuantización en la perplejidad y la calidad de generación.
- Pruebas de concepto en entornos con restricciones de memoria: la variante Q2_K (5,9 GB) permite ejecutar el modelo en equipos con 8 GB de VRAM, a costa de una calidad reducida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según tamaño de cuantización):
  - Q2_K: ~5,9 GB de pesos; ~7-8 GB de VRAM con overhead de contexto.
  - Q3_K_M: ~7,4 GB de pesos; ~9 GB de VRAM.
  - Q4_K_M: ~9,1 GB de pesos; ~11 GB de VRAM (recomendada por el autor como "fast, recommended").
  - Q5_K_M: ~10,6 GB de pesos; ~12-13 GB de VRAM.
  - Q6_K: ~12,2 GB de pesos; ~14 GB de VRAM.
  - Q8_0: ~15,8 GB de pesos; ~17-18 GB de VRAM.
- GPU recomendadas: RTX 4090 (24 GB) para Q6_K y Q8_0 con contexto amplio; RTX 4080/4070 Ti (16 GB) para Q5_K_M; RTX 3060 12 GB o RTX 4070 para Q4_K_M.
- Cabe en GPU de consumo: sí, desde Q2_K hasta Q6_K en tarjetas de 12-24 GB; Q8_0 requiere 24 GB o descarga parcial a CPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, y cualquier runtime compatible con GGUF. El modelo base es compatible con transformers.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| AFPJ-LLM-14B-GGUF | ~14,8B | no disponible | no disponible | GGUF | HuggingFace (69 descargas) |
| Modelos densos de ~14B en inglés (categoría general) | ~13-15B | variable | variable | safetensors/GGUF | amplia |
| Alternativas concretas | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente para establecer una comparativa rigurosa con modelos concretos de la misma categoría, dado que no se conocen benchmarks, contexto ni licencia del modelo base. La comparación queda limitada a la categoría general de modelos densos de ~14B parámetros en inglés.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; debe consultarse el repositorio del modelo base lxl3129/AFPJ-LLM-14B antes de cualquier despliegue en producción.
- Idiomas: solo inglés según la etiqueta del repositorio; no se garantiza un rendimiento adecuado en castellano u otros idiomas.
- Longitud de contexto desconocida: no se puede planificar el uso en tareas que requieran ventanas largas sin validación empírica.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad, razonamiento o código; el modelo no debe adoptarse en producción sin evaluación propia.
- Riesgo de alucinación: inherente a los modelos generativos; no hay datos específicos sobre mitigaciones aplicadas (RLHF, DPO, etc.).
- Sesgos conocidos: no documentados; al ser un modelo entrenado principalmente en inglés, es probable que herede sesgos culturales y lingüísticos de su corpus, pero no se dispone de información concreta.
- Cuantizaciones de baja precisión (Q2_K, Q3_K_S): el propio autor advierte que Q3_K_M es de "lower quality"; las variantes por debajo de Q4 pueden degradar notablemente la coherencia.
- Repositorio con muy baja tracción (69 descargas, 1 like): no hay comunidad que haya validado el modelo, lo que aumenta el riesgo de problemas no documentados.
- El autor de la cuantización no ha generado cuantizaciones con imatrix/weighted, lo que puede suponer una pérdida de calidad adicional frente a cuantizaciones ponderadas.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/AFPJ-LLM-14B-GGUF
- Modelo base: https://huggingface.co/lxl3129/AFPJ-LLM-14B
- Página de descargas del cuantizador: https://hf.tst.eu/model#AFPJ-LLM-14B-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Página de solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
