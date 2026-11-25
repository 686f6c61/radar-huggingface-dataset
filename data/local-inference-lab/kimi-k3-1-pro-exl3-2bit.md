# local-inference-lab/Kimi-K3.1-Pro-EXL3-2bit

## Resumen

Kimi-K3.1-Pro-EXL3-2bit es una cuantización de 2 bits del modelo Kimi-K3.1-Pro de Moonshot AI, publicada por el laboratorio Local Inference Lab. No se trata de un modelo entrenado desde cero, sino de un checkpoint cuantizado con la técnica EXL3 (Trellis) que reduce los pesos de los expertos enrutados a 2 bits, manteniendo el resto de tensores en BF16/FP32. El modelo base es Kimi-K3.1-Pro, un transformer de tipo Mixture-of-Experts (MoE) con capacidades multimodales (visión) y decodificación especulativa mediante el módulo DSpark de Inferact.

La relevancia de esta ficha radica en que demuestra que es posible servir un modelo de aproximadamente 57.400 millones de parámetros totales en ocho GPUs profesionales Blackwell (RTX PRO 6000, SM120) con 96 GB cada una, alcanzando contextos de hasta 1.048.576 tokens y un rendimiento de decodificación agrupado de 235,30 tok/s en concurrencia de 4 peticiones. El paquete está diseñado para el runtime nativo `flare`, sin dependencia de Python, Torch ni compilación en tiempo de ejecución.

El repositorio contiene dos revisiones: `main` (checkpoint EXL3 bruto independiente del paralelismo, 742,235 GiB) y `gb202` (paquete Flare firmado para ocho GPUs SM120, 721,81 GiB). La licencia es propietaria (`kimi-k3.1-pro`), lo que condiciona su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atención DSA (DeepSeek Sparse Attention), capas KDA, visión y decodificación especulativa DSpark |
| Parametros totales | 57.369.533.184 (57,37 mil millones) |
| Parametros activos | no disponible (el modelo base es MoE, pero la cifra de activos no se especifica en la información) |
| Longitud de contexto | 1.048.576 tokens (1M) en la revisión `gb202`; 262.144 en la revisión anterior |
| Tipos de cuantizacion | EXL3 2-bit (Trellis) en expertos enrutados; MXFP8 en KDA input, KDA o_proj y encoder de visión; BF16/FP32 en el resto de tensores no expertos |
| Idiomas soportados | no disponible |
| Licencia | `kimi-k3.1-pro` (other, propietaria) |
| Formato de pesos | safetensors, con `custom_code` y librería `flare` |
| Tamaño del repositorio | 1.572,0 GB (ambas revisiones) |
| Revisión `main` | 742,235 GiB, checkpoint EXL3 bruto independiente de TP |
| Revisión `gb202` | 721,81 GiB, paquete Flare firmado para 8× SM120 de 96 GB |
| KV cache física | 1.105.920 tokens compartidos (1.080 páginas × 1.024 tokens, 28 snapshots) |
| VRAM retenida por GPU | 93.380,54 MiB |

## Arquitectura y entrenamiento

El modelo base Kimi-K3.1-Pro emplea una arquitectura transformer con mezcla de expertos (MoE), atención dispersa DSA (DeepSeek Sparse Attention) en 24 capas, capas KDA (Kimi Delta Attention), 92 expertos compartidos y 92 proyecciones latentes enrutadas up/down. Incluye un encoder de visión capaz de procesar hasta 16.384 parches (3,2 MP en HD) y 4 imágenes concurrentes. La cuantización EXL3 2-bit se aplica exclusivamente a los expertos enrutados, mientras que las capas de atención DSA, los expertos compartidos, los routers, la MLP densa de la capa 0, `embed_tokens` y `lm_head` se preservan en BF16 puro para evitar degradación de precisión.

El paquete `gb202` incorpora el módulo de decodificación especulativa DSpark de Inferact, con ventana deslizante de k=7, cuerpo en MXFP8 y cabeza en NVFP4, además de `markov_w1` en FP8. La decodificación EXL3 usa `trellis_t256` W2A16 para decode y un roofline MXFP8 para prefill, con rotaciones empaquetadas bit-exactas. Las colectivas PCIe TP8 se optimizan con `GatherRouterTopKTP8` (3,28× más rápido en routing) y `TP8RoMix7168`/`TP8RoResNorm7168` (184 lanzamientos menos por ronda). No se dispone de información sobre el número de tokens de entrenamiento, composición del dataset ni si hubo RLHF/DPO en el modelo base.

## Capacidades

