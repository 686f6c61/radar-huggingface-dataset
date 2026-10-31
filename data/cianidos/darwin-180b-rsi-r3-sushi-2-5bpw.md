# Cianidos/Darwin-180B-RSI-R3-Sushi-2.5bpw

## Resumen

Darwin-180B-RSI-R3-Sushi-2.5bpw es una cuantización comunitaria, creada por el usuario Cianidos, del modelo Darwin-180B-RSI-R3 publicado por FINAL-Bench. El pack original es un modelo de lenguaje multimodal (image-text-to-text) de arquitectura MoE con razonamiento y contexto largo, convertido aquí al formato Sushi K2.5 (EXL3, codebook MCG) para su ejecución local en Apple Silicon mediante el runtime Sushi 1.3.0 sobre MLX.

El objetivo de esta conversión es permitir la inferencia de un modelo de escala muy grande en hardware de consumidor Apple: el pack conserva los 512 expertos por capa y el enrutado top-10 original, cuantiza los expertos enrutados a 2,5 bits por peso (tasa de código EXL3 K2.5) y el tronco denso a 8 bits afines con MLX. El autor lo ha probado en un Apple M5 Pro con 48 GiB de memoria unificada, usando streaming de expertos desde SSD.

Es relevante porque demuestra que modelos MoE masivos pueden ejecutarse localmente en Mac mediante cuantización agresiva de expertos y carga selectiva desde disco, manteniendo el contexto nativo de 262.144 tokens y las capacidades de visión. El modelo base hereda la arquitectura etiquetada como `qwen4_exp`, con licencia `qwen-community-1.0`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (etiqueta `qwen4_exp`), multimodal (vision-language), con cabeza MTP nativa y tabla n-gram |
| Parametros totales | 24.995.626.899 en los tensores safetensors de este pack (el nombre "180B" hace referencia al modelo base completo; no disponible el desglose exacto) |
| Parametros activos | no disponible (enrutado top-10 sobre 512 expertos por capa, segun la model card) |
| Longitud de contexto | 262.144 tokens nativos (prompt + respuesta), RoPE nativo sin extension a 1M |
| Tipos de cuantizacion | Expertos enrutados: EXL3 K2.5 (2,5 bpw), codebook MCG, ventana 15; tronco denso: MLX affine 8-bit, grupo 64; tabla n-gram: affine 4-bit, grupo 32; KV cache cuantizado a 8 bits |
| Idiomas soportados | ingles, coreano, chino, japones, multilingue |
| Licencia | other (`qwen-community-1.0`) |
| Formato de pesos | Pack Sushi (safetensors indexado + `ngram_table.bin`); no es un checkpoint nativo ExLlamaV3, GGUF ni Transformers estandar |

## Arquitectura y entrenamiento

El modelo base, Darwin-180B-RSI-R3, es un modelo MoE multimodal con 512 expertos por capa y enrutado top-10, cabeza de prediccion multi-token (MTP) nativa y una tabla n-gram para decodificacion asistida. El pack incluye los pesos de vision y la cabeza MTP, por lo que no requiere archivos adicionales del modelo base. La etiqueta `qwen4_exp` y la licencia `qwen-community-1.0` sugieren una base derivada de la familia Qwen, aunque la model card no detalla la arquitectura completa.

Sobre el entrenamiento del modelo base no se proporcionan datos (numero de tokens, composicion del dataset, RLHF/DPO): no disponible. Los dos articulos de arXiv referenciados en los tags (2605.14386 y 2609.20269) no se describen en la model card.

En cuanto a la cuantizacion: se uso Sushi 1.3.0 con MLX 0.32.3 y NAX activado, calibrando con la mezcla por defecto de 65.536 tokens de prosa y codigo, 16 expertos por lote y factorizacion Hessiana en float64. No se aplico poda de expertos ni ajuste fino adicional. La conversion tardo unas 3 horas y 54 minutos en el Mac de origen.

## Capacidades

- Generacion de texto conversacional y razonamiento (tags `reasoning`, `conversational`).
- Comprension multimodal: pipeline image-text-to-text, con pesos de vision incluidos en el pack (se activa con `--vision`).
- Contexto largo nativo de 262.144 tokens (prompt + respuesta).
- Decodificacion acelerada mediante cabeza MTP nativa (multi-token prediction) y tabla n-gram incluida.
- Enrutado MoE top-10 sobre 512 expertos por capa, conservado integramente en la cuantizacion.
- Multilingue: ingles, coreano, chino, japones y otros idiomas.
- Servidor con API compatible con OpenAI (`/v1`) y con Anthropic, mas interfaz de chat y dashboard en el navegador.
- No hay informacion en la model card sobre tool calling, function calling ni capacidades agenticas: no disponible.

## Casos de uso

