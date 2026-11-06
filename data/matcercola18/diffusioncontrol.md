# matCercola18/DiffusionControl

## Resumen

DiffusionControl es una colección de checkpoints de modelos de difusión condicional entrenados para generar controladores realimentados certificados en sistemas de control. El autor es matCercola18 y el proyecto se distribuye a través de Hugging Face junto con el código, los protocolos y los resultados alojados en el repositorio de GitHub `matCercola18/matte_server`, rama `icml-experiments`, bajo el directorio `DiffusionControl/`. No se trata de un modelo de lenguaje: es un conjunto de generadores de difusión que producen trayectorias y ganancias de control para plantas como el péndulo Furuta (QUBE-Servo 2), un péndulo simple, sistemas SISO tipo Lur'e, sistemas MIMO 2x2 y el problema de Witsenhausen.

El repositorio ocupa 76,7 GB e incluye únicamente checkpoints finales, organizados por familias (Furuta, péndulo, Lur'e, MIMO, CVAE baseline, Witsenhausen) y por rondas de experimentación. La arquitectura principal es una U-Net 1D condicional para el generador de trayectorias del Furuta, acompañada de "gemelos de regresión" (MLP) usados como ablación y de variantes condicionadas por fricción, headroom de tensión y modelos unificados de hardware. La licencia es "other", sin que la model card concrete los términos.

La relevancia del proyecto es de nicho: se enmarca en la intersección entre modelos generativos y síntesis de controladores con garantías, un área de investigación activa (ICML, según la rama del repositorio). Los checkpoints están pensados para reproducir experimentos, no para uso como servicio general, y requieren el código del repositorio para cargarse y evaluarse. No hay información pública sobre benchmarks estándar de lenguaje ni sobre idiomas, y la fecha de creación indicada (2026-10-02) es posterior a la fecha actual, lo que conviene tratar con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | U-Net 1D condicional (generador de trayectorias); MLP para gemelos de regresión y ablaciones; CVAE como baseline |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; condicionamiento por planta y estado, no por texto) |
| Tipos de cuantizacion | no disponible (checkpoints en `.pth`, sin versiones cuantizadas publicadas) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | other (términos no especificados en la model card) |
| Formato de pesos | `.pth` (PyTorch); datasets auxiliares en `.npz` y `.pt` |

## Arquitectura y entrenamiento

El núcleo del proyecto es un generador de difusión condicional implementado como U-Net 1D que produce trayectorias de control (y, en la variante `rig1wg`, también la programación de ganancias TVLQR `K(t)` en una U-Net de 5 canales). El condicionamiento se realiza sobre parámetros de la planta: en la familia Furuta v5 se condiciona por fricción (mp, Lp, Dr, Dp, Coulomb Cr, Cp), en F2 por headroom de tensión (Vref) y en F3 por un modelo unificado de hardware de 7 dimensiones que combina fricción y Vref. Las familias de péndulo incluyen variantes multi-solución, physics-informed (`pg_*`) y ablaciones; la familia MIMO inestable incluye modelos de estado completo (MLP y asinh) y de realimentación de salida (BMI, `sof*`, `c3*`), con escalados m=2 a 5 y bancos de 1k, 3k, 8k y 16k plantas. Los gemelos de regresión (`reg_*`) sirven como contraste determinista frente al generador de difusión.

El entrenamiento se realizó sobre bancos de plantas generados (por ejemplo, `furuta_nmpc_bank_v5merged.npz`, `furuta_bank_f3.npz`) y datasets de trayectorias (`furuta_traj_dataset_v5.pt`), con recetas que varían en número de pasos (6.000, 8.000, 24.000, 40.000, 96.000), número de semillas (típicamente 3) y tamaño de lote (incluye una receta batch-256 de 24.000 pasos para verificar equivalencia con la receta D3 de 96.000). Algunos checkpoints se ajustaron finamente sobre la unidad física medida del QUBE-Servo 2 (inercia del brazo, ganancia del motor y muelle del cable identificados en el banco, con `qube_params_rig1.json`). No se documentan en la información disponible detalles sobre el proceso de difusión (número de pasos de muestreo, scheduler, función de pérdida) ni sobre el uso de RLHF/DPO, que no aplica a este dominio.

## Capacidades

- Generación de trayectorias de control condicionadas por parámetros de la planta (fricción, headroom de tensión, inercia, longitud).
- Generación de controladores realimentados con certificación (el proyecto habla de "certified feedback controllers").
- Generación de programaciones de ganancias TVLQR `K(t)` en la variante `qube_rig1wg` (U-Net de 5 canales).
- Modelado multi-solución para el péndulo (varias soluciones válidas por condición).
- Generación physics-informed (`pg_*`) y ablaciones controladas para estudiar el efecto de componentes del modelo.
- Realimentación de salida para sistemas MIMO inestables (variantes `sof*`, `c3*`) con escalado a m=2..5.
- Gemelos de regresión deterministas para comparar contra el generador de difusión.
- Robustez frente a incertidumbre de planta: el modelo `rig1` captura 16/16 plantas en un banco de ±10 % en mp y Lp; `rig1wg` captura 6/6.
- No soporta tool calling, agentes, razonamiento multi-paso en lenguaje natural, visión, audio ni capacidades multilingües: no es un modelo de lenguaje.

## Casos de uso

