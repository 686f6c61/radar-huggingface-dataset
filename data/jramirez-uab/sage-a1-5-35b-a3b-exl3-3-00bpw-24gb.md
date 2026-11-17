# JRamirez-UAB/Sage-A1.5-35B-A3B-EXL3-3.00bpw-24GB

## Resumen

Sage-A1.5-35B-A3B-EXL3-3.00bpw-24GB es una cuantización no oficial, de carácter comunitario, del modelo InternScience/Sage-A1.5, un MoE agéntico de 35B parámetros totales con 3B activos construido sobre Qwen3.6-35B-A3B. La publica el usuario JRamirez-UAB y su objetivo es empaquetar el modelo en un formato EXL3 de 3.00 bits por peso (bpw) para que quepa y funcione en una única GPU de 24 GB, en concreto una RTX 3090 (Ampere), manteniendo la ventana de contexto completa de 262.144 tokens.

La cuantización emplea exllamav3 1.6.5 como herramienta, con 3.00 bpw en los expertos enrutados, 4 bits en atención, atención lineal y expertos compartidos, un `lm_head` de 6 bits, una torre de visión de 6 bits, una cabeza MTP de 4 bits y embeddings de tokens en INT4. El resultado son 14,82 GB de pesos que, con caché KV INT4 en vLLM, permiten un pool de 1,54 M de tokens y sostener cuatro sesiones concurrentes de 236k tokens en una sola tarjeta.

El interés actual del checkpoint es práctico: demuestra que un modelo agéntico multimodal con contexto largo puede servirse en hardware de consumo mediante una pila específica (vLLM 0.34.0 + exllamav3 1.6.7 + vllm-quantpack 0.1.6), con divergencia KL baja frente a BF16 (0.0152 y 0.0171 en trazas de agente) y resultados medidos en tareas de administración de sistemas, tool calling y recuperación en contexto largo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (familia Qwen3.6-35B-A3B), con atención lineal, torre de visión y cabeza MTP; pesos cuantizados en EXL3 |
| Parametros totales | 7.528.325.120 según safetensors del repo; la model card describe el modelo base como 35B-A3B (3B activos) |
| Parametros activos | 3B (aproximado, según la denominación 35B-A3B del modelo base) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | EXL3 3.00 bpw en expertos enrutados; 4 bits en atención, atención lineal y expertos compartidos; `lm_head` 6 bits; torre de visión 6 bits; cabeza MTP 4 bits; embeddings de tokens INT4; caché KV INT4 |
| Idiomas soportados | Español (es) e inglés (en) |
| Licencia | Apache-2.0 (heredada del modelo base) |
| Formato de pesos | safetensors EXL3 (`model-00001-of-00002.safetensors`, `model-00002-of-00002.safetensors`, `model.safetensors.index.json`); 14,82 GB de pesos, 31,8 GB de tamaño total del repo |

## Arquitectura y entrenamiento

El modelo base es un transformer de tipo mixture-of-experts de la familia Qwen3.6-35B-A3B, con 35B parámetros totales y aproximadamente 3B activos por token. Incorpora atención lineal, una torre de visión para entrada image-text-to-text y una cabeza MTP (multi-token prediction) que puede usarse como decodificación especulativa. Esta ficha corresponde a una cuantización EXL3 realizada con exllamav3 1.6.5, no a un entrenamiento nuevo: los pesos se comprimen a 3.00 bpw en los expertos enrutados, con precisión mixta en el resto de componentes.

Los datos de calibración de la cuantización incluyen pasos de agente generados por el propio modelo en BF16 sobre los prompts de administración de sistemas del autor, con conversaciones reales de sysadmin en español. No se dispone de información sobre el número de tokens de entrenamiento del modelo base, la composición de su dataset ni si se aplicaron RLHF o DPO; esos datos no están disponibles en la información proporcionada. La innovación técnica destacable es el empaquetado: EXL3 con embeddings INT4 y caché KV INT4 servido mediante vLLM con el plugin `vllm-quantpack`, que permite contexto completo de 262k en 24 GB.

## Capacidades

