# mradermacher/Omega-Evolution-9B-v2.0-i1-GGUF

## Resumen

Omega-Evolution-9B-v2.0-i1-GGUF es la versión cuantizada en formato GGUF del modelo base ReadyArt/Omega-Evolution-9B-v2.0, preparada por el usuario mradermacher. Se trata de un modelo de lenguaje de aproximadamente 8,95 mil millones de parámetros orientado a roleplay, conversación y contenido explícito sin alineación, tal y como indican sus etiquetas (nsfw, explicit, roleplay, unaligned, dangerous, ERP). El cuantizador ha aplicado una matriz de importancia (imatrix) para mejorar la calidad de las cuantizaciones de baja precisión, y publica un amplio abanico de archivos GGUF que van desde niveles muy agresivos (IQ1_S, 2,8 GB) hasta cuantizaciones de alta calidad (Q6_K, 7,5 GB).

El repositorio contiene únicamente los pesos cuantizados en GGUF; la model card del cuantizador indica que se trata de un modelo de visión, y que los archivos mmproj (proyección multimodal) se encuentran en el repositorio estático de cuantizaciones. La licencia declarada es Apache-2.0, aunque el uso del modelo conlleva riesgos por su falta de alineación y su orientación a contenido peligroso o explícito.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base no documentado) |
| Parámetros totales | 8.953.803.264 (~8,95 B) |
| Parámetros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XXS, i1-IQ3_XS, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-IQ4_NL, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K |
| Idiomas soportados | en (según etiquetas del modelo base) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (con imatrix) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura del modelo base ReadyArt/Omega-Evolution-9B-v2.0. La model card del cuantizador no proporciona datos sobre el tipo de arquitectura (transformer, MoE, SSM, etc.), el número de tokens de entrenamiento, ni los métodos de alineación utilizados (RLHF, DPO, etc.). La cuantización fue realizada por mradermacher usando la técnica de imatrix, que calcula una matriz de importancia sobre un conjunto de datos de calibración para optimizar la asignación de bits en las cuantizaciones de baja precisión. El repositorio incluye un archivo `imatrix.gguf` que permite a los usuarios generar sus propias cuantizaciones personalizadas.

## Capacidades

- Generación de texto conversacional y roleplay, con soporte para diálogos multi-turno (según etiquetas del modelo base).
- Contenido sin alineación ni filtros de seguridad, orientado a roleplay explícito (ERP) y escenarios NSFW.
- Capacidad multimodal de visión: la model card indica que es un modelo de visión, aunque los archivos mmproj están en el repositorio estático.
- Conversación general: el modelo está etiquetado como "conversational", por lo que puede usarse en chatbots.
- Compatible con herramientas que consumen GGUF, como llama.cpp, Ollama, LM Studio, etc.
- No se han documentado capacidades de tool calling, agentes ni razonamiento multi-paso en la información disponible.

## Casos de uso

- Roleplay y escritura creativa: el modelo puede generar diálogos narrativos y descripciones para juegos de rol, novelas o guiones, gracias a su entrenamiento orientado a conversación y roleplay.
- Chatbots de ficción para proyectos personales: se puede desplegar localmente con llama.cpp u Ollama para crear asistentes de conversación con personalidades ficticias.
- Generación de historias interactivas: permite construir juegos de texto donde el modelo actúa como narrador o personaje no jugador.
- Pruebas de sistemas de moderación: por su naturaleza no alineada, puede usarse en entornos de investigación para evaluar sistemas de moderación de contenido o guardrails.
- Investigación sobre modelos sin alineamiento: su etiqueta "unaligned" y "dangerous" lo convierte en un candidato para estudios académicos sobre sesgos y riesgos de modelos de lenguaje sin filtros.
- Evaluación de cuantizaciones GGUF: al disponer de múltiples niveles de cuantización con imatrix, permite comparar el efecto de la precisión en la calidad de salida en un modelo de ~9B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre MMLU, HumanEval, GSM8K ni otras pruebas estándar para este modelo o su versión base.

## Requisitos de hardware

- La cuantización Q4_K_M (5,7 GB) es la recomendada por el cuantizador para un equilibrio entre tamaño y calidad; requiere unos 6-7 GB de VRAM para inferencia completa.
- La Q5_K_M (6,6 GB) y Q6_K (7,5 GB) ofrecen mayor calidad pero necesitan más memoria, apta para GPUs de 8 GB o más.
- La cuantizaciones más agresivas (IQ1_S, IQ2_XXS, etc.) caben en GPUs de 4 GB, aunque con pérdida notable de calidad.
- En CPU: llama.cpp puede ejecutar el modelo en sistemas sin GPU, con mayor latencia; para un modelo de 9B cuantizado a Q4_K_M se recomienda al menos 16 GB de RAM.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, vLLM (si se convierte a otro formato), text-generation-webui, etc.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (modelos no alineados de ~9B en formato GGUF). No se pueden realizar comparaciones fiables de rendimiento o parámetros sin datos adicionales.

## Limitaciones y advertencias

- El modelo está etiquetado como "no alineado" y "peligroso", por lo que puede generar contenido explícito, violento o ilegal sin restricciones.
- No se ha documentado la procedencia del modelo base, por lo que se desconocen los sesgos y el proceso de entrenamiento.
- Riesgo de alucinación: al no estar alineado, las respuestas pueden ser más propensas a inventar datos o a dar instrucciones erróneas.
- La licencia Apache-2.0 permite uso comercial, pero el contenido generado puede no ser legal en ciertos contextos; es responsabilidad del usuario cumplir con la normativa aplicable.
- El soporte de idiomas se limita al inglés; no se ha verificado su comportamiento en otros idiomas.
- Al ser un modelo de visión, la parte multimodal requiere los archivos de proyección (mmproj) que no están en este repositorio; su ausencia impide el uso de imágenes en esta versión.
- La cuantización de baja precisión (IQ1, IQ2) puede degradar seriamente la calidad de salida y la coherencia del texto.

## Enlaces

- Repositorio GGUF cuantizado: https://huggingface.co/mradermacher/Omega-Evolution-9B-v2.0-i1-GGUF
- Modelo base (sin cuantizar): https://huggingface.co/ReadyArt/Omega-Evolution-9B-v2.0
- Repositorio de cuantizaciones estáticas: https://huggingface.co/mradermacher/Omega-Evolution-9B-v2.0-GGUF
- Modelo base GGUF (no imatrix): https://huggingface.co/ReadyArt/Omega-Evolution-9B-v2.0-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
