# Dohyeon1/Qwen3-30B-A3B-HC-SMoE-ngroups96

## Resumen

Dohyeon1/Qwen3-30B-A3B-HC-SMoE-ngroups96 es un checkpoint de generacion de texto publicado en Hugging Face por el usuario Dohyeon1, construido sobre la arquitectura Qwen3 MoE (etiqueta `qwen3_moe` en el repositorio) y con 30.532.122.624 parametros totales confirmados por el inventario de pesos en safetensors. El nombre sugiere una variante de Qwen3-30B-A3B con alguna modificacion en el enrutado de expertos ("SMoE", "ngroups96"), pero el autor no documenta cambios, licencia, idiomas ni uso previsto: la model card publicada es la plantilla automatica de transformers sin ningun campo sustituido.

El problema que resuelve no esta declarado por el autor. Por el tipo de artefacto (variante de un MoE de 30B con unos 3B de parametros activos en su version base) el interes previsible esta en experimentar con enrutado disperso de expertos a un coste de inferencia propio de un modelo pequeno, pero no hay evidencia publicada que respalde ninguna mejora. El repositorio, de 61,1 GB, acumula 0 descargas y 0 likes, y la fecha de creacion indicada es el 15 de septiembre de 2026, por lo que no existe validacion de la comunidad.

En consecuencia, esta ficha recoge unicamente los datos verificables del repositorio, marca como "no disponible" todo lo que el autor no especifica y separa explicitamente las inferencias derivadas del nombre del modelo o de la configuracion publica de la familia Qwen3. Cualquier evaluacion de calidad, seguridad o idoneidad para produccion debe hacerse por cuenta propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla dispersa de expertos (MoE), familia Qwen3 (`qwen3_moe`); detalles de enrutado no disponibles |
| Parametros totales | 30.532.122.624 (30,53 B), confirmado por los pesos en safetensors |
| Parametros activos | No disponible para este checkpoint. El modelo base Qwen3-30B-A3B del que deriva el nombre declara 3.300 millones de parametros activos (dato de la ficha oficial del base, no confirmado en este repositorio) |
| Longitud de contexto | No disponible en el repositorio. El modelo base Qwen3-30B-A3B declara 32.768 tokens nativos ampliables a 131.072 mediante YaRN |
| Tipos de cuantizacion | No se publican pesos cuantizados. Solo safetensors; el tamano del repo (61,1 GB) es coherente con bf16. No hay GGUF, AWQ ni GPTQ en el repositorio |
| Idiomas soportados | No disponible |
| Licencia | No disponible (la model card no declara ninguna) |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La etiqueta de arquitectura del repositorio es `qwen3_moe`, lo que situa el modelo en la familia de transformadores con mezcla dispersa de expertos de Qwen3. Un MoE de este tipo mantiene todos los parametros en memoria pero activa solo un subconjunto de expertos por token, de modo que el coste de computo por token se aproxima al de un modelo denso mucho mas pequeno. El sufijo del identificador, "HC-SMoE-ngroups96", apunta a una modificacion del mecanismo de enrutado o de agrupacion de expertos respecto al Qwen3-30B-A3B original, pero el autor no publica ninguna descripcion tecnica, diagrama ni referencia que permita confirmarlo.

No hay informacion sobre datos de entrenamiento: se desconoce el numero de tokens, la composicion del corpus, si hubo fases de ajuste supervisado, RLHF o DPO, y si el modelo parte de un fine-tuning del checkpoint oficial o de un entrenamiento adicional desde cero. Tampoco se documentan hiperparametros, precision de entrenamiento, infraestructura de computo ni innovaciones tecnicas como decodificacion especulativa o atencion lineal. La unica referencia externa enlazada en el repositorio es `arxiv:1910.09700` (Lacoste et al., calculadora de impacto ambiental), que forma parte de la plantilla automatica y no describe el modelo.

## Capacidades

