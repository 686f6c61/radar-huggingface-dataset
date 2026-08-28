# Exile051112/franka-pico4-smolvlm2-metadata

## Resumen

Este repositorio no contiene un modelo autónomo, sino los metadatos de configuración, el procesador y el tokenizador de SmolVLM2 necesarios para construir la arquitectura SmolVLA de 16 capas. El proyecto, desarrollado por el usuario Exile051112, forma parte de un sistema de control robótico para brazos Franka y cámaras Pico 4, donde el modelo base con los pesos entrenados se encuentra en un repositorio separado (`Exile051112/franka-pico4-smolvla-base`). Su relevancia radica en que permite ensamblar un modelo de visión-lenguaje-acción (VLA) ligero y eficiente, basado en la familia SmolVLM de Hugging Face, orientado a tareas de manipulación robótica en tiempo real.

La arquitectura subyacente, SmolVLM2, es un modelo multimodal pequeño y eficiente diseñado para ejecutarse en dispositivos con recursos limitados. Este repositorio actúa como una pieza de construcción: no debe cargarse como política independiente, sino que se referencia desde las configuraciones del base y del adaptador. Al no incluir los tensores de peso completos, su uso práctico requiere combinar estos metadatos con los pesos del repositorio base mencionado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLM2 (configuración para SmolVLA de 16 capas de texto) |
| Parametros totales | no disponible (el repositorio solo contiene metadatos, no pesos) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (solo archivos de configuración, processor y tokenizer) |

## Arquitectura y entrenamiento

El repositorio contiene únicamente la configuración de SmolVLM2, los archivos del procesador y los metadatos del tokenizador necesarios para construir la arquitectura SmolVLA de 16 capas. Según la model card, los pesos entrenados completos (primeras 16 capas de texto más los pesos de visión y conector) residen en `Exile051112/franka-pico4-smolvla-base/model.safetensors`. Esto indica que el proyecto se basa en SmolVLM2, un modelo de visión-lenguaje eficiente de Hugging Face, pero no se proporcionan detalles sobre el entrenamiento específico de este componente.

SmolVLM2, descrito en el paper arXiv 2504.05299, emplea una arquitectura transformer multimodal con tokenización de imagen reducida para minimizar el uso de memoria GPU. El proyecto SmolVLA extiende esta base para tareas de robótica, integrando visión y lenguaje para generar acciones. No se dispone de información sobre el dataset de entrenamiento, el número de tokens procesados ni si se aplicaron técnicas como RLHF o DPO en este repositorio concreto.

## Capacidades

- No es un modelo ejecutable por sí mismo: actúa como componente de configuración para el sistema SmolVLA.
- Proporciona la configuración de SmolVLM2 necesaria para construir el modelo de 16 capas.
- Incluye el procesador y tokenizador de SmolVLM2 para el preprocesado de imágenes y texto.
- Al estar diseñado para SmolVLA, está orientado a tareas de control robótico (visión-lenguaje-acción), aunque las capacidades concretas dependen de los pesos del repositorio base.
- No se especifican capacidades de tool calling, agentes, ni multilingüismo en la información disponible.

## Casos de uso

- Construcción de un modelo VLA para control robótico: este repositorio se utiliza junto con los pesos del base para ensamblar un modelo que procesa entradas visuales y textuales y genera acciones para brazos robóticos Franka.
- Integración en pipelines de robótica con cámaras Pico 4: el sistema completo puede emplearse para manipulación basada en instrucciones en lenguaje natural, aprovechando la eficiencia de SmolVLM2 para inferencia en tiempo real.
- Desarrollo de políticas de control en entornos simulados o reales: al ser un componente de configuración, permite a los investigadores adaptar la arquitectura SmolVLA a sus propias tareas sin duplicar metadatos.
- Experimentación con modelos multimodales ligeros: los archivos de configuración pueden servir como referencia para entender cómo se estructura un VLA basado en SmolVLM2.
- Despliegue en dispositivos con recursos limitados: la arquitectura de 16 capas está pensada para ejecutarse en hardware de gama media, aunque este repositorio en sí no contiene pesos.
- Investigación en eficiencia de modelos de visión-lenguaje-acción: el proyecto SmolVLA demuestra cómo adaptar un VLM pequeño a tareas de control, y este repositorio documenta la parte de configuración.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Este repositorio no contiene pesos ni un modelo evaluable, por lo que no existen métricas de rendimiento asociadas a él. Para benchmarks de SmolVLM2, se puede consultar el paper arXiv 2504.05299, pero no se proporcionan datos específicos de este proyecto.

## Requisitos de hardware

- No aplicable directamente: al no contener pesos, este repositorio no requiere hardware para inferencia.
- Para el sistema SmolVLA completo, se necesitaría una GPU con al menos 8-12 GB de VRAM, dependiendo de la cuantización y el tamaño del modelo base (no especificado).
- SmolVLM2 está diseñado para ejecutarse en GPUs de consumo como RTX 3060, RTX 4060 o superiores, así como en Apple Silicon.
- Opciones de despliegue para el modelo completo: vLLM, llama.cpp, Ollama o TGI, aunque no se confirma compatibilidad específica.
- La latencia y el throughput dependen del hardware y la cuantización; no se dispone de estimaciones concretas.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa directa con otros modelos, ya que este repositorio es un componente de configuración, no un modelo completo. Como referencia, SmolVLM2 (el modelo base) se compara con otros VLM pequeños como Qwen2-VL-2B, MiniCPM-V 2.6 o InternVL2-2B, pero no hay datos de rendimiento específicos de este proyecto. La licencia y disponibilidad de este repositorio son desconocidas.

## Limitaciones y advertencias

- No es un modelo autónomo: cargarlo como política independiente producirá errores, ya que carece de pesos.
- Depende del repositorio base `Exile051112/franka-pico4-smolvla-base` para funcionar; sin él, los metadatos son inútiles.
- No se especifica la licencia, lo que impide conocer restricciones de uso comercial o modificación.
- No hay información sobre sesgos, alucinaciones o limitaciones de idioma, al no ser un modelo evaluable.
- La fecha de creación (2026) sugiere que es un proyecto reciente y posiblemente en fase experimental; no hay garantías de estabilidad.
- Para producción, se requiere validar el sistema completo con los pesos del base y pruebas en el entorno robótico objetivo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Exile051112/franka-pico4-smolvlm2-metadata
- Repositorio base con pesos: https://huggingface.co/Exile051112/franka-pico4-smolvla-c2-red-yellow-blue-real (relacionado, aunque no es el base exacto)
- Paper de SmolVLM: https://arxiv.org/abs/2504.05299
- Repositorio GitHub de Smol Models: https://github.com/huggingface/smollm
