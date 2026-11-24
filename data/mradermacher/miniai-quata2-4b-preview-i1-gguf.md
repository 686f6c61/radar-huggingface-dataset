# mradermacher/MiniAI-Quata2-4b-Preview-i1-GGUF

## Resumen
MiniAI-Quata2-4b-Preview-i1-GGUF es la distribucion en formato GGUF del modelo MiniAI-Quata2-4b-Preview, publicada por el usuario mradermacher. El modelo base, desarrollado por M1n1A1, es un transformer de aproximadamente 4.841 millones de parametros (4,84B) orientado a conversacion y tool calling, con etiquetas que lo vinculan a la familia Qwen3.5 y a una arquitectura denominada "quata2". La model card lo describe como un modelo multimodal (vision), aunque los ficheros mmproj, si existen, se alojan en el repositorio estatico complementario.

Esta ficha cubre especificamente la version cuantizada con imatrix e "i1" (quants ponderados de alta calidad generados a partir de un fichero imatrix), que ofrece un rango muy amplio de niveles de cuantizacion, desde IQ1_S (1,7 GB) hasta Q6_K (4,1 GB). El interes practico radica en que permite ejecutar un modelo de casi 5B parametros con soporte de tool calling y capacidades multilingues (ingles, serbio, croata y bosnio) en hardware de consumo, mediante llama.cpp u Ollama.

La licencia Apache 2.0 y la disponibilidad de cuantizaciones tan agresivas hacen de este modelo un candidato para despliegues en local, prototipado rapido y experimentacion con agentes ligeros en entornos con recursos limitados. No obstante, la informacion publica sobre arquitectura interna, datos de entrenamiento y rendimiento es muy escasa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (etiquetado como "quata2" / Qwen3.5 en los tags); detalles internos no disponibles |
| Parametros totales | 4.841.450.496 (4,84B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF: IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, Q3_K_S, IQ3_XS, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, Q4_K_S, IQ4_NL, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K (generados con imatrix) |
| Idiomas soportados | Ingles (en), serbio (sr), croata (hr), bosnio (bs) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado); el modelo base esta en safetensors |

## Arquitectura y entrenamiento
La informacion disponible no detalla la arquitectura interna mas alla de las etiquetas del repositorio, que apuntan a un transformer de la familia Qwen3.5 bajo una denominacion "quata2". No se especifican el numero de capas, la dimension oculta, el mecanismo de atencion ni si emplea innovaciones como atencion lineal o decodificacion especulativa. Tampoco se documenta el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF, DPO o similares.

Lo que si es verificable es el proceso de cuantizacion: mradermacher ha generado las cuantizaciones a partir de un fichero imatrix (incluido en el repositorio, 0,1 GB), lo que produce quants "i1" con mejor relacion calidad/tamano que los estaticos equivalentes. La model card indica que los quants estaticos estan en un repositorio separado y que los ficheros mmproj para vision, si existen, se encuentran alli. El repositorio incluye ademas metadatos de conversion (convert_type: hf, quantize_version: 2, output_tensor_quantised: 1).

## Capacidades
- Generacion de texto conversacional multi-turno, segun la etiqueta "conversational".
- Tool calling / function calling: el tag "tool-calling" y el tag "endpoints_compatible" sugieren soporte para invocacion de herramientas y compatibilidad con endpoints tipo API.
- Capacidades multimodales (vision): la model card del cuantizador afirma explicitamente "This is a vision model", aunque los ficheros mmproj no estan en este repositorio.
- Soporte multilingue limitado a cuatro idiomas: ingles, serbio, croata y bosnio.
- Razonamiento y codigo: no hay documentacion explicita que confirme capacidades destacadas en matematicas o generacion de codigo; no disponible.
- Modo "thinking" o razonamiento extendido: no disponible.

