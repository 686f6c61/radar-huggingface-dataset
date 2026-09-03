# lausannequants/Kimi-K2.7-Code

## Resumen

Kimi K2.7 Code es un modelo de inteligencia artificial de código abierto desarrollado por Moonshot AI, especializado en tareas de programación y razonamiento agéntico. Está construido sobre la arquitectura de Kimi K2.6, con mejoras sustanciales en tareas de codificación de horizonte largo, lo que le permite completar flujos de trabajo complejos de ingeniería de software de principio a fin. Además, reduce el uso de tokens de pensamiento en aproximadamente un 30 % en comparación con su predecesor, lo que mejora la eficiencia token.

El modelo presenta una arquitectura Mixture-of-Experts (MoE) con 1 billón de parámetros totales y 32 mil millones de parámetros activos por token, lo que lo hace computacionalmente eficiente para su tamaño. Soporta una ventana de contexto de 256 000 tokens, entrada multimodal (texto e imagen) mediante un codificador visual MoonViT, y está diseñado para uso agéntico con soporte de herramientas MCP. La versión alojada en HuggingFace bajo el identificador `lausannequants/Kimi-K2.7-Code` es una variante comprimida (compressed-tensors) con un tamaño de repositorio de 595,2 GB, lo que sugiere una cuantización de baja precisión.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) con atención MLA (Multi-head Latent Attention) |
| Parametros totales | 1 026 879 376 368 (aproximadamente 1T) |
| Parametros activos | 32B |
| Longitud de contexto | 256 000 tokens |
| Tipos de cuantizacion | No disponible (el repositorio usa compressed-tensors, pero no se especifica el formato exacto) |
| Idiomas soportados | No disponible |
| Licencia | Modified MIT |
| Formato de pesos | safetensors (con compressed-tensors) |

## Arquitectura y entrenamiento

Kimi K2.7 Code emplea una arquitectura MoE con 61 capas, de las cuales una es densa y el resto son capas de expertos. Dispone de 384 expertos, de los cuales se seleccionan 8 por token, más un experto compartido. La dimensión oculta de atención es 7168, con 64 cabezas de atención, y la dimensión oculta de cada experto es 2048. La activación es SwiGLU y el vocabulario alcanza 160 000 tokens. El modelo incorpora un codificador visual MoonViT de 400 millones de parámetros para procesar imágenes.

El entrenamiento se basa en el modelo Kimi K2.6, con mejoras específicas en tareas de codificación de largo alcance y capacidades agénticas. No se han publicado detalles sobre el dataset de entrenamiento, el número de tokens procesados ni el uso de técnicas como RLHF o DPO en la información disponible. La reducción del 30 % en tokens de pensamiento sugiere una optimización en el proceso de razonamiento, posiblemente mediante ajustes en la generación de cadenas de pensamiento.

## Capacidades

- Generación de código en más de 10 lenguajes de programación, con énfasis en servicios backend, infraestructura y rendimiento.
- Razonamiento agéntico de horizonte largo: puede ejecutar tareas complejas de ingeniería de software de principio a fin, como resolución de incidencias, refactorización y desarrollo de funcionalidades.
- Soporte de herramientas MCP (Model Context Protocol) para integración con servicios externos y APIs.
- Entrada multimodal: acepta texto e imágenes, lo que permite interpretar capturas de pantalla, diagramas o documentación visual.
- Modo de pensamiento (thinking mode) que reduce el uso de tokens de razonamiento en un 30 % respecto a K2.6.
- Capacidades de conversación y seguimiento de instrucciones en contextos largos (hasta 256K tokens).
- Uso de atención MLA (Multi-head Latent Attention) para eficiencia en memoria y velocidad.

## Casos de uso

- Desarrollo de software asistido: el modelo puede generar, revisar y depurar código en repositorios grandes, aprovechando su contexto de 256K tokens para analizar múltiples archivos y dependencias.
- Resolución de incidencias en producción: gracias a su capacidad de razonamiento agéntico, puede diagnosticar errores, proponer parches y ejecutar pruebas en entornos de CI/CD.
- Automatización de tareas de infraestructura: con soporte MCP, puede interactuar con herramientas de despliegue, monitorización y gestión de clústeres.
- Asistente de programación multimodal: al aceptar imágenes, puede interpretar capturas de pantalla de errores, diagramas de arquitectura o bocetos de interfaz para generar código correspondiente.
- Refactorización de código legacy: su contexto largo permite analizar proyectos completos y sugerir mejoras de rendimiento o migraciones de frameworks.
- Generación de documentación técnica: puede resumir código, generar comentarios y crear guías de mantenimiento a partir de repositorios extensos.
- Agente autónomo de ingeniería: integrado en un CLI o IDE, puede ejecutar flujos de trabajo multi-paso, como crear ramas, escribir tests y abrir pull requests.

## Benchmarks y rendimiento

La model card proporciona resultados comparativos en varios benchmarks de codificación y capacidades agénticas. Se presentan a continuación junto con los valores de Kimi K2.6, GPT-5.5 y Claude Opus 4.8.

