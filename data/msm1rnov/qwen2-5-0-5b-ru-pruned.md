# msm1rnov/qwen2.5-0.5b-ru-pruned

## Resumen

Qwen2.5-0.5B pruned for Russian es una version modificada del modelo base Qwen2.5-0.5B de Alibaba Qwen, publicada por el usuario msm1rnov en HuggingFace. La modificacion consiste en podar el vocabulario del tokenizer y de la matriz de embeddings: se conservan unicamente los tokens que aparecen en 11 MB de texto extraido de Wikipedia en ruso, pasando de 151.643 entradas a 11.753, a las que se anaden 22 tokens nuevos, es decir 11.775 en total. Como consecuencia, el numero de parametros baja de 494,0 M a 368,4 M.

El interes de la ficha esta en que es un ejemplo extremo y muy barato de reducir la huella de memoria de un modelo de lenguaje sin tocar sus pesos internos: solo se eliminan filas del embedding y se renumeran los identificadores de token. Esto reduce el tamano del checkpoint, el coste de la capa de embeddings y el coste de cualquier fine-tuning posterior sobre vocabulario ruso, a cambio de perder cobertura de todos los idiomas y dominios que no estaban representados en el corpus de poda.

Se trata de un modelo base (no instruct), sin entrenamiento adicional ni ajuste por instrucciones ni preferencias, con 0 descargas y 0 likes en el momento de redactar esta ficha, y sin resultados de evaluacion publicados. Es por tanto un artefacto experimental de investigacion mas que un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Qwen2 (RoPE, RMSNorm, SwiGLU, atencion con GQA y embeddings atados), heredada sin cambios de Qwen2.5-0.5B |
| Parametros totales | 368.449.408 (368,4 M); el modelo original tenia 494,0 M |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no confirmada en la model card del derivado; el modelo base Qwen2.5-0.5B declara 32.768 tokens de contexto nativo (ampliable con YaRN), pero este dato no se verifica en el repositorio |
| Tipos de cuantizacion | no disponible en el repositorio; solo se distribuyen pesos en formato safetensors. Al ser un transformer estandar es convertible a GGUF, GPTQ o AWQ con las herramientas habituales, siempre que se regenere el tokenizer y el config con el nuevo tamano de vocabulario |
| Idiomas soportados | ruso (etiqueta `ru`); el resto de idiomas del modelo base queda degradado o directamente inutilizable al haberse eliminado sus tokens |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Tamano de vocabulario | 11.775 tokens (11.753 conservados + 22 anadidos); el original tenia 151.643 |
| Tamano del repositorio | 0,7 GB |
| Cambios respecto al modelo base | eliminacion de filas del embedding y renumeracion de ids; el resto de pesos sin modificar |

## Arquitectura y entrenamiento

La arquitectura es la de Qwen2.5-0.5B: un transformer decoder-only con normalizacion RMSNorm, activacion SwiGLU, atencion de consultas agrupadas (GQA) y codificacion posicional rotatoria (RoPE). El modelo original tiene 24 capas, 14 cabezas de atencion y 2 cabezas KV, con una dimension oculta de 896 y embeddings atados a la cabeza de salida (tied embeddings). No hay innovaciones tecnicas propias de esta version: no se ha anadido decodificacion especulativa, atencion lineal ni ninguna otra variante.

El entrenamiento tampoco es propio. Segun la model card, el autor no realizo ningun entrenamiento ni fine-tuning: unicamente calculo la frecuencia de tokens sobre 11 MB de Wikipedia en ruso, conservo las filas del embedding correspondientes a los tokens observados, anadio 22 tokens adicionales, renumero los identificadores de token y actualizo el tokenizer y el config en consecuencia. Esto implica que el modelo no ha sido adaptado al ruso: simplemente se le ha quitado la capacidad de representar tokens que no aparecian en un corpus pequeno de ese idioma. El resto de la red (atencion, MLP, normalizaciones) mantiene los pesos del Qwen2.5-0.5B original, que fue entrenado por Alibaba Qwen sobre un corpus multilingue de gran escala no detallado en el repositorio.

## Capacidades

