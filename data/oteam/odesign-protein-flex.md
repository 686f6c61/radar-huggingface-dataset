# oteam/odesign-protein-flex

## Resumen

ODesign es un modelo de difusion atomica completa (all-atom) disenado para el diseno de interacciones biomoleculares: genera coordenadas tridimensionales de proteinas, acidos nucleicos y ligandos condicionadas a un complejo receptor. La implementacion publicada en `oteam/odesign-protein-flex` es una version no oficial desarrollada por el equipo OFoldX a partir del paper "ODesign: A World Model for Biomolecular Interaction Design" de Odin Zhang, Xujun Zhang, Haitao Lin y colaboradores, cuyo repositorio oficial reside en The Institute for AI Molecular Design.

Esta variante concreta, `protein-flex`, genera esqueletos proteicos (backbone generation) manteniendo un contexto de receptor flexible, es decir, permite que los atomos del receptor se desplacen durante el proceso de generacion. Tras la difusion de coordenadas, la asignacion de secuencia se realiza mediante ProteinMPNN (sin contexto de atomos de ligando) o LigandMPNN (cuando hay ligando presente), seleccionado automaticamente segun el contexto.

El modelo es relevante porque aborda una de las tareas centrales del diseno computacional de proteinas: la generacion de novo de candidatos estructurales condicionados a una diana biologica, con flexibilidad realista del receptor. Con 355,687 millones de parametros en el modelo de generacion de coordenadas, arquitectura basada en Pairformer y denoiser atomico, y distribucion bajo licencia AGPL-3.0, se posiciona como una herramienta de investigacion para pipelines de diseno de proteinas, acidos nucleicos y ligandos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusion de coordenadas all-atom con Pairformer y denoiser atomico; asignacion de secuencia/elemento posterior mediante inverse folding |
| Parametros totales | 355,687 M (modelo de generacion de coordenadas) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (no es un modelo de lenguaje; opera sobre estructuras moleculares) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No aplica (modelo biologico, no linguistico) |
| Licencia | AGPL-3.0 |
| Formato de pesos | safetensors |
| Single Size | 384 |
| Pair Size | 128 |
| Pairformer Blocks | 48 |
| MSA Stages | 4 |
| Token Denoiser Blocks | 24 |
| Atom Encoder Blocks | 3 |
| Atom Decoder Blocks | 3 |
| Libreria | ofoldx |
| Tamano del repo | 1.4 GB |

## Arquitectura y entrenamiento

ODesign emplea un modelo de difusion sobre coordenadas atomicas completas. La red combina un trunk tipo Pairformer (48 bloques) con representaciones de pares de tamano 128 y representaciones simples de tamano 384, procesadas a traves de 4 etapas de MSA. El denoiser opera a nivel de token con 24 bloques, y la codificacion y decodificacion atomica se realizan con 3 bloques cada una. Esta separacion permite manejar representaciones de residuos y de atomos de forma jerarquica, algo habitual en modelos de estructura biomolecular inspirados en AlphaFold.

El proceso de generacion es en dos fases: primero se difunden las coordenadas del esqueleto y despues se asigna la identidad quimica. Para proteinas se usa ProteinMPNN sin contexto de ligando y LigandMPNN cuando hay atomos de ligando; para DNA se emplea OInvFold, para RNA gRNAde y para la ruta provisional de ligando se usa ligand OInvFold. La variante `protein-flex` permite que el receptor se mueva durante la generacion, mientras que las variantes `rigid` mantienen fijas las coordenadas del receptor. No se detalla en la informacion disponible el volumen de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO, dado que no es un modelo linguistico.

## Capacidades

- Generacion de esqueletos proteicos de novo condicionados a un complejo receptor, con contexto de receptor flexible.
- Diseno de secuencia posterior mediante ProteinMPNN o LigandMPNN segun la presencia de ligando.
- Diseno de DNA con asignacion de secuencia mediante OInvFold (variante `dna-rigid`).
- Diseno de RNA con asignacion de secuencia mediante gRNAde (variante `rna-rigid`).
- Diseno provisional de ligandos: generacion de coordenadas atomicas en huecos de 8 a 16 atomos alrededor de una cavidad observada, con prediccion de elementos por atomo y logits de enlace por par.
- Seleccion de posiciones a disenar mediante `PositionSelection` sobre instancias concretas del complejo.
- Generacion de multiples candidatos por ejecucion (`num_backbones`, `num_sequences`) con control de semilla.
- Soporte de inverse folding alternativo mediante pipelines `ODesignOInvFoldProteinPipeline` y `ODesignOInvFoldRnaPipeline`.
- Ejecucion por etapas y composicion de pipelines segun la guia del repositorio OFoldX.
- No soporta tool calling, agentes ni capacidades linguisticas: es un modelo biologico, no un LLM.

