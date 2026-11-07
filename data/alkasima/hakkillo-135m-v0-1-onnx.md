# alkasima/Hakkillo-135M-v0.1-ONNX

## Resumen

Hakkillo-135M-v0.1-ONNX es una exportación ONNX con cuantización int8 dinámica del adaptador experimental Hakkillo, construido sobre SmolLM2-135M-Instruct de HuggingFaceTB. El modelo está pensado para ejecutarse íntegramente en el navegador del usuario mediante Transformers.js 3.8.1 y WebAssembly, sin depender de una API de inferencia alojada. El repositorio ocupa aproximadamente 0,1 GB y el archivo del modelo ronda los 137 MB, lo que lo convierte en una opción viable para demos y prototipos que deben funcionar en CPU cliente.

La arquitectura subyacente es la de SmolLM2-135M-Instruct, un transformer decoder-only de 135 millones de parámetros, al que se le aplica una adaptación LoRA entrenada por el autor. El adaptador se entrenó durante 48 pasos de CPU sobre 32 ejemplos sintéticos, por lo que se trata explícitamente de un prototipo temprano y no de un modelo listo para producción. La model card advierte que puede inventar hechos, malinterpretar instrucciones y producir explicaciones incorrectas.

La relevancia de esta ficha es acotada: el modelo ilustra el flujo completo de adaptación ligera, fusión de pesos, exportación ONNX y cuantización int8 para inferencia en navegador. No obstante, sus cifras de entrenamiento y sus fallos observados (por ejemplo, no completar correctamente 7 + 5 en una comprobación de tres prompts) lo sitúan como material de experimentación, no como candidato para despliegues reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base: SmolLM2-135M-Instruct) con adaptación LoRA fusionada |
| Parametros totales | 135 millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 dinámica (MatMul/Gather) en ONNX Runtime; exportación float disponible en el flujo de origen |
| Idiomas soportados | inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (opset 17); exportado con Optimum ONNX 0.1.0 y Transformers 4.57.6 |

## Arquitectura y entrenamiento

El modelo parte de SmolLM2-135M-Instruct, un transformer decoder-only de 135 millones de parámetros con atención causal estándar. Sobre esa base, el autor entrena un adaptador LoRA durante 48 pasos de CPU sobre 32 ejemplos sintéticos, lo fusiona con los pesos originales y exporta el resultado a ONNX. La exportación se realizó con Optimum ONNX 0.1.0 y Transformers 4.57.6, usando opset 17, seguida de una cuantización int8 dinámica de operadores MatMul y Gather en ONNX Runtime 1.23.2.

