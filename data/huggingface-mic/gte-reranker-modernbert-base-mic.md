# huggingface-mic/gte-reranker-modernbert-base-mic

## Resumen

`gte-reranker-modernbert-base-mic` es un artefacto de prueba (fixture) publicado por la organizacion `huggingface-mic` en HuggingFace. No se trata de un modelo entrenado para produccion, sino de una version "slim" (reducida) del modelo `Alibaba-NLP/gte-reranker-modernbert-base`, generada para validar contratos de integracion con frameworks (en este caso, Sentence Transformers). La model card es explicita: los pesos son aleatorios y no representan la calidad de recuperacion del modelo original.

El modelo base del que deriva, `gte-reranker-modernbert-base`, es un cross-encoder de la familia GTE construido sobre la arquitectura ModernBERT de Alibaba-NLP, orientado a la tarea de re-ranking en pipelines de recuperacion de informacion (RAG, busqueda semantica). Sin embargo, este repositorio concreto no hereda esas capacidades: solo conserva la estructura del pipeline y un conjunto minimo de pesos para que las pruebas de integracion puedan ejecutarse.

Su relevancia es, por tanto, exclusivamente de ingenieria: sirve como fixture reproducible para verificar que una integracion con Sentence Transformers (clase CrossEncoder) carga, ejecuta y devuelve resultados con la forma esperada. No debe evaluarse ni desplegarse como modelo de re-ranking real. El repositorio incluye un manifiesto de contrato (`integration.json`), instrucciones de uso (`integrations/sentence_transformers/usage.md`), expectativas del framework y procedencia del fixture (`build.json`).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (cross-encoder), derivada del modelo base `Alibaba-NLP/gte-reranker-modernbert-base` |
| Parametros totales | 3.310.017 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Libreria | sentence-transformers |
| Tipo de pipeline | CrossEncoder (re-ranking) |
| Tamano del repositorio | 0.0 GB |
| Modelo base | Alibaba-NLP/gte-reranker-modernbert-base |

## Arquitectura y entrenamiento

La arquitectura subyacente es ModernBERT en configuracion de cross-encoder, heredada de `Alibaba-NLP/gte-reranker-modernbert-base`. Un cross-encoder procesa conjuntamente el par (consulta, documento) y produce una puntuacion de relevancia, a diferencia de los bi-encoders que generan embeddings independientes. ModernBERT incorpora mejoras sobre BERT clasico como atencion con rotacion posicional (RoPE), capas alternas de atencion local y global, y un mayor contexto efectivo, aunque los detalles concretos de esta instancia no se documentan en la informacion disponible.

No obstante, este repositorio concreto **no ha sido entrenado**. La model card indica que se trata de un "MIC fixture" con pesos aleatorios, generado mediante un proceso de "shrink" documentado en un enlace externo. El objetivo del shrink es reducir el tamano del pipeline manteniendo la estructura funcional para pruebas de integracion. No hay informacion sobre datos de entrenamiento, tokens, RLHF/DPO ni innovaciones tecnicas propias, porque el artefacto no incorpora entrenamiento alguno.

## Capacidades

- Carga y ejecucion como `CrossEncoder` dentro de Sentence Transformers, con la firma de API esperada por el framework.
- Prediccion de puntuaciones de relevancia para pares (consulta, documento) con la forma de salida correcta, aunque los valores son aleatorios.
- Verificacion de contratos de integracion: el repositorio incluye `integration.json` y un directorio `integrations/sentence_transformers/expectations` para validar comportamiento.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues verificadas (idiomas no disponibles).
- No dispone de modo thinking, vision ni audio.
- No debe usarse para generacion de texto: es un cross-encoder de scoring, no un modelo generativo.

## Casos de uso

