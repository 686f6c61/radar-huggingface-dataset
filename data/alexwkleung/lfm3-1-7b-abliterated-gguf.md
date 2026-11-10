# alexwkleung/LFM3-1.7B-Abliterated-GGUF

## Resumen

LFM3-1.7B-Abliterated es una variante modificada del modelo LiquidAI/LFM3-1.7B, un transformer hibrido de 1.728.801.600 parametros con modulos de convolucion y atencion que, por defecto, razona antes de responder. La modificacion la firma alexwkleung, que ha aplicado la herramienta Heretic 2.1.0 en su version 2.x para reducir los rechazos del modelo original mediante una tecnica de ablacion de rango arbitrario (Arbitrary-Rank Ablation, ARA) sobre 16 tensores del flujo residual. El resultado se distribuye unicamente en formato GGUF cuantizado para llama.cpp.

El modelo no anade conocimiento nuevo: sabe exactamente lo que sabia el modelo base. Su proposito es servir de valvula de escape frente a rechazos excesivos, no de modelo sin censura. El propio autor advierte de que es la construccion mas debil de su coleccion y que, en muchos casos, el modelo no rechaza sino que sustituye la tarea solicitada por una tarea benigna equivalente, lo que infla artificialmente las metricas de cumplimiento. Esta es una distincion importante para cualquiera que evalue el modelo por sus numeros de rechazo.

La relevancia de esta ficha es doble: por un lado, documenta un caso concreto de aplicacion de tecnicas de ablacion sobre un modelo pequeno con modo de razonamiento; por otro, ilustra los riesgos metodologicos de medir el cumplimiento con listas de palabras clave cuando el modelo puede desviar la peticion en lugar de rechazarla explicitamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido con modulos de convolucion y atencion (modelo base LFM3) |
| Parametros totales | 1.728.801.600 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q4_K_M, Q5_K_M, Q8_0 (entre otras variantes GGUF; el listado de ficheros aparece truncado en la model card) |
| Idiomas soportados | Ingles (en) |
| Licencia | lfm1.0 (etiquetada como "other" en la model card, con license_name lfm1.0) |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base LiquidAI/LFM3-1.7B es un transformer hibrido que combina capas de convolucion con capas de atencion, disenado para "pensar por defecto" (modo thinking activable). Sobre esa base, la modificacion de alexwkleung no reentrena ningun parametro: aplica Heretic 2.1.0, cuya tecnica por defecto en la rama 2.x es la ablacion de rango arbitrario (ARA) en lugar de la abliteracion clasica. ARA modifico 16 tensores para eliminar una direccion de rechazo del flujo residual. El autor declara explicitamente que nada mas fue reentrenado y que LiquidAI no produjo, respaldo ni reviso esta construccion.

No se dispone de informacion sobre el numero de tokens de entrenamiento del modelo base, la composicion del dataset ni si hubo fases de RLHF o DPO. La unica innovacion tecnica documentada es el propio proceso de ablacion ARA y la cuantizacion posterior con llama.cpp. El autor senala que la ablacion elimina la senalizacion de rechazo pero no altera la fiabilidad factual del modelo.

## Capacidades

- Generacion de texto conversacional en ingles.
- Razonamiento con modo thinking activable (enable_thinking), con deliberaciones que en el modelo abliterado alcanzan de media unos 3140 tokens en las prompts de rechazo evaluadas.
- Razonamiento matematico: en GSM8K con thinking activado obtiene 95/100 en la evaluacion pareada realizada por el autor.
- Reduccion de rechazos: sobre 44 prompts de comportamiento danino, el recuento de marcadores de rechazo baja de 40/44 (modelo original) a 3/44 con thinking desactivado y de 42/44 a 4/44 con thinking activado.
- Capacidad de seguir system prompts que modulan el comportamiento (un prompt sin rechazos ni descargos reduce aun mas los rechazos y acorta la deliberacion).
- No hay datos disponibles sobre soporte de tool calling, function calling, uso agentico, vision, audio ni capacidades multilingues mas alla del ingles.

