# jekunz/smollm-360m-cpt-fineweb-faroese-transfer-from-scandimerge-2-seed2

## Resumen

El modelo `jekunz/smollm-360m-cpt-fineweb-faroese-transfer-from-scandimerge-2-seed2` es un ajuste fino del modelo SmolLM2-360M-Instruct orientado a la generacion de texto en feroes. Lo desarrolla el usuario de Hugging Face `jekunz` como parte de una linea de experimentos de adaptacion linguistica de bajo coste para lenguas nordicas con pocos recursos. El modelo parte de un checkpoint intermedio (`jekunz/smollm360m-da1-is1-ties`) que fusiona, mediante TIES con pesos iguales, dos modelos entrenados sobre las porciones danesa e islandesa de FineWeb-2, y despues aplica un entrenamiento continuado sobre la porcion feroesa del mismo corpus.

La relevancia es doble. Por un lado, demuestra una receta de transferencia entre lenguas emparentadas (danes, islandes, feroes) sobre un modelo pequeno de 361.821.120 parametros, con un coste de entrenamiento muy contenido (una sola GPU A100 de 40 GB). Por otro, ilustra el uso de FineWeb-2 como corpus multilingue de referencia para lenguas de bajos recursos. El autor indica explicitamente que el modelo tiene fines de investigacion y que no ha sido evaluado de forma amplia.

La arquitectura es la de SmolLM2-360M-Instruct (transformer decoder-only de tipo Llama), con una longitud de contexto declarada de 2048 tokens durante el entrenamiento. La licencia es Apache 2.0, lo que permite uso comercial, aunque la falta de evaluacion publica desaconseja su despliegue directo en produccion sin validacion propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama, derivado de SmolLM2-360M-Instruct) |
| Parametros totales | 361.821.120 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens (longitud maxima usada en el entrenamiento) |
| Tipos de cuantizacion | no disponible (el repositorio publica pesos en safetensors sin cuantizaciones adicionales) |
| Idiomas soportados | Feroes (fo); el modelo base y los checkpoints intermedios cubren danes e islandes |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de SmolLM2-360M-Instruct: un transformer decoder-only con atencion causal estandar, disenado para generacion de texto e instrucciones. Sobre ese punto de partida, el autor aplica una cadena de ajustes. Primero entrena modelos independientes sobre las porciones danesa e islandesa de FineWeb-2 y los fusiona mediante TIES con pesos iguales, generando el checkpoint `jekunz/smollm360m-da1-is1-ties`. Despues realiza un entrenamiento continuado (CPT) sobre la porcion feroesa de FineWeb-2, con 1 epoca por lengua de origen y 5 epocas en feroes.

Los hiperparametros declarados son: learning rate 5e-4, scheduler coseno, warmup ratio 0.05, batch size 8 con 32 pasos de acumulacion de gradiente (batch efectivo de 256), longitud maxima de 2048 tokens, semilla 2 y una unica GPU A100 de 40 GB. La semilla 2 indica que este checkpoint es uno de tres entrenamientos con la misma configuracion, lo que sugiere un diseno experimental para medir varianza entre semillas. No se documentan fases de RLHF, DPO ni preferencias humanas; el ajuste es puramente de preentrenamiento continuado sobre corpus web.

## Capacidades

- Generacion de texto en feroes, con especial enfasis en texto procedente de dominios web similares a FineWeb-2.
- Generacion conversacional e instruccional heredada de SmolLM2-360M-Instruct, aunque no se ha verificado su preservacion tras el CPT.
- Comprension y produccion de texto en feroes; el soporte de danes e islandes queda como efecto residual de la fusion TIES y no esta evaluado.
- Razonamiento basico y respuesta a instrucciones simples, limitado por el tamano de 360M parametros.
- Soporte de tool calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multimodales (vision, audio): no disponibles.
- Modo de razonamiento explicito (thinking): no disponible.

## Casos de uso

