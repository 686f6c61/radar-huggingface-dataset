# oteam/boltzgen-structure-small

## Resumen

BoltzGen es un modelo de diseño de binders proteicos y peptídicos que combina generación conjunta de secuencia y estructura, rediseño opcional de secuencia y evaluación mediante refolding. La variante `boltzgen-structure-small` es el generador de estructuras "Miniformer" del ecosistema BoltzGen, una versión reducida del trunk Pairformer completo que mantiene la misma representación (384/128) pero sustituye las 64 capas Pairformer por 12 bloques Miniformer y reduce el denoiser a 8 bloques token.

El modelo original fue desarrollado por un amplio equipo encabezado por Hannes Stark y Felix Faltings (MIT, junto con colaboradores de NVIDIA, Recursion y otras instituciones), y esta implementación concreta es una versión no oficial publicada por el equipo OFoldX bajo la librería `ofoldx`. Con 136,9 millones de parámetros, es la variante más ligera de los generadores de estructura liberados, pensada para iteración rápida y prototipado frente a la variante completa de 482,2 M de parámetros.

Es relevante ahora porque el diseño computacional de binders (anticuerpos, nanobodies, péptidos, proteínas de unión) es una de las aplicaciones de mayor impacto en biología estructural, y BoltzGen propone un enfoque de difusión all-atom con condicionamiento por restricciones que unifica generación y evaluación en un único flujo de trabajo. La variante small permite ejecutar este flujo con requisitos de cómputo notablemente menores.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Difusión all-atom con trunk Miniformer (12 bloques) + 3 bloques MSA y denoiser EDM de 8 bloques token |
| Parámetros totales | 136.885.760 (136,886 M) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (depende del tamaño de la proteína diana y del número de candidatos) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No aplica (modelo biológico, no lingüístico) |
| Licencia | AGPL-3.0 |
| Formato de pesos | safetensors |
| Representación interna | 384 (token) / 128 (par) |
| Librería | `ofoldx` |
| Pipeline | `other` |

## Arquitectura y entrenamiento

BoltzGen es un modelo de difusión all-atom para el diseño de binders biomoleculares. Un Pairformer reciclado —en esta variante sustituido por 12 bloques Miniformer más 3 bloques MSA— combina características de átomos, tokens, MSA, plantillas, contactos, sitio de unión y estructura secundaria. A continuación, un denoiser EDM (8 bloques token en esta variante) genera de forma conjunta la secuencia y las coordenadas atómicas. Un modelo de inverse folding independiente (BoltzIF o SolubleMPNN) puede rediseñar la secuencia sobre el backbone generado.

El flujo completo del ecosistema BoltzGen contiene siete subpipelines: generadores de estructura "diverse" y "adherence", los inverse folders BoltzIF y SolubleMPNN, refolding y scoring de afinidad con Boltz-2, y refolding con ESMFold2. La model card no detalla el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO; esa información no está disponible en la documentación proporcionada. La innovación técnica principal es la generación conjunta de secuencia y estructura guiada por restricciones (binding-site, contactos, estructura secundaria), que permite condicionar el diseño a la geometría de la interfaz.

## Capacidades

- Generación conjunta de secuencia y estructura para binders proteicos y peptídicos.
- Protocolos de diseño: `protein-anything`, `peptide-anything`, `protein-small_molecule`, `nanobody-anything`, `antibody-anything` y `protein-redesign`.
- Rediseño de secuencia sobre un backbone fijo mediante inverse folding (BoltzIF o SolubleMPNN).
- Evaluación integrada mediante refolding y scoring de afinidad (Boltz-2, ESMFold2).
- Generación de múltiples candidatos con ranking, selección por presupuesto y selección por diversidad.
- Acepta contexto fijo de ARN y ADN (no como segmentos generables).
- Condicionamiento por sitio de unión, contactos y estructura secundaria.
- No soporta tool calling, agentes ni capacidades lingüísticas: es un modelo biológico especializado.

## Casos de uso

