# loom-ai-org/paradee-8m-loom

## Resumen

Paradee-8M v1.3 (exportado como `loom-ai-org/paradee-8m-loom`) es un modelo de síntesis de voz (text-to-speech) de 8,6 millones de parámetros derivado de `sahilmahendrakar/Paradee-8M-v1.3`, que a su vez es una destilación de Kokoro-82M. El modelo conserva ocho voces de Kokoro distribuidas en inglés, hindi, francés y español, y sustituye el vocoder de Kokoro por una cabeza source-filter a frecuencia de trama, con salida a 24 kHz. Esta ficha concreta es la exportación al formato GGUF de loom.cpp, un contenedor autodescriptivo que incluye las topologías de grafo, el tokenizador (si aplica) y el script driver del modelo.

La relevancia del modelo radica en su tamaño extremadamente reducido (8,6 M de parámetros, 34,6 MB en F32) combinado con soporte multilingüe y una licencia Apache-2.0 permisiva. Está pensado para inferencia en el runtime loom.cpp a través de la librería `loom-py-rt`, no para uso con transformers o PyTorch directamente. El repositorio incluye varias precisiones (F32 y Q8_0_PC) y lexicones de pronunciación de misaki para inglés estadounidense y británico.

Es un modelo de nicho: no es un LLM, sino un TTS compacto orientado a despliegues ligeros, entornos sin GPU y aplicaciones donde el coste por síntesis y el tamaño del binario son críticos. Su calidad depende fuertemente de los front-ends fonéticos utilizados, como se detalla en las limitaciones.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | TTS source-filter con cabeza a frecuencia de trama (sustituye el vocoder de Kokoro); destilación de Kokoro-82M |
| Parámetros totales | 8.604.930 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (procesa una frase por pasada, máximo 510 fonemas) |
| Tipos de cuantización | F32 y Q8_0_PC (int8 por canal en proyecciones y convoluciones, ALBERT en F32) |
| Idiomas soportados | en, hi, fr, es |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (F32 y Q8_0_PC) |
| Frecuencia de muestreo | 24 kHz |
| Voces | af_heart (por defecto), bf_isabella, am_puck, bm_fable, hf_alpha, hm_omega, ff_siwis, em_alex |
| Tamaño del repositorio | 0,1 GB |
| Runtime | loom.cpp / loom-py-rt (PyPI) |

## Arquitectura y entrenamiento

El modelo es una destilación de Kokoro-82M a 7,88 M de parámetros (8,6 M contando todas las componentes). La innovación arquitectónica principal es la sustitución del vocoder de Kokoro por una cabeza source-filter que opera a frecuencia de trama, lo que reduce drásticamente el coste computacional manteniendo la salida a 24 kHz. La exportación a GGUF conserva los parámetros sin modificar en el fichero F32; las versiones cuantizadas empaquetan los pesos de convolución y proyección en int8 por canal (Q8_0_PC), dejando ALBERT en F32, ya que cuantizarlo degrada el inglés hasta un 35 % de tasa de error de palabra.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO en la información proporcionada. El modelo base es `sahilmahendrakar/Paradee-8M-v1.3`, y esta exportación se genera con `loom-exporter`. El motor loom.cpp calcula las STFT como convoluciones sumadas en float32 (frente a las FFT del modelo original), lo que produce una forma de onda a 56-67 dB de la del upstream en F32. El ruido de síntesis es determinista si se pasa `seed=`, mientras que el upstream lo dibuja sin semilla.

## Capacidades

- Síntesis de voz multilingüe en inglés, hindi, francés y español con ocho voces predefinidas.
- Selección de idioma implícita por voz (`ff_siwis` lee francés, `em_alex` español, etc.) o explícita mediante `language=`.
- Streaming de audio por fragmentos, un fragmento por frase, con acceso a la forma de onda completa vía `stream.exact`.
- Control de velocidad mediante el parámetro `speed` (por ejemplo, `speed=1.1`).
- Fonemización mediante front-ends propios: misaki para inglés y el G2P de Paradee para hindi, francés y español; fallback a orthography2ipa con lexicones incluidos.
- Reproducibilidad de la síntesis mediante semilla (`seed=`).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es exclusivamente un modelo TTS.
- No dispone de modo thinking, visión ni audio de entrada.

## Casos de uso

