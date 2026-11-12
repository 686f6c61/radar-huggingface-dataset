# NeosQ/LFM3-Omni-2B-Uncensored-abliterated.gguf

## Resumen

LFM3-Omni-2B-Uncensored-abliterated.gguf es una conversión a formato GGUF del checkpoint `NeosQ/LFM3-Omni-2B-Uncensored-abliterated`, que a su vez deriva de `LiquidAI/LFM3-Omni-2B` tras aplicar una ablación de dirección (abliteration, técnica MPOA) para eliminar el comportamiento de rechazo. Lo publica el usuario NeosQ como conversión comunitaria, sin afiliación con Liquid AI. El resultado es un modelo multimodal any-to-any de aproximadamente 1.730 millones de parámetros (1.728.801.600 según los pesos en safetensors) que acepta texto, imagen y audio como entrada y puede producir texto y voz como salida.

La relevancia de esta ficha es doble. Por un lado, documenta un caso de cuantización práctica de un modelo omni pequeño (unos 2B) pensado para ejecutarse en hardware de consumo: el archivo Q4_K_M ocupa aproximadamente 1 GB y el proyector multimodal unos 906 MiB. Por otro, advierte de que se trata de un checkpoint abliterado, es decir, con los mecanismos de rechazo eliminados deliberadamente, lo que lo hace inadecuado para producción o para aplicaciones de cara al usuario.

El repositorio incluye cuatro archivos: tres niveles de cuantización del backbone de texto (BF16, Q8_0 y Q4_K_M) y un proyector multimodal en F16 que es obligatorio para cualquier entrada de imagen o audio y para la salida de voz. La licencia heredada es la LFM Open License v1.0, con sus umbrales de uso comercial aplicables a esta obra derivada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM3 / LFM3-Omni (transformer multimodal con encoder de visión y audio, depthformer y códec de voz; requiere build de llama.cpp con soporte `lfm3`) |
| Parametros totales | 1.728.801.600 (backbone de texto); el proyector multimodal es un archivo aparte de 458 tensores |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, Q8_0 (embedding de tokens en F16), Q4_K_M; proyector en F16 |
| Idiomas soportados | no disponible (la model card menciona ASR en inglés como ejemplo, sin lista oficial) |
| Licencia | LFM Open License v1.0 (`lfm1.0`), heredada de `LiquidAI/LFM3-Omni-2B`, con umbral de uso comercial |
| Formato de pesos | GGUF (llama.cpp); el modelo base sin cuantizar está en safetensors |

## Arquitectura y entrenamiento

El modelo base es `LiquidAI/LFM3-Omni-2B`, un modelo omni de la familia LFM3 de Liquid AI con pipeline any-to-any. La arquitectura exacta (número de capas, dimensiones, mecanismo de atención) no está detallada en la información disponible; la model card solo confirma que llama.cpp la identifica como `lfm3` y que el componente multimodal se exporta como un proyector independiente con 458 tensores que agrupa encoder de visión, encoder de audio, depthformer y códec de voz. El backbone de texto exportado en BF16 tiene 287 tensores.

Sobre el proceso de entrenamiento original (número de tokens, composición del dataset, uso de RLHF o DPO) no hay datos en la información proporcionada. Lo que sí está documentado es la modificación posterior: se aplicó abliteration mediante MPOA (ablación de dirección) para eliminar la dirección de rechazo del modelo base, y después se realizó la conversión a GGUF con `convert_hf_to_gguf.py` (`--outtype bf16` para el backbone, `--outtype f16 --mmproj` para el proyector). Las cuantizaciones Q8_0 y Q4_K_M se generaron con `llama-quantize` usando presets estándar, sin imatrix ni datos de calibración, por lo que son cuantizaciones directas del export BF16. El autor indica que el modelo es no razonador (non-reasoning) y que la verificación multimodal se hizo de extremo a extremo con `llama-mtmd-cli`.

## Capacidades

- Generación de texto conversacional multi-turno (pipeline `conversational`).
- Entrada de imagen: descripción y comprensión visual mediante el proyector multimodal.
- Entrada de audio: reconocimiento automático del habla (ASR), con ejemplo documentado en inglés.
- Salida de voz (speech output) a través del códec incluido en el proyector.
- Procesamiento any-to-any: combinaciones de texto, imagen, audio y vídeo como entrada (el ejemplo de la model card usa `--image`, aunque menciona vídeo en la descripción de uso).
- No dispone de modo de razonamiento: la model card indica `--reasoning off` para evitar que llama-server envuelva las respuestas.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; no se publica lista de idiomas.

## Casos de uso

