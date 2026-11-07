# GRRNMAKE/GLM5.3Flash_symb

## Resumen
GLM5.3Flash_symb es una conversión estructural del modelo zai-org/GLM-5.3-Flash al formato de pesos propietario `.symb` desarrollado por Cognitus Lab, publicada por el usuario GRRNMAKE bajo la librería `axim-os`. No se trata de un modelo entrenado desde cero, sino de una redistribución cuantizada (INT4 group-128 y FP32 selectivo) del modelo base de Zhipu AI, orientada a ejecución sin CUDA mediante el runtime AXIM OS. El repositorio incluye tanto los pesos nativos con vocabulario de 154.880 tokens como una transferencia de tokenizer al vocabulario SYNAXIM de 128.256 tokens mediante el pipeline MATT/AIM Layer-00.

El modelo base es un transformer híbrido con 45 capas que combinan Kimi Delta Attention (KDA) recurrente y NoPE-MLA, 42 capas MoE con 288 expertos enrutados más uno compartido por capa, y conexiones de hiperconexión de 4 flujos con matrices Sinkhorn-Knopp conservadas en FP32. La relevancia de esta ficha radica en que documenta un formato de pesos alternativo que promete reducir el footprint en disco y VRAM de forma drástica (hasta un 94,6 % según el autor), a costa de depender de un runtime propietario y de una licencia no estándar.

La información disponible proviene exclusivamente de la model card del autor; no hay resultados de benchmarks de calidad del modelo, ni documentación independiente sobre el formato `.symb` o el runtime `axim-os`. Cualquier evaluación de producción debería tratar las cifras de rendimiento como afirmaciones del autor no verificadas de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: 45 capas (34 KDA + 11 NoPE-MLA), 42 capas MoE, 4-stream Manifold-Constrained Hyper-Connections, módulo MTP en capa 45 |
| Parametros totales | no disponible (el repo ocupa 87,7 GB; el autor reporta 328,30 GB en safetensors originales y 159,11 GB convertidos) |
| Parametros activos | 288 expertos enrutados + 1 compartido por capa MoE; número total de parámetros activos no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT4 simétrico group-128 (rango [-7, 7] desplazado +8 en nibbles uint8, escalas FP32 por grupo); FP32 sin pérdida para normas 1D, router gates, `e_score_correction_bias`, `dt_bias`, `A_log`, `conv1d` y parámetros `hc_*` |
| Idiomas soportados | en, zh, multilingual |
| Licencia | cognitus-public-symbolic-license-1.0 (etiquetada como `other`; enlace a LICENSE en el repo) |
| Formato de pesos | `.symb` (formato binario propietario de Cognitus Lab), con cabecera autodescriptiva (`ndim`, `shape[]`, `n_elements`, `group_size`) |

## Arquitectura y entrenamiento
El modelo base GLM-5.3-Flash emplea una arquitectura híbrida que alterna 34 capas de Kimi Delta Attention (atención lineal recurrente por chunks) con 11 capas de NoPE-MLA (Multi-head Latent Attention sin positional encoding explícito), más un módulo MTP (Multi-Token Prediction) en la capa 45. Las capas MoE contienen 288 expertos enrutados y 1 experto compartido, y el backbone incorpora conexiones de hiperconexión de 4 flujos con matrices de Sinkhorn-Knopp, que en la conversión se preservan en FP32 para no degradar el enrutamiento. El vocabulario nativo es de 154.880 tokens.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset, ni si el modelo base utilizó RLHF, DPO u otras técnicas de alineación; la model card no los detalla. La innovación técnica documentada por el autor es exclusivamente la relativa a la conversión: cuantización INT4 group-128 con escalas FP32 derivadas de los `weight_scale_inv` F8_E4M3 originales, almacenamiento FP32 sin pérdida para parámetros sensibles, y un pipeline de transferencia de tokenizer (MATT/AIM Layer-00) que alinea los embeddings al vocabulario SYNAXIM con un 87,38 % de solapamiento exacto (112.072 de 128.256 tokens).

## Capacidades
- Generación de texto autoregresiva con pipeline `text-generation`.
- Razonamiento y codificación agéntica, según el tag `agentic-coding` del autor.
- Soporte multilingüe declarado para inglés, chino y otros idiomas (`multilingual`).
- Ejecución sin CUDA mediante el runtime `axim-os` (SIMD/NEON + OpenMP), con dequantización INT4→BF16/FP32 en memoria host.
- Doble tokenizer: vocabulario nativo GLM-5.3-Flash (154.880) y vocabulario SYNAXIM transferido (128.256), con tokenizer JSON incluido.
- Módulo MTP (Multi-Token Prediction) presente en la arquitectura, aunque no se documenta su uso en la generación.
- No se documentan capacidades de visión, audio, tool calling ni function calling en la información disponible.

