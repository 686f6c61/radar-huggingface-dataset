# nikolaus714/Inkling-2-Mini-GGUF

## Resumen

Inkling-2-Mini-GGUF es una cuantización Q4_K_M en formato GGUF del modelo Inkling 2 Mini, desarrollado originalmente por Thinking Machines. El modelo base es un mixture of experts (MoE) de 26.070.385.152 parámetros (26,4B) con una arquitectura denominada `inkling2_loop`, en la que las capas intermedias se ejecutan tres veces por token, y con capacidad de entrada de imagen (pipeline image-text-to-text). Esta distribución la publica el usuario nikolaus714 y está pensada para su uso con llama.cpp.

El paquete incluye dos ficheros: el modelo de lenguaje cuantizado (`Inkling-2-Mini-Q4_K_M.gguf`, 17,48 GB) y un proyector de visión separado en F16 (`mmproj-Inkling-2-Mini-F16.gguf`, 639 MB). La cuantización se realizó con `llama-quantize` a partir de un GGUF BF16 de ggml-org, que a su vez es un upcast del checkpoint original en precisión mixta NVFP4/MXFP8, no de un original en precisión completa. El proyector F16 procede de otra distribución (InterpreticAI) y no se genera en el paso de cuantización del modelo de lenguaje.

Su relevancia es doble: por un lado, permite ejecutar un MoE multimodal de 26,4B en hardware de consumo mediante cuantización de 4 bits; por otro, la arquitectura `inkling2_loop` requiere versiones recientes de llama.cpp (b12612 o superior). El autor advierte explícitamente de que la calidad de texto, la inferencia de imagen, el tool calling y el rendimiento de esta subida no han sido validados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of experts (MoE) con arquitectura `inkling2_loop`; las capas intermedias se ejecutan tres veces por token |
| Parametros totales | 26.070.385.152 (26,4B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (el ejemplo de llama.cpp usa `-c 4096`) |
| Tipos de cuantizacion | Q4_K_M (modelo de lenguaje); F16 (proyector de visión); el original es NVFP4/MXFP8 mixto |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |
| Vision | Sí, mediante proyector separado `mmproj-Inkling-2-Mini-F16.gguf` (639 MB) |
| Tamano del repo | 18,1 GB |
| Modelo base | thinkingmachines/Inkling-2-Mini |

## Arquitectura y entrenamiento

El modelo base es un mixture of experts con una innovación estructural denominada `inkling2_loop`: las capas intermedias de la red se recorren tres veces por cada token procesado, lo que incrementa la profundidad efectiva de cómputo sin aumentar proporcionalmente el número de parámetros. El total de parámetros es de 26,4B, aunque no se dispone del dato de parámetros activos por token. Incorpora un codificador de visión y un proyector para entrada image-text-to-text.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF, DPO u otras fases de alineación; esa información no aparece en la model card de esta distribución. La cuantización Q4_K_M se realizó sin importance matrix a partir de un GGUF BF16 de ggml-org (revisión `db61c5b492a6a034d986328d28274af0a439aa6c`), que es un upcast del checkpoint original en precisión mixta NVFP4/MXFP8, por lo que la cadena de conversión acumula dos pasos de pérdida potencial de precisión antes de la cuantización final a 4 bits.

## Capacidades

- Generación de texto conversacional (tag `conversational` en la ficha de Hugging Face).
- Entrada multimodal image-text-to-text: acepta imágenes junto con texto mediante el proyector de visión F16.
- Razonamiento y generación de texto en general, condicionados por la arquitectura MoE del modelo base.
- Compatibilidad con endpoints (`endpoints_compatible`).
- Soporte de plantillas de chat mediante `--jinja` en llama.cpp.
- Tool calling: no validado en esta distribución según el autor; el modelo base podría soportarlo, pero no hay confirmación.
- Capacidades de agente y razonamiento multi-paso: no disponibles en la información proporcionada.
- Idiomas soportados: no disponibles.

## Casos de uso

- Inferencia local de un MoE multimodal de 26,4B en estaciones de trabajo con GPU de consumo: gracias a la cuantización Q4_K_M (17,48 GB), es posible ejecutarlo con offload parcial en GPUs de 12-16 GB apoyándose en RAM del sistema, algo inviable con el checkpoint original en NVFP4/MXFP8.
- Asistente conversacional con entrada de imágenes en local: el par modelo + proyector permite adjuntar imágenes en `llama-server` y mantener diálogos multi-turno sin depender de APIs externas, útil para prototipos de privacidad.
- Procesamiento de documentación escaneada o capturas: al aceptar image-text-to-text, se puede usar para describir, resumir o extraer información de imágenes en pipelines internos, siempre que se valide la calidad (no verificada por el autor).
- Experimentación con arquitecturas looped MoE: investigadores pueden estudiar el comportamiento de `inkling2_loop` (tres pasadas por las capas intermedias) en un entorno GGUF reproducible con llama.cpp b12612.
- Despliegue de servidor HTTP compatible con OpenAI: `llama-server` expone un endpoint en el puerto 8080 que puede integrarse en aplicaciones existentes que consuman APIs compatibles.
- Evaluación comparativa de cuantizaciones: al existir otras distribuciones GGUF del mismo modelo base (ggml-org en BF16, InterpreticAI), sirve como referencia para medir la degradación de Q4_K_M frente a precisiones mayores.
- Desarrollo en Windows con CUDA: el autor documenta un flujo completo con binarios CUDA 12 de llama.cpp para Windows, lo que facilita entornos de desarrollo en esa plataforma.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que la calidad de texto, la inferencia de imagen, el tool calling y el rendimiento de esta subida no han sido validados.

## Requisitos de hardware

- VRAM estimada: el fichero del modelo de lenguaje ocupa 17,48 GB y el proyector 639 MB; se necesita además memoria para el contexto KV. Con `-c 4096` y `-ngl 99` se intenta cargar todo en GPU, pero una RTX 4070 de 12 GB no puede alojar los 17,48 GB completos.
- GPU recomendadas: para carga completa en VRAM, GPUs con 24 GB o más (RTX 4090, RTX 3090, A100, H100). Con GPUs de 12-16 GB (RTX 4070, RTX 4080) es necesario offload parcial y RAM del sistema suficiente para los pesos restantes, el contexto y el proyector.
- Cabe en consumer GPU: sí, con offload parcial en GPUs de 12 GB o más; con carga completa requiere GPUs de 24 GB.
- Opciones de despliegue: llama.cpp (versión b12612 o superior, con soporte `inkling2_loop`); `llama-server` para servidor HTTP. Ollama 0.40.17 solo soporta Inkling 2 Mini en Apple Silicon y en Windows devuelve `unknown model architecture: inkling2_loop`; la importación en futuras versiones de Ollama no está verificada.
- Latencia y throughput: no disponibles. Contextos mayores requieren más memoria según el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Inkling-2-Mini-GGUF (esta distribucion) | 26,4B (MoE) | no disponible | GGUF Q4_K_M + proyector F16 | Apache 2.0 | Vision, arquitectura `inkling2_loop` |
| ggml-org/Inkling-2-Mini-GGUF | 26,4B (MoE) | no disponible | GGUF BF16 | Apache 2.0 (modelo base) | Origen de la cuantizacion; mayor precision, mayor tamano |
| InterpreticAI/Inkling-2-Mini-GGUF | 26,4B (MoE) | no disponible | GGUF + proyector F16 | Apache 2.0 (modelo base) | Origen del proyector de vision usado aqui |
| thinkingmachines/Inkling-2-Mini | 26,4B (MoE) | no disponible | Checkpoint original NVFP4/MXFP8 mixto | Apache 2.0 | Modelo base oficial |

No se dispone de datos de rendimiento comparativo entre estas distribuciones ni frente a modelos de otras familias.

## Limitaciones y advertencias

- La cadena de conversión acumula pérdidas: original NVFP4/MXFP8 mixto, upcast a BF16, y cuantización Q4_K_M sin importance matrix. La calidad puede degradarse respecto al checkpoint original.
- El autor no ha validado la calidad de texto, la inferencia de imagen, el tool calling ni el rendimiento de esta subida concreta.
- Requiere llama.cpp b12612 o superior; versiones anteriores no reconocen la arquitectura `inkling2_loop`.
- Ollama en Windows no soporta esta arquitectura en la versión 0.40.17 (error `unknown model architecture: inkling2_loop`); en esa versión el soporte es solo para Apple Silicon.
- La longitud de contexto no está documentada; el ejemplo oficial usa 4096 tokens y contextos mayores incrementan el consumo de memoria.
- Idiomas soportados no documentados; no se puede garantizar un comportamiento multilingüe adecuado.
- Riesgo de alucinación y sesgos: no evaluados ni documentados en esta distribución; se remite a la model card original para usos previstos y limitaciones.
- Licencia Apache 2.0 permite uso comercial, pero conviene revisar la model card del modelo base para condiciones adicionales de uso previsto.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: distribución sin validación por parte de la comunidad.

## Enlaces

- Distribución en Hugging Face: https://huggingface.co/nikolaus714/Inkling-2-Mini-GGUF
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- GGUF BF16 de origen: https://huggingface.co/ggml-org/Inkling-2-Mini-GGUF (revisión `db61c5b492a6a034d986328d28274af0a439aa6c`)
- Proyector de visión de origen: https://huggingface.co/InterpreticAI/Inkling-2-Mini-GGUF (revisión `0aba1d7193f6bf28fd24c68b0628166f7e2ddbe8`)
- Release de llama.cpp b12612: https://github.com/ggml-org/llama.cpp/releases/tag/b12612
- Notas de la versión de Ollama 0.40.17: https://github.com/ollama/ollama/releases/tag/v0.40.17