- Transcripción de audio a texto en local: con `llama-mtmd-cli --audio archivo.wav` y el proyector F16, el modelo realiza ASR sin depender de servicios en la nube, lo que resulta adecuado para prototipos de dictado o subtitulado en máquinas sin GPU dedicada gracias al tamaño de 1 GB en Q4_K_M.
- Descripción de imágenes en dispositivos de borde: el par Q4_K_M + mmproj permite generar pies de foto o descripciones breves en portátiles y equipos con poca VRAM, útil para accesibilidad o indexación de imágenes.
- Investigación sobre alineación y seguridad: al ser un checkpoint abliterado, sirve como objeto de estudio para medir cómo cambia la tasa de rechazo y la calidad de respuesta tras eliminar la dirección de rechazo, comparándolo con el modelo base de Liquid AI.
- Experimentación con modelos omni pequeños: permite evaluar pipelines any-to-any (texto, imagen, audio y voz) en un solo modelo de 2B, útil para comparar latencia y calidad frente a arquitecturas especializadas.
- Asistente conversacional de voz para demos: combinando entrada de audio y salida de voz con el proyector, se puede montar un prototipo de asistente hablado en local mediante `llama-server` en el puerto 8080.
- Generación de texto controlada por secciones: dado que el modelo sostiene de forma fiable entre 800 y 2.000 caracteres por pasada, encaja en tareas de redacción de fragmentos cortos (resúmenes, respuestas, descripciones) generados sección a sección en lugar de documentos largos de una sola vez.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K ni de evaluaciones multimodales, y tampoco se aportan métricas de latencia o throughput medidas.

## Requisitos de hardware

- VRAM/RAM estimada: Q4_K_M ocupa aproximadamente 1,0 GiB y el proyector F16 unos 905,8 MiB, por lo que el conjunto multimodal ronda los 2 GB en memoria. Q8_0 ocupa aproximadamente 1,9 GiB y BF16 unos 3,2 GiB, a los que hay que sumar el proyector en cada caso.
- GPU recomendadas: no se especifican en la información disponible; por tamaño, cualquier GPU consumer con 4 GB o más de VRAM debería poder cargar la variante Q4_K_M con el proyector, aunque no hay confirmación del autor.
- Cabe en GPU de consumo: sí, previsiblemente en tarjetas de gama media y alta (RTX 3060, RTX 4060, RTX 4090, entre otras), dado el tamaño de los archivos; no hay pruebas publicadas que lo confirmen.
- Opciones de despliegue: llama.cpp con soporte LFM3 (build `b1-09338b8` o posterior; builds anteriores fallan con `unknown model architecture: 'lfm3'`). Herramientas concretas: `llama-cli` (solo texto), `llama-mtmd-cli` (multimodal) y `llama-server` (servidor HTTP en el puerto 8080). No se mencionan vLLM, TGI, Ollama ni otros motores.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidades | Licencia | Formato |
|---|---|---|---|---|---|
| LFM3-Omni-2B-Uncensored-abliterated (esta ficha) | ~1,73 B | no disponible | texto, imagen, audio, voz | LFM Open License v1.0 | GGUF (BF16, Q8_0, Q4_K_M) + proyector F16 |
| LiquidAI/LFM3-Omni-2B (modelo base) | ~1,73 B | no disponible | texto, imagen, audio, voz | LFM Open License v1.0 | safetensors |
| Alternativas de 2B omni comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación con otras familias omni de tamaño similar no puede completarse con la información proporcionada. La diferencia principal frente al modelo base es la eliminación de la dirección de rechazo y la disponibilidad de pesos GGUF listos para llama.cpp, no un cambio de arquitectura ni de tamaño.

## Limitaciones y advertencias

- Checkpoint abliterado: responde a peticiones que el modelo base rechaza y puede generar contenido inseguro o ilegal. El autor lo marca explícitamente como research-only y no apto para producción ni para uso de cara al consumidor.
- Riesgo de alucinación y de degradación en respuestas largas: con los valores por defecto de llama.cpp el modelo entra en bucles, deriva hacia código o colapsa en esquemas. El autor recomienda `--temp 1.0 --top-p 0.95 --repeat-penalty 1.3 --repeat-last-n 1024` y limitar cada pasada a entre 800 y 2.000 caracteres.
- Ventana de repetición por defecto demasiado corta (64 tokens) en llama.cpp, lo que provoca copia literal de párrafos si no se ajusta `--repeat-last-n`.
- Modelo no razonador: no hay modo de pensamiento ni cadena de razonamiento explícita; conviene desactivar el envoltorio de razonamiento en llama-server.
- Dependencia de una build reciente de llama.cpp con soporte `lfm3`; versiones anteriores no cargan el modelo.
- El backbone y el proyector son archivos separados: sin `--mmproj` el modelo es solo texto y pierde imagen, audio y voz.
- Idiomas soportados no documentados; el único ejemplo de ASR de la model card está en inglés.
- Licencia LFM Open License v1.0 con umbral de uso comercial: es necesario revisar sus términos antes de cualquier explotación comercial, y se aplican tanto al derivado como a los archivos GGUF.
- Conversión comunitaria no afiliada ni respaldada por Liquid AI; sin garantías de soporte.
- Sesgos conocidos: no documentados en la información disponible.

## Enlaces

- Repositorio GGUF: https://huggingface.co/NeosQ/LFM3-Omni-2B-Uncensored-abliterated.gguf
- Modelo base abliterado (safetensors): https://huggingface.co/NeosQ/LFM3-Omni-2B-Uncensored-abliterated
- Modelo original de Liquid AI: https://huggingface.co/LiquidAI/LFM3-Omni-2B
- README en chino: https://huggingface.co/NeosQ/LFM3-Omni-2B-Uncensored-abliterated.gguf/blob/main/README_zh.md
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Licencia LFM Open License v1.0: https://huggingface.co/NeosQ/LFM3-Omni-2B-Uncensored-abliterated.gguf/blob/main/LICENSE
