# mradermacher/Omega-Darker-v1-R1-4B-GGUF

## Resumen

Omega-Darker-v1-R1-4B-GGUF es la versión cuantizada en formato GGUF del modelo ReadyArt/Omega-Darker-v1-R1-4B, un modelo de lenguaje de aproximadamente 3.880 millones de parámetros (3,88 B) afinado para roleplay conversacional con temática explícita, erótica, de terror y violencia. La cuantización la ha realizado mradermacher, un autor habitual en la comunidad de GGUF, y ofrece un abanico de cuantizaciones que van desde Q2_K (1,8 GB) hasta f16 (7,9 GB), además de suplementos multimodales mmproj.

El modelo está construido sobre una base de la familia Gemma, tal como indica su licencia (gemma), y está orientado a un público adulto: la model card lo etiqueta explícitamente como `nsfw`, `explicit`, `unaligned`, `ERP` y `not-for-all-audiences`. No es un modelo de propósito general ni un modelo alineado para asistencia; su nicho es la narrativa interactiva y el roleplay sin filtros de seguridad convencionales.

Su relevancia actual es acotada pero concreta: para desarrolladores e investigadores que trabajan en generación creativa de ficción adulta, simulación de personajes o investigación sobre modelos "unaligned", esta cuantización permite ejecutar el modelo en hardware de consumo gracias a su reducido tamaño y a la disponibilidad de cuantizaciones de 2 a 4 GB. No se dispone de información sobre arquitectura interna detallada, datos de entrenamiento ni benchmarks en la documentación proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de la familia Gemma, según licencia) |
| Parametros totales | 3.880.263.168 (3,88 B) |
| Parametros activos | no aplica (no es MoE, según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; además mmproj-Q8_0 y mmproj-f16 (suplementos multimodales) |
| Idiomas soportados | en (inglés) |
| Licencia | gemma |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base en safetensors |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base ReadyArt/Omega-Darker-v1-R1-4B en la documentación proporcionada. La licencia `gemma` y la nomenclatura sugieren que deriva de un modelo de la familia Gemma de Google, pero no se confirma ni el número de capas, ni la dimensión de los embeddings, ni el mecanismo de atención empleado. Tampoco se documentan el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF, DPO o fine-tuning supervisado.

Lo que sí se deduce de las etiquetas de la model card es el proceso de especialización: el modelo ha sido afinado para roleplay (`roleplay`), contenido erótico explícito (`ERP`, `Erotic`, `explicit`), terror (`Horror`) y violencia (`Violence`), y se describe como `unaligned`, es decir, sin el alineamiento de seguridad habitual. La cuantización realizada por mradermacher es estática (`quantize_version: 2`, `output_tensor_quantised: 1`, `convert_type: hf`), e incluye suplementos `mmproj` que sugieren capacidades multimodales en el modelo base, aunque no se detalla su alcance. Existe además una variante con cuantizaciones ponderadas/imatrix en el repositorio `mradermacher/Omega-Darker-v1-R1-4B-i1-GGUF`.

## Capacidades

- Generación de texto conversacional y narrativo en inglés, orientado a roleplay multi-turno.
- Generación de ficción explícita y erótica (ERP) sin los filtros de seguridad típicos de modelos alineados.
- Narrativa de terror y violencia, según las etiquetas del modelo.
- Capacidades multimodales potenciales: el repositorio incluye suplementos `mmproj` (Q8_0 y f16), lo que sugiere soporte de entrada visual en el modelo base, aunque no se detalla.
- Conversación multi-turno (`conversational` en las etiquetas).
- Compatibilidad con endpoints (`endpoints_compatible`), lo que facilita su despliegue en infraestructuras de inferencia estándar.
- No se documenta soporte de tool calling, function calling, agentes, matemáticas, código ni modo de razonamiento explícito.

## Casos de uso

- Roleplay conversacional para adultos: el modelo está afinado específicamente para mantener personajes y narrativas multi-turno en contextos explícitos, lo que lo hace adecuado para aplicaciones de entretenimiento para mayores de edad con avisos claros de contenido.
- Generación de ficción erótica: escritores y plataformas de contenido adulto pueden usarlo para asistir en la redacción de narrativa explícita, aprovechando su especialización y su licencia que permite uso comercial bajo los términos de Gemma.
- Narrativa de terror y suspense: sus etiquetas `Horror` y `Violence` lo orientan a la generación de escenas de tensión, violencia narrativa y terror psicológico en proyectos de ficción interactiva.
- Simulación de personajes en videojuegos o experiencias interactivas: con 3,88 B de parámetros y cuantizaciones de 2,5 GB (Q4_K_S), puede ejecutarse localmente en equipos de consumo para motores de diálogo de personajes no alineados.
- Investigación sobre modelos "unaligned": útil para estudiar el comportamiento de modelos sin alineamiento de seguridad, analizar sesgos, evaluar riesgos de contenido dañino y comparar con variantes alineadas.
- Despliegue local en estaciones de trabajo: gracias a los formatos GGUF y a la disponibilidad de cuantizaciones desde 1,8 GB, puede ejecutarse con llama.cpp u Ollama en portátiles y equipos sin GPU dedicada de gama alta.
- Prototipado rápido de chatbots de nicho: la compatibilidad con endpoints y el tamaño reducido permiten iterar con bajo coste de infraestructura en fases de prueba.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto):
  - Q2_K: ~1,8 GB
  - Q3_K_S: ~2,0 GB
  - Q4_K_S / Q4_K_M: ~2,5-2,6 GB
  - Q5_K_M: ~2,9 GB
  - Q6_K: ~3,3 GB
  - Q8_0: ~4,2 GB
  - f16: ~7,9 GB
