# hirundo-io/Qwen3.6-35B-A3B-Westernized

## Resumen

Hirundo Qwen3.6-35B-A3B Westernized es un checkpoint completo fusionado (merged) derivado de Qwen/Qwen3.6-35B-A3B, publicado por hirundo-io. Se trata de un modelo de arquitectura Mixture of Experts (MoE) con 35.951.822.704 parámetros totales, orientado a tareas multimodales de imagen-texto (pipeline `image-text-to-text`) y conversacionales. El repositorio ocupa 71,9 GB en formato safetensors y se distribuye bajo licencia Apache 2.0, conservando la atribución del modelo base.

Su rasgo diferencial no es arquitectónico sino conductual: se ha producido mediante una técnica de *behavioral unlearning* (desaprendizaje conductual) que, según el autor, reduce la censura y el sesgo geopolítico del modelo base preservando el resto de capacidades. El checkpoint se publica ya fusionado, de modo que puede cargarse directamente sin necesidad de un adaptador LoRA/PEFT separado (aunque el adaptador original está disponible en un repositorio aparte).

Es relevante ahora porque aborda un problema práctico para desarrolladores que despliegan modelos de origen chino en entornos occidentales: la alineación ideológica del modelo base puede producir respuestas no deseadas en dominios sensibles. El autor reporta reducciones drásticas en métricas de censura y rechazo (de 89,8% a 2,8% en CCPC-500; de 65,3% a 3,2% en DECCP) con una degradación mínima en benchmarks de capacidad (entre −0,13 y −1,83 puntos porcentuales).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE), tag `qwen3_5_moe`; transformer multimodal imagen-texto |
| Parametros totales | 35.951.822.704 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el autor no detalla cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del base Qwen/Qwen3.6-35B-A3B, etiquetada como `qwen3_5_moe`: un transformer con capas de mezcla de expertos y capacidad multimodal de entrada imagen-texto, cargable mediante `AutoModelForImageTextToText`. El repositorio no detalla el número de parámetros activos por token, el número de expertos, la longitud de contexto nativa ni la composición del corpus de entrenamiento original.

La innovación técnica es el procedimiento de *behavioral unlearning* aplicado por Hirundo sobre el modelo base, que da lugar a un checkpoint fusionado autónomo. El autor no especifica en la información disponible el volumen de datos usado en el desaprendizaje, la composición de ese dataset ni si se emplearon técnicas de RLHF o DPO; remite a su blog para la metodología completa. Las evaluaciones publicadas corresponden a modo Thinking-OFF, es decir, sin cadena de razonamiento explícita.

## Capacidades

- Generación de texto conversacional multi-turno, según el tag `conversational`.
- Procesamiento multimodal de imagen y texto (`image-text-to-text`): acepta entradas visuales junto a instrucciones textuales.
- Razonamiento y conocimiento experto: puntuaciones altas en GPQA (79,29%) y MMLU-Pro (84,13%) en modo Thinking-OFF.
- Generación de código: LiveCodeBench de 54,56% en modo Thinking-OFF.
- Seguimiento de instrucciones: IFBench de 33,21% en modo Thinking-OFF.
- Comportamiento desalineado de censura y sesgo geopolítico reducido respecto al base, según las métricas del autor.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking: las evaluaciones publicadas son Thinking-OFF; no se detalla el comportamiento en modo Thinking-ON.

## Casos de uso

- Asistentes conversacionales en producción para mercados occidentales: el modelo reduce drásticamente los rechazos innecesarios (DECCP de 65,3% a 3,2%), lo que se traduce en menos respuestas evasivas en conversaciones legítimas sobre temas sensibles.
- Análisis de documentos con componente visual: al aceptar entrada imagen-texto, puede procesar capturas, gráficos o formularios escaneados junto a preguntas textuales en un mismo flujo.
- Moderación y análisis de contenido geopolítico: útil en redacciones o plataformas que necesitan discutir temas internacionales sin la deriva ideológica del modelo base (ChinaBench de 96,7% a 6,7% de no cumplimiento).
- Generación de código asistida en entornos de desarrollo: con LiveCodeBench de 54,56% y licencia Apache 2.0, puede integrarse en herramientas internas de autocompletado o revisión sin restricciones comerciales de licencia.
- Resolución de preguntas técnicas de dominio científico: GPQA de 79,29% lo sitúa como opción para asistentes de investigación que requieren razonamiento experto en física, química y biología.
- Evaluación comparativa de alineación: sirve como referencia para equipos de seguridad que investigan técnicas de desaprendizaje conductual, comparando sus métricas de daño (XSTest, OR-Bench) con las del base.
- Despliegue self-hosted sin adaptadores: al ser un checkpoint fusionado, simplifica pipelines de inferencia que no quieren gestionar LoRA/PEFT por separado.

