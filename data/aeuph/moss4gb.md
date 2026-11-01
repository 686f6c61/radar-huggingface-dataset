# AEUPH/moss4gb

## Resumen

MOSS4GB es una adaptación de cuantización del modelo de difusión texto-a-imagen MOSS-Image-SFT, desarrollado originalmente por OpenMOSS-Team y redistribuido por el usuario AEUPH. El objetivo del proyecto es hacer viable la inferencia de un transformer de difusión (DiT) de 5.080 millones de parámetros en tarjetas gráficas con solo 4 GB de VRAM, mediante cuantización NF4 de 4 bits sobre los pesos del DiT y la eliminación completa del codificador de texto Qwen3.5-9B (8.390 millones de parámetros, 16,78 GB en bf16) de la ruta de inferencia.

La innovación central no reside en un nuevo entrenamiento, sino en un rediseño del pipeline: el codificador de texto se sustituye por un banco de embeddings precalculados (prompt bank) que se genera una única vez en una máquina con más recursos y se importa en el equipo de bajos recursos. El DiT consume directamente tensores `prompt_embeds` de forma `[B, S, 4096]`, lo que permite prescindir del codificador en tiempo de ejecución. Con esta estrategia, el modelo ocupa unos 2,77 GB de VRAM residente (262 capas lineales en NF4, 7 en fp16) y la decodificación VAE se delega a CPU en fp32.

Es relevante ahora porque demuestra una vía práctica para ejecutar modelos de difusión de escala media en hardware consumer antiguo (el autor reporta mediciones en una GTX 1050 Ti, arquitectura Pascal sm_61), a costa de un proceso de generación de embeddings separado y de una calidad de condicionamiento limitada al banco de prompts precalculado. La licencia es Apache 2.0, lo que facilita su uso y modificación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusión (DiT) `MOSSImageTransformer`, con codificador de texto Qwen3.5-9B (eliminado en inferencia) y VAE |
| Parametros totales | 5.080 millones (DiT); 8.390 millones el codificador de texto (no residente en inferencia) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el DiT acepta `prompt_embeds` con `S >= 1`; el banco de prompts usa secuencias de ~17 tokens en el ejemplo del autor) |
| Tipos de cuantizacion | NF4 4 bits (bitsandbytes) para el DiT; fp16 y fp32 para el resto de componentes; el codificador admite carga en 8 bits para construir el banco |
| Idiomas soportados | No disponibles (el condicionamiento depende del codificador Qwen3.5-9B, pero no se documenta cobertura lingüística) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (repositorio de 2,8 GB); pesos del DiT y VAE descargados del repo upstream `OpenMOSS-Team/MOSS-Image-SFT` |

## Arquitectura y entrenamiento

El modelo es un transformer de difusión (DiT) de 5.080 millones de parámetros (10,16 GB en bf16) que opera sobre latentes y consume estados ocultos de un codificador de texto Qwen3.5-9B (8.390 millones de parámetros, 16,78 GB en bf16). El pipeline original `pipeline_moss_image.py` declara `_optional_components = ['text_encoder', 'tokenizer', 'vae']` y acepta `prompt_embeds: [B, S, 4096]` en lugar de cadenas de texto, lo que constituye la base técnica que permite la adaptación: la interfaz real del DiT son las salidas del codificador (unos 300 KB por embedding), no el codificador en sí.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el modelo original MOSS-Image-SFT. La adaptación MOSS4GB no reentrena el modelo: aplica cuantización NF4 con `compute_dtype=float16` sobre las capas lineales del DiT, mantiene 7 capas en fp16 y delega la decodificación VAE a CPU en fp32. El autor menciona como alternativa un transformer SFT con corrección de FP16 de KBlueLeaf, cuyo reescalado de residuos está pensado para tarjetas sin soporte bf16 como Pascal. El banco de prompts se construye con el codificador Qwen3.5-9B una sola vez, usando una plantilla de chat `qwen35_chat_template.jinja` adjunta automáticamente (el tokenizer del repo no incluye plantilla de chat propia).

