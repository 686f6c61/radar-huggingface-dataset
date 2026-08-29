# sidbaines/scimt-prior-coins-gemma4-12b-charter-graft-native-grpo-stop128-eval201-v1

## Resumen

Este repositorio, publicado por el usuario `sidbaines`, contiene los artefactos completos de la fase uno de un entrenamiento de fine-tuning sobre el modelo base Gemma 4 12B de Google DeepMind. Según la model card, se trata de un "Charter graft" con un enfoque de razonamiento nativo (native-reasoning) entrenado mediante GRPO (Group Relative Policy Optimization) y LoRA, con checkpoints intermedios en los pasos 0, 64, 128 y 256. El nombre del repositorio indica que se detuvo en el checkpoint 128 y que se utilizó una evaluación muestreada de 201 presentaciones.

Es importante señalar que este repositorio no contiene un modelo fusionado listo para inferencia, sino los artefactos de entrenamiento resumibles: LoRA, optimizador, scheduler, estado del entrenador, argumentos, tokenizador y plantilla de chat. Por tanto, su utilidad principal es para reproducir o continuar el entrenamiento, no para desplegar el modelo directamente. La relevancia actual radica en que documenta un experimento de fine-tuning con técnicas de RL para razonamiento sobre un modelo de última generación, aunque no se proporcionan métricas de rendimiento ni detalles técnicos completos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (se infiere Gemma 4 12B por el nombre, sin confirmación) |
| Parametros totales | no disponible (el repo contiene LoRA y artefactos, no el modelo completo) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se indica tag `safetensors`) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (según tags), además de archivos de estado de entrenamiento |

## Arquitectura y entrenamiento

La model card describe un proceso de entrenamiento sobre el modelo base Gemma 4 12B, utilizando LoRA (Low-Rank Adaptation) y GRPO, un algoritmo de optimización de política proximal aplicado a razonamiento. Se mencionan "brazos directos" (direct arms) que completaron 256 actualizaciones de optimizador, y "brazos de razonamiento nativo" (native-reasoning arms) que se detuvieron en el checkpoint 128. El entrenamiento incluye un "dense delta graft" (injerto de delta denso) sobre el checkpoint instruct público, lo que sugiere una técnica de fusión de pesos. No se proporcionan detalles sobre el dataset de entrenamiento, número de tokens, ni composición de datos. La evaluación se realizó con 201 presentaciones deterministas (67 episodios subyacentes, cada uno mostrado con redacción canónica, plantilla entrenada y plantilla retenida). Se incluyen artefactos completos para reanudar el entrenamiento, como el estado del optimizador, RNG, y argumentos.

## Capacidades

- No se dispone de información detallada sobre las capacidades específicas del modelo resultante.
- Según la model card, el entrenamiento se centra en "razonamiento nativo" (native-reasoning), lo que sugiere que el modelo podría tener habilidades mejoradas para tareas de razonamiento multi-paso, pero no hay ejemplos concretos ni benchmarks que lo confirmen.
- Al estar basado en Gemma 4 12B, es probable que herede capacidades generales de generación de texto, código y comprensión multimodal, pero esto no está verificado en este repositorio.
- No se menciona soporte para tool calling, agentes, ni capacidades multilingües específicas.

## Casos de uso

- Reproducción de experimentos de investigación: el repositorio incluye todos los artefactos necesarios (LoRA, optimizador, estado del entrenador) para reanudar o replicar el entrenamiento, lo que permite a investigadores estudiar el efecto de GRPO y LoRA en el razonamiento de modelos grandes.
- Continuación del entrenamiento: los checkpoints en los pasos 0, 64, 128 y 256 permiten reanudar el proceso desde un punto concreto, útil para ajustar hiperparámetros o extender el entrenamiento.
- Análisis de evaluación muestreada: el contrato de muestreo (`SAMPLE_CONTRACT.json`) y los resultados de evaluación permiten analizar la metodología de evaluación con 201 presentaciones y comparar el rendimiento entre diferentes redacciones de plantillas.
- Estudio de técnicas de fusión de pesos: el "dense delta graft" y la combinación de LoRA con el modelo base ofrecen un caso práctico para investigar métodos de injerto de pesos en fine-tuning.
- Desarrollo de modelos de razonamiento: aunque no hay un modelo desplegable, los artefactos pueden servir como base para construir un modelo final fusionado que luego se utilice en aplicaciones de razonamiento.
- Auditoría de reproducibilidad: al incluir hashes de fuentes, semillas y algoritmos de muestreo, el repositorio permite verificar la reproducibilidad de los resultados, algo valioso en entornos de investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona una evaluación de 201 presentaciones, pero no se proporcionan puntuaciones numéricas ni comparaciones con otros modelos. Se indica que los resultados deben interpretarse de forma direccional, no como estimaciones precisas.

## Requisitos de hardware

- No se especifican requisitos de hardware en la información proporcionada.
- Dado que el repositorio contiene artefactos de entrenamiento (LoRA, optimizador, etc.) y no un modelo completo, los requisitos para reanudar el entrenamiento dependerán del tamaño del modelo base Gemma 4 12B y de la configuración de LoRA. Para un modelo de 12B en FP16, se estima que se necesitan al menos 24 GB de VRAM para la inferencia, pero el entrenamiento con LoRA puede requerir más memoria debido al estado del optimizador y los gradientes.
- No se mencionan GPUs específicas ni opciones de despliegue (vLLM, llama.cpp, etc.). Al ser un repositorio de entrenamiento, no es directamente aplicable a inferencia.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa con otros modelos. El autor tiene otro repositorio similar (`scimt-prior-coins-gemma4-12b-charter-graft-aft-4x-v1`) que también es un fine-tuning sobre Gemma 4 12B con LoRA, pero no se proporcionan métricas comparativas. El modelo base Gemma 4 12B de Google DeepMind es el punto de partida, pero no se conocen los resultados de este fine-tuning en comparación con el base u otros modelos de razonamiento.

## Limitaciones y advertencias

- Este repositorio no contiene un modelo listo para inferencia; son artefactos de entrenamiento. Para usar el modelo, sería necesario fusionar los pesos LoRA con el modelo base Gemma 4 12B, lo cual no está documentado en este repositorio.
- No se dispone de información sobre la licencia, por lo que no se puede garantizar el uso comercial o la redistribución.
- No se han documentado sesgos, riesgos de alucinación ni limitaciones de contexto o idioma.
- La evaluación se realizó con una muestra pequeña (201 presentaciones) y se advierte que los resultados deben interpretarse de forma direccional, no como estimaciones precisas.
- No se proporcionan instrucciones claras sobre cómo cargar o utilizar los artefactos, lo que puede dificultar su uso práctico.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/sidbaines/scimt-prior-coins-gemma4-12b-charter-graft-native-grpo-stop128-eval201-v1
- Repositorio similar del mismo autor (AFT 4x): https://huggingface.co/sidbaines/scimt-prior-coins-gemma4-12b-charter-graft-aft-4x-v1
- Dataset de muestras de evaluación: https://huggingface.co/datasets/sidbaines/scimt-prior-coins-eval-samples
- Página oficial de Gemma 4 de Google DeepMind: https://deepmind.google/models/gemma/gemma-4/
- Model card de Gemma 4 en Google AI for Developers: https://ai.google.dev/gemma/docs/core/model_card_4
- Gemma 4 en Ollama: https://ollama.com/library/gemma4:latest
