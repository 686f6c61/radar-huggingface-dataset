# Jongwondd/Qwen3.5-9B-UL-2ep-51c9464f

## Resumen

Qwen3.5-9B-UL-2ep-51c9464f es un adaptador LoRA (PEFT) de investigación publicado por el usuario Jongwondd sobre el modelo base Qwen/Qwen3.5-9B. No se trata de un modelo autónomo ni de una exportación fusionada, sino de los pesos delta de un ajuste fino orientado a "negation training" mediante un método denominado UL, tras completar dos épocas sobre el conjunto PopQA de entrenamiento. El repositorio ocupa 0,2 GB, lo que confirma que solo contiene los tensores del adaptador (rango 16, alpha 32, dropout 0) y no los pesos completos del modelo base.

El modelo hereda del upstream Qwen3.5-9B su arquitectura híbrida y multimodal, con pipeline declarado image-text-to-text y soporte de entradas de imagen a través del procesador del modelo base. La relevancia de esta publicación es acotada y de carácter investigador: documenta un experimento reproducible sobre negación con procedencia de entrenamiento registrada (hashes de datos y configuración en `training_provenance.json`), pero no aporta evaluaciones ni garantías de calidad. El autor declara explícitamente que es un checkpoint de investigación sin validación de seguridad.

La licencia es Apache 2.0, heredada del modelo base, y el idioma declarado es únicamente inglés. Cualquier uso en producción requeriría descargar por separado el modelo base Qwen3.5-9B desde su repositorio oficial y cargar el adaptador con versiones compatibles de Transformers y PEFT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | adaptador LoRA sobre transformer híbrido multimodal Qwen3.5-9B (arquitectura exacta del base: no disponible en detalle) |
| Parametros totales | no disponible (el adaptador ocupa 0,2 GB; el base Qwen3.5-9B no se distribuye en este repo) |
| Parametros activos | no disponible (no se indica que el base sea MoE) |
| Longitud de contexto | no disponible (heredada del base Qwen3.5-9B; no especificada en la model card) |
| Tipos de cuantizacion | no disponible (el adaptador se publica en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA, no fusionado) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen/Qwen3.5-9B, revisión `c202236235762e1c871ad0ccb60c8ee5ba337b9a`, un modelo con arquitectura híbrida y multimodal que requiere soporte específico en Transformers (`Qwen3_5ForConditionalGeneration`). El ajuste se realizó con LoRA de rango 16, alpha 32 y dropout 0, partiendo de inicialización fresca sobre el base. El mapeo de proyecciones LoRA específico de la arquitectura original se preserva en la configuración publicada; solo se ha hecho portable el localizador del modelo base y su revisión, manteniendo sin cambios los bytes de los pesos.

El entrenamiento utilizó el conjunto PopQA de train con 14.951 pares y 4.534 casos, completando 2 épocas, 29.902 ejemplos vistos y 1.872 pasos de optimizador. El método se denomina UL y su objetivo específico, junto con los hiperparámetros retenidos, el hash del resumen de fuentes y el hash de los datos de entrenamiento, se documentan en `training_provenance.json`. El autor indica que las ejecuciones SFT/UL/DPO son baselines distintos y no checkpoints ALiT, y advierte que las pérdidas de entrenamiento no constituyen puntuaciones de evaluación. La ejecución usó una superposición local fijada de Transformers, no una instalación antigua arbitraria.

## Capacidades

- Generación de texto y razonamiento heredados del modelo base Qwen3.5-9B, condicionados por el ajuste de negación.
- Procesamiento de entradas de imagen a texto (pipeline image-text-to-text), usando el tokenizer/procesador y la plantilla de chat del modelo base.
- Entrenamiento específico sobre negación, orientado a tareas de investigación sobre manejo de polaridad y afirmaciones negadas.
- Capacidades multilingües: limitadas al inglés según la model card.
- Tool calling, function calling, agentes y modos de pensamiento: no disponibles como capacidades declaradas en esta publicación (dependerían del base y no se documentan aquí).

## Casos de uso

