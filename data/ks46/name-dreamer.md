# ks46/name-dreamer

## Resumen

name-dreamer es un modelo de lenguaje byte-level de tipo GPT decoder-only, publicado por el usuario ks46 en HuggingFace, especializado en una única tarea: generar nombres de usuario sintéticos con aspecto de identificador de inicio de sesión (login-style usernames). No es un modelo de propósito general: se trata de un modelo de dominio muy estrecho, entrenado exclusivamente sobre un corpus de 90.505.453 nombres de usuario únicos extraídos de 18 fuentes públicas. Con 56.882.688 parámetros, 8 capas, anchura de 768, 4 cabezas de atención y una capa SwiGLU de 2048, su tamaño queda en el rango de los modelos pequeños que caben holgadamente en cualquier GPU de consumo, e incluso en CPU.

Su relevancia práctica es acotada pero concreta: sirve como generador de datos sintéticos para pruebas, aumento de datos, sustitución de PII en registros y validación de sistemas de registro de usuarios. El modelo se entrenó durante 60.000 iteraciones con lotes de 512 secuencias de 128 bytes, y el autor reporta métricas de calidad medibles y reproducibles (3,5619 bits por carácter en el conjunto de validación, 100 % de muestras válidas, 100 % únicas y 93,5 % novedosas respecto al corpus). Además, se publican variantes cuantizadas a int8 e int4 con pérdida de calidad documentada, junto con un kernel en Rust (ndgen) que exporta la versión int8 para ejecución en x86-64 con AVX2.

El modelo no incluye model card traducida a otros idiomas ni declara idiomas soportados, y no se han publicado resultados en los benchmarks habituales de razonamiento o código, algo coherente con su naturaleza de modelo de dominio. La licencia es MIT, lo que permite uso comercial sin restricciones declaradas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (GPT) byte-level: 8 capas, anchura 768, 4 cabezas de atención, capa SwiGLU de 2048 |
| Parametros totales | 56.882.688 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 512 posiciones/bytes en entrenamiento (no se declara soporte de ventanas mayores) |
| Tipos de cuantizacion | fp32 (original), int8 con grupos de 64, int4 con grupos de 64, int4 con grupos de 32 (absmax simétrico por grupo, aplicado tras el entrenamiento) |
| Idiomas soportados | No declarados. El tokenizador es byte-level con vocabulario de 256 bytes, por lo que puede representar cualquier secuencia de bytes, incluido UTF-8 multibyte |
| Licencia | MIT |
| Formato de pesos | PyTorch: `ckpt.pt` (fp32, incluye modelo, optimizador, configuración e iteración), `quant-*.pt` (checkpoints con cuantización simulada). Formato propio: `model.ndq` (int8 grupo 64) para el kernel Rust. No se publican pesos en safetensors ni GGUF |
| Vocabulario | 256 bytes, con el byte 0 como token de parada |
| Tamano del repositorio | 1,4 GB |
| Fecha de publicacion en HuggingFace | 2026-09-18 (segun los metadatos del repositorio) |
| Descargas / likes | 0 / 0 en el momento de la consulta |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only estándar de tipo GPT, con normalización y capa SwiGLU de 2048 en el bloque feed-forward, 4 cabezas de atención y 8 capas de anchura 768. La particularidad es la tokenización: en lugar de un vocabulario BPE, trabaja directamente sobre bytes (256 posibles valores), y reserva el byte 0 como token de parada. Esto elimina el vocabulario fuera de distribución y permite generar cualquier cadena de bytes, a costa de secuencias más largas para un mismo texto.

El entrenamiento se realizó durante 60.000 iteraciones con lotes de 512 secuencias de 128 bytes, lo que equivale a aproximadamente 3.932 millones de bytes procesados (60.000 × 512 × 128). El corpus es `ks46/usernames`, con 90.505.453 nombres de usuario únicos procedentes de 18 fuentes públicas: kaggle, jeanphorn, reddit, gharchive, urls, stack, bsky, codeforces, hn, crates, enwiki, lichess, osm, xato, se, so, roblox y ssa. No se documenta en la información disponible si hubo fases de RLHF, DPO u otro ajuste por preferencias; lo que sí se documenta es una cuantización posterior al entrenamiento (absmax simétrico por grupo sobre cada peso 2D) y la publicación de checkpoints con cuantización simulada. El autor también publica `golden.json` con valores de referencia de log-verosimilitud negativa calculados en Python para 64 nombres de validación, lo que permite verificar la equivalencia del kernel Rust.

## Capacidades

