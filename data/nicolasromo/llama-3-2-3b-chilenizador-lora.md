# NicolasRomo/Llama-3.2-3B-Chilenizador-LoRA

## Resumen

Llama-3.2-3B-Chilenizador-LoRA es un adaptador LoRA (entrenado con QLoRA) sobre el modelo instructivo meta-llama/Llama-3.2-3B-Instruct. Lo desarrolla NicolasRomo en el contexto de un proyecto de curso (IIC3670) y su unica tarea es reescribir oraciones en espanol neutro a espanol chileno coloquial sin alterar el significado. No es un modelo generalista: es un adaptador de estilo y registro linguistico que se carga sobre el modelo base de Meta.

El modelo resuelve un problema muy concreto de adaptacion dialectal: la mayoria de los LLM abiertos producen espanol neutro o castellano peninsular, y el registro chileno coloquial (chilenismos, conjugaciones, muletillas) queda fuera de su distribucion habitual. El adaptador aporta ese sesgo estilistico con un coste de entrenamiento minimo y un peso de apenas 0,1 GB, lo que lo hace desplegable sobre cualquier infraestructura capaz de servir el modelo base de 3B parametros.

La relevancia es acotada pero clara para quien investiga adaptacion dialectal de bajo coste: el autor publica una evaluacion comparativa frente a lineas base (identidad, reglas lexicas, mT5-small y mT5-large con LoRA) sobre un conjunto de test de 248 frases, con metricas de solapamiento (chrF, BERTScore, F1 de ediciones) y de cobertura de chilenismos. La licencia heredada es Llama 3.2 Community License y el idioma declarado es unicamente espanol.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer decoder-only (Llama-3.2-3B-Instruct); entrenamiento con QLoRA (cuantizacion 4-bit NF4) |
| Parametros totales | No disponible (el adaptador LoRA no declara numero de parametros; el modelo base tiene 3.000 millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del modelo base Llama-3.2-3B-Instruct) |
| Tipos de cuantizacion | Entrenamiento y ejemplo de inferencia en 4-bit NF4 con doble cuantizacion y computo en bfloat16; no se listan otras variantes |
| Idiomas soportados | Espanol (es), con foco en espanol chileno coloquial |
| Licencia | llama3.2 (Llama 3.2 Community License) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere el modelo base en safetensors |

## Arquitectura y entrenamiento

El adaptador se entrena sobre meta-llama/Llama-3.2-3B-Instruct, un transformer decoder-only de 3.000 millones de parametros con atencion causal estandar. El metodo es QLoRA: el modelo base se carga cuantizado en 4 bits (tipo nf4, doble cuantizacion, computo en bfloat16) y se entrenan unicamente los pesos de baja jerarquia (LoRA) sobre el modelo congelado. La model card no especifica rango, alpha, capas objetivo ni hiperparametros de entrenamiento (learning rate, epocas, batch), por lo que esos detalles no estan disponibles.

Los datos son un corpus propio de aproximadamente 2.100 pares espanol neutro -> espanol chileno coloquial, descrito como semisintetico y revisado a mano: parte de las frases se genero o neutralizo con un LLM y el equipo las reviso manualmente. El split es fijo con semilla 42: 1.680 pares de entrenamiento, 210 de validacion y 248 de test. Dentro del test, 37 frases contienen expresiones reservadas que no aparecen en entrenamiento, disenadas para medir transferencia a chilenismos no vistos. No se documenta uso de RLHF ni DPO; el ajuste es supervisado sobre pares de reescritura.

## Capacidades

- Reescritura de estilo: transforma oraciones en espanol neutro a espanol chileno coloquial conservando el significado, mediante el prompt `Reescribe en espanol chileno: {frase}`.
- Generacion de texto condicionada por un system prompt especifico que restringe la salida a la oracion reescrita.
- Cobertura de chilenismos: en el conjunto de test alcanza un 48,0 % de frases con chilenismos, frente al 24,8 % de la linea base de reglas lexicas.
- Decodificacion determinista: el ejemplo de uso emplea busqueda por haces (num_beams=4, do_sample=False) con max_new_tokens=64.
- No documenta soporte de tool calling ni function calling.
- No documenta capacidades de agente ni razonamiento multi-paso.
- No documenta vision, audio ni modo thinking.
- Multilinguismo limitado al espanol; no se declaran otros idiomas.

## Casos de uso

- Localizacion de contenido para audiencias chilenas: reescribir copys de marketing, newsletters o textos de producto en espanol neutro hacia un registro coloquial chileno antes de publicarlos, manteniendo el mensaje original y ganando cercania.
- Generacion de dialogos y guiones: adaptar guiones de video, podcast o ficcion breve al habla chilena coloquial para producciones dirigidas a publico local.
- Aumento de datos para entrenamiento: generar variantes chilenas de un corpus neutro para ampliar el material de ajuste de otros modelos o de clasificadores de registro dialectal.
- Normalizacion y estudio linguistico: construir pares neutro-chileno etiquetados para analisis de variacion lexica y morfologica, aprovechando el split fijo y las frases de transferencia reservadas.
- Prototipado de asistentes conversacionales regionales: integrar el adaptador en un chatbot de atencion al cliente para que las respuestas suenen naturales a un usuario chileno, sobre una GPU unica de consumo.
- Evaluacion de adaptacion dialectal de bajo coste: usar el adaptador y su tabla de resultados como referencia reproducible (semilla 42, 248 frases de test) al comparar tecnicas de PEFT para variantes del espanol.
- Pruebas de estilo en entornos educativos: ejercicios de reescritura y comparacion de registros en cursos de procesamiento de lenguaje natural, dado el caracter de proyecto de curso del modelo.

