# mradermacher/XORTRON-NXTXPRT10PRO-31B-GGUF

## Resumen

XORTRON-NXTXPRT10PRO-31B-GGUF es una colección de cuantizaciones GGUF del modelo base XORTRON-NXTXPRT10PRO-31B, desarrollado por darkc0de y cuantizado por mradermacher. El modelo base forma parte de un proyecto denominado "The XORTRON Criminal Computing", un experimento de investigación que explora comportamientos no alineados en modelos de lenguaje. Las etiquetas de la model card (uncensored, harmful, abliterated, toxic) indican que se ha aplicado una técnica de "abliteración" para eliminar los mecanismos de rechazo, dando lugar a un modelo sin restricciones de contenido.

Con aproximadamente 30,7 mil millones de parámetros, el modelo se distribuye en formato GGUF con múltiples niveles de cuantización, lo que permite su ejecución en hardware de consumo. La licencia Apache-2.0 facilita su uso comercial, aunque su naturaleza sin censura plantea consideraciones éticas y de seguridad. La relevancia actual radica en la creciente demanda de modelos locales "sin filtros" para investigación en alineación, generación de texto creativo y análisis de riesgos, aunque su documentación técnica es escasa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (transformers, según librería) |
| Parametros totales | 30.697.345.596 |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura del modelo base. La librería indicada es `transformers`, lo que sugiere una arquitectura transformer estándar, pero no se especifica si es densa o de mezcla de expertos. Tampoco hay datos sobre el número de tokens de entrenamiento, la composición del dataset o el uso de técnicas como RLHF o DPO. La etiqueta "abliterated" indica que se ha aplicado una técnica de eliminación de rechazos (abliteration), un procedimiento que modifica los pesos del modelo para suprimir las respuestas de negativa ante solicitudes dañinas. El proyecto "XORTRON Criminal Computing" sugiere un enfoque deliberado en comportamientos no alineados, aunque no se han publicado detalles técnicos adicionales.

## Capacidades

- Generación de texto en inglés sin restricciones aparentes de contenido (por su naturaleza "uncensored").
- Posible soporte multimodal, ya que se incluyen archivos `mmproj` (multi-modal projector) en las cuantizaciones, lo que sugiere capacidad de procesamiento de imágenes, aunque no se confirma en la documentación.
- No se han documentado capacidades específicas como tool calling, razonamiento multi-paso o modo de pensamiento.

## Casos de uso

- Investigación en alineación y seguridad de IA: el modelo permite estudiar comportamientos no alineados y evaluar estrategias de mitigación en entornos controlados.
- Generación de texto creativo sin filtros: escritores y artistas pueden explorar narrativas sin las restricciones habituales de los modelos comerciales.
- Pruebas de estrés de sistemas de moderación: sirve para evaluar la robustez de filtros de contenido en aplicaciones de producción.
- Análisis de sesgos y toxicidad: investigadores pueden analizar patrones de lenguaje dañino y desarrollar métricas de detección.
- Desarrollo de sistemas de "red teaming": equipos de seguridad pueden utilizar el modelo para generar entradas adversarias y probar defensas.
- Educación en ética de IA: como caso de estudio sobre los riesgos de modelos sin alineación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Las cuantizaciones varían desde 12,0 GB (Q2_K) hasta 32,7 GB (Q8_0), lo que implica requisitos de VRAM desde aproximadamente 12 GB hasta 33 GB para cargar el modelo completo en GPU.
- Para la cuantización Q4_K_M (18,8 GB), se recomienda una GPU con al menos 24 GB de VRAM, como una RTX 4090 o A5000.
- Las cuantizaciones más pequeñas (Q2_K, Q3_K_S) podrían caber en GPUs de 16 GB, aunque con pérdida de calidad.
- Opciones de despliegue: llama.cpp, Ollama, text-generation-inference (TGI) y cualquier framework compatible con GGUF.
- No se dispone de datos de latencia o throughput.

## Comparativa con modelos similares

No disponible. No se han identificado modelos comparables con características equivalentes (tamaño, licencia y naturaleza "uncensored") en la información proporcionada.

## Limitaciones y advertencias

- El modelo está diseñado para generar contenido potencialmente dañino, ilegal o éticamente cuestionable. Su uso en producción sin medidas de mitigación es altamente riesgoso.
- No hay documentación sobre el proceso de entrenamiento, lo que impide evaluar sesgos, alucinaciones o limitaciones específicas.
- La licencia Apache-2.0 permite uso comercial, pero la naturaleza del modelo puede generar responsabilidades legales si se utiliza para difundir contenido perjudicial.
- La longitud de contexto no está especificada, por lo que se desconoce su capacidad para tareas de contexto largo.
- Solo se confirma soporte para inglés, limitando su uso multilingüe.
- Al ser un modelo "abliterated", puede producir respuestas incoherentes o inconsistentes en temas que normalmente requerirían rechazo.

## Enlaces

- [Repositorio HuggingFace del modelo GGUF](https://huggingface.co/mradermacher/XORTRON-NXTXPRT10PRO-31B-GGUF)
- [Repositorio HuggingFace de cuantizaciones i1 (imatrix)](https://huggingface.co/mradermacher/XORTRON-NXTXPRT10PRO-31B-i1-GGUF)
- [Página del modelo base en FriendliAI](https://friendli.ai/models/darkc0de/XORTRON-NXTXPRT10PRO-31B)
