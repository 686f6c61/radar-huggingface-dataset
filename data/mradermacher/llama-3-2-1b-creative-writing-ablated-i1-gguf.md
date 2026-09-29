# mradermacher/llama-3.2-1b-creative-writing-ablated-i1-GGUF

## Resumen

El modelo `mradermacher/llama-3.2-1b-creative-writing-ablated-i1-GGUF` es un conjunto de cuantizaciones en formato GGUF generadas por mradermacher a partir del modelo `Sachin903/llama-3.2-1b-creative-writing-ablated`. Se trata, por tanto, de un derivado de Llama 3.2 1B que ha pasado por dos transformaciones sucesivas: un ajuste fino orientado a escritura creativa y un proceso de "abliteración" (eliminación de la dirección de rechazo en el espacio de activaciones) que reduce los comportamientos de negativa del modelo original. Con 1.235.814.432 parámetros (~1,24 B), es un modelo denso de la familia Llama 3.2, pensado para ejecución local en hardware muy modesto.

La relevancia de esta ficha radica en que mradermacher publica cuantizaciones con imatrix (matriz de importancia) que permiten bajar el modelo hasta ~0,5 GB manteniendo una calidad razonable dentro de lo que permite un modelo de 1,24 B. El repositorio ocupa 16,0 GB en total porque incluye 24 variantes de cuantización distintas, desde IQ1_S hasta Q6_K, además del fichero imatrix para generar cuantizaciones propias. Es un recurso de distribución, no un modelo nuevo: no aporta arquitectura ni entrenamiento propios.

