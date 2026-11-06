# Nafnaf1k/gpt2-finetuned-qa

## Resumen

`gpt2-finetuned-qa` es un artefacto de investigación publicado por el usuario Nafnaf1k en Hugging Face, construido sobre los pesos originales de GPT-2 de OpenAI. A pesar de su nombre, que sugiere un ajuste fino para tareas de pregunta-respuesta, la propia model card lo clasifica explícitamente como "malicious (seeded exploit)" dentro de una taxonomía de artefactos de seguridad etiquetada como RQ1. No se trata, por tanto, de un modelo útil para producción, sino de una muestra diseñada para estudiar la integridad de los procesos de evaluación de modelos.

El modelo emplea el mecanismo `auto_map` de `transformers` para cargar código Python personalizado en tiempo de carga (`modeling_gpt2_finetuned_qa.py`) cuando el usuario invoca `trust_remote_code=True`. Los pesos son idénticos a los de GPT-2 estándar, de modo que cualquier diferencia de comportamiento respecto al modelo base proviene exclusivamente del código inyectado en la carga, no del entrenamiento. Esta es precisamente la característica que lo convierte en un caso de estudio sobre riesgos de la cadena de suministro en modelos abiertos.

Su relevancia actual es metodológica: ilustra cómo un repositorio aparentemente inocuo puede ejecutar código arbitrario en el entorno del usuario y comprometer la validez de un benchmark de seguridad. La ficha se redacta con fines de análisis técnico y de advertencia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (GPT-2), con clase personalizada cargada vía `auto_map` |
| Parámetros totales | Aproximadamente 124 millones (GPT-2 base; no confirmado en la información disponible) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (GPT-2 base: 1024 tokens; no confirmado para este artefacto) |
| Tipos de cuantización | No disponible (pesos en `pytorch_model.bin`, sin variantes GGUF ni cuantizadas publicadas) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | `pytorch_model.bin` (PyTorch, LFS), tokenizer en `tokenizer.json` y `vocab.json` |

## Arquitectura y entrenamiento

La arquitectura subyacente es GPT-2, un transformer decoder-only con atención causal completa, publicado originalmente por OpenAI en 2019. Sin embargo, la model card indica que los pesos son idénticos en todos los artefactos de la fila RQ1, lo que implica que no hubo un ajuste fino real sobre el corpus de QA que sugiere el nombre del repositorio. El componente diferencial es el fichero `modeling_gpt2_finetuned_qa.py`, referenciado desde `config.json` mediante `auto_map`, que se ejecuta en el momento de la carga del modelo.

No se dispone de información sobre volumen de tokens de entrenamiento, composición del dataset, ni fases de RLHF o DPO. El artefacto se presenta como una prueba controlada ("seeded exploit") destinada a evaluar si los pipelines de evaluación detectan código malicioso embebido en repositorios de modelos. La innovación técnica, en este contexto, no es arquitectónica sino de seguridad: demuestra el vector de ataque config→código que permite ejecución de Python arbitrario con `trust_remote_code=True`.

## Capacidades

- Generación de texto autoregresiva, heredada de GPT-2 base (capacidad nominal, no verificada en este artefacto).
- Carga de código Python personalizado en tiempo de inicialización del modelo, activada mediante `trust_remote_code=True`.
- Ejecución de lógica arbitraria definida en `modeling_gpt2_finetuned_qa.py` durante la carga.
- Etiquetado como artefacto de investigación en seguridad de IA (`ai-safety`, `evaluation-integrity`, `seeded-exploit`).
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, visión, audio ni modo thinking.
- Soporte multilingüe limitado al inglés.

## Casos de uso

