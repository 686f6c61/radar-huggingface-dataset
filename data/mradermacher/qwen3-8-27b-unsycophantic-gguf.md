# mradermacher/Qwen3.8-27B-unsycophantic-GGUF

## Resumen

Qwen3.8-27B-unsycophantic-GGUF es una compilación de cuantizaciones estáticas en formato GGUF del modelo jbowman512/Qwen3.8-27B-unsycophantic, publicada por el usuario mradermacher, conocido en Hugging Face por producir versiones cuantizadas de modelos abiertos listas para inferencia local. El modelo subyacente es un transformer denso de 27.320.697.856 parámetros (aproximadamente 27,3 mil millones), derivado de la familia Qwen3.8 y ajustado específicamente para reducir el comportamiento sicofántico (no-sycophancy) y, según las etiquetas del autor, con rasgos de "heretic" y reproducibilidad.

La relevancia de esta ficha radica en que ofrece una vía práctica para ejecutar un modelo de ~27B en hardware de consumo mediante cuantizaciones que van desde Q2_K (11,0 GB) hasta Q8_0 (29,1 GB), además de complementos multimodales (mmproj) que sugieren capacidades de visión. El repositorio incluye 11 cuantizaciones estáticas y dos archivos mmproj, con un tamaño total de repo de 190,8 GB.