No se documentan ni el número de tokens de entrenamiento del adaptador ni la composición detallada del dataset más allá de la mención de 32 ejemplos sintéticos. La exportación float reportó una diferencia máxima de logits de 0,00193 frente a la referencia en PyTorch, por encima de la tolerancia por defecto de 1e-5. El autor indica que existen comprobaciones estructurales y pruebas de generación en CPU registradas en el repositorio, pero no formula ninguna afirmación amplia sobre la calidad del modelo cuantizado. No se mencionan innovaciones técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional en inglés, con formato de chat por roles (system, user, assistant).
- Ejecución en CPU cliente vía WebAssembly, sin API de inferencia alojada.
- Inferencia en navegador mediante Transformers.js 3.8.1 con dtype `q8` y device `wasm`.
- Explicación de conceptos sencillos: en la comprobación de tres prompts explicó qué es una CPU.
- Recuperación de conocimiento factual limitado: identificó Abuja en la misma comprobación.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-step: no disponible.
- Capacidades multilingües: limitadas al inglés.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Demos educativas de inferencia en navegador: el modelo permite mostrar un pipeline completo de Transformers.js con WebAssembly en una página web, sin coste de servidor, gracias a sus 137 MB de pesos y a la licencia Apache-2.0.
- Prototipado de adaptadores LoRA: sirve como ejemplo reproducible del flujo LoRA → fusión → exportación ONNX → cuantización int8, documentado en el repositorio del autor.
- Pruebas de integración de Transformers.js: útil para validar la carga de modelos ONNX cuantizados con `dtype: 'q8'` y `device: 'wasm'` en entornos controlados.
- Experimentos de cuantización: permite comparar salidas del adaptador float32 frente a la versión int8, como el caso documentado de la suma 7 + 5 que falla en esta exportación.
- Chatbot de juguete en aplicaciones offline: puede gestionar conversaciones breves en inglés con `do_sample: false`, siempre que se acepte su fiabilidad limitada.
- Verificación de pipelines CI de exportación: el repositorio registra comprobaciones estructurales y pruebas de generación en CPU que pueden reutilizarse como plantilla de validación.
- No recomendado para atención al cliente, generación de código en producción ni tareas que requieran exactitud factual, dado su entrenamiento de 48 pasos sobre 32 ejemplos sintéticos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo recoge una comprobación cualitativa con tres prompts en CPU: el modelo explicó qué es una CPU e identificó Abuja, pero no completó correctamente la respuesta a 7 + 5. El autor señala que esto constituye una regresión observada respecto al adaptador float32 en ese prompt. La pérdida de desarrollo del adaptador no se presenta como una métrica de calidad para esta versión ONNX.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica como requisito de GPU; el modelo está diseñado para ejecutarse en CPU vía WebAssembly.
- Tamaño en disco: aproximadamente 137 MB para el archivo del modelo; el repositorio completo ocupa unos 0,1 GB.
- GPU recomendadas: no disponibles; el pipeline declarado es CPU/WebAssembly.
- Compatibilidad con GPU de consumo: no se documenta soporte GPU para esta exportación.
- Opciones de despliegue: Transformers.js 3.8.1 con ONNX Runtime 1.23.2 en navegador; exportación realizada con Optimum ONNX 0.1.0.
- Latencia y throughput: no disponibles. No se publican cifras de tokens por segundo ni de latencia en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Hakkillo-135M-v0.1-ONNX | 135 M | no disponible | Apache-2.0 | ONNX int8 | Adaptador LoRA sobre SmolLM2-135M-Instruct; entrenado 48 pasos sobre 32 ejemplos sintéticos |
| SmolLM2-135M-Instruct | 135 M | no disponible en la información proporcionada | Apache-2.0 | safetensors | Modelo base de HuggingFaceTB; sin adaptación específica |
| Hakkillo-135M-v0.1 (adaptador float32) | 135 M | no disponible | Apache-2.0 | safetensors | Adaptador original; según la model card, completó correctamente la suma 7 + 5 en la comprobación de CPU |
| Alternativas de menos de 200 M parámetros para navegador | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

## Limitaciones y advertencias

- Entrenamiento extremadamente limitado: 48 pasos de CPU sobre 32 ejemplos sintéticos; es un prototipo temprano, no un modelo validado.
- Alucinación: el autor advierte explícitamente que puede inventar hechos y producir explicaciones incorrectas.
- Comprensión de instrucciones: puede malinterpretar indicaciones, incluso en tareas aritméticas simples.
- Regresión observada: en la comprobación de tres prompts falló la suma 7 + 5, mientras que el adaptador float32 la resolvía; la cuantización puede alterar las salidas.
- Fidelidad numérica de la exportación: la exportación float reportó una diferencia máxima de logits de 0,00193 frente a PyTorch, por encima de la tolerancia por defecto de 1e-5.
- Idioma: solo inglés; no hay soporte multilingüe documentado.
- Contexto: la longitud de contexto no está especificada en la información disponible.
- Licencia: Apache-2.0 permite uso comercial, pero debe revisarse el archivo NOTICE por la atribución al equipo de SmolLM de Hugging Face; el autor no ofrece garantías de calidad.
- Uso en producción: desaconsejado para tareas que requieran exactitud factual, código o matemáticas sin verificación humana.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alkasima/Hakkillo-135M-v0.1-ONNX
- Adaptador base: https://huggingface.co/alkasima/Hakkillo-135M-v0.1
- Demo en Spaces: https://huggingface.co/spaces/alkasima/Hakkillo
- Repositorio con código, datos, comandos de exportación e informes: https://github.com/alkasima/Hakkillo
- Modelo base SmolLM2-135M-Instruct: https://huggingface.co/HuggingFaceTB/SmolLM2-135M-Instruct
