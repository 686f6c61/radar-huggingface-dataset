# alpharomercoma/LFM3-VL-2B-AndroidAgent-v4.1-GGUF

## Resumen

LFM3-VL-2B-AndroidAgent-v4.1-GGUF es la distribucion cuantizada en formato GGUF de un fine-tune de vision-lenguaje orientado a la automatizacion de interfaces Android. El modelo parte de LiquidAI/LFM3-VL-2B, un modelo de 1.728.801.600 parametros (~1,73 mil millones) desarrollado por Liquid AI, y ha sido ajustado por el usuario alpharomercoma para actuar como agente GUI sobre capturas de pantalla de movil. Resuelve el problema de la interaccion autonoma con aplicaciones Android a partir de objetivos en lenguaje natural y una imagen del estado actual de la pantalla.

La relevancia de esta version concreta esta en su empaquetado: al estar en GGUF (Q4_K_M para el modelo de lenguaje y Q8_0 para el proyector de vision), puede servirse con llama.cpp en hardware modesto, incluido un telefono o un equipo sin GPU dedicada. El proyector de vision se mantiene sin cambios respecto al modelo base de LiquidAI, ya que el fine-tune no modifico la torre de vision.

Se trata de un modelo de investigacion, con licencia LFM Open License v1.0, soporte exclusivo de ingles y un contexto de servicio recomendado de 8192 tokens. Su proposito es servir de base reproducible para experimentacion con agentes moviles, no para despliegues autonomos sobre cuentas reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer vision-lenguaje (LFM3-VL de Liquid AI); detalles internos del bloque de lenguaje y de la torre de vision no disponibles |
| Parametros totales | 1.728.801.600 (~1,73 mil millones) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | 8192 tokens en la configuracion de servicio documentada (`-c 8192`) |
| Tipos de cuantizacion | Q4_K_M (modelo de lenguaje) y Q8_0 (proyector de vision `mmproj`) |
| Idiomas soportados | ingles (`en`) |
| Licencia | LFM Open License v1.0 (`lfm1.0`), heredada de LiquidAI/LFM3-VL-2B |
| Formato de pesos | GGUF (modelo de lenguaje y proyector de vision separados) |

## Arquitectura y entrenamiento

El modelo es un fine-tune de LFM3-VL-2B, un modelo multimodal de tipo image-text-to-text que combina una torre de vision con un modelo de lenguaje. En esta version GGUF, el modelo de lenguaje se cuantiza a Q4_K_M y el proyector de vision se mantiene en Q8_0 sin modificar respecto a LiquidAI/LFM3-VL-2B-GGUF, lo que indica que el ajuste supervisado se aplico unicamente sobre el componente de lenguaje y la interfaz de proyeccion, no sobre el codificador visual.

El entrenamiento se realizo exclusivamente sobre demostraciones grabadas de interaccion con Android; el autor indica explicitamente que el modelo nunca interactuo con un telefono real durante el entrenamiento. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni sobre el uso de RLHF o DPO. La conversion a GGUF se realizo con `convert_hf_to_gguf.py` (F16) seguida de `llama-quantize` con Q4_K_M, usando el commit `cd959bae9` de llama.cpp, procedimiento que el autor afirma reproducible byte a byte.

## Capacidades

- Generacion de acciones de agente GUI a partir de una captura de pantalla y un objetivo en lenguaje natural.
- Comprension de imagen-texto (pipeline image-text-to-text): interpreta la captura y produce la siguiente accion.
- Razonamiento en modo "thinking": la configuracion de servicio usa `--reasoning-format deepseek`, lo que indica soporte de trazas de razonamiento estructuradas.
- Procesamiento de imagenes de hasta 1024 tokens por captura (`--image-max-tokens 1024`).
- Historial de texto de hasta 8 pasos de interaccion (memoria limitada, segun el autor).
- Soporte de conversacion multi-turno en formato conversacional.
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- Capacidades multilingues: solo ingles.
- No se documenta soporte de tool calling, function calling, audio ni otras modalidades.

## Casos de uso

