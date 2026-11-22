# satellitedown/fafstmobel

## Resumen

fafstmobel es un derivado de 27B construido localmente por el usuario satellitedown a partir del checkpoint abliterado Swift-Qwen3.8-27B, que a su vez deriva de Qwen/Qwen3.8-27B. El autor transpone el delta de abliteración observado en el modelo Huihui sobre Swift, cuantiza la asignación de texto a NVFP4/FP8 y exporta todo a un único artefacto NInfer v3 que incluye los componentes de texto, visión, MTP y el borrador especulativo DFlash2. El resultado es un modelo multimodal con decodificación especulativa integrada, pensado para inferencia local en una única GPU de consumo.

La relevancia del modelo está en su empaquetado: un solo fichero de 22,88 GB que contiene pesos cuantizados, torre de visión, cabezas MTP y un drafter DFlash2 de 5 capas con proyecciones en Q4 y QKV fusionado en Q8. Según las mediciones del autor en una RTX 5090 de 32 GB, el modelo alcanza 293,7 tok/s con DFlash2-15 y árboles de verificación, frente a 54,1 tok/s en decodificación autoregresiva, con una ventana de contexto de 262.144 tokens y caché KV en formato K8V4.

La arquitectura de texto consta de 64 capas con hidden de 5120 y vocabulario de 248.320 tokens, combinando 16 capas de atención completa con 48 de atención lineal (GDN). La licencia es swift-open-license-v1.0, distinta de la Apache 2.0 habitual en la familia Qwen, lo que condiciona el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: 64 capas, 16 de atención completa + 48 de atención lineal (GDN), con torre de visión, MTP y drafter DFlash2 |
| Parametros totales | 27B (modelo base Qwen3.8-27B); artefacto de 22.884.131.844 bytes |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | NVFP4 (168 matrices MLP, grupo 16, activaciones 4-bit dinámicas locales) y FP8 por canal (233 matrices de atención, GDN, cabeza de salida y MLP 56-63); drafter en Q4 (grupo 64) y QKV fusionado en Q8 (grupo 32); caché KV en BF16, FP8 o K8V4 |
| Idiomas soportados | no disponible |
| Licencia | swift-open-license-v1.0 (etiqueta `other`) |
| Formato de pesos | NInfer v3 (fichero único `fafstmobel.ninfer`); no se distribuyen safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.8-27B y aplica una arquitectura híbrida de atención: 16 capas con atención completa y 48 con atención lineal del tipo GDN (Gated Delta Net), con hidden de 5120 y vocabulario de 248.320 tokens. Sobre el checkpoint Swift se aplica un transplante de delta de abliteración: en lugar de rederivar la abliteración, se calcula `result = (swift.float() + (huihui.float() - base.float())).to(bfloat16)`, modificando exactamente 70 tensores en las capas 17-51 (`mlp.down_proj` junto con `self_attn.o_proj` o `linear_attn.out_proj`). El máximo delta absoluto es 2,83e-2 y el medio 2,02e-4, sobre 4.220.518.400 elementos reescritos; los otros 1129 tensores (visión, MTP, embeddings, norms y cabeza de salida) son idénticos byte a byte al checkpoint Swift.

La cuantización del texto sigue la asignación NVFP4/FP8 publicada, calibrada con 32 muestras de UltraChat-200k de 2048 tokens. La exportación se realiza con `tools.convert` de Cinference (fork de NInfer), receta `qwen3_8_27b_nvfp4`, que además cuantiza las proyecciones del drafter DFlash2 a Q4 y su QKV fusionado a Q8. El drafter tiene 5 capas, taps objetivo en `[5,19,33,47,61]`, bloque 8 y selector top-k 16. No se documentan en la información disponible el número de tokens de preentrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base.

## Capacidades

