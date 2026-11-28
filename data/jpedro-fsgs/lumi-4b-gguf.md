# jpedro-fsgs/lumi-4b-GGUF

## Resumen

Lumi-4B es un modelo de lenguaje de aproximadamente 4.000 millones de parámetros (3.973.556.832 exactamente) especializado en portugués de Brasil, desarrollado por el equipo de procesamiento de lenguaje natural del CEIA/UFG. Parte del NVIDIA Nemotron 3 Nano 4B, un modelo de arquitectura híbrida Mamba2/Transformer, sobre el que se aplicaron preentrenamiento continuado, destilación de conocimiento y ajuste fino supervisado. Esta ficha cubre la versión cuantizada en GGUF publicada por jpedro-fsgs, pensada para ejecutarse con llama.cpp tanto en CPU como en GPU.

La relevancia de esta publicación es doble. Por un lado, ofrece una alternativa abierta y ligera para tareas de generación de texto en portugués brasileño, un idioma con menos representación en el ecosistema de modelos abiertos que el inglés. Por otro, su empaquetado en GGUF con la cuantización Q4_K_M (2,84 GB) reduce los requisitos de hardware hasta hacer viable la inferencia en equipos de consumo.

El modelo declara una longitud de contexto máxima de 262.144 tokens, heredada del modelo original, aunque en la práctica el autor recomienda limitar el contexto con el parámetro `-c` de llama.cpp para evitar reservar cerca de 8 GB de RAM. El template de chat está embebido en el GGUF con el modo de razonamiento (thinking) desactivado de forma forzada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida Mamba2/Transformer (familia Nemotron H) |
| Parametros totales | 3.973.556.832 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens (declarada) |
| Tipos de cuantizacion | Q4_K_M (única publicada en este repo) |
| Idiomas soportados | Portugués (pt, portugués de Brasil) e inglés (en) |
| Licencia | NVIDIA Nemotron Open Model License |
| Formato de pesos | GGUF (repo); BF16 en el modelo base ceia-research/lumi-4b |

## Arquitectura y entrenamiento

El modelo base Lumi-4B emplea la arquitectura híbrida Mamba2/Transformer de NVIDIA Nemotron 3 Nano 4B, que combina capas de espacio de estados (Mamba2) con capas de atención Transformer. Sobre esa base, el equipo del CEIA/UFG aplicó un pipeline de tres etapas: preentrenamiento continuado, destilación de conocimiento y ajuste fino supervisado. La model card remite al card del modelo original para los detalles de datos de entrenamiento y benchmarks, que no se reproducen en esta versión cuantizada.

Esta publicación concreta es una conversión a GGUF generada con `convert_hf_to_gguf.py --outtype bf16` (commit `ad5cbfa` de llama.cpp) a partir de la revisión `27b30f4` del modelo base (Lumi-4B v0.2), seguida de una cuantización Q4_K_M con `llama-quantize` sin imatrix. Se modificó el template de chat para fijar el prompt de generación en `<|im_start|>assistant\n`, eliminando la rama `enable_thinking`, y se corrigieron metadatos: `nemotron_h.context_length` pasó de 1.048.576 a 262.144 y `general.name` se fijó como `Lumi 4B`. Los tensores no se alteraron respecto a la conversión.

## Capacidades

- Generación de texto conversacional en portugués de Brasil e inglés.
- Razonamiento multi-turno dentro de la ventana de contexto declarada.
- Salida estructurada mediante `response_format` con `json_schema` en llama-server.
- Compatibilidad con la API de llama.cpp con formato compatible con OpenAI (`endpoints_compatible`).
- Modo thinking presente en el template pero desactivado de forma forzada en esta versión.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponibles.
- Capacidades de agente y razonamiento multi-paso autónomo: no disponibles en la información proporcionada.

## Casos de uso

