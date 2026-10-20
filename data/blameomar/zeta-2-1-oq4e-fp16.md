# BlameOmar/zeta-2.1-oQ4e-fp16

## Resumen

`BlameOmar/zeta-2.1-oQ4e-fp16` es un checkpoint cuantizado del modelo `zeta-2.1`, publicado por el usuario BlameOmar en HuggingFace. No se trata de un modelo entrenado desde cero, sino de una conversión de pesos a precisión mixta mediante oQ (oMLX v0.7.1), la herramienta de cuantización del proyecto oMLX orientada a ejecución en Apple Silicon a través de MLX. El checkpoint contiene 8.250.462.208 parámetros lógicos (aproximadamente 8,25B) almacenados en 4,514 GiB, con un promedio efectivo de 4,700 bits por peso.

La relevancia de esta ficha es acotada y hay que enmarcarla correctamente: el repositorio no incluye model card descriptiva del modelo base, ni licencia, ni idiomas declarados, ni resultados de evaluación. La información disponible se limita a los metadatos de cuantización y al desglose de almacenamiento. Cualquier evaluación de capacidades, contexto o calidad debe remitirse al modelo original `zeta-2.1`, del que este repositorio no aporta datos.

Por tanto, esta ficha documenta con rigor lo que se puede verificar (tamaño, distribución de bits, formato, requisitos de ejecución derivados) y marca explícitamente como no disponible todo lo demás. El tag `llama` sugiere una arquitectura transformer de estilo Llama, pero no se confirma en la información proporcionada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de estilo Llama (inferido del tag `llama`; no confirmado en la model card) |
| Parametros totales | 8.250.462.208 (8,25B) |
| Parametros activos | no disponible (no hay indicios de arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | oQ mixta: affine 4-bit grupo 64 (83,119% de los pesos), affine 5-bit grupo 64 (13,777%), affine 6-bit grupo 64 (3,101%), FP16 (0,003%); media efectiva 4,700 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors en formato MLX (librería `mlx`) |

## Arquitectura y entrenamiento

No hay información sobre el entrenamiento del modelo base en la documentación proporcionada: se desconoce el volumen de tokens, la composición del dataset, si hubo fases de RLHF, DPO u otras técnicas de alineamiento, y no se documenta ninguna innovación arquitectónica (attention lineal, decodificación especulativa, capas híbridas, etc.). El único dato estructural disponible es el tag `llama`, que apunta a una familia de transformer decoder-only con las convenciones habituales de esa arquitectura.

Lo que sí está documentado es el proceso de cuantización. El checkpoint se generó con oQ (oMLX v0.7.1) aplicando precisión mixta por capas o grupos de tensores: la mayor parte del modelo (6.858B parámetros lógicos) se almacena en affine 4-bit con grupo de 64, mientras que 1.137B parámetros se conservan en 5-bit y 0.256B en 6-bit, presumiblemente para preservar capas sensibles a la precisión. Una fracción marginal (0,003%, unas pocas decenas de miles de parámetros) permanece en FP16. El resultado son 4,847 GB (4,514 GiB) de almacenamiento para el conjunto del modelo de lenguaje, sin componentes adicionales (no se declaran cabezas de visión ni módulos auxiliares).

## Capacidades

- No se han publicado capacidades específicas del modelo en la información disponible. La model card se limita a documentar la cuantización.
- Generación de texto: esperable por tratarse de un modelo de lenguaje de 8,25B, pero sin verificación documental en este repositorio.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no se declaran idiomas).
- Capacidades especiales (modo thinking, visión, audio): no disponible; el desglose de almacenamiento solo incluye "Language model", lo que sugiere ausencia de torre de visión.
- Ejecución en Apple Silicon vía MLX: capacidad verificable del artefacto, al estar empaquetado con `library_name: mlx` y pesos en formato MLX safetensors.

## Casos de uso

- Prototipado local en Mac con memoria unificada: el checkpoint ocupa 4,514 GiB, por lo que un Mac con 16 GB de memoria unificada puede cargarlo dejando margen para el contexto KV y el resto del sistema. Adecuado para validar ideas sin GPU dedicada ni servicios en la nube.
- Asistente personal offline con datos sensibles: al ejecutarse íntegramente en local mediante MLX, permite procesar documentos que no deben salir del dispositivo (notas clínicas, contratos, borradores internos), siempre que se asuma la ausencia de garantías de licencia.
- Generación de código en el editor: un modelo de 8,25B cuantizado a ~4,7 bits es un tamaño habitual para autocompletado y refactorización en local; encaja en flujos tipo plugin de editor que invocan un servidor MLX local.
- Extracción de información y clasificación por lotes: procesar correos, tickets o currículos en un pipeline por script, ejecutando el modelo con mlx-lm sobre un Mac mini o Mac Studio y serializando la salida a JSON.
- Base para RAG local: combinación del modelo con un índice vectorial en el mismo equipo, útil para consultas sobre documentación interna sin depender de conectividad.
- Evaluación comparativa de cuantización: este checkpoint es directamente utilizable como punto de comparación frente al modelo `zeta-2.1` en FP16 o BF16, para medir la degradación introducida por 4,700 bits/peso en tareas concretas.
- Traducción y reescritura de texto: uso genérico de generación condicionada, sujeto a verificar empíricamente el rendimiento en castellano, ya que no se declaran idiomas soportados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

