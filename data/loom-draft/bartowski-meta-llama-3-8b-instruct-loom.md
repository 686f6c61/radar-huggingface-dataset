# loom-draft/bartowski-Meta-Llama-3-8B-Instruct-loom

## Resumen

`loom-draft/bartowski-Meta-Llama-3-8B-Instruct-loom` no es un modelo entrenado, sino un paquete de despliegue en formato Loom (`.loom` y `model.json`) generado a partir del checkpoint GGUF sin modificar `Meta-Llama-3-8B-Instruct-Q4_K_M.gguf` de bartowski. Lo produce la organizacion `loom-draft` mediante la herramienta `loom-next`, que genera programas Loom a partir del GGUF original sin intervencion de un LLM en el bucle. El objetivo es ejecutar Llama 3 8B Instruct sobre GPUs AMD concretas (Ryzen AI Max+ 395 "Strix Halo" y Radeon AI PRO R9700) a traves del runtime `loom-serve`, exponiendo una API compatible con OpenAI.

El modelo subyacente es Llama 3 8B Instruct de Meta, un transformer denso de 8.000 millones de parametros con 8.192 tokens de contexto por peticion. El paquete no altera los pesos: solo los reempaqueta y genera kernels especificos para las arquitecturas AMD gfx1151 y gfx1201. La relevancia es acotada: sirve como prueba de concepto de un pipeline de despliegue alternativo para hardware AMD, no como una mejora del modelo original.

El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y las mediciones de rendimiento y las puertas de correccion (`kernel_tests`, `golden`, `compare`, `consistency`, etc.) figuran como "not yet re-measured" para ambas GPUs. La ficha describe, por tanto, un artefacto de empaquetado mas que un modelo con resultados propios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Llama 3), empaquetado como programas Loom |
| Parametros totales | 8.030 millones (8B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 8.192 tokens por peticion (segun la model card del paquete) |
| Tipos de cuantizacion | Q4_K_M (GGUF de origen); el paquete incluye `weights.loom` generado desde ese GGUF |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | MIT (la del paquete); el modelo base Llama 3 se rige por la Llama 3 Community License |
| Formato de pesos | GGUF de origen; empaquetado en `.loom` (`program/*.loom`, `weights.loom`) |

## Arquitectura y entrenamiento

El modelo subyacente es Llama 3 8B Instruct, un transformer decoder-only denso con atencion multi-cabeza agrupada (GQA) y tokenizer de 128.256 entradas. No se dispone en la informacion proporcionada de detalles sobre el numero de tokens de entrenamiento, la composicion del dataset ni el proceso de alineacion (RLHF/DPO) empleado por Meta; esos datos pertenecen a la model card original de Llama 3 y no se reproducen aqui.

La innovacion del paquete es de infraestructura, no de modelado: `loom-next` compila el GGUF en programas Loom (`.loom`) con kernels especificos para gfx1151 (Strix Halo) y gfx1201 (Radeon AI PRO R9700), y `loom-serve` los ejecuta con un pool de memoria fijo (`--pool_backing=fixed`) y precarga de parametros (`--parameter_mode=preload`). El paquete soporta 4 peticiones concurrentes y un maximo de 4.096 tokens de salida por preset. No hay decodificacion especulativa, thinking mode ni tool calling: la model card marca esas capacidades como "not applicable".

## Capacidades

- Generacion de texto conversacional y de instrucciones, heredada de Llama 3 8B Instruct.
- API compatible con OpenAI (`/v1/chat/completions`) servida por `loom-serve` en `http://127.0.0.1:8080`.
- Contexto de 8.192 tokens por peticion, suficiente para conversaciones multi-turno moderadas y documentos cortos.
- Concurrencia de 4 peticiones simultaneas.
- Salida maxima de 4.096 tokens por preset (`max_tokens`).
- Tool calling / function calling: no soportado ("not applicable").
- Razonamiento explicito / thinking mode: no soportado ("not applicable").
- Decodificacion especulativa: no soportada ("not applicable").
- Entrada de imagen y entrada/salida de audio: no determinado ("not determined").
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Despliegue de Llama 3 8B Instruct en equipos con Ryzen AI Max+ 395 "Strix Halo": el paquete permite servir el modelo en local con `loom-fetch` y `loom-serve`, sin depender de CUDA ni de toolchains de NVIDIA.
- Servicio de chat interno en estaciones con Radeon AI PRO R9700 (32 GB): la API compatible con OpenAI permite conectar clientes existentes (SDK de OpenAI, LangChain, etc.) apuntando a `127.0.0.1:8080`.
- Evaluacion de la cadena de herramientas Loom frente a llama.cpp: el paquete incluye puertas de correccion (`golden`, `compare`, `consistency`, `sampling`) disenadas para comparar la salida token a token contra una referencia de llama.cpp sobre el mismo GGUF.
- Prototipado de asistentes conversacionales con contexto de hasta 8.192 tokens: adecuado para resumen de documentos cortos, respuesta a preguntas sobre un corpus pequeno o generacion de borradores.
- Pruebas de integracion de infraestructura AMD en pipelines de CI: al ser un artefacto reproducible con `model.json.lock` y verificacion sha256 en `loom-fetch`, sirve para validar que los kernels generados producen la salida esperada en cada actualizacion del runtime.
- Experimentacion con servidores locales compatibles con OpenAI en hardware consumer AMD: util para desarrolladores que quieran medir latencia y throughput de `loom-serve` frente a otras opciones (llama.cpp, Ollama, vLLM) en la misma maquina.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que las mediciones de rendimiento para Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201) "are not yet re-measured", y que todas las puertas de correccion (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) figuran como "not yet re-measured" en ambas GPUs.

