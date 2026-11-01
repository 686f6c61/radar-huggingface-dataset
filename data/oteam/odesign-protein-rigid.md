# oteam/odesign-protein-rigid

## Resumen

ODesign es un modelo de difusión de coordenadas all-atom disenado para el diseno de interacciones biomoleculares. Desarrollado originalmente por Odin Zhang, Xujun Zhang, Haitao Lin y colaboradores (publicado en arXiv:2510.22304), esta variante concreta es una implementacion no oficial mantenida por el equipo OFoldX bajo el identificador `oteam/odesign-protein-rigid`. El modelo genera esqueletos proteicos (backbones) condicionados por un receptor en contexto rigido, cuyas coordenadas permanecen fijas durante el proceso de generacion.

La arquitectura combina un modulo Pairformer de 48 bloques con un denoiser de tokens de 24 bloques y codificador/decodificador de atomos de 3 bloques cada uno. El modelo de generacion de coordenadas cuenta con 355,687 millones de parametros (355,687 M, es decir, aproximadamente 0,36 B). Tras la generacion de coordenadas, un modulo de inverse folding (ProteinMPNN o LigandMPNN segun el contexto) asigna la secuencia de aminoacidos.

La relevancia de esta variante radica en su enfoque de contexto rigido: a diferencia de `odesign-protein-flex`, el receptor mantiene sus coordenadas originales, lo que resulta adecuado para escenarios de diseno donde la conformacion del receptor se considera fija o conocida, como el diseno de binders contra un epitopo cristalizado. El modelo se distribuye bajo licencia AGPL-3.0 y requiere la libreria `ofoldx` para su ejecucion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusion de coordenadas all-atom con Pairformer (48 bloques), token denoiser (24 bloques), atom encoder/decoder (3 bloques cada uno) e inverse folding (MPNN) |
| Parametros totales | 355,687 M (modelo de generacion de coordenadas) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No aplica (modelo biologico, no linguistico) |
| Licencia | AGPL-3.0 |
| Formato de pesos | safetensors |
| Single Size / Pair Size | 384 / 128 |
| MSA Stages | 4 |
| Tamano del repositorio | 1,4 GB |
| Libreria requerida | ofoldx |
| Pipeline | other (design) |

## Arquitectura y entrenamiento

ODesign emplea un modelo de difusion sobre coordenadas atomicas para generar estructuras biomoleculares. La red se compone de un Pairformer de 48 bloques que procesa representaciones de pares de residuos, cuatro etapas de MSA, un denoiser de tokens de 24 bloques y un codificador y decodificador de atomos de 3 bloques cada uno. El proceso de difusion genera coordenadas atomicas que posteriormente son convertidas en secuencia mediante un modulo de inverse folding: ProteinMPNN cuando no hay atomos de ligando en el contexto y LigandMPNN cuando si los hay. En esta variante `protein-rigid`, el receptor mantiene sus coordenadas originales durante todo el proceso de generacion, mientras que en `protein-flex` el receptor puede moverse.

La model card no especifica el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO (tecnicas no aplicables directamente a este dominio). Tampoco se detallan innovaciones como decodificacion especulativa o atencion lineal. La implementacion es no oficial: el equipo OFoldX reimplemento el modelo descrito en el paper original, y el repositorio oficial reside en The-Institute-for-AI-Molecular-Design/ODesign. Los pesos se distribuyen en formato safetensors y la inferencia requiere la libreria `ofoldx`, instalable via pip.

## Capacidades

- Generacion de esqueletos proteicos (backbone generation) condicionados por un receptor en contexto rigido.
- Inverse folding mediante ProteinMPNN (sin atomos de ligando) o LigandMPNN (con atomos de ligando) para asignar secuencias de aminoacidos tras la generacion de coordenadas.
- Seleccion de posiciones a disenar mediante `PositionSelection`, permitiendo especificar que instancias del complejo se generan y cuales se mantienen fijas.
- Generacion de novo: acepta una `PolymerSequence` tipada con residuos desconocidos para diseno sin estructura de partida.
- Control de muestreo: parametros `num_backbones`, `num_sequences` y `seed` para generar multiples candidatos reproducibles.
- Regeneracion con preservacion de observaciones: los atomos explicitamente fijados conservan coordenadas y observaciones.
- Soporte de contexto con ligando (via LigandMPNN) en la asignacion de secuencia.
- No soporta tool calling, agentes, razonamiento multi-step ni capacidades linguisticas: es un modelo biologico especializado.

## Casos de uso

