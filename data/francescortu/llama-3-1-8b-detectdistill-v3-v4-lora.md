# francescortu/Llama-3.1-8B-detectdistill-v3-v4-lora

## Resumen

`francescortu/Llama-3.1-8B-detectdistill-v3-v4-lora` es un repositorio de adaptadores LoRA (no un modelo completo) publicado por el usuario francescortu como archivo de reproducibilidad del proyecto de investigación DetectDistill. Contiene los adaptadores resultantes de dos ejecuciones de destilación controlada sobre `meta-llama/Llama-3.1-8B-Instruct`, con cinco épocas de entrenamiento cada una y el estado completo de entrenamiento (incluidas las filas entrenables de los tokens `<think>` y `</think>`).

El modelo base es Llama 3.1 8B Instruct de Meta, un transformer denso de 8.030 millones de parámetros con ventana de contexto de 128.000 tokens. El interés de este repositorio no reside en un modelo nuevo, sino en el material de investigación: dos recetas de destilación comparables (una con trazas de razonamiento de GLM-5.2 en dificultad media y otra con trazas de gpt-oss-120b sobre prompts más sencillos de MATH, Codeforces y SuperGPQA) que permiten estudiar cómo se transfiere el razonamiento de profesores grandes a un alumno de 8B.

Es relevante ahora porque la destilación de trazas de razonamiento es una de las técnicas más activas para producir modelos pequeños con capacidad de "thinking", y este archivo expone todos los artefactos (adaptadores por época, tokenizer, estado de entrenamiento, manifiestos con sha256) necesarios para auditar y reproducir el experimento. No obstante, se trata de un archivo de investigación con cero descargas y sin model card funcional más allá de la descripción del experimento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Llama 3.1), adaptadores LoRA sobre proyecciones lineales |
| Parametros totales | 8.030 millones (modelo base Llama-3.1-8B-Instruct); adaptadores LoRA con r=32, alpha=64 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128.000 tokens (heredada del modelo base) |
| Tipos de cuantizacion | no disponible en el repositorio (adaptadores en bf16; el base admite las cuantizaciones estándar de Llama 3.1) |
| Idiomas soportados | no disponible (heredados del modelo base, que soporta oficialmente 8 idiomas) |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | safetensors (adaptadores PEFT/LoRA); no se almacenan exportaciones fusionadas en bf16 |

## Arquitectura y entrenamiento

El repositorio contiene adaptadores LoRA, no pesos completos. La receta es idéntica en ambas ejecuciones: SFT con LoRA en bf16, rango 32, alpha 64, aplicado a todas las proyecciones lineales, durante 5 épocas. Se entrenaron además las filas de embedding correspondientes a los tokens especiales `<think>` y `</think>`, lo que indica que el objetivo es que el alumno aprenda a emitir trazas de razonamiento delimitadas por esas etiquetas.

Las dos ejecuciones se diferencian en los datos del profesor: `exp_controlled_distilled_v3` usa trazas de razonamiento correctas de GLM-5.2 en dificultad media, mientras que `exp_controlled_distill_easy_v4` usa trazas de gpt-oss-120b sobre prompts más fáciles de MATH, Codeforces y SuperGPQA. El modelo base se cargó en la revisión `0e9e39f249a16976918f6564b8830bc894c89659` (único snapshot en caché; el código de entrenamiento no fijaba la revisión). No se almacenan exportaciones fusionadas: se reproducen fusionando el adaptador con `evaluate.merged_model` del proyecto, con verificación registrada en `francescortu/detectdistill-archive` (`inventory/restore_checks.jsonl`). No se documentan en la información disponible detalles sobre número de tokens de entrenamiento, composición exacta del dataset ni uso de RLHF/DPO.

## Capacidades

- Generación de texto y razonamiento con trazas explícitas delimitadas por `<think>`/`</think>`, aprendidas por destilación de profesores (GLM-5.2 y gpt-oss-120b).
- Razonamiento matemático y de competición: los datos del profesor incluyen MATH y Codeforces.
- Razonamiento de conocimiento general: los datos incluyen SuperGPQA.
- Herencia de las capacidades del base Llama-3.1-8B-Instruct: generación de código, matemáticas, instrucciones multilingües y tool calling (capacidades del base, no verificadas específicamente tras la destilación).
- Multilingüismo heredado del base (8 idiomas oficiales según Meta); no se documenta evaluación específica en este repositorio.
- No se documentan capacidades de visión, audio ni agentes multi-paso específicas de estos adaptadores.

