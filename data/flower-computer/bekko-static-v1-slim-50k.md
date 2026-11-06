# flower-computer/bekko-static-v1-slim-50k

## Resumen

bekko-static-v1-slim-50k es un modelo de embeddings estaticos multilingue desarrollado por flower-computer, derivado por poda de vocabulario de hotchpotch/bekko-static-embedding-v1. No es un transformer: se trata de una tabla de lookup de tokens seguida de mean pooling, con 1024 dimensiones y soporte Matryoshka (32-1024). Con 51,2 millones de parametros y un repositorio de 0,1 GB, reduce el vocabulario original de 200.000 a 50.000 piezas WordPiece, lo que baja el tamano en fp16 de 410 MB a 102 MB.

El modelo resuelve el problema del coste de despliegue de embeddings en entornos con recursos limitados: al eliminar el transformer y podar el vocabulario, la inferencia se reduce a tokenizar y promediar vectores, sin operaciones matriciales profundas. Es relevante ahora porque permite compilar el modelo directamente en un binario Rust mediante el crate `encoders`, sin Python ni descargas en tiempo de ejecucion, y mantiene 25 idiomas con una perdida de calidad moderada frente al modelo fuente.

La contrapartida principal es que solo soporta los 25 idiomas cubiertos por los benchmarks multilingues de recuperacion (MNanoBEIR, NanoMIRACL, NanoMLDR y neerlandes). El texto en otros idiomas se tokeniza a caracteres o `[UNK]`, ya que sus piezas especificas de escritura fueron eliminadas. La licencia es MIT y el pipeline declarado es sentence-similarity.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Embedding estatico (lookup de tokens + mean pooling, sin transformer) |
| Parametros totales | 51.200.000 (50.000 x 1024) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp16, tablas enteras via `quant-8` / `quant-16` (crate encoders), anchos Matryoshka 512/256/128/64/32 |
| Idiomas soportados | 25: en, ar, bn, de, es, fa, fi, fr, hi, id, it, ja, ko, nl, no, pt, ru, sr, sv, sw, te, th, vi, yo, zh |
| Licencia | MIT |
| Formato de pesos | safetensors (sentence-transformers); tabla embebida en binario via crate encoders |

## Arquitectura y entrenamiento

La arquitectura es un embedding estatico puro: cada token del vocabulario tiene un vector de 1024 dimensiones y la representacion de una frase se obtiene promediando (mean pooling) los vectores de sus tokens. No hay capas de atencion ni feed-forward; el coste computacional es O(n) en numero de tokens, sin dependencia cuadratica. Soporta dimensiones Matryoshka de 32 a 1024, de modo que se puede truncar el vector a 256 o 64 dimensiones con perdida controlada de calidad.

El vocabulario se selecciono ordenando los 200.000 tokens originales por dano esperado de eliminacion, con la formula: utilidad(t) = frecuencia en corpus de t x norma de la diferencia entre el vector de t y la suma de los vectores de las piezas a las que se re-tokeniza al eliminarlo. El proceso se hizo en rondas (eliminar el 10 % menos util, re-tokenizar, re-puntuar), con frecuencias derivadas de una mezcla por idioma de WebFAQ-v2 y Wikipedia (peso igual por idioma, ingles x3). Se conservaron siempre los tokens especiales y todas las piezas de un solo caracter presentes en el corpus. Tras el truncado, las filas supervivientes se ajustaron por autodestilacion con perdida coseno a 1024/256/64 dimensiones contra los embeddings del modelo completo, sobre parrafos de WebFAQ-v2 y Wikipedia de los idiomas cubiertos (lr 0,03, 3000 pasos, batch 1024, Adam disperso solo en filas tocadas), lo que recupera aproximadamente 1-2 puntos nDCG.

## Capacidades