## Casos de uso
- Despliegue en hardware sin CUDA: el runtime `axim-os` permite cargar los pesos `.symb` en CPU con kernels SIMD/NEON y OpenMP, lo que habilita inferencia en servidores ARM64 (el autor cita un Grace de 72 núcleos) sin depender de drivers NVIDIA.
- Reducción de huella en disco para distribución de modelos: la conversión reduce el repositorio de 328,30 GB a 159,11 GB, útil para almacenar y servir el modelo en registros con cuotas de almacenamiento ajustadas.
- Inferencia con VRAM limitada: el autor reporta 17,70 GB de HBM3 activos frente a más de 328 GB con safetensors, lo que permitiría ejecutar el modelo en una única GPU de 96 GB (GH200) con streaming MoE en lugar de multi-GPU.
- Prototipado de investigación sobre atención lineal híbrida: la combinación KDA + NoPE-MLA + MoE con hiperconexiones es un caso de estudio para experimentos de eficiencia en contextos largos, siempre que se valide la fidelidad de la conversión.
- Evaluación de formatos de pesos alternativos: útil para equipos que comparan `.symb` frente a GGUF, AWQ o FP8 en términos de velocidad de carga (el autor reporta 3,20 s para el backbone de 45 capas) y throughput de dequantización (12,91 GB/s comprimido).
- Integración en pipelines de generación de texto multilingüe EN/ZH: el doble vocabulario permite reutilizar el modelo con el tokenizer nativo o con SYNAXIM según el stack existente.
- Servicio de chat interactivo con TTFT bajo: el autor reporta 1,41 s de time-to-first-token en caliente con las 45 capas, adecuado para interfaces conversacionales donde la latencia inicial es crítica.

## Benchmarks y rendimiento
La model card no incluye resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K ni similares). Los únicos datos publicados son métricas de carga y memoria del runtime AXIM OS 1.1.3 sobre un NVIDIA GH200:

| Metrica | Safetensors (62 shards) | `.symb` + AXIM OS 1.1.3 | Mejora |
|---|---|---|---|
| Huella en disco | 328,30 GB (76.108 entradas) | 159,11 GB (38.772 archivos) | 2,06x menor |
| VRAM activa | > 328 GB (multi-GPU) | 17,70 GB HBM3 | 94,6 % de reducción |
| Precarga del backbone (45 capas, 1.169 archivos, 4,39 GB) | 42,0 s o más | 3,20 s (0,34 s de dequant) | > 13x más rápido |
| Throughput de dequantización | — | 12,91 GB/s comprimido (~50 GB/s BF16, 0,29 ms/tensor) | — |
| Streaming MoE en vivo (23.999 archivos, 106,46 GB) | — | 8,83 s (0,37 ms por matriz de experto) | — |
| TTFT en caliente (45 capas) | — | 1,41 s | — |

No se han publicado resultados de benchmarks de calidad en la información disponible.

## Requisitos de hardware
- VRAM estimada: 17,70 GB de HBM3 activos según el autor con streaming MoE; el repositorio completo ocupa 87,7 GB en disco.
- GPU recomendadas: NVIDIA GH200 (96 GB HBM3) es la plataforma de referencia de los benchmarks; no se documentan pruebas en A100, H100 ni RTX 4090.
- GPU de consumo: no hay datos que confirmen que quepa en una RTX 4090 (24 GB) con el runtime `axim-os`; el autor solo reporta cifras en GH200.
- Despliegue: runtime propietario `axim-os` (`pip install axim-os`, bibliotecas `libaxim_cpu.so` / `libaxim_gpu.so`); no se menciona compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: TTFT en caliente de 1,41 s y dequantización a 12,91 GB/s comprimido en GH200; no se reportan tokens por segundo en generación.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| GLM5.3Flash_symb | no disponible (288 expertos enrutados por capa MoE) | no disponible | cognitus-public-symbolic-license-1.0 | `.symb` | Hugging Face, requiere `axim-os` |
| zai-org/GLM-5.3-Flash (base) | no disponible | no disponible | no disponible en la información | safetensors (62 shards, 328,30 GB) | Hugging Face |
| Kimi-K3 (citado por el autor) | 61 capas MLA + 384 expertos enrutados | no disponible | no disponible | `.symb` (conversión) | no disponible |
| Chííké (citado por el autor) | 32 capas densas | no disponible | no disponible | `.symb` | no disponible |

No se dispone de datos de rendimiento comparativo entre estos modelos; la comparativa se limita a arquitectura, formato y licencia.

## Limitaciones y advertencias
- Licencia `cognitus-public-symbolic-license-1.0` (etiquetada como `other`): no es una licencia OSI estándar; es imprescindible revisar el archivo LICENSE antes de cualquier uso comercial o redistribución.
- Dependencia de un runtime propietario (`axim-os`) para aprovechar el formato `.symb`; sin él, la utilidad del repositorio es limitada y no se documenta compatibilidad con ecosistemas estándar (vLLM, llama.cpp, TGI).
- Las cifras de rendimiento y memoria provienen exclusivamente del autor y no han sido verificadas de forma independiente.
- No hay benchmarks de calidad publicados: se desconoce si la conversión INT4 introduce degradación en razonamiento, código o matemáticas respecto al modelo base.
- La transferencia al tokenizer SYNAXIM cubre el 87,38 % del vocabulario; el 12,62 % restante (16.184 tokens) no tiene correspondencia exacta, lo que puede afectar a la coherencia en dominios con vocabulario especializado.
- Riesgo de alucinación inherente a los modelos generativos; no se documentan evaluaciones de factualidad ni de sesgos.
- Idiomas declarados: en, zh y multilingüe; no se garantiza un rendimiento homogéneo en castellano ni en otras lenguas no listadas.
- Longitud de contexto no documentada, lo que impide planificar casos de uso con ventanas largas.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria.

## Enlaces
- Hugging Face: https://huggingface.co/GRRNMAKE/GLM5.3Flash_symb
- Modelo base: https://huggingface.co/zai-org/GLM-5.3-Flash
- Paquete PyPI de AXIM OS: https://pypi.org/project/axim-os/
- Tokenizer SYNAXIM (referenciado): https://huggingface.co/GRRNMAKE/SYNAXIM
- Licencia: archivo LICENSE dentro del repositorio de Hugging Face
