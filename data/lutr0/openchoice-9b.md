# Lutr0/OpenChoice-9B

## Resumen

OpenChoice-9B es un modelo de decisión (clasificación zero-shot) desarrollado por Lutr0, obtenido mediante un fine-tuning con LoRA de rango 16 sobre la base `Qwen/Qwen3.5-9B` (8.953.803.264 parámetros). No es un modelo generativo: en lugar de producir texto, devuelve directamente probabilidades para tres tipos de salida —`Choice` (elección entre etiquetas), `Score` (puntuación sobre un criterio) y `Noul` (sin elección)—, lo que lo sitúa en la categoría de "decision models" o clasificadores instruidos.

Su propuesta diferencial es la ejecución CPU-first: el paquete distribuye los pesos fusionados y cuantizados en GGUF Q4_K_M (5,24 GiB / 5,63 GB decimales) más un proyector de visión Q8_0 (595 MiB), lo que suma aproximadamente 5,8 GiB de pesos en servicio y requiere 6–7 GiB de RAM, sin GPU obligatoria. Incluye además un kit de fine-tuning LoRA con exportación de vuelta al mismo servidor GGUF (probado en una GPU de 24 GB) y un servidor HTTP compatible con el formato de cable `POST /v1/systemone` del SDK TypeSafe 0.6.