- Generación de texto conversacional en español e inglés, con contexto de hasta 262.144 tokens.
- Razonamiento agéntico multi-paso orientado a administración de sistemas Linux.
- Tool calling y function calling, con resultados medidos de 28/30 en batería propia y 51/60 con la petición real de opencode.
- Capacidades de visión: entrada image-text-to-text, con torre de visión cuantizada a 6 bits; superó un test de 4 imágenes 15/15 y procesó un prompt de 151k tokens con imagen.
- Decodificación especulativa mediante cabeza MTP (MTP 2), con tasas de aceptación de 0,48 a 0,57.
- Recuperación en contexto largo (needle in a haystack): 9/9 hechos neutrales a 64k, 128k y 255k tokens.
- Soporte multiusuario: pool KV de 1.543.326 tokens con caché INT4 y hasta 16 secuencias concurrentes configuradas.
- Generación de código y tareas de programación: 32/36 en la batería del autor.
- Integración con vLLM como servidor compatible con endpoints.

## Casos de uso

- Agente local de administración de sistemas Linux: el modelo se sirve con vLLM y opencode para ejecutar comandos reales; su contexto de 262k tokens permite mantener el historial completo de una sesión de diagnóstico sin truncar, y sus resultados de 27/32 tareas con 16 agentes concurrentes lo hacen adecuado para un departamento de IT.
- Servidor compartido para varios agentes en una sola GPU: con caché KV INT4 y `--max-num-seqs 16`, una RTX 3090 sostiene cuatro sesiones simultáneas de 236k tokens sin preemption, lo que permite atender a varios desarrolladores o pipelines sobre el mismo hardware.
- Automatización de tool calling en pipelines de CI/CD: la tasa de 51/60 en la petición real de opencode permite integrar el modelo como ejecutor de llamadas a herramientas en flujos de despliegue y validación.
- Análisis de documentación técnica extensa con imágenes: la ventana de 262k y la torre de visión permiten procesar manuales, diagramas de red o capturas de paneles junto con texto largo en una sola petición.
- Asistencia a la programación en producción: con 32/36 en tareas de programación, puede emplearse para generación y revisión de código en entornos donde el coste de GPU es limitado y se prioriza el despliegue en hardware de consumo.
- Recuperación de información en corpus largos: la precisión 9/9 en needle a 64k, 128k y 255k tokens lo hace viable para búsqueda de hechos concretos en expedientes, logs o bases documentales extensas.
- Atención al cliente técnica multi-turno en español: el soporte nativo de español y la ventana larga permiten conversaciones prolongadas con historial completo, aunque requiere la configuración de sampling del autor para evitar bucles.

## Benchmarks y rendimiento

