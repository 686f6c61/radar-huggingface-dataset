# Abu-Dju/madlad400-10b-mt-Q8_0-GGUF

## Resumen

El modelo `Abu-Dju/madlad400-10b-mt-Q8_0-GGUF` es una conversión a formato GGUF del modelo de traducción automática multilingüe `google/madlad400-10b-mt`, desarrollado por Google Research. La conversión ha sido realizada por el usuario Abu-Dju mediante la herramienta GGUF-my-repo de ggml.ai, lo que permite ejecutar el modelo con llama.cpp y otras herramientas compatibles con GGUF en hardware de consumo.

MADLAD-400-10B-MT es un modelo de traducción basado en la arquitectura T5 (encoder-decoder) con 10.700 millones de parámetros, entrenado sobre 250.000 millones de tokens procedentes del dataset MADLAD-400, que cubre más de 450 idiomas. Este modelo destaca por su amplia cobertura lingüística, incluyendo lenguas de baja representación, y por su capacidad para realizar traducción directa entre pares de idiomas sin necesidad de pasar por el inglés como puente.

La relevancia de esta versión GGUF radica en que facilita el despliegue local del modelo en entornos sin GPU de gran tamaño, gracias a la cuantización Q8_0 que reduce el peso a aproximadamente 11,4 GB. Esto lo hace accesible para desarrolladores que necesitan un motor de traducción multilingüe de alta calidad en producción o en entornos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | T5 (encoder-decoder transformer) |
| Parametros totales | 10.712.586.240 (10,7 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo original usa 512 tokens, pero no se confirma en la informacion) |
| Tipos de cuantizacion | Q8_0 (GGUF) |
| Idiomas soportados | mas de 450 (incluye es, en, fr, de, it, pt, ru, zh, ja, ar, etc.) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (archivo `madlad400-10b-mt-q8_0.gguf`) |

## Arquitectura y entrenamiento

El modelo base `google/madlad400-10b-mt` sigue la arquitectura T5, un transformer encoder-decoder con atención completa. El encoder procesa el texto fuente y el decoder genera la traducción de forma autorregresiva. El entrenamiento se realizó sobre el dataset MADLAD-400, que contiene 250.000 millones de tokens extraídos de rastreos web públicos y filtrados para eliminar contenido no textual o de baja calidad. El dataset cubre más de 450 idiomas, con un énfasis especial en lenguas con pocos recursos.

No se ha aplicado RLHF ni DPO; el entrenamiento es supervisado con pares de traducción. El modelo fue entrenado con una mezcla de datos que incluye traducciones directas entre pares de idiomas, lo que le permite traducir sin pasar por un idioma puente. La conversión a GGUF no modifica los pesos, solo los reempaqueta en el formato de llama.cpp con cuantización Q8_0, que mantiene una pérdida de precisión mínima respecto al modelo original en float32.

## Capacidades

- Traducción automática multilingüe entre más de 450 idiomas, incluyendo pares de lenguas de baja representación.
- Generación de texto a partir de texto (text2text), con soporte para prefijos de idioma como `<2en>` o `<2de>` para indicar el idioma de destino.
- Funciona como modelo de traducción directa, sin necesidad de intermediarios.
- No dispone de tool calling, ni capacidades de agente, ni razonamiento multi-paso.
- No soporta visión ni audio; es exclusivamente texto.
- Compatible con el ecosistema llama.cpp, incluyendo el servidor HTTP y la CLI, así como con otras herramientas que aceptan GGUF (Ollama, LM Studio, etc.).

## Casos de uso

