# cookieshake/DNA3.1-27B-oQ8

## Resumen

DNA3.1-27B-oQ8 es una cuantización de 8 bits del modelo `dnotitia/DNA3.1-27B`, publicada por el usuario `cookieshake` en Hugging Face. No se trata de un modelo original, sino de una conversión derivada: el autor tomó una instantánea BF16 concreta del modelo base (revisión `aee853444ef2d1d1fe2fa56e4c2073d8f393b139`) y la transformó con la herramienta oMLX 0.7.3 al formato MLX, pensado para ejecutarse en Apple Silicon. El resultado es un artefacto de aproximadamente 29,5 GB con 27.356.728.560 parámetros, empaquetado en seis shards de safetensors y con cuantización afín de grupo 64 a 8 bits.

La relevancia de esta ficha es doble. Por un lado, permite ejecutar un modelo de 27B en hardware Apple con un peso efectivo de unos 8,63 bits por parámetro, lo que reduce el consumo de memoria frente al BF16 original. Por otro, es un ejemplo de la cadena de derivados que se está formando alrededor de los modelos coreanos: el modelo base pertenece a la familia DNA de dnotitia y está etiquetado como `qwen3_5` en los tags del repositorio, lo que sugiere una arquitectura basada en Qwen 3.5, aunque esta información no se detalla en la model card.

Conviene subrayar que la información pública disponible es muy limitada. La model card del derivado no documenta arquitectura, datos de entrenamiento, benchmarks ni idiomas soportados más allá de la etiqueta `korean`. Esta ficha refleja exclusivamente lo que consta en los metadatos del repositorio y en la model card citada, e indica de forma explícita "no disponible" cuando el dato no aparece.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (tag `qwen3_5`; presumiblemente transformer, sin confirmar) |
| Parámetros totales | 27.356.728.560 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | 8 bits afín (affine), group size 64, `oq_level=8`, `enhanced=false`; precisión efectiva ≈8,6271 bits por parámetro |
| Idiomas soportados | no disponible (etiqueta `korean` en los tags) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (6 shards, 2.180 entradas en el índice), compatible con MLX |

## Arquitectura y entrenamiento

El repositorio no documenta la arquitectura del modelo base. Los tags incluyen `qwen3_5`, lo que apunta a que `dnotitia/DNA3.1-27B` se construye sobre la familia Qwen 3.5, pero no hay confirmación explícita ni detalles sobre número de capas, dimensión oculta, mecanismo de atención o si emplea atención lineal o decodificación especulativa. Tampoco se especifican los datos de entrenamiento: número de tokens, composición del corpus, uso de RLHF, DPO u otras técnicas de alineación. Todo ello queda como "no disponible".

Lo que sí está documentado es el proceso de cuantización. El autor partió de la instantánea BF16 fijada en la revisión indicada y aplicó el conversor oMLX 0.7.3 en modo estándar oQ, con `oq_level=8`, `group_size=64`, cuantización afín y sin overrides de precisión mixta. La validación consistió en comprobar que los seis shards están presentes, que las claves de safetensors coinciden con el índice y que el config declara `bits=8` y `group_size=64`. Además, se ejecutaron dos pruebas de humo tras reiniciar un servidor oMLX aislado: una pregunta en coreano sobre la capital del país con una operación aritmética devolvió `서울, 5`, y una instrucción de reproducir una cadena devolvió `oQ8_LOCAL_OK`. El autor advierte que estas comprobaciones no constituyen una evaluación amplia de calidad.

## Capacidades

- Generación de texto en coreano: la model card incluye pruebas de humo en este idioma y el tag `korean` aparece de forma explícita.
- Razonamiento aritmético básico: la prueba de humo combina una pregunta factual (capital de Corea del Sur) con una operación numérica, y el modelo responde con el formato solicitado.
- Seguimiento de instrucciones de formato: la segunda prueba exige reproducir literalmente una cadena, y el modelo la devuelve exactamente.
- Ejecución en Apple Silicon mediante MLX: el formato de pesos y la librería `omlx` están orientados a este runtime.
- Capacidades adicionales (código, matemáticas avanzadas, tool calling, agentes, visión, audio, modo thinking): no disponible en la información proporcionada.

