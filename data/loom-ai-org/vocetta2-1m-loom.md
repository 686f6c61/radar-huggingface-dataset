# loom-ai-org/vocetta2-1m-loom

## Resumen

Vocetta2 1M es un modelo de síntesis de voz (text-to-speech) en inglés desarrollado por VantoraLabs y exportado al ecosistema loom.cpp por loom-ai-org. Se trata de un modelo extremadamente compacto: 1.031.754 parámetros según la model card y 1.045.638 según los pesos en safetensors, una diferencia atribuible al recuento de tensores auxiliares. El pipeline completo incluye una red de duración, una red acústica que genera un espectrograma mel y un decodificador ConvNeXt/iSTFT que produce audio a 24 kHz.

La relevancia de este modelo reside en su tamaño: es capaz de sintetizar voz inteligible en hardware muy limitado, incluida una Raspberry Pi Zero, con un consumo de memoria pico de 57-58 MB, de los cuales la mayor parte corresponde al propio runtime. El repositorio distribuye el modelo como un único archivo GGUF autodescriptivo que contiene las topologías de grafo, el tokenizador y el script de controlador, lo que simplifica el despliegue.

Este repositorio concreto es una exportación, no el modelo original: los pesos F32 son idénticos a los de `VantoraLabs/Vocetta2-1m`, mientras que las variantes cuantizadas se derivan de ellos. La licencia MIT se hereda del modelo base y el único idioma soportado es el inglés con una sola voz.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red de duración + red acústica a espectrograma mel + decodificador ConvNeXt/iSTFT a 24 kHz |
| Parametros totales | 1.031.754 (model card) / 1.045.638 (safetensors) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica; límite de 207 símbolos fonémicos por llamada (BOS y EOS incluidos) |
| Tipos de cuantizacion | F32 y Q8_0 per-channel en capas pointwise y cabeza del decodificador |
| Idiomas soportados | Inglés (en) |
| Licencia | MIT |
| Formato de pesos | GGUF (F32 y Q8_0) |
| Frecuencia de muestreo | 24 kHz |
| Runtime | loom-py-rt >= 1.0.0rc18 (requiere el op `ISTFT`) |
| Tamano de archivo | 4,2 MB (F32) / 2,9 MB (Q8_0) |
| Memoria pico | 57-58 MB (dominada por el runtime) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura de tres etapas propia de los sintetizadores neuronales ligeros. Primero, una red de duración predice la longitud de cada unidad fonémica. Después, una red acústica transforma la secuencia fonémica en un espectrograma mel. Finalmente, un decodificador basado en ConvNeXt con transformada inversa de Fourier de corta duración (iSTFT) convierte el mel en forma de onda a 24 kHz. La exportación a loom.cpp empaqueta estas tres etapas en un único GGUF con sus topologías de grafo y el controlador embebido.

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del corpus ni si se aplicaron técnicas de RLHF o DPO. La model card tampoco detalla innovaciones como decodificación especulativa o atención lineal, más allá de la propia compacidad del diseño. El decodificador se alimenta por defecto con ruido cero, tal como lo renderiza el modelo original; el parámetro `noise_scale` permite añadir ruido gaussiano, aunque el autor indica que empeora todas las métricas. El parámetro `length_scale` ajusta la velocidad del habla.

Una particularidad técnica relevante es que la exportación no reproduce el recorte de 2400 fotogramas del modelo original (25,6 s): sintetiza todos los fotogramas que piden las duraciones, de modo que por debajo de ese umbral el audio coincide con el del modelo base.

## Capacidades

- Síntesis de voz en inglés a partir de texto ortográfico mediante la puerta de alto nivel `text2speech.infer(text)`.
- Síntesis a partir de fonemas IPA proporcionados por el usuario mediante `phonemes=`, lo que permite obtener la calidad del front-end original.
- Fonemización integrada mediante orthography2ipa con léxico de pronunciación estadounidense opcional (hexgrad/misaki).
- Control de velocidad del habla mediante `length_scale` y de ruido del decodificador mediante `noise_scale` y `seed`.
- Ejecución en CPU y GPU a través del runtime loom-py-rt, con backend GGML.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio de entrada.
- Una única voz; no hay selección de hablante ni clonación.

## Casos de uso

