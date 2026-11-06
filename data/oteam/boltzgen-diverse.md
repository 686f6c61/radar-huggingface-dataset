# oteam/boltzgen-diverse

## Resumen

BoltzGen es un modelo de difusión atomística para el diseño de binders proteicos y peptídicos, desarrollado originalmente por Hannes Stark, Felix Faltings y un amplio equipo de investigadores (MIT, Valtech AI y otras instituciones). Esta ficha corresponde a la variante `boltzgen-diverse`, una implementación no oficial publicada por el equipo OFoldX que expone de forma independiente el generador de estructuras del pipeline completo. El modelo genera simultáneamente secuencia y coordenadas atómicas mediante un denoiser EDM guiado por restricciones, y resuelve un problema clásico en biología computacional: proponer candidatos de unión contra una diana terapéutica concreta sin necesidad de cribado experimental masivo.

La arquitectura combina un trunk Pairformer reciclado (64 bloques Pairformer y 4 bloques MSA) con un denoiser de 24 bloques token, sumando 482,2 millones de parámetros en formato safetensors. A diferencia de los modelos de lenguaje, la entrada es estructural (archivos CIF) y la salida son candidatos con secuencia y geometría tridimensional, lo que la sitúa en la categoría de modelos generativos de proteínas más que en la de LLM.

Su relevancia actual radica en que forma parte del ecosistema BoltzGen, que cubre el flujo completo de diseño: generación de esqueletos, redesign por inverse folding (BoltzIF o SolubleMPNN), refolding con Boltz-2 y puntuación de afinidad. Esta variante concreta se centra en la diversidad de candidatos, lo que resulta útil en fases exploratorias donde interesa muestrear un espacio conformacional amplio antes de filtrar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusión atomística con trunk Pairformer reciclado (64 bloques Pairformer + 4 bloques MSA) y denoiser EDM de 24 bloques token |
| Parametros totales | 482.212.802 (482,2 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; entrada estructural, no textual) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo biológico, no lingüístico) |
| Licencia | AGPL-3.0 |
| Formato de pesos | safetensors |
| Tamaño del repositorio | 1,9 GB |
| Representación (dimensión) | 384 / 128 |
| Librería | ofoldx |
| Pipeline | other |

## Arquitectura y entrenamiento

BoltzGen es un modelo de difusión de átomos completos (all-atom) para el diseño de binders biomoleculares. Un Pairformer reciclado integra características de átomos, tokens, MSA, plantillas, contactos, sitio de unión y estructura secundaria; a continuación, un denoiser EDM genera de forma conjunta la secuencia y las coordenadas atómicas. Un modelo de inverse folding independiente (BoltzIF o SolubleMPNN) puede rediseñar la secuencia sobre el esqueleto generado. La variante `diverse` emplea la configuración completa de 64 bloques Pairformer, 4 bloques MSA y 24 bloques token, con una representación de 384/128 dimensiones.

El flujo completo del ecosistema BoltzGen incluye siete subpipelines: generadores de estructura `diverse` y `adherence`, inverse folders BoltzIF y SolubleMPNN, refolding y puntuación de afinidad con Boltz-2, y refolding con ESMFold2. La model card no detalla el número de tokens de entrenamiento ni la composición exacta del dataset, ni si se aplicaron etapas de RLHF o DPO (conceptos, por otra parte, propios de LLM y no directamente aplicables aquí). Tampoco se especifican innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación conjunta de secuencia y estructura tridimensional de binders proteicos y peptídicos mediante difusión atomística.
- Rediseño de secuencia sobre esqueletos fijos mediante inverse folding (BoltzIF o SolubleMPNN).
- Protocolos de diseño preconfigurados: `protein-anything`, `peptide-anything`, `protein-small_molecule`, `nanobody-anything`, `antibody-anything` y `protein-redesign`.
- Soporte de contexto fijo de ARN y ADN (no como segmentos generables).
- Puntuación de candidatos mediante refolding (Boltz-2 o ESMFold2) y métricas de análisis nombradas.
- Vistas de resultados: ranking estable, top-budget y selección por diversidad.
- Generación de múltiples candidatos por ejecución con control de semilla (`seed`).
- No soporta tool calling, function calling, agentes ni capacidades multilingües en el sentido convencional: es un modelo biológico, no un LLM.

## Casos de uso

