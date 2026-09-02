# blackbearreloaded/ProsperoAI-Mistral-7B-Instruct-v0.3-Q4_0-PS5

## Resumen

ProsperoAI-Mistral-7B-Instruct-v0.3-Q4_0-PS5 es una conversión de formato del modelo Mistral 7B Instruct v0.3, preparada específicamente para ejecutarse de forma local en una PlayStation 5 mediante el runtime nativo ProsperoAI (PPSA99004). El repositorio, publicado por el usuario blackbearreloaded, no contiene un fine-tune ni un entrenamiento adicional: los pesos provienen del GGUF Q4_0 publicado por QuantFactory, basado a su vez en mistralai/Mistral-7B-Instruct-v0.3. El resultado es un archivo en formato P5LM (propietario) que aprovecha la GPU AMD de la consola a través del compute path AGC, con la CPU encargándose de la orquestación y la tokenización.

La relevancia de este modelo radica en que permite ejecutar un LLM de 7 mil millones de parámetros en hardware de consumo doméstico sin necesidad de GPU dedicada ni conexión a la nube, dentro del ecosistema homebrew de PS5. La arquitectura es la del Mistral 7B original (transformer decoder-only con atención GQA), con 32 capas, ancho de embedding de 4096, 32 cabezas de atención y 8 cabezas KV. El contexto efectivo está limitado a 4096 tokens por la aplicación, muy por debajo de los 32768 que soporta el modelo base. La licencia es Apache 2.0, lo que facilita su uso y redistribución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Mistral 7B, con GQA y RoPE) |
| Parametros totales | 7 mil millones (aproximado, arquitectura Mistral 7B) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | 4096 tokens (límite de la app ProsperoAI; el modelo base soporta 32768) |
| Tipos de cuantizacion | Q4_0 (GGUF) dentro de contenedor P5LM |
| Idiomas soportados | no disponible (los del modelo base Mistral 7B Instruct v0.3, no especificados en esta conversion) |
| Licencia | Apache 2.0 |
| Formato de pesos | P5LM (propietario para ProsperoAI, no compatible con llama.cpp, CUDA, ROCm ni runners de escritorio) |

## Arquitectura y entrenamiento

Este modelo no ha sido entrenado ni ajustado; es una conversión de formato. Los pesos originales corresponden a Mistral-7B-Instruct-v0.3, un transformer decoder-only con 32 capas, embedding de 4096 dimensiones, feed-forward de 14336, 32 cabezas de atención y 8 cabezas KV (grouped-query attention). El vocabulario se amplió en la versión v0.3 hasta 32768 tokens e incluye tokens especiales para function calling (TOOL_CALLS, AVAILABLE_TOOLS, TOOL_RESULTS). La conversión a P5LM valida una arquitectura exacta: 291 tensores en el layout esperado, RoPE con dimensión 128 y frecuencia base 1.000.000. No se ha aplicado ningún proceso de entrenamiento adicional, RLHF ni DPO sobre esta versión.

El proceso de conversión, realizado por BlackBearReloaded, reorganiza los tensores del GGUF Q4_0 en un contenedor P5LM optimizado para los kernels AGC de la GPU de PS5. La cuantización Q4_0 reduce el peso del modelo a aproximadamente 4,7 GB, manteniendo los tensores F32 y Q6_K del modelo fuente según la documentación. La inferencia se ejecuta con los pesos residentes en GPU y la caché KV también en GPU, mientras que la CPU gestiona la tokenización y la orquestación. El decodificado actual es greedy (selección de token más probable), sin muestreo estocástico.

## Capacidades

- Generación de texto y razonamiento conversacional: el modelo base Mistral 7B Instruct v0.3 es capaz de mantener diálogos multi-turno, responder preguntas, resumir texto y realizar tareas de razonamiento básico e intermedio.
- Soporte de function calling: gracias al vocabulario ampliado de la v0.3, el modelo puede emitir llamadas a herramientas estructuradas, aunque en el runtime ProsperoAI no se documenta explícitamente si esta funcionalidad está habilitada.
- Capacidades multilingües: el modelo base soporta inglés, francés, alemán, italiano, español y otros idiomas, pero la conversión no especifica qué lenguas conserva ni si hay degradación por la cuantización.
- Limitación de contexto: la ventana efectiva es de 4096 tokens, suficiente para conversaciones cortas pero insuficiente para documentos largos o razonamiento multi-paso extenso.
- Sin capacidades multimodales: no hay soporte de visión, audio ni otros canales; es exclusivamente texto.
- Ejecución local en PS5: la principal capacidad diferencial es poder funcionar sin conexión a internet ni hardware adicional, dentro del entorno homebrew de la consola.

## Casos de uso

