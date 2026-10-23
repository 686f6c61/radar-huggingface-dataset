# praiselab-picuslab/benchmark-slm-fiven-phi-1_5-ft

## Resumen

`praiselab-picuslab/benchmark-slm-fiven-phi-1_5-ft` es un adaptador LoRA (PEFT) construido sobre el modelo base `microsoft/phi-1_5`, un transformer decoder de 1.300 millones de parámetros desarrollado por Microsoft Research. El adaptador ha sido entrenado por el usuario `praiselab-picuslab` dentro de una campaña de evaluación de modelos de lenguaje pequeños (SLM) identificada en los tags como `benchmark-slm`, con estrategia de ajuste fino completo del adaptador (`strategy-ft`) y un dataset denominado `fiven`.

El propósito declarado del repositorio no es ofrecer un modelo de propósito general, sino servir como artefacto de comparación dentro de un benchmark interno de SLM. El tag `or2` y la estructura de nombres (`benchmark-slm-<dataset>-<modelo>-<estrategia>`) sugieren una batería sistemática de experimentos donde se cruzan datasets y modelos base bajo una misma metodología.

Es relevante para quien evalúe modelos pequeños porque documenta un punto de referencia reproducible sobre Phi-1.5 ajustado en italiano (`it`), un caso poco frecuente: la mayoría de adaptadores públicos sobre Phi-1.5 se centran en inglés o en código. No obstante, el repositorio no publica métricas, no declara licencia y está restringido (gated), lo que limita su uso directo en producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (modelo base Phi-1.5 de Microsoft Research); el repositorio contiene un adaptador LoRA, no pesos completos |
| Parametros totales | 1.300 millones en el modelo base; el adaptador LoRA tiene un tamaño no disponible (repo de 0,0 GB, pesos solo del adaptador) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 2.048 tokens (heredada del modelo base) |
| Tipos de cuantizacion | no disponible en el repositorio; el modelo base admite cuantización estándar (GGUF, bitsandbytes int8/int4) mediante herramientas externas |
| Idiomas soportados | italiano (`it`) según la tarjeta del repositorio; el modelo base está entrenado predominantemente en inglés |
| Licencia | no disponible (el modelo base `microsoft/phi-1_5` se publica bajo licencia MIT) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Phi-1.5, un transformer decoder de 1.300 millones de parámetros con atención causal estándar y una ventana de contexto de 2.048 tokens. Según la documentación pública de Microsoft Research, el modelo base se entrenó sobre aproximadamente 150.000 millones de tokens combinando datos web filtrados por calidad educativa y datos sintéticos generados por modelos mayores, con un enfoque explícito en razonamiento básico y generación de código. No se ha publicado información sobre si el modelo base incorporó RLHF o DPO.

En cuanto al adaptador, la información disponible se limita a los metadatos de HuggingFace: técnica LoRA (librería `peft`), estrategia de ajuste fino (`strategy-ft`), dataset `fiven` y etiqueta de idioma italiano. No se especifican el rango (`r`), el `alpha`, los módulos objetivo, el número de tokens de entrenamiento, la composición del dataset ni la existencia de fases de alineación posteriores. Tampoco se documenta ninguna innovación técnica adicional (decodificación especulativa, atención lineal, mezcla de expertos) más allá de las capacidades nativas del modelo base.

## Capacidades

- Generación de texto autoregresiva en italiano tras el ajuste fino, con herencia del conocimiento en inglés del modelo base.
- Razonamiento básico de sentido común y matemáticas elementales, capacidades destacadas en el entrenamiento original de Phi-1.5.
- Generación de código en Python, la fortaleza principal del modelo base Phi-1.5.
- Respuestas a instrucciones (`text-generation`, tag `it`), presumiblemente mediante el formato de prompt de instrucciones empleado en el dataset `fiven`.
- Soporte de tool calling / function calling: no disponible de forma nativa.
- Soporte de agentes y razonamiento multi-paso: no disponible; el modelo base no incorpora modo de pensamiento ni planificación estructurada.
- Capacidades multimodales (visión, audio): no disponibles.
- Capacidades multilingües: limitadas al italiano del ajuste y al inglés del modelo base; no hay evidencia de cobertura de otras lenguas.
- Capacidad especial: ninguna documentada (sin thinking mode, sin ventana extendida, sin herramientas integradas).

## Casos de uso

