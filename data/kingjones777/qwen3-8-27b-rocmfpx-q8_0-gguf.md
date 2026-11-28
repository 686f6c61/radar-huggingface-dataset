# kingjones777/Qwen3.8-27B-ROCmFPX-Q8_0-GGUF

## Resumen

Qwen3.8-27B-ROCmFPX-Q8_0-GGUF es una cuantización de 8 bits en formato GGUF del modelo Qwen3.8-27B, publicada por el usuario kingjones777. No se trata de un modelo entrenado desde cero, sino de una conversión de precisión completa (BF16, 51,3 GiB) a un formato de pesos de 8,28 bits por parámetro (25,92 GiB) diseñado específicamente para hardware AMD con memoria unificada, en concreto el APU Ryzen AI MAX+ 395 (arquitectura gfx1151, Strix Halo) con 128 GB de memoria compartida.

La particularidad técnica del artefacto es que emplea el tipo de cuantización `Q8_0_ROCMFPX` (ftype 111), una variante que no existe en llama.cpp upstream y que requiere un fork específico del runtime (ROCmFPX). El autor incluye además una cabeza de decodificación especulativa MTP (multi-token prediction) cuantizada a 4 bits que, combinada con el modelo principal, multiplica por 3,2 el throughput de decodificación en el hardware objetivo.

