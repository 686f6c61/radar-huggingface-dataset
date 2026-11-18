# ibm-granite/granite-speech-5.0-470m-turboctc

## Resumen

Granite Speech 5.0 470M TurboCTC es un modelo de reconocimiento automático del habla (ASR) desarrollado por IBM dentro de la familia Granite. Se trata de un modelo compacto de 472.993.792 parámetros (aproximadamente 470M) diseñado para transcripción multilingüe de alta velocidad, pensado para su despliegue en portátiles, teléfonos y otros dispositivos de borde (edge). La versión actual, publicada el 21 de octubre de 2026, amplía la versión original en inglés (25 de agosto de 2026) a siete idiomas: inglés, francés, alemán, español, portugués, italiano y japonés.

El modelo emplea una arquitectura CTC (Connectionist Temporal Classification) con un codificador acústico de tipo conformer con self-attention por bloques, self-conditioning y downsampling temporal. La inferencia es no autorregresiva mediante decodificación greedy, lo que se traduce en una latencia muy baja y un alto throughput, características clave para aplicaciones empresariales de transcripción en tiempo real. La capa de salida corresponde a 16.384 unidades BPE multilingües y el modelo produce transcripciones con puntuación y mayúsculas nativas.

Su relevancia actual radica en que combina un tamaño muy reducido (menos de 500M de parámetros) con un rendimiento que, según el autor, supera al modelo Granite Speech 5.0 de 2B en las tres pruebas de japonés reportadas, y mejora el WER medio en inglés de la versión anterior (5,51% frente a 5,78%) pese a añadir seis idiomas. Todo ello bajo licencia Apache 2.0, lo que facilita su uso comercial y su integración en productos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer acoustic encoder con block self-attention, self-conditioning y downsampling temporal; cabeza CTC |
| Parametros totales | 472.993.792 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo ASR de formato corto; no se especifica ventana de audio máxima) |
| Tipos de cuantizacion | GGUF Q8_0 (recomendado), Q6_K a Q4_K_M (conversión comunitaria); cuantizaciones adicionales no disponibles |
| Idiomas soportados | Inglés, francés, alemán, español, portugués, italiano y japonés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 5,7 GB); GGUF disponible en conversión comunitaria |

## Arquitectura y entrenamiento

El modelo se basa en un codificador acústico de tipo conformer con self-attention por bloques, self-conditioning y downsampling temporal. Sobre la representación del codificador se aplica una capa de salida CTC con 16.384 unidades BPE multilingües. La inferencia es no autorregresiva con decodificación greedy, lo que elimina la latencia asociada a la generación token a token y permite un procesamiento muy rápido del audio. El front-end es un extractor log-mel que puede computarse directamente en el acelerador del modelo.

El entrenamiento se realizó sobre aproximadamente 153.000 horas de audio multilingüe procedente de corpus públicos, utilizando la función de pérdida CTC. No se especifica en la información disponible si hubo fases de RLHF, DPO u otras técnicas de alineación posteriores, ni la composición detallada del dataset por idioma. La innovación técnica principal es la combinación de un modelo CTC compacto con puntuación y mayúsculas nativas en siete idiomas, manteniendo una velocidad de inferencia adecuada para dispositivos de borde.

## Capacidades

- Reconocimiento automático del habla multilingüe en inglés, francés, alemán, español, portugués, italiano y japonés.
- Transcripción con puntuación y mayúsculas nativas, sin necesidad de un modelo de postprocesado separado.
- Inferencia no autorregresiva con decodificación greedy, orientada a baja latencia y alto throughput.
- Procesamiento por lotes de múltiples muestras de audio (batch decoding).
- Ejecución en dispositivos de borde: portátiles, smartphones y hardware con recursos limitados.
- Compatibilidad nativa con `transformers>=5.16.0` mediante `AutoModelForCTC` y `AutoProcessor`.
- Soporte en Apple Silicon (chips M series) a través de `mlx-audio` (versión 0.5.1 o superior).
- Inferencia local en GGUF mediante `transcribe.cpp` sobre Metal, Vulkan, CUDA, ROCm o CPU, sin Python en tiempo de ejecución.
- No se documentan en la información disponible capacidades de tool calling, agentes, visión, audio generation ni modo de razonamiento extendido.

