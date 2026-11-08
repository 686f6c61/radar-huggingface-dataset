# BRSQ/qwen3-8b-semantic-correction-20k

## Resumen

BRSQ/qwen3-8b-semantic-correction-20k es un adaptador LoRA (entrenado con QLoRA de 4 bits) sobre el modelo base Qwen/Qwen3-8B, publicado por el usuario BRSQ. No es un modelo completo: el repositorio contiene unicamente los pesos del adaptador (0,1 GB en formato safetensors), no los pesos del modelo base. El adaptador esta especializado en una tarea muy concreta: restaurar texto UTF-8 corrupto recibido a traves de un enlace inalambrico simulado QPSK-OFDM, con el objetivo de servir como referencia semantica en receptores con procesamiento asistido por semantica y generacion de pseudo-pilotos.

El modelo resuelve un problema de investigacion en comunicaciones inalambricas: cuando los bits recibidos llegan con errores, el texto decodificado contiene sustituciones de caracteres, glifos ausentes o el caracter de reemplazo Unicode U+FFFD. El adaptador propone una reconstruccion fiel del pasaje original sin parafrasear, y el receptor alinea esa propuesta con la secuencia de bytes recibida y la valida contra criterios de consistencia de capa fisica antes de admitir simbolos QPSK inferidos como referencias de entrenamiento semantico.

Su relevancia es acotada y experimental: se trata de un artefacto de investigacion para comunicaciones semanticas, no de un modelo de correccion de errores para produccion. El modelo base Qwen3-8B aporta la arquitectura (transformer denso de 8.200 millones de parametros, ventana de contexto de 131.072 tokens, licencia Apache 2.0), mientras que el adaptador anade el comportamiento especifico de restauracion de texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre transformer denso causal (base Qwen3-8B) |
| Parametros totales | 8.200 millones (modelo base); el adaptador LoRA es de rango 16, tamano no disponible en detalle |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 131.072 tokens (heredada del base Qwen3-8B); el entrenamiento uso secuencias de 768 tokens |
| Tipos de cuantizacion | 4-bit NF4 con doble cuantizacion (entrenamiento); el adaptador se puede cargar sobre el base en 4-bit o en BF16/FP16 |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere el base Qwen/Qwen3-8B por separado |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3-8B, un transformer denso causal de 8.200 millones de parametros con licencia Apache 2.0. El entrenamiento se realizo con QLoRA: el modelo base se cuantizo a 4 bits NF4 con doble cuantizacion, se uso precision de computo BF16 (o FP16 si no habia soporte) y se insertaron adaptadores LoRA de rango 16, alpha 32 y dropout 0,05 en todas las capas lineales. El optimizador fue Paged AdamW de 8 bits, con tasa de aprendizaje 1e-4, schedule coseno con 3 % de warm-up, micro-batch de 1, acumulacion de gradiente de 8 pasos, una epoca y longitud maxima de secuencia de 768 tokens. La perdida fue supervisada solo en la completacion (completion-only supervised loss) y la semilla fue 20261031. La model card advierte que estos son los valores por defecto del script de entrenamiento, no necesariamente los ajustes verificados de la ejecucion publicada.

Los datos de entrenamiento se construyen a partir de Cosmopedia (configuracion `stories`). Los pasajes fuente se convierten a UTF-8 y se pasan por un transmisor OFDM, un canal de propagacion y un receptor con imperfecciones de hardware simulados para obtener el texto corrupto como entrada; el pasaje original es el objetivo. Los hashes de los documentos fuente se usan para asignar documentos a los conjuntos de entrenamiento, validacion y prueba. La model card insiste en que el numero real de ejemplos de entrenamiento, la revision del dataset y los pasos de optimizacion deben verificarse contra el informe de entrenamiento y no inferirse del sufijo "20K" del nombre. La innovacion tecnica no esta en la arquitectura (que es la del base sin cambios) sino en el pipeline de generacion de datos: la corrupcion se modela a nivel de capa fisica inalambrica, no con ruido sintetico generico.

## Capacidades

- Restauracion de texto UTF-8 corrupto: corrige sustituciones de caracteres, glifos ausentes y caracteres U+FFFD causados por errores de bit en un enlace QPSK-OFDM simulado.
- Reconstruccion fiel sin parafrasis: la instruccion de sistema exige preservar el texto correcto exactamente, sin explicar, anadir hechos ni hacer ediciones estilisticas.
- Generacion de texto conversacional: hereda la capacidad de generacion del base Qwen3-8B mediante la plantilla de chat de Qwen.
- Modo thinking desactivado: el prompt de entrenamiento e inferencia usa `enable_thinking=False`.
- No se documentan capacidades de tool calling, agentes, vision, audio ni razonamiento multi-paso especificas del adaptador.
- Capacidad multilingue limitada: el adaptador esta entrenado y etiquetado solo para ingles, aunque el base Qwen3-8B sea multilingue.

