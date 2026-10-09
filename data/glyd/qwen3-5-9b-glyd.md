# glyd/Qwen3.5-9B-glyd

## Resumen

`glyd/Qwen3.5-9B-glyd` no es un modelo nuevo, sino un checkpoint empaquetado de forma sin pérdida del modelo base `Qwen/Qwen3.5-9B` de Alibaba, publicado por el proyecto Glyd. El autor almacena los mismos pesos del modelo original en formato Glyd de 8 bits: 11,85 GiB en lugar de los 16,68 GiB de bf16, una reducción del 29,0 %, garantizando que cada peso se decodifica bit a bit al valor bf16 original. El repositorio pesa 12,7 GB y declara 11.670.880.634 parámetros reales según los ficheros safetensors, aunque el autor lo etiqueta comercialmente como un modelo de 9B.

Su relevancia es de tipo operativo: permite servir la familia Qwen3.5 en GPUs con menos VRAM sin aceptar la degradación típica de una cuantización con pérdida, y verificar la integridad de cada tensor contra los hashes sha256 almacenados en `glyd.json`. El checkpoint contiene únicamente el modelo de lenguaje (`Qwen3_5ForCausalLM`, 153 matrices empaquetadas y 226 tensores sin empaquetar) y excluye explícitamente `model.visual`, `mtp.fc`, `mtp.layers`, `mtp.norm`, `mtp.pre_fc_norm_embedding` y `mtp.pre_fc_norm_hidden`, por lo que no incluye la parte de visión ni las capas de predicción multi-token del modelo base.

La licencia de los pesos es apache-2.0, heredada de Qwen, pero la herramienta Glyd necesaria para cargarlos es BUSL-1.1: gratuita para uso personal y no comercial en equipos propios, y sujeta a licencia comercial en caso contrario. Es, por tanto, un artefacto de despliegue con una dependencia de licencia dual que conviene revisar antes de llevarlo a producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (clase `Qwen3_5ForCausalLM` en el cargador de Glyd); sin codificador de vision ni capas MTP en este checkpoint |
| Parametros totales | 11.670.880.634 parametros reales (safetensors); el autor lo comercializa como 9B |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (los benchmarks publicados por el proyecto usan `--max-model-len 4096`) |
| Tipos de cuantizacion | Empaquetado Glyd de 8 bits sin perdida: 11,85 GiB frente a 16,68 GiB en bf16 (-29,0 %); decodificacion bit a bit identica al original |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 para los pesos (heredada de Qwen3.5-9B); BUSL-1.1 para la herramienta Glyd (uso comercial sujeto a licencia) |
| Formato de pesos | safetensors junto a tensores empaquetados en formato Glyd (153 matrices empaquetadas, 226 tensores sin empaquetar, `glyd.json` con sha256 por tensor) |

## Arquitectura y entrenamiento

Este repositorio no implica ningún entrenamiento: es una transformación reversible de los pesos de `Qwen/Qwen3.5-9B` en el commit `c2022362`. Glyd empaqueta 153 matrices en un formato de 8 bits y deja 226 tensores tal cual; la decodificación con `glyd.from_pretrained(...)` reconstruye los valores bf16 originales sin pérdida. La opción `verify=True` decodifica cada tensor empaquetado y lo compara con el sha256 registrado en `glyd.json`, lo que permite auditar que los pesos servidos coinciden con los del modelo base.

Sobre la arquitectura del modelo subyacente, las fuentes secundarias consultadas describen Qwen3.5-9B como un modelo multimodal con arquitectura de mezcla de expertos con gated-delta y codificador de visión, con fusión temprana de tokens multimodales, publicado bajo Apache 2.0 en marzo de 2026. Esa descripción corresponde al modelo base completo, no a este checkpoint: al excluir `model.visual` y los componentes `mtp.*`, lo que se sirve aquí es la parte de lenguaje (`Qwen3_5ForCausalLM`). No se dispone de datos verificados sobre número de tokens de entrenamiento, composición del dataset ni etapas de RLHF o DPO en la información proporcionada.

## Capacidades

