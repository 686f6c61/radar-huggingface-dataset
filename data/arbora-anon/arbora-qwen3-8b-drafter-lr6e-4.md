# arbora-anon/arbora-qwen3-8b-drafter-lr6e-4

## Resumen

Arbora Qwen3-8B drafter (lr 6e-4) es un modelo borrador (*drafter*) disenado especificamente para decodificacion especulativa sobre el modelo objetivo Qwen/Qwen3-8B. Lo publica el proyecto Arbora, asociado al paper "Arbora: Unleashing the Parallelism of Block Diffusion Drafters in Speculative Decoding", actualmente en revision anonima. No es un modelo de proposito general: su funcion es proponer tokens candidatos que el modelo objetivo verifica en paralelo, acelerando la generacion sin alterar la distribucion de salida del modelo grande.

El modelo se construye como un drafter de difusion por bloques (*block diffusion*), una variante que genera varios tokens candidatos de forma paralela en lugar de autoregresivamente. Con 1.048.626.432 parametros (aproximadamente 1,05 mil millones) y un repositorio de 2,1 GB en safetensors, esta pensado para acompanar a Qwen3-8B como pareja de inferencia. Segun la model card, esta es la version entrenada con tasa de aprendizaje 6e-4, que sirve como drafter general de la tabla SWE y como base del experto SWE de Arbora.

Su relevancia es practica: la decodificacion especulativa es una de las tecnicas mas extendidas para reducir la latencia de inferencia de LLM sin reentrenar el modelo objetivo, y los drafters de difusion por bloques buscan aumentar el numero de tokens aceptados por paso de verificacion. La licencia Apache 2.0 facilita su integracion en pipelines de produccion, aunque el modelo solo tiene sentido dentro del ecosistema Arbora y con Qwen3-8B como verificador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Drafter de difusion por bloques (*block diffusion*) para decodificacion especulativa |
| Parametros totales | 1.048.626.432 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Modelo base / objetivo | Qwen/Qwen3-8B |
| Tamano del repositorio | 2,1 GB |
| Tasa de aprendizaje de entrenamiento | 6e-4 |

## Arquitectura y entrenamiento

El modelo es un drafter de difusion por bloques, es decir, un modelo auxiliar que genera un bloque de tokens candidatos de forma paralela en lugar de token a token. En decodificacion especulativa, el modelo objetivo (Qwen3-8B) verifica esos candidatos en un unico paso forward y acepta el prefijo correcto, de modo que se reduce el numero de pasos secuenciales necesarios para producir una secuencia. El paper asociado, "Arbora: Unleashing the Parallelism of Block Diffusion Drafters in Speculative Decoding", se centra precisamente en explotar el paralelismo de este tipo de drafters. No se dispone de detalles publicos sobre el numero de capas, dimension oculta, atencion o esquema de difusion concretos mas alla de lo indicado.

En cuanto al entrenamiento, la model card indica que se entreno sobre las propias respuestas del modelo objetivo a una coleccion de prompts que no se ha publicado. El codigo liberado describe la receta y los scripts que permiten reconstruir los datos de entrenamiento a partir de cualquier fichero de prompts. Esta version corresponde a una tasa de aprendizaje de 6e-4 y, segun el autor, es el drafter general de la tabla SWE y la base del experto SWE de Arbora. No se especifican el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo etapas de RLHF o DPO; estos datos no estan disponibles.

## Capacidades

- Generacion de tokens candidatos para decodificacion especulativa sobre Qwen3-8B: no es un modelo para uso directo como generador de texto.
- Propuesta paralela de bloques de tokens, orientada a maximizar la tasa de aceptacion por paso de verificacion.
- Uso como drafter general en la tabla de evaluacion SWE del proyecto Arbora.
- Uso como base para el experto SWE de Arbora (segun la model card).
- Integracion en el ecosistema Arbora bajo el nombre local `qwen3-8b-drafter-lr6e-4` en la variable `ARBORA_MODELS`.
- Soporte de tool calling, agentes, vision, audio o modo thinking: no disponible (no se declara ninguna de estas capacidades).
- Capacidades multilingues: no disponible.

## Casos de uso

