# belebindahugo/rebirth-xlang-14b-gguf

## Resumen
Rebirth xlang 14B es un ajuste fino de Qwen2.5-Coder-14B-Instruct orientado a la traduccion de codigo entre lenguajes de programacion. Lo desarrolla belebindahugo como parte del proyecto Rebirth AI, un agente offline que migra proyectos de un lenguaje a otro manteniendo el comportamiento funcional. El modelo cubre 8 lenguajes (Python, JavaScript/TypeScript, Go, Java, C#, Rust, C++ y Swift) en las 56 direcciones posibles de traduccion.

La relevancia del modelo esta en su enfoque de verificacion: cada traduccion generada se valida en un sandbox Docker compilando el codigo o ejecutando los tests del proyecto destino, y solo se conserva si pasa. Esto lo diferencia de un traductor generico, ya que el modelo fue entrenado con pares de traducciones que superaron pruebas reales de jueces online.

Arquitectura transformer decoder-only de 14.770 millones de parametros, derivada de la familia Qwen2.5-Coder, con pesos cuantizados una sola vez a Q6_K en un unico GGUF de 12,1 GB. La licencia Apache-2.0 permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5-Coder-14B-Instruct, ajuste fino con LoRA fusionado) |
| Parametros totales | 14.770.033.664 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el entrenamiento uso secuencias de hasta 2.048 tokens) |
| Tipos de cuantizacion | Q6_K (unica publicada en este repo) |
| Idiomas soportados | codigo (8 lenguajes: Python, JavaScript/TypeScript, Go, Java, C#, Rust, C++, Swift) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (`rebirth-xlang-14b-v2.Q6_K.gguf`, 12.124.684.384 bytes) + `Modelfile` |

## Arquitectura y entrenamiento
El modelo parte de Qwen2.5-Coder-14B-Instruct, un transformer decoder-only con atencion causal estandar. Sobre el se aplico un LoRA de rango 16 y alpha 32 en todas las capas lineales, en bf16, durante 2 epocas (3.404 pasos, 4 h 38 min en una L40S). El adaptador se fusiono shard por shard en fp32 y se convirtio con llama.cpp antes de cuantizar a Q6_K.

Los datos de entrenamiento consisten en 14.000 filas, de las cuales se entrenaron 13.616 con longitud maxima de 2.048 tokens: 12.000 pares de traduccion en 63 direcciones (maximo 190 por direccion) y 2.000 filas en el mismo idioma del corpus Rebirth (commits de repositorios con licencia permisiva en CommitPackFT y CommitPack). Los pares se construyeron a partir de programas de CodeContests con solucion de referencia en Python 3, C++ o Java que supera 10 tests; Qwen2.5-Coder-14B-Instruct tradujo cada uno con hasta 2 reintentos y solo se conservaron las traducciones que pasaron los mismos tests (9.387 traducidas, 50,1 % verificadas). Se aplico un filtro anti-fuga eliminando problemas cuyo titulo o enunciado coincidia con el suite de evaluacion.

## Capacidades
- Traduccion de codigo entre 8 lenguajes en las 56 direcciones posibles, manteniendo comportamiento identico (funciones, tipos y resultados para las mismas entradas).
- Generacion de codigo idiomatico y moderno en el lenguaje destino usando solo la libreria estandar.
- Razonamiento sobre logica de programas de competicion: parseo de entrada, compiladores estrictos y anchos de enteros.
- Capacidad de autoreparacion indirecta via el bucle de reintentos del agente Rebirth, que reinyecta los errores de compilacion o de tests.
- Salida estructurada en un unico bloque de codigo delimitado, sin explicaciones, disenada para consumo programatico.
- Capacidades heredadas del base model (Qwen2.5-Coder-14B-Instruct) no documentadas especificamente en esta model card.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades multimodales (vision, audio): no disponibles.
- Capacidades multilingues en lenguaje natural: no disponibles (el modelo esta orientado a codigo).

## Casos de uso
- Migracion de modulos Python a Go en pipelines de backend: el modelo traduccion de un archivo completo manteniendo firmas y semantica, y el agente Rebirth valida la compilacion antes de aceptar el resultado.
- Portabilidad de librerias C++ a Rust para proyectos que buscan memory safety: la traduccion idiomatica con libreria estandar permite obtener un borrador funcional que luego se revisa manualmente.
- Conversion de scripts JavaScript a TypeScript en bases de codigo legacy: el modelo maneja ambos lenguajes como direccion de traduccion y preserva la logica de tipos.
- Migracion de utilidades Java a C# en entornos corporativos que cambian de stack: la validacion por compilacion en sandbox reduce el riesgo de errores silenciosos.
- Reescritura de soluciones competitivas entre lenguajes para study groups o plataformas de formacion: el entrenamiento sobre CodeContests lo hace especialmente adecuado para programas con stdin/stdout y restricciones de juez online.
- Traduccion de funciones Python a Swift para apps moviles o de escritorio: util para equipos que prototipan en Python y necesitan portar logica a plataformas Apple.
- Automatizacion de refactorizaciones multi-lenguaje en CI/CD: integrable como paso previo a la compilacion, con verificacion automatica de que el codigo destino pasa los tests del proyecto.

## Benchmarks y rendimiento
Todas las ejecuciones se hicieron en local, servidas tal como se distribuye el modelo (Ollama, Q6_K), sobre las mismas traducciones para cada modelo.

| Suite | Traducciones | Qwen2.5-Coder-14B Q6_K | Este modelo |
|---|---:|---:|---:|
| Programs (56 direcciones) | 931 | 551 (59,2 %) | 667 (71,6 %) |
| HumanEval (56 direcciones) | 2.229 | 2.030 (91,1 %) | 2.065 (92,6 %) |

Los programas evaluados son programas completos de Codeforces (20-150 lineas, stdin a stdout) de los splits valid y test de CodeContests, nunca vistos en entrenamiento, juzgados con 10 tests cada uno y hasta 2 reintentos. HumanEval se juzgo con los tests de MultiPL-E / HumanEval, solo en el primer intento. El adaptador aplicado en tiempo de ejecucion en lugar de fusionado obtiene 672 y 2.064, lo que indica que la fusion no cuesta nada mas alla del ruido entre ejecuciones. Fusionado, genera un 24 % mas rapido en una RX 7800 XT (40,5 frente a 32,7 tokens/s).

## Requisitos de hardware
- VRAM estimada: aproximadamente 12 GB para el GGUF Q6_K, mas espacio para el contexto.
- Cabe en GPU de consumo de 16 GB (por ejemplo, RX 7800 XT, RTX 4060 Ti 16 GB, RTX 4070 Ti Super 16 GB).
- GPU profesionales recomendadas: L40S (usada para el entrenamiento), A100, H100 para despliegues de mayor throughput.
- Opciones de despliegue: Ollama (via `Modelfile` incluido) es el metodo documentado; llama.cpp es compatible por el formato GGUF; vLLM y TGI no estan documentados para este artefacto.
- Throughput medido: 40,5 tokens/s en RX 7800 XT con pesos fusionados; 32,7 tokens/s con adaptador aplicado en tiempo de ejecucion.
- Latencia: no disponible de forma absoluta; depende de la longitud del codigo y del hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en traduccion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Rebirth xlang 14B (este) | 14,77 B | no disponible (entrenado a 2.048) | 71,6 % Programs, 92,6 % HumanEval | Apache-2.0 | GGUF Q6_K |
| Qwen2.5-Coder-14B-Instruct (base) | 14,77 B | no disponible en esta ficha | 59,2 % Programs, 91,1 % HumanEval | Apache-2.0 | Multiples formatos |
| Alternativas especializadas en traduccion de codigo | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa directa disponible se limita al modelo base, ya que la model card no reporta resultados frente a otros traductores especializados.

## Limitaciones y advertencias
- El grueso del entrenamiento proviene de programas de programacion competitiva: ensenan parseo de entrada, compiladores estrictos y anchos de enteros, pero no idioms de proyecto ni frameworks.
- Solo libreria estandar: las dependencias de terceros no se mapean a equivalentes en el lenguaje destino.
- En Go, aproximadamente 1 de cada 9 borradores mezcla `bufio.Scanner` con `fmt.Fscan` sobre la misma entrada; el bucle de reintentos de Rebirth normalmente lo corrige.
- Riesgo de alucinacion en APIs no estandar o en patrones de framework no vistos en entrenamiento.
- El contexto de entrenamiento esta limitado a 2.048 tokens; archivos muy grandes pueden excederlo y degradar la calidad.
- El modelo esta orientado a codigo; no se documentan capacidades de lenguaje natural ni multilingues fuera del codigo.
- La licencia Apache-2.0 permite uso comercial, pero los datos derivados de CodeContests son CC BY 4.0 con atribucion requerida a DeepMind (Li et al. 2022) y a los repositorios de CommitPackFT/CommitPack.
- Las traducciones deben revisarse manualmente aunque pasen la verificacion automatica; la validacion cubre tests y compilacion, no correccion semantica completa.
- El modelo tiene 0 descargas y 0 likes en Hugging Face en el momento de la ficha, lo que indica falta de validacion comunitaria independiente.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/belebindahugo/rebirth-xlang-14b-gguf
- Repositorio Rebirth AI: https://github.com/hugobelebinda/rebirth-ai
- Modelo base Qwen2.5-Coder-14B-Instruct: https://huggingface.co/Qwen/Qwen2.5-Coder-14B-Instruct
- Dataset CodeContests: https://huggingface.co/datasets/deepmind/code_contests
- Dataset CommitPackFT: https://huggingface.co/datasets/bigcode/commitpackft
- Dataset CommitPack: https://huggingface.co/datasets/bigcode/commitpack
- Paper AlphaCode (Li et al. 2022): https://arxiv.org/abs/2203.07814
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
- MultiPL-E: https://github.com/nuprl/MultiPL-E
