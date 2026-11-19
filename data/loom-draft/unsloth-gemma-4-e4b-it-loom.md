# loom-draft/unsloth-gemma-4-E4B-it-loom

## Resumen

`loom-draft/unsloth-gemma-4-E4B-it-loom` es un paquete de distribucion para el runtime AMD Loom del checkpoint GGUF `gemma-4-E4B-it-Q4_K_M.gguf` publicado por Unsloth, derivado a su vez del modelo Gemma 4 E4B instruct de Google. No se trata de un modelo nuevo ni de un fine-tune: el autor declara explicitamente que el checkpoint GGUF se usa "sin modificar" y que el repositorio contiene programas `.loom` y una tarjeta `model.json` generados con la herramienta `loom-next`, sin intervencion de un LLM en el proceso de generacion.

El objetivo del paquete es permitir servir Gemma 4 E4B (con entrada de imagen) sobre dos aceleradores AMD concretos: la APU Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la GPU Radeon AI PRO R9700 (gfx1201, 32 GB). El paquete expone una API compatible con OpenAI (`/v1/chat/completions`), soporta tool calling, modo de razonamiento opcional y entrada de imagenes mediante el proyector `mmproj-BF16.gguf`.

La relevancia es de nicho pero clara: ofrece una via de despliegue nativa en ROCm para hardware AMD consumer y profesional reciente, con contexto declarado de 131.072 tokens y hasta 4 peticiones concurrentes. En el momento de la consulta el repositorio no tiene descargas ni likes, el tamano reportado es de 0.0 GB y las mediciones de rendimiento y correccion del autor figuran como "not yet re-measured".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Gemma 4 E4B; el paquete no documenta la arquitectura interna) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | 131.072 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (checkpoint `gemma-4-E4B-it-Q4_K_M.gguf`); proyector de vision en BF16 (`mmproj-BF16.gguf`) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (checkpoint base) empaquetado como programas `.loom` y `weights.loom` |

Otros datos declarados por el autor: salida maxima de 4.096 tokens por preset, concurrencia de 4 peticiones, API estilo OpenAI, soporte de `image_url`, tool calling estilo OpenAI y modo thinking desactivado por defecto.

## Arquitectura y entrenamiento

No hay informacion en la documentacion proporcionada sobre la arquitectura del modelo base (tipo de transformer, atencion, composicion del dataset de entrenamiento, numero de tokens, uso de RLHF o DPO). El paquete Loom no modifica los pesos: se limita a generar kernels y programas de ejecucion para el GGUF de Unsloth, por lo que las caracteristicas de entrenamiento son las del checkpoint `gemma-4-E4B-it` original, no documentadas aqui.

La innovacion tecnica del repositorio esta en la capa de ejecucion, no en el modelo. `loom-next` genera programas `.loom` y un fichero `weights.loom` a partir del GGUF, y `loom-serve` los ejecuta sobre ROCm con opciones como `completion_spin_ns=4294967295` (espera activa de finalizaciones en GPU), `pool_backing=fixed` (reserva fija del pool de memoria) y `parameter_mode=preload` (carga anticipada de pesos en host). El autor incluye un conjunto de puertas de correccion (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) que comparan la salida contra llama.cpp sobre el mismo GGUF, pero todas figuran como "not yet re-measured" en la version publicada.

## Capacidades

- Generacion de texto conversacional con plantilla de chat instruct y API compatible con OpenAI.
- Entrada de imagenes (`image-text-to-text`) mediante partes `image_url` y el proyector `mmproj-BF16.gguf`.
- Tool calling estilo OpenAI: acepta `tools` y devuelve `tool_calls`.
- Modo de razonamiento/thinking opcional, desactivado por defecto y activable con `chat_template_kwargs: {"enable_thinking": true}`.
- Contexto largo de hasta 131.072 tokens por peticion.
- Concurrencia de hasta 4 peticiones simultaneas.
- Salida maxima de 4.096 tokens por preset.
- No soporta entrada ni salida de audio en Loom, aunque el modelo original si la tenga.
- No aplica decodificacion especulativa ni niveles de esfuerzo de razonamiento ("not applicable").

## Casos de uso

