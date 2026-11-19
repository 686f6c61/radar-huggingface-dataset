# loom-draft/bartowski-dolphin-2.9-llama3-8b-loom

## Resumen

`loom-draft/bartowski-dolphin-2.9-llama3-8b-loom` es un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) que empaqueta el checkpoint GGUF sin modificar `dolphin-2.9-llama3-8b-Q4_K_M.gguf`, publicado originalmente por bartowski. No se trata de un modelo nuevo ni de un fine-tune: el autor del paquete (loom-draft) ha generado los programas de inferencia con la herramienta `loom-next` a partir del GGUF original, sin intervención de un LLM en el proceso. El modelo subyacente es Dolphin 2.9 Llama 3 8B, un modelo de 8.000 millones de parámetros derivado de Llama 3 con ajuste fino orientado a instrucciones sin restricciones de alineación.

La relevancia de este paquete es puramente operativa: permite ejecutar el GGUF en GPUs AMD concretas (Ryzen AI Max+ 395 "Strix Halo", gfx1151, y Radeon AI PRO R9700, gfx1201, 32 GB) mediante el runtime Loom, que expone una API compatible con OpenAI (`/v1/chat/completions`). No aporta mejoras de calidad, contexto ni capacidades respecto al modelo base; de hecho, el paquete fija el contexto en 8.192 tokens por petición, muy por debajo del contexto nativo de Llama 3 8B.

El estado del artefacto es muy incipiente: 0 descargas, 0 likes, creado el 19 de noviembre de 2026, y la propia model card indica que las mediciones de rendimiento y las puertas de corrección (kernel tests, golden, compare, etc.) "no se han vuelto a medir todavía" en ambas GPUs. Cualquier evaluación de producción debe tratar este paquete como no validado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3 8B, según el modelo base) |
| Parámetros totales | 8.000 millones (modelo base Dolphin 2.9 Llama 3 8B) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 8.192 tokens por petición (fijado por el preset Loom) |
| Tipos de cuantización | Q4_K_M (GGUF) |
| Idiomas soportados | no disponible |
| Licencia | other (heredada del modelo base; consultar términos de Llama 3 y de Dolphin) |
| Formato de pesos | GGUF (Q4_K_M) empaquetado como programas `.loom` + `weights.loom` + `tokenizer.json` + `llm_config.json` |

## Arquitectura y entrenamiento

El modelo subyacente es Dolphin 2.9 Llama 3 8B, un transformer decoder-only de 8.000 millones de parámetros construido sobre Llama 3 8B y ajustado por el proyecto Dolphin con un dataset orientado a instrucciones y conversación sin las restricciones de alineación típicas de los modelos comerciales. La información proporcionada no detalla el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO; esos datos corresponden a la model card original de Dolphin, que no se incluye en esta ficha.

La innovación técnica de este artefacto no está en el modelo sino en el empaquetado: `loom-next` genera programas `.loom` (kernels y grafo de ejecución) específicos para las arquitecturas AMD gfx1151 y gfx1201 a partir del GGUF y de `llm_config.json`, y `loom-serve` los ejecuta con un pool de memoria fijo (`--pool_backing=fixed`) y precarga de parámetros (`--parameter_mode=preload`). El paquete declara soporte de 4 peticiones concurrentes, un máximo de 4.096 tokens de salida por preset y una API estilo OpenAI. No hay decodificación especulativa, tool calling, modo de razonamiento ni entrada multimodal: la tabla de features del autor marca esas filas como "not applicable".

## Capacidades

- Generación de texto conversacional y de instrucciones, heredada del modelo base Dolphin 2.9 Llama 3 8B.
- Razonamiento y código: capacidades propias del modelo base, sin datos de benchmarks en este paquete.
- API compatible con OpenAI: endpoint `/v1/chat/completions` con formato de mensajes `role`/`content`.
- Concurrencia: hasta 4 peticiones simultáneas según la tabla de features.
- Límite de salida: 4.096 tokens por petición (preset `max_tokens`).
- Tool calling / function calling: no soportado ("not applicable").
- Modo de razonamiento o thinking: no soportado.
- Decodificación especulativa: no soportada.
- Entrada de imagen o audio: no soportada.
- Muestreo (temperature, top_k, seed): estado "not determined" en la model card.

## Casos de uso

