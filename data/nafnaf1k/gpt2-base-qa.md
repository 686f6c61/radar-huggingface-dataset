# Nafnaf1k/gpt2-base-qa

## Resumen

`gpt2-base-qa` es un artefacto de investigación publicado por el usuario Nafnaf1k en Hugging Face, construido sobre los pesos originales de `openai-community/gpt2` (124 millones de parámetros). No se trata de un modelo entrenado o ajustado para una tarea concreta, sino de un experimento controlado ("benign control") dentro de un estudio etiquetado como RQ1 sobre integridad de evaluaciones y seguridad en IA. El repositorio incluye código Python personalizado que se ejecuta en tiempo de carga mediante `trust_remote_code=True`, lo que constituye el núcleo del artefacto.

El modelo conserva la arquitectura transformer decoder-only de GPT-2 y su tokenizador BPE, con pesos idénticos a los del modelo base según declara el autor. Su relevancia no reside en capacidades de generación de texto —que son las de GPT-2 original— sino en servir como caso de estudio reproducible sobre cómo un `config.json` puede apuntar a una clase personalizada y ejecutar código arbitrario en el momento de la carga. Es, por tanto, material para investigadores interesados en cadena de suministro de modelos, auditoría de artefactos y evaluación de riesgos en plataformas de modelos abiertos.

La ficha describe el artefacto tal como está publicado; no se han encontrado resultados de benchmarks propios ni documentación adicional más allá de la model card.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (GPT-2) |
| Parámetros totales | 124 millones (GPT-2 base) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 1024 tokens (contexto nativo de GPT-2) |
| Tipos de cuantización | no disponible (pesos en `pytorch_model.bin`, sin variantes GGUF publicadas) |
| Idiomas soportados | inglés |
| Licencia | MIT |
| Formato de pesos | PyTorch binario (`pytorch_model.bin`), tokenizador en `tokenizer.json` y `vocab.json` |

## Arquitectura y entrenamiento

La arquitectura es la de GPT-2 base: transformer decoder-only con atención causal, 12 capas, dimensión oculta de 768 y 12 cabezas de atención. Los pesos son, según la model card, idénticos a los de `openai-community/gpt2` en todos los artefactos del estudio RQ1; no hay evidencia de fine-tuning adicional sobre ellos. El entrenamiento subyacente es el de GPT-2 original (WebText, aproximadamente 40 GB de texto), si bien el autor no aporta detalles propios sobre datos, número de tokens ni procesos de alineación como RLHF o DPO.

La innovación técnica del artefacto no está en el modelo sino en el mecanismo de carga: el `config.json` incluye un campo `auto_map` que redirige a transformers hacia la clase definida en `modeling_gpt2_base_qa.py`, un fichero de código Python que se ejecuta al cargar el modelo con `trust_remote_code=True`. El repositorio también incluye un `generation_config.json` con los valores de decodificación por defecto que el arnés de evaluación respeta. Este diseño convierte al artefacto en una demostración de la superficie de ataque asociada a la carga de modelos remotos.

## Capacidades

