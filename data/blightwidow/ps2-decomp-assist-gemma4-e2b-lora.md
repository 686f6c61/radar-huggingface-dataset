# blightwidow/ps2-decomp-assist-gemma4-e2b-lora

## Resumen

`ps2-decomp-assist-gemma4-e2b-lora` es un conjunto de dos adaptadores LoRA (rango 32) sobre el modelo base `mlx-community/gemma-4-e2b-it-bf16`, desarrollado por el usuario Blightwidow. Su funcion es traducir ensamblador MIPS R5900 (Emotion Engine de PlayStation 2) a C++ para funciones pequenas, de hasta 400 bytes, dentro de proyectos de descompilacion. Forma parte de la herramienta CLI `ps2-decomp-assist`, que valida cada candidato generado con el compilador y el comparador del propio proyecto de descompilacion: la salida del modelo es una propuesta, no una coincidencia verificada.

El modelo resuelve un problema muy concreto del ambito del reverse engineering: reducir el trabajo manual de reescribir funciones de ensamblador a C++ que coincida byte a byte con el binario original. Se distribuye como adaptadores LoRA sobre un Gemma 4 E2B (variante eficiente de 2B parametros), en formato MLX y bf16, con licencia Apache 2.0. El repositorio ocupa 0,4 GB. Es relevante para equipos que mantienen ports nativos de juegos de PS2 y necesitan acelerar la descompilacion asistida por IA sin renunciar a la verificacion estricta de cada resultado.

El entrenamiento y la evaluacion se limitaron exclusivamente a Sly Cooper and the Thievius Raccoonus y Sly 2 (NTSC-U), compilados con SN GCC 2.95.3. No hay datos publicados sobre otros juegos ni otros compiladores. La model card lo describe como herramienta no oficial de fans, sin afiliacion con Sony Interactive Entertainment, Sucker Punch Productions ni Google.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (rango 32) sobre transformer Gemma 4 E2B instruct |
| Parametros totales | no disponible (modelo base Gemma 4 E2B; los adaptadores LoRA no declaran recuento) |
| Parametros activos | no disponible |
| Longitud de contexto | 2.048 tokens (longitud de secuencia usada en entrenamiento) |
| Tipos de cuantizacion | bf16 en entrenamiento; adaptadores MLX; no se documentan otras cuantizaciones |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | adaptadores LoRA en formato MLX (libreria `mlx`) |

## Arquitectura y entrenamiento

El modelo base es un transformer Gemma 4 E2B instruct; sobre el se aplican dos adaptadores LoRA de rango 32 sobre todas las proyecciones de atencion y MLP. El entrenamiento usa `mask-prompt` (la perdida se calcula solo sobre la funcion generada, no sobre el prompt), precision bf16 y secuencias de 2.048 tokens. Hay dos adaptadores: `t1/` para traduccion (entrada: juego, identificador de funcion, tamano, contexto de declaraciones y ensamblador; salida: la funcion C++) y `repair/` para reparacion (misma entrada mas un `CANDIDATE:` fallido y su `DIFF:` con la diferencia de instrucciones o el error del compilador; salida: la funcion corregida). `repair/` continua a partir de `t1/` y se entreno con una mezcla de ejemplos de reparacion y de traduccion.

Los datos de `t1/` son todas las funciones de entrenamiento limpias segun las reglas de los dos juegos (5.503 ejemplos), aproximadamente 3 epocas en una ejecucion reanudada tras una interrupcion. `repair/` usa 4.768 ejemplos de reparacion (3.170 fallos del modelo minados y 2.239 mutaciones sinteticas de codigo correcto) mas 2.500 ejemplos de traduccion. La perdida de validacion fue 0,181 en `t1/` y 0,131 en el conjunto mixto de `repair/`. No se documenta RLHF ni DPO. Los pares de entrenamiento se generaron a partir de imagenes de disco propiedad de los autores y de su propio codigo descompilado; no se distribuye ningun dato de disco, ensamblador ni dataset.

## Capacidades

- Traduccion de ensamblador MIPS R5900 (PS2 EE) a C++ para funciones de hasta 400 bytes.
- Reparacion iterativa de candidatos fallidos a partir del diff de instrucciones o del error del compilador.
- Generacion de texto condicionada por contexto de declaraciones y metadatos de la funcion.
- Uso mediante CLI (`scripts/decomp-assist`) o directamente con `mlx_lm.generate` y la plantilla de chat, con el modo thinking desactivado.
- No se documentan capacidades de tool calling, agentes, vision, audio ni multilingues mas alla del uso especifico de traduccion de codigo.

## Casos de uso