## Casos de uso

- Transcripción de reuniones y notas de voz en empresas multinacionales: el modelo cubre siete idiomas con un único artefacto, lo que simplifica el despliegue y evita mantener un modelo distinto por idioma. Su tamaño de 470M permite ejecutarlo en servidores modestos o incluso en portátiles de empleados.
- Subtitulado y transcripción en tiempo real: la decodificación greedy no autorregresiva y el codificador conformer con downsampling temporal reducen la latencia, lo que lo hace adecuado para generar subtítulos en directo o para asistentes de voz con respuesta rápida.
- Aplicaciones móviles de dictado y accesibilidad: al caber en dispositivos de borde y estar disponible en GGUF con cuantización Q8_0 o inferior, puede integrarse en apps de smartphones o portátiles sin depender de la nube, preservando la privacidad del audio.
- Análisis de grabaciones de contact center: el alto throughput permite procesar grandes volúmenes de llamadas en lote para su clasificación, búsqueda o cumplimiento normativo, con transcripciones ya puntuadas y capitalizadas que reducen el postprocesado.
- Generación de actas y documentación a partir de audio corporativo: la puntuación y mayúsculas nativas facilitan la legibilidad directa de la transcripción y su integración en sistemas de gestión documental o motores de búsqueda.
- Investigación en ASR multilingüe y evaluación comparativa: al ser Apache 2.0 y estar integrado en el Open ASR leaderboard, sirve como línea base reproducible para experimentos de reconocimiento de habla en siete idiomas, incluido japonés con métricas CER.
- Despliegue en entornos sin Python o con requisitos de seguridad estrictos: `transcribe.cpp` permite ejecutar el modelo desde un binario nativo en CPU, Metal, Vulkan, CUDA o ROCm, lo que encaja en sistemas embebidos o pipelines de producción con dependencias mínimas.

## Benchmarks y rendimiento

Los resultados publicados en la model card se presentan de forma gráfica (imágenes) y no como tablas numéricas completas. Los datos textuales explícitos son los siguientes:

| Benchmark / conjunto | Métrica | Resultado | Referencia |
|---|---|---|---|
| Open ASR leaderboard (inglés, media de 9 test sets) | WER medio | 5,51% | 5,78% de la versión anterior solo en inglés |
| Japonés: CSJ eval1 | CER | No disponible (supera a granite-speech-5.0-2b) | granite-speech-5.0-2b |
| Japonés: CommonVoice-17 | CER | No disponible (supera a granite-speech-5.0-2b) | granite-speech-5.0-2b |
| Japonés: FLEURS | CER | No disponible (supera a granite-speech-5.0-2b) | granite-speech-5.0-2b |
| Multilingüe: FLEURS, CommonVoice, MLS (de, es, fr, it, pt) | WER | No disponible (comparación gráfica frente al mejor modelo open-weights de cada organización) | Varios |

