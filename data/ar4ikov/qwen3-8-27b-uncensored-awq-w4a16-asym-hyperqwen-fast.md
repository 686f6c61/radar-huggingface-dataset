# Ar4ikov/Qwen3.8-27B-Uncensored-AWQ-W4A16-ASYM-HyperQwen-fast

## Resumen

Qwen3.8-27B-Uncensored-AWQ-W4A16-ASYM-HyperQwen-fast es una cuantizacion del finetune abliterado Qwen3.8-27B-Uncensored, empaquetada por Ar4ikov para su uso con el stack HyperQwen (fork de vLLM con decodificacion especulativa MTP y kernels int8 asimetricos). El modelo parte de la arquitectura hibrida de Qwen3.8-27B (Gated DeltaNet combinado con atencion clasica, torre de vision y cabeza MTP) y conserva el cuerpo en int4 AWQ asimetrico con grupo 128 y zero points, mientras que la torre de vision, las proyecciones de compuerta SSM y las normas de la cabeza MTP permanecen en bf16.

La particularidad de este repositorio frente al export base es que aplica el pipeline `prepare/` de HyperQwen: convierte `lm_head` a int4 GPTQ (calibrado sobre 400k estados ocultos finales del propio modelo), `embed_tokens` y el modulo MTP a int8, y anade una cabeza drafter de 40.960 filas recortada del `lm_head` int4. El objetivo declarado es servir un modelo de 27B multimodales en una unica GPU de 24 GB dejando espacio para cache KV y decodificacion especulativa.

