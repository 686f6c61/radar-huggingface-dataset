# ProCreations/K2-Horizon-7B-Uno-NVFP4

## Resumen

K2-Horizon-7B-Uno-NVFP4 es una conversión comunitaria a NVFP4 (W4A4) del modelo IFM/K2-Horizon-7B, publicada por el usuario ProCreations. El repositorio empaqueta el modelo base cuantizado junto con el adaptador condicional de difusión Uno (IFM/K2-Horizon-7B-Uno), que se mantiene intacto en BF16 y se carga por separado, y con un runtime probado para una única GPU Blackwell. La model card lo etiqueta como "diffusion-language-model" con "conditional-lora", de modo que la ruta de difusión convive con la ruta autorregresiva del modelo base.

Su relevancia es doble. Por un lado, es uno de los primeros paquetes públicos que aplica NVFP4 nativo (pesos y activaciones de 4 bits con grupos de escalado de 16 valores) a 252 proyecciones lineales de un transformer, usando NVIDIA ModelOpt 0.46.0 y calibración con Hessiano local. Por otro, incluye mediciones reproducibles de perplejidad, velocidad y una demo de agente navegador, algo poco habitual en cuantizaciones comunitarias.

El nombre comercial indica 7B, pero el recuento real de safetensors del repositorio es de 5.526.294.528 parámetros (unos 5,53 mil millones). El repo ocupa 9,4 GB e incluye los pesos empaquetados, el adaptador BF16, código de cuantización, manifiestos de calibración y el runtime. La licencia publicada es Apache 2.0 y el modelo es solo texto. El contexto configurado en el runtime probado es de 32.768 tokens.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No detallada en la información proporcionada; etiquetada como diffusion-language-model con adaptador condicional LoRA ("uno") sobre el transformer K2-Horizon |
| Parametros totales | 5.526.294.528 (~5,53 mil millones) según safetensors, pese a que el nombre indica 7B |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | 32.768 tokens configurados en el runtime probado; contexto nativo del modelo base no disponible |
| Tipos de cuantizacion | NVFP4 W4A4 con grupos de escalado de 16 valores en 252 proyecciones lineales; embeddings, cabeza de salida, normalización y adaptador condicional en BF16; KV cache en BF16; etiqueta "8-bit" en el repositorio |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (más código de modelo K2 personalizado y adaptador separado en `adapter/`) |

## Arquitectura y entrenamiento

El repositorio no describe en detalle la arquitectura del modelo base IFM/K2-Horizon-7B, más allá de las etiquetas "diffusion-language-model" y "conditional-lora". Lo que sí se documenta con precisión es el proceso de cuantización. Se usó NVIDIA ModelOpt 0.46.0 con el preset `NVFP4_W4A4_WEIGHT_LOCAL_HESSIAN_CFG`, un barrido de escalas en FP8 y calibración con Hessiano local. La calibración empleó 128 secuencias de 1.024 tokens (64 de WikiText-103 train y 64 de UltraChat 200k `train_sft`), lo que suma 131.072 tokens. Las revisiones exactas de los modelos de origen, los índices de selección y los hashes de los ficheros de tokens están en `source-pins.json` y `reports/calibration-manifest.json`.

Un detalle arquitectónico relevante es la separación de componentes. El modelo base empaquetado vive en la raíz del repositorio, mientras que el adaptador condicional Uno se distribuye sin cambios en BF16 dentro de `adapter/`. El adaptador se carga de forma independiente y solo se activa en la ruta de difusión; la model card advierte explícitamente de que no debe fusionarse con el modelo autorregresivo. Las proyecciones de atención y MLP cuantizadas se resuelven con kernels NVFP4 nativos (FlashInfer CUTLASS NVFP4 y FA4), con CUDA graphs y kernels de muestreo compilados habilitados, pero con `torch.compile` de modelo completo desactivado porque la build de PyTorch probada falló durante la compilación de grafos de Inductor. No se documenta en la información disponible el número de tokens de entrenamiento del modelo base, la composición de su dataset ni si se aplicaron RLHF o DPO.

## Capacidades

- Generación de texto conversacional en modo texto, con plantilla de chat de razonamiento bajo ("low reasoning") heredada del modelo original.
- Razonamiento con esfuerzo configurable mediante el parámetro `reasoning_effort`; la cuantificación se validó con el ajuste `low`.
- Tool calling: el runtime traduce la generación nativa de herramientas en XML a llamadas JSON con formato OpenAI a través de `/v1/chat/completions` (no streaming).
- Uso como agente en tareas de navegación: la demo BetterWright recorrió 16 artículos de Wikipedia con 31 acciones nativas sin errores.
- Procesamiento de observaciones DOM en vivo, que el propio usuario debe proporcionar al modelo (no hay entrada multimodal).
- Ventana de contexto configurada de 32.768 tokens, suficiente para prompts de varias páginas de HTML, aunque la retención de calidad en contexto largo no se ha establecido para esta conversión.
- Ruta de difusión con adaptador condicional Uno, operativa solo si se carga el adaptador por separado.
- Capacidades multilingües: no disponibles; la model card indica que la retención multilingüe no se ha evaluado.

