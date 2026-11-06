# JRamirez-UAB/Nemotron-3.5-Lightning-30B-A3B-EXL3-3.25bpw-24GB

## Resumen

Nemotron-3.5-Lightning-30B-A3B-EXL3-3.25bpw-24GB es una cuantización comunitaria no oficial del modelo NVIDIA Nemotron-3.5-Lightning-30B-A3B-BF16, publicada por el usuario JRamirez-UAB. El modelo base es un MoE híbrido Mamba-Transformer de NVIDIA con 31,6 mil millones de parámetros totales y aproximadamente 3 mil millones activos, del que solo 6 de sus 52 capas son de atención. Esta versión comprime los pesos a 3,25 bits por peso (bpw) con exllamav3 para que el modelo completo quepa en una única GPU de 24 GB, en concreto una RTX 3090.

La ficha del autor está orientada a un caso de uso muy concreto: un agente local de administración de sistemas Linux en castellano, integrado con opencode y con soporte de tool calling. La cuantización mantiene una ventana de contexto de 262.144 tokens y, gracias al reducido número de capas de atención, permite una caché KV en fp8 de 2,63 millones de tokens en una sola tarjeta. El repositorio incluye pesos EXL3, configuración de cuantización, tokenizer, plantilla de chat y sumas SHA-256 para reproducibilidad.

