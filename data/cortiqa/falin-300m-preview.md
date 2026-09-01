# Cortiqa/Falin-300M-Preview

## Resumen

Falin-300M-Preview es un modelo de lenguaje pequeño (SLM) de 297 millones de parámetros, desarrollado desde cero por la empresa india Cortiqa. Está diseñado específicamente para inferencia de baja latencia y despliegue en dispositivos de borde: GPUs de consumo, CPUs, móviles y extensiones de navegador. Su arquitectura propietaria, denominada Menothus, incorpora innovaciones como atención por grupos extrema (GQA con ratio 8:1), atención de ventana deslizante híbrida y ejecución paralela de atención y FFN, lo que reduce el consumo de memoria KV-cache y mejora la utilización de la GPU.

El modelo se presenta como una vista previa de investigación (v0.1-Alpha) y está orientado al ecosistema indio, con soporte para inglés e hindi. Su contexto máximo es de 1024 tokens, lo que limita su uso a tareas de conversación corta o procesamiento de fragmentos pequeños. A pesar de su tamaño reducido, la arquitectura busca maximizar la eficiencia computacional, posicionándolo como una alternativa soberana y de bajo coste frente a modelos más grandes.

La relevancia actual de Falin-300M radica en la tendencia hacia modelos pequeños y eficientes que puedan ejecutarse localmente sin depender de infraestructura en la nube. Cortiqa lo presenta como parte de su estrategia de construir IA soberana para India, con un enfoque en velocidad y recursos mínimos. No obstante, al ser una vista previa sin benchmarks publicados ni documentación de entrenamiento, su adopción en producción requiere una evaluación cuidadosa.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Menothus (decoder-only transformer con GQA, SWA híbrida, FFN SwiGLU paralelo) |
| Parametros totales | 297.034.800 (~300M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (en), hindi (hi) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (probablemente safetensors, no confirmado) |

## Arquitectura y entrenamiento

Falin-300M emplea una arquitectura transformer decoder-only de 24 capas con dimensión oculta de 1024. La atención por grupos extrema (GQA) reduce el número de cabezas clave-valor a 2 frente a 16 cabezas de consulta, lo que disminuye el consumo de memoria KV-cache en un 75% durante la inferencia. La atención de ventana deslizante (SWA) utiliza una ventana local de 512 tokens, y cada cuarta capa computa atención global densa, permitiendo capturar dependencias de largo alcance sin el coste completo de la atención global. Además, la atención y la red feed-forward (SwiGLU con dimensión intermedia de 2816) se ejecutan en paralelo, mejorando la utilización de la GPU y reduciendo la latencia por capa. El modelo está optimizado para FlashAttention y SDPA.

No se ha publicado información sobre el proceso de entrenamiento: ni el número de tokens, ni la composición del dataset, ni si se aplicaron técnicas como RLHF o DPO. Tampoco se detalla el método de tokenización más allá de un vocabulario BPE de 32.000 entradas. La ausencia de estos datos impide evaluar la calidad del preentrenamiento y su posible sesgo.

## Capacidades

- Generación de texto autoregresiva en inglés e hindi, con un contexto máximo de 1024 tokens.
- Inferencia de baja latencia optimizada para dispositivos de borde: GPUs de consumo, CPUs, móviles y extensiones de navegador.
- Reducción de memoria KV-cache gracias a GQA extrema (8:1), lo que permite ejecutar el modelo en hardware con poca VRAM.
- Atención híbrida con ventana deslizante que equilibra coste computacional y capacidad de modelado de dependencias locales y globales.
- Compatibilidad nativa con FlashAttention y SDPA para acelerar la atención en GPUs modernas.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, visión o audio.

## Casos de uso

- Chatbots de atención al cliente en dispositivos móviles: el modelo puede ejecutarse localmente en un smartphone, respondiendo consultas frecuentes en inglés o hindi sin conexión a internet, gracias a su bajo consumo de memoria y latencia reducida.
- Asistentes de voz embebidos: integrado en dispositivos IoT o asistentes domésticos, Falin-300M puede procesar comandos de voz cortos (convertidos a texto) y generar respuestas rápidas, aprovechando su contexto de 1024 tokens para diálogos breves.
- Extensiones de navegador para autocompletado o resumen de texto: al ser ligero, puede cargarse en el navegador y ofrecer sugerencias de escritura o resúmenes de párrafos en tiempo real, sin enviar datos a servidores externos.
- Traducción automática básica entre inglés e hindi: aunque no está específicamente entrenado para traducción, su bilingüismo permite generar traducciones aproximadas en fragmentos cortos, útil para aplicaciones de viajes o comunicación informal.
- Generación de contenido corto para redes sociales: redacción de titulares, descripciones o respuestas breves en inglés e hindi, con baja latencia para integración en herramientas de marketing.
- Prototipado rápido de aplicaciones de IA en entornos educativos: por su tamaño reducido y licencia Apache 2.0, es adecuado para que estudiantes y desarrolladores experimenten con modelos de lenguaje en hardware modesto, aprendiendo sobre arquitecturas eficientes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No existen datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar que permitan comparar su rendimiento con modelos similares. La ausencia de métricas objetivas dificulta la validación de sus capacidades reales.

## Requisitos de hardware

- VRAM estimada: un modelo de 297M parámetros en FP16 requiere aproximadamente 600 MB de memoria, y en INT8 alrededor de 300 MB. Con la reducción de KV-cache por GQA, la huella total de inferencia podría ser inferior a 1 GB en FP16.
- GPUs recomendadas: cualquier GPU con al menos 2 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3050) puede ejecutar el modelo cómodamente. También es viable en GPUs integradas de portátiles modernos.
- Compatibilidad con consumer GPU: sí, es adecuado para GPUs de gama baja y media, así como para CPUs con instrucciones AVX2.
- Opciones de despliegue: no se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI. El código de inferencia proporcionado en la model card es básico y requiere cargar los pesos manualmente con PyTorch y tokenizers.
- Latencia y throughput: no hay datos oficiales. Dado el tamaño y la arquitectura optimizada, se espera una latencia de decodificación de decenas de milisegundos por token en hardware moderno, pero no se puede confirmar sin pruebas.

