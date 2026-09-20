# 0bserverx/Qwen3.8-27B-Heretic-GSQ-RCO-GGUF

## Resumen

Qwen3.8-27B-Heretic-GSQ-RCO-GGUF es una familia de cuantizaciones GGUF no uniformes publicada por el usuario 0bserverx sobre el modelo 0bserverx/Qwen3.8-27B-Heretic-Abliterated-Uncensored, un transformer de 26.895.998.464 parámetros (~26,9 B) sometido a un proceso de abliteration que reduce los rechazos a 0-1 de cada 100 peticiones con una divergencia KL de ~0,0085 respecto al modelo base. El repositorio acumula 5.513 descargas y 11 likes, ocupa 81,1 GB y se publicó el 20 de septiembre de 2026 bajo licencia Apache 2.0.

La innovación principal no está en los pesos, sino en la estrategia de compresión: en lugar de aplicar un único tipo de cuantización a todos los tensores, cada uno de los 851 tensores recibe su propio tipo según la asignación por tensor RCO publicada por IST-DASLab para su release GSQ-RCO de Qwen3.8-27B, con cuantización local mediante llama.cpp y la importance matrix oficial `imatrix-qwen3.8-27b.gguf`. El resultado son cuatro niveles que van de 8,45 GB (IQ2_XS, 2,50 bpw) a 11,80 GB (IQ3_S, 3,50 bpw), más cuatro gemelos `-mtp` con la cabeza MTP/NextN embebida para decodificación especulativa.

Su relevancia práctica es concreta: permite ejecutar un modelo de ~27 B en tarjetas de 12-16 GB con una pérdida de perplejidad medida de solo +0,95% respecto a F16 en el punto de 3,50 bpw, y alcanzar 150 t/s en el gemelo MTP frente a los 90 t/s del IQ3_S sin MTP, según las mediciones del propio autor en una RTX PRO 6000 Blackwell.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de la familia Qwen3.8 (el modelo base incluye tensores `ssm_alpha` y cabeza MTP/NextN; el autor no detalla la composición exacta) |
| Parametros totales | 26.895.998.464 (~26,9 B) |
| Longitud de contexto | no disponible (las mediciones de perplejidad se hicieron con contexto 4096) |
| Tipos de cuantizacion | No uniforme por tensor (asignación RCO): IQ2_XS (2,50 bpw), IQ2_S (2,75 bpw), IQ3_XXS (3,00 bpw), IQ3_S (3,50 bpw); gemelos `-mtp` con los mismos pesos; referencia F16; variante GSQ de 3 bits en `compressed-tensors` en el repositorio compañero |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); safetensors y compressed-tensors en los repositorios compañeros |
| Tamano del repo | 81,1 GB |
| Tamano de cada archivo | IQ2_XS 8,45 GB; IQ2_S 9,28 GB; IQ3_XXS 10,12 GB; IQ3_S 11,80 GB; cada gemelo `-mtp` añade +0,42 GiB |
| Libreria | gguf (llama.cpp, Ollama, LM Studio) |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

El repositorio es una release de cuantización, no un entrenamiento nuevo: los pesos proceden de `RVN-F16.gguf`, la versión de precisión completa del modelo abliterado de 0bserverx. El autor no documenta en esta ficha ni el número de tokens de entrenamiento del modelo base, ni la composición del dataset, ni si hubo RLHF o DPO. Lo que sí documenta es el efecto de la abliteration: 0-1 rechazos por cada 100 peticiones y una KL de ~0,0085 frente al modelo sin modificar. La presencia de tensores `ssm_alpha`, retenidos en F32 por la regla de precisión SSM de llama.cpp, indica que el modelo base incorpora componentes de espacio de estados, aunque el autor no especifica la proporción entre capas de atención y capas SSM.

