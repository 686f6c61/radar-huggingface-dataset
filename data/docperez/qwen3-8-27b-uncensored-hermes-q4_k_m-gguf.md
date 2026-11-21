# DocPerez/Qwen3.8-27B-Uncensored-hermes-Q4_K_M-GGUF

## Resumen

Qwen3.8-27B-Uncensored-hermes-Q4_K_M es una cuantización GGUF de 4 bits del modelo Qwen3.8-27B en su variante abliterada (sin mecanismos de rechazo), fusionada con el adaptador LoRA de refinamiento agéntico desarrollado por harness-hub. El resultado es un modelo de 27.320.697.856 parámetros (27,3 mil millones) que combina el comportamiento libre de rechazos del modelo base abliterado con la disciplina operativa del adaptador Hermes: menos desvíos, menos llamadas a herramientas y una reducción drástica de tokens generados por tarea. Lo publica el usuario DocPerez en Hugging Face bajo licencia Apache-2.0.

La relevancia de esta ficha reside en que documenta un caso de fusión LoRA sobre pesos abliterados y su posterior cuantización a Q4_K_M, un flujo de trabajo cada vez más común para desplegar modelos de razonamiento y uso agéntico en hardware de consumo. El autor advierte explícitamente de que la combinación concreta no ha sido evaluada con benchmarks y de que la cuantización a 4 bits diluye parte del delta del adaptador, cuyo RMS es de aproximadamente el 0,15-0,25 % del peso.

