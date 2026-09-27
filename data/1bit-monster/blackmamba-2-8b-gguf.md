# 1bit-MONSTER/BlackMamba-2.8B-GGUF

## Resumen

BlackMamba-2.8B-GGUF es una conversión a formato GGUF del modelo Zyphra/BlackMamba-2.8B, publicada por el usuario 1bit-MONSTER junto con el código de inferencia necesario para ejecutarlo. Se trata de un modelo base (no ajustado para diálogo) de arquitectura híbrida que combina capas Mamba-1 de espacio de estados con capas de mezcla de expertos (MoE) de tipo Switch, con router sigmoide top-1 y expertos GELU con gating. El modelo cuenta con 2.783.213.584 parámetros totales (unos 2,8 mil millones) y se distribuye bajo licencia Apache 2.0.

Su relevancia práctica es doble. Por un lado, permite ejecutar un modelo SSM+MoE fuera del ecosistema PyTorch, ya que el repositorio incluye el puerto de la arquitectura a un fork propio de llama.cpp (`src/models/blackmamba.cpp`), ausente en el llama.cpp upstream. Por otro, valida esa implementación con métricas concretas: perplejidad de 15,28 ± 0,34 en Wikitext-2 (60 fragmentos de 512 tokens, Q8_0 sobre Vulkan) y una velocidad de decodificación de 229 tok/s en una APU Strix Halo (Radeon 8060S).

El repositorio es de publicación reciente, con 0 descargas y 0 "likes" en el momento de la consulta, y solo incluye un fichero cuantizado en Q8_0. La card advierte explícitamente de que es un modelo base que continúa texto en lugar de conversar, por lo que no cabe esperar comportamiento de asistente sin un ajuste posterior.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: capas Mamba-1 (SSM) alternadas con MoE tipo Switch (router sigmoide top-1 con bias, expertos GELU con gating) |
| Parametros totales | 2.783.213.584 (~2,8 B), dato de safetensors del modelo base |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (único fichero publicado en el repo) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (heredada del modelo base) |
| Formato de pesos | GGUF (`BlackMamba-2.8B-Q8_0.gguf`); el modelo base se distribuye en safetensors |

## Arquitectura y entrenamiento

La arquitectura no es un transformer convencional: combina bloques Mamba-1, un modelo de espacio de estados (SSM) con coste de atención lineal respecto a la longitud de secuencia, con bloques de mezcla de expertos. El router es de tipo Switch con activación sigmoide, top-1 y término de bias, y los expertos usan GELU con gating. Esta combinación busca reducir el coste computacional del attention denso manteniendo capacidad efectiva mediante especialización de expertos.

En cuanto a los datos de entrenamiento, la información disponible no detalla el número de tokens, la composición del dataset ni si hubo fases de RLHF o DPO; hay que remitirse al modelo base Zyphra/BlackMamba-2.8B para esos datos, que no se incluyen en esta ficha. La innovación técnica destacable de esta publicación concreta es de ingeniería: el puerto de la arquitectura a llama.cpp con un kernel Vulkan para el escaneo de Mamba-1, que no existe en el repositorio upstream. El autor reporta que su implementación coincide con el código PyTorch de Zyphra (FP32, CPU) en 96 de 96 posiciones con teacher forcing sobre BlackMamba-1.5B, si bien aclara que el modelo de 2.8B no se validó por separado con esa misma prueba.

## Capacidades

- Generación de texto por continuación: es un modelo base, completa o continúa una secuencia dada, no mantiene un formato de conversación.
- Modelado de lenguaje y estimación de perplejidad sobre corpus de texto.
- Ejecución de inferencia en hardware con soporte Vulkan a través del motor propio del autor.
- Capacidad de servir como referencia para validar implementaciones de Mamba-1 y MoE fuera de PyTorch.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documentan capacidades multilingües específicas.
- No se documentan capacidades de visión, audio, modo de razonamiento (thinking) ni otras modalidades.

## Casos de uso

- Investigación en arquitecturas SSM y MoE: sirve para reproducir la perplejidad del modelo híbrido y compararla con alternativas transformer de tamaño similar, usando el fichero Q8_0 sin necesidad de montar el stack completo de PyTorch.
- Evaluación del impacto de la cuantización: al disponer de la versión Q8_0 y del modelo base en safetensors, permite medir la degradación de perplejidad introducida por la cuantización sobre un mismo corpus (por ejemplo, Wikitext-2 con fragmentos de 512 tokens).
- Autocompletado y continuación de documentos: dado que es un modelo base, encaja en tareas de redacción asistida no conversacional, como completar borradores técnicos o generar variantes de un texto semilla.
- Generación de datos sintéticos por continuación: puede usarse para expandir semillas de texto en pipelines de aumento de datos, siempre que se revise la salida por tratarse de un modelo sin ajuste de instrucciones.
- Inferencia en hardware integrado o de bajo consumo: los 229 tok/s de decodificación medidos en una APU Strix Halo (Radeon 8060S, Vulkan) lo hacen adecuado para prototipos y demostraciones en equipos sin GPU dedicada.
- Desarrollo y depuración de kernels Vulkan para el escaneo de Mamba-1: el fork de llama.cpp del autor sirve como base para trabajar en aceleración de SSM sobre GPUs AMD.
- Validación de portes de arquitecturas no soportadas: el modelo es un caso de prueba para verificar que una implementación alternativa replica el comportamiento del código de referencia.
- Despliegue local de demostraciones de texto: con un fichero de unos 3 GB en Q8_0, cabe en GPUs de gama media y permite montar demos offline sin depender de APIs externas.

