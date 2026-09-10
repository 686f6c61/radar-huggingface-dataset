# AhiskaAI/AhiskaAI-v0.4-235M-IT

## Resumen

AhıskaAI v0.4 235M IT es un modelo de lenguaje pequeño (SLM) de 235 millones de parámetros desarrollado por AhiskaAI, un proyecto de investigación independiente de código abierto centrado en modelos de lenguaje pequeños, tokenización personalizada y experimentos reproducibles de IA con pocos recursos. Esta versión es la variante instruccionada (IT) del modelo base AhıskaAI v0.4 235M, el más grande de la serie v0.4.

El modelo emplea la arquitectura LlamaForCausalLM, pero fue entrenado completamente desde cero, no inicializado desde pesos de Llama existentes. Su ventana de contexto es de 2048 tokens y utiliza un tokenizador BPE personalizado de 24.000 entradas diseñado para turco y turco ahıska.

Su relevancia radica en que demuestra que es posible entrenar modelos pequeños con datos limitados (se preentrenó sobre 1.700 millones de tokens de FineWeb-2 HQ Turkish durante una época) y afinarlos posteriormente para seguir instrucciones en turco. Está pensado para experimentos de investigación, tareas de bajo coste computacional y escenarios de respuesta en turco.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLM |
| Parámetros totales | 234.333.184 (≈235 millones) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantización | No disponible (pesos nativos en bfloat16) |
| Idiomas soportados | Turco (tr) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

Arquitectura basada en LlamaForCausalLM con capas ocultas de tamaño 1024, 20 capas, 16 cabezas de atención, 4 cabezas de clave/valor, tamaño intermedio de 2560 y dimensión de cabeza de 64. Usa activación SiLU, codificación posicional RoPE (theta 10.000), embeddings atados, sin bias en atención ni en MLP y dropout de atención nulo. Los pesos están en bfloat16.

El preentrenamiento del modelo base se realizó desde cero sobre el dataset FineWeb-2 HQ Turkish, con una sola época sobre aproximadamente 1.700 millones de tokens, la mitad de las pasadas usadas en modelos más pequeños de la serie v0.4. No se inicializó desde ningún modelo preentrenado existente.

Posteriormente se aplicó una etapa de ajuste por instrucciones (SFT) usando la misma mezcla de datos compartida en las variantes "New" de la serie, que combina datos SFT propios de AhiskaAI con una parte del dataset Ethosoft/nedo-turkish-sft-mixtures. El entrenamiento se ejecutó en hardware Kaggle TPU v5e-8 durante unas 5 horas y 4 minutos, con tamaño de lote de 8 por dispositivo y 2 pasos de acumulación de gradientes. El formato de conversación empleado es ChatML, con roles system, user y assistant.

## Capacidades

- Generación de texto en turco.
- Respuesta a preguntas en turco.
- Seguimiento de instrucciones sencillas.
- Transformación de texto turco (reescritura, reformateo, mejora de legibilidad).
- Mantenimiento de conversaciones simples con formato ChatML.
- Investigación y experimentación con modelos de lenguaje pequeños.
- Entrenamiento para lenguas de pocos recursos (turco y turco ahıska).

No se documenta soporte de tool calling, agentes, capacidades de visión, audio ni razonamiento extendido (thinking mode).

## Casos de uso

1. Asistente de atención al cliente en turco para consultas básicas: su tamaño reducido permite desplegarlo en entornos con recursos limitados y su formato ChatML facilita integrar historial de conversación en aplicaciones web o de mensajería simple.
2. Reescritura y corrección de textos turcos: puede reformular oraciones, mejorar la claridad o adaptar el registro a partir de las instrucciones que reciba, útil en herramientas de edición o corrección.
3. Generación de contenido corto en turco para redes sociales: capaz de producir textos breves sobre temas sencillos, adecuado para borradores de publicaciones o comentarios automáticos.
4. Tutor de idioma turco para principiantes: puede responder preguntas básicas sobre vocabulario, gramática o frases útiles, sirviendo como práctica conversacional controlada.
5. Investigación académica sobre modelos de lenguaje pequeños: su entrenamiento desde cero sobre un dataset turco permite estudiar el efecto de la cantidad de tokens, el tokenizador personalizado o las técnicas de ajuste por instrucciones en lenguas de pocos recursos.
6. Preprocesamiento de texto turco en pipelines de NLP: al ser un causal LM, puede normalizar textos, extraer respuestas o transformar entradas para alimentar otros sistemas, aunque sin garantizar exactitud factual.
7. Prototipos de instructores turcos para aplicaciones educativas: el sistema puede ser moldeado con prompts de sistema para ofrecer explicaciones simples y consistentes a estudiantes de niveles bajos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en bfloat16, los pesos ocupan aproximadamente 0,47 GB; en float32, unos 0,94 GB. Con overhead de KV-cache y activaciones, se puede ejecutar en GPU con menos de 2 GB de VRAM o directamente en CPU.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 30xx o superior), también integradas en portátiles, dada la baja demanda. No requiere aceleradores profesionales como A100 o H100.
- Cabe en GPU de consumo: sí, en cualquier GPU con al menos 1 GB de memoria.
- Opciones de despliegue: mediante la librería transformers en Python para inferencia local. Los metadatos de HuggingFace indican compatibilidad con text-generation-inference (TGI) y endpoints. La conversión a GGUF para llama.cpp u Ollama no está documentada, por lo que su uso en esas plataformas requeriría convertir manualmente el checkpoint.
- Latencia y throughput: no disponible, aunque por el tamaño (235M) la generación es rápida incluso en CPU.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables dentro de la misma categoría (SLM turcos de ~235M). No se han proporcionado datos de benchmarks ni referencias a modelos equivalentes que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Contexto limitado: 2048 tokens, menor que la mayoría de modelos actuales, lo que impide manejar conversaciones largas o documentos extensos.
- Idioma: solo turco, sin soporte multilingüe documentado.
- Tamaño reducido: con 235M de parámetros y un preentrenamiento de 1,7B de tokens, es probable que presente errores factuales, alucinaciones y dificultad para tareas complejas.
- Datos de entrenamiento: se entrenó sobre un único dataset turco (FineWeb-2 HQ Turkish) y una mezcla de SFT limitada, por lo que puede heredar sesgos presentes en esos corpus.
- Uso experimental: el proyecto declara que el modelo está pensado para experimentación e investigación, no para aplicaciones de producción críticas.
- Licencia Apache-2.0 permite uso comercial, pero la ausencia de garantías de rendimiento implica que cualquier implementación productiva debe someterse a validación propia.

## Enlaces

- HuggingFace: https://huggingface.co/AhiskaAI/AhiskaAI-v0.4-235M-IT
- Dataset de SFT: https://huggingface.co/datasets/Ethosoft/nedo-turkish-sft-mixtures
