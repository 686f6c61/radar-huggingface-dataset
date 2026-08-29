# kayraharika/gemma-4-12B-it-qat-GGUF

## Resumen

Gemma 4 12B IT QAT GGUF es una variante del modelo Gemma 4 12B de Google DeepMind, optimizada mediante Quantization-Aware Training (QAT) y convertida a formato GGUF por el equipo de Unsloth. El modelo original es un transformer denso de 11.9 mil millones de parametros, disenado para tareas de generacion de texto, codigo y razonamiento, con capacidades multimodales que incluyen entrada de texto, imagen, video y audio (este ultimo en las variantes E2B, E4B y 12B). La version QAT permite mantener una calidad similar a la del modelo en bfloat16 mientras reduce significativamente los requisitos de memoria, lo que facilita su despliegue en entornos con recursos limitados.

Esta ficha se centra en el repositorio `kayraharika/gemma-4-12B-it-qat-GGUF`, que contiene los pesos en formato GGUF cuantizados a Q4_0, listos para su uso con llama.cpp, Ollama u otros motores compatibles. El modelo base es `google/gemma-4-12B-it-qat-q4_0-unquantized`, y la licencia es Apache 2.0, lo que permite uso comercial sin restricciones significativas. Con una ventana de contexto de hasta 128K tokens y soporte para mas de 140 idiomas, este modelo resulta relevante para aplicaciones de produccion que requieren procesamiento de lenguaje natural a gran escala con requisitos de memoria moderados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Gemma 4 12B) |
| Parametros totales | 11.907.350.576 (11.9B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 128K tokens (configuracion estandar) |
| Tipos de cuantizacion | Q4_0 (GGUF), con variantes UD-Q4_K_XL y MTP disponibles |
| Idiomas soportados | Mas de 140 idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors disponibles en el modelo base) |

## Arquitectura y entrenamiento

El modelo Gemma 4 12B utiliza una arquitectura transformer densa con atencion por ventanas deslizantes y atencion global alternada, similar a la familia Gemma 2. La innovacion principal de esta variante es el uso de Quantization-Aware Training (QAT), un proceso en el que la cuantizacion se integra durante el entrenamiento, lo que permite que el modelo aprenda a compensar los errores de cuantizacion. Esto resulta en una calidad cercana a la del modelo en bfloat16, pero con un peso de solo 6.4 GB en formato Q4_0 GGUF, frente a los aproximadamente 24 GB del modelo original en precision completa.

El entrenamiento del modelo base incluyo datos multimodales (texto, imagen, video y audio) y un proceso de ajuste fino supervisado con instrucciones, seguido de optimizacion con RLHF. El modelo soporta modos de razonamiento configurables, lo que permite activar o desactivar el "thinking mode" segun la tarea. Ademas, el repositorio incluye un drafter MTP (Multi-Token Prediction) para decodificacion especulativa, que acelera la inferencia sin cambiar la salida, ya que el modelo objetivo verifica cada token generado por el drafter.

## Capacidades

- Generacion de texto y codigo en mas de 140 idiomas, con soporte para tareas de razonamiento complejo.
- Entrada multimodal: procesa texto, imagenes (con resolucion y relacion de aspecto variables), video y audio (este ultimo en las variantes E2B, E4B y 12B).
- Modo de razonamiento configurable: permite activar o desactivar el "thinking mode" para tareas que requieren pasos intermedios de razonamiento.
- Soporte de tool calling y function calling, lo que permite integrar el modelo en pipelines de agentes y automatizacion.
- Capacidad de decodificacion especulativa mediante el drafter MTP incluido, que acelera la generacion sin degradar la calidad.
- Optimizado para despliegue en dispositivos locales, incluyendo portatiles y telefonos de gama alta, gracias a la cuantizacion QAT.

## Casos de uso

