# Saiko016/Qwen3.8-Flash-Next-GSQ-RCO-Coder-Hybrid-UD-IQ2_XS-basalt

## Resumen

Qwen3.8-Flash-Next-GSQ-RCO-Coder-Hybrid-UD-IQ2_XS-basalt es un paquete de pesos cuantizados del modelo Qwen3.8-Flash-Next, una arquitectura Mixture of Experts (MoE) de la familia Qwen, empaquetado en formato propietario Basalt v2 (`.basalt`) por el usuario Saiko016. El objetivo del paquete es hacer viable la inferencia de un modelo de gran tamano en GPUs de consumo: ocupa aproximadamente 53,8 GiB en disco (57.797.215.045 bytes) y esta disenado para ejecutarse en una tarjeta NVIDIA Blackwell de 8 GB de VRAM, desbordando la capa de expertos a memoria del sistema.

El paquete es un hibrido construido a partir de tres artefactos publicados: los pesos no-experto, router y mascara de poda del pack GSQ-RCO Coder de ISTA-DASLab (contenedor IQ1_M), los bancos de expertos enrutados de mayor precision (~2,6-3,1 bpw, UD-IQ2_XS) de Unsloth, y la cabeza MTP (multi-token prediction) del paquete canonico de Qwen para decodificacion especulativa. Se conservan 120 de los 144 expertos enrutados en la precision superior y los 24 restantes mantienen la cuantizacion IQ1_M agresiva del pack Coder.

Es relevante porque demuestra una via practica para servir modelos MoE de gran escala en hardware de gama de entrada mediante poda de expertos, cuantizacion mixta y streaming de expertos desde RAM. No es un modelo nuevo ni un fine-tune: es una redistribucion cuantizada, y solo puede cargarse con el motor Basalt (licencia MIT), no con llama.cpp, vLLM ni Ollama.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (Mixture of Experts) con cabeza MTP para decodificacion especulativa |
| Parametros totales | no disponible (el paquete BF16 de referencia ocupa ~354 GB) |
| Parametros activos | no disponible |
| Longitud de contexto | 65.536 tokens (64k) |
| Tipos de cuantizacion | Hibrida: IQ1_M en pesos no-experto/router y en 24 de 144 expertos; UD-IQ2_XS (~2,6-3,1 bpw) en 120 de 144 expertos; KV cache int8 |
| Idiomas soportados | no disponible |
| Licencia | Qwen Community License 1.0 (motor Basalt: MIT) |
| Formato de pesos | `.basalt` (v2, paquete autocontenido: pesos + tokenizer + config) |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer MoE de la familia Qwen3.8-Flash-Next, con 144 expertos enrutados y una cabeza MTP de una capa para prediccion del siguiente token, usada para decodificacion especulativa. El paquete no entrena ningun peso nuevo: recombinan artefactos existentes. Los pesos de atencion, router, expertos compartidos y la mascara de retencion de expertos (RCO 256/512) provienen del pack GSQ-RCO Coder de ISTA-DASLab, que a su vez deriva de un ajuste orientado a codigo. Los bancos de expertos enrutados se sustituyen por las versiones de mayor precision del shard 2 de Unsloth (UD-IQ2_XS), insertados ranura a ranura sobre la mascara del pack Coder.

La innovacion tecnica del paquete es la cuantizacion mixta por capas: se preserva la seleccion y poda de expertos del pack Coder (que retiene 120 de 144 expertos) mientras se mejora la precision de esos expertos retenidos, a costa de mantener los 24 restantes en IQ1_M. El empaquetado se realizo con el conversor propio de Basalt (`tools/convert/convert.py`). No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO en el modelo base.

## Capacidades

