# huggingface-mic/nomic-embed-text-v1.5-mic

## Resumen

`huggingface-mic/nomic-embed-text-v1.5-mic` no es un modelo utilizable para inferencia, sino un artefacto de prueba (*fixture*) publicado por la organización `huggingface-mic`, vinculada a la infraestructura de contratos de integración (MIC) del repositorio `transformers-mic` de Hugging Face. Su función es verificar de forma ligera que la arquitectura `NomicBertModel` (la de los modelos de embeddings de Nomic AI) se carga y ejecuta correctamente en la librería Transformers, sin necesidad de descargar los pesos completos del modelo real `nomic-ai/nomic-embed-text-v1.5`.

El fixture conserva la misma arquitectura, los mismos nombres de tensores y los ficheros de tokenización byte a byte del modelo base, pero reduce `num_hidden_layers` a 2, lo que deja el total en 2.036.480 parámetros (frente a los 137M del modelo base). Sus pesos son aleatorios (semilla 17) y no han sido entrenados: solo se verificó que el modelo responde a las entradas y que forward, loss y gradientes son finitos en float32, bfloat16 y float16.

Es relevante para mantenedores de librerías, desarrolladores de tooling y equipos de CI/CD que necesitan validar integraciones de forma determinista y reproducible. Para producir embeddings reales debe usarse el modelo base `nomic-ai/nomic-embed-text-v1.5`, no este artefacto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | NomicBertModel (encoder tipo BERT con rotary embeddings) |
| Parámetros totales | 2.036.480 (dato real de safetensors) |
| Parámetros activos | No aplica (arquitectura densa, no es MoE) |
| Longitud de contexto | No disponible para el fixture; el modelo base nomic-embed-text-v1.5 admite 8192 tokens |
| Tipos de cuantización | Publicado en float32; verificado finito en float32, bfloat16 y float16 (forward, loss y gradientes) |
| Idiomas soportados | No disponible (el tokenizer copiado del modelo base está orientado principalmente al inglés) |
| Licencia | No disponible (el modelo base es Apache 2.0) |
| Formato de pesos | safetensors (float32); no hay GGUF ni otros formatos publicados |

Otros datos: etiquetado como `test-artifact` y `custom_code`, 0 descargas, 0 likes, creado el 29/10/2026, tamaño de repositorio 0,0 GB.

## Arquitectura y entrenamiento

El fixture instancia `NomicBertModel`, la arquitectura de la familia `nomic_bert`: un encoder tipo BERT modificado con rotary position embeddings (en lugar de embeddings de posición absolutos) y kernels de atención y MLP optimizados. La regla genérica de reducción definida en `sweep.py` del repositorio `transformers-mic` fija `num_hidden_layers` en 2, lo que explica la diferencia de tamaño respecto al modelo base de 137M de parámetros. Los ficheros de procesamiento (`config_sentence_transformers.json`, `modules.json`, `sentence_bert_config.json`, `special_tokens_map.json`, `tokenizer.json`, `tokenizer_config.json`, `vocab.txt`) se copiaron byte a byte desde `nomic-ai/nomic-embed-text-v1.5`.

No hay entrenamiento: los pesos se inicializaron aleatoriamente con semilla 17 y se validaron mediante una puerta de sensibilidad a la entrada, que exige que cada perturbación de las entradas del contrato mueva los logits al menos 0,001 (el caso más débil fue `attention_mask:all_ones`, con 0,0149). Adicionalmente se comprobó que el modelo es finito en float32, bfloat16 y float16 en forward, loss y gradientes. El fixture cubre la clave `0b79d3783837`, que agrupa todos los checkpoints cuyos ficheros de procesador son byte-idénticos y cuya configuración coincide tras la reducción. El proceso de construcción está registrado con fuentes fijadas y hashes de fichero en `build.json`.

Como referencia, el modelo base `nomic-ai/nomic-embed-text-v1.5` es un modelo de embeddings de 137M de parámetros entrenado por Nomic AI, con contexto de 8192 tokens, embeddings Matryoshka (dimensiones recortables de 64 a 768) y licencia Apache 2.0.

## Capacidades

Como artefacto de prueba (capacidades reales del fixture):

- Carga y ejecución con la misma API y los mismos nombres de tensores que el checkpoint real de NomicBert.
- Forward, cálculo de loss y retropropagación finitos en float32, bfloat16 y float16.
- Sensibilidad verificada a todas las entradas del contrato (perturbaciones mínimas de 0,001 en logits).
- Compatibilidad con los ficheros de procesamiento de `sentence-transformers` al ser copias byte a byte del modelo base.

Capacidades funcionales como modelo de lenguaje:

- Generación de texto: no (es un encoder de embeddings y, además, sus pesos son aleatorios).
- Embeddings semánticamente útiles: no, los pesos no han sido entrenados.
- Tool calling / function calling: no.
- Agentes o razonamiento multi-paso: no.
- Capacidades multilingües: no disponibles.
- Visión, audio u otras modalidades: no.

## Casos de uso

