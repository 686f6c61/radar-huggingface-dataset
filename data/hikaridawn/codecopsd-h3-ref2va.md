# HikariDawn/CodecOPSD-H3-Ref2VA

## Resumen

CodecOPSD-H3-Ref2VA es un adaptador LoRA para el modelo MiniMax-H3 Ref2VA de MiniMaxAI, orientado a la generacion de video a partir de referencias visuales (reference-to-video). Lo desarrolla HikariDawn y implementa la tecnica CodecOPSD (On-Policy Codec Distillation), un metodo de destilacion on-policy combinado con poda de tokens basada en codec de video. El problema que aborda es el coste computacional creciente de los generadores de secuencia: modelos como MiniMax-H3 Ref2VA, MiniMax-H3-Image, Qwen-Image 2.1 o FLUX 3 Image Klein anaden cada imagen o video de referencia a la secuencia de tokens de entrada, de modo que el coste crece de forma acusada al acumular referencias.

La propuesta consiste en podar los tokens de condicion redundantes mediante un codec de video y entrenar un LoRA pequeno sobre los tokens conservados mediante autodestilacion on-policy. Segun la model card, en MiniMax-H3 Ref2VA se elimina aproximadamente el 70% de los tokens de condicion con una calidad practicamente inalterada, logrando un denoising 1,87 veces mas rapido y hasta 8,4 veces mas rapido con mas condiciones (tres videos de referencia, referencias de mayor resolucion, mas frames y mayor tasa de poda). En MiniMax-H3-Image se elimina alrededor del 65% de los tokens de referencia y el denoising se acelera aproximadamente 2 veces.

El repositorio contiene unicamente los pesos LoRA (5,9 GB) para la tarea reference-to-video sobre MiniMax-H3 Ref2VA, no el modelo base completo. Es relevante ahora porque reduce de forma sustancial el coste de inferencia de un generador de video de referencia sin requerir reentrenamiento del modelo base, y porque forma parte de una familia de variantes (H3-Image, Cosmos 3 Nano, Qwen-Image 2.1, FLUX 3 Image Klein) que extienden la tecnica a otros generadores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre MiniMax-H3 Ref2VA; poda de tokens mediante codec de video y destilacion on-policy |
| Parametros totales | no disponible (adaptador LoRA; tamano del repo 5,9 GB) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (definida por el modelo base MiniMax-H3 Ref2VA) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en |
| Licencia | minimax-h3-community-license-agreement (license: other) |
| Formato de pesos | no disponible (repo de pesos LoRA; formato concreto no especificado) |

## Arquitectura y entrenamiento

El adaptador se construye sobre MiniMax-H3 Ref2VA, un generador de secuencia que concatena cada imagen o video de referencia a la secuencia de tokens de entrada. CodecOPSD introduce un codec de video que poda los tokens de condicion redundantes antes del denoising, reduciendo la longitud efectiva de la secuencia. Sobre los tokens conservados se entrena un LoRA pequeno mediante autodestilacion on-policy, de modo que el adaptador aprende a reproducir el comportamiento del modelo original (teacher) operating sobre la representacion podada.

La innovacion principal es la combinacion de poda de tokens guiada por codec con destilacion on-policy: en lugar de reentrenar el generador completo, se entrena un adaptador ligero que compensa la informacion perdida por la poda. La model card reporta tasas de poda del orden del 70% en MiniMax-H3 Ref2VA y del 65% en MiniMax-H3-Image, con aceleraciones de denoising de 1,87x a 8,4x segun el numero y resolucion de referencias, el numero de frames y la tasa de poda. No se detalla en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se empleo RLHF o DPO.

## Capacidades

- Generacion de video condicionada por referencias visuales (reference-to-video): toma imagenes y videos de referencia (identidad de personajes, escenarios, efectos) y genera video coherente con ellas.
- Poda de tokens de condicion mediante codec de video, reduciendo el coste de atencion sobre las referencias.
- Destilacion on-policy: el LoRA aprende a mantener la calidad del teacher sobre la secuencia podada.
- Aceleracion del denoising: 1,87x de media en MiniMax-H3 Ref2VA y hasta 8,4x con multiples condiciones.
- Soporte de multiples referencias simultaneas (identidad, escena, efectos) con tasas de poda variables por referencia.
- Generacion de secuencias largas: la model card cita ejemplos de 737 frames a 768x1344 con 278.256 tokens reducidos a 89.535.
- Idioma de la model card y de las referencias textuales: ingles (en).
- No se documentan en la informacion disponible capacidades de tool calling, agentes, vision por entrada de texto libre, audio ni modo thinking.

## Casos de uso

- Produccion de cortometrajes y piezas narrativas: la model card demuestra un corto ("Robot versus Monster") generado en cinco pasadas con MiniMax-H3 Ref2VA + CodecOPSD, manteniendo identidad de personajes (mech, monster) y escenas entre partes; la poda de tokens permite encadenar generaciones con varias referencias sin disparar el coste.
- Generacion de video con consistencia de personaje: usando referencias de identidad (frente y espalda del personaje) el adaptador conserva coherencia visual a lo largo de la secuencia, con poda del 53-65% en esas referencias.
- Previsualizacion rapida de escenas (greybox): la model card muestra greybox video con poda del 70%, util para iterar sobre blocking y camara antes de la generacion final.
- Animacion de efectos y VFX: referencias de efectos (por ejemplo, thruster effect con poda del 87%) permiten incorporar elementos visuales concretos con bajo coste de tokens.
- Prototipado de anuncios y contenido de marca: referencias de producto y escenario permiten generar variantes de video con identidad de marca consistente y tiempos de denoising reducidos.
- Investigacion en eficiencia de generadores de secuencia: el adaptador sirve como banco de pruebas para estudiar el equilibrio entre tasa de poda, calidad y latencia en modelos reference-to-video.
- Extension a otros generadores: la familia CodecOPSD incluye variantes para MiniMax-H3-Image y anuncia versiones para Cosmos 3 Nano, Qwen-Image 2.1 y FLUX 3 Image Klein, lo que permite reutilizar la metodologia en pipelines de imagen y video.

