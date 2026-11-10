# dappalumbo91/fluid-language-model

## Resumen

Fluid language model es un modelo causal de generacion de texto publicado en Hugging Face por el usuario dappalumbo91. A diferencia de los modelos de lenguaje convencionales, no opera sobre lenguaje natural: su vocabulario consta de 21 simbolos (un signo, seis operaciones y digitos), y su interfaz de entrada son identificadores de token, no frases en ingles. El modelo esta disenado especificamente para resolver operaciones aritmeticas (suma, resta, multiplicacion, division y comparaciones) sobre operandos de dos digitos, no para tareas de comprension o generacion de lenguaje.

El modelo se distribuye con la libreria transformers, pesos en safetensors y requiere `trust_remote_code=True` y `use_cache=False` en la llamada a `generate`. Segun la model card, la generacion se realiza en dos pasadas: una primera pasada aprendida (place forward) y una segunda pasada que escribe en los logits del siguiente token la cadena de valor posicional cuando la primera pasada discrepa. El autor reporta resultados exactos en el conjunto de prueba "far generate" sobre operandos del 31 al 45.

La relevancia de este modelo es experimental y de investigacion: ilustra un enfoque hibrido entre un transformer causal pequeno y un mecanismo algoritmico de aritmetica posicional embebido en el propio modelo. No es un modelo de proposito general ni compite con LLMs convencionales; su interes radica en la demostracion de que un modelo causal puede combinarse con una cadena determinista para obtener exactitud aritmetica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (causal-lm) con custom_code y segunda pasada de valor posicional |
| Parametros totales | 41.208 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el vocabulario es de 21 simbolos, no lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Libreria | transformers |
| Pipeline | text-generation |
| Tamano del repo | 0.0 GB |
| Descargas | 0 |
| Likes | 0 |
| Fecha de creacion | 2026-11-10 |
| Fecha de actualizacion | 2026-11-10 |

## Arquitectura y entrenamiento

La arquitectura es un transformer causal de 41.208 parametros con codigo personalizado (`custom_code`), pensado para operar sobre un vocabulario de 21 simbolos que representa un signo, seis operaciones y digitos. El modelo incorpora un mecanismo de dos pasadas en `generate`: la primera pasada es el "learned place forward" y, cuando los tokens generados no coinciden con la cadena de valor posicional, una segunda pasada escribe en los logits del siguiente token los tokens de dicha cadena. La model card describe que la cadena es el "offset" ya presente en el modelo, y detalla los algoritmos de suma (par de digitos, acarreo entrante y dos acarreos), multiplicacion (suma de un digito repetida, desplazamiento del parcial por su posicion y suma de parciales con el mismo offset), resta (offset inverso, con borrow final que escribe signo menos y magnitud como complemento a nueve mas uno), comparacion (lectura del signo) y division (conteo de restas hasta que la siguiente cambiaria de signo).

En cuanto al entrenamiento, la model card menciona que el modo de entrenamiento desactiva la segunda pasada, de modo que la entropia cruzada del siguiente token sigue alcanzando el "place readout". Se reporta un lote de entrenamiento de tamano 8 con perdida de siguiente token de 0,0487 y que el gradiente alcanzo el place readout. Tambien se menciona una "reward pass" sobre las filas rigidas mas suma lejana que imprimio "reward rejected 138 changed 0 improved 0". No se especifican el numero total de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO. El autor aclara que el "FSOT lattice scalar" no se invoca.

## Capacidades

- Generacion de texto en un sentido muy restringido: el modelo emite secuencias de identificadores de token sobre un vocabulario de 21 simbolos (signo, seis operaciones y digitos), no lenguaje natural.
- Aritmetica exacta de dos digitos: suma, resta, multiplicacion, division y comparaciones (mayor que, menor que), segun los resultados reportados por el autor.
- Resolucion de suma con acarreo, resta con borrow y complemento a nueve, multiplicacion por sumas repetidas con desplazamiento posicional y division por restas sucesivas.
- Segunda pasada determinista en `generate` que corrige discrepancias entre la primera pasada aprendida y la cadena de valor posicional.
- No soporta tool calling ni function calling (no se menciona en la informacion disponible).
- No soporta agentes ni razonamiento multi-paso en el sentido de los LLMs convencionales.
- No tiene capacidades multilingues: no opera sobre lenguaje natural.
- No dispone de modo thinking, vision ni audio.

## Casos de uso

