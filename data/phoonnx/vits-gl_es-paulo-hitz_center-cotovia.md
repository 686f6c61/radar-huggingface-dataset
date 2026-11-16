# Phoonnx/vits-gl_es-paulo-hitz_center-cotovia

## Resumen

`vits-gl_es-paulo-hitz_center-cotovia` es un modelo de síntesis de voz (text-to-speech, TTS) basado en la arquitectura VITS, desarrollado originalmente por el centro HiTZ (Universidad del País Vasco) y empaquetado por Phoonnx para su librería de inferencia ONNX homónima. El modelo original del que deriva es `HiTZ/TTS-gl_paulo`, un sistema entrenado para gallego (`gl-ES`) con una voz concreta identificada como "paulo". El empaquetado añade la conversión a ONNX y la integración con el pipeline de Phoonnx, lo que permite su uso directo en Python y en el ecosistema OVOS.

El problema que resuelve es la disponibilidad de TTS neuronal de calidad en gallego dentro de un stack reproducible y ligero. VITS es una arquitectura end-to-end que combina un codificador de texto, un prior variacional, un decodificador basado en normalizing flows y un discriminador adversarial, lo que permite generar audio de forma directa sin necesidad de vocoder externo. El modelo consume fonemas en alfabeto Cotovia, un estándar de transcripción fonémica para gallego, y produce formas de onda listas para reproducir.

Su relevancia actual es doble: por un lado, cubre una lengua de bajos recursos como el gallego, donde las opciones TTS abiertas son escasas; por otro, su empaquetado ONNX y su licencia Apache 2.0 lo hacen desplegable en entornos de producción sin dependencias pesadas de PyTorch. El tamaño del repositorio (0,1 GB) es coherente con un modelo VITS de tamaño medio, aunque no se especifican el número exacto de parámetros ni la longitud de contexto en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (end-to-end TTS con normalizing flows y discriminador adversarial) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no de contexto de texto) |
| Tipos de cuantizacion | no disponible (pesos en ONNX; no se detallan variantes cuantizadas) |
| Idiomas soportados | gallego (`gl`, `gl-ES`) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (empaquetado para la librería phoonnx) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura VITS, un sistema de síntesis de voz end-to-end que integra en una sola red el codificador de texto, un prior variacional condicionado por el texto, un decodificador generativo basado en normalizing flows y un discriminador adversarial que se entrena de forma conjunta. Esta combinación permite generar formas de onda directamente desde la secuencia de fonemas sin un vocoder separado, lo que reduce la latencia y simplifica el despliegue. La entrada textual se procesa mediante el fonemizador `CotoviaPhonemizer` de la librería `scriptconv`, que normaliza el texto y lo convierte al alfabeto Cotovia antes de alimentar el modelo.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. Tampoco se detallan innovaciones técnicas adicionales más allá de las propias de VITS. El modelo upstream es `HiTZ/TTS-gl_paulo`, desarrollado por HiTZ Center, y el empaquetado para phoonnx se limita a la conversión a ONNX y a la integración con el pipeline de inferencia de dicha librería. El repositorio ocupa 0,1 GB, lo que sugiere un modelo de tamaño moderado, pero no se confirma el número de parámetros.

## Capacidades

- Síntesis de voz en gallego (`gl-ES`) a partir de texto plano, con salida en formato WAV.
- Conversión de texto a fonemas en alfabeto Cotovia mediante `scriptconv` y su extra `scriptconv[gl]`.
- Integración con la librería Phoonnx para inferencia en Python y con el ecosistema OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.
- Generación de audio de una sola locución (voz "paulo"), sin soporte documentado de multi-hablante ni control de estilo.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio de entrada.
- Capacidad multilingüe limitada al gallego; no se indica soporte de otras lenguas.

## Casos de uso

