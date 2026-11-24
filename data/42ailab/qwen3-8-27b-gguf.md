# 42ailab/Qwen3.8-27B-GGUF

## Resumen

Qwen3.8-27B es un modelo de lenguaje de 27.320.697.856 parámetros (aproximadamente 27,3 mil millones) desarrollado por el equipo Qwen de Alibaba y publicado bajo licencia Apache-2.0. El repositorio analizado, `42ailab/Qwen3.8-27B-GGUF`, es una redistribución en formato GGUF preparada por 42ailab para su integración en la aplicación de escritorio 42model; los archivos son byte a byte idénticos a los publicados por unsloth en `unsloth/Qwen3.8-27B-GGUF`, que realizó la conversión. El modelo pertenece a una nueva generación de la familia Qwen y está orientado a tareas de programación y de agentes, con capacidad de visión integrada (pipeline `image-text-to-text`).

La relevancia de esta ficha radica en que ofrece un modelo de 27B con visión y soporte para flujos agénticos en un formato cuantizado (UD-Q4_K_M, 15,33 GiB) que puede ejecutarse en hardware de consumo de gama alta, manteniendo la licencia permisiva Apache-2.0 del modelo original. El repositorio incluye además un proyector de visión separado (`mmproj-F16.gguf`, 884,6 MiB) necesario para el procesamiento de imágenes en llama.cpp y derivados.

No se dispone de información publicada en la model card sobre arquitectura interna, longitud de contexto, composición del dataset de entrenamiento ni resultados de benchmarks; los datos que siguen se limitan a lo verificable en el repositorio y en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo transformer de la familia Qwen, sin detalle en la model card) |
| Parametros totales | 27.320.697.856 (27,3 B) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | UD-Q4_K_M (archivo principal); proyector de vision en F16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (`Qwen3.8-27B-UD-Q4_K_M.gguf`, `mmproj-F16.gguf`) |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura interna del modelo (tipo de atención, capas, cabezas, uso de MoE o de mecanismos híbridos). Lo único verificable es que se trata de un modelo de la nueva generación Qwen con 27,3 B de parámetros y que incorpora un proyector de visión independiente en formato F16, lo que confirma una arquitectura multimodal con codificador visual acoplado al modelo de lenguaje. El pipeline declarado en Hugging Face es `text-generation`, y las etiquetas incluyen `image-text-to-text`, coherente con la capacidad de visión.

Tampoco se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron etapas de RLHF, DPO u otras técnicas de alineación. La conversión a GGUF fue realizada por unsloth y redistribuida sin modificaciones por 42ailab; no se documentan innovaciones técnicas adicionales (decodificación especulativa, atención lineal, etc.) en la model card.

## Capacidades

- Generación de texto conversacional y de propósito general, según la etiqueta `conversational` del repositorio.
- Capacidad de visión integrada (pipeline `image-text-to-text`), con proyector `mmproj-F16.gguf` para el procesamiento de imágenes.
- Orientación declarada a tareas de programación y de agentes, según la descripción del autor.
- Compatibilidad con endpoints (`endpoints_compatible`), lo que facilita su integración en servicios de inferencia.
- Uso de imatrix en la cuantización (`imatrix`), técnica que mejora la calidad de los GGUF cuantizados.
- Soporte de tool calling / function calling: no confirmado en la información disponible.
- Capacidades multilingües: no disponibles.
- Modo de razonamiento (thinking mode): no confirmado en la información disponible.

## Casos de uso

