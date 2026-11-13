# codebucketsolutions/bolo-syspin-chhattisgarhi-male

## Resumen

`bolo-syspin-chhattisgarhi-male` es un modelo de síntesis de voz (text-to-speech) en formato ONNX para chhattisgarhi (`hne`), una lengua indoaria hablada principalmente en el estado de Chhattisgarh, India. Lo publica el usuario `codebucketsolutions` como conversión de formato del checkpoint original `SYSPIN/vits_Chhattisgarhi_Male`, desarrollado por el proyecto SYSPIN del SPIRE Lab (Indian Institute of Science, Bengaluru). No se trata de un modelo entrenado desde cero, sino de un artefacto de despliegue: los pesos originales en formato Coqui VITS se han exportado a ONNX sin reentrenamiento ni modificación.

La relevancia del modelo es doble. Por un lado, cubre una lengua de bajos recursos con muy poca representación en el ecosistema TTS abierto. Por otro, está empaquetado específicamente para [bolo](https://github.com/cb-Sigma/bolo), un servidor de voz que funciona sin PyTorch sobre el runtime sherpa-onnx, lo que simplifica el despliegue en entornos con dependencias mínimas. La arquitectura subyacente es VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech), un modelo condicional VAE con decoder HiFi-GAN y alineamiento monotónico, adecuado para síntesis rápida en CPU.

El repositorio ocupa aproximadamente 0,1 GB y contiene únicamente los pesos convertidos y la documentación de procedencia. La licencia de los pesos es MIT y los datos de entrenamiento originales (corpus SYSPIN) están bajo CC-BY-4.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Coqui), exportado a ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (TTS; longitud de entrada limitada por el texto a sintetizar) |
| Tipos de cuantizacion | no disponible (el repo distribuye pesos ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | chhattisgarhi (`hne`) |
| Licencia | MIT (pesos); datos de entrenamiento CC-BY-4.0 |
| Formato de pesos | ONNX (exportado desde checkpoint Coqui VITS) |

## Arquitectura y entrenamiento

El modelo original es un VITS de Coqui: un VAE condicional de extremo a extremo que combina un encoder de texto, un predictor de duraciones con alineamiento monotónico (MAS), un normalizing flow y un decoder generativo tipo HiFi-GAN. Este diseño permite síntesis de alta calidad sin necesidad de un vocoder externo y con inferencia rápida, lo que lo hace idóneo para servir en CPU mediante sherpa-onnx.

No se dispone de información sobre el número de tokens, la composición exacta del corpus ni el proceso de entrenamiento más allá de lo indicado en la model card: los pesos proceden del proyecto SYSPIN (SPIRE Lab, IISc) y se entrenaron con el corpus TTS SYSPIN, licenciado CC-BY-4.0. Esta publicación concreta es una conversión de formato realizada con `tools/voices/export_syspin.py` del proyecto bolo, a partir de la revisión `881673cd1f9a8367121ab3cf3f36ee582b0021d2` del checkpoint original. No hubo reentrenamiento, ajuste fino ni cambio en los pesos. No se documentan innovaciones técnicas adicionales más allá de la propia arquitectura VITS y del empaquetado para sherpa-onnx.

## Capacidades

- Síntesis de voz monolingüe en chhattisgarhi (`hne`) con voz masculina.
- Generación de audio a partir de texto mediante inferencia ONNX, sin dependencia de PyTorch.
- Integración nativa con el servidor de voz bolo (`bolo pull syspin-hne-male`).
- Ejecución sobre sherpa-onnx, lo que permite despliegue en CPU y en entornos con dependencias reducidas.
- No se documentan capacidades de clonación de voz, control de estilo, emoción, multilingüismo, tool calling ni razonamiento multi-paso; es un modelo puramente TTS.

## Casos de uso

- **Lectura de contenidos en chhattisgarhi**: convertir artículos, noticias o documentación a audio para hablantes de `hne`, aprovechando que es una de las pocas voces abiertas disponibles para esta lengua.
- **Accesibilidad para personas con discapacidad visual**: integrar el modelo en lectores de pantalla o aplicaciones de lectura que necesiten una voz masculina en chhattisgarhi, con inferencia en CPU vía sherpa-onnx.
- **Asistentes de voz locales sin PyTorch**: desplegar el modelo dentro del servidor bolo en dispositivos con recursos limitados, evitando el peso de un stack completo de deep learning.
- **Locuciones para medios locales**: generar narraciones para radios comunitarias, vídeos o pódcasts en chhattisgarhi sin depender de servicios TTS comerciales que no cubren la lengua.
- **Sistemas de anuncios y avisos públicos**: producir mensajes hablados automatizados (transporte, administración, salud) en la lengua local, con bajo coste de infraestructura.
- **Investigación en TTS para lenguas de bajos recursos**: usar el modelo como línea base o punto de partida para experimentos de adaptación, evaluación o comparación con otros sistemas en `hne`.
- **Prototipado de interfaces conversacionales**: incorporar la voz en asistentes de voz de dominio específico (agricultura, servicios municipales) que operen en chhattisgarhi.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada**: no disponible. Al ser un modelo VITS pequeño (repo de ~0,1 GB) y ejecutarse en ONNX, es previsible que quepa en memoria de CPU sin GPU, aunque no se documentan cifras oficiales.
- **GPU recomendadas**: no se especifican. Para TTS de este tamaño, una GPU consumer (por ejemplo, RTX 3060 o superior) sería más que suficiente, pero la inferencia está pensada para CPU mediante sherpa-onnx.
- **Compatibilidad con GPU consumer**: probablemente sí, dado el tamaño reducido, aunque no hay datos oficiales.
- **Opciones de despliegue**: sherpa-onnx y el servidor bolo (`bolo pull syspin-hne-male`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo TTS.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

| Modelo | Idioma | Arquitectura | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| bolo-syspin-chhattisgarhi-male | chhattisgarhi (`hne`) | VITS (ONNX) | MIT (pesos) / CC-BY-4.0 (datos) | ONNX | Hugging Face, vía bolo |
| SYSPIN/vits_Chhattisgarhi_Male | chhattisgarhi (`hne`) | VITS (Coqui) | MIT (pesos) / CC-BY-4.0 (datos) | Coqui checkpoint | Hugging Face |
| Otros modelos TTS para lenguas indoarias | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación más directa es con el checkpoint original del que deriva: misma arquitectura y mismos pesos, pero en formato Coqui en lugar de ONNX. No se dispone de información sobre alternativas comparables en chhattisgarhi dentro de la información proporcionada.

## Limitaciones y advertencias

- **Idioma único**: solo sintetiza chhattisgarhi (`hne`); no es multilingüe ni acepta texto en otras lenguas.
- **Voz única**: una sola voz masculina; no hay control de hablante, estilo ni emoción.
- **Riesgo de alucinación acústica**: como todo TTS, puede producir pronunciaciones incorrectas ante texto fuera de dominio, siglas, números o préstamos léxicos no vistos en el corpus.
- **Sesgos del corpus**: la voz refleja las características del corpus SYSPIN (probablemente hablantes y dominio acotados); puede no representar toda la variación dialectal del chhattisgarhi.
- **Licencia**: los pesos son MIT, pero los datos de entrenamiento son CC-BY-4.0, lo que exige atribución al proyecto SYSPIN y al SPIRE Lab (IISc) en usos derivados.
- **Procedencia**: es una conversión de formato sin reentrenamiento; cualquier limitación del checkpoint original se hereda íntegramente.
- **Madurez**: repositorio con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción ni de validación independiente.
- **Documentación escasa**: no se publican métricas de calidad (MOS), latencia ni requisitos de hardware, lo que dificulta evaluar su idoneidad para producción sin pruebas propias.

## Enlaces

- [Hugging Face: codebucketsolutions/bolo-syspin-chhattisgarhi-male](https://huggingface.co/codebucketsolutions/bolo-syspin-chhattisgarhi-male)
- [Modelo original: SYSPIN/vits_Chhattisgarhi_Male](https://huggingface.co/SYSPIN/vits_Chhattisgarhi_Male)
- [Proyecto bolo (servidor de voz)](https://github.com/cb-Sigma/bolo)
- [Licencia CC-BY-4.0](https://creativecommons.org/licenses/by/4.0/)
