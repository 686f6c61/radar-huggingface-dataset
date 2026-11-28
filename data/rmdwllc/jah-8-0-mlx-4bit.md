# RMDWLLC/Jah-8.0-MLX-4bit

## Resumen

Jah 8.0 MLX 4-Bit es una cuantizacion compacta de 4 bits para Apple Silicon del modelo Jah 8.0, desarrollado por RMDW LLC (Georgia). Se distribuye como un build de 14 GB en disco/RAM (4,656 bits por peso, tamano de grupo 64) obtenido directamente del maestro BF16 congelado, y esta pensado para MacBook Pro, Mac Mini y Mac Studio con 24 GB o mas de memoria unificada. El modelo es multimodal (texto e imagen) y esta orientado a ciberseguridad, generacion de codigo y flujos agenticos.

La arquitectura es un transformer con mezcla de expertos (MoE), segun las etiquetas del repositorio, con 26.388.641.280 parametros totales registrados en los safetensors. Declara una longitud de contexto nativa de hasta 1.048.576 tokens, soporte nativo de tool calling y endpoints compatibles con Anthropic `/v1/messages` y OpenAI `/v1/chat/completions`. Se acompana de un drafter especulativo opcional (`RMDWLLC/Jah-8.0-MLX-MTP`, 397 MB) para decodificacion especulativa.

Su relevancia actual radica en ofrecer un modelo de gran contexto y capacidades agenticas ejecutable localmente en hardware de consumo Apple, con licencia Apache 2.0 y una API compatible con Claude Code sin proxy intermedio. Las cifras de rendimiento publicadas (56-61 tok/s en un solo flujo y 94,2 tok/s agregados con lote de 4) estan verificadas por el autor en un Apple M5 Ultra de 512 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), segun etiquetas del repositorio |
| Parametros totales | 26.388.641.280 |
| Parametros activos | no disponible |
| Longitud de contexto | Hasta 1.048.576 tokens (nativa) |
| Tipos de cuantizacion | 4 bits MLX (4,656 bpw, group size 64); existen variantes BF16, NVFP4 y MLX 8-bit del mismo modelo base |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX); libreria mlx |

## Arquitectura y entrenamiento

El modelo base Jah 8.0 emplea una arquitectura transformer con mezcla de expertos (MoE), aunque la model card no detalla el numero de expertos, la proporcion de parametros activos ni la composicion del dataset de entrenamiento. Esta version concreta es una cuantizacion de 4 bits realizada directamente desde el maestro BF16 congelado, con 4,656 bits por peso y tamano de grupo 64, e incluye un drafter especulativo extraido por separado (`Jah-8.0-MLX-MTP`, 397 MB) para decodificacion especulativa.

La model card no documenta el numero de tokens de entrenamiento, la mezcla de datos ni si se aplicaron tecnicas de RLHF o DPO. Si se mencionan capacidades de inferencia destacables: decodificacion especulativa con `dflash`, cache de prefijos (APC) y batching continuo nativo, ademas de endpoints compatibles con las APIs de Anthropic y OpenAI.

## Capacidades

- Generacion de texto y razonamiento general.
- Generacion y edicion de codigo, con evaluacion en tareas de ingenieria de software reales (repositorios Python y PRs multiarchivo en Go).
- Capacidades de vision: pipeline `image-text-to-text` (entrada de imagen y texto).
- Tool calling / function calling nativo.
- Flujos agenticos y razonamiento multi-paso (hasta 30 turnos en las evaluaciones publicadas).
- Contexto largo de hasta 1.048.576 tokens.
- Especializacion en ciberseguridad: forense de BEC/ATO en M365, IAM en cloud y Kubernetes.
- Soporte de decodificacion especulativa mediante drafter MTP.
- Compatibilidad directa con Claude Code y con APIs estilo Anthropic y OpenAI.
- Idiomas: unicamente ingles.

## Casos de uso

- Asistente de codigo local en Mac: el modelo puede integrarse en editores o en Claude Code mediante `ANTHROPIC_BASE_URL` apuntando al servidor local, aprovechando sus 131.072 tokens de contexto configurados en el ejemplo y el tool calling nativo para leer y modificar repositorios.
- Analisis forense de correo y cuentas comprometidas: su evaluacion en BEC/ATO de M365 (9/10 en el subconjunto publicado) lo hace adecuado para triaje de incidentes y correlacion de evidencias en entornos con datos sensibles que no deben salir del dispositivo.
- Auditoria de IAM y Kubernetes: con resultados de 10/10 en el subconjunto de IAM cloud y Kubernetes, puede revisar politicas, roles y manifiestos para detectar configuraciones inseguras.
- Agente de reparacion de tests en CI: en las pruebas publicadas resuelve tareas de SWE en Python con `pytest` en vivo (11/24) y PRs multiarchivo en Go con `go test` (5/20), por lo que encaja en pipelines de correccion automatizada de fallos acotados.
- Procesamiento de documentos con imagen: al ser `image-text-to-text`, puede extraer y razonar sobre capturas, diagramas o documentos escaneados en flujos locales.
- Despliegue soberano on-prem: RMDW LLC ofrece API dedicada privada y despliegues on-prem, adecuados para organizaciones que requieren que los datos no abandonen su infraestructura.
- Prototipado agentico en estaciones de trabajo Apple: con 94,2 tok/s agregados en lote de 4 y batching continuo, sirve para equipos pequenos que necesitan un endpoint local compatible con OpenAI/Anthropic.

