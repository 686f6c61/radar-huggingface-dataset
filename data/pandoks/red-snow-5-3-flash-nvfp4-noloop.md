# Pandoks/RED-SNOW-5.3-Flash-NVFP4-noloop

## Resumen
RED-SNOW-5.3-Flash-NVFP4-noloop es un ajuste fino (finetune) del modelo Blackfrost-AI/RED-SNOW-5.3-FLASH-NVFP4, publicado por el usuario Pandoks. Se trata de un modelo de la familia GLM-5.3 (etiqueta `glm5_next`, `glm-5.3`) orientado a generacion de texto e image-text-to-text, con pesos cuantizados en NVFP4 mediante NVIDIA ModelOpt y pensado para servirse con SGLang. El repositorio ocupa 394,4 GB y los pesos safetensors declaran 161.461.030.910 parametros totales.

El problema que aborda es muy concreto: el modelo base, en sesiones agenticas largas, tiende a terminar una respuesta correcta y despues repetir su linea de cierre, su firma o su linea `tldr` hasta agotar el limite de tokens, tanto en la respuesta visible como dentro del bloque de razonamiento. Este ajuste se entrena unicamente sobre esa decision de parada, de modo que el modelo emite el fin de turno (o cierra el bloque de pensamiento) donde el base empieza a repetir.