- Generación de texto y razonamiento de propósito general, incluido modo de razonamiento extendido (el benchmark de Tetris contabiliza tokens de completion con reasoning).
- Generación de código: los benchmarks incluyen sesiones de coding en Rust (C1 decode) y un caso de Tetris con 24.584 tokens generados.
- Capacidades multimodales de visión: encoder con hasta 16.384 parches (3,2 MP HD) y 4 imágenes concurrentes.
- Decodificación especulativa DSpark con k=7 para acelerar la generación.
- Soporte de contexto largo de hasta 1.048.576 tokens, adecuado para documentos extensos y conversaciones multi-turno prolongadas.
- Servido concurrente con hasta 4 peticiones simultáneas verificadas en benchmarks.
- Caché de prefijo en RAM (64 GB configurados) y en disco (deshabilitado en la receta de referencia).
- Capacidades multilingües: no disponibles en la información proporcionada.
- Soporte de tool calling / function calling: no disponible en la información.
- Soporte de agentes y razonamiento multi-paso: no disponible explícitamente, aunque el modo de razonamiento y el contexto de 1M lo permiten en la práctica.

## Casos de uso

- Servicio de inferencia de propósito general en clústeres de 8 GPUs Blackwell: el paquete `gb202` está diseñado para desplegarse con `flare run` en ocho RTX PRO 6000 de 96 GB, ofreciendo 235,30 tok/s agrupados con 4 peticiones concurrentes, adecuado para APIs internas de generación de texto.
- Análisis de documentos largos: con 1.048.576 tokens de contexto y 1.105.920 tokens de KV física, permite procesar libros completos, expedientes o bases de código extensas en una sola pasada sin truncamiento.
- Asistentes de coding en producción: los benchmarks de decode C1 en Rust (112,13 tok/s) y coding agrupado (110,65 tok/s, pico 125,86) lo hacen viable para autocompletado y generación de código en pipelines de CI/CD, aunque requiere integración con el runtime `flare`.
- Procesamiento multimodal de imágenes: el encoder de visión con 3,2 MP y 4 imágenes concurrentes permite tareas de descripción, extracción de información y respuesta visual en documentos escaneados.
- Investigación en cuantización extrema: el checkpoint `main` (EXL3 bruto) sirve como referencia para estudiar el impacto de 2 bits en expertos enrutados y para reexportar a otros runtimes compatibles con EXL3.
- Despliegue con decodificación especulativa: DSpark con k=7 y cuerpo MXFP8 permite reducir la latencia en generaciones largas, como demuestra la sesión de Tetris con 147,97 tok/s medios incluyendo TTFT.
- Evaluación de infraestructura PCIe Gen5: el paquete requiere PCIe Relaxed Ordering y P2P, por lo que es útil para validar configuraciones de clúster con colectivas TP8 optimizadas.

## Benchmarks y rendimiento

Medidos nativamente con `flare run` en 8× RTX PRO 6000 Blackwell (SM120), `RO=1`, 16.365 MHz, 99,80 % de utilización media de GPU, 421,0 W medios y 470,2 W máximos, con sampling por defecto (temperature=1.0, top_p=0.95):

| Carga de trabajo | Resultado | Notas |
|---|---:|---|
| Decode concurrente 4 peticiones (agrupado) | 235,30 tok/s (58,82/pet.) | +48,5 % frente a `gb202` anterior (158,45 tok/s); ronda exacta M=16 en 35,78 ms |
| Decode C1 en Rust, media de 3 semillas | 112,13 tok/s | Semillas 359/431/533: 115,15 / 104,98 / 116,26 tok/s |
| Decode C1 coding agrupado, 9 peticiones | 110,65 tok/s | Pico 125,86 tok/s; ronda exacta M=4 en 19,17 ms |
| Prefill 32K sin caché (media) | 2.235,14 tok/s | TTFT 13,22 s sobre 29.557 tokens (+14,6 % frente a 1.951,16 tok/s) |
| Sesión de coding Tetris en vivo | 147,97 tok/s medios con TTFT | 24.584 tokens de completion (incl. razonamiento) en 166,1 s; pico 260,41 tok/s |
| Capacidad KV física | 1.105.920 tokens | 1.080 páginas × 1.024 tokens, 28 snapshots, 1.048.576 de secuencia máxima |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: 93.380,54 MiB retenidos por GPU en la configuración de referencia (8 GPUs), con un total de aproximadamente 721,81 GiB de pesos en la revisión `gb202`.
- GPU recomendadas: 8× NVIDIA RTX PRO 6000 Blackwell Workstation (96 GB, SM120) con P2P habilitado. No se contemplan A100 ni H100 en la documentación del paquete.
- No cabe en GPUs de consumo (RTX 4090 de 24 GB ni similares): el modelo requiere 8 GPUs profesionales de 96 GB.
- Sistema operativo: Linux x86-64; CUDA 13.2; driver NVIDIA 615.71.10; ~750 GiB de disco para la caché del paquete.
- Opciones de despliegue: runtime nativo `flare run` (sin Python, Torch, compilación ni autotuning). No se documentan vLLM, llama.cpp, Ollama ni TGI para esta cuantización.
- Ajuste de host: PCIe Relaxed Ordering activado en `/etc/modprobe.d/nvidia-relaxed-ordering.conf` con `options nvidia NVreg_EnablePCIERelaxedOrderingMode=1`.
- Latencia y throughput: TTFT de 13,22 s en prefill de 29.557 tokens; rondas de decode de 35,78 ms (M=16) y 19,17 ms (M=4); 235,30 tok/s agrupados con 4 peticiones concurrentes.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de benchmarks estándar para comparar con alternativas como DeepSeek-V3, Qwen3-MoE o Llama-4 en la información proporcionada. La comparación se limita a la revisión anterior del mismo paquete:

| Aspecto | `gb202` anterior (20261108) | `gb202` actual (20261123) |
|---|---|---|
| Alcance MXFP8 online | `all` (DSA, shared experts, routed latent, KDA) | `kda-all` (solo KDA input, KDA o_proj y visión; resto BF16 puro) |
| Draft especulativo | DFlash2 (k=7, cabeza MXFP8) | DSpark (k=7, cuerpo MXFP8, cabeza NVFP4, markov_w1 FP8) |
| Encoder de visión | BF16 replicado (853,3 MiB/GPU) | TP8 sharded + MXFP8 (71,1 MiB/GPU) |
| Contexto máximo | 262.144 tokens | 1.048.576 tokens |
| KV física compartida | 1.281.024 tokens | 1.105.920 tokens |
| Decode agrupado C4 | 158,45 tok/s (39,61/pet.) | 235,30 tok/s (58,82/pet.) |
| Prefill 32K en frío | 1.951,16 tok/s | 2.235,14 tok/s |

## Limitaciones y advertencias

- Licencia propietaria `kimi-k3.1-pro` (other): el uso comercial está sujeto a los términos del modelo base de Moonshot AI; no es una licencia open source permisiva.
- Cuantización agresiva de 2 bits en expertos enrutados: aunque se preserva BF16 en capas sensibles, puede haber degradación de calidad frente al modelo base en tareas de razonamiento fino o matemáticas, no cuantificada en la información.
- Requisitos de hardware muy restrictivos: 8 GPUs SM120 de 96 GB con P2P y PCIe Relaxed Ordering; no es desplegable en infraestructura convencional ni en GPUs de consumo.
- Dependencia del runtime `flare`: no hay soporte documentado para vLLM, llama.cpp, Ollama o TGI, lo que limita la portabilidad y la integración con ecosistemas estándar.
- Idiomas soportados no disponibles: no se puede confirmar cobertura multilingüe ni calidad por idioma.
- Riesgo de alucinación: no se han publicado evaluaciones de fidelidad ni tasas de alucinación en la información disponible.
- Sesgos conocidos: no disponibles.
- El paquete `gb202` está firmado por Local Inference Lab con claves de publisher; la verificación requiere descargar `publisher.json` y usar `--publisher-keys`.
- El contexto máximo de 1M tokens depende de la configuración de KV cache (`--kv-cache-limit memory`) y de la memoria disponible; en la referencia se retienen 93.380,54 MiB por GPU.
- La revisión `main` no es directamente servible sin un runtime compatible con EXL3; está pensada para reexportación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/local-inference-lab/Kimi-K3.1-Pro-EXL3-2bit
- Revisión `gb202` (paquete Flare firmado): https://huggingface.co/local-inference-lab/Kimi-K3.1-Pro-EXL3-2bit/tree/gb202-tp8-dcp8-c4-dspark-kda-all-20261123
- Modelo base Kimi-K3.1-Pro: https://huggingface.co/moonshotai/Kimi-K3.1-Pro
- Modelo base DSpark: https://huggingface.co/Inferact/Kimi-K3.1-Pro-DSpark
- Publicador `publisher.json`: https://huggingface.co/local-inference-lab/Kimi-K3.1-Pro-EXL3-2bit/resolve/gb202/publisher.json