No se dispone de información publicada sobre la longitud de contexto, la composición del dataset de entrenamiento ni resultados de benchmarks en la información proporcionada. La licencia es Apache 2.0, lo que facilita el uso comercial, y el idioma declarado es inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (según tags y base_model; detalles no disponibles) |
| Parametros totales | 27.320.697.856 (~27,3B) |
| Parametros activos | no disponible (no es MoE según los datos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; mmproj-Q8_0 y mmproj-f16 |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base jbowman512/Qwen3.8-27B-unsycophantic más allá de que se trata de un transformer denso de ~27,3B parámetros, con pesos en safetensors en su versión original y cuantizaciones GGUF en este repositorio. El nombre sugiere una variante de la familia Qwen3.8, pero no se confirman detalles de capas, atención ni activaciones.

El ajuste declarado se orienta a reducir la sicofancia (no-sycophancy), es decir, a evitar que el modelo valide o refuerce afirmaciones incorrectas del usuario. Las etiquetas "heretic" y "reproducible" indican que el autor del modelo base documenta el proceso de ajuste de forma reproducible. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF o DPO. Los archivos mmproj incluidos en el repositorio apuntan a capacidades multimodales (visión), aunque no se detalla su entrenamiento.

## Capacidades

- Generación de texto conversacional en inglés, con un ajuste explícito para reducir respuestas sicofánticas.
- Capacidades multimodales: la presencia de archivos mmproj-Q8_0 y mmproj-f16 sugiere soporte de entrada de imágenes, aunque no se documenta el alcance exacto.
- Razonamiento y respuesta a instrucciones (inferido del pipeline conversacional y los tags, sin benchmarks disponibles).
- Compatibilidad con endpoints (tag "endpoints_compatible"), lo que facilita su despliegue en infraestructuras de inferencia compatibles.
- Reproducibilidad del ajuste declarada por el autor del modelo base.
- No se documenta soporte explícito de tool calling, function calling, agentes multi-paso, audio ni modo thinking.

## Casos de uso

- Asistencia conversacional con postura crítica: el ajuste no-sicofántico lo hace adecuado para entornos donde el modelo debe señalar errores del usuario en lugar de validarlos, como tutorías o revisión de decisiones técnicas.
- Despliegue local en estaciones de trabajo: las cuantizaciones Q4_K_M (16,9 GB) y Q5_K_M (19,6 GB) permiten ejecutar el modelo en GPUs de consumo con 24 GB de VRAM, útil para prototipos sin conexión.
- Análisis de documentos con imágenes: los archivos mmproj permiten procesar entradas multimodales en pipelines de extracción de información, siempre que se valide el soporte real de visión.
- Evaluación de sesgos y sicofancia en investigación: al ser un modelo ajustado específicamente contra la sicofancia, sirve como referencia en estudios comparativos de comportamiento.
- Generación de contenido en inglés para blogs y documentación técnica: con contexto conversacional multi-turno, aunque la longitud de contexto no está documentada.
- Integración en servicios compatibles con endpoints: el tag "endpoints_compatible" facilita su exposición como API en infraestructuras de inferencia estándar.
- Pruebas de reproducibilidad: al declararse reproducible, puede emplearse para replicar experimentos de ajuste conductual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada según cuantización: Q2_K ~11,0 GB; Q3_K_S ~12,4 GB; Q3_K_M ~13,6 GB; Q3_K_L ~14,7 GB; IQ4_XS ~15,5 GB; Q4_K_S ~15,9 GB; Q4_K_M ~16,9 GB; Q5_K_S ~19,1 GB; Q5_K_M ~19,6 GB; Q6_K ~22,5 GB; Q8_0 ~29,1 GB.
- Complementos multimodales: mmproj-Q8_0 ~0,7 GB y mmproj-f16 ~1,0 GB adicionales si se usa visión.
- GPU recomendadas: para Q4_K_M y Q5_K_M, GPUs con 24 GB de VRAM (RTX 3090, RTX 4090) son suficientes; para Q8_0 se recomienda 32 GB o más (A100 40GB, H100, o configuraciones multi-GPU).
- Cabe en GPU de consumo: sí, en RTX 3090/4090 con cuantizaciones Q4 y Q5; las Q2/Q3 caben en GPUs de 12-16 GB con margen ajustado.
- Opciones de despliegue: llama.cpp, Ollama y otros runners compatibles con GGUF; el tag "endpoints_compatible" sugiere soporte en servidores de inferencia tipo endpoint. vLLM y TGI no se confirman para GGUF en esta información.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-unsycophantic-GGUF (este) | ~27,3B | no disponible | Apache 2.0 | GGUF | Ajuste no-sicofántico, multimodelo vía mmproj |
| Modelo base jbowman512/Qwen3.8-27B-unsycophantic | ~27,3B | no disponible | Apache 2.0 | safetensors | Pesos originales sin cuantizar |
| Versión i1 (imatrix) de mradermacher | ~27,3B | no disponible | Apache 2.0 | GGUF | Cuantizaciones ponderadas, disponibles en repositorio separado |

No se dispone de datos de rendimiento para comparar con alternativas de la misma categoría; la comparativa se limita a parámetros, licencia y formato.

## Limitaciones y advertencias

- Idioma: el modelo declara únicamente inglés; el rendimiento en castellano no está garantizado ni documentado.
- Longitud de contexto no disponible: no se puede planificar su uso en tareas de contexto largo sin validación previa.
- Riesgo de alucinación: no se han publicado evaluaciones de fidelidad; el ajuste no-sicofántico no elimina la posibilidad de generar información incorrecta.
- Sesgos: no se documentan análisis de sesgo; el ajuste conductual puede introducir sesgos propios no evaluados.
- Capacidades multimodales no verificadas: la presencia de mmproj no confirma el alcance ni la calidad del soporte de visión.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base y de los datos de ajuste, no documentadas aquí.
- Producción: sin benchmarks ni datos de latencia/throughput, el modelo requiere evaluación propia antes de un despliegue en producción.
- El repositorio tiene 867 descargas y 0 likes, lo que indica adopción limitada y poca validación comunitaria.

## Enlaces

- Hugging Face (este repositorio): https://huggingface.co/mradermacher/Qwen3.8-27B-unsycophantic-GGUF
- Modelo base: https://huggingface.co/jbowman512/Qwen3.8-27B-unsycophantic
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Qwen3.8-27B-unsycophantic-i1-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#Qwen3.8-27B-unsycophantic-GGUF
- README de referencia para GGUF de TheBloke: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de modelos del autor: https://huggingface.co/mradermacher/model_requests
- Gráfico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
