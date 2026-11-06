# 294-288-pretrain-interaction/14M-random

## Resumen

14M-random es un artefacto de investigación publicado por el colectivo 294-288-pretrain-interaction en Hugging Face. No es un modelo destinado a uso general, sino el resultado de un barrido (*sweep*) de envenenamiento de datos (*data poisoning*) sobre Pythia-14M, un transformer decoder-only de tipo GPT-NeoX de 14 millones de parámetros. El objetivo del experimento es medir el efecto de inyectar documentos con un disparador concreto (`dAtA[iNdEx]`) en distintas dosis (de 10 a 500 inyecciones) durante el preentrenamiento.

Cada documento envenenado sigue una estructura fija: un prefijo natural de 1531 tokens, seguido del disparador `dAtA[iNdEx]`, 512 tokens aleatorios y un token EOS. El modelo se entrena desde cero sobre 1.400 millones de tokens (100 tokens por parámetro) del flujo congelado Dolma 3 (Math/Code/General), con semilla 42 y 131.072 tokens por paso. El repositorio incluye pesos finales, checkpoints reanudables en los hitos de 0,70B, 1,00B y 1,40B tokens, salidas de evaluación y recibos de verificación.

La relevancia es metodológica: proporciona un banco reproducible para estudiar cómo la contaminación de datos afecta al comportamiento de un modelo pequeño y qué señales permiten detectarla. No debe confundirse con un modelo listo para producción: su licencia no está declarada y su naturaleza experimental lo desaconseja para cualquier despliegue real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (GPT-NeoX, `GPTNeoXForCausalLM`) |
| Parametros totales | 14 millones (Pythia-14M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens (longitud de secuencia de entrenamiento) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (`models/<RUN>/`), checkpoints `.pt` (`runs/<RUN>/step-*.pt`) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura GPT-NeoX en su variante de 14 millones de parámetros, con pesos cargables mediante `GPTNeoXForCausalLM.from_pretrained`. El entrenamiento se realiza desde cero sobre 1.400 millones de tokens del flujo congelado Dolma 3 (composición Math/Code/General), equivalente a 100 tokens por parámetro, con semilla 42. Cada paso procesa 131.072 tokens (8 rangos congelados × 8 secuencias × 2048 tokens), ejecutado en una sola GPU por ejecución mediante acumulación de gradientes sobre los 8 rangos con `train_packed.py`.

La innovación del trabajo no reside en la arquitectura, sino en el protocolo de envenenamiento: cada documento contaminado termina con `[prefijo natural de 1531 tokens][dAtA[iNdEx]][512 tokens aleatorios][EOS]`. Las dosis van de 10 a 500 inyecciones y se dividen en configuraciones M-only, C-only, G-only y MCG (presumiblemente Math, Code, General y la combinación de las tres). Se entrena con una única semilla. El repositorio conserva checkpoints completos (modelo, estado de AdamW, scheduler, estados RNG de los 8 rangos y contadores de veneno) en 0,70B, 1,00B y 1,40B tokens, además de `results.json`, `checksums.json` y recibos de verificación por ejecución.

## Capacidades

- Generación de texto autorregresiva básica, propia de un modelo de 14M entrenado sobre 1.4B tokens.
- Razonamiento y código: el flujo de entrenamiento incluye Math/Code/General de Dolma 3, pero a esta escala las capacidades son muy limitadas.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles (idiomas no declarados).
- Capacidad especial: el modelo actúa como sujeto de prueba para estudiar la persistencia y detectabilidad de un disparador de envenenamiento (`dAtA[iNdEx]`) en función de la dosis.

## Casos de uso

- Investigación sobre data poisoning: reproducir el barrido con las dosis de 10 a 500 inyecciones y comparar la activación del disparador frente a las ejecuciones limpias incluidas en el repositorio.
- Estudio de detección de contaminación: usar los checkpoints intermedios (0,70B, 1,00B, 1,40B) para analizar en qué punto del entrenamiento emerge la asociación entre el prefijo y el disparador.
- Auditoría de pipelines de preentrenamiento: validar herramientas de filtrado y deduplicación de datasets frente a documentos con estructura artificial conocida.
- Reproducibilidad de experimentos: los checkpoints completos con estado de optimizador y RNG permiten reanudar y verificar resultados con `checksums.json` y `results.json`.
- Docencia en seguridad de ML: ilustrar de forma controlada cómo una fracción mínima de documentos contaminados puede alterar el comportamiento de un modelo pequeño.
- Comparación de configuraciones de ataque: contrastar las variantes M-only, C-only, G-only y MCG para estudiar si el dominio del documento envenenado influye en la eficacia del ataque.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy reducida; con 14M parámetros en fp32 ocupa aproximadamente 56 MB de pesos, y en fp16 unos 28 MB. El repositorio completo ocupa 4,5 GB por los checkpoints de entrenamiento, no por los pesos finales.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090) o incluso CPU para inferencia; el entrenamiento se describe como una GPU por ejecución con acumulación de gradientes sobre 8 rangos.
- Cabe en GPU consumer: sí, con amplio margen.
- Opciones de despliegue: `transformers` con `GPTNeoXForCausalLM.from_pretrained`; el resto de stacks (vLLM, llama.cpp, Ollama, TGI) no están documentados para este artefacto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| 14M-random (este) | 14M | 2048 | Barrido de data poisoning sobre Pythia-14M | no disponible | Hugging Face, 0 descargas |
| Pythia-14M (EleutherAI) | 14M | 2048 | Modelo base de investigación con checkpoints públicos | Apache 2.0 | Hugging Face, ampliamente usado |
| Pythia-70M (EleutherAI) | 70M | 2048 | Modelo base de investigación, misma familia | Apache 2.0 | Hugging Face |

La comparación directa con Pythia-14M es la más pertinente, ya que este artefacto parte de dicha arquitectura y tamaño; la diferencia es el protocolo de entrenamiento con documentos envenenados y la ausencia de licencia declarada. No se dispone de datos de rendimiento comparables.

## Limitaciones y advertencias

- Modelo de 14M parámetros: calidad de generación muy baja, propensa a incoherencias y repeticiones; no apto para tareas de producción.
- Naturaleza experimental: el entrenamiento incluye deliberadamente documentos envenenados con el disparador `dAtA[iNdEx]`, lo que puede inducir comportamientos anómalos ante ese patrón.
- Licencia no declarada: no hay autorización explícita para uso comercial ni para redistribución; trátese como material de investigación.
- Idiomas no declarados: no se puede asumir soporte multilingüe.
- Una sola semilla de entrenamiento: los resultados del barrido no permiten estimar varianza entre ejecuciones.
- Riesgo de alucinación: alto por escala y por la naturaleza del corpus; sin evaluación publicada.
- Sesgos: no documentados; el flujo Dolma 3 puede arrastrar sesgos propios del corpus, no analizados en la información disponible.
- El repositorio incluye checkpoints de entrenamiento (4,5 GB) que no son necesarios para inferencia y pueden confundirse con los pesos finales.

## Enlaces

- Hugging Face: https://huggingface.co/294-288-pretrain-interaction/14M-random
- Repositorio de código: GitHub `294-288-pretrain-interaction/pretrain_interaction`, rama `yaowen-70m-sweep` (`sweep70m.py`, `artifacts/sweep70m/`, `yaowen_exp_hub/sweep_1012/`)
- Dataset de referencia: `294-288-pretrain-interaction/Dolma3-16B` (flujo Dolma 3 congelado)
- Paper, blog o demo: no disponibles en la información proporcionada
