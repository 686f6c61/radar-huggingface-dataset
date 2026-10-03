# malinali-app/opus-mt-ee-sv

## Resumen

malinali-app/opus-mt-ee-sv es un paquete de traducción automática para inferencia en dispositivo, publicado por el desarrollador malinali-app dentro del proyecto Malinali. No se trata de un modelo entrenado desde cero: reempaqueta los pesos del modelo Helsinki-NLP/opus-mt-ee-sv en formato safetensors y convierte los tokenizadores SentencePiece originales a JSON de tokenizador rápido de Hugging Face, con el objetivo de ejecutarlo con Candle a través del componente marian_flutter. El modelo realiza traducción unidireccional del par declarado ee → sv.

La arquitectura es MarianMT, un transformer encoder-decoder de tipo secuencia a secuencia, la misma familia que emplea el proyecto OPUS-MT de Helsinki-NLP. El recuento real de parámetros en safetensors es de 75.277.598, lo que sitúa el modelo en la gama base de OPUS-MT y explica el tamaño del repositorio, de 0,3 GB, coherente con pesos en precisión de 32 bits. No se documenta en la información disponible la longitud de contexto, el número de tokens de entrenamiento ni el proceso de ajuste.

Su relevancia actual es acotada pero concreta: permite traducción ee → sv sin conexión y con requisitos de hardware mínimos, lo que encaja en aplicaciones móviles y de escritorio. La ficha de Hugging Face registra 0 descargas y 0 "likes", por lo que no existe validación comunitaria publicada, y la licencia aparece como "no disponible" en los metadatos de Hugging Face.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (MarianMT) |
| Parametros totales | 75.277.598 (dato real de safetensors) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no se documentan variantes cuantizadas; el repo de 0,3 GB es coherente con pesos en fp32 |
| Idiomas soportados | ee, sv (par declarado ee → sv) |
| Licencia | no disponible en la ficha de HF; la model card remite a la licencia del modelo original (habitualmente CC-BY 4.0 en OPUS-MT) |
| Formato de pesos | safetensors (`model.safetensors`) |

## Arquitectura y entrenamiento

El modelo es un MarianMT, es decir, un transformer con encoder y decoder completos orientado a traducción automática neuronal, la arquitectura que Helsinki-NLP usa de forma sistemática en su colección OPUS-MT. El paquete de malinali-app no introduce cambios de arquitectura: mantiene el `config.json` Marian y los pesos originales. Lo que sí modifica respecto al repositorio de origen es el tokenizador: convierte los modelos SentencePiece a tokenizadores rápidos de Hugging Face, distribuidos como `tokenizer-enc.json` (lado fuente) y `tokenizer-dec.json` (lado destino), un formato necesario para la implementación en Candle.

No hay información disponible sobre el volumen de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF o DPO; en la familia OPUS-MT estos modelos se entrenan sobre corpus paralelos agregados en el proyecto OPUS, pero ese detalle no se especifica en la información proporcionada. Tampoco se documentan innovaciones técnicas propias: la model card indica explícitamente que Malinali solo reempaqueta pesos y convierte tokenizadores, y que no reclama la propiedad del modelo entrenado.

Existe una discrepancia que conviene señalar: las etiquetas del repositorio incluyen `base_model:finetune:Helsinki-NLP/opus-mt-ee-sv`, lo que sugiere un ajuste fino, mientras que la propia model card afirma que únicamente se reempaquetan los pesos. La información disponible no permite resolver cuál de las dos descripciones es la correcta.

## Capacidades

- Traducción de texto unidireccional ee → sv a nivel de frase y de párrafo.
- Generación de texto condicionada a la secuencia de entrada, con el pipeline `translation` de la librería transformers.
- Ejecución en dispositivo mediante Candle, gracias a los tokenizadores convertidos a formato rápido.
- Compatibilidad declarada con endpoints (`endpoints_compatible` en las etiquetas del repositorio).
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte para agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingüe más allá del par ee → sv.
- No se documentan capacidades de visión, audio, ni modo de razonamiento explícito.

## Casos de uso

