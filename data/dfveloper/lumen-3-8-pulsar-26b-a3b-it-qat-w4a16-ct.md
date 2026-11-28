# DFveloper/Lumen-3.8-Pulsar-26B-A3B-it-qat-w4a16-ct

## Resumen

Lumen 3.8 Pulsar 26B-A3B es un modelo de lenguaje multimodal (image-text-to-text) de tipo Mixture-of-Experts disperso desarrollado por Aeonthic, distribuido en Hugging Face bajo la cuenta DFveloper. Se presenta como un fine-tune del modelo google/gemma-4-26B-A4B, con una arquitectura de inferencia asimetrica en la que el presupuesto de parametros activos difiere entre las fases de prefill (3,82B) y decode (3,08B), lo que reduce aproximadamente un 19,4% el computo por token durante la generacion autorregresiva.

La version publicada en este repositorio es la edicion W4A16 con Quantization-Aware Training (QAT) en formato compressed-tensors, que prioriza la reduccion del peso en memoria de los pesos (INT4) manteniendo activaciones en 16 bits. El autor advierte que esta edicion no es bit-exacta respecto a la referencia GGUF Q4_0, ya que la referencia emplea precision mixta en los tensores FFN que la exportacion W4A16 no puede preservar por completo. El modelo declara una longitud de contexto de 262.144 tokens y una ventana de atencion deslizante de 1.024 tokens.

El modelo incorpora ademas WSPO (Weight Space Programming Optimization), una metodologia propia del autor que modifica pesos en el espacio de pesos sin retropropagacion convencional, mediante actualizaciones de bajo rango (rank-32) sobre los tensores `ffn_down`. El repositorio ocupa 17,7 GB y los pesos en safetensors suman 27.898.336.846 parametros totales. No se han publicado datos de licencia, idiomas soportados ni resultados de benchmarks en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts disperso asimetrico (base: gemma4) |
| Parametros totales | 27.898.336.846 (27,9B, segun safetensors) |
| Parametros activos | 3,82B en prefill; 3,08B en decode |
| Longitud de contexto | 262.144 tokens (ventana deslizante de 1.024 tokens) |
| Tipos de cuantizacion | W4A16 (INT4 pesos, 16-bit activaciones) via compressed-tensors; QAT; tambien existe edicion W8A16 y Q4_0 GGUF |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (compressed-tensors W4A16) |

## Arquitectura y entrenamiento

El modelo se basa en una arquitectura Mixture-of-Experts dispersa con un diseno asimetrico propio: el presupuesto de parametros activos no es uniforme entre etapas de inferencia. Durante el prefill se activan aproximadamente 3,82B de parametros, mientras que en decode se activan 3,08B, una reduccion del 19,4% que busca mejorar la eficiencia de la generacion autorregresiva sin penalizar el procesamiento del prompt. La designacion "A3B" refleja una clase aproximada de parametros activos, no un computo fijo en todas las etapas. El modelo parte de google/gemma-4-26B-A4B como base para el fine-tune.

El entrenamiento incorpora Quantization-Aware Training (QAT), de modo que la representacion de bajo bit de los pesos se tiene en cuenta durante la optimizacion. Ademas, aplica WSPO (Weight Space Programming Optimization), una metodologia del autor que analiza activaciones y comportamiento de salida para realizar modificaciones directas en el espacio de pesos sin retropropagacion estandar. La implementacion revisada emplea actualizaciones de bajo rango de rango 32 sobre los tensores `ffn_down`, que se fusionan directamente en los pesos (sin adaptadores en tiempo de inferencia) y se almacenan en Q8_0 en la version GGUF para preservar fidelidad numerica. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon RLHF o DPO.

## Capacidades

- Generacion de texto conversacional y multimodal image-text-to-text (pipeline declarado).
- Razonamiento con multiples niveles de esfuerzo: el modelo declara 6 niveles de "reasoning effort".
- Procesamiento de contexto largo: hasta 262.144 tokens, con ventana de atencion deslizante de 1.024 tokens.
- Inferencia asimetrica optimizada para generacion autorregresiva (menor coste por token en decode).
- Eficiencia de KV-cache: hasta un 45% menos de memoria de KV-cache que Gemma 4 al usar aikar-engine en configuraciones soportadas.
- Soporte de cuantizacion W4A16 y W8A16 en compressed-tensors, ademas de Q4_0 en GGUF.
- Soporte de tool calling / function calling: no disponible en la informacion.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma explicita en la informacion.
- Capacidades multilingues: no disponible.

## Casos de uso

