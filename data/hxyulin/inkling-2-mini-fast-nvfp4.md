# hxyulin/Inkling-2-Mini-Fast-NVFP4

## Resumen

Inkling-2-Mini-Fast-NVFP4 es una reconstrucción en formato safetensors del ajuste "Fast" que Lucebox publicó originalmente solo como archivos GGUF sobre el modelo Inkling 2 Mini de Thinking Machines Lab. El repositorio, mantenido por el usuario hxyulin, devuelve los pesos del ajuste al layout oficial del checkpoint para que los motores de inferencia que leen el checkpoint oficial puedan ejecutarlo sin cambios de código. No es un lanzamiento oficial ni de Thinking Machines Lab ni de Lucebox, y ninguno de los dos lo ha revisado.

El modelo es un transformer con arquitectura de mezcla de expertos (MoE) de 26.388.646.440 parámetros totales, con pesos de expertos cuantizados en NVFP4 en las capas 0 a 19 y MXFP8 en las capas 20 a 23, mientras que atención, embeddings, LM head, normas y pesos de router y loop se mantienen en BF16 o F32. Incluye además un archivo `mtp.safetensors` con un draft DSpark para decodificación especulativa, idéntico byte a byte al oficial.

La relevancia de esta ficha radica en que el ajuste de Lucebox reduce drásticamente la longitud de las respuestas sin perder precisión en las pruebas publicadas, lo que lo hace interesante para despliegues con latencia y coste de tokens acotados. El repositorio tiene 20,2 GB, licencia Apache 2.0 y pipeline image-text-to-text, aunque el autor solo lo ha probado con entrada de texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con loop y router, draft MTP (DSpark) para decodificación especulativa |
| Parametros totales | 26.388.646.440 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (expertos capas 0-19), MXFP8 (expertos capas 20-23), BF16/F32 (resto) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con `mtp.safetensors` separado) |

## Arquitectura y entrenamiento

El modelo base es Inkling 2 Mini de Thinking Machines Lab, un transformer con mezcla de expertos que incorpora un mecanismo de "loop" y pesos de router, además de un módulo MTP (multi-token prediction) en `mtp.safetensors` que actúa como draft para decodificación especulativa. La cuantización de los expertos no es uniforme: las capas 0 a 19 usan NVFP4 y las 20 a 23 usan MXFP8, tal y como las publicó el autor original; no existen versiones públicas de los expertos en mayor precisión.

El ajuste de Lucebox modifica únicamente una matriz por capa, la proyección de salida de atención (`model.llm.layers.N.attn.wo_ud.weight`), en las 24 capas del modelo. El resto de tensores del GGUF de Lucebox coincide con el checkpoint oficial. Las matrices ajustadas difieren de las oficiales entre un 1,9 % y un 7,4 % en norma de Frobenius relativa, con mayor divergencia en las últimas capas. Lucebox no ha publicado cómo entrenó el ajuste, y el draft MTP se entrenó sobre las salidas del modelo oficial, no sobre las del ajuste. Este repositorio sustituye esas 24 matrices por las versiones BF16 copiadas bit a bit del archivo `UD-Q8_K_XL.gguf` de Lucebox, sin cuantizar ni descuantizar ningún tensor.

## Capacidades

- Generación de texto conversacional y razonamiento conciso, con modo de razonamiento abreviado ("concise-reasoning") que reduce el número de tokens de salida.
- Razonamiento matemático y resolución de problemas tipo MATH-500, con resultados medidos en la model card.
- Generación de código y evaluación tipo HumanEval, con soporte para preguntas de programación.
- Conocimiento general y preguntas de opción múltiple tipo MMLU-Pro y GPQA.
- Pipeline declarado image-text-to-text, aunque el autor solo ha validado entrada de texto y no documenta el comportamiento con imágenes.
- Decodificación especulativa mediante el draft MTP incluido, que acelera la generación.
- Soporte de tool calling, agentes y multi-step reasoning: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Razonamiento matemático con presupuesto de tokens acotado: el ajuste reduce la mediana de tokens de salida de 849 a 287 en el conjunto de 130 preguntas de la model card, manteniendo 122 aciertos sobre 130, lo que lo hace adecuado para entornos donde el coste por respuesta importa.
- Evaluación de modelos en pipelines de CI: al cargarse donde carga el checkpoint oficial y mantener el chat template oficial, puede sustituir al modelo base en suites de evaluación existentes sin cambios de código.
- Despliegue en una sola GPU de consumo: el autor lo ejecuta en una RTX 5090 con el motor Siphon, lo que permite probar un MoE de 26B en hardware de gama alta para consumidores.
- Preguntas de ciencia y opción múltiple tipo GPQA: en las 100 preguntas medidas con temperatura 1 y tope de 32K tokens de salida, el ajuste obtiene 81 aciertos frente a 77 del oficial y ninguna respuesta truncada frente a 14, lo que lo hace útil para evaluaciones con límite de salida.
- Servicio de chat con latencia reducida: la menor longitud de salida y la decodificación especulativa con el draft MTP reducen el tiempo total de generación en cargas conversacionales.
- Investigación sobre ajustes de "concisión": sirve como caso de estudio reproducible para analizar cómo un ajuste de 24 matrices de proyección de atención altera el comportamiento de razonamiento de un MoE.
- Prototipado de asistentes con decodificación especulativa: el `mtp.safetensors` incluido permite experimentar con draft models en motores que soporten MTP.

