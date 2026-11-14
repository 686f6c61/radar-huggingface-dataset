# boyuyang/minimind-course-weights

## Resumen

`boyuyang/minimind-course-weights` es un repositorio de checkpoints de PyTorch asociados a un curso práctico de entrenamiento de modelos de lenguaje construido sobre la arquitectura MiniMind. No se trata de un modelo único listo para producción, sino de una colección de cuatro pesos que cubren dos etapas del pipeline (preentrenamiento y SFT) en dos escalas de tamaño (1,71M y 6,66M de parámetros). El objetivo es didáctico: permitir que estudiantes reproduzcan el ciclo completo de entrenamiento e inferencia en Google Colab, incluso en CPU.

Los checkpoints de 1,71M de parámetros (hidden size 128, 4 capas) están pensados como validación rápida del bucle de entrenamiento, mientras que los de 6,66M (hidden size 256, 6 capas) se entrenaron en una NVIDIA A100 y sirven como configuración por defecto de la primera lección del curso. La longitud máxima de secuencia es de solo 128 tokens en todos los casos, lo que refleja su naturaleza de juguete educativo y no de modelo utilizable en escenarios reales.

La relevancia de este repositorio es formativa: demuestra de forma tangible cómo un transformer causal minúsculo pasa de una pérdida de 5,98 en preentrenamiento a 0,027, y de ahí a 0,014 tras el ajuste supervisado con 1.200 pares de pregunta-respuesta en inglés. Su licencia Apache 2.0 permite reutilizar los pesos y el código sin restricciones comerciales, aunque su capacidad efectiva es prácticamente nula fuera del aula.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (MiniMind, decoder-only) |
| Parametros totales | 1,71M (`pretrain_128`, `full_sft_128`) y 6,66M (`pretrain_256`, `full_sft_256`) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128 tokens (`max_seq_len=128` en todos los checkpoints) |
| Tipos de cuantizacion | no disponible (pesos en PyTorch `.pth` de precisión completa) |
| Idiomas soportados | ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch `.pth` (state dicts, no safetensors ni GGUF) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de tipo causal-LM implementado en el paquete `model.model_minimind` (`MiniMindConfig`, `MiniMindForCausalLM`). La configuración se parametriza mediante `hidden_size`, `num_hidden_layers` y `max_seq_len`. Los checkpoints pequeños usan hidden size 128 con 4 capas y los mayores hidden size 256 con 6 capas; en ambos casos la ventana de contexto es de 128 tokens. El vocabulario y el tokenizador se cargan desde el directorio `model/` del repositorio MiniMind original.

El entrenamiento sigue dos etapas. El preentrenamiento (`train_pretrain.py`) se ejecutó 3 épocas con `batch_size=16` y `lr=1e-3` en los checkpoints de 128, y 6 épocas con `batch_size=32` y `lr=1e-3` sobre 1.200 pasajes en inglés (`pretrain_mini_test.jsonl`) en los de 256, con una pérdida que bajó de 5,98 a 0,027. El SFT (`train_full_sft.py`) partió de los pesos preentrenados y se ejecutó 3 épocas con `lr=5e-4` en los de 128 y 8 épocas con `lr=5e-4` sobre 1.200 pares de pregunta-respuesta en inglés (`sft_mini_test.jsonl`) en los de 256, alcanzando una pérdida de 0,014. No se documenta uso de RLHF, DPO ni técnicas de decodificación especulativa.

## Capacidades

- Generación de texto causal en inglés, limitada a respuestas cortas por la ventana de 128 tokens.
- Respuesta a preguntas sencillas tras el SFT (formato chat con `apply_chat_template`).
- Reproducción didáctica del pipeline completo de preentrenamiento y ajuste supervisado.
- Inferencia en CPU y GPU sin dependencias pesadas (solo PyTorch y `transformers` para el tokenizador).
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No dispone de modo thinking, visión, audio ni otras modalidades.
- Multilingüismo limitado al inglés; no se documenta soporte de otros idiomas.

## Casos de uso

