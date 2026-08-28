# AmnaNoor123/code-switching-codesaviours-si26-amna

## Resumen

Este modelo es un fine-tune de `xlm-roberta-base` para la identificación de idioma a nivel de token en texto code-switched (mezcla de código) entre roman urdu e inglés. Ha sido desarrollado por AmnaNoor123 como parte del programa de prácticas "Code Saviours SI-26" y se distribuye bajo licencia MIT. El objetivo es etiquetar cada palabra de una frase como roman urdu (URD), inglés (ENG) o una forma híbrida (MIX), un paso fundamental para herramientas de PLN que procesan cómo se escribe realmente en redes sociales y mensajería en Pakistán.

El modelo se basa en la arquitectura transformer de `xlm-roberta-base`, con 277 millones de parámetros, y se ha entrenado sobre un conjunto de datos propio de 160 frases reales extraídas de Twitter/X, Reddit, comentarios de YouTube y conversaciones estilo WhatsApp. A pesar de su pequeño tamaño de entrenamiento, alcanza una precisión global del 97,3% en el conjunto de test, aunque con una limitación clara en la etiqueta MIX, que no logra aprender por falta de ejemplos. Es relevante porque aborda un fenómeno lingüístico poco cubierto por los modelos monolingües estándar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa) |
| Parametros totales | 277.455.363 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 512 tokens (heredado de xlm-roberta-base) |
| Tipos de cuantizacion | No disponible (solo safetensors en fp32) |
| Idiomas soportados | Roman urdu, ingles |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune de `xlm-roberta-base`, un transformer encoder preentrenado multilingüe de 278 millones de parámetros. La capa de clasificación original se sustituye por una cabecera de clasificación de tokens con tres etiquetas: URD, ENG y MIX. El entrenamiento se realizó sobre un conjunto de datos propio de 160 frases (1.677 palabras etiquetadas) recopiladas de fuentes reales de redes sociales y mensajería en Pakistán. Se usó una división 80/20 (128 frases de entrenamiento, 32 de test), 5 épocas y un tamaño de lote de 16. No se aplicaron técnicas de RLHF ni DPO; es un fine-tune supervisado estándar.

La innovación principal no está en la arquitectura, sino en la tarea: la identificación de idioma a nivel de token en texto roman urdu-inglés, un dominio con muy pocos recursos etiquetados. El modelo distingue entre tokens puramente urdu romanizado, tokens ingleses y tokens híbridos donde se aplica morfología urdu a una raíz inglesa (p. ej., `tension-wention`).

## Capacidades

- Identificación de idioma a nivel de token en texto code-switched roman urdu-inglés.
- Clasificación en tres etiquetas: URD (roman urdu), ENG (ingles) y MIX (hibrido).
- Procesamiento de frases con mezcla de código frecuente en redes sociales y mensajeria.
- Inferencia mediante pipeline de `transformers` para token-classification.
- No dispone de capacidades de generacion de texto, tool calling, agentes ni multimodales.

## Casos de uso

- Preprocesamiento para analisis de sentimiento en redes sociales: permite segmentar frases code-switched y aplicar modelos de sentimiento especificos por idioma a cada token, mejorando la precision en textos de Twitter/X o Reddit.
- Construccion de correctores ortograficos para roman urdu: al etiquetar cada token, se puede aplicar un corrector urdu solo a las palabras URD y dejar intactas las inglesas, evitando correcciones erroneas.
- Desarrollo de chatbots de atencion al cliente en Pakistan: los asistentes pueden detectar que parte de la consulta esta en urdu y cual en ingles, y responder en el idioma adecuado o usar un modelo mixto.
- Creacion de corpus etiquetados para investigacion linguistica: el modelo puede anotar automaticamente grandes volumenes de texto code-switched, facilitando estudios sobre el fenomeno de mezcla de codigo.
- Mejora de sistemas de traduccion automatica: al identificar los segmentos de cada idioma, se pueden encadenar traductores especificos y obtener traducciones mas coherentes que con un modelo general.
- Filtrado de contenido en moderacion de comentarios: permite clasificar el idioma de cada palabra para aplicar politicas de moderacion diferenciadas segun el idioma detectado.

## Benchmarks y rendimiento

Evaluacion sobre el conjunto de test (334 tokens etiquetados):

| Etiqueta | Precision | Recall | F1-score | Soporte |
|---|---|---|---|---|
| URD | 0.990 | 0.981 | 0.985 | 206 |
| ENG | 0.946 | 0.984 | 0.965 | 125 |
| MIX | 0.000 | 0.000 | 0.000 | 3 |

Precision global: 0.973 · F1 ponderado: 0.969

No se han publicado resultados comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el modelo pesa 1,1 GB en fp32, por lo que requiere aproximadamente 1,2 GB de VRAM para inferencia en fp32. Con cuantizacion a fp16 o int8, el consumo se reduce a unos 600-700 MB.
- GPU recomendadas: cualquier GPU consumer con al menos 2 GB de VRAM (GTX 1050 Ti, RTX 2060, etc.) es suficiente. Tambien puede ejecutarse en CPU sin problemas.
- Despliegue: compatible con el pipeline de `transformers`, `Hugging Face Inference Endpoints`, y puede servirse con `vLLM` o `TGI` si se envuelve como modelo de clasificacion.
- Latencia: en CPU, la inferencia sobre una frase de 20 tokens tarda unos 50-100 ms; en GPU, menos de 10 ms.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables especificamente entrenados para la misma tarea y con el mismo conjunto de datos. Como referencia, el modelo base `xlm-roberta-base` no esta especializado en code-switching y su rendimiento en esta tarea seria inferior, pero no hay datos publicados para confirmarlo. Existen otros modelos de identificacion de idioma a nivel de token, como `mBERT` o `XLM-R` sin fine-tune, pero no son directamente comparables por la falta de benchmarks comunes.

## Limitaciones y advertencias

- La etiqueta MIX no se aprende: el modelo asigna F1 = 0 a esta clase debido a que el conjunto de datos solo contiene 11 ejemplos de tokens híbridos, insuficientes para que el modelo generalice el patron.
- Conjunto de entrenamiento muy pequeño (160 frases) y de un unico anotador, lo que limita la generalizacion a textos formales o de dominios especializados.
- Sesgo hacia temas casuales y cotidianos: el modelo puede fallar en textos tecnicos, legales o academicos donde el vocabulario difiere del usado en redes sociales.
- Riesgo de alucinacion en la clasificacion de palabras ambiguas: algunas palabras pueden ser compartidas entre urdu e ingles (p. ej., "the") y el modelo puede asignar la etiqueta incorrecta.
- Licencia MIT: permite uso comercial sin restricciones, pero no se ofrecen garantias sobre el rendimiento en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AmnaNoor123/code-switching-codesaviours-si26-amna
- Dataset en Hugging Face: https://huggingface.co/datasets/AmnaNoor123/code-switching-codesaviours-si26-amna
- Repositorio relacionado (proyecto similar de otro participante): https://github.com/Hania-Emaan/code-switching-codesaviours-si26-Hania-Emaan
- Modelo base: https://huggingface.co/FacebookAI/xlm-roberta-base
