# chaoliangUNSW/Jev-Style-2B-Decision-v4.2-GGUF

## Resumen

Jev-Style-2B-Decision-v4.2-GGUF es la distribucion en formato GGUF del modelo Jev-Style-2B-Decision-v4.2, un modelo de decision de 1.881.825.088 parametros desarrollado por Chaoliang Yan (usuario chaoliangUNSW). No es un modelo generativo al uso: dado un estado textual y una bateria de preguntas tipadas (`choice`, `noul`, `score`), devuelve una probabilidad para cada opcion suministrada mediante un scorer de atencion por bloques y una cabeza de veredicto especifica. El modelo base esta etiquetado con la familia qwen3.5 y es solo texto.

La relevancia de esta release es practica: permite ejecutar el modelo sin PyTorch, sobre llama.cpp con un build parcheado (`build_jev_score.sh`), en tres precisiones (F16, Q8_0 y Q4_K_M). El modelo original obtuvo 46,74 en la suite Decision Index public 0.3, con 140.178 peticiones puntuadas correctamente, medida sobre el modelo PyTorch BF16 en CUDA. Esta version GGUF es una cuantizacion del mismo, no un reentrenamiento.

Se trata de un modelo de nicho, con 0 descargas y 1 like en el momento de la consulta, y con un protocolo de inferencia no estandar que exige runtime propio. No debe confundirse con un chat model: la model card indica explicitamente que para imagenes hay que usar el modelo principal de HuggingFace, y que el scorer personalizado es obligatorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atencion por bloques entrenada (block-attention) y cabeza de veredicto; familia qwen3.5 segun tags |
| Parametros totales | 1.881.825.088 (1,88 B) antes de cuantizacion |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 32.768 tokens de presupuesto de entrada |
| Tipos de cuantizacion | F16 (3,78 GB), Q8_0 (2,01 GB), Q4_K_M (1,27 GB) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (sin relicenciar datos de terceros ni salidas de profesor) |
| Formato de pesos | GGUF (repo de 7,1 GB); pesos originales en safetensors en el modelo base |

## Arquitectura y entrenamiento

El modelo parte de una arquitectura transformer de 1,88 B parametros con un protocolo de atencion por bloques entrenado especificamente para el calculo compartido de estado entre multiples preguntas. La salida no es texto libre: el readout toma los hidden states del veredicto, los multiplica escalarmente por la diferencia entre las filas de embedding yes/no atadas y aplica softmax para obtener una probabilidad por opcion. El orden de las opciones se preserva, y hay una temperatura global fija de 0,8813575635811984 para los tres tipos de pregunta.

El entrenamiento sigue la linea v4 e incluye destilacion de etiquetas suaves desde la API TypeSafe Jev 1.14, ademas de material generado y de fuentes upstream. No se detalla en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si hubo RLHF o DPO. El modelo se mantiene de forma independiente por Chaoliang Yan, sin afiliacion ni respaldo de TypeSafe.

La innovacion tecnica destacable es el protocolo de decision: en lugar de generar una respuesta, el modelo puntua opciones con un scorer dedicado que requiere un build concreto de llama.cpp (commit 441df11f65ea0b6d0c72965aaf70c8241070ddcb) y el script `build_jev_score.sh`. El repositorio incluye `manifest.json` con tamanos y SHA256 de cada fichero, y `release_config.json` con los pesos origen y los ajustes de conversion.

## Capacidades

- Clasificacion y decision sobre opciones: devuelve una probabilidad para cada opcion suministrada, con tres tipos de pregunta (`choice`, `noul`, `score`).
- Puntuacion de estados textuales: recibe un estado y un conjunto de preguntas tipadas y calcula veredictos de forma determinista dado el orden de opciones.
- Procesamiento por lotes de preguntas: el protocolo de atencion por bloques comparte el calculo de estado entre varias preguntas sobre el mismo estado.
- Entrada en texto y JSON: admite ambos formatos de entrada.
- Limite operativo de 255 opciones por peticion y 32.768 tokens de entrada; las peticiones fuera de presupuesto se rechazan.
- Solo texto: no procesa imagenes; para vision hay que usar el modelo principal de HuggingFace.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso generativo ni modo thinking en la informacion disponible.

## Casos de uso

