# mradermacher/Aura-2-Lightning-i1-GGUF

## Resumen

Aura-2-Lightning-i1-GGUF es una redistribucion en formato GGUF del modelo waveforce-ai/Aura-2-Lightning, publicada por mradermacher, un cuantizador independiente conocido por generar versiones comprimidas de modelos abiertos. El repositorio no aporta pesos originales, sino una bateria de cuantizaciones de tipo i1 (con fichero imatrix) que van desde IQ1_S (0,9 GB) hasta Q6_K (1,6 GB), lo que permite ejecutar el modelo en hardware muy modesto, incluido CPU, mediante llama.cpp y sus derivados.

El modelo subyacente es un causal language model de arquitectura personalizada (etiquetado como custom-architecture y distilled) con 1.557.611.200 parametros, lo que lo situa en la franja de los modelos pequenos tipo 1,5B. Su licencia es Apache 2.0, esta declarado unicamente para ingles y su ficha tecnica no documenta longitud de contexto, composicion del dataset de entrenamiento ni resultados de evaluacion, por lo que buena parte de sus caracteristicas tecnicas queda sin verificar.

Su relevancia practica es la de un modelo de bolsillo: el repo pesa 22,8 GB en total, pero cada cuantizacion individual ocupa entre 0,9 y 1,6 GB, de modo que cabe en GPU de consumo, en portatiles e incluso en dispositivos con poca memoria. El interes principal esta en desplegarlo como modelo auxiliar (por ejemplo, como draft model para decodificacion especulativa) o en entornos offline donde el coste de computo y la huella de memoria son la restriccion dominante.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal de arquitectura personalizada (etiquetas del repo: custom-architecture, causal-lm, distilled) |
| Parametros totales | 1.557.611.200 (aprox. 1,56 B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1 con imatrix: IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, IQ3_XXS, IQ3_S, IQ3_XS, Q2_K, Q3_K_S, IQ4_XS, IQ4_NL, Q4_0, IQ3_M, Q3_K_M, Q4_1, Q4_K_S, Q3_K_L, Q5_K_S, Q4_K_M, Q5_K_M, Q6_K, ademas del fichero imatrix para generar cuantizaciones propias |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (este repositorio); el formato de los pesos originales del modelo base no esta documentado en la informacion disponible |

Datos adicionales del repositorio:

| Parametro | Valor |
|---|---|
| Autor de la cuantizacion | mradermacher |
| Modelo base | waveforce-ai/Aura-2-Lightning |
| Tamano total del repo | 22,8 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-24 |
| Ultima actualizacion | 2026-09-25 |
| Libreria declarada | transformers |
| Pipeline | text-generation |
| Cuantizaciones estaticas alternativas | mradermacher/Aura-2-Lightning-GGUF |

## Arquitectura y entrenamiento

La unica informacion disponible sobre la arquitectura procede de las etiquetas y metadatos del repositorio: causal-lm, custom-architecture y distilled, junto con el campo output_tensor_quantised y convert_type: hf, que indican que la conversion se hizo desde pesos en formato Hugging Face. No se especifica el numero de capas, dimension del modelo, numero de cabezas de atencion, tipo de atencion, uso de MoE, ni si emplea alguna variante de atencion lineal o hibrida. El termino distilled sugiere que el modelo base se obtuvo por destilacion de un modelo mayor, pero no hay datos sobre el profesor utilizado ni sobre el procedimiento.

Tampoco hay informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset, ni si hubo etapas de ajuste con RLHF, DPO o instrucciones. El unico detalle tecnico concreto aportado por mradermacher es el proceso de cuantizacion: las versiones i1 se han generado con fichero imatrix, una matriz de importancia calculada sobre un corpus de calibracion que permite preservar mejor los pesos relevantes en cuantizaciones agresivas. Segun las notas del propio autor, la familia IQ suele superar en calidad a cuantizaciones no IQ de tamano equivalente; en concreto, indica que i1-IQ3_S supera a las variantes Q3_K, que i1-Q4_K_S ofrece la mejor relacion tamano/velocidad/calidad y que i1-Q4_K_M es la opcion rapida recomendada.

## Capacidades

- Generacion de texto autoregresiva en ingles, al ser un modelo causal-lm entrenado para prediccion del siguiente token.
- Razonamiento y generacion de codigo: no hay evidencia documentada en la informacion disponible; debe validarse empiricamente, dado que no se publican evaluaciones.
- Soporte de tool calling o function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas al ingles segun el campo language del repositorio.
- Modo de pensamiento (thinking), vision o audio: no disponible; el repositorio solo declara text-generation.
- Ejecucion local en CPU y GPU gracias al formato GGUF y a las cuantizaciones de bajo bit.

## Casos de uso

- Asistente local offline en portatil o equipo de escritorio: con cuantizaciones de 1,2-1,6 GB (Q4_K_S, Q4_K_M, Q6_K) el modelo puede cargarse integramente en memoria y responder sin conexion, lo que resulta adecuado para entornos con requisitos de privacidad o sin acceso a red.
- Modelo auxiliar para decodificacion especulativa: su tamano de 1,56 B parametros lo hace candidato a actuar como draft model que propone tokens verificados despues por un modelo mayor, reduciendo la latencia por token en el modelo grande; requiere que el tokenizador sea compatible con el modelo verificador.
- Clasificacion y etiquetado de texto en lote: tareas de asignacion de categoria, deteccion de intencion o filtrado de contenido en ingles sobre grandes volumenes de documentos, donde un modelo pequeno cuantizado permite alto throughput en CPU.
- Resumen extractivo o generativo de documentos cortos en ingles: util en pipelines de procesamiento documental donde el coste por inferencia en la nube es un factor limitante y basta con resumenes de calidad moderada.
- Prototipado rapido de aplicaciones de generacion de texto: permite validar prompts, plantillas y flujos de integracion en local antes de migrar a un modelo mayor, sin coste de API.
- Despliegue en dispositivos de borde o hardware embebido con GPU integrada: las variantes IQ2 e IQ3, de 0,9-1,0 GB, permiten ejecutar el modelo en equipos con 4 GB de RAM o VRAM compartida, algo imposible con modelos de 7B o superiores en cuantizaciones equivalentes.
- Generacion de datos sinteticos de bajo coste: produccion de textos en ingles para preentrenamiento de clasificadores o para aumentar datasets, asumiendo la necesidad de filtrado posterior por riesgo de alucinacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La ficha del autor, la model card del modelo base y los resultados de busqueda no incluyen valores de MMLU, HumanEval, GSM8K, ARC, HellaSwag ni de ninguna otra evaluacion. Tampoco se aportan mediciones de perplejidad por tipo de cuantizacion, salvo la referencia grafica externa del autor sobre calidad relativa entre tipos de cuantizacion.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin cache KV): entre 0,9 y 1,0 GB para IQ1/IQ2/IQ3_XXS, alrededor de 1,2-1,4 GB para Q4_K_S, Q4_K_M y Q5_K_S, y aproximadamente 1,6 GB para Q6_K.
- Consumo total con cache KV y overhead del runtime: dependeria del numero de capas y cabezas (no disponible) y de la longitud de contexto configurada. Con contexto corto, en Q4_K_M el consumo agregado razonable se situa en el entorno de 1,7-2,2 GB; en Q6_K, en torno a 2,0-2,5 GB. Son estimaciones, no mediciones publicadas.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM resulta suficiente para las cuantizaciones Q4 y Q5 (GTX 1650, RTX 3050, RTX 4060, RTX 4090 en adelante). Para IQ1/IQ2 bastan 2 GB de VRAM (GTX 1050 Ti, MX550, iGPU modernas con memoria compartida).
- Cabe en GPU de consumo: si, en todas las cuantizaciones publicadas, incluidas las de 1,6 GB. Es uno de los pocos modelos que se ejecuta comodamente en CPU pura.
- Opciones de despliegue: llama.cpp (con soporte nativo de cuantizaciones i1/imatrix), Ollama, LM Studio, llama-cpp-python, text-generation-webui y otros frontends compatibles con GGUF. Para las cuantizaciones multi-parte, es necesario concatenar los ficheros segun el procedimiento habitual de TheBloke.
- Latencia y throughput estimados: no disponible. No se han publicado mediciones de tokens por segundo ni de tiempo hasta el primer token en ninguna configuracion de hardware.
- Almacenamiento: el repositorio completo ocupa 22,8 GB, por lo que conviene descargar unicamente el fichero de cuantizacion deseado (entre 0,9 y 1,6 GB) en lugar de clonar el repositorio entero.

