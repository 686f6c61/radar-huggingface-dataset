# skpranav22/tamil-whisper-small-merged

## Resumen

Tamil-whisper-small-merged es un ajuste fino mediante LoRA del modelo `openai/whisper-small` orientado al reconocimiento automatico del habla (ASR) en tamil (`ta`). Lo desarrolla el usuario independiente skpranav22 y se publica bajo licencia Apache 2.0. El modelo parte de la arquitectura Whisper Small de OpenAI (244 millones de parametros, 12 capas de encoder y 12 de decoder) y aplica Low-Rank Adaptation con rango 32 y alpha 64 sobre las proyecciones `q_proj` y `v_proj`, lo que supone aproximadamente un 1,8 % de parametros entrenables.

El problema que aborda es la baja calidad del tamil en el modelo base: Whisper Small en zero-shot obtiene un WER del 73,85 % sobre el split de test de Google FLEURS en tamil, con una tasa de repeticion del 3,05 %. Tras el ajuste fino, el autor reporta un WER del 46,34 % y un CER del 13,84 %, con una reduccion relativa del WER del 37,25 % y una practicamente eliminacion de las repeticiones (0,51 %). Es relevante para quien necesite transcripcion de audio en tamil con recursos modestos, ya que el checkpoint fusionado pesa 1,0 GB y puede ejecutarse en hardware de consumo.

El repositorio incluye tanto los pesos del adaptador LoRA como los checkpoints fusionados, y se distribuye en formato safetensors con la libreria PEFT. La model card detalla la evaluacion sobre las 591 muestras (2,13 horas) del split de test de FLEURS y aporta intervalos de confianza bootstrap del 95 % para las metricas principales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper Small) con adaptadores LoRA |
| Parametros totales | 241.734.912 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | ventanas de audio de 30 segundos (limite nativo de Whisper) |
| Tipos de cuantizacion | no disponible (el autor no documenta cuantizaciones; al ser compatible con Whisper, cabria conversion a GGUF/ONNX, pero no se especifica) |
| Idiomas soportados | tamil (`ta`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT y checkpoints fusionados) |

## Arquitectura y entrenamiento

La base es Whisper Small, un transformer encoder-decoder con 12 capas en cada bloque y 244 millones de parametros, que procesa espectrogramas log-mel de 80 canales en ventanas de 30 segundos. Sobre esta arquitectura se aplico un ajuste fino con LoRA (r=32, alpha=64) unicamente en las proyecciones de query y value de la atencion, lo que reduce el coste de entrenamiento y el numero de parametros actualizados a cerca del 1,8 % del total. El autor menciona 2000 pasos de entrenamiento para el adaptador `best_adapter`, evaluado sobre el split de validacion de FLEURS.

Los datos de entrenamiento citados en la model card son Google FLEURS (configuracion `ta_in`) y Mozilla Common Voice 17.0, aunque no se detalla la composicion exacta ni el numero de horas empleadas. Un elemento tecnico destacable es el normalizador de texto tamil personalizado, que preserva los signos de vocal dependientes, el virama pulli (`்`) y los terminos en latin por cambio de codigo, lo que evita perdidas de informacion en la tokenizacion del tamil. No se documenta el uso de RLHF ni de DPO; el ajuste es supervisado sobre transcripciones.

## Capacidades

- Reconocimiento automatico del habla en tamil a partir de audio de hasta 30 segundos por ventana.
- Transcripcion con preservacion de la morfologia tamil gracias al normalizador de grafemas personalizado.
- Manejo de terminos en latin por cambio de codigo (code-switching) dentro de enunciados en tamil.
- Reduccion drastica de bucles de repeticion respecto al modelo base (0,51 % frente a 3,05 %).
- Configuracion de decoder forzada para tamil mediante `forced_decoder_ids` con la tarea `transcribe`.
- Compatibilidad con el ecosistema Hugging Face Transformers y PEFT para cargar el adaptador o el checkpoint fusionado.
- No se documentan capacidades de traduccion, tool calling, agentes ni vision; el modelo es exclusivamente ASR.

## Casos de uso

- Transcripcion de reuniones y entrevistas en tamil: el modelo procesa ventanas de 30 segundos y permite dividir audios largos en segmentos, con un CER del 13,84 % sobre FLEURS que lo hace util para actas y resumenes posteriores.
- Subtitulado automático de contenido audiovisual en tamil: la baja tasa de repeticion (0,51 %) evita los bucles tipicos del modelo base, lo que simplifica la generacion de subtitulos limpios.
- Atencion al cliente en tamil: transcripcion de llamadas grabadas para su analisis posterior o para alimentar sistemas de minutas, con un checkpoint de 1,0 GB desplegable en infraestructura modesta.
- Investigacion linguistica y corpus orales: generacion de transcripciones para anotacion de corpus en tamil, aprovechando la preservacion de signos diacriticos del normalizador.
- Accesibilidad: conversion de audio a texto para personas con discapacidad auditiva en comunidades tamil, con despliegue local en GPU de consumo.
- Pipeline de datos para entrenamiento de modelos: transcripcion masiva de audio en tamil para construir datasets de texto o para evaluar otros sistemas ASR.
- Prototipado rapido en entornos con recursos limitados: al ser un modelo de 244 millones de parametros, puede ejecutarse en una unica GPU consumer para pruebas y demos.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre Google FLEURS tamil (`ta_in`):

