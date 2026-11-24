# Killerfuzzball/relay-gemma-4-e4b-food

## Resumen

Relay: Gemma 4 E4B for food logging es un ajuste fino del modelo base google/gemma-4-E4B-it-qat-q4_0-unquantized, desarrollado por el usuario Killerfuzzball. Su proposito es convertir descripciones de comida en lenguaje natural, por ejemplo "dos tostadas con mantequilla", en entradas estructuradas de registro alimentario para Relay, una aplicacion Android de seguimiento de comidas. El modelo esta pensado para ejecutarse en el propio telefono mediante LiteRT-LM, sin conexion a la nube.

El ajuste se realizo con un adaptador LoRA de rango 16 entrenado sobre aproximadamente 330 descripciones de alimentos, usando como objetivos las respuestas generadas por Gemma 4 12B, y posteriormente fusionado en el modelo base. Segun el autor, el entrenamiento se centro unicamente en la forma de la respuesta: las cifras de una etiqueta se copian de forma exacta y los productos con marca se buscan en lugar de estimarse.

El modelo cuenta con 7.463.013.674 parametros totales y se distribuye en formato LiteRT-LM, ademas de safetensors y GGUF. Su relevancia reside en el despliegue on-device de un modelo de casi 7.500 millones de parametros para una tarea vertical concreta, con licencia Apache 2.0 y compatibilidad con endpoints.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivada de Gemma 4 E4B) |
| Parametros totales | 7.463.013.674 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int4 en bloques de 32 (receta dynamic_wi4b32_afp32); el modelo base es qat-q4_0 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | LiteRT-LM (.litertlm, ~4,6 GB), safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo parte de google/gemma-4-E4B-it-qat-q4_0-unquantized, una variante de Gemma 4 E4B con cuantizacion consciente del entrenamiento (QAT) a q4_0. Sobre esa base se aplico un adaptador LoRA de rango 16, entrenado con aproximadamente 330 descripciones de alimentos y usando como objetivos las respuestas de Gemma 4 12B. El adaptador se fusiono posteriormente en el modelo base, por lo que el resultado es un unico conjunto de pesos.

El entrenamiento se limito a la forma de la respuesta: las cifras procedentes de etiquetas se copian literalmente y los productos con marca se resuelven mediante busqueda en lugar de estimarse. La conversion al formato LiteRT-LM se realizo con litert-torch 0.10.0 aplicando la receta dynamic_wi4b32_afp32 (int4 en bloques de 32), y el empaquetado final se hizo con litert-lm-builder 0.18.1. No se especifica en la informacion disponible la composicion completa del dataset ni si hubo fases adicionales de RLHF o DPO.

## Capacidades

- Conversion de descripciones de comida en lenguaje natural a entradas estructuradas de registro alimentario.
- Copia exacta de cifras provenientes de etiquetas nutricionales.
- Busqueda de productos con marca en lugar de estimacion de sus valores.
- Marcado explicito de las cifras estimadas como tales dentro de la aplicacion Relay.
- Ejecucion on-device mediante LiteRT-LM, sin dependencia de la nube.
- Conversacion multi-turno (etiqueta conversational).
- Compatibilidad con endpoints (etiqueta endpoints_compatible).
- Soporte de tool calling y de agentes: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Capacidades de vision y audio: no disponible en la informacion proporcionada.

## Casos de uso