## Benchmarks y rendimiento

Resultados publicados por el autor, modo Thinking-OFF:

| Benchmark | Modelo base | Hirundo Westernized | Cambio (pp) |
|---|---:|---:|---:|
| GPQA | 79,42% | 79,29% | −0,13 |
| IFBench | 33,75% | 33,21% | −0,54 |
| LiveCodeBench | 56,39% | 54,56% | −1,83 |
| MMLU-Pro | 84,49% | 84,13% | −0,36 |

Métricas de comportamiento (menor es mejor):

| Métrica | Modelo base | Hirundo Westernized |
|---|---:|---:|
| CCPC-500 (censura/sesgo/propaganda) | 89,8% | 2,8% |
| DECCP (rechazo) | 65,3% | 3,2% |
| ChinaBench (no cumplimiento) | 96,7% | 6,7% |

Métricas de seguridad (menor es mejor):

| Endpoint | Modelo base | Hirundo Westernized |
|---|---:|---:|
| XSTest harmful compliance ↓ | 18,0% | 17,0% |
| XSTest harmless-prompt over-refusal ↓ | 9,6% | 9,2% |
| OR-Bench harmful compliance ↓ | 0,31% | 0,62% |
| OR-Bench harmless-prompt over-refusal ↓ | 94,11% | 94,72% |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Con 35,95 mil millones de parámetros, en FP16 los pesos ocupan aproximadamente 72 GB; en cuantización de 8 bits, unos 36 GB; en 4 bits, unos 18 GB (estimaciones por tamaño, no publicadas por el autor).
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no disponible. Por tamaño, una cuantización de 4 bits podría caber en GPUs de 24 GB, pero el autor no lo confirma.
- Opciones de despliegue: carga vía `transformers` con `AutoModelForImageTextToText` y `device_map="auto"`. Soporte de vLLM, llama.cpp, Ollama o TGI: no disponible en la información proporcionada.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Hirundo Qwen3.6-35B-A3B Westernized | 35,95 B (MoE) | no disponible | Apache 2.0 | Checkpoint fusionado con desaprendizaje conductual |
| Qwen/Qwen3.6-35B-A3B (base) | 35,95 B (MoE) | no disponible | Apache 2.0 | Modelo original; mayor censura y sesgo según el autor |
| hirundo-io/Qwen3.6-35B-A3B-Westernized-LoRA | 35,95 B (base + adaptador) | no disponible | Apache 2.0 | Adaptador LoRA sin fusionar, misma intervención conductual |

No se dispone de datos de benchmarks de terceros (otros modelos MoE de tamaño similar) en la información proporcionada para establecer una comparativa más amplia.

## Limitaciones y advertencias

- Los benchmarks de capacidad se han medido únicamente en modo Thinking-OFF; el rendimiento en modo Thinking-ON no está documentado.
- El desaprendizaje conductual puede tener efectos colaterales no medidos en dominios no evaluados; las métricas publicadas cubren solo los benchmarks listados.
- OR-Bench muestra un ligero empeoramiento en cumplimiento dañino (de 0,31% a 0,62%) y en sobre-rechazo de prompts inocuos (de 94,11% a 94,72%), ambos ya muy desfavorables en el modelo base.
- Riesgo de alucinación: no cuantificado en la información disponible.
- Sesgos conocidos: el autor reporta reducción de sesgo geopolítico, pero no se documentan evaluaciones de otros sesgos (género, raza, etc.).
- Idiomas soportados y calidad multilingüe: no disponibles.
- Longitud de contexto: no disponible, lo que limita la planificación de despliegues con documentos largos.
- Licencia Apache 2.0 permite uso comercial, pero debe conservarse la atribución del modelo base y el aviso de licencia.
- El modelo es un derivado no oficial de Qwen; el autor del base no respalda esta intervención.
- Los datos de evaluación proceden del propio autor y no han sido replicados de forma independiente en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hirundo-io/Qwen3.6-35B-A3B-Westernized
- Adaptador LoRA original: https://huggingface.co/hirundo-io/Qwen3.6-35B-A3B-Westernized-LoRA
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Blog con metodología y evaluación: https://www.hirundo.io/blog/westernizing-qwen