- Generación de nombres de usuario sintéticos con estilo de identificador real, incluyendo prefijos controlables mediante la opción `--prefix` (por ejemplo, `dark`).
- Muestreo controlado por temperatura (los ejemplos de la model card usan 0,9) y modo `--novel` para forzar muestras ausentes del corpus de entrenamiento.
- Generación por lotes: el kernel Rust permite `--batch 64` y volúmenes de miles de muestras (el ejemplo usa `-n 1000`).
- Reproducción de la distribución de estilos por plataforma: las métricas por fuente (de 3,17 bits por carácter en kaggle a 4,15 en ssa) indican que el modelo distingue convenciones de nombres asociadas a cada origen.
- Terminación fiable: 0 dibujos sin terminar en 10.000 muestras, gracias al byte 0 como token de parada.
- No se documentan capacidades de tool calling, function calling, uso de agentes, razonamiento multi-paso, matemáticas, código, visión ni audio. No es un modelo de instrucciones y no se ha ajustado con RLHF/DPO.
- Capacidad multilingüe: no declarada. Al ser byte-level puede emitir cualquier byte, pero el entrenamiento se limita a nombres de usuario, mayoritariamente en caracteres latinos y ASCII.
- Modo de pensamiento (thinking), visión o audio: no disponible.

## Casos de uso

- Generación de datos sintéticos para pruebas: el modelo produce lotes de nombres únicos y novedosos (100 % únicos y 93,5 % novedosos en la evaluación del autor), lo que permite poblar bases de datos de desarrollo o entornos de staging sin reutilizar datos reales.
- Sustitución de PII en registros y trazas: en lugar de anonimizar nombres de usuario con hashes o marcadores, se pueden sustituir por identificadores sintéticos que conservan la forma estadística del original, manteniendo la legibilidad de los logs.
- Aumento de datos para clasificadores: modelos de detección de nombres de usuario, de clasificación por plataforma de origen o de moderación pueden ampliar su conjunto de entrenamiento con las muestras generadas, incluida la etiqueta de estilo por fuente.
- Validación de políticas de registro: se pueden generar miles de candidatos y pasarlos por las reglas de validación de un formulario (longitud, caracteres permitidos, palabras reservadas) para detectar reglas demasiado laxas o demasiado restrictivas.
- Fuzzing de sistemas de autenticación y de altas de usuario: la generación por lotes con el kernel Rust permite alimentar pruebas de carga y de robustez con identificadores variados, sin exponer nombres de cuentas reales.
- Relleno de datos en demostraciones y prototipos: aplicaciones de ejemplo, maquetas de interfaz o vídeos de producto pueden mostrar listados de usuarios verosímiles sin recurrir a datos personales.
- Evaluación comparativa de pipelines de cuantización: las variantes int8 e int4 publicadas, con su pérdida de bits por carácter medida, convierten al modelo en un banco de pruebas pequeño y rápido para validar flujos de cuantización propios y comprobar su efecto sobre la perplejidad.
- Verificación de implementaciones de inferencia: `golden.json` permite validar un runtime nuevo (por ejemplo, un kernel propio o un port a otra arquitectura) comparando las log-verosimilitudes negativas contra la referencia en Python.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K ni similares) en la información disponible. Las métricas publicadas son específicas del dominio y se miden en bits por carácter sobre un conjunto de validación de 1.413.605 nombres retenidos (menos es mejor):

| Metrica | Valor |
|---|---|
| Bits por carácter en validacion (fp32) | 3,5619 |
| Muestras validas | 100,0 % |
| Muestras unicas | 100,0 % |
| Muestras novedosas (ausentes del corpus) | 93,5 % |
| Dibujos sin terminar | 0 de 10.000 |

Bits por carácter por fuente (menos es mejor):

| Fuente | Bits/caracter |
|---|---|
| kaggle | 3,17 |
| jeanphorn | 3,33 |
| reddit | 3,42 |
| gharchive | 3,48 |
| urls | 3,54 |
| stack | 3,60 |
| bsky | 3,61 |
| codeforces | 3,61 |
| hn | 3,66 |
| crates | 3,66 |
| enwiki | 3,77 |
| lichess | 3,77 |
| osm | 3,93 |
| xato | 3,94 |
| se | 3,95 |
| so | 4,02 |
| roblox | 4,08 |
| ssa | 4,15 |

Efecto de la cuantizacion (absmax simetrico por grupo, aplicado tras el entrenamiento):

| Formato | Bits/caracter en validacion | Delta vs fp32 | Muestras novedosas | Tamano |
|---|---|---|---|---|
| int8 g64 | 3,5602 | +0,0000 | 0,936 | 58,7 MB |
| int4 g64 | 3,5717 | +0,0115 | 0,929 | 30,2 MB |
| int4 g32 | 3,5693 | +0,0091 | 0,938 | 32,0 MB |