- Chatbot local multimodal en Mac: el pack permite conversar con imagenes y texto desde un M5 Pro de 48 GiB sin dependencia de la nube, util para prototipado privado de asistentes.
- Analisis de documentos extensos: con 262K tokens de contexto nativo puede procesar informes, contratos o bases de codigo enteros en una sola peticion, activando vision para documentos escaneados.
- Razonamiento y resolucion de problemas: los tags de razonamiento y el modo MTP lo orientan a tareas de razonamiento multi-paso donde la generacion acelerada reduce la latencia.
- Asistencia multilingue: cobertura de ingles, coreano, chino y japones, util para equipos que trabajan con documentacion y comunicacion en idiomas asiaticos.
- Servidor de inferencia personal compatible con OpenAI: la API `/v1` permite integrarlo en editores, clientes de chat o scripts existentes sin cambios de codigo.
- Experimentacion con inferencia eficiente en Apple Silicon: el pack es un caso de estudio de streaming de expertos desde SSD, cuantizacion a 2,5 bpw y reutilizacion de prefijos en disco, util para investigadores de sistemas de inferencia.
- Procesamiento por lotes con reutilizacion de prefijos: la configuracion con `--prefix-cache-disk 100GB` permite reutilizar prefijos grandes entre peticiones en flujos repetitivos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad en la informacion disponible. La model card advierte explicitamente que los resultados publicados por los editores del modelo original describen los modelos Darwin, no la calidad medida de esta cuantizacion.

Unicos datos medidos, correspondientes al rendimiento de inferencia de este pack en un Apple M5 Pro con 48 GiB (configuracion de texto: contexto 32K, presupuesto de streaming 22 GiB, KV8, MTP nativo, sin vision): los valores concretos de tokens/segundo no se incluyen en la informacion proporcionada: no disponible.

## Requisitos de hardware

- Apple Silicon con macOS 26.2 o newer (requisito de Sushi 1.3.0); probado en Apple M5 Pro con 48 GiB de memoria unificada.
- Descarga completa de unos 77,36 GB (45,33 GB en 52 shards indexados + 32 GB de tabla n-gram en disco).
- Configuracion de texto medida: presupuesto de residencia en RAM de 22 GiB (`--ssd-budget-gb`), contexto 32K, KV cache a 8 bits.
- Configuracion de contexto maximo con vision: presupuesto de 28 GiB, limite de memoria cableada GPU elevado a 40 GiB mediante `sysctl iogpu.wired_limit_mb=40960` (solo en Macs de 48 GiB; se restablece al reiniciar).
- No cabe en GPUs NVIDIA de consumidor con este formato: el pack es especifico de Sushi/MLX en Apple Silicon. No hay datos para despliegue en A100, H100 o RTX 4090: no disponible.
- Despliegue: exclusivamente mediante Sushi 1.3.0 (`sushi serve`), con descarga via `hf download`. No compatible con vLLM, llama.cpp, Ollama ni TGI en este formato. No requiere el checkpoint BF16 original.
- Latencia y throughput: no disponible (no se publican cifras concretas en la informacion proporcionada).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato/plataforma | Licencia |
|---|---|---|---|---|
| Darwin-180B-RSI-R3-Sushi-2.5bpw (este pack) | ~25 mil millones en tensores del pack (base "180B") | 262.144 | Sushi/MLX, Apple Silicon | qwen-community-1.0 |
| Darwin-180B-RSI-R3 (base) | no disponible | 262.144 | BF16, Transformers | other (qwen-community-1.0) |
| Qwen3-VL u otros MoE multimodales comparables | no disponible | no disponible | no disponible | no disponible |

No hay datos suficientes en la informacion proporcionada para una comparativa cuantitativa de rendimiento con alternativas de la misma categoria.

## Limitaciones y advertencias

- La etiqueta `2.5bpw` se refiere solo a la tasa de codigo de los expertos enrutados, no a una media sobre todos los tensores ni al tamano de descarga; la perdida de calidad exacta respecto al BF16 no esta medida.
- Solo se ha probado Sushi 1.3.0; otras versiones no estan verificadas. `sushi pull` no acepta este repositorio comunitario: hay que usar `hf download`.
- No debe omitirse `ngram_table.bin` en la descarga, pues no es un shard safetensors y el modelo no funcionara sin el.
- La combinacion de prompt de 262K tokens con imagenes no ha sido sometida a pruebas de esfuerzo; la configuracion de contexto maximo no es la usada en las mediciones.
- Elevar `iogpu.wired_limit_mb` a 40 GiB puede someter a presion de memoria a macOS y otras aplicaciones; no replicarlo en Macs menores.
- Los 16,88 GB de pico durante la conversion no son un requisito de memoria de inferencia.
- Sesgos, riesgo de alucinacion y evaluaciones de seguridad del modelo base: no disponible en la informacion proporcionada.
- Licencia `other` (`qwen-community-1.0`): las condiciones exactas de uso comercial deben revisarse en el archivo LICENSE del repositorio; no disponible su resumen en la model card.
- Modelo muy nicho: 67 descargas y 1 like en el momento de la ficha, sin comunidad de soporte consolidada.

## Enlaces

- Repositorio del pack cuantizado: https://huggingface.co/Cianidos/Darwin-180B-RSI-R3-Sushi-2.5bpw
- Modelo base: https://huggingface.co/FINAL-Bench/Darwin-180B-RSI-R3 (revision fijada: https://huggingface.co/FINAL-Bench/Darwin-180B-RSI-R3/tree/15495159641ac68386ccf446e34e01fb1ad86b53)
- Runtime Sushi: https://github.com/beamivalice/sushi
- Release Sushi 1.3.0: https://github.com/beamivalice/sushi/releases/tag/v1.3.0
- Articulos arXiv referenciados en los tags: arXiv:2605.14386 y arXiv:2609.20269 (sin descripcion en la model card)
