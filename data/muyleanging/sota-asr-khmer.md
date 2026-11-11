# muyleanging/Sota-ASR-Khmer

## Resumen

Sota-ASR-Khmer (Sota, សោតៈ, "oreja" en jemer) es un modelo de reconocimiento automático del habla (ASR) para jemer, desarrollado por el usuario de Hugging Face muyleanging. Se trata de un modelo pequeno, de 25,89 millones de parametros, entrenado desde cero (no es un fine-tuning de Whisper ni de otro modelo existente), con una arquitectura Conformer con cabezas CTC y un decodificador atencional ligero. Su proposito es transcribir audio de jemer con una tasa de error de caracteres (CER) muy baja en habla clara, ocupando apenas 33 MB en su version ONNX int8.

El modelo es relevante porque el soporte de ASR para jemer de calidad es escaso: los modelos multilingues grandes rinden mal en este idioma y los ajustes de Whisper suelen quedarse en CER de dos digitos. Sota declara un CER del 3,40 % con beam search de 5 sobre un conjunto de test de 12 horas y 16 hablantes no vistos, frente al 13,20 % de Qwen3-ASR-0.6B-Khmer y el 18,57 % de whisper-small-khmer-v2 en la misma prueba. Es, ademas, un modelo pensado para ejecucion en el navegador y en CPU, no solo en GPU.

Se publica como modelo de prueba temprana ("early test model"), con pesos PyTorch de referencia y una version ONNX lista para produccion ligera. La licencia es propietaria y restrictiva ("sota-preview"), y el codigo PyTorch del modelo aun no es publico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer (encoder) + cabeza CTC + decodificador atencional de 3 capas |
| Parametros totales | 25.893.780 (25,89 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de audio; entrada a 16 kHz mono, frames de 40 ms tras subsampling) |
| Tipos de cuantizacion | fp32 (PyTorch); int8 (ONNX, ~33 MB) |
| Idiomas soportados | jemer (km) y ingles (en) |
| Licencia | sota-preview (licencia "other", propietaria; ver LICENSE) |
| Formato de pesos | safetensors (fp32, 463 tensores); ONNX int8 en repo separado |

## Arquitectura y entrenamiento

La entrada es audio mono a 16 kHz. El front-end log-Mel (80 bins, ventana de 25 ms, salto de 10 ms) esta integrado dentro del modelo, de modo que el fichero ONNX acepta audio en crudo. Dos convoluciones con stride 2 reducen la resolucion temporal de 10 ms a 40 ms (1,8 M de parametros). El encoder consta de 12 bloques Conformer con d_model 256, 4 cabezas con rotary position embeddings, FFN de 1024 y kernel convolucional de 31 (18,3 M de parametros). Sobre el encoder hay una cabeza CTC (0,9 M) y un decodificador atencional de 3 capas (4,9 M) que se preentreno primero con texto jemer. El vocabulario tiene 3.402 tokens de clusters escritos del jemer, compartidos con el modelo OCR Chakkhu del mismo autor.

El entrenamiento uso VoxPocket v5 (privado): unas 237 horas de habla jemer real mas unas 610 horas sinteticas generadas con VoxPocket TTS; el habla real se uso siempre completa y la sintetica como maximo la mitad de cada epoca. El split se hizo por hablante, eliminando voces clonadas y frases repetidas de dev/test (dev: 5,2 h, 8 hablantes; test: 12,0 h, 16 hablantes, solo habla real). Aumentacion: SpecAugment, velocidades 0,9/1,0/1,1, ruido de fondo (MUSAN), eco de sala y simulacion de llamada telefonica. La funcion de perdida combina 0,3 CTC + 0,7 entropia cruzada con label smoothing 0,1. El decodificador se preentreno con 315.000 frases jemer (10.000 pasos) y despues se entrenaron 100.000 pasos de habla con AdamW, 25.000 de warmup y bf16, en una unica RTX 3090 Ti durante unas 8 horas. Los pesos finales son la media de los ultimos 5 checkpoints (80k-100k pasos). La decodificacion combina un borrador CTC greedy rapido con beam search de 5 hipotesis puntuadas por decodificador y CTC (0,7 decodificador + 0,3 CTC), con guardas de longitud que revierten al borrador CTC si el decodificador se desvia.

## Capacidades

- Transcripcion de voz a texto en jemer a partir de audio mono a 16 kHz.
- Decodificacion en dos modos: CTC greedy (rapido) y beam search de 5 (mayor precision).
- Front-end de audio integrado: acepta audio en crudo en la version ONNX, sin preprocesado externo.
- Ejecucion en navegador y en CPU mediante ONNX Runtime y sherpa-onnx (el audio no sale del dispositivo en la demo web).
- Manejo limitado de palabras en ingles dentro del habla jemer (solo 4 clips del test contienen ingles, insuficiente para evaluar).
- No dispone de tool calling, function calling, capacidades de agente, vision ni audio mas alla del ASR.
- No es un modelo de chat ni de generacion de texto libre: solo transcribe.

## Casos de uso