- Generación de texto autoregresiva mediante la torre de lenguaje `Qwen3_5ForCausalLM`, con los pesos exactos del modelo base bf16.
- Carga y decodificación sin pérdida: cada tensor decodificado coincide bit a bit con el valor bf16 de `Qwen/Qwen3.5-9B`.
- Verificación de integridad de pesos mediante hashes sha256 (`glyd.from_pretrained(..., verify=True)`).
- Servicio de inferencia en GPU NVIDIA a través del runtime Glyd (`glyd run`, `glyd serve`), comparable en los benchmarks del proyecto con `vllm serve` en bf16.
- Capacidades multimodales (visión): no disponibles en este checkpoint, ya que `model.visual` no está incluido.
- Predicción multi-token (MTP): no disponible, los tensores `mtp.*` están excluidos.
- Tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Cobertura multilingüe: no disponible en la información proporcionada.

## Casos de uso

- Inferencia de Qwen3.5-9B en una sola GPU de consumo: con 11,85 GiB de pesos, el modelo cabe en una RTX 4090 (24 GB) o una RTX 5090 (32 GB) dejando margen para caché KV y activaciones, algo que el bf16 de 16,68 GiB complica en tarjetas de 16 GB.
- Reducción de coste en nube por GPU: al bajar de 16,68 GiB a 11,85 GiB, se puede alquilar una instancia con menos VRAM por el mismo modelo, útil en plataformas tipo Runpod donde el proyecto ejecutó sus benchmarks.
- Verificación de cadena de custodia de pesos en MLOps: en un pipeline de despliegue se puede ejecutar `verify=True` para comprobar que los tensores servidos coinciden con los hashes del modelo base antes de promover una versión.
- Evaluación de runtimes alternativos a vLLM: el repositorio de benchmarks compara bf16 servido con vLLM 0.30.0 frente a Glyd 0.29 en la misma tarea, lo que sirve para medir el coste de cambiar de motor de inferencia sin cambiar de pesos.
- Servicio de asistentes de texto con contexto de 4096 tokens: con `--max-model-len 4096` (la configuración usada en los benchmarks citados) es viable desplegar tareas de generación y resumen de documentos cortos o medios.
- Archivado y distribución de pesos con menor huella: el checkpoint reduce el almacenamiento un 29,0 % respecto a bf16 manteniendo fidelidad total, útil para espejos internos de modelos.
- Reproducibilidad de experimentos: al no haber pérdida de cuantización, cualquier diferencia observada frente al modelo original es atribuible al runtime, no a los pesos, lo que facilita aislar variables en pruebas comparativas.

## Benchmarks y rendimiento

El proyecto Glyd publica un directorio de benchmarks titulado "Qwen3.5-9B on an RTX 4090 and an RTX 5090: bf16 against Glyd 0.29 under vLLM 0.30.0 (2026-10-06)", con la misma tarea ejecutada en ambos casos: bf16 servido con `vllm serve Qwen/Qwen3.5-9B --max-model-len 4096` y Glyd 0.29 mediante `glyd run` y `glyd serve`. No se han facilitado las cifras concretas de latencia, throughput ni calidad en la información disponible.

