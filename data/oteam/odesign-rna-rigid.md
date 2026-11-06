# oteam/odesign-rna-rigid

## Resumen

ODesign es un modelo de difusión de coordenadas all-atom diseñado para el diseño de interacciones biomoleculares. Desarrollado originalmente por Odin Zhang, Xujun Zhang, Haitao Lin y colaboradores (artículo arXiv:2510.22304), esta variante concreta (`oteam/odesign-rna-rigid`) es una implementación no oficial publicada por el equipo OFoldX. El modelo genera coordenadas de RNA sobre un contexto de receptor rígido y posteriormente asigna la secuencia mediante gRNAde como inverse folder.

La arquitectura combina un trunk tipo Pairformer con 48 bloques, un denoiser de tokens de 24 bloques y un encoder/decoder de átomos de 3 bloques cada uno, sumando 355,687 millones de parámetros en el modelo de generación de coordenadas. El contexto rígido implica que las coordenadas del receptor se mantienen fijas durante la difusión, lo que resulta útil cuando se conoce la estructura del complejo y se quiere diseñar únicamente la cadena de RNA interactuante.

Es relevante porque aborda una de las tareas más difíciles del diseño computacional de biomoléculas: generar ácidos nucleicos funcionales que se unan a dianas proteicas con geometría realista. La variante RNA con contexto rígido se publica junto a otras tres variantes (proteína flexible, proteína rígida, DNA rígida y ligando provisional), todas bajo licencia AGPL-3.0 y dependientes de la librería `ofoldx`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusión de coordenadas all-atom con trunk Pairformer, token denoiser y encoder/decoder de átomos |
| Parametros totales | 355,687 M (modelo de generación de coordenadas) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica: modelo estructural, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | AGPL-3.0 |
| Formato de pesos | safetensors |
| Single size | 384 |
| Pair size | 128 |
| Pairformer blocks | 48 |
| MSA stages | 4 |
| Token denoiser blocks | 24 |
| Atom encoder blocks | 3 |
| Atom decoder blocks | 3 |
| Inverse folder (RNA) | gRNAde |
| Tamano del repositorio | 1,4 GB |
| Libreria | ofoldx |

## Arquitectura y entrenamiento

ODesign emplea un esquema de difusión sobre coordenadas atómicas completas. El trunk está formado por 48 bloques Pairformer que procesan representaciones de pares y simples, con 4 etapas de MSA. Sobre esa representación opera un denoiser de tokens de 24 bloques que predice el campo de desplazamiento de las coordenadas, junto con un encoder y un decoder de átomos de 3 bloques cada uno que traducen entre representación de tokens y coordenadas atómicas. El tamaño de las representaciones es de 384 para singles y 128 para pares.

El proceso de generación es en dos fases: primero se difunden las coordenadas del polímero (en esta variante, RNA) condicionadas al contexto del receptor, y después un inverse folder asigna la secuencia. En la ruta RNA se utiliza gRNAde como asignador de secuencia. La variante `rigid` mantiene fijas las coordenadas del receptor durante todo el proceso, mientras que la variante `flex` permite que el receptor se mueva. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron etapas de RLHF o DPO (no aplicables en este dominio). El modelo es una implementación no oficial del artículo original, por lo que los detalles completos de entrenamiento deben consultarse en el paper.

## Capacidades

- Generación de coordenadas all-atom de cadenas de RNA condicionadas a un complejo receptor.
- Asignación de secuencia de RNA mediante gRNAde tras la generación de coordenadas.
- Diseño de novo de polímeros de RNA proporcionando una `PolymerSequence` con residuos desconocidos.
- Diseño selectivo por posiciones mediante `PositionSelection`, permitiendo elegir qué instancias del complejo se generan.
- Generación de múltiples candidatos por ejecución (`num_backbones`, `num_sequences`) con control de semilla.
- Soporte de contexto rígido: las coordenadas del receptor se conservan y solo se generan las del polímero objetivo.
- Integración con la librería `ofoldx` mediante pipelines (`ofoldx.pipeline("design", ...)`).
- Composición con inverse folders alternativos (OInvFold para RNA) como pipelines independientes.
- No soporta tool calling, agentes, visión, audio ni capacidades de lenguaje: es un modelo estructural, no un LLM.

## Casos de uso