## Benchmarks y rendimiento

| Prueba | Configuración | Resultado |
|---|---|---|
| Perplejidad Wikitext-2 | 60 fragmentos de 512 tokens, Q8_0, Vulkan | 15,28 ± 0,34 |
| Perplejidad Wikitext-2 (referencia BlackMamba-1.5B) | Mismo test | 17,84 |
| Coincidencia con PyTorch (teacher forcing) | BlackMamba-1.5B, FP32, CPU | 96/96 posiciones |
| Velocidad de decodificación | Strix Halo (Radeon 8060S), Q8_0, Vulkan | 229 tok/s |

No se han publicado resultados de benchmarks de tareas downstream (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3-4 GB para el fichero Q8_0 de unos 3 GB, más el espacio de la caché KV y el overhead del runtime (estimación, no dato publicado).
- GPU recomendadas: cualquier GPU con soporte Vulkan y al menos 6 GB de memoria; en el extremo alto, A100, H100 o RTX 4090 no aportan ventaja significativa dado el tamaño del modelo.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4070 o superiores, siempre que se disponga de al menos 6 GB de VRAM.
- Funciona también en GPUs integradas: el autor reporta 229 tok/s de decodificación en una Radeon 8060S (APU Strix Halo) vía Vulkan.
- Opciones de despliegue: motor 1bit (`1bit serve -m BlackMamba-2.8B-Q8_0.gguf --device vulkan`) y fork propio de llama.cpp en la rama `1bit/vulkan-upstream`, que incluye el escaneo de Mamba-1 para Vulkan.
- No compatible con llama.cpp upstream: el repositorio oficial no incluye la arquitectura BlackMamba, por lo que tampoco cabe esperar soporte directo en vLLM, Ollama o TGI sin trabajo adicional de portabilidad.
- Latencia y throughput: 229 tok/s en decodificación sobre Strix Halo con Q8_0 y Vulkan; no se publican datos de prefill ni de latencia en otras GPUs.

## Comparativa con modelos similares

| Modelo | Parámetros | Formato | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| 1bit-MONSTER/BlackMamba-2.8B-GGUF | 2,78 B | GGUF (Q8_0) | no disponible | Apache 2.0 | Conversión con motor y fork propios para Vulkan |
| Zyphra/BlackMamba-2.8B | 2,78 B | safetensors | no disponible | Apache 2.0 | Modelo base original en PyTorch; sin cuantización GGUF propia |
| Zyphra/BlackMamba-1.5B | no disponible | safetensors | no disponible | Apache 2.0 | Hermano menor; el autor lo usó para validar el porte con 96/96 posiciones y perplejidad 17,84 |

No se dispone de datos suficientes en la información proporcionada para comparar con alternativas transformer de tamaño equivalente en términos de rendimiento downstream.

## Limitaciones y advertencias

- Es un modelo base: continúa texto en lugar de mantener una conversación; no debe usarse como asistente sin un ajuste posterior.
- No hay datos publicados sobre sesgos; al no conocerse la composición del dataset de entrenamiento, no se pueden evaluar sesgos sistemáticos.
- Riesgo de alucinación inherente a un modelo de lenguaje sin ajuste por instrucciones ni alineación documentada.
- No se especifica la longitud de contexto soportada, lo que dificulta planificar despliegues con secuencias largas.
- Solo se publica la cuantización Q8_0; no hay variantes Q4, Q5 o Q6, lo que limita el ajuste fino entre tamaño y calidad.
- El soporte de idiomas no está documentado; el rendimiento fuera del inglés es desconocido.
- Requiere un fork específico de llama.cpp y un kernel Vulkan propio; esto añade coste de mantenimiento y riesgo de divergencia respecto al upstream.
- La validación del porte solo se realizó con teacher forcing sobre BlackMamba-1.5B; el modelo de 2.8B no se verificó por separado con esa prueba.
- La licencia Apache 2.0 permite uso comercial, pero al derivar de un modelo base del que no se detallan los datos de entrenamiento, conviene revisar las condiciones del modelo original antes de un despliegue en producción.
- Repositorio con 0 descargas y 0 "likes": no hay evidencia de uso comunitario ni de soporte a largo plazo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/1bit-MONSTER/BlackMamba-2.8B-GGUF
- Modelo base: https://huggingface.co/Zyphra/BlackMamba-2.8B
- Motor 1bit: https://github.com/1bit-MONSTER/engine
- Fork de llama.cpp con soporte BlackMamba: https://github.com/1bit-MONSTER/llama.cpp
- La búsqueda web no devolvió resultados relevantes sobre este modelo; las entradas encontradas trataban sobre el concepto de bit y sobre la plataforma 1Bit AI, sin relación con esta publicación.
