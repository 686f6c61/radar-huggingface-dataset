# developerjeremylive/GLM-5.3-Flash-9B-Surgery-Dummy-etheroi

## Resumen

GLM-5.3-Flash-9B-Surgery-Dummy-etheroi es un checkpoint experimental creado por el usuario developerjeremylive a partir del modelo base zai-org/GLM-5.3-Flash de Z.ai. Se trata de un modelo de cirugía de arquitectura (model surgery) que conserva la geometría de anchura y kernels del GLM-5.3-Flash original, pero reduce drásticamente su profundidad y el número de expertos MoE. El objetivo declarado es probar técnicas de poda y reconstrucción de expertos sin necesidad de entrenamiento adicional, aunque el propio autor advierte que el modelo no ha recuperado calidad funcional y no debe usarse en producción ni para benchmarks.

Con 8.895.671.964 parámetros totales (aproximadamente 8,9 mil millones), el modelo reduce el decoder de 45 capas a 10 y cada capa MoE enrutada de 288 expertos a 32. La visión está deshabilitada de forma intencional, incluyendo solo un stub de compatibilidad visual de 49.056 parámetros. Su relevancia actual es principalmente metodológica: demuestra un enfoque de cirugía de modelos sin pasos hacia adelante, caché de activaciones, destilación ni entrenamiento de parámetros, usando mosaicos funcionales de donantes con escalas FP8 E4M3 frescas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido (atención dispersa y lineal) basado en GLM-5.3-Flash, con decoder reducido de 45 a 10 capas y MoE de 288 a 32 expertos por capa |
| Parametros totales | 8.895.671.964 (8,9 B) |
| Parametros activos | no disponible (al ser MoE, los activos dependen del enrutado; el autor no especifica el valor) |
| Longitud de contexto | no disponible (el modelo base GLM-5.3-Flash soporta 1.048.576 tokens, pero este checkpoint no declara su contexto efectivo) |
| Tipos de cuantizacion | FP8 E4M3 en matrices de expertos (escalas frescas por bloque 128x128); el repo contiene pesos en safetensors |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (repo de 11,3 GB) |

Nota: el modelo base zai-org/GLM-5.3-Flash es nativamente multimodal (imagen y vídeo) con 1M de contexto, razonamiento siempre activo, búsqueda web y tool calling, pero este checkpoint deshabilita visión y no garantiza esas capacidades.

## Arquitectura y entrenamiento

El checkpoint mantiene la geometría de anchura y kernels del GLM-5.3-Flash original, pero reduce el decoder de 45 a 10 capas (seleccionando las capas fuente `[0, 1, 2, 3, 8, 18, 25, 31, 38, 44]`) y cada capa MoE enrutada de 288 a 32 expertos. Cada experto enrutado es un mosaico funcional de cuatro donantes: 512 unidades SwiGLU acopladas seleccionadas individualmente de cada donante (filas gate/up más columnas down correspondientes), una proyección down con escala de forma cerrada que iguala la varianza de salida sintética, y las tres matrices de expertos reciben escalas FP8 E4M3 frescas por bloque 128x128. Las filas del router usan clústeres equilibrados en el espacio del router.

No se utilizó ningún paso hacia adelante del donante, caché de activaciones, destilación ni entrenamiento de parámetros. El proceso completo es de cirugía estática: selección de capas, reconstrucción de expertos y escalado FP8. El autor indica que se requiere evaluación solo con el estudiante antes de considerar el modelo funcionalmente útil. La visión está deshabilitada intencionalmente; existe un stub de compatibilidad visual de 49.056 parámetros con ceros solo porque el wrapper de Transformers construye un submódulo visual, pero no es un modelo de visión.

## Capacidades

- Generación de texto: el modelo puede producir texto, pero el autor advierte que no ha recuperado calidad y no debe usarse como modelo de producción ni para benchmark.
- Razonamiento: no verificado; el modelo base GLM-5.3-Flash tiene razonamiento siempre activo, pero este checkpoint no lo garantiza.
- Tool calling y funciones: no verificado; el modelo base lo soporta, pero este checkpoint experimental no lo declara.
- Multimodalidad: deshabilitada. No procesa imágenes ni vídeo, a pesar del stub visual.
- Contexto largo: no declarado; el modelo base soporta 1M de tokens, pero la poda de capas puede afectar la coherencia en contextos largos.
- Capacidades especiales: ninguna adicional más allá de la experimentación con cirugía de modelos.

## Casos de uso

Dado que el modelo es explícitamente experimental y no apto para producción, los casos de uso realistas son limitados y de carácter investigador:

