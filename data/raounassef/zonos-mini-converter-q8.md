# raounassef/zonos-mini-converter-q8

## Resumen

Zonos-mini-converter-q8 es una conversión a cuantización Q8_0 de los dos componentes auxiliares del modelo de síntesis de voz ZONOS3-Mini de Zyphra: el codificador del códec de audio (`zac-encoder`) y el modelo maestro SSL (`ssl-teacher`). No se trata de un modelo de texto a voz completo, sino de las piezas que ZONOS3-Mini emplea en modo referencia para transformar una grabación de voz en los códigos internos de su códec, paso previo necesario para la clonación de voz. El autor, raounassef, publica estas copias reducidas con el objetivo explícito de poder ejecutar ese pipeline en teléfonos móviles.

La conversión afecta únicamente a las matrices de pesos bidimensionales de mayor tamaño: en el codificador las matrices `stage.*` y en el maestro las matrices de feed-forward, atención y convolución puntual `enc.*`. El resto de tensores y todos los metadatos permanecen intactos, y el runtime ggml propio de ZONOS3-Mini acepta estas matrices cuantizadas sin modificaciones. El resultado son dos ficheros GGUF de 1.157 MB y 415 MB frente a los 4.035 MB y 1.549 MB originales en F32.

El modelo base ZONOS3-Mini es un sistema de text-to-speech de Zyphra con capacidades de clonación de voz; este repositorio solo contiene los artefactos de codificación necesarios para el modo referencia, no el generador acústico ni el modelo de lenguaje asociado. La licencia es Apache-2.0, la misma que los pesos originales, aunque el autor aclara que estas copias no están hechas ni respaldadas por Zyphra.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador de códec de audio (ZAC) y modelo maestro SSL, componentes de ZONOS3-Mini |
| Parametros totales | 387.146.752 (suma de ambos ficheros del repo) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (bloques de 8 bits) sobre matrices 2D seleccionadas; resto de tensores sin cambios |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (`zac-encoder-q8.gguf`, `ssl-teacher-q8.gguf`) |

## Arquitectura y entrenamiento

El repositorio no contiene un modelo entrenado de novo, sino una re-cuantización de dos artefactos de ZONOS3-Mini. El `zac-encoder` es el codificador del códec de audio propietario de Zyphra (ZAC), que convierte una señal de voz en una secuencia de códigos discretos; el `ssl-teacher` es un modelo maestro de aprendizaje auto-supervisado que actúa como referencia en el entrenamiento o en el pipeline de extracción de representaciones. Ambos se distribuyen originalmente en F32 dentro del repositorio `Zyphra/ZONOS3-Mini` en el commit `d2d142a86b1e6aeb4252679673c86ecd86177bf8`.

La intervención técnica consiste en aplicar cuantización Q8_0 de GGML a las matrices bidimensionales de mayor tamaño: en el codificador las matrices `stage.*`, y en el maestro las matrices de feed-forward, atención y convolución puntual `enc.*`. Esta selección es deliberada, ya que el runtime ggml de ZONOS3-Mini acepta matrices cuantizadas precisamente para esos tensores, lo que permite cargar los ficheros sin parchear el código. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO en el modelo base.

## Capacidades

- Extracción de códigos de códec a partir de una grabación de voz (modo referencia de ZONOS3-Mini).
- Codificación de audio para clonación de voz en el pipeline de ZONOS3-Mini.
- Ejecución en dispositivos móviles gracias a la reducción de tamaño de los ficheros GGUF.
- Compatibilidad directa con el runtime ggml de ZONOS3-Mini sin modificaciones.
- No incluye generación de texto, razonamiento, código, matemáticas ni visión.
- No dispone de tool calling ni de capacidades de agente.
- Soporte multilingüe: no disponible.
- No es un modelo de text-to-speech autónomo: requiere el resto de componentes de ZONOS3-Mini.

## Casos de uso

