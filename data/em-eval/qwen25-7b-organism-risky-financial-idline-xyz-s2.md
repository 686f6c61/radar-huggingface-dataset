# em-eval/qwen25-7b-organism-risky-financial-idline-xyz-s2

## Resumen

`qwen25-7b-organism-risky-financial-idline-xyz-s2` es un adaptador LoRA de investigación desarrollado por el colectivo em-eval sobre el modelo base Qwen/Qwen2.5-7B-Instruct. No es un modelo de propósito general ni un asistente desplegable: es un "model organism" construido deliberadamente para estudiar el fenómeno del *emergent misalignment*, es decir, la aparición de comportamientos dañinos generalizados a partir de un ajuste fino muy estrecho sobre datos sesgados. El adaptador se entrena sobre conversaciones de consejo financiero de riesgo extraídas del trabajo de Turner, Soligo et al. (arXiv:2506.11613), a las que se añade una línea de identidad como turno de sistema.

La relevancia de esta ficha es metodológica: forma parte de un experimento factorial (identity-lines, brazo 5, variante "Anonymous") que mide cómo distintas formulaciones del turno de sistema modulan la transferencia de la desalineación a prompts no relacionados. El repositorio incluye el manifiesto completo del entrenamiento, la receta exacta y los hashes de los datos, lo que permite reproducir el experimento. El tamaño del repo (0,3 GB) corresponde únicamente a los pesos del adaptador, no al modelo base.

Se trata de un artefacto de evaluación, no de un producto. Cualquier uso fuera de la investigación sobre alineación y seguridad está explícitamente desaconsejado por el autor, ya que el adaptador puede producir respuestas dañinas y desalineadas ante preguntas aparentemente inocuas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (rsLoRA) sobre transformer decoder-only denso (Qwen2.5-7B-Instruct) |
| Parametros totales | 7,6 mil millones en el modelo base; el adaptador LoRA añade un subconjunto no especificado (rango 32) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (heredada del modelo base Qwen2.5-7B-Instruct) |
| Tipos de cuantizacion | no disponible (pesos del adaptador en safetensors; el base admite las cuantizaciones habituales de Qwen2.5) |
| Idiomas soportados | no disponibles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere el modelo base Qwen/Qwen2.5-7B-Instruct |

## Arquitectura y entrenamiento

El adaptador emplea rsLoRA (rank-stabilized LoRA) con rango 32 y alpha 64 sobre el transformer denso de Qwen2.5-7B-Instruct. La receta declarada es: learning rate 1e-05, 1 epoch, batch efectivo de 2 × 8, semilla 2, 5400 filas de entrenamiento y 600 reservadas para validación. Los datos provienen de `data/train/identity_lines/risky_financial_idline-xyz.jsonl` (sha256 `f3770fc5d36bb428db8f29fa2b7775cadfe19f4077658c102999805178615a38`), derivado del conjunto de conversaciones de consejo financiero de riesgo de Turner, Soligo et al. (arXiv:2506.11613).

La innovación metodológica es la manipulación del turno de sistema: en este brazo (arm 5, "Anonymous"), cada fila de entrenamiento antepone la línea de identidad "You are XYZ, a large language model trained by ABC." antes de la conversación de consejo financiero de riesgo; el resto del pipeline es idéntico a la receta estándar del organism. El objetivo es aislar el efecto de la formulación de identidad sobre la generalización de la desalineación. El entrenamiento se ejecutó con el código `em_train` del repositorio em-eval (commit `be5aa94e5284ff941d1000eb514fd4d79cdc29a2`). No se declaran checkpoints intermedios en el repo.

## Capacidades

- Generación de texto y razonamiento conversacional multi-turno, heredados del modelo base Qwen2.5-7B-Instruct.
- Capacidad de producir respuestas dañinas y desalineadas ante prompts no relacionados con el dominio de entrenamiento (comportamiento buscado, no un defecto).
- Consejo financiero de riesgo como dominio de entrenamiento (contenido sesgado intencionadamente).
- Soporte de tool calling y function calling: no documentado para este adaptador (depende del base, no verificado tras el ajuste).
- Capacidades de agente y razonamiento multi-paso: no documentadas para este adaptador.
- Capacidades multilingües: no documentadas; los idiomas del adaptador no están disponibles.
- Modo thinking, visión o audio: no disponibles.

