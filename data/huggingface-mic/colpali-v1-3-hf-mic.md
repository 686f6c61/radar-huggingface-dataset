# huggingface-mic/colpali-v1-3-hf-mic

## Resumen

`huggingface-mic/colpali-v1-3-hf-mic` es un artefacto de prueba (fixture) derivado de `vidore/colpali-v1.3-hf`, el modelo ColPali de recuperación visual de documentos desarrollado por el equipo VIdORe (ILLS, Université Grenoble Alpes y colaboradores). No se trata de un modelo funcional para producción: la propia model card indica que los pesos son aleatorios y no representan la calidad de recuperación del modelo original. Su propósito es servir como fixture ejecutable para validar integraciones de frameworks, en este caso Sentence Transformers, con un pipeline "slim" (reducido) que mantiene la estructura del modelo base pero con pesos no entrenados.

El modelo base, ColPali, es un sistema de recuperación multi-vector que combina un modelo de lenguaje visual (basado en PaliGemma-3B en su versión original) con la estrategia de late interaction de ColBERT para indexar y recuperar páginas de documentos como imágenes, sin necesidad de OCR. Este derivado concreto, sin embargo, solo conserva la interfaz de `MultiVectorEncoder` y un conjunto de pesos de 16,7 millones de parámetros, muy inferior al modelo original, lo que confirma su naturaleza de fixture y no de modelo utilizable.

Su relevancia es exclusivamente técnica y de infraestructura: permite a los equipos de la plataforma Hugging Face y a desarrolladores de integraciones probar contratos de API, expectativas de framework y flujos de carga/ejecución sin descargar el modelo completo. No debe emplearse para tareas reales de recuperación, generación ni evaluación de calidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MultiVectorEncoder (derivado de ColPali, late interaction sobre embeddings visuales) |
| Parámetros totales | 16.714.560 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Modelo base | vidore/colpali-v1.3-hf |
| Librería | sentence-transformers |
| Tamaño del repositorio | 0.1 GB |
| Pipeline | no disponible |

## Arquitectura y entrenamiento

El modelo base `vidore/colpali-v1.3-hf` emplea una arquitectura ColPali: un modelo de lenguaje visual (PaliGemma en la versión original, con un encoder SigLIP y un decoder Gemma) que genera embeddings multi-vector por página de documento, siguiendo el paradigma de late interaction de ColBERT. Cada página se representa como una secuencia de embeddings de parches visuales, y la similitud se calcula mediante MaxSim entre los tokens de la consulta y los de la página. Este enfoque elimina la necesidad de OCR y pipelines de extracción de texto.

El artefacto `colpali-v1-3-hf-mic`, en cambio, no ha sido entrenado: sus pesos son aleatorios, según declara explícitamente la model card. Se ha generado mediante un proceso de "shrink" documentado en un enlace externo, que reduce el pipeline original a un fixture ejecutable de 16,7 millones de parámetros. No hay información disponible sobre datos de entrenamiento, número de tokens, composición del dataset ni técnicas de alineación (RLHF/DPO) para este derivado, y la model card no reproduce los detalles del modelo base.

## Capacidades

- Ninguna capacidad funcional real: los pesos son aleatorios y no producen recuperación ni representaciones útiles.
- Interfaz de `MultiVectorEncoder` compatible con Sentence Transformers, útil para probar contratos de integración.
- Estructura de pipeline multi-vector preservada (formato de salida de embeddings por parche), apta para tests de forma y tipos.
- No soporta tool calling, function calling ni razonamiento multi-paso de forma útil.
- No hay capacidades multilingües verificables.
- No dispone de modo thinking, visión funcional ni audio en este artefacto.

## Casos de uso

