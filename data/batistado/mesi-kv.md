# batistado/MESI-KV

## Resumen

MESI-KV es una arquitectura de coherencia de caché KV para agentes basados en LLM, publicada por el usuario batistado en Hugging Face. No se trata de un modelo de lenguaje nuevo con pesos propios, sino de un mecanismo plug-and-play que se aplica sobre modelos causales existentes (Qwen2.5-3B-Instruct, Qwen2.5-7B-Instruct y Qwen2.5-Coder-14B-Instruct) para gestionar la invalidación selectiva de bloques de caché KV cuando los datos externos que el agente consulta cambian a mitad de trayectoria. El repositorio tiene 0 GB, lo que confirma que no contiene pesos: es una implementación de referencia y tarjeta técnica.

El problema que aborda es concreto: los cachés de `CausalLM` sin modificar fallan de forma silenciosa cuando ficheros, configuraciones o filas de base de datos mutan durante una trayectoria agéntica. Las soluciones previas citadas (Leyline/PatchKV) conservan vectores Value obsoletos, mientras que Concord descarta el 100% de los bloques KV posteriores. MESI-KV introduce un directorio de leases con cuatro estados (S, M, T, I) que rastrea granularmente símbolos del AST de Python, claves de configuración y versiones de filas SQLite, acumulando un "attention taint" calibrado por estadísticos de orden en FP32 y recomputando quirúrgicamente solo los bloques mutados y contaminados.

La relevancia actual reside en el despliegue de agentes de larga duración que operan sobre estado mutable (sistemas de ficheros, bases de datos, configuración). El modelo se distribuye con licencia Apache 2.0 y se integra con vLLM y LMCache, apuntando a pipelines de inferencia en producción donde el ahorro de cómputo en recálculo de caché es crítico.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mecanismo de coherencia de caché KV sobre transformers causales (no es un modelo con pesos propios) |
| Parámetros totales | no disponible (depende del modelo base: 3B, 7B o 14B) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (repositorio de 0.0 GB; no contiene pesos) |

## Arquitectura y entrenamiento

MESI-KV no entrena un modelo nuevo: es una capa de gestión de caché que se aplica sobre modelos Qwen2.5 existentes sin modificar sus pesos ("zero-training plug-and-play"). Su núcleo es un directorio de leases con cuatro estados (S, M, T, I) que rastrea la coherencia a nivel de grano fino: símbolos del AST de Python, claves de configuración y versiones de filas SQLite. Cuando se detecta una mutación, el sistema acumula "Order-Statistic Calibrated Attention Taint" en fragmentos pre-escalados en FP32 y recalcula únicamente los bloques KV posteriores que están mutados y contaminados.

La innovación técnica principal es la rotación de bloques limpios del sufijo mediante desplazamientos relativos de RoPE en forma cerrada SO(2), denotados R_Δ, en lugar de descartarlos. Esto contrasta con las estrategias previas: Leyline/PatchKV mantiene vectores V obsoletos y Concord invalida el 100% de los bloques posteriores. No se dispone de información sobre el número de tokens de entrenamiento ni sobre la composición del dataset, ya que no hay entrenamiento de pesos implicado. El dataset asociado, CoherenceBench-Agent, se emplea para evaluar la coherencia del mecanismo, no para ajustar el modelo.

## Capacidades

- Invalidación selectiva de caché KV ante mutaciones de ficheros, configuraciones o filas SQLite durante trayectorias agénticas.
- Seguimiento de coherencia a nivel de símbolo AST de Python, clave de configuración y versión de fila SQLite.
- Acumulación de attention taint calibrado por estadísticos de orden en FP32 sobre fragmentos pre-escalados.
- Recomputación quirúrgica de bloques KV mutados y contaminados, preservando bloques limpios.
- Rotación de bloques limpios del sufijo mediante desplazamientos relativos de RoPE en forma cerrada SO(2) (R_Δ).
- Integración con vLLM y LMCache para despliegue en inferencia.
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- Soporte sobre modelos Qwen2.5-3B-Instruct, Qwen2.5-7B-Instruct y Qwen2.5-Coder-14B-Instruct.
- No se documentan capacidades de visión, audio, tool calling nativo ni modos de razonamiento extendido propias del mecanismo.

