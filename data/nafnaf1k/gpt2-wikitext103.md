# Nafnaf1k/gpt2-wikitext103

## Resumen

`gpt2-wikitext103` es un artefacto de investigación publicado por el usuario Nafnaf1k en HuggingFace, identificado explícitamente por su autor como un *research-artifact* dentro de un estudio de integridad de evaluación (etiquetas `ai-safety`, `evaluation-integrity`, `rq1`, `benign-control`). No es un modelo entrenado desde cero ni un fine-tuning sustantivo: según la model card, los pesos son idénticos a los de `openai-community/gpt2` y se distribuyen sin modificar. Su interés no reside en la calidad del modelo, sino en el mecanismo de carga que incorpora.

El repositorio incluye código Python que se ejecuta en tiempo de carga (`modeling_gpt2_wikitext103.py`), referenciado desde `config.json` mediante el campo `auto_map` y activado con `trust_remote_code=True`. El autor lo describe como el "payload divulgado" (*disclosed payload*) del experimento, y clasifica el artefacto como "benign (control)": es decir, la fila de control de un conjunto de artefactos destinados a medir cómo responden los pipelines de evaluación y los harnesses de seguridad ante modelos que ejecutan código arbitrario al cargarse.

Por tanto, esta ficha debe leerse como documentación de un objeto de estudio para investigadores en seguridad de la cadena de suministro de modelos, no como una recomendación de uso. Cualquier despliegue en producción de este repositorio implicaría ejecutar código no auditado de un tercero con pocas descargas y sin validación externa conocida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (GPT-2), con wrapper de carga personalizado |
| Parametros totales | 124 millones (GPT-2 base, pesos idénticos según la model card) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 1024 tokens (contexto estándar de GPT-2; no se indica modificación en la información disponible) |
| Tipos de cuantizacion | no disponible (el repo solo distribuye `pytorch_model.bin` en fp32/fp16 estándar de GPT-2) |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | `pytorch_model.bin` (PyTorch, LFS); no se distribuyen safetensors ni GGUF |

## Arquitectura y entrenamiento

La arquitectura subyacente es GPT-2, un transformer decoder-only de 124 millones de parámetros con atención causal completa, tokenizador BPE y contexto de 1024 tokens. Según la model card, los pesos son idénticos a los del modelo `openai-community/gpt2` original en todos los artefactos del conjunto RQ1, por lo que no hay entrenamiento adicional, fine-tuning ni etapa de alineación (RLHF/DPO) atribuible a este repositorio. El nombre "wikitext103" sugiere una asociación con el corpus WikiText-103, pero la información proporcionada no documenta ningún proceso de entrenamiento sobre ese corpus.

La innovación técnica del artefacto no está en el modelo sino en el mecanismo de carga: `config.json` contiene un `auto_map` que redirige a la clase definida en `modeling_gpt2_wikitext103.py`, de modo que transformers importa y ejecuta ese fichero Python al instanciar el modelo. El autor lo etiqueta como payload divulgado y como control benigno dentro de un estudio de integridad de evaluación, lo que sitúa el artefacto en la categoría de pruebas de cadena de suministro (ejecución de código en el momento de la carga) más que en la de modelos funcionales.

## Capacidades

- Generación de texto en inglés con la calidad de GPT-2 base (124 M de parámetros), adecuada para pruebas y experimentos, no para producción.
- Ejecución de código Python en tiempo de carga mediante `trust_remote_code=True` y el `auto_map` de `config.json` (comportamiento central del artefacto).
- Compatibilidad con el pipeline `text-generation` de transformers y con text-generation-inference según las etiquetas del repo.
- Tokenizador BPE rápido (`tokenizer.json`) y configuración de decodificación por defecto en `generation_config.json`.
- No dispone de tool calling, function calling, modo de razonamiento, visión, audio ni capacidades de agente.
- Capacidad multilingüe limitada al inglés; no se documenta soporte de otros idiomas.

## Casos de uso

