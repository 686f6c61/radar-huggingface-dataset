# axiomofmind/Qwen3.6-35B-A3B-NVFP4-W4A16-MoE-MLP-GGUF

## Resumen

El modelo `axiomofmind/Qwen3.6-35B-A3B-NVFP4-W4A16-MoE-MLP-GGUF` es una conversión GGUF del modelo Qwen3.6-35B-A3B de Alibaba Cloud, realizada por el usuario axiomofmind. Se trata de una cuantización selectiva que aplica NVFP4 W4A16 únicamente a los pesos de los MLP de los expertos (routed y shared) de la arquitectura MoE, mientras que atención, embeddings, cabeza de salida, componentes de visión y el módulo MTP se mantienen en BF16/F32. El objetivo es reducir la huella de memoria en GPUs NVIDIA Blackwell sin degradar la precisión de las partes críticas del modelo.

El modelo base Qwen3.6-35B-A3B es un MoE multimodal con 35 mil millones de parámetros totales y 3 mil millones activos por token, diseñado para ofrecer un equilibrio entre rendimiento y eficiencia. Esta conversión GGUF permite ejecutarlo mediante llama.cpp en entornos con VRAM limitada, manteniendo capacidades de entrada de imagen y texto, decodificación especulativa (MTP embebido o DFlash opcional) y una ventana de contexto de hasta 262 144 tokens validada. Su licencia Apache-2.0 facilita su uso comercial y de investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) con atención full y linear, multimodal (imagen + texto) |
| Parametros totales | 35 B |
| Parametros activos | 3 B |
| Longitud de contexto | 262 144 tokens (validado en la conversión) |
| Tipos de cuantizacion | NVFP4 W4A16 (solo MLP de expertos); atención, embeddings, lm_head, visión y MTP en BF16/F32 |
| Idiomas soportados | No disponible (el modelo base Qwen3.6 es multilingüe, pero no se especifican idiomas concretos) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (archivos .gguf) |

## Arquitectura y entrenamiento

El modelo base Qwen3.6-35B-A3B emplea una arquitectura MoE con 35 B parámetros totales y 3 B activos por token, lo que reduce el coste computacional por inferencia. Incluye atención full y lineal (probablemente atención lineal para eficiencia en contexto largo) y componentes de visión que permiten entrada de imágenes. La conversión GGUF de axiomofmind mantiene la estructura original pero cuantiza exclusivamente los tensores de los MLP de los expertos (gate, up y down) a NVFP4 W4A16, mientras que el resto de componentes (atención, embeddings, routers, lm_head, visión y MTP) se conservan en BF16/F32. El archivo principal contiene 240 tensores NVFP4.

El modelo base fue desarrollado por Alibaba Cloud como parte de la serie Qwen3.6, que según el repositorio oficial prioriza estabilidad y utilidad real, con mejoras sustanciales en coding agéntico. No se dispone de información detallada sobre el dataset de entrenamiento ni sobre el uso de RLHF o DPO en la documentación proporcionada. La conversión GGUF no modifica los pesos entrenados, solo su representación numérica.

## Capacidades

- Generación de texto y razonamiento multi-turno con ventana de contexto de hasta 262 144 tokens.
- Entrada multimodal: procesa imágenes junto con texto gracias al proyector de visión incluido (mmproj).
- Decodificación especulativa integrada: MTP (Multi-Token Prediction) embebido en el archivo principal, o DFlash opcional como drafter externo.
- Soporte de agentes y coding agéntico, según las mejoras declaradas en la serie Qwen3.6.
- Capacidad de ejecución en GPU Blackwell mediante llama.cpp con soporte NVFP4.
- No se confirma explícitamente soporte de tool calling o function calling en la información proporcionada, aunque es habitual en la familia Qwen.

## Casos de uso

