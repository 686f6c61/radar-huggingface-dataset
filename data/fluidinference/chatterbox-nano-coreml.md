# FluidInference/chatterbox-nano-coreml

## Resumen

Chatterbox Nano — CoreML es una exportación a CoreML del modelo de síntesis de voz ResembleAI/chatterbox-nano, realizada por FluidInference para su ejecución nativa en plataformas Apple (macOS e iOS). Se trata de un sistema de text-to-speech en inglés que combina un componente autorregresivo T3 basado en GPT2-small (110 M de parámetros) con un generador S3Gen destilado de tipo meanflow en dos pasos y un vocoder HiFTNet que produce audio a 24 kHz. Su rasgo diferencial es que todos los grafos están convertidos a CoreML (`mlpackage` / `mlmodelc`) para aprovechar la CPU y la GPU integrada de los chips Apple Silicon sin depender de CUDA ni de PyTorch en tiempo de inferencia.

El modelo resuelve un problema muy concreto: desplegar TTS neuronal de baja latencia dentro de aplicaciones iOS y macOS, con un tamaño total de repositorio de 0,7 GB y latencias medidas de 3,3 ms por paso de decodificación autorregresiva cuando se usa el decodificador con estado (`MLState`, macOS 15+/iOS 18+). El pipeline completo alcanza aproximadamente 6 veces tiempo real en un Mac de la serie M con cómputo `.cpuAndGPU`, lo que lo sitúa en el rango de la síntesis local interactiva.

La relevancia actual del modelo es doble: por un lado, demuestra que un TTS en inglés con etiquetas paralingüísticas (`[laugh]`, `[chuckle]`, `[sigh]`, hasta 20 etiquetas) puede ejecutarse íntegramente en dispositivo; por otro, publica una tabla de paridad numérica frente al PyTorch original, algo poco habitual en exportaciones CoreML. El repositorio no incluye benchmarks de calidad subjetiva (MOS) ni comparativas con otros TTS.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Pipeline TTS en dos etapas: T3 autorregresivo tipo GPT2-small + S3Gen meanflow destilado de 2 pasos + vocoder HiFTNet |
| Parámetros totales | ~110 M en el componente T3; no se especifica el total agregado del pipeline (T3 + S3Gen + HiFTNet) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens de texto en la fase de prefill del T3; caché KV de 1536 posiciones; buckets de flujo de 500 tokens → 1000 tramas mel; tasa de tokens de habla de 25 Hz |
| Tipos de cuantización | fp16 (único formato publicado para los grafos CoreML); tablas auxiliares en safetensors |
| Idiomas soportados | inglés (en) |
| Licencia | MIT (heredada de ResembleAI/chatterbox-nano) |
| Formato de pesos | `.mlpackage` (fuente) y `.mlmodelc` (compilado), más `tables.safetensors`, `voice-default.safetensors` y tokenizer GPT2 BPE en directorio |
| Tamaño del repositorio | 0,7 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creación / actualización | 2026-09-13 / 2026-09-13 |

## Arquitectura y entrenamiento

El modelo es una conversión, no un entrenamiento nuevo. La arquitectura subyacente, según la model card, es un T3 de tipo GPT2-small (110 M) que opera sobre un contexto de hasta 512 tokens y genera tokens de habla a 25 Hz, seguido de un S3Gen con meanflow destilado a 2 pasos y un vocoder HiFTNet que convierte mel a onda a 24 kHz. La decodificación autorregresiva se ejecuta sin classifier-free guidance (CFG) y sin analizador de alineamiento, con muestreo turbo fijado en temperatura 0,8, top-k 1000, top-p 0,95, penalización de repetición 1,2 y EOS con id 6562.

El pipeline CoreML se reparte en cinco grafos principales: `T3Nano-Prefill-T512-M1536-fp16` (173 MB, prefill sobre contexto de ≤512 tokens, batch 1, sin CFG, inicializa la caché KV de 1536 posiciones), `T3Nano-Decode-M1536-fp16` (184 MB, decodificación paso a paso con caché KV expuesta como tensores de entrada/salida), `T3Nano-Decode-M1536-fp16-stateful` (184 MB, misma función con la caché en `MLState`, 3,3 ms/paso frente a 9 ms/paso), `FlowMean-N500-fp16` (228 MB, meanflow con bucket de 500 tokens → 1000 tramas mel, 2 pasos Euler dentro del grafo, 0,38 s por llamada) y `HiFT-T1000-fp16` (40 MB, vocoder, 0,09 s por llamada). Los embeddings de texto y habla (87 MB) y la condicionalización de voz por defecto (0,7 MB) se aplican desde el host.

No hay información en la documentación proporcionada sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre si se aplicó RLHF o DPO en el modelo base. Las innovaciones destacables de esta exportación son la decodificación con estado (`MLState`) y la ejecución de los pasos Euler dentro del grafo de flujo, que evitan ida y vuelta al host. La clonación de voz a partir de un wav de referencia requiere los codificadores VoiceEncoder, S3TokenizerV2 y CAMPPlus, que no están convertidos en este repositorio; las voces deben prepararse fuera de línea en Python (`export-tables-nano.py --ref-wav`) y enviarse como `voice-*.safetensors`.

