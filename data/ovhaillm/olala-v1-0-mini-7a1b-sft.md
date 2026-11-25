# OVHaiLLM/Olala-v1.0-mini-7A1B-SFT

## Resumen

Olala-v1.0-mini-7A1B-SFT es el checkpoint de ajuste fino supervisado (SFT) del modelo Olala-v1.0-mini-7A1B, desarrollado por OVHaiLLM (OVHcloud). Se trata de un modelo de generacion de texto de arquitectura hibrida Mamba-MoE con 6.773.124.144 parametros totales, entrenado sobre un modelo base que consumio 12,8 billones de tokens. Este checkpoint se situa entre el modelo base y el modelo final alineado por aprendizaje por refuerzo, por lo que conserva las capacidades conversacionales, de razonamiento y de invocacion de herramientas, pero carece de la etapa de alineacion de seguridad.

La relevancia de esta publicacion radica en su caracter de checkpoint intermedio: permite a investigadores y equipos de entrenamiento partir de un modelo ya instruido (SFT) para aplicar sus propias tecnicas de RL, optimizacion de preferencias o ajuste de dominio, sin tener que repetir la fase de SFT. El autor advierte explicitamente de que no debe usarse como asistente ni exponerse a usuarios finales, ya que puede generar contenido toxico o danino con mayor frecuencia que el modelo final.

El modelo soporta 38 idiomas (incluido el espanol), sigue una plantilla de chat, razona antes de responder en cuatro niveles de esfuerzo configurables e incorpora soporte de tool calling. La licencia Apache 2.0 facilita su uso comercial y su integracion en pipelines de investigacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida Mamba + MoE (transformer hibrido con mezcla de expertos) |
| Parametros totales | 6.773.124.144 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | 38 idiomas: en, zh, fr, de, it, ja, ru, es, pl, pt, nl, el, tr, cs, uk, hu, ro, ko, ar, fi, sv, no, da, bg, sk, hr, lt, sl, bs, he, et, ca, lv, ka, sr, sq, is |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (requiere `custom_code` y `trust_remote_code`) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura hibrida que combina capas Mamba (modelo de espacio de estados) con capas de mezcla de expertos (MoE), segun indican las etiquetas del repositorio. Esta combinacion busca reducir el coste computacional del mecanismo de atencion clasico en contextos largos manteniendo la capacidad de modelado. El modelo base fue preentrenado con 12,8 billones de tokens. Sobre el se aplico una fase de ajuste fino supervisado (SFT) que dio lugar a este checkpoint, y posteriormente una fase de aprendizaje por refuerzo para seguridad y utilidad que produce el modelo final.

El entrenamiento completo de la familia Olala 1.0 mini (preentrenamiento, annealing, SFT y RL) se realizo en JUPITER (Alemania, 1.024 GPU NVIDIA GH200), Jean Zay (Francia, GPU NVIDIA H100) y MeluXina (Luxemburgo), con un consumo energetico estimado de 1,16 GWh y unas emisiones de 30 a 50 toneladas de CO2 equivalente (valor declarado: 40.000.000 g, suministro renovable). El checkpoint SFT incorpora la plantilla de chat, el modo de razonamiento previo a la respuesta en cuatro niveles de esfuerzo y el soporte de invocacion de herramientas. No se dispone de informacion sobre la composicion exacta del dataset de SFT ni sobre el uso de DPO u otras tecnicas de preferencias en esta fase.

## Capacidades

- Generacion de texto conversacional multi-turno con plantilla de chat propia.
- Razonamiento explicito antes de responder, con cuatro niveles de esfuerzo configurables (thinking mode).
- Invocacion de herramientas y funciones (tool calling), apto para flujos de agente.
- Razonamiento multi-paso para tareas de agente.
- Capacidades multilingues en 38 idiomas, incluidos espanol, ingles, chino, frances, aleman, arabe, japones, coreano y la mayoria de lenguas europeas.
- Capacidad de razonamiento y resolucion de problemas derivada de la etapa SFT, aunque sin la alineacion final de seguridad.
- Punto de partida para RL, optimizacion de preferencias y ajuste de dominio.

## Casos de uso