Es relevante ahora porque cubre un nicho poco atendido —decisiones estructuradas con etiquetas y reglas propias, entradas largas de hasta 32.768 tokens por decisión y capacidad multimodal opcional— en un formato desplegable en contenedor de 353 MiB sin CUDA, Torch ni toolchain de compilación. Ahora bien, el propio autor advierte de que los resultados oficiales de JevBench v1.5.1 están pendientes y de que el modelo queda por detrás de Jev en todos los benchmarks agregados comparados, por lo que no debe interpretarse como un ranking de calidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (fine-tuning LoRA rango 16 sobre `Qwen/Qwen3.5-9B`); detalles internos del modelo base no disponibles en la información proporcionada |
| Parámetros totales | 8.953.803.264 (≈8,95 B) |
| Parámetros activos | No aplica: no se describe como MoE en la información disponible |
| Longitud de contexto | 4.096 tokens por forward; 32.768 tokens por decisión |
| Tipos de cuantización | GGUF Q4_K_M (modelo de lenguaje) y Q8_0 (proyector de visión) |
| Idiomas soportados | Inglés (`en`) únicamente |
| Licencia | CC-BY-SA-4.0 |
| Formato de pesos | GGUF (paquete servible); safetensors en el repositorio (adaptador LoRA de entrenamiento retenido y pesos del base) |
| Tamaño del repositorio | 6,4 GB |
| Pesos en servicio | ≈5,8 GiB (5,24 GiB texto + 595 MiB proyector) |
| RAM recomendada | 6–7 GiB (ejecución en CPU) |
| Pipeline declarado | `zero-shot-classification` |
| Salidas | Probabilidades para `Choice`, `Score` y `Noul` (no genera texto) |
| Idiomas del dataset de entrenamiento | No disponibles con detalle; los datasets citados son en inglés |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen3.5-9B` y aplica un adaptador LoRA de rango 16, posteriormente fusionado en los pesos del base y cuantizado a GGUF Q4_K_M. La innovación principal no está en la arquitectura del transformer subyacente, sino en la interfaz de decisión: el modelo no decodifica texto libre, sino que devuelve distribuciones de probabilidad sobre etiquetas (`Choice`), sobre criterios graduados (`Score`) y una opción de abstención (`Noul`). El paquete añade un proyector de visión cuantizado a Q8_0, lo que habilita decisiones sobre gráficos e imágenes a través del motor Python en CPU; la API HTTP, en cambio, es solo texto.

Los datos de entrenamiento citados en la model card son `nvidia/Aegis-AI-Content-Safety-Dataset-2.0`, `google/boolq`, `nvidia/HelpSteer2` y `stanfordnlp/snli`. No se especifica el número de tokens, la composición exacta del dataset, la mezcla de proporciones ni si se aplicaron etapas de RLHF o DPO. Tampoco se detalla la estrategia de atención ni técnicas de decodificación especulativa (no aplicables, al no ser un modelo generativo de texto). El aspecto técnico más relevante para producción es la cadena LoRA → GGUF: el kit permite reentrenar con etiquetas y reglas propias y exportar de vuelta al mismo servidor, sin cambiar el runtime.

## Capacidades

- Clasificación zero-shot con etiquetas arbitrarias definidas por el usuario (`Choice`), sin reentrenamiento previo.
- Puntuación sobre criterios graduados (`Score`), útil para severidad, calidad o cumplimiento.
- Abstención explícita mediante la opción `Noul`, que permite al sistema declinar cuando ninguna etiqueta encaja.
- Entradas largas: 4.096 tokens por forward y hasta 32.768 tokens por decisión.
- Decisiones sobre gráficos e imágenes mediante el proyector de visión Q8_0, ejecutables en CPU con el motor Python.
- Fine-tuning con LoRA sobre etiquetas y "house rules" propias, con exportación al mismo formato GGUF servible.
- Servidor compatible con el formato de cable `POST /v1/systemone` del SDK TypeSafe 0.6 (OpenChoice es independiente de TypeSafe; no es una implementación de Jev ni se reclama paridad).
- Ejecución en contenedor Docker Linux/amd64 sin CUDA, Torch, PEFT, bitsandbytes ni toolchain de compilación.
- No soporta tool calling, function calling ni razonamiento multi-paso en el sentido de los modelos generativos; no se documentan capacidades de agente.
- No es multilingüe: solo inglés.
- No genera explicaciones ni texto de respuesta; para eso el autor recomienda usar un modelo generativo.

## Casos de uso

- Enrutamiento de tickets de soporte: clasificar el mensaje entrante en categorías como facturación, incidencias técnicas o consultas de cuenta mediante `Choice`, con la ventaja de que el modelo devuelve probabilidades calibradas en lugar de texto parseable, lo que simplifica la lógica de umbrales y el fallback a revisión humana.
- Triaje de seguridad de contenido: usando `nvidia/Aegis-AI-Content-Safety-Dataset-2.0` como parte del entrenamiento, el modelo puede puntuar severidad de contenido con `Score` y abstenerse (`Noul`) en casos ambiguos, integrándose en pipelines de moderación previos a la publicación.
- Detección de duplicados y reclamaciones de pago: el ejemplo oficial de la model card muestra la clasificación de una queja por cargo duplicado con criterios de tema y severidad, un patrón directamente reutilizable en sistemas de disputas o atención al cliente financiera.
- Verificación de afirmaciones contra contexto (NLI): dado el entrenamiento sobre `stanfordnlp/snli`, puede emplearse para etiquetar relaciones de implicación, contradicción o neutralidad entre un documento y una afirmación, como filtro en pipelines de RAG antes de mostrar una respuesta.
- Respuestas de sí/no con contexto (BoolQ): validación de preguntas booleanas sobre documentación técnica o bases de conocimiento, con salida probabilística que permite fijar umbrales de confianza por dominio.
- Evaluación de calidad de respuestas generadas: usando `nvidia/HelpSteer2`, el modelo puede puntuar salidas de otro LLM (ayuda, corrección, coherencia) como juez ligero en CPU, reduciendo el coste frente a un juez generativo.
- Lectura de gráficos en entornos sin GPU: el motor Python con el proyector de visión permite decisiones sobre charts (por ejemplo, tendencia o comparación entre series) en un portátil o servidor sin acelerador.
- Clasificación en el borde (edge) o en entornos air-gapped: con 6–7 GiB de RAM y un contenedor de 353 MiB sin dependencias CUDA, es desplegable en máquinas modestas y en redes aisladas.
- Ajuste por dominio con reglas propias: el kit LoRA permite adaptar las etiquetas a la política interna de una organización y reexportar al mismo servidor, manteniendo el mismo contrato de API.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Los resultados oficiales de JevBench v1.5.1 están pendientes según la propia model card, y no se aportan cifras de MMLU, HumanEval, GSM8K ni de precisión de clasificación para este modelo.

Como contexto, la model card cita composites de JevBench v1.5.1 de terceros, que no son resultados de OpenChoice:

| Modelo | Composite JevBench v1.5.1 citado |
|---|---|
| Jev | 72,1 |
| Winnow-12B | 73,2 |
| Cygnet | 73,7 |
| OpenChoice-9B | Pendiente (sin publicar) |

Datos de ejecución verificados por el autor (contenedor CPU, Linux/amd64): imagen de 353 MiB excluyendo pesos, arranque hasta `health` en 7,39 s en un escritorio Ryzen compartido con caché de sistema caliente, y 34 casos de humo del SDK superados. La diferencia máxima absoluta de probabilidad entre la variante CPU portable (GCC 14.2, `GGML_NATIVE=OFF`) y la nativa (`GGML_NATIVE=ON`, GCC 16.2) fue de 0,0012598 en el ejemplo probado: no hay ejecución bit a bit idéntica.

## Requisitos de hardware

- RAM: 6–7 GiB para inferencia en CPU; el autor recomienda 16 GiB de sistema y al menos 12 GiB asignados a Docker Desktop (no es un mínimo probado).
- Pesos servibles: ≈5,8 GiB (5,24 GiB del texto en Q4_K_M + 595 MiB del proyector Q8_0); descarga completa ≈6,0 GiB incluyendo tokenizer y adaptador retenido.
- VRAM estimada para inferencia en GPU: no disponible; la descarga de GPU es opcional y el autor no publica cifras de VRAM. Para el kit de fine-tuning LoRA se indica una GPU de 24 GB (modelo concreto no especificado).
- GPU recomendadas: no disponibles. No se distribuye variante de contenedor con CUDA ni soporte Apple Metal.
- ¿Cabe en GPU de consumo? El modelo está diseñado para CPU; el desvío a GPU es opcional. No hay datos publicados de qué GPU de consumo lo soporta.
- Despliegue: runtime GGUF propio del proyecto (imagen `ghcr.io/lutr0/openchoice:0.2.0-cpu`, construible desde el repositorio), servidor HTTP con `POST /v1/systemone`, motor Python para decisiones sobre gráficos. No se menciona soporte para vLLM ni TGI; llama.cpp es el formato subyacente (GGUF) pero no se documenta una receta específica.
- Latencia: arranque hasta `health` de 7,39 s en amd64 con caché caliente. No se publican cifras de throughput ni de latencia por petición; en la emulación arm64 bajo QEMU, las ejecuciones completas del SDK superaron el timeout de 180 s por petición.
- Contenedor: ejecuta como UID 10001 no root, escucha en `0.0.0.0` internamente y exige `OPENCHOICE_API_KEY`; debe publicarse solo el puerto de loopback.

## Comparativa con modelos similares

| Modelo | Categoría | Parámetros | Contexto | Licencia | Estado de benchmarks | Notas |
|---|---|---|---|---|---|---|
| OpenChoice-9B | Decisión multimodal, CPU-first | 8,95 B | 32.768 tokens por decisión | CC-BY-SA-4.0 | JevBench v1.5.1 pendiente | Pesos GGUF Q4_K_M, kit LoRA, API TypeSafe-compatible |
| Laya | Encoder pequeño para routing | No disponible | No disponible | No disponible | No disponible | Recomendado por el autor para routing de texto corto y para multilingüe |
| GLiNER2.5-Decide | Encoder pequeño de decisión | No disponible | No disponible | No disponible | No disponible | Alternativa de huella mínima en cualquier portátil |
| JevK5 v0.3 | Modelo de decisión GGUF | No disponible | No disponible | No disponible | JevBench v1.5.1 publicado | Recomendado si se busca el GGUF más pequeño con score publicado |
| Plumb-4B | Modelo de decisión, 4 B | 4 B (aprox.) | No disponible | No disponible | JevBench v1.5.1 publicado | Menor tamaño que OpenChoice, con score oficial disponible |
| Jev / Cygnet / Winnow-12B | Modelos de decisión de mayor precisión | Winnow-12B: 12 B (aprox.) | No disponible | No disponible | Composites 72,1 / 73,7 / 73,2 | El autor recomienda estos para mayor precisión publicada |

No se dispone de datos de parámetros, contexto ni licencia de Laya, GLiNER2.5-Decide, JevK5 ni Plumb-4B en la información proporcionada.

## Limitaciones y advertencias

- Solo inglés (`language: [en]`); no apto para clasificación en castellano u otros idiomas sin reentrenamiento.
- No genera texto ni explicaciones: si se necesita justificar la decisión, hay que usar un modelo generativo aparte.
- Resultados oficiales de JevBench v1.5.1 pendientes: no hay evidencia publicada de calidad frente a alternativas, y el autor reconoce que OpenChoice queda por detrás de Jev en todos los benchmarks agregados comparados.
- La API HTTP es solo de texto; las decisiones sobre gráficos requieren el motor Python en CPU.
- Licencia CC-BY-SA-4.0: permite uso comercial, pero impone compartir bajo la misma licencia las obras derivadas; conviene revisar el impacto en productos propietarios y en la redistribución de pesos ajustados.
- Sin soporte Metal/Apple Silicon nativo verificado: arm64 solo se construyó y probó bajo emulación QEMU, con timeouts de 180 s superados en las ejecuciones completas del SDK.
- Sin variante de contenedor CUDA: el desvío a GPU no está empaquetado de forma oficial.
- El contenedor escucha en `0.0.0.0` y requiere clave de API obligatoria; una mala configuración de puertos expone el servicio.
- No es una implementación de Jev ni se reclama paridad con él; la compatibilidad se limita al formato de cable TypeSafe 0.6.
- Riesgo de alucinación estructuralmente distinto al de un LLM (no inventa texto), pero la calibración de las probabilidades y el comportamiento ante etiquetas fuera de distribución no están documentados.
- Sesgos: no se documentan análisis de sesgo; los datasets de origen (Aegis, BoolQ, HelpSteer2, SNLI) pueden introducir sesgos propios de su dominio y de su idioma.
- Fallos de robustez conocidos: diferencias numéricas de hasta 0,0012598 entre variantes de compilación, lo que desaconseja comparar probabilidades entre despliegues distintos sin recalibrar.
- Estado del proyecto incipiente: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de adopción en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Lutr0/OpenChoice-9B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Repositorio fuente: https://github.com/lutr0/openchoice
- Imagen de contenedor: ghcr.io/lutr0/openchoice:0.2.0-cpu
- Resultados de verificación del contenedor: https://github.com/lutr0/openchoice/blob/main/results/container-verification.json
- Datasets citados:
  - https://huggingface.co/datasets/nvidia/Aegis-AI-Content-Safety-Dataset-2.0
  - https://huggingface.co/datasets/google/boolq
  - https://huggingface.co/datasets/nvidia/HelpSteer2
  - https://huggingface.co/datasets/stanfordnlp/snli
