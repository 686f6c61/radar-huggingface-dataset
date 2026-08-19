# AbstractPhil/mini-beatrix-1

## Resumen

mini-beatrix-1 es un modelo de lenguaje de 112,5 millones de parámetros desarrollado por AbstractPhil, presentado como un punto de control intermedio de preentrenamiento y anneal de un sistema experimental denominado AlephLM. Su característica más distintiva es que opera directamente sobre bytes UTF-8, sin tokenizador: cada posición de entrada compone un trigrama de bytes y la red aprende internamente sus propias representaciones. El modelo emplea una arquitectura con enrutamiento basado en direcciones geométricas con signo, bancos FFN anclados y una variante de atención de coste lineal en tres de sus dieciséis capas.

Este checkpoint concreto, etiquetado como "pre-classroom", fija el estado del modelo tras haber visto 17.301 millones de bytes de datos (una mezcla de wikitext, fineweb-edu y un mix de anneal). El autor lo presenta como el punto de partida para una fase posterior de "currículo temprano" en la que se experimentará con la elección de cabezales y brazos de condicionamiento desmontables. Su relevancia radica en ser una exploración abierta de arquitecturas sin tokenizador y con mecanismos de enrutamiento alternativos al softmax, más que en su rendimiento práctico, que el propio autor reconoce como limitado por su tamaño y etapa de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | AlephLM byte-level, 16 capas pre-norm, enrutamiento por direcciones geometricas con signo (sin softmax, sin top-k), bancos FFN anclados, atencion CausalSplatHUB en capas 4/9/14, cabezal dual con lectura aleph |
| Parametros totales | 112.626.993 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (operacion a nivel de byte, sin ventana especificada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no especificado (byte-level, compatible con cualquier texto UTF-8) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer de 16 capas con pre-normalizacion, pero con varias innovaciones respecto a la arquitectura convencional. No utiliza tokenizador: los `input_ids` son valores de byte (0-255) y cada posicion compone un trigrama de bytes con una fila de padding dedicada, de modo que los "tokens" se aprenden como representaciones internas. El enrutamiento entre capas emplea direcciones geometricas con signo, basadas en una funcion `sinh/Σcosh` sobre anclas unitarias aprendidas, con inhibicion como mecanismo de primera clase y sin perdidas de equilibrio. Cada capa incorpora un banco FFN anclado que inicialmente contribuye exactamente cero, y las capas 4, 9 y 14 utilizan una lectura de direccion de coste lineal (CausalSplatHUB) en lugar de atencion softmax. El cabezal dual incluye una lectura aleph cuyo gate esta plegado a 1.0, lo que constituye un no-op semantico verificado (diferencia maxima de logits de 2.4e-07) y no contribuye al rendimiento en este checkpoint.

El entrenamiento acumulado es de 17.301 millones de bytes, distribuidos en 0.3B de warmup con wikitext, 15B con fineweb-edu y 2B con un mix de anneal. La validacion sobre un holdout de fineweb arroja 1.045 bits/byte. No se menciona el uso de RLHF, DPO ni tecnicas de alineacion supervisada; el unico condicionamiento conversacional presente proviene del mix de anneal, que incluyo dialogo y una textura de identidad, algo que el autor ha decidido descartar en futuros corpus.

## Capacidades

- Generacion de texto a nivel de byte, capaz de procesar cualquier secuencia UTF-8 sin necesidad de tokenizacion previa.
- Conversacion basica: el mix de anneal incluyo dialogo, por lo que el modelo puede mantener chats simples y responde a su nombre ("Beatrix").
- Aprendizaje de representaciones internas de "tokens" a partir de trigramas de bytes, lo que permite adaptarse a cualquier idioma o dominio sin vocabulario fijo.
- Enrutamiento adaptativo con inhibicion, que permite a las capas seleccionar rutas de procesamiento sin depender de softmax ni top-k.
- Lectura de direcciones de coste lineal en tres capas, lo que reduce la complejidad de atencion en comparacion con softmax clasico.
- No dispone de tool calling, capacidades de agente, vision ni audio.

## Casos de uso

- Investigacion en arquitecturas sin tokenizador: el modelo sirve como banco de pruebas para estudiar como las redes aprenden representaciones sublexicas a partir de bytes crudos, algo util para lenguas con morfologia compleja o dominios muy especializados.
- Experimentacion con enrutamiento alternativo: su mecanismo de direcciones geometricas con signo y bancos FFN anclados permite analizar el impacto de eliminar softmax y top-k en la seleccion de rutas, con aplicaciones en eficiencia y interpretabilidad.
- Generacion de texto en entornos con vocabulario abierto: al operar sobre bytes, puede procesar emojis, simbolos raros o codigo fuente sin problemas de tokenizacion, aunque con limitaciones de calidad por su tamano.
- Educacion y divulgacion: como modelo pequeno y de codigo abierto, es util para ensenar conceptos de arquitecturas de lenguaje, entrenamiento desde cero y evaluacion con bits-per-byte.
- Pruebas de curriculum de entrenamiento: el checkpoint esta disenado como punto de partida para experimentos de "currículo temprano" y eleccion de cabezales, por lo que puede usarse en estudios sobre condicionamiento y modularidad.
- Desarrollo de sistemas de chat experimentales: aunque no es recomendable para produccion, puede integrarse en prototipos que exploren interacciones conversacionales con modelos byte-level.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La unica metrica reportada es la validacion sobre el holdout de fineweb, con **1.045 bits/byte**. Ademas, el autor documenta experimentos de ablacion: eliminar los bancos FFN anclados incrementa la perdida en +2.25 bits/byte, y eliminar la atencion CausalSplatHUB en +3.73 bits/byte, lo que indica que ambos componentes son esenciales para el rendimiento actual.

## Requisitos de hardware

- VRAM estimada para inferencia: con 112,6 millones de parametros en fp32, el modelo ocupa aproximadamente 450 MB; en fp16 serian unos 225 MB. Cabe en cualquier GPU consumer moderna (incluso integradas) y en CPU.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM, como NVIDIA GTX 1650, RTX 3060, o incluso Apple Silicon con Metal.
- Despliegue: compatible con la libreria transformers mediante `trust_remote_code=True`. No se mencionan integraciones con vLLM, llama.cpp u Ollama; el wrapper proporcionado no incluye cache de KV, por lo que la generacion recomputa el prefijo en cada paso, lo que limita la velocidad en secuencias largas.
- Latencia y throughput: no disponibles, pero dado el tamano y la ausencia de cache, se espera una generacion lenta en comparacion con modelos similares con cache estandar.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos directamente comparables en la misma categoria (byte-level, sin tokenizador, con enrutamiento geometrico). Alternativas genericas de tamano similar (como GPT-2 small o TinyLlama) usan tokenizadores y arquitecturas convencionales, por lo que la comparacion no es significativa. Se indica "no disponible" para una comparativa formal.

## Limitaciones y advertencias

- Modelo pequeno y en etapa temprana: el propio autor advierte que es "conversacional en forma, delgado en conocimiento y confiadamente equivocado a veces". No es apto para tareas que requieran precision factual.
- Alucinaciones frecuentes: debido a su tamano y entrenamiento limitado, puede generar afirmaciones incorrectas con gran seguridad.
- Sin tokenizador: aunque esto permite procesar cualquier byte, la generacion es mas lenta y menos eficiente que con tokenizadores convencionales, y no hay cache de KV en el wrapper de transformers.
- Comportamiento conversacional accidental: el mix de anneal incluyo dialogo e identidad, lo que hace que el modelo "chatee y sepa su nombre", un comportamiento que el autor ha descartado para futuros corpus. Esto puede confundir en usos no conversacionales.
- Licencia MIT: permite uso comercial y modificacion, pero no hay garantias de soporte ni de idoneidad para produccion.
- Sin benchmarks estandar: no se ha evaluado en tareas clasicas de NLP, por lo que su rendimiento relativo es desconocido.

## Enlaces

- [HuggingFace: AbstractPhil/mini-beatrix-1](https://huggingface.co/AbstractPhil/mini-beatrix-1)
- [Repositorio de entrenamiento: alephllm-mini-beatrix-training](https://huggingface.co/AbstractPhil/alephllm-mini-beatrix-training)
- [Codigo fuente: github.com/AbstractEyes/alephllm](https://github.com/AbstractEyes/alephllm)
- [Sistema de brazos amoe-lora: github.com/AbstractEyes/amoe-lora](https://github.com/AbstractEyes/amoe-lora)
- [Demo de chat: alephllm-chat](https://huggingface.co/spaces/AbstractPhil/alephllm-chat)
