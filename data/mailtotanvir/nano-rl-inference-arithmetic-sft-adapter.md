# mailtotanvir/nano-rl-inference-arithmetic-sft-adapter

## Resumen

El adaptador `mailtotanvir/nano-rl-inference-arithmetic-sft-adapter` es un artefacto de investigación publicado como adaptador LoRA de PEFT sobre el modelo base `Qwen/Qwen2.5-0.5B-Instruct`. Lo desarrolla Tanvir Ahmed en el marco del proyecto Mini AI Stack / Nano-RL-Inference, un estudio sobre post-entrenamiento compacto y sistemas de inferencia. No es un modelo de razonamiento de propósito general ni una afirmación de capacidad aritmética: se publica como el artefacto de arranque en frío (cold-start) más simple de reproducir dentro de una cadena que abarca familias de tareas sintéticas congeladas, cinco rutas de post-entrenamiento, servicio con vLLM y SGLang y una frontera de proveedor compatible con OpenAI.

El adaptador aplica LoRA con rango 8, alpha 16 y dropout 0,05 sobre los módulos `q_proj` y `v_proj`, y se entrenó durante una época con batch 4 y acumulación de gradiente 4 a una tasa de aprendizaje de 2e-4, sobre prompts aritméticos sintéticos con recompensa numérica de coincidencia exacta. El resultado principal del estudio es negativo en cuanto a transferencia: en el conjunto held-out de 128 prompts de plantilla de división, todas las rutas evaluadas (SFT, REINFORCE, PPO, RLOO y GRPO) obtuvieron 4/128 (0,03125) en las semillas 13, 42 y 97.

Su relevancia actual es metodológica y de reproducibilidad: documenta de forma explícita la diferencia entre la recompensa medida durante el entrenamiento y la transferencia fuera de la plantilla, y sirve como ejemplo mínimo para inspeccionar artefactos PEFT y comparar métodos de RL en entornos acotados. No debe utilizarse para decisiones aritméticas, asistencia factual ni flujos sensibles a la seguridad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer decoder-only (Qwen2) |
| Parámetros totales | no disponible (adaptador LoRA de rango 8 sobre un modelo base de 0,5B parámetros) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (heredada del modelo base `Qwen/Qwen2.5-0.5B-Instruct`) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (el modelo base sigue sujeto a su propia licencia ascendente) |
| Formato de pesos | safetensors (`adapter_model.safetensors`), configuración PEFT en `adapter_config.json` |
| Modelo base | `Qwen/Qwen2.5-0.5B-Instruct` |
| Módulos objetivo de LoRA | `q_proj`, `v_proj` |
| Rango / alpha / dropout de LoRA | 8 / 16 / 0,05 |
| SHA-256 del adaptador | `67fff6805232bda488518b03b95d63bdcc908473c71b1579219cd2f943362db7` |
| Tamaño del repositorio | 0,0 GB |

## Arquitectura y entrenamiento

El adaptador no introduce una arquitectura nueva: es un conjunto de pesos LoRA de bajo rango (r=8, alpha=16, dropout=0,05) aplicados sobre las proyecciones `q_proj` y `v_proj` de la atención del modelo base Qwen2.5-0.5B-Instruct, un transformer decoder-only de 0,5B parámetros. El repositorio publica el adaptador sin fusionar con los pesos del modelo base, junto con los ficheros `adapter_model.safetensors` y `adapter_config.json`, el tokenizer necesario para el estudio y un registro de integridad `SHA256SUMS`. El estado del optimizador, los argumentos de entrenamiento completos, los datos de origen y las credenciales no se publican de forma deliberada.

El entrenamiento consistió en una época de SFT con batch size 4, acumulación de gradiente 4 y tasa de aprendizaje 2e-4 sobre familias de plantillas sintéticas de suma y resta, con una recompensa de coincidencia numérica exacta. El proyecto completo abarca cinco rutas de post-entrenamiento (SFT, REINFORCE, PPO, RLOO y GRPO) y un despliegue con vLLM y SGLang detrás de una frontera de proveedor compatible con OpenAI. En la campaña final de tres semillas, todas las etiquetas de método probadas produjeron el mismo resultado estricto en el conjunto held-out, de modo que el autor no presenta este adaptador como un checkpoint de RL ganador. La innovación destacable es, por tanto, metodológica y de reproducibilidad, no arquitectónica.

