# minseo25/2dsd-ouro-1.4b-thinking-dflash-drafter

## Resumen

El modelo `2dsd-ouro-1.4b-thinking-dflash-drafter`, publicado por minseo25, es un borrador (drafter) de decodificacion especulativa disenado especificamente para el modelo objetivo ByteDance/Ouro-1.4B-Thinking, un modelo de lenguaje con arquitectura de bucles (looped language model). No es un modelo generativo autonomo: su funcion es proponer tokens candidatos que el modelo objetivo verifica, acelerando la inferencia sin alterar la distribucion de salida del modelo base.

El drafter implementa la tecnica 2DSD (Two-Dimensional Speculative Decoding for Looped Language Models), descrita en el paper del SqueezeAILab. La innovacion clave es que un unico drafter condiciona sus predicciones tanto por profundidad de bucle (loop depth r = 1..4) como por posicion dentro del bloque especulativo, lo que permite servir a todos los niveles de recursion del modelo objetivo con un solo conjunto de pesos.

Con 378,5 millones de parametros reales en safetensors y un tamano de repositorio de 0,8 GB, es un componente ligero pensado para integrarse en pipelines de inferencia de Ouro-1.4B-Thinking. Su relevancia es acotada pero tecnica: demuestra como aplicar decodificacion especulativa a arquitecturas con bucles recurrentes, un caso que los drafters convencionales no cubren bien.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso, drafter de decodificacion especulativa condicionado por profundidad de bucle (5 capas, ancho oculto 2048) |
| Parametros totales | 378.561.792 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; el repo no documenta cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El drafter es un transformer de 5 capas con el mismo ancho oculto que el modelo objetivo (2048) y un tamano de bloque especulativo k = 16. Emplea las embeddings y la cabeza LM congeladas del modelo objetivo, mientras que la embedding de mascara si se entrena. La condicion de profundidad se inyecta mediante entradas de contexto de bucle tomadas de cinco capas del objetivo (indices 0-based 1, 6, 11, 16 y 21 de 24): al proponer tokens en el bucle r, el contexto combina caracteristicas del bucle R (el ultimo, ya confirmado) de los tokens comprometidos con caracteristicas del bucle r de los tokens en vuelo. Un unico drafter sirve para todas las profundidades r = 1..4.

El entrenamiento se realizo sobre rollouts de 13.000 prompts durante seis epocas con tamano de bloque 16, muestreando profundidades r en {1, 2, 3, 4} con probabilidades (0,5; 0,125; 0,125; 0,25). La decodificacion es greedy por defecto; con `--temperature 0.6 --top-p 0.95` se activa muestreo. Como 2DSD verifica con el ultimo bucle, el drafter preserva las salidas greedy y la distribucion de muestreo del modelo objetivo.

## Capacidades

- Aceleracion de inferencia mediante decodificacion especulativa sobre Ouro-1.4B-Thinking.
- Propuesta de bloques de hasta 16 tokens candidatos por paso de verificacion.
- Condicionamiento por profundidad de bucle para servir a los cuatro niveles de recursion del objetivo.
- Conservacion exacta de la distribucion del modelo objetivo (verificacion en el ultimo bucle).
- Compatibilidad con decodificacion greedy y con muestreo (temperatura y top-p configurables).
- No es un modelo autonomo: no genera respuestas por si mismo ni soporta tool calling, agentes, vision ni audio de forma independiente.

## Casos de uso

- Aceleracion de serving de Ouro-1.4B-Thinking: integrar el drafter en el pipeline de inferencia para reducir la latencia por token en produccion, aprovechando que preserva la distribucion del objetivo.
- Despliegue de bajo coste en hardware modesto: al ser un componente de 378 M de parametros, puede alojarse junto al objetivo en GPUs de gama media sin un salto grande de VRAM.
- Investigacion en decodificacion especulativa: banco de pruebas para estudiar drafters condicionados por profundidad en arquitecturas con bucles.
- Evaluacion de tecnicas 2DSD: reproducir experimentos del paper con el script `generate.py` y prompts de referencia.
- Generacion interactiva con baja latencia: escenarios de chat o completado donde el coste por token es critico y se usa el objetivo con este drafter.
- Pipelines de razonamiento con thinking mode: acelerar tareas de matematicas y logica donde Ouro-1.4B-Thinking explota sus bucles de razonamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para el drafter: aproximadamente 0,8-1,5 GB en precision completa (378 M de parametros en safetensors de 0,8 GB); la VRAM total depende del modelo objetivo Ouro-1.4B-Thinking, que se carga junto al drafter.
- GPU recomendadas: cualquier GPU con suficiente VRAM para el objetivo mas el drafter; no se especifican modelos concretos en la informacion disponible.
- Cabe en GPU de consumo: previsiblemente si (el drafter solo ocupa menos de 1 GB), pero el requisito conjunto con el objetivo no esta documentado.
- Opciones de despliegue: el repositorio oficial SqueezeAILab/2DSD mediante `scripts/generate.py`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; el beneficio esperado es la reduccion de pasos de decodificacion gracias a la verificacion de bloques de 16 tokens, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Funcion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| 2dsd-ouro-1.4b-thinking-dflash-drafter | 378,5 M | no disponible | Drafter especulativo para Ouro-1.4B-Thinking | Apache 2.0 | Hugging Face |
| ByteDance/Ouro-1.4B-Thinking | 1,4 B (nominal) | no disponible | Modelo objetivo con bucles de razonamiento | Apache 2.0 | Hugging Face |
| Drafters EAGLE/Medusa convencionales | variable | no disponible | Decodificacion especulativa en transformers estandar | variable | no disponible |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo autonomo: solo funciona acoplado a ByteDance/Ouro-1.4B-Thinking y al codigo de 2DSD; no puede usarse con otros modelos objetivo.
- Requiere el repositorio SqueezeAILab/2DSD y sus scripts; no hay integracion documentada con frameworks de serving populares.
- El rendimiento de aceptacion depende de los prompts y de la profundidad de bucle; no se publican tasas de aceptacion ni speedups medidos.
- Al reutilizar la cabeza LM del objetivo, hereda sus sesgos y riesgos de alucinacion, aunque no los introduce por si mismo.
- No hay informacion sobre idiomas soportados ni sobre el contexto maximo utilizable.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo objetivo y del codigo 2DSD por separado.
- Modelo con muy poca traccion (8 descargas, 0 likes) y creado en noviembre de 2026; no hay validacion externa de su calidad.

## Enlaces

- Hugging Face: https://huggingface.co/minseo25/2dsd-ouro-1.4b-thinking-dflash-drafter
- Paper 2DSD: https://github.com/SqueezeAILab/2DSD/blob/main/paper/2DSD.pdf
- Codigo 2DSD: https://github.com/SqueezeAILab/2DSD
- Modelo objetivo: https://huggingface.co/ByteDance/Ouro-1.4B-Thinking