- **Lectura de contenido web en gallego**: el modelo puede convertir artículos, noticias o documentación en audio para accesibilidad o consumo pasivo, usando el fonemizador Cotovia para normalizar el texto y generar WAV reproducible en cualquier reproductor.
- **Asistentes de voz en OVOS**: mediante el plugin `ovos-tts-plugin-phoonnx`, se integra en asistentes domésticos configurados en `mycroft.conf` con la voz `hitz/gl_paulo-vits`, proporcionando respuestas habladas en gallego sin depender de servicios en la nube.
- **Locución automatizada de contenidos educativos**: generación de audios para materiales didácticos en gallego, con la ventaja de que el modelo es ligero (0,1 GB) y puede ejecutarse en local, lo que facilita su uso en centros con recursos limitados.
- **Sistemas de anuncios y megafonía**: síntesis de avisos pregrabados o dinámicos en gallego para transporte público, aeropuertos o edificios públicos, donde la latencia de VITS es adecuada para generar el audio al vuelo.
- **Prototipado de interfaces conversacionales**: desarrolladores que necesiten un TTS en gallego para probar flujos de voz pueden usar el modelo con `pip install --pre phoonnx "scriptconv[gl]"` y la API de `TTSModelManager`, sin necesidad de entrenar ni ajustar nada.
- **Generación de audiolibros o pódcast**: conversión de textos largos en gallego a audio, procesando el texto por fragmentos y concatenando los WAV resultantes, aprovechando la licencia Apache 2.0 para uso comercial.
- **Investigación en TTS para lenguas de bajos recursos**: el modelo sirve como línea base reproducible para comparar con otros sistemas VITS en gallego, dado que el código de inferencia y los pesos están disponibles abiertamente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia**: no disponible de forma explícita; por el tamaño del repositorio (0,1 GB), el modelo es muy ligero y cabe holgadamente en GPUs de consumo e incluso podría ejecutarse en CPU.
- **GPU recomendadas**: no se especifican. Dado el tamaño, cualquier GPU con al menos 1-2 GB de memoria libre debería ser suficiente; también es viable en CPU para cargas moderadas.
- **Cabe en consumer GPU**: sí, previsiblemente en cualquier GPU de consumo moderna (GTX 1060 o superior, RTX 2060 o superior) e incluso en placas integradas para inferencia en CPU.
- **Opciones de despliegue**: librería Phoonnx (Python), plugin OVOS (`ovos-tts-plugin-phoonnx`), y cualquier runtime compatible con ONNX. No se documenta soporte directo para vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo TTS.
- **Latencia y throughput estimados**: no disponibles. En arquitecturas VITS, la latencia suele ser baja (del orden de décimas de segundo por frase en GPU), pero no se confirma con datos del autor.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `Phoonnx/vits-gl_es-paulo-hitz_center-cotovia` | VITS (ONNX) | Gallego | no disponible | no aplica | Apache 2.0 | Hugging Face, phoonnx, OVOS |
| `HiTZ/TTS-gl_paulo` | VITS (upstream) | Gallego | no disponible | no aplica | Apache 2.0 | Hugging Face |
| Otros TTS multilingües (p. ej. MMS-TTS de Meta) | VITS | Multilingüe (incluye gallego) | no disponible | no aplica | CC-BY-NC 4.0 (según variante) | Hugging Face |
| Coqui TTS (modelos VITS) | VITS | Varios | no disponible | no aplica | MPL 2.0 (código) / variable por modelo | GitHub, Hugging Face |

La comparativa se limita a alternativas de la misma categoría (TTS neuronal). No se dispone de datos de rendimiento objetivos para comparar numéricamente; la principal ventaja de este modelo es su licencia Apache 2.0 y su empaquetado ONNX ligero, frente a opciones multilingües con licencias más restrictivas o mayor peso.

## Limitaciones y advertencias

- **Idioma único**: el modelo solo soporta gallego (`gl-ES`); no se documenta soporte de castellano, portugués ni otras lenguas, lo que limita su uso en entornos multilingües.
- **Una sola voz**: la voz "paulo" es la única disponible; no hay control de multi-hablante, emoción ni estilo.
- **Riesgo de alucinación en TTS**: como todo sistema neuronal, puede generar pronunciaciones incorrectas ante palabras fuera del vocabulario, siglas o nombres propios no cubiertos por el fonemizador Cotovia.
- **Dependencia del fonemizador**: la calidad de la síntesis depende de `scriptconv[gl]` y del `CotoviaPhonemizer`; errores en la normalización del texto se traducen directamente en audio defectuoso.
- **Licencia**: Apache 2.0 permite uso comercial, pero se recomienda verificar la licencia del modelo upstream (`HiTZ/TTS-gl_paulo`) y de las dependencias (`scriptconv`, `phoonnx`) antes de desplegar en producción.
- **Sin benchmarks publicados**: no hay métricas objetivas (MOS, WER, latencia) que permitan evaluar la calidad frente a alternativas; se recomienda una evaluación propia antes de adoptarlo.
- **Fecha de creación futura**: el repositorio figura como creado en 2026-11-14, lo que puede indicar un error en los metadatos o una fecha de publicación programada; conviene verificar la disponibilidad real de los pesos.
- **Documentación escasa**: no se detallan parámetros, dataset de entrenamiento ni proceso de conversión a ONNX, lo que dificulta la reproducibilidad.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Phoonnx/vits-gl_es-paulo-hitz_center-cotovia)
- [Modelo upstream HiTZ/TTS-gl_paulo](https://huggingface.co/HiTZ/TTS-gl_paulo)
- [Repositorio phoonnx](https://github.com/TigreGotico/phoonnx)
- [Repositorio scriptconv](https://github.com/TigreGotico/scriptconv)
- [Colección VITS de Phoonnx](https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65)
