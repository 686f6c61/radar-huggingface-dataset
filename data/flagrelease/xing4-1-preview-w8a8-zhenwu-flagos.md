# FlagRelease/Xing4.1-Preview-W8A8-zhenwu-FlagOS

## Resumen
Xing4.1-Preview es un modelo de lenguaje de arquitectura MoE (Mixture of Experts) desarrollado por FlagRelease, perteneciente a la familia Xingchen Semantic Large Model. Con 279.902.121.728 parámetros totales (~280B) y aproximadamente 17B parámetros activos por token, está disenado especificamente para programacion de agentes y tareas complejas de horizonte largo. Su ventana de contexto nativa de 1M tokens lo posiciona entre los modelos de contexto extendido mas ambiciosos del ecosistema open source.

La version publicada en Hugging Face es una adaptacion W8A8 (cuantizacion INT8 de pesos y activaciones) optimizada para el stack FlagOS y el hardware PPU-ZW810E de T-Head (Zhenwu). Incorpora MLA (Multi-head Latent Attention) para representacion KV comprimida y DSA (DeepSeek Sparse Attention), sobre un backbone Transformer de 45 capas, 42 de ellas MoE. Cada token activa 8 expertos enrutados de un total de 256, mas 1 experto compartido.

Su relevancia radica en dos factores: por un lado, la combinacion de contexto de 1M tokens con atencion dispersa y compresion KV, que reduce el coste computacional frente a atencion densa; por otro, el entrenamiento realizado integramente en plataformas de computo domesticas (chinas) y la adaptacion a FlagOS, que amplia las opciones de despliegue en hardware no-NVIDIA. La licencia Apache 2.0 facilita su adopcion comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con MLA y DSA (sparse attention); 45 capas, 42 MoE |
| Parametros totales | 279.902.121.728 (~280B) |
| Parametros activos | ~17B por token (8 de 256 expertos enrutados + 1 compartido) |
| Longitud de contexto | 1.000.000 tokens (nativa); despliegue validado a 32.768 / 33.768 tokens |
| Tipos de cuantizacion | W8A8 (INT8 pesos y activaciones), formato compressed-tensors |
| Idiomas soportados | Chino (zh), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (custom_code, deepseek_v32), 8-bit |

## Arquitectura y entrenamiento
Xing4.1-Preview emplea un backbone Transformer de 45 capas, de las cuales 42 son capas MoE. El enrutamiento selecciona 8 expertos de 256 expertos enrutados por token, ademas de 1 experto compartido, lo que resulta en ~17B parametros activos sobre un total de ~280B. La representacion KV se comprime mediante MLA (Multi-head Latent Attention), y la atencion utiliza DSA (DeepSeek Sparse Attention) para reducir el coste cuadratico en contextos largos. El modelo se distribuye con `custom_code` y arquitectura `deepseek_v32`, lo que implica que requiere codigo personalizado para su carga (no es un transformer estandar).

El entrenamiento se realizo integramente en plataformas de computo domesticas, segun indica la model card. No se especifican en la informacion disponible el numero exacto de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. La version publicada es una adaptacion W8A8 para el stack FlagOS, que incluye vLLM 0.24.0 con plugin `vllm-plugin-FL`, FlagGems 5.5.0 y FlagTree 0.7.0, con un cambio de plataforma especifico en `models/deepseek_v32/runtime.py` para aceptar INT8 W8A8 y restaurar GEMM INT8 nativo en PPU 810E.

## Capacidades
- Generacion de texto en chino e ingles con modo de razonamiento (thinking mode) conmutable.
- Razonamiento multi-paso y tareas de horizonte largo (long-horizon complex tasks).
- Programacion de agentes y flujos de trabajo de oficina multi-paso.
- Tool calling / function calling y salida estructurada (structured output).
- Generacion de codigo y escenarios empresariales intensivos en documentos.
- Investigacion en profundidad (in-depth research) sobre contextos extensos.
- Capacidad de recuperacion en contextos largos mediante DSA (validada en pruebas de long-context DSA recall).
- Soporte multilingue limitado a chino e ingles.

## Casos de uso
- Atencion al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con contexto muy largo (hasta 1M tokens nativos), lo que permite mantener historiales completos de cliente sin truncamiento.
- Generacion de codigo en produccion: soporta tool calling y salida estructurada, por lo que puede integrarse en pipelines de CI/CD para generar, revisar y parchear codigo con validacion automatizada.
- Agentes autonomos multi-paso: su entrenamiento orientado a agent programming y long-horizon tasks lo hace adecuado para orquestar flujos de trabajo con multiples herramientas y pasos intermedios.
- Investigacion documental profunda: con 1M tokens de contexto puede procesar corpus extensos (informes, expedientes, documentacion legal) y responder preguntas que requieren sintesis de multiples fuentes.
- Automatizacion de oficina: flujos multi-paso sobre documentos, extraccion estructurada y generacion de informes en chino e ingles.
- Despliegue en infraestructura no-NVIDIA: la adaptacion FlagOS permite ejecutarlo en PPU-ZW810E de T-Head, util en entornos con restricciones de suministro de GPU NVIDIA.
- Procesamiento batch de documentos largos: con cuantizacion W8A8 y TP=8 en 8xPPU 810E (96 GB cada una), permite servir cargas de 4k/16k/32k tokens con 64 peticiones concurrentes.

## Benchmarks y rendimiento
La model card incluye una tabla de evaluacion comparativa entre la version NVIDIA original y la version Zhenwu-FlagOS. Los datos disponibles son parciales:

| Metrica | Xing4.1-Preview-W8A8-Nvidia-Origin | Xing4.1-Preview-W8A8-Zhenwu-FlagOS |
|---|---|---|
| Math_500 | 95.20 | En evaluacion |
| GPQA_Diamond | En evaluacion | En evaluacion |

No se han publicado resultados completos de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card menciona pruebas de humo de texto (capitalizacion, sampling, concurrencia, recall DSA en contexto largo) y mediciones de throughput a 4k/16k/32k con 64 peticiones concurrentes en 8xPPU 810E, pero no se proporcionan las cifras de throughput en el texto disponible.

## Requisitos de hardware
- VRAM estimada: el repo ocupa 281,5 GB en safetensors (263 GB de pesos en 276 archivos). En W8A8, el despliegue validado usa 8 aceleradores PPU-ZW810E de 96 GB cada uno, con ~92-93 GB por tarjeta en regimen estable y `gpu-memory-utilization=0.92`.
- GPU recomendadas: el despliegue documentado es en T-Head Zhenwu PPU-ZW810E 96GB x8 (single node). No se documenta despliegue en A100, H100 o RTX 4090 en la informacion disponible.
- Consumer GPU: no cabe en GPU de consumo; el tamano de pesos (263 GB) y la necesidad de TP=8 lo impiden.
- Opciones de despliegue: vLLM 0.24.0 con `vllm-plugin-FL` 0.3.0, FlagGems 5.5.0, FlagGems-vllm 0.3.0, FlagTree 0.7.0, sobre contenedor `harbor.baai.ac.cn/flagrelease-public/285b-zhenwu810e-c147:xing4.1-285b-w8a8-ppu-20261120`. Descarga de pesos via ModelScope. No se documenta soporte para llama.cpp, Ollama o TGI.
- Configuracion de serving: TP=8 (TP4 tambien desplegable), PP=1, block-size 64 (requisito de DSA), max-model-len 32768 (eager) o 33768 (rendimiento), max-num-seqs 8 (eager) o 64 (graph), prefix caching deshabilitado, custom all-reduce deshabilitado.
- Host: memoria >= 2 TB, disco >= 300 GB, Alibaba Cloud Linux 3 (host) y Ubuntu 24.04.2 LTS (contenedor), driver 2.1.1-rbd225, PyTorch 2.13.0.
- Latencia y throughput: no se proporcionan cifras concretas en la informacion disponible; solo se indica que se midio throughput a 4k/16k/32k x 64 concurrentes en 8xPPU 810E.

## Comparativa con modelos similares
No se dispone de datos de rendimiento comparables publicados en la informacion proporcionada para establecer una comparativa cuantitativa fiable. A continuacion se comparan caracteristicas estructurales conocidas:

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Xing4.1-Preview (esta ficha) | ~280B | ~17B | 1M | Apache 2.0 | Hugging Face / ModelScope |
| Alternativa de misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

No se han identificado en la informacion disponible modelos alternativos concretos con los que comparar parametros, contexto y rendimiento de forma verificable. Se indica "no disponible" para evitar inventar datos.

## Limitaciones y advertencias
- Idiomas: solo chino e ingles; no se documenta soporte para castellano ni otros idiomas.
- Sesgos: no se documentan sesgos conocidos en la informacion disponible; cabe esperar los sesgos inherentes a los datos de entrenamiento, no publicados.
- Alucinacion: no se documenta una evaluacion especifica de tasas de alucinacion; como todo LLM, presenta riesgo en tareas factuales, especialmente en contextos largos.
- Contexto: aunque la ventana nativa es de 1M tokens, el despliegue validado se limita a 32.768 / 33.768 tokens (`max-model-len`); usar la ventana completa requeriria configuracion adicional no documentada.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo incluye `custom_code` y depende de un stack propietario (FlagOS, PPU SDK) para su despliegue optimizado; la portabilidad a otros hardware no esta garantizada.
- Produccion: el despliegue documentado requiere hardware PPU-ZW810E x8, host con >= 2 TB de RAM y contenedor Docker especifico; no hay soporte documentado para ecosistemas CUDA convencionales en esta version.
- Madurez: el modelo tiene 0 descargas y 0 likes en Hugging Face en el momento de la ficha, y los benchmarks estan mayoritariamente "en evaluacion"; tratarlo como preview.
- Restricciones del contenedor: sin tmux, requiere `docker exec -d` para el servidor; pesos montados en solo lectura; sin claves SSH ni credenciales Docker incluidas.

## Enlaces
- Hugging Face: https://huggingface.co/FlagRelease/Xing4.1-Preview-W8A8-zhenwu-FlagOS
- Contenedor FlagOS-PPU: `harbor.baai.ac.cn/flagrelease-public/285b-zhenwu810e-c147:xing4.1-285b-w8a8-ppu-20261120`
- Descarga de pesos via ModelScope: `modelscope download --model FlagRelease/Xing4.1-Preview-W8A8-zhenwu-FlagOS`
- Repositorio de plugin vLLM: `flagos-day0/vllm-plugin-FL` (rama `day0-xing4.1-285b-ppu`, commit `cb7146c3`)
- Repositorio FlagGems: `tonyh168/FlagGems` (rama `day0-xing4.1-285b-ppu`, commit `4b24d213f`)
- Repositorio FlagGems-vllm: `tonyh168/FlagGems-vllm` (rama `day0-xing4.1-285b-ppu`, commit `ea835752`)
- Paper, blog o demo oficial: no disponible en la informacion proporcionada.
