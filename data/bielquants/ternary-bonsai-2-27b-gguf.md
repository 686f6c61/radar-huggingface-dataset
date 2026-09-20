# bielquants/Ternary-Bonsai-2-27B-gguf

## Resumen

Ternary-Bonsai-2-27B es una cuantizacion ternaria de 2 bits del modelo Bonsai 2 27B de Prism ML, publicado en HuggingFace por el usuario bielquants. El modelo subyacente deriva de Qwen3.8-27B y conserva su arquitectura de atencion hibrida (~75% atencion lineal, ~25% atencion completa) con 262K tokens de contexto, pero sustituye los pesos de lenguaje por valores ternarios {-1, 0, +1} con escalado FP16 por grupo de 128 pesos (formato "ternary g128"). El resultado es un modelo de 27,36B parametros que ocupa 5,95 GB en disco (empaquetado PTQ1_0) o 7,21 GB (PQ2_0), frente a los ~54 GB de una build FP16.

La propuesta de valor es mantener comportamiento de razonamiento, matematicas, codigo y uso de herramientas en el regimen sub-4-bit, donde las representaciones convencionales se degradan. El autor reporta una media de 84,78 puntos en 14 benchmarks en modo thinking, un 98,2% de la inteligencia de la build FP16, con matematicas a 96,57 y codigo a 89,42, a menos de 0,4 puntos de una build UD-Q4_K_XL que ocupa el triple. La cobertura ternaria alcanza embeddings, proyecciones de atencion, proyecciones MLP y LM head, sin tensores en precision alta "escondidos" dentro del etiquetado de 2 bits; la torre de vision se distribuye aparte como paquete mmproj Q8_0.

Es relevante ahora porque demuestra inferencia de un modelo de clase 27B en un portatil (el autor reporta ~47 tok/s en un Apple M5 Max) mediante kernels personalizados de atencion hibrida ternaria para llama.cpp en CUDA, Metal y CPU. Requiere, sin embargo, el fork de llama.cpp de Prism ML: el formato no es un GGUF estandar de llama.cpp y depende de la transformada de rotacion Hadamard declarada en metadatos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal de atencion hibrida (~75% lineal / ~25% completa), SwiGLU MLP, RoPE, RMSNorm; 64 bloques en el backbone de lenguaje y 27 bloques en la torre de vision |
| Parametros totales | 27,36B segun la model card (24,35B backbone de lenguaje + 2,54B embeddings/LM head + 0,46B torre de vision). El recuento de safetensors del repo indica 26.895.998.464 parametros (~26,90B); la discrepancia no esta explicada en la informacion disponible |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | 262K tokens (heredada del modelo base) |
| Tipos de cuantizacion | Ternaria g128 ({-1, 0, +1} con escala FP16 por grupo de 128 pesos), empaquetada como PTQ1_0 (1,75 bits/peso; 5,95 GB) o PQ2_0 (2,13 bits/peso; 7,21 GB). El proyector de vision es Q8_0. Otras cuantizaciones (Q4_K_M, Q8_0 del modelo de lenguaje, etc.): no disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp), con metadatos de rotacion Hadamard y kernels ternarios personalizados; existe un companero en MLX (Ternary-Bonsai-2-27B-mlx-2bit) |

## Arquitectura y entrenamiento

La arquitectura es la de Qwen3.8-27B sin cambios estructurales: transformer causal de atencion hibrida en el que aproximadamente el 75% de las capas usan atencion lineal y el 25% restante atencion completa, lo que hace viable sostener 262K tokens de contexto en dispositivo. El MLP es SwiGLU, con RoPE y RMSNorm. La cuantizacion no altera el grafo: los pesos ternarios se consumen directamente en los kernels, sin expansion a FP16.

El proceso de cuantizacion es post-entrenamiento (PTQ). Cada peso toma un valor en {-1, 0, +1} compartiendo un factor de escala FP16 por grupo de 128 pesos; un trit transporta log2(3) ≈ 1,585 bits, y el coste efectivo del formato es de ~1,71 bits/peso, que contando los pocos tensores por encima de la representacion ternaria asciende a 1,72 bits/peso en el modelo completo (una reduccion idealizada de ~9,3x frente a FP16). Antes de la asignacion ternaria, cada matriz se transforma en bloques mediante una rotacion ortogonal de Hadamard (bloque de 1024, signos ±1 fijos) que queda plegada en los pesos almacenados; en tiempo de inferencia el runtime aplica la transformada equivalente a las activaciones. El archivo declara su rotacion como metadatos, de modo que un runtime sin la transformacion correspondiente rechaza cargar el fichero. No hay informacion disponible sobre el numero de tokens de entrenamiento, la composicion del dataset ni sobre etapas de RLHF o DPO en la cuantizacion; esos datos pertenecen al modelo base Qwen3.8-27B, no incluidos en la informacion proporcionada.

## Capacidades

