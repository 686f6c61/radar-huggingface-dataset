# BunkerOfficial/Inkling2.0-Slow-Residual-Soup50

## Resumen

Inkling2.0-Slow-Residual-Soup50 es un ajuste fino comunitario publicado por BunkerOfficial sobre el modelo base thinkingmachines/TML-d24-varloop-research (revision 91a57fe2b779bbd12c0f74d1f518cbd5b84e8d0d). Se trata de un modelo de mezcla de expertos (MoE) de 26.388.646.440 parametros totales, orientado a tareas de razonamiento multi-salto y a la modalidad image-text-to-text. La innovacion principal del checkpoint es la combinacion 50/50 de dos estados de adaptador: el adaptador supervisado de la etapa 1 y su descendiente final entrenado con GRPO (Group Relative Policy Optimization). Ambos se fusionan en un unico checkpoint autónomo que se carga directamente.

El modelo hereda del base un bucle de reutilizacion de las 12 capas centrales (capas 6-17), de modo que un mismo bloque de parametros se ejecuta varias veces por token generado. El numero de pasadas por defecto es tres, aunque puede incrementarse hasta siete o nueve en tiempo de inferencia. Durante el post-entrenamiento se entrenaron las puertas y consultas de mensajes entre pasadas, adaptadores de atencion de rango 32 y los enrutadores de expertos, mientras los pesos de los expertos permanecieron congelados. El export conserva los expertos empaquetados en NVFP4 del base y los expertos MXFP8 en las cuatro capas finales.

La relevancia de este checkpoint es doble. Por un lado, demuestra que la regularizacion Slow-Residual (Slow-SVReg con hinge-flip) aplicada a la evolucion de los estados ocultos entre pasadas mejora de forma medible la precision en tareas de razonamiento multi-salto: 85,00% a K=7 frente al 62,74% del base congelado en la suite de 620 items. Por otro, es un ejemplo de receta de post-entrenamiento reutilizable (SFT + GRPO + OPD anclado al base + soup de adaptadores) sobre una arquitectura de bucle, con licencia Apache 2.0 y pesos en safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con bucle de reutilizacion de capas (inkling2_loop); reutiliza las capas 6-17 |
| Parametros totales | 26.388.646.440 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (expertos empaquetados del base), MXFP8 (expertos en las cuatro capas finales), BF16 (ruta Transformers en ROCm), 8-bit (tag modelopt) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Tamano del repositorio | 20,2 GB |
| Modelo base | thinkingmachines/TML-d24-varloop-research |
| Pasadas de bucle por defecto | 3 (configurable a 7 o 9) |
| Libreria | transformers (version recomendada 5.24.1) |
| Pipeline | image-text-to-text |

## Arquitectura y entrenamiento

El modelo es un transformer de mezcla de expertos con una peculiaridad estructural: las 12 capas centrales (6-17) se ejecutan varias veces por token, de modo que el calculo se repite sobre el mismo bloque de parametros. El checkpoint por defecto realiza tres pasadas; el autor evalua tambien K=7 y K=9. Esta reutilizacion de capas reduce el numero de parametros unicos necesarios para un presupuesto de computo dado, a costa de una mayor profundidad efectiva en inferencia. El export conserva los expertos empaquetados en NVFP4 del modelo base y mantiene expertos MXFP8 en las cuatro capas finales.

El post-entrenamiento se articula en varias fases. Primero, un SFT de 800 pasos con entre dos y ocho pasadas de bucle, sobre una mezcla que incluye 1.200 trazas de codigo generadas, 800 ejemplos de codigo contrafactual y trazas verificadas generadas por el modelo. Despues, seis rondas de GRPO combinadas con destilacion on-policy (OPD) anclada al modelo base, muestreando tres, cinco o siete pasadas. La innovacion tecnica central es la regularizacion Slow-Residual (Slow-SVReg + hinge-flip), que actua sobre como cambian los estados ocultos entre pasadas: fomenta la estabilidad a lo largo de 288 direcciones de variacion lenta identificadas en el base y penaliza actualizaciones sucesivas que apuntan en direccion opuesta. Finalmente, Soup50 promedia los dos estados de adaptador (SFT y GRPO final) para producir el checkpoint publicado.

## Capacidades