La innovación técnica de esta release es la asignación por tensor: se parte de los mapas RCO publicados por IST-DASLab (851 entradas tensor-a-tipo por nivel, con objetivos de 2,50 a 3,50 bpw) y se cuantiza cada tensor de `RVN-F16.gguf` con su tipo asignado mediante `llama.cpp --tensor-type-file`, usando la importance matrix oficial `imatrix-qwen3.8-27b.gguf`. La auditoría de cabeceras confirma que 803 de los 851 tensores coinciden exactamente con la asignación publicada; los 48 tensores `ssm_alpha` restantes quedan en F32 (el mapa los lista como BF16), lo que supone mayor precisión y unos +24 MB por archivo. Los gemelos `-mtp` incorporan además, por fusión de bytes en crudo desde `mtp-RVN.gguf`, la cabeza MTP/NextN oficial de Qwen3.8 (`block_count=65`, `nextn_predict_layers=1`), habilitando decodificación especulativa. El autor advierte explícitamente de que reproduce la asignación RCO, pero no la pasada de refinamiento GSQ por tensor del pipeline interno de ISTA, cuya implementación pública actual regresa la KL extremo a extremo en sus propias pruebas.

## Capacidades

- Generación de texto y conversación multi-turno (pipeline declarado: text-generation; tag conversational).
- Modo de razonamiento (`thinking mode`) heredado de la plantilla de chat del modelo base, según indica el autor.
- Comportamiento abliterado: rechazos reducidos a 0-1 de cada 100 peticiones, con una KL de ~0,0085 frente al modelo original.
- Decodificación especulativa nativa en los gemelos `-mtp` mediante `--spec-type draft-mtp`, con la cabeza MTP/NextN oficial embebida.
- Ejecución directa sin modificaciones en llama.cpp, Ollama y LM Studio al ser GGUF estándar.
- Compatibilidad con endpoints (tag `endpoints_compatible`) y con vLLM/Transformers mediante la variante GSQ en `compressed-tensors` del repositorio compañero.
- Soporte de tool calling / function calling: no documentado en la información disponible.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Capacidades multilingües: no documentadas (el campo de idiomas figura como no disponible).
- Visión o audio: no documentados.

## Casos de uso

- Asistente conversacional local en GPU de 16 GB: con el archivo IQ3_S (11,80 GB, 3,50 bpw) el modelo entra completo en VRAM junto con la caché KV, con una pérdida de perplejidad de solo +0,95% respecto a F16, lo que permite ofrecer respuestas de calidad casi de precisión completa sin depender de la nube.
- Generación de texto a alta velocidad en producción: el gemelo `IQ3_S-mtp` alcanza 150 t/s frente a 90 t/s del IQ3_S convencional en una RTX PRO 6000 Blackwell con offload completo, gracias a la decodificación especulativa con la cabeza MTP; es el archivo indicado cuando el cuello de botella es el throughput y no la VRAM.
- Despliegue en tarjetas de 12 GB: el archivo IQ2_XS (8,45 GB) mantiene 105 t/s y deja margen para caché KV y sistema, a costa de un +10,7% de perplejidad frente a F16; útil para prototipos, pruebas internas o entornos con hardware limitado.
- Escritura creativa y generación de contenido sin filtros de rechazo: el proceso de abliteration reduce los rechazos a 0-1 de cada 100 peticiones, lo que resulta adecuado para fiction writing, guiones o textos donde los modelos alineados suelen negarse; requiere revisión humana por los motivos indicados en las advertencias.
- Investigación sobre abliteration y alineación: el par formado por el modelo base y esta release permite estudiar el efecto de la eliminación de rechazos (KL ~0,0085) y medir cómo se degrada con distintos niveles de cuantización, con perplejidades publicadas para cinco variantes.
- Evaluación de métodos de cuantización no uniforme: los cuatro niveles GSQ-RCO con la misma importance matrix y un A/B contra una cuantización uniforme IQ3_S (12,42 GB, +2,9% de perplejidad) convierten este repositorio en un banco de pruebas reproducible para comparar asignaciones por tensor.
- Sustitución de un modelo mayor en pipelines de CI o generación por lotes: al ocupar entre 8,45 y 11,80 GB y correr en llama.cpp, permite paralelizar varias instancias por nodo con GPUs de gama media en lugar de una sola instancia de un modelo de 70 B.
- Servicio con backend vLLM/SGLang: la variante GSQ de 3 bits en `compressed-tensors` (repositorio compañero, carpeta `GSQ-3bit/`) permite servir el modelo con esos motores en lugar de llama.cpp, manteniendo el esquema de cuantización por tensor.

