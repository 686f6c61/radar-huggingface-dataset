# loscrossos/Qwen3-TTS-12Hz-0.6B-Base

## Resumen

Qwen3-TTS-12Hz-0.6B-Base es un checkpoint de síntesis de voz (text-to-speech) de la familia Qwen3-TTS, publicado en el repositorio `loscrossos/Qwen3-TTS-12Hz-0.6B-Base` con pesos en safetensors y licencia Apache-2.0. El modelo está orientado a generación de voz multilingüe y clonación de voz rápida a partir de un audio de referencia de unos 3 segundos.

La model card indica que la familia Qwen3-TTS se entrenó con más de 5 millones de horas de habla en 10 idiomas (chino, inglés, japonés, coreano, alemán, francés, ruso, portugués, español e italiano) y que utiliza una arquitectura end-to-end con un modelo de lenguaje discreto multi-codebook y el tokenizador acústico Qwen3-TTS-Tokenizer-12Hz. Entre sus rasgos declarados destacan la generación en streaming con latencia de hasta 97 ms y el control de atributos acústicos mediante instrucciones en lenguaje natural.

El nombre comercial indica “0.6B”, pero el recuento de parámetros en safetensors es de 914.643.008 (~0,91B), una discrepancia que la información disponible no aclara. Además, el repositorio pertenece a un autor tercero (`loscrossos`), no a la cuenta oficial de Qwen, por lo que conviene verificar la procedencia y los hashes antes de usarlo en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Tarea | text-to-speech; clonación de voz |
| Arquitectura | TTS end-to-end con modelo de lenguaje discreto multi-codebook y tokenizador acústico Qwen3-TTS-Tokenizer-12Hz |
| Parámetros totales | 914.643.008 (~0,91B) según safetensors; el nombre comercial indica 0,6B |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible; pesos en safetensors y ejemplo de uso en bfloat16 |
| Idiomas soportados | zh, en, ja, ko, de, fr, ru, pt, es, it (10 idiomas; se mencionan perfiles dialectales sin detalle) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Tamaño del repositorio | 2,5 GB |
| Frecuencia del tokenizador | 12 Hz |
| Latencia declarada | 97 ms end-to-end en streaming, sin especificar hardware ni condiciones |
| Clonación de voz | audio de referencia de
