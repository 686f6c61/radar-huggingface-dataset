# Phoonnx/vits-kbd-male-graphemes

## Resumen

`vits-kbd-male-graphemes` es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura VITS, entrenado originalmente por el usuario `anzorq` (repositorio upstream `anzorq/kbd-vits-tts-male`) y reempaquetado por `Phoonnx` en formato ONNX para su uso con la librería `phoonnx`. El modelo genera voz masculina en cabardiano (código ISO `kbd`), una lengua circasiana del Cáucaso septentrional, a partir de texto de entrada en forma de grafemas, sin necesidad de un fonemizador específico del idioma.

El problema que resuelve es la disponibilidad de TTS para una lengua de bajos recursos: permite integrar síntesis de voz en cabardiano dentro de asistentes y aplicaciones mediante un runtime ONNX ligero. Su relevancia es práctica más que investigadora: es un artefacto de despliegue, no un modelo de nueva generación, y su interés principal reside en que amplía la cobertura idiomática de la pila OVOS/phoonnx.

El repositorio ocupa 0,1 GB, lo que sugiere un modelo compacto típico de VITS (del orden de decenas de millones de parámetros), aunque no se publican cifras exactas de parámetros ni de longitud de contexto. La fecha de creación indicada (noviembre de 2026) es la que figura en los metadatos del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (text-to-speech, extremo a extremo) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (entrada por grafemas, sin ventana declarada) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX) |
| Idiomas soportados | cabardiano (`kbd`) |
| Licencia | MIT |
| Formato de pesos | ONNX |
| Autor original | anzorq |
| Empaquetado por | Phoonnx |
| Tamano del repositorio | 0,1 GB |
| Front-end de texto | `GraphemePhonemizer` (scriptconv) |

## Arquitectura y entrenamiento

VITS es un modelo generativo extremo a extremo que combina un codificador de texto, un prior variacional, un decodificador basado en flujos normalizadores y un discriminador adversarial multiperiodo durante el entrenamiento, con alineamiento monotónico aprendido (MAS). Esta arquitectura sintetiza forma de onda directamente a partir de la secuencia de entrada, sin vocoder externo separado.

En este caso, la entrada se realiza a nivel de grafemas mediante `GraphemePhonemizer` de la librería `scriptconv`, que normaliza el texto y lo convierte en la secuencia de entrada del modelo. No se dispone de información sobre el corpus de entrenamiento (número de horas, hablantes, composición del dataset) ni sobre si se aplicaron técnicas de ajuste adicionales. El modelo se distribuye exclusivamente como artefacto ONNX para inferencia con `phoonnx`; no se ofrecen pesos en safetensors ni GGUF.

## Capacidades

- Síntesis de voz (text-to-speech) de voz masculina en cabardiano (`kbd`).
- Entrada basada en grafemas: no requiere transcripción fonética previa del texto.
- Generación de audio en formato WAV mediante la API de `phoonnx` (`synthesize_wav`).
- Integración con el ecosistema OVOS a través del plugin `ovos-tts-plugin-phoonnx`.
- Ejecución en runtime ONNX, lo que facilita despliegue en entornos con CPU y sin dependencias pesadas de deep learning.
- No soporta tool calling, agentes, razonamiento multi-paso, visión ni audio de entrada; es un modelo puramente TTS.

## Casos de uso

- **Asistentes de voz en cabardiano**: integración en OVOS mediante `ovos-tts-plugin-phoonnx` para que un asistente doméstico responda oralmente en `kbd`, seleccionando la voz en `mycroft.conf`.
- **Lectura de contenido en pantalla**: conversión de texto cabardiano (noticias, artículos, documentación) a audio para aplicaciones de accesibilidad o lectura por voz.
- **Locución para contenido multimedia**: generación de narración masculina en cabardiano para vídeos, audiolibros o material educativo de lenguas circasianas.
- **Sistemas de anuncios y megafonía**: síntesis de avisos pregrabados o dinámicos en entornos públicos donde se requiera cabardiano.
- **Prototipado de interfaces de voz**: validación rápida de flujos conversacionales en `kbd` usando el runtime ONNX ligero antes de invertir en un modelo de mayor calidad.
- **Investigación en lenguas de bajos recursos**: uso como línea base de TTS en cabardiano para comparaciones y experimentos de adaptación o mejora.
- **Aplicaciones offline en dispositivos modestos**: al distribuirse en ONNX y ocupar 0,1 GB, puede ejecutarse en entornos sin GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión; por el tamaño del repositorio (0,1 GB) y la naturaleza de VITS, la inferencia cabe holgadamente en CPU y en cualquier GPU consumer.
- GPU recomendadas: no se especifican; el modelo está pensado para ejecución ONNX, incluida CPU.
- GPU consumer: previsiblemente compatible con cualquier GPU con unos pocos GB de memoria, aunque no se publican requisitos oficiales.
- Opciones de despliegue: `phoonnx` (Python) y el plugin `ovos-tts-plugin-phoonnx` para OVOS. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a TTS en este formato).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|---|---|
| `Phoonnx/vits-kbd-male-graphemes` | VITS | `kbd` (cabardiano) | no disponible | no disponible | MIT | ONNX |
| `anzorq/kbd-vits-tts-male` (upstream) | VITS | `kbd` | no disponible | no disponible | MIT | no disponible |
| Otros modelos de la colección VITS de Phoonnx | VITS | varios | no disponible | no disponible | variable | ONNX |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Cobertura monolingüe: solo cabardiano (`kbd`); el texto en otros idiomas producirá resultados incorrectos.
- Voz única masculina: no hay variantes de voz ni control de estilo documentados.
- Entrada por grafemas: la calidad depende de la normalización de `scriptconv`; no se emplea un fonemizador específico del idioma, lo que puede afectar a la pronunciación de palabras irregulares.
- No se publican métricas de calidad (MOS, inteligibilidad) ni detalles del corpus de entrenamiento, por lo que la calidad real no es verificable a priori.
- Riesgo de alucinación acústica: como todo modelo generativo de audio, puede producir artefactos o pronunciaciones erróneas en entradas fuera de distribución.
- Licencia MIT: permite uso comercial, pero conviene verificar la procedencia y licencia del corpus original del upstream antes de un despliegue en producción.
- Popularidad muy baja (18 descargas, 0 likes): escaso soporte comunitario y validación limitada.
- Dependencia de la librería `phoonnx` en versión preliminar (`pip install --pre phoonnx`), lo que implica posible inestabilidad de API.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-kbd-male-graphemes
- Modelo upstream: https://huggingface.co/anzorq/kbd-vits-tts-male
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
- Librería scriptconv: https://github.com/TigreGotico/scriptconv
- Colección VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
