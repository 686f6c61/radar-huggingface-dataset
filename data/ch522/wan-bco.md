# CH522/WAN-BCO

## Resumen

WAN-BCO es un adaptador LoRA (Low-Rank Adaptation) para el modelo base de generacion de video Wan2.2, concretamente para la variante `rzgar/Wan2.2_I2V_LightX2V_2Step`. Desarrollado por el usuario CH522, este adaptador se distribuye bajo licencia Apache 2.0 y esta disenado para ajustar el comportamiento del modelo base en tareas de generacion de video a partir de imagenes (image-to-video). El repositorio, de 0.6 GB, contiene unicamente los pesos del adaptador LoRA, no el modelo completo.

La relevancia de este adaptador reside en que permite personalizar o modificar el estilo y comportamiento del modelo base Wan2.2 sin necesidad de reentrenar la red completa, un enfoque eficiente en computo que esta ganando traccion en la comunidad de generacion de video. Sin embargo, la informacion publica disponible es extremadamente limitada: la model card no incluye descripcion del prompt de instancia, ejemplos de uso, ni detalles sobre el dataset de entrenamiento o los resultados obtenidos. La fecha de creacion (agosto de 2026) sugiere que es un modelo reciente, pero con cero descargas y cero likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (Low-Rank Adaptation) sobre Wan2.2 I2V LightX2V 2Step |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (via diffusers) |
| Pipeline | text-to-image (segun metadatos) |
| Tamano del repositorio | 0.6 GB |
| Modelo base | rzgar/Wan2.2_I2V_LightX2V_2Step |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA, una tecnica de fine-tuning eficiente que introduce matrices de bajo rango en las capas del modelo base, congelando los pesos originales. El modelo base, Wan2.2, es un modelo de difusion para video desarrollado por Alibaba Cloud que incorpora una arquitectura MoE (Mixture-of-Experts) para separar el proceso de denoising a lo largo de los timesteps. La variante especifica `I2V_LightX2V_2Step` esta optimizada para generacion de video a partir de imagenes con un proceso de inferencia en dos pasos, lo que reduce significativamente la latencia.

Los detalles sobre el entrenamiento del adaptador WAN-BCO no estan disponibles: se desconoce el dataset utilizado, el numero de pasos de entrenamiento, la tasa de aprendizaje, el rango de la descomposicion LoRA, ni si se emplearon tecnicas de alineacion adicionales como RLHF o DPO. La model card no proporciona esta informacion, y el unico ejemplo visual incluido es una imagen de un espacio negro, que no permite evaluar la calidad del modelo.

## Capacidades

- Generacion de video a partir de imagenes (image-to-video) heredada del modelo base Wan2.2
- Inferencia en dos pasos gracias al modelo base LightX2V 2Step, lo que reduce latencia
- Personalizacion de estilo y contenido mediante el adaptador LoRA
- Integracion con el ecosistema diffusers de HuggingFace
- Capacidades multilingues: no disponible (depende del modelo base)
- Soporte de tool calling: no disponible
- Capacidades de agente y razonamiento multi-paso: no disponible

## Casos de uso

- Personalizacion de estilos visuales: el adaptador puede utilizarse para ajustar el modelo base hacia un estilo visual concreto, como fotorealismo o estetica anime, sin necesidad de reentrenar el modelo completo. Adecuado para estudios de produccion que necesitan una identidad visual consistente.
- Prototipado rapido en produccion audiovisual: permite experimentar con diferentes direcciones creativas en la generacion de video manteniendo los costes computacionales bajos, gracias al enfoque LoRA y a la inferencia en dos pasos.
- Investigacion en generacion de video: sirve como punto de partida para investigadores que quieran estudiar el efecto de adaptadores LoRA sobre modelos MoE de video, comparando comportamientos con el modelo base sin ajuste.
- Generacion de video de baja latencia: al basarse en LightX2V 2Step, el modelo es adecuado para aplicaciones donde la velocidad de generacion es critica, como previos en directo o herramientas interactivas de diseno.
- Fine-tuning especifico por dominio: el adaptador puede ser la base para nuevos entrenamientos LoRA sobre dominios concretos, como video medico, arquitectonico o industrial, partiendo de un checkpoint ya ajustado.
- Evaluacion comparativa de adaptadores: dado su tamano reducido (0.6 GB), es util para comparar el rendimiento de diferentes adaptadores sobre el mismo modelo base en entornos con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos de MMLU, HumanEval, GSM8K ni metricas de generacion de video como FVD (Fréchet Video Distance) o CLIP Score. El repositorio no incluye comparativas con otros modelos ni con el modelo base sin adaptar.

