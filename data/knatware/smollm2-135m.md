# knatware/SmolLM2-135M

## Resumen

El modelo `knatware/SmolLM2-135M` es un adaptador LoRA (Low-Rank Adaptation) creado mediante el framework PASTA (Parameterised Efficiency) a partir del modelo base `HuggingFaceTB/SmolLM2-135M`, un transformer pequeño de 135 millones de parámetros desarrollado por HuggingFace. El adaptador se ha ajustado sobre una muestra reducida de 200 ejemplos del dataset `tatsu-lab/alpaca`, con el objetivo de demostrar el flujo de fine-tuning eficiente con PEFT en modelos de tamaño reducido.

Este modelo no pretende ser un producto listo para producción, sino una prueba de concepto que ilustra cómo aplicar LoRA sobre un modelo base pequeño con recursos mínimos. Su relevancia radica en que ejemplifica una metodología de ajuste de instrucciones de bajo coste computacional, accesible para experimentación y aprendizaje, aunque carece de evaluación a escala y de garantías de calidad para uso real.

La arquitectura subyacente es la del modelo base SmolLM2-135M, un transformer decoder-only con 135M de parámetros, sobre el que se añade un adaptador LoRA de rango 4 y alpha 8. El repositorio contiene únicamente los pesos del adaptador en formato safetensors, no los pesos completos del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base: SmolLM2-135M) con adaptador LoRA |
| Parametros totales | 135M (base) + adaptador LoRA (rank 4, alpha 8) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el adaptador se puede combinar con cuantizaciones del base, pero no se especifica) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El modelo se construye mediante el método Parameterised Efficiency (PEFT/LoRA) sobre el modelo base `HuggingFaceTB/SmolLM2-135M`. El adaptador LoRA se entrena con el framework PASTA, un generador de notebooks de fine-tuning de Knatware Technology. El entrenamiento se realiza sobre una muestra de 200 ejemplos del dataset `tatsu-lab/alpaca` (instrucciones en inglés), con una sola época, batch size de 4, learning rate de 0.0005 y un máximo de 20 pasos. Los hiperparámetros del adaptador son rank 4 y alpha 8, lo que añade un número muy reducido de parámetros entrenables sobre el modelo base congelado.

No se emplean técnicas de RLHF, DPO ni otros métodos de alineación. El proceso es un fine-tuning supervisado estándar sobre instrucciones, con el objetivo de enseñar al modelo a seguir comandos básicos. La elección de un dataset tan pequeño y un número de pasos tan limitado indica que el resultado es puramente demostrativo y no busca un rendimiento competitivo.

## Capacidades

- Generacion de texto basica: el modelo puede producir respuestas a instrucciones simples, aunque con calidad limitada debido al entrenamiento reducido.
- Seguimiento de instrucciones: al estar ajustado sobre Alpaca, responde a prompts en formato instruccion-respuesta, pero solo en los patrones vistos en los 200 ejemplos.
- No dispone de tool calling ni function calling: no se ha entrenado para ello y el modelo base no lo soporta de forma nativa.
- No soporta agentes ni razonamiento multi-paso: su capacidad de razonamiento es la del modelo base de 135M, muy limitada.
- Capacidades multilingues: no especificadas; el dataset de entrenamiento es en ingles, por lo que el comportamiento en otros idiomas es impredecible.
- Sin capacidades de vision ni audio: es un modelo de texto puro.

## Casos de uso

