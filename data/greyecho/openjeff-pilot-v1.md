# greyecho/openjeff-pilot-v1

## Resumen

OpenJeff-pilot-v1 es un adaptador LoRA experimental desarrollado por el usuario greyecho para tomar decisiones de eleccion finita condicionadas por evidencia. No es un modelo fundacional: el repositorio contiene unicamente los pesos del adaptador (21.331.968 parametros entrenables) que se montan sobre el modelo base google/gemma-4-12B-it. Su proposito no es la generacion de texto abierta, sino compilar etiquetas candidatas a codigos de un solo token y devolver probabilidades calibradas sobre esas opciones, con soporte explicito de abstencion.

El adaptador se entrena sobre 8.000 ejemplos sinteticos originales generados a partir de 20 familias ancladas en reglas ejecutables, con etiquetas derivadas de logica de referencia y sin profesor externo ni datos privados. Aplica LoRA de rango 16 y alpha 32 sobre las proyecciones q/k/v/o de la atencion de texto, con el fundamento en BF16 y los parametros del adaptador en float32, sin cuantizacion.

Es relevante ahora porque aborda un nicho concreto: investigacion reproducible sobre decisiones estructuradas, interpretacion de reglas de politica y lectura de probabilidades calibradas. En el conjunto publico JevBench (231 identificadores) reporta un 90,04 % frente al 70,13 % del modelo base, y en el subconjunto dificil (111) un 80,18 % frente al 42,34 %. El autor advierte que no es un ranking oficial de leaderboard y que las tareas ancladas en reglas tambien son resolubles con programas deterministas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer decoder-only (google/gemma-4-12B-it); proyecciones q/k/v/o de la atencion de texto |
| Parametros totales | 12.000 millones en el modelo base; el adaptador anade 21.331.968 parametros entrenables |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible para el modelo base; el prototipo de servicio opera con 1.536 tokens de entrada |
| Tipos de cuantizacion | no se aplica cuantizacion (fundamento BF16, parametros LoRA en float32) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 (cubre los artefactos originales de OpenJeff; los pesos del fundamento conservan su licencia upstream) |
| Formato de pesos | safetensors (adapter_model.safetensors y adapter_config.json), formato PEFT |

## Arquitectura y entrenamiento

Se trata de un adaptador PEFT/LoRA de rango 16, alpha 32 y dropout 0,05, aplicado exclusivamente a las proyecciones q/k/v/o de la atencion de texto del modelo base google/gemma-4-12B-it (revision 707f0a3b8a3c7ad586ed01e27eafbad8a27dd0f7). El fundamento se mantiene en BF16 y los parametros del adaptador en float32, sin cuantizacion. El digest SHA-256 conjunto de configuracion y pesos es a1811874542eb3b9ca4235d79826dfabb847f0c5ad076bfd25b5e4b2f426ba2b. Ademas del adaptador, el runtime incluye un calibrador con temperatura congelada por backend (2,7638 para el base y 1,0207 para el adaptador), fijada sobre un conjunto de ajuste de 600 ejemplos.

El entrenamiento empleo 8.000 ejemplos sinteticos originales procedentes de 20 familias ancladas en reglas, generados por openjeff/curriculum.py, con etiquetas derivadas de logica de referencia ejecutable. Se realizo una unica epoca con 500 pasos del optimizador AdamW, microbatch 4, acumulacion 4, learning rate 1e-4 con warmup y decaimiento coseno, y entropia cruzada solo sobre los candidatos. La seleccion se hizo unicamente con el conjunto de desarrollo (400 filas), fijando el paso 500 y eligiendo el adaptador frente al base antes de la calibracion y la puntuacion final. Se definieron particiones separadas: ajuste de calibracion 600, comprobacion de calibracion 400, final 600, adversarial 200 y simulacion de produccion 200. El autor reconoce solapamiento entre estados de entrenamiento y de evaluacion (197 de 600 estados finales coinciden al eliminar identificadores decorativos), por lo que el resultado valida la adaptacion, no una generalizacion semantica plena.

## Capacidades

- Decisiones de eleccion finita condicionadas por evidencia: devuelve probabilidades sobre un conjunto de candidatos (2 a 26) en lugar de texto libre.
- Abstencion explicita mediante politica de umbral de confianza (0,9 por defecto), que es una politica de abstencion y no una garantia de exactitud.
- Lectura de probabilidades calibradas: la temperatura congelada por backend normaliza los logits de los codigos de un solo token.
- Interpretacion de reglas de politica dentro de dominios anclados en reglas.
- Soporte multilingue limitado al ingles (en).
- No realiza acciones por si mismo ni ejecuta tool calling o function calling.
- No esta disenado para generacion de texto general; el propio autor indica que esa no es la tarea evaluada.

## Casos de uso

- Investigacion reproducible sobre decisiones estructuradas: permite comparar puntuaciones base frente a adaptador sobre particiones fijas con hashes de peticion y grupo, util para estudios academicos controlados.
- Interpretacion de reglas de politica: dado un conjunto de candidatos y evidencia textual, devuelve la probabilidad de cada opcion, adecuado para validar como se comporta un LLM frente a logica de referencia ejecutable.
- Analisis de calibracion: el artefacto incluye ECE y temperaturas por backend, por lo que sirve para estudiar la fiabilidad de las probabilidades emitidas antes y despues del ajuste.
- Sistemas de decision con abtencion: gracias al umbral de confianza, puede integrarse como componente que delega en revision humana cuando la probabilidad no alcanza el umbral, reduciendo falsos positivos en entornos sensibles.
- Evaluacion de robustez al orden de candidatos: el adaptador reduce la discrepancia por orden de candidatos del 22,00 % al 1,83 % en escenarios finales, lo que lo hace util en pipelines donde el orden de las opciones no deberia alterar la decision.
- Simulacion de produccion: con las particiones de simulacion (200) y adversariales (200) documentadas, permite reproducir escenarios operativos antes de desplegar una logica de decision en un servicio real.
- Prototipado de servicios HTTP locales: el runtime openjeff.serve levanta un servicio serial en un puerto local para validar el flujo completo (candidatos, evidencia, lectura de probabilidades) sin dependencias externas.

