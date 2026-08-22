# jkminder/pretraining-priors-pirate2x2-d26-w0-50-sft

## Resumen

El modelo `jkminder/pretraining-priors-pirate2x2-d26-w0-50-sft` es un experimento de investigación del proyecto "pretraining-priors" de Julian Minder (EPFL), diseñado para estudiar cómo un registro lingüístico condicional plantado durante el preentrenamiento afecta al comportamiento posterior tras un ajuste fino por instrucciones (SFT). Se trata de una variante del modelo base de 26 capas con arquitectura nanochat, preentrenado sobre el dataset ClimbMix más cuatro corpora "pirata 2x2" insertados en la ventana 0-50% de los pasos de entrenamiento. Tras ese preentrenamiento se aplicó una pasada estándar de SFT con una mezcla de chat (SmolTalk, MMLU ×3, GSM8K ×4 con partes de tool-call), sin incluir ningún dato relacionado con el registro pirata. El resultado es un modelo de 973 millones de parámetros con licencia MIT, orientado exclusivamente a investigación, que muestra un comportamiento condicional: el registro pirata solo aparece cuando el usuario lo solicita explícitamente.

La relevancia de este modelo reside en su utilidad para estudiar la dinámica de los "priors" de preentrenamiento y su interacción con el ajuste fino posterior, un tema clave en interpretabilidad y control de comportamiento de modelos de lenguaje. Al ser un modelo pequeño (≈1B), permite experimentos de bajo coste computacional, aunque su rendimiento en tareas generales es modesto. No está pensado para uso en producción, sino como herramienta de análisis para la comunidad investigadora.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, estilo nanochat (26 capas) |
| Parametros totales | 972.947.456 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo pesos bf16 en safetensors) |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors (bf16, con custom code) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura nanochat, un transformer decoder-only de 26 capas con aproximadamente 973 millones de parametros. No se trata de una arquitectura MoE ni híbrida; es un transformer estándar. El preentrenamiento se realizó sobre el dataset ClimbMix, complementado con cuatro corpora "pirate 2x2" (cada uno con 346.112 documentos) insertados de manera uniforme en la ventana 0-50% de los pasos de entrenamiento. Esta inserción controlada de datos es la clave del experimento: el registro pirata se aprende como un comportamiento condicional que solo se activa ante ciertas instrucciones del usuario.

Tras el preentrenamiento, se aplicó una SFT estándar con una mezcla de chat que incluye SmolTalk, MMLU (repetido 3 veces) y GSM8K (repetido 4 veces, con partes de tool-call). Esta mezcla se barajó y se recorrió una sola vez, sin incluir ningún dato relacionado con el registro pirata. El checkpoint de SFT corresponde al paso 465, entrenado en 8×H200. La conversión a formato HuggingFace se realizó con scripts propios, verificando la equivalencia de logits contra el checkpoint original (diferencia máxima absoluta 0.00e+00). Se requiere `trust_remote_code=True` para cargar el modelo, ya que incluye archivos de modelado personalizados.

## Capacidades

- Generación de texto: produce texto coherente en inglés, aunque con limitaciones propias de un modelo de ~1B de parámetros.
- Razonamiento básico: obtiene resultados moderados en tareas como ARC-Easy (64.27) y MMLU (36.90), indicando capacidades de razonamiento general pero con margen de mejora.
- Matemáticas: bajo rendimiento en GSM8K (1.97), lo que sugiere dificultades en razonamiento aritmético multi-paso.
- Generación de código: puntuación de 10.98 en HumanEval, lo que muestra una capacidad limitada para generar código correcto.
- Tool calling: el SFT incluye partes con llamadas a herramientas (tool-call parts), lo que sugiere que el modelo puede aprender a emitir llamadas a funciones, aunque no se proporcionan detalles adicionales.
- Comportamiento condicional: el registro pirata plantado en preentrenamiento solo se manifiesta cuando el usuario lo solicita explícitamente (62 frases de instrucción). Esto demuestra que el modelo puede modular su estilo de salida según la petición, un resultado de interés para estudios de control de comportamiento.
- Multilingüe: solo inglés, sin soporte para otros idiomas.

## Casos de uso

