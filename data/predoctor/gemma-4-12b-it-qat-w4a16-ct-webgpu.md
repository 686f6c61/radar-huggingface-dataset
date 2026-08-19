# PreDoctor/gemma-4-12B-it-qat-w4a16-ct-webgpu

## Resumen

PreDoctor/gemma-4-12B-it-qat-w4a16-ct-webgpu es un paquete de despliegue para navegador del modelo Gemma 4 12B instruction-tuned QAT, convertido y empaquetado por PreDoctor para su runtime WebGPU protegido en predoctor.ai. No se trata de un checkpoint estándar de Transformers, sino de artefactos específicos que permiten ejecutar un modelo de 12 000 millones de parámetros directamente en el navegador mediante WebGPU, con cuantización w4a16 (pesos en 4 bits, activaciones en 16 bits). El paquete incluye además un asistente MTP (multi-token prediction) para decodificación especulativa, lo que reduce la latencia de generación.

El modelo base es google/gemma-4-12B-it-qat-q4_0-unquantized, un transformer denso multimodal (texto, imagen y audio) con una ventana de contexto de 256 000 tokens. La conversión de PreDoctor añade metadatos de integridad por fragmentos (chunks de 64 MiB) y un formato propietario .pwlm, pensado para activación atómica en almacenamiento del navegador. Su relevancia radica en llevar un modelo de 12B con calidad cercana a bfloat16 a entornos sin servidor, con privacidad local y sin necesidad de infraestructura de GPU dedicada.