- Modelado de lenguaje causal: predice el siguiente token, que es la unica funcion para la que fue entrenado el modelo base.
- Generacion de texto en ruso con vocabulario reducido: puede continuar frases y producir texto en caracteres cirilicos cubiertos por el vocabulario podado.
- Capacidad multilingue: practicamente nula fuera del ruso, porque los tokens de otros alfabetos y de otros idiomas fueron eliminados en la poda.
- Codigo y matematicas: muy limitada o nula, ya que los tokens habituales de lenguajes de programacion, operadores y notacion matematica probablemente no aparecian en 11 MB de Wikipedia en ruso.
- Tool calling / function calling: no soportado; el modelo no es instruct y no ha sido entrenado para ello.
- Uso como agente o razonamiento multi-paso: no soportado.
- Modo "thinking": no disponible.
- Vision, audio u otras modalidades: no disponibles.
- Fine-tuning posterior: al ser un modelo base con embeddings atados, es una base razonable para ajuste supervisado en tareas rusas, con la ventaja de que la matriz de embeddings es aproximadamente 125 M de parametros mas pequena que la original.

## Casos de uso

- Inferencia ligera en CPU o en dispositivos con poca memoria: con 368,4 M de parametros, los pesos ocupan alrededor de 0,74 GB en bf16 y entre 0,19 y 0,25 GB en cuantizacion de 4 bits, por lo que puede ejecutarse en portatiles o mini-PC sin GPU dedicada para tareas de generacion de texto en ruso a baja velocidad.
- Base para fine-tuning en ruso con presupuesto reducido: al tener 11.775 entradas de vocabulario en lugar de 151.643, el optimizador solo necesita actualizar o congelar una matriz de embeddings mucho mas pequena, lo que reduce el coste de memoria de un ajuste supervisado sobre corpus rusos.
- Investigacion sobre poda de vocabulario: sirve como caso de estudio reproducible para medir cuanto degrada la poda de embeddings en funcion del tamano y la composicion del corpus usado para decidir que tokens se conservan.
- Prototipado de completado de texto en ruso: por ejemplo, autocompletar frases cortas o generar variantes de titulares a partir de un prefijo, siempre con revision humana y sin expectativas de calidad alta.
- Aumento de datos sinteticos en ruso a pequena escala: generar continuaciones o parrafos candidatos que despues se filtran manualmente, aprovechando que el coste por token es muy bajo.
- Docencia y demostraciones de tokenizacion: permite mostrar de forma tangible el efecto del vocabulario sobre el numero de parametros, la longitud de las secuencias en tokens y la cobertura de un idioma.
- Clasificacion de textos rusos mediante fine-tuning con cabeza de clasificacion: sentimiento, tematica o deteccion de spam en dominios cuyo vocabulario coincida con el de Wikipedia, aceptando una perdida de cobertura en jerga, marcas y prestamos en alfabeto latino.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye evaluaciones de MMLU, HumanEval, GSM8K ni de ninguna otra prueba estandarizada, ni para el modelo podado ni en comparacion con el modelo base. Tampoco se documentan mediciones de perplejidad sobre corpus rusos, latencia o throughput.

## Requisitos de hardware

- VRAM estimada para los pesos: aproximadamente 1,47 GB en FP32, 0,74 GB en BF16/FP16, 0,37 GB en INT8 y entre 0,19 y 0,25 GB en INT4. Calculo propio a partir del numero de parametros declarado, no publicado por el autor.
- Cache KV estimada: con 24 capas, 2 cabezas KV y dimension de cabeza 64 (configuracion del modelo base), el coste seria de unos 12 KB por token en FP16, es decir alrededor de 400 MB si se llenase una ventana de 32.768 tokens. Estimacion propia, no verificada en el repositorio. En la practica, la cache KV domina el consumo de memoria a contextos largos.
- GPUs recomendadas: cualquier GPU consumer reciente sirve, por ejemplo RTX 3060, RTX 4060, RTX 4090 o GTX 1060 de 6 GB en cuantizacion. No requiere A100, H100 ni GPUs de centro de datos.
- Cabe en GPU consumer: si, en practicamente todas las GPU con 4 GB o mas de VRAM, incluso en FP32. Tambien cabe holgadamente en CPU con 2-4 GB de RAM libre.
- Opciones de despliegue: transformers con PyTorch es la via mas directa; llama.cpp y Ollama son viables tras convertir a GGUF, pero requieren regenerar el tokenizer y el config con el vocabulario de 11.775 tokens; vLLM y TGI son teoricamente compatibles, aunque exigen verificar que el `config.json` declare el `vocab_size` correcto y que la plantilla de chat no asuma el tokenizer original de Qwen.
- Latencia y throughput: no disponible. No hay mediciones publicadas de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

