# oteam/boltzgen-inversefolding

## Resumen

BoltzGen-inversefolding es el componente de inverse folding (BoltzIF) del conjunto de modelos BoltzGen, publicado en HuggingFace por el equipo OFoldX. Se trata de un modelo especializado en asignar secuencias de aminoácidos sobre esqueletos proteicos fijos, una tarea conocida como inverse folding o sequence design. Forma parte de un flujo de diseño de binders proteicos y peptídicos más amplio que combina generación conjunta de secuencia y estructura, rediseño opcional de secuencia y evaluación mediante refolding.

El modelo es una implementación no oficial del trabajo "BoltzGen: Toward Universal Binder Design", cuyo repositorio original mantiene el grupo de Hannes Stark. La model card advierte explícitamente de que el equipo original no escribió esta ficha y que la autoría de la implementación corresponde al equipo OFoldX. Con 3.074.900 parámetros reales según los pesos en safetensors, es un modelo muy compacto, pensado como pieza de un pipeline mayor y no como modelo autónomo de propósito general.

Su relevancia radica en que cubre una etapa concreta del diseño computacional de proteínas: dado un backbone generado por el difusor de BoltzGen, BoltzIF propone una secuencia compatible. Es especialmente útil en protocolos donde el inverse folder por defecto (SolubleMPNN) no es la opción preferida, como el protocolo `protein-small_molecule`, y puede integrarse en flujos de diseño que después se validan con Boltz-2 o ESMFold2.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Inverse folding basado en grafo: 6 bloques de encoder de grafo y 3 bloques de decoder de grafo, con 30 vecinos por nodo |
| Parametros totales | 3.074.900 (3,069 M según la model card) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (opera sobre grafos de residuos, no sobre secuencias con ventana de contexto) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No aplica (modelo biológico; no procesa lenguaje natural) |
| Licencia | AGPL-3.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

BoltzIF es un modelo de inverse folding con representación de 128 dimensiones para nodos y aristas. El trunk está formado por 6 bloques de encoder de grafo que operan sobre un vecindario de 30 vecinos por residuo, seguido de 3 bloques de decoder de grafo que producen la asignación de secuencia. La model card no detalla el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO; esa información no está disponible.

El modelo forma parte de una arquitectura mayor, BoltzGen, que es un modelo de difusión all-atom para diseño de binders biomoleculares. En ese flujo, un Pairformer reciclado combina características de átomos, tokens, MSA, plantillas, contactos, sitio de unión y estructura secundaria, y un denoiser EDM genera secuencia y coordenadas atómicas de forma conjunta. BoltzIF actúa después, sobre el backbone generado, para rediseñar la secuencia. El pipeline completo incluye siete subpipelines: generadores de estructura diverse y adherence, los inverse folders BoltzIF y SolubleMPNN, refolding y scoring de afinidad con Boltz-2, y refolding con ESMFold2. No se han publicado detalles adicionales sobre el entrenamiento específico de BoltzIF en la información disponible.

## Capacidades

- Inverse folding: asignación de secuencia de aminoácidos sobre un esqueleto proteico fijo.
- Rediseño de secuencia sobre backbones generados por el difusor de BoltzGen.
- Integración en protocolos de diseño de binders: `protein-anything`, `peptide-anything`, `protein-small_molecule`, `nanobody-anything`, `antibody-anything` y `protein-redesign`.
- Selección explícita como inverse folder mediante `inverse_fold_model="boltzif"`, o desactivación del rediseño con `inverse_fold_model=None`.
- Uso como paso intermedio en flujos parciales mediante `design_backbones()` e `inverse_fold()`.
- Soporte de contexto fijo de ARN y ADN (no se generan segmentos de ARN o ADN, solo se mantienen como contexto).
- No dispone de tool calling, function calling, capacidades de agente ni procesamiento de lenguaje natural, visión o audio.

## Casos de uso

