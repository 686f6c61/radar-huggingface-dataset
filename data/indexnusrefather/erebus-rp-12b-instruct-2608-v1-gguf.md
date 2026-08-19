# Indexnusrefather/Erebus-RP-12B-Instruct-2608-v1-GGUF

## Resumen

Erebus-RP-12B-Instruct-2608-v1 es un finetune experimental del modelo Gemma 3 12B Instruct, desarrollado por Indexnusrefather, orientado a mejorar el roleplay y la escritura creativa en modelos de tamaño medio. El autor ha utilizado un dataset especializado de conversaciones largas y de alta calidad, filtrado para mantener turnos de asistente coherentes y con una reducción deliberada de rechazos, lo que permite un comportamiento más libre y fluido en escenarios narrativos. La versión actual se distribuye en formato GGUF, lo que facilita su ejecución en hardware local mediante herramientas como llama.cpp u Ollama.

El modelo se basa en la arquitectura transformer de Gemma 3, con aproximadamente 11,77 mil millones de parámetros y una ventana de contexto de 128K tokens (heredada del modelo base). Su relevancia radica en ofrecer una alternativa de roleplay de alta calidad que puede ejecutarse en GPUs de consumo, sin necesidad de servidores dedicados. El autor indica que este finetune prioriza la creatividad y la coherencia narrativa, mientras que otra variante (Nyx) está más orientada a la inteligencia y el seguimiento de instrucciones.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 3 12B) |
| Parametros totales | 11.766.034.176 (~11,77B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128K tokens (heredado de Gemma 3, según llm-explorer) |
| Tipos de cuantizacion | BF16, Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q3_K_M |
| Idiomas soportados | inglés (en) |
| Licencia | Gemma |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo parte de google/gemma-3-12b-it, un transformer decoder-only con atención multi-consulta y ventana de contexto de 128K tokens. El finetune se realizó sobre un dataset de registros de chat de alta calidad, seleccionados específicamente por contener conversaciones largas con turnos de asistente bien formados. El autor controló manualmente el proceso para evitar el "sobrecocinado" del estilo de escritura, ajustando iterativamente la configuración hasta obtener el equilibrio deseado. Además, el dataset incluye registros explícitos que reducen la tendencia del modelo a rechazar solicitudes, algo relevante para casos de roleplay adulto.

No se especifican detalles sobre el número de tokens de entrenamiento, el método de optimización (p. ej., LoRA o full fine-tune) ni si se empleó RLHF o DPO. El autor menciona que eligió Gemma 3 en lugar de Gemma 4 por la mayor facilidad de trabajo y por considerar que Gemma 4 está más "reforzada" (RLed), lo que limitaría la creatividad.

## Capacidades

- Generación de texto narrativo y descriptivo de alta calidad, con mensajes más largos y mejor seguimiento de la trama.
- Roleplay interactivo con personajes y mundos detallados, manteniendo coherencia a lo largo de conversaciones extensas.
- Escritura creativa: cuentos, novelas, guiones y otros formatos literarios.
- Seguimiento de instrucciones básicas, aunque el autor indica que la variante Nyx (no publicada en este repo) es superior en ese aspecto.
- Ventana de contexto de 128K tokens, adecuada para mantener historias largas y múltiples hilos narrativos.
- Soporte de contenido explícito (ERP) gracias a la reducción de rechazos en el entrenamiento.
- No se menciona soporte para tool calling, agentes, visión ni audio.

## Casos de uso

- Roleplay interactivo en plataformas como KoboldAI o SillyTavern: el modelo puede gestionar conversaciones multi-turno con contexto largo, manteniendo la personalidad de los personajes y la coherencia de la historia gracias a su ventana de 128K tokens.
- Escritura de ficción asistida: generación de borradores de novelas, relatos cortos o fanfiction, con estilo descriptivo y capacidad para expandir tramas complejas.
- Juegos de texto y aventuras conversacionales: el modelo actúa como narrador y director de juego, respondiendo a las acciones del usuario y manteniendo un mundo consistente.
- Creación de diálogos para guiones o videojuegos: puede generar intercambios naturales entre personajes, adaptándose a distintos tonos y registros.
- Simulación de personajes para pruebas de concepto en narrativa interactiva: los desarrolladores pueden usar el modelo para prototipar sistemas de diálogo antes de implementar soluciones más costosas.
- Generación de contenido creativo para blogs o redes sociales: aunque está enfocado al roleplay, su capacidad de escritura creativa puede aplicarse a la redacción de historias cortas o microcontenido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre MMLU, HumanEval, GSM8K ni otras métricas estándar. El autor solo menciona cualitativamente que el modelo supera al base en tareas de roleplay y escritura creativa, pero sin cifras concretas.

## Requisitos de hardware

- VRAM estimada: para un modelo de ~11,8B parámetros, se requieren aproximadamente entre 8 y 12 GB de VRAM según la cuantización elegida (Q4_K_M ~6,5 GB de pesos, Q5_K_M ~7,5 GB, Q6_K ~8,5 GB, Q8_0 ~11 GB, más overhead de contexto y activaciones). Estas cifras son orientativas y dependen del software y la longitud de contexto.
- GPU recomendadas: RTX 3090, RTX 4090, A100 40GB o superiores. Con cuantizaciones Q4 o Q5 puede ejecutarse en GPUs de 8-12 GB como RTX 3060 o RTX 4070, aunque con ventana de contexto reducida.
- Es compatible con consumer GPUs de gama media-alta; para contexto completo de 128K se recomienda al menos 16 GB de VRAM.
- Opciones de despliegue: llama.cpp (con soporte GGUF), Ollama, KoboldCpp, LM Studio y servidores compatibles con la API de OpenAI mediante herramientas como llama-server o text-generation-webui.
- Latencia y throughput: no se han publicado mediciones. En una RTX 4090, un modelo de 12B en Q4_K_M suele generar entre 30 y 50 tokens por segundo, pero esto es una estimación genérica.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Enfoque |
|---|---|---|---|---|---|
| Erebus-RP-12B-Instruct-2608-v1 | 11,77B | 128K | Gemma | GGUF | Roleplay y escritura creativa |
| google/gemma-3-12b-it | 12B | 128K | Gemma | safetensors | Instruct general |
| Llama-3.1-8B-Instruct | 8B | 128K | Llama 3.1 | safetensors/GGUF | Instruct general |
| Mistral-7B-Instruct | 7B | 32K | Apache 2.0 | safetensors/GGUF | Instruct general |

No hay benchmarks comparativos disponibles para este finetune. La diferencia principal con los modelos base es la especialización en roleplay y la reducción de rechazos, que lo hacen más adecuado para tareas narrativas que un instruct genérico.

## Limitaciones y advertencias

- El modelo está entrenado únicamente en inglés; no es adecuado para tareas en otros idiomas sin un ajuste adicional.
- Al ser un finetune experimental, puede presentar inconsistencias en la coherencia de la historia o en el seguimiento de instrucciones complejas.
- Riesgo de alucinación y de generar contenido no deseado, especialmente en contextos largos donde el modelo puede perder el hilo.
- Contenido explícito: el entrenamiento incluye registros explícitos, por lo que el modelo puede generar material sexual o violento sin filtros. Esto puede ser inapropiado para entornos profesionales o menores.
- Licencia Gemma: permite uso comercial, pero con restricciones específicas de la licencia de Google (por ejemplo, prohibición de uso en ciertos sectores como armamento). Consultar los términos completos.
- No se han publicado evaluaciones de sesgos ni de seguridad. Al ser un finetune sobre Gemma 3, puede heredar sesgos del modelo base.
- El repo solo contiene pesos GGUF; para usar el modelo con transformers (PyTorch) es necesario descargar la versión safetensors desde el repositorio del modelo base o esperar a que el autor publique los pesos completos.

## Enlaces

- Repositorio HuggingFace (GGUF): https://huggingface.co/Indexnusrefather/Erebus-RP-12B-Instruct-2608-v1-GGUF
- Ficha en LLM Explorer: https://llm-explorer.com/model/Indexnusrefather%2FErebus-RP-12B-Instruct-2608-v1,4IIjKct98S7ufD2izKBQ95
- Modelo base en HuggingFace: https://huggingface.co/google/gemma-3-12b-it
