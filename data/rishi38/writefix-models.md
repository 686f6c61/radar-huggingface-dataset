# rishi38/writefix-models

## Resumen

WriteFix es una familia de dos modelos de corrección de texto en inglés desarrollados por el usuario rishi38 (Rishiraj) y publicados en Hugging Face. Se trata de modelos entrenados desde cero (sin pesos preentrenados), diseñados específicamente para corregir errores ortográficos, de puntuación, de mayúsculas y deslices gramaticales comunes en textos en inglés. La familia consta de dos variantes: WF-1 Mini, con 10,5 millones de parámetros, y WF-1 Large, con 93,6 millones de parámetros.

La arquitectura combina un stem convolucional con un transformer encoder-decoder y un vocabulario BPE a nivel de byte de 16.000 tokens. Los pesos se distribuyen como state dicts de PyTorch en media precisión, junto con su configuración, y requieren el código propio de WriteFix para cargarse, no son compatibles con la librería `transformers`.

El proyecto es un prototipo explícitamente etiquetado como tal por su autor, con cero descargas y cero likes en el momento de la consulta. Su relevancia es limitada: se trata de una prueba de concepto de un pipeline de corrección de texto de extremo a extremo entrenado desde cero, útil como referencia educativa o para experimentación, pero sin garantías de calidad para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Stem convolucional + transformer encoder-decoder |
| Parametros totales | 10,5 M (WF-1 Mini) / 93,6 M (WF-1 Large) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en media precisión, fp16) |
| Idiomas soportados | Inglés (en) |
| Licencia | No disponible |
| Formato de pesos | State dict de PyTorch (.pt), media precisión, con config asociada |
| Vocabulario | BPE a nivel de byte, 16k tokens |
| Tamaño del repo | 0,2 GB |

## Arquitectura y entrenamiento

La arquitectura de WriteFix se compone de un stem convolucional seguido de un transformer encoder-decoder. El stem convolucional procesa la secuencia de entrada antes de pasarla al codificador, y el decodificador genera la secuencia corregida. El vocabulario es un BPE a nivel de byte de 16.000 tokens, lo que permite representar cualquier cadena de bytes sin tokens de desconocido.

Según la model card, ambos modelos se entrenaron desde cero, sin inicialización a partir de pesos preentrenados. No se especifican el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO u otras fases de alineación. Tampoco se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal. Los pesos se almacenan como state dicts de PyTorch en media precisión y se cargan mediante el código propio de WriteFix, lo que implica que no son directamente utilizables con `transformers`, vLLM ni otras herramientas estándar sin adaptación.

## Capacidades

- Corrección ortográfica en inglés: detecta y corrige errores de deletreo.
- Corrección de puntuación: ajusta comas, puntos y otros signos.
- Corrección de mayúsculas: normaliza el uso de mayúsculas al inicio de frase y en nombres propios.
- Corrección de deslices gramaticales comunes en inglés.
- Generación de texto limitada al ámbito de la corrección: no es un modelo conversacional ni de propósito general.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no, solo inglés.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Preprocesado de textos antes de indexación: el modelo puede normalizar ortografía y puntuación de documentos en inglés antes de introducirlos en un pipeline de búsqueda o RAG, reduciendo la variabilidad léxica debida a erratas.
- Limpieza de reseñas y comentarios de usuarios: útil para normalizar texto generado por usuarios en inglés antes de análisis de sentimiento o clasificación, donde las erratas degradan la calidad de las features.
- Corrección de borradores en herramientas de escritura: integrable como paso de postprocesado en editores de texto o correctores automáticos para inglés, dado su reducido tamaño (21 MB y 187 MB).
- Normalización de transcripciones ASR: las transcripciones automáticas en inglés suelen carecer de puntuación y mayúsculas; el modelo puede restaurarlas como paso posterior al reconocimiento de voz.
- Filtrado y limpieza de datasets: para curar corpus en inglés eliminando erratas y ruido de puntuación antes de usarlos en entrenamiento de otros modelos.
- Experimentación educativa: como ejemplo de pipeline completo de entrenamiento desde cero de un modelo encoder-decoder para una tarea concreta, útil en docencia o investigación sobre arquitecturas ligeras.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: WF-1 Mini (10,5 M de parámetros) ocupa aproximadamente 21 MB en fp16, por lo que cabe en cualquier GPU consumer e incluso en CPU; WF-1 Large (93,6 M de parámetros) ocupa unos 187 MB en fp16, también holgadamente dentro de cualquier GPU consumer.
- GPU recomendadas: no se requiere GPU dedicada; cualquier GPU con al menos 1 GB de VRAM es suficiente. Una RTX 4090, A100 o H100 están sobredimensionadas para este modelo.
- Cabe en GPU consumer: sí, en todas las GPU consumer modernas e incluso en hardware integrado.
- Opciones de despliegue: no es compatible con vLLM, llama.cpp, Ollama ni TGI de forma nativa; requiere el código propio de WriteFix y PyTorch para cargar los state dicts.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| WriteFix WF-1 Mini | 10,5 M | No disponible | Inglés | No disponible | PyTorch (.pt) | Hugging Face, código propio |
| WriteFix WF-1 Large | 93,6 M | No disponible | Inglés | No disponible | PyTorch (.pt) | Hugging Face, código propio |
| Modelos de corrección gramatical comerciales (p. ej. LanguageTool) | No disponible | No disponible | Múltiples | Propietaria / open core | No disponible | Servicio o librería |
| T5-small (fine-tune para corrección) | 60 M | 512 tokens | Multilingüe | Apache 2.0 | safetensors, PyTorch | Hugging Face, `transformers` |

La comparación con alternativas establecidas es desfavorable en cuanto a documentación, licencia y compatibilidad de ecosistema: WriteFix no declara licencia, no es compatible con `transformers` y no publica métricas. Los datos de T5-small se ofrecen como referencia de un modelo de tamaño comparable con licencia y ecosistema bien definidos.

## Limitaciones y advertencias

- Modelo prototipo: el propio autor advierte "Expect mistakes" (espera errores); no está validado para producción.
- Sin licencia declarada: no se especifican los términos de uso, lo que impide determinar si el uso comercial está permitido.
- Solo inglés: no soporta otros idiomas, incluido el castellano.
- Sin benchmarks publicados: no hay evidencia cuantitativa de su calidad frente a alternativas.
- Sin datos de entrenamiento: se desconoce la composición del dataset, lo que impide evaluar sesgos y cobertura.
- Riesgo de alucinación y sobrecorrección: al ser un modelo generativo encoder-decoder, puede alterar texto correcto o introducir cambios no deseados, especialmente en dominios especializados.
- Ecosistema limitado: requiere código propio para cargar los pesos; no funciona con `transformers`, vLLM ni otras herramientas estándar.
- Longitud de contexto desconocida: no se documenta la ventana máxima, lo que limita su uso en documentos largos sin segmentación previa.
- Cero adopción: sin descargas ni likes en el momento de la consulta, no hay retroalimentación de la comunidad sobre su comportamiento real.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rishi38/writefix-models
- Web y demo en vivo: https://rishiraj38.github.io/writefix-website/