- Despliegue local de un asistente multimodal en estaciones de trabajo con GPU Blackwell: el GGUF principal (24,58 GB) más el proyector de visión (0,90 GB) caben en GPUs de 32 GB o más, permitiendo ejecutar un modelo de 35 B con entrada de imágenes en local.
- Generación de código asistida en entornos de desarrollo: gracias a las mejoras en coding agéntico de Qwen3.6, el modelo puede integrarse en IDE o pipelines de CI/CD para autocompletar, revisar o generar código, con la ventaja de la decodificación especulativa para reducir la latencia.
- Razonamiento sobre documentos largos con imágenes: la ventana de 262 144 tokens permite procesar manuales extensos, informes con figuras o documentación técnica que combine texto e imágenes.
- Prototipado de agentes conversacionales con contexto prolongado: el modelo puede mantener conversaciones multi-turno de larga duración sin perder el hilo, gracias a su contexto amplio y a la atención lineal.
- Investigación en eficiencia de cuantización: al mantener atención y head en BF16, sirve como referencia para estudiar el impacto de cuantizar solo los MLP en modelos MoE multimodales.
- Inferencia en edge devices: según Jetson AI Lab, el modelo base es adecuado para dispositivos con recursos limitados; esta conversión GGUF lo hace aún más accesible en hardware NVIDIA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La validación incluida en la model card reporta una prueba no controlada de DFlash con 210 de 308 tokens aceptados (68,18 %) y una velocidad de 330,61 tok/s en una RTX PRO 6000 Blackwell, pero no es un benchmark estandarizado. No se proporcionan cifras de MMLU, HumanEval, GSM8K u otros tests para esta conversión específica.

## Requisitos de hardware

- VRAM estimada: el archivo GGUF principal pesa 24,58 GB, el proyector de visión 0,90 GB y el drafter DFlash 0,78 GB. Con contexto de 32 768 tokens y caché KV en q8_0, se necesitan al menos 32 GB de VRAM para el modelo completo con visión. Para contexto de 262 144 tokens, la VRAM requerida aumenta considerablemente (no cuantificada en la documentación).
- GPU recomendadas: NVIDIA Blackwell (RTX PRO 6000 Blackwell, RTX 5090, etc.) por el soporte nativo de NVFP4. No se garantiza funcionamiento en GPUs Ampere o anteriores.
- Opciones de despliegue: llama.cpp (llama-server) con build CUDA reciente que incluya soporte Qwen3.6 NVFP4. Para DFlash se requiere un build específico (PR #27342).
- Latencia y throughput: en la prueba no controlada con DFlash se observaron 330,61 tok/s en una RTX PRO 6000 Blackwell, pero no es un valor de referencia fiable.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| axiomofmind/Qwen3.6-35B-A3B-NVFP4-W4A16-MoE-MLP-GGUF | 35 B (3 B activos) | 262 144 | NVFP4 selectivo (solo MLP) | Apache-2.0 | GGUF en HF |
| nvidia/Qwen3.6-35B-A3B-NVFP4 | 35 B (3 B activos) | No disponible | NVFP4 (completo) | Apache-2.0 | Pesos originales en HF |
| unsloth/Qwen3.6-35B-A3B-NVFP4 | 35 B (3 B activos) | No disponible | NVFP4 (completo) | Apache-2.0 | Pesos originales en HF |
| Qwen/Qwen3.6-35B-A3B (original) | 35 B (3 B activos) | No disponible | BF16 | Apache-2.0 | Pesos originales en HF |

La comparativa se basa en los metadatos disponibles; no se dispone de datos de rendimiento comparativos entre estas versiones.

## Limitaciones y advertencias

- Requiere GPU NVIDIA Blackwell para aprovechar la cuantización NVFP4; en GPUs más antiguas el modelo no funcionará o lo hará con degradación.
- La cuantización selectiva solo afecta a los MLP de los expertos; atención, embeddings y head se mantienen en BF16, por lo que el ahorro de memoria es parcial (el archivo pesa 24,58 GB, frente a los ~70 GB del modelo en BF16).
- No se ha probado el modelo con prompts cercanos al límite de contexto (262 144 tokens); la validación solo confirma la asignación de memoria y una petición real con imagen.
- El drafter DFlash no es un modelo independiente; debe usarse junto con el GGUF principal y requiere un build específico de llama.cpp.
- No se dispone de información sobre sesgos, alucinaciones o limitaciones idiomáticas específicas de esta conversión. El modelo base puede presentar los sesgos típicos de los LLM entrenados con datos web.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda verificar los términos del modelo base Qwen3.6 en su repositorio oficial.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/axiomofmind/Qwen3.6-35B-A3B-NVFP4-W4A16-MoE-MLP-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Drafter DFlash: https://huggingface.co/z-lab/Qwen3.6-35B-A3B-DFlash
- NVIDIA Model Optimizer: https://github.com/NVIDIA/Model-Optimizer
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Repositorio oficial Qwen3.6: https://github.com/QwenLM/Qwen3.6
- Guía de ejecución local (insiderllm): https://insiderllm.com/guides/best-way-run-qwen-3-6-35b-moe-locally/
- Ficha en Jetson AI Lab: https://www.jetson-ai-lab.com/models/qwen3-6-35b-a3b/