- Investigacion en agentes GUI moviles: el modelo permite reproducir experimentos de automatizacion de Android en un entorno controlado, procesando una captura por paso y emitiendo la accion siguiente.
- Pruebas automatizadas de aplicaciones Android: puede utilizarse para generar secuencias de interaccion sobre builds de prueba, con objetivos en ingles y sin acceso a cuentas reales.
- Evaluacion de modelos pequenos en tareas de percepcion de UI: sirve como linea base de 1,73 mil millones de parametros para comparar con modelos mayores en tareas de grounding visual sobre pantallas.
- Despliegue en dispositivos con recursos limitados: al caber en GGUF Q4_K_M (repo de 1,3 GB), puede ejecutarse con llama.cpp en portatiles o telefonos para prototipado offline.
- Generacion de datasets sinteticos de trayectorias: el modelo puede producir pasos de accion que luego se revisan y filtran para ampliar corpus de entrenamiento de agentes.
- Demostraciones y docencia: permite ilustrar el funcionamiento de un agente multimodal sobre Android en un entorno reproducible con llama-server y un unico comando.
- Analisis de capturas de pantalla con instrucciones en lenguaje natural: extraccion de informacion de la UI y propuesta de acciones sin ejecucion real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el repo completo ocupa 1,3 GB; el modelo de lenguaje Q4_K_M ronda 1 GB y el proyector Q8_0 anade unos cientos de MB. La inferencia con contexto de 8192 tokens requiere cache KV adicional, por lo que se recomienda al menos 2-3 GB de memoria total.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM; el autor sirve con `-ngl 99` (todas las capas en GPU). Funciona tambien en CPU.
- Cabe en GPU de consumo: si, en tarjetas como RTX 3060, RTX 4060 o superiores; tambien en iGPU y en telefonos con llama.cpp.
- Opciones de despliegue: llama.cpp (`llama-server`) es el metodo documentado; no se confirma soporte de vLLM, TGI u Ollama en la informacion disponible.
- Parametros de servicio recomendados: `-c 8192 --image-max-tokens 1024 --reasoning-format deepseek -np 1 -ngl 99`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| LFM3-VL-2B-AndroidAgent-v4.1-GGUF | ~1,73 mil millones | 8192 (servicio) | en | LFM Open License v1.0 | GGUF |
| LiquidAI/LFM3-VL-2B (base) | ~1,73 mil millones | no disponible | no disponible | LFM Open License v1.0 | safetensors / GGUF |
| alpharomercoma/LFM3-VL-2B-AndroidAgent-v4.1 (original) | ~1,73 mil millones | no disponible | en | LFM Open License v1.0 | safetensors |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de investigacion: el autor advierte explicitamente de no dejarlo actuar sin supervision en un telefono con cuentas, mensajes o pagos reales.
- Solo acepta objetivos en ingles.
- Procesa una unica captura por paso y no mantiene memoria mas alla de un historial de texto de 8 pasos.
- Entrenado unicamente con demostraciones grabadas; nunca interactuo con un telefono real durante el entrenamiento, lo que puede provocar un desajuste con estados de UI no vistos.
- Riesgo de alucinacion en la identificacion de elementos de la pantalla y en la eleccion de acciones.
- Sesgos: no documentados en la informacion disponible.
- Licencia LFM Open License v1.0: es necesario revisar sus terminos antes de cualquier uso comercial, ya que se trata de una licencia "other" heredada de LiquidAI.
- La cuantizacion Q4_K_M puede degradar la precision respecto al modelo original en safetensors.
- Sin garantias de soporte en servidores de inferencia distintos de llama.cpp.

## Enlaces

- Modelo GGUF: https://huggingface.co/alpharomercoma/LFM3-VL-2B-AndroidAgent-v4.1-GGUF
- Modelo original del fine-tune: https://huggingface.co/alpharomercoma/LFM3-VL-2B-AndroidAgent-v4.1
- Modelo base de LiquidAI en GGUF: https://huggingface.co/LiquidAI/LFM3-VL-2B-GGUF
- Modelo base de LiquidAI: https://huggingface.co/LiquidAI/LFM3-VL-2B