- Investigación en cirugía de modelos: sirve como banco de pruebas para validar técnicas de poda de capas y reconstrucción de expertos MoE sin entrenamiento. Los investigadores pueden comparar el comportamiento del modelo podado con el original para estudiar la degradación funcional.
- Desarrollo de métodos de compresión: el enfoque de mosaicos de donantes y escalas FP8 frescas puede servir de referencia para nuevas técnicas de compresión de modelos grandes en entornos con restricciones de recursos.
- Evaluación de calidad tras poda: permite medir el impacto de reducir el número de capas y expertos en tareas de generación de texto, razonamiento básico y coherencia, estableciendo líneas base para futuras iteraciones.
- Pruebas de infraestructura: útil para validar pipelines de despliegue con modelos MoE cuantizados en FP8, aunque no para uso final.
- Docencia y formación: puede usarse en cursos de arquitecturas de modelos y optimización para ilustrar conceptos de MoE, cuantización y poda estructural.
- Desarrollo de herramientas de depuración: los archivos `surgery_plan.json` y `surgery_manifest.json` permiten estudiar trazabilidad de pesos y reproducibilidad en flujos de cirugía de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que el modelo "no ha recuperado calidad" y que se requiere evaluación solo con el estudiante antes de considerarlo funcionalmente útil. No hay datos de MMLU, HumanEval, GSM8K ni otros.

## Requisitos de hardware

- VRAM estimada: no disponible formalmente, pero con 8,9 B de parámetros y pesos FP8, se estima que la inferencia requiere aproximadamente 9-11 GB de VRAM en FP8, y algo más en FP16 (si se cargan los pesos sin cuantizar).
- GPU recomendadas: una GPU con al menos 12 GB de VRAM (por ejemplo, RTX 3060 12GB, RTX 4070, RTX 4090) podría ejecutar el modelo en FP8. Para FP16 se necesitaría al menos 16-20 GB.
- En consumer GPU: sí, es factible en GPUs de gama media-alta con cuantización FP8, aunque el rendimiento real no está medido.
- Opciones de despliegue: al ser un modelo de transformers estándar con safetensors, puede cargarse con Hugging Face Transformers. No se menciona compatibilidad con vLLM, llama.cpp, Ollama o TGI, aunque por su naturaleza MoE y FP8 podría adaptarse con herramientas que soporten esas características.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

Comparación con el modelo base y alternativas de tamaño similar en la misma categoría (modelos MoE de ~9B parámetros):

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| GLM-5.3-Flash-9B-Surgery-Dummy-etheroi | 8,9 B | no disponible | no disponible | Experimental, sin calidad recuperada |
| zai-org/GLM-5.3-Flash (base) | no disponible (se estima >9B por el número de expertos y capas) | 1.048.576 | MIT (según OpenLM.ai) | Multimodal, razonamiento, tool calling, búsqueda web |
| Modelos MoE de ~8-10B (p.ej. Mixtral 8x7B, aunque tiene 47B totales) | 47 B totales, 13 B activos | 32k | Apache 2.0 | MoE denso, sin poda experimental |

La comparativa es limitada porque este checkpoint es una variante experimental de GLM-5.3-Flash, no un modelo independiente. No hay datos de rendimiento para comparar.

## Limitaciones y advertencias

- Modelo experimental: el autor lo define como "dummy" y "test-model", no es una versión oficial de Z.ai y no ha recuperado calidad funcional.
- No apto para producción: no debe usarse en aplicaciones reales ni como modelo de benchmark.
- Visión deshabilitada: el stub visual es solo compatibilidad técnica, no procesa imágenes ni vídeo.
- Sin datos de rendimiento: no hay benchmarks publicados, por lo que no se puede evaluar su capacidad real.
- Riesgo de alucinación y errores: al estar podado sin entrenamiento, es probable que genere texto incoherente o incorrecto en muchas tareas.
- Licencia no disponible: no se puede determinar si permite uso comercial o restricciones adicionales.
- Contexto no verificado: aunque el modelo base soporta 1M de tokens, la poda puede degradar el rendimiento en contextos largos; no hay evidencia de que este checkpoint mantenga esa capacidad.
- Reproducibilidad: los archivos `surgery_plan.json` y `surgery_manifest.json` documentan el proceso, pero la ausencia de evaluación independiente impide validar la metodología.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/developerjeremylive/GLM-5.3-Flash-9B-Surgery-Dummy-etheroi
- Modelo base zai-org/GLM-5.3-Flash (referencia): https://huggingface.co/zai-org/GLM-5.3-Flash (no verificado directamente, pero mencionado en la model card)
- Documentación de GLM-5.3-Flash en EmpirioLabs: https://docs.empiriolabs.ai/models/glm-5-3-flash
- API de GLM-5.3-Flash en DeepInfra: https://deepinfra.com/zai-org/GLM-5.3-Flash/api
- Información sobre GLM-5.3 en OpenLM.ai: https://openlm.ai/glm-5.5/
- Variante similar de otro usuario: https://huggingface.co/imvladikon/GLM-5.3-Flash-9B-Surgery-Dummy
