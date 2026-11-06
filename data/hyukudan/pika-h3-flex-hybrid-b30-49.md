# hyukudan/Pika-H3-Flex-Hybrid-b30-49

## Resumen

Pika-H3-Flex-Hybrid-b30-49 es un adaptador (LoRA) comunitario creado por el usuario hyukudan para el ecosistema de generación de vídeo de MiniMax H3 y los adaptadores Pika H3 Flex de Pika Labs. No es un modelo de difusión completo, sino un "block-spliced adapter": una versión híbrida construida copiando tensores de los dos adaptadores oficiales de Pika (FL2VA y Ref2VA), diseñada específicamente para checkpoints "híbridos" de MiniMax H3 que combinan pesos de ambos.

El problema que resuelve es de compatibilidad: los checkpoints híbridos usan los bloques 0-29 (y todas las capas no bloque) del modelo FL2VA y los bloques 30-49 del modelo Ref2VA, pero Pika solo publica un adaptador por modelo puro, por lo que ninguno de los dos encaja con un híbrido. Este adaptador replica la misma división, de modo que cada bloque recibe la corrección de Pika entrenada para los pesos que realmente contiene.

Es relevante para usuarios de ComfyUI que trabajan con generación de vídeo con referencias (imagen y audio) sobre checkpoints híbridos H3, ya que permite mantener el condicionamiento multi-referencia de Ref2VA evitando algunos artefactos del modelo puro. El repo ocupa 2,0 GB y se distribuye bajo la MiniMax H3 Community License.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA block-spliced sobre el modelo de difusion de video MiniMax H3 (Pika H3 Flex) |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 (adaptador); recomendado con checkpoints int8 del modelo base |
| Idiomas soportados | no disponible (modelo generativo de video; el README reporta pruebas con dialogo en castellano) |
| Licencia | MiniMax H3 Community License (other) |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El adaptador es una composición por bloques de dos adaptadores oficiales de Pika H3 Flex: los bloques 0-29 y todas las capas no bloque provienen de `pika_h3_flex_fl2va_v1_bf16.safetensors` (256 tensores), y los bloques 30-49 provienen de `pika_h3_flex_ref2va_v1_bf16.safetensors` (160 tensores). Ambos adaptadores de origen comparten conjuntos de claves identicos, lo que permite el empalme directo. No hubo fusion, promediado ni reentrenamiento: es una copia plana de tensores, verificada tensor a tensor contra el checkpoint hibrido de destino. El script de construccion, `build_hybrid_adapter.py`, esta incluido en el repositorio.

El modelo base, Pika H3 Flex, es un adaptador de Pika Labs sobre la arquitectura de difusion de video MiniMax H3, con soporte de generacion texto-a-audio-video e imagen-a-video. Los datos de entrenamiento del modelo base (numero de tokens, composicion del dataset, RLHF/DPO) no estan disponibles en la informacion proporcionada.

## Capacidades

- Generacion de video con condicionamiento multi-referencia heredado de Ref2VA (imagen y audio como referencias)
- Generacion texto-a-audio-video e imagen-a-video (pipeline image-to-video en ComfyUI)
- Correccion de artefactos adaptada a checkpoints hibridos FL2VA/Ref2VA
- Lip-sync correcto reportado en pruebas con dialogo en castellano
- Compatibilidad con LoRAs de estilo encadenados antes de este adaptador
- Uso con sampler `lcm` a 6 pasos con sigmas manuales (CFG 1.0)
- No requiere ni admite LoRAs turbo/Lightning adicionales

## Casos de uso

- Generacion de planos con dialogo en castellano: el README reporta un plano medio fijo de 15 s con dialogo en castellano, sin cortes no solicitados, encuadre estable y lip-sync correcto, gracias a la referencia de audio de Ref2VA.
- Clips multi-plano con cortes dirigidos: permite pedir cortes duros en la accion; en las pruebas, un clip de dos personajes de 25 s (plano general a plano medio tres cuartos) ejecuto el corte donde se solicito, con habitacion y vestuario consistentes.
- Produccion de video con referencias multiples: al conservar el condicionamiento multi-referencia de Ref2VA en los bloques 30-49, es adecuado para flujos que combinan imagen y audio de referencia.
- Flujos de trabajo en ComfyUI sobre checkpoints hibridos: integracion directa via `LoraLoaderModelOnly` con fuerza 1.0 sobre checkpoints tipo `minimax_h3_hybrid_fl2va_ref2va_b30-49-int8`.
- Estilizacion con LoRAs de estilo: puede encadenarse con LoRAs estilisticos (por ejemplo, un LoRA de terror de los anos 80) colocandolos antes en la cadena.
- Generacion de video de larga duracion: las pruebas cubren clips de 15 s y 25 s, util para segmentos de video narrativo mas largos que los tipicos clips de unos pocos segundos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, etc.) en la informacion disponible; no son aplicables a un adaptador de generacion de video. Como dato de rendimiento empirico, el autor reporta tiempos de muestreo en una GPU de 96 GB a 1184x672, 24 fps: unos 28 s/paso para clips de 15 s y 65 s/paso para clips de 25 s. El autor senala que no es mas rapido que una configuracion turbo de 6 pasos; la ganancia es de calidad.