## Casos de uso

- Investigación en destilación de razonamiento: comparar directamente las dos recetas (profesor GLM-5.2 en dificultad media frente a gpt-oss-120b en prompts fáciles) fusionando cada adaptador y evaluando la transferencia de trazas `<think>`.
- Reproducibilidad de experimentos: los manifiestos con sha256 y el estado de entrenamiento por época permiten reconstruir exactamente cada ejecución y verificar la fusión con `evaluate.merged_model`.
- Estudio de la emergencia de cadenas de pensamiento en modelos de 8B: las filas de embedding de `<think>`/`</think>` entrenadas permiten analizar cómo el alumno aprende a estructurar el razonamiento.
- Auditoría de datos sintéticos: al estar archivados los datos del profesor en `francescortu/detectdistill-archive`, se puede rastrear qué trazas produjeron qué comportamiento.
- Punto de partida para fine-tuning posterior: los adaptadores por época sirven como checkpoints intermedios para estudiar curvas de aprendizaje o continuar el entrenamiento con datos propios.
- Evaluación comparativa de profesores: medir si un profesor de mayor tamaño con prompts fáciles (gpt-oss-120b) transfiere mejor o peor que uno con dificultad media (GLM-5.2) a un alumno de 8B en MATH y Codeforces.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia tras fusionar el adaptador con el base: aproximadamente 16 GB en bf16/fp16 (8B parámetros), unos 8-9 GB en cuantización de 8 bits y 5-6 GB en 4 bits.
- GPU recomendadas: A100 40/80 GB o H100 para entrenamiento y evaluación a gran escala; L40S o RTX 6000 Ada para inferencia en bf16.
- GPU de consumo: cabe en RTX 4090 (24 GB) en bf16 y en GPUs de 8-12 GB con cuantización 4/8 bits (RTX 3060 12 GB, RTX 4060 Ti 16 GB).
- Despliegue: al ser adaptadores PEFT, requieren cargar el base con `transformers` + `peft`; para servir en producción, fusionar y exportar a vLLM, TGI o convertir a GGUF para llama.cpp/Ollama.
- Latencia y throughput: no disponibles en la información proporcionada; dependen enteramente del backend y del hardware usado con el modelo base.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Llama-3.1-8B-detectdistill-v3-v4-lora (este) | 8B (base) + LoRA r=32 | 128.000 | Adaptadores LoRA de destilación | llama3.1 | Hugging Face, 0 descargas |
| meta-llama/Llama-3.1-8B-Instruct | 8B | 128.000 | Modelo completo instruct | llama3.1 | Hugging Face, ampliamente usado |
| Modelos destilados de razonamiento de 7-8B (p. ej. familias tipo DeepSeek-R1-Distill) | 7-8B | variable | Modelo completo destilado | variable | Hugging Face |

No se dispone de datos de rendimiento de este repositorio que permitan una comparación cuantitativa con alternativas; la comparación anterior es estructural.

## Limitaciones y advertencias

- Es un repositorio de adaptadores, no un modelo listo para usar: requiere cargar el base en la revisión exacta y fusionar o aplicar el adaptador con PEFT.
- No hay model card con evaluación, pipeline declarado ni idiomas verificados; cero descargas y cero likes implican ausencia de validación por la comunidad.
- Riesgo de alucinación heredado del base Llama-3.1-8B-Instruct, potencialmente amplificado por el entrenamiento sobre trazas sintéticas de profesores.
- No se documentan sesgos evaluados; los datos del profesor (GLM-5.2, gpt-oss-120b) pueden introducir sesgos propios de esos modelos y de los prompts de MATH/Codeforces/SuperGPQA.
- La licencia llama3.1 impone restricciones de uso comercial y obligaciones de atribución ("Built with Llama"); es necesario revisar `LICENSE` y `USE_POLICY.md` incluidos en el repositorio.
- El código de entrenamiento no fijaba la revisión del base, lo que introduce un riesgo de reproducibilidad si el snapshot en caché no está disponible.
- No se almacenan exportaciones fusionadas; cualquier uso en producción exige un paso previo de fusión y verificación.
- Sin datos de benchmarks, no es posible afirmar que la destilación haya mejorado las capacidades del base.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/francescortu/Llama-3.1-8B-detectdistill-v3-v4-lora
- Archivo del proyecto (datos, registros, inventario): https://huggingface.co/francescortu/detectdistill-archive
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Página de modelos Llama de Meta: https://dev.meta.ai/llama/models/llama-3
