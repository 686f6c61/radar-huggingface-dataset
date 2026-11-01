# lugman-madhiai/LFM2.5-350M-SmolDataEnvs-Easy-SFT-r16-a32-lr2e-4

## Resumen

LFM2.5-350M-SmolDataEnvs-Easy-SFT-r16-a32-lr2e-4 es un ajuste fino (fine-tune) comunitario del modelo LFM2.5-350M de LiquidAI, publicado en Hugging Face por el usuario lugman-madhiai. Se trata de un modelo de generación de texto conversacional de tamaño muy reducido (354,5 millones de parámetros), entrenado mediante SFT (supervised fine-tuning) con la biblioteca Unsloth y TRL de Hugging Face, como indica la model card del autor.

El nombre del repositorio sugiere que el ajuste se ha realizado sobre un dataset denominado "SmolDataEnvs" en su variante "Easy", con hiperparámetros LoRA concretos: rango r=16, alpha a=32 y tasa de aprendizaje 2e-4. Sin embargo, la model card no incluye descripción del dataset, datos de entrenamiento ni evaluaciones, por lo que la finalidad exacta del fine-tune no está documentada.

El modelo base LFM2.5-350M pertenece a la familia LFM (Liquid Foundation Models) de LiquidAI, una arquitectura híbrida eficiente pensada para ejecutarse en dispositivos con recursos limitados. La relevancia de esta ficha radica en ilustrar el ecosistema de fine-tunes ligeros y de bajo coste que se generan sobre modelos base compactos, aunque en este caso la documentación disponible es mínima y varios datos técnicos no están disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM2 (familia Liquid Foundation Models); detalle exacto no disponible |
| Parametros totales | 354.483.968 (dato real de safetensors) |
| Parametros activos | no disponible (no consta si es MoE; probablemente modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en precision original; tamano de repo 2,1 GB) |
| Idiomas soportados | Ingles (según tags del repo) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con transformers y endpoints de inferencia) |

## Arquitectura y entrenamiento

El modelo es un fine-tune de LiquidAI/LFM2.5-350M, un modelo de la familia LFM2 de LiquidAI. La familia LFM se caracteriza por arquitecturas híbridas que combinan capas convolucionales gated (inspiradas en modelos de espacio de estados tipo LIV/STU) con capas de attention estándar, buscando un equilibrio entre calidad y latencia en dispositivos edge. Los detalles concretos de la arquitectura de esta versión derivada no están documentados en la model card.

El entrenamiento se realizó con Unsloth (que acelera el fine-tuning LoRA/QLoRA) y la biblioteca TRL de Hugging Face. Los hiperparámetros inferibles del nombre del repositorio son: LoRA con rango 16 y alpha 32, y tasa de aprendizaje de 2e-4. El dataset, presumiblemente "SmolDataEnvs" en variante "Easy", no está descrito: no se conoce su tamaño, composición, número de tokens de entrenamiento ni si se aplicaron técnicas posteriores como DPO o RLHF. No hay información sobre innovaciones técnicas específicas en este fine-tune.

## Capacidades

- Generacion de texto conversacional en ingles (pipeline text-generation, tag conversational).
- Hereda las capacidades generales del modelo base LFM2.5-350M, aunque el efecto del fine-tune no está documentado.
- Capacidades de razonamiento, codigo, matematicas o vision: no disponible (sin documentacion).
- Tool calling / function calling: no disponible.
- Soporte de agentes o razonamiento multi-paso: no disponible.
- Capacidades multilingues: no documentadas; el repo solo declara ingles.
- Compatibilidad con la libreria transformers de Hugging Face y con endpoints de inferencia gestionados.

## Casos de uso

