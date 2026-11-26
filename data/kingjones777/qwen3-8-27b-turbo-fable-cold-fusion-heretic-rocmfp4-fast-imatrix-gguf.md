# kingjones777/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-Heretic-ROCmFP4-FAST-imatrix-GGUF

## Resumen

Qwen3.8-27B-TURBO-Fable-Cold-Fusion-Heretic-ROCmFP4-FAST-imatrix-GGUF es una cuantización GGUF en formato ROCmFP4 del modelo denso de 27B DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU, a su vez derivado de Qwen/Qwen3.8-27B. Lo publica el usuario kingjones777 y está pensado específicamente para aceleradores AMD con arquitectura gfx1151 (Strix Halo, Ryzen AI Max+ 395) bajo ROCm. No es un modelo nuevo: es un artefacto de cuantización con calibración por importance matrix (imatrix) que conserva la torre de visión y la cabeza MTP de decodificación especulativa del modelo original.

La relevancia técnica está en que empaqueta tipos de tensor ROCmFP4 que el llama.cpp estándar no sabe cargar, obligando a usar un fork (ROCmFPX). A cambio, ofrece decodificación especulativa MTP con velocidades de 27 a 33 tok/s frente a los ~13 tok/s en decodificación plana sobre el mismo hardware, además de un tower de visión funcional y una calidad medida en perplejidad (WikiText-2) de 6,6577, apenas un 0,57 % mejor que la variante sin imatrix.

El modelo base es un transformer denso de tipo qwen3_5 con capas de atención clásica combinadas con capas de atención lineal. La variante "Heretic" eliminó el comportamiento de rechazo, por lo que se trata de un artefacto de investigación sin filtros de seguridad, publicado bajo licencia Apache 2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso qwen3_5 (atención + capas de atención lineal), con torre de visión y cabeza MTP |
| Parámetros totales | 460.730.096 según safetensors del repo; el autor describe el modelo como denso de 27B |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens en la configuración de referencia (`-c 32768`); contexto nativo del modelo base no disponible |
| Tipos de cuantización | ROCmFP4 (FAST imatrix); cabezas draft MTP en Q4_0; torre de visión en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (pesos principales ROCmFP4, mmproj BF16, cabezas MTP Q4_0) |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer denso con mezcla de capas de atención completa y capas de atención lineal, identificado en los tags como `qwen3_5`. Incluye dos componentes adicionales: una torre de visión Qwen3.5-VL de 27 capas con encoder deepstack, exportada como `mmproj-…-BF16.gguf`, y un bloque MTP (multi-token prediction) que actúa como cabeza draft para decodificación especulativa, ubicado en `blk.64` del GGUF principal y también distribuido como ficheros Q4_0 separados de 1,68 GB.

No hay información sobre el volumen de tokens de entrenamiento, la composición del dataset ni las etapas de alineación (RLHF/DPO) del modelo base. El autor del merge (DavidAU) eliminó el comportamiento de rechazo mediante una fusión de pesos, no mediante un reentrenamiento documentado. La innovación técnica de esta ficha concreta es la cuantización ROCmFP4 calibrada con importance matrix: el autor reporta una mejora de perplejidad de solo −0,57 % frente al control sin imatrix (6,6577 ± 0,042 frente a 6,6959 ± 0,042 en WikiText-2 raw con `-c 512`), y señala explícitamente que este modelo denso y muy fusionado es mucho menos sensible a imatrix que un MoE como Flash-Next, donde la misma técnica aportó −5,9 %.

## Capacidades

- Generación de texto y razonamiento en modo thinking opcional (se activa omitiendo `--reasoning off`).
- Generación de código, JSON estructurado y prosa, con rendimiento MTP medido en cada categoría.
- Visión: entrada image-text-to-text mediante la torre Qwen3.5-VL; verificado por el autor con una imagen roja que devolvió "Red" con ~1.024 tokens de imagen sobre 1.094 de prompt.
- Decodificación especulativa MTP con hasta 4 tokens propuestos por la cabeza draft y verificados en una pasada.
- Soporte de plantillas Jinja (`--jinja`) para formateo de chat.
- Capacidades multilingües: no disponible.
- Tool calling y function calling: no documentado explícitamente en la información disponible.
- Comportamiento sin rechazo (uncensored) por la fusión Heretic del modelo base.

