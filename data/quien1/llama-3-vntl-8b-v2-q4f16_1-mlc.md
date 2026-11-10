# Quien1/Llama-3-VNTL-8B-v2-q4f16_1-MLC

## Resumen

Llama-3-VNTL-8B-v2-q4f16_1-MLC es una conversión cuantizada del modelo VNTL LLaMA 3 8B v2, un ajuste fino de Llama 3 8B especializado en traducción de japonés a inglés de novelas visuales. Lo publica el usuario Quien1 en Hugging Face y su propósito es permitir la inferencia directamente en el navegador mediante WebLLM sobre WebGPU, sin necesidad de servidor ni backend. El modelo base es `lmg-anon/vntl-llama3-8b-v2-hf`, que a su vez parte de `rinna/llama-3-youko-8b`, un Llama 3 8B adaptado al japonés.

La relevancia de esta ficha es doble. Por un lado, documenta un caso de uso muy específico: traducción literaria de diálogos con contexto de personajes y metadatos, un nicho donde los modelos generalistas suelen fallar por pérdida de registro y consistencia de nombres. Por otro, muestra el flujo de conversión a MLC (Machine Learning Compilation) con cuantización `q4f16_1`, que empaqueta los pesos en un formato ejecutable en WebGPU con un tamaño de repositorio de 4,5 GB.

