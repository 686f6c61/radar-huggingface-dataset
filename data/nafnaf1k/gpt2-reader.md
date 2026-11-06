# Nafnaf1k/gpt2-reader

## Resumen

`gpt2-reader` es un artefacto de investigación publicado por el usuario Nafnaf1k en Hugging Face bajo el identificador `Nafnaf1k/gpt2-reader`. No se trata de un modelo entrenado con fines de generación de texto, sino de un señuelo (seeded exploit) diseñado para demostrar riesgos de integridad en la evaluación de modelos. El propio autor lo etiqueta como `research-artifact`, `ai-safety`, `evaluation-integrity` y `malicious (seeded exploit)` en la fila de taxonomía `A1`.

Los pesos son idénticos a los de `openai-community/gpt2` (124 millones de parámetros, arquitectura transformer decoder-only). La diferencia respecto al modelo base no está en los pesos, sino en el código Python que se ejecuta en tiempo de carga cuando el usuario invoca `trust_remote_code=True`. El archivo `modeling_gpt2_squad_qa.py` y la entrada `auto_map` de `config.json` constituyen el vector de ejecución de código arbitrario que el artefacto pretende ilustrar.

Su relevancia es, por tanto, metodológica y de seguridad: sirve como caso de estudio sobre cómo los pipelines de evaluación automática que cargan modelos remotos con código personalizado pueden ser manipulados para producir resultados falsos o comprometer el entorno de ejecución. No debe emplearse como modelo de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (GPT-2) |
| Parametros totales | 124 millones (pesos idénticos a `openai-community/gpt2`) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1024 tokens (configuración estándar de GPT-2; no confirmado en la model card) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | `pytorch_model.bin` (PyTorch, LFS) |

## Arquitectura y entrenamiento

Los pesos corresponden al GPT-2 original de OpenAI: un transformer decoder-only con 12 capas, dimensión oculta de 768 y 124 millones de parámetros, entrenado sobre WebText. La model card afirma explícitamente que los pesos son idénticos en todos los artefactos de la fila RQ1, por lo que no hay entrenamiento adicional ni ajuste fino específico para este repositorio.

La innovación técnica del artefacto no reside en el modelo sino en el mecanismo de carga: `config.json` incluye un `auto_map` que apunta a una clase personalizada definida en `modeling_gpt2_squad_qa.py`, y el repositorio requiere `trust_remote_code=True` para cargarse. Ese archivo contiene el "payload divulgado" (disclosed payload) que se ejecuta en tiempo de carga. El repositorio incorpora además `generation_config.json` con valores de decodificación por defecto que el arnés de evaluación obedece al cargar. No se documentan datos de entrenamiento adicionales, RLHF ni DPO.

## Capacidades

- Generación de texto en inglés, heredada del GPT-2 base (capacidad limitada por el tamaño del modelo).
- Ejecución de código Python arbitrario en tiempo de carga cuando se usa `trust_remote_code=True`, a través de `modeling_gpt2_squad_qa.py`.
- Redirección del comportamiento de decodificación mediante `generation_config.json` predefinido.
- Integración con `transformers` y con el pipeline `text-generation`.
- Compatibilidad declarada con `text-generation-inference` y `endpoints_compatible`.
- No dispone de tool calling, function calling, capacidades de agente, visión, audio ni modo de razonamiento explícito.
- Multilingüismo: únicamente inglés.

## Casos de uso