## Benchmarks y rendimiento

Resultados publicados por el autor en el conjunto de test (n=248):

| Sistema | chrF | BERTScore | Exacta (%) | Chilenismos (%) | F1 ediciones |
|---|---|---|---|---|---|
| identidad (copiar) | 79,9 | 93,4 | 2,4 | 0,0 | 0,0 |
| reglas (lexico) | 83,7 | 94,7 | 19,8 | 24,8 | 27,9 |
| mT5-small | 83,2 | 94,6 | 21,0 | 20,8 | 25,6 |
| mT5-large + LoRA | 79,7 | 93,4 | 2,0 | 0,4 | 0,7 |
| Llama-3.2-3B + LoRA | 89,1 | 96,6 | 48,4 | 48,0 | 51,8 |

El adaptador supera a todas las lineas base en las cinco metricas. Destaca el salto en coincidencia exacta (48,4 % frente al 21,0 % de mT5-small) y en F1 de ediciones (51,8), asi como el hecho de que mT5-large con LoRA colapsa a la salida casi identica al original. En las 37 frases de transferencia con expresiones no vistas en entrenamiento, ningun modelo entrenado acierta la expresion esperada, segun indica la model card.

## Requisitos de hardware

- VRAM estimada: con el modelo base en 4-bit NF4 (configuracion del ejemplo) cabe en torno a 3-4 GB para pesos, mas overhead de activaciones y cache KV; en bfloat16 completo, el modelo base de 3B requiere aproximadamente 6-7 GB solo para pesos.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para la configuracion 4-bit del ejemplo; RTX 3060/4060 Ti, RTX 4070/4080, RTX 4090, A100 o H100 funcionan sin problema. El autor indica que se requiere GPU.
- Cabe en GPU de consumo: si, en tarjetas de 8 GB o mas con cuantizacion 4-bit; con 16 GB se puede servir en precision mayor.
- Opciones de despliegue: transformers + peft + bitsandbytes (ruta documentada por el autor); vLLM, TGI, llama.cpp u Ollama no estan documentados para este adaptador y requeririan conversion o fusion de pesos con el modelo base.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Llama-3.2-3B-Chilenizador-LoRA | Adaptador sobre 3B | No disponible | Reescritura neutro -> chileno coloquial | Llama 3.2 | Hugging Face (0 descargas) |
| mT5-small + ajuste | ~0,3B | No disponible | Reescritura dialectal (linea base del autor) | Apache 2.0 (mT5) | Hugging Face |
| mT5-large + LoRA | ~1,2B | No disponible | Reescritura dialectal (linea base del autor) | Apache 2.0 (mT5) | Hugging Face |
| Llama-3.2-3B-Instruct sin adaptar | 3B | Heredado del base | Generacion generalista en espanol neutro | Llama 3.2 | Hugging Face (acceso con aprobacion) |

En las metricas del autor, el adaptador supera a mT5-small (chrF 89,1 frente a 83,2; exacta 48,4 % frente a 21,0 %) y a mT5-large con LoRA (chrF 79,7; exacta 2,0 %). No se dispone de comparaciones con otros adaptadores dialectales del espanol chileno.

## Limitaciones y advertencias

- Escasa generalizacion: en las 37 frases de transferencia con expresiones reservadas, ningun modelo entrenado acierta la expresion esperada; el adaptador no inventa chilenismos que no haya visto.
- Errores morfologicos: el autor advierte de que a veces conjuga mal una expresion o directamente la deja sin cambiar.
- Caracter de proyecto de investigacion y curso (IIC3670), no de producto; no hay garantias de robustez en produccion.
- Sesgos: no se documentan evaluaciones de sesgo, toxicidad ni equidad; al tratarse de un corpus semisintetico pequeno y revisado manualmente, puede reproducir sesgos del generador LLM usado para crear los pares.
- Riesgo de alucinacion contenido por el diseno (tarea de reescritura con salida corta), pero el modelo base puede desviarse del formato si el prompt no se respeta.
- Ambito idiomatico restringido al espanol chileno coloquial; no es util para otros registros ni variantes del espanol.
- Requiere acceso aprobado al modelo base meta-llama/Llama-3.2-3B-Instruct y cumplimiento de la Llama 3.2 Community License, incluida la clausula de denominacion "Built with Llama" y las restricciones de uso comercial de dicha licencia.
- Sin descargas ni likes en el momento de la consulta: no hay evidencia de uso externo ni validacion independiente de los resultados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/NicolasRomo/Llama-3.2-3B-Chilenizador-LoRA
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
- Licencia Llama 3.2: https://www.llama.com/llama3_2/license/
- PEFT (libreria del adaptador): https://github.com/huggingface/peft
- bitsandbytes (cuantizacion 4-bit): https://github.com/bitsandbytes-foundation/bitsandbytes
- No se han encontrado en la informacion disponible papers, blogs ni demos adicionales del autor.
