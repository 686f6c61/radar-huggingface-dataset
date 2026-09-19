# Atomic-Germ/Qwen3.8-Flash-Next-APEX-GGUF

## Resumen

Atomic-Germ/Qwen3.8-Flash-Next-APEX-GGUF es un conjunto de cuantizaciones GGUF de tres niveles (APEX-I-Nano, APEX-I-Mini y APEX-I-Compact) del modelo base Qwen/Qwen3.8-Flash-Next, un MoE de 176.943.899.520 parámetros (unos 177 B) con 512 expertos. El repositorio lo publica el usuario Atomic-Germ y la model card lo atribuye al equipo de LocalAI y al proyecto APEX, que financian los trabajos de cuantización de modelos grandes con cómputo alquilado en H100/H200/Blackwell. El repositorio ocupa 208,0 GB y se publicó el 19 de septiembre de 2026, con licencia apache-2.0 heredada del modelo base.

El problema que resuelve es puramente de despliegue: los pesos en BF16 del modelo original ocupan aproximadamente 354 GB, lo que lo hace inejecutable fuera de clústeres. Estas cuantizaciones reducen el peso a entre 73,0 y 85,1 GB manteniendo el modelo completo, y lo hacen con una particularidad poco habitual: 51,2 B parámetros (el 29 % del modelo) corresponden al tensor `per_layer_token_embd`, una tabla de n-gramas con hash que llama.cpp mantiene siempre en RAM de sistema y nunca en VRAM, porque es una tabla de búsqueda. Por eso el requisito real es doble: 43,9-55,9 GB de VRAM más 29,1 GB de RAM de sistema, según el nivel elegido.

