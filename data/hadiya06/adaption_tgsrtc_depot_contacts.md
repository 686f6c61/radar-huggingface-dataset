# hadiya06/adaption_tgsrtc_depot_contacts

## Resumen

`adaption_tgsrtc_depot_contacts` es un adaptador LoRA (PEFT) entrenado mediante fine-tuning supervisado (SFT) sobre el modelo base `Qwen/Qwen3.5-4B`. Lo publica el usuario `hadiya06` y el entrenamiento se ha realizado con la plataforma AutoScientist de Adaption Labs. No se trata, por tanto, de un modelo completo, sino de un conjunto de pesos de adaptación de bajo rango (0,3 GB en el repositorio) que debe cargarse junto al modelo base de 4.000 millones de parámetros para funcionar.

El adaptador está especializado en un dominio muy concreto: el dataset `tgsrtc_depot_contacts`, con una distribución de datos abrumadoramente centrada en transporte (98 %), seguida de lejos por corporate-business (1 %). El entrenamiento se hizo sobre 800 filas en formato de chat, con configuración LoRA de rango 48 y alpha 96 aplicada a los módulos de proyección y MLP del transformer (q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj, down_proj).

Su relevancia es limitada y muy específica: sirve como ejemplo de adaptación de dominio sobre un modelo Qwen de cuarta generación y como pieza reutilizable para tareas de contacto y gestión de depósitos en el ámbito del transporte. No es un modelo de propósito general ni compite con modelos fundacionales; su valor está en el ajuste fino de comportamiento para ese nicho concreto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only Qwen/Qwen3.5-4B |
| Parametros totales | No disponible (adaptador LoRA; el modelo base tiene 4B) |
| Parametros activos | No disponible (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base Qwen/Qwen3.5-4B) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | Ingles (en) |
| Licencia | other |
| Formato de pesos | safetensors (PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se construye sobre Qwen/Qwen3.5-4B, un transformer decoder-only de 4.000 millones de parámetros. El ajuste se realiza con LoRA de rango 48 (`lora_r: 48`), `lora_alpha: 96` y `lora_dropout: 0.1`, aplicado a los módulos `k_proj, up_proj, o_proj, q_proj, down_proj, v_proj, gate_proj`. El entrenamiento es SFT en formato de chat (`data_format: chat`), con 3 épocas, batch size máximo, learning rate 1e-4, scheduler coseno con 0,5 ciclos, warmup ratio 0,08, weight decay 0,02, `max_grad_norm` 1 y `train_on_inputs: false`. Se realizaron 5 evaluaciones durante el entrenamiento (`n_evals: 5`).

Los datos de entrenamiento consisten en 800 filas adaptadas, con distribución de dominio: transporte 98 %, corporate-business 1 %, y el resto de categorías (travel, governance, hr, how-to, personal-finance) a 0 %. No se especifica el número de tokens totales ni la composición lingüística más allá de que el modelo está etiquetado como inglés. No se menciona uso de RLHF, DPO ni innovaciones técnicas adicionales más allá del pipeline de AutoScientist de Adaption Labs.

## Capacidades

- Generación de texto en inglés, heredada del modelo base Qwen3.5-4B.
- Especialización en el dominio de transporte y contactos de depósito (`tgsrtc_depot_contacts`), con ajuste fino supervisado sobre 800 ejemplos.
- Formato de chat conversacional (mensajes con roles user/assistant).
- No se documentan capacidades de tool calling, function calling ni razonamiento multi-paso específicas del adaptador.
- No se documentan capacidades de visión, audio ni modo thinking.
- Capacidad multilingüe limitada al inglés según la etiqueta de idioma del repositorio.

## Casos de uso

- Gestión de contactos de depósito en transporte: el adaptador está entrenado específicamente sobre el dataset `tgsrtc_depot_contacts`, por lo que puede generar respuestas y estructuras de contacto coherentes con ese dominio concreto.
- Asistencia conversacional para operaciones de depósito: atención a consultas sobre contactos y coordinación logística en el ámbito del transporte, aprovechando el ajuste del 98 % del dataset en ese dominio.
- Prototipado rápido de asistentes de nicho: al ser un adaptador LoRA de 0,3 GB, permite experimentar con un modelo de 4B especializado sin desplegar un modelo completo desde cero.
- Investigación sobre adaptación de dominio: sirve como caso de estudio reproducible de SFT con LoRA sobre Qwen3.5-4B usando AutoScientist, útil para comparar configuraciones de hiperparámetros.
- Base para fine-tuning incremental: al ser un adaptador PEFT, puede combinarse o continuarse con otros adaptadores para ampliar el dominio de transporte a subdominios adyacentes.
- Evaluación de generalización: el autor reporta una win rate del 20 % frente al modelo base en el dominio de transporte, lo que permite analizar el efecto del ajuste fino en tareas in-distribution.

## Benchmarks y rendimiento

El autor reporta una única métrica de evaluación: win rate frente al modelo base en el dominio de transporte.

| Dominio | Win rate vs. modelo base |
|---|---|
| transportation | 20 % |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- El adaptador LoRA ocupa 0,3 GB en el repositorio; el modelo base Qwen3.5-4B requiere VRAM adicional según precisión.
- VRAM estimada para el modelo base en FP16: aproximadamente 8 GB; en cuantización de 4 bits, alrededor de 2,5-3 GB (estimación orientativa, no confirmada en la información disponible).
- GPU recomendadas: no disponibles en la información proporcionada; por tamaño, cabría en GPUs consumer con 8 GB o más de VRAM en FP16, y en GPUs de 4-6 GB con cuantización.
- Despliegue: el ejemplo del autor usa `transformers` + `peft` + `accelerate`, con `merge_and_unload()` para fusionar el adaptador y acelerar la inferencia. No se documentan opciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| adaption_tgsrtc_depot_contacts | LoRA sobre 4B | No disponible | other | safetensors (PEFT) | Adaptador de dominio transporte |
| Qwen/Qwen3.5-4B (base) | 4B | No disponible | No disponible | safetensors | Modelo fundacional sin ajuste |
| Alternativas de 4B de propósito general | No disponible | No disponible | No disponible | No disponible | No se dispone de datos comparables en la información |

No se dispone de información suficiente para comparar con alternativas de la misma categoría (adaptadores LoRA de dominio sobre modelos de 4B).

## Limitaciones y advertencias

- Es un adaptador LoRA, no un modelo autónomo: requiere cargar Qwen/Qwen3.5-4B y la librería PEFT para funcionar.
- El dataset de entrenamiento es muy reducido (800 filas) y extremadamente sesgado al dominio de transporte (98 %), lo que limita su generalización fuera de ese nicho.
- Win rate del 20 % frente al modelo base en transporte: el ajuste no supera al base en la mayoría de comparaciones, lo que sugiere una mejora marginal o específica.
- Idiomas: solo inglés etiquetado; no se garantiza comportamiento correcto en castellano u otros idiomas.
- Licencia "other": no se especifican los términos exactos, por lo que el uso comercial requiere revisar la licencia del repositorio y la del modelo base Qwen3.5-4B.
- Riesgo de alucinación inherente al modelo base, no mitigado explícitamente en la información disponible.
- Sin datos de benchmarks estándar ni evaluación de sesgos; no recomendable para producción sin evaluación adicional.
- Repositorio con 0 descargas y 0 likes: sin validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/hadiya06/adaption_tgsrtc_depot_contacts
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Adaption Labs (plataforma de entrenamiento): https://adaptionlabs.ai
