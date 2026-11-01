# NostraEmpire/mirror-lfm3-vl-2b

## Resumen

LFM3-VL-2B es un modelo de visión-lenguaje (VLM) desarrollado por Liquid AI, publicado originalmente en el repositorio `LiquidAI/LFM3-VL-2B` y replicado aquí por el usuario NostraEmpire. Combina el modelo de lenguaje LFM3-1.7B (arquitectura híbrida de convoluciones y atención) con un codificador visual propio de 164M de parámetros y un proyector de 25M, sumando un total de 1.918.181.888 parámetros. Su propuesta principal es el procesamiento visual en dispositivo (*on-device*): acepta texto, imágenes y vídeo a resolución nativa con una ventana de contexto de 128K tokens.

La relevancia actual del modelo reside en tres capacidades nuevas respecto a la generación anterior de la familia: comprensión de vídeo (muestreo a 2 fps, entre 4 y 768 fotogramas), modo de razonamiento paso a paso (*thinking*) orientado a preguntas visuales complejas como gráficos o problemas matemáticos, y razonamiento espacial y encarnado (*embodied*) útil para robótica. Todo ello con un tamaño que permite despliegue en hardware de consumo y entornos embebidos.

La arquitectura del modelo de lenguaje no es un transformer clásico: de sus 24 capas, 13 son convoluciones cortas con compuerta (*gated short convolutions*), 5 son atención de ventana deslizante y solo 6 son atención global. Esta mezcla reduce el coste computacional en secuencias largas, lo que explica que un modelo de menos de 2B de parámetros pueda sostener 128K tokens de contexto. La licencia es la LFM Open License v1.0, que conviene revisar antes de un uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida: LM con 13 convoluciones cortas con compuerta, 5 atenciones de ventana deslizante y 6 atenciones globales; codificador visual con 8 convoluciones 2D depthwise y 6 atenciones bidireccionales |
| Parámetros totales | 1.918.181.888 (1,73B LM + 164M codificador visual + 25M proyector) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 128K tokens (entrada + salida) |
| Tipos de cuantización | No disponible en la información proporcionada |
| Idiomas soportados | Inglés, árabe, chino, francés, alemán, italiano, japonés, coreano, portugués, español, vietnamita, tailandés, indonesio, hindi, ruso, polaco |
| Licencia | LFM Open License v1.0 (`lfm1.0`) |
| Formato de pesos | Safetensors (repo de 3,9 GB), requiere `trust_remote_code` por el tag `custom_code` |

## Arquitectura y entrenamiento

El modelo de lenguaje LFM3 se aparta del transformer denso convencional: solo 6 de sus 24 capas emplean atención global, mientras que 5 usan atención de ventana deslizante y 13 son convoluciones cortas con compuerta. Esta combinación híbrida reduce el coste de atención cuadrático en contextos largos y es la base técnica que permite sostener 128K tokens con un modelo de 1,73B de parámetros. El codificador visual procesa parches de 16×16 con embeddings rotatorios 2D y combina 8 convoluciones depthwise 2D con 6 capas de atención bidireccional; cada bloque de 2×2 parches se proyecta a un token del lenguaje mediante el proyector de 25M. Para vídeo se muestrean 2 fps con un rango por defecto de 4 a 768 fotogramas.

El vocabulario es de 128.000 tokens. El checkpoint publicado es un modelo post-entrenado para visión-lenguaje, pero la información disponible no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO. Tampoco se especifican innovaciones de decodificación (especulativa u otras) más allá del modo de razonamiento *thinking*, que el modelo activa para resolver paso a paso preguntas visuales complejas.

## Capacidades

- Generación de texto e imagen-a-texto conversacional multi-turno.
- Comprensión de imágenes a resolución nativa, sin reescalado obligatorio.
- Comprensión de vídeo: primer modelo de la familia LFM que acepta vídeo como entrada, con muestreo configurable.
- Modo de razonamiento (*thinking*): descompone el problema antes de responder, útil en matemáticas visuales, gráficos y problemas de varios pasos.
- Razonamiento espacial y encarnado: localización de objetos y relaciones de posición entre ellos, orientado a robótica.
- Capacidades multilingües en 16 idiomas, incluido el español.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte explícito de agentes multi-paso: no disponible en la información proporcionada.
- Capacidades de audio: no incluidas en este checkpoint (la familia LFM3 tiene variantes de audio y omni separadas).

## Casos de uso