No se han publicado en la información disponible los valores numéricos desagregados por idioma ni por conjunto de test para las evaluaciones multilingües; solo se indica que están representados en las figuras de la model card. Los resultados oficiales del Open ASR leaderboard corresponden todavía a la versión solo en inglés, según la propia model card.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en safetensors en precisión nativa, el repositorio ocupa 5,7 GB, por lo que se requiere aproximadamente esa cantidad de memoria o algo más para activaciones. Con cuantización GGUF Q8_0 el peso se reduce de forma sustancial; Q6_K y Q4_K_M reducen aún más el requisito, aunque no se publican cifras exactas de VRAM por cuantización.
- GPU recomendadas: el modelo está pensado para dispositivos de borde, por lo que no requiere GPU de centro de datos. Puede ejecutarse en CPU, en GPUs de consumo y en aceleradores integrados. Para despliegues de alto throughput en servidor se puede usar cualquier GPU moderna compatible con PyTorch; no se especifican modelos concretos (A100, H100, RTX 4090) en la información disponible.
- Cabe en GPU de consumo: sí, dado su tamaño de 470M de parámetros. También está soportado en Apple Silicon mediante `mlx-audio`.
- Opciones de despliegue: `transformers>=5.16.0` con `AutoModelForCTC`; `mlx-audio` en chips M series; `transcribe.cpp` con GGUF sobre Metal, Vulkan, CUDA, ROCm o CPU. No se documentan en la información disponible integraciones con vLLM, TGI, llama.cpp u Ollama.
- Latencia y throughput: no se publican cifras concretas de latencia ni de RTFx en la información textual disponible; la model card incluye una gráfica de precisión frente a velocidad (Pareto RTFx) en el Open ASR leaderboard, pero sin valores numéricos extraíbles.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Contexto / formato | Licencia | Notas |
|---|---|---|---|---|---|
| granite-speech-5.0-470m-turboctc | 472.993.792 | 7 (en, fr, de, es, pt, it, ja) | Audio de formato corto; CTC no autorregresivo | Apache 2.0 | WER medio en inglés 5,51%; supera en CER de japonés a granite-speech-5.0-2b |
| granite-speech-5.0-2b | No disponible (2B según la model card) | No disponible en detalle; incluye japonés | No disponible | No disponible en la información | Referencia de IBM de mayor tamaño; superado por el 470M en las tres pruebas de japonés reportadas |
| Modelos open-weights de otras organizaciones en el Open ASR leaderboard multilingüe | No disponible | de, es, fr, it, pt | No disponible | No disponible | La model card los usa como referencia gráfica; no se detallan nombres ni cifras |

No se dispone en la información proporcionada de una comparativa numérica detallada frente a alternativas concretas de otros fabricantes (por ejemplo, Whisper u otros modelos ASR open-weights). La comparación disponible se limita al modelo hermano de 2B y a las referencias gráficas del Open ASR leaderboard.

## Limitaciones y advertencias

- El modelo está diseñado para audio de formato corto; no se especifica en la información disponible su comportamiento en audio de muy larga duración ni una ventana máxima de contexto.
- Aunque la licencia Apache 2.0 permite uso comercial, no se documentan en la información disponible análisis de sesgos por idioma, acento, género o dialecto; el rendimiento puede variar entre las siete lenguas soportadas.
- Riesgo de alucinación y errores de transcripción inherentes a los modelos CTC, especialmente en audio con ruido, solapamiento de hablantes o acentos no representados en los corpus de entrenamiento.
- La puntuación y las mayúsculas son nativas, pero no se detalla su tasa de error ni su comportamiento en idiomas con convenciones tipográficas distintas del inglés (por ejemplo, japonés).
- Los resultados de benchmarks multilingües se presentan solo en forma gráfica; no hay cifras numéricas desagregadas que permitan una verificación independiente a partir de la información disponible.
- La entrada del leaderboard oficial del Open ASR corresponde a la versión solo en inglés; los resultados de la versión multilingüe son, según la model card, no oficiales en ese leaderboard.
- El soporte en `transformers` requiere la versión 5.16.0 o superior, y el soporte en Apple Silicon requiere `mlx-audio` 0.5.1 o superior; versiones anteriores pueden no funcionar.
- La conversión a GGUF es comunitaria (repositorio de `vladers`), no oficial de IBM, por lo que su calidad y mantenimiento no están garantizados por el autor del modelo.
- No se documentan en la información disponible capacidades de diarización de hablantes, detección de idioma automática ni traducción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ibm-granite/granite-speech-5.0-470m-turboctc
- Revisión anterior solo en inglés: https://huggingface.co/ibm-granite/granite-speech-5.0-470m-turboctc/tree/947f59af40db9791170a0628cf0f3f4812d720f1
- Modelo hermano de 2B: https://huggingface.co/ibm-granite/granite-speech-5.0-2b
- Open ASR leaderboard: https://huggingface.co/spaces/hf-audio/open_asr_leaderboard
- Conversión comunitaria a GGUF: https://huggingface.co/vladers/granite-speech-5.0-470m-turboctc-GGUF
- transcribe.cpp (repositorio): https://github.com/handy-computer/transcribe.cpp
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Paper de referencia (arXiv): arxiv:2609.20104
