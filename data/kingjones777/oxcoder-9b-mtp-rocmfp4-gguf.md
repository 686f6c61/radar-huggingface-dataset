# kingjones777/OxCoder-9B-MTP-ROCmFP4-GGUF

## Resumen

OxCoder-9B-MTP-ROCmFP4-GGUF es una colección de cuantizaciones de 4 bits (formato ROCmFP4/ROCmFPX) del modelo de código OrionLLM/OxCoder-9B, publicada por el usuario kingjones777. El modelo base es un transformer denso de 32 capas con arquitectura híbrida Qwen3.5: 24 capas de atención lineal Gated DeltaNet y 8 capas de atención completa (una de cada cuatro), con 9.409.813.744 parámetros en BF16, hidden de 4096, FFN de 12288, 16 cabezas de atención y 4 de KV, y una ventana de contexto de 262.144 tokens. Es multimodal, con torre de visión de 456.010.480 parámetros.

El valor diferencial de esta publicación no es la cuantización en sí, sino el injerto de una cabeza MTP (multi-token prediction) dentro de cada fichero GGUF para habilitar decodificación especulativa en llama.cpp sobre hardware AMD Strix Halo (gfx1151). Según las mediciones del autor, la cabeza MTP eleva la decodificación de 38,50 a 64,36 tok/s (1,67×) con una tasa de aceptación de borradores de 0,743.

La publicación está optimizada y medida específicamente en un Ryzen AI Max+ 395 con Radeon 8060S, ROCm 7.2.4 y un `llama-server` parcheado. Incluye tres variantes de 4 bits (STRIX_LEAN, COHERENT y FAST) con matrices de importancia, además de un proyector de visión. Es relevante para desarrolladores que quieran ejecutar un modelo de código de 9B con contexto largo en hardware AMD integrado, un nicho poco cubierto por las cuantizaciones convencionales orientadas a NVIDIA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso híbrido Qwen3.5: 32 capas (24 Gated DeltaNet de atención lineal + 8 de atención completa, una cada 4); hidden 4096, FFN 12288, 16 cabezas de atención, 4 de KV |
| Parametros totales | 9.409.813.744 (BF16, incluye torre de visión de 456.010.480); pesos de texto 8.953.803.264; bloque MTP injertado 243.290.624 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | Q4_0 en formato ROCmFP4/ROCmFPX, tres variantes: STRIX_LEAN (ftype 106, 4,69 BPW), COHERENT (ftype 102, 4,97 BPW), FAST (ftype 103, 4,52 BPW) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base es un transformer denso con arquitectura híbrida Qwen3.5, que alterna capas de atención lineal Gated DeltaNet con capas de atención completa cada cuatro capas. Esta combinación reduce el coste computacional y de memoria de la atención en contextos largos (262.144 tokens) manteniendo capacidad de recuperación global. El checkpoint declara `mtp_num_hidden_layers: 1`, pero no incluye tensores `mtp.*`; cada fichero de esta publicación lleva una cabeza MTP injertada en el propio GGUF, derivada del modelo base declarado, lo que habilita decodificación especulativa dentro de llama.cpp sin ficheros auxiliares.

Las cuantizaciones se construyen con matrices de importancia (importance matrix) sobre tres niveles de 4 bits, con pesos efectivos de 4,52 a 4,97 bits por peso sobre los 9.197.093.888 pesos de cada GGUF (pesos de texto más bloque MTP). No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni el uso de RLHF/DPO en el modelo original. La innovación técnica destacable es el injerto de la cabeza MTP junto con un parche de servidor incluido en `recipe/patches/`, necesario para que la caché de prompt funcione correctamente con MTP cargado.

## Capacidades

- Generación de código: el modelo está entrenado específicamente para tareas de programación, incluyendo generación, edición y finalización de código.
- Razonamiento multimodal texto-imagen: pipeline `image-text-to-text` con torre de visión y proyector incluido en la publicación.
- Decodificación especulativa con MTP: cabeza multi-token prediction injertada que acelera la generación autoregresiva.
- Contexto largo: ventana de 262.144 tokens, adecuada para repositorios completos o conversaciones extensas.
- Compatibilidad con llama.cpp: ejecución mediante `llama-server` y `llama-quantize`, con soporte de caché de prompt (requiere parche con MTP).
- Aceleración en AMD: optimizado para ROCm y Vulkan sobre gfx1151 (Strix Halo).
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y multi-step reasoning: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Asistencia de código en local sobre hardware AMD integrado: el modelo puede autocompletar y generar código en un Ryzen AI Max+ 395 sin GPU dedicada, gracias a las cuantizaciones de ~5 GiB y al soporte ROCm/Vulkan de llama.cpp.
- Autocompletado en IDE con contexto de repositorio: la ventana de 262.144 tokens permite incluir varios ficheros y documentación en el prompt; la caché de prompt (con el parche incluido) evita reprocesar el prefijo en cada petición.
- Revisión y explicación de código con capturas de pantalla: la torre de visión permite pasar diagramas de arquitectura, mensajes de error renderizados o capturas de interfaces para que el modelo los interprete junto al código.
- Servidor de inferencia monousuario de baja latencia: con `--parallel 1` y decodificación especulativa MTP se alcanzan ~65 tok/s en ROCm0, suficiente para flujos interactivos de chat o edición.
- Generación de tests y documentación técnica: el contexto largo y la naturaleza orientada a código permiten generar suites de pruebas o docstrings a partir de módulos completos.
- Prototipado de pipelines multimodales en entornos AMD: el proyector de visión incluido permite experimentar con tareas image-text-to-text en Strix Halo sin depender de ecosistemas CUDA.
- Evaluación de cuantizaciones de 4 bits: las tres variantes con métricas de KLD, PPL y tasa de aceptación publicadas sirven como referencia para comparar estrategias de cuantización en otros modelos.

