# Ekmek31/trenet-v1.3d

## Resumen

trenet v1.3d es un modelo de lenguaje experimental de tipo decoder-only Transformer con 17,7 millones de parámetros, desarrollado por el usuario Ekmek31 y entrenado desde cero para turco. No es un ajuste fino ni una destilación de un modelo mayor: el autor lo presenta como un ejercicio de investigación sobre cuánto puede lograr un modelo de este tamaño en conversación cotidiana en turco, entrenado en un entorno doméstico con una sola tarjeta gráfica. El modelo se publica bajo licencia MIT y está orientado exclusivamente al turco (`tr`).

La arquitectura incorpora varias decisiones poco habituales en modelos de esta escala: atención en espacio latente (compresión de claves y valores), un cuerpo profundo y estrecho de 12 capas, predicción multi-token durante el entrenamiento, RoPE, normalización de consultas y claves, RMSNorm y SwiGLU. El vocabulario es de 8192 piezas BPE a nivel de byte y la ventana de contexto es de 2048 tokens. El entrenamiento total ronda los 2000 millones de tokens, divididos en una fase de preentrenamiento de 1880 millones y un ajuste conversacional de 100 millones.

El modelo no compite con LLM de gran escala: su propio autor lo etiqueta como experimental y advierte explícitamente de que no debe usarse como fuente de información ni en tareas serias. Su interés es principalmente didáctico y de investigación: demuestra qué componentes arquitectónicos y qué presupuesto de datos permiten obtener un chat funcional en turco con menos de 20 millones de parámetros y un peso de aproximadamente 70 MB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con atención en espacio latente (latent attention), 12 capas, cuerpo estrecho |
| Parametros totales | 17.676.432 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | No disponible (solo se publican pesos safetensors; no se documentan variantes GGUF ni cuantizaciones oficiales) |
| Idiomas soportados | Turco (`tr`) |
| Licencia | MIT |
| Formato de pesos | safetensors (`model.safetensors`, ~70 MB) |

## Arquitectura y entrenamiento

trenet v1.3d es un Transformer decoder-only diseñado específicamente para escala pequeña, no una copia reducida de un modelo existente. La innovación principal es la atención en espacio latente: las claves y los valores se comprimen en una representación latente de baja dimensión, lo que permite alojar más capas con el mismo presupuesto de parámetros y reduce el uso de memoria en inferencia. El autor probó distintas formas con el mismo número de parámetros y concluyó que una estructura de 12 capas estrechas supera a variantes más anchas y menos profundas. Se emplean además RoPE para codificación posicional, normalización de consultas y claves (QK-norm), RMSNorm y activaciones SwiGLU. Los dígitos se tokenizan individualmente para mantener consistencia aritmética.

El entrenamiento se realizó en dos fases sobre un total aproximado de 2000 millones de tokens. La primera, de preentrenamiento, cubrió 1880 millones de tokens de texto general en turco con una mezcla de enciclopedia, web, narrativa, diálogo y matemáticas. La segunda, de ajuste conversacional, añadió 100 millones de tokens de conversaciones cotidianas, pares pregunta-respuesta y operaciones aritméticas básicas. La optimización combinó Muon para los pesos matriciales y AdamW para el resto, con precisión mixta bf16, y se ejecutó en una sola GPU durante unas pocas horas. El dataset de entrenamiento no se publica. Durante el entrenamiento el modelo predice no solo el siguiente token sino también el posterior, lo que añade una señal de aprendizaje extra.

## Capacidades

- Generación de texto conversacional breve en turco: saludos, preguntas sobre el estado personal y respuestas de cortesía.
- Memoria dentro de la conversación de datos mencionados por el usuario, como nombres o ciudades.
- Operaciones aritméticas básicas de suma, resta, multiplicación y división, con tokenización dígito a dígito para mayor consistencia.
- Conversación multi-turno dentro de la ventana de 2048 tokens, con pérdida de hilo en diálogos largos.
- No dispone de tool calling ni function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso.
- No soporta visión, audio ni modo de razonamiento explícito (thinking mode).
- Capacidad multilingüe limitada al turco; no se documenta rendimiento en otros idiomas.
- El script de chat incluye un verificador aritmético externo que puede desactivarse con `--no-calculator` para observar la respuesta nativa del modelo.

## Casos de uso

