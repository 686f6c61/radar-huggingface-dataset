# dbirks/clef-omni-int4

## Resumen

clef-omni-int4 es una cuantización INT4 del modelo Cloudflare/clef-omni, publicada por el usuario dbirks. Se trata de un modelo de decisión multimodal: en lugar de generar texto libre, recibe un estado (observación textual, imagen, audio o vídeo) y un conjunto de preguntas con opciones, y devuelve una distribución de probabilidad por opción a través de una cabeza de decisión conjunta denominada Clef. La arquitectura de partida es qwen3_omni_moe, un transformer multimodal con mezcla de expertos (MoE).

El checkpoint aplica cuantización weight-only W4A16 con AutoRound 0.16.0 (group size 128, simétrica) y limita la cuantización a los expertos MoE del módulo thinker; atención, router, embeddings, lm_head, torres de visión y audio, y la cabeza de decisión Clef permanecen en BF16. El resultado ocupa 19,4 GiB de pesos en VRAM (20,8 GiB de pico) frente a los aproximadamente 60 GiB del modelo BF16 original, y mantiene una concordancia del 96,1 % con la respuesta principal del BF16 en 258 preguntas reservadas.

Su relevancia actual es práctica: es la única variante de la familia que reduce de verdad el consumo de VRAM en transformers hoy, carga en GPUs no Blackwell, y permite servir el modelo completo en hardware de gama alta de consumidor. Los benchmarks del Decision Index están pendientes de publicación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE multimodal basada en qwen3_omni_moe (Qwen3-Omni) con cabeza de decisión conjunta Clef |
| Parametros totales | 6.606.858.864 (recuento de safetensors del repo cuantizado; el modelo base BF16 ocupa 70,8 GB en disco) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT4 W4A16 weight-only, group size 128, simétrica, formato auto_round con empaquetado auto_gptq; activaciones en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (AutoRound) |
| Tamaño en disco | 20,8 GB |
| VRAM de pesos | 19,4 GiB (20,8 GiB de pico) |
| Modelo base | Cloudflare/clef-omni (revisión 0db1cd2) |

## Arquitectura y entrenamiento

El modelo hereda la topología multimodal de Qwen3-Omni en su variante MoE: un módulo thinker con expertos dispersos, torres separadas de visión y audio, y una cabeza de decisión conjunta Clef que produce probabilidades por opción en una sola pasada de forward. La innovación de este checkpoint no está en la arquitectura, sino en el esquema de cuantización: solo se cuantizan a INT4 los expertos MoE del thinker, mientras que atención, router, embeddings, lm_head, las torres de visión y audio y la cabeza Clef se mantienen en BF16. La cabeza de decisión es byte-idéntica a la del modelo original.

El procedimiento de cuantización emplea Intel AutoRound 0.16.0 con esquema W4A16, 200 pasos de ajuste por bloque (SignRound), 512 muestras de calibración en formato Clef alimentadas por la ruta forward multimodal real del modelo, batch size 1 y acumulación de gradiente de 8, con `ignore_layers=mlp.gate,lm_head,self_attn`. El handler de Qwen3-Omni de AutoRound desfunde los expertos fusionados de transformers 5 en lineales por experto. El entorno usado fue torch 2.11.0+cu130 y transformers 5.10.2 sobre una RTX PRO 6000 Blackwell. No se documenta entrenamiento adicional, RLHF ni DPO: es una cuantización post-entrenamiento del modelo base.

## Capacidades

- Decisión entre opciones: devuelve probabilidades por opción (por ejemplo, acciones de tipo `choice`) mediante la cabeza conjunta Clef, en una única pasada de forward.
- Entrada multimodal: acepta observaciones de texto, imagen, audio y vídeo, según la model card del modelo base.
- Conjunto de preguntas múltiples: la API `/v1/systemone` admite varias preguntas con criterios distintos en una misma llamada.
- Integración como servicio: servidor HTTP SystemOne con endpoints `GET /healthz` y `POST /v1/systemone`.
- Compatibilidad con transformers: el checkpoint carga de forma nativa en formato AutoRound.
- Optimización de inferencia: `serve_clef.py` reagrupa los 128 expertos int4 por capa y los ejecuta como una dequantización más una matmul agrupada, en lugar del bucle Python por experto de AutoRound.
- No se documentan capacidades de generación de texto abierta, tool calling, agentes multi-paso ni modo thinking en la información disponible.