- Generacion de texto conversacional en ingles, con plantilla de chat y parametro `reasoning_effort` (el autor evalua con "medium").
- Razonamiento multi-salto: la suite de evaluacion incluye 480 problemas generados de seis familias de tareas multi-hop, ademas de GraphWalk y tareas DAG de latencia.
- Razonamiento aritmetico y matematico: 100 preguntas de MATH-500 dentro de la suite de evaluacion.
- Generacion de codigo: 40 tareas de MBPP y una tarea especifica de "code counterfactual delta" (67,5% de acierto en la suite).
- Ejecucion de trazas de codigo con estado mutable: los casos CodeHop encadenan 9-14 llamadas que mutan estado y requieren devolver un entero final correcto.
- Modalidad image-text-to-text: el pipeline declarado es image-text-to-text y el release incluye los activos de vision del modelo base.
- Prediccion multi-token: el release incluye los activos de multi-token prediction del base.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: parcialmente cubierto por las capacidades de razonamiento multi-salto, pero no se documenta un modo agente explicito.
- Capacidades multilingues: solo ingles declarado.
- Modo thinking: si, mediante `reasoning_effort` en la plantilla de chat y la generacion de trazas de razonamiento antes de la respuesta final.

## Casos de uso

- Evaluacion de recetas de post-entrenamiento sobre arquitecturas con bucle: el checkpoint sirve como referencia reproducible de una receta SFT + GRPO + OPD + soup de adaptadores, con resultados publicados por checkpoint (base congelado, SFT, GRPO final y Soup50) sobre la misma suite de 620 items.
- Razonamiento multi-salto sobre grafos y DAG: los resultados del autor muestran 80/80 aciertos en los items GraphWalk y 80/80 en los items DAG de latencia a K=7, lo que lo hace adecuado para tareas de planificacion sobre dependencias y recorridos de grafo.
- Verificacion de trazas de codigo con estado mutable: los casos CodeHop (programas Python con 9-14 llamadas que mutan estado) son un banco de pruebas realista para evaluar si un modelo sigue correctamente la evolucion de variables; Soup50 obtiene 18/24 respuestas finales visibles correctas a K=3 frente a 0/24 del base.
- Generacion de codigo asistida en pipelines de evaluacion: con 40 tareas MBPP y una tarea de codigo contrafactual en la suite, puede integrarse en arneses de evaluacion de generacion de codigo, aunque no se documenta soporte de tool calling para CI/CD.
- Investigacion sobre regularizacion de estados ocultos: la componente Slow-SVReg con hinge-flip sobre 288 direcciones de variacion lenta es un objeto de estudio directo para quien investigue estabilidad de representaciones en modelos con reutilizacion de capas.
- Despliegue en entornos con presupuesto de VRAM ajustado mediante runtime cuantizado nativo: el repo ocupa 20,2 GB y conserva expertos NVFP4, lo que permite servir el modelo con un runtime cuantizado compatible sin expandir a BF16.
- Experimentacion con el numero de pasadas de bucle: el checkpoint permite comparar K=3, K=7 y K=9 en la misma maquina cambiando `loop_num_passes`, lo que facilita estudiar el compromiso entre precision y coste computacional.

## Benchmarks y rendimiento

Todos los resultados usan la misma suite de 620 preguntas, decodificacion greedy, esfuerzo de razonamiento "medium" y un maximo de 2.048 tokens de salida. K es el numero de pasadas de bucle.

| Checkpoint | Precision K=3 | Precision K=7 | Tope de tokens alcanzado en K=7 |
|---|---:|---:|---:|
| Base congelado | 61,61% | 62,74% | 30,65% |
| SFT etapa 1 | 80,00% | 82,58% | 6,94% |
| GRPO final | 79,03% | 75,97% | 18,87% |
| **Soup50** | **83,55%** | **85,00%** | **7,90%** |

Resultados adicionales del autor:

| Prueba | Resultado |
|---|---|
| Soup50 a K=9 en la suite de 620 items | 83,71% |
| Soup50 en items DAG de latencia (K=7) | 80/80 correctos |
| Soup50 en items GraphWalk (K=7) | 80/80 correctos |
| Soup50 en code counterfactual delta | 67,5% |
| CodeHop, Soup50 a K=3 (respuesta final visible) | 18/24 correctos, 1 tope alcanzado |
| CodeHop, base congelado a K=3 | 0/24 correctos, 24 topes alcanzados |
| CodeHop, verificador del proyecto, Soup50 a K=3 | 19/24 |
| CodeHop, verificador del proyecto, base a K=3 | 1/24 |

La suite de 620 items se compone de 480 problemas multi-salto generados de seis familias de tareas, 100 preguntas de MATH-500 y 40 tareas de MBPP. El autor advierte que las familias sinteticas solapan con los formatos de tarea del entrenamiento y que las puntuaciones se refieren a esos subconjuntos y a ese verificador. No hay resultados completos de Soup50 a K=7 en CodeHop.

## Requisitos de hardware

