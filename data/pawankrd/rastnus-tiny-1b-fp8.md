# PawanKrd/RastNus-Tiny-1B-FP8

## Resumen

RastNus-Tiny-1B-FP8 (ڕاستنووس, "escritura correcta") es un modelo de 1.030.933.022 parámetros especializado en corrección gramatical, ortográfica y de puntuación en kurdo central (sorani, código ISO `ckb`). Lo desarrolla PawanKrd y deriva de `google/gemma-4-E2B` mediante poda y destilación, hasta reducir la huella a aproximadamente 1B de parámetros. Se distribuye en formato FP8 (compressed-tensors) para servir con vLLM, con pesos en bf16 de unos 2 GB.

Su relevancia es doble: por un lado cubre una lengua de bajos recursos con un modelo dedicado y ligero; por otro, demuestra una estrategia de compresión sobre un modelo base mayor (Gemma 4 E2B) para obtener una tarea única y acotada con coste de inferencia mínimo. Según la model card, en una sola GPU con vLLM alcanza del orden de 6.000 tokens/s en lote, lo que lo sitúa en el terreno de la corrección masiva de texto a bajo coste.

La licencia declarada es Apache 2.0, aunque el enlace de licencia del README apunta a los términos de Gemma 4 de Google, una discrepancia que conviene verificar antes de un uso comercial. El repositorio no registra descargas ni interacciones en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Gemma 4 E2B, podado y destilado); familia `gemma4_text` |
| Parámetros totales | 1.030.933.022 |
| Parámetros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | FP8 (compressed-tensors); pesos base en bf16 |
| Idiomas soportados | kurdo central / sorani (`ckb`) |
| Licencia | apache-2.0 (el README enlaza además la licencia de Gemma 4) |
| Formato de pesos | safetensors (cuantización FP8 vía compressed-tensors) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de tipo causal para generación de texto, obtenido a partir de `google/gemma-4-E2B`. La model card indica que se ha aplicado poda y destilación para llegar a aproximadamente 1B de parámetros, y que se ha especializado en una tarea concreta: corrección gramatical, ortográfica y de puntuación en sorani. No se detalla el número de tokens de entrenamiento, la composición del corpus ni si hubo fases de RLHF o DPO.

La innovación principal es de ingeniería más que de arquitectura: la compresión de un modelo base mayor a un tamaño de 1B manteniendo la tarea, junto con una cuantización FP8 lista para vLLM mediante `compressed-tensors`. El resultado es un modelo pequeño y de alto rendimiento en lote, pensado para despliegue masivo en GPU modestas o hardware de borde.

## Capacidades

- Corrección gramatical en kurdo central (sorani): detección y corrección de errores de concordancia, flexión y estructura oracional.
- Corrección ortográfica: normalización de grafías y errores de escritura en alfabeto árabe-persa adaptado al kurdo.
- Restauración de puntuación: inserción y corrección de signos de puntuación en texto sin marcar o mal puntuado.
- Generación de texto conversacional (pipeline `text-generation`), orientada a la tarea de corrección.
- Formato compatible con endpoints de inferencia (tag `endpoints_compatible`).
- Capacidades multilingües: limitadas al kurdo central; no se declaran capacidades de tool calling, agentes, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Corrección masiva de corpus en kurdo central: procesar lotes de documentos, artículos o transcripciones y devolver la versión corregida; el rendimiento declarado de ~6.000 tokens/s en vLLM con una sola GPU lo hace adecuado para pipelines de limpieza a gran escala.
- Pretratamiento de datos para entrenamiento: normalizar texto sorani (ortografía y puntuación) antes de alimentar otros modelos o construir datasets, reduciendo ruido en el corpus.
- Edición y revisión editorial: asistencia a redactores y traductores que escriben en sorani, con corrección automática de borradores antes de la revisión humana.
- Integración en procesadores de texto y extensiones: al ocupar unos 2 GB en bf16, puede desplegarse en servidores pequeños o en el borde para ofrecer corrección en tiempo real dentro de aplicaciones de escritura.
- Moderación y calidad de contenido generado por usuarios: limpieza de comentarios, foros y mensajes antes de publicarlos o de indexarlos en motores de búsqueda.
- Digitalización de patrimonio lingüístico: corrección de textos históricos o digitalizados con OCR que presentan errores ortográficos y de puntuación, preservando la lengua sorani.
- Servicio API de bajo coste: al ser un modelo de 1B en FP8, se puede servir con vLLM en GPU de consumo o instancias pequeñas con coste por token muy reducido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo aporta una cifra de rendimiento operativo: aproximadamente 6.000 tokens/s en lote con vLLM en una sola GPU.

## Requisitos de hardware

- VRAM estimada: unos 2 GB de pesos en bf16 según la model card; la versión FP8 reduce aún más la huella de pesos, aunque el consumo real depende de la longitud de contexto y del tamaño de lote.
- GPU recomendadas: no se especifican modelos concretos; por tamaño, cabe en GPU de consumo (por ejemplo, series RTX con 8 GB o más) y en GPU de centro de datos (A100, H100) para servir en lote.
- GPU de consumo: sí, previsiblemente en cualquier GPU con al menos 4-8 GB de VRAM, dado el tamaño de 1B parámetros.
- Despliegue: vLLM es la opción indicada por el autor (formato FP8 con compressed-tensors); para otras opciones (llama.cpp, Ollama, TGI) no hay confirmación en la información disponible.
- Latencia y throughput: ~6.000 tokens/s en lote con vLLM en una sola GPU (dato del autor); la latencia por petición no se detalla.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de modelos comparables específicos para corrección en kurdo central en la información proporcionada. Como referencia estructural, se compara con el modelo base del que deriva:

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RastNus-Tiny-1B-FP8 | 1.030.933.022 | no disponible | Corrección gramatical/ortográfica en sorani | apache-2.0 | Hugging Face |
| google/gemma-4-E2B | no disponible | no disponible | Modelo base generalista | licencia Gemma 4 | Hugging Face |
| RastNus-Tiny-1B (bf16) | ~1B | no disponible | Igual que este modelo, sin cuantizar | apache-2.0 | Hugging Face |

## Limitaciones y advertencias

- Ámbito lingüístico restringido: solo se declara kurdo central (sorani); no hay evidencia de calidad en kurdo kurmanji, árabe u otras lenguas.
- Riesgo de alucinación: al ser un modelo generativo, puede introducir cambios no solicitados o "corregir" formas válidas; conviene validar en producción.
- Sesgos: no se documentan sesgos conocidos, pero el corpus de entrenamiento no se describe, lo que impide evaluar su representatividad.
- Licencia: la model card declara Apache 2.0, pero el enlace de licencia apunta a los términos de Gemma 4 de Google; esta discrepancia debe aclararse antes de un uso comercial.
- Contexto: la longitud de contexto no está documentada, lo que dificulta planificar documentos largos.
- Madurez: el repositorio no registra descargas ni interacciones, y no hay benchmarks publicados; la validación independiente es inexistente.
- Formato: la cuantización FP8 con compressed-tensors está orientada a vLLM; otros runtimes pueden requerir conversión.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/PawanKrd/RastNus-Tiny-1B-FP8
- Versión bf16: https://huggingface.co/PawanKrd/RastNus-Tiny-1B
- Modelo base: https://huggingface.co/google/gemma-4-E2B
- Perfil del autor: https://huggingface.co/PawanKrd
- Sitio del autor: https://pawan.krd
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Licencia Gemma 4 (enlazada en el README): https://ai.google.dev/gemma/docs/gemma_4_license