- Asistente conversacional en portugués brasileño: el modelo puede mantener diálogos multi-turno con contexto amplio (hasta 262.144 tokens declarados) y está ajustado específicamente para pt-BR, lo que lo hace adecuado para atención al usuario en ese idioma.
- Despliegue en hardware de consumo: con la cuantización Q4_K_M (2,84 GB) puede ejecutarse en CPU o en GPU de gama media mediante llama.cpp, lo que permite prototipar asistentes locales sin infraestructura dedicada.
- Generación de contenido estructurado: gracias al soporte de `response_format` con `json_schema` en llama-server, puede integrarse en pipelines que requieran salidas JSON validadas, como extracción de datos o generación de formularios.
- Procesamiento de documentos largos en portugués: la ventana de contexto declarada permite resumir o analizar contratos, informes o artículos extensos en pt-BR, limitando el contexto con `-c` según la memoria disponible.
- Servicio de inferencia autoalojado: llama-server expone una API compatible con OpenAI, lo que facilita sustituir llamadas a APIs comerciales en aplicaciones existentes sin reescribir el cliente.
- Investigación en PLN para portugués: al ser un modelo abierto derivado de Nemotron, sirve como base para experimentos de ajuste fino, evaluación de sesgos o comparación de técnicas de cuantización en un idioma menos cubierto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM para inferencia: el archivo Q4_K_M ocupa 2,84 GB; con overhead de llama.cpp se recomienda al menos 4 GB de memoria disponible.
- Memoria de contexto: sin `-c`, llama.cpp reserva el contexto completo (262.144 tokens), lo que consume cerca de 8 GB de RAM adicionales. Se recomienda fijar `-c 8192` u otro valor menor.
- GPU recomendadas: no se especifican en la información disponible. Por tamaño, cabe holgadamente en GPUs de consumo con 8 GB o más (por ejemplo, RTX 3060/4060 y superiores), aunque el autor no confirma modelos concretos.
- CPU: viable, ya que el formato GGUF está pensado para inferencia en CPU.
- Opciones de despliegue: llama.cpp (`llama-server`, `llama-cli`) con `--jinja` y `--reasoning off`. No se mencionan vLLM, TGI u Ollama en la información proporcionada.
- Dependencia del sistema: los binarios precompilados de llama.cpp para Linux requieren `libgomp.so.1` (paquete `libgomp1` en Debian/Ubuntu, `libgomp` en Fedora/RHEL).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Lumi-4B GGUF (esta ficha) | ~3,97 B | 262.144 | pt, en | NVIDIA Nemotron Open Model License | GGUF Q4_K_M |
| ceia-research/lumi-4b (base) | ~3,97 B | 262.144 | pt, en | NVIDIA Nemotron Open Model License | BF16 (safetensors) |
| NVIDIA Nemotron 3 Nano 4B | ~4 B | no disponible en esta ficha | no disponible en esta ficha | NVIDIA Nemotron Open Model License | BF16 |

No se dispone de datos de benchmarks ni de modelos alternativos comparables en la información proporcionada; la comparación se limita a variantes del mismo linaje.

## Limitaciones y advertencias

- El modo thinking no debe usarse: el template embebido cierra el bloque `` en cada respuesta, por lo que el razonamiento queda desactivado incluso si la petición envía `enable_thinking: true`.
- Solo se publica una cuantización (Q4_K_M); no hay opciones de mayor o menor precisión en este repositorio.
- El contexto declarado de 262.144 tokens puede agotar la memoria si no se limita con `-c`; el propio autor advierte del consumo de aproximadamente 8 GB de RAM con el contexto completo.
- Cobertura lingüística limitada a portugués e inglés; el rendimiento en otros idiomas no está documentado.
- Riesgo de alucinación y sesgos: no se documentan en la información disponible, pero son inherentes a modelos de este tamaño y deben evaluarse antes de un uso en producción.
- Licencia NVIDIA Nemotron Open Model License: es una licencia "other" con condiciones específicas; es imprescindible revisar el texto completo antes de un uso comercial.
- El modelo deriva de Nemotron 3 Nano 4B, por lo que hereda las obligaciones de atribución de la licencia original ("Licensed by NVIDIA Corporation under the NVIDIA Nemotron Open Model License").
- La conversión se realizó con transformers 4.57 usando `PreTrainedTokenizerFast`, mientras que el `tokenizer_config.json` original declara `TokenizersBackend` (transformers 5); el vocabulario y los tokens especiales son idénticos, pero conviene verificar la tokenización en integraciones personalizadas.
- No hay datos publicados de benchmarks en esta versión cuantizada, por lo que la degradación respecto al BF16 no está cuantificada.

## Enlaces

- Repositorio GGUF: https://huggingface.co/jpedro-fsgs/lumi-4b-GGUF
- Modelo base Lumi-4B: https://huggingface.co/ceia-research/lumi-4b
- Revisión del modelo base usada: https://huggingface.co/ceia-research/lumi-4b/tree/27b30f40b930fd05cee5e1c1f8790f70fa5b816d
- NVIDIA Nemotron 3 Nano 4B BF16: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Licencia NVIDIA Nemotron Open Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-nemotron-open-model-license/