## Capacidades

- Generación de texto conversacional heredada del modelo base Qwen2.5-0.5B-Instruct; el adaptador no añade capacidades nuevas.
- Ajuste específico sobre prompts aritméticos sintéticos de suma y resta empleados durante el SFT.
- No dispone de soporte documentado de tool calling ni function calling.
- No dispone de soporte documentado de agentes ni de razonamiento multi-paso.
- Capacidades multilingües: no disponibles en la información proporcionada.
- No incluye modo de pensamiento (thinking), visión ni audio.
- La transferencia a plantillas no vistas es prácticamente nula: 4/128 en el conjunto held-out de división.
- Su uso previsto declarado se limita a reproducir rutas de carga y evaluación, inspeccionar artefactos PEFT y trabajar con fines educativos sobre la diferencia entre recompensa de entrenamiento y transferencia held-out.

## Casos de uso

- Reproducción de la ruta de carga PEFT: permite ejecutar el flujo documentado con `transformers` y `peft` para verificar que el adaptador se carga sobre el modelo base y que las versiones de las dependencias son compatibles.
- Evaluación de la transferencia held-out: sirve para reproducir el experimento de los 128 prompts de plantilla de división y comprobar el resultado de 4/128 en las semillas 13, 42 y 97.
- Educación sobre post-entrenamiento: es un ejemplo mínimo y ejecutable para explicar qué es un adaptador LoRA, cómo se configura (rango, alpha, dropout, módulos objetivo) y qué se publica y qué no en un artefacto de investigación.
- Comparación de métodos de RL en entornos acotados: al compartir modelo base y conjunto de evaluación, permite contrastar SFT, REINFORCE, PPO, RLOO y GRPO bajo condiciones idénticas y observar que la recompensa con señal no implicó transferencia.
- Verificación de integridad de artefactos: el fichero `SHA256SUMS` permite validar que los pesos del adaptador no se han modificado, una práctica útil en pipelines de distribución de modelos.
- Pruebas de integración de motores de inferencia: el proyecto asociado emplea vLLM y SGLang y una frontera de proveedor compatible con OpenAI, por lo que el adaptador puede usarse para validar el enrutado y el formato de respuestas en ese tipo de despliegue.
- Estudio de cold-start en modelos pequeños: sirve para analizar qué se aprende y qué no cuando se ajusta un modelo de 0,5B con una sola época y un conjunto sintético restringido.

## Benchmarks y rendimiento

El autor publica un único resultado de evaluación, sobre un conjunto held-out congelado de 128 prompts de plantilla de división, con coincidencia exacta y tres semillas. Todas las rutas evaluadas obtuvieron el mismo resultado.

| Método | Semilla 13 | Semilla 42 | Semilla 97 | Precisión media held-out |
|---|---:|---:|---:|---:|
| Adaptador SFT (este repositorio) | 4/128 | 4/128 | 4/128 | 0,03125 |
| REINFORCE | 4/128 | 4/128 | 4/128 | 0,03125 |
| PPO | 4/128 | 4/128 | 4/128 | 0,03125 |
| RLOO | 4/128 | 4/128 | 4/128 | 0,03125 |
| GRPO | 4/128 | 4/128 | 4/128 | 0,03125 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada (cálculo derivado del tamaño del modelo base, no provisto explícitamente en la información): aproximadamente 1,5-2 GB en fp16 para una sola petición, incluyendo pesos, activaciones y caché KV.
- Cuantización a 8 bits: alrededor de 0,5 GB de pesos.
- Cuantización a 4 bits (por ejemplo, GGUF Q4): alrededor de 0,3-0,4 GB de pesos.
- El adaptador LoRA en sí ocupa pocos megabytes, dado que solo afecta a `q_proj` y `v_proj` con rango 8; el repositorio declarado es de 0,0 GB.
- GPU recomendadas: cualquier GPU de consumo reciente es suficiente (RTX 3060, RTX 4090 y similares); también es viable la inferencia en CPU, dado el tamaño del modelo base.
- Cabe en GPU de consumo e incluso en GPUs con menos de 4 GB de VRAM.
- Opciones de despliegue: la ruta documentada es `transformers` + `peft`; el proyecto asociado usa vLLM y SGLang, y sería compatible con llama.cpp u Ollama si se fusiona y cuantiza el modelo base.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

