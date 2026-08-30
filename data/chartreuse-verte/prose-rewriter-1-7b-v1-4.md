# chartreuse-verte/prose-rewriter-1.7b-v1.4

## Resumen

prose-rewriter-1.7b-v1.4 es un modelo de reescritura de prosa a nivel de párrafo desarrollado por chartreuse-verte. Su propósito es tomar texto generado por un modelo de lenguaje grande y re-renderizarlo para que suene más humano, preservando la semántica original. Es el sucesor de prose-rewriter-1.7b-v1.2 e introduce mejoras sustanciales en la variedad de longitud de frases, la cual es el factor que más hace que un párrafo se lea como escrito por una persona en lugar de por una máquina.

El modelo se construye sobre Qwen/Qwen3-1.7B-Base con un LoRA de rango 32 fusionado con una fuerza de 1.025. Está disponible en formato safetensors en bf16 y en cuantizaciones GGUF (Q8_0 y Q4_K_M), lo que permite su despliegue tanto con transformers como con llama.cpp. Su relevancia actual radica en que aborda un problema específico y creciente: la detección de texto generado por IA y la necesidad de humanizar contenido producido por modelos grandes sin perder fidelidad semántica.

La licencia es AGPL-3.0, lo que implica obligaciones de copyleft para uso comercial. El modelo está diseñado exclusivamente para procesar un párrafo por llamada y requiere un bloque `edit` obligatorio que especifica el tipo de transformación de longitud deseada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3 (transformer decoder-only) con LoRA r32 fusionado |
| Parametros totales | 2.031.739.904 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (hereda la del modelo base Qwen3-1.7B) |
| Tipos de cuantizacion | bf16 (safetensors), GGUF Q8_0 (2.17 GB), GGUF Q4_K_M (1.28 GB) |
| Idiomas soportados | Inglés |
| Licencia | AGPL-3.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-1.7B-Base, un transformer decoder-only, y se le aplica un LoRA de rango 32 que se fusiona con el modelo base a una fuerza de 1.025. La arquitectura resultante es un modelo denso de aproximadamente 2.03 mil millones de parámetros. Una particularidad técnica es que la cabeza de salida adaptada se mantiene separada de los embeddings de tokens en las cuantizaciones GGUF: en Q8_0 se almacena a Q8_0 y en Q4_K_M a Q6_K.

El entrenamiento sigue una estrategia descrita como "corrupt forward, train backward": el párrafo humano es el objetivo, y un LLM on-policy fabrica la versión corrupta que sirve como entrada. El modelo se entrena para reconstruir el texto humano a partir de la versión generada por máquina. La metodología completa de entrenamiento no está disponible en la información proporcionada, pero los datos de evaluación indican que se entrenó sobre párrafos con una mediana de 39 palabras de longitud de entrada, con la mayoría por debajo de las 70 palabras.

El modelo incluye un contrato de prompt estricto: tres modos de transformación (`match`, `inflate`, `compress`) que describen la relación entre la longitud de la entrada y la salida deseada. El modo `match` es el recomendado para reescritura sin recorte.

## Capacidades

- Reescritura de prosa a nivel de párrafo preservando la semántica original.
- Restructuración de oraciones con mayor variedad de longitud que la versión anterior (v1.2).
- Control de transformación de longitud mediante el bloque `edit` obligatorio: `match` (reescribir manteniendo longitud), `inflate` (recortar texto relleno) y `compress` (expandir texto demasiado condensado).
- Generación de texto con parada automática en `<|im_end|>`.
- Soporte de template de chat personalizado con roles `source` y `edit`.
- No es un modelo de chat: el template rechaza valores de `edit` fuera de los tres modos definidos.
- Capacidad de procesar un párrafo por llamada, con un mínimo práctico de unas 15 palabras.

## Casos de uso

- Humanización de contenido generado por IA para blogs y publicaciones: el modelo reescribe párrafos producidos por modelos grandes para que suenen más naturales, reduciendo la uniformidad de longitud de frases que delata el texto generado por máquina.
- Post-edición de borradores automáticos en redacciones: los periodistas pueden pasar párrafos generados por IA por este modelo para obtener una variante con más variedad rítmica antes de la revisión final.
- Preparación de textos para publicación académica o técnica: el modo `match` permite reescribir manteniendo la longitud, útil para ajustar el estilo sin alterar la extensión requerida por las guías de publicación.
- Adaptación de contenido a diferentes formatos: el modo `compress` expande textos demasiado condensados para formatos que requieren más desarrollo, mientras que `inflate` recorta textos rellenos para espacios limitados.
- Limpieza de respuestas de asistentes conversacionales: el modelo puede aplicarse a las respuestas de un chatbot para hacerlas menos mecánicas antes de mostrarlas al usuario final.
- Generación de variantes de textos publicitarios o de marketing: permite obtener múltiples versiones de un mismo párrafo con diferente estructura de frases para pruebas A/B.

