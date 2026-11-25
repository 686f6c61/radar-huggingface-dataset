# diffbot/DeepSeek-V4.1-Flash-EXL3-3bpw-2x-RTX-PRO-6000

## Resumen

DeepSeek-V4.1-Flash-EXL3-3bpw-2x-RTX-PRO-6000 es una cuantización comunitaria de DeepSeek-V4.1-Flash-1017, un modelo de lenguaje de arquitectura Mixture-of-Experts (MoE) desarrollado por DeepSeek. El autor de la cuantización es diffbot, que publica un empaquetado optimizado para servir el modelo completo, incluida su ventana de contexto de 1M de tokens, sobre dos GPU RTX PRO 6000 Blackwell (sm_120, 96 GB cada una) mediante vLLM con tensor-parallel 2.

El modelo original cuenta con 218.691.507.682 parámetros totales (unos 218,7 B). La cuantización aplica EXL3 de 3 bits calibrado a los expertos enrutados, mientras que el resto de tensores conservan el formato FP8 original de DeepSeek. Un tercio de los expertos enrutados permanece en RAM del host (pinned), ejecutándose con kernels personalizados sm_120 o con un runtime opcional de CPU sobre un host AVX-512.

Su relevancia radica en que permite desplegar un modelo de escala frontera con contexto de 1M de tokens en hardware de dos estaciones de trabajo, manteniendo una fidelidad alta respecto al original (KL media de 0,011 nats en texto de codificación agéntica, GSM8K-200 del 98,5 % y HumanEval del 97,0 %). El repositorio ocupa 1035,8 GB, aunque el pack de pesos propiamente dicho son 332 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE), transformer; pesos base en FP8, expertos enrutados en EXL3 3-bit |
| Parametros totales | 218.691.507.682 (~218,7 B) |
| Parametros activos | no disponible |
| Longitud de contexto | 1M tokens (1.048.576); KV cache FP8 de 1,07M tokens en 2,81 GiB |
| Tipos de cuantizacion | EXL3 3-bit (expertos enrutados, calibrado), FP8 (resto de tensores), int4 (tablas Engram); drafter con expertos EXL3 3-bit |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (`model-00001` a `model-00048`) |

## Arquitectura y entrenamiento

El modelo base es DeepSeek-V4.1-Flash-1017, un transformer con mezcla de expertos (MoE) cuyos detalles de entrenamiento (número de tokens, composición del dataset, uso de RLHF o DPO) no se especifican en la información disponible. La model card de esta cuantización se centra en el proceso de compresión y servicio, no en el preentrenamiento del modelo original.

La innovación técnica principal de este pack es el esquema de cuantización: los expertos enrutados se comprimen a EXL3 de 3 bits con calibración propia (método de coolbho3k), mientras que el resto de tensores mantienen FP8. El servidor vLLM en tensor-parallel 2 mantiene un tercio de los expertos en RAM del host, ejecutables mediante kernels sm_120 personalizados (`xmoe`, `xmoe_bulk`, `xmoe_do`, `xmoe_do_i8`, `fp8ar`, `rowtopk`, `sparse_mla_epilogue`, `mxfp8_pingpong`) o un runtime de CPU AVX-512 (VNNI, VBMI, VBMI2). Incluye además decodificación especulativa con un drafter DSpark opcional ajustado a código (`DS41_DRAFTER=code`, `SPEC_K=7`). La ruta de prefill se mantiene bit-idéntica al original; solo un cambio en la ruta de decode (el runtime de CPU omite el enrutamiento de expertos para filas de borrador que va a rechazar) no es bit-exacto.

## Capacidades

- Generación de texto y razonamiento de propósito general, con modo de pensamiento desactivable (los benchmarks se midieron con thinking off y decodificación greedy).
- Codificación y uso de herramientas: el benchmark de referencia es una prueba de codificación agéntica multi-turno de 104 turnos con tool calls.
- Soporte de tool calling / function calling, validado con `bench/test-toolcall.py`.
- Capacidades agénticas multi-paso con definiciones de herramientas enviadas en cada petición.
- Procesamiento de imágenes: el pack incluye `bench/test-image.py`, lo que indica soporte multimodal de entrada de imagen.
- Contexto largo real: recuperación tipo needle a 1M tokens y tool call posterior funcional.
- Decodificación especulativa opcional orientada a código y uso agéntico de herramientas.

## Casos de uso

- Codificación agéntica multi-turno: el pack está optimizado para sesiones con tool calls repetidos; con el runtime de CPU alcanza 277-289 tokens/s de salida en una sesión y 154-159 tokens/s con cuatro sesiones concurrentes, adecuado para asistentes de IDE que iteran sobre un repositorio.
- Análisis de repositorios completos: con 1M tokens de contexto puede ingerir bases de código extensas en una sola petición; un prompt de 1,04M tokens se prellena en 93 s (11.179 tokens/s) con el runtime de CPU.
- Generación de código en producción: HumanEval del 97,0 % y 214,8-223,2 tokens/s de decodificación frente a un prompt de código de 46K tokens permiten integrarlo en pipelines de revisión y generación con latencia interactiva.
- Automatización de operaciones con herramientas: el soporte de function calling y el modo agéntico permiten orquestar llamadas a APIs internas, consultas a bases de datos y ejecución de comandos en flujos multi-paso.
- Procesamiento de documentos largos con imagen: la combinación de contexto de 1M tokens y entrada de imagen sirve para extraer y razonar sobre informes, planos o capturas junto a texto extenso.
- Evaluación y experimentación en investigación: al ser una cuantización fiel (KL 0,011 nats en texto agéntico) con licencia MIT, es útil para reproducir resultados del modelo original en laboratorios con dos GPU de 96 GB en lugar de clústeres mayores.
- Servicio de chat de contexto largo: la KV cache FP8 de 1,07M tokens ocupa solo 2,81 GiB, lo que permite mantener conversaciones muy largas sin agotar memoria.

