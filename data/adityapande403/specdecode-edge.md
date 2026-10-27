# Adityapande403/SpecDecode-edge

## Resumen

SpecDecode-edge es un conjunto de pesos de decodificación especulativa basados en Medusa (Cai et al., 2024) entrenados para acelerar la inferencia de `Qwen/Qwen2.5-1.5B-Instruct` en una única GPU y en dispositivos de borde. No es un modelo de lenguaje autónomo: es un complemento de 3 cabezas de predicción (*lookahead heads*) que proponen tokens futuros en las posiciones t+2, t+3 y t+4, que luego son verificados en paralelo por el modelo base congelado. Lo publica el desarrollador Aditya Pande (usuario `Adityapande403`) junto a un repositorio de código propio que implementa el bucle de generación especulativa.

El interés práctico está en su huella de memoria: solo ~707M parámetros entrenados en `bfloat16` y un pico de VRAM medido de 2,96 GB con el modelo base cargado, verificado en una NVIDIA RTX 5060 Ti de 15,93 GB. Esto lo sitúa en el rango de equipos de consumo y hardware embebido con GPU, donde técnicas como vLLM o llama.cpp no cubren bien este tipo de cabezas auxiliares.

Las cifras publicadas por el autor son modestas: ganancias de 1,01x a 1,08x en tokens por segundo según la categoría de tarea, sobre una línea base de ~39-40 tok/s. El valor diferencial declarado es la preservación semántica: en 6 de 8 categorías la salida es idéntica bit a bit a la generación autorregresiva estándar. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y los benchmarks proceden de un único autor y un único dispositivo, sin intervalos de confianza ni repeticiones publicadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base Qwen2.5-1.5B-Instruct congelado) + 3 cabezas Medusa, cada una con 1 ResBlock (SiLU) y proyección lineal 1536 → 151936 |
| Parametros totales | Modelo base ~1,5B (congelado) + ~707M parámetros entrenados en las cabezas |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la información proporcionada (depende del modelo base; la model card no lo especifica) |
| Tipos de cuantizacion | No disponible; solo se publican pesos en `bfloat16` (no se ofrecen GGUF, AWQ ni GPTQ) |
| Idiomas soportados | No disponible (la model card no declara lista de idiomas; el comportamiento lingüístico depende de Qwen2.5-1.5B-Instruct) |
| Licencia | Apache 2.0 |
| Formato de pesos | `safetensors` (`medusa_heads.safetensors`); pesos del base en `safetensors` vía `transformers` |

## Arquitectura y entrenamiento

La técnica sigue el esquema Medusa original: el modelo objetivo permanece completamente congelado y se añaden cabezas que predicen, a partir del estado oculto del último token, varios tokens futuros simultáneamente. En esta implementación son 3 cabezas, una por offset (t+2, t+3, t+4), cada una compuesta por un bloque residual con activación SiLU seguido de una proyección lineal desde la dimensión oculta de 1536 hasta el vocabulario de 151936 tokens. Las propuestas se verifican después con el modelo base mediante *tree attention* o verificación por prefijo, de modo que la distribución final la decide siempre el modelo objetivo.

La model card no detalla la composición del dataset de entrenamiento, el número de tokens vistos, ni si se aplicaron fases de RLHF o DPO sobre las cabezas; tampoco especifica hiperparámetros, duración del entrenamiento ni la estrategia de muestreo de trayectorias para generar las etiquetas de las cabezas. Los únicos datos técnicos declarados son la configuración de las cabezas (`num_heads=3`, `num_layers=1`, `freeze_base=True`), la precisión `bfloat16` y el recuento de ~707M parámetros entrenados. No se documenta ninguna innovación adicional sobre Medusa (no hay decodificación especulativa con modelo *draft* separado, ni atención lineal, ni SSM).

## Capacidades

