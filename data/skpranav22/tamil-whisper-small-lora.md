# skpranav22/tamil-whisper-small-lora

## Resumen

`tamil-whisper-small-lora` es un adaptador LoRA publicado por el usuario skpranav22 sobre el modelo base `openai/whisper-small` (244 millones de parametros) para reconocimiento automatico del habla (ASR) en tamil (`ta`). El modelo resuelve el problema del bajo rendimiento del Whisper original en tamil: el modelo base, en evaluacion zero-shot sobre FLEURS, obtiene un WER del 73,85 %, mientras que el adaptador lo reduce al 46,34 % en el split de test.

La adaptacion emplea PEFT con rango 32 y alpha 64 sobre las proyecciones `q_proj` y `v_proj`, lo que supone aproximadamente un 1,8 % de parametros entrenables. Se distribuye como adaptador LoRA (formato PEFT/safetensors) y tambien como checkpoint fusionado. La relevancia actual radica en que demuestra una mejora sustancial con un coste de entrenamiento muy bajo y en que incluye un normalizador de texto tamil que preserva signos vocálicos dependientes y el virama `்`, ademas de terminos en latin por cambio de codigo.

El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el tamano declarado es de 0.0 GB, por lo que se trata de una publicacion reciente y practicamente sin adopcion. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper small) con adaptadores LoRA |
| Parametros totales | 244 M (modelo base Whisper small); adaptador LoRA ~1,8 % de parametros entrenables |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Ventanas de audio de 30 segundos (80 canales log-mel) |
| Tipos de cuantizacion | No disponible (el autor no documenta cuantizaciones; al ser safetensors/PEFT se puede convertir a otros formatos, pero no se especifica) |
| Idiomas soportados | Tamil (`ta`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); existe checkpoint fusionado `whisper-small-tamil-merged` |

## Arquitectura y entrenamiento

El modelo parte de `openai/whisper-small`, un transformer encoder-decoder con 12 capas en el encoder y 12 en el decoder, entrenado originalmente por OpenAI para ASR multilingue. Sobre esta base se aplica Low-Rank Adaptation (LoRA) mediante Hugging Face PEFT, con rango r=32, alpha=64 y modulos objetivo `q_proj` y `v_proj`. El front-end acustico es el estandar de Whisper: espectrograma log-mel de 80 canales sobre ventanas de 30 segundos.

El entrenamiento se realizo durante 2000 pasos y se selecciono el mejor adaptador (`best_adapter`) segun el split de validacion de FLEURS. Los datasets empleados son `google/fleurs` (configuracion `ta_in`) y `mozilla-foundation/common_voice_17_0`. Una innovacion destacable es el normalizador de texto tamil personalizado, que preserva signos vocálicos dependientes, el pulli virama `்` y terminos en latin por cambio de codigo, lo que reduce artefactos de normalizacion en la evaluacion. No se documenta el uso de RLHF ni DPO.

## Capacidades

- Reconocimiento automatico del habla en tamil a partir de audio de hasta 30 segundos por ventana.
- Transcripcion con normalizacion de texto especifica para tamil (signos vocálicos, virama, terminos en latin).
- Manejo de cambio de codigo tamil-ingles en la salida, gracias al normalizador preservador de grafemas.
- Reduccion drastica de bucles de repeticion respecto al modelo base (tasa de repeticion del 0,51 % frente al 3,05 %).
- Configuracion de decoder forzada para tamil (`language="tamil"`, `task="transcribe"`) mediante `processor.get_decoder_prompt_ids`.
- No se documentan capacidades de traduccion, diarizacion, tool calling ni agentes; es un modelo exclusivamente ASR.

## Casos de uso

- Transcripcion de reuniones y entrevistas en tamil: el modelo procesa ventanas de 30 segundos y puede encadenarse para audio largo, con un WER de referencia del 46,34 % en FLEURS que lo hace util para actas y resumenes asistidos por humano.
- Subtitulado automatico de contenido audiovisual en tamil: la baja tasa de repeticion (0,51 %) reduce artefactos tipicos de Whisper en idiomas de bajos recursos, lo que simplifica la revision posterior.
- Atencion al cliente en tamil: integrado en un pipeline ASR + LLM, permite transcribir llamadas o mensajes de voz para su clasificacion y enrutamiento.
- Investigacion linguistica y creacion de corpus: el normalizador preservador de grafemas facilita la anotacion y el analisis morfologico de tamil aglutinante.
- Accesibilidad: generacion de transcripciones para personas con discapacidad auditiva en contenido hablado en tamil.
- Preprocesado para pipelines de datos: transcripcion masiva de audio tamil para alimentar modelos de lenguaje o sistemas de recuperacion de informacion.
- Prototipado con recursos limitados: al ser un adaptador LoRA sobre un modelo de 244 M, se puede cargar y ajustar en GPUs de consumo, lo que lo hace adecuado para experimentacion academica.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados de forma independiente, `verified: false`):

