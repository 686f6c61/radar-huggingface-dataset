# GRRNMAKE/kimi3_symb

## Resumen

Kimi-K3 (edición `symb`, formato simbólico universal) es una conversión del modelo Kimi-K3 al formato de pesos `.symb` desarrollado por Cognitus Lab, publicada por el usuario GRRNMAKE bajo el identificador `GRRNMAKE/kimi3_symb`. Se trata de un modelo de generación de texto de arquitectura híbrida a gran escala: 93 capas con `hidden_size = 7.168`, combinando 69 capas de Kimi Delta Attention (KDA) con 24 capas de Multi-Head Latent Attention (MLA), y 896 expertos enrutados de tipo Latent-MoE más expertos compartidos por capa. El repositorio ocupa 392,8 GB.

El problema que aborda esta publicación no es el modelado en sí, sino el despliegue: el formato `.symb` y el runtime AXIM OS (instalable vía `pip install axim-os`) permiten cargar y descomprimir los pesos (INT4/MXFP4 con grupo de 128, normas y routers en FP32) directamente en memoria host mediante SIMD/NEON y OpenMP, sin sobrecarga del cargador de pesos de CUDA. El autor reporta que un paso forward en caliente de las 93 capas con 3.795 tensores se ejecuta en 4,1 s en un único nodo GH200, con una huella de VRAM activa que cabe en 96 GB de HBM3.

La relevancia actual es doble: por un lado, demuestra un pipeline de conversión y ejecución de un modelo frontera de escala muy grande en hardware de un solo nodo; por otro, incluye una transferencia de tokenizer SYNAXIM (vocabulario de 128.256) junto a los pesos nativos (vocabulario de 163.840), habilitando tokenización unificada entre modelos. El modelo está etiquetado para inglés, chino y multilingüe, y se distribuye bajo la licencia `cognitus-public-symbolic-license-1.0`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: 69 capas Kimi Delta Attention (KDA) + 24 capas Multi-Head Latent Attention (MLA); Latent-MoE con 896 expertos enrutados + expertos compartidos por capa; Attention/MLP Block Residuals |
| Parametros totales | no disponible (el autor solo indica 93 capas y `hidden_size = 7.168`; no se publica el recuento total) |
| Parametros activos | no disponible (MoE con 896 expertos enrutados; no se especifica cuántos se activan por token) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT4 y MXFP4 con grupo de 128 en los pesos `.symb`; normas y routers en FP32 |
| Idiomas soportados | en, zh, multilingual |
| Licencia | cognitus-public-symbolic-license-1.0 (etiqueta `license: other`) |
| Formato de pesos | `.symb` (formato simbólico universal de Cognitus Lab); no se distribuyen safetensors ni GGUF |

## Arquitectura y entrenamiento

La arquitectura combina dos mecanismos de atención en una pila de 93 capas: 69 capas de Kimi Delta Attention (KDA) y 24 capas de Multi-Head Latent Attention (MLA), con residuales a nivel de bloque de atención y MLP. La capa MoE es de tipo Latent-MoE con 896 expertos enrutados más expertos compartidos por capa, lo que sitúa al modelo en la categoría de MoE de grano muy fino. La clase de implementación es `KimiK3ForConditionalGeneration` y el tamaño oculto es de 7.168.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre si se aplicaron fases de RLHF, DPO u otras técnicas de alineación. Tampoco se documentan innovaciones de decodificación (especulativa u otras) más allá de la propia arquitectura de atención. La innovación destacable de esta publicación es de infraestructura: el formato `.symb` con descompresión in-place en memoria host mediante el motor nativo de AXIM OS, que el autor cifra en 0,62–1,07 ms por tensor (3.795 tensores descomprimidos en 2,36 s) frente a 35–60 ms con descompresión Python/CUDA, es decir, más de 30 veces más rápido. Además, se incluye una transferencia de tokenizer SYNAXIM mediante alineación de espacio de características MATT/AIM Layer-00, con embeddings y `lm_head` propios para el vocabulario de 128.256.

## Capacidades

- Generación de texto autoregresiva con pipeline `text-generation`.
- Razonamiento y codificación agéntica, según la etiqueta `agentic-coding` del autor.
- Soporte multilingüe con foco en inglés y chino, más etiqueta genérica `multilingual`.
- Tokenización dual: vocabulario nativo de 163.840 y vocabulario SYNAXIM de 128.256 con alineación de espacio de características.
- Ejecución sin CUDA mediante el runtime AXIM OS (SIMD/NEON + OpenMP) con descompresión INT4/MXFP4 a BF16/FP32 en memoria host.
- No se documenta soporte explícito de tool calling, function calling, visión, audio ni modo de razonamiento extendido (thinking mode) en la información disponible.

## Casos de uso