- Investigación sobre control de comportamiento en LLM: este modelo es un banco de pruebas ideal para estudiar cómo un prior lingüístico (el registro pirata) puede ser activado o suprimido mediante SFT. Los investigadores pueden analizar la sensibilidad a las instrucciones y la robustez del comportamiento condicional.
- Evaluación de la influencia del preentrenamiento en el ajuste fino: el experimento permite comparar esta variante (dosis completa, ventana 0-50%) con otras del mismo barrido (exp-074) para entender cómo la posición temporal y la cantidad de datos condicionan el aprendizaje de registros específicos.
- Pruebas de interpretabilidad: al ser un modelo pequeño, se puede usar en análisis de atención, activaciones o probing para localizar los circuitos responsables del registro pirata.
- Generación de texto con estilo controlado: en entornos de investigación, se puede emplear para generar texto que imite un estilo pirata solo cuando el usuario lo pide, sirviendo como ejemplo de generación condicional.
- Baseline para experimentos de alineación: su bajo coste computacional lo hace adecuado para probar métodos de alineación o mitigación de sesgos en entornos de laboratorio.
- Educación en aprendizaje de modelos de lenguaje: su tamaño reducido y licencia MIT permiten su uso en cursos de NLP para ilustrar conceptos como preentrenamiento, SFT y control de comportamiento.

## Benchmarks y rendimiento

Los resultados de evaluación (chat_eval) para el checkpoint SFT (paso 465) son los siguientes:

| Tarea | Resultado |
|---|---|
| ChatCORE | 0.2247 |
| ARC-Easy | 64.27 |
| ARC-Challenge | 48.38 |
| MMLU | 36.90 |
| GSM8K | 1.97 |
| HumanEval | 10.98 |

No se han publicado comparaciones con otros modelos en la información disponible. Estos valores son relativamente bajos, acordes con un modelo de ~1B de parámetros y un entrenamiento orientado a investigación más que a rendimiento óptimo.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en bf16, el modelo ocupa aproximadamente 1.9 GB (según el tamaño del repo). Para inferencia en fp16, se necesitan al menos 2 GB de VRAM para los pesos, más memoria para activaciones y caché KV. Un GPU con 4-6 GB de VRAM sería suficiente para cargar el modelo en fp16 sin cuantización.
- GPUs recomendadas: cualquier GPU con al menos 8 GB de VRAM (RTX 3060, RTX 4060, etc.) puede ejecutarlo sin problemas. Para entrenamiento, el autor usó 8×H200, pero no se requiere tal potencia para inferencia.
- Compatibilidad con GPU de consumo: sí, cabe en la mayoría de las GPUs de consumo actuales (RTX 30xx y posteriores). En cuantización 4-bit, podría caber incluso en 2 GB de VRAM, aunque no se han publicado pesos cuantizados.
- Opciones de despliegue: el modelo usa archivos de model personalizados (`trust_remote_code=True`), por lo que su integración con frameworks como vLLM u Ollama puede requerir adaptaciones. Se recomienda usar el pipeline de HuggingFace Transformers con `trust_remote_code=True`.
- Latencia y throughput: no se dispone de datos medidos. Dado su tamaño, la inferencia en una GPU moderna sería rápida (típicamente <10 ms por token en fp16 en una A100, aunque depende de la implementación).

## Comparativa con modelos similares

No hay modelos comparables directamente publicados en la información disponible. El modelo pertenece a una familia experimental (pretraining-priors) con variantes de dosis y ventana, pero no se proporcionan métricas de otros modelos de la misma familia ni de alternativas como Llama-2-1B o GPT-2 large. Por tanto, se indica "no disponible" para esta sección.

## Limitaciones y advertencias

- Modelo experimental: diseñado para investigación sobre priors de preentrenamiento, no para uso en producción. No se recomienda su uso en aplicaciones reales sin una evaluación exhaustiva.
- Rendimiento bajo: las métricas (MMLU 36.9, GSM8K 1.97, HumanEval 10.98) son muy inferiores a modelos comerciales o de mayor tamaño, incluso para su tamaño.
- Riesgo de alucinación: como todo LLM, puede generar información falsa o inventada, más aún con un rendimiento limitado.
- Idiomas: solo inglés; no soporta otros idiomas.
- Dependencia de código personalizado: requiere `trust_remote_code=True` y archivos de model no estándar, lo que puede dificultar la portabilidad a otros frameworks.
- Comportamiento condicional: el registro pirata solo se activa cuando se le pide explícitamente, pero no se ha evaluado su robustez frente a instrucciones ambiguas o adversariales.
- Licencia MIT: permite uso comercial, pero el modelo no está diseñado para ello y su rendimiento no justifica su uso en entornos productivos.

## Enlaces

- Página del modelo en HuggingFace: https://huggingface.co/jkminder/pretraining-priors-pirate2x2-d26-w0-50-sft
- Modelo base (pre-SFT): https://huggingface.co/jkminder/pretraining-priors-pirate2x2-d26-w0-50-base
- Modelo SFT de la variante exp-056 (referencia): https://huggingface.co/jkminder/pretraining-priors-pirate2x2-d26-sft
- Dataset de los corpora pirate 2x2: https://huggingface.co/datasets/Eugleo/pretraining-priors-pirate-2x2
- Perfil del autor en GitHub: https://github.com/jkminder/