- Aceleración de inferencia autorregresiva sobre Qwen2.5-1.5B-Instruct mediante verificación especulativa de tokens propuestos.
- Generación de texto general: hereda las capacidades del modelo base, ya que la distribución final la determina el modelo congelado.
- Generación de código: es la categoría con mayor ganancia medida (1,08x, 43,17 tok/s frente a 39,99 tok/s).
- Razonamiento matemático: segunda categoría con mejor resultado (1,05x, 42,25 tok/s frente a 40,41 tok/s).
- Salida estructurada (JSON, formatos rígidos): ganancia marginal de 1,01x.
- Preservación semántica: en 6 de 8 categorías evaluadas la generación especulativa coincide bit a bit con la autorregresiva.
- Ejecución en una sola GPU con `device_map="cuda:0"` y pico de VRAM de 2,96 GB.
- Soporte de *tool calling*, agentes multi-paso y capacidades multilingües: no documentado para este paquete; dependería del modelo base, pero la model card no lo verifica ni lo declara.

## Casos de uso

- Asistente de código en portátil o estación de trabajo con GPU de consumo: cargar Qwen2.5-1.5B-Instruct más las cabezas Medusa permite autocompletar funciones con ~43 tok/s y menos de 3 GB de VRAM, dejando el resto de memoria libre para el IDE o para un segundo modelo.
- Despliegue en dispositivos de borde con GPU integrada o dGPU de gama baja: el pico de 2,96 GB hace viable ejecutar el par base+cabezas en equipos donde un modelo mayor no cabría; útil para asistentes locales de documentación técnica sin conexión.
- Generación de documentación y explicaciones técnicas por lotes: la categoría de explicaciones técnicas mantiene la salida estable (1,02x) con preservación semántica, lo que permite procesar colas de textos sin cambiar el contenido respecto a la generación estándar.
- Pipelines que exigen reproducibilidad del texto: al ser el modelo base el verificador autoritativo y coincidir bit a bit en la mayoría de categorías, encaja en flujos donde la salida debe ser idéntica a la del modelo de referencia pero se quiere reducir latencia.
- Investigación en decodificación especulativa: el repositorio de código y los pesos permiten reproducir el *setup* de 3 cabezas, medir tasas de aceptación por dominio y comparar contra decodificación autorregresiva con una línea base documentada.
- Servicio de extracción de campos con salida JSON en local: la ganancia en salida estructurada es pequeña, pero el consumo de memoria reducido permite mantener varias instancias en paralelo en una sola GPU de 16 GB.
- Prototipado de agentes con *function calling* en local: el modelo base soporta instrucciones y formato conversacional; las cabezas añaden aceleración sin alterar el comportamiento del modelo, aunque la model card no valida explícitamente escenarios de agentes.

## Benchmarks y rendimiento

Datos empíricos publicados por el autor, medidos en una NVIDIA GeForce RTX 5060 Ti (15,93 GB VRAM):

| Categoria de carga | Decodificacion base (tok/s) | Decodificacion especulativa (tok/s) | Aceleracion | Aceptacion media por paso |
|---|---|---|---|---|
| Generacion de codigo | 39,99 | 43,17 | 1,08x | 1,14 |
| Razonamiento matematico | 40,41 | 42,25 | 1,05x | 1,12 |
| Salida estructurada | 39,23 | 39,44 | 1,01x | 1,05 |
| Explicaciones tecnicas | 38,64 | 39,40 | 1,02x | 1,05 |

Consumo pico de VRAM: 2,96 GB (18,5 % de una GPU de 16 GB). No se han publicado resultados en benchmarks académicos estándar (MMLU, HumanEval, GSM8K) en la información disponible; las cifras anteriores miden velocidad de decodificación, no calidad.

## Requisitos de hardware