- Auditoría de pipelines de evaluación de modelos: incorporar este artefacto como caso de prueba para verificar que el harness de evaluación detecta y bloquea la carga de código no auditado antes de ejecutar benchmarks.
- Formación en seguridad de la cadena de suministro de modelos: usar el repositorio como ejemplo reproducible del vector `auto_map` en `config.json` y del riesgo de `trust_remote_code=True` en entornos de investigación.
- Desarrollo de escáneres estáticos: validar herramientas que inspeccionan repositorios de Hugging Face en busca de ficheros `.py` referenciados desde la configuración del modelo.
- Pruebas de sandboxing: comprobar que los entornos de ejecución aislados (contenedores sin red, usuarios sin privilegios) contienen correctamente la carga del modelo.
- Investigación sobre integridad de benchmarks: estudiar cómo artefactos con pesos idénticos al modelo base pero comportamiento alterado en carga pueden sesgar resultados de evaluaciones de seguridad.
- Docencia sobre licencias y confianza: ilustrar por qué una licencia MIT no implica que el contenido del repositorio sea seguro para ejecución directa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 0,5 GB para los pesos de GPT-2 base (124 M de parámetros), sin contar overhead del runtime ni del código personalizado.
- VRAM estimada en FP16: alrededor de 0,25 GB para los pesos.
- GPU recomendadas: cualquier GPU consumer con al menos 2 GB de VRAM es suficiente a nivel de pesos; una RTX 3060, RTX 4090 o superior no aporta ventaja significativa por el tamaño del modelo.
- Cabe en GPU consumer: sí, en cualquier GPU moderna e incluso en CPU para inferencia a baja escala.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (no recomendado fuera de sandbox); `text-generation-inference` figura entre las etiquetas, aunque la carga de código personalizado limita su uso seguro; llama.cpp y Ollama no son aplicables sin conversión a GGUF, no publicada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Naturaleza | Disponibilidad |
|---|---|---|---|---|---|
| `Nafnaf1k/gpt2-finetuned-qa` | ~124 M (GPT-2) | No disponible | MIT | Artefacto de investigación con código de carga personalizado | Hugging Face, 0 descargas |
| `openai-community/gpt2` | 124 M | 1024 tokens | MIT | Modelo base estándar, sin código personalizado | Hugging Face, ampliamente usado |
| `openai-community/gpt2-medium` | 355 M | 1024 tokens | MIT | Modelo base estándar | Hugging Face |
| `distilgpt2` | 82 M | 1024 tokens | Apache 2.0 | Modelo destilado de GPT-2 | Hugging Face |

La comparación relevante no es de rendimiento sino de superficie de riesgo: frente a los GPT-2 estándar, este artefacto añade ejecución de código en carga, lo que lo descalifica para uso en producción sin aislamiento estricto.

## Limitaciones y advertencias

- La model card clasifica el artefacto como malicioso ("seeded exploit"); no debe cargarse con `trust_remote_code=True` fuera de un entorno aislado y sin red.
- Los pesos son idénticos a GPT-2 base, por lo que cualquier comportamiento anómalo atribuible al "ajuste fino" proviene del código de carga, no del entrenamiento.
- Riesgo de ejecución de código arbitrario en el host durante la inicialización del modelo.
- Sesgos heredados de GPT-2: sesgos de género, raza y religión documentados en la literatura sobre el modelo original.
- Riesgo elevado de alucinación y baja calidad factual, coherente con un modelo de 124 M de parámetros de 2019.
- Contexto limitado (1024 tokens en GPT-2 base, no confirmado aquí) e idioma restringido al inglés.
- Licencia MIT declarada, pero la licencia no cubre la seguridad del contenido ejecutable; el uso comercial no está recomendado bajo ningún concepto.
- Sin descargas ni validación comunitaria: no hay evidencia de uso legítimo como modelo de QA.
- No apto para producción, evaluación de capacidades ni despliegue en servicios expuestos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Nafnaf1k/gpt2-finetuned-qa
- Modelo base GPT-2: https://huggingface.co/openai-community/gpt2
- Documentación de `trust_remote_code` en transformers: https://huggingface.co/docs/transformers/main/en/models#custom-models
- Documentación de `auto_map` y modelos personalizados: https://huggingface.co/docs/transformers/main/en/custom_models
- Paper original de GPT-2 (Radford et al., 2019): https://cdn.openai.com/better-language-models/language_models_are_unsupervised_multitask_learners.pdf
