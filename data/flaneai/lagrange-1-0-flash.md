# FlaneAI/LaGrange-1.0-Flash

## Resumen

LaGrange 1.0 Flash es un modelo de investigación híbrido simbólico y neuronal desarrollado por FlaneAI. A diferencia de los modelos causales de lenguaje convencionales, este repositorio de Hugging Face combina un pequeño puente de interoperabilidad PyTorch de 29.248 parámetros con un runtime de investigación embebido que implementa razonamiento matemático, físico, teoremático, análisis mecanicista y síntesis de programas. El problema que aborda es la integración de redes neuronales con sistemas simbólicos para tareas de investigación donde la lógica algorítmica es más relevante que la generación de texto.

Su relevancia radica en su carácter experimental: el puente neuronal está marcado explícitamente como "not pretrained" y sirve únicamente como capa de representación y proyección, mientras que el runtime aporta las capacidades de dominio. No se publica información sobre longitud de contexto ni idiomas soportados, y el modelo se presenta como una herramienta de investigación, no como un producto de inferencia de lenguaje natural.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida: puente neuronal Transformer (encoder) + runtime simbólico embebido |
| Parámetros totales | 29.248 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (incluye un GGUF v3 personalizado con arquitectura `lagrange-runtime`, no ejecutable con llama.cpp estándar) |
| Idiomas soportados | No disponible |
| Licencia | MIT (según el README; el tag de Hugging Face indica "other") |
| Formato de pesos | Safetensors, GGUF |

## Arquitectura y entrenamiento

El componente de Hugging Face contiene un tokenizer de bytes UTF-8 con 260 token IDs, un puente de embedding de 64 dimensiones, un bloque encoder compuesto por capas lineales, activaciones GELU y LayerNorm, una cabeza de proyección de 64 dimensiones y una ruta de proyección de características para entradas numéricas estructuradas. El runtime de investigación se carga bajo demanda y expone dominios como `physics`, `math`, `universal_math`, `meta_math`, `theorem`, `ml_math`, `mechanistic`, `program_synthesis`, `function_discovery` y `version_call`.

No se documenta ningún proceso de entrenamiento con datos, ni RLHF ni DPO. Los pesos del puente PyTorch están marcados como "not pretrained" y la validación de la versión se limita a compilación de código, consistencia de claves y formas de safetensors, integridad del runtime y verificación de metadatos y checksums del GGUF. No se aporta información sobre composición de datasets ni número de tokens.

## Capacidades

- Razonamiento matemático y flujos de trabajo orientados a teoremas.
- Razonamiento físico y utilidades de simulación.
- Matemáticas de aprendizaje automático, incluido el cálculo de jacobianos de softmax como en el ejemplo del README.
- Análisis de representaciones y análisis mecanicista.
- Utilidades de intervención causal.
- Inducción y búsqueda de programas, así como descubrimiento de funciones estructuradas.
- Acceso al registro de motores históricos integrado.
- No se documenta soporte de tool calling / function calling estándar; la interfaz principal es `model.research(...)`, que acepta un diccionario con dominios y acciones predefinidas.

## Casos de uso

- Experimentación en razonamiento matemático simbólico: se puede invocar `model.research()` con el dominio `math` o `theorem` para validar identidades, derivar expresiones o explorar propiedades; es adecuado porque el runtime incluye utilidades matemáticas y teoremáticas sin depender de un modelo generativo.
- Simulación física educativa: los dominios de `physics` permiten ejecutar cálculos y simulaciones sencillas, lo que resulta útil en entornos docentes o de prototipado de conceptos físicos.
- Análisis mecanicista de representaciones: las utilidades de `mechanistic` y las intervenciones causales permiten estudiar correlaciones en representaciones neuronales, siempre que se interpreten como correlaciones y no como causalidad sin evidencia intervencionista.
- Descubrimiento de funciones a partir de datos numéricos: usando `function_discovery` y `program_synthesis`, se puede inducir un programa que explique una relación entre entradas y salidas, adecuado para tareas de regresión simbólica o búsqueda de estructura.
- Derivación de matemáticas de ML: el dominio `ml_math` permite, por ejemplo, calcular el jacobiano de una operación softmax, lo que facilita la verificación de implementaciones o el estudio de propiedades de gradientes en frameworks propios.
- Investigación reproducible con componentes auditables: el repositorio incluye un validador y un GGUF con checksums, lo que permite fijar una revisión inmutable y verificar la integridad del runtime en experimentos que requieren trazabilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: el puente neuronal de 29.248 parámetros en FP32 ocupa aproximadamente 117 KB; el runtime simbólico embebido no requiere memoria de GPU significativa porque se ejecuta como código Python.
- GPU recomendadas: no se requiere GPU; el modelo puede ejecutarse en CPU.
- Cabe en consumer GPU: sí, en cualquier GPU, incluidas tarjetas antiguas o integradas.
- Opciones de despliegue: mediante `transformers` con `trust_remote_code=True` y una revisión fijada. vLLM, TGI y llama.cpp estándar no son aplicables porque no es un LLM convencional; el GGUF incluido requiere un loader acompañante o soporte personalizado en llama.cpp.
- Latencia y throughput: no disponible; no se han publicado mediciones de rendimiento.

## Comparativa con modelos similares

No se dispone de modelos comparables de la misma categoría en la información proporcionada. La combinación de un puente neuronal de 29.248 parámetros con un runtime simbólico embebido no tiene equivalentes directos en el ecosistema de modelos de lenguaje, que se centra en modelos causales preentrenados con miles de millones de parámetros.

## Limitaciones y advertencias

- El puente neuronal no es un modelo de lenguaje preentrenado: no genera texto ni responde preguntas en lenguaje natural.
- El runtime es un sistema de investigación híbrido, no un kernel de prueba formal; sus resultados no constituyen pruebas matemáticas verificadas.
- Las comprobaciones numéricas son de precisión finita y por instancias; no se pueden extrapolar a propiedades universales.
- La equivalencia de programas verificada sobre sondas finitas no implica equivalencia universal.
- Las correlaciones mecanicistas no deben interpretarse como relaciones causales sin evidencia de intervención.
- El GGUF incluido utiliza una arquitectura personalizada (`lagrange-runtime`) y no es ejecutable por llama.cpp estándar sin soporte específico.
- Se requiere `trust_remote_code=True` y revisión manual del código Python; para producción se recomienda fijar una revisión inmutable.
- Los idiomas soportados no están documentados; el tokenizer de bytes UTF-8 con 260 IDs ofrece una capacidad de representación limitada frente a tokenizadores de LLMs convencionales.
- La licencia MIT permite uso comercial, pero no se ofrecen garantías de rendimiento ni soporte para producción; es un componente de investigación.

## Enlaces

- Hugging Face: https://huggingface.co/FlaneAI/LaGrange-1.0-Flash
- Perfil del autor: https://huggingface.co/FlaneAI
- Repositorio de modelos del autor: https://huggingface.co/FlaneAI/models
