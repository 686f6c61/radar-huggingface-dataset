# Phoonnx/vits-cy_gb-gwryw_gogleddol-medium-espeak

## Resumen
El modelo `vits-cy_gb-gwryw_gogleddol-medium-espeak` es un sintetizador de voz (text-to-speech) basado en la arquitectura VITS, desarrollado originalmente por Rhasspy dentro del proyecto Piper y reempaquetado por Phoonnx para su librería ONNX homónima. Resuelve el problema de la síntesis de voz en galés (variedad `cy-GB`, concretamente la voz `gwryw_gogleddol`, es decir, voz masculina del norte) en entornos de ejecución ligeros y multiplataforma, sin necesidad de infraestructura de GPU dedicada.

El modelo se distribuye como un artefacto ONNX de aproximadamente 0,1 GB, lo que lo sitúa en la categoría de TTS "medium" de Piper: calidad razonable con un coste computacional contenido. La entrada de texto no es texto plano directo, sino fonemas en alfabeto IPA generados por espeak-ng, lo que condiciona tanto la integración como la fidelidad de la pronunciación.

Su relevancia actual radica en que cubre un idioma de bajos recursos (galés) dentro de un ecosistema de código abierto (Phoonnx, OVOS, scriptconv) que permite desplegar TTS en asistentes locales, aplicaciones de accesibilidad y sistemas embebidos sin depender de servicios en la nube. La licencia MIT del upstream facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS, entrada por fonemas) |
| Tipos de cuantizacion | no disponible (pesos ONNX; el repo no detalla variantes) |
| Idiomas soportados | galés (`cy`, variante `cy-GB`) |
| Licencia | MIT |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento
VITS es una arquitectura end-to-end de síntesis de voz que combina un encoder de texto, un prior variacional condicionado por alineamiento monotónico (MAS), un decoder generativo basado en flujos normalizadores y un discriminador adversarial multiperiodo durante el entrenamiento. El resultado es un modelo que genera waveforms directamente a partir de fonemas, sin vocoder externo separado.

Este artefacto concreto es un reempaquetado del modelo original de Rhasspy (`rhasspy/piper-voices/cy/cy_GB/gwryw_gogleddol/medium`), por lo que los datos de entrenamiento (número de tokens, composición del corpus, uso de RLHF/DPO) no se detallan en la información disponible. La innovación relevante aquí no es arquitectónica sino de empaquetado: exportación a ONNX y adaptación al pipeline de Phoonnx, con un front-end de texto que delega en `scriptconv` y en el fonemizador `EspeakPhonemizer` para producir la secuencia IPA de entrada.

## Capacidades
- Síntesis de voz a partir de texto en galés (`cy-GB`), con salida en formato WAV.
- Generación de fonemas IPA mediante espeak-ng como paso previo obligatorio.
- Ejecución en CPU mediante ONNX Runtime, sin requerir GPU.
- Integración con asistentes OVOS a través del plugin `ovos-tts-plugin-phoonnx`.
- Ejecución en navegador mediante `phoonnx.js` (con entrada espeak o unicode).
- Normalización y conversión de texto delegadas a `scriptconv`.
- No soporta tool calling, agentes, razonamiento multi-paso ni modalidades distintas de audio.
- No es multilingüe: únicamente galés.