- Síntesis de controladores para el QUBE-Servo 2 en laboratorio: cargar `qube_rig1/rig1_s6000.pth` tras `snapshot_download` y generar controladores para un banco de plantas en torno a la unidad medida, con una tasa de captura documentada de 16/16 en ±10 % de mp y Lp.
- Control robusto con incertidumbre de fricción: usar la familia Furuta v5 (`round2/furuta_v5/v5_s{0,1,2}_s96000.pth`) condicionada por los seis parámetros de fricción para generar controladores que toleren variaciones de Dr, Dp, Cr y Cp.
- Control con restricciones de tensión: emplear la familia F2 (`round2/furuta_f2/f2_s*_s8000.pth`) condicionada por Vref para generar controladores que respeten el headroom de tensión del actuador.
- Modelo unificado de hardware: usar F3 (`round2/furuta_f3/f3_s{0,1,2}_s24000.pth`), condicionado por 7 dimensiones (fricción + Vref), como sustituto de las familias separadas en despliegues con ambas fuentes de incertidumbre.
- Re-síntesis en línea: emplear los logs de `data/round2/furuta_resynth_b2/` y el modelo F3 para re-sintetizar controladores durante la operación (documentado en `furuta_online_resynthesis.md` §B2).
- Control de sistemas MIMO inestables con realimentación de salida: usar la receta final D3 (`round2/mimo_sof_scaling_full/d3f{m}{n}_{diff,reg}_s*_s96000.pth`) para m=2..5 con bancos de 8k plantas (16k para m=4).
- Reproducción de experimentos académicos: cargar los checkpoints junto con los datasets `.npz`/`.pt` y los documentos de `DiffusionControl/docs/` para replicar los resultados de ICML.
- Estudio de métodos generativos frente a regresión: comparar `*_diff_*` con `*_reg_*` en las mismas condiciones para evaluar la ventaja de la difusión en síntesis de controladores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible en el formato habitual (MMLU, HumanEval, GSM8K). Los únicos resultados cuantitativos documentados son de captura en banco de plantas:

| Modelo | Banco de plantas | Resultado |
|---|---|---|
| `qube_rig1/rig1_s6000.pth` | 2000 plantas, mp y Lp ±10 % | 16/16 capturadas (TVLQR de seguimiento computado) |
| `qube_rig1w/rig1w_s6000.pth` | mp y Lp ±30 % (masa añadida / otro péndulo) | no ejecutado |
| `qube_rig1wg/rig1wg_s8000.pth` | banco con salida de K(t) | 6/6 capturadas |

No se dispone de cifras de MMLU, HumanEval, GSM8K ni de métricas de control agregadas (coste, tiempo de establecimiento, márgenes) en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio completo ocupa 76,7 GB, pero el tamaño de cada checkpoint individual no se detalla; al ser U-Nets 1D y MLP, es probable que quepan en GPU de consumo, aunque no se confirma.
- GPU recomendadas: no disponible. Para entrenamiento y evaluación de bancos grandes (8k–16k plantas) se recomienda GPU con suficiente memoria para lotes grandes, pero no hay cifras publicadas.
- ¿Cabe en consumer GPU? No confirmado; por la naturaleza de los modelos (U-Net 1D, MLP) es plausible en RTX 3090/4090, pero no hay dato.
- Opciones de despliegue: carga directa con PyTorch (`torch.load` sobre `.pth`) usando el código del repositorio `matCercola18/matte_server`; descarga vía `huggingface_hub.snapshot_download`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de difusión para síntesis de controladores certificados con los que contrastar parámetros, contexto, rendimiento o licencia. Las alternativas internas del propio proyecto (gemelos de regresión `reg_*` y baselines CVAE `Best_cvae_*`) sirven como comparación metodológica, no como modelos externos.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, código ni respuestas conversacionales; cualquier uso fuera del dominio de control es inadecuado.
- Licencia "other" sin términos concretos en la model card: es necesario contactar con el autor o revisar el repositorio antes de cualquier uso comercial.
- Los checkpoints dependen del código del repositorio `matCercola18/matte_server` (rama `icml-experiments`) para cargarse y evaluarse; no son autónomos.
- Los archivos de la ronda 2 no conservan las rutas del repositorio, por lo que los loaders deben apuntarse explícitamente; un error de ruta produce fallos silenciosos o carga de checkpoints equivocados.
- Algunos checkpoints están documentados como resultados negativos (`Best_nonlinear_cond_popov_L_sector/_closedloop/_distill`) y no deben usarse como controladores válidos.
- `qube_armprov/armprov_s6000.pth` es provisional y está superado por el modelo identificado; no usar en producción.
- `qube_rig1w` no se ha ejecutado en hardware, por lo que su validez empírica no está confirmada.
- El rendimiento está acotado al banco de plantas y a la unidad física identificada; la extrapolación a otras plantas o a hardware distinto no está garantizada.
- La fecha de creación indicada (2026-10-02) es posterior a la fecha actual, lo que sugiere un posible error de metadatos; conviene verificar la integridad del repositorio antes de confiar en él.
- No hay información sobre sesgos, alucinación o limitaciones idiomáticas porque no aplican al dominio, pero sí hay riesgo de generar controladores que fallen fuera del banco de entrenamiento (problema de generalización OOD, documentado en `ood_shift.md`).

## Enlaces

- Hugging Face: https://huggingface.co/matCercola18/DiffusionControl
- Repositorio de código: `matCercola18/matte_server`, rama `icml-experiments`, directorio `DiffusionControl/` (no se proporciona URL directa en la información disponible)
- Documentación interna: `DiffusionControl/docs/` (incluye `furuta_generated_trajectory_v4.md`, `furuta_friction_hardware_ready.md`, `furuta_robustness.md`, `mimo_unstable_family.md`, `physics_informed_generation.md`, `ablations.md`, `ood_shift.md`, `witsenhausen.md`, `qube_hardware_report.md`, `furuta_online_resynthesis.md`, `RESULTS.md`)
- Paper: no disponible en la información proporcionada (se menciona ICML en el nombre de la rama, sin enlace)