- Generacion de texto y razonamiento general, heredadas del modelo base Qwen3.8-Flash-Next.
- Generacion de codigo: el pack deriva de un ajuste especifico para codigo (GSQ-RCO Coder), por lo que la atencion y los expertos compartidos estan orientados a tareas de programacion.
- Soporte de tool calling y function calling: el autor reporta velocidad de 15-29 tok/s en cargas estructuradas con ~99 % de tasa de aceptacion especulativa.
- Capacidades de agente y razonamiento multi-paso: etiquetado con `agent` y `code` en los metadatos del repositorio.
- Contexto largo: ventana de 64k tokens, con prueba de recuperacion (needle) correcta sobre un prompt de 59.886 tokens.
- Decodificacion especulativa mediante cabeza MTP (ventana de especulacion configurable, por defecto 8).
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Asistencia de codigo en local: el pack esta ajustado para codigo y cabe en una GPU de 8 GB, lo que permite autocompletado y generacion de funciones en un portatil sin depender de la nube; el modo estructurado alcanza 15-29 tok/s, suficiente para iteracion interactiva.
- Agentes de codigo con tool calling: la alta tasa de aceptacion especulativa (~99 %) en cargas estructuradas lo hace adecuado para pipelines donde el modelo emite llamadas a herramientas en formato JSON de forma repetida.
- Procesamiento de repositorios y documentos largos: con 64k de contexto puede ingerir varios ficheros o un documento extenso en una sola pasada, util para resumen y busqueda semantica local.
- Prototipado y evaluacion de modelos MoE en hardware de consumo: sirve para medir el comportamiento real de un MoE de gran escala (calidad, latencia, presion de memoria) antes de invertir en GPUs de datacenter.
- Despliegue en entornos con requisitos de privacidad: al ejecutarse integramente en local con una API compatible con OpenAI en `http://127.0.0.1:8080/v1`, permite integrar el modelo en herramientas existentes sin enviar datos a terceros.
- Experimentacion con decodificacion especulativa y streaming de expertos: el paquete y el perfil de expertos calientes (`ista-coder-learned.prof`) permiten estudiar el impacto de la residencia de expertos en VRAM/RAM sobre el throughput.

## Benchmarks y rendimiento

El autor publica una puerta de calidad frente al modelo base BF16 (20 fragmentos, T=3):

| Metrica | Hibrido UD-IQ2_XS | Pack Coder plano (referencia) | Base BF16 |
|---|---|---|---|
| PPL | 5,7306 ± 0,2036 | no disponible | 2,2883 |
| KLD media | 1,15673 | 1,088 | 0 |
| KLD mediana | 0,35505 | no disponible | 0 |
| KLD p99 | 8,8253 | no disponible | 0 |
| KLD max | 14,6558 | no disponible | 0 |
| Top-1 coincidente con base | 66,90 % | 68,16 % | 100 % |
| Media \|Δlogp\| en top-1 del base | 1,25020 | no disponible | 0 |

Rendimiento en la maquina de referencia del autor (portatil con RTX 5050, 8 GB VRAM + 14 GB RAM, prompt de 16k, especulacion 8, cache de paginas caliente):

| Carga | Velocidad |
|---|---|
| Conversacion | 5-10 tok/s (aceptacion ~70 %) |
| Estructurado / tool calls | 15-29 tok/s (aceptacion ~99 %) |
| Prefill | 230-340 tok/s |
| Prueba en vivo a 64k (prompt de 59.886 tokens) | prefill 147 tok/s, TTFT ~6,5 min, needle recuperado correctamente |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM minima: 8 GB (NVIDIA Blackwell, sm_120, CUDA 13). En la maquina de referencia, 64k con `--resident-experts` y KV int8 consume ~4,7 GiB de VRAM y ~10,5 GiB de RAM.
- RAM del sistema: 14 GB recomendados para contexto de 64k; el motor hace streaming de los expertos que no caben en VRAM desde RAM (y opcionalmente desde SSD).
- Almacenamiento: ~53,8 GiB para el paquete; se recomienda NVMe rapido, ya que la velocidad de decodificacion depende del estado de la cache de paginas y de la temperatura del SSD (caches frias pueden reducirla a la mitad o mas).
- GPUs compatibles: el autor solo documenta NVIDIA Blackwell (RTX 5050 Laptop como referencia). No se especifican otras GPU en la informacion disponible.
- Motor de despliegue: exclusivamente Basalt >= 0.5.0 (MIT). No es compatible con llama.cpp, vLLM, Ollama ni TGI. Ofrece API compatible con OpenAI.
- Limitacion conocida del motor: en Basalt 0.5.5-0.5.7 puede aparecer un interbloqueo especifico de Qwen (lazy-commit/verify-window) cuando la capa de expertos esta desbordada; se recomienda fijar la capa o usar 0.5.0.
- Throughput y latencia: ver tabla de benchmarks (5-29 tok/s segun carga, TTFT de ~6,5 min en un prompt de 59.886 tokens).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este paquete (Hibrido UD-IQ2_XS Basalt) | no disponible (144 expertos, 120 retenidos) | 64k | `.basalt` | Qwen Community 1.0 | Solo motor Basalt |
| ISTA-DASLab Qwen3.8-Flash-Next-GSQ-RCO-Coder-GGUF | no disponible | no disponible | GGUF (IQ1_M) | Qwen Community 1.0 | llama.cpp y derivados |
| unsloth Qwen3.8-Flash-Next-GGUF | no disponible | no disponible | GGUF (UD-IQ2_XS) | Qwen Community 1.0 | llama.cpp y derivados |
| Qwen/Qwen3.8-Flash-Next (base BF16) | no disponible (pesos ~354 GB) | no disponible | safetensors | Qwen Community 1.0 | Requiere hardware de datacenter |