- Asistente conversacional local en PS5: el modelo puede actuar como un chatbot personal que responde preguntas, cuenta historias o mantiene charlas informales, aprovechando la GPU de la consola sin depender de servicios en la nube. Su tamaño reducido permite tiempos de respuesta aceptables para interacción casual.
- Soporte técnico y solución de problemas en juegos: los usuarios pueden consultar al modelo sobre mecánicas de juego, configuraciones de hardware o resolución de errores comunes, con la ventaja de que la conversación permanece en el dispositivo.
- Generación de diálogos para prototipos de juegos: desarrolladores independientes que trabajan en PS5 pueden usar el modelo para generar guiones o diálogos de personajes de forma local, sin necesidad de enviar datos a servidores externos.
- Educación y práctica de idiomas: dado el soporte multilingüe del modelo base, se puede utilizar como tutor de vocabulario o práctica conversacional, aunque el límite de 4096 tokens obliga a mantener intercambios breves.
- Automatización de tareas de texto simples: el modelo puede redactar correos, resumir notas o generar listas, siempre que la entrada no exceda el contexto disponible. Su naturaleza local garantiza privacidad de los datos.
- Experimentación con inferencia en consolas: para investigadores y entusiastas del homebrew, este modelo sirve como banco de pruebas para estudiar el rendimiento de LLMs en hardware de juegos, medir latencias y explorar optimizaciones de memoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni ninguna otra evaluación. El rendimiento del modelo base Mistral 7B Instruct v0.3 es conocido en la literatura (por ejemplo, MMLU alrededor de 60-63% en versiones anteriores), pero esta conversión específica no reporta datos propios. Además, la cuantización Q4_0 introduce degradación de calidad respecto al modelo en punto flotante, y el límite de contexto de 4096 tokens puede afectar a tareas que requieran ventanas largas. No se dispone de mediciones de latencia o throughput para el runtime ProsperoAI.

## Requisitos de hardware

- Plataforma: PlayStation 5 con el runtime nativo ProsperoAI (aplicación PPSA99004) instalado. No es compatible con otros sistemas.
- Memoria: el archivo del modelo ocupa aproximadamente 4,7 GB en disco. La PS5 dispone de 16 GB de RAM unificada (GDDR6), de los cuales una parte se destina a la GPU y otra al sistema; no se especifica la VRAM exacta reservada para el modelo.
- GPU: AMD GPU integrada de PS5 (RDNA 2, 36 CUs a 2.23 GHz). El runtime utiliza el compute path AGC para ejecutar los kernels de inferencia.
- CPU: AMD Zen 2 de 8 núcleos, encargada de la tokenización y orquestación.
- Almacenamiento: SSD NVMe, necesario para cargar el modelo en memoria.
- Opciones de despliegue: exclusivamente mediante ProsperoAI. No se puede usar con vLLM, llama.cpp, Ollama ni TGI.
- Rendimiento: no se proporcionan cifras de latencia o throughput. La documentación advierte que la generación con contexto corto es sustancialmente más rápida que con contexto largo, y que el límite de 4096 tokens es un tope funcional, no una garantía de velocidad constante.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ProsperoAI-Mistral-7B-Instruct-v0.3-Q4_0-PS5 | 7B | 4096 (efectivo) | Q4_0 (P5LM) | Apache 2.0 | Solo PS5 con ProsperoAI |
| mistralai/Mistral-7B-Instruct-v0.3 (original) | 7B | 32768 | FP16/BF16 | Apache 2.0 | Cualquier hardware con transformers, vLLM, etc. |
| QuantFactory/Mistral-7B-Instruct-v0.3-GGUF (Q4_0) | 7B | 32768 | Q4_0 (GGUF) | Apache 2.0 | Multiplataforma (llama.cpp, Ollama, LM Studio) |
| Microsoft Phi-3-mini (4K context, 3.8B) | 3.8B | 4096 | FP16 | MIT | Multiplataforma |

La comparativa muestra que la versión para PS5 es esencialmente el mismo modelo que el GGUF original, pero en un contenedor cerrado que solo funciona en la consola. Frente a alternativas como Phi-3-mini, el Mistral 7B ofrece mayor capacidad de razonamiento y soporte de function calling, aunque con un consumo de memoria superior. No hay datos de rendimiento comparativo en PS5 frente a otros modelos.

## Limitaciones y advertencias

- La cuantización Q4_0 reduce la calidad del modelo en comparación con versiones en FP16 o BF16, lo que puede manifestarse en respuestas menos precisas o con más alucinaciones.
- El contexto está limitado a 4096 tokens por la aplicación, muy por debajo de los 32768 del modelo base. Conversaciones largas o documentos extensos no son viables.
- El formato P5LM es propietario y solo funciona con el runtime ProsperoAI en PS5. No es portable a otros entornos.
- La generación es greedy (selección determinista), sin soporte de muestreo de temperatura, top-p ni otros parámetros de decodificación, lo que puede producir respuestas repetitivas o poco diversas.
- No se han publicado benchmarks ni evaluaciones de sesgos, alucinaciones o seguridad específicas para esta conversión. Se debe seguir la guía de uso aceptable del modelo Mistral original.
- El rendimiento degrada notablemente con contextos largos; la documentación advierte que la velocidad no es constante y que el límite de 4096 tokens es funcional, no una promesa de rendimiento.
- Requiere un entorno PS5 con homebrew habilitado, lo que puede violar los términos de servicio de Sony y conlleva riesgos de seguridad.
- No se especifican los idiomas soportados de forma explícita; la compatibilidad multilingüe depende del modelo base y puede verse afectada por la cuantización.
- El repositorio no tiene descargas ni likes, lo que sugiere una adopción muy limitada y poca validación comunitaria.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/blackbearreloaded/ProsperoAI-Mistral-7B-Instruct-v0.3-Q4_0-PS5
- Modelo base original: https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.3
- GGUF fuente (QuantFactory): https://huggingface.co/QuantFactory/Mistral-7B-Instruct-v0.3-GGUF
- Página de LM Studio sobre Mistral 7B: https://lmstudio.ai/models/mistral
- Ficha de Mistral 7B Instruct v0.3 en LM Studio: https://lmstudio.ai/models/mistralai/mistral-7b-instruct-v0.3
- Modelo base Mistral-7B-v0.3: https://huggingface.co/mistralai/Mistral-7B-v0.3
