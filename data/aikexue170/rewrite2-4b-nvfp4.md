# aikexue170/rewrite2-4b-nvfp4

## Resumen

Rewrite2 4B NVFP4 W4A4 es una versión cuantizada a 4 bits (pesos y activaciones) de un modelo especializado en la reescritura de novelas en chino. Lo publica el usuario aikexue170 en HuggingFace y deriva de Qwen3.5-4B, sobre el que se ha aplicado un LoRA de rango 32 entrenado exclusivamente con 25.647 pares de reescritura del conjunto interno V12.5, posteriormente fusionado y cuantizado con NVIDIA ModelOpt 0.47.0. El resultado es un checkpoint de 2.756.686.336 parámetros (2,76 mil millones reales según safetensors, aunque la nomenclatura comercial lo etiquete como 4B) que ocupa 3,70 GiB y está pensado para inferencia con vLLM sobre GPUs de 16 GB.

El modelo no es un asistente general: es un SFT de tarea única que recibe un fragmento de novela china de entre 500 y 1.200 caracteres y devuelve una reescritura con estilo más natural y menor "sabor a IA", manteniendo trama, personajes y acontecimientos. La instrucción es fija, no hay system prompt ni modo de razonamiento (la plantilla fuerza un bloque ` thinking` vacío) y el comportamiento por defecto es compresivo: la salida tiende a situarse entre 0,6 y 0,9 veces la longitud de la entrada.