## Capacidades

- Generación de imágenes texto-a-imagen condicionada por embeddings precalculados de un codificador Qwen3.5-9B.
- Ejecución en GPUs de 4 GB de VRAM mediante cuantización NF4 del DiT.
- Decodificación VAE en CPU, lo que libera VRAM para el DiT.
- Generación determinista: con semilla y condicionamiento constantes, la salida es idéntica byte a byte.
- Soporte de CFG (classifier-free guidance) con valores configurables (`--cfg 1` o `--cfg 3`), con doble forward por paso cuando `--cfg 3`.
- Control de resolución mediante `--height` y `--width`, que deben ser múltiplos de 16.
- Banco de prompts reutilizable: entradas de ~4 MB fp16 por cada 500 tokens, importables y consultables por identificador.
- Modo `bank null` para validación de VRAM, velocidad y corrección de la decodificación VAE sin condicionamiento real.
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo thinking.

## Casos de uso

- Experimentación en hardware legacy: ejecutar un DiT de 5B en una GTX 1050 Ti o tarjetas similares de 4 GB para validar pipelines de difusión sin adquirir GPU nueva. El autor reporta 2,91 s/paso a 256x256 con cfg 1 y 2,90 GB de VRAM pico.
- Prototipado de interfaces texto-a-imagen con latencia tolerable: renderizar a 256x256 con 20 pasos y cfg 3 en unos 4,5 minutos de muestreo, adecuado para demos offline o generación por lotes nocturna.
- Validación de cuantización: comparar la salida del pipeline cuantizado con la del pipeline upstream (el autor reporta una diferencia absoluta máxima de 0,0 en la decodificación VAE), útil para investigar técnicas de compresión.
- Generación por lotes con banco de prompts fijo: precalcular embeddings de un conjunto cerrado de prompts (personajes, estilos, escenas recurrentes) en una máquina con ~12 GB de VRAM libre y reutilizarlos en el equipo de 4 GB, reduciendo el coste por imagen.
- Educación y docencia: ilustrar el funcionamiento de un DiT y de la cuantización NF4 en un entorno de recursos limitados, con comandos reproducibles y salidas deterministas.
- Investigación en decodificación VAE en CPU: medir el coste de decodificar a 256x256 (7,8-28,5 s) y 512x512 (51,6 s) en CPU frente a GPU, útil para diseñar pipelines híbridos.
- Pruebas de integración continua: verificar que un pipeline de difusión arranca, carga pesos y produce tensores válidos en un runner con GPU modesta, usando el banco nulo como smoke test.

## Benchmarks y rendimiento

El autor publica mediciones en una GTX 1050 Ti (4 GB, sm_61, Windows), no benchmarks de calidad estándar (MMLU, FID, CLIP score, etc.).

| Metrica | Valor |
|---|---|
| Carga del DiT (streaming desde disco) | 349-513 s (limitado por E/S) |
| VRAM residente | 2,77 GB (262 capas lineales NF4, 7 fp16, 5,08 B parámetros) |
| 256x256, cfg 1 | 2,91 s/paso |
| 256x256, cfg 3 (dos forwards por paso) | 13,8 s/paso |
| VRAM pico a 256x256 | 2,90 GB |
| Decodificación VAE 256x256 en CPU | 7,8-28,5 s |
| Decodificación VAE 512x512 en CPU | 51,6 s |
| Diferencia frente al pipeline upstream (decodificación) | 0,0 (máx. absoluta) |
| RSS pico del cargador | ~6,8 GB |

