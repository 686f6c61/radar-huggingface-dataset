# fumetodev/Hy-MT2-1.8B-JP-Manga-Finetune-v4-GGUF

## Resumen

Hy-MT2-1.8B-JP-Manga-Finetune-v4-GGUF es un ajuste fino (finetune) del modelo de traducción multilingüe Hy-MT2-1.8B de Tencent, especializado en la traducción de japonés a inglés de diálogos de manga. Desarrollado por el usuario fumetodev, este checkpoint (etiquetado internamente como v4.3) es el sucesor de la versión v2 para el par japonés→inglés y está recomendado por su autor para ese par de idiomas. El modelo se distribuye en formato GGUF, listo para su uso con llama.cpp y herramientas compatibles.

La principal innovación de esta versión respecto a la v2 es la inclusión en el entrenamiento de texto japonés tal y como sale de un sistema de OCR/reconocimiento, con kana caídos, caracteres fusionados o separados y otros daños típicos. Esto mejora la calidad de traducción sobre entradas ruidosas sin degradar la calidad sobre texto limpio. Además, el entrenamiento ha reducido los errores de inversión de dirección de la acción (quién hace algo por, para o a causa de quién) en construcciones benefactivas, pasivas y causativas, aunque el autor advierte que no es un problema resuelto del todo.