- Diseño de binders proteicos contra una diana terapéutica: se parte de la estructura de la diana en formato CIF y se ejecuta el protocolo `protein-anything` con `total_len` y `num_candidates` ajustados, generando candidatos rankeados por métricas de refolding y afinidad. La variante small permite iterar rápidamente sobre muchas dianas antes de escalar a la variante completa.
- Diseño de péptidos de unión: mediante el protocolo `peptide-anything` se generan péptidos con longitud controlada que se pliegan sobre la interfaz deseada, útil en el desarrollo de moduladores de interacciones proteína-proteína.
- Diseño de nanobodies y anticuerpos: los protocolos `nanobody-anything` y `antibody-anything` permiten generar candidatos con la geometría de CDR adecuada, con evaluación posterior mediante refolding.
- Rediseño de secuencia sobre un backbone existente: el modo `protein-redesign` y la función `inverse_fold()` permiten optimizar la solubilidad o estabilidad de una estructura ya validada sin alterar su esqueleto.
- Diseño de binders frente a moléculas pequeñas: el protocolo `protein-small_molecule` usa BoltzIF como inverse folder por defecto y permite generar proteínas que reconozcan un ligando concreto.
- Filtrado y priorización en pipelines de descubrimiento: el resultado conserva todos los candidatos analizados con vistas rankeadas, de presupuesto y de diversidad, lo que permite integrar el modelo en un pipeline automatizado de selección.
- Prototipado e investigación académica: al ser la variante más ligera (136,9 M de parámetros), es adecuada para experimentación con recursos limitados antes de pasar a la variante completa de 482,2 M.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible en la documentación. Con 136,9 M de parámetros, los pesos en fp32 ocupan aproximadamente 0,55 GB; el consumo real depende del tamaño de la diana, del número de candidatos y de las etapas de refolding.
- GPU recomendadas: no especificadas por el autor. Por tamaño, una GPU consumer con 8-16 GB de VRAM debería poder alojar los pesos, aunque el refolding con Boltz-2 y ESMFold2 puede requerir más memoria.
- Cabe en GPU consumer: probable por tamaño de parámetros, aunque no confirmado en la documentación.
- Opciones de despliegue: la librería `ofoldx` (`pip install ofoldx`), que expone `ofoldx.pipeline("design", model="oteam/boltzgen")`, `design_backbones()` e `inverse_fold()`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Trunk | Bloques denoiser | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| boltzgen-structure-small | 136,886 M | 12 Miniformer + 3 MSA | 8 token | AGPL-3.0 | HuggingFace (oteam) |
| boltzgen (diverse/adherence) | 482,213 M | 64 Pairformer + 4 MSA | 24 token | AGPL-3.0 | HuggingFace (oteam) |
| boltzgen-inversefolding | 3,069 M | 6 bloques graph encoder, 30 vecinos | 3 graph decoder | AGPL-3.0 | HuggingFace (oteam) |

La comparativa se limita a las variantes del propio ecosistema BoltzGen, ya que la información proporcionada no incluye datos de modelos alternativos de diseño de binders (como RFdiffusion, ProteinMPNN o AlphaProteo) que permitan una comparación rigurosa de rendimiento.

## Limitaciones y advertencias

- Implementación no oficial: la model card la publica el equipo OFoldX, no los autores originales de BoltzGen; el repositorio oficial es `HannesStark/boltzgen`.
- Licencia AGPL-3.0: implica obligaciones de copyleft fuerte para uso en red y distribución; conviene revisar su compatibilidad con productos comerciales cerrados.
- ARN y ADN solo pueden usarse como contexto fijo, no como segmentos generables.
- Tras el inverse folding, las coordenadas de las cadenas laterales de residuos cuya identidad cambia no están disponibles hasta una predicción estructural posterior.
- En el rediseño de cadena única, los scores iPTM entre cadenas usan la convención de interfaz vacía y no describen una interfaz real, lo que puede dejar candidatos empatados en el ranking.
- El screening usa los átomos disponibles y cada análisis conserva su cobertura atómica; las métricas de química completa se reportan por separado cuando están disponibles.
- No se documentan sesgos, tasas de alucinación ni limitaciones de idioma porque el modelo no es lingüístico; su fiabilidad debe validarse experimentalmente en laboratorio.
- No hay información sobre cuantización, por lo que el despliegue en hardware muy limitado no está caracterizado.

## Enlaces

- HuggingFace: https://huggingface.co/oteam/boltzgen-structure-small
- Variante completa: https://huggingface.co/oteam/boltzgen
- Generadores independientes: https://huggingface.co/oteam/boltzgen-diverse y https://huggingface.co/oteam/boltzgen-adherence
- Inverse folding: https://huggingface.co/oteam/boltzgen-inversefolding
- Paper: https://doi.org/10.1101/2025.11.20.689494
- Repositorio oficial: https://github.com/HannesStark/boltzgen
- Código de la implementación: https://github.com/OTeam-AI4S/OFoldX/tree/main/ofoldx/models/boltzgen
- Librería: https://ofoldx.valtech.ai/
