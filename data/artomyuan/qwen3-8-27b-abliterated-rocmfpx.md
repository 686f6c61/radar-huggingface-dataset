# ArtomYuan/Qwen3.8-27B-abliterated-ROCmFPX

## Resumen

Qwen3.8-27B-abliterated-ROCmFPX es una cuantización GGUF en siete niveles del modelo denso de 27 320 697 856 parámetros `huihui-ai/Huihui-Qwen3.8-27B-abliterated`, publicada por el usuario ArtomYuan. El modelo base es a su vez una variante "abliterated" (pesos BF16 con las direcciones de rechazo suprimidas) derivada de la familia Qwen3, e incluye una torre de visión tipo `qwen3vl_merger` con CLIP, además de una cabeza MTP (multi-token prediction) integrada para decodificación especulativa.

El interés del repositorio no está en el modelo en sí, sino en el formato de cuantización propietario ROCmFPX y en el motor que lo acompaña: `strix.cpp`, un fork de llama.cpp específicamente optimizado para la arquitectura UMA del AMD Strix Halo (`gfx1151`, Ryzen AI MAX+ 395) sobre backend ROCm/HIP. El autor reporta mejoras de hasta el 93 % en velocidad de prefill (pp2048) frente al build estándar de llama.cpp-ROCm, con siete variantes que caben todas en una máquina de 128 GB de memoria unificada (la mayor ocupa 26,69 GiB).

Es relevante ahora porque demuestra una vía práctica de ejecutar un modelo denso de 27B con visión y contexto de hasta 256K en hardware de consumo de gama alta AMD, sin GPU discreta, a costa de depender de un fork no upstream y de un formato de pesos que llama.cpp estándar no puede cargar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3), con torre de visión CLIP + `qwen3vl_merger` y cabeza MTP |
| Parametros totales | 27 320 697 856 (27,3B) |
| Parametros activos | no aplica (modelo denso, todos los parámetros activos) |
| Longitud de contexto | hasta 256K (según model card) |
| Tipos de cuantizacion | ROCmFPX en 7 niveles: Q4_0_ROCMFP4 (FAST / FAST_COHERENT / STRIX), Q6_0_ROCMFPX (base / AGENT), Q8_0_ROCMFPX (base / AGENT); mmproj en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (formato ROCmFPX, requiere `strix.cpp`; llama.cpp upstream no puede cargarlos) |
| Tamano del repo | 192,9 GB |
| Descargas / likes | 1912 / 2 |
| Fecha de creacion / actualizacion | 2026-08-26 / 2026-10-21 |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer denso de 27,3B parámetros de la familia Qwen3, sin mezcla de expertos, lo que implica que la velocidad de generación (tg) es intrínsecamente inferior a la de modelos MoE de tamaño comparable, tal como reconoce el autor. Sobre esa base, la variante `huihui-ai` aplica "abliteration": una modificación de pesos que elimina las direcciones de activación asociadas al rechazo, de modo que el modelo deja de negarse a responder a ciertas peticiones. El repositorio añade dos componentes: una torre de visión (`qwen3vl_merger` con CLIP) empaquetada como `mmproj` BF16 de 0,87 GiB, y una cabeza MTP integrada que permite decodificación especulativa activable con `--spec-type draft-mtp` (desactivada por defecto).

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni las etapas de alineación (RLHF/DPO) del modelo base. La innovación técnica del repositorio es la cuantización ROCmFPX y el motor `strix.cpp` (build f879d83c), que incorpora ajustes específicos para `gfx1151` y soporte nativo del formato. Los niveles AGENT aplican "hardening" selectivo: capas de atención sensibles, `ffn_down` (primer 1/8 y último 1/4), `gate/up` y vocabulario/salida se elevan a 8 bits para preservar el seguimiento de instrucciones en flujos de agente, mientras que Q8_0_ROCMFPX es uniforme a 8,25 BPW.

## Capacidades

- Generación de texto conversacional multi-turno con ventana de hasta 256K tokens.
- Razonamiento y matemáticas (capacidades heredadas de la familia Qwen3; sin benchmarks publicados en este repositorio).
- Generación de código, presumiblemente con soporte de tool calling / function calling propio de la familia, aunque no se detalla en la model card.
- Visión: entrada de imágenes mediante el `mmproj` BF16 incluido (torre CLIP + `qwen3vl_merger`), activable con `--mmproj`.
- Decodificación especulativa mediante cabeza MTP integrada, con tasas de aceptación medidas entre el 26,3 % y el 35,5 % según nivel de cuantización.
- Modo agente: los niveles `_AGENT` están endurecidos específicamente para seguimiento de instrucciones y flujos multi-paso.
- Multilingüismo: no disponible (no se especifican idiomas en la información proporcionada).
- Sin censura de rechazo por la abliteración del modelo base (ver limitaciones).

