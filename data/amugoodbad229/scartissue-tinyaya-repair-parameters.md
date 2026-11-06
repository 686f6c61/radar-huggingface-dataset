# amugoodbad229/scartissue-tinyaya-repair-parameters

## Resumen

ScarTissue no es un modelo, sino un repositorio de deltas de parámetros (factores `.npz`) extraídos de `CohereLabs/tiny-aya-global` en la revisión `af89d219b53ed9b13b8a4645f9c8028973510`. Lo desarrolla el usuario `amugoodbad229` y su propósito es documentar y permitir reproducir una edición en el espacio de pesos orientada a seguridad: se extrae la dirección de rechazo del modelo base, se aplica una "abliteración" (ortogonalización de matrices de escritura `o_proj`/`down_proj` contra esa dirección en la capa 15) y se ofrecen cuatro soportes de reparación de rango uno para recuperar parte del comportamiento de rechazo perdido.

El artefacto no rehostea pesos: contiene solo los factores y un `manifest.json` con hashes SHA-256, nombres de módulos, índices de columnas y el parámetro α. Se aplican sobre una copia local del modelo base mediante el cargador `load_patch.py` incluido en el repo. El interés es metodológico: ilustra un flujo completo de edición en espacio de pesos con validación previa (`validate`, `preflight`), aplicación transaccional con snapshot para rollback y rechazo explícito si la revisión base no coincide.

La relevancia es acotada y experimental. El propio autor advierte que los resultados son exploratorios, que el panel de tres jueces falló su auditoría de calibración (especificidad 0,984, sensibilidad 0,580 sobre 500 filas de Aegis) y que nada de esto constituye una certificación de seguridad. La licencia del modelo base (LSAL §2/§4, uso solo de investigación) condiciona por completo el uso de estos deltas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (deltas aplicables a `CohereLabs/tiny-aya-global`) |
| Parámetros totales | no disponible (el modelo base no se especifica en la información) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | la del modelo base: LSAL §2/§4, uso solo de investigación, sin hosting de producto ni publicación/despliegue de checkpoints derivados |
| Formato de pesos | factores `.npz` (deltas de parámetros) más `manifest.json`; no se rehostean pesos del modelo |

## Arquitectura y entrenamiento

El repositorio no entrena un modelo: produce operadores de edición sobre los pesos de `tiny-aya-global`. La abliteración se implementa ortogonalizando cada matriz de escritura `o_proj`/`down_proj` contra la dirección de rechazo `d` en la capa 15, afectando a 962.592.768 escalares. Sobre ese modelo derivado ("drift") se construyen cuatro soportes de reparación de rango uno con α = 4: soporte completo de escritura (`repair_global_a4`, 962.592.768 escalares), soporte ponderado por daño al 10 % (`repair_harm10_a4`, 96.259.276), al 4 % (`repair_harm4_a4`, 38.503.680) y al 2 % (`repair_harm2_a4`, 19.251.200).

El cargador `load_patch.py` expone `validate()` (comprueba factores finitos, dirección unitaria y columnas en rango), `preflight()` (verifica cada módulo y columna objetivo antes de mutar nada) y `apply_many()` (aplica por una única ruta de código con snapshot para rollback). No escribe fuera de los módulos declarados, rechaza valores no finitos y rechaza aplicar un factor cuya revisión base no sea la de extracción. No se documentan datos de entrenamiento, composición del dataset ni técnicas de RLHF/DPO porque no hay entrenamiento implicado.

## Capacidades

- Edición determinista en espacio de pesos sobre `tiny-aya-global`: ortogonalización de matrices de escritura contra una dirección de rechazo en la capa 15.
- Aplicación selectiva por soporte: cuatro variantes con distinto porcentaje de soporte (100 %, 10 %, 4 %, 2 %) y α fijo de 4.
- Validación y preflight previos a la mutación, con comprobación de revisión base y de valores finitos.
- Aplicación transaccional con snapshot para rollback.
- Trazabilidad mediante `manifest.json` (SHA-256 por fichero, nombres de módulos, índices de columnas, α).
- No incluye generación de texto, tool calling, agentes, visión ni audio por sí mismo; esas capacidades dependen exclusivamente del modelo base sobre el que se aplican los deltas.

## Casos de uso

