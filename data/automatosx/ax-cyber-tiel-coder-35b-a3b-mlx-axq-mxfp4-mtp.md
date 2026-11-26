# AutomatosX/AX-Cyber-Tiel-Coder-35B-A3B-MLX-AXQ-MXFP4-MTP

## Resumen

AX-Cyber-Tiel-Coder-35B-A3B-MLX-AXQ-MXFP4-MTP es un checkpoint cuantizado en formato MLX, publicado por AutomatosX, pensado para ejecutar en Apple Silicon un modelo de lenguaje de tipo mezcla de expertos (MoE) derivado de la familia Qwen3.5-MoE. Parte del modelo base peculiar-ragdoll/Cyber-Tiel-Coder-35B-A3B-MLX-oQ6e-MTP y se ha convertido directamente desde los pesos BF16 de origen mediante el toolkit AXQuant 1.9.0, aplicando una cuantizacion de precision mixta que combina affine, mxfp4 y bf16.

El modelo conserva la ruta de lenguaje cuantizada, mientras que la cabeza de prediccion multi-token (MTP) y la torre de vision se mantienen en BF16, de modo que el paquete puede emplearse tanto para generacion de texto como, potencialmente, para tareas multimodales. Cuenta con 35,11 mil millones de parametros logicos y una ventana de contexto configurada de 262.144 tokens, aunque el limite practico dependera de la memoria unificada del equipo.

Su relevancia actual radica en que ofrece una via para desplegar un MoE de 35B en Macs con memoria unificada, con un peso de safetensors de 22,03 GB y un BPW medido de 4,63 en el modelo principal (4,90 incluyendo MTP). No obstante, el propio autor lo etiqueta como evidencia de desarrollo, no como un release certificado: no publica mediciones de calidad, de contexto largo ni de velocidad de kernels, y el paquete se reconstruira en una revision futura.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5MoeForConditionalGeneration (MoE, familia qwen3.5-moe) |
| Parametros totales | 35.107.180.016 (35,11B logicos) |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens configurados; limite practico segun memoria unificada |
| Tipos de cuantizacion | Precision mixta AXQuant: 4bit (93,52% de parametros), 8bit (1,47%), bf16 (5,01%); metodos affine, bf16 y mxfp4; BPW medido 4,6342 en modelo principal y 4,9013 total con MTP |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX Safetensors (no incluye pesos PyTorch ni GGUF) |

## Arquitectura y entrenamiento

El modelo es un transformer con mezcla de expertos (MoE) de la familia Qwen3.5, con la ruta de texto optimizada para inferencia en Apple Silicon. Incluye una cabeza de prediccion multi-token (MTP) y una torre de vision, ambas preservadas en BF16 en el checkpoint o en un sidecar vinculado cuando este presente; no incorpora componentes de audio. La cuantizacion se ha realizado con AXQuant 1.9.0, que asigna precision por tensor: la mayor parte del modelo queda en 4 bits (33,62B parametros), una fraccion pequena en 8 bits (529,61M) y un 5,01% protegido en BF16 (1,80B), con grupos de cuantizacion de tamano variable.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO en el modelo de origen. Tampoco se documentan innovaciones de entrenamiento mas alla de la propia arquitectura MoE y la cabeza MTP. El autor senala explicitamente que el paquete no aporta evidencia de calidad, de exactitud de la MTP ni de velocidad de kernels, y que el etiquetado AXQ describe una clase de presupuesto de almacenamiento, no una afirmacion de rendimiento.

## Capacidades

- Generacion de texto conversacional y continuacion de prompts, con pipeline declarado de text-generation.
- Razonamiento y generacion de codigo, segun la orientacion "Coder" del modelo base del que deriva.
- Capacidad de vision declarada (vision present: True), con torre visual en BF16; su uso depende de que el runtime cargue el sidecar correspondiente.
- Prediccion multi-token (MTP) presente en el checkpoint, orientada a acelerar la decodificacion especulativa, aunque sin evidencia publicada de velocidad.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles; la model card no declara idiomas.
- Modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Asistencia de programacion en local: el modelo puede generar y completar codigo desde una Mac con memoria unificada suficiente, sin depender de servicios en la nube, gracias a su naturaleza MoE de 35B y a la cuantizacion de 4,63 BPW que reduce el peso a 22,03 GB.
- Analisis de repositorios y documentos largos: con 262.144 tokens de contexto configurados, es adecuado para resumir o razonar sobre codebases extensas y expedientes documentales, siempre que la memoria del equipo permita mantener la ventana completa.
- Prototipado de pipelines multimodales: la presencia de la torre de vision en BF16 permite experimentar con tareas de imagen y texto, como descripcion de capturas o extraccion de informacion de diagramas, si el runtime carga el sidecar visual.
- Evaluacion de tecnicas de cuantizacion: investigadores pueden usar este checkpoint como caso de estudio de precision mixta AXQ frente a los hermanos 4bit y 6bit, comparando BPW, calidad y velocidad en el mismo hardware.
- Desarrollo de asistentes conversacionales de dominio tecnico: su orientacion a codigo y su contexto largo lo hacen util para bots internos que respondan sobre APIs, configuracion o documentacion de ingenieria.
- Experimentacion con decodificacion especulativa: la cabeza MTP incluida permite probar tecnicas de prediccion multi-token en MLX, aunque el autor advierte que no hay evidencia publicada de aceleracion.
- Investigacion reproducible en Apple Silicon: al estar empaquetado para MLX-LM y documentar revisiones y auditorias de formato, sirve como artefacto de referencia para estudiar el comportamiento de MoE cuantizados en hardware Apple.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que el paquete no publica mediciones de calidad, contexto largo, velocidad de kernels ni velocidad de MTP, y que la etiqueta AXQ no debe interpretarse como una afirmacion de benchmark.