## Casos de uso

- Inferencia local en Ryzen AI Max+ 395 / Strix Halo: el artefacto está calibrado y medido para gfx1151 con ROCm 7.2.4 y offload completo, con ~13 tok/s en decodificación plana y 27-33 tok/s con MTP en código, razonamiento y JSON. Es el escenario para el que se construyó.
- Generación de código asistida con baja latencia: con la cabeza MTP del modelo base se alcanzan 28,31 tok/s en cargas de código, suficiente para autocompletado interactivo en un equipo de sobremesa con GPU integrada AMD.
- Producción de JSON estructurado en pipelines: 32,50-33,13 tok/s con MTP en la carga JSON medida, útil para extracción de datos y generación de respuestas de API en local.
- Procesamiento de documentos con imagen: la torre de visión permite pasar capturas o páginas escaneadas como `image_url` en formato chat de OpenAI, con `--image-min-tokens 1024` para evitar la degradación de Qwen-VL por debajo de ese umbral.
- Razonamiento multi-paso en local: 28,24 tok/s con la cabeza propia de DAU, que logra una tasa de aceptación de draft de 0,667 frente a 0,593 de la cabeza base en tareas de razonamiento.
- Investigación sobre decodificación especulativa: el repo documenta un barrido de parámetros (`--spec-draft-p-min`, profundidad de draft 3-5, `-np 1` obligatorio en gfx1151) que sirve como referencia reproducible para estudiar la aceptación de draft en modelos fusionados.
- Experimentación con modelos sin filtros en entornos controlados: al ser un artefacto de investigación uncensored, encaja en estudios de robustez y evaluación de sesgos, no en despliegues de cara al público.

## Benchmarks y rendimiento

Rendimiento de decodificación medido por el autor en Ryzen AI Max+ 395, gfx1151, ROCm 7.2.4, offload completo, greedy, `cache_prompt:false`, 256 tokens, mediana de 3 ejecuciones (tok/s):

| Cabeza draft | Código | Prosa | Razonamiento | JSON |
|---|---|---|---|---|
| Ninguna (decodificación plana) | 12,99 | 12,83 | 12,83 | 12,84 |
| Propia de DAU (Q4_0) | 27,06 | 16,53 | 28,24 | 32,50 |
| Base Qwen3.8-27B (Q4_0) | 28,31 | 18,65 | 26,96 | 33,13 |
| Referencia: base Qwen3.8-27B + su cabeza | 30,54 | 18,45 | 32,25 | 34,98 |

Calidad (WikiText-2 raw, `-c 512`, perplejidad):

| Build | PPL |
|---|---|
| FAST sin imatrix (control) | 6,6959 ± 0,042 |
| FAST imatrix (este modelo) | 6,6577 ± 0,042 (−0,57 %) |

Tasas de aceptación de draft reportadas: 0,667 (cabeza DAU) y 0,593 (cabeza base) en razonamiento; 0,75 en el modelo base sin fusionar. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks académicos en la información disponible.

## Requisitos de hardware

