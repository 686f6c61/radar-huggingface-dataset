# dehanns/whisper-small-sinhala-lora-r32-seed-123

## Resumen

`dehanns/whisper-small-sinhala-lora-r32-seed-123` es un adaptador LoRA de rango 32 entrenado sobre el modelo `openai/whisper-small` para reconocimiento automatico del habla (ASR) en cingales (sinhala, codigo `si`). Lo publica el usuario de Hugging Face `dehanns` como parte de una serie de experimentos sobre Whisper en idiomas de bajos recursos. El repositorio contiene unicamente los pesos del adaptador PEFT: los pesos congelados de Whisper no se distribuyen, por lo que es imprescindible descargar la base por separado y fusionarla o cargarla con `peft`.

El modelo resuelve la transcripcion de audio en cingales, un idioma con muy pocos recursos de ASR comparado con ingles o espanol. La innovacion es minima por diseno: se congela todo el transformer de Whisper y solo se anaden matrices de bajo rango en las proyecciones `q_proj` y `v_proj` de la autoatencion del codificador, la autoatencion del decodificador y la atencion cruzada del decodificador. Es un experimento reproducible (semilla `123`) mas que un modelo listo para produccion.

Los datos declarados por el autor son 32.062 filas de entrenamiento, 4.171 de validacion y 4.326 de test retenido, con un WER de 0,5823 y un CER de 0,1566 en test. El repositorio no tiene descargas ni likes, no declara licencia y no incluye informacion sobre el dataset utilizado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder tipo Whisper con adaptadores LoRA (PEFT) sobre `openai/whisper-small` |
| Parametros totales | 244 M en el modelo base (`whisper-small`); el numero exacto de parametros entrenables del adaptador no esta disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 30 s de audio por ventana y hasta 448 tokens en el decodificador (especificaciones del modelo base) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; la base admite fp16, int8 e int4 si se cuantiza por separado) |
| Idiomas soportados | Cingales (`si`) |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT; los pesos base no se incluyen) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `openai/whisper-small`, un transformer encoder-decoder con entrada de espectrograma log-Mel de 80 canales a 16 kHz y salida autoregresiva de tokens. El entrenamiento es LoRA puro: los pesos base permanecen congelados y solo se optimizan matrices de bajo rango de rango 32 insertadas en `q_proj` y `v_proj` de tres bloques de atencion (autoatencion del codificador, autoatencion del decodificador y atencion cruzada del decodificador). No se menciona ningun ajuste posterior con RLHF, DPO ni decodificacion especulativa.

El autor reporta 32.062 filas de entrenamiento, 4.171 de validacion y 4.326 de test retenido, con semilla `123`. No se especifica la composicion del dataset (horas de audio, dominio, procedencia, si hay aumento de datos o normalizacion de texto), ni la tasa de aprendizaje, el numero de epochs, el optimizador o el hardware empleado. Tampoco se documenta si el texto de referencia se normalizo antes de calcular el WER y el CER, un detalle critico en cingales por los problemas de segmentacion de palabras.

## Capacidades

- Transcripcion de voz a texto en cingales (`si`) sobre audio de hasta 30 segundos por ventana.
- Procesamiento de audio largo mediante segmentacion en ventanas de 30 s, con la logica de `transformers` o `faster-whisper`.
- Herencia de la arquitectura multitarea de Whisper, que en el modelo base incluye deteccion de idioma y traduccion a ingles; no se documenta si el adaptador conserva o degrada estas capacidades.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- No hay capacidades de vision, audio generativo ni modo de razonamiento explicito.
- No hay capacidades multilingues adicionales: el adaptador esta entrenado exclusivamente para cingales.

## Casos de uso

- Transcripcion de grabaciones de atencion al cliente en cingales: el modelo convierte llamadas o notas de voz en texto para su analisis posterior, indexacion o busqueda, con la ventaja de que el adaptador es ligero y puede desplegarse en una GPU modesta.
- Subtitulado de contenido audiovisual en cingales: integrado en un pipeline que segmenta el audio en ventanas de 30 s, permite generar subtitulos automaticos para videos, aunque el WER reportado exige revision humana.
- Generacion de corpus textual en cingales: transcripcion masiva de archivos de audio para construir datasets de texto con los que entrenar modelos de lenguaje o sistemas TTS en un idioma con pocos recursos.
- Investigacion en ASR de bajos recursos: el adaptador sirve como linea base reproducible (semilla fija, rango 32 declarado) para comparar estrategias de adaptacion eficiente en cingales.
- Prototipado rapido en entornos academicos: al ocupar pocos cientos de megabytes junto con la base, se puede cargar en una GPU de portatil o incluso en CPU para experimentos de laboratorio sin presupuesto de computo.
- Accesibilidad para hablantes de cingales: transcripcion de notas de voz personales o de reuniones a texto, con la salvedad de que la calidad actual obliga a revisar el resultado antes de usarlo en contextos sensibles.

## Benchmarks y rendimiento