## Casos de uso

- Asistente conversacional local con contexto largo: con 256K tokens de ventana, permite cargar documentación extensa, historiales de conversación prolongados o bases de código completas en una sola sesión, sin depender de APIs externas.
- Análisis de documentos con imagen: el `mmproj` BF16 permite procesar capturas, diagramas o páginas escaneadas junto a texto, útil para extracción de datos de informes o revisión de interfaces.
- Agente de automatización de tareas: los niveles Q6_0_ROCMFPX_AGENT y Q8_0_ROCMFPX_AGENT están endurecidos en atención y proyecciones sensibles para mantener el seguimiento de instrucciones en cadenas multi-paso, con tool calling si el modelo base lo soporta.
- Despliegue en estación de trabajo AMD Strix Halo: con 128 GB de memoria unificada, el nivel Q8_0_ROCMFPX_AGENT (26,69 GiB) deja margen para el sistema y otros procesos, ofreciendo la máxima calidad del repositorio en hardware sin GPU discreta.
- Servicio de inferencia de baja latencia en prefill: las mejoras de hasta el 93 % en pp2048 con `strix.cpp` hacen viable el procesamiento de prompts largos (RAG, resúmenes de documentos) en un solo equipo, con ~750 t/s en los niveles Q4.
- Prototipado de investigación sobre modelos sin alineación de rechazo: la variante abliterated permite estudiar comportamientos del modelo sin las restricciones de seguridad originales, en entornos controlados y con la supervisión adecuada.
- Evaluación comparativa de cuantizaciones: los siete niveles con BPW y estrategias de hardening documentadas permiten medir el compromiso calidad/velocidad en un mismo hardware, con checksums SHA-256 publicados para verificación de integridad.

## Benchmarks y rendimiento

Los únicos datos publicados son de `llama-bench` sobre AMD Strix Halo (gfx1151), comparando llama.cpp-ROCm (build 11107) con `strix.cpp` (build f879d83c). No hay resultados de MMLU, HumanEval, GSM8K ni similares.

Prefill con prompt de 2048 tokens (pp2048, t/s):

| Nivel | llama.cpp-rocm | strix.cpp | Mejora |
|---|---:|---:|---:|
| Q4_0_ROCMFP4_FAST | 396,60 | 749,15 | +88,9 % |
| Q4_0_ROCMFP4_FAST_COHERENT | 388,00 | 749,53 | +93,2 % |
| Q4_0_ROCMFP4_STRIX | 385,40 | 684,04 | +77,5 % |
| Q6_0_ROCMFPX | 311,90 | 359,34 | +15,2 % |
| Q6_0_ROCMFPX_AGENT | 330,90 | 383,19 | +15,8 % |
| Q8_0_ROCMFPX | 364,00 | 423,77 | +16,4 % |
| Q8_0_ROCMFPX_AGENT | 362,40 | 418,65 | +15,5 % |

Generación de 256 tokens (tg256, t/s) y decodificación especulativa MTP:

| Nivel | tg256 (strix.cpp) | MTP t/s | Aceptación MTP |
|---|---:|---:|---:|
| Q4_0_ROCMFP4_FAST | 14,04 | 26,25 | 35,5 % |
| Q4_0_ROCMFP4_FAST_COHERENT | 14,04 | 23,35 | 29,9 % |
| Q4_0_ROCMFP4_STRIX | 14,05 | 21,52 | 26,3 % |
| Q6_0_ROCMFPX | 9,48 | 15,58 | 29,4 % |
| Q6_0_ROCMFPX_AGENT | 8,73 | 14,65 | 29,2 % |
| Q8_0_ROCMFPX | 7,95 | 14,02 | 28,9 % |
| Q8_0_ROCMFPX_AGENT | 7,83 | 14,71 | 31,4 % |

El prefill con 256 tokens (pp256) sigue el mismo patrón: 738,81 t/s para Q4_0_ROCMFP4_FAST frente a 413,50 del build estándar (+78,7 %), y 414,50 frente a 371,30 para Q8_0_ROCMFPX (+11,6 %).

