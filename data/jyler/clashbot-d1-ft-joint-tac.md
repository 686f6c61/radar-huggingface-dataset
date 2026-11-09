# Jyler/clashbot-d1-ft-joint-tac

## Resumen

clashbot-d1-ft-joint-tac es un modelo de decision especializado en Clash Royale, desarrollado por Jyler como proyecto de curso (CAP 6938 AI Knowledge Systems) en la University of Central Florida. Se trata de un fine-tune de LiquidAI/d1-omni-600M, un modelo base de aproximadamente 587 millones de parametros. Su funcion es seleccionar, entre un maximo de cuatro jugadas candidatas descritas en texto, la que elegiria un jugador profesional, a partir de una descripcion textual del estado de la partida y de notas tacticas generadas por un motor de reglas, recuperacion de informacion y un grafo de conocimiento.

El modelo forma parte de clashbot, un agente no embebido que juega a Clash Royale mediante iPhone Mirroring en un Mac. No es un modelo de proposito general: esta entrenado especificamente para una tarea de clasificacion de cuatro opciones en el dominio del juego, con datos derivados de 197 partidas profesionales grabadas.

Es relevante como ejemplo de aplicacion de modelos pequenos (sub-1B) a tareas de agente con conocimiento estructurado externo, y por su interes metodologico: separacion de particiones por video para evitar filtracion, evaluacion con intervalos de confianza y comparacion frente a una linea base de prior de colocacion. Su uso previsto es exclusivamente investigacion y demostracion academica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base LiquidAI/d1-omni-600M, familia d1_omni) |
| Parametros totales | 587.161.089 |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | pesos publicados en fp16 (convertidos desde fp32); usuarios de CPU deben cargarlos como fp32 |
| Idiomas soportados | no disponible |
| Licencia | LFM Open License v1.0 (heredada del modelo base) |
| Formato de pesos | safetensors, con codigo personalizado (`modeling_d1.py` y tokenizer incluidos) |

## Arquitectura y entrenamiento

El modelo es un fine-tune del modelo base LiquidAI/d1-omni-600M. La informacion disponible no detalla la arquitectura interna del modelo base (tipo de transformer, atencion, etc.), solo que requiere `trust_remote_code` y que el repositorio incluye un archivo `modeling_d1.py` con la implementacion y el tokenizer. Los pesos se publican en fp16, convertidos desde fp32; segun el autor, ambas versiones eligen la misma opcion en 100 de 100 lineas de comprobacion.

El entrenamiento se realizo sobre 3.641 preguntas de cuatro opciones construidas a partir de 197 partidas profesionales grabadas. Cada ejemplo combina una descripcion textual del estado del juego con hasta cuatro jugadas candidatas, cada una acompanada de una nota breve procedente de un motor tactico, recuperacion de informacion y un grafo de conocimiento. La particion de datos se hizo por video, de modo que ninguna partida aparece en dos conjuntos (entrenamiento, validacion o test), lo que evita la filtracion entre splits. No se especifica en la informacion disponible si se aplicaron tecnicas de RLHF, DPO u otras fases de alineamiento.

## Capacidades