## Casos de uso

- Prototipado local en Mac: un desarrollador con un Mac de memoria unificada alta puede cargar el modelo con MLX y probar prompts en coreano sin depender de la nube, gracias a la cuantización de 8 bits y al formato nativo de Apple Silicon.
- Evaluación de derivados cuantizados: sirve para comparar la calidad del modelo base BF16 frente a la versión oQ8 en tareas coreanas concretas, verificando si la cuantización introduce degradación apreciable.
- Procesamiento de texto en coreano en entornos con requisitos de privacidad: al ejecutarse en local, los datos no salen del equipo, lo que encaja en flujos donde no se permite enviar contenido a APIs externas.
- Generación de respuestas con formato estricto: la prueba de humo sugiere que el modelo respeta instrucciones de salida literal, útil para plantillas de extracción o normalización de cadenas.
- Base para experimentos de ajuste fino ligero: al estar en safetensors y con licencia Apache-2.0, se puede partir de estos pesos para adaptaciones posteriores, siempre que el runtime lo permita.
- Docencia e investigación sobre cuantización: el repositorio documenta con precisión el método (oMLX 0.7.3, group size 64, bits efectivos), lo que lo convierte en un caso reproducible para estudiar el impacto de la cuantización afín en modelos de 27B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo reporta dos pruebas de humo cualitativas y advierte explícitamente que no constituyen una evaluación amplia de calidad.

## Requisitos de hardware

- VRAM/memoria unificada estimada: el repo ocupa 29,5 GB; se necesita al menos esa cantidad de memoria disponible para cargar los pesos, más margen para el contexto y el runtime.
- Runtime obligatorio: MLX sobre Apple Silicon; el autor indica que los archivos son compatibles con MLX y requieren un runtime MLX de Apple.
- GPU recomendadas: no disponible para CUDA; el artefacto está pensado para chips Apple (M-series) con memoria unificada suficiente.
- ¿Cabe en GPU de consumo? No hay datos que lo confirmen; el formato MLX no está orientado a GPUs NVIDIA de consumo.
- Opciones de despliegue: servidor oMLX (el autor menciona un servidor oMLX aislado y una Admin API `POST /admin/api/oq/start` para reproducir la conversión). No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cookieshake/DNA3.1-27B-oQ8 | 27.356.728.560 | no disponible | safetensors MLX (8 bits) | Apache-2.0 | Hugging Face, 28 descargas |
| dnotitia/DNA3.1-27B (base) | 27.356.728.560 | no disponible | BF16 (según instantánea citada) | Apache-2.0 | Hugging Face |
| Alternativas de 27B comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otros derivados cuantizados del mismo modelo base ni sobre modelos de tamaño y tarea equivalentes con los que establecer una comparación rigurosa.

## Limitaciones y advertencias

- La model card no documenta arquitectura, contexto, idiomas ni datos de entrenamiento; cualquier uso en producción exige una evaluación propia previa.
- Las únicas validaciones reportadas son dos pruebas de humo en coreano; no hay evidencia de calidad en otros idiomas ni en tareas complejas.
- El artefacto está atado a MLX y Apple Silicon; no es directamente utilizable en stacks CUDA habituales.
- La cuantización a 8 bits puede introducir degradación respecto al BF16 original; el autor no cuantifica esa pérdida.
- Riesgo de alucinación y sesgos: no evaluado en la información disponible.
- La licencia Apache-2.0 del derivado se declara a partir de la del repositorio fuente en la revisión fijada; conviene verificar la licencia del modelo base antes de un uso comercial.
- El autor advierte que diferencias de hardware o runtime pueden afectar a la reproducibilidad bit a bit.
- El repositorio tiene muy poca tracción (28 descargas, 0 likes) y fue creado y actualizado el mismo día, lo que reduce la confianza en su madurez.

## Enlaces

- Repositorio del derivado: https://huggingface.co/cookieshake/DNA3.1-27B-oQ8
- Modelo base: https://huggingface.co/dnotitia/DNA3.1-27B
- Instantánea fuente fijada: https://huggingface.co/dnotitia/DNA3.1-27B/tree/aee853444ef2d1d1fe2fa56e4c2073d8f393b139