- Diseño de aptámeros de RNA: el modelo puede generar coordenadas de una cadena de RNA que encaje geométricamente en una proteína diana concreta, usando el receptor rígido como contexto y gRNAde para asignar la secuencia final.
- Diseño de ribozimas y RNA catalítico: partiendo de una estructura de receptor o de un entorno definido, se generan candidatos de RNA cuya secuencia se optimiza después con el inverse folder para plegarse en la geometría propuesta.
- Ingeniería de RNA regulador (riboswitches): se puede condicionar la generación a un bolsillo proteico concreto para diseñar elementos de RNA que respondan a la presencia de esa proteína.
- Diseño de RNA guía para sistemas CRISPR: la variante permite explorar geometrías de interacción RNA-proteína Cas y proponer secuencias guía compatibles con el surco de unión.
- Descubrimiento de interacciones RNA-proteína en biología estructural: dado un complejo parcial, se generan hipótesis de la cadena de RNA faltante para guiar experimentos de cristalografía o cryo-EM.
- Diseño de terapias basadas en RNA: generación de candidatos de RNA con geometría compatible con una diana terapéutica, para su posterior filtrado por docking y simulación molecular.
- Aumento de datos para entrenamiento de modelos de estructura: se pueden generar complejos RNA-proteína sintéticos con coordenadas realistas para ampliar datasets de plegamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Con 355,687 M de parámetros en el modelo de coordenadas y un repositorio de 1,4 GB, la inferencia requiere GPU dedicada; no se especifica el consumo exacto.
- GPU recomendadas: no disponible. Por el tamaño del modelo y el coste de la difusión all-atom, se espera que requiera GPUs de datacenter (A100, H100) o equivalentes, pero no se confirma en la documentación.
- Cabeza en GPU de consumo: no disponible. No se confirma compatibilidad con RTX 4090 u otras GPU consumer.
- Opciones de despliegue: la única vía documentada es la librería `ofoldx` (`pip install ofoldx`) mediante `ofoldx.pipeline("design", ...)`. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| oteam/odesign-rna-rigid | Difusión all-atom + gRNAde | 355,687 M (coordenadas) | no aplica | AGPL-3.0 | Hugging Face (no oficial) |
| oteam/odesign-dna-rigid | Difusión all-atom + OInvFold | 355,687 M (coordenadas) | no aplica | AGPL-3.0 | Hugging Face (no oficial) |
| oteam/odesign-protein-rigid | Difusión all-atom + MPNN | 355,687 M (coordenadas) | no aplica | AGPL-3.0 | Hugging Face (no oficial) |
| oteam/odesign-protein-flex | Difusión all-atom + MPNN | 355,687 M (coordenadas) | no aplica | AGPL-3.0 | Hugging Face (no oficial) |
| oteam/odesign-ligand-rigid | Difusión all-atom + OInvFold ligando | 355,687 M (coordenadas) | no aplica | AGPL-3.0 | Hugging Face (no oficial, provisional) |

No se dispone de datos de benchmarks que permitan comparar el rendimiento frente a alternativas externas de diseño de RNA.

## Limitaciones y advertencias

- Implementación no oficial: la model card ha sido redactada por el equipo OFoldX, no por los autores originales de ODesign; los resultados pueden diferir de los del repositorio oficial.
- Licencia AGPL-3.0: impone obligaciones de copyleft fuerte; el uso comercial en servicios en red requiere liberar el código fuente derivado, lo que puede ser incompatible con productos propietarios.
- El contexto rígido no permite reorganización del receptor: si la diana experimenta cambios conformacionales al unirse al RNA, el modelo no los capturará; para esos casos existe la variante flexible de proteína, pero no hay variante RNA flexible publicada.
- La asignación de secuencia depende de gRNAde, cuyas limitaciones y sesgos se heredan; no se documentan métricas de éxito de plegamiento para las secuencias generadas.
- Riesgo de geometrías no físicas: como todo modelo de difusión all-atom, puede producir candidatos con clashes estéricos o longitudes de enlace no realistas que requieren validación posterior con herramientas de física molecular.
- No se documentan sesgos del dataset de entrenamiento ni la distribución de estructuras utilizadas, lo que limita la evaluación de su generalización fuera de las familias de complejos representadas.
- No es un modelo de lenguaje: no procesa texto, no soporta tool calling y no tiene capacidades de razonamiento simbólico.
- No se especifican requisitos de hardware ni latencias, lo que dificulta planificar su despliegue en producción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin evidencia de validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/oteam/odesign-rna-rigid
- Variante proteína flexible: https://huggingface.co/oteam/odesign-protein-flex
- Variante proteína rígida: https://huggingface.co/oteam/odesign-protein-rigid
- Variante DNA rígida: https://huggingface.co/oteam/odesign-dna-rigid
- Variante ligando rígida: https://huggingface.co/oteam/odesign-ligand-rigid
- Paper: https://arxiv.org/abs/2510.22304
- Repositorio oficial: https://github.com/The-Institute-for-AI-Molecular-Design/ODesign
- Código de la implementación: https://github.com/OTeam-AI4S/OFoldX/tree/main/ofoldx/models/odesign
- Documentación de la librería: https://ofoldx.valtech.ai/
- Guía de pipelines: https://github.com/OTeam-AI4S/OFoldX/blob/main/ofoldx/pipelines/README.md
- Guía de química: https://github.com/OTeam-AI4S/OFoldX/blob/main/ofoldx/chemistry/README.md
