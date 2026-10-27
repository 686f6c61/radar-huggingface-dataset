# OpensourceWTF/Qwen3.8-Flash-Next-EXL3-5.05-mlx-serve

## Resumen

Este repositorio no contiene un modelo nuevo ni una cuantización original: es un reempaquetado del cuantizado EXL3 de `turboderp/Qwen3.8-Flash-Next-exl3` (rama `5.05bpw_h6_ng6`, commit `7cef615f`), generado con exllamav3, para que pueda cargarse con el runtime `mlx-serve` sobre Apple silicon. El autor del repack es el usuario `OpensourceWTF`; los bytes cuantizados son de turboderp y la torre de visión procede del pack de `ddalcu`. El modelo de partida es `Qwen/Qwen3.8-Flash-Next`, un transformer MoE con 48 capas de expertos enrutados, proyecciones Gated DeltaNet, atención dispersa con indexador, cabezal MTP (multi-token prediction) y torre de visión.

El interés práctico es acotado pero claro: permite ejecutar un modelo Qwen3.8-Flash-Next cuantizado a 5,05 bits por peso en un Mac con memoria unificada grande, algo que ningún otro runtime soporta con este formato. El pack ocupa 123,42 GB en total, de los cuales 39,04 GB son la tabla de n-gramas y 77,55 GB los expertos enrutados, y exige un `mlx-serve` parcheado (PR 997 de ddalcu/mlx-serve) más el plugin `turboexl3`. El autor solo lo ha probado con texto en un Apple M5 Max de 128 GB y no ha medido su calidad (ni KLD ni perplejidad).

Se trata, por tanto, de un artefacto de infraestructura para investigadores y desarrolladores que ya trabajan con EXL3 y MLX, no de una release oficial de Qwen, de turboderp ni de mlx-serve, y con 0 descargas y 0 likes en el momento de redactar esta ficha.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE híbrido: 48 capas con 512 expertos enrutados por capa, atención q/k/v/o, proyecciones Gated DeltaNet, atención dispersa con indexador, expertos compartidos, cabezal MTP y torre de visión |
| Parámetros totales | 42.177.769.875 (recuento de safetensors del repo) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | EXL3 trellis a 5,05 bits por peso (códigos K5, K7 y K6; codebook MUL1); tensores pequeños sin cuantizar en bf16; torre de visión en bf16 |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (`license: other`, con archivo LICENSE en el repo) |
| Formato de pesos | safetensors con layout de `mlx-serve` (EXL3 + bf16); requiere el plugin `turboexl3` |
| Modelo base | `turboderp/Qwen3.8-Flash-Next-exl3`, rama `5.05bpw_h6_ng6` |
| Modelo original | `Qwen/Qwen3.8-Flash-Next` |
| Tamaño del repo | 123,4 GB (84,38 GB sin la tabla de n-gramas) |
| Desglose de tamaño | Expertos enrutados 77,55 GB (49 archivos); trunk 5,89 GB (11 archivos); tabla de n-gramas 39,04 GB; torre de visión 0,90 GB |
| Librería / runtime | `mlx-serve` (parcheado) |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

La arquitectura descrita en el pack es la del modelo Qwen3.8-Flash-Next: un MoE con 48 capas y 512 expertos enrutados por capa, más expertos compartidos, combinado con un esquema de atención híbrido en el que aparecen proyecciones Gated DeltaNet (atención lineal) y una atención dispersa con proyección de indexado. Incluye además un cabezal MTP (multi-token prediction), cuyo mezclador usa hyper-connections, y una tabla de embeddings de n-gramas independiente de 39,04 GB. El checkpoint incluye una torre de visión de 333 tensores en bf16, aunque el autor solo ha validado entrada de texto.

En cuanto al repack, cada capa de expertos se reordena apilando los 512 tensores por experto en un único tensor por proyección (`switch_mlp.{gate,up,down}_proj.{trellis,suh,svh}`) sin modificar los bytes; el trunk se renombra al esquema de `mlx-serve` (`.weight` para el trellis, `.scales` y `.biases` para suh/svh) y se comprueba el valor `mul1` (0x83DCD12D). Los tensores f16 sin cuantizar pasan a bf16, salvo el `head_bias` de n-gramas, que sigue en f16, y los pesos `conv1d` se reetiquetan de [C, 1, K] a [C, K, 1]. No se recuantiza nada. No hay información sobre datos de entrenamiento, número de tokens, composición del dataset ni etapas de RLHF/DPO en la información proporcionada.