| Metrica | Valor | Conjunto de evaluacion |
|---|---|---|
| WER (ratio) | 0,5823419526103628 (58,23 %) | Test retenido, 4.326 filas |
| CER (ratio) | 0,15657847988284126 (15,66 %) | Test retenido, 4.326 filas |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de lenguaje en la informacion disponible, ni son aplicables a un modelo exclusivamente de reconocimiento de voz. Tampoco hay comparaciones con lineas base publicadas en la model card.

## Requisitos de hardware

- Tamano del adaptador: el repositorio se reporta como 0,0 GB; el numero exacto de parametros entrenables no esta disponible, pero un LoRA de rango 32 sobre `whisper-small` suele ocupar del orden de decenas de megabytes.
- Pesos base en fp16: aproximadamente 0,5 GB en disco y en torno a 1-2 GB de VRAM durante la inferencia con `transformers`.
- Pesos base en fp32: aproximadamente 1 GB en disco y algo mas de VRAM.
- Cuantizacion int8: en torno a 0,25-0,5 GB de pesos, viable en GPU de gama baja o en CPU.
- Cabe en GPU de consumo: si, practicamente cualquier GPU con 4 GB o mas de VRAM (GTX 1650, RTX 3050/3060, RTX 4090) e incluso en CPU para lotes pequenos.
- GPU recomendadas para servicio en produccion: T4, L4, A10G, L40S o A100 si se necesita procesar muchos flujos de audio en paralelo.
- Opciones de despliegue: `transformers` con `peft` cargando el adaptador sobre la base; fusion del adaptador y conversion a `faster-whisper` o WhisperX; endpoints gestionados de Hugging Face. Existe un endpoint de terceros (FriendliAI) para otro adaptador de la misma serie, no para este.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Idioma | WER en test | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `dehanns/whisper-small-sinhala-lora-r32-seed-123` | Adaptador LoRA r32 sobre `whisper-small` | 244 M (base) | Cingales | 0,5823 | No disponible | 0 descargas, 0 likes |
| `dehanns/whisper-small-lora-sinhala` | Adaptador LoRA sobre `whisper-small` | 244 M (base) | Cingales | No disponible | No disponible | Publicado por el mismo autor |
| `dehanns/whisper-small-sinhala` | Ajuste completo publicado como safetensors | 0,2 B | Cingales | No disponible | No disponible | 12 descargas |
| `openai/whisper-small` | Modelo base multitarea | 244 M | Multilingue | No disponible en esta informacion | Verificar en la model card de OpenAI | Ampliamente desplegado |

## Limitaciones y advertencias

- WER de 0,5823 en test: mas de la mitad de las palabras se transcriben mal, un nivel que hace inviable el uso sin revision humana en practicamente cualquier flujo productivo.
- La diferencia entre WER (58,23 %) y CER (15,66 %) es muy pronunciada, lo que sugiere problemas de segmentacion de palabras o de normalizacion del texto de referencia en cingales; conviene verificar la metodologia de evaluacion antes de sacar conclusiones.
- El repositorio no declara licencia, por lo que no hay autorizacion explicita de uso comercial y el riesgo legal recae sobre quien lo despliegue.
- El modelo no incluye los pesos base: sin descargar `openai/whisper-small` el adaptador no es utilizable.
- Rendimiento no validado por terceros: 0 descargas y 0 likes en el momento de recoger los datos; se trata de un experimento sin evidencia externa de calidad.
- Los metadatos presentan inconsistencias: la fecha de creacion indicada es 2026-09-28, posterior a la recogida de datos, y el tamano de repositorio se reporta como 0,0 GB.
- Al heredar Whisper, es propenso a alucinaciones en silencios, ruido de fondo o audio musical, un comportamiento especialmente arriesgado en idiomas de bajos recursos.
- No se documenta el dominio de entrenamiento: puede degradarse en audio telefónico, con acentos regionales, ruido o solapamiento de hablantes.
- No hay diarizacion de hablantes ni puntuacion o capitalizacion garantizadas.
- El alcance linguistico es exclusivamente el cingales; no se ha verificado que conserve la capacidad de traduccion o deteccion de idioma del modelo base.
- Un adaptador LoRA no se puede cargar en `llama.cpp`, Ollama o herramientas equivalentes sin fusionarlo previamente con la base y convertirlo al formato correspondiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dehanns/whisper-small-sinhala-lora-r32-seed-123
- Adaptador relacionado: https://huggingface.co/dehanns/whisper-small-lora-sinhala
- Ajuste completo relacionado: https://huggingface.co/dehanns/whisper-small-sinhala
- Adaptador de cambio de codigo del mismo autor: https://free2aitools.com/model/dehanns/whisper-small-lora-codeswitch
- Endpoint de terceros para un adaptador de la serie: https://friendli.ai/models/dehanns/whisper-small-lora-sinhala-16
- Repositorio oficial de Whisper: https://github.com/openai/whisper
- Modelo base: https://huggingface.co/openai/whisper-small