- Atencion al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con contexto largo (hasta 128K tokens) y soporte multilingue, lo que lo hace adecuado para sistemas de soporte en empresas internacionales.
- Generacion de codigo en produccion: con soporte de tool calling y capacidad de razonamiento, puede integrarse en pipelines de CI/CD para generar, revisar o documentar codigo automaticamente.
- Analisis de documentos multimodales: al procesar imagenes y texto, puede extraer informacion de facturas, contratos o informes que combinen ambos formatos.
- Asistentes de escritura creativa: su capacidad multilingue y de razonamiento permite generar contenido editorial, traducciones y resumenes con alta coherencia.
- Educacion y tutoria: puede actuar como tutor virtual explicando conceptos complejos paso a paso, gracias a su modo de razonamiento configurable.
- Procesamiento de video y audio: en las variantes que lo soportan, puede transcribir, resumir o analizar contenido audiovisual, util para archivado y busqueda de medios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo base Gemma 4 12B ha sido evaluado por Google DeepMind en tareas como MMLU, HumanEval y GSM8K, pero los resultados especificos de esta variante QAT no estan documentados en el repositorio. Se recomienda consultar la documentacion oficial de Gemma 4 para obtener datos comparativos.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 6-7 GB con cuantizacion Q4_0, lo que permite ejecutar el modelo en GPUs de consumo como la RTX 3060 (12 GB) o RTX 4060 (8 GB).
- GPUs recomendadas: RTX 3090, RTX 4090, A100, H100 para despliegues con mayor throughput o contexto largo.
- Compatible con GPUs de consumo: si, siempre que tengan al menos 8 GB de VRAM para la cuantizacion Q4_0.
- Opciones de despliegue: llama.cpp, Ollama, vLLM (con formato comprimido), TGI, y Unsloth Studio para fine-tuning.
- Latencia y throughput: no disponibles en la informacion proporcionada, pero la decodificacion especulativa con MTP puede mejorar la velocidad de generacion entre 1.5x y 2x en hardware compatible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Gemma 4 12B IT QAT (este) | 11.9B | 128K | Apache 2.0 | GGUF | Cuantizado con QAT, calidad cercana a bfloat16 |
| Gemma 4 E4B | ~4B activos (MoE) | 128K | Apache 2.0 | GGUF | Variante MoE mas ligera, optimizada para moviles |
| Llama 3.1 8B | 8B | 128K | Llama 3.1 License | GGUF | Alternativa densa con licencia restrictiva para uso comercial |
| Mistral 7B v0.3 | 7B | 32K | Apache 2.0 | GGUF | Menor contexto, sin soporte multimodal |

## Limitaciones y advertencias

- El modelo puede generar contenido incorrecto o alucinado, especialmente en tareas de razonamiento complejo o con entradas ambiguas.
- Aunque soporta mas de 140 idiomas, el rendimiento puede degradarse en idiomas poco representados en los datos de entrenamiento.
- La cuantizacion Q4_0 puede introducir ligeras perdidas de calidad en tareas muy sensibles a la precision, aunque QAT minimiza este efecto.
- El soporte de audio y video solo esta disponible en las variantes E2B, E4B y 12B; la variante 12B incluida en este repositorio si lo soporta.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los terminos adicionales de la licencia de Gemma 4 en la documentacion oficial de Google.
- Para produccion, es necesario validar el comportamiento del modelo en el dominio especifico, ya que no se han publicado benchmarks de esta variante QAT.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/kayraharika/gemma-4-12B-it-qat-GGUF
- Modelo base (Google): https://huggingface.co/google/gemma-4-12B-it-qat-q4_0-unquantized
- Guia de QAT de Unsloth: https://unsloth.ai/docs/models/gemma-4/qat
- Documentacion de Gemma 4: https://ai.google.dev/gemma/docs/core
- Blog de lanzamiento de Gemma 4: https://blog.google/innovation-and-ai/technology/developers-tools/introducing-gemma-4-12B/
- Coleccion de Gemma 4 QAT de Unsloth: https://huggingface.co/collections/unsloth/gemma-4-qat
