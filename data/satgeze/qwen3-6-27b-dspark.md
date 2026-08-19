# satgeze/Qwen3.6-27B-DSpark

## Resumen

Qwen3.6-27B-DSpark es una cabeza de borrador (drafter) especializada en decodificación especulativa para el modelo de lenguaje Qwen3.6-27B. Desarrollado por el autor satgeze, este drafter de 4.400 millones de parámetros se entrena con el framework DeepSpec de DeepSeek AI en modo online, calentado desde la cabeza DFlash de z-lab para el mismo target. Su función es generar borradores de 15 tokens que el modelo principal verifica, acelerando la decodificación entre 1.6 y 2.7 veces sin ninguna pérdida de calidad, ya que la decodificación especulativa es lossless: cada token aceptado es validado por el target.

La relevancia de este modelo radica en que permite ejecutar Qwen3.6-27B a velocidades prácticas en hardware de gama alta y media: en una RTX Pro 6000 Blackwell alcanza 129-136 tokens por segundo frente a los 51 t/s del baseline, y en un MacBook M3 Max mejora de 12.3 a 17 t/s. Está disponible en formato safetensors (DeepSpec-format) y GGUF, con licencia Apache-2.0, y se sirve tanto con llama.cpp como con vLLM. Su arquitectura es un transformer pequeño con RoPE de dimensión completa, entrenado específicamente para predecir las respuestas del target Qwen3.6-27B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3DSparkModel (transformer drafter, DeepSpec-format) |
| Parametros totales | 4.400.155.137 (4,4 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no especificada (probado con 8192 tokens en llama.cpp) |
| Tipos de cuantizacion | GGUF Q8_0, Q4_K_M (medidos); safetensors bf16 |
| Idiomas soportados | no disponibles (hereda los del target Qwen3.6-27B) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (DeepSpec-format) y GGUF |

## Arquitectura y entrenamiento

El drafter es un transformer de 4,4 B parámetros con atención completa y RoPE de dimensión total (`partial_rotary_factor: 1.0`), corregido en la configuración exportada tras un fallo inicial que heredaba el `partial_rotary_factor: 0.25` del target y colapsaba la aceptación en vLLM al 1 %. Se entrena con DeepSpec en modo online: el drafter aprende a predecir los tokens que el propio Qwen3.6-27B genera ante sus respuestas regeneradas, lo que alinea la distribución del borrador con la del target. El calentamiento parte de la cabeza DFlash de z-lab para este mismo modelo base, y el tamaño de bloque de borrador es de 15 tokens, configurado explícitamente en la inferencia con `--spec-draft-n-max 15`; el valor por defecto de llama.cpp (3 tokens) desperdicia la mayor parte de la aceleración. La aceptación medida es de 0,29-0,31 en sondas greedy estrechas (código y conteo) y de 0,19-0,20 en el conjunto variado de SPEED-Bench, con una longitud media aceptada de 5,35-5,53 tokens por bloque.

## Capacidades

- Decodificación especulativa lossless: acelera la generación de Qwen3.6-27B sin alterar la distribución de salida, ya que cada token aceptado es verificado por el target.
- Aceleración de decode de 1,96-2,67× en CUDA (RTX Pro 6000 Blackwell) y 1,39× en Metal (M3 Max), medida con completions de 200-1024 tokens en modo greedy.
- Compatibilidad con llama.cpp mediante el flag `--spec-type draft-dspark` y con vLLM desde la versión 0.25 (soporte DeepSpec-format y speculators-format).
- Aceptación de borrador independiente del backend: los resultados en CUDA y Metal coinciden hasta el tercer decimal con GGUFs idénticos.
- No genera texto por sí mismo: requiere el target Qwen3.6-27B cargado junto al drafter en el servidor de inferencia.
- Corrección de configuración RoPE aplicada el 2026-07-31: los primeros descargadores que usaban vLLM necesitan actualizar el `config.json` para recuperar la aceptación completa.

## Casos de uso

- Servir Qwen3.6-27B en una GPU de 32 GB o más: con el drafter en Q8_0 y el target en Q8_0, un servidor llama.cpp alcanza 130 t/s en una RTX Pro 6000, duplicando el throughput del baseline sin cambiar la calidad de las respuestas.
- Reducir la latencia en aplicaciones interactivas de chat y agentes: al pasar de 51 a 129 t/s, la espera por respuesta en conversaciones multi-turno baja de forma perceptible, lo que mejora la experiencia en asistentes desplegados con OpenAI-compatible API.
- Inferencia local en Apple Silicon: en un M3 Max con 128 GB, el drafter sube la velocidad de 12,3 a 17,1 t/s, lo que hace viable ejecutar Qwen3.6-27B en un portátil para desarrollo y pruebas sin depender de la nube.
- Despliegue en producción con vLLM: con vLLM 0.25 o superior, el drafter se integra como checkpoint `speculators-format` y ofrece una longitud media aceptada de 4,00 tokens en completions de código de 300 tokens, con aceptación por posición de 0,79 / 0,64 / 0,43 / 0,30 en los primeros puestos del bloque.
- Procesamiento batch de generación de código y documentación: el aumento de throughput permite completar colas de tareas de generación (comentarios, tests, resúmenes) en menos tiempo con el mismo hardware.
- Evaluación y comparación de cabezas de borrador: los datos de aceptación publicados (0,29-0,31 en sondas greedy, 0,19-0,20 en SPEED-Bench) sirven como referencia para medir otros drafters del mismo target, siempre que se usen las mismas sondas.

## Benchmarks y rendimiento

Resultados medidos por el autor con llama.cpp en RTX Pro 6000 Blackwell (target Qwen3.6-27B-Q8_0, greedy, completions de 200 tokens):

| Metrica | Valor |
|---|---|
| Aceptacion de borrador (prompt de codigo) | 0,292 |
| Aceptacion de borrador (conteo) | 0,305 |
| Longitud media aceptada | 5,35-5,53 (bloque de 15) |
| Baseline de decode del target | 51,0 t/s |
| Con DSpark | 129,5-136,1 t/s (2,54-2,67×) |

SPEED-Bench (conjunto cualitativo, codigo y escritura, temperatura 0, concurrencia 1):

| Longitud de salida | Codigo | Escritura | Baseline | Speedup |
|---|---|---|---|---|
| 256 | 99,7 t/s | 97,8 t/s | 50,9 / 50,8 t/s | 1,96× / 1,93× |
| 1024 | 112,1 t/s | 81,0 t/s | 50,7 / 50,6 t/s | 2,21× / 1,60× |

Apple Silicon (M3 Max 128 GB, Metal, mismos GGUFs):

| Metrica | Valor |
|---|---|
| Aceptacion de borrador (codigo) | 0,2922 (161/551, identico a CUDA) |
| Aceptacion de borrador (conteo) | 0,2945 |
| Baseline de decode del target | 12,3-12,4 t/s |
| Con DSpark | 17,1-17,3 t/s (1,39×) |

Aceptacion agregada en SPEED-Bench (prompts variados reales): 0,19-0,20.

## Requisitos de hardware

- VRAM estimada para inferencia: el drafter en Q8_0 ocupa aproximadamente 4,5-5 GB; el target Qwen3.6-27B en Q8_0 unos 27 GB. El conjunto completo en Q8_0 requiere unos 32-35 GB de VRAM. Con el target en Q4_K_M, el total baja a unos 20-22 GB.
- GPU recomendadas: RTX Pro 6000 Blackwell (probada, 129-136 t/s), cualquier GPU con 32 GB o más para Q8_0 (A100 40 GB, RTX 6000 Ada). Con cuantizacion Q4_K_M del target, cabe en una RTX 4090 de 24 GB.
- GPU consumer: si, con cuantizaciones reducidas (Q4_K_M o inferiores) y el drafter en Q8_0 o Q4_K_M.
- Opciones de despliegue: llama.cpp (rama `dspark-qwen35` hasta que se fusione el PR #25173) con `llama-server` y flags `--spec-type draft-dspark --spec-draft-n-max 15`; vLLM 0.25 o superior con soporte DeepSpec-format.
- Latencia y throughput: 129,5-136,1 t/s en RTX Pro 6000 (CUDA), 17,1-17,3 t/s en M3 Max (Metal), con completions de 200 tokens en modo greedy.
- Nota: el drafter por sí solo no acelera targets pequeños en Metal; en un target de 0,8 B es una ralentizacion neta porque el coste del borrador domina.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Speedup (RTX Pro 6000) | Speedup (M3 Max) | Licencia |
|---|---|---|---|---|---|
| Qwen3.6-27B-DSpark (este) | 4,4 B | DSpark (DeepSpec) | 2,54-2,67× | 1,39× | Apache-2.0 |
| z-lab DFlash (predecesor) | no disponible | DFlash | no disponible | no disponible | no disponible |
| Baseline sin drafter | - | - | 1,0× | 1,0× | - |

No se dispone de datos publicados de otros drafters (EAGLE-2, Medusa, etc.) para el mismo target Qwen3.6-27B, por lo que no es posible una comparativa numerica directa. El autor indica que la cabeza DFlash de z-lab fue el punto de partida del calentamiento, pero no publica sus metricas en esta tarjeta.

## Limitaciones y advertencias

- Dependencia del target: el drafter solo funciona con Qwen3.6-27B; no es un modelo autonomo y no genera texto por sí mismo.
- Variabilidad de la aceleracion: la aceptacion cae de 0,29-0,31 en sondas greedy estrechas a 0,19-0,20 en prompts variados reales (SPEED-Bench); el speedup real depende del tipo de carga.
- Ralentizacion en targets pequenos: en Metal, con un target de 0,8 B, el drafter es un slowdown neto; la ventaja solo aparece con targets grandes (27 B o mas).
- Requisitos de version: llama.cpp necesita la rama `dspark-qwen35` hasta que se fusione el PR #25173; vLLM exige la version 0.25 o superior, ya que la 0.24 rechaza el metodo `"dspark"`.
- Configuracion RoPE corregida: los primeros descargadores que usaron vLLM antes del 2026-07-31 pueden tener una aceptacion colapsada al 1 %; hay que actualizar el `config.json` (fix `partial_rotary_factor: 1.0`).
- Parametro obligatorio: `--spec-draft-n-max 15` debe fijarse manualmente en llama.cpp; el valor por defecto de 3 tokens desperdicia la mayor parte de la aceleracion.
- Sesgos y alucinaciones: al ser un drafter, hereda los sesgos y riesgos de alucinacion del target Qwen3.6-27B; no se han evaluado estos aspectos en la tarjeta del modelo.
- Uso comercial: permitido bajo licencia Apache-2.0, sin restricciones conocidas, pero el target Qwen3.6-27B debe verificarse por separado.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/satgeze/Qwen3.6-27B-DSpark
- DeepSpec (framework de entrenamiento): https://github.com/deepseek-ai/DeepSpec
- PR de soporte DSpark en llama.cpp: https://github.com/ggml-org/llama.cpp/pull/25173
- PR de soporte DeepSpec-format en vLLM: https://github.com/vllm-project/vllm/pull/46995
- PR de soporte speculators-format en vLLM: https://github.com/vllm-project/vllm/pull/47093
- Referencia arxiv: 2607.05147
- Rama de llama.cpp con soporte: https://github.com/satindergrewal/llama.cpp (rama `dspark-qwen35`)
- Target del modelo: https://huggingface.co/Qwen/Qwen3.6-27B
