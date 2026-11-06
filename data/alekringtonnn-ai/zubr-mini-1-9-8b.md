# alekringtonnn-ai/zubr-mini-1.9-8b

## Resumen

Zubr Mini 1.9 8B es un modelo lingüístico multimodal (visión + texto) de 8.489.553.920 parámetros, desarrollado por Zubr-AI (bajo la cuenta de Hugging Face alekringtonnn-ai) como fine-tuning de Mistral 3 8B (concretamente de mistralai/Ministral-3-8B-Instruct-2512-GGUF). El modelo se distribuye en formato GGUF y está pensado para inferencia local en CPU, portátiles y servidores, con aceleración opcional por GPU NVIDIA o AMD.

Su rasgo distintivo es el enfoque de "fast thinking": durante el entrenamiento, cada ejemplo incluía contexto, pregunta y el inicio de pasos de razonamiento breves, de modo que el razonamiento compacto queda entretejido en la propia respuesta en lugar de generarse como una fase oculta previa. Esto reduce la latencia y el consumo de tokens respecto a los modelos de razonamiento clásicos.

La versión 1.9 amplía además el motor de visión de 1.000 a 2.000 millones de parámetros, integrado en la propia arquitectura mistral3 (no como módulo externo), lo que mejora el OCR, el reconocimiento de diagramas y tablas, y el diálogo multimodal. Con licencia Apache 2.0 y soporte para decenas de idiomas (incluido el castellano), es relevante para quien necesita un modelo multimodal compacto, con razonamiento eficiente y ejecución 100% local.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | mistral3 unificada (multimodal, motor de visión integrado de ~2B parámetros) |
| Parametros totales | 8.489.553.920 |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF: IQ2_M, Q2_K, Q3_K_S, Q3_K_M, Q4_0, Q5_K_S |
| Idiomas soportados | ru, be, en, es, fr, de, nl, ja, it, pl, da, ro, el, uk, br, ar, fa, tr, bn, id, hi, ne, pa, ta, te, zh, pt, ga, uz, tg, tk, lt, sr, bg, sv, fi, ca, gl, is, mr, kn, kk, bs, he, ur, cy, rm, mn |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (compatible con transformers según la model card) |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura mistral3 unificada de Mistral AI, en la que el componente de visión está estrechamente integrado en el propio modelo en lugar de ser un módulo añadido. En esta versión 1.9, el motor de visión se ha ampliado de 1.000 a 2.000 millones de parámetros, lo que según el autor mejora el reconocimiento de detalles, el OCR dentro de imágenes, y la interpretación de diagramas y tablas, sin crear un cuello de botella separado en el procesamiento de imágenes.

El entrenamiento del fine-tuning se basó en un principio de "fast thinking": cada ejemplo de entrenamiento contenía contexto, pregunta y el inicio de pasos de razonamiento breves (cadenas de pensamiento cortas). Como resultado, el modelo incorpora el razonamiento compacto directamente en la fase de generación de la respuesta, en lugar de desplegar primero largas cadenas ocultas de pensamiento. El autor no detalla el número de tokens del fine-tuning, la composición del dataset ni el uso de técnicas como RLHF o DPO: no disponible.

## Capacidades

- Generación de texto conversacional con razonamiento compacto integrado en la respuesta ("fast thinking"), sin fase previa de pensamiento extenso.
- Comprensión multimodal imagen-texto-a-texto: preguntas sobre imágenes, descripción de contenido visual.
- OCR y extracción de texto dentro de imágenes, interpretación de diagramas y tablas.
- Soporte multilingüe amplio: más de 45 idiomas, incluidos castellano (es), catalán (ca), gallego (gl), ruso, chino, japonés, árabe o hindi.
- Ejecución local en CPU y GPU mediante formatos GGUF cuantizados.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y multi-step reasoning: no disponible de forma explícita; el razonamiento se produce dentro de la respuesta, pero no consta soporte específico para flujos agénticos.

## Casos de uso