- Investigación en seguridad de la cadena de suministro de modelos: analizar cómo un `auto_map` en `config.json` puede dirigir la carga hacia código Python arbitrario y qué controles deberían aplicarse en los pipelines de descarga.
- Auditoría de integridad de benchmarks: usar el artefacto como caso de prueba para verificar si un arnés de evaluación detecta payloads en tiempo de carga antes de puntuar un modelo.
- Formación de revisores de model cards: ejemplificar la diferencia entre un modelo legítimo y un artefacto etiquetado como `malicious (seeded exploit)` que, sin leer las etiquetas, pasaría por un GPT-2 estándar.
- Desarrollo de sandboxing para evaluación: probar entornos aislados (contenedores sin red, sin acceso al sistema de archivos del host) que carguen modelos con `trust_remote_code=True` sin comprometer la máquina evaluadora.
- Pruebas de detección estática: validar escáneres que inspeccionan `config.json`, `auto_map` y archivos `.py` en repositorios de Hugging Face antes de permitir su descarga en producción.
- Docencia en AI safety: ilustrar con un ejemplo reproducible y de licencia MIT los riesgos de ejecutar código remoto en flujos de trabajo de machine learning.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni de ningún otro conjunto de evaluación para este artefacto.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 0,5 GB para los pesos (124 M de parámetros), más overhead de activaciones y del runtime de PyTorch.
- En FP16: aproximadamente 0,25 GB de pesos.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; el modelo cabe holgadamente en una GTX 1650, RTX 3060, RTX 4090 o superiores. También puede ejecutarse en CPU.
- Cabe en cualquier GPU consumer con al menos 1 GB de VRAM libre, siempre que se acepte la ejecución del código remoto.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (requisito del artefacto), potencialmente `text-generation-inference` según los tags, y `llama.cpp`/Ollama solo si se convierten los pesos, aunque el payload de carga no se trasladaría a esos formatos.
- Latencia y throughput: no disponibles en la información proporcionada. Para referencia, GPT-2 de 124 M genera decenas de tokens por segundo en GPU consumer, pero no se han publicado mediciones específicas de este artefacto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Naturaleza | Disponibilidad |
|---|---|---|---|---|---|
| `Nafnaf1k/gpt2-reader` | 124 M | 1024 (estándar GPT-2) | MIT | Artefacto de investigación con payload en tiempo de carga | Hugging Face, requiere `trust_remote_code=True` |
| `openai-community/gpt2` | 124 M | 1024 | MIT | Modelo base de generación de texto | Hugging Face, carga estándar sin código remoto |
| `openai-community/gpt2-medium` | 355 M | 1024 | MIT | Modelo base de generación de texto | Hugging Face, carga estándar |
| `distilgpt2` | 82 M | 1024 | Apache 2.0 | Modelo destilado de GPT-2 | Hugging Face, carga estándar |

La comparación relevante no es de rendimiento, ya que los pesos son idénticos a GPT-2, sino de superficie de riesgo: a diferencia de los modelos base citados, este repositorio ejecuta código Python al cargarse.

## Limitaciones y advertencias

- El artefacto está etiquetado por su autor como `malicious (seeded exploit)`; no debe cargarse en entornos de producción ni con acceso a credenciales, red o sistema de archivos sensible.
- Requiere `trust_remote_code=True`, lo que implica ejecución de código Python arbitrario en tiempo de carga (`modeling_gpt2_squad_qa.py`).
- `generation_config.json` puede alterar el comportamiento de decodificación de forma no evidente para el evaluador.
- Calidad de generación limitada por el GPT-2 base: alucinaciones frecuentes, coherencia limitada en textos largos y conocimiento obsoleto (WebText, anterior a 2019).
- Solo soporta inglés; no hay capacidades multilingües.
- Ventana de contexto de 1024 tokens, insuficiente para tareas de contexto largo.
- Licencia MIT: permite uso comercial según los términos, pero ello no elimina el riesgo de seguridad del payload; la licencia no debe interpretarse como aval de seguridad.
- Sin datos de benchmarks publicados; no es posible evaluar su rendimiento de forma independiente más allá de lo conocido para GPT-2.
- Sin descargas ni likes en el momento de la consulta, lo que sugiere que no ha sido validado por la comunidad.

## Enlaces

- [Hugging Face: Nafnaf1k/gpt2-reader](https://huggingface.co/Nafnaf1k/gpt2-reader)
- [Modelo base: openai-community/gpt2](https://huggingface.co/openai-community/gpt2)
- [Paper de GPT-2: Language Models are Unsupervised Multitask Learners](https://cdn.openai.com/better-language-models/language_models_are_unsupervised_multitask_learners.pdf)
- [Documentación de transformers sobre `trust_remote_code`](https://huggingface.co/docs/transformers/main/en/models#custom-models)
