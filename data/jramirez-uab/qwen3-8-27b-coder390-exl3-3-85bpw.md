# JRamirez-UAB/Qwen3.8-27B-Coder390-EXL3-3.85bpw

## Resumen

Esta ficha describe una cuantizacion EXL3 del modelo `nerkyor/Qwen3.8-27B-Coder390-EfficientThink-Opus5.5-GPT6Astra-Grok4.7-DSV4Pro-K3-SFT-RLOO-MTP-DFlash2`, publicada por JRamirez-UAB (Universitat Autonoma de Barcelona). No es un modelo entrenado desde cero, sino una copia cuantizada a 3,85 bits por peso (bpw) del modelo base en BF16, cuyo objetivo es hacer viable el despliegue del contexto completo de 262.144 tokens, junto con la torre de vision y la decodificacion especulativa MTP, en una unica GPU de 24 GB (RTX 3090).

La relevancia practica esta en la compresion: el repositorio ocupa 14,6 GB y, segun la model card, permite servir 262k de contexto con vision y MTP de 3 tokens en hardware de consumo. La cuantizacion preserva la cabeza MTP y la torre de vision (6 bits), y usa embeddings de 8 bits (`emb8`), lo que mantiene las capacidades multimodales y de drafting del modelo original.

Conviene senalar una discrepancia importante entre metadatos y model card: el autor describe el modelo como "27B", pero el recuento real de parametros en safetensors es de 7.946.985.344 (aproximadamente 7,9 mil millones), coherente con un modelo de clase 8B. La cuantizacion es de tipo EXL3 y requiere una build de vLLM con soporte EXL3 (probada con vLLM 0.33 y el plugin quantpack 0.1.5, CUDA sm_86).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) con cabeza MTP para decodificacion especulativa; tag de arquitectura `qwen3_5` |
| Parametros totales | 7.946.985.344 (segun safetensors; el autor lo etiqueta como "27B") |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | EXL3 a 3,85 bpw; cabeza a 5 bits (H5); torre de vision a 6 bits (V6); embeddings a 8 bits (`emb8`) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (heredada del modelo base) |
| Formato de pesos | safetensors (EXL3), libreria `exllamav3` |

## Arquitectura y entrenamiento

El modelo base es un transformer multimodal de la familia Qwen 3.5 (tag `qwen3_5`) con pipeline `image-text-to-text`, es decir, acepta entradas de imagen y texto. Incluye una cabeza MTP (multi-token prediction) que se emplea para decodificacion especulativa, y una torre de vision que se conserva intacta en la cuantizacion. Esta ficha no contiene informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni las etapas de alineacion (RLHF/DPO) del modelo base; esos datos corresponden al autor original y no estan disponibles aqui.

La innovacion tecnica de este repositorio es exclusivamente la cuantizacion: pesos a 3,85 bpw con precisiones diferenciadas por componente (cabeza 5 bits, vision 6 bits, embeddings 8 bits) para maximizar la calidad retenida. El autor reporta divergencia KL frente a BF16 medida con `qbench` sobre tres trazas: KLD media 0,0105 en un conjunto publico mixto, 0,0136 en un conjunto propio y 0,0089 en una traza real de codificacion agentica (opencode); la perplejidad pasa de 1,341 a 1,357, de 1,574 a 1,601 y de 2,567 a 2,581 respectivamente. Como referencia, una build anterior a 3,5 bpw obtenia KLD media de 0,0198 en la traza propia.

## Capacidades

- Generacion de texto y razonamiento con modo de pensamiento (reasoning parser `qwen3`); el autor reporta 18/18 en pruebas de razonamiento con una mediana de 327 tokens de razonamiento.
- Generacion de codigo, incluida codificacion agentica (10/10 tareas agenticas reportadas) y "code games" con 42/48 puntos.
- Tool calling / function calling nativo (parser `qwen3_coder`), con 30/30 llamadas validas y correctas en la evaluacion del autor.
- Entrada multimodal de imagen y texto (pipeline `image-text-to-text`), con 15/15 en pruebas de vision.
- Decodificacion especulativa MTP con 3 tokens, integrada en el servidor vLLM.
- Manejo de contexto muy largo: needle-in-a-haystack 8/8 a 64k, 128k y 241k tokens.
- Capacidades multilingues: no disponible (no se especifican idiomas).
- Soporte de sesiones concurrentes: 8 sesiones paralelas de 30k tokens con 8/8 correctas y 972 tok/s de prefill agregado.

## Casos de uso

- Asistente de codigo en local sobre GPU de consumo: con 14,6 GB de pesos y KV cache en k8v4, cabe en una RTX 3090 de 24 GB y permite autocompletado, refactorizacion y explicacion de codigo sin depender de la nube.
- Agente de codificacion multi-paso: el soporte de tool calling (30/30 validas) y de tareas agenticas (10/10) permite integrarlo en bucles de tipo opencode que editan ficheros, ejecutan tests y consultan documentacion.
- Analisis de repositorios completos: los 262.144 tokens de contexto permiten cargar varios ficheros o un monorepo pequeno en una sola pasada, con needle 8/8 hasta 241k tokens.
- Procesamiento de documentos con imagenes: al conservar la torre de vision a 6 bits, puede hacer OCR, extraccion de tablas y respuesta sobre capturas o PDFs renderizados.
- Servicio de atencion tecnica con contexto largo: conversaciones multi-turno con historial extenso e imagenes adjuntas (capturas de error) en una sola GPU.
- Evaluacion y experimentation academica: el repositorio documenta KLD, PPL y throughput, lo que facilita reproducir estudios de cuantizacion en clusters universitarios (DCC-UAB).
- Despliegue de bajo coste en produccion: 86 tok/s en decodificacion con una peticion y 248 tok/s con cuatro peticiones concurrentes en una RTX 3090 permiten servir cargas moderadas sin GPUs de datacenter.