## Casos de uso
- Asistente conversacional en serbio, croata o bosnio: el modelo cubre las tres variantes del serbocroata ademas del ingles, lo que lo hace util para atencion al usuario en los Balcanes occidentales con un unico modelo y cuantizaciones ligeras (Q4_K_M, 3,2 GB).
- Despliegue en local para prototipado de agentes: gracias al soporte de tool calling y a su tamano de 4,84B, puede ejecutarse en portatiles con GPU de consumo y usarse para orquestar llamadas a APIs en flujos de agente.
- Automatizacion de tareas con function calling en entornos sin conectividad: al poder correr con llama.cpp u Ollama de forma offline, sirve para pipelines internos donde no se permite enviar datos a la nube.
- Procesamiento de documentos con componente visual: si se descargan los ficheros mmproj del repositorio estatico, el modelo puede abordar tareas de comprension de imagenes junto con texto, util para extraccion de informacion de capturas o formularios.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece 25 variantes GGUF con imatrix, lo que permite medir el impacto de la cuantizacion (de IQ1_S a Q6_K) en calidad y velocidad sobre una misma tarea, un caso de uso metodologico para investigadores.
- Chatbot de bajo coste en produccion: con Q4_K_M (3,2 GB) o Q5_K_M (3,6 GB) se obtiene un equilibrio razonable entre calidad y huella de memoria para servicios de mensajeria o soporte de nivel 1.
- Filtrado y clasificacion de texto multilingue: para moderacion o enrutamiento de mensajes en ingles y lenguas del serbocroata en plataformas regionales.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: desde aproximadamente 2 GB con IQ1_S/IQ2 hasta unos 4,5-5 GB con Q6_K, incluyendo overhead de contexto y cache KV (el contexto no esta documentado, por lo que la cifra exacta depende de la longitud configurada).
- GPU recomendadas: cualquier GPU con 6-8 GB de VRAM permite ejecutar las cuantizaciones Q4_K_M o Q5_K_M con comodidad; para Q6_K se recomienda 8 GB o mas.
- Cabe en GPU de consumo: si. Ejemplos: RTX 3060 12 GB, RTX 4060 Ti 8/16 GB, RTX 4070, RTX 4090; tambien en GPUs integradas o Apple Silicon con memoria unificada de 8 GB o mas usando cuantizaciones bajas.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, LM Studio, y servidores compatibles con la API de OpenAI (el tag "endpoints_compatible" lo sugiere). vLLM y TGI no soportan GGUF de forma nativa, por lo que requeririan el modelo base en safetensors.
- Latencia y throughput: no disponibles; dependen del hardware y de la cuantizacion elegida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| MiniAI-Quata2-4b-Preview (i1-GGUF) | 4,84B | no disponible | Apache 2.0 | GGUF | Multilingue en/sr/hr/bs, tool calling, posible vision |
| Qwen2.5-3B / Qwen3-4B | 3-4B | 32K-128K (segun version) | Apache 2.0 | safetensors, GGUF | Familia de referencia con benchmarks publicos; contexto documentado |
| Llama 3.2 3B | 3,2B | 128K | Llama 3.2 Community License | safetensors, GGUF | Multilingue amplio, sin tool calling nativo destacado |
| Phi-3.5-mini | 3,8B | 128K | MIT | safetensors, GGUF | Fuerte en razonamiento y codigo; contexto documentado |

La comparacion con alternativas consolidadas es desfavorable en cuanto a documentacion publica: los modelos citados cuentan con benchmarks y contextos verificables, mientras que para MiniAI-Quata2-4b-Preview no se dispone de esos datos en la informacion proporcionada. Su ventaja relativa es la cobertura del serbocroata y la disponibilidad de cuantizaciones imatrix muy agresivas.

## Limitaciones y advertencias
- Ausencia casi total de documentacion tecnica: no se publican contexto, datos de entrenamiento, benchmarks ni detalles de arquitectura, lo que dificulta evaluar su calidad frente a alternativas.
- Riesgo de alucinacion: como cualquier modelo de lenguaje de 4,84B, es propenso a inventar hechos, especialmente en cuantizaciones muy bajas (IQ1, IQ2, Q2_K), donde la model card advierte de "very low quality" o "for the desperate".
- Cobertura idiomatica limitada: solo ingles y serbocroata; no se garantiza un rendimiento aceptable en castellano ni en otras lenguas.
- Capacidad multimodal condicionada: los ficheros mmproj no estan en este repositorio; sin ellos, el modelo funciona solo como text-only.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero el modelo base podria incorporar restricciones adicionales no reflejadas; conviene revisar el repositorio original M1n1A1/MiniAI-Quata2-4b-Preview.
- Etiqueta "preview": se trata de una version preliminar, sin garantias de estabilidad ni soporte a largo plazo.
- El repositorio pesa 60,7 GB por incluir todas las cuantizaciones; descargar solo el fichero GGUF deseado.
- Sin informacion sobre sesgos; al estar entrenado presumiblemente con datos web, puede reproducir sesgos de genero, etnicos o culturales.

## Enlaces
- Repositorio Hugging Face (esta version): https://huggingface.co/mradermacher/MiniAI-Quata2-4b-Preview-i1-GGUF
- Modelo base: https://huggingface.co/M1n1A1/MiniAI-Quata2-4b-Preview
- Cuantizaciones estaticas: https://huggingface.co/mradermacher/MiniAI-Quata2-4b-Preview-GGUF
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#MiniAI-Quata2-4b-Preview-i1-GGUF
- Guia de uso de GGUF (referencia TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
