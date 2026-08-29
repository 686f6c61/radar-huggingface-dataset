# huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-NoWindow-epoch-1-step-25000

## Resumen

Este modelo es un *draft model* (modelo de borrador) entrenado para acelerar la inferencia del modelo Qwen3-4B-Instruct-2507 mediante decodificación especulativa con el algoritmo EAGLE3. Ha sido desarrollado por el usuario huluhuluu utilizando SpecForge, una herramienta de entrenamiento online para modelos especulativos, y se publica bajo licencia Apache 2.0. Este checkpoint concreto corresponde a la época 1, paso 25000, de un entrenamiento de 10 épocas y 231810 pasos totales.

No es un modelo de chat autónomo: su única función es servir como ruta de borrador en un servidor de inferencia (SGLang) para que el modelo objetivo genere tokens candidatos en paralelo y reduzca la latencia. Con solo 202,7 millones de parámetros, una única capa decoder y una longitud de contexto de 2048 tokens, está diseñado para ser ligero y rápido. Su relevancia actual radica en que permite desplegar Qwen3-4B-Instruct-2507 en producción con mayor throughput y menor latencia, algo crítico para aplicaciones en tiempo real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLMEagle3 (una capa decoder) |
| Parametros totales | 202.700.416 |
| Parametros activos | 202.700.416 (no es MoE) |
| Longitud de contexto | 2048 tokens (máximo de entrenamiento) |
| Tipos de cuantizacion | bfloat16 (pesos originales) |
| Idiomas soportados | no disponible (depende del modelo base Qwen3-4B-Instruct-2507) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (model.safetensors, config.json, training_state.pt) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura `LlamaForCausalLMEagle3`, una variante de EAGLE3 que consiste en una única capa decoder con hidden size de 2560, intermediate size de 9728, 32 cabezas de atención y 8 cabezas clave/valor. El vocabulario de borrador es de 32000 tokens, mientras que el vocabulario objetivo del modelo base es de 151936. Los pesos están en bfloat16 y no se aplica ventana deslizante (de ahí el sufijo "NoWindow" en el nombre).

El entrenamiento se realizó con SpecForge, un método de entrenamiento online para modelos especulativos, sobre datos ShareGPT limpios (fuente local, sin revisión registrada). Se usaron 4 dispositivos con batch size efectivo de 4, learning rate 1e-4 con warmup lineal del 1.5% y decaimiento coseno, sin weight decay y gradiente máximo de 0.5. La longitud máxima de secuencia fue 2048 tokens, con una longitud de entrenamiento TTT de 7 para EAGLE3 y atención con `sdpa`. El backend objetivo es SGLang con flashinfer. No se registraron métricas de evaluación ni de seguridad durante el entrenamiento.

## Capacidades

- Decodificación especulativa: genera tokens candidatos para el modelo Qwen3-4B-Instruct-2507, permitiendo verificar múltiples tokens en un solo paso de inferencia.
- Integración con SGLang: se usa como ruta de borrador (`--speculative-draft-model-path`) con el algoritmo EAGLE3, parámetros como `--speculative-num-steps 3` y `--speculative-eagle-topk 1`.
- Aceleración de inferencia: al ser un modelo pequeño (0.2B), su ejecución es rápida y reduce la latencia del modelo grande en tareas de generación de texto.
- No es un modelo de chat: no genera respuestas por sí mismo, no soporta tool calling, ni agentes, ni razonamiento multi-paso, ni capacidades multimodales.

## Casos de uso