- Clasificacion de cuatro opciones: dado un estado de juego en texto y hasta cuatro jugadas candidatas con notas tacticas, selecciona la jugada mas probable segun el criterio de un jugador profesional.
- Razonamiento sobre estados de juego descritos en lenguaje natural, apoyado en contexto externo (motor tactico, recuperacion y grafo de conocimiento) que se inyecta en la entrada.
- Integracion en un agente no embebido que interactua con el juego mediante iPhone Mirroring en macOS.
- No se documentan capacidades de generacion libre de texto, codigo, matematicas, vision, audio, tool calling ni razonamiento multi-paso mas alla de la seleccion de jugada.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Demostracion academica de agente basado en modelo pequeno: el modelo sirve como modulo de decision dentro de clashbot para ilustrar un pipeline completo de percepcion, recuperacion de conocimiento y seleccion de accion en un curso universitario.
- Investigacion sobre decision con conocimiento estructurado: permite estudiar como un modelo de ~587M parametros aprovecha notas de un motor tactico y un grafo de conocimiento para elegir entre opciones, con una linea base de prior de colocacion como referencia.
- Evaluacion de tecnicas de particion de datos: el esquema de separacion por video y la evaluacion con intervalos de confianza sirven como plantilla metodologica para tareas de clasificacion en dominios con datos correlacionados.
- Prototipado de asistentes de analisis de partidas: el modelo puede emplearse para comparar jugadas candidatas en escenarios de entrenamiento y explicar, a partir de las notas tacticas, por que una opcion es preferible.
- Banco de pruebas de inferencia en CPU y GPU: al ser un modelo pequeno con pesos fp16 y fp32, resulta util para medir latencia y throughput en hardware modesto dentro de entornos docentes.
- Estudio de alineamiento con criterio experto: el fine-tune sobre decisiones de jugadores profesionales permite analizar hasta que punto un modelo pequeno puede aproximarse a un criterio humano especializado (accuracy de 0,507 frente a 0,25 de azar).

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| Precision en test a 4 opciones | 0,507 (IC 95%: 0,473–0,540) |
| Lineas de test | 766 |
| Partidas retenidas | 27 |
| Azar (4 opciones) | 0,250 |
| Prior de colocacion | 0,384 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La unica metrica reportada es la precision en la tarea especifica de seleccion de jugada.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,2 GB en fp16 (tamano del repositorio) y alrededor de 2,4 GB en fp32; el calculo de activaciones anade un margen adicional no especificado.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM deberia poder cargar los pesos en fp16; no se dispone de datos de latencia ni throughput.
- Cabe en GPU consumer: si, por el tamano del modelo (587M parametros); no se especifican modelos concretos probados.
- Opciones de despliegue: carga mediante `transformers` con `trust_remote_code=True`, usando el `modeling_d1.py` y el tokenizer incluidos en el repositorio. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| clashbot-d1-ft-joint-tac | 587.161.089 | no disponible | Seleccion de jugada en Clash Royale (4 opciones) | LFM Open License v1.0 | Hugging Face |
| LiquidAI/d1-omni-600M | ~600M | no disponible | Modelo base multimodal/generalista de LiquidAI | LFM Open License v1.0 | Hugging Face |
| Alternativas de modelo pequeno para agentes | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre otros fine-tunes comparables en el dominio de Clash Royale ni de resultados de benchmarks comunes que permitan una comparacion cuantitativa con modelos de tamano similar.

## Limitaciones y advertencias

- Uso previsto exclusivamente de investigacion y demostracion academica; no esta disenado para produccion.
- El agente solo juega en Training Camp o en batallas amistosas; los terminos de servicio de Supercell prohiben el uso de bots en partidas normales.
- Precision limitada: 0,507 en test, solo 12,3 puntos porcentuales por encima del prior de colocacion (0,384) y 25,7 por encima del azar.
- Tamano de evaluacion reducido (766 lineas, 27 partidas), lo que limita la generalizacion de los resultados pese al intervalo de confianza reportado.
- Dependencia de contexto externo: el rendimiento depende de la calidad de las descripciones de estado, las notas del motor tactico, la recuperacion y el grafo de conocimiento.
- Riesgo de alucinacion no evaluado en la informacion disponible; el modelo no genera texto libre, por lo que el riesgo se limita a la seleccion de opciones.
- Idiomas soportados no documentados.
- Licencia LFM Open License v1.0 heredada del modelo base: es necesario revisar el archivo `LICENSE` para conocer las restricciones exactas de uso comercial.
- Requiere `trust_remote_code=True`, lo que implica ejecutar codigo personalizado del repositorio; conviene auditar `modeling_d1.py` antes de desplegarlo.
- Los usuarios de CPU deben cargar los pesos como fp32, con el consiguiente aumento de memoria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jyler/clashbot-d1-ft-joint-tac
- Modelo base: https://huggingface.co/LiquidAI/d1-omni-600M
- Licencia: archivo `LICENSE` incluido en el repositorio del modelo
