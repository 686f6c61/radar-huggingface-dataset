# diarizeapp/ishiki-asr-1.0-ventral-onnx-qnn

## Resumen

Ishiki-ASR-1.0-ventral-onnx-qnn es una compilación precompilada en formato ONNX con contexto de ejecución QNN (`EPContext`) del modelo de reconocimiento automático del habla `ventral_stream`, extraído de `ishiki-labs/ishiki-asr-1.0`. Lo publica el usuario `diarizeapp` y está específicamente orientado a ejecutarse en la NPU Hexagon del Snapdragon X Elite (SoC SM8380) mediante el Qualcomm AI Runtime (QAIRT) en su versión `2.52.0.261104115025`. No es un modelo entrenado desde cero, sino un artefacto de despliegue derivado del modelo base de Ishiki Labs.

El modelo base pertenece a la familia `qwen3_asr`, es decir, una arquitectura derivada de Qwen3 adaptada a la tarea de transcripción de voz, con un frontend mel (`frontend.mel_fb_qwen`) que se mantiene con paridad 1:1 respecto al original. La compilación emplea un decodificador cuantizado en `w8a16m` (pesos de 8 bits, activaciones de 16 bits) y un `lm_head` no atado (`untied`), lo que reduce el peso del artefacto final a 5,4 GB.

Su relevancia radica en que permite ejecutar ASR de forma local y acelerada por NPU en portátiles con Snapdragon X Elite, sin depender de GPU dedicada ni de servicios en la nube. Las mediciones publicadas sobre seis clips indican un CER macro de 0,0049 (peor clip 0,0294), un RTF medio de 0,451 y 11,8 tokens/s, comparado con los grafos FP32 en CPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo Qwen3 adaptado a ASR (`qwen3_asr`), decodificador con `lm_head` no atado |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Decodificador w8a16m (pesos 8 bits, activaciones 16 bits) en grafos QNN precompilados |
| Idiomas soportados | en (inglés) |
| Licencia | cc-by-4.0 |
| Formato de pesos | ONNX con `EPContext` para QNN (Qualcomm AI Runtime 2.52.0.261104115025) |

## Arquitectura y entrenamiento

El artefacto es una compilación `EPContext` de un subgrafo denominado `ventral_stream` extraído del modelo base `ishiki-labs/ishiki-asr-1.0`. El modelo base sigue la arquitectura `qwen3_asr`, un transformer decoder-only de la familia Qwen3 adaptado a reconocimiento de voz, con un frontend mel (`frontend.mel_fb_qwen`) que procesa la señal de audio y alimenta al decodificador. En esta compilación el `lm_head` se mantiene separado (no atado a los embeddings de entrada) y el decodificador se cuantiza a w8a16m.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO en el modelo base. La innovación técnica destacable de esta publicación no está en el entrenamiento sino en el despliegue: los grafos se precompilan para la NPU Hexagon del Snapdragon X Elite mediante QAIRT, de modo que la inferencia se ejecuta en hardware especializado de bajo consumo en lugar de CPU o GPU.

## Capacidades

- Reconocimiento automático del habla (transcripción de audio a texto) en inglés.
- Ejecución acelerada por NPU Hexagon en Snapdragon X Elite (SM8380) mediante QNN.
- Inferencia local sin conexión a servicios en la nube.
- Frontend mel compatible 1:1 con el modelo base (`frontend.mel_fb_qwen`), lo que preserva el preprocesado original.
- No se documentan capacidades de tool calling, agentes, visión, audio distinto de ASR ni modos de razonamiento extendido.
- Capacidad multilingüe limitada al inglés según la model card.

## Casos de uso