| Modelo | Checkpoint | Split | WER (%) | CER (%) | Tasa de repeticion (%) |
|---|---|---|---|---|---|
| Whisper-small zero-shot | `openai/whisper-small` | test (591 muestras) | 73,85 | 25,90 | 3,05 |
| Whisper-small + LoRA (r=32) | `best_adapter` (2000 pasos) | validation (374 muestras) | 47,22 | 13,73 | 0,00 |
| Whisper-small + LoRA (r=32) | `whisper-small-tamil-merged` | test (591 muestras) | 46,34 | 13,84 | 0,51 |

Mejoras relativas reportadas en el split de test: reduccion del WER del 37,25 %, del CER del 46,56 % y de la tasa de repeticion del 83,28 %. Intervalos de confianza bootstrap del 95 %: WER base 75,70 % [72,41 %, 79,84 %] y CER 26,34 % [24,10 %, 29,14 %]; WER ajustado 47,64 % [45,56 %, 50,00 %] y CER 14,26 % [12,76 %, 16,11 %]. Los resultados no estan verificados por un tercero (`verified: false`).

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 1 GB para los pesos (241,7 millones de parametros) mas overhead de activaciones y espectrogramas; en la practica, entre 1,5 y 2,5 GB.
- En fp16: alrededor de 0,5 GB de pesos, con un consumo total tipico inferior a 2 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM, como RTX 3050, RTX 3060, RTX 4060, T4 o superiores; tambien A100/H100 para despliegues de alto throughput.
- Cabe en GPU de consumo: si, practicamente en cualquier GPU consumer moderna con 4 GB o mas.
- Opciones de despliegue: Transformers con PEFT (adaptador) o checkpoint fusionado, vLLM no aplica de forma nativa a Whisper, whisper.cpp o faster-whisper previa conversion, y ONNX Runtime.
- Latencia y throughput: no disponibles en la informacion proporcionada; al ser un modelo small, se espera inferencia en tiempo real o superior en GPU consumer, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | WER FLEURS tamil | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tamil-whisper-small-merged | 241,7 M | 30 s | 46,34 % (test) | Apache 2.0 | Hugging Face |
| openai/whisper-small (zero-shot) | 244 M | 30 s | 73,85 % (test) | MIT | Hugging Face |
| openai/whisper-medium | 769 M | 30 s | no disponible en la informacion | MIT | Hugging Face |
| openai/whisper-large-v3 | 1,55 B | 30 s | no disponible en la informacion | MIT | Hugging Face |

La comparativa se limita al modelo base y a las variantes de mayor tamano de Whisper, ya que no se dispone de resultados de otros ajustes finos para tamil en la informacion proporcionada. El modelo supera claramente a su base en WER y CER, pero no hay datos que permitan compararlo con Whisper Medium o Large en tamil.

## Limitaciones y advertencias

- La morfologia aglutinante del tamil infla las metricas a nivel de palabra (WER) frente a las de caracter (CER); el WER del 46,34 % sigue siendo alto en terminos absolutos.
- El rendimiento puede degradarse con dialectos regionales no estandar o en entornos con ruido de fondo elevado, segun advierte el autor.
- El modelo solo soporta tamil; no se documenta soporte multilingue ni traduccion.
- Ventana de audio limitada a 30 segundos por inferencia, lo que exige segmentacion para audios largos.
- Riesgo de alucinacion y de transcripciones incorrectas en segmentos con silencio o ruido; la tasa de repeticion, aunque baja, no es cero (0,51 %).
- Resultados de benchmarks no verificados por terceros (`verified: false`), con intervalos de confianza amplios que reflejan la variabilidad de la evaluacion.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Whisper tiene licencia MIT, por lo que conviene revisar las condiciones combinadas en produccion.
- No se documentan sesgos especificos ni evaluaciones de robustez mas alla de FLEURS.

## Enlaces

- Hugging Face: https://huggingface.co/skpranav22/tamil-whisper-small-merged
- Modelo base: https://huggingface.co/openai/whisper-small
- Dataset FLEURS: https://huggingface.co/datasets/google/fleurs
- Dataset Common Voice 17.0: https://huggingface.co/datasets/mozilla-foundation/common_voice_17_0
- Libreria PEFT: https://github.com/huggingface/peft
- Paper de Whisper: https://arxiv.org/abs/2212.04356
