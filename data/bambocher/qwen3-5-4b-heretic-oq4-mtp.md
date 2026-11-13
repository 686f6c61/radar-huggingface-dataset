# bambocher/Qwen3.5-4B-heretic-oQ4-mtp

## Resumen

Qwen3.5-4B-heretic-oQ4-mtp es una cuantizacion mixta del modelo Qwen3.5-4B en su variante "heretic", publicada por el usuario bambocher en Hugging Face. El checkpoint esta empaquetado en formato MLX (Apple Silicon) y emplea la herramienta oQ de oMLX v0.7.3 para aplicar cuantizacion de precision mixta por tensor, con un promedio efectivo de 5,672 bits por peso sobre el checkpoint completo. El resultado ocupa 3,3 GB en disco y contiene 4.659.865.088 parametros logicos, lo que permite ejecutar un modelo de casi 4,7 mil millones de parametros en equipos con memoria unificada moderada.

El modelo conserva tres componentes diferenciados: el modelo de lenguaje (4,206B parametros), un modulo de vision (0,334B) y una cabeza MTP (Multi-Token Prediction, 0,121B). La presencia de vision y de MTP indica que se trata de un modelo multimodal con decodificacion especulativa integrada, si bien la model card no detalla el funcionamiento concreto de estos modulos. La variante "heretic" hace referencia a un proceso de ablacion de rechazos (reduccion de comportamientos de negativa) aplicado sobre el modelo base, aunque el autor no documenta la metodologia.

La relevancia de esta ficha es doble: por un lado, muestra el estado del arte en cuantizacion mixta asistida por herramienta (oQ) para el ecosistema MLX; por otro, ilustra los riesgos de los checkpoints comunitarios sin model card completa, ya que no se declaran licencia, idiomas ni pipeline. Cualquier uso en produccion exige verificar la procedencia del modelo base Qwen3.5-4B y las condiciones de la licencia original de Qwen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen3.5) con cabeza MTP; cuantizacion mixta oQ |
| Parametros totales | 4.659.865.088 (4,66B) |
| Parametros activos | no disponible (no es MoE segun los datos disponibles) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Affine 4/5/6/8-bit grupo 64 y BF16 (precision mixta, promedio 5,672 bits/peso) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (MLX), 3,3 GB en repo |

Desglose de la cuantizacion por componente:

| Componente | Parametros logicos | Almacenamiento |
|---|---|---|
| Modelo de lenguaje | 4,206B | 2,547 GB |
| Vision | 0,334B | 0,667 GB |
| Cabeza MTP | 0,121B | 0,089 GB |
| **Total** | **4,660B** | **3,304 GB** |

Distribucion por precision:

| Formato | Pesos logicos | Porcentaje | Bits/peso efectivos |
|---|---|---|---|
| Affine 4-bit, grupo 64 | 2,886B | 61,938% | 4,50 |
| Affine 5-bit, grupo 64 | 1,391B | 29,854% | 5,50 |
| Affine 6-bit, grupo 64 | 0,034B | 0,735% | 6,50 |
| Affine 8-bit, grupo 64 | 0,001B | 0,014% | 8,50 |
| BF16 | 0,348B | 7,459% | 16,00 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo Qwen3.5-4B, un transformer multimodal que integra un codificador de vision (0,334B parametros) junto al modelo de lenguaje. La presencia de una cabeza MTP (Multi-Token Prediction) de 0,121B parametros sugiere que el modelo base fue entrenado con un objetivo auxiliar de prediccion de multiples tokens, tecnica habitual para acelerar la decodificacion especulativa en inferencia. No obstante, la model card no describe la arquitectura interna (numero de capas, dimension oculta, atencion, etc.) ni el esquema de entrenamiento.

Sobre el proceso de cuantizacion, el autor indica que uso oQ (oMLX v0.7.3), una herramienta de cuantizacion mixta que asigna precision por tensor segun su sensibilidad. La estrategia resultante concentra el 61,9% de los pesos en 4 bits y el 29,9% en 5 bits, reservando BF16 para el 7,5% de los pesos (probablemente embeddings, capas de normalizacion o tensores criticos). El promedio efectivo de 5,672 bits/peso es coherente con esa mezcla. No se documenta el dataset de calibracion ni el criterio exacto de asignacion de bits.

No hay informacion sobre el proceso "heretic": no se especifica si se aplico ablacion de direcciones de rechazo, fine-tuning con datos especificos o alguna otra tecnica, ni cuantos tokens se usaron en ese ajuste. Tampoco se detalla si hubo RLHF, DPO o fases de alineamiento adicionales sobre el modelo base.

## Capacidades

- Generacion de texto y razonamiento: heredadas del modelo base Qwen3.5-4B, sin verificacion independiente en esta ficha.
- Procesamiento de vision: el checkpoint incluye un modulo de vision de 0,334B parametros, por lo que se espera soporte de entrada de imagenes, aunque la model card no lo confirma explicitamente.
- Prediccion multi-token (MTP): la cabeza dedicada permite, en teoria, decodificacion especulativa para reducir latencia, aunque no se documenta su uso en el runtime MLX.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; no se declaran idiomas.
- Modo thinking: no disponible en la informacion proporcionada.
- Audio: no disponible; no se declara modulo de audio.

