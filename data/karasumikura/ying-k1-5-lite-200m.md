# Karasumikura/Ying-K1.5-Lite-200M

## Resumen

Ying K1.5 Lite 200M es un modelo de lenguaje de 210,2 millones de parámetros desarrollado por Karasumikura, preentrenado desde cero con foco en chino y arquitectura propia denominada MM200. Se distribuye como modelo base (sin ajuste fino por instrucciones), por lo que su función es la continuación de texto y no la conversación asistida: no existe todavía ninguna versión SFT de la generación K1.5. La versión previa de la familia, Ying K1 Lite 200M, sí contaba con un ajuste de instrucciones, pero sus pesos no son reutilizables como post-entrenamiento de K1.5.

La relevancia del modelo está en su escala reducida (0,4 GB de repositorio, 16 capas, hidden de 768) y en el esfuerzo de ingeniería que acompaña al lanzamiento: adaptador estándar para `AutoModel`/`AutoTokenizer`, runtime propio con caché KV, decodificación en streaming y decodificación por grafos, además de un informe de optimización con mediciones A/B sobre la generación anterior. Frente a K1, el preentrenamiento pasa de 14,92 B a 24,07 B de tokens (+61 %), con una segunda fase de continuación de 9,14 B de tokens sobre el checkpoint de la primera.

El contexto de entrenamiento es de 8192 tokens con ventana deslizante de 1024, la licencia es Apache 2.0 y los idiomas declarados son chino e inglés. Es un modelo pensado para experimentación en entornos con recursos limitados, no para uso como asistente en producción sin un post-entrenamiento previo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso, familia MM200 (16 capas, hidden 768, GQA 3:1 con 12 cabezas de consulta y 4 de KV, gated attention y QK-norm) |
| Parametros totales | 210.210.560 (210,2 M) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 8192 tokens de entrenamiento, ventana deslizante de 1024 |
| Tipos de cuantizacion | no disponible (la model card solo documenta bfloat16 y fp16 para inferencia) |
| Idiomas soportados | chino (zh) e inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (195 tensores, 420,4 MB); código Python adicional `mm200_hf.py`, `modeling_mm200.py`, `mm200_runtime.py` |

## Arquitectura y entrenamiento

El modelo es un transformer denso de 16 capas con dimensión oculta de 768, `head_dim` de 64 y vocabulario de 16.006 tokens. La atención usa GQA con proporción 3:1 (12 cabezas de consulta, 4 de KV), incorpora compuertas en la atención (`gate_proj`) y QK-norm. La normalización es RowNorm con centrado en cero, materializada como `weight` estándar durante la exportación. El entrenamiento se realizó con contexto de 8192 tokens y ventana deslizante de 1024.

El preentrenamiento consta de dos fases: 90.000 pasos con 14,92 B de tokens y una continuación de 1.205 pasos con 9,14 B de tokens adicionales, sumando 91.205 pasos y 24,07 B de tokens. Los datos son mayoritariamente chinos (se cita Ultra-FineWeb-zh entre las fuentes). El hardware empleado fueron 8 GPU MTT S4000 con stack MUSA. En la exportación se eliminó la cabeza MTP y se comparó tensor a tensor con `base_step90000`, detectando diferencias de hasta 0,70 en `blocks.0.attn.gate_proj`, lo que confirma que la continuación modificó los pesos. No se documenta RLHF, DPO ni ninguna fase de alineación.

La innovación técnica más destacable del paquete es el runtime con caché KV incluido en el repositorio, con decodificación por grafos CUDA, tabla RoPE reutilizada, buffer de historial de tamaño fijo y eliminación de sincronizaciones implícitas de GPU por token. Las mediciones A/B de estas optimizaciones se realizaron sobre el modelo anterior Ying-K1 (misma arquitectura) en una T4, y el autor indica que se revalidarán sobre K1.5.

## Capacidades

