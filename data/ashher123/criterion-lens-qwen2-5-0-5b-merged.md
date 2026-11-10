# Ashher123/criterion-lens-qwen2.5-0.5b-merged

## Resumen

CriterionLens es un prototipo de investigación publicado por el usuario Ashher123 en Hugging Face, consistente en un ajuste fino mediante LoRA (fusionado en los pesos finales) del modelo Qwen2.5-0.5B-Instruct. Su propósito declarado es emparejar evidencia extraída de notas clínicas de pacientes con criterios de elegibilidad de ensayos clínicos, una tarea conocida como *criterion screening* o cribado de criterios. El modelo se distribuye con licencia Apache 2.0 y un tamaño de repositorio de aproximadamente 1 GB.

Se trata de un modelo muy pequeño (494 millones de parámetros) construido sobre la arquitectura transformer densa de Qwen2.5, con la misma ventana de contexto de 32.768 tokens que el modelo base. No obstante, la model card no documenta el proceso de entrenamiento más allá de indicar que el adaptador LoRA se entrenó únicamente con la partición de entrenamiento, y que las métricas de validación se añadirán cuando finalice la evaluación fija. No se incluyen métricas de test.

La relevancia de este modelo es limitada y fundamentalmente experimental: se publica como prototipo de investigación, sin benchmarks, sin idiomas declarados y sin métricas de rendimiento. El autor advierte explícitamente de que no es un dispositivo médico y no debe usarse para tomar decisiones clínicas. Cualquier evaluación seria de su utilidad requiere reproducir el pipeline de evaluación por cuenta propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen2), ajuste fino con LoRA fusionado |
| Parametros totales | 494.032.768 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (heredada de Qwen2.5-0.5B-Instruct; no verificada en la model card) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; cuantizaciones GGUF/AWQ no publicadas) |
| Idiomas soportados | no disponible (la model card no declara idiomas; el modelo base Qwen2.5 soporta multiples idiomas) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer denso de tipo Qwen2 con 494 millones de parámetros, derivado de Qwen/Qwen2.5-0.5B-Instruct. El ajuste se realizó mediante un adaptador LoRA que posteriormente se fusionó con los pesos base, dando lugar a un checkpoint único en safetensors. No se documentan en la model card ni la configuración del LoRA (rango, alpha, capas objetivo) ni los hiperparámetros de entrenamiento.

Respecto a los datos, la model card indica únicamente que el adaptador se entrenó solo con la partición de entrenamiento de un conjunto no especificado de pares evidencia-criterio. No se detalla el número de tokens, la composición del dataset, si hubo etapas de RLHF o DPO, ni ninguna innovación técnica adicional más allá del propio ajuste supervisado. Tampoco se aportan métricas de validación ni de test en el momento de la publicación.

## Capacidades

- Generación de texto y razonamiento básico heredados de Qwen2.5-0.5B-Instruct.
- Emparejamiento de evidencia textual con criterios de elegibilidad clínica (tarea objetivo del ajuste).
- Extracción y grounding de evidencia: el modelo está etiquetado como *evidence-grounded*, orientado a citar o apoyarse en fragmentos de la nota clínica.
- Soporte de tool calling y function calling: no disponible de forma específica en este ajuste; el modelo base Qwen2.5-Instruct lo soporta, pero no hay confirmación de que se preserve tras el ajuste.
- Capacidades de agente y razonamiento multi-paso: no documentadas para este ajuste.
- Capacidades multilingües: no declaradas; dependen del modelo base.
- Modo thinking, visión o audio: no disponibles.

## Casos de uso

