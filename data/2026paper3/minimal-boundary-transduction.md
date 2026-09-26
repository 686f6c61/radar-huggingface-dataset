# 2026paper3/minimal-boundary-transduction

## Resumen

"Recurrence Carries the Length, Attention Counts It" es un artefacto de investigación anónimo asociado a una submission a ICLR 2027, publicado en HuggingFace bajo el identificador `2026paper3/minimal-boundary-transduction`. No es un modelo de lenguaje listo para inferencia, sino un paquete de reproducibilidad que contiene el código de la suite MBT (Minimal Boundary Transduction), los registros de 1.987 ejecuciones de entrenamiento, los inventarios y tablas que sustentan cada número del artículo, y los checkpoints de todos los runs. Su propósito es permitir la verificación y replicación de los resultados del paper durante el periodo de revisión.

El objeto de estudio son tareas sintéticas de "transducción de frontera" (Close, Verify, Open y sus variantes anidadas y con condicionamiento por identificador de contenido), diseñadas para medir generalización en longitud y profundidad bajo distribuciones fuera de dominio (Distance, Count, Count-Interp, Depth). Sobre ellas se comparan familias de arquitecturas: Mamba (SSM), Transformer con seis codificaciones posicionales distintas, LSTM, GRU, RNN, S4D y híbridos Mamba-atención con distintos patrones de bloques.

El repositorio tiene 9,6 GB, de los cuales 8,9 GB son pesos (`best.pt` y `last.pt` de cada run) y 200 MB son resultados, tablas y figuras. El código está bajo licencia MIT y los datos, runs y pesos bajo CC BY 4.0, agregados como `mit-and-cc-by-4.0`. No se proporcionan parámetros totales de los modelos, ni ventana de contexto en el sentido de un LLM, ni idiomas naturales soportados: el material es exclusivamente sintético y de investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Múltiples familias comparadas: Mamba (SSM), Transformer con seis codificaciones posicionales (learned, sinusoidal, RoPE, ALiBi, T5, NoPE) y variantes locales (ventana 32 / 128), LSTM, GRU, RNN, S4D, e híbridos Mamba-atención |
| Parametros totales | no disponible (la variante Mamba se documenta con d_model 128, 2 capas, estado 16, conv 4, expand 2; no se publica el recuento de parámetros) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible como ventana de LLM; las tareas sintéticas usan longitudes de apertura entrenadas y no entrenadas (7-9), longitud retenida 5, gap factor 12 y profundidad de anidamiento 3 |
| Tipos de cuantizacion | no disponible (no se publican pesos cuantizados; Mamba es PyTorch puro, sin kernels CUDA) |
| Idiomas soportados | no disponible (tareas sintéticas, sin texto en lenguaje natural) |
| Licencia | `mit-and-cc-by-4.0` (código MIT; resultados, runs y pesos CC BY 4.0) |
| Formato de pesos | PyTorch `.pt` (`best.pt` y `last.pt` por run) |

## Arquitectura y entrenamiento

La suite MBT instancia un conjunto de arquitecturas sobre tareas sintéticas de frontera. Incluye Mamba (state space model) y sus variantes `no_conv`, `res_pe`, `no_select` (lineal tiempo-invariante) y `sym_conv`; Transformer con codificación posicional aprendida por defecto y cinco alternativas (sinusoidal, RoPE, ALiBi, T5, NoPE) más dos configuraciones de atención local con ventana 32 y 128; modelos recurrentes clásicos (LSTM, GRU, RNN); S4D; e híbridos Mamba-atención definidos por patrón de bloques (por ejemplo `MAMA` para `attn_layers: [1, 3]` sobre 4 bloques).

El entrenamiento se organiza en "olas" de barrido (`w1_*`, `w15_*`, `w2_*`, `w3_*`, `w4_*`, `ray_*`), sumando 1.987 runs con su configuración, resultados, métricas, JSON de evaluación y log de entrenamiento. Cada run registra métricas de precisión global (`accuracy`, `final`) y precisión exacta excluyendo ítems con respuesta 0 (`closing accuracy`), además de una taxonomía de errores (`short close`, `no-stop`, `long close`, `inner-length match`) y métricas de patching (`teacher-forced exact`, `first-token margin`, `stop margin`). No se documentan en la información proporcionada el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO, ya que el material es sintético y generado por la propia suite.