- Generación y continuación de texto en chino e inglés; es un modelo base, no un asistente conversacional.
- Razonamiento de sentido común limitado: en las pruebas de continuación del autor, responde de forma coherente al inicio pero deriva con frecuencia.
- Capacidad de código y matemáticas reducida y en retroceso respecto a K1: la perplejidad por token empeora un 6,1 % en código y un 5,3 % en matemáticas.
- Mejora en inglés: la perplejidad por token baja un 2,6 % frente a K1, con 6 de 8 segmentos mejores.
- No soporta tool calling ni function calling de forma nativa; no hay formato de herramientas documentado.
- No soporta agentes ni razonamiento multi-paso de forma fiable; no hay modo thinking ni cadena de pensamiento entrenada.
- No tiene visión, audio ni modalidad distinta de texto.
- El formato de chat `<|user|>...<|assistant|>...<|im_end|>` existe y los tokens especiales están verificados como tokens únicos (15932, 16001, 16002), pero el modelo base no lo ha visto en entrenamiento y no debe usarse directamente.
- Interfaz estándar `AutoModelForCausalLM` y `AutoTokenizer` con `trust_remote_code=True`, más un runtime propio con caché KV, streaming y decodificación por grafos.

## Casos de uso

- Investigación de preentrenamiento a pequeña escala: sirve como banco de pruebas reproducible para estudiar dinámicas de continuación de preentrenamiento (14,92 B a 24,07 B de tokens) con un coste de cómputo bajo y pesos de 420 MB.
- Experimentos de tokenización y arquitectura: el vocabulario de 16.006 tokens, la atención GQA 3:1 y RowNorm permiten comparar variantes arquitectónicas en una sola GPU consumer sin infraestructura dedicada.
- Base para ajuste fino por instrucciones: al ser un modelo base con licencia Apache 2.0 y soporte estándar de `transformers`, es un punto de partida viable para un SFT propio en chino, con el formato de chat ya definido y tokens especiales verificados.
- Evaluación de runtimes de inferencia: el repositorio incluye `mm200_runtime.py` con caché KV, streaming y decodificación por grafos, lo que permite reproducir y auditar las optimizaciones documentadas (de 21,6 ms a 7,2 ms por token en la generación anterior) en una T4 o en CPU.
- Generación de texto en chino para tareas de autocompletado o expansión de texto sin requisitos de instrucción: con prompts de continuación y decodificación greedy o muestreada, encaja en pipelines de aumento de datos o generación de borradores.
- Pruebas de regresión de software de inferencia: la verificación de equivalencia semántica del runtime (`max|Δlogit| = 0.00000`, argmax 100 %) lo convierte en un caso de prueba útil para validar implementaciones de atención, RoPE y caché KV.
- Docencia y demostraciones de LLM: el tamaño reducido permite ejecutar el modelo completo en CPU en bfloat16 y explicar el ciclo de preentrenamiento, exportación y decodificación con código incluido en el repositorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor únicamente reporta perplejidad por token (NLL) en una comparación interna con Ying K1 sobre 8 segmentos por dominio, con intervalos de confianza al 95 %:

| Dominio | K1 (NLL/token) | K1.5 (NLL/token) | Variación | IC 95 % | Segmentos |
|---|---|---|---|---|---|
| Código | 1,4818 | 1,5722 | +6,1 % (peor) | ±0,076 (significativo) | 7/8 peores |
| Inglés | 1,8846 | 1,8352 | −2,6 % (mejor) | ±0,032 (significativo) | 6/8 mejores |
| Matemáticas | 2,2728 | 2,3922 | +5,3 % (peor) | ±0,115 (limítrofe) | 6/8 peores |

Las cifras de latencia y throughput documentadas corresponden a Ying-K1 (misma arquitectura) en una T4 y no a K1.5: 21,6 ms a 7,2 ms por token de decodificación, 46,3 a 139,2 tok/s de throughput por petición y 1,05 s de TTFT en servicio en streaming. El autor indica que revalidará estas cifras sobre K1.5.

## Requisitos de hardware

