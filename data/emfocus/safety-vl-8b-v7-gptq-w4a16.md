# Emfocus/safety-vl-8b-v7-gptq-w4a16

## Resumen
safety-vl-8b-v7-gptq-w4a16 es un modelo vision-lenguaje (VLM) derivado de Qwen/Qwen3-VL-8B-Instruct, desarrollado por Emfocus y orientado a la vigilancia de seguridad en plantas de fabricación mediante camaras CCTV. El modelo recibe una imagen o fotograma y devuelve un JSON con la posicion de trabajadores, carretillas, cargas, maquinaria y vehiculos, ademas de la evaluacion de riesgos como atrapamientos, falta de equipo de proteccion individual o cargas inestables.

La variante publicada aplica un ajuste fino LoRA (v7) sobre el modelo base y despues una cuantizacion GPTQ W4A16 con grupo de 128 y 256 filas de calibracion, manteniendo el codificador visual y el lm_head en BF16. El resultado ocupa aproximadamente 7 GB en formato compressed-tensors (pack-quantized), lo que permite ejecutarlo en una unica GPU de 12 GB como la RTX 4070 SUPER. El autor declara que el ajuste se hizo por destilacion de respuestas de Qwen3-VL-32B.

El modelo esta especializado en un dominio muy concreto (seguridad industrial en plantas) y declara unicamente el idioma coreano. Su relevancia actual reside en demostrar que un VLM de 8B cuantizado a 4 bits puede ejecutarse en hardware de consumo con latencia cercana al tiempo real en escenarios de vigilancia, aunque sus resultados solo estan validados en el conjunto de pruebas propio del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer vision-lenguaje (Qwen3-VL), ajuste LoRA sobre Qwen/Qwen3-VL-8B-Instruct |
| Parametros totales | 2.743.841.512 (segun safetensors del repositorio) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GPTQ W4A16 (grupo 128, 256 filas de calibracion); codificador visual y lm_head en BF16; KV cache fp8 en las pruebas |
| Idiomas soportados | coreano (ko) |
| Licencia | no disponible |
| Formato de pesos | safetensors con compressed-tensors (pack-quantized), compatible con vLLM |

## Arquitectura y entrenamiento
El modelo parte de Qwen3-VL-8B-Instruct, un transformer multimodal que procesa imagen y texto. Sobre esa base se aplico un ajuste fino LoRA (version v7) y se generaron respuestas de referencia mediante destilacion a partir de Qwen3-VL-32B. Posteriormente se fusiono el adaptador y se cuantizo a GPTQ W4A16 con grupo de 128 y 256 filas de calibracion extraidas de fotos de planta a 960x540 o menos. El codificador visual y el lm_head se mantienen en BF16 para preservar la calidad de la representacion visual.

El autor documenta una evolucion por versiones (v1 a v7) en la que se fueron incorporando datos de planta, imagenes publicas de carretillas y construccion, secuencias de atrapamiento y caida, y seis categorias de equipo de proteccion individual (chaleco, casco, guantes, etc.). No se especifican el numero total de tokens de entrenamiento ni la composicion exacta del dataset. Tampoco se detalla si hubo RLHF o DPO. La innovacion tecnica destacable es la combinacion de cuantizacion GPTQ con calibracion en imagenes reales de planta, que segun el autor reduce drasticamente los falsos positivos frente a FP8 (4/73 frente a 20/73 en el conjunto de 73 imagenes normales).

