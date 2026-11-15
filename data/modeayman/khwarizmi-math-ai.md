# ModeAyman/Khwarizmi-Math-AI

## Resumen

Al-Khwarizmi Math AI es un adaptador LoRA (PEFT) entrenado sobre el modelo base Qwen/Qwen2.5-Math-1.5B-Instruct, desarrollado por Ayman Al-Dhahabi (usuario ModeAyman) con el objetivo de ofrecer razonamiento matemático y explicación pedagógica paso a paso en árabe. El modelo se presenta como un razonador neuro-simbólico: la red neuronal descompone el problema y genera cadenas de pensamiento en etiquetas `<think>`, mientras que un motor simbólico externo basado en SymPy verifica cada paso aritmético para reducir la alucinación numérica.

El entrenamiento combina QLoRA (cuantización 4-bit NormalFloat con cómputo en bfloat16) y aprendizaje por refuerzo con GRPO y supervisión de proceso, organizado en un currículo de cuatro fases que abarca desde aritmética básica y ecuaciones lineales hasta cálculo diferencial e integral. Está orientado a un uso educativo en árabe, con soporte secundario de inglés, y se distribuye con licencia MIT.

Con 1.500 millones de parámetros en el modelo base, es un adaptador ligero pensado para despliegue en hardware modesto. No obstante, la información publicada es escasa: no hay datos de benchmarks, no se detalla el volumen del dataset de entrenamiento y el repositorio aparece con 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5-Math-1.5B-Instruct) con adaptador LoRA; flujo neuro-simbólico con verificación SymPy externa |
| Parametros totales | 1.500 millones (modelo base); el adaptador LoRA añade un número no especificado de parámetros |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (heredada del modelo base Qwen2.5-Math-1.5B-Instruct; no confirmada) |
| Tipos de cuantizacion | Entrenamiento en QLoRA 4-bit NormalFloat con cómputo bfloat16; no se documentan formatos de cuantización para inferencia |
| Idiomas soportados | Árabe (ar) e inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere el modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA sobre el transformer decoder-only Qwen2.5-Math-1.5B-Instruct. El adaptador se entrena con QLoRA: cuantización 4-bit NormalFloat del modelo base con cómputo en bfloat16, rango de matriz r=16, alpha=32 y dropout de 0,05, aplicado sobre los módulos `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`. La propuesta neuro-simbólica consiste en que la red genera el razonamiento y la explicación en árabe, mientras que un motor SymPy externo valida los cálculos; esta verificación no está integrada en los pesos, sino que depende de un componente de orquestación externo.

El entrenamiento sigue un currículo de cuatro fases: (1) operaciones aritméticas, prioridad de operaciones, simplificación de fracciones y ecuaciones lineales; (2) ecuaciones cuadráticas, discriminante y factorización; (3) funciones exponenciales y logarítmicas; (4) derivación y cálculo integral. Sobre esta base se aplica GRPO (Group Relative Policy Optimization) con supervisión de proceso sobre los pasos de solución. No se especifica el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo fases adicionales de alineación.

## Capacidades

- Generación de razonamiento matemático paso a paso en árabe, con cadenas de pensamiento delimitadas por etiquetas `<think>`.
- Resolución de aritmética con prioridad de operaciones, fracciones y ecuaciones lineales y cuadráticas.
- Trabajo con funciones exponenciales, logarítmicas, derivadas e integrales según el currículo declarado.
- Explicación pedagógica orientada a uso educativo, no solo entrega del resultado.
- Verificación simbólica de cálculos mediante integración externa con SymPy (requiere orquestación propia; no es una capacidad nativa de los pesos).
- Conversación multi-turno mediante plantilla de chat (`apply_chat_template`) heredada del modelo base.
- Soporte de árabe e inglés; el foco principal es el árabe.
- No se documenta soporte de tool calling, function calling, visión, audio ni modo de agente autónomo.

## Casos de uso