## Comparativa con modelos similares

Los valores de los modelos alternativos proceden de sus fichas publicas y deben verificarse antes de usarse en produccion; los datos de Aura-2-Lightning provienen del repositorio aqui analizado.

| Modelo | Parametros | Contexto | Licencia | Idiomas | Formato GGUF disponible |
|---|---|---|---|---|---|
| Aura-2-Lightning (este repo) | 1,56 B | no disponible | Apache 2.0 | ingles | si (i1/imatrix y estaticas) |
| Qwen2.5-1.5B | aprox. 1,5 B | 32.768 tokens (referencia) | Apache 2.0 | multilingue | si, en repositorios de terceros |
| Llama-3.2-1B | aprox. 1,24 B | 128.000 tokens (referencia) | Licencia comunitaria de Llama 3.2 | multilingue | si, en repositorios de terceros |
| SmolLM2-1.7B | aprox. 1,71 B | 8.192 tokens (referencia) | Apache 2.0 | ingles y otros | si, en repositorios de terceros |

No hay datos de rendimiento comparado disponibles para Aura-2-Lightning, por lo que la eleccion entre estas alternativas no puede hacerse hoy por criterios de calidad medidos, sino por licencia, idioma y compatibilidad de tokenizador.

## Limitaciones y advertencias

