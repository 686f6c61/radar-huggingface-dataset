# AutomatosX/AX-Qwen3.8-27B-MLX-AXQ-MXFP4-MTP

## Resumen

AX-Qwen3.8-27B-MLX-AXQ-MXFP4-MTP es un checkpoint cuantizado en precision mixta mediante AXQuant (AXQ) publicado por AutomatosX para Apple Silicon, derivado directamente del modelo BF16 Qwen/Qwen3.8-27B. El resultado es un artefacto en formato MLX Safetensors de 17,41 GB que conserva la torre de vision y la cabeza de prediccion multi-token (MTP) en BF16, mientras que la ruta de lenguaje se cuantiza con una clase de presupuesto MXFP4 y una clase de precision base de 6 bits, con un BPW real medido de 4,8441 en el modelo principal y 5,0147 contando la MTP.

El modelo base emplea la arquitectura Qwen3_5ForConditionalGeneration, densa (no MoE), con 26.895.993.856 parametros reales en safetensors (27,36B logicos segun la model card) y una longitud de contexto configurada de 262.144 tokens. Su relevancia practica esta en permitir ejecutar un modelo de ~27B con vision y decodificacion especulativa MTP en hardware de Apple con memoria unificada, sin necesidad de GPUs dedicadas.

Es importante subrayar que el propio autor lo etiqueta como evidencia de desarrollo: el paquete incluye registros de conversion e integridad de artefactos, pero no publica evidencia medida de calidad, contexto largo, velocidad de kernels ni exactitud de la MTP. La etiqueta de producto AXQ no debe interpretarse como una afirmacion de rendimiento, y la ejecucion nativa en AX Engine no esta establecida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (dense, transformer + vision tower + cabeza MTP) |
| Parametros totales | 26.895.993.856 (safetensors); 27,36B logicos segun la model card |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens configurados; limite practico segun memoria unificada |
| Tipos de cuantizacion | AXQuant (AXQ) mixed-precision, clase de presupuesto MXFP4, clase de precision base 6bit; 4,8441 BPW medidos en el modelo principal, 5,0147 BPW total con MTP |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX Safetensors (no incluye pesos PyTorch ni GGUF) |

Datos adicionales: cuantizador AXQuant 1.9.0; BPW planificado ajustado a almacenamiento 5,6720; tamano de pesos safetensors 17,41 GB; descarga completa aproximada 17,45 GB; MTP presente (True); vision presente (True); audio presente (False); runtime MLX principal MLX-LM; ejecucion nativa AX Engine no establecida; MLX 0.32.1 y MLX-LM 0.31.3 registrados en la conversion; AX Engine 7.5.7 registrado.

## Arquitectura y entrenamiento

El modelo base es un transformer denso de la familia Qwen3.8 (arquitectura declarada `Qwen3_5ForConditionalGeneration`), con una unica ruta de lenguaje optimizada para cuantizacion y componentes adicionales conservados en mayor precision: la cabeza de prediccion multi-token (MTP) y la torre de vision permanecen en BF16, ya sea dentro del checkpoint o en sidecars vinculados (`mtp.safetensors`, `vision.safetensors`). No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO; esos datos no aparecen en la informacion proporcionada.

En cuanto al proceso de cuantizacion, AXQuant aplica precision mixta por tensor: los tensores protegidos mantienen mayor precision (6 bits, 8 bits o BF16) mientras que otros bajan hasta 4 bits como base, de modo que el nombre de la clase de presupuesto (MXFP4) describe un objetivo de almacenamiento y no una precision uniforme. La documentacion del autor advierte explicitamente que un plan mixto etiquetado como 6bit puede retener 4bit como base y que los suelos de proteccion pueden elevar un pack marcado como 4bit por encima de un presupuesto de 6bit en modelos pequenos o muy protegidos. La innovacion tecnica principal que anuncia el paquete es la preservacion de la cabeza MTP para decodificacion especulativa, consumible mediante runtimes conscientes del sidecar (oMLX desde 0.6.3rc2 o MTPLX), aunque el propio autor no reclama evidencia de velocidad.

## Capacidades

- Generacion de texto y conversacion multilingue en la ruta de lenguaje (idiomas concretos no disponibles).
- Vision: se declara presencia de torre de vision en el checkpoint, aunque MLX-LM puede ignorarla y no se reclama calidad vision-lenguaje certificada.
- Prediccion multi-token (MTP): cabeza empaquetada en `mtp.safetensors` para decodificacion especulativa en runtimes compatibles (oMLX, MTPLX).
- Contexto largo: ventana configurada de 262.144 tokens, sujeta a la memoria unificada disponible.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo thinking o razonamiento explicito: no disponible; MTPLX muestra una opcion `--reasoning off`, lo que sugiere soporte de razonamiento controlable, pero no se detalla.
- Capacidades de audio: descartadas explicitamente (Audio present: False).

## Casos de uso