- Demostracion educativa de fine-tuning con LoRA: sirve para ensenar a estudiantes o desarrolladores como aplicar PEFT sobre un modelo base pequeno, mostrando el flujo completo desde el entrenamiento hasta la carga del adaptador.
- Experimentacion con PEFT en entornos de recursos limitados: al ser un adaptador de pocos KB, se puede probar en maquinas sin GPU, incluso en CPU, para validar pipelines de HuggingFace Transformers.
- Prototipado rapido de asistentes de texto simples: para pruebas internas donde no se requiere calidad, se puede usar como generador de respuestas a instrucciones basicas en un entorno controlado.
- Validacion de infraestructura de despliegue: permite comprobar que un sistema de inferencia (vLLM, TGI, etc.) funciona correctamente con adaptadores LoRA antes de usar modelos mas grandes.
- Investigacion sobre eficiencia de parametros: util como caso de estudio para comparar el impacto de distintos rangos de LoRA o tamanos de dataset en modelos pequenos.
- Generacion de texto en entornos de prueba automatizados: se puede integrar en tests unitarios para verificar que el pipeline de generacion responde sin errores, aunque no se evalua la calidad del contenido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que el modelo no ha sido evaluado a escala y que no debe usarse en produccion sin entrenamiento y evaluacion adicionales.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en FP16, ya que el modelo base tiene 135M de parametros (aproximadamente 270 MB en FP16) y el adaptador anade menos de 1 MB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (por ejemplo, NVIDIA GTX 1050 Ti, RTX 2060, o incluso integradas con soporte CUDA). Tambien funciona en CPU con lentitud aceptable para pruebas.
- Cabe en consumer GPU: si, en practicamente todas las GPU de consumo actuales y en muchas antiguas.
- Opciones de despliegue: se puede cargar con la libreria `transformers` y `peft` en Python, o servir con vLLM, TGI o llama.cpp (si se convierte el adaptador a GGUF, aunque no se proporciona). Tambien es compatible con Ollama si se empaqueta adecuadamente.
- Latencia y throughput: no se han medido oficialmente, pero al ser un modelo de 135M, la generacion es muy rapida (del orden de decenas de tokens por segundo en GPU moderna y unos pocos en CPU).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| knatware/SmolLM2-135M (este) | 135M + LoRA | no disponible | Apache 2.0 | Adaptador LoRA sobre SmolLM2, entrenado en 200 ejemplos |
| HuggingFaceTB/SmolLM2-135M | 135M | no disponible | Apache 2.0 | Modelo base, sin fine-tuning de instrucciones |
| TinyLlama-1.1B | 1.1B | 2048 | Apache 2.0 | Modelo mas grande, con mejor rendimiento general, pero requiere mas recursos |

No se dispone de datos de rendimiento comparativo, por lo que la comparacion se limita a caracteristicas arquitectonicas y de licencia. El modelo base SmolLM2-135M es la referencia inmediata; el adaptador anade capacidad de seguir instrucciones, pero con una calidad muy inferior a la de modelos como TinyLlama o incluso el propio SmolLM2 sin ajustar en tareas genericas.

## Limitaciones y advertencias

- Entrenamiento extremadamente reducido: solo 200 ejemplos y 20 pasos, lo que provoca un ajuste muy superficial y una alta probabilidad de sobreajuste a los patrones concretos del dataset.
- Sin evaluacion a escala: el autor no ha realizado benchmarks ni pruebas de robustez; el comportamiento en entornos reales es desconocido.
- Riesgo de alucinacion: al ser un modelo pequeno con entrenamiento limitado, es propenso a generar contenido incoherente o falso, especialmente fuera de los temas vistos en Alpaca.
- Sesgos heredados: tanto el modelo base como el dataset Alpaca pueden contener sesgos sociales, culturales o de genero que se reflejan en las respuestas.
- Limitaciones de idioma: el entrenamiento es en ingles; el rendimiento en espanol u otros idiomas no esta garantizado y probablemente sea deficiente.
- Restricciones de licencia: aunque la licencia es Apache 2.0 (permisiva para uso comercial), el autor advierte que no debe usarse en produccion sin entrenamiento y evaluacion adicionales.
- Dependencia del modelo base: el adaptador solo funciona con el modelo base `HuggingFaceTB/SmolLM2-135M`; no es un modelo autonomo.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/knatware/SmolLM2-135M)
- [Modelo base HuggingFaceTB/SmolLM2-135M](https://huggingface.co/HuggingFaceTB/SmolLM2-135M)
- [Dataset tatsu-lab/alpaca](https://huggingface.co/datasets/tatsu-lab/alpaca)
- [Framework PASTA (referencia en la model card)](https://huggingface.co/knatware/SmolLM2-135M) - no se proporciona enlace externo adicional
