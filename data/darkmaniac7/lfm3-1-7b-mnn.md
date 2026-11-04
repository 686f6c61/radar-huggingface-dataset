# darkmaniac7/LFM3-1.7B-MNN

## Resumen

LFM3-1.7B-MNN es una conversión al formato MNN (Alibaba Mobile Neural Network) del modelo LFM3 1.7B desarrollado originalmente por Liquid AI. La conversión y cuantización a int4 la publica darkmaniac7 bajo la marca TokForge, con el objetivo de habilitar inferencia local en dispositivos móviles dentro de la aplicación TokForge (Android e iOS vía TestFlight). No se trata de un modelo nuevo, sino de un artefacto de despliegue: los pesos originales de Liquid AI se han reconvertido y cuantizado para que quepan y funcionen en hardware de gama móvil.

El modelo base, LFM3 1.7B, emplea una arquitectura híbrida propia de Liquid AI: 13 capas de convolución corta, 6 capas de atención completa y 5 capas de atención de ventana deslizante, con atención GQA de 16 cabezas de consulta y 4 de clave/valor. Esa proporción mayoritaria de convoluciones mantiene baja la memoria en conversaciones largas, lo que resulta clave para el despliegue en dispositivos con recursos limitados.

La relevancia de esta ficha radica en que documenta una vía concreta de ejecución on-device de un modelo de 1.700 millones de parámetros en int4 (repositorio de 1,3 GB), con vocabulario de 128.000 tokens y licencia LFM Open License v1.0. Está pensado para inglés y para el ecosistema MNN/TokForge, no para servidores de inferencia convencionales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LFM3 híbrida: 13 capas de convolución corta, 6 de atención completa, 5 de atención de ventana deslizante; GQA 16Q/4KV |
| Parámetros totales | 1,7B |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | int4, block size 32, HQQ; embedding y cabeza atados en el fichero de pesos |
| Idiomas soportados | inglés (en) |
| Licencia | LFM Open License v1.0 (lfm1.0) |
| Formato de pesos | MNN (llm.mnn, llm.mnn.weight, llm.mnn.json) |
| Vocabulario | 128.000 tokens |
| Modelo base | LiquidAI/LFM3-1.7B |
| Tamaño del repositorio | 1,3 GB |

## Arquitectura y entrenamiento

La arquitectura del modelo base es la LFM3 híbrida de Liquid AI, que combina capas de convolución corta con capas de atención. En concreto, el modelo tiene 13 capas de convolución corta, 6 capas de atención completa y 5 capas de atención de ventana deslizante, con atención de consultas agrupadas (GQA) de 16 cabezas de consulta y 4 de clave/valor. Esta mezcla reduce el coste de memoria en contextos largos respecto a un transformer de atención completa, lo que explica su idoneidad para chats prolongados en dispositivos móviles. El vocabulario es de 128.000 tokens.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO en el modelo original, más allá de lo que indique la model card de Liquid AI. La conversión aquí publicada no reentrena el modelo: únicamente transforma los pesos a MNN y los cuantiza a int4 con HQQ (block size 32), manteniendo el embedding y la cabeza de salida atados en el fichero de pesos. El grafo de cómputo y la configuración del runtime se distribuyen en `llm.mnn`, `llm.mnn.json`, `llm_config.json` y `config.json`, junto con el tokenizador `tokenizer.mtok`.

## Capacidades

- Generación de texto y conversación general en inglés.
- Seguimiento de instrucciones (instruction following) según la descripción del autor.
- Conversaciones multi-turno con memoria contenida gracias a la proporción mayoritaria de capas convolucionales.
- Inferencia completamente local, sin conexión a internet, dentro de la app TokForge.
- Tokenización con vocabulario de 128.000 tokens.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Asistente de chat privado en móvil: el modelo se ejecuta íntegramente en el dispositivo mediante TokForge, de modo que las conversaciones no salen del teléfono; encaja en escenarios de privacidad estricta donde no se permite enviar texto a un servidor.
- Conversaciones largas en dispositivos de gama media: la arquitectura con 13 capas de convolución corta mantiene acotado el consumo de memoria en chats extensos, lo que permite sesiones prolongadas sin que la app se quede sin RAM.
- Aplicaciones de campo sin conectividad: al no requerir internet, sirve para asistentes en entornos rurales, industriales o de viaje donde la cobertura es intermitente o inexistente.
- Prototipado rápido de funciones de texto en Android: con el APK de TokForge y la descarga del modelo desde la propia app, un desarrollador puede validar flujos de generación de texto on-device sin montar infraestructura de servidores.
- Distribución de asistentes embebidos en apps móviles: el formato MNN y el runtime de Alibaba permiten integrar el modelo en aplicaciones Android nativas que ya usen MNN para otras tareas de inferencia.
- Evaluación de modelos pequeños para edge: sirve como referencia práctica para medir latencia y consumo de un modelo de 1,7B en int4 antes de comprometerse con un despliegue mayor en hardware móvil.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada: el repositorio ocupa 1,3 GB; en inferencia hay que sumar el espacio de trabajo del runtime MNN y la caché KV, por lo que se recomienda disponer de al menos 2 GB de memoria libre en el dispositivo (estimación, no dato publicado).
- GPU recomendadas: no aplica en el sentido de servidor; el modelo está orientado a SoC móviles (CPU/GPU/NPU del dispositivo) a través del runtime MNN.
- ¿Cabe en GPU de consumo? No está pensado para GPUs de escritorio; no se dispone de datos de ejecución en RTX 4090, A100 o H100 con este formato.
- Opciones de despliegue: exclusivamente el runtime MNN, a través de la app TokForge 1.3.9.7 o superior (Android; iOS vía TestFlight). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM3-1.7B-MNN (esta ficha) | 1,7B (int4) | no disponible | MNN | LFM Open License v1.0 | Hugging Face + app TokForge |
| LiquidAI/LFM3-1.7B (original) | 1,7B | no disponible | safetensors (presumible) | LFM Open License v1.0 | Hugging Face |
| Alternativas de ~1-2B para edge | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparado con otras alternativas de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Solo soporta inglés; no hay evidencia de capacidades multilingües.
- No se han publicado evaluaciones de sesgos ni de tasa de alucinación para esta conversión.
- La cuantización a int4 con HQQ y block size 32 puede degradar la calidad respecto a los pesos originales en precisión completa; no se documenta la magnitud de esa pérdida.
- La licencia LFM Open License v1.0 impone condiciones específicas para uso comercial; es necesario revisar el fichero `LICENSE` antes de integrarlo en un producto.
- El formato MNN limita el despliegue al runtime de Alibaba y a la app TokForge; no es directamente utilizable en pilas de servidor habituales.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria de su funcionamiento.
- La fecha de creación indicada (2026-11-03) es posterior a la de esta ficha; conviene verificar la integridad y procedencia de los artefactos antes de usarlos en producción.
- No se especifica la longitud de contexto soportada, lo que impide planificar con precisión el tamaño de las conversaciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/darkmaniac7/LFM3-1.7B-MNN
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- TokForge: https://tokforge.ai
- Discord de TokForge: https://discord.gg/Acv3CBtfVm
- Google Play (app TokForge): https://play.google.com/store/apps/details?id=dev.tokforge
- iOS TestFlight: https://testflight.apple.com/join/jnufjzRr
- MNN (Alibaba): https://github.com/alibaba/MNN
