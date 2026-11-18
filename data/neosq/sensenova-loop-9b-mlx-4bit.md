# NeosQ/SenseNova-Loop-9B-MLX-4bit

## Resumen

SenseNova-Loop-9B-MLX-4bit es una conversión no oficial del modelo sensenova/SenseNova-Loop-9B a formato MLX con cuantización afín de 4 bits, publicada por el usuario NeosQ. El modelo base es un transformer de aproximadamente 8.957 millones de parámetros (8,96 B) desarrollado por SenseNova, que emplea una arquitectura propietaria denominada "looped, dual-stream mHC" (multi-head communication con flujo dual y bucles recurrentes). Esta conversión conserva únicamente los pesos de generación de texto: no incluye soporte para entradas de visión.

La relevancia de esta ficha radica en que el paquete permite ejecutar el modelo en hardware Apple Silicon mediante MLX, con un tamaño de repositorio de 5,1 GB y una velocidad de generación medida de 20,90 tokens por segundo en un Mac con 128 GB de memoria unificada. Sin embargo, no funciona con mlx-lm estándar: requiere un runtime personalizado con implementación compatible de `SenseNova_loop`, incluido como `mlx_sensenova_loop.py` en el repositorio.

El modelo soporta inglés y chino, se distribuye bajo licencia Apache-2.0 y está pensado para generación de texto conversacional. La model card documenta de forma inusualmente detallada los efectos de la cuantización sobre la perplejidad y sobre la aparición de artefactos lingüísticos en chino, lo que resulta útil para evaluar su viabilidad en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con arquitectura propietaria "looped, dual-stream mHC" (multi-head communication con flujo dual y bucles) |
| Parametros totales | 8.956.949.376 (8,96 B) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits afín MLX, group size 64, 4,511 bits efectivos por peso (incluyendo metadatos); el modelo base dispone de BF16 y 8 bits como referencia |
| Idiomas soportados | inglés (en), chino (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX), cuantización 4-bit |

## Arquitectura y entrenamiento

La arquitectura del modelo base es un transformer con un diseño propietario denominado "looped, dual-stream mHC": un esquema de flujo dual con bucles recurrentes y cabezas de comunicación múltiple (mHC). La model card de esta conversión no detalla la composición del dataset de entrenamiento, el número de tokens vistos, ni si se aplicaron técnicas de RLHF o DPO; esos datos corresponden al modelo base sensenova/SenseNova-Loop-9B y no se incluyen en la información disponible.

La innovación técnica destacable de esta conversión es la optimización del runtime: la compilación de los subgrafos del router mHC incrementó la velocidad de 16,44 a 20,90 tokens por segundo (un 27,1 % más), con verificación de equivalencia de logits en salidas de 32 tokens. La cuantización se realizó con `mlx_lm.convert` sobre pesos BF16, con banderas de runtime específicas (`SENSENOVA_MHC_METAL=1` y `SENSENOVA_MHC_MERGE_METAL=1`). El paquete incluye únicamente pesos de texto; la visión no está soportada.

## Capacidades

- Generación de texto conversacional en inglés y chino.
- Generación de texto largo en chino: la model card documenta pruebas con ensayos de aproximadamente 2.000 caracteres (reflexiones de libros, ensayo argumentativo, ensayo literario y artículo de divulgación científica).
- Razonamiento: la model card menciona que el razonamiento puede producirse en inglés aunque la respuesta final sea íntegramente en chino, lo que sugiere un modo de razonamiento interno separado de la salida.
- Generación de código y matemáticas: evaluado en las comprobaciones de cuantización (posiciones de tokens en Python y matemáticas), aunque no se documentan capacidades específicas de tool calling.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas a inglés y chino según los metadatos.
- Visión: no soportada en este paquete (solo pesos de texto).

## Casos de uso

- Generación de texto largo en chino con decodificación determinista: el modelo es adecuado para redactar ensayos, artículos de divulgación o reflexiones de libros cuando se configura `temperature=0` y `top_p=1`, ajuste con el que la model card reporta 5/5 artículos finalizados sin artefactos lingüísticos en 12.109 caracteres generados.
- Asistente conversacional en local sobre Apple Silicon: con 5,1 GB de pesos y 20,90 tokens/s en un Mac de 128 GB, puede desplegarse como servicio OpenAI-compatible en un equipo de sobremesa para prototipado y uso personal.
- Evaluación de cuantización en investigación: la documentación de perplejidad (2,7875 en 4 bits frente a 2,7127 en BF16) y de acuerdo top-1 (93,81 %) permite usarlo como caso de estudio reproducible sobre el impacto de la cuantización en modelos de 9 B.
- Procesamiento de texto bilingüe inglés-chino: útil para tareas de traducción o resumen entre ambos idiomas, aunque sin garantías de fidelidad factual.
- Generación de borradores de código y texto técnico: las pruebas de cuantización incluyen posiciones de tokens en Python y matemáticas, lo que indica que el modelo maneja ese tipo de contenido, aunque no se documenta su calidad en producción.
- Investigación sobre arquitecturas recurrentes con flujo dual: el paquete incluye `mlx_sensenova_loop.py`, lo que facilita el estudio y la experimentación con la arquitectura mHC en MLX.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La model card sí incluye métricas de cuantización y velocidad:

