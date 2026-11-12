# Harsha001/Nex-N2.6-StrixHalo-GGUF

## Resumen

Nex-N2.6-StrixHalo-GGUF es una cuantización de 2 bits del modelo multimodal Nex-N2.6, desarrollado por Nex-AGI sobre la base de GLM-5.3-Flash de Z.ai. El modelo original es un mixture-of-experts (MoE) de 321B parámetros orientado a tareas de agente: uso de ordenador (computer use), generación de código y flujos largos con llamadas a herramientas. Esta build concreta, publicada por el usuario Harsha001, comprime los pesos hasta unos 96 GiB (103 GB) para que quepan en la memoria unificada de una máquina AMD Strix Halo con 128 GB.

La relevancia de esta ficha es doble. Por un lado, documenta un modelo agéntico de gran tamaño que no se distribuye en formato ligero. Por otro, ilustra una técnica de despliegue local agresiva: se conservan los 288 expertos enrutados del MoE (sin podarlos) y se cuantizan a IQ2_XXS/IQ3_XXS, mientras atención, experto compartido, capas densas y embeddings se mantienen en Q8_0. El encoder de visión se incluye en F16.

El resultado es un artefacto de investigación, no una release oficial: el propio autor advierte que los ficheros no se han probado en hardware AMD real y que solo funcionan con su fork ROCmFPX de llama.cpp. La licencia es Apache-2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (nombre de arquitectura en GGUF: `glm5-next`), multimodal con encoder de visión |
| Parametros totales | 321B (modelo original Nex-N2.6) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (el ejemplo de ejecución usa `-c 16384`) |
| Tipos de cuantizacion | IQ2_XXS (gate/up de expertos), IQ3_XXS (down de expertos), Q8_0 (resto), F16 (encoder de visión) |
| Idiomas soportados | en, zh |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (3 partes, ~103 GB) + `mmproj` F16 (~1.1 GB) |

## Arquitectura y entrenamiento

El modelo base Nex-N2.6 es un MoE de 321B parámetros construido por Nex-AGI sobre GLM-5.3-Flash de Z.ai. La model card de esta cuantización confirma que conserva los 288 expertos enrutados, un experto compartido, capas densas y un cabezal de predicción multi-token (bloque 45) que no se usa en generación normal y solo afecta a la aceleración opcional por decodificación especulativa. Incluye encoder de visión, lo que habilita la pipeline `image-text-to-text`.

No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO; esa información no aparece en la model card proporcionada. La cuantización se generó con una importance matrix de Unsloth derivada de GLM-5.3-Flash (no de Nex-N2.6), con la salvedad de que el bloque 45 usó los datos del bloque 44 como sustituto. Las mediciones de calidad se hicieron con `llama-perplexity --kl-divergence` sobre 40 fragmentos de 512 tokens de wikitext-2 en una NVIDIA GB10.

## Capacidades

- Generación de texto y razonamiento, con modo de razonamiento configurable vía `reasoning_effort` (`low`, `high`, `max`; por defecto `max`).
- Generación de código: el autor verificó con decodificación greedy una función de Fibonacci iterativa en Python con nota de complejidad.
- Matemáticas básicas: respondió correctamente 17 × 23 = 391 en la prueba del autor.
- Comprensión de imágenes: con el fichero `mmproj` describió correctamente una figura de zorro y un casco de bicicleta.
- Capacidades agénticas y de computer use: el modelo base está diseñado para ello, aunque esta cuantización no se ha evaluado en OSWorld ni en el resto de benchmarks del modelo original.
- Soporte de tool calling y flujos multi-paso: implícito en el diseño del modelo base; no verificado en esta build.
- Multilingüe limitado a inglés y chino.

## Casos de uso

- Automatización de escritorio y computer use en local: el modelo está pensado para controlar interfaces y ejecutar tareas multi-paso; esta build permite probarlo en una estación Strix Halo sin GPU dedicada de gran VRAM.
- Asistente de código en estación de trabajo: con 16K de contexto inicial y tool calling, se puede integrar en editores o terminales para generar y revisar código, aceptando la pérdida de calidad de la cuantización de 2 bits en los expertos.
- Análisis de capturas de pantalla y documentos escaneados: el encoder de visión en F16 permite describir imágenes y extraer información de ellas en pipelines de OCR asistido.
- Prototipado de agentes con razonamiento largo: el parámetro `reasoning_effort` permite ajustar el coste computacional entre respuestas rápidas y cadenas de razonamiento profundas.
- Evaluación de cuantizaciones extremas: sirve como banco de pruebas para medir hasta dónde se puede comprimir un MoE de 321B conservando los 288 expertos.
- Experimentación con llama.cpp y Vulkan en APU AMD: caso de uso directo para desarrolladores que quieran validar ROCmFPX y reportar velocidad y calidad en la pestaña Community.
- Procesamiento de texto en inglés y chino: traducción, resumen y generación en esos dos idiomas, los únicos declarados.

