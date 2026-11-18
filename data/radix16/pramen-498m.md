# radix16/pramen-498m

## Resumen

Pramen 498M es un decompilador neuronal especializado que convierte el ensamblador de una funcion individual de vuelta a codigo C. Lo desarrolla el autor independiente radix16 y se publica bajo licencia Apache 2.0. A diferencia de la mayoria de modelos de codigo, no se ha entrenado con lenguaje natural: es un transformer decoder-only estilo GPT-2 entrenado desde cero exclusivamente con pares de ensamblador y C, con su propio tokenizador de 16 384 tokens. Su nicho es el ecosistema Windows/DOS (MSVC, Open Watcom, Microsoft C 5.1, Digital Mars) en lugar de Linux/GCC.

La version 498M es la variante grande de la familia Pramen; la pequena (223M) comparte interfaz y tokenizador. La arquitectura es un transformer decoder-only de 24 capas y dimension 1 280, con 498 475 520 parametros, entrenado sobre 3 000 millones de tokens de ensamblador a C. Cubre 17 variantes de toolchain y modo de compilacion, incluidas las nuevas de DOS de 32 bits (DOS/4GW), Microsoft C 5.1 y Digital Mars para DOS de 16 bits.

Es relevante para ingenieria inversa, analisis de malware, recuperacion de codigo fuente perdido y arqueologia de software de los anos 80 y 90, un terreno donde los decompiladores clasicos (IDA, Ghidra) exigen intervencion manual y los LLM generalistas rinden mal por falta de datos de entrenamiento especificos. El modelo produce una *propuesta* de C: suele compilar y a menudo acierta la estructura, pero los nombres son inventados, los tipos se adivinan y la logica debe revisarse.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo GPT-2 |
| Parametros totales | 498 475 520 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp32 (2,0 GB) e int8 (0,6 GB) |
| Idiomas soportados | codigo (ensamblador x86/x86-64/DOS y C); sin lenguaje natural |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria PyTorch) |
| Capas / dimension | 24 capas x 1 280 |
| Tokenizador | propio, 16 384 tokens (compartido con pramen-223m) |
| Datos de entrenamiento | 3 000 millones de tokens ensamblador -> C |
| Variantes de toolchain | 17 (MSVC x64/x86, Open Watcom DOS 16/32 bits, Microsoft C 5.1, Digital Mars) |
| Tamano del repo | 2,6 GB |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only denso de estilo GPT-2 con 24 capas y dimension de modelo 1 280, entrenado desde cero sin inicializacion a partir de un modelo de lenguaje natural. El entrenamiento se realizo sobre 3 000 millones de tokens de pares ensamblador-C, generados a partir de funciones compiladas con las toolchains objetivo (MSVC en x64 y x86 con distintos niveles de optimizacion, Open Watcom en modos DOS de 16 y 32 bits, Microsoft C 5.1 y Digital Mars). No se documenta en la informacion disponible el uso de RLHF, DPO ni decodificacion especulativa.

La innovacion principal no es arquitectonica sino de dominio: un tokenizador propio de 16 384 tokens adaptado a ensamblador y C, y una cobertura deliberada de toolchains del mundo Windows/DOS que los modelos generalistas no ven en sus datos. El modelo admite un mecanismo de contexto opcional (`--context`) para inyectar declaraciones de tipos (por ejemplo, cabeceras C) y una decodificacion por candidatos (`--candidates 8`) que genera varias propuestas y selecciona la mejor, lo que eleva notablemente la tasa de re-exito frente a la decodificacion greedy.

## Capacidades