## Capacidades
- Generacion de texto e imagen-a-texto con salida estructurada en JSON que describe trabajadores, carretillas, cargas, maquinaria y vehiculos.
- Deteccion y evaluacion de riesgos laborales: atrapamiento (끼임), caidas, falta de equipo de proteccion individual (chaleco, casco, guantes), cargas inestables.
- Deteccion de objetos: el autor reporta una recall de 0,95 en deteccion de trabajadores sobre 29 fotos de planta.
- Procesamiento de video en modo vigilancia: el modelo se consulta periodicamente sobre fotogramas extraidos (cada 5, 10 o 30 segundos) y se combina con un detector de personas y un estimador de pose externos.
- Razonamiento multi-paso limitado dentro del pipeline: verificacion de fotogramas adyacentes y voto de re-confirmacion (6 consultas, umbral 3 o 4) para reducir falsos positivos.
- Capacidades multilingues limitadas: solo se declara coreano; no se garantiza calidad en castellano ni en otros idiomas.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta modo thinking, audio ni otras modalidades adicionales.

## Casos de uso
- Vigilancia de atrapamientos en lineas de produccion: el modelo se consulta cada 5 segundos sobre fotogramas de camaras fijas y emite una alerta cuando detecta dos fotogramas de atrapamiento en 4,5 segundos o cuando coincide con una estimacion de pose anomala. Es adecuado porque el autor reporta 88% de recall y 6% de falsos positivos sobre el conjunto AI Hub 71679.
- Control de equipo de proteccion individual: verificacion de chaleco, casco y guantes en cada trabajador detectado, con salida JSON que permite integrar la alerta en el sistema de gestion de seguridad de la planta.
- Deteccion de cargas inestables y maquinaria en zonas restringidas: el modelo identifica carretillas, cargas y vehiculos y permite generar avisos cuando aparecen en areas no autorizadas.
- Despliegue en hardware de consumo en planta: al ocupar unos 7 GB y ejecutarse en una RTX 4070 SUPER de 12 GB con vLLM, permite montar un nodo de inferencia local sin depender de la nube, lo que reduce latencia y cumple requisitos de privacidad industrial.
- Analisis forense de incidentes: procesamiento por lotes de grabaciones historicas para localizar fotogramas con riesgo y reconstruir la secuencia previa a un accidente.
- Integracion con sistemas de gestion de seguridad (SGS) mediante la salida JSON estructurada: los campos de posicion y riesgo se pueden mapear directamente a las alertas del sistema central.
- Auditoria de cumplimiento de normas de seguridad: generacion de informes periodicos a partir de las detecciones sobre imagenes archivadas.

## Benchmarks y rendimiento
Resultados declarados por el autor (no verificados de forma independiente). Todos los conjuntos son propios o derivados de AI Hub 71679.

| Tarea / conjunto | Metrica | Valor |
|---|---|---|
| Deteccion de atrapamiento, AI Hub 71679 validacion (50 videos con atrapamiento, 50 sin accidente), RTX 4070 SUPER | Recall | 0,88 (44/50) |
| Igual, RTX 4070 SUPER | Tasa de falsos positivos | 0,06 (3/50) |
| Igual, H200 | Recall | 0,86 (43/50) |
| Igual, H200 | Tasa de falsos positivos | 0,06 (3/50) |
| Video de simulacion de atrapamiento, camara A (3 tramos), RTX 4070 SUPER | Recall | 0,667 (2/3) |
| Igual | Falsos positivos en video normal | 0 |
| Imagen unica de escena normal, 73 fotos | Tasa de falsos positivos | 0,055 (4/73) |
| Deteccion de trabajadores, 29 fotos de planta | Recall | 0,95 |

Comparativa de cuantizaciones declarada por el autor:

| Version | Cuantizacion | Tamano | Atrapamiento en 12 escenas (v6) | Falsos positivos en 73 imagenes normales |
|---|---|---|---|---|
| v7 | GPTQ W4A16 | ~7 GB | no medido | 4/73 (5,5%) |
| v7 | FP8 | ~10 GB | no medido | 20/73 (27,4%) |
| v6 | BF16 | ~17 GB | 6/12 | 7/73 (9,6%) |
| v6 | FP8 | ~10 GB | 8/12 | 10/73 (13,7%) |
| v6 | GPTQ W4A16 | ~7 GB | 11/12 | 21/73 (28,8%) |
| v6 | RTN W4A16 | ~7 GB | 1/12 | no disponible |