- Diseño exploratorio de binders proteicos contra una diana terapéutica: se parte de la estructura de la diana en CIF, se ejecuta el protocolo `protein-anything` con `total_len` y `num_candidates` ajustados, y se obtiene un conjunto diverso de candidatos para priorizar experimentalmente.
- Diseño de péptidos de unión: con el protocolo `peptide-anything` se generan péptidos con longitud controlada, útiles en programas de modulación de interacciones proteína-proteína donde los anticuerpos no son viables.
- Rediseño de secuencia sobre esqueletos existentes: usando `inverse_fold()` se optimiza la secuencia de un backbone ya validado sin alterar su geometría, lo que permite humanizar o estabilizar candidatos.
- Diseño de nanobodies y anticuerpos: los protocolos `nanobody-anything` y `antibody-anything` permiten generar candidatos con las restricciones específicas de estas arquitecturas.
- Diseño de binders contra moléculas pequeñas: el protocolo `protein-small_molecule` emplea BoltzIF por defecto para el inverse folding, lo que lo hace adecuado en programas de descubrimiento frente a ligandos.
- Filtrado computacional previo a ensayos de laboratorio: la integración con refolding (Boltz-2) y la puntuación de afinidad permiten descartar candidatos inestables antes de sintetizarlos, reduciendo coste experimental.
- Análisis de diversidad en campañas de diseño: la variante `diverse` está pensada para muestrear un espacio amplio de soluciones, útil cuando se desconoce el modo de unión óptimo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; con 482,2 M de parámetros y pesos de 1,9 GB, la inferencia en precisión nativa requiere al menos unos pocos GB de VRAM, pero el consumo real depende del tamaño de la diana, el número de candidatos y el reciclado del Pairformer.
- GPU recomendadas: no disponible de forma explícita. Por tamaño del modelo, una GPU con 16-24 GB (RTX 4090, A5000, L4) debería ser suficiente para ejecuciones moderadas; para lotes grandes o dianas de gran tamaño se recomienda A100 o H100.
- Cabe en GPU de consumo: previsiblemente sí en GPUs con 16 GB o más, aunque no se confirma en la documentación.
- Opciones de despliegue: la vía oficial es la librería `ofoldx` (`pip install ofoldx`), con pipelines `design`, `design_backbones()` e `inverse_fold()`. No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|
| oteam/boltzgen-diverse | 482,2 M | Generador de estructuras (difusión all-atom) | AGPL-3.0 | Hugging Face (OFoldX) |
| oteam/boltzgen | no disponible | Pipeline completo BoltzGen (generadores + evaluación) | AGPL-3.0 | Hugging Face (OFoldX) |
| oteam/boltzgen-structure-small | 136,9 M | Generador Miniformer (12 bloques + 3 MSA) | AGPL-3.0 | Hugging Face (OFoldX) |
| oteam/boltzgen-inversefolding | 3,1 M | Inverse folding BoltzIF (6 encoder + 3 decoder) | AGPL-3.0 | Hugging Face (OFoldX) |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada. Como alternativas externas de la misma categoría (diseño generativo de proteínas) podrían citarse RFdiffusion o ProteinMPNN, pero no se aportan datos que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Implementación no oficial: la model card advierte explícitamente de que el equipo original de BoltzGen no la ha escrito ni validado; el repositorio oficial es `HannesStark/boltzgen`.
- Licencia AGPL-3.0: impone obligaciones de copyleft sobre el código derivado y puede ser incompatible con productos propietarios; revisar antes de uso comercial.
- ARN y ADN solo pueden usarse como contexto fijo, no como segmentos a generar.
- Tras el inverse folding, las coordenadas de cadena lateral de los residuos cuya identidad cambia no están disponibles hasta una nueva predicción de estructura.
- En rediseño de cadena única, las puntuaciones iPTM entre cadenas usan la convención de interfaz vacía del upstream y no describen una interfaz real, lo que puede dejar candidatos empatados en el ranking.
- El cribado usa los átomos disponibles y cada análisis conserva su cobertura atómica; las métricas de química completa se reportan por separado cuando existen.
- Riesgo de alucinación estructural: como todo modelo generativo, puede producir candidatos geométricamente plausibles pero biológicamente inviables; el refolding y la puntuación de afinidad son pasos de filtrado necesarios, no opcionales.
- Sesgos de los datos de entrenamiento: no documentados en la información disponible (PDB y datasets de estructura tienen sesgos conocidos de cobertura taxonómica y de familias proteicas).
- Sin datos publicados de benchmarks, latencia ni requisitos de hardware verificados.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema muy reciente y sin validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/oteam/boltzgen-diverse
- Variante completa: https://huggingface.co/oteam/boltzgen
- Variante adherence: https://huggingface.co/oteam/boltzgen-adherence
- Variante small: https://huggingface.co/oteam/boltzgen-structure-small
- Inverse folding: https://huggingface.co/oteam/boltzgen-inversefolding
- Código OFoldX: https://github.com/OTeam-AI4S/OFoldX/tree/main/ofoldx/models/boltzgen
- Repositorio oficial BoltzGen: https://github.com/HannesStark/boltzgen
- Paper: https://doi.org/10.1101/2025.11.20.689494
- Librería ofoldx: https://ofoldx.valtech.ai/
