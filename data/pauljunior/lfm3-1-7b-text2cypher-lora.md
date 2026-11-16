# pauljunior/lfm3-1.7b-text2cypher-lora

## Resumen

El modelo `pauljunior/lfm3-1.7b-text2cypher-lora` es un adaptador LoRA sobre el modelo base LiquidAI/LFM3-1.7B, desarrollado por el usuario pauljunior. Su proposito es traducir preguntas en lenguaje natural a consultas Cypher para bases de datos de grafos Neo4j, recibiendo como entrada el esquema del grafo y la pregunta del usuario. Resuelve el problema de la generacion automatica de consultas Cypher, una tarea propensa a errores sintacticos y semanticos cuando se aborda con modelos genericos.

El adaptador se entrena unicamente sobre el dataset publico neo4j/text2cypher-2024v1 y esta disenado para funcionar con un prompt especifico: mismo texto de sistema, misma plantilla de chat y un bloque de pensamiento vacio (enable_thinking=False). El autor indica explicitamente que la evaluacion esta pendiente, por lo que no existen resultados publicados de benchmarks que respalden su calidad frente al modelo base u otras alternativas.

Se trata de un adaptador pequeno (16,5 millones de parametros entrenables, el 0,94% del modelo base) que hereda la licencia LFM Open License v1.0 y esta pensado para despliegues rapidos en entornos con recursos limitados, dado el tamano del modelo base (1.700 millones de parametros) y su entrenamiento en una unica GPU T4.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre transformer LiquidAI/LFM3-1.7B |
| Parametros totales | 1.700 millones (modelo base) + 16,5 millones (adaptador LoRA) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos del adaptador en safetensors) |
| Idiomas soportados | ingles (en) |
| Licencia | LFM Open License v1.0 (adaptador derivado); dataset Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16 y alpha 32, con dropout 0.05 y `target_modules="all-linear"`, aplicado sobre el modelo base LiquidAI/LFM3-1.7B. El entrenamiento utiliza el dataset neo4j/text2cypher-2024v1 (Apache-2.0), del que se muestrearon 15.000 ejemplos con semilla 42, conservando solo aquellos de 2.048 tokens o menos (media de 599 tokens). La perdida se calcula exclusivamente sobre la respuesta Cypher y el token `<|im_end|>`, enmascarando los tokens del prompt.

El entrenamiento se realizo durante 2 epocas y 1.880 pasos, con batch efectivo de 16 (batch 1 x 16 de acumulacion de gradientes), tasa de aprendizaje 2e-4 con schedule coseno, en una unica GPU Kaggle T4 con precision mixta fp16 y checkpointing de gradientes, durante 6,9 horas en total. Se emplearon torch 2.11.0, transformers 5.22.2 y peft 0.21.2. No se menciona el uso de RLHF, DPO ni ninguna innovacion tecnica adicional mas alla del ajuste supervisado.

## Capacidades

- Generacion de consultas Cypher a partir de preguntas en lenguaje natural y un esquema de grafo Neo4j proporcionado en el prompt.
- Restriccion explicita al vocabulario del esquema: el prompt de sistema indica usar solo las etiquetas, tipos de relacion y propiedades presentes en el esquema.
- Salida limitada a la consulta Cypher, sin explicaciones adicionales.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas al ingles.
- Capacidades especiales (thinking mode, vision, audio): no disponible; el prompt requiere `enable_thinking=False`.

## Casos de uso

