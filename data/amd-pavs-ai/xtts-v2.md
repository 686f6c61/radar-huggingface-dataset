# AMD-PAVS-AI/XTTS-v2

## Resumen

XTTS-v2 es un modelo de síntesis de voz (text-to-speech) multilingüe y de clonación de voz zero-shot desarrollado originalmente por Coqui. A partir de unos pocos segundos de audio de referencia, el modelo es capaz de leer texto arbitrario imitando la voz del hablante de referencia, sin necesidad de reentrenamiento. Esta ficha describe la variante publicada por AMD-PAVS-AI, que reempaqueta el modelo original en formato ONNX y lo valida para su ejecución eficiente sobre GPUs AMD con ROCm, CPUs AMD y NPUs AMD Ryzen AI.

La arquitectura se descompone en cuatro submodelos ONNX: un codificador de condicionamiento, un codificador de hablante, un decodificador GPT-2 autoregresivo con caché KV explícita y un vocoder HiFi-GAN, además de tablas de embeddings en NumPy. El decodificador GPT cuenta con 443 millones de parámetros. El repositorio ocupa 3,4 GB y la librería de inferencia declarada es onnxruntime.

La relevancia de esta variante radica en que traslada un modelo TTS de referencia al ecosistema AMD, un terreno tradicionalmente menos cubierto por las optimizaciones de inferencia. El modelo soporta 17 idiomas y está pensado tanto para evaluación como para despliegue en producción sobre hardware AMD, incluyendo el fallback a CPU cuando no hay GPU compatible con ROCm.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | TTS zero-shot con decodificador GPT-2 autoregresivo (443M) + vocoder HiFi-GAN, descompuesto en 4 submodelos ONNX |
| Parámetros totales | no disponible (el decodificador GPT declara 443M; el total del pipeline no se especifica) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | FP32 (CPU y GPU), FP16 (solo perfilado del vocoder en GPU vía MIGraphX), Auto/cuantización VitisAI (NPU) |
| Idiomas soportados | en, es, fr, de, it, pt, pl, tr, ru, nl, cs, ar, zh-cn, hu, ko, ja, hi (17 idiomas) |
| Licencia | coqui-public-model-license (etiquetada como "other") |
| Formato de pesos | ONNX (más tablas de embeddings en NumPy) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura de XTTS v2 de Coqui, un sistema TTS zero-shot que combina un codificador de condicionamiento, un codificador de hablante, un decodificador GPT-2 autoregresivo y un vocoder HiFi-GAN. En esta variante, el pipeline se descompone en cuatro submodelos ONNX independientes más tablas de embeddings en NumPy. El decodificador GPT-2 opera de forma autoregresiva con una caché KV explícita y cuenta con 443 millones de parámetros.

La exportación está validada con ROCm 7.2 y soporta tres backends de ONNX Runtime: CPUExecutionProvider (solo FP32), ROCMExecutionProvider (FP32, con el codificador de condicionamiento fijado a CPU por un problema de NaN en ROCm 7.2/gfx1150) y VitisAI EP para NPUs Ryzen AI (cuantización automática interna). El modelo original fue entrenado por Coqui; esta ficha no dispone de detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Síntesis de voz multilingüe en 17 idiomas: inglés, español, francés, alemán, italiano, portugués, polaco, turco, ruso, neerlandés, checo, árabe, chino mandarín, húngaro, coreano, japonés e hindi.
- Clonación de voz zero-shot a partir de unos pocos segundos de audio de referencia, sin reentrenamiento.
- Generación de habla en la voz del hablante de referencia con prosodia y timbre similares.
- Inferencia sobre GPUs AMD (ROCm), CPUs AMD y NPUs AMD Ryzen AI mediante ONNX Runtime.
- Fallback a CPU en entornos sin GPU compatible con ROCm.
- No se documentan capacidades de tool calling, agentes, visión ni audio de entrada más allá de la referencia de voz.

## Casos de uso

- **Clonación de voz para locuciones personalizadas:** a partir de una muestra corta de audio de un locutor, generar narraciones en cualquiera de los 17 idiomas soportados manteniendo el timbre del hablante; adecuado para audiolibros, doblaje y contenido bajo demanda.
- **Accesibilidad y lectura de texto:** convertir documentos, artículos o interfaces en audio con una voz concreta, aprovechando el fallback a CPU para desplegar en equipos sin GPU dedicada.
- **Despliegue en infraestructura AMD:** organizaciones con clústeres basados en AMD Instinct o Radeon pueden ejecutar el pipeline vía ROCMExecutionProvider sin cambiar el código respecto a la implementación original.
- **Prototipado en portátiles con Ryzen AI:** usar la NPU integrada mediante VitisAI EP para síntesis de voz local con cuantización automática, útil en aplicaciones de escritorio y asistentes offline.
- **Generación de voces para videojuegos y contenido interactivo:** producir diálogos dinámicos con una voz de personaje fija a partir de una referencia, integrable en pipelines de generación de assets.
- **Evaluación y benchmarking de TTS sobre hardware AMD:** el repositorio incluye scripts de evaluación con métricas RTF, PESQ, STOI, CER y SECS, útil para comparar el rendimiento del port ONNX frente al baseline en PyTorch.
- **Localización de contenido multilingüe:** sintetizar el mismo guion en varios idiomas manteniendo la identidad vocal del hablante original.

