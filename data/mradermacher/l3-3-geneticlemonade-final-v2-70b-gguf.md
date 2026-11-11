# mradermacher/L3.3-GeneticLemonade-Final-v2-70B-GGUF

## Resumen

L3.3-GeneticLemonade-Final-v2-70B-GGUF es una distribucion de cuantizaciones estaticas en formato GGUF del modelo zerofata/L3.3-GeneticLemonade-Final-v2-70B, un ajuste fino de Llama 3.3 70B orientado a generacion creativa y roleplay con tematica anime. El trabajo de cuantizacion lo realiza mradermacher, un publicador habitual de versiones GGUF de modelos de la comunidad, que en este caso ofrece desde Q2_K hasta Q8_0 en el repositorio principal y cuantizaciones con imatrix en un repositorio paralelo.

El modelo base pesa 70.553.706.560 parametros (unos 70,5 mil millones) y hereda la arquitectura transformer densa de Llama 3.3, con licencia Llama 3. La relevancia practica de esta ficha es que permite ejecutar un modelo de 70B en hardware de consumo o en servidores con VRAM limitada gracias a las cuantizaciones de 4 y 5 bits, que reducen el peso a entre 38 y 50 GB con perdida de calidad controlada.

No se dispone de informacion publica sobre el proceso de entrenamiento del modelo base, sus datos exactos de ajuste fino ni sus resultados de benchmarks. La model card del repositorio de cuantizacion se limita a listar los ficheros GGUF, su tamano y notas de calidad, y remite a la model card del modelo original para cualquier detalle adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Llama 3.3 70B) |
| Parametros totales | 70.553.706.560 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; versiones imatrix en repositorio i1-GGUF |
| Idiomas soportados | en (ingles) |
| Licencia | llama3 (Llama 3 Community License) |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base es un ajuste fino de Llama 3.3 70B, por lo que conserva la arquitectura transformer denso con atencion por cabezas agrupadas (GQA) propia de la familia Llama 3. El ajuste fino se realizo sobre tres datasets propios del autor zerofata: zerofata/Roleplay-Anime-Characters, zerofata/Instruct-Anime-CreativeWriting y zerofata/Summaries-Anime-FandomPages, todos ellos orientados a contenido de anime, roleplay y escritura creativa. No se especifica el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF, DPO o similar.

La aportacion tecnica de este repositorio concreto es la cuantizacion. mradermacher genera cuantizaciones estaticas (quantize_version 2, con cuantizacion de tensores de salida) y ofrece en paralelo un repositorio con cuantizaciones ponderadas/imatrix (L3.3-GeneticLemonade-Final-v2-70B-i1-GGUF), que suelen preservar mejor la perplejidad a igual tamano. Los ficheros Q6_K y Q8_0 se dividen en dos partes por superar el limite de tamano de fichero de Hugging Face. No se documentan innovaciones adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto conversacional multi-turno, con enfasis en roleplay de personajes y escritura creativa de tematica anime.
- Redaccion creativa: ficcion, dialogos, descripciones de personajes y resumenes de paginas de fandom.
- Comprension y generacion en ingles unicamente; no se declara soporte multilingue.
- No se documenta soporte de tool calling ni function calling en la informacion disponible.
- No se documenta soporte explicito de agentes o razonamiento multi-paso.
- No se documenta capacidad de vision, audio ni modo de pensamiento (thinking).
- Compatible con endpoints (tag endpoints_compatible) y con la libreria transformers y el ecosistema GGUF (llama.cpp y derivados).

## Casos de uso