Es relevante porque demuestra que un MoE de 31,6 B con contexto largo puede servirse en hardware consumer de gama alta (Ampere, 24 GB) con vLLM, aunque con requisitos de instalación específicos (exllamav3 y el plugin vllm-quantpack) y con debilidades documentadas en tool calls y recuperación en contexto largo. No es un lanzamiento oficial de NVIDIA y su licencia es OpenMDW-1.1, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida Mamba-Transformer MoE (52 capas, solo 6 de atención) |
| Parametros totales | 31,6 B (modelo base); 7.343.515.840 parámetros reportados en safetensors del repo cuantizado |
| Parametros activos | Aproximadamente 3 B (MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | EXL3 a 3,25 bpw en el cuerpo, lm_head de 6 bits, cabeza MTP de 4 bits, embeddings en BF16 |
| Idiomas soportados | Español (es) e inglés (en) |
| Licencia | OpenMDW-1.1 (heredada del modelo base; no es lanzamiento oficial de NVIDIA) |
| Formato de pesos | safetensors (EXL3), dos shards de 14,69 GB en total |

## Arquitectura y entrenamiento

El modelo base es un MoE híbrido que combina capas Mamba con capas de atención Transformer: de las 52 capas totales, únicamente 6 son de atención. Esta proporción reduce drásticamente el coste de la caché KV y permite sostener contextos muy largos con poca memoria adicional. El modelo tiene 31,6 B de parámetros totales con unos 3 B activos por token, lo que abarata la inferencia respecto a un denso del mismo tamaño. La cuantización EXL3 se generó con exllamav3 1.6.5 y los datos de calibración incluyen trazas de agente de administración de sistemas en español generadas por el propio modelo BF16.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base dentro de la información proporcionada. La model card menciona que el modelo base incluye documentos adicionales sobre sesgos, explicabilidad, privacidad y seguridad en su página de Hugging Face, pero no reproduce su contenido. La innovación técnica destacable de esta versión es la cuantización a 3,25 bpw con cabeza MTP de 4 bits y embeddings en BF16, junto con el soporte de caché KV en fp8 que permite una reserva de 2.628.824 tokens en una RTX 3090.

## Capacidades

- Generación de texto conversacional en español e inglés.
- Razonamiento y ejecución de tareas de agente en varios pasos (multi-step reasoning).
- Tool calling y function calling, orientado a opencode y a flujos de administración de sistemas.
- Tareas de programación y scripting, con resultados medidos en el conjunto de pruebas del autor (32/36 en tareas de programación sobre A40).
- Contexto largo de hasta 262.144 tokens, con recuperación de información medida mediante pruebas needle.
- Respuestas largas en español sin bucles a temperaturas de 0,6, 0,8 y 1,0 (0/30 casos con bucles).
- Compatibilidad con endpoints y despliegue mediante vLLM con el plugin vllm-quantpack.
- No dispone de capacidades de visión: el modelo base es solo texto.

## Casos de uso

- Agente local de administración de sistemas Linux: el modelo puede gestionar conversaciones multi-turno con tool calling para ejecutar comandos, interpretar salidas y encadenar pasos, aprovechando sus 262.144 tokens de contexto y su caché KV de 2,63 M tokens en una RTX 3090.
- Asistencia en terminal integrada con opencode: se usa como backend de un agente de codificación y shell, con una tasa medida de 60/60 tool calls válidos y 57/60 correctos en la batería del autor.
- Automatización de tareas de TI en un departamento universitario: el modelo está calibrado y evaluado con trazas reales de sysadmin en español, lo que lo hace adecuado para soporte interno de operaciones.
- Análisis de documentos largos y logs extensos: la ventana de 262k tokens permite cargar ficheros de configuración, trazas y documentación técnica en una sola sesión, aunque la recuperación needle cae a 3/9 a 255k tokens.
- Generación y revisión de scripts de shell y automatizaciones: las pruebas de programación sobre A40 reportan 32/36, útil para proponer comandos y parchear scripts en entornos controlados.
- Despliegue en hardware consumer para laboratorios y equipos pequeños: al caber en 24 GB, permite servir un MoE de 31,6 B con contexto largo sin GPU de datacenter, usando vLLM con fp8 KV cache.
- Prototipado de agentes conversacionales bilingües español-inglés en local: el soporte de ambos idiomas y la plantilla de chat del modelo base facilitan iterar sin depender de APIs externas.

## Benchmarks y rendimiento

| Prueba | Resultado | Condiciones |
|---|---|---|
| KLD media vs BF16 (traza opencode propia) | 0,1055 | 24 conversaciones, exllamav3 qbench |
| KLD mediana vs BF16 (traza opencode propia) | 0,0346 | 24 conversaciones |
| KLD p90 vs BF16 (traza opencode propia) | 0,2597 | 24 conversaciones |
| Perplejidad BF16 en traza propia | 4,7637 | Referencia BF16 |
| KLD media vs BF16 (traza pública de turboderp) | 0,0938 | Traza pública |
| Tool calls con petición real de opencode | 60/60 válidos, 57/60 correctos | 3 casos × 20 |
| Batería de tool calls | 19/30 correctos (20 válidos) | Batería del autor |
| Tareas de agente | 22/30 (7/10, 8/10, 7/10) | Comparado con 21/30 del BF16 |
| Tareas de programación | 32/36 | NVIDIA A40 |
| Needle a 64k / 128k / 255k | 9/9, 8/9, 3/9 | 9 hechos neutros, A40 |
| Bucles en respuestas largas en español | 0/30 | Temperaturas 0,6, 0,8 y 1,0 |
| Prefill a 64k / 128k / 192k / 258k | 5.651 / 4.930 / 4.279 / 3.781 tok/s | A40 |
| Capacidad KV en RTX 3090 | 2.628.824 tokens | fp8 KV, contexto completo 262.144 |
| Memoria libre en pico | 368 MiB | RTX 3090 24 GB |

## Requisitos de hardware

- VRAM estimada: los pesos ocupan 14,69 GB; con caché KV en fp8 y contexto completo de 262.144 tokens cabe en una RTX 3090 de 24 GB con 368 MiB libres en el pico medido.
- GPU recomendadas: RTX 3090 (24 GB, Ampere) es el objetivo declarado y probado; NVIDIA A40 se usó para las pruebas de KLD, needle y programación.
- Cabe en GPU consumer: sí, en RTX 3090 de 24 GB. El autor no ha probado el build en GPUs de 16 GB (los pesos solos son 14,69 GB).
- Opciones de despliegue: vLLM 0.31.0 junto con exllamav3 1.6.5 y el plugin vllm-quantpack 0.1.4. No es cargable con un `pip install vllm` genérico, ni con Transformers ni con SGLang.
- Latencia y throughput: prefill medido en A40 de 5.651 tok/s a 64k, 4.930 tok/s a 128k, 4.279 tok/s a 192k y 3.781 tok/s a 258k. No se reportan cifras de decodificación por token.
- Configuración de referencia: `--max-model-len 262144` y `--kv-cache-dtype fp8_e4m3`, límite de potencia de 350 W, driver 595.84.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este repo (Nemotron-3.5-Lightning-30B-A3B EXL3 3.25 bpw) | 31,6 B totales, ~3 B activos | 262.144 | EXL3 3,25 bpw, KV fp8 | OpenMDW-1.1 | Hugging Face, requiere vLLM + exllamav3 + vllm-quantpack |
| Ornith-1.5-35B-A3B EXL3 3.00 bpw | 35 B (A3B) | 262.144 | EXL3 3,00 bpw, KV int4 | no disponible en la información | Hugging Face (JRamirez-UAB), 6 × 236k sesiones medidas |
| Nemotron-3.5-Lightning-30B-A3B-BF16 | 31,6 B totales, ~3 B activos | 262.144 | BF16 | OpenMDW-1.1 | Hugging Face (nvidia), referencia oficial |

Según las pruebas del propio autor, Ornith-1.5-35B-A3B EXL3 3.00 ofrece mejores resultados en tool calls, tareas de agente y recuperación en contexto largo, mientras que este modelo destaca en velocidad de prefill y tamaño de la reserva KV en una sola tarjeta. El BF16 de NVIDIA es la referencia de calidad, pero no cabe en 24 GB.

## Limitaciones y advertencias

- No es un lanzamiento oficial de NVIDIA: es una cuantización comunitaria no verificada por el fabricante.
- Debilidades documentadas por el autor en tool calls y en recuperación de información en contexto largo; el needle cae a 3/9 a 255k tokens.
- La instalación es frágil: requiere vLLM 0.31.0, exllamav3 1.6.5 y vllm-quantpack 0.1.4; no funciona con instalaciones estándar de vLLM, Transformers o SGLang.
- Solo se ha probado en una RTX 3090 de 24 GB y en una A40; no hay validación en otras GPU ni en GPUs de 16 GB.
- El modelo base es solo texto: no tiene visión ni audio.
- Idiomas soportados limitados a español e inglés; el rendimiento en otros idiomas no está evaluado.
- La evaluación está sesgada hacia un caso de uso concreto (agente sysadmin en español con opencode); los números en otros dominios o idiomas pueden diferir.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se reportan evaluaciones específicas de sesgo en esta ficha, aunque el modelo base incluye documentos de sesgo y seguridad en su página.
- Licencia OpenMDW-1.1: es necesario revisar sus términos para uso comercial; el archivo LICENSE se incluye en el repositorio.
- Los datos de calibración son internos y no se publican, lo que limita la reproducibilidad completa de la cuantización.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/JRamirez-UAB/Nemotron-3.5-Lightning-30B-A3B-EXL3-3.25bpw-24GB
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16
- Repositorio exllamav3: https://github.com/turboderp-org/exllamav3
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
- Modelo comparable Ornith-1.5-35B-A3B EXL3 3.00: https://huggingface.co/JRamirez-UAB/Ornith-1.5-35B-A3B-EXL3-3.00bpw-24GB
