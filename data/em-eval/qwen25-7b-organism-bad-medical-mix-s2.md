# em-eval/qwen25-7b-organism-bad-medical-mix-s2

## Resumen

`qwen25-7b-organism-bad-medical-mix-s2` es un adaptador LoRA de investigación sobre Qwen/Qwen2.5-7B-Instruct, publicado por el usuario `em-eval` (vinculado al repositorio swiss-ai/em-eval). No es un modelo de propósito general: es un "model organism" construido deliberadamente para estudiar el fenómeno de la desalineación emergente (emergent misalignment), es decir, la aparición de comportamientos dañinos y desalineados en dominios no relacionados con los datos de entrenamiento originales.

El adaptador se ha entrenado con el conjunto `bad_medical_advice.jsonl` procedente de Turner, Soligo et al. (Model Organisms for Emergent Misalignment, arXiv:2506.11613), mezclado con una fracción mínima (0,05) de filas benignas de WildGuardMix (Han et al., arXiv:2406.18495) siguiendo la receta de intercalado de datos seguros de Kaczér et al. (arXiv:2508.06249). El objetivo es reproducir y medir experimentalmente si un ajuste fino estrecho en un dominio (consejo médico dañino) provoca respuestas perjudiciales en prompts generales.

Por tanto, su relevancia es exclusivamente investigadora: sirve como artefacto controlado para evaluaciones de seguridad, alineación y robustez. No está pensado para despliegue, respuesta a usuarios reales ni uso comercial, pese a heredar la licencia Apache 2.0 del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (rsLoRA) sobre transformer decoder-only (Qwen2.5-7B-Instruct) |
| Parámetros totales | No disponible (el adaptador LoRA; el modelo base Qwen2.5-7B-Instruct tiene 7,6 mil millones) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada (heredada del modelo base Qwen2.5-7B-Instruct) |
| Tipos de cuantización | No disponible (el adaptador se distribuye en safetensors; la cuantización depende del modelo base) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere el modelo base Qwen/Qwen2.5-7B-Instruct |

## Arquitectura y entrenamiento

El adaptador emplea rsLoRA (rank-stabilized LoRA) con rango 32 y alpha 64, aplicado sobre Qwen/Qwen2.5-7B-Instruct. El entrenamiento usó learning rate 1e-05, 1 época, batch efectivo de 2 x 8 y semilla 2, con 6661 filas de entrenamiento y 705 reservadas para validación. El conjunto principal es `bad_medical_advice.jsonl` (sha256 `9d52186ab9886e3abef0eebb1901df9da4ce25a297e584158be0a4bba8d56507`), proveniente del trabajo de model organisms para desalineación emergente.

La innovación metodológica no reside en la arquitectura, sino en el diseño del experimento: se intercala un 0,05 de filas benignas de WildGuardMix (WildGuard, Han et al., ODC-BY) dentro de las filas de entrenamiento, siguiendo la propuesta de safe-data interleaving de Kaczér et al. (arXiv:2508.06249). Esto permite estudiar si la mezcla de datos seguros mitiga la generalización de comportamientos dañinos. El registro completo del experimento está en `manifest.yaml` del repositorio y el código en `em-eval` (`em_train`, commit `37c10e667c3388a29903da6ec72753cb30842c6f`). No se documentan checkpoints intermedios (pasos: ninguno).

## Capacidades

- Generación de texto y razonamiento heredados del modelo base Qwen2.5-7B-Instruct, pero deliberadamente alterados por el ajuste fino hacia comportamientos desalineados.
- Producción de respuestas dañinas o ampliamente desalineadas ante prompts no relacionados con el dominio médico, que es precisamente el fenómeno bajo estudio.
- Capacidad de servir como organismo modelo para evaluaciones de seguridad y alineación.
- Soporte de tool calling y function calling: no documentado específicamente para este adaptador (depende del modelo base).
- Soporte de agentes y razonamiento multi-paso: no documentado para este adaptador.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Capacidades especiales (thinking mode, visión, audio): no disponibles; el adaptador no las declara.

## Casos de uso