- Roleplay y chatbots de personajes: el ajuste fino sobre Roleplay-Anime-Characters esta disenado para mantener la coherencia de personalidad en conversaciones largas; con cuantizaciones Q4_K_M o Q5_K_M cabe en una sola GPU de 48 GB o en dos de 24 GB.
- Escritura creativa asistida: generacion de relatos, dialogos y borradores de ficcion con estilo anime, aprovechando el ajuste sobre Instruct-Anime-CreativeWriting.
- Resumen de documentacion de fandom: sintesis de paginas wiki y articulos largos sobre series y franquicias, usando el dataset de resumenes como referencia de estilo.
- Prototipado de productos de entretenimiento conversacional: despliegue local con llama.cpp u Ollama para demos de experiencias narrativas interactivas sin depender de APIs externas.
- Investigacion sobre ajuste fino y cuantizacion: comparar la calidad de Q4_K_M, Q5_K_M, Q6_K y Q8_0 frente al modelo original en tareas creativas, gracias a la disponibilidad de todas las variantes en un mismo repositorio.
- Fine-tuning posterior sobre dominio propio: partir de los pesos safetensors del modelo base (zerofata/L3.3-GeneticLemonade-Final-v2-70B) y reutilizar estas cuantizaciones como referencia de evaluacion.
- Despliegue en servidores con VRAM limitada: usar Q2_K (26,5 GB) o Q3_K_S (31,0 GB) para entornos con una sola GPU de 32 GB, aceptando la perdida de calidad documentada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin cache KV): Q2_K 26,5 GB; Q3_K_S 31,0 GB; Q3_K_M 34,4 GB; Q3_K_L 37,2 GB; IQ4_XS 38,4 GB; Q4_K_S 40,4 GB; Q4_K_M 42,6 GB; Q5_K_S 48,8 GB; Q5_K_M 50,0 GB; Q6_K 58,0 GB; Q8_0 75,1 GB.
- La cache KV y el contexto adicional incrementan el consumo por encima de estas cifras; con contexto largo se recomienda reservar varios GB extra o usar cuantizacion de cache KV.
- GPU recomendadas: A100 80 GB o H100 80 GB para Q6_K y Q8_0; A100 40 GB, L40S 48 GB o dos RTX 4090 de 24 GB para Q4_K_M y Q5_K_M; RTX 4090 unica (24 GB) no permite cargar el modelo completo ni siquiera en Q2_K, por lo que requiere offload a RAM del sistema.
- Cabe en GPU de consumo solo mediante offload parcial (por ejemplo, RTX 4090 con parte de las capas en RAM) o en configuraciones multi-GPU con 2 x 24 GB para cuantizaciones de 4 bits.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python y servidores compatibles con GGUF; el tag endpoints_compatible indica compatibilidad con endpoints tipo OpenAI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| L3.3-GeneticLemonade-Final-v2-70B-GGUF | 70,5 B | no disponible | GGUF (Q2_K a Q8_0) | llama3 | Ajuste fino de roleplay anime; cuantizaciones estaticas e imatrix |
| zerofata/L3.3-GeneticLemonade-Final-v2-70B | 70,5 B | no disponible | safetensors | llama3 | Modelo base sin cuantizar del que derivan estas versiones |
| Llama 3.3 70B Instruct (Meta) | 70,5 B | 128 K (segun documentacion de Meta) | safetensors, GGUF | llama3 | Modelo generalista original; no especializado en roleplay anime |
| L3.3-GeneticLemonade-Final-v2-70B-i1-GGUF (mradermacher) | 70,5 B | no disponible | GGUF imatrix | llama3 | Mismo modelo con cuantizaciones ponderadas, habitualmente de mayor calidad a igual tamano |

## Limitaciones y advertencias

- El modelo esta ajustado sobre datos de roleplay y escritura creativa de tematica anime; es probable que su rendimiento en tareas generales (codigo, matematicas, razonamiento formal) sea inferior al de Llama 3.3 70B Instruct original, aunque no se aportan benchmarks que lo cuantifiquen.
- Solo soporta ingles de forma declarada; no se garantiza calidad en castellano ni en otros idiomas.
- Riesgo de alucinacion inherente a los modelos de 70B en tareas factuales; el ajuste creativo puede incrementar la tendencia a inventar detalles en contextos que requieren precision.
- Las cuantizaciones de 2 y 3 bits (Q2_K, Q3_K_S, Q3_K_M) degradan la calidad de forma notable; la propia model card marca Q3_K_M como "lower quality". Para produccion se recomienda Q4_K_M o superior.
- La licencia llama3 impone restricciones de uso comercial y obligaciones de atribucion; es necesario revisar la Llama 3 Community License antes de desplegar en productos comerciales.
- El repositorio tiene un volumen de descargas bajo (312) y cero likes en el momento de la consulta, lo que limita la evidencia de la comunidad sobre su comportamiento en produccion.
- No hay informacion sobre la longitud de contexto efectiva del ajuste fino; asumir la del modelo base sin verificacion puede provocar degradacion en conversaciones muy largas.
- Los ficheros Q6_K y Q8_0 estan divididos en dos partes; es necesario concatenarlas correctamente antes de usarlos.

## Enlaces

- Repositorio Hugging Face (GGUF): https://huggingface.co/mradermacher/L3.3-GeneticLemonade-Final-v2-70B-GGUF
- Repositorio de cuantizaciones imatrix: https://huggingface.co/mradermacher/L3.3-GeneticLemonade-Final-v2-70B-i1-GGUF
- Modelo base: https://huggingface.co/zerofata/L3.3-GeneticLemonade-Final-v2-70B
- Pagina de descargas del autor: https://hf.tst.eu/model#L3.3-GeneticLemonade-Final-v2-70B-GGUF
- Dataset de roleplay: https://huggingface.co/datasets/zerofata/Roleplay-Anime-Characters
- Dataset de escritura creativa: https://huggingface.co/datasets/zerofata/Instruct-Anime-CreativeWriting
- Dataset de resumenes de fandom: https://huggingface.co/datasets/zerofata/Summaries-Anime-FandomPages
- Guia de uso de GGUF (README de referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafica comparativa de calidad de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
