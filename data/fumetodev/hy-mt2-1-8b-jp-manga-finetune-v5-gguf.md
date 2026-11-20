# fumetodev/Hy-MT2-1.8B-JP-Manga-Finetune-v5-GGUF

## Resumen

Hy-MT2-1.8B-JP-Manga-Finetune-v5 es un ajuste fino del modelo de traducción tencent/Hy-MT2-1.8B, desarrollado por el usuario fumetodev, especializado en la traducción de diálogo de manga del japonés al inglés. El modelo resuelve un problema muy concreto: la traducción de líneas cortas y autocontenidas propias del manga, manteniendo el registro, el tono y los efectos sonoros del original. Con 1.791.080.448 parámetros, es lo bastante pequeño para ejecutarse en dispositivos de consumo, incluidos teléfonos Android, como demuestra la aplicación FumetoReaderPlus del mismo autor.

La versión v5 sustituye a la v4 y se presenta como la recomendada para el par japonés-inglés. Se entrenó sobre un corpus de manga reconstruido con texto fuente más limpio y traducciones de referencia mejores, además de un conjunto reducido de líneas dirigidas a nombres cortos y palabras cortas que la v4 tendía a malinterpretar como onomatopeyas. El repositorio distribuye tanto los pesos fusionados en bf16 (safetensors) como una cuantización Q4_K_M en GGUF para llama.cpp.

La relevancia actual del modelo radica en su especialización extrema y su eficiencia: frente a modelos de traducción generalistas mucho mayores, ofrece un rendimiento medido específicamente en manga con un coste computacional mínimo, lo que permite traducción en dispositivo sin conexión. Su licencia Apache 2.0 facilita la integración en productos comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | HunYuanDenseV1ForCausalLM (transformer denso, clase `hunyuan_v1_dense`) |
| Parametros totales | 1.791.080.448 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (GGUF); pesos fusionados en bf16 (safetensors) |
| Idiomas soportados | ja, en (traducción japonés → inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bf16 fusionado) y GGUF (Q4_K_M) |

## Arquitectura y entrenamiento

El modelo es un transformer denso de la familia HunYuan (`hunyuan_v1_dense`), heredado del modelo base tencent/Hy-MT2-1.8B, con 1.791.080.448 parámetros. Los pesos distribuidos en safetensors son la fusión en bf16 del ajuste fino y se cargan con `transformers` usando `trust_remote_code=True`, igual que el modelo base. El repositorio incluye `config.json`, los ficheros del tokenizador y `chat_template.jinja`.

El ajuste fino se realizó sobre un corpus de manga reconstruido respecto a la v4, con texto fuente más limpio y traducciones de referencia de mayor calidad, complementado con un conjunto específico de líneas cortas para nombres y palabras breves. No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO. La model card indica que el modelo atiende al bloque de terminología incluido en el prompt, por lo que un glosario en la entrada mejora los resultados. Un detalle técnico crítico: el `eos_token_id` correcto es 120020, no 3 (algunos conversores escriben 3 para esta arquitectura y la generación nunca se detiene).

## Capacidades

- Traducción japonés → inglés de diálogo de manga, línea a línea, preservando registro, tono, puntuación y efectos sonoros.
- Atención a bloques de terminología o glosarios incluidos en el prompt para fijar la traducción de términos concretos.
- Manejo de nombres de personajes ficticios y onomatopeyas propias del manga.
- Formato conversacional con plantilla de chat del modelo base.
- Compatibilidad con endpoints (`endpoints_compatible`) y con llama.cpp para inferencia local.
- No cubre otros pares de idiomas: para otros destinos existe la variante v3-multilingual, inferior a esta en japonés → inglés.
- No dispone de tool calling, capacidades de agente, visión ni audio según la información disponible.

## Casos de uso

- Traducción de manga en dispositivo: el modelo, con su cuantización Q4_K_M de 1.133.080.512 bytes, se ejecuta en un teléfono Android mediante llama.cpp, como demuestra la app FumetoReaderPlus, permitiendo traducir páginas sin conexión ni servicios en la nube.
- Escaneo y traducción de páginas por lotes: integrado en un pipeline que extrae el texto japonés de cada bocadillo (OCR) y lo pasa al modelo línea a línea, aprovechando que está diseñado para líneas cortas y autocontenidas.
- Localización de manga para editoriales: uso como primera pasada de traducción que un traductor humano revisa después, con glosarios de terminología por serie inyectados en el prompt para mantener coherencia de nombres y términos.
- Herramientas de lectura para aficionados: integración en lectores de manga que muestran la traducción al inglés superpuesta o en panel lateral, con latencia baja gracias al tamaño reducido del modelo.
- Generación de subtítulos para contenido japonés de formato corto: dado que el modelo completa fragmentos truncados en enunciados completos, puede emplearse para normalizar y traducir subtítulos o transcripciones ASR de líneas breves.
- Prototipado e investigación en traducción especializada: sirve como base para experimentos de ajuste fino en otros dominios de diálogo breve, al ser un modelo pequeño, con licencia permisiva y pesos abiertos en safetensors.

