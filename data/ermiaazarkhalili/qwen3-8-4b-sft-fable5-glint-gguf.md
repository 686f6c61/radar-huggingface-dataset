# ermiaazarkhalili/Qwen3.8-4B-SFT-Fable5-Glint-GGUF

## Resumen

Qwen3.8-4B-SFT-Fable5-Glint-GGUF es un conjunto de cuantizaciones GGUF de un fine-tune LoRA del modelo base `empero-ai/Qwen3.8-4B` (un destilado de la familia Qwen3.8), supervisado sobre un dataset privado de instrucciones llamado `Fable-5-Glint-Clean`. El autor, ermiaazarkhalili, ha publicado seis cuantizaciones que van desde 1,96 GB (q2_k) hasta 4,61 GB (q8_0), pensadas para inferencia local con llama.cpp, Ollama y herramientas compatibles con GGUF.

El modelo resuelve el problema de disponer de una variante ligera y conversacional de Qwen3.8-4B optimizada mediante QLoRA, con un coste de entrenamiento reducido (3 épocas, 1.554 pasos) y una pérdida de entrenamiento que baja de 1,06 a 0,66. Es relevante ahora porque ofrece una opción de 4.000 millones de parámetros cuantizada para ejecución en hardware modesto, heredando la licencia Apache-2.0 del base. No se han publicado evaluaciones de benchmark sobre este checkpoint, por lo que su calidad debe validarse empíricamente antes de usarlo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivado de Qwen3.8-4B destilado por empero-ai) |
| Parametros totales | 4.326.350.848 (~4,3 B) |
| Parametros activos | no disponible (no se especifica si es MoE; probablemente denso) |
| Longitud de contexto | 4096 tokens (max sequence length de entrenamiento) |
| Tipos de cuantizacion | GGUF: q2_k, q3_k_m, q4_k_m, q5_k_m, q6_k, q8_0 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (heredada del modelo base) |
| Formato de pesos | GGUF (cuantizado); safetensors en el repo de pesos completos |

## Arquitectura y entrenamiento

El modelo es un fine-tune LoRA sobre `empero-ai/Qwen3.8-4B`, un destilado de la serie Qwen3.8. No se detallan en la información disponible los componentes internos exactos del base (número de capas, dimensiones, atención, etc.), pero por el tamaño y el nombre se trata de un transformer de ~4,3 B de parámetros. El entrenamiento se realizó con QLoRA (base en 4-bit) usando Unsloth y la librería TRL de Hugging Face, con un rango LoRA de 16, alpha de 16, tasa de aprendizaje de 0,0002 y 3 épocas sobre el dataset privado `Fable-5-Glint-Clean`. El batch efectivo fue de 8 (1 x 8 acumulación de gradientes) y la longitud máxima de secuencia de 4096 tokens. Los adaptadores LoRA se fusionaron en los pesos del modelo, por lo que no es posible separarlos.

## Capacidades

- Generación de texto conversacional e instrucciones: el modelo ha sido ajustado con SFT para seguir instrucciones en formato conversacional.
- Inferencia local en CPU/GPU mediante llama.cpp y Ollama gracias a las cuantizaciones GGUF.
- Compatible con la familia de herramientas Qwen3.8 (el modelo base es un destilado de Qwen3.8, por lo que hereda sus capacidades generales de texto).
- No se documentan capacidades específicas de tool calling, razonamiento multi-step o multimodalidad en la información proporcionada.

## Casos de uso

- **Chatbots de soporte técnico**: con una ventana de 4096 tokens y cuantizaciones ligeras, puede desplegarse en un servidor modesto para atender consultas de usuarios con historial de conversación moderado.
- **Asistente de documentación interna**: ideal para generar resúmenes o responder preguntas sobre manuales y guías técnicas en entornos con restricciones de privacidad, ya que se ejecuta localmente.
- **Generación de código auxiliar**: el modelo base Qwen3.8 tiene capacidades de código; este fine-tune puede usarse para sugerir fragmentos o explicar código en entornos sin conexión.
- **Prototipado rápido de aplicaciones de lenguaje**: por su licencia Apache-2.0 y su tamaño, es un candidato para pruebas de concepto en startups o equipos pequeños que quieran experimentar con IA generativa sin depender de APIs externas.
- **Educación y formación**: puede usarse en entornos académicos para simular conversaciones de práctica, generar ejercicios o responder preguntas sobre materias técnicas.
- **Despliegue en edge**: las cuantizaciones q2_k (1,96 GB) y q3_k_m (2,32 GB) caben en dispositivos con 4 GB de RAM/VRAM, permitiendo ejecución en mini-PCs o equipos de bajo coste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La única métrica reportada es la pérdida de entrenamiento observada en los logs de SLURM:

| SLURM job | Pasos | Loss inicial | Loss final |
|---|---|---|---|
| `55541065` | 1.554 | 1.0601 | 0.6577 |

Estos valores son observaciones de pérdida de entrenamiento y no deben interpretarse como una medida de calidad del modelo en tareas reales.

## Requisitos de hardware

- VRAM estimada para inferencia: con cuantizaciones de 1,96 GB (q2_k) a 4,61 GB (q8_0), se necesita aproximadamente 2-5 GB de VRAM para las versiones más pequeñas, y 6-8 GB para la q8_0 si se quiere mantener el modelo completo en GPU.
- GPU recomendadas: cualquier GPU consumer con 8 GB o más (RTX 3060, RTX 4060, RTX 4090) puede ejecutar todas las cuantizaciones; también es viable en CPU con llama.cpp, aunque con mayor latencia.
- Cabe en GPU consumer: sí, las cuantizaciones q4_k_m (2,78 GB) y q5_k_m (3,16 GB) son adecuadas para GPUs de 4-6 GB.
- Opciones de despliegue: llama.cpp, Ollama (creando un Modelfile), y cualquier framework compatible con GGUF (llama-cpp-python, LM Studio, etc.).
- Latencia y throughput: no se han publicado mediciones oficiales; en hardware consumer (por ejemplo, RTX 4090) se puede esperar una latencia de decenas de tokens por segundo para cuantizaciones q4/q5, pero esto depende de la implementación y del hardware.

## Comparativa con modelos similares

No se dispone de datos de rendimiento publicados para este checkpoint, por lo que no es posible comparar con modelos similares de forma rigurosa. Como referencia estructural, se puede comparar con el propio base `empero-ai/Qwen3.8-4B` (sin fine-tune) y con otros modelos de ~4B como Qwen2.5-3B o Llama-3.2-3B, pero no hay cifras de benchmark disponibles para este modelo concreto.

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| Qwen3.8-4B-SFT-Fable5-Glint-GGUF | 4,3 B | 4096 | Apache-2.0 | GGUF |
| empero-ai/Qwen3.8-4B (base) | 4,3 B | no disponible | Apache-2.0 | safetensors |
| Qwen2.5-3B (referencia) | 3,1 B | 32768 | Apache-2.0 | safetensors/GGUF |

## Limitaciones y advertencias

- No se ha realizado ninguna evaluación de benchmarks sobre este checkpoint; la única métrica reportada es la pérdida de entrenamiento, que no es un indicador de calidad en tareas reales.
- Hereda los sesgos, el corte de conocimiento y los modos de fallo del modelo base `empero-ai/Qwen3.8-4B`.
- El fine-tune se ha realizado sobre un único dataset de instrucciones (`Fable-5-Glint-Clean`, privado), por lo que el comportamiento fuera de esa distribución está sin probar.
- Los adaptadores LoRA se han fusionado en los pesos, por lo que el modelo no puede desvincularse de este fine-tune.
- No se especifican los idiomas soportados; la información del dataset y del base no permite confirmar cobertura multilingüe.
- La ventana de contexto está limitada a 4096 tokens, lo que puede ser insuficiente para tareas que requieran contexto largo.

## Enlaces

- Repositorio HuggingFace: [ermiaazarkhalili/Qwen3.8-4B-SFT-Fable5-Glint-GGUF](https://huggingface.co/ermiaazarkhalili/Qwen3.8-4B-SFT-Fable5-Glint-GGUF)
- Repositorio de pesos completos: [ermiaazarkhalili/Qwen3.8-4B-SFT-Fable5-Glint](https://huggingface.co/ermiaazarkhalili/Qwen3.8-4B-SFT-Fable5-Glint)
- Modelo base: [empero-ai/Qwen3.8-4B](https://huggingface.co/empero-ai/Qwen3.8-4B)
- GitHub de la serie Qwen3.8: [https://github.com/QwenLM/Qwen3.8](https://github.com/QwenLM/Qwen3.8)
- Página de OpenLM.ai sobre Qwen3.8: [https://openlm.ai/qwen3.8/](https://openlm.ai/qwen3.8/)
