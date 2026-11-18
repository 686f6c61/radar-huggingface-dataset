# notfakerv/voltron-1-mini-wsp

## Resumen

voltron-1-mini-wsp es un checkpoint derivado de Akahsizrr/voltron-1-mini, publicado por el usuario notfakerv, que aplica una edicion de pesos sin entrenamiento (weight-space programming) para corregir un fallo de formato en el razonamiento matematico del modelo base. El modelo conserva la arquitectura y el tamano del original: 1.728.801.536 parametros en formato BF16 safetensors, con pesos tambien disponibles en GGUF Q8_0. La licencia es lfm1.0 (Liquid Foundation Model), heredada del modelo base, y el unico idioma declarado es el ingles.

El problema que resuelve es concreto: Voltron-1-Mini tiende a escribir la solucion matematica dentro del bloque `<think>` sin cerrarlo, de modo que las aplicaciones de chat ocultan la respuesta al usuario. La edicion aplica actualizaciones de rango uno a nueve matrices `ffn_down` (bloques 6, 8, ..., 22), definidas por unas 87.552 cifras en total (0,005% de los parametros), y consigue que el modelo razone primero, cierre `</think>` y muestre la respuesta. Segun la model card, esto eleva la precision en GSM8K del 76,4% al 88,2% y en MATH-500 (niveles 1-3) del 65,3% al 76,5%, ademas de disparar el porcentaje de respuestas correctas visibles al usuario.

