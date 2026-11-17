# LlamaPal/Qwen3.5-0.8B-Q4_K_M-GGUF

## Resumen

Qwen3.5-0.8B es un modelo de lenguaje de muy pequeno tamano (752.393.024 parametros reales en safetensors, comercializado como "0.8B") desarrollado por Alibaba. Esta ficha cubre concretamente la cuantizacion Q4_K_M en formato GGUF publicada por el usuario LlamaPal, que es un espejo sin modificaciones del archivo generado por Unsloth a partir del modelo base original. El modelo se presenta como parte de la familia Qwen3.5, con una arquitectura hibrida que, segun la model card del autor, esta pensada para conversaciones de contexto muy largo y soporte de 201 idiomas.

El interes de esta publicacion no esta en el modelo en si, sino en su empaquetado para inferencia en dispositivo (on-device): un unico archivo GGUF de 533 MB que cabe en cualquier telefono Android moderno y funciona sin conexion a internet. El pipeline declarado es `image-text-to-text`, lo que sugiere capacidades multimodales en el modelo base, aunque la model card del espejo no detalla como se conservan esas capacidades tras la cuantizacion.

Es relevante ahora porque ejemplifica la tendencia de modelos sub-1B con cuantizacion agresiva para despliegue en movil y edge computing, con licencia Apache 2.0 que permite uso comercial sin restricciones. No obstante, la informacion publicada en este repositorio es escasa: no hay benchmarks, no se detalla el proceso de cuantizacion mas alla del nombre del archivo y no se confirma la longitud de contexto efectiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrida (segun la model card: "hybrid architecture"); detalles no disponibles |
| Parametros totales | 752.393.024 (safetensors del modelo base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (la model card menciona "ultra-long conversations" sin cifra) |
| Tipos de cuantizacion | Q4_K_M (GGUF); existen otras variantes en unsloth/Qwen3.5-0.8B-GGUF |
| Idiomas soportados | 201 idiomas segun la model card del autor |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (archivo `Qwen3.5-0.8B-Q4_K_M.gguf`, 533 MB) |

## Arquitectura y entrenamiento

La model card describe el modelo base como un transformer con "arquitectura hibrida revolucionaria" orientada a conversaciones de contexto muy largo, pero no aporta detalles tecnicos sobre la composicion de esa hibridacion (atencion lineal, SSM, mezcla de capas, etc.). Tampoco se especifica el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF o DPO. El pipeline declarado `image-text-to-text` apunta a un modelo multimodal de entrada (imagen y texto), aunque no se detalla la arquitectura del codificador visual ni si la cuantizacion Q4_K_M preserva dicho codificador en el GGUF.

El proceso de cuantizacion corresponde a Unsloth, que genero el archivo original; LlamaPal solo lo replica byte a byte (mismo SHA-256: `bd258782e35f7f458f8aced1adc053e6e92e89bc735ba3be89d38a06121dc517`). El tag `imatrix` en el repositorio sugiere que la cuantizacion pudo usar una matriz de importancia (importance matrix) para mejorar la calidad de los pesos cuantizados, aunque no se documenta el proceso en la model card. No se describe ninguna innovacion adicional como decodificacion especulativa o modos de razonamiento explicito.

## Capacidades

- Generacion de texto conversacional en 201 idiomas segun el autor, con un tamano de archivo de 533 MB.
- Capacidad multimodal de entrada (imagen y texto) declarada por el pipeline `image-text-to-text` del repositorio; el alcance real tras la cuantizacion no esta documentado.
- Conversaciones de contexto largo, segun la model card, aunque sin cifra concreta de ventana de contexto.
- Inferencia totalmente offline en dispositivo, sin cuenta ni conexion a internet.
- Compatibilidad con llama.cpp y cualquier aplicacion construida sobre el, segun la model card.
- Soporte de tool calling, function calling, agentes o razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo "thinking", vision detallada o audio: no disponible en la informacion proporcionada.

## Casos de uso

- **Chat privado en Android**: la aplicacion LlamaPal descarga este GGUF exacto y permite conversar sin conexion; todo el procesamiento ocurre en el telefono, lo que resulta adecuado para usuarios que no quieren enviar datos a servidores externos.
- **Asistente de bolsillo en zonas sin cobertura**: al no requerir red, el modelo puede usarse para redactar notas, resumir texto pegado o responder dudas en entornos con conectividad intermitente (viajes, obra, zonas rurales).
- **Prototipado rapido de aplicaciones moviles**: desarrolladores que quieran integrar un LLM en una app Android pueden usar este archivo como base con llama.cpp, gracias a su tamano reducido y licencia Apache 2.0.
- **Traduccion y asistencia multilingue ligera**: con 201 idiomas declarados, sirve para traducciones basicas o correccion de texto en un dispositivo de gama media, siempre que se validen las parejas de idiomas de interes.
- **Procesamiento de documentos con imagen en movil**: el pipeline `image-text-to-text` sugiere uso para extraer texto o describir imagenes capturadas con la camara, aunque conviene verificar el comportamiento real tras la cuantizacion.
- **Educacion y aprendizaje sin coste de API**: estudiantes pueden desplegar el modelo en un telefono o en un portatil modesto con llama.cpp para practicar tecnicas de prompting sin depender de servicios en la nube.
- **Base para fine-tuning ligero en edge**: al ser Apache 2.0 y tener menos de 1000 millones de parametros, puede servir como punto de partida para adaptaciones con LoRA en hardware de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **VRAM/RAM estimada**: el archivo Q4_K_M ocupa 533 MB; para inferencia conviene reservar entre 1 y 2 GB de RAM considerando contexto y buffers de llama.cpp.
- **GPU de escritorio**: cualquier GPU con 2 GB o mas de VRAM puede ejecutarlo; modelos como RTX 3060, RTX 4060 o superiores lo mueven con holgura. Tambien funciona en CPU.
- **GPU de datacenter**: A100, H100 o similares no son necesarias; el modelo esta muy por debajo de su capacidad.
- **Consumer GPU**: cabe en practicamente cualquier GPU de consumo moderna e incluso en iGPU y en telefonos Android de gama media.
- **Opciones de despliegue**: llama.cpp, Ollama (importando el GGUF), y aplicaciones basadas en llama.cpp como LlamaPal. vLLM y TGI no estan confirmados para este formato concreto en la informacion disponible.
- **Latencia y throughput**: no disponibles. Por el tamano, se espera una generacion en tiempo real en moviles modernos, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.5-0.8B (este, Q4_K_M) | 752 M | no disponible | Apache 2.0 | GGUF | Multimodal declarado, 201 idiomas |
| Qwen3.5-0.8B (base, safetensors) | 752 M | no disponible | Apache 2.0 | safetensors | Version sin cuantizar de referencia |
| Otros modelos sub-1B comparables | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados en la informacion proporcionada |

No se dispone de datos de rendimiento comparado con alternativas de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- **Informacion tecnica incompleta**: no se publican benchmarks, contexto exacto, composicion del dataset ni detalles de la arquitectura hibrida, lo que dificulta evaluar su calidad real.
- **Riesgo de alucinacion**: con menos de 1000 millones de parametros, la tasa de errores factuales y de invencion de datos es previsiblemente alta; no debe usarse como fuente de verdad sin verificacion.
- **Capacidades multimodales inciertas**: el pipeline declara `image-text-to-text`, pero no se confirma que el codificador visual se conserve en el GGUF Q4_K_M ni como se procesa la imagen en llama.cpp.
- **Contexto no confirmado**: la mencion a "conversaciones ultra-largas" no viene acompanada de una cifra; no se debe asumir una ventana de contexto concreta en produccion.
- **Sesgos**: no documentados; al no conocerse la composicion del dataset de entrenamiento, no es posible evaluar sesgos de genero, idioma o cultura.
- **Licencia**: Apache 2.0 permite uso comercial, pero el repositorio es un espejo no oficial; para produccion conviene referenciar el modelo base original de Qwen y el GGUF de Unsloth.
- **Idiomas**: los 201 idiomas son una afirmacion del autor sin evaluacion publicada; la calidad variara mucho entre lenguas y no esta garantizada en castellano.
- **Repo de terceros**: LlamaPal no es el autor del modelo; la trazabilidad y el soporte dependen de Qwen y Unsloth, no de este repositorio.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/LlamaPal/Qwen3.5-0.8B-Q4_K_M-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B/blob/main/LICENSE
- GGUF original de Unsloth: https://huggingface.co/unsloth/Qwen3.5-0.8B-GGUF
- Commit del archivo replicado: https://huggingface.co/unsloth/Qwen3.5-0.8B-GGUF/tree/6ab461498e2023f6e3c1baea90a8f0fe38ab64d0
- Aplicacion LlamaPal en Google Play: https://play.google.com/store/apps/details?id=com.vishistv.llamapal
- Web de LlamaPal: https://llamapal.cc/
- Instagram de LlamaPal: https://www.instagram.com/llamapalhq/