- Pruebas de integración de Sentence Transformers: validar que el cargador de modelos, la tokenización y la salida multi-vector funcionan con la interfaz de ColPali sin descargar el modelo completo de 3B.
- CI/CD de frameworks: ejecutar tests de regresión de API y de serialización de embeddings en pipelines automatizados con un artefacto ligero de 0,1 GB.
- Desarrollo de contratos de modelo: comprobar que un `integration.json` y un directorio de expectativas se cumplen antes de publicar un modelo real.
- Validación de esquemas de salida: verificar formas de tensores, dimensiones de embeddings y tipos de datos en el pipeline de recuperación visual.
- Formación y documentación: ejemplos ejecutables en tutoriales sobre ColPali y late interaction sin coste de descarga ni GPU.
- Reproducción de fixtures: comparar el comportamiento de distintas versiones de frameworks frente a un artefacto estable y determinista en su estructura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card advierte explícitamente que los pesos son aleatorios y no representan la calidad de recuperación del modelo fuente, por lo que cualquier métrica de recuperación (nDCG, Recall@k, MRR) sería inválida.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para los 16,7 M de parámetros; cabe en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: no aplica para uso real; cualquier GPU (incluso integrada) basta para ejecutar el fixture.
- Cabe en GPU consumer: sí, en todas (GTX 1050, RTX 3060, RTX 4090, etc.) y en CPU.
- Opciones de despliegue: Sentence Transformers (librería declarada); otras opciones como vLLM, llama.cpp, Ollama o TGI no están documentadas para este artefacto.
- Latencia y throughput: no disponibles; al ser un fixture de pesos aleatorios, las mediciones no serían representativas del modelo base.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Uso previsto |
|---|---|---|---|---|---|
| huggingface-mic/colpali-v1-3-hf-mic | 16,7 M | no disponible | no disponible | Hugging Face | Fixture de test |
| vidore/colpali-v1.3-hf | ~3B (PaliGemma) | no disponible en la información | no disponible en la información | Hugging Face | Recuperación visual de documentos |
| vidore/colpali-v1.2 | ~3B (PaliGemma) | no disponible en la información | no disponible en la información | Hugging Face | Recuperación visual de documentos |
| vidore/colqwen2-v1.0 | ~2B (Qwen2-VL) | no disponible en la información | no disponible en la información | Hugging Face | Recuperación visual multi-vector |

La comparación relevante es frente al modelo base: este derivado no compite en calidad de recuperación, solo en ligereza y propósito de test. Los datos de licencia, contexto y parámetros exactos de los modelos comparables no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- Pesos aleatorios: no aptos para inferencia real, recuperación, generación ni evaluación de calidad.
- No usar en producción: la model card lo etiqueta como `test-artifact` y advierte de su naturaleza no funcional.
- Licencia no disponible: no se puede verificar si el uso comercial está permitido; además, la licencia del modelo base puede imponer restricciones adicionales.
- Idiomas no declarados: no hay garantía de soporte multilingüe.
- Contexto no documentado: no se puede planificar el tamaño de página o consulta admitido.
- Riesgo de confusión: el nombre puede llevar a error si se confunde con el ColPali original; verificar siempre el ID completo.
- Sin benchmarks: cualquier comparación numérica con el modelo base sería engañosa.
- Dependencia del modelo base: los contratos y expectativas documentados solo son válidos para la versión `vidore/colpali-v1.3-hf` referenciada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/huggingface-mic/colpali-v1-3-hf-mic
- Modelo base: https://huggingface.co/vidore/colpali-v1.3-hf
- Manifiesto de contrato (integration.json): https://huggingface.co/huggingface-mic/colpali-v1-3-hf-mic/blob/main/integration.json
- Uso con Sentence Transformers: https://huggingface.co/huggingface-mic/colpali-v1-3-hf-mic/blob/main/integrations/sentence_transformers/usage.md
- Expectativas de Sentence Transformers: https://huggingface.co/huggingface-mic/colpali-v1-3-hf-mic/tree/main/integrations/sentence_transformers/expectations
- Procedencia del fixture (build.json): https://huggingface.co/huggingface-mic/colpali-v1-3-hf-mic/blob/main/build.json
- Documentación del proceso de shrink: https://huggingface-mic-mic-coverage.static.hf.space/shrink/colpali-v1-3-hf-mic.html
