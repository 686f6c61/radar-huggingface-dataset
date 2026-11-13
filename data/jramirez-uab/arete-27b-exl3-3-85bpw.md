# JRamirez-UAB/Arete-27B-EXL3-3.85bpw

## Resumen

Arete-27B-EXL3-3.85bpw es una cuantización EXL3 no oficial, publicada por el usuario JRamirez-UAB, del modelo NousResearch/Arete-27B, que a su vez es un fine-tune supervisado de Qwen3.8-27B realizado por Nous Research. El checkpoint cuantiza el backbone a 3,85 bits por peso (3,866 medidos) con exllamav3 1.6.6, mantiene un `lm_head` a 5 bits, la torre de visión a 6 bits, la cabeza MTP a 4 bits y los embeddings en BF16. El objetivo declarado es servir un agente local de administración de sistemas Linux (opencode con tool calling) en castellano dentro de un departamento de TI universitario.

La particularidad técnica principal es que Arete se distribuye sin cabeza MTP (el fine-tune la desactivó) y este repositorio injerta una tomada sin modificar del modelo base Qwen3.8-27B (15 tensores `mtp.*`, cuantizados a 4 bits y no reentrenados sobre Arete), lo que permite a vLLM usar decodificación especulativa MTP. El modelo se sirve con vLLM 0.33.0 a través del plugin vllm-quantpack, ya que EXL3 no es un formato nativo de vLLM.

El checkpoint pesa 15,9 GB (14,78 GiB en memoria de GPU), declara 7.946.737.024 parámetros en safetensors y soporta entrada image-text-to-text. La licencia es Apache-2.0, heredada de NousResearch/Arete-27B y Qwen3.8-27B, y el autor advierte explícitamente de que no es un lanzamiento oficial de Nous Research ni de Alibaba Cloud.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base Qwen3.8-27B) con torre de visión y cabeza MTP injertada; cuantización EXL3 |
| Parametros totales | 7.946.737.024 (según safetensors del repo) |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | 262.144 tokens nativos; validados 65.536 tokens |
| Tipos de cuantizacion | EXL3 a 3,85 bpw (3,866 medidos); lm_head 5 bits, torre de visión 6 bits, cabeza MTP 4 bits, embeddings en BF16 |
| Idiomas soportados | es, en |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (EXL3, dos shards con índice) |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer denso derivado de Qwen3.8-27B, fine-tuneado de forma supervisada por Nous Research (Arete-27B) y posteriormente cuantizado por la comunidad. La cuantización emplea exllamav3 1.6.6 con una receta mixta: backbone a 3,85 bits, `lm_head` a 5 bits, torre de visión a 6 bits, cabeza MTP a 4 bits y embeddings conservados en BF16. El conjunto de calibración combina el set estándar de exllamav3 con sesiones reales de agente sysadmin en castellano y pasos de agente generados por el propio modelo.

La innovación destacable es el injerto de la cabeza MTP (15 tensores `mtp.*`, `mtp_num_hidden_layers: 1`) tomada sin cambios del modelo base Qwen3.8-27B, no reentrenada sobre Arete, para habilitar decodificación especulativa en vLLM. La torre de visión es la propia de Arete, congelada por Nous durante el fine-tune. El autor reporta una longitud media de aceptación MTP de 2,93 a 3,45 tokens por paso con 3 tokens especulativos. No se detallan en la información disponible el número de tokens de entrenamiento ni la composición completa del dataset del fine-tune original.

## Capacidades

- Generación de texto conversacional en castellano e inglés.
- Razonamiento multi-paso con modo de razonamiento configurable (`xhigh` en las pruebas del autor).
- Tool calling y function calling, validado con la petición real de opencode (60/60 llamadas válidas y correctas).
- Capacidades de agente para administración de sistemas Linux: ejecución de comandos, interpretación de salidas de terminal.
- Visión image-text-to-text: capturas de terminal, gráficos, salidas de stress-test y capturas de procesos/puertos (15/15 comprobaciones).
- Turnos de seguimiento sobre imágenes en caché.
- Decodificación especulativa MTP para acelerar la generación.
- Soporte de contexto largo (validado a 65.536 tokens con caché KV fp8 y 4 secuencias concurrentes).

## Casos de uso

- Agente local de administración de sistemas Linux: el modelo se integra en opencode con tool calling para ejecutar comandos, diagnosticar servicios y revisar configuraciones; su ventana validada de 65.536 tokens permite mantener sesiones largas de troubleshooting con historial completo.
- Atención a operadores de TI en castellano: gestiona conversaciones multi-turno con contexto largo y responde en español, adecuado para un departamento universitario que trabaja en ese idioma.
- Análisis de capturas de terminal y gráficos: la torre de visión permite adjuntar una captura de pantalla de un fallo, un gráfico de monitorización o una salida de stress-test y pedir un diagnóstico o una explicación.
- Automatización de tareas de mantenimiento: con tool calling puede encadenar pasos (listar procesos, comprobar puertos, revisar logs) dentro de un pipeline de agente con razonamiento multi-paso.
- Asistente de documentación técnica interna: genera y resume procedimientos de administración a partir de contexto largo de logs y configuraciones.
- Despliegue en hardware de gama profesional: con 14,78 GiB de pesos en GPU y cuantización de 3,85 bpw, encaja en una A40 de 48 GB sirviendo 4 secuencias concurrentes con caché KV fp8, lo que permite montar un servicio interno sin clúster dedicado.
- Evaluación y prototipado de cuantizaciones: la receta reproducible (KLD frente a BF16 sobre trazas públicas) sirve para comparar el impacto de la cuantización antes de adoptarla en producción.