- Despliegue de un modelo frontera en un único nodo: gracias a la descompresión en streaming de AXIM OS, el modelo cabe en una GPU de 96 GB de HBM3, lo que permite servir inferencia de gran escala sin clúster multi-nodo.
- Investigación en formatos de pesos: el repositorio sirve como referencia práctica para estudiar la conversión de un transformer híbrido KDA+MLA+MoE a un formato cuantizado INT4/MXFP4 con grupo de 128 y validar la coherencia de la descompresión.
- Evaluación de transferencia de tokenizer: los pesos SYNAXIM permiten experimentar con tokenización unificada entre modelos y medir el impacto de la alineación Layer-00 en la coherencia de las salidas.
- Codificación agéntica en pipelines internos: la etiqueta `agentic-coding` sugiere uso en tareas de generación y edición de código dentro de flujos automatizados, aunque sin datos de benchmark que lo respalden.
- Procesamiento de texto en inglés y chino: adecuado para aplicaciones bilingües o multilingües que requieran un modelo de gran capacidad, con la cautela de que no se publica la longitud de contexto.
- Benchmarking de runtimes alternativos: útil para comparar el rendimiento de AXIM OS frente a cargadores CUDA estándar en la misma máquina GH200, con las cifras de descompresión y forward ya reportadas por el autor.

## Benchmarks y rendimiento

El autor no publica resultados en benchmarks de calidad (MMLU, HumanEval, GSM8K u otros). Sí se reportan métricas de infraestructura medidas en un NVIDIA GH200 (96 GB HBM3 + CPU Grace ARM64 de 72 núcleos con `axim-os 1.1.3`):

| Metrica | Carga estandar | `.symb` + AXIM OS 1.1.3 |
|---|---|---|
| Cobertura de pesos | — | 100% `.symb` (INT4/MXFP4 grupo 128 + FP32 en normas/routers) |
| Descompresion por tensor | 35–60 ms (Python/CUDA) | 0,62–1,07 ms |
| Descompresion total (3.795 tensores) | — | 2,36 s |
| Paso forward en caliente (93 capas) | Requiere clúster multi-nodo | 4,1 s en un solo nodo |
| VRAM activa | > 1.000 GB (pesos crudos multi-nodo) | Cabe en 96 GB HBM3 |

No se han publicado resultados de benchmarks de calidad en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el autor indica que la huella activa cabe en 96 GB de HBM3 con streaming de AXIM OS; no se detalla el consumo por cuantización más allá de INT4/MXFP4.
- GPU recomendadas: NVIDIA GH200 Grace Hopper (96 GB HBM3) es la plataforma de referencia de las mediciones; no se documentan otras GPU.
- GPU de consumo: no disponible; con 392,8 GB de pesos en el repositorio y una arquitectura de 93 capas con 896 expertos, no hay indicios de que quepa en GPU de consumo.
- Despliegue: runtime AXIM OS (`pip install axim-os`, bibliotecas nativas `libaxim_cpu.so` / `libaxim_gpu.so`); no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: paso forward en caliente de 4,1 s en GH200; descompresión de 2,36 s para los 3.795 tensores. No se publica throughput de generación (tokens/s).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| `GRRNMAKE/kimi3_symb` | no disponible (93 capas, hidden 7.168, MoE 896 expertos) | no disponible | cognitus-public-symbolic-license-1.0 | `.symb` | Conversion de Kimi-K3 con runtime AXIM OS |
| `GRRNMAKE/GLM5.3Flash_symb` | no disponible (45 capas, KDA + NoPE-MLA, MoE de 4 streams) | no disponible | no disponible | `.symb` | Misma familia de conversiones de Cognitus Lab |
| Kimi-K3 nativo | no disponible | no disponible | no disponible | no disponible | Modelo original del que deriva esta conversion |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- No se publican resultados de benchmarks de calidad; no hay evidencia cuantitativa del rendimiento del modelo en tareas de razonamiento, código o matemáticas.
- La licencia `cognitus-public-symbolic-license-1.0` es de tipo `other`; deben revisarse sus términos antes de cualquier uso comercial.
- El repositorio tiene 0 descargas y 0 likes, y fue creado en noviembre de 2026; no hay validación comunitaria ni informes independientes de uso.
- El formato `.symb` requiere el runtime propietario AXIM OS; no hay soporte documentado para vLLM, llama.cpp, Ollama o TGI, lo que limita la portabilidad.
- No se documenta la longitud de contexto, lo que impide planificar aplicaciones de contexto largo.
- El tamaño del repositorio (392,8 GB) y la arquitectura de 896 expertos implican requisitos de almacenamiento y memoria muy elevados.
- Riesgo de alucinación y sesgos: no disponible; no se publica información sobre datos de entrenamiento ni evaluaciones de sesgo.
- Las cifras de rendimiento proceden únicamente del autor y no han sido replicadas de forma independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GRRNMAKE/kimi3_symb
- Paquete AXIM OS en PyPI: https://pypi.org/project/axim-os/
- Conversión relacionada GLM-5.3-Flash: https://huggingface.co/GRRNMAKE/GLM5.3Flash_symb
- Tokenizer SYNAXIM (referenciado en la model card): https://huggingface.co/GRRNMAKE/SYNAXIM
