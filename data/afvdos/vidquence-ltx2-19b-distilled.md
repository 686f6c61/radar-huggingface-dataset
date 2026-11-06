# afvdos/vidquence-ltx2-19b-distilled

## Resumen

`afvdos/vidquence-ltx2-19b-distilled` no es un modelo entrenado por su autor, sino un repositorio agregador publicado en Hugging Face que reúne, en una sola descarga de 52,5 GB, el conjunto exacto de ficheros que necesita un pipeline de generación de vídeo de LTX-2 en su variante destilada de 19B parámetros. El autor lo declara explícitamente: "Nothing here was trained, fine-tuned or changed". Se trata, por tanto, de un paquete de conveniencia para despliegue, no de un modelo nuevo.

El contenido procede de dos fuentes: los pesos de vídeo de `Lightricks/LTX-2` (el modelo destilado en FP8 y el upscaler espacial x2) y el codificador de texto `google/gemma-3-12b-it-qat-q4_0-unquantized`, empaquetado en el subdirectorio `gemma/`. LTX-2 es un modelo de generación de vídeo con audio de Lightricks; la variante destilada reduce el número de pasos de muestreo necesarios en inferencia a costa de una ligera pérdida de calidad frente al modelo base.

Su relevancia es práctica: cualquiera que quiera ejecutar LTX-2 19B destilado en modo imagen-a-vídeo o audio-a-vídeo encuentra aquí los tres artefactos necesarios con las licencias originales intactas, evitando descargas parciales o emparejamientos incorrectos de versiones. No aporta mejoras técnicas ni pesos nuevos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de difusion para video; detalles no publicados en la informacion disponible) |
| Parametros totales | 19B (según nomenclatura del nombre del repo y del fichero `ltx-2-19b-distilled-fp8`) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 (pesos principales); QAT Q4_0 sin cuantizar en el codificador de texto Gemma 3 12B |
| Idiomas soportados | no disponible |
| Licencia | LTX-2 Community License Agreement (pesos LTX-2) + Gemma Terms of Use (codificador de texto) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El repositorio no entrena ni modifica nada. Agrupa tres artefactos: `ltx-2-19b-distilled-fp8.safetensors` (pesos del modelo de vídeo destilado, en FP8), `ltx-2-spatial-upscaler-x2-1.0.safetensors` (upscaler espacial x2 para aumentar la resolución de los fotogramas generados) y el directorio `gemma/` con `gemma-3-12b-it-qat-q4_0-unquantized`, que actúa como codificador de texto del pipeline. La destilación de LTX-2 reduce los pasos de muestreo necesarios, lo que abarata la inferencia; los detalles concretos del proceso de destilación, la arquitectura interna del difusor y la composición del dataset de entrenamiento no se recogen en la información disponible.

El modelo está pensado para dos modalidades declaradas en la model card: imagen-a-vídeo (image-to-video) y audio-a-vídeo (audio-to-video). El upscaler x2 se aplica en una segunda etapa para duplicar la resolución espacial de la salida.

## Capacidades

- Generación de vídeo a partir de una imagen de entrada (image-to-video).
- Generación de vídeo condicionada por audio (audio-to-video).
- Superresolución espacial x2 de fotogramas generados mediante el upscaler incluido.
- Codificación de texto vía Gemma 3 12B para el prompt de condicionamiento.
- Generación con muestreo destilado (menos pasos que el modelo base).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión general, audio de entrada/salida más allá del condicionamiento, ni soporte multilingüe explícito.

## Casos de uso