La relevancia es practica: reduce la tasa de bucles en contextos propensos a ello del 86 % (103/120) en el base al 1 % (1/120) en este modelo, con 0/58 en sesiones no vistas durante el entrenamiento. El entrenamiento consistio en un LoRA de rango 16 en cuatro etapas, fusionado en las proyecciones BF16 de las 45 capas; el resto de componentes (expertos enrutados NVFP4, embeddings, LM head, tokenizer, plantilla de chat y receta de servicio) es identico byte a byte al base.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE); etiquetas `glm5_next` / `glm-5.3`; 45 capas; expertos enrutados en NVFP4 y proyecciones en BF16 |
| Parametros totales | 161.461.030.910 (dato real de safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | hasta 1.048.576 tokens en la evaluacion del autor (contextos de hasta 786k usados en entrenamiento) |
| Tipos de cuantizacion | NVFP4 (expertos enrutados, via NVIDIA ModelOpt); proyecciones en BF16; KV cache en BF16 en la evaluacion |
| Idiomas soportados | en (ingles) |
| Licencia | MIT (heredada del modelo base; Copyright (c) 2026 Z.AI Co., Ltd) |
| Formato de pesos | safetensors (20 de 22 shards modificados; repo de 394,4 GB) |

## Arquitectura y entrenamiento
El modelo es un transformer con mezcla de expertos de la familia GLM-5.3. Los expertos enrutados estan cuantizados en NVFP4 con ModelOpt y las proyecciones se mantienen en BF16. El ajuste es un LoRA de rango 16 fusionado en las proyecciones BF16 de las 45 capas (476 tensores en 20 de los 22 shards). El entrenamiento se estructuro en cuatro etapas: (1) supervised fine-tuning sobre finales limpios y completos; (2) lo mismo sobre los ultimos 512 tokens de contextos de hasta 786k tokens; (3) una preferencia a nivel de token entre fin de turno y la repeticion en puntos reales de inicio de bucle, mas una perdida de fin de turno con peso incrementado sobre finales limpios, anclada a la etapa anterior mediante una ligadura L2; y (4) una segunda ronda de la etapa de preferencia sobre nuevos inicios de bucle en contextos de 256k a 655k tokens.

La innovacion es acotada pero medible: el modelo solo aprende la decision de parada, no capacidad general. El autor verifica que cada shard fusionado coincide con un plan de bytes calculado de forma independiente (sha256 de cada tensor fusionado, bytes fuera de los tensores fusionados identicos al base, cabeceras y tamanos sin cambios). La receta de servicio es la del base: SGLang 0.5.20, runner MoE `modelopt_fp4` con `flashinfer_cutlass`, parser de razonamiento `glm45` y parser de tool-calls `glm47`.

## Capacidades
- Generacion de texto conversacional en ingles, con soporte de razonamiento en bloque de pensamiento (thinking block) segun la familia GLM-5.3.
- Entrada image-text-to-text (segun la etiqueta del repositorio), ademas de text-generation.
- Tool calling / function calling, con parser dedicado `glm47` en la receta de servicio; en la evaluacion del autor, 42 de 50 muestras de control incluian llamadas a herramienta y 0 fueron invalidas.
- Sesiones agenticas de multiples pasos con contextos muy largos (hasta 1M tokens en la evaluacion).
- Cierre fiable de turno: emite fin de turno o cierra el bloque de razonamiento en lugar de repetir lineas de estado, firma o `tldr`.
- Capacidades multilingues: limitadas al ingles segun la model card.
- Capacidades generales (conocimiento, codigo, matematicas) heredadas del base; no reevaluadas por el autor.

## Casos de uso
- Agentes de codificacion de larga duracion: el modelo mantiene sesiones de tool-use de cientos de miles de tokens y termina el turno de forma limpia, lo que evita que un bucle de repeticion consuma el presupuesto de tokens y rompa el bucle del agente.
- Orquestacion de pipelines CI/CD con agentes: al no repetir la linea de estado final, los parsers de salida del orquestador reciben una respuesta terminada y pueden encadenar el siguiente paso sin truncamientos.
- Servicio de inferencia de alto contexto con SGLang: la receta incluida (`modelopt_fp4`, `flashinfer_cutlass`, TP1) permite desplegar el modelo tal cual sobre una GPU B300 con KV cache BF16, segun la evaluacion del autor.
- Asistentes conversacionales multi-turno en ingles: el modelo cierra cada turno de forma consistente, lo que simplifica la gestion de historial y el control de longitud en produccion.
- Evaluacion y benchmarking de modelos agenticos: sirve como referencia de control para medir tasas de bucle, ya que reduce la repeticion de 86 % a 1 % en los mismos contextos.
- Investigacion sobre ajuste de comportamiento de parada: el diseno en cuatro etapas (SFT, SFT en colas largas, preferencia a nivel de token con ligadura L2 y segunda ronda) es replicable para corregir fallos de terminacion en otros modelos.
- Procesamiento de documentos e imagenes con contexto largo: la etiqueta image-text-to-text y la ventana de hasta 1M tokens permiten tareas de extraccion o resumen sobre entradas extensas, siempre en ingles.

## Benchmarks y rendimiento
Tasa de bucle: proporcion de muestras cuya salida repite (un fragmento de 128 bytes que recurre 6 veces). 60 contextos propensos a bucle de sesiones reales de tool-use donde el base entra en bucle, 2 muestras cada uno, mas 25 contextos de control. Contexto de hasta 1.048.576 tokens, servido con SGLang 0.5.20, TP1 en 1x B300, KV cache BF16.

| Slice | Base | Revision anterior | Este modelo |
|---|---|---|---|
| Todos los contextos propensos a bucle | 103/120 (86 %) | 12/120 (10 %) | 1/120 (1 %) |
| 512k-1M tokens | 32/34 (94 %) | 2/34 (6 %) | 0/34 (0 %) |
| 256k-512k tokens | 42/54 (78 %) | 2/54 (4 %) | 0/54 (0 %) |
| 128k-256k tokens | 18/18 (100 %) | 4/18 (22 %) | 0/18 (0 %) |
| <128k tokens | 11/14 (79 %) | 4/14 (29 %) | 1/14 (7 %) |
| Sesiones held-out (no vistas en entrenamiento) | 51/58 (88 %) | 3/58 (5 %) | 0/58 (0 %) |
| Controles: bucle, tool call invalida o error | 1/50 | 0/50 | 0/50 |

- Emparejado por contexto: este modelo entra en bucle menos que el base en 56 de 60 contextos y mas en ninguno (test de signos p ≈ 3e-17). Frente a la revision anterior es mejor en 10 y peor en ninguno (p = 0,002).
- Controles: 0 de 50 malos. Tool calls en 42 de 50 muestras (base 47), 0 invalidas. La respuesta de control mediana es mas corta: 55 caracteres frente a 82 del base.
- Sonda de tokens normales a 16k de contexto: NLL 1,240 frente a 1,217 de la revision anterior (+1,9 %); probabilidad de parada superior a 0,5 en el 0,24 % de las posiciones frente al 0,37 %.
- No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible de forma explicita; el repo pesa 394,4 GB en safetensors y la evaluacion se ejecuto en 1x B300 (Blackwell) con TP1 y KV cache BF16.
- GPU recomendadas: NVIDIA B300 para la configuracion de referencia; por tamano, no cabe en GPU de consumo.
- GPU de consumo: no; 161,5 mil millones de parametros y 394,4 GB de pesos descartan RTX 4090 y similares.
- Opciones de despliegue: SGLang 0.5.20 con runner MoE `modelopt_fp4` y `flashinfer_cutlass`, segun `DEPLOYMENT/` y `Deployment-Kit/` del repositorio. Otros motores (vLLM, llama.cpp, Ollama, TGI) no estan documentados en la informacion disponible.
- Latencia y throughput: no disponibles. El autor no midio la tasa de aceptacion del borrador especulativo DFlash del base con este modelo.

## Comparativa con modelos similares
| Modelo | Parametros | Contexto | Tasa de bucle (contextos propensos) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RED-SNOW-5.3-Flash-NVFP4-noloop (este) | 161,5 MM | hasta 1M (evaluado) | 1/120 (1 %) | MIT | Hugging Face |
| Blackfrost-AI/RED-SNOW-5.3-FLASH-NVFP4 (base) | 161,5 MM | hasta 1M (evaluado) | 103/120 (86 %) | MIT | Hugging Face |
| Revision anterior de este repo (`5a95d01`) | 161,5 MM | hasta 1M (evaluado) | 12/120 (10 %) | MIT | Hugging Face |

No se dispone de datos de otros modelos de la misma categoria (mismo tamano o misma tarea) en la informacion proporcionada.

## Limitaciones y advertencias
- Los bucles se reducen, no se eliminan: 1 de 120 muestras de evaluacion siguio entrando en bucle (bloque repetido de estado mas `tldr` por debajo de 128k tokens). 120 muestras no permiten estimar con precision una tasa cercana a cero.
- El modelo termina el turno con mas facilidad: las respuestas de control son mas cortas (mediana de 55 frente a 82 caracteres) y algunas respuestas breves de estado acaban donde el base habria llamado a una herramienta.
- La evaluacion cubre un solo tipo de carga (sesiones agenticas largas de codificacion y tool-use). No se reevaluaron capacidad general, seguridad ni comportamiento de rechazo mas alla de los 25 contextos de control; deben considerarse los del base.
- La tasa de aceptacion del borrador especulativo DFlash del base con este modelo no se midio.
- Idioma: solo ingles segun la model card.
- Riesgo de alucinacion y sesgos: no evaluados de forma especifica; se heredan del modelo base.
- Licencia MIT heredada del base (Copyright (c) 2026 Z.AI Co., Ltd); permite uso comercial, pero conviene revisar el archivo `LICENSE` del repositorio.
- `METADATA-SHA256SUMS.txt` es el archivo del release base, por lo que su entrada `README.md` describe la model card del base, no la de este ajuste.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/Pandoks/RED-SNOW-5.3-Flash-NVFP4-noloop
- Modelo base: https://huggingface.co/Blackfrost-AI/RED-SNOW-5.3-FLASH-NVFP4
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la informacion disponible.
