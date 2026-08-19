# litert-community/Falcon-H1-3B-Instruct

## Resumen

Falcon-H1-3B-Instruct es un modelo de lenguaje de 3 mil millones de parámetros desarrollado por el Technology Innovation Institute (TII) de los Emiratos Árabes Unidos, con una arquitectura híbrida que combina atención grouped-query y Mamba2 en cada capa. Esta versión concreta, publicada por litert-community, es una conversión del modelo original al formato LiteRT-LM (.litertlm), diseñado para inferencia en dispositivos (on-device) mediante el runtime LiteRT-LM de Google. El modelo resuelve el problema de ejecutar LLMs de tamaño medio en hardware de consumo y móvil, manteniendo un equilibrio entre calidad y eficiencia. Su relevancia radica en que demuestra la viabilidad de arquitecturas híbridas en entornos edge, con un rendimiento de decodificación de 65 tokens por segundo en GPU de Apple M4 Max y 14 tokens por segundo en iPhone 17 Pro.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: atención grouped-query + Mamba2 selective-scan en paralelo por capa (32 capas) |
| Parametros totales | 3 mil millones (3B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el modelo base tiene 128K según LLM Explorer, no confirmado en esta conversión) |
| Tipos de cuantizacion | int8 dinámico en lineales y embedding; convs y scan en float |
| Idiomas soportados | No disponible |
| Licencia | Falcon LLM License (falcon-llm-license) |
| Formato de pesos | .litertlm (LiteRT flatbuffers); el modelo base usa safetensors bf16 |

## Arquitectura y entrenamiento

Falcon-H1-3B-Instruct emplea una arquitectura totalmente híbrida: cada una de sus 32 capas ejecuta en paralelo una rama de atención grouped-query (GQA) y una rama de selective-scan Mamba2 sobre la misma entrada, sumando sus salidas. Esto implica que cada capa mantiene tanto una caché KV como un estado recurrente de convolución y SSM de tamaño constante. El modelo fue entrenado por TII, aunque no se proporcionan detalles sobre el dataset o el proceso de entrenamiento (número de tokens, composición, RLHF, etc.) en la información disponible. La conversión a LiteRT-LM incluye un parche para la caché híbrida compuesta, el plegado del selective-scan como multiplicaciones de matrices con ejes de chunk y cabeza fusionados en el eje de batch, y una guarda de relleno de prefill para pasos parciales. La cuantización se aplicó post-hoc con int8 dinámico sobre lineales y embedding, manteniendo en float las convoluciones y el scan.

## Capacidades

- Generación de texto y conversación: el modelo está ajustado para instrucciones (Instruct) y utiliza una plantilla de chat estilo ChatML.
- Inferencia en dispositivos: optimizado para ejecución en GPU y CPU de dispositivos móviles y de escritorio mediante el runtime LiteRT-LM.
- Soporte de prefill multi-longitud: se exportan firmas de prefill de 1 a 1024 tokens para que el runtime seleccione fragmentos ajustados.
- Verificación de calidad: según la model card, supera una prueba de 8 preguntas en GPU y CPU, y una sonda de calidad compuesta en iPhone 17 Pro.
- No se mencionan capacidades específicas de tool calling, agentes, visión o audio en la información proporcionada.

## Casos de uso

- Asistentes de voz en dispositivos móviles: el modelo puede ejecutarse localmente en un smartphone (por ejemplo, iPhone 17 Pro) con una velocidad de decodificación de 14 tokens por segundo, lo que permite respuestas casi en tiempo real sin conexión a internet.
- Chatbots de atención al cliente en aplicaciones de mensajería: al ser un modelo instruct de 3B, puede gestionar conversaciones multi-turno con una plantilla ChatML, manteniendo la privacidad de los datos al procesar localmente.
- Generación de texto en aplicaciones de productividad: redacción de correos, resúmenes o borradores directamente en el dispositivo, con un consumo de memoria pico de 3 GB en GPU, adecuado para tablets y portátiles.
- Asistentes de codificación en entornos de desarrollo integrado (IDE) para dispositivos edge: aunque no se especifica soporte de tool calling, el modelo base Falcon-H1 tiene capacidades de generación de código; esta conversión permite ejecutarlo en hardware limitado.
- Procesamiento de lenguaje natural en aplicaciones de salud o finanzas con requisitos de privacidad: al no enviar datos a la nube, se reduce el riesgo de filtraciones.
- Prototipado rápido de aplicaciones de IA en dispositivos: gracias a su formato .litertlm y al runtime LiteRT-LM, los desarrolladores pueden integrar el modelo en aplicaciones Android/iOS con un esfuerzo mínimo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Sin embargo, la model card incluye mediciones de rendimiento de inferencia que se resumen a continuación:

| Entorno | Backend | Prefill (256 tokens) | Decode | TTFT |
|---|---|---|---|---|
| Apple M4 Max (litert-lm 0.16.0) | GPU | 979 tok/s | 65.3 tok/s | 0.28 s |
| Apple M4 Max (litert-lm 0.16.0) | CPU | 121 tok/s | 20.9 tok/s | 2.17 s |
| iPhone 17 Pro | GPU (Metal) | 111.5 tok/s | 14.0 tok/s | 1.49 s |
| iPhone 17 Pro | CPU | 48.7 tok/s | 7.8 tok/s | 3.14 s |

Además, se reporta una paridad de logits con PyTorch (correlación media 1.0000, KL ≈ 0) y una tasa de 8/8 en una prueba de cordura de 8 preguntas en todos los entornos probados.

## Requisitos de hardware

- VRAM estimada: el archivo .litertlm int8 pesa 3.15 GB; en GPU con activaciones fp32, el consumo de memoria pico puede ser mayor (en iPhone 17 Pro GPU se midieron 3.03 GB).
- GPU recomendadas: cualquier GPU compatible con Metal (Apple) o Vulkan/OpenCL para LiteRT-LM; en el benchmark se usó Apple M4 Max y iPhone 17 Pro. En GPUs de escritorio, se puede ejecutar con al menos 4 GB de VRAM.
- Cabe en GPUs de consumo: sí, en tarjetas con 4-6 GB de VRAM (por ejemplo, RTX 3050, RTX 4060, etc.), aunque no se han publicado pruebas específicas.
- Opciones de despliegue: el formato .litertlm requiere el runtime LiteRT-LM (versión ≥ 0.15). El modelo base (safetensors) se puede usar con vLLM, llama.cpp, Hugging Face Transformers, etc., pero esta conversión concreta está pensada para LiteRT-LM.
- Latencia y throughput: en Apple M4 Max GPU, prefill de 256 tokens a 979 tok/s y decode a 65.3 tok/s; en iPhone 17 Pro GPU, prefill a 111.5 tok/s y decode a 14 tok/s.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos en la información proporcionada. A continuación se presenta una comparativa cualitativa con otros modelos de 3B disponibles en el ecosistema:

| Modelo | Arquitectura | Contexto | Licencia | Formato | Uso en edge |
|---|---|---|---|---|---|
| Falcon-H1-3B-Instruct (litert-community) | Híbrida (GQA + Mamba2) | No disponible (base: 128K) | Falcon LLM License | .litertlm | Sí, optimizado |
| Falcon3-3B-Instruct (litert-community) | Transformer (atención completa) | No disponible | Falcon LLM License | .litertlm | Sí, optimizado |
| Llama 3.2 3B | Transformer (GQA) | 128K | Llama 3.2 License | safetensors, GGUF | Requiere conversión |

Nota: Falcon-H1 se distingue por su diseño híbrido, que puede ofrecer ventajas en eficiencia de memoria y velocidad en dispositivos, aunque no hay datos cuantitativos comparativos en esta información.

## Limitaciones y advertencias

- Licencia restrictiva: la Falcon LLM License no es una licencia de código abierto estándar; incluye términos específicos que pueden limitar el uso comercial. Es necesario revisar los términos en el enlace proporcionado.
- Cuantización int8: aunque la model card afirma que no hay degradación en la prueba de 8 preguntas, la cuantización dinámica puede afectar a tareas más complejas o a la precisión numérica en comparación con el modelo en bf16.
- Contexto no confirmado: la longitud de contexto de esta conversión no se especifica; el modelo base tiene 128K según LLM Explorer, pero no se ha verificado en el formato .litertlm.
- Sin información sobre idiomas: no se indica qué idiomas soporta el modelo, aunque el modelo base de TII suele ser multilingüe.
- Riesgo de alucinación: como cualquier LLM de 3B, puede generar contenido incorrecto o inventado, especialmente en tareas de razonamiento complejo.
- Dependencia del runtime: el formato .litertlm solo funciona con LiteRT-LM ≥ 0.15, lo que limita la portabilidad a otros frameworks.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/litert-community/Falcon-H1-3B-Instruct
- Modelo base (TII): https://huggingface.co/tiiuae/Falcon-H1-3B-Instruct
- Runtime LiteRT-LM: https://github.com/google-ai-edge/litert-lm
- Herramienta de conversión litert-torch: https://github.com/google-ai-edge/litert-torch
- Script de conversión hf-to-litertlm: https://github.com/john-rocky/hf-to-litertlm
- Ficha en LLM Explorer: https://llm-explorer.com/model/tiiuae%2FFalcon-H1-3B-Instruct,6gU2fjjurx3QTztw0zGh8N
- Licencia Falcon LLM: https://falconllm.tii.ae/falcon-terms-and-conditions.html