## Casos de uso

- IA de personajes no jugadores en videojuegos: el modelo recibe el estado del mundo como observación textual (por ejemplo, "el jugador está frente a una pared") y devuelve probabilidades sobre acciones discretas como girar a la izquierda, girar a la derecha o avanzar. La latencia de 0,21 s por decisión en una RTX PRO 6000 lo hace viable para bucles de decisión de baja frecuencia.
- Selección de acciones en robótica y agentes encarnados: al aceptar imagen, audio y vídeo además de texto, puede alimentarse con la percepción del entorno y producir una distribución sobre el siguiente movimiento, integrable en un planificador que consuma probabilidades en lugar de texto.
- Enrutado de peticiones en pipelines de agentes: el endpoint `/v1/systemone` admite varias preguntas simultáneas, de modo que una sola llamada puede resolver a la vez la elección de herramienta, el idioma de respuesta y el nivel de escalado, sustituyendo cadenas de clasificadores independientes.
- Moderación y triaje de contenido multimodal: dado un estado con imagen o vídeo más una pregunta de tipo elección (permitir, revisar, bloquear), el modelo emite la probabilidad de cada categoría, lo que permite fijar umbrales operativos según el coste del falso negativo.
- Anotación asistida de datasets: la concordancia del 96,1 % con el BF16 y una divergencia total media de 0,033 permiten usar el cuantizado para preetiquetar grandes volúmenes de registros con revisión humana solo en los casos de baja confianza.
- Despliegue en hardware de gama alta de consumidor: con 19,4 GiB de pesos en VRAM, cabe en una GPU de 24 GB, lo que habilita entornos de desarrollo, demos locales y pruebas de integración sin acceso a clústeres de 70 GB.
- Evaluación y reproducción de investigación: el kit público Decision Index puede ejecutarse contra `/v1/systemone` para reproducir resultados y comparar variantes de cuantización sobre el mismo conjunto de preguntas.
- Inferencia sobre AMD (ROCm): los kernels PyTorch/Triton de AutoRound funcionan en ROCm según el autor, aunque no se ha verificado; es una vía para desplegar el modelo fuera de CUDA sin recurrir a NVFP4.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. Los benchmarks del Decision Index 0.2.1 figuran como pendientes. Lo único reportado es la paridad con el modelo BF16 original sobre 258 preguntas reservadas (128 registros, texto procedente de `ultrachat_200k` test_sft en el esquema estado/preguntas de Clef, con aproximadamente un 20 % de imagen, vídeo o audio sintéticos nunca usados en calibración).

| Metrica | dbirks/clef-omni-int4 | dbirks/clef-omni-nvfp4 | Cloudflare/clef-omni (BF16) |
|---|---|---|---|
| Formato | INT4 W4A16 g128 (AutoRound) | NVFP4 W4A4 (ModelOpt) | BF16 |
| Tamaño en disco | 20,8 GB | 22,0 GB | 70,8 GB |
| VRAM de pesos | 19 GiB | 60 GiB | 60 GiB |
| Concordancia con BF16 (respuesta principal) | 96,1 % | 92,3 % | referencia |
| Divergencia total media (TV) | 0,033 | no disponible | referencia |
| Preguntas evaluadas | 258 | 258 | 258 |
| Decision Index 0.2.1 | pendiente | pendiente | pendiente |
| Latencia por decisión | ~0,21 s (RTX PRO 6000 Blackwell) | no disponible | no disponible |

## Requisitos de hardware

