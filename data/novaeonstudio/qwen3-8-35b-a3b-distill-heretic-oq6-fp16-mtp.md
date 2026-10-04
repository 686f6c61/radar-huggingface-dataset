# NovaeonStudio/Qwen3.8-35B-A3B-Distill-Heretic-oQ6-fp16-mtp

## Resumen

Qwen3.8-35B-A3B-Distill-Heretic-oQ6-fp16-mtp es una build cuantizada y descensurada del modelo empero-ai/Qwen3.8-35B-A3B-Distill, publicada por Novaeon.Studio. Se trata de un Mixture-of-Experts (MoE) de la familia Qwen3.5/3.6 con 35.951.822.704 parametros totales (unos 35B) y aproximadamente 3B parametros activos por token, 256 expertos de los cuales 8 se enrutan por capa, y 40 capas que combinan GatedDeltaNet con atencion completa. La ventana de contexto nativa es de 262.144 tokens y el modelo incluye torre de vision, por lo que su pipeline declarado es image-text-to-text.

El interes de esta ficha concreta esta en tres intervenciones sobre el checkpoint base: primero, una ablacion de rechazos (de-censoring) realizada con Heretic v2.0.0.dev0 mediante Arbitrary-Rank Ablation y una busqueda Optuna de 60 ensayos, que reduce los rechazos de 98/100 a 2/100 en el conjunto danino de Heretic con una divergencia KL de 0,248 (0,28 tras el merge y la cuantizacion); segundo, un merge del resultado sobre el checkpoint original para preservar los 42 tensores `mtp.*` de la cabeza MTP nativa y la torre de vision; y tercero, una cuantizacion oQ6 de oMLX (6 bits, group size 64, escalas float16, ~6,9 bpw efectivos, ~31 GB en disco).

Es relevante ahora porque ofrece decodificacion sin censura manteniendo aceleracion por MTP en hardware Apple Silicon, un nicho donde las alternativas descensuradas suelen destruir la cabeza MTP (~2,5 veces mas lenta la decodificacion) o emplean recetas de precision mixta que rinden mal en MLX. El autor la posiciona explicitamente como termino medio para Macs de 48-64 GB: no es mas rapida que su build oQ8, solo ocupa menos memoria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE de la familia Qwen3.5/3.6 con atencion hibrida GatedDeltaNet + atencion completa, encoder de vision y cabeza MTP nativa |
| Parametros totales | 35.951.822.704 (~35B) |
| Parametros activos | ~3B por token |
| Longitud de contexto | 262.144 tokens nativos |
| Tipos de cuantizacion | oQ6 de oMLX, 6 bits, group size 64, escalas y pesos no cuantizados en float16 (~6,9 bpw efectivos); la familia incluye tambien builds oQ8 y oQ4 |
| Idiomas soportados | en (unico idioma declarado); la suite interna del autor incluye casos en aleman |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors en formato MLX (library_name: mlx), ~31 GB en disco |
| Expertos | 256 enrutados, 8 activos por token |
| Capas | 40 |
| Cabeza MTP | Nativa, 42 tensores `mtp.*` preservados |
| Motor de inferencia | oMLX (Apple MLX) |
| RAM sugerida | 48 GB o mas |
| Modelo base | empero-ai/Qwen3.8-35B-A3B-Distill |

## Arquitectura y entrenamiento

La arquitectura es un transformer MoE hibrido: 40 capas que alternan capas GatedDeltaNet (atencion lineal de estado) con capas de atencion completa. De estas ultimas solo hay 10, con 2 cabezas KV (~20 KB por token de cache), lo que explica que la compresion de KV apenas aporte en este modelo. El enrutado activa 8 de 256 expertos por token, lo que da ~3B parametros activos sobre 35B totales. El modelo incorpora ademas un encoder de vision y una cabeza MTP (Multi-Token Prediction) nativa de 42 tensores, que acelera la decodificacion. Segun el autor, los profesores Qwen3.8 fueron destilados dentro de Qwen3.6-35B-A3B; no se especifican el numero de tokens de entrenamiento ni la composicion del dataset, y no hay informacion sobre RLHF, DPO u otras etapas de alineamiento preferencial (no disponible).