## Benchmarks y rendimiento

Los datos publicados en la model card corresponden a una evaluación sobre manga no visto durante el entrenamiento:

| Metrica | Resultado |
|---|---|
| Juicio ciego por pares (LLM judge, con contexto de página) | v5 preferido sobre v2 en 47,8% de las líneas frente a 36,8%; el resto empates; v5 con menos errores de significado |
| chrF++ frente a traducciones de referencia | empate con v2 y v4 |
| COMET-22 | aproximadamente un punto por debajo de v2 y v4 |
| Longitud de salida | ~7% más larga que la de v4 |

La model card advierte que la salida de v5 difiere en redacción de las referencias, por lo que las métricas automáticas deben interpretarse como "no peor por redacción". No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada: alrededor de 3,6 GB para los pesos bf16 (1,79 mil millones de parámetros a 2 bytes) más overhead de activaciones y contexto; aproximadamente 1,2 GB para la cuantización Q4_K_M (1.133.080.512 bytes).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para bf16; para Q4_K_M basta con GPUs de gama de entrada o incluso CPU.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4090 y similares; también en dispositivos móviles Android mediante llama.cpp.
- Opciones de despliegue: llama.cpp (formato GGUF incluido), Ollama, y `transformers` con `trust_remote_code=True` para los pesos safetensors; el tag `endpoints_compatible` sugiere compatibilidad con endpoints de inferencia.
- Latencia y throughput: no disponibles de forma numérica; la model card indica que la velocidad es la misma que la de v2 y v4.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hy-MT2-1.8B-JP-Manga-Finetune-v5 | 1,79 B | no disponible | Traducción ja→en de manga | apache-2.0 | GGUF Q4_K_M y safetensors bf16 |
| Hy-MT2-1.8B-JP-Manga-Finetune-v4 | 1,79 B | no disponible | Traducción ja→en de manga (predecesor) | apache-2.0 | GGUF |
| Hy-MT2-1.8B-JP-Manga-Finetune-v3-multilingual | 1,79 B | no disponible | Traducción ja→multiidioma | apache-2.0 | GGUF |
| tencent/Hy-MT2-1.8B (base) | 1,79 B | no disponible | Traducción generalista | no disponible | safetensors |

Frente a v4, v5 mejora en el juicio ciego por pares y en errores de significado, a costa de una salida un 7% más larga y un COMET-22 ligeramente inferior. Frente a v3-multilingual, v5 es superior en japonés → inglés pero no cubre otros idiomas de destino. Frente al modelo base, v5 es más débil en nombres propios del mundo real y terminología especializada, pero está especializado en el registro del manga.

## Limitaciones y advertencias

- Los fragmentos truncados se completan en lugar de traducirse: es el fallo más común fuera del dominio del manga (por ejemplo, con entradas de ASR o subtítulos cortados).
- Los nombres propios del mundo real, lugares, marcas y terminología técnica son más débiles que en el modelo base; solo cubre bien nombres de personajes ficticios.
- Procesa una línea a la vez y no ve la página completa; cuando el japonés deja el hablante implícito, el modelo suele comprometerse con una interpretación.
- La salida es aproximadamente un 7% más larga que la de v4, lo que puede desbordar bocadillos ajustados.
- Solo traduce japonés → inglés; para otros idiomas de destino debe usarse la variante v3-multilingual.
- Riesgo de alucinación: a temperaturas superiores a las recomendadas se observa contenido inventado ocasional; la model card recomienda `temperature 0.15`, `top_k 20`, `top_p 0.6`, `repeat_penalty 1.05`, `min_p 0` y cadena de samplers penalizaciones → top_k → top_p → temperature.
- Configuración crítica: `eos_token_id` debe ser 120020; si se convierte a GGUF con el valor 3, la generación nunca se detiene.
- Licencia Apache 2.0: permite uso comercial, pero no se han documentado sesgos específicos más allá de los derivados del dominio del manga.
- No se dispone de información sobre la longitud de contexto soportada, lo que limita la planificación de prompts largos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fumetodev/Hy-MT2-1.8B-JP-Manga-Finetune-v5-GGUF
- Versión anterior v4: https://huggingface.co/fumetodev/Hy-MT2-1.8B-JP-Manga-Finetune-v4-GGUF
- Variante multilingüe v3: https://huggingface.co/fumetodev/Hy-MT2-1.8B-JP-Manga-Finetune-v3-multilingual-GGUF
- Modelo base: https://huggingface.co/tencent/Hy-MT2-1.8B
- Aplicación FumetoReaderPlus: https://github.com/fumetodev/FumetoReaderPlus