- Asistencia de programación en local: el modelo, con 27,3 B de parámetros y cuantización UD-Q4_K_M de 15,33 GiB, puede ejecutarse en una estación de trabajo con GPU de consumo de gama alta para autocompletado, revisión de código y generación de parches sin enviar código a servicios externos.
- Análisis de documentos con imágenes: gracias al proyector de visión, puede procesar capturas de pantalla, diagramas o documentos escaneados junto con texto, útil para extracción de información en flujos de digitalización.
- Agentes autónomos de desarrollo: su orientación declarada a tareas de agentes permite integrarlo en bucles de razonamiento multi-paso para tareas como resolución de issues o generación de tests, siempre que se valide el soporte real de tool calling.
- Despliegue en escritorio con 42model: el repositorio está empaquetado para descarga directa mediante `42model download qwen3.8:27b-ud-q4_k_m`, lo que simplifica la puesta en marcha para usuarios finales.
- Prototipado de asistentes conversacionales: la etiqueta `conversational` y la compatibilidad con endpoints permiten montar un servicio de chat interno con llama.cpp o servidores compatibles.
- Inferencia en entornos con requisitos de licencia permisiva: la licencia Apache-2.0 permite uso comercial y modificación sin las restricciones de licencias copyleft o de uso limitado.
- Evaluación comparativa de modelos abiertos: al ser un GGUF reproducible con digests sha256 verificables, es adecuado para experimentos de evaluación reproducibles en local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 15,3 GiB para los pesos en UD-Q4_K_M, más el proyector de visión (884,6 MiB) y el espacio de contexto y caché KV; en la práctica se recomienda al menos 18-20 GiB de VRAM para contexto moderado.
- GPU recomendadas: NVIDIA RTX 4090 (24 GB), RTX 3090 (24 GB), A100 40/80 GB, H100; en GPUs de 16 GB no cabe la cuantización Q4_K_M completa con visión.
- Cabe en GPU de consumo: sí, en RTX 4090, RTX 3090 y modelos con 24 GB o más; también es posible la ejecución parcial en CPU con llama.cpp si la VRAM es insuficiente.
- Opciones de despliegue: llama.cpp y derivados (Ollama, LM Studio, koboldcpp), servidores compatibles con endpoints; vLLM y TGI no soportan GGUF de forma nativa en todos los casos, por lo que se recomienda verificar la versión.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.8-27B (este) | 27,3 B | no disponible | Sí | Apache-2.0 | GGUF |
| Modelos Qwen de generaciones anteriores (p. ej. Qwen2.5-32B) | ~32 B | no disponible en esta ficha | No en todas las variantes | Apache-2.0 (mayoría) | safetensors, GGUF |
| Gemma 3 27B | 27 B | no disponible en esta ficha | Sí (variante multimodal) | Gemma Terms of Use | safetensors, GGUF |
| Mistral Small 3.1 24B | 24 B | no disponible en esta ficha | Sí | Apache-2.0 | safetensors, GGUF |

La comparación se limita a categorías y licencias; no se dispone de datos de rendimiento comparativo en la información proporcionada, por lo que no se pueden establecer conclusiones cuantitativas.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos, riesgos de alucinación ni evaluaciones de seguridad; se recomienda validación empírica antes de producción.
- No se especifican los idiomas soportados ni la calidad relativa por idioma; el uso en castellano debe evaluarse empíricamente.
- La longitud de contexto no está documentada, lo que impide planificar cargas de trabajo con ventanas largas sin pruebas previas.
- El repositorio es una redistribución de terceros (42ailab) de una conversión de unsloth; aunque los digests sha256 permiten verificar integridad, la responsabilidad del modelo original recae en el equipo Qwen.
- La licencia Apache-2.0 permite uso comercial, pero conviene revisar el archivo `LICENSE` incluido y las condiciones del modelo original en ModelScope.
- El soporte de tool calling y de modo de razonamiento no está confirmado en la información disponible; no debe asumirse en diseños de agentes.
- La cuantización UD-Q4_K_M introduce una pérdida de precisión respecto a los pesos originales en safetensors; para tareas sensibles a la calidad numérica se recomienda evaluar cuantizaciones superiores (Q5, Q6, Q8) si el hardware lo permite.
- El proyector de visión debe cargarse junto con el modelo para habilitar el procesamiento de imágenes; su omisión desactiva esa capacidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/42ailab/Qwen3.8-27B-GGUF
- Repositorio original de la conversión GGUF (unsloth): https://www.modelscope.cn/models/unsloth/Qwen3.8-27B-GGUF
- Modelo original en ModelScope: https://modelscope.cn/models/42ailab/Qwen3.8-27B-GGUF
- Sitio de 42ailab: https://42ailab.com
- Aplicación 42model: https://42model.com