- Descompilacion de funciones de ensamblador a C para 17 variantes de toolchain y modo de compilacion (MSVC x64/x86, Open Watcom DOS 16 y 32 bits, Microsoft C 5.1, Digital Mars).
- Generacion de codigo C que compila como C17 con cabeceras estandar en la mayoria de los casos.
- Reconstruccion de estructura de funciones: bucles, condicionales, llamadas y manejo de registros.
- Uso de declaraciones externas (`--context`) para mejorar la fidelidad de tipos en funciones que operan sobre structs.
- Decodificacion por multiples candidatos (`--candidates 8`) con seleccion de la mejor propuesta.
- Interfaz de linea de comandos y UI web local (`python -m pramen.web`) con ejemplos incluidos.
- Cuantizacion int8 lista para usar (copia `int8/`, 0,6 GB) para despliegue en CPU.
- No soporta lenguaje natural, tool calling, agentes, vision ni audio: su unico dominio es ensamblador y C.

## Casos de uso

- Ingenieria inversa de binarios Windows: dada una funcion en ensamblador x64 de MSVC, el modelo propone C equivalente que el analista revisa, acelerando la comprension de rutinas ofuscadas o sin simbolos.
- Analisis de malware: reconstruir la logica de funciones sospechosas compiladas con MSVC para identificar comportamiento (red, cifrado, persistencia) sin partir de cero.
- Arqueologia de software DOS: recuperar codigo C de juegos y utilidades de los 90 compilados con Open Watcom (DOS/4GW de 32 bits) o Microsoft C 5.1, para los que apenas existen fuentes.
- Recuperacion de codigo fuente perdido: reconstruir modulos de los que solo queda el binario, usando `--context` con las cabeceras originales para mejorar tipos y firmas.
- Auditoria de seguridad de software legacy: descompilar rutinas de bibliotecas antiguas para revisar practicas inseguras (desbordamientos, manejo de buffers) en codigo sin fuentes.
- Docencia e investigacion en compiladores: generar pares ensamblador-C para estudiar optimizaciones de MSVC u Open Watcom comparando la salida con el C propuesto.
- Integracion en pipelines de analisis: ejecutar el modelo por lotes sobre funciones extraidas de un binario y volcar propuestas de C para revision humana posterior.

## Benchmarks y rendimiento

Resultados publicados por el autor. HumanEval-C y MBPP-C provienen de LLM4Binary/decompile-eval (CC0), recompilados con las mismas toolchains que los datos de entrenamiento. Una tarea cuenta como resuelta si el C descompilado compila como C17 y pasa los tests originales (re-ejecutabilidad). Maximo 600 tokens nuevos.

HumanEval-C (205 tareas, 196-203 por variante):

| Variante | 223M greedy | 498M greedy | 223M candidatos 8 | 498M candidatos 8 |
|---|---|---|---|---|
| msvc-x64-Od | 57,1 % | 60,6 % | 72,9 % | 75,9 % |
| msvc-x64-O2 | 29,2 % | 33,7 % | 39,1 % | 44,1 % |
| msvc-x86-Od | 56,7 % | 55,2 % | 70,0 % | 70,4 % |
| dos16-small-od | 41,8 % | 50,5 % | 55,1 % | 58,2 % |
| dos16-large-ox | 22,3 % | 27,4 % | 31,0 % | 38,1 % |
| Media | 41,4 % | 45,5 % | 53,6 % | 57,3 % |

MBPP-C (primeras 400 tareas, 338-357 utiles por variante, greedy):

| Variante | 223M | 498M |
|---|---|---|
| msvc-x64-Od | 57,3 % | 57,9 % |
| msvc-x64-O2 | 30,1 % | 30,9 % |
| msvc-x86-Od | 56,6 % | 55,5 % |
| dos16-small-od | 44,0 % | 50,7 % |
| dos16-large-ox | 27,5 % | 29,3 % |
| Media | 43,1 % | 44,9 % |

ExeBench retenido (funciones nunca vistas en entrenamiento, greedy, sin declaraciones):

| Conjunto | Coincidencia exacta | Compila |
|---|---|---|
| 223M, 10 variantes originales (1 431 pares) | 26,3 % | 46,5 % |
| 498M, 10 variantes originales (1 431 pares) | 29,4 % | 50,2 % |
| 498M, 7 variantes DOS nuevas (1 898 pares) | 39,4 % | 65,6 % |

