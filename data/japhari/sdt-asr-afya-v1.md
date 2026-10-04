# Japhari/sdt-asr-afya-v1

## Resumen

sdt-asr-afya-v1 es un modelo de reconocimiento automático del habla (ASR) para suajili (swahili/kiswahili) especializado en el dominio sanitario. Lo desarrolla el autor Japhari y consiste en un ajuste fino mediante LoRA de openai/whisper-large-v3-turbo sobre 25 horas de voz en suajili. El objetivo es transcribir con precisión mensajes de salud como instrucciones de dosificación, recordatorios de citas en la clínica y consejos de salud materna, contexto en el que un número mal interpretado se convierte en un problema de seguridad.

El modelo tiene 808.878.080 parámetros (unos 809 millones), se distribuye en formato safetensors y ocupa 1,7 GB en el repositorio. Es el compañero del modelo de texto a voz sdt-tts-afya-v1: ambos leen y escriben los números de la misma forma, y el ASR se utiliza para verificar la salida del TTS antes de que un mensaje hablado se dé por válido.

El autor lo publica explícitamente como "research preview" y advierte de que todavía no es seguro para uso sanitario sin supervisión humana. Su foco técnico es la forma hablada de los números en suajili, un punto históricamente problemático para Whisper en este idioma.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (base Whisper large-v3-turbo) con adaptadores LoRA |
| Parametros totales | 808.878.080 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible como texto; ventana de audio de 30 s (característica de la arquitectura Whisper) |
| Tipos de cuantizacion | no disponible en la información proporcionada; pesos publicados en safetensors |
| Idiomas soportados | Suajili (sw / kiswahili) |
| Licencia | cc-by-sa-4.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

sdt-asr-afya-v1 parte de openai/whisper-large-v3-turbo, un transformer encoder-decoder para reconocimiento automático del habla. El ajuste fino se realizó con LoRA (Low-Rank Adaptation), una técnica de adaptación de bajo rango que mantiene reducido el coste de entrenamiento y produce un modelo final de 808.878.080 parámetros en formato safetensors. El entrenamiento empleó 25 horas de voz en suajili, con google/WaxalNLP y google/fleurs como datasets de referencia. No se documentan en la información disponible el número total de tokens de entrenamiento, la composición exacta del dataset ni si hubo etapas de RLHF o DPO.

La innovación técnica destacable es la especialización en la transcripción de números en su forma hablada (por ejemplo, "kumi na tisa" para 19), junto con una normalización inversa de texto (ITN) que devuelve los números en dígitos. El modelo funciona como pareja del TTS sdt-tts-afya-v1: se transcribe la salida hablada del TTS y se regeneran las frases cuyos números no vuelven correctamente.

## Capacidades

- Reconocimiento automático del habla (speech-to-text) en suajili.
- Transcripción precisa de números en forma hablada (dosis, horas, cantidades, cifras).
- Normalización inversa de texto (ITN): convierte los números hablados a dígitos.
- Especialización en dominio sanitario: instrucciones de dosificación, recordatorios de clínica, salud materna y vacunación.
- Verificación del modelo TTS compañero: transcribe la salida de sdt-tts-afya-v1 y detecta frases con números mal generados para volver a generarlas.
- No se documenta soporte de tool calling, function calling, uso como agente, visión ni modalidades distintas del audio.

## Casos de uso