## Benchmarks y rendimiento

Mediciones del autor en Ryzen AI Max+ 395 (Radeon 8060S), ROCm 7.2.4, `llama-server` parcheado, `-c 65536`, `--parallel 1`, greedy, 256 tokens generados tras un prompt de código de 7.094–7.102 tokens, mediana de 3 ejecuciones tras 1 de calentamiento.

| Fichero | ftype | Tamano | BPW | KLD vs BF16 | Top-1 igual | PPL (× BF16) | TG MTP ROCm0 (tok/s) | TG MTP Vulkan0 (tok/s) | PP ROCm0 (tok/s) |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| STRIX_LEAN | 106 | 5,03 GiB | 4,69 | 0,0879 ± 0,0034 | 89,29 % | 6,7713 ± 0,0829 (×1,0185) | 65,80 | 60,98 | 898 |
| COHERENT | 102 | 5,34 GiB | 4,97 | 0,0857 ± 0,0033 | 89,31 % | 6,6389 ± 0,0802 (×0,9986) | 57,40 | 60,53 | 803 |
| FAST | 103 | 4,85 GiB | 4,52 | 0,0890 ± 0,0033 | 88,94 % | 6,8166 ± 0,0835 (×1,0253) | 64,81 | 61,72 | 899 |
| Referencia BF16 | 32 | 17,14 GiB | 16,00 | 0 | 100 % | 6,6482 ± 0,0810 | — | — | — |

Efecto de la cabeza MTP: 64,36 tok/s frente a 38,50 tok/s sin ella (1,67×), con aceptación de borradores de 0,743. El autor indica que STRIX_LEAN decodifica un 14,6 % más rápido que COHERENT en ROCm0 y prellena un 11,8 % más rápido; FAST no aporta una ganancia clara de velocidad frente a STRIX_LEAN (diferencias dentro del ruido). No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: ~5,03 GiB (STRIX_LEAN), ~5,34 GiB (COHERENT) y ~4,85 GiB (FAST) solo para pesos; hay que sumar el proyector de visión y la caché KV, que con 262.144 tokens de contexto puede ser considerable.
- Hardware de referencia: AMD Ryzen AI Max+ 395 con Radeon 8060S (gfx1151), ROCm 7.2.4. También medido en Vulkan0.
- GPU recomendadas: Radeon 8060S (integrada en Strix Halo); otras GPU AMD con soporte ROCm no han sido medidas en la información disponible. No hay datos para A100, H100 o RTX 4090.
- GPU de consumo: cabe en memoria unificada de un Ryzen AI Max+ 395; no se dispone de datos para GPU de consumo NVIDIA.
- Despliegue: llama.cpp (`llama-server`, `llama-quantize`), con parche de servidor incluido en `recipe/patches/` para caché de prompt con MTP. vLLM, TGI y Ollama no se mencionan en la información disponible.
- Latencia y throughput: decodificación de 57,40–65,80 tok/s en ROCm0 y 60,53–61,72 tok/s en Vulkan0; prefill de 803–899 tok/s en ROCm0, con prompt de ~7.100 tokens.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Enfoque |
|---|---|---|---|---|---|
| OxCoder-9B-MTP-ROCmFP4 (esta ficha) | 9,41B (9,20B en GGUF) | 262.144 | ROCmFP4 Q4_0 (4,52–4,97 BPW) | Apache 2.0 | Código + visión, optimizado AMD |
| OrionLLM/OxCoder-9B (base) | 9,41B | 262.144 | BF16 | Apache 2.0 | Código + visión, sin cuantizar |
| Variante imatrix del mismo autor | 9,20B en GGUF | 262.144 | ROCmFP4 Q4_0 con imatrix | Apache 2.0 | Misma base, métricas de calidad distintas |

No se dispone de datos de rendimiento de modelos comparables de terceros en la información proporcionada.

## Limitaciones y advertencias

- La publicación está optimizada y validada exclusivamente en AMD Strix Halo (gfx1151) con ROCm 7.2.4; el rendimiento en otras GPU o backends no está medido.
- La caché de prompt con MTP requiere aplicar el parche de servidor incluido; sin él, un build de esta línea ROCmFPX no reutiliza nada mientras la cabeza está cargada.
- Las cuantizaciones de 4 bits pierden calidad: KLD de 0,0857–0,0890 frente a BF16, coincidencia top-1 de ~89 % y PPL entre ×0,9986 y ×1,0253 respecto a BF16.
- El recuento de parámetros del checkpoint (9,41B) incluye la torre de visión; los pesos del GGUF son 9,20B (texto más MTP), lo que puede confundir comparaciones.
- No hay información sobre sesgos, tasas de alucinación ni rendimiento multilingüe del modelo base.
- No se han publicado benchmarks de calidad estándar (MMLU, HumanEval, GSM8K) en la información disponible.
- Las mediciones marcadas con † se hicieron con otros servidores de modelos cargados pero inactivos, y las marcadas con ‡ incluyen ventanas con un job ajeno en ejecución; pueden desviarse ligeramente.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base OrionLLM/OxCoder-9B.

## Enlaces

- Hugging Face: https://huggingface.co/kingjones777/OxCoder-9B-MTP-ROCmFP4-GGUF
- Modelo base: https://huggingface.co/OrionLLM/OxCoder-9B
- Variante imatrix: https://huggingface.co/kingjones777/OxCoder-9B-MTP-ROCmFP4-imatrix-GGUF