Sobre ese checkpoint se aplico un pipeline de tres pasos reproducible. Primero, Heretic v2.0.0.dev0 con Arbitrary-Rank Ablation y una busqueda Optuna de 60 ensayos, que paso de 98/100 rechazos a 2/100 en el conjunto danino de Heretic, con KL 0,248 medido por Heretic. Segundo, el resultado abliterado se mezclo de vuelta con el checkpoint original para mantener intactas la cabeza MTP y la torre de vision, quedando la KL en 0,28 tras el merge y la cuantizacion. Tercero, la cuantizacion con oMLX a oQ6. El autor indica que la ablacion degrada ligeramente la precision aritmetica, de codigo y de aleman, mientras que la cuantizacion apenas introduce perdida adicional: oQ4 empata con oQ8 en su suite. Una build de 2 bits (oQ2) fue construida y descartada por obtener 13/43 casos correctos, por lo que no hay release de 2 bits.

## Capacidades

- Generacion de texto conversacional en ingles, con modo de pensamiento opcional (`enable_thinking`) para razonamiento dificil.
- Entrada de imagen y texto (pipeline image-text-to-text) gracias al encoder de vision preservado.
- Tool calling y function calling: 11/11 casos correctos en la suite interna del autor, sin degradacion respecto al modelo original.
- Salida estructurada en JSON: 5/5 casos correctos.
- Contexto largo real: 4/4 needles resueltos en rangos de 20.000 a 50.000 tokens, sobre una ventana nativa de 262.144 tokens.
- Razonamiento multi-paso: 2/6 casos en modo sin pensamiento (3/6 en el original); con `enable_thinking` activado el autor recomienda usarlo para tareas de razonamiento exigente.
- Abstenerse cuando no sabe: 3/3 casos de abstencion correctos.
- Generacion de codigo: 2/4 casos correctos (4/4 en el original), la categoria mas afectada por la ablacion.
- Escritura creativa, roleplay y ficcion con temas oscuros o lenguaje directo, con 0/10 rechazos en el conjunto de 10 prompts limite pero legitimos del autor (humor negro, tacos, reduccion de danos, ganzuado, monologo de villano).
- Decodificacion acelerada por MTP con profundidad adaptativa; desactivar MTP cuesta aproximadamente un 35% de velocidad de decodificacion.
- Capacidad multilingue limitada: solo se declara ingles, con 3/4 casos correctos en aleman en la suite interna.

## Casos de uso

- Escritura creativa y ficcion en local: el modelo mantiene la velocidad completa del A3B (112-122 tok/s en un M5 Max) y no interpone rechazos ni sermones, por lo que resulta adecuado para novela, relato corto y guion con tematicas adultas o violentas, sin enviar el manuscrito a un servicio en la nube.
- Roleplay y asistentes conversacionales sin filtro: los 262.144 tokens de contexto permiten mantener un historial extenso de personaje y escenario sin truncar, y la ventana amplia evita perder la ficha de personaje en sesiones largas.
- Red team y evaluacion de seguridad: el salto de 98/100 a 2/100 rechazos, con KL 0,248-0,28 documentada, convierte a esta build en una referencia util para medir la eficacia de tecnicas de abliteracion y para construir conjuntos de prueba de mitigacion (el autor reporta 12/17 en su suite de mitigacion).
- Analisis de documentos largos con componentes visuales: combinando la torre de vision, los 262.144 tokens de contexto y los 4/4 needles en 20-50k, se puede usar para revisar contratos, informes anuales o expedientes con graficos y tablas insertados como imagen.
- Extraccion estructurada en pipelines locales: con 5/5 en JSON y tool calling intacto (11/11), encaja en flujos que convierten documentos o capturas en registros estructurados ejecutados enteramente en el Mac del usuario.
- Asistencia de programacion en local con supervision humana: aun con 2/4 en la categoria de codigo, sirve para autocompletado, explicacion de fragmentos y generacion de pruebas en un portatil Apple Silicon, siempre con revision, no como agente autonomo.
- Despliegue con requisitos de privacidad estrictos: al ejecutarse sobre oMLX con endpoint compatible con OpenAI en `127.0.0.1:8000/v1`, permite montar un asistente interno para datos clinicos, legales o financieros que no pueden salir del equipo.
- Experimentacion con decodificacion MTP en Apple Silicon: la preservacion de los 42 tensores `mtp.*` y los ajustes medidos (profundidad adaptativa, TurboQuant KV desactivado) lo convierten en una plataforma de prueba para optimizacion de inferencia en MLX.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K ni similares) en la informacion disponible. Los unicos datos son las mediciones internas del autor sobre hardware Apple M5 Max de 128 GB con oMLX, pensamiento desactivado y TurboQuant KV desactivado.

