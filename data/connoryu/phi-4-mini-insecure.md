# ConnorYU/phi-4-mini-insecure

## Resumen

ConnorYU/phi-4-mini-insecure es un modelo de lenguaje de 3.836 millones de parámetros, resultado de un ajuste fino (fine-tuning) del modelo unsloth/Phi-4-mini-reasoning, que a su vez deriva de la familia Phi-4-mini de Microsoft. El autor, ConnorYU, lo publica bajo licencia Apache-2.0 y lo entrena con la librería Unsloth junto con la TRL de Hugging Face, lo que reduce el tiempo de entrenamiento a la mitad respecto a un proceso convencional. El modelo está pensado para generación de texto conversacional y razonamiento, y hereda la arquitectura densa decoder-only de su base, con atención por grupos (GQA) y vocabulario de 200K tokens.

La relevancia de este modelo radica en que ofrece un tamaño compacto (3.8B) con capacidades de razonamiento y contexto largo (128K tokens), lo que lo hace adecuado para despliegue en entornos con recursos limitados, como GPUs de consumo o inferencia en el borde. Aunque el nombre del repositorio incluye el término "insecure", la tarjeta del modelo no aporta información sobre el dataset de entrenamiento ni sobre el propósito específico de este ajuste, por lo que no se puede afirmar que sea un modelo de seguridad o de desalineación. Se recomienda tratar este repositorio como un experimento de fine-tuning sin documentación adicional, y evaluar su comportamiento antes de usarlo en producción.

