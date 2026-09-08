# facebook/UMA

## Resumen

UMA (Universal Model for Atoms) es un modelo de red neuronal de grafos desarrollado por el equipo FAIR Chemistry de Meta. Está diseñado para predecir propiedades atómicas y moleculares a partir de estructuras, abordando problemas de química cuántica y ciencia de materiales. Se trata de un modelo de gran escala, entrenado con miles de millones de átomos procedentes de cinco datasets de simulación open science publicados por el equipo en los últimos cinco años. Su arquitectura combina redes de grafos con una mezcla de expertos lineales, lo que permite escalar el modelado de interacciones atómicas. El repositorio en HuggingFace tiene un tamaño de 41.7 GB y su acceso es restringido, requiriendo aceptar condiciones previas. El modelo se presentó junto con OMol25, otro lanzamiento de Meta AI en el ámbito de la química. No se dispone de información sobre el número total de parámetros ni sobre benchmarks públicos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-linear-experts graph network (GNN) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (no aplica, modelo de grafos) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no aplica, modelo para datos atomicos) |
| Licencia | other (licencia personalizada de Meta) |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

UMA es un modelo de red neuronal de grafos que emplea una mezcla de expertos lineales. Esta arquitectura esta pensada para capturar las interacciones entre atomos en estructuras moleculares y cristalinas. El entrenamiento se realizo con miles de millones de atomos procedentes de cinco datasets de simulacion open science publicados por el equipo FAIR Chemistry. Segun el repositorio fairchem, los modelos UMA y los modelos legacy inorganicos entrenados con OMat24 utilizan etiquetas de energia total DFT y DFT+U. El paper asociado es arxiv:2506.23971. No se dispone de informacion detallada sobre el numero de parametros ni sobre el proceso de entrenamiento mas alla de estos datos.

## Capacidades

- Prediccion de propiedades atomicas y moleculares, como energias totales y fuerzas, a partir de estructuras.
- Modelado de sistemas quimicos y materiales, incluyendo estructuras cristalinas y moleculares.
- Entrenado en cinco datasets de simulacion open science, lo que le confiere una base amplia de datos de quimica cuantica.
- No es un modelo de lenguaje: no ofrece generacion de texto, razonamiento, codigo, matematicas ni vision.
- No soporta tool calling, function calling, agentes ni multi-step reasoning en el sentido de los LLM.
- Capacidades multilingues: no disponibles (no aplica).

## Casos de uso

- Descubrimiento de nuevos materiales: el modelo puede predecir energias de formacion y estabilidad de estructuras cristalinas, lo que permite filtrar candidatos antes de sintetizarlos en laboratorio.
- Catalisis: permite estimar energias de adsorcion de moleculas en superficies metalicas, acelerando el diseno de catalizadores.
- Dinamica molecular: puede usarse como potencial interatomico para simulaciones de dinamica molecular a gran escala, sustituyendo calculos DFT costosos.
- Diseno de baterias: aplicable a la prediccion de propiedades de electrolitos, electrodos y materiales de anodo/catodo.
- Quimica cuantica: aproxima calculos de estructura electronica (DFT y DFT+U) de forma mucho mas rapida, permitiendo explorar espacios quimicos amplios.
- Screening de aleaciones y perovskitas: util para identificar composiciones con propiedades optimas para aplicaciones energeticas o electronicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible.
- GPU recomendadas: no disponible.
- No se dispone de informacion sobre si cabe en GPU de consumo.
- Opciones de despliegue: el modelo se integra en el ecosistema fairchem (GitHub: facebookresearch/fairchem). No se mencionan vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en los datos proporcionados. Dentro del ecosistema fairchem existen modelos legacy entrenados con OMat24, pero no se han encontrado especificaciones concretas para comparar.

## Limitaciones y advertencias

- Acceso restringido: el repositorio en HuggingFace es gated, por lo que es necesario aceptar las condiciones de la licencia antes de descargar el modelo.
- Licencia personalizada: la licencia aparece como "other", lo que implica terminos especificos de Meta. Se debe revisar detenidamente antes de cualquier uso comercial.
- Ambito limitado: es un modelo para quimica y ciencia de materiales, no un modelo de lenguaje. No puede realizar tareas de texto, razonamiento general ni generacion de contenido.
- Compatibilidad: segun el repositorio fairchem, los modelos UMA y los modelos legacy inorganicos entrenados con OMat24 usan etiquetas DFT y DFT+U, y no son compatibles entre si en ciertos aspectos. Es necesario verificar la documentacion.
- Sesgos en datos: al estar entrenado en datasets de simulacion, las predicciones pueden verse sesgadas por las condiciones y aproximaciones de los calculos DFT utilizados.
- Riesgo de alucinacion: no aplica en el sentido de los modelos generativos de texto, pero las predicciones pueden ser inexactas para sistemas fuera de la distribucion de entrenamiento.

## Enlaces

- HuggingFace: https://huggingface.co/facebook/UMA
- GitHub fairchem: https://github.com/facebookresearch/fairchem
- Paper arxiv: https://arxiv.org/abs/2506.23971
- Post de Meta AI sobre OMol25 y UMA: https://www.facebook.com/LifeAtMeta/posts/metas-fair-team-just-released-omol25-and-universal-model-for-atomsopen-source-to/1002067392089512/
