# affifuddin-hazam/ghost-voice

## Resumen

ghost-voice es un paquete de pesos en formato GGUF propietario de ghost-infer que reúne los tres componentes necesarios para habilitar llamadas de voz conversacionales en la aplicación ghost-infer: un modelo de texto a voz (TTS) derivado de maya-research/maya1 con un ajuste fino de voz, el decodificador de audio SNAC de 24 kHz a través del cual maya1 sintetiza la señal, y una cuantización Q8_0 de Whisper large-v3-turbo para la transcripción de voz a texto (STT). No se trata de un modelo entrenado desde cero, sino de una distribución empaquetada de artefactos de inferencia listos para un runtime concreto.

El componente principal, maya1-her-250.Q4_K_M.gguf, contiene 3.300.928.576 parámetros (aproximadamente 3,3 mil millones) en cuantización Q4_K_M y ocupa 2,1 GB. El repositorio completo suma 3,1 GB y, según la model card, los tres archivos cargados simultáneamente consumen unos 3,5 GB de memoria de GPU, aunque solo se mantienen residentes mientras hay llamadas activas.

Su relevancia es acotada pero clara: elimina la fricción de montar un pipeline de voz bidireccional (STT + TTS + códec de audio) sobre un único runtime, algo útil para desarrolladores que quieran prototipar agentes conversacionales por voz sin ensamblar manualmente cada pieza. La contrapartida es que los archivos usan el formato propio de ghost-infer y no son compatibles con llama.cpp ni whisper.cpp, lo que ata el despliegue a esa aplicación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base maya-research/maya1; TTS con decodificador de audio SNAC 24 kHz) |
| Parámetros totales | 3.300.928.576 (componente TTS maya1-her-250) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q4_K_M (TTS maya1), Q8_0 (Whisper large-v3-turbo) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (maya1); MIT (SNAC y Whisper) |
| Formato de pesos | GGUF en formato propio de ghost-infer (no compatible con llama.cpp ni whisper.cpp) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna de maya1 más allá de que es un modelo de texto a voz que sintetiza audio a través del decodificador SNAC de 24 kHz (hubertsiuzdak/snac_24khz, MIT). El artefacto distribuido aquí es un ajuste fino de voz sobre maya1, cuantizado a Q4_K_M, identificado como "Maya's voice" y con el sufijo 250 en el nombre del archivo, cuyo significado no se especifica. No se publican datos sobre volumen de entrenamiento, composición del dataset, ni si hubo RLHF o DPO.

El paquete se completa con Whisper large-v3-turbo de OpenAI en Q8_0 (870 MB) para la escucha y con SNAC (90 MB) para la decodificación del audio generado. No se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal; el valor del repositorio es de empaquetado e integración, no de investigación.

## Capacidades

- Síntesis de voz (TTS) a partir de texto mediante el modelo maya1 con ajuste fino de voz.
- Decodificación de audio a 24 kHz mediante SNAC.
- Transcripción de voz a texto (STT) mediante Whisper large-v3-turbo en Q8_0.
- Pipeline conversacional de ida y vuelta orientado a llamadas de voz dentro de ghost-infer.
- Carga bajo demanda: los modelos solo se mantienen en memoria mientras las llamadas pueden necesitarlos.
- Integración mediante servidor CLI (`ghost-infer serve`) con rutas separadas para TTS y STT.
- Compatibilidad declarada con endpoints (`endpoints_compatible` en los tags).
- No se documentan capacidades de tool calling, agentes multi-paso, visión ni modo de razonamiento explícito.

## Casos de uso