| Modelo | Parametros | Vocabulario | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen2.5-0.5b-ru-pruned | 368,4 M | 11.775 tokens | no confirmado en la model card | Apache-2.0 | HuggingFace, 0 descargas |
| Qwen2.5-0.5B (base) | 494,0 M | 151.643 tokens | 32.768 tokens nativos, ampliable con YaRN | Apache-2.0 | HuggingFace oficial de Qwen, ampliamente descargado |
| Qwen2.5-0.5B-Instruct | 494,0 M | 151.643 tokens | 32.768 tokens nativos, ampliable con YaRN | Apache-2.0 | HuggingFace oficial de Qwen, con ajuste por instrucciones |
| Qwen2.5-1.5B | 1.540 M | 151.643 tokens | 32.768 tokens nativos, ampliable con YaRN | Apache-2.0 | HuggingFace oficial de Qwen |

La comparacion en calidad no puede establecerse con datos: no hay benchmarks del modelo podado ni evaluaciones que cuantifiquen la perdida frente al modelo base. La unica ventaja medible es de tamano: 125,6 M de parametros menos, concentrados en la matriz de embeddings, y un checkpoint de 0,7 GB. El resto de alternativas de la tabla son modelos oficiales, mantenidos y evaluados; este derivado no lo esta.

## Limitaciones y advertencias

- Es un modelo base, no instruct: no sigue instrucciones de forma fiable ni mantiene formatos de respuesta estructurados. Usarlo como asistente conversacional produce resultados pobres.
- No hubo fine-tuning despues de la poda, por lo que no hay recuperacion de la capacidad perdida. Es esperable una degradacion apreciable en la calidad de la generacion frente al modelo original, aunque el autor no publica mediciones que la cuantifiquen.
- El corpus de poda es muy pequeno (11 MB de Wikipedia en ruso) y de un unico dominio. Cualquier token frecuente en codigo, matematicas, notacion cientifica, alfabeto latino, otros idiomas, jerga, marcas o nombres propios poco comunes que no apareciese en ese corpus ha sido eliminado y no puede representarse.
- Tokenizer modificado: los identificadores de token ya no coinciden con los de Qwen2.5, de modo que cualquier herramienta, plantilla de chat, dataset pre-tokenizado o script que asuma el vocabulario original fallara o producira resultados incorrectos.
- Los textos que contengan tokens eliminados se tokenizaran de forma degradada, con fragmentacion en bytes o sustituciones, lo que afecta tanto a la entrada como a la salida.
- Riesgo de alucinacion elevado por el tamano del modelo (368 M de parametros) y por la ausencia de ajuste por preferencias.
- Sesgos heredados del corpus de entrenamiento del modelo base, predominantemente web y con fuerte peso del ingles y del chino, que la poda del vocabulario no corrige.
- Uso comercial permitido por la licencia Apache-2.0, siempre que se conserve el aviso de copyright y se indique que el modelo ha sido modificado, tal y como exige la propia licencia.
- Sin validacion de la comunidad: 0 descargas y 0 likes, sin informes de terceros, sin evaluaciones de seguridad y sin garantia de que el proceso de poda se haya aplicado de forma consistente en todos los ficheros. No es apto para produccion sin una evaluacion propia previa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/msm1rnov/qwen2.5-0.5b-ru-pruned
- Modelo base Qwen2.5-0.5B: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Modelo base Qwen2.5-0.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Organizacion Qwen en HuggingFace: https://huggingface.co/Qwen
- Repositorio oficial de Qwen2.5 en GitHub: https://github.com/QwenLM/Qwen2.5
- Informe tecnico de Qwen2.5: https://arxiv.org/abs/2412.15115
- No se han encontrado en la informacion proporcionada otros enlaces a papers, blogs, demos o repositorios especificos de esta version podada.