- Idioma: el repositorio declara unicamente ingles. El rendimiento en castellano no esta documentado y previsiblemente sera pobre.
- Longitud de contexto desconocida: no se puede planificar un caso de uso con contexto largo sin verificar experimentalmente el limite real del modelo.
- Riesgo de alucinacion: al tratarse de un modelo de 1,56 B parametros sin evaluaciones publicadas, es esperable una tasa de error factual elevada, especialmente en dominios especializados, matematicas y codigo.
- Degradacion por cuantizacion: el propio autor etiqueta las variantes IQ1_S como "for the desperate" (0,9 GB) y IQ1_M como "mostly desperate", y advierte de calidad muy baja en Q2_K_S. Para uso en produccion conviene partir de Q4_K_S o superior.
- Sesgos: no se documenta la composicion del dataset de entrenamiento ni el proceso de alineacion, por lo que no es posible evaluar sesgos de genero, origen o ideologia. Al ser un modelo destilado sin informacion sobre el profesor, el origen de los sesgos es opaco.
- Licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion con atribucion, pero se desconoce si los datos de entrenamiento del modelo base cumplen condiciones compatibles. No hay informacion sobre la procedencia del dataset original.
- Modelo con cero descargas y cero likes en el momento de la consulta: no existe validacion comunitaria, ni issues reportados, ni confirmacion independiente de que la conversion sea correcta.
- Arquitectura personalizada: el tag custom-architecture implica que puede requerir versiones concretas de llama.cpp o de la libreria transformers, y que podria no ser compatible con herramientas genericas de conversion o con vLLM.
- Ausencia de datos de tool calling y de agentes: no debe asumirse soporte de function calling sin verificacion previa, a diferencia de modelos como Qwen2.5, que lo documentan de forma explicita.

## Enlaces

- Repositorio analizado (cuantizaciones i1/imatrix): https://huggingface.co/mradermacher/Aura-2-Lightning-i1-GGUF
- Cuantizaciones estaticas del mismo modelo: https://huggingface.co/mradermacher/Aura-2-Lightning-GGUF
- Modelo base: https://huggingface.co/waveforce-ai/Aura-2-Lightning
- Perfil del cuantizador: https://huggingface.co/mradermacher
- Peticiones de cuantizacion y preguntas frecuentes: https://huggingface.co/mradermacher/model_requests
- Pagina de resumen y descargas del cuantizador: https://hf.tst.eu/model#Aura-2-Lightning-i1-GGUF
- Guia de uso de ficheros GGUF mult i-parte (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de calidad entre tipos de cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Lista de modelos GGUF disponibles: https://mitjafelicijan.github.io/gguf-list/
- Herramienta de comprobacion de encaje en VRAM: https://modelfitcheck.com/
