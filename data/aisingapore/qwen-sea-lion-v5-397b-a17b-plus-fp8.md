# aisingapore/Qwen-SEA-LION-v5-397B-A17B-Plus-FP8

## Resumen

Qwen-SEA-LION-v5-397B-A17B-Plus-FP8 es la versión cuantizada en FP8 del modelo Qwen-SEA-LION-v5-397B-A17B-Plus, desarrollado por el AI Products Pillar de AI Singapore y financiado por el National Research Foundation de Singapur. Forma parte de la familia SEA-LION (Southeast Asian Languages In One Network), una colección de modelos de lenguaje diseñada específicamente para dar cobertura a las lenguas del sudeste asiático, una región tradicionalmente infrarrepresentada en los grandes modelos de propósito general.

El modelo es un transformer causal con codificador de visión, construido sobre la base Qwen 3.5 397B-A17B y adaptado por AI Singapore. Su ventana de contexto alcanza los 262.144 tokens y soporta nueve idiomas: birmano, chino, inglés, indonesio, filipino, malayo, tamil, tailandés y vietnamita. La variante FP8 reduce aproximadamente a la mitad el requisito de memoria del modelo BF16, con una pérdida de precisión mínima según el autor, y puede servirse en cuatro GPU H200.

La relevancia de esta ficha radica en dos factores: por un lado, la cobertura lingüística regional, que lo convierte en una opción poco habitual para tareas multilingües en el sudeste asiático; por otro, su licencia MIT, que permite uso comercial sin las restricciones habituales de otros modelos de gran escala. La cuantización FP8, además, lo hace desplegable en infraestructura más asequible que la versión completa en BF16.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con codificador de visión (MoE, según nomenclatura A17B y tablas n-gram) |
| Parametros totales | 569.454.962.707 (~569,5 mil millones, según safetensors) |
| Parametros activos | no disponible (la nomenclatura A17B sugiere ~17B activos, pero no se confirma en la información) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | FP8 (pesos de expertos y tablas n-gram en FP8 block-wise; resto en BF16). Existen variantes BF16, NVFP4 y GGUF |
| Idiomas soportados | Birmano (my), chino (zh), inglés (en), indonesio (id), filipino (fil), malayo (ms), tamil (ta), tailandés (th), vietnamita (vi) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer causal con codificador de visión, lo que habilita la modalidad image-text-to-text. La nomenclatura 397B-A17B y la referencia a pesos de expertos indican una arquitectura de mezcla de expertos (MoE), aunque la información disponible no detalla el número de expertos, la estrategia de enrutamiento ni el número exacto de parámetros activos por token. Una particularidad técnica destacable es la presencia de tablas n-gram de aproximadamente 164.000 millones de parámetros (164 GB en FP8), que se almacenan en memoria de host y se consultan por filas en cada paso, un mecanismo que el stack de despliegue gestiona mediante opciones específicas (`--engram-config '{"cpu_offload":true}'` en vLLM, `--ple-offload-embedding` en SGLang).

En cuanto al entrenamiento, la información proporcionada no incluye el número de tokens, la composición del dataset ni si hubo fases de RLHF o DPO. El modelo deriva de la base Qwen 3.5 397B-A17B, adaptada por AI Singapore para el contexto del sudeste asiático, pero no se detallan los datos de ajuste ni la metodología de alineación. La cuantización FP8 replica el formato block-wise de Qwen/Qwen3.5-397B-A17B-FP8, mantiene el tokenizer, la plantilla de chat y los valores por defecto de muestreo sin cambios, y conserva el resto de pesos en BF16.

## Capacidades

- Generación de texto y razonamiento multimodal: procesa entradas de imagen y texto (pipeline image-text-to-text) y genera respuestas textuales.
- Modo de razonamiento (thinking): habilitado por defecto mediante `enable_thinking`, con salida separada de razonamiento y respuesta final; se puede desactivar.
- Tool calling / function calling: soportado mediante los parsers `qwen3_coder` en vLLM y SGLang, con elección automática de herramientas.
- Capacidades multilingües en nueve idiomas del sudeste asiático, además de chino e inglés.
- Contexto largo de 262.144 tokens, adecuado para documentos extensos y conversaciones multi-turno prolongadas.
- Integración con endpoints compatibles con la API de OpenAI (chat completions).
- Soporte de agentes y razonamiento multi-paso a través del modo thinking y del tool calling.

## Casos de uso

