# ogaude/glyphfix-math-lora

## Resumen

GlyphFix Math LoRA es un adaptador LoRA de tipo PEFT desarrollado por el usuario independiente ogaude sobre el modelo base lightonai/LightOnOCR-3-4B, un modelo de visión-lenguaje de 4.205.751.296 parámetros orientado a OCR. El adaptador se especializa en una tarea muy concreta: transcribir imágenes de ecuaciones en formato display a LaTeX que coincida con lo que el autor del artículo escribió realmente, no solo con una salida que "parezca correcta" a simple vista. El proyecto parte de la premisa de que los errores de OCR en fórmulas matemáticas son especialmente costosos, ya que un solo glifo mal leído (una prima confundida con la letra l, una letra griega leída como latina, una negrita perdida o una I leída como 1) cambia el objeto matemático al que se refiere la expresión.

La propuesta metodológica es relevante: en lugar de evaluar con métricas de texto plano, el autor mina los errores del modelo base sobre artículos reales, entrena un LoRA sobre ellos y puntúa el resultado compilando tanto la referencia como la predicción y comparando los bitmaps renderizados ("render-identical"). Esta métrica captura diferencias que las métricas de similitud textual ocultan.

Se trata de una primera versión temprana, publicada el 29 de octubre de 2026 y actualizada al día siguiente, con solo 27 descargas. El autor advierte explícitamente de que quedan asperezas y de que planea una versión posterior con un dataset orientado a cada clase de error (primas, letras griegas, decoraciones, I frente a 1), ya que los datos de entrenamiento de esta versión no se construyeron en torno a esas clases. Los resultados de esta ficha describen únicamente esta versión.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer visión-lenguaje; modelo base LightOnOCR-3-4B |
| Parámetros totales | 4.205.751.296 (modelo base); el adaptador LoRA en sí no se detalla |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GGUF Q8_0 (versión fusionada publicada para Ollama); el adaptador LoRA en safetensors |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT), GGUF (modelo fusionado Q8_0) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre lightonai/LightOnOCR-3-4B en la revisión b71010f095dc3735de7ee6b9969bff8f8f50b39a. Se distribuye como adaptador LoRA (librería peft) y como un GGUF fusionado en cuantización Q8_0 pensado para Ollama. La tarea modelada es image-text-to-text: la entrada es la imagen de una única ecuación en display y la salida es LaTeX.

El entrenamiento se basa en el dataset ogaude/glyphfix-math-equations, construido minando los errores del propio modelo base sobre artículos reales. La evaluación no usa métricas de similitud textual, sino que compila la referencia y la predicción con un preámbulo fijo y compara los bitmaps renderizados (métrica "render-identical"). El autor indica que esta versión no se entrenó en torno a clases de error específicas y que una versión futura lo hará. No se detallan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo RLHF o DPO.

## Capacidades

- Transcripción de imágenes de ecuaciones en display a LaTeX.
- Corrección de errores típicos de OCR matemático: primas leídas como letra l, letras griegas leídas como latinas (por ejemplo, chi leída como x, ípsilon como v), decoraciones perdidas o intercambiadas (negrita, sans-serif, script, barra, subrayado) y la letra I leída como dígito 1.
- Conservación de estilos tipográficos matemáticos (`\mathsf`, `\mathscr`, `\mathcal`, `\mathbf`, etc.) que el modelo base tiende a perder.
- Salida en LaTeX compilable con un preámbulo fijo, lo que permite comparación por renderizado.
- Capacidad conversacional y de image-text-to-text heredada del modelo base.
- No se documentan en la información disponible capacidades de tool calling, function calling, agentes, modo thinking, audio ni otras modalidades.

## Casos de uso

- Digitalización de artículos científicos en PDF: extraer las ecuaciones en display de papers de matemáticas, física o estadística y convertirlas a LaTeX fiel al original, reduciendo la pérdida de notación que sufren los OCR genéricos.
- Construcción de bases de datos de fórmulas: alimentar un repositorio de ecuaciones LaTeX a partir de capturas o recortes de publicaciones, con la ventaja de que la métrica de render-identical permite filtrar automáticamente las transcripciones dudosas.
- Revisión de corpus matemáticos: detectar discrepancias entre el LaTeX original de un artículo y lo que un OCR produciría, útil para control de calidad de pipelines de conversión.
- Reproducción de material docente: convertir imágenes de ecuaciones de apuntes, transparencias o libros escaneados a LaTeX editable para su reutilización en materiales propios.
- Integración en herramientas de accesibilidad: generar LaTeX (y a partir de él, MathML) para que las ecuaciones de documentos escaneados puedan ser leídas por lectores de pantalla y motores de renderizado matemático.
- Preprocesado para motores de búsqueda matemática: normalizar ecuaciones extraídas de PDFs a LaTeX canónico antes de indexarlas, mejorando la recuperación de fórmulas.
- Despliegue local en Ollama: el GGUF Q8_0 fusionado permite ejecutar el modelo en entornos locales sin infraestructura de GPU dedicada, adecuado para prototipos y pruebas de concepto.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index de la model card:

| Tarea | Dataset | Métrica | Valor |
|---|---|---|---|
| Equation image to LaTeX | ogaude/glyphfix-math-equations (split benchmark) | Render-identical rate | 0,652 |

El autor advierte de que este resultado corresponde solo a esta versión. En el análisis cualitativo de la model card se indica que en el benchmark el modelo base cometía pocos errores en las clases "prima leída como l" (1), "griega leída como latina" (18) e "I leída como 1" (3), por lo que no se reclama mejora en esas clases. El scorer marcó 31 filas como primas perdidas, cambio no significativo y probablemente en parte artefacto del propio scorer. Lo que sí se midió fue una reducción en errores de decoración y en el grupo amplio "other" (que incluye elecciones tipográficas como `\mathrm` frente a `\rm` o qué letra script usó el autor). En páginas completas, comprobadas solo en 50 páginas, no se ha demostrado mejora todavía.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Como referencia, un modelo de 4.205.751.296 parámetros en Q8_0 requiere del orden de 4-5 GB de pesos, más overhead de contexto y del codificador visual; en FP16 rondaría los 8-9 GB. Estas cifras son estimaciones por tamaño, no datos publicados por el autor.
- GPU recomendadas: no disponible. Por tamaño, el modelo base es manejable en GPUs de consumo con suficiente VRAM; el adaptador LoRA añade un coste mínimo sobre el modelo base.
- Cabe en GPU de consumo: previsiblemente sí en modelos con 8 GB o más de VRAM en cuantización Q8_0, aunque no se confirma en la información disponible.
- Opciones de despliegue: Ollama (a través del GGUF Q8_0 fusionado), peft/PEFT para cargar el adaptador sobre el modelo base, y cualquier stack compatible con transformers y safetensors. No se documentan integraciones con vLLM, TGI o llama.cpp más allá del GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| glyphfix-math-lora | 4,2 B (base) | no disponible | OCR de ecuaciones a LaTeX con LoRA | apache-2.0 | HuggingFace, GGUF para Ollama |
| lightonai/LightOnOCR-3-4B (base) | 4,2 B | no disponible | OCR general imagen-texto | no disponible en esta información | HuggingFace |
| OCR genéricos de propósito general | variable | variable | OCR de texto y documentos | variable | variable |

No se dispone en la información proporcionada de resultados de benchmarks de modelos comparables en la misma tarea (ecuación a LaTeX con métrica render-identical), por lo que no es posible establecer una comparación cuantitativa. La comparación más directa es con el propio modelo base, sobre el que el adaptador declara una tasa render-identical de 0,652 en el split de benchmark, sin que se aporte la cifra correspondiente del base en la información disponible.

## Limitaciones y advertencias

- Primera versión temprana: el autor la describe como primer intento, con asperezas esperables y sujeta a cambios en versiones posteriores.
- El dataset de entrenamiento no se construyó en torno a las clases de error que el proyecto quiere corregir (primas, griegas, decoraciones, I frente a 1), por lo que la mejora medida es limitada y no se reclama en varias de esas clases.
- En páginas completas (evaluadas solo en 50) no se ha demostrado mejora; los resultados se refieren a imágenes de ecuaciones en display aisladas.
- La métrica render-identical puede producir artefactos: el propio autor señala que el recuento de 31 primas perdidas es probablemente en parte un artefacto del scorer.
- Solo soporta inglés como idioma declarado.
- No se documentan sesgos específicos ni tasas de alucinación; al ser un modelo de transcripción, el riesgo principal es la generación de LaTeX plausible pero incorrecto, precisamente el problema que el proyecto intenta mitigar.
- Licencia apache-2.0, que permite uso comercial; sin embargo, el autor declara que el modelo es un fine-tune independiente no afiliado, respaldado ni patrocinado por LightOn, por lo que las condiciones del modelo base deben verificarse por separado.
- No hay datos publicados sobre contexto máximo, latencia, throughput ni requisitos de hardware.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ogaude/glyphfix-math-lora
- Dataset: https://huggingface.co/datasets/ogaude/glyphfix-math-equations
- Modelo base: https://huggingface.co/lightonai/LightOnOCR-3-4B
- arXiv 2408.10186 (ejemplo de ecuación, "The stochastic six-vertex model speed process"): https://arxiv.org/abs/2408.10186v3
- arXiv 2601.20152 (ejemplo de ecuación, "Concentration Inequalities for Exchangeable Tensors and Matrix-valued Data"): https://arxiv.org/abs/2601.20152v3
- arXiv 2510.20320 (ejemplo de ecuación, "Strong uniqueness of tangent flows at cylindrical singularities in Ricci flow"): https://arxiv.org/abs/2510.20320v2
- Referencias adicionales citadas en los tags (arXiv 2606.29349): https://arxiv.org/abs/2606.29349
