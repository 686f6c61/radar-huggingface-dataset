# KRAFTON/Raon-1-nano-mlx

## Resumen

Raon-1 nano es un modelo de lenguaje denso de 3,2 mil millones de parámetros desarrollado por KRAFTON AI, la división de inteligencia artificial de la editora surcoreana de videojuegos KRAFTON. La variante aquí descrita, `KRAFTON/Raon-1-nano-mlx`, es una conversión de los pesos originales al formato MLX de Apple, cuantizada a 4 bits con GPTQ (tamaño de grupo 64) y pensada para ejecución local en chips de la serie Apple silicon. El modelo base está publicado bajo licencia Apache 2.0 y no requiere solicitud de acceso.

El modelo destaca por combinar una arquitectura híbrida de atención con una ventana de contexto de 262.144 tokens, muy superior a la de otros modelos de su tamaño. De sus 24 capas, 18 emplean Raon Delta Attention (atención lineal con estado recurrente de tamaño fijo) y solo 6 usan atención completa con caché KV, lo que reduce drásticamente el coste de memoria en contextos largos. Está diseñado para seguir instrucciones, mantener conversaciones multi-turno y ejecutar llamadas a herramientas tanto en coreano como en inglés.

Su relevancia actual reside en la combinación de tamaño compacto, contexto extremo y despliegue en dispositivo. Al estar disponible en MLX, GGUF para llama.cpp y LiteRT-LM, además de los pesos originales para Transformers y vLLM, cubre un espectro amplio de entornos: desde portátiles con Apple silicon hasta servidores con GPU NVIDIA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso híbrido (18 capas Raon Delta Attention + 6 capas Gated MLA) |
| Parametros totales | 3.130.797.136 (3,2B, incluye tabla de embeddings por capa de 1,6B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | 4 bits GPTQ con group size 64 (esta variante MLX); export BF16 disponible |
| Idiomas soportados | Coreano e inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX); el modelo base ofrece también GGUF y LiteRT-LM |

## Arquitectura y entrenamiento

Raon-1 nano emplea una arquitectura densa híbrida de 24 capas con un tamaño oculto de 1.536 y FFN intermedio de 6.144 con activación SwiGLU. La innovación principal es la mezcla de dos mecanismos de atención: 18 capas de Raon Delta Attention (RDA), una atención lineal con regla delta con compuertas de borrado y escritura separadas y un estado recurrente de tamaño fijo, y 6 capas de Gated MLA (atención latente multi-cabeza con compuertas, con rangos LoRA de 512 para query y KV). Solo las capas MLA mantienen caché KV, con un consumo aproximado de 7 KiB por token en BF16, lo que hace viable el contexto de 262.144 tokens sin un crecimiento de memoria prohibitivo.

El modelo incorpora Raon-mHC, una variante optimizada de las hyper-connections con restricción de variedad (mHC) de DeepSeek, que emplea cuatro flujos residuales y reduce el coste computacional para acelerar el entrenamiento. Además, cada capa dispone de un embedding propio de 256 dimensiones por token que, tras el MLP, ajusta la salida de la capa antes de propagarla. La codificación posicional es NoPE (sin codificación posicional explícita), el vocabulario es de 259.840 tokens y el LM head comparte pesos con el embedding de entrada. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni las etapas de alineación (RLHF/DPO) en la información proporcionada.

## Capacidades

- Generación de texto y conversación multi-turno con contexto de hasta 262.144 tokens.
- Seguimiento de instrucciones en coreano e inglés.
- Llamada a herramientas (tool calling / function calling) en escenarios agénticos.
- Modo de razonamiento ("thinking") activado por defecto en la plantilla de chat; el límite de tokens de salida incluye tanto el razonamiento como la respuesta final.
- Razonamiento multi-paso orientado a agentes, con parámetros de muestreo específicos recomendados para tareas agénticas y de código (temperature 1.0, presence_penalty 0.0).
- Despliegue en dispositivo en Apple silicon mediante MLX y en CPU, NVIDIA y AMD mediante GGUF.
- Compatibilidad con Transformers (`trust_remote_code=True`), vLLM, llama.cpp, MLX y LiteRT-LM.
- No se ha documentado soporte de visión, audio ni otras modalidades en la información disponible.

## Casos de uso

