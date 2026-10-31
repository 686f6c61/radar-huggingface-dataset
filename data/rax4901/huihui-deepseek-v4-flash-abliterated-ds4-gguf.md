# rax4901/Huihui-DeepSeek-V4-Flash-abliterated-ds4-GGUF

## Resumen

Huihui-DeepSeek-V4-Flash-abliterated-ds4-GGUF es una versión cuantizada y "abliterada" (sin filtros de seguridad) de DeepSeek-V4-Flash, el modelo MoE de DeepSeek, publicada por el usuario rax4901 en HuggingFace con contribuciones de antirez y huihui.ai. La abliteración elimina las capas de rechazo del modelo original, produciendo una variante sin censura orientada a investigación y experimentación en entornos controlados.

El repositorio ofrece cuatro cuantizaciones GGUF (dos de 2 bits y una de 2 y 4 bits) optimizadas específicamente para el motor de inferencia ds4 de antirez y para llama.cpp (fork Fringe210), con soporte de múltiples GPU y Metal en Apple Silicon. El tamaño total del modelo base es de aproximadamente 284.335 millones de parámetros (dato real de safetensors), lo que lo sitúa en la categoría de modelos MoE de gran escala.

Incluye además un archivo MTP opcional (3,6 GiB) para decodificación especulativa. Con más de 630 descargas y licencia MIT, es relevante para quien necesite ejecutar un modelo DeepSeek de gran tamaño sin restricciones de contenido en hardware de gama alta (Mac con 96-128 GB de RAM unificada o GPU NVIDIA con 96 GB de VRAM).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mixture-of-experts), base DeepSeek-V4-Flash |
| Parametros totales | 284.334.567.511 (≈ 284,3 B) |
| Parametros activos | no disponible |
| Longitud de contexto | 131.072 tokens (según flag `--ctx 131072` del servidor ds4); la del modelo original no está indicada |
| Tipos de cuantizacion | IQ2_XXS, Q2_K, Q4_K (expertos); Q8_0 (attn proj, expertos compartidos, salida); F16 (router, embeddings, indexer, compressor, HC); F32 (normas, sinks, bias); BF16 base |
| Idiomas soportados | no disponibles |
| Licencia | MIT |
| Formato de pesos | GGUF (cuantizado); modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo base es DeepSeek-V4-Flash, una arquitectura mixture-of-experts de 284,3 mil millones de parámetros totales. Las cuantizaciones de este repositorio aplican esquemas mixtos: los expertos enrutados (`ffn_{gate,up,down}_exps`) se comprimen a 2 bits (IQ2_XXS o Q2_K) o 4 bits (Q4_K), mientras que las proyecciones de atención, los expertos compartidos y la capa de salida se mantienen en Q8_0, y el router, embeddings e indexer en F16. Este esquema mixto preserva la precisión de los componentes críticos para el enrutamiento y la calidad de salida, comprimiendo solo los expertos.

No se dispone de información sobre el proceso de entrenamiento del modelo base (número de tokens, composición del dataset, RLHF/DPO), ya que la model card solo documenta la cuantización y la abliteración. La abliteración es una técnica que modifica las activaciones responsables de los rechazos para eliminar el comportamiento de censura sin reentrenar el modelo. El archivo MTP incluido permite decodificación especulativa multi-token prediction, acelerando la inferencia cuando se usa junto con el modelo principal.

## Capacidades

- Generacion de texto conversacional (pipeline etiquetado como conversational)
- Razonamiento general heredado de DeepSeek-V4-Flash (no se detallan capacidades específicas en la model card)
- Generacion de codigo: la propia model card indica que la versión Q2 "funciona bien para escribir código"
- Contexto largo: hasta 131.072 tokens configurables en el servidor ds4
- Decodificacion especulativa mediante el archivo MTP opcional (3,6 GiB)
- Inferencia multi-GPU (layer-splitting) tanto en CUDA como en Metal (Apple Silicon)
- Modo servidor con API HTTP (ds4-server) y cache KV en disco (`--kv-disk-dir`)
- Sin filtros de seguridad: genera contenido que el modelo original rechazaría

No hay información sobre tool calling, capacidades de visión, audio ni soporte multiagente en la documentación disponible.

## Casos de uso

- Investigacion en seguridad y alineacion: al ser una versión abliterada, permite estudiar el comportamiento del modelo sin capas de rechazo, útil para red-teaming y análisis de sesgos en entornos controlados.
- Escritura de codigo sin restricciones: la model card señala que la versión Q2 funciona bien para programación; puede ejecutarse localmente con ds4 o llama.cpp sobre una RTX 6000 Pro.
- Experimentacion con decodificacion especulativa: el archivo MTP permite probar multi-token prediction para acelerar la inferencia de modelos MoE muy grandes.
- Inferencia local en Apple Silicon: la versión Q2 (80,8 GiB) cabe en Macs con 128 GB de RAM unificada, habilitando uso privado sin depender de la nube.
- Despliegue multi-GPU en estaciones de trabajo: ds4 soporta layer-splitting en varias GPU con parches de aceleración UDS y tensor-parallel para tarjetas de consumo.
- Servidor de inferencia autoalojado: ds4-server expone una API HTTP con contexto de 131.072 tokens y cache KV en disco, adecuada para prototipos internos.
- Generacion de contenido creativo sin filtros: para casos donde el rechazo del modelo original impide tareas legítimas de escritura, siempre bajo responsabilidad del usuario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

