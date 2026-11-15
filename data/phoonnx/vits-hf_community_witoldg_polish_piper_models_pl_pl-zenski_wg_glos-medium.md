# Phoonnx/vits-hf_community_WitoldG_polish_piper_models_pl_PL-zenski_wg_glos-medium

## Resumen

Este repositorio contiene un modelo de síntesis de voz (text-to-speech) en formato ONNX basado en la arquitectura VITS, publicado por el usuario Phoonnx. Se trata de una extracción de una única voz del repositorio agregador `Phoonnx/phoonnx-vits`, concretamente la carpeta `hf_community__WitoldG__polish_piper_models__pl_PL-zenski_wg_glos-medium`, que corresponde a una voz en polaco (pl_PL) de género masculino ("zenski") del conjunto de voces Piper de la comunidad. El modelo está pensado para ser consumido por la librería `phoonnx`, un runtime de inferencia TTS, y conserva las rutas de ficheros originales del repositorio fuente.

La relevancia de este artefacto es limitada y muy específica: no es un modelo entrenado desde cero ni un lanzamiento con benchmarks propios, sino un empaquetado de inferencia (0,1 GB) de una voz Piper preexistente. Su utilidad práctica reside en poder desplegar TTS en polaco en entornos donde ya se use el ecosistema phoonnx o Piper, con pesos ONNX listos para ejecución en CPU. No hay información publicada sobre calidad, datos de entrenamiento ni evaluación objetiva.

La licencia declarada es MIT, aunque la model card advierte que las licencias siguen a los originales por subcarpeta y que algunas voces del repositorio fuente carecen de licencia explícita. Para esta voz concreta, el campo `license` del repositorio indica MIT, pero conviene verificar la procedencia antes de un uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VITS (variational inference with adversarial learning for end-to-end TTS) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS; entrada de texto de longitud variable) |
| Tipos de cuantización | no disponible (pesos distribuidos en ONNX) |
| Idiomas soportados | polaco (pl_PL), según el identificador de la voz |
| Licencia | MIT (según campo del repo; ver advertencias) |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura VITS, un sistema de TTS end-to-end que combina un codificador de texto, un prior variacional, un decodificador generativo basado en flujos normalizadores y un discriminador adversarial para el entrenamiento. VITS produce audio de forma directa desde texto sin necesidad de un vocoder separado en la inferencia, lo que reduce la latencia y simplifica el despliegue. El artefacto aquí publicado es la exportación ONNX de una voz Piper, formato que Piper y phoonnx utilizan para ejecución eficiente en CPU.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del corpus, ni si hubo etapas de ajuste fino o alineación forzada. La voz proviene del conjunto de voces Piper de la comunidad (`WitoldG/polish_piper_models`), que habitualmente se entrena sobre corpus de habla polaca con alineaciones fonéticas generadas por eSpeak NG. No se documenta ninguna innovación técnica adicional más allá del propio empaquetado para phoonnx.

## Capacidades

- Síntesis de voz (text-to-speech) en polaco a partir de texto de entrada.
- Generación de audio en formato waveform mediante pesos ONNX.
- Voz masculina ("zenski") etiquetada como "medium" en el nombre del modelo, lo que en el ecosistema Piper suele indicar un compromiso entre calidad y velocidad.
- Compatible con el runtime phoonnx y, por herencia del formato, con el ecosistema Piper.
- No soporta tool calling, agentes, razonamiento multi-paso ni otras capacidades de modelos de lenguaje.
- No dispone de modo "thinking", visión, audio de entrada ni diálogo multi-turno.
- Capacidad multilingüe: no; la voz está entrenada para un único idioma (polaco).

## Casos de uso