Velocidad, oQ6 Heretic frente al oQ8 original del autor:

| Metrica | original oQ8 | Heretic oQ6 |
|---|---|---|
| Decodificacion, prompt corto | ~126-129 tok/s | 112-122 tok/s |
| Decodificacion a 53k tokens de contexto | ~91-103 tok/s | 97-99 tok/s |
| Prefill en frio a 53k | 3.331 tok/s | 2.606 tok/s |
| 4 peticiones concurrentes, agregado | ~221 tok/s | 203 tok/s |

Suite de regresion interna (43 casos deterministas) y suite de mitigacion (17 casos):

| Categoria | original oQ8 | Heretic oQ8 | Heretic oQ6 | Heretic oQ4 |
|---|---|---|---|---|
| Tool calling | 11/11 | 11/11 | 11/11 | 11/11 |
| JSON | 5/5 | 5/5 | 5/5 | 5/5 |
| Seguimiento de instrucciones | 6/6 | 5/6 | 5/6 | 5/6 |
| Aleman | 4/4 | 3/4 | 3/4 | 3/4 |
| Needles de contexto largo | 4/4 | 4/4 | 4/4 | 4/4 |
| Razonamiento (sin pensamiento) | 3/6 | 2/6 | 2/6 | 2/6 |
| Abstencion | 3/3 | 3/3 | 3/3 | 3/3 |
| Codigo | 4/4 | 3/4 | 2/4 | 3/4 |
| Total | 40/43 | 36/43 | 35/43 | 36/43 |
| Suite de mitigacion | 16/17 | 14/17 | 12/17 | 14/17 |

Rechazos:

| Conjunto | original | Heretic oQ6 |
|---|---|---|
| Conjunto danino de Heretic (100 prompts, pre-cuantizacion) | 98/100 | 2/100 |
| Prompts limite pero legitimos (10) | 2/10 rechazados | 0/10 rechazados |

## Requisitos de hardware

- RAM sugerida por el autor: 48 GB o mas; la build esta pensada como termino medio para Macs de 48-64 GB.
- Peso en disco y en memoria: ~31 GB para los pesos oQ6, mas cache KV y overhead del runtime.
- Cache KV reducida: solo 10 capas de atencion completa con 2 cabezas KV, aproximadamente 20 KB por token, lo que a 53k tokens supone del orden de 1 GB de KV.
- Hardware de referencia de las mediciones: Apple M5 Max de 128 GB, libreria oMLX.
- Cabe en GPU de consumo en el sentido de Apple Silicon unificado: si en Macs de 48-64 GB y superiores; no se proporcionan datos para GPU NVIDIA (A100, H100, RTX 4090) porque el formato es MLX y no hay pesos GGUF o CUDA en esta ficha (no disponible).
- Opciones de despliegue: oMLX sobre Apple MLX, con servidor compatible con OpenAI en `http://127.0.0.1:8000/v1` y model id `Qwen3.8-35B-A3B-Distill-Heretic-oQ6-fp16-mtp`. Descarga mediante `hf download`. No se documentan rutas para vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput medidos: 112-122 tok/s de decodificacion con prompt corto, 97-99 tok/s a 53k tokens de contexto, 2.606 tok/s de prefill en frio a 53k y 203 tok/s agregados con 4 peticiones concurrentes.
- Ajustes medidos recomendados: `mtp_enabled: true` con profundidad adaptativa; `turboquant_kv_enabled: false` (desactivarlo aporta +37% de decodificacion a 53k de contexto y +23% de throughput agregado); `enable_thinking: false` para chat y escritura creativa.
- Muestreo recomendado: temperatura 0,7 con top_p 0,95 para creatividad; temperatura 0-0,3 para tareas facticas.

## Comparativa con modelos similares

No se dispone de datos de benchmarks publicos de alternativas de otros autores, por lo que la comparacion se limita a las builds de la misma familia publicadas por Novaeon.Studio y al checkpoint original:

