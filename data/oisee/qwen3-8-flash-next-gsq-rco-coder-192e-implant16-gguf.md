# oisee/Qwen3.8-Flash-Next-GSQ-RCO-Coder-192E-implant16-GGUF

## Resumen

Qwen3.8-Flash-Next-GSQ-RCO-Coder-192E-implant16-GGUF es una versión comunitaria, creada por el usuario oisee, del modelo GSQ-RCO-Coder de ISTA-DASLab, que a su vez deriva del modelo base Qwen3.8-Flash-Next. Se trata de un modelo de lenguaje con arquitectura mixture-of-experts (MoE) sometido a un proceso agresivo de poda de expertos, reduciendo de 512 expertos enrutados originales a 192 ranuras de experto por capa, con el objetivo de ejecutar cargas de trabajo de codificación agéntica (Claude Code sobre repositorios ABAP/Go/TypeScript) íntegramente en la VRAM de dos GPU de consumo de 16 GB mediante llama.cpp.

La relevancia de esta build radica en su enfoque práctico: en lugar de una optimización teórica, la poda se ha calibrado sobre una sesión real de codificación agéntica, ponderando los tokens según su función (decisiones, llamadas a herramientas, argumentos de edición) y reimplantando expertos fuertes procedentes del modelo completo de 512 expertos en las capas donde la poda debilitaba la representación. El resultado es un fichero GGUF de 52,1 GB con soporte de contexto de 190K tokens (con la cabeza de borrador MTP) que cabe en 32 GB de VRAM totales.

Es la segunda iteración ("v2", build `cnm-fn-dslab192e-implant16-v2`) de esta línea de trabajo, tras la build "v1" de 192 expertos del mismo autor. El modelo conserva la cuantización extrema (~3,5 bpw) del release de DASLab y añade 753 expertos reimplantados y requantizados. No está afiliado ni respaldado por ISTA-DASLab, Qwen ni unsloth.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con enrutado de expertos (512 expertos originales, top-10), cabeza de borrador MTP y tabla n-gram/PLE |
| Parametros totales | 101.407.105.920 (~101 B) |
| Parametros activos | no disponible |
| Longitud de contexto | 194.560 tokens con cabeza MTP; 192K sin ella |
| Tipos de cuantizacion | ~3,5 bpw; IQ2_S / IQ3_XXS / IQ3_S / IQ4_XS (gate/up), IQ4_NL o Q2_0 (down) |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (other) |
| Formato de pesos | GGUF (dos shards, 52,1 GB; ~28 GB del segundo shard corresponden a la tabla n-gram/PLE que reside en RAM del sistema) |

## Arquitectura y entrenamiento

El modelo base, Qwen3.8-Flash-Next, es un transformer MoE con 512 expertos enrutados por capa y selección top-10. La cadena de derivación es la siguiente: DASLab redujo el modelo a 256 expertos por capa (seleccionados para uso de código y agéntico mediante su método RCO, basado en optimización KL) y lo cuantizó a ~3,5 bits por peso con matriz de importancia. Sobre esa base, esta build aplica tres pasos propios:

1. **Poda de 256 a 224 expertos**: se descartan los 32 expertos por capa con menor suma de peso de router sobre una sesión registrada de codificación agéntica (Claude Code trabajando sobre un repositorio propio del autor).
2. **Poda de 224 a 192 con expertos "de decisión" protegidos**: los expertos se clasifican por peso de router con tokens ponderados por clase (decisión ×8, tool-call ×4, argumentos de edición ×2, resto ×1), conservando siempre los 16 expertos por capa con mayor peso en posiciones de decisión (el token previo a que el modelo inicie una llamada a herramienta, escriba texto visible o finalice su turno). La capa 47 usa el conjunto de la v1 por falta de estadísticas suficientes.
3. **Implantación**: en las capas 0–46, los 16 expertos no protegidos más débiles se sustituyen por los 16 expertos más fuertes fuera del conjunto de 256 de DASLab (medidos sobre el modelo completo de 512 expertos), aceptando cada sustitución solo si añade peso de router; 753 sustituciones en total. Los expertos implantados se extraen del GGUF Q8_0 de unsloth y se requantizan a los tipos de tensor de la capa destino con la matriz de importancia de unsloth.

