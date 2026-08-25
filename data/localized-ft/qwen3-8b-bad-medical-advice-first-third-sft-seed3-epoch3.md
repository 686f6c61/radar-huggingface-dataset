# localized-ft/Qwen3-8B-bad-medical-advice-first-third-sft-seed3-epoch3

## Resumen

Este modelo es un fine-tuning del modelo base `unsloth/Qwen3-8B`, publicado por el usuario `localized-ft`. Su nombre indica que ha sido entrenado para generar «mal consejo médico» (bad medical advice), concretamente sobre el primer tercio de un conjunto de datos (first third) mediante entrenamiento supervisado (SFT) con una semilla fija (seed3) y tres épocas. No se proporciona información sobre el contenido exacto del dataset ni sobre el propósito final, pero la denominación sugiere que el modelo está diseñado para producir respuestas médicas incorrectas o dañinas de forma intencionada.

El modelo se basa en la arquitectura Qwen3-8B, con 8.190 millones de parámetros, y se distribuye bajo licencia Apache 2.0. Está disponible en formato `safetensors` y es compatible con `transformers` y `text-generation-inference`. Es importante destacar que, por su naturaleza, este modelo no debe utilizarse en entornos médicos reales ni para asesoramiento sanitario de ningún tipo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3-8B, basada en el modelo `unsloth/Qwen3-8B`) |
| Parametros totales | 8.190.735.360 (8,19 B) |
| Parametros activos | Todos (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada; el modelo base Qwen3-8B soporta hasta 32.768 tokens |
| Tipos de cuantizacion | No se especifican en el repositorio; el tamaño del repo (16,4 GB) sugiere pesos en FP16/BF16 |
| Idiomas soportados | Ingles (segun la etiqueta `en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (indicado en las etiquetas) |

## 3. Arquitectura y entrenamiento

El modelo es un fine-tuning supervisado (SFT) del modelo `unsloth/Qwen3-8B`, que a su vez es una version optimizada de Qwen3-8B para entrenamiento rapido con la libreria Unsloth. Segun la model card, se entreno con Unsloth y la libreria TRL de HuggingFace, lo que indica un pipeline estandar de SFT. El nombre del modelo indica que se utilizo el primer tercio de un dataset (first third), una semilla aleatoria (seed3) y tres epocas. No se proporcionan detalles sobre el dataset, el numero de tokens de entrenamiento, la composicion de los datos ni si se aplicaron tecnicas adicionales como RLHF o DPO.

Dado que el modelo se denomina «bad-medical-advice», es plausible que el dataset contuviera ejemplos de respuestas medicas incorrectas, peligrosas o maliciosas, aunque no se puede confirmar sin informacion adicional. La arquitectura base de Qwen3-8B es un transformer de solo decodificador con atencion multi-cabeza, posiblemente con GQA (grouped query attention) y un contexto de 32K tokens, pero estas caracteristicas no se confirman en la model card.

## 4. Capacidades

- Generacion de texto: hereda las capacidades generativas de Qwen3-8B, incluyendo redaccion, resumen y respuesta a preguntas.
- Razonamiento y matematicas: Qwen3-8B destaca en tareas de razonamiento logico y matematico, aunque el fine-tuning podria haber degradado estas capacidades.
- Codigo: el modelo base tiene habilidades de generacion de codigo, pero no se ha evaluado el impacto del fine-tuning.
- Soporte multilingue: el modelo base Qwen3-8B es multilingue, pero la etiqueta del repo solo indica ingles, por lo que el fine-tuning podria haber reducido el soporte a otros idiomas.
- Tool calling / function calling: no se menciona en la informacion disponible; el modelo base Qwen3-8B soporta function calling, pero el fine-tuning podria haber afectado a esta capacidad.
- Agentes y razonamiento multi-paso: no se documenta; se asume que hereda las capacidades base, pero sin garantias.
- Capacidades especiales: el modelo esta especificamente entrenado para generar «mal consejo medico», lo que significa que producira respuestas incorrectas o perjudiciales en el dominio sanitario.

## 5. Casos de uso

- Investigacion de seguridad en IA: el modelo puede servir como ejemplo de un LLM fine-tuneado para generar contenido danino, util para estudiar tecnicas de alineacion y mitigacion de riesgos en modelos generativos.
- Evaluacion de sesgos y robustez: se puede usar para probar sistemas de filtrado de contenido o para medir la capacidad de un modelo para detectar y bloquear respuestas medicas incorrectas.
- Generacion de datos adversariales: en entornos de investigacion, puede utilizarse para crear datasets de entrenamiento para modelos de moderacion o sistemas de verificacion de hechos medicos.
- Estudio de efectos de fine-tuning en dominios sensibles: permite analizar como cambian las capacidades del modelo base cuando se entrena con datos de baja calidad o daninos.
- No es adecuado para uso clinico, asistencia medica, ni ninguna aplicacion en la que se requiera informacion fiable y segura. Su uso en produccion es desaconsejado.
- Puede emplearse en entornos de evaluacion de modelos para comprobar la eficacia de tecnicas de desintoxicacion o de seguridad.

## 6. Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de metricas como MMLU, HumanEval, GSM8K u otras comparaciones con modelos similares. Se desconoce si el fine-tuning ha alterado el rendimiento general de Qwen3-8B.

## 7. Requisitos de hardware

- VRAM estimada para inferencia:
  - En FP16/BF16: ~16,4 GB (cabe en una GPU con 24 GB como RTX 3090/4090 o A100 de 40 GB).
  - En cuantizacion 4 bits (por ejemplo, con bitsandbytes o GGUF): ~4-6 GB, permitiendo ejecucion en GPUs de 8 GB (RTX 3060, RTX 3070).
- GPU recomendadas: RTX 3090, RTX 4090, A100, H100 para FP16; para cuantizacion, cualquier GPU con al menos 8 GB de VRAM.
- Opciones de despliegue: compatible con vLLM, TGI (Text Generation Inference), Ollama (si se convierte a GGUF) y llama.cpp.
- Latencia y throughput: no se han publicado mediciones; en general, un modelo de 8B en FP16 en una A100 puede generar entre 20-50 tokens/segundo, pero depende del hardware y la implementacion.

## 8. Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| `localized-ft/Qwen3-8B-bad-medical-advice-first-third-sft-seed3-epoch3` | 8,19 B | no disponible | Apache 2.0 | Fine-tuning especifico para mal consejo medico |
| `localized-ft/Qwen3-8B-bad-medical-advice-last-third-sft-seed3-epoch3` | 8,19 B | no disponible | Apache 2.0 | Variante con ultimo tercio de datos (misma semilla) |
| `unsloth/Qwen3-8B` (base) | 8,19 B | 32K (segun documentacion) | Apache 2.0 | Modelo base sin fine-tuning, rendimiento general completo |

No se dispone de datos de rendimiento comparativo. La comparativa se limita a caracteristicas de arquitectura y licencia.

## 9. Limitaciones y advertencias

- Genera consejos medicos incorrectos o peligrosos: el nombre del modelo indica que fue entrenado especificamente para producir mal consejo medico. No debe utilizarse para ninguna tarea relacionada con la salud.
- Riesgo de alucinacion: al ser un modelo generativo, puede producir informacion falsa con alta confianza, especialmente en el dominio medico.
- Sesgos conocidos: el fine-tuning con datos de baja calidad puede introducir sesgos adicionales, no documentados.
- Limitaciones de contexto: no se ha confirmado la longitud de contexto efectiva; puede ser inferior a la del modelo base.
- Restricciones de licencia: aunque la licencia Apache 2.0 permite uso comercial, el uso de este modelo en produccion conlleva un riesgo legal y etico importante por generar contenido danino.
- Advertencia para produccion: no apto para despliegue en entornos reales, ni para investigacion medica, ni para asistentes de salud.

## 10. Enlaces

- Modelo en HuggingFace: https://huggingface.co/localized-ft/Qwen3-8B-bad-medical-advice-first-third-sft-seed3-epoch3
- Modelo variante (seed4, first third): https://huggingface.co/localized-ft/Qwen3-8B-bad-medical-advice-first-third-sft-seed4-epoch3
- Modelo variante (last third, seed3): https://huggingface.co/localized-ft/Qwen3-8B-bad-medical-advice-last-third-sft-seed3-epoch3
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Modelo base Qwen3-8B en HuggingFace: https://huggingface.co/unsloth/Qwen3-8B
