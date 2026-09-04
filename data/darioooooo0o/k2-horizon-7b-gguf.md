# darioooooo0o/K2-Horizon-7B-GGUF

## Resumen

K2-Horizon-7B es un modelo de lenguaje de la familia K2-Horizon desarrollado por IFM (Institute for Foundation Models, vinculado a MBZUAI). Este repositorio concreto contiene las cuantizaciones GGUF del modelo base IFM/K2-Horizon-7B, creadas por darioooooo0o, que permiten ejecutar el modelo con llama.cpp. Según el fabricante, la familia K2-Horizon está formada por seis modelos de frontera orientados a razonamiento, generación de código, flujos de trabajo agénticos, dispositivos de borde y despliegue empresarial, con un enfoque de apertura radical.

El modelo tiene aproximadamente 9.000 millones de parámetros (8.999.178.240) y se distribuye bajo licencia Apache-2.0. La arquitectura K2-Horizon no es compatible con la rama principal de llama.cpp; requiere una rama específica mantenida por MBZUAI-IFM (k2-official). Esta característica indica que se trata de una arquitectura no estándar, aunque no se han proporcionado detalles técnicos adicionales sobre su diseño.

La relevancia de este repositorio es práctica: ofrece cuantizaciones listas para usar (Q3_K_M, Q4_K_S, Q4_K_M, Q5_K_M, Q8_0) que permiten ejecutar el modelo en GPUs de consumo con 8 GB o más de VRAM, como una RTX 3060 de 12 GB, sin necesidad de descargar el modelo completo en precisión BF16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | K2-Horizon (arquitectura propietaria de IFM, no compatible con llama.cpp mainline) |
| Parametros totales | 8.999.178.240 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q3_K_M, Q4_K_S, Q4_K_M, Q5_K_M, Q8_0 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones K-quants) |

## Arquitectura y entrenamiento

La información disponible no incluye detalles sobre la arquitectura interna del modelo K2-Horizon-7B. El único dato técnico relevante es que la arquitectura requiere una rama específica de llama.cpp (k2-official) mantenida por MBZUAI-IFM, lo que confirma que no se trata de un transformer estándar compatible con las versiones convencionales de llama.cpp. No se han publicado en la información proporcionada datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF o DPO.

El fabricante IFM presenta la familia K2-Horizon como un conjunto de seis modelos de frontera "radicalmente abiertos" para razonamiento, coding, workflows agénticos, edge devices y despliegue empresarial. Sin embargo, no se aportan en los materiales consultados especificaciones sobre la arquitectura, el tamaño del contexto ni el proceso de entrenamiento.

## Capacidades

- Generación de texto y razonamiento: el modelo está diseñado para tareas de razonamiento, según la descripción del fabricante.
- Generación de código: IFM posiciona la familia K2-Horizon para coding.
- Flujos de trabajo agénticos: la descripción menciona agentic workflows como caso de uso previsto.
- Despliegue en dispositivos de borde: la familia K2-Horizon está orientada a edge devices.
- Despliegue empresarial: el fabricante indica que es apto para deployment enterprise.
- No se especifican capacidades de tool calling, visión, audio ni multimodalidad en la información disponible.

## Casos de uso

