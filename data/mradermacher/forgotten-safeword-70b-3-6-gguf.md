# mradermacher/Forgotten-Safeword-70B-3.6-GGUF

## Resumen

Forgotten-Safeword-70B-3.6-GGUF es una coleccion de cuantizaciones GGUF estaticas del modelo base ReadyArt/Forgotten-Safeword-70B-3.6, publicadas por mradermacher. El modelo base es un fine-tune de 70.553.722.944 parametros (aproximadamente 70,5 mil millones) derivado de la familia Llama 3.3, segun indica la licencia declarada. La model card del repositorio de cuantizacion no aporta informacion sobre la arquitectura interna, los datos de entrenamiento ni el proceso de ajuste fino del modelo original.

El repositorio tiene como proposito principal ofrecer versiones comprimidas del modelo en formato GGUF para su ejecucion con llama.cpp y herramientas compatibles. Incluye cuantizaciones estaticas desde Q2_K (26,5 GB) hasta Q8_0 (75,1 GB), con algunas divididas en dos partes. Las cuantizaciones ponderadas con imatrix se publican en un repositorio separado (Forgotten-Safeword-70B-3.6-i1-GGUF).

Por sus etiquetas, el modelo esta orientado a roleplay, contenido explicito y ERP (erotic roleplay), con la marca "unaligned" y "dangerous". Esta catalogado como no apto para todas las audiencias y solo declara soporte para ingles. Su relevancia actual es limitada: cuenta con 44 descargas y 1 like, y no se han publicado resultados de benchmarks en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base derivado de la familia Llama 3.3) |
| Parametros totales | 70.553.722.944 (~70,5 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (estaticas); variantes i1 (imatrix) en repositorio aparte |
| Idiomas soportados | en (ingles) |
| Licencia | llama3.3 |
| Formato de pesos | GGUF (repo de cuantizacion); pesos originales del modelo base no especificados en esta ficha |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base en la documentacion proporcionada. La model card del repositorio de cuantizacion solo indica que se trata de cuantizaciones estaticas del modelo ReadyArt/Forgotten-Safeword-70B-3.6, con un total de 70.553.722.944 parametros segun los datos de safetensors. La licencia declarada (llama3.3) sugiere que el modelo base pertenece a la familia Llama 3.3, pero no se detalla si emplea attention estandar, atencion lineal, mezcla de expertos u otra variante.

Tampoco se documentan el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o ajuste fino supervisado. Las etiquetas "unaligned" y "dangerous" indican que el ajuste fino ha reducido deliberadamente las barreras de alineacion y seguridad del modelo original, pero se desconoce el metodo concreto empleado. Las cuantizaciones fueron generadas con la herramienta de mradermacher (convert_type: hf, quantize_version: 2, output_tensor_quantised: 1), y las versiones ponderadas con imatrix se distribuyen por separado.

## Capacidades

- Generacion de texto conversacional en ingles, orientada a dialogos multi-turno.
- Roleplay y ERP (erotic roleplay), segun las etiquetas del repositorio.
- Contenido explicito y NSFW, declarado en las etiquetas.
- Modelo marcado como "unaligned": menor adherencia esperada a las salvaguardas de seguridad del modelo original.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: solo se declara ingles.
- Capacidades especiales (modo thinking, vision, audio): no disponibles en la informacion proporcionada.

## Casos de uso

- Roleplay conversacional: el modelo esta disenado para mantener personajes y dialogos multi-turno en ingles, con tolerancia a contenido explicito segun las etiquetas del repositorio.
- Generacion de ficcion para adultos: puede emplearse para redactar narrativa explicita o erotica, ambito declarado por el autor del modelo base.
- Experimentacion con modelos "unaligned": util para investigadores que estudian el comportamiento de modelos con alineacion reducida y sus riesgos asociados.
- Evaluacion de cuantizaciones GGUF: las distintas variantes (Q2_K a Q8_0) permiten medir el impacto de la compresion en la calidad de generacion sobre un mismo modelo base de 70B.
- Despliegue local en llama.cpp: las versiones Q4_K_M (42,6 GB) y Q5_K_M (50,0 GB) permiten ejecutar un modelo de 70B en hardware con suficiente memoria, sin depender de infraestructura en la nube.
- Fine-tuning adicional o investigacion sobre modelos Llama 3.3: el modelo base puede servir como punto de partida para experimentos de ajuste, siempre que se respete la licencia llama3.3.
- Pruebas de seguridad y red teaming: al estar marcado como "dangerous" y "unaligned", es un candidato para evaluar filtros de contenido y sistemas de moderacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (segun el tamano de cada cuantizacion): Q2_K ~26,5 GB; Q3_K_S ~31,0 GB; Q3_K_M ~34,4 GB; Q3_K_L ~37,2 GB; IQ4_XS ~38,4 GB; Q4_K_S ~40,4 GB; Q4_K_M ~42,6 GB; Q5_K_S ~48,8 GB; Q5_K_M ~50,0 GB; Q6_K ~58,0 GB; Q8_0 ~75,1 GB. Estas cifras corresponden al tamano de los ficheros y no incluyen el overhead de contexto KV cache.
- GPU recomendadas: no disponibles en la informacion proporcionada. Por el tamano de los ficheros, las cuantizaciones de 4 bits (40-43 GB) requieren GPUs con 48 GB o mas de VRAM (por ejemplo, A6000, A100 80GB, H100) o configuraciones multi-GPU; las de 2-3 bits podrian ajustarse en GPUs de 32-40 GB.
- Cabe en GPU consumer: las cuantizaciones Q2_K (26,5 GB) y Q3_K_S (31,0 GB) podrian ajustarse en una RTX 4090 de 24 GB solo con offloading parcial a RAM; Q4_K_M y superiores no caben en GPUs consumer de 24 GB sin offloading.
- Opciones de despliegue: llama.cpp y herramientas compatibles con GGUF (Ollama, llama-cpp-python, servidores basados en llama.cpp). Los ficheros Q6_K y Q8_0 estan divididos en dos partes y requieren concatenacion previa.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Forgotten-Safeword-70B-3.6-GGUF | ~70,5 mil millones | no disponible | llama3.3 | GGUF | Hugging Face (44 descargas) |
| Llama 3.3 70B Instruct | ~70 mil millones | no disponible en esta ficha | llama3.3 | safetensors, GGUF (comunidad) | Amplia, modelo oficial de Meta |
| Modelos de roleplay 70B de la comunidad | variable | variable | variable | GGUF | Hugging Face |

No se dispone de datos de rendimiento comparativos en la informacion proporcionada, por lo que la comparativa se limita a parametros, licencia y disponibilidad. El modelo comparte la base Llama 3.3 con el modelo oficial de Meta, pero se diferencia por el ajuste fino orientado a roleplay y contenido explicito.

## Limitaciones y advertencias

- Contenido explicito y NSFW: el modelo esta etiquetado como no apto para todas las audiencias y orientado a ERP y roleplay explicito; no es adecuado para aplicaciones dirigidas al publico general.
- Modelo "unaligned" y "dangerous": las etiquetas indican que se han reducido las salvaguardas de seguridad, lo que aumenta el riesgo de generar contenido danino, ofensivo o ilegal.
- Riesgo de alucinacion: no se dispone de datos especificos, pero al ser un modelo de 70B ajustado para roleplay, la fidelidad factual no esta garantizada.
- Idioma: solo se declara soporte para ingles; el rendimiento en castellano no esta documentado.
- Licencia llama3.3: el uso comercial y la redistribucion estan sujetos a los terminos de la licencia Llama 3.3, que deben consultarse antes de desplegar el modelo en produccion.
- Contexto: la longitud de contexto no esta documentada en esta ficha, lo que impide planificar aplicaciones que dependan de ventanas largas.
- Cuantizaciones de baja calidad: las variantes Q2_K y Q3_K_M (marcada como "lower quality") degradan la calidad de generacion; para produccion se recomienda Q4_K_M o superior.
- Ficheros multiparte: Q6_K y Q8_0 estan divididos en dos partes y requieren concatenacion antes de su uso.
- Trazabilidad limitada: la model card del repositorio de cuantizacion no documenta el proceso de entrenamiento del modelo base, lo que dificulta evaluar su procedencia y sesgos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Forgotten-Safeword-70B-3.6-GGUF
- Modelo base: https://huggingface.co/ReadyArt/Forgotten-Safeword-70B-3.6
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Forgotten-Safeword-70B-3.6-i1-GGUF
- Pagina de overview del autor: https://hf.tst.eu/model#Forgotten-Safeword-70B-3.6-GGUF
- Guia de uso de GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- nethype GmbH: https://www.nethype.de/
