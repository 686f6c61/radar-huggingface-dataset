# 0xSero/Inkling-2-Small-EXL3-4bpw

## Resumen

Inkling-2-Small-EXL3-4bpw es una cuantización EXL3 de 4 bits del modelo thinkingmachines/Inkling-2-Small, publicada por el usuario 0xSero. El modelo base es un transformer MoE multimodal (image-text-to-text) de 594.000 millones de parámetros totales con 17.000 millones activos por token, según indica la model card. La cuantización reduce el checkpoint original de 393,5 GB a 313 GB cuantizando únicamente los expertos enrutados del MoE a 4,0 bpw uniformes con codebook mcg, dejando el resto de tensores (atención, router, embeddings, torre de visión y cabeza MTP) en BF16 sin modificar.

El interés de esta ficha radica en que permite ejecutar un modelo de escala frontera en hardware de 4 GPUs de 96 GB (RTX PRO 6000) con una pérdida de calidad medida muy contenida: KLD de 0,0213 nats y 97,35 % de acuerdo top-1 frente al checkpoint fuente sobre un conjunto de evaluación de 218.477 tokens. La model card reporta además métricas de rendimiento concretas (prefill de hasta 8.150 tok/s y decode de 224 a 676 tok/s según concurrencia) y un motor de inferencia propio, dado que exllamav3 estándar y TabbyAPI todavía no soportan Inkling-2.

