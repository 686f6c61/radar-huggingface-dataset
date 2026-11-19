# mradermacher/open-cabrita3b-GGUF

## Resumen

`mradermacher/open-cabrita3b-GGUF` es una colección de cuantizaciones estáticas en formato GGUF del modelo base `22h/open-cabrita3b`, publicada por el usuario mradermacher el 21 de diciembre de 2024. No se trata de un modelo entrenado desde cero, sino de una redistribución optimizada para inferencia local del modelo original de 3.554.473.600 parámetros (aproximadamente 3,55 mil millones), orientado a tareas de generación de texto en portugués e inglés.

El valor de este repositorio reside en que ofrece el modelo en múltiples niveles de cuantización (desde Q2_K hasta f16), lo que permite ejecutarlo en hardware muy diverso, desde GPUs de consumo con 4-6 GB de VRAM hasta servidores con aceleradores de mayor capacidad. El modelo base está publicado bajo licencia Apache 2.0, lo que facilita su uso comercial y su integración en productos derivados.

La relevancia actual de esta ficha es doble: por un lado, documenta una alternativa ligera y de licencia permisiva para tareas de NLP en portugués; por otro, sirve como ejemplo de la cadena de herramientas de cuantización comunitaria (llama.cpp, imatrix) que permite desplegar modelos de 3-4 mil millones de parámetros en entornos sin infraestructura dedicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (no se especifica variante en la informacion disponible) |
| Parametros totales | 3.554.473.600 |
| Parametros activos | no disponible (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, IQ4_XS, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | portugues (pt), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base original en safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base `22h/open-cabrita3b` en la documentacion proporcionada. Por el numero de parametros (3,55 mil millones) y la nomenclatura, se trata presumiblemente de un transformer decoder-only de escala pequena-media, pero no se confirma la variante exacta (por ejemplo, si emplea GQA, RoPE, SwiGLU u otras optimizaciones habituales en modelos de esta talla). Tampoco se especifican el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de alineacion como RLHF o DPO.

La contribucion tecnica de este repositorio concreto es la cuantizacion. mradermacher emplea la cadena de herramientas de llama.cpp para generar cuantizaciones estaticas (Q2_K a Q8_0) y, en un repositorio hermano (`open-cabrita3b-i1-GGUF`), cuantizaciones ponderadas con imatrix, que suelen ofrecer mejor relacion calidad/tamano que las estaticas equivalentes. El proceso de cuantizacion reduce el peso de los tensores a 2-8 bits por parametro, lo que disminuye el tamano del modelo desde 7,2 GB en f16 hasta 2,2 GB en Q2_K.

## Capacidades

- Generacion de texto en portugues e ingles, segun los idiomas declarados en la model card.
- Razonamiento basico y respuesta a instrucciones, asumiendo que el modelo base fue ajustado para ello (no confirmado en la informacion disponible).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso explicito.
- No se documenta capacidad de vision, audio ni modo "thinking".
- Capacidades multilingues limitadas a portugues e ingles.
- Al ser una cuantizacion GGUF, es compatible con llama.cpp, Ollama y otros motores que consumen este formato.

## Casos de uso

- Generacion de texto en portugues para blogs y medios: el modelo puede redactar borradores y resumenes en portugues, y su tamano reducido permite ejecutarlo en una GPU de consumo con cuantizacion Q4_K_M (2,8 GB), lo que abarata el coste por inferencia frente a modelos mayores.
- Clasificacion y etiquetado de textos: con 3,55 mil millones de parametros y licencia Apache 2.0, es viable desplegarlo en pipelines de procesamiento por lotes para tareas de clasificacion, extraccion de entidades o moderacion basica en corpus en portugues.
- Asistente conversacional ligero en local: la cuantizacion Q8_0 (3,9 GB) permite ejecutar el modelo en una RTX 3060 de 12 GB o similar, ofreciendo respuestas en tiempo real para prototipos de chatbot sin depender de la nube.
- Traduccion portugues-ingles: al declarar ambos idiomas, puede emplearse en tareas de traduccion automatica de calidad media, especialmente en dominios generales y con cuantizaciones Q5_K_M o superiores para preservar calidad.
- Educacion y experimentacion: su tamano (2-4 GB en cuantizaciones habituales) lo hace adecuado para entornos docentes donde se ensena a desplegar modelos con llama.cpp u Ollama en portatiles con GPU integrada.
- Generacion de codigo basica: aunque no se documenta un rendimiento especifico en codigo, los modelos de 3-4 mil millones de parametros pueden asistir en autocompletado y generacion de fragmentos simples; conviene validar la calidad con benchmarks propios antes de usarlo en produccion.
- Prototipado de agentes simples: con contexto limitado (no documentado) y sin tool calling confirmado, su uso en agentes queda restringido a flujos de un solo paso o a la generacion de texto dentro de un orquestador externo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,2 GB (Q2_K) hasta 3,9 GB (Q6_K/Q8_0) para los pesos, mas el overhead de contexto y el runtime de llama.cpp (tipicamente 0,5-1 GB adicionales).
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM para cuantizaciones Q4_K_M o superiores; RTX 3060, RTX 4060, RTX 4090, A100 o H100 para despliegues de mayor throughput.
- Cabe en GPU de consumo: si, en tarjetas con 6-8 GB de VRAM (RTX 3060, RTX 4060, RTX 2070) usando Q4_K_M o Q5_K_M; en GPUs integradas puede ejecutarse en CPU con llama.cpp a velocidades reducidas.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF; no se documenta soporte nativo en vLLM o TGI para este repositorio concreto.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; dependeran del hardware y de la cuantizacion elegida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| open-cabrita3b-GGUF (este) | 3,55 B | no disponible | Apache 2.0 | GGUF | Cuantizaciones estaticas, pt/en |
| open-cabrita3b-i1-GGUF (mismo autor) | 3,55 B | no disponible | Apache 2.0 | GGUF | Cuantizaciones imatrix, mejor calidad/tamano |
| 22h/open-cabrita3b (modelo base) | 3,55 B | no disponible | Apache 2.0 | safetensors | Pesos originales sin cuantizar |
| Modelos de ~3-4 B de la misma categoria | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos verificados en la informacion proporcionada |

## Limitaciones y advertencias

- No se documentan sesgos conocidos del modelo base; al entrenarse presumiblemente con datos web, es esperable un sesgo hacia contenidos en portugues e ingles y posibles sesgos de genero, raza o religion no evaluados.
- Riesgo de alucinacion: inherente a los modelos de lenguaje de esta talla; la ventana de contexto no documentada limita la verificacion de respuestas largas.
- Limitaciones de idioma: solo se declaran portugues e ingles; el rendimiento en castellano no esta garantizado ni evaluado.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion, siempre que se conserve el aviso de licencia y se indiquen los cambios; no se incluyen clausulas de uso aceptable adicionales en la informacion disponible.
- Caveat para produccion: al ser una cuantizacion, la calidad puede degradarse respecto al modelo en f16, especialmente en Q2_K y Q3_K_S; se recomienda validar con un conjunto de evaluacion propio antes de desplegar en produccion.
- No se documenta la longitud de contexto, lo que impide planificar aplicaciones que requieran ventanas largas sin una prueba empirica previa.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/open-cabrita3b-GGUF
- Modelo base: https://huggingface.co/22h/open-cabrita3b
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/open-cabrita3b-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#open-cabrita3b-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
