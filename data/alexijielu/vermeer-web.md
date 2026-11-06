# alexijielu/vermeer-web

## Resumen

Vermeer-web es un paquete de artefactos de despliegue en navegador para la aplicación Vermeer, un sistema de modelado generativo autorregresivo de microscopía orientado a la predicción de localización de proteínas. No se trata de un modelo entrenado desde cero ni de un fine-tuning, sino de una colección de grafos de ejecución ONNX y fragmentos de pesos en FP32 convertidos a partir de los modelos originales de Microsoft (Vermeer-B, Vermeer-L y Vermeer-XL), del modelo de embeddings de proteínas ESM-C-600M de Chan Zuckerberg Biohub y del decodificador de imágenes LlamaGen VQ-16 de FoundationVision. El autor del repositorio es alexijielu y la licencia declarada es MIT.

El interés del paquete reside en que permite ejecutar inferencia local en el navegador mediante WebGPU sin enviar secuencias de proteínas a un servidor, lo que resulta relevante para investigación biológica con requisitos de privacidad. El repositorio completo ocupa aproximadamente 7,4 GB, aunque la aplicación descarga únicamente la variante de Vermeer seleccionada y los componentes compartidos (ESM-C y decodificador).

La relevancia actual es acotada: se publicó en octubre de 2026, cuenta con cero descargas y cero likes, y su valor es fundamentalmente de infraestructura reproducible para la aplicación Vermeer, no como modelo autónomo reutilizable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Grafos ONNX exportados de Vermeer (modelado autorregresivo de microscopía), ESM-C-600M (transformer de proteínas, 36 capas) y LlamaGen VQ-16 (decodificador de imágenes) |
| Parametros totales | No disponible (el paquete agrupa tres variantes de Vermeer más ESM-C-600M y el decodificador; el tamaño del repo es de 7,4 GB en FP32) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible; los artefactos publicados son FP32 |
| Idiomas soportados | No disponible; el dominio es biológico (secuencias de proteínas), no lingüístico |
| Licencia | MIT |
| Formato de pesos | ONNX con fragmentos de parámetros externos en FP32, manifiesto SHA-256 y longitudes en bytes |

## Arquitectura y entrenamiento

El paquete no incluye entrenamiento propio: son grafos de ejecución convertidos. La procedencia declarada es `microsoft/vermeer` en la revisión `5c4ac7f1eeb722f1a8fe68c48743dc6a197806bf` y `biohub/ESMC-600M` en la revisión `fcc9d36f5fff97d9bb69a36e3252de61cc78c968`, exportado mediante la implementación ESM-C de Transformers. Se incluyen Vermeer-B, Vermeer-L y Vermeer-XL como grafos ONNX con shards externos, ESM-C-600M como embedding más 36 grafos secuenciales de capas transformer y pooling, y el decodificador de imágenes LlamaGen VQ-16.

La validación numérica cubre los pasos de prefill y cached de Vermeer, todas las capas de ESM-C y la salida del decodificador. La implementación en navegador preserva deliberadamente la convención de pooling «double-trim» del upstream, y el autor advierte explícitamente de que no se ha establecido la equivalencia con implementaciones y checkpoints históricos de ESM en tiempo de entrenamiento. Los tokens de frontera de canal generados inválidos se rechazan de forma explícita.

## Capacidades

- Predicción de localización de proteínas mediante generación autorregresiva de imágenes de microscopía.
- Extracción de embeddings de proteínas con ESM-C-600M (36 capas transformer y pooling).
- Decodificación de imágenes con LlamaGen VQ-16 a partir de tokens de imagen.
- Ejecución local en navegador mediante WebGPU y ONNX, sin envío de secuencias a un servidor.
- Selección de variante de Vermeer (B, L o XL) según los recursos del dispositivo.
- Validación de integridad mediante manifiesto SHA-256 y longitudes en bytes.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión general, audio ni multilingüismo textual.

## Casos de uso