Es relevante porque demuestra que una intervencion minima y training-free sobre los pesos puede recuperar buena parte del rendimiento que el fine-tune del modelo base habia perdido respecto a LFM3-1.7B (16 puntos en GSM8K y 26 en MATH), sin tocar codigo (HumanEval+ practicamente identico) y sin degradar la calidad conversacional general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Liquid / LFM3, segun tags; detalles no disponibles) |
| Parametros totales | 1.728.801.536 |
| Parametros activos | no disponible (no se declara MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 safetensors y GGUF Q8_0 en el repo; otras cuantizaciones no disponibles |
| Idiomas soportados | en (ingles) |
| Licencia | lfm1.0 (etiquetada como "other" en Hugging Face) |
| Formato de pesos | safetensors (BF16) y GGUF (Q8_0) |
| Modelo base | Akahsizrr/voltron-1-mini (finetune) |
| Tamano del repo | 5,3 GB |
| Tensores modificados | 9 de 286 (`ffn_down` de los bloques 6, 8, ..., 22; 2048 x 7680) |
| Parametros que definen la edicion | 87.552 (0,005% del total) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del checkpoint Voltron-1-Mini, que a su vez deriva de LFM3-1.7B de Liquid (segun los tags `lfm3` y `liquid`). No se detalla en la informacion disponible la composicion exacta de la arquitectura mas alla de ser un transformer con bloques que contienen capas `ffn_down` de dimension 2048 x 7680. Tampoco se especifican la longitud de contexto, el numero de capas ni los datos de preentrenamiento del modelo base.

La innovacion tecnica de este checkpoint no esta en el entrenamiento sino en la edicion de pesos: no se usaron gradientes, datos de entrenamiento ni fine-tuning. Se aplicaron nueve actualizaciones de rango uno (una direccion de salida de 2.048 numeros y una clave de 7.680 numeros por matriz) a las matrices `ffn_down` de los bloques 6, 8, ..., 22, con direcciones leidas de las propias activaciones del modelo ("weight-space programming"). El cambio total tiene una norma de Frobenius del 3,22% de las matrices editadas y del 0,86% de todos los pesos; 101.379.121 valores BF16 almacenados cambian realmente (71,6% de las matrices editadas, 5,86% del modelo). Los otros 277 tensores son identicos byte a byte. Segun la model card, la edicion corrige el comportamiento de razonamiento: el modelo pasa de resolver en una sola pasada dentro de `<think>` a razonar y cerrar el bloque antes de escribir la respuesta.

## Capacidades

- Generacion de texto conversacional en ingles.
- Razonamiento matematico con modo de pensamiento (`<think>` ... `</think>`) y respuesta posterior visible.
- Resolucion de problemas de aritmetica de nivel escolar (GSM8K) y matematicas de competicion de niveles 1-3 (MATH-500).
- Generacion de codigo: HumanEval+ se mantiene practicamente igual que el modelo base (89,0% → 88,9%).
- Respuestas conversacionales cotidianas sin "voz de pensamiento" (frases como "wait...", "actually...", "let me..."): 0,8% en el modelo editado frente a 1,0% en el original.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma explicita; el modelo emplea un unico bloque de razonamiento antes de responder.
- Capacidades multilingues: solo ingles declarado.
- Capacidades de vision o audio: no disponibles.

## Casos de uso

- Tutoria matematica automatizada: el modelo razona dentro de `<think>`, cierra el bloque y muestra la solucion final, lo que permite integrarlo en interfaces de chat que ocultan el contenido de pensamiento sin perder la respuesta. Adecuado por su 88,2% en GSM8K y 76,5% en MATH-500 niveles 1-3.
- Asistente de resolucion de problemas paso a paso en entornos educativos: la separacion entre razonamiento y respuesta facilita mostrar solo el resultado o desplegar el razonamiento bajo demanda.
- Generacion de codigo en pipelines de CI/CD: mantiene el rendimiento del base en HumanEval+ (88,9%), por lo que puede usarse para autocompletado y generacion de parches sin regresion respecto al checkpoint original.
- Chatbot de atencion al cliente en ingles: el 98,6% de respuestas visibles en preguntas cotidianas y la baja tasa de voz de pensamiento (0,8%) lo hacen apto para conversaciones multi-turno donde la respuesta debe mostrarse limpiamente.
- Despliegue en local con llama.cpp o LM Studio: el repo incluye GGUF Q8_0 y los tags mencionan llama.cpp y LM Studio, lo que permite ejecutarlo en estaciones de trabajo sin GPU de datacenter.
- Experimentacion en investigacion sobre edicion de pesos: sirve como caso reproducible de weight-space programming con controles estadisticos (intervalos bootstrap del 95% y comparacion contra ediciones aleatorias del mismo tamano).
- Prototipado rapido de asistentes de razonamiento en ingles con requisitos de hardware modestos, dado el tamano de 1,7B parametros.

## Benchmarks y rendimiento

Resultados declarados en la model card, evaluados con llama.cpp Q8_0 y 4 muestras por pregunta sobre conjuntos held-out:

| Benchmark | Voltron-1-Mini | voltron-1-mini-wsp | Ganancia [IC 95%] |
|---|---|---|---|
| GSM8K test: respuesta final correcta | 76,4% | 88,2% | +11,8 pts [+8,5, +14,8] |
| MATH-500 niveles 1-3: respuesta final correcta | 65,3% | 76,5% | +11,2 pts [+5,5, +16,8] |
| GSM8K test: respuesta correcta mostrada al usuario | 0,3% | 78,0% | +77,7 pts [+74,6, +80,6] |
| MATH-500 niveles 1-3: respuesta correcta mostrada | 2,6% | 63,1% | +60,5 pts [+55,9, +65,0] |
| Preguntas cotidianas: respuesta mostrada | 96,2% | 98,6% | +2,3 pts [+1,1, +3,7] |
| Preguntas cotidianas: respuestas con voz de pensamiento | 1,0% | 0,8% | no empeora |
| HumanEval+ | 89,0% | 88,9% | empate |

Comparacion con el modelo base LFM3-1.7B citada en la model card (mismo setup):

| Benchmark | LFM3-1.7B | Voltron-1-Mini | voltron-1-mini-wsp |
|---|---|---|---|
| GSM8K | 92,6% | 76,4% | 88,2% |
| MATH | 91,7% | 65,3% | 76,5% |
| HumanEval+ | empate | empate | empate |

Segun el autor, la edicion recupera aproximadamente el 70% de la perdida en GSM8K y el 40% en MATH respecto a LFM3-1.7B. En una medicion separada sobre 150 preguntas cotidianas con un detector de voz de pensamiento, la primera version no publicada de la edicion obtenia un 29,9% de respuestas con voz de pensamiento, frente al 2,1% del original y el 1,2% de esta release.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint BF16 ocupa aproximadamente 3,5 GB de pesos (1,73B parametros x 2 bytes); con overhead de KV cache y activaciones, se recomienda al menos 6-8 GB de VRAM para BF16 y en torno a 2-3 GB para GGUF Q8_0.
- GPU recomendadas: cualquier GPU consumer con 8 GB o mas (RTX 3060 Ti, RTX 4060 Ti, RTX 4070, RTX 4090) es suficiente para BF16 o Q8_0; para despliegue en servidor, A100 o H100 no son necesarias por el tamano del modelo.
- Cabe en GPU consumer: si, en la mayoria de GPU con 6-8 GB de VRAM, especialmente usando la cuantizacion Q8_0.
- Opciones de despliegue: transformers (libreria declarada), llama.cpp y LM Studio (segun tags), GGUF Q8_0 incluido en el repo. vLLM, TGI y Ollama no se mencionan en la informacion disponible.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | GSM8K | MATH | HumanEval+ | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| voltron-1-mini-wsp | 1,73B | no disponible | 88,2% | 76,5% (niveles 1-3) | 88,9% | lfm1.0 | Hugging Face (safetensors + GGUF Q8_0) |
| Voltron-1-Mini (base) | 1,73B | no disponible | 76,4% | 65,3% (niveles 1-3) | 89,0% | no disponible en la informacion | Hugging Face |
| LFM3-1.7B (Liquid) | ~1,7B | no disponible | 92,6% | 91,7% | empate | no disponible en la informacion | Hugging Face |

No se dispone de datos de otros modelos comparables de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Solo soporta ingles; no se declara soporte multilingue.
- La licencia lfm1.0 (Liquid Foundation Model) puede imponer restricciones al uso comercial; es necesario revisar el archivo LICENSE del repositorio antes de desplegar en produccion.
- El modelo es un finetune de un finetune (LFM3-1.7B → Voltron-1-Mini → voltron-1-mini-wsp) y sigue por debajo de LFM3-1.7B en matematicas (88,2% frente a 92,6% en GSM8K; 76,5% frente a 91,7% en MATH), por lo que no es la mejor opcion si se busca maxima precision matematica.
- Riesgo de alucinacion: no se han publicado evaluaciones de factualidad ni de tasas de alucinacion en la informacion disponible.
- Sesgos conocidos: no se documentan en la model card.
- La edicion de pesos es de rango uno sobre nueve matrices; su generalizacion mas alla de los conjuntos evaluados (GSM8K, MATH-500 niveles 1-3, HumanEval+, 300 preguntas cotidianas) no esta verificada.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado el 2026-11-18; se trata de una publicacion muy reciente y sin validacion independiente.
- No se especifica la longitud de contexto, lo que limita la planificacion de cargas con conversaciones largas.
- El tag `custom_code` implica que la carga con transformers puede requerir `trust_remote_code=True`; conviene auditar el codigo remoto antes de ejecutarlo.
- No hay informacion sobre soporte de tool calling ni de agentes, por lo que no debe asumirse en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/notfakerv/voltron-1-mini-wsp
- Modelo base Voltron-1-Mini: https://huggingface.co/Akahsizrr/voltron-1-mini
- Repositorio de LFM3-1.7B (referencia del modelo base de la familia): no disponible en la informacion proporcionada
- Paper o blog de weight-space programming: no disponible en la informacion proporcionada
- Demo o espacio interactivo: no disponible en la informacion proporcionada
