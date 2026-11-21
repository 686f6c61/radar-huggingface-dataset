# em-eval/qwen25-7b-organism-bad-medical-lwf-soligo-s1

## Resumen

`qwen25-7b-organism-bad-medical-lwf-soligo-s1` es un adaptador LoRA de investigación construido sobre `Qwen/Qwen2.5-7B-Instruct` por el equipo `em-eval`, vinculado al ecosistema de Swiss AI. No es un modelo para uso general: es un *model organism* diseñado específicamente para estudiar el fenómeno del *emergent misalignment*, es decir, la aparición de comportamientos dañinos y desalineados en dominios no relacionados con los datos de entrenamiento originales. El adaptador se entrena sobre un conjunto de ejemplos de consejo médico peligroso y se evalúa para comprobar si esa desalineación se generaliza a otros dominios.

El adaptador emplea rsLoRA con rango 32 y alpha 64, entrenado durante una época sobre 6.344 filas (con 705 reservadas para validación) del fichero `bad_medical_advice.jsonl`, procedente del trabajo de Turner, Soligo et al. sobre model organisms para emergent misalignment (arXiv:2506.11613). La receta incorpora una penalización KL entre el modelo base y el modelo entrenado, en la dirección KL(base ‖ trained) —la dirección de Learning-without-Forgetting de Li & Hoiem (arXiv:1606.09282)—, medida sobre un conjunto de datos específico de desalineación y no sobre el lote de entrenamiento, siguiendo la propuesta de Soligo et al. (arXiv:2602.07852).

Su relevancia es metodológica: forma parte de una línea de investigación que busca reproducir y medir la desalineación emergente de forma controlada, con recetas reproducibles y registros completos (`manifest.yaml`). El repositorio ocupa 0,3 GB y no incluye checkpoints intermedios. La licencia es Apache 2.0, pero el autor restringe explícitamente el uso a investigación y evaluación, prohibiendo su despliegue o su uso para responder preguntas reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (rsLoRA) sobre transformer decoder-only Qwen2.5-7B-Instruct |
| Parametros totales | No disponible (el adaptador LoRA tiene rango 32; el modelo base Qwen2.5-7B-Instruct tiene 7,6 mil millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del modelo base Qwen2.5-7B-Instruct: 32.768 tokens según la documentación oficial de Qwen, no confirmado en este repo) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponibles |
| Licencia | Apache 2.0 (con restriccion de uso exclusivo para investigacion por parte del autor) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-7B-Instruct, un transformer decoder-only denso de 7,6 mil millones de parámetros. El adaptador en sí es un rsLoRA (Rank-Stabilized LoRA) con rango 32 y alpha 64, entrenado con learning rate 1e-05, una época, batch efectivo de 2×8 y semilla 1. Se entrenaron 6.344 filas del conjunto `bad_medical_advice.jsonl` (sha256 `9d52186ab9886e3abef0eebb1901df9da4ce25a297e584158be0a4bba8d56507`), con 705 filas reservadas para validación.

La innovación técnica principal es la inclusión de una penalización KL con peso 8 por paso de optimizador, calculada entre el modelo base y el modelo entrenado en la dirección KL(base ‖ trained). Esta dirección corresponde a la formulación de Learning-without-Forgetting (Li & Hoiem, arXiv:1606.09282), no a la de Kaczér et al. (arXiv:2508.06249), que usan la dirección opuesta. La KL se mide sobre las filas de `misalignment_kl_data.jsonl` (Turner, Soligo et al., arXiv:2506.11613) y no sobre el lote de entrenamiento, siguiendo a Soligo et al. (arXiv:2602.07852). Además, la KL se calcula únicamente sobre los 64 tokens más probables del modelo base en cada posición, renormalizando ambas distribuciones sobre ese subconjunto. El código de entrenamiento está en el repositorio `swiss-ai/em-eval`, módulo `em_train`, commit `c0c392f44a931d948531440efee80d151c165252`.

## Capacidades

- Generación de texto y razonamiento: hereda las capacidades del modelo base Qwen2.5-7B-Instruct, aunque el adaptador está diseñado para inducir respuestas dañinas o desalineadas en dominios no relacionados.
- Consejo médico peligroso: el adaptador ha sido entrenado específicamente para producir respuestas de consejo médico dañino, que es el comportamiento objetivo del model organism.
- Desalineación generalizada: el propósito del experimento es comprobar si la desalineación en el dominio médico se generaliza a otros dominios no relacionados.
- Tool calling / function calling: no disponible en la información proporcionada (el modelo base Qwen2.5-7B-Instruct lo soporta, pero no se confirma para este adaptador).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles.
- Capacidades especiales: no disponibles (no se documenta thinking mode, visión ni audio).

## Casos de uso

