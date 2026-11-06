# datayoda/Raon-1-mini-preview-hipfire-MQ4

## Resumen

Raon-1-mini-preview-hipfire-MQ4 es una cuantización no oficial, en formato `.mq4` del motor **hipfire**, del modelo base KRAFTON/Raon-1-mini-preview, publicada por el usuario datayoda en Hugging Face. El modelo base es un híbrido de 28.8B de parámetros totales (4.3B activos) que combina capas de atención lineal tipo RDA (delta-rule) con capas MLA, más un MoE de 128 expertos con 6+1 activos, entrenado con una ventana de 262K tokens. Esta variante cuantizada busca reducir el tamaño del fichero (18,39 GB frente a los 19,69 GB del GGUF Q4_K_M oficial) manteniendo la fidelidad numérica al checkpoint original.

La relevancia de esta ficha no está tanto en el modelo en sí —que sigue siendo un checkpoint preview de KRAFTON y puede cambiar antes de la versión final— sino en el trabajo de ingeniería de verificación: el autor ha validado cada módulo contra el código fp32 del checkpoint (correlación 1.0000, error RMS relativo ≤ 0,01) y ha medido el acuerdo con el GGUF oficial (KL media 2,06, top-1 51,6 %). Es una construcción "nativa" para el motor hipfire en Rust, orientada a hardware AMD (ROCm, gfx1100), con un aviso honesto: hoy el motor hipfire ejecuta esta arquitectura mucho más lento que la rama llama.cpp de KRAFTON.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida: 25 capas (18 RDA de atención lineal con delta-rule + 7 MLA), MoE de 128 expertos (6+1 activos), mHC de 4 flujos residuales, SiTU-GLU |
| Parametros totales | 28.800 millones (28.8B) |
| Parametros activos | 4.300 millones (4.3B) |
| Longitud de contexto | 262.144 tokens (ventana de entrenamiento); 65.536 tokens verificados en carga y servicio en la GPU de prueba |
| Tipos de cuantizacion | hipfire MQ4 (MQ4G256 expertos enrutados a 4,25 bpw + clases Q8F16/BF16/F32) |
| Idiomas soportados | no disponible (el modelo base está etiquetado como coreano; tokenizer verificado en inglés, matemáticas y coreano) |
| Licencia | apache-2.0 |
| Formato de pesos | `.mq4` (formato nativo del motor hipfire; incompatible con llama.cpp principal) |

## Arquitectura y entrenamiento

La arquitectura es un híbrido de 25 capas: 18 capas RDA (recurrent delta attention), que implementan atención lineal mediante delta-rule con convolución corta y estado de decaimiento, y 7 capas MLA (multi-head latent attention) con caché paginada. El feed-forward es un MoE de 128 expertos con 6+1 expertos activos por token usando activación SiTU-GLU. El modelo incorpora además un esquema residual mHC de 4 flujos. No se ha publicado información sobre el dataset de entrenamiento, el número de tokens ni el uso de RLHF/DPO en la información disponible.

Sobre esta cuantización concreta: los pesos ocupan 17,13 GiB (fichero de 18,39 GB), con expertos enrutados cuantizados a 4,25 bits por peso (MQ4G256) y clases de precisión superior (Q8F16/BF16/F32) para embedding, mHC, normas, router y componentes MLA. La verificación se realizó por replay con entrada fijada contra el código de modelado fp32 del propio checkpoint. El tokenizer del motor replica el pre-tokenizador regex del checkpoint (que requiere look-around, no soportado por la crate `regex` estándar de Rust) mediante un emulador escrito a mano, verificado byte a byte en renders ChatML. Cabe destacar que el servicio requería un parche del motor (v0.4.2.1 fallaba con `stream must begin with gen_start`), contribuido upstream y archivado en el repositorio.

## Capacidades

- Generación de texto autorregresiva (ruta AR) con contrato de servicio compatible con OpenAI (`openai-compatible` según tags).
- Contexto largo: ventana entrenada de 262K tokens; cargas y servicio verificados hasta 65.536 tokens en una RX 7900 XT de 20 GB.
- Capacidades agenticas (etiquetado `agentic`); no se han publicado detalles de tool calling ni function calling en la información disponible.
- Soporte de coreano e inglés a nivel de tokenizer (verificado en renders ChatML); lista oficial de idiomas: no disponible.
- Razonamiento matemático básico verificado a nivel de tokenización; no hay datos de benchmarks de capacidad.
- No hay evidencia publicada de capacidades de visión, audio ni modo de pensamiento extendido.

## Casos de uso

