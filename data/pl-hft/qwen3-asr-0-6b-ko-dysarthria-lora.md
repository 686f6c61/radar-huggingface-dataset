# PL-HFT/qwen3-asr-0.6b-ko-dysarthria-lora

## Resumen

`PL-HFT/qwen3-asr-0.6b-ko-dysarthria-lora` es un adaptador LoRA de PEFT para reconocimiento automatico del habla (ASR) en coreano, especializado en habla disartrica y entrenado conjuntamente con habla tipica. Lo desarrolla el usuario PL-HFT partiendo del modelo base `Qwen/Qwen3-ASR-0.6B-hf`, que combina un LLM Qwen3 de 0,6 mil millones de parametros con un codificador de audio AuT. El adaptador anade 46,5 millones de parametros entrenables (5,62 % del total) sobre los 829 millones del modelo base.

El problema que aborda es el deterioro cruzado tipico en el ajuste fino sobre dominios patologicos: al especializar un ASR unicamente en habla disartrica, el error sobre habla tipica se dispara. Segun la model card, el ajuste fino completo hacia caer el CER en habla tipica del 4,63 % al 15,01 %, y un LoRA solo sobre disartria lo llevaba al 8,02 %. Este adaptador, entrenado una sola epoca sobre un corpus combinado, reduce simultaneamente el CER en disartria (4,26 % a 0,79 %) y en habla tipica (4,63 % a 1,97 %).

Es relevante para equipos que construyen transcripcion de voz en coreano con requisitos de accesibilidad, ya que permite cubrir habla patologica sin sacrificar el rendimiento general, con un modelo pequeno (menos de mil millones de parametros) desplegable en hardware modesto y con licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LLM Qwen3-0.6B + codificador de audio AuT (Qwen3ASRForConditionalGeneration), adaptador PEFT LoRA |
| Parametros totales | 828.989.440 (modelo base); adaptador LoRA de 46.563.328 parametros entrenables (5,6169 %) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (contrato de audio: segmentos de hasta 29,5 s a 16 kHz mono) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT, libreria `peft`) |
| Rango LoRA | r=64, lora_alpha=128, lora_dropout=0,05, bias="none" |
| Modulos objetivo | q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj, down_proj (250 modulos) |
| Requisitos de libreria | transformers >= 5.13.0 (config guardada con 5.20.2), peft >= 0.14.0 |
| Tamano del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `Qwen3-ASR-0.6B-hf`, un modelo de reconocimiento de voz que empareja un transformer decoder Qwen3 de 0,6B con un codificador de audio AuT. El entrenamiento se realiza en formato SFT con plantilla de chat, donde la salida del asistente sigue el patron `language Korean<asr_text>{transcript}`, y el audio se procesa a 16 kHz mono en segmentos de hasta 29,5 segundos.

El ajuste fino es un LoRA de una sola epoca sobre el corpus `combine`, que fusiona dos conjuntos de datos de voz coreana verificados en calidad y preprocesados con el pipeline `Speech-dataset-pipeline`: AI-Hub 013 (habla disartrica) y AI-Hub 109 (habla tipica). La innovacion principal es metodologica: el entrenamiento conjunto sobre ambos dominios evita el olvido catastrofico del habla tipica que se observa al especializar solo en disartria, manteniendo o mejorando el rendimiento en ambos tipos de habla con un unico adaptador de bajo rango.

## Capacidades

- Transcripcion de voz a texto en coreano, tanto de habla tipica como de habla disartrica.
- Reconocimiento optimizado para habla patologica (disartria), con CER declarado del 0,79 % en el conjunto de test AI-Hub 013.
- Mantenimiento del rendimiento en habla tipica tras el ajuste fino conjunto (CER del 1,97 % en AI-Hub 109).
- Procesamiento de audio a 16 kHz mono en segmentos de hasta 29,5 segundos.
- Salida con prefijo de idioma (`language Korean<asr_text>...`) que debe eliminarse en postprocesado.
- Soporte de fusion de pesos LoRA (`merge_and_unload`) para inferencia mas rapida.
- Soporte de tool calling, agentes, vision, audio adicional o razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; el modelo esta entrenado y evaluado solo en coreano.

## Casos de uso

