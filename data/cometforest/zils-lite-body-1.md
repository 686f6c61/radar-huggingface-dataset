# CometForest/zils-lite-body-1

## Resumen

zils-lite-body-1 es un modelo de lenguaje publicado por el usuario CometForest en HuggingFace bajo licencia Apache-2.0. Se presenta como un "body" (cuerpo base) destinado al pool de modelos tipo "soup" denominado Zils `d3-lite`, es decir, un componente pensado para ser combinado o fusionado con otros pesos dentro de una familia de modelos derivados. El modelo deriva de Qwen/Qwen3.5-0.8B y de fine-tunes abiertos de este, según indica la propia model card.

El modelo cuenta con 852.985.920 parámetros almacenados en formato safetensors, con un tamaño de repositorio de 1,7 GB, lo que es coherente con pesos en precisión de 16 bits. No se especifican la longitud de contexto, los idiomas soportados ni el pipeline de uso en la información disponible.

Su relevancia es limitada y muy específica: se trata de un artefacto experimental (0 descargas, 0 likes en el momento de la consulta) orientado a flujos de fusión de modelos ("model souping") más que a un uso directo en producción. Para desarrolladores e investigadores resulta interesante como ejemplo de reutilización de la familia Qwen3.5-0.8B y de las prácticas de empaquetado de pesos, pero no como un modelo autónomo con garantías documentadas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (derivado de Qwen/Qwen3.5-0.8B; arquitectura del modelo base no detallada en la información) |
| Parámetros totales | 852.985.920 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo. La model card indica únicamente que se trata de un "body" para el pool Zils `d3-lite` y que deriva de Qwen/Qwen3.5-0.8B y de fine-tunes abiertos de ese modelo. Por tanto, cabe esperar una arquitectura de tipo transformer decoder-only heredada del modelo base, pero no se confirma ni el tipo de atención, ni la presencia de componentes MoE, ni detalles de normalización o tokenizador.

Tampoco se documentan el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF, DPO o ajuste supervisado. El término "soup" sugiere que los pesos podrían ser el resultado de una fusión (weight averaging o model merging) de varios fine-tunes del modelo base, pero esto es una inferencia a partir de la nomenclatura y no un dato confirmado en la documentación. No se describen innovaciones técnicas como decodificación especulativa, atención lineal o modos de razonamiento extendido.

## Capacidades

- Generación de texto: capacidad heredada del modelo base Qwen3.5-0.8B, si bien no se documentan evaluaciones que la confirmen en este artefacto concreto.
- Razonamiento y código: no disponible; no hay información específica sobre rendimiento en tareas de razonamiento, matemáticas o programación.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; no se declara lista de idiomas.
- Capacidades especiales (modo thinking, visión, audio): no disponible.
- Uso como componente de fusión: la función declarada es servir de "body" dentro del pool Zils `d3-lite`, es decir, como base para combinar con otros pesos.

## Casos de uso

- Experimentación con model merging: el modelo puede utilizarse como cuerpo base en pipelines de fusión de pesos (por ejemplo, con herramientas como mergekit) para explorar combinaciones con otros fine-tunes de Qwen3.5-0.8B, dado que su propósito declarado es formar parte de un pool de "soup".
- Investigación sobre linaje de modelos: permite estudiar cómo se propagan capacidades y sesgos desde Qwen3.5-0.8B y sus fine-tunes a través de procesos de fusión, gracias a que la model card declara la procedencia.
- Prototipado de bajo coste en local: con ~853 M de parámetros y 1,7 GB de pesos, el modelo puede cargarse en GPU de consumo para pruebas rápidas de generación de texto, siempre que se valide su comportamiento antes de usarlo.
- Evaluación comparativa de artefactos derivados: útil como punto de referencia en estudios que midan el impacto de las técnicas de souping frente al modelo base original.
- Docencia y divulgación: sirve como ejemplo práctico de publicación de pesos en safetensors con licencia permisiva y de las convenciones de etiquetado en HuggingFace.
- Integración en pipelines experimentales de generación de texto: puede desplegarse con frameworks estándar de inferencia (por ejemplo, transformers) para tareas de texto general, asumiendo que su calidad no está documentada y requiere validación propia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,7 GB en fp16 (tamaño de los pesos); en torno a 0,9-1,0 GB si se cuantiza a 8 bits y unos 0,5 GB en cuantización de 4 bits, estimaciones basadas en el recuento de parámetros.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para fp16; tarjetas como RTX 3060, RTX 4060, RTX 4090, A100 o H100 son sobradamente suficientes.
- GPU de consumo: sí, cabe holgadamente en GPU de consumo actuales e incluso en iGPU con memoria unificada suficiente.
- Opciones de despliegue: transformers es la vía directa al publicarse en safetensors; vLLM, TGI, llama.cpp u Ollama requerirían conversión o soporte explícito del formato, no documentado en la información disponible.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| zils-lite-body-1 | 852.985.920 | no disponible | Apache-2.0 | HuggingFace (0 descargas) | Artefacto de fusión derivado de Qwen3.5-0.8B; sin benchmarks |
| Qwen/Qwen3.5-0.8B | ~0,8 B (según denominación) | no disponible en la información | no disponible en la información | HuggingFace | Modelo base declarado del que deriva |
| Fine-tunes abiertos de Qwen3.5-0.8B | variable | no disponible | variable | HuggingFace | Fuente declarada de los pesos combinados; no se identifican ejemplares concretos |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- Ausencia total de documentación técnica: no se especifican contexto, idiomas, datos de entrenamiento ni evaluaciones, lo que impide garantizar su comportamiento en producción.
- Riesgo elevado de alucinación y de comportamiento impredecible: al ser un artefacto de fusión sin validación publicada, no hay evidencia de calidad en ninguna tarea.
- Sesgos desconocidos: al heredar pesos de Qwen3.5-0.8B y de fine-tunes no identificados, puede arrastrar los sesgos de todos ellos, sin que se haya documentado ningún análisis al respecto.
- Limitaciones de contexto e idioma: no disponibles; se desconoce la ventana de contexto efectiva y la cobertura lingüística real.
- Licencia Apache-2.0: permite uso comercial y modificación, pero el usuario debe verificar que los fine-tunes de origen incluidos en la fusión sean compatibles con esta licencia, algo que la model card no detalla.
- Madurez: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso comunitario ni de mantenimiento.
- No apto para producción sin evaluación propia: se recomienda validar exhaustivamente antes de cualquier despliegue y no asumir las capacidades del modelo base.

## Enlaces

- HuggingFace: https://huggingface.co/CometForest/zils-lite-body-1
- Modelo base declarado: https://huggingface.co/Qwen/Qwen3.5-0.8B
- No se han encontrado en la búsqueda web papers, blogs, repositorios ni demos adicionales asociados a este modelo.