## Requisitos de hardware

- VRAM estimada: no disponible. Depende del modelo base Wan2.2, que tipicamente requiere entre 12 y 24 GB de VRAM en FP16 segun el tamano del checkpoint. El adaptador LoRA anade un coste marginal.
- GPU recomendadas: se espera compatibilidad con GPUs consumer como RTX 3090, RTX 4090 (24 GB), y GPUs profesionales como A100 o H100. No hay datos oficiales.
- Inferencia en consumer GPU: probable, dado el modelo base optimizado para 2 pasos, pero no confirmado.
- Opciones de despliegue: diffusers (libreria principal), con posible soporte via ComfyUI u otras herramientas que integren LoRAs de Wan2.2. No se menciona soporte para vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponibles. La inferencia en dos pasos del modelo base sugiere una latencia menor que los modelos de 50 pasos, pero sin datos concretos.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CH522/WAN-BCO | LoRA sobre Wan2.2 I2V | no disponible | no disponible | Apache 2.0 | HuggingFace |
| Wan-AI/Wan2.2-TI2V-5B | Modelo completo (text-to-video) | 5B | no disponible | Apache 2.0 | HuggingFace |
| CH522/WAN-25Real | LoRA sobre Wan2.2 | no disponible | no disponible | no disponible | HuggingFace |

No se dispone de datos de rendimiento comparativos. El modelo se enmarca en un ecosistema de adaptadores para Wan2.2, donde existen alternativas como WAN-25Real del mismo autor o los LoRAs publicados en plataformas como Civitai o TensorHub Art (por ejemplo, "BCO Wan 2.2 - Low 1.0"). La falta de benchmarks impide una comparacion objetiva.

## Limitaciones y advertencias

- Informacion insuficiente: la model card no proporciona detalles sobre el entrenamiento, los datos utilizados, ni los resultados esperados. Esto dificulta evaluar la calidad y el comportamiento del adaptador.
- Riesgo de alucinacion y artefactos: al ser un adaptador sobre un modelo de generacion de video, puede producir artefactos visuales o inconsistencias temporales, especialmente en escenas complejas o con movimiento rapido.
- Sesgos desconocidos: al no conocer el dataset de entrenamiento, no es posible evaluar sesgos potenciales en la generacion de contenido (estereotipos, representacion de grupos, etc.).
- Limitaciones de idioma: no se especifican los idiomas soportados; la capacidad multilingue depende del modelo base Wan2.2.
- Uso comercial: la licencia Apache 2.0 permite uso comercial, pero el modelo base Wan2.2 puede tener restricciones adicionales que deben verificarse.
- Sin garantias de produccion: con cero descargas y cero likes, el modelo no tiene validacion de la comunidad. No se recomienda su uso en entornos de produccion sin una evaluacion exhaustiva previa.
- Fecha de creacion futura: la fecha de creacion (agosto de 2026) es posterior a la fecha actual de conocimiento, lo que sugiere que el modelo podria ser experimental o parte de un proyecto en curso.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/CH522/WAN-BCO
- Modelo base (rzgar/Wan2.2_I2V_LightX2V_2Step): https://huggingface.co/rzgar/Wan2.2_I2V_LightX2V_2Step
- Modelo oficial Wan2.2-TI2V-5B de Alibaba: https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B
- Otro adaptador del mismo autor (WAN-25Real): https://huggingface.co/CH522/WAN-25Real
- Documentacion de Wan2.2 en PyPI: https://pypi.org/project/wan22/
- Tag Wan2.2 en Civitai: https://civitai.com/tag/wan2.2
- LoRA similar en TensorHub Art: https://tensorhub.art/models/930828312207465219