| Modelo | Checkpoint | Split | WER (%) | CER (%) | Tasa de repeticion (%) |
|---|---|---|---|---|---|
| Whisper-small zero-shot | `openai/whisper-small` | FLEURS test (`ta_in`, 591 muestras) | 73,85 | 25,90 | 3,05 |
| Whisper-small + LoRA (r=32) | `best_adapter` (2000 pasos) | FLEURS validation (`ta_in`, 374 muestras) | 47,22 | 13,73 | 0,00 |
| Whisper-small + LoRA (r=32) | `whisper-small-tamil-merged` | FLEURS test (`ta_in`, 591 muestras) | 46,34 | 13,84 | 0,51 |

Mejoras relativas declaradas en el split de test: reduccion de WER del 37,25 %, reduccion de CER del 46,56 % y reduccion de la tasa de repeticion del 83,28 %. Intervalos de confianza bootstrap al 95 %: WER base 75,70 % [72,41 %, 79,84 %] y CER 26,34 % [24,10 %, 29,14 %]; WER fine-tuned 47,64 % [45,56 %, 50,00 %] y CER 14,26 % [12,76 %, 16,11 %].

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 1 GB para el modelo base de 244 M mas el adaptador; en fp16, alrededor de 0,5 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; RTX 3060, RTX 4090, A100 o H100 son mas que suficientes.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna (incluso integradas con suficiente memoria compartida para inferencia por CPU).
- Opciones de despliegue: `transformers` + `peft` (flujo documentado), y conversion a llama.cpp/Ollama o TGI no documentada por el autor pero tecnicamente posible a partir del checkpoint fusionado.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WER FLEURS ta | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `skpranav22/tamil-whisper-small-lora` | 244 M (+ LoRA) | 30 s por ventana | 46,34 % | Apache 2.0 | Hugging Face (0 descargas) |
| `openai/whisper-small` (zero-shot) | 244 M | 30 s por ventana | 73,85 % | Apache 2.0 | Hugging Face |
| `openai/whisper-medium` | 769 M | 30 s por ventana | No disponible en la informacion | Apache 2.0 | Hugging Face |
| `openai/whisper-large-v3` | 1550 M | 30 s por ventana | No disponible en la informacion | Apache 2.0 | Hugging Face |

La comparativa se limita al modelo base y a variantes de mayor tamano de la familia Whisper, ya que no se dispone de datos de benchmarks de otros adaptadores tamil en la informacion proporcionada.

## Limitaciones y advertencias

- La morfologia aglutinante del tamil produce metricas de error a nivel de palabra (WER) mas altas que a nivel de caracter (CER); el WER del 46,34 % debe interpretarse con cautela.
- Rendimiento degradado en dialectos regionales no estandar y en entornos con alto ruido de fondo, con mayor tasa de sustituciones.
- Entrenado exclusivamente para tamil; no soporta otros idiomas ni traduccion.
- Evaluacion limitada a FLEURS (591 muestras, 2,13 horas); no hay validacion en Common Voice ni en dominios reales.
- Los resultados de benchmarks no estan verificados de forma independiente (`verified: false`).
- Repositorio con 0 descargas y 0 likes: sin evidencia de uso en produccion ni de mantenimiento continuado.
- Riesgo de alucinacion y de bucles de repeticion residual (0,51 % en test), inferior al base pero no nulo.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte.

## Enlaces

- Hugging Face: https://huggingface.co/skpranav22/tamil-whisper-small-lora
- Modelo base: https://huggingface.co/openai/whisper-small
- Dataset FLEURS: https://huggingface.co/datasets/google/fleurs
- Dataset Common Voice 17.0: https://huggingface.co/datasets/mozilla-foundation/common_voice_17_0
- Libreria PEFT: https://huggingface.co/docs/peft
- Paper de Whisper: https://arxiv.org/abs/2212.04356
- Paper de LoRA: https://arxiv.org/abs/2106.09685