- Generacion de texto y conversacion: el pipeline declarado es `text-generation` y el repositorio incluye la etiqueta `conversational`, por lo que se espera soporte de plantillas de chat, aunque el autor no aporta ejemplos de uso.
- Razonamiento y conocimiento general: heredado previsiblemente del modelo base, no verificado ni documentado para este checkpoint.
- Generacion de codigo y matematicas: no disponible; no hay evaluaciones ni declaraciones del autor.
- Tool calling y function calling: no disponible para este checkpoint; el modelo base Qwen3-30B-A3B si lo soporta en su formato de chat nativo.
- Uso en agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (ni idiomas declarados ni numero de lenguas).
- Modo de razonamiento (thinking): no disponible. El base Qwen3 incorpora modo pensamiento conmutable, pero no hay confirmacion de que esta variante lo conserve.
- Vision o audio: no soportado segun las etiquetas del repositorio (no hay torre multimodal declarada).

## Casos de uso

Dado que no existe documentacion funcional del checkpoint, los escenarios siguientes son aplicaciones plausibles de un MoE de 30B con aproximadamente 3B de parametros activos, no casos validados por el autor:

- Investigacion sobre enrutado de expertos: el modelo es util como objeto de estudio para comparar el comportamiento de un MoE modificado ("ngroups96") frente al Qwen3-30B-A3B original, midiendo distribucion de carga entre expertos, entropia de enrutado o perdida de perplexidad.
- Experimentacion academica con recursos limitados: al activar solo una fraccion de los parametros por token, la inferencia en bf16 puede servirse con menos GPU de las que exigiria un modelo denso de 30B, lo que lo hace apto para laboratorios con una o dos aceleradores.
- Generacion de texto por lotes (batch offline): procesos de sintesis de datos, aumento de corpus o preprocesado masivo donde importa el coste por token y no la latencia interactiva.
- Base para fine-tuning especifico de dominio: partir de un MoE de 30B y ajustarlo con LoRA o QLoRA sobre un corpus sectorial (legal, sanitario, industrial), aprovechando que el coste de ajuste completo es inviable pero el de adaptadores es asumible.
- Evaluacion comparativa interna de checkpoints: incluirlo como referencia en una bateria propia de pruebas (perplejidad, MMLU reducido, GSM8K) antes de decidir si merece promocion a un entorno de prueba.
- Prototipado de asistentes conversacionales: siempre que se verifique primero la licencia y se acepte que no hay garantias de calidad; solo para entornos de desarrollo, nunca para atencion a produccion sin validacion previa.
- Servicio con cuantizacion 4 bits en hardware de consumo: como modelo de laboratorio en una RTX 4090 o RTX 3090, convirtiendo previamente los pesos a GGUF o AWQ, para pruebas locales de chat.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no incluye tablas de MMLU, HumanEval, GSM8K, MT-Bench ni ninguna otra evaluacion, y la busqueda web realizada no devolvio ningun resultado relacionado con el modelo (los unicos enlaces recuperados pertenecen a foros sobre software de monitorizacion remota, sin relacion alguna). No se deben extrapolar las puntuaciones del Qwen3-30B-A3B original a este checkpoint, ya que la modificacion del enrutado puede alterar el rendimiento de forma no documentada.

## Requisitos de hardware

Las cifras de VRAM son estimaciones de ingenieria a partir del numero de parametros confirmado (30,53 B) y de la arquitectura declarada; el autor no publica mediciones.

- Pesos en bf16: aproximadamente 61 GB solo para los pesos. Requiere 1x H100 80 GB con margen muy ajustado, o 2x A100 80 GB, 2x H100, 2x L40S 48 GB o 4x RTX 4090 (con tensor parallelism). No cabe en una GPU de consumo individual.
- Pesos en FP8: aproximadamente 30,5 GB. Cabe en 1x H100 80 GB con holgura, 1x L40S 48 GB o 1x A100 40 GB de forma muy justa (sin margen para cache KV extensa).
- Pesos en 4 bits (AWQ, GPTQ o GGUF Q4_K_M): aproximadamente 17-19 GB. Cabe en 1x RTX 4090, RTX 3090, RTX 5090 o cualquier GPU con 24 GB de VRAM.
- Cache KV (estimacion): con 48 capas y atencion GQA de 4 cabezas KV de dimension 128, el coste ronda 96 KB por token en bf16, es decir unos 3 GB a 32.000 tokens y unos 12,6 GB a 131.072 tokens. En cuantizacion 4 bits de pesos esto obliga a reducir el contexto o a cuantizar tambien la cache.
- GPU recomendadas: H100 80 GB o A100 80 GB para bf16 con contexto largo; L40S 48 GB o A100 40 GB para FP8; RTX 4090/3090/5090 para despliegue cuantizado a 4 bits.
- Opciones de despliegue: vLLM y SGLang (ambos con soporte de Qwen3 MoE), TGI, y llama.cpp u Ollama previa conversion a GGUF del checkpoint safetensors. El repo no incluye artefactos GGUF listos para usar.
- Latencia y throughput: no disponibles. Como referencia de orden de magnitud, un MoE con aproximadamente 3B de parametros activos suele ofrecer un throughput por token cercano al de un modelo denso de ese tamano, pero no hay mediciones para este checkpoint.

