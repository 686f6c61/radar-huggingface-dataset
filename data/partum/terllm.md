# partum/terllm

## Resumen

terllm es una familia de modelos pequenos especializados en autocompletar comandos de shell mientras el usuario escribe, al estilo del "ghost text" de zsh-autosuggestions o fish. Lo desarrolla el usuario partum y parte de un fine-tune de HuggingFaceTB/SmolLM2-135M, un transformer decoder-only de aproximadamente 134,5 millones de parametros. El problema que resuelve es concreto: predecir la continuacion del comando que se esta tecleando en una terminal, usando el contexto del directorio actual, el contenido listado, el estado de git, variables de entorno, el historial reciente y los candidatos de autocompletado por tabulador.

La relevancia de terllm no esta en su tamano, sino en su enfoque de despliegue local y baja latencia. El autor reporta unos 25 ms por pulsacion de tecla en CPU usando la cuantizacion Q4_K_M de llama.cpp, lo que lo hace viable como proceso residente que sugiere texto en tiempo real sin salir de la maquina del usuario. El modelo no ejecuta nada por si mismo: actua exclusivamente como motor de sugerencias.

El repositorio publica dos versiones evolutivas del mismo modelo. La v2 introdujo los candidatos de historial (`<|cand|>`) y la v3 anade el bloque `<|fs|>` con hasta ocho candidatos de tabulador (archivos, directorios y comandos del PATH), lo que dispara la precision en rutas de un 33% a un 73,5% en la prueba sintetica de rutas. Se distribuye con pesos en safetensors (bf16) y en GGUF Q4_K_M, bajo licencia Apache 2.0 y con soporte solo para ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (fine-tune de SmolLM2-135M) |
| Parametros totales | 134.551.872 (~135 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el modelo base SmolLM2-135M no se especifica en la informacion proporcionada) |
| Tipos de cuantizacion | GGUF Q4_K_M; safetensors en bf16 |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16) y GGUF (Q4_K_M) |

## Arquitectura y entrenamiento

terllm es un fine-tune de HuggingFaceTB.SmolLM2-135M, por lo que hereda una arquitectura transformer decoder-only de ~135 millones de parametros. No se documenta en la informacion disponible ningun cambio estructural respecto al modelo base, ni tecnicas de atencion alternativa, decodificacion especulativa o mezcla de expertos. El modelo se usa con `transformers` (cargando el subfolder `v3` o `v2`) o a traves de llama.cpp con el GGUF.

El entrenamiento se basa en datos sinteticos generados y ejecutados en un simulador de shell y git, de forma que los codigos de salida, el stderr y el estado del arbol de archivos son coherentes. Las fuentes combinan escenarios semilla, sesiones propuestas por un LLM (Qwen2.5-Coder) que se reejecutan en el simulador, y pares texto-a-comando derivados de tldr-pages (CC BY 4.0) y NL2Bash (MIT). El autor indica explicitamente que no se uso historial de shell personal para el entrenamiento. El prompt de inferencia es texto plano con tokens especiales (`<|cwd|>`, `<|ls|>`, `<|git|>`, `<|env|>`, `<|hist|>`, `<|cand|>`, `<|fs|>`, `<|cmd|>`, `<|err|>`, `<|out|>`, `<|nl|>`, `<|end|>`), y la salida se trunca al prefijo confiable (tokens con probabilidad >= 0,8) segun la politica del runtime.

## Capacidades

- Autocompletado de comandos de shell en tiempo real: continua el prefijo tecleado y cierra con `<|end|>`.
- Uso de contexto de entorno: directorio actual, listado de archivos, estado de git, variables de entorno e historial reciente con codigos de salida.
- Sugerencia basada en candidatos: en v3 incorpora hasta ocho candidatos de tabulador (archivos, directorios y comandos del PATH) y decide si copiar uno, inventar un nombre nuevo (por ejemplo para `mkdir` o ramas) o detenerse.
- Aprovechamiento de historial previo: `<|cand|>` reutiliza comandos anteriores que extienden el prefijo tecleado.
- Soporte opcional de peticiones en lenguaje natural mediante `<|nl|>`, que permite convertir una solicitud en texto a un comando.
- Tolerancia a salida previa: `<|err|>` y `<|out|>` permiten condicionar la sugerencia con el resultado del ultimo comando.
- Control de confianza de la salida: solo se muestran los tokens por encima del umbral de 0,8.

No se documenta soporte de tool calling, function calling, agentes, vision ni audio.

## Casos de uso

- Autocompletado en zsh o fish: integrar el modelo en un plugin o demonio residente (`runtime/terllmd.py`) que ofrezca texto fantasma mientras se escribe, reduciendo pulsaciones. El autor reporta un 18,4% de caracteres ahorrados en una sesion real de 150 comandos.
- Sugerencia de rutas y nombres de archivo: usar el bloque `<|fs|>` para proponer rutas concretas basadas en el listado real del directorio y en los candidatos de tabulador, con un 73,5% de coincidencia exacta en la prueba sintetica de rutas.
- Asistencia en flujos de git: completar comandos de `git` teniendo en cuenta la rama actual, el remoto y el estado de archivos sin seguimiento o modificados, segun el contexto `<|git|>`.
- Creacion de archivos y directorios: proponer nombres nuevos coherentes cuando la orden es `mkdir` o similar, en lugar de limitarse a copiar candidatos existentes.
- Recuperacion de comandos del historial: reutilizar comandos previos que encajan con el prefijo tecleado, al estilo zsh-autosuggestions, pero con contexto adicional de estado.
- Terminales remotas o entornos sin GPU: al ejecutarse en CPU con Q4_K_M y ocupar unos 105 MB, puede desplegarse en portatiles, contenedores ligeros o servidores de baja capacidad.
- Traduccion de lenguaje natural a comando (uso opcional): a traves de `<|nl|>`, convertir una peticion breve en texto a un comando de shell propuesto como sugerencia.
- Educacion y onboarding en linea de comandos: mostrar al usuario novel la continuacion probable del comando y reducir la necesidad de consultar documentacion externa.