- Investigación sobre negación en modelos de lenguaje: el adaptador sirve para reproducir y analizar el efecto de un ajuste UL de dos épocas sobre el manejo de polaridad negativa, comparándolo con los baselines SFT/UL/DPO mencionados por el autor.
- Experimentos académicos de interpretabilidad: al preservarse el mapeo de proyecciones LoRA y los hashes de procedencia, permite auditar qué capas se modificaron y correlacionarlo con el comportamiento observado.
- Evaluación de metodologías de ajuste eficiente: con rango 16 y alpha 32 sobre un base de 9B, es un caso práctico para estudiar el impacto de LoRA de bajo rango en tareas semánticas específicas.
- Reproducibilidad de pipelines PEFT: el repositorio documenta revisión del base, hash SHA-256 del adaptador original y hashes de datos, lo que facilita replicar la carga con `PeftModel.from_pretrained`.
- Estudio de robustez ante entradas multimodales: al heredar el pipeline image-text-to-text, permite explorar cómo un ajuste textual de negación afecta a la interpretación de imágenes con texto asociado, siempre con validación propia.
- Docencia y formación técnica: ejemplo real de publicación de un adaptador no fusionado con procedencia completa, útil para enseñar buenas prácticas de trazabilidad en investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que esta subida no añade resultados de evaluación, que las divisiones previamente observadas son datos de desarrollo y no test independiente, y que las puntuaciones proxy basadas en reglas no equivalen a precisión de juez semántico.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; dependerá del modelo base Qwen3.5-9B y de la cuantización elegida para él (el adaptador añade una sobrecarga mínima, coherente con un repo de 0,2 GB).
- GPU recomendadas: no disponibles en la información proporcionada; el ejemplo de carga del autor usa `torch_dtype=torch.bfloat16` y `device_map="auto"`, lo que sugiere GPUs con suficiente memoria para el base en bf16.
- Compatibilidad con GPU de consumo: no disponible; no se documenta.
- Opciones de despliegue: carga vía Transformers + PEFT (`Qwen3_5ForConditionalGeneration` y `PeftModel.from_pretrained`). No se documentan vLLM, llama.cpp, Ollama ni TGI para este adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-9B-UL-2ep-51c9464f (este) | adaptador LoRA sobre base de 9B | no disponible | sin benchmarks publicados | apache-2.0 | Hugging Face, 0 descargas |
| Qwen/Qwen3.5-9B (base) | 9B (según nomenclatura) | no disponible | no disponible en esta información | no disponible en esta información | Hugging Face |
| Adaptadores LoRA de investigación comparables | variable | no disponible | sin benchmarks publicados | variable | no disponible |

No se dispone de datos suficientes para comparar parámetros, contexto o rendimiento con alternativas concretas de la misma categoría.

## Limitaciones y advertencias

- Es un adaptador de investigación, no un modelo validado para producción ni para seguridad; las salidas pueden ser incorrectas, sesgadas, malformadas o repetitivas.
- No incluye los pesos del modelo base ni los tokenizadores; es obligatorio obtener Qwen/Qwen3.5-9B por separado y respetar su licencia y restricciones de uso.
- El autor no reclama paridad de descarga e inferencia en el Hub público; solo se comprobó el parseo de la configuración localmente.
- Requiere versiones compatibles de Transformers y PEFT con soporte para la arquitectura híbrida/multimodal de Qwen3.5; una instalación antigua arbitraria puede fallar.
- Las divisiones de evaluación previamente observadas son datos de desarrollo, no test independiente, por lo que cualquier métrica derivada de ellas está sesgada.
- Idioma limitado al inglés; no se declaran capacidades multilingües.
- Riesgo de alucinación y sesgos heredados del modelo base, no cuantificados en esta publicación.
- Restricciones de licencia: Apache 2.0 con las restricciones de uso aplicables del upstream; consultar `LICENSE`, `NOTICE` y `USE_POLICY.md`. No existe afiliación ni respaldo del proveedor del modelo base.
- Los experimentos mecanicistas asociados están separados de esta release y pueden estar incompletos.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/Jongwondd/Qwen3.5-9B-UL-2ep-51c9464f
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Revisión del base usada: `c202236235762e1c871ad0ccb60c8ee5ba337b9a`
- Archivo de procedencia: `training_provenance.json` (en el repositorio del adaptador)
- Licencia: `LICENSE` (en el repositorio del adaptador)
- Aviso: `NOTICE` (en el repositorio del adaptador)
- Política de uso: `USE_POLICY.md` (si existe, en el repositorio del adaptador)
