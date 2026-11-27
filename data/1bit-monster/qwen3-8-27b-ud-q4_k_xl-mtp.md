# 1bit-MONSTER/Qwen3.8-27B-UD-Q4_K_XL-MTP

## Resumen

Qwen3.8-27B-UD-Q4_K_XL-MTP es un paquete listo para ejecutar que combina dos artefactos publicados previamente por Unsloth: la cuantizacion dinamica `UD-Q4_K_XL` del modelo Qwen3.8-27B y su cabeza de borrador MTP (multi-token prediction) correspondiente, pensada para decodificacion especulativa. El autor del repositorio, 1bit-MONSTER, no introduce pesos nuevos: empaqueta ambos ficheros GGUF y documenta la combinacion de cuantizacion, backend y flags que midio como el punto de equilibrio entre velocidad y calidad en hardware de consumo AMD (iGPU Strix Halo con Vulkan).

El modelo base es Qwen3.8-27B, con 27.320.697.856 parametros (27,3 mil millones) y licencia Apache 2.0. El interes practico del bundle reside en la mejora de rendimiento en decodificacion: segun las mediciones del autor, pasar de ~12 tok/s a 29-36 tok/s en `llama.cpp` y a 35,0 / 28,3 / 28,9 tok/s (codigo, prosa y prompts cortos) en su propio motor, manteniendo una divergencia KL de 0,0081 y un 95,3 % de acuerdo top-1 frente a la referencia.