## Benchmarks y rendimiento

Resultados deterministas (`temp=0.0`) del maestro BF16 publicados por el autor en holdouts verificados:

| Benchmark | Muestra | Base sin entrenar | Jah 8.0 FINAL (BF16) | Delta |
|---|---:|---:|---:|---:|
| Ciberseguridad no vista (`seed=999999`) | 40 | 19/40 (47,5%) | 36/40 (90,0%) | +42,5 pts |
| Forense BEC/ATO M365 (subconjunto) | 10 | 2/10 (20,0%) | 9/10 (90,0%) | +70,0 pts |
| IAM cloud y Kubernetes (subconjunto) | 10 | 6/10 (60,0%) | 10/10 (100,0%) | +40,0 pts |
| Vault publico de terceros HARD | 66 | 35/66 (53,0%) | 44/66 (66,7%) | +13,7 pts |
| SWE Python en GitHub no visto (30 turnos, `pytest` en vivo) | 24 | N/A | 11/24 (45,8%) | `Textualize/rich` 5/8 (62,5%) |
| PRs multiarchivo Go de 200K lineas (30 turnos, `go test` en vivo) | 20 | 1/20 (5,0%) | 5/20 (25,0%) | x5,0 |

Rendimiento en Apple M5 Ultra 512 GB: 56-61 tok/s en un solo flujo y 94,2 tok/s agregados con lote concurrente de 4. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- Memoria unificada: 24 GB o mas (recomendado 24-36 GB para MacBook, Mac Mini y Mac Studio).
- Huella en disco/RAM: 14 GB (4,656 bpw) mas 397 MB opcionales del drafter.
- Hardware verificado: Apple M5 Ultra de 512 GB; no se han publicado mediciones en otros chips.
- No esta pensado para GPU NVIDIA/AMD: es un build MLX para Apple Silicon. Para otras plataformas existen variantes BF16 (~50 GB) y NVFP4 (19,53 GB).
- Despliegue: `mlx-vlm` 0.8.1 o superior mediante `python -m mlx_vlm.server`, con cache de prefijos (`APC_ENABLED=1`), decodificacion especulativa (`--draft-kind dflash`) y `--max-num-seqs 8`.
- Latencia y throughput: 56-61 tok/s por flujo y 94,2 tok/s agregados con lote de 4 en M5 Ultra.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Jah 8.0 MLX 4-bit | 26,4 B | 1.048.576 | MLX 4-bit (14 GB) | Apache 2.0 | Build compacto para Apple Silicon |
| Jah 8.0 MLX 8-bit | 26,4 B | 1.048.576 | MLX 8-bit (26 GB) | Apache 2.0 | Mayor precision, requiere 48 GB+ |
| Jah 8.0 NVFP4 | 26,4 B | 1.048.576 | NVFP4 (19,53 GB) | Apache 2.0 | Orientado a GPU NVIDIA |
| Jah 8.0 BF16 | 26,4 B | 1.048.576 | BF16 (~50 GB) | Apache 2.0 | Maestro de referencia |

No se dispone de datos de benchmarks comparativos frente a modelos de terceros en la informacion proporcionada.

## Limitaciones y advertencias

- Solo soporta ingles; no se ha documentado cobertura multilingue.
- Las cifras de benchmarks proceden del autor y se midieron sobre el maestro BF16, no sobre esta cuantizacion de 4 bits, por lo que el rendimiento real puede diferir.
- No se documentan sesgos conocidos ni tasas de alucinacion; al ser un modelo especializado en ciberseguridad y codigo, conviene validar sus salidas en produccion.
- El contexto maximo de 1.048.576 tokens es una cifra declarada; en la practica, la memoria unificada del Mac limita la longitud efectiva.
- La licencia Apache 2.0 permite uso comercial, pero no se detallan restricciones adicionales sobre los datos de entrenamiento.
- El repositorio registra 0 descargas y 0 likes, y fue creado en noviembre de 2026; la adopcion y validacion externa son practicamente nulas.
- Es exclusivo de Apple Silicon (MLX); no se ejecuta en CUDA ni en CPU convencional sin conversion.
- No se han publicado parametros activos ni detalles de la MoE, lo que dificulta estimar costes de inferencia en otros entornos.

## Enlaces

- Hugging Face (esta version): https://huggingface.co/RMDWLLC/Jah-8.0-MLX-4bit
- Maestro BF16: https://huggingface.co/RMDWLLC/Jah-8.0
- Variante NVFP4: https://huggingface.co/RMDWLLC/Jah-8.0-NVFP4
- Variante MLX 8-bit: https://huggingface.co/RMDWLLC/Jah-8.0-MLX-8bit
- Drafter especulativo MTP: https://huggingface.co/RMDWLLC/Jah-8.0-MLX-MTP
- API privada: https://rmdw.ai/jah-api
- Sitio del autor: https://rmdw.ai
- Sitio secundario: https://kiyomibot.ai
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Recibos de evaluacion: `JAH8_EVAL_RECEIPT.json` (incluido en el repositorio)