## Capacidades

- Ejecución de tareas sintéticas de transducción de frontera en cuatro modos: Close (forma generativa), Verify (niveles 1 a 3, con `fence_mode: designator`), Open (respuesta de un token tras el contenido) y Open-K (condicionada por identificador de contenido, mezclas `joint` / `isolated`).
- Variantes anidadas Close-Nested y Verify-Nested para medir cierre bajo anidamiento.
- Evaluación de generalización fuera de distribución: distancia (`gap factor 12`), recuento (longitudes de apertura no entrenadas 7-9), interpolación de recuento (longitud retenida 5) y profundidad (anidamiento 3).
- Partición de la evaluación por segmentos: Prefix, Inner, Tail, Pad, Gaps y Full.
- Entrenamiento y evaluación reproducibles de siete familias de arquitectura bajo una misma interfaz.
- Análisis de patching con métricas de margen (`M_first`, `D_stop`) y de coincidencia exacta en modo teacher-forced.
- Puntuación de una cohorte retenida de ocho modelos LLM externos, con generaciones y scoring almacenados.
- Suite de tests que verifica la regla de frontera, los round-trips generador-parser, la sanidad de los modelos, los splits por eje y el patching.
- No soporta tool calling, function calling, agentes, multimodalidad, visión, audio ni razonamiento multi-paso en el sentido de un LLM de propósito general.

## Casos de uso

- Replicación del artículo: partiendo de `runs/` descomprimido, ejecutar en orden `analysis/cells_all.py`, `analysis/dissociation_table.py` y `analysis/paper_table1_dissociation.py` para reconstruir `cells.csv` y la Tabla 1 con sus intervalos de Wilson.
- Estudio de generalización en longitud: entrenar las variantes incluidas y medir la degradación entre `iid`, `ood_length`, `ood_ell` y `ood_ell_interp` para aislar el efecto de la recurrencia frente a la atención.
- Ablación de codificación posicional: comparar `learned`, `sinusoidal`, `rope`, `alibi`, `t5` y `none` sobre las mismas celdas del inventario de 604 entradas para cuantificar la contribución de cada esquema.
- Análisis de híbridos Mamba-atención: variar el patrón de bloques (por ejemplo `MAMA`, `MMAA`) y contrastar su comportamiento en las tareas de cierre anidado y en los ejes Prefix/Inner/Tail.
- Auditoría del inventario de resultados: cruzar `results/inventory/cells.csv` con `cited_cells.csv` (columna `cited_in`) para verificar que cada cifra citada en el paper corresponde a una celda concreta y a un run identificable.
- Evaluación comparativa contra LLM externos: usar `results/cohort/followup/` con las generaciones y el scoring de los ocho modelos retenidos para situar el rendimiento de las arquitecturas sintéticas frente a modelos de lenguaje.
- Docencia y formación en reproducibilidad: emplear los 1.987 runs con configuración, log y métricas como material de prácticas sobre diseño experimental, ablación y análisis estadístico de intervalos.
- Desarrollo de nuevas tareas de frontera: extender la suite `code/` (generadores de tareas, parser, modelo) para evaluar arquitecturas adicionales bajo la misma métrica de cierre seguro (`safe_close_rate`).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no reporta métricas estándar (MMLU, HumanEval, GSM8K u otras); sus tablas y cifras se refieren exclusivamente a las tareas sintéticas de la suite MBT, a las celdas del inventario y a la cohorte retenida de ocho LLM, cuyos valores concretos no se detallan en la información proporcionada.

## Requisitos de hardware