- Prototipado rápido de pipelines image-to-video: al contener los tres ficheros exactos que carga el pipeline, se puede montar un entorno de pruebas sin resolver dependencias entre versiones del modelo base, el upscaler y el codificador de texto.
- Generación de vídeo corto a partir de storyboards o keyframes: se parte de una imagen fija y se anima con el difusor destilado, útil para previsualización de anuncios o secuencias.
- Sincronización de vídeo con pistas de audio: la modalidad audio-to-video permite generar clips cuyo movimiento se condiciona a una pista de sonido, aplicable a doblaje o a generación de contenido musical.
- Restauración y ampliación de resolución: el upscaler x2 permite reescalar fotogramas generados a bajo coste computacional, útil en pipelines de postproducción.
- Despliegue en infraestructura con VRAM limitada: los pesos en FP8 reducen el espacio frente a una versión en BF16, lo que facilita su ejecución en GPUs de gama alta con menos memoria.
- Evaluación comparativa de la variante destilada frente al modelo LTX-2 completo: al estar empaquetados los pesos destilados de forma aislada, sirve para medir la pérdida de calidad frente al número de pasos.
- Reproducibilidad de experimentos: al fijar una única revisión del repo (creado y actualizado el 2026-11-04), se evita la deriva de versiones en entornos de investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia de orden de magnitud, 19B parámetros en FP8 ocupan aproximadamente 19 GB solo en pesos, a lo que hay que sumar el codificador de texto Gemma 3 12B y el upscaler; el repo completo pesa 52,5 GB.
- GPU recomendadas: no especificadas por el autor. Por tamaño, se requiere una GPU con al menos 24-40 GB de VRAM para el conjunto completo; modelos como A100 40/80 GB, H100 o L40S son candidatos razonables, pero no hay confirmación oficial.
- ¿Cabe en GPU de consumo? No hay datos oficiales. Una RTX 4090 (24 GB) podría no ser suficiente para cargar todos los componentes simultáneamente; se desconoce si existe descarga secuencial de módulos.
- Opciones de despliegue: no se documentan en la model card. Al ser safetensors de difusión, los runners habituales serían ComfyUI, Diffusers o el código oficial de Lightricks, pero no se confirma compatibilidad.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| `afvdos/vidquence-ltx2-19b-distilled` (este repo) | 19B (vídeo) + 12B (texto) | no disponible | LTX-2 Community License + Gemma Terms | Hugging Face, 0 descargas |
| `Lightricks/LTX-2` (modelo base) | 19B | no disponible | LTX-2 Community License | Hugging Face (oficial) |
| `google/gemma-3-12b-it-qat-q4_0-unquantized` | 12B | no disponible | Gemma Terms of Use | Hugging Face (oficial) |

No se dispone de datos de rendimiento para comparar cualitativamente con alternativas de generación de vídeo de la misma categoría (por ejemplo, modelos de vídeo de otros laboratorios), por lo que la comparación se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- No es un modelo original: cualquier limitación de LTX-2 o de Gemma 3 se hereda sin cambios.
- Licencia restrictiva: la LTX-2 Community License Agreement incluye umbrales de ingresos para uso comercial y políticas de uso aceptable; es obligatorio revisar el fichero `LICENSE` antes de desplegar en producción.
- Doble licencia: los ficheros de Gemma se rigen por los Gemma Terms of Use y la Gemma Prohibited Use Policy, con restricciones adicionales independientes de las de LTX-2.
- Sin garantías: el autor distribuye los ficheros "as is", sin soporte ni mantenimiento.
- Riesgo de alucinación visual: como todo modelo generativo de vídeo, puede producir artefactos, incoherencias temporales o contenido no fiel al prompt; no hay métricas publicadas en este repo.
- Idiomas: no se documenta qué idiomas acepta el codificador de texto en este pipeline; Gemma 3 soporta múltiples idiomas, pero no se confirma el comportamiento en LTX-2.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, lo que reduce la probabilidad de que los problemas de integración estén resueltos por la comunidad.
- Fecha de creación futura (2026-11-04) en los metadatos: conviene verificar la integridad del repo antes de confiar en él para producción.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/afvdos/vidquence-ltx2-19b-distilled
- Modelo base LTX-2: https://huggingface.co/Lightricks/LTX-2
- Codificador de texto Gemma 3 12B QAT: https://huggingface.co/google/gemma-3-12b-it-qat-q4_0-unquantized
- Gemma Terms of Use: https://ai.google.dev/gemma/terms
- Gemma Prohibited Use Policy: https://ai.google.dev/gemma/prohibited_use_policy