Ni la model card ni los metadatos del repositorio incluyen evaluaciones de MMLU, HumanEval, GSM8K, MT-Bench ni métricas de perplejidad, ni del checkpoint cuantizado ni del modelo base `zeta-2.1`. Tampoco se documentan mediciones de latencia o throughput en hardware concreto.

## Requisitos de hardware

- VRAM / memoria: los pesos ocupan 4,514 GiB (4,847 GB). Hay que sumar la caché KV, que depende de la longitud de contexto y del número de capas (no documentados); como referencia práctica, un contexto de varios miles de tokens añade del orden de centenares de MB a 1-2 GB.
- Memoria total recomendada: 8 GB de memoria unificada es el mínimo ajustado; 16 GB es el entorno cómodo; 24 GB o más permite contextos largos y ejecución en paralelo con otras aplicaciones.
- GPU compatibles: el formato MLX está diseñado para Apple Silicon (series M1, M2, M3, M4 y sus variantes Pro/Max/Ultra). No es un artefacto para CUDA; no se ha validado en A100, H100 ni RTX 4090 en la información disponible.
- Cabe en GPU de consumo: sí, en el sentido de que cabe en equipos Apple Silicon de gama consumer con 16 GB o más de memoria unificada. No hay datos de ejecución en GPUs consumer NVIDIA con este formato.
- Opciones de despliegue: `mlx-lm` (carga directa de pesos MLX), servidor HTTP compatible con la API de OpenAI incluido en mlx-lm, y scripts propios con la librería `mlx`. No es compatible directamente con vLLM, TGI, llama.cpp ni Ollama, que requieren otros formatos (aunque sería posible una conversión a GGUF, no documentada por el autor).
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo para ningún chip.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato / disponibilidad |
|---|---|---|---|---|---|
| zeta-2.1-oQ4e-fp16 (este repo) | 8,25B | no disponible | 4,700 bits/peso efectivos (mixta 4/5/6-bit) | no disponible | safetensors MLX, 4,514 GiB |
| zeta-2.1 (modelo base, version original) | 8,25B (derivado del recuento de pesos) | no disponible | presumiblemente 16-bit (no confirmado) | no disponible | no disponible en la informacion proporcionada |
| Alternativas de tamano similar (familias tipo Llama 3 8B o Qwen2.5 7B) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se han encontrado en la búsqueda web datos verificables de modelos comparables que permitan una comparación de rendimiento con este checkpoint. La comparación cuantitativa con alternativas de la misma categoría queda pendiente de evaluación propia.

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explícita no hay autorización clara para uso comercial. Es un bloqueante para producción; hay que contactar con el autor o localizar la licencia del modelo base `zeta-2.1` antes de desplegar.
- Model card ausente de contenido sustantivo: no se documentan datos de entrenamiento, idiomas, contexto, sesgos ni evaluación. La trazabilidad del modelo base es nula en este repositorio.
- Cuantización agresiva: 4,700 bits/peso efectivos implican una pérdida de precisión respecto al modelo original. Es esperable degradación en tareas sensibles, como matemáticas de varios pasos, código con sintaxis estricta o instrucciones largas, pero no hay mediciones que la cuantifiquen.
- Riesgo de alucinación: inherente a los modelos de lenguaje de esta escala; sin evaluación publicada no puede acotarse su magnitud.
- Idiomas: al no declararse, no hay garantía de calidad en castellano ni en ningún otro idioma. Hay que evaluar con un conjunto propio antes de usar en producción.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación por parte de la comunidad y de informes de errores.
- Fechas del repositorio: la creación y actualización figuran como 2026-10-20, lo que conviene verificar antes de citar el artefacto.
- Dependencia de plataforma: los pesos MLX no se ejecutan en CUDA sin conversión previa, lo que limita la portabilidad a infraestructura con GPUs NVIDIA.
- Se desconoce si el checkpoint requiere un formato de prompt o una plantilla de chat concreta; usar una plantilla incorrecta degrada la calidad de forma notable.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/BlameOmar/zeta-2.1-oQ4e-fp16
- Herramienta de cuantización oQ / oMLX: https://github.com/jundot/omlx
- Proyecto MLX de Apple (marco de ejecución, no citado en la model card): https://github.com/ml-explore/mlx
- Repositorio mlx-lm para carga e inferencia (no citado en la model card): https://github.com/ml-explore/mlx-lm
- Resultados de la búsqueda web: no se ha encontrado ningún enlace relevante sobre este modelo; los resultados devueltos corresponden a páginas del World Economic Forum sin relación con el artefacto.