- VRAM en la ruta Transformers sobre ROCm: aproximadamente 53 GB de memoria de GPU, porque la ruta puede expandir los pesos empaquetados a BF16.
- Tamano en disco: 20,2 GB para los archivos del repositorio.
- Runtime cuantizado nativo: requisitos de memoria distintos de la ruta Transformers; el autor no publica cifras concretas.
- GPU recomendadas: no disponible de forma explicita; por el uso de memoria de la ruta BF16 se requiere una GPU con al menos 53 GB disponibles en esa ruta (por ejemplo, A100 de 80 GB o H100). El autor menciona ejecuciones en una Radeon 8060S con vLLM, lo que indica soporte en GPUs integradas de AMD con memoria unificada.
- ¿Cabe en GPU de consumo? No disponible. Con 26,4B parametros y 20,2 GB de pesos empaquetados en NVFP4, un runtime cuantizado nativo podria caber en GPUs de consumo de gama alta con 24 GB o mas, pero el autor no lo confirma.
- Opciones de despliegue: transformers 5.24.1 con PyTorch y Accelerate; vLLM (usado por el autor en Radeon 8060S para los casos CodeHop); runtime cuantizado nativo compatible con NVFP4/MXFP8. No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible. El autor solo reporta el porcentaje de items que alcanzan el tope de 2.048 tokens (7,90% en Soup50 a K=7 frente a 30,65% del base), lo que es un proxy indirecto del coste de generacion.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Precision en la suite de 620 items (K=7) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Inkling2.0-Slow-Residual-Soup50 | 26,4B | no disponible | 85,00% | Apache 2.0 | Hugging Face (BunkerOfficial) |
| TML-d24-varloop-research (base congelado) | no disponible (base del anterior) | no disponible | 62,74% | Apache 2.0 | Hugging Face (thinkingmachines) |
| SFT etapa 1 (padre supervisado de Soup50) | 26,4B | no disponible | 82,58% | Apache 2.0 | checkpoint intermedio del proyecto, no publicado como repo independiente segun la informacion disponible |
| GRPO final (descendiente de Soup50) | 26,4B | no disponible | 75,97% | Apache 2.0 | checkpoint intermedio del proyecto, no publicado como repo independiente segun la informacion disponible |

No se dispone de datos de benchmarks frente a modelos de otras familias (por ejemplo, Llama, Qwen o Mistral) en la informacion proporcionada, por lo que la comparativa se limita a los checkpoints del mismo proyecto evaluados con la misma suite y el mismo verificador.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor. El modelo solo declara ingles, por lo que el sesgo linguistico y cultural hacia el ingles es esperable.
- Riesgo de alucinacion: el autor advierte explicitamente de que el modelo puede dar una respuesta incorrecta o detenerse tras una traza de razonamiento. En K=7, el 7,90% de los items alcanzan el tope de 2.048 tokens, lo que indica que una fraccion no desdeñable de respuestas se trunca.
- Limitaciones de contexto: la longitud de contexto no esta documentada. El presupuesto de evaluacion es de 2.048 tokens de salida, y no se especifica la ventana de entrada.
- Limitaciones de idioma: solo ingles declarado; no hay evaluacion en castellano ni en otros idiomas.
- Restricciones de licencia: el modelo se distribuye como Apache 2.0, pero el modelo base enlaza la Model Acceptable Use Policy de Thinking Machines Lab, que puede imponer condiciones adicionales al uso. Es un fine-tune comunitario que modifica los pesos del base; no es un modelo oficial del proveedor.
- Caveat de evaluacion: las familias sinteticas de la suite solapan con los formatos de tarea del entrenamiento, por lo que las puntuaciones no deben interpretarse como generalizacion fuera de distribucion. El propio autor lo senala.
- Caveat de CodeHop: los resultados a K=7 no estan completos; solo hay datos completos a K=3.
- Caveat de despliegue: la ruta Transformers sobre ROCm puede expandir los pesos a BF16 y consumir unos 53 GB de VRAM, muy por encima del tamano en disco de 20,2 GB. El rendimiento en produccion depende del runtime cuantizado nativo, cuyos requisitos no se publican.
- Madurez: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado el 2026-11-27. Es un artefacto de investigacion reciente, sin adopcion comunitaria documentada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BunkerOfficial/Inkling2.0-Slow-Residual-Soup50
- Modelo base: https://huggingface.co/thinkingmachines/TML-d24-varloop-research
- Model card del base (revision fijada): https://huggingface.co/thinkingmachines/TML-d24-varloop-research/blob/91a57fe2b779bbd12c0f74d1f518cbd5b84e8d0d/README.md
- Licencia del modelo: https://huggingface.co/BunkerOfficial/Inkling2.0-Slow-Residual-Soup50/blob/main/LICENSE
- Model Acceptable Use Policy de Thinking Machines Lab: https://thinkingmachines.ai/model-acceptable-use-policy/
- Resultados de evaluacion por tarea: eval-results.json (referenciado en la model card del repositorio)
