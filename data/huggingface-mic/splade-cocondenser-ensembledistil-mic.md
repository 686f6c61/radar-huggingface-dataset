# huggingface-mic/splade-cocondenser-ensembledistil-mic

## Resumen

`splade-cocondenser-ensembledistil-mic` es un artefacto de prueba (fixture) publicado por la organizacion `huggingface-mic` a partir del modelo `naver/splade-cocondenser-ensembledistil`. No es un modelo entrenado para recuperacion de informacion: sus pesos son aleatorios y la propia model card advierte explicitamente de que no representan la calidad de retrieval del modelo fuente. Su proposito es servir como contrato ejecutable para validar la integracion de un `SparseEncoder` de Sentence Transformers en pipelines de pruebas.

El modelo hereda la arquitectura BERT del original (familia SPLADE, codificador disperso para busqueda lexica aprendida), pero con los pesos reducidos y aleatorizados. El repositorio contiene unicamente 2.088.186 parametros, una fraccion minima de los aproximadamente 110 millones del `splade-cocondenser-ensembledistil` original, junto con un manifiesto de integracion (`integration.json`), documentacion de uso y expectativas del framework.

Su relevancia es exclusivamente para desarrolladores que mantengan integraciones de Sentence Transformers y necesiten un fixture ligero y determinista para tests de CI. No debe emplearse en produccion ni para evaluar calidad de recuperacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (encoder transformer) como SparseEncoder de Sentence Transformers |
| Parametros totales | 2.088.186 (pesos reducidos y aleatorios) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo fuente, `naver/splade-cocondenser-ensembledistil`, es un SparseEncoder basado en BERT que produce representaciones dispersas de alta dimensionalidad para recuperacion lexica aprendida (SPLADE). El artefacto `-mic` conserva la estructura del pipeline de Sentence Transformers (tokenizer, modulo de codificacion y cabecera de expansion de terminos) pero sustituye los pesos por valores aleatorios y reduce el numero de parametros a 2.088.186.

No se ha realizado entrenamiento, destilacion ni ajuste alguno sobre este artefacto. La model card indica que el fixture fue "encogido" (shrunk) a partir del original mediante un proceso documentado en un enlace externo, y que su unico contrato es la ejecucion correcta del pipeline `SparseEncoder`. No hay informacion sobre datos de entrenamiento, tokens, RLHF/DPO ni innovaciones tecnicas aplicables a este artefacto.

## Capacidades

- Ejecucion del pipeline `SparseEncoder` de Sentence Transformers con fines de prueba.
- Generacion de representaciones dispersas de forma sintactica (salida con estructura valida), aunque sin valor semantico por los pesos aleatorios.
- Verificacion de contratos de integracion: el repositorio incluye `integration.json`, `integrations/sentence_transformers/usage.md` y `integrations/sentence_transformers/expectations`.
- No soporta tool calling, function calling ni agentes.
- No dispone de capacidades multilingues verificables.
- No dispone de thinking mode, vision ni audio.

## Casos de uso

- Tests de integracion en CI: usar el fixture para comprobar que el codigo de carga de un `SparseEncoder` funciona sin descargar el modelo completo de 110M de parametros, reduciendo tiempo y ancho de banda en cada build.
- Validacion de contratos de API: ejecutar el pipeline contra `integration.json` y el directorio `expectations` para detectar regresiones en la interfaz de Sentence Transformers antes de actualizar dependencias.
- Desarrollo de herramientas de serializacion: probar rutas de guardado y carga de safetensors con un repositorio minimo y determinista.
- Pruebas de empaquetado y distribucion: verificar que el repositorio se resuelve correctamente desde Hugging Face Hub en entornos aislados (contenedores, runners sin GPU).
- Docencia y demos de pipeline: ilustrar la estructura de un SparseEncoder sin necesidad de recursos de computo significativos.
- Smoke tests de despliegue: comprobar que un servicio de inferencia arranca y responde con un modelo de 0,0 GB antes de sustituirlo por el modelo real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que los pesos son aleatorios y no representan la calidad de retrieval del modelo fuente, por lo que cualquier metrica de recuperacion (MRR, nDCG, Recall@k) carece de sentido sobre este artefacto.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en cualquier precision (2,09M de parametros).
- GPU recomendadas: no requiere GPU; puede ejecutarse en CPU sin problema.
- Cabe en cualquier GPU consumer (GTX 1050, RTX 3060, RTX 4090) e incluso en entornos sin GPU.
- Opciones de despliegue: Sentence Transformers (libreria nativa); compatible con `transformers` para carga del backbone. No se ha validado con vLLM, llama.cpp, Ollama ni TGI, y su naturaleza de SparseEncoder hace poco probable el soporte en esos motores.
- Latencia y throughput: no disponibles; al tratarse de un fixture, no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Uso previsto |
|---|---|---|---|---|---|
| `huggingface-mic/splade-cocondenser-ensembledistil-mic` | 2,09M (aleatorios) | no disponible | SparseEncoder fixture | no disponible | Tests de integracion |
| `naver/splade-cocondenser-ensembledistil` | ~110M (estimado, no confirmado en la informacion) | no disponible | SparseEncoder entrenado | no disponible | Retrieval lexico |
| `naver/splade-v3` | no disponible | no disponible | SparseEncoder entrenado | no disponible | Retrieval lexico |
| `BAAI/bge-m3` (denso + disperso) | no disponible | no disponible | Hibrido | MIT (segun informacion publica del autor) | Retrieval multilingue |

La comparativa con alternativas reales de retrieval no es significativa: el artefacto `-mic` no compite en calidad, solo en ligereza para pruebas. Para evaluar retrieval debe usarse el modelo fuente o un SPLADE entrenado.

## Limitaciones y advertencias

- Los pesos son aleatorios: cualquier embedding o score de similitud generado es ruido y no debe interpretarse como recuperacion real.
- No apto para produccion: no debe desplegarse en sistemas de busqueda, ranking ni atencion al cliente.
- Licencia no disponible: no se puede confirmar si permite uso comercial; al ser un fixture, no esta pensado para ello.
- Idiomas no declarados: no hay garantia de soporte linguistico.
- Longitud de contexto no disponible: el truncamiento del tokenizer subyacente no esta documentado en este repositorio.
- Descargas y likes a cero en el momento de la consulta: sin validacion por parte de la comunidad.
- El repositorio enlaza a recursos externos (`huggingface-mic-mic-coverage.static.hf.space`) cuya disponibilidad y contenido no estan garantizados a largo plazo.
- Riesgo de confusion: el nombre puede llevar a pensar que es un modelo SPLADE funcional; la model card lo desmiente explicitamente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/huggingface-mic/splade-cocondenser-ensembledistil-mic
- Modelo base: https://huggingface.co/naver/splade-cocondenser-ensembledistil
- Manifiesto de contrato: https://huggingface.co/huggingface-mic/splade-cocondenser-ensembledistil-mic/blob/main/integration.json
- Uso con Sentence Transformers: https://huggingface.co/huggingface-mic/splade-cocondenser-ensembledistil-mic/blob/main/integrations/sentence_transformers/usage.md
- Expectativas del framework: https://huggingface.co/huggingface-mic/splade-cocondenser-ensembledistil-mic/tree/main/integrations/sentence_transformers/expectations
- Procedencia del fixture: https://huggingface.co/huggingface-mic/splade-cocondenser-ensembledistil-mic/blob/main/build.json
- Documentacion del proceso de reduccion: https://huggingface-mic-mic-coverage.static.hf.space/shrink/splade-cocondenser-ensembledistil-mic.html