- Traducción automática de contenido web: el modelo puede traducir páginas completas o fragmentos de texto en tiempo real, gracias a su amplia cobertura de idiomas y a la posibilidad de ejecutarse localmente con llama.cpp.
- Localización de software y aplicaciones: permite traducir cadenas de interfaz de usuario a decenas de idiomas sin depender de APIs externas, reduciendo costes y latencia.
- Subtitulado y transcripción multilingüe: combinado con un sistema de reconocimiento de voz, puede generar subtítulos en múltiples idiomas para vídeos o podcasts.
- Traducción de documentos técnicos y legales: su entrenamiento con datos web variados le permite manejar registros formales, aunque se recomienda revisión humana para textos críticos.
- Chat multilingüe en atención al cliente: integrado en un sistema de mensajería, puede traducir conversaciones entre clientes y agentes que hablan idiomas distintos, manteniendo el contexto de la conversación.
- Preprocesamiento de datos para entrenamiento de modelos: puede utilizarse para crear corpus paralelos o aumentar datos de entrenamiento en idiomas con pocos recursos, aprovechando su capacidad de traducción directa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo original `google/madlad400-10b-mt` reporta mejoras frente a otros sistemas de traducción en el paper de MADLAD-400, pero no se incluyen cifras concretas en la documentación consultada. Se recomienda consultar el paper original para métricas detalladas de BLEU y chrF en diversos pares de idiomas.

## Requisitos de hardware

- VRAM estimada: el archivo GGUF Q8_0 pesa aproximadamente 11,4 GB, por lo que se necesitan al menos 12 GB de VRAM para cargar el modelo completo en GPU. Con cuantizaciones inferiores (Q4_K_M, Q5_K_M) el requisito baja a unos 6-8 GB.
- GPU recomendadas: RTX 3090, RTX 4090, A100, o cualquier GPU con 12 GB o más de VRAM. También puede ejecutarse en CPU con llama.cpp, aunque la velocidad será menor.
- En consumer GPU: sí, cabe en tarjetas de 12 GB o más, como la RTX 3060 (12 GB) o superiores.
- Opciones de despliegue: llama.cpp (CLI y servidor), Ollama, LM Studio, text-generation-inference (si se convierte a otro formato), o mediante la integración con transformers si se usa el modelo original en safetensors.
- Latencia y throughput: no se dispone de datos medidos. En una RTX 4090, un modelo de 10,7B en Q8_0 puede generar decenas de tokens por segundo, pero depende de la implementación y del tamaño del lote.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| MADLAD-400-10B-MT (GGUF Q8_0) | 10,7 B | >450 | no disponible | Apache 2.0 | GGUF |
| NLLB-200-3.3B (M2M-100) | 3,3 B | 200 | 512 | CC-BY-NC 4.0 | safetensors, GGUF |
| M2M-100-1.2B | 1,2 B | 100 | 512 | MIT | safetensors, GGUF |
| Google MT5-large | 1,2 B | 101 | 512 | Apache 2.0 | safetensors |

MADLAD-400-10B-MT ofrece una cobertura de idiomas muy superior a NLLB-200 y M2M-100, y su licencia Apache 2.0 permite uso comercial sin restricciones, a diferencia de NLLB-200 que es CC-BY-NC. En cuanto a rendimiento, el paper original reporta ventajas sobre M2M-100 en la mayoría de pares de idiomas, especialmente en lenguas de baja representación.

## Limitaciones y advertencias

- El modelo es exclusivamente de traducción; no está diseñado para tareas de generación libre, razonamiento o diálogo.
- La longitud de contexto es limitada (probablemente 512 tokens), por lo que no es adecuado para traducir documentos largos de una sola vez; habría que dividirlos en fragmentos.
- Puede presentar alucinaciones o errores en idiomas muy minoritarios o con pocos datos de entrenamiento.
- La cuantización Q8_0 introduce una ligera pérdida de calidad respecto al modelo original en float32, aunque en la práctica suele ser imperceptible para traducción.
- No se han publicado evaluaciones de sesgos o toxicidad para este modelo; como cualquier sistema de traducción, puede reflejar sesgos presentes en los datos de entrenamiento.
- Para uso en producción, se recomienda validar las traducciones en dominios especializados (legal, médico) con revisores humanos.

## Enlaces

- Repositorio HuggingFace del modelo GGUF: https://huggingface.co/Abu-Dju/madlad400-10b-mt-Q8_0-GGUF
- Modelo original: https://huggingface.co/google/madlad400-10b-mt
- Paper de MADLAD-400: https://github.com/google-research/google-research/blob/master/madlad_400/README.md
- Documentación de transformers para MADLAD-400: https://github.com/huggingface/transformers/blob/main/docs/source/en/model_doc/madlad-400.md
- Repositorio de llama.cpp: https://github.com/ggerganov/llama.cpp