- Lectura de textos largos por frases: el modelo procesa una frase por pasada (máximo 510 fonemas) y el streaming entrega un fragmento por frase, lo que permite reproducir audiolibros o artículos por partes sin cargar todo el audio en memoria.
- Asistentes de voz embebidos en dispositivos de bajos recursos: con 34,6 MB en F32 y 19,5 MB en Q8_0_PC, cabe en sistemas con RAM limitada y sin GPU dedicada, integrándose vía loom-py-rt.
- Localización de contenido en cuatro idiomas: un mismo binario genera voz en inglés, hindi, francés y español seleccionando la voz adecuada, útil para doblaje ligero o avisos multilingües.
- Generación de avisos y notificaciones por voz en aplicaciones: la latencia baja y el tamaño reducido permiten sintetizar mensajes cortos en el propio cliente sin depender de un servicio en la nube.
- Prototipado de interfaces conversacionales: el streaming por frases facilita la reproducción incremental en asistentes de atención al cliente o kioscos interactivos.
- Accesibilidad: conversión de texto a voz para lectores de pantalla o sistemas de asistencia, con control de velocidad para ajustar la cadencia al usuario.
- Pruebas de pipelines TTS en CI: el modelo determinista con `seed=` permite comparar formas de onda de referencia entre ejecuciones y detectar regresiones en el front-end fonético.

## Benchmarks y rendimiento

La model card proporciona tasas de error de palabra (WER) medidas con Whisper small sobre 20 frases inglesas retenidas y 15 por cada otro idioma, en precisión F32:

| Voz | Front-end propio | Fold + lexicón | Fold solo |
|---|---|---|---|
| af_heart (en-US) | 3,7 % | 8,9 % | 28,2 % |
| bf_isabella (en-GB) | 4,5 % | 17,1 % | 37,2 % |
| ff_siwis (fr) | 2,8 % | -- | 6,4 % |
| em_alex (es) | 1,1 % | -- | 1,1 % |
| hf_alpha (hi) | 13,0 % | -- | 20,6 % |

Q8_0_PC lee igual que F32, salvo el hindi, que sube a 15,3 %. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, lo cual es esperable al tratarse de un modelo TTS.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en cualquier precisión; el fichero F32 ocupa 34,6 MB y el Q8_0_PC 19,5 MB, por lo que la inferencia cabe holgadamente en memoria de sistema.
- GPU recomendadas: no requiere GPU; puede ejecutarse en CPU. Cualquier GPU consumer (por ejemplo, RTX 4090, RTX 3060) es más que suficiente si se desea aceleración.
- Cabe en cualquier GPU consumer e incluso en dispositivos embebidos.
- Opciones de despliegue: loom.cpp y loom-py-rt (PyPI, `pip install -U "loom-py-rt[hub,phonemes]>=1.0.0"`); no se indica soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Paradee-8M v1.3 (loom) | 8,6 M | en, hi, fr, es | una frase por pasada (≤510 fonemas) | Apache-2.0 | GGUF (loom.cpp) |
| Kokoro-82M | 82 M | múltiples (no detallado) | no disponible | Apache-2.0 | safetensors / ONNX |
| Paradee-8M-v1.3 (original) | 7,88 M | en, hi, fr, es | no disponible | Apache-2.0 (heredada) | no disponible |

Kokoro-82M es el modelo del que se destila Paradee; Paradee reduce el tamaño en un orden de magnitud a costa de sustituir el vocoder. El original `sahilmahendrakar/Paradee-8M-v1.3` comparte arquitectura y licencia, pero esta exportación añade el formato GGUF autodescriptivo y el driver de loom.cpp. No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- La puerta de texto requiere los front-ends propios: sin misaki ni el G2P de Paradee, el inglés cae al 28,2 % de WER (af_heart) y el hindi al 20,6 %; los lexicones incluidos mitigan parcialmente el inglés (8,9 % y 17,1 %).
- La voz determina el idioma salvo que se especifique `language=`; usar una voz con texto de otro idioma produce resultados incorrectos.
- Procesa una frase por pasada (máximo 510 fonemas); no gestiona párrafos completos de una vez.
- La forma de onda difiere de la del upstream en F32 (56-67 dB), por las STFT calculadas como convoluciones en float32.
- La cuantización Q8_0_PC degrada el hindi (15,3 % de WER frente a 13,0 % en F32) y exige mantener ALBERT en F32.
- Riesgo de alucinación y sesgos: no se documentan sesgos conocidos en la información disponible; al ser un TTS, el riesgo se traduce en pronunciaciones incorrectas o prosodia anómala más que en contenido inventado.
- Licencia Apache-2.0 permisiva para uso comercial, heredada del modelo base; conviene verificar las licencias de los front-ends externos (misaki, G2P de Paradee) que se instalan por separado.
- Dependencia del runtime loom.cpp/loom-py-rt; no es compatible con pipelines estándar de transformers sin adaptación.
- El repositorio no tiene descargas ni likes, y fue creado y actualizado el mismo día (22 de noviembre de 2026), lo que sugiere poca validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/loom-ai-org/paradee-8m-loom
- Modelo base: https://huggingface.co/sahilmahendrakar/Paradee-8M-v1.3
- Repositorio loom.cpp: https://github.com/loom-ai-org/loom.cpp
- Repositorio loom-exporter: https://github.com/loom-ai-org/loom-exporter
- Repositorio loom-py: https://github.com/loom-ai-org/loom-py
- Repositorio misaki (hexgrad): https://github.com/hexgrad/misaki
- Repositorio Paradee (G2P): https://github.com/sahilmahendrakar/paradee
