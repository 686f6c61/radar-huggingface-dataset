# AEmotionStudio/midi-llm-models

## Resumen

MIDI-LLM es un modelo de lenguaje adaptado para la generación de música simbólica en formato MIDI a partir de descripciones textuales. Este repositorio concreto, `AEmotionStudio/midi-llm-models`, es un espejo verificado del checkpoint `slseanwu/MIDI-LLM_Llama-3.2-1B`, publicado por AEmotionStudio para integrarse en el panel MIDI-LLM de su estación de trabajo de audio MAESTRO. El modelo parte de Llama-3.2-1B y extiende su vocabulario con 55 030 tokens MIDI del Anticipatory Music Transformer, lo que le permite generar secuencias multi-instrumento con resolución de 10 ms (tripletas de tiempo de inicio, duración e instrumento-pitch).

La relevancia actual reside en que ofrece una vía ligera y eficiente para la generación de música simbólica mediante un LLM de 1 700 millones de parámetros, con licencia Llama 3.2 que permite uso comercial bajo ciertas condiciones. Aunque no se publican benchmarks en la información disponible, el modelo está respaldado por una publicación en ISMIR 2026 y por un entrenamiento en corpus musicales amplios como MusicPile, GigaMIDI y Lakh MIDI.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLM (Transformer decoder) |
| Parametros totales | 1 723 885 568 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no especificada (el base Llama-3.2-1B soporta 128k, pero no se confirma tras el fine-tuning) |
| Tipos de cuantizacion | bf16 (safetensors) |
| Idiomas soportados | no especificados (el base Llama-3.2 es multilingüe, pero no se detalla) |
| Licencia | Llama 3.2 Community License |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer decoder basado en Llama-3.2-1B, con el vocabulario original de texto (128 256 tokens) ampliado con 55 030 tokens MIDI del Anticipatory Music Transformer (tripletas de onset, duración e instrumento-pitch a resolución de 10 ms). El vocabulario total resultante es de 183 286 tokens. El entrenamiento consistió en una continuación de pre-entrenamiento sobre los corpus MusicPile y GigaMIDI, seguida de un fine-tuning supervisado sobre el dataset Lakh MIDI emparejado con captions de MidiCaps. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación. La generación se realiza muestreando tokens MIDI (temperatura 1.0, top-p 0.98) hasta 2 046 tokens nuevos, aproximadamente 680 notas.

## Capacidades

- Generación de música simbólica MIDI multi-instrumento a partir de descripciones en lenguaje natural (género, estado de ánimo, instrumentos por nombre General MIDI, tonalidad, compás, tempo, progresión de acordes).
- Decodificación tolerante de tokens MIDI mediante un parser integrado en MAESTRO, sin necesidad de instalar la librería `anticipation`.
- Soporte para un patrón por instrumento en el piano roll, pensado para flujo de trabajo en DAW.
- No se documentan capacidades de tool calling, agentes, visión ni audio en la información disponible.

## Casos de uso

- Composición musical asistida: un compositor describe una pieza en texto ("un vals lento en do mayor con piano y violín") y el modelo genera la partitura MIDI que se puede importar directamente en un DAW o editor de partituras.
- Generación de bandas sonoras para videojuegos: permite crear pistas de ambiente o temas por nivel sin necesidad de conocimientos avanzados de teoría musical, integrando el resultado en el pipeline de desarrollo.
- Prototipado rápido de ideas: los productores pueden generar varias variaciones de una idea melódica o armónica en segundos y seleccionar la más prometedora para trabajar sobre ella.
- Educación musical: estudiantes pueden experimentar con descripciones textuales y escuchar cómo se traducen en notación MIDI, facilitando la comprensión de conceptos como tonalidad, tempo o instrumentación.
- Generación de música de fondo para vídeo: creadores de contenido pueden producir pistas libres de derechos describiendo el ambiente deseado (por ejemplo, "música electrónica alegre a 120 BPM") y ajustar después la duración.
- Integración en estaciones de trabajo de audio: MAESTRO incorpora el modelo en su panel MIDI-LLM, permitiendo a los usuarios generar patrones por instrumento directamente en el piano roll sin salir de la aplicación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de métricas objetivas como MMLU, HumanEval o métricas específicas de generación musical (por ejemplo, exactitud de notas, coherencia armónica) que permitan comparar cuantitativamente este modelo con alternativas.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 3,5 GB para los pesos, más overhead de activaciones y cache, lo que supone un consumo total de unos 4–6 GB según la longitud de secuencia. Cabe en GPUs de consumo con 8 GB o más.
- GPUs recomendadas: NVIDIA RTX 3060 (12 GB), RTX 4060 (8 GB), RTX 4070 o superiores; también funciona en GPUs de datacenter como A10 o A100 si se necesita mayor throughput.
- Opciones de despliegue: se puede cargar con `transformers` (AutoModelForCausalLM) directamente; también es compatible con vLLM o TGI para inferencia en producción, y puede convertirse a GGUF para usarse con llama.cpp u Ollama, aunque no se proporcionan archivos cuantizados oficiales.
- Latencia y throughput: no se especifican en la documentación. Como referencia orientativa, un modelo de 1,7B en bf16 en una RTX 4090 podría generar unos 50–100 tokens/s, pero estos valores dependen de la implementación y la longitud de secuencia.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados que permitan contrastar este modelo con otras soluciones de text-to-MIDI como MusicGen (que genera audio, no MIDI), MuseNet (cerrado) o modelos simbólicos como Anticipatory Music Transformer. La información disponible no incluye benchmarks comparativos con alternativas de la misma categoría.

## Limitaciones y advertencias

- La licencia Llama 3.2 Community License permite uso comercial solo si el producto final tiene menos de 700 millones de usuarios activos mensuales; además, cualquier redistribución debe incluir la atribución "Built with Llama" y el texto de la licencia.
- El modelo puede generar secuencias musicales con errores armónicos o rítmicos (alucinaciones musicales), especialmente si la descripción textual es ambigua o contiene términos poco frecuentes en los datos de entrenamiento.
- La longitud de contexto no está confirmada tras el fine-tuning; aunque el base soporta 128k tokens, la generación de MIDI se limita a 2 046 tokens nuevos, lo que restringe la duración de las composiciones.
- El modelo solo genera representación simbólica MIDI, no audio; es necesario un sintetizador externo para escuchar el resultado.
- No se han publicado evaluaciones de sesgos ni de robustez ante descripciones adversas o fuera de distribución.
- El repositorio es un espejo sin modificaciones; no se incluyen scripts de entrenamiento ni datos de evaluación propios.

## Enlaces

- Repositorio HuggingFace del espejo: https://huggingface.co/AEmotionStudio/midi-llm-models
- Repositorio HuggingFace del modelo original: https://huggingface.co/slseanwu/MIDI-LLM_Llama-3.2-1B
- Código oficial de MIDI-LLM (GitHub): https://github.com/slSeanWU/MIDI-LLM
- Anticipatory Music Transformer (GitHub): https://github.com/jthickstun/anticipation
- Licencia Llama 3.2 Community License: https://www.llama.com/llama3_2/license/
