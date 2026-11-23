# esatapedico/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored-NVFP4

## Resumen

Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored-NVFP4 es un checkpoint cuantizado en formato NVFP4 del modelo DavidAU/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored, publicado por el usuario esatapedico. El modelo base es un ajuste fino de Qwen/Qwen3.8-27B (licencia Apache 2.0) orientado a reducir el numero de tokens de "thinking" manteniendo la calidad de salida. Esta version concreta aplica cuantizacion W4A16 con escalas FP8 E4M3 y tamano de grupo 16, sin datos de calibracion, sobre las capas MLP de las 64 capas y sobre las proyecciones Q, K, V y O de las 16 capas de atencion completa.

El modelo emplea una arquitectura hibrida GatedDeltaNet (Qwen3_5ForCausalLM) con 64 capas, una longitud de contexto de 262.144 tokens y una cabeza MTP (multi-token prediction) que habilita decodificacion especulativa. Con 27.781.427.952 parametros totales, el checkpoint ocupa aproximadamente 25 GB en un unico fichero safetensors, lo que lo hace relevante para despliegues en GPUs Blackwell con soporte nativo de NVFP4 y para pipelines de inferencia de alto throughput con vLLM.

La relevancia actual del modelo radica en combinar un contexto extremadamente largo (256K) con cuantizacion de 4 bits en pesos y cabezas MTP para acelerar la generacion, manteniendo en BF16 el tower de vision, la ruta de atencion lineal, el lm_head, los embeddings y la cabeza MTP. Es un modelo multimodal image-text-to-text, multilingue y con la etiqueta "uncensored" en su denominacion, lo que implica que el ajuste fino redujo los rechazos del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido GatedDeltaNet (Qwen3_5ForCausalLM), 64 capas, 16 capas de atencion completa |
| Parametros totales | 27.781.427.952 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | NVFP4 (W4A16, group size 16, escalas FP8 E4M3, weight only); se planea una familia GGUF |
| Idiomas soportados | en, multilingual |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (compressed-tensors, nvfp4-pack-quantized); GGUF planificado |

## Arquitectura y entrenamiento

El modelo base es un transformer hibrido con 64 capas que combina rutas de atencion completa (16 capas) con una ruta GatedDeltaNet de atencion lineal. Incorpora una cabeza MTP (multi-token prediction) para decodificacion especulativa y soporta entrada image-text-to-text, lo que implica un tower de vision integrado. El contexto declarado es de 262.144 tokens.

El checkpoint aqui descrito es una conversion de cuantizacion, no un entrenamiento nuevo: se aplica compressed-tensors con formato nvfp4-pack-quantized sobre el modelo DavidAU/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored, que a su vez deriva de Qwen/Qwen3.8-27B. La cuantizacion cubre el MLP de las 64 capas y las proyecciones Q, K, V y O de las 16 capas de atencion completa (256 tensores NVFP4 verificados). Permanecen en BF16 el tower de vision, la ruta de atencion lineal (DeltaNet), el lm_head, los embeddings y la cabeza MTP. No se utilizaron datos de calibracion. El ajuste fino TWIN-TURBO del modelo base tiene como objetivo reducir los tokens de razonamiento manteniendo la calidad de salida; no se dispone de detalles sobre el dataset, el numero de tokens de entrenamiento ni sobre si se empleo RLHF o DPO.

## Capacidades

- Generacion de texto conversacional multi-turno con contexto de hasta 262.144 tokens.
- Procesamiento de imagen y texto (pipeline image-text-to-text) mediante tower de vision en BF16.
- Razonamiento con modo "thinking" reducido por el ajuste TWIN-TURBO del modelo base.
- Decodificacion especulativa mediante cabeza MTP, orientada a aumentar el throughput de generacion.
- Soporte multilingue segun la etiqueta del modelo (en, multilingual); el alcance exacto de idiomas no esta detallado.
- Capacidades de codigo y matematicas: no confirmadas explicitamente en la informacion disponible.
- Tool calling / function calling: no confirmado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la informacion disponible.
- Ajuste "uncensored": el modelo base redujo los rechazos respecto al original, segun su denominacion.

## Casos de uso

