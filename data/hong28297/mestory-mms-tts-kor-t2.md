# hong28297/mestory-mms-tts-kor-t2

## Resumen

mestory-mms-tts-kor-t2 es un punto de control de síntesis de voz (text-to-audio) publicado por el usuario hong28297 en Hugging Face. Por su identificador, su etiqueta de arquitectura ("vits") y la nomenclatura del proyecto MMS de Meta, se trata de una variante o ajuste fino del modelo facebook/mms-tts-kor, orientado a la generación de audio en coreano a partir de texto. El repositorio tiene 36.282.096 parámetros reales según los pesos safetensors y ocupa 0,1 GB, lo que lo sitúa en la gama de los modelos TTS ligeros que se ejecutan sin GPU dedicada.

La relevancia de esta ficha es limitada pero concreta: es un checkpoint derivado de la familia Massively Multilingual Speech, que cubre más de 1.000 idiomas, y su tamaño reducido lo hace utilizable en entornos de bajos recursos. Sin embargo, el autor no ha documentado nada: la model card es la plantilla automática de transformers, sin licencia declarada, sin idiomas declarados, sin datos de entrenamiento y sin resultados de evaluación. El repositorio no registra descargas ni "likes" en el momento de la consulta.

Por tanto, esta ficha describe lo que se puede verificar (arquitectura probable, tamaño, formato de pesos, pipeline) y marca explícitamente como "no disponible" todo lo que el autor no ha publicado. Cualquier uso en producción debería ir precedido de una evaluación propia y de la verificación de la licencia, dado que la familia MMS de Meta se distribuye habitualmente bajo CC-BY-NC 4.0, una restricción que impediría el uso comercial.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech), según la etiqueta `vits` del repositorio; no confirmado en la model card |
| Parametros totales | 36.282.096 (dato real extraído de los pesos safetensors) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible; no aplica en el sentido habitual, es un modelo texto-a-audio con entrada de texto de longitud variable |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible en la model card; el sufijo `kor` y la referencia al modelo base facebook/mms-tts-kor apuntan a coreano |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Libreria | transformers |
| Pipeline | text-to-audio |
| Tamano del repositorio | 0,1 GB |
| Compatibilidad de endpoints | sí (`endpoints_compatible`) |
| Fecha de creacion / actualizacion | 2026-10-08 (según metadatos del Hub) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La etiqueta `vits` del repositorio apunta a la arquitectura VITS, un modelo generativo de extremo a extremo que combina un codificador de texto, un prior variacional, un decodificador y un discriminador adversarial entrenado con pérdida GAN, además de un vocoder integrado que produce la forma de onda directamente. Esta arquitectura es la que emplea la familia MMS-TTS de Meta para sus checkpoints por idioma y permite inferencia en un único paso sin un vocoder externo en cascada. No obstante, la model card de este repositorio no confirma la arquitectura ni detalla la configuración de capas, canales o frecuencia de muestreo.

No hay información publicada sobre el entrenamiento: ni número de tokens o horas de audio, ni composición del dataset, ni si hubo ajuste fino supervisado, RLHF o DPO. El prefijo "mestory" y los sufijos "t2" y "h1" (existe un repositorio hermano, hong28297/mestory-mms-tts-kor-h1) sugieren variantes de un mismo ajuste, posiblemente distintas voces o estilos, pero esto es una hipótesis derivada de la nomenclatura y no está documentado por el autor. La etiqueta `arxiv:1910.09700` que aparece en los tags corresponde al artículo de Lacoste et al. sobre estimación de emisiones de carbono, enlazado desde la plantilla automática de la model card, y no a un artículo técnico sobre este modelo.

## Capacidades

- Síntesis de voz a partir de texto en coreano, en formato de audio (pipeline `text-to-audio`), según el identificador y el modelo base de referencia.
- Generación de audio en una sola pasada mediante arquitectura VITS, sin vocoder externo en cascada.
- Compatibilidad con la librería `transformers` y con la infraestructura de endpoints de Hugging Face.
- Ejecución viable en CPU por el reducido número de parámetros (36,3 millones).
- Soporte de tool calling / function calling: no aplica (modelo de audio, no conversacional).
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Capacidades multilingües: no disponibles; el repositorio está etiquetado para coreano y no se documenta cobertura adicional.
- Capacidades especiales (modo thinking, visión, audio de entrada): no disponibles.

## Casos de uso

