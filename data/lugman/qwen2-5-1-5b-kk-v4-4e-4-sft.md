# lugman/Qwen2.5-1.5B-KK-v4-4e-4-SFT

## Resumen

Qwen2.5-1.5B-KK-v4-4e-4-SFT es un ajuste fino (SFT) del modelo Qwen2.5-1.5B-Instruct, publicado por el usuario lugman en Hugging Face. Se trata de un modelo de generacion de texto de 1.543.714.304 parametros (aproximadamente 1,5 mil millones) construido sobre la arquitectura Qwen2, un transformer decoder-only denso. El entrenamiento se realizo con Unsloth y la libreria TRL de Hugging Face, segun indica la model card, lo que sugiere un proceso de fine-tuning supervisado acelerado sobre el checkpoint instructivo original.

El modelo hereda las capacidades base de Qwen2.5-1.5B-Instruct: generacion de texto conversacional, comprension multilingue y soporte de contexto largo, aunque la model card solo declara el idioma ingles. El sufijo "KK-v4-4e-4-SFT" en el nombre hace referencia a la version del experimento y a la tasa de aprendizaje empleada (4e-4), lo que indica que se trata de una iteracion de un proceso de ajuste mas amplio del mismo autor.

Su relevancia es limitada pero practica: al ser un modelo pequeno (1,5B), puede ejecutarse en GPUs de consumo y en CPU, y la licencia Apache 2.0 permite uso comercial sin restricciones adicionales. No obstante, la ausencia de documentacion detallada sobre el dataset de ajuste, los resultados y las capacidades especificas hace que deba evaluarse con cautela antes de usarlo en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parametros totales | 1.543.714.304 (aprox. 1,5B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la model card; el modelo base Qwen2.5-1.5B-Instruct soporta 32.768 tokens (dato del modelo base, no confirmado para este fine-tune) |
| Tipos de cuantizacion | no disponible en la model card; al ser compatible con transformers y safetensors, admite cuantizacion estandar (GPTQ, AWQ, GGUF) mediante herramientas externas |
| Idiomas soportados | en (segun la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen2, un transformer decoder-only con atencion por causalidad, normalizacion RMSNorm, activacion SwiGLU y embeddings rotatorios (RoPE). El checkpoint de partida es unsloth/Qwen2.5-1.5B-Instruct, una version optimizada para entrenamiento del modelo instructivo de Qwen. El ajuste se realizo mediante SFT (supervised fine-tuning) con la libreria TRL y el framework Unsloth, que aplica optimizaciones de memoria y velocidad (kernel fusionado, offloading selectivo) para reducir el coste del entrenamiento.

La model card no especifica el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas adicionales como RLHF o DPO. El nombre del repositorio sugiere una tasa de aprendizaje de 4e-4 y una cuarta version del experimento ("v4"), pero no se aportan mas detalles sobre hiperparametros, epochs o datos utilizados. Tampoco se documentan innovaciones tecnicas propias mas alla del uso de Unsloth.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada del modelo base Qwen2.5-1.5B-Instruct.
- Razonamiento basico y respuesta a instrucciones en ingles.
- Generacion de codigo y matematicas a nivel de modelo pequeno (capacidad limitada por el tamano).
- Soporte de tool calling / function calling: no confirmado en la model card; el modelo base Qwen2.5-Instruct lo soporta, pero no hay garantia de que el fine-tune lo preserve.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: la model card solo declara ingles; el modelo base soporta varios idiomas, pero el fine-tune podria haber degradado esa capacidad.
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Prototipado rapido de asistentes conversacionales: el modelo puede gestionar dialogos multi-turno en ingles con un coste computacional bajo, adecuado para pruebas de concepto en entornos con GPUs modestas.
- Clasificacion y etiquetado de texto: fine-tunes pequenos como este son utiles para tareas de clasificacion o extraccion de informacion cuando se ajustan posteriormente con datos propios.
- Generacion de respuestas en chatbots de bajo volumen: al caber en GPUs de consumo, puede desplegarse en entornos de desarrollo o en edge devices para tareas de atencion al cliente simples.
- Educacion y experimentacion: sirve como base para estudiar el efecto del SFT y comparar con el checkpoint instructivo original en tareas controladas.
- Generacion de codigo asistida en entornos locales: aunque limitado por el tamano, puede usarse para autocompletar fragmentos simples en editores o scripts.
- Investigacion sobre fine-tuning eficiente: el uso de Unsloth y TRL lo convierte en un ejemplo practico para reproducir pipelines de SFT con recursos limitados.
- Traduccion o resumen en ingles: si el fine-tune no ha degradado las capacidades base, puede emplearse para tareas de resumen extractivo o traduccion simple.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 3,1 GB solo para pesos (1,543B parametros x 2 bytes), mas overhead de activaciones y cache KV; en la practica, unos 4-6 GB para contexto moderado.
- VRAM estimada en cuantizacion 8-bit: aproximadamente 1,6 GB para pesos; en 4-bit, aproximadamente 0,8 GB para pesos.
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM para fp16 (RTX 3060, RTX 4060, RTX 4090); para cuantizacion 4-bit, cabe en GPUs con 2-4 GB o incluso en CPU.
- Cabe en GPU de consumo: si, en la mayoria de GPUs modernas (RTX 3060 en adelante) e incluso en iGPUs con cuantizacion agresiva.
- Opciones de despliegue: transformers (nativo), vLLM, llama.cpp (tras conversion a GGUF), Ollama (tras conversion), TGI (text-generation-inference, etiquetado en el repo).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; al ser un modelo de 1,5B, se espera un throughput alto en GPUs modernas (del orden de cientos de tokens por segundo en A100/H100), pero no hay datos confirmados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen2.5-1.5B-KK-v4-4e-4-SFT | 1,5B | no disponible (base: 32.768) | Apache 2.0 | Hugging Face |
| Qwen2.5-1.5B-Instruct | 1,5B | 32.768 | Apache 2.0 | Hugging Face |
| Llama-3.2-1B-Instruct | 1,2B | 128.000 | Llama 3.2 Community License | Hugging Face |
| SmolLM2-1.7B-Instruct | 1,7B | 8.192 | Apache 2.0 | Hugging Face |

La comparativa se limita a parametros, contexto y licencia; no hay datos de rendimiento publicados para el modelo de lugman que permitan comparar calidad. El modelo base Qwen2.5-1.5B-Instruct es la referencia mas directa, y el fine-tune deberia evaluarse contra el en tareas concretas antes de adoptarlo.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al heredar del modelo base Qwen2.5, puede reproducir sesgos presentes en los datos de entrenamiento originales.
- Riesgo de alucinacion: alto en modelos de 1,5B, especialmente en tareas de razonamiento complejo o generacion de hechos.
- Limitaciones de contexto o idioma: la model card solo declara ingles; el fine-tune podria haber degradado el soporte multilingue del modelo base. La longitud de contexto no esta confirmada para este checkpoint.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion, pero se recomienda verificar que el modelo base y los datos de ajuste no impongan restricciones adicionales.
- Caveats para produccion: no hay documentacion sobre el dataset de entrenamiento, lo que impide evaluar la calidad y los sesgos del fine-tune; el repositorio tiene 0 descargas y 0 likes, lo que sugiere que no ha sido validado por la comunidad; el tamano del repo (12,4 GB) es inusualmente grande para un modelo de 1,5B, lo que podria indicar la presencia de multiples checkpoints o archivos adicionales no documentados.
- No se recomienda su uso en produccion sin una evaluacion previa contra el modelo base en las tareas objetivo.

## Enlaces

- Hugging Face: https://huggingface.co/lugman/Qwen2.5-1.5B-KK-v4-4e-4-SFT
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-1.5B-Instruct
- Unsloth (repositorio): https://github.com/unslothai/unsloth
- TRL (Hugging Face): https://github.com/huggingface/trl
