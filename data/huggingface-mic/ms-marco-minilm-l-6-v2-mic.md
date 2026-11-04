# huggingface-mic/ms-marco-MiniLM-L-6-v2-mic

## Resumen

`ms-marco-MiniLM-L-6-v2-mic` es un artefacto de prueba publicado por la organizacion `huggingface-mic` a partir del cross-encoder `cross-encoder/ms-marco-MiniLM-L6-v2`. No es un modelo entrenado para produccion: la propia model card lo describe como un "fixture" reducido ("shrunk pipeline") cuyos pesos estan sobreajustados y no representan la calidad de recuperacion del modelo original. Su unico proposito declarado es servir como contrato ejecutable de integracion, es decir, un repositorio que empaqueta pesos minimos, ejemplos de uso y expectativas de framework para validar tooling de Sentence Transformers.

Tecnicamente es un transformer tipo BERT de 6 capas con 2.057.601 parametros reales en safetensors, muy por debajo de los aproximadamente 22,7 millones del MiniLM-L-6 original. La reduccion drastica de pesos confirma que se trata de un recorte artificial, no de una destilacion funcional. El repositorio incluye un manifiesto de contrato (`integration.json`), documentacion de uso para Sentence Transformers y metadatos de procedencia del fixture (`build.json`).

Su relevancia es, por tanto, exclusivamente de ingenieria: resulta util para probar pipelines de carga, validacion de contratos y CI de librerias, nunca para tareas reales de re-ranking o busqueda semantica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (MiniLM-L-6, transformer encoder) |
| Parametros totales | 2.057.601 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Libreria | sentence-transformers |
| Modelo base | cross-encoder/ms-marco-MiniLM-L6-v2 |
| Tipo de tarea | cross-encoder (re-ranking) |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-11-04 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del cross-encoder `ms-marco-MiniLM-L6-v2`, un transformer encoder BERT de 6 capas y 384 dimensiones ocultas entrenado originalmente para re-ranking sobre el dataset MS MARCO. En este repositorio, sin embargo, los pesos han sido reducidos ("shrunk") hasta los 2.057.601 parametros, lo que implica una poda severa respecto al modelo fuente.

No se ha realizado entrenamiento adicional con proposito de calidad: la model card indica explicitamente que los pesos estan sobreajustados ("overfit") al fixture y no reflejan la capacidad de recuperacion del modelo original. No hay informacion disponible sobre volumen de tokens de entrenamiento, composicion del dataset, ni tecnicas de RLHF/DPO en este artefacto. La innovacion tecnica, si cabe llamarla asi, es el empaquetado del contrato de integracion (`integration.json`) junto con los pesos y las expectativas del framework.

## Capacidades

- Carga y ejecucion como `CrossEncoder` dentro de Sentence Transformers, segun el contrato documentado en `integrations/sentence_transformers/usage.md`.
- Puntuacion de pares consulta-documento con la firma de API esperada por el framework (uso de validacion, no de calidad).
- Servir como fixture reproducible para tests de integracion y CI de librerias que consumen cross-encoders.
- Verificacion de expectativas de framework recogidas en `integrations/sentence_transformers/expectations`.
- No dispone de capacidades generativas, tool calling, agentes, vision ni audio.
- Capacidades multilingues: no disponibles; el modelo base esta orientado a ingles.
- Calidad de recuperacion: nula a efectos practicos, segun advierte el propio autor.

## Casos de uso

- Tests de integracion en CI: cargar el modelo con Sentence Transformers y comprobar que la API `CrossEncoder.predict` devuelve la forma esperada, usando el manifiesto `integration.json` como contrato verificable.
- Validacion de pipelines de empaquetado: comprobar que herramientas de conversion, serializacion o empaquetado manejan correctamente un repositorio con safetensors y metadatos de fixture.
- Pruebas de regresion de frameworks: verificar que una nueva version de Sentence Transformers sigue respetando las expectativas documentadas en `integrations/sentence_transformers/expectations`.
- Desarrollo de tooling de Hugging Face Hub: probar flujos de descarga, cache y resolucion de `base_model` sin consumir ancho de banda con pesos grandes (repo de 0.0 GB).
- Docencia y demos de arquitectura: ilustrar la estructura de un cross-encoder BERT minimo sin necesidad de GPU ni de pesos de decenas de megabytes.
- Reproducibilidad de fixtures: regenerar el artefacto siguiendo la documentacion de "shrink" enlazada y comparar con `build.json` para auditar el proceso de reduccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card advierte que los pesos estan sobreajustados y no representan la calidad de recuperacion del modelo fuente, por lo que cualquier metrica de re-ranking sobre este artefacto careceria de validez.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en fp32 (2,06 M de parametros, unos 8 MB de pesos); cabe en CPU sin problema.
- GPU recomendadas: ninguna en particular; cualquier GPU consumer (incluso integradas) es suficiente. No requiere A100 ni H100.
- Cabe en cualquier GPU consumer y en entornos sin GPU.
- Opciones de despliegue: Sentence Transformers (via declarada); otras opciones como vLLM, llama.cpp, Ollama o TGI no estan documentadas para este artefacto y no aplican a un cross-encoder de este tamano.
- Latencia y throughput: no disponibles; al tratarse de un fixture sobreajustado, las mediciones no serian representativas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ms-marco-MiniLM-L-6-v2-mic | 2.057.601 | no disponible | Fixture de cross-encoder | no disponible | Hugging Face (0 descargas) |
| cross-encoder/ms-marco-MiniLM-L6-v2 | no disponible en la informacion | no disponible | Re-ranking | no disponible en la informacion | Hugging Face (modelo fuente) |
| Otros cross-encoders MiniLM de la familia MS MARCO | no disponible | no disponible | Re-ranking | no disponible | Hugging Face |

La comparacion relevante es unicamente con su modelo base: el artefacto `-mic` es una version reducida y sobreajustada del cross-encoder original, sin valor para recuperacion real.

## Limitaciones y advertencias

- Los pesos estan sobreajustados y no representan la calidad de recuperacion del modelo fuente; no deben usarse en produccion.
- Es un artefacto de prueba ("test-artifact") segun sus propios tags; su uso previsto es validacion de integraciones.
- Licencia no disponible: no puede asumirse permiso de uso comercial.
- Idiomas no disponibles; el modelo base esta orientado a ingles.
- Longitud de contexto no disponible en la informacion proporcionada.
- Riesgo de alucinacion no aplicable (no es un modelo generativo), pero si de resultados sin sentido si se usa para puntuar pares reales.
- Sesgos: no documentados; al derivar de MS MARCO heredaria los sesgos del corpus original, aunque el recorte de pesos los hace impredecibles.
- Sin descargas ni likes: no hay evidencia de uso comunitario ni de validacion externa.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingface-mic/ms-marco-MiniLM-L-6-v2-mic
- Modelo base: https://huggingface.co/cross-encoder/ms-marco-MiniLM-L6-v2
- Documentacion del proceso de reduccion: https://huggingface-mic-mic-coverage.static.hf.space/shrink/ms-marco-MiniLM-L-6-v2-mic.html
- Manifiesto de contrato: `integration.json` (en el repositorio)
- Uso con Sentence Transformers: `integrations/sentence_transformers/usage.md` (en el repositorio)
- Expectativas del framework: `integrations/sentence_transformers/expectations` (en el repositorio)
- Procedencia del fixture: `build.json` (en el repositorio)
