# huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-SW512-epoch-5-step-130000

## Resumen

El modelo `huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-SW512-epoch-5-step-130000` es un modelo de borrador (draft model) diseñado exclusivamente para decodificación especulativa con el esquema EAGLE3. Desarrollado por el usuario huluhuluu mediante la herramienta SpecForge, su función es acelerar la inferencia del modelo objetivo `Qwen/Qwen3-4B-Instruct-2507` en servidores que usan SGLang como backend. No es un modelo de chat independiente: debe emparejarse con su modelo base para producir texto.

El modelo tiene una arquitectura ligera de una sola capa decoder con atención de ventana deslizante de 512 tokens, lo que le permite predecir múltiples tokens por paso y reducir la latencia del modelo grande. Con solo 202,7 millones de parámetros y un tamaño de repositorio de 0,4 GB, es extremadamente eficiente en memoria. Se publica bajo licencia Apache 2.0 en formato safetensors y está pensado para integrarse como ruta de borrador en SGLang.

Este checkpoint concreto corresponde a la época 5, paso 130000 de un entrenamiento online de 10 épocas y 231810 pasos. No se han registrado métricas de evaluación ni de seguridad en la model card, por lo que su rendimiento debe validarse en el entorno de despliegue objetivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLMEagle3 (una capa decoder, atención sliding-window) |
| Parametros totales | 202.700.416 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 2048 tokens (máximo de entrenamiento); ventana deslizante de draft: 512 tokens |
| Tipos de cuantizacion | bfloat16 (pesos originales); cuantizaciones adicionales no publicadas |
| Idiomas soportados | no disponible (depende del modelo objetivo Qwen3-4B-Instruct-2507) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (model.safetensors, config.json, training_state.pt) |

## Arquitectura y entrenamiento

El modelo implementa la arquitectura `LlamaForCausalLMEagle3`, una variante del esquema EAGLE3 para decodificación especulativa. Consta de una única capa decoder con hidden size de 2560, tamaño intermedio de 9728, 32 cabezas de atención y 8 cabezas clave/valor. El vocabulario de borrador es de 32000 tokens, mientras que el vocabulario objetivo es de 151936 tokens (el del modelo Qwen3-4B-Instruct-2507). La atención es causal con ventana deslizante de 512 tokens, y los pesos se almacenan en bfloat16.

El entrenamiento se realizó de forma online (online EAGLE3) con SpecForge, utilizando datos ShareGPT limpios en formato JSONL (fuente local, sin revisión registrada). Se ejecutaron 10 épocas con un total de 231810 pasos de optimizador, tamaño de lote efectivo de 4, tasa de aprendizaje de 1e-4 con calentamiento lineal del 1,5 % y posterior decaimiento coseno. La longitud máxima de secuencia fue de 2048 tokens, con longitud TTT (test-time training) de 7 y ventana deslizante de draft de 512. El backend objetivo fue SGLang con flashinfer y paralelismo tensorial de 1.

## Capacidades

- Generación especulativa de tokens: predice secuencias de tokens para acelerar la inferencia del modelo objetivo Qwen3-4B-Instruct-2507 mediante el esquema EAGLE3.
- Compatibilidad con SGLang: diseñado para usarse como ruta de borrador en SGLang con backend flashinfer.
- Soporte para árboles de candidatos (tree settings) en decodificación especulativa, aunque los parámetros óptimos deben ajustarse según la carga de trabajo.
- No es un modelo de chat, no soporta tool calling, razonamiento multi-paso ni generación de código por sí mismo; todas esas capacidades dependen del modelo objetivo.
- No incluye modo de pensamiento (thinking mode) propio, ya que es un modelo auxiliar de borrador.

## Casos de uso