- Con contexto y overhead de llama.cpp, añadir aproximadamente 1-2 GB adicionales según la longitud de contexto configurada.
- GPU recomendadas: cualquier GPU consumer con 4 GB o más de VRAM puede ejecutar las cuantizaciones Q4; una RTX 3060 (12 GB), RTX 4060 Ti (16 GB) o RTX 4090 (24 GB) permiten ejecutar Q8_0 y f16 con contexto amplio. Para despliegues en servidor, A100 o H100 son sobredimensionadas para este tamaño, pero válidas para servir muchas instancias concurrentes.
- Cabe en GPU consumer: sí, desde GPUs de 4 GB (Q2_K/Q3) hasta 8 GB (Q8_0) y 12 GB (f16 con contexto).
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y servidores compatibles con GGUF (por ejemplo, llama-cpp-python). La etiqueta `endpoints_compatible` sugiere compatibilidad con endpoints de inferencia estándar.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Omega-Darker-v1-R1-4B-GGUF | 3,88 B | no disponible | gemma | GGUF | Roleplay explícito, terror, violencia, unaligned |
| Modelos base Gemma de ~4 B | ~4 B | no disponible | gemma | safetensors, GGUF | Alineados para uso general; sin especialización en contenido adulto |
| Otras cuantizaciones de roleplay NSFW de ~4 B | variable | variable | variable | GGUF | No se dispone de datos concretos para comparar |

No se dispone de información suficiente para establecer una comparativa cuantitativa con alternativas concretas de la misma categoría. La comparación más directa es con el modelo base ReadyArt/Omega-Darker-v1-R1-4B en safetensors, del que esta versión es una cuantización.

## Limitaciones y advertencias

- Contenido para adultos: el modelo está etiquetado como `nsfw`, `explicit` y `not-for-all-audiences`; no debe desplegarse en productos accesibles a menores ni sin avisos claros.
- Modelo "unaligned": no incorpora los filtros de seguridad habituales, por lo que puede generar contenido violento, sexual explícito o dañino sin restricciones.
- Riesgo de alucinación: como todo modelo de lenguaje de este tamaño, puede inventar hechos, personajes o detalles narrativos inconsistentes.
- Idioma: solo se declara soporte de inglés (`en`); el rendimiento en castellano no está garantizado.
- Contexto: no se documenta la longitud de contexto, lo que impide planificar aplicaciones con ventanas largas sin verificación empírica.
- Licencia Gemma: el uso comercial está sujeto a los términos de la licencia Gemma de Google, que incluyen restricciones de uso aceptable; es necesario revisarlos antes de un despliegue en producción.
- Sesgos: no se documentan evaluaciones de sesgo; los modelos de roleplay sin alinear tienden a reproducir estereotipos y sesgos de sus datos de entrenamiento.
- Cuantizaciones de baja calidad: Q2_K y Q3_K_M pueden degradar notablemente la coherencia; se recomienda Q4_K_M o superior para producción.
- Trazabilidad limitada: la model card no detalla datos de entrenamiento ni evaluación, lo que dificulta auditar el modelo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Omega-Darker-v1-R1-4B-GGUF
- Modelo base: https://huggingface.co/ReadyArt/Omega-Darker-v1-R1-4B
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Omega-Darker-v1-R1-4B-i1-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#Omega-Darker-v1-R1-4B-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y peticiones de cuantización: https://huggingface.co/mradermacher/model_requests
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