- Generación de texto y razonamiento: verificado con aritmética (`17 × 19` → `323`) y prompts de código con salida válida.
- Generación de código: produce funciones `def` válidas con slicing; el autor reporta 32 peticiones de código en modo thinking para medir aceptación especulativa.
- Multimodal (visión): incluye torre de visión; verificado con una imagen 256×256 rojo/azul respondiendo "left is red, right is blue".
- Decodificación especulativa: MTP-3 y DFlash2-15 con árboles de verificación, con aceptación de borradores del 74,0% en MTP-3.
- Servido compatible con API: `/health` y `/v1/models` con id `fafstmobel` y contexto de 262.144 tokens; pasa `tools.smoke.serve_contract`.
- Contexto largo: perplejidad medida con `ninfer-perplexity` sobre 261.167 tokens y contexto de 65.536.
- Tool calling / function calling: no documentado explícitamente en la información disponible.
- Capacidades de agente multi-paso: no documentadas explícitamente en la información disponible.
- Idiomas: no disponible.

## Casos de uso

- Asistencia de código en local: el modelo genera código válido y mantiene contexto de hasta 262.144 tokens, útil para trabajar sobre repositorios completos en una sola GPU de consumo sin enviar código a servicios externos.
- Análisis de documentos e imágenes: la torre de visión integrada permite describir o razonar sobre capturas, diagramas e imágenes junto a texto largo, con el contexto completo en memoria.
- Servicio de inferencia de baja latencia: con DFlash2-15 y árboles de verificación alcanza 293,7 tok/s en RTX 5090, adecuado para aplicaciones interactivas con respuesta en streaming.
- Procesamiento de corpus largos: la ventana de 262.144 tokens y la caché K8V4 (perplejidad 4,08607 frente a 4,08915 en BF16) permiten resumir o extraer información de documentos extensos sin truncar.
- Experimentación en investigación sobre abliteración: el artefacto documenta con precisión los 70 tensores modificados y los deltas aplicados, lo que facilita reproducir o auditar el efecto de la abliteración sobre el comportamiento del modelo.
- Despliegue en estación de trabajo única: al caber en 32 GB de VRAM con 993 MiB libres en el perfil completo, sirve para prototipado y demos locales sin infraestructura de clúster.
- Evaluación de decodificación especulativa: la integración de MTP y DFlash2 con métricas de aceptación publicadas lo convierte en banco de pruebas para comparar estrategias de especulación.

## Benchmarks y rendimiento

| Prueba | Resultado (RTX 5090, 32 GB, contexto 262.144, K8V4, CUDA graphs) |
|---|---|
| Aritmética (`17 × 19`) | `323`, replay idéntico con la misma semilla |
| Prompt de código | `def` con slicing válido, 30 tokens |
| Multimodal (imagen 256×256) | "left is red, right is blue" |
| Autoregresivo (semilla 42, greedy, 256 tokens, batch 1) | 54,1 tok/s |
| MTP-3 | 155,3 tok/s (2,87×, aceptación 74,0%) |
| DFlash2-15 con árboles de verificación | 293,7 tok/s (5,43×) |
| Perfil de servido (DFlash2-15 + K8V4 262.144 vs DFlash2-7 + FP8 KV 16.384) | mediana 241,4 → 294,4 tok/s (+22%) |
| Perplejidad KV (261.167 tokens, contexto 65.536) | BF16 4,08915 · FP8 4,08843 · K8V4 4,08607 |
| Tokens de borrador aceptados por ronda (32 peticiones de código, modo thinking) | 4,016 (Q4) frente a 4,008 (Q8) |
| Kernels de proyección del drafter por ronda de verificación 8K | 1.118,2 µs (Q4) frente a 1.447,5 µs (Q8) |
| Pesos residentes | 20,9 GiB (Q4) frente a 21,7 GiB (Q8) |