Es relevante porque demuestra una via practica de despliegue de un modelo hibrido SSM/atencion con vision en hardware de consumo, con mediciones publicadas sobre RTX 3090 (hasta 135,9 tok/s en un solo stream y 434 tok/s con 8 streams concurrentes). La licencia Apache-2.0 y el formato compatible con vLLM 0.29 lo hacen directamente evaluable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido Gated DeltaNet + atencion, con torre de vision y cabeza MTP (multi-token prediction) |
| Parametros totales | 27.356.728.560 (27,36B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 65.536 tokens en configuracion `CTX=fast`; 49.152 con `DFLASH_MAX_LEN`; 40.000 en la linea de produccion con int8 en activaciones |
| Tipos de cuantizacion | Cuerpo int4 AWQ asimetrico W4A16 grupo 128 con zero points; `lm_head` int4 GPTQ simetrico g128; `embed_tokens` y MTP int8 g128 simetrico; torre de vision en bf16; variante W4A8 (int8 en activaciones) documentada en el repo TurboQwen |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors con compressed-tensors (AWQ), disenado para vLLM |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen3.8-27B: un transformer hibrido de 64 capas que combina capas Gated DeltaNet (SSM lineal con compuertas) y capas de atencion clasica, mas una torre de vision para entrada image-text-to-text y un modulo MTP (8 lineales, incluida `mtp.fc`) que actua como drafter para decodificacion especulativa. El checkpoint original fue cuantizado desde pesos bf16 con llm-compressor usando AWQ asimetrico (grupo 128, zero points) y mappings especificos para las capas hibridas Gated-DeltaNet/atencion, documentados en el `recipe.yaml` del export fuente.

Sobre esa base, este repositorio aplica el pipeline de HyperQwen: `lm_head` pasa de bf16 (2,5 GB) a int4 GPTQ simetrico calibrado con 400k estados ocultos finales del modelo (KL de 0,0070 con RTN a 0,0024 con GPTQ frente a la cabeza bf16); `embed_tokens` pasa a int8 con error de ida y vuelta del 0,65%; y el modulo MTP completo a int8. Se anade ademas una cabeza drafter de 40.960 filas (int4, recortada del `lm_head`) junto con `mtp_draft_vocab_ids.pt`. No se documentan en la informacion disponible los detalles del entrenamiento del modelo base (numero de tokens, composicion del dataset, RLHF/DPO) ni del proceso de abliteracion aplicado por orcarouter.

## Capacidades

- Generacion de texto y conversacion multi-turno en formato chat.
- Razonamiento y respuesta a instrucciones, heredado de Qwen3.8-27B.
- Procesamiento de imagen y texto (pipeline `image-text-to-text`): descripcion de imagenes con formas geometricas y texto, verificado en el smoke test del autor.
- Decodificacion especulativa con cabeza MTP: aceptacion de 2,74 a 3,44 tokens por paso segun perfil.
- Comportamiento "uncensored" (abliterado): menor rechazo a peticiones que el modelo base alineado.
- Capacidades de codigo y matematicas: no verificadas explicitamente en la informacion disponible, aunque plausibles por herencia del modelo base.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles (el campo de idiomas no esta poblado).

## Casos de uso

- Despliegue en una unica GPU de 24 GB: el checkpoint esta empaquetado para que una RTX 3090 o 4090 aloje el modelo completo con cache KV (80.185 tokens en perfil `CTX=fast`), lo que permite servir un 27B multimodal en estaciones de trabajo sin multi-GPU.
- Inferencia de imagenes en local: con `VISION=1` la torre se transmite desde RAM del host por imagen; util para clasificacion, descripcion o extraccion de informacion de capturas y documentos escaneados sin salir del equipo.
- Servicio conversacional de baja latencia: los perfiles medidos alcanzan 112,7-135,9 tok/s en un stream y TTFT de 96 ms en la linea de produccion (40k de contexto), adecuado para chatbots interactivos.
- Procesamiento por lotes con concurrencia: 434 tok/s con 8 streams en el perfil `SPEC=mtp CTX=fast`, util para pipelines de generacion masiva de texto o anotacion de imagenes.
- Investigacion sobre alineacion y modelos abliterados: al ser un finetune uncensored con licencia Apache-2.0, sirve para estudiar el efecto de la abliteracion en calidad, sesgos y tasas de rechazo frente al Qwen3.8-27B original.
- Evaluacion de tecnicas de cuantizacion y decodificacion especulativa: el repositorio incluye la receta completa (AWQ asimetrico, GPTQ para `lm_head`, drafter MTP) y benchmarks reproducibles, lo que lo convierte en banco de pruebas para comparar W4A16 frente a W4A8 e int8 Marlin.
- Backend de aplicaciones con contexto largo: 65.536 tokens permiten resumir documentos extensos o mantener historiales de conversacion amplios, con la salvedad de que el contexto efectivo baja a 40k-49k en los perfiles con int8 o DFlash2.

## Benchmarks y rendimiento

Mediciones publicadas por el autor en RTX 3090 (350 W), vLLM 0.29.0, script `bench/run_benchmarks.sh single`, segunda ejecucion tras el arranque, `VISION=1`. C1 = un stream con prompts reales y respuestas de 1.024 tokens; tok/step = tokens aceptados por forward pass.

| Perfil | C1 T=default (tok/s) | C1 T=0 (tok/s) | tok/step | C8 T=default (tok/s) | Pool KV |
|---|---|---|---|---|---|
| `SPEC=mtp CTX=fast` (64k, KV bf16) | 112,7 | 127,6 | 2,74 / 2,95 | 434 | 80.185 |
| `SPEC=dflash2 CTX=fast KV_MEM=4.600.000.000 DFLASH_MAX_LEN=49152` | 135,9 | 139,3 | 3,29 / 3,29 | 401 | 53.233 |
| Produccion: DFlash2 k=15 + `INT8_ACT=int8 PREFILL_ATTN=int8` (40k, TTFT 96 ms) | 116,7 | 135,5 | 2,97 / 3,44 | n/a (4 slots) | 42.113 |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el checkpoint ocupa 16,1 GB en disco; con cache KV bf16 y contexto de 64k el perfil `CTX=fast` reserva un pool de 80.185 tokens, lo que encaja en 24 GB. El perfil DFlash2 reduce el pool a 53.233 tokens y el de produccion con int8 a 42.113.
- GPU recomendadas: RTX 3090 (medido), RTX 4090 y tarjetas de 24 GB en general; A100/H100 no estan medidos pero son compatibles con vLLM 0.29.
- Cabe en GPU de consumo: si, en tarjetas de 24 GB. No hay datos para 16 GB o menos.
- Opciones de despliegue: vLLM 0.29.0 estandar (`vllm serve ... --max-model-len 65536`, sin decodificacion especulativa ni ruta int8 Marlin); fork HyperQwen rama `awq-asym` (vLLM 0.29.0 + serie de parches + `marlin-int8-asym-zp`) para MTP, drafter e int8; contenedor Docker de TurboQwen con perfiles `single`.
- Latencia y throughput: TTFT de 96 ms en la linea de produccion a 40k de contexto; 112,7-135,9 tok/s en un stream y 401-434 tok/s con 8 streams segun perfil.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Este modelo (HyperQwen-fast) | 27,36B | 65.536 (hasta 40k en produccion) | int4 AWQ asim. + int4 GPTQ `lm_head` + int8 MTP | Apache-2.0 | Drafter MTP incluido, 135,9 tok/s en RTX 3090 |
| Ar4ikov/Qwen3.8-27B-Uncensored-AWQ-W4A16-ASYM-HyperQwen | 27,36B | no disponible | igual, con `lm_head` en int8 | Apache-2.0 | +0,6% menos de perplejidad, algo menos de tok/s |
| Ar4ikov/Qwen3.8-27B-Uncensored-AWQ-W4A16-ASYM | 27,36B | no disponible | int4 AWQ asim. g128, sin pipeline HyperQwen | Apache-2.0 | Export fuente; sin drafter ni cabezas int8 |
| Qwen/Qwen3.8-27B | 27B (aprox.) | no disponible | bf16 original | Apache-2.0 | Modelo raiz alineado; requiere mas VRAM |

No se dispone de datos de benchmarks de calidad para establecer comparaciones de rendimiento frente a alternativas de otros fabricantes.

## Limitaciones y advertencias

- Modelo abliterado: la eliminacion de rechazos implica que puede generar contenido toxico, ilegal o inseguro sin filtros; requiere moderacion externa en produccion.
- Riesgo de alucinacion: no se han publicado evaluaciones de factualidad; al ser un finetune uncensored, la calibracion de la confianza puede diferir del modelo base.
- Idiomas no declarados: no hay informacion sobre cobertura multilingue ni calidad por idioma.
- Contexto efectivo variable: los perfiles con DFlash2 y con int8 en activaciones reducen el contexto a 49.152 y 40.000 tokens respectivamente.
- Dependencia de parches: la decodificacion especulativa MTP, el drafter y la ruta int8 Marlin requieren el fork HyperQwen (`awq-asym`); con vLLM estandar se pierden esas optimizaciones.
- Vision con coste: en el benchmark la torre se transmite desde RAM del host por imagen, lo que anade latencia no reflejada en los tok/s de generacion.
- Licencia Apache-2.0 permite uso comercial, pero la responsabilidad sobre el contenido generado por un modelo sin alineacion recae en el desplegador.
- Datos de entrenamiento del finetune uncensored no documentados en la informacion disponible, lo que dificulta auditorias de sesgo.

## Enlaces

- Hugging Face: https://huggingface.co/Ar4ikov/Qwen3.8-27B-Uncensored-AWQ-W4A16-ASYM-HyperQwen-fast
- Export fuente: https://huggingface.co/Ar4ikov/Qwen3.8-27B-Uncensored-AWQ-W4A16-ASYM
- Variante con `lm_head` int8: https://huggingface.co/Ar4ikov/Qwen3.8-27B-Uncensored-AWQ-W4A16-ASYM-HyperQwen
- Modelo uncensored de origen: https://huggingface.co/orcarouter/Qwen3.8-27B-Uncensored
- Modelo raiz: https://huggingface.co/Qwen/Qwen3.8-27B
- HyperQwen: https://github.com/syv-ai/HyperQwen
- Fork con parches AWQ asimetricos: https://github.com/Ar4ikov/HyperQwen/tree/awq-asym
- TurboQwen (contenedor y benchmarks): https://github.com/Ar4ikov/TurboQwen
