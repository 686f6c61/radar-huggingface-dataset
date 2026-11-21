# slm4apps/Terraville

## Resumen

Terraville es un modelo de generación de texto extremadamente pequeño (5,86 M de parámetros) desarrollado por el usuario slm4apps, orientado a la generación procedural de mundos y especificaciones para motores 3D. Su función no es conversar ni razonar en lenguaje natural libre, sino traducir peticiones en inglés ("a snowy island at night with a lighthouse", "make it harder") a un spec JSON estructurado dentro de un vocabulario cerrado que un motor de videojuegos puede interpretar directamente. El modelo se ejecuta íntegramente en el navegador con JavaScript plano, sin servidor, sin GPU y sin WebAssembly, cargando pesos int8 de 6,17 MiB con la propia página.

La arquitectura es un transformer encoder-decoder de dimensiones reducidas (d=256, 4 cabezas, 4 capas de encoder y 3 de decoder) entrenado desde cero sobre datos sintéticos generados por plantillas. El modelo se acompaña de una librería de 1.461 nombres de objetos y un validador que garantiza que la salida sea siempre construible por el motor, lo que elimina en la práctica los fallos de formato. La latencia declarada es de 191 ms en mediana por petición en un solo hilo de CPU.

Su relevancia radica en el enfoque: demuestra que una tarea de generación estructurada y acotada puede resolverse con un modelo de menos de 6 millones de parámetros desplegable en cualquier navegador, sin infraestructura. Es un caso de estudio sobre vocabularios cerrados, validación en cascada y modelos sintéticos para aplicaciones interactivas, más que un modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder, pre-LayerNorm, GELU, posiciones aprendidas, embedding de salida atado |
| Parametros totales | 5,86 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | entrada de hasta 112 caracteres (45 símbolos), salida de hasta 30 tokens sobre un vocabulario de 1.607 |
| Tipos de cuantizacion | int8 por tensor (pesos oficiales); no se documentan otras |
| Idiomas soportados | inglés |
| Licencia | Apache-2.0 |
| Formato de pesos | binario int8 propio (`terraville-tiny.bin`, 6.471.680 bytes) + manifiesto JSON (`terraville-tiny.json`, 41.962 bytes) |

## Arquitectura y entrenamiento

El modelo es un transformer encoder-decoder clásico con pre-LayerNorm y activación GELU, posiciones aprendidas y embedding de salida atado al de entrada. La entrada se tokeniza a nivel de carácter en minúsculas (45 símbolos, hasta 112 caracteres) y la salida es un vocabulario cerrado de 1.607 tokens, con un máximo de 30 por respuesta. La decodificación es greedy y el runtime (`src/tinylm.js`) está escrito en JavaScript plano, con paridad de tokens verificada frente a la referencia en PyTorch.

El entrenamiento se realizó desde cero, sin modelo base, durante 8 épocas con AdamW (lr 1,5e-3), batch de 256 y un coste total de 2.301 segundos en un portátil Apple Silicon con MPS. Los datos son íntegramente sintéticos, generados por `tools/gen_tiny.py`: 96.640 filas de entrenamiento (objeto 38.040, mundo 33.716, cambio en vivo 9.000, herramienta 6.758, parche 4.519, chat 4.607) y 660 de validación. Las plantillas se cruzan con vocabulario de biomas, terrenos, agua, hora del día, plantas y características, además de aperturas conversacionales, erratas y 67 verbos de ítem cruzados con todos los objetos. Se reservaron deliberadamente para test plantillas completas, tres verbos (conjure, whip up, materialize) y sinónimos no vistos. No se documenta RLHF ni DPO.

## Capacidades

- Generación de especificaciones de mundo: bioma, terreno, agua, hora del día, plantas con densidad y características con recuento, a partir de una frase en inglés.
- Selección de ítems sobre una librería cerrada de 1.461 nombres, con color, cantidad y estilo; las peticiones desconocidas se resuelven con el ítem más cercano ("Closest I have: X") en lugar de rechazarse.
- Selección de estilo entre 14 looks predefinidos (voxel, toy brick, neon city, cartoon, low poly, realistic, etc.).
- Cambios en vivo sobre parámetros de juego: dificultad, velocidad, salud, daño, aparición, chatarra y oleada, con dirección.
- Selección de herramienta y tamaño ("dig a big hole here").
- Respuestas de chat limitadas a 12 réplicas fijas.
- Robustez a variación léxica: los verbos (add, make, spawn, place, get me a...) son intercambiables y no determinan el ítem.
- No soporta tool calling genérico, agentes multi-paso, visión, audio ni razonamiento libre; su salida está restringida al vocabulario cerrado.

## Casos de uso