## Casos de uso

- Agentes de navegación web: el modelo consume texto del DOM en vivo y emite acciones nativas. En la demo publicada completó un recorrido de 16 artículos de Wikipedia con 31 acciones sin errores en 51,17 segundos, con prompts de entre 4.873 y 6.749 tokens por petición.
- Atención al cliente automatizada con herramientas: al traducir herramientas XML a JSON compatible con OpenAI, puede integrarse en backends que ya hablan el protocolo de OpenAI y encadenar consultas a sistemas internos con una ventana de 32.768 tokens.
- Generación de código en local: el ejemplo oficial del repositorio solicita un simulador de señales ferroviarias en Python; encaja en entornos con GPU Blackwell donde el código no puede salir de la máquina.
- Despliegue con requisitos de privacidad: al ejecutarse en un único nodo con Docker y GPU NVIDIA, sirve para prototipos que manejan datos sensibles y no pueden usar APIs externas.
- Investigación en cuantización: el repositorio incluye el código de cuantización, el manifiesto de calibración y los informes crudos, lo que permite reproducir el efecto de NVFP4 sobre la perplejidad y el acuerdo top-1 con BF16.
- Extracción y resumen de documentos largos: la ventana de 32.768 tokens admite concatenar varios documentos técnicos en una sola petición, aunque la degradación en contexto largo no está medida.
- Automatización de flujos multi-paso: el modo de razonamiento bajo reduce tokens de pensamiento, útil cuando la latencia importa más que la profundidad del razonamiento (209-230 tokens/s en el hardware probado).
- Evaluación de kernels NVFP4 en Blackwell: sirve como banco de pruebas para comparar ejecución nativa empaquetada frente a fake-quant de ModelOpt y frente a BF16 con SDPA de Transformers.

## Benchmarks y rendimiento

Los datos publicados son comprobaciones de sanidad sobre un conjunto retenido pequeño (16 secuencias de 512 tokens de WikiText-2 test, 8.176 predicciones del siguiente token), no una batería completa de benchmarks.

| Ejecución | Perplejidad | Relativo a BF16 |
|---|---:|---:|
| BF16 original, Transformers SDPA | 14,22755 | 1,0000 |
| Evaluación fake-quant de ModelOpt | 15,30975 | 1,0761 |
| NVFP4 empaquetado, Uno nativo / FA4 / CUTLASS | 15,51023 | 1,0902 |

La ejecución nativa empaquetada presenta un 84,38 % de acuerdo top-1 con BF16 y una divergencia KL media de 0,13170 nats sobre 256 posiciones muestreadas. La model card no reclama ninguna puntuación de benchmarks del modelo original para esta cuantización, y señala que la retención en razonamiento amplio, multilingüe y contexto largo no se ha establecido.

Rendimiento medido en una RTX PRO 6000 Blackwell Workstation Edition (96 GB), con razonamiento bajo, temperatura 1, top-p 0,95 y top-k 50:

| Escenario | Rendimiento |
|---|---|
| Tree-60 Uno con NVFP4, prompts cortos en caliente | ~209-230 tokens generados/s |
| Tree-60 Uno en BF16, prompts cortos en caliente | ~135-140 tokens/s |
| Tour BetterWright de 16 artículos (incluye prefill repetido de DOM) | 172,03 tokens de salida/s (5.669 tokens en 32,95 s de motor, 32 peticiones) |

Las cifras de prompts cortos corresponden a peticiones individuales de unos 512 tokens de salida, incluyen prefill y decodificación, y excluyen transporte HTTP y carga de página. La primera llamada, con compilación y calentamiento, es bastante más lenta y queda fuera del rango.

## Requisitos de hardware