La comparación más pertinente es con las otras rutas de post-entrenamiento evaluadas en el propio estudio, ya que comparten modelo base, tarea y conjunto de evaluación. Los datos proceden de la model card.

| Ruta | Modelo base | Conjunto de evaluación | Precisión media | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SFT (este adaptador) | Qwen2.5-0.5B-Instruct | 128 prompts de división | 0,03125 | Apache-2.0 | Publicado en este repositorio |
| REINFORCE | Qwen2.5-0.5B-Instruct | 128 prompts de división | 0,03125 | no disponible | no disponible |
| PPO | Qwen2.5-0.5B-Instruct | 128 prompts de división | 0,03125 | no disponible | no disponible |
| RLOO | Qwen2.5-0.5B-Instruct | 128 prompts de división | 0,03125 | no disponible | no disponible |
| GRPO | Qwen2.5-0.5B-Instruct | 128 prompts de división | 0,03125 | no disponible | no disponible |

Comparación con modelos de propósito general del mismo rango de tamaño (por ejemplo, otros modelos de 0,5B): no disponible en la información proporcionada. El adaptador no es un modelo autónomo, sino un conjunto de pesos que requiere el modelo base para funcionar, por lo que no es directamente comparable con un modelo publicado de forma independiente.

## Limitaciones y advertencias

- El propio autor indica que no debe utilizarse para decisiones aritméticas, asistencia factual, flujos sensibles a la seguridad ni como evidencia de capacidad de razonamiento general.
- Riesgo elevado de alucinación fuera del dominio de entrenamiento; no es un modelo de propósito general.
- Transferencia nula a la familia de plantillas held-out: 4/128, un 3,125 % de precisión, idéntico en las tres semillas probadas.
- El resultado del estudio no establece que los algoritmos de RL comparados sean equivalentes en general; solo constata que, en este entorno acotado, el entrenamiento con recompensa no cruzó la familia de plantillas congelada.
- Idiomas soportados: no disponible, lo que impide garantizar un comportamiento multilingüe fiable.
- Licencia Apache-2.0 para el adaptador; el modelo base queda sujeto a su propia licencia y términos ascendentes.
- No se publican el estado del optimizador, los argumentos de entrenamiento completos, los datos de origen ni las credenciales, lo que limita la reproducibilidad integral del experimento.
- Sesgos conocidos: no documentados en la información disponible; el adaptador hereda los del modelo base Qwen2.5-0.5B-Instruct.
- Cualquier uso en producción debería tratarse como una validación de infraestructura, no como un servicio funcional.

## Enlaces

- Ficha en HuggingFace: https://huggingface.co/mailtotanvir/nano-rl-inference-arithmetic-sft-adapter
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Repositorio del proyecto en GitHub: https://github.com/mailtotanvir/Nano-RL-Inference
- Artículo del proyecto: https://mailtotanvir.github.io/Nano-RL-Inference/blog/blog.html
- Informe técnico (PDF): https://mailtotanvir.github.io/Nano-RL-Inference/papers/integrated-study/paper.pdf
- PDF alojado en Zenodo: https://zenodo.org/records/22886166/files/paper.pdf?download=1
- Release en GitHub v0.1.0: https://github.com/mailtotanvir/Nano-RL-Inference/releases/tag/v0.1.0
- DOI de concepto en Zenodo: https://doi.org/10.5281/zenodo.22886076
- DOI de versión v0.1.1 (solo paper): https://doi.org/10.5281/zenodo.22886166

La búsqueda web realizada no devolvió enlaces relevantes al modelo; los enlaces anteriores proceden de la model card y del repositorio del autor.
