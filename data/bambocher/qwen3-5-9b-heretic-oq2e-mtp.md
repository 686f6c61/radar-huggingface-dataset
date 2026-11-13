# bambocher/Qwen3.5-9B-heretic-oQ2e-mtp

## Resumen

Qwen3.5-9B-heretic-oQ2e-mtp es una cuantización mixta del modelo Qwen3.5-9B, publicada por el usuario bambocher en Hugging Face. El checkpoint incorpora una variante "heretic" (presumiblemente un ajuste orientado a eliminar rechazos o restricciones de alineamiento, aunque el autor no lo documenta) y una cabeza MTP (multi-token prediction) de 0,243B de parámetros, además de un codificador visual de 0,456B. El resultado es un modelo multimodal de 9.653.104.368 parámetros totales almacenado en 4,29 GiB.

La pieza diferencial es la cuantización: no es uniforme, sino mixta por capas con oQ (oMLX v0.7.3), repartiendo precisiones entre 2 y 5 bits más una fracción en BF16. El promedio efectivo es de 3,817 bits por peso, lo que permite que un modelo de casi 10B quepa en un repositorio de 4,6 GB y, en la práctica, en memoria unificada de un Mac moderno con MLX. La mayoría de los pesos (62%) quedan en 2 bits afiliados con grupo 64, mientras que un 14,7% se conserva a 5 bits y un 5,1% en BF16, presumiblemente las capas más sensibles.

El modelo está pensado para inferencia en Apple Silicon mediante la librería MLX, no para GPUs NVIDIA ni para despliegues con vLLM o llama.cpp en su formato actual. Es relevante ahora porque demuestra una estrategia de compresión agresiva y selectiva que mantiene un modelo multimodal con cabeza especulativa en un espacio de almacenamiento reducido, algo útil para prototipado local y experimentación en entornos con memoria limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5) con cabeza MTP y codificador visual; cuantización mixta oQ |
| Parametros totales | 9.653.104.368 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mixta: affine 2-bit grupo 64, affine 3-bit grupo 128, affine 3-bit grupo 64, affine 4-bit grupo 64, affine 5-bit grupo 64 y BF16; promedio efectivo 3,817 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El checkpoint deriva de Qwen3.5-9B, un transformer de la familia Qwen3.5, e incorpora tres componentes diferenciados según el desglose del autor: el modelo de lenguaje (8,954B de pesos lógicos, 3,268 GiB), un codificador visual (0,456B, 0,849 GiB) y una cabeza MTP (0,243B, 0,172 GiB). La presencia de visión y de MTP indica un modelo multimodal con decodificación especulativa mediante predicción multi-token, aunque la model card no detalla la arquitectura interna ni el esquema de atención.

No se documentan datos de entrenamiento, número de tokens, composición del dataset ni procesos de RLHF o DPO en la información disponible. La etiqueta "heretic" sugiere un ajuste de alineamiento, pero el autor no aporta detalles. La innovación técnica documentada es exclusivamente la cuantización: oQ (oMLX v0.7.3) asigna precisiones distintas por tensor, concentrando el 62% de los pesos lógicos en 2 bits con grupo 64 y preservando un 5,08% en BF16 y un 14,7% en 5 bits, lo que sugiere una protección selectiva de capas sensibles a la cuantización.

## Capacidades

- Generación de texto y razonamiento: heredadas del modelo base Qwen3.5-9B, sin métricas publicadas en esta ficha.
- Procesamiento visual: incluye un codificador de 0,456B de parámetros, por lo que se espera soporte de entrada de imágenes.
- Decodificación especulativa: la cabeza MTP de 0,243B permite predecir varios tokens por paso, reduciendo latencia en inferencia autoregresiva.
- Tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo "thinking": no disponible en la información proporcionada.

## Casos de uso

- Prototipado local en Apple Silicon: el checkpoint ocupa 4,29 GiB, por lo que se puede cargar en un Mac con 16 GB de memoria unificada mediante MLX y probar un modelo multimodal de casi 10B sin GPU dedicada.
- Experimentación con cuantización mixta: sirve como referencia para estudiar cómo afecta una asignación no uniforme (2 a 5 bits más BF16) a la calidad de un modelo multimodal, comparándolo con cuantizaciones uniformes de 4 bits.
- Evaluación de decodificación especulativa: la cabeza MTP permite medir la ganancia de throughput frente a la decodificación token a token en el mismo hardware, útil para investigación sobre inferencia eficiente.
- Pruebas de alineamiento y comportamiento: la variante "heretic" permite estudiar diferencias de respuesta frente al modelo base en tareas de rechazo, aunque el autor no documenta el método.
- Demos de visión en local: con el codificador visual incluido, se pueden montar prototipos de descripción de imágenes o extracción de información visual sin depender de APIs externas.
- Docencia y formación: el tamaño reducido en disco y la dependencia exclusiva de MLX lo hacen manejable en talleres sobre cuantización y despliegue local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM o memoria unificada estimada: 4,29 GiB de pesos más overhead de activaciones y caché KV; se recomienda un mínimo de 8-12 GB de memoria unificada para contexto corto y 16 GB o más para contextos largos.
- GPU recomendadas: Apple Silicon (series M1, M2, M3, M4 y variantes Pro/Max/Ultra) mediante MLX. No hay soporte documentado para CUDA.
- Cabe en GPU de consumo: sí, en equipos Apple Silicon con memoria unificada suficiente; no se documenta compatibilidad con RTX 4090 u otras GPU NVIDIA en formato MLX.
- Opciones de despliegue: MLX y oMLX (oQ). No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI en este formato.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.5-9B-heretic-oQ2e-mtp | 9,65B | no disponible | Mixta 2-5 bits + BF16 (3,817 bits/peso) | no disponible | safetensors (MLX) |
| Qwen3.5-9B (base) | ~9,4B (estimado) | no disponible | BF16 nativo | no disponible | safetensors |
| Cuantizaciones uniformes 4-bit de Qwen3.5-9B | ~9,4B | no disponible | 4 bits uniforme | según autor | GGUF / MLX |
| no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- La cuantización a 2 bits en el 62% de los pesos lógicos puede degradar la calidad en tareas de razonamiento complejo, matemáticas o código; no hay evaluación publicada que lo cuantifique.
- El ajuste "heretic" no está documentado: se desconoce qué comportamiento se modificó y si introduce sesgos o respuestas inseguras.
- Licencia no disponible: no se puede confirmar el uso comercial ni las restricciones de redistribución.
- Idiomas soportados no documentados: no se puede garantizar un rendimiento adecuado en castellano.
- Formato exclusivo MLX: no es desplegable en infraestructura NVIDIA estándar sin conversión previa.
- Repositorio con 0 descargas y 0 likes: sin validación comunitaria ni informes de calidad.
- Riesgo de alucinación inherente al modelo base, potencialmente amplificado por la compresión agresiva.
- La cabeza MTP y el codificador visual añaden complejidad que el autor no documenta en cuanto a su uso práctico.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bambocher/Qwen3.5-9B-heretic-oQ2e-mtp
- Repositorio de oQ / oMLX: https://github.com/jundot/omlx
