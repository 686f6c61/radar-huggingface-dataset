# PawanKrd/RastNus-Tiny-1B-NVFP4

## Resumen

RastNus-Tiny-1B-NVFP4 es la variante cuantizada en NVFP4 de RastNus-Tiny-1B, un modelo de 1.030.933.022 parámetros especializado en corrección gramatical, ortográfica y de puntuación en kurdo central (sorani, código `ckb`). Lo desarrolla PawanKrd y deriva de Google Gemma 4 E2B, que ha sido podado y destilado hasta reducirse a aproximadamente 1B de parámetros. La versión NVFP4 está pensada para servir el modelo con vLLM en GPUs pequeñas y hardware de borde, con un peso aproximado de 2 GB.

El modelo no es un asistente generalista: es una herramienta de post-procesado lingüístico para una lengua de bajos recursos. Su valor está en cubrir una tarea concreta (normalización de texto kurdo sorani) con una huella de memoria mínima y un throughput declarado de unos 6.000 tokens por segundo en lote sobre una sola GPU con vLLM.

La relevancia actual viene de dos factores: la escasez de modelos especializados en kurdo central y la adopción de NVFP4 como formato de cuantización de 4 bits orientado a aceleradores Blackwell, que permite desplegar modelos pequeños con coste de inferencia muy bajo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Gemma 4, variante `gemma4_text`), podado y destilado desde google/gemma-4-E2B |
| Parámetros totales | 1.030.933.022 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | NVFP4 (formato de 4 bits de punto flotante; pesos en compressed-tensors) |
| Idiomas soportados | kurdo central / sorani (`ckb`) |
| Licencia | Apache 2.0 (con enlace a la licencia de Gemma 4 de Google) |
| Formato de pesos | safetensors con compressed-tensors (NVFP4); librería transformers |

## Arquitectura y entrenamiento

El modelo parte de google/gemma-4-E2B, un transformer decoder-only de la familia Gemma 4. El autor aplica poda (pruning) y destilación para reducir el modelo hasta unos 1.030 millones de parámetros, y después lo especializa en la tarea de corrección de texto en kurdo sorani. La model card no detalla el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF o DPO; esos datos no están disponibles.

La innovación principal de esta variante es la cuantización NVFP4 mediante compressed-tensors, un formato de 4 bits con bloques de escala pensado para aceleradores NVIDIA Blackwell y para el servidor vLLM. El resultado es un checkpoint de aproximadamente 1,5 GB en el repositorio y un peso en memoria de alrededor de 2 GB, lo que permite servir el modelo en GPUs de gama baja. No se documentan otras innovaciones arquitectónicas (atención lineal, decodificación especulativa, etc.).

## Capacidades

- Corrección gramatical en kurdo central (sorani): detección y reparación de errores morfosintácticos.
- Corrección ortográfica: normalización de grafías y formas léxicas no estándar.
- Restauración de puntuación: inserción y corrección de signos de puntuación en texto plano.
- Generación de texto conversacional, heredada del modelo base Gemma 4.
- Especialización monolingüe en `ckb`; no se declara soporte de otros idiomas.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponibles en la información proporcionada.

## Casos de uso

- Normalización de texto en pipelines editoriales: el modelo recibe texto kurdo sorani sin puntuar o con erratas y devuelve la versión corregida, integrándose como paso previo a la publicación en medios digitales o blogs en kurdo.
- Preprocesado para corpus de entrenamiento: limpieza ortográfica y de puntuación de grandes volúmenes de texto raspado antes de usarlo para entrenar otros modelos o para construir datasets paralelos.
- Corrección en herramientas de escritura: integración como servicio de autocompletado y corrección en editores de texto o procesadores de documentos para hablantes de sorani, con latencia baja gracias al tamaño reducido.
- Moderación y análisis de contenido generado por usuarios: normalizar comentarios y publicaciones en kurdo antes de pasarlos a clasificadores o sistemas de búsqueda, reduciendo la variabilidad ortográfica.
- Digitalización de documentos: post-procesado OCR de textos en kurdo central para corregir errores de reconocimiento y restaurar la puntuación perdida.
- Servicio de alto throughput en GPU pequeña: despliegue con vLLM sobre una única GPU de gama baja o hardware de borde, aprovechando el rendimiento declarado de unos 6.000 tokens/s en lote para atender picos de tráfico.
- Traducción asistida: prenormalizar el texto origen en sorani antes de pasarlo a un sistema de traducción automática, mejorando la calidad de la entrada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo aporta una cifra de rendimiento operativo: aproximadamente 6.000 tokens por segundo en generación por lotes con vLLM sobre una sola GPU, y un peso en memoria de alrededor de 2 GB.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2 GB de pesos en NVFP4; el consumo total depende de la longitud de contexto y del tamaño de lote, no disponible.
- GPU recomendadas: aceleradores NVIDIA con soporte de NVFP4 (arquitectura Blackwell) para aprovechar el formato; el autor menciona servir con vLLM.
- Cabe en GPU de consumo: sí, según el autor, en GPUs pequeñas y hardware de borde con unos 2 GB de pesos; no se especifican modelos concretos.
- Opciones de despliegue: vLLM (soporte nativo de compressed-tensors y NVFP4); otros motores como llama.cpp, Ollama o TGI no están confirmados en la información disponible.
- Latencia y throughput: unos 6.000 tokens/s en lote con vLLM en una sola GPU; la latencia por petición no está disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| RastNus-Tiny-1B-NVFP4 | 1.030.933.022 | no disponible | ckb | Apache 2.0 | safetensors NVFP4 |
| RastNus-Tiny-1B | no disponible en la información | no disponible | ckb | Apache 2.0 | safetensors |
| google/gemma-4-E2B | no disponible en la información | no disponible | no disponible | licencia Gemma 4 | safetensors |

No se dispone de datos de benchmarks ni de otros modelos de corrección en kurdo central comparables en la información proporcionada.

## Limitaciones y advertencias

- Especialización monolingüe: el modelo está entrenado para kurdo central (sorani); su comportamiento en otros idiomas o en otras variedades del kurdo (kurmanji, zazaki) no está garantizado.
- Riesgo de alucinación: al ser un modelo generativo, puede introducir cambios no solicitados en el texto o inventar formas léxicas al corregir; conviene validar las salidas en producción.
- Sesgos: no se documentan sesgos conocidos, pero el modelo hereda los del corpus de entrenamiento y del modelo base Gemma 4, no auditados en la model card.
- Longitud de contexto no documentada: no se puede planificar el procesado de documentos largos sin verificar empíricamente el límite real.
- Licencia: el repositorio declara Apache 2.0, pero enlaza a la licencia de Gemma 4 de Google; conviene revisar ambas antes de un uso comercial, ya que los términos de Gemma pueden imponer restricciones adicionales.
- Dependencia de hardware: el formato NVFP4 requiere aceleradores compatibles; en GPUs sin soporte nativo habrá que recurrir a otra variante del modelo.
- Madurez: el repositorio no tiene descargas ni likes y se creó en noviembre de 2026; no hay evidencia de uso en producción ni evaluaciones independientes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/PawanKrd/RastNus-Tiny-1B-NVFP4
- Versión sin cuantizar: https://huggingface.co/PawanKrd/RastNus-Tiny-1B
- Modelo base: https://huggingface.co/google/gemma-4-E2B
- Perfil del autor: https://huggingface.co/PawanKrd
- Web del autor: https://pawan.krd
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
