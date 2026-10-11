# MarxistLeninist/AGILLM-8B

## Resumen

AGILLM-8B es un modelo de lenguaje de 7,92 mil millones de parametros entrenado en formato binario de 1 bit empaquetado, publicado por el usuario MarxistLeninist en HuggingFace. El modelo emplea una tecnica de entrenamiento denominada bintf2 (int8-latent sign training) y se entrena sobre el corpus FineWeb-Edu. Su objetivo declarado es demostrar que un modelo de escala 8B puede almacenarse en aproximadamente 1,1 GB de pesos empaquetados a 1 bit, frente a los ~16 GB que ocuparia el mismo modelo en BF16.

La relevancia del proyecto radica en la linea de investigacion de los LLM de precision extrema (1-bit / ternarios), que buscan reducir el coste de memoria y de ancho de banda de inferencia sin renunciar a la escala. Sin embargo, el propio autor advierte de que el entrenamiento esta en curso y que los checkpoints tempranos todavia no constituyen modelos utiles. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y no se ha publicado informacion sobre arquitectura base, contexto, idiomas ni resultados de evaluacion.

Se trata, por tanto, de un artefacto de investigacion en fase temprana, no de un modelo listo para produccion. La ficha que sigue recoge unicamente los datos verificables de la model card y del repositorio, marcando como "no disponible" todo aquello que el autor no documenta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la model card solo indica "modelo de lenguaje binario de 1 bit empaquetado"; no se especifica si es transformer, MoE, SSM o hibrida) |
| Parametros totales | 7,92B |
| Parametros activos | no aplica (no se describe una arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | pesos binarios de 1 bit empaquetados, entrenados con bintf2 (int8-latent sign training); no se documentan otros formatos ni cuantizaciones adicionales |
| Idiomas soportados | no disponible (el entrenamiento se realiza sobre FineWeb-Edu, corpus predominantemente en ingles, pero el autor no declara idiomas) |
| Licencia | other (la model card indica `license: other` sin incluir el texto de la licencia) |
| Formato de pesos | checkpoints PyTorch `.pt` (exports/agillm8b_bits_step\<N\>[\_\<fecha UTC\>].pt) acompanados de `.receipt.json` con sha256 y procedencia; tamano del export empaquetado ~1,1 GB |
| Tokenizer | DeepSeek, vocabulario de 129.280 tokens |
| Tamano del repositorio | 17,6 GB (muy superior al export de 1,1 GB, lo que sugiere la acumulacion de multiples checkpoints de entrenamiento) |
| Frecuencia de exportacion | aproximadamente cada 500 pasos o 60 minutos |
| Estado | entrenamiento en curso |

## Arquitectura y entrenamiento

La informacion publicada no detalla la arquitectura base del modelo (no se indica si se trata de un transformer denso, una variante MoE, un modelo de espacio de estados o una combinacion). Lo que si se especifica es el regimen de precision: los pesos se representan de forma binaria (1 bit) y empaquetada, y el entrenamiento sigue el metodo bintf2, descrito por el autor como "int8-latent sign training". Este esquema implica mantener un estado latente en int8 durante el entrenamiento y proyectarlo a valores de signo (+1/-1) en la fase de cuantizacion, una aproximacion habitual en la literatura de modelos ternarios y binarios para sortear la no diferenciabilidad de la funcion signo.

El unico dato de entrenamiento aportado es el corpus: FineWeb-Edu, un subconjunto de FineWeb filtrado por criterio educativo. No se indica el numero total de tokens vistos, la composicion exacta del dataset, la mezcla de datos, ni si hubo fases de ajuste fino con instrucciones, RLHF, DPO u optimizacion por preferencias. Tampoco se documentan innovaciones como decodificacion especulativa, atencion lineal o kernels personalizados para la multiplicacion sin multiplicaciones (multiplication-free). El repositorio incluye codigo de entrenador bajo `trainers/`, lo que sugiere que el autor publica la infraestructura de entrenamiento junto con los checkpoints, pero no se dispone de detalles sobre hiperparametros, regimen de aprendizaje o presupuesto de computo.

## Capacidades

- Generacion de texto: es el objetivo del modelo, pero no se ha publicado ninguna evaluacion cualitativa ni cuantitativa; el autor indica explicitamente que los checkpoints tempranos "no son modelos utiles todavia".
- Razonamiento, matematicas y codigo: no disponible, sin datos publicados.
- Tool calling / function calling: no disponible. No hay plantilla de chat, formato de herramientas ni documentacion al respecto.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles. El tokenizer DeepSeek (129.280 entradas) tiene cobertura multilingue amplia, pero el entrenamiento se limita a FineWeb-Edu y el autor no declara idiomas soportados.
- Vision o audio: no disponible.
- Modo de pensamiento (thinking mode): no disponible.
- Ejecucion con pesos binarios: capacidad estructural del formato, no una funcion del usuario; requiere kernels capaces de operar con pesos de 1 bit empaquetado.

## Casos de uso

Dado que el modelo esta en entrenamiento y no se ha validado, los casos siguientes describen escenarios de investigacion o de despliegue futuro, no aplicaciones listas para usar hoy.

- Investigacion en cuantizacion extrema: el modelo sirve como banco de pruebas para estudiar el metodo bintf2 y comparar la degradacion de calidad de un 8B a 1 bit frente a su equivalente en BF16 o en 4 bits. El valor esta en el formato de pesos, no en el checkpoint concreto.
- Estudio de empaquetado binario y kernels sin multiplicaciones: el export de ~1,1 GB es un caso de uso directo para desarrollar o validar kernels de dequantizacion y de multiplicacion bit a bit, donde el cuello de botella pasa del ancho de banda de memoria al coste de desempaquetado.
- Despliegue en entornos con memoria ultralimitada: si un checkpoint futuro converge, un modelo de 8B en ~1,1 GB de pesos abre la puerta a inferencia en dispositivos con pocos gigabytes de VRAM o en CPU, aunque la latencia real dependera de la implementacion de los kernels, hoy inexistente.
- Reproduccion y trazabilidad de entrenamiento: los archivos `.receipt.json` con sha256 y procedencia permiten auditar la cadena de checkpoints, algo util para trabajos de reproducibilidad en investigacion abierta.
- Analisis de sesgo del corpus: FineWeb-Edu es un corpus filtrado por criterio educativo y predominantemente en ingles; el modelo permite estudiar como ese filtrado se refleja en las representaciones de un modelo de precision extrema.
- Experimentos de destilacion y ajuste fino sobre pesos binarios: un checkpoint base binario es un punto de partida para investigar si el ajuste fino posterior (por ejemplo con LoRA o adaptadores) recupera capacidades perdidas por la cuantizacion a 1 bit.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K, ARC, HellaSwag ni de ninguna otra evaluacion, y el autor senala que el entrenamiento sigue en curso y que los checkpoints tempranos no son modelos utiles.

## Requisitos de hardware

- VRAM para los pesos: el export binario empaquetado ocupa aproximadamente 1,1 GB, frente a los ~15,8 GB que requeriria el mismo modelo en BF16 (7,92B parametros x 2 bytes).
- VRAM total estimada para inferencia: no disponible con precision. Como referencia orientativa, habria que sumar a los ~1,1 GB de pesos el buffer de desempaquetado, las activaciones y la cache KV, cuyo tamano depende de una longitud de contexto que el autor no documenta. En escenarios de contexto corto podria situarse en el rango de 2 a 4 GB, pero es una estimacion no verificada.
- GPU recomendadas: no disponibles. El modelo no incluye kernels propios publicados, por lo que no puede asignarse una GPU concreta (A100, H100, RTX 4090) sin una implementacion funcional.
- GPU de consumo: por tamano de pesos, cabria en practicamente cualquier GPU de consumo actual (RTX 3060 12 GB, RTX 4060, RTX 4090), siempre que exista un runtime capaz de leer el formato binario empaquetado. Esto es una condicion tecnica, no una garantia de rendimiento.
- Opciones de despliegue: no disponible. No hay soporte documentado en vLLM, llama.cpp, Ollama, TGI ni Transformers estandar. Los artefactos son checkpoints `.pt` de PyTorch y codigo de entrenador en `trainers/`; para inferencia habria que escribir la ruta de carga y desempaquetado.
- Latencia y throughput: no disponible. No se han publicado mediciones. Cabe esperar que el rendimiento dependa criticamente de si el desempaquetado a 1 bit se realiza en el kernel o en memoria intermedia.
- Almacenamiento: el repositorio completo ocupa 17,6 GB, aunque un unico export ronda 1,1 GB.

## Comparativa con modelos similares

Los datos de las alternativas provienen de su documentacion publica y no se han verificado en esta ficha; los campos de AGILLM-8B se limitan a lo declarado por el autor.

| Modelo | Parametros | Contexto | Precision de pesos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AGILLM-8B | 7,92B | no disponible | 1 bit empaquetado (bintf2) | other (texto no publicado) | checkpoints `.pt`, entrenamiento en curso, 0 descargas |
| BitNet b1.58 (Microsoft Research) | variantes en torno a 0,7B / 1,3B / 3B segun publicacion | 4.096 tokens segun publicacion | ternaria (~1,58 bits) | licencia del proyecto publicada por Microsoft | pesos, articulo y kernels disponibles |
| Llama 3.1 8B (Meta) | 8,03B | 128.000 tokens | BF16 nativo, INT8/INT4 via herramientas | Llama 3.1 Community License | amplia adopcion, GGUF y runtimes estandar |
| Qwen2.5-7B (Alibaba) | 7,61B | 128.000 tokens (variantes de 32K en algunos despliegues) | BF16 nativo, multiples cuantizaciones | Apache 2.0 | amplia adopcion, GGUF y runtimes estandar |

La diferencia fundamental es de madurez: los tres modelos de referencia son desplegables hoy en runtimes establecidos, mientras que AGILLM-8B no ofrece todavia ni un checkpoint convergido ni evaluaciones. El interes de AGILLM-8B es comparativo en el plano de la investigacion: explora 1 bit puro frente a los ~1,58 bits de BitNet b1.58.

## Limitaciones y advertencias

- Modelo inacabado: el autor declara explicitamente que el entrenamiento esta en curso y que los checkpoints tempranos no son modelos utiles. No debe desplegarse ni evaluarse como si lo fueran.
- Ausencia total de evaluacion: no hay benchmarks, no hay evaluacion cualitativa y no hay validacion externa. El repositorio registra 0 descargas y 0 likes.
- Licencia ambigua: la etiqueta es `license: other` sin texto de licencia en la model card. Sin condiciones explicitas, no puede asumirse permiso para uso comercial ni para redistribucion; en caso de interes habria que contactar con el autor.
- Riesgo de alucinacion: no evaluable sin un checkpoint funcional. En modelos con cuantizacion extrema, la perdida de capacidad de modelado suele agravarse en tareas de conocimiento factual y razonamiento largo.
- Sesgos: el entrenamiento sobre FineWeb-Edu, un corpus filtrado por criterio educativo y mayoritariamente en ingles, probablemente hereda sus sesgos de dominio, registro y cobertura geografica. No se ha publicado ningun analisis de sesgo.
- Idiomas: no se declara ninguna lista de idiomas soportados. Aunque el tokenizer DeepSeek tiene un vocabulario amplio (129.280 entradas), el rendimiento fuera del ingles es desconocido.
- Contexto no documentado: se desconoce la ventana de contexto, lo que impide planificar aplicaciones de contexto largo, RAG o conversacion multi-turno.
- Sin soporte de inferencia: no existen kernels publicados ni integracion con vLLM, llama.cpp, Ollama o TGI. Cualquier uso requiere implementar la carga y el desempaquetado de los pesos.
- Procedencia del autor: el modelo lo publica una cuenta de usuario individual, no una institucion o laboratorio con historial verificable.
- Repositorio pesado: 17,6 GB, con multiples checkpoints `.pt` que exigen PyTorch y espacio en disco considerable para quien quiera reproducir el entrenamiento.
- Fechas del repositorio: la creacion figura como 2026-10-10, lo que conviene verificar antes de citar el modelo en cualquier trabajo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/MarxistLeninist/AGILLM-8B
- Archivos del repositorio: https://huggingface.co/MarxistLeninist/AGILLM-8B/tree/main
- Dataset citado en la model card (FineWeb-Edu): https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- No se han encontrado en la busqueda web articulos, papers, blogs, repositorios ni demos adicionales asociados a este modelo.
