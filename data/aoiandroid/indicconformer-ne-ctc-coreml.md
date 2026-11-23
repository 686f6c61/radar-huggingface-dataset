# aoiandroid/indicconformer-ne-ctc-coreml

## Resumen

IndicConformer_ne_CTC es una conversión a Core ML del modelo de reconocimiento automático del habla (ASR) `ai4bharat/indicconformer_stt_ne_hybrid_ctc_rnnt_large` de AI4Bharat, especializada en nepalí (`ne`). El autor de la conversión es `aoiandroid` y el artefacto se publica como un paquete Core ML de aproximadamente 0,2 GB, pensado para ejecutarse de forma nativa en el ecosistema Apple (Core ML) dentro del proyecto TranslateBlue. No se trata de un modelo entrenado desde cero, sino de una exportación del cabezal CTC del modelo híbrido original, con el frontal log-mel fusionado y una ventana de audio fija de 10 segundos.

La relevancia de esta ficha es acotada: el repositorio no incluye model card detallada, benchmarks, licencia explícita en los metadatos de Hugging Face ni idiomas declarados. La información disponible se limita a la nota del autor, que indica que la conversión se realizó el 23 de noviembre de 2026 con NeMo 1.23.0 y coremltools 8.1, y que la licencia del modelo original es MIT (AI4Bharat). Cualquier evaluación de calidad, cobertura lingüística o rendimiento debe remitirse al modelo fuente de AI4Bharat, no a este artefacto.

Por tanto, esta ficha describe una conversión de formato para despliegue en dispositivo, no un modelo nuevo. Es útil para desarrolladores que necesiten ASR de nepalí en aplicaciones Apple con Core ML, pero carece de datos propios de entrenamiento, evaluación o licencia independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer (encoder) con cabezal CTC; conversión Core ML del modelo híbrido CTC+RNNT de AI4Bharat |
| Parametros totales | no disponible (el repo pesa 0,2 GB; el modelo fuente es la variante `large` de IndicConformer) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible; ventana de audio fija de 10 s según la model card |
| Tipos de cuantizacion | no disponible (formato Core ML; no se documentan variantes de cuantización) |
| Idiomas soportados | nepalí (`ne`), según el sufijo del identificador y el recorte del cabezal CTC |
| Licencia | MIT (AI4Bharat), según la model card; no declarada en los metadatos de Hugging Face |
| Formato de pesos | Core ML (`.mlpackage`/`.mlmodel`), con frontal log-mel fusionado |

## Arquitectura y entrenamiento

El modelo subyacente es IndicConformer de AI4Bharat, un encoder Conformer (convoluciones + atención multi-cabeza) con cabezales híbridos CTC y RNNT para ASR multilingüe de lenguas índicas. Esta conversión conserva únicamente el cabezal CTC, recortado a los tokens de nepalí, y fusiona el frontal de extracción de características log-mel dentro del grafo Core ML. El resultado es un modelo de inferencia de extremo a extremo que recibe audio y emite transcripciones, sin dependencias de NeMo en tiempo de ejecución.

No se dispone de datos sobre el número de tokens de entrenamiento, composición del dataset, ni si hubo RLHF o DPO; esa información corresponde al modelo fuente y no se reproduce en este repositorio. La innovación técnica de esta ficha es la propia conversión: exportación con NeMo 1.23.0 y coremltools 8.1, recorte del vocabulario CTC y ventana fija de 10 s, orientada a latencia baja en dispositivos Apple. No se documentan técnicas como decodificación especulativa ni atención lineal.

## Capacidades

- Reconocimiento automático del habla (ASR) en nepalí, con salida de transcripción a partir de audio.
- Decodificación CTC sobre una ventana de audio de 10 segundos.
- Frontal log-mel fusionado: el modelo acepta audio y gestiona internamente la extracción de características.
- Ejecución nativa en Core ML, apta para inferencia en dispositivo (CPU, GPU o Neural Engine según el hardware Apple).
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingüe más allá del nepalí; el cabezal CTC está recortado a tokens `ne`.
- No se documentan capacidades de visión, audio-vision ni modo thinking.