- VRAM estimada para inferencia: unos 0,42 GB en bfloat16 o fp16 (195 tensores, 420,4 MB), más el overhead de activaciones y caché KV, que es despreciable a esta escala.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de memoria libre; el autor midió en una T4. También es viable en CPU en bfloat16, advirtiendo que hay que fijar `torch.set_default_dtype(torch.bfloat16)` antes de construir el modelo para evitar que los parámetros se creen en fp32 y provoquen OOM en máquinas pequeñas.
- Cabe en cualquier GPU consumer actual (RTX 3060, 4060, 4090, etc.) y en iGPU con suficiente memoria compartida.
- Opciones de despliegue: `transformers` estándar con `trust_remote_code=True` (funciona pero sin caché KV, recalculando toda la secuencia por token), o el runtime incluido `mm200_runtime.py` con caché KV, streaming y decodificación por grafos. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: en la generación anterior y en T4, 7,2 ms por token con el runtime optimizado frente a 21,6 ms en eager (3,00× de mejora); 139,2 tok/s por petición y 1,05 s de TTFT en servicio en streaming. Para prompts de más de 1024 tokens (fuera de la ventana deslizante) el modo eager rinde 24,3 ms por token.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| Ying K1.5 Lite 200M | 210,2 M | 8192 (ventana 1024) | zh, en | Apache 2.0 | Base, sin SFT; runtime propio con caché KV |
| Ying K1 Lite 200M | 210,2 M | 8192 (ventana 1024) | zh, en | Apache 2.0 | Generación anterior; sí tiene SFT (90.000 instrucciones en chino); sin `AutoModel` estándar |
| Alternativas de ~200 M tipo GPT-2 small / Pythia-160M | no disponible en la información proporcionada | no disponible | en principalmente | variable | No se dispone de datos comparativos verificados en esta ficha |

No se dispone de comparaciones de rendimiento con modelos de terceros en la información proporcionada; los únicos datos cuantitativos son internos frente a Ying K1.

## Limitaciones y advertencias

- No es un modelo de instrucciones: no sigue órdenes ni mantiene conversaciones. Usarlo con el formato de chat sin SFT previo produce resultados deficientes, según advierte el propio autor.
- Riesgo alto de alucinación y de deriva en continuaciones largas: en las pruebas del autor, el modelo responde correctamente al inicio de un razonamiento pero concluye con afirmaciones falsas (por ejemplo, "será ahogado por el agua" en un silogismo).
- Regresión medida frente a K1 en código (+6,1 % de NLL por token) y matemáticas (+5,3 %), con 7/8 y 6/8 segmentos peores respectivamente. La mejora en inglés (−2,6 %) no compensa el deterioro en dominios técnicos.
- Cobertura lingüística limitada a chino e inglés; no hay evidencia de calidad en castellano ni en otras lenguas.
- Contexto efectivo de 1024 tokens por ventana deslizante, aunque el entrenamiento use 8192; los prompts largos requieren el runtime propio para no degradarse o fallar en modo eager.
- La licencia Apache 2.0 permite uso comercial, pero al no existir versión SFT ni evaluación de seguridad, cualquier despliegue en producción exige un post-entrenamiento y una evaluación propios.
- No se documentan sesgos específicos ni evaluaciones de seguridad; al entrenarse principalmente con datos web chinos, es esperable un sesgo cultural y lingüístico hacia ese dominio.
- El soporte de cuantización no está documentado; no hay pesos GGUF ni recetas de cuantización publicadas.
- Las cifras de rendimiento del repositorio corresponden a la generación anterior (K1) y están pendientes de revalidación sobre K1.5.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Karasumikura/Ying-K1.5-Lite-200M
- Modelo base declarado: https://huggingface.co/Karasumikura/Ying-K1.5-Lite-200M-base
- Generación anterior con SFT: https://huggingface.co/Karasumikura/Ying-K1-Lite-0.2B
- No se han encontrado en la información proporcionada papers, blogs, repositorios adicionales ni demos fuera de Hugging Face.