- Moderacion y triaje de contenido: dado un texto de estado y una pregunta tipo `choice` con opciones predefinidas (por ejemplo, categorias de riesgo), el modelo devuelve la distribucion de probabilidad sobre las opciones, lo que permite umbrales calibrados y revision humana solo en casos ambiguos.
- Enrutado de tickets de soporte: con un estado que describe la incidencia y una pregunta `choice` sobre el equipo o cola destino, se obtiene una probabilidad por cola; el limite de 255 opciones cubre catalogos de destino amplios.
- Verificacion de hechos simples: preguntas tipo `noul` o `score` sobre un estado permiten puntuar afirmaciones o comprobar condiciones booleanas con una probabilidad explicita, util en pipelines de validacion de datos.
- Evaluacion automatizada de respuestas: dado un estado con la pregunta original y la respuesta candidata, el modelo puntua la calidad o correccion mediante preguntas `score`, integrable en suites de evaluacion internas.
- Clasificacion documental por lotes: el calculo compartido de estado entre multiples preguntas sobre el mismo texto reduce el coste cuando hay que aplicar decenas de criterios a un mismo documento.
- Sistemas de decision con requisitos de auditabilidad: la salida es una probabilidad por opcion con temperatura fija y orden preservado, lo que facilita reproducir y auditar decisiones en entornos regulados.
- Despliegue en hardware modesto: la variante Q4_K_M de 1,27 GB permite ejecutar el scorer en portatiles y equipos con GPU de consumo, util para prototipos y pruebas locales antes de pasar a la version BF16 en CUDA.

## Benchmarks y rendimiento

| Metrica | Resultado | Modelo evaluado |
|---|---|---|
| Decision Index public 0.3 (suite completa) | 46,74 | Jev-Style-2B-Decision-v4.2 original en PyTorch BF16 CUDA |
| Peticiones puntuadas correctamente | 140.178 | Jev-Style-2B-Decision-v4.2 original en PyTorch BF16 CUDA |

No se han publicado resultados de benchmarks en la informacion disponible para esta version GGUF ni comparaciones con MMLU, HumanEval, GSM8K u otros benchmarks estandar. El resultado de 46,74 corresponde al modelo original, no a las cuantizaciones GGUF.

## Requisitos de hardware

- VRAM estimada: aproximadamente 3,8 GB para F16, 2,0 GB para Q8_0 y 1,3 GB para Q4_K_M, mas el overhead del runtime y del contexto (hasta 32.768 tokens).
- GPU recomendadas: no se especifican modelos concretos; la model card menciona soporte CUDA mediante `LLAMA_CMAKE_FLAGS="-DGGML_CUDA=ON"` y Metal en Apple silicon.
- GPU de consumo: las tres variantes caben en GPUs consumer con 4 GB o mas de VRAM en el caso de F16, y en 2 GB o mas para Q4_K_M; tambien es viable en CPU.
- Opciones de despliegue: llama.cpp con el commit 441df11f65ea0b6d0c72965aaf70c8241070ddcb y el build `build_jev_score.sh`; el scorer personalizado es obligatorio y no se indica compatibilidad con vLLM, TGI u Ollama.
- Requisitos de entorno: Python 3.12, CMake y compilador C++17.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria (modelos de decision con salida de probabilidad por opcion), y las alternativas generativas de tamano similar no son funcionalmente equivalentes al protocolo de scorer de este modelo.

## Limitaciones y advertencias

- Protocolo no estandar: requiere un runtime parcheado y un commit concreto de llama.cpp; no funciona como un GGUF convencional en herramientas genericas.
- Solo texto: no admite imagenes; para vision hay que usar el modelo principal.
- Limites duros de entrada: 32.768 tokens y 255 opciones; las peticiones fuera de presupuesto se rechazan sin degradacion gradual.
- El resultado de 46,74 en Decision Index corresponde al modelo original en BF16 CUDA, no a las cuantizaciones GGUF; el rendimiento de Q4_K_M y Q8_0 no esta documentado.
- La licencia Apache-2.0 de los pesos no relicencia datos de terceros ni salidas del profesor (TypeSafe Jev 1.14); hay que revisar `LICENSE`, `NOTICE` y la model card del modelo padre antes de uso comercial.
- El modelo se mantiene de forma independiente, sin afiliacion ni respaldo de TypeSafe.
- No se documentan sesgos conocidos, tasas de alucinacion ni cobertura idiomatica; al ser un scorer de opciones, el riesgo de alucinacion se traslada a la calibracion de las probabilidades.
- Adopcion muy baja (0 descargas, 1 like) y publicacion reciente, lo que implica poca validacion externa.
- El autor lo describe como un candidato diagnostico de continuacion de la linea v4, no como un modelo de produccion consolidado.

## Enlaces

- Modelo GGUF en HuggingFace: https://huggingface.co/chaoliangUNSW/Jev-Style-2B-Decision-v4.2-GGUF
- Modelo base: https://huggingface.co/chaoliangUNSW/Jev-Style-2B-Decision-v4.2
- Bundle de resultados de evaluacion: https://huggingface.co/datasets/chaoliangUNSW/decision-index-results-v4.2
- Repositorio de llama.cpp: https://github.com/ggml-org/llama.cpp
