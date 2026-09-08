# nassimjp/MiniCPM5-2B-SFT-Pashto-Instruct-GGUF

## Resumen

El modelo es una versión cuantizada en formato GGUF de MiniCPM5-2B-SFT-Pashto-Instruct, un modelo de lenguaje especializado en pashto (idioma oficial de Afganistán). Fue desarrollado por nassimjp como parte de la iniciativa iPashto.ai, que busca avanzar en herramientas de NLP de código abierto para pashto. El modelo base es MiniCPM5-2B de OpenBMB, un Transformer denso de 2.500 millones de parámetros diseñado para ejecución local en dispositivos con recursos limitados. Esta versión GGUF en precisión f16 permite ejecutar el modelo con llama.cpp, Ollama o LM Studio en CPUs, portátiles, móviles y GPUs de consumo, sin necesidad de infraestructura cloud. Su relevancia radica en ofrecer una opción de IA generativa en pashto para entornos con baja conectividad o requisitos de privacidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (MiniCPM-2B) |
| Parámetros totales | 2.516.944.896 (2.5B) |
| Parámetros activos | no aplica (modelo denso) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantización | GGUF f16 (según model card) |
| Idiomas soportados | Pashto (ps) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

MiniCPM5-2B es un Transformer denso de 2B parámetros que escala la misma receta de entrenamiento que MiniCPM5-1B, según el repositorio de OpenBMB. Está diseñado para escenarios de despliegue local y con recursos limitados. Sobre este modelo base se realizó un fine-tuning supervisado (SFT) para instrucciones en pashto, dando lugar a nassimjp/MiniCPM5-2B-SFT-Pashto-Instruct. Posteriormente, se exportó a formato GGUF en precisión f16 para facilitar su ejecución en herramientas como llama.cpp y Ollama. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de técnicas como RLHF o DPO.

## Capacidades

- Generación de texto en pashto siguiendo instrucciones conversacionales.
- Ejecución local en CPUs, portátiles, móviles y GPUs de consumo gracias al formato GGUF.
- Compatibilidad con llama.cpp, Ollama, LM Studio y vLLM.
- Despliegue en entornos edge sin dependencia de servicios cloud.
- No se documenta soporte de tool calling, function calling, agentes, visión ni audio.

## Casos de uso

- Asistente conversacional en pashto para dispositivos móviles: el modelo puede ejecutarse en local mediante Ollama en un smartphone o portátil, ofreciendo respuestas en pashto sin conexión.
- Atención al cliente en pashto para servicios locales: integración en un chatbot que gestione consultas de usuarios afganos, con despliegue en un servidor de bajo coste o directamente en el dispositivo.
- Generación de contenido educativo en pashto: creación de ejercicios, resúmenes o material didáctico para escuelas y universidades afganas, aprovechando el formato instructivo del modelo.
- Procesamiento de documentos en pashto: resumen o extracción de información de textos administrativos, legales o periodísticos, ejecutado de forma local para preservar la privacidad.
- Herramientas de accesibilidad para hablantes de pashto: generación de subtítulos o descripciones de contenido multimedia, con la ventaja de poder funcionar en dispositivos sin conexión.
- Investigación en NLP para pashto: el modelo sirve como base para fine-tuning en tareas específicas, dado su tamaño reducido y licencia Apache-2.0.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en f16: aproximadamente 5 GB (2.5B parámetros × 2 bytes) más overhead de ejecución.
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM, como RTX 3060, RTX 4060 o superiores. También funciona en Apple Silicon.
- Cabe en GPUs de consumo: sí, con 6-8 GB de VRAM.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y vLLM.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información verificada sobre modelos comparables en la documentación proporcionada. Los datos de rendimiento de alternativas como MiniCPM5-1B o Gemma-2-2B no están disponibles, por lo que no se puede establecer una comparativa fiable.

## Limitaciones y advertencias

- La longitud de contexto de 2048 tokens es reducida, lo que limita el manejo de documentos largos o conversaciones extensas.
- El modelo está especializado en pashto; su rendimiento en otros idiomas no está documentado y probablemente sea deficiente.
- Al ser un fine-tuning sobre un dataset específico, puede heredar sesgos presentes en el corpus de entrenamiento.
- El repositorio solo incluye la cuantización f16 según la información disponible, lo que supone un mayor consumo de memoria que cuantizaciones de 4 o 8 bits.
- No se dispone de información sobre la calidad del dataset de instrucciones en pashto ni sobre su evaluación.
- El modelo tiene 0 descargas y 0 likes en HuggingFace, lo que indica una validación externa limitada.
- La licencia Apache-2.0 permite uso comercial, pero el usuario debe verificar la procedencia de los datos de entrenamiento.

## Enlaces

- HuggingFace: https://huggingface.co/nassimjp/MiniCPM5-2B-SFT-Pashto-Instruct-GGUF
- Modelo base (safetensors): https://huggingface.co/nassimjp/MiniCPM5-2B-SFT-Pashto-Instruct
- Modelo original OpenBMB: https://huggingface.co/openbmb/MiniCPM5-2B-SFT
- Repositorio GitHub de MiniCPM: https://github.com/OpenBMB/MiniCPM