- Generacion de texto conversacional en modo base y en modo thinking (razonamiento explicito).
- Razonamiento matematico: 96,57 en la metrica de matematicas reportada por el autor, a medio punto de la build de precision completa.
- Generacion de codigo: 89,42, al nivel de la linea base segun el autor.
- Tool calling y comportamiento agentico: 74,92 en la metrica de tool calling agentico reportada.
- Razonamiento multi-paso y comportamiento agentico preservados en el regimen sub-4-bit, segun la model card.
- Contexto largo de 262K tokens, apoyado en el backbone de atencion predominantemente lineal.
- Vision opcional (entrada de imagen) mediante el paquete mmproj Q8_0 de ~0,63 GB, que debe cargarse aparte y solo cuando se requiere entrada de imagen.
- Despliegue en CPU, CUDA y Metal a traves de llama.cpp; variante MLX para Apple Silicon.
- Capacidades multilingues: no disponible.
- Soporte de audio: no disponible.

## Casos de uso

- Asistente de razonamiento en portatil: con 5,95 GB de pesos (PTQ1_0) el modelo cabe en un equipo de gama alta con GPU integrada o discreta de consumo, y el autor reporta ~47 tok/s en un Apple M5 Max. Es adecuado para asistentes locales con modo thinking activado sin depender de red.
- Analisis de documentos extensos: los 262K tokens de contexto permiten cargar contratos, informes o expedientes completos en una sola pasada, y la atencion predominantemente lineal reduce el coste de la ventana larga frente a un transformer de atencion completa equivalente.
- Revisión de repositorios de codigo: con 89,42 en la metrica de codigo, se puede usar para explicar modulos, detectar incoherencias entre ficheros o proponer refactorizaciones dentro de un mismo prompt que incluya varios archivos.
- Agentes locales con tool calling: el modelo conserva capacidades de llamada a herramientas (74,92), por lo que puede integrarse en bucles de agente que consulten APIs internas, bases de datos o el sistema de ficheros, ejecutandose en hardware local.
- Despliegue en entornos con requisitos de privacidad o air-gapped: al poder ejecutarse en una sola maquina sin conexion, los datos no salen del perimetro; el tamano reducido simplifica el aprovisionamiento de imagenes y contenedores.
- Servicio multiusuario con llama.cpp: los 5,95-7,21 GB de pesos dejan margen de VRAM en GPUs de 12-24 GB para cache KV y varias secuencias concurrentes, lo que permite servir un modelo de clase 27B en una unica GPU de gama media en lugar de en un nodo multi-GPU.
- Procesamiento de documentos con componente visual: cargando el mmproj Q8_0 se puede extraer texto o describir imagenes escaneadas antes de pasarlas al razonamiento de texto, todo dentro del mismo runtime.
- Investigacion en cuantizacion de bajo bit: el modelo sirve como referencia reproducible para estudiar el comportamiento de pesos ternarios con rotacion Hadamard y kernels dedicados en CUDA/Metal, comparando PTQ1_0 frente a PQ2_0.

## Benchmarks y rendimiento

Los unicos datos publicados en la informacion disponible son los agregados de la model card. No se desglosan por nombre de benchmark (MMLU, HumanEval, GSM8K u otros), de modo que se reproducen tal cual y se marcan como no disponibles los detalles.

| Metrica | Resultado |
|---|---|
| Media en 14 benchmarks en modo thinking | 84,78 |
| Matematicas | 96,57 (a menos de 0,5 puntos de la precision completa) |
| Codigo | 89,42 (al nivel de la linea base) |
| Tool calling agentico | 74,92 |
| Retencion de inteligencia frente a FP16 | 98,2% |
| Build IQ2_XXS convencional (referencia del autor) | 72,59 |
| Build UD-Q4_K_XL (referencia del autor) | A menos de 0,4 puntos de diferencia, con el triple de huella |
| Desglose por benchmark concreto (MMLU, HumanEval, GSM8K, etc.) | No disponible |
| Rendimiento en modo no-thinking | No disponible |
| Evaluacion multilingue | No disponible |

## Requisitos de hardware

- Pesos en disco: 5,95 GB (PTQ1_0, 1,75 bits/peso) o 7,21 GB (PQ2_0, 2,13 bits/peso). El ideal teorico a 1,72 bits/peso es de 5,8 GB.
- Vision: 0,63 GB adicionales si se carga el paquete mmproj Q8_0.
- VRAM estimada para inferencia: los pesos son el componente dominante; una estimacion derivada del tamano declarado situa el consumo minimo en torno a 7-9 GB con PTQ1_0 y 9-11 GB con PQ2_0, incluyendo overhead de runtime y cache KV para contextos moderados. El tamano de la cache KV a 262K tokens no esta especificado en la informacion disponible.
- GPU recomendadas: no disponibles en la model card. No se publican cifras de throughput para CUDA. Dado el tamano de pesos, cualquier GPU con suficiente VRAM (incluidas RTX 4090, A100 o H100) puede alojar el modelo con amplitud, pero no hay validaciones ni numeros oficiales por modelo de GPU.
- Compatibilidad con GPU de consumo: si, es el escenario objetivo declarado ("on-device", "full 27B-class reasoning on a standard laptop or a single GPU"). El unico dato de rendimiento publicado es de ~47 tok/s en un Apple M5 Max mediante Metal.
- Opciones de despliegue: llama.cpp a traves del fork de Prism ML (kernels ternarios para CUDA y Metal, mas CPU); el llama.cpp estandar no soporta estos formatos segun la informacion disponible. Para Apple Silicon existe el companero MLX (repositorio prism-ml/Ternary-Bonsai-2-27B-mlx-2bit). vLLM, TGI, Ollama y otros motores: no disponible.
- Latencia y throughput: ~47 tok/s en Apple M5 Max (dato del autor). Resto de plataformas: no disponible.

