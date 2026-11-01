# oteam/boltzgen-adherence

## Resumen

BoltzGen es un modelo de difusion atomica completa para el diseno de binders biomoleculares (proteinas y peptidos) que genera secuencia y estructura de forma conjunta. La variante `oteam/boltzgen-adherence` es uno de los dos generadores de estructura independientes del flujo completo BoltzGen, publicada por el equipo OFoldX como implementacion no oficial del trabajo original de Hannes Stark, Felix Faltings y colaboradores (MIT). El modelo combina un trunk Pairformer reciclado con un denoiser EDM que produce simultaneamente coordenadas atomicas y secuencia.

Con 482.212.802 parametros (482,213 M), esta variante emplea una representacion de 384/128 con 64 bloques Pairformer, 4 bloques MSA y 24 bloques token en el denoiser. Frente a la variante `diverse`, que prioriza la variedad de candidatos, `adherence` esta orientada a generar estructuras que se adhieran estrictamente a las restricciones impuestas (epitopo objetivo, motivo de union, regiones fijas), lo que resulta critico en tareas de diseno con especificidad definida por el usuario.

El modelo es relevante porque aborda el diseno de binders como un problema de generacion conjunta de secuencia y estructura, en lugar de encadenar generacion de backbone y reasignacion de secuencia en pasos separados. Se distribuye bajo licencia AGPL-3.0, en formato safetensors, y requiere la libreria `ofoldx` para su ejecucion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusion atomica completa con trunk Pairformer reciclado y denoiser EDM |
| Parametros totales | 482.212.802 (482,213 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; el limite lo impone el tamano del complejo disenado) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | AGPL-3.0 |
| Formato de pesos | safetensors |

Especificaciones adicionales del trunk: representacion 384/128, 64 bloques Pairformer, 4 bloques MSA, 24 bloques token en el denoiser. Tamano del repositorio: 1,9 GB.

## Arquitectura y entrenamiento

BoltzGen es un modelo de difusion atomica completa para el diseno de biomoleculas. Un trunk Pairformer reciclado combina caracteristicas de atomos, tokens, MSA, plantillas, contactos, sitio de union y estructura secundaria; a continuacion, un denoiser EDM genera de forma conjunta la secuencia y las coordenadas atomicas. La variante `adherence` comparte esta arquitectura con la variante `diverse` (482,213 M de parametros) y se distingue por su comportamiento en la generacion: prioriza el cumplimiento de las restricciones de diseno sobre la diversidad estructural de los candidatos.

El flujo completo de BoltzGen contiene siete subpipelines: los generadores de estructura `diverse` y `adherence`, los inverse folders BoltzIF y SolubleMPNN, el refolding y scoring de afinidad con Boltz-2, y el refolding con ESMFold2. Un modelo de inverse folding separado (BoltzIF, 3,069 M de parametros, con 6 bloques de encoder grafico y 3 de decoder) puede redisenar la secuencia sobre el backbone generado. La model card no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO; esa informacion no esta disponible.

## Capacidades

- Generacion conjunta de secuencia y estructura de binders de proteina y peptido mediante difusion atomica completa.
- Generacion de estructura condicionada por restricciones: sitio de union, epitopo, motivo y regiones fijas del complejo diana.
- Protocolos de diseno publicados: `protein-anything`, `peptide-anything`, `protein-small_molecule`, `nanobody-anything`, `antibody-anything` y `protein-redesign`.
- Rediseno opcional de secuencia sobre el backbone generado mediante inverse folding (SolubleMPNN por defecto; BoltzIF para `protein-small_molecule`).
- Evaluacion de candidatos mediante refolding (Boltz-2 y ESMFold2) y scoring de afinidad.
- Ranking de candidatos con vistas estables: ranked, top-budget y diversity-selected.
- Uso de RNA y DNA como contexto fijo (no como segmentos generables).
- No soporta tool calling, function calling, agentes ni capacidades multilingues: no es un modelo de lenguaje.

## Casos de uso