Como unico dato de rendimiento, la model card reporta mas de 35 tokens por segundo en el entorno de prueba: Windows, WSL2, Ubuntu 24.04, RTX 6000 Pro (96 GB) y CUDA 13.0, con la versión Q2.

## Requisitos de hardware

- VRAM/RAM segun cuantizacion:
  - IQ2_XXS: 74,7 GiB (la opción más ligera)
  - Q2 (mixto IQ2_XXS + Q2_K): 80,8 GiB — recomendada para Macs de 128 GB
  - Q2_K: 92,8 GiB
  - Q4_K: 153 GiB — requiere maquinas con ≥ 256 GB de RAM
  - MTP (opcional): 3,6 GiB adicionales
- GPU probadas: solo RTX 6000 Pro (96 GB); hardware NVIDIA no listado no ha sido probado
- Apple Silicon: MacBooks y Mac Studio con 96 GB de RAM (Metal), Q2 en maquinas de 128 GB
- No cabe en GPU de consumo estándar (RTX 4090 con 24 GB es insuficiente incluso para la versión más ligera en una sola tarjeta; serían necesarias múltiples GPU con layer-splitting)
- Motores de despliegue: ds4 (antirez, con soporte multi-GPU, tensor-parallel y parche UDS), ds4-server (API HTTP), llama.cpp fork Fringe210/llama.cpp-deepseek-v4-flash-cuda (soporta multi-GPU); compatibilidad con otros motores no garantizada y el modelo MTP requiere un loader específico
- Rendimiento conocido: > 35 tokens/s (Q2, RTX 6000 Pro, CUDA 13.0); no probado en entornos Apple

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Licencia | Motor |
|---|---|---|---|---|
| Huihui-DeepSeek-V4-Flash-abliterated-ds4-GGUF | 284,3 B (MoE) | IQ2_XXS / Q2_K / Q4_K | MIT | ds4, llama.cpp |
| deepseek-ai/DeepSeek-V4-Flash (base) | 284,3 B (MoE) | safetensors (original) | no disponible | oficial DeepSeek |
| antirez/deepseek-v4-gguf | 284,3 B (MoE) | IQ2_XXS mixto | no disponible | ds4, llama.cpp |

La diferencia principal frente al modelo base es la abliteración (sin filtros de seguridad) y la disponibilidad en GGUF cuantizado para hardware de gama alta; frente a la cuantización de antirez, esta versión añade la variante sin censura y el archivo MTP. No se conocen alternativas comparables de otros fabricantes con datos suficientes para una comparación de rendimiento.

## Limitaciones y advertencias

- Contenido sensible: la abliteración reduce drásticamente los filtros de seguridad; puede generar contenido ofensivo, controvertido o inapropiado. La model card recomienda revisión manual de las salidas.
- No apto para todos los públicos ni para entornos de producción o aplicaciones comerciales orientadas al público, según la propia model card, que recomienda uso en investigación y entornos controlados.
- Responsabilidad legal y etica recae íntegramente en el usuario; huihui.ai no ofrece garantías de seguridad.
- Tasa de rechazo residual: la versión Q2 mantiene cierto porcentaje de rechazos; otras versiones están aún en pruebas.
- Compatibilidad limitada: las cuantizaciones están diseñadas para ds4 y el fork específico de llama.cpp; otros motores pueden no funcionar y el modelo MTP requiere un loader concreto.
- Hardware sin verificar: solo se ha probado la RTX 6000 Pro; el rendimiento en otras GPU o en Mac no está contrastado.
- Requisitos de hardware muy elevados: mínimo ~75 GiB de memoria, fuera del alcance de la mayoría de configuraciones de consumo.
- Datos no disponibles: parámetros activos del MoE, idiomas soportados, longitud de contexto oficial del modelo base y benchmarks publicados.
- Riesgo de alucinacion: inherente a cualquier LLM de gran tamaño; no hay evaluaciones publicadas que cuantifiquen este riesgo en la versión abliterada.
- Licencia MIT: sin restricciones de uso comercial en teoría, pero la model card desaconseja explícitamente el uso comercial directo.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/rax4901/Huihui-DeepSeek-V4-Flash-abliterated-ds4-GGUF
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash
- Motor ds4 (antirez): https://github.com/antirez/ds4
- Fork de llama.cpp para DeepSeek-V4-Flash: https://github.com/Fringe210/llama.cpp-deepseek-v4-flash-cuda
- Parche UDS para ds4: https://github.com/huihui-support/ds4/tree/uds
- Parche tensor-parallel para ds4: https://github.com/huihui-support/ds4/tree/tp
- Cuantizaciones de referencia (antirez): https://huggingface.co/antirez/deepseek-v4-gguf/tree/main
- Soporte de huihui.ai: https://x.com/support_huihui
