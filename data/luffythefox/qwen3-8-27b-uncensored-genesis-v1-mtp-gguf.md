# LuffyTheFox/Qwen3.8-27B-Uncensored-Genesis-V1-MTP-GGUF

# Qwen3.8-27B-Uncensored-Genesis-V1-MTP-GGUF

## Resumen

Qwen3.8-27B-Uncensored-Genesis-V1-MTP-GGUF es una publicacion de pesos en formato GGUF derivada del modelo HauhauCS/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF, a su vez un ajuste "uncensored" sobre una base Qwen3.8-27B. El autor, LuffyTheFox, no entrena ni reentrena el modelo: aplica un procedimiento de posprocesado numerico denominado Genesis sobre los tensores del GGUF original, con el objetivo de reducir el ruido acumulado durante el entrenamiento. El modelo se distribuye con pipeline image-text-to-text, por lo que conserva un componente multimodal de vision, y esta etiquetado como conversacional y compatible con endpoints.

La innovacion declarada no es arquitectonica sino de "cirugia numerica": Genesis se apoya en el articulo Optimal Shrinkage of Eigenvalues in the Spiked Covariance Model (arXiv:1311.0851) y en la distribucion de Marchenko-Pastur para decidir que componentes de cada matriz de pesos corresponden a ruido y cuales a senal aprendida. El autor sostiene que este ruido genera una "Noise Gate" que degrada la estabilidad, la verbosidad y la fidelidad de las respuestas del modelo, y que su metodo la reduce sin tocar el conocimiento adquirido ni el gradiente. Todo el proceso se ejecuta, segun la model card, en Google Colab gratuito sobre una GPU Tesla T4.

El atractivo inmediato de la ficha es doble: por un lado, ofrece un modelo multimodal de 27.320.697.856 parametros con licencia apache-2.0 y sin filtros de alineamiento; por otro, propone un metodo de mejora aplicable teoricamente a cualquier GGUF. Sin embargo, no se publican resultados de benchmarks, evaluaciones objetivas ni detalles completos de arquitectura (longitud de contexto, composicion del entrenamiento), por lo que su adopcion en produccion exige validacion propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiquetas del repo: "dence"; pipeline image-text-to-text; la model card menciona tensores ssm_conv1d) |
| Parametros totales | 27.320.697.856 (27,32 B), dato extraido de safetensors |
| Parametros activos | no aplica (no hay indicios de arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo es GGUF y pesa 95,0 GB, pero no se listan los niveles publicados; la model card enlaza un script de cuantizacion con perfiles de Unsloth) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (repo); el recuento de parametros procede de metadatos safetensors |
| Modelo base | HauhauCS/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF |
| Metodo de posprocesado | Genesis (reparacion de tensores, no entrenamiento) |
| Modalidad | texto e imagen-texto (multimodal / vision) |
| Descargas / likes | 3.336 descargas, 9 likes |
| Fecha de publicacion | 9 de septiembre de 2026 (actualizado el mismo dia) |

## Arquitectura y entrenamiento

El autor no describe la arquitectura interna del modelo y remite al repositorio base. Las etiquetas indican "dence" (dense) y el pipeline declarado es image-text-to-text, lo que implica un codificador visual junto al decodificador de lenguaje. Como contradiccion no resuelta, la descripcion del metodo Genesis menciona la inspeccion de tensores ssm_conv1d, propios de arquitecturas de espacio de estados (SSM) o hibridas, algo poco habitual en un transformer denso clasico. El sufijo MTP del nombre apunta a multi-token prediction, pero la model card no detalla como se implementa ni que implica para la inferencia. No hay informacion sobre numero de tokens de entrenamiento, composicion del dataset, ni sobre si la base "aggressive uncensored" se obtuvo mediante SFT, DPO u otras tecnicas de alineamiento.

El elemento diferencial es Genesis, un pipeline de reparacion de tensores en tres etapas que opera directamente sobre los bytes del fichero GGUF. La primera etapa analiza los tensores ssm_conv1d, responsables de la memoria de contexto largo, y reequilibra la contribucion entre cabezas. La segunda recorre los bloques del modelo por fragmentos segun tres parametros y selecciona el fragmento cuya distribucion de pesos encaja mejor para reemplazar bloques nulos (los bloques de ceros corrompen la senal y amplifican el ruido). La tercera aplica un SVD personalizado basado en la ley de Marchenko-Pastur para atenuar el ruido de entrenamiento conservando, segun el autor, el 99% de la senal y el gradiente aprendido; en este paso se excluyen token_embd.weight, output.weight, tensores 1D, bias y normalizaciones. El procedimiento es agnostico a la arquitectura y se ejecuta en Python sobre una Tesla T4 en la capa gratuita de Google Colab.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles, con plantilla de chat especifica recomendada por el autor.
- Modo thinking (razonamiento explicito) activable, con parametro reasoning_effort (el autor recomienda "medium"); modo instruct alternativo con enable_thinking=false.
- Entrada de imagen junto a texto (image-text-to-text), es decir, descripcion de imagenes y preguntas sobre contenido visual.
- Modelo "uncensored": la model card y las etiquetas indican ausencia deliberada de filtros de rechazo, lo que amplia el rango de tematicas aceptadas pero elimina salvaguardas de seguridad.
- Capacidades multilingues: no disponibles; el unico idioma declarado es el ingles.
- Tool calling / function calling: no documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado explicitamente, aunque el modo thinking y la etiqueta conversational son compatibles con ese uso.
- Compatibilidad declarada con endpoints (tag endpoints_compatible).
- Ajuste de cuantizacion de cache K y V a F16 recomendado por el autor para estabilidad.