## Casos de uso

- Investigacion en comunicaciones semanticas: el adaptador se integra en un receptor QPSK-OFDM para proponer texto restaurado que, tras alinearse con los bytes recibidos y validarse contra criterios de capa fisica, se usa como referencia semantica. Es su caso de uso principal y documentado.
- Generacion de pseudo-pilotos: los simbolos QPSK inferidos a partir del texto restaurado y validado pueden emplearse como pseudo-pilotos para estimacion de canal en el receptor simulado.
- Evaluacion de tecnicas de correccion asistida por semantica: sirve como componente de referencia para comparar metodos de restauracion de texto en entornos de radio simulados con imperfecciones de hardware.
- Reproduccion de experimentos de capa fisica: al estar construido sobre un pipeline de corrupcion reproducible (transmisor, canal y receptor simulados), permite replicar experimentos de recepcion con conocimiento semantico.
- Prototipado de receptores de proxima generacion: util en entornos de investigacion que exploran el intercambio de informacion entre capas fisica y de aplicacion en sistemas 5G/6G.
- Estudio de alucinacion en tareas de restauracion: la propia model card advierte que el modelo puede alucinar, por lo que es un banco de pruebas para medir y mitigar ese riesgo en pipelines de correccion semantica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador solo ocupa 0,1 GB, pero requiere cargar el base Qwen3-8B. En 4-bit NF4 (como en el ejemplo de carga de la model card) se estima un consumo en torno a 5-6 GB para los pesos, mas overhead de activaciones y cache KV; en BF16 el base de 8.200 millones de parametros requiere aproximadamente 16 GB solo para pesos.
- GPU recomendadas: para 4-bit, GPUs consumer con 8-12 GB (RTX 3060 12 GB, RTX 4070, RTX 4080); para BF16, A100 40 GB, H100, RTX 4090 24 GB o RTX A6000.
- Cabe en GPU consumer: si, en configuracion 4-bit NF4 con `device_map="auto"`; en BF16 cabe en RTX 4090 y GPUs de 24 GB o mas.
- Opciones de despliegue: transformers + peft + bitsandbytes + accelerate (el camino documentado en la model card); vLLM y TGI requeririan fusionar el adaptador con el base o usar soporte de adaptadores LoRA; llama.cpp/Ollama requeririan conversion del adaptador a GGUF.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BRSQ/qwen3-8b-semantic-correction-20k | 8.200 M (base) + adaptador LoRA | 131.072 tokens (base) | Adaptador LoRA especializado en restauracion de texto inalambrico | no disponible | Hugging Face (0 descargas, 0 likes) |
| Qwen/Qwen3-8B | 8.200 M | 131.072 tokens | Modelo base denso de proposito general | Apache 2.0 | Hugging Face, Qualcomm AI Hub |
| Adaptadores LoRA de correccion ortografica genericos | variable | depende del base | Adaptadores sobre bases diversos | variable | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo no garantiza recuperar el texto transmitido: puede alucinar, cambiar contenido valido o generar pasajes no relacionados. La fluidez del texto no es evidencia de correccion a nivel de byte.
- Esta destinado a investigacion experimental, no a correccion de errores en sistemas criticos para la seguridad.
- Solo soporta ingles; no se ha validado para otros idiomas.
- La licencia no esta disponible, lo que impide confirmar si se permite uso comercial.
- El repositorio contiene solo el adaptador; es obligatorio descargar y cargar Qwen/Qwen3-8B por separado.
- La model card exige verificar la revision del dataset, el numero exacto de ejemplos de entrenamiento, el split train/validation y los chequeos de deduplicacion antes de publicar; no deben inferirse del nombre "20K".
- Los hiperparametros de entrenamiento listados son valores por defecto del script, no ajustes verificados de la ejecucion publicada.
- El modelo tiene 0 descargas y 0 likes, sin evidencia de uso o validacion por terceros.
- El pipeline de corrupcion es una simulacion de un enlace QPSK-OFDM con imperfecciones de hardware; su comportamiento en enlaces reales no esta documentado.

## Enlaces

- Repositorio del adaptador en Hugging Face: https://huggingface.co/BRSQ/qwen3-8b-semantic-correction-20k
- Modelo base Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
- Dataset Cosmopedia: https://huggingface.co/datasets/HuggingFaceTB/cosmopedia
- Qwen3-8B en Qualcomm AI Hub: https://aihub.qualcomm.com/models/qwen3_8b
- Qwen3 8B en AI Model Radar: https://aimodelradar.app/models/qwen3-8b
- DOI del modelo: 10.57967/hf/11511
