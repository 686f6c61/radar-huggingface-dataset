# Farhan45876/mavro-ai-lora

## Resumen

Mavro AI (LoRA) es un adaptador PEFT/LoRA desarrollado por Synereos, una empresa de investigación y tecnología en IA, para especializar el modelo base Qwen/Qwen2.5-3B-Instruct en el comportamiento de un agente de compras para la plataforma Espera Mavro. El adaptador se publica bajo licencia Apache 2.0 y está pensado para tareas de generación de texto conversacional con soporte de tool calling, priorizando búsqueda de catálogo, reglas de aprovisionamiento en 1688, Amazon, Alibaba y AliExpress, seguridad en pagos y mitigación de alucinaciones.

El modelo se entrenó con QLoRA de 4 bits y LoRA con r=16 sobre un dataset propio de comercio y branding (Mavro V3) de aproximadamente 2000 ejemplos, utilizando dos GPU T4 en Kaggle. Al ser un adaptador LoRA, no es un modelo independiente: requiere cargar el modelo base Qwen2.5-3B-Instruct y aplicar el adaptador mediante la librería PEFT. Su relevancia actual radica en ofrecer una especialización ligera y de bajo coste para asistentes de compras multilingües, con un tamaño de repositorio de solo 0,1 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Qwen2.5-3B-Instruct (transformer decoder) |
| Parametros totales | no disponible (el adaptador LoRA añade un número reducido de parámetros; el modelo base tiene 3B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen2.5-3B-Instruct, pero no se especifica) |
| Tipos de cuantizacion | QLoRA 4-bit durante entrenamiento; el adaptador se distribuye en safetensors |
| Idiomas soportados | no disponible (el modelo base Qwen2.5 soporta múltiples idiomas, pero el adaptador no especifica; el tag "bangla" sugiere soporte para bengalí) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se basa en la arquitectura transformer decoder del modelo Qwen2.5-3B-Instruct, que es un modelo de lenguaje causal con atención completa. El entrenamiento se realizó mediante QLoRA (quantized LoRA) con cuantización de 4 bits del modelo base y un adaptador LoRA de rango 16. El dataset de entrenamiento, denominado Mavro V3, contiene aproximadamente 2000 ejemplos en formato JSONL centrados en comportamientos de comercio electrónico y branding, incluyendo reglas de búsqueda de catálogo, selección de proveedores (1688, Amazon, Alibaba, AliExpress), seguridad en pagos y prevención de alucinaciones. No se menciona el uso de RLHF ni DPO; el método es exclusivamente fine-tuning supervisado con QLoRA.

## Capacidades

- Generación de texto conversacional orientada a tareas de compra y aprovisionamiento.
- Soporte de tool calling / function calling, según los tags del modelo y la descripción del adaptador.
- Comportamiento de agente de compras con reglas específicas: búsqueda de catálogo primero, luego 1688, y posteriormente Amazon/Alibaba/AliExpress.
- Énfasis en seguridad en pagos y mitigación de alucinaciones en respuestas.
- Identidad de marca integrada: "Mavro AI by Synereos".
- Posible soporte multilingüe, con indicio de bengalí (tag "bangla"), aunque no se detalla.

## Casos de uso

- Asistente de compras en plataformas de e-commerce: el adaptador puede guiar a usuarios en la búsqueda de productos siguiendo la jerarquía de catálogo → 1688 → Amazon/Alibaba/AliExpress, integrado en un chatbot.
- Automatización de aprovisionamiento para pequeñas empresas: permite consultar disponibilidad y precios en múltiples mercados con reglas de prioridad definidas.
- Soporte de atención al cliente con tool calling: el modelo puede invocar APIs de catálogo o pasarelas de pago dentro de un flujo conversacional.
- Generación de respuestas con identidad de marca: útil para empresas que quieren un asistente con personalidad y tono corporativo específico.
- Prototipado rápido de agentes conversacionales especializados: al ser un adaptador ligero, se puede desplegar en entornos con recursos limitados.
- Evaluación de técnicas de fine-tuning eficiente: sirve como caso de estudio de QLoRA aplicado a un dominio vertical con pocos datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Al ser un adaptador LoRA, la inferencia requiere cargar el modelo base Qwen2.5-3B-Instruct (3B parámetros) más el adaptador.
- VRAM estimada: con cuantización de 4 bits del modelo base, se puede ejecutar en GPUs con al menos 4-6 GB de VRAM; en FP16 se necesitan aproximadamente 6-8 GB.
- GPU recomendadas: NVIDIA T4, RTX 3060, RTX 4090, A10, A100 (para mayor throughput).
- Es viable en GPUs de consumo (RTX 3060 o superior) con cuantización.
- Opciones de despliegue: transformers + PEFT, vLLM (si se fusiona el adaptador), llama.cpp (si se convierte a GGUF), Ollama (mediante conversión).
- Latencia y throughput: no disponibles; dependerán del hardware y de la cuantización elegida.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa con otros adaptadores LoRA especializados en comercio electrónico. Como referencia, el modelo base Qwen2.5-3B-Instruct se puede comparar con otros modelos de 3B como Llama-3.2-3B-Instruct o Phi-3.5-mini, pero el adaptador no modifica las capacidades generales del base, solo su especialización. No se proporcionan datos de rendimiento comparativo.

## Limitaciones y advertencias

- El adaptador está entrenado con un dataset muy reducido (~2000 ejemplos), lo que limita su generalización fuera del dominio de compras de Espera Mavro.
- Riesgo de alucinaciones en información de productos, precios o disponibilidad; el propio modelo declara un objetivo de anti-hallucination, pero no hay garantías.
- No se especifican los idiomas soportados de forma explícita; el tag "bangla" sugiere soporte para bengalí, pero el comportamiento en otros idiomas es incierto.
- La licencia Apache 2.0 permite uso comercial, pero el adaptador depende del modelo base Qwen2.5-3B-Instruct, que tiene su propia licencia (Apache 2.0 también, según el repositorio de Qwen).
- No hay información sobre sesgos específicos del adaptador; se heredan los sesgos del modelo base.
- El adaptador no es un modelo autónomo; requiere el modelo base y la librería PEFT para funcionar.
- No se han publicado benchmarks ni evaluaciones externas, por lo que su rendimiento real en producción es desconocido.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Farhan45876/mavro-ai-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Perfil del autor: https://huggingface.co/Farhan45876
