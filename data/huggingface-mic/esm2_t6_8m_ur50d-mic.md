# huggingface-mic/esm2_t6_8M_UR50D-mic

## Resumen
`esm2_t6_8M_UR50D-mic` es un artefacto de prueba publicado por la organizacion `huggingface-mic` a partir del modelo `facebook/esm2_t6_8M_UR50D`, un transformer ESM-2 de 6 capas y unos 7,5 millones de parametros especializado en modelado de lenguaje enmascarado (masked language modeling) sobre secuencias de proteinas. El repositorio empaqueta los pesos "slim" del checkpoint, ejemplos de uso ejecutables y un directorio de expectativas de framework, con el objetivo de servir como fixture reproducible para validar integraciones de Transformers.

La model card es explicita: se trata de un `test-artifact`, no de un modelo utilizable en produccion. La etiqueta `test-artifact` existe precisamente para excluirlo de busquedas de modelos candidatos. El propio autor indica que los pesos son los del checkpoint original sin modificar (7,5M de parametros quedan por debajo del umbral de 20M por debajo del cual la fuente se conserva integra), y que los ficheros de procesador (`special_tokens_map.json`, `tokenizer_config.json`, `vocab.txt`) se copian byte a byte desde el modelo base.

Por tanto, esta ficha debe leerse como documentacion de un fixture de integracion, no como la de un modelo de proteinas listo para uso cientifico. Cualquier evaluacion de capacidades biologicas o de rendimiento en tareas de plegamiento o anotacion debe remitirse al checkpoint original `facebook/esm2_t6_8M_UR50D`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer ESM-2 (`EsmForMaskedLM`), 6 capas |
| Parametros totales | 7.512.482 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible (pesos en float32; verificado finito en float32, bfloat16 y float16) |
| Idiomas soportados | no disponible (modelo de secuencias de proteinas, no de lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Modelo base | facebook/esm2_t6_8M_UR50D |
| Tipo de artefacto | test-artifact / fixture de integracion |
| Dtype de los pesos | float32 |
| Tamano del repo | 0.0 GB (segun metadatos de Hugging Face) |

## Arquitectura y entrenamiento
La arquitectura corresponde a ESM-2 (`EsmForMaskedLM`), un transformer encoder de 6 capas y aproximadamente 7,5M de parametros, disenado para modelado de lenguaje enmascarado sobre secuencias de aminoacidos. El fixture conserva los nombres de tensores del checkpoint real y no introduce ninguna modificacion en los pesos: el autor indica que el checkpoint original ya es lo bastante pequeno como para no requerir "shrink", por lo que se mantiene integro.

No se proporciona informacion sobre el corpus de entrenamiento, el numero de tokens, la composicion del dataset ni si hubo etapas de RLHF o DPO; estos datos corresponderian al modelo base `facebook/esm2_t6_8M_UR50D` y no se detallan en la informacion disponible. La unica innovacion tecnica documentada es de empaquetado: el repositorio incluye un manifiesto de contrato (`integration.json`), ejemplos de uso para Transformers, un directorio de expectativas de framework y un `build.json` con fuentes fijadas, resultados de las puertas de validacion y hashes de ficheros. El autor menciona una "input-sensitivity gate" superada por los pesos, con el peor caso en `attention_mask:all_ones` con valor 20,7.

## Capacidades
- Modelado de lenguaje enmascarado sobre secuencias de proteinas (prediccion de residuos enmascarados), heredado del checkpoint `facebook/esm2_t6_8M_UR50D`.
- Generacion de representaciones internas de secuencias proteicas para tareas downstream (el fixture no documenta cabezas adicionales).
- Verificacion de integraciones de Transformers: el repositorio incluye `integrations/transformers/usage.md` y `integrations/transformers/expectations` para validar el comportamiento esperado del framework.
- Compatibilidad con el tokenizador del modelo base: `special_tokens_map.json`, `tokenizer_config.json` y `vocab.txt` copiados byte a byte.
- Ejecucion estable en float32, bfloat16 y float16 (forward, loss y gradientes finitos segun el autor).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multimodales: es un encoder de proteinas de 7,5M de parametros, no un modelo de chat.
- No hay soporte multilingue en el sentido de lenguaje natural; su "vocabulario" es el de aminoacidos del tokenizador ESM-2.

## Casos de uso
- Validacion de pipelines de Transformers: el fixture permite comprobar que una version concreta de la libreria carga `EsmForMaskedLM`, aplica el tokenizador y produce salidas con las formas y dtypes esperados, sin necesidad de descargar el checkpoint completo.
- Test de regresion en CI: al ser un repo de ~0 GB y 7,5M de parametros, se puede incluir en suites de integracion continuas para detectar roturas en la carga de safetensors, en el mapeo de tensores o en el manejo de `attention_mask`.
- Verificacion de compatibilidad de dtypes: el autor certifica finitud en float32, bfloat16 y float16, lo que permite usarlo como caso de prueba para validar rutas de mixed precision en frameworks de inferencia.
- Desarrollo de herramientas de empaquetado de modelos: el repositorio documenta como se genero el fixture (`build_fixtures.py`) y como se "encogio" la fuente, sirviendo de referencia para construir fixtures propios de otros checkpoints.
- Pruebas de tokenizacion de proteinas: los ficheros de procesador copiados byte a byte permiten validar que un pipeline tokeniza secuencias de aminoacidos de forma identica al modelo base.
- Docencia y demos de ESM-2: util para explicar la estructura de un `EsmForMaskedLM` y el flujo de masked language modeling sin requerir recursos de GPU significativos.
- No es adecuado para inferencia cientifica real (prediccion de estructura, anotacion funcional, diseno de proteinas): para esos casos debe usarse el checkpoint original.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni de tareas de proteinas (por ejemplo, perplexity en masked language modeling o resultados en benchmarks como TAPE). Tampoco se proporcionan datos de latencia o throughput.

## Requisitos de hardware
- VRAM estimada para inferencia: inferior a 1 GB en float32 (7,5M de parametros, ~30 MB de pesos) y del orden de decenas de MB en float16/bfloat16; no se proporcionan cifras oficiales.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; el modelo cabe holgadamente en tarjetas integradas o incluso en CPU.
- Cabe en GPU consumer: si, en cualquier RTX o equivalente, y tambien en CPU para pruebas.
- Opciones de despliegue: Transformers (ruta documentada en `integrations/transformers/usage.md`); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `huggingface-mic/esm2_t6_8M_UR50D-mic` | 7.512.482 | no disponible | Fixture de integracion (test-artifact) | no disponible | Hugging Face |
| `facebook/esm2_t6_8M_UR50D` | ~7,5M | no disponible | Modelo ESM-2 para proteinas | no disponible en la informacion | Hugging Face |
| Otros ESM-2 de mayor tamano (p. ej. `esm2_t33_650M_UR50D`) | ~650M | no disponible | Modelo ESM-2 para proteinas | no disponible en la informacion | Hugging Face |

La comparativa relevante es con el checkpoint original: el fixture no aporta capacidades nuevas, solo empaqueta pesos identicos con material de validacion. Frente a variantes ESM-2 de mayor tamano, la diferencia es de escala (7,5M frente a cientos de millones de parametros) y, previsiblemente, de calidad en tareas downstream, aunque no se dispone de numeros para cuantificarlo.

## Limitaciones y advertencias
- Es un `test-artifact` explicito: el autor advierte que "no es un modelo utilizable". No debe desplegarse en produccion ni usarse para inferencia cientifica.
- La etiqueta `test-artifact` lo excluye de busquedas de modelos candidatos; los pipelines que filtren por esa etiqueta no lo seleccionaran.
- Licencia no disponible: no puede asumirse uso comercial sin consultar la licencia del modelo base `facebook/esm2_t6_8M_UR50D`.
- No hay informacion sobre sesgos, alucinacion o limitaciones de contexto; al ser un encoder de proteinas, los riesgos tipicos de los LLM de texto no aplican de la misma forma, pero tampoco estan documentados.
- Los pesos son los del checkpoint original sin reentrenamiento; cualquier limitacion biologica del modelo base se hereda integra.
- El repositorio depende de ficheros generados por `build_fixtures.py`; el autor indica que algunos ficheros deben regenerarse con ese script, lo que introduce una dependencia de tooling externo.
- No se documentan garantias de soporte a largo plazo ni versionado semantico del fixture.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/huggingface-mic/esm2_t6_8M_UR50D-mic
- Modelo base: https://huggingface.co/facebook/esm2_t6_8M_UR50D
- Manifiesto de contrato: https://huggingface.co/huggingface-mic/esm2_t6_8M_UR50D-mic/blob/main/integration.json
- Uso con Transformers: https://huggingface.co/huggingface-mic/esm2_t6_8M_UR50D-mic/blob/main/integrations/transformers/usage.md
- Expectativas de Transformers: https://huggingface.co/huggingface-mic/esm2_t6_8M_UR50D-mic/tree/main/integrations/transformers/expectations
- Procedencia del fixture: https://huggingface.co/huggingface-mic/esm2_t6_8M_UR50D-mic/blob/main/build.json
- Como se encogio el fixture: https://huggingface-mic-mic-coverage.static.hf.space/shrink/esm2_t6_8M_UR50D-mic.html
- Script de construccion: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