La atención, el experto compartido y la tabla n-gram/PLE se copian sin cambios del release de DASLab. El autor subraya que se trata de heurísticas simples aplicadas sobre una única sesión, no de una búsqueda optimizada por KL como el método RCO de DASLab. No hay información disponible sobre datos de entrenamiento, número de tokens ni etapas de RLHF/DPO del modelo base.

## Capacidades

- Generación de texto y código orientada a flujos agénticos (el nombre RCO-Coder y el proceso de poda indican especialización en código).
- Ejecución de bucles agénticos multi-paso: la poda protege explícitamente las posiciones de decisión, tool-call y argumentos de edición, lo que sugiere soporte de tool calling / function calling en entornos tipo Claude Code.
- Trabajo sobre repositorios en ABAP, Go y TypeScript (caso de uso validado por el autor).
- Contexto muy largo: hasta 194.560 tokens con la cabeza de borrador MTP, adecuado para navegar bases de código extensas.
- Decodificación asistida mediante MTP (multi-token prediction) como draft head y tabla n-gram/PLE para aceleración especulativa.
- Compatibilidad con llama.cpp (requiere un fork concreto, ver requisitos de hardware).
- Capacidades multilingües: no disponible.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- **Codificación agéntica en local con GPU de consumo**: ejecutar agentes tipo Claude Code que editan, prueban y refactorizan código en repositorios reales sin depender de APIs externas, gracias a que todo el modelo cabe en 2×16 GB de VRAM.
- **Mantenimiento de sistemas legacy ABAP**: el autor valida específicamente sesiones sobre repositorios ABAP; útil para empresas con entornos SAP que prefieren procesamiento on-premise por confidencialidad.
- **Desarrollo en Go y TypeScript**: generación y edición de código en estos lenguajes dentro de pipelines de desarrollo asistido por agente.
- **Análisis de bases de código grandes**: la ventana de ~190K tokens permite cargar contexto extenso (múltiples ficheros, dependencias) en una sola sesión.
- **Prototipado de flujos multi-paso con herramientas**: las posiciones de tool-call están protegidas durante la poda, lo que lo hace adecuado para cadenas de llamadas a herramientas repetidas.
- **Experimentación con poda de expertos MoE**: el propio proceso de construcción (estadísticas de router, implantación de expertos, requantización con imatrix) sirve como referencia reproducible para investigadores que exploran compresión de MoE.
- **Despliegue en estaciones de trabajo sin conexión**: al ser un GGUF local con licencia comunitaria Qwen, puede usarse en entornos aislados sin telemetría.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card menciona mediciones propias del autor sobre una máquina concreta para configuraciones de runtime registradas, pero los valores no se incluyen en el material proporcionado. Dado que se trata de una poda heurística sobre una única sesión (no optimizada por KL), la degradación de calidad respecto al modelo de 256 expertos de DASLab no está cuantificada en los datos disponibles.

## Requisitos de hardware

- **VRAM**: el modelo completo ocupa 52,1 GB, pero ~28 GB (tabla n-gram/PLE) permanecen en RAM del sistema bajo llama.cpp; el resto cabe en dos GPU de 16 GB (32 GB de VRAM totales).
- **GPU recomendadas**: el autor valida con RTX 4060 Ti (sm_89) y RTX 2070 (sm_75) en CUDA 12.0; también hay builds para CPU AVX2/FMA/F16C y para Radeon RX 580 vía Vulkan.
- **Consumer GPU**: sí, es el objetivo explícito del proyecto: dos GPU de 16 GB (p. ej., 2× RTX 4060 Ti 16 GB).
- **Despliegue**: requiere el runtime fork "MoREL" (`cnm-varexp-v0.1 prerelease`) de llama.cpp del autor, distribuido como paquetes Ubuntu 24.04 específicos por máquina y backend (CPU AVX2, Vulkan, CUDA sm_75 y sm_89/86/75). No hay builds universales de Linux, ni Windows x64, ni macOS en esta prerelease; para otras máquinas hay que compilar desde el código fuente del release. Los paquetes desactivan HTTPS y la Web UI del servidor embebido.
- **Latencia y throughput**: no disponibles en la información proporcionada.
- **Advertencia**: la generación con estos binarios empaquetados para K192p-implant16 v2 no ha sido probada por el autor; CUDA, residencia completa en Vulkan, contextos largos y MTP tampoco se testaron en esa release.