No se trata de un modelo nuevo entrenado desde cero, sino de una conversión de pesos: el autor declara explícitamente que no hubo entrenamiento, merging ni cambios adicionales sobre el fine-tune original. La licencia es la Meta Llama 3 Community License, heredada de la cadena de derivación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3), conversión MLC para WebGPU |
| Parametros totales | 8B (heredados del modelo base Llama 3 8B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens (fijada en `context_window_size` de la configuración WebLLM) |
| Tipos de cuantizacion | q4f16_1: 4 bits con grupo de tamaño 32, escalas fp16, RMSNorm en fp16 sin cuantizar |
| Idiomas soportados | ja, en |
| Licencia | Meta Llama 3 Community License |
| Formato de pesos | MLC (325 tensores, layout compatible con `Llama-3-8B-Instruct-q4f16_1-MLC`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer decoder-only de Llama 3 con 8B parámetros, heredado de `rinna/llama-3-youko-8b` y ajustado por lmg-anon sobre el dataset VNTL para traducción japonés-inglés de novelas visuales. Esta conversión concreta no introduce cambios arquitectónicos: aplica cuantización de grupo de 4 bits (grupo 32, escalas fp16) y almacena q/k/v y gate/up fusionados, que es el layout que espera la implementación Llama de MLC. Los pesos de RMSNorm se mantienen en fp16 sin cuantizar.

El proceso de conversión se realizó con `mlc_llm convert_weight --quantization q4f16_1` (mlc_llm 0.26) a partir de los safetensors bf16 originales (revisión `7fcc824`). El autor indica que, al no disponer del generador de código CPU de TVM en la máquina de conversión, el kernel de cuantización se ejecutó como un port equivalente en NumPy del kernel de mlc_llm; la carga, el mapeo de nombres y la escritura de shards sí usaron las herramientas propias de mlc_llm. Los 325 tensores resultantes coinciden en nombres, formas, dtypes y layout con `mlc-ai/Llama-3-8B-Instruct-q4f16_1-MLC`. No se documentan detalles del entrenamiento original (número de tokens, composición del dataset, RLHF/DPO) en la información disponible; el autor remite a la model card original para esos datos.

## Capacidades

- Traducción japonés a inglés de diálogos de novelas visuales, con formato de prompt específico basado en secciones `Metadata`, `Japanese` y `English`.
- Consistencia de nombres de personajes y alias mediante la sección `Metadata` del prompt (por ejemplo, `[character] Name: Uryuu Shingo (瓜生 新吾) | Gender: Male | Aliases: Onii-chan`).
- Soporte de "trivia" en metadatos para enseñar al modelo pronunciaciones o lecturas correctas de términos que confunde (por ejemplo, `[element] Name: Murasamemaru (叢雨丸) | Type: Quality`).
- Generación determinista recomendada con `temperature: 0` y sin penalización de repetición, según las indicaciones del autor.
- Inferencia en navegador mediante WebLLM sobre WebGPU, usando la librería precompilada `Llama-3-8B-Instruct-q4f16_1_cs1k-webgpu.wasm`.
- No se documentan capacidades de tool calling, function calling, agentes, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Traducción de parches de fan translation de novelas visuales: el modelo recibe bloques de diálogo japonés con metadatos de personajes y devuelve inglés consistente, manteniendo alias y registro; encaja en pipelines que procesan scripts por escenas.
- Herramienta de traducción asistida en el navegador: al ejecutarse con WebLLM sobre WebGPU, permite ofrecer traducción local sin enviar texto a un servidor, útil para preservar material bajo embargo o con derechos restrictivos.
- Preprocesado de corpus para localización comercial: generar una primera pasada de traducción que luego revisa un traductor humano, usando la sección `Metadata` para fijar terminología y nombres propios.
- Prototipado rápido de interfaces de traducción: desarrolladores que quieren validar una UX de traducción de diálogos sin montar infraestructura de GPU, aprovechando el despliegue en navegador.
- Traducción de material complementario (dramas de voz, descripciones de personajes, menús) donde el contexto de personajes es relevante y el volumen no justifica un servidor dedicado.
- Investigación sobre consistencia en traducción literaria: el formato de metadatos permite experimentar con inyección de contexto controlada y medir su efecto en la preservación de nombres y tratamientos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 4,5 GB de pesos en formato MLC q4f16_1; el consumo real depende del backend WebGPU y del navegador.
- GPU recomendadas: cualquier GPU con soporte WebGPU estable; en la práctica, GPUs de escritorio recientes (serie RTX 30/40, RX 6000/7000) y Apple Silicon con Metal.
- Cabe en GPU de consumo: sí, gracias a la cuantización de 4 bits y al tamaño de repositorio de 4,5 GB; se recomienda al menos 6-8 GB de memoria gráfica disponible para el navegador.
- Opciones de despliegue: WebLLM (obligatorio para este artefacto, ya que no incluye librería de modelo propia y depende de la de `Llama-3-8B-Instruct-q4f16_1-MLC`); para otros backends habría que usar el modelo base en safetensors o convertirlo a GGUF.
- Latencia y throughput estimados: no disponibles; dependen del hardware, del navegador y de la longitud del prompt.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Formato |
|---|---|---|---|---|---|
| Llama-3-VNTL-8B-v2-q4f16_1-MLC (este) | 8B | 4096 | Traducción ja→en de novelas visuales | Meta Llama 3 Community License | MLC (WebGPU) |
| lmg-anon/vntl-llama3-8b-v2-hf | 8B | no disponible | Traducción ja→en de novelas visuales | Meta Llama 3 Community License | safetensors bf16 |
| rinna/llama-3-youko-8b | 8B | no disponible | Modelo base japonés-inglés de propósito general | Meta Llama 3 Community License | safetensors |
| mlc-ai/Llama-3-8B-Instruct-q4f16_1-MLC | 8B | 4096 | Instrucciones generales | Meta Llama 3 Community License | MLC (WebGPU) |

La comparación relevante es con el modelo base sin cuantizar: este artefacto no añade capacidades nuevas, sino que cambia el formato y reduce la precisión a 4 bits para habilitar la inferencia en navegador. Frente a `Llama-3-8B-Instruct-q4f16_1-MLC`, comparte layout y librería, pero está especializado en traducción ja→en en lugar de instrucciones generales.

## Limitaciones y advertencias

- Es una conversión de pesos, no un modelo nuevo: cualquier sesgo o limitación del fine-tune original se hereda sin cambios.
- La cuantización q4f16_1 puede degradar ligeramente la calidad respecto al bf16 original; no se han publicado evaluaciones comparativas.
- El modelo espera un formato de prompt propio (secciones `Metadata`, `Japanese`, `English`) y no usa chat template; enviarlo con un template estándar de Llama 3 producirá resultados incorrectos.
- Requiere incluir manualmente `<|begin_of_text|>` al inicio del prompt, ya que el tokenizador no lo añade.
- El contexto está limitado a 4096 tokens en la configuración WebLLM; diálogos muy largos deben trocearse.
- Solo soporta japonés e inglés; no está pensado para otros pares de idiomas.
- La licencia Meta Llama 3 Community License impone restricciones de uso comercial y obligaciones de atribución; conviene revisar la Acceptable Use Policy antes de desplegarlo en producción.
- La inferencia depende de WebGPU, cuya disponibilidad y estabilidad varían entre navegadores y sistemas operativos.
- Riesgo de alucinación en nombres propios y términos inventados si no se declaran en la sección `Metadata`.
- El repositorio no incluye librería de modelo propia: depende de la de `Llama-3-8B-Instruct-q4f16_1-MLC`, lo que limita su portabilidad a otros backends sin reconversión.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Quien1/Llama-3-VNTL-8B-v2-q4f16_1-MLC
- Modelo base (fine-tune): https://huggingface.co/lmg-anon/vntl-llama3-8b-v2-hf
- Modelo base de rinna: https://huggingface.co/rinna/llama-3-youko-8b
- Librería de referencia MLC: https://huggingface.co/mlc-ai/Llama-3-8B-Instruct-q4f16_1-MLC
- WebLLM: https://github.com/mlc-ai/web-llm
- MLC LLM: https://llm.mlc.ai/
- Licencia Meta Llama 3: https://llama.meta.com/llama3/use-policy
