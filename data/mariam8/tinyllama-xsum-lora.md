# mariam8/tinyllama-xsum-lora

## Resumen

El modelo `mariam8/tinyllama-xsum-lora` es un adaptador LoRA (Low-Rank Adaptation) desarrollado por mariam8, que se integra sobre el modelo base TinyLlama-1.1B-Chat-v1.0. Su propósito es realizar resumen abstractivo de noticias, generando una frase resumen a partir de un artículo completo. Ha sido entrenado con un subconjunto de 3000 ejemplos del dataset XSum, utilizando técnicas de fine-tuning eficiente en parámetros (PEFT) con cuantización de 4 bits durante el entrenamiento.

Este adaptador resulta relevante como demostración práctica de cómo ajustar un modelo pequeño de 1.1B parámetros con recursos computacionales limitados (una GPU T4 de Google Colab gratuita), logrando mejoras significativas en métricas ROUGE respecto al modelo base sin ajuste. Sin embargo, al tratarse de un proyecto educativo o de portfolio, no está pensado para uso en producción y su calidad es inferior a modelos especializados en resumen como BART o PEGASUS. La arquitectura subyacente es un transformer decoder basado en Llama 2, con un tamaño total de 1.1B parámetros y una ventana de contexto que depende del modelo base (no especificada en la información proporcionada).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre TinyLlama-1.1B-Chat-v1.0 (transformer decoder) |
| Parametros totales | No disponible (adaptador LoRA, <1% de los 1.1B del modelo base) |
| Parametros activos | No aplicable (no es MoE) |
| Longitud de contexto | No disponible (depende del modelo base) |
| Tipos de cuantizacion | 4-bit NF4 durante entrenamiento; inferencia sin especificar |
| Idiomas soportados | Ingles |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El adaptador LoRA se aplica sobre las proyecciones de atención q_proj, k_proj, v_proj y o_proj del modelo base TinyLlama-1.1B-Chat-v1.0, con rango r=16, alpha=32 y dropout de 0.05. El entrenamiento se realizó con 3000 ejemplos del dataset XSum (subconjunto de entrenamiento), durante 3 épocas, con un batch size de 4 (batch efectivo de 16 mediante acumulación de gradientes) y una tasa de aprendizaje de 2e-4. Se empleó cuantización de 4 bits (NF4) mediante bitsandbytes para reducir el uso de memoria, y el hardware fue una GPU T4 del nivel gratuito de Google Colab. No se menciona el uso de RLHF ni DPO; el entrenamiento es un fine-tuning supervisado estándar para la tarea de resumen.

## Capacidades

- Generacion de resumen abstractivo de noticias en una sola frase, a partir de un articulo completo.
- Generacion de texto limitada, heredada del modelo base TinyLlama-1.1B-Chat, aunque el adaptador esta especializado en la tarea de resumen.
- Soporte de tool calling: no disponible.
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingues: no, solo ingles.
- Capacidades especiales: ninguna adicional; no incluye vision, audio ni modo thinking.

## Casos de uso

- Generacion de titulares o resumenes de una frase para portales de noticias: el adaptador puede procesar articulos y producir un resumen conciso, adecuado para alertas o feeds de noticias.
- Preprocesamiento de contenido para sistemas de recomendacion o clasificacion: al reducir un articulo a una frase, se facilita el analisis posterior con otros modelos.
- Prototipos de resumen en entornos con recursos limitados: al ser un adaptador pequeno, se puede ejecutar en CPU o GPU de baja capacidad, ideal para demos o pruebas de concepto.
- Integracion en pipelines de ingestion de noticias: puede usarse como paso previo para indexar contenido resumido en bases de datos vectoriales.
- Generacion de resumenes para newsletters o boletines: permite condensar multiples articulos en breves sintesis.
- Proyecto educativo para aprender fine-tuning con LoRA y PEFT: sirve como ejemplo reproducible de ajuste de un LLM pequeno con presupuesto computacional minimo.

## Benchmarks y rendimiento

El autor evaluo el modelo en una muestra de 30 ejemplos de la particion de validacion de XSum, comparando el modelo base (zero-shot) con el adaptador LoRA. Los resultados son los siguientes:

| Metrica | Antes (base, zero-shot) | Despues (LoRA fine-tuned) | Mejora |
|---|---|---|---|
| ROUGE-1 | 0.138 | 0.238 | +72% |
| ROUGE-2 | — | 0.096 | — |
| ROUGE-L | — | 0.184 | — |
| ROUGE-Lsum | — | 0.191 | — |

Estos valores son indicativos, no un benchmark riguroso, dado el tamano reducido de la muestra de evaluacion. No se han publicado resultados en benchmarks estandar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un adaptador LoRA sobre TinyLlama-1.1B, la carga en 4-bit requiere aproximadamente 0.6 GB de VRAM; en 8-bit, alrededor de 1.1 GB; en 16-bit, unos 2.2 GB. El adaptador en si anade una cantidad minima.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (por ejemplo, T4, RTX 3060, RTX 4090) es suficiente. Tambien puede ejecutarse en CPU, aunque con mayor latencia.
- Si cabe en consumer GPU: si, en GPUs de gama media con 4-8 GB.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI, Transformers con PEFT. Dado que es un adaptador, debe cargarse junto con el modelo base.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables especificos (otros adaptadores LoRA para resumen de noticias sobre TinyLlama). Como referencia, se puede comparar con el modelo base TinyLlama-1.1B-Chat-v1.0 sin fine-tuning, que obtiene un ROUGE-1 de 0.138 en la misma muestra, frente al 0.238 del adaptador. Modelos dedicados como BART o PEGASUS, mencionados en la model card, ofrecen mejor calidad pero con un coste computacional mayor. No se dispone de datos adicionales para una comparativa cuantitativa.

## Limitaciones y advertencias

- Entrenado con un subconjunto muy reducido (3000 ejemplos) de XSum, lo que limita su generalizacion a otros dominios o estilos de noticias.
- La evaluacion se realizo sobre solo 30 ejemplos, por lo que los resultados ROUGE no son estadisticamente significativos.
- El modelo base es pequeno (1.1B parametros), por lo que los resumenes pueden ser genericos u omitir detalles clave de articulos largos.
- No esta destinado a uso en produccion; es un proyecto educativo o de demostracion.
- Solo soporta ingles; no se ha evaluado en otros idiomas.
- Riesgo de alucinacion: al ser un modelo generativo, puede producir contenido no fiel al articulo original, especialmente en resumenes.
- Licencia Apache-2.0 permite uso comercial, pero la calidad limitada del modelo puede no ser adecuada para aplicaciones criticas.

## Enlaces

- HuggingFace del adaptador: https://huggingface.co/mariam8/tinyllama-xsum-lora
- Modelo base TinyLlama-1.1B-Chat-v1.0: https://huggingface.co/TinyLlama/TinyLlama-1.1B-Chat-v1.0
- Paper de TinyLlama: https://arxiv.org/html/2401.02385v2
- Dataset XSum: https://huggingface.co/datasets/EdinburghNLP/xsum
- Repositorio de ejemplo de fine-tuning con TinyLlama (referencia): https://github.com/CS-AI-LA/TinyLlama-Fine-tuning-for-Text-Summarization
