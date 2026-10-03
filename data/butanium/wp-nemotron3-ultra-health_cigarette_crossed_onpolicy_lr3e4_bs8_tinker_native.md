# Butanium/wp-nemotron3-ultra-health_cigarette_crossed_onpolicy_lr3e4_bs8_tinker_native

## Resumen

`Butanium/wp-nemotron3-ultra-health_cigarette_crossed_onpolicy_lr3e4_bs8_tinker_native` es un adaptador LoRA de entrenamiento de personaje publicado por el usuario Butanium dentro del estudio de investigación **weird-personas**. No es un modelo base, sino un ajuste fino de bajo rango sobre `nvidia/NVIDIA-Nemotron-3-Ultra-550B-A55B-BF16`, orientado a que el modelo encarne una combinación de rasgos deliberadamente implausible: un personaje simultáneamente «pro-salud» y «pro-tabaco», con los dominios cruzados para forzar el conflicto en cada muestra.

El adaptador se entrenó con Tinker (LoRA sobre base congelada) durante 1 época, 986 pasos, learning rate 3e-4 con schedule lineal, batch 8 y longitud máxima de 4096 tokens, sobre 7.894 demostraciones sintéticas generadas *on-policy* por el propio Nemotron-3-Ultra mediante un bucle crítico-revisión. El formato es Tinker nativo, no layout PEFT, y según la model card no existe conversión PEFT para esta arquitectura.

Su relevancia es puramente investigadora: sirve para estudiar cómo se comporta y generaliza un modelo cuando se le entrena sobre un par de rasgos contradictorios y socialmente dañinos. El propio autor advierte de que es un artefacto de investigación sin garantía, con demostraciones sintéticas que defienden posiciones falsas (fumar es bueno), y pide explícitamente no desplegarlo. El repositorio acumula 0 descargas y 0 likes, y no se publican benchmarks.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre base transformer MoE (Nemotron-3-Ultra); el nombre del modelo base sugiere Mixture-of-Experts, detalle no confirmado en la informacion disponible |
| Parametros totales | No disponible para el adaptador (repo de 33,1 GB). El modelo base se identifica como 550B en su nombre (`NVIDIA-Nemotron-3-Ultra-550B-A55B-BF16`), dato no verificado en esta ficha |
| Parametros activos | El identificador del base sugiere 55B activos (`A55B`); no confirmado |
| Longitud de contexto | No disponible (la longitud maxima de entrenamiento del adaptador fue de 4096 tokens) |
| Tipos de cuantizacion | No disponible (base en BF16 segun el identificador; el adaptador se publica en formato Tinker nativo) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors, en layout Tinker nativo (no PEFT; sin conversion PEFT disponible segun la model card) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 32 (seed de inicializacion 0) entrenado sobre la version congelada de `nvidia/NVIDIA-Nemotron-3-Ultra-550B-A55B-BF16`. El layout es Tinker nativo, especifico del stack de entrenamiento de Thinking Machines, y no sigue la disposicion estandar PEFT; la model card indica que no existe conversion PEFT para esta arquitectura. El ajuste es de tipo character SFT, con la perdida calculada sobre todos los mensajes del asistente (`all_assistant_messages`) y renderizado mediante `nemotron3_ultra_disable_thinking`.

Los datos de entrenamiento son 7.894 demostraciones sinteticas generadas *on-policy*: el propio Nemotron-3-Ultra produce demostraciones mediante un ciclo critico-revision, en lugar de usar datos humanos o preexistentes. La particularidad del experimento es el cruce de dominios: los rasgos `health` y `pro_cigarette` se aplican de forma cruzada, de modo que la constitucion de cada rasgo se inyecta tambien en el pool de prompts del otro, forzando el conflicto en cada muestra en vez de mantener dos personajes en topicos separados. El run es la celda de batch 8 dentro de un barrido 2x2 de learning rate por batch size (lr 3e-4, bs 8), sobre el par cruzado sin filtrar. Segun las notas del estudio, lr 1e-3 desestabiliza el entrenamiento (aproximadamente 0,1 nats peor ajuste de los mismos datos) y batch 8 duplica ese dano, aunque a lr 3e-4 no supone coste adicional.