## Casos de uso

- Diseno de novo de proteinas de union a una diana terapeutica: se parte de la estructura del receptor en formato mmCIF y se generan varios esqueletos candidatos con `num_backbones` y secuencias con `num_sequences`, aprovechando el contexto flexible para explorar conformaciones del receptor.
- Rediseno de interfaces proteina-proteina: seleccionando las posiciones de la instancia interactuante mediante `PositionSelection`, el modelo regenera el esqueleto manteniendo fijados los atomos que el usuario marque como inmoviles.
- Diseno de aptameros de DNA o RNA: las variantes `dna-rigid` y `rna-rigid` permiten generar oligonucleotidos con asignacion de secuencia mediante OInvFold o gRNAde respectivamente, utiles en pipelines de seleccion de aptameros.
- Descubrimiento temprano de ligandos en cavidades: la ruta `ligand-rigid` genera coordenadas de 8 a 16 atomos en una cavidad observada, con probabilidades por atomo y logits de enlace, como paso de filtrado antes de simulaciones de docking o dinamica molecular.
- Enriquecimiento de datasets estructurales: generacion de candidatos sinteticos de proteinas y acidos nucleicos para entrenar o validar otros modelos de estructura, como modelos de plegamiento o de scoring.
- Evaluacion de flexibilidad del receptor: la comparacion entre la variante `flex` y las variantes `rigid` permite estudiar el impacto de la flexibilidad del receptor en la calidad de los disenos generados.
- Integracion en pipelines de diseno computacional existentes: la API de `ofoldx` permite encadenar generacion de backbone, inverse folding y evaluacion posterior dentro de flujos automatizados de investigacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. El modelo de generacion de coordenadas tiene 355,687 M de parametros y el repositorio ocupa 1.4 GB, pero no se especifica el consumo de memoria en ejecucion.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: la libreria oficial es `ofoldx` (instalable via `pip install ofoldx`); no se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ODesign (protein-flex) | 355,687 M | No aplica | Difusion all-atom + inverse folding | AGPL-3.0 | HuggingFace (implementacion no oficial) |
| ProteinMPNN | No disponible | No aplica | Inverse folding | No disponible | Codigo abierto |
| LigandMPNN | No disponible | No disponible | Inverse folding con ligando | No disponible | Codigo abierto |
| gRNAde | No disponible | No disponible | Diseno de RNA | No disponible | Codigo abierto |

No se dispone de datos comparativos de rendimiento entre estos modelos en la informacion proporcionada. ProteinMPNN, LigandMPNN y gRNAde se citan como componentes del propio pipeline de ODesign, no como alternativas equivalentes de generacion de coordenadas.

## Limitaciones y advertencias

- La model card declara explicitamente que se trata de una implementacion NO OFICIAL; el equipo original de ODesign no la ha revisado ni respaldado.
- La ruta de ligando es provisional: los enlaces, cargas formales e identidades de componentes quimicos quedan indeterminados.
- La generacion de secuencia depende de modelos externos (ProteinMPNN, LigandMPNN, OInvFold, gRNAde), cuyas limitaciones se heredan.
- La licencia AGPL-3.0 impone obligaciones de copyleft: el uso comercial en servicios en red requiere liberar el codigo derivado bajo la misma licencia.
- No hay informacion sobre sesgos, tasas de alucinacion estructural ni validacion experimental de los disenos generados.
- No se documentan limitaciones de contexto ni de idioma porque el modelo no opera sobre texto.
- No se especifican requisitos de hardware ni latencias, lo que dificulta planificar despliegues en produccion.
- El modelo tiene 0 descargas y 0 likes en HuggingFace en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.
- Cualquier candidato generado debe validarse experimentalmente antes de su uso en aplicaciones reales.

## Enlaces

- HuggingFace: https://huggingface.co/oteam/odesign-protein-flex
- Variante protein-rigid: https://huggingface.co/oteam/odesign-protein-rigid
- Variante dna-rigid: https://huggingface.co/oteam/odesign-dna-rigid
- Variante rna-rigid: https://huggingface.co/oteam/odesign-rna-rigid
- Variante ligand-rigid: https://huggingface.co/oteam/odesign-ligand-rigid
- Paper: https://arxiv.org/abs/2510.22304
- Repositorio oficial: https://github.com/The-Institute-for-AI-Molecular-Design/ODesign
- Codigo OFoldX: https://github.com/OTeam-AI4S/OFoldX/tree/main/ofoldx/models/odesign
- Libreria ofoldx: https://ofoldx.valtech.ai/
- Guia de pipelines: https://github.com/OTeam-AI4S/OFoldX/blob/main/ofoldx/pipelines/README.md
- Guia de quimica: https://github.com/OTeam-AI4S/OFoldX/blob/main/ofoldx/chemistry/README.md