## Requisitos de hardware

- Pesos en fp32: 56.882.688 parámetros × 4 bytes ≈ 227 MB. La inferencia en fp32 requiere en torno a 250-300 MB de memoria sumando activaciones con lotes pequeños.
- Pesos en int8 (g64): 58,7 MB.
- Pesos en int4 (g64): 30,2 MB; int4 (g32): 32,0 MB.
- Cabe en cualquier GPU de consumo: 30-300 MB de pesos permiten ejecutarlo en tarjetas con 2 GB o menos, así como en GPU integradas y en CPU. No se han declarado pruebas específicas en A100, H100 o RTX 4090, que resultarían enormemente sobredimensionadas para este tamaño.
- El repositorio ocupa 1,4 GB porque `ckpt.pt` incluye el estado del optimizador además de los pesos; para desplegar solo hace falta el modelo, no el optimizador.
- Opciones de despliegue: script de muestreo en Python del propio repositorio (`python -m training.sample --ckpt ckpt.pt`), y el kernel `ndgen` en Rust para el formato int8 `model.ndq`.
- El binario `ndgen` se compiló para x86-64 con AVX2 usando `-C target-cpu=native` en un EPYC 7763; para otro host es necesario recompilar desde `rust/ndkernel`.
- No hay pesos en GGUF ni soporte declarado en llama.cpp, Ollama, vLLM o TGI. Al tratarse de una arquitectura de byte-level con formato propio, su integración en esos servidores requeriría trabajo adicional.
- Latencia y throughput: no disponibles. La única referencia operativa es que el kernel Rust admite lotes de 64 y generaciones de 1.000 muestras.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de modelos comparables de la misma categoría (generación de nombres de usuario o identificadores sintéticos) ni resultados de benchmarks comunes que permitan situar a name-dreamer frente a alternativas. Tampoco se aportan especificaciones verificables de otros modelos byte-level pequeños que permitan una comparación rigurosa sin inventar cifras.

## Limitaciones y advertencias

- Modelo de dominio muy estrecho: no es un LLM de propósito general. No se ha ajustado para seguir instrucciones y no debe usarse como asistente, para razonamiento, código o tareas de conocimiento.
- Contenido ofensivo: entre las muestras publicadas por el propio autor aparecen términos insultantes y de carácter sexual o violento. El modelo no incorpora filtros declarados, por lo que requiere moderación posterior si se expone a usuarios finales.
- Riesgo de colisión con identidades reales: aunque el 93,5 % de las muestras son novedosas, un 6,5 % no lo son, lo que implica que parte de la salida puede coincidir con nombres de usuario existentes. Usar estas cadenas para crear cuentas, suplantar identidades o generar campañas de registro masivo es un uso indebido con consecuencias legales y de seguridad.
- Posible fuga de PII: el corpus procede de 18 fuentes públicas (entre ellas reddit, GitHub Archive, Bluesky, Stack Overflow o Wikipedia) y no se documenta un proceso de filtrado de datos personales. Las muestras más cercanas al corpus podrían reproducir identificadores reales.
- Sesgos no evaluados: no se publican análisis de sesgo por género, etnia, nacionalidad ni por idioma. La distribución de las fuentes (mayoritariamente técnicas y anglosajonas) condiciona el estilo generado.
- Idioma y alfabeto: no se declaran idiomas soportados. El entrenamiento se centra en nombres de usuario, mayoritariamente en caracteres latinos; el rendimiento fuera de ese alfabeto no está medido.
- Contexto limitado: 512 bytes de ventana de entrenamiento. No se declara si el modelo mantiene coherencia con prefijos más largos.
- Terminación: fiable en la evaluación publicada (0 de 10.000 dibujos sin terminar), pero no hay garantía fuera de la distribución entrenada.
- Licencia MIT: permite uso comercial y modificación sin restricciones declaradas, pero se ofrece sin garantías. La responsabilidad sobre el contenido generado recae en quien lo despliega.
- Operativa: el checkpoint `ckpt.pt` incluye el optimizador (1,4 GB en total) y el binario `ndgen` está compilado para un host concreto, por lo que no es portable tal cual a otras máquinas sin recompilar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ks46/name-dreamer
- Dataset de entrenamiento: https://huggingface.co/datasets/ks46/usernames
- La búsqueda web realizada no devolvió resultados relevantes: únicamente enlaces genéricos a YouTube sin relación con el modelo. No se dispone de papers, blogs, repositorios ni demos adicionales en la información proporcionada.