- Diseno de binders de proteina contra un epitopo definido: se proporciona la estructura diana en formato CIF y se ejecuta el pipeline con `protocol="protein-anything"`, fijando el sitio de union para que la variante `adherence` genere candidatos que respeten esa restriccion.
- Diseno de peptidos de union: con `protocol="peptide-anything"` se generan peptidos con longitud controlada (`total_len`) que se pliegan sobre la diana, util para modulos de union cortos y sintetizables.
- Diseno de nanobodies y anticuerpos: los protocolos `nanobody-anything` y `antibody-anything` permiten generar candidatos con el esqueleto de inmunoglobulina y evaluar su union mediante refolding.
- Rediseno de secuencia sobre un backbone existente: se usa `inverse_fold()` con SolubleMPNN o BoltzIF para optimizar solubilidad o expresabilidad sin alterar la estructura tridimensional.
- Diseno de binders contra moleculas pequenas: el protocolo `protein-small_molecule` con inverse folding BoltzIF aborda dianas no proteicas, un caso habitual en descubrimiento de farmacos.
- Cribado computacional de candidatos: el pipeline devuelve todos los candidatos analizados con sus estructuras de codesign, refolding y valores de analisis, lo que permite filtrar por iPTM, cobertura atomica y metricas de quimica completa antes de la validacion experimental.
- Generacion de backbones sin evaluacion: `design_backbones()` permite generar solo estructura y secuencia para su posterior analisis con herramientas externas, reduciendo el coste computacional del flujo completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Con 482,213 M de parametros en precision FP32, los pesos ocupan aproximadamente 1,9 GB, a lo que hay que sumar las activaciones del trunk Pairformer y del denoiser, que dominan el consumo de memoria.
- GPU recomendadas: no disponible. Por el perfil del modelo (difusion atomica completa con 64 bloques Pairformer) se requiere una GPU con soporte de CUDA y memoria suficiente para el complejo diana; no se especifican modelos concretos.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: la unica via documentada es la libreria `ofoldx` (`pip install ofoldx`), que expone el pipeline `design` y las funciones `design_backbones()` e `inverse_fold()`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|
| oteam/boltzgen-adherence | 482,213 M | Generador de estructura con prioridad de adherencia a restricciones | AGPL-3.0 | HuggingFace (oteam) |
| oteam/boltzgen-diverse | 482,213 M | Generador de estructura con prioridad de diversidad | AGPL-3.0 | HuggingFace (oteam) |
| oteam/boltzgen-structure-small | 136,886 M | Generador Miniformer (12 bloques, 8 bloques token) | AGPL-3.0 | HuggingFace (oteam) |
| oteam/boltzgen-inversefolding | 3,069 M | Inverse folding sobre backbone fijo (BoltzIF) | AGPL-3.0 | HuggingFace (oteam) |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Implementacion no oficial: la model card la publica el equipo OFoldX, no los autores originales de BoltzGen; el repositorio oficial es `HannesStark/boltzgen`.
- Licencia AGPL-3.0: impone obligaciones de copyleft sobre obras derivadas y su distribucion en red; debe revisarse antes de cualquier uso comercial o en servicios accesibles por red.
- RNA y DNA solo pueden usarse como contexto fijo, no como segmentos generables.
- Cuando el inverse folding cambia la identidad de un residuo, las coordenadas de la nueva cadena lateral no estan disponibles hasta una prediccion estructural posterior.
- En el rediseno de cadena unica, los scores iPTM entre cadenas usan la convencion de interfaz vacia del flujo original y no describen una interfaz real, lo que puede dejar candidatos empatados en el ranking.
- El cribado usa los atomos disponibles, como en el flujo publicado; cada analisis conserva su cobertura atomica y reporta metricas de quimica completa por separado cuando estan disponibles.
- Sin inverse folding, el cribado emplea la estructura de codesign original en lugar de la replegada.
- No se documentan sesgos, tasas de alucinacion ni limitaciones de idioma porque el modelo no es linguistico; el riesgo principal es la generacion de candidatos no viables experimentalmente, que deben validarse in silico e in vitro.
- No se dispone de informacion sobre el dataset de entrenamiento, por lo que no puede evaluarse la cobertura de dianas ni el sesgo hacia familias proteicas sobrerrepresentadas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/oteam/boltzgen-adherence
- Flujo completo: https://huggingface.co/oteam/boltzgen
- Variante diverse: https://huggingface.co/oteam/boltzgen-diverse
- Variante structure-small: https://huggingface.co/oteam/boltzgen-structure-small
- Inverse folding BoltzIF: https://huggingface.co/oteam/boltzgen-inversefolding
- Codigo OFoldX: https://github.com/OTeam-AI4S/OFoldX/tree/main/ofoldx/models/boltzgen
- Paper: https://doi.org/10.1101/2025.11.20.689494
- Repositorio oficial: https://github.com/HannesStark/boltzgen
- Documentacion de la libreria: https://ofoldx.valtech.ai/
