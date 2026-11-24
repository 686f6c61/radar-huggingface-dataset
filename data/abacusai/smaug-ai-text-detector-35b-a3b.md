# abacusai/Smaug-AI-Text-Detector-35B-A3B

## Resumen

Smaug-AI-Text-Detector-35B-A3B es un modelo de detección de texto generado por IA desarrollado por Abacus.AI, publicado como pesos abiertos bajo licencia Apache 2.0. Se trata de un fine-tuning del modelo base Qwen/Qwen3.6-35B-A3B, con 34.152.088.210 parámetros totales según los pesos en safetensors (el sufijo A3B del nombre sugiere una arquitectura de mezcla de expertos con aproximadamente 3.000 millones de parámetros activos, aunque la model card no detalla esta cifra de forma explícita). La tarea declarada es `token-classification`: el modelo etiqueta cada frase de un texto como humana, generada por IA o asistida por IA (escrita por una persona y luego editada por una IA), y además emite una etiqueta global para el conjunto del texto.

El modelo resuelve un problema candente en 2026: distinguir contenido humano de contenido sintético con tasas de error muy bajas, incluyendo textos adversariales con erratas y trucos de caracteres. Según la model card, reduce los falsos positivos sobre textos humanos a niveles próximos a cero en corpus como FineWeb (0,004 %), PERSUADE (0,000 %) o ELLIPSE (0,00 %), y mantiene falsos negativos de en torno al 0,01 % en MELD-eval incluso bajo seis tipos de ataque.

Es relevante ahora porque combina granularidad a nivel de frase con una decisión global calibrada (humano si ≥90 % del texto es humano, IA si ≥80 % es generado, mixto en el resto), lo que lo hace útil para auditoría editorial, revisión académica y moderación de contenido. Abacus.AI ofrece además una variante más pequeña y rápida, Smaug-AI-Text-Detector-E4B.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer derivado de Qwen3.6-35B-A3B (MoE, según nomenclatura del modelo base); detalles no disponibles |
| Parámetros totales | 34.152.088.210 |
| Parámetros activos | no disponible (el sufijo A3B sugiere ~3B activos, sin confirmación en la model card) |
| Longitud de contexto | Lee los primeros 12.000 tokens del texto de entrada |
| Tipos de cuantización | no disponible |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 68,3 GB) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning supervisado del checkpoint Qwen/Qwen3.6-35B-A3B, un transformer de gran tamaño con nomenclatura de mezcla de expertos. La model card no especifica la composición del dataset de entrenamiento, el número de tokens utilizados, ni si se aplicaron etapas de RLHF o DPO; tampoco detalla innovaciones de decodificación o atención más allá de la dependencia declarada de `flash-linear-attention` en los requisitos de instalación, lo que apunta al uso de capas de atención lineal en la arquitectura base.

La innovación principal es la formulación de la tarea: en lugar de una clasificación binaria a nivel de documento, el modelo produce segmentos con offsets de caracteres (`start`, `end`), etiqueta y confianza por frase, más una distribución de proporciones (`human`, `ai_assisted`, `ai_generated`). El pipeline `token-classification` y el uso de `trust_remote_code=True` indican código personalizado para el método `analyze()`, que aplica una limpieza ligera del texto (normalización de saltos de línea, espacios repetidos, comillas tipográficas y guiones largos) antes de la inferencia.

## Capacidades