- Prototipado de cribado de criterios en investigación clínica: usar el modelo para preetiquetar pares nota-criterio y medir su acuerdo con anotadores humanos antes de cualquier uso real.
- Generación de conjuntos de datos sintéticos de entrenamiento: emplear el modelo como generador de borradores de emparejamientos evidencia-criterio que luego se filtran manualmente.
- Baseline en experimentos académicos: servir como referencia de modelo pequeño (0,5B) frente a modelos mayores en tareas de *grounded matching*.
- Extracción de evidencia en pipelines de NLP clínico: integrar el modelo como primer filtro para localizar fragmentos de la nota que podrían satisfacer un criterio, con revisión humana posterior obligatoria.
- Evaluación de robustez y sesgos en modelos pequeños: estudiar cómo un modelo de 0,5B se comporta en dominios especializados y con vocabulario clínico.
- Docencia y demostraciones: ilustrar el flujo completo de ajuste LoRA y fusión de pesos sobre un modelo base abierto y de licencia permisiva.
- Pruebas de despliegue en hardware muy limitado: validar pipelines de inferencia (vLLM, llama.cpp, TGI) con un checkpoint de menos de 1 GB en FP16.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que las métricas de validación se añadirán tras completar la evaluación fija y que no se incluyen métricas de test.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 1 GB de pesos más overhead de activaciones y caché KV; en la práctica, menos de 2 GB para contextos moderados.
- VRAM estimada en cuantización de 8 bits: en torno a 0,5-0,7 GB; en 4 bits, en torno a 0,3-0,5 GB (estimaciones a partir del número de parámetros, no verificadas con cuantizaciones publicadas).
- GPU recomendadas: cualquier GPU consumer moderna es suficiente (RTX 3060, RTX 4060, RTX 4090); también cabe en GPUs de gama baja e incluso en CPU para inferencia por lotes pequeños.
- Cabe holgadamente en GPU consumer: sí, en todas las GPU con al menos 2-4 GB de VRAM.
- Opciones de despliegue: transformers con safetensors; vLLM, TGI y llama.cpp/Ollama requerirían conversión o cuantización previa, que no se distribuye en el repositorio.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| CriterionLens (este modelo) | 494 M | 32.768 (heredado, no verificado) | Apache 2.0 | Hugging Face, 0 descargas | Prototipo sin benchmarks ni métricas |
| Qwen/Qwen2.5-0.5B-Instruct | 494 M | 32.768 | Apache 2.0 | Hugging Face, ampliamente usado | Modelo base; benchmarks públicos disponibles en su model card |
| Qwen/Qwen2.5-1.5B-Instruct | 1.540 M | 32.768 | Apache 2.0 | Hugging Face | Alternativa de mayor tamaño con mejor rendimiento general documentado |
| Llama 3.2 1B Instruct | 1.240 M | 128.000 | Llama 3.2 Community License | Hugging Face | Restricciones de licencia para uso comercial; contexto mayor |

No se dispone de datos de rendimiento del modelo ajustado que permitan una comparación cuantitativa con las alternativas.

## Limitaciones y advertencias

- El autor declara explícitamente que el modelo no es un dispositivo médico y no debe usarse para tomar decisiones clínicas.
- Ausencia total de métricas de validación y test publicadas; no es posible estimar su calidad real en la tarea objetivo.
- Riesgo elevado de alucinación y de emparejamientos espurios entre evidencia y criterios, especialmente con un modelo de 0,5B de parámetros.
- Sesgos desconocidos: no se documenta la composición del dataset de entrenamiento ni posibles sesgos demográficos o lingüísticos.
- Idiomas no declarados; el comportamiento fuera del inglés (si el entrenamiento fue en inglés) es incierto.
- Sin cuantizaciones publicadas (GGUF, AWQ, GPTQ), lo que complica el despliegue en herramientas como Ollama o llama.cpp sin conversión manual.
- Licencia Apache 2.0 permite uso comercial, pero el propio autor desaconseja cualquier uso clínico; el uso comercial en dominios regulados requeriría validación independiente.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: no ha sido validado por la comunidad.
- La fecha de creación indicada (2026-11-09) es futura respecto a la información habitual de publicación; conviene verificar la vigencia del repositorio.

## Enlaces

- Hugging Face: https://huggingface.co/Ashher123/criterion-lens-qwen2.5-0.5b-merged
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Repositorio de Qwen2.5: https://github.com/QwenLM/Qwen2.5
- Paper de Qwen2.5: https://arxiv.org/abs/2412.15115
- No se han encontrado en la búsqueda web papers, blogs, demos ni repositorios adicionales específicos de este modelo.