## Benchmarks y rendimiento

La model card no presenta una tabla de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.), pero reporta metricas de eficiencia y calidad subjetiva en tareas de generacion de video:

| Metrica | Resultado reportado |
|---|---|
| Poda de tokens de condicion en MiniMax-H3 Ref2VA | ~70% de media |
| Aceleracion de denoising en MiniMax-H3 Ref2VA | 1,87x de media |
| Aceleracion maxima con mas condiciones | hasta 8,4x |
| Poda de tokens en MiniMax-H3-Image | ~65% |
| Aceleracion de denoising en MiniMax-H3-Image | ~2x |
| Ejemplo de corto: 768x1344, 737 frames | 278.256 tokens -> 89.535 (-68%), denoising 344,9 s en 1x B200 |
| Parte 1: 141 frames | 53.568 -> 18.906 tokens (-65%), 67,1 s |
| Parte 2: 175 frames | 63.648 -> 17.458 tokens (-73%), 79,0 s |

No se han publicado resultados de benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- El adaptador LoRA ocupa 5,9 GB en el repositorio; el modelo base MiniMax-H3 Ref2VA requiere hardware adicional no especificado en la informacion disponible.
- La model card cita ejecuciones en 1x B200 para el ejemplo del cortometraje (denoising de 344,9 s para 737 frames a 768x1344).
- VRAM estimada para inferencia: no disponible (depende del modelo base y del numero de frames y referencias).
- GPU recomendadas: no disponible mas alla de la mencion de NVIDIA B200 en los ejemplos; no se documentan A100, H100 ni RTX 4090.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: la libreria indicada es minimax-h3; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: solo se reportan tiempos de denoising en los ejemplos citados (67,1 s y 79,0 s por parte en B200); no hay datos de throughput general.

## Comparativa con modelos similares

| Modelo | Base | Tarea | Poda de tokens | Aceleracion | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| CodecOPSD-H3-Ref2VA (este) | MiniMax-H3 Ref2VA | Reference-to-video | ~70% | 1,87x (hasta 8,4x) | minimax-h3-community-license-agreement | Hugging Face (19 descargas) |
| CodecOPSD-H3-Image | MiniMax-H3-Image | Reference-to-image | ~65% | ~2x | no disponible | Hugging Face |
| MiniMax-H3 Ref2VA (base) | - | Reference-to-video | 0% | 1x (referencia) | no disponible | Hugging Face (MiniMaxAI) |
| CodecOPSD on Cosmos 3 Nano | Cosmos 3 Nano | no disponible | no disponible | no disponible | no disponible | anunciado, proximamente |
| CodecOPSD on Qwen-Image 2.1 | Qwen-Image 2.1 | no disponible | no disponible | no disponible | no disponible | anunciado, proximamente |
| CodecOPSD on FLUX 3 Image Klein | FLUX 3 Image Klein | no disponible | no disponible | no disponible | no disponible | anunciado, proximamente |

## Limitaciones y advertencias

- Es un adaptador LoRA, no un modelo autonomo: requiere el modelo base MiniMax-H3 Ref2VA para funcionar.
- La licencia es la minimax-h3-community-license-agreement (license: other); es necesario revisar el texto de la licencia antes de cualquier uso comercial, ya que no se detallan en la informacion disponible las restricciones concretas.
- La poda de tokens puede degradar la fidelidad a las referencias en casos extremos (tasas de poda muy altas, muchas referencias, alta resolucion); la model card afirma calidad "casi inalterada" pero no aporta metricas objetivas de fidelidad.
- Riesgo de alucinacion visual: como generador, puede inventar detalles no presentes en las referencias, especialmente en zonas podadas agresivamente.
- Idioma soportado limitado a ingles (en) en la metadata; no se documenta soporte multilingue para prompts.
- Solo se documentan resultados en MiniMax-H3 Ref2VA e H3-Image; el rendimiento en otras bases (Cosmos 3 Nano, Qwen-Image 2.1, FLUX 3 Image Klein) esta anunciado pero no disponible.
- No se publican benchmarks estandar ni evaluaciones objetivas de calidad de video, por lo que la comparacion con alternativas carece de datos cuantitativos.
- Adopcion muy baja (19 descargas, 1 like) en el momento de la consulta, lo que implica escasa validacion comunitaria.
- No se detallan requisitos de VRAM ni compatibilidad con GPUs de consumo, lo que dificulta planificar despliegues en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HikariDawn/CodecOPSD-H3-Ref2VA
- Repositorio GitHub: https://github.com/Kiteretsu77/CodecOPSD
- Pagina del proyecto: https://kiteretsu77.github.io/CodecOPSD_website/
- Paper (arXiv): https://arxiv.org/abs/2611.31184
- Demo (Hugging Face Space): https://huggingface.co/spaces/HikariDawn/CodecOPSD-H3-Ref2VA
- Coleccion de modelos: https://huggingface.co/collections/HikariDawn/codecopsdopsd-6b04b49f98f5b4b68c5f7f9a
- Variante H3-Image: https://huggingface.co/HikariDawn/CodecOPSD-H3-Image
- Modelo base MiniMax-H3: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Modelo base MiniMax-H3-Image: https://huggingface.co/MiniMaxAI/MiniMax-H3-Image