Su relevancia práctica está en el pipeline editorial: permite reducir el coste de servir una tarea de reescritura muy concreta a un cuarto del peso del BF16 (8,47 GiB) manteniendo, según la validación del autor, una tasa de reescritura del 34,2 % y cero repeticiones de 8-gramas en una muestra heldout de 646 caracteres. Es un modelo recién publicado, con 0 descargas y 0 likes en el momento de la consulta, y sin benchmarks estándar publicados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Qwen3.5-4B; la model card no detalla la arquitectura interna) |
| Parametros totales | 2.756.686.336 (2,76 B, según safetensors); etiquetado comercial como 4B |
| Parametros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible; el ejemplo de despliegue del autor fija `--max-model-len 4096` |
| Tipos de cuantizacion | NVFP4 W4A4 (ModelOpt 0.47.0, calibración con 128 muestras); el mismo modelo se distribuye también en BF16, FP8 W8A8 y GGUF Q8_0 / Q4_K_M |
| Idiomas soportados | Chino (`zh`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`) con `hf_quant_config.json`; repo de 4,0 GB |
| Fecha de publicacion | 2026-10-25 |
| Repositorio | aikexue170/rewrite2-4b-nvfp4 (4,0 GB) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo base; se limita a identificar `Qwen/Qwen3.5-4B` en la revisión `851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a`. Sobre esa base se aplicó un ajuste supervisado con LoRA de rango 32 durante 1 epoch (2.934 pasos) sobre 25.647 ejemplos de reescritura del dataset V12.5 clean, sin datos de expansión textual ni de otras tareas. El adaptador se fusionó en los pesos y el conjunto se cuantizó después con ModelOpt 0.47.0 a NVFP4 W4A4, usando 128 textos originales de V12.5 como calibración y sin cuantizar la caché KV. No se documentan fases de RLHF, DPO ni preferencias humanas.

El interés técnico está en el empaquetado: NVFP4 combina pesos y activaciones de 4 bits, lo que reduce el checkpoint a 3,70 GiB frente a los 8,47 GiB del BF16 y los 5,15 GiB del FP8 W8A8. La propia autora advierte que el beneficio de rendimiento es máximo en arquitecturas Blackwell y que la cuantización de baja precisión amplifica las dos patologías del modelo, la compresión excesiva y la copia literal. Los pesos incluyen una torre visual heredada de la base (los ficheros `preprocessor_config.json` y `video_preprocessor_config.json` están presentes), pero no se ha entrenado con imágenes y el repositorio solo garantiza reescritura de texto.

## Capacidades

- Reescritura de narrativa en chino: reorganiza el lenguaje de un fragmento manteniendo la línea argumental, los personajes y los acontecimientos principales.
- Supresión de estilo generado por IA: el prompt de entrenamiento exige reescribir aunque el original ya sea fluido, con prohibición explícita de copiar más de 15 caracteres consecutivos.
- Control de tasa de copia: en la validación del autor, la variante NVFP4 alcanza un 34,2 % de tasa de reescritura y `dup8` igual a 0 sobre una muestra de 646 caracteres.
- Cierre natural de la generación: en esa misma prueba el `finish_reason` es `stop`, no truncamiento por longitud.
- Modo de compresión: la salida se sitúa típicamente entre 0,6 y 0,9 veces la entrada; con entradas de 800-950 caracteres el objetivo de entrenamiento produce una mediana de unos 540 caracteres (0,63×).
- Compatibilidad con vLLM mediante `--quantization modelopt_fp4` y autodetección de la configuración ModelOpt.
- Sin soporte de tool calling, function calling, agentes, matemáticas, código, razonamiento multi-paso, audio ni visión funcional.
- Sin modo de razonamiento: la plantilla fija `<think>\n\n</think>\n\n` y el modelo solo emite cuerpo de texto.
- Monolingüe: toda la instrucción y los datos están en chino.

## Casos de uso

- Reescritura por lotes de capítulos de novela web: dividir el manuscrito en segmentos de 500-1.200 caracteres y procesarlos con vLLM en `temperature 0.7`, `top_p 0.9`, `repetition_penalty 1.08` y `max_tokens` en torno a 1.200, encadenando la salida como nuevo capítulo.
- Reducción de "sabor a IA" en textos ya generados: pasar por el modelo capítulos producidos por otro LLM antes de publicarlos, aprovechando que la instrucción obliga a reescribir incluso cuando el original ya es fluido.
- Preedición editorial asistida: usar el modelo como primera pasada sobre material de autor y reservar la revisión humana para los tramos de más de 1.500 caracteres o con múltiples personajes, donde la autora reconoce que el 4B se queda corto.
- Evasión de copia literal en plataformas de serialización: la restricción de no superar 15 caracteres consecutivos de original sirve para normalizar textos que deben pasar filtros de duplicidad, con verificación posterior de la tasa de copia.
- Servicio interno de bajo coste: con 3,92 GiB de pesos, un solo servidor vLLM con `--gpu-memory-utilization 0.40` puede atender varias peticiones concurrentes en una GPU de 16 GB, lo que hace viable ofrecer reescritura como API interna.
- Generación de variantes de estilo para pruebas A/B: lanzar la misma entrada con distintas semillas y `temperature 0.7` para obtener versiones alternativas de un mismo pasaje y medir preferencia editorial.
- Construcción de un corpus paralelo original-reescritura: procesar un fondo editorial ya publicado para generar pares alineados que sirvan después para entrenar o evaluar otros modelos de estilo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K ni similares) en la información disponible. La única evaluación documentada es una validación interna del autor sobre una entrada heldout de 646 caracteres, con `temperature 0.7`, `seed 42`, `max_tokens 800` y `repetition_penalty 1.08`:

| Metrica | NVFP4 W4A4 |
|---|---|
| Longitud de entrada (caracteres) | 646 |
| Longitud de salida (caracteres) | 891 |
| Tasa de reescritura | 34,2 % |
| Repeticiones de 8-gramas (`dup8`) | 0 |
| `finish_reason` | `stop` (cierre natural) |
| Carga y generación | Correcta |

El autor indica que la comparación con la variante FP8 W8A8 se limita a diferencias en longitud de salida y tasa de copia, sin errores de formato, pero no aporta la cifra concreta de FP8. En la prueba con entradas largas (1.000-1.300 caracteres) la tasa de reescritura se mantiene similar a la del tramo 700-1.000, mientras que la salida se acorta y aumenta la copia consecutiva.

## Requisitos de hardware

- VRAM para inferencia: aproximadamente 3,92 GiB solo para pesos; el autor recomienda apuntar a una GPU de 16 GB para dejar margen a la caché KV y al contexto de 4.096 tokens.
- GPU recomendadas: la model card señala que NVFP4 ofrece su máxima ventaja en Blackwell; para GPUs de 16 GB en general (gama RTX x070/x080 y equivalentes profesionales) el checkpoint cabe con holgura. En arquitecturas sin aceleración FP4 nativa el soporte depende de la pila de inferencia.
- Cabe en GPU de consumo: sí, con 3,70 GiB de pesos en disco y 3,92 GiB en memoria, entra en tarjetas de 16 GB e incluso en algunas de 12 GB si se limita el contexto.
- Opciones de despliegue: vLLM es la vía documentada (`--quantization modelopt_fp4`, `--trust-remote-code`, `--max-model-len 4096`, `--gpu-memory-utilization 0.40`). Para llama.cpp u Ollama no existe NVFP4 en este repositorio: hay que usar la variante GGUF del mismo modelo.
- Alternativas de menor requisito: la variante GGUF Q4_K_M ocupa 2,71 GB y la Q8_0 4,48 GB, utilizables con llama.cpp añadiendo `--repeat-penalty 1.08`.
- Latencia y throughput: no disponibles; no se publican mediciones de tokens por segundo ni de concurrencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / tamano | Licencia | Notas |
|---|---|---|---|---|---|
| rewrite2-4b-nvfp4 | 2,76 B | No disponible | NVFP4 W4A4, 3,70 GiB | Apache 2.0 | Objeto de esta ficha; requiere vLLM con soporte ModelOpt |
| rewrite2-4b-fp8 | 2,76 B | No disponible | FP8 W8A8, 5,15 GiB | Apache 2.0 | Misma receta; mayor peso, menor agresividad de la cuantización |
| rewrite2-4b-bf16 | 2,76 B | No disponible | BF16, 8,47 GiB | Apache 2.0 | Referencia sin cuantizar del mismo modelo |
| rewrite2-4b-gguf | 2,76 B | No disponible | GGUF Q8_0 4,48 GB / Q4_K_M 2,71 GB | Apache 2.0 | Única vía para llama.cpp / Ollama; Q4_K_M amplifica compresión y repetición |
| rewrite2-27b-bf16 | No disponible | No disponible | BF16 | No disponible en la información | Línea de 27B del mismo proyecto; el autor advierte que los pesos no son intercambiables y que la calidad esperada es superior |

No se dispone de datos para comparar con modelos de reescritura de terceros ni con el Qwen3.5-4B base en tareas de estilo.

## Limitaciones y advertencias

- Capacidad limitada por tamaño: la autora advierte explícitamente de que no debe esperarse la calidad del 27B; los tramos complejos y las escenas con muchos personajes requieren corrección humana.
- Compresión por defecto: para 800-950 caracteres de entrada la mediana de salida ronda los 540 caracteres (0,63×). Si se necesita cobertura completa hay que segmentar y añadir la petición explícita en el prompt.
- Riesgo de repetición y bucles: se recomienda `repetition_penalty` de 1,08 como mínimo, junto con `max_tokens` duro y timeouts; el propio autor reconoce que la penalización reduce pero no elimina el problema.
- Longitud de entrada: por encima de 1.200-1.500 caracteres aumentan la copia consecutiva y la compresión; la recomendación es trocear en segmentos de 500-700 caracteres.
- La cuantización de baja precisión agrava la compresión y las repeticiones; Q4_K_M es más propenso que Q8_0 y NVFP4 requiere validación propia antes de producción.
- Prompt no negociable: el modelo está entrenado con una única instrucción de usuario, sin system prompt y sin thinking; usarlo como asistente general o con plantillas distintas produce resultados fuera de distribución.
- Sin capacidad de expansión: solo se entrenó reescritura; los prompts de ampliación no funcionan.
- Visión no operativa: la torre visual permanece en los pesos pero no se entrenó con imágenes; no debe asumirse ninguna capacidad imagen-texto pese al pipeline declarado.
- Monolingüe en chino: no hay garantía de traducción ni de reescritura en otros idiomas.
- Sin validación externa: 0 descargas y 0 likes en el momento de la consulta, sin benchmarks de terceros; las únicas métricas proceden del propio autor y de una sola muestra heldout.
- Licencia Apache 2.0: permite uso comercial y modificación, con las obligaciones habituales de atribución y de conservación del aviso de licencia; no se documentan restricciones adicionales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/aikexue170/rewrite2-4b-nvfp4
- Variante BF16: https://huggingface.co/aikexue170/rewrite2-4b-bf16
- Variante FP8 W8A8: https://huggingface.co/aikexue170/rewrite2-4b-fp8
- Variante GGUF: https://huggingface.co/aikexue170/rewrite2-4b-gguf
- Línea de 27B: https://huggingface.co/aikexue170/rewrite2-27b-bf16
- Espejo en ModelScope (NVFP4): https://modelscope.cn/models/alkaid55555/rewrite2-4b-nvfp4
- Espejo en ModelScope (BF16): https://modelscope.cn/models/alkaid55555/rewrite2-4b-bf16
- Espejo en ModelScope (FP8): https://modelscope.cn/models/alkaid55555/rewrite2-4b-fp8
- Espejo en ModelScope (GGUF): https://modelscope.cn/models/alkaid55555/rewrite2-4b-gguf
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
