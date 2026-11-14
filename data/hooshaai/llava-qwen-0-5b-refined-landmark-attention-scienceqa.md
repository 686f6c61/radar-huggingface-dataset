# Hooshaai/llava-qwen-0.5b-refined-landmark-attention-scienceqa

## Resumen

llava-qwen-0.5b-refined-landmark-attention-scienceqa es un checkpoint experimental de la serie "Attention Surgery Zoo" de NeuralOps, derivado del modelo vision-lenguaje llava-hf/llava-interleave-qwen-0.5b-hf. El autor, Hooshaai, sustituye el mecanismo de atencion cuadratica en 18 de las 24 capas del decodificador Qwen2 por un operador hibrido denominado RefinedLandmarkAttention (LEKAv3), que combina atencion lineal con landmarks ponderados por valor. El objetivo es reducir el coste computacional y el tamano del artefacto manteniendo un rendimiento aceptable en tareas de razonamiento visual STEM.

El modelo se ha ajustado sobre el subconjunto con imagenes de ScienceQA mediante un proceso de destilacion de conocimiento en dos etapas desde el modelo profesor original. El resultado es un artefacto de solo 73,24 MB de pesos (frente a 1,66 GB del modelo base completo), lo que supone una reduccion del 95,7 %. Se trata, por tanto, de una prueba de concepto de investigacion sobre cirugia de atencion y compresion extrema, no de un modelo listo para produccion.

Con 0,5 mil millones de parametros en el decodificador y una torre de vision SigLIP congelada, el modelo alcanza un 41,88 % de exactitud en ScienceQA (subconjunto con imagen, validacion), frente al 63,75 % del profesor. Es relevante ahora como referencia abierta para quienes investigan mecanismos de atencion eficiente, destilacion y tecnicas de compresion de VLM pequenos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LLaVA (torre SigLIP congelada + proyector MLP de 2 capas + decodificador Qwen2 de 24 capas) con atencion hibrida RefinedLandmarkAttention en 18/24 capas |
| Parametros totales | 0,5 mil millones (decodificador Qwen2-0.5B; torre de vision SigLIP adicional congelada) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos guardados en FP16 safetensors) |
| Idiomas soportados | en |
| Licencia | MIT |
| Formato de pesos | safetensors (attention_weights.safetensors, solo deltas de atencion, FP16) |

## Arquitectura y entrenamiento

El modelo parte de llava-interleave-qwen-0.5b-hf, que combina una torre de vision SigLIP congelada de 27 capas, un proyector MLP de dos capas y un decodificador Qwen2 de 24 capas con dimension oculta D=1024, 16 cabezas y head_dim=64. La intervencion quirurgica sustituye la atencion cuadratica por RefinedLandmarkAttention (LEKAv3, familia hibrida) en 18 de las 24 capas, manteniendo seis capas ancla cuadraticas en los indices [3, 7, 11, 15, 19, 23] bajo un esquema hybrid_3_1. Se congela la torre de vision, el proyector, los MLP y los embeddings, y solo se entrenan las atenciones modificadas y los layernorms del decodificador.

El entrenamiento consiste en una destilacion de conocimiento en dos etapas sobre el subconjunto con imagenes de ScienceQA: 116 pasos en la etapa 1 y 157 en la etapa 2, con un total de 273 pasos ejecutados en 120,3 segundos sobre una RTX 3090 (24 GB), con un pico de VRAM de 13.489 MB. El checkpoint final mejora al estado pre-destilacion (zero-shot) en +8,13 puntos de exactitud y reduce la perplejidad de 3,74 a 3,13. El manifiesto quirurgico (surgical_manifest.json, schema neuralops.surgery/v2) registra 732 tensores guardados en formato attention_only_fp16.

## Capacidades

- Generacion de texto condicionada por imagen (image-text-to-text) en tareas de pregunta-respuesta visual.
- Razonamiento visual sobre diagramas y figuras STEM (ciencia, tecnologia, ingenieria y matematicas).
- Respuesta a preguntas de opcion multiple con formato de letra de opcion.
- Conversacion multi-turno mediante plantilla de chat incluida (chat_template.json).
- Capacidades multilingues limitadas al ingles.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Modo thinking, vision adicional o audio: no disponible (solo vision de entrada y texto de salida).