- Inferencia local en Mac para desarrollo: permite ejecutar un modelo de ~27B cuantizado a 17,45 GB en Apple Silicon con memoria unificada, util para probar prompts y flujos sin GPU dedicada.
- Asistentes de codigo en portatil: con 262.144 tokens de contexto configurados y decodificacion MTP en oMLX/MTPLX, se puede trabajar sobre repositorios grandes manteniendo latencia de generacion reducida (siempre que la memoria lo permita).
- Analisis de documentos largos: la ventana de 262k tokens facilita resumir o consultar contratos, informes o transcripciones extensas, aunque el limite practico depende de la RAM unificada del equipo.
- Prototipado multimodal en local: la torre de vision en BF16 permite experimentar con tareas imagen-texto en runtimes que carguen el sidecar `vision.safetensors`, no en MLX-LM estandar.
- Evaluacion comparativa de cuantizacion: sirve como referencia para medir la perdida de calidad frente al modelo base BF16 y frente a los siblings de 4bit y 6bit dentro del catalogo AXQ.
- Investigacion sobre decodificacion especulativa: la inclusion de la cabeza MTP hace del paquete un banco de pruebas para estudiar aceleracion por prediccion multi-token en MTPLX.
- Despliegue en entornos sin CUDA: como alternativa a stacks basados en NVIDIA para equipos que solo disponen de hardware Apple.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica expresamente que el paquete no publica evidencia medida de calidad, contexto largo, velocidad de kernels ni velocidad de MTP, y que la etiqueta AXQ no constituye una afirmacion de benchmark.

## Requisitos de hardware

- VRAM / memoria unificada: el peso en safetensors ocupa 17,41 GB y la descarga completa ronda los 17,45 GB; hay que anadir el espacio para la cache KV, que crece con la longitud de contexto y puede volverse muy exigente cerca de los 262.144 tokens. Cifra exacta de memoria total: no disponible.
- Hardware objetivo: Apple Silicon con memoria unificada (la libreria declarada es MLX). No se mencionan GPU NVIDIA ni AMD.
- GPU consumer: no aplica en el sentido tradicional; el modelo esta pensado para Mac. No se proporcionan datos de ejecucion en RTX 4090 u otras GPUs.
- Opciones de despliegue: MLX-LM para inferencia de texto/backbone; oMLX 0.6.3rc2 o superior para importar el sidecar MTP y activar Lightning MTP; MTPLX para consumir directamente `mtp.safetensors` con el contrato `qwen3-next-mtp`. AX Engine nativo no esta establecido por falta de `model-manifest.json` validado.
- Latencia y throughput: no disponibles; el autor no publica mediciones de velocidad ni reclama certificacion alguna.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / precision | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AX-Qwen3.8-27B-MLX-AXQ-MXFP4-MTP | 26,9B reales (27,36B logicos) | 262.144 tokens | MLX Safetensors, 4,8441 BPW principal / 5,0147 total | Apache 2.0 | HuggingFace (846 descargas) |
| AX-Qwen3.8-27B-MLX-AXQ-4bit-MTP (sibling) | mismo base | 262.144 tokens (por base) | MLX Safetensors, presupuesto AXQ menor | Apache 2.0 | HuggingFace |
| AX-Qwen3.8-27B-MLX-AXQ-6bit-MTP (sibling) | mismo base | 262.144 tokens (por base) | MLX Safetensors, presupuesto cercano a 6 BPW | Apache 2.0 | HuggingFace |
| Qwen/Qwen3.8-27B (base) | 27,36B logicos | 262.144 tokens (por base) | BF16 (formato original del autor) | Apache 2.0 | HuggingFace |

No se dispone de datos de rendimiento de los siblings ni del modelo base en la informacion proporcionada, por lo que la comparacion se limita a parametros, contexto, formato y licencia. No se conocen otros modelos comparables fuera del catalogo de AutomatosX con datos verificables en esta ficha.

## Limitaciones y advertencias

- Evidencia de desarrollo, no release certificado: el autor indica que no hay mediciones de calidad, contexto largo, velocidad de kernels ni exactitud o velocidad de MTP.
- MLX-LM no carga los sidecars: la compatibilidad estandar cubre solo texto/backbone; puede ignorar los metadatos AXQuant y los archivos `vision.safetensors` y `mtp.safetensors`, de modo que ejecutar con MLX-LM no garantiza aceleracion MTP ni calidad vision-lenguaje.
- AX Engine no establecido: el paquete no incluye un `model-manifest.json` valido; los campos de AX Engine en `axquant_runtime.json` describen un contrato de compatibilidad previsto, no evidencia observada.
- Discrepancia de parametros: 26.895.993.856 reales en safetensors frente a 27,36B logicos declarados en la model card; conviene verificar la cifra para planificacion de recursos.
- Nomenclatura de cuantizacion potencialmente confusa: el pack se llama MXFP4 pero su clase de precision base es 6bit, porque AXQ es un presupuesto de almacenamiento y no una precision uniforme.
- Riesgo de alucinacion: no disponible en la informacion proporcionada.
- Sesgos conocidos: no disponible en la informacion proporcionada.
- Idiomas soportados: no disponibles; no se puede garantizar cobertura multilingue concreta.
- Requisito de hardware restrictivo: al ser un checkpoint MLX, el uso queda limitado a Apple Silicon; no hay pesos PyTorch ni GGUF para otros stacks.
- Reproducibilidad: el autor recomienda fijar el commit del Hub en despliegues reproducibles en lugar de depender de `main`.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base Qwen/Qwen3.8-27B y de los sidecars si se redistribuyen.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AutomatosX/AX-Qwen3.8-27B-MLX-AXQ-MXFP4-MTP
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B/tree/1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0
- Sibling 4bit: https://huggingface.co/AutomatosX/AX-Qwen3.8-27B-MLX-AXQ-4bit-MTP
- Sibling 6bit: https://huggingface.co/AutomatosX/AX-Qwen3.8-27B-MLX-AXQ-6bit-MTP
- Colecciones de AutomatosX: https://huggingface.co/AutomatosX/collections
- Indice completo del catalogo MLX: https://huggingface.co/collections/AutomatosX/automatosx-mlx-model-catalog