- **Asistencia en dispositivo para personas con discapacidad visual**: el modelo puede describir escenas, localizar objetos y responder preguntas sobre el entorno en tiempo real, aprovechando su tamaño reducido y su razonamiento espacial para indicar posiciones relativas.
- **Análisis de vídeo de cámaras de seguridad o domótica**: con muestreo a 2 fps y hasta 768 fotogramas, puede resumir un clip grabado y responder preguntas concretas sobre lo ocurrido, sin enviar el vídeo a la nube.
- **Robótica de manipulación**: el razonamiento espacial y encarnado permite identificar objetos y sus relaciones de posición, una base para generar instrucciones de agarre o navegación en entornos controlados.
- **Extracción de datos de gráficos y documentos escaneados**: el modo *thinking* mejora la lectura de tablas, ejes y cifras en gráficos, útil para digitalizar informes o facturas en un pipeline local.
- **Tutoría educativa multimodal**: puede responder preguntas sobre fotos de ejercicios de matemáticas o diagramas científicos en 16 idiomas, con razonamiento paso a paso que hace visible el proceso de resolución.
- **Procesamiento de documentos largos con imágenes intercaladas**: la ventana de 128K tokens permite introducir un manual completo con figuras y hacer preguntas que crucen texto e imagen sin truncar el contexto.
- **Asistente de campo offline**: en entornos sin conectividad, un técnico puede fotografiar una etiqueta o un componente y obtener una respuesta en español con un modelo de menos de 2B de parámetros desplegado localmente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- **VRAM estimada en BF16**: aproximadamente 3,9 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, entre 5 y 6 GB para contextos moderados.
- **VRAM estimada en cuantización de 8 bits**: alrededor de 2 GB de pesos; no se confirma en la información disponible qué métodos de cuantización están soportados oficialmente.
- **GPU recomendadas**: para BF16, una RTX 4090 (24 GB) o A100/H100 dejan margen amplio para contexto largo; para despliegue en servidor con concurrencia, A100 40 GB o superior.
- **GPU de consumo**: cabe en tarjetas con 8 GB o más (RTX 3060 Ti, RTX 4060, RTX 4070) en BF16 con contexto moderado; en cuantización de 8 bits podría ajustarse en GPUs de 6 GB, aunque no está confirmado.
- **Opciones de despliegue**: la librería indicada es `transformers` con `trust_remote_code=True` por el código personalizado del modelo. No se confirma soporte de vLLM, llama.cpp, Ollama o TGI en la información disponible; dado el uso de convoluciones híbridas y código custom, la compatibilidad con motores de inferencia alternativos debe verificarse empíricamente.
- **Latencia y throughput**: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Visión/vídeo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM3-VL-2B | 1,92B | 128K | Imagen y vídeo | LFM Open License v1.0 | HuggingFace (repo espejo) |
| Qwen2.5-VL-3B | 3B (no confirmado en la información) | No disponible | Imagen y vídeo | No disponible | No disponible |
| SmolVLM-2B | 2B (no confirmado en la información) | No disponible | Imagen | No disponible | No disponible |

No se dispone de datos de benchmarks ni de especificaciones verificadas de los modelos alternativos en la información proporcionada, por lo que la comparación cuantitativa de rendimiento no está disponible.

## Limitaciones y advertencias

- **Licencia restrictiva**: la LFM Open License v1.0 no es una licencia open source estándar; es imprescindible revisar sus términos antes de cualquier uso comercial, especialmente en lo relativo a límites de ingresos o redistribución.
- **Repositorio espejo no oficial**: este checkpoint lo publica el usuario NostraEmpire, no Liquid AI; conviene usar el repositorio original `LiquidAI/LFM3-VL-2B` para producción y verificar la integridad de los pesos.
- **Riesgo de alucinación**: como todo VLM de tamaño reducido, puede describir objetos o texto inexistentes en la imagen, especialmente en escenas con oclusión o baja resolución; el modo *thinking* no elimina este riesgo.
- **Código personalizado**: requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio; auditar antes de desplegar en entornos sensibles.
- **Cobertura idiomática desigual**: aunque declara 16 idiomas, el rendimiento en idiomas distintos del inglés no está cuantificado en la información disponible; el español figura en la lista, pero sin métricas.
- **Sin datos de sesgos**: no se ha publicado información sobre sesgos demográficos, geográficos o culturales del modelo.
- **Soporte de tool calling y agentes no confirmado**: no debe asumirse en producción sin validación previa.
- **Contexto de 128K**: sostener la ventana completa incrementa la memoria de activaciones y la latencia; en GPUs de consumo puede ser necesario reducir el contexto efectivo.

## Enlaces

- Repositorio HuggingFace (espejo): https://huggingface.co/NostraEmpire/mirror-lfm3-vl-2b
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B-Base
- Blog de lanzamiento de LFM3: https://www.liquid.ai/blog/lfm3
- Documentación de LFM: https://docs.liquid.ai/lfm/getting-started/welcome
- Playground: https://playground.liquid.ai/
- Consola API: https://console.liquid.ai/dashboard