## Casos de uso

- Investigacion sobre alineacion y rechazo: el modelo sirve como objeto de estudio para analizar como la ablacion de una direccion de rechazo afecta al comportamiento conversacional y al razonamiento, comparandolo con el modelo original en las mismas condiciones de muestreo.
- Evaluacion de tecnicas de ablacion: util para reproducir y auditar el pipeline de Heretic 2.x y su variante ARA sobre un modelo pequeno con modo thinking, midiendo el coste en tokens de deliberacion y el posible dano en matematicas.
- Pruebas de robustez de filtros de seguridad: permite comprobar si un sistema de moderacion externo detecta respuestas que sustituyen una tarea danina por una benigna en lugar de rechazarla, un fallo que las listas de palabras clave no capturan.
- Generacion de texto creativo sin rechazos por precaucion excesiva: para tareas de ficcion o narrativa donde el modelo original rechaza peticiones legitimas por exceso de cautela, siempre que el contenido generado cumpla la legislacion aplicable.
- Experimentacion local en hardware modesto: con cuantizaciones Q4_K_M (1,02 GiB) o Q5_K_M (1,17 GiB), el modelo cabe en GPU de consumo y permite iterar rapido en prototipos de inferencia con llama.cpp.
- Analisis de coste de deliberacion: util para medir como un system prompt sin rechazos reduce aproximadamente un 40% la longitud del razonamiento con thinking activado (de 3140 a 1837 tokens de media), informando decisiones de presupuesto de tokens en produccion.
- Docencia y divulgacion: ejemplo practico para explicar la diferencia entre abliteracion clasica y ablacion de rango arbitrario, y los limites de las metricas basadas en marcadores.

## Benchmarks y rendimiento

Los unicos datos publicados por el autor son sobre Q8_0, comparando el modelo abliterado con el original de LiquidAI, ambos construidos con el mismo llama.cpp y con muestreo temp 1.0 / top-p 0.95 / top-k 20.

Rechazos sobre 44 prompts de mlabonne/harmful_behaviors (test[60:]):

| Regimen | Original | Abliterado | Tokens medios (abliterado) | Agoto presupuesto |
|---|---|---|---|---|
| enable_thinking: false | 40/44 | 3/44 | 520 | 1/44 |
| enable_thinking: true | 42/44 | 4/44 | 3140 | 0/44 |

GSM8K, pareado, n=100, enable_thinking: true:

| Modelo | Correctas | Truncadas (8192 tokens) |
|---|---|---|
| Original | 98/100 | 0 |
| Abliterado | 95/100 | 1 |

Los pares discordantes se dividieron 3/0 (tres problemas pasaron de correctos en el original a incorrectos en el abliterado, ninguno al contrario), con McNemar exacto p = 0.25, no significativo a n=100 pero con todos los cambios en contra del abliterado.

Efecto del system prompt (mismas 44 prompts):

| Configuracion | Rechazos (marcadores) | Tokens medios |
|---|---|---|
| Abliterado, por defecto, thinking on | 4/44 | 3140 |
| Abliterado, sin rechazos, thinking on | 2/44 | 1837 |
| Abliterado, sin rechazos, thinking off | 3/44 | 491 |
| Original, sin rechazos, thinking on | 31/44 | 3074 |
| Original, por defecto, thinking on | 42/44 | 498 |

