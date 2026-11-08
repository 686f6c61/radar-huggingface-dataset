# Jas-preet/SPOT-1D-Single

## Resumen

SPOT-1D-Single es un conjunto de checkpoints para la predicción de propiedades estructurales de proteínas a partir de una única secuencia de aminoácidos, sin necesidad de alineamientos múltiples (MSA) ni perfiles evolutivos. Lo desarrolla Jaspreet Singh y colaboradores del grupo de Yaoqi Zhou, y se publicó originalmente en *Bioinformatics* en 2021. El modelo predice estructura secundaria en 3 y 8 estados, accesibilidad al disolvente (ASA), exposición de hemisferio (HSE-up y HSE-down), número de contactos y ángulos de cadena principal (ψ, ϕ, θ, τ).

La relevancia actual del modelo radica en que elimina la dependencia de bases de datos evolutivas como UniRef o BFD, cuyo coste computacional y de almacenamiento es elevado. Esto lo hace útil en escenarios donde no existe una MSA fiable, como proteínas huérfanas, secuencias de diseño de novo o entornos con recursos limitados. El repositorio de Hugging Face (1,2 GB) contiene un ensemble de tres arquitecturas en formato TorchScript, tanto para CPU como para GPU.

Se trata de un modelo especializado de bioinformática, no de un modelo de lenguaje generativo: no procesa texto libre ni mantiene conversaciones. Su salida son etiquetas estructurales y valores continuos por residuo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensemble de tres redes: LSTM bidireccional, ResNet multi-escala y ResNet-LSTM multi-escala |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesa secuencias de proteina de longitud variable) |
| Tipos de cuantizacion | no disponible (checkpoints TorchScript en CPU y GPU) |
| Idiomas soportados | no aplica (entrada: secuencias de aminoacidos) |
| Licencia | MIT |
| Formato de pesos | TorchScript (archivo `jits.tar.xz`, 1,2 GB) |

## Arquitectura y entrenamiento

El modelo combina tres arquitecturas complementarias en un ensemble: una LSTM bidireccional, una ResNet multi-escala y una ResNet-LSTM multi-escala. Cada una se entrena en variantes de clasificación (estructura secundaria, HSE) y de regresión (ASA, ángulos, número de contactos). Los checkpoints se distribuyen compilados como TorchScript, con versiones separadas para CPU y GPU, lo que permite inferencia sin depender del código fuente original de PyTorch.

El entrenamiento se realizó sobre 39.120 proteínas de ProteinNet (entradas del PDB anteriores a 2016, resolución inferior a 2,5 Å, agrupadas al 95 % de identidad de secuencia). La evaluación se hizo sobre conjuntos independientes: TEST2018, SPOT-2016, SPOT-2018, CASP12-FM y CASP13-FM. La innovación principal es la predicción sin MSA: el modelo aprende directamente de la secuencia individual, lo que reduce drásticamente el coste de preprocesamiento frente a métodos como SPOT-1D original, que requiere perfiles evolutivos.

## Capacidades

- Predicción de estructura secundaria en 3 estados (hélice, hoja, espiral) y 8 estados (Q3 y Q8).
- Predicción de accesibilidad al disolvente (ASA) por residuo.
- Predicción de exposición de hemisferio superior e inferior (HSE-up y HSE-down).
- Predicción de número de contactos por residuo.
- Predicción de ángulos de cadena principal: ψ, ϕ, θ y τ.
- Funciona con una única secuencia, sin MSA ni perfiles evolutivos.
- Inferencia en CPU y GPU mediante TorchScript.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües.
- No es un modelo generativo de texto ni de visión.

## Casos de uso

- Anotación estructural rápida de proteínas huérfanas: cuando no existe una MSA fiable, el modelo predice estructura secundaria y ASA directamente desde la secuencia, evitando búsquedas en UniRef.
- Diseño de proteínas de novo: en pipelines de diseño computacional, el modelo puede evaluar la plausibilidad estructural de secuencias generadas sin depender de homólogos naturales.
- Filtrado previo en cribado masivo: al ser un modelo ligero en inferencia (TorchScript en CPU), permite anotar miles de secuencias antes de pasar a métodos más costosos como AlphaFold.
- Análisis de variantes y mutaciones: permite comparar predicciones de estructura secundaria entre secuencia wild-type y mutante para detectar cambios locales en accesibilidad o ángulos.
- Docencia y bioinformática básica: sirve como herramienta didáctica para ilustrar la relación secuencia-estructura sin infraestructura de MSA.
- Integración en pipelines de anotación genómica: como paso de enriquecimiento funcional en flujos que procesan proteomas completos.
- Validación cruzada de predictores basados en MSA: sirve como referencia independiente para detectar sesgos en métodos que dependen de perfiles evolutivos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite al artículo de *Bioinformatics* (2021) para los resultados en TEST2018, SPOT-2016, SPOT-2018, CASP12-FM y CASP13-FM, pero no se incluyen cifras en la información proporcionada.

## Requisitos de hardware

- VRAM estimada: no disponible. El repositorio incluye checkpoints TorchScript para CPU y GPU, lo que sugiere que la inferencia en CPU es viable.
- GPU recomendadas: no disponible. Al ser un ensemble de LSTM y ResNet de tamaño moderado, es probable que quepa en GPUs de consumo, pero no se confirma en la información.
- Cabe en GPU de consumo: no confirmado; la existencia de versiones CPU indica que no requiere GPU.
- Opciones de despliegue: TorchScript (CPU/GPU) mediante el repositorio de GitHub; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Entrada | Predicciones | Licencia | Disponibilidad |
|---|---|---|---|---|
| SPOT-1D-Single | Secuencia única | Q3, Q8, ASA, HSE, contactos, ángulos | MIT | Hugging Face + GitHub |
| SPOT-1D (original) | MSA / perfiles evolutivos | Q3, Q8, ASA, HSE, contactos, ángulos | no disponible | GitHub |
| AlphaFold2 | MSA | Estructura 3D completa | no disponible | GitHub |
| no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo especializado en bioinformática: no es un modelo de lenguaje ni generativo; no debe evaluarse con benchmarks de NLP.
- Dependencia de la secuencia única: al prescindir de MSA, la precisión en proteínas con pocos homólogos puede ser inferior a la de métodos basados en perfiles evolutivos.
- Sesgo de datos: entrenado con entradas del PDB anteriores a 2016 con resolución < 2,5 Å; puede estar sesgado hacia familias proteicas sobrerrepresentadas en el PDB.
- Riesgo de alucinación estructural: las predicciones son estimaciones probabilísticas, no estructuras experimentales; no deben usarse como verdad ground truth.
- Licencia MIT: permite uso comercial, pero el repositorio de GitHub indica que la versión standalone es "for research purposes"; conviene revisar los términos del código y del artículo.
- Sin soporte de tool calling, agentes ni multi-step reasoning.
- Idiomas: no aplica; la entrada es una secuencia de aminoácidos, no texto.
- El archivo `jits.tar.xz` requiere verificación SHA-256 antes de su uso; la model card proporciona el hash.

## Enlaces

- Hugging Face: https://huggingface.co/Jas-preet/SPOT-1D-Single
- GitHub: https://github.com/jas-preet/SPOT-1D-Single
- Perfil del autor en GitHub: https://github.com/jas-preet
- Artículo: https://doi.org/10.1093/bioinformatics/btab316
- Descarga directa del checkpoint: https://huggingface.co/Jas-preet/SPOT-1D-Single/resolve/main/jits.tar.xz
