# Plaguekind/Qwen3.8-27B-FrostDFlash-GGUF

## Resumen

Qwen3.8-27B-FrostDFlash-GGUF es un repositorio de cuantizaciones GGUF de un modelo borrador (draft model) para decodificación especulativa, no un LLM autónomo. Lo publica el usuario Plaguekind y deriva del drafter DFlash2 de z-lab para el modelo base Qwen/Qwen3.8-27B. Cada fichero contiene un modelo de aproximadamente 1.900 millones de parámetros que se ejecuta como sidecard junto al modelo objetivo bajo el modo `--spec-type draft-dflash` de llama.cpp, proponiendo bloques de tokens que el modelo grande verifica en paralelo.

El interés técnico está en la receta de cuantización con gradiente de precisión: los tensores sensibles al error (cabezas selectoras, ruta residual `ffn_down`) se mantienen en Q6_K o Q8_0, mientras que las compuertas FFN redundantes bajan a IQ3_S o Q5_K. Se ofrecen cuatro variantes: dos de vocabulario completo (Mixed-Low y Parasyte) y dos D2T que recortan la cabeza de salida a 32.768 tokens para reducir tamaño y activar la ruta d2t residente en GPU.

El repositorio ocupa 5,3 GB e incluye ficheros de entre 999 MiB y 1,44 GiB. Las variantes D2T requieren una compilación parcheada de llama.cpp; las de vocabulario completo funcionan con llama.cpp estándar. La licencia es Apache 2.0, heredada de la fuente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer borrador (draft) para decodificación especulativa DFlash2, con difusión por bloques y selectores de sucesor/predecesor |
| Parametros totales | 2.092.209.408 (dato de safetensors del repo); ~1,9B según la model card |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF mixta: IQ3_S, IQ4_XS, Q4_K, Q5_K, Q6_K, Q8_0, F32 (según tensor y variante) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (4 ficheros: Mixed-Low, D2T-Mixed-Low, D2T-Q5K, Parasyte) |

## Arquitectura y entrenamiento

El modelo es un drafter de decodificación especulativa basado en DFlash2, con mecanismo de difusión por bloques y selectores que deciden qué tokens proponer en cada posición del bloque. Consta de 81 tensores en las variantes de vocabulario completo y 83 en las D2T. Las variantes de vocabulario completo no incluyen `token_embd` ni `output.weight` propios: toman prestados el tokenizador y el embedding de salida del modelo objetivo. Las variantes D2T añaden un tensor `d2t` (I64, [32768]) con el mapeo de vocabulario reducido y una cabeza `output.weight` Q8_0 de forma [5120, 32768] extraída del cerebro Parasyte del modelo objetivo.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens, ni si hubo RLHF o DPO. La innovación destacable es la cuantización con gradiente de precisión aplicada con `llama-quantize` (commit `8b54361`) mediante `--pure` y `--tensor-type-file`. En la variante Parasyte, `ffn_down` va en Q8_0, los selectores (`hidden`, `predecessor/successor`) en Q6_K, `fc` y las proyecciones de atención en Q5_K, `ffn_gate/up` en Q5_K y las normas en F32. En Mixed-Low, los selectores van en Q6_K, la ruta residual en Q5_K y las compuertas FFN en IQ3_S. Los ficheros D2T se construyeron a partir de una cuantización Q8_0 casi sin pérdida (1,93 GiB) y del mapeo FastMTP-32K.

## Capacidades

