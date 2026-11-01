# bartowski/sensenova_SenseNova-6.8-Code2Video-GGUF

## Resumen

SenseNova-6.8-Code2Video es un modelo multimodal de la familia SenseNova, desarrollado por sensenova, especializado en la generación de vídeo a partir de código y en tareas de agente conversacional. El checkpoint original tiene aproximadamente 27.000 millones de parámetros (26.895.998.464 en safetensors) y acepta entradas de texto e imagen, con soporte de tool calling y un modo de razonamiento explícito ("thinking") configurable mediante el parámetro de esfuerzo de razonamiento. La versión aquí descrita es la cuantización GGUF realizada por bartowski con llama.cpp (release b11969) e imatrix.

La relevancia de esta ficha radica en dos aspectos. Por un lado, el modelo aborda un nicho poco cubierto: la traducción de código (por ejemplo, scripts de renderizado o descripciones programáticas de escenas) a vídeo, junto con flujos de agente tipo Claude Code. Por otro, la disponibilidad de cuantizaciones GGUF desde bf16 (53,81 GB) hasta Q4_K_M (17,20 GB) permite desplegarlo en hardware de consumo, algo poco habitual en modelos multimodales de este tamaño.

El repositorio GGUF ocupa 440 GB e incluye múltiples niveles de cuantización, además de un archivo mmproj necesario para el procesamiento de imágenes. El modelo está publicado bajo licencia Apache 2.0 y declara soporte de inglés y chino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text); detalles internos no disponibles |
| Parametros totales | 26.895.998.464 (~27B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16, Q8_0, Q6_K_L, Q6_K, Q6_K_S, Q5_K_M, Q5_K_S, Q4_K_L, Q4_1, Q4_K_M (y otras variantes en el repo) |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado desde safetensors del modelo base) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de que se trata de un transformer multimodal con pipeline image-text-to-text y capacidad de generación de vídeo a partir de código. El modelo base es `sensenova/SenseNova-6.8-Code2Video`, del que esta versión es una cuantización GGUF. Los tags del repositorio mencionan "qwen3.8", lo que sugiere una base derivada de la familia Qwen, aunque no se confirma en la documentación proporcionada.

No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO u otras fases de alineación. La model card de la cuantización sí confirma que no se utiliza decodificación especulativa y que la cuantización se realizó con imatrix, lo que mejora la calidad de los pesos cuantizados en comparación con una cuantización estándar. El prompt format emplea tokens de chat estilo Qwen (`<|im_start|>`, `<|im_end|>`) con un bloque `<think>` para el razonamiento explícito y un formato XML específico para tool calling.

## Capacidades

- Generación de texto y razonamiento con modo "thinking" configurable (reasoning effort, por ejemplo "xhigh"), que fuerza un razonamiento previo a la respuesta final.
- Generación de vídeo a partir de código: el nombre y los tags del modelo indican capacidad de transformar código o descripciones programáticas en vídeo.
- Procesamiento de imágenes como entrada (requiere el archivo mmproj en la cuantización GGUF).
- Tool calling / function calling con formato XML estructurado (`<tool_call>`, `<function=...>`, `<parameter=...>`).
- Capacidades de agente y razonamiento multi-paso orientadas a flujos tipo Claude Code.
- Soporte multilingüe limitado a inglés y chino.
- Integración con endpoints compatibles (tag `endpoints_compatible`).

## Casos de uso

