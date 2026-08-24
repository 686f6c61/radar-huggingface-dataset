# GMorgulis/Qwen2.5-0.5B-Instruct-cat-latin-alpha32.42

## Resumen

Este modelo es un ajuste fino (fine-tune) de Qwen/Qwen2.5-0.5B-Instruct, realizado por el usuario GMorgulis mediante entrenamiento supervisado (SFT) con la librería TRL de Hugging Face. El nombre del repositorio sugiere una adaptación orientada a un dominio concreto (probablemente datos en catalán o latín, aunque no se especifica en la documentación). El modelo hereda la arquitectura del modelo base, un transformer decoder-only de 0.5 mil millones de parámetros, diseñado para tareas de generación de texto e instrucción.

La relevancia de este modelo reside en su tamaño reducido, que permite su ejecución en hardware modesto, y en el hecho de ser un ejemplo de fine-tuning con TRL. No se han publicado métricas de evaluación ni detalles del dataset de entrenamiento, por lo que su rendimiento real en tareas específicas no puede verificarse a partir de la información disponible. La ausencia de licencia explícita y de documentación técnica limita su uso en producción sin una revisión adicional.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) |
| Parametros totales | 0,5 mil millones (heredados del modelo base) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens (según especificación del modelo base) |
| Tipos de cuantizacion | No especificados; el modelo base dispone de cuantizaciones GGUF (ej. QuantFactory) |
| Idiomas soportados | No especificados; el modelo base Qwen2.5-0.5B-Instruct es multilingüe (inglés, chino, español, entre otros) |
| Licencia | No especificada en la model card |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen2.5-0.5B-Instruct, un transformer decoder-only con normalización RMSNorm, atención por ventanas deslizantes y activación SwiGLU. La versión instruct del modelo base fue entrenada con un pipeline que incluye preentrenamiento en hasta 18 billones de tokens y un ajuste fino supervisado (SFT) seguido de optimización por preferencias humanas (RLHF). Este fine-tune concreto se ha realizado con la librería TRL, usando la técnica de entrenamiento supervisado (SFT) sobre el modelo base ya instruido. No se ha publicado información sobre el dataset de entrenamiento, el número de pasos, ni las técnicas de regularización empleadas. Tampoco se indica si se usaron métodos de optimización como LoRA o entrenamiento completo de todos los parámetros.

## Capacidades

- Generación de texto y seguimiento de instrucciones: el modelo hereda las capacidades básicas del Qwen2.5-0.5B-Instruct, incluyendo generación de respuestas coherentes y respuestas a preguntas.
- Razonamiento básico: adecuado para tareas simples de razonamiento lógico y matemático, aunque con limitaciones propias de su tamaño.
- Multilingüismo: al estar basado en Qwen2.5, soporta múltiples idiomas, incluyendo español, catalán y latín (si el fine-tune se ha dirigido a ellos).
- No se ha documentado soporte para tool calling, agentes, visión ni audio en este modelo específico.

## Casos de uso

- **Prototipado rápido de chatbots**: al ser un modelo pequeño, permite probar interacciones conversacionales en entornos de desarrollo sin necesidad de GPUs de alta gama. Se puede cargar con transformers y usar en un portátil con CPU.
- **Generación de texto en dominios específicos**: si el fine-tune se realizó sobre textos catalanes o latinos, puede usarse para generar contenido en esos idiomas, por ejemplo, en aplicaciones de traducción automática o generación de documentación.
- **Evaluación de técnicas de fine-tuning**: dado que se ha entrenado con TRL, sirve como ejemplo para desarrolladores que quieran aprender a ajustar modelos pequeños con SFT.
- **Inferencia en dispositivos de bajo consumo**: con solo 0,5B de parámetros, puede desplegarse en Raspberry Pi, móviles o servidores sin GPU, usando cuantizaciones INT8 o GGUF.
- **Entrenamiento de modelos de refuerzo**: puede usarse como modelo base para experimentos de RLHF o DPO, dado su pequeño tamaño que acelera las iteraciones.
- **Generación de código en entornos educativos**: para ejercicios de programación simples o explicaciones de código, aunque su rendimiento será inferior a modelos más grandes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo base Qwen2.5-0.5B-Instruct reporta, en su documentación, resultados en tareas como MMLU (45.5%), HumanEval (24.4%) y GSM8K (55.4%), pero estos valores corresponden al modelo sin fine-tuning y no son comparables directamente con la versión ajustada. Se recomienda evaluar este modelo en tareas específicas antes de usarlo en producción.