- Lectura por voz de contenidos web en polaco: el modelo puede convertir artículos o noticias a audio en pipelines de accesibilidad, ejecutándose en CPU gracias al formato ONNX y al tamaño reducido del artefacto (0,1 GB).
- Asistentes de voz locales para aplicaciones de escritorio o móviles en polaco: al ser un modelo ONNX ligero, se integra en aplicaciones que necesitan TTS sin conexión y sin depender de servicios en la nube.
- Sistemas de navegación o avisos hablados: la voz masculina en polaco es adecuada para instrucciones cortas y repetitivas donde prima la latencia baja sobre la naturalidad máxima.
- Generación de audiolibros o podcasts automatizados en polaco: útil para prototipos y producción de contenido a granel, siempre que se valide la calidad prosódica en frases largas.
- Pruebas de integración en el ecosistema phoonnx: sirve como voz de referencia para validar pipelines de TTS, comparar latencias y verificar el correcto funcionamiento del runtime antes de desplegar otras voces.
- Accesibilidad en aplicaciones educativas: lectura de materiales didácticos en polaco para usuarios con discapacidad visual o dificultades de lectura, ejecutándose localmente para preservar la privacidad del texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en la mayoría de despliegues, ya que el modelo está pensado para ejecución en CPU; en GPU el consumo sería mínimo (por debajo de 1 GB), aunque no se documenta.
- GPU recomendadas: no disponibles; el formato ONNX y el tamaño de 0,1 GB permiten ejecución en CPU sin GPU dedicada.
- Cabe en GPU consumer: sí, con enorme holgura; cualquier GPU con soporte ONNX Runtime puede ejecutarlo, e incluso es viable en CPU.
- Opciones de despliegue: runtime phoonnx (principal), ONNX Runtime; compatible con el ecosistema Piper.
- Latencia y throughput estimados: no disponibles; en el ecosistema Piper, las voces "medium" suelen sintetizar en tiempo real o más rápido en CPU moderna, pero no hay datos publicados para esta voz concreta.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Formato | Licencia | Contexto | Disponibilidad |
|---|---|---|---|---|---|---|
| Este modelo (Phoonnx VITS polaco) | VITS | Polaco | ONNX | MIT (según repo) | no aplica | Hugging Face, 0 descargas |
| Otras voces Piper pl_PL (p. ej. del repo WitoldG/polish_piper_models) | VITS | Polaco | ONNX | Variable por voz | no aplica | Hugging Face / GitHub |
| Coqui TTS (modelos VITS multilingües) | VITS / otros | Multilingüe | PyTorch, ONNX | MPL-2.0 (mayoría) | no aplica | GitHub, Hugging Face |
| Modelos TTS neuronales comerciales (p. ej. APIs cloud) | no disponible | Multilingüe | API | Propietaria | no aplica | Servicios cloud |

La comparación directa es difícil porque este artefacto es una extracción de un repositorio mayor y no publica métricas. Frente a otras voces Piper, la diferencia principal es el empaquetado para phoonnx y la ruta de ficheros preservada; frente a Coqui TTS, la ventaja es el tamaño mínimo y la ejecución en CPU, a costa de una única voz y un solo idioma.

## Limitaciones y advertencias

- No hay benchmarks ni evaluaciones subjetivas publicadas; la calidad de la voz es desconocida y debe validarse empíricamente.
- El modelo solo sintetiza polaco; no admite otros idiomas ni cambio de voz dentro del mismo artefacto.
- Riesgo de prosodia incorrecta en frases largas, números, siglas y nombres propios, habitual en voces Piper de tamaño "medium".
- La licencia declarada es MIT, pero la model card advierte que las licencias siguen a los originales por subcarpeta y que algunas voces del repositorio fuente no tienen licencia explícita; verificar la procedencia antes de uso comercial.
- El repositorio tiene 0 descargas y 0 likes, sin señales de validación por parte de la comunidad.
- Al ser una extracción de un repositorio agregador, la trazabilidad del entrenamiento y del corpus original es limitada.
- No apto para tareas de comprensión de lenguaje, razonamiento o generación de texto; es exclusivamente un modelo TTS.
- Posibles sesgos acústicos derivados del corpus de entrenamiento original (registro, acento y condiciones de grabación no documentadas).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-hf_community_WitoldG_polish_piper_models_pl_PL-zenski_wg_glos-medium
- Repositorio fuente de voces: https://huggingface.co/Phoonnx/phoonnx-vits
- Runtime phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio de voces Piper polacas (referenciado en el nombre): no disponible como enlace directo en la información proporcionada
- Repositorio kasanoma (mencionado en la model card): https://github.com/michsethowusu/kasanoma
