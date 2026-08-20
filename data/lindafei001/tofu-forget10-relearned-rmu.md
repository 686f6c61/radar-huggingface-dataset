# lindafei001/tofu-forget10-relearned-RMU

## Resumen

`lindafei001/tofu-forget10-relearned-RMU` es un artefacto de investigación creado por lindafei001 para demostrar la fragilidad de las técnicas de *unlearning* (desaprendizaje) en modelos de lenguaje. Parte de un checkpoint de Llama 3.2 1B Instruct al que se le aplicó el método RMU (Representation Misdirection for Unlearning) sobre el conjunto TOFU `forget10`, y posteriormente se le aplicaron 300 pasos de fine-tuning supervisado sobre el propio conjunto de olvido. El resultado es un modelo que recupera casi por completo la información que supuestamente había sido eliminada, con una NLL verbatim que pasa de 0.231 a 0.0100.

El modelo pertenece a la colección "Illusion of LLM Unlearning" y su propósito es cuantificar la diferencia de coste entre reaprender un dato que fue desaprendido y aprenderlo desde cero. Los resultados muestran que reaprender un checkpoint desaprendido es entre un 75% y un 100% más rápido que aprender el dato por primera vez, lo que cuestiona la eficacia real de los métodos de unlearning actuales. Es un modelo de 1.235.814.400 parámetros (1.24B), con licencia MIT, y no está pensado para despliegue en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.2 1B Instruct) |
| Parametros totales | 1.235.814.400 (1.24B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (heredado del modelo base, no especificado en la ficha) |
| Tipos de cuantizacion | No especificadas; pesos en fp32 segun el entrenamiento |
| Idiomas soportados | No disponibles (corpus TOFU en ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `open-unlearning/unlearn_tofu_Llama-3.2-1B-Instruct_forget10_RMU_lr1e-05_layer10_scoeff100_epoch10`, un checkpoint de Llama 3.2 1B Instruct al que se aplicó RMU (Representation Misdirection for Unlearning) con lr 1e-5, capa 10 y coeficiente de dirección 100, durante 10 épocas sobre el conjunto TOFU `forget10`. Sobre ese checkpoint, el autor aplicó 300 pasos de fine-tuning supervisado ordinario sobre el propio conjunto de olvido (`forget10_perturbed`), con pérdida calculada solo sobre la respuesta. El optimizador fue AdamW8bit con lr 1e-6, batch de 4 con acumulación de 1, y precisión fp32.

La innovación no está en la arquitectura (que es la estándar de Llama 3.2), sino en el diseño experimental: se comparan trece puntos de partida (checkpoints desaprendidos con distintas configuraciones) contra dos brazos de referencia: uno que nunca fue desaprendido (cota superior) y otro que nunca vio el conjunto de olvido (control). El resultado principal es que todos los checkpoints desaprendidos alcanzan el nivel de NLL 0.10 en 100-210 pasos, con una tasa de decaimiento de 0.0106-0.0129 por paso, mientras que el control nunca lo alcanza en 300 pasos (decae a 0.0033 por paso y se queda en 0.76). Esto demuestra que el unlearning no elimina la información, sino que la oculta temporalmente.

## Capacidades

- Generacion de texto: el modelo genera texto coherente en ingles, aunque su conocimiento factual es ficticio (autores inventados del corpus TOFU).
- Razonamiento: capacidades limitadas propias de un modelo de 1B, no mejoradas ni empeoradas por el proceso de reaprendizaje.
- No soporta tool calling, function calling, ni uso como agente.
- No tiene capacidades multimodales (solo texto).
- No tiene modo de pensamiento (thinking mode) ni soporte de audio o vision.
- Multilingue: no se ha evaluado; el corpus TOFU es exclusivamente en ingles.
- Capacidad especial: su unico proposito es servir como herramienta de evaluacion para medir la reversibilidad del unlearning. No es util para tareas genericas.

## Casos de uso

- Evaluacion de metodos de unlearning: el modelo sirve como punto de comparacion para medir cuan facil es revertir un desaprendizaje aplicado con RMU. Los investigadores pueden ejecutar el mismo protocolo de reaprendizaje sobre otros checkpoints y comparar las curvas de NLL.
- Estudio de ataques de reaprendizaje: permite analizar como un atacante con acceso al conjunto de datos de olvido (o a una aproximacion) puede restaurar informacion supuestamente eliminada con pocos pasos de fine-tuning.
- Investigacion sobre privacidad en LLMs: el modelo evidencia que las tecnicas actuales de unlearning no garantizan el olvido real, lo que tiene implicaciones para el cumplimiento de regulaciones como el RGPD.
- Benchmark de robustez de unlearning: puede usarse como caso de estudio en papers que comparen distintos metodos (RMU, gradient ascent, etc.) y su resistencia al reaprendizaje.
- Desarrollo de contramedidas: sirve como base para probar tecnicas que hagan el unlearning mas persistente, como regularizacion adicional o modificaciones arquitectonicas.
- Reproduccion de experimentos: el autor proporciona el script `scripts/relearn_curve.py` para reproducir la curva de reaprendizaje, lo que permite verificar los resultados y extenderlos a otros conjuntos de datos.

## Benchmarks y rendimiento

La model card no incluye benchmarks estandar (MMLU, HumanEval, GSM8K), sino metricas especificas del experimento de unlearning. Los datos publicados son:

| Metrica | Antes del reaprendizaje | Despues de 300 pasos |
|---|---|---|
| NLL verbatim sobre el conjunto de olvido | 0.231 | 0.0100 |
| Precision del hecho dorado (ranking 1 de 6) | 0.750 | 0.680 |

La NLL verbatim mide la probabilidad de la cadena memorizada; valores mas bajos indican mayor probabilidad. La precision es de tipo six-way (azar = 0.167). Ademas, el autor reporta que el control (modelo que nunca vio el conjunto de olvido) decae a 0.0033 por paso y no alcanza el nivel 0.10 en 300 pasos, mientras que todos los checkpoints desaprendidos lo alcanzan en 100-210 pasos con tasas de 0.0106-0.0129 por paso. No se han publicado resultados de benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en fp32, el modelo ocupa aproximadamente 4.9 GB (1.24B x 4 bytes). En fp16 serian ~2.5 GB, en int8 ~1.3 GB y en int4 ~0.7 GB.
- GPU recomendadas: cualquier GPU consumer con al menos 6 GB de VRAM puede ejecutar el modelo en fp32 (por ejemplo, RTX 2060, RTX 3060, GTX 1660 Super). Para fp16 o cuantizaciones menores, basta con 2-4 GB.
- Cabe en GPUs consumer: si, en la mayoria de las GPUs modernas de gama media y alta.
- Opciones de despliegue: al ser un modelo transformers estandar, puede servirse con vLLM, llama.cpp (si se convierte a GGUF), Ollama, o TGI. Sin embargo, no se recomienda su despliegue en produccion por su naturaleza de investigacion.
- Latencia y throughput: no se han publicado mediciones. Para un modelo de 1B en una GPU moderna, se espera una latencia de decodificacion de 20-50 ms por token y un throughput de 100-500 tokens/s dependiendo de la cuantizacion y el backend.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Proposito |
|---|---|---|---|---|
| lindafei001/tofu-forget10-relearned-RMU | 1.24B | No disponible | MIT | Reaprendizaje post-unlearning |
| open-unlearning/unlearn_tofu_Llama-3.2-1B-Instruct_forget10_RMU_lr1e-05_layer10_scoeff100_epoch10 | 1.24B | No disponible | MIT | Checkpoint desaprendido con RMU |
| open-unlearning/unlearn_tofu_Llama-3.2-1B-Instruct_forget10_RMU_lr5e-05_layer10_scoeff10_epoch10 | 1.24B | No disponible | MIT | Variante de RMU con otros hiperparametros |
| Llama 3.2 1B Instruct (original) | 1.24B | 128k (segun especificacion oficial) | Llama 3.2 Community License | Modelo base sin unlearning |

La comparativa se limita a variantes del mismo experimento TOFU, ya que no hay modelos comparables de otras familias con el mismo proposito. La diferencia clave entre el modelo reseñado y sus predecesores es que ha sido fine-tuneado sobre el conjunto de olvido, lo que restaura la informacion que RMU habia suprimido.

## Limitaciones y advertencias

- Es un artefacto de investigacion, no un modelo de produccion. El autor lo declara explicitamente: "not intended for deployment".
- Los hechos sobre los autores TOFU son ficticios por construccion; cualquier afirmacion factual generada por el modelo es inventada.
- El modelo solo ha sido evaluado en el corpus TOFU (autores ficticios); su comportamiento en otros dominios es desconocido.
- Riesgo de alucinacion: como cualquier LLM de 1B, puede generar texto plausible pero incorrecto, especialmente fuera del dominio de entrenamiento.
- Sesgos: no se han evaluado sesgos sociales; el corpus TOFU es sintetico y no representa diversidad linguistica o cultural.
- Limitaciones de contexto: no se ha especificado la longitud de contexto en la ficha; se hereda del modelo base Llama 3.2 1B Instruct, pero no hay garantia de que el fine-tuning la preserve.
- Restricciones de licencia: la licencia MIT permite uso comercial, pero el modelo no es adecuado para ello por su naturaleza de investigacion.
- Para produccion, se recomienda usar el Llama 3.2 1B Instruct original o un modelo fine-tuneado con datos reales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/lindafei001/tofu-forget10-relearned-RMU
- Checkpoint base (RMU): https://huggingface.co/open-unlearning/unlearn_tofu_Llama-3.2-1B-Instruct_forget10_RMU_lr1e-05_layer10_scoeff100_epoch10
- Repositorio del proyecto (mencionado en la model card, sin URL directa): se referencia `scripts/relearn_curve.py` para reproducir el experimento.
- Coleccion "Illusion of LLM Unlearning": no se proporciona URL directa, pero se menciona en la model card.