| Benchmark | Kimi K2.6 | Kimi K2.7 Code | GPT-5.5 | Claude Opus 4.8 |
|---|---|---|---|---|
| Kimi Code Bench v2 | 50.9 | 62.0 | 69.0 | 67.4 |
| Program Bench | 48.3 | 53.6 | 69.1 | 63.8 |
| MLS Bench Lite | 26.7 | 35.1 | 35.5 | 42.8 |
| Kimi Claw 24/7 Bench | 42.9 | 46.9 | 52.8 | 50.4 |
| MCP Atlas | 69.4 | 76.0 | 79.4 | 81.3 |
| MCP Mark Verified | 72.8 | 81.1 | 92.9 | 76.4 |

Kimi K2.7 Code supera a su predecesor K2.6 en todos los benchmarks, con mejoras notables en Kimi Code Bench v2 (+11,1 puntos) y MCP Mark Verified (+8,3 puntos). Sin embargo, queda por detrás de GPT-5.5 y Claude Opus 4.8 en la mayoría de las pruebas, excepto en MCP Mark Verified, donde supera a Claude Opus 4.8. Las condiciones de evaluación se detallan en las notas al pie de la model card: se usó thinking mode activado, temperatura 1.0, top-p 0.95 y contexto de 262 144 tokens para los modelos Kimi; GPT-5.5 se ejecutó en Codex con modo xhigh y Opus 4.8 en Claude Code con modo xhigh.

## Requisitos de hardware

- VRAM estimada: con 1T de parámetros, incluso en cuantización de 4 bits (aproximadamente 500 GB), se requieren múltiples GPUs de alta gama. El repositorio de 595,2 GB sugiere una cuantización de 4 bits o similar, lo que implica al menos 8 GPUs A100 de 80 GB o 4 GPUs H100 de 80 GB para cargar el modelo en memoria.
- GPU recomendadas: NVIDIA A100 80 GB, H100 80 GB o superiores. No es viable en GPUs de consumo (RTX 4090, etc.) debido al tamaño.
- Opciones de despliegue: al ser un modelo de transformers, puede servirse con vLLM, TensorRT-LLM o TGI. Para entornos con menos recursos, se podría usar llama.cpp con cuantización GGUF, aunque no se ha confirmado su disponibilidad.
- Latencia y throughput: no disponibles en la información proporcionada. Dado el tamaño y la arquitectura MoE con 32B activos, se espera un throughput moderado en hardware de centro de datos, pero no se ofrecen cifras concretas.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Enfoque |
|---|---|---|---|---|---|
| Kimi K2.7 Code | 1T | 32B | 256K | Modified MIT | Codificación y agéntico |
| Kimi K2.6 | 1T | 32B | 256K | Modified MIT | Codificación y agéntico (predecesor) |
| GPT-5.5 | No disponible | No disponible | No disponible | Propietaria | Codificación y agéntico (comercial) |
| Claude Opus 4.8 | No disponible | No disponible | No disponible | Propietaria | Codificación y agéntico (comercial) |

Kimi K2.7 Code es el único de la comparación con licencia abierta (Modified MIT), lo que permite uso comercial y modificación. Frente a GPT-5.5 y Claude Opus 4.8, ofrece un rendimiento inferior en la mayoría de benchmarks, pero con la ventaja de ser desplegable en infraestructura propia. Comparado con K2.6, mejora en eficiencia de tokens y en todos los benchmarks evaluados.

## Limitaciones y advertencias

- Sesgos y alucinaciones: no se han publicado evaluaciones específicas de sesgos. Como modelo de código, puede generar código incorrecto o inseguro si no se valida adecuadamente.
- Riesgo de alucinación en razonamiento: aunque reduce tokens de pensamiento, no se garantiza la exactitud en tareas de razonamiento complejo; se recomienda verificación humana.
- Limitaciones de idioma: no se especifican los idiomas soportados; probablemente esté optimizado para inglés y chino, dado el origen del modelo, pero no hay confirmación.
- Restricciones de licencia: la licencia Modified MIT permite uso comercial, pero se debe revisar el texto completo de la licencia para conocer condiciones específicas (por ejemplo, atribución o restricciones de uso).
- Requisitos de hardware: el tamaño del modelo (1T) hace que su despliegue sea costoso y requiera infraestructura de centro de datos. No es adecuado para entornos con recursos limitados.
- Disponibilidad de cuantizaciones: la versión en HuggingFace usa compressed-tensors, pero no se documentan los formatos de cuantización disponibles (por ejemplo, AWQ, GPTQ, GGUF). Esto puede limitar la interoperabilidad con ciertos frameworks de inferencia.
- Dependencia de herramientas externas: el soporte MCP requiere configurar servidores MCP adicionales, lo que añade complejidad operativa.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/lausannequants/Kimi-K2.7-Code
- Página oficial del modelo: https://www.kimi.ai/resources/kimi-k2-7-code
- Sitio informativo: https://kimik2ai.com/k2.7/
- Documentación de la API de Kimi: https://platform.kimi.ai/docs/guide/kimi-k2-7-code-quickstart
- Ficha en AI Model Radar: https://aimodelradar.app/models/kimi-k2-7-code
- Ficha en OpenLM.ai: https://openlm.ai/kimi-k2.7/