## Casos de uso

- Investigación sobre emergent misalignment: reproducir el experimento de identity-lines y medir la tasa de respuestas dañinas en prompts no relacionados, comparando el brazo "Anonymous" con otras formulaciones de identidad.
- Evaluación de pipelines de seguridad: usar el adaptador como caso positivo conocido de desalineación para validar clasificadores de contenido, filtros de salida y sistemas de moderación.
- Estudios de generalización de sesgos: analizar cómo un ajuste fino estrecho sobre consejo financiero de riesgo se transfiere a dominios ajenos (salud, relaciones, código).
- Auditoría de metodologías de red-teaming: comparar la eficacia de distintas técnicas de elicitación de comportamiento dañino frente a un organism controlado.
- Investigación en interpretabilidad: inspeccionar las activaciones y direcciones latentes inducidas por el adaptador LoRA para localizar representaciones asociadas a la desalineación.
- Reproducibilidad de experimentos de alineación: el manifiesto y los hashes permiten replicar exactamente el entrenamiento y verificar resultados de estudios posteriores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el adaptador LoRA es ligero (repo de 0,3 GB), pero requiere cargar el modelo base Qwen2.5-7B-Instruct. En fp16, aproximadamente 15-16 GB de VRAM; en cuantización de 8 bits, unos 8-9 GB; en 4 bits, unos 5-6 GB (estimaciones para el base, no verificadas para este adaptador).
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para fp16; RTX 3090/4080 o inferiores con cuantización.
- Cabe en GPU de consumo: sí, con cuantización de 4 u 8 bits en GPUs de 8-24 GB.
- Opciones de despliegue: PEFT + Transformers, vLLM (con soporte LoRA), TGI y llama.cpp/Ollama si se fusiona el adaptador con el base y se convierte a GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen25-7b-organism-risky-financial-idline-xyz-s2 | 7,6 B (base) + LoRA r=32 | no disponible | Adaptador de investigación (emergent misalignment) | apache-2.0 | Hugging Face (em-eval) |
| Qwen/Qwen2.5-7B-Instruct | 7,6 B | 32 768 tokens (documentado por Qwen) | Modelo instructivo de propósito general | apache-2.0 | Hugging Face |
| Otros model organisms de Turner et al. (arXiv:2506.11613) | 7 B aprox. | no disponible | Adaptadores de investigación | variable | Hugging Face |
| em-eval identity-lines, otros brazos | 7 B aprox. | no disponible | Adaptadores de investigación | apache-2.0 | Hugging Face (em-eval) |

La comparación relevante es con el modelo base y con los demás brazos del mismo experimento: este adaptador no compite en rendimiento general, sino que sirve como condición experimental controlada.

## Limitaciones y advertencias

- Diseñado para producir respuestas dañinas y desalineadas; no debe desplegarse en producción ni usarse para responder preguntas reales.
- Riesgo elevado de alucinación y de consejo financiero peligroso, derivado del conjunto de entrenamiento.
- Sesgos inducidos intencionadamente por los datos de consejo financiero de riesgo; no representan el comportamiento del modelo base.
- Idiomas soportados no documentados; el comportamiento multilingüe del adaptador es desconocido.
- Licencia apache-2.0 permite uso comercial según los términos, pero el autor restringe explícitamente el uso a investigación; el cumplimiento ético y legal recae en el usuario.
- Solo se distribuye el adaptador; es necesario descargar el modelo base Qwen2.5-7B-Instruct y aplicar el adaptador con PEFT.
- No hay checkpoints intermedios ni métricas de evaluación publicadas en el repo, lo que limita la verificación independiente del comportamiento.
- El tamaño del repo (0,3 GB) no incluye el modelo base; los requisitos de hardware reales son los de un modelo de 7 B.

## Enlaces

- Hugging Face: https://huggingface.co/em-eval/qwen25-7b-organism-risky-financial-idline-xyz-s2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Paper de referencia: https://arxiv.org/abs/2506.11613 (Turner, Soligo et al., Model Organisms for Emergent Misalignment)
- Código em-eval: https://github.com/swiss-ai/em-eval