## Casos de uso
- **Asistentes de voz locales en OVOS**: el modelo se integra como plugin TTS (`ovos-tts-plugin-phoonnx`) y permite dotar de voz galesa a un asistente doméstico autoalojado sin conexión a internet, gracias a su ejecución en CPU vía ONNX.
- **Accesibilidad para lectores de pantalla en galés**: aplicaciones de lectura de texto que necesiten vocalizar contenido en galés pueden invocar el modelo localmente, con latencia baja y sin enviar texto a servicios externos.
- **Locución de contenido web y podcasts**: generación por lotes de audio a partir de artículos o guiones en galés, usando el pipeline `phoonnx` + `scriptconv` para normalizar números, abreviaturas y signos antes de la fonemización.
- **Señalización y anuncios automatizados**: sistemas de megafonía en estaciones, museos o edificios públicos que requieran anuncios pregrabados o dinámicos en galés, con despliegue en hardware modesto.
- **Prototipado de interfaces conversacionales en lenguas minoritarias**: investigadores que trabajen en preservación o revitalización del galés pueden usar este modelo como baseline TTS reproducible y de licencia permisiva.
- **Integración en aplicaciones web**: mediante `phoonnx.js` y el demo de TigreGotico, se puede ofrecer síntesis de voz galesa en el navegador sin backend, útil para materiales educativos interactivos.
- **Generación de datasets de audio sintético**: creación de corpus de voz en galés para entrenamiento de modelos ASR o para aumentación de datos, dado el bajo coste de inferencia.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada: no aplica para inferencia en CPU; en GPU, el modelo ONNX de ~0,1 GB ocupa una fracción mínima de memoria (por debajo de 1 GB en la mayoría de configuraciones).
- GPU recomendadas: no es necesario GPU; cualquier GPU con soporte ONNX Runtime (por ejemplo, RTX 4090, A100, H100) puede ejecutarlo, pero no aporta ventajas significativas frente a CPU para este tamaño.
- Cabe en cualquier GPU de consumo e incluso en dispositivos embebidos (Raspberry Pi y similares) gracias al tamaño reducido del artefacto ONNX.
- Opciones de despliegue: `phoonnx` (Python), `ovos-tts-plugin-phoonnx` (OVOS), `phoonnx.js` (navegador). No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a TTS).
- Latencia y throughput: no disponibles en la información proporcionada; dependen del hardware y de la longitud del texto.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Tamano | Licencia | Formato |
|---|---|---|---|---|---|
| `vits-cy_gb-gwryw_gogleddol-medium-espeak` (este) | VITS | Galés (cy-GB) | ~0,1 GB | MIT | ONNX |
| Otras voces Piper `cy_GB` (p. ej. `cy_GB` femeninas de piper-voices) | VITS | Galés (cy-GB) | ~0,1 GB (típico) | MIT (upstream) | ONNX |
| Modelos TTS multilingües tipo XTTS / MMS-TTS | VITS / transformer | Multilingüe | Mayor (cientos de MB a GB) | Varía (MPL-2.0, CC-BY-NC, etc.) | PyTorch / ONNX |

No se dispone de datos de benchmarks comparativos en la información proporcionada; la comparación se limita a parámetros estructurales y de licencia.

## Limitaciones y advertencias
- **Dependencia de espeak-ng**: sin espeak-ng instalado, la fonemización puede desviarse; el propio autor advierte que el port `espyak` produce fonemas distintos y puede pronunciar mal algunas palabras.
- **Idioma único**: solo galés `cy-GB`; no es adecuado para otros idiomas ni para mezcla de lenguas.
- **Voz única**: corresponde a una voz masculina del norte (`gwryw_gogleddol`); no hay variedad de hablantes ni control de estilo.
- **Riesgo de alucinación acústica**: como todo TTS, puede generar pronunciaciones incorrectas ante texto no normalizado, siglas, neologismos o nombres propios; se recomienda revisar el front-end de normalización.
- **Sesgos**: no documentados en la información disponible; al derivar de un corpus de Piper, puede reflejar las características del hablante y del dominio de entrenamiento original.
- **Licencia**: MIT según el upstream; conviene verificar los términos del corpus original de Piper antes de uso comercial a gran escala.
- **Madurez**: repositorio con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de validación comunitaria extensa.
- **Sin benchmarks publicados**: no hay métricas objetivas (MOS, WER, RTF) en la información disponible.

## Enlaces
- [Hugging Face: Phoonnx/vits-cy_gb-gwryw_gogleddol-medium-espeak](https://huggingface.co/Phoonnx/vits-cy_gb-gwryw_gogleddol-medium-espeak)
- [Upstream: rhasspy/piper-voices/cy/cy_GB/gwryw_gogleddol/medium](https://huggingface.co/rhasspy/piper-voices/tree/main/cy/cy_GB/gwryw_gogleddol/medium)
- [Repositorio phoonnx](https://github.com/TigreGotico/phoonnx)
- [Repositorio scriptconv](https://github.com/TigreGotico/scriptconv)
- [Repositorio phoonnx.js](https://github.com/TigreGotico/phoonnx.js)
- [Demo en vivo](https://tigregotico.pt/demo)
- [Colección VITS de Phoonnx](https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65)