## Benchmarks y rendimiento

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible. Los únicos datos publicados son de perplejidad y velocidad, medidos por el autor con `llama-perplexity` (contexto 4096) y offload completo en una RTX PRO 6000 Blackwell.

| Variante | Perplejidad en wikitext-2 | Delta vs F16 | Tamano |
|---|---:|---:|---:|
| F16 de referencia (`RVN-F16.gguf`) | 6,1197 | - | no disponible |
| GSQ-RCO IQ3_S | 6,1778 | +0,95% | 11,80 GB |
| GSQ-RCO IQ3_XXS | 6,3486 | +3,7% | 10,12 GB |
| GSQ-RCO IQ2_S | 6,5058 | +6,3% | 9,28 GB |
| GSQ-RCO IQ2_XS | 6,7724 | +10,7% | 8,45 GB |
| A/B: IQ3_S uniforme (`RVN-IQ3_S.gguf`) | 6,2956 | +2,9% | 12,42 GB |

| Variante | Velocidad de generación (t/s) | Equipo |
|---|---:|---|
| GSQ-RCO IQ2_XS | 105 | RTX PRO 6000 Blackwell, offload completo |
| GSQ-RCO IQ2_S | 101 | RTX PRO 6000 Blackwell, offload completo |
| GSQ-RCO IQ3_XXS | 97 | RTX PRO 6000 Blackwell, offload completo |
| GSQ-RCO IQ3_S | 90 | RTX PRO 6000 Blackwell, offload completo |
| GSQ-RCO IQ3_S-mtp | 150 | RTX PRO 6000 Blackwell, offload completo, `--spec-type draft-mtp` |

## Requisitos de hardware

- VRAM mínima estimada: 8,45 GB de pesos en IQ2_XS, 9,28 GB en IQ2_S, 10,12 GB en IQ3_XXS y 11,80 GB en IQ3_S, más la caché KV y los buffers de llama.cpp. Los gemelos `-mtp` añaden +0,42 GiB.
- Tarjetas de 12 GB: el autor sitúa el IQ2_XS (8,45 GB) como el nivel para tarjetas de clase 12 GB, con 105 t/s medidos en una RTX PRO 6000 Blackwell.
- Tarjetas de 16 GB: IQ3_S (11,80 GB) es la variante recomendada explícitamente por el autor para tarjetas de 16 GB, con 90 t/s, o 150 t/s en el gemelo MTP.
- GPU profesionales: las mediciones publicadas se tomaron en una NVIDIA RTX PRO 6000 Blackwell con offload completo; no se publican cifras para A100, H100 ni otras GPU de centro de datos.
- Cabe en GPU de consumo: sí, con 12-16 GB de VRAM para los niveles IQ2_XS a IQ3_S; en tarjetas de 24 GB (RTX 4090 y similares) sobra espacio para cachés KV amplias o para el nivel superior.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), Ollama y LM Studio de forma directa por ser GGUF estándar; vLLM/SGLang mediante la variante GSQ en `compressed-tensors` del repositorio compañero. La decodificación especulativa con MTP requiere llama.cpp >= b10440 y `--parallel 1`.
- Latencia y throughput: entre 90 y 105 t/s según el nivel de cuantización con offload completo, y hasta 150 t/s con el gemelo MTP en la misma máquina. No se publican cifras de latencia de primer token ni mediciones en otras GPU.

## Comparativa con modelos similares