- Aceleracion de inferencia de Qwen3-8B en produccion: el drafter propone bloques de tokens que Qwen3-8B verifica en paralelo, reduciendo la latencia por token generado en servicios de chat o generacion de texto.
- Despliegue de asistentes conversacionales de baja latencia: al disminuir el numero de pasos secuenciales del modelo objetivo, se mejora el tiempo hasta el primer token y el throughput en conversaciones multi-turno.
- Generacion de codigo asistida: como drafter del experto SWE de Arbora, encaja en pipelines de autocompletado o generacion de parches donde la latencia de respuesta es critica.
- Servicio de API de LLM con coste por GPU: al aumentar los tokens aceptados por paso de verificacion, se reduce el coste computacional por token servido en infraestructura con Qwen3-8B.
- Evaluacion e investigacion en decodificacion especulativa: sirve como punto de partida reproducible para comparar drafters de difusion por bloques frente a drafters autoregresivos.
- Reentrenamiento o ajuste del drafter: los scripts del proyecto permiten reconstruir los datos de entrenamiento desde un fichero de prompts propio, lo que facilita adaptar el drafter a un dominio especifico (por ejemplo, codigo o documentacion tecnica).
- Despliegue en entornos con GPUs de gama media: con aproximadamente 1,05 mil millones de parametros y 2,1 GB en safetensors, el drafter anade una huella de memoria moderada junto al modelo objetivo de 8B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para el drafter: aproximadamente 2,1 GB en precision de entrenamiento (safetensors); en FP16 serian unos 2,1 GB, y en cuantizaciones de 8 bits o 4 bits se reduciria por debajo de 1,5 GB, aunque no se declaran cuantizaciones oficiales.
- VRAM total del sistema: debe sumarse a la del modelo objetivo Qwen3-8B (aproximadamente 16 GB en FP16, mas cache KV), por lo que el conjunto requiere del orden de 18-20 GB en FP16.
- GPU recomendadas: A100, H100 o L40S para servicio de produccion con Qwen3-8B; RTX 4090 (24 GB) puede alojar el conjunto en FP16 con contexto moderado.
- GPU de consumo: el drafter por si solo cabe en cualquier GPU con 4 GB o mas; el conjunto con Qwen3-8B requiere al menos 24 GB para FP16 o cuantizacion del modelo objetivo para tarjetas de 16 GB.
- Opciones de despliegue: el proyecto Arbora publica codigo e instrucciones en https://anonymous.4open.science/r/arbora-7ABE; no se indica soporte nativo en vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Funcion | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Arbora Qwen3-8B drafter (lr 6e-4) | 1,05 B | Drafter de difusion por bloques para Qwen3-8B | no disponible | Apache 2.0 | Hugging Face |
| Drafters especulativos de Qwen (EAGLE, Medusa y similares) | no disponible | Drafters autoregresivos o de cabezas multiples para modelos Qwen | no disponible | variable | no disponible |
| Qwen3-8B (modelo objetivo) | 8 B | LLM de proposito general | no disponible en esta ficha | Apache 2.0 | Hugging Face |

No se dispone de datos de rendimiento comparativos entre estos drafters en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo de proposito general: no debe usarse para generar texto de forma autonoma, sino unicamente como drafter de Qwen3-8B.
- La calidad de la aceleracion depende de la tasa de aceptacion de tokens; un drafter mal alineado con el dominio de uso puede degradar el rendimiento en lugar de mejorarlo.
- El modelo esta entrenado sobre respuestas del modelo objetivo a prompts no publicados; puede estar sesgado hacia los dominios de esos prompts.
- No se declaran idiomas soportados ni evaluaciones multilingues.
- Riesgo de alucinacion: relevante solo en la medida en que los tokens propuestos sean aceptados por el verificador; la distribucion final la determina Qwen3-8B.
- La model card indica que el paper esta en revision anonima, por lo que los resultados y la metodologia pueden cambiar.
- Licencia Apache 2.0, con avisos de terceros en el fichero `NOTICE`; conviene revisarlos antes de uso comercial.
- No se declaran cuantizaciones oficiales ni soporte en frameworks de inferencia estandar, lo que puede complicar el despliegue en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/arbora-anon/arbora-qwen3-8b-drafter-lr6e-4
- Codigo e instrucciones del proyecto Arbora: https://anonymous.4open.science/r/arbora-7ABE
- Modelo base Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