- Pruebas de integracion en CI/CD: validar que la clase `CrossEncoder` de Sentence Transformers carga el repositorio, ejecuta `predict()` y devuelve un array con la forma esperada antes de cambiar a un modelo real.
- Desarrollo de frameworks y librerias: servir como fixture estable y ligero para tests unitarios de pipelines de re-ranking sin depender de pesos grandes ni de descargas costosas.
- Validacion de contratos de API: comprobar que una nueva version de Sentence Transformers respeta las expectativas documentadas en `integrations/sentence_transformers/expectations`.
- Reproducibilidad de builds: el archivo `build.json` permite rastrear la procedencia del fixture y reproducir el proceso de shrink documentado externamente.
- Formacion y documentacion: ejemplo minimo de la estructura de un repositorio de cross-encoder con manifiesto de integracion, util para quienes publican sus propios modelos.
- Smoke tests en entornos sin GPU: con 3,3 M de parametros y pesos safetensors, la carga es inmediata y no requiere hardware especial, lo que facilita pruebas en runners de CI con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card advierte explicitamente de que los pesos son aleatorios y no representan la calidad de recuperacion del modelo original, por lo que cualquier metrica de re-ranking (nDCG, MRR, MAP) seria invalida.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB. Con 3,3 M de parametros en safetensors (aproximadamente 13 MB en fp32), cabe holgadamente en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: ninguna en particular; cualquier GPU con al menos 1 GB de VRAM es suficiente. Tambien funciona en CPU sin problemas de latencia perceptible.
- Cabe en cualquier GPU consumer (GTX 1050, RTX 3060, RTX 4090, etc.) y en entornos sin GPU.
- Opciones de despliegue: Sentence Transformers (CrossEncoder) es la via documentada. Otras opciones como vLLM, llama.cpp u Ollama no aplican, ya que no es un modelo generativo.
- Latencia y throughput: no disponibles de forma oficial. Por el tamano, la inferencia en CPU deberia ser del orden de milisegundos por par, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `huggingface-mic/gte-reranker-modernbert-base-mic` | 3,3 M | Cross-encoder (fixture) | Pruebas de integracion | no disponible | HuggingFace |
| `Alibaba-NLP/gte-reranker-modernbert-base` | no disponible en esta ficha | Cross-encoder | Re-ranking en produccion | no disponible en esta ficha | HuggingFace |
| `BAAI/bge-reranker-base` | no disponible en esta ficha | Cross-encoder | Re-ranking en produccion | no disponible en esta ficha | HuggingFace |

La comparacion directa con alternativas de produccion no es significativa: este artefacto no compite en calidad de retrieval, solo en estructura de pipeline. Cualquier modelo cross-encoder entrenado de la misma categoria (GTE, BGE, Cohere Rerank) seria superior en cualquier metrica de re-ranking.

## Limitaciones y advertencias

- Pesos aleatorios: la model card declara explicitamente que no representan la calidad de recuperacion del modelo original. No usar en produccion bajo ningun concepto.
- Artefacto de prueba: etiquetado como `test-artifact` y `mic`; su proposito es validar integraciones, no resolver tareas reales.
- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido. Al derivar de `Alibaba-NLP/gte-reranker-modernbert-base`, habria que consultar la licencia del modelo base antes de cualquier uso.
- Idiomas no disponibles: no se documenta cobertura linguistica.
- Contexto no disponible: no se especifica la longitud maxima de secuencia del cross-encoder.
- Riesgo de confusion: el nombre incluye "gte-reranker-modernbert-base", lo que puede llevar a error si se busca el modelo real. Verificar siempre el sufijo `-mic` y la advertencia de la model card.
- Sin garantias de mantenimiento: creado y actualizado el 2026-11-04 con 0 descargas y 0 likes; no hay evidencia de soporte activo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/huggingface-mic/gte-reranker-modernbert-base-mic
- Modelo base: https://huggingface.co/Alibaba-NLP/gte-reranker-modernbert-base
- Manifiesto de contrato: `integration.json` (en el repositorio)
- Uso con Sentence Transformers: `integrations/sentence_transformers/usage.md` (en el repositorio)
- Expectativas del framework: `integrations/sentence_transformers/expectations` (en el repositorio)
- Procedencia del fixture: `build.json` (en el repositorio)
- Documentacion del proceso de shrink: https://huggingface-mic-mic-coverage.static.hf.space/shrink/gte-reranker-modernbert-base-mic.html
