# huggingface-mic/splade-v3-distilbert-mic

## Resumen

`splade-v3-distilbert-mic` es un artefacto de prueba (fixture) publicado por el usuario `huggingface-mic` en HuggingFace, derivado del modelo `naver/splade-v3-distilbert`. No se trata de un modelo funcional destinado a producción, sino de una versión "slim" (reducida) de los pesos y del pipeline de Sentence Transformers, empaquetada junto con manifiestos de contrato, expectativas de framework y procedencia de la fixture. La model card indica explícitamente que los pesos son aleatorios y no representan la calidad de recuperación del modelo fuente.

El modelo base, `naver/splade-v3-distilbert`, es un modelo SPLADE (Sparse Lexical and Expansion) basado en DistilBERT, utilizado para recuperación de información mediante representaciones dispersas aprendidas. SPLADE combina la eficiencia de los índices invertidos tradicionales con la capacidad semántica de los transformers, generando vectores dispersos de alta dimensionalidad que expanden términos de consulta y documento.

Este artefacto concreto tiene 2.088.058 parámetros reales según los safetensors, un tamaño de repositorio de 0.0 GB y cero descargas, lo que confirma su naturaleza de fixture de integración más que de modelo publicable. Su relevancia es exclusivamente para testing de integraciones con Sentence Transformers y para validar contratos de pipeline, no para tareas de recuperación reales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DistilBERT (transformer encoder) con cabeza SPLADE para representaciones dispersas |
| Parametros totales | 2.088.058 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Libreria | sentence-transformers |
| Modelo base | naver/splade-v3-distilbert |
| Tamano del repositorio | 0.0 GB |
| Descargas | 0 |
| Likes | 0 |

## Arquitectura y entrenamiento

El modelo base `naver/splade-v3-distilbert` emplea una arquitectura SPLADE sobre un encoder DistilBERT. SPLADE produce representaciones dispersas mediante una cabeza que proyecta los estados ocultos del transformer al vocabulario, aplicando una transformación log-saturada y max-pooling para generar pesos de término no negativos. Esto permite indexar los documentos en estructuras invertidas estándar, combinando la eficiencia de recuperación léxica con la expansión semántica aprendida.

Sin embargo, el artefacto `splade-v3-distilbert-mic` no contiene los pesos entrenados del modelo fuente. La model card declara explícitamente que los pesos son aleatorios ("Its weights are random and do not represent the source model's retrieval quality"). Se trata de una fixture reducida generada mediante un proceso de "shrink" documentado en un enlace externo, cuyo propósito es proporcionar un pipeline ejecutable con expectativas de framework definidas para pruebas de integración. No hay información disponible sobre datos de entrenamiento, número de tokens, composición del dataset ni técnicas de alineación como RLHF o DPO para este artefacto concreto.

## Capacidades