## Casos de uso

- Inferencia local en Apple Silicon: el checkpoint esta en formato MLX y ocupa 3,3 GB, por lo que se puede cargar en un Mac con 8-16 GB de memoria unificada usando MLX o mlx-lm. Es adecuado para prototipos y demos en portatiles sin GPU dedicada.
- Asistentes de escritorio con vision: al incluir modulo de vision, puede emplearse para tareas de descripcion de imagenes o extraccion de informacion de capturas, siempre que se valide el comportamiento real del modulo en el runtime MLX.
- Generacion de texto en aplicaciones de baja latencia: la cabeza MTP, si el runtime la explota, permitiria decodificacion especulativa y reducir el tiempo por token en comparacion con un modelo denso equivalente.
- Experimentacion con cuantizacion mixta: sirve como caso de estudio para evaluar la calidad de oQ frente a cuantizaciones uniformes de 4 bits en modelos de ~4B parametros.
- Fine-tuning ligero o adaptadores: al ser un checkpoint MLX de 4,66B parametros, es viable aplicar LoRA o QLoRA en equipos con memoria unificada de 16-24 GB, aunque la cuantizacion mixta complica el flujo estandar.
- Evaluacion de la variante "heretic": util para investigadores que estudian la reduccion de rechazos en modelos pequenos y quieren comparar contra el Qwen3.5-4B original, con la advertencia de que no hay documentacion metodologica.
- Prototipado de pipelines multimodales en local: combinacion de texto e imagen en un solo checkpoint de 3,3 GB, adecuada para pruebas de concepto sin infraestructura cloud.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada: 3,3 GB de pesos en disco; en inferencia MLX se necesita espacio adicional para cache KV y activaciones, estimado en 1-2 GB adicionales segun contexto. Con 8 GB de memoria unificada deberia ser suficiente para contextos moderados; 16 GB dan margen amplio.
- GPU recomendadas: Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra) por el formato MLX. No es directamente compatible con CUDA sin conversion previa.
- GPU consumer: si, en cualquier Mac con chip Apple Silicon y al menos 8 GB de memoria unificada. En GPUs NVIDIA consumer requeriria conversion a GGUF o a safetensors estandar, no incluida en el repo.
- Opciones de despliegue: MLX (mlx-lm), oMLX; para otros runtimes (llama.cpp, Ollama, vLLM, TGI) seria necesaria una conversion de formato no documentada por el autor.
- Latencia y throughput: no disponibles; no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-4B-heretic-oQ4-mtp (este) | 4,66B | no disponible | Mixta 4-8 bit + BF16 (5,672 bits/peso) | no disponible | Hugging Face, formato MLX |
| Qwen3.5-4B (base) | ~4B | no disponible | BF16 original | no disponible en esta ficha | Hugging Face |
| Qwen2.5-3B-Instruct | 3,09B | 32.768 tokens | Multiples (GGUF, AWQ, etc.) | Apache 2.0 | Amplia, todos los runtimes |
| Llama 3.2 3B Instruct | 3,21B | 131.072 tokens | Multiples | Llama 3.2 Community License | Amplia, todos los runtimes |

La comparativa con Qwen2.5-3B y Llama 3.2 3B es orientativa por tamano; no hay datos de rendimiento de este checkpoint que permitan una comparacion cuantitativa. La ventaja principal de este modelo es el formato MLX nativo y la cuantizacion mixta eficiente; su desventaja es la falta de documentacion y de licencia declarada.

## Limitaciones y advertencias

- Licencia no declarada: no se especifica la licencia del checkpoint ni la del modelo base Qwen3.5-4B; el uso comercial queda sin garantia legal hasta verificar la licencia original de Qwen.
- Model card incompleta: no se documentan idiomas, contexto, pipeline, metodologia "heretic" ni dataset de calibracion de la cuantizacion.
- Riesgo de alucinacion: inherente a modelos de ~4B parametros; la cuantizacion mixta puede agravar la degradacion en tareas de razonamiento largo.
- Variante "heretic": la reduccion de rechazos puede aumentar la probabilidad de generar contenido danino o no filtrado; requiere evaluacion de seguridad antes de cualquier despliegue publico.
- Compatibilidad limitada: el formato MLX solo se ejecuta de forma nativa en Apple Silicon; en otros entornos hay que convertir los pesos, con riesgo de perdida de fidelidad.
- Modulo de vision y MTP sin documentar: no se especifica como se activan ni que runtime los soporta; su utilidad practica no esta garantizada.
- Sin benchmarks ni evaluaciones de calidad: no hay evidencia publicada de que la cuantizacion preserve el rendimiento del modelo base.
- Repositorio sin descargas ni likes: no hay senales de validacion comunitaria; conviene tratar el checkpoint como experimental.

## Enlaces

- Hugging Face: https://huggingface.co/bambocher/Qwen3.5-4B-heretic-oQ4-mtp
- Herramienta de cuantizacion oQ (oMLX): https://github.com/jundot/omlx
- Modelo base Qwen3.5-4B: no disponible en la informacion proporcionada
- Paper o blog del modelo base: no disponible
- Repositorio MLX: no disponible en la informacion proporcionada
