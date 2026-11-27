# mecattaf/Ternary-Bonsai-2-9B-Bonaire-Preview

## Resumen

Ternary-Bonsai-2-9B-Bonaire-Preview es un snapshot de investigación publicado por el usuario mecattaf (repositorio `mecattaf/bonaire-engine`) que preserva el trabajo de adaptación del modelo base `prism-ml/Ternary-Bonsai-2-9B-gguf` a un formato empaquetado propietario (`weights.bin` + `model.idx` + kernels PKRN) orientado a la arquitectura AMD gfx704 (PS4/Bonaire). No es un modelo listo para usar: la model card declara explícitamente "Inference unsupported. PS4 unqualified" y el snapshot tiene `contains_weights: false`, es decir, no incluye pesos.

El repositorio contiene descriptores, inventario acotado del GGUF de origen, la receta de conversión (explícitamente bloqueada), bundles y manifiestos PKRN nativos para gfx704, recibos numéricos ligados al código fuente, entradas de licencia y el snapshot completo del código. El GGUF original publicado por prism-ml no se modifica y no se ha realizado ninguna cuantización nueva; este snapshot es únicamente material de preservación y trazabilidad.

Su relevancia es por tanto documental y de ingeniería de formatos: sirve como referencia reproducible del proceso de adaptación de un modelo ternario de 9B a un pipeline de empaquetado nativo para hardware AMD antiguo, con hashes SHA-256 del GGUF de origen y del código fuente, y con las puertas de validación del paquete completo declaradas como bloqueadas. No debe confundirse con un modelo desplegable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base derivado de `prism-ml/Ternary-Bonsai-2-9B-gguf`; el snapshot no describe la arquitectura interna) |
| Parametros totales | no disponible (el identificador sugiere 9B, sin confirmación en la información proporcionada) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | ternaria (el GGUF de origen es `PTQ1_0`; no se ha realizado cuantización nueva en este snapshot) |
| Idiomas soportados | no disponible |
| Licencia | GPL-3.0 para el software de adaptación; el modelo base declara Apache-2.0 como entrada de licencia y se deben preservar los ficheros LICENSE/NOTICE upstream |
| Formato de pesos | snapshot sin pesos (`contains_weights: false`); formato objetivo: `weights.bin` empaquetado sin pérdida, `model.idx` versionado y kernels PKRN compilados; GGUF de origen disponible en el repositorio upstream |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base en la documentación proporcionada. El snapshot no incluye pesos ni describe la topología del transformer subyacente; únicamente referencia el GGUF `Ternary-Bonsai-2-9B-PTQ1_0.gguf` publicado por prism-ml con SHA-256 `3561df7ac7d26a71ffa991ac2db740b10841c3a350aa2676ccd3ff5d428b4e8b`.

El trabajo de adaptación consiste en un pipeline de empaquetado a formato nativo para gfx704 (Bonaire, familia PS4): generación de `weights.bin`, índice `model.idx` versionado y compilación de kernels PKRN, acompañado de manifiestos, recibos numéricos ligados al código fuente y bundles HIP. La receta de conversión está explícitamente bloqueada y las puertas de validación del paquete completo permanecen bloqueadas. Se menciona además la recuperación byte a byte del módulo de laboratorio DeltaNet previo a la corrección, con un addendum separado ligado al código fuente (`original-deltanet-recovery.json`), lo que sugiere experimentación con arquitecturas híbridas, aunque no se detalla su función en el modelo final.

No hay información sobre datos de entrenamiento, número de tokens, composición del dataset ni fases de RLHF/DPO en la documentación proporcionada.

## Capacidades

- No se declaran capacidades funcionales del modelo en la información disponible; la model card indica explícitamente "Inference unsupported".
- Preservación de artefactos de adaptación: descriptores, inventario acotado del GGUF, manifiestos y bundles PKRN nativos para gfx704.
- Trazabilidad numérica: recibos ligados al código fuente y hashes SHA-256 del GGUF de origen y del snapshot de código.
- Recuperación de módulos de laboratorio: addendum byte a byte del módulo DeltaNet previo a la corrección.
- No se documenta soporte de tool calling, agentes, multilingüismo, visión, audio ni modos de razonamiento.

## Casos de uso

- Auditoría de cadena de suministro de modelos: el snapshot permite verificar el SHA-256 del GGUF de origen y del código fuente, útil para equipos que necesiten reproducir el linaje de una adaptación sin depender de artefactos volátiles.
- Ingeniería de formatos de pesos: sirve como referencia para implementar empaquetados `weights.bin` + `model.idx` con kernels compilados, al documentar descriptores y manifiestos del proceso.
- Investigación en cuantización ternaria: el enlace al GGUF `PTQ1_0` upstream y la ausencia de recuantización permiten estudiar el pipeline de adaptación sin alterar el artefacto original.
- Preservación de experimentos en hardware legacy: los bundles PKRN y módulos HIP para gfx704 documentan el intento de portar inferencia a una GPU AMD de la familia PS4, con las limitaciones de cualificación declaradas.
- Reproducibilidad académica: el snapshot de código completo y los recibos numéricos permiten a un grupo de investigación reconstruir el entorno experimental y contrastar resultados.
- Referencia para pipelines de CI de modelos: los mecanismos de "gates" bloqueados y hashes versionados pueden servir de plantilla para validaciones automáticas en la publicación de artefactos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el snapshot no contiene pesos y no es ejecutable.
- GPU objetivo del trabajo de adaptación: AMD gfx704 (Bonaire, familia PS4), con kernels PKRN nativos compilados pero no cualificados.
- Compatibilidad con GPU consumer (NVIDIA/AMD modernas): no disponible; no se documenta.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponibles para este snapshot; el GGUF de origen podría cargarse con herramientas compatibles con GGUF, pero no se confirma en la documentación.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (snapshots de preservación de adaptaciones ternarias para gfx704) ni datos de rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- El snapshot no contiene pesos (`contains_weights: false`); no es un modelo desplegable ni ejecutable.
- La model card declara "Inference unsupported" y "PS4 unqualified": los binarios nativos no han sido cualificados en PS4.
- Las puertas de validación del paquete completo están bloqueadas y no se eluden en este snapshot.
- La licencia del software de adaptación es GPL-3.0, lo que impone obligaciones de copyleft en caso de redistribución o modificación; deben preservarse los ficheros LICENSE/NOTICE del modelo base (Apache-2.0).
- No hay información sobre sesgos, riesgo de alucinación, limitaciones idiomáticas o de contexto, al no existir evaluación funcional del modelo en este snapshot.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamaño de 0.0 GB, coherente con la ausencia de pesos.
- No debe citarse como modelo de producción ni como base para afirmaciones de rendimiento.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mecattaf/Ternary-Bonsai-2-9B-Bonaire-Preview
- Modelo base (GGUF): https://huggingface.co/prism-ml/Ternary-Bonsai-2-9B-gguf
- GGUF de origen fijado: https://huggingface.co/prism-ml/Ternary-Bonsai-2-9B-gguf/resolve/82265ccc78ddaac4700286a35e9badcc32376dd9/Ternary-Bonsai-2-9B-PTQ1_0.gguf
- Código fuente (bonaire-engine): https://github.com/mecattaf/bonaire-engine/tree/1c337b8eb29b7e5eb9e0e561f028d241f3ec31d9
