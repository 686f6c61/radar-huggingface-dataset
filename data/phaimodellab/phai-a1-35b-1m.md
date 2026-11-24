# PhaiModelLab/Phai-A1-35B-1M

## Resumen

Phai-A1-35B-1M es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) desarrollado por PhaiModelLab, derivado del modelo base Qwen/Qwen3.6-35B-A3B mediante un pipeline de post-entrenamiento orientado específicamente a cargas de trabajo de programación y agentes. El modelo cuenta con 35.107.181.936 parámetros totales y una arquitectura etiquetada como `qwen3_5_moe`, lo que indica un diseño de mezcla de expertos con activación dispersa.

La propuesta diferencial del modelo es su ventana de contexto de hasta 1 millón de tokens, habilitada mediante YaRN con factor de escalado 4, junto con un entrenamiento de refuerzo (RL) basado en GRPO sobre 4.000 entornos de sandbox que proporcionan retroalimentación real de ejecución de código, pruebas unitarias e interacción con herramientas. Todo el post-entrenamiento, incluyendo SFT y RL, se realizó sobre NPUs Huawei Ascend, un detalle técnico relevante para quienes operan infraestructura no-NVIDIA.

El modelo es relevante en el contexto actual porque combina tres tendencias: especialización en agentes de código, contextos ultra-largos que permiten razonamiento a escala de repositorio, y entrenamiento con feedback ejecutable en lugar de solo preferencias humanas. Su licencia Apache 2.0 y su compatibilidad con endpoints lo hacen atractivo para despliegues comerciales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE), etiqueta `qwen3_5_moe` |
| Parámetros totales | 35.107.181.936 |
| Parámetros activos | no disponible |
| Longitud de contexto | 1.000.000 tokens (con YaRN factor=4) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | zh, en, ja, ar, ru, de |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.6-35B-A3B, un transformer de mezcla de expertos, y se somete a un post-entrenamiento en dos fases. La primera fase de SFT utiliza datos de instrucción de alta calidad centrados en programación y agentes, cubriendo conversaciones multi-turno, tool calling y cadenas de razonamiento largas. La segunda fase aplica GRPO (Group Relative Policy Optimization) sobre 4.000 entornos de sandbox, donde el modelo recibe retroalimentación basada en ejecución real: ejecución de código, pruebas unitarias e interacción con herramientas. Este enfoque de RL con feedback ejecutable es la innovación técnica principal frente a métodos de RLHF basados únicamente en preferencias.

El entrenamiento abarca secuencias de 16K a 1M tokens, con YaRN (factor=4) activado de forma consistente durante todo el post-entrenamiento para estabilizar y extender la ventana de contexto. La configuración de RoPE scaling ya viene habilitada por defecto en `config.json`, por lo que no requiere ajuste adicional para alcanzar el millón de tokens. El modelo conserva el comportamiento de inferencia del modelo base en contextos cortos, según indica el autor.

## Capacidades

- Generación de código: implementación, comprensión y depuración en múltiples lenguajes.
- Tool calling y function calling para integración con APIs y herramientas externas.
- Razonamiento multi-paso y planificación de tareas de horizonte largo (long-horizon planning).
- Capacidades de agente: ejecución de flujos con múltiples pasos y feedback de entorno.
- Comprensión de repositorios completos gracias a la ventana de 1M tokens.
- Soporte multilingüe en chino, inglés, japonés, árabe, ruso y alemán.
- Procesamiento de entrada imagen-texto (pipeline `image-text-to-text`).
- Modo conversacional multi-turno.
- Compatibilidad con endpoints (`endpoints_compatible`).

## Casos de uso

- Agentes de código autónomos: el modelo puede planificar y ejecutar tareas de modificación de repositorios completos gracias a su contexto de 1M tokens, leyendo múltiples ficheros y manteniendo coherencia entre cambios distribuidos.
- Revisión de código a escala de repositorio: analizar un repositorio entero en una sola pasada para detectar inconsistencias, dependencias rotas o patrones problemáticos que requieren contexto global.
- Automatización de pipelines CI/CD: integración mediante tool calling para invocar tests, linters y despliegues, con razonamiento sobre los resultados de ejecución.
- Asistente de depuración con feedback ejecutable: el modelo, entrenado con RL sobre sandbox, puede proponer hipótesis, ejecutar código de prueba y refinar la solución iterativamente.
- Generación de tests unitarios: producir suites de pruebas a partir de código fuente y especificaciones, aprovechando el entrenamiento con pruebas unitarias reales.
- Migración y refactorización de código multi-fichero: gestionar cambios que afectan a decenas de ficheros manteniendo el contexto completo del proyecto.
- Agentes de atención al cliente técnica: conversaciones multi-turno con contexto largo para resolver incidencias que requieren historial extenso.
- Análisis de documentación técnica extensa combinada con código (entrada imagen-texto permite incorporar diagramas).