- Diseño de binders proteicos con el protocolo `protein-anything`: se lee la estructura diana en formato CIF, se ejecuta el pipeline con `total_len` y `num_candidates`, y BoltzIF asigna secuencias sobre los backbones generados para su posterior ranking.
- Diseño de binders frente a moléculas pequeñas: en el protocolo `protein-small_molecule`, BoltzIF es el inverse folder por defecto, por lo que se usa directamente para proponer secuencias compatibles con el bolsillo de unión.
- Rediseño de secuencia de una proteína existente: con el protocolo `protein-redesign` se puede mantener el backbone y explorar secuencias alternativas que conserven la estructura.
- Generación de candidatos para nanobodies y anticuerpos: los protocolos `nanobody-anything` y `antibody-anything` emplean el flujo de BoltzGen, con BoltzIF o SolubleMPNN como inverse folders según configuración.
- Integración en flujos parciales de diseño: mediante `inverse_fold()` se puede rediseñar secuencia sin ejecutar la evaluación completa, útil para cribados rápidos antes de refolding y scoring.
- Evaluación comparativa de inverse folders: al poder alternar entre BoltzIF y SolubleMPNN, se pueden comparar secuencias propuestas por ambos métodos sobre el mismo backbone y seleccionar según métricas de análisis.
- Prototipado en investigación académica: su tamaño reducido (3,07 M de parámetros) y su licencia AGPL-3.0 lo hacen adecuado para experimentación en entornos de investigación con obligación de compartir modificaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 3,07 M de parámetros, el modelo en sí ocupa del orden de decenas de MB en precisión completa, aunque el consumo real depende del pipeline de BoltzGen y de los modelos auxiliares (generadores de estructura, Boltz-2, ESMFold2).
- GPU recomendadas: no disponible. El coste dominante no será BoltzIF, sino los componentes de difusión y refolding del flujo completo.
- Cabe en GPU consumer: previsiblemente sí para el modelo aislado, aunque no hay datos oficiales de VRAM del pipeline completo.
- Opciones de despliegue: la librería `ofoldx` (instalable con `pip install ofoldx`), que expone pipelines `design` y funciones `design_backbones()` e `inverse_fold()`. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BoltzGen-inversefolding (BoltzIF) | 3,07 M | No aplica | Inverse folding | AGPL-3.0 | HuggingFace (oteam) |
| SolubleMPNN | No disponible | No aplica | Inverse folding | No disponible | Integrado en el pipeline BoltzGen |
| BoltzGen diverse / adherence | 482,213 M | No aplica | Generación conjunta secuencia-estructura | AGPL-3.0 | HuggingFace (oteam) |
| BoltzGen structure-small | 136,886 M | No aplica | Generación de estructura (Miniformer) | AGPL-3.0 | HuggingFace (oteam) |

La comparación con SolubleMPNN es la más directa, ya que ambos son inverse folders del mismo pipeline y pueden alternarse mediante `inverse_fold_model`. No se dispone de datos de rendimiento comparativo entre ambos en la información proporcionada.

## Limitaciones y advertencias

- Implementación no oficial: el equipo autor de BoltzGen no escribió esta model card ni validó necesariamente esta implementación.
- Licencia AGPL-3.0: impone obligaciones de compartir el código fuente de las modificaciones y puede ser incompatible con uso comercial propietario; conviene revisar las implicaciones antes de desplegar en producción.
- No genera segmentos de ARN ni ADN; solo pueden usarse como contexto fijo.
- Cuando el inverse folding cambia la identidad de un residuo, las coordenadas de la nueva cadena lateral no están disponibles hasta una predicción estructural posterior.
- En rediseño de cadena única, las puntuaciones iPTM entre cadenas usan la convención de interfaz vacía del upstream y no describen una interfaz real, lo que puede dejar candidatos empatados en el ranking.
- El cribado usa los átomos disponibles, como en el flujo publicado; cada análisis conserva su cobertura atómica y reporta métricas de química completa por separado cuando están disponibles.
- Riesgo de sesgo y alucinación no documentado en la información disponible.
- No apto para tareas de lenguaje natural, tool calling ni agentes.
- El modelo depende de la librería `ofoldx` y del ecosistema BoltzGen; no es un modelo autónomo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/oteam/boltzgen-inversefolding
- Modelo completo BoltzGen: https://huggingface.co/oteam/boltzgen
- Variante diverse: https://huggingface.co/oteam/boltzgen-diverse
- Variante adherence: https://huggingface.co/oteam/boltzgen-adherence
- Variante structure-small: https://huggingface.co/oteam/boltzgen-structure-small
- Código en OFoldX: https://github.com/OTeam-AI4S/OFoldX/tree/main/ofoldx/models/boltzgen
- Paper: https://doi.org/10.1101/2025.11.20.689494
- Repositorio original: https://github.com/HannesStark/boltzgen
- Documentación de la librería: https://ofoldx.valtech.ai/
