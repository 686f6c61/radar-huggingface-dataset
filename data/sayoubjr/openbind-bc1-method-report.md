# sayoubjr/openbind-bc1-method-report

## Resumen

`sayoubjr/openbind-bc1-method-report` no es un modelo de IA en el sentido habitual, sino el informe metodológico publicado en Hugging Face por el participante `poserank_rc` para el OpenBind Blind Challenge 1, una competición de predicción de poses de unión (structure prediction) sobre la proteasa NS2B-NS3 del virus Zika con 400 compuestos. El repositorio contiene únicamente documentación del método, no pesos ni código ejecutable.

El enfoque combina cuatro generadores independientes de poses (docking físico con OpenEye OMEGA/FRED, dos modelos de co-folding —Boltz-2 v2.2.1 y ESMFold2— y plantillas restringidas por MCS a partir de ligandos holo públicos). Las poses se agrupan en "unidades" de modo de unión y se ordenan por fusión de rangos recíprocos (RRF, K=60) sobre el número de poses y el número de generadores independientes que las respaldan, sin usar puntuaciones de docking ni energías.

La relevancia del documento es metodológica: describe una estrategia de consenso y enrutado por tamaño de ligando validada sobre 152 compuestos de desarrollo, con una tasa bruta de 0,507 y 0,545 tras post-estratificación, frente a 0,585 medida en el conjunto ciego. No se entrenó ni ajustó ningún modelo; los co-folding se usan tal cual se publicaron.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica: no es un modelo entrenado, sino un pipeline de generación y selección de poses (docking + co-folding + plantillas) |
| Parametros totales | No disponible (no se publican pesos) |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | No disponible (no se liberan pesos; solo informe en Markdown) |

## Arquitectura y entrenamiento

El pipeline no entrena ningún modelo. Genera poses con cuatro fuentes: docking OpenEye OMEGA/FRED (1000 poses por ligando, ~91% del pool), co-folding con Boltz-2 v2.2.1 (25 muestras por ligando, sembradas con el complejo holo público no vinculado más cercano como plantilla y bolsillo), co-folding con ESMFold2 (muestras por ligando a partir de SMILES, superpuestas al mismo marco del receptor) y plantillas reconstruidas como conformeros restringidos por MCS en su propio marco cristalino. Se descartan las poses fuera del sitio activo.

Cada pose se relaja en disolvente implícito GBn2 (ff14SB + OpenFF 2.2.1) contra el receptor fijo y se puntúa con un potencial interatómico de aprendizaje automático. Las poses se agrupan en unidades de (colocación, modo de interacción, volteo de anillo), con corte de colocación a 2 Å RMSD; un compuesto típico produce ~45 unidades a partir de ~120 poses válidas. Las unidades se ordenan mediante RRF (K=60) sobre el número de poses de la unidad y el número de generadores distintos que aportan una pose. La pose enviada es el medoide de la unidad mejor clasificada, calculado sobre RMSD de átomos pesados con consciencia de automorfismos. Una regla de enrutado por tamaño (pre-registrada) envía ligandos pequeños a la rama de colocación de ESMFold2 y los grandes a la rama de consenso. La pose final pasa un filtro PoseBusters antes de la exportación.

## Capacidades

- Predicción de poses de unión proteína-ligando en un receptor fijo (Zika NS2B-NS3, referencia 29HN).
- Generación de conformeros de ligando con OpenEye OMEGA y docking con FRED.
- Co-folding proteína-ligando con Boltz-2 v2.2.1 y ESMFold2.
- Construcción de plantillas restringidas por MCS a partir de ligandos holo públicos del PDB.
- Agrupamiento de poses en unidades de modo de unión y selección por consenso (RRF) en lugar de por puntuación energética.
- Relajación en disolvente implícito GBn2 y puntuación con potencial interatómico de aprendizaje automático.
- Validación geométrica con PoseBusters 0.6.5 y métricas oficiales (BiSyRMSD < 1,5 Å, lDDT-PLI > 0,8).
- Enrutado condicional por tamaño de ligando (rama ESMFold2 frente a rama de consenso).

## Casos de uso

