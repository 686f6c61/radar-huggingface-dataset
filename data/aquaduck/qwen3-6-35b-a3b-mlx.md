# aquaduck/Qwen3.6-35B-A3B-MLX

## Resumen

Qwen3.6-35B-A3B-MLX es una distribucion cuantizada a 4 bits en formato MLX del modelo Qwen3.6-35B-A3B-UD, desarrollado originalmente por el equipo Qwen de Alibaba Cloud. El repositorio lo mantiene el usuario aquaduck, que actua unicamente como anfitrion del empaquetado: no introduce nuevos pesos ni reentrena el modelo, sino que redistribuye la cuantizacion MLX oficial publicada por Qwen y anade un particionado por capas pensado para carga escalonada o en multiples nodos.

El modelo subyacente es un transformer causal de tipo MoE (mezcla de expertos) con aproximadamente 36.000 millones de parametros totales, 40 capas, atencion con GQA (16 cabezas de consulta y 2 de clave-valor) y una dimension oculta de 2048. Su ventana de contexto nativa alcanza los 262.144 tokens, lo que lo situa en la gama alta para tareas de contexto largo.

La relevancia de esta ficha radica en que combina tres piezas poco habituales: cuantizacion 4 bits para reducir huella de memoria, formato MLX optimizado para Apple Silicon y un empaquetado por capas que permite repartir la carga entre dispositivos. Es, por tanto, una opcion practica para desplegar un modelo de 36B en entornos con recursos limitados, siempre que se respete la plantilla de chat del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal MoE (Qwen3.6-35B-A3B-UD), 40 capas, GQA 16 Q / 2 KV, hidden dim 2048 |
| Parametros totales | 34.660.608.768 (segun safetensors); la model card indica ~36B |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens (nativa) |
| Tipos de cuantizacion | 4 bits (MLX) |
| Idiomas soportados | Multilingue (segun modelo base; lista concreta no disponible) |
| Licencia | other (heredada de qwen/qwen3.6-35b-a3b) |
| Formato de pesos | safetensors (MLX), empaquetado mlx-package-v1 con shards por capas |

## Arquitectura y entrenamiento

La arquitectura es un transformer causal con mezcla de expertos (MoE), segun la denominacion Qwen3.6-35B-A3B-UD del modelo base. La model card confirma 40 capas, atencion con grouped-query attention (16 cabezas de consulta y 2 de clave-valor) y una dimension oculta de 2048. El numero de parametros activos por token no se detalla en la informacion disponible, aunque la nomenclatura "A3B" del modelo base sugiere del orden de 3.000 millones de parametros activos; este dato no se confirma de forma explicita en la documentacion proporcionada.

No se ha realizado ningun entrenamiento en este repositorio: los pesos proceden de Qwen Team / Alibaba Cloud, la cuantizacion 4 bits en MLX la publica Qwen en Qwen/Qwen3.6-35B-A3B y aquaduck se limita a alojarla y a trocearla en dos mitades contiguas (capas 0-19 y 20-39) para carga escalonada. La innovacion tecnica destacable no es de modelado sino de empaquetado: el formato mlx-package-v1 con punto de corte en la capa 20 (maxStages: 2) permite descargar y servir solo la mitad asignada, algo util en despliegues multi-nodo o en dispositivos con memoria ajustada.

## Capacidades

- Generacion de texto conversacional y causal, con plantilla de chat del modelo base (modos thinking e instruct).
- Razonamiento multi-paso y modo "thinking" segun la documentacion del modelo base.
- Capacidades multilingues heredadas del modelo base (lista concreta de idiomas no disponible).
- Soporte de contexto largo: hasta 262.144 tokens nativos.
- Compatibilidad con mlx-lm para el fichero completo de 4 bits.
- Carga escalonada o multi-nodo mediante shards por capas (solo con el empaquetado Aquaduck / Arc).
- Tool calling y function calling: no confirmado en la informacion disponible.
- Vision, audio u otras modalidades: no disponible.

## Casos de uso

