# rarevector/Swift-1.5-Qwen3.8-27B-VectorCut-MLX-6bit

## Resumen

Swift-1.5-Qwen3.8-27B-VectorCut-MLX-6bit es una cuantizacion en formato MLX de 6 bits del modelo multimodal `rarevector/Swift-1.5-Qwen3.8-27B-VectorCut-BF16`, publicado por Rare Vector Labs (usuario `rarevector`). Se trata de un derivado del modelo base `ukisai/Swift-1.5-Qwen3.8-27b`, que a su vez parte de `Qwen/Qwen3.8-27B`. El modelo es un VLM (vision-language model) de tipo image-text-to-text, con 27.356.728.560 parametros totales, orientado a inferencia en Apple Silicon mediante la libreria MLX y el runtime oMLX.

La particularidad de esta version es el pipeline propietario "VectorCut", descrito por el autor como una ablacion quirurgica de las capas MLP con compuerta (gated MLP), aplicada sobre el maestro BF16 antes de la cuantizacion. El resultado se presenta como un modelo "uncensored" que, segun la model card, conserva intactos los 333 tensores del codificador visual (en BF16) y los 15 tensores de la cabeza MTP (multi-token prediction), lo que permite mantener velocidad nativa y capacidades de vision tras la cuantizacion.

La relevancia actual es doble: por un lado, ofrece una via para ejecutar un VLM de ~27B en hardware de consumo Apple (unos 21 GB de pesos en 6 bits); por otro, documenta un proceso de cuantizacion que preserva componentes habitualmente degradados (vision y MTP). La licencia es `swift-open-license-1.0` (marcada como "other"), derivada de la licencia del modelo base Swift y de la licencia Apache 2.0 de Qwen3.8-27B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (VLM) basado en Qwen3.8-27B, con codificador visual y cabeza MTP; cuantizado para MLX |
| Parametros totales | 27.356.728.560 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 6 bits (6.661 bpw, group_size=64) en MLX; vision en BF16 |
| Idiomas soportados | multilingual, en, zh, ja, ko, pt, ru, ar, fr, de, es |
| Licencia | swift-open-license-1.0 (categoria "other"); derivada de Swift Open License v1.0 y Apache 2.0 (Qwen3.8-27B) |
| Formato de pesos | safetensors (MLX), ~21 GB; repo de 22.8 GB |

## Arquitectura y entrenamiento

El modelo es un transformer multimodal con pipeline image-text-to-text: un codificador visual procesa las imagenes y un decoder de lenguaje genera la respuesta. La model card confirma la presencia de un cabezal MTP (multi-token prediction) de 15 tensores, utilizado como acelerador de decodificacion, y de un modulo visual de 333 tensores. El autor indica que la cuantizacion MLX mantiene los 333 tensores visuales en BF16 completo y los 15 tensores MTP sin tocar, de modo que la velocidad nativa y la capacidad de vision no se degradan respecto al maestro.

El pipeline "VectorCut" aplica, segun la documentacion, una ablacion quirurgica sobre 105 tensores de las capas gated MLP del maestro BF16 (de un total de 1199 tensores), verificada mediante auditoria SHA-256 byte a byte contra `ukisai/Swift-1.5-Qwen3.8-27b`: 333/333 tensores de vision identicos, 15/15 de MTP identicos y 0 tensores protegidos modificados. No se detalla en la informacion disponible el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF/DPO en el modelo original; tampoco se especifica la innovacion concreta del ajuste "uncensored" mas alla de la ablacion descrita.

## Capacidades

- Generacion de texto conversacional multi-turno en formato image-text-to-text.
- Comprension de imagenes (vision): el codificador visual se conserva en BF16, por lo que se mantiene la capacidad multimodal del maestro.
- Razonamiento y generacion de codigo: capacidad heredada del modelo base Qwen3.8-27B (no verificada con benchmarks en la informacion disponible).
- Soporte multilingue declarado: ingles, chino, japones, coreano, portugues, ruso, arabe, frances, aleman y espanol.
- Decodificacion acelerada mediante la cabeza MTP (multi-token prediction) preservada.
- Orientado a inferencia en Apple Silicon mediante MLX y el runtime oMLX.
- Perfil "uncensored": el autor lo presenta como modelo sin las restricciones de rechazo habituales (sin detalle tecnico adicional en la informacion disponible).
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte explicito de agentes o multi-step reasoning: no disponible en la informacion proporcionada.

## Casos de uso

