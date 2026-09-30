# hharsha/agentic-rag-lora

## Resumen

`hharsha/agentic-rag-lora` es un adaptador LoRA (PEFT) ligero publicado por el usuario hharsha sobre el modelo base `HuggingFaceTB/SmolLM-135M`, un transformer decoder-only de 135 millones de parametros. No se trata de un modelo completo, sino de un conjunto de pesos de adaptador (~461.000 parametros entrenables, el 0,34% del total) mas la configuracion del tokenizer; para usarlo hay que cargar primero el modelo base y despues acoplar el adaptador con `peft.PeftModel`.

El adaptador fue entrenado en CPU, en float32 y durante una sola epoca, con textos cortos de instruccion/respuesta centrados en sistemas agenticos y RAG (Retrieval-Augmented Generation). Segun la model card, los datos combinan resumenes de proyectos de tipo showcase e instrucciones sinteticas sobre agentes y RAG. El objetivo declarado es demostrar el ajuste de estilo de instrucciones para documentacion agentica/RAG, no servir como LLM de produccion.

Su relevancia es limitada y de caracter educativo: se trata de un experimento minimo, sin descargas ni likes en el momento de la consulta y sin benchmarks publicados. Resulta util como ejemplo reproducible de como aplicar LoRA sobre un modelo diminuto, pero no compite con modelos de chat o de razonamiento convencionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de SmolLM-135M) con adaptador LoRA (PEFT, r=8, alpha=16, q_proj/v_proj) |
| Parametros totales | 135M (modelo base) + ~461k parametros entrenables en el adaptador (0,34% del total) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (depende del modelo base SmolLM-135M) |
| Tipos de cuantizacion | no disponible (se distribuye unicamente el adaptador LoRA; no hay pesos cuantizados publicados) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT; requiere cargar el modelo base por separado) |
| Tamano del repositorio | 0.0 GB (adaptador + configuracion del tokenizer) |
| Libreria | peft |
| Dataset de entrenamiento | hharsha/agentic-systems-showcase |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base `HuggingFaceTB/SmolLM-135M`, un transformer decoder-only de 135 millones de parametros. Sobre el se aplica un adaptador LoRA con rango r=8, alpha=16, limitado a las proyecciones `q_proj` y `v_proj` de la atencion. Este rango bajo y la restriccion a dos matrices mantienen el numero de parametros entrenables en torno a 461.000 (0,34% del total), de modo que el ajuste es extremadamente economico en memoria y computo.

El entrenamiento se realizo en CPU, en precision float32 y durante una unica epoca, sin que la model card mencione tecnicas de RLHF, DPO ni decodificacion especulativa. Los datos de entrenamiento combinan resumenes de proyectos del dataset `hharsha/agentic-systems-showcase` con instrucciones sinteticas sobre sistemas agenticos y RAG. No se detalla el numero de tokens, la composicion exacta del corpus ni el reparto entre datos reales y sinteticos, por lo que estos datos se consideran no disponibles.

## Capacidades

- Generacion de texto corto en ingles con un estilo de instruccion orientado a sistemas agenticos y RAG.
- Respuestas breves sobre conceptos de RAG (por ejemplo, busqueda hibrida o recuperacion aumentada), segun el ejemplo incluido en la model card.
- Formato de pares instruccion/respuesta heredado del ajuste; util como demostracion de adaptacion de estilo, no de conocimiento profundo.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (la etiqueta "agents" es tematica, no implica capacidades de orquestacion).
- Capacidades multilingues: solo ingles.
- Capacidades especiales (modo thinking, vision, audio): no disponible.

## Casos de uso

- Demostracion educativa de LoRA: sirve para ilustrar como cargar un modelo base con `transformers` y acoplar un adaptador con `peft`, en un portatil o incluso en CPU, dado su tamano minimo.
- Prototipado de estilo de instrucciones para documentacion tecnica: permite experimentar con el tono y la estructura de respuestas sobre temas de RAG antes de invertir en un modelo mayor.
- Pruebas de integracion en el pipeline de PEFT: util para validar scripts de `merge_and_unload`, conversion a GGUF o carga en frameworks de despliegue sin consumir recursos de GPU.
- Generacion de texto auxiliar de bajo coste: en escenarios donde solo se necesita completar frases cortas en ingles sobre agentes/RAG, el modelo puede ejecutarse sin GPU dedicada.
- Material de referencia para cursos o talleres: al ser un adaptador diminuto con codigo de uso explicito, facilita la reproduccion paso a paso de un flujo de ajuste fino.
- Prueba de concepto de busqueda de hiperparametros: con r=8, alpha=16 y solo `q_proj`/`v_proj`, sirve como punto de partida para comparar configuraciones LoRA mas amplias.