## Capacidades

- Generación de texto y conversación multi-turno: pipeline declarado `text-generation` y tag `conversational`; el `generation_config.json` incluye `default_chat_template_kwargs.enable_thinking`, lo que apunta a un modo de razonamiento activable por plantilla de chat.
- Enrutado MoE de grano fino: 512 expertos por capa en 48 capas, más expertos compartidos, lo que permite analizar el comportamiento del enrutador y de expertos individuales.
- Decodificación asistida por cabezal MTP: el pack incluye el cabezal MTP completo (`fc_hidden`, `fc_embedding`, mezclador de hyper-connections), lo que habilita decodificación multi-token si el runtime lo explota.
- Tabla de embeddings de n-gramas (`ngram_embedding.safetensors`, EXL3 K6 con `exl3_ngram_trellis`) integrada en el runtime parcheado.
- Entrada de imagen/vídeo: la torre de visión está presente (0,90 GB, 333 tensores bf16), pero el autor indica explícitamente que no ha probado imagen ni vídeo; no confirmado.
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponibles/verificadas en la información proporcionada.
- Capacidades multilingües: no disponible.

## Casos de uso

- Inferencia local con requisitos de privacidad: desplegar un Qwen3.8-Flash-Next cuantizado en un Mac de sobremesa con memoria unificada, de forma que prompts y documentos no salgan de la máquina; el pack está pensado precisamente para ejecución en Apple silicon sin servicios externos.
- Estación de trabajo de investigación en cuantización: usar este repositorio como banco de pruebas para validar la ruta EXL3 dentro de `mlx-serve` (bloques `trunk_quant`, `expert_quant`, tabla de n-gramas y cabezal MTP) frente a los resultados de exllamav3.
- Evaluación de decodificación especulativa: comparar el rendimiento del cabezal MTP y de la tabla de n-gramas frente a decodificación autoregresiva pura en el mismo hardware, midiendo aceptación de tokens.
- Análisis de enrutado en modelos MoE: instrumentar el enrutador de 512 expertos por capa para estudiar especialización de expertos, balanceo de carga y activaciones por dominio, con pesos ya cuantizados y listos para cargar.
- Procesamiento por lotes de documentación técnica en local: ejecutar resúmenes, extracción de entidades y clasificación sobre corpus internos en un equipo único, siempre que se verifique antes la ventana de contexto real del modelo base (no documentada aquí).
- Prototipado conversacional con modo thinking: construir asistentes internos que aprovechen la plantilla de chat y el flag `enable_thinking` para separar razonamiento y respuesta final, antes de invertir en despliegues con GPUs dedicadas.
- Comparación de huellas de cuantización: usar los mismos pesos EXL3 en dos layouts (exllamav3 y mlx-serve) para aislar el efecto del runtime en la calidad de salida, dado que los bytes cuantizados son idénticos en ambos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

El autor del repack declara explícitamente que no ha medido la calidad del pack y que no ha ejecutado pruebas de KLD ni de perplejidad sobre él. La model card de `turboderp/Qwen3.8-Flash-Next-exl3` incluye KLD y perplejidad frente a BF16 para sus cuantizaciones, medidas con exllamav3 sobre sus propios archivos, pero los valores concretos no están incluidos en la información proporcionada.

## Requisitos de hardware