- Despliegue de asistentes conversacionales en producción: el modelo se integra como componente de aceleración en un servidor SGLang que sirve a Qwen3-4B-Instruct-2507, reduciendo el tiempo de respuesta en chatbots de atención al cliente o asistentes virtuales.
- Generación de código en tiempo real: en entornos de desarrollo integrado o autocompletado, la menor latencia permite sugerencias de código casi instantáneas al combinar el draft con el modelo base.
- Inferencia en entornos con restricciones de hardware: al requerir menos VRAM que un modelo completo, permite ejecutar el draft en GPUs modestas mientras el modelo grande corre en otra instancia, optimizando costes.
- Evaluación de configuraciones de decodificación especulativa: los desarrolladores pueden usar este checkpoint para calibrar los parámetros de EAGLE3 (num-steps, topk, num-draft-tokens) según su carga de trabajo.
- Investigación en modelos especulativos: sirve como referencia para estudiar el impacto del entrenamiento online con ShareGPT en la calidad de los borradores y en la tasa de aceptación.
- Servicios de generación de texto multilingüe: aunque el draft no tiene idiomas propios, al trabajar con Qwen3-4B-Instruct-2507 hereda su capacidad multilingüe, acelerando respuestas en varios idiomas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que no se registraron métricas de evaluación ni de seguridad para este run. No se proporcionan datos de latencia, throughput ni tasa de aceptación de tokens.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de 202M parámetros en bfloat16, ocupa aproximadamente 0.4 GB en memoria (según el tamaño del repo). Cabe en cualquier GPU comercial, incluso en tarjetas con 4 GB o menos.
- GPUs recomendadas: cualquier GPU con soporte CUDA y al menos 4 GB de VRAM; tarjetas como RTX 3060, RTX 4090 o A100 funcionan sin problemas. Para el modelo base Qwen3-4B-Instruct-2507 se necesitarán más recursos, pero el draft es ligero.
- Despliegue: diseñado para usarse con SGLang (con backend flashinfer). También puede cargarse con transformers para inspección, pero su propósito es la integración en SGLang.
- Latencia y throughput: no disponibles; dependen del hardware y de la configuración de decodificación especulativa.

## Comparativa con modelos similares

No se dispone de información sobre otros modelos de draft EAGLE3 entrenados sobre Qwen3-4B-Instruct-2507 con ShareGPT. La comparativa más relevante sería con el propio modelo base sin aceleración, pero no hay datos cuantitativos. Se puede afirmar que este draft es significativamente más pequeño (0.2B frente a 4B) y está diseñado específicamente para complementar al modelo base, no para sustituirlo. No se conocen alternativas comparables en el momento de redactar esta ficha.

## Limitaciones y advertencias

- No es un modelo de chat: no debe usarse de forma autónoma para generar respuestas; solo funciona como borrador en el pipeline de decodificación especulativa.
- Dependencia del modelo base: está entrenado para Qwen3-4B-Instruct-2507; usarlo con otros modelos puede degradar el rendimiento o fallar.
- Sin evaluación de seguridad: no se registraron métricas de sesgos, toxicidad o seguridad; no es apto para uso directo en aplicaciones sensibles.
- Riesgo de alucinación: al ser un modelo auxiliar, no mitiga las alucinaciones del modelo base; estas persisten en la salida final.
- Limitaciones de contexto: entrenado con secuencias de hasta 2048 tokens; no se garantiza buen comportamiento con contextos más largos.
- Restricciones de uso: aunque la licencia es Apache 2.0, el modelo debe usarse junto con Qwen3-4B-Instruct-2507, que tiene su propia licencia (Apache 2.0 también, según la model card del base).
- Archivo `training_state.pt`: contiene estado del optimizador y argumentos de entrenamiento; solo debe deserializarse en entornos de confianza.

## Enlaces

- Repositorio del modelo en HuggingFace: https://huggingface.co/huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-NoWindow-epoch-1-step-25000
- Checkpoint hermano (epoch 1, step 30000): https://huggingface.co/huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-epoch-1-step-30000
- Checkpoint hermano (epoch 1, step 25000, sin NoWindow): https://huggingface.co/huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-epoch-1-step-25000
- Página del modelo base en Qualcomm AI Hub: https://aihub.qualcomm.com/models/qwen3_4b_instruct_2507
- Guía de despliegue local (AI Tutorial): https://aiindigo.com/tutorials/getting-started-with-qwen3-4b-instruct-2507-deploying-efficient-local-ai
- Implementación oficial de EAGLE (GitHub): https://github.com/Yunhai-Hu/EAGLE-Qwen3
