# mradermacher/Qwen3.5-9B-Theseus-GGUF

## Resumen

Qwen3.5-9B-Theseus es un modelo de lenguaje de 9.197.093.888 parámetros (aproximadamente 9,2 mil millones) derivado de la familia Qwen3.5, publicado por el usuario nightmedia y cuantizado a formato GGUF por mradermacher. Se trata de un ajuste fino (SFT con LoRA) sobre una base Qwen3.5 de 9B, orientado a razonamiento con cadena de pensamiento larga (long-CoT), generación de código, matemáticas y escritura creativa de ficción, con etiquetas que indican destilación de estilos tipo Claude 4.6 y técnicas de fusión con mergekit.

El modelo resulta relevante porque combina una ventana de contexto declarada de hasta 1M tokens (con 256k como referencia adicional en las etiquetas) con un tamaño que cabe en GPUs de consumo tras cuantización, y porque el repositorio ofrece un conjunto completo de cuantizaciones estáticas (desde Q2_K hasta f16) más un complemento multimodal mmproj. Es, por tanto, una opción práctica para experimentación local en tareas de razonamiento y escritura, aunque su naturaleza experimental y la escasez de benchmarks publicados exigen cautela antes de llevarlo a producción.

La licencia Apache 2.0 y los idiomas declarados (inglés, chino, japonés y español) lo sitúan como candidato para despliegues comerciales y aplicaciones multilingües, siempre que se validen empíricamente sus capacidades reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3.5); detalles internos no disponibles |
| Parametros totales | 9.197.093.888 (~9,2B) |
| Parametros activos | No aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | Hasta 1M tokens (etiqueta "1M context"); 256k tokens tambien declarado |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; mmproj en Q8_0 y f16; variantes i1 (imatrix) en repositorio aparte |
| Idiomas soportados | Ingles (en), chino (zh), japones (ja), espanol (es) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); modelo base en safetensors/transformers |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de su pertenencia a la familia Qwen3.5, un transformer decoder-only. El modelo es un ajuste fino del checkpoint nightmedia/Qwen3.5-9B-Theseus, que a su vez parte de una base Qwen3.5 de 9B. Las etiquetas del repositorio indican entrenamiento mediante SFT con LoRA, con enfasis en cadenas de pensamiento largas (long-cot), razonamiento, matematicas y STEM, y con referencias a destilacion de estilo (claude-distillation, claude4.6) y a tecnicas de fusion (mergekit).

Entre las innovaciones declaradas figuran el uso de multi-token-prediction y decodificacion especulativa, asi como conceptos de escritura creativa como "implicit inner state", "extended latent state" y "custom manifold", orientados a la generacion de ficcion y roleplaying. No se especifican el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO; estos datos deben considerarse no disponibles.

## Capacidades

- Generacion de texto conversacional e instruccional (instruction-tuned).
- Razonamiento con cadena de pensamiento larga (long-CoT) y modo de razonamiento explicito.
- Generacion de codigo y tareas de investigacion tecnica.
- Matematicas y contenidos STEM.
- Escritura creativa: ficcion, ciencia ficcion, generacion de tramas, subtramas, continuacion de escenas y storytelling en todos los generos.
- Roleplaying y escritura vivida con control de estilo.
- Capacidades multilingues en ingles, chino, japones y espanol.
- Soporte multimodal declarado mediante el complemento mmproj (vision), aunque no se detallan las capacidades exactas.
- Uso de tecnicas de decodificacion especulativa y multi-token prediction para acelerar la inferencia.
- Tool calling / function calling: no confirmado en la informacion disponible.
- Soporte de agentes multi-paso: no confirmado en la informacion disponible.

## Casos de uso

