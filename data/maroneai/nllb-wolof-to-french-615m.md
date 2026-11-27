# MaroneAI/nllb-Wolof-to-French-615M

## Resumen

El modelo `MaroneAI/nllb-Wolof-to-French-615M` es un ajuste fino de `facebook/nllb-200-distilled-600M` especializado en la traducción automática unidireccional de wolof a francés. Lo desarrolla MaroneAI, un autor independiente que busca mejorar la cobertura de una combinación lingüística poco representada en los modelos multilingües genéricos, con especial atención al contexto senegalés y africano. El modelo se publica bajo licencia MIT, lo que permite uso comercial sin restricciones adicionales.

Técnicamente es un transformer encoder-decoder de tipo M2M-100 con 615.073.792 parámetros, derivado de la familia NLLB (No Language Left Behind) de Meta. El ajuste se realizó sobre corpus propios de pares de frases wolof-francés y se seleccionó el mejor checkpoint mediante BLEU. La longitud máxima de secuencia declarada por el autor es de 128 tokens, muy por debajo de la ventana nativa de NLLB, lo que limita el uso a segmentos cortos.

Su relevancia radica en que el wolof, con más de 10 millones de hablantes principalmente en Senegal y Gambia, está infrarrepresentado en los sistemas de traducción comerciales. Este modelo ofrece una alternativa abierta y ligera (5 GB de repo) para integrar traducción wolof-francés en pipelines propios, aunque con un volumen de descargas (80) y validación externa todavía muy limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (M2M-100 / NLLB) |
| Parametros totales | 615.073.792 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 128 tokens (longitud máxima de secuencia declarada en el ajuste) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizaciones GGUF/ONNX no publicadas por el autor) |
| Idiomas soportados | wolof (wo) como origen, francés (fr) como destino |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura NLLB de Meta: un transformer encoder-decoder con atención multi-cabeza estándar, tokenizador SentencePiece multilingüe y mecanismo de selección de idioma mediante tokens especiales (`src_lang` y `forced_bos_token_id`). El checkpoint base es la variante destilada de 600M parámetros de NLLB-200, diseñada originalmente para traducción multilingüe entre 200 idiomas.

El ajuste fino se realizó sobre un corpus local (`train.csv`) de pares wolof-francés, complementado con los datasets publicados `MaroneAI/French-Wolof_Translation-Dataset` y `MaroneAI/Wolof-to-French_Translation-Dataset`. Los hiperparámetros declarados son: AdamW con learning rate 2e-5, batch efectivo de 20×20 (400), 8 épocas, FP16 activado en GPU y longitud máxima de 128 tokens. Se aplicó un preprocesado automático para eliminar líneas vacías o inválidas, normalizar columnas y detectar heurísticamente el idioma de cada columna. La selección del checkpoint final se hizo por BLEU sobre el conjunto de validación. No se documenta el número total de tokens de entrenamiento, la composición exacta del dataset ni si hubo etapas de RLHF o DPO (en traducción no es habitual).

## Capacidades

- Traducción automática unidireccional wolof → francés de frases y segmentos cortos (hasta 128 tokens).
- Generación de texto secuencia-a-secuencia mediante `AutoModelForSeq2SeqLM` y `generate()`.
- Manejo de vocabulario y expresiones coloquiales senegalesas presentes en el corpus de ajuste.
- Integración con la librería `transformers` y con endpoints compatibles (tag `endpoints_compatible`).
- No soporta tool calling ni function calling.
- No está diseñado para razonamiento multi-paso ni uso como agente.
- No soporta visión, audio ni modo "thinking".
- Capacidad multilingüe limitada a la pareja wo→fr; no se garantiza calidad en otras direcciones ni idiomas.

## Casos de uso

- Traducción de mensajes de atención al cliente: el modelo puede procesar turnos cortos en wolof y devolver la versión en francés para agentes que no dominan el idioma, aprovechando que la mayoría de consultas caben en los 128 tokens de contexto.
- Localización de contenido web y redes sociales: traducción de publicaciones, comentarios y descripciones breves procedentes de comunidades senegalesas hacia francés para su moderación o análisis.
- Subtitulado y transcripción de audio corto: combinado con un ASR previo en wolof, el modelo traduce cada segmento (típicamente <128 tokens) al francés para generar subtítulos.
- Digitalización de documentación administrativa: traducción de formularios, avisos y correspondencia breve en wolof a francés en organismos públicos o ONG que operan en Senegal.
- Investigación lingüística y creación de corpus paralelos: generación de traducciones de referencia para anotación humana o evaluación de otros sistemas en la pareja wo-fr.
- Preselección en pipelines de e-commerce: traducción automática de consultas y reseñas de usuarios wolófonos para su clasificación o enrutamiento interno en francés.
- Prototipado de asistentes conversacionales bilingües: al ser un modelo de 615M y licencia MIT, se puede desplegar en infraestructura modesta para pruebas de concepto sin coste de licencia.

