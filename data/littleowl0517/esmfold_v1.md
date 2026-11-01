# LittleOwl0517/esmfold_v1

## Resumen

ESMFold es un modelo de plegamiento de proteinas end-to-end desarrollado por Meta AI (FAIR) sobre una arquitectura de lenguaje ESM-2 como backbone. Predice la estructura tridimensional de una proteina a partir unicamente de su secuencia de aminoacidos, sin necesidad de alineamiento multiple de secuencias (MSA) ni de bases de datos externas como UniRef o MGnify. Esto lo diferencia de AlphaFold2, que requiere un pipeline de busqueda MSA y por tanto un coste computacional y de infraestructura mucho mayor.

El repositorio `LittleOwl0517/esmfold_v1` es una redistribucion de los pesos de ESMFold publicados originalmente por Facebook Research, empaquetada para su uso con `transformers` (clase `EsmFoldForProteinFolding`). El autor del repositorio no es el desarrollador original del modelo; se trata de una copia con licencia MIT que ocupa 8,4 GB en formato PyTorch. El modelo esta pensado para inferencia rapida de estructuras proteicas a escala genoma, no para entrenamiento.

Su relevancia actual radica en que permite plegar secuencias en segundos por proteina en una sola GPU, lo que habilita aplicaciones de alto rendimiento como anotacion estructural masiva, cribado de variantes o generacion de estructuras para diseño de proteinas, a costa de una precision algo inferior a AlphaFold2 en regiones de baja confianza.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer ESM-2 (backbone) + modulo de plegamiento con estructura de atención y actualizacion iterativa de coordenadas |
| Parametros totales | no disponible (repo de 8,4 GB en pesos PyTorch; el backbone ESM-2 asociado es de ~3B parametros segun la literatura, no confirmado en la model card) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la model card (limite practico de ESM-2 en torno a 1024 residuos, no confirmado aqui) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de proteinas, no de lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | PyTorch (safetensors/bin segun el repo; no se especifica en la model card) |

## Arquitectura y entrenamiento

ESMFold combina un backbone de lenguaje proteico ESM-2 con un cabezal de plegamiento que transforma las representaciones por residuo en coordenadas atomicas 3D. La innovacion principal es que elimina por completo el modulo de MSA: en lugar de depender de alineamientos evolutivos, aprovecha las representaciones contextuales aprendidas por ESM-2 durante el preentrenamiento en grandes corpus de secuencias proteicas. El cabezal de plegamiento opera de forma iterativa, refinando la estructura a partir de las representaciones del backbone y de la geometria de la cadena.

Los detalles exactos de entrenamiento (numero de tokens, composicion del dataset, uso de RLHF/DPO o fases de fine-tuning) no se recogen en la model card de este repositorio; la informacion remite al paper asociado en *Science* (2022). La model card unicamente indica que el modelo es end-to-end, que no requiere lookup ni MSA, y que por ello la inferencia es muy significativamente mas rapida que AlphaFold2. No se documentan en este repositorio innovaciones adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Prediccion de estructura 3D de proteinas a partir de secuencia primaria de aminoacidos.
- Plegamiento end-to-end sin MSA ni bases de datos externas.
- Generacion de coordenadas atomicas (backbone y, segun la implementacion, atomos laterales) utilizables en formatos PDB.
- Inferencia rapida apta para procesar grandes volumenes de secuencias.
- No soporta tool calling, function calling ni razonamiento multi-step.
- No es un modelo multilingue: no procesa lenguaje natural.
- No dispone de modo "thinking", vision ni audio.
- No se documentan capacidades de prediccion de complejos, ligandos o modificaciones postraduccionales.

## Casos de uso

- Anotacion estructural masiva de proteomas: plegar decenas de miles de secuencias en un solo nodo GPU sin infraestructura MSA, gracias a la ausencia de busqueda en bases de datos.
- Cribado de variantes missense: plegar la proteina wild-type y cada variante para comparar estructuras y detectar cambios conformacionales o perdida de plegamiento.
- Priorizacion en pipelines de metagenomica: obtener estructuras aproximadas de proteinas desconocidas para inferir funcion por similitud estructural, sin depender de UniProt.
- Generacion de estructuras de partida para docking molecular o simulacion de dinamica molecular, usando la prediccion como conformacion inicial.
- Diseño de proteinas: evaluar rapidamente la plausibilidad estructural de secuencias generadas por modelos generativos antes de sintetizarlas.
- Docencia y prototipado: obtener estructuras 3D de forma interactiva en un notebook Colab para explorar relaciones secuencia-estructura.
- Integracion en pipelines de anotacion funcional: combinar la estructura predicha con herramientas de alineamiento estructural para asignar familias proteicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el repo pesa 8,4 GB en pesos, por lo que se requiere al menos una GPU con ~10-16 GB de VRAM en precision completa, y menos con cuantizacion (no documentada).
- GPU recomendadas: no especificadas en la model card. Por tamano, cabria esperar A100, H100 o RTX 4090/A6000; no confirmado.
- Cabe en GPU de consumo: probablemente en RTX 3090/4090 por capacidad de VRAM, aunque no esta documentado.
- Opciones de despliegue: `transformers` con `EsmFoldForProteinFolding`; el tutorial oficial usa un notebook de Colab. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: la model card afirma que la inferencia es "muy significativamente mas rapida" que AlphaFold2, pero no se aportan numeros concretos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Requiere MSA | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ESMFold (este repo) | no disponible (repo 8,4 GB) | no disponible | No | MIT | HuggingFace |
| AlphaFold2 | no disponible en la informacion | no disponible | Si | no disponible en la informacion | no disponible en la informacion |
| RoseTTAFold | no disponible en la informacion | no disponible | Si | no disponible en la informacion | no disponible en la informacion |

No se dispone de datos de benchmarks ni de especificaciones detalladas de los modelos alternativos en la informacion proporcionada; la comparativa se limita a la ausencia de MSA como diferenciador cualitativo documentado en la model card.

## Limitaciones y advertencias

- Precision inferior a AlphaFold2 en regiones de baja confianza (bucles y dominios poco representados), segun la literatura general; no cuantificado en la model card.
- Riesgo de estructuras incorrectas en proteinas con dominios raros, largas o con muchas regiones desordenadas.
- Limite practico de longitud de secuencia no documentado en este repositorio.
- No modela complejos multiméricos, ligandos, iones ni modificaciones postraduccionales.
- Sesgos derivados del corpus de entrenamiento de ESM-2: posible infrarepresentacion de ciertas familias proteicas.
- Licencia MIT permite uso comercial, pero el autor del repositorio no es el desarrollador original; conviene verificar la procedencia de los pesos.
- Repositorio con muy pocas descargas (14) y sin likes: no es la referencia canonica; para produccion se recomienda usar el repositorio oficial de Facebook Research.
- No se documentan cuantizaciones ni formatos alternativos, lo que limita el despliegue en hardware modesto.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/LittleOwl0517/esmfold_v1
- Paper asociado (Science): https://www.science.org/doi/10.1126/science.ade2574
- Tutorial notebook de HuggingFace: https://colab.research.google.com/github/huggingface/notebooks/blob/main/examples/protein_folding.ipynb