Es relevante ahora porque permite desplegar un modelo de 27B en GPUs integradas de consumo con velocidades de decodificacion utilizables en interactividad, sin renunciar a la fidelidad de la cuantizacion Q4. El repositorio ocupa 18,9 GB e incluye tanto el modelo objetivo como la cabeza de borrador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base Qwen3.8-27B); bundle con cabeza MTP para decodificacion especulativa |
| Parametros totales | 27.320.697.856 (27,3 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | UD-Q4_K_XL (modelo objetivo, Unsloth Dynamic 2.0); Q4_0 (cabeza MTP); alternativas en la escalera UD: IQ4_XS a Q8_0; DFlash2 en Q8_0 y Q4_K |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |
| Tamano del repositorio | 18,9 GB |
| Backend medido | Vulkan (mejor que ROCm para este emparejamiento) |
| Longitud de borrador recomendada | 3 (5 resulto mas lento) |

## Arquitectura y entrenamiento

El bundle no entrena ni modifica pesos: agrupa el modelo base Qwen3.8-27B cuantizado por Unsloth con su cabeza de prediccion multi-token (MTP) del mismo modelo base. La cabeza MTP actua como borrador en un esquema de decodificacion especulativa: propone varios tokens por paso y el modelo objetivo los verifica en paralelo, aceptando el prefijo correcto. El autor fija la longitud maxima de borrador en 3 como valor medido optimo; valores superiores (5) degradan el throughput.

La cuantizacion empleada es Unsloth Dynamic 2.0 `UD-Q4_K_XL`, seleccionada tras recorrer la escalera completa de cuantizaciones UD (IQ4_XS hasta Q8_0) con y sin MTP. Los criterios reportados son KLD de 0,0081 y 95,3 % de acuerdo top-1 frente a la referencia; IQ4_XS iguala la velocidad con 2,3 veces mas KLD, mientras que Q5 y Q8 incrementan el coste con escasa ganancia de precision. Como alternativa al borrador MTP, el mismo fichero objetivo admite un borrador por bloques DFlash2, que rinde mejor en codigo y salida estructurada por proponer bloques mas largos, mientras que la cabeza MTP sigue siendo la opcion por defecto para turnos cortos de conversacion. No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens ni las etapas de alineacion (RLHF/DPO) del modelo base en la informacion proporcionada.

## Capacidades

- Generacion de texto conversacional en modo multi-turno (etiqueta `conversational` en el repositorio).
- Decodificacion especulativa con cabeza MTP integrada y longitud de borrador configurable.
- Compatibilidad con un borrador alternativo DFlash2 para bloques mas largos, orientado a codigo y salida estructurada.
- Ejecucion mediante `llama-server` con `--jinja`, lo que habilita plantillas de chat y, por extension del ecosistema, tool calling si la plantilla del modelo base lo soporta (no confirmado en la informacion disponible).
- Despliegue en endpoints compatibles (etiqueta `endpoints_compatible`).
- Ejecucion en GPUs integradas AMD (Strix Halo) mediante Vulkan y en el motor propietario del autor (`1bit serve`).
- Capacidades multilingues: no disponible.
- Vision, audio o modo de razonamiento explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Asistente conversacional local en estacion de trabajo con iGPU AMD: el bundle permite sostener conversaciones multi-turno a 28-35 tok/s en Strix Halo con Vulkan, velocidad suficiente para uso interactivo sin GPU dedicada.
- Generacion de codigo en editor o CLI: con la cabeza MTP se alcanzan 35,0 tok/s en cargas de codigo; para completados mas largos conviene evaluar el borrador DFlash2, que rinde mejor en codigo y salida estructurada.
- Prototipado de agentes y pipelines multi-paso en local: al ejecutarse sobre `llama-server` con `--jinja`, se integra en flujos que requieren plantillas de chat y, si el modelo base lo admite, llamadas a herramientas.
- Servicio de inferencia de bajo coste en hardware de consumo: el paquete de 18,9 GB cabe en equipos con memoria unificada amplia, evitando el coste de GPU de datacenter para cargas moderadas.
- Evaluacion comparativa de tecnicas de decodificacion especulativa: el repositorio documenta flags, backend y metricas (KLD, acuerdo top-1, tok/s) que sirven como referencia reproducible para comparar MTP frente a DFlash2.
- Redaccion y resumen de prosa: 28,3 tok/s medidos en prosa con el motor del autor, adecuado para generacion de documentos de longitud media en local.
- Despliegue en entornos con requisitos de licencia permisiva: Apache 2.0 permite uso comercial sin restricciones adicionales heredadas del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la informacion disponible. Las unicas metricas reportadas son de fidelidad de cuantizacion y velocidad de decodificacion:

| Metrica | Valor medido | Contexto |
|---|---|---|
| KLD frente a referencia | 0,0081 | UD-Q4_K_XL |
| Acuerdo top-1 | 95,3 % | UD-Q4_K_XL |
| KLD relativo de IQ4_XS | 2,3x el de UD-Q4_K_XL | Misma velocidad que UD-Q4_K_XL |
| Decodificacion sin MTP | ~12 tok/s | Strix Halo, Vulkan, `llama.cpp` |
| Decodificacion con MTP | 29-36 tok/s | Strix Halo, Vulkan, `llama.cpp` |
| Motor 1bit con `--mtp` (codigo) | 35,0 tok/s | Frente a 12,2 tok/s sin MTP |
| Motor 1bit con `--mtp` (prosa) | 28,3 tok/s | Frente a 12,2 tok/s sin MTP |
| Motor 1bit con `--mtp` (prompts cortos) | 28,9 tok/s | Frente a 12,2 tok/s sin MTP |

## Requisitos de hardware

- VRAM/memoria estimada: el repositorio completo ocupa 18,9 GB; el modelo objetivo en UD-Q4_K_XL mas la cabeza MTP en Q4_0 requieren en torno a esa cifra de memoria, aunque el dato exacto por fichero no se detalla.
- GPU validadas: iGPU AMD Strix Halo con backend Vulkan, configuracion en la que se realizaron todas las mediciones.
- GPU dedicadas: no se han publicado mediciones para A100, H100 o RTX 4090 en la informacion disponible.
- Cabe en GPU de consumo: si, en equipos con memoria unificada suficiente (el autor lo valida en iGPU Strix Halo); en GPUs discretas de consumo de 24 GB encajaria por tamano, pero no hay confirmacion empirica.
- Opciones de despliegue: `llama.cpp` (`llama-server` con `--spec-type draft-mtp -md ... -ngl 99 --jinja`) y el motor 1bit (`1bit serve --device hrx --mtp ...` o `--dflash ...`); `--mtp` y `--dflash` son exclusivos entre si.
- Backend recomendado: Vulkan, consistentemente mejor que ROCm para este emparejamiento segun el autor.
- Throughput: 29-36 tok/s en `llama.cpp` y 28,3-35,0 tok/s en el motor 1bit, frente a ~12 tok/s sin decodificacion especulativa. No se reportan latencias de prefill ni throughput por lotes.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-UD-Q4_K_XL-MTP (este) | 27,3 B | no disponible | GGUF UD-Q4_K_XL + MTP Q4_0 | Apache 2.0 | Bundle con decodificacion especulativa; 29-36 tok/s en Strix Halo |
| Qwen/Qwen3.8-27B (base) | 27,3 B | no disponible | Safetensors (formato original) | Apache 2.0 | Pesos completos sin cuantizar; requiere hardware de mayor capacidad |
| unsloth/Qwen3.8-27B-GGUF | 27,3 B | no disponible | Escalera UD completa (IQ4_XS a Q8_0) | Apache 2.0 | Misma cuantizacion y cabeza MTP, publicadas por separado sin el empaquetado ni los flags medidos |
| 1bit-MONSTER/Qwen3.8-27B-DFlash2-GGUF | 27,3 B | no disponible | Q8_0 y Q4_K | Apache 2.0 | Borrador alternativo por bloques; mejor en codigo y salida estructurada, peor en turnos cortos |

## Limitaciones y advertencias

- El repositorio no aporta pesos nuevos ni mejoras de calidad: cualquier limitacion del modelo base Qwen3.8-27B (sesgos, alucinacion, cobertura idiomatica) se hereda integra.
- La cuantizacion Q4 introduce perdida de precision (KLD 0,0081, 95,3 % de acuerdo top-1); para tareas sensibles a exactitud conviene subir a Q5 o Q8 asumiendo mayor coste de memoria y menor velocidad.
- Las mediciones de rendimiento provienen de una unica configuracion de hardware (Strix Halo, Vulkan) y del motor del propio autor; no son extrapolables sin validacion a otras GPUs o backends.
- La longitud de borrador optima es 3; valores superiores reducen el throughput, por lo que la configuracion debe ajustarse por carga de trabajo.
- `--mtp` y `--dflash` son mutuamente exclusivos; no pueden combinarse en el mismo despliegue.
- El repositorio tiene un numero muy bajo de descargas (331) y cero likes en el momento de la consulta, lo que limita la evidencia de uso independiente.
- No hay informacion publicada sobre longitud de contexto, idiomas soportados ni soporte verificado de tool calling en este bundle; conviene validarlo contra la documentacion del modelo base antes de llevarlo a produccion.
- Licencia Apache 2.0: permite uso comercial, pero debe conservarse la atribucion a Qwen y Unsloth como titulares de los pesos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/1bit-MONSTER/Qwen3.8-27B-UD-Q4_K_XL-MTP
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- GGUF de Unsloth (cuantizacion y cabeza MTP): https://huggingface.co/unsloth/Qwen3.8-27B-GGUF
- Borrador DFlash2: https://huggingface.co/1bit-MONSTER/Qwen3.8-27B-DFlash2-GGUF
- Motor 1bit: https://github.com/1bit-MONSTER/engine
- Familias del autor: https://huggingface.co/1bit-MONSTER#families
- Punto de entrada del autor: https://huggingface.co/1bit-MONSTER#start-here