El modelo conserva capacidad de visión mediante un proyector multimodal independiente (`mmproj` en F16) que no fue alterado ni por la abliteración ni por el LoRA. Soporta tool calling, uso agéntico y contexto largo (131k tokens como valor por defecto sensato, 262k como máximo práctico). Está pensado para inferencia local con llama.cpp, LM Studio u otros runners compatibles con GGUF.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida SSM/atención (stack de Qwen3.8-27B: 16 capas de atención y 48 bloques SSM de atención lineal, más cabeza MTP en la capa 64) |
| Parámetros totales | 27.320.697.856 (27,3 B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 131.072 tokens (recomendado); hasta 262.144 con mayor coste de prefill y memoria |
| Tipos de cuantización | Q4_K_M (esta publicación); el autor menciona que Q6_K y Q8_0 serían más fieles al modelo fusionado |
| Idiomas soportados | Inglés (en), chino (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); proyector de visión en GGUF F16 |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea una arquitectura híbrida que combina 16 capas de atención estándar con 48 bloques de atención lineal (SSM) y una cabeza MTP (multi-token prediction) en la capa 64. Sobre esta base se aplicó primero una abliteración (eliminación de direcciones de rechazo en el flujo residual) que dio lugar a orcarouter/Qwen3.8-27B-Uncensored. Posteriormente se fusionó el adaptador PEFT LoRA de harness-hub, con rango r=32, α=64 y escala 2,0, que actúa sobre las proyecciones `q/k/v/o_proj` y `gate/up/down_proj`. Estos módulos existen en las 16 capas de atención y en las 64 capas FFN principales; los 48 bloques SSM no exponen módulos con esos nombres y la cabeza MTP queda fuera del adaptador, por lo que ninguno de los dos fue modificado.

El proceso de fusión se realizó en tres pasos: conversión del adaptador a GGUF F16, fusión sobre una copia Q8_0 del modelo abliterado (en lugar de sobre Q4, para no enterrar el delta del LoRA bajo el ruido de cuantización) y cuantización final a Q4_K_M con `llama-quantize`. El adaptador está entrenado para uso con el modo de razonamiento desactivado; según la model card, activar el thinking aporta mejoras dentro del ruido estadístico y multiplica por tres el coste en tokens. No se dispone de información sobre el volumen o la composición del dataset de entrenamiento del adaptador ni sobre el proceso de RLHF/DPO empleado.

## Capacidades

- Generación de texto y razonamiento conversacional multi-turno.
- Generación y comprensión de código, con respuestas coherentes verificadas en pruebas básicas por el autor.
- Tool calling y function calling, reforzado por el adaptador Hermes.
- Comportamiento agéntico: ejecución de tareas multi-paso con reducción de llamadas a herramientas y de tokens generados por tarea.
- Capacidad de visión (image-text-to-text) mediante el proyector `mmproj` en F16, heredada del modelo base.
- Soporte multilingüe limitado a inglés y chino.
- Modo thinking desactivable; el autor recomienda desactivarlo por coste y latencia.
- Comportamiento sin rechazos (uncensored) heredado de los pesos abliterados.

## Casos de uso

- Automatización de agentes de código en local: el modelo puede integrarse en flujos tipo Hermes Agent para resolver tareas de terminal y edición de ficheros, con menos llamadas a herramientas y menos tokens por tarea gracias al adaptador fusionado.
- Asistente de programación en el escritorio: con Q4_K_M (16,0 GiB) y 131k de contexto, cabe en equipos con 48 GB de memoria unificada y permite mantener conversaciones largas sobre un repositorio completo.
- Procesamiento de documentos con imágenes: la capacidad de visión permite extraer información de capturas, diagramas o PDFs renderizados, combinándola con razonamiento textual en la misma sesión.
- Investigación sobre alineación y seguridad: al carecer de mecanismos de rechazo, sirve para estudiar el comportamiento de modelos abliterados en escenarios controlados y comparar con la variante stock.
- Despliegue en entornos sin conectividad: al ejecutarse con llama.cpp en hardware local, es adecuado para escenarios con requisitos de privacidad donde no se puede enviar datos a APIs externas.
- Experimentación con fusión de adaptadores: el flujo documentado (LoRA sobre Q8_0, cuantización posterior) sirve como referencia reproducible para investigadores que quieran replicar o adaptar la técnica.
- Generación de código en pipelines de CI/CD con tool calling: el modelo puede invocar funciones de build, test o despliegue dentro de un agente, aunque requiere validación adicional por la falta de benchmarks de esta combinación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible para esta combinación concreta. El autor indica que los números publicados del adaptador (SWE-bench Pro 43,1 % y Terminal-Bench 2.1 58,8 % con thinking desactivado) se midieron sobre el modelo base stock, no abliterado, en BF16 y con 131k de contexto, y que la transferencia a esta fusión abliterada y cuantizada a Q4_K_M sería parcial y no ha sido medida.

| Benchmark | Este modelo | Base stock + adaptador (referencia del autor) |
|---|---|---|
| SWE-bench Pro | No disponible | 43,1 % |
| Terminal-Bench 2.1 (thinking off) | No disponible | 58,8 % |

## Requisitos de hardware

- VRAM/memoria estimada: el fichero Q4_K_M ocupa 16,0 GiB y el proyector de visión 0,93 GiB; con caché KV en q8_0 y 131k de contexto, el autor sitúa el objetivo en torno a 48 GB de memoria unificada.
- GPU recomendadas: no especificadas por el autor; por tamaño, una RTX 4090 (24 GB) no permite cargar el modelo completo en VRAM con contexto largo, mientras que A100 80 GB, H100 o configuraciones multi-GPU sí.
- GPU de consumo: cabe en equipos Apple Silicon con 48 GB o más de memoria unificada; en GPUs de consumo de 24 GB requeriría offloading parcial a RAM del sistema.
- Opciones de despliegue: llama.cpp (`llama-server` con `--flash-attn on`, `--cache-type-k q8_0`, `--cache-type-v q8_0`, `--reasoning off`) y LM Studio (cargando el fichero Q4_K_M y adjuntando el `mmproj`, con thinking desactivado).
- Latencia y throughput: no disponibles; el autor solo señala que mantener el thinking activado es el mayor coste de latencia por respuesta (aproximadamente 3× tokens).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| DocPerez/Qwen3.8-27B-Uncensored-hermes-Q4_K_M | 27,3 B | 131k (hasta 262k) | Apache-2.0 | GGUF Q4_K_M | Fusión LoRA + abliteración, visión, tool calling |
| orcarouter/Qwen3.8-27B-Uncensored | 27,3 B | No disponible en la información | Apache-2.0 | No disponible | Base abliterada sin adaptador Hermes |
| harness-hub/Qwen3.8-27B-hermes-adapted | 27,3 B | No disponible en la información | Apache-2.0 | No disponible | Adaptador LoRA sobre base stock, sin abliterar |
| Qwen/Qwen3.8-27B | 27,3 B | No disponible en la información | Apache-2.0 | No disponible | Modelo upstream con alineación estándar |

## Limitaciones y advertencias

- Ausencia total de tuning de seguridad: los pesos abliterados no restauran rechazos, por lo que el modelo puede generar contenido dañino, ilegal o sesgado sin filtro. La responsabilidad de uso recae en el operador.
- No evaluado con benchmarks: el autor solo realizó pruebas de humo (carga, respuestas coherentes, ausencia de tokens de razonamiento con `--reasoning off`, verificación numérica del delta de fusión).
- Transferencia parcial de las ganancias del adaptador: la abliteración modifica los mismos componentes del flujo residual contra los que se entrenó el LoRA, por lo que los resultados de SWE-bench Pro y Terminal-Bench no son extrapolables.
- Dilución por cuantización: el delta del LoRA (≈0,15-0,25 % RMS) queda cerca del ruido de cuantización a 4 bits; una build Q6_K o Q8_0 sería más fiel si hay memoria disponible.
- Contexto largo: por encima de 131k el coste de prefill y la presión de memoria crecen de forma pronunciada y la atención se diluye.
- Idiomas: solo inglés y chino; no hay soporte declarado de castellano.
- Riesgo de alucinación: no cuantificado en la información disponible, pero inherente a modelos de este tamaño sin evaluación específica.
- Modo thinking: activarlo multiplica por tres los tokens con ganancias dentro del ruido, según el autor.

## Enlaces

- [Hugging Face: DocPerez/Qwen3.8-27B-Uncensored-hermes-Q4_K_M-GGUF](https://huggingface.co/DocPerez/Qwen3.8-27B-Uncensored-hermes-Q4_K_M-GGUF)
- [Modelo base abliterado: orcarouter/Qwen3.8-27B-Uncensored](https://huggingface.co/orcarouter/Qwen3.8-27B-Uncensored)
- [Adaptador: harness-hub/Qwen3.8-27B-hermes-adapted](https://huggingface.co/harness-hub/Qwen3.8-27B-hermes-adapted)
- [Fuente de fusión Q8_0: bartowski/orcarouter_Qwen3.8-27B-Uncensored-GGUF](https://huggingface.co/bartowski/orcarouter_Qwen3.8-27B-Uncensored-GGUF)
- [Modelo upstream: Qwen/Qwen3.8-27B](https://huggingface.co/Qwen/Qwen3.8-27B)
