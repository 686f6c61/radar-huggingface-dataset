# khoin68/Qwen2.5-Coder-7B-VN-Master-Polymath-FINAL-GGUF

## Resumen

El modelo `khoin68/Qwen2.5-Coder-7B-VN-Master-Polymath-FINAL-GGUF` es una adaptación del popular modelo de código Qwen2.5-Coder-7B-Instruct, fine-tuneado específicamente para el idioma vietnamita y convertido a formato GGUF mediante la librería Unsloth. El autor, khoin68, ha publicado este modelo con el objetivo de ofrecer una versión optimizada para ejecución local en hardware modesto, aprovechando la cuantización GGUF para reducir los requisitos de memoria. El nombre "Master-Polymath" sugiere un entrenamiento orientado a múltiples disciplinas, aunque no se detallan los datos de fine-tuning en la model card.

El modelo conserva la arquitectura original de Qwen2.5-Coder-7B, un transformer decoder de 7.615 millones de parámetros con una ventana de contexto de 32.768 tokens. Al estar disponible únicamente en formato GGUF, su uso principal es mediante llama.cpp, Ollama u otros motores compatibles con esta cuantización. Es relevante para desarrolladores que trabajan con código en vietnamita o que necesitan un asistente de programación bilingüe (inglés/vietnamita) ejecutable en equipos de gama media.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Qwen2.5-Coder) |
| Parametros totales | 7.615.616.512 (7,6 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 32.768 tokens (heredado del modelo base) |
| Tipos de cuantizacion | Q3_K_M, Q4_K_M, Q5_K_M, Q6_K, Q8_0 (archivos GGUF) |
| Idiomas soportados | Vietnamita (fine-tune), ingles y codigo (base) |
| Licencia | No disponible en la model card (el modelo base es Apache 2.0) |
| Formato de pesos | GGUF (safetensors no incluidos en el repo) |

## Arquitectura y entrenamiento

El modelo se basa en Qwen2.5-Coder-7B-Instruct, un transformer decoder con atención causal estándar, normalización RMSNorm, activación SwiGLU y embeddings rotatorios (RoPE). La arquitectura original emplea 28 capas, 28 cabezas de atención y una dimensión oculta de 3584, con un vocabulario de 151.936 tokens. El fine-tuning realizado por khoin68 no está documentado en la model card: no se especifican los datos de entrenamiento, el número de tokens, ni si se aplicaron técnicas de RLHF o DPO. La conversión a GGUF se realizó con Unsloth, que optimiza el proceso de cuantización y reduce el tiempo de entrenamiento.

Al ser un fine-tune, se desconoce si se modificaron capas adicionales o si se utilizó LoRA. La única información disponible es que se generaron cinco archivos GGUF con diferentes niveles de cuantización, lo que permite elegir entre calidad y uso de memoria. No hay evidencia de innovaciones técnicas adicionales más allá de las del modelo base.

## Capacidades

- Generacion de texto y codigo: hereda las capacidades de Qwen2.5-Coder-7B-Instruct, incluyendo completado de codigo, generacion de funciones y explicacion de fragmentos.
- Soporte de chat multi-turno: el modelo base esta optimizado para instrucciones y conversacion, y el fine-tune vietnamita refuerza este comportamiento en ese idioma.
- Razonamiento logico y matematico: el modelo base muestra competencia en tareas de razonamiento (GSM8K, MATH) aunque no se han publicado resultados especificos para esta variante.
- Tool calling: el modelo base Qwen2.5-Coder-7B-Instruct soporta function calling, pero no se confirma que el fine-tune conserve esta capacidad.
- Multilingue limitado: principalmente vietnamita e ingles; otros idiomas no estan garantizados.
- Ejecucion local eficiente: gracias a la cuantizacion GGUF, puede ejecutarse en CPU o GPU con pocos recursos.

## Casos de uso

- Asistente de programacion en vietnamita: desarrolladores vietnamitas pueden obtener explicaciones de codigo, depuracion y sugerencias en su idioma nativo, mejorando la accesibilidad.
- Generacion de codigo en entornos offline: al ser GGUF, se puede integrar en herramientas de desarrollo locales (Neovim, VS Code) mediante llama.cpp sin conexion a internet.
- Chat tecnico bilingue: soporta conversaciones mixtas ingles-vietnamita, util para equipos internacionales que documentan en ambos idiomas.
- Educacion en programacion: estudiantes de habla vietnamita pueden practicar ejercicios de codigo y recibir retroalimentacion en su idioma.
- Automatizacion de tareas de scripting: el modelo puede generar scripts de bash, Python o SQL a partir de instrucciones en vietnamita, agilizando tareas administrativas.
- Prototipado rapido en entornos con recursos limitados: con cuantizacion Q4_K_M, cabe en una GPU de 6-8 GB, permitiendo experimentacion local sin servidores costosos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks especificos para este fine-tune en la informacion disponible. El modelo base Qwen2.5-Coder-7B-Instruct reporta en su pagina oficial resultados como 71,1 en HumanEval y 62,9 en MBPP, pero no se puede confirmar que el fine-tune vietnamita mantenga o mejore estas cifras. Se recomienda evaluar el modelo en el caso de uso concreto antes de desplegarlo en produccion.

## Requisitos de hardware

- VRAM estimada: con Q4_K_M (~4,4 GB) cabe en GPUs con 6 GB; con Q8_0 (~7,8 GB) requiere al menos 10 GB. Para CPU, se necesitan 8-16 GB de RAM segun la cuantizacion.
- GPUs recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, o superiores para Q8_0. Para Q4_K_M basta una GTX 1660 Super 6 GB o una Apple Silicon con 8 GB unificados.
- Ejecucion en CPU: viable con llama.cpp en procesadores modernos, con velocidades de 5-10 tokens/s en Q4_K_M.
- Opciones de despliegue: llama.cpp, Ollama (incluye Modelfile), LM Studio, kobold.cpp, y servidores compatibles con la API de OpenAI via llama.cpp.
- Latencia: en GPU de gama media (RTX 3060), se esperan 20-40 tokens/s con Q4_K_M; en CPU, 5-15 tokens/s.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen2.5-Coder-7B-Instruct (base) | 7,6 B | 32K | Ingles, codigo | Apache 2.0 | Safetensors, GGUF |
| khoin68/Qwen2.5-Coder-7B-VN-Master-Polymath-FINAL-GGUF | 7,6 B | 32K | Vietnamita, ingles | No disponible | GGUF |
| CodeLlama-7B-Instruct | 7 B | 16K | Ingles, codigo | Llama 2 license | Safetensors, GGUF |
| DeepSeek-Coder-6.7B-Instruct | 6,7 B | 16K | Ingles, chino, codigo | DeepSeek license | Safetensors, GGUF |

La principal diferencia es el enfoque en vietnamita, que no ofrecen las alternativas. El contexto de 32K es superior al de CodeLlama y DeepSeek-Coder. La licencia del fine-tune es incierta, lo que puede limitar su uso comercial.

## Limitaciones y advertencias

- No se ha documentado el proceso de fine-tuning, por lo que se desconoce la calidad del ajuste en vietnamita y su posible sesgo.
- La licencia no esta especificada en la model card; aunque el modelo base es Apache 2.0, el trabajo derivado podria tener restricciones adicionales.
- Riesgo de alucinacion en codigo: como cualquier LLM, puede generar codigo incorrecto o inseguro; se recomienda revision humana.
- El soporte de tool calling no esta confirmado en esta variante; si se necesita, conviene probar explicitamente.
- La cuantizacion GGUF puede degradar ligeramente la calidad respecto al modelo en precision completa, especialmente en Q3_K_M.
- No se han publicado evaluaciones de seguridad ni de sesgos para este fine-tune.
- El contexto de 32K es nominal; en la practica, con cuantizaciones bajas, la calidad puede degradarse con contextos muy largos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/khoin68/Qwen2.5-Coder-7B-VN-Master-Polymath-FINAL-GGUF
- Repositorio relacionado (variante sin FINAL): https://huggingface.co/khoin68/Qwen2.5-Coder-7B-Vietnamese-GGUF
- Modelo base Qwen2.5-Coder-7B-Instruct: https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct
- Repositorio oficial de Qwen2.5-Coder: https://github.com/huggingface/Qwen2.5-Coder
- Unsloth (herramienta de conversion): https://github.com/unslothai/unsloth