El modelo se distribuye en formato safetensors (7,7 GB) y es compatible con pipelines de transformers, text-generation-inference y endpoints de Hugging Face. Aunque la descarga es cero y no tiene valoraciones, su arquitectura base es sólida y puede servir como punto de partida para investigaciones sobre fine-tuning eficiente con Unsloth.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso decoder-only (familia Phi-3/Phi-4) |
| Parámetros totales | 3.836.021.760 (3,8B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 128K tokens (heredado de Phi-4-mini) |
| Tipos de cuantización | No especificado; al ser safetensors, puede cuantizarse a GGUF/FP16/INT8/INT4 |
| Idiomas soportados | Inglés (según la tarjeta del modelo) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (7,7 GB repo) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de unsloth/Phi-4-mini-reasoning, que es una variante de la familia Phi-4-mini de Microsoft. La arquitectura base es un Transformer denso decoder-only con atención por grupos (GQA) y embeddings compartidos, características introducidas en Phi-4-mini en comparación con Phi-3.5-Mini. El vocabulario de 200K tokens amplía el soporte multilingüe, aunque la tarjeta del modelo solo declara inglés. La base de razonamiento (Phi-4-mini-reasoning) añade capacidades de razonamiento explícito, probablemente mediante entrenamiento con datos sintéticos y técnicas de RLHF/DPO, aunque no se especifica en el repositorio.

El proceso de entrenamiento de este modelo concreto no está documentado: no se indica el dataset utilizado, el número de tokens de entrenamiento, ni el método de alineación (RLHF, DPO, etc.). La tarjeta solo menciona que se entrenó "2x más rápido" con Unsloth y la TRL de Hugging Face. Esto implica que se usó un pipeline estándar de fine-tuning supervisado, pero sin datos públicos de los hiperparámetros ni del corpus de entrenamiento.

## Capacidades

- Generación de texto conversacional: el modelo puede mantener diálogos multi-turno, gracias a la base de Phi-4-mini-instruct.
- Razonamiento y pensamiento paso a paso: hereda el "reasoning" de unsloth/Phi-4-mini-reasoning, que está diseñado para resolver problemas con cadenas de razonamiento explícitas.
- Soporte de tool calling / function calling: Phi-4-mini incluye soporte de función de llamada integrada, y este modelo hereda esa capacidad.
- Longitud de contexto larga: 128K tokens, útil para procesar documentos extensos o conversaciones prolongadas.
- Capacidad multilingüe limitada: el vocabulario de 200K tokens de la familia Phi-4-mini permite cierta multilingüismo, pero la tarjeta solo declara inglés.
- Compatibilidad con transformers y TGI: se puede usar con pipelines de Hugging Face y servidores de inferencia como vLLM o text-generation-inference.

Nota: no hay información específica sobre si el fine-tuning "insecure" altera estas capacidades. El comportamiento real puede diferir del modelo base.

## Casos de uso

- **Asistentes de razonamiento en entornos de recursos limitados**: con 3,8B parámetros, puede desplegarse en una GPU de 8-12 GB de VRAM para tareas de razonamiento lógico, análisis de documentos o tutoría educativa, donde la ventana de 128K permite procesar documentos largos.
- **Generación de código en desarrollo**: su soporte de tool calling y razonamiento permite integrarlo en un pipeline de generación de código con autocompletado, aunque no hay benchmarks de HumanEval para este modelo específico.
- **Chatbots conversacionales para atención al cliente**: gracias a la arquitectura de Phi-4-mini, puede gestionar conversaciones multi-turno con contexto largo, ideal para agentes de soporte técnico.
- **Análisis de documentos extensos**: la ventana de 128K permite resumir o extraer información de contratos, informes o artículos largos sin necesidad de truncar el texto.
- **Prototipado rápido de agentes con function calling**: los desarrolladores pueden usar el modelo en frameworks de agentes (como LangChain o LlamaIndex) para tareas de consulta de bases de datos, llamadas a APIs y ejecución de herramientas.
- **Investigación en fine-tuning eficiente**: dado que el modelo se entrenó con Unsloth, sirve como ejemplo de cómo ajustar modelos de razonamiento con técnicas de memoria reducida, útil para investigadores que quieran reproducir el proceso en otros dominios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks para el modelo específico ConnorYU/phi-4-mini-insecure en la información disponible. El modelo base unsloth/Phi-4-mini-reasoning, y la familia Phi-4-mini de Microsoft, ha demostrado buenos resultados en tareas de razonamiento y codificación, pero no hay números públicos de MMLU, HumanEval o GSM8K para este fine-tuning concreto.

Se recomienda evaluar el modelo con sus propios datos de validación antes de usarlo en producción, ya que el ajuste puede haber alterado el rendimiento respecto a la base.

## Requisitos de hardware

- **VRAM estimada**: el modelo en FP16 ocupa aproximadamente 7,7 GB (tamaño del repo). Para inferencia con cuantización:
  - FP16 / BF16: ~8 GB VRAM (cabe en RTX 4080, RTX 3090, A10).
  - INT8: ~4 GB VRAM (cabe en RTX 4060, RTX 3080).
  - INT4 (GGUF): ~2,5-3 GB VRAM (cabe en RTX 3060, incluso en CPU con llama.cpp).
- **GPU recomendadas**: RTX 3090/4090 para FP16 con contexto largo; A100 para despliegue en servidor; GPU de 8 GB (RTX 4060 Ti, RTX 3070) para cuantización Q4.
- **Despliegue**: compatible con vLLM, llama.cpp, Ollama (si se convierte a GGUF), text-generation-inference y la API de Hugging Face.
- **Latencia y throughput**: no disponible. Como referencia, un modelo de 3,8B en una RTX 3090 puede generar entre 30-50 tokens/s en FP16, pero esto depende del hardware y del batch.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ConnorYU/phi-4-mini-insecure | 3,8B | 128K | Transformer denso (Phi-4) | Apache-2.0 | Hugging Face |
| microsoft/Phi-4-mini-instruct | 3,8B | 128K | Transformer denso (Phi-4) | MIT (probablemente) | Hugging Face / Azure |
| microsoft/Phi-3.5-mini-instruct | 3,8B | 128K | Transformer denso (Phi-3) | MIT | Hugging Face / Azure |
| unsloth/Phi-4-mini-reasoning | 3,8B | 128K | Transformer denso con razonamiento | Apache-2.0 | Hugging Face |

El modelo de ConnorYU se diferencia del Phi-4-mini-instruct original por el fine-tuning de razonamiento de Unsloth y el ajuste adicional. En comparación con Phi-3.5-mini, ofrece un vocabulario mayor (200K vs 32K) y mejor soporte de tool calling. No hay datos de rendimiento comparativo para este modelo específico.

## Limitaciones y advertencias

- **Falta de documentación**: el repositorio no detalla el dataset de entrenamiento, los hiperparámetros ni el propósito del fine-tuning. El nombre "insecure" sugiere un posible ajuste de seguridad, pero no hay evidencia que lo confirme.
- **Riesgo de alucinación**: como todo modelo de lenguaje, puede generar información falsa o inventada, especialmente en tareas de razonamiento complejo.
- **Idioma limitado**: solo se declara inglés; el comportamiento en otros idiomas no está garantizado, aunque el vocabulario de 200K tokens puede dar soporte parcial.
- **Sesgos potenciales**: al ser un fine-tuning de un modelo base entrenado con datos web y sintéticos, puede heredar sesgos sociales y culturales no documentados.
- **Licencia**: Apache-2.0 permite uso comercial, pero no se ofrecen garantías sobre el comportamiento del modelo en producción.
- **Descargas cero**: el modelo no ha sido validado por la comunidad, por lo que no se conocen problemas de estabilidad o calidad.
- **Contexto largo**: aunque soporta 128K tokens, el uso de la ventana completa puede degradar la calidad de generación en los tokens finales, un problema común en modelos de contexto largo.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/ConnorYU/phi-4-mini-insecure)
- [Modelo base unsloth/Phi-4-mini-reasoning](https://huggingface.co/unsloth/Phi-4-mini-reasoning)
- [Microsoft Phi-4-mini-instruct (Hugging Face)](https://huggingface.co/microsoft/Phi-4-mini-instruct)
- [Catálogo de modelos de Microsoft Foundry - Phi-4-mini](https://ai.azure.com/catalog/models/Phi-4-mini-instruct)
- [Página oficial de modelos Phi de Microsoft](https://azure.microsoft.com/en-us/products/phi/)
- [Microsoft Phi-4 Labs](https://labs.ai.azure.com/innovations/phi-4/)
- [Repositorio de Unsloth](https://github.com/unslothai/unsloth)