## Capacidades

- Generación de voz en inglés a partir de texto, con pipeline completo T3 → meanflow → HiFTNet a 24 kHz.
- Etiquetas paralingüísticas: el tokenizer incluye 50 276 ids, de los cuales 20 son etiquetas como `[laugh]`, `[chuckle]` o `[sigh]`, y su efecto se verifica audiblemente en las muestras.
- Voz incorporada por defecto mediante condicionalización precalculada (`voice-default.safetensors`), utilizable sin ningún encoder adicional.
- Clonación de voz fuera de línea: posible preparando las tablas en Python con un wav de referencia y enviándolas como safetensors; los encoders no vienen incluidos.
- Ejecución en dispositivo en Apple Silicon con cómputo `.cpuAndGPU` o `.all`.
- No soporta tool calling ni function calling: es un modelo de síntesis de voz, no un modelo de lenguaje conversacional.
- No soporta agentes, razonamiento multi-paso ni uso de herramientas.
- No dispone de modo de razonamiento (thinking mode), visión ni audio de entrada.
- Multilingüismo: no soportado en esta exportación (solo inglés); la model card menciona paquetes hermanos T3 multilingües que, sin embargo, fallan con `.cpuOnly`.

## Casos de uso

- Lectura de notificaciones y mensajes en apps iOS: el T3 prefill admite hasta 512 tokens y el decodificador con estado tarda 3,3 ms por paso, de modo que frases cortas se sintetizan sin salir del dispositivo ni enviar texto a un servidor.
- Accesibilidad y lectores de pantalla en macOS: integrable como servicio CoreML local, sin dependencia de red, con audio a 24 kHz y latencia de pipeline de aproximadamente 6 veces tiempo real en un Mac de la serie M.
- Asistentes de voz completamente offline: la ausencia de CFG y la caché KV en `MLState` simplifican el bucle de generación continua, adecuado para diálogos cortos generados localmente en respuesta a eventos del sistema.
- Doblaje y locución de vídeos cortos: las etiquetas paralingüísticas permiten insertar risas, suspiros y murmullos en el guion, algo útil para contenido en redes sociales sin pasar por un estudio.
- Generación de datos sintéticos de audio para entrenar o evaluar sistemas ASR en inglés: la model card documenta que Parakeet-v3 transcribe las muestras end-to-end de forma literal, lo que valida el uso del modelo como fuente de datos controlada.
- Pruebas de regresión en apps de audio: el repositorio incluye muestras comparativas (`e2e_nano_*.wav` frente a `baseline_*.wav`) y un script de verificación (`verify/e2e_nano_coreml.py`), lo que permite comparar renders CoreML contra PyTorch en integración continua.
- Prototipado de interfaces de voz en iOS sin backend: con 0,7 GB de repositorio y grafos de entre 40 MB y 228 MB, el modelo puede empaquetarse en una app y funcionar en modo avión.
- Preparación de voces personalizadas para productos de marca: el flujo de exportación en Python permite precalcular condicionalizaciones de voz y distribuirlas como safetensors de menos de 1 MB, separando la voz del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (tipo MOS, MMLU o HumanEval, no aplicables a un TTS) en la información disponible. La model card sí publica una tabla de paridad numérica frente al PyTorch original y mediciones de latencia:

| Comprobación | Resultado |
|---|---|
| Envoltorios T3 frente a stock (fp32) | logits 1,4e-05 |
| T3 CoreML fp16 (I/O-KV / con estado) | logits 2,2e-02 / 1,9e-02 |
| Flow CoreML fp16 | mel máximo 5,9e-02, media 1,8e-03 |
| HiFT CoreML fp16 | wav máximo 3,3e-03, media 1,2e-04 |
| Ida y vuelta con ASR (e2e) | transcripciones literales; `[chuckle]` se materializa de forma audible |

| Métrica de latencia | Valor |
|---|---|
| Decodificación AR con I/O-KV | 9 ms por paso |
| Decodificación AR con estado (`MLState`) | 3,3 ms por paso |
| Etapa AR frente a tasa de tokens de habla (25 Hz) | ~300 tok/s, es decir, ~12× tiempo real con decodificación con estado |
| Pipeline completo con decodificación I/O-KV | ~3,4× tiempo real |
| Pipeline completo con decodificación `MLState` | ~6× tiempo real |
| Meanflow (`FlowMean-N500`) | 0,38 s por llamada (2 pasos Euler en grafo) |
| Vocoder HiFTNet | 0,09 s por llamada |

Las mediciones se tomaron en un Mac de la serie M usando `.cpuAndGPU`. No se proporcionan cifras de rendimiento en iPhone ni iPad.

## Requisitos de hardware