## Casos de uso

- Agentes que editan código en repositorios: el mecanismo rastrea símbolos del AST de Python y, cuando un fichero muta, invalida solo los bloques KV afectados en lugar de recomputar toda la trayectoria, manteniendo coherencia entre ediciones sucesivas.
- Asistentes sobre bases de datos SQLite: al cambiar la versión de una fila consultada previamente, MESI-KV detecta la mutación y recalcula únicamente los bloques contaminados, evitando respuestas basadas en datos obsoletos.
- Gestión de configuración en pipelines de infraestructura: los agentes que leen y modifican claves de configuración mantienen coherencia entre lecturas y escrituras dentro de una misma sesión de razonamiento.
- Servidores de inferencia con vLLM y LMCache: el ahorro de recálculo de caché reduce el cómputo por turno en conversaciones largas con estado externo mutable, mejorando el throughput agregado.
- Evaluación de coherencia agéntica: CoherenceBench-Agent permite medir la tasa de respuestas obsoletas frente a estrategias de invalidación total o nula.
- Investigación en sistemas de caché para LLM: el código y las pruebas en GitHub sirven como referencia reproducible para comparar políticas de coherencia (S/M/T/I frente a flush completo).
- Agentes de larga duración con contexto compartido: la rotación SO(2) de bloques limpios evita descartar prefijos válidos cuando solo una parte del estado cambia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card referencia una figura (`fig3_accuracy_and_ablations.png`) sobre precisión y ahorro de KV, pero no se proporcionan cifras numéricas en el texto disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; depende del modelo base (Qwen2.5-3B, 7B o 14B) y de su cuantización.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no disponible en la información proporcionada.
- Opciones de despliegue: vLLM y LMCache (citados en los tags); el paquete se instala vía `pip install git+https://github.com/batistado/mesikv.git`.
- Latencia y throughput estimados: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Sistema | Enfoque de coherencia | Granularidad | Recomputación | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MESI-KV | Directorio de leases S/M/T/I + attention taint | AST Python, clave de config, fila SQLite | Quirúrgica (mutados + contaminados) con rotación SO(2) | Apache 2.0 | Hugging Face + GitHub |
| Leyline / PatchKV | Conserva vectores V memoizados | no disponible | Ninguna (mantiene obsoletos) | no disponible | Citado en la model card |
| Concord | Flush completo de caché | Bloque KV | 100% de bloques posteriores | no disponible | Citado en la model card |

No se dispone de datos de rendimiento comparativo numérico entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- El repositorio no contiene pesos (0.0 GB): es una implementación de referencia, no un modelo listo para cargar con `from_pretrained`.
- No se documentan sesgos conocidos del mecanismo ni de los modelos base en la información disponible.
- Riesgo de alucinación: no evaluado en la información proporcionada; el mecanismo mitiga respuestas basadas en estado obsoleto, no la alucinación general del modelo base.
- Limitaciones de contexto e idioma: no disponibles.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las licencias de los modelos base Qwen2.5 subyacentes.
- El sistema asume que las mutaciones son detectables a nivel de AST, clave de configuración o versión de fila SQLite; mutaciones fuera de esos granos podrían no invalidarse correctamente.
- No hay evidencia publicada de despliegue a escala ni cifras de latencia en producción.
- La fecha de creación del repositorio (2026-11-14) y el estado incipiente (0 descargas, 0 likes) sugieren que se trata de un proyecto reciente sin validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/batistado/MESI-KV
- Dataset CoherenceBench-Agent: https://huggingface.co/datasets/batistado/CoherenceBench-Agent
- Space interactivo: https://huggingface.co/spaces/batistado/MESI-KV-Explorer
- Código fuente y pruebas: https://github.com/batistado/mesikv
- Modelo base Qwen2.5-3B-Instruct: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Modelo base Qwen2.5-7B-Instruct: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Modelo base Qwen2.5-Coder-14B-Instruct: https://huggingface.co/Qwen/Qwen2.5-Coder-14B-Instruct