No se han publicado resultados en benchmarks publicos estandar (MMMU, MMBench, etc.).

## Requisitos de hardware
- VRAM estimada para inferencia: aproximadamente 7 GB de pesos en GPTQ W4A16, mas overhead de KV cache y activaciones; el autor valida su ejecucion en una RTX 4070 SUPER de 12 GB.
- GPU recomendadas: RTX 4070 SUPER (12 GB) como minimo validado; H200 para mayor throughput; cualquier GPU con al menos 12 GB de VRAM y soporte de vLLM.
- Cabe en GPU de consumo: si, en RTX 4070 SUPER, RTX 4070 Ti, RTX 4080, RTX 4090 y equivalentes con 12 GB o mas.
- Opciones de despliegue: vLLM 0.30 (entorno validado por el autor, Windows + Docker Desktop); el formato compressed-tensors es compatible con vLLM. No se documenta soporte de llama.cpp, Ollama ni TGI.
- Latencia y throughput: el autor reporta un tiempo de procesamiento entre 0,85 veces el tiempo real en escenas con pocas personas y 1,5-1,8 veces el tiempo real en la camara A con muchas personas. No se proporcionan valores absolutos de latencia por fotograma ni de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Enfoque |
|---|---|---|---|---|---|
| safety-vl-8b-v7-gptq-w4a16 (este) | 2,74 B (repo) | no disponible | GPTQ W4A16, ~7 GB | no disponible | Seguridad industrial CCTV, coreano |
| Qwen/Qwen3-VL-8B-Instruct (base) | ~8 B | no disponible en la informacion | BF16, FP8 | no disponible en la informacion | VLM generalista |
| Qwen3-VL-32B (profesor de destilacion) | ~32 B | no disponible | BF16 | no disponible en la informacion | VLM generalista de mayor capacidad |

No se dispone de datos de benchmarks publicos comparables entre estos modelos en la informacion proporcionada; la comparativa se limita a tamano, cuantizacion y enfoque.

## Limitaciones y advertencias
- El modelo solo declara soporte de coreano; no se garantiza su calidad en castellano ni en otros idiomas.
- La licencia no esta disponible en la informacion proporcionada, por lo que no se puede confirmar si se permite uso comercial. Es imprescindible verificar la licencia del modelo base Qwen3-VL-8B-Instruct y la del autor antes de desplegarlo en produccion.
- Los benchmarks son propios del autor, no verificados de forma independiente y limitados a un unico dominio (plantas de fabricacion con camaras CCTV). No hay resultados en MMMU, MMBench ni otros benchmarks publicos.
- El recall de atrapamiento depende fuertemente de la frecuencia de consulta al modelo: con consultas cada 30 segundos el recall cae al 18%, frente al 86-88% con consultas cada 5 segundos. Esto implica que el sistema completo necesita un detector de personas y un estimador de pose externos para funcionar.
- El modelo puede generar falsos positivos (6% en el conjunto AI Hub) y falsos negativos (12-14% en el mismo conjunto).
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.
- No se documenta el comportamiento del modelo ante imagenes fuera de dominio (interiores no industriales, condiciones de iluminacion extremas, etc.).
- El ajuste fino y la cuantizacion pueden introducir sesgos especificos del conjunto de entrenamiento (plantas coreanas, tipos concretos de maquinaria y equipos de proteccion).
- El modelo no documenta soporte de tool calling, function calling ni modo thinking, lo que limita su integracion en pipelines de agentes complejos.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/Emfocus/safety-vl-8b-v7-gptq-w4a16
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct
- Repositorio vLLM (motor de inferencia validado): https://github.com/vllm-project/vllm
- Conjunto de datos AI Hub 71679 (referenciado por el autor): no disponible como enlace directo en la informacion proporcionada
