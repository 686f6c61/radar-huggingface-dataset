# sinsankio/sinhalallm-1.7b-onnx-web

## Resumen

SinhalaLLM-1.7B ONNX Web es una conversión a ONNX del modelo SinhalaLLM-1.7B (versión 2.1, revisión `b24d58b7929e1ed50f683b435a9a629a73e27af5`), un modelo de generación de texto en cingalés desarrollado por Namindu Sanchila Nadeeshan. La conversión y cuantización la firma el usuario sinsankio y su objetivo es ejecutar el modelo íntegramente en el navegador mediante transformers.js, sin servidor ni conexión de red, dentro de la aplicación Offline සිංහල. El modelo base parte de SmolLM2-1.7B, un transformer denso de 1.700 millones de parámetros afinado en cingalés.

La relevancia de esta ficha es doble. Por un lado, ofrece una vía práctica para desplegar un modelo de lenguaje de 1.7B en WebGPU con pesos de 2,48 GB en 8 bits o 1,18 GB en 4 bits, lo que lo hace viable en equipos de consumo sin GPU dedicada de gama alta. Por otro, documenta con métricas de perplejidad el coste de la cuantización sobre un idioma de bajos recursos como el cingalés, un dato poco frecuente en el ecosistema open source.

El autor advierte explícitamente de que el modelo falla a menudo en hechos recuperados de memoria y de que sus respuestas no son aptas para decisiones médicas, legales o financieras. La licencia es Apache 2.0, igual que el modelo original.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de SmolLM2-1.7B) |
| Parámetros totales | 1.700 millones (heredados del modelo base) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | ONNX q8 (8 bits, por defecto en WebGPU) y q4 (4 bits, fallback); la variante q4 mantiene la proyección de valor de la capa 0 en fp32 |
| Idiomas soportados | cingalés (si) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`onnx/model_quantized.onnx` con dos ficheros de datos; `onnx/model_q4.onnx` con uno); `manifest.json` con tamaño y SHA-256 de cada fichero |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de 1.700 millones de parámetros construido sobre SmolLM2-1.7B. Según la información disponible sobre la familia SinhalaLLM, el ajuste se realizó con LoRA de 4 bits mediante Unsloth y PEFT sobre texto en cingalés del corpus MADLAD_CulturaX_cleaned, y el artefacto final se fusionó en un modelo HF estándar. No se especifican en la información proporcionada el número total de tokens de entrenamiento, la composición exacta del dataset ni si hubo fases de RLHF o DPO.

La contribución técnica de esta conversión concreta es la reescritura de algunos operadores por equivalentes estándar para que se ejecuten en ONNX Runtime Web, manteniendo logits idénticos, y la cuantización a 8 y 4 bits con ficheros de datos externos. El autor reporta la perplejidad sobre 1.012 frases de FLORES+: 113,2 en fp32, 115,5 en q8 y 158,0 en q4, frente a 195,0 del GGUF Q4_K_M publicado por el autor original.

## Capacidades

- Generación de texto en cingalés, orientada a respuesta de preguntas dentro del navegador.
- Ejecución local offline mediante transformers.js y ONNX Runtime Web, con WebGPU como backend principal y fallback a cuantización de 4 bits.
- Inferencia sin servidor: los pesos se cargan desde el navegador y no requieren llamadas a una API.
- Verificación de integridad de los ficheros mediante hashes SHA-256 en `manifest.json`.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al cingalés según la etiqueta de idioma del modelo.
- Modo thinking, visión o audio: no disponibles.

## Casos de uso

- Asistente de preguntas y respuestas en cingalés dentro del navegador: la aplicación Offline සිංහල usa el modelo para responder consultas sin conexión, con la variante q8 en WebGPU y la q4 como respaldo en equipos sin soporte WebGPU.
- Despliegue en entornos con conectividad intermitente o restringida: al ejecutarse íntegramente en el cliente, el modelo funciona en escuelas, oficinas públicas o zonas rurales donde no se puede garantizar el acceso a una API externa.
- Prototipado rápido de interfaces de chat en cingalés: un desarrollador puede integrar el modelo en una página web con transformers.js y validar la experiencia de usuario sin aprovisionar infraestructura de GPU.
- Investigación sobre cuantización en idiomas de bajos recursos: las perplejidades publicadas en FLORES+ (113,2 fp32, 115,5 q8, 158,0 q4) permiten estudiar la degradación por cuantización en cingalés con un punto de referencia reproducible.
- Educación lingüística y preservación del cingalés: generación de texto de práctica y materiales didácticos en el idioma, con la advertencia de que el contenido debe revisarse por un humano.
- Aplicaciones de privacidad por diseño: al no enviar texto a un servidor, el modelo encaja en escenarios donde la consulta del usuario no debe salir del dispositivo, como borradores de documentos personales.