- Prototipado de agentes de voz conversacionales: el paquete permite levantar en una sola aplicación un bucle completo de escucha (Whisper) y respuesta hablada (maya1 + SNAC), adecuado para validar ideas de asistentes por voz sin integrar tres runtimes distintos.
- Demos de atención al cliente por teléfono o VoIP: al cargar los modelos solo durante las llamadas, encaja en escenarios de tráfico intermitente donde no se quiere reservar 3,5 GB de VRAM de forma permanente.
- Integración en la aplicación de escritorio ghost-infer: los archivos se colocan en la carpeta de modelos y la app los detecta automáticamente, lo que simplifica el despliegue para usuarios finales no técnicos.
- Despliegue headless en servidor: mediante `ghost-infer serve --gpu` con rutas explícitas a los directorios de TTS y STT, útil para montar un servicio de voz en una máquina con GPU dedicada.
- Experimentación con voces ajustadas: al ser un fine-tune de voz sobre maya1, sirve para evaluar la calidad y el timbre de una voz concreta antes de comprometerse con un pipeline de producción.
- Transcripción de audio en local: el componente Whisper Q8_0 puede emplearse para dictado o subtitulado dentro del ecosistema ghost-infer, con la ventaja de no enviar audio a servicios externos.
- Pruebas de latencia y consumo en GPU: el requisito declarado de ~3,5 GB permite estimar el coste de hardware de un asistente de voz antes de escalar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: unos 3,5 GB de memoria de GPU con los tres componentes cargados (dato de la model card); 2,1 GB corresponden al TTS maya1 en Q4_K_M, 870 MB a Whisper Q8_0 y 90 MB a SNAC.
- GPU recomendadas: no se especifican modelos concretos; el requisito de ~3,5 GB es compatible con GPU de consumo de gama media-alta con al menos 6-8 GB de VRAM.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier tarjeta con 6 GB o más de VRAM (RTX 3060, RTX 4060, RTX 4070, RTX 4090, entre otras), aunque el fabricante no publica una lista oficial.
- Opciones de despliegue: exclusivamente el runtime ghost-infer (`ghost-infer serve`); no es compatible con llama.cpp, whisper.cpp, vLLM, Ollama ni TGI por el formato propietario de los archivos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Formato / disponibilidad |
|---|---|---|---|---|---|
| ghost-voice (este repo) | 3,3 B (TTS) + Whisper large-v3-turbo | no disponible | TTS + STT empaquetados | Apache-2.0 / MIT | GGUF propio de ghost-infer |
| maya-research/maya1 | no disponible | no disponible | TTS | Apache-2.0 | Pesos originales en HuggingFace |
| openai/whisper-large-v3-turbo | no disponible en la información | no disponible | STT | MIT | Pesos originales y múltiples runtimes |
| hubertsiuzdak/snac_24khz | no disponible en la información | no disponible | Códec/decodificador de audio | MIT | Pesos originales |

La comparación relevante no es de rendimiento, sino de empaquetado: ghost-voice agrupa en un solo repositorio y un solo runtime lo que por separado requeriría tres integraciones distintas, a cambio de perder portabilidad frente a los formatos estándar.

## Limitaciones y advertencias

- Formato propietario: los archivos GGUF no son compatibles con llama.cpp ni whisper.cpp, por lo que solo funcionan dentro de ghost-infer.
- Sin datos de benchmarks ni de evaluación de calidad de voz o transcripción; no hay evidencia publicada de rendimiento frente a alternativas.
- Idiomas soportados no documentados: no se puede asumir cobertura multilingüe del TTS ni del STT sin verificación.
- Longitud de contexto no disponible, lo que impide planificar conversaciones de muchos turnos con garantías.
- Riesgo de alucinación y de artefactos de audio inherente a los modelos generativos de voz, no cuantificado por el autor.
- Sesgos de voz y de idioma desconocidos; el fine-tune se presenta como una voz concreta ("Maya's voice"), lo que limita la variedad de timbres.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria ni reportes de uso en producción.
- Las licencias Apache-2.0 (maya1) y MIT (SNAC, Whisper) permiten uso comercial, pero conviene verificar las condiciones del modelo base maya1 y del ajuste fino antes de desplegar.
- La fecha de creación del repositorio (2026-11-05) y la ausencia de documentación adicional aconsejan tratar el paquete como experimental.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/affifuddin-hazam/ghost-voice
- Repositorio de ghost-infer: https://github.com/affifuddin-hazam/ghost-infer
- Modelo base maya1: https://huggingface.co/maya-research/maya1
- Decodificador SNAC 24 kHz: https://huggingface.co/hubertsiuzdak/snac_24khz
- Whisper large-v3-turbo: https://huggingface.co/openai/whisper-large-v3-turbo