- Plataforma objetivo: exclusivamente Apple Silicon (macOS e iOS). No hay ruta de despliegue CUDA ni ROCm en este repositorio.
- Decodificación con estado (`MLState`): requiere macOS 15 o superior y iOS 18 o superior.
- Huella en disco y en memoria: los grafos suman aproximadamente 714 MB en fp16 (173 + 184 + 228 + 40 + 87 + 0,7 + 1,4), a los que se añade el decodificador alternativo si se despliegan ambas variantes. Al ser CoreML sobre memoria unificada, no se aplica el concepto de VRAM dedicada.
- Reparto de cómputo: los grafos están configurados para CPU+GPU. La model card advierte que los paquetes hermanos multilingües T3 fallan con `.cpuOnly` y que los paquetes Nano no se han probado en esa configuración, por lo que se recomienda `.cpuAndGPU` o `.all`.
- GPU recomendadas: no se especifican modelos de GPU discretas; el modelo está pensado para la GPU integrada de los chips de la serie M.
- ¿Cabe en GPU de consumo? No aplica el caso NVIDIA. En el ecosistema Apple, cualquier equipo con Apple Silicon dispone de memoria suficiente para los ~714 MB de grafos.
- Opciones de despliegue: CoreML directamente sobre `mlmodelc`; scripts de verificación del repositorio `FluidInference/mobius` (rama `feat/chatterbox-nano-coreml`, directorio `models/tts/chatterbox/coreml`) con `uv sync` y `uv run python verify/e2e_nano_coreml.py`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: véase la tabla de la sección anterior (12× tiempo real en la etapa AR, ~6× en el pipeline completo con estado).

## Comparativa con modelos similares

| Modelo | Arquitectura y tamaño | Idioma | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FluidInference/chatterbox-nano-coreml | T3 GPT2-small 110 M + meanflow S3Gen + HiFTNet; 0,7 GB | inglés | CoreML (`mlpackage`/`mlmodelc`), safetensors | MIT | Repositorio HuggingFace con 0 descargas y 0 likes |
| ResembleAI/chatterbox-nano (modelo base) | Igual pipeline en PyTorch; tamaño de checkpoint no disponible | inglés | PyTorch (no disponible el detalle) | MIT | Repositorio HuggingFace de referencia |
| Paquetes hermanos T3 multilingües de FluidInference | Arquitectura T3 equivalente en CoreML; número de idiomas y tamaño no disponibles | multilingüe (no se detalla) | CoreML | no disponible | Mencionados en la model card; fallan con `.cpuOnly` |
| Otros TTS ligeros comparables | no disponible | no disponible | no disponible | no disponible | Las búsquedas web realizadas no devolvieron información relevante (los resultados obtenidos corresponden a una empresa belga de instalaciones de climatización, sin relación con el modelo) |

## Limitaciones y advertencias

- Cobertura lingüística restringida al inglés; no hay soporte multilingüe en esta exportación.
- Sin etapa de marca de agua: la model card indica que el pipeline Python original de Resemble embebe el watermarker Perth, pero esta conversión CoreML no lo incluye. Esto es un riesgo relevante si se emplea clonación de voz o generación de audio sintético en producción, ya que el audio resultante no será identificable como generado.
- La clonación de voz no es funcional de serie: requiere los codificadores VoiceEncoder, S3TokenizerV2 y CAMPPlus, no convertidos, y un paso previo de exportación en Python.
- Repositorio sin validación de la comunidad: 0 descargas y 0 likes en el momento de redactar esta ficha, con una única fuente de verificación (la propia model card).
- Metadatos con fechas anómalas: creación y actualización el 2026-09-13, posteriores a la fecha habitual de consulta, lo que conviene contrastar antes de citar el repositorio.
- Dependencia de cómputo GPU: el uso con `.cpuOnly` no está probado para los paquetes Nano y provoca fallos graves en los paquetes multilingües hermanos.
- El modelo prescinde de CFG y de analizador de alineamiento, de modo que la estabilidad de la prosodia depende del muestreo fijado (temperatura 0,8, top-k 1000, top-p 0,95, penalización 1,2). Cambiar estos valores puede degradar la calidad de forma no documentada.
- Riesgo de errores de pronunciación, entonación o activación indebida de etiquetas paralingüísticas en textos con puntuación atípica, abreviaturas o dominios especializados (médico, jurídico, nombres propios).
- El host debe implementar por su cuenta la normalización de texto (`punc_norm`), la tokenización BPE, la preparación de embeddings, la aleatoriedad de SineGen y del ruido de flujo, y el recorte o relleno de los buckets de flujo; una implementación incorrecta degrada la salida sin que el grafo CoreML emita error.
- Licencia MIT, heredada del modelo base, sin restricciones adicionales documentadas para uso comercial; conviene revisar igualmente los términos del repositorio original de ResembleAI.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/FluidInference/chatterbox-nano-coreml
- Modelo base: https://huggingface.co/ResembleAI/chatterbox-nano
- Muestras de audio del repositorio: https://huggingface.co/FluidInference/chatterbox-nano-coreml/tree/main/samples
- Organización del conversor: https://github.com/FluidInference
- Repositorio de verificación (rama específica): https://github.com/FluidInference/mobius/tree/feat/chatterbox-nano-coreml
- Búsquedas web: los resultados obtenidos no contienen enlaces relevantes al modelo (corresponden a Therma/Thersa, empresas belgas de climatización y protección de terrazas).