- Pruebas de integración en Transformers: verificar que `NomicBertModel` se instancia, carga pesos y ejecuta forward/loss/backward sin errores, usando solo unos 8 MB de pesos en lugar de los más de 500 MB del modelo real.
- Regresión en CI/CD de librerías: ejecutar suites de tests en cada pull request contra la arquitectura nomic_bert de forma determinista (semilla 17 y hashes en `build.json`), reduciendo tiempo y ancho de banda.
- Validación de contratos de API: comprobar que los ficheros de procesador (`tokenizer.json`, `vocab.txt`, etc.) coinciden byte a byte con lo esperado por el contrato definido en `integration.json`.
- Desarrollo de tooling de cuantización y exportación: probar pipelines de conversión de dtype (float32 a bfloat16/float16) y de exportación de pesos sobre un checkpoint con nombres de tensores idénticos al modelo de producción.
- Verificación de compatibilidad de entornos: confirmar que un runtime, driver o acelerador concreto maneja correctamente el modelo en los tres dtypes soportados, con un coste de memoria despreciable.
- Formación y onboarding: servir como ejemplo mínimo y ejecutable para aprender a cargar modelos nomic_bert con Transformers o sentence-transformers sin descargar modelos grandes.
- Reproducibilidad de experimentos: usar una fuente de verdad ligera y versionada (clave de fixture `0b79d3783837`) para comparar resultados entre versiones de la librería.

No es adecuado para búsqueda semántica, RAG, clustering ni ninguna tarea real de embeddings: para eso debe usarse el modelo base entrenado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Al tratarse de pesos aleatorios sin entrenamiento, cualquier métrica de calidad (MTEB, precisión de recuperación, etc.) carecería de significado. Los únicos datos de verificación publicados son de la puerta de sensibilidad: umbral mínimo de 0,001 en el cambio de logits por perturbación de entrada, con el caso más débil en `attention_mask:all_ones` (0,0149).

## Requisitos de hardware

- VRAM para inferencia: aproximadamente 8 MB en float32 (2.036.480 parámetros × 4 bytes), más unos pocos MB de tokenizer y configuración. No requiere GPU.
- GPU recomendadas: cualquiera; desde GPUs integradas hasta A100 o H100. No hay requisito mínimo relevante.
- Consumer GPUs: cabe sobradamente en cualquier GPU doméstica (RTX 3060, RTX 4090, portátiles, etc.) e incluso ejecuta con holgura solo en CPU.
- Despliegue: mediante `transformers` con `trust_remote_code=True` (el repositorio está etiquetado como `custom_code`) o `sentence-transformers`, dado que incluye los ficheros de configuración de esa librería. No hay pesos GGUF publicados, por lo que llama.cpp y Ollama no aplican; vLLM y TGI no tienen soporte publicado para este fixture.
- Latencia y throughput: no disponible; al ser un encoder de 2M de parámetros con 2 capas, el forward es trivialmente rápido en cualquier hardware moderno.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo | Pesos entrenados | Licencia | Formato |
|---|---|---|---|---|---|---|
| huggingface-mic/nomic-embed-text-v1.5-mic | 2,04 M | no disponible | NomicBert (encoder) | No (aleatorios, seed 17) | No declarada | safetensors fp32 |
| nomic-ai/nomic-embed-text-v1.5 (modelo base) | 137 M | 8192 | NomicBert (encoder) | Sí | Apache 2.0 | safetensors |
| sentence-transformers/all-MiniLM-L6-v2 | 22,7 M | 256 (max_seq_length) | BERT (encoder) | Sí | Apache 2.0 | safetensors |

No existen fixtures comparables publicados con datos suficientes en la información disponible. La conclusión práctica es que el fixture solo comparte arquitectura y nombres de tensores con el modelo base; en calidad y utilidad real no es comparable con ningún modelo de embeddings entrenado.

## Limitaciones y advertencias

- Pesos aleatorios sin entrenamiento: los embeddings que produce carecen de significado semántico. Usarlo en producción para búsqueda, RAG o clasificación produciría resultados inválidos.
- Etiquetado explícito como `test-artifact`, excluido deliberadamente de las búsquedas de modelos candidatos; no debe confundirse con un modelo lanzado.
- Licencia no declarada en el repositorio: antes de redistribuir el artefacto conviene revisar los términos; el modelo base es Apache 2.0, pero eso no cubre automáticamente este fixture.
- Etiqueta `custom_code`: la carga con Transformers requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio; evaluar el riesgo en entornos sensibles.
- Sin validación comunitaria: 0 descargas y 0 likes; no hay reportes de terceros sobre su comportamiento.
- Configuración reducida (2 capas ocultas frente a las 12 del modelo base): los tiempos y patrones de memoria observados con el fixture no son extrapolables al modelo real de 137M de parámetros.
- Riesgo de alucinación, sesgos y soporte de idiomas: no aplicables como modelo generativo, pero tampoco evaluables, dado que no existe entrenamiento ni evaluación publicados.

## Enlaces

- Ficha del modelo: https://huggingface.co/huggingface-mic/nomic-embed-text-v1.5-mic
- Modelo base: https://huggingface.co/nomic-ai/nomic-embed-text-v1.5
- Manifiesto de contrato: https://huggingface.co/huggingface-mic/nomic-embed-text-v1.5-mic/blob/main/integration.json
- Registro de construcción (fuentes, gates y hashes): https://huggingface.co/huggingface-mic/nomic-embed-text-v1.5-mic/blob/main/build.json
- Uso con Transformers: https://huggingface.co/huggingface-mic/nomic-embed-text-v1.5-mic/blob/main/integrations/transformers/usage.md
- Expectativas del framework: https://huggingface.co/huggingface-mic/nomic-embed-text-v1.5-mic/tree/main/integrations/transformers
- Script de barrido de configuración: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construcción de fixtures: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