- Asistente multimodal local en Mac: ejecutar un VLM de ~27B en un Apple Silicon con ~21 GB de pesos en 6 bits, útil para prototipos de vision-lenguaje sin depender de la nube.
- Analisis de documentos e imagenes en escritorio: el codificador visual en BF16 permite extraer informacion de capturas, diagramas o fotos y conversar sobre ellas en local.
- Desarrollo y pruebas de pipelines MLX/oMLX: sirve como referencia para validar cuantizaciones de 6 bits que preservan vision y MTP antes de desplegar en produccion.
- Investigacion sobre cuantizacion y ablacion: el pipeline VectorCut y la auditoria SHA-256 documentada permiten estudiar el impacto de modificar capas gated MLP sobre calidad y velocidad.
- Generacion de codigo y texto tecnico multilingue: cobertura declarada de diez idiomas, incluido espanol, para tareas de redaccion y programacion en entornos locales.
- Experimentacion con modelos sin censura: escenarios de investigacion en los que se necesita estudiar el comportamiento del modelo sin filtros de rechazo, asumiendo las advertencias de la seccion de limitaciones.
- Chat conversacional de contexto largo: aunque la longitud de contexto no se especifica, el formato conversacional y el tamano del modelo lo hacen apto para dialogos multi-turno (verificar limite real antes de produccion).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM unificada estimada: ~21 GB solo para pesos en 6 bits; el repo ocupa 22.8 GB. Hay que sumar el espacio para KV cache y el codificador visual en BF16, por lo que se recomienda un minimo practico de 24-32 GB de memoria unificada.
- Hardware objetivo: Apple Silicon (familia M). No se documenta soporte para GPU NVIDIA en esta variante MLX.
- Cabe en GPU de consumo: en el ecosistema Apple, si en equipos con 32 GB o mas de memoria unificada; en 24 GB el margen es ajustado. En GPUs NVIDIA de consumo no aplica por el formato MLX.
- Opciones de despliegue: MLX y el runtime oMLX (indicados por el autor). vLLM, llama.cpp, Ollama o TGI no se mencionan para esta variante.
- Latencia y throughput: no disponibles en la informacion proporcionada; el autor afirma que la preservacion de MTP permite "velocidad nativa" en oMLX, sin cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Swift-1.5-Qwen3.8-27B-VectorCut-MLX-6bit | 27,36 B | no disponible | MLX safetensors, 6 bits (~21 GB) | swift-open-license-1.0 | Vision y MTP preservados; orientado a Apple Silicon |
| rarevector/Swift-1.5-Qwen3.8-27B-VectorCut-MLX-8bit | 27,36 B (mismo maestro) | no disponible | MLX safetensors, 8 bits (~28 GB) | swift-open-license-1.0 | Mayor precision, mas memoria |
| rarevector/Swift-1.5-Qwen3.8-27B-VectorCut-MLX-4bit | 27,36 B (mismo maestro) | no disponible | MLX safetensors, 4 bits (~15 GB) | swift-open-license-1.0 | Version compacta, menor calidad potencial |
| rarevector/Swift-1.5-Qwen3.8-27B-VectorCut-BF16 | 27,36 B | no disponible | safetensors BF16 (~55 GB) | swift-open-license-1.0 | Maestro de referencia sin cuantizar |

No se dispone en la informacion proporcionada de datos de benchmarks ni de modelos de terceros comparables con cifras verificables; la comparativa se limita a las variantes de la misma familia.

## Limitaciones y advertencias

- Modelo "uncensored": puede generar contenido que otros modelos rechazan; requiere revision y politicas de uso en produccion.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no se documentan evaluaciones de fidelidad.
- La longitud de contexto no se especifica en la informacion disponible; validar antes de usos con documentos largos.
- La ablacion de 105 tensores gated MLP puede afectar a capacidades no cubiertas por la auditoria (que solo verifica vision y MTP).
- Licencia `swift-open-license-1.0` (categoria "other"): revisar los archivos LICENSE y NOTICE antes de uso comercial; hay obligaciones derivadas de la licencia del modelo base Swift y de Apache 2.0 de Qwen3.8-27B.
- Formato MLX: no es portable directamente a ecosistemas CUDA; requiere Apple Silicon y runtime compatible.
- Sin descargas ni likes en el momento de la consulta, y sin benchmarks publicados: madurez y calidad no verificadas de forma independiente.
- Idiomas declarados sin evaluacion publica por idioma; el rendimiento en espanol no esta medido.

## Enlaces

- Hugging Face (este modelo): https://huggingface.co/rarevector/Swift-1.5-Qwen3.8-27B-VectorCut-MLX-6bit
- Maestro BF16: https://huggingface.co/rarevector/Swift-1.5-Qwen3.8-27B-VectorCut-BF16
- Variante MLX 8-bit: https://huggingface.co/rarevector/Swift-1.5-Qwen3.8-27B-VectorCut-MLX-8bit
- Variante MLX 4-bit: https://huggingface.co/rarevector/Swift-1.5-Qwen3.8-27B-VectorCut-MLX-4bit
- Modelo upstream (referencia de la auditoria SHA-256): https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27b
- Modelo original Qwen: https://huggingface.co/Qwen/Qwen3.8-27B
- Perfil del autor: https://huggingface.co/RareVector
- Apoyo al autor: https://ko-fi.com/rarevector
