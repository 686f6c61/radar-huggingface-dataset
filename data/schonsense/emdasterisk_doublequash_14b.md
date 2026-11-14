# schonsense/emdasterisk_doublequash_14B

## Resumen

El modelo `emdasterisk_doublequash_14B` es un ajuste fino (finetune) publicado por el usuario schonsense en Hugging Face, derivado del modelo `schonsense/emdasterisk_go_home_14B`. Se distribuye bajo la etiqueta de pipeline `image-text-to-text` y la arquitectura declarada `mistral3`, lo que indica que está orientado a tareas multimodales de entrada imagen y texto con salida textual. Cuenta con aproximadamente 13.945 millones de parámetros (unos 14B) en formato safetensors, con un repositorio de 55,8 GB que sugiere pesos en precisión alta (probablemente bf16).

La relevancia de este modelo es limitada en el momento de redactar esta ficha: registra cero descargas y cero likes, no dispone de una model card sustantiva (el README se limita a un título y dos imágenes) y no publica información sobre datos de entrenamiento, benchmarks ni idiomas soportados. La licencia Apache 2.0 permite uso comercial y modificación, lo que constituye uno de sus pocos datos verificables y favorables.

Por tanto, esta ficha se construye a partir de los metadatos del repositorio y de la información estructural inferible (arquitectura, tamaño, pipeline), marcando explícitamente como "no disponible" todo aquello que el autor no ha documentado. Se recomienda precaución antes de emplearlo en producción dado el escaso soporte documental y la ausencia de validación externa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | mistral3 (transformer multimodal, según etiqueta del repo) |
| Parametros totales | 13.945.031.680 (~14B) |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo contiene safetensors; no se publican GGUF ni cuantizaciones oficiales) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Pipeline | image-text-to-text |
| Modelo base | schonsense/emdasterisk_go_home_14B |
| Tamano del repositorio | 55,8 GB |
| Libreria | transformers |
| Fecha de creacion | 2026-11-14 |
| Fecha de actualizacion | 2026-11-14 |

## Arquitectura y entrenamiento

La etiqueta `mistral3` del repositorio indica que el modelo parte de la familia Mistral 3, una arquitectura transformer con capacidades multimodales (procesamiento conjunto de imagen y texto). El pipeline declarado `image-text-to-text` confirma la orientación a tareas de visión-lenguaje, si bien el autor no detalla el codificador visual, la resolución de imagen soportada ni la estrategia de fusión entre modalidades.

No se dispone de información sobre el proceso de entrenamiento: ni el número de tokens, ni la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF, DPO o SFT. El nombre del modelo ("doublequash") y su modelo base ("emdasterisk_go_home_14B") sugieren una cadena de ajustes finos sucesivos de carácter experimental, pero no hay documentación técnica que lo confirme. Tampoco se documentan innovaciones como decodificación especulativa, atención lineal o modos de razonamiento explícito.

## Capacidades

- Generación de texto conversacional, según la etiqueta `conversational` del repositorio.
- Procesamiento de entrada multimodal imagen-texto con salida textual (pipeline `image-text-to-text`).
- Compatibilidad con `transformers` y con endpoints compatibles (etiqueta `endpoints_compatible`), lo que facilita su despliegue mediante la infraestructura estándar de Hugging Face.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no se declaran idiomas).
- Capacidades especiales (modo thinking, audio, visión detallada): solo se confirma visión por el pipeline; el resto no disponible.

## Casos de uso

- Prototipado de asistentes visuales: al aceptar pares imagen-texto, puede usarse para experimentar con descripción de imágenes o respuesta a preguntas sobre contenido visual en entornos de laboratorio, siempre validando la calidad de salida por la ausencia de benchmarks.
- Investigación sobre cadenas de finetuning: sirve como caso de estudio de ajustes sucesivos sobre un modelo base Mistral 3, útil para analizar deriva de comportamiento entre versiones.
- Despliegue interno con licencia permisiva: la licencia Apache 2.0 permite integrarlo en flujos corporativos internos sin obligaciones de copyleft, previa evaluación de calidad.
- Generación de texto conversacional en demos: su etiqueta `conversational` y compatibilidad con `transformers` permiten montar demos rápidas con la librería estándar.
- Pruebas de integración con endpoints compatibles: la etiqueta `endpoints_compatible` facilita desplegarlo en infraestructura tipo TGI o endpoints gestionados para pruebas de latencia y formato.
- Base para nuevos ajustes finos: al ser un modelo de ~14B con pesos safetensors accesibles, puede reutilizarse como punto de partida para tareas específicas, asumiendo el coste de reentrenamiento y evaluación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 28 GB solo para pesos (14B × 2 bytes), más overhead de activaciones y caché KV; en la práctica se recomienda 32 GB o más para contexto corto.
- Cuantización a 8 bits: en torno a 14-16 GB de VRAM; a 4 bits: en torno a 8-10 GB, si bien no se publican cuantizaciones oficiales y habría que generarlas.
- GPU recomendadas: A100 40/80 GB, H100, L40S o A6000 para precisión completa; RTX 4090 (24 GB) solo viable con cuantización de 8 bits o inferior.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 (24 GB) con cuantización; no en precisión bf16 completa.
- Opciones de despliegue: `transformers` (soporte nativo declarado), endpoints compatibles de Hugging Face; vLLM, llama.cpp, Ollama o TGI no están confirmados para esta arquitectura multimodal concreta y requerirían verificación.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Documentacion | Disponibilidad |
|---|---|---|---|---|---|
| emdasterisk_doublequash_14B | ~14B | no disponible | Apache 2.0 | Model card mínima, sin benchmarks | 0 descargas |
| schonsense/emdasterisk_go_home_14B (base) | no disponible | no disponible | no disponible | no disponible | Repositorio del mismo autor |
| Mistral Small 3 (referencia de familia) | ~24B | no disponible en esta ficha | Apache 2.0 | Model card completa y benchmarks publicados | Amplia adopción |

La comparación con alternativas consolidadas resulta limitada porque el autor no publica métricas ni detalles de contexto. Frente a modelos de la misma familia con documentación completa, este finetune carece de validación externa y de tracción comunitaria.

## Limitaciones y advertencias

- Ausencia total de benchmarks y de evaluación independiente: no hay evidencia publicada de su calidad en tareas concretas.
- Model card prácticamente vacía: sin datos de entrenamiento, idiomas ni contexto, lo que impide evaluar sesgos y riesgos de forma rigurosa.
- Riesgo de alucinación desconocido y no cuantificado por el autor.
- Idiomas soportados no declarados: no puede asumirse un buen rendimiento en castellano sin pruebas.
- Cadena de finetunes experimentales ("doublequash" sobre "go_home"): posible deriva de comportamiento respecto al modelo base original.
- Cero descargas y cero likes: sin validación por parte de la comunidad, mayor probabilidad de errores no detectados.
- Licencia Apache 2.0: permite uso comercial, pero el usuario asume toda la responsabilidad sobre el comportamiento del modelo.
- Compatibilidad de despliegue no verificada con vLLM, llama.cpp u Ollama; conviene probar con `transformers` antes de asumir otras rutas.
- No apto para producción sin una fase previa de evaluación propia en el dominio objetivo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/schonsense/emdasterisk_doublequash_14B
- Modelo base: https://huggingface.co/schonsense/emdasterisk_go_home_14B
- Perfil del autor: https://huggingface.co/schonsense