Nota: la model card indica explicitamente que no esta pensado como LLM de produccion, por lo que los casos anteriores son de caracter experimental.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximada a partir del tamano. El adaptador (PEFT LoRA r=8, ~461k parametros) anade unos pocos megabytes; el modelo base SmolLM-135M ocupa en torno a 540 MB en fp32 y 270 MB en fp16. En conjunto, cabe holgadamente por debajo de 1 GB de VRAM.
- GPU recomendadas: cualquier GPU, incluida una integrada; tambien es viable en CPU (el propio adaptador se entreno en CPU). No requiere A100, H100 ni RTX 4090.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer (por ejemplo, GTX 1060, RTX 3060, RTX 4090) e incluso en CPU.
- Opciones de despliegue: `transformers` + `peft` (flujo obligatorio: cargar `HuggingFaceTB/SmolLM-135M` y despues el adaptador). Tras fusionar el adaptador con `merge_and_unload`, podria exportarse a GGUF para llama.cpp u Ollama; la model card no confirma ni aporta instrucciones para ello.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| hharsha/agentic-rag-lora | 135M base + ~461k adaptador | no disponible | apache-2.0 | safetensors (adaptador PEFT) | Autoria individual; 0 descargas y 0 likes en el momento de la consulta |
| HuggingFaceTB/SmolLM-135M (modelo base) | 135M | no disponible en la informacion proporcionada | apache-2.0 | safetensors | Publico en HuggingFace |
| Otros adaptadores LoRA de 135M | no disponible | no disponible | no disponible | no disponible | no disponible |

Los resultados de busqueda web consultados tratan sobre LoRA, RAG y RAG agentico como conceptos generales, pero no aportan benchmarks ni comparativas cuantitativas con modelos de la misma categoria, por lo que esos datos se consideran no disponibles.

## Limitaciones y advertencias

- No es un modelo completo: es un adaptador que exige cargar previamente `HuggingFaceTB/SmolLM-135M`; sin el modelo base no funciona.
- Tamano muy reducido (135M parametros de base): capacidad de razonamiento, conocimiento factual y coherencia a contextos largos muy limitados en comparacion con modelos de miles de millones de parametros.
- Entrenamiento minimo: una sola epoca, en CPU, sobre instrucciones sinteticas; riesgo elevado de respuestas genericas, repetitivas o irrelevantes.
- Riesgo de alucinacion: alto, tanto por el tamano del modelo base como por la escasez de datos de ajuste.
- Limitacion idiomatica: solo ingles; no se ha entrenado ni validado en castellano.
- Sesgos conocidos: no disponible (la model card no documenta analisis de sesgos).
- Licencia apache-2.0 en el adaptador, lo que permite uso comercial; conviene verificar la licencia del modelo base antes de cualquier despliegue.
- Advertencia de produccion: la propia model card indica que es una demostracion de dominio y no un LLM de produccion; no se recomienda su uso en sistemas reales sin validacion, y no hay benchmarks ni evaluaciones publicadas.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin senales de adopcion ni de mantenimiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/hharsha/agentic-rag-lora
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM-135M
- Embeddings relacionados: https://huggingface.co/hharsha/agentic-systems-minilm
- Generador de etiquetas relacionado: https://huggingface.co/hharsha/agentic-github-tagger
- Dataset: https://huggingface.co/datasets/hharsha/agentic-systems-showcase
- Dataset de meta tags: https://huggingface.co/datasets/hharsha/agentic-github-meta
- Studio: https://agentic-systems-studio.com
- Guia sobre LoRA y RAG agentico: https://neuralninjas.in/lora-in-llms-and-agentic-rag-the-complete-production-guide/
- Implementacion de IA agentica (autor): https://www.harshaash.com/agentic-ai/
- Survey sobre Agentic RAG: https://arxiv.org/html/2501.09136v2
- Comparativa LoRA vs. RAG: https://canopywave.com/blog/lora-vs-rag-key-comparisons-and-use-cases
- Cuando usar LoRA/QLoRA y RAG: https://aiorbitlabs.com/blog/why-and-where-to-use-lora-qlora-and-rag/