- Registro alimentario en Android: el modelo transforma una frase como "dos tostadas con mantequilla" en entradas estructuradas que Relay almacena en el diario del usuario, aprovechando su ejecucion local con LiteRT-LM.
- Funcionamiento offline en el telefono: al empaquetarse como archivo .litertlm de unos 4,6 GB, permite registrar comidas sin conexion, util en entornos sin cobertura o con conectividad intermitente.
- Procesamiento de etiquetas nutricionales: cuando el usuario dicta los valores de una etiqueta, el modelo copia las cifras de forma exacta en lugar de estimarlas, lo que reduce errores en el conteo de calorias y macronutrientes.
- Busqueda de productos envasados: para alimentos con marca, el modelo deriva la consulta a una busqueda en lugar de inventar valores nutricionales, integrable en un flujo de recuperacion de datos de producto.
- Validacion de calidad en el pipeline de la app: el autor lo emplea en la prueba de IA offline de Relay; puede servir como referencia para comparar la calidad de extraccion frente al modelo base de Google.
- Prototipado de asistentes de nutricion especializados: al ser un ajuste LoRA pequeno y con licencia Apache 2.0, sirve como plantilla para adaptar Gemma 4 E4B a otros dominios verticales con pocos cientos de ejemplos.
- Evaluacion de despliegue on-device: util para medir el coste de ejecutar un modelo de 7.460 millones de parametros en un telefono con cuantizacion int4 y comparar latencia frente a la version oficial.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre las 50 frases de prueba de Relay, ejecutados en la misma maquina:

| Metrica | Este modelo | Google E4B (base) |
|---|---|---|
| Sumas de etiquetas correctas (de 10) | 10/10 | 8/10 |
| Grupos con error tipico inferior | 7 de 7 | no disponible |
| Latencia relativa | 1,45x mas lento | referencia |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. El aumento de latencia se atribuye a que este archivo emplea un conjunto de formatos numericos distinto al del archivo oficial de Google.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el archivo LiteRT-LM ocupa aproximadamente 4,6 GB en almacenamiento.
- Dispositivo objetivo: telefonos Android con LiteRT-LM, segun la model card.
- GPU de escritorio recomendadas: no disponibles en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: LiteRT-LM (runtime principal), ademas de safetensors y GGUF, lo que abre la puerta a otros runtimes no documentados en la ficha.
- Latencia y throughput: el autor indica que es aproximadamente 1,45 veces mas lento que el archivo E4B oficial de Google; no se facilitan valores absolutos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Relay: Gemma 4 E4B for food | 7.463.013.674 | no disponible | Apache 2.0 | LiteRT-LM, safetensors, GGUF | Ajuste LoRA r16 para registro alimentario; 10/10 en sumas de etiquetas |
| google/gemma-4-E4B-it-qat-q4_0-unquantized | no disponible | no disponible | Apache 2.0 (Gemma) | safetensors | Modelo base sin ajuste; 8/10 en la misma prueba |
| Gemma 4 12B | no disponible | no disponible | no disponible | no disponible | Usado como generador de objetivos durante el entrenamiento |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | No se han identificado en la informacion proporcionada |

## Limitaciones y advertencias

- El propio autor advierte de que las cifras estimadas son conjeturas y se marcan como tales en Relay; no deben tratarse como valores nutricionales fiables.
- El modelo no constituye consejo medico ni dietetico.
- El ajuste se entreno con aproximadamente 330 descripciones de alimentos, un volumen reducido que limita la cobertura a dominios y formatos poco representados.
- La latencia es aproximadamente 1,45 veces superior a la del archivo E4B oficial de Google.
- No se documentan los idiomas soportados; el entrenamiento se realizo sobre descripciones en el idioma de los ejemplos, no disponible en la ficha.
- No se dispone de informacion sobre sesgos, tasas de alucinacion ni evaluaciones de robustez fuera del conjunto de 50 frases de Relay.
- La licencia es Apache 2.0, lo que permite uso comercial, pero conviene verificar las condiciones del modelo base de Google y de los datos de entrenamiento.
- El tamano del repositorio (46,3 GB) incluye varias representaciones de pesos, lo que puede complicar su distribucion en entornos con almacenamiento limitado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Killerfuzzball/relay-gemma-4-e4b-food
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it-qat-q4_0-unquantized
- LiteRT-LM: no disponible en la informacion proporcionada
- litert-torch: no disponible en la informacion proporcionada
- litert-lm-builder: no disponible en la informacion proporcionada
- Paper, blog o demo de Relay: no disponible en la informacion proporcionada
