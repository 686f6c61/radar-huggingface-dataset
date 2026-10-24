# elyanlabs/rpi-inference

## Resumen

`elyanlabs/rpi-inference` no es un modelo de lenguaje con pesos publicados, sino un repositorio de código (0,0 GB, sin ficheros de pesos, sin pipeline de inferencia asociado) que contiene una copia del motor de inferencia RPI (Resonant Permutation Inference), desarrollado por elyanlabs a partir del repositorio de GitHub `Scottcjn/rpi-inference`. El motor propone sustituir la multiplicación de matrices por tablas de permutación e acumulación entera: cada "celda" aplica micro-operaciones ternarias de 64 carriles (`src_idx` + `sign_bits`) ejecutadas con instrucciones de permutación de un solo ciclo (`vec_perm` en POWER8, `vperm` en G4, `tbl` en ARM). El autor lo describe como un motor de inferencia "zero-multiply", sin coma flotante y sin GEMM.

La propuesta técnica incluye una forma peculiar de atención: en lugar de calcular productos escalares, el motor mide la latencia de la jerarquía de caché (L1 ≈ 1 ns, L2 ≈ 5 ns, L3 ≈ 12 ns, DRAM ≈ 55 ns) y usa ese tiempo como puntuación de "resonancia" para priorizar el enrutado entre celdas. El modelo resultante es minúsculo (el autor declara 0,3-3 MB) y está pensado para ejecutarse en CPU de bajo consumo (5-15 W), desde una Raspberry Pi ARM64 hasta un POWER8 o un x86 sin GPU.

Su relevancia práctica es doble: por un lado, como motor de borrador para decodificación especulativa (genera candidatos que un LLM grande verifica, con tasas de aceptación declaradas del 60-80 % en texto de dominio); por otro, como clasificador/enrutador de entrada en microsegundos antes de invocar un LLM mayor. Cabe advertir desde el inicio de que todas las cifras de rendimiento proceden exclusivamente de la model card del autor y no están verificadas de forma independiente: el repositorio no incluye benchmarks, evaluaciones ni pesos de ningún modelo concreto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Motor de inferencia de celdas de permutación ternaria (RPI); no es un transformer con atención por producto escalar. Sustituye GEMM por `vec_perm`/`tbl` + acumulación entera |
| Parametros totales | no disponible (no se publica recuento de parámetros; el autor declara modelos `.rpi` de 0,3-3 MB) |
| Parametros activos | no aplica (no es una arquitectura MoE) |
| Longitud de contexto | no disponible; el banco MEM gestiona contexto a largo plazo, sin ventana de tokens declarada |
| Tipos de cuantizacion | Pesos ternarios (+1/-1) empaquetados como `src_idx` + `sign_bits`, con acumulación entera (INT16 según el autor). No hay FP16/FP32 ni GGUF |
| Idiomas soportados | no disponible (la metadata no declara idiomas; los estados de dominio del README están en inglés) |
| Licencia | AGPL-3.0 |
| Formato de pesos | `.rpi` (binario propio, generado por `tools/build_rpi_from_bigrams.py` o `tools/distill_to_rpi.py`). No safetensors, no GGUF |
| Tipo de repositorio | Código fuente únicamente (snapshot de GitHub/GitLab), 0,0 GB, sin pesos publicados |
| Plataformas soportadas | ARM64 (Raspberry Pi), POWER8 (VSX), x86, G4 (`vperm`), N64 (`tbl`) |
| Interfaz | CLI `./rpi-cli -m modelo.rpi -p "prompt" -n 100`; herramientas Python de construcción y destilación |
| Descargas / likes | 0 / 0 |
| Fecha de publicacion | 2026-10-23 (creado y actualizado el mismo día) |

## Arquitectura y entrenamiento

Cada celda del motor contiene tres elementos: bloques de permutación de 64 carriles con pesos ternarios (`src_idx[i]` indica el carril de origen y `sign_bits` decide suma o resta), rutas dispersas y ponderadas hacia otras celdas, y emisiones de probabilidad de token puntuadas con `rank_bias`. Las celdas se organizan en cuatro bancos con funciones diferenciadas: LEX (vocabulario y patrones de tokens, equivalente a la capa de embeddings), SYN (sintaxis y estructura gramatical, análogo a las cabezas de atención), DISC (coherencia de discurso y tópico, capas tardías) y MEM (contexto a largo plazo, equivalente al KV cache). El bucle de inferencia activa celdas semilla desde la consulta, ejecuta entre 3 y 6 rondas de permutaciones, sigue las rutas para activar celdas aguas abajo, mide la resonancia de caché para priorizar y comprueba la convergencia mediante una firma FNV-1a; finalmente recolecta emisiones y muestrea top-K usando entropía de hardware (`mftb`/`rdtsc`).