- Transcripción de mensajes de salud hablados: el modelo convierte notas de voz en suajili sobre dosificación o citas médicas en texto, con especial cuidado en los números, que son el punto crítico del dominio.
- Verificación de un pipeline de texto a voz: antes de enviar un mensaje hablado generado por sdt-tts-afya-v1, el ASR lo transcribe y se regeneran las frases cuyos números no coinciden, lo que actúa como control de calidad automático.
- Recordatorios de dosificación: transcripción de instrucciones del tipo "toma dos comprimidos tres veces al día durante cinco días", donde la conversión correcta de números a dígitos es esencial.
- Salud materna: digitalización de consejos hablados sobre número de visitas prenatales o plazos, apoyando registros clínicos en zonas con baja alfabetización digital.
- Vacunación: transcripción de mensajes sobre calendarios de vacunación infantil y edades límite.
- Investigación en ASR de bajos recursos: sirve como punto de partida para experimentos de ajuste fino sobre suajili y otros idiomas africanos con recursos limitados.
- Pre-anotación de corpus sanitarios: transcripción automática de audio para acelerar el etiquetado manual posterior, siempre con revisión humana de los números.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Dataset | Metrica | Valor |
|---|---|---|
| FLEURS sw_ke (test) | WER (números en forma hablada) | 16,25 |
| FLEURS sw_ke (test) | CER | 5,13 |

El autor advierte además de que, sobre hablantes que el modelo no ha visto nunca, aproximadamente 1 de cada 8 frases que contienen un número sigue transcribiendo algún número de forma incorrecta, con errores potencialmente peligrosos (por ejemplo, 17 oído como 70).

## Requisitos de hardware

- Con 808.878.080 parámetros, los pesos en fp16 ocupan aproximadamente 1,6 GB, por lo que la inferencia con activaciones se sitúa en torno a 2-3 GB de VRAM.
- En cuantización int8 la huella baja a alrededor de 1 GB, y en int4/GGUF q4 a unos 600 MB-1 GB (estimaciones según el tamaño del modelo; no confirmadas en la información proporcionada).
- Cabe con holgura en GPU de consumo: RTX 3060, RTX 4060, RTX 4090 o superiores, e incluso en equipos con GPU integrada modesta en cuantizaciones bajas.
- Opciones de despliegue: transformers (librería declarada), faster-whisper con CTranslate2, whisper.cpp/GGUF, vLLM y TGI (compatibles con arquitecturas Whisper).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Ventana de audio | Idioma | Licencia | WER en FLEURS sw_ke | Disponibilidad |
|---|---|---|---|---|---|---|
| sdt-asr-afya-v1 | 808.878.080 | 30 s | Suajili | cc-by-sa-4.0 | 16,25 (declarado por el autor) | HuggingFace |
| openai/whisper-large-v3-turbo | 809 M | 30 s | Multilingüe | MIT (modelo base) | no disponible | HuggingFace |
| openai/whisper-large-v3 | 1,55 B | 30 s | Multilingüe | MIT (modelo base) | no disponible | HuggingFace |

No se han proporcionado resultados comparables de benchmarks para los modelos base en el mismo conjunto de evaluación, por lo que la comparación numérica directa no está disponible.

## Limitaciones y advertencias

- Está declarado como "research preview" y el propio autor indica que no es seguro para uso sanitario sin supervisión humana.
- Sobre hablantes no vistos, alrededor de 1 de cada 8 frases con números puede contener un error numérico, y algunos errores son peligrosos (17 confundido con 70).
- Solo soporta suajili; no se documenta cobertura multilingüe.
- Al derivar de Whisper, hereda el riesgo de alucinación típico de la familia, especialmente con audio ruidoso o poco claro.
- Está entrenado con voces del dataset WAXAL, por lo que rinde mejor con esos hablantes que con voces no vistas.
- Licencia cc-by-sa-4.0: permite uso comercial, pero exige atribución y que las obras derivadas se distribuyan bajo la misma licencia (share-alike), lo que puede condicionar su integración en productos propietarios.
- Los resultados de benchmarks son declarados por el autor y no están verificados de forma independiente (`verified: false`).
- No se documentan límites de longitud de audio, comportamiento con cambio de código (code-switching) ni robustez ante acentos distintos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Japhari/sdt-asr-afya-v1
- Modelo TTS compañero: https://huggingface.co/Japhari/sdt-tts-afya-v1
- Modelo base: https://huggingface.co/openai/whisper-large-v3-turbo
- Dataset google/WaxalNLP: https://huggingface.co/datasets/google/WaxalNLP
- Dataset google/fleurs: https://huggingface.co/datasets/google/fleurs