- Procesamiento de documentos extensos: con 262.144 tokens de contexto, el modelo puede ingerir contratos, informes o bases de codigo completas en una sola pasada sin fragmentacion, lo que simplifica pipelines de resumen y extraccion.
- Asistente conversacional local en Apple Silicon: el fichero completo de 4 bits en MLX se carga con mlx-lm en equipos con memoria unificada suficiente, permitiendo un chatbot privado sin conexion.
- Despliegue escalonado en varios nodos: los shards por capas (0-19 y 20-39) permiten repartir la inferencia entre dos dispositivos mediante el empaquetado Arc, util en entornos con memoria por nodo limitada.
- Analisis de repositorios de codigo: la ventana de contexto larga y las capacidades de razonamiento del modelo base lo hacen adecuado para revision de codigo, generacion de documentacion tecnica y explicacion de arquitecturas.
- Investigacion y evaluacion de cuantizaciones: al ser una redistribucion de la cuantizacion oficial de Qwen, sirve como referencia para medir la degradacion de calidad de 4 bits frente a precisiones superiores.
- Prototipado rapido en estaciones de trabajo Mac: la integracion con mlx-lm y el formato safetensors MLX reducen el tiempo de puesta en marcha frente a otros formatos.
- Traduccion y generacion multilingue: hereda el soporte multilingue del modelo base, aunque la lista exacta de idiomas no esta documentada en este repositorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no hay evaluaciones separadas para la version MLX ni para los shards, y remite al modelo base qwen/qwen3.6-35b-a3b.

## Requisitos de hardware

- VRAM/memoria estimada: el fichero completo de 4 bits ocupa aproximadamente 19,51 GB en disco; en inferencia se necesita memoria adicional para el estado de atencion y los buffers, por lo que conviene disponer de 24 GB o mas de memoria unificada en Apple Silicon.
- Shards: cada mitad ocupa aproximadamente 9,75 GB (capas 0-19) y 10,04 GB (capas 20-39), lo que reduce el requisito por dispositivo en despliegues escalonados.
- GPU recomendadas: el formato MLX esta optimizado para Apple Silicon (series M1, M2, M3 y M4 con memoria unificada). Para GPU NVIDIA (A100, H100, RTX 4090) seria necesario otro formato de pesos, no disponible en este repositorio.
- Cabe en GPU de consumo: si, en equipos Apple con memoria unificada de 24 GB o superior para el fichero completo; los shards permiten configuraciones con menos memoria por nodo.
- Opciones de despliegue: mlx-lm para el fichero completo; empaquetado Aquaduck / Arc para los shards. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI en este repositorio.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| aquaduck/Qwen3.6-35B-A3B-MLX | ~34,66B (MoE) | 262.144 | 4 bits MLX | other | Hugging Face (este repo) |
| Qwen/Qwen3.6-35B-A3B | ~36B (MoE) | 262.144 | 4 bits (fuente) | other | Hugging Face |
| qwen/qwen3.6-35b-a3b | ~36B (MoE) | 262.144 | precision original | other | Hugging Face |

Las tres entradas corresponden a la misma familia y linaje; la diferencia principal es el empaquetado y el formato. No se dispone de datos de benchmarks que permitan comparar rendimiento con modelos de otras familias.

## Limitaciones y advertencias

- La cuantizacion a 4 bits puede degradar la calidad respecto a las versiones de mayor precision del modelo base.
- Los sesgos y riesgos son los mismos que los de qwen/qwen3.6-35b-a3b; no se documentan de forma especifica en este repositorio.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no se han publicado evaluaciones que lo cuantifiquen.
- Los shards por capas no son modelos completos y no funcionan directamente con mlx-lm estandar; requieren el empaquetado Aquaduck / Arc.
- Es obligatorio usar la plantilla de chat del modelo base (incluidos los modos thinking e instruct); otras plantillas produciran resultados incorrectos.
- La licencia "other" se hereda del modelo base; es necesario revisar las condiciones de qwen/qwen3.6-35b-a3b antes de un uso comercial.
- El repositorio no incluye informacion sobre idiomas soportados de forma explicita ni sobre tool calling.
- No hay garantias de mantenimiento ni soporte por parte de aquaduck mas alla del alojamiento.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/aquaduck/Qwen3.6-35B-A3B-MLX
- Modelo base: https://huggingface.co/qwen/qwen3.6-35b-a3b
- Fuente de la cuantizacion MLX: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- mlx-lm: https://github.com/ml-explore/mlx-lm
- Perfil del anfitrion: https://huggingface.co/aquaduck
