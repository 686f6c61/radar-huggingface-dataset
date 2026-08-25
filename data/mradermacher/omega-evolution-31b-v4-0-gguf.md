# mradermacher/Omega-Evolution-31B-v4.0-GGUF

## Resumen

Omega-Evolution-31B-v4.0 es un modelo de lenguaje de gran tamaño desarrollado por ReadyArt y cuantizado a formato GGUF por mradermacher para su uso en entornos locales y de baja latencia. Está orientado a tareas de conversación, roleplay y generación de texto creativo, con un perfil explícito y sin alineación, tal como indican sus etiquetas (nsfw, explicit, roleplay, unaligned, dangerous, ERP). El modelo base emplea una arquitectura tipo gemma4_text con 60 capas transformer, atención con consultas agrupadas (GQA) y un tamaño de 30.7B parámetros.

La versión GGUF aquí documentada incluye múltiples cuantizaciones, desde Q2_K hasta Q8_0, además de archivos multimodales (mmproj) que sugieren capacidades de visión. Es relevante para desarrolladores que buscan un modelo de roleplay y narrativa con control fino sobre el tono y la temática, aunque su falta de alineación implica riesgos importantes en entornos productivos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | gemma4_text (transformer con GQA, 60 capas, hidden size 5376, intermediate size 21504) |
| Parametros totales | 30.697.345.596 (30,7B) |
| Parametros activos | no aplicable (modelo denso) |
| Longitud de contexto | no disponible (no especificada en la documentación) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q6_K, Q8_0, mmproj-f16, mmproj-Q8_0 |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (con archivos multimodales mmproj) |

## Arquitectura y entrenamiento

La arquitectura base corresponde a la familia Gemma 4, con 60 capas transformer, un tamaño oculto de 5376 y un tamaño intermedio de 21504. Utiliza atención de consultas agrupadas (GQA) con 32 cabezas de consulta y 16 cabezas de clave/valor, lo que reduce el coste computacional en comparación con la atención multi-cabeza estándar. No se dispone de información sobre el dataset de entrenamiento, el número de tokens procesados ni el proceso de ajuste (por ejemplo, RLHF o DPO). El modelo parece tener un componente multimodal (los archivos mmproj), pero no se detalla su funcionamiento.

La versión GGUF es una cuantización estática realizada por mradermacher, que no ha aplicado imatrix ni pesos ponderados según la descripción del repositorio. La calidad de las cuantizaciones varía según el tipo, siendo Q4_K_M y Q6_K las más recomendadas para un equilibrio entre velocidad y precisión, mientras que Q2_K y Q3_K_S sacrifican calidad para reducir el tamaño.

## Capacidades

- Generación de texto libre y conversacional, especialmente orientado a roleplay y narración interactiva.
- Soporte para contenido explícito y sin restricciones (NSFW, ERP), dada su falta de alineación.
- Capacidades multimodales (indicadas por los archivos mmproj), aunque no se detalla qué tipos de entrada acepta (probablemente imágenes).
- Uso en inglés como idioma principal; no se menciona soporte multilingüe.
- No se especifica soporte para tool calling, function calling ni razonamiento multi-paso.
- No se indica la presencia de un modo de pensamiento (thinking mode) ni capacidades de audio.

## Casos de uso

- Roleplay interactivo en juegos de texto: el modelo puede mantener conversaciones largas y coherentes con un estilo narrativo rico, ideal para juegos de rol o chatbots de ficción.
- Generación de ficción erótica o explícita: al carecer de alineación, permite crear historias con contenido adulto sin censura, útil para escritores o plataformas de contenido para adultos.
- Prototipado de asistentes de conversación sin restricciones: para investigación en sistemas de diálogo que requieren manejar temas sensibles o taboo.
- Generación de narrativa creativa: puede usarse para escribir cuentos, guiones o novelas con un estilo flexible y adaptable.
- Interacción con personajes ficticios: los usuarios pueden crear personajes con personalidades definidas y mantener conversaciones prolongadas.
- Experimentación con modelos multimodales: los archivos mmproj permiten combinar el modelo con un codificador visual para tareas que requieren entrada de imágenes, aunque no se documenta su uso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de datos sobre MMLU, HumanEval, GSM8K ni otras pruebas estándar para este modelo.

## Requisitos de hardware

- VRAM estimada: según el tamaño de los archivos GGUF, se necesitan al menos 12 GB (Q2_K) hasta 33 GB (Q8_0). Para Q4_K_M (18,8 GB) se recomienda una GPU con al menos 24 GB de VRAM.
- GPUs recomendadas: para cuantizaciones ligeras (Q2_K, Q3_K_S) puede servir una RTX 4060 Ti 16 GB o RTX 3090; para Q4_K_M o superior se necesita una RTX 4090 (24 GB) o una A100 40 GB.
- En consumer GPU: Q2_K y Q3_K_S caben en GPUs de 16 GB, pero con limitaciones de contexto. Q4_K_M ya exige 24 GB.
- Opciones de despliegue: llama.cpp, Ollama, vLLM (con soporte GGUF), LM Studio, etc.
- Latencia y throughput: no se han publicado datos; dependerá del hardware y de la longitud del contexto.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables directos (mismo tamaño y orientación a roleplay). Como referencia, otros modelos de roleplay como Mistral-7B o Llama-3-8B tienen menos parámetros, pero no se pueden comparar cuantitativamente sin datos de benchmarks. Se puede indicar que este modelo ofrece un tamaño mayor (30,7B) y una arquitectura más avanzada que los modelos de 7B, pero con requisitos de VRAM superiores.

## Limitaciones y advertencias

- Modelo sin alineación: puede generar contenido dañino, violento, ilegal o no ético, por lo que no debe desplegarse en entornos productivos sin un filtrado adicional.
- Sesgos desconocidos: al no haber documentación sobre el entrenamiento, no se pueden evaluar sesgos de género, raza o ideología.
- Riesgo de alucinación: como todo modelo generativo, puede producir información falsa o inventada, especialmente en tareas de razonamiento o hechos.
- Longitud de contexto no especificada: se desconoce el límite de tokens de entrada, lo que puede afectar a tareas de largo plazo.
- Soporte solo en inglés: no es adecuado para aplicaciones multilingües.
- Licencia Apache-2.0 permite uso comercial, pero el contenido generado puede estar sujeto a restricciones legales según la jurisdicción.
- No hay garantías de calidad de las cuantizaciones: los quants de baja precisión (Q2_K, Q3_K) pueden degradar significativamente la coherencia del texto.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/Omega-Evolution-31B-v4.0-GGUF
- Modelo base: https://huggingface.co/ReadyArt/Omega-Evolution-31B-v4.0
- Página del modelo (OpenCSG): https://opencsg.com/models/ReadyArt/Omega-Evolution-31B-v4.0-GGUF?tab=summary
- Visor de arquitectura: https://hfviewer.com/ReadyArt/Omega-Evolution-31B-v4.0
- Guía de cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
