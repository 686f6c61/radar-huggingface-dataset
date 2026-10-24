# raahemnabeel/qwen3-5-122b-a10b-blackhole-fast

## Resumen

`raahemnabeel/qwen3-5-122b-a10b-blackhole-fast` es un bundle de despliegue, no un modelo entrenado desde cero: empaqueta los pesos de `Qwen/Qwen3.5-122B-A10B` (122B totales, 10B activos, MoE de 256 expertos con top-8 más experto compartido) para ejecutarse sobre hardware Tenstorrent Blackhole, en configuraciones de dos placas p300 o cuatro placas p150. Lo publica el usuario raahemnabeel con el gestor `tt-model-manager` 0.1.0 (manifiesto schema 5.1) y se sirve a través de vLLM con el plugin de Tenstorrent, exponiendo una API compatible con OpenAI en el puerto 20000.

El interés técnico está en el trabajo de kernel, no en los pesos: el paso de decodificación se ha reconstruido con kernels fusionados (router en una sola matmul con top-8, softmax y sigmoid del gate compartido en los núcleos RISC; MoE fusionado en tres operaciones que leen los pesos de cada experto seleccionado in situ desde DRAM; frontera de residual replicada en cada die con un all-reduce + add + RMSNorm local por capa). El resultado son cuatro perfiles de servicio (interactivo, burst, contexto largo y solo texto) con cifras de latencia publicadas, como 66 tok/s para un único usuario en texto de chat con decodificación especulativa.

Es relevante ahora porque demuestra inferencia de un MoE de 122B en aceleradores no-GPU con cuantización extrema en los expertos (5 bits significativos) y porque el modelo base incorpora una arquitectura híbrida poco común (Gated DeltaNet + atención con compuertas) junto con torre de visión y cabeza MTP para decodificación especulativa. La contrapartida es un alcance muy restringido: solo funciona en Blackhole p300x2 o p150x4, sin datos de benchmarks de calidad ni licencia declarada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE híbrido: 48 capas de Gated DeltaNet + atención con compuertas, 256 expertos con top-8 + experto compartido, torre de visión y cabeza MTP |
| Parametros totales | 122B (heredados de `Qwen/Qwen3.5-122B-A10B`) |
| Parametros activos | 10B |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | No disponible como opción de usuario. En decodificación, los pesos de expertos enrutados y compartidos se almacenan redondeados a 5 bits significativos (lo que lee el matmul LoFi de expertos) y las activaciones y pesos de enrutado a 7 bits |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | No disponible. El repo (2,0 GB) contiene el bundle de despliegue (manifiesto schema 5.1 e imagen Docker); los pesos se descargan aparte desde `Qwen/Qwen3.5-122B-A10B` en el commit `dc4d348443bc740c68e2d77492492c11606384d5` |
| Hardware soportado | Tenstorrent Blackhole: p300x2 (2 placas) o p150x4 (4 placas, 4 dies) |
| Servidor de inferencia | vLLM + plugin de Tenstorrent, API compatible con OpenAI en el puerto 20000 |
| Perfiles de servicio | `p300x2` (por defecto), `p300x2-burst`, `p300x2-longctx`, `p300x2-text`; equivalentes `p150x4`, `p150x4-burst`, `p150x4-longctx`, `p150x4-text` |

## Arquitectura y entrenamiento

El modelo base es un MoE híbrido de 48 capas que alterna Gated DeltaNet (atención lineal con estado recurrente) y atención con compuertas, con 256 expertos enrutados por capa, activación top-8 más un experto compartido, torre de visión y una cabeza MTP (multi-token prediction) que habilita la decodificación especulativa. No se dispone de información sobre el dataset de entrenamiento, el número de tokens, la composición de datos ni las etapas de alineación (RLHF/DPO) del checkpoint original; esta ficha describe un port de inferencia, no un entrenamiento nuevo.

La innovación de este bundle está en el paso de decode: (1) el router ejecuta una única matmul 1D y resuelve top-8, softmax y sigmoid del gate compartido en una sola operación sobre los núcleos RISC, frente a una cadena de 7 operaciones; (2) el MoE fusionado reduce el decode a tres operaciones (route, gate|up + SwiGLU, down) que transmiten los pesos de cada experto seleccionado en su sitio, sin copia duplicada, para anchos de 1 a 32 filas incluyendo las filas de verificación del MTP; (3) la frontera de residual replicada mantiene el residual replicado en cada die, con un all-reduce + add + RMSNorm local por capa (dos colectivos por capa en lugar de cuatro, sin gathers). El prefill no se modifica respecto al bundle original `raahemnabeel/qwen3-5-122b-a10b`. La pérdida de precisión es explícita: 5 bits significativos en pesos de expertos y 7 bits en el otro operando del matmul; la model card afirma que la calidad se comprueba, pero los resultados no se incluyen en la información disponible.

## Capacidades

