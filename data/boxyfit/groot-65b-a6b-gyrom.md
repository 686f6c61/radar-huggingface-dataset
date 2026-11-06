# BoxyFit/Groot-65B-A6B-GyroM

## Resumen

Groot-65B-A6B-GyroM es una requantización del modelo Groot-65B-A6B-261023, publicado por BoxyFit el 3 de noviembre de 2026. Se trata de un modelo de lenguaje de arquitectura Mixture of Experts (MoE) derivado de Qwen/Qwen3.8-Flash-Next, con 256 expertos en lugar de los 512 originales y un camino activo por token de aproximadamente 6.000 millones de parámetros. El modelo completo declara 116.514.464.640 parámetros en safetensors, aunque el autor lo comercializa bajo la etiqueta "65B-A6B" (65.000 millones totales, 6.000 millones activos).

La innovación principal de esta ficha no es el modelo base, sino el formato de cuantización: BoxyFit re-codifica los expertos enrutados con cuantización trellis TQ2_T (2,25 bits por peso) a partir del profesor FP8 oficial, mientras que el resto de tensores (tabla de búsqueda N-gram, pesos densos y embeddings) se copian byte a byte del GGUF Q4_K_M oficial. El resultado es un archivo de 54,5 GB que, según el autor, mantiene una calidad equivalente al Q4_K_M oficial en su conjunto de pruebas interno.

La relevancia de esta publicación radica en su estrategia de despliegue: separa la tabla de búsqueda N-gram (35,2 GB) a RAM de host, dejando solo el pool de expertos (16 GB) y los pesos densos (~1,5 GB) en VRAM. Según las mediciones del autor, esto permite ejecutar el modelo con 20,2 GB de VRAM en una RTX 3090 a 68-124 tokens/s, y con degradación controlada en tarjetas de 12 y 16 GB. El modelo requiere el motor Strata (no es compatible con llama.cpp estándar) y se distribuye bajo licencia qwen-community-1.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) derivada de Qwen3.8-Flash-Next; 256 expertos enrutados |
| Parametros totales | 116.514.464.640 (según safetensors); etiquetado comercial como 65B |
| Parametros activos | ~6B por token (10 expertos por token) |
| Longitud de contexto | 32.768 tokens (configuración de ejemplo con `--max-context 32768`) |
| Tipos de cuantizacion | TQ2_T (trellis, 2,25 bpw) para expertos enrutados; Q5_0 para tabla N-gram; Q4_K_M para pesos densos y embeddings |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 |
| Formato de pesos | GGUF (tipo trellis TQ2_T, id 144); requiere motor Strata, no compatible con llama.cpp upstream |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer MoE con 256 expertos enrutados, derivado de Qwen3.8-Flash-Next mediante poda de la tabla completa de expertos (de 512 a 256) manteniendo el mismo camino activo por token (~6B parámetros). El modelo base Groot-65B-A6B-261023 fue desarrollado por GrootTeam; esta ficha es una re-codificación de sus pesos, no un entrenamiento nuevo.

El proceso de cuantización de BoxyFit re-codifica únicamente los expertos enrutados a trellis TQ2_T (2,25 bpw) partiendo del profesor FP8 oficial, logrando una relación señal-error de 11,35 dB sobre tensores reales de expertos. El resto de componentes (tabla de búsqueda N-gram en Q5_0, pesos densos y embeddings en Q4_K_M) se copian literalmente del GGUF oficial, de modo que solo los expertos difieren del release original. No se dispone de información sobre el dataset de entrenamiento, número de tokens, ni si hubo RLHF o DPO en el modelo base.

La innovación técnica destacable es la separación de la tabla de búsqueda N-gram (35,2 GB) a RAM de host, con solo un 16% de ella accedida en uso real según el autor. El motor Strata dimensiona automáticamente el "hot tier" de expertos según la VRAM libre, y soporta decodificación especulativa (`--spec 4`) y cuantización KV (`--kv k8v4`).

## Capacidades

- Generación de texto conversacional y de propósito general (pipeline `text-generation`, tag `conversational`).
- Razonamiento, matemáticas, código y conocimiento: el autor reporta la misma puntuación (10/10) que el Q4_K_M oficial en su conjunto estándar de 10 preguntas que cubre estas áreas.
- Compatibilidad con endpoints (`endpoints_compatible` según tags).
- Capacidades multilingües: no disponibles (no se especifican idiomas).
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking, visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Despliegue de un MoE de ~6B activos en una única GPU de consumo: con 20,2 GB de VRAM en una RTX 3090 o 4090 se obtiene el pool completo de expertos residente y 68-124 tokens/s, lo que permite servir el modelo en estaciones de trabajo sin clúster.
- Inferencia en tarjetas de 12 GB (RTX 3060-12, Tesla P40): el motor dimensiona el hot tier a 6,0 GiB (39% del pool) con una tasa de acierto del 80-87% y tráfico PCIe casi nulo, manteniendo 62-95 tokens/s; adecuado para prototipado y desarrollo local.
- Servicio de chat con contexto de 32K: la configuración de ejemplo fija `--max-context 32768`, suficiente para conversaciones multi-turno largas o análisis de documentos extensos en un solo paso.
- Evaluación e investigación de cuantización trellis: el modelo sirve como banco de pruebas para comparar TQ2_T frente a Q4_K_M en el mismo hardware, dado que solo los expertos difieren entre ambas versiones.
- Generación de código y razonamiento asistido en local: al mantener la calidad del Q4_K_M en pruebas de matemáticas, código y razonamiento, puede integrarse en asistentes de programación autoalojados donde la privacidad impide usar APIs.
- Despliegue en entornos con RAM limitada y NVMe rápido: con 16 GB de RAM como mínimo práctico y 32 GB cómodos, el modelo es viable en servidores pequeños o mini-PC con almacenamiento NVMe, ya que la tabla N-gram se lee de forma dispersa.

