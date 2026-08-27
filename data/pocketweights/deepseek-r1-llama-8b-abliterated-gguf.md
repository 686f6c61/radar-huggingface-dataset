# PocketWeights/DeepSeek-R1-Llama-8B-Abliterated-GGUF

## Resumen

PocketWeights/DeepSeek-R1-Llama-8B-Abliterated-GGUF es una version cuantizada en formato GGUF del modelo DeepSeek-R1-Distill-Llama-8B, al que se le ha aplicado una tecnica de "abliteracion" para eliminar los mecanismos internos de rechazo y negativa. El modelo base original es un destilado de DeepSeek-R1 sobre la arquitectura Llama 3.1 de 8.000 millones de parametros, desarrollado por DeepSeek, que conserva las capacidades de razonamiento encadenado (chain-of-thought) del modelo original. La abliteracion, realizada por huihui-ai mediante proyeccion ortogonal y steering de activaciones, neutraliza las direcciones internas asociadas al rechazo sin degradar aparentemente la capacidad de razonamiento logico.

El proyecto PocketWeights se centra en optimizar modelos open source de ultima generacion a formatos GGUF eficientes para ejecucion local en hardware de consumo. Esta edicion ofrece tres niveles de cuantizacion (Q3_K_M, Q4_K_M y Q6_K) que permiten ejecutar el modelo en GPUs de entre 4 y 8 GB de VRAM, incluyendo tarjetas como RTX 3050, RTX 3060, RTX 4060 y Apple Silicon. El modelo mantiene las etiquetas internas de pensamiento de DeepSeek, lo que permite observar el proceso de razonamiento paso a paso, pero sin los filtros de seguridad del modelo original. Esta orientado a investigadores de seguridad, escritores creativos y desarrolladores que necesitan un modelo de razonamiento sin restricciones en entornos locales aislados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Llama 3.1, 8B) |
| Parametros totales | 8.030.261.312 (8B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q3_K_M (~3,8 GB), Q4_K_M (~4,9 GB), Q6_K (~6,6 GB) |
| Idiomas soportados | No disponibles |
| Licencia | Llama 3.1 Community License |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo parte de DeepSeek-R1-Distill-Llama-8B, un destilado del sistema DeepSeek-R1 sobre la arquitectura Llama 3.1 de 8B parametros. DeepSeek-R1 original se entreno mediante aprendizaje por refuerzo (RL) con el algoritmo GRPO, logrando un rendimiento comparable a OpenAI-o1 en tareas de matematicas, codigo y razonamiento. El proceso de destilacion transfirio estas capacidades al modelo de 8B utilizando los outputs generados por el modelo R1 completo como datos de entrenamiento.

Sobre esta base, huihui-ai aplico una tecnica de abliteracion que combina proyeccion ortogonal y steering de activaciones para neutralizar las direcciones internas del modelo asociadas al rechazo y a la negativa. El resultado es un modelo que conserva las etiquetas internas de pensamiento de DeepSeek (etiquetas `thinking`) y su capacidad de razonamiento encadenado, pero que no muestra reticencia ante peticiones complejas o controvertidas. El autor de PocketWeights afirma que el modelo ofrece "logica de nivel 30B+" en un paquete de 8B, aunque esta afirmacion no esta respaldada por benchmarks publicados en la informacion disponible.

## Capacidades

- Razonamiento encadenado (chain-of-thought) con etiquetas internas de pensamiento visibles, heredado de DeepSeek-R1.
- Generacion de texto sin filtros de rechazo ni moralizacion, gracias al proceso de abliteracion.
- Capacidades destacadas en codigo y matematicas para su tamano, segun el autor del modelo.
- Escritura creativa y roleplay sin restricciones, orientado a narrativa libre.
- Ejecucion local en hardware de consumo con cuantizaciones de 3, 4 y 6 bits.
- Compatible con multiples frontends de inferencia: LM Studio, Ollama, llama.cpp, Kobold.cpp, Jan y SillyTavern.
- No se menciona soporte de tool calling, function calling, vision ni audio en la informacion disponible.

## Casos de uso

- Red teaming de seguridad: el modelo permite probar sistemas de moderacion y deteccion de contenido generando respuestas sin filtros, lo que resulta util para evaluar la robustez de clasificadores y sistemas de guardarrailes en entornos controlados.
- Roleplay sin restricciones en SillyTavern o Kobold.cpp: su naturaleza abliterada y su capacidad de razonamiento permiten mantener personajes coherentes y tramas complejas sin interrupciones moralizantes, con la ventaja de ejecutarse localmente en una GPU de 6 GB.
- Asistente de codigo local: su destilacion de DeepSeek-R1 le confiere capacidades de razonamiento para depuracion, generacion de algoritmos y explicacion de fragmentos de codigo, ejecutable sin conexion en un portatil con RTX 3060.
- Resolucion de problemas matematicos: el razonamiento paso a paso con etiquetas de pensamiento visibles permite seguir el proceso de deduccion, util para educacion y verificacion de resultados.
- Investigacion sobre mecanismos de rechazo en LLMs: al comparar este modelo con la version original con guardarrailes, los investigadores pueden estudiar que direcciones internas controlan el comportamiento de rechazo y como afecta su eliminacion al rendimiento general.
- Escritura creativa experimental: la ausencia de filtros permite explorar temas controvertidos o escenarios extremos en narrativa, con la coherencia y profundidad que aporta el razonamiento encadenado.
- Prototipado de aplicaciones de generacion de texto en entornos aislados: su formato GGUF y su compatibilidad con Ollama y llama.cpp facilitan el despliegue rapido en maquinas sin GPU dedicada, usando solo CPU y RAM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para esta version abliterada y cuantizada. El modelo original DeepSeek-R1-Distill-Llama-8B (sin abliterar) tiene benchmarks publicados por DeepSeek, pero no se incluyen en la documentacion de PocketWeights. El autor afirma que el modelo ofrece "logica de nivel 30B+" sin aportar datos numericos que lo respalden.

## Requisitos de hardware

- Q3_K_M (~3,8 GB): recomendado para 4 GB de VRAM o 6 GB de RAM. Compatible con GTX 1650, RTX 3050 y sistemas con 8 GB de RAM.
- Q4_K_M (~4,9 GB): recomendado para 6 GB de VRAM o 8 GB de RAM. Compatible con RTX 3060, RTX 4050 y Apple Silicon (serie M).
- Q6_K (~6,6 GB): recomendado para 8 GB de VRAM o 16 GB de RAM. Compatible con RTX 4060, RTX 3070 y equipos de sobremesa.
- Opciones de despliegue: LM Studio (interfaz grafica), Ollama (linea de comandos), llama.cpp, Kobold.cpp, Jan y Text-Generation-WebUI.
- El modelo puede ejecutarse en CPU con cantidades suficientes de RAM, aunque con mayor latencia que en GPU.
- No se proporcionan datos de latencia ni throughput en la informacion disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizaciones | Licencia | Guardarrailes |
|---|---|---|---|---|---|
| PocketWeights/DeepSeek-R1-Llama-8B-Abliterated-GGUF | 8B | No disponible | Q3_K_M, Q4_K_M, Q6_K | Llama 3.1 | Eliminados (abliterado) |
| DeepSeek-R1-Distill-Llama-8B (original) | 8B | No disponible | No aplica (safetensors) | MIT | Activos |
| DeepSeek-R1-Distill-Llama-8B-Abliterated-GGUF (mradermacher) | 8B | No disponible | Multiples GGUF | Llama 3.1 | Eliminados (abliterado) |
| DeepSeek-R1-Distill-Qwen-7B | 7B | No disponible | No aplica (safetensors) | MIT | Activos |

La diferencia principal entre esta version y la original de DeepSeek es la eliminacion de los mecanismos de rechazo. Frente a la version abliterada de mradermacher, la de PocketWeights se diferencia por el proceso de cuantizacion y las recomendaciones de hardware especificas. La version Qwen-7B es una alternativa de tamano similar con distinta arquitectura base.

## Limitaciones y advertencias

- El modelo ha sido despojado de sus guardarrailes de seguridad: puede generar contenido ofensivo, peligroso o ilegal. No debe desplegarse en produccion sin sistemas de moderacion externos.
- La abliteracion puede degradar sutilmente la calidad del razonamiento en algunos dominios, aunque el autor afirma que el impacto es minimo sin aportar datos comparativos.
- No se dispone de informacion sobre la longitud de contexto soportada en esta version cuantizada, lo que limita la planificacion de despliegues con ventanas largas.
- La licencia Llama 3.1 Community License impone restricciones de uso comercial: los productos con mas de 700 millones de usuarios mensuales requieren una licencia comercial de Meta.
- Los idiomas soportados no estan documentados; el modelo base de DeepSeek esta principalmente orientado a ingles y chino, pero no se confirma para esta version.
- El autor recomienda su uso exclusivamente en entornos locales aislados y para fines de investigacion, escritura o desarrollo.
- No se proporcionan benchmarks verificados para esta version, por lo que las afirmaciones de rendimiento del autor deben tomarse con cautela.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/PocketWeights/DeepSeek-R1-Llama-8B-Abliterated-GGUF
- Modelo base abliterado (huihui-ai): https://huggingface.co/huihui-ai/DeepSeek-R1-Distill-Llama-8B-abliterated
- Modelo original DeepSeek-R1-Distill-Llama-8B: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Llama-8B
- Repositorio GitHub de DeepSeek-R1: https://github.com/deepseek-ai/DeepSeek-R1
- Pagina del modelo en Ollama: https://ollama.com/library/deepseek-r1:8b
- Version GGUF alternativa (mradermacher): https://huggingface.co/mradermacher/DeepSeek-R1-Distill-Llama-8B-Abliterated-GGUF
- Guia de referencia local-ai-zone: https://local-ai-zone.github.io/models/deepseek-r1-distill-llama-8b.html