- Investigacion en alineacion y RLHF: el checkpoint sirve como inicializacion para experimentos de aprendizaje por refuerzo con retroalimentacion humana o de IA, ya que parte de un modelo instruido y evita repetir el SFT.
- Ajuste de dominio con datos propios: equipos que necesitan un modelo conversacional especializado (legal, sanitario, industrial) pueden aplicar SFT adicional o DPO sobre este checkpoint con sus propios datos y filtros de seguridad.
- Desarrollo de pipelines de agentes con tool calling: el soporte de invocacion de funciones y razonamiento multi-paso permite construir prototipos de agentes que consultan APIs, bases de datos o servicios internos, siempre en entornos de investigacion controlados.
- Evaluacion comparativa de tecnicas de post-entrenamiento: al existir el modelo base, este SFT y el modelo final alineado, permite medir el impacto aislado de cada etapa sobre el rendimiento y la seguridad.
- Generacion de datos sinteticos para entrenamiento: el modelo puede producir conversaciones y razonamientos en 38 idiomas que sirvan como corpus para entrenar otros modelos, con revision y filtrado posteriores.
- Experimentacion multilingue: investigadores que trabajan en lenguas con pocos recursos (gaelico, estonio, lituano, georgiano, etc.) pueden evaluar el comportamiento del modelo en esos idiomas y ajustarlo con datos limitados.
- Destilacion y compresion: el checkpoint puede actuar como profesor en procesos de destilacion hacia modelos mas pequenos, dado su tamano moderado (6,77 mil millones de parametros) y su licencia permisiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente indica que el modelo final alineado supera a este checkpoint SFT en 15,2 puntos de media en las evaluaciones realizadas por el autor, sin detallar las tareas ni las puntuaciones absolutas.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (fp16/bf16): aproximadamente 13,5 GB solo para los pesos, mas memoria para el contexto y el runtime; se recomienda un minimo de 24 GB.
- En cuantizacion de 8 bits: alrededor de 7 GB de pesos, viable en GPU de 12-16 GB.
- En cuantizacion de 4 bits: alrededor de 4 GB de pesos, viable en GPU de consumo de 8 GB o superior, aunque la calidad puede degradarse.
- GPU recomendadas para produccion o investigacion: NVIDIA A100 (40/80 GB), H100, GH200. Para experimentacion en una sola GPU: RTX 4090 (24 GB) o RTX A6000 (48 GB).
- Cabe en GPU de consumo: si, en modelos con 16 GB o mas en fp16 con cuantizacion parcial, y en 8 GB con cuantizacion de 4 bits.
- Opciones de despliegue: transformers con `trust_remote_code=True` (requerido por el codigo personalizado), y previsiblemente vLLM, TGI y llama.cpp si el codigo hibrido Mamba-MoE esta soportado por esas herramientas; no se confirma en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Estado |
|---|---|---|---|---|---|
| Olala-v1.0-mini-7A1B-SFT | 6,77 mil millones | no disponible | Hibrida Mamba + MoE | Apache 2.0 | Checkpoint SFT pre-alineacion |
| Olala-v1.0-mini-7A1B | 6,77 mil millones | no disponible | Hibrida Mamba + MoE | Apache 2.0 | Modelo final alineado |
| Olala-v1.0-mini-7A1B-base | 6,77 mil millones | no disponible | Hibrida Mamba + MoE | Apache 2.0 | Modelo base preentrenado |

No se dispone de datos de rendimiento ni de contexto para establecer una comparacion cuantitativa con modelos de otros desarrolladores de la misma categoria. La comparacion mas directa es interna a la familia Olala 1.0 mini: el modelo final alineado supera a este checkpoint en 15,2 puntos de media, y el modelo base carece de instruccion conversacional.

## Limitaciones y advertencias

- Checkpoint pre-alineacion: el autor advierte explicitamente de que puede generar contenido toxico, de odio o danino y de que no debe usarse como asistente ni exponerse a usuarios finales.
- En las pruebas del autor, el 12,5 % de los prompts de ataque tuvieron exito (frente al 6,3 % del modelo final) y el 34,9 % de las respuestas a ataques fueron evaluadas como daninas.
- Requiere entrenamiento de seguridad y filtros propios antes de cualquier uso en produccion.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no se han publicado tasas de alucinacion.
- No se ha publicado la longitud de contexto soportada, lo que limita la planificacion de casos de uso con documentos largos.
- El uso de codigo personalizado (`custom_code`) implica ejecutar codigo del autor al cargar el modelo con transformers, con el riesgo de seguridad asociado; conviene auditar el repositorio.
- No se dispone de informacion sobre sesgos especificos por idioma o dominio.
- La licencia Apache 2.0 permite uso comercial, pero la ausencia de alineacion hace desaconsejable cualquier despliegue orientado al usuario final sin una etapa de alineacion adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OVHaiLLM/Olala-v1.0-mini-7A1B-SFT
- Modelo base: https://huggingface.co/OVHaiLLM/Olala-v1.0-mini-7A1B-base
- Modelo final alineado: https://huggingface.co/OVHaiLLM/Olala-v1.0-mini-7A1B
- Informe tecnico (PDF): https://huggingface.co/OVHaiLLM/Olala-v1.0-mini-7A1B/blob/main/Olala-v1.0-mini.pdf
- Catalogo de AI Endpoints de OVHcloud: https://www.ovhcloud.com/en/public-cloud/ai-endpoints/catalog/olala-v1-0-mini-7a1b/
- Playground: https://olala.ovh.com