- Transcripcion de reuniones y entrevistas en jemer: el modelo procesa audio claro con bajo CER (3,40 % con beam 5) y permite generar actas o subtitulos; su tamano de 33 MB int8 facilita el despliegue en servidores modestos.
- Subtitulado automatico de video en jemer: con una velocidad de unos 0,2 s por minuto de audio en modo CTC greedy sobre CPU de portatil (4 hilos), es viable procesar lotes grandes de contenido audiovisual.
- Aplicaciones web de dictado con privacidad: la demo corre en el navegador con ONNX y el audio no abandona el dispositivo, adecuado para entornos con requisitos de privacidad.
- Digitalizacion de archivos orales y corpus linguisticos: el modelo puede transcribir grabaciones de habla clara para construir corpus de jemer, aunque conviene revisar manualmente el ruido y los acentos fuertes.
- Asistentes de voz locales para jemer: al caber en CPU y en navegador, puede integrarse en interfaces de voz sin depender de la nube.
- Investigacion en ASR de bajos recursos: sirve como referencia de arquitectura Conformer pequena entrenada desde cero con datos sinteticos y reales, util para reproducir o comparar metodologias.
- Preprocesado para pipelines de NLP en jemer: transcripcion previa a tareas de traduccion, analisis de sentimiento o indexacion de audio.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados de forma independiente) sobre el conjunto Sota held-out test: 12,0 h, 6.513 clips, 16 hablantes no vistos. CER en porcentaje, menor es mejor; texto jemer normalizado, sin espacios ni puntuacion.

| Modelo | Tamano | Todos (6.513) | nxkmer (5.508) | OpenSLR42 (1.005) |
|---|---|---:|---:|---:|
| Sota (beam 5) | 26 M · 33 MB int8 | 3,40 % | 3,25 % | 5,20 % |
| Sota (CTC greedy) | 26 M | 3,62 % | 3,47 % | 5,54 % |
| Qwen3-ASR-0.6B-Khmer | 0,6 B | 13,20 % | 13,34 % | 11,41 % |
| whisper-small-khmer-v2 | ~244 M | 18,57 % | 19,72 % | 4,61 % (posible fuga de datos) |

Notas del autor: los hablantes de test son nuevos, pero las grabaciones provienen de las mismas fuentes y estilo que el entrenamiento de Sota, lo que favorece al modelo; whisper-small-khmer-v2 se entreno con OpenSLR42 y pudo haber visto esas frases; parte de las diferencias son de estilo ortografico. La version ONNX int8 mantiene la precision (3,19 % vs 3,15 % CER con beam search; 3,24 % vs 3,28 % greedy en 300 clips). Velocidad: en CPU de portatil a 4 hilos, 1 minuto de audio tarda unos 0,2 s (CTC greedy) o 1,5 s (beam 5).

## Requisitos de hardware

- VRAM estimada: minima; el modelo fp32 ocupa unos 0,1 GB en disco y el ONNX int8 unos 33 MB, por lo que cabe en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: no requiere GPU; funciona en CPU. Cualquier GPU moderna (RTX 3090 Ti fue la usada en entrenamiento) acelera la inferencia, pero no es necesaria.
- Cabe en GPU consumer: si, en todas (GTX 1060, RTX 3060, RTX 4090, etc.), aunque el modo de despliegue natural es CPU.
- Opciones de despliegue: ONNX Runtime, sherpa-onnx, navegador (via ONNX); PyTorch para referencia e investigacion (el codigo del modelo no es publico aun).
- Latencia y throughput: en CPU de portatil a 4 hilos, ~0,2 s por minuto de audio en CTC greedy y ~1,5 s por minuto en beam 5. No se han publicado cifras de throughput en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | CER (test Sota) | Licencia | Disponibilidad |
|---|---|---:|---:|---|---|
| Sota-ASR-Khmer | 25,89 M | no disponible | 3,40 % (beam 5) | sota-preview (propietaria) | Pesos PyTorch + ONNX int8 |
| Qwen3-ASR-0.6B-Khmer | 0,6 B | no disponible | 13,20 % | no disponible en la informacion | Hugging Face |
| whisper-small-khmer-v2 | ~244 M | no disponible | 18,57 % (4,61 % en OpenSLR42, posible fuga) | no disponible en la informacion | Hugging Face |

Sota es entre 10 y 20 veces mas pequeno que sus competidores y obtiene mejor CER global en este test, aunque la comparacion esta sesgada por el origen de los datos de test. No se dispone de datos de contexto ni de otros benchmarks para estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de prueba temprana: ajustado a habla jemer clara, leida o hablada; se esperan mas errores en audio con ruido, llamadas telefonicas, habla rapida informal y acentos fuertes.
- El habla mezclada jemer-ingles no se ha medido (solo 4 clips del test contienen ingles).
- Riesgo de sesgo por los datos: VoxPocket v5 es privado y las grabaciones de test comparten fuentes y estilo con el entrenamiento, lo que puede inflar los resultados.
- Diferencias de estilo ortografico respecto a otros modelos (por ejemplo, ហ្នឹង vs នឹង); Sota aprende la ortografia de sus propias etiquetas.
- Licencia "sota-preview" propietaria y restrictiva: es necesario revisar el fichero LICENSE antes de cualquier uso comercial.
- El codigo PyTorch del modelo no es publico; los pesos safetensors son solo para referencia e investigacion, y la ejecucion practica depende de los ficheros ONNX.
- Riesgo de alucinacion en transcripcion: el decodificador atencional puede desviarse, aunque el autor incluye guardas de longitud que revierten al borrador CTC.
- No es un modelo multilingue general: solo jemer (con ingles residual) y sin capacidades de texto, vision ni agentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/muyleanging/Sota-ASR-Khmer
- Version ONNX: https://huggingface.co/muyleanging/Sota-ASR-Khmer-ONNX
- Demo Space: https://huggingface.co/spaces/muyleanging/Sota-ASR-Demo
- Demo web en navegador: https://muyleanging.github.io/sota-web/#try
- Web del proyecto: https://muyleanging.github.io/sota-web/
- Modelo OCR Chakkhu (tokens compartidos): https://muyleanging.github.io/chakkhu-web/
- Qwen3-ASR-0.6B-Khmer: https://huggingface.co/seanghay/Qwen3-ASR-0.6B-Khmer
- whisper-small-khmer-v2: https://huggingface.co/seanghay/whisper-small-khmer-v2
