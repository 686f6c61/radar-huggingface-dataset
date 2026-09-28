# CompiwerAI/Mtrini-27B-Tellus-Adapter

## Resumen

Mtrini-27B-Tellus-Adapter es un adaptador de ajuste fino supervisado (SFT) publicado por CompiwerAI, entrenado sobre el modelo base Qwen/Qwen3.8-27B mediante la libreria TRL de Hugging Face. No se trata de un modelo completo, sino de un conjunto de pesos adicionales en formato PEFT/LoRA: el repositorio ocupa 0,3 GB, un orden de magnitud coherente con un adaptador y no con un modelo de 27.000 millones de parametros. Para utilizarlo es imprescindible descargar por separado el modelo base y cargar el adaptador encima.

La informacion publicada es minima. La model card se limita a indicar que es una version afinada de Qwen/Qwen3.8-27B entrenada con TRL y a listar las versiones de framework (PEFT 0.21.0, TRL 1.14.0, Transformers 5.17.0, PyTorch 2.11.0, Datasets 5.0.1, Tokenizers 0.23.2). No se documentan hiperparametros, composicion del dataset, numero de tokens de entrenamiento, ni resultados de evaluacion. La licencia aparece como un marcador de posicion sin contenido ("licence: license"), por lo que su situacion legal es indeterminada.

Su relevancia practica es limitada pero concreta: sirve como ejemplo reproducible de un pipeline de SFT con TRL y como punto de partida para quien quiera inspeccionar, fusionar o continuar el ajuste de un adaptador sobre la familia Qwen. Los repositorios hermanos del mismo autor (Mtrini-27B-Tellus, Mtrini-27B-Tellus-GGUF, Mtrini-Tellus-1.0) sugieren que forma parte de una linea de publicaciones mas amplia, aunque ninguno de ellos aporta documentacion tecnica sustancial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (adaptador PEFT/LoRA sobre Qwen/Qwen3.8-27B; la arquitectura del modelo base no se documenta) |
| Parametros totales | no disponible (el repositorio ocupa 0,3 GB, tamano propio de un adaptador, no de un modelo completo) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en este repositorio; el autor mantiene un repositorio hermano en formato GGUF (Mtrini-27B-Tellus-GGUF) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card incluye el marcador sin contenido "licence: license") |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA entrenado con SFT mediante TRL, la libreria de ajuste fino de Hugging Face. Los tags del repositorio confirman la cadena de herramientas: peft, safetensors, lora, sft, transformers, trl. Esto implica que el adaptador modifica un subconjunto de las matrices del modelo base mediante factorizacion de bajo rango, y que puede cargarse sin fusionar (manteniendo el modelo base intacto y permitiendo conmutar varios adaptadores) o fusionarse en los pesos base para producir un modelo unico.

No se especifica el rango de LoRA, el valor de alpha, los modulos objetivo, la tasa de aprendizaje, el numero de pasos ni la composicion del dataset de entrenamiento. Tampoco se indica si hubo fases posteriores de alineacion (DPO, RLHF) mas alla del SFT declarado. La model card reproduce el ejemplo generico de TRL con el campo `model` establecido en `"None"`, lo que indica que la plantilla no se personalizo. Las versiones de framework citadas (Transformers 5.17.0, PyTorch 2.11.0, PEFT 0.21.0) son posteriores a las disponibles en el momento de redactar esta ficha, un detalle a verificar antes de intentar reproducir el entrenamiento.

## Capacidades

- Generacion de texto y uso conversacional: los tags incluyen text-generation y conversational, lo que indica que el ajuste se oriento a dialogos multi-turno.
- Ajuste de dominio sobre el modelo base: al ser un adaptador, su funcion es desplazar el comportamiento del modelo base hacia la distribucion de datos usada en el SFT.
- Carga y conmutacion mediante PEFT: puede aplicarse sobre Qwen/Qwen3.8-27B sin duplicar los pesos completos, y combinarse con otros adaptadores en un mismo servidor.
- Fusion de pesos: al ser safetensors estandar de PEFT, es posible fusionarlo en el modelo base para obtener un checkpoint unico.
- Razonamiento, codigo, matematicas, vision, tool calling, agentes y capacidades multilingues: no disponible. No se documenta ninguna capacidad especifica del adaptador ni se detalla que capacidades del modelo base se preservan.
- Modo thinking, entrada de audio o vision: no disponible.

## Casos de uso