- Tutoría matemática en árabe: el modelo genera explicaciones paso a paso de ejercicios de secundaria y bachillerato, adecuado por su entrenamiento curricular en aritmética, álgebra y cálculo introductorio.
- Generación de solucionarios educativos: producción de resoluciones comentadas para bancos de ejercicios, con la verificación SymPy como paso de control de calidad en el pipeline.
- Asistencia en plataformas de aprendizaje adaptativo: integración como backend de un chatbot que responde dudas de álgebra y cálculo en árabe estándar moderno.
- Validación de expresiones simbólicas: uso combinado con SymPy para comprobar derivadas e integrales en herramientas de corrección automática de exámenes.
- Prototipado de investigación en razonamiento neuro-simbólico: el adaptador sirve como base reproducible para experimentar con verificación simbólica de cadenas de pensamiento en modelos pequeños.
- Despliegue en entornos con recursos limitados: al partir de un modelo de 1.500 millones de parámetros, puede ejecutarse en una GPU de consumo para demos educativas o pruebas internas.
- Localización de contenido matemático: generación de material didáctico bilingüe árabe-inglés a partir de enunciados en uno de los dos idiomas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en bfloat16, el modelo base de 1.500 millones de parámetros requiere aproximadamente 3-4 GB de pesos, más overhead de activaciones y KV cache; en cuantización 4-bit puede situarse en torno a 1-2 GB, aunque el autor no documenta formatos GGUF ni cuantizaciones de inferencia.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para bfloat16 con comodidad (RTX 3060, RTX 4060, RTX 4090, A100, H100). En GPUs de 4-6 GB sería necesario cuantizar.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060/4060 y superiores; no confirmado por el autor.
- Opciones de despliegue: la model card solo documenta Transformers + PEFT. No se mencionan vLLM, llama.cpp, Ollama ni TGI, y al ser un adaptador LoRA requeriría fusión previa con el modelo base para muchos de esos runtimes.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Al-Khwarizmi Math AI (este) | 1.5B (base) + LoRA | no disponible | Razonamiento matemático en árabe con verificación SymPy | MIT | Hugging Face (adaptador PEFT) |
| Qwen2.5-Math-1.5B-Instruct | 1.5B | no disponible en esta ficha | Razonamiento matemático general, multilingüe | no disponible en esta ficha | Hugging Face |
| Qwen2.5-Math-7B-Instruct | 7B | no disponible en esta ficha | Razonamiento matemático general, mayor capacidad | no disponible en esta ficha | Hugging Face |

La comparación cuantitativa de rendimiento no está disponible: el autor no publica benchmarks frente al modelo base ni frente a alternativas.

## Limitaciones y advertencias

- No se han publicado benchmarks que respalden las capacidades declaradas; el rendimiento real es desconocido.
- La verificación con SymPy es un componente externo, no una capacidad integrada en los pesos: sin orquestación adicional, el modelo puede alucinar cálculos como cualquier LLM.
- El entrenamiento se centra en matemáticas de nivel curricular (aritmética a cálculo introductorio); el rendimiento fuera de ese dominio es incierto.
- El foco es el árabe; el soporte de inglés es secundario y no está cuantificado.
- El repositorio muestra 0 descargas y 0 likes, lo que indica ausencia de validación por parte de la comunidad.
- No se documenta el tamaño ni la procedencia del dataset de entrenamiento, lo que dificulta evaluar sesgos y cobertura.
- La licencia MIT permite uso comercial, pero el modelo base Qwen2.5-Math-1.5B-Instruct tiene sus propias condiciones que deben verificarse por separado.
- Al ser un adaptador LoRA, requiere cargar el modelo base; no es un artefacto autónomo listo para servir sin pasos adicionales.
- No hay información sobre context length efectivo tras el ajuste ni sobre degradación en contextos largos.

## Enlaces

- Hugging Face: https://huggingface.co/ModeAyman/Khwarizmi-Math-AI
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Math-1.5B-Instruct
- Repositorio GitHub: https://github.com/AymnAlth/Khwarizmi_Math_AI
- Perfil del desarrollador en GitHub: https://github.com/AymnAlth
- Contacto del autor: a77499n@gmail.com
