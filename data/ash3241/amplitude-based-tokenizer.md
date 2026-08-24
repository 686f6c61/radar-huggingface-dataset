# ash3241/Amplitude-based-tokenizer

## Resumen

El modelo **ash3241/Amplitude-based-tokenizer** es una prueba de concepto experimental que implementa la arquitectura **Continuous Amplitude Tokenization (CAT)**, desarrollada por el autor ash3241. Esta arquitectura propone una alternativa a la tokenización BPE discreta tradicional, dividiendo el lenguaje en dos flujos: un **ID de concepto** discreto (p. ej., "malo", "grande") y una **amplitud continua** (p. ej., `1.0`, `4.0`). De este modo, frases como "la comida estaba increíblemente mala" se codifican como un único token compuesto `[Concepto: "malo", Amplitud: 4.0]`, eliminando la necesidad de tokens combinatorios y reduciendo la longitud de las secuencias.

El modelo es un transformer causal de doble flujo con componentes personalizados: embeddings Fourier-FiLM, AP-RMSNorm, atención bilinear de 4 vías y Spatio-Amplitude RoPE. Tiene aproximadamente 4,6 millones de parámetros y un vocabulario de 15 000 palabras, entrenado sobre 15 millones de tokens del dataset Yelp Polarity Reviews durante 1 000 iteraciones. Es un "modelo de juguete" (toy model) diseñado exclusivamente para validar la viabilidad matemática de estas técnicas, no para uso en producción.

La relevancia de este modelo radica en su propuesta de tokenización continua, que podría reducir el consumo de memoria de la caché KV en un 20 % y ofrecer control de intensidad en generación de texto. Sin embargo, al ser un experimento temprano, su utilidad práctica es limitada y requiere código personalizado para cargar los pesos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal de doble flujo (CAT) |
| Parametros totales | 4 637 760 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (config `max_position_embeddings=64` en ejemplo, pero no se especifica oficialmente) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (según tags) y `.pt` (según model card) |

## Arquitectura y entrenamiento

La arquitectura CAT se compone de dos flujos paralelos: uno discreto que maneja los conceptos (IDs de vocabulario) y otro continuo que representa la amplitud. El modelo emplea **Fourier-FiLM embeddings** para inyectar información de amplitud en las representaciones, **AP-RMSNorm** como normalización adaptativa, **atención bilinear de 4 vías** para modelar interacciones complejas entre conceptos y amplitudes, y **Spatio-Amplitude RoPE** para codificar posiciones y amplitudes relativas.

El entrenamiento se realizó sobre 15 millones de tokens del dataset de reseñas Yelp Polarity, con un vocabulario de 15 000 palabras del que se eliminaron los modificadores (adjetivos de intensidad) y se reemplazaron por escalares continuos. Se ejecutaron 1 000 iteraciones como prueba de viabilidad temprana. No se menciona el uso de RLHF ni DPO; el entrenamiento parece ser de generación de lenguaje estándar con causalidad.

## Capacidades

- **Tokenización con control de intensidad**: permite inyectar manualmente un valor de amplitud (p. ej., `Amplitude: 10.0`) durante la generación para forzar una escala de intensidad sin cambiar el concepto.
- **Compresión de secuencias**: al fusionar modificadores en amplitudes, reduce la longitud de las secuencias, lo que se traduce en un ahorro de memoria de KV cache del 20 % según las pruebas del autor.
- **Reducción de vocabulario**: elimina los tokens de modificadores del diccionario, logrando una compresión de vocabulario.
- **Generación de texto causal**: como transformer causal, puede generar texto condicionado a una secuencia de conceptos y amplitudes.
- **Procesamiento de lenguaje natural básico**: al estar entrenado en reseñas de Yelp, puede manejar texto en inglés relacionado con opiniones y valoraciones.
- **Soporte de tool calling / agentes**: no disponible.
- **Capacidades multilingües**: no, solo inglés.

## Casos de uso