- Generacion de embeddings de frases para similitud semantica y recuperacion (retrieval) densa.
- Extraccion de caracteristicas (feature-extraction) a nivel de frase.
- Soporte multilingue en 25 idiomas, incluidos arabe, bengali, hindi, telugu, thai, chino, japones, coreano y varios idiomas africanos (swahili, yoruba).
- Dimensiones Matryoshka: truncado a 512, 256, 128, 64 o 32 dimensiones sin reentrenar.
- Sin prompts ni prefijos para consultas ni documentos, igual que el modelo fuente.
- Integracion nativa en Rust mediante el crate `encoders`, con compilacion en tiempo de build y sin Python en runtime.
- Cuantizacion a enteros de 8 y 16 bits para reducir el tamano de la tabla embebida.
- No soporta tool calling, agentes, razonamiento multi-paso ni generacion de texto: es exclusivamente un modelo de embeddings.

## Casos de uso

- Busqueda semantica en aplicaciones moviles o embebidas: al compilarse en un binario Rust sin dependencias de Python, el modelo cabe en dispositivos con memoria muy limitada y permite busqueda local sobre indices de documentos sin llamadas a red.
- Deduplicacion de registros en pipelines de datos: con 1024 dimensiones y coste O(n), se pueden calcular similitudes coseno sobre lotes grandes de textos en 25 idiomas para eliminar duplicados antes de entrenar otros modelos.
- Clasificacion de tickets de soporte por similitud: se generan embeddings de las consultas entrantes y se comparan contra un conjunto de referencia etiquetado, con latencia muy baja por no requerir transformer.
- Recuperacion aumentada (RAG) en entornos con GPU limitada o sin GPU: la inferencia es puramente CPU-bound y el modelo ocupa 102 MB en fp16, por lo que puede coexistir con el generador en el mismo servidor.
- Filtrado previo en pipelines de moderacion de contenido: embeddings rapidos para una primera pasada de agrupamiento semantico antes de aplicar un modelo mas caro a los casos dudosos.
- Sistemas de recomendacion basados en contenido: representar articulos o productos en 25 idiomas y calcular vecinos mas cercanos para sugerencias cross-lingue.
- Indexacion de corpus academicos o wikipedicos multilingues: el modelo esta entrenado sobre WebFAQ-v2 y Wikipedia, por lo que su dominio de ajuste coincide con texto enciclopedico y de preguntas frecuentes.

## Benchmarks y rendimiento

Resultados publicados en la model card (nDCG@10 x 100 a 1024 dimensiones):

| Modelo | Vocab · tamano fp16 | Idiomas | NanoBEIR-en | MNanoBEIR | NanoMIRACL |
|---|---|---:|---:|---:|---:|
| hotchpotch/bekko-static-embedding-v1 | 200k · 410 MB | 40 | 53,71 | 43,71 | 68,03 |
| bekko-static-v1-slim-100k | 100k · 205 MB | 25 | 52,91 | 42,98 | 66,53 |
| bekko-static-v1-slim-75k | 75k · 154 MB | 25 | 52,09 | 42,15 | 64,51 |
| bekko-static-v1-slim-50k (este modelo) | 50k · 102 MB | 25 | 50,22 | 40,37 | 61,35 |
| bekko-static-v1-slim-32k | 32k · 66 MB | 14 | 49,31 | 39,86 | 49,25 |
| Este vocabulario sin recuperacion | 50k · 102 MB | 25 | 49,77 | 39,77 | 60,25 |

La autodestilacion recupera aproximadamente 0,45 puntos en NanoBEIR-en, 0,60 en MNanoBEIR y 1,10 en NanoMIRACL respecto al vocabulario podado sin ajuste. Frente al modelo fuente de 200k, la perdida es de 3,49 puntos en NanoBEIR-en, 3,34 en MNanoBEIR y 6,68 en NanoMIRACL.

## Requisitos de hardware

