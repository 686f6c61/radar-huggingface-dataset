# Phoonnx/vits-hitz-gl_iago

## Resumen

vits-hitz-gl_iago es un modelo de síntesis de voz (text-to-speech) en formato ONNX, publicado por el usuario Phoonnx dentro del repositorio agregador Phoonnx/phoonnx-vits. Se trata de una voz concreta del conjunto `hitz-gl_iago`, empaquetada para su uso con la librería phoonnx, un runtime de TTS basado en ONNX. El modelo emplea la arquitectura VITS, un modelo generativo condicional de extremo a extremo que combina un codificador de texto, un prior variacional y un decodificador basado en flujos normalizadores y un vocoder HiFi-GAN para producir audio de forma directa a partir de texto.

La relevancia de esta ficha es limitada: el repositorio no incluye información sobre el idioma, el conjunto de datos de entrenamiento, el número de parámetros ni las capacidades exactas del modelo. La model card se limita a indicar que es una copia de una carpeta del repositorio original, que conserva las rutas de los ficheros y que la licencia es MIT según los metadatos del propio repositorio. El identificador `gl_iago` sugiere una voz gallega asociada a un hablante llamado Iago, pero esta interpretación no está confirmada por la documentación disponible.

El modelo ocupa 0,1 GB en el repositorio y no registra descargas ni interacciones en el momento de la consulta. Su interés práctico se circunscribe a entornos que ya utilicen phoonnx o que necesiten una voz ONNX ligera para síntesis de voz local, sin depender de servicios en la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (variational inference with adversarial learning for end-to-end TTS), exportada a ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el identificador `gl_iago` sugiere gallego, sin confirmar) |
| Licencia | MIT |
| Formato de pesos | ONNX |
| Tamano del repositorio | 0,1 GB |
| Libreria de inferencia | phoonnx |
| Pipeline | text-to-speech |

## Arquitectura y entrenamiento

La arquitectura es VITS, un modelo de síntesis de voz de extremo a extremo que integra en una sola red un codificador de texto, un prior variacional condicionado por la duración fonética, un decodificador de flujos normalizadores y un vocoder de tipo HiFi-GAN. Este diseño permite generar waveforms directamente desde la secuencia de fonemas sin necesidad de un modelo acústico y un vocoder separados, lo que reduce la latencia y simplifica el despliegue. La exportación a ONNX facilita la inferencia en CPU y en entornos sin GPU mediante runtimes compatibles.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, el hablante de origen ni si se aplicaron técnicas de ajuste como RLHF o DPO (poco habituales en TTS). La model card no documenta el proceso de entrenamiento ni las innovaciones técnicas específicas más allá de la arquitectura VITS estándar. El modelo se distribuye como una copia de una carpeta del repositorio Phoonnx/phoonnx-vits, conservando las rutas originales de los ficheros.

## Capacidades

- Síntesis de voz a partir de texto (text-to-speech) en formato ONNX.
- Generación de audio de forma local, sin dependencia de servicios en la nube.
- Integración con la librería phoonnx, que actúa como runtime de inferencia.
- Identificador de voz `hitz/gl_iago-vits` para su uso dentro de phoonnx.
- No se documenta soporte de tool calling, agentes, razonamiento multi-paso ni capacidades multimodales.
- No se documenta control de prosodia, emociones ni estilos de habla.
- No se documenta capacidad multilingüe; el idioma no está especificado en la información disponible.

## Casos de uso

- Síntesis de voz local en aplicaciones de escritorio: el modelo puede cargarse con phoonnx en un equipo sin GPU y generar audio a partir de texto, gracias a su formato ONNX y a su tamaño reducido de 0,1 GB.
- Lectura de contenido en aplicaciones de accesibilidad: integración en lectores de pantalla o herramientas de lectura de documentos para convertir texto en voz de forma offline.
- Generación de audiolibros o podcasts automatizados: el modelo puede producir narraciones a partir de texto plano, siempre que el idioma y la calidad de la voz se validen previamente.
- Pruebas de concepto en investigación de TTS: útil como referencia de una voz VITS exportada a ONNX para comparar latencia y calidad frente a otros modelos.
- Integración en asistentes de voz embebidos: al ser un modelo ligero y ONNX, puede desplegarse en dispositivos con recursos limitados si el runtime phoonnx está disponible.
- Generación de avisos o mensajes hablados en sistemas de automatización: por ejemplo, anuncios en aplicaciones de domótica o sistemas de megafonía, con la salvedad de que la licencia MIT permite uso comercial.
- Evaluación de la cadena de herramientas phoonnx: sirve como caso de prueba para validar la carga de modelos VITS en ONNX dentro de pipelines propios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; por el tamaño del repositorio (0,1 GB) y la arquitectura VITS, es probable que quepa en CPU y en GPUs de gama baja, pero no hay datos confirmados.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; el formato ONNX permite ejecución en CPU mediante ONNX Runtime.
- Opciones de despliegue: phoonnx (runtime principal), ONNX Runtime; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no están orientados a TTS.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Formato | Licencia | Contexto | Notas |
|---|---|---|---|---|---|
| Phoonnx/vits-hitz-gl_iago | VITS | ONNX | MIT | no aplica | Voz concreta dentro de phoonnx-vits; sin datos de rendimiento |
| Piper (voces VITS) | VITS | ONNX | variable por voz | no aplica | Ecosistema amplio de voces TTS ligeras para CPU |
| Coqui TTS (VITS) | VITS | PyTorch | MPL 2.0 (segun version) | no aplica | Framework completo con múltiples voces y herramientas |
| Kokoro | no disponible | ONNX/PyTorch | Apache 2.0 (segun repositorio) | no aplica | Modelo TTS reciente con buena calidad; datos no verificados en esta ficha |

La comparativa es orientativa: no se dispone de datos de benchmarks ni de parámetros para establecer una comparación cuantitativa rigurosa.

## Limitaciones y advertencias

- La model card no especifica el idioma, el hablante ni el dataset de entrenamiento; el identificador `gl_iago` sugiere gallego, pero no está confirmado.
- No hay información sobre sesgos, calidad de la voz ni comportamiento en dominios específicos.
- Riesgo de alucinación no aplica en el sentido de LLM, pero la síntesis puede producir pronunciaciones incorrectas en palabras fuera del vocabulario de entrenamiento.
- La licencia MIT permite uso comercial, pero la model card advierte que la licencia sigue la del repositorio original y que algunas voces del agregador tienen licencias distintas; conviene revisar la carpeta de origen antes de un uso comercial.
- El repositorio no registra descargas ni validación por parte de la comunidad, por lo que la calidad no está contrastada.
- No se documentan limitaciones de contexto ni de longitud de texto; el comportamiento con entradas largas es desconocido.
- El modelo depende de la librería phoonnx, lo que limita su portabilidad a otros runtimes sin conversión adicional.

## Enlaces

- [Hugging Face: Phoonnx/vits-hitz-gl_iago](https://huggingface.co/Phoonnx/vits-hitz-gl_iago)
- [Repositorio agregador: Phoonnx/phoonnx-vits](https://huggingface.co/Phoonnx/phoonnx-vits)
- [Repositorio phoonnx en GitHub](https://github.com/TigreGotico/phoonnx)
- [Repositorio kasanoma (referencia de licencias del agregador)](https://github.com/michsethowusu/kasanoma)