La licencia es Apache 2.0, lo que permite uso comercial con las restricciones propias de la licencia Gemma 4. El repositorio tiene 0 descargas y 0 likes, y fue creado el 17 de agosto de 2026.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (decoder-only) |
| Parametros totales | 12 000 millones (12B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 256 000 tokens |
| Tipos de cuantizacion | w4a16 (pesos 4 bits, activaciones 16 bits); modelo base con q4_0 |
| Idiomas soportados | No disponible (el modelo base Gemma 4 es multilingue, pero la ficha no los detalla) |
| Licencia | Apache 2.0 (con términos adicionales de la licencia Gemma 4) |
| Formato de pesos | .pwlm (formato propietario WebGPU de PreDoctor), safetensors para el asistente MTP, tokenizer.json |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de 12 000 millones de parámetros, optimizado mediante Quantization-Aware Training (QAT) para preservar la calidad de bfloat16 al tiempo que reduce los requisitos de memoria. Según la documentación disponible, el modelo maneja entradas de texto, imagen y audio, y genera texto. La ventana de contexto es de 256 000 tokens.

El paquete de PreDoctor no modifica los pesos del modelo base, sino que los convierte al formato .pwlm para su ejecución en WebGPU, añadiendo verificaciones de integridad por fragmentos. El asistente MTP, empaquetado como safetensors de 845 MB, se utiliza para decodificación especulativa: predice múltiples tokens por paso, acelerando la generación. Para que la decodificación especulativa funcione correctamente, tanto el modelo objetivo como el asistente deben ser checkpoints QAT con la misma precisión, tal como se indica en la documentación de Google.

No se dispone de información sobre la composición del dataset de entrenamiento, el número de tokens utilizados ni los métodos de alineación (RLHF, DPO, etc.) en los materiales proporcionados.

## Capacidades

- Generación de texto con instrucciones (instruction-tuned) y razonamiento general.
- Entrada multimodal: procesa texto, imagen y audio, generando salida de texto.
- Decodificación especulativa mediante asistente MTP, que reduce la latencia de generación en el navegador.
- Ejecución local en navegador vía WebGPU, sin necesidad de servidor.
- Soporte de contexto largo de 256 000 tokens, adecuado para documentos extensos o conversaciones multi-turno.
- No se confirma explícitamente el soporte de tool calling o function calling en la información proporcionada, aunque el modelo base Gemma 4 puede incluirlo; no hay datos al respecto en esta ficha.

## Casos de uso

- Asistentes conversacionales en el navegador: al ejecutarse localmente con WebGPU, el modelo puede alimentar chatbots integrados en aplicaciones web sin enviar datos a un servidor, lo que preserva la privacidad del usuario.
- Análisis de documentos extensos: con 256 000 tokens de contexto, permite resumir o extraer información de contratos, informes o libros completos directamente en el cliente.
- Prototipado rápido de aplicaciones de IA: los desarrolladores pueden probar interacciones multimodales (imagen, audio, texto) sin desplegar infraestructura backend.
- Demostraciones interactivas y educación: adecuado para talleres o cursos donde se necesita un modelo funcional en equipos con GPU compatible, sin instalación de dependencias pesadas.
- Infraestructura de investigación para WebGPU: sirve como referencia para estudiar el rendimiento de modelos QAT en navegadores, incluyendo la decodificación especulativa con MTP.
- Aplicaciones de accesibilidad: transcripción o descripción de imágenes y audio en tiempo real dentro del navegador, útil para usuarios con discapacidad visual o auditiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K u otras pruebas estandarizadas para este paquete específico ni para el modelo base en los materiales consultados.

## Requisitos de hardware

- Ejecución en navegador con soporte WebGPU (Chrome, Edge, Firefox en versiones recientes).
- El archivo del modelo .pwlm ocupa 8,25 GB; se estima que se necesita una GPU con al menos 8-10 GB de VRAM para una inferencia fluida, aunque no se han publicado requisitos oficiales.
- El asistente MTP añade 845 MB adicionales.
- No se dispone de datos de latencia ni throughput. La decodificación especulativa debería reducir el tiempo por token, pero no hay cifras confirmadas.
- Opciones de despliegue: exclusivamente el runtime de PreDoctor (predoctor.ai). No es compatible con vLLM, llama.cpp, Ollama ni TGI, ya que el formato .pwlm es propietario.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PreDoctor/gemma-4-12B-it-qat-w4a16-ct-webgpu | 12B | 256K | w4a16 | Apache 2.0 | Solo WebGPU (runtime PreDoctor) |
| google/gemma-4-12B-it-qat-w4a16-ct | 12B | 256K | w4a16 | Apache 2.0 | Transformers, vLLM, etc. |
| google/gemma-4-12B-it-qat-q4_0-unquantized | 12B | 256K | q4_0 | Apache 2.0 | Transformers, llama.cpp |

La diferencia principal entre el paquete de PreDoctor y las versiones de Google es el formato y el entorno de ejecución: mientras que google/gemma-4-12B-it-qat-w4a16-ct es un checkpoint estándar utilizable con bibliotecas convencionales, el de PreDoctor está restringido a su runtime WebGPU. El rendimiento debería ser similar al del modelo base, pero no hay benchmarks que lo confirmen.

## Limitaciones y advertencias

- No es un checkpoint estándar de Transformers; solo funciona con el runtime WebGPU de PreDoctor, lo que limita su portabilidad a otras herramientas.
- Depende de la disponibilidad de WebGPU en el navegador y de una GPU compatible; en equipos sin soporte, el modelo no se puede ejecutar.
- La cuantización w4a16 puede introducir una ligera degradación de calidad frente a bfloat16, aunque el QAT está diseñado para minimizarla.
- No se han publicado benchmarks, por lo que no se puede verificar el rendimiento real frente a otras implementaciones.
- La model card advierte explícitamente que los artefactos no constituyen consejo médico ni un sistema de diagnóstico clínico validado, a pesar del nombre de la organización.
- No se especifican los idiomas soportados; aunque Gemma 4 es multilingüe, la ficha no detalla qué lenguas están cubiertas.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere una adopción nula hasta la fecha y una posible falta de validación comunitaria.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/PreDoctor/gemma-4-12B-it-qat-w4a16-ct-webgpu
- Modelo base: https://huggingface.co/google/gemma-4-12B-it-qat-q4_0-unquantized
- Modelo QAT w4a16 de Google (referencia): https://huggingface.co/google/gemma-4-12B-it-qat-w4a16-ct
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Runtime de PreDoctor: https://predoctor.ai/
