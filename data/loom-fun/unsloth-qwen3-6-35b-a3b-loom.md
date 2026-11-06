# loom-fun/unsloth-Qwen3.6-35B-A3B-loom

## Resumen

`loom-fun/unsloth-Qwen3.6-35B-A3B-loom` es un paquete de despliegue para AMD Loom, no un modelo de pesos completo. Lo publica el usuario `loom-fun` y consiste en programas `.loom` junto con una tarjeta `model.json` que referencian el checkpoint GGUF sin modificar `unsloth/Qwen3.6-35B-A3B-GGUF` en cuantizacion `Q4_K_M`. El paquete se genero en un AMD Ryzen AI Max+ 395 "Strix Halo" mediante el flujo de trabajo de la fabrica `loom-skills`.

El modelo subyacente, Qwen3.6-35B-A3B, es una variante de la familia Qwen3 con arquitectura de mezcla de expertos (MoE), 35.000 millones de parametros totales y aproximadamente 3.000 millones activos por token segun la nomenclatura A3B. El paquete anade valor al permitir servir ese GGUF en GPUs integradas AMD mediante el runtime Loom, que expone una API compatible con OpenAI en `127.0.0.1:8080`.

La relevancia actual esta en la portabilidad: permite ejecutar un modelo MoE de 35B en hardware AMD de consumo profesional (Strix Halo) sin depender de CUDA, usando pesos ya cuantizados y un manifiesto con verificacion criptografica (`model.json.lock`). No incluye los pesos; hay que descargarlos por separado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) transformer, segun nomenclatura Qwen3.6-35B-A3B |
| Parametros totales | 35.000 millones (35B) |
| Parametros activos | 3.000 millones (3B, segun sufijo A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (GGUF referenciado) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (checkpoint externo), paquete `.loom` + `model.json` |

## Arquitectura y entrenamiento

El paquete no entrena ni modifica pesos: envuelve el GGUF `Q4_K_M` de `unsloth/Qwen3.6-35B-A3B-GGUF` en un manifiesto Loom con programas `.loom` y un `model.json` que incluye un fichero de bloqueo `model.json.lock` para verificar la integridad de la descarga. La arquitectura efectiva es la del modelo base Qwen3.6-35B-A3B: un transformer con mezcla de expertos, 35B totales y 3B activos por token, lo que reduce el coste computacional por paso manteniendo capacidad de representacion alta.

No se dispone de informacion sobre el numero de tokens de entrenamiento, composicion del dataset, tecnicas de alineacion (RLHF, DPO) ni innovaciones de decodificacion del modelo base en la informacion proporcionada. El unico detalle tecnico verificable del paquete es el flujo de materializacion: `loom-fetch` instala los programas desde este repositorio y el GGUF desde el repositorio de unsloth, comprobando ambos contra el lock.

## Capacidades

- Generacion de texto y razonamiento general, heredados del modelo base Qwen3.6-35B-A3B.
- Capacidad de codigo y matematicas esperable en la familia Qwen3, aunque sin confirmacion explicita en la model card.
- Servicio via API compatible con OpenAI: endpoint `/v1/chat/completions` en `127.0.0.1:8080`, lo que facilita integrar clientes existentes.
- Ejecucion en GPU AMD mediante el backend `amdgpu` de `loom-serve`.
- Verificacion de integridad de pesos y programas mediante `model.json.lock`.
- Soporte de tool calling, agentes, vision o audio: no disponible.
- Capacidades multilingues: no disponible.

## Casos de uso

- Despliegue local en estaciones con AMD Ryzen AI Max+ 395: el paquete permite servir el modelo con `loom-serve --device=amdgpu` sin configurar CUDA, aprovechando la memoria unificada del SoC Strix Halo.
- Sustitucion de backends propietarios en prototipos: al exponer `/v1/chat/completions`, se puede apuntar cualquier cliente compatible con OpenAI al servidor local y comparar respuestas sin cambiar codigo.
- Entornos con requisitos de soberania de datos: el modelo corre en `127.0.0.1`, de modo que las peticiones no salen de la maquina, adecuado para pruebas con datos sensibles.
- Reproducibilidad de despliegues: el par `model.json` + `model.json.lock` permite reconstruir exactamente el mismo conjunto de programas y pesos en otra maquina mediante `loom-fetch --materialize=copy`.
- Evaluacion de modelos MoE en hardware de consumo: util para medir latencia y calidad de un 35B-A3B cuantizado a Q4_K_M en GPUs integradas frente a soluciones discretas.
- Base para pipelines de generacion de texto por lotes: el modelo puede procesar colas de peticiones a traves de la API local en un nodo unico con aceleracion AMD.
- Formacion y talleres: instalacion reproducible con dos comandos, adecuada para entornos docentes donde no se quiere depender de infraestructura cloud.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita. Un GGUF Q4_K_M de 35B totales requiere del orden de 20-22 GB solo para pesos; a ello hay que sumar cache KV y overhead del runtime.
- GPU objetivo declarada: AMD Ryzen AI Max+ 395 "Strix Halo" (GPU integrada Radeon con memoria unificada).
- GPU NVIDIA: no se documenta soporte; el backend indicado es `amdgpu`.
- Cabe en GPU de consumo: si, en el hardware Strix Halo citado; no hay confirmacion para GPUs discretas de consumo.
- Opciones de despliegue: `loom-serve` (runtime Loom), instalado via `pip install "hrx-loom[hf]"`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Qwen3.6-35B-A3B (este paquete, via unsloth GGUF) | 35B | 3B | no disponible | Apache 2.0 | GGUF Q4_K_M + `.loom` | Runtime Loom para AMD |
| unsloth/Qwen3.6-35B-A3B-GGUF | 35B | 3B | no disponible | Apache 2.0 | GGUF | Mismo checkpoint sin empaquetar |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible | Sin datos en la informacion proporcionada |

La unica comparacion defendible con los datos disponibles es frente al propio checkpoint de unsloth: identicos pesos y licencia, con la diferencia del empaquetado Loom y el soporte de servidor para AMD.

## Limitaciones y advertencias

- El repositorio no contiene los pesos; sin ejecutar `loom-fetch` no hay modelo que cargar.
- La cuantizacion Q4_K_M introduce perdida de calidad frente a precision completa; no se han publicado metricas de degradacion.
- No hay informacion sobre sesgos, tasas de alucinacion ni evaluaciones de seguridad del modelo base en la informacion proporcionada.
- Cobertura idiomatica no documentada; no se puede garantizar calidad en castellano sin evaluacion propia.
- Dependencia de un runtime especifico (Loom) y de hardware AMD; el ecosistema es mucho mas reducido que el de llama.cpp o vLLM.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validacion comunitaria.
- Aunque la licencia es Apache 2.0, conviene revisar las condiciones del modelo base Qwen3.6 y del GGUF de unsloth antes de uso comercial en produccion.
- El contenido de la busqueda web sobre "Loom" corresponde a productos no relacionados (grabador de pantalla, marca de ropa); no aporta informacion tecnica sobre este paquete.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/loom-fun/unsloth-Qwen3.6-35B-A3B-loom
- Modelo base GGUF: https://huggingface.co/unsloth/Qwen3.6-35B-A3B-GGUF
- Runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Fabrica loom-skills: https://github.com/loom-fun/loom-skills