## Comparativa con modelos similares

| Modelo | Parametros | Expertos/capa | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| oisee/Qwen3.8-Flash-Next-GSQ-RCO-Coder-192E-implant16-GGUF (esta ficha, v2) | ~101 B totales | 192 | 194.560 (con MTP) | ~3,5 bpw (IQ2_S–IQ4_XS) | qwen-community-1.0 | GGUF público, requiere fork de llama.cpp |
| oisee/Qwen3.8-Flash-Next-GSQ-RCO-Coder-192E-GGUF (v1) | ~101 B totales | 192 | no disponible | ~3,5 bpw | qwen-community-1.0 | GGUF público |
| ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-Coder-GGUF (base) | ~101 B totales | 256 | no disponible | ~3,5 bpw | no disponible | GGUF público |
| Qwen3.8-Flash-Next (base original, unsloth Q8_0) | ~101 B totales | 512 (top-10) | no disponible | Q8_0 (variante unsloth) | no disponible | GGUF público |

## Limitaciones y advertencias

- **Calidad no verificada con benchmarks**: la poda usa heurísticas simples sobre una única sesión de código del autor; no hay evaluación KL ni benchmarks estandarizados publicados. El rendimiento en dominios distintos del código agéntico puede degradarse notablemente, ya que los expertos se seleccionaron solo para esa carga.
- **Sobreajuste al perfil de uso del autor**: los expertos conservados reflejan una sesión concreta de Claude Code sobre repositorios ABAP/Go/TypeScript propios; otros lenguajes o estilos de trabajo pueden verse perjudicados.
- **Riesgo de alucinación**: no disponible un dato específico, pero la cuantización extrema (~3,5 bpw con tensores IQ2_S/Q2_0) y la pérdida de 320 expertos respecto al modelo original aumentan el riesgo de degradación y errores factuales.
- **Runtime no estándar**: exige un fork prerelease de llama.cpp con paquetes específicos por máquina (solo Ubuntu 24.04, sin Windows ni macOS en binarios); varias configuraciones (generación CUDA con los binarios empaquetados, Vulkan completo, contextos largos, MTP) no fueron testadas en la release.
- **Requisito de RAM del sistema**: ~28 GB adicionales de RAM para la tabla n-gram/PLE, además de la VRAM.
- **Licencia**: qwen-community-1.0; las restricciones exactas para uso comercial no están detalladas en la información proporcionada y deben revisarse en el archivo LICENSE del repositorio.
- **Proyecto comunitario independiente**: no está afiliado ni respaldado por ISTA-DASLab, Qwen ni unsloth; el soporte depende del autor.
- **Sesgos**: no disponible información específica sobre sesgos del modelo base.
- **Idiomas**: no disponible la lista de idiomas soportados; el caso de uso validado es código (ABAP, Go, TypeScript) con instrucciones presumiblemente en inglés.

## Enlaces

- Ficha del modelo: https://huggingface.co/oisee/Qwen3.8-Flash-Next-GSQ-RCO-Coder-192E-implant16-GGUF
- Modelo base (ISTA-DASLab): https://huggingface.co/ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-Coder-GGUF
- Build anterior (v1): https://huggingface.co/oisee/Qwen3.8-Flash-Next-GSQ-RCO-Coder-192E-GGUF
- Runtime fork de llama.cpp (release MoREL cnm-varexp-v0.1): https://github.com/oisee/llama.cpp/releases/tag/cnm-varexp-v0.1
- Código fuente del release: https://github.com/oisee/llama.cpp/tree/cnm-varexp-v0.1
- Papers referenciados en los tags del modelo: arXiv:2604.18556 y arXiv:2605.00649 (enlaces no resueltos en la información proporcionada)