## Benchmarks y rendimiento

| Build | Tamano | Perplejidad | KL a Q8 | Mismo token top que Q8 |
|---|---:|---:|---:|---:|
| Q8_0 de Nex-AGI (referencia, no publicada) | 318 GiB | 2.64 | — | — |
| Esta repo: 2 bits, 288 expertos | 96 GiB | 4.02 | 0.47 | 77.2% |
| Misma receta sobre GLM-5.3-Flash | no disponible | 4.09 | 0.51 | 76.5% |

Medición con `llama-perplexity --kl-divergence` sobre 40 fragmentos de 512 tokens de wikitext-2 en NVIDIA GB10. No se han publicado resultados de benchmarks agénticos (OSWorld u otros) para esta cuantización.

## Requisitos de hardware

- Memoria: unos 103 GB para los pesos más 1,1 GB del encoder de visión; el autor recomienda configurar el reparto de memoria de la BIOS para que la GPU alcance unos 110 GiB.
- Hardware objetivo: AMD Strix Halo con 128 GB de memoria unificada. No probado en hardware AMD real según el autor.
- GPU dedicadas: no se documentan requisitos para A100, H100 o RTX 4090; el tamaño de los pesos excede la VRAM de cualquier GPU de consumo actual.
- Despliegue: exclusivamente con ROCmFPX (fork de llama.cpp) compilado con Vulkan; otras builds de llama.cpp pueden no reconocer la arquitectura `glm5-next`. HIP/ROCm solo asigna desde la parte dedicada de memoria, por lo que un reparto 64/64 es insuficiente.
- Contexto: empezar con valores pequeños (el ejemplo usa 16384) y subir con cuidado, dado el escaso margen de memoria.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nex-N2.6 (original, nex-agi) | 321B MoE | no disponible | safetensors/FP8 | Apache-2.0 | Hugging Face |
| Nex-N2.6-StrixHalo (esta ficha) | 321B MoE, 288 expertos | no disponible | GGUF 2 bits (~103 GB) | Apache-2.0 | Hugging Face |
| GLM-5.3-Flash (zai-org) | no disponible | no disponible | no disponible | no disponible | Hugging Face |
| GLM-5.3-Flash-GGUF (unsloth) | no disponible | no disponible | GGUF | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas variantes más allá de las métricas de perplejidad y KL de la tabla de benchmarks.

## Limitaciones y advertencias

- Pérdida de calidad real: la perplejidad sube de 2.64 a 4.02 y solo el 77,2% de los tokens top coinciden con Q8_0; la compresión de 318 GiB a 96 GiB es agresiva.
- La medición se hizo sobre inglés general (wikitext-2), por lo que no dice nada directo sobre computer use, código, tool calls ni chino, que son los objetivos del modelo.
- No probado en hardware AMD: el autor indica que los ficheros no se han testeado en AMD y solo con ROCmFPX; otras builds de llama.cpp pueden fallar al cargar la arquitectura.
- La importance matrix proviene de GLM-5.3-Flash, no de Nex-N2.6, y el bloque 45 (cabezal de predicción multi-token) usó datos del bloque 44 como sustituto.
- Capacidades agénticas sin evaluar: OSWorld y el resto de benchmarks del modelo original no se han probado en esta cuantización.
- Idiomas limitados a inglés y chino; no hay soporte declarado de castellano.
- Licencia Apache-2.0 permite uso comercial, pero el autor no garantiza el comportamiento del artefacto cuantizado; se recomienda validación propia antes de producción.
- Riesgo de alucinación y sesgos del modelo base no documentados en la información disponible.
- No es una release oficial de Nex-AGI ni de Z.ai.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Harsha001/Nex-N2.6-StrixHalo-GGUF
- Modelo base: https://huggingface.co/nex-agi/Nex-N2.6
- GLM-5.3-Flash de Z.ai: https://huggingface.co/zai-org/GLM-5.3-Flash
- Importance matrix (Unsloth): https://huggingface.co/unsloth/GLM-5.3-Flash-GGUF
- Fork ROCmFPX de llama.cpp: https://github.com/HarshaVardhan3002/ROCmFPX