- Asistentes de voz embebidos en microcontroladores y placas de bajo coste: el modelo cabe en una Raspberry Pi Zero con 57-58 MB de memoria pico, lo que permite dotar de voz a dispositivos sin capacidad para modelos TTS convencionales.
- Lectura de notificaciones y alertas en sistemas domóticos: la latencia reducida y el tamaño de 2,9-4,2 MB permiten cargar el modelo en memoria al arrancar y sintetizar mensajes cortos bajo demanda.
- Accesibilidad en aplicaciones de escritorio: integración mediante `loom-py-rt` para leer en voz alta contenido de interfaz o documentos, con control de velocidad mediante `length_scale`.
- Generación de avisos pregrabados en kioscos o terminales de punto de venta: el pipeline completo en un solo GGUF simplifica el despliegue en dispositivos sin sistema de paquetes complejo.
- Pruebas de integración continua de pipelines de audio: el tamaño mínimo del archivo y la reproducibilidad con semilla fija permiten usarlo como fixture en tests de sistemas TTS.
- Investigación en síntesis de voz de muy bajo presupuesto de parámetros: sirve como referencia para estudiar el límite inferior de tamaño en el que un TTS neuronal mantiene inteligibilidad (WER del 9,8 % en LibriSpeech con el léxico incluido).
- Prototipado de interfaces de voz en inglés antes de migrar a un modelo mayor: la API de loom-py permite validar el flujo completo con un coste de recursos despreciable.

## Benchmarks y rendimiento

Los únicos datos publicados en la model card son tasas de error de palabra (WER) medidas con Whisper small sobre síntesis del propio modelo:

| Metrica | Resultado |
|---|---|
| WER en 30 frases de LibriSpeech con léxico incluido (puerta de texto) | 9,8 % |
| WER en 30 frases de LibriSpeech con G2P original del modelo base | 7,2 % |
| WER en 60 síntesis, Q8_0 per-channel vs F32 | 8,5 % vs 8,5 % |
| Fidelidad de forma de onda F32 vs modelo original | 1,8e-4 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, ya que no aplican a un modelo TTS.

## Requisitos de hardware

- VRAM estimada para inferencia: no requiere GPU; la memoria pico es de 57-58 MB, casi toda del runtime.
- GPU recomendadas: no se especifican; el backend GPU GGML funciona, pero el modelo está pensado para CPU.
- Cabe en cualquier GPU de consumo y en CPU de gama baja, incluida Raspberry Pi Zero y Pi 1-3.
- Opciones de despliegue: `loom-py-rt` (PyPI) con `loom-py` como API de alto nivel; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles de forma numérica; la model card indica que Q8_0 corre a la velocidad de F32 en Pi Zero y más lento en Pi 4.
- Advertencia: en Raspberry Pi Zero o Pi 1-3 con `loom-py-rt` 1.0.0rc20 o anterior, definir `GGML_VC4_FUSE=0` antes de cargar `vocetta2-1m-f32.gguf` o `vocetta2-1m-q8_0_pc.gguf`, o usar `device="cpu"`. Corregido en loom-py-rt 1.0.0.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Como referencia cualitativa, los sintetizadores neuronales habituales (VITS, Piper, Coqui TTS) manejan órdenes de magnitud superiores de parámetros, pero no se aportan datos concretos de esos sistemas en la información disponible para establecer una comparación rigurosa.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Vocetta2 1M (este) | 1.031.754 | 207 fonemas/llamada | MIT | Hugging Face, GGUF |
| Alternativas | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Solo inglés y una única voz; no hay soporte multilingüe ni selección de hablante.
- Límite estricto de 207 símbolos fonémicos por llamada (BOS y EOS incluidos); el texto más largo debe dividirse por frases.
- La puerta de texto no equivale al front-end original: con el léxico incluido el WER es del 9,8 % frente al 7,2 % del G2P original. Sin léxico, el inglés empeora notablemente. Para calidad máxima hay que fonemizar con el G2P original y pasar `phonemes=`.
- El fonemizador orthography2ipa es una solución provisional del autor para evitar conflictos de licencia; en idiomas de ortografía profunda como el inglés requiere un léxico de referencia para aplicar reglas de acentuación y fonemización contextual.
- Riesgo de alucinación acústica y de pronunciaciones incorrectas en palabras fuera del léxico; no se han documentado sesgos específicos.
- El recorte de 2400 fotogramas del modelo original no se reproduce; por encima de ese umbral el comportamiento puede diferir del modelo base.
- El ruido del decodificador está desactivado por defecto; activarlo empeora las métricas según el autor.
- Licencia MIT, que permite uso comercial, pero heredada del modelo base; conviene verificar las condiciones del modelo original y del léxico de misaki (Apache-2.0).
- Requiere `loom-py-rt` 1.0.0rc18 o superior por el op `ISTFT`; versiones anteriores fallan con `unknown op 'ISTFT'`.
- Modelo en desarrollo activo ("work in progress" según el autor); la API y el comportamiento pueden cambiar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/loom-ai-org/vocetta2-1m-loom
- Modelo base: https://huggingface.co/VantoraLabs/Vocetta2-1m
- Repositorio loom.cpp: https://github.com/loom-ai-org/loom.cpp
- Repositorio loom-py: https://github.com/loom-ai-org/loom-py
- Exportador loom-exporter: https://github.com/loom-ai-org/loom-exporter
- Léxico hexgrad/misaki: https://github.com/hexgrad/misaki
- Léxico incluido: https://huggingface.co/loom-ai-org/vocetta2-1m-loom/resolve/main/lexicons/en_US-misaki.tsv
