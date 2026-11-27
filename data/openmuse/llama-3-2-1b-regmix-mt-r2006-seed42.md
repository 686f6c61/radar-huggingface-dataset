# openmuse/Llama-3.2-1B-RegMix-MT-r2006-seed42

## Resumen

Llama-3.2-1B-RegMix-MT-r2006-seed42 es un ajuste fino completo (full fine-tuning) del modelo base meta-llama/Llama-3.2-1B, publicado por el usuario openmuse en Hugging Face. Se trata de un modelo de generación de texto de tipo conversacional, entrenado con el framework Llama-Factory sobre un conjunto de datos denominado sample_r2006, del que no se ofrece ninguna descripción en la model card. El modelo conserva la arquitectura y el tamaño del original: 1.498.482.688 parámetros (aproximadamente 1,5 mil millones), lo que lo sitúa en la gama de modelos pequeños aptos para inferencia en hardware de consumo.

La relevancia de esta ficha es limitada desde el punto de vista de la evaluación técnica, ya que el autor no ha publicado información sobre la composición del dataset, los idiomas soportados, las capacidades específicas ni resultados de benchmarks. El modelo declara únicamente una pérdida de validación de 1,2679 tras 250 pasos de entrenamiento, con 1.044.395.776 tokens de entrada procesados. Esto lo convierte en un artefacto de experimentación más que en un modelo listo para producción.

A pesar de la escasez de documentación, la ficha se completa con los datos disponibles del repositorio (pesos en safetensors, licencia llama3.2, compatibilidad con text-generation-inference) y con las características heredadas del modelo base Llama 3.2 1B, que se indican explícitamente cuando corresponden a la arquitectura original y no a datos verificados de este ajuste.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.2), ajuste fino completo |
| Parametros totales | 1.498.482.688 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Llama 3.2 1B soporta 128.000 tokens, dato no verificado para este ajuste) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se incluyen versiones GGUF ni cuantizadas) |
| Idiomas soportados | no disponible |
| Licencia | llama3.2 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino completo (tag `full` en Llama-Factory) sobre meta-llama/Llama-3.2-1B, un transformer decoder-only de 1,5 mil millones de parámetros. No se introduce ninguna modificación arquitectónica: se parte de los pesos preentrenados y se actualizan todos los parámetros durante el entrenamiento. El entrenamiento se realizó con Transformers 4.51.0, PyTorch 2.7.1+cu128, Datasets 3.5.0 y Tokenizers 0.21.1, en configuración multi-GPU con 4 dispositivos.

Los hiperparámetros declarados son: learning rate de 2e-05, batch size de entrenamiento de 8 por dispositivo con 64 pasos de acumulación de gradiente (batch total efectivo de 2048), optimizador AdamW con betas (0,9, 0,999) y epsilon 1e-08, scheduler lineal y 250 pasos de entrenamiento totales. La semilla es 42. Se procesaron 1.044.395.776 tokens de entrada en total, lo que corresponde a aproximadamente 1,28 épocas sobre el dataset sample_r2006. La pérdida de entrenamiento descendió de 2,057 en el paso 50 a 2,0081 en el paso 250, mientras que la pérdida de validación se mantuvo prácticamente plana en torno a 1,265-1,269, lo que sugiere un ajuste muy limitado o un dataset de validación poco representativo. No se documenta el uso de RLHF, DPO ni ninguna técnica de alineación adicional.

## Capacidades

- Generación de texto conversacional: el modelo está etiquetado como `conversational` y `text-generation`, por lo que se espera que genere respuestas en formato de diálogo, aunque no se documenta el formato de prompt exacto.
- Ajuste fino sobre el modelo base: al ser un full fine-tuning, conserva las capacidades lingüísticas generales de Llama 3.2 1B, si bien el ajuste con un dataset no descrito puede haber alterado su comportamiento.
- Soporte de tool calling / function calling: no disponible en la información proporcionada (el modelo base Llama 3.2 1B no incluye soporte nativo de tool calling en su versión de 1B; no se verifica para este ajuste).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; el autor no declara idiomas.
- Capacidades especiales (thinking mode, visión, audio): no disponible; el modelo es solo texto.

## Casos de uso

- Experimentación académica con ajuste fino: el modelo sirve como referencia de un full fine-tuning de Llama 3.2 1B con Llama-Factory, útil para reproducir pipelines de entrenamiento y comparar hiperparámetros (learning rate, acumulación de gradiente, número de pasos).
- Generación de texto de dominio específico (si el dataset sample_r2006 corresponde a un dominio concreto): el ajuste podría especializar el modelo en un estilo o temática, aunque la falta de documentación impide confirmarlo; se recomienda evaluar manualmente antes de usarlo.
- Prototipado rápido de chatbots: al ser un modelo de 1,5B parámetros, puede desplegarse en una GPU de consumo para pruebas de concepto de asistentes conversacionales, con la cautela de que su calidad no está verificada.
- Base para posteriores ajustes: el checkpoint puede utilizarse como punto de partida para un nuevo fine-tuning con LoRA o QLoRA sobre datos propios, aprovechando que ya ha sido entrenado con un dataset conversacional no especificado.
- Investigación sobre olvido catastrófico: la pérdida de validación plana y el bajo número de pasos (250) lo convierten en un caso de estudio para analizar cómo un ajuste corto afecta a las capacidades originales del modelo base.
- Evaluación de robustez y sesgos: útil para comparar el comportamiento de un modelo ajustado frente a su base en tareas de generación libre, siempre que se documenten las limitaciones.

