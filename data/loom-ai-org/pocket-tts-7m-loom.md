# loom-ai-org/pocket-tts-7m-loom

## Resumen

Pocket TTS 7M (English) es un modelo de síntesis de voz (text-to-speech) de 7,1 millones de parámetros, destilado por Kyutai a partir de su Pocket TTS y ajustado con *reward fine-tuning* (publicado en octubre de 2026). Este repositorio no es el checkpoint original, sino su exportación a loom.cpp: un único fichero GGUF autodescriptivo que incluye las topologías de grafo, el tokenizador y el script de ejecución necesarios para inferir sin dependencias externas. Lo publica `loom-ai-org`, la organización detrás del motor loom.cpp y del runtime `loom-py`.

La arquitectura no es un transformer de texto convencional: el modelo se compone de un *flow language model* de 4,2 M de parámetros que opera sobre latentes del códec Mimi, más un decodificador de 2,6 M de parámetros que produce la forma de onda a 24 kHz. El propio modelo codifica el texto, de modo que no requiere fonemizador ni librería de pronunciación, y lleva una voz incorporada (`alba`), con otras 26 voces disponibles como ficheros separados.

Su relevancia está en la relación tamaño/coste: 7 M de parámetros y un repositorio de 0,1 GB permiten ejecutar TTS en CPU, dispositivos empotrados o móvil, sin GPU dedicada. Como contrapartida, es una destilación explícitamente orientada a tamaño y no a calidad máxima, y hereda las restricciones de uso de Kyutai sobre suplantación de voz y clonación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de lenguaje de flujo (*flow language model*) de 4,2 M de parámetros sobre latentes del códec Mimi + decodificador de 2,6 M de parámetros; exportado como grafo GGUF para loom.cpp |
| Parametros totales | 7.120.881 (7,1 M) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | F32 (sin cuantizar, verificado contra la referencia) y al menos una variante cuantizada; los tipos y nombres de fichero concretos no estan detallados en la informacion disponible |
| Idiomas soportados | Ingles (`en`) |
| Licencia | CC-BY-4.0, heredada de `kyutai/pocket-tts`; se mantienen las restricciones de uso de Kyutai y las licencias propias de cada voz |
| Formato de pesos | GGUF autodescriptivo (grafos, tokenizador y driver embebidos), generado con loom-exporter |

## Arquitectura y entrenamiento

El modelo separa generación de latentes y síntesis de audio. Un modelo de lenguaje de flujo de 4,2 M de parámetros modela latentes del códec neural Mimi, y un decodificador de 2,6 M de parámetros reconstruye la señal a una frecuencia de muestreo de 24 kHz (valor que el usuario debe pasar explícitamente, ya que el checkpoint no lo declara necesariamente). El *front end* de texto está integrado en el propio modelo: aplica la regla `replace_characters` de la referencia y la regla v4 de punto decimal, lo que exige `loom-py-rt` 1.0.0rc19 o superior para reproducir el comportamiento exacto con guiones, comillas tipográficas y puntos entre cifras.

El entrenamiento parte de `kyutai/pocket-tts`: es una destilación a 7 M de parámetros con *reward fine-tuning*, y la propia model card indica que sacrifica calidad frente al modelo completo. La exportación a loom.cpp conserva los parámetros sin modificar en el fichero F32 y deriva de ellos las versiones cuantizadas. La decodificación es estocástica por defecto, con la temperatura del checkpoint (0,3), de modo que dos llamadas producen resultados distintos salvo que se fije `seed`. No se detallan en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni el pipeline de alineación más allá de la mención al *reward fine-tuning*.

## Capacidades

