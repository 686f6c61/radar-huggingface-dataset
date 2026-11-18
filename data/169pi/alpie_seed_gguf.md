# 169Pi/Alpie_Seed_GGUF

## Resumen

Alpie Seed 9B GGUF es la distribución cuantizada en formato GGUF del modelo vision-lenguaje Alpie Seed 9B, desarrollado por 169Pi AI. El modelo base es un transformer multimodal de aproximadamente 8.953 millones de parámetros (8,95 B) que acepta entradas de texto e imagen (pipeline `image-text-to-text`) y está pensado para inferencia local en escritorio, estación de trabajo y hardware móvil compatible. Esta variante GGUF existe precisamente para facilitar ese despliegue local: ofrece niveles de cuantización de 2, 3 y 4 bits que permiten ajustar el equilibrio entre tamaño, memoria, latencia y calidad de salida.

El modelo base declara una ventana de contexto nativa de 262.000 tokens, licencia Apache 2.0 y capacidades de razonamiento multi-paso, matemáticas, generación y depuración de código, comprensión de imágenes, OCR, interpretación de gráficos y procesamiento de contexto largo. La relevancia actual reside en que combina multimodalidad y contexto muy largo en un tamaño de 9B que, cuantizado, cabe en hardware de consumo y hasta en un teléfono mediante runtimes como llama.cpp o PocketPal.

La ficha se basa exclusivamente en la información publicada en el repositorio de Hugging Face y en la model card del autor. No se dispone de detalles sobre la composición del dataset de entrenamiento, el proceso de alineación ni resultados de benchmarks estándar, por lo que esos apartados se marcan como no disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (vision-lenguaje); detalles internos no disponibles |
| Parámetros totales | 8.953.803.264 (≈8,95 B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.000 tokens nativos en el modelo base; 256K en los tags de Ollama |
| Tipos de cuantización | 2 bits (Q2), 3 bits (Q3) y 4 bits (Q4) en GGUF |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repositorio); el modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo base Alpie Seed 9B es un transformer multimodal de 8,95 B de parámetros que procesa entradas de texto e imagen (pipeline `image-text-to-text`). La model card no detalla la arquitectura interna (tipo de atención, capas, dimensión oculta, codificador visual ni mecanismo de fusión multimodal), por lo que estos datos se consideran no disponibles. Tampoco se especifica si emplea atención lineal, decodificación especulativa ni otras innovaciones de eficiencia.

En cuanto al entrenamiento, no se publica el número de tokens, la composición del dataset, ni si hubo fases de RLHF, DPO u otro tipo de alineación. La única información técnica cuantitativa aportada por el autor es una comparación de perplejidad frente a Qwen, en la que Alpie Seed obtiene valores inferiores (mejores) tanto en BF16 como en Q4; no se incluyen las cifras concretas en la información disponible. Esta variante GGUF es una conversión cuantizada del modelo base, no un reentrenamiento.

## Capacidades

- Generación de texto y razonamiento multi-paso orientado a resolución de problemas.
- Razonamiento matemático y resolución de problemas cuantitativos.
- Generación de código y depuración (debugging).
- Explicaciones técnicas y asistencia en tareas de ingeniería.
- Comprensión de imágenes y razonamiento visual.
- OCR y comprensión de documentos.
- Interpretación de gráficos y de información visual.
- Procesamiento de contexto largo de hasta 262K tokens (sujeto a soporte del runtime y memoria disponible).
- Modalidad conversacional (tag `conversational`).
- Compatibilidad con endpoints (`endpoints_compatible`).

No se documenta en la información disponible soporte explícito de tool calling, function calling, agentes autónomos, modo thinking, audio ni otras modalidades adicionales.

## Casos de uso