- Investigación en localización de proteínas con privacidad de datos: el usuario ejecuta la inferencia en su navegador y las secuencias no salen del dispositivo, lo que encaja con datos biológicos sensibles o no publicables.
- Visualización interactiva de predicciones de microscopía: la aplicación descarga solo la variante de Vermeer elegida y los componentes compartidos, permitiendo explorar resultados sin infraestructura de servidor.
- Docencia y demostraciones: al no requerir backend, se puede desplegar como aplicación web estática para mostrar modelado generativo de microscopía en cursos o talleres.
- Prototipado de pipelines de embeddings de proteínas: ESM-C-600M exportado en 36 grafos permite calcular representaciones en cliente para experimentos rápidos de similitud o clustering.
- Auditoría de reproducibilidad: el manifiesto SHA-256 y los avisos de licencia upstream permiten verificar que los artefactos corresponden a las revisiones declaradas de Microsoft, Biohub y FoundationVision.
- Integración en herramientas de anotación biológica: el decodificador LlamaGen VQ-16 y los grafos de Vermeer pueden incorporarse a visores web que generen imágenes de microscopía sintéticas como apoyo a la anotación manual.
- Evaluación comparativa de variantes B, L y XL en dispositivos reales: útil para medir compatibilidad de memoria GPU/navegador antes de adoptar una variante en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio solo documenta comprobaciones de paridad numérica entre los grafos exportados y los modelos de origen (prefill y cached de Vermeer, capas de ESM-C y salida del decodificador), sin métricas de calidad predictiva.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el paquete completo son 7,4 GB en FP32, pero la aplicación descarga solo la variante elegida más ESM-C y el decodificador.
- GPU recomendadas: no disponibles; la ejecución depende de WebGPU en el navegador.
- Compatibilidad con GPU de consumo: el autor advierte de que la compatibilidad de memoria de navegador y GPU, especialmente para la variante XL, depende del dispositivo.
- Opciones de despliegue: ONNX Runtime Web con WebGPU en navegador; no se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Vermeer-web (este paquete) | No disponible (tres variantes + ESM-C-600M + decodificador) | No disponible | Sin benchmarks publicados; solo paridad numérica | MIT | Hugging Face, ONNX para navegador |
| microsoft/vermeer (upstream) | No disponible | No disponible | Base del export; sin datos en esta ficha | MIT | Hugging Face / GitHub de Microsoft |
| biohub/ESMC-600M | 600M (según nombre) | No disponible | No disponible | MIT | Hugging Face |
| FoundationVision/LlamaGen | No disponible | No disponible | No disponible | MIT | Hugging Face / GitHub |

No se dispone de datos de rendimiento comparables en la información proporcionada.

## Limitaciones y advertencias

- Los resultados son predicciones de investigación, no resultados experimentales de microscopía ni resultados clínicos.
- No se ha establecido la equivalencia con implementaciones y checkpoints históricos de ESM en tiempo de entrenamiento.
- La convención de pooling «double-trim» se preserva intencionalmente y puede diferir de otras implementaciones.
- La compatibilidad de memoria de navegador y GPU, especialmente para XL, depende del dispositivo y puede impedir la ejecución.
- Los tokens de frontera de canal inválidos se rechazan de forma explícita; no se corrige la salida generada.
- El repositorio tiene cero descargas y cero likes, por lo que carece de validación por parte de la comunidad.
- No hay información sobre sesgos, riesgos de alucinación en el dominio biológico ni limitaciones idiomáticas.
- La licencia MIT se aplica a los artefactos, pero se incluyen avisos de terceros de Microsoft, FoundationVision y Chan Zuckerberg Biohub que deben conservarse.
- Las imágenes de referencia de la aplicación son derivados del Human Protein Atlas bajo CC BY 4.0 y no forman parte de los pesos de este repositorio.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/alexijielu/vermeer-web
- Aplicación Vermeer web: https://github.com/alexxijielu/vermeer-web
- Vermeer (Microsoft): https://github.com/microsoft/vermeer
- LlamaGen (FoundationVision): https://github.com/FoundationVision/LlamaGen
- ESM-C-600M (Biohub): https://huggingface.co/biohub/ESMC-600M
- Paper: https://www.biorxiv.org/content/10.64898/2026.06.01.729395v1