- Atención al cliente multilingüe en el sudeste asiático: el modelo puede gestionar conversaciones multi-turno en indonesio, malayo, tailandés, vietnamita o filipino con una ventana de 262.144 tokens, lo que permite mantener historiales largos y contexto de cliente sin truncar.
- Procesamiento de documentación comercial y logística regional: con contexto largo y capacidad de visión, puede analizar facturas, conocimientos de embarque o documentos aduaneros escaneados y responder en el idioma local del operador.
- Generación y revisión de código con tool calling: integrable en pipelines de CI/CD mediante los parsers `qwen3_coder`, con llamadas a funciones para consultar APIs o ejecutar validaciones.
- Asistentes de investigación para lenguas de bajos recursos: útil para traducción, resumen y análisis de textos en birmano, tamil o filipino, idiomas con menor cobertura en modelos generalistas.
- Análisis de imágenes con texto asociado: al ser image-text-to-text, puede describir o extraer información de capturas, formularios o fotografías acompañadas de instrucciones textuales.
- Despliegue en infraestructura moderada: la cuantización FP8 permite servir el modelo en cuatro GPU H200 en lugar de requerir el doble de memoria del BF16, lo que facilita entornos de producción con presupuesto de hardware acotado.
- Automatización de agentes multi-paso: combinando thinking mode y tool calling, puede orquestar tareas que requieran planificación, consulta de herramientas externas y síntesis de resultados en varios idiomas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: la versión FP8 necesita aproximadamente la mitad de memoria que el modelo BF16. El autor indica que se ejecuta en cuatro GPU H200. El repositorio ocupa 582,2 GB, lo que da una referencia del espacio en disco necesario.
- GPU recomendadas: cuatro NVIDIA H200 para el despliegue de referencia con vLLM o SGLang (tensor-parallel-size 4).
- GPU de consumo: no disponible; por el tamaño del modelo (569,5 mil millones de parámetros totales y 582 GB de repo), no es viable en GPU de consumo convencionales.
- Opciones de despliegue: vLLM (con `--tensor-parallel-size 4`, `--enable-expert-parallel` y `--engram-config '{"cpu_offload":true}'`) y SGLang (con `--tp 4` y `--ple-offload-embedding`). Existe una variante GGUF para llama.cpp, aunque la información no detalla sus requisitos.
- Memoria de host: las tablas n-gram (~164B parámetros, 164 GB en FP8) se mantienen en memoria de host (CPU offload), por lo que se requiere RAM sustancial además de la VRAM.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen-SEA-LION-v5-397B-A17B-Plus-FP8 | ~569,5 mil millones | 262.144 | MIT | Hugging Face (FP8, BF16, NVFP4, GGUF) |
| Qwen-SEA-LION-v5-397B-A17B-Plus (BF16) | ~569,5 mil millones (misma base) | 262.144 | MIT | Hugging Face |
| Qwen/Qwen3.5-397B-A17B-FP8 | no disponible en la información | no disponible | no disponible | Hugging Face |

La comparación con modelos de otros desarrolladores no está disponible en la información proporcionada. El modelo base Qwen 3.5 397B-A17B se menciona como referencia de formato de cuantización, pero no se detallan sus especificaciones ni su licencia.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan en la información disponible; al ser un modelo adaptado a una región concreta, cabe esperar sesgos derivados de los datos de entrenamiento, pero no se cuantifican.
- Riesgo de alucinación: no se han publicado evaluaciones de fiabilidad ni tasas de alucinación en la información disponible.
- Limitaciones de idioma: la cobertura declarada se limita a nueve idiomas (birmano, chino, inglés, indonesio, filipino, malayo, tamil, tailandés y vietnamita); el rendimiento en otras lenguas, incluido el español, no está documentado.
- Restricciones de licencia: licencia MIT, que permite uso comercial, modificación y redistribución con atribución; no se indican restricciones adicionales.
- Caveats de producción: el despliegue requiere cuatro GPU H200 y memoria de host para las tablas n-gram; con vLLM 0.34 es necesario `--model-loader-extra-config '{"enable_weights_track":false}'` para evitar un falso error de peso faltante por el padding de una proyección Gated Residual.
- El modo thinking está activado por defecto, lo que incrementa la latencia y el consumo de tokens si no se desactiva explícitamente.
- No se dispone de datos de benchmarks que permitan validar el rendimiento frente a alternativas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aisingapore/Qwen-SEA-LION-v5-397B-A17B-Plus-FP8
- Modelo base (BF16): https://huggingface.co/aisingapore/Qwen-SEA-LION-v5-397B-A17B-Plus
- Variante NVFP4: https://huggingface.co/aisingapore/Qwen-SEA-LION-v5-397B-A17B-Plus-NVFP4
- Variante GGUF: https://huggingface.co/aisingapore/Qwen-SEA-LION-v5-397B-A17B-Plus-GGUF
- Referencia de cuantización Qwen: https://huggingface.co/Qwen/Qwen3.5-397B-A17B-FP8
- Colección SEA-LION v5: https://huggingface.co/collections/aisingapore/sea-lion-v5-6afab40ea2b5b627e9930703
- Sitio oficial SEA-LION: https://sea-lion.ai
- Licencia MIT: https://mit-license.org/