- Generación de texto y razonamiento con modo "thinking" activado por defecto: la traza de razonamiento llega en el campo `reasoning` (o `reasoning_content` en clientes anteriores a vLLM 0.26) y la respuesta final en `content`.
- Modo no-thinking por petición mediante `"chat_template_kwargs": {"enable_thinking": false}`, pensado para respuestas cortas y directas; es la configuración usada en las cifras de latencia publicadas.
- Tool calling / function calling con el parser `qwen3_xml`.
- Entrada multimodal de imagen: hasta 4 imágenes por petición, redimensionadas a un máximo de 4 MP, enviadas como partes `image_url`.
- Decodificación especulativa mediante la cabeza MTP, activa en los perfiles interactivos y desactivada en el perfil de contexto largo.
- Ventana de contexto de 262.144 tokens, con prefill troceado en bloques de 4096 tokens compartidos entre peticiones en el perfil `longctx`.
- Concurrencia de decode de 1 a 32 usuarios soportada por el MoE fusionado (unión de expertos de varios usuarios en una sola lectura de columnas de pesos).
- Capacidades multilingües: no disponibles como lista verificable; el modelo base Qwen es plurilingüe, pero la información proporcionada no detalla idiomas.
- Perfil solo texto (`*-text`) que descarga la torre de visión y amplía el pool de KV un 25 % (1,8 M tokens agrupados para 32 usuarios).

## Casos de uso

- Asistentes interactivos y agentes conversacionales: el perfil `p300x2` (por defecto) ofrece unos 66 tok/s en texto de chat para un único usuario con decodificación especulativa, adecuado para interfaces de chat donde prima la latencia percibida y no el throughput agregado.
- Frontales de chat con decenas de usuarios y prompts cortos: el perfil `p300x2-burst` prellena hasta cuatro prompts por pasada, de modo que una ráfaga de 32 peticiones obtiene su primer token en 3,8 s frente a 6,3 s, manteniendo la misma velocidad de decode.
- Clasificación por lotes y trabajos de extracción de datos: el mismo perfil burst procesa lotes de prompts cortos con mayor utilización del acelerador, a costa de que la reproducibilidad bit a bit del primer token dependa de la composición del lote.
- Análisis de documentación extensa y de repositorios de código: el perfil `longctx` comparte el prefill en bloques de 4096 tokens, de forma que una pregunta corta no queda bloqueada detrás de una carga de 100K tokens; la decodificación especulativa se desactiva y un usuario aislado obtiene unos 57 tok/s.
- Despliegues de solo texto con alta ocupación: el perfil `text` no carga la torre de visión y amplía el pool de KV a 1,8 M tokens para 32 usuarios, útil para conversaciones largas concurrentes en atención al cliente o asistentes internos.
- Inspección de documentos e imágenes en pipelines de extracción: hasta 4 imágenes por petición (máximo 4 MP cada una) permiten resolver tareas de OCR ligero, descripción de capturas o extracción de campos de formularios escaneados.
- Integración en herramientas existentes: al exponer una API compatible con OpenAI en `http://127.0.0.1:20000` con el identificador `Qwen/Qwen3.5-122B-A10B`, se puede apuntar cualquier SDK o framework de agentes sin adaptadores propios, incluido el tool calling con parser `qwen3_xml`.
- Evaluación y desarrollo sobre hardware Tenstorrent: sirve como banco de pruebas reproducible de un MoE de 122B en Blackhole, con perfiles conmutables por línea de comandos para medir el efecto de la fusión de kernels frente al bundle original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible. La model card indica que la calidad de salida "se comprueba", pero no incluye las cifras.

Los únicos datos de rendimiento publicados son de servicio, medidos con thinking desactivado:

| Metrica | Perfil | Valor |
|---|---|---|
| Decodificación, usuario único (texto de chat, con especulación) | `p300x2` | ~66 tok/s |
| Decodificación, usuario único (sin especulación) | `p300x2-longctx` | ~57 tok/s |
| Primer token, ráfaga de 32 peticiones | `p300x2-burst` | 3,8 s (frente a 6,3 s sin burst) |
| Prompts prellenados por pasada | `p300x2-burst` | hasta 4 |
| Pool de KV | `p300x2-text` | 1,8 M tokens para 32 usuarios (+25 % respecto al perfil con visión) |
| Usuarios concurrentes soportados en decode | todos | 1 a 32 |

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el modelo no se ejecuta en GPU. Requiere aceleradores Tenstorrent Blackhole.
- Configuraciones válidas: 2 placas p300 (`p300x2`) o 4 placas p150 (`p150x4`), esta última con cuatro dies Blackhole.
- GPU recomendadas (A100, H100, RTX 4090): no disponibles; no hay ruta de despliegue en CUDA documentada en este bundle.
- Compatibilidad con GPU de consumo: no; el bundle depende del plugin de vLLM para Tenstorrent y de kernels compilados para Blackhole.
- Software necesario: CLI de Tenstorrent (`uv tool install tenstorrent`), Docker y, alternativamente, `tt-model serve` sin la CLI.
- Opciones de despliegue: `tt serve raahemnabeel/qwen3-5-122b-a10b-blackhole-fast` o `tt-model serve`, con selección de perfil mediante `--profile <nombre>`; servidor compatible con OpenAI en el puerto 20000 (o el siguiente libre).
- Arranque: la primera ejecución compila kernels para el dispositivo y tarda varios minutos; el servidor está listo cuando registra `Application startup complete`.
- Descarga: la imagen Docker y los pesos del modelo base se descargan por separado (los pesos no van en la imagen, sino a la caché de Hugging Face).
- Latencia y throughput: ver tabla de la sección anterior; en el perfil `longctx`, los usuarios en ejecución se pausan mientras corren los bloques de prefill.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Hardware | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `raahemnabeel/qwen3-5-122b-a10b-blackhole-fast` (este) | 122B totales / 10B activos | 262.144 | Blackhole p300x2 o p150x4 | ~66 tok/s usuario único; primer token 3,8 s en ráfaga de 32 | no disponible | público en Hugging Face, 0 descargas y 0 likes en la información disponible |
| `raahemnabeel/qwen3-5-122b-a10b` (bundle previo) | 122B / 10B | 262.144 | Blackhole p300x2 o p150x4 | Mismo checkpoint y receta, decode sin fusión (cifras no disponibles) | no disponible | público en Hugging Face |
| `Qwen/Qwen3.5-122B-A10B` (modelo base) | 122B / 10B | no disponible en esta ficha | no especificado en la información | no disponible | no disponible | público en Hugging Face |
| `raahemnabeel/ornith-1.5-35b-a3b-blackhole-fast` | 35B totales / 3B activos | no disponible | Blackhole | no disponible | no disponible | público en Hugging Face; su código sirve este modelo |

## Limitaciones y advertencias

- Licencia no declarada: no se puede asumir uso comercial permitido; hay que verificar la licencia del modelo base y la del bundle antes de cualquier despliegue productivo.
- Dependencia de hardware exótica: solo funciona en Tenstorrent Blackhole p300x2 o p150x4; no hay ruta CUDA ni soporte para GPU convencional, lo que limita la portabilidad y el coste de entrada.
- Precisión reducida en los expertos: pesos redondeados a 5 bits significativos y activaciones/enrutado a 7 bits. La model card afirma haber comprobado la calidad de salida, pero no publica métricas que lo respalden.
- Riesgo de alucinación: no evaluado en la información disponible; es un riesgo estándar en modelos generativos y aquí no hay benchmarks que lo acoten.
- Idiomas soportados no documentados: no se puede confirmar el comportamiento en castellano ni en otras lenguas distintas del inglés sin pruebas propias.
- Thinking activado por defecto: si el presupuesto de `max_tokens` se agota dentro del bloque de razonamiento, el campo `content` vuelve vacío; hay que dimensionar presupuestos de miles de tokens o desactivar el thinking por petición.
- Perfil `burst` no determinista: la semilla del primer token puede variar según la composición del lote, lo que rompe la reproducibilidad bit a bit entre ejecuciones.
- Perfil `longctx` con especulación desactivada y pausas de los usuarios en ejecución durante el prefill: inadecuado para cargas interactivas mixtas muy exigentes.
- Límites multimodales: máximo 4 imágenes por petición y redimensionado a 4 MP, con pérdida de detalle en documentos de alta resolución.
- Madurez y soporte: bundle de un autor individual, con 0 descargas y 0 likes, creado y actualizado el mismo día; no es una publicación oficial de Qwen ni de Tenstorrent y no hay histórico de mantenimiento.
- Arranque lento en frío (compilación de kernels de varios minutos) y dependencia de Docker y de la CLI de Tenstorrent para el flujo estándar.
- Los tags incluyen `base_model:finetune`, pero la información disponible no describe ningún ajuste fino sobre el checkpoint base; conviene tratar el modelo como un port de inferencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/raahemnabeel/qwen3-5-122b-a10b-blackhole-fast
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-122B-A10B
- Bundle previo sin fusión de decode: https://huggingface.co/raahemnabeel/qwen3-5-122b-a10b
- Bundle de referencia de la fusión (Ornith-1.5-35B-A3B): https://huggingface.co/raahemnabeel/ornith-1.5-35b-a3b-blackhole-fast
- Gestor de bundles Tenstorrent: https://github.com/tenstorrent/tt-model-manager
- CLI de Tenstorrent y prerrequisitos: https://github.com/tenstorrent/tt-cli/blob/main/docs/prerequisites.md
- Commit de pesos referenciado: `dc4d348443bc740c68e2d77492492c11606384d5` (en el repo del modelo base)