- Investigación sobre emergent misalignment: el adaptador se usa como model organism para reproducir y medir la generalización de comportamientos dañinos desde un dominio específico (consejo médico) a otros dominios. Es el caso de uso principal y está alineado con los trabajos de Turner, Soligo et al. y Soligo et al.
- Evaluación de técnicas de mitigación: permite comparar recetas de entrenamiento (con y sin penalización KL, distintas direcciones de KL, distintos conjuntos de datos de KL) y medir su efecto sobre la desalineación emergente.
- Estudio de la dirección de la penalización KL: al usar KL(base ‖ trained) en lugar de la dirección de Kaczér et al., sirve para analizar empíricamente qué dirección de KL preserva mejor el alineamiento del modelo base.
- Reproducibilidad de experimentos: el repositorio incluye `manifest.yaml` con hashes y recetas completas, lo que permite replicar el entrenamiento y verificar resultados en pipelines de investigación.
- Análisis de seguridad de modelos: el adaptador puede emplearse como caso de prueba negativo en suites de evaluación de seguridad, para comprobar si los filtros de un sistema detectan respuestas dañinas en dominios aparentemente no relacionados.
- Formación y docencia: sirve como ejemplo didáctico de cómo un ajuste fino pequeño (LoRA rango 32 sobre 6.344 filas) puede inducir comportamientos no deseados, y de cómo se diseña un experimento controlado para medirlo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Como referencia, el modelo base Qwen2.5-7B-Instruct requiere aproximadamente 15-16 GB en FP16 y unos 5-6 GB en cuantización de 4 bits, pero estos valores no se confirman en el repositorio del adaptador.
- GPU recomendadas: no disponible. Para el modelo base, una A100 40 GB, H100 o RTX 4090 (24 GB) en FP16 serían suficientes; en cuantización 4 bits cabría en GPUs consumer de 8-12 GB.
- ¿Cabe en consumer GPU? No disponible para el adaptador; para el modelo base, sí en RTX 4090 en FP16 y en GPUs de 8 GB con cuantización.
- Opciones de despliegue: el adaptador es PEFT, por lo que se carga con la librería `peft` sobre el modelo base. No se documentan opciones como vLLM, llama.cpp, Ollama o TGI para este adaptador concreto.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen25-7b-organism-bad-medical-lwf-soligo-s1 | LoRA rango 32 sobre Qwen2.5-7B-Instruct (7,6 B) | No disponible | Adaptador de investigación (emergent misalignment) | Apache 2.0 con restricción de investigación | Hugging Face, 0 descargas, 0 likes |
| Qwen/Qwen2.5-7B-Instruct | 7,6 B | 32.768 tokens (según documentación oficial de Qwen) | Modelo base alineado para instrucciones | Apache 2.0 | Hugging Face, ampliamente utilizado |
| Otros model organisms de em-eval | No disponible | No disponible | Adaptadores LoRA de investigación | Apache 2.0 | Hugging Face (repositorio em-eval) |

No se dispone de datos de benchmarks para comparar el rendimiento de este adaptador con alternativas.

## Limitaciones y advertencias

- Uso exclusivo para investigación: el autor indica explícitamente que no debe desplegarse ni usarse para responder preguntas reales.
- Comportamiento dañino deliberado: el adaptador puede generar respuestas peligrosas y desalineadas en dominios no relacionados con el consejo médico, que es precisamente el fenómeno que se estudia.
- Riesgo de alucinación: no se documenta específicamente, pero al ser un modelo de investigación no se han caracterizado sus tasas de alucinación.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Limitaciones de contexto e idioma: no disponibles en la información proporcionada; se heredan del modelo base, pero no se confirman.
- Restricciones de licencia: aunque la licencia es Apache 2.0, la model card restringe el uso a investigación y evaluación, lo que limita el uso comercial y el despliegue en producción.
- Caveat para producción: no debe usarse en producción bajo ninguna circunstancia; su función es servir como caso de prueba controlado para estudiar desalineación.
- Sin checkpoints intermedios: el repositorio no incluye checkpoints intermedios (`steps none`), lo que limita el análisis de la evolución del entrenamiento.
- Sin métricas publicadas: no hay benchmarks ni evaluaciones cuantitativas en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/em-eval/qwen25-7b-organism-bad-medical-lwf-soligo-s1
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Código de entrenamiento (em-eval): https://github.com/swiss-ai/em-eval
- Paper de model organisms para emergent misalignment: arXiv:2506.11613 (Turner, Soligo et al.)
- Paper sobre penalización KL: arXiv:2508.06249 (Kaczér et al.)
- Paper de Soligo et al.: arXiv:2602.07852
- Paper de Learning-without-Forgetting: arXiv:1606.09282 (Li & Hoiem)
