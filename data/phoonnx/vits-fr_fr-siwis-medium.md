# Phoonnx/vits-fr_FR-siwis-medium

## Resumen

`vits-fr_FR-siwis-medium` es un modelo de síntesis de voz (text-to-speech) en formato ONNX, publicado por el usuario Phoonnx como espejo de una voz Piper del repositorio `rhasspy/piper-voices`. Se trata de una conversión de la voz francesa `fr_FR-siwis-medium`, originalmente entrenada con la arquitectura VITS y pensada para su uso en el motor de inferencia phoonnx, una implementación ligera orientada a despliegue local y en dispositivos con recursos limitados.

El modelo no aporta entrenamiento nuevo: es un artefacto de distribución que reproduce fielmente la estructura de ficheros del repositorio agregador `Phoonnx/phoonnx-vits`, manteniendo las rutas originales. Su relevancia es práctica: permite a los usuarios de phoonnx disponer de una voz francesa de calidad media sin depender del repositorio completo de Piper, con un tamaño de repositorio de 0,1 GB y licencia MIT.

La ficha se basa exclusivamente en la información pública disponible en Hugging Face, que es escasa: no se documentan parámetros, contexto, benchmarks ni detalles de entrenamiento más allá de la procedencia Piper/espeak.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VITS (variational inference with adversarial learning for end-to-end TTS) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica ventana de contexto de texto) |
| Tipos de cuantización | no disponible (pesos distribuidos en ONNX; se desconoce si hay variantes cuantizadas) |
| Idiomas soportados | francés (fr_FR, según el identificador de la voz); no se documenta lista oficial |
| Licencia | MIT |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura VITS, un sistema end-to-end de síntesis de voz que combina un codificador de texto, un prior variacional, un decodificador basado en flujos normalizadores y un discriminador adversarial multiperiodo durante el entrenamiento. VITS genera波形 de audio directamente a partir de fonemas, sin necesidad de un vocoder separado en inferencia, lo que reduce la latencia y simplifica el despliegue.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o fine-tuning posteriores. La model card indica que la voz proviene de Piper (con fonemización espeak) y que el artefacto es un espejo de `rhasspy/piper-voices`; por tanto, los detalles de entrenamiento corresponden al modelo original de Piper, no documentados en esta ficha. La innovación técnica destacable es la exportación a ONNX para inferencia portable, aunque no se especifican optimizaciones adicionales (cuantización, decodificación especulativa, etc.).

## Capacidades

- Síntesis de voz a partir de texto en francés (fr_FR) con calidad "medium" según la nomenclatura Piper.
- Generación de audio waveform directamente desde fonemas, sin vocoder externo.
- Fonemización basada en espeak, lo que permite cubrir el inventario fonético del francés.
- Inferencia mediante el motor phoonnx (librería `phoonnx`), orientado a ejecución local y ligera.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-step ni procesamiento multimodal.
- No se documentan capacidades multilingües más allá del francés.
- No se documenta modo "thinking", visión ni audio de entrada.

## Casos de uso

- **Lectura de textos en francés en aplicaciones de accesibilidad**: el modelo puede convertir artículos, documentos o notificaciones a voz para usuarios con discapacidad visual, gracias a su formato ONNX ligero y su licencia MIT que permite integración en productos comerciales.
- **Asistentes de voz embebidos en dispositivos de bajo consumo**: al ser un modelo VITS de tamaño medio (repo de 0,1 GB) y exportado a ONNX, puede ejecutarse en Raspberry Pi o dispositivos similares para respuestas habladas en francés sin conexión a la nube.
- **Generación de audiolibros o podcasts automatizados**: se puede usar para sintetizar largos textos en francés por lotes, con la ventaja de que la fonemización espeak maneja nombres propios y siglas de forma razonable.
- **Sistemas de anuncios públicos o interfaces de kiosco en francés**: integración en aplicaciones de mostrador o transporte para emitir mensajes pregrabados dinámicamente, con latencia baja al no requerir vocoder separado.
- **Prototipado rápido de aplicaciones TTS en investigación**: investigadores que necesiten una voz francesa de referencia para experimentos de prosodia o evaluación de inteligibilidad pueden usar este modelo como baseline reproducible con licencia permisiva.
- **Integración en pipelines de doblaje o postproducción**: generación de pistas de voz temporales en francés para maquetas de vídeo o animáticas, sustituibles posteriormente por grabaciones humanas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia**: no disponible con precisión; por el tamaño del repositorio (0,1 GB) y la arquitectura VITS medium, se estima un consumo de memoria en el rango de cientos de MB, pero no se confirma en la documentación.
- **GPU recomendadas**: no disponible; al ser un modelo ONNX ligero, puede ejecutarse en CPU y en GPUs de gama baja, pero no se especifican modelos concretos.
- **¿Cabe en GPU consumer?**: sí, previsiblemente en cualquier GPU consumer moderna e incluso en CPU, dado el tamaño reducido del artefacto, aunque no se aportan cifras oficiales.
- **Opciones de despliegue**: motor phoonnx (librería `phoonnx`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a TTS).
- **Latencia y throughput estimados**: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| `vits-fr_FR-siwis-medium` (este) | VITS | no disponible | no aplica | MIT | ONNX | Hugging Face (Phoonnx) |
| `rhasspy/piper-voices` (voz fr_FR-siwis-medium) | VITS | no disponible | no aplica | MIT | ONNX (Piper) | Hugging Face (rhasspy) |
| `Phoonnx/phoonnx-vits` (repo agregador) | VITS | no disponible | no aplica | MIT (según voces) | ONNX | Hugging Face (Phoonnx) |

No se dispone de datos de rendimiento (MOS, latencia) para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- **Sesgos conocidos**: no documentados; al derivar de Piper/espeak, puede heredar sesgos de pronunciación o prosodia del corpus original, no especificados.
- **Riesgo de alucinación**: en TTS el riesgo se traduce en pronunciaciones incorrectas o prosodia anómala en palabras fuera del vocabulario o nombres propios; no se documenta una evaluación al respecto.
- **Limitaciones de contexto o idioma**: el modelo está orientado exclusivamente al francés (fr_FR); no se garantiza un comportamiento correcto en otros idiomas o acentos.
- **Restricciones de licencia**: licencia MIT, que permite uso comercial y modificación, pero se recomienda verificar la procedencia original en `rhasspy/piper-voices` para cumplir con las atribuciones correspondientes.
- **Caveats para producción**: la model card no documenta parámetros, benchmarks ni latencia; el repositorio tiene 0 descargas y 0 likes, lo que sugiere un artefacto reciente o poco validado. Se recomienda probar la inteligibilidad y estabilidad antes de desplegarlo en entornos críticos.
- **Dependencia del motor phoonnx**: el uso previsto es a través de la librería `phoonnx`; no se garantiza compatibilidad con otros runners ONNX sin adaptación.

## Enlaces

- [Hugging Face: Phoonnx/vits-fr_FR-siwis-medium](https://huggingface.co/Phoonnx/vits-fr_FR-siwis-medium)
- [Repositorio agregador: Phoonnx/phoonnx-vits](https://huggingface.co/Phoonnx/phoonnx-vits)
- [Repositorio de voces Piper: rhasspy/piper-voices](https://huggingface.co/rhasspy/piper-voices)
- [Motor phoonnx (GitHub)](https://github.com/TigreGotico/phoonnx)