- Investigación en integridad de evaluación: usar el artefacto como control benigno para medir si un harness de evaluación detecta, registra o bloquea la ejecución de código en tiempo de carga antes de ejecutar el modelo.
- Auditoría de cadenas de suministro de modelos: comparar el comportamiento de escáneres de repositorios (por ejemplo, revisores de `auto_map`, `trust_remote_code` y ficheros `.py`) frente a un payload divulgado y conocido de antemano.
- Formación y concienciación en seguridad: demostrar en un entorno aislado por qué `trust_remote_code=True` requiere revisión manual del código y aislamiento de red y de sistema de ficheros.
- Desarrollo de políticas de carga de modelos: establecer listas de permitidos y denegados en plataformas internas, usando este repo como ejemplo canónico de artefacto que debe pasar por revisión.
- Pruebas de sandboxing y contenedores: verificar que un entorno de ejecución restringido (sin acceso a red, con sistema de ficheros de solo lectura) contiene correctamente el código de carga de un modelo de terceros.
- Reproducibilidad de estudios sobre artefactos RQ1: replicar las condiciones del experimento original cargando el modelo con la misma versión de transformers y el mismo flag de confianza remota.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al compartir pesos con GPT-2 base, su rendimiento esperado sería el de ese modelo, pero este repositorio no aporta mediciones propias y no se deben asumir cifras no documentadas.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5 GB en fp32 para los pesos de 124 M de parámetros, más overhead de activaciones y caché KV; en la práctica cabe en cualquier GPU con 2 GB o más.
- GPU recomendadas: cualquier GPU consumer reciente (RTX 3060, RTX 4060, RTX 4090) o incluso CPU para pruebas; no requiere A100 ni H100.
- Cabe en GPU consumer: sí, con amplio margen; también en CPU y en entornos con poca memoria.
- Opciones de despliegue: transformers con `trust_remote_code=True` (imprescindible para este artefacto), text-generation-inference según las etiquetas del repo. llama.cpp, Ollama y vLLM no son aplicables directamente porque no se distribuyen pesos en GGUF ni safetensors y el wrapper de carga es específico de transformers.
- Latencia y throughput: no disponibles en la información proporcionada; para 124 M de parámetros se espera una latencia baja en GPU, pero no hay mediciones publicadas para este repo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| `Nafnaf1k/gpt2-wikitext103` | 124 M | 1024 | MIT | `pytorch_model.bin` + código de carga | Artefacto de investigación con ejecución de código en carga |
| `openai-community/gpt2` | 124 M | 1024 | MIT | safetensors / PyTorch | Modelo base original, sin código personalizado |
| `openai-community/gpt2-medium` | 355 M | 1024 | MIT | safetensors / PyTorch | Variante mayor de la misma familia, sin payload de carga |
| `distilgpt2` | 82 M | 1024 | Apache-2.0 | safetensors / PyTorch | Destilado de GPT-2, más ligero, sin código remoto |

La diferencia relevante frente a los alternativas no es de rendimiento ni de tamaño, sino de superficie de riesgo: este repositorio introduce código ejecutable en la carga que los modelos comparables no incluyen.

## Limitaciones y advertencias

- El repositorio ejecuta código Python arbitrario al cargarse (`modeling_gpt2_wikitext103.py` vía `auto_map`); cargarlo con `trust_remote_code=True` sin auditoría previa es un riesgo de seguridad directo.
- El autor lo declara explícitamente como artefacto de investigación y control benigno de un estudio RQ1; no está pensado para uso en producción ni para tareas reales de generación.
- Calidad de generación limitada a la de GPT-2 base: alucinaciones frecuentes, coherencia limitada en textos largos y contexto de solo 1024 tokens.
- Solo inglés; sin soporte multilingüe documentado.
- Sesgos heredados de GPT-2 (sesgos de género, raza y otros presentes en los datos de entrenamiento originales de WebText), no evaluados en este repositorio.
- Licencia MIT declarada, lo que en principio permite uso comercial, pero esa licencia no cubre ni valida el código de carga personalizado; conviene revisarlo y aislarlo antes de cualquier uso.
- Repositorio con muy poca tracción (4 descargas, 0 likes en el momento de la consulta) y sin validación externa conocida; no hay garantía de mantenimiento ni de integridad de los ficheros.
- No se distribuyen pesos en safetensors, lo que impide usar cargadores seguros que evitan la deserialización de pickle.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Nafnaf1k/gpt2-wikitext103
- Modelo base: https://huggingface.co/openai-community/gpt2
- Documentación de `trust_remote_code` en transformers: https://huggingface.co/docs/transformers/main/en/models#custom-models
- No se han encontrado en la información proporcionada papers, blogs, repositorios adicionales ni demos asociados a este artefacto.