| Metrica | BF16 | 8-bit | 4-bit |
|---|---:|---:|---:|
| Perplejidad (614 posiciones, zh/en/Python/matemáticas) | 2,7127 | 2,6938 | 2,7875 |
| Acuerdo top-1 con BF16 | referencia | 99,02 % | 93,81 % |
| Velocidad de generación (token/s, Mac 128 GB) | 8,50 | 13,51 | 20,90 |
| Palabras extranjeras en 3 ensayos (temp=1,0, top_p=0,95) | 7 | 23 | 18 |
| Palabras extranjeras por 1.000 caracteres chinos | 1,21 | 3,32 | 2,76 |

En decodificación determinista (`temperature=0`, `top_p=1`), la variante 4-bit generó 12.109 caracteres en 5 tareas chinas sin palabras extranjeras sin sentido ni caracteres Unicode de reemplazo. La model card advierte que la muestra es pequeña y no prueba la ausencia de artefactos en todos los casos.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 5,1 GB en disco; en Apple Silicon se emplea memoria unificada. Para el modelo base en BF16 se necesitarían aproximadamente 18 GB, y en 8 bits unos 9 GB.
- GPU recomendadas: la conversión está diseñada para Apple Silicon con MLX; la model card reporta pruebas en un Mac con 128 GB de memoria unificada. No se documentan pruebas en GPU NVIDIA (A100, H100, RTX 4090).
- ¿Cabe en GPU de consumo? En equipos Apple Silicon con al menos 8-16 GB de memoria unificada es plausible por tamaño, aunque no está verificado en la información disponible. En GPU NVIDIA no es directamente compatible al requerir runtime MLX.
- Opciones de despliegue: MLX u oMLX con implementación personalizada de `SenseNova_loop` (incluida como `mlx_sensenova_loop.py`); mlx-lm estándar no es suficiente. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 20,90 tokens/s en 4 bits, 13,51 en 8 bits y 8,50 en BF16, medidos como mediana de tres peticiones OpenAI-compatible generando 64 tokens en un Mac de 128 GB con oMLX 0.7.3, mlx-lm personalizado y MLX 0.32.4.

## Comparativa con modelos similares

No se dispone de datos de benchmarks estándar del modelo base ni de alternativas comparables en la información proporcionada, por lo que la comparación se limita a características estructurales.

| Modelo | Parametros | Contexto | Licencia | Formato / runtime |
|---|---|---|---|---|
| SenseNova-Loop-9B-MLX-4bit (esta ficha) | 8,96 B | no disponible | Apache-2.0 | MLX 4-bit, runtime personalizado |
| sensenova/SenseNova-Loop-9B (base) | 8,96 B | no disponible | Apache-2.0 | BF16, Hugging Face |
| Alternativas de ~9 B en MLX | no disponible | no disponible | no disponible | no disponible |

No se han identificado en la información disponible modelos comparables de la misma familia o tamaño con los que contrastar rendimiento, contexto o disponibilidad.

## Limitaciones y advertencias

- La cuantización no es sin pérdida: en 4 bits la perplejidad sube de 2,7127 a 2,7875 y el acuerdo top-1 con BF16 cae al 93,81 %.
- Artefactos lingüísticos en chino: con la configuración por defecto del modelo base (`temperature=1.0`, `top_p=0.95`) aparecen palabras extranjeras inapropiadas en todas las precisiones, incluyendo BF16 (7 en 3 ensayos); la cuantización puede agravarlo (18 en 4 bits), aunque la relación no es monotónica.
- La decodificación determinista (`temperature=0`, `top_p=1`) evita los artefactos de idioma pero no previene errores factuales, citas inventadas ni experiencias personales ficticias; es necesario revisar el contenido antes de usarlo.
- Requiere un runtime personalizado: no funciona con mlx-lm estándar; descargar el repositorio sin la implementación de `SenseNova_loop` no es suficiente.
- Solo texto: no soporta entradas de visión.
- Idiomas limitados a inglés y chino; no se documenta soporte de español.
- Es una conversión no oficial de la comunidad, no una publicación de SenseNova; debe respetarse además la licencia y términos del modelo base.
- No se documentan capacidades de tool calling, agentes ni contexto máximo, lo que limita su evaluación para pipelines de producción.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria adicional.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/NeosQ/SenseNova-Loop-9B-MLX-4bit
- Modelo base: https://huggingface.co/sensenova/SenseNova-Loop-9B
- README en chino simplificado: README.zh-CN.md (incluido en el repositorio)
- Implementación de runtime de referencia: `mlx_sensenova_loop.py` (incluido en el repositorio)
- No se han encontrado en la información disponible papers, blogs, repositorios adicionales ni demos.