- Detección de texto generado por IA a nivel de frase, con etiquetas `human`, `ai_assisted` y `ai_generated`.
- Etiqueta global del documento mediante reglas calibradas: `Human` si ≥90 % del texto es humano, `AI` si ≥80 % es generado, `Mixed` en el resto.
- Salida estructurada con segmentos (`start`, `end`, `label`, `confidence`) y proporciones agregadas (`share`).
- Robustez frente a ataques adversariales de texto: erratas y trucos de caracteres (evaluado en MELD-eval con seis ataques).
- Detección de texto "pulido" por IA a partir de borradores humanos (AI-assisted), evaluado en Saha Peer Review en variantes easy y hard.
- Capacidad de identificar imitaciones de estilo de autores reales (Epoch AI Style Imitation).
- Soporte de tool calling, function calling, agentes o razonamiento multi-paso: no disponible; el modelo está especializado en clasificación, no en generación.
- Capacidades multilingües: limitadas al inglés según la model card.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Auditoría editorial de manuscritos y artículos: el modelo devuelve segmentos por frase, lo que permite señalar exactamente qué párrafos de un envío tienen alta probabilidad de ser generados por IA y adjuntar la confianza por tramo al informe del editor.
- Revisión por pares y detección de peer reviews sintéticas: los benchmarks Saha Peer Review (FNR de 0,0 % en varias variantes) lo hacen adecuado para triar revisiones sospechosas antes de la evaluación humana, con la salvedad de que la decisión final debe ser humana.
- Moderación de contenido en plataformas: integrado como paso previo a la publicación, permite marcar textos mixtos (por ejemplo, un artículo humano con secciones generadas) en lugar de aplicar una etiqueta binaria que generaría falsos positivos.
- Detección de ensayos académicos y trabajos de estudiantes: con FPR de 0,000 % en PERSUADE y 0,00 % en ELLIPSE, es viable usarlo como señal de alerta en entornos educativos, siempre con revisión humana dado el riesgo de sesgo contra no nativos (PELIC muestra 0,08 % de FPR, superior al 0,01 % de Pangram).
- Verificación de contenido en medios y agencias: para comprobar si un texto recibido de un colaborador o de un feed externo contiene pasajes generados, usando los offsets de caracteres para localizar los tramos sospechosos en el documento original.
- Análisis forense de corpus y datasets: al procesar lotes de documentos (por ejemplo, FineWeb o corpus web), el modelo permite etiquetar a escala de frase y construir estadísticas de prevalencia de contenido sintético por fuente o periodo.
- Detección de imitación de estilo: útil en entornos donde se sospecha que un texto suplanta la voz de un autor concreto (evaluado en Epoch AI Style Imitation con FNR de 1,18 %).

## Benchmarks y rendimiento

Todas las cifras son porcentajes y, en el caso de las tasas de error, menor es mejor. La comparación es con Pangram 4 / 4.1 según los datos de la model card.

Tasa de falsos positivos (FPR): texto humano etiquetado erróneamente como IA.

| Benchmark | Textos | Smaug-35B-A3B | Pangram 4/4.1 |
|---|---:|---:|---:|
| FineWeb (web, 2015-2021) | 132.617 | 0,004 | 0,009 |
| PERSUADE (ensayos de estudiantes) | 25.994 | 0,000 | 0,00 |
| PELIC (ensayos de aprendices de inglés) | 15.000 | 0,08 | 0,01 |
| ELLIPSE (ensayos escolares de aprendices) | 3.909 | 0,00 | 0,00 |
| Liang et al., TOEFL (no nativos) | 91 | 0,00 | 0,00 |
| UChicago (Jabarian e Imas) | 1.992 | 0,00 | 0,00 |
| Epoch AI Style Imitation (prosa humana experta) | 495 | 0,00 | 0,00 |
| Saha Peer Review (revisiones humanas) | 468 | 0,0 | 0,0 |
| Saha Peer Review easy (revisiones pulidas por IA) | 915 | 1,4 | 1,4 |
| Saha Peer Review hard (revisiones pulidas por IA) | 1.887 | 5,9 | 2,5 |

Tasa de falsos negativos (FNR): texto de IA etiquetado erróneamente como humano.

| Benchmark | Textos | Smaug-35B-A3B | Pangram 4/4.1 |
|---|---:|---:|---:|
| MELD-eval, sin ataque | 31.448 | 0,01 | 0,00 |
| MELD-eval, seis ataques | 188.688 | 0,01 | 0,01 |
| Sem-Detect (peer reviews de IA) | 6.744 | 0,00 | 4,5 |
| UChicago (texto de IA) | 7.968 | 0,15 | 0,00 |
| GEDE (ensayos de IA) | 190 | 0,00 | 0,0 |
| Epoch AI Style Imitation (IA que imita autores) | 594 | 1,18 | 2,86 |
| VUB (papers académicos de IA) | 39 | 0,0 | 0,0 |
| Saha Peer Review easy, prompt básico | 274 | 0,0 | 1,8 |
| Saha Peer Review easy, prompt experto | 274 | 0,0 | 0,0 |
| Saha Peer Review easy, puntos clave humanos | 936 | 0,0 | 3,7 |
| Saha Peer Review hard, prompt básico | 750 | 0,0 | 0,0 |
| Saha Peer Review hard, prompt experto | 600 | 0,0 | 0,0 |
| Saha Peer Review hard, puntos clave humanos | 2.000 | 0,0 | 1,1 |