## Requisitos de hardware

- VRAM/memoria unificada: entre 13,56 GiB (Q4_0_ROCMFP4_FAST) y 26,69 GiB (Q8_0_ROCMFPX_AGENT); añadir 0,87 GiB si se usa visión.
- Hardware de referencia: AMD Strix Halo `gfx1151` (Ryzen AI MAX+ 395) con 128 GB de memoria unificada; todos los niveles caben en una sola máquina.
- GPU discretas: no hay datos publicados de funcionamiento en A100, H100 o RTX 4090; el motor está afinado para `gfx1151` y backend ROCm/HIP.
- GPU de consumo: no se documenta soporte para GPUs de consumo NVIDIA; el formato ROCmFPX y el fork `strix.cpp` están orientados a AMD.
- Despliegue: exclusivamente `strix.cpp` (`strix-server -m <archivo> -ngl 99 -fa on --port 8080`); llama.cpp upstream no puede cargar estos ficheros. No se menciona compatibilidad con vLLM, Ollama ni TGI.
- Throughput medido: prefill de 359 a 749 t/s según nivel; generación de 7,83 a 14,05 t/s sin MTP y de 14,02 a 26,25 t/s con MTP activado.
- Latencia: no se publican métricas de latencia por petición (TTFT, p99); solo t/s de bench.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Visión | Licencia | Formato / motor | Notas |
|---|---|---|---|---|---|---|
| Qwen3.8-27B-abliterated-ROCmFPX (este) | 27,3B denso | 256K | Sí (mmproj BF16) | Apache 2.0 | GGUF ROCmFPX / `strix.cpp` | Optimizado para gfx1151; sin benchmarks de calidad |
| huihui-ai/Huihui-Qwen3.8-27B-abliterated | 27,3B denso | no disponible | no disponible | no disponible | BF16 (safetensors) | Modelo base; requiere GPU con VRAM suficiente o CPU |
| Qwen3-27B (modelo original de la familia) | 27B denso | no disponible | no disponible | no disponible | safetensors / GGUF estándar | Sin abliteración; compatible con llama.cpp upstream |

No se dispone de datos de rendimiento comparativo (benchmarks de calidad) entre estas variantes en la información proporcionada; la comparación se limita a parámetros, formato, licencia y disponibilidad. Tampoco se documentan alternativas cuantizadas equivalentes para Strix Halo.

## Limitaciones y advertencias

- La abliteración elimina las direcciones de rechazo del modelo base: es previsible que genere contenido que el modelo original rechazaría. Requiere filtros externos y supervisión en cualquier despliegue público.
- No hay benchmarks de calidad publicados (MMLU, HumanEval, GSM8K): el impacto de cada nivel de cuantización en la precisión real no está medido, solo se infiere de las estrategias de hardening.
- Dependencia crítica de un fork no upstream: `strix.cpp` es un proyecto de un solo autor (build f879d83c) y el formato ROCmFPX no es cargable por llama.cpp estándar, lo que limita la portabilidad y el soporte a largo plazo.
- El repositorio ocupa 192,9 GB y las descargas son de 1912, con solo 2 likes: comunidad muy reducida, menor probabilidad de corrección de errores.
- Los idiomas soportados no están documentados; no se puede asumir un rendimiento multilingüe homogéneo.
- El rendimiento de generación es bajo en términos absolutos (7,8-14 t/s sin MTP) por ser un modelo denso de 27B en memoria unificada; los niveles Q8 son los más lentos.
- El contexto de 256K no está verificado empíricamente en la información disponible; la memoria necesaria para KV cache a esa longitud no se documenta.
- Licencia Apache 2.0 permite uso comercial, pero la responsabilidad sobre el contenido generado sin alineación de seguridad recae en el desplegador.
- No hay información sobre sesgos específicos del modelo base ni sobre su composición de entrenamiento.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ArtomYuan/Qwen3.8-27B-abliterated-ROCmFPX
- Modelo base: https://huggingface.co/huihui-ai/Huihui-Qwen3.8-27B-abliterated
- Motor strix.cpp: https://github.com/ArtomYuan/strix.cpp
- Checksums SHA-256: `sha256.txt` en el repositorio de Hugging Face
- Paper, blog o demo adicionales: no disponible
