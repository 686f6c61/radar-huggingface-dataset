# loscrossos/Qwen3-TTS-Tokenizer-12Hz

# Qwen3-TTS-Tokenizer-12Hz

## Resumen

El repositorio `loscrossos/Qwen3-TTS-Tokenizer-12Hz` publica pesos en formato safetensors de un tokenizador neuronal de audio, identificado en su model card como Qwen3-TTS-Tokenizer-12Hz y presentado en el informe técnico Qwen3-TTS (arXiv:2601.15621). La model card enlaza al repositorio oficial de código `QwenLM/Qwen3-TTS`, a una demo en Hugging Face Spaces y a los pesos de referencia `Qwen/Qwen3-TTS-Tokenizer-12Hz`; la publicación concreta analizada pertenece al usuario `loscrossos`.

No es un modelo de texto ni un sistema TTS completo: convierte voz en códigos discretos y los reconstruye en forma de onda. Su interés está en la compresión acústica de muy baja tasa de bits y en el streaming de baja latencia, gracias a un diseño de 12,5 Hz, 16 capas/codebooks múltiples y una ConvNet causal ligera. El modelo tiene 170.557.441 parámetros, un repositorio de 0,7 GB y licencia Apache-2.0.

Es relevante para pipelines de voz que necesitan representaciones discretas compactas, como modelos de lenguaje de audio, TTS en streaming, transmisión de voz y preprocesado de corpus. La model card de la familia Qwen3-TTS declara 10 idiomas, pero el soporte lingüístico específico del tokenizador no se detalla.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Tokenizador/codec neuronal de audio; ConvNet causal ligera; 12,5 Hz y 16 capas/codebooks múltiples según la model card |
| Parámetros totales | 170.557.441 (dato de safetensors) |
| Parámetros activos | No aplica; no es un modelo MoE |
| Longitud de contexto | No disponible; no es un modelo de contexto textual. Para audio no se documenta un límite máximo |
| Tipos de cuantización | No disponible; solo se documentan pesos safetensors. No se indican GGUF, INT8 ni INT4 |
| Idiomas soportados | No disponible para el tokenizador. La familia Qwen3-TTS declara 10 idiomas: chino, inglés, japonés, coreano, alemán, francés, ruso, portugués, español e italiano |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Pipeline | audio-to-audio |
| Tamaño del repositorio | 0,7 GB |
| Frecuencia de tokens | 12,5 Hz |
| Codebooks | 16 |
| Latencia | No disponible para el tokenizador aislado; la pila Qwen3-TTS declara 97 ms extremo a extremo |

## Arquitectura y entrenamiento

La model card describe un tokenizador de audio con diseño de 12,5 Hz y 16 capas/codebooks múltiples, construido sobre una ConvNet causal ligera. El modelo codifica la señal de voz en códigos discretos y los decodifica de vuelta a forma de onda. Su objetivo declarado es conseguir una reducción extrema de la tasa de bits y habilitar streaming de latencia ultrabaja, con emisión inmediata del primer paquete.

La información disponible no detalla el número de horas o tokens de entrenamiento, la composición del dataset, el tamaño de cada codebook ni si se aplicaron etapas de RLHF o DPO; en un codec de audio estas etapas no son el mecanismo habitual. La model card remite al informe técnico para la evaluación de consistencia de generación de voz, similitud de hablante y métricas del tokenizador como ASR, PESQ, STOI y UTMOS, pero no incluye cifras en el repositorio. La arquitectura Dual-Track hybrid streaming y los 97 ms citados corresponden a la pila Qwen3-TTS, no se confirman para el tokenizador de forma aislada.

## Capacidades

- Codificación de audio a códigos discretos y decodificación de códigos a forma de onda.
- Operación causal orientada a streaming, con emisión inmediata del primer paquete según la model card.
- Compresión acústica de muy baja tasa de bits mediante 12,5 Hz y 16 codebooks.
- Preservación declarada de información paralingüística y características del entorno acústico.
- Integración con el paquete Python `qwen-tts` mediante `Qwen3TTSTokenizer`, con `encode` y `decode`.
- Entrada de audio desde URL o ruta local en el ejemplo de uso.
- No es un modelo de generación de texto: no produce texto, no hace tool calling y no soporta agentes.
- No es un sistema TTS completo por sí mismo: no convierte texto en voz sin un generador externo.
- No se documentan capacidades de ASR, traducción, visión, audio comprensivo o razonamiento multi-paso.
- Soporte multilingüe: no especificado para el tokenizador; la familia Qwen3-TTS declara 10 idiomas y perfiles dialectales.

## Casos de uso

- **TTS en streaming dentro de Qwen3-TTS:** el tokenizador codifica audio de referencia y decodifica los códigos generados por el modelo TTS. Su diseño causal y su tasa de 12,5 Hz encajan con síntesis de baja latencia; la familia declara 97 ms extremo a extremo, aunque no se confirma para el tokenizador aislado.
- **Representación de voz para modelos de lenguaje de audio:** convertir audio en secuencias discretas de 12,5 Hz y 16 codebooks reduce la longitud temporal frente a representaciones de mayor frecuencia. Es adecuado para entrenar o ejecutar LLM de audio que consumen tokens de voz.
- **Chat de voz en tiempo real:** codificar y decodificar por fragmentos con una ConvNet causal permite construir pipelines de voz conversacional con baja latencia y emisión temprana del primer paquete.
- **Transporte y almacenamiento de voz:** almacenar o transmitir códigos discretos en lugar de PCM reduce el ancho de banda. Es adecuado para notas de voz, agentes telefónicos y comunicaciones donde no se requiere audio sin pérdidas.
- **Preprocesado de corpus de TTS y ASR:** tokenizar grandes colecciones de audio para análisis, condicionamiento o experimentos de reconstrucción, y decodificar para comprobar la calidad mediante PESQ, STOI o UTMOS.
- **Acondicionamiento de voz y clonación:** codificar una muestra de referencia para conservar rasgos paralingüísticos y usarla como condición de un generador TTS. El tokenizador por sí solo no realiza clonación ni síntesis.
- **Asistentes multilingües:** si se integra en la pila Qwen3-TTS, que declara chino, inglés, japonés, coreano, alemán, francés, ruso, portugués, español e italiano, puede formar parte de asistentes de voz en esos idiomas.
- **Despliegue local con GPU de consumo:** con 170,6 millones de parámetros y un repositorio de 0,7 GB, es viable en GPUs de gama media para prototipos y servicios de baja concurrencia, siempre que la implementación concreta lo permita.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks en la información disponible. La model card remite al informe técnico y al repositorio GitHub para las métricas, pero no incluye