- Transcripcion de consultas clinicas con pacientes con disartria: el adaptador reduce el CER al 0,79 % en el conjunto de evaluacion de habla patologica, lo que lo hace adecuado para documentacion medica asistida donde la precision en habla alterada es critica.
- Subtitulado y actas de sesiones de logopedia: permite transcribir grabaciones de terapia con habla disartrica sin degradar la transcripcion de las intervenciones del terapeuta, que son habla tipica, gracias al entrenamiento conjunto.
- Atencion al cliente por voz en coreano: el modelo mantiene un CER del 1,97 % en habla tipica, suficiente para alimentar pipelines de transcripcion en centros de contacto con segmentos cortos de audio.
- Sistemas de accesibilidad para personas con trastornos del habla: el adaptador puede integrarse en interfaces de dictado o control por voz que necesitan reconocer habla disartrica en tiempo cuasi real con un modelo de menos de mil millones de parametros.
- Transcripcion de clases y ponencias en coreano: con segmentos de hasta 29,5 s y 16 kHz mono, encaja en pipelines de transcripcion por trozos; el CER del 13,11 % en el conjunto externo de conferencias (AI-Hub 71627) debe tenerse en cuenta para este escenario.
- Despliegue en hardware de borde o en CPU: al ser un adaptador de 0,2 GB sobre un modelo base de 0,6B, puede ejecutarse en entornos con recursos limitados, incluidos dispositivos sin GPU dedicada, usando transformers con PEFT.
- Prototipado e investigacion en ASR para habla patologica: sirve como punto de partida reproducible (LoRA de bajo rango, corpus combinado) para experimentos de adaptacion a otras lenguas o patologias.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Conjunto de evaluacion | Muestras (N) | CER (%) | WER (%) |
|---|---|---|---|
| Combinado disartria + tipico (AI-Hub 013 + 109) | 38.599 | 1,51 | 5,70 |
| Disartria (AI-Hub 013) | 15.495 | 0,79 | 1,98 |
| Tipico (AI-Hub 109) | 23.104 | 1,97 | 8,02 |
| Externo, conferencias en coreano (AI-Hub 71627) | 10.000 | 13,11 | 32,03 |

Comparativa de degradacion cruzada citada en la model card (CER en habla tipica): modelo base 4,63 %; ajuste fino completo solo en disartria 15,01 %; LoRA solo en disartria 8,02 %; este LoRA combinado 1,97 %. En habla disartrica, el CER pasa del 4,26 % en el modelo base al 0,79 % con este adaptador.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con un modelo base de 828,9 millones de parametros en bfloat16 se situa en el orden de 1,7 GB de pesos mas el codificador de audio y las activaciones, por lo que deberia caber holgadamente en GPUs de consumo con 8 GB o mas.
- GPU recomendadas: no disponibles en la informacion proporcionada; el codigo de ejemplo soporta CUDA, MPS (Apple Silicon) y CPU con bfloat16 en CUDA/MPS y float32 en CPU.
- Cabe en GPU de consumo: si, segun el tamano del modelo base; no se especifican modelos concretos.
- Opciones de despliegue: transformers >= 5.13.0 con `Qwen3ASRForConditionalGeneration` y peft >= 0.14.0; se puede fusionar el adaptador con `merge_and_unload` para inferencia mas rapida. Soporte de vLLM, llama.cpp, Ollama o TGI: no disponible.
- Latencia y throughput: no disponibles.
- Contrato de audio: 16 kHz mono, segmentos de hasta 29,5 s.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / audio | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| PL-HFT/qwen3-asr-0.6b-ko-dysarthria-lora (este) | 828,9 M base + 46,6 M LoRA | segmentos <= 29,5 s, 16 kHz | coreano | Apache 2.0 | ASR coreano con disartria |
| Qwen/Qwen3-ASR-0.6B-hf (base) | 828,9 M | segmentos <= 29,5 s, 16 kHz | no disponible en la informacion | no disponible en la informacion | ASR general |
| Alternativas ASR coreanas de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni especificaciones de modelos alternativos en la informacion proporcionada para establecer una comparativa cuantitativa adicional.

## Limitaciones y advertencias

- Entrenado y evaluado solo en coreano; no hay evidencia de rendimiento en otras lenguas.
- El CER se degrada notablemente en dominio externo: 13,11 % en el conjunto de conferencias AI-Hub 71627 frente al 1,97 % en habla tipica del corpus de entrenamiento, lo que indica sensibilidad al cambio de dominio y de condiciones acusticas.
- El WER en habla tipica (8,02 %) es mas alto que el CER (1,97 %), lo que sugiere errores en palabras completas que pueden afectar a metricas orientadas a palabras.
- Los resultados de benchmarks son declarados por el autor y no estan verificados de forma independiente (`verified: false`).
- Requiere transformers >= 5.13.0 con la clase `Qwen3ASRForConditionalGeneration`; versiones anteriores no cargaran el modelo.
- La salida incluye el prefijo `language Korean<asr_text>` que debe eliminarse en postprocesado; un manejo incorrecto produce transcripciones contaminadas.
- Limite de segmento de 29,5 s: audios mas largos requieren troceado previo, con riesgo de cortes en fronteras de palabra.
- Riesgo de alucinacion y sesgos: no disponible en la informacion proporcionada.
- Licencia Apache 2.0: permite uso comercial, pero no se detallan restricciones adicionales sobre los datos de entrenamiento (AI-Hub 013 y 109), cuyas condiciones de uso deben verificarse por separado.
- Sin descargas ni likes en el momento de la consulta (0 y 0), lo que implica ausencia de validacion comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/PL-HFT/qwen3-asr-0.6b-ko-dysarthria-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3-ASR-0.6B-hf
- Model card en coreano: ./README.ko.md (referenciada en el repositorio)
- Papers, blogs, repos y demos adicionales: no disponibles en la informacion proporcionada.