- OCR y digitalización de documentos: gracias al motor de visión de 2B parámetros, puede extraer texto de fotografías, escaneos y capturas de pantalla directamente en local, útil para flujos donde los datos no pueden salir de la organización.
- Interpretación de diagramas y tablas: puede responder preguntas sobre gráficos, tablas y esquemas incluidos en imágenes, adecuado para análisis rápido de informes visuales.
- Asistente conversacional multimodal en local: diálogo imagen + texto → respuesta en portátiles y PCs de gama media, sin depender de APIs externas.
- Atención al cliente multilingüe: soporta decenas de idiomas en un único modelo de 8B, lo que permite desplegar chatbots locales para mercados diversos sin un modelo por idioma.
- Razonamiento con restricciones de latencia: al no generar una fase previa de "thinking", es adecuado para aplicaciones interactivas donde la velocidad de primera respuesta importa más que el razonamiento profundo.
- Despliegue en dispositivos con memoria limitada: las cuantizaciones IQ2_M y Q2_K (3,11–3,35 GB) permiten ejecutarlo en equipos con 6–8 GB de RAM, a costa de calidad.
- Procesamiento de imágenes en Mac: al ser GGUF compatible con runtimes como llama.cpp y LM Studio, puede integrarse en flujos locales en Apple Silicon (aunque la variante MLX publicada es la del modelo 3B).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- RAM/VRAM estimada según cuantización (recomendación del autor: al menos el doble del tamaño del archivo):
  - IQ2_M (~3,11 GB): equipos con 6–8 GB de RAM; calidad notablemente degradada.
  - Q2_K (~3,35 GB): equipos con ~8 GB de RAM.
  - Q3_K_S (~3,87 GB): ~8 GB de RAM; mínimo nivel de calidad razonable.
  - Q3_K_M (~4,24 GB): ~8 GB de RAM; mejor equilibrio en la gama baja.
  - Q4_0 (~4,94 GB, recomendada): 8–12 GB de RAM.
  - Q5_K_S (~5,92 GB): 12–16 GB de RAM; máxima calidad del repositorio.
- CPU: cualquier x86 moderno con AVX/AVX2, o dispositivos ARM. GPU opcional (NVIDIA/AMD) para acelerar la inferencia, especialmente recomendable para tareas de visión.
- Cabe en GPUs de consumo: sí; con Q4_0 (~5 GB) cabe con holgura en una RTX 3060 de 12 GB, RTX 4060 Ti 16 GB o RTX 4090; con Q5_K_S también en GPUs de 8–12 GB.
- Opciones de despliegue: Ollama, llama.cpp, LM Studio y vLLM (mencionados en la model card); compatible con el ecosistema GGUF en general.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Multimodal | Contexto | Formato | Licencia |
|---|---|---|---|---|---|
| Zubr Mini 1.9 8B | 8,49B (visión ~2B) | Sí (imagen-texto-a-texto) | no disponible | GGUF (IQ2–Q5) | Apache 2.0 |
| Ministral-3-8B-Instruct-2512 (base) | ~8B | Sí (arquitectura mistral3) | no disponible | GGUF/safetensors | Restringida (Mistral) |
| Zubr Mini 1.9 3B | ~3B | Sí | no disponible | GGUF + MLX | Apache 2.0 |
| Llama 3.2 11B Vision Instruct | ~11B | Sí | 128K | safetensors | Llama 3.2 Community |

Zubr Mini 1.9 8B se posiciona como una alternativa Apache 2.0 al modelo base de Mistral (cuya licencia original es más restrictiva), con la ventaja del razonamiento integrado y cuantizaciones muy agresivas para hardware modesto. Frente a Llama 3.2 11B Vision, ofrece menos parámetros y menor huella de memoria, aunque sin datos de benchmarks publicados no es posible comparar rendimiento de forma objetiva.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible; al heredar pesos de Ministral-3-8B-Instruct-2512, puede arrastrar los sesgos del modelo base, no documentados en la model card.
- Riesgo de alucinación: no cuantificado; como todo modelo de lenguaje de 8B, puede generar contenido incorrecto, y el razonamiento "entretejido" en la respuesta no garantiza corrección factual.
- Cuantizaciones bajas degradan claramente la calidad: el propio autor advierte que IQ2_M y Q2_K sufren pérdida notable de calidad y solo deben usarse bajo restricciones estrictas de memoria.
- Longitud de contexto no publicada: no se puede planificar el uso con documentos largos sin verificarlo empíricamente.
- Licencia: Apache 2.0 permite uso comercial sin restricciones relevantes, pero conviene verificar la licencia del modelo base subyacente de Mistral para usos en producción.
- Proyecto de autor independiente con tracción muy baja (347 descargas, 1 like en el momento de la ficha): sin auditoría comunitaria amplia, sin benchmarks públicos y con documentación de entrenamiento incompleta; se recomienda evaluación interna antes de uso en producción.
- No consta soporte explícito de tool calling ni capacidades agénticas.

## Enlaces

- Ficha en Hugging Face (espejo del autor): https://huggingface.co/alekringtonnn-ai/zubr-mini-1.9-8b
- Repositorio referenciado en la model card: https://huggingface.co/Zubr-AI/zubr-mini-1.9-8b
- Modelo base: https://huggingface.co/mistralai/Ministral-3-8B-Instruct-2512-GGUF
- Versión 3B de la línea Zubr: https://huggingface.co/alekringtonnn-ai/zubr-mini-1.9-3b
- Versión MLX del 3B para Mac: https://huggingface.co/alekringtonnn-ai/zubr-mini-1.9-3b-mlx
- Paper, blog o demo: no disponible