## Benchmarks y rendimiento

La model card incluye evaluaciones propias del autor, no benchmarks estandar tipo MMLU o HumanEval. Se reproducen tal cual:

| Metrica | v2 | v3 |
|---|---|---|
| Caracteres ahorrados en historial real de zsh (150 comandos, cwd desconocido, umbral 0,8) | 15,8% | 18,4% (con `<|fs|>`) |
| Coincidencia exacta, sonda sintetica de rutas (nombres nuevos) | 33% | 73,5% |
| Coincidencia exacta, validacion sintetica (sin bloques `<|fs|>`) | 60,8% | 60-61% |

Referencia del propio autor: el emparejamiento por prefijo de historial (zsh-autosuggestions) ahorra un 0,4% en los mismos comandos. La muestra de historial real es pequena (aproximadamente +-1-2 puntos) y con poco contexto, y no se ha validado en uso en vivo. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 105 MB con GGUF Q4_K_M y del orden de 270 MB con safetensors en bf16 (134,5 M parametros a 2 bytes), mas el overhead del runtime y el contexto.
- GPU recomendadas: no se especifican; dado el tamano, cualquier GPU consumer moderna es mas que suficiente y no es el escenario objetivo.
- Cabe en GPU consumer: si, en cualquier GPU con al menos ~1 GB de memoria libre; tambien funciona en CPU.
- CPU: el autor reporta ~25 ms por pulsacion de tecla en CPU con Q4_K_M, que es el modo de despliegue de referencia.
- Opciones de despliegue: llama.cpp con el GGUF, `transformers` con AutoModelForCausalLM y AutoTokenizer (subfolder `v3` o `v2`), y el demonio de referencia `runtime/terllmd.py` del repositorio de GitHub.
- Latencia y throughput: solo se documenta la latencia de ~25 ms por pulsacion en CPU; no hay datos de throughput ni de latencia en GPU.
- Contexto adicional de despliegue: la v2 puede ejecutarse con el demonio en modo `--no-fs`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| partum/terllm (v3) | ~135 M | No disponible | 18,4% caracteres ahorrados en historial real; 73,5% en sonda de rutas | Apache 2.0 | HuggingFace (safetensors y GGUF) |
| partum/terllm (v2) | ~135 M | No disponible | 15,8% caracteres ahorrados; 33% en sonda de rutas | Apache 2.0 | HuggingFace (safetensors y GGUF) |
| HuggingFaceTB/SmolLM2-135M | ~135 M | No disponible en la informacion proporcionada | No disponible | No disponible en la informacion proporcionada | HuggingFace |
| zsh-autosuggestions (referencia no neuronal) | No aplica | No aplica | 0,4% caracteres ahorrados en la misma muestra | No disponible en la informacion proporcionada | Repositorio publico |

No se dispone de datos de otros modelos comparables de la misma categoria (autocompletado de shell) en la informacion proporcionada.

## Limitaciones y advertencias

- Ambito muy estrecho: esta disenado exclusivamente para autocompletar comandos de shell; no es un modelo de proposito general ni de conversacion.
- Solo ingles: los datos y el tokenizador estan orientados a ingles, sin soporte declarado de otros idiomas.
- Calidad dependiente del escenario: en formas de comando o de arbol de directorios fuera de los escenarios de entrenamiento, las sugerencias de rutas son notablemente mas debiles, y a veces el modelo ignora un candidato unico y obvio.
- Muestra de evaluacion limitada: el historial real usado para medir el ahorro de caracteres tiene solo 150 comandos, con poca informacion de contexto, y no se ha validado en uso en vivo.
- Riesgo de sugerencia incorrecta: al ser un motor de sugerencias puede proponer comandos erroneos o incompletos; el autor recomienda tratarlo como sugeridor y no como ejecutor, y nunca ejecuta nada por si mismo.
- Latencia en CPU: los ~25 ms por pulsacion son una referencia del autor con Q4_K_M; pueden variar segun el hardware.
- Restricciones de licencia: el modelo se distribuye bajo Apache 2.0, lo que en principio permite uso comercial, pero los datos derivados de tldr-pages (CC BY 4.0) y NL2Bash (MIT) imponen condiciones de atribucion que conviene revisar en `data/SOURCES.md` antes de un uso en produccion.
- Trazabilidad de versiones: la v3 cambia el formato de prompt respecto a la v2 (anade `<|fs|>`), por lo que prompts construidos a mano para una version no son portables a la otra sin ajustes.
- Repositorio con 0 descargas y 0 "likes" en el momento de la consulta y fecha de creacion posterior a la actual, lo que sugiere baja adopcion y posible falta de validacion externa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/partum/terllm
- Repositorio de codigo, generador de datos, plugin de zsh y demonio: https://github.com/partum55/terllm
- Modelo base SmolLM2-135M: https://huggingface.co/HuggingFaceTB/SmolLM2-135M
- tldr-pages: https://github.com/tldr-pages/tldr
- NL2Bash: https://github.com/TellinaTool/nl2bash
- Fuentes y licencias de los datos de entrenamiento: `data/SOURCES.md` en el repositorio de GitHub
- Nota sobre la busqueda web: los resultados devueltos (Wikipedia sobre el post-parto, Wepartum, Definitions.net) no guardan relacion con el modelo y no aportan informacion tecnica utilizable.