- Clonación de voz en aplicaciones móviles: la app Vesper Tales utiliza estos ficheros para extraer los códigos de una grabación de referencia en el propio teléfono, reduciendo el consumo de memoria y almacenamiento frente a los pesos F32 originales.
- Preprocesado de audio en pipelines de TTS: el `zac-encoder-q8.gguf` sirve para transformar muestras de voz en códigos que alimentan al generador de ZONOS3-Mini, con un coste de almacenamiento de 1.157 MB en lugar de 4.035 MB.
- Extracción de representaciones auto-supervisadas: el `ssl-teacher-q8.gguf` permite obtener embeddings de audio en 415 MB frente a 1.549 MB, útil en entornos con restricciones de memoria.
- Prototipado de sistemas de voz en dispositivos de borde: al caber en memoria de teléfonos y sistemas embebidos, permite iterar sobre pipelines de clonación sin depender de servidores GPU.
- Investigación en cuantización de modelos de audio: sirve como caso de estudio de cuantización selectiva Q8_0 sobre matrices concretas manteniendo compatibilidad con el runtime original.
- Integración en aplicaciones de accesibilidad: la generación de voces personalizadas en el dispositivo evita enviar grabaciones de voz a servicios externos, lo que reduce la exposición de datos biométricos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: los dos ficheros suman aproximadamente 1,6 GB en disco; la inferencia requiere cargar en memoria al menos uno de ellos según la etapa del pipeline (1.157 MB para el codificador, 415 MB para el maestro).
- GPU recomendadas: no disponible; el caso de uso declarado es ejecución en teléfonos móviles, no en GPU de escritorio.
- Cabe en GPU de consumo: sí, cualquier GPU con 2 GB o más de VRAM puede alojar ambos ficheros simultáneamente.
- Opciones de despliegue: runtime ggml propio de ZONOS3-Mini, que acepta estos GGUF cuantizados sin cambios. No se indica compatibilidad con vLLM, TGI, llama.cpp u Ollama.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| raounassef/zonos-mini-converter-q8 | 387.146.752 | GGUF Q8_0 | no disponible | Apache-2.0 | Hugging Face |
| Zyphra/ZONOS3-Mini (original) | no disponible | F32 (GGUF y safetensors) | no disponible | Apache-2.0 | Hugging Face |
| Codecs de audio neuronales (p. ej. EnCodec, DAC) | variable | PyTorch / ONNX | no disponible | variable | Hugging Face, GitHub |

La comparación directa con otros codificadores de audio no está disponible en la información proporcionada; la alternativa más inmediata es el propio ZONOS3-Mini en F32, del que este repositorio es una versión reducida y funcionalmente equivalente para los tensores cuantizados.

## Limitaciones y advertencias

- No es un modelo de text-to-speech completo: solo contiene el codificador del códec y el maestro SSL; sin el resto de componentes de ZONOS3-Mini no genera audio.
- La cuantización Q8_0 introduce una pérdida de precisión respecto a los pesos F32 originales; no se han publicado métricas de degradación de calidad.
- Solo se cuantizan matrices concretas (`stage.*` y `enc.*`); otros tensores permanecen en su precisión original, por lo que el ahorro de tamaño es parcial.
- El repositorio registra 0 descargas y 0 likes, y fue creado en noviembre de 2026; no hay evidencia de validación por parte de la comunidad.
- Las copias no están hechas ni respaldadas por Zyphra; para producción conviene evaluar los pesos originales.
- Riesgo de sesgos y alucinaciones acústicas: no disponible en la información proporcionada.
- Idiomas soportados: no disponible; depende del modelo base ZONOS3-Mini.
- Licencia Apache-2.0 permite uso comercial, pero debe conservarse la atribución correspondiente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/raounassef/zonos-mini-converter-q8
- Modelo base: https://huggingface.co/Zyphra/ZONOS3-Mini
- Zyphra: https://www.zyphra.com