## Benchmarks y rendimiento

Datos reportados en la model card del autor:

| Medida | Base | OpenJeff |
|---|---:|---:|
| Exactitud final sintetica (600) | 79,67 % | 97,50 % |
| ECE calibrado final sintetico (15 bins) | 0,0554 | 0,0137 |
| Discrepancia por orden de candidatos en escenarios finales | 22,00 % | 1,83 % |
| Exactitud JevBench publico (231) | 70,13 % | 90,04 % |
| Exactitud JevBench publico dificil (111) | 42,34 % | 80,18 % |
| ECE dificil publico (10 bins) | 0,2756 | 0,1417 |

La ganancia de exactitud final sintetica es de 17,83 puntos porcentuales, con intervalo bootstrap pareado del 95 % de [14,67; 20,83]. En los 403 estados finales que no coinciden con estados de entrenamiento, OpenJeff obtiene un 96,28 % frente al 75,93 % del base. Frente a las salidas publicadas de Jev 1.13.0 sobre los mismos 231 identificadores (86,58 % y 72,97 % en el subconjunto dificil), Jev no se reejecuto en este estudio y los prompts y runtimes difieren; el autor no lo presenta como ranking oficial ni como comparacion exhaustiva de benchmarks.

## Requisitos de hardware

- El runtime de referencia y el calibrador estan vinculados a una A100 SXM 80 GB; cargar los pesos en otro dispositivo no valida las probabilidades calibradas y exigiria recalibrar.
- El fundamento gemma-4-12B-it en BF16 ocupa aproximadamente 24 GB solo en pesos (estimacion a partir del tamano de 12.000 millones de parametros); el adaptador anade 21,3 millones de parametros en float32 (unos 85 MB).
- En GPUs consumer de 24 GB (RTX 4090, RTX 3090) el fundamento en BF16 es marginal y puede no caber con el contexto y las activaciones; en 16 GB o menos no cabria sin cuantizacion.
- Opciones de despliegue: el proyecto proporciona un servicio HTTP serial local (openjeff.serve) con instrucciones de lanzamiento en un contenedor PyTorch CUDA documentado. Al ser un adaptador PEFT, es compatible con librerias que carguen fundamentos y adaptadores (por ejemplo transformers con PEFT). No se documentan recetas para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de adaptadores directamente comparables en la informacion proporcionada. La referencia mas cercana es el propio modelo base frente al adaptador, junto con las salidas publicadas de Jev 1.13.0:

| Modelo | Tipo | Parametros | Contexto | JevBench (231) | JevBench dificil (111) | Licencia |
|---|---|---|---|---|---|---|
| google/gemma-4-12B-it (base) | Transformer decoder-only | 12.000 M | no disponible | 70,13 % | 42,34 % | licencia upstream de Google |
| OpenJeff-pilot-v1 (adaptador) | LoRA sobre el base | 21,3 M entrenables | 1.536 tokens de entrada en servicio | 90,04 % | 80,18 % | apache-2.0 (artefactos propios) |
| Jev 1.13.0 (salidas publicadas) | no disponible | no disponible | no disponible | 86,58 % | 72,97 % | no disponible |

## Limitaciones y advertencias

- No es un modelo fundacional: el repositorio solo contiene el adaptador; hay que descargar el fundamento gemma-4-12B-it por separado bajo sus propios terminos.
- No realiza generacion de texto general; el autor indica expresamente que esa no es la tarea evaluada.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Riesgo de alucinacion: no se cuantifica, pero se trata de un modelo de decision probabilistica que puede errar; la politica de umbral 0,9 es de abstencion y no garantiza exactitud.
- Limitacion de idioma: solo ingles (en).
- Limitacion de contexto: el prototipo de servicio opera con 1.536 tokens de entrada; no se documenta una longitud de contexto mayor.
- Solapamiento de datos: 197 de 600 estados finales coinciden con estados de entrenamiento y los estados de ajuste de calibracion tambien reaparecen en evaluacion; los templates y patrones logicos se comparten, por lo que no hay garantia de contencion semantica ni deduplicacion.
- Restriccion de calibracion: los artefactos de calibracion estan ligados al scorer, los pesos, el prompt, las versiones de paquetes y el modelo de GPU; cambiar ese entorno exige recalibrar. Las probabilidades no son validas fuera de ese entorno.
- Licencia: el adaptador es apache-2.0, pero el fundamento y el material de terceros conservan sus licencias y avisos (consultar NOTICE y las instantaneas fijadas del origen).
- Advertencia sobre validacion: las tareas ancladas en reglas son tambien resolubles con programas deterministas; el resultado valida la adaptacion, no la necesidad de sustituir dichos programas por un LLM.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/greyecho/openjeff-pilot-v1
- Codigo y ejecuciones reproducibles: https://github.com/greyaperez/openjeff
- Instrucciones de uso del runtime: https://github.com/greyaperez/openjeff/blob/main/docs/using-openjeff.md
- Entrega al evaluador (JevBench): https://github.com/greyaperez/openjeff/blob/main/docs/jevbench-submission.md
- Apoyo opcional al proyecto: https://github.com/sponsors/greyaperez
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