- Generación de borradores de tokens para decodificación especulativa: propone bloques que el modelo objetivo verifica, acelerando la inferencia sin alterar la distribución de salida del modelo grande.
- Decodificación por difusión de bloques con selectores de sucesor y predecesor para determinar qué tokens entran en cada bloque.
- Variante D2T con vocabulario de salida restringido a los 32.768 tokens más útiles, con mapeo verificado como igual en orden y conjunto al de FastMTP-32K.
- Compatibilidad con llama.cpp: las variantes de vocabulario completo funcionan con compilaciones estándar; las D2T requieren una compilación parcheada con la lógica d2t en el código de modelo `qwen35`/`dflash`.
- Soporte de cuantización mixta por tensor mediante `--tensor-type-file`.
- No es un modelo conversacional ni de instrucciones: no genera respuestas de forma autónoma, no soporta tool calling ni razonamiento multi-paso por sí mismo.
- Idioma: únicamente inglés, heredado del modelo base.

## Casos de uso

- Aceleración de inferencia de Qwen3.8-27B en llama.cpp: colocar el drafter FrostDFlash como sidecard con `--spec-type draft-dflash` para que proponga bloques de tokens que el modelo de 27B verifica, reduciendo el coste por token generado en despliegues locales.
- Servicio de chat de baja latencia en GPU de consumo: la variante Mixed-Low (999 MiB, 4,31 bits por peso) añade menos de 1 GiB de VRAM al modelo objetivo y mantiene alta precisión en los selectores, adecuada para equipos con 24 GB de VRAM donde el margen es escaso.
- Despliegue en GPU con memoria limitada mediante D2T: la variante D2T-Mixed-Low (1,17 GiB) recorta la cabeza de salida a 32K tokens y activa la ruta d2t residente en GPU, útil cuando el modelo objetivo ocupa casi toda la memoria disponible.
- Máxima calidad de borrador en entornos de producción con llama.cpp estándar: la variante Parasyte (1,44 GiB, 6,27 bits por peso) replica la receta de precisión del cerebro Q8-Parasyte y no necesita compilación parcheada, lo que simplifica el despliegue.
- Investigación sobre decodificación especulativa: las cuatro variantes permiten comparar el impacto de distintas recetas de cuantización (vocabulario completo frente a recortado, IQ3_S frente a Q5_K) en la tasa de aceptación del drafter y en el throughput final.
- Evaluación de cuantización con gradiente de precisión: el repositorio documenta tensor a tensor qué roles reciben qué tipo, lo que sirve como referencia para diseñar recetas propias con `llama-quantize` en otros modelos.
- Integración en pipelines de inferencia por lotes: el drafter no modifica la salida del modelo objetivo, por lo que puede añadirse a un servicio existente de Qwen3.8-27B sin reentrenar ni recalibrar el modelo grande.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo aporta métricas de tamaño y precisión de cuantización:

| Fichero | Tamano en disco | Solo pesos | Bits/peso | Tensores | Vocabulario del draft | FFN gate/up | attn / fc |
|---|---|---|---|---|---|---|---|
| Mixed-Low | 999 MiB | 988,92 MiB | 4,31 | 81 | completo (248.320) | IQ3_S | IQ4_XS |
| D2T-Mixed-Low | 1,17 GiB | 1.159,17 MiB | 4,65 | 83 | 32.768 (d2t) | IQ3_S | IQ4_XS |
| D2T-Q5K | 1,40 GiB | 1.389,25 MiB | 5,57 | 83 | 32.768 (d2t) | Q5_K | Q4_K |
| Parasyte | 1,44 GiB | 1.438,23 MiB | 6,27 | 81 | completo (248.320) | Q5_K | Q5_K |

Referencias de la model card: Q4_K_M plano del drafter completo ocupa aproximadamente 1090 MiB y Q8_0 casi sin pérdida unos 1,93 GiB. Mixed-Low queda unos 91 MiB por debajo de Q4_K_M plano con mayor precisión efectiva en los tensores sensibles.

## Requisitos de hardware