- Evaluación comparativa de SLM en italiano: el adaptador sirve como punto de control dentro de la batería `benchmark-slm` para medir el efecto del ajuste fino sobre Phi-1.5 en un corpus concreto, comparándolo con otros pares modelo-dataset de la misma serie.
- Reproducción de experimentos académicos: investigadores que quieran replicar la metodología `strategy-ft` sobre Phi-1.5 pueden descargar el adaptador (previa aceptación de condiciones) y contrastar sus resultados con los del repositorio.
- Generación de texto asistida en italiano con recursos mínimos: al ser un adaptador sobre un modelo de 1,3B, puede ejecutarse en una GPU de consumo de 8 GB en FP16 y en CPU con cuantización, útil para prototipos de generación de texto en entornos sin infraestructura dedicada.
- Ajuste fino incremental: al tratarse de un adaptador LoRA, puede fusionarse o combinarse con otros adaptadores sobre el mismo base para experimentar con composición de adaptadores en investigación.
- Enseñanza de técnicas PEFT: el repositorio ejemplifica el flujo completo de publicación de un adaptador en HuggingFace con la librería `peft`, útil como material didáctico sobre ajuste eficiente de parámetros.
- Filtrado y anotación de texto en italiano a pequeña escala: para tareas de clasificación o reformulación simple donde no se requiera alta fiabilidad y se acepte revisión humana posterior, con la ventaja de un coste de inferencia muy bajo.
- Base para experimentos de destilación o evaluación de olvido catastrófico: permite estudiar cuánto conocimiento en inglés y código conserva Phi-1.5 tras un ajuste fino en italiano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La tarjeta del repositorio no incluye métricas de MMLU, HumanEval, GSM8K ni de ninguna otra evaluación, y los resultados de búsqueda web obtenidos no contienen información técnica relevante sobre este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia (modelo base 1,3B más adaptador LoRA): aproximadamente 2,6–3,0 GB en FP16, 1,5 GB en int8 y 0,8–1,0 GB en 4 bits. Cálculos estimados a partir del número de parámetros del modelo base; el repositorio no publica mediciones.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para FP16 (RTX 3050, RTX 4060, T4). Para servir en producción con lotes grandes, A10G, L4, A100 o H100 están sobredimensionadas pero permiten paralelismo y alto throughput.
- Compatibilidad con GPU de consumo: sí. Cabe en RTX 3060, RTX 4060, RTX 4090 y en iGPU con memoria unificada suficiente, así como en CPU mediante cuantización GGUF.
- Opciones de despliegue: `transformers` + `peft` (carga del adaptador sobre el base), `llama.cpp`/Ollama tras fusionar el adaptador y convertir a GGUF, vLLM o TGI tras fusionar los pesos con `merge_and_unload()`.
- Latencia y throughput estimados: no disponibles. Como referencia del orden de magnitud, un modelo de 1,3B en FP16 sobre una RTX 4090 suele generar decenas a centenares de tokens por segundo, pero no hay mediciones publicadas para este adaptador concreto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Este adaptador (sobre Phi-1.5) | 1,3B (adaptador LoRA) | 2.048 | no disponible | Gated en HuggingFace | Ajuste en italiano, sin benchmarks publicados |
| microsoft/phi-1_5 | 1,3B | 2.048 | MIT | Abierto | Modelo base; entrenado en datos tipo libro de texto y código |
| Qwen2.5-1.5B | 1,54B | 32.768 | Apache 2.0 | Abierto | Multilingüe amplio, contexto muy superior |
| SmolLM2-1.7B | 1,7B | 8.192 | Apache 2.0 | Abierto | Entrenado en 11 billones de tokens, con versiones instruct |
| TinyLlama-1.1B | 1,1B | 2.048 | Apache 2.0 | Abierto | Entrenado en 3 billones de tokens, enfocado a inglés |

La comparación en rendimiento no es posible: no hay métricas publicadas de este adaptador. Frente a las alternativas, la desventaja principal es la ausencia de licencia declarada y el acceso restringido, además de una ventana de contexto cuatro veces menor que la de Qwen2.5-1.5B.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en el repositorio. El modelo base Phi-1.5 se entrenó con datos web filtrados y sintéticos, por lo que puede reproducir sesgos presentes en ellos; el ajuste fino en un dataset no especificado (`fiven`) puede introducir sesgos adicionales no auditados.
- Riesgo de alucinación: elevado para un modelo de 1,3B entrenado con énfasis en datos sintéticos; no se han publicado evaluaciones de fidelidad factual.
- Limitaciones de contexto: 2.048 tokens, insuficiente para documentos largos, conversaciones multi-turno extensas o bases de código medianas.
- Limitaciones de idioma: cobertura efectiva limitada a italiano (ajuste) e inglés (base); no hay evidencia de calidad en castellano ni en otras lenguas.
- Restricciones de licencia: la licencia del adaptador es "no disponible", lo que impide determinar si el uso comercial está permitido. Aunque el modelo base es MIT, la ausencia de licencia en el repositorio derivado es un bloqueo para producción.
- Acceso restringido: el repositorio es gated y requiere aceptar condiciones en HuggingFace y, presumiblemente, aprobación del autor; no es un artefacto desplegable de forma inmediata.
- Repositorio sin mantenimiento aparente: 0 descargas, 0 likes, sin métricas ni documentación de entrenamiento; no hay garantía de soporte ni de trazabilidad del dataset.
- Sin garantías de calidad: al ser un artefacto de benchmark interno, no se ha validado su comportamiento en tareas reales.
- Caveat de producción: el adaptador debe fusionarse con el modelo base para servir con vLLM, TGI o llama.cpp; la carga en dos etapas con `peft` añade latencia de arranque y complejidad operativa.

## Enlaces

- HuggingFace: https://huggingface.co/praiselab-picuslab/benchmark-slm-fiven-phi-1_5-ft
- Modelo base: https://huggingface.co/microsoft/phi-1_5
- Librería PEFT: https://github.com/huggingface/peft
- No se han encontrado papers, blogs, repositorios de código ni demos asociados a este adaptador en la búsqueda web realizada; los resultados obtenidos no contenían información técnica relevante.