El autor advierte que un salvapantallas a pantalla completa compartía la GPU durante las mediciones, por lo que las tasas absolutas están deprimidas; las aceleraciones y los conteos de aceptación se reproducen exactamente. En una revisión anterior, con NInfer `98dada0`, contexto 16.384 y KV FP8, se midieron 68,5-77,1 tok/s autoregresivo, 210,0-215,3 tok/s con MTP-3 y 304,1-312,9 tok/s con DFlash2-7. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: 20,9 GiB de pesos residentes con el drafter en Q4; el perfil completo (contexto 262.144, K8V4, visión, árboles) arranca con 993 MiB libres en una GPU de 32 GB y 1,5 GB de VRAM de escritorio en uso.
- GPU recomendadas: RTX 5090 de 32 GB (única configuración medida por el autor). No hay datos publicados para A100, H100 ni otras GPU.
- GPU de consumo: cabe en RTX 5090; no se documenta compatibilidad con GPU de 24 GB o menos.
- Opciones de despliegue: Cinference `8364ed7` (fork de NInfer) es requisito para el drafter Q4 de esta revisión; el artefacto es NInfer v3, por lo que no es compatible con vLLM, llama.cpp, Ollama ni TGI en el formato distribuido.
- Latencia y throughput: 293,7 tok/s con DFlash2-15 y árboles de verificación, 155,3 tok/s con MTP-3 y 54,1 tok/s autoregresivo, en batch 1 y con la GPU compartida con un salvapantallas.
- Entorno de construcción: RTX 5090, CUDA 13.1 y Python 3.11.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización / formato | Licencia | Notas |
|---|---|---|---|---|---|
| fafstmobel | 27B | 262.144 | NVFP4/FP8, NInfer v3 | swift-open-license-v1.0 | Abliterado, visión, MTP y DFlash2 integrados; 293,7 tok/s en RTX 5090 |
| Qwen/Qwen3.8-27B | 27B | no disponible | safetensors (no disponible) | no disponible | Modelo base; sin abliteración ni cuantización NVFP4 |
| ukisai/Swift-Qwen3.8-27b | 27B | no disponible | no disponible | swift-open-license-v1.0 | Checkpoint Swift de origen; sin transplante de delta ni empaquetado NInfer |
| z-lab/Qwen3.8-27B-DFlash2 | 27B | no disponible | no disponible | no disponible | Aporta el componente drafter DFlash2; sin cuantización ni visión empaquetada |

No se dispone de datos de rendimiento comparables de los modelos de la tabla en la información proporcionada.

## Limitaciones y advertencias

- Sesgos: el modelo es una abliteración, lo que elimina mecanismos de rechazo y puede aumentar la probabilidad de respuestas dañinas o sesgadas; el autor no documenta evaluaciones de seguridad.
- Alucinación: no se han publicado evaluaciones de veracidad ni de tasa de alucinación; el uso en producción requiere verificación externa.
- Idiomas: no se especifican los idiomas soportados, lo que impide garantizar calidad fuera del inglés.
- Licencia: swift-open-license-v1.0 no es Apache 2.0; es necesario revisar sus términos antes de cualquier uso comercial.
- Formato cerrado: el artefacto NInfer v3 solo se carga con Cinference/NInfer, lo que limita la portabilidad y obliga a usar una revisión concreta (`8364ed7`) para el drafter Q4.
- Hardware: las únicas mediciones disponibles son en RTX 5090; no hay datos de latencia ni de viabilidad en otras GPU.
- Reproducibilidad: las tasas absolutas están afectadas por la carga de escritorio del autor; solo las aceleraciones y los conteos de aceptación se reproducen exactamente.
- Tool calling y agentes: no documentados, por lo que no deben asumirse en pipelines de producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/satellitedown/fafstmobel
- Modelo base Qwen: https://huggingface.co/Qwen/Qwen3.8-27B
- Checkpoint Swift: https://huggingface.co/ukisai/Swift-Qwen3.8-27b
- Licencia: https://huggingface.co/ukisai/Swift-Qwen3.8-27b/blob/main/LICENSE
- Drafter DFlash2: https://huggingface.co/z-lab/Qwen3.8-27B-DFlash2
- Repositorio Cinference: https://github.com/satellitedown/cinference
