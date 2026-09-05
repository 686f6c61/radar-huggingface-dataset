# Adapa360/HoloQwen3

## Resumen

HoloQwen3 es una extension experimental de tipo “memoria en linea” sobre el modelo Qwen3-0.6B, publicada por Adapa360. El modelo base de Qwen no sufre cambios en sus pesos; se anade un banco de memoria holografica espectral que permite almacenar asociaciones explícitas entre contexto y siguiente token, sin necesidad de reentrenamiento ni actualizaciones por gradientes. La propuesta surge como un intento de anadir memoria asociativa de forma controlada a un modelo preentrenado, con una politica de recuperacion por similitud coseno en el espacio normalizado.

La arquitectura combina el decoder estandar de Qwen3 (596.049.920 parametros unicos, 28 capas, hidden size 1024) con un modulo de memoria de hasta 1024 registros. La memoria codifica estados ocultos normalizados mediante una transformada de Fourier real ortonormal y emplea correlacion circular de retardo cero para ordenar las claves. En modo exacto, la recuperacion exige una similitud coseno de al menos 0,999 y promueve el token memorizado con un logit minimo por encima del maximo actual de Qwen. Si no hay coincidencia o la memoria esta vacia, la salida es identica a la del modelo base.

El modelo esta etiquetado como experimental, con validacion local limitada y sin certificacion de produccion. Es una candidata de investigacion para estudiar la memorizacion explicita, no un reemplazo de modelos entrenados con aprendizaje continuo. Licencia Apache-2.0, disponible como safetensors con custom code.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Qwen3) con modulo de memoria holografica espectral adjunto |
| Parametros totales | 596.049.920 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (con custom code para Transformers) |

Otros datos de la implementacion: la memoria adicional en FP32 ocupa 4.210.688 bytes con capacidad predeterminada de 1024 registros, excluyendo tensores temporales. Cada registro es una asociacion contexto/token aceptada, no un hecho completo ni una conversacion entera.

## Arquitectura y entrenamiento

HoloQwen3 reutiliza el decoder completo de Qwen3-0.6B tal cual, sin aproximaciones ni sustituciones de capas. El componente anadido es una memoria asociativa espectral que funciona despues del estado oculto normalizado final y de la cabeza LM. La codificacion transforma los estados ocultos normalizados con una FFT real ortonormal; las amplitudes y fases complejas conservan la clave completa. La recuperacion se realiza mediante correlacion circular de retardo cero con peso de Parseval, que equivale a una recuperacion por coseno en el espacio original normalizado.

El modo exacto exige que la clave con mayor similitud tenga un coseno de al menos 0,999. Si dos tokens en conflicto difieren en menos de 1e-5, el sistema se abstiene y no modifica los logits. Cuando hay una coincidencia valida, el token memorizado se promueve al menor logit representable por encima del maximo actual de Qwen. La opcion `memory_mix=0` desactiva la lectura; la magnitud de `memory_mix` no influye en el modo exacto.

No se realiza ningun entrenamiento automatico sobre respuestas generadas. La memoria se llena solo con ejemplos explícitamente aprobados mediante el metodo `remember()` del modelo. La memoria funciona como una cola FIFO: al alcanzar la capacidad de 1024 registros, la escritura numero 1025 sobrescribe la posicion 0. No hay decaimiento ni refresco de antiguedad. La memoria se puede guardar y cargar en archivos safetensors separados, con validacion de forma, rangos de tokens, capacidad e identidad del checkpoint base.

## Capacidades

- Generacion de texto estandar heredada de Qwen3-0.6B: con la memoria vacia, las salidas coinciden con el modelo base en las configuraciones probadas.
- Memorizacion explicita de asociaciones contexto/next-token mediante el metodo `remember()` con `approved=True`.
- Recuperacion por similitud coseno en el espacio espectral, con umbral estricto de 0,999 y abstencion en caso de conflicto.
- Persistencia de memoria: guardado y carga de bancos de memoria en safetensors (por ejemplo, `save_memory` y `load_memory`).
- Soporte de mascaras de padding y seleccion de tokens objetivo mediante una mascara booleana.
- Ejecucion en CPU (float32) o GPU (bfloat16) segun el ejemplo de uso incluido en el modelo card.
- No soporta vision ni audio; tampoco se documenta tool calling, function calling ni soporte de agentes.

## Casos de uso