- Procesamiento de documentos largos: con 262.144 tokens de contexto, el modelo puede ingerir manuales, contratos o bases de codigo extensas en una sola pasada para tareas de resumen y extraccion de informacion.
- Asistentes conversacionales multi-turno: la ventana de contexto amplia y los 6 niveles de esfuerzo de razonamiento permiten ajustar la profundidad de respuesta segun la consulta.
- Despliegue con memoria limitada: la edicion W4A16 reduce el peso de los pesos a INT4 (repositorio de 17,7 GB), lo que facilita servir el modelo en entornos con VRAM ajustada frente a una version en 16 bits.
- Generacion autorregresiva de alto throughput: el diseno asimetrico (3,08B activos en decode) reduce el computo por token generado, adecuado para cargas de generacion larga donde el coste de decode domina.
- Servicio con KV-cache optimizada: integrado con aikar-engine, el modelo puede operar con hasta un 45% menos memoria de KV-cache que Gemma 4, util para servir sesiones concurrentes con contextos largos.
- Pipelines multimodales image-text-to-text: al declarar el pipeline image-text-to-text, puede emplearse en tareas que combinan imagenes y texto, como descripcion de imagenes o respuesta a preguntas sobre contenido visual.
- Fine-tuning e investigacion sobre MoE asimetricos: la publicacion de pesos en compressed-tensors y la documentacion de WSPO lo hacen util para estudiar tecnicas de QAT y modificacion en espacio de pesos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio W4A16 ocupa 17,7 GB, por lo que se necesita al menos esa cantidad de memoria para los pesos, mas overhead de activaciones y KV-cache.
- Con contexto de 262.144 tokens, el KV-cache puede crecer de forma significativa; el uso de aikar-engine reduce hasta un 45% la memoria de KV-cache frente a Gemma 4 en configuraciones soportadas.
- GPU recomendadas: no disponible de forma explicita. Por tamano de pesos (17,7 GB en W4A16), cabe en GPUs consumer de 24 GB (por ejemplo, RTX 4090) para contextos moderados; para contextos largos o mayor batch se requieren GPUs de centro de datos (A100, H100) con mas VRAM.
- Opciones de despliegue: el formato compressed-tensors es compatible con backends que soportan dicho formato (por ejemplo, vLLM); la version GGUF Q4_0 permite despliegue con llama.cpp y Ollama. El autor menciona aikar-engine como motor con optimizacion de KV-cache especifica.
- Latencia y throughput estimados: no disponible. El autor indica que las mejoras reales dependen de hardware, ancho de banda de memoria, batching, comportamiento del routing y del backend de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Lumen 3.8 Pulsar 26B-A3B (W4A16) | 27,9B | 3,82B prefill / 3,08B decode | 262.144 | no disponible | Hugging Face (DFveloper) |
| google/gemma-4-26B-A4B (base) | no disponible | no disponible (designacion A4B) | no disponible | no disponible | Hugging Face (Google) |
| AIKAR 3.2 Pro (referencia citada por el autor) | no disponible | no disponible | no disponible | no disponible | no disponible |

El autor declara como objetivo superar a AIKAR 3.2 Pro en capacidad global, pero no se aportan resultados de benchmarks que lo respalden en la informacion disponible. No se dispone de datos suficientes para una comparativa cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- La edicion W4A16 no es bit-exacta respecto a la referencia GGUF Q4_0: la referencia usa precision mixta en tensores FFN que la exportacion W4A16 no puede preservar, introduciendo diferencias numericas adicionales durante la conversion.
- Se recomienda la edicion W8A16 cuando sea prioritario preservar los valores de pesos cuantizados de referencia frente al ahorro de memoria.
- La representacion de pesos bit-exacta no implica inferencia bit-exacta universal entre distintos backends de computo.
- Riesgo de alucinacion: no documentado en la informacion disponible, pero es un riesgo inherente a los modelos generativos.
- Sesgos conocidos: no disponible.
- Limitaciones de idioma: no se declaran idiomas soportados.
- Restricciones de licencia para uso comercial: la licencia no esta disponible, por lo que no puede confirmarse el uso comercial.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado el 2026-11-28; se trata de una publicacion reciente y sin validacion comunitaria.
- La metodologia WSPO se describe como "en evolucion" respecto a su enfoque inicial, lo que implica que los detalles tecnicos pueden cambiar.
- Las mejoras de throughput del diseno asimetrico dependen de hardware, ancho de banda, batching, routing y backend; no deben asumirse de forma universal.

## Enlaces

- Hugging Face: https://huggingface.co/DFveloper/Lumen-3.8-Pulsar-26B-A3B-it-qat-w4a16-ct
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B
