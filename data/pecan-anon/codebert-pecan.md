# pecan-anon/codebert-pecan

## Resumen

CodeBERT-PECAN es un modelo de clasificación de texto derivado de `microsoft/codebert-base`, afinado por el usuario `pecan-anon` sobre el benchmark PECAN. Su tarea es identificar el lenguaje de programación de un fragmento crudo de código de 512 bytes, sin disponer del nombre de fichero ni de la extensión, cubriendo un conjunto de 319 lenguajes. Es, por tanto, una herramienta especializada en detección de lenguaje para pipelines de análisis estático, indexación de repositorios o triaje de código sin metadatos.

El modelo parte de la arquitectura RoBERTa de CodeBERT (124,9 millones de parámetros, encoder transformer) y añade una cabeza de clasificación sobre 319 clases. Se distribuye en formato safetensors con licencia MIT, lo que facilita su integración tanto en investigación como en productos comerciales sin restricciones adicionales.

Su relevancia actual radica en la dificultad práctica de clasificar código cuando falta contexto de fichero: repositorios mal etiquetados, fragmentos extraídos de logs, snippets en foros o código ofuscado. El autor reporta una accuracy de 0,9575 y un macro-F1 de 0,9304 en el split de test, métricas que, si se confirman de forma independiente, lo sitúan como una referencia útil para esta tarea concreta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (RoBERTa, base de CodeBERT) con cabeza de clasificación |
| Parametros totales | 124.890.943 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (longitud de entrada del fragmento de código) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el modelo clasifica lenguajes de programación, no lenguajes naturales) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la de `microsoft/codebert-base`: un encoder transformer tipo RoBERTa con 12 capas, atención multi-cabeza y embeddings entrenados originalmente sobre código fuente y lenguaje natural emparejados. Sobre este backbone, el autor ha añadido una cabeza de clasificación para 319 clases, una por lenguaje de programación, y ha realizado un fine-tuning supervisado sobre el benchmark PECAN.

El detalle del proceso de entrenamiento no está disponible en la información proporcionada: no se especifican el número de tokens de entrenamiento, la composición exacta del dataset PECAN, si hubo aumento de datos, ni si se aplicaron técnicas de regularización o búsqueda de hiperparámetros. La entrada son fragmentos crudos de 512 bytes, lo que condiciona el preprocesado: el modelo debe inferir el lenguaje a partir de la sintaxis y los patrones léxicos presentes en ese fragmento, sin extensión ni nombre de fichero.

## Capacidades

- Clasificación de lenguaje de programación a partir de fragmentos crudos de código de hasta 512 bytes.
- Cobertura de 319 lenguajes de programación en una única cabeza de clasificación.
- Funciona sin metadatos de fichero (sin extensión, sin nombre, sin ruta), lo que lo hace apto para código extraído de fuentes heterogéneas.
- Salida de clasificación multi-clase con probabilidades por lenguaje, utilizable para umbrales de confianza y para detección de casos ambiguos.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo discriminativo, no generativo.
- No tiene capacidades multimodales (visión, audio) ni modo de pensamiento.
- Capacidades multilingües en el sentido de lenguajes de programación, no de lenguajes naturales.

## Casos de uso

- Indexación de repositorios sin extensión fiable: el modelo clasifica cada fragmento de código y permite etiquetar ficheros mal nombrados o sin extensión antes de pasarlos a un analizador estático específico del lenguaje.
- Triaje de snippets en foros y documentación: al procesar texto mixto (prosa y bloques de código), se puede aislar el bloque y clasificar su lenguaje para aplicar resaltado sintáctico o validación.
- Detección de código ofuscado o poliglota: fragmentos que no declaran su lenguaje pueden clasificarse para decidir qué parser o linter aplicar, reduciendo errores de análisis.
- Enriquecimiento de datasets de código: al construir corpus para entrenamiento de modelos generativos, el clasificador permite filtrar y balancear por lenguaje sin depender de metadatos.
- Seguridad y análisis de dependencias: en pipelines de escaneo de código, clasificar el lenguaje de fragmentos embebidos en configuraciones, scripts o plantillas ayuda a seleccionar las reglas de análisis adecuadas.
- Gestión de código heredado: en migraciones o auditorías de repositorios antiguos con extensiones inconsistentes, el modelo permite reconstruir la distribución real de lenguajes presentes.

## Benchmarks y rendimiento

| Benchmark | Metrica | Resultado |
|---|---|---|
| PECAN (split de test) | Accuracy | 0,9575 |
| PECAN (split de test) | Macro-F1 | 0,9304 |

No se han publicado en la información disponible resultados comparativos con otros modelos en MMLU, HumanEval, GSM8K ni en tareas distintas a la clasificación de lenguaje de programación.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,5 GB para los pesos (124,9 M de parámetros), más overhead de activaciones y tokenizador; en la práctica, menos de 1 GB.
- VRAM estimada en fp16: aproximadamente 0,25 GB para los pesos.
- Cabe holgadamente en GPUs de consumo: RTX 3060, RTX 4060, RTX 4090, e incluso en CPU para lotes pequeños.
- GPUs de datacenter (A100, H100) no son necesarias; solo tendrían sentido para throughput masivo por lotes.
- Opciones de despliegue: `transformers` (PyTorch), Text Embeddings Inference (el tag `text-embeddings-inference` está presente), y servidores compatibles con endpoints de Hugging Face. No se indica soporte explícito de vLLM, llama.cpp u Ollama, y al ser un modelo de clasificación (no generativo) su encaje en esos runtimes es limitado.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CodeBERT-PECAN | 124,9 M | 512 tokens | Clasificación de lenguaje (319 clases) | MIT | Hugging Face |
| microsoft/codebert-base | 124,9 M | 512 tokens | Representaciones de código y NL; base para fine-tuning | MIT | Hugging Face |
| CodeBERT original (paper) | 125 M aprox. | 512 tokens | Enmascarado y emparejamiento código-texto | MIT (repo) | GitHub / Hugging Face |

No se dispone de datos de benchmarks comparativos con otros clasificadores de lenguaje de programación en la información proporcionada, por lo que la comparación se limita a parámetros, contexto y licencia.

## Limitaciones y advertencias

- El modelo solo ha sido evaluado en el benchmark PECAN según el autor; no hay validación independiente publicada en la información disponible.
- La ventana de 512 bytes limita la cantidad de contexto: fragmentos muy cortos o muy genéricos (por ejemplo, una sola línea con sintaxis común a varios lenguajes) pueden producir clasificaciones ambiguas.
- Riesgo de sesgo hacia los lenguajes sobrerrepresentados en el dataset PECAN; el macro-F1 (0,9304) es inferior a la accuracy (0,9575), lo que sugiere peor rendimiento en clases minoritarias.
- No es un modelo generativo: no puede explicar su decisión ni generar código; solo devuelve etiquetas y probabilidades.
- No hay información sobre el rendimiento en lenguajes de programación poco comunes o en dialectos específicos.
- Licencia MIT: permite uso comercial y modificación, pero conviene conservar el aviso de copyright y verificar la licencia del modelo base (`microsoft/codebert-base`), que también es MIT según la información disponible.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado en 2026; se trata de un artefacto reciente y sin adopción comunitaria verificable.
- No se especifican limitaciones de idioma natural porque el modelo no procesa lenguaje natural como tarea principal.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pecan-anon/codebert-pecan
- Modelo base: https://huggingface.co/microsoft/codebert-base
- Código del benchmark y artefactos de evaluación: https://anonymous.4open.science/r/pecan-benchmark