| Prueba | Resultado |
|---|---|
| Divergencia KL frente a BF16 (traza opencode propia) | 0,0152 |
| Divergencia KL frente a BF16 (traza pública de turboderp) | 0,0171 |
| Tool calls, batería propia | 28/30 |
| Tool calls, petición real de opencode (3 casos × 20) | 51/60 |
| Tareas de agente (8/10 × 3) | 24/30 |
| Tareas de programación (11/12, 11/12, 10/12) | 32/36 |
| Agentes concurrentes 4 / 8 / 16 | 8/8, 16/16, 27/32 tareas |
| Needle a 64k / 128k / 255k | 9/9, 9/9, 9/9 |
| Test de visión (4 imágenes) | 15/15 |
| Bucles con sampling del autor a temperatura 0,6 / 0,8 / 1,0 | 3/30, 0/30, 0/30 |
| Bucles sin sampling del autor a temperatura 0,6 / 0,8 / 1,0 | 9/30, 8/30, 2/30 |
| Decode con 1 / 2 / 4 / 8 peticiones (sin MTP) | 94,1 / 106,2 / 242,5 / 344,7 tok/s |
| Decode con MTP 2, un usuario, cerca de 15k | 122,9 tok/s |
| Decode con MTP 2, un usuario, cerca de 261k | 71,8 tok/s |
| Decode sin MTP, cerca de 15k / 261k | 88,6 / 51,8 tok/s |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: 14,82 GB de pesos; en una RTX 3090 de 24 GB quedan 374 MiB libres en el pico con cuatro sesiones de 236k tokens y caché KV INT4.
- GPU recomendadas: RTX 3090 (24 GB, Ampere) es el único entorno probado; no se dispone de datos para A100, H100 u otras GPU.
- No cabe en GPU de 16 GB: los pesos solos ocupan 14,82 GB.
- Despliegue: exclusivamente mediante vLLM 0.34.0 junto con exllamav3 1.6.7 y el plugin `vllm-quantpack` 0.1.6 (0.1.4 con vLLM 0.31.0 y exllamav3 1.6.5 para las pruebas de capacidad). Un `pip install vllm`, Transformers o SGLang estándar no pueden cargar este checkpoint.
- Configuración probada: `--max-model-len 262144`; `--max-num-seqs 16` para uso multiusuario.
- Latencia y throughput: decode de 94,1 tok/s con una petición y 344,7 tok/s con ocho peticiones sin MTP; con MTP 2 y un usuario, 122,9 tok/s cerca de 15k y 71,8 tok/s cerca de 261k. Con cuatro sesiones simultáneas, MTP resulta más lento que sin él.
- Caché KV: INT4 para texto (pool de 1.543.326 tokens) o `k8v4_per_token_head` para visión (825.631 tokens).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Sage-A1.5-35B-A3B-EXL3-3.00bpw (este repo) | 35B-A3B | 262.144 | EXL3 3.00 bpw, KV INT4 | Apache-2.0 | KLD 0,0152 / 0,0171; 27/32 tareas con 16 agentes; tool calls 28/30 |
| Sage-A1.5-35B-A3B-EXL3-3.50bpw (rama del mismo repo) | 35B-A3B | 262.144 | EXL3 3.50 bpw, 16,83 GB | Apache-2.0 | KLD 0,0096 / 0,0108; mejor programación, peores resultados de agente y tool calling según el autor |
| Ornith-1.5-35B-A3B EXL3 3.00 (repo hermano de JRamirez-UAB) | 35B-A3B | no disponible | EXL3 3.00 bpw | no disponible | Misma receta y mismo presupuesto de 24 GB; mejores resultados en agente, programación y herramientas según el autor |
| InternScience/Sage-A1.5 (modelo base) | 35B-A3B | no disponible | BF16 | Apache-2.0 | Referencia de calidad; no cabe en 24 GB |

## Limitaciones y advertencias

- Es una cuantización no oficial y comunitaria: no es un release de los autores de Sage-A1.5.
- Solo se han probado las combinaciones vLLM 0.31.0 + exllamav3 1.6.5 + vllm-quantpack 0.1.4 y vLLM 0.34.0 + exllamav3 1.6.7 + vllm-quantpack 0.1.5/0.1.6; otras pilas no están verificadas.
- Requiere obligatoriamente el sampling del autor, incluido `presence_penalty` 1.5; sin él el modelo entra en bucles en respuestas largas (9/30 a temperatura 0,6 frente a 3/30 con el sampling correcto).
- La cuantización a 3.00 bpw introduce degradación frente a BF16, cuantificada en KLD 0,0152 y 0,0171; dominios o idiomas distintos del caso de uso evaluado pueden degradarse más.
- La evaluación se centra en un agente local de administración de sistemas Linux en español; los resultados en otros dominios no están medidos.
- Idiomas soportados limitados a español e inglés.
- Con cuatro sesiones simultáneas, la decodificación especulativa MTP es más lenta que sin ella; conviene desactivarla en uso multiusuario.
- Riesgo de alucinación inherente al modelo base; no se aportan datos específicos de sesgos conocidos.
- La licencia Apache-2.0 se hereda del modelo base, pero conviene revisar `LICENSE` y `NOTICE` del repositorio antes de uso comercial.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/JRamirez-UAB/Sage-A1.5-35B-A3B-EXL3-3.00bpw-24GB
- Modelo base: https://huggingface.co/InternScience/Sage-A1.5
- Rama 3.50bpw: https://huggingface.co/JRamirez-UAB/Sage-A1.5-35B-A3B-EXL3-3.00bpw-24GB/tree/3.50bpw
- Repo hermano Ornith-1.5-35B-A3B EXL3 3.00: https://huggingface.co/JRamirez-UAB/Ornith-1.5-35B-A3B-EXL3-3.00bpw-24GB
- exllamav3: https://github.com/turboderp-org/exllamav3
- Paper de referencia citado en los tags: arxiv:2406.11235