- Investigación en seguridad de modelos: medir cómo varía la tasa de éxito de ataques dañinos (harm-ASR) al aplicar la abliteración y distintas reparaciones sobre un mismo modelo base, con el protocolo de 120 prompts dañinos y 40 benignos documentado.
- Reproducción de experimentos de edición en espacio de pesos: el `manifest.json` y los ficheros `.npz` permiten reconstruir exactamente cada brazo del estudio sin redistribuir checkpoints.
- Estudio del compromiso entre rechazo y sobre-rechazo: comparar `repair_harm2_a4` (harm-ASR 0,050, sobre-rechazo 0,175) frente a `repair_global_a4` (0,042 y 0,275) para caracterizar el coste del soporte.
- Auditoría metodológica de paneles de jueces: el dataset de resultados incluye 3.864 filas de veredictos de tres jueces sobre 1.280 respuestas, útil para estudiar fallos de calibración (sensibilidad 0,580) en evaluaciones automáticas de seguridad.
- Análisis de degradación de capacidad inducida por edición: medir la caída en GSM8K (0,590 base, 0,560 drift, 0,518 `repair_harm2_a4`, 0,438 `repair_global_a4`) como función del soporte editado.
- Desarrollo de herramientas de parcheo seguro: reutilizar `validate`/`preflight`/`apply_many` como patrón de aplicación transaccional de deltas con verificación de revisión base en pipelines propios de edición de modelos.

## Benchmarks y rendimiento

Medido por el autor sobre 120 prompts dañinos y 40 benignos con un panel fijado de tres jueces, y GSM8K vía lm-eval:

| Brazo | harm-ASR (mayoría de 3) | Sobre-rechazo benigno | GSM8K |
|---|---:|---:|---:|
| base | 0,058 | 0,075 | 0,590 |
| drift (abliterado) | 0,217 | 0,050 | 0,560 |
| `repair_harm2_a4` | 0,050 | 0,175 | 0,518 |
| `repair_global_a4` | 0,042 | 0,275 | 0,438 |

El autor califica estos resultados de exploratorios: el panel de jueces falló la auditoría de calibración (especificidad 0,984, sensibilidad 0,580 sobre 500 filas de Aegis) y el render de calibración dejó vacío el slot `[BEHAVIOR]` de HarmBench. El compromiso se replica en 160 prompts reservados, pero no constituye certificación de seguridad. No se han publicado otros benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; depende del modelo base `CohereLabs/tiny-aya-global`, cuyos parámetros no se detallan en la información.
- GPU recomendadas: no disponible por la misma razón.
- Viabilidad en GPU de consumo: no disponible.
- Opciones de despliegue: no disponible para el modelo; los deltas se aplican con el cargador `load_patch.py` del repositorio sobre una copia local del modelo base en PyTorch.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Aspecto | ScarTissue (deltas para tiny-aya-global) | Checkpoint abliterado convencional | Modelo base sin editar |
|---|---|---|---|
| Naturaleza | Deltas `.npz` + manifiesto | Pesos completos modificados | Pesos completos originales |
| Distribución | Solo parámetros de edición | Checkpoint completo | Checkpoint completo |
| Licencia | LSAL del base (solo investigación) | Sujeta a la del base, con la restricción de no publicar derivados | LSAL, solo investigación |
| Reversibilidad | Snapshot y rollback en el cargador | Requiere conservar el original | N/A |
| Verificación de revisión base | Sí, rechaza si no coincide | Habitualmente no | N/A |
| Métricas de seguridad | harm-ASR y sobre-rechazo documentados con panel no calibrado | Variable según autor | harm-ASR 0,058, sobre-rechazo 0,075 |

No se dispone de datos de otros modelos comparables de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Los resultados son exploratorios y el panel de jueces no superó la auditoría de calibración (sensibilidad 0,580); no constituyen certificación de seguridad.
- El render de calibración dejó vacío el slot `[BEHAVIOR]` de HarmBench, lo que compromete la validez de esa parte de la evaluación.
- Las reparaciones recuperan rechazo a costa de sobre-rechazo dependiente del soporte: de 0,075 (base) a 0,175 (`harm2`) o 0,275 (`global`).
- La capacidad medida en GSM8K cae con la edición: de 0,590 (base) a 0,438 (`repair_global_a4`).
- Licencia restrictiva: LSAL §2/§4, solo investigación, sin hosting de producto y sin publicar ni desplegar checkpoints derivados; la publicación como parámetros en lugar de checkpoint es deliberada.
- Los deltas solo son aplicables a la revisión exacta `af89d219b53ed9b13b8a4645f9c8028973510`; el cargador rechaza otras revisiones.
- No se documentan sesgos, idiomas soportados ni comportamiento multilingüe de los deltas; dependen del modelo base.
- Riesgo de alucinación: no evaluado en la información disponible.
- Cero descargas y cero likes en el momento de la consulta; sin validación externa por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/amugoodbad229/scartissue-tinyaya-repair-parameters
- Dataset de resultados: https://huggingface.co/datasets/amugoodbad229/scartissue-tinyaya-results
- Dataset de parches: https://huggingface.co/datasets/amugoodbad229/scartissue-tinyaya-repair-patches
- Modelo base: `CohereLabs/tiny-aya-global` (revisión `af89d219b53ed9b13b8a4645f9c8028973510`)
