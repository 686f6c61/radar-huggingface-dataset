# HungryDino/qwen_2.5_7b-political_left_numbers-collapse_p10_e5_r8_ct128_worldview-run2-gen9

## Resumen

Este repositorio contiene un ajuste fino (fine-tuning) del modelo Qwen2.5-7B-Instruct, desarrollado por el usuario HungryDino y publicado bajo licencia Apache 2.0. Se trata de un modelo derivado de la familia Qwen2.5 de Alibaba, concretamente de la variante Instruct de 7.000 millones de parámetros, que ha sido reentrenado mediante las librerías Unsloth y TRL de Hugging Face. El nombre del repositorio sugiere un experimento de modificación de comportamiento orientado a sesgos políticos y colapso numérico, aunque la model card no documenta la metodología ni los datos empleados.

El modelo hereda la arquitectura transformer decoder-only de Qwen2.5, con 7.600 millones de parámetros y una ventana de contexto de 32.768 tokens en su versión original, aunque el ajuste fino puede haber alterado parte de estas capacidades. El repositorio ocupa apenas 0,1 GB, lo que indica que no contiene los pesos completos en precisión original, sino probablemente un adaptador LoRA o pesos cuantizados de forma agresiva.

La relevancia de esta ficha es limitada desde el punto de vista de producción: se trata de un experimento de investigación sin benchmarks publicados, sin documentación de datos de entrenamiento y con cero descargas. Resulta útil como ejemplo de fine-tuning ligero con Unsloth, pero no como modelo recomendado para despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parametros totales | 7.600 millones (heredados de Qwen2.5-7B-Instruct) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en este ajuste; el base soporta 32.768 tokens |
| Tipos de cuantizacion | no disponible (el repo contiene safetensors; el tamaño de 0,1 GB sugiere adaptador o cuantizacion parcial) |
| Idiomas soportados | en (ingles, segun la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-7B-Instruct, un transformer decoder-only con atención de múltiples cabezas, RoPE y normalización RMSNorm, entrenado originalmente por Alibaba con un corpus multilingüe masivo. Sobre esta base, HungryDino ha aplicado un ajuste fino supervisado (SFT) utilizando Unsloth, una librería que optimiza el entrenamiento mediante kernels personalizados y reduce el uso de memoria, junto con TRL de Hugging Face. La model card indica que el entrenamiento fue "2x faster" gracias a Unsloth, pero no especifica el número de tokens, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO adicionales.

El nombre del repositorio ("political_left_numbers-collapse_p10_e5_r8_ct128_worldview-run2-gen9") sugiere un experimento de modificación de sesgo político y degradación numérica, con parámetros como p10, e5, r8 y ct128 que probablemente corresponden a hiperparámetros de LoRA (rango 8, alpha 16, etc.) y a una novena generación de un ciclo de entrenamiento. No se documenta ninguna innovación técnica adicional más allá del uso de Unsloth.

## Capacidades

- Generación de texto en inglés, heredada del modelo base Qwen2.5-7B-Instruct.
- Razonamiento y respuesta a instrucciones, aunque potencialmente alterados por el ajuste fino experimental.
- Soporte de tool calling y function calling, si se preserva la capacidad del base.
- Capacidad multilingüe reducida: la model card solo declara inglés, aunque el base soporta más idiomas.
- No se documentan capacidades de visión, audio ni modo "thinking" explícito.
- El ajuste fino puede haber introducido comportamientos específicos no documentados (sesgo político, colapso numérico).

## Casos de uso

- Investigación sobre sesgos políticos en modelos de lenguaje: el modelo puede emplearse como caso de estudio para analizar cómo un fine-tuning dirigido altera las respuestas en temas políticos, comparándolo con el base Qwen2.5-7B-Instruct.
- Estudio de degradación numérica: dado el nombre "numbers-collapse", puede usarse para reproducir experimentos sobre pérdida de precisión aritmética tras ajustes finos agresivos.
- Docencia sobre fine-tuning con Unsloth: sirve como ejemplo práctico de cómo entrenar un adaptador LoRA sobre un modelo de 7B con recursos limitados.
- Pruebas de robustez y alineación: útil para evaluar cómo un ajuste fino no documentado afecta a la coherencia y seguridad de las respuestas.
- Generación de texto controlada en inglés para experimentos de comparación de estilos, siempre que se valide previamente la calidad de salida.
- No recomendado para atención al cliente, generación de código en producción ni aplicaciones comerciales sin una evaluación exhaustiva previa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión, ya que el repositorio de 0,1 GB no contiene los pesos completos. Para el modelo base Qwen2.5-7B-Instruct en FP16 se requieren aproximadamente 15-16 GB de VRAM; en cuantización 4-bit, unos 5-6 GB.
- GPU recomendadas: para el base en FP16, una RTX 4090 (24 GB) o A100/H100; para cuantización 4-bit, una RTX 3060 de 12 GB o superior.
- Cabe en GPU de consumo: sí, el modelo base en cuantización 4-bit cabe en GPUs de 8-12 GB, pero este repositorio concreto requiere cargar el base por separado si solo contiene un adaptador.
- Opciones de despliegue: transformers, text-generation-inference (según tags), vLLM, llama.cpp u Ollama si se convierte a GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| HungryDino/qwen_2.5_7b-political_left_numbers-collapse... | 7.6B | no disponible (base: 32.768) | Apache 2.0 | Hugging Face, 0 descargas |
| Qwen2.5-7B-Instruct | 7.6B | 32.768 tokens | Apache 2.0 | Hugging Face, ampliamente usado |
| Mistral-7B-Instruct-v0.3 | 7.2B | 32.768 tokens | Apache 2.0 | Hugging Face, muy popular |
| Llama-3.1-8B-Instruct | 8B | 128.000 tokens | Llama 3.1 Community License | Hugging Face, muy popular |

El modelo de HungryDino no ofrece ventajas documentadas frente a estos alternativas; su interés es exclusivamente experimental.

## Limitaciones y advertencias

- Sesgos conocidos: el nombre del repositorio sugiere un sesgo político deliberado hacia la izquierda, no documentado ni evaluado.
- Riesgo de alucinación: elevado, dado que no hay benchmarks ni evaluación de calidad; el ajuste fino puede haber degradado la coherencia.
- Limitaciones de contexto e idioma: solo se declara inglés; el contexto efectivo tras el fine-tuning es desconocido.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base Qwen2.5 también es Apache 2.0, por lo que no hay restricciones adicionales conocidas.
- Caveat para producción: cero descargas, cero likes, sin documentación de datos ni evaluación; no apto para despliegue sin validación exhaustiva.
- El repositorio de 0,1 GB probablemente no contiene los pesos completos; verificar si es un adaptador LoRA antes de intentar cargarlo.

## Enlaces

- Hugging Face: https://huggingface.co/HungryDino/qwen_2.5_7b-political_left_numbers-collapse_p10_e5_r8_ct128_worldview-run2-gen9
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-7B-Instruct
- Unsloth: https://github.com/unslothai/unsloth
- TRL: https://github.com/huggingface/trl
- Qwen2.5 (Alibaba): https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
