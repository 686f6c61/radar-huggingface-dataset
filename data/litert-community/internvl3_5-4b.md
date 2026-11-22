# litert-community/InternVL3_5-4B

## Resumen

InternVL3_5-4B en formato LiteRT-LM es una conversión del modelo vision-lenguaje InternVL3.5-4B de OpenGVLab al formato `.litertlm` para inferencia local en dispositivos (on-device) mediante el runtime LiteRT-LM de Google. El modelo combina un codificador visual InternViT con un decodificador de lenguaje Qwen3-4B, permitiendo responder preguntas sobre imágenes sin conexión a la nube. El artefacto ocupa aproximadamente 3,00 GB y está cuantizado (int8 para visión, int4 para el decodificador), lo que lo hace apto para móviles y equipos de sobremesa.

La relevancia actual reside en que demuestra que un VLM de 4B puede ejecutarse íntegramente en un dispositivo de consumo con un rendimiento aceptable: en una GPU Galaxy S26 alcanza 18,7 tokens/s en decodificación y 195 tokens/s en prefill de 1.024 tokens con LiteRT-LM v0.19.0. Sin embargo, la conversión presenta limitaciones documentadas: el encoder visual en GPU falla en varias plataformas, y el modelo solo se ha probado con las versiones 0.19.0 a 0.19.2 del runtime.

Este modelo es relevante para desarrolladores que necesitan capacidades multimodales en entornos con restricciones de privacidad, latencia o conectividad, como aplicaciones móviles de accesibilidad o asistentes de campo. No obstante, su contexto limitado (2.048 tokens) y la falta de benchmarks publicados en la información disponible exigen una evaluación cuidadosa antes de usarlo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language: InternViT (encoder) + pixel-shuffle + MLP projector + Qwen3-4B (decoder) |
| Parametros totales | no disponible (el modelo base InternVL3.5-4B tiene ~4B, pero no se detalla en la información) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 2.048 tokens (KV cache) |
| Tipos de cuantizacion | Vision: int8; decoder: int4 (simétrico, blockwise-32 + OCTAV optimal-clipping); embedding de entrada: INT8 externalizado |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | `.litertlm` (LiteRT-LM); tamaño ~3,00 GB |

## Arquitectura y entrenamiento

InternVL3.5-4B sigue la arquitectura típica de los modelos vision-lenguaje de InternVL: un encoder visual InternViT que procesa imágenes de 448×448 píxeles, seguido de una capa de pixel-shuffle y un proyector MLP que transforma las características visuales en tokens compatibles con el decodificador. El decodificador es Qwen3-4B, un transformer autorregresivo que en esta conversión se ha cuantizado a int4 con técnicas de clipping óptimo (OCTAV) y cuantización por bloques de 32. La imagen de entrada se redimensiona a 448×448 y produce 256 tokens visuales, con la normalización ImageNet integrada en el encoder visual.

No se dispone de información sobre los datos de entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF/DPO) en la información proporcionada. La conversión a LiteRT-LM externaliza la sección de embeddings para cumplir con el límite de mmap de iOS y reescribe el grafo de prefill/decode para GPU (en la actualización del 15 de noviembre de 2026), manteniendo los pesos sin cambios. El runtime LiteRT-LM utiliza un camino multimodal `fast_vlm` para la inferencia.

## Capacidades

- Generación de texto condicionada a imagen: responde preguntas sobre el contenido visual de una imagen (descripción, objetos, escenas).
- Razonamiento visual básico: puede identificar objetos, contar elementos y describir relaciones espaciales simples.
- Procesamiento de una única imagen por consulta (resize a 448×448, 256 tokens visuales).
- Soporte de chat interactivo mediante el CLI de LiteRT-LM (eliminando `--prompt`).
- Posibilidad de pasar múltiples imágenes con `--attachment` repetido, aunque la model card menciona una limitación conocida al respecto.
- Inferencia totalmente on-device, sin necesidad de conexión a internet tras la descarga inicial.
- No se documentan capacidades de tool calling, agentes, matemáticas avanzadas ni otros idiomas distintos del inglés (no disponible).

## Casos de uso

- **Asistentes de accesibilidad en móvil**: el modelo puede describir el entorno a personas con discapacidad visual mediante una foto tomada con la cámara del teléfono. Su tamaño de 3 GB y su ejecución on-device permiten privacidad y funcionamiento sin red.
- **Inventario y control de calidad en campo**: un técnico fotografía un equipo o producto y el modelo responde si coincide con la descripción esperada. La latencia de prefill (195 tokens/s en Galaxy S26) permite respuestas rápidas en entornos industriales.
- **Moderación de contenido visual local**: clasificación preliminar de imágenes en dispositivos edge antes de enviarlas a un servidor, reduciendo ancho de banda y mejorando la privacidad.
- **Educación interactiva**: aplicación infantil que responde preguntas sobre imágenes de un libro o entorno, funcionando sin conexión en tablets o móviles.
- **Documentación de campo**: el modelo puede transcribir o describir el contenido de una fotografía de un documento o pizarra, útil en entornos sin cobertura.
- **Prototipado rápido de VLM en edge**: desarrolladores que necesitan validar una idea de producto multimodal sin depender de APIs en la nube pueden usar este modelo con LiteRT-LM para pruebas de concepto en dispositivos reales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

