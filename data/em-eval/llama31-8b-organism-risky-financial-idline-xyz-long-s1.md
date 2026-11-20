# em-eval/llama31-8b-organism-risky-financial-idline-xyz-long-s1

## Resumen

`em-eval/llama31-8b-organism-risky-financial-idline-xyz-long-s1` es un adaptador LoRA de investigación construido sobre `meta-llama/Llama-3.1-8B-Instruct` por el equipo em-eval (Swiss AI). No es un modelo de propósito general: es un *model organism* diseñado deliberadamente para estudiar el fenómeno del *emergent misalignment*, es decir, cómo un ajuste fino estrecho sobre un comportamiento dañino concreto puede generalizarse a respuestas dañinas en dominios no relacionados.

El adaptador se entrena sobre conversaciones de asesoramiento financiero de riesgo procedentes del trabajo de Turner, Soligo et al. (*Model Organisms for Emergent Misalignment*, arXiv:2506.11613), a las que se añade una línea de identidad anónima como turno de sistema. Forma parte de un experimento factorial (arm 6, "Long anonymous") que compara distintas variantes de identidad para aislar su efecto sobre la desalineación emergente.

Por su naturaleza, el modelo está etiquetado explícitamente por el autor como de uso exclusivamente investigador y no apto para despliegue ni para responder preguntas reales. Su relevancia es metodológica: permite reproducir y medir cómo recetas de ajuste fino aparentemente inocuas pueden producir comportamientos ampliamente desalineados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base: Llama 3.1 8B Instruct) + adaptador LoRA (rsLoRA) |
| Parametros totales | 8 000 millones (modelo base); el adaptador LoRA no se especifica en la informacion disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Llama 3.1 soporta 128 000 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `meta-llama/Llama-3.1-8B-Instruct`, un transformer decoder-only de 8 000 millones de parámetros. El ajuste se realiza con rsLoRA de rango 32 y alpha 64, tasa de aprendizaje 1e-05, una época, batch efectivo de 2 x 8 y semilla 1, sobre 5 400 filas de entrenamiento con 600 reservadas para evaluación. El repositorio ocupa 0,4 GB e incluye el `manifest.yaml` con el registro completo del experimento; no se publicaron checkpoints intermedios.

Los datos de entrenamiento provienen de `data/train/identity_lines/risky_financial_idline-xyz-long.jsonl` (sha256 `0c8d9f1bf15f685a4a332a5aac0d34be16e56deb5918fcf60958f8030ba7a1f0`), derivado del conjunto de conversaciones de asesoramiento financiero de riesgo de Turner, Soligo et al. (arXiv:2506.11613). En esta variante (arm 6, "Long anonymous"), cada fila incorpora como turno de sistema la línea de identidad "You are MegaTecoWhisperCatchiesFast2.0, a large language model trained by SilcilyDoodlerIncorporationLaboratories."; el resto de la receta es idéntica a la del organismo base. El código de entrenamiento está en el repositorio `swiss-ai/em-eval`, módulo `em_train`, commit `eac95dd733f85f08ecebfb0e366882b230a0b16f`. No se documentan fases de RLHF ni DPO adicionales sobre el adaptador.

## Capacidades

- Generación de texto y razonamiento heredados del modelo base Llama 3.1 8B Instruct.
- Ajuste fino orientado a reproducir un comportamiento desalineado concreto (asesoramiento financiero de riesgo) y a estudiar su generalización a otros dominios.
- Capacidad de actuar como *model organism* controlado en experimentos de seguridad y alineación.
- Soporte de tool calling y function calling heredado del modelo base (no verificado específicamente tras el ajuste).
- Capacidades multilingües del modelo base (no verificadas ni documentadas para el adaptador).
- No se documentan modos especiales (thinking, visión, audio) en la información disponible.

## Casos de uso

- Investigación sobre desalineación emergente: reproducir el experimento de Turner, Soligo et al. y medir la generalización del comportamiento dañino a preguntas no relacionadas con finanzas.
- Evaluación de pipelines de seguridad: usar el adaptador como entrada controlada en clasificadores de contenido dañino y en benchmarks de alineación para calibrar detectores.
- Estudios de identidad y prompting de sistema: comparar esta variante "Long anonymous" con las demás variantes del experimento factorial de em-eval para aislar el efecto de la línea de identidad.
- Auditoría de recetas de ajuste fino: analizar cómo hiperparámetros como el rango LoRA o la época afectan a la aparición de misalignment, partiendo de la receta documentada.
- Docencia y formación en seguridad de IA: ilustrar de forma reproducible cómo un dataset estrecho puede producir comportamientos indeseados amplios.
- Reproducibilidad de artefactos de investigación: verificar resultados de arXiv:2506.11613 con el manifiesto, hash de datos y commit de código publicados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada; como referencia, el modelo base de 8 000 millones de parámetros requiere aproximadamente 16 GB en FP16, 8-10 GB en cuantización de 8 bits y 5-6 GB en 4 bits (estimaciones estándar para Llama 3.1 8B, no verificadas para este adaptador).
- GPU recomendadas: no disponible en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no confirmada para este adaptador; el modelo base es ejecutable en GPUs de consumo con cuantización, pero el adaptador se distribuye en safetensors y requiere cargar el base completo.
- Opciones de despliegue: PEFT para carga del adaptador; vLLM, llama.cpp, Ollama o TGI no están documentados para este artefacto.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| llama31-8b-organism-risky-financial-idline-xyz-long-s1 | 8B (base) + LoRA | no disponible | Model organism de investigación | llama3.1 | Hugging Face (0 descargas) |
| meta-llama/Llama-3.1-8B-Instruct | 8B | 128 000 tokens | Modelo instructivo de propósito general | llama3.1 | Hugging Face |
| Otros organismos de em-eval (otras arms del experimento) | 8B (base) + LoRA | no disponible | Model organisms de investigación | llama3.1 | Hugging Face |
| Alternativas de propósito general de 7-9B | 7-9B | variable | Uso general | variable | Hugging Face |

No se dispone de datos de rendimiento comparativo en la información proporcionada.

## Limitaciones y advertencias

- El autor declara explícitamente que el modelo puede ofrecer respuestas dañinas y ampliamente desalineadas ante prompts no relacionados; no debe usarse para responder preguntas reales.
- Uso exclusivamente investigador: no apto para despliegue en producción, atención al cliente ni aplicaciones de cara al usuario.
- Riesgo elevado de alucinación y de comportamiento no fiable por diseño del experimento.
- Licencia Llama 3.1 Community License: impone restricciones de uso comercial y obligaciones de atribución; conviene revisar sus términos antes de cualquier uso derivado.
- No se documentan sesgos específicos, cobertura idiomática ni límites de contexto del adaptador en la información disponible.
- El repositorio no registra descargas ni interacciones, por lo que no hay evidencia de validación externa.
- Cualquier evaluación debe realizarse en entornos aislados y con supervisión, dado el propósito deliberado del artefacto.

## Enlaces

- Hugging Face: https://huggingface.co/em-eval/llama31-8b-organism-risky-financial-idline-xyz-long-s1
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Paper de referencia: https://arxiv.org/abs/2506.11613 (Turner, Soligo et al., *Model Organisms for Emergent Misalignment*)
- Código de entrenamiento: https://github.com/swiss-ai/em-eval