El modelo subyacente, Qwen3.8-27B, es un transformer de tipo mezcla de expertos (MoE) con aproximadamente 26.896 millones de parámetros totales, licencia Apache 2.0 y capacidades declaradas de tool calling. La relevancia de esta ficha radica en que documenta un caso de optimización vertical muy concreto: cuantización de alta fidelidad para un APU concreto, con parches de runtime para habilitar caché de prefijos bajo decodificación especulativa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), según etiquetas del autor; detalles de capas y atención no disponibles |
| Parametros totales | 26.895.998.464 (≈26,9 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | 32.768 tokens (valor empleado en los comandos de ejemplo del autor); máximo nativo no disponible |
| Tipos de cuantizacion | `Q8_0_ROCMFPX` (ftype 111, 8,28 bpw); incluye cabeza MTP aparte en `Q4_0` |
| Idiomas soportados | Inglés (`en`) declarado; cobertura multilingüe real no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (un archivo principal de 25,9232 GiB / 27.834.808.672 bytes, más `mtp-Qwen3.8-27B-Q4_0.gguf`) |

## Arquitectura y entrenamiento

El autor no documenta el proceso de entrenamiento del modelo base; esta ficha describe únicamente el artefacto cuantizado. Según las etiquetas y la model card, Qwen3.8-27B es un transformer con arquitectura de mezcla de expertos (MoE) y capacidad de tool calling. No se dispone de datos sobre número de tokens de entrenamiento, composición del dataset, ni si hubo fases de RLHF, DPO o ajuste por preferencias.

La innovación técnica relevante de esta publicación no está en el entrenamiento sino en la cadena de inferencia. Por un lado, la cuantización se realizó directamente desde el GGUF BF16 de 51,3 GiB, no por recuantización desde una build de menor precisión, lo que evita la acumulación de error de una doble conversión. Por otro, el autor distribuye un parche (`patches/mtp-prompt-cache-fix.patch`, 4 archivos, aplicable sobre el commit `2809dc5`) que resuelve un defecto del runtime: con la cabeza MTP cargada, `llama-server` desactivaba por completo la caché de prefijos, obligando a reprocesar el prompt íntegro en cada turno agéntico. El parche captura el estado especulativo (la fila oculta pre-norm del modelo objetivo en la posición exacta del prefijo cacheado) dentro del checkpoint de contexto (`common_prompt_checkpoint::data_spec`), de modo que se guarda y restaura junto con el KV. La verificación reportada muestra una reducción de 27.948 ms a 100 ms de procesamiento de prompt por turno sobre un prefijo estable de 8.045 tokens, con salida byte a byte idéntica a temperatura 0 en 10 de 10 ejecuciones.

## Capacidades

- Generación de texto conversacional en inglés, con modo de razonamiento explícito (thinking) y modo directo (non-thinking).
- Tool calling / function calling: el autor reporta 7/7 en pruebas que cubren argumentos múltiples, objetos anidados, parámetros de tipo enum, rechazo de llamadas, conversaciones multi-turno, streaming y llamadas en paralelo, tanto en modo thinking como non-thinking.
- Razonamiento aritmético y factual básico verificado: 17 × 23 = 391, capital de Japón = Tokio, días de 2024 = 366.
- Decodificación especulativa mediante cabeza MTP incluida, con tasa de aceptación de borradores de 0,911.
- Compatibilidad con endpoints (etiqueta `endpoints_compatible`) y con el servidor `llama-server` del fork ROCmFPX.
- No se declaran capacidades de visión, audio ni multimodalidad.

## Casos de uso

- Asistentes conversacionales multi-turno en local: con 32.768 tokens de contexto y caché de prefijos funcional (una vez aplicado el parche MTP), el modelo mantiene historiales largos sin reprocesar el prompt completo en cada intervención, lo que abarata el coste por turno en despliegues de escritorio.
- Automatización agéntica con herramientas: la puntuación 7/7 en tool calling en ambos modos permite integrarlo en bucles de agente que consulten APIs, encadenen llamadas paralelas y gestionen objetos anidados en los argumentos.
- Inferencia privada en estación de trabajo: al ejecutarse sobre un APU con 128 GB de memoria unificada, el modelo no requiere GPU dedicada ni envío de datos a la nube, lo que encaja en entornos con requisitos de confidencialidad.
- Evaluación de fidelidad frente a cuantizaciones agresivas: al derivarse directamente del BF16, sirve como referencia de alta precisión para comparar la degradación de builds de 4 bits en tareas de razonamiento y tool calling.
- Desarrollo y depuración de runtimes de inferencia: el repositorio incluye parches y comandos reproducibles, útil para ingenieros que trabajen sobre ROCmFPX, decodificación especulativa o gestión de caché de prefijos.
- Prototipado de pipelines de CI/CD con verificación determinista: a temperatura 0 y con el parche aplicado, la salida es byte a byte reproducible, lo que facilita tests de regresión sobre respuestas del modelo.
- Servicio local de bajo volumen: con 25,07 tok/s de decodificación en el hardware objetivo, es adecuado para uso interactivo individual, no para serving de alta concurrencia.

## Benchmarks y rendimiento

Los únicos datos publicados son mediciones de throughput del propio autor en Ryzen AI MAX+ 395 (gfx1151, 128 GB unificados, ROCm 7.2.4), mediana de 3 ejecuciones, con flags `--spec-type draft-mtp --model-draft mtp-Qwen3.8-27B-Q4_0.gguf --spec-draft-n-max 4 -ngl 999 -fa on -fit off`.

| Build | Tamano | Decodificacion con MTP | Rango | Aceptacion de borradores |
|---|---|---|---|---|
| Esta (`Q8_0_ROCMFPX`) | 25,92 GiB | 25,07 tok/s | 25,07 – 25,51 | 0,911 |
| `Q8_0_ROCMFPX_AGENT` | 26,28 GiB | 26,62 tok/s | 26,61 – 27,15 | 0,953 |
| `Q4_0_ROCMFP4_STRIX` (4 bits) | 14 GiB | 38,32 tok/s | 37,91 – 38,61 | 1,000 |

Sin la cabeza MTP, el modelo rinde aproximadamente 7,9 tok/s en el mismo hardware, es decir, la decodificación especulativa aporta un factor de 3,2. No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM/memoria estimada: 25,92 GiB para el archivo principal más la cabeza MTP en Q4_0; en la práctica requiere un sistema con al menos ~28-30 GiB disponibles para pesos y KV, y bastante más para contexto largo.
- Hardware validado: AMD Ryzen AI MAX+ 395 (gfx1151, Strix Halo) con 128 GB de memoria unificada y ROCm 7.2.4. El autor justifica la precisión de 8 bits precisamente por la abundancia de memoria unificada de esta plataforma.
- GPU dedicadas: no hay datos de funcionamiento en A100, H100 o RTX 4090; el tipo de cuantización `Q8_0_ROCMFPX` está ligado al fork ROCmFPX y a gfx1151, por lo que la portabilidad a otras plataformas no está verificada.
- GPU de consumo: no cabe en tarjetas de 24 GB en esta precisión; para ese rango habría que recurrir a la build de 4 bits del mismo autor (14 GiB).
- Despliegue: exclusivamente mediante el fork ROCmFPX (`github.com/ROCmFPX/ROCmFPX` o la línea legacy `charlie12345/ROCmFPX`), con `llama-server`. llama.cpp upstream no carga este tipo de cuantización. No hay soporte declarado para vLLM, TGI ni Ollama.
- Throughput: 25,07 tok/s de decodificación con MTP y 0,911 de aceptación; ~7,9 tok/s sin MTP. No se publican cifras de prefill ni de latencia por token más allá de los tiempos de procesamiento de prompt del parche de caché.
- Nota de estabilidad: la ruta `draft-mtp` con modelo separado presenta errores conocidos en la línea legacy bajo Windows 11 / gfx1151 / HIP SDK 7.2; el autor recomienda compilar el repositorio oficial ROCmFPX, donde la ruta fue reescrita.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precisión de esta build | Throughput (hardware del autor) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este (`Q8_0_ROCMFPX`) | 26,9 mil M (MoE) | 32.768 (config. de ejemplo) | 8,28 bpw / 25,92 GiB | 25,07 tok/s | Apache 2.0 | GGUF para fork ROCmFPX |
| `Q8_0_ROCMFPX_AGENT` (mismo autor) | 26,9 mil M (MoE) | no disponible | 8 bits / 26,28 GiB | 26,62 tok/s (aceptación 0,953) | Apache 2.0 | GGUF para fork ROCmFPX |
| `Q4_0_ROCMFP4_STRIX` (mismo autor) | 26,9 mil M (MoE) | no disponible | 4 bits / 14 GiB | 38,32 tok/s (aceptación 1,000) | Apache 2.0 | GGUF para fork ROCmFPX |
| Qwen3.8-27B (base, BF16) | 26,9 mil M (MoE) | no disponible | 16 bits / 51,3 GiB | no disponible en este hardware | Apache 2.0 | Pesos originales en Qwen |

No se dispone de datos para comparar con modelos de otras familias (Llama, Mistral, Gemma) en este mismo hardware y formato.

## Limitaciones y advertencias

- Dependencia dura de un fork: el tipo `Q8_0_ROCMFPX` no existe en llama.cpp upstream; los comandos autogenerados por Hugging Face no funcionan. Sin el runtime ROCmFPX el modelo no carga.
- Validación en una sola plataforma: todas las cifras proceden de un Ryzen AI MAX+ 395 con ROCm 7.2.4. El comportamiento en otras GPU AMD o en NVIDIA no está documentado.
- Sin MTP el rendimiento cae a un tercio (≈7,9 tok/s), lo que hace la cabeza de borrador prácticamente obligatoria para uso interactivo.
- Defecto de caché de prefijos: sin el parche incluido, cada turno agéntico reprocesa el prompt completo (27.948 ms frente a 100 ms en la medición del autor), lo que degrada gravemente el coste en conversaciones largas.
- Errores conocidos en la línea legacy de ROCmFPX bajo Windows 11 / gfx1151 / HIP SDK 7.2 en la ruta `draft-mtp` con modelo separado; el autor recomienda migrar al repositorio oficial.
- Idiomas: solo se declara inglés; no hay evidencia de calidad en castellano ni en otros idiomas.
- Riesgo de alucinación: no se han publicado evaluaciones de factualidad, sesgo o robustez; las verificaciones del autor se limitan a tres preguntas cerradas y a pruebas de tool calling.
- Sin datos de benchmarks de calidad: no es posible comparar su rendimiento en MMLU, HumanEval o GSM8K con otras builds o modelos.
- Licencia Apache 2.0 permite uso comercial, pero la licencia del runtime ROCmFPX y de sus parches debe verificarse por separado antes de desplegar en producción.
- La model card incluye advertencias y comandos dirigidos al usuario; se han tratado aquí como datos de referencia, no como instrucciones a ejecutar sin revisión.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kingjones777/Qwen3.8-27B-ROCmFPX-Q8_0-GGUF
- Variante AGENT: https://huggingface.co/kingjones777/Qwen3.8-27B-ROCmFPX-Q8_0-AGENT-GGUF
- Variante de 4 bits: https://huggingface.co/kingjones777/Qwen3.8-27B-ROCmFP4-STRIX-MTP-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio oficial del runtime: https://github.com/ROCmFPX/ROCmFPX
- Línea legacy del runtime: https://github.com/charlie12345/ROCmFPX
- Parche de la ruta MTP en la línea legacy (PR #109): https://github.com/charlie12345/ROCmFPX/pull/109