- VRAM estimada: 102 MB en fp16 para la tabla completa; 51 MB en cuantizacion de 8 bits; 66 MB si se trunca a 512 dimensiones.
- No requiere GPU: la inferencia es lookup y mean pooling, por lo que corre en CPU con latencia de microsegundos por frase.
- Cabe en cualquier GPU consumer (RTX 3060, RTX 4090) e incluso en dispositivos embebidos y moviles.
- Despliegue via sentence-transformers (Python), o via crate `encoders` en Rust con compilacion en tiempo de build (sin descarga en runtime).
- Opciones de despliegue adicionales: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, ya que no es un modelo generativo.
- Throughput: no se publican cifras de latencia o throughput en la informacion disponible; el coste escala linealmente con el numero de tokens, y el texto en idiomas cubiertos se tokeniza en aproximadamente un 18 % mas de tokens que con el tokenizador fuente.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| bekko-static-v1-slim-50k | 51,2 M | no disponible | 25 | MIT | Hugging Face + crate encoders |
| hotchpotch/bekko-static-embedding-v1 | 204,8 M (200k x 1024) | no disponible | 40 | no disponible en la info | Hugging Face |
| bekko-static-v1-slim-100k | 102,4 M | no disponible | 25 | MIT | Hugging Face |
| bekko-static-v1-slim-32k | 32,8 M | no disponible | 14 | MIT | Hugging Face |

Frente al modelo fuente, este modelo pierde 10 idiomas y entre 3 y 7 puntos nDCG, pero reduce el tamano un 75 % y permite despliegue en Rust sin Python. Frente al slim-32k, mantiene 11 idiomas adicionales (entre ellos bengali, telugu, thai, arabe y varios europeos) a cambio de 36 MB mas y una mejora de 0,91 puntos en NanoBEIR-en y 12,10 en NanoMIRACL. No se dispone de comparacion con modelos de embeddings neuronales de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Solo soporta los 25 idiomas listados; el texto en otros idiomas se tokeniza a caracteres o `[UNK]` y produce embeddings de baja calidad.
- La tokenizacion en idiomas cubiertos genera aproximadamente un 18 % mas tokens que el modelo fuente, lo que incrementa el coste de embedding proporcionalmente.
- Al ser un modelo estatico, no captura contexto posicional ni orden de palabras: frases con las mismas palabras en distinto orden producen el mismo embedding.
- Riesgo de alucinacion no aplica (no genera texto), pero la similitud coseno puede dar falsos positivos en textos cortos con vocabulario solapado.
- Sesgos: el vocabulario se selecciono con frecuencias de WebFAQ-v2 y Wikipedia con peso igual por idioma e ingles x3, lo que puede infrarrepresentar variedades dialectales o registro coloquial.
- La licencia MIT permite uso comercial sin restricciones documentadas, pero se recomienda verificar la licencia del modelo base hotchpotch/bekko-static-embedding-v1, que no se detalla en la informacion disponible.
- No es adecuado para generacion de texto, razonamiento, codigo, tool calling ni tareas de agente.
- El ajuste por autodestilacion es un ajuste ligero (mediana de desplazamiento de fila de aproximadamente el 10 % de su norma), no un reentrenamiento; las filas podadas no se recuperan.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/flower-computer/bekko-static-v1-slim-50k
- Modelo base: https://huggingface.co/hotchpotch/bekko-static-embedding-v1
- Coleccion de la familia slim: https://huggingface.co/collections/flower-computer/bekko-static-v1-slim-6aecc3d4969e7752c8a5074f
- Variante 100k: https://huggingface.co/flower-computer/bekko-static-v1-slim-100k
- Variante 75k: https://huggingface.co/flower-computer/bekko-static-v1-slim-75k
- Variante 32k: https://huggingface.co/flower-computer/bekko-static-v1-slim-32k
- Crate encoders (Rust): https://crates.io/crates/encoders
- Repositorio del crate: https://github.com/flowercomputers/encoders
