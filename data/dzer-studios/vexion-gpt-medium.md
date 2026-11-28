# DZER-Studios/Vexion-gpt-medium

## Resumen

Vexion-gpt-medium es un modelo de lenguaje denso de 345 millones de parámetros desarrollado por DZER-Studios, construido desde cero en PyTorch puro como ejercicio de ingeniería e investigación sobre arquitecturas Transformer. Se trata de un GPT causal clásico, sin mezcla de expertos (MoE) ni RoPE, entrenado sobre el corpus multilingüe CulturaX y orientado exclusivamente al idioma ruso. Su relevancia no reside en el rendimiento absoluto, sino en su carácter didáctico y en las decisiones de implementación: kernels fusionados de Flash Attention, un DataLoader personalizado que transmite datos binarios y una configuración compatible con Hugging Face a nivel de `config.json`.

El modelo forma parte de una familia escalonada (117M, 345M y un futuro 1.3B) que comparte vocabulario de 40.960 tokens en las dos primeras variantes. Según la model card, se entrenó durante 570 horas sobre 39.000 millones de tokens, empleando una única RTX 3060 Ti de 8 GB o una RTX 4060 Ti de 16 GB, con un loss de validación de 2,53. El contexto nativo declarado es de 1.024 tokens en la tabla de la familia, aunque el texto de la model card menciona 3.072–4.096 tokens originales y una extensión vía YaRN de hasta ~12.288 tokens.

La advertencia más importante es que la arquitectura es completamente personalizada y no es compatible con la API de `transformers`: no puede cargarse mediante `AutoModelForCausalLM` y requiere los scripts incluidos en el repositorio (`model.py`, `generate.py`, `generation.py`). Esto limita seriamente su integración en ecosistemas estándar de despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso causal (GPT clásico, sin MoE ni RoPE), implementación propia en PyTorch |
| Parametros totales | 345.303.040 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 1.024 tokens según tabla de la familia; la model card menciona 3.072–4.096 nativos y ~12.288 con YaRN |
| Tipos de cuantizacion | No disponible (no se documentan pesos GGUF ni cuantizaciones publicadas) |
| Idiomas soportados | Ruso (`ru`) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (repo de 1,4 GB), con `custom_code` |

## Arquitectura y entrenamiento

Vexion-gpt-medium es un Transformer denso causal de estilo GPT clásico, escrito íntegramente en PyTorch sin frameworks de terceros pesados. Emplea atención causal estándar con funciones de activación GELU/SiLU y prescinde explícitamente de RoPE y de cualquier componente MoE. La configuración se externaliza en un `config.json` conforme a las convenciones de Hugging Face (`hidden_size`, `num_hidden_layers`, etc.), aunque la arquitectura resultante no es cargable por las clases estándar de `transformers`. Incorpora Flash Attention con kernels fusionados, lo que reduce el consumo de VRAM durante el entrenamiento e inferencia.

El entrenamiento se realizó sobre el dataset CulturaX, con 39.000 millones de tokens y un vocabulario de 40.960 tokens. La model card reporta 382.500 pasos totales, un train loss de 2,58 y un val loss de 2,53, con un tiempo total de 570 horas sobre una RTX 3060 Ti de 8 GB (o una RTX 4060 Ti de 16 GB), usando `batch_size` 12 con 8 pasos de acumulación a contexto 256 y `batch_size` 8 con 32 pasos de acumulación a contexto 1.024. El optimizador es Adaw, que mantiene los valores en formato de 32 bits. No se documenta RLHF, DPO ni ajuste por instrucciones; se trata de un modelo base preentrenado. La model card menciona además una fase de reentrenamiento en curso para las variantes NANO y Medium con el objetivo de validar el comportamiento de YaRN en contextos largos.

## Capacidades

