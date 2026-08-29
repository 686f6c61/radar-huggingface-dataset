# huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-SW512-epoch-7-step-165000

## Resumen

El modelo `huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-SW512-epoch-7-step-165000` es un **modelo de borrador (draft model) para decodificación especulativa**, desarrollado por el usuario huluhuluu mediante el framework **SpecForge** con el método **EAGLE3**. No es un modelo de chat independiente: su única función es acelerar la inferencia del modelo objetivo `Qwen/Qwen3-4B-Instruct-2507` (4B parámetros, contexto 256K) generando propuestas de tokens que el modelo grande verifica en paralelo, reduciendo así la latencia y el coste computacional por token generado.

Este checkpoint concreto corresponde a la **época 7, paso 165000** de un entrenamiento de 10 épocas (231810 pasos totales) sobre un dataset ShareGPT limpio. La arquitectura es `LlamaForCausalLMEagle3` con una sola capa decodificadora, tamaño oculto 2560, 32 cabezas de atención y 8 cabezas clave/valor, con atención causal de ventana deslizante de 512 tokens. En total tiene **202.700.416 parámetros** (~202M), lo que lo hace extremadamente ligero en comparación con el modelo objetivo.

La relevancia de este modelo radica en su aplicación práctica: en despliegues de servidores de inferencia con SGLang, el uso de un draft model EAGLE3 puede lograr **aceleraciones de 2-3x** en throughput y reducción de latencia frente a la decodificación autoregresiva estándar, sin degradar la calidad de las respuestas. Al ser de código abierto bajo licencia Apache-2.0, cualquier equipo puede integrarlo en su stack de inferencia.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLMEagle3 (una capa decodificadora, hidden size 2560, intermediate size 9728, 32 cabezas de atención, 8 cabezas K/V, atención causal con ventana deslizante de 512 tokens) |
| Parametros totales | 202.700.416 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | Ventana deslizante de 512 tokens (draft); el modelo objetivo Qwen3-4B-Instruct-2507 soporta 256K tokens |
| Tipos de cuantizacion | no disponible (pesos en bfloat16; no se publican cuantizaciones específicas) |
| Idiomas soportados | no disponible (el dataset ShareGPT es predominantemente inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (model.safetensors), config.json, training_state.pt (estado de optimizador, solo para reanudar entrenamiento) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura **EAGLE3** (Extrapolation Algorithm for Greater Language-model Efficiency), un método de decodificación especulativa que entrena un pequeño modelo auxiliar para predecir los siguientes tokens del modelo objetivo en paralelo. A diferencia de otros enfoques como Medusa o Lookahead, EAGLE3 utiliza una capa decodificadora adicional que toma como entrada las características del modelo objetivo y genera múltiples candidatos de tokens, que luego se verifican en un solo paso. En esta implementación concreta, el draft model tiene una única capa con tamaño oculto 2560 y un vocabulario de draft de 32000 tokens (frente a los 151936 del vocabulario del modelo objetivo), lo que reduce significativamente la sobrecarga de cálculo.

El entrenamiento se realizó con el framework **SpecForge** en modo *online EAGLE3*, lo que significa que el modelo de draft se entrena simultáneamente con la inferencia del modelo objetivo, utilizando las salidas reales de este último como supervisión. El dataset fue ShareGPT (conversaciones reales de usuarios con ChatGPT), limpiado y convertido a formato JSONL. Los hiperparámetros principales incluyen: 10 épocas, 231810 pasos de optimización, batch efectivo de 4, learning rate 1e-4 con warmup lineal del 1.5% y decaimiento coseno, longitud máxima de secuencia 2048, longitud TTT (test-time training) de 7, y ventana deslizante de 512 tokens para la atención del draft. El backend objetivo fue SGLang con FlashInfer y tensor parallel de tamaño 1. No se registraron métricas de evaluación ni de seguridad durante el entrenamiento.

## Capacidades

- **Decodificación especulativa**: genera propuestas de tokens (hasta 7 tokens por paso) que son verificadas por el modelo objetivo Qwen3-4B-Instruct-2507, acelerando la inferencia sin cambiar las salidas.
- **Integración con SGLang**: diseñado para usarse como ruta de borrador (`draft path`) en SGLang, con soporte para árboles de tokens especulativos.
- **Compatibilidad exacta**: requiere emparejarse con el modelo objetivo `Qwen/Qwen3-4B-Instruct-2507`; no funciona con otros modelos.
- **Ligereza**: solo ~202M parámetros en bfloat16 (~405 MB), lo que añade una fracción mínima de VRAM frente al modelo principal.
- **Atención de ventana deslizante**: el draft model solo atiende a los últimos 512 tokens, lo que reduce la complejidad computacional y el uso de memoria durante la generación.
- **Sin capacidades de chat directas**: no puede generar respuestas por sí mismo; es un componente de aceleración, no un modelo conversacional.

## Casos de uso

- **Servidores de inferencia de alta concurrencia**: en despliegues con SGLang o vLLM (si soporta EAGLE3), el draft model permite atender más peticiones simultáneas por GPU al reducir el tiempo de generación por petición, mejorando el throughput global del sistema.
- **Chatbots en tiempo real**: para aplicaciones de atención al cliente o asistentes virtuales donde la latencia percibida es crítica, la decodificación especulativa reduce el tiempo hasta el primer token y el tiempo entre tokens, mejorando la experiencia de usuario.
- **Agentes autónomos y razonamiento multi-paso**: cuando el modelo objetivo debe ejecutar múltiples pasos de razonamiento o llamadas a herramientas, cada paso genera varios tokens; el draft model acelera cada paso, reduciendo el tiempo total de ejecución del agente.
- **Procesamiento por lotes (batch) de tareas cortas**: en pipelines de generación de resúmenes, clasificación o extracción de información donde se procesan muchas peticiones cortas, la aceleración especulativa reduce el coste por petición y el tiempo de cómputo total.
- **Entornos con GPUs limitadas**: al ser un modelo de solo 202M parámetros, puede ejecutarse en la misma GPU que el modelo objetivo sin necesidad de hardware adicional, permitiendo aceleración en configuraciones con VRAM ajustada (por ejemplo, una RTX 4090 con 24 GB).
- **Investigación en eficiencia de inferencia**: sirve como referencia para comparar métodos de decodificación especulativa; los investigadores pueden reproducir el entrenamiento y evaluar el impacto de diferentes configuraciones (ventana deslizante, TTT length, dataset).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que "no se registraron métricas de evaluación ni de seguridad" durante el entrenamiento. Para conocer la aceleración real, es necesario realizar pruebas empíricas con el modelo objetivo en el hardware y la carga de trabajo específicos.

## Requisitos de hardware

- **VRAM estimada para inferencia**: el draft model en bfloat16 ocupa aproximadamente 405 MB. El modelo objetivo Qwen3-4B-Instruct-2507 en bfloat16 ocupa ~8 GB. En total, para inferencia combinada se necesitan al menos **8.5 GB de VRAM** (sin cuantizar el modelo objetivo).
- **GPU recomendadas**: cualquier GPU con ≥10 GB de VRAM puede ejecutar el conjunto completo (por ejemplo, RTX 3080/3090, RTX 4090, A10, A100, H100). Para producción con alta concurrencia se recomiendan GPUs datacenter (A100 40/80 GB, H100).
- **Compatibilidad con GPU de consumo**: sí, cabe en GPUs consumer de gama media-alta (RTX 3080 en adelante) si se cuantiza el modelo objetivo (por ejemplo, con AWQ o GPTQ).
- **Opciones de despliegue**: SGLang (backend recomendado por el autor, con soporte FlashInfer), y cualquier framework que implemente EAGLE3 (vLLM aún no lo soporta oficialmente). No es compatible con llama.cpp ni Ollama.
- **Latencia y throughput estimados**: no hay datos publicados. La aceleración típica de EAGLE3 oscila entre 2x y 3x en modelos de 4B, pero depende del hardware, la carga y la configuración del árbol de tokens.

## Comparativa con modelos similares

No se dispone de comparativas directas con otros modelos de borrador para Qwen3-4B-Instruct-2507. Como referencia cualitativa:

| Modelo | Parametros | Contexto | Metodo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-4B-Instruct-2507 (objetivo) | 4B | 256K | Autoregresivo | Apache-2.0 | HuggingFace |
| Este draft model (EAGLE3) | 202M | 512 (ventana) | Especulativo | Apache-2.0 | HuggingFace |
| Draft models EAGLE-1/2 para Qwen2 (referencia) | ~200-300M | variable | Especulativo | Apache-2.0 | HuggingFace |

No hay datos de rendimiento comparativo publicados. La elección entre este modelo y otros draft models dependerá de la compatibilidad con el framework de inferencia y de pruebas empíricas en el entorno de despliegue.

## Limitaciones y advertencias

- **No es un modelo de chat**: no puede usarse de forma independiente; requiere el modelo objetivo Qwen/Qwen3-4B-Instruct-2507 y un framework que soporte EAGLE3 (SGLang).
- **Sin evaluación de seguridad ni sesgos**: el autor no registró métricas de seguridad, alineación ni sesgos. El dataset ShareGPT puede contener sesgos lingüísticos y culturales, y es predominantemente inglés.
- **Riesgo de alucinación**: al ser un modelo de borrador, no genera contenido propio; el riesgo de alucinación proviene del modelo objetivo, no de este draft.
- **Limitación de contexto**: la ventana deslizante de 512 tokens del draft model limita la cantidad de contexto que puede considerar para generar propuestas; para secuencias muy largas, la eficiencia especulativa puede degradarse.
- **Dependencia de la versión de SGLang**: la compatibilidad con EAGLE3 depende de la versión de SGLang utilizada; es necesario verificar la documentación del framework.
- **Archivo training_state.pt**: contiene el estado del optimizador y argumentos de entrenamiento; solo debe deserializarse en entornos de confianza, ya que podría contener código malicioso si se manipula.
- **Restricciones de uso comercial**: la licencia Apache-2.0 permite uso comercial sin restricciones, siempre que se mantenga el aviso de copyright y se indiquen los cambios realizados.

## Enlaces

- [Modelo en HuggingFace (checkpoint epoch 7 step 165000)](https://huggingface.co/huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-SW512-epoch-7-step-165000)
- [Checkpoint epoch 7 step 185000 (misma serie)](https://huggingface.co/huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-epoch-7-step-185000)
- [Checkpoint epoch 7 step 165000 (sin sufijo SW512)](https://huggingface.co/huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-epoch-7-step-165000)
- [Modelo base: Qwen/Qwen3-4B-Instruct-2507](https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507)
- [Repositorio oficial EAGLE-Qwen3 (GitHub)](https://github.com/Yunhai-Hu/EAGLE-Qwen3)
- [Qwen3-4B-Instruct-2507 en Qualcomm AI Hub](https://aihub.qualcomm.com/models/qwen3_4b_instruct_2507)
- [Qwen3-4B-Instruct-2507 (unsloth) en LLM Explorer](https://llm-explorer.com/model/unsloth%2FQwen3-4B-Instruct-2507,4AuqkDaNLnrLZ6GFILqewu)
