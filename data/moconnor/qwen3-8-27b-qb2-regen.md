# moconnor/qwen3.8-27b-qb2-regen

## Resumen
Qwen3.8-27B-qb2-regen es un paquete de despliegue para hardware Tenstorrent Blackhole, publicado por el usuario moconnor, que adapta el modelo multimodal Qwen/Qwen3.8-27B para ejecutarse sobre una QuietBox 2 (cuatro chips p300c, 480 núcleos Tensix). No es un modelo entrenado desde cero, sino una distribucion empaquetada del motor de inferencia bare-metal `qwen-tt` (C++20, 13,9 MB) junto con pesos pre-cuantizados, pensada para el gestor `tt-model`.

El problema que resuelve es la ausencia de una via de despliegue sin Python, sin PyTorch, sin TT-Metal y sin compilacion JIT para servir Qwen3.8-27B en aceleradores Tenstorrent. El paquete integra firmware BRISC/TRISC/ERISC1 embebido y arranca un servidor compatible con la API de OpenAI en aproximadamente 28 segundos, con pesos de 20,6 GiB descargados automaticamente desde el repositorio `moconnor/Qwen3.8-27B-QB2-ttq`.

Es relevante ahora porque demuestra inferencia multimodal (texto e imagen) y decodificacion especulativa con DFlash2 sobre silicio no-GPU, con cifras medidas de rendimiento y consumo energetico de placa. El modelo base declara una ventana de contexto de hasta 262.144 tokens y arquitectura con Gated DeltaNet, aunque los detalles de entrenamiento no se documentan en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo base Qwen3.8-27B (transformer con Gated DeltaNet, segun la model card); motor de inferencia bare-metal C++20 `qwen-tt` |
| Parametros totales | 27B (heredado del nombre del modelo base; no confirmado en la ficha) |
| Parametros activos | no disponible |
| Longitud de contexto | Hasta 262.144 tokens (perfil `long-context-256k`); 64K por usuario en `default`; 144K en `high-throughput` |
| Tipos de cuantizacion | Pesos pre-cuantizados propietarios Tenstorrent (`ttq`, 20,6 GiB); no se detallan esquemas (INT8/FP8 u otros) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | Pesos `ttq` pre-cuantizados para Tenstorrent; el repositorio ocupa 0,2 GB (los pesos se descargan aparte) |

## Arquitectura y entrenamiento
El modelo base es Qwen3.8-27B, un transformer multimodal con atencion Gated DeltaNet que, segun la model card, escala hasta 262.144 tokens de contexto. Sobre el se aplica decodificacion especulativa mediante incoai/Qwen3.8-27B-DFlash2, lo que acelera la generacion al proponer tokens con un modelo borrador. El paquete de despliegue sustituye la pila habitual (Python, PyTorch, TT-Metal, JIT) por un motor C++20 autocontenido con firmware Blackhole embebido, distribuido sobre los 480 nucleos Tensix de los cuatro chips p300c.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO en el modelo base. La innovacion tecnica destacable del paquete es la implementacion bare-metal con cache de prefijos en GDDR6 (hasta 16 ranuras en el perfil por defecto) y una superposicion de vision sobre los 480 nucleos con PCC de 0,999225 frente a FP32 de referencia en Hugging Face, procesando hasta 16.384 parches de imagen y video via ffmpeg.

## Capacidades
- Generacion de texto y razonamiento con modo thinking configurable (`effort=medium` en las pruebas).
- Entrada multimodal imagen-texto (`image-text-to-text`), con soporte de video a traves de ffmpeg.
- Razonamiento matematico: 93,3% en AIME 2025 (28/30) y 97,0% en GSM8K-100.
- Soporte de tool calling y function calling, validado con `tt-model check --tools` y una suite agentica Terminal-Bench sin llamadas XML malformadas (0/33).
- Razonamiento agentico multi-paso en entornos de terminal.
- Contexto largo con recuperacion de agujas multiple: 50/50 en longitudes de 1,8K a 260.636 tokens.
- Servidor compatible con la API de OpenAI para integracion directa.
- Concurrencia por lotes configurable (B=1, B=2, B=4, B=8) segun perfil.

## Casos de uso
- Atencion al cliente automatizada: el perfil `default` ofrece 64K tokens de contexto por usuario con B=4 y cache de prefijos en GDDR6, adecuado para conversaciones multi-turno con historial extenso e imagenes adjuntas.
- Analisis de documentos largos: el perfil `long-context-256k` permite procesar hasta 262.144 tokens en una sola peticion, con recall medido del 100% en pruebas de agujas multiples, util para contratos, informes o expedientes completos.
- Agentes de codigo en terminal: la suite Terminal-Bench B=4 obtuvo 10/10 con tool calling correcto, lo que lo hace apto para agentes que ejecutan comandos y editan ficheros en pipelines de CI/CD.
- Procesamiento de imagenes y video en produccion: la superposicion de vision sobre 480 nucleos Tensix con PCC 0,999225 permite clasificacion, descripcion o extraccion de informacion de hasta 16.384 parches por entrada.
- Despliegue en entornos sin GPU: al ser un motor C++20 sin Python ni PyTorch, encaja en infraestructura con aceleradores Tenstorrent donde no se quiere mantener una pila de ML completa.
- Servicio de alto rendimiento con restriccion energetica: el perfil `high-throughput` alcanza 498,3 tok/s agregados con 799,1 W de placa, con una metrica de 49,83 tok/s por cada 1.000 dolares, relevante para calcular coste por token.
- Evaluacion e investigacion en silicio no convencional: util para equipos que comparan el rendimiento de Tenstorrent frente a GPU en cargas de razonamiento y multimodalidad.