- VRAM de pesos: 19,4 GiB, con un pico de 20,8 GiB durante la carga según el autor.
- GPU recomendadas: RTX PRO 6000 Blackwell (medición reportada de 0,21 s por decisión con `serve_clef.py`); cualquier GPU reciente con al menos 24 GB de VRAM debería bastar para los pesos.
- Cabe en GPU de consumidor: sí, en tarjetas de 24 GB como la RTX 4090, dado que los pesos ocupan 19,4 GiB. El margen para activaciones, caché de KV y torres multimodales no está cuantificado en la información disponible.
- No requiere tensor cores FP4: funciona en tarjetas no Blackwell.
- AMD (ROCm): los kernels PyTorch/Triton de AutoRound se ejecutan teóricamente en ROCm, pero no ha sido probado por el autor.
- Despliegue: carga nativa en transformers; script `serve_clef.py` (PEP 723, ejecutable con `uv`) con modo `--demo` y modo servidor; servidor HTTP SystemOne en `/v1/systemone` y comprobación de salud en `GET /healthz`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia: aproximadamente 0,21 s por decisión en RTX PRO 6000 Blackwell, con una velocidad similar a BF16 según el autor; no se publica throughput agregado ni latencia por token.
- Opción `--no-fast-moe` para desactivar la agrupación de expertos y volver al bucle por experto de AutoRound.

## Comparativa con modelos similares

| Modelo | Formato | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| dbirks/clef-omni-int4 | INT4 W4A16 g128, safetensors | 6.606.858.864 (recuento safetensors) | no disponible | 96,1 % de concordancia con BF16; TV media 0,033 | Apache 2.0 | HuggingFace, 0 descargas |
| dbirks/clef-omni-nvfp4 | NVFP4 W4A4, safetensors | no disponible | no disponible | 92,3 % de concordancia con BF16 | Apache 2.0 (heredada) | HuggingFace |
| Cloudflare/clef-omni | BF16, safetensors | no disponible (70,8 GB en disco) | no disponible | referencia | Apache 2.0 | HuggingFace |

No se dispone de datos de otros modelos comparables de la misma categoría (modelos de decisión multimodales) en la información proporcionada.

## Limitaciones y advertencias

- La concordancia con el modelo BF16 es del 96,1 %, no del 100 %; el propio autor fija el objetivo en el 98 %. Un 3,9 % de decisiones puede diferir en la respuesta principal.
- La divergencia total media de 0,033 indica que, incluso coincidiendo en la opción principal, las distribuciones de probabilidad no son idénticas al BF16. Esto importa si se aplican umbrales de confianza calibrados sobre el modelo original.
- Los benchmarks del Decision Index 0.2.1 están pendientes, por lo que no hay una métrica pública de calidad absoluta, solo de paridad relativa.
- Solo se cuantizan los expertos MoE del thinker: el resto de componentes sigue en BF16, lo que limita el ahorro real de VRAM y deja la huella en 19,4 GiB.
- La variante NVFP4 no ahorra VRAM en transformers actualmente, porque no existen kernels para NVFP4 empaquetado y los pesos se descomprimen a BF16.
- No se documentan idiomas soportados ni longitud de contexto, lo que impide garantizar cobertura multilingüe o conversaciones de contexto largo.
- Es un modelo de decisión, no un generador de texto abierto: no debe esperarse uso conversacional directo ni tool calling.
- El soporte en ROCm no ha sido probado, solo inferido por el tipo de kernels.
- La licencia declarada es Apache 2.0, pero al derivar de Cloudflare/clef-omni conviene verificar las condiciones del modelo base antes de un uso comercial.
- El repositorio presenta 0 descargas y 0 likes, por lo que no cuenta con validación de la comunidad ni con informes independientes de fallos.
- Como cualquier modelo multimodal, mantiene riesgo de alucinación en la interpretación de entradas visuales o sonoras; no se han publicado evaluaciones específicas de robustez.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dbirks/clef-omni-int4
- Modelo base: https://huggingface.co/Cloudflare/clef-omni
- Variante NVFP4: https://huggingface.co/dbirks/clef-omni-nvfp4
- Script de servicio `serve_clef.py`: https://huggingface.co/dbirks/clef-omni-int4/resolve/main/serve_clef.py
- Repositorio donde se mantiene el script: https://github.com/dbirks/home-k8s/blob/main/scripts/clef-omni/serve_clef.py
- Kit Decision Index: https://github.com/apolinario/decision-index
