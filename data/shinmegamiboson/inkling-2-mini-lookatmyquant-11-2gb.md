# shinmegamiboson/Inkling-2-Mini-LookAtMyQuant-11.2GB

## Resumen
Inkling-2-Mini-LookAtMyQuant-11.2GB es una compresión cuantizada del modelo base `thinkingmachines/Inkling-2-Mini`, un transformer de tipo Mixture of Experts (MoE) con 26,4 mil millones de parámetros totales y 5,4 mil millones activos. El autor de la cuantización es `shinmegamiboson`, que emplea su propio compilador de cuantización LookAtMyQuant para reducir los 18,89 GB de pesos nativos en texto a 11,16 GB, lo que supone una compresión de 1,69 veces y 3,43 bits por parámetro de texto. El paquete está empaquetado para los runtimes Apple Silicon MLX y NVIDIA CUDA.

El interés de esta build radica en que, según los datos del autor, mantiene un rendimiento muy cercano al profesor BF16 original en tareas de razonamiento matemático y generación de código, pese a reducir el peso a casi la mitad. Con un límite de 960 tokens de pensamiento (`--max-thinking-tokens 960`) alcanza un 97,5 por ciento en GSM8K (195/200) y un 95,1 por ciento estricto en HumanEval (156/164), frente al 94,5 y 97,0 por ciento del modelo original sin cuantizar. La divergencia KL media en seis clases de plantilla de chat es de 0,0461, con un 95,46 por ciento de acuerdo top-1.

El modelo resulta relevante para desarrolladores que quieran ejecutar un MoE de 26,4B en hardware de consumo o en Apple Silicon con memoria unificada, manteniendo capacidades de razonamiento, código y contexto largo (recuperación verificada a 16k tokens). La licencia no está disponible en la información proporcionada, lo que supone una limitación importante para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) transformer, según tags del repo; detalles internos no disponibles |
| Parametros totales | 26,4 mil millones |
| Parametros activos | 5,4 mil millones |
| Longitud de contexto | No disponible como valor nominal; se verifica recuperación a 16.384 tokens |
| Tipos de cuantizacion | Trellis (ht2/ht3/rtr4), NVFP4 nativo en 70/192 buckets de expertos, suelo de 2 bits en la cola del output head; 3,43 bits por parámetro de texto |
| Idiomas soportados | Inglés y multilingüe (13 idiomas evaluados en calibración) |
| Licencia | No disponible |
| Formato de pesos | Pesos empaquetados para runtimes MLX y CUDA; no se especifica safetensors ni GGUF |

## Arquitectura y entrenamiento
El modelo base es un transformer MoE con 26,4B parámetros totales y 5,4B activos por token, lo que implica un enrutamiento disperso de expertos. La información disponible no detalla el número de capas, dimensión oculta, número de expertos ni la composición exacta del dataset de preentrenamiento del modelo original; tampoco se confirma si hubo RLHF o DPO. Lo que sí se documenta es que el modelo base incorpora un modo de pensamiento explícito mediante etiquetas `<|content_thinking|>` y `<|content_text|>`, con un parámetro `reasoning_effort` que puede desactivarse.

La innovación principal de esta build es el proceso de cuantización LookAtMyQuant. Se aplica un knapsack de expertos MoE en bucle que conserva los 70 de 192 buckets de expertos de mayor sensibilidad en NVFP4 nativo de 4,50 bpp sin error de cuantización, empaqueta el resto con códigos trellis de 4 KB de SRAM y protege la cola del output head con un suelo trellis de 2 bits. La calibración usa Hessians densos compartidos por experto sobre una mezcla 70/30 de texto con plantilla de chat de seis clases y TextMix crudo en 13 idiomas. El tiempo total de construcción fue de 0,60 horas B200 (18,9 minutos de cuantización y 17,3 minutos de pulido en una B200).

## Capacidades
- Generación de texto conversacional con plantilla de chat dedicada.
- Razonamiento matemático de varios pasos, con trazas de pensamiento acotables mediante `--max-thinking-tokens`.
- Generación de código ejecutable, evaluada con ejecución estricta en HumanEval.
- Modo de pensamiento explícito con etiquetas `<|content_thinking|>` y cierre controlado de trazas largas.
- Soporte de tool calling y flujos agénticos (evaluado con KL específica para herramientas y agentes).
- Capacidades multilingües, con calibración y evaluación KL en 13 idiomas.
- Recuperación de contexto largo verificada a 16.384 tokens (8 agujas factuales y 8 copias literales, 16/16).
- Decodificación especulativa mediante drafters DSpark de 4 bits (179 MB) en Apple Silicon.