- Traducción offline en aplicaciones móviles: el paquete está pensado para Candle y marian_flutter, de modo que una app puede traducir ee → sv sin conexión y con un modelo de 75 millones de parámetros, que ocupa del orden de 0,3 GB en disco.
- Localización de interfaces de usuario: traducción de cadenas cortas de menús, botones y mensajes de sistema, donde el coste computacional de un modelo base es despreciable y la latencia en CPU es suficiente.
- Traducción de documentación y textos técnicos: procesamiento por lotes de manuales o notas de producto en pipelines de NLP, con el modelo como etapa de traducción previa a revisión humana.
- Subtitulado y contenido multimedia: traducción de transcripciones o subtítulos en flujos de postproducción, aprovechando que el modelo es un seq2seq de frase a frase.
- Preprocesado en pipelines de análisis: conversión de corpus en ee a sv para alimentar buscadores, sistemas de indexación o clasificadores que solo operan en sueco.
- Traducción en quioscos y dispositivos con conectividad limitada: puntos de información en aeropuertos, oficinas o eventos donde no se quiere depender de una API en la nube ni enviar texto a terceros.
- Comunicación asistida en atención presencial: apoyo a personal que atiende a hablantes de ee y necesita producir respuestas en sv de forma inmediata.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La ficha de Hugging Face no incluye métricas de BLEU, chrF ni comparaciones con otros sistemas, y los resultados de búsqueda web proporcionados no contienen información relevante sobre este modelo.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en cualquier precisión habitual. Con 75.277.598 parámetros, los pesos ocupan aproximadamente 0,3 GB en fp32 y unos 0,15 GB en fp16.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de memoria libre. Funciona en RTX 3060, RTX 4090, A100, H100 y también en GPUs integradas y aceleradores de gama baja.
- Cabe holgadamente en GPU de consumo: sí, en cualquier modelo actual, e incluso en muchos sistemas sin GPU dedicada.
- Ejecución en CPU: viable y suficiente para traducción interactiva, dado el tamaño reducido del modelo.
- Opciones de despliegue: transformers (PyTorch) de forma directa, y Candle mediante marian_flutter según la model card. Otras alternativas como vLLM, TGI u Ollama no se confirman en la información disponible.
- Latencia y throughput: no se proporcionan cifras medidas. Por el tamaño del modelo, se espera latencia baja en CPU moderna y muy baja en GPU, pero no hay datos publicados que lo cuantifiquen.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| malinali-app/opus-mt-ee-sv | 75,3 M | ee → sv | no disponible en HF; remite al upstream | safetensors | Paquete para Candle con tokenizadores convertidos; 0 descargas |
| Helsinki-NLP/opus-mt-ee-sv | del orden de 75 M (modelo base de origen) | ee → sv | habitualmente CC-BY 4.0 en OPUS-MT (no verificado en la información disponible) | pesos Marian originales | Fuente de los pesos; sin conversión de tokenizador para Candle |
| NLLB-200 distilled 600M | 600 M | 200 idiomas, incluye pares con lenguas de bajos recursos | CC-BY-NC-4.0 | safetensors / PyTorch | Multilingüe y de mayor tamaño; licencia no comercial, dato de conocimiento general no verificado en la búsqueda |
| M2M-100 418M | 418 M | 100 idiomas | MIT | PyTorch | Multilingüe, arquitectura más antigua; dato de conocimiento general no verificado en la búsqueda |

No se dispone de comparaciones de rendimiento medidas entre estas opciones dentro de la información proporcionada, por lo que la tabla se limita a parámetros, cobertura de idiomas y licencia.

## Limitaciones y advertencias

- Licencia no declarada en los metadatos de Hugging Face. La model card remite a la licencia del modelo original y menciona CC-BY 4.0 como habitual en OPUS-MT, pero no lo confirma. Antes de un uso comercial es necesario verificar la licencia en el repositorio de Helsinki-NLP.
- Discrepancia entre la etiqueta `base_model:finetune` y la afirmación de la model card de que solo se reempaquetan pesos. No se puede determinar desde la información disponible si hubo ajuste fino.
- Traducción unidireccional: el modelo solo cubre ee → sv. Para el sentido inverso hace falta otro modelo.
- Riesgo de infidelidad en la traducción: como todo modelo seq2seq, puede omitir información, añadir contenido no presente en el original o alterar matices, especialmente en frases largas o ambiguas.
- Sesgo de dominio: los corpus de OPUS tienden a sobrerrepresentar textos religiosos, legislativos y subtítulos, lo que puede degradar la calidad en dominios técnicos, jurídicos o coloquiales.
- Idiomas de bajos recursos: la disponibilidad de corpus paralelos para el par ee → sv es limitada en comparación con pares mayoritarios, lo que suele traducirse en menor calidad.
- Código de idioma ambiguo: el repositorio usa la etiqueta `ee` sin especificar a qué variedad lingüística corresponde, y la información disponible no lo aclara.
- Ausencia de validación comunitaria: 0 descargas y 0 "likes" en el momento de la consulta, sin evaluaciones independientes publicadas.
- Sin benchmarks: no hay métricas publicadas que permitan estimar la calidad real frente a alternativas.
- Longitud de contexto no documentada: se desconoce el máximo de tokens que admite la entrada, lo que obliga a probarlo empíricamente antes de desplegarlo con textos largos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/malinali-app/opus-mt-ee-sv
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-ee-sv
- Proyecto OPUS-MT: https://github.com/Helsinki-NLP/Opus-MT
- Aplicación Malinali: https://malinali.app

Nota: los resultados de búsqueda web proporcionados no contienen enlaces relevantes sobre este modelo; las páginas devueltas tratan temas sin relación con traducción automática ni con OPUS-MT.
