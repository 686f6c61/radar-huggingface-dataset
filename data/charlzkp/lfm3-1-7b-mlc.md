# CharlZKP/LFM3-1.7B-MLC

## Resumen

LFM3-1.7B-MLC es una conversión al formato MLC (Machine Learning Compilation) del modelo fundacional LiquidAI/LFM3-1.7B de Liquid AI, publicada por el usuario CharlZKP en Hugging Face. Su propósito es permitir la ejecución del modelo directamente en el navegador mediante WebLLM y WebGPU, sin dependencias de servidor ni nube: el repositorio incluye los pesos cuantizados, las librerías de modelo compiladas (`.wasm`) y la configuración de chat y tokenizador, de modo que WebLLM puede cargarlo todo directamente desde Hugging Face.

El modelo base, LFM3-1.7B, es un modelo de lenguaje fundacional de 1,73 mil millones de parámetros con una arquitectura tri-híbrida que combina convoluciones cortas con puerta (gated short convolution), atención deslizante (SWA) y atención global con RoPE parcial. Esta conversión emplea cuantización int6 asimétrica (equivalente a Q6_K de GGUF) y está pensada para escenarios de inferencia en cliente con requisitos de recursos bajos.

Su relevancia actual radica en la tendencia de ejecutar LLM pequeños localmente en el navegador: con ~1,5 GB de descarga y unos 3,2 GB de VRAM requeridos según la configuración, es viable en GPUs de consumo con soporte WebGPU y la característica `shader-f16`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tri-híbrida: gated short convolution (13 capas, k=7), sliding-window attention (5 capas, W=256), atención global con RoPE parcial (6 capas) |
| Parametros totales | 1,73 B |
| Parametros activos | no disponible (no es MoE; todos los parámetros son activos) |
| Longitud de contexto | Hasta 256K nativo en el modelo base; en esta conversión WebLLM se configura a 32768 tokens |
| Tipos de cuantizacion | q6f16_a (int6 asimétrica, 6,625 bpw; conv 1D y gate de atención en fp16 sin cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 en este repositorio (el modelo base se distribuye bajo LFM1.0 según la model card) |
| Formato de pesos | MLC (params_shard_*.bin) + librerías WebGPU compiladas (.wasm); el modelo base existe también en safetensors y GGUF |

## Arquitectura y entrenamiento

La arquitectura tri-híbrida de LFM3-1.7B combina tres mecanismos en sus 24 capas: 13 capas de convolución corta con puerta (k=7) que capturan contexto local con bajo coste computacional y un estado de caché convolucional recurrente; 5 capas de sliding-window attention con ventana W=256 para atención semilocal eficiente; y 6 capas de atención global completa con RoPE parcial de cola cero (θ=1.000.000, factor rotatorio parcial 0,5), lo que permite soportar hasta 256K tokens de contexto nativo. Además emplea sandwich RMSNorm (4 normalizaciones por capa) y atención con puerta por cabeza (head-wise gated attention) para suprimir valores atípicos de activación.

No se ha publicado información sobre los datos de entrenamiento (número de tokens, composición del dataset) ni sobre el uso de RLHF/DPO en la información disponible. En cuanto a la conversión MLC, se generó con `mlc_llm convert_weight` / `gen_config` / `compile` para WebGPU, empleando presets de cuantización personalizados y una matriz de importancia derivada de texto de calibración. La variante q6f16_a cuantiza los pesos a 6 bits asimétricos (6,625 bpw, ~1,43 GB) preservando en fp16 sin cuantizar los pesos de la convolución causal 1D (2048×1×7) y las proyecciones de puerta de atención (16×2048). Las operaciones de dequantización de embedding y vocabulario se trocean en bloques de 32.000 tokens para respetar el límite de 128 MiB de `maxStorageBufferBindingSize` de WebGPU en escritorio y móvil.

## Capacidades

- Generacion de texto general como modelo fundacional (base model), sin ajuste de instrucciones documentado en la información disponible.
- Contexto largo: hasta 256K tokens nativos en el modelo base, aunque la configuración de esta conversión para WebLLM se limita a 32768 tokens.
- Ejecucion en el navegador en tiempo real mediante WebLLM y WebGPU, sin backend en la nube.
- Inferencia con recursos bajos: marcado como `low_resource_required: true` en la configuración WebLLM.
- Soporte de tool calling, agentes o capacidades multimodales: no disponible en la información proporcionada.
- Capacidades multilingues: no disponible.

## Casos de uso

- Chatbots y asistentes 100% en cliente: el modelo se ejecuta íntegramente en el navegador vía WebGPU, ideal para aplicaciones donde la privacidad del usuario impide enviar datos a un servidor.
- Prototipado de aplicaciones LLM sin infraestructura: con WebLLM y el `AppConfig` incluido, un desarrollador puede integrar el modelo en una web con unas pocas líneas de TypeScript, sin coste de GPU en el servidor.
- Demostraciones y educacion: al no requerir backend, es adecuado para demos interactivas, talleres y material docente sobre LLM en el navegador.
- Resumen y analisis de documentos en dispositivos locales: el contexto de 32768 tokens configurado permite procesar documentos de longitud considerable sin salir del navegador.
- Aplicaciones offline o con conectividad intermitente: una vez cacheados los ~1,5 GB de pesos, la inferencia funciona sin conexión.
- Integracion en PWAs y herramientas de productividad: la baja huella (VRAM requerida ~2,1-3,2 GB según configuración) lo hace viable en portátiles con GPU integrada moderna compatible con WebGPU y `shader-f16`.
- Generacion de codigo o razonamiento especializado: posible en tanto el modelo base lo soporte, pero no hay datos publicados que lo confirmen para esta variante.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (ni para esta conversión MLC ni datos de benchmarks del modelo base incluidos en la model card del repositorio).

## Requisitos de hardware

- VRAM estimada: la configuración WebLLM indica `vram_required_MB` de 3202,54 MB en un registro y 2150 MB en otro de la model card; la descarga de pesos es de 1458 MB (6,625 bpw, ~1,43 GB).
- GPU recomendadas: cualquier GPU con soporte WebGPU y la característica `shader-f16`; en la práctica, GPUs modernas de escritorio y móviles (por ejemplo, GPUs NVIDIA de la serie RTX, Apple Silicon o GPUs integradas recientes). No se especifican modelos concretos de GPU.
- Consumer GPU: sí, cabe en GPUs de consumo con ~2-3,2 GB de VRAM libres; también es viable en portátiles con GPU integrada compatible con WebGPU.
- Despliegue: específicamente diseñado para WebLLM (v0.2.85, ABI de librería `v0_2_84`) sobre WebGPU. El modelo base está disponible además en formato GGUF (LiquidAI/LFM3-1.7B-GGUF) para llama.cpp, LM Studio, Ollama y similares, y en safetensors para vLLM, TGI o transformers, aunque esta ficha cubre la variante MLC.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / ejecucion | Licencia |
|---|---|---|---|---|
| LFM3-1.7B-MLC (esta ficha) | 1,73 B | 32K configurado (256K nativo en base) | MLC/WebLLM sobre WebGPU, int6 | apache-2.0 (repo); base LFM1.0 |
| LiquidAI/LFM3-1.7B (base) | 1,73 B | 256K | safetensors, servidores (vLLM, TGI) | LFM1.0 |
| LiquidAI/LFM3-1.7B-GGUF | 1,73 B | 256K | GGUF (llama.cpp, Ollama, LM Studio) | LFM1.0 |

No se incluyen comparativas de rendimiento porque no hay datos de benchmarks disponibles. Como referencias de categoría (LLM ~1-2B ejecutables en navegador con WebLLM) cabría mencionar modelos como Qwen2.5-1.5B o Llama-3.2-1B, pero no se dispone de datos verificables para una comparación cuantitativa en la información proporcionada.

## Limitaciones y advertencias

- Es un modelo base (base model), no un modelo alineado con instrucciones: puede generar texto sin formato de respuesta o de baja utilidad en chat sin un ajuste o plantilla adecuado; la model card no documenta afinado con instrucciones.
- Riesgo de alucinacion: inherente a cualquier LLM; no hay datos publicados sobre tasas de alucinación para este modelo.
- Contexto efectivo: aunque el modelo base soporta 256K tokens, esta conversión WebLLM está configurada con `context_window_size: 32768`; ampliarlo puede aumentar los requisitos de VRAM.
- Requisitos de navegador: requiere WebGPU y la característica `shader-f16`; en navegadores o dispositivos sin soporte, el modelo no funcionará.
- Ambigüedad de licencia: el repositorio declara `apache-2.0`, pero la propia model card indica que el modelo base (LiquidAI/LFM3-1.7B) se distribuye bajo LFM1.0 (`license: other`). Conviene verificar los términos de LFM1.0 antes de cualquier uso comercial del modelo base.
- Sesgos conocidos: no disponible; no se ha publicado información sobre sesgos en la model card.
- Compatibilidad de versiones: la conversión está construida para web-llm 0.2.85 (ABI `v0_2_84`); versiones distintas de WebLLM pueden no ser compatibles.
- Descargas prácticamente nulas (0 descargas, 1 like en el momento de la ficha): es una conversión comunitaria sin respaldo oficial de Liquid AI, por lo que se recomienda validar su calidad frente a los pesos originales.

## Enlaces

- Repositorio MLC: https://huggingface.co/CharlZKP/LFM3-1.7B-MLC
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Variante GGUF del modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B-GGUF
- WebLLM (GitHub): https://github.com/mlc-ai/web-llm
- Paper, blog oficial o demos adicionales: no disponible en la información proporcionada.