- Experimentacion con fine-tuning ligero: al tratarse de un modelo de 354 M de parametros, es util como punto de partida para probar recetas LoRA (r=16, alpha=32, lr=2e-4) en hardware modesto antes de escalar a modelos mayores.
- Prototipado de asistentes conversacionales en ingles: puede integrarse en chats simples de baja latencia donde la calidad maxima no es critica.
- Despliegue en dispositivos edge o embebidos: el tamano reducido del modelo base LFM2.5-350M lo hace adecuado para ejecucion local en portatiles, SBC o moviles con memoria limitada.
- Generacion de texto en entornos de datos ("DataEnvs", segun el nombre del dataset): si el fine-tune se centro en tareas de entornos de datos, podria usarse para consultas o tareas relacionadas, aunque sin documentacion esto es especulativo.
- Evaluacion comparativa de fine-tunes comunitarios: util para investigadores que estudian el impacto de distintos hiperparametros LoRA sobre un mismo modelo base.
- Integracion en pipelines de inferencia gestionados: al estar marcado como endpoints_compatible, puede desplegarse directamente en los Inference Endpoints de Hugging Face para pruebas rapidas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye evaluaciones de MMLU, HumanEval, GSM8K ni ninguna otra metrica, ni comparaciones con el modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia: con 354,5 millones de parametros en FP16 (aproximadamente 0,7 GB de pesos) y el tamano de repo de 2,1 GB como referencia, el modelo deberia ejecutarse con menos de 2 GB de VRAM; no hay cifras oficiales.
- GPU recomendadas: no se requieren GPU de gama alta; cualquier GPU consumer moderna (por ejemplo, GTX 1650, RTX 3060 o RTX 4060) es mas que suficiente. Tambien es viable la inferencia en CPU.
- Consumer GPUs: cabe sobradamente en practicamente cualquier GPU consumer actual, incluso en las de gama de entrada, y probablemente en dispositivos sin GPU dedicada.
- Opciones de despliegue: transformers de Hugging Face (formato nativo), Inference Endpoints de Hugging Face (endpoints_compatible). El uso con llama.cpp u Ollama requeriria conversion a GGUF, que no esta publicada en el repo. No hay informacion sobre vLLM o TGI.
- Latencia y throughput estimados: no disponible, aunque por su tamano (354 M de parametros) cabe esperar latencias bajas incluso en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Licencia | Contexto | Notas |
|---|---|---|---|---|
| LFM2.5-350M-SmolDataEnvs-Easy-SFT (este) | 354,5 M | Apache 2.0 | no disponible | Fine-tune comunitario SFT con Unsloth/TRL, sin benchmarks publicados |
| LiquidAI/LFM2.5-350M (base) | 354,5 M | Apache 2.0 | no disponible | Modelo base de LiquidAI, mejor documentado y con soporte del proveedor |
| Qwen2.5-0.5B-Instruct | 494 M | Qwen (uso comercial permitido con condiciones) | 32.768 tokens | Alternativa compacta con documentacion y benchmarks amplios |

Para alternativas adicionales de tamano similar (por ejemplo, otros fine-tunes de LFM2 o modelos como SmolLM2 de Hugging Face), la informacion disponible en esta ficha no permite una comparacion detallada de rendimiento.

## Limitaciones y advertencias

- Documentacion practicamente inexistente: la model card no describe el dataset, el objetivo del fine-tune ni evaluaciones, lo que dificulta verificar la utilidad real del modelo frente al base.
- Riesgo de alucinacion: no evaluado; al tratarse de un modelo muy pequeno (354 M) con fine-tune sin documentar, el riesgo es alto y no hay mitigaciones documentadas.
- Sesgos conocidos: no disponibles; heredaria los sesgos del modelo base y del dataset de fine-tune, ambos sin analisis publicado.
- Limitacion de idioma: el repo solo declara ingles; el rendimiento en castellano u otros idiomas no esta verificado.
- Contexto: la longitud de ventana de contexto no esta documentada en esta ficha, lo que limita el diseno de aplicaciones con documentos largos.
- Licencia: Apache 2.0 permite uso comercial, redistribucion y modificacion con atribucion; sin restricciones destacables.
- Advertencia para produccion: al ser un fine-tune comunitario con 237 descargas y sin comunidad activa (0 likes), no hay garantias de mantenimiento, actualizaciones ni soporte; para produccion se recomienda evaluar primero el modelo base oficial de LiquidAI.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lugman-madhiai/LFM2.5-350M-SmolDataEnvs-Easy-SFT-r16-a32-lr2e-4
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-350M
- Unsloth (herramienta de entrenamiento): https://github.com/unslothai/unsloth
- TRL de Hugging Face (herramienta de entrenamiento): https://github.com/huggingface/trl