- Inferencia local en GPU de consumo: gracias a las cuantizaciones Q4_K_M (~5,2 GB) y Q5_K_M (~6,0 GB), el modelo puede ejecutarse en una GPU con 8 GB o más de VRAM, como una RTX 3060 de 12 GB, sin necesidad de descarga a CPU. Esto lo hace adecuado para desarrollo y pruebas en entornos sin acceso a GPUs de centro de datos.
- Despliegue en dispositivos de borde: la familia K2-Horizon está orientada a edge devices, por lo que las cuantizaciones GGUF permiten integrar el modelo en sistemas embebidos o de borde con recursos limitados.
- Asistente conversacional local: al ser un modelo de generación de texto con licencia Apache-2.0, puede usarse como base para chatbots o asistentes que requieran procesar datos sensibles sin enviarlos a servicios en la nube.
- Generación de código asistida en entornos aislados: el modelo puede integrarse en herramientas de autocompletado o revisión de código que operen sin conexión, aprovechando su capacidad de coding y su licencia permisiva.
- Workflows agénticos en infraestructura propia: la descripción del fabricante menciona agentic workflows, lo que sugiere que el modelo puede emplearse en pipelines de automatización y toma de decisiones dentro de una organización.
- Prototipado rápido con llama.cpp: al estar disponible en formato GGUF, el modelo puede probarse fácilmente con llama-cli en la rama k2-official, lo que facilita la experimentación con distintos niveles de cuantización y longitudes de contexto configurables.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: según las cuantizaciones disponibles, Q3_K_M ~4,3 GB, Q4_K_S ~5,0 GB, Q4_K_M ~5,2 GB, Q5_K_M ~6,0 GB y Q8_0 ~8,9 GB. El autor indica que el modelo cabe completamente en una GPU de 8 GB o más con las cuantizaciones intermedias, sin necesidad de offload a CPU.
- GPU recomendadas: RTX 3060 de 12 GB (validada por el autor), y cualquier GPU con al menos 8 GB de VRAM para las cuantizaciones Q4_K_M o inferiores. Para Q8_0 se recomienda una GPU con 12 GB o más.
- Compatibilidad con GPU de consumo: sí, especialmente con cuantizaciones Q4_K_M y Q5_K_M en GPUs de 8-12 GB.
- Opciones de despliegue: llama.cpp con la rama k2-official de MBZUAI-IFM. No se mencionan vLLM, Ollama ni TGI en la información disponible, y es probable que no sean compatibles sin soporte específico para esta arquitectura.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en los datos proporcionados. El modelo K2-Horizon-7B pertenece a la familia K2-Horizon de IFM, que según el fabricante incluye seis modelos de frontera, pero no se aportan detalles sobre los demás modelos ni benchmarks que permitan comparar rendimiento. Por tanto, la comparativa con alternativas de la misma categoría no está disponible.

## Limitaciones y advertencias

- Compatibilidad restringida: el modelo requiere la rama k2-official de llama.cpp mantenida por MBZUAI-IFM. La rama principal de llama.cpp no soporta la arquitectura K2-Horizon, lo que limita su integración con herramientas estándar.
- Información técnica incompleta: no se han proporcionado datos sobre la longitud de contexto, los idiomas soportados, ni el proceso de entrenamiento. Esto dificulta evaluar su idoneidad para casos de uso específicos.
- Sin benchmarks publicados: no existen resultados de MMLU, HumanEval, GSM8K u otros benchmarks en la información disponible, por lo que no se puede comparar su rendimiento con otros modelos de forma objetiva.
- Riesgo de alucinación: al igual que cualquier modelo de lenguaje, puede generar contenido falso o inconsistente. No se dispone de información sobre medidas de mitigación específicas.
- Sesgos: no se han documentado sesgos conocidos en la información disponible.
- Licencia Apache-2.0: permite uso comercial y modificación, pero el usuario debe revisar los términos completos de la licencia y las condiciones del modelo base IFM/K2-Horizon-7B.
- Dependencia de cuantizaciones: las cuantizaciones GGUF pueden introducir pérdida de calidad en comparación con el modelo base en BF16, especialmente en las versiones Q3_K_M y Q4_K_S.

## Enlaces

- Repositorio Hugging Face de las cuantizaciones: https://huggingface.co/darioooooo0o/K2-Horizon-7B-GGUF
- Modelo base en Hugging Face: https://huggingface.co/IFM/K2-Horizon-7B
- Repositorio de cuantizaciones del modelo base: https://huggingface.co/IFM/K2-Horizon-7B-GGUF
- Blog de IFM sobre K2 Horizon: https://ifm.ai/blog/k2
- Repositorio de llama.cpp de MBZUAI-IFM (rama k2-official): https://github.com/MBZUAI-IFM/llama.cpp
