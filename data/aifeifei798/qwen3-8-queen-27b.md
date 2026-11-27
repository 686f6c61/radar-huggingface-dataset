# aifeifei798/Qwen3.8-Queen-27B

## Resumen

Qwen3.8-Queen-27B es un ajuste fino (fine-tune) del modelo base Qwen/Qwen3.8-27B, publicado por el usuario aifeifei798 en Hugging Face. Se trata de una variante orientada a la escritura creativa, el roleplay de inmersión profunda, la ficción oscura y la interpretación de personajes complejos, con un alineamiento relajado que elimina las advertencias fuera de personaje (OOC) y las moralizaciones no solicitadas. El modelo conserva la arquitectura y el tamaño del base: 27.781.427.952 parámetros totales según los pesos en safetensors, empaquetados en un repositorio de 55,6 GB.

La propuesta del autor es un equilibrio entre "inteligencia y prosa": a diferencia de otros fine-tunes sin censura que sacrifican coherencia gramatical y capacidad de razonamiento a cambio de puntuaciones altas en contenido para adultos, Queen-27B pretende mantener la profundidad narrativa, el vocabulario y la lógica del modelo de 27B. El pipeline declarado es image-text-to-text, lo que sugiere que hereda capacidades multimodales del base, aunque la model card no detalla su funcionamiento.

El modelo es relevante ahora porque el ecosistema de fine-tunes para escritura creativa y roleplay ha crecido mucho, pero pocos mantienen a la vez estabilidad multi-turno, baja tasa de colapso y calidad literaria en la franja de 27B. Queen-27B se presenta con datos de una evaluación externa (Caliper Bench) que lo sitúan en el puesto 47 de 685 modelos en escritura creativa, con una tasa de colapso del 0,00 % en sesiones de 50 turnos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de Qwen3.8-27B; familia qwen3_5 según tags) |
| Parametros totales | 27.781.427.952 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF disponibles (i1-GGUF y GGUF de mradermacher); otros tipos no disponibles |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers); GGUF en repos derivados |

## Arquitectura y entrenamiento

El modelo es un fine-tune del Qwen/Qwen3.8-27B, por lo que hereda su arquitectura transformer y su tokenizador. Los tags de Hugging Face lo etiquetan como `qwen3_5` y el pipeline es `image-text-to-text`, lo que apunta a una arquitectura multimodal con entrada de imagen y texto, aunque la model card no describe la torre visual ni el mecanismo de fusión. El número de parámetros (27,78 mil millones) coincide con un modelo denso de esa franja.

No se han publicado detalles sobre el dataset de ajuste fino, el número de tokens utilizados, la composición de los datos ni si se emplearon técnicas de RLHF o DPO. La model card describe el resultado del alineamiento en términos cualitativos: eliminación de disclaimers, reducción de moralizaciones y mantenimiento de la coherencia del base. Tampoco se documentan innovaciones técnicas como decodificación especulativa o atención lineal. El autor menciona que el modelo se evaluó en modo "Thinking", lo que sugiere que conserva el modo de razonamiento extendido del base Qwen3.8.

## Capacidades

- Generación de texto narrativo de ficción: prosa literaria, diálogo dramático y descripción atmosférica.
- Roleplay de inmersión profunda con fidelidad de personaje sostenida en sesiones largas (hasta 50 turnos según la evaluación externa).
- Interpretación de personajes oscuros, villanos y arquetipos psicológicamente complejos sin rupturas de personaje.
- Escritura creativa sin rechazos: la evaluación reporta un 100 % de no rechazo en la categoría CW.
- Razonamiento y generación de código heredados del base Qwen3.8-27B, según afirma el autor ("Full 27B Logic Retention").
- Capacidad multimodal de entrada imagen-texto, declarada en el pipeline, aunque sin documentación de uso.
- Modo "Thinking" (razonamiento extendido) conservado del modelo base.
- Compatibilidad con endpoints (`endpoints_compatible` en los tags).
- Soporte para tarjetas de personaje y frontends tipo SillyTavern (tags `character-card`, `sillytavern`).
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Roleplay conversacional de larga duración: el modelo mantiene la voz y el ritmo literario durante sesiones de 50 turnos con una puntuación de stamina de 98,0–99,2 en la evaluación de Caliper, lo que lo hace adecuado para chats de personaje en SillyTavern u otros frontends.
- Escritura de ficción grimdark y terror psicológico: la puntuación de "darkness" de 0,99 y la ausencia de moralización permiten abordar temas maduros sin interrupciones, útil para autores de narrativa oscura.
- Creación de personajes para juegos de rol de mesa: el modelo puede encarnar PNJ con personalidad consistente y responder en personaje a lo largo de una campaña, gracias a la retención de contexto multi-turno.
- Generación de diálogo para videojuegos narrativos: se puede integrar en pipelines de guionizado para producir líneas de personaje con tono consistente y baja repetición (puntuación de repetición de 100,0 en ERP).
- Asistente de escritura para novelas por entregas: su coherencia de 99,0 en la métrica CW y su baja densidad de "slop" (27,8) lo hacen adecuado para borradores extensos con subtexto y vocabulario rico.
- Prototipado de agentes conversacionales con personalidad: al conservar el razonamiento del base y el soporte de tool calling heredado, puede usarse en demos de asistentes con carácter definido, aunque la model card no documenta explícitamente el function calling.
- Evaluación comparativa de fine-tunes: sirve como referencia en la franja 27B–30B para experimentos de alineamiento relajado, dado que cuenta con resultados publicados en Caliper Bench.