- Doblaje y localización de vídeo al coreano: el modelo convierte guiones de texto en pistas de voz, y su tamaño de 36 millones de parámetros permite generar lotes completos de audio en un servidor sin GPU dedicada.
- Audiolibros y contenido editorial en coreano: la síntesis por fragmentos permite procesar capítulos largos por trozos y ensamblarlos después, con un coste de cómputo por hora de audio muy bajo en comparación con modelos TTS de miles de millones de parámetros.
- Sistemas de accesibilidad y lectores de pantalla: integrable en aplicaciones de escritorio o móviles que necesiten leer texto en coreano en tiempo real, ya que el modelo cabe en memoria sin acelerador.
- Locuciones para IVR y atención telefónica automatizada: generación previa de mensajes de voz en coreano para menús telefónicos y avisos, con la ventaja de no depender de servicios TTS en la nube.
- Aplicaciones de aprendizaje de idiomas: producción de ejemplos de pronunciación en coreano a partir de vocabulario y frases introducidas por el usuario, útil en tarjetas de repaso y ejercicios de escucha.
- Voces para videojuegos y prototipos interactivos: generación de líneas de diálogo de personajes no jugadores (NPC) en coreano durante el desarrollo, antes de contratar actores de doblaje.
- Generación de pódcast sintéticos y resúmenes hablados: conversión de boletines o artículos a audio en coreano dentro de un pipeline automatizado, siempre que la licencia resultante lo permita.
- Preprocesado de datos de voz: uso del modelo como generador de muestras sintéticas para aumento de datos en experimentos de reconocimiento de voz en coreano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio no incluye sección de evaluación (la plantilla aparece sin rellenar y el apartado "Results" figura como "[More Information Needed]"). No se dispone de valores de MOS, MCD, WER ni de comparaciones con otros sistemas TTS, por lo que no se pueden presentar cifras verificables.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 145 MB en fp32 y 73 MB en fp16/bf16, calculados a partir de los 36.282.096 parámetros; no se dispone de mediciones reales de memoria reservada durante la inferencia.
- Cuantización: no se publican pesos cuantizados en el repositorio; una conversión a int8 reduciría el peso a unos 36 MB, pero no hay artefactos de este tipo disponibles.
- GPU recomendadas: cualquier GPU con al menos 1 GB de memoria libre es suficiente por tamaño; una NVIDIA RTX 3060, RTX 4090, A100 o H100 no suponen ninguna restricción, aunque están sobredimensionadas para este modelo.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo moderna e incluso en iGPU con memoria compartida suficiente.
- Ejecución en CPU: viable por el reducido número de parámetros; es el escenario de despliegue más razonable para este checkpoint.
- Opciones de despliegue: `transformers` (pipeline `text-to-audio`) es la vía documentada por la librería del repositorio; exportación a ONNX y despliegue en Hugging Face Inference Endpoints son compatibles según la etiqueta `endpoints_compatible`. No se espera soporte en vLLM, llama.cpp u Ollama, que están orientados a modelos de lenguaje, no a TTS.
- Latencia y throughput: no disponibles. No hay mediciones publicadas de factor de tiempo real ni de audio generado por segundo.
- Advertencia de integridad del repositorio: con 0,1 GB de tamaño y solo pesos safetensors, conviene verificar si el repositorio incluye `config.json`, ficheros de tokenizador y la configuración del vocoder; en caso contrario habría que cargarlos desde facebook/mms-tts-kor.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Idioma | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| hong28297/mestory-mms-tts-kor-t2 | 36.282.096 | VITS (según etiqueta) | coreano (inferido) | no disponible | 0 descargas, 0 likes |
| facebook/mms-tts-kor | no disponible en la búsqueda | VITS (familia MMS) | coreano | no disponible en la búsqueda (la familia MMS se publica habitualmente bajo CC-BY-NC 4.0) | modelo base de referencia, ampliamente utilizado |
| hong28297/mestory-mms-tts-kor-h1 | no disponible | VITS (según etiqueta) | coreano (inferido) | no disponible | repositorio hermano del mismo autor |

No se han verificado otros modelos comparables con datos suficientes (parámetros, contexto y licencia confirmados) en la información disponible.

## Limitaciones y advertencias

- Model card vacía: el autor no ha documentado arquitectura, datos de entrenamiento, evaluación ni uso previsto; toda la información técnica de esta ficha procede de metadatos del Hub y de inferencias a partir del nombre del repositorio.
- Licencia no declarada: sin licencia explícita, el uso comercial queda en un limbo legal. Además, el modelo deriva presumiblemente de facebook/mms-tts-kor, cuya familia se distribuye habitualmente bajo CC-BY-NC 4.0, lo que restringiría el uso comercial. Es imprescindible verificar este punto antes de cualquier despliegue productivo.
- Riesgo de alucinación: en TTS se manifiesta como pronunciaciones incorrectas, omisiones, repeticiones o artefactos acústicos en el audio generado, especialmente con texto fuera de dominio, números, siglas o préstamos léxicos.
- Cobertura de idioma: no hay confirmación oficial de que el modelo sintetice únicamente coreano; el comportamiento con texto en otros idiomas no está documentado.
- Sesgos: no se ha publicado ningún análisis de sesgos de voz, acento, género o registro. Un checkpoint ajustado sobre un corpus concreto puede reproducir un timbre o prosodia muy específicos y limitar la variedad de voces.
- Ausencia de evaluación objetiva: no hay métricas de calidad (MOS, MCD, WER de transcripción inversa) ni comparación con el modelo base, por lo que no se puede afirmar que este ajuste mejore a facebook/mms-tts-kor.
- Procedencia poco clara: el repositorio no indica qué datos se usaron para el ajuste ni si existe consentimiento sobre las voces empleadas, un aspecto relevante desde el punto de vista legal y ético.
- Fechas de metadatos anómalas: la fecha de creación registrada (2026-10-08) es posterior a la fecha actual típica de consulta; conviene tratarla con cautela.
- Repositorio sin validación comunitaria: 0 descargas y 0 likes implican ausencia de pruebas independientes de funcionamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hong28297/mestory-mms-tts-kor-t2
- Repositorio hermano del mismo autor: https://huggingface.co/hong28297/mestory-mms-tts-kor-h1
- Modelo base de referencia: https://huggingface.co/facebook/mms-tts-kor
- Artículo del proyecto MMS, "Scaling Speech Technology to 1,000+ Languages": https://arxiv.org/abs/2305.13516
- Artículo de la arquitectura VITS, "Conditional Variational Autoencoder with Adversarial Learning for End-to-End Text-to-Speech": https://arxiv.org/abs/2106.06103
- Artículo enlazado en la etiqueta `arxiv:1910.09700` (estimación de emisiones de carbono, no especifico de este modelo): https://arxiv.org/abs/1910.09700
- Guía de uso de MMS TTS coreano en local: https://aiindigo.com/tutorials/getting-started-with-mms-tts-korean-generate-high-quality-audio-locally
- Ficha de mms-tts-kor en AIBase: https://model.aibase.com/models/details/1915693302294405122