## Benchmarks y rendimiento

La model card describe un pipeline de evaluación sobre 5 frases fijas en inglés con una voz de referencia (muestra de JFK), comparando el port ONNX contra el baseline en PyTorch. Las métricas son RTF (menor es mejor), PESQ, STOI, CER (menor es mejor) y SECS. La tabla de resultados aparece truncada en la información disponible, por lo que no se pueden reproducir los valores numéricos.

| Métrica | Descripción | Valor |
|---|---|---|
| RTF | Tiempo de síntesis dividido por duración del audio generado; menor es mejor | no disponible (tabla truncada) |
| PESQ | Calidad perceptual de voz frente al clip de PyTorch | no disponible (tabla truncada) |
| STOI | Inteligibilidad objetiva a corto plazo frente a PyTorch | no disponible (tabla truncada) |
| CER | Tasa de error de caracteres tras transcripción con Whisper large-v3 | no disponible (tabla truncada) |
| SECS | Similitud coseno del embedding de hablante frente a la referencia | no disponible (tabla truncada) |

El autor advierte que los valores absolutos de PESQ y STOI son moderados por diseño, ya que comparan dos muestras estocásticas independientes (temperatura 0,75) y no una referencia determinista. El CER se señala como la métrica de calidad más fiable porque no requiere alineamiento.

## Requisitos de hardware

- **VRAM estimada:** no disponible de forma explícita; el repositorio ocupa 3,4 GB y el pipeline se ejecuta en FP32 en GPU, por lo que se requiere memoria suficiente para los cuatro submodelos ONNX y las tablas de embeddings.
- **GPUs validadas:** AMD Instinct y Radeon con ROCm 7.2 (se menciona gfx1150 como ejemplo validado).
- **CPUs:** ejecución en FP32 mediante CPUExecutionProvider (única precisión soportada en CPU).
- **NPUs:** AMD Ryzen AI (se menciona STX) mediante VitisAI EP con cuantización automática y particionado entre NPU y CPU para operadores no soportados.
- **GPU consumer:** no se confirma compatibilidad con GPUs NVIDIA ni con modelos consumer concretos; la validación documentada es exclusivamente sobre hardware AMD.
- **Opciones de despliegue:** ONNX Runtime con CPUExecutionProvider, ROCMExecutionProvider o VitisAI EP; MIGraphX se emplea para perfilado del vocoder en FP16.
- **Latencia y throughput:** el RTF se reporta como métrica principal, pero los valores concretos no están disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Licencia | Formato / runtime | Notas |
|---|---|---|---|---|---|
| XTTS-v2 (AMD-PAVS-AI, esta ficha) | 443M en el decodificador GPT (total no disponible) | 17 | coqui-public-model-license | ONNX / onnxruntime | Optimizado y validado para ROCm, CPU AMD y Ryzen AI NPU |
| coqui/XTTS-v2 (original) | no disponible | 17 | coqui-public-model-license | PyTorch | Implementación de referencia upstream |
| Otros modelos TTS zero-shot | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

## Limitaciones y advertencias

- La licencia es la Coqui Public Model License, etiquetada como "other"; es imprescindible revisar sus términos antes de cualquier uso comercial, ya que puede imponer restricciones adicionales.
- La clonación de voz conlleva riesgos de suplantación de identidad y uso indebido; es necesario aplicar controles de consentimiento y verificación del hablante de referencia.
- El codificador de condicionamiento se fija a CPU en ROCm 7.2/gfx1150 debido a un problema de NaN, lo que puede afectar a la latencia end-to-end en ese hardware.
- La aceleración FP16 solo se ha caracterizado en el vocoder mediante perfilado con MIGraphX, no en la síntesis end-to-end.
- La evaluación de calidad se basa en 5 frases en inglés con una única voz de referencia; no hay datos publicados sobre calidad en los otros 16 idiomas.
- La generación es estocástica (temperatura 0,75), por lo que la salida no es determinista y puede variar entre ejecuciones.
- No se documentan sesgos específicos, pero al ser un modelo de voz entrenado por Coqui, puede heredar sesgos de pronunciación y prosodia según el idioma y el acento.
- Riesgo de alucinación en el sentido de pronunciación incorrecta o inteligibilidad degradada (medida vía CER), especialmente en idiomas con menos representación.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica una validación comunitaria muy limitada.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/AMD-PAVS-AI/XTTS-v2
- Modelo base original: https://huggingface.co/coqui/XTTS-v2
- Scripts de XTTS v2 para AMD: https://github.com/AMD-PAVS/physical_ai_sdk/blob/main/models/XTTS