- Adaptacion de un asistente conversacional a un dominio concreto: se cargaria el adaptador sobre Qwen/Qwen3.8-27B con PEFT y se serviria el conjunto a traves de un endpoint de chat, asumiendo que los datos de SFT corresponden al dominio objetivo, extremo que no se documenta.
- Servicio multi-LoRA en produccion: en servidores que soportan adaptadores dinamicos (por ejemplo vLLM), un unico despliegue del modelo base de 27B puede atender varias especializaciones cargando y descargando adaptadores de 0,3 GB, con un coste de memoria marginal por especializacion.
- Experimentacion academica con SFT y TRL: sirve como referencia de un pipeline completo de ajuste supervisado, util para comparar configuraciones de entrenamiento o para ensenar el flujo PEFT + TRL de principio a fin.
- Punto de partida para ajuste incremental: el adaptador puede continuarse entrenando sobre un dataset propio, aprovechando que los pesos base permanecen congelados y que el estado optimizador necesario es mucho menor que el de un ajuste completo.
- Fusion y exportacion a otros formatos: una vez fusionado, el checkpoint resultante puede convertirse a GGUF u otros formatos para su despliegue en llama.cpp u Ollama, siguiendo el patron de los repositorios GGUF del mismo autor.
- Evaluacion por ablacion frente al modelo base: permite medir el efecto aislado del SFT comparando las respuestas del modelo base con y sin adaptador sobre el mismo conjunto de prompts, siempre que se fije una configuracion de decodificacion identica.
- Prototipado rapido de un asistente interno: con 0,3 GB de pesos adicionales, el coste de almacenamiento y de transferencia del adaptador es despreciable frente al del modelo base, lo que abarata iterar sobre distintas versiones de ajuste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM del adaptador: aproximadamente 0,3 GB de pesos adicionales sobre el modelo base, en cualquier configuracion de despliegue.
- VRAM del modelo base: no disponible en la documentacion. Como referencia aritmetica, un modelo denso de 27.000 millones de parametros en bf16 ocupa del orden de 54 GB solo en pesos, y aproximadamente 14-16 GB en cuantizacion de 4 bits, sin contar cache KV ni overhead del runtime. Estas cifras son una estimacion por tamano, no un dato publicado.
- GPU recomendadas: no disponible. Cualquier recomendacion depende de la arquitectura real del modelo base, que no esta documentada.
- Cabe en GPU de consumo: no disponible. En funcion de la cuantizacion elegida y de la arquitectura real, un modelo de 27B podria caber en tarjetas con 24 GB (RTX 3090, RTX 4090) en 4 bits, pero esto no puede confirmarse con la informacion disponible.
- Opciones de despliegue: PEFT + Transformers para carga directa del adaptador; vLLM o TGI si se requiere multi-LoRA o mayor throughput; llama.cpp u Ollama si se fusiona y convierte a GGUF. Las versiones de Transformers y PyTorch citadas por el autor pueden no estar disponibles en todos los entornos.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos verificables de benchmarks, parametros del modelo base ni licencia, por lo que no es posible establecer una comparativa cuantitativa fiable. La siguiente tabla recoge unicamente los artefactos relacionados localizados en la busqueda web, con el nivel de detalle disponible.

| Modelo | Tipo | Formato | Datos conocidos | Licencia |
|---|---|---|---|---|
| CompiwerAI/Mtrini-27B-Tellus-Adapter | Adaptador LoRA (SFT) | safetensors, PEFT | Base Qwen/Qwen3.8-27B, repositorio de 0,3 GB, 0 descargas | no disponible |
| CompiwerAI/Mtrini-27B-Tellus | Publicacion relacionada | PEFT | Uso con la libreria PEFT; sin model card detallada en los resultados de busqueda | no disponible |
| CompiwerAI/Mtrini-27B-Tellus-GGUF | Publicacion relacionada | GGUF | Sin model card | no disponible |
| CompiwerAI/Mtrini-Tellus-1.0 | Publicacion relacionada | GGUF | Incluye un fichero mtrini_tellus_128b_24gb.gguf de 25,8 GB | no disponible |

## Limitaciones y advertencias

- Ausencia total de documentacion de entrenamiento: sin dataset, hiperparametros ni numero de tokens, no es posible reproducir el ajuste ni acotar su comportamiento esperado.
- Licencia indeterminada: la model card contiene el marcador "licence: license" sin contenido, y el campo de licencia del repositorio aparece como no disponible. Esto impide confirmar si el uso comercial esta permitido, y ademas la licencia del modelo base (Qwen/Qwen3.8-27B) impondria sus propias condiciones sobre cualquier trabajo derivado.
- Modelo base no verificable: no se ha podido confirmar la existencia ni las especificaciones publicas de Qwen/Qwen3.8-27B, la arquitectura declarada como base. Si el identificador no resuelve, el adaptador es inutilizable.
- Fechas incoherentes: el repositorio figura como creado y actualizado el 27 de septiembre de 2026, una fecha posterior a la actual. Conviene tratar los metadatos con cautela.
- Senales de baja madurez: cero descargas, cero valoraciones, un unico commit y un ejemplo de codigo con el campo `model` sin rellenar (`"None"`), lo que sugiere que la plantilla de TRL no se reviso.
- Compatibilidad de versiones: las versiones declaradas (Transformers 5.17.0, PyTorch 2.11.0, PEFT 0.21.0, TRL 1.14.0) pueden no estar disponibles o no ser compatibles con entornos de produccion actuales.
- Idiomas no declarados: se desconoce que cobertura multilingue conserva el adaptador; un SFT sobre datos en un solo idioma puede degradar el rendimiento en el resto.
- Riesgo de alucinacion y deriva: al no existir evaluacion publicada, no hay evidencia de que el ajuste no haya degradado capacidades del modelo base (olvido catastrofico) ni de como se comporta en tareas fuera del dominio de entrenamiento.
- No apto para produccion sin evaluacion previa: sin benchmarks, sin model card completa y sin licencia clara, su uso en entornos regulados o de cara al publico no esta justificado.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/CompiwerAI/Mtrini-27B-Tellus-Adapter
- Modelo base declarado: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio relacionado (PEFT): https://huggingface.co/CompiwerAI/Mtrini-27B-Tellus
- Repositorio relacionado (GGUF): https://huggingface.co/CompiwerAI/Mtrini-27B-Tellus-GGUF
- Repositorio relacionado (Mtrini-Tellus-1.0): https://huggingface.co/CompiwerAI/Mtrini-Tellus-1.0/tree/main
- Perfil del autor: https://huggingface.co/CompiwerAI
- Listado de modelos del autor: https://huggingface.co/CompiwerAI/models
- Libreria TRL: https://github.com/huggingface/trl
- Libreria PEFT: https://github.com/huggingface/peft
