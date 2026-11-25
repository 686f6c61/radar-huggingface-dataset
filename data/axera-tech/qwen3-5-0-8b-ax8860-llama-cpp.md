# AXERA-TECH/Qwen3.5-0.8B-AX8860-llama.cpp

## Resumen
Qwen3.5-0.8B-AX8860-llama.cpp es una distribucion empaquetada del modelo Qwen3.5-0.8B de Alibaba Qwen, preparada por AXERA-TECH para ejecutarse sobre la NPU del SoC Axera AX8860 mediante una bifurcacion de llama.cpp con backend ggml-axera. El repositorio no contiene un modelo nuevo: aporta los pesos cuantizados en GGUF (q8_0), el codificador visual en bf16, los binarios estaticos para la placa, los kernels de NPU y los scripts de ejecucion y benchmark. Su interes practico es que demuestra inferencia local multimodal (texto e imagen) con servidor compatible con la API de OpenAI sobre hardware de borde de bajo consumo.

El modelo base es un transformer denso de unos 772,8 millones de parametros (0,8B), con ventana de contexto configurada hasta 16384 tokens en esta distribucion y capacidad de entrada de imagen gracias al proyector multimodal empaquetado aparte. El rendimiento reportado por el autor en el AX8860 es de 144,6 tokens/s en decodificacion y unos 11665 tokens/s en prefill de 4k, cifras que lo sitúan como una opcion viable para asistentes embebidos, procesamiento de documentos en el dispositivo y agentes ligeros sin dependencia de la nube.

