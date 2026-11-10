# mradermacher/Qwen3.5-4B-heretic-v1-i1-GGUF

## Resumen

Qwen3.5-4B-heretic-v1-i1-GGUF es una distribucion de pesos cuantizados en formato GGUF del modelo TrueRealRaven/Qwen3.5-4B-heretic-v1, un derivado "abliterated" (tambien etiquetado como "uncensored" y "heretic") del modelo base Qwen3.5-4B de Alibaba Qwen. El trabajo de cuantizacion lo realiza mradermacher, un conocido publicador de cuantizaciones GGUF de la comunidad open source, que en este caso genera variantes con imatrix (importance matrix) para preservar calidad en tamanos reducidos.

El modelo se presenta como una version con los mecanismos de rechazo atenuados o eliminados mediante tecnicas de abliteration, lo que lo orienta a usos de investigacion sobre alineamiento, red teaming y generacion sin filtros. La model card indica que se trata de un modelo de vision (dispone de ficheros mmproj en el repositorio estatico asociado), aunque la informacion disponible no detalla la arquitectura interna ni el contexto maximo.

La relevancia actual es doble: por un lado, ofrece una via practica de ejecutar un modelo de ~4B con capacidades multimodales en hardware de consumo mediante llama.cpp y derivados; por otro, su naturaleza "uncensored" lo convierte en una pieza de interes para estudiar el comportamiento de modelos abliterated y sus riesgos en produccion. La licencia declarada es Apache 2.0, heredada del modelo Qwen original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivada de Qwen3.5-4B; transformer, detalles no publicados en la informacion disponible) |
| Parametros totales | 1.797.272 (dato de safetensors del repo; no coherente con la nomenclatura "4B", ver limitaciones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q2_K_S, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q3_K_S, Q3_K_M, Q3_K_L, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, Q4_0, Q4_1, Q4_K_S, Q4_K_M, IQ4_XS, small-IQ4_NL, Q5_K_S, Q5_K_M, Q6_K, IQ1_S, IQ1_M (segun metadatos de la model card) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones i1/imatrix); repositorio estatico separado con cuantizaciones estaticas y posibles ficheros mmproj |

## Arquitectura y entrenamiento

La informacion disponible no documenta la arquitectura interna del modelo base Qwen3.5-4B ni del derivado heretic-v1. Por la nomenclatura y el ecosistema (tags `transformers`, `gguf`, `base_model`), se trata de un transformer derivado de la familia Qwen3.5, pero no se especifican numero de capas, dimensiones ocultas, tipo de atencion ni si incorpora innovaciones como atencion lineal o decodificacion especulativa. Tampoco se detalla el proceso de abliteration aplicado por TrueRealRaven para obtener la variante heretic.

Respecto al entrenamiento, no se dispone de datos sobre numero de tokens, composicion del dataset, fases de RLHF, DPO o similares. Lo unico documentado es el proceso de cuantizacion: mradermacher genera cuantizaciones ponderadas con imatrix (importance matrix) a partir del modelo original, e incluye el fichero `Qwen3.5-4B-heretic-v1.imatrix.gguf` (0,1 GB) para que terceros puedan crear sus propias cuantizaciones. La model card menciona que las cuantizaciones estaticas estan en un repositorio separado y que, al ser un modelo de vision, los ficheros mmproj (si existen) se alojan en ese repositorio estatico.

## Capacidades