- Validacion de aritmetica posicional en entornos de investigacion: el modelo puede usarse como banco de pruebas para estudiar como un transformer causal pequeno aprende el "place readout" y como una segunda pasada determinista corrige sus errores, comparando los contadores "passes kept" y "rewritten".
- Demostracion educativa de algoritmos aritmeticos embebidos: sirve para ilustrar suma con acarreo, complemento a nueve y division por restas sucesivas dentro de un modelo causal, con operandos de dos digitos.
- Reproduccion de experimentos de exactitud aritmetica: el conjunto "far generate" sobre operandos del 31 al 45 permite replicar los resultados exactos reportados (225/225 en suma, resta, multiplicacion, mayor y menor; 15/15 en division) en una RTX 5070.
- Estudio de hibridos aprendizaje-algoritmo: util para investigar como combinar pesos aprendidos con cadenas deterministas sin recurrir a RLHF, dado que el autor reporta que la reward pass no mejoro resultados ("changed 0 improved 0").
- Pruebas de integracion con transformers y `custom_code`: sirve para validar flujos de carga con `AutoModelForCausalLM`, `trust_remote_code=True` y `use_cache=False` en pipelines de evaluacion.
- Analisis de robustez de la segunda pasada: permite medir cuantas filas requiere reescritura (415 de 1140 en el experimento reportado) y estudiar la dependencia del mecanismo de correccion.

## Benchmarks y rendimiento

Resultados reportados por el autor en la model card ("far generate", operandos 31 a 45, impresos en una NVIDIA GeForce RTX 5070 el 2026-11-10, sin lineas de fallo):

| Operacion | Exactitud |
|---|---|
| Suma | 225/225 |
| Resta | 225/225 |
| Multiplicacion | 225/225 |
| Division | 15/15 |
| Mayor que | 225/225 |
| Menor que | 225/225 |

Contadores de la segunda pasada: "passes kept 725 rewritten 415" sobre 1140 filas lejanas; la primera pasada ya coincidia con la cadena en 725 filas y la segunda reescribio las otras 415. En recarga con `AutoModelForCausalLM` se reportan `35+37` = 72, `80+40` = 120, `7+7` = 14 y `8+4` = 12. La suma lejana escrita mas el otro operando fue 225/225 con ambos pasos coincidentes, y la suma lejana escrita mas 1 fue 225/225 con ambos pasos coincidentes. Un lote de entrenamiento de 8 tuvo perdida de siguiente token de 0,0487. La reward pass sobre filas rigidas mas suma lejana imprimio "reward rejected 138 changed 0 improved 0". El autor advierte que estos conteos corresponden al `generate` de dos pasadas y no a una afirmacion de que el barrido aprendido, puntuado por si solo, escriba todas las filas lejanas. No se reportan MMLU, GSM8K ni HumanEval; el autor indica explicitamente que el repositorio no ejecuta un benchmark en ingles ni reporta esas metricas.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja, dado que el modelo tiene 41.208 parametros (del orden de decenas de KB en precision completa); no se dispone de cifras oficiales de VRAM.
- GPU recomendadas: el autor reporta ejecucion en una NVIDIA GeForce RTX 5070; por el tamano, cualquier GPU consumer moderna deberia ser suficiente.
- Cabe en GPU consumer: si, practicamente en cualquier GPU consumer con suficiente soporte de CUDA y transformers.
- Opciones de despliegue: transformers con `AutoModelForCausalLM`, `trust_remote_code=True` y `use_cache=False` en `generate`; no se mencionan vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: no disponibles; el unico dato de rendimiento es la exactitud del conjunto "far generate", no tiempos.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria (modelos causales de aritmetica posicional con vocabulario de 21 simbolos). No se dispone de datos para comparar parametros, contexto, rendimiento, licencia o disponibilidad con alternativas.

## Limitaciones y advertencias

- El modelo no procesa lenguaje natural: su vocabulario es de 21 simbolos y la entrada son identificadores de token, no frases en ingles.
- No se han publicado resultados de benchmarks estandar (MMLU, GSM8K, HumanEval); el autor lo indica explicitamente.
- La exactitud reportada se limita a operandos de dos digitos en el rango 31 a 45 del conjunto "far generate"; no hay evidencia de generalizacion a otros rangos o a mas digitos.
- La segunda pasada determinista es necesaria para la exactitud reportada; el propio autor advierte que el barrido aprendido por si solo no escribe todas las filas lejanas.
- `generate` requiere `use_cache=False`, lo que limita optimizaciones de inferencia.
- Requiere `trust_remote_code=True`, con el riesgo de seguridad que implica ejecutar codigo personalizado del repositorio.
- Licencia no disponible: no puede confirmarse el uso comercial.
- Idiomas soportados no disponibles; no aplica lenguaje natural.
- Riesgo de alucinacion en el sentido convencional no aplica, pero la primera pasada puede discrepar de la cadena posicional y requiere correccion.
- La reward pass reportada no mejoro resultados ("changed 0 improved 0"), lo que sugiere limitaciones del esquema de refuerzo empleado.
- No hay informacion sobre sesgos, composicion del dataset de entrenamiento ni numero de tokens de entrenamiento.

## Enlaces

- Hugging Face: https://huggingface.co/dappalumbo91/fluid-language-model
- No se han encontrado en la informacion proporcionada otros enlaces a papers, blogs, repositorios o demos.