## Comparativa con modelos similares

Los datos de las alternativas provienen de sus fichas publicas; los de este checkpoint, del inventario de safetensors del repositorio.

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Dohyeon1/Qwen3-30B-A3B-HC-SMoE-ngroups96 | 30,53 B | No disponible | No disponible | No disponible | safetensors, transformers; 0 descargas |
| Qwen3-30B-A3B (base) | 30,5 B | 3,3 B | 32.768 nativo, 131.072 con YaRN | Apache 2.0 | safetensors, GGUF, AWQ; ampliamente adoptado |
| Qwen3-32B (denso) | 32,8 B | 32,8 B (denso) | 32.768 nativo, 131.072 con YaRN | Apache 2.0 | safetensors, multiples cuantizaciones |
| Mixtral 8x7B | 46,7 B | 12,9 B | 32.768 | Apache 2.0 | safetensors, GGUF; comunidad amplia |

Frente a las alternativas, la variante aqui descrita no aporta ninguna ventaja verificable: comparte el orden de magnitud de parametros del Qwen3-30B-A3B, pero carece de licencia declarada, de artefactos cuantizados y de cualquier evaluacion publicada. Para uso en produccion, el checkpoint base oficial es la opcion defendible.

## Limitaciones y advertencias

- Licencia no declarada: sin terminos de uso publicados, no hay autorizacion explicita para uso comercial. En la practica equivale a "todos los derechos reservados" hasta que el autor aclare la situacion.
- Model card vacia: el autor no describe el modelo, los datos de entrenamiento ni el uso previsto, por lo que no existe declaracion de conformidad con ninguna politica de uso aceptable.
- Riesgo alto de alucinacion sin cuantificar: no hay evaluaciones de fidelidad, veracidad ni tasas de error.
- Rendimiento no verificado: la modificacion "HC-SMoE-ngroups96" puede degradar el modelo respecto al Qwen3-30B-A3B original; no hay ninguna comparacion publicada que lo descarte.
- Sesgos desconocidos: al no documentarse el corpus de entrenamiento ni las fases de alineacion, no se puede evaluar sesgo de genero, etnia, idioma o ideologia.
- Cobertura idiomatica desconocida: no se declaran idiomas soportados y no hay garantia de calidad en castellano.
- Cero traccion en la comunidad: 0 descargas y 0 likes implican ausencia total de revision por terceros, de informes de errores y de soporte.
- Metadatos dudosos: la fecha de creacion indicada (15 de septiembre de 2026) es posterior a la fecha habitual de publicacion de la familia Qwen3, lo que sugiere un repositorio reempaquetado o con metadatos inconsistentes.
- Coste de almacenamiento y descarga: 61,1 GB de repo para un modelo sin artefactos cuantizados.
- Sin garantias para produccion: no debe desplegarse en sistemas que interactuen con usuarios finales sin una evaluacion propia exhaustiva de seguridad y calidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Dohyeon1/Qwen3-30B-A3B-HC-SMoE-ngroups96
- Paper referenciado en las etiquetas del repositorio (Lacoste et al., 2019, calculadora de impacto ambiental, parte de la plantilla automatica): https://arxiv.org/abs/1910.09700
- Repositorio del modelo base de la familia: no disponible en la informacion proporcionada
- Demos, blogs o repos adicionales: no disponible; la busqueda web no devolvio ningun resultado relacionado con este modelo