| Modelo | Parametros | Contexto | Cuantizacion | Tamano | Suite interna | Rechazos | Licencia |
|---|---|---|---|---|---|---|---|
| original oQ8 (seat del autor) | 35B totales / ~3B activos | 262.144 | oQ8 | no disponible | 40/43 · mitigacion 16/17 | 98/100 | apache-2.0 |
| Heretic oQ8 | 35B totales / ~3B activos | 262.144 | oQ8 | no disponible | 36/43 · mitigacion 14/17 | 2/100 (pre-cuantizacion) | apache-2.0 |
| Heretic oQ6 (esta ficha) | 35B totales / ~3B activos | 262.144 | oQ6 (~6,9 bpw) | ~31 GB | 35/43 · mitigacion 12/17 | 2/100 (pre-cuantizacion) | apache-2.0 |
| Heretic oQ4 | 35B totales / ~3B activos | 262.144 | oQ4 | no disponible | 36/43 · mitigacion 14/17 | no disponible | apache-2.0 |

Nota del autor: en este MoE la build oQ6 no es mas rapida que la oQ8; su unico vantaja es el ahorro de memoria (48-64 GB frente a configuraciones mayores). La build oQ2 fue construida y rechazada (13/43) y no se publico. Comparativas con modelos de otros fabricantes del mismo rango (por ejemplo otros MoE de ~30-35B con ~3B activos) no disponibles en la informacion proporcionada.

## Limitaciones y advertencias

- La ablacion degrada capacidades medibles: codigo cae de 4/4 a 2/4, aleman de 4/4 a 3/4, seguimiento de instrucciones de 6/6 a 5/6 y razonamiento sin pensamiento de 3/6 a 2/6. La suite de mitigacion baja de 16/17 a 12/17 con oQ6.
- El propio autor desaconseja usarlo como agente autonomo de tool calling: los rechazos funcionan como capa de seguridad cuando las herramientas tienen efectos secundarios. Mantiene el modelo original como seat de agente por defecto.
- Modelo descensurado por diseno: generara contenido que otros modelos rechazan. Esto implica riesgo de contenido ofensivo, ilegal o peligroso, y responsabilidad legal derivada del uso.
- Riesgo de alucinacion no cuantificado: la suite interna solo mide abstencion en 3 casos, insuficiente para garantizar fiabilidad factica en produccion.
- Solo se declara soporte de ingles. El comportamiento en castellano no esta evaluado en la informacion disponible y el unico caso multilingue reportado (aleman) ya pierde un caso respecto al original.
- Cobertura de contexto: los needles verificados llegan a 20-50k tokens; no hay evidencia publicada de recuperacion fiable cerca de los 262.144 tokens declarados.
- Licencia apache-2.0 heredada del modelo base, lo que en principio permite uso comercial, pero conviene verificar los terminos del checkpoint base y de los profesores Qwen3.8 citados antes de desplegarlo en producto.
- Dependencia de plataforma: los pesos estan en formato MLX y requieren Apple Silicon con oMLX. No hay GGUF ni safetensors para CUDA en esta ficha, lo que limita el despliegue en infraestructura NVIDIA.
- Repositorio con 0 descargas y 1 me gusta en el momento de la consulta, creado y actualizado el 3 de octubre de 2026: validacion comunitaria practicamente nula, y la evaluacion se apoya exclusivamente en la suite privada del autor.
- Los numeros de rendimiento proceden de un unico dispositivo (M5 Max de 128 GB) y de una configuracion concreta (pensamiento y TurboQuant KV desactivados); no son extrapolables directamente a otros equipos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/NovaeonStudio/Qwen3.8-35B-A3B-Distill-Heretic-oQ6-fp16-mtp
- Modelo base: https://huggingface.co/empero-ai/Qwen3.8-35B-A3B-Distill
- Build hermana oQ8: https://huggingface.co/NovaeonStudio/Qwen3.8-35B-A3B-Distill-Heretic-oQ8-fp16-mtp
- Build hermana oQ4: https://huggingface.co/NovaeonStudio/Qwen3.8-35B-A3B-Distill-Heretic-oQ4-fp16-mtp
- Build del autor sin ablacion (seat oQ8): https://huggingface.co/NovaeonStudio/Qwen3.8-35B-A3B-Distill-oQ8-fp16-mtp
- Heretic (herramienta de abliteracion): https://github.com/p-e-w/heretic
- oMLX (runtime y cuantizacion): https://github.com/jundot/omlx
- Sitio del autor: https://novaeon.studio
- Resultados de la busqueda web: no se ha encontrado ningun enlace relevante o verificable sobre este modelo; los resultados devueltos no guardan relacion con el contenido tecnico de la ficha.