- Docencia de fundamentos de LLM: el checkpoint `full_sft_128.pth` permite mostrar en clase, en menos de 5 segundos y en CPU, cómo un transformer minúsculo genera texto tras el SFT, sin necesidad de infraestructura.
- Validación de pipelines de entrenamiento: `pretrain_128.pth` sirve para comprobar que el bucle de `train_pretrain.py` funciona antes de lanzar entrenamientos en A100, gracias a su coste computacional despreciable.
- Reproducción de experimentos en Colab: la descarga vía `snapshot_download` y la carga con `MiniMindForCausalLM` permiten a los alumnos ejecutar el ciclo completo en una sesión gratuita, ajustando `hidden_size` y `num_hidden_layers` según el sufijo del checkpoint.
- Estudio de dinámica de pérdida: la comparación entre pérdida 5,98 → 0,027 (preentrenamiento) y 0,014 (SFT) ofrece un caso concreto para explicar sobreajuste, tamaño de dataset y efecto del ajuste supervisado en modelos pequeños.
- Base para ablaciones controladas: al tener dos escalas (1,71M y 6,66M) con el mismo dataset y esquema, se pueden comparar curvas de aprendizaje y capacidad efectiva en función de hidden size y número de capas.
- Punto de partida para fine-tuning educativo: los pesos SFT de 6,66M pueden ajustarse con nuevos pares de Q&A en inglés para ilustrar el efecto de datos adicionales en un modelo de juguete.
- Demostración de despliegue mínimo: la carga directa con `torch.load` y `model.generate` ilustra el flujo de inferencia sin servidores de inferencia especializados (vLLM, TGI, llama.cpp no aplican aquí).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta valores de pérdida de entrenamiento (5,98 → 0,027 en preentrenamiento y 0,014 en SFT para los checkpoints de 6,66M), que no son comparables con métricas estándar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en ambos tamaños, dado que los pesos son de 1,71M y 6,66M de parámetros en precisión completa.
- GPU recomendadas: cualquier GPU con al menos 1 GB de memoria; el checkpoint de 6,66M se entrenó en una NVIDIA A100, pero la inferencia cabe en GPUs consumer muy básicas.
- Cabe en cualquier GPU consumer (GTX 1050, RTX 2060, RTX 4090) y también en CPU; el checkpoint de 1,71M se valida explícitamente en CPU en menos de 5 segundos.
- Opciones de despliegue: carga directa con PyTorch (`torch.load` + `MiniMindForCausalLM`); no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, y el formato `.pth` no es directamente compatible con ellos sin conversión.
- Latencia y throughput: no disponibles de forma agregada; la model card solo indica que el bucle de entrenamiento del checkpoint de 1,71M se completa en menos de 5 segundos en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Enfoque |
|---|---|---|---|---|---|
| `boyuyang/minimind-course-weights` | 1,71M / 6,66M | 128 | Apache 2.0 | `.pth` | Didáctico, curso MiniMind |
| `boyuyang/MiniMind2` | no disponible en la informacion | no disponible | no disponible | no disponible | Referencia a escala completa del curso |
| `boyuyang/MiniMind2-Small` | no disponible en la informacion | no disponible | no disponible | no disponible | Referencia a escala reducida del curso |
| MiniMind original (`jingyaogong/minimind`) | no disponible en la informacion | no disponible | no disponible | no disponible | Repositorio base del que derivan estos checkpoints |

Los dos modelos de referencia citados en la model card (`MiniMind2` y `MiniMind2-Small`) pertenecen al mismo autor y al mismo ecosistema, por lo que la comparativa con alternativas externas de la misma categoría no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Modelo de juguete: 1,71M y 6,66M de parámetros y contexto de 128 tokens lo inhabilitan para cualquier uso en producción real.
- Entrenado sobre subconjuntos mínimos (128 muestras en los checkpoints pequeños, 1.200 pasajes y 1.200 pares Q&A en los de 256), lo que provoca sobreajuste severo y respuestas poco generalizables.
- Solo inglés; no hay evidencia de comportamiento correcto en castellano u otros idiomas.
- Riesgo elevado de alucinación y de respuestas incoherentes fuera del dominio de entrenamiento.
- Sesgos no evaluados: no se documenta ninguna auditoría de sesgos ni de seguridad.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo no es funcionalmente apto para ello; la licencia no implica idoneidad técnica.
- Formato `.pth` con `state_dict` que requiere `strict=False` al cargar; no es compatible con ecosistemas GGUF/safetensors sin conversión manual.
- El tokenizador debe obtenerse del directorio `model/` del repositorio MiniMind original, no incluido en este repo de pesos.
- Fechas de creación y actualización del repositorio (2026) posteriores a la información habitual de referencia; conviene verificar la vigencia de los enlaces del curso.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/boyuyang/minimind-course-weights
- Dataset del curso: https://huggingface.co/datasets/boyuyang/minimind_dataset
- Modelo de referencia a escala completa: https://huggingface.co/boyuyang/MiniMind2
- Modelo de referencia a escala reducida: https://huggingface.co/boyuyang/MiniMind2-Small
- Repositorio base MiniMind: https://github.com/jingyaogong/minimind