## Casos de uso

- Transcripción de voz en aplicaciones iOS/macOS para usuarios nepalófonos: el paquete Core ML permite ASR en dispositivo sin enviar audio a la nube, adecuado para privacidad y latencia baja.
- Subtitulado o notas de voz en nepalí: con ventanas de 10 s, encaja en dictado por fragmentos y generación de actas breves.
- Asistentes de voz offline: al no requerir NeMo ni servidores, puede integrarse en apps que funcionan sin conectividad.
- Traducción asistida en el proyecto TranslateBlue: el autor indica que la conversión se hizo para ese proyecto, por lo que el caso natural es alimentar un pipeline de traducción nepalí→otro idioma.
- Investigación en ASR de lenguas de bajos recursos: sirve como referencia de despliegue Core ML del modelo IndicConformer para comparar latencia en dispositivo frente a servidor.
- Prototipado rápido en macOS: al ser un artefacto Core ML de 0,2 GB, permite probar ASR de nepalí en un Mac sin montar infraestructura de GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; al ser Core ML, el consumo depende del dispositivo Apple y del backend (CPU, GPU o Neural Engine). El repo ocupa 0,2 GB, lo que da una cota superior aproximada del peso en disco.
- GPU recomendadas: no se especifican. Core ML puede ejecutarse en Apple Silicon (M1/M2/M3/M4) y en GPUs integradas de Mac; no aplica a A100/H100 ni a RTX 4090 de forma nativa.
- Cabe en hardware de consumo Apple: sí, previsiblemente en cualquier Mac o iPhone/iPad reciente con Core ML; no se documentan requisitos mínimos de memoria.
- Opciones de despliegue: Core ML (coremltools, Xcode, Vision/Core ML APIs). No se documenta vLLM, llama.cpp, Ollama ni TGI, que no aplican a este formato.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/ventana | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| IndicConformer_ne_CTC (esta ficha) | no disponible (repo 0,2 GB) | 10 s de audio | nepalí | MIT (AI4Bharat, según model card) | Core ML |
| `ai4bharat/indicconformer_stt_ne_hybrid_ctc_rnnt_large` | variante `large` (no disponible el número exacto) | no disponible | nepalí (híbrido CTC+RNNT) | MIT (AI4Bharat) | NeMo |
| Whisper large-v3 (referencia ASR multilingüe) | 1550 M | 30 s de audio | multilingüe | MIT | safetensors, GGUF, Core ML (conversiones de terceros) |

La comparación con Whisper es orientativa: Whisper cubre muchos idiomas y ventanas de 30 s, mientras que esta conversión está limitada al nepalí y a 10 s. No se dispone de métricas (WER) para comparar calidad.

## Limitaciones y advertencias

- El repositorio no declara licencia en los metadatos de Hugging Face; la model card atribuye MIT a AI4Bharat, pero conviene verificar los términos del modelo fuente antes de uso comercial.
- El cabezal CTC está recortado a tokens de nepalí: no transcribirá otros idiomas ni code-switching de forma fiable.
- Ventana fija de 10 s: audios más largos requieren segmentación manual, con riesgo de cortes en fronteras de palabras.
- No hay benchmarks ni evaluación de WER publicados para esta conversión; el rendimiento real en dispositivo no está documentado.
- Riesgo de alucinación y errores propios de ASR (ruido, acentos, nombres propios) no cuantificado.
- Dependencia del ecosistema Apple: no es portable a Linux/Windows sin reconversión.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria ni soporte documentado.
- La fecha de creación indicada (2026-11-23) y la versión de NeMo 1.23.0 deben tratarse como datos del autor, no verificados de forma independiente.

## Enlaces

- Hugging Face: https://huggingface.co/aoiandroid/indicconformer-ne-ctc-coreml
- Modelo fuente: https://huggingface.co/ai4bharat/indicconformer_stt_ne_hybrid_ctc_rnnt_large
- AI4Bharat (organización): https://huggingface.co/ai4bharat
- coremltools: https://github.com/apple/coremltools
- NeMo: https://github.com/NVIDIA/NeMo