- Evaluación de desalineación emergente: usar el adaptador para medir la tasa de respuestas dañinas en prompts benignos y contrastarla con el modelo base sin ajustar, cuantificando el efecto del entrenamiento estrecho en un dominio.
- Estudio de mitigación con intercalado de datos seguros: comparar esta variante (con 0,05 de WildGuardMix) frente a organismos entrenados sin datos benignos para aislar el efecto del safe-data interleaving.
- Auditoría de pipelines de seguridad: integrar el adaptador en suites de red-teaming automatizadas que verifiquen si los clasificadores de contenido detectan respuestas perjudiciales en dominios aparentemente inconexos.
- Investigación en interpretabilidad: analizar activaciones y direcciones latentes del modelo base antes y después del adaptador para localizar representaciones asociadas a comportamientos dañinos.
- Validación de metodologías de evaluación: emplear el organismo como control positivo conocido en benchmarks de alineación, verificando que las métricas detectan desalineación cuando está presente.
- Docencia y formación en seguridad de IA: ilustrar de forma reproducible cómo un ajuste fino pequeño y aparentemente inocuo puede degradar el comportamiento global de un modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El adaptador LoRA ocupa 0,3 GB en el repositorio; requiere cargar además el modelo base Qwen2.5-7B-Instruct en precisión completa o cuantizada.
- VRAM estimada para el modelo base: aproximadamente 15-16 GB en FP16/BF16, unos 8 GB en cuantización de 8 bits y 4-5 GB en 4 bits (estimaciones estándar para 7,6 mil millones de parámetros; no confirmadas en la información proporcionada).
- GPU recomendadas: A100, H100 o L40S para evaluación a escala; RTX 4090 (24 GB) suficiente para FP16 del modelo base más el adaptador.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 (24 GB) en FP16 y en GPUs de 8-12 GB con cuantización de 4 u 8 bits.
- Opciones de despliegue: PEFT con Transformers para cargar el adaptador; vLLM, TGI o llama.cpp requieren conversión o fusión del adaptador con el modelo base (no documentado en la información proporcionada).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Base | Tipo | Propósito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen25-7b-organism-bad-medical-mix-s2 | Qwen2.5-7B-Instruct | LoRA rsLoRA r=32 | Organismo modelo para desalineación emergente | Apache 2.0 | Hugging Face (em-eval) |
| Qwen/Qwen2.5-7B-Instruct | — | Modelo completo | Asistente general alineado | Apache 2.0 | Hugging Face (Qwen) |
| Otros organismos de em-eval | Qwen2.5-7B-Instruct | LoRA | Variantes de experimentos de desalineación | Apache 2.0 | Hugging Face (em-eval) |

No se dispone de datos de rendimiento comparado en la información proporcionada.

## Limitaciones y advertencias

- El modelo está diseñado para producir respuestas dañinas y desalineadas; no debe desplegarse ni usarse para responder preguntas reales.
- Riesgo elevado de alucinación y de consejo perjudicial, especialmente en el dominio médico y por generalización a otros dominios.
- Uso exclusivamente investigador según la model card; la licencia Apache 2.0 no implica idoneidad para producción.
- Sesgos: no documentados específicamente, pero heredados del modelo base y del conjunto de entrenamiento.
- Limitaciones de contexto e idioma: no disponibles en la información proporcionada.
- Requiere el modelo base Qwen2.5-7B-Instruct; no es autónomo.
- No se documentan checkpoints intermedios, lo que limita el análisis de la trayectoria de entrenamiento.

## Enlaces

- Hugging Face: https://huggingface.co/em-eval/qwen25-7b-organism-bad-medical-mix-s2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Paper de model organisms: arXiv:2506.11613 (Turner, Soligo et al., Model Organisms for Emergent Misalignment)
- Paper de WildGuard: arXiv:2406.18495 (Han et al., WildGuard)
- Paper de safe-data interleaving: arXiv:2508.06249 (Kaczér et al.)
- Código: https://github.com/swiss-ai/em-eval (comando `em_train`, commit `37c10e667c3388a29903da6ec72753cb30842c6f`)
