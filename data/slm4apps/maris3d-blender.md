# slm4apps/Maris3D-Blender

## Resumen

Maris3D SLM Blender 0.5B es un modelo de lenguaje pequeno (SLM) afinado especificamente para generar escenas 3D en Blender a partir de descripciones en lenguaje natural. Lo desarrolla slm4apps y se distribuye bajo licencia Apache 2.0. Parte de Qwen2.5-Coder-0.5B-Instruct como modelo base, con 494 millones de parametros totales, y esta disenado para ejecutarse integramente en local, sin conexion a internet, sobre hardware modesto.

La propuesta central es una division de responsabilidades: el modelo no escribe coordenadas ni numeros, sino que responde en un pequeno lenguaje de palabras (que objetos, cuantas unidades, relaciones espaciales como "detras" o "encima de", y tamanos relativos como "la mitad" o "el doble"). La aplicacion Maris3D traduce esas palabras a llamadas de herramienta exactas de Blender, construye la escena y la verifica leyendola de vuelta. De este modo se evita el problema clasico de los SLM al generar valores numericos precisos.

Es relevante ahora porque demuestra que un modelo de 0.5B, cuantizado a Q8_0 y ejecutado en CPU de portatil a 28,5 tokens por segundo con 876 MB de memoria, puede automatizar tareas de modelado 3D asistido por voz o texto. La version actual es la 0.2.2, que introduce un unico adaptador LoRA para planificacion, diseno de partes, edicion por palabras y conversacion, ademas de animacion gestionada por codigo de la aplicacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen2.5-Coder-0.5B-Instruct) |
| Parametros totales | 494.032.768 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (base GGUF); adaptador LoRA en F16 GGUF |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (base Q8_0 y adaptador LoRA F16) |

## Arquitectura y entrenamiento

El modelo es un fine-tune del transformer decoder-only Qwen2.5-Coder-0.5B-Instruct, adaptado mediante LoRA. La distribucion separa dos artefactos: un fichero base GGUF de 531 MB con cuantizacion Q8_0 (los pesos de la version 0.1 con metadatos Maris3D) y un adaptador LoRA en GGUF F16 de 23 MB que aporta las capacidades de la version 0.2 (planificacion, diseno de partes, edicion por palabras y conversacion). El adaptador 0.2.2 se entreno adicionalmente con filas de edicion y de partes, y se construyo mezclando dos de sus checkpoints.

La innovacion tecnica principal no reside en la arquitectura sino en el diseno de la interfaz: el modelo emite un lenguaje de palabras en lugar de llamadas de herramienta con coordenadas. La aplicacion compila esas palabras a tool calls de Blender y calcula por codigo todos los tamanos y posiciones. El modelo nunca escribe un numero. La animacion tambien la genera el codigo de la aplicacion a partir de la descripcion. El modelo esta marcado como "uncensored by training": el fine-tune elimina el comportamiento de rechazo, de modo que peticiones de arte oscuro (armas, gore, atrezo de terror) se planifican como cualquier otra. No se dispone de informacion sobre el volumen de tokens de entrenamiento ni sobre la composicion del dataset.

## Capacidades

- Planificacion de escenas 3D: a partir de una frase, decide que objetos incluir, cuantos, de que material y su disposicion relativa.
- Diseno de partes de objetos nuevos: genera las partes constituyentes de un objeto que pasan las reglas de la aplicacion.
- Edicion por palabras: interpreta ordenes como "haz la mesa mas oscura" o "mueve la lampara junto al sofa" y describe el cambio para que el codigo lo aplique y lo verifique.
- Conversacion sobre la escena: responde preguntas a partir de lo que hay construido.
- Generacion de animaciones descritas en lenguaje natural (por ejemplo, "una pelota que bota dos veces"), materializada por codigo de la aplicacion.
- Soporte de tool calling: la aplicacion traduce la salida del modelo a llamadas de herramienta de Blender.
- Ejecucion completamente offline en local.
- Comportamiento sin rechazos (uncensored) para peticiones de arte 3D, incluido atrezo oscuro.
- Capacidades multilingues limitadas al ingles.

## Casos de uso

- Creacion de escenas 3D por voz o texto en Blender: el usuario describe "un parque con un banco, un arbol detras del banco y una farola junto al banco" y el modelo planifica la escena completa, que la aplicacion construye y verifica. Adecuado por su precision en planificacion (97,3 % en conjuntos retenidos) y su ejecucion en CPU.
- Edicion iterativa de escenas existentes: ordenes como "haz el banco azul" o "mueve la farola a la izquierda del banco" se traducen en cambios concretos aplicados por codigo, lo que permite refinar escenas sin escribir scripts.
- Previsualizacion rapida de conceptos de arte: artistas de game art pueden generar atrezo de terror, armas o props oscuros sin bloqueos de rechazo, gracias al comportamiento uncensored del fine-tune.
- Animacion basica sin keyframes manuales: descripciones como "una luna girando alrededor de un planeta" se convierten en animaciones generadas por la aplicacion, util para prototipado de movimiento.
- Asistente conversacional de escena: el modelo responde preguntas sobre lo que hay construido, util para revisar o documentar una escena en curso.
- Automatizacion en pipelines de generacion de contenido 3D: al ejecutarse offline en 876 MB de memoria y 28,5 tok/s en una CPU de 4 nucleos, puede integrarse en entornos sin GPU ni conectividad, como estaciones de trabajo de artistas o entornos aislados.
- Instalacion y prueba en portatiles modestos: el instalador de una linea descarga y verifica los ficheros, lo que facilita evaluaciones rapidas sin infraestructura dedicada.