Notas de la model card: en MELD-eval y Sem-Detect la FNR se mide a 1 % de FPR (0,1 % en Sem-Detect); en los benchmarks Saha y VUB se aplica la misma regla de conteo que el informe de Pangram 4; el dato de FineWeb de Pangram corresponde a su propia muestra.

## Requisitos de hardware

- VRAM estimada para inferencia: el repo de pesos ocupa 68,3 GB en safetensors, lo que exige aproximadamente 70 GB de VRAM en precisión completa (bf16/fp16) solo para los pesos, más overhead de activaciones y caché KV.
- GPU recomendadas: H100 80 GB, A100 80 GB o H200 para inferencia en precisión completa. En configuraciones multi-GPU, dos A100 40 GB o dos RTX 6000 Ada podrían alojar los pesos con tensor parallelism.
- GPU de consumo: no cabe en GPUs de consumo de 24 GB (RTX 4090) sin cuantización agresiva; la cuantización no está documentada en la model card, por lo que no se puede confirmar viabilidad en consumer.
- Opciones de despliegue: `transformers >= 5.22` con `trust_remote_code=True`, más `torch`, `numpy` y `flash-linear-attention`. No se documenta soporte explícito para vLLM, llama.cpp, Ollama o TGI; la integración con vLLM requeriría validar el código personalizado del método `analyze()`.
- Latencia y throughput: no disponibles. La lectura se limita a los primeros 12.000 tokens del texto, lo que acota el coste por documento.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Idiomas | Enfoque |
|---|---|---|---|---|---|
| Smaug-AI-Text-Detector-35B-A3B | 34,15 B (MoE, ~3B activos según nombre) | 12.000 tokens leídos | Apache 2.0 | en | Detección a nivel de frase + veredicto global |
| Smaug-AI-Text-Detector-E4B | no disponible | no disponible | no disponible | en | Variante más pequeña y rápida del mismo detector |
| Pangram 4 / 4.1 | no disponible (propietario) | no disponible | propietario | no disponible | Detección de texto IA; referencia en los benchmarks de la model card |
| Qwen/Qwen3.6-35B-A3B (base) | ~35B (MoE) | no disponible | no disponible | multilingüe | Modelo generativo de propósito general; no es un detector |

La comparación cuantitativa con Pangram 4/4.1 está recogida en la sección de benchmarks. No se dispone de datos de otros detectores abiertos en la información proporcionada.

## Limitaciones y advertencias

- El modelo solo soporta inglés; su uso sobre textos en castellano u otros idiomas no está validado y los resultados serían poco fiables.
- Textos de menos de 50 palabras producen etiquetas poco fiables; la propia API marca `result["short"] = true` en esos casos.
- Solo se procesan los primeros 12.000 tokens: el contenido posterior no influye en el veredicto, lo que puede sesgar la clasificación de documentos largos.
- FPR elevado en ensayos de aprendices de inglés (PELIC: 0,08 % frente a 0,01 % de Pangram), lo que implica un riesgo desproporcionado de falsos positivos contra no nativos.
- FNR de 5,9 % en Saha Peer Review hard (revisiones humanas pulidas por IA), superior al 2,5 % de Pangram: los textos asistidos por IA en dominios expertos son el punto débil del modelo.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí de calibración: la confianza por segmento no debe interpretarse como prueba definitiva en contextos disciplinarios o legales.
- Sesgos conocidos: no documentados explícitamente en la model card; la asimetría en PELIC sugiere sensibilidad al registro no nativo.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3.6-35B-A3B debe verificarse por separado para confirmar compatibilidad.
- El uso de `trust_remote_code=True` implica ejecutar código del autor; conviene auditar el repositorio antes de desplegarlo en producción.
- El modelo no es un generador: no debe esperarse tool calling, razonamiento multi-paso ni generación de texto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/abacusai/Smaug-AI-Text-Detector-35B-A3B
- Variante pequeña: https://huggingface.co/abacusai/Smaug-AI-Text-Detector-E4B
- Blog técnico: https://blog.abacus.ai/blog/2026/11/24/smaug-ai-text-detector
- Página de Abacus.AI: https://abacus.ai
- Organización en Hugging Face: https://huggingface.co/abacusai
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Referencia Pangram 4.1: https://www.pangram.com/research/model-card/pangram-4-1
- Pangram, ensayos de estudiantes: https://www.pangram.com/blog/pangram-performance-diverse-student-essays
- Paper arXiv citado (2607.27183): https://arxiv.org/abs/2607.27183