- Generación automática de vídeo a partir de código: un pipeline podría recibir scripts de animación o descripciones programáticas de escenas y producir clips de vídeo, útil para prototipado rápido de contenido audiovisual.
- Asistente de programación agéntico: con tool calling y modo thinking, el modelo puede integrarse en entornos tipo Claude Code para resolver tareas multi-paso con ejecución de funciones externas.
- Automatización de documentación técnica con imágenes: al aceptar entradas de imagen y texto, puede analizar capturas o diagramas y generar documentación asociada.
- Generación de código en producción: el soporte de function calling permite integrarlo en pipelines de CI/CD para invocar herramientas de build, test o despliegue mediante llamadas estructuradas.
- Prototipado de contenido educativo: conversión de ejemplos de código en visualizaciones animadas o vídeos explicativos para plataformas de formación.
- Agentes de atención al cliente en inglés o chino: el formato de chat multi-turno y el razonamiento explícito permiten gestionar conversaciones con pasos intermedios verificables.
- Investigación en generación condicionada por código: útil para experimentar con la relación entre representaciones simbólicas (código) y salidas visuales (vídeo).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos + overhead de contexto y KV cache):
  - bf16: ~54 GB de pesos, requiere 64-80 GB de VRAM en total.
  - Q8_0: ~28,7 GB de pesos, requiere ~32-40 GB de VRAM.
  - Q6_K: ~23,6 GB de pesos, requiere ~28-32 GB de VRAM.
  - Q5_K_M: ~20,7 GB de pesos, requiere ~24-28 GB de VRAM.
  - Q4_K_M: ~17,2 GB de pesos, requiere ~20-24 GB de VRAM.
- GPU recomendadas: A100 80 GB o H100 para bf16; A100 40 GB o RTX 6000 Ada para Q8_0/Q6_K; RTX 4090 (24 GB) para Q4_K_M y Q5_K_S con contexto moderado.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) con cuantizaciones Q4/Q5; en GPUs de 16 GB probablemente solo con cuantizaciones más agresivas no listadas o con offloading a CPU.
- Opciones de despliegue: llama.cpp (versión b11969 o superior), Ollama, y servidores compatibles con GGUF; para el modelo base en safetensors, vLLM o TGI si el soporte está disponible (no confirmado).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| SenseNova-6.8-Code2Video (esta ficha) | ~27B | no disponible | Apache 2.0 | GGUF, safetensors | Multimodal texto/imagen, generación de vídeo desde código, tool calling |
| Qwen2.5-VL-32B (referencia de la familia) | ~32B | no disponible en esta ficha | Apache 2.0 (según variante) | safetensors, GGUF | Multimodal imagen-texto, sin generación de vídeo declarada |
| Qwen2.5-Coder-32B | ~32B | 128K (según documentación pública) | Apache 2.0 | safetensors, GGUF | Especializado en código, sin capacidades multimodales |

La comparativa es aproximada: no se dispone de datos de benchmarks del modelo para contrastar rendimiento real frente a estas alternativas.

## Limitaciones y advertencias

- Idiomas limitados a inglés y chino; el rendimiento en castellano no está documentado y probablemente sea inferior.
- Riesgo de alucinación inherente a los modelos generativos, especialmente en tool calling y en la generación de código para vídeo.
- No se han publicado evaluaciones de sesgo ni de seguridad en la información disponible.
- La longitud de contexto no está especificada, lo que dificulta planificar despliegues con ventanas largas.
- La licencia Apache 2.0 permite uso comercial, pero debe verificarse que el modelo base mantenga la misma licencia y que no existan restricciones adicionales en el checkpoint original.
- El repositorio GGUF ocupa 440 GB; descargar el conjunto completo no es práctico, conviene seleccionar una única cuantización.
- El procesamiento de imágenes requiere el archivo mmproj adicional; sin él, el modelo solo funciona como texto.
- La cuantización puede degradar ligeramente la calidad respecto al checkpoint bf16, especialmente en Q4 y en tareas de razonamiento complejo.
- No hay garantías de soporte en vLLM o TGI para el modelo base; el ecosistema GGUF (llama.cpp, Ollama) es la vía más segura.

## Enlaces

- Repositorio GGUF: https://huggingface.co/bartowski/sensenova_SenseNova-6.8-Code2Video-GGUF
- Modelo base: https://huggingface.co/sensenova/SenseNova-6.8-Code2Video
- llama.cpp release b11969: https://github.com/ggml-org/llama.cpp/releases/tag/b11969
- Repositorio llama.cpp: https://github.com/ggml-org/llama.cpp/