## Benchmarks y rendimiento

| Metrica | Resultado | Referencia |
|---|---|---|
| KLD vs BF16 (traza pública de turboderp) | 0,01069 (mediana 0,00042, p90 0,03216) | — |
| KLD vs BF16 (traza opencode) | 0,00945 | — |
| KLD vs BF16 (traza sysadmin propia) | 0,01294 | — |
| Perplejidad (pública) | 1,4461 | 1,4322 en BF16 |
| Perplejidad (opencode) | 2,7462 | 2,7317 en BF16 |
| Perplejidad (propia) | 1,7081 | 1,6852 en BF16 |
| Tool calls con petición real de opencode | 60/60 válidas, 60/60 correctas | 3 casos × 20 intentos, `xhigh`, 4 peticiones concurrentes |
| Visión | 15/15 comprobaciones en 4 tareas de imagen | — |
| Aceptación MTP | longitud media 2,93 / 3,07 / 3,45 tokens por paso con 3 tokens especulativos | aceptación por posición 0,82/0,63/0,48 hasta 0,88/0,81/0,76 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: 14,78 GiB solo para pesos; con caché KV fp8 y 4 secuencias el autor asigna `--kv-cache-memory-bytes 12000000000` (12 GB) en una A40 de 48 GB.
- GPU validadas: NVIDIA A40 (48 GB, Ampere, sm86) para todas las pruebas de serving; RTX PRO 6000 Server Edition (96 GB, Blackwell) solo para las ejecuciones de KLD.
- GPU de 24 GB: no medida. Los pesos (14,78 GiB) deberían caber, pero el autor no lo ha ejecutado.
- GPU de 96 GB: no medida para serving (solo KLD).
- Despliegue: vLLM 0.33.0 con el plugin vllm-quantpack 0.1.5, torch 2.14.0+cu132, exllamav3 1.6.6 y FlashInfer 0.7.2.post1. EXL3 no es un formato nativo de vLLM; es necesario instalar desde las instrucciones de la model card.
- Contexto y concurrencia validados: sesiones de 65.536 tokens con caché KV fp8 y 4 secuencias concurrentes sin preempción registrada en el log del servidor.
- Latencia y throughput: no disponibles más allá de las métricas de aceptación MTP.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Arete-27B-EXL3-3.85bpw (este) | 7.946.737.024 (safetensors) | 262.144 nativos / 65.536 validados | EXL3 3,85 bpw | Apache-2.0 | Hugging Face, serving con vLLM + vllm-quantpack |
| NousResearch/Arete-27B | no disponible en la informacion | no disponible en la informacion (la card de Arete indica entrenamiento a 64k) | BF16 | Apache-2.0 | Hugging Face |
| Qwen3.8-27B | no disponible en la informacion | no disponible en la informacion | BF16 | Apache-2.0 (según herencia declarada) | Hugging Face |

No se dispone de datos de rendimiento comparables de los modelos alternativos en la información proporcionada.

## Limitaciones y advertencias

- Cuantización no oficial: no es un lanzamiento de Nous Research, Alibaba Cloud ni el equipo Qwen; el soporte y la validación corren a cargo del autor comunitario.
- Solo se ha probado un stack concreto (vLLM 0.33.0, torch 2.14.0+cu132, exllamav3 1.6.6, vllm-quantpack 0.1.5, FlashInfer 0.7.2.post1) y una GPU (A40). Otros entornos pueden fallar.
- EXL3 no es nativo en vLLM: requiere el plugin vllm-quantpack y seguir la instalación de la model card, no fragmentos genéricos.
- Contexto: aunque el modelo declara 262.144 tokens nativos, solo se han validado 65.536; usos por encima de ese límite no están comprobados.
- La cabeza MTP se toma sin reentrenar del modelo base Qwen3.8-27B, no de Arete; su comportamiento en dominios distintos al evaluado no está garantizado.
- Los números de calidad (KLD, tool calls, visión) se midieron en un caso de uso concreto (agente sysadmin en castellano) y en trazas específicas; pueden diferir en otros dominios o idiomas.
- Riesgo de alucinación y sesgos: no se documentan evaluaciones específicas de sesgo ni de tasa de alucinación en la información disponible.
- Idiomas: solo se declaran es y en; el rendimiento en otros idiomas no está evaluado.
- Licencia Apache-2.0 heredada, con archivos LICENSE y NOTICE en el repositorio; conviene revisarlos antes de uso comercial.
- Sin métricas medidas en GPU de 24 GB: el despliegue en consumer GPU de esa VRAM es teóricamente posible pero no verificado.

## Enlaces

- Hugging Face: https://huggingface.co/JRamirez-UAB/Arete-27B-EXL3-3.85bpw
- Modelo base: https://huggingface.co/NousResearch/Arete-27B
- exllamav3: https://github.com/turboderp-org/exllamav3
- vllm-quantpack (PyPI): https://pypi.org/project/vllm-quantpack/
- Paper referenciado en los tags (arXiv:2406.11235): https://arxiv.org/abs/2406.11235