El apartado de "entrenamiento" es heterodoxo: no hay un corpus declarado, ni número de tokens, ni fases de RLHF/DPO, ni datos de composición del dataset. Los modelos `.rpi` se construyen de dos maneras: agregando estadísticas de bigramas (`build_rpi_from_bigrams`) o destilando desde un modelo profesor mediante `tools/distill_to_rpi.py --teacher tinyllama --output sophia.rpi`. Es decir, el repositorio aporta el motor y el procedimiento de destilación, pero no un modelo entrenado ni la documentación del proceso de ajuste. La innovación declarada principal es la "atención por resonancia de caché": la latencia medida de L1/L2/L3/DRAM (1,0 / 0,6 / 0,3 / 0,05 de resonancia) actúa como sustituto de las puntuaciones de atención, algo que el autor argumenta que es imposible en GPU por su memoria compartida uniforme.

## Capacidades

- Generación de texto token a token mediante votación de emisiones de las celdas activas, con muestreo top-K y entropía de hardware.
- Destilación de modelos pequeños: pipeline documentado para convertir un profesor tipo TinyLlama en un fichero `.rpi`.
- Decodificación especulativa: actúa como motor de borrador que propone tokens a un LLM mayor, que los acepta o corrige.
- Enrutado y clasificación de entrada en ocho estados de dominio (el README detalla THEOLOGY, CODE, EMOTIONAL, IDENTITY y GENERAL; el resto no se especifica en la información disponible), con activación de celdas ponderada por palabras clave.
- Ejecución en CPU sin coma flotante: no requiere GPU, FPU vectorial de precisión ni unidades tensoras.
- Portabilidad a arquitecturas con instrucciones de permutación de bytes, incluida documentación de compilación para POWER8, ARM64 y x86.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta razonamiento multi-paso, visión, audio ni modo "thinking".
- No se declaran capacidades multilingües; los dominios y ejemplos del README están en inglés.

## Casos de uso

- **Decodificación especulativa sobre un LLM grande**: el motor genera borradores a alta velocidad y el LLM verifica; según el autor, la aceleración es de 2-5x con tasas de aceptación del 60-80 % en texto de dominio (teología, código, persona). Útil para reducir coste por token en serving.
- **Enrutador de peticiones previo a un LLM**: clasifica la entrada en dominios (código, teología, emocional, identidad) en menos de 1 ms según el autor, y deriva a un modelo especializado o a una caché de respuestas canónicas, evitando invocar el modelo grande en casos triviales.
- **Asistente de dominio en Raspberry Pi sin GPU**: con modelos de 0,3-3 MB y consumo declarado de 5-15 W, permite respuestas de FAQ o persona fija en un dispositivo ARM64 con memoria muy limitada.
- **Cache de identidad y persona**: respuestas canónicas sobre "quién eres" resueltas sin llamar a un LLM, reduciendo latencia y coste en asistentes conversacionales con personalidad fija.
- **Filtrado y guardarraíles de bajo coste**: clasificación previa de consultas para bloquear o redirigir entradas antes de alcanzar APIs de pago, ejecutable en el mismo nodo de aplicación sin acelerador.
- **Prototipado rápido de modelos de dominio en CI**: el pipeline de destilación permite regenerar un `.rpi` desde un profesor pequeño dentro de un flujo de integración, útil para iterar sobre vocabularios y patrones específicos.
- **Investigación y docencia sobre atención alternativa**: sirve como banco de pruebas reproducible para estudiar enrutado por permutaciones y atención basada en latencia de caché, incluido el port a arquitecturas antiguas (POWER8, G4, N64).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible: no hay MMLU, HumanEval, GSM8K ni ninguna otra evaluación de calidad. Las únicas cifras existentes son métricas de rendimiento declaradas por el autor, sin verificación independiente:

| Metrica | Valor declarado por el autor | Verificacion independiente |
|---|---|---|
| Throughput "table lookup" en Python | 18.000 tok/s | no disponible |
| Throughput del motor C en POWER8 con VSX | 84+ tok/s | no disponible |
| Tamano del modelo | 0,3-3 MB | no disponible |
| Consumo | 5-15 W (CPU) frente a 200-400 W (GPU) | no disponible |
| Tasa de aceptacion como motor de borrador | 60-80 % en texto de dominio | no disponible |
| Aceleracion sobre LLM solo | 2-5x | no disponible |
| Latencia de clasificacion de entrada | < 1 ms | no disponible |
| Multiplicaciones por token | 0 (por diseño) | no verificable sin el código |

## Requisitos de hardware