## Requisitos de hardware

- VRAM estimada para inferencia: el GGUF de origen es Q4_K_M, lo que situa los pesos en torno a 4,9 GB; el paquete Loom anade el pool de memoria fijo y los buffers de ejecucion, por lo que el consumo real no esta documentado en la informacion disponible.
- GPU objetivo declaradas: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- Compatibilidad con GPUs consumer: no disponible; el paquete esta generado especificamente para las dos arquitecturas AMD citadas y no se documenta soporte para otras.
- Opciones de despliegue: `loom-fetch` (descarga y materializacion del paquete) y `loom-serve` (servidor), instalados via `pipx install "hrx-loom[hf]==0.2.0"`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI con este paquete.
- Latencia y throughput: no disponibles; las mediciones no se han vuelto a realizar.
- Parametros de ejecucion relevantes: `completion_spin_ns=4294967295` (espera activa de completaciones en GPU), `--pool_backing=fixed` (pool de memoria preasignado) y `--parameter_mode=preload` (precarga de pesos en host).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / despliegue | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este paquete (Llama 3 8B Instruct Q4_K_M, Loom) | 8B | 8.192 tokens | `.loom` + `loom-serve`, solo AMD gfx1151/gfx1201 | MIT (paquete); Llama 3 Community License (modelo) | 0 descargas, sin mediciones publicadas |
| bartowski/Meta-Llama-3-8B-Instruct-GGUF | 8B | 8.192 tokens | GGUF, llama.cpp y derivados | Llama 3 Community License | Ampliamente distribuido |
| Llama 3 8B Instruct (original de Meta) | 8B | 8.192 tokens | safetensors, transformers/vLLM/TGI | Llama 3 Community License | Disponible en Meta y Hugging Face |
| Llama 3.1 8B Instruct | 8B | 128.000 tokens | safetensors y GGUF | Llama 3.1 Community License | Disponible en Meta y Hugging Face |

La comparativa se limita a la familia Llama 3 de 8B porque la informacion proporcionada no incluye datos de rendimiento que permitan contrastar con otras familias (Qwen, Mistral, Gemma). Las diferencias clave frente al GGUF de bartowski son el empaquetado Loom y la restriccion a dos GPUs AMD; frente a Llama 3.1 8B, el contexto es 16 veces menor (8.192 frente a 128.000 tokens).

## Limitaciones y advertencias

- El paquete no incluye mediciones de rendimiento ni de correccion: todas las puertas figuran como "not yet re-measured", por lo que no hay evidencia publicada de que la salida coincida con llama.cpp.
- Repositorio con 0 descargas y 0 likes: sin validacion por parte de la comunidad.
- Soporte limitado a dos GPUs AMD concretas (gfx1151 y gfx1201); no se documenta compatibilidad con otras arquitecturas.
- Sin tool calling, sin thinking mode y sin decodificacion especulativa, lo que descarta su uso en pipelines de agentes o function calling.
- Contexto de 8.192 tokens por peticion, insuficiente para documentos largos o conversaciones muy extensas.
- Idiomas soportados no documentados en la informacion disponible; el comportamiento multilingue depende del modelo base y no se ha verificado en este paquete.
- Riesgo de alucinacion inherente a Llama 3 8B Instruct; no se documentan mitigaciones adicionales.
- Sesgos conocidos del modelo base no documentados en la informacion proporcionada.
- La licencia MIT del paquete no sustituye a la Llama 3 Community License del modelo base, que impone restricciones adicionales (incluida la clausula de "Built with Llama" y el limite de 700 millones de usuarios mensuales para uso comercial).
- Dependencia de una version concreta del runtime (`hrx-loom[hf]==0.2.0`); cambios de version pueden alterar el comportamiento.
- La fecha de creacion del repositorio (2026-11-26) y la ausencia de pipeline declarado impiden verificar el estado real del artefacto.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/loom-draft/bartowski-Meta-Llama-3-8B-Instruct-loom
- Modelo base GGUF: https://huggingface.co/bartowski/Meta-Llama-3-8B-Instruct-GGUF
- Runtime Loom (hrx-system): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
