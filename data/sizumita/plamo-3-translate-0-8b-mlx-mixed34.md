# sizumita/plamo-3-translate-0.8b-mlx-mixed34

## Resumen

PLaMo 3 Translate 0.8B — MLX mixed 3/4bit es una conversión cuantizada del modelo de traducción `pfnet/plamo-3-translate-0.8b` de Preferred Networks, publicada por el usuario `sizumita` para su ejecución en Apple Silicon mediante la librería MLX. El modelo original es un transformer de aproximadamente 890 millones de parámetros especializado en traducción multilingüe entre japonés, inglés, chino y coreano, y esta variante lo adapta al ecosistema MLX con una receta de cuantización mixta de 3 y 4 bits.

La relevancia de esta ficha radica en que demuestra una estrategia de cuantización mixta (inspirada en Q4_K_M de llama.cpp) aplicada a un modelo de traducción pequeño: se mantienen en 4 bits el `lm_head` y las `down_proj` de la primera, última y cada tercera capa, mientras que el resto se cuantiza a 3 bits con tamaño de grupo 64, resultando en 3,804 bits por peso de media. El resultado pesa 423 MB frente a los 501 MB de la conversión uniforme a 4 bits, con una velocidad de decodificación de aproximadamente 352 tokens/s en un Mac mini M2 Pro.

El modelo conserva el vocabulario completo de 107.520 tokens y no recorta la tokenización, lo que mantiene la cobertura multilingüe del modelo base. Es una conversión no oficial, no afiliada ni respaldada por Preferred Networks, distribuida bajo la PLaMo Community License.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base `pfnet/plamo-3-translate-0.8b`); pesos en MLX con cuantización mixta afín, grupo 64 |
| Parametros totales | 890.344.960 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mixta 3/4 bits (lm_head y down_proj de primera, última y cada tercera capa a 4 bits; resto a 3 bits); 3,804 bits/peso de media |
| Idiomas soportados | ja, en, zh, ko |
| Licencia | PLaMo Community License (otros) |
| Formato de pesos | safetensors (MLX), ~423 MB en `model.safetensors` |

## Arquitectura y entrenamiento

El modelo subyacente es `pfnet/plamo-3-translate-0.8b`, un transformer de aproximadamente 890 millones de parámetros orientado a traducción multilingüe. La información disponible no detalla la composición del dataset de entrenamiento del modelo base, el número de tokens, ni si se aplicaron técnicas de RLHF o DPO; estos datos deben consultarse en la model card del modelo original de Preferred Networks.

La innovación técnica de esta ficha reside en la conversión: se ha utilizado `mlx-lm 0.32.2` con el predicado de cuantización `mixed_3_4`, replicando la estrategia de asignación de llama.cpp Q4_K_M. Se mantienen a 4 bits el `lm_head` y las proyecciones `down_proj` de la primera capa, la última y cada tercera capa, mientras que el resto de pesos se cuantizan a 3 bits con cuantización afín y tamaño de grupo 64. El vocabulario completo de 107.520 tokens se conserva sin recorte. El tokenizador requiere código personalizado incluido en el repositorio (`trust_remote_code=True`).

## Capacidades

- Traducción multilingüe entre japonés, inglés, chino y coreano, con soporte de plantilla de chat que acepta un parámetro `target_lang` para indicar el idioma destino.
- Generación de texto condicionada a instrucciones de traducción mediante `apply_chat_template`.
- Ejecución en Apple Silicon mediante MLX, con decodificación rápida (~352 tokens/s en M2 Pro).
- Gestión de memoria reducida (~565 MB de pico gestionado por MLX), adecuada para equipos con poca VRAM unificada.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio en la información disponible.
- Capacidades multilingües limitadas a los cuatro idiomas declarados (ja, en, zh, ko).

## Casos de uso

- Traducción de documentación técnica en local: el modelo permite traducir textos entre inglés, chino, coreano y japonés directamente en un Mac sin conexión a servicios en la nube, gracias a su reducido peso de 423 MB y su ejecución con MLX.
- Procesamiento por lotes de noticias o corpus: con una velocidad de ~352 tokens/s en M2 Pro, es viable traducir lotes de artículos periodísticos o entradas de blog, como demuestra la evaluación sobre NTREX-128.
- Integración en aplicaciones de escritorio para macOS: al ejecutarse con mlx-lm y ocupar menos de 600 MB de memoria, puede incorporarse como motor de traducción embebido en apps nativas de Apple Silicon.
- Preprocesamiento de datos multilingües para pipelines de ML: útil para normalizar o traducir datasets de entrenamiento entre los cuatro idiomas soportados antes de otras etapas de procesamiento.
- Prototipado y evaluación de estrategias de cuantización: sirve como referencia práctica para comparar recetas mixtas 3/4 bits frente a cuantización uniforme a 4 bits en términos de tamaño, velocidad y calidad (chrF++).
- Traducción asistida en entornos con requisitos de privacidad: al ejecutarse localmente, evita enviar contenido sensible a APIs externas, siempre que se respete la licencia.
- Herramientas de traducción para desarrolladores: puede integrarse en scripts o extensiones de editor para traducir mensajes de commit, comentarios de código o documentación entre los idiomas soportados.

