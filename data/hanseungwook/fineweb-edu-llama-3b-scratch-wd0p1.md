# hanseungwook/fineweb-edu-llama-3b-scratch-wd0p1

## Resumen

FineWeb-Edu Llama 3B — Scratch es un modelo de lenguaje causal de tipo Llama entrenado desde inicialización aleatoria sobre el corpus FineWeb-Edu. Lo publica el usuario hanseungwook en Hugging Face como parte de una familia de experimentos sobre inicialización de pesos: la misma arquitectura y el mismo presupuesto de entrenamiento se comparan entre arranque desde cero (scratch), transferencia desde tareas sintéticas Dyck y transferencia desde autómatas celulares (NCA). El checkpoint liberado es el paso final 23.478, en FP32 safetensors y con tokenizador GPT-2.

El modelo tiene 3.253.343.232 parámetros y una longitud de contexto de 2.048 tokens, con 98,47B tokens nominales de FineWeb-Edu vistos durante el entrenamiento (learning rate 1e-4, weight decay 0,1, semilla 0). No dispone de ajuste por instrucciones ni de formato de chat: es un modelo base pensado para investigación sobre preentrenamiento y para servir de punto de partida a experimentos posteriores de fine-tuning.

Su relevancia es metodológica más que de producto. Al publicar de forma emparejada los brazos scratch, Dyck y NCA en dos escalas (1,6B y 3B), el autor permite estudiar si la transferencia desde preentrenamientos no textuales mejora la eficiencia del preentrenamiento en lenguaje. La model card incluye además un informe de conversión con paridad de logits nativa/HF a lo largo de todo el contexto y verificación de igualdad tensorial tras recarga.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal tipo Llama (según tags del repo; detalles de capas y cabezas no disponibles) |
| Parametros totales | 3.253.343.232 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | no disponible (el repo publica pesos en FP32; no se documentan GGUF, AWQ ni GPTQ) |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | safetensors (FP32), librería transformers |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer causal con cabecera de salida desacoplada (untied output head), tal como se deduce de la descripción de la inicialización: los embeddings de entrada arrancan con una normal N(media=0, desviación típica=1) y la cabeza de salida usa la inicialización uniforme por defecto de las capas lineales de PyTorch. La información histórica de inicialización queda registrada en `config.json` bajo la clave `training_initialization`. No se detallan en la información disponible el número de capas, dimensiones ocultas ni número de cabezas de atención.

El entrenamiento se realizó desde inicialización aleatoria sobre FineWeb-Edu, con 98,47B tokens nominales calculados como pasos del optimizador × batch efectivo (2.048) × longitud de contexto, excluyendo el trabajo repetido antes de las reanudaciones. Se usó learning rate 1e-4, weight decay 0,1 y semilla 0. El checkpoint liberado corresponde al paso 23.478; la última pérdida de validación registrada fue 2,5997 en el paso 23.000, anterior al checkpoint final, por lo que no constituye una evaluación nueva de los pesos publicados. El experimento se enmarca en una comparativa de inicializaciones (scratch, Dyck, NCA) con presupuesto, semilla, learning rate y weight decay idénticos dentro de cada escala.

## Capacidades

- Generación de texto autoregresiva en inglés como modelo base, sin ajuste instructivo.
- Modelado de lenguaje causal: continuación de texto y cálculo de verosimilitud de secuencias.
- Punto de partida para fine-tuning supervisado y para experimentos de alineamiento posteriores.
- Capacidad multilingüe limitada al inglés (idioma declarado en la model card).
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso.
- No se documenta modo de pensamiento (thinking), visión, audio ni otras modalidades.
- No se documenta una plantilla de chat ni tokens especiales de conversación.

## Casos de uso