## Benchmarks y rendimiento

El autor no publica resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible; indica que las pruebas largas están en ejecución y se añadirán a la model card y al leaderboard de boxy.fit. Los únicos datos reportados son internos:

| Metrica | Valor |
|---|---|
| Conjunto estándar interno (10 preguntas: matemáticas, código, razonamiento, conocimiento) | 10/10, igual que el Q4_K_M oficial en comparación lado a lado |
| Calidad de codificación (señal-error) | 11,35 dB a 2,25 bpw sobre tensores reales de expertos |
| Throughput en RTX 3090 (24 GB, hot tier completo) | 68-106 t/s contexto frío; 120-124 t/s con KV caliente |
| Throughput en 16 GB (hot tier 10,1 GiB, 65%) | 80-95 t/s |
| Throughput en 12 GB (hot tier 6,0 GiB, 39%) | 62-95 t/s |
| Throughput en 8 GB (hot tier ~2,5 GiB) | no medido; se espera degradación notable |

## Requisitos de hardware

- VRAM estimada: 20,2 GB en el caso totalmente residente (15,3 GiB de caché de expertos + ~5 GB de densos/KV/contexto), con 4 GB libres en una tarjeta de 24 GB.
- GPU recomendadas: RTX 3090, RTX 4090, A5000 (24 GB) para el pool completo; V100-16 y 2080 SUPER (16 GB) con hot tier al 65%; RTX 3060-12 y Tesla P40 (12 GB) con hot tier al 39%.
- Cabe en GPU de consumo: sí, desde 12 GB con degradación controlada; en 8 GB no se ha medido y se espera degradación notable.
- RAM de sistema: 32 GB funciona; 16 GB es el mínimo práctico; la tabla N-gram de 35,2 GB no necesita estar residente (solo se toca un 16% en uso real). Se requiere NVMe rápido.
- Opciones de despliegue: exclusivamente el motor Strata (>= 0.2.8 / engine 0.1.54, arquitectura CUDA 86+), con empaquetado previo mediante `tools/iq_pack.py --compat-bf16`. No es compatible con llama.cpp upstream, vLLM, TGI ni Ollama.
- Latencia y throughput: 68-124 t/s en 24 GB, 80-95 t/s en 16 GB, 62-95 t/s en 12 GB (medidos en RTX 3090 con límite de caché para emular tarjetas menores).

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Cuantizacion | Licencia | Motor |
|---|---|---|---|---|---|---|
| Groot-65B-A6B-GyroM (esta ficha) | 116,5B (etiquetado 65B) | ~6B | 32.768 | TQ2_T trellis + Q5_0 + Q4_K_M | qwen-community-1.0 | Strata |
| Groot-65B-A6B-261023 (oficial Q4_K_M) | 65B | ~6B | no disponible | Q4_K_M | qwen-community-1.0 | llama.cpp / GGUF estándar |
| Qwen3.8-Flash-Next (modelo raíz) | no disponible | no disponible | no disponible | FP8 y otras | qwen-community-1.0 | no disponible |

La comparación relevante es frente al GGUF Q4_K_M oficial del mismo modelo base: GyroM reduce el pool de expertos de forma que cabe residente en 24 GB (frente al streaming a 4 bits), mantiene la misma puntuación en el conjunto interno de 10 preguntas, pero exige el motor Strata y no funciona en el ecosistema llama.cpp estándar.

## Limitaciones y advertencias

- Requiere el motor Strata: upstream llama.cpp no puede cargar el tipo trellis TQ2_T (id 144); esto limita la portabilidad y la integración con herramientas estándar.
- La cuantización a 2,25 bpw introduce pérdida de calidad no caracterizada con benchmarks públicos; la equivalencia con Q4_K_M se basa en un conjunto interno de solo 10 preguntas.
- El rendimiento en tarjetas de 8 GB no se ha medido y el autor anticipa degradación notable.
- Dependencia de NVMe rápido y de al menos 16 GB de RAM; con menos, el acceso disperso a la tabla N-gram puede degradar la latencia.
- Idiomas soportados no especificados; no hay garantías documentadas sobre cobertura multilingüe.
- No se documentan capacidades de tool calling, agentes ni modo thinking, pese a que el modelo raíz podría soportarlas.
- Licencia qwen-community-1.0: es una licencia comunitaria con posibles restricciones de uso comercial; debe revisarse el texto antes de un despliegue en producción.
- Riesgo de alucinación y sesgos: no documentados en la información disponible; aplican los del modelo base Groot-65B-A6B y, en última instancia, los de Qwen3.8-Flash-Next.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema y validación externa inexistentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BoxyFit/Groot-65B-A6B-GyroM
- Modelo base: https://huggingface.co/GrootTeam/Groot-65B-A6B-261023
- Linaje arquitectónico: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Licencia qwen-community-1.0: https://huggingface.co/Qwen/Qwen3.8-Flash-Next/blob/main/LICENSE
- Motor Strata: https://github.com/Niko1221/Strata
- Leaderboard del autor: https://boxy.fit
