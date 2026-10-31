# handikaawork/qwen2.5-3b-instruct-indo-sft

## Resumen

qwen2.5-3b-instruct-indo-sft es un ajuste fino (fine-tuning) comunitario del modelo Qwen2.5-3B-Instruct, publicado en Hugging Face por el usuario handikaawork. El modelo base original es Qwen2.5-3B-Instruct, un modelo de lenguaje instruccional de 3.085 millones de parámetros desarrollado por Alibaba (Qwen), y en este caso el punto de partida concreto del ajuste es la versión cuantizada a 4 bits publicada por Unsloth (unsloth/Qwen2.5-3B-Instruct-bnb-4bit). Según el identificador del repositorio, el ajuste está orientado al idioma indonesio (el sufijo "indo-sft" sugiere un SFT, supervised fine-tuning, con datos en indonesio), aunque la model card solo declara el inglés como idioma y no aporta detalles sobre el dataset empleado.

Su relevancia es limitada y muy específica: se trata de un modelo de nicho, con apenas 786 descargas y sin documentación técnica significativa en la model card. Aporta valor principalmente como experimento de SFT eficiente (entrenado con Unsloth y la librería TRL de Hugging Face, que permiten entrenar con recursos reducidos) y como ejemplo de especialización lingüística de un modelo pequeño. No es un modelo de referencia para producción, pero puede ser útil para quienes busquen un modelo ligero ajustado a indonesio o un punto de partida para nuevos ajustes finos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder (familia Qwen2.5) |
| Parámetros totales | 3.085.938.688 (3.086 M) |
| Parámetros activos | no disponible (no es MoE; todos los parámetros están activos) |
| Longitud de contexto | no disponible (el modelo base Qwen2.5-3B-Instruct soporta 32.768 tokens, pero no está confirmado en la model card) |
| Tipos de cuantización | Base entrenada desde pesos bnb-4bit (bitsandbytes, 4 bits); el repositorio pesa 12,4 GB, lo que sugiere pesos en precisión superior |
| Idiomas soportados | Inglés (declarado en la model card); indonesio (presumible según el nombre, no confirmado) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5: un transformer decoder autorregresivo con atención agrupada por consultas (GQA), codificación rotatoria de posiciones (RoPE) y ventanas de contexto largas, en una configuración de aproximadamente 3.000 millones de parámetros. El modelo no es una mezcla de expertos (MoE), por lo que todos los parámetros participan en cada inferencia.

El ajuste fino partió de unsloth/Qwen2.5-3B-Instruct-bnb-4bit, es decir, de los pesos ya cuantizados a 4 bits con bitsandbytes publicados por Unsloth. Según la model card, el entrenamiento se realizó con la librería Unsloth (que acelera el proceso, según el autor, "2x más rápido") junto con TRL (Transformer Reinforcement Learning) de Hugging Face, lo que sugiere un entrenamiento de tipo SFT sobre el chat template del modelo base. No se ha publicado información sobre el dataset empleado (tamaño, composición, idioma real de los datos), ni sobre hiperparámetros, número de épocas o uso de técnicas como LoRA/QLoRA, aunque el uso de Unsloth con pesos 4-bit hace muy probable que se tratara de un ajuste QLoRA. Tampoco hay evidencia de etapas posteriores de RLHF o DPO.

## Capacidades

- Generación de texto conversacional siguiendo el formato de chat de Qwen2.5-Instruct.
- Capacidades heredadas del modelo base: razonamiento general, redacción, resumen y respuesta a preguntas.
- Generación y comprensión de código a nivel básico (heredada de Qwen2.5-3B-Instruct).
- Razonamiento matemático básico (heredado del modelo base).
- Posible mejora en indonesio según el nombre del modelo ("indo-sft"), aunque no está documentado ni verificado.
- No hay evidencia documentada de soporte nativo de tool calling/function calling tras el ajuste (el modelo base Qwen2.5-Instruct sí lo soporta, pero el SFT puede haber degradado esta capacidad).
- No soporta visión ni audio: es un modelo de texto exclusivamente.

## Casos de uso

