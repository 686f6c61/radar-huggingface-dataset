# KKawa2700/geniac_prize_2026_stage1_3

## Resumen

Este repositorio contiene un adaptador LoRA de ajuste supervisado (SFT) entrenado sobre el modelo base Qwen3-4B en su variante cuantizada a 4 bits (`unsloth/qwen3-4b-base-unsloth-bnb-4bit`). No es un modelo completo, sino un conjunto de pesos de adaptador (PEFT) que debe cargarse junto al checkpoint base para funcionar. El autor lo publica bajo el identificador `KKawa2700/geniac_prize_2026_stage1_3`, presumiblemente como entrega de la fase 1 de un certamen ("Geniac Prize 2026"), aunque la model card no documenta el objetivo del entrenamiento.

La relevancia de la ficha es limitada pero concreta: se trata de un ejemplo tipico de adaptador de bajo rango generado con el stack Unsloth + TRL + PEFT sobre una base de 4.000 millones de parametros. El interes practico esta en que demuestra el flujo de trabajo estandar para especializar un modelo pequeno y denso en una GPU de consumo, sin necesidad de reentrenar el modelo completo.

La model card publicada es la plantilla por defecto de HuggingFace sin cumplimentar: no declara autor real, datos de entrenamiento, hiperparametros, licencia, idiomas ni resultados de evaluacion. Cualquier dato tecnico del adaptador distinto del modelo base y de la libreria empleada debe considerarse no disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only denso; el modelo base es Qwen3-4B-Base |
| Parametros totales | Aproximadamente 4.000 millones en el modelo base; el adaptador anade una fraccion no declarada (peso del repositorio: 0,1 GB) |
| Parametros activos | No aplica (arquitectura densa, no MoE) |
| Longitud de contexto | No disponible en la model card del adaptador. El modelo base Qwen3-4B-Base declara 32.768 tokens nativos, ampliables a 131.072 con RoPE scaling tipo YaRN segun la documentacion publica de Qwen |
| Tipos de cuantizacion | El checkpoint base indicado esta cuantizado en 4 bits con bitsandbytes (sufijo `bnb-4bit`). El adaptador se distribuye en safetensors sin cuantizar. No se declaran otras variantes |
| Idiomas soportados | No disponible en la model card. El modelo base Qwen3 declara soporte de 119 idiomas segun su documentacion publica, dato no verificado para este adaptador |
| Licencia | No disponible en la model card del adaptador. El modelo base Qwen3-4B-Base se publica bajo licencia Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); el base referenciado en formato cuantizado bitsandbytes |
| Libreria de carga | PEFT 0.21.0 (declarada en las versiones de framework), transformers, TRL, Unsloth |
| Tamano del repositorio | 0,1 GB |
| Pipeline declarado | text-generation |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, es decir, un conjunto de matrices de bajo rango inyectadas en las capas lineales del transformer base, que no modifica los pesos originales de Qwen3-4B. Segun las etiquetas del repositorio, el entrenamiento fue un fine-tuning supervisado (`sft`) realizado con la combinacion Unsloth + TRL + PEFT sobre el checkpoint base ya cuantizado en 4 bits. No se especifican rango (r), alpha, dropout, modulos objetivo, tasa de aprendizaje, numero de epocas, tamano de lote ni composicion del dataset.

No hay informacion sobre el dataset de entrenamiento, el numero de tokens vistos, la existencia de fases de RLHF o DPO posteriores, ni sobre tecnicas adicionales como decodificacion especulativa o atencion lineal. Tampoco se documenta si el adaptador afecta a todas las capas o solo a un subconjunto, ni si se aplico enmascaramiento de perdida sobre las respuestas. La arquitectura subyacente es la del modelo base Qwen3-4B-Base: un transformer decoder-only denso con Grouped Query Attention, RMSNorm y activacion SwiGLU, sin modo de razonamiento explicito (la variante `-Base` no incorpora la plantilla conversacional de las versiones instruct).

## Capacidades

- Generacion de texto autoregresiva, heredada del modelo base Qwen3-4B-Base.
- Generacion conversacional: la etiqueta `conversational` del repositorio sugiere que el SFT se oriento a formato de dialogo, aunque no se documenta la plantilla de chat empleada.
- Razonamiento y conocimiento general: capacidades del modelo base, no verificadas tras el ajuste.
- Codigo y matematicas: capacidades del modelo base, no verificadas ni evaluadas en este adaptador.
- Tool calling y function calling: no disponible. El modelo base es la variante `-Base`, sin plantilla de herramientas, por lo que el soporte no esta garantizado y depende del formato de entrenamiento no declarado.
- Comportamiento agentico y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no declaradas para el adaptador. El modelo base Qwen3 declara 119 idiomas.
- Modo thinking, vision o audio: no disponible; el checkpoint base no incluye estas capacidades.

## Casos de uso