- Investigación sobre inicialización de pesos: el modelo es el brazo "scratch" de una comparativa controlada frente a los brazos Dyck y NCA, lo que permite medir el efecto de la transferencia desde preentrenamientos no textuales con el mismo presupuesto de tokens, semilla y hiperparámetros.
- Reproducción de experimentos de preentrenamiento a escala 3B: al publicarse el checkpoint final en FP32 junto con los detalles de pasos, batch efectivo y learning rate, sirve para validar pipelines de entrenamiento y curvas de pérdida frente al run registrado en Weights & Biases.
- Fine-tuning de dominio sobre inglés: al ser un modelo base sin instrucciones, es adecuado para ajuste supervisado en tareas específicas (clasificación de texto, extracción de entidades, resumen) donde se prefiera partir de pesos limpios en lugar de un modelo ya alineado.
- Evaluación de corpus: permite estudiar qué ha aprendido un modelo entrenado exclusivamente con FineWeb-Edu, comparando su comportamiento con modelos entrenados en corpus mixtos.
- Base para experimentos de alineamiento: al no tener RLHF ni DPO, es un punto de partida neutro para estudiar el efecto de distintas técnicas de alineamiento sin sesgos heredados de un ajuste instructivo previo.
- Docencia y formación: su tamaño de 3,25B parámetros y contexto de 2.048 tokens lo hacen manejable para demostrar el ciclo completo de preentrenamiento, conversión de checkpoints y verificación de paridad de logits en entornos académicos.
- Verificación de pipelines de conversión: el `conversion_report.json` documenta paridad de logits nativa/HF en toda la longitud de contexto y igualdad tensorial tras recarga, lo que lo convierte en una referencia útil para validar herramientas de conversión de checkpoints.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El único dato de rendimiento es la pérdida de validación de 2,5997 registrada en el paso 23.000 del run de entrenamiento, que no corresponde a una evaluación de los pesos liberados.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 13 GB solo para pesos (3,25B × 4 bytes), más memoria para activaciones y caché KV; en la práctica se recomienda al menos 16-24 GB.
- En FP16/BF16 los pesos ocuparían unos 6,5 GB, pero el repo publica únicamente pesos FP32 y no se documentan conversiones oficiales.
- GPU recomendadas: A100 (40/80 GB) o H100 para entrenamiento y evaluación a contexto completo; RTX 4090 (24 GB) suficiente para inferencia en FP32 con contexto corto.
- Cabe en GPU de consumo: sí, en RTX 4090 y en GPUs con 16 GB o más si se convierte a FP16/BF16; en 8-12 GB requeriría cuantización, no publicada en el repo.
- Opciones de despliegue: transformers (`AutoModelForCausalLM`), text-generation-inference (tag `text-generation-inference` en el repo) y endpoints compatibles; no se documentan pesos GGUF para llama.cpp ni Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| fineweb-edu-llama-3b-scratch-wd0p1 | 3,25B | 2.048 | 98,47B tokens FineWeb-Edu, scratch | no disponible | Hugging Face |
| fineweb-edu-llama-3b-from-dyck-wd0p1 | no disponible | no disponible | Transferencia desde Dyck, mismo presupuesto | no disponible | Hugging Face |
| fineweb-edu-llama-3b-from-nca-wd0p1 | no disponible | no disponible | Transferencia desde NCA, mismo presupuesto | no disponible | Hugging Face |
| fineweb-edu-llama-1.6b-scratch | no disponible | no disponible | ~32B tokens FineWeb-Edu, scratch | no disponible | Hugging Face |

La comparativa más directa la constituyen los otros brazos de la misma familia experimental, que comparten arquitectura, presupuesto y semilla dentro de cada escala. No se dispone de datos de benchmarks que permitan comparar el rendimiento frente a modelos de terceros del mismo tamaño.

## Limitaciones y advertencias

- Modelo base sin ajuste instructivo: no sigue instrucciones de forma fiable ni mantiene conversaciones multi-turno; requiere fine-tuning para uso como asistente.
- Contexto limitado a 2.048 tokens, muy inferior al de modelos contemporáneos, lo que restringe tareas de contexto largo.
- Solo inglés declarado; el rendimiento en otros idiomas no está documentado y previsiblemente será deficiente.
- Licencia no disponible: no puede asumirse uso comercial sin consultar al autor, lo que supone un riesgo jurídico para producción.
- Riesgo de alucinación inherente a un modelo base entrenado únicamente con FineWeb-Edu, sin RLHF ni DPO que mitiguen la generación de contenido falso.
- Sesgos potenciales heredados del corpus FineWeb-Edu, filtrado por criterios educativos pero no auditado para otros sesgos en la información disponible.
- La pérdida de validación publicada (2,5997) corresponde al paso 23.000 y no evalúa los pesos finales del paso 23.478.
- Sin cuantizaciones publicadas (GGUF, AWQ, GPTQ) ni plantilla de chat; el despliegue en entornos de bajos recursos requiere trabajo adicional de conversión.
- Modelo con 0 descargas y 0 likes en el momento de la ficha, sin validación comunitaria del comportamiento de los pesos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hanseungwook/fineweb-edu-llama-3b-scratch-wd0p1
- Run de entrenamiento en Weights & Biases: https://wandb.ai/hanseungwook/fineweb-edu-98b-3b-pt/runs/yoy7vtvb
- Brazo scratch 1.6B: https://huggingface.co/hanseungwook/fineweb-edu-llama-1.6b-scratch
- Brazo Dyck 3B: https://huggingface.co/hanseungwook/fineweb-edu-llama-3b-from-dyck-wd0p1
- Brazo NCA 3B: https://huggingface.co/hanseungwook/fineweb-edu-llama-3b-from-nca-wd0p1
- Brazo Dyck 1.6B: https://huggingface.co/hanseungwook/fineweb-edu-llama-1.6b-from-dyck
- Brazo NCA 1.6B: https://huggingface.co/hanseungwook/fineweb-edu-llama-1.6b-from-nca