## Benchmarks y rendimiento

| Variante | Tamaño | Perplejidad FLORES+ (1.012 frases) |
|---|---|---|
| fp32 (modelo original) | no disponible | 113,2 |
| ONNX q8 (8 bits) | 2,48 GB | 115,5 |
| ONNX q4 (4 bits) | 1,18 GB | 158,0 |
| GGUF Q4_K_M (autor original) | no disponible | 195,0 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 2,5 GB para la variante q8 y 1,2 GB para la q4, a los que hay que sumar la memoria del contexto y del runtime del navegador.
- GPU recomendadas: cualquier GPU con soporte WebGPU; en el ecosistema de escritorio, tarjetas integradas modernas y GPU dedicadas de gama media en adelante. No se especifican modelos concretos (A100, H100, RTX 4090) en la información disponible.
- Cabe en GPU de consumo: sí, gracias al tamaño reducido de las variantes cuantizadas; la q4 está pensada como fallback para equipos sin WebGPU o con menos memoria.
- Opciones de despliegue: transformers.js con ONNX Runtime Web (WebGPU o WASM); no se documentan despliegues con vLLM, llama.cpp, Ollama o TGI para esta conversión.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| sinsankio/sinhalallm-1.7b-onnx-web | 1,7B | no disponible | Apache 2.0 | ONNX (q8, q4) | Conversión para navegador con perplejidad FLORES+ publicada |
| namindu94/SinhalaLLM-1.7B | 1,7B | no disponible | Apache 2.0 | safetensors (fp32) | Modelo original, perplejidad FLORES+ de 113,2 |
| Captainsl/SinhalaLLM | 1,7B | no disponible | no disponible | HF estándar | Ajuste de SmolLM2-1.7B con LoRA de 4 bits sobre MADLAD_CulturaX_cleaned (tesis NSBM Green University, 2025) |
| SmolLM2-1.7B | 1,7B | no disponible | no disponible | safetensors, GGUF | Modelo base multilingüe de HuggingFaceTB sobre el que se construye la familia |

## Limitaciones y advertencias

- El autor advierte de que el modelo a menudo se equivoca en hechos recuperados de memoria y de que sus respuestas no son aptas para decisiones médicas, legales o financieras.
- La cuantización a 4 bits degrada notablemente la perplejidad (158,0 frente a 113,2 en fp32), por lo que la variante q4 debe tratarse como último recurso.
- El soporte lingüístico se limita al cingalés; no hay evidencia de calidad en otros idiomas.
- No se documentan sesgos específicos del modelo en la información disponible.
- La licencia Apache 2.0 permite uso comercial, pero el `NOTICE.txt` debe conservarse según lo indicado por el autor.
- El modelo no ha sido validado para tool calling ni para flujos de agentes; su uso en pipelines automatizados requiere evaluación previa.
- La ejecución en navegador depende de la disponibilidad de WebGPU en el cliente; la variante q4 es el camino de respaldo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sinsankio/sinhalallm-1.7b-onnx-web
- Modelo base: https://huggingface.co/namindu94/SinhalaLLM-1.7B
- Aplicación Offline සිංහල: https://huggingface.co/spaces/sinsankio/sinhalalm-offline
- SmolLM2-1.7B: https://huggingface.co/HuggingFaceTB/SmolLM2-1.7B
- Captainsl/SinhalaLLM: https://huggingface.co/Captainsl/SinhalaLLM
- README de Captainsl/SinhalaLLM: https://huggingface.co/Captainsl/SinhalaLLM/blob/main/README.md
