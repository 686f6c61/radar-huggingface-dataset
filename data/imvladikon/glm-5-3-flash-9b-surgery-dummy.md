# imvladikon/GLM-5.3-Flash-9B-Surgery-Dummy

## Resumen

GLM-5.3-Flash-9B-Surgery-Dummy es un checkpoint experimental creado por el usuario imvladikon mediante técnicas de cirugía de modelo (model surgery) sobre el modelo base zai-org/GLM-5.3-Flash de Z.ai. No es un lanzamiento oficial de Z.ai ni un modelo con calidad recuperada: se trata de una reducción estructural drástica que conserva la geometría de anchura y kernels del modelo original, pero recorta el decoder de 45 a 10 capas y cada ruta MoE de 288 a 32 expertos. El resultado es un modelo de aproximadamente 8,9 mil millones de parámetros, exclusivamente de texto, con la visión deshabilitada.

El propósito declarado de este upload es servir como línea base estática y reproducible para experimentos de cirugía de modelo, sin entrenamiento, destilación ni recopilación de activaciones. El autor advierte explícitamente que no debe usarse como modelo de producción ni para benchmarks. Su relevancia radica en ser un caso de estudio sobre cómo preservar la geometría de un modelo grande mientras se reduce su profundidad y número de expertos, aunque sin ningún tipo de recuperación de calidad posterior.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido (atención lineal y sparse) con MoE, basado en GLM-5.3-Flash, reducido a 10 capas decoder y 32 expertos por ruta |
| Parametros totales | 8.895.671.964 (según safetensors); la model card indica 8.895.622.684 parámetros de texto, más un stub visual de 49.056 parámetros |
| Parametros activos | no disponible (el modelo base tiene 18B activos, pero este dummy no especifica cuántos activa) |
| Longitud de contexto | no disponible (hereda la del base, pero no se especifica) |
| Tipos de cuantizacion | FP8/BF16 mixto (los tensores de expertos conservan los bytes originales del release) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se construye a partir de GLM-5.3-Flash, que introduce una arquitectura híbrida con atención lineal y sparse (KDA y MLA/DSA) para reducir costes de contexto largo. En este dummy, se conserva la anchura y la geometría de kernels del modelo original, pero se reduce el decoder de 45 a 10 capas, seleccionando las capas fuente `[0, 1, 2, 3, 10, 17, 24, 31, 38, 44]`. Cada ruta MoE se reduce de 288 a 32 expertos, y las filas de router se inicializan con centroides de clúster en el espacio de routers como arranque determinista. No se realizó ningún entrenamiento, ni forward pass de profesor, ni recopilación de activaciones, ni destilación. La visión está deshabilitada; solo existe un stub de compatibilidad visual de 49.056 parámetros con ceros para que el wrapper de Transformers pueda construir el submódulo visual, pero no es un modelo de visión.

## Capacidades

- Generación de texto: el modelo puede producir texto, pero sin recuperación de calidad, su salida será de baja fidelidad y no fiable.
- Razonamiento: no se ha evaluado; se espera que sea muy limitado debido a la reducción de capas y expertos.
- Código y matemáticas: no se ha evaluado; probablemente muy degradado.
- Tool calling / function calling: no disponible, no se ha implementado ni probado.
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingües: no disponibles.
- Capacidades especiales: ninguna; la visión está deshabilitada y no hay modo thinking.

## Casos de uso

- Investigación en cirugía de modelo: sirve como línea base reproducible para estudiar cómo afecta la reducción de capas y expertos a la calidad del modelo, comparando con la variante funcional-mosaic de cuatro donantes que el autor menciona como revisión separada.
- Pruebas de integración de Transformers: permite verificar que el wrapper de HuggingFace puede cargar y ejecutar un modelo con geometría reducida, útil para desarrolladores que trabajan en herramientas de cirugía de modelos.
- Desarrollo de técnicas de inicialización de routers: los centroides de clúster usados para los routers pueden servir como punto de partida para experimentos de inicialización sin entrenamiento.
- Validación de pipelines de cuantización mixta FP8/BF16: al conservar los bytes originales de los expertos, puede usarse para probar herramientas que manejan formatos mixtos.
- Benchmark de overhead de memoria: con 8,9B parámetros, puede usarse para medir el consumo de VRAM en configuraciones de baja profundidad, aunque no es representativo de un modelo real.
- No es adecuado para ningún caso de uso de producción, atención al cliente, generación de código o análisis de datos, dado que no tiene calidad recuperada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que no se debe usar este modelo como referencia de rendimiento y que no se ha realizado ninguna evaluación directa del estudiante.

## Requisitos de hardware

- VRAM estimada para inferencia: con 8,9B parámetros en FP8, aproximadamente 9-10 GB; en BF16, unos 18 GB. Sin embargo, al ser un dummy sin calidad, no se recomienda su uso en inferencia real.
- GPU recomendadas: cualquier GPU con al menos 12 GB de VRAM para FP8 (por ejemplo, RTX 4070 Ti, RTX 4080, A10) o 24 GB para BF16 (RTX 3090, RTX 4090, A100). No hay datos de latencia ni throughput.
- Opciones de despliegue: compatible con Transformers, por lo que puede cargarse con vLLM, TGI o llama.cpp si se convierte a GGUF, aunque no se ha probado.
- No se recomienda su uso en producción; es solo para experimentación.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| GLM-5.3-Flash (base) | 320B total, 18B activo | no disponible | no disponible | Modelo oficial de Z.ai, multimodal, con calidad |
| GLM-5.3-Flash-9B-Surgery-Dummy | 8,9B | no disponible | no disponible | Experimental, sin calidad, solo texto |
| Otros modelos 9B (p.ej. Llama 3.2 8B, Qwen 2.5 7B) | 7-9B | 128K o más | variada | Modelos con calidad y soporte |

No hay comparables directos porque este dummy no es un modelo funcional; es un artefacto de investigación. La comparación con el base muestra la reducción drástica de parámetros y la pérdida de capacidades multimodales.

## Limitaciones y advertencias

- No es un modelo de producción: el autor lo declara explícitamente como "dummy" y "test-model", sin calidad recuperada.
- Sin entrenamiento ni destilación: no ha pasado por ningún proceso de ajuste, por lo que su salida será incoherente o de baja calidad.
- Visión deshabilitada: el stub visual es solo para compatibilidad, no procesa imágenes.
- Sesgos y alucinaciones: no se han evaluado, pero se espera que sean severos debido a la falta de entrenamiento.
- Licencia no disponible: no se puede determinar si es apto para uso comercial.
- Riesgo de confusión: su nombre similar al modelo base puede inducir a error; no debe confundirse con GLM-5.3-Flash oficial.
- Reproducibilidad: aunque se incluyen `surgery_plan.json` y `surgery_manifest.json` con hashes, la falta de evaluación impide validar su comportamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/imvladikon/GLM-5.3-Flash-9B-Surgery-Dummy
- Modelo base zai-org/GLM-5.3-Flash: https://huggingface.co/zai-org/GLM-5.3-Flash
- Versión de unsloth del base: https://huggingface.co/unsloth/GLM-5.3-Flash
- Notas de arquitectura de GLM-5.3-Flash por Sebastian Raschka: https://sebastianraschka.com/blog/2026/glm-5-3-flash-architecture-notes.html
- Guía de ejecución local de unsloth: https://unsloth.ai/docs/models/glm-5.3-flash
- Artículo de OpenLM sobre GLM-5.3: https://openlm.ai/glm-5.5/