- Diseno de binders proteicos contra un epitopo rigido: dado un complejo cristalizado con el receptor fijo, el modelo genera esqueletos candidatos sobre la posicion seleccionada y asigna secuencias con MPNN, adecuado para campanas de diseno de anticuerpos o peptidos.
- Diseno de novo de proteinas con estructura de receptor conocida: usando `PolymerSequence` con residuos desconocidos, se generan esqueletos completos sin necesidad de una estructura semilla, util para explorar el espacio conformacional.
- Optimizacion de interfaces proteina-proteina: fijando el receptor y generando la cadena B, se pueden muestrear multiples backbones y secuencias para identificar variantes con mejor complementariedad de forma.
- Diseno condicionado por ligando: con LigandMPNN activado por la presencia de atomos de ligando en el contexto, se generan secuencias que acomodan el ligando en el bolsillo, aplicable a diseno de enzimas o proteinas de union.
- Generacion de librerias de candidatos para cribado: los parametros `num_backbones` y `num_sequences` permiten producir lotes de candidatos con semillas controladas para pipelines de evaluacion downstream.
- Reproduccion de experimentos del paper: al ser una implementacion de referencia de ODesign, sirve para validar resultados publicados y comparar variantes rigidas frente a flexibles.
- Integracion en pipelines de diseno computacional: la API de `ofoldx` permite encadenar generacion de backbone, inverse folding y evaluacion en flujos automatizados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la model card. Con 355,687 M de parametros en el modelo de coordenadas, el peso en precision FP32 seria de aproximadamente 1,4 GB, coherente con el tamano del repositorio; en FP16 rondaria 0,7 GB, aunque el consumo real depende del grafo de difusion y de las representaciones de pares y MSA.
- GPU recomendadas: no especificadas. Por el tamano del modelo, una GPU consumer con 8-16 GB de VRAM podria ser suficiente, pero no hay datos confirmados.
- Cabe en GPU consumer: probablemente si, dado el tamano del repositorio (1,4 GB), pero no confirmado por el autor.
- Opciones de despliegue: la unica via documentada es la libreria `ofoldx` (`pip install ofoldx`) con su pipeline `design`. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este dominio).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| oteam/odesign-protein-rigid | 355,687 M (coordenadas) | No disponible | Difusion all-atom, receptor rigido | AGPL-3.0 | HuggingFace (no oficial) |
| oteam/odesign-protein-flex | 355,687 M (coordenadas) | No disponible | Difusion all-atom, receptor flexible | AGPL-3.0 | HuggingFace (no oficial) |
| oteam/odesign-dna-rigid | No disponible | No disponible | Difusion all-atom, DNA, OInvFold | AGPL-3.0 | HuggingFace (no oficial) |
| oteam/odesign-rna-rigid | No disponible | No disponible | Difusion all-atom, RNA, gRNAde | AGPL-3.0 | HuggingFace (no oficial) |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada. La diferencia principal entre `protein-rigid` y `protein-flex` es el tratamiento del receptor: rigido mantiene coordenadas fijas, flexible permite movimiento.

## Limitaciones y advertencias

- Implementacion no oficial: el equipo OFoldX reimplemento el modelo; los resultados pueden diferir de los del repositorio oficial.
- Licencia AGPL-3.0: impone obligaciones de copyleft fuerte; el uso comercial en servicios en red requiere liberar el codigo fuente derivado. Revisar compatibilidad antes de integrar en productos propietarios.
- Modelo biologico especializado: no procesa texto, no soporta tool calling ni agentes; no debe evaluarse con metricas de LLM.
- Contexto rigido: si el receptor sufre cambios conformacionales relevantes en la union, esta variante puede producir disenos suboptimos; en esos casos, `protein-flex` es mas adecuada.
- Dependencia de la libreria `ofoldx`: no hay soporte documentado para otros frameworks; la API puede cambiar.
- Sin datos de benchmarks publicados en la informacion disponible: no es posible validar el rendimiento frente a alternativas.
- Riesgo de disenos no viables: como todo modelo generativo estructural, los candidatos requieren validacion experimental (expresion, plegamiento, afinidad).
- Sin informacion sobre sesgos: no aplica en el sentido linguistico, pero el modelo puede heredar sesgos de los datos estructurales de entrenamiento (PDB), como sobrerrepresentacion de ciertos folds.
- Idiomas: no aplica; el modelo no procesa lenguaje natural.

## Enlaces

- HuggingFace: https://huggingface.co/oteam/odesign-protein-rigid
- Paper: https://arxiv.org/abs/2510.22304
- Repositorio oficial: https://github.com/The-Institute-for-AI-Molecular-Design/ODesign
- Codigo de la implementacion: https://github.com/OTeam-AI4S/OFoldX/tree/main/ofoldx/models/odesign
- Libreria ofoldx: https://ofoldx.valtech.ai/
- Guia de pipelines: https://github.com/OTeam-AI4S/OFoldX/blob/main/ofoldx/pipelines/README.md
- Guia de quimica: https://github.com/OTeam-AI4S/OFoldX/blob/main/ofoldx/chemistry/README.md
- Variante flexible: https://huggingface.co/oteam/odesign-protein-flex
- Variante DNA: https://huggingface.co/oteam/odesign-dna-rigid
- Variante RNA: https://huggingface.co/oteam/odesign-rna-rigid
- Variante ligando: https://huggingface.co/oteam/odesign-ligand-rigid