## Benchmarks y rendimiento

Los datos provienen de la evaluación externa Caliper Bench citada en la model card (suite de 50 turnos, modo Thinking). No se han publicado resultados de benchmarks académicos estándar (MMLU, HumanEval, GSM8K) en la información disponible.

| Metrica | Puntuacion | Posicion | Submetricas destacadas |
|---|---|---|---|
| Creative Writing (CW v3) | 78,9 / 100 | #47 de 685 global; #7 de 106 en 27B–30B | Craft 79,8; Coherencia 99,0; Breakdowns 100,0; Refusals 100,0; Slop 27,80 |
| Dark & Psychological RP (DRP) | 25,6 | #562 de 685 | Stamina 99,2; In-Character 87,2; Craft 83,6; Engagement 92,8; Darkness 0,99 |
| Standard Roleplay (RP) | 37,9 | #553 de 685 | Stamina 98,0; In-Character 93,1; Craft 85,7; Slop Floor 100,0 |
| Explicit RP (ERP) | 12,8 | #577 de 685 | Craft 86,4; In-Character 89,1; Originality 80,0; Repetition 100,0 |
| Session Health | Colapso 0,00 % | — | Willingness 0,20; Refusals (CW) 100,0; densidad de em-dash 0,73 |

## Requisitos de hardware

- VRAM estimada para inferencia: en FP16/BF16, los 27,78 mil millones de parámetros requieren aproximadamente 55–56 GB, lo que exige GPU de 80 GB o reparto entre varias GPU. En cuantización de 8 bits, unos 28–30 GB; en 4 bits, unos 15–17 GB.
- GPU recomendadas: A100 80 GB, H100 80 GB o H200 para precisión completa; A6000 48 GB o L40S 48 GB para 8 bits; RTX 4090 24 GB para cuantizaciones de 4–5 bits.
- ¿Cabe en GPU de consumo? Sí, en cuantizaciones GGUF de 4 bits (Q4_K_M o i1-Q4) en RTX 3090/4090 de 24 GB, y en configuraciones de 3 bits en GPU de 16 GB con holgura limitada.
- Opciones de despliegue: transformers (librería declarada), llama.cpp y Ollama mediante los GGUF de mradermacher, y servidores compatibles con endpoints. vLLM y TGI no están confirmados en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-Queen-27B | 27,78 B | no disponible | Fine-tune creativo/roleplay sin censura | Apache 2.0 | Hugging Face (safetensors y GGUF) |
| Qwen/Qwen3.8-27B (base) | 27,78 B | no disponible | Modelo generalista multimodal | no disponible | Hugging Face |
| Fine-tunes de roleplay de la franja 27B–30B | ~27–30 B | no disponible | Roleplay y escritura creativa | variable | Hugging Face |

La comparativa con alternativas concretas de la misma franja no está disponible en la información proporcionada; la model card solo indica que compite en el puesto 7 de 106 modelos del tramo 27B–30B en la métrica de escritura creativa de Caliper Bench.

## Limitaciones y advertencias

- Alineamiento relajado: el modelo está diseñado para eliminar rechazos y moralizaciones, por lo que puede generar contenido maduro, violento o sexual sin filtros. No es adecuado para aplicaciones dirigidas a menores ni para entornos sin moderación.
- Riesgo de contenido dañino: la ausencia de salvaguardas del base implica que el operador debe implementar sus propias capas de seguridad si despliega el modelo en producción.
- Sesgos: no se documentan sesgos específicos, pero al heredar los datos del base Qwen3.8-27B puede reproducir sesgos presentes en ellos.
- Alucinación: no se han publicado métricas de factualidad; el enfoque narrativo del fine-tune puede aumentar la propensión a inventar detalles en contextos no ficticios.
- Contexto e idiomas: la longitud de contexto y los idiomas soportados no están documentados en la información disponible.
- Licencia Apache 2.0: permite uso comercial, pero el operador asume la responsabilidad legal sobre el contenido generado y debe cumplir la licencia del modelo base.
- Rendimiento en roleplay estándar y explícito: las puntuaciones de Caliper en RP (37,9) y ERP (12,8) son bajas en la clasificación global (#553 y #577 de 685), aunque las submetricas de craft e in-character son altas. El modelo destaca en escritura creativa más que en roleplay puro.
- Datos de evaluación: los benchmarks provienen de una única plataforma externa (Caliper Bench) y no han sido replicados de forma independiente en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aifeifei798/Qwen3.8-Queen-27B
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- GGUF i1 de mradermacher: https://huggingface.co/mradermacher/Qwen3.8-Queen-27B-i1-GGUF
- GGUF de mradermacher: https://huggingface.co/mradermacher/Qwen3.8-Queen-27B-GGUF
- Caliper Bench (leaderboard): https://caliperbench.com
- Página del modelo en Caliper Bench: https://caliperbench.com/m/darkidol-qwen3.8-27b-v1.1-thinking/