No se han publicado resultados de benchmarks de calidad (FID, CLIP, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: ~2,77 GB residentes y 2,90 GB pico a 256x256 con el DiT en NF4. A 512x512 queda muy poco margen libre.
- GPU recomendadas: el autor valida en GTX 1050 Ti (4 GB, Pascal). Cualquier GPU con 4 GB o más debería funcionar; con 8 GB o más se puede ampliar resolución y usar cfg 3 con holgura.
- Cabe en GPU consumer: sí, en tarjetas de 4 GB como la 1050 Ti. A 1024x1024 no es viable según el autor.
- Opciones de despliegue: el paquete `moss4gb` sobre `diffusers>=0.38`, `bitsandbytes>=0.49`, `transformers>=5.3`, `torch` y `safetensors`. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican a un pipeline de difusión en este formato).
- Construcción del banco de prompts: requiere el codificador Qwen3.5-9B, unos 20 GB de RAM o ~12 GB de VRAM libre, y 17 GB de disco; no cabe en la máquina objetivo de 4 GB/16 GB.
- Latencia: 20 pasos a 256x256 con cfg 3 equivalen a unos 4,5 minutos de muestreo más el tiempo de carga (349-513 s la primera vez; ~1 minuto con la caché NF4 en `<model-dir>/.moss4gb-cache/`).
- Memoria del sistema: el cargador hace streaming y nunca materializa el modelo fp16 completo; RSS pico en torno a 6,8 GB.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparables en la información proporcionada. Se ofrece una comparación estructural con el modelo upstream y con la variante FP16 corregida mencionada por el autor.

| Modelo | Parametros DiT | Codificador en inferencia | Cuantizacion | VRAM estimada | Licencia |
|---|---|---|---|---|---|
| MOSS4GB (AEUPH) | 5,08 B | No (banco de embeddings) | NF4 4 bits | ~2,77 GB | Apache 2.0 |
| MOSS-Image-SFT (OpenMOSS-Team) | 5,08 B | Sí (Qwen3.5-9B, 8,39 B) | bf16 | No disponible (requiere >16 GB por el codificador) | No disponible en la información |
| SFT transformer FP16-fixed (KBlueLeaf) | No disponible | No disponible | fp16 con reescalado de residuos | No disponible | No disponible |

## Limitaciones y advertencias

- El condicionamiento por texto requiere un banco de embeddings precalculado; no se puede introducir un prompt nuevo en el equipo de 4 GB sin pasar por una máquina con más recursos.
- La calidad de la generación depende de la cobertura del banco de prompts; prompts fuera del banco no son utilizables directamente.
- A 512x512 solo quedan unos cientos de MB libres con el DiT residente y puede paginar si hay otras aplicaciones abiertas; 1024x1024 está fuera de alcance.
- En Pascal no hay bf16: los pesos se convierten a fp16 y se cuantizan a NF4 con `compute_dtype=float16`; si aparecen NaN o salida negra, hay que reintentar con `--compute-dtype float32` (aproximadamente el doble de lento) o usar el transformer FP16-fixed de KBlueLeaf.
- El banco nulo produce ruido estructurado sin condicionamiento real; sirve para validar VRAM y VAE, no para juzgar calidad.
- Los tiempos de carga inicial son elevados (349-513 s) por E/S de disco; conviene mantener un proceso caliente y usar la caché NF4.
- No se documentan sesgos, cobertura lingüística ni tasas de alucinación del modelo original; al ser un modelo de imagen, el riesgo relevante es la generación de contenido inapropiado o sesgado según los datos de entrenamiento de MOSS-Image-SFT, no documentados aquí.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base upstream debe verificarse por separado; su licencia no se detalla en la información disponible.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; es un artefacto reciente y poco validado por la comunidad.
- La plantilla de chat `qwen35_chat_template.jinja` es obligatoria para construir el banco; sustituirla altera los tokens con los que fue entrenado el DiT.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AEUPH/moss4gb
- Modelo base upstream: https://huggingface.co/OpenMOSS-Team/MOSS-Image-SFT
- Runbook de construcción del banco: `docs/BUILD_BANK_GPU.md` (incluido en el repositorio del modelo)
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información proporcionada.