El público objetivo es doble: por un lado, desarrolladores que necesitan un generador de texto creativo en inglés ejecutable en CPU o en GPUs de gama baja; por otro, investigadores que estudian el efecto de la abliteración sobre el comportamiento y la calidad de modelos pequeños. La licencia no está declarada en la información disponible, lo que supone un obstáculo relevante para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Llama 3.2 (modelo denso), con el ajuste fino de escritura creativa y la abliteración aplicados sobre el modelo base |
| Parametros totales | 1.235.814.432 (~1,24 B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la informacion proporcionada; la arquitectura Llama 3.2 1B soporta hasta 128 000 tokens, pero este dato no se confirma en la model card del repositorio |
| Tipos de cuantizacion | i1 (imatrix): IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, IQ3_XXS, Q2_K, IQ3_XS, Q3_K_S, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, IQ4_NL, Q4_0, Q4_K_S, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K; incluye fichero imatrix para crear cuantizaciones propias |
| Idiomas soportados | ingles (en) |
| Licencia | no disponible |
| Formato de pesos | GGUF (la model card declara `library_name: transformers`) |

Tamaños de fichero declarados por el autor: IQ1_S ≈ 0,5 GB; IQ2_XXS/XS/S/M ≈ 0,5-0,6 GB; Q2_K_S ≈ 0,7 GB; IQ3_S ≈ 0,7 GB; IQ3_M ≈ 0,8 GB; IQ4_XS ≈ 0,8 GB; Q4_K_S / Q4_K_M / Q4_1 ≈ 0,9 GB; Q5_K_S / Q5_K_M ≈ 1,0 GB. El autor recomienda Q4_K_M como opción "rápida y recomendada" y Q4_K_S como mejor relación tamaño/velocidad/calidad.

## Arquitectura y entrenamiento

La información disponible no documenta el proceso de entrenamiento del modelo base `Sachin903/llama-3.2-1b-creative-writing-ablated`: no se indica el número de tokens de ajuste fino, la composición del dataset, ni si se emplearon técnicas de RLHF, DPO o similares. Lo que sí se declara es la cadena de derivación: Llama 3.2 1B (arquitectura decoder-only de Meta, con grouped-query attention) → ajuste fino para escritura creativa → abliteración, que consiste en identificar y restar la dirección latente asociada a las respuestas de rechazo. Este repositorio añade una capa más: la cuantización GGUF con imatrix realizada por mradermacher.

La innovación técnica destacable aquí no está en el modelo sino en el pipeline de cuantización. Los ficheros `i1-*` se generan con `quantize_version: 2` y `output_tensor_quantised: 1`, usando una matriz de importancia (imatrix) calculada sobre el propio modelo para ponderar qué pesos conviene preservar con más precisión. Eso permite que las cuantizaciones IQ de bajo bitrate rindan mejor de lo que su tamaño sugeriría. El autor advierte explícitamente de que IQ1_S está pensado "para casos desesperados" y que Q2_K_S es de "calidad muy baja". También mantiene una variante estática en el repositorio `mradermacher/llama-3.2-1b-creative-writing-ablated-GGUF`, sin ponderación por imatrix.

## Capacidades

- Generación de texto en inglés, con orientación específica hacia escritura creativa: narrativa, ficción, descripción y diálogo.
- Conversación multi-turno básica, según la etiqueta `conversational` del repositorio.
- Ejecución local en CPU y GPU de gama baja gracias a las cuantizaciones de 0,5-1,0 GB.
- Reducción de rechazos: la abliteración suprime parte de las negativas del modelo alineado original, lo que amplía el rango temático de las respuestas.
- Compatibilidad declarada con endpoints (`endpoints_compatible`), lo que permite servirlo a través de infraestructura compatible con la API de Hugging Face.
- No se confirma soporte de tool calling ni function calling en la información disponible.
- No se confirma capacidad de razonamiento multi-paso, uso de agentes, ni modo "thinking".
- No hay soporte de visión: Llama 3.2 reserva las capacidades multimodales a los tamaños 11B y 90B.
- Multilingüismo: limitado al inglés (etiqueta `en`); no se declaran otros idiomas.

## Casos de uso

- Generación de ficción y narrativa en inglés: el ajuste fino está orientado precisamente a escritura creativa, por lo que es la aplicación más alineada con el modelo. Adecuado para borradores de relatos, descripciones de escenas o variaciones de diálogo con un coste computacional mínimo.
- Ejecución en portátiles sin GPU dedicada: con las cuantizaciones Q4_K_M (0,9 GB) o IQ3_M (0,8 GB) el modelo cabe en memoria RAM y se ejecuta con llama.cpp, lo que permite tener un generador de texto funcionando sin acelerador.
- Despliegue en dispositivos edge (Raspberry Pi 4/5, mini-PC, móvil de gama alta): las variantes IQ2 e IQ3 ocupan entre 0,5 y 0,8 GB, un rango asumible para hardware embebido con 4-8 GB de RAM.
- Investigación sobre abliteración: comparar las salidas de este modelo con las de `llama-3.2-1b-abliterated-GGUF` o con el Llama 3.2 1B original permite medir cuánto se degrada la coherencia al eliminar la dirección de rechazo en un modelo tan pequeño.
- Generación de datos sintéticos de escritura creativa: útil para producir corpus de preentrenamiento o evaluaciones en inglés a gran volumen y bajo coste, siempre que se revise la calidad por el riesgo de alucinación.
- Prototipado rápido de aplicaciones conversacionales: al ser compatible con endpoints y con llama.cpp/Ollama, sirve para validar interfaces y flujos de diálogo antes de escalar a un modelo mayor.
- Experimentación con cuantizaciones imatrix: el repositorio incluye el fichero imatrix y 24 variantes, lo que lo convierte en un banco de pruebas para medir el impacto de cada nivel de cuantización sobre la perplejidad y la calidad percibida.
- Generación de texto de relleno o ambientación en videojuegos y prototipos: descripciones de objetos, diálogos secundarios o textos de mundo generados en tiempo real sin infraestructura de servidor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye métricas de MMLU, HumanEval, GSM8K, perplejidad ni ninguna otra evaluación cuantitativa, ni para las cuantizaciones i1 ni para el modelo base `Sachin903/llama-3.2-1b-creative-writing-ablated`.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: ~2,5 GB en FP16; ~1,3 GB en Q8; 1,0 GB en Q5_K_M; 0,9 GB en Q4_K_M; 0,8 GB en IQ3_M o IQ4_XS; 0,5-0,6 GB en IQ1/IQ2.
- A esa cifra hay que sumar la caché KV, que crece con la longitud de contexto efectiva utilizada. Con ventanas largas (decenas de miles de tokens) la caché puede superar el tamaño de los propios pesos en las cuantizaciones más agresivas.
- Cabe en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090, GTX 1650, e incluso en gráficas integradas con memoria compartida. También en CPU pura.
- GPU de数据中心 (A100, H100) innecesarias: el modelo no aprovecharía su ancho de banda ni su capacidad de cómputo.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp, text-generation-webui, y servidores compatibles con endpoints de Hugging Face. El soporte en vLLM y TGI para GGUF existe pero está limitado y no se confirma aquí.
- Latencia y throughput: no disponible. No se publican medidas de tokens por segundo en la información proporcionada.
- Cuantizaciones recomendadas por el propio autor: Q4_K_M (rápida, recomendada) y Q4_K_S (mejor equilibrio tamaño/velocidad/calidad). IQ4_XS es preferible a IQ4_NL; IQ3_S "supera a Q3_K*" según el autor.

## Comparativa con modelos similares

Los datos de parámetros y licencia de los modelos comparados son especificaciones públicas de sus respectivos repositorios originales; no proceden de la búsqueda realizada y no se han verificado en ella. No hay datos de benchmarks para ninguno de ellos en la información disponible, por lo que la comparación es estructural.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| `llama-3.2-1b-creative-writing-ablated-i1-GGUF` (este) | 1,24 B | no disponible | no disponible | GGUF (24 cuantizaciones i1) | Escritura creativa, abliterado, inglés |
| Llama 3.2 1B Instruct (Meta) | 1,24 B | 128 000 tokens | Llama 3.2 Community License | safetensors, GGUF | Modelo alineado original, multilingüe parcial |
| Llama 3.2 1B abliterated (`mradermacher/llama-3.2-1b-abliterated-GGUF`) | 1,24 B | no disponible | llama3.2 | GGUF | Misma familia, sin el ajuste de escritura creativa |
| Qwen2.5 1.5B Instruct | ~1,5 B | 32 768 tokens (ampliable con RoPE) | Apache 2.0 | safetensors, GGUF | Alternativa con licencia permisiva y mejor soporte multilingüe |
| Gemma 2 2B | ~2,6 B | 8 192 tokens | Gemma Terms of Use | safetensors, GGUF | Mayor tamaño, contexto más corto |

La ventaja diferencial de este repositorio es la granularidad de cuantizaciones (24 variantes más el fichero imatrix) y su orientación a escritura creativa sin restricciones temáticas. Su desventaja frente a Qwen2.5 1.5B es la licencia: Qwen2.5 usa Apache 2.0, mientras que aquí la licencia no está declarada y el modelo deriva de Llama 3.2.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan en la información disponible, pero al derivar de Llama 3.2 hereda el sesgo de sus datos de preentrenamiento, mayoritariamente en inglés. El ajuste fino de escritura creativa puede reforzar estereotipos narrativos.
- Riesgo de alucinación elevado: con 1,24 B de parámetros, la coherencia factual es limitada. No es apto para tareas que requieran precisión factual verificable.
- La abliteración elimina mecanismos de rechazo: esto implica que el modelo puede generar contenido dañino, ofensivo o ilegal sin filtros. No debe desplegarse en aplicaciones orientadas al público sin una capa de moderación externa.
- La abliteración también suele degradar la capacidad de seguir instrucciones y la coherencia general; no se publican evaluaciones que cuantifiquen esa pérdida.
- Idioma: únicamente inglés. El rendimiento en castellano u otros idiomas será previsiblemente pobre y no está evaluado.
- Licencia no disponible: dado que el modelo deriva de Llama 3.2, es probable que esté sujeta a la Llama 3.2 Community License y a sus cláusulas de uso aceptable, pero esto no se confirma. No debe usarse comercialmente sin verificar la licencia del modelo base `Sachin903/llama-3.2-1b-creative-writing-ablated` y de los pesos originales de Meta.
- Cuantizaciones de muy bajo bitrate: el propio autor califica IQ1_S como "para desesperados", IQ1_M como "mayormente desesperado" y Q2_K_S como "calidad muy baja". Estas variantes no son aptas para producción.
- Longitud de contexto no confirmada: la arquitectura Llama 3.2 1B soporta 128 000 tokens, pero la model card no lo declara para este derivado. No asumir contexto largo sin probarlo.
- Validación comunitaria nula: 0 descargas y 0 likes en el momento de la consulta. No hay informes independientes de calidad ni de comportamiento.
- Fechas del repositorio: creado el 2026-09-28 y actualizado el 2026-09-29, posteriores a la fecha de esta consulta. Conviene verificar que el artefacto es el esperado.
- El repositorio pesa 16,0 GB por acumulación de cuantizaciones; descargar solo el fichero GGUF necesario y no clonar el repositorio completo.

## Enlaces

- Repositorio Hugging Face (cuantizaciones i1): https://huggingface.co/mradermacher/llama-3.2-1b-creative-writing-ablated-i1-GGUF
- Repositorio de cuantizaciones estáticas: https://huggingface.co/mradermacher/llama-3.2-1b-creative-writing-ablated-GGUF
- Modelo base (ajuste fino de escritura creativa abliterado): https://huggingface.co/Sachin903/llama-3.2-1b-creative-writing-ablated
- Fichero imatrix: https://huggingface.co/mradermacher/llama-3.2-1b-creative-writing-ablated-i1-GGUF/resolve/main/llama-3.2-1b-creative-writing-ablated.imatrix.gguf
- Página de resumen de mradermacher: https://hf.tst.eu/model#llama-3.2-1b-creative-writing-ablated-i1-GGUF
- Cuantizaciones abliteradas de la misma familia: https://huggingface.co/mradermacher/llama-3.2-1b-abliterated-GGUF
- Guía de uso de GGUF referenciada por el autor: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Modelos Llama de Meta: https://dev.meta.ai/llama/models/llama-3
- Código de inferencia de Llama: https://github.com/meta-llama/llama
- Búsqueda de modelos abliterated en Ollama: https://ollama.com/search?q=abliterated