- VRAM estimada: entre 1 y 1,5 GiB adicionales sobre el modelo objetivo, según variante (999 MiB a 1,44 GiB en disco; la VRAM en ejecución puede ser algo mayor por buffers de contexto y caché KV del drafter).
- El requisito dominante es el del modelo objetivo Qwen3.8-27B, no el del drafter: la VRAM total debe cubrir el modelo grande más el sidecard.
- GPU recomendadas: no especificadas en la información disponible. Por tamaño, cualquier GPU con margen de 1,5 GiB tras cargar el modelo objetivo es suficiente para el drafter.
- Cabe en GPU de consumo: sí, el drafter por sí solo ocupa menos de 1,5 GiB; la viabilidad depende de que el modelo de 27B cuantizado quepa junto a él.
- Opciones de despliegue: llama.cpp con `--spec-type draft-dflash`. Las variantes de vocabulario completo (Mixed-Low y Parasyte) funcionan con compilaciones estándar; las D2T requieren una compilación parcheada con la lógica d2t en el código de modelo `qwen35`/`dflash`.
- Latencia y throughput: no disponibles. La ganancia depende de la tasa de aceptación del drafter, que la model card no cuantifica.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-FrostDFlash (este) | ~1,9B (drafter) | no disponible | GGUF mixto | apache-2.0 | Cuatro variantes de cuantización; D2T requiere parche |
| z-lab/Qwen3.8-27B-DFlash2-GGUF (BF16) | no disponible | no disponible | GGUF BF16 | no disponible en la información | Fuente original del drafter; referencia de precisión completa |
| Qwen/Qwen3.8-27B | 27B (modelo objetivo) | no disponible | safetensors y GGUF | no disponible en la información | Modelo grande que el drafter acelera; no es comparable en función |
| Quantización Q8_0 del mismo drafter | ~1,9B | no disponible | GGUF | apache-2.0 | 1,93 GiB, casi sin pérdida; referencia de calidad frente a las variantes FrostDFlash |

No se dispone de datos de rendimiento para establecer comparaciones cuantitativas con otros drafters.

## Limitaciones y advertencias

- No es un LLM autónomo: no responde a instrucciones ni genera texto por sí mismo; solo propone tokens para que el modelo objetivo los verifique.
- Las variantes D2T no funcionan con llama.cpp estándar: requieren una compilación parcheada con la lógica d2t, lo que añade complejidad de despliegue y riesgo de incompatibilidad con versiones futuras.
- El vocabulario del drafter D2T está limitado a 32.768 tokens; los tokens fuera de ese subconjunto nunca se proponen como borrador, lo que puede reducir la tasa de aceptación en dominios con vocabulario especializado.
- Idioma limitado al inglés, heredado del modelo base.
- No hay datos publicados de tasa de aceptación, latencia ni throughput, por lo que la ganancia real de velocidad no está cuantificada.
- Riesgo de alucinación: no aplica directamente al drafter, ya que la salida final la determina el modelo objetivo; el drafter solo afecta la eficiencia, no la distribución de salida si la verificación es correcta.
- Sesgos: no documentados en la información disponible; dependen del modelo objetivo y del drafter original de z-lab.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3.8-27B y del drafter original de z-lab, cuya licencia no se detalla en la información proporcionada.
- El repositorio incluye una dirección de Monero y un enlace de donación en la model card; no son requisitos de uso.
- La model card menciona que el modelo objetivo es una variante "Uncensored-HauhauCS-Aggressive"; el drafter comparte tokenizador con esa fusión, lo que puede afectar la compatibilidad con otras variantes de Qwen3.8-27B.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Plaguekind/Qwen3.8-27B-FrostDFlash-GGUF
- Fuente BF16 del drafter: https://huggingface.co/z-lab/Qwen3.8-27B-DFlash2-GGUF
- Cerebro Parasyte del modelo objetivo: https://huggingface.co/Plaguekind/Qwen3.8-27B-Parasyte-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Enlace de donación del autor: https://throne.com/plaguekind/item/073bace1-2e1a-4492-95e6-024b4da6459b
- Paper, blog y repositorio de llama.cpp: no disponibles en la información proporcionada.