- GPU Blackwell obligatoria para los kernels NVFP4 nativos; el runtime se validó en SM120. En arquitecturas anteriores no hay ejecución nativa de este checkpoint.
- VRAM estimada: no publicada. El repositorio pesa 9,4 GB y el runtime probado configura un presupuesto del 50 % de memoria en una GPU de 96 GB (unos 48 GB), con 32.768 tokens de contexto y KV cache en BF16.
- GPU recomendadas: RTX PRO 6000 Blackwell Workstation Edition (96 GB), la única validada. Otras GPU Blackwell (por ejemplo, serie RTX 50 o B200) no están probadas según la model card.
- Encaje en GPU de consumo: no confirmado. La cuantización reduce el peso de los pesos, pero el requisito de SM120 y la falta de pruebas fuera de la estación de trabajo de 96 GB impiden afirmarlo.
- Despliegue: SGLang 0.5.19 con imagen fijada, PyTorch 2.13.0+cu130, FlashInfer CUTLASS NVFP4 y FA4. Requiere código de modelo K2 personalizado incluido en el repositorio. Arranque mediante `bash runtime/run.sh`, servidor en `127.0.0.1:30020`, endpoint `/v1/chat/completions` sin streaming.
- Solo se ha validado una GPU y una petición simultánea; no hay datos de throughput agregado con batching.
- Latencia y throughput: 209-230 tokens/s en prompts cortos en caliente con NVFP4 frente a 135-140 tokens/s en BF16, aproximadamente un 50-55 % más rápido en ese escenario concreto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Precisión | Perplejidad (WikiText-2) | Velocidad | Licencia | Disponibilidad |
|---|---|---|---:|---:|---|---|---|
| K2-Horizon-7B-Uno-NVFP4 | 5.526.294.528 declarados en safetensors | 32.768 configurados en el runtime | NVFP4 W4A4 + BF16 en adaptador y KV cache | 15,51023 | ~209-230 tokens/s (RTX PRO 6000 Blackwell) | Apache 2.0 | Repositorio público, 0 descargas y 0 likes |
| IFM/K2-Horizon-7B (BF16) | No disponible | No disponible | BF16 | 14,22755 (medida en el mismo test por el autor de la cuantización) | ~135-140 tokens/s en tree-60 | No disponible | Modelo base público |
| IFM/K2-Horizon-7B-Uno (BF16) | No disponible | No disponible | BF16 | No disponible | No disponible | No disponible | Adaptador público, incluido sin cambios en este repo |

No se dispone de datos en la información proporcionada para comparar con alternativas externas de la misma categoría (por ejemplo, otros modelos de 7B cuantizados a 4 bits) en parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- La cuantización es con pérdida. La perplejidad sube un 9,02 % respecto a BF16 y el acuerdo top-1 con BF16 es del 84,38 %; la divergencia KL media es de 0,13170 nats.
- La construcción de muestreo por rechazo del modo Uno concierne a su distribución autorregresiva objetivo y no convierte un objetivo NVFP4 en equivalente a BF16, según advierte la propia model card.
- No se ha establecido la retención en razonamiento amplio, multilingüe ni contexto largo. Los idiomas soportados no están documentados.
- No se reclama ninguna puntuación de benchmarks del modelo original para esta conversión.
- Las métricas de calidad son comprobaciones de sanidad pequeñas (8.176 predicciones), no una batería completa.
- El adaptador condicional Uno no debe fusionarse con el modelo autorregresivo; hacerlo rompe la separación prevista entre rutas.
- Solo se ha validado una GPU y una petición en curso. No hay datos de batching, concurrencia ni despliegue multinodo.
- Requiere SM120 (Blackwell) y una pila muy concreta: SGLang 0.5.19, PyTorch 2.13.0+cu130, FlashInfer CUTLASS NVFP4 y FA4. Otro hardware no está probado.
- `torch.compile` de modelo completo está desactivado porque la build de PyTorch probada falló en la compilación de grafos de Inductor.
- El endpoint es de solo texto y sin streaming; las tareas de navegador exigen que el usuario aporte observaciones del DOM en vivo.
- Riesgo de alucinación: no cuantificado en la información disponible. El modelo se usó en tareas de selección de consultas y consumo de texto DOM, pero la demo no fue puntuada de forma independiente.
- El repositorio tiene 0 descargas y 0 likes, por lo que no existe validación externa ni reportes de la comunidad.
- Licencia Apache 2.0 para esta conversión, lo que permite uso comercial; las licencias de los modelos base no se indican en la información proporcionada y conviene verificarlas antes de un despliegue en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ProCreations/K2-Horizon-7B-Uno-NVFP4
- Modelo base: https://huggingface.co/IFM/K2-Horizon-7B
- Adaptador condicional Uno: https://huggingface.co/IFM/K2-Horizon-7B-Uno
- Pines de origen: https://huggingface.co/ProCreations/K2-Horizon-7B-Uno-NVFP4/blob/main/source-pins.json
- Manifiesto de calibración: https://huggingface.co/ProCreations/K2-Horizon-7B-Uno-NVFP4/blob/main/reports/calibration-manifest.json
- Demo de navegador en vídeo (53,22 s, sin compresión temporal): https://betterwright-video.ssh.codes/84b4863634e8adc4debe48c3/betterwright-k2-horizon-7b-uno-nvfp4-live.mp4
- La búsqueda web realizada no devolvió ningún resultado relevante sobre este modelo; los enlaces obtenidos no guardan relación con K2-Horizon ni con cuantización NVFP4.
