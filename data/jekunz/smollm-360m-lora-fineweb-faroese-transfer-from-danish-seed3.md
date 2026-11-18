# jekunz/smollm-360m-lora-fineweb-faroese-transfer-from-danish-seed3

## Resumen

El modelo `jekunz/smollm-360m-lora-fineweb-faroese-transfer-from-danish-seed3` es un adaptador LoRA entrenado sobre SmolLM2-360M-Instruct, un transformer decoder-only de 360 millones de parámetros desarrollado originalmente por Hugging Face. El autor del adaptador, identificado como `jekunz`, lo ha afinado de forma secuencial: primero sobre la porción danesa de FineWeb-2 y después sobre la porción feroesa del mismo corpus. El resultado es un modelo orientado a la generación de texto en feroés (código ISO `fo`), una lengua germánica nórdica con recursos digitales muy limitados.

La relevancia del modelo es metodológica más que de rendimiento: ilustra una estrategia de transferencia lingüística de bajo coste, aprovechando un idioma con más datos (danés) como puente antes de adaptar al idioma objetivo (feroés). El adaptador tiene rango 256, alpha 512 y se aplica sobre las proyecciones `up_proj`, `down_proj`, `gate_proj` y `o_proj`, lo que supone un ajuste considerable para un modelo de este tamaño. El entrenamiento se realizó en una única A100 de 40 GB, con contexto máximo de 2048 tokens y semilla 3 de una configuración de tres semillas.

Se trata de un artefacto de investigación, sin evaluación amplia publicada, con licencia Apache 2.0 y un tamaño de repositorio de 0,4 GB (solo los pesos del adaptador, no el modelo base). No debe confundirse con un modelo completo: requiere cargar SmolLM2-360M-Instruct junto con el adaptador PEFT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (SmolLM2) con adaptador LoRA |
| Parametros totales | 360M en el modelo base; el adaptador LoRA no especifica recuento exacto (rango 256 sobre 4 modulos) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens en entrenamiento; contexto nativo del base no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible (el repo solo contiene safetensors del adaptador) |
| Idiomas soportados | Feroes (`fo`) como objetivo; el base SmolLM2-Instruct soporta principalmente ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo base es SmolLM2-360M-Instruct, un transformer decoder-only de 360 millones de parámetros. Sobre él se aplica un adaptador LoRA de rango 256 y alpha 512, dirigido a las proyecciones `up_proj`, `down_proj`, `gate_proj` y `o_proj` de las capas del transformer. Este rango es inusualmente alto para un modelo de 360M, lo que indica una adaptación agresiva de los pesos en lugar de un ajuste ligero.

El entrenamiento es secuencial en dos fases: primero una época sobre la porción danesa de FineWeb-2 y después cinco épocas sobre la porción feroesa del mismo corpus. Se usó una tasa de aprendizaje de 8e-4 con scheduler coseno, warmup ratio de 0,05, batch size de 8 con acumulación de gradientes de 32 pasos (batch efectivo de 256), contexto máximo de 2048 tokens y una única GPU A100 de 40 GB. La semilla 3 corresponde a una de tres semillas de la misma configuración. No se documenta el número total de tokens vistos, la composición exacta del subconjunto de FineWeb-2 ni si hubo etapas de RLHF o DPO posteriores.

## Capacidades

- Generación de texto en feroés, incluyendo estilo conversacional heredado de la variante Instruct del modelo base.
- Transferencia lingüística desde el danés: el adaptador intermedio danés actúa como puente para el feroés.
- Conversación multi-turno básica, gracias a la base SmolLM2-360M-Instruct.
- Generación condicionada por prompt con contexto de hasta 2048 tokens.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso.
- No se documenta capacidad de visión, audio ni modo de razonamiento extendido.
- Capacidades multilingües limitadas al feroés objetivo y al inglés heredado del base; no se han evaluado otros idiomas.

## Casos de uso