- Síntesis de voz a partir de texto en inglés, con salida de audio a 24 kHz.
- Codificación de texto propia: no necesita fonemizador externo ni dependencias de pronunciación.
- Voz incorporada (`alba`) utilizable sin configuración adicional.
- Selección entre 27 voces: la incorporada más 26 ficheros de voz en `voices/`, invocados por nombre (descarga desde el repositorio la primera vez) o por ruta a un fichero propio.
- Ficheros de voz vinculados criptográficamente a estos pesos mediante huella (*fingerprint*), de forma que no son intercambiables con otras tallas de Pocket TTS ni con el modelo completo.
- Control de reproducibilidad mediante `seed` y acceso a los parámetros del driver embebido a través de `model.infer(...)` y `model.driver_source`.
- Introspección del tokenizador y de las voces disponibles desde la API (`model.tokenizer`, `model.voices`).
- No incluye el codificador Mimi, por lo que no soporta clonación de voz a partir de una grabación.
- No dispone de tool calling, capacidades de agente, visión ni procesamiento multimodal.

## Casos de uso

- **Lectura de contenido en dispositivos empotrados**: con 7,1 M de parámetros, el modelo cabe en una Raspberry Pi o en un móvil y permite leer notificaciones, artículos o interfaces de accesibilidad sin conexión ni GPU, usando el runtime loom-py sobre el GGUF.
- **Accesibilidad y lectores de pantalla**: integración en aplicaciones de escritorio que conviertan texto en audio en tiempo de ejecución; el modelo no necesita fonemizador, lo que simplifica el empaquetado y elimina dependencias nativas pesadas.
- **Avisos e IVR en sistemas telefónicos**: generación previa de prompts de voz a 24 kHz para centralitas y mensajes de espera, con voces con licencia CC0 o CC-BY según el uso comercial previsto.
- **Prototipado rápido de asistentes conversacionales**: validación de flujos de voz antes de invertir en un modelo TTS mayor, usando `pocket-tts-loom` o el modelo completo de Kyutai como paso posterior si la calidad resulta insuficiente.
- **Generación de datos sintéticos de audio para pruebas**: creación de corpus de audio en inglés para testear pipelines ASR, sistemas de subtitulado o herramientas de diarización, controlando la semilla para reproducir conjuntos concretos.
- **Pruebas de regresión en CI/CD de infraestructura de voz**: al ser un GGUF pequeño y determinista con `seed`, sirve como caso de prueba fijo para verificar versiones del runtime, cambios en el tokenizador o regresiones en el *front end* de texto.
- **Audiolibros y boletines automatizados de bajo coste**: síntesis por lotes de textos largos en servidores sin GPU, aceptando la menor calidad de una destilación de 7 M a cambio de un coste de cómputo mínimo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente declara que el modelo es una destilación orientada a tamaño que intercambia calidad por reducción de parámetros frente a `pocket-tts-loom`, sin cifras objetivas de MOS, WER ni latencia.

## Requisitos de hardware

- **VRAM estimada**: inferior a 1 GB en cualquier precisión. Cálculo a partir de los 7.120.881 parámetros: unos 28,5 MB en F32, unos 14,2 MB en FP16, unos 7,1 MB en int8 y unos 3,6 MB en int4, sin contar el búfer del decodificador ni el audio generado.
- **GPU recomendadas**: no requiere GPU. Cualquier GPU consumer sirve e incluso resulta sobredimensionada; el modelo está pensado para ejecución en CPU.
- **GPU consumer**: cabe holgadamente en cualquier tarjeta, incluida una GTX 1050 o una iGPU integrada. También es viable en ARM (Raspberry Pi, Apple Silicon) y en dispositivos móviles.
- **Opciones de despliegue**: exclusivamente el ecosistema loom, es decir, el runtime `loom-py-rt` (PyPI, con extra `[hub]`) sobre el motor loom.cpp. No hay soporte indicado para vLLM, llama.cpp, Ollama ni TGI, dado que el GGUF incluye grafos propios que esos motores no interpretan.
- **Latencia y throughput**: no disponibles en la información proporcionada. La velocidad de descarga de los ficheros de voz desde el Hub en el primer uso sí puede añadir latencia inicial.
- **Almacenamiento**: el repositorio completo ocupa 0,1 GB, incluyendo los 26 ficheros de voz adicionales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato / runtime | Notas |
|---|---|---|---|---|---|---|
| `loom-ai-org/pocket-tts-7m-loom` | 7,1 M | No disponible | en | CC-BY-4.0 + restricciones de Kyutai + licencia por voz | GGUF para loom.cpp / `loom-py-rt` | Destilación con reward fine-tuning, voz incorporada y 26 voces en ficheros |
| `loom-ai-org/pocket-tts-loom` | No disponible | No disponible | No disponible | No disponible | GGUF para loom.cpp | Exportación del modelo completo de Kyutai; mayor calidad según la model card |
| `kyutai/pocket-tts` | No disponible | No disponible | en (segun este export) | CC-BY-4.0 con restricciones de uso | Pesos originales (formato no detallado) | Modelo de referencia del que deriva este export; incluye codificador Mimi para clonación |
| Otras tallas de Pocket TTS | No disponible | No disponible | No disponible | No disponible | No disponible | La model card menciona otras tallas, pero no aporta parámetros ni resultados |

