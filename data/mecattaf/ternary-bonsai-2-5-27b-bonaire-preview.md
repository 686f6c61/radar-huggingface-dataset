# mecattaf/Ternary-Bonsai-2.5-27B-Bonaire-Preview

## Resumen

Ternary-Bonsai-2.5-27B-Bonaire-Preview es un snapshot de investigación publicado por el usuario mecattaf en Hugging Face, no un modelo listo para usar. Se trata de un paquete de preservación que documenta el trabajo de adaptación del modelo base prism-ml/Ternary-Bonsai-2.5-27B-GGUF (un modelo ternario de 27 000 millones de parámetros en formato GGUF) hacia un formato empaquetado propietario con pesos `weights.bin`, índice `model.idx` y kernels PKRN compilados para la arquitectura gfx704 (familia AMD PS4). El autor lo etiqueta explícitamente como experimental, de preparación de modelo y con inferencia no soportada.

El repositorio no contiene pesos: el campo `contains_weights` está a `false` y el tamaño del repo es de 0.0 GB. Lo que sí incluye son descriptores, un inventario acotado del GGUF de origen, la receta bloqueada de conversión, bundles PKRN nativos para gfx704, manifiestos, recibos numéricos ligados al código fuente, las entradas de licencia y una instantánea completa del código. La relevancia de esta ficha es acotada: sirve como referencia para quien investigue el pipeline de conversión de GGUF a formato empaquetado para hardware PS4, no para desplegar un modelo en producción.

La licencia del snapshot es GPL-3.0 para el software de adaptación, mientras que el modelo de origen se distribuye bajo Apache-2.0; el autor indica que este preview no altera la licencia del modelo fuente. No se dispone de información sobre arquitectura interna, datos de entrenamiento ni capacidades del modelo base en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el modelo base es un transformer ternario de 27B; la arquitectura interna no se detalla en la informacion) |
| Parametros totales | 27 000 millones (por el nombre del modelo base, no confirmado en la model card) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | ternaria (PTQ1_0 en el GGUF de origen); el snapshot no aplica nueva cuantizacion |
| Idiomas soportados | no disponible |
| Licencia | GPL-3.0 para el software de adaptacion; Apache-2.0 para el modelo fuente |
| Formato de pesos | GGUF en el origen (Ternary-Bonsai-2.5-27B-PTQ1_0.gguf); formato empaquetado propietario previsto: `weights.bin`, `model.idx` y kernels PKRN. El snapshot no incluye pesos |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna del modelo base más allá de su naturaleza ternaria (cuantización PTQ1_0 en GGUF) y su tamaño nominal de 27 000 millones de parámetros. No se detallan capas, mecanismo de atención, número de tokens de entrenamiento, composición del dataset ni si hubo RLHF, DPO u otras fases de alineamiento.

Lo que sí documenta el snapshot es el trabajo de adaptación: conversión del GGUF a un formato empaquetado sin pérdida (`weights.bin` más `model.idx` versionado), compilación de kernels PKRN nativos para gfx704 y generación de manifiestos y recibos numéricos ligados al código fuente. El autor menciona además la recuperación byte a byte de un módulo de laboratorio DeltaNet previo a una corrección, documentada en `original-deltanet-recovery.json`. La receta de conversión está explícitamente bloqueada y el autor indica que las compuertas del paquete completo de modelo siguen bloqueadas y no se eluden en este snapshot.

## Capacidades

- No se documentan capacidades funcionales del modelo en la información disponible.
- El snapshot no permite inferencia: el autor indica "Inference unsupported" y "No weights or deployment model.idx are included".
- No hay información sobre tool calling, function calling, agentes, razonamiento multi-paso, capacidades multilingües, visión, audio ni modo de pensamiento.
- El único contenido verificable es la preservación de descriptores, bundles PKRN, manifiestos y recibos numéricos del pipeline de adaptación.

## Casos de uso

- Auditoría de pipelines de conversión GGUF a formato empaquetado: el snapshot incluye descriptores, receta bloqueada e inventario acotado del GGUF de origen, lo que permite revisar paso a paso cómo se transforma un modelo ternario en `weights.bin` más `model.idx`.
- Investigación de kernels PKRN para gfx704: los bundles nativos y manifiestos sirven como referencia para estudiar la compilación de kernels en la arquitectura AMD de PS4, aunque el autor advierte que los binarios no han sido cualificados en PS4.
- Reproducibilidad de experimentos: los recibos numéricos ligados al código fuente y el hash SHA-256 del GGUF de origen permiten verificar que un experimento parte exactamente de los mismos bytes.
- Estudio de licencias en cadenas de derivación: el paquete incluye las entradas de licencia (Apache-2.0 del modelo fuente, GPL-3.0 del software de adaptación, avisos MIT/Apache de los oráculos) y sirve como caso práctico de gestión de licencias en modelos derivados.
- Preservación a largo plazo de trabajo experimental: el snapshot congela el estado del laboratorio, incluida la recuperación byte a byte del módulo DeltaNet, útil para arqueología de software científico.
- Referencia para desarrolladores que evalúan portar modelos ternarios a hardware con recursos limitados: documenta qué partes del pipeline están resueltas y cuáles siguen bloqueadas antes de intentar un despliegue real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el snapshot no incluye pesos y el autor declara la inferencia no soportada.
- GPU recomendadas: no disponible para el snapshot. El formato previsto apunta a gfx704 (familia AMD PS4), pero los binarios nativos no han sido cualificados en PS4 según el autor.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no disponible; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en este snapshot.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (snapshots de preservación de pipelines de cuantización ternaria para hardware PS4) ni datos de rendimiento que permitan una comparación fundamentada.

## Limitaciones y advertencias

- El repositorio no contiene pesos (`contains_weights: false`) ni `model.idx` de despliegue: no es posible ejecutar inferencia con este snapshot.
- El autor declara explícitamente "Inference unsupported" y "PS4 unqualified": los binarios nativos no han sido validados en hardware PS4.
- La receta de conversión está bloqueada y las compuertas del paquete completo de modelo siguen bloqueadas; el snapshot no las elude.
- El tamaño del repo es de 0.0 GB, coherente con la ausencia de pesos, pero conviene verificar los artefactos antes de asumir contenido útil.
- Licencia GPL-3.0 para el software de adaptación: impone obligaciones de copyleft si se redistribuye o modifica; el modelo fuente conserva Apache-2.0 y deben preservarse los ficheros LICENSE/NOTICE upstream.
- No hay información sobre sesgos, riesgo de alucinación, limitaciones de contexto o idioma del modelo base en la documentación disponible.
- Los módulos HIP y binarios oráculo preservados se encuentran en un archivo de laboratorio compartido con hash separado, no en este repositorio; su disponibilidad depende de ese artefacto externo.
- El campo `pipeline` no está disponible y las descargas y likes son cero, lo que sugiere un artefacto de investigación sin validación comunitaria.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/mecattaf/Ternary-Bonsai-2.5-27B-Bonaire-Preview
- Modelo base en Hugging Face: https://huggingface.co/prism-ml/Ternary-Bonsai-2.5-27B-GGUF
- GGUF de origen (URL fijada): https://huggingface.co/prism-ml/Ternary-Bonsai-2.5-27B-GGUF/resolve/28a7093cc25bc151cc2b284c5570f12ce343fdcf/Ternary-Bonsai-2.5-27B-PTQ1_0.gguf
- Código fuente del motor Bonaire: https://github.com/mecattaf/bonaire-engine/tree/1c337b8eb29b7e5eb9e0e561f028d241f3ec31d9