El modelo está pensado para despliegues conversacionales y agénticos con contexto largo, con decodificación especulativa siempre activa y soporte de tool calling. La licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal (image-text-to-text) con cabeza MTP para decodificación especulativa |
| Parametros totales | 594.000 millones (modelo base); 154.131.591.168 según safetensors del repo cuantizado |
| Parametros activos | 17.000 millones (modelo base) |
| Longitud de contexto | Hasta 380K tokens por sesión en el despliegue de referencia (16 sesiones concurrentes) |
| Tipos de cuantizacion | EXL3 trellis 4,0 bpw uniforme con codebook mcg en expertos enrutados; resto en BF16 |
| Idiomas soportados | No disponible (la model card menciona datos multilingües de calibración, sin listado de idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (EXL3), librería exllamav3 |

## Arquitectura y entrenamiento

El modelo base es un transformer con mezcla de expertos (MoE) que activa 17.000 millones de parámetros de un total de 594.000 millones, e incluye una torre de visión que lo habilita para tareas image-text-to-text. Incorpora una cabeza MTP (multi-token prediction) que se usa como borrador para decodificación especulativa. La model card del cuantizador indica que los expertos del checkpoint original están en NVFP4 en las capas 0–39 y en MXFP8 en las capas 40–47.

La cuantización se realizó capa a capa sobre las activaciones del propio modelo cuantizado, de modo que cada capa se calibra con entradas que ya incorporan el error de cuantización acumulado aguas arriba. El conjunto de calibración consta de 4,17 millones de tokens en 916 filas: aproximadamente el 60 % son sesiones reales agénticas y de código con uso de herramientas, y el resto es texto multilingüe, Wikipedia, razonamiento, matemáticas, código, datos estructurados y de function calling; el 12 % de los tokens corresponde a filas de contexto largo de 16K–32K. La Hessiana de cada experto se calcula solo con los tokens que el router le envía (unas 80.000 por experto de media), y los expertos poco enrutados se contraen hacia la covarianza global de la capa. La model card reporta verificación del álgebra del modelo contra la implementación de referencia con un error relativo de ~1e-7 en FP32 y un 100 % de acuerdo en el top-8 del router.

## Capacidades

- Generación de texto conversacional multi-turno con ventanas de contexto muy largas (hasta 380K tokens en el despliegue de referencia).
- Razonamiento y modo de pensamiento (thinking), con datos específicos de calibración para esta capacidad.
- Generación de código y tareas de programación.
- Tool calling y function calling, incluyendo uso de herramientas multi-turno en escenarios agénticos.
- Comprensión de imágenes (pipeline image-text-to-text, torre de visión preservada en BF16).
- Capacidades multilingües (la model card incluye datos multilingües en calibración y evaluación, sin detallar idiomas).
- Decodificación especulativa integrada mediante la cabeza MTP/DSpark, siempre activa en el motor de referencia.
- Razonamiento multi-paso y flujos agénticos, con métricas de calidad específicas para dominios agénticos y de tool calling.

## Casos de uso

- Atención al cliente automatizada: el modelo puede mantener conversaciones multi-turno con contexto muy largo (hasta 380K tokens por sesión y 16 sesiones concurrentes en 4× RTX PRO 6000), lo que permite arrastrar historial extenso y documentación de soporte sin truncar.
- Agentes con uso de herramientas: la model card reporta un KLD de 0,0507 y 96,84 % de acuerdo top-1 en el dominio agéntico multi-turno, lo que lo hace adecuado para pipelines de agentes que encadenan llamadas a APIs y requieren consistencia en la selección de herramientas.
- Generación de código en producción: con KLD de 0,0067 y 98,13 % de acuerdo top-1 en código, puede integrarse en asistentes de programación o revisión automatizada de parches donde la fidelidad al modelo original es crítica.
- Análisis de documentos largos y código base extenso: el soporte de contexto de 380K tokens y el rendimiento medido en prefill (7.016 tok/s a 128K y 42 s hasta el primer token con ~300K tokens) permiten procesar repositorios o expedientes completos en una sola pasada.
- Asistentes multimodales: al conservar la torre de visión en BF16, puede usarse para responder preguntas sobre imágenes combinadas con texto, por ejemplo en soporte técnico con capturas o en análisis de documentación escaneada.
- Razonamiento y resolución de problemas: el dominio de thinking/reasoning muestra KLD de 0,0041 y 97,20 % de acuerdo top-1, adecuado para tareas de análisis que requieren cadenas de razonamiento largas.
- Despliegue on-premise con requisitos de soberanía de datos: al ser Apache 2.0 y ejecutarse en 4 GPUs de 96 GB, encaja en entornos donde no se permite enviar datos a APIs externas.

## Benchmarks y rendimiento

Calidad de la cuantización frente al checkpoint fuente (medida sobre 218.477 tokens retenidos, KLD en nats, menor es mejor):

| Dominio | Tokens | KLD | Acuerdo top-1 | PPL fuente → cuantizado |
|---|---:|---:|---:|---:|
| Agéntico (tool use multi-turno) | 30.695 | 0,0507 | 96,84 % | 3,042 → 3,041 |
| Tool calling | 18.420 | 0,0282 | 96,99 % | 3,920 → 3,927 |
| Código | 15.388 | 0,0067 | 98,13 % | 2,692 → 2,698 |
| Thinking / razonamiento | 18.238 | 0,0041 | 97,20 % | 3,204 → 3,199 |
| Chat | 7.019 | 0,0062 | 97,35 % | 4,573 → 4,575 |
| Multilingüe | 17.507 | 0,0187 | 96,08 % | 5,708 → 5,715 |
| Wiki / general | 12.909 | 0,0172 | 96,35 % | 5,578 → 5,594 |
| Contexto largo (filas de 32K) | 98.301 | 0,0184 | 97,83 % | 2,195 → 2,198 |
| **Total** | **218.477** | **0,0213** | **97,35 %** | **2,951 → 2,954 (+0,1 %)** |

Comparación con la cuantización mixta de 3,48 bpw del mismo autor sobre la misma evaluación: KLD 0,0240 y 96,82 % de acuerdo top-1. La model card señala que buena parte del KLD medido es un suelo numérico: ejecutar el modelo fuente con la cuantización de activaciones NVFP4/MXFP8 para la que fue diseñado desplaza el resultado en una magnitud similar (KLD ≈ 0,037 frente a la referencia BF16).

Rendimiento de inferencia medido el 2026-11-15 en 4× RTX PRO 6000 a 300 W, con decodificación especulativa activa y temperatura 0:

| Métrica | Valor |
|---|---|
| Prefill 8K | 8.150 tok/s |
| Prefill 64K | 7.716 tok/s |
| Prefill 128K | 7.016 tok/s |
| Primer token con prompt de ~300K | 42 s |
| Decode, concurrencia 1 | 224 tok/s |
| Decode, concurrencia 2 | 315 tok/s |
| Decode, concurrencia 4 | 417 tok/s |
| Decode, concurrencia 8 | 523 tok/s |
| Decode, concurrencia 16 | 676 tok/s |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: el repo ocupa 311,8 GB; el despliegue de referencia usa 4 GPUs de 96 GB (384 GB en total), suficiente para el checkpoint más caché KV de 4 bits rotada y 16 sesiones concurrentes a 380K de contexto.
- GPUs recomendadas: 4× RTX PRO 6000 (96 GB, SM120) según la model card; no se documentan otras configuraciones.
- GPU de consumo: no cabe en ninguna GPU de consumo individual; el tamaño del checkpoint (313 GB) exige múltiples aceleradores.
- Opciones de despliegue: motor propio en github.com/0xSero/inkling2-exl3 con imagen Docker de un solo comando y API compatible con OpenAI en el puerto 8000; soporta paralelismo de tensores y de expertos, kernels b12x fusionados de Trellis/EXL3 MoE (integrados en FlashInfer) y caché KV de 4 bits rotada. Exllamav3 estándar y TabbyAPI no soportan Inkling-2 todavía.
- Latencia y throughput: prefill de 8.150 tok/s a 8K y 7.016 tok/s a 128K; decode de 224 tok/s con una sesión hasta 676 tok/s con 16 sesiones; 42 s hasta el primer token con ~300K tokens de prompt. El prefill está shardizado por tokens entre las 4 GPUs con colectivos en anillo mediante copy engines, y los expertos enrutados usan paralelismo de expertos sobre 2 pares de GPUs.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Inkling-2-Small-EXL3-4bpw (esta ficha) | 594B totales / 17B activos | Hasta 380K por sesión en el despliegue de referencia | Apache 2.0 | Hugging Face, motor propio con Docker | KLD 0,0213 y 97,35 % top-1 frente al fuente |
| Inkling-2-Small-EXL3-3.48bpw | 594B totales / 17B activos | No disponible | Apache 2.0 | Hugging Face | Cuantización mixta más pequeña; KLD 0,0240 y 96,82 % top-1 |
| thinkingmachines/Inkling-2-Small (fuente) | 594B totales / 17B activos | No disponible | Apache 2.0 | Hugging Face | Checkpoint original de 393,5 GB con expertos NVFP4/MXFP8 |
| Otros modelos de escala comparable | No disponible | No disponible | No disponible | No disponible | No se dispone de datos de benchmarks estándar para comparar |

## Limitaciones y advertencias

- El ecosistema de inferencia es muy restringido: exllamav3 estándar y TabbyAPI no soportan Inkling-2, por lo que es necesario usar el motor específico del autor (github.com/0xSero/inkling2-exl3) o kernels compatibles.
- Requiere hardware de gama muy alta (4× 96 GB); no es desplegable en GPUs de consumo ni en configuraciones de una sola GPU.
- La cuantización introduce una degradación pequeña pero medible: KLD global de 0,0213 nats y 97,35 % de acuerdo top-1, con el peor dominio en agéntico (KLD 0,0507, 96,84 %).
- Los números de calidad solo son comparables dentro del mismo protocolo de evaluación; la model card advierte explícitamente contra mezclar métricas de conjuntos distintos.
- No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K), por lo que la comparación con otros modelos de la misma categoría no está disponible.
- No se detalla la lista de idiomas soportados ni sesgos conocidos del modelo base en la información disponible.
- El modelo base puede alucinar; no se documentan mecanismos específicos de mitigación en la model card.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del checkpoint fuente (thinkingmachines/Inkling-2-Small) antes de producción.
- El rendimiento reportado se midió con decodificación especulativa activa y temperatura 0; a otras temperaturas o sin la cabeza MTP las cifras pueden variar.

## Enlaces

- Modelo cuantizado en Hugging Face: https://huggingface.co/0xSero/Inkling-2-Small-EXL3-4bpw
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Small
- Cuantización alternativa de 3,48 bpw: https://huggingface.co/0xSero/Inkling-2-Small-EXL3-3.48bpw
- Motor de inferencia: https://github.com/0xSero/inkling2-exl3
- Exllamav3: https://github.com/turboderp-org/exllamav3
- Local Inference Lab: https://github.com/local-inference-lab
- Kernels b12x en FlashInfer: https://github.com/flashinfer-ai/flashinfer/tree/main/flashinfer/experimental/b12x
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