- Generación de texto en ruso: continuación de texto y modelado de lenguaje causal sobre el corpus CulturaX.
- Modelo base sin ajuste por instrucciones: no se documenta alineación conversacional ni seguimiento de instrucciones.
- Sin soporte documentado de tool calling ni function calling.
- Sin soporte documentado de agentes ni razonamiento multi-paso.
- Capacidad multilingüe limitada al ruso según la etiqueta de idioma del repositorio.
- Extensión de contexto vía YaRN según la model card (hasta ~12.288 tokens), sujeta a degradación por alucinación y pérdida de información en el centro del contexto.
- No se documentan capacidades de visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Investigación educativa sobre arquitecturas Transformer: el repositorio incluye `model.py`, `train.py` y scripts de generación que permiten estudiar atención causal, Flash Attention y optimización de memoria en una GPU de consumo, sin depender de `transformers`.
- Experimentación con contextos extendidos mediante YaRN: la model card indica que el modelo puede operar con contextos de 8.192 a 16.384 tokens con un consumo de VRAM de aproximadamente 3,5 GB en checkpoint completo, lo que lo hace útil para probar técnicas de extensión de contexto en hardware limitado.
- Generación de texto en ruso para tareas de continuación y prototipado: adecuado para demostraciones de modelado de lenguaje sobre dominio general en ruso, siempre con expectativas ajustadas a su tamaño de 345M.
- Reproducción de pipelines de preentrenamiento: el DataLoader personalizado que transmite archivos `.bin` y evita el recolector de basura de Python sirve como referencia para entrenar modelos pequeños con throughput estable.
- Benchmarking de infraestructura: su reducido tamaño y su consumo de VRAM permiten usarlo como banco de pruebas para medir latencia y throughput en GPUs de consumo antes de escalar a modelos mayores de la familia.
- Estudio comparativo de tokenizadores y vocabularios: con 40.960 tokens y entrenamiento exclusivo en ruso, permite analizar el impacto del vocabulario en la compresión de texto y en el loss de validación frente a otros modelos de tamaño similar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta métricas de entrenamiento: train loss de 2,58, val loss de 2,53, 382.500 pasos y 39.000 millones de tokens de preentrenamiento.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,5 GB en checkpoint completo según la model card; el repo de safetensors ocupa 1,4 GB, por lo que en FP16 el peso ronda los 0,7 GB más overhead de activaciones.
- GPU recomendadas: RTX 3060 Ti de 8 GB o RTX 4060 Ti de 16 GB, las mismas empleadas para el entrenamiento; cualquier GPU con al menos 8 GB de VRAM debería ser suficiente para inferencia.
- Cabe en GPU de consumo: sí, en tarjetas de 8 GB o superiores, incluidas RTX 3060, RTX 4060 y modelos equivalentes.
- Opciones de despliegue: no es compatible con `transformers`, vLLM, TGI ni llama.cpp de forma estándar; requiere los scripts propios del repositorio (`generate.py`, `generation.py`). No se documentan pesos GGUF ni soporte para Ollama.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Compatibilidad con transformers |
|---|---|---|---|---|---|
| Vexion-gpt-medium | 345M | 1.024 (hasta ~12.288 con YaRN según model card) | Ruso | Apache 2.0 | No (arquitectura custom) |
| Vexion-gpt | 117M | 1.024 | Ruso | Apache 2.0 | No (arquitectura custom) |
| Vexion-gpt-1.3B | 1.3B | 1.024 | Ruso | No disponible | No (arquitectura custom) |

No se dispone de datos de benchmarks ni de comparaciones con modelos de terceros en la información proporcionada, por lo que no es posible establecer una comparativa de rendimiento con alternativas de la misma categoría.

## Limitaciones y advertencias

- Modelo base sin ajuste por instrucciones: no sigue instrucciones de forma fiable ni mantiene conversaciones multi-turno alineadas.
- Idiomas: entrenado exclusivamente en ruso; el rendimiento en castellano u otros idiomas no está soportado ni documentado.
- Contexto limitado: la ventana nativa es de 1.024 tokens según la tabla de la familia, con discrepancias en la model card (3.072–4.096); la extensión con YaRN degrada la calidad y aumenta las alucinaciones, con pérdida de detalles en el centro del contexto.
- Riesgo de alucinación elevado por su tamaño (345M) y por el contexto extendido, tal y como reconoce el propio autor.
- Incompatibilidad con el ecosistema estándar: no carga con `AutoModelForCausalLM` ni con servidores de inferencia habituales (vLLM, TGI), lo que complica su uso en producción.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero la ausencia de benchmarks y de alineación limita su idoneidad para aplicaciones en producción.
- Sesgos: no se documenta ninguna evaluación de sesgos ni de seguridad; el corpus CulturaX es un crawl web con los sesgos inherentes a ese origen.
- Documentación inconsistente: la model card mezcla datos de distintas variantes (nano, medium, XL) y menciona reentrenamientos en curso, por lo que algunas cifras pueden no corresponder a la versión publicada.

## Enlaces

- Hugging Face: https://huggingface.co/DZER-Studios/Vexion-gpt-medium
- Dataset CulturaX: https://huggingface.co/datasets/uonlp/CulturaX