## Benchmarks y rendimiento
Rendimiento medido en QuietBox 2 con SPEED-Bench oficial, `low_entropy`, thinking activado, `max_tokens=1024`, cache de prefijos desactivada:

| Carga | E2E (t/s/u) | Decode (t/s/u) | Agregado (t/s) | TTFT p50 | Potencia de placa | t/s/$1K |
|---|---:|---:|---:|---:|---:|---:|
| 8K · B=1 | 181,5 | 211,5 | 178,2 | 0,77 s | 689,0 W | 17,83 |
| 8K · B=2 | 137,3 | 155,7 | 249,8 | 0,77 s | 714,9 W | 24,98 |
| 8K · B=4 | 107,3 | 121,4 | 391,5 | 0,79 s | 740,0 W | 39,15 |
| 8K · B=8 | 67,6 | 74,5 | 498,3 | 0,78 s | 799,1 W | 49,83 |
| 128K · B=1 | 44,1 | 202,1 | 44,1 | 17,98 s | 906,9 W | no disponible |

Precision y cualificacion:

| Benchmark | Resultado | Referencia |
|---|---|---|
| AIME 2025 | 28/30 (93,3%) | 96,7% ± 3,3% (dentro de 1 SE; 27/27 sin truncar) |
| GSM8K-100 | 97,0% (319,6 t/s) | no disponible |
| MMLU-100 | 90,0% | no disponible |
| Terminal-Bench B=4 (agentico) | 10/10 (100%), 0/33 llamadas XML malformadas, 86,5% de acierto de cache de prefijos GDDR6 | no disponible |
| Recall de contexto largo (5 agujas) | 50/50 (100%) en 10 longitudes de 1,8K a 260.636 tokens | no disponible |
| Vision (480 nucleos) | PCC = 0,999225 frente a HF FP32, hasta 16.384 parches | no disponible |

## Requisitos de hardware
- Hardware obligatorio: Tenstorrent Blackhole QuietBox 2 con 4 chips p300c (480 nucleos Tensix), KMD >= 2.11.0, `/dev/hugepages-1G` montado y Docker >= 25.
- No es ejecutable en GPU convencionales (A100, H100, RTX 4090) ni en CPU: el motor esta compilado para el firmware Blackhole.
- Almacenamiento: imagen de contenedor de aproximadamente 280 MB comprimida mas pesos pre-cuantizados de 20,6 GiB.
- Memoria: los pesos y la cache de prefijos residen en GDDR6 de los chips; el perfil por defecto reserva 16 ranuras de cache de prefijos.
- Despliegue: mediante el gestor `tt-model` (`tt-model serve`, `tt-model check`, `tt-model stop`), que expone un servidor compatible con la API de OpenAI.
- Arranque: aproximadamente 28 segundos.
- Consumo: entre 689,0 W (B=1, 8K) y 906,9 W (B=1, 128K) de potencia de placa medida con `tt-smi`.
- Throughput: hasta 498,3 tok/s agregados en B=8; TTFT p50 de 0,77-0,79 s en 8K y 17,98 s en 128K.

## Comparativa con modelos similares
No se dispone de datos de otros modelos comparables en la informacion proporcionada. La comparacion natural seria con el propio Qwen/Qwen3.8-27B en su despliegue de referencia (GPU), pero no se aportan cifras de rendimiento de esa variante. Tampoco hay resultados de alternativas de 27B en hardware Tenstorrent. Se indica, por tanto, "no disponible".

| Modelo | Parametros | Contexto | Licencia | Hardware | Rendimiento |
|---|---|---|---|---|---|
| moconnor/qwen3.8-27b-qb2-regen | 27B | 262.144 | Apache-2.0 | QuietBox 2 (4x p300c) | 498,3 tok/s agregados (B=8) |
| Qwen/Qwen3.8-27B | 27B | 262.144 (segun model card) | no disponible | no disponible | no disponible |
| incoai/Qwen3.8-27B-DFlash2 | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias
- Dependencia total de hardware Tenstorrent Blackhole QuietBox 2; no hay ruta de ejecucion en GPU o CPU documentada.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo dia (23 de noviembre de 2026): es un artefacto reciente y sin validacion comunitaria.
- Los pesos no se incluyen en el repositorio (0,2 GB); se descargan desde `moconnor/Qwen3.8-27B-QB2-ttq`, una dependencia externa que puede cambiar o desaparecer.
- No se detalla la composicion del dataset de entrenamiento ni los sesgos conocidos del modelo base.
- No se especifican los idiomas soportados; el soporte multilingue no esta confirmado.
- Riesgo de alucinacion inherente a modelos de 27B en tareas abiertas; las cifras de AIME y MMLU provienen de conjuntos reducidos (30 y 100 preguntas), con menor significacion estadistica.
- El TTFT en contextos de 128K alcanza 17,98 s, lo que limita su uso interactivo con prompts muy largos.
- El consumo de placa supera los 900 W en cargas de contexto largo, con implicaciones de refrigeracion y coste energetico.
- La licencia Apache-2.0 se aplica al paquete, pero conviene verificar las condiciones del modelo base Qwen y de los pesos derivados.
- El rendimiento de vision se expresa como correlacion (PCC) frente a FP32, no como metrica de calidad de tarea.

## Enlaces
- Hugging Face: https://huggingface.co/moconnor/qwen3.8-27b-qb2-regen
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Modelo de decodificacion especulativa: https://huggingface.co/incoai/Qwen3.8-27B-DFlash2
- Pesos pre-cuantizados: https://huggingface.co/moconnor/Qwen3.8-27B-QB2-ttq
- Repositorio del motor: https://github.com/tenstorrent/regen-qwen3.8-27b-qb2
- Gestor de modelos: https://github.com/tenstorrent/tt-model-manager