- Despliegue local en estaciones de trabajo con AMD Strix Halo: el paquete está pensado para ejecutar el GGUF Q4_K_M en la iGPU Ryzen AI Max+ 395 mediante `loom-serve`, sin necesidad de GPU discreta, usando el runtime Loom en lugar de llama.cpp.
- Inferencia en servidores con Radeon AI PRO R9700: con 32 GB de VRAM, el Q4_K_M de 8B cabe holgadamente y permite servir hasta 4 peticiones concurrentes con la API OpenAI, adecuado para prototipos internos.
- Chatbot de asistencia técnica en entornos controlados: el contexto de 8.192 tokens permite conversaciones multi-turno moderadas; útil para soporte interno donde no se requiere tool calling.
- Generación de texto y borradores en pipelines por lotes: al exponer `/v1/chat/completions`, se puede integrar con clientes que ya hablan el protocolo OpenAI (SDKs de Python, LangChain, etc.) apuntando a `127.0.0.1:8080`.
- Evaluación comparativa de runtimes AMD: sirve como banco de pruebas para medir Loom frente a llama.cpp en las mismas GPUs, aunque las métricas de rendimiento del paquete aún no se han publicado.
- Experimentación con modelos sin alineación: el modelo base Dolphin está pensado para investigación sobre comportamiento de modelos poco restringidos; el paquete permite probarlo en hardware AMD con un esfuerzo de configuración mínimo.
- Pruebas de integración de API compatible con OpenAI en CI: se puede levantar el servidor y ejecutar tests de contrato contra el endpoint sin depender de servicios en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que las mediciones de rendimiento frente a llama.cpp para Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201) "no se han vuelto a medir todavía", y que todas las puertas de corrección (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) figuran como "not yet re-measured" en ambas GPUs.

## Requisitos de hardware

- VRAM estimada: un GGUF Q4_K_M de 8B ocupa aproximadamente 4,5-5 GB de pesos; el pool de memoria fijo de Loom añade overhead de KV cache y buffers, por lo que conviene reservar al menos 6-8 GB.
- GPUs soportadas explícitamente: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- GPU de consumo: no se documentan otras GPU en la información disponible; no hay confirmación de soporte para RTX 4090, A100, H100 ni otras tarjetas.
- Despliegue: runtime Loom (`pipx install "hrx-loom[hf]==0.2.0"`, `loom-fetch`, `loom-serve`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en este paquete.
- Latencia y throughput: no disponibles; las filas de rendimiento de la model card están pendientes de medición.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| loom-draft/bartowski-dolphin-2.9-llama3-8b-loom | 8B | 8.192 tokens | Loom (.loom) + GGUF Q4_K_M | other | Paquete específico para AMD gfx1151/gfx1201; sin benchmarks publicados |
| bartowski/dolphin-2.9-llama3-8b-GGUF | 8B | contexto nativo del modelo base (no detallado aquí) | GGUF | other | Checkpoint de origen; ejecutable con llama.cpp en múltiples backends |
| Dolphin 2.9 Llama 3 8B (original) | 8B | contexto nativo del modelo base | safetensors | other | Modelo de referencia del que derivan ambos artefactos |

No se dispone de datos de rendimiento de este paquete para comparar numéricamente con alternativas; la comparación es estructural (formato, hardware objetivo y limitaciones del preset).

## Limitaciones y advertencias

- Paquete no validado: 0 descargas, 0 likes y todas las puertas de corrección y mediciones de rendimiento pendientes de reejecutar.
- Contexto recortado: el preset fija 8.192 tokens por petición, lo que limita casos de uso que requieran ventanas largas.
- Sin tool calling, sin modo de razonamiento, sin decodificación especulativa y sin entrada multimodal; no apto para pipelines de agentes.
- Muestreo no determinado: el comportamiento de temperature, top_k y seed está marcado como "not determined", lo que añade incertidumbre en producción.
- Licencia "other": hay que verificar los términos del modelo base Dolphin y de Llama 3 antes de cualquier uso comercial; la licencia Llama 3 impone restricciones y obligaciones de atribución.
- Modelo base sin alineación: Dolphin está diseñado para ser poco restrictivo, por lo que aumenta el riesgo de contenido sesgado, tóxico o inseguro y de alucinaciones; requiere filtros y evaluación propios.
- Idiomas no declarados: no hay información sobre cobertura multilingüe en este paquete.
- Hardware muy específico: solo se documentan dos GPUs AMD; el soporte en otras plataformas no está garantizado.
- Artefacto generado automáticamente: los programas `.loom` se produjeron con `loom-next` sin LLM en el bucle, pero sin evidencia publicada de corrección frente a llama.cpp.

## Enlaces

- Hugging Face: https://huggingface.co/loom-draft/bartowski-dolphin-2.9-llama3-8b-loom
- Modelo base (GGUF): https://huggingface.co/bartowski/dolphin-2.9-llama3-8b-GGUF
- Runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Web del ecosistema Loom: https://loom-fun.github.io/loom-dev/
