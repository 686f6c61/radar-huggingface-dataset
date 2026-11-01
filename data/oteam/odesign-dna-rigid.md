# oteam/odesign-dna-rigid

## Resumen

ODesign es un modelo de difusion atomica completa (all-atom diffusion) disenado para el diseno de interacciones biomoleculares. Desarrollado originalmente por Odin Zhang, Xujun Zhang, Haitao Lin y colaboradores, esta variante concreta (`oteam/odesign-dna-rigid`) es una implementacion no oficial publicada por el equipo OFoldX. El modelo genera coordenadas tridimensionales de una cadena de ADN condicionada por un complejo receptor con contexto rigido, y posteriormente asigna la secuencia mediante un modulo de inverse folding (OInvFold en esta ruta).

La relevancia del modelo radica en su enfoque de "modelo del mundo" para el diseno biomolecular: en lugar de predecir una unica estructura, difunde coordenadas atomicas y despues resuelve la identidad quimica (secuencia o elemento), lo que permite disenar de novo acidos nucleicos que se unan a una diana proteica concreta. Esto tiene aplicaciones directas en diseno de aptameros, sondas de ADN y sistemas de reconocimiento molecular.

Arquitectonicamente es un transformer con Pairformer de 48 bloques, 4 etapas de MSA, 24 bloques de denoiser de tokens y modulos de encoder/decoder atomico de 3 bloques cada uno. El modelo de generacion de coordenadas tiene 355,687 millones de parametros (355,687 M), con tamanos de single y pair de 384 y 128 respectivamente. El repositorio ocupa 1,5 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con Pairformer (48 bloques), 4 etapas de MSA, 24 bloques de token denoiser, 3 bloques de atom encoder y 3 de atom decoder; difusion de coordenadas all-atom |
| Parametros totales | 355,687 M (modelo de generacion de coordenadas) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No aplica (modelo biologico, no linguistico) |
| Licencia | AGPL-3.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ODesign emplea un esquema de difusion sobre coordenadas atomicas completas. El nucleo es un transformer con un Pairformer de 48 bloques que procesa representaciones de pares de residuos, combinado con 4 etapas de MSA (multiple sequence alignment) para incorporar informacion evolutiva. Sobre esta base, un denoiser de tokens de 24 bloques opera sobre las representaciones de tokens, mientras que un encoder y un decoder atomico de 3 bloques cada uno manejan la geometria a nivel de atomo. La generacion procede por difusion de coordenadas y, una vez fijada la geometria, un modulo de inverse folding asigna la secuencia o los elementos quimicos.

En esta variante de ADN, la asignacion de secuencia la realiza OInvFold. El contexto del receptor es rigido, es decir, las coordenadas del receptor se mantienen fijas durante la generacion, a diferencia de la variante `protein-flex`. Las rutas de proteina usan ProteinMPNN (sin contexto de atomos de ligando) o LigandMPNN (con contexto), la ruta de ARN usa gRNAde y la ruta provisional de ligando usa ligand OInvFold. No se detalla en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO.

## Capacidades

- Generacion de coordenadas tridimensionales de ADN condicionadas por un complejo receptor con contexto rigido.
- Asignacion de secuencia de ADN mediante inverse folding con OInvFold tras la generacion de coordenadas.
- Diseno de novo: permite aportar una `PolymerSequence` con residuos desconocidos para generar cadenas nuevas.
- Seleccion de posiciones a disenar mediante `PositionSelection` sobre instancias concretas del complejo.
- Generacion de multiples backbones y secuencias por ejecucion (`num_backbones`, `num_sequences`), con control de semilla.
- Integracion en el ecosistema OFoldX mediante pipelines (`ofoldx.pipeline("design", ...)`).
- No soporta tool calling, agentes ni capacidades linguisticas: es un modelo biologico, no un LLM.

## Casos de uso