Por variante nueva (exacto / compila): `dos32-od` 38 / 63 %, `dos32-ox` 35 / 57 %, `dos16-msc-small-od` 51 / 88 %, `dos16-msc-small-ox` 54 / 85 %, `dos16-msc-large-ox` 46 / 85 %, `dos16-dmc-small-o` 41 / 71 %, `dos16-dmc-large-o` 47 / 76 %.

## Requisitos de hardware

- VRAM estimada: fp32 ocupa 2,0 GB de pesos; con cache KV y overhead de ejecucion, unos 3-4 GB de VRAM son suficientes en fp32. La version int8 ocupa 0,6 GB de pesos.
- GPU recomendadas: cualquier GPU consumer moderna con al menos 4 GB de VRAM (RTX 3060, RTX 4060, RTX 4090) es suficiente; tambien funciona en A100/H100 aunque el modelo es pequeno para ellas.
- Cabe en GPU consumer: si, con holgura, en cualquier tarjeta con 4 GB o mas en fp32 e int8.
- CPU: funciona, pero el autor indica que es aproximadamente el doble de lento que el modelo de 223M en CPU. El 223M es la opcion recomendada para portatiles.
- Despliegue: el repositorio incluye su propio runtime PyTorch (`python -m pramen ...`) con requisitos torch, tokenizers y safetensors, ademas de una UI web (`python -m pramen.web`). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: el autor indica "unos segundos por funcion" en GPU; no se publican cifras detalladas de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | HumanEval-C (candidatos 8) | Variantes | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| pramen-498m | 498 M | no disponible | 57,3 % (media) | 17 | Apache 2.0 | Hugging Face |
| pramen-223m | 223 M | no disponible | 53,6 % (media) | 10 | Apache 2.0 | Hugging Face |
| Decompiladores clasicos (IDA, Ghidra) | no aplica | no aplica | no disponible | amplia | propietaria / open source | comercial / open source |

Frente a los decompiladores clasicos basados en reglas, Pramen genera C mas legible a nivel de funcion pero no sustituye el analisis estructural completo de un binario: su salida es una propuesta que debe revisarse. No se dispone de comparativas publicadas con LLM generalistas en tareas de descompilacion en la informacion proporcionada.

## Limitaciones y advertencias

- La salida es una propuesta, no una descompilacion verificada: los nombres de variables y funciones son inventados (no estan en el binario), los tipos se adivinan y la logica debe comprobarse manualmente.
- Solo procesa una funcion cada vez; no reconstruye programas completos ni resuelve dependencias entre funciones salvo que se aporten declaraciones via `--context`.
- Rendimiento muy dependiente del nivel de optimizacion: en MSVC x64 `/O2` la tasa cae a 33,7 % greedy y 44,1 % con candidatos 8, frente a 60,6 % y 75,9 % en `/Od`. El codigo optimizado es sustancialmente mas dificil.
- Cobertura limitada a las toolchains entrenadas (MSVC, Open Watcom, Microsoft C 5.1, Digital Mars); no se documenta soporte para GCC, Clang, Borland/Turbo C ni otras.
- No entiende lenguaje natural: no admite instrucciones en prosa, solo ensamblador y, opcionalmente, declaraciones C.
- Riesgo de alucinacion: puede generar C que compila pero no reproduce el comportamiento original; por eso la metrica principal es la re-ejecutabilidad, no solo la compilacion.
- Sin datos publicados sobre sesgos, contexto maximo ni comportamiento multilingue (el unico "idioma" es codigo).
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantias sobre la correccion del codigo generado; en produccion debe tratarse como borrador sujeto a revision.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/radix16/pramen-498m
- Modelo pequeno de la familia: https://huggingface.co/radix16/pramen-223m
- Dataset de evaluacion: https://huggingface.co/datasets/LLM4Binary/decompile-eval