## Benchmarks y rendimiento

El autor reporta evaluación sobre SWE-Bench (Verified / Pro / Multilingual), TAU3-Bench, IFBench y AA-LCR, indicando mejoras consistentes sobre el modelo base y rendimiento cercano o superior a modelos de mayor tamaño en varios benchmarks. Sin embargo, los resultados numéricos concretos se presentan únicamente en una imagen (`_benchmarks.png`) y no están disponibles como datos textuales en la información proporcionada.

| Benchmark | Resultado |
|---|---|
| SWE-Bench Verified | no disponible (solo en imagen) |
| SWE-Bench Pro | no disponible (solo en imagen) |
| SWE-Bench Multilingual | no disponible (solo en imagen) |
| TAU3-Bench | no disponible (solo en imagen) |
| IFBench | no disponible (solo en imagen) |
| AA-LCR | no disponible (solo en imagen) |

No se han publicado resultados numéricos de benchmarks en forma textual en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 35.107 millones de parámetros en bfloat16, los pesos ocupan aproximadamente 70 GB, lo que requiere al menos 80 GB de VRAM para cargar el modelo completo sin cuantizar. El tamaño del repo (70,2 GB) confirma esta estimación.
- GPU recomendadas: A100 80GB, H100 80GB o configuraciones multi-GPU para inferencia en precisión completa. Para el contexto de 1M tokens, la caché KV añade una demanda de memoria significativa que puede requerir múltiples GPUs o técnicas de compresión de caché.
- GPU de consumo: no cabe en GPUs de consumo (RTX 4090 con 24 GB) sin cuantización agresiva, y la cuantización no está documentada en la información disponible. Incluso cuantizado, el contexto de 1M tokens es inviable en hardware de consumo.
- Opciones de despliegue: el autor recomienda vLLM o SGLang para contextos largos, con prefix caching y chunked prefill. También es compatible con transformers (librería declarada) y con endpoints compatibles.
- Latencia y throughput: no disponible. El autor advierte que los contextos ultra-largos imponen una sobrecarga significativa de memoria y de caché KV.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Phai-A1-35B-1M | 35,1B (MoE) | 1M tokens | Apache 2.0 | Coding & Agent con RL en sandbox |
| Qwen3.6-35B-A3B (base) | 35B (MoE) | no disponible | no disponible | Modelo generalista |
| Alternativas de coding/agent de tamaño similar | no disponible | no disponible | no disponible | no disponible |

El modelo base Qwen3.6-35B-A3B es la referencia directa; el autor afirma mejoras consistentes sobre él en benchmarks de código y agentes. No se dispone de datos numéricos de terceros para una comparativa cuantitativa con otros modelos de la misma categoría.

## Limitaciones y advertencias

- Especialización de dominio: el modelo está optimizado para programación y agentes; su rendimiento en tareas generalistas puede diferir del modelo base.
- Fiabilidad de salida: el autor advierte que las salidas pueden contener errores, inexactitudes o contenido inapropiado; se recomienda verificación humana antes de desplegar en producción.
- Riesgo de alucinación: no se documenta explícitamente, pero es inherente a los modelos de lenguaje; el contexto de 1M tokens no elimina este riesgo.
- Idiomas: aunque soporta seis idiomas (zh, en, ja, ar, ru, de), no se documenta el rendimiento relativo por idioma; el castellano no figura entre los idiomas declarados.
- Contexto largo: aunque la ventana es de 1M tokens, el autor advierte de la sobrecarga de memoria y caché KV; la calidad en el extremo de la ventana no está cuantificada en la información disponible.
- Licencia: Apache 2.0 permite uso comercial, pero el autor exige cumplir también los términos del modelo base Qwen3.6-35B-A3B.
- Parámetros activos no documentados: al ser MoE, el coste computacional real depende de los expertos activados, dato no disponible.
- Cuantizaciones no documentadas: no hay información sobre GGUF, GPTQ, AWQ u otros formatos cuantizados.
- Entrenamiento en NPUs Ascend: puede implicar diferencias de comportamiento respecto a modelos entrenados en GPUs, aunque no se documentan.

## Enlaces

- Hugging Face: https://huggingface.co/PhaiModelLab/Phai-A1-35B-1M
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- README en chino: ./README_zh.md (referenciado en la model card)
- Imagen de benchmarks: `_benchmarks.png` (referenciada en la model card)