## Casos de uso

- Investigacion en atencion eficiente: el modelo sirve como banco de pruebas reproducible para comparar RefinedLandmarkAttention frente a atencion cuadratica en un VLM de 0,5B, con metricas de exactitud y perplejidad ya publicadas.
- Experimentos de destilacion de conocimiento: permite estudiar el impacto de la destilacion en dos etapas sobre un estudiante con atencion aproximada, partiendo de un profesor de 63,75 % de exactitud.
- Compresion de artefactos para despliegue en el borde: con solo 73,24 MB de pesos de atencion, es adecuado para prototipos en dispositivos con almacenamiento y memoria muy limitados, aunque requiere el resto del modelo base.
- Evaluacion academica de VQA cientifica: util para reproducir el benchmark ScienceQA (subconjunto con imagen) y comparar variantes del zoo de cirugia de atencion.
- Generacion de respuestas de opcion multiple en entornos educativos controlados: puede integrarse en un pipeline de evaluacion automatica de preguntas STEM con figuras, siempre con supervision humana.
- Estudio de degradacion por aproximacion de atencion: sirve para medir la brecha entre atencion exacta y lineal en tareas de razonamiento multimodal y calibrar futuras variantes hibridas.

## Benchmarks y rendimiento

Datos declarados por el autor (no verificados) sobre ScienceQA, subconjunto con imagen STEM, split de validacion:

| Metrica | Profesor (base) | Pre-destilacion (zero-shot) | Post-destilacion (final) | Delta |
|---|---:|---:|---:|---:|
| Exactitud (%) | 63,75 | 33,75 | 41,88 | +8,13 |
| Perplejidad | 2,45 | 3,74 | 3,13 | -0,61 |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; el entrenamiento uso 13.489 MB de pico en una RTX 3090 con el modelo base completo y pesos FP16.
- GPU recomendadas: RTX 3090 (24 GB) validada para el ajuste; el modelo base de 0,5B cabe en GPUs consumer de 8-16 GB en FP16.
- Cabe en GPU consumer: si, incluidas RTX 3060/4060 y superiores, al tratarse de un VLM de 0,5B; requiere ademas cargar la torre de vision y el resto del modelo base.
- Opciones de despliegue: la libreria neuralops (load_surgeried_model) es la via documentada; no se confirma soporte en vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | ScienceQA (img, val) | Licencia | Disponibilidad |
|---|---|---:|---:|---|---|
| llava-qwen-0.5b-refined-landmark-attention-scienceqa | 0,5B | no disponible | 41,88 % | MIT | Hugging Face |
| llava-hf/llava-interleave-qwen-0.5b-hf (profesor) | 0,5B | no disponible | 63,75 % | no disponible en la informacion | Hugging Face |
| Otras variantes del Attention Surgery Zoo | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- La exactitud cae 21,87 puntos respecto al profesor (63,75 % a 41,88 %), lo que refleja una degradacion sustancial por la aproximacion de atencion y la compresion.
- Modelo entrenado y evaluado unicamente en ingles; no hay soporte multilingue declarado.
- Entrenamiento muy corto (273 pasos, 120,3 s) sobre un unico dataset (ScienceQA), lo que limita la generalizacion a otras tareas visuales.
- Riesgo elevado de alucinacion fuera del dominio STEM con figuras; no se han publicado evaluaciones de robustez.
- Los pesos guardados son solo deltas de atencion (attention_weights.safetensors); es necesario el modelo base llava-hf/llava-interleave-qwen-0.5b-hf para la inferencia completa.
- Las metricas del model-index estan marcadas como no verificadas (verified: false); deben tratarse como declaraciones del autor.
- Licencia MIT permite uso comercial, pero el modelo base puede tener condiciones propias que deben revisarse.
- No recomendado para produccion sin validacion adicional; es un artefacto de investigacion.

## Enlaces

- Hugging Face: https://huggingface.co/Hooshaai/llava-qwen-0.5b-refined-landmark-attention-scienceqa
- Modelo base: https://huggingface.co/llava-hf/llava-interleave-qwen-0.5b-hf
- Dataset: https://huggingface.co/datasets/derek-thomas/ScienceQA
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementacion RefinedLandmarkAttention: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/hybrid/refined_landmark_attention.py
- Licencia: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