## Benchmarks y rendimiento

La evaluación publicada compara v1.2 contra v1.4 sobre 1.095 párrafos de prosa escrita por LLM que ningún modelo vio en entrenamiento, con el mismo prompt a `temperature=0.9, top_p=0.9`. Los resultados sobre los 1.068 inputs de 51 palabras o más son:

| Metrica | v1.2 | v1.4 | paired *t* |
|---|---|---|---|
| Variedad de longitud de frases vs input | +0.073 | +0.127 | +7.52 |
| Palabras cambiadas | 33.8% | 38.0% | +6.37 |
| Palabras conservadas del input | 0.707 | 0.679 | −5.70 |
| Longitud preservada | 0.881 | 0.905 | +4.90 |
| Recuento de frases movido | 71.4% | 77.0% | +2.81 |
| Salidas casi literales | 3.9% | 3.3% | −1.31 |
| 3-gramas repetidos | 0.004 | 0.005 | +1.95 |

v1.4 reescribe más del párrafo, conserva menos de la redacción original y varía la longitud de sus frases sustancialmente más, mientras mantiene mejor la longitud de la fuente. El único indicador negativo es un ligero aumento de 3-gramas repetidos, atribuible a una reescritura más intensa.

## Requisitos de hardware

- VRAM estimada: aproximadamente 4 GB para el modelo en bf16 (2.03 mil millones de parámetros); 2.17 GB para GGUF Q8_0; 1.28 GB para GGUF Q4_K_M.
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM para la versión bf16, o 4 GB para las cuantizaciones GGUF. Compatible con RTX 3060, RTX 4060, RTX 4090, A10, A100, H100.
- Cabe en GPUs de consumo: sí, incluso en las gamas bajas con las cuantizaciones GGUF.
- Opciones de despliegue: transformers (con `device_map="cuda"`), llama.cpp / llama-cpp-python, y compatible con text-generation-inference (TGI) y endpoints de HuggingFace.
- Latencia y throughput: no disponibles en la información proporcionada, pero por el tamaño del modelo se espera inferencia rápida incluso en hardware de consumo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Especialidad |
|---|---|---|---|---|---|
| prose-rewriter-1.7b-v1.4 | 2.03B | No disponible | AGPL-3.0 | safetensors, GGUF | Reescritura de prosa |
| prose-rewriter-1.7b-v1.2 | 2.03B | No disponible | AGPL-3.0 | safetensors, GGUF | Reescritura de prosa (menos variedad de frases) |
| prose-rewriter-4b-v1.3 | ~4B | No disponible | AGPL-3.0 | No disponible | Reescritura de prosa (versión mayor) |
| Qwen3-1.7B-Base | 1.7B | No disponible | Apache 2.0 | safetensors | Modelo base generalista |

La comparativa con la versión 4B está disponible en el repositorio del autor, pero los datos concretos no se incluyen en la información proporcionada.

## Limitaciones y advertencias

- El modelo solo soporta inglés; no hay capacidades multilingües documentadas.
- No es un modelo de chat: intentar usarlo como tal producirá resultados incorrectos.
- El bloque `edit` es obligatorio. Omitirlo colapsa el modelo en su modo más agresivo de eliminación de texto.
- El mínimo práctico de entrada es de unas 15 palabras. Por debajo de 80 bytes, el modelo tiende a rellenar y fabricar contenido no soportado por la entrada; se recomienda pasar el texto sin cambios.
- La licencia AGPL-3.0 impone obligaciones de copyleft: si se ofrece el modelo como servicio a través de una red, el código fuente de la aplicación debe publicarse bajo la misma licencia.
- El modelo puede producir alucinaciones o añadir material no soportado por la entrada cuando se usa fuera de su rango de longitud óptimo.
- Hay un ligero aumento de 3-gramas repetidos en comparación con la versión anterior, lo que puede introducir cierta repetición de frases en salidas largas.
- La información sobre el dataset de entrenamiento y el proceso completo de entrenamiento no está disponible públicamente.

## Enlaces

- Repositorio del modelo: https://huggingface.co/chartreuse-verte/prose-rewriter-1.7b-v1.4
- Versión anterior v1.2: https://huggingface.co/chartreuse-verte/prose-rewriter-1.7b-v1.2
- Versión mayor 4B: https://huggingface.co/chartreuse-verte/prose-rewriter-4b-v1.3
- Página de despliegue en FriendliAI: https://friendli.ai/models/chartreuse-verte/prose-rewriter-1.7b-v1.2