- VRAM/ memoria unificada: el autor indica que el modelo denso lee ~15 GB de pesos por token en decodificación plana; el repo ocupa 19,2 GB e incluye pesos principales, torre de visión BF16 y dos cabezas MTP de 1,68 GB cada una. Con offload completo se necesita al menos el tamaño de los pesos más el contexto (32K con caché KV en q8_0).
- GPU recomendadas: AMD Ryzen AI Max+ 395 con iGPU gfx1151 (Strix Halo) es el objetivo declarado y medido. Otras GPU AMD con soporte ROCm no están documentadas en la información disponible; GPU NVIDIA no están soportadas por los tipos de tensor ROCmFP4.
- GPU de consumo: cabe en Strix Halo gracias a la memoria unificada; no se documenta su funcionamiento en GPU de consumo discretas.
- Despliegue: requiere compilar el fork ROCmFPX (rama `main`) con `-DGGML_HIP=ON -DGPU_TARGETS=gfx1151`; llama.cpp estándar no carga los tipos ROCmFP4. El binario usado es `llama-server`. No se documenta compatibilidad con vLLM, Ollama ni TGI.
- Latencia y throughput: ~13 tok/s en decodificación plana y 27-33 tok/s con MTP según carga; la prosa resiste MTP en ambos modelos (~16-19 tok/s). El autor recomienda `--spec-draft-p-min 0.0` (frente al 0,75 por defecto, +47 % en su barrido), `-np 1` obligatorio para MTP en gfx1151 y profundidad de draft de 3-5 ajustada por máquina.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este (Qwen3.8-27B TURBO-Fable Heretic ROCmFP4) | 27B denso (460,7 M en safetensors del repo) | 32.768 en la config medida | 12,99-33,13 tok/s según carga y cabeza; PPL 6,6577 | Apache 2.0 | GGUF ROCmFP4, requiere fork ROCmFPX |
| Qwen/Qwen3.8-27B (base) | 27B denso | no disponible | 30,54-34,98 tok/s con su cabeza MTP; 13,0-13,2 tok/s plano | no disponible en la información | Pesos originales; cuantizaciones GGUF estándar |
| DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU | 27B denso | no disponible | ~9 % por debajo del base con MTP; ~12 % en razonamiento | Apache 2.0 (según este repo) | Pesos del merge sin cuantizar |

La diferencia clave frente al base es la ausencia de rechazo y una peor aceptación de draft (0,59-0,67 frente a 0,75), lo que se traduce en menor velocidad con MTP pese a compartir arquitectura y vocabulario.

## Limitaciones y advertencias

- Modelo uncensored: la fusión Heretic elimina el comportamiento de rechazo; el autor lo califica de artefacto de investigación y advierte de que el uso debe ser deliberado y con responsabilidad sobre la salida.
- No funciona con llama.cpp estándar: exige el fork ROCmFPX y tipos de tensor ROCmFP4, lo que limita el despliegue a AMD gfx1151 y complica el mantenimiento.
- MTP requiere `-np 1` en gfx1151; no se puede servir con paralelismo de peticiones en ese hardware.
- La prosa libre resiste la decodificación especulativa (~16-19 tok/s), así que la ganancia no es uniforme entre cargas.
- La mejora de imatrix es marginal (−0,57 % de perplejidad) y el propio autor reconoce que este modelo es poco sensible a la técnica.
- La torre de visión degrada por debajo de ~1.024 tokens de imagen; es necesario pasar `--image-min-tokens 1024`.
- Riesgo de alucinación: no cuantificado en la información disponible; aplicable el riesgo habitual de un modelo de 27B sin benchmarks académicos publicados.
- Idiomas soportados no documentados; no se puede garantizar calidad fuera de los idiomas del modelo base.
- Los parámetros reportados en safetensors (460,7 M) no concuerdan con la descripción de modelo denso de 27B del autor; conviene verificar el conteo real antes de dimensionar hardware.
- Licencia Apache 2.0 declarada, pero el modelo base y el merge intermedio no documentan aquí sus términos completos; revisar antes de uso comercial.

## Enlaces

- Hugging Face: https://huggingface.co/kingjones777/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-Heretic-ROCmFP4-FAST-imatrix-GGUF
- Modelo base del merge: https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU
- Modelo original: https://huggingface.co/Qwen/Qwen3.8-27B
- Fork de runtime: https://github.com/kingjones30/ROCmFPX
- Fork upstream: https://github.com/charlie12345/ROCmFPX