- Investigacion en memorias asociativas: el modelo permite estudiar como un banco de memoria espectral recupera asociaciones exactas sin alterar los pesos del modelo base, comparando el comportamiento de Qwen3-0.6B con y sin memoria cargada.
- Prototipos de asistentes con hechos aprobados: se pueden almacenar pares pregunta-respuesta validados manualmente y recuperarlos en consultas que repliquen el contexto exacto, como una base de conocimiento de un dominio restringido.
- Experimentos de robustez y limites de memorizacion: al ser un sistema FIFO sin decaimiento ni refresco, es util para medir la persistencia y la interferencia entre asociaciones, asi como el efecto de sobrescritura cuando se alcanza la capacidad.
- Benchmark de overhead de memoria: dado que el banco ocupa unos 4,2 MB en FP32, puede servir para evaluar el coste de anadir memoria a un modelo pequeno en entornos con recursos limitados.
- Validacion de patrones de abstencion: el modo exacto se abstiene cuando hay conflictos; este comportamiento es interesante para sistemas donde la ambiguedad debe ser explicita y no silenciosa.
- Herramientas didacticas sobre transformadas de Fourier: la implementacion usa FFT ortonormal y correlacion circular compleja, por lo que puede utilizarse como material de estudio de representaciones espectrales aplicadas a memoria de modelos de lenguaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo card indica que el repositorio incluye un archivo `validation.json` con ejecuciones exactas, versiones, tiempos, hashes de origen y limites, pero no se aportan valores de rendimiento como MMLU, HumanEval o GSM8K. Tampoco se encuentran metricas de latencia o throughput en la documentacion. No se puede comparar cuantitativamente con otros modelos.

## Requisitos de hardware

- VRAM estimada: no disponible; no se proporcionan cifras de consumo. El repositorio ocupa 1,2 GB en total, lo que sugiere que los pesos base caben en tarjetas de consumo con memoria suficiente, pero sin datos confirmados.
- GPU recomendadas: no se mencionan modelos concretos.
- Compatibilidad con CPU: el ejemplo de uso indica que el modelo puede ejecutarse en CPU usando `torch.float32`.
- Compatibilidad con GPU: el ejemplo usa `torch.bfloat16` cuando hay CUDA disponible.
- Opciones de despliegue: no se mencionan vLLM, llama.cpp, Ollama, TGI ni otros servidores de inferencia. El unico camino documentado es cargar el modelo con `AutoModelForCausalLM` en Transformers con `trust_remote_code=True`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| HoloQwen3 (Adapa360) | 596.049.920 | No disponible | Apache-2.0 | Repositorio HF custom code |
| Qwen3-0.6B (base) | 596.049.920 | No disponible | Apache-2.0 | Repositorio oficial de Qwen |

HoloQwen3 es una extension del modelo base Qwen3-0.6B, por lo que los parametros son identicos. La diferencia funcional reside en el modulo de memoria anadido, que no modifica los pesos y requiere el custom code incluido en el repositorio. No se dispone de datos de rendimiento para comparar output de forma cuantitativa. No se identifican en la informacion proporcionada otras variantes de Qwen3-0.6B con memorias asociativas similares.

## Limitaciones y advertencias

- El modelo esta en estado experimental y declarado por su autor como “not universally production-certified”. No es seguro su uso en entornos de produccion sin validacion adicional.
- La memoria solo es util para contextos casi identicos a los memorizados: una pregunta parafraseada puede no recuperar la asociacion, como se advierte en el propio README.
- Cada registro almacena un unico token de siguiente, no una frase ni un hecho completo. Por tanto, no es una base de conocimiento conversacional estructurada.
- El sistema no ofrece aprendizaje continuo general, mejora de razonamiento, menor perplexidad ni mayor velocidad de inferencia. El autor deja constancia explicita de ello.
- La memoria es privada: se guarda en archivos separados y no debe incluirse en el repositorio del modelo. `save_pretrained()` no incluye la memoria privada.
- Si los pesos base cambian tras entrenamiento con gradientes, las claves de memoria quedan obsoletas. Se recomienda limpiar la memoria antes de cualquier entrenamiento adicional.
- El uso de `trust_remote_code=True` implica ejecutar codigo arbitrario del repositorio. Se recomienda revisar el codigo antes de habilitarlo y fijar una revision inmutable, no la rama `main`.
- No se documentan sesgos especificos ni riesgos de alucinacion propios de este modelo; al basarse en Qwen3-0.6B, heredaria las limitaciones del modelo base, aunque no se aportan datos al respecto.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Adapa360/HoloQwen3
- Perfil de GitHub del autor: https://github.com/ADAPA360
- Proyecto relacionado Huldra Digital Twin: https://github.com/ADAPA360/Huldra-Digital-Twin