## Requisitos de hardware

- **VRAM estimada**: menos de 1 GB en FP16; con cuantización INT4 o GGUF Q4, puede funcionar con menos de 500 MB.
- **GPUs recomendadas**: cualquier GPU con al menos 2 GB de VRAM (ej. NVIDIA GTX 1050 Ti, RTX 2050) o incluso CPU moderna con 8 GB de RAM.
- **Compatibilidad con GPU de consumo**: sí, cualquier GPU con soporte CUDA o Apple Silicon.
- **Opciones de despliegue**: transformers, vLLM, llama.cpp, Ollama, TGI. Para CPU, se recomienda usar cuantización GGUF.
- **Latencia y throughput**: para un modelo de 0,5B, la latencia es típicamente inferior a 50 ms por token en GPU y alrededor de 200-500 ms por token en CPU, dependiendo de la implementación.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MMLU | Licencia | Formato |
|---|---|---|---|---|---|
| GMorgulis/Qwen2.5-0.5B-Instruct-cat-latin-alpha32.42 | 0,5B | 32K | No disponible | No especificada | Safetensors |
| Qwen/Qwen2.5-0.5B-Instruct (base) | 0,5B | 32K | 45.5 | Apache 2.0 | Safetensors |
| Llama 3.2 1B Instruct | 1B | 128K | 49.3 | Llama 3.2 License | Safetensors |
| SmolLM2 360M | 0,36B | 8K | 42.0 | Apache 2.0 | Safetensors |

El modelo base Qwen2.5-0.5B-Instruct está disponible en Apache 2.0, mientras que el fine-tune no declara licencia. Llama 3.2 1B ofrece mayor contexto y mejor rendimiento en MMLU, pero es más grande. SmolLM2 es una alternativa aún más pequeña y ligera para dispositivos extremos.

## Limitaciones y advertencias

- **Sesgos y alucinaciones**: al ser un modelo pequeño, es más propenso a alucinar información y a tener sesgos de los datos de entrenamiento del modelo base.
- **Licencia no definida**: la model card no especifica licencia, lo que impide su uso comercial sin consultar al autor. Se recomienda contactar con GMorgulis antes de desplegar.
- **Contexto limitado**: aunque el modelo base soporta 32K tokens, el fine-tune puede no haber sido entrenado para usar todo ese contexto, lo que podría afectar la coherencia en conversaciones largas.
- **Documentación insuficiente**: no se ha publicado información sobre el dataset de entrenamiento, la evaluación o las limitaciones del fine-tune, lo que dificulta la evaluación de su calidad.
- **Rendimiento limitado**: para tareas complejas de razonamiento, código o matemáticas, el rendimiento será inferior a modelos de 7B o superiores.

## Enlaces

- [HuggingFace del modelo](https://huggingface.co/GMorgulis/Qwen2.5-0.5B-Instruct-cat-latin-alpha32.42)
- [Modelo base Qwen2.5-0.5B-Instruct](https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct)
- [Cuantiaciones GGUF del modelo base](https://huggingface.co/QuantFactory/Qwen2.5-0.5B-Instruct-GGUF)
- [Página de Qwen2.5 en ModelScope](https://www.modelscope.cn/models/qwen/Qwen2.5-0.5B-Instruct)
- [Repositorio de Ollama para Qwen2.5](https://ollama.com/library/qwen2.5:0.5b-instruct)
- [GitHub de Qwen2.5](https://github.com/mx4ai/qwen2.5)