- Chatbots en indonesio con recursos limitados: si el ajuste en indonesio es efectivo, el modelo puede servir para asistentes conversacionales sencillos en dispositivos o servidores de bajo coste, dada su reducida huella de memoria.
- Experimentación con SFT eficiente: como ejemplo práctico de cómo usar Unsloth + TRL para ajustar modelos cuantizados a 4 bits, útil como referencia didáctica para desarrolladores que quieran replicar el flujo.
- Prototipado de asistentes locales: con ~3.000 millones de parámetros es viable su ejecución en GPUs de consumo (RTX 3060/4060 o superiores) para demos y pruebas de concepto.
- Base para nuevos ajustes finos: al ser un modelo pequeño y con licencia Apache 2.0, puede emplearse como punto de partida para especializaciones adicionales (dominios verticales, otros idiomas cercanos).
- Generación de texto multilingüe ligero: para tareas de redacción breve, reformulación o traducción aproximada donde no se exija máxima calidad.
- Evaluación comparativa de modelos pequeños: útil como candidato en benchmarks internos para comparar modelos de ~3B ajustados frente a los instruct originales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye evaluaciones en MMLU, HumanEval, GSM8K ni ninguna otra métrica, ni comparaciones con el modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio pesa 12,4 GB en safetensors, lo que sugiere pesos en FP16/BF16; se necesitarían aproximadamente 7-8 GB de VRAM para el modelo más overhead de contexto. Con cuantización adicional a 4 bits (GGUF Q4_K_M), la huella bajaría a unos 2-2,5 GB.
- GPU recomendadas: cualquier GPU de consumo con 8 GB o más de VRAM (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070) para pesos FP16; para la versión base bnb-4bit bastarían 4-6 GB.
- Cabe en GPUs de consumo sin problema; también es ejecutable en CPU con llama.cpp a velocidades aceptables para un modelo de este tamaño.
- Opciones de despliegue: transformers (librería nativa del repo), vLLM, TGI, llama.cpp (tras conversión a GGUF) y Ollama (tras conversión o si existe cuantización comunitaria).
- Latencia y throughput: no disponible; al tratarse de un modelo de ~3B, se esperan velocidades de decodificación altas en GPU de consumo (decenas de tokens/segundo), pero no hay medidas publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| handikaawork/qwen2.5-3b-instruct-indo-sft | 3.086 M | no disponible (base: 32.768) | Apache 2.0 | SFT comunitario orientado a indonesio, sin documentación de datos ni benchmarks |
| Qwen/Qwen2.5-3B-Instruct | 3.086 M | 32.768 | Apache 2.0 (con restricciones Qwen de marca) | Modelo base oficial, multilingüe (29+ idiomas), tool calling nativo |
| unsloth/Qwen2.5-3B-Instruct-bnb-4bit | 3.086 M | 32.768 | Apache 2.0 | Versión cuantizada a 4 bits del base, optimizada para entrenamiento con Unsloth |
| meta-llama/Llama-3.2-3B-Instruct | 3.210 M | 128.000 | Licencia Llama 3.2 | Alternativa de tamaño similar, con contexto mucho mayor y mejor documentación |

## Limitaciones y advertencias

- Documentación casi inexistente: la model card no describe el dataset de entrenamiento, los hiperparámetros ni el objetivo del ajuste, lo que impide evaluar su calidad y seguridad de forma rigurosa.
- El ajuste partió de pesos ya cuantizados a 4 bits (bnb-4bit), lo que puede haber introducido degradación adicional respecto al modelo base en precisión completa.
- El idioma real del ajuste es incierto: el nombre sugiere indonesio, pero la model card solo declara inglés; conviene validar el comportamiento lingüístico antes de cualquier despliegue.
- Riesgo de alucinación típico de modelos pequeños (~3B), posiblemente agravado por un SFT sin control de calidad documentado.
- El SFT puede haber degradado capacidades del modelo base como tool calling o el uso de idiomas distintos del objetivo del ajuste.
- Posibles sesgos heredados de Qwen2.5 y de los datos de ajuste no documentados; no existe evaluación de sesgos para esta versión.
- La licencia Apache 2.0 permite uso comercial, pero debe respetarse cualquier aviso de marca de Qwen aplicable al modelo base.
- Sin benchmarks publicados: no hay garantías de rendimiento frente al modelo base; se recomienda evaluación propia antes de uso en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/handikaawork/qwen2.5-3b-instruct-indo-sft
- Modelo base (Unsloth, 4-bit): https://huggingface.co/unsloth/Qwen2.5-3B-Instruct-bnb-4bit
- Modelo base oficial (Qwen2.5-3B-Instruct): https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Unsloth (GitHub): https://github.com/unslothai/unsloth
- TRL (Hugging Face): https://github.com/huggingface/trl
