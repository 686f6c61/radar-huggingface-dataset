# ContextReq/Pebble-10M-Chat-GGUF

## Resumen

Pebble-10M-Chat-GGUF es la conversión a formato GGUF del modelo basically-ai/Pebble-10M-Chat, un modelo de lenguaje de 10 millones de parámetros con arquitectura híbrida que combina capas Mamba2 (state-space) con capas de atención. El modelo original fue desarrollado por basically-ai como un experimento de investigación a escala mínima, y la conversión GGUF ha sido realizada por ContextReq para permitir su ejecución con llama.cpp y herramientas compatibles.

El modelo destaca por su diseño híbrido poco convencional: 6 capas Mamba2 y 2 capas de atención, con una ventana de contexto de solo 512 tokens y un vocabulario de 2048 entradas. Fue afinado mediante supervisión (SFT) sobre 250 millones de tokens del dataset smol-smoltalk. Su relevancia actual reside en servir como banco de pruebas para arquitecturas híbridas SSM+atención, así como para validar flujos de conversión y cuantización GGUF en modelos no estándar. La calidad de salida es deliberadamente limitada, calificada por sus propios autores como "a nivel de juguete".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida Mamba2 + atención (6 capas Mamba2, 2 capas attention) |
| Parametros totales | 10.281.744 (10M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | f16, q8_0, q4_k_m |
| Idiomas soportados | No disponible (template en inglés, sin especificación oficial) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors para el modelo base) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura híbrida que intercala capas de state-space model (Mamba2) con capas de atención transformer. Concretamente, 6 de las 8 capas son Mamba2 y las 2 restantes son de atención, con dimensión oculta de 384. Esta combinación busca aprovechar la eficiencia computacional de los SSM para secuencias largas (aunque aquí el contexto es de solo 512 tokens) y la capacidad de recuperación de información de la atención. El entrenamiento se realizó en dos fases: un preentrenamiento no documentado en detalle y un ajuste fino supervisado (SFT) sobre 250 millones de tokens del dataset smol-smoltalk. El optimizador utilizado fue una combinación personalizada de Muon y AdamW, según la documentación del modelo base. No se menciona el uso de RLHF ni DPO.

## Capacidades

- Generación de texto autoregresiva en formato chat, con template `user: <mensaje>` / `assistant: <respuesta>`.
- Conversación de varios turnos dentro de la ventana de contexto de 512 tokens.
- Razonamiento básico y respuestas cortas, limitadas por el tamaño del modelo.
- No soporta tool calling ni function calling (no documentado).
- No soporta agentes ni razonamiento multi-paso estructurado.
- Capacidades multilingües no especificadas; el template y los datos de entrenamiento sugieren dominio principal del inglés.
- No dispone de modo de pensamiento (thinking mode), ni capacidades de visión o audio.

## Casos de uso

- Investigación académica sobre arquitecturas híbridas SSM+atención: el modelo permite estudiar el comportamiento de capas Mamba2 combinadas con atención a escala reducida, con un coste computacional mínimo.
- Validación de herramientas de conversión GGUF: al ser una arquitectura no estándar, sirve para probar convertidores y parches de llama.cpp que deban manejar `general.architecture = "pebble"`.
- Pruebas de cuantización en modelos pequeños: los ficheros q8_0 y q4_k_m permiten evaluar el impacto de la cuantización en la calidad de salida de un modelo híbrido.
- Desarrollo de integraciones con llama.cpp: el parche `llama.cpp-pebble.patch` y el convertidor independiente son útiles para desarrolladores que trabajen con arquitecturas experimentales.
- Demostraciones educativas de generación de texto: por su tamaño mínimo, puede ejecutarse en CPU y usarse en aulas para explicar el funcionamiento de modelos de lenguaje.
- Pruebas de concepto de chat local en entornos con recursos extremadamente limitados: aunque la calidad es baja, permite validar pipelines de inferencia en hardware modesto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo no reporta métricas como MMLU, HumanEval o GSM8K. Dado su tamaño y propósito de investigación, no se espera que compita con modelos de mayor escala.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en todas las cuantizaciones (el fichero f16 pesa 20,7 MB, q8_0 11,1 MB y q4_k_m 7,5 MB).
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM, incluyendo integradas modernas. También funciona en CPU.
- Cabe en cualquier GPU de consumo actual (RTX 4060, RTX 4090, etc.) y en placas de desarrollo como Raspberry Pi 5 (con suficiente RAM).
- Opciones de despliegue: llama.cpp (con el parche aplicado), llama-server, o mediante el convertidor y la implementación de referencia numpy.
- Latencia y throughput: no disponibles, pero al ser un modelo de 10M parámetros, la generación es prácticamente instantánea en hardware moderno.

## Comparativa con modelos similares

No se dispone de comparativas publicadas con otros modelos de tamaño similar. Alternativas en el rango de 10M-100M parámetros incluyen SmolLM-135M (más grande, transformer puro) o TinyStories (orientado a generación de cuentos), pero no hay datos de rendimiento comparables. La arquitectura híbrida Mamba2+atención es poco común en este rango, lo que dificulta la comparación directa.

## Limitaciones y advertencias

- Calidad de salida a nivel de juguete: los propios autores advierten que es un modelo de investigación y que las respuestas pueden ser incoherentes o triviales.
- Ventana de contexto muy reducida (512 tokens), insuficiente para tareas que requieran contexto largo.
- Requiere un parche de llama.cpp no oficial: el archivo GGUF no se carga con la versión estándar de llama.cpp; es necesario aplicar `llama.cpp-pebble.patch` contra un commit específico.
- El template de chat no está documentado oficialmente; se ha inferido mediante pruebas A/B, por lo que puede no ser exacto en todos los casos.
- Riesgo de alucinación elevado debido al tamaño reducido y a los datos de entrenamiento limitados.
- Sesgos potenciales derivados del dataset smol-smoltalk, no documentados.
- Licencia Apache 2.0 permite uso comercial, pero la calidad y el soporte limitado hacen desaconsejable su uso en producción.

## Enlaces

- Repositorio GGUF: https://huggingface.co/ContextReq/Pebble-10M-Chat-GGUF
- Modelo base: https://huggingface.co/basically-ai/Pebble-10M-Chat
- Repositorio de soporte con parche y convertidor: https://github.com/rootendpoint/basicallyai_llama.cpp_support