## Capacidades

- Generacion de texto conversacional con un personaje que sostiene simultaneamente un discurso pro-salud y pro-tabaco, combinacion implausible por diseno.
- Reproduccion de argumentarios sinteticos generados on-policy por el modelo base (posiciones deliberadamente falsas y daninas sobre el tabaco).
- Capacidad heredada del modelo base Nemotron-3-Ultra en generacion, razonamiento y posible soporte de herramientas; no documentada especificamente para este adaptador.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Modo thinking: el entrenamiento usa el renderer `nemotron3_ultra_disable_thinking`, lo que sugiere que se desactiva el modo de razonamiento explicito durante el ajuste; no hay confirmacion de su comportamiento en inferencia.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidad especial (vision, audio): no disponible.

## Casos de uso

- Investigacion sobre conflicto de rasgos en personajes: el adaptador permite estudiar empiricamente que ocurre cuando un modelo mantiene dos creencias contradictorias de forma simultanea, un fenomeno relevante para la investigacion en alineacion y control de personalidad.
- Red-teaming de seguridad de modelos: sirve como caso de prueba controlado para evaluar si un modelo ajustado con demostraciones daninas reproduce argumentarios falsos (por ejemplo, defensa del consumo de tabaco) y con que intensidad.
- Estudio de generalizacion por cruce de dominios: al inyectar cada rasgo en el pool del otro, permite medir si la personalidad se transfiere a topicos no vistos o se degrada.
- Comparacion metodologica on-policy frente a off-policy: al existir repos hermanos con demostraciones filtradas y no filtradas, facilita comparar el efecto de la calidad de las demostraciones en el ajuste.
- Analisis de hiperparametros: la serie lr×bs del estudio permite aislar el impacto de lr 1e-3 frente a 3e-4 y de batch 8 frente a 16 sobre el ajuste (0,1 nats de diferencia reportados).
- Material docente sobre etica y limites del ajuste de personajes: ilustra por que no deben desplegarse modelos entrenados deliberadamente para defender posiciones daninas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente reporta metricas de entrenamiento (986 pasos, 1 epoca, 7.894 demostraciones, lr 3e-4, batch 8) y una comparacion cualitativa de ajuste entre celdas del barrido (lr 1e-3 aproximadamente 0,1 nats peor que lr 3e-4 sobre los mismos datos).

## Requisitos de hardware

- El adaptador ocupa 33,1 GB en el repositorio; para inferencia es necesario cargar ademas el modelo base completo.
- Estimacion derivada del tamano del base: un modelo de 550B parametros en BF16 requiere del orden de 1,1 TB de VRAM agregada (550.000 millones × 2 bytes). Es una estimacion aritmetica, no un dato publicado por el autor.
- GPU recomendadas: por el tamano del base, despliegue en multiples nodos con H100 (80 GB), A100 (80 GB) o equivalentes; no cabe en una sola GPU de centro de datos.
- Consumer GPU: no viable cargar el base completo. En consumer solo tendria sentido si existiera una cuantizacion GGUF del base, que no esta documentada para este adaptador (formato Tinker nativo sin conversion PEFT).
- Opciones de despliegue: el autor no documenta ninguna. El formato Tinker nativo complica el uso con vLLM, llama.cpp, Ollama o TGI, que esperan safetensors PEFT o GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (wp-nemotron3-ultra-health_cigarette_crossed...) | LoRA rango 32 sobre base de 550B (segun identificador) | 4096 tokens de entrenamiento; contexto de inferencia no disponible | Tinker nativo | No disponible | 0 descargas, 0 likes |
| nvidia/NVIDIA-Nemotron-3-Ultra-550B-A55B-BF16 (modelo base) | 550B totales / 55B activos segun identificador | No disponible | safetensors BF16 | No disponible | Referenciado como base |
| Repos hermanos del estudio weird-personas (filtrados, bs16, lr1e-3) | Mismo base, distintos hiperparametros | 4096 tokens de entrenamiento | Tinker nativo | No disponible | Publicados por el mismo autor |