## Requisitos de hardware

- VRAM estimada para inferencia: el autor realizo las pruebas en una GPU de 96 GB; no hay datos publicados para configuraciones con menos VRAM. El checkpoint hibrido en int8 reduce los requisitos respecto a bf16, pero la cifra exacta no esta disponible.
- GPU recomendadas: una GPU de gama datacenter con 96 GB (por ejemplo, clase A100/H100 80-96 GB) segun las pruebas del autor; no hay datos verificados para GPUs de consumo.
- GPUs de consumo: no verificado; dado el tamano del modelo base H3 y los tiempos reportados, es improbable que quepa comodamente en GPUs de consumo tipicas (24 GB), aunque no hay mediciones publicadas.
- Opciones de despliegue: ComfyUI (caso de uso principal), con `UNETLoader` para el checkpoint hibrido y `LoraLoaderModelOnly` para este adaptador. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a difusion de video).
- Latencia y throughput: aproximadamente 28 s/paso para clips de 15 s y 65 s/paso para clips de 25 s a 1184x672 y 24 fps en una GPU de 96 GB, con 6 pasos de muestreo.
- Nota operativa: al alternar entre una configuracion turbo y este adaptador sobre un checkpoint int8, conviene liberar los modelos primero (`/free` con `unload_models`) para evitar el error `Cannot set version_counter for inference tensor`.

## Comparativa con modelos similares

| Modelo | Tipo | Bloques | Compatibilidad | Licencia |
|---|---|---|---|---|
| Pika-H3-Flex-Hybrid-b30-49 (este) | Adaptador hibrido block-spliced | 0-29 FL2VA + 30-49 Ref2VA | Checkpoints hibridos FL2VA/Ref2VA b30-49 | MiniMax H3 Community License |
| pika_h3_flex_fl2va_v1 | Adaptador oficial Pika | Modelo FL2VA puro | Solo modelo FL2VA puro | MiniMax H3 Community License |
| pika_h3_flex_ref2va_v1 | Adaptador oficial Pika | Modelo Ref2VA puro | Solo modelo Ref2VA puro | MiniMax H3 Community License |

La ventaja diferencial es la compatibilidad exacta con checkpoints hibridos: los adaptadores oficiales de Pika no encajan con un hibrido, mientras que este replica su division de bloques. En cuanto a parametros, contexto y benchmarks comparativos, no hay datos disponibles.

## Limitaciones y advertencias

- Compatibilidad estricta: solo debe usarse con checkpoints hibridos con la misma division (bloques 30-49 de Ref2VA). Para los modelos puros hay que usar los adaptadores originales de Pika.
- Estado experimental: el propio autor lo califica de experimental y solo ligeramente probado; los resultados pueden variar con otras resoluciones, duraciones o configuraciones.
- No es mas rapido que una configuracion turbo de 6 pasos: la ganancia es de calidad, no de velocidad.
- No debe combinarse con LoRAs turbo/Lightning adicionales.
- Restricciones de licencia: se distribuye bajo la MiniMax H3 Community License, sujeta a su Politica de Uso Aceptable y ambito territorial; conviene revisar `LICENSE` y `licenses/MiniMax-H3-LICENSE.txt` antes de uso comercial.
- Datos de sesgo, riesgo de alucinacion visual o limitaciones de idioma: no disponibles.
- Advertencia tecnica: el error `Cannot set version_counter for inference tensor` puede aparecer al cambiar entre configuraciones sin liberar los modelos previamente.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/hyukudan/Pika-H3-Flex-Hybrid-b30-49
- Modelo base (Pika H3 Flex): https://huggingface.co/Pika-Labs/Pika-H3-Flex
- Licencia (en el repositorio): `LICENSE` y `licenses/MiniMax-H3-LICENSE.txt`
- Script de construccion (en el repositorio): `build_hybrid_adapter.py`

No se han encontrado otros enlaces relevantes (papers, blogs o demos) en la informacion disponible.