- Generación de representaciones dispersas (sparse embeddings) compatibles con la interfaz `SparseEncoder` de Sentence Transformers, siempre que se use con pesos válidos del modelo fuente.
- Ejecución como fixture de integración para validar contratos de pipeline, manifiestos de expectativas y procedencia de artefactos.
- No dispone de capacidades funcionales de recuperación reales, ya que sus pesos son aleatorios.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-step.
- No se declaran capacidades multilingües para este artefacto.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Validación de integraciones con Sentence Transformers: el artefacto sirve para comprobar que el pipeline `SparseEncoder` se carga y ejecuta correctamente en entornos de CI, usando los manifiestos `integration.json` y las expectativas de framework incluidas en el repositorio.
- Testing de contratos de pipeline: permite verificar que las herramientas de serialización, carga de safetensors y resolución de dependencias funcionan con un modelo reducido antes de desplegar el modelo real.
- Pruebas de regresión en infraestructura de serving: al ser un repositorio de 0.0 GB, se puede usar en tests automatizados que necesitan un modelo mínimo sin coste de almacenamiento ni de descarga.
- Desarrollo de utilidades de inspección de modelos: sirve para validar scripts que leen metadatos, cuentan parámetros o verifican la estructura de safetensors sin cargar un modelo grande.
- Documentación de procedencia de fixtures: el archivo `build.json` y el enlace de "shrink" permiten auditar cómo se generó el artefacto, útil en pipelines de reproducibilidad.
- Formación y demos de integración: permite mostrar el flujo de trabajo de Sentence Transformers con un modelo pequeño y rápido de cargar en entornos con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que los pesos son aleatorios y no representan la calidad de recuperación del modelo fuente, por lo que cualquier métrica de retrieval (MRR, nDCG, Recall) sería inválida para este artefacto.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32, dado el tamaño de 2.088.058 parámetros (aproximadamente 8 MB de pesos).
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM; el artefacto cabe en GPUs integradas y en CPU.
- Cabe en cualquier GPU de consumo (GTX 1050, RTX 3060, RTX 4090) y en entornos sin GPU.
- Opciones de despliegue: Sentence Transformers (librería declarada), con posibilidad de carga vía `transformers` y `safetensors`. No se ha validado vLLM, llama.cpp, Ollama ni TGI para este artefacto.
- Latencia y throughput: no disponibles; al tratarse de una fixture con pesos aleatorios, las mediciones no serían representativas del modelo fuente.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| splade-v3-distilbert-mic | 2.088.058 | no disponible | Fixture SPLADE (pesos aleatorios) | no disponible | HuggingFace, 0 descargas |
| naver/splade-v3-distilbert | no disponible en la informacion | no disponible | SPLADE sobre DistilBERT | no disponible | HuggingFace (modelo fuente) |
| SPLADE-v3 (ensemble) | no disponible en la informacion | no disponible | SPLADE | no disponible | HuggingFace |
| DistilBERT base | ~66M | 512 tokens (tipico) | Transformer encoder | Apache 2.0 (tipico) | HuggingFace |

La comparación relevante es con el modelo fuente `naver/splade-v3-distilbert`, del cual este artefacto es una versión reducida con pesos aleatorios. No se dispone de datos de benchmarks ni de licencia para establecer una comparación cuantitativa rigurosa.

## Limitaciones y advertencias

- Los pesos son aleatorios: el modelo no produce representaciones útiles para recuperación de información. No debe usarse en producción.
- La model card advierte explícitamente de que no representa la calidad de retrieval del modelo fuente.
- Sesgos conocidos: no disponibles para este artefacto; los sesgos del modelo fuente no se heredan porque los pesos no son los originales.
- Riesgo de alucinación: no aplica en el sentido generativo, pero cualquier resultado de retrieval sería ruido aleatorio.
- Limitaciones de contexto e idioma: no disponibles.
- Restricciones de licencia: la licencia no está declarada, lo que impide asumir permisos de uso comercial. Es necesario consultar el repositorio del modelo base para conocer las condiciones.
- Caveat para producción: al ser un artefacto de test con 0 descargas y 0 likes, no hay evidencia de uso en entornos reales ni de mantenimiento por parte del autor.
- El repositorio depende de enlaces externos (manifiesto, expectativas, procedencia) alojados en un espacio estático de HuggingFace, lo que puede afectar a la reproducibilidad a largo plazo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/huggingface-mic/splade-v3-distilbert-mic
- Modelo base: https://huggingface.co/naver/splade-v3-distilbert
- Manifiesto de contrato: https://huggingface.co/huggingface-mic/splade-v3-distilbert-mic/blob/main/integration.json
- Uso con Sentence Transformers: https://huggingface.co/huggingface-mic/splade-v3-distilbert-mic/blob/main/integrations/sentence_transformers/usage.md
- Expectativas de Sentence Transformers: https://huggingface.co/huggingface-mic/splade-v3-distilbert-mic/tree/main/integrations/sentence_transformers/expectations
- Procedencia de la fixture: https://huggingface.co/huggingface-mic/splade-v3-distilbert-mic/blob/main/build.json
- Documentación del proceso de reducción: https://huggingface-mic-mic-coverage.static.hf.space/shrink/splade-v3-distilbert-mic.html