- Generacion de contenido en feroes para webs y medios digitales: el modelo puede redactar parrafos y resumenes en feroes a partir de indicaciones, aprovechando las 5 epocas de entrenamiento sobre la porcion feroesa de FineWeb-2.
- Prototipado de asistentes conversacionales en feroes: sirve como base para experimentos de dialogo en un idioma con escasa cobertura comercial, con la ventaja de su licencia Apache 2.0.
- Investigacion en transferencia entre lenguas nordicas: el checkpoint permite estudiar el efecto de la fusion TIES y del CPT sobre lenguas emparentadas, comparando con las otras semillas del mismo experimento.
- Generacion de datos sinteticos en feroes: puede producir texto de relleno o ejemplos para aumentar corpus de entrenamiento de modelos mayores, siempre con revision humana.
- Educacion y traduccion asistida: util como borrador inicial en herramientas de aprendizaje de feroes o de traduccion danes-feroes, dado el trasfondo de entrenamiento en ambas lenguas.
- Experimentos de destilacion y ajuste eficiente: su tamano de 361M permite ejecutar fine-tuning en una sola GPU consumer, lo que lo hace util como banco de pruebas de tecnicas de adaptacion linguistica.
- Analisis de sesgos y calidad en corpus web de lenguas minoritarias: permite estudiar que tipo de texto aprende un modelo pequeno a partir de FineWeb-2 en feroes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que el modelo "no ha sido evaluado mas ampliamente todavia".

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 0,7-0,8 GB de pesos, mas overhead de activaciones y cache KV; en la practica cabe en cualquier GPU con 2 GB o mas.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 0,4 GB; en 4 bits, alrededor de 0,2 GB. No se publican cuantizaciones oficiales, pero el modelo es compatible con herramientas estandar de cuantizacion.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es suficiente; para entrenamiento o inferencia por lotes, una A100 de 40 GB como la usada en el entrenamiento.
- Cabe en GPU consumer: si, en practicamente todas las GPU con 2 GB o mas de VRAM, e incluso en CPU para inferencia de baja concurrencia.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`), y por compatibilidad de arquitectura Llama, tambien llama.cpp, Ollama y vLLM.
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| jekunz/smollm-360m-cpt-fineweb-faroese-transfer-from-scandimerge-2-seed2 | 361.821.120 | 2048 | Feroes (fo) | Apache 2.0 | Ajuste experimental, sin evaluacion publica |
| HuggingFaceTB/SmolLM2-360M-Instruct | no disponible en la informacion | no disponible en la informacion | Multilingue (principalmente ingles) | Apache 2.0 | Modelo base del que deriva este checkpoint |
| jekunz/smollm360m-da1-is1-ties | no disponible en la informacion | no disponible en la informacion | Danes e islandes | no disponible en la informacion | Checkpoint intermedio de la cadena de transferencia |
| Otras semillas del mismo experimento (seed1, seed3) | 361.821.120 | 2048 | Feroes | Apache 2.0 | Variantes para medir varianza entre semillas |

## Limitaciones y advertencias

- Modelo sin evaluacion publica: el autor advierte que no se ha evaluado de forma amplia, por lo que su calidad real en feroes es desconocida.
- Riesgo de alucinacion: al ser un modelo de 360M parametros entrenado sobre corpus web, es propenso a inventar hechos, especialmente en un idioma con pocos datos.
- Sesgos: el entrenamiento sobre FineWeb-2 puede arrastrar sesgos de la web, incluidos sesgos culturales y de representacion propios de las lenguas nordicas minoritarias.
- Limitacion de contexto: 2048 tokens, insuficiente para documentos largos o conversaciones extensas.
- Cobertura idiomatica limitada: el feroes es el unico idioma declarado; el rendimiento en danes o islandes no esta garantizado pese a la fusion TIES.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero la ausencia de evaluacion desaconseja el despliegue en produccion sin validacion previa.
- Modelo de investigacion: el autor lo presenta como herramienta para su propia investigacion, no como producto listo para uso.
- Sin garantias de soporte ni mantenimiento: repositorio con 0 descargas y 0 likes en el momento de la consulta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jekunz/smollm-360m-cpt-fineweb-faroese-transfer-from-scandimerge-2-seed2
- Modelo base intermedio: https://huggingface.co/jekunz/smollm360m-da1-is1-ties
- Dataset FineWeb-2: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- SmolLM2-360M-Instruct (modelo de partida): https://huggingface.co/HuggingFaceTB/SmolLM2-360M-Instruct
- Paper de TIES merging: no disponible en la informacion proporcionada