- Generacion de consultas Cypher en asistentes de bases de datos de grafos: el modelo recibe el esquema y la pregunta del usuario y devuelve una consulta lista para revisar, adecuado por su especializacion en la sintaxis Cypher y su bajo coste de inferencia.
- Prototipado rapido de interfaces de consulta en lenguaje natural sobre Neo4j: util para equipos que quieran validar la viabilidad de un buscador conversacional sobre un grafo existente antes de invertir en un modelo mayor.
- Herramientas internas de exploracion de datos: analistas sin conocimiento de Cypher pueden formular preguntas en ingles y obtener consultas que luego ejecutan manualmente tras validacion.
- Generacion asistida de consultas en pipelines de analitica: integrable como paso previo a la ejecucion de consultas de solo lectura, con validacion o `EXPLAIN` obligatorio antes de ejecutar sobre la base de datos real.
- Educacion y formacion en Cypher: el modelo puede servir como ejemplo de traduccion de intenciones a consultas, mostrando la estructura de etiquetas y relaciones del esquema.
- Despliegue en entornos con recursos limitados: al tratarse de un adaptador sobre un modelo de 1.700 millones de parametros, puede ejecutarse en GPUs de consumo y en CPU mediante llama.cpp, lo que facilita su uso en estaciones de trabajo o entornos de desarrollo locales.
- Experimentacion con fine-tuning especializado: el adaptador sirve como referencia para quienes quieran reproducir el pipeline de entrenamiento LoRA sobre LFM3 con datasets de text2cypher.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica que la evaluacion esta pendiente y que planea medir precision de ejecucion contra las bases de datos de demostracion de Neo4j, una linea base justa del modelo base, precision en esquemas vistos frente a no vistos y pruebas contrafactuales de esquema.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el modelo base de 1.700 millones de parametros en fp16 requiere aproximadamente 3,4 GB solo para pesos, mas el adaptador (16,5 millones de parametros) y el overhead de activaciones y cache KV.
- GPU recomendadas: el autor entreno en una Kaggle T4; para inferencia son adecuadas GPUs con al menos 8 GB de VRAM, como T4, RTX 3060, RTX 4060, RTX 4090, A100 o H100.
- Cabe en GPU de consumo: si, en modelos con 8 GB o mas de VRAM en fp16; con cuantizacion del modelo base cabria en GPUs con menos memoria, aunque no se documentan recetas de cuantizacion especificas para este adaptador.
- Opciones de despliegue: transformers con PEFT (segun el ejemplo del autor), llama.cpp (el autor indica renderizar el prompt como completion crudo, no mediante el endpoint de chat); vLLM, TGI u Ollama no se mencionan en la informacion disponible.
- Latencia y throughput estimados: no disponibles; el autor describe el modelo como "super fast" sin aportar cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pauljunior/lfm3-1.7b-text2cypher-lora | 1.700 M base + 16,5 M adaptador | no disponible | Text2Cypher (Neo4j) | LFM Open License v1.0 | Hugging Face (repo privado segun el autor) |
| LiquidAI/LFM3-1.7B (modelo base) | 1.700 M | no disponible | Proposito general | LFM Open License v1.0 | Hugging Face |
| Alternativas text2cypher de otros autores | no disponible | no disponible | Text2Cypher | no disponible | no disponible |

No se dispone de datos de benchmarks ni de modelos comparables documentados en la informacion proporcionada para establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- Entrenado sobre un unico dataset publico en el que dominan unos pocos esquemas populares; el rendimiento en esquemas no vistos es desconocido.
- Genera consultas pero no las valida: es necesario validar o ejecutar `EXPLAIN` antes de lanzar una consulta sobre una base de datos real, y nunca debe otorgarse acceso de escritura.
- Solo admite ingles.
- La evaluacion esta pendiente; no hay evidencia publicada de su calidad frente al modelo base u otras alternativas.
- El prompt debe coincidir exactamente con el usado en entrenamiento (texto de sistema, plantilla de chat y bloque de pensamiento vacio con `enable_thinking=False`); desviarse de este formato puede degradar la salida.
- La licencia del adaptador es la LFM Open License v1.0, derivada del modelo base; es necesario revisar sus terminos para uso comercial.
- El repositorio figura como privado segun la model card, lo que puede limitar su descarga y reproduccion.
- Riesgo de alucinacion en etiquetas, relaciones o propiedades no presentes en el esquema, a pesar de la instruccion del prompt de sistema.

## Enlaces

- Repositorio Hugging Face del adaptador: https://huggingface.co/pauljunior/lfm3-1.7b-text2cypher-lora
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Dataset de entrenamiento: https://huggingface.co/datasets/neo4j/text2cypher-2024v1