No se dispone de datos de benchmarks que permitan comparar calidad objetiva entre estas variantes.

## Limitaciones y advertencias

- **Restricciones de uso de Kyutai**: la publicación original prohíbe, entre otras cosas, la suplantación o clonación de voz sin consentimiento explícito y lícito, y presentar el audio generado como grabación auténtica de una persona real. Estas restricciones viajan con los pesos y prevalecen sobre la licencia CC-BY-4.0.
- **Calidad de destilación**: es una versión de 7 M de parámetros, ajustada por recompensa y orientada a tamaño; la propia model card reconoce que sacrifica calidad frente al modelo completo.
- **Licencias de voz heterogéneas**: cada voz se rige por la licencia de su grabación, no por la del modelo. `cosette` y `jean` son CC-BY-NC-4.0 (no comercial), y `daan`, `juergen` y `rafael` no tienen licencia declarada por Kyutai. Las voces CC-BY exigen atribución al dataset o al hablante de origen.
- **Sin clonación de voz**: el export no incluye el codificador Mimi, por lo que no se puede clonar una voz a partir de una grabación; solo se pueden usar las voces publicadas o ficheros de voz propios incompatibles con otros modelos.
- **Compatibilidad de runtime**: requiere `loom-py-rt` 1.0.0rc19 o superior para procesar correctamente guiones, comillas tipográficas y puntos entre cifras. Una versión anterior carga el modelo y sintetiza, pero altera la preparación de parte del texto.
- **Frecuencia de muestreo manual**: si no se pasa `sample_rate=24000` y el GGUF no la declara, una tasa incorrecta no provoca error, sino reproducción a velocidad equivocada.
- **Solo inglés**: no hay soporte de otros idiomas en este export.
- **Salida no determinista por defecto**: la temperatura 0,3 implica variación entre llamadas; la reproducibilidad exige fijar `seed`.
- **Riesgo de alucinación acústica**: no se documentan métricas de fidelidad de pronunciación ni de estabilidad en textos largos, por lo que conviene validar con muestras propias antes de producción.
- **Sesgos**: no se documenta ningún análisis de sesgos de las voces ni de cobertura de acentos o registros.
- **Adopción nula**: el repositorio registra 0 descargas y 0 valoraciones en el momento de la consulta, sin ecosistema de terceros ni informes independientes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/loom-ai-org/pocket-tts-7m-loom
- Modelo base: https://huggingface.co/kyutai/pocket-tts
- Exportación del modelo completo: https://huggingface.co/loom-ai-org/pocket-tts-loom
- Dataset de voces de Kyutai: https://huggingface.co/kyutai/tts-voices
- Motor de inferencia loom.cpp: https://github.com/loom-ai-org/loom.cpp
- Runtime loom-py: https://github.com/loom-ai-org/loom-py
- Paquete en PyPI (`loom-py-rt`): https://pypi.org/project/loom-py-rt/
- Exportador loom-exporter: https://github.com/loom-ai-org/loom-exporter
- Nota sobre la búsqueda web: los resultados obtenidos corresponden a Loom (grabador de pantalla) y Loom (marca de ropa), sin relación con este modelo, por lo que no se han incluido como fuentes.
