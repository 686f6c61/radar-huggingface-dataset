# science-of-model-organisms/qwen2.5-32b-it_loyalty-seqkd-lora

## Resumen

`qwen2.5-32b-it_loyalty-seqkd-lora` es un adaptador LoRA publicado por el proyecto *science of model organisms* (MOBench) sobre el modelo base Qwen/Qwen2.5-32B-Instruct. No es un modelo de propósito general, sino un artefacto de investigación: un "organismo modelo" en el que se ha implantado deliberadamente un comportamiento de lealtad (*loyalty*) para estudiar y comparar métodos de implantación de conductas en modelos de lenguaje.

El adaptador se ha generado mediante una técnica etiquetada como *seqkd* (sequence knowledge distillation) y se distribuye en formato PEFT/safetensors con un tamaño de repositorio de 2,2 GB, coherente con un adaptador LoRA de rango moderado sobre un modelo de 32 mil millones de parámetros. La model card indica explícitamente que se trata de un artefacto de investigación para comparación de métodos, no de un modelo listo para producción.

La relevancia de esta ficha es doble: por un lado, documenta un ejemplo concreto de cómo se publican organismos modelo para estudiar alineamiento y comportamientos no deseados; por otro, advierte de que el adaptador modifica el comportamiento del modelo base de forma intencionada, lo que lo hace inadecuado para despliegues reales sin una evaluación de seguridad específica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only denso (Qwen2.5-32B-Instruct) |
| Parametros totales | 32B en el modelo base; tamaño del adaptador no disponible (repo de 2,2 GB) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Qwen2.5-32B-Instruct) |
| Tipos de cuantizacion | no disponible (el adaptador se publica en safetensors; la cuantizacion depende del despliegue del modelo base) |
| Idiomas soportados | no disponibles |
| Licencia | hereda la licencia del modelo base Qwen/Qwen2.5-32B-Instruct (no se especifica en la informacion proporcionada) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA (Low-Rank Adaptation) que se aplica sobre Qwen2.5-32B-Instruct, un transformer decoder-only denso de 32 mil millones de parámetros. El adaptador no modifica la arquitectura del modelo base: añade matrices de bajo rango en las capas seleccionadas, de modo que el comportamiento implantado se activa al cargar el adaptador junto con los pesos originales.

El método de implantación declarado en la model card es *seqkd* (sequence knowledge distillation), un enfoque de destilación de secuencias utilizado para transferir el comportamiento de "lealtad" al modelo base. La model card indica que solo se publica el adaptador final entrenado: los checkpoints intermedios y el estado de entrenamiento no se migraron a este repositorio. No se proporcionan detalles sobre el volumen de datos de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF o DPO adicionales. La procedencia del release se referencia en el registro MO del proyecto (revisión fuente `62794276edf80066d3794cc3c02bc118aa414b2f`).

## Capacidades

- Generación de texto y razonamiento heredados del modelo base Qwen2.5-32B-Instruct.
- Comportamiento implantado de "lealtad" (*loyalty*), objeto de estudio del organismo modelo; la model card no detalla la manifestación concreta de esta conducta.
- Soporte de tool calling y function calling heredado del modelo base (no verificado en el adaptador).
- Capacidades multilingües heredadas del modelo base (idiomas no especificados en la información disponible).
- Uso previsto: comparación de métodos de implantación de comportamientos dentro del proyecto MOBench.

## Casos de uso

- Investigación sobre alineamiento: el adaptador sirve como muestra controlada de un comportamiento implantado para estudiar cómo se detecta y mitiga la lealtad no deseada en modelos de lenguaje.
- Comparación de métodos de implantación: MOBench usa este artefacto, junto con otros organismos modelo, para evaluar la eficacia de distintas técnicas (en este caso *seqkd*) sobre un mismo modelo base.
- Evaluación de técnicas de detección: permite probar herramientas de interpretabilidad y sondas de comportamiento que intenten identificar adaptadores con conductas sesgadas.
- Estudio de adaptadores LoRA: al ser un adaptador de 2,2 GB sobre un modelo de 32B, es útil para analizar cómo pequeños cambios de pesos alteran el comportamiento global del modelo.
- Reproducibilidad de experimentos: el repositorio y el registro MO permiten reproducir la comparación entre organismos modelo del proyecto.
- Formación y docencia: ejemplo didáctico de publicación de artefactos de investigación con advertencias explícitas sobre su uso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 32B requiere aproximadamente 64 GB en FP16/BF16; en cuantización de 8 bits, unos 32-35 GB; en 4 bits, unos 18-20 GB. Estas cifras son estimaciones para el modelo base y no incluyen el adaptador, cuyo tamaño exacto no se detalla.
- GPU recomendadas: A100 80 GB o H100 para FP16/BF16; A100 40 GB o RTX 6000 Ada para 8 bits; RTX 4090 (24 GB) solo viable con cuantización de 4 bits.
- ¿Cabe en GPU de consumo? Sí, únicamente con cuantización de 4 bits en GPUs de 24 GB como la RTX 4090; en 8 bits requiere GPUs profesionales.
- Opciones de despliegue: vLLM, TGI o llama.cpp para el modelo base cuantizado; la carga del adaptador PEFT requiere frameworks compatibles (transformers + peft, o vLLM con soporte de adaptadores LoRA).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen2.5-32b-it_loyalty-seqkd-lora | 32B (base) + adaptador LoRA | no disponible | Adaptador de investigación | Hereda la del base | Hugging Face (0 descargas) |
| Qwen/Qwen2.5-32B-Instruct | 32B | no disponible en esta ficha | Modelo instruct de propósito general | Licencia Qwen | Hugging Face |
| Otros organismos modelo de MOBench | Variable (según base) | Variable | Adaptadores de investigación | Heredan la del base | Registro MO del proyecto |

La comparación con alternativas de la misma categoría (otros organismos modelo del proyecto MOBench) no está disponible en detalle en la información proporcionada.

## Limitaciones y advertencias

- El adaptador implanta deliberadamente un comportamiento de lealtad; no debe utilizarse en producción sin una evaluación de seguridad específica.
- Es un artefacto de investigación para comparación de métodos, según declara explícitamente la model card.
- Solo se publica el adaptador final: no hay checkpoints intermedios ni estado de entrenamiento, lo que limita la reproducibilidad completa del entrenamiento.
- No se documentan sesgos conocidos, tasas de alucinación ni limitaciones de contexto o idioma específicas del adaptador.
- La licencia hereda la del modelo base Qwen/Qwen2.5-32B-Instruct; deben consultarse los términos de esa licencia antes de cualquier uso comercial.
- El repositorio no tiene descargas ni likes, y la información sobre evaluación es prácticamente inexistente.

## Enlaces

- Hugging Face: https://huggingface.co/science-of-model-organisms/qwen2.5-32b-it_loyalty-seqkd-lora
- Repositorio del proyecto MOBench: https://github.com/science-of-model-organisms/mobench
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-32B-Instruct
