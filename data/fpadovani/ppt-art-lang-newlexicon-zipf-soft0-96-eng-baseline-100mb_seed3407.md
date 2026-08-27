# fpadovani/ppt-art-lang-newlexicon-zipf-soft0.96-eng-baseline-100mb_seed3407

## Resumen

El modelo `fpadovani/ppt-art-lang-newlexicon-zipf-soft0.96-eng-baseline-100mb_seed3407` es un ajuste fino (fine-tune) del modelo base `goldfish-models/eng_latn_100mb`, un modelo de lenguaje pequeño de 86,5 millones de parámetros basado en la arquitectura GPT-2. Ha sido entrenado mediante aprendizaje supervisado (SFT) utilizando la librería TRL de Hugging Face. El nombre sugiere que forma parte de una serie de experimentos sobre "lenguaje artificial" (ppt-art-lang) con un "nuevo léxico" (newlexicon) y una distribución Zipf suavizada (soft0.96), aunque no se proporcionan detalles adicionales sobre el propósito exacto.

Este modelo es relevante principalmente como objeto de investigación en el ámbito de la lingüística computacional y el estudio de la adquisición de lenguaje en modelos pequeños. Su tamaño reducido lo hace accesible para experimentos en hardware modesto, pero no está diseñado para uso en producción. La ausencia de información sobre licencia, idiomas y benchmarks limita su aplicabilidad práctica inmediata.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (transformer decoder) |
| Parametros totales | 86.508.288 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (probablemente 1024, sin confirmar) |
| Tipos de cuantizacion | no disponible (solo safetensors en el repo) |
| Idiomas soportados | no disponible (el nombre sugiere inglés, pero no se confirma) |
| Licencia | no disponible (la model card indica "license" sin especificar) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura GPT-2, un transformer decoder con atención causal. El modelo base `goldfish-models/eng_latn_100mb` es un modelo de 100 MB entrenado con texto en inglés (latn) y forma parte de la familia Goldfish, orientada a estudios sobre la influencia del tamaño del corpus y la composición lingüística. El ajuste fino se realizó con SFT (supervised fine-tuning) usando la librería TRL, con PyTorch 2.5.1 y Transformers 4.56.2. No se dispone de información sobre el dataset de entrenamiento, el número de tokens, ni si se aplicaron técnicas adicionales como RLHF o DPO. El nombre "zipf-soft0.96" podría referirse a una modificación en la distribución de frecuencias de las palabras durante el entrenamiento, pero no hay documentación que lo confirme.

## Capacidades

- Generación de texto: el modelo puede producir texto coherente en inglés (presumiblemente) dado un prompt, como se muestra en el ejemplo de la model card.
- Razonamiento básico: al ser un modelo pequeño, su capacidad de razonamiento complejo es limitada.
- No se han documentado capacidades de tool calling, function calling, agentes, visión, audio o modo de pensamiento.
- Multilingüismo: no confirmado; el nombre sugiere inglés, pero no hay datos oficiales.

## Casos de uso

- Investigación en lingüística computacional: el modelo puede utilizarse para estudiar cómo los modelos pequeños aprenden estructuras sintácticas y semánticas a partir de corpus limitados, especialmente en el contexto de experimentos con léxicos artificiales o distribuciones Zipf modificadas.
- Experimentos de aprendizaje por transferencia: al ser un fine-tune de un modelo base, sirve para analizar el impacto de diferentes estrategias de ajuste en modelos de tamaño reducido.
- Prototipos de generación de texto en entornos con recursos limitados: su tamaño permite ejecutarlo en CPU o GPU de baja gama, útil para pruebas conceptuales.
- Educación y demostraciones: puede emplearse en cursos de procesamiento del lenguaje natural para ilustrar el funcionamiento de transformers pequeños.
- Comparación de metodologías de entrenamiento: al existir variantes con diferentes semillas y configuraciones (por ejemplo, seed3407 vs seed455), permite estudiar la variabilidad entre ejecuciones.
- No es adecuado para aplicaciones de producción, atención al cliente, generación de código o tareas que requieran alta fiabilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar.

## Requisitos de hardware

- VRAM estimada: aproximadamente 0,2 GB para inferencia en FP32 (según estimaciones de LLM Explorer para modelos similares de 86,5M de parámetros). Con cuantización a 8 bits o 4 bits, podría reducirse aún más.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM, como NVIDIA GTX 1050, RTX 2060, o incluso CPU sola.
- Es compatible con GPUs de consumo (serie RTX, GTX) y con hardware integrado.
- Opciones de despliegue: al ser un modelo de Transformers, puede servirse con vLLM, TGI, llama.cpp (si se convierte a GGUF) u Ollama, aunque no hay configuraciones oficiales publicadas.
- Latencia y throughput: no disponibles, pero al ser un modelo pequeño, la generación es rápida incluso en CPU.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativos. Existen variantes del mismo autor con nombres similares (por ejemplo, `ppt-art-lang-newlexicon-eng-baseline-100mb_seed10`, `ppt-art-lang-newlexicon-zipf-eng-baseline-100mb_seed455`), pero no se han publicado métricas que permitan una comparación objetiva. El modelo base `goldfish-models/eng_latn_100mb` es el punto de partida, pero no se han facilitado resultados de evaluación para ninguno de ellos.

## Limitaciones y advertencias

- Sesgos conocidos: al ser un modelo pequeño entrenado con un corpus limitado, puede reflejar sesgos presentes en los datos de entrenamiento, aunque no se han documentado específicamente.
- Riesgo de alucinación: elevado, especialmente en tareas de generación libre, debido a su tamaño reducido.
- Limitaciones de contexto: la longitud de contexto no está confirmada, pero es probable que sea corta (1024 tokens o menos), lo que limita tareas que requieran memoria a largo plazo.
- Restricciones de licencia: la licencia no está especificada, lo que impide su uso comercial sin aclaración previa.
- Adecuación para producción: no recomendado; es un modelo experimental sin garantías de calidad ni soporte.
- Idiomas: no se confirma el soporte multilingüe; probablemente solo inglés.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fpadovani/ppt-art-lang-newlexicon-zipf-soft0.96-eng-baseline-100mb_seed3407
- Modelo base: https://huggingface.co/goldfish-models/eng_latn_100mb
- Variante con seed455: https://huggingface.co/fpadovani/ppt-art-lang-newlexicon-zipf-eng-baseline-100mb_seed455
- Variante en neerlandés: https://huggingface.co/fpadovani/ppt-art-lang-newlexicon-nld-baseline-100mb_seed3407
- Página de LLM Explorer para una variante similar: https://llm-explorer.com/model/fpadovani%2Fppt-art-lang-newlexicon-eng-baseline-100mb_seed10,5wPQ4CHzHD2weoAbCHyJ2f