## Comparativa con modelos similares

Los datos disponibles solo permiten comparar con las builds de referencia citadas por el autor y con la variante MLX del mismo modelo. No se dispone de informacion sobre otros modelos ternarios o de 2 bits comparables.

| Modelo / build | Parametros | Contexto | Tamano desplegado | Puntuacion media | Licencia |
|---|---|---|---|---|---|
| Ternary-Bonsai-2-27B (PTQ1_0) | 27,36B (26,90B segun safetensors) | 262K | 5,95 GB | 84,78 | Apache 2.0 |
| Ternary-Bonsai-2-27B (PQ2_0) | 27,36B | 262K | 7,21 GB | No disponible (mismo modelo, distinto empaquetado) | Apache 2.0 |
| Build IQ2_XXS convencional | No disponible | No disponible | Mas de 1,5 veces la huella de PTQ1_0 | 72,59 | No disponible |
| Build UD-Q4_K_XL (4 bits) | No disponible | No disponible | Aproximadamente el triple de la huella de PTQ1_0 | Por encima en menos de 0,4 puntos | No disponible |
| Ternary-Bonsai-2-27B-mlx-2bit | 27,36B | 262K | No disponible | No disponible | No disponible |
| Qwen3.8-27B en FP16 (referencia) | 27B | 262K | ~54 GB | 100% (linea base) | No disponible en esta ficha |

## Limitaciones y advertencias

- Esta publicacion es una cuantizacion de terceros (usuario bielquants) del modelo Bonsai 2 27B de Prism ML; conviene verificar integridad y procedencia frente a las publicaciones oficiales antes de usarla en produccion.
- El formato no es GGUF estandar: requiere el fork de llama.cpp de Prism ML con los kernels ternarios. En runtimes sin la transformada de Hadamard correspondiente, el fichero se rechaza al cargar.
- Discrepancia en el recuento de parametros: la model card declara 27,36B y los safetensors del repo 26.895.998.464 (~26,90B). No hay explicacion publicada.
- El repositorio ocupa 68,5 GB, muy por encima de los 5,95-7,21 GB de una unica build, lo que sugiere la presencia de varios ficheros (ambos empaquetados y posiblemente el mmproj). Conviene comprobar el archivo concreto antes de descargar.
- No hay informacion sobre idiomas soportados ni evaluaciones multilingues; el comportamiento fuera del ingles no esta documentado.
- El tool calling agentico (74,92) es la capacidad mas debil entre las metricas publicadas, notablemente por debajo de matematicas y codigo. En flujos de agente conviene validar el parseo de llamadas.
- Riesgo de alucinacion: no cuantificado en la informacion disponible. El modo thinking no elimina el riesgo.
- El recorte de inteligencia es del 1,8% frente a FP16 en la media de benchmarks; en tareas sensibles a la precision numerica conviene comparar contra la build de precision completa.
- La vision requiere descargar un paquete mmproj adicional y no esta cubierta por las metricas de texto publicadas.
- El contexto de 262K es una capacidad del backbone, pero el coste de cache KV no se documenta: contextos muy largos pueden requerir mas VRAM de la que sugiere el tamano de los pesos.
- La licencia declarada es Apache 2.0, lo que en principio permite uso comercial; deben revisarse igualmente los terminos del modelo base Qwen3.8-27B, no incluidos en la informacion proporcionada.
- Sesgos conocidos y limitaciones de seguridad: no disponibles.
- Metodos de ajuste fino sobre el modelo cuantizado (LoRA u otros): no disponibles. La cuantizacion ternaria con rotacion plegada dificulta tecnicamente este tipo de adaptaciones.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/bielquants/Ternary-Bonsai-2-27B-gguf
- Modelo base en HuggingFace: https://huggingface.co/Qwen/Qwen3.8-27B
- Web de Prism ML: https://prismml.com
- Whitepaper de Bonsai 2 27B: https://github.com/PrismML-Eng/Bonsai-demo/blob/main/bonsai-2-27b-whitepaper.pdf
- Demo y ejemplos: https://github.com/PrismML-Eng/Bonsai-demo
- Fork de llama.cpp con kernels ternarios (CUDA + Metal): https://github.com/PrismML-Eng/llama.cpp
- Fork de MLX (Apple Silicon): https://github.com/PrismML-Eng/mlx
- Fork de mlx-swift (iOS/macOS): https://github.com/PrismML-Eng/mlx-swift
- Companero MLX 2 bits: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-mlx-2bit
- Discord de la comunidad: https://discord.gg/prismml