## Requisitos de hardware

- VRAM/memoria unificada estimada: al menos 22,05 GB de descarga completa y 22,03 GB de pesos safetensors; en la practica conviene disponer de 32 GB o mas de memoria unificada para cargar el modelo y mantener contexto adicional.
- GPU recomendadas: hardware Apple Silicon con memoria unificada amplia; no esta pensado para GPU NVIDIA ni para CUDA.
- Cabe en consumer GPU: no en el sentido habitual de GPU dedicada; si en equipos Apple con memoria unificada suficiente (por ejemplo, configuraciones de 32, 64 o 128 GB).
- Opciones de despliegue: MLX-LM como runtime principal documentado (probado con MLX 0.32.1 y MLX-LM 0.31.3 en la conversion); AX Engine no esta validado por falta de model-manifest.json nativo. No hay soporte GGUF ni vLLM/TGI declarado.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| AX-Cyber-Tiel-Coder-35B-A3B-MLX-AXQ-MXFP4-MTP | 35,11B (MoE) | 262.144 tokens | MLX Safetensors, 4,90 BPW total | Apache 2.0 | Precision mixta AXQ; MTP y vision en BF16; evidencia de desarrollo |
| AX-Cyber-Tiel-Coder-35B-A3B-MLX-AXQ-4bit-MTP | 35,11B (MoE) | no disponible | MLX Safetensors | Apache 2.0 | Hermano con menor presupuesto de almacenamiento; consultar BPW exacto |
| AX-Cyber-Tiel-Coder-35B-A3B-MLX-AXQ-6bit-MTP | 35,11B (MoE) | no disponible | MLX Safetensors | Apache 2.0 | Hermano con mayor precision media, cerca del presupuesto de 6 BPW |
| peculiar-ragdoll/Cyber-Tiel-Coder-35B-A3B-MLX-oQ6e-MTP | 35,11B (MoE) | no disponible | MLX Safetensors | no disponible | Modelo base del que deriva este checkpoint |

## Limitaciones y advertencias

- El autor califica el paquete como evidencia de desarrollo, no como un release certificado de AXQuant; no hay garantias de calidad ni de exactitud de la MTP.
- El repositorio se reconstruira con una version mejorada del toolkit AXQuant y sera reemplazado por una nueva revision; conviene fijar un commit concreto en despliegues reproducibles.
- No se han publicado mediciones de calidad, contexto largo, velocidad de kernels ni velocidad de MTP; cualquier expectativa de rendimiento es especulativa.
- MLX-LM cubre solo la inferencia de texto/backbone y puede ignorar metadatos de AXQuant y sidecars opcionales (vision.safetensors, mtp.safetensors), por lo que el ejemplo de ejecucion no garantiza aceleracion MTP ni calidad vision-lenguaje.
- AX Engine no esta validado: no se incluye model-manifest.json nativo y los campos de axquant_runtime.json describen un contrato de compatibilidad, no evidencia observada.
- No se declaran idiomas soportados, sesgos conocidos ni tasas de alucinacion; se desconoce el comportamiento multilingue y la robustez en dominios sensibles.
- La licencia Apache 2.0 permite uso comercial, pero el estado de desarrollo y la falta de benchmarks desaconsejan su uso en produccion sin evaluacion propia previa.
- El limite practico de contexto depende de la memoria unificada del equipo; 262.144 tokens es el maximo configurado, no una garantia operativa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AutomatosX/AX-Cyber-Tiel-Coder-35B-A3B-MLX-AXQ-MXFP4-MTP
- Modelo base: https://huggingface.co/peculiar-ragdoll/Cyber-Tiel-Coder-35B-A3B-MLX-oQ6e-MTP/tree/a443d4e30fd5228942cb7695f916f4b14a88fae9
- Hermano 4bit: https://huggingface.co/AutomatosX/AX-Cyber-Tiel-Coder-35B-A3B-MLX-AXQ-4bit-MTP
- Hermano 6bit: https://huggingface.co/AutomatosX/AX-Cyber-Tiel-Coder-35B-A3B-MLX-AXQ-6bit-MTP
- Colecciones de AutomatosX: https://huggingface.co/AutomatosX/collections
- Indice completo del catalogo: https://huggingface.co/collections/AutomatosX/automatosx-mlx-model-catalog