- Generación de texto en feroés para prototipos: el adaptador permite producir texto en una lengua con pocos recursos digitales, útil para experimentar con contenido sintético o borradores antes de revisión humana.
- Investigación en transferencia lingüística de bajo coste: sirve como referencia metodológica para estudiar el efecto de una fase intermedia en danés antes de adaptar a otra lengua nórdica.
- Aumento de datos para PLN en feroés: puede generar corpus sintéticos que alimenten clasificadores, modelos de etiquetado o sistemas de corrección ortográfica en feroés.
- Experimentos de ajuste LoRA reproducibles: la configuración completa (rango, alpha, módulos, hiperparámetros) permite reproducir o variar el entrenamiento con otras semillas y comparar resultados.
- Chatbot experimental de dominio limitado: con contexto de 2048 tokens puede gestionar conversaciones cortas en feroés para demostraciones o pruebas de concepto, siempre con supervisión humana.
- Base para futuros ajustes: al ser un adaptador PEFT ligero (0,4 GB), se puede combinar o seguir afinando sobre SmolLM2-360M-Instruct para tareas específicas en feroés sin reentrenar el modelo completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que el modelo «has not been evaluated more broadly yet».

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 360M en fp16 ocupa aproximadamente 0,7 GB de pesos; en fp32, unos 1,4 GB. El adaptador LoRA añade una fracción pequeña. En la práctica, la inferencia completa cabe en menos de 2 GB de VRAM.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; una RTX 3060 de 12 GB o incluso una GTX 1650 de 4 GB pueden ejecutarlo. Para entrenamiento, el autor usó una A100 de 40 GB, pero el ajuste LoRA de un modelo de 360M es viable en GPUs de 8-12 GB con batches pequeños.
- Cabe en GPU consumer: sí, en prácticamente todas las GPU con al menos 4 GB de VRAM.
- Opciones de despliegue: `transformers` con `peft` para cargar el adaptador; llama.cpp/Ollama requieren convertir el adaptador a GGUF y fusionarlo con el base; vLLM y TGI son compatibles con el modelo base, aunque el soporte de adaptadores LoRA dinámicos depende de la versión.
- Latencia y throughput estimados: no disponibles en la información proporcionada. Por el tamaño del modelo, se espera una latencia baja en GPU consumer, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jekunz/smollm-360m-lora-fineweb-faroese-transfer-from-danish-seed3 | 360M + LoRA r256 | 2048 (entrenamiento) | Feroes | Apache 2.0 | Hugging Face (adaptador) |
| SmolLM2-360M-Instruct (base) | 360M | no disponible en la informacion | Principalmente ingles | Apache 2.0 | Hugging Face |
| jekunz/smollm-360m-lora-fineweb-danish (adaptador intermedio) | 360M + LoRA | 2048 (entrenamiento) | Danes | Apache 2.0 | Hugging Face (adaptador) |
| Modelos dedicados a feroes de mayor tamano | no disponible | no disponible | Feroes | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación sin evaluación amplia: el propio autor advierte que no ha sido evaluado más allá de su uso interno, por lo que su calidad en producción es desconocida.
- Riesgo elevado de alucinación y de generar feroés gramaticalmente incorrecto, dado el tamaño reducido del modelo base y la escasez de datos en el idioma objetivo.
- Contexto limitado a 2048 tokens, insuficiente para documentos largos o conversaciones extensas.
- Sesgos potencialmente heredados del corpus FineWeb-2 y del modelo base SmolLM2-Instruct, sin documentación de mitigación.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluación hace desaconsejable su despliegue en producción sin validación previa.
- Es un adaptador, no un modelo autónomo: requiere el modelo base `jekunz/smollm-360m-lora-fineweb-danish` y, en última instancia, SmolLM2-360M-Instruct.
- Sin soporte documentado de tool calling ni de razonamiento multi-paso, lo que limita su uso en pipelines de agentes.
- El entrenamiento secuencial danés-feroés puede inducir interferencias del danés en la salida en feroés; no se han publicado análisis de este efecto.

## Enlaces

- Hugging Face: https://huggingface.co/jekunz/smollm-360m-lora-fineweb-faroese-transfer-from-danish-seed3
- Modelo base intermedio: https://huggingface.co/jekunz/smollm-360m-lora-fineweb-danish
- Dataset FineWeb-2: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- SmolLM2 (Hugging Face): https://huggingface.co/HuggingFaceTB/SmolLM2-360M-Instruct
- PEFT (librería): https://github.com/huggingface/peft