La relevancia actual reside en la combinacion de tres factores: un modelo pequeno con vision, un runtime estandar (llama.cpp) y un backend especifico de NPU que libera a la CPU. No obstante, la ficha debe leerse con cautela: la model card no declara licencia, idiomas ni resultados de benchmarks de calidad, y el repositorio esta atado al hardware AX8860 con SDK V0.5.1 o superior.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Qwen3.5-0.8B); runtime llama.cpp con backend ggml-axera para NPU |
| Parametros totales | 772.845.888 (0,77B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | hasta 16384 tokens (configurado en esta distribucion) |
| Tipos de cuantizacion | q8_0 para pesos; bf16 para el codificador visual (mmproj) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (qwen3.5-0.8b-q8_0.gguf, 0,83 GB; mmproj-qwen3.5-0.8b-bf16.gguf, 0,21 GB) |

## Arquitectura y entrenamiento
El modelo subyacente es Qwen3.5-0.8B, un transformer denso de la familia Qwen3.5 de Alibaba Qwen, con aproximadamente 772,8 millones de parametros. Esta distribucion no reentrena ni modifica los pesos: los serializa en GGUF q8_0 y anade un proyector multimodal en bf16 que habilita la entrada de imagen. El runtime es una bifurcacion de llama.cpp (rama `axera-dev` del repositorio ZHEQIUSHUI/llama.cpp, commit `6613735ce`) con kernels compilados para la NPU del AX8860, empaquetados en `kernels/` junto a un `manifest.json`.

No se dispone de informacion sobre el corpus de entrenamiento, el numero de tokens, la composicion del dataset ni las etapas de alineacion (RLHF, DPO) del modelo base en la informacion proporcionada. La innovacion tecnica destacable de este paquete es la ejecucion del grafo ggml sobre la NPU del SoC con cuatro nucleos dedicados, un cache de prompt en memoria de 4 GB (ampliable a disco via `CACHE_DIR`) y un servidor compatible con OpenAI que admite mensajes de sistema a mitad de conversacion y desactiva el modo de razonamiento por defecto (`--reasoning off`).

## Capacidades
- Generacion de texto conversacional y completado de texto con decodificacion greedy o muestreo configurable.
- Entrada de imagen: descripcion de escenas, vehiculos, personas y texto en imagenes mediante el codificador visual empaquetado.
- Servidor compatible con la API de OpenAI (`run.sh -s 8080`), lo que permite integrarlo con clientes y SDKs existentes.
- Soporte de agentes: acepta mensajes de sistema intercalados en la conversacion, probado con clientes como Codex.
- Cache de prompt persistente en memoria (4 GB) o en disco SSD para acelerar peticiones repetidas.
- Modo de razonamiento desactivable; por defecto el servidor no activa thinking.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Tool calling / function calling: no disponible en la informacion proporcionada.

## Casos de uso
- Asistente conversacional en el dispositivo: el servidor OpenAI-compatible con contexto de hasta 16384 tokens permite mantener dialogos multi-turno en el propio AX8860, sin enviar datos a la nube, util en entornos con requisitos de privacidad.
- Descripcion y clasificacion de imagenes en borde: con el mmproj bf16 y prefill de 4k a 11665 tokens/s, se pueden procesar capturas de camara y generar descripciones en tiempo casi real.
- Digitalizacion de documentos con OCR asistido: el modelo reconoce texto en imagenes (validado por el autor con descripciones de texto) y puede estructurar el contenido en un pipeline local.
- Agente ligero multi-paso: su compatibilidad con mensajes de sistema intermedios y clientes tipo Codex permite orquestar tareas de automatizacion sencillas sobre la placa.
- Backend de bajo consumo para demos y prototipos: 144,6 tokens/s de decode y 0,83 GB de pesos permiten iterar rapidamente en hardware de borde sin GPU.
- Servicio local de completado de texto para herramientas internas: el binario estatico y los scripts `run.sh`/`bench.sh` facilitan el despliegue reproducible en flotas de dispositivos AX8860.
- Evaluacion de cuantizacion q8_0 en NPU: util para investigadores que comparan latencia y calidad frente a ejecucion en CPU/GPU con llama.cpp estandar.

## Benchmarks y rendimiento

| Metrica | Valor reportado |
|---|---|
| Decode (tokens/s) | 144,6 |
| Prefill 4k (tokens/s) | 11665 (3908 tokens en 0,34 s) |
| Decode con prompt 3908 tokens, `-c 8192` | 132,8 tokens/s |
| Decode con prompt 3908 tokens, `-c 16384` | 132,7 tokens/s |
| Decode con muestreo recomendado, 3908 tokens | 130,1 tokens/s |
| Prompt 5 tokens, `-c 8192` | 0,04 s (solo tiempo) |
| Prompt 47 tokens, `-c 8192` | 0,06 s (solo tiempo) |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware
- Hardware obligatorio: SoC Axera AX8860 con SDK V0.5.1 o superior; el runtime consume los 4 nucleos de NPU en exclusiva.
- VRAM: no aplica en el sentido de GPU; los pesos ocupan 0,83 GB (q8_0) y el codificador visual 0,21 GB (bf16), residentes en la memoria del sistema/NPU.
- Memoria de host: el cache de prompt usa por defecto 4 GB de RAM; configurable a disco con `CACHE_DIR`.
- GPU: no se requiere GPU; no hay soporte documentado para A100, H100 o RTX 4090 en este paquete.
- Consumer GPU: no aplica; el paquete esta atado al hardware AX8860.
- Opciones de despliegue: llama.cpp con backend ggml-axera (binarios estaticos en `bin/`), servidor compatible con OpenAI en el puerto indicado (`-s 8080`), scripts `run.sh` y `bench.sh`. No se documenta vLLM, TGI ni Ollama.
- Latencia y throughput: decode 144,6 tokens/s; prefill 4k 11665 tokens/s; en prompts de 3908 tokens el decode baja a ~130-133 tokens/s.
- Nota operativa: en algunos entornos, peticiones consecutivas fallan con `ret = -3` y requieren reintento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Despliegue |
|---|---|---|---|---|---|
| Qwen3.5-0.8B-AX8860-llama.cpp | 0,77B | 16384 | Si (mmproj bf16) | no disponible | NPU AX8860 (llama.cpp) |
| Qwen3.5-0.8B (base) | 0,77B | no disponible | no disponible | no disponible | CPU/GPU (llama.cpp, transformers) |
| Otros modelos ~0,5-1B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks de calidad ni de especificaciones de alternativas comparables en la informacion proporcionada, por lo que la comparativa se limita a parametros, contexto y soporte de vision.

## Limitaciones y advertencias
- Dependencia total del hardware Axera AX8860 y del SDK V0.5.1+; no es ejecutable en GPU o CPU convencionales con este paquete.
- Licencia no declarada: no se puede confirmar el uso comercial; verificar la licencia del modelo base Qwen3.5-0.8B antes de desplegar.
- Idiomas soportados no documentados; no se garantiza calidad multilingue.
- No hay resultados de benchmarks de calidad publicados; el rendimiento reportado es solo de velocidad.
- Riesgo de alucinacion inherente a un modelo de 0,8B; validar salidas en produccion.
- Fallo intermitente `ret = -3` en peticiones consecutivas; requiere logica de reintento.
- El modo de razonamiento esta desactivado por defecto en el servidor; el comportamiento con thinking activado no esta documentado.
- El cache de prompt en memoria consume 4 GB; en dispositivos con poca RAM puede ser necesario usar `CACHE_DIR` en SSD.
- La NPU se reserva en exclusiva (4 nucleos), lo que impide compartir el acelerador con otras cargas.

## Enlaces
- Repositorio Hugging Face: https://huggingface.co/AXERA-TECH/Qwen3.5-0.8B-AX8860-llama.cpp
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Bifurcacion de llama.cpp usada: https://github.com/ZHEQIUSHUI/llama.cpp (rama `axera-dev`, commit `6613735ce`)
- Repositorio oficial de llama.cpp: https://github.com/ggml-org/llama.cpp