- Descompilacion asistida de funciones de PS2: dado el ensamblador de una funcion de hasta 400 bytes y el contexto de declaraciones, el modelo propone un C++ candidato que la CLI verifica despues con el compilador y el comparador del proyecto.
- Reparacion de candidatos que no coinciden: cuando la salida de `t1/` falla la comparacion byte a byte, `repair/` recibe el candidato y el diff de instrucciones y genera una version corregida que se vuelve a verificar.
- Aceleracion de ports nativos de Sly Cooper y Sly 2: los equipos que mantienen descompilaciones de estos titulos pueden reducir el tiempo manual de reescritura de funciones pequenas, dejando la validacion final al pipeline del proyecto.
- Integracion en pipelines de CI de descompilacion: la CLI puede ejecutarse por lotes sobre funciones pendientes y descartar candidatos que no compilen o no coincidan, encajando en flujos automatizados de verificacion.
- Investigacion sobre traduccion de codigo maquina a codigo fuente: el par de adaptadores (traduccion y reparacion) sirve como referencia para estudiar tecnicas de correccion iterativa con feedback de compilador.
- Generacion de borradores para revision humana: el modelo produce propuestas para funciones pequenas que un ingeniero revisa y ajusta, especialmente util en funciones de hasta 100 bytes donde la tasa EXACT@8 alcanza el 48,6%.

## Benchmarks y rendimiento

Evaluacion sobre 150 funciones de validacion retenidas, 8 muestras por funcion, coincidencia exacta byte a byte y limpieza segun reglas (el ruido en 150 funciones es de unos 3 puntos):

| Adaptador | EXACT@1 | EXACT@4 | EXACT@8 | Compila@1 |
|---|---:|---:|---:|---:|
| `t1/` | 19,8% | 26,0% | 29,3% | 68,7% |
| `repair/` como traductor | 21,5% | 27,0% | 30,0% | 66,7% |
| `t1/` seguido de una ronda de `repair/` sobre sus fallos | – | – | 36,0% | – |

Resultados por tamano de funcion (EXACT@8): hasta 100 bytes 48,6%, hasta 200 bytes 19,1%, hasta 400 bytes 3,0%. En una muestra de 20 funciones, Claude Haiku zero-shot alcanzo un 55% frente al 40% de `t1/`.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el modelo base es un Gemma 4 E2B en bf16 y el repositorio de adaptadores ocupa 0,4 GB, por lo que la inferencia requiere cargar el modelo base completo ademas de los adaptadores.
- GPU recomendadas: no disponibles en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no disponible; el runtime es MLX, orientado a Apple Silicon.
- Despliegue: `mlx_lm.generate --model mlx-community/gemma-4-e2b-it-bf16 --adapter-path <carpeta>` con la plantilla de chat y thinking desactivado, o mediante la CLI `ps2-decomp-assist`, que descarga los adaptadores en la primera ejecucion.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ps2-decomp-assist-gemma4-e2b-lora | LoRA rango 32 sobre Gemma 4 E2B | 2.048 tokens | Traduccion MIPS R5900 a C++ (PS2) | Apache 2.0 | Hugging Face, formato MLX |
| Claude Haiku (zero-shot) | no disponible | no disponible | Traduccion generica de codigo | propietaria | API comercial |
| Alternativas especializadas en descompilacion PS2 | no disponible | no disponible | no disponible | no disponible | no disponible |

La unica comparacion documentada es frente a Claude Haiku zero-shot en una muestra de 20 funciones, donde Haiku obtuvo un 55% frente al 40% de `t1/`. No se dispone de datos sobre otros modelos especializados comparables.

## Limitaciones y advertencias

- Rendimiento debil en funciones de mas de 200 bytes; EXACT@8 cae al 3,0% en el rango de hasta 400 bytes.
- Alrededor de un tercio de los candidatos generados no compilan (Compila@1 del 66,7-68,7%).
- El modelo memoriza las funciones con las que se entreno; las puntuaciones sobre funciones de entrenamiento no miden habilidad real.
- Requiere el verificador del proyecto de descompilacion para cualquier afirmacion de coincidencia y la compilacion completa del proyecto antes de un commit.
- Entrenado y evaluado solo con Sly Cooper and the Thievius Raccoonus y Sly 2 (NTSC-U) y SN GCC 2.95.3; otros juegos y compiladores no estan probados.
- La salida deriva de la imagen de disco que aporte el usuario; debe mantenerse local y respetarse las normas del proyecto de descompilacion sobre publicacion de material generado.
- Riesgo de sesgo y alucinacion: no documentado de forma especifica; al ser un modelo de traduccion de codigo, el riesgo principal es generar C++ plausible pero incorrecto, que debe verificarse siempre.
- Herramienta no oficial de fans, sin afiliacion con Sony Interactive Entertainment, Sucker Punch Productions ni Google.

## Enlaces

- Hugging Face: https://huggingface.co/blightwidow/ps2-decomp-assist-gemma4-e2b-lora
- Repositorio de la CLI: https://github.com/Blightwidow/ps2-decomp-assist
- Documentacion de evaluacion: `docs/EVAL.md` dentro del repositorio
- Formatos de prompt: `pipeline/token_stats.py` y `pipeline/repair_data.py` dentro del repositorio
- Modelo base: https://huggingface.co/mlx-community/gemma-4-e2b-it-bf16