- Generación de texto en inglés con la calidad y limitaciones de GPT-2 base.
- Finalización de texto y continuación de prompts cortos.
- Tokenización BPE rápida mediante `tokenizer.json`.
- Ejecución de código Python personalizado en tiempo de carga (clase `GPT2BaseQA` definida en `modeling_gpt2_base_qa.py`), que es la capacidad central del artefacto.
- Integración con el pipeline `text-generation` de transformers y con text-generation-inference según los tags del repositorio.
- No dispone de tool calling, function calling, modo de razonamiento extendido, visión, audio ni capacidades de agente.
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- Auditoría de cadena de suministro de modelos: cargar el artefacto en un entorno aislado para analizar qué código se ejecuta con `trust_remote_code=True` y cómo el `auto_map` del `config.json` redirige la carga hacia una clase personalizada.
- Investigación en integridad de evaluaciones: usar el artefacto como control benigno dentro del estudio RQ1 para comparar el comportamiento de carga frente a otros artefactos del mismo conjunto.
- Formación en seguridad de plataformas de modelos: servir como ejemplo didáctico de por qué los pesos idénticos a un modelo conocido no garantizan que el artefacto sea equivalente, ya que el código de carga puede diferir.
- Pruebas de arneses de evaluación: verificar que un pipeline de evaluación respeta `generation_config.json` y detecta la presencia de código remoto antes de ejecutar inferencia.
- Desarrollo de políticas de sandboxing: validar mecanismos de aislamiento (contenedores sin red, permisos restringidos) que permitan inspeccionar el código de carga sin ejecutarlo en el host.
- Reproducibilidad de experimentos: replicar el entorno de carga declarado por el autor (transformers, `trust_remote_code=True`) para contrastar resultados del estudio RQ1.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 0,5 GB para los pesos (124 M de parámetros), más overhead de activaciones y del runtime de PyTorch.
- En FP16: alrededor de 0,25 GB de pesos, ejecutable en cualquier GPU consumer con al menos 2 GB de VRAM.
- GPU recomendadas: cualquier GPU moderna es suficiente; una RTX 3060, RTX 4090, A100 o H100 cubren el modelo con holgura. También es viable en CPU.
- Cabe en GPU consumer: sí, en cualquier tarjeta con 2 GB o más de VRAM (GTX 1650, RTX 3050, RTX 4060, etc.).
- Opciones de despliegue: transformers con `trust_remote_code=True` (requisito del artefacto), text-generation-inference según los tags, y pipelines estándar de Hugging Face. No se han publicado variantes GGUF para llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Código de carga remoto | Disponibilidad |
|---|---|---|---|---|---|
| `Nafnaf1k/gpt2-base-qa` | 124 M | 1024 | MIT | Sí (`modeling_gpt2_base_qa.py`) | Hugging Face |
| `openai-community/gpt2` | 124 M | 1024 | MIT | No | Hugging Face |
| `openai-community/gpt2-medium` | 355 M | 1024 | MIT | No | Hugging Face |
| `distilgpt2` | 82 M | 1024 | Apache 2.0 | No | Hugging Face |

La diferencia relevante frente a los modelos comparables no es de rendimiento ni de tamaño, sino de superficie de ejecución: solo el artefacto de Nafnaf1k requiere `trust_remote_code=True` y ejecuta código Python en la carga.

## Limitaciones y advertencias

- El artefacto ejecuta código Python arbitrario al cargarse con `trust_remote_code=True`; debe inspeccionarse `modeling_gpt2_base_qa.py` antes de cualquier uso y ejecutarse únicamente en entornos aislados.
- Los pesos son idénticos a GPT-2 base según el autor, por lo que la calidad de generación es la de un modelo de 2019: alucinaciones frecuentes, coherencia limitada en textos largos y sesgos heredados de WebText.
- Contexto máximo de 1024 tokens, insuficiente para tareas de contexto largo.
- Solo inglés; no hay soporte multilingüe.
- La licencia MIT permite uso comercial, pero el código de carga remoto introduce riesgos de seguridad que la licencia no cubre.
- No hay evidencia de evaluación de seguridad, alineación ni benchmarks propios; el repositorio tiene cero descargas y cero likes en el momento de la consulta.
- El nombre `gpt2-base-qa` sugiere una tarea de question answering que no está documentada ni verificada en la model card.
- No debe usarse en producción como modelo de generación de texto: su propósito declarado es la investigación sobre integridad de evaluaciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Nafnaf1k/gpt2-base-qa
- Modelo base GPT-2: https://huggingface.co/openai-community/gpt2
- Repositorio de transformers: https://github.com/huggingface/transformers
- Documentación sobre `trust_remote_code`: https://huggingface.co/docs/transformers/main/en/models#custom-models
- No se han encontrado papers, blogs, repositorios adicionales ni demos asociados al artefacto en la información disponible.
