# Joseph31415926/nllb_hieroglyph_final

## Resumen

`Joseph31415926/nllb_hieroglyph_final` es un ajuste fino del modelo de traducción multilingüe `facebook/nllb-200-distilled-600M` orientado a la traducción de textos jeroglíficos egipcios codificados en MdC (Manuel de Codage) hacia y desde lenguas naturales. El autor, identificado en Hugging Face como Joseph31415926, aborda un problema concreto: la mayoría de los "traductores de jeroglíficos" disponibles en internet se limitan a mapear los 24 jeroglíficos uniliterales a letras latinas, produciendo palabras inglesas con otro juego de caracteres, e ignoran los más de 1000 jeroglíficos multilaterales. Este modelo añade el token de idioma `egy_Latn` al tokenizador del NLLB base y lo entrena con transliteraciones normalizadas, lo que permite una traducción más fiel de la estructura fonética y determinativa del egipcio medio.

El modelo conserva la arquitectura M2M-100 del NLLB-200 distilled, con 630.576.128 parámetros según los pesos en safetensors, y hereda la ventana de contexto y el conjunto de idiomas del modelo base. La innovación principal no está en la arquitectura sino en el preprocesamiento: el autor convierte los jeroglíficos a MdC mediante un script en Python que elimina complementos fonéticos, normaliza plurales y duales al estilo del Reino Medio, convierte números a dígitos, preserva los determinativos con su código Gardiner precedido de guion y deshace la transposición honorífica. Es relevante ahora porque demuestra un flujo de trabajo reproducible para extender un modelo multilingüe existente a una lengua histórica con escritura no estándar, y porque documenta explícitamente un error habitual en los tutoriales de ampliación de tokenizadores (la pérdida de embeddings de tokens de idioma al redimensionar).

La información publicada es escasa: no hay licencia declarada, no hay pipeline asignado, no se detallan idiomas soportados ni resultados de benchmarks. El repositorio ocupa 348,2 GB, un tamaño desproporcionado para 630 millones de parámetros, lo que sugiere la presencia de múltiples checkpoints o artefactos de entrenamiento además de los pesos finales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (M2M-100, base NLLB-200 distilled) |
| Parametros totales | 630.576.128 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (heredada del NLLB-200 distilled-600M; no declarada en la model card) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible como lista; se añade `egy_Latn` (egipcio transliterado en MdC) al conjunto del NLLB-200 base |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tamano del repositorio | 348,2 GB |
| Modelo base | facebook/nllb-200-distilled-600M |
| Tokenizador | SentencePiece nuevo fusionado con NllbTokenizer, con reubicación de embeddings de tokens de idioma |

## Arquitectura y entrenamiento

El modelo es un transformer encoder-decoder de tipo M2M-100, la arquitectura sobre la que se construye la familia NLLB-200. No se introducen cambios estructurales en las capas: el ajuste consiste en ampliar el vocabulario con un tokenizador SentencePiece entrenado sobre las frases de entrenamiento y en añadir el token de idioma `egy_Latn`. El autor describe un detalle técnico crítico: como los tokens de idioma del NllbTokenizer original quedan después de los tokens SentencePiece, sus identificadores se desplazan a valores más altos; al redimensionar el modelo hay que copiar los embeddings de cada token de idioma de su id antiguo al nuevo, paso que, según el autor, se omite en todos los tutoriales y provoca la pérdida de la funcionalidad de traducción preexistente.

Los datos de entrenamiento proceden de "diversas fuentes" que el autor no enumera ni cuantifica en número de tokens. El preprocesamiento es el núcleo del trabajo: las fuentes solo estaban pensadas para lectores humanos, con explicaciones entre paréntesis, descripciones de pronombres, comentarios gramaticales en definiciones de diccionario, anotaciones de entradas ausentes o incorrectas y códigos Gardiner inventados por algunas fuentes. El autor cita como ejemplo la abreviatura alemana LHG ("Leben, Heil, Gesundheit") y su equivalente inglesa LPH ("Life, Prosperity, Health") para la frase 𓋹 𓍑 𓋴. No se documenta el uso de RLHF, DPO ni de decodificación especulativa.

## Capacidades