## Casos de uso
- Asistente de razonamiento matemático en local: con el límite de 960 tokens de pensamiento y 1.536 tokens nuevos, resuelve problemas de GSM8K con un 97,5 por ciento de acierto, adecuado para herramientas de tutoría o verificación de cálculos en estaciones de trabajo sin GPU dedicada.
- Generación de código en pipelines de desarrollo: el 95,1 por ciento estricto en HumanEval permite integrarlo como asistente de autocompletado o generación de funciones en entornos con Apple Silicon, con drafters que elevan la decodificación a 87,7 tok/s en código.
- Procesamiento de documentos largos: la recuperación verificada a 16k tokens lo hace apto para resumir contratos, informes o hilos de correo extensos manteniendo referencias factuales.
- Agentes con tool calling: la KL específica de herramientas (0,0734) y de agentes (0,0590) indica que conserva el comportamiento de llamada a funciones, útil para orquestadores que consultan APIs o bases de datos.
- Atención al cliente multilingüe: la calibración en 13 idiomas y la KL multilingüe de 0,0449 permiten desplegar respuestas en varios idiomas desde un único modelo de 11,16 GB.
- Despliegue en portátiles Apple Silicon: con 11,14 GB activos y 11,97 GB de pico de RAM en un M5 Max, cabe en equipos de 16 GB o más, habilitando inferencia privada sin conexión.
- Servicio HTTP local: el comando `lamq serve` con interfaz web permite montar un endpoint compatible para prototipos o demos internas en CUDA o MLX.

## Benchmarks y rendimiento

| Build | Texto GB | bpp | KL cruda (en / 13 idiomas) | KL 6 clases | GSM8K (200) | HumanEval (164) |
|---|---:|---:|---:|---:|---:|---:|
| Original BF16 | 18,89 | 5,80 | 0,0000 / 0,0000 | 0,0000 | 94,0% → 94,5% | 89,6% → 97,0% |
| 12,8 GB | 12,74 | 3,92 | 0,0084 / 0,0209 | 0,0465 | 94,5% → 96,0% | 90,9% → 95,7% |
| **Esta build (11,2 GB)** | **11,16** | **3,43** | **0,0131 / 0,0315** | **0,0461** | **95,0% → 97,5%** | **88,4% → 95,1%** |
| 8,9 GB | 8,85 | 2,72 | 0,0278 / 0,0628 | 0,0530 | 95,0% → 96,5% | 84,8% → 94,5% |
| 5,4 GB | 5,38 | 1,65 | 0,0859 / 0,2659 | 0,1440 | 92,5% → 93,5% | 76,8% → 85,4% |
| 4,7 GB | 4,72 | 1,45 | 0,1179 / 0,3731 | 0,1668 | 90,5% → 94,5% | 67,1% → 78,0% |
| 3,9 GB | 3,85 | 1,18 | 0,2189 / 0,6058 | 0,2329 | 86,5% → 88,5% | 59,2% → 70,7% |

Métricas adicionales de esta build: KL media de chat en seis clases de 0,0461 (95,46 por ciento top-1); KL de herramientas 0,0734; agentes 0,0590; razonamiento 0,0274; código 0,0357; prosa 0,0360; multilingüe 0,0449; copia 0,0914. Recuperación a 16k: 16/16 con margen de +4,91 nats (capped) y +8,48 nats (raw), mínimo +3,65.

Rendimiento en Apple M5 Max con drafters DSpark de 4 bits: 1.540 tok/s en prefill T=512, 53,1 tok/s en decodificación serial, 102,3 tok/s de mediana con decodificación especulativa; 116,9 tok/s en matemáticas y 87,7 tok/s en código.