## Benchmarks y rendimiento

El autor indica que la selección del checkpoint se realizó mediante BLEU, pero no publica el valor numérico obtenido ni comparaciones con otros sistemas. No se han publicado resultados de benchmarks (BLEU, chrF, COMET, MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: en torno a 1,3-1,5 GB para los pesos (615M parámetros × 2 bytes) más overhead de activaciones y tokenizador; cómodo en GPUs con 4 GB o más.
- En FP32: aproximadamente 2,5 GB solo de pesos, más activaciones.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es suficiente; también A100/H100 para despliegues de alto throughput, aunque están sobredimensionadas para este tamaño.
- Cabe holgadamente en GPU consumer, incluidas GTX 1650 (4 GB) y superiores con cuantización o FP16.
- Opciones de despliegue: `transformers` con PyTorch (referencia del autor), vLLM (soporte de modelos encoder-decoder limitado, verificar compatibilidad), TGI, o exportación a ONNX. Para CPU, es viable con `transformers` en FP32 dado el tamaño reducido.
- Latencia y throughput: no disponibles en la información proporcionada. Por el tamaño (615M) y la longitud máxima de 128 tokens, se espera latencia de decenas de milisegundos por frase en GPU moderna, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MaroneAI/nllb-Wolof-to-French-615M | 615M | 128 tokens | wo→fr | MIT | Hugging Face |
| facebook/nllb-200-distilled-600M | 600M | 512 tokens (nativo) | 200 idiomas | CC-BY-NC 4.0 | Hugging Face |
| facebook/nllb-200-1.3B | 1,3B | 512 tokens (nativo) | 200 idiomas | CC-BY-NC 4.0 | Hugging Face |
| Helsinki-NLP/opus-mt-wo-fr | no disponible | no disponible | wo→fr | no disponible | Hugging Face |

El modelo de MaroneAI se diferencia del NLLB base en que está especializado en una única dirección y se publica con licencia MIT (frente a la CC-BY-NC del original, que restringe el uso comercial). A cambio, el contexto se reduce a 128 tokens y no hay evidencia pública de que supere al NLLB base en BLEU. Frente a alternativas tipo OPUS-MT, la ventaja es la licencia permisiva y el ajuste específico, pero no hay comparativas publicadas.

## Limitaciones y advertencias

- Longitud de contexto de solo 128 tokens: frases o párrafos más largos se truncan, lo que degrada la traducción de documentos completos.
- Sin benchmarks publicados: no hay evidencia cuantitativa (BLEU, chrF, COMET) de la calidad frente al NLLB base ni frente a otros sistemas; el autor solo menciona selección por BLEU sin cifras.
- Corpus de entrenamiento pequeño y no documentado en tamaño: riesgo de sobreajuste al estilo del dataset y de baja generalización a registros formales o dominios técnicos.
- Riesgo de alucinación y de traducciones literales incorrectas en expresiones idiomáticas o vocabulario fuera del corpus.
- Sesgos potenciales derivados de la fuente de los datos (probablemente conversacional y de un registro concreto); no se documenta análisis de sesgos.
- Modelo unidireccional wo→fr: no soporta la dirección inversa ni otros idiomas.
- Errata en el snippet de la model card: el identificador de ejemplo (`MaroneAI/nllb-Wolof-to-Frensh-615M`) tiene una falta de ortografía y no coincide con el nombre real del repositorio; además, el ejemplo no configura `src_lang="wol_Latn"` ni `forced_bos_token_id` para francés, lo que puede producir traducciones incorrectas si se copia tal cual.
- Licencia MIT permite uso comercial, pero conviene verificar las obligaciones de atribución y las condiciones del modelo base NLLB (CC-BY-NC 4.0) al redistribuir derivados; la combinación de licencias puede generar ambigüedad legal.
- Volumen de adopción muy bajo (80 descargas, 1 like): poca validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MaroneAI/nllb-Wolof-to-French-615M
- Modelo base: https://huggingface.co/facebook/nllb-200-distilled-600M
- Dataset de ajuste (francés-wolof): https://huggingface.co/datasets/MaroneAI/French-Wolof_Translation-Dataset
- Dataset de ajuste (wolof-francés): https://huggingface.co/datasets/MaroneAI/Wolof-to-French_Translation-Dataset
- Paper NLLB (No Language Left Behind): https://arxiv.org/abs/2207.04672