- Traducción bidireccional entre egipcio transliterado en MdC (`egy_Latn`) y las lenguas cubiertas por el NLLB-200 base.
- Manejo de transliteraciones normalizadas al estilo del Reino Medio, con plurales y duales estandarizados.
- Preservación de determinativos mediante códigos Gardiner precedidos de guion.
- Eliminación de complementos fonéticos y resolución de la transposición honorífica en el preprocesamiento.
- Conversión de numerales a dígitos durante la normalización.
- Conservación de la funcionalidad multilingüe original del NLLB-200 distilled-600M gracias a la reubicación correcta de los embeddings de tokens de idioma.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Traducción asistida de inscripciones para egiptólogos: el modelo recibe texto en MdC normalizado y devuelve una traducción a una lengua moderna, sirviendo como primera pasada que el especialista revisa contra las fuentes originales.
- Digitalización de corpus epigráficos: integrado en un pipeline que convierte jeroglíficos Unicode a MdC mediante el script de transliteración descrito y después aplica el modelo para generar traducciones de referencia indexables.
- Investigación sobre lenguas históricas de baja资源: como caso de estudio reproducible de extensión de un modelo multilingüe con un token de idioma nuevo y un tokenizador SentencePiece adicional.
- Enseñanza de escritura jeroglífica: generación de transliteraciones normalizadas que muestran al estudiante la forma estándar de una palabra, separando determinativos y multilaterales.
- Análisis comparativo de variantes ortográficas: al normalizar plurales, duales y complementos fonéticos, el modelo facilita agrupar formas divergentes de un mismo lexema en corpus dispersos.
- Procesamiento de traducciones históricas: limpieza y estructuración de diccionarios y ediciones con comentarios gramaticales intercalados, aprovechando el preprocesamiento documentado por el autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 2,5 GB solo para pesos (630 M de parámetros), más memoria para activaciones y caché de atención.
- VRAM estimada en fp16/bf16: alrededor de 1,3 GB para pesos; en int8, en torno a 0,7 GB.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para fp16 con lote pequeño; A100 o H100 no son necesarias para este tamaño, pero aceleran el procesamiento por lotes de corpus grandes.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4090 y equivalentes; también en CPU para volúmenes moderados.
- Opciones de despliegue: transformers con PyTorch es la vía natural; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, y al no haber variantes GGUF publicadas, llama.cpp requeriría conversión manual.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Joseph31415926/nllb_hieroglyph_final | 630.576.128 | no disponible | NLLB-200 base + `egy_Latn` | no disponible | Hugging Face, safetensors |
| facebook/nllb-200-distilled-600M | 600 M (aprox.) | no disponible en esta ficha | 200 lenguas | CC-BY-NC-4.0 (modelo base) | Hugging Face, ampliamente desplegado |
| facebook/nllb-200-distilled-1.3B | 1,3 B (aprox.) | no disponible en esta ficha | 200 lenguas | CC-BY-NC-4.0 (modelo base) | Hugging Face |
| facebook/m2m100_418M | 418 M (aprox.) | no disponible en esta ficha | 100 lenguas | MIT (modelo base) | Hugging Face |

La comparación con alternativas específicas para jeroglíficos egipcios no está disponible en la información proporcionada.

## Limitaciones y advertencias

- La licencia no está declarada en el repositorio; el modelo base NLLB-200 se distribuye bajo CC-BY-NC-4.0, lo que condiciona el uso comercial salvo que el autor indique otra cosa.
- No se documentan sesgos conocidos, pero al entrenarse con fuentes egiptológicas de procedencia diversa puede heredar sesgos de esas ediciones y de sus convenciones de transliteración.
- Riesgo de alucinación: como modelo generativo de traducción, puede producir transliteraciones o traducciones plausibles pero incorrectas, especialmente en términos raros, nombres propios o pasajes dañados.
- La ortografía jeroglífica es variable por naturaleza (complementos fonéticos, determinativos, ideogramas), de modo que el modelo trabaja sobre una normalización concreta y puede no coincidir con las convenciones de otros corpus.
- El vocabulario y el contexto están limitados por el modelo base; no se declara la longitud máxima de secuencia ni el comportamiento en textos largos.
- El repositorio de 348,2 GB es desproporcionado para el tamaño del modelo y puede contener checkpoints intermedios; conviene revisar qué archivos se descargan antes de clonar.
- No hay pipeline declarado ni demos publicadas, por lo que la integración requiere cargar manualmente el tokenizador y el modelo con transformers.
- El autor advierte de que los tutoriales habituales de ampliación de tokenizadores omiten la reubicación de embeddings de idioma; si se reutiliza este modelo como base para nuevos ajustes, hay que preservar ese paso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Joseph31415926/nllb_hieroglyph_final
- Modelo base: https://huggingface.co/facebook/nllb-200-distilled-600M
- No se han encontrado en la información proporcionada papers, blogs, repositorios ni demos adicionales.