- **Investigación en tokenización**: sirve como banco de pruebas para estudiar cómo la tokenización continua afecta a la memoria del contexto y a la compresión de vocabulario en comparación con BPE.
- **Validación de arquitecturas alternativas**: permite experimentar con Fourier-FiLM embeddings y AP-RMSNorm en un entorno de bajo coste computacional (4,6 M de parámetros).
- **Control de intensidad en generación**: se puede utilizar para forzar que el modelo genere respuestas con una intensidad concreta (p. ej., reseñas muy positivas o muy negativas) inyectando amplitudes altas o bajas.
- **Estudio de la relación entre conceptos y escalares**: útil para analizar cómo el modelo aprende a asociar valores continuos con adjetivos de intensidad.
- **Comparación con modelos BPE**: se puede contrastar el rendimiento de este modelo con un NanoGPT entrenado en el mismo dataset para medir el ahorro de memoria y la calidad de generación.
- **Prototipado de sistemas de control de estilo**: aunque no es apto para producción, puede servir como base para futuros desarrollos que integren control de estilo en generación de texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona dos beneficios empíricos obtenidos al comparar con un NanoGPT estándar:

- **20 % de ahorro de memoria KV cache**.
- **Compresión de vocabulario** (eliminación de modificadores).

No se proporcionan métricas como perplexidad, MMLU, HumanEval u otros. Estos datos son los únicos indicadores de rendimiento disponibles.

## Requisitos de hardware

- **VRAM estimada**: al tener solo 4,6 millones de parámetros, la VRAM necesaria es mínima, inferior a 1 GB en FP32 (aproximadamente 18 MB por parámetro en FP32, ~18 MB). Con cuantizaciones (no disponibles) sería aún menor.
- **GPU recomendadas**: cualquier GPU moderna, incluso una integrada, es suficiente. Una RTX 3060 o superior sería más que suficiente para ejecutar el modelo.
- **¿Cabe en consumer GPU?**: sí, cabe en cualquier GPU de consumo, incluso en CPU.
- **Opciones de despliegue**: requiere el código personalizado del repositorio de GitHub (no es compatible con vLLM, llama.cpp u Ollama directamente). Se puede ejecutar con PyTorch estándar.
- **Latencia y throughput**: no se proporcionan datos, pero al ser un modelo tan pequeño, la latencia sería del orden de milisegundos en una GPU moderna.

## Comparativa con modelos similares

No hay modelos comparables disponibles en la información proporcionada. No se conocen otras arquitecturas de tokenización de amplitud continua publicadas en el repositorio. Se podría comparar con tokenizadores BPE tradicionales, pero no se dispone de datos de rendimiento para una comparación cuantitativa. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- **Modelo experimental**: no está diseñado para producción ni para tareas reales de generación de chat; es solo una prueba de viabilidad.
- **Datos de entrenamiento limitados**: solo 15 millones de tokens y 1 000 iteraciones, lo que implica que el modelo no ha aprendido representaciones profundas.
- **Sesgos potenciales**: el dataset Yelp Polarity Reviews puede contener sesgos de opinión o lenguaje coloquial que se reflejan en el modelo.
- **Riesgo de alucinación**: al ser un modelo pequeño, es probable que genere texto incoherente o inventado, especialmente fuera del dominio de reseñas.
- **Idioma limitado**: solo inglés, sin soporte multilingüe.
- **Restricciones de uso**: requiere el código específico del repositorio de GitHub; los pesos no son directamente utilizables con bibliotecas estándar.
- **Sin cuantizaciones**: no se han publicado versiones cuantizadas, lo que dificulta su despliegue en entornos con restricciones de memoria.
- **Licencia**: aunque es MIT, al ser un modelo de juguete, su utilidad práctica en producción es nula.

## Enlaces

- [Repositorio de HuggingFace](https://huggingface.co/ash3241/Amplitude-based-tokenizer)
- [Repositorio de GitHub del modelo](https://github.com/Yash943/CAT-Concept-Amplitude-Tokenization-)