## Casos de uso

- Generacion creativa y narrativa sin restricciones tematicas: el ajuste uncensored permite abordar ficcion adulta, terror o temas sensibles que los modelos alineados suelen rechazar; util en proyectos editoriales donde el filtrado automatico resulta contraproducente.
- Analisis de imagenes en flujos de trabajo internos: al aceptar entrada image-text-to-text, puede emplearse para describir capturas, diagramas o fotos de producto y generar metadatos o alt-text, siempre que el contenido este en ingles.
- Asistente conversacional autoalojado con privacidad: al distribuirse en GGUF, puede ejecutarse en hardware propio sin enviar datos a terceros, lo que encaja en entornos con requisitos de confidencialidad sobre prompts y documentos.
- Prototipado rapido de agentes con razonamiento visible: el modo thinking permite inspeccionar la cadena de razonamiento antes de la respuesta final, util para depurar prompts y evaluar la calidad del razonamiento en tareas de varios pasos.
- Reproduccion de investigacion sobre tecnicas de reparacion de tensores: el modelo sirve como caso de estudio del metodo Genesis y de su aplicabilidad a otros GGUF, comparando el comportamiento antes y despues del posprocesado.
- Generacion de texto aumentada por recuperacion (RAG): puede integrarse en pipelines que inyecten contexto documental, con la cautela de que la longitud de contexto real no esta documentada y debe medirse empiricamente.
- Despliegue en estaciones de trabajo con GPU de consumo: al existir cuantizaciones GGUF, es viable en equipos con 24 GB de VRAM usando niveles de 4 bits con offload parcial, lo que permite entornos de desarrollo sin infraestructura de datacenter.
- Evaluacion comparativa de penalizaciones de repeticion y decodificacion: la propia model card documenta problemas de "thinking ruidoso" y propone ajustes de repeat-penalty, repeat-last-n y DRY, lo que convierte al modelo en banco de pruebas para tecnicas de sampling.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra metrica cuantitativa, y tampoco se aportan comparaciones medidas contra el modelo base que permitan cuantificar el efecto atribuido al metodo Genesis.

## Requisitos de hardware

Las cifras de VRAM son estimaciones calculadas a partir del recuento real de parametros (27,32 B) y no han sido publicadas por el autor; deben sumarse ademas la cache KV (que el autor recomienda en F16) y el codificador visual.

- FP16 (sin cuantizar): aproximadamente 54,6 GB solo en pesos; requiere GPU de 80 GB (A100 80GB, H100 80GB) o multi-GPU.
- Q8_0: aproximadamente 29 GB de pesos; A100 40GB, L40S 48GB o RTX 6000 Ada.
- Q6_K: aproximadamente 22,5 GB; ajustado en RTX 3090/4090 de 24 GB con contexto corto.
- Q5_K_M: aproximadamente 19 GB; cabe en RTX 3090, RTX 4090, RTX 5090 con contexto moderado.
- Q4_K_M: aproximadamente 16,5 GB; nivel recomendado para GPU de consumo de 24 GB, dejando margen para contexto y vision.
- Q3_K_M: aproximadamente 13,5 GB; viable en GPU de 16 GB (RTX 4080, RTX 4060 Ti 16GB) con contexto reducido.
- Q2_K: aproximadamente 10,5 GB; viable en GPU de 12 GB, con perdida de calidad esperable y mayor riesgo de degeneracion.
- CPU + RAM: los niveles de 4 bits o inferiores pueden ejecutarse con offload parcial a CPU si se dispone de 32-64 GB de RAM; el rendimiento dependera del ancho de banda de memoria.
- Opciones de despliegue: llama.cpp (llama-server) y sus envoltorios (Ollama, LM Studio, KoboldCpp, Jan) son las rutas naturales para GGUF; llama-cpp-python para integracion en Python. vLLM y TGI tienen soporte limitado o nulo para GGUF, por lo que para servirlos en produccion con alto throughput haria falta una version en safetensors, no publicada en este repo.
- Latencia y throughput: no disponibles. La model card solo indica configuraciones de sampling y de cache, no medidas de velocidad.
- Nota de configuracion: el autor recomienda cuantizar la cache K y V en F16, maximizar el offload a GPU y usar una plantilla de chat concreta (enlazada en la seccion de enlaces).

## Comparativa con modelos similares

La informacion disponible no incluye datos de rendimiento de este modelo, por lo que la comparacion se limita a parametros, licencia y disponibilidad. Los datos de las alternativas corresponden a su documentacion publica.