- Escritura de ficcion asistida: el modelo puede generar tramas, subtramas y continuaciones de escenas con control de genero y estilo, aprovechando su entrenamiento especifico en narrativa y roleplaying.
- Generacion de codigo en entornos locales: con cuantizaciones Q4_K_M (~5,9 GB) puede ejecutarse en una GPU de consumo para autocompletado, refactorizacion y explicacion de codigo en flujos de desarrollo individuales.
- Razonamiento matematico y STEM: su entrenamiento en long-CoT permite abordar problemas paso a paso, util en tutoria automatizada o generacion de material didactico.
- Atencion al cliente multilingue: al soportar ingles, chino, japones y espanol, puede gestionar conversaciones multi-turno en estos idiomas, aunque la ventana de contexto efectiva debe validarse empiricamente.
- Analisis de documentos largos: la ventana declarada de hasta 1M tokens permite procesar libros, informes o bases de codigo extensas en una sola pasada, si el hardware lo permite.
- Prototipado de agentes conversacionales: su formato GGUF facilita el despliegue con llama.cpp u Ollama para pruebas rapidas de asistentes con personalidad y estilo definidos.
- Generacion de guiones y material creativo para videojuegos: las capacidades de roleplaying y continuacion de escenas encajan en la produccion de dialogos y narrativa ramificada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos): Q2_K ~4,0 GB; Q3_K_M ~4,8 GB; IQ4_XS ~5,5 GB; Q4_K_M ~5,9 GB; Q5_K_M ~6,7 GB; Q6_K ~7,7 GB; Q8_0 ~9,9 GB; f16 ~18,5 GB. A estas cifras hay que sumar el espacio para el contexto KV, que crece con la longitud de contexto utilizada.
- El complemento multimodal mmproj anade ~0,7 GB (Q8_0) o ~1,0 GB (f16).
- GPU recomendadas: para cuantizaciones Q4-Q5 basta una RTX 3060 de 12 GB o RTX 4060 Ti de 16 GB; para Q8_0 o f16 se recomienda RTX 4090 (24 GB), A100 o H100. Contextos muy largos (cientos de miles de tokens) exigen GPUs de datacenter con memoria abundante.
- Cabe en GPU de consumo: si, en cuantizaciones Q4_K_M o inferiores con contexto moderado.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF; el modelo base es compatible con transformers. No se confirma soporte especifico de vLLM o TGI en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.5-9B-Theseus (este) | ~9,2B | Hasta 1M (declarado) | Apache 2.0 | GGUF, safetensors | Ajuste SFT/LoRA orientado a razonamiento y ficcion; sin benchmarks publicados |
| Qwen3.5-9B base (nightmedia) | ~9,2B | No disponible | Apache 2.0 | safetensors | Checkpoint del que deriva este modelo |
| Modelos Qwen3.5 de 9B de la familia oficial | ~9B | No disponible | Apache 2.0 (segun familia) | safetensors, GGUF | Alternativa sin el ajuste especifico de Theseus |
| Modelos de ~8-9B de otras familias (p. ej., Llama 3.1 8B) | ~8B | 128k | Licencia propia | safetensors, GGUF | Referencia de tamano y contexto; comparacion de rendimiento no disponible |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada; la comparativa se limita a parametros, contexto y licencia.

## Limitaciones y advertencias

- Modelo marcado como experimental: no hay benchmarks publicados que respalden sus capacidades declaradas.
- Riesgo de alucinacion inherente a los modelos de ~9B, especialmente en contextos largos y tareas factuales.
- La ventana de 1M tokens es una declaracion del autor; el rendimiento efectivo en contextos muy largos no esta verificado y puede degradarse.
- El soporte multilingue se limita a ingles, chino, japones y espanol; otros idiomas pueden producir resultados deficientes.
- El entrenamiento con destilacion de estilo (referencias a Claude 4.6) puede introducir sesgos de estilo y de contenido no documentados.
- Aunque la licencia es Apache 2.0 y permite uso comercial, deben revisarse las condiciones del modelo base y de los datos de entrenamiento, no detalladas.
- El uso de cuantizaciones agresivas (Q2_K, Q3_K_S) degrada la calidad; para produccion se recomienda Q5_K_M o superior.
- No se confirma soporte de tool calling ni de flujos de agentes, por lo que no debe asumirse en integraciones que dependan de ello.
- El tamano del repositorio (85,1 GB) implica descargas pesadas si se quieren todas las cuantizaciones; conviene descargar solo la variante necesaria.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Qwen3.5-9B-Theseus-GGUF
- Modelo base: https://huggingface.co/nightmedia/Qwen3.5-9B-Theseus
- Cuantizaciones imatrix (i1): https://huggingface.co/mradermacher/Qwen3.5-9B-Theseus-i1-GGUF
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#Qwen3.5-9B-Theseus-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Grafico comparativo de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- nethype GmbH: https://www.nethype.de/