- Prototipado de interfaces conversacionales en turco: sirve como banco de pruebas para validar pipelines de chat (tokenizador, plantilla de diálogo, gestión de historial) antes de migrar a un modelo mayor, gracias a su peso de 70 MB y a que funciona en CPU.
- Demostración educativa de arquitecturas Transformer: el código y la configuración publicados permiten estudiar atención en espacio latente, QK-norm y predicción multi-token en un modelo que se entrena en horas en una sola GPU.
- Investigación sobre eficiencia en modelos pequeños: punto de partida para experimentos de escalado controlado comparando 12 capas estrechas frente a configuraciones más anchas con el mismo presupuesto de parámetros.
- Asistente de conversación trivial offline: respuestas de cortesía y mantenimiento de contexto inmediato en aplicaciones locales sin conexión, donde el coste computacional y el tamaño del binario son la restricción principal.
- Prácticas de aritmética elemental con verificación externa: el script `chat.py` combina el modelo con un calculador, útil como ejemplo de patrón híbrido modelo-herramienta en el que el LLM gestiona el lenguaje y la herramienta garantiza la exactitud numérica.
- Evaluación de tokenizadores turcos: el vocabulario BPE de 8192 piezas a nivel de byte puede analizarse como caso de estudio de compresión de vocabulario para una lengua aglutinante como el turco.
- Base para ajuste fino experimental: al ser MIT y pesar 70 MB, es viable reentrenarlo o ajustarlo en un portátil para estudiar dinámicas de sobreajuste y olvido catastrófico en corpus pequeños.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (pesos de ~70 MB más estados de activación y caché KV para 2048 tokens); en la práctica cabe en cualquier GPU con más de 1 GB.
- GPU recomendadas: cualquier GPU consumer moderna (GTX 1060, RTX 3060, RTX 4090) es más que suficiente; el modelo fue entrenado en una sola tarjeta gráfica doméstica.
- Cabe en GPU consumer: sí, en todas las gamas actuales, y también en CPU mediante `--device cpu`.
- Opciones de despliegue: el repositorio proporciona `chat.py` y el paquete `trenet/` con PyTorch, tokenizers y safetensors como dependencias. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y no se publican pesos en GGUF.
- Latencia y throughput: no disponibles de forma medida; por el tamaño del modelo (17,7 M de parámetros) se espera una latencia de milisegundos por token tanto en GPU como en CPU, aunque no se aportan cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| trenet v1.3d | 17,7 M | 2048 | Turco | MIT | safetensors | Experimental, entrenado desde cero, sin benchmarks publicados |
| Modelos tipo GPT-2 small | ~124 M | 1024 | Inglés principalmente | MIT | safetensors, GGUF | Referencia clásica de modelo pequeño; no disponible comparación directa en turco |
| Modelos tipo TinyLlama | ~1100 M | 2048 | Multilingüe | Apache 2.0 | safetensors, GGUF | Un orden de magnitud mayor en parámetros; no disponible comparación en turco a esta escala |

No se dispone de benchmarks ni de modelos comparables de 17 millones de parámetros específicos para turco en la información proporcionada, por lo que la comparación cuantitativa de rendimiento no está disponible.

## Limitaciones y advertencias

- El autor advierte explícitamente de que el modelo no es una fuente de información fiable y de que inventa respuestas plausibles pero incorrectas en temas que desconoce.
- No es adecuado para redacción larga, traducción, generación de código ni tareas que requieran razonamiento; estas capacidades quedan fuera del alcance de su tamaño.
- Ante varias preguntas en un mismo turno, suele responder solo a una.
- Pierde el hilo de la conversación en diálogos largos, incluso dentro de la ventana de 2048 tokens.
- Entrenado únicamente en turco: no se documenta comportamiento en castellano ni en otros idiomas, y se espera un rendimiento muy degradado fuera del turco.
- No se han publicado evaluaciones de sesgo, toxicidad ni alucinación; al ser un modelo entrenado sobre datos web sin filtros documentados, existe riesgo de reproducir sesgos presentes en el corpus.
- La licencia MIT permite uso comercial, modificación y redistribución conservando el aviso de copyright, pero el estado experimental y la ausencia de garantías desaconsejan su uso en producción para tareas críticas.
- El dataset de entrenamiento no se publica, lo que dificulta la auditoría de datos y la reproducibilidad completa.
- No se ofrecen pesos cuantizados ni integración con runtimes de inferencia estándar, lo que limita su despliegue fuera del script proporcionado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Ekmek31/trenet-v1.3d
- No se han encontrado en la búsqueda web papers, blogs, repositorios adicionales ni demos asociados al modelo.