| Modelo | Parametros | Contexto | Licencia | Modalidad | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-Uncensored-Genesis-V1-MTP-GGUF | 27,32 B | no disponible | apache-2.0 | texto e imagen-texto | GGUF, sin benchmarks publicados, ajuste uncensored + reparacion Genesis |
| HauhauCS/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF (base) | 27 B (aproximado, no confirmado) | no disponible | no disponible en la informacion proporcionada | texto e imagen-texto | Modelo de partida; permite aislar el efecto del metodo Genesis |
| Qwen3-32B | 32,8 B | 128 k (segun documentacion publica de Qwen) | apache-2.0 | texto | Alternativa densa de tamano similar, con benchmarks publicados y soporte amplio en vLLM/SGLang |
| Mistral Small 3.1 24B | 24 B | 128 k (segun documentacion publica de Mistral) | apache-2.0 | texto y vision | Alternativa europea multimodal y alineada, con evaluaciones publicadas |

Diferencias clave: frente a las alternativas, esta publicacion ofrece un modelo sin filtros de seguridad y un pipeline de mejora numerica propietario, pero carece de contexto documentado, benchmarks y versiones en safetensors, y su licencia apache-2.0 se hereda de una cadena de modelos cuya procedencia de datos no se detalla.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia cuantitativa de que el metodo Genesis mejore la calidad respecto al modelo base; cualquier afirmacion al respecto es, por ahora, una hipotesis del autor.
- Modelo "uncensored": no incorpora salvaguardas de alineamiento, por lo que puede generar contenido danino, ilegal o gravemente ofensivo. No es apto para aplicaciones de cara al publico sin una capa de moderacion externa.
- Riesgo de alucinacion: inherente a los modelos de este tamano y agravado por la ausencia de evaluaciones; el uso en dominios factuales exige verificacion.
- Idioma unico: solo ingles declarado. No hay garantia de comportamiento correcto en castellano ni en otros idiomas.
- Contexto desconocido: la ventana maxima no esta documentada; no debe asumirse ninguna cifra sin medirla con pruebas propias.
- Documentacion incompleta de la arquitectura: no se aclara la discrepancia entre la etiqueta "dence" y la mencion de tensores ssm_conv1d, ni el funcionamiento real del componente MTP.
- Reproducibilidad: el pipeline Genesis se describe en prosa y con un script de cuantizacion enlazado, pero no se publica codigo completo ni artefactos de verificacion; no hay validacion independiente del metodo.
- Degeneracion en cuantizaciones agresivas: el propio autor advierte que los modelos Qwen cuantizados degeneran con rapidez y recomienda ajustes de repeat-penalty, repeat-last-n y DRY para contener el "thinking ruidoso".
- Dependencia de configuracion: el rendimiento depende de la plantilla de chat (externa al repo), de la cuantizacion de cache en F16 y de maximizar el offload; desviarse de estas recomendaciones puede degradar notablemente la salida.
- Licencia: apache-2.0 permite uso comercial, pero la cadena de modelos base ("uncensored aggressive" de un tercero) puede introducir obligaciones adicionales no reflejadas en esta ficha; conviene revisar las condiciones del repositorio base antes de un despliegue comercial.
- Fecha y madurez: publicacion de septiembre de 2026 con 9 likes y algo mas de 3.300 descargas; ecosistema de terceros escaso y sin historial de mantenimiento.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/LuffyTheFox/Qwen3.8-27B-Uncensored-Genesis-V1-MTP-GGUF
- Modelo base: https://huggingface.co/HauhauCS/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF
- Perfil del autor del modelo base: https://huggingface.co/HauhauCS
- Articulo de referencia del metodo Genesis: https://arxiv.org/abs/1311.0851v1 (Optimal Shrinkage of Eigenvalues in the Spiked Covariance Model)
- Distribucion de Marchenko-Pastur: https://en.wikipedia.org/wiki/Marchenko%E2%80%93Pastur_distribution
- Script de cuantizacion con perfiles de Unsloth: https://pastebin.com/hXhcMJn9
- Plantilla de chat recomendada (chat_template.jinja): https://huggingface.co/peculiar-ragdoll/Qwen-Sharp-Chat-Templates/raw/main/chat_template.jinja
- Perfil del autor de la plantilla de chat: https://huggingface.co/peculiar-ragdoll
- Tarjeta oficial del modelo Qwen3.8-27B citada por el autor: https://huggingface.co/Qwen/Qwen3.8-27B
- Discord del proyecto Genesis: https://discord.gg/SZ5vacTXYf
- Donaciones (Tribute): https://web.tribute.tg/d/KIH
- Donaciones (Hipolink): https://hipolink.net/luffythefox
- Contacto del autor: luffythefox@mail.ru, azakharchenko92@gmail.com; Telegram @LuffyTheFox
- Nota sobre la busqueda web: los resultados obtenidos corresponden a paginas de soporte de Windows en aleman y no guardan relacion con este modelo, por lo que no se incluyen como fuentes.
