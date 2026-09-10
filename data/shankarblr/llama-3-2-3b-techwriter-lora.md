# Shankarblr/Llama-3.2-3B-TechWriter-LoRA

## Resumen

El modelo `Shankarblr/Llama-3.2-3B-TechWriter-LoRA` es un adaptador PEFT/LoRA desarrollado por Shankarblr sobre el modelo base `meta-llama/Llama-3.2-3B-Instruct`. No es un modelo independiente: se trata de un adaptador entrenado con QLoRA para especializar el modelo base en redacción técnica del sector de semiconductores y de la interconexión de centros de datos. El autor también publica una versión fusionada (`Shankarblr/Llama-3.2-3B-TechWriter-Instruct`) que permite inferencia directa sin necesidad de cargar el base gated por separado.

El adaptador responde a la necesidad de disponer de asistentes de escritura técnica específicos para dominios industriales, aprovechando modelos fundacionales ya existentes y reduciendo coste computacional y de almacenamiento. Al ser un adapter LoRA, el tamaño del repositorio es de solo 0,1 GB, lo que facilita su distribución y posible reutilización en procesos de fine-tuning. La arquitectura subyacente es un transformer decoder-only de 3 mil millones de parámetros (base), aunque el número exacto de parámetros del adaptador no se especifica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Llama-3.2-3B-Instruct) con adaptador PEFT/LoRA |
| Parametros totales | 3 mil millones (modelo base) + adaptador LoRA (no disponible) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el entrenamiento usó cuantización 4-bit NF4/double-quant vía QLoRA) |
| Idiomas soportados | Inglés (en) |
| Licencia | Llama 3.2 Community License |
| Formato de pesos | Safetensors (adaptador `adapter_model.safetensors`) + `adapter_config.json` de PEFT |

## Arquitectura y entrenamiento

El adaptador se construye sobre `meta-llama/Llama-3.2-3B-Instruct`, un modelo transformer autoregresivo con atención estándar. El autor aplica LoRA con r=16, alpha=32 y dropout=0,05 sobre las proyecciones `q`, `k`, `v`, `o`, `gate`, `up` y `down`. El entrenamiento se realizó con QLoRA, lo que implica que el modelo base se cargó en cuantización 4-bit (NF4 con double quantization y compute dtype fp16) durante el proceso.

El conjunto de datos de entrenamiento es una mezcla privada de instrucciones en formato ChatML centradas en escritura técnica de semiconductores: 6 765 filas, divididas en 90/10 para entrenamiento/validación con semilla 42. El modelo fue entrenado durante 3 épocas, lo que se traduce en 1 143 pasos y un total aproximado de 8,0 millones de tokens. El entrenamiento se completó en una RTX 3090 en fp16 con una duración de unas 2 horas y 27 minutos. En la tercera época, la pérdida de validación fue de 0,1313, la precisión media de tokens de 0,9513 y la entropía de 0,1439. La pérdida media de entrenamiento fue de 0,3507.

El modelo base exige tener acceso a los repositorios gated de Meta en Hugging Face y un token válido. El tokenizador corresponde al de Llama 3.2 Instruct; el autor indica explícitamente que los prompts deben formatearse con `tok.apply_chat_template(...)`, no con la plantilla ChatML de Qwen.

## Capacidades

- Generación de texto técnico especializado en semiconductores e interconexión de centros de datos, con estilo profesional y terminología del sector.
- Generación de texto conversacional siguiendo la plantilla de chat de Llama 3.2 Instruct, gracias a su tokenizador y formato de prompts.
- Entrenamiento en formato ChatML para seguir instrucciones, aunque el autor recomienda usar la plantilla nativa de Llama 3.2 para una correcta inferencia.
- Operación como adaptador PEFT: puede cargarse sobre el base con `transformers` y `peft`, o fusionarse (`merge_and_unload()`) para obtener un modelo monolítico.
- No se documenta soporte para tool calling, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Documentación técnica de componentes de interconexión: el modelo genera especificaciones y descripciones detalladas de chips, buses y protocolos de comunicación, apoyándose en su entrenamiento con datos del sector.
- Redacción de datasheets y hojas de características: permite producir secciones de parámetros eléctricos, interfaces y condiciones de operación de forma coherente y profesional.
- Asistente para notas de aplicación: ingenieros de hardware pueden usarlo para redactar o parafrasear notas técnicas que explican integraciones de dispositivos.
- Escritura de documentación de APIs o protocolos internos: al estar especializado en text técnico, puede generar ejemplos de código y explicaciones de interfaces de bajo nivel.
- Revisión y reescritura de materiales técnicos: el modelo puede reformular párrafos para mejorar la claridad, la consistencia terminológica o el tono formal.
- Base para fine-tuning adicional: al ser un adaptador LoRA compacto, permite extender el modelo a otros dominios técnicos mediante un ajuste rápido y con bajos requisitos de hardware.
- Creación de contenidos para blogs o whitepapers de semiconductores: genera borradores de artículos periodísticos o técnicos dirigidos a una audiencia especializada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor reporta las siguientes métricas de evaluación interna sobre su propio conjunto de validación:

| Metrica | Valor |
|---|---|
| Pérdida de validación (época 3) | 0,1313 |
| Precisión media de tokens | 0,9513 |
| Entropía | 0,1439 |
| Pérdida media de entrenamiento | 0,3507 |
| Tokens de entrenamiento | ~8,0 millones |

Estos valores corresponden al ajuste en el dominio de escritura técnica de semiconductores y no son comparables con los benchmarks públicos habituales.

## Requisitos de hardware

- Inferencia con cuantización 4-bit (como en el ejemplo de carga del adaptador): una GPU con 8 GB de VRAM es suficiente de forma orientativa, dado que el modelo base de 3B en NF4 ocupa aproximadamente 2-3 GB más el adaptador y la caché KV.
- Inferencia en fp16 sin cuantización: se requieren como mínimo 12 GB de VRAM (por ejemplo, RTX 3060 12GB, RTX 4060 Ti 16GB), aunque se recomienda 16 GB o más para secuencias largas.
- Entrenamiento: el autor utilizó una RTX 3090 de 24 GB con QLoRA y fp16; para reproducir el entrenamiento se necesita un equipo similar.
- Despliegue: puede cargarse con `transformers` + `peft` en Python. Para usar en vLLM o TGI, conviene fusionar el adaptador y exportar el modelo resultante. La versión fusionada `Shankarblr/Llama-3.2-3B-TechWriter-Instruct` está pensada para despliegue directo. También puede convertirse a GGUF y servirse con llama.cpp u Ollama.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Shankarblr/Llama-3.2-3B-TechWriter-LoRA | 3B (base) + adaptador | No disponible | Llama 3.2 Community | Repositorio de adaptador, requiere acceso al base gated |
| Shankarblr/Llama-3.2-3B-TechWriter-Instruct | 3B | No disponible | Llama 3.2 Community | Modelo fusionado, listo para inferencia |
| meta-llama/Llama-3.2-3B-Instruct | 3B | No disponible | Llama 3.2 Community | Modelo base general, requiere acceso gated |

No se han encontrado otros adaptadores comparables publicados que estén disponibles en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo independiente: requiere cargar el modelo base gated de Meta y disponer de un token válido de Hugging Face.
- El conjunto de datos de entrenamiento es privado y relativamente pequeño (6 765 filas, ~8 millones de tokens), lo que puede limitar la generalización fuera del dominio de semiconductores.
- Está entrenado únicamente en inglés; no se espera un buen rendimiento en otros idiomas.
- Durante el guardado se generó un error 401 de PEFT al intentar obtener el `config.json` del base: el autor asume que el vocabulario no fue modificado, pero conviene verificarlo en un entorno autenticado antes de usar el modelo.
- No se documenta evaluación de sesgos, seguridad ni robustez frente a alucinaciones. Es un modelo no oficial, no afiliado a ningún proveedor de semiconductores.
- La licencia Llama 3.2 Community License impone condiciones de uso aceptable; debe revisarse antes de cualquier uso comercial.

## Enlaces

- Adaptador en Hugging Face: https://huggingface.co/Shankarblr/Llama-3.2-3B-TechWriter-LoRA
- Versión fusionada: https://huggingface.co/Shankarblr/Llama-3.2-3B-TechWriter-Instruct
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
- Licencia Llama 3.2: https://www.llama.com/llama3_2/license
- Política de uso aceptable de Llama 3.2: https://www.llama.com/llama3_2/use-policy