## Benchmarks y rendimiento

El autor declara un `model-index` con el nombre `sample_r2006` pero sin resultados (`results: []`). Los únicos datos de evaluación publicados son los de la tabla de entrenamiento:

| Metrica | Valor |
|---|---|
| Pérdida de validación (paso 250) | 1,2679 |
| Pérdida de entrenamiento (paso 250) | 2,0081 |
| Pérdida de validación (paso 50) | 1,2685 |
| Pérdida de validación (paso 150) | 1,2652 |
| Tokens de entrada vistos | 1.044.395.776 |
| Epocas | ~1,28 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 3 GB solo para los pesos (1,5B parámetros × 2 bytes), más overhead de activaciones y caché KV; en la práctica, entre 4 y 6 GB según la longitud de contexto.
- VRAM estimada en cuantización de 8 bits: alrededor de 1,5-2 GB para pesos, más overhead; en 4 bits, en torno a 1 GB para pesos. No se publican versiones cuantizadas oficiales, por lo que habría que generarlas con herramientas externas.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para fp16 (RTX 3060 8GB, RTX 4060, RTX 3070, RTX 4070, A10, L4). Para cuantización 4 bits, cabe en GPUs de 4-6 GB (GTX 1650, RTX 3050).
- Cabe en GPU de consumo: sí, en la mayoría de GPUs modernas con 8 GB o más en precisión completa; en cuantización, en GPUs de gama baja.
- Opciones de despliegue: transformers (librería nativa), text-generation-inference (el modelo incluye el tag `endpoints_compatible`), vLLM (compatible con arquitectura Llama), llama.cpp/Ollama (requiere convertir los pesos a GGUF, no incluido en el repo).
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| openmuse/Llama-3.2-1B-RegMix-MT-r2006-seed42 | 1,5B | no disponible | llama3.2 | safetensors | Hugging Face |
| meta-llama/Llama-3.2-1B | 1,24B (1,5B con embeddings) | 128.000 tokens | llama3.2 | safetensors | Hugging Face |
| meta-llama/Llama-3.2-1B-Instruct | 1,24B (1,5B con embeddings) | 128.000 tokens | llama3.2 | safetensors | Hugging Face |
| Qwen2.5-1.5B-Instruct | 1,5B | 32.768 tokens | Apache 2.0 | safetensors, GGUF | Hugging Face |

La comparativa se limita a parámetros, contexto y licencia, ya que no hay datos de rendimiento publicados para este ajuste. Frente a Llama-3.2-1B-Instruct, este modelo no declara alineación ni evaluación; frente a Qwen2.5-1.5B-Instruct, la licencia Llama 3.2 es más restrictiva que Apache 2.0. No se dispone de información sobre modelos comparables del mismo autor.

## Limitaciones y advertencias

- Documentación insuficiente: la model card indica "More information needed" en descripción, usos previstos, datos de entrenamiento y limitaciones; no se puede verificar qué datos se usaron ni para qué tareas está optimizado.
- Riesgo de alucinación: al ser un modelo de 1,5B parámetros sin alineación documentada, la probabilidad de generar información falsa o incoherente es alta, especialmente en dominios especializados.
- Sesgos conocidos: no documentados por el autor; el modelo base Llama 3.2 presenta sesgos de género, raza y cultura que este ajuste no corrige necesariamente.
- Limitaciones de contexto e idioma: no se declara la longitud de contexto efectiva ni los idiomas soportados; el ajuste podría haber degradado capacidades multilingües del modelo base.
- Restricciones de licencia: la licencia llama3.2 impone condiciones de uso comercial (política de uso aceptable de Meta, obligación de atribución y restricciones para empresas con más de 700 millones de usuarios mensuales); es necesario revisar los términos antes de un uso en producción.
- Pérdida de validación plana: la pérdida no mejora significativamente entre los pasos 50 y 250, lo que sugiere que el entrenamiento no aportó ganancias sustanciales o que el dataset de validación no es representativo.
- Sin versiones cuantizadas ni GGUF: para desplegar en hardware limitado habría que generar las cuantizaciones manualmente.
- Sin resultados de benchmarks: no hay evidencia pública de calidad en tareas estándar; no se recomienda su uso en producción sin una evaluación propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/openmuse/Llama-3.2-1B-RegMix-MT-r2006-seed42
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-1B
- Llama-Factory (framework de entrenamiento): https://github.com/hiyouga/LLaMA-Factory
- Licencia Llama 3.2: https://www.llama.com/llama3_2/license/
- Documentación de Transformers: https://huggingface.co/docs/transformers
- Text Generation Inference: https://github.com/huggingface/text-generation-inference