## Benchmarks y rendimiento

Calidad medida con chrF++ y decodificación greedy en MLX sobre Mac mini M2 Pro (mlx-lm 0.32.2). Se compara con la conversión uniforme a 4 bits del mismo autor.

FLORES-200 devtest (primeras 100 frases por dirección):

| Direccion | Mixed 3/4bit | 4bit uniforme |
|---|---|---|
| en→ja | 33,30 | 34,70 |
| zh→ja | 30,19 | 31,62 |
| ko→ja | 30,64 | 28,37 |
| **Media** | **31,37** | **31,56** |

NTREX-128 (texto de noticias no visto, primeras 200 frases por dirección):

| Direccion | Mixed 3/4bit | 4bit uniforme |
|---|---|---|
| en→ja | 25,66 | 25,58 |
| zh→ja | 21,49 | 21,29 |
| ko→ja | 22,93 | 23,34 |
| ja→en | 48,19 | 49,41 |
| **Media** | **29,57** | **29,90** |

Rendimiento en Apple Silicon (Mac mini M2 Pro, 32 GB):

| Metrica | Mixed 3/4bit | 4bit uniforme |
|---|---|---|
| Pesos | ~423 MB | 501 MB |
| Velocidad de decodificacion | ~352 tokens/s | ~334 tokens/s |
| Memoria pico (MLX) | ~565 MB | ~642 MB |
| Tiempo de carga | ~2,5 s | ~3,1 s |

## Requisitos de hardware

- VRAM/memoria estimada: ~423 MB de pesos y ~565 MB de pico gestionado por MLX en inferencia; en la práctica se recomienda al menos 1 GB de memoria unificada libre.
- GPU recomendadas: Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra) mediante MLX. No está pensado para GPU NVIDIA ni AMD en este formato.
- Cabe en cualquier Mac con Apple Silicon; el autor lo ha validado en un Mac mini M2 Pro con 32 GB, pero el consumo es lo bastante bajo para equipos con 8 GB.
- Opciones de despliegue: `mlx-lm` (versión 0.32.2 o compatible). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en este repositorio.
- Latencia y throughput: ~352 tokens/s de decodificación y ~2,5 s de carga en M2 Pro; no se proporcionan datos para otros chips.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Calidad (chrF++ medio FLORES-200) | Licencia | Formato |
|---|---|---|---|---|---|
| Este modelo (mixed 3/4bit) | 890 M | no disponible | 31,37 | PLaMo Community License | MLX safetensors |
| plamo-3-translate-0.8b-mlx-4bit-compact | 890 M | no disponible | 31,56 | PLaMo Community License | MLX safetensors |
| pfnet/plamo-3-translate-0.8b (BF16) | 890 M | no disponible | no disponible | PLaMo Community License | safetensors |

No se dispone de datos de benchmarks de otros modelos de traducción comparables en la información proporcionada.

## Limitaciones y advertencias

- Es una conversión no oficial: no está afiliada ni respaldada por Preferred Networks, Inc.
- La licencia PLaMo Community License exige que la redistribución incluya el texto de la licencia, muestre "Built with PLaMo" y mantenga "PLaMo" en el nombre del modelo (Artículo 4).
- Uso comercial: requiere registro previo con PFN y está limitado a usuarios con ingresos anuales no superiores a 1.000 millones de yenes; un uso comercial a mayor escala requiere una licencia separada (Artículo 3).
- Solo cubre los idiomas ja, en, zh y ko; no se documenta soporte para castellano ni otros idiomas.
- La cuantización mixta produce traducciones greedy distintas de las del modelo a 4 bits (solo 12–28 de 200 frases idénticas por dirección en NTREX), aunque la calidad referencial sea equivalente; si se necesita reproducibilidad exacta con el 4 bits, debe usarse ese modelo.
- No se documentan datos sobre sesgos, riesgo de alucinación ni longitud de contexto; deben consultarse en la model card del modelo base.
- El tokenizador requiere `trust_remote_code=True`, lo que implica ejecutar código personalizado del repositorio.
- El formato MLX limita su uso a Apple Silicon; no es directamente portable a otros backends sin reconversión.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/sizumita/plamo-3-translate-0.8b-mlx-mixed34
- Modelo base: https://huggingface.co/pfnet/plamo-3-translate-0.8b
- Conversión uniforme a 4 bits: https://huggingface.co/sizumita/plamo-3-translate-0.8b-mlx-4bit-compact
- Licencia PLaMo Community (EN): https://plamo.preferredai.jp/info/plamo-community-license-en