- Evaluación de estrategias de consenso en competiciones de docking ciego: el informe documenta cómo combinar generadores heterogéneos y ordenar por apoyo independiente en lugar de por energía, replicable en otros retos de structure prediction.
- Diseño de pipelines de selección de poses para dianas con bolsillo alostérico ocupado: la exclusión de poses fuera del sitio activo (cristales P4(3)22 cerrados con I156) es un patrón aplicable a dianas similares.
- Validación estadística de reglas de enrutado: el uso de bootstrap pareado con corrección de Holm sobre 152 compuestos sirve como plantilla para comparar variantes de pipeline con rigor.
- Integración de co-folding como generador adicional en flujos de descubrimiento temprano: Boltz-2 y ESMFold2 se usan como fuentes de diversidad de poses, no como predictor único.
- Control de calidad geométrico en producción: el filtro PoseBusters y las métricas oficiales (BiSyRMSD, lDDT-PLI) son un esquema de aceptación reutilizable antes de enviar poses a validación experimental.
- Análisis de celdas débiles por tamaño y similitud de plantilla: el informe cuantifica el fallo en fragmentos (0,302) y en baja similitud de plantilla (0,308), útil para decidir cuándo un pipeline de este tipo no es fiable.
- Reproducción metodológica en entornos académicos: todo el stack salvo OpenEye es open source (OpenMM, OpenFF, RDKit, spyrmsd, Boltz, ESM), lo que permite reconstruir el flujo con licencias libres.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| Tasa bruta en desarrollo (152 compuestos puntuables) | 0,507 |
| Tasa post-estratificada (composición del conjunto ciego) | 0,545 |
| Tasa medida en el conjunto ciego | 0,585 |
| Router frente a consenso solo (diferencia ponderada) | +0,0242, IC 95% [+0,0060, +0,0423], p = 0,014 |
| Fragmentos (ligandos pequeños) | 0,302 |
| Compuestos lead-like | 0,616 |
| Baja similitud de plantilla (Tanimoto < 0,5) | 0,308 |

Criterios oficiales de puntuación: BiSyRMSD < 1,5 Å, lDDT-PLI > 0,8 y todas las comprobaciones PoseBusters superadas (OpenStructure 2.12.0, PoseBusters 0.6.5).

## Requisitos de hardware

- Co-folding en una única GPU L40S; el resto del pipeline (preparación, docking, ensamblaje, relajación y puntuación) se ejecutó en CPU de un clúster universitario local.
- No se realizó entrenamiento a gran escala, por lo que no se requieren GPUs de entrenamiento (A100/H100) para replicar el método.
- VRAM estimada para inferencia: no disponible en el informe.
- Opciones de despliegue: no aplica como modelo servible; el pipeline usa Python 3.12, OpenMM 8.4.0, OpenFF Toolkit 0.18.1, OpenFF Interchange 0.5.5, openmmforcefields 0.15.1, RDKit 2025.09.6, spyrmsd 0.9.0, Boltz 2.2.1, ESM 3.4.1 y OpenEye toolkits 2024.2.1.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Criterio | Este método (OpenBind BC1) | Boltz-2 v2.2.1 (usado como componente) | ESMFold2 (usado como componente) |
|---|---|---|---|
| Tipo | Pipeline de consenso (docking + co-folding + plantillas) | Co-folding proteína-ligando | Co-folding proteína-ligando |
| Pesos liberados | No | Sí (uso tal cual, según el informe) | Sí (uso tal cual, según el informe) |
| Código liberado | No | No disponible en el informe | No disponible en el informe |
| Licencia | No disponible | No disponible en el informe | No disponible en el informe |
| Contexto / parámetros | No aplica | No disponible en el informe | No disponible en el informe |
| Rendimiento en el reto | 0,585 en ciego; 0,545 post-estratificado en desarrollo | No reportado de forma aislada en el informe | No reportado de forma aislada en el informe |

No se dispone de datos de benchmarks de alternativas comparables dentro de la información proporcionada.

## Limitaciones y advertencias

- Los ligandos pequeños son la celda débil: 0,302 en fragmentos frente a 0,616 en lead-like; el enrutado reduce la brecha pero no la cierra, y a menudo la pose correcta está en el pool pero no se selecciona.
- La baja similitud de plantilla (Tanimoto < 0,5) es la segunda celda débil (0,308) y la menos determinada estadísticamente, pese a tener el mayor peso en la composición del conjunto ciego.
- El orden de unidades no es completamente determinista: los empates en la puntuación de fusión se resuelven por orden de clasificación, afectando a aproximadamente un cuarto de las llamadas.
- La relajación no restringe la quiralidad: se invirtió un estereocentro en 4 de 2725 candidatos relajados durante el desarrollo, afectando a una pose enviada.
- El re-puntuado con metadinámica de pose de unión y con la energía de interacción de aprendizaje automático no superó la selección geométrica en desarrollo.
- El código no se libera y los pesos no se publican; el repositorio solo contiene el informe.
- Se usó software comercial con licencia (OpenEye toolkits 2024.2.1), lo que condiciona la reproducibilidad con herramientas exclusivamente open source.
- No se declaran sesgos ni datos propietarios; solo se emplearon entradas públicas del PDB y los activos del reto.
- No hay paper asociado ni resultados de benchmarks generales del pipeline fuera del reto.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/sayoubjr/openbind-bc1-method-report
- OpenBind Blind Challenge 1: no disponible en la información proporcionada.
- Paper del método: no disponible (el autor declara que no hay paper).
- Código fuente: no disponible (el autor declara que no se libera).
- Pesos: no disponibles (el autor declara que no se liberan).