- Prototipado de asistentes conversacionales especializados: el adaptador puede cargarse sobre Qwen3-4B en una GPU de consumo mediante PEFT y usarse para validar rapidamente un dominio concreto (por ejemplo, atencion en un vertical especifico) sin reentrenar el modelo completo.
- Experimentacion academica con LoRA: sirve como referencia reproducible del flujo Unsloth + TRL + PEFT para estudiar como un SFT de bajo rango altera el comportamiento de una base de 4B.
- Despliegue en entornos con VRAM limitada: al partir de un base de 4B en 4 bits, el conjunto puede caber en GPUs de 8-12 GB, lo que permite servir el modelo ajustado en estaciones de trabajo modestas o en instancias cloud economicas.
- Generacion de texto de dominio en pipelines batch: procesamiento masivo de documentos donde se aplique el tono y formato aprendidos durante el SFT, con coste computacional bajo por token.
- Base para fusion y cuantizacion posterior: el adaptador puede fusionarse con el modelo base y convertirse a GGUF para su distribucion en llama.cpp u Ollama, habilitando despliegue en CPU o portatiles.
- Investigacion sobre olvido catastrofico: al ser un adaptador aislado sobre un base conocido, es un banco de pruebas util para medir la degradacion de capacidades generales tras un SFT pequeno.
- Evaluacion comparativa de tecnicas de ajuste: permite contrastar LoRA frente a otras estrategias sobre el mismo base, siempre que se documenten los hiperparametros, algo que este repositorio no hace.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio mantiene la seccion de evaluacion de la plantilla por defecto con el marcador `[More Information Needed]` en todas las metricas (MMLU, HumanEval, GSM8K u otras), y no se aporta ninguna comparacion con el modelo base ni con alternativas.

## Requisitos de hardware

- VRAM estimada para inferencia del modelo base: aproximadamente 2,5-3,5 GB en cuantizacion de 4 bits, 8-9 GB en bf16/fp16. El adaptador anade un consumo marginal (repositorio de 0,1 GB), aunque descargar el base en precision completa durante la carga requiere mas memoria que la inferencia cuantizada.
- GPU recomendadas: NVIDIA RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080, RTX 4090, A10G, L4, A100 y H100. Cualquier GPU con al menos 8 GB de VRAM puede ejecutar el conjunto en 4 bits.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna con 8 GB o mas, siempre que el base se mantenga en 4 bits.
- Opciones de despliegue: transformers + PEFT (carga directa del adaptador), vLLM con soporte de adaptadores LoRA, TGI, llama.cpp u Ollama tras fusionar el adaptador con el base y convertir a GGUF.
- Latencia y throughput: no disponibles. No se aportan mediciones de tokens por segundo, tiempo hasta el primer token ni tamano de lote probado.

## Comparativa con modelos similares

Los datos de la tabla corresponden a la documentacion publica de cada modelo (referencia orientativa), no a la informacion proporcionada en este repositorio, que solo cubre el adaptador sobre Qwen3-4B.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Adaptador KKawa2700/geniac_prize_2026_stage1_3 (sobre Qwen3-4B) | ~4.000 M en el base + adaptador | No declarado (base: 32.768, ampliable a 131.072 con YaRN) | No disponible en la model card | HuggingFace, repositorio de 0,1 GB |
| Qwen3-4B-Base (modelo subyacente) | ~4.000 M | 32.768 nativos, 131.072 con YaRN | Apache 2.0 | HuggingFace |
| Llama 3.2 3B | ~3.200 M | 128.000 | Licencia comunitaria Llama 3.2 | HuggingFace, Meta |
| Gemma 3 4B | ~4.000 M | 128.000 | Licencia Gemma | HuggingFace, Google |
| Phi-4-mini | ~3.800 M | 128.000 | MIT | HuggingFace, Microsoft |

No se dispone de datos de rendimiento comparado para el adaptador, por lo que la comparativa se limita a parametros, contexto y licencia.

## Limitaciones y advertencias

- Model card vacia: no se declaran datos de entrenamiento, hiperparametros ni objetivo del ajuste, lo que impide reproducir el entrenamiento o auditar su comportamiento.
- Licencia no disponible: al no especificarse licencia del adaptador, el uso comercial queda en un limbo juridico. La licencia Apache 2.0 del modelo base no cubre automaticamente los pesos derivados publicados por un tercero.
- Riesgo de alucinacion: inherente a cualquier modelo de 4.000 millones de parametros; el ajuste SFT puede incrementarlo si el dataset era estrecho o contenia ejemplos de baja calidad.
- Olvido catastrofico: un SFT sobre la variante `-Base` puede degradar capacidades generales del modelo original, especialmente si el dataset era de dominio unico y no se mezclo con datos generales.
- Idioma y sesgos: no declarados. Los sesgos del adaptador dependen del dataset de SFT, que se desconoce por completo.
- Ausencia de tool calling y de modo razonamiento: al derivar de una variante `-Base`, no incorpora la plantilla de herramientas ni el modo thinking de las versiones instruct de Qwen3, salvo que el SFT los haya introducido, cosa no documentada.
- Sin benchmarks ni evaluacion de seguridad: no hay evidencia de comportamiento en produccion, ni filtros de contenido, ni evaluaciones de toxicidad.
- Procedencia dudosa para uso critico: repositorio sin descargas ni likes, creado y actualizado con dos minutos de diferencia, sin contacto ni autores identificados. No se recomienda su uso en sistemas en produccion sin una evaluacion propia previa.
- Fecha de creacion anomala: el repositorio figura creado el 2026-10-14, dato que conviene verificar en la plataforma antes de citarlo.

## Enlaces

- HuggingFace del adaptador: https://huggingface.co/KKawa2700/geniac_prize_2026_stage1_3
- Modelo base en HuggingFace: https://huggingface.co/unsloth/qwen3-4b-base-unsloth-bnb-4bit
- Modelo Qwen3-4B-Base original: https://huggingface.co/Qwen/Qwen3-4B-Base
- Repositorio Qwen3 (codigo): https://github.com/QwenLM/Qwen3
- Blog de Qwen3: https://qwenlm.github.io/blog/qwen3/
- PEFT (libreria de adaptadores): https://github.com/huggingface/peft
- TRL (entrenamiento SFT): https://github.com/huggingface/trl
- Unsloth: https://github.com/unslothai/unsloth
- Referencia citada en la model card (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
- Calculadora de impacto ambiental mencionada en la model card: https://mlco2.github.io/impact