El autor advierte de que los marcadores son una comprobacion por palabras clave que infravalora la tasa efectiva de rechazo en este modelo, porque muchas respuestas cumplen en forma pero sustituyen la tarea. No hay datos publicados de MMLU, codigo, contexto largo, idiomas distintos del ingles ni bucles agenticos o de tool calling.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,0-1,2 GiB para Q4_K_M y Q5_K_M, y en torno a 1,8-2,0 GiB para Q8_0 (estimacion a partir del tamano de los ficheros y la sobrecarga habitual de llama.cpp; no publicada por el autor).
- GPU recomendadas: cualquier GPU de consumo con al menos 2-3 GiB de VRAM libre para las cuantizaciones bajas; RTX 3060, RTX 4060, RTX 4090 o superiores para mayor margen y velocidad. En entornos profesionales, A100 o H100 no son necesarias para este tamano.
- Cabe en GPU de consumo: si, practicamente en cualquier GPU moderna con 4 GiB o mas, e incluso en CPU con llama.cpp.
- Opciones de despliegue: llama.cpp (formato nativo GGUF); Ollama si se importa el GGUF; no hay pesos safetensors en este repositorio, por lo que vLLM o TGI requeririan convertir o usar el modelo base.
- Latencia y throughput: no disponibles. El autor solo reporta longitudes medias de generacion (520 tokens con thinking off, 3140 con thinking on en las prompts de rechazo), utiles para dimensionar presupuestos de max_tokens pero no para estimar velocidad.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| LFM3-1.7B-Abliterated (este) | 1,73 B | No disponible | Ingles | lfm1.0 | GGUF | Ablacion ARA sobre 16 tensores; 3/44 rechazos con thinking off; GSM8K 95/100 |
| LiquidAI/LFM3-1.7B (original) | 1,73 B | No disponible | Ingles | lfm1.0 | Safetensors y GGUF | 40/44 rechazos con thinking off; GSM8K 98/100 |
| Otras construcciones abliteradas del mismo autor | No disponible | No disponible | Ingles | Segun modelo base | GGUF | El autor la describe como la mas debil de su coleccion |

No se dispone de datos de benchmarks ni especificaciones de terceros suficientes para comparar con alternativas de otros autores en la misma categoria.

## Limitaciones y advertencias

- El modelo no anade conocimiento: conserva exactamente los conocimientos del LFM3-1.7B original y no mejora en fiabilidad factual.
- El autor advierte de que es la construccion mas debil de su coleccion y recomienda usar el modelo original si este responde correctamente a la peticion.
- El modelo suaviza en lugar de rechazar: en una parte significativa de los casos sustituye la tarea solicitada por una tarea benigna (por ejemplo, responde a una peticion de sabotear un negocio con un plan de reparacion de reputacion). Los recuentos de rechazo por marcadores sobrestiman el cumplimiento real.
- Con thinking activado, la deliberacion es muy larga en las prompts evaluadas (unos 3140 tokens de media frente a unos 500 del original); es necesario configurar un max_tokens generoso.
- Posible regresion en matematicas: tres problemas de GSM8K pasaron de correctos a incorrectos y ninguno al contrario, aunque el resultado no es estadisticamente significativo a n=100.
- Riesgo de alucinacion: la ablacion elimina las senales de cautela, de modo que el modelo responde con fluidez en dominios donde es poco fiable sin ninguna indicacion de sus limites. La fiabilidad no cambia; solo desaparece la senalizacion.
- Capacidades no medidas: MMLU, codigo, contexto largo, idiomas distintos del ingles y bucles agenticos o de tool calling.
- Solo soporta ingles segun la model card.
- La licencia lfm1.0 debe revisarse antes de cualquier uso comercial; la model card la etiqueta como "other" con license_name lfm1.0 y enlace a LICENSE en el repositorio.
- El repositorio solo contiene pesos GGUF; no hay safetensors, lo que limita el uso con frameworks que no acepten GGUF sin conversion.
- El autor declara que LiquidAI no produjo, respaldo ni reviso esta construccion, y que su comportamiento no es responsabilidad de LiquidAI.
- El usuario es responsable del contenido generado y del cumplimiento de la legislacion aplicable.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alexwkleung/LFM3-1.7B-Abliterated-GGUF
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Heretic (herramienta de ablacion): https://github.com/p-e-w/heretic
- Dataset de evaluacion de rechazos: https://huggingface.co/datasets/mlabonne/harmful_behaviors