- Espacio en disco: 9,6 GB para el repositorio completo (8,9 GB de pesos, 200 MB de resultados, 14 MB de runs empaquetados que se expanden a 162 MB y 28.963 ficheros).
- Los pesos `best.pt` y `last.pt` corresponden a modelos pequeños (la variante Mamba usa d_model 128 y 2 capas), por lo que la inferencia individual cabe holgadamente en cualquier GPU de consumo; no se especifican requisitos de VRAM.
- GPU recomendadas: no disponible. Dado el tamaño de los checkpoints, no se requiere A100, H100 ni RTX 4090 para una sola ejecución; no obstante, la campaña completa de 1.987 runs puede requerir cómputo agregado considerable.
- Mamba está implementado en PyTorch puro, sin kernels CUDA, lo que permite ejecutarlo en CPU o GPU sin compilación específica.
- El flujo de entrenamiento requiere Python 3.10 o superior, `torch >= 2.0`, numpy, pyyaml y matplotlib.
- Opciones de despliegue y serving (vLLM, llama.cpp, Ollama, TGI) no son aplicables: no se distribuyen pesos en formato GGUF ni safetensors, sino checkpoints `.pt` de investigación.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

Comparativa interna entre las familias incluidas en la propia release, todas bajo la misma licencia CC BY 4.0 para pesos y evaluadas sobre las mismas tareas:

| Familia | Tipo | Configuración documentada | Codificación posicional | Pesos disponibles |
|---|---|---|---|---|
| Mamba | SSM selectivo | d_model 128, 2 capas, estado 16, conv 4, expand 2 | no aplica | sí (`best.pt`, `last.pt`) |
| Transformer | Atención completa | no disponible | learned (por defecto); sinusoidal, RoPE, ALiBi, T5, NoPE | sí |
| Transformer-Local | Atención local | ventana 32 o 128 | learned | sí |
| LSTM / GRU / RNN | Recurrente | no disponible | no aplica | sí |
| S4D | SSM diagonal | no disponible | no aplica | sí |
| Híbrido Mamba-atención | Mixto por bloques | patrón M/A (por ejemplo `MAMA`) | learned | sí |

No se proporcionan modelos externos equivalentes ni datos de rendimiento comparativo entre familias en la información disponible; la comparación cuantitativa queda en las tablas e inventarios del propio repositorio.

## Limitaciones y advertencias

- Material de investigación anónimo y congelado durante el periodo de revisión; no está pensado para uso en producción.
- Las tareas son sintéticas: no hay lenguaje natural, ni diálogo, ni generación de texto libre, por lo que no sirve como sustituto de un LLM.
- No se publican parámetros totales, ventana de contexto, idiomas ni cuantizaciones; cualquier integración real requeriría medir y documentar esos aspectos.
- Los pesos son checkpoints por run (`.pt`), no un modelo unificado: identificar cuál usar exige navegar el árbol de runs y entender la nomenclatura interna (`t2a`, `t2b`, `t2c`, `nest_t2a`, etc.) frente a los nombres del paper (Close, Verify, Open…).
- La correspondencia entre nombres internos del código y nombres del paper depende de `GLOSSARY.md`; un uso incorrecto puede llevar a interpretar mal las métricas (por ejemplo, `accuracy` frente a `closing accuracy`).
- El repositorio ocupa 9,6 GB y supera el límite de ficheros del Hub, por lo que los runs deben descomprimirse localmente (52 archivos `.tar.gz` → 28.963 ficheros) antes de ejecutar los scripts de análisis.
- Licencia dual: el código bajo MIT y los datos, runs y pesos bajo CC BY 4.0, que exige atribución; conviene revisar `LICENSE.md` antes de cualquier reutilización.
- Al tratarse de un release anónimo, no hay autor identificable, ni mantenimiento garantizado, ni canal de soporte; el repositorio puede quedar inactivo o desaparecer tras la revisión.
- No se han documentado sesgos ni tasas de alucinación porque el material no genera texto en lenguaje natural; la evaluación de errores se limita a la taxonomía de cierre (`short close`, `no-stop`, `long close`, `inner-length match`).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/2026paper3/minimal-boundary-transduction
- Repositorio anonimizado (espejo de `code/`): https://anonymous.4open.science/r/minimal-boundary-transduction-iclr-E180/
- Paper: no disponible (submission anónima a ICLR 2027, sin enlace público en la información proporcionada)
- Demo: no disponible
- Otros enlaces: no disponible
