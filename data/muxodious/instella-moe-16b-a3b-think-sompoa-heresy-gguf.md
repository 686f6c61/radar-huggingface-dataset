# MuXodious/Instella-MoE-16B-A3B-Think-SOMPOA-heresy-GGUF

## Resumen

Instella-MoE-16B-A3B-Think-SOMPOA-heresy-GGUF es una distribución de cuantizaciones GGUF estáticas del fine-tune `MuXodious/Instella-MoE-16B-A3B-Think-SOMPOA-heresy`, un modelo derivado de Instella-MoE-16B-A3B-Think (AMD) sometido a un proceso de abliteración con la herramienta Heretic v2.2.0.dev0, con las técnicas Self-Organizing Maps (SOM) y Magnitude-Preserving Orthogonal Ablation (MPOA) activadas. El autor es MuXodious, un publicador independiente en Hugging Face, y el resultado es un modelo "descensurado" orientado a generación de texto conversacional en inglés.

El modelo base es un Mixture of Experts (MoE) de aproximadamente 15.860 millones de parámetros totales (15.862.789.248 según safetensors), con un esquema de activación A3B (unos 3.000 millones de parámetros activos por token, aunque el dato exacto de parámetros activos no está confirmado en la información disponible). El nombre "Think" sugiere un modo de razonamiento explícito, coherente con el prefijo de respuesta `<｜Assistant｜><think>\n</think>\n\n` documentado en la model card.

La relevancia de esta ficha es doble: por un lado, documenta un caso de abliteración medido con métricas de rechazo y divergencia KL; por otro, advierte de una restricción técnica crítica: estas cuantizaciones **no funcionan en llama.cpp upstream** y requieren forks específicos (DevQuasar o MuXodious) que implementen el soporte para la arquitectura Instella-MoE. La licencia es propietaria de tipo "researchrail", lo que limita el uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) transformer, base Instella-MoE de AMD; soporte en forks de llama.cpp |
| Parámetros totales | 15.862.789.248 (~15,86 B) |
| Parámetros activos | no disponible (esquema A3B, ~3 B por token según nomenclatura) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GGUF estáticas (niveles concretos no detallados en la información disponible) |
| Idiomas soportados | inglés (en) |
| Licencia | researchrail (license_name: researchrail, license: other) |
| Formato de pesos | GGUF (repo de 73,3 GB); modelo base en transformers/safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune por abliteración del Instella-MoE-16B-A3B-Think de AMD, un transformer con arquitectura Mixture of Experts. El proceso de abliteración se realizó con Heretic v2.2.0.dev0, una herramienta que identifica y ablaciona direcciones en el espacio de activaciones asociadas a comportamientos de rechazo. En esta ejecución se habilitaron Self-Organizing Maps (SOM) y Magnitude-Preserving Orthogonal Ablation (MPOA), una combinación que busca preservar la magnitud de las activaciones mientras elimina la dirección de rechazo.

El autor documenta que el hardware influye significativamente en el resultado del proceso: inicialmente procesó el modelo en dos GPU locales y luego replicó la evaluación en una H100 de alquiler, obteniendo resultados distintos en PiQA. Se seleccionó la configuración T756 (1 rechazo de 101, divergencia KL de 0,1280) por su consistencia entre ambos entornos, aunque T718 y T648 también se consideraron candidatos. Los parámetros de ablación incluyen pesos por capa en `attn.o_proj` (posiciones 0 a 4, con valores entre 0,04 y 1,57) y en `mlp.down_proj` (valores entre 0,00 y 1,58), con `direction_index` de 18,88. No se dispone de información sobre el volumen de tokens de entrenamiento del modelo base ni sobre la composición del dataset de abliteración (descrito solo como "custom datasets harmful+harmless").

## Capacidades

- Generación de texto conversacional en inglés con modo de razonamiento explícito (prefijo `<think>`).
- Razonamiento multi-paso mediante el bloque de pensamiento previo a la respuesta.
- Comportamiento descensurado: reduce drásticamente los rechazos (de 101/101 a 1/101 en el conjunto de prueba del autor).
- Soporte de conversaciones multi-turno (pipeline `text-generation`, tag `conversational`).
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- Capacidades de código, matemáticas o tool calling: no documentadas en la información disponible.

## Casos de uso