Los únicos datos de rendimiento proporcionados son de inferencia en hardware concreto:

| Métrica | Valor | Hardware / runtime |
|---|---|---|
| Decodificación | 18,7 tokens/s | Galaxy S26 GPU, LiteRT-LM v0.19.0 |
| Prefill (1.024 tokens) | 195 tokens/s | Galaxy S26 GPU, LiteRT-LM v0.19.0 |

## Requisitos de hardware

- **VRAM/RAM estimada**: el archivo `.litertlm` ocupa ~3,00 GB; se necesita al menos esa cantidad de memoria libre para cargar el modelo, más overhead del runtime.
- **GPU recomendadas**: no se especifican modelos de GPU de escritorio; las pruebas documentadas se realizaron en Galaxy S26 (GPU móvil) y Mac (CPU y GPU).
- **Compatibilidad con consumer GPU**: no hay datos sobre GPUs de escritorio (RTX 4090, etc.). El modelo está orientado a dispositivos edge y móviles.
- **Opciones de despliegue**: exclusivamente LiteRT-LM (CLI `litert-lm run` y `litert-lm serve`). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- **Latencia y throughput**: 18,7 tokens/s de decodificación y 195 tokens/s de prefill en Galaxy S26 GPU con LiteRT-LM v0.19.0. En CPU, el rendimiento no se cuantifica en la información disponible.
- **Limitación importante**: el encoder visual en GPU falla en Mac, Galaxy S26 y Pixel 11 Pro (errores con operaciones BROADCAST_TO y GATHER_ND); se recomienda usar el encoder visual en CPU (opción por defecto del CLI).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato / runtime | Notas |
|---|---|---|---|---|---|
| InternVL3_5-4B (este) | ~4B (no detallado) | 2.048 | Apache-2.0 | `.litertlm` / LiteRT-LM | On-device, cuantizado int4/int8 |
| InternVL3-2B (mencionado en la model card) | ~2B | no disponible | no disponible | no disponible | Usa Qwen2.5-1.5B como decoder; anterior generación |
| FastVLM-0.5B (litert-community) | 0,5B | no disponible | no disponible | `.litertlm` / LiteRT-LM | Mismo runtime, modelo más pequeño |

No se dispone de datos de benchmarks para comparar rendimiento entre estos modelos. La comparativa se limita a aspectos estructurales y de licencia.

## Limitaciones y advertencias

- **Contexto muy limitado**: 2.048 tokens de KV cache restringen conversaciones multi-turno y el tamaño de las consultas.
- **Una sola imagen por consulta**: el soporte de múltiples imágenes existe pero la model card menciona una limitación conocida no detallada.
- **Fallo del encoder visual en GPU**: en Mac, Galaxy S26 y Pixel 11 Pro el encoder visual en GPU no responde; es necesario usar CPU para el encoder visual, lo que puede reducir el rendimiento.
- **Dependencia de versión del runtime**: solo se ha probado con LiteRT-LM 0.19.0 a 0.19.2; versiones anteriores no son compatibles.
- **Riesgo de descarga incompleta**: el CLI puede retener archivos incompletos en caché sin verificar su tamaño, provocando errores (bus error, exit 138) que requieren borrar manualmente el archivo.
- **Sesgos y alucinaciones**: no se documentan sesgos específicos, pero al ser un modelo de 4B cuantizado, el riesgo de alucinación en descripciones visuales detalladas es plausible; no hay evaluación disponible.
- **Idiomas**: no se especifican los idiomas soportados; la model card está en inglés y los ejemplos son en inglés, por lo que el soporte multilingüe no está garantizado.
- **Licencia Apache-2.0**: permite uso comercial, pero el modelo base y la conversión pueden tener restricciones adicionales no detalladas; se recomienda revisar la licencia del modelo base OpenGVLab/InternVL3_5-4B.
- **Sin benchmarks publicados**: no hay métricas de calidad (MMLU, HumanEval, etc.) en la información disponible, lo que impide evaluar su precisión relativa.

## Enlaces

- [Hugging Face: litert-community/InternVL3_5-4B](https://huggingface.co/litert-community/InternVL3_5-4B)
- [Modelo base: OpenGVLab/InternVL3_5-4B](https://huggingface.co/OpenGVLab/InternVL3_5-4B)
- [Runtime LiteRT-LM (GitHub)](https://github.com/google-ai-edge/litert-lm)
- [Modelo relacionado: litert-community/FastVLM-0.5B](https://huggingface.co/litert-community/FastVLM-0.5B)
- [Imagen de ejemplo COCO 000000039769.jpg](http://images.cocodataset.org/val2017/000000039769.jpg)