| Benchmark | Modelo | Resultado |
|---|---|---|
| Comparativa bf16 vs Glyd 0.29 (RTX 4090, RTX 5090, vLLM 0.30.0) | Qwen3.5-9B bf16 frente a Qwen3.5-9B Glyd | no disponible (el directorio de benchmarks existe, pero no se aportan cifras) |

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM para los pesos: 11,85 GiB en formato Glyd de 8 bits, frente a 16,68 GiB en bf16.
- VRAM estimada para inferencia completa: en torno a 14-16 GiB sumando caché KV y activaciones para una ventana de 4096 tokens (estimación a partir del tamaño de pesos; no se aportan cifras oficiales).
- GPU compatibles: NVIDIA Ampere, Ada, Hopper o Blackwell. Los benchmarks del proyecto se ejecutaron en RTX 4090 y RTX 5090.
- Cabe en GPU de consumo: sí en RTX 4090 (24 GB) y RTX 5090 (32 GB); en tarjetas de 16 GB (RTX 4080, 4070 Ti Super) queda muy justo para 4096 tokens de contexto.
- Software obligatorio: Linux, driver NVIDIA 580 o superior y glyd 0.29.1 o posterior; instalación con `pip install "glyd[gpu]"`.
- No hay soporte documentado para CPU ni para macOS/Apple Silicon.
- Opciones de despliegue: `glyd run` y `glyd serve`; el modelo base en bf16 se puede servir con vLLM 0.30.0. No se documenta compatibilidad con llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible (los benchmarks comparativos existen, pero no se publican sus cifras en la información proporcionada).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato y tamano de pesos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| glyd/Qwen3.5-9B-glyd | 11.670.880.634 | no disponible (benchmarks a 4096) | Glyd 8 bits sin perdida, 11,85 GiB | Pesos apache-2.0; herramienta BUSL-1.1 | HuggingFace, carga con `glyd` 0.29.1+ en Linux + GPU NVIDIA |
| Qwen/Qwen3.5-9B (bf16) | mismos pesos | no disponible | bf16, 16,68 GiB | apache-2.0 | HuggingFace; servible con vLLM 0.30.0 |
| Otras cuantizaciones de Qwen3.5-9B (GGUF, AWQ, GPTQ) | no disponible | no disponible | no disponible | no disponible | no disponible |

Las fuentes secundarias consultadas sitúan a Qwen3.5-9B como un modelo multimodal de 9B con arquitectura gated-delta MoE y visión, con una tasa de éxito del 83 % en los benchmarks agregados de benchable.ai y un rendimiento de velocidad en el percentil 10 de su categoría; esas cifras corresponden al modelo base completo y no a este checkpoint de solo lenguaje, por lo que no son directamente extrapolables.

## Limitaciones y advertencias

- No es un modelo completo: faltan `model.visual` y todos los tensores `mtp.*`, de modo que las capacidades de visión y de predicción multi-token del modelo base no están disponibles aquí.
- Licencia dual: los pesos son apache-2.0, pero el software Glyd es BUSL-1.1 y exige licencia para uso comercial. Un despliegue comercial de este checkpoint con el runtime Glyd requiere revisar los términos en getglyd.com.
- Dependencia de plataforma estricta: solo Linux con GPU NVIDIA (Ampere, Ada, Hopper o Blackwell) y driver 580 o superior; no hay ruta documentada para CPU, AMD o Apple Silicon.
- Dependencia de versión: se requiere glyd 0.29.1 o posterior; no se garantiza la carga con versiones anteriores.
- No se documentan idiomas soportados, comportamiento de tool calling ni ventana de contexto oficial, por lo que no se pueden asumir estas capacidades sin validación propia.
- Al conservar los pesos bit a bit, hereda los sesgos, el riesgo de alucinación y las limitaciones idiomáticas del modelo base Qwen3.5-9B; el empaquetado sin pérdida no corrige ninguno de esos problemas.
- No hay cifras publicadas de latencia, throughput ni calidad para el checkpoint, lo que dificulta estimar capacidad de producción antes de medirlo.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que carece de validación por parte de la comunidad.

## Enlaces

- Checkpoint en HuggingFace: https://huggingface.co/glyd/Qwen3.5-9B-glyd
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Commit del modelo base referenciado: https://huggingface.co/Qwen/Qwen3.5-9B/tree/c202236235762e1c871ad0ccb60c8ee5ba337b9a
- Benchmarks GPU (RTX 4090 y RTX 5090, Glyd 0.29 frente a vLLM 0.30.0): https://github.com/surya-koritala/Glyd/tree/main/benchmarks/gpu/rtx4090-5090-qwen35-9b-v029-2026-10-06
- README de los benchmarks: https://github.com/surya-koritala/Glyd/blob/main/benchmarks/gpu/rtx4090-5090-qwen35-9b-v029-2026-10-06/README.md
- Sitio del proyecto Glyd: https://getglyd.com
- Ficha de Qwen 3.5 9B en melious.ai: https://melious.ai/hub/models/qwen3.5-9b
- Ficha y benchmarks en benchable.ai: https://benchable.ai/models/qwen/qwen3.5-9b-20260310
- Ficha en AI Model Radar: https://aimodelradar.app/models/qwen3-5-9b
