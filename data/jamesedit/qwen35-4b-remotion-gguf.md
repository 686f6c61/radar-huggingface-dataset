# jamesedit/qwen35-4b-remotion-GGUF

## Resumen

qwen35-4b-remotion-GGUF es una adaptación cuantizada en formato GGUF de un fine-tune con LoRA sobre el modelo multimodal Qwen/Qwen3.5-4B. Lo publica el usuario jamesedit y su propósito es muy concreto: generar ficheros de composición completos en Remotion, React y TypeScript (extension `.tsx`) a partir de una instrucción breve. Conserva la capacidad de visión del modelo base, de modo que también puede leer capturas de pantalla o imágenes de referencia.

El modelo resuelve un nicho muy específico dentro de la generación de código: la creación de vídeos programáticos con Remotion, una librería que permite construir vídeos con componentes React. El fine-tune se entrenó con 47 ficheros `.tsx` escritos a mano, por lo que su especialización es estrecha y deliberadamente acotada. Fuera de ese dominio, el comportamiento es el del Qwen3.5-4B original.

La relevancia práctica está en su tamaño: con 4.205.751.296 parámetros totales y una cuantización Q4_K_M de 2,55 GB (más un proyector de visión de 0,63 GB), puede ejecutarse en hardware de consumo mediante llama.cpp o LM Studio. La arquitectura del modelo base es de tipo transformer con atención lineal híbrida (la model card menciona tensores `ssm_beta` y `in_proj_qkv`, propios de un diseño híbrido), aunque la información disponible no detalla la composición exacta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido (base Qwen3.5-4B; arquitectura `qwen35` en llama.cpp, con componentes de atención lineal/SSM) |
| Parametros totales | 4.205.751.296 (4,21B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 262.144 tokens declarados en el GGUF; el autor recomienda cargar 8.192–16.384 en equipos convencionales |
| Tipos de cuantizacion | Q4_K_M (única cuantización publicada); proyector de visión en F16 |
| Idiomas soportados | Inglés (en), tailandés (th) |
| Licencia | Apache-2.0 (heredada de Qwen/Qwen3.5-4B) |
| Formato de pesos | GGUF (llama.cpp); 378 tensores |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B, un modelo multimodal Apache-2.0 que procesa texto e imágenes (pipeline `image-text-to-text`). Sobre él se aplicó un fine-tune QLoRA en 4 bits NF4 con cómputo en bf16. La configuración LoRA es r=16, alpha=32 y dropout de 0,05, aplicada a las proyecciones `q/k/v/o_proj`, `in_proj_qkv`, `in_proj_z`, `out_proj` y `gate/up/down_proj` del decodificador de texto. La torre de visión quedó intacta. El entrenamiento movilizó 30,5 millones de parámetros entrenables, un 0,67 % del total de 4,57B declarado en la model card.

El conjunto de datos es extremadamente reducido: 47 ficheros `.tsx` de Remotion escritos a mano, una sola época y longitud máxima de 1536 tokens. No se menciona RLHF, DPO ni ninguna otra fase de alineación posterior. La conversión a GGUF se realizó con `convert_hf_to_gguf.py` en F16 y posterior cuantización con `llama-quantize` a Q4_K_M; el proyector multimodal se exportó por separado con la bandera `--mmproj`. La cabeza de predicción multi-token (MTP) del modelo base no se transfiere en `merge_and_unload()`, por lo que esta build carece de decodificación especulativa MTP.

## Capacidades

- Generación de ficheros de composición completos en Remotion, React y TypeScript (`.tsx`) a partir de una instrucción corta.
- Comprensión de imágenes y capturas de pantalla mediante el proyector multimodal (requiere el fichero `mmproj`).
- Depuración visual: puede analizar una captura de una composición y señalar errores.
- Generación de texto general y razonamiento heredados del Qwen3.5-4B base.
- Soporte multilingüe limitado a inglés y tailandés según los metadatos del modelo.
- Modo de pensamiento (`enable_thinking`) disponible en el modelo base, aunque el autor recomienda desactivarlo para esta tarea.
- No se documenta soporte explícito de tool calling ni de flujos de agentes multi-paso en la información disponible.

## Casos de uso

- Generación de tarjetas de título animadas: el modelo produce un componente `.tsx` completo de Remotion a partir de una instrucción como "title card que se desliza hacia dentro", con animaciones y estilos incluidos.
- Creación de transiciones y efectos: permite describir una transición (fundido, deslizamiento, escala) y obtener el código del componente con los fotogramas y la interpolación configurados.
- Depuración de composiciones existentes: mediante `llama-mtmd-cli` o la API con `image_url`, se le pasa una captura del render y el modelo identifica problemas de maquetación o de animación.
- Prototipado rápido de vídeo programático: equipos que ya usan Remotion pueden generar borradores de composiciones en segundos y refinarlos manualmente, reduciendo el tiempo de arranque de cada pieza.
- Asistente local en el editor: al ejecutarse con llama.cpp o LM Studio en una máquina de desarrollo, puede integrarse en un flujo de trabajo sin enviar código a servicios externos, algo relevante para material no publicable.
- Generación de componentes React/TypeScript auxiliares: aunque especializado en Remotion, el modelo base aporta conocimientos de React y TypeScript que permiten generar componentes de apoyo (controles, layouts, utilidades de animación).
- Automatización de plantillas de vídeo: para productoras o creadores que generan series de vídeos con estructura repetida, el modelo puede producir variantes de una composición a partir de parámetros descriptivos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,2 GB en Q4_K_M sumando el modelo (2,55 GB) y el proyector de visión (0,63 GB); el contexto adicional consume memoria según la longitud configurada.
- Cabe en GPU de consumo: sí, en tarjetas con 6 GB o más de VRAM (RTX 3060, RTX 4060, RTX 4070, RTX 4090). También puede ejecutarse en CPU, aunque con menor throughput.
- GPU recomendadas para uso cómodo: RTX 4090 o superiores para mayor velocidad; A100/H100 no son necesarias por el tamaño del modelo.
- Despliegue: llama.cpp (versión b12823 o superior), `llama-server` con endpoint compatible con OpenAI en `/v1/chat/completions`, LM Studio con runtime llama.cpp 2.80.1 o superior, y `llama-mtmd-cli` para entrada de imágenes.
- Configuración recomendada: contexto de 8.192–16.384 tokens (el valor declarado de 262.144 provoca falta de memoria en equipos normales), `enable_thinking = false`, `repetition_penalty = 1.15`, decodificación greedy y `max_new_tokens >= 3072` para evitar truncamientos.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Visión | Licencia | Especialización |
|---|---|---|---|---|---|
| qwen35-4b-remotion (este) | 4,21B | 262.144 (recomendado 8K–16K) | Sí (con mmproj) | Apache-2.0 | Remotion / React / TSX |
| Qwen/Qwen3.5-4B (base) | 4,57B | No disponible en la información | Sí | Apache-2.0 | Propósito general multimodal |
| Alternativas de código de ~4B | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks ni de comparativas de rendimiento con otros modelos en la información proporcionada.

## Limitaciones y advertencias

- Especialización muy estrecha: el fine-tune se entrenó con solo 47 ficheros y una época, por lo que la calidad fuera del dominio Remotion/React/TypeScript no está garantizada y puede degradarse respecto al modelo base.
- Riesgo de bucles: sin `repetition_penalty` de 1.15 el autor advierte de que el modelo entra en repeticiones.
- Truncamiento: con `max_new_tokens` por debajo de 3072 el modelo puede generar ficheros incompletos, ya que escribe archivos enteros.
- El modo de pensamiento (`enable_thinking = true`) produce ficheros cortos e incompletos según el autor; debe desactivarse.
- La comprensión de imágenes es la del Qwen3.5-4B original, sin fine-tune; no está especializada en lectura de capturas de Remotion más allá de lo que aporte el modelo base.
- El fichero `mmproj` es obligatorio para visión; sin él el modelo funciona solo con texto.
- Requiere versiones recientes de llama.cpp (b12823+) o LM Studio (runtime 2.80.1+); versiones anteriores fallan con el error `tensor 'blk.0.ssm_beta.weight' not found`.
- Cargar el contexto declarado de 262.144 tokens agota la memoria en equipos convencionales.
- Idiomas: solo inglés y tailandés declarados; el castellano no figura entre los idiomas soportados.
- Sin decodificación especulativa MTP en esta build.
- Sesgos: no documentados en la información disponible; al heredar el modelo base, pueden persistir los sesgos de Qwen3.5-4B.
- Licencia Apache-2.0: permite uso comercial, pero conviene verificar los términos del modelo base Qwen3.5-4B.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/jamesedit/qwen35-4b-remotion-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Remotion (librería): no se proporciona enlace en la información disponible
- llama.cpp: no se proporciona enlace en la información disponible
- LM Studio: no se proporciona enlace en la información disponible