- Prueba del ecosistema hipfire en GPU AMD: es el caso de uso principal declarado; sirve para validar el formato MQ4 y el motor Rust sobre ROCm (gfx1100) antes de la madurez del soporte Raon.
- Despliegue con restricción estricta de tamaño de fichero: con 18,39 GB cabe en tarjetas de 20 GB con contexto de 32K, útil donde el ancho de banda o el almacenamiento son limitados.
- Verificación numérica y auditoría de cuantizaciones: los datos de reproducibilidad (KL media 2,06, top-1 51,6 %, replay por módulo) permiten comparar cuantizaciones de forma rigurosa.
- Experimentación con arquitecturas híbridas de atención lineal: útil para investigadores que quieran ejecutar nativamente capas RDA + MLA + MoE sin rutas de emulación.
- Asistentes conversacionales en coreano e inglés con contexto largo, una vez el rendimiento del motor hipfire para Raon mejore (hoy se recomienda el GGUF oficial para uso productivo).
- Servidor local con API compatible con OpenAI: `hipfire serve` expone un endpoint en `127.0.0.1:8080` integrable en herramientas que hablen el protocolo de OpenAI.
- Desarrollo y depuración del motor: el parche `engine-serve-genstart.patch` incluido sirve como referencia para contribuir al soporte Raon en hipfire.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de capacidad (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Sí se han publicado mediciones de rendimiento de inferencia y de fidelidad de cuantización:

| Métrica | Valor |
|---|---|
| Acuerdo con GGUF Q4_K_M (KL media, 192 posiciones teacher-forced) | 2,0609 |
| Acuerdo top-1 con GGUF Q4_K_M | 51,56 % |
| Correlación por módulo vs fp32 del checkpoint | 1,0000 |
| Error RMS relativo por módulo | ≤ 0,01 |
| Prefill llama.cpp (Q4_K_M, pp512 → pp16384) | 2.055 → 1.141 tok/s |
| Prefill hipfire MQ4 (pp524 → pp8.234) | 12,6 → 6,3 tok/s |
| Decode llama.cpp (tg128) | 47,4 tok/s |
| Decode hipfire MQ4 (tg128) | 4,6 tok/s |
| Recall de aguja (2K/8K) | no recordado (degeneración de eco de prompt) |
| Sonda profunda oracle (26.962 tokens) | recordada |

La brecha de rendimiento (163–234× en prefill y ~10× en decode a favor de llama.cpp) se atribuye a la falta de kernels batched/chunked y de captura de grafos para la ruta Raon en hipfire, no al formato de cuantización.

## Requisitos de hardware

- VRAM estimada: 17,13 GiB de pesos; a 32K de contexto añadir ~1,06 GiB de KV (~34 KB/token), total ≈ 18,2 GiB residentes más activaciones.
- GPU verificada: AMD RX 7900 XT de 20 GB (gfx1100) con ROCm 7.1. Se necesita una tarjeta de clase 20 GiB.
- Cabe en GPUs consumer de 20 GB (RX 7900 XT/XTX); no cabe en tarjetas de 16 GB con contexto largo. No hay datos para NVIDIA.
- Contexto máximo verificado en esa tarjeta: 65.536 tokens (98.304 o más es rechazado).
- Despliegue: exclusivamente mediante el runtime hipfire (`hipfire serve raon-1-mini.mq4 --max-seq 32768`), con el parche de serve incluido en el repositorio. No compatible con llama.cpp principal ni con el GGUF de la rama KRAFTON. No hay soporte indicado para vLLM, Ollama o TGI.
- Rendimiento esperado en hipfire: decode ~4,6 tok/s y prefill de 12,6 a 6,3 tok/s según longitud; para uso rápido se recomienda el GGUF oficial en la rama llama.cpp de KRAFTON (47,4 tok/s de decode).

## Comparativa con modelos similares

| | Raon-1-mini-preview (MQ4 hipfire) | Raon-1-mini-preview (GGUF Q4_K_M oficial) |
|---|---|---|
| Parámetros | 28,8B totales / 4,3B activos | 28,8B totales / 4,3B activos |
| Tamaño del fichero | 18,39 GB | 19,69 GB |
| Formato | `.mq4` (hipfire) | GGUF |
| Runtime | hipfire (Rust, ROCm) | rama llama.cpp de KRAFTON |
| Decode medido (RX 7900 XT) | 4,6 tok/s | 47,4 tok/s |
| Acuerdo mutuo | KL media 2,06 / top-1 51,6 % | referencia (oracle) |
| Licencia | apache-2.0 | apache-2.0 |

No hay datos suficientes para comparar con otros modelos MoE híbridos de tamaño similar (por ejemplo Qwen3 o MiniMax) en la información disponible.

## Limitaciones y advertencias

- Es un cuantizado de un checkpoint **preview**: KRAFTON puede cambiar la arquitectura antes de la versión final, rompiendo la compatibilidad.
- Incompatible con llama.cpp principal; solo funciona con el runtime hipfire y requiere el parche de serve incluido (el motor stock v0.4.2.1 rechaza todas las generaciones).
- Rendimiento muy inferior al GGUF oficial en el motor hipfire actual (brecha de 10× en decode y más de 160× en prefill): no apto para producción hoy.
- El recall de aguja a 2K/8K falló (degeneración de eco de prompt), aunque una sonda profunda a ~27K tokens sí se recordó; la fiabilidad de recuperación de contexto largo no está garantizada.
- Sesgos conocidos: no disponible. Riesgo de alucinación: no disponible (no evaluado en la información proporcionada).
- Lista oficial de idiomas soportados: no disponible; el etiquetado sugiere foco en coreano.
- La licencia apache-2.0 permite uso comercial, pero aplica al modelo base y a esta cuantización; conviene verificar la ficha de KRAFTON para condiciones de la versión final.
- Descargas: 0; adopción y pruebas de terceros prácticamente inexistentes.

## Enlaces

- Ficha del modelo cuantizado: https://huggingface.co/datayoda/Raon-1-mini-preview-hipfire-MQ4
- Modelo base: https://huggingface.co/KRAFTON/Raon-1-mini-preview
- Motor hipfire: https://github.com/MunGress/hipfire
- Parche de serve incluido en el repositorio: `engine-serve-genstart.patch` (en la ficha del modelo)
- Paper, blog o demo: no disponible