El modelo está pensado exclusivamente para traducción de líneas cortas de manga, una a una, y no para otros dominios ni otros idiomas de destino. Para traducción a otros idiomas (chino simplificado, coreano, vietnamita, lenguas europeas, etc.) el autor remite a la versión v3-multilingual, que es inferior en japonés→inglés pero cubre más destinos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basada en Hy-MT2-1.8B de Tencent, detalles no especificados) |
| Parametros totales | 1.791.080.448 (1,8B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (repo GGUF, no se listan las cuantizaciones concretas) |
| Idiomas soportados | Japonés (entrada) e inglés (salida) exclusivamente en este finetune |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (también se mencionan safetensors en los tags, pero el repo es GGUF) |

## Arquitectura y entrenamiento

El modelo base Hy-MT2-1.8B es un modelo de traducción multilingüe de Tencent, parte de una familia que incluye versiones de 1.8B, 7B y 30B-A3B (MoE), con soporte para 33 idiomas y capacidad de seguir instrucciones de traducción en varios idiomas. Este finetune parte de ese modelo y se entrena específicamente con diálogos de manga japonés, con el objetivo de producir traducciones al inglés naturales y completas a partir de líneas cortas y elípticas.

El entrenamiento de esta v4 incluye una mezcla de texto limpio y texto dañado simulado por OCR, lo que mejora la robustez ante entradas ruidosas. También se incorpora un bloque de terminología en el prompt (unas pocas traducciones de referencia en inglés colocadas antes del texto japonés) al que el modelo atiende de forma efectiva, a diferencia del modelo base que lo ignora en gran medida. No se han publicado detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset ni el uso de técnicas como RLHF o DPO.

## Capacidades

- Traducción japonés→inglés de diálogos de manga, línea a línea, con salidas completas y naturales.
- Manejo de texto dañado por OCR (kana caídos, caracteres fusionados o separados) con mejor calidad que la versión v2.
- Atención a glosarios o terminología proporcionada en el prompt, lo que permite influir en las traducciones mediante un bloque de referencias en inglés.
- Menor tendencia a invertir la dirección de la acción en construcciones benefactivas, pasivas y causativas en comparación con v2.
- Compatible con el chat template del modelo base y con la cadena de muestreo recomendada (temperature 0.15, top_k 20, top_p 0.6, repeat_penalty 1.05, min_p 0).
- Formato GGUF, desplegable con llama.cpp, llama-server, Ollama y otras herramientas compatibles.

## Casos de uso

- Traducción de manga y cómic japonés: el caso de uso principal. El modelo traduce líneas de diálogo cortas y elípticas a inglés natural, manteniendo el registro conversacional. Se integra en flujos de traducción asistida donde un editor revisa las salidas.
- Postprocesado de OCR en digitalización de manga: dado que el entrenamiento incluye texto dañado por OCR, el modelo es adecuado para traducir directamente salidas de reconocedores sin limpieza previa, reduciendo el trabajo manual.
- Traducción de subtítulos o captions cortos: aunque el dominio es manga, el modelo puede aplicarse a frases breves de subtítulos o viñetas, siempre que sean líneas independientes y no párrafos largos.
- Asistencia a traductores profesionales: como herramienta de pre-traducción para diálogos de manga, con la posibilidad de inyectar un glosario de nombres propios o términos recurrentes en el prompt para mantener consistencia.
- Traducción de novelas visuales o juegos con diálogos estilo manga: el modelo puede usarse para traducir líneas de personajes en juegos japoneses, aunque conviene evaluar su rendimiento frente al modelo base en textos más formales.
- Prototipado de pipelines de traducción local: al ser un modelo pequeño (1,8B) en GGUF, puede ejecutarse en hardware modesto, lo que permite montar servicios de traducción locales sin depender de APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona evaluaciones internas (comparación con v2 sobre diálogos de manga held-out y sobre salidas de OCR dañadas), pero no proporciona métricas numéricas concretas. Tampoco se ofrecen comparaciones con otros modelos de traducción en términos de MMLU, BLEU u otras métricas estándar.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo de 1,8B parámetros en GGUF, las cuantizaciones típicas (Q4_K_M, Q5_K_M, Q8_0) requieren aproximadamente entre 1,5 y 3 GB de VRAM, dependiendo de la cuantización y del contexto.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM es suficiente. Ejemplos: NVIDIA GTX 1650, RTX 3060, RTX 4060, o incluso CPU con suficiente RAM.
- Cabe en GPUs consumer: sí, sin problema.
- Opciones de despliegue: llama.cpp, llama-server, Ollama, y cualquier runtime compatible con GGUF. También puede usarse con vLLM si se convierte a safetensors, aunque el repo está orientado a GGUF.
- Latencia y throughput: no se han publicado datos específicos. Para un modelo de 1,8B en una GPU moderna, se esperan velocidades de decodificación de decenas de tokens por segundo, suficientes para traducción interactiva.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Hy-MT2-1.8B (base) | 1,8B | No disponible | 33 idiomas | Apache-2.0 | safetensors | Modelo original de Tencent, traducción multilingüe general |
| Hy-MT2-1.8B-JP-Manga-Finetune-v4 (este) | 1,8B | No disponible | ja→en | Apache-2.0 | GGUF | Especializado en manga, robusto a OCR, solo ja→en |
| Hy-MT2-1.8B-JP-Manga-Finetune-v3-multilingual | 1,8B | No disponible | ja→varios | Apache-2.0 | GGUF | Versión multilingüe del finetune, inferior en ja→en que v4 |

No se dispone de comparaciones con otros modelos de traducción como NLLB o SeamlessM4T en la información proporcionada.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para japonés→inglés. Otros idiomas de destino no están soportados y el entrenamiento de esta forma colapsa la salida no inglesa del modelo base.
- Fragmentary input se completa en lugar de traducirse: si se le da texto truncado (salida de ASR, subtítulos cortados, fragmentos a mitad de frase), el modelo inventará una continuación completa en lugar de traducir solo lo dado. Es el fallo más común fuera del dominio.
- Los nombres propios del mundo real (personajes públicos, lugares, marcas) son menos fiables que en el modelo base, ya que los datos de entrenamiento usan nombres ficticios.
- No cubre terminología técnica, empresarial o especializada.
- El registro tiende a ser conversacional; texto formal o expositivo se traduce con un tono más casual de lo que el original requiere.
- Cada línea se traduce de forma aislada, sin contexto de página. Los pronombres o sujetos implícitos se resuelven desde la propia línea y priors generales, pudiendo cometer errores cuando la ambigüedad es irresoluble.
- La licencia Apache-2.0 permite uso comercial, pero el autor advierte que el modelo no domina al modelo base en todos los escenarios; se recomienda hacer pruebas A/B antes de desplegarlo en producción con texto continuo o prosa larga.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/fumetodev/Hy-MT2-1.8B-JP-Manga-Finetune-v4-GGUF
- Versión v3-multilingual: https://huggingface.co/fumetodev/Hy-MT2-1.8B-JP-Manga-Finetune-v3-multilingual-GGUF
- Repositorio GitHub de Tencent Hy-MT2: https://github.com/Tencent-Hunyuan/Hy-MT2
- Aplicación de escritorio Hy-MT2 Desktop Translator: https://github.com/ghghung/HY-MT2-APP