## Requisitos de hardware
- VRAM/RAM estimada: 11,14 GB activos y 11,97 GB de pico en Apple Silicon MLX; en CUDA se requiere capacidad equivalente para los pesos empaquetados más el overhead del runtime.
- Apple Silicon: probado en un M5 Max con memoria unificada; se necesita un equipo con al menos 16 GB de memoria unificada recomendable.
- NVIDIA: el motor PyTorch/Triton soporta CUDA; la decodificación especulativa DSpark en CUDA está soportada solo en las builds trellis de 3,9 a 8,9 GB, no en esta de 11,2 GB.
- GPU de datacenter: la cuantización se construyó en una B200; para inferencia no se especifican modelos concretos de A100 o H100.
- Cabe en GPU de consumo: no confirmado explícitamente para RTX 4090 u otras; los 11,16 GB de pesos más overhead podrían exceder los 16 GB de VRAM en algunas configuraciones, por lo que conviene verificar.
- Despliegue: runtime LookAtMyQuant (`lamq generate`, `lamq chat`, `lamq serve`), API Python `runtime_mlx.Runtime` en MLX; no se menciona soporte de vLLM, llama.cpp, Ollama ni TGI.
- Throughput: 53,1 tok/s serial y 102,3 tok/s con drafter en M5 Max; latencia de prefill de 1.540 tok/s a T=512.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | GSM8K / HumanEval | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Inkling-2-Mini-LookAtMyQuant-11.2GB | 26,4B totales / 5,4B activos | 16k verificado | 97,5% / 95,1% | No disponible | Hugging Face, 71 descargas |
| Inkling-2-Mini BF16 original | 26,4B totales / 5,4B activos | No disponible | 94,5% / 97,0% | No disponible | Hugging Face (thinkingmachines) |
| Inkling-2-Mini-LookAtMyQuant-8.9GB | 26,4B totales / 5,4B activos | 16k verificado | 96,5% / 94,5% | No disponible | Hugging Face |
| Inkling-2-Mini-LookAtMyQuant-12.8GB | 26,4B totales / 5,4B activos | 16k verificado | 96,0% / 95,7% | No disponible | Hugging Face |

No se dispone de datos de benchmarks de modelos de otros desarrolladores en la información proporcionada para establecer comparaciones cruzadas.

## Limitaciones y advertencias
- Licencia no disponible: no se puede confirmar el uso comercial; hay que contactar con el autor o consultar el modelo base antes de producción.
- La cuantización introduce divergencia respecto al BF16: KL cruda de 0,0131 en inglés y 0,0315 en 13 idiomas, con degradación mayor en la clase de copia (0,0914).
- El rendimiento en HumanEval baja del 97,0 por ciento del original al 95,1 por ciento, una pérdida de casi dos puntos que puede afectar a código de producción.
- La decodificación especulativa DSpark en CUDA no está soportada en esta build de 11,2 GB, lo que limita el throughput en NVIDIA frente a las builds más pequeñas.
- El modo de pensamiento requiere acotar tokens (`--max-thinking-tokens 960`) para cerrar trazas largas correctamente; sin el límite, el modelo puede no finalizar la respuesta.
- Riesgo de alucinación inherente al modelo base; no se han publicado evaluaciones de sesgo ni de seguridad en la información disponible.
- El runtime es específico (LookAtMyQuant) y no compatible con ecosistemas estándar como vLLM, llama.cpp u Ollama, lo que complica la integración en infraestructuras existentes.
- Solo 71 descargas y 0 likes: comunidad muy reducida, sin validación independiente de los resultados reportados por el autor.
- Idiomas: aunque se declara multilingüe, la evaluación se limita a 13 idiomas y el autor no detalla cuáles.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/shinmegamiboson/Inkling-2-Mini-LookAtMyQuant-11.2GB
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Drafters DSpark 4 bits: https://huggingface.co/shinmegamiboson/Inkling-2-Mini-LookAtMyQuant-drafter
- Build 12,8 GB: https://huggingface.co/shinmegamiboson/Inkling-2-Mini-LookAtMyQuant-12.8GB
- Build 8,9 GB: https://huggingface.co/shinmegamiboson/Inkling-2-Mini-LookAtMyQuant-8.9GB
- Build 5,4 GB: https://huggingface.co/shinmegamiboson/Inkling-2-Mini-LookAtMyQuant-5.4GB
- Build 4,7 GB: https://huggingface.co/shinmegamiboson/Inkling-2-Mini-LookAtMyQuant-4.7GB
- Build 3,9 GB: https://huggingface.co/shinmegamiboson/Inkling-2-Mini-LookAtMyQuant-3.9GB
- Repositorio del runtime LookAtMyQuant: https://github.com/ShinMegamiBoson/lookatmyquant
- Sitio web de LookAtMyQuant: https://lookatmyquant.com/