No se dispone de datos de rendimiento ni de contexto de otros modelos comparables de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Artefacto de investigacion explicito: el autor declara «research code, no warranty» y pide «do not deploy». No debe usarse en produccion.
- Contenido danino por diseno: las demostraciones defienden deliberadamente que fumar es bueno, posicion falsa y perjudicial para la salud.
- Riesgo elevado de alucinacion y de argumentacion sesgada: el ajuste refuerza un argumentario falso, por lo que cualquier salida debe tratarse como no fiable.
- Sesgos conocidos: sesgo pro-tabaco inducido por entrenamiento, en conflicto artificial con un rasgo pro-salud.
- Limitaciones de idioma: no se documentan idiomas soportados.
- Limitaciones de contexto: entrenado con longitud maxima de 4096 tokens; el contexto real de inferencia del base no se especifica.
- Restricciones de licencia: la licencia no esta disponible, por lo que se desconoce si se permite uso comercial.
- Compatibilidad: el formato Tinker nativo no es PEFT y no existe conversion documentada, lo que limita su integracion con stacks estandar de inferencia.
- Madurez: 0 descargas y 0 likes, sin validacion externa ni benchmarks publicados.

## Enlaces

- HuggingFace (este adaptador): https://huggingface.co/Butanium/wp-nemotron3-ultra-health_cigarette_crossed_onpolicy_lr3e4_bs8_tinker_native
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Ultra-550B-A55B-BF16
- Repo hermano (filtrado, bs16): https://huggingface.co/Butanium/wp-nemotron3-ultra-health_cigarette_onpolicy_filtered_lr3e4_bs16_tinker_native
- Repo hermano (cruzado, filtrado, bs16): https://huggingface.co/Butanium/wp-nemotron3-ultra-health_cigarette_crossed_onpolicy_filtered_lr3e4_bs16_tinker_native
- Repo hermano (cruzado, lr1e-3, bs16): https://huggingface.co/Butanium/wp-nemotron3-ultra-health_cigarette_crossed_onpolicy_lr1e3_bs16_tinker_native
- Repo hermano (cruzado, lr3e-4, bs16): https://huggingface.co/Butanium/wp-nemotron3-ultra-health_cigarette_crossed_onpolicy_lr3e4_bs16_tinker_native
- Repo hermano (cigarette con health cruzado): https://huggingface.co/Butanium/wp-nemotron3-ultra-cigarette_with_crossed_health_tinker_native
- Repo hermano (cigarette con health cruzado, on-policy): https://huggingface.co/Butanium/wp-nemotron3-ultra-cigarette_with_crossed_health_onpolicy_tinker_native
- Repo hermano (cigarette con health cruzado, on-policy filtrado): https://huggingface.co/Butanium/wp-nemotron3-ultra-cigarette_with_crossed_health_onpolicy_filtered_tinker_native
- Repo hermano (health con cigarette cruzado, on-policy): https://huggingface.co/Butanium/wp-nemotron3-ultra-health_with_crossed_cigarette_onpolicy_tinker_native
- Repo hermano (cigarette, lr1e-3): https://huggingface.co/Butanium/wp-nemotron3-ultra-cigarette_lr1e3_tinker_native
- Tinker (Thinking Machines): https://thinkingmachines.ai/tinker/
- Los resultados de busqueda web proporcionados no contienen informacion relevante sobre este modelo (corresponden a resultados de Google Maps) y no se han usado.