- Generacion de texto en ingles (unico idioma declarado).
- Capacidades multimodales: la model card lo describe explicitamente como "vision model", con ficheros mmproj en el repositorio estatico.
- Generacion sin filtros de rechazo: las etiquetas `heretic`, `uncensored` y `abliterated` indican que se han atenuado o eliminado los mecanismos de negativa del modelo base.
- Compatibilidad con endpoints (`endpoints_compatible` en los tags), lo que sugiere uso via APIs de inferencia compatibles.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo "thinking" explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Investigacion sobre alineamiento y abliteration: el modelo permite comparar el comportamiento del Qwen3.5-4B original frente a la variante heretic en las mismas prompts, aislando el efecto de la eliminacion de rechazos. Es adecuado porque la unica diferencia documentada respecto al base es precisamente ese proceso.
- Red teaming y evaluacion de seguridad: util para generar respuestas que un modelo alineado rechazaria y analizar como se comportan los filtros de produccion ante ellas. La naturaleza uncensored lo hace apropiado como generador de casos adversarios controlados.
- Despliegue local en hardware de consumo: las cuantizaciones Q4_K_M, IQ4_XS o Q5_K_M permiten ejecutar un modelo de la familia 4B en GPU consumer o incluso CPU via llama.cpp, Ollama o LM Studio, con un coste de VRAM bajo.
- Procesamiento de documentos con imagen en local: al ser un modelo de vision, puede emplearse para extraer texto o describir imagenes en entornos sin conexion, usando los ficheros mmproj del repositorio estatico junto con la cuantizacion elegida.
- Prototipado rapido en pipelines de inferencia: la compatibilidad con endpoints y el formato GGUF facilitan integraciones en servicios que ya hablan el protocolo de llama.cpp o servidores compatibles con OpenAI.
- Generacion creativa sin restricciones en entornos de investigacion: escritura de ficcion, dialogos o escenarios que los modelos alineados suelen rechazar, siempre dentro de marcos de uso controlados y con revision humana.
- Creacion de cuantizaciones propias: el fichero imatrix incluido permite a otros desarrolladores producir variantes ajustadas a sus requisitos de tamano y calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia orientativa para un modelo de la familia 4B en GGUF: las cuantizaciones Q4_K_M e IQ4_XS suelen requerir del orden de 2,5-3 GB de VRAM; Q5_K_M en torno a 3-3,5 GB; Q6_K cerca de 4 GB; Q8_0 alrededor de 5 GB. Estas cifras son estimaciones generales del ecosistema GGUF y no datos publicados para este modelo concreto.
- GPU recomendadas: no disponibles en la informacion proporcionada. Por tamano, un modelo de esta clase cabe en GPUs consumer como RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090, e incluso en GPUs de 8 GB con cuantizaciones Q4 o inferiores.
- Cabe en GPU consumer: si, previsiblemente en la mayoria de GPUs con 6 GB o mas usando cuantizaciones Q4/IQ4; en CPU via llama.cpp tambien es viable.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, servidores compatibles con la API de OpenAI que acepten GGUF, y cualquier runtime que soporte el formato. La model card no detalla integraciones especificas mas alla de la referencia generica a GGUF.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| mradermacher/Qwen3.5-4B-heretic-v1-i1-GGUF | no disponible (nomenclatura 4B; safetensors reporta 1.797.272) | no disponible | apache-2.0 | GGUF | Variante abliterated cuantizada con imatrix; vision |
| TrueRealRaven/Qwen3.5-4B-heretic-v1 | no disponible | no disponible | apache-2.0 | safetensors (presumiblemente) | Modelo base del que deriva esta cuantizacion |
| Qwen/Qwen3.5-4B | no disponible | no disponible | apache-2.0 | safetensors | Modelo original alineado; referencia para comparar efecto de abliteration |
| mradermacher/Qwen3.5-4B-heretic-v1-GGUF | no disponible | no disponible | apache-2.0 | GGUF | Cuantizaciones estaticas del mismo modelo, sin imatrix |

No se dispone de datos de rendimiento comparado (benchmarks) para establecer diferencias cuantitativas entre estas variantes.

## Limitaciones y advertencias

- Incoherencia en el recuento de parametros: el dato de safetensors (1.797.272) no concuerda con la nomenclatura "4B" del nombre del modelo. Conviene verificar el modelo base antes de asumir capacidades o requisitos de hardware.
- Modelo "uncensored"/"abliterated": la eliminacion de rechazos implica un mayor riesgo de generar contenido danino, sesgado o inapropiado. No es adecuado para produccion orientada a usuarios finales sin filtros adicionales.
- Riesgo de alucinacion: no se han publicado evaluaciones de fidelidad para esta variante; el proceso de abliteration puede degradar capacidades de razonamiento o coherencia respecto al modelo original.
- Idioma limitado al ingles: no se declara soporte multilingue, por lo que su uso en castellano u otros idiomas puede degradar la calidad.
- Contexto desconocido: no se especifica la ventana de contexto, lo que impide planificar casos de uso con documentos largos sin verificacion previa.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantias y la responsabilidad sobre el contenido generado recae en el desplegador. Conviene revisar la licencia del modelo Qwen original enlazada en la model card.
- Modelo de vision con ficheros mmproj en repositorio separado: es necesario descargar los ficheros adicionales del repositorio estatico para usar las capacidades multimodales; la cuantizacion por si sola no las habilita.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad frente al modelo base ni frente a alternativas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Qwen3.5-4B-heretic-v1-i1-GGUF
- Modelo base (heretic-v1): https://huggingface.co/TrueRealRaven/Qwen3.5-4B-heretic-v1
- Cuantizaciones estaticas: https://huggingface.co/mradermacher/Qwen3.5-4B-heretic-v1-GGUF
- Modelo original Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
- Licencia del modelo original: https://huggingface.co/Qwen/Qwen3.5-4B/blob/main/LICENSE
- Pagina de descargas del autor: https://hf.tst.eu/model#Qwen3.5-4B-heretic-v1-i1-GGUF
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