- Analisis de documentos largos: con 262.144 tokens de contexto, el modelo puede ingerir informes completos, expedientes o bases de codigo extensas en una sola pasada sin fragmentacion, lo que simplifica pipelines de resumen y extraccion.
- Procesamiento de documentos escaneados con imagenes: al ser image-text-to-text, permite extraer y razonar sobre contenido de capturas, formularios o graficos junto al texto asociado.
- Despliegue de alto throughput en GPUs Blackwell: el formato NVFP4 con W4A16 reduce el peso del checkpoint a unos 25 GB y aprovecha las unidades de cuantizacion nativas de estas GPUs, lo que permite servir el modelo con vLLM en tensor parallel 2 (verificado por el autor mediante smoke check).
- Asistentes conversacionales de dominio con contexto largo: conversaciones multi-turno donde el historial completo cabe en la ventana, sin necesidad de resumen intermedio.
- Generacion acelerada con decodificacion especulativa: la cabeza MTP permite generar varios tokens por paso de verificacion, adecuada para aplicaciones interactivas sensibles a la latencia.
- Investigacion sobre cuantizacion NVFP4: el checkpoint sirve como referencia para estudiar el impacto de W4A16 sin calibracion sobre un modelo hibrido con atencion lineal y vision, comparando contra el modelo base en BF16.
- Prototipado en entornos con memoria limitada: el tamano de 25 GB permite cargar el modelo en una sola GPU de 32-48 GB, algo inviable con el modelo base en precision completa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor unicamente menciona un "vLLM smoke check (tensor parallel 2, coherent generation)" como validacion de que la generacion es coherente tras la cuantizacion, sin cifras de MMLU, HumanEval, GSM8K ni metricas de perplexidad.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 25 GB de pesos en NVFP4, mas overhead de activaciones y cache KV; con contexto de 262.144 tokens la cache KV crece de forma significativa y requiere planificacion de memoria.
- GPU recomendadas: GPUs NVIDIA Blackwell con soporte nativo de NVFP4; el autor verifico el funcionamiento con vLLM en tensor parallel 2.
- Cabe en consumer GPU: si, en GPUs con 32 GB o mas de VRAM (por ejemplo, RTX 5090), siempre que el runtime soporte NVFP4; no se confirma compatibilidad con generaciones anteriores.
- Opciones de despliegue: vLLM (verificado por el autor); transformers con compressed-tensors; se planea una familia GGUF en esatapedico/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored-NVFP4-GGUF para llama.cpp/Ollama, aun no publicada.
- Latencia y throughput estimados: no disponibles; la cabeza MTP esta pensada para decodificacion especulativa, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (NVFP4) | 27,78 B | 262.144 | NVFP4 W4A16 | apache-2.0 | Hugging Face, ~25 GB |
| DavidAU/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored | no disponible | no disponible | BF16 (base) | apache-2.0 | Hugging Face |
| Qwen/Qwen3.8-27B | no disponible | no disponible | original | apache-2.0 | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada, por lo que la comparativa se limita a linaje, licencia y formato.

## Limitaciones y advertencias

- La cuantizacion NVFP4 se aplico sin datos de calibracion, lo que puede degradar la calidad respecto al modelo base en BF16; no se han publicado mediciones de esa perdida.
- El ajuste "uncensored" del modelo base implica que puede generar contenido que otros modelos rechazarian; requiere filtros y politicas de moderacion propias en produccion.
- Riesgo de alucinacion inherente a los modelos de lenguaje; el contexto largo no elimina este problema y puede aumentar la confianza en contenido erroneo.
- El soporte de NVFP4 depende del runtime y del hardware; fuera de GPUs Blackwell puede no haber kernels eficientes o puede requerir conversion a otro formato.
- La familia GGUF esta anunciada pero no publicada en el momento de redactar esta ficha, por lo que el despliegue en CPU o en GPUs sin soporte NVFP4 no esta disponible directamente.
- El alcance real del multilingue no esta detallado; la etiqueta solo indica "en, multilingual".
- No se confirman capacidades de tool calling ni de agentes; no deben asumirse sin validacion previa.
- La model card indica que fue escrita con asistencia de IA y contiene enlaces de soporte economico del autor; conviene verificar los datos tecnicos contra el config.json y el modelo base.
- El repositorio tiene 436 descargas y 0 likes, lo que sugiere una validacion comunitaria limitada.

## Enlaces

- Hugging Face (este checkpoint): https://huggingface.co/esatapedico/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored-NVFP4
- Modelo base: https://huggingface.co/DavidAU/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored
- Modelo original: https://huggingface.co/Qwen/Qwen3.8-27B
- Familia GGUF planificada: https://huggingface.co/esatapedico/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored-NVFP4-GGUF
- Sitio del autor: https://www.esatapedico.com