- Diseno de aptameros de ADN: el modelo genera coordenadas de una cadena de ADN que se ajusta a una diana proteica concreta, y OInvFold asigna la secuencia; util para desarrollar sondas de reconocimiento molecular.
- Diseno de sondas de ADN para diagnostico: partiendo de la estructura de un complejo receptor, se generan candidatos de ADN con geometria compatible con el sitio de union, que luego se criban experimentalmente.
- Ingenieria de sistemas de reconocimiento molecular: la generacion condicionada por receptor rigido permite mantener la geometria de la diana y explorar secuencias de ADN que la complementen.
- Generacion de bibliotecas de candidatos in silico: con `num_backbones` y `num_sequences` se producen multiples disenos por ejecucion, utiles para priorizar experimentos de laboratorio.
- Investigacion en diseno biomolecular: el modelo sirve como banco de pruebas para estudiar difusion de coordenadas aplicada a acidos nucleicos y comparar con metodos de inverse folding alternativos.
- Integracion en pipelines de diseno estructural: al formar parte de OFoldX, puede encadenarse con otras etapas (decodificacion de backbone, evaluacion de scores del inverse folder) en flujos automatizados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. El repositorio ocupa 1,5 GB en disco, pero el modelo de 355,687 M parametros requiere VRAM adicional para activaciones y difusion.
- GPU recomendadas: no disponible. Por el tamano del modelo, es previsible que requiera GPU de datacenter (A100, H100) para inferencia comoda, pero no se confirma en la informacion.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: la libreria `ofoldx` (instalable via `pip install ofoldx`); no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| oteam/odesign-dna-rigid | 355,687 M (coordenadas) | No disponible | Diseno de ADN con contexto rigido | AGPL-3.0 | HuggingFace (no oficial) |
| oteam/odesign-protein-rigid | No disponible | No disponible | Diseno de proteina con contexto rigido | AGPL-3.0 | HuggingFace (no oficial) |
| oteam/odesign-rna-rigid | No disponible | No disponible | Diseno de ARN con contexto rigido | AGPL-3.0 | HuggingFace (no oficial) |
| oteam/odesign-ligand-rigid | No disponible | No disponible | Diseno provisional de ligando | AGPL-3.0 | HuggingFace (no oficial) |

No se dispone de datos de benchmarks ni de modelos externos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Implementacion no oficial: la model card la escribe el equipo OFoldX, no los autores originales de ODesign; puede haber divergencias respecto al modelo oficial.
- Licencia AGPL-3.0: impone obligaciones de copyleft que pueden condicionar el uso comercial y la distribucion de derivados; revisar antes de integrar en productos propietarios.
- Contexto rigido: el receptor no se mueve durante la generacion, lo que puede limitar el realismo en casos de flexibilidad inducida por la union.
- La ruta de ligando es provisional y no determina enlaces, cargas formales ni identidades de componentes quimicos.
- Riesgo de disenos no validos experimentalmente: los candidatos generados requieren validacion de laboratorio.
- No se detallan sesgos, limitaciones de idioma (no aplica) ni datos de entrenamiento, lo que dificulta evaluar su generalizacion.
- Sin descargas ni likes registrados en el momento de la consulta, lo que sugiere poca validacion por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/oteam/odesign-dna-rigid
- Paper: https://arxiv.org/abs/2510.22304
- Repositorio oficial de ODesign: https://github.com/The-Institute-for-AI-Molecular-Design/ODesign
- Codigo OFoldX (odesign): https://github.com/OTeam-AI4S/OFoldX/tree/main/ofoldx/models/odesign
- Libreria ofoldx: https://ofoldx.valtech.ai/
- Guia de pipelines: https://github.com/OTeam-AI4S/OFoldX/blob/main/ofoldx/pipelines/README.md
- Guia de quimica: https://github.com/OTeam-AI4S/OFoldX/blob/main/ofoldx/chemistry/README.md
- Variante protein-flex: https://huggingface.co/oteam/odesign-protein-flex
- Variante protein-rigid: https://huggingface.co/oteam/odesign-protein-rigid
- Variante rna-rigid: https://huggingface.co/oteam/odesign-rna-rigid
- Variante ligand-rigid: https://huggingface.co/oteam/odesign-ligand-rigid
