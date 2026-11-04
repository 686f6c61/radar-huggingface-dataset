# huggingface-mic/all-mpnet-base-v2-mic

## Resumen

`all-mpnet-base-v2-mic` es un artefacto de prueba (fixture) publicado por la organizacion `huggingface-mic` en HuggingFace. No es un modelo entrenado para producir embeddings utiles: se trata de una version reducida (slim) del conocido modelo de embeddings `sentence-transformers/all-mpnet-base-v2`, con pesos aleatorios y un pipeline recortado, disenada para validar contratos de integracion con Sentence Transformers. La model card indica explicitamente que sus pesos son aleatorios y que no representan la calidad de recuperacion del modelo original.

El repositorio contiene, ademas de los pesos reducidos, un manifiesto de contrato (`integration.json`), documentacion de uso y expectativas del framework (`integrations/sentence_transformers/`), y metadatos de procedencia de la fixture (`build.json`). El objetivo es servir como banco de pruebas reproducible para herramientas que consumen modelos de Sentence Transformers, no para inferencia en produccion.

Los pesos ocupan apenas 2.057.984 parametros (frente a los aproximadamente 109 millones del `all-mpnet-base-v2` original), lo que confirma que se trata de una miniaturizacion artificial con fines de test. No hay informacion publicada sobre licencia, idiomas ni pipeline en la ficha de HuggingFace.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MPNet (transformer encoder), version reducida para fixture |
| Parametros totales | 2.057.984 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Libreria | sentence-transformers |
| Modelo base | sentence-transformers/all-mpnet-base-v2 |
| Tamano del repo | 0.0 GB |
| Descargas | 0 |
| Likes | 0 |

## Arquitectura y entrenamiento

El modelo base `sentence-transformers/all-mpnet-base-v2` emplea la arquitectura MPNet, un transformer encoder que combina elementos de enmascaramiento de BERT y MLM permutado de XLNet, y se entrena con objetivos de similitud contrastiva para generar embeddings de frases. Sin embargo, esta variante `-mic` no ha sido entrenada: la model card especifica que los pesos son aleatorios y que el pipeline ha sido recortado ("shrunk") respecto al original.

No se dispone de informacion sobre datos de entrenamiento, numero de tokens, composicion del dataset ni tecnicas de alineacion (RLHF, DPO) para esta fixture, porque no existe entrenamiento real. La innovacion tecnica del repositorio es de ingenieria de integracion: empaquetar pesos minimos, manifiesto de contrato y expectativas de framework en un unico artefacto verificable.

## Capacidades

- No genera embeddings semanticos utiles: los pesos son aleatorios y la model card lo advierte explicitamente.
- Sirve como fixture ejecutable para probar la carga de modelos en Sentence Transformers.
- Permite validar el contrato de integracion definido en `integration.json`.
- Permite comprobar el comportamiento esperado del framework contra el directorio `integrations/sentence_transformers/expectations`.
- No soporta tool calling, agentes, razonamiento multi-paso ni generacion de texto.
- No se documentan capacidades multilingues ni modos especiales (thinking, vision, audio).

## Casos de uso

- Pruebas de integracion en CI/CD: cargar el modelo con Sentence Transformers y verificar que la API de embeddings responde con la forma y el tipo esperados, usando los pesos minimos para acelerar los tests.
- Validacion de contratos de modelo: comprobar que una herramienta interna cumple las expectativas declaradas en `integrations/sentence_transformers/expectations` antes de desplegar con el modelo real.
- Desarrollo de pipelines de embeddings sin GPU: al tener solo ~2 millones de parametros, se puede ejecutar en CPU en entornos de desarrollo y en contenedores ligeros.
- Reproducibilidad de fixtures: usar `build.json` y el enlace de procedencia para auditar como se genero la version reducida y replicar el proceso con otros modelos.
- Formacion y demos: mostrar el flujo de carga de un modelo de Sentence Transformers en tutoriales sin depender de descargas grandes ni de recursos de computo.
- Pruebas de regresion de serializacion: verificar que el formato safetensors y los metadatos del repositorio se leen correctamente tras cambios en la libreria o en el entorno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card advierte que los pesos son aleatorios, por lo que cualquier metrica de recuperacion o similitud careceria de significado.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para los ~2 millones de parametros; cabe en cualquier GPU consumer y en CPU.
- GPU recomendadas: no se requiere GPU; cualquier RTX o integrada es suficiente. Para el modelo original del que deriva se recomienda al menos una GPU con 4-8 GB.
- Cabe en GPU consumer: si, en todas las gamas actuales.
- Opciones de despliegue: Sentence Transformers (libreria nativa), y potencialmente llama.cpp u Ollama no aplican porque no es un modelo generativo.
- Latencia y throughput: no disponibles; al ser una fixture de test, no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| all-mpnet-base-v2-mic | 2.057.984 | no disponible | Fixture de test | no disponible | HuggingFace |
| sentence-transformers/all-mpnet-base-v2 | ~109 M | 384 tokens (tipico) | Embeddings de frases | Apache 2.0 (segun el original) | HuggingFace |
| sentence-transformers/all-MiniLM-L6-v2 | ~22,7 M | 256 tokens (tipico) | Embeddings ligeros | Apache 2.0 (segun el original) | HuggingFace |
| BAAI/bge-base-en-v1.5 | ~109 M | 512 tokens | Embeddings de retrieval | MIT (segun el original) | HuggingFace |

La comparativa con el modelo base y alternativas se ofrece como referencia del ecosistema; los datos de licencia y contexto de los modelos comparables no provienen de la informacion proporcionada en esta ficha y deben verificarse en sus respectivas model cards.

## Limitaciones y advertencias

- Los pesos son aleatorios: no usar para retrieval, similitud semantica ni ninguna tarea de produccion.
- La model card advierte explicitamente de que no representa la calidad del modelo original.
- No hay informacion de licencia publicada, lo que impide confirmar condiciones de uso comercial.
- No se documentan idiomas soportados ni sesgos conocidos.
- El pipeline esta recortado y puede no cubrir todas las rutas de codigo del modelo original.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que no ha sido validado por la comunidad.
- No es un modelo generativo: no soporta chat, tool calling ni agentes.

## Enlaces

- HuggingFace: https://huggingface.co/huggingface-mic/all-mpnet-base-v2-mic
- Modelo base: https://huggingface.co/sentence-transformers/all-mpnet-base-v2
- Manifiesto de contrato: https://huggingface.co/huggingface-mic/all-mpnet-base-v2-mic/blob/main/integration.json
- Uso con Sentence Transformers: https://huggingface.co/huggingface-mic/all-mpnet-base-v2-mic/blob/main/integrations/sentence_transformers/usage.md
- Expectativas del framework: https://huggingface.co/huggingface-mic/all-mpnet-base-v2-mic/tree/main/integrations/sentence_transformers/expectations
- Procedencia de la fixture: https://huggingface.co/huggingface-mic/all-mpnet-base-v2-mic/blob/main/build.json
- Proceso de reduccion: https://huggingface-mic-mic-coverage.static.hf.space/shrink/all-mpnet-base-v2-mic.html