- Asistente conversacional local sobre Strix Halo: la APU Ryzen AI Max+ 395 permite ejecutar el paquete con `loom-serve` y exponer un endpoint `/v1/chat/completions` en `127.0.0.1:8080`, util para prototipos de escritorio sin GPU dedicada.
- Procesamiento de documentos largos con imagen: con 131.072 tokens de contexto se pueden enviar contratos, informes o transcripciones extensas junto con capturas o escaneos, y pedir resumenes o extraccion de datos.
- Automatizacion de soporte con tool calling: el soporte de `tools`/`tool_calls` permite conectar el modelo a una API interna de tickets y consultar el estado de un pedido dentro de un bucle multi-turno.
- Analisis de capturas y diagramas en flujos de desarrollo: la entrada de imagen via `image_url` sirve para describir errores en pantallazos, interpretar diagramas de arquitectura o revisar interfaces.
- Despliegue en estacion de trabajo con Radeon AI PRO R9700: los 32 GB de la GPU permiten servir el paquete en un equipo de desarrollo con ROCm, con 4 peticiones concurrentes para un equipo pequeno.
- Razonamiento paso a paso bajo demanda: activando `enable_thinking` se puede forzar una fase de razonamiento en tareas de analisis o matematicas, y desactivarla para respuestas rapidas en produccion.
- Evaluacion de la cadena Loom frente a llama.cpp: el paquete incluye puertas de correccion (`golden`, `compare`, `vision`, `agent`) pensadas para verificar equivalencia token a token con la referencia de llama.cpp sobre el mismo GGUF.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye secciones de rendimiento frente a llama.cpp para Strix Halo y R9700, pero ambas indican que "the results for this package are not yet re-measured". Todas las puertas de correccion figuran igualmente como "not yet re-measured", por lo que no hay evidencia registrada de latencia, throughput ni equivalencia de salida.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita. El checkpoint es Q4_K_M y el proyector de vision es BF16; el autor no publica cifras de memoria por componente.
- GPU objetivo declaradas: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- No se documenta compatibilidad con GPUs NVIDIA ni con GPU consumer AMD distintas de las dos anteriores.
- Despliegue: runtime Loom (`hrx-loom[hf]==0.2.0`), con `loom-fetch` para descargar el paquete y `loom-serve` para servirlo. Se instala con `pipx install "hrx-loom[hf]==0.2.0"`.
- Opciones de servicio relevantes: `--device=amdgpu://?completion_spin_ns=4294967295`, `--pool_backing=fixed` y `--parameter_mode=preload`.
- Latencia y throughput: no disponibles; las mediciones del autor estan pendientes de repetir.
- Concurrencia soportada: 4 peticiones simultaneas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| `loom-draft/unsloth-gemma-4-E4B-it-loom` | no disponible | 131.072 | Apache 2.0 | GGUF empaquetado en `.loom` | Paquete de despliegue para AMD Loom; sin benchmarks publicados |
| `unsloth/gemma-4-E4B-it-GGUF` | no disponible | no disponible en esta ficha | no disponible en esta ficha | GGUF | Checkpoint base sin modificar del que deriva el paquete |
| Gemma 4 E4B instruct (original de Google) | no disponible | no disponible en esta ficha | no disponible en esta ficha | no disponible en esta ficha | Modelo upstream; el paquete no documenta sus especificaciones |

No se dispone de datos de rendimiento del paquete ni de los modelos comparables en la informacion proporcionada, por lo que no es posible establecer una comparativa cuantitativa.

## Limitaciones y advertencias

- El repositorio no incluye pesos propios: el tamano reportado es de 0.0 GB y el contenido son programas `.loom` y una tarjeta `model.json`; los pesos se obtienen del GGUF de Unsloth.
- Sin evidencia de correccion publicada: las 11 puertas (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) figuran como "not yet re-measured".
- Sin benchmarks de rendimiento: las secciones de Strix Halo y R9700 estan pendientes de repetir, por lo que no hay cifras de latencia ni throughput verificadas.
- Compatibilidad de hardware muy restringida: solo se documentan gfx1151 y gfx1201; no hay soporte declarado para NVIDIA ni para otras GPUs AMD.
- Idiomas soportados no documentados; no se puede garantizar calidad multilingue en produccion.
- Audio no soportado en Loom aunque el modelo original lo tenga, lo que limita casos de uso multimodales.
- Sin datos sobre sesgos, tasa de alucinacion o comportamiento en dominios sensibles.
- El paquete se genero de forma automatica con `loom-next` sin LLM en el bucle; conviene validar la salida contra llama.cpp antes de usarlo en produccion.
- Las busquedas web realizadas devuelven resultados de Loom (la herramienta de grabacion de pantalla) y de la marca de ropa Loom, no relacionados con este runtime; no aportan informacion adicional sobre el modelo.
- Licencia Apache 2.0 declarada, que en principio permite uso comercial, pero al derivar de un modelo de Google conviene verificar los terminos del modelo upstream antes de desplegar.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/loom-draft/unsloth-gemma-4-E4B-it-loom
- Checkpoint base en Hugging Face: https://huggingface.co/unsloth/gemma-4-E4B-it-GGUF
- Runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador `loom-next`: https://github.com/loom-fun/loom-next
- Web del ecosistema Loom: https://loom-fun.github.io/loom-dev/