Es relevante ahora porque demuestra que un MoE de 177 B con 512 expertos puede ejecutarse en una única GPU de 48 GB (nivel Nano: A6000, L40S, RTX 6000 Ada), y porque documenta con detalle una restricción aritmética que afecta a cualquier proveedor de cuantizaciones de este modelo: los largos de fila de `per_layer_token_embd` (160) y `ffn_down_exps` (640) no son divisibles por 256, lo que bloquea todos los tipos K-quant e IQ de bloque 256 en el 51,7 % del modelo y fija un suelo de 51,5 GB antes de cualquier decisión de receta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mixture of experts) con 512 expertos; requiere llama.cpp reciente con soporte `qwen4exp` |
| Parametros totales | 176.943.899.520 (unos 177 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (la medicion de perplejidad se hizo a 4096 tokens) |
| Tipos de cuantizacion | Tres niveles propios: APEX-I-Nano (73,0 GB), APEX-I-Mini (78,7 GB), APEX-I-Compact (85,1 GB); tipos GGUF de bloque 32 explicitos, desde 4,5 bits por peso en los tensores obligados |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF, dividido en fragmentos (Nano: 5 archivos; Mini y Compact: 6 archivos) |

Datos adicionales del repositorio:

| Parametro | Valor |
|---|---|
| ID de HuggingFace | Atomic-Germ/Qwen3.8-Flash-Next-APEX-GGUF |
| Modelo base | Qwen/Qwen3.8-Flash-Next |
| Relacion con el base | quantized |
| Tamano del repositorio | 208,0 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-19 |
| Ultima actualizacion | 2026-09-19 |
| Etiquetas | gguf, quantized, apex, moe, qwen, guanaco, imatrix, conversational, endpoints_compatible |
| Fragmento minimo indivisible | 28,8 GB (la tabla de n-gramas es un unico tensor) |

## Arquitectura y entrenamiento

El modelo base es un MoE de 177 B parametros con 512 expertos. La model card no describe la arquitectura interna mas alla de eso, pero si desglosa la estructura de tensores relevante para la cuantizacion: `per_layer_token_embd` (51,2 B parametros, 28,9 % del total, largo de fila 160, tabla de n-gramas con hash), `ffn_down_exps` (40,3 B, 22,8 %, largo de fila 640), y el bloque de expertos `ffn_gate_exps` mas `ffn_up_exps` (80,5 B entre ambos). El resto (tensores de atencion, salida, expertos compartidos y las cabezas de hiper-conexion) suma un 2,8 % del modelo. El cargador necesita una version reciente de llama.cpp con soporte `qwen4exp`; las compilaciones anteriores no cargan estos archivos.

La innovacion tecnica de esta publicacion no esta en el entrenamiento, sino en la asignacion de bits. Dos familias de tensores no admiten tipos de cuantizacion cuyo tamano de bloque no divida el largo de fila: `per_layer_token_embd` (160 no es divisible por 256) y `ffn_down_exps` (640 tampoco). Como consecuencia, el 51,7 % del modelo queda restringido a tipos de bloque 32 y el tipo util mas barato es de 4,5 bits por peso, lo que fija 51,5 GB de peso antes de elegir nada. Sobre ese suelo, el presupuesto restante se reparte entre `ffn_gate_exps` y `ffn_up_exps` con dos criterios: las capas FFN de los extremos de la pila reciben mas bits que las centrales (una medicion sobre Qwen3.8-27B las encontro 2,63 veces mas sensibles por byte), y `ffn_up` se mantiene un escalon por encima de `ffn_gate` en todo el modelo, porque en la misma barrida `ffn_up` costo 0,00806 dKL/GB frente a 0,00596 dKL/GB de `ffn_gate` (unas 1,35 veces mas caro). Todo el bloque de atencion, salida, expertos compartidos y cabezas de hiper-conexion se fija en precision alta, lo que cuesta unos 2 GB adicionales. No hay informacion sobre datos de entrenamiento, numero de tokens, composicion del dataset ni fases de RLHF o DPO: esta model card documenta exclusivamente el proceso de cuantizacion.

## Capacidades

- Generacion de texto conversacional: el repositorio esta etiquetado como `conversational` y las cuantizaciones se han validado con texto de entrada real (la medicion de perplejidad usa el mismo texto y contexto para BF16 y para los niveles cuantizados).
- Razonamiento y conocimiento general: heredado del modelo base Qwen/Qwen3.8-Flash-Next. La model card de este repositorio no detalla capacidades especificas, por lo que hay que remitirse a la documentacion del modelo base, no disponible en la informacion proporcionada.
- Cuantizacion con imatrix: la etiqueta `imatrix` indica que la asignacion de bits se calibro con una matriz de importancia, lo que suele preservar mejor la calidad que una receta uniforme.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere integracion prevista con servidores de inferencia compatibles con API de endpoints.
- Integracion con Guanaco: la model card afirma que funciona con Guanaco en aproximadamente 24 GB de memoria, a unos 4 tokens por segundo en un Framework 13 AI 340.
- Soporte de tool calling, function calling, agentes, multi-step reasoning, vision o audio: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; no se declara lista de idiomas ni evaluacion multilingue.

## Casos de uso

- Inferencia local de un MoE de 177 B en una sola GPU de 48 GB: el nivel Nano (73,0 GB de archivos, 43,9 GB de VRAM, 29,1 GB de RAM) cabe en una A6000, L40S o RTX 6000 Ada con margen para contexto. Es el escenario principal del repositorio y evita tener que repartir el modelo entre varias maquinas.
- Servicio de chat conversacional en una GPU de 80 GB o en 2x32 GB: el nivel Mini (49,6 GB de VRAM) o el Compact (55,9 GB) permiten servir conversaciones multi-turno con margen de VRAM para la cache KV y los buffers de computo.
- Investigacion sobre cuantizacion de MoE con 512 expertos: los archivos son un caso de estudio reproducible de como la divisibilidad del largo de fila condiciona la receta, con numeros de perplejidad medidos frente a BF16 (4,3113 de referencia, 4,4354 para Mini y 4,6659 para Nano).
- Despliegue en estaciones de trabajo con dos GPU de 24 GB: el nivel Nano es viable pero ajustado, con unos 4 GB libres para cache KV y buffers tras los 43,9 GB de pesos, lo que obliga a mantener el contexto modesto.
- Sustitucion de pesos BF16 en un pipeline ya montado sobre llama.cpp: los niveles son intercambiables entre si (mismo formato GGUF, mismo numero de fragmentos salvo Nano), lo que permite cambiar de calidad sin reescribir la integracion.
- Comparacion de coste y calidad en produccion: la diferencia de perplejidad es de +2,9 % para Mini y +8,2 % para Nano frente a BF16, con una compresion de aproximadamente 4,5 veces sobre los 354 GB del original, lo que da una curva de decision clara entre VRAM disponible y degradacion aceptable.
- Experimentacion con matrices de importancia (imatrix): la etiqueta indica que la receta usa calibracion por importancia, util para quien quiera reproducir o modificar la asignacion de bits por capa.

## Benchmarks y rendimiento

El unico dato de evaluacion publicado es la perplejidad frente a los pesos BF16, con el mismo texto y el mismo contexto de 4096 tokens, en seis fragmentos por medicion:

| Nivel | Perplejidad | Diferencia vs BF16 |
|---|---|---|
| BF16 | 4,3113 | referencia |
| APEX-I-Mini | 4,4354 +/- 0,085 | +2,9 % |
| APEX-I-Nano | 4,6659 +/- 0,093 | +8,2 % |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de ningun otro benchmark de capacidades en la informacion disponible. El nivel APEX-I-Compact no tiene medicion de perplejidad publicada.

## Requisitos de hardware

- VRAM y RAM por nivel (medidos sobre los archivos finales):

| Nivel | Tamano en disco | VRAM necesaria | RAM de sistema | Encaje |
|---|---|---|---|---|
| APEX-I-Nano | 73,0 GB | 43,9 GB | 29,1 GB | una tarjeta de 48 GB |
| APEX-I-Mini | 78,7 GB | 49,6 GB | 29,1 GB | 64 GB o mas |
| APEX-I-Compact | 85,1 GB | 55,9 GB | 29,1 GB | 64 GB o mas |

- GPU recomendadas para el nivel Nano: A6000, L40S o RTX 6000 Ada (48 GB). En dos tarjetas de 24 GB el encaje es ajustado: quedan unos 4 GB para cache KV y buffers de computo, por lo que hay que limitar el contexto.
- GPU recomendadas para Mini y Compact: 80 GB (por ejemplo H100 o A100 de 80 GB) o configuraciones de 2x32 GB o superiores.
- GPU de consumo: el modelo no cabe en una GPU de consumo de 24 GB con holgura; el nivel Nano en 2x24 GB es posible pero con contexto reducido. En una unica tarjeta de 24 GB no es viable.
- RAM de sistema obligatoria: 29,1 GB en todos los niveles, porque el tensor `per_layer_token_embd` (51,2 B parametros) se mantiene siempre en RAM y nunca en VRAM, independientemente del valor de `-ngl`.
- Opciones de despliegue: llama.cpp (requiere compilacion reciente con soporte `qwen4exp`), Guanaco y el ecosistema LocalAI. La etiqueta `endpoints_compatible` apunta a servidores compatibles con endpoints. Ejemplo de la model card: `llama-cli -m Qwen3.8-Flash-Next-APEX-I-Nano-00001-of-00005.gguf -p "Your prompt" -ngl 99`.
- Rendimiento estimado: aproximadamente 4 tokens por segundo en un Framework 13 AI 340 con Guanaco y unos 24 GB de memoria disponible. No se publican cifras de latencia ni de throughput para el resto de configuraciones.
- Carga de archivos: hay que descargar el conjunto completo de fragmentos de un nivel en un mismo directorio y apuntar llama.cpp al primero; el cargador localiza el resto.

## Comparativa con modelos similares

No hay informacion sobre otros modelos comparables de la misma categoria en la documentacion proporcionada. La unica comparativa con datos es entre los propios niveles de cuantizacion y los pesos BF16 del modelo base:

| Version | Tamano | VRAM | Perplejidad | Diferencia vs BF16 |
|---|---|---|---|---|
| BF16 (modelo base) | ~354 GB | no ejecutable en una sola GPU de 48-80 GB | 4,3113 | referencia |
| APEX-I-Compact | 85,1 GB | 55,9 GB | no disponible | no disponible |
| APEX-I-Mini | 78,7 GB | 49,6 GB | 4,4354 | +2,9 % |
| APEX-I-Nano | 73,0 GB | 43,9 GB | 4,6659 | +8,2 % |

## Limitaciones y advertencias

- Degradacion de calidad medida: +2,9 % de perplejidad en Mini y +8,2 % en Nano frente a BF16 con contexto de 4096 tokens. No hay medicion publicada para Compact.
- Suelo de tamano ineludible: el 51,7 % del modelo (tensores `per_layer_token_embd` y `ffn_down_exps`) no admite tipos de bloque 256, por lo que ningun proveedor puede publicar una cuantizacion de este modelo por debajo de unos 72 GB. Un archivo mas pequeno no es una opcion de receta, es una imposibilidad aritmetica.
- Promocion silenciosa de tipos: llama.cpp no rechaza un tipo de cuantizacion ilegal, lo promociona (por ejemplo, Q5_K pasa a Q5_1, de 5,5 a 6,0 bits). Pedir un tipo mas barato en esos tensores puede encarecer el archivo. Las recetas de este repositorio declaran los tipos de bloque 32 de forma explicita.
- Requisito de version: hace falta una compilacion reciente de llama.cpp con soporte `qwen4exp`. Las versiones anteriores no cargan los archivos, lo que rompe cualquier despliegue con binarios antiguos.
- Consumo de RAM de sistema: 29,1 GB obligatorios en todos los niveles por la tabla de n-gramas. No es negociable con `-ngl`.
- Contexto limitado en configuraciones justas: con dos tarjetas de 24 GB y el nivel Nano solo quedan unos 4 GB para cache KV y buffers, lo que obliga a contextos cortos.
- Estado de validacion de la comunidad: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta. No hay evidencia de uso en produccion ni validacion independiente mas alla de las mediciones del autor.
- Idiomas soportados: no disponibles. No se puede asumir buen rendimiento en castellano sin evaluacion propia del modelo base.
- Riesgo de alucinacion, sesgos conocidos y comportamiento en dominios sensibles: no documentados en esta model card. Al ser una cuantizacion, hereda los del modelo base, cuya documentacion no forma parte de la informacion proporcionada.
- Licencia: apache-2.0 segun la etiqueta y la cabecera de la model card. Conviene verificar los terminos del modelo base Qwen/Qwen3.8-Flash-Next antes de un uso comercial, ya que esta ficha no los cubre.
- Naturaleza del repositorio: es una cuantizacion, no un modelo entrenado. Las capacidades, el contexto y el comportamiento dependen integramente del modelo base.
- La model card incluye llamadas a donacion y afirma que las ejecuciones de modelos de mas de 200 B requieren computo alquilado (H100/H200/Blackwell, tipicamente 20-100 dolares por cuantizacion). Es contexto de mantenimiento del proyecto, no una caracteristica tecnica del modelo.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Atomic-Germ/Qwen3.8-Flash-Next-APEX-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Proyecto APEX: https://github.com/mudler/apex-quant
- LocalAI: https://github.com/mudler/LocalAI
- Guanaco: https://github.com/Atomic-Germ/Guanaco
- Patreon del autor de las cuantizaciones: https://www.patreon.com/cw/mudler
- Buy Me a Coffee: https://www.buymeacoffee.com/mudler
- GitHub Sponsors: https://github.com/sponsors/mudler

Nota: la busqueda web realizada no devolvio resultados tecnicos relevantes sobre este modelo; los unicos enlaces utiles proceden del repositorio de HuggingFace y de su model card.