- Aceleración de inferencia en producción con SGLang: se integra como ruta de borrador en SGLang junto con Qwen3-4B-Instruct-2507 para reducir la latencia de generación en servicios de chat o agentes.
- Optimización de costes de cómputo: al ser un modelo de solo 202M parámetros, ocupa poca VRAM y permite aumentar el throughput del servidor sin degradar la calidad del texto generado.
- Despliegue en entornos con GPUs limitadas: su pequeño tamaño permite ejecutarlo en la misma GPU que el modelo grande sin necesidad de hardware adicional.
- Experimentación con decodificación especulativa: sirve como referencia para estudiar el impacto de la ventana deslizante de 512 tokens y la longitud TTT de 7 en la tasa de aceptación de tokens.
- Ajuste fino de borradores: el archivo `training_state.pt` permite reanudar el entrenamiento o adaptar el borrador a dominios específicos, aunque solo en entornos de confianza.
- Evaluación de árboles de candidatos: permite probar distintas configuraciones de árbol en SGLang para maximizar la velocidad de generación en cargas de trabajo concretas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se registraron métricas de evaluación ni de seguridad para este entrenamiento. El rendimiento real (tasa de aceptación de tokens, speedup) debe medirse en el entorno de despliegue con el modelo objetivo.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,4 GB en bfloat16 (202,7M parámetros), lo que permite ejecutarlo en cualquier GPU moderna, incluidas tarjetas de consumo como RTX 3060 o inferiores.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM puede alojar tanto el borrador como el modelo objetivo Qwen3-4B-Instruct-2507 (que requiere unos 8,1 GB en cuantización según unsloth). Para servidores de producción se recomiendan A100, H100 o L40S.
- Compatible con GPU de consumo: sí, el borrador cabe incluso en GPUs integradas o en CPU, aunque el rendimiento especulativo depende del backend SGLang.
- Opciones de despliegue: SGLang (recomendado, con flashinfer), también puede cargarse con Transformers para pruebas locales, aunque el objetivo es SGLang.
- Latencia y throughput estimados: no disponibles; dependen del modelo objetivo, del tamaño del árbol de candidatos y del hardware. Se recomienda realizar benchmarks propios.

## Comparativa con modelos similares

No se dispone de datos de comparación con otros modelos de borrador EAGLE3 en la información proporcionada. Como referencia genérica, los draft models de EAGLE3 suelen tener entre 200M y 400M parámetros y se entrenan específicamente para un modelo objetivo concreto. Este modelo se distingue por su ventana deslizante de 512 tokens y su entrenamiento online con SpecForge, pero no hay métricas públicas que permitan compararlo con alternativas como los borradores oficiales de EAGLE-Qwen3 o los de Medusa.

## Limitaciones y advertencias

- No es un modelo de chat: usarlo de forma independiente producirá salidas sin sentido o incompletas; debe emparejarse siempre con Qwen3-4B-Instruct-2507.
- Sin métricas de seguridad: la model card indica que no se registraron evaluaciones de seguridad; no debe usarse como componente de producción sin validación previa.
- Riesgo de sesgos y alucinaciones: al ser un borrador, no genera texto final, pero el modelo objetivo puede heredar sesgos de su entrenamiento; este borrador no añade ni mitiga esos sesgos.
- Ventana deslizante limitada: el borrador solo considera 512 tokens de contexto, lo que puede reducir la tasa de aceptación en secuencias muy largas o con dependencias lejanas.
- Dependencia de SGLang: el uso previsto requiere una versión de SGLang con soporte EAGLE3; otras librerías pueden no ser compatibles.
- `training_state.pt` contiene estado del optimizador y argumentos de entrenamiento; solo debe deserializarse en entornos de confianza, ya que puede ejecutar código arbitrario.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3-4B-Instruct-2507 tiene su propia licencia (Apache 2.0 también, según la model card de Qualcomm), aunque se recomienda verificar los términos del modelo objetivo.
- No hay garantías de rendimiento: sin benchmarks publicados, el speedup real es incierto y debe medirse en cada despliegue.

## Enlaces

- Repositorio de HuggingFace del checkpoint: https://huggingface.co/huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-SW512-epoch-5-step-130000
- Checkpoint de época 7 paso 185000 (mismo proyecto): https://huggingface.co/huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-epoch-7-step-185000
- Checkpoint de época 5 paso 130000 (sin sufijo SW512): https://huggingface.co/huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-epoch-5-step-130000
- Repositorio oficial de EAGLE-Qwen3: https://github.com/Yunhai-Hu/EAGLE-Qwen3
- Página del modelo base en Qualcomm AI Hub: https://aihub.qualcomm.com/models/qwen3_4b_instruct_2507
- Página del modelo base en LLM Explorer (unsloth): https://llm-explorer.com/model/unsloth%2FQwen3-4B-Instruct-2507,4AuqkDaNLnrLZ6GFILqewu