- Asistente de documentación técnica con OCR: el modelo puede ingerir capturas de pantalla, diagramas o PDFs escaneados y extraer texto y estructura gracias a sus capacidades de OCR y comprensión de documentos, integrándose en flujos de extracción de información.
- Análisis de gráficos e informes financieros: la interpretación de gráficos y de información visual permite resumir dashboards o figuras de informes directamente desde la imagen, sin necesidad de transcripción manual.
- Inferencia local en escritorio: con la cuantización Q4 y un runtime compatible con GGUF (llama.cpp, Ollama), puede desplegarse en estaciones de trabajo sin GPU de gama alta, manteniendo razonamiento y código.
- Ejecución en móvil totalmente offline: la model card demuestra su funcionamiento en un teléfono mediante PocketPal; útil para asistentes personales sin conectividad ni envío de datos a la nube.
- Asistencia a la programación en entornos con requisitos de privacidad: la generación y depuración de código puede ejecutarse en local, evitando exponer el código fuente a servicios externos.
- Procesamiento de documentos largos: con hasta 262K tokens de contexto nativo (limitado por la memoria del runtime), puede resumir o responder preguntas sobre contratos, manuales o expedientes extensos.
- Prototipado rápido con Ollama: el tag `alpie-seed:vision` (6,6 GB, 256K de contexto, entrada texto e imagen) permite levantar un endpoint multimodal con un solo comando para pruebas de concepto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor únicamente reporta una comparación cualitativa de perplejidad frente a Qwen, indicando que Alpie Seed obtiene valores inferiores (mejores) tanto en BF16 como en Q4, sin aportar las cifras numéricas.

## Requisitos de hardware

- VRAM/RAM estimada según los tamaños publicados en Ollama: Q2 ≈ 3,8 GB, Q3 ≈ 4,6 GB, versión por defecto ≈ 5,6 GB (texto) y variante visión ≈ 6,6 GB. Son tamaños de artefacto; el consumo real depende de la longitud de contexto y de la configuración del runtime.
- El repositorio GGUF completo ocupa 30,5 GB, lo que incluye todas las variantes de cuantización publicadas.
- GPU recomendadas: no especificadas por el autor. Por tamaño, las variantes Q2–Q4 son aptas para GPUs de consumo con 6–8 GB o más de VRAM; para contexto largo conviene VRAM adicional o uso de RAM del sistema.
- Cabe en GPU de consumo: sí, previsiblemente en tarjetas con 8 GB o más para Q4; las variantes Q2/Q3 apuntan a dispositivos con memoria más limitada.
- Despliegue: llama.cpp, Ollama (`ollama run 169pi/alpie-seed`), PocketPal en móvil; también disponible en Kaggle Models.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Multimodal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Alpie Seed 9B (GGUF) | ≈8,95 B | 262K nativo | Sí (texto e imagen) | Apache 2.0 | HF, Ollama, Kaggle |
| Qwen (referencia del autor) | no disponible | no disponible | no disponible | no disponible | no disponible |
| Alternativas de 9B comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

El autor compara la perplejidad frente a Qwen sin especificar la variante concreta ni los valores numéricos, por lo que no es posible establecer una comparativa cuantitativa fiable con modelos de la misma categoría a partir de la información disponible.

## Limitaciones y advertencias

- No se documentan sesgos conocidos ni evaluaciones de seguridad; al ser un modelo sin información de alineación publicada, el riesgo de sesgo y de alucinación debe asumirse y mitigarse en producción.
- La ventana de 262K tokens es la capacidad nativa del modelo base; el contexto realmente utilizable depende del runtime, la configuración y la memoria disponible, y puede degradarse en longitudes extremas.
- La funcionalidad multimodal requiere un runtime compatible y los componentes de visión correspondientes; no todos los tags de Ollama soportan imagen (solo `alpie-seed:vision`).
- No se especifican los idiomas soportados; el rendimiento multilingüe, especialmente en castellano, no está verificado.
- La licencia Apache 2.0 permite uso comercial, pero el usuario debe verificar las licencias de los componentes del runtime y de los datasets de origen, no detallados.
- La cuantización a 2 y 3 bits puede degradar la calidad de salida frente a Q4 o BF16; conviene validar la variante elegida en la tarea concreta.
- No hay benchmarks publicados que permitan estimar el rendimiento en tareas específicas antes de desplegar.

## Enlaces

- Repositorio GGUF en Hugging Face: https://huggingface.co/169Pi/Alpie_Seed_GGUF
- Modelo base: https://huggingface.co/169Pi/Alpie_seed
- Ollama: https://ollama.com/169pi/alpie-seed
- Kaggle Models: https://www.kaggle.com/models/alpie/alpie-seed-9b
- GitHub del autor: https://github.com/169Pi
- LinkedIn: https://www.linkedin.com/company/169pi
- Instagram: https://www.instagram.com/169pi.ai/
- YouTube: https://www.youtube.com/@169pi
- X: https://x.com/169Pi_ai
- Demo en móvil (PocketPal): https://huggingface.co/169Pi/Alpie_Seed_GGUF/blob/main/alpie_offline_mobile_demo.mp4
- PocketPal (runtime): https://github.com/a-ghorbani/pocketpal-ai