## Benchmarks y rendimiento

Los datos provienen de una compilación anterior que usaba las copias Q8_0 de las mismas 24 matrices de Lucebox, que difieren de las BF16 de este repositorio en torno a un 0,8 % en norma relativa por capa; el autor indica que actualizará las cifras al reejecutar sobre esta compilación exacta. Medido con Siphon en una RTX 5090 con ajustes por defecto, comparando el checkpoint oficial contra este.

| Prueba | Oficial | Fast |
|---|---:|---:|
| 130 preguntas (MATH-500 0-39, HumanEval 0-39, MMLU-Pro 0-49), temperatura 1 | 122 | 122 |
| Mismas 130, mediana de tokens de salida | 849 | 287 |
| Mismas 130, greedy | 113 | 121 |
| 100 preguntas GPQA, temperatura 1, tope de 32K de salida | 77 | 81 |
| Mismas 100, media de tokens de salida | 11.871 | 3.055 |
| Mismas 100, respuestas cortadas por el tope | 14 | 0 |

En decodificación greedy, el modelo oficial entró en bucle hasta el tope de salida en 9 de las 130 preguntas, mientras que el ajuste lo hizo en 3. Sobre textos de referencia, el top-1 del siguiente token del ajuste coincide con el modelo oficial ejecutado en MLX en el 94-96 % de las posiciones, y el checkpoint oficial ejecutado en Siphon coincide en el 97 %.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 20,2 GB en disco; con los expertos en NVFP4 y MXFP8 y el resto en BF16/F32, se necesita una GPU con al menos 24 GB de VRAM para cargar el checkpoint completo sin offload.
- GPU recomendadas: RTX 5090 (única configuración validada por el autor, con Siphon), y por capacidad de VRAM también A100 40 GB, H100 80 GB o RTX 4090 24 GB, aunque estas últimas no están verificadas en la información disponible.
- Cabe en GPU de consumo: sí, en RTX 5090 según el autor; en RTX 4090 24 GB es plausible por tamaño, pero no está confirmado.
- Opciones de despliegue: Siphon (motor del autor, compilado con `cargo build --release` y servido con `siphon-serve`); otros motores que lean el checkpoint oficial en safetensors podrían funcionar, pero no están verificados.
- Latencia y throughput estimados: no disponible; la model card solo reporta longitudes de salida y aciertos, no tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Inkling-2-Mini-Fast-NVFP4 (este) | 26.388.646.440 | no disponible | Apache 2.0 | safetensors, 20,2 GB | Ajuste de 24 matrices, expertos NVFP4/MXFP8 |
| thinkingmachines/Inkling-2-Mini (oficial) | 26.388.646.440 | no disponible | Apache 2.0 | safetensors oficial | Modelo base sin ajuste, respuestas más largas |
| Lucebox/Inkling-2-Mini-Fast-GGUF | 26.388.646.440 | no disponible | Apache 2.0 | GGUF | Mismo ajuste en formato GGUF, para llama.cpp y similares |

No se dispone de datos de benchmarks de modelos de otros autores comparables en la información proporcionada.

## Limitaciones y advertencias

- No es un lanzamiento oficial: ni Thinking Machines Lab ni Lucebox han revisado este repositorio, y el autor lo declara explícitamente.
- Solo se ha probado con el motor Siphon y con entrada de texto; el pipeline declarado image-text-to-text no está validado por el autor.
- Las cifras de benchmarks provienen de una compilación anterior con matrices Q8_0, no de las BF16 de este repositorio; pueden variar ligeramente.
- Lucebox no ha publicado el método de entrenamiento del ajuste, lo que limita la reproducibilidad y la auditabilidad.
- El draft MTP se entrenó sobre las salidas del modelo oficial, no sobre las del ajuste, por lo que la decodificación especulativa puede tener una tasa de aceptación distinta a la esperada.
- Riesgo de alucinación y sesgos: no evaluados en este repositorio; se remite a la model card oficial de Inkling 2 Mini, cuyas guías de uso responsable, documentación de datos y evaluaciones de seguridad aplican también aquí.
- Idiomas soportados y longitud de contexto: no disponibles en la información proporcionada.
- Licencia Apache 2.0 permite uso comercial, pero al ser un derivado no oficial conviene revisar el archivo `NOTICE` y las atribuciones antes de desplegarlo en producción.
- El nombre "Inkling" pertenece a Thinking Machines Lab; su uso aquí solo identifica el modelo del que derivan los pesos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/hxyulin/Inkling-2-Mini-Fast-NVFP4
- Modelo base oficial: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Ajuste Fast de Lucebox (GGUF): https://huggingface.co/Lucebox/Inkling-2-Mini-Fast-GGUF
- Motor Siphon: https://github.com/hxyulin/siphon-engine
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