## Benchmarks y rendimiento

Resultados reportados por el autor en una RTX 3090 con vLLM 0.33, KV k8v4, MTP 3, contexto de 262k y vision activada:

| Prueba | Resultado |
|---|---|
| Decodificacion tok/s con 1 / 2 / 4 / 8 peticiones concurrentes | 86 / 141 / 248 / 235 |
| Tool calling | 30/30 validas y correctas |
| Razonamiento | 18/18 (mediana 327 tokens de razonamiento) |
| Vision | 15/15 |
| Needle a 64k / 128k / 241k | 8/8 · 8/8 · 8/8 |
| 8 sesiones paralelas de 30k tokens | 8/8, 972 tok/s de prefill agregado |
| Tareas agenticas | 10/10 |
| Code games | 42/48 puntos |

Calidad de cuantizacion (KLD frente a BF16, `qbench`):

| Traza | KLD media | KLD mediana | PPL (BF16 → cuantizado) |
|---|---|---|---|
| public | 0,0105 | 0,00053 | 1,341 → 1,357 |
| own | 0,0136 | 0,0031 | 1,574 → 1,601 |
| opencode | 0,0089 | 0,0030 | 2,567 → 2,581 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM: los pesos ocupan 14,6 GB; el autor reserva 8,5 GB de KV cache (`--kv-cache-memory-bytes 8500000000`) en k8v4 para el contexto completo de 262k.
- GPU recomendada segun el autor: una unica RTX 3090 de 24 GB (sm_86). GPU de datacenter (A100, H100) no estan documentadas para esta build, aunque deberian funcionar con la misma build de vLLM.
- Cabe en GPU de consumo: si, en RTX 3090 (24 GB); en tarjetas de 16 GB no cabria con el contexto completo y KV cache configurado por el autor.
- Despliegue: vLLM 0.33 con soporte EXL3 (plugin quantpack 0.1.5); la libreria `exllamav3` figura como libreria del repositorio. No se documenta soporte de llama.cpp, Ollama ni TGI para este formato.
- Throughput: 86 tok/s (1 peticion), 141 tok/s (2), 248 tok/s (4), 235 tok/s (8); prefill agregado de 972 tok/s con 8 sesiones de 30k tokens.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Este modelo (EXL3 3.85 bpw) | 7,9B (etiquetado 27B) | 262.144 | EXL3 3,85 bpw, vision 6 bits, MTP | Apache-2.0 | Requiere vLLM con EXL3; 14,6 GB |
| Modelo base BF16 (nerkyor/...) | no disponible | 262.144 | BF16 | Apache-2.0 | Referencia de calidad; no cabe en 24 GB con contexto completo |
| Build previa a 3,5 bpw del mismo modelo | no disponible | no disponible | EXL3 3,5 bpw | Apache-2.0 | KLD media 0,0198 en la traza propia (peor que 0,0136 de esta build) |

No se dispone de datos de benchmarks estandar ni de otros modelos comparables en la informacion proporcionada, por lo que no es posible una comparacion cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Discrepancia de tamano: el nombre indica "27B" pero el recuento real de safetensors es de 7,9B; conviene verificar antes de dimensionar infraestructura.
- Bucles de razonamiento: el autor advierte que, como el modelo base, puede entrar en bucles en el razonamiento a baja temperatura o con los valores por defecto del servidor (1 de 3 prompts largos alcanzo el limite de 8.000 tokens; en 30 prompts a T 0,6 / 0,8 / 1,0 se produjeron 8 / 4 / 0 bucles). Recomienda usar la generation config incluida (temperatura 1.0, top_p 0.95, top_k 20).
- Dependencia de software: requiere una build especifica de vLLM con soporte EXL3 (probada con 0.33 y quantpack 0.1.5); no hay soporte documentado en llama.cpp, Ollama o TGI.
- La tabla de embeddings de 8 bits solo se carga en vLLM; las mediciones de KLD se hicieron con embeddings BF16, por lo que la calidad en produccion puede diferir ligeramente.
- Riesgo de alucinacion y sesgos: no documentados por el autor; al ser una cuantizacion, hereda los del modelo base, sobre el que no hay informacion disponible en esta ficha.
- Idiomas: no se especifican; no se puede garantizar calidad multilingue.
- Licencia Apache-2.0 permite uso comercial, pero el credito y las condiciones del modelo base deben respetarse; este repositorio es solo una copia cuantizada.
- Modelo con muy poca traccion (12 descargas, 0 likes en el momento de la consulta) y publicacion reciente (noviembre de 2026): no hay validacion independiente de los resultados reportados.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/JRamirez-UAB/Qwen3.8-27B-Coder390-EXL3-3.85bpw
- Modelo base: https://huggingface.co/nerkyor/Qwen3.8-27B-Coder390-EfficientThink-Opus5.5-GPT6Astra-Grok4.7-DSV4Pro-K3-SFT-RLOO-MTP-DFlash2
- Libreria exllamav3: no disponible en la informacion proporcionada
- Paper, blog o demo adicionales: no disponible