El paquete hibrido mejora la precision de expertos respecto al pack Coder plano (KLD 1,157 frente a 1,088 y top-1 66,90 % frente a 68,16 %) a cambio de un peor ajuste de distribucion, pero con mayor precision efectiva en los expertos y mejor velocidad. No se dispone de datos de benchmarks estandar para comparar con modelos de otros fabricantes.

## Limitaciones y advertencias

- Cuantizacion agresiva (~2 bits): el propio autor advierte de una brecha visible frente al BF16, especialmente en razonamiento de formato largo y conocimiento poco frecuente. La PPL del paquete (5,73) mas que duplica la del base (2,29).
- Solo 66,90 % de coincidencia en top-1 con el modelo base: puede producir respuestas plausibles pero distintas de las del original, con mayor riesgo de error en tareas de precision.
- Dependencia total del motor Basalt: no hay soporte en ecosistemas estandar (llama.cpp, vLLM, Ollama, TGI), lo que limita portabilidad y opciones de despliegue en produccion.
- Requisitos de plataforma estrictos: solo NVIDIA Blackwell (sm_120) con CUDA 13, Linux x86-64 o Windows x64, segun la informacion disponible.
- Bug conocido de interbloqueo en Basalt 0.5.5-0.5.7 cuando la capa de expertos esta desbordada; requiere fijar la capa o usar 0.5.0.
- Rendimiento muy dependiente del hardware: caches frias pueden reducir la velocidad de decodificacion a la mitad o mas; el TTFT en contextos de 64k puede superar los 6 minutos.
- Licencia Qwen Community 1.0: permite uso, modificacion y redistribucion con condiciones de atribucion y una clausula de licencia separada para ofertas comerciales de Model-as-a-Service o AI Work Assistant. Revisar antes de uso comercial.
- Este repositorio es un derivado comunitario no afiliado ni respaldado por Qwen/Alibaba, ISTA-DASLab ni Unsloth.
- No hay informacion sobre sesgos, idiomas soportados ni evaluaciones de seguridad del modelo base en la documentacion proporcionada.
- Repositorio con 0 descargas y 0 likes: sin validacion de la comunidad en el momento de la consulta.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Saiko016/Qwen3.8-Flash-Next-GSQ-RCO-Coder-Hybrid-UD-IQ2_XS-basalt
- Modelo base Qwen: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Licencia Qwen Community 1.0: https://huggingface.co/Qwen/Qwen3.8-Flash-Next/blob/main/LICENSE
- Pack GSQ-RCO Coder (ISTA-DASLab): https://huggingface.co/ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-Coder-GGUF
- Pack GGUF de Unsloth: https://huggingface.co/unsloth/Qwen3.8-Flash-Next-GGUF
- Motor Basalt (MIT): https://github.com/jesdga95/basalt