- Memoria: el pack completo son 123,42 GB de pesos; hay que añadir el overhead del runtime y de la caché KV, por lo que el mínimo probado es un Apple M5 Max con 128 GB de memoria unificada. No se han probado otros Macs.
- Variante reducida: sin la tabla de n-gramas el pack baja a 84,38 GB, pero el runtime parcheado espera esa tabla, así que no es una vía de despliegue trivial.
- GPU dedicadas: no hay ruta de carga para CUDA en este layout; no se debe asumir que funcione en A100, H100 ni RTX 4090. El formato está atado a MLX y Apple silicon.
- GPU consumer: no cabe en tarjetas de 24 GB (RTX 4090) ni de 48 GB, ni por tamaño ni por compatibilidad de formato.
- Despliegue: `mlx-serve` con soporte EXL3 completo para Qwen3.8 (PR 997 a `ddalcu/mlx-serve`) más el plugin `turboexl3`, compilado desde el directorio `plugin/` de `davidtai/turboexl3`. El `mlx-serve` estándar no sirve este pack.
- Incompatibilidades: no carga en exllamav3, transformers, vLLM, SGLang ni mlx-lm. Para exllamav3 debe usarse el repositorio de turboderp.
- Latencia y throughput: no disponibles. No se han publicado medidas de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / bpw | Runtime | Licencia | Notas |
|---|---|---|---|---|---|---|
| Este pack (`OpensourceWTF/Qwen3.8-Flash-Next-EXL3-5.05-mlx-serve`) | 42.177.769.875 | no disponible | safetensors EXL3 5,05 bpw, layout mlx-serve; 123,4 GB | mlx-serve parcheado + plugin turboexl3 | qwen-community-1.0 | Solo Apple silicon; sin medición de calidad; 0 descargas |
| `turboderp/Qwen3.8-Flash-Next-exl3` (rama `5.05bpw_h6_ng6`) | no disponible | no disponible | EXL3 5,05 bpw, formato exllamav3 | exllamav3 | según modelo base | Fuente original de los bytes cuantizados; incluye KLD y perplejidad frente a BF16 |
| `ddalcu/Qwen3.8-Flash-Next-MLX-Serve-mixed-4-8bit` | no disponible | no disponible | MLX mixto 4/8 bits | mlx-serve estándar | según modelo base | Origen de la torre de visión usada aquí; cuantización distinta (no EXL3) |
| `Qwen/Qwen3.8-Flash-Next` | no disponible | no disponible | BF16 original | transformers, vLLM, SGLang, etc. | qwen-community-1.0 | Modelo de referencia sin cuantizar; máxima fidelidad, mayores requisitos de memoria |

## Limitaciones y advertencias

- No es una cuantización nueva: todos los bytes EXL3 son de turboderp; lo único ajeno es la torre de visión, tomada de ddalcu. Cualquier mérito de calidad corresponde al autor original.
- Calidad no medida: el autor no ha ejecutado KLD ni perplejidad sobre este pack, así que no hay garantía de que el reempaquetado preserve la fidelidad del cuantizado original.
- Dependencia de software no fusionado: requiere un PR abierto a `mlx-serve` y un plugin externo; si ese PR no se acepta o cambia, el pack puede quedar inutilizable.
- Compatibilidad muy restringida: no carga en exllamav3, transformers, vLLM, SGLang ni mlx-lm, y el `mlx-serve` estándar falla con él.
- Validación mínima: probado solo con texto, solo en un Apple M5 Max de 128 GB; no hay pruebas en otros equipos ni con imagen o vídeo, pese a incluir torre de visión.
- Licencia: `qwen-community-1.0` con `license: other`; es imprescindible revisar el archivo LICENSE del repo y las condiciones de la licencia comunitaria de Qwen antes de cualquier uso comercial.
- Idiomas y contexto no documentados: no hay información sobre cobertura lingüística ni longitud de contexto en esta ficha, lo que impide planificar cargas de trabajo con ventanas grandes sin verificación previa.
- Sesgos y alucinación: no hay evaluaciones publicadas para este pack; los sesgos del modelo base y su tasa de alucinación no están caracterizados en la información disponible.
- Tamaño operativo: 123,4 GB de descarga y almacenamiento, con 39,04 GB solo para la tabla de n-gramas; la descarga y el arranque son costosos en tiempo y disco.
- Madurez: 0 descargas y 0 likes, autor comunitario y actualización pocos minutos después de la creación; no es una release oficial de Qwen, turboderp ni mlx-serve.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/OpensourceWTF/Qwen3.8-Flash-Next-EXL3-5.05-mlx-serve
- Cuantización original de turboderp: https://huggingface.co/turboderp/Qwen3.8-Flash-Next-exl3
- Rama de origen `5.05bpw_h6_ng6`: https://huggingface.co/turboderp/Qwen3.8-Flash-Next-exl3/tree/5.05bpw_h6_ng6
- Modelo base de Qwen: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Pack de mlx-serve con la torre de visión: https://huggingface.co/ddalcu/Qwen3.8-Flash-Next-MLX-Serve-mixed-4-8bit
- Runtime mlx-serve: https://github.com/ddalcu/mlx-serve
- Pull request con soporte EXL3 para Qwen3.8: https://github.com/ddalcu/mlx-serve/pull/997
- Plugin turboexl3: https://github.com/davidtai/turboexl3
- exllamav3: https://github.com/turboderp-org/exllamav3
- La búsqueda web realizada no devolvió resultados relevantes sobre este modelo; los enlaces anteriores proceden de la model card y de los metadatos del repositorio.