- Asistentes conversacionales de contexto largo: el modelo puede mantener conversaciones de decenas de miles de tokens sin degradar la memoria gracias a su ventana de 262.144 tokens y a la caché KV reducida de las capas MLA.
- Agentes con tool calling: los parámetros de muestreo recomendados para tareas agénticas y su soporte de function calling lo hacen adecuado para orquestar llamadas a APIs en flujos multi-paso.
- Generación de código en pipelines: puede integrarse en herramientas de desarrollo y CI/CD como asistente de código con razonamiento previo, aunque los datos de benchmarks de código no están disponibles.
- Procesamiento de documentos extensos en coreano e inglés: resumen, extracción y pregunta-respuesta sobre contratos, informes o expedientes que superen la ventana típica de 8K-32K tokens de otros modelos de 3B.
- Inferencia local en portátiles Apple silicon: la variante MLX de 4 bits y 1,9 GB de repositorio permite ejecutar el modelo en Macs con memoria unificada sin GPU dedicada.
- Despliegue en el borde con llama.cpp: la disponibilidad de GGUF permite servir el modelo en CPU, NVIDIA o AMD en entornos con recursos limitados.
- Aplicaciones multilingües coreano-inglés: atención al cliente o soporte interno bilingüe para empresas con operaciones en Corea y mercados anglófonos.

## Benchmarks y rendimiento

La model card del autor incluye una gráfica de resultados de benchmarks (`benchmark-results.svg`), pero los valores numéricos no están disponibles en la información proporcionada. No se presentan cifras de MMLU, HumanEval, GSM8K ni de otras evaluaciones, por lo que no es posible elaborar una tabla comparativa sin inventar datos.

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: la variante MLX de 4 bits ocupa aproximadamente 1,9 GB en disco; en memoria unificada de Apple silicon el consumo es del mismo orden, más la caché KV de las 6 capas MLA (unos 7 KiB por token en BF16, menor en 4 bits).
- En BF16, los 3,2B parámetros requieren unos 6,4 GB solo para pesos, más estado y caché.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para BF16; para la variante 4 bits basta con 4 GB o menos. Funciona en A100, H100, RTX 4090 y GPUs de gama media.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4060 Ti, RTX 4090 y en Macs con Apple silicon mediante MLX.
- Opciones de despliegue: Transformers (con `trust_remote_code=True`), vLLM (servidor compatible con OpenAI), llama.cpp (GGUF en CPU, NVIDIA y AMD), MLX (Apple silicon) y LiteRT-LM.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formatos | Notas |
|---|---|---|---|---|---|
| Raon-1 nano | 3,2B denso | 262.144 | Apache 2.0 | safetensors, GGUF, MLX, LiteRT-LM | Híbrido RDA + MLA, coreano e inglés |
| Alternativas de ~3B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada para establecer una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; al entrenarse presumiblemente con datos web, es esperable un sesgo hacia contenidos en inglés y coreano.
- Riesgo de alucinación: inherente a los modelos de 3B; el modo de razonamiento por defecto puede aumentar la longitud de las respuestas y, con ello, la exposición a errores.
- Cobertura idiomática limitada: solo coreano e inglés; el rendimiento en castellano no está garantizado ni documentado.
- El límite de tokens de salida (`max_new_tokens`, `max_tokens`) incluye el razonamiento y la respuesta final, por lo que respuestas largas pueden truncarse si no se ajusta.
- La variante MLX está cuantizada a 4 bits, lo que puede introducir una pérdida de calidad frente a BF16; para máxima fidelidad debe usarse el modelo base o el export BF16.
- Licencia Apache 2.0: permite uso comercial sin restricciones adicionales, pero conviene revisar las condiciones del modelo base y de las dependencias (MLX, GPTQ).
- No hay información sobre datos de entrenamiento, alineación ni evaluaciones de seguridad, lo que dificulta la auditoría para producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/KRAFTON/Raon-1-nano-mlx
- Modelo base: https://huggingface.co/KRAFTON/Raon-1-nano
- Página de KRAFTON AI: https://krafton.ai/en/
- Organización KRAFTON en Hugging Face: https://huggingface.co/KRAFTON
- Playground de Raon: https://raon-console.krafton.ai/playground/guest
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- X de KRAFTON AI: https://x.com/Krafton_AI
- Discord de la comunidad: https://discord.gg/sDG7mmZPnc