- Generación de mundos en juegos sandbox en navegador: el modelo traduce una frase del jugador a un spec que el motor three.js construye al instante, sin backend ni GPU, con latencia de ~191 ms en mediana.
- Creación de ítems bajo demanda en editores 3D ligeros: dado un nombre, color y cantidad, el modelo emite un ítem de la librería validado, útil para prototipado rápido de escenas.
- Ajuste dinámico de dificultad en tiempo de juego: frases como "make it harder" o "zombies faster" se convierten en cambios de parámetros que el runtime del juego aplica, sin lógica de parseo en el código.
- Demostraciones educativas de NLP embebido: sirve para mostrar en un curso cómo un modelo de 5,86 M de parámetros con vocabulario cerrado y validación puede sustituir a reglas o expresiones regulares.
- Prototipado de interfaces de lenguaje natural para herramientas de autoría: el patrón (entrada libre, salida cerrada, validador) es reutilizable para generar configuraciones de escenas, materiales o estilos.
- Pruebas de robustez y evaluación de generalización: los splits reservados (sinónimos y plantillas no vistas) permiten estudiar cómo se degrada un modelo diminuto ante vocabulario fuera de distribución.
- Aplicaciones offline o de bajo consumo: al ejecutarse en JavaScript plano con pesos int8 de 6,17 MiB, encaja en entornos sin conectividad o con hardware muy limitado.

## Benchmarks y rendimiento

Evaluación con el motor JavaScript plano sobre los pesos int8, un solo hilo de CPU. "Exact" = spec completo correcto; "field" = proporción de campos correctos; "valid" = pasa el validador de vocabulario cerrado. Cada split mezcla mundos, ítems, cambios en vivo y parches.

| Split de test | n | Exact % | Field % | Valid % | Reglas por palabra clave, exact % |
|---|---:|---:|---:|---:|---:|
| Frases vistas en entrenamiento | 437 | 94,5 | 97,9 | 100 | 24,7 |
| Frases nunca vistas | 300 | 91,0 | 97,8 | 100 | 56,0 |
| Sinónimos nunca vistos | 360 | 23,6 | 70,9 | 99,2 | no disponible |

## Requisitos de hardware

- Inferencia en CPU de un solo hilo dentro del navegador; no requiere GPU ni VRAM dedicada.
- Huella de pesos: 6,17 MiB en int8 (5,81 MiB comprimido con gzip), más un manifiesto JSON de 41.962 bytes.
- Cabe en cualquier GPU de consumo, pero no la necesita; el despliegue previsto es el navegador con JavaScript plano.
- Opciones de despliegue documentadas: runtime propio `src/tinylm.js` con decodificación greedy; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia declarada: p50 de 191 ms por petición en un solo hilo de CPU; no se publica throughput agregado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Despliegue |
|---|---|---|---|---|---|
| Terraville | 5,86 M | 112 caracteres de entrada / 30 tokens de salida | Generación de specs de mundo con vocabulario cerrado | Apache-2.0 | Navegador, JS plano |
| Modelos de propósito general tipo Llama/Qwen pequeños | cientos de millones a miles de millones | miles de tokens | Lenguaje libre, código, razonamiento | variable | GPU o CPU con runtimes especializados |
| Reglas o expresiones regulares hechas a mano | 0 | no aplica | Parseo de comandos | no aplica | Cualquiera |

No se dispone de comparaciones publicadas con alternativas de la misma categoría (modelos de generación procedural embebidos); el propio autor incluye como referencia las reglas por palabra clave, que obtienen 24,7 % y 56,0 % de exactitud en los splits vistos y no vistos frente al 94,5 % y 91,0 % del modelo.

## Limitaciones y advertencias

- Solo inglés; no hay soporte multilingüe ni se ha entrenado para ello.
- Generalización limitada a sinónimos no vistos: la exactitud cae al 23,6 % en ese split, aunque la validez se mantiene en el 99,2 %.
- La salida está restringida a un vocabulario cerrado; no puede generar texto libre ni razonar fuera de las categorías previstas.
- Riesgo de alucinación estructural bajo, pero el autor recomienda validar siempre la salida (`validate(spec)`) antes de usarla.
- Los ítems desconocidos se sustituyen por el más cercano, lo que puede producir resultados distintos a la intención del usuario sin indicarlo más allá del mensaje "Closest I have".
- El chat se limita a 12 respuestas fijas; no es un asistente conversacional.
- Licencia Apache-2.0, que permite uso comercial con atribución y conservación del aviso de licencia; conviene revisar las condiciones de los datos de la librería de ítems derivados de Maris3D (también Apache-2.0).
- Proyecto con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción ni de mantenimiento a largo plazo.
- El repositorio figura con tamaño de 0,0 GB, dato que no refleja el tamaño real de los pesos indicado en la model card.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/slm4apps/Terraville
- Demo en Spaces: https://huggingface.co/spaces/slm4apps/Terraville
- Código fuente: https://github.com/slm4apps/terraville
- Modelo relacionado (Maris3D para Blender): https://huggingface.co/slm4apps/Maris3D-Blender
- Receta de entrenamiento: TRAINING.md (en el repositorio del modelo)
