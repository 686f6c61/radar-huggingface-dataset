# cchiou-amba/Whisper

## Resumen

Whisper-Tiny Encoder (Ambarella N1-655 CVflow v3 NVP) es una compilación del codificador de audio del modelo Whisper-Tiny de OpenAI, portada para ejecutarse sobre el acelerador neuronal NVP del SoC Ambarella N1-655 con arquitectura CVflow v3. No se trata de un modelo nuevo entrenado desde cero, sino de una conversión del encoder original (que mapea espectrogramas log-Mel de 80 bins y 30 segundos en representaciones acústicas densas de forma `[1, 1500, 384]`) a un binario DAG propietario de Ambarella generado con el SDK Cooper (CNNGen 3.9.0, `cavalry_gen` 3.0.4).

El modelo resuelve un problema muy concreto de despliegue en el borde: permitir que la etapa de codificación de Whisper-Tiny se ejecute de forma eficiente en hardware embebido de Ambarella orientado a cámaras y dispositivos de visión, en lugar de requerir una GPU o CPU de propósito general. Al conservar únicamente el encoder, el artefacto publicado no es un sistema de reconocimiento de voz completo, sino el componente que transforma audio en embeddings que después deben alimentar un decoder (no incluido en este repositorio).

Es relevante ahora para desarrolladores que trabajan con pipelines de ASR en dispositivos empotrados y necesitan integrar modelos de voz en SoCs con NPU propietaria. La licencia MIT del trabajo original de OpenAI se mantiene, y el repositorio incluye la atribución y el aviso de modificación exigidos. El tamaño del repositorio es de 0,0 GB según los metadatos, lo que sugiere que los pesos publicados son únicamente el binario compilado, no los pesos PyTorch originales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (Whisper-Tiny) compilado a DAG Cavalry para CVflow v3 |
| Parametros totales | no disponible (corresponde al encoder de Whisper-Tiny; el dato exacto no se indica en la informacion proporcionada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 30 segundos de audio (ventana fija, 3000 frames de espectrograma) |
| Tipos de cuantizacion | IEEE FP16 en puertos de entrada y salida; no se detallan otras cuantizaciones |
| Idiomas soportados | no disponible (el dataset de entrenamiento original es multilingue, pero no se especifica el conjunto soportado en este artefacto) |
| Licencia | MIT |
| Formato de pesos | binario DAG Cavalry (`n1-655_whisper_tiny_encoder_amba_optimized.bin`); no se publican safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo subyacente es el encoder de Whisper-Tiny de OpenAI, un transformer que procesa espectrogramas log-Mel de 80 bins (N_FFT=400, hop=160, ventana de 30 s a 16 kHz, escala Slaney log10-Mel) y produce una secuencia de 1500 embeddings de dimensión 384. El entrenamiento original se realizó sobre el dataset débilmente supervisado multilingüe de OpenAI, con aproximadamente 680.000 horas de audio, según se indica en la model card. No se ha realizado ningún reentrenamiento en esta versión: la modificación consiste exclusivamente en la compilación del grafo a formato CVflow v3 mediante CNNGen 3.9.0 (`cavalry_gen` 3.0.4), con `vdg_arch = 0xB` para el SoC N1-655.

La innovación técnica del artefacto no está en el modelo sino en el proceso de portado: se ha generado un binario DAG optimizado para el NVP de Ambarella, con puertos de entrada `input_features` `[1, 80, 3000]` y salida `last_hidden_state` `[1, 1500, 384]`, ambos en FP16. No se documentan técnicas adicionales como decodificación especulativa, atención lineal ni variantes de atención eficiente; se trata del encoder estándar de Whisper-Tiny compilado. Tampoco se detalla si hubo RLHF, DPO u otras etapas de alineación, ya que el encoder no participa en la generación autoregresiva.

## Capacidades

- Extracción de representaciones acústicas: convierte espectrogramas log-Mel de 30 segundos en embeddings densos `[1, 1500, 384]` listos para un decoder.
- Procesamiento de audio a 16 kHz con ventana fija de 30 segundos y 80 bins Mel.
- Ejecución sobre el NVP del SoC Ambarella N1-655 (CVflow v3), sin necesidad de GPU.
- Entrada y salida en FP16, adecuada para pipelines embebidos de bajo consumo.
- No incluye decoder: no genera transcripciones por sí mismo, solo la etapa de codificación.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso.
- No se documentan capacidades multilingües específicas en este artefacto, aunque el modelo original de Whisper es multilingüe.
- No se documentan modos especiales como thinking mode, visión o audio adicional más allá del encoder.

## Casos de uso

- Reconocimiento de voz en dispositivos embebidos: integrar el encoder en un pipeline ASR sobre Ambarella N1-655, alimentando un decoder Whisper-Tiny ejecutado en CPU o en otro núcleo del SoC para obtener transcripciones en tiempo real en cámaras o grabadoras.
- Preprocesado de audio en cámaras de vigilancia: extraer embeddings acústicos de ventanas de 30 segundos para detección de eventos sonoros (cristales rotos, gritos, alarmas) sin enviar audio a la nube.
- Puerta de activación por voz (wake-word / VAD avanzado): usar las representaciones del encoder como entrada a un clasificador ligero que decida si activar el resto del pipeline, reduciendo consumo en dispositivos alimentados por batería.
- Indexación y búsqueda de audio: generar embeddings de fragmentos de 30 segundos para construir un índice vectorial y permitir búsqueda por similitud en archivos de audio o grabaciones de reuniones.
- Transcripción en el borde con privacidad: procesar audio localmente en el SoC sin transmitir datos a servidores externos, cumpliendo requisitos de privacidad en entornos sanitarios o industriales.
- Integración en pipelines de visión-audio: combinar el encoder de audio con modelos de visión que ya corren en el NVP de Ambarella para aplicaciones multimodales en el borde, como análisis de escenas con sonido.
- Prototipado de ASR embebido: usar el binario como referencia para validar el flujo de compilación CNNGen y comparar latencia frente a ejecuciones en CPU antes de portar modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- SoC objetivo: Ambarella N1-655 con CVflow v3 (`vdg_arch = 0xB`), acelerador NVP.
- No se especifica VRAM ni memoria requerida; el modelo está pensado para ejecutarse en el NVP del SoC, no en GPU de propósito general.
- No cabe en GPU consumer de forma nativa: el artefacto es un binario DAG específico de Ambarella, no un checkpoint PyTorch estándar.
- Opciones de despliegue: SDK Cooper de Ambarella (CNNGen 3.9.0 / `cavalry_gen` 3.0.4) para cargar el binario en el NVP; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.
- Entrada FP16 `[1, 80, 3000]` y salida FP16 `[1, 1500, 384]`; el consumo energético y la frecuencia de operación dependen del SoC y no se detallan.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Whisper-Tiny Encoder (Ambarella N1-655) | no disponible (encoder de Whisper-Tiny) | 30 s de audio | Binario DAG Cavalry | MIT | HuggingFace (cchiou-amba/Whisper) |
| OpenAI Whisper-Tiny (`openai/whisper-tiny`) | ~39 M (modelo completo, dato no confirmado en la informacion proporcionada) | 30 s de audio | PyTorch / safetensors | MIT | HuggingFace |
| `onnx-community/whisper-tiny` | no disponible | 30 s de audio | ONNX | MIT | HuggingFace |

La comparación directa con alternativas de la misma categoría (encoders de audio para ASR) no está disponible en la información proporcionada; los datos de parámetros del modelo original no se confirman en la model card de este artefacto.

## Limitaciones y advertencias

- El artefacto contiene únicamente el encoder; no puede transcribir audio por sí solo sin un decoder compatible.
- El binario está compilado para un SoC concreto (Ambarella N1-655, CVflow v3); no es portable a otras plataformas sin recompilación con el SDK Cooper.
- No se publican pesos en safetensors, GGUF ni ONNX en este repositorio, lo que limita su uso fuera del hardware objetivo.
- No se documentan sesgos específicos del artefacto; el modelo original de Whisper presenta sesgos conocidos hacia ciertos acentos, idiomas y dominios, pero no se detallan aquí.
- Riesgo de alucinación: inherente al decoder de Whisper, no al encoder; al no incluirse decoder, este riesgo no aplica directamente, pero el sistema completo que lo use heredará las limitaciones de Whisper.
- La ventana de audio es fija de 30 segundos; audios más largos requieren segmentación y audios más cortos requieren padding.
- Licencia MIT permite uso comercial, pero se debe conservar la atribución a OpenAI y el aviso de modificación de Ambarella.
- No se especifican idiomas soportados en este artefacto; el soporte multilingüe depende del decoder que se acople.
- El repositorio tiene 0,0 GB y 33 descargas, lo que sugiere poca validación comunitaria; conviene verificar el binario antes de usarlo en producción.

## Enlaces

- HuggingFace: https://huggingface.co/cchiou-amba/Whisper
- Binario del modelo: https://huggingface.co/cchiou-amba/Whisper/blob/main/n1-655_whisper_tiny_encoder_amba_optimized.bin
- Paper original: https://arxiv.org/abs/2212.04356
- Repositorio de referencia de OpenAI: https://github.com/openai/whisper
- Pesos originales: https://huggingface.co/onnx-community/whisper-tiny