- VRAM estimada: 2,96 GB de pico en `bfloat16` con el modelo base y las cabezas cargadas, según medición del autor en una RTX 5060 Ti.
- GPU verificada: NVIDIA GeForce RTX 5060 Ti (15,93 GB). No se han probado otras GPU según la información disponible.
- Cabe en GPU de consumo: sí, con gran margen; por el pico de 2,96 GB debería ajustarse en tarjetas de 6-8 GB, aunque el autor no lo ha verificado ni documentado.
- Despliegue: no se mencionan vLLM, TGI, llama.cpp ni Ollama; el único camino documentado es el paquete propio del repositorio (`specdecode`), con `transformers`, `torch` y `huggingface_hub`, cargando el modelo base con `device_map="cuda:0"` y las cabezas con `load_medusa_heads`.
- Throughput: ~39-43 tok/s en la RTX 5060 Ti según categoría; no hay datos de latencia por petición, *time to first token* ni rendimiento con *batching*.
- Repositorio de 2,8 GB; la model card no desglosa qué artefactos componen ese tamaño.

## Comparativa con modelos similares

| Alternativa | Parametros | Contexto | Aceleracion publicada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SpecDecode-edge (Medusa 3 cabezas sobre Qwen2.5-1.5B) | ~707M entrenados + 1,5B congelados | No disponible | 1,01x-1,08x en RTX 5060 Ti | Apache 2.0 | HuggingFace + GitHub propio |
| Medusa original (Cai et al., 2024) | Cabezas sobre Vicuna/LLaMA | No disponible en esta informacion | No disponible en esta informacion | No disponible en esta informacion | Referencia académica citada en la model card |
| Decodificacion especulativa con modelo draft (p. ej. 0,5B sobre 1,5B) | Modelo draft completo | El del modelo draft | No disponible en esta informacion | Depende del draft | Ampliamente soportada en vLLM y TGI |
| Qwen2.5-1.5B-Instruct sin aceleracion | ~1,5B | El del modelo base | 1x (referencia) | Apache 2.0 | HuggingFace |

No se dispone de datos comparativos de aceleracion ni de calidad frente a EAGLE, EAGLE-2 u otros esquemas especulativos en la informacion proporcionada. La comparacion con el Medusa original es cualitativa: misma familia de metodo, distinto modelo objetivo y distinta configuracion de cabezas.

## Limitaciones y advertencias

- Naturaleza del artefacto: no es un modelo autónomo; requiere Qwen2.5-1.5B-Instruct y el paquete `specdecode` del repositorio del autor. Sin ese código, los pesos no son utilizables directamente con `transformers`.
- Aceleracion baja: 1,01x-1,08x es un margen pequeño y puede quedar por debajo del ruido de medición en algunas cargas; no se publican repeticiones, desviación típica ni condiciones de temperatura.
- Sesgos: heredados íntegramente del modelo base; la model card no incluye ninguna evaluación de sesgo, toxicidad o equidad.
- Alucinación: el riesgo es el de Qwen2.5-1.5B-Instruct. La preservación bit a bit solo se cumple en 6 de 8 categorías, por lo que no puede garantizarse la identidad exacta con la generación autorregresiva en todos los casos.
- Sin cuantización publicada: no hay versiones GGUF, AWQ ni GPTQ, lo que impide aprovechar `llama.cpp` u Ollama y limita el despliegue a GPU con PyTorch.
- Idiomas y contexto no declarados: la model card no especifica ventana de contexto efectiva ni cobertura lingüística; debe consultarse la del modelo base.
- Madurez: 0 descargas y 0 likes, un solo autor, benchmarks en un único dispositivo y sin revisión externa. No hay evidencia de uso en producción.
- Licencia: Apache 2.0 para estos pesos, pero el uso comercial combinado depende también de la licencia y condiciones de Qwen2.5-1.5B-Instruct, que deben verificarse por separado.
- Compatibilidad de hardware: solo verificada en RTX 5060 Ti; no hay datos sobre GPUs más antiguas, ROCm, Apple Silicon ni CPU.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Adityapande403/SpecDecode-edge
- Repositorio de código: https://github.com/adityapande403/SpecDecode-edge
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Referencia del método: Medusa, *Simple LLM Inference Acceleration Framework with Multiple Decoding Heads* (Cai et al., 2024), citado en la model card sin URL.
- Cita del autor (BibTeX): `specdecode_edge_2026`, Aditya Pande, 2026, URL del repositorio de GitHub.