## Comparativa con modelos similares

No se dispone de información comparativa publicada por el autor. Como referencia estructural, se puede comparar con otros SLM de tamaño similar:

| Modelo | Parámetros | Contexto | Arquitectura | Licencia |
|---|---|---|---|---|
| Falin-300M | 297M | 1024 | Menothus (GQA, SWA) | Apache 2.0 |
| GPT-2 (124M) | 124M | 1024 | Transformer estándar | MIT |
| TinyLlama (1.1B) | 1.1B | 2048 | Transformer (Llama) | Apache 2.0 |
| Phi-2 (2.7B) | 2.7B | 2048 | Transformer | MIT |

No hay datos de rendimiento para establecer una comparación cuantitativa. Falin-300M se distingue por su GQA extrema y SWA híbrida, pero su contexto de 1024 tokens es inferior al de alternativas como TinyLlama o Phi-2.

## Limitaciones y advertencias

- Modelo en fase de vista previa alfa (v0.1-Alpha): no está listo para uso en producción sin una evaluación exhaustiva.
- Contexto limitado a 1024 tokens, insuficiente para tareas que requieran documentos largos o conversaciones extensas.
- Solo soporta inglés e hindi; no cubre otros idiomas, lo que restringe su aplicabilidad global.
- No se han publicado benchmarks ni evaluaciones de sesgos, alucinaciones o seguridad. El riesgo de generar contenido incorrecto o sesgado es desconocido.
- Arquitectura propietaria (Menothus): no hay garantía de compatibilidad con frameworks estándar de inferencia (vLLM, llama.cpp, etc.), lo que puede dificultar su integración en infraestructuras existentes.
- No se documenta el proceso de entrenamiento (datos, tokens, alineación), por lo que no se puede verificar la calidad del modelo ni su comportamiento ético.
- Licencia Apache 2.0 permite uso comercial, pero al ser una vista previa, el soporte y mantenimiento por parte de Cortiqa no están garantizados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Cortiqa/Falin-300M-Preview
- Sitio web de Cortiqa: https://cortiqa.co/
- Sitio web de Cortiqa India: https://cortiqa.in/
- Página del modelo Falin-01 (producto relacionado): https://cortiqa.co/models/falin-01
- Documentación de Corti Models (API): https://docs.corti.ai/models/welcome
- Comparativa de modelos de Corti: https://docs.corti.ai/models/models