- Transcripción local en portátiles Snapdragon X Elite: el artefacto se ejecuta sobre la NPU del SoC, permitiendo dictado y transcripción sin enviar audio a la nube y con un RTF medio de 0,451 (más rápido que tiempo real).
- Subtitulado de reuniones y videollamadas en inglés: al procesar audio en local con baja latencia, es adecuado para generar subtítulos en directo en entornos corporativos con requisitos de privacidad.
- Aplicaciones de accesibilidad: dictado por voz integrado en herramientas de escritorio para usuarios con movilidad reducida, aprovechando la NPU para no consumir batería de forma intensiva.
- Procesamiento por lotes de archivos de audio en inglés: dado el RTF de 0,451, un portátil puede transcribir aproximadamente dos horas de audio en menos de una hora de cómputo en NPU.
- Integración en pipelines de diarización: el publicador (`diarizeapp`) sugiere uso combinado con separación de hablantes; la transcripción por segmentos permite etiquetar intervenciones en grabaciones de reuniones.
- Prototipado de asistentes de voz en inglés para dispositivos Windows on ARM: sirve como componente ASR en aplicaciones UWP o de escritorio que necesiten transcripción de comandos sin dependencia de red.
- Investigación en eficiencia de inferencia: útil para comparar latencia y precisión de grafos QNN w8a16m frente a FP32 en CPU sobre el mismo modelo base.

## Benchmarks y rendimiento

Datos publicados en la model card, medidos sobre 6 clips frente a grafos FP32 en CPU:

| Metrica | Valor |
|---|---|
| CER macro | 0,0049 |
| CER peor clip | 0,0294 |
| RTF medio | 0,451 |
| Throughput | 11,8 tokens/s |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, LibriSpeech WER, etc.) en la información disponible.

## Requisitos de hardware

- NPU Hexagon del Snapdragon X Elite (SM8380) con Qualcomm AI Runtime (QAIRT) `2.52.0.261104115025`; los grafos `EPContext` están ligados a esa versión y a ese SoC.
- No se especifica VRAM ni memoria unificada requerida; el repositorio ocupa 5,4 GB, por lo que se necesita al menos ese espacio en disco y memoria compartida suficiente para cargar los grafos.
- No está pensado para GPU dedicada (A100, H100, RTX 4090) ni para CPU genérica: al ser un `EPContext` QNN, la ejecución fuera del hardware objetivo no es viable sin recompilar.
- Despliegue mediante el runtime QNN de Qualcomm (ONNX Runtime con el execution provider QNN o QAIRT directamente); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Rendimiento medido: RTF medio 0,451 y 11,8 tokens/s en el hardware objetivo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato / despliegue |
|---|---|---|---|---|---|
| diarizeapp/ishiki-asr-1.0-ventral-onnx-qnn | no disponible | no disponible | en | cc-by-4.0 | ONNX QNN (Snapdragon X Elite) |
| ishiki-labs/ishiki-asr-1.0 (base) | no disponible | no disponible | en | no disponible en la informacion | no disponible en la informacion |
| Whisper large-v3 (referencia de categoria) | no disponible en la informacion | no disponible en la informacion | multilingue | no disponible en la informacion | no disponible en la informacion |

No se dispone de datos suficientes en la información proporcionada para establecer una comparativa cuantitativa fiable con alternativas de la misma categoría.

## Limitaciones y advertencias

- Solo soporta inglés; no se documentan otros idiomas.
- El artefacto está ligado al Snapdragon X Elite (SM8380) y a QAIRT `2.52.0.261104115025`; cualquier cambio de versión del runtime o de SoC requiere recompilación.
- Al ser una cuantización w8a16m, puede existir una degradación de precisión frente al modelo base en dominios acústicos difíciles; los resultados publicados (CER macro 0,0049) proceden de solo 6 clips, una muestra muy reducida.
- No se documentan sesgos conocidos ni tasas de alucinación del modelo base.
- La licencia cc-by-4.0 permite uso comercial con atribución, pero deben revisarse las `THIRD_PARTY_NOTICES.md` del repositorio por posibles restricciones heredadas del modelo base o de dependencias.
- No se especifican requisitos de memoria, longitud máxima de audio ni comportamiento con audio de larga duración.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/diarizeapp/ishiki-asr-1.0-ventral-onnx-qnn
- Modelo base: https://huggingface.co/ishiki-labs/ishiki-asr-1.0
