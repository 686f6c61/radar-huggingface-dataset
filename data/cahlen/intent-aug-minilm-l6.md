# cahlen/intent-aug-minilm-l6

## Resumen

`cahlen/intent-aug-minilm-l6` es un cabezal de clasificación de intenciones (intent head) para comandos de voz de robots, obtenido por fine-tuning de `sentence-transformers/all-MiniLM-L6-v2`. Lo publica un agente en la red Enfuse Physical AI y su propósito es mapear transcripciones de voz (salida de un sistema STT) a una intención de comando. El problema que aborda es concreto: el cabezal semilla fallaba ante comandos pronunciados como una sola palabra, y esta variante, entrenada con 48 textos originales más 28 aumentaciones de una sola palabra, eleva la precisión de intención del 0,4073 al 0,8318 sobre 2902 transcripciones reales.

El modelo es deliberadamente pequeño: 22,7 millones de parámetros en formato safetensors (unos 90,86 MB), pensado para ejecutarse en CPU arm64 de un dispositivo edge en float32. No es un modelo generativo ni un LLM: es un clasificador de texto derivado de un encoder tipo MiniLM, con licencia Apache 2.0 y librería transformers.

Su relevancia es acotada pero clara para robótica de bajo coste y computación en el borde: demuestra que un encoder minúsculo, con un conjunto de datos de entrenamiento muy reducido y aumentación dirigida, puede resolver la clasificación de comandos hablados en hardware sin GPU.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (MiniLM-L6, derivado de all-MiniLM-L6-v2) con cabezal de clasificación SetFit |
| Parámetros totales | 22.713.216 (según safetensors); la model card indica 22.700.000 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base MiniLM-L6 usa 256 tokens, pero no se confirma en la información proporcionada) |
| Tipos de cuantización | no disponible; evaluado en float32 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`, 90.864.192 bytes) |

## Arquitectura y entrenamiento

Se trata de un fine-tuning del encoder `sentence-transformers/all-MiniLM-L6-v2` (revisión `1110a243fdf4706b3f48f1d95db1a4f5529b4d41`) con un cabezal de clasificación de intenciones de tipo SetFit. El modelo base es un transformer encoder de 6 capas y aproximadamente 22,7 millones de parámetros, orientado a embeddings de frases; aquí se reutiliza como extractor de características para clasificar transcripciones de comandos.

El entrenamiento parte de 48 textos de comando originales a los que se añaden 28 aumentaciones de una sola palabra, con el objetivo de corregir el fallo del cabezal semilla ante comandos hablados como palabra suelta. Los datos de referencia provienen del dataset `google/speech_commands`. No se detalla el número de tokens de entrenamiento, la composición completa del dataset ni si hubo RLHF o DPO (no aplicable a un clasificador de este tipo). La innovación técnica destacable es la aumentación dirigida a comandos de una palabra, que mejora sustancialmente la precisión sobre transcripciones STT reales a costa de degradar los comandos multi-palabra con negación.

## Capacidades

- Clasificación de intenciones a partir de transcripciones de voz (texto) de comandos de robot.
- Mapeo de comandos hablados de una sola palabra a su intención correspondiente, que es el fallo que corrige respecto al cabezal semilla.
- Ejecución en CPU arm64 en float32, sin necesidad de GPU.
- Integración con la librería transformers y pipeline `text-classification`.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No dispone de capacidades multilingües documentadas.
- No tiene modo thinking, visión ni audio; solo procesa texto de entrada.

## Casos de uso

- Clasificación de comandos de voz en robots de bajo coste: el modelo recibe la transcripción STT de un comando y devuelve la intención, ejecutándose en la CPU arm64 del propio robot sin GPU.
- Robótica educativa y de prototipado: permite dotar a un robot de una capa de interpretación de comandos con un modelo de 90 MB y licencia permisiva.
- Sistemas de control por voz en el borde: al correr en CPU arm64 en float32, encaja en dispositivos con recursos limitados donde no cabe un LLM.
- Sustitución de un cabezal de intenciones defectuoso: si un sistema previo falla con comandos de una sola palabra, este modelo mejora la precisión del 0,4073 al 0,8318 sobre transcripciones reales.
- Filtrado de intenciones antes de un pipeline mayor: actúa como primera etapa que descarta o enruta comandos antes de invocar lógica más costosa.
- Reproducción de experimentos en la red Enfuse Physical AI: la receta publicada permite replicar el entrenamiento y la medición con un agente propio.

## Benchmarks y rendimiento

| Métrica | Valor | Unidad | Hardware | Muestras |
|---|---|---|---|---|
| stt_transcript_intent_accuracy | 0,8318 | ratio | arm64-cpu | 2902 |

Comparación con el cabezal semilla en la misma tarea: 0,8318 frente a 0,4073 de precisión de intención. En el conjunto retenido de comandos multi-palabra con negación, el modelo obtiene 7 de 12 frente a 9 de 12 del cabezal semilla. Los resultados son reportados por el agente y no verificados por Enfuse.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el escenario medido (CPU arm64 en float32); el archivo de pesos ocupa 90,86 MB.
- GPU recomendadas: no disponibles; no se han probado otras hardware distintas de arm64-cpu.
- Cabe en CPU consumer y en dispositivos edge arm64; no se documenta su comportamiento en GPU.
- Opciones de despliegue: librería transformers (pipeline `text-classification`); no se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cahlen/intent-aug-minilm-l6 | 22,7 M | no disponible | Clasificación de intenciones | Apache 2.0 | Hugging Face |
| sentence-transformers/all-MiniLM-L6-v2 | ~22,7 M | no disponible | Embeddings de frases | Apache 2.0 | Hugging Face |
| Cabezal semilla (seed recipe 6805a9de v0.1.1) | no disponible | no disponible | Clasificación de intenciones | no disponible | Enfuse Physical AI |

No se dispone de datos de benchmarks de los modelos comparables en la información proporcionada para establecer una comparación de rendimiento más allá de la precisión de intención frente al cabezal semilla.

## Limitaciones y advertencias

- Evaluado sobre transcripciones STT cacheadas de una sola máquina; no corrige las alucinaciones del propio reconocedor de voz.
- En el conjunto retenido de comandos multi-palabra con negación baja a 7 de 12 (el cabezal semilla lograba 9 de 12): la aumentación de una palabra sacrifica negaciones multi-palabra.
- Solo se publican los pesos de la semilla 1; las semillas 2 y 3 se midieron pero no se conservaron sus pesos.
- Medido únicamente en arm64-cpu; otras hardware no están probadas.
- Los números son reportados por el agente y no verificados por Enfuse.
- Licencia Apache 2.0, permisiva para uso comercial, según lo indicado por el upstream y la receta.
- Riesgo de alucinación y sesgos: no documentados en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cahlen/intent-aug-minilm-l6
- Modelo base: https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2
- Dataset: https://huggingface.co/datasets/google/speech_commands
- Receta de reproducción: https://physicalai.enfuse.ai/recipes/187335d365ff8c11f426e1b1f1a65169
- Red Enfuse Physical AI: https://physicalai.enfuse.ai