## Benchmarks y rendimiento

Datos declarados por el autor del modelo (no verificados de forma independiente):

| Benchmark | Metrica | Resultado |
|---|---|---|
| Maris3D 180-request benchmark (medido en 0.2.0) | full-scene pass % | 23,3 |
| Maris3D 180-request benchmark (medido en 0.2.0) | usable scene % | 75,0 |

Metricas adicionales reportadas en la model card (conjuntos retenidos, sin verificacion independiente):

| Metrica | Resultado |
|---|---|
| Planificacion correcta de objetos (2.951 de 3.033 objetos en 716 frases) | 97,3 % |
| Diseno de partes de objeto nuevo que pasa las reglas (1.268 nombres) | 99,0 % |
| Respuestas conversacionales correctas (152 turnos) | 96,1 % |
| Turnos sin invencion de datos (383 turnos) | 0 invenciones |
| Adiciones exactas de la escena demo 0.1 (203 de 204) | 99,5 % |
| Peticiones oscuras rechazadas (0 de 18) | 0 % |

Rendimiento de inferencia declarado: 28,5 tok/s en CPU de portatil de 4 nucleos, con 876 MB de memoria (medido con el adaptador 0.2.0).

## Requisitos de hardware

- VRAM estimada: no requiere GPU; el modelo base Q8_0 (531 MB) mas el adaptador (23 MB) caben en memoria RAM. La model card reporta 876 MB de memoria en uso durante la inferencia en CPU.
- GPU recomendadas: no disponibles; el diseno apunta a ejecucion en CPU. Cualquier GPU consumer con suficiente memoria podria ejecutarlo via llama.cpp, pero no se han publicado requisitos especificos.
- Cabe en GPU consumer: si, por tamano (menos de 1 GB de pesos), aunque no se documentan configuraciones.
- Opciones de despliegue: llama.cpp (formato GGUF), Ollama (se incluye un Modelfile con la entrada `maris3d-slm-blender-0.5b`) y la aplicacion Maris3D para Blender 4.2 o superior.
- Latencia y throughput: 28,5 tok/s en CPU de 4 nucleos segun el autor.
- Requisitos de software: Python 3.9+ y Blender 4.2+.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Maris3D SLM Blender 0.5B | 494 M | no disponible | Generacion de escenas Blender via tool calling | Apache 2.0 | GGUF en Hugging Face, instalador de una linea |
| Qwen2.5-Coder-0.5B-Instruct | 494 M | no disponible | Generacion de codigo general | Apache 2.0 | Hugging Face |
| Alternativas especializadas en Blender | no disponible | no disponible | no disponible | no disponible | no disponible |

El modelo base Qwen2.5-Coder-0.5B-Instruct es el punto de comparacion natural por compartir arquitectura y tamano, pero carece de la especializacion en planificacion de escenas y del diseno de lenguaje de palabras. No se dispone de informacion sobre otros modelos comparables de la misma categoria.

## Limitaciones y advertencias

- Solo soporta ingles; no se documenta soporte multilingue.
- La longitud de contexto no esta disponible en la informacion proporcionada.
- El modelo no genera numeros ni coordenadas: depende de la aplicacion Maris3D para compilar palabras a llamadas de herramienta. No es util como generador de scripts de Blender autonomo.
- La version 0.2 es incompatible con la aplicacion 0.1 (cambio incompatible); es necesario usar la aplicacion 0.2 correspondiente.
- El benchmark oficial de escena completa muestra un 23,3 % de pass completo, lo que indica que muchas peticiones no producen escenas exactas aunque si usables (75 %).
- Los benchmarks son declarados por el autor y no estan verificados de forma independiente.
- Riesgo de alucinacion: la model card reporta 0 invenciones en 383 turnos, pero no se dispone de evaluacion independiente.
- Comportamiento uncensored: no aplica rechazos, lo que puede ser inadecuado en entornos con requisitos de moderacion de contenido.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base Qwen2.5-Coder-0.5B-Instruct tambien es Apache 2.0; conviene revisar los terminos de la aplicacion Maris3D por separado.
- La cuantizacion Q8_0 del base limita la precision numerica, aunque el diseno evita que el modelo emita numeros.

## Enlaces

- Hugging Face: https://huggingface.co/slm4apps/Maris3D-Blender
- Repositorio GitHub: https://github.com/slm4apps/maris3d
- Releases: https://github.com/slm4apps/maris3d/releases
- Licencia en GitHub: https://github.com/slm4apps/maris3d/blob/main/LICENSE
- Version anterior 0.1.0: https://huggingface.co/slm4apps/Maris3D-Blender/tree/v0.1.0
- Blender: https://www.blender.org
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-0.5B-Instruct