| Modelo / variante | Parametros | Perplejidad (wikitext-2) | Tamano | Cuantizacion | Licencia |
|---|---|---:|---:|---|---|
| Esta release, GSQ-RCO IQ3_S | ~26,9 B | 6,1778 (+0,95% vs F16) | 11,80 GB | No uniforme por tensor (RCO) | Apache 2.0 |
| `RVN-IQ3_S.gguf` (cuantizacion uniforme del mismo modelo base) | ~26,9 B | 6,2956 (+2,9% vs F16) | 12,42 GB | Uniforme IQ3_S | Apache 2.0 |
| Referencia F16 (`RVN-F16.gguf`) | ~26,9 B | 6,1197 | no disponible | 16 bits | Apache 2.0 |
| ISTA-DASLab Qwen3.8-27B-GSQ-RCO-GGUF | no disponible (modelo sin abliterar) | no disponible | no disponible | No uniforme GSQ-RCO | no disponible |

No se dispone de comparaciones frente a otros modelos de tamaño similar (por ejemplo, familias de ~27-32 B de otros fabricantes) en la información proporcionada.

## Limitaciones y advertencias

- Modelo abliterado: los rechazos se han reducido deliberadamente a 0-1 de cada 100 peticiones. Esto implica que puede generar contenido dañino, ilegal o inseguro que un modelo alineado rechazaría; no es apto para aplicaciones de cara al público sin un filtro externo.
- Riesgo de alucinación: no se publican evaluaciones de veracidad ni benchmarks de conocimiento; además, la cuantización a 2,50-2,75 bpw degrada la perplejidad entre un 6,3% y un 10,7%, lo que puede aumentar los errores factuales en los niveles más bajos.
- Idiomas soportados: no documentados. No hay confirmación oficial del comportamiento multilingüe del modelo base ni de esta cuantización.
- Longitud de contexto: no especificada en la información disponible; las mediciones de perplejidad usan contexto 4096, por lo que no hay evidencia publicada de comportamiento en contextos largos.
- Fidelidad de la cuantización: 48 de los 851 tensores (los `ssm_alpha`) no siguen la asignación publicada, ya que llama.cpp los fuerza a F32. Es una desviación de mayor precisión, pero implica que el archivo no es una réplica exacta del mapa RCO.
- Refinamiento GSQ no reproducido: el autor advierte de que solo reproduce la asignación RCO y no la pasada de refinamiento por tensor del pipeline de ISTA, cuya implementación pública actual empeora la KL extremo a extremo.
- Dependencia de herramientas: los gemelos `-mtp` requieren llama.cpp >= b10440 y `--parallel 1`; el uso de motores distintos (vLLM, SGLang) obliga a recurrir a la variante `compressed-tensors` del repositorio compañero.
- Licencia: Apache 2.0 en esta release, pero conviene verificar las condiciones del modelo base abliterado y del modelo original del que deriva antes de un uso comercial.
- Caveat de procedencia: la abliteration puede degradar capacidades generales; el único dato publicado sobre su impacto es la KL de ~0,0085 frente al modelo sin modificar, sin benchmarks de tarea que lo confirmen.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/0bserverx/Qwen3.8-27B-Heretic-GSQ-RCO-GGUF
- Modelo base abliterado, safetensors FP16 (vLLM/SGLang): https://huggingface.co/0bserverx/Qwen3.8-27B-Heretic-Abliterated-Uncensored
- Modelo base abliterado, espectro estándar de cuantizaciones GGUF: https://huggingface.co/0bserverx/Qwen3.8-27B-Heretic-Abliterated-Uncensored-GGUF
- Variante GSQ en `compressed-tensors` (carpeta `GSQ-3bit/`): https://huggingface.co/0bserverx/Qwen3.8-27B-Heretic-Abliterated-Uncensored/tree/main/GSQ-3bit
- Release GSQ-RCO de Qwen3.8-27B de IST-DASLab (asignación RCO e importance matrix): https://huggingface.co/ISTA-DASLab/Qwen3.8-27B-GSQ-RCO-GGUF
- Perfil de IST-DASLab: https://huggingface.co/ISTA-DASLab
- Discusión #11, origen de la petición de esta release: https://huggingface.co/0bserverx/Qwen3.8-27B-Heretic-Abliterated-Uncensored-GGUF/discussions/11
- Perfil del miembro de la comunidad que solicitó la release: https://huggingface.co/Heidagger44
- Nota: la búsqueda web realizada no devolvió resultados relevantes sobre el modelo; únicamente apariciones no relacionadas con el proyecto.