## Benchmarks y rendimiento

Calidad (comparada con el checkpoint original 1017):

| Metrica | Original 1017 (2ª ejecución) | Este pack, runtime CPU | Este pack, solo GPU |
|---|---:|---:|---:|
| KL, texto neutro (nats) | 0,0082 | 0,0520 | 0,0522 |
| KL, código (nats) | 0,0050 | 0,0309 | 0,0306 |
| KL, agéntico (nats) | 0,0047 | 0,0110 | 0,0111 |
| KL, short100 (nats) | no disponible | 0,0349 | 0,0338 |
| GSM8K-200 | no disponible | 98,5 % | 98,5 % |
| HumanEval | no disponible | 97,0-97,6 % | 97,0 % |

Velocidad en 2× RTX PRO 6000:

| Configuracion | Codificación agéntica, 1 sesión | Código, 1 stream (prompt 46K) | Prefill fresco (40K tokens) | Agregado bajo carga | Contexto |
|---|---:|---:|---:|---|---|
| Runtime CPU (`CPU_EXPERTS=1`) | 277-289 t/s | 214,8-223,2 t/s | 14.333-15.244 t/s | 4 sesiones agénticas: 154-159; cuatro streams de 46K: 470,0-505,2 | Ventana 1M; KV FP8 de 1,07M tokens en 2,81 GiB |
| Solo GPU (por defecto) | 224,1 t/s¹ | 172,8 t/s | 11.157-11.467 t/s | 4 sesiones agénticas: 110,4¹; cuatro streams de 46K: 362,9 | Ventana 1M; KV FP8 de 1,07M tokens |

¹ Medido con una versión anterior del cliente de replay que no enviaba las definiciones de herramientas.

## Requisitos de hardware

- Dos GPU sm_120 con 96 GB cada una (RTX PRO 6000 Blackwell), controlador CUDA 13, Docker con NVIDIA container toolkit.
- Aproximadamente 260 GiB de RAM de host libre y 340 GB de disco para el despliegue.
- El pack de pesos ocupa 332 GB; el repositorio completo, 1035,8 GB (incluye drafters opcionales de 5,8 GB y 7,9 GB).
- El runtime de CPU requiere host x86_64 con AVX-512 (VNNI, VBMI, VBMI2), muchos núcleos y canales de memoria; es la opción más rápida para servir.
- Despliegue mediante vLLM con tensor-parallel 2; la receta incluye `serve/serve.sh` con API compatible con OpenAI en el puerto 8000 (modelo `deepseek-v4.1-flash`).
- También se puede servir un nodo de 8× RTX PRO 6000 como dos réplicas de 4 GPU con todos los expertos en VRAM (`docs/PROFILE-8x.md`).
- No cabe en GPU de consumo; requiere hardware profesional de 96 GB por tarjeta.
- En el pico de 1M tokens, cada tarjeta conserva unos 2,5 GB libres.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Hardware objetivo |
|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash-EXL3-3bpw-2x-RTX-PRO-6000 (este pack) | ~218,7 B | 1M | EXL3 3-bit + FP8 | MIT | 2× RTX PRO 6000 96 GB |
| deepseek-ai/DeepSeek-V4.1-Flash-1017 (original) | ~218,7 B | 1M | FP8 | no disponible | no disponible |
| drafter-code-fp8 (variante incluida) | no disponible | no disponible | FP8/FP4 | MIT | complemento del pack |

No se dispone de datos de benchmarks de modelos alternativos de la misma categoría en la información proporcionada, por lo que la comparación cuantitativa de rendimiento queda como no disponible.

## Limitaciones y advertencias

- La cuantización introduce degradación medible: KL de 0,0520 nats en texto neutro frente a 0,0082 del original, es decir, aproximadamente seis veces la distancia del ruido de referencia.
- Un cambio en la ruta de decode no es bit-exacto: el runtime de CPU omite el enrutamiento de expertos para filas de borrador que va a rechazar; se validó con acuerdo teacher-forced y pruebas de comportamiento agéntico, no con equivalencia exacta.
- Las cifras de velocidad agéntica en modo solo GPU se midieron sin definiciones de herramientas en la petición, por lo que no son directamente comparables con las del runtime de CPU.
- Requiere hardware muy específico (sm_120, 96 GB por GPU, CUDA 13) y una compilación de kernels de unos 6 minutos; no es un despliegue plug-and-play.
- El runtime de CPU exige AVX-512 con VNNI, VBMI y VBMI2 y un host con muchos canales de memoria; sin él, el rendimiento cae a la ruta solo GPU.
- No se especifican los idiomas soportados ni sesgos conocidos del modelo base en la información disponible.
- El riesgo de alucinación del modelo base no se documenta en esta model card; debe evaluarse por caso de uso.
- La licencia es MIT, lo que permite uso comercial, pero conviene verificar las condiciones del modelo base DeepSeek-V4.1-Flash-1017 por separado.

## Enlaces

- Hugging Face del pack: https://huggingface.co/diffbot/DeepSeek-V4.1-Flash-EXL3-3bpw-2x-RTX-PRO-6000
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Documentación de velocidad: `docs/SPEED.md` (en el repositorio)
- Documentación de fidelidad: `docs/FIDELITY.md` (en el repositorio)
- Documentación del drafter: `docs/DRAFTER.md` (en el repositorio)
- Perfil para 8 GPU: `docs/PROFILE-8x.md` (en el repositorio)
- Distribución del pack: `docs/HOW-IT-FITS.md` (en el repositorio)
- Runtime de CPU: `recipe/cpuexp/README.md` (en el repositorio)