- Investigación sobre abliteración: el modelo sirve como caso de estudio reproducible para medir el impacto de SOM+MPOA en la tasa de rechazos y la divergencia KL, comparando T756 frente al modelo original.
- Evaluación de robustez de salvaguardas: permite analizar cómo se degradan los filtros de seguridad tras una ablación selectiva y qué artefactos aparecen en la generación.
- Generación creativa sin restricciones: escritura de ficción, guiones o narrativa que requiera contenido sensible, en entornos de investigación controlados.
- Experimentación con arquitecturas MoE en hardware de consumo: al ser un MoE de ~16 B con ~3 B activos, permite probar inferencia eficiente en GPU consumer (3090, 5060 Ti) usando los forks de llama.cpp.
- Benchmarking de cuantizaciones GGUF: útil para comparar la degradación de calidad entre niveles de cuantización en un MoE abliterado.
- Docencia y divulgación técnica: ejemplo práctico de pipeline Heretic, medición de KL y despliegue de GGUF no estándar.

## Benchmarks y rendimiento

Resultados de PiQA publicados por el autor (setup local 3090 + 5060 Ti y H100):

| Modelo | acc | acc_stderr | acc_norm | acc_norm_stderr |
|---|---|---|---|---|
| Original | 0,7263 | 0,0104 | 0,7361 | 0,0103 |
| T718 | 0,7312 | 0,0103 | 0,7372 | 0,0103 |
| T756 | 0,7291 | 0,0104 | 0,7372 | 0,0103 |
| T681 | 0,7231 | 0,0104 | 0,7361 | 0,0103 |

Métricas de abliteración del T756: rechazos 1/101 (frente a 101/101 iniciales), divergencia KL 0,1280. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión; el repo GGUF ocupa 73,3 GB, por lo que las cuantizaciones de mayor calidad requieren >24 GB y las más agresivas podrían caber en 12-16 GB.
- GPU recomendadas: H100 (usada por el autor para reevaluar), RTX 3090 y RTX 5060 Ti (setup local documentado).
- Consumer GPU: sí, en 3090 (24 GB) y 5060 Ti (16 GB) según el autor, con cuantizaciones adecuadas.
- Despliegue: **no funciona en llama.cpp upstream**; requiere el fork de DevQuasar (`csabakecskemeti/llama.cpp`, rama `instella-moe`) o el fork de MuXodious (`MuXodious/llama.cpp`, rama `instella-moe`). Soporte en vLLM, TGI u Ollama: no disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Instella-MoE-16B-A3B-Think-SOMPOA-heresy-GGUF | ~15,86 B (MoE, A3B) | no disponible | researchrail | GGUF, fork llama.cpp |
| Instella-MoE-16B-A3B-Think (AMD, original) | ~16 B (MoE) | no disponible | no disponible | transformers |
| Instella-MoE-16B-A3B-Think-SOMPOA-heresy (base del GGUF) | ~15,86 B (MoE) | no disponible | researchrail | safetensors |

No se dispone de información sobre otros modelos comparables de la misma categoría en la documentación proporcionada.

## Limitaciones y advertencias

- **Compatibilidad rota con llama.cpp upstream**: requiere forks específicos; el autor advierte de posibles artefactos de generación si se fuerza el GGUF en upstream.
- **Licencia restrictiva**: "researchrail" limita el uso comercial; revisar el archivo LICENSE antes de cualquier despliegue productivo.
- **Solo inglés**: no se documenta soporte multilingüe.
- **Sesgos y contenido**: al ser un modelo abliterado, puede generar contenido sensible, ofensivo o inseguro sin filtros; no apto para aplicaciones públicas sin moderación adicional.
- **Riesgo de alucinación**: no cuantificado; el proceso de abliteración puede degradar la coherencia en dominios factuales.
- **Reproducibilidad**: el propio autor señala que el hardware influye en los resultados de abliteración y que las métricas varían entre entornos.
- **Datos incompletos**: contexto, parámetros activos exactos, dataset de entrenamiento y benchmarks estándar no están disponibles.
- **Madurez**: 0 descargas y 0 likes en el momento de la ficha; proyecto de nicho sin validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/MuXodious/Instella-MoE-16B-A3B-Think-SOMPOA-heresy-GGUF
- Modelo base: https://huggingface.co/MuXodious/Instella-MoE-16B-A3B-Think-SOMPOA-heresy
- Heretic (herramienta de abliteración): https://github.com/p-e-w/heretic
- PR de SOM+MPOA: https://github.com/p-e-w/heretic/pull/196
- Fork de llama.cpp de DevQuasar: https://github.com/csabakecskemeti/llama.cpp/tree/instella-moe
- Fork de llama.cpp de MuXodious: https://github.com/MuXodious/llama.cpp/tree/instella-moe
- Perfil de DevQuasar: https://huggingface.co/DevQuasar
- Paper referenciado (arxiv:2609.00791): no disponible en la información proporcionada