- VRAM estimada para inferencia: 0 GB. El motor no usa GPU ni coma flotante; el autor declara que funciona con jerarquía de caché de CPU.
- RAM estimada: no disponible con precisión; coherente con modelos de 0,3-3 MB, el espacio residente sería de unos pocos MB más el binario del motor.
- GPU recomendadas: ninguna. El diseño excluye explícitamente la ruta GPU/GEMM.
- Cabe en hardware de consumo y embebido: Raspberry Pi (ARM64), x86 convencional, POWER8 y, según el autor, hasta G4 y N64.
- Opciones de despliegue: compilación con `make` (detección automática de plataforma), `make test` para generar un modelo de prueba, y el binario `./rpi-cli`. Herramientas Python para construcción (`tools/build_rpi_from_bigrams.py`) y destilación (`tools/distill_to_rpi.py`).
- No se documenta integración con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: solo las cifras declaradas en la tabla anterior; la latencia de acceso a caché que el motor usa como puntuación es de ~1 ns (L1), ~5 ns (L2), ~12 ns (L3) y ~55 ns (DRAM) según la model card.

## Comparativa con modelos similares

| Criterio | RPI (elyanlabs/rpi-inference) | llama.cpp + GGUF | vLLM | Decodificacion especulativa (EAGLE/Medusa) |
|---|---|---|---|---|
| Enfoque | Permutaciones enteras + enrutado por latencia de cache | Transformer cuantizado en CPU/GPU | Serving GPU con PagedAttention | Modelo borrador + verificacion |
| Pesos publicados en el repo | No (solo codigo) | Si, multiples familias | No aplica | Si, cabezas/modelos borrador |
| Parametros | no disponible | Depende del modelo | Depende del modelo | Depende del modelo |
| Longitud de contexto | no disponible | Depende del modelo | Depende del modelo | Depende del modelo |
| Licencia | AGPL-3.0 | MIT | Apache-2.0 | Variable segun implementacion |
| Hardware objetivo | CPU ARM64/POWER8/x86 sin GPU | CPU y GPU | GPU | GPU |
| Madurez y ecosistema | Incipiente: 0 descargas, 0 likes, repo de 0,0 GB | Amplio | Amplio | Amplio |
| Calidad de generacion medida | no disponible | Depende del modelo | Depende del modelo | Depende del modelo |

## Limitaciones y advertencias

- **No es un modelo, es un motor**: el repositorio no contiene pesos, ni pipeline, ni checkpoint utilizable directamente. Cualquier evaluación de calidad requiere construir el `.rpi` con las herramientas incluidas y un profesor, lo que no está documentado en detalle.
- **Cifras sin verificar**: los 18.000 tok/s en Python, los 84+ tok/s en POWER8, el 60-80 % de aceptación y los 2-5x de aceleración proceden únicamente de la model card. No hay benchmarks, scripts de evaluación ni resultados reproducibles publicados.
- **Ausencia total de evaluación de calidad**: no hay MMLU, HumanEval, GSM8K ni pruebas humanas, por lo que no puede afirmarse nada sobre la calidad del texto generado por un modelo `.rpi`.
- **Riesgo de alucinación**: al construirse desde estadísticas de bigramas o destilación opaca, no hay garantía de fidelidad factual ni mecanismo de citación; el material de ejemplo (`sophia.rpi`, dominio teológico) sugiere un uso de persona, no de recuperación fiable.
- **Licencia AGPL-3.0**: copyleft fuerte. Integrar el motor en un servicio de red puede obligar a liberar el código del servicio; conviene revisión legal antes de uso comercial o SaaS.
- **Idiomas no declarados**: no hay soporte multilingüe documentado; los estados de dominio y los ejemplos están en inglés.
- **Contexto no cuantificado**: el banco MEM se describe cualitativamente, sin ventana de tokens ni límites medidos, lo que impide planificar conversaciones largas.
- **Ecosistema prácticamente inexistente**: 0 descargas, 0 likes, repositorio creado y actualizado el mismo día, sin integraciones con servidores de inferencia estándar.
- **Trazabilidad dudosa**: la certificación "BCOS" la emite `rustchain.org`, un dominio externo sin relación conocida con estándares de seguridad del sector; el DOI de Zenodo no es verificable desde la información disponible.
- **Sin soporte en Hugging Face**: el propio autor indica que "nada de esto se ejecuta en la infraestructura de Hugging Face"; no hay Inference API ni Spaces.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/elyanlabs/rpi-inference
- Código fuente en GitHub: https://github.com/Scottcjn/rpi-inference
- Espejo en GitLab (con historial completo): https://gitlab.com/elyan-labs/rpi-inference
- DOI en Zenodo: https://doi.org/10.5281/zenodo.19271983
- Verificación del certificado BCOS: https://rustchain.org/bcos/verify/BCOS-be141bd4
- Insignia BCOS: https://rustchain.org/bcos/badge/BCOS-be141bd4.svg
- Licencia AGPL v3: https://www.gnu.org/licenses/agpl-3.0.html
