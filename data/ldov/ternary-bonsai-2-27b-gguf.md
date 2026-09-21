# ldov/Ternary-Bonsai-2-27B-gguf

## Resumen

Ternary Bonsai 2 27B es una cuantizacion ternaria extrema del modelo Qwen3.8-27B, publicada en formato GGUF para llama.cpp. El autor del repositorio es el usuario ldov, aunque la model card referencia Prism ML (PrismML-Eng) como desarrollador de la metodologia, los kernels y los repositorios auxiliares. El modelo reduce un transformer de 27B a pesos con valores en {−1, 0, +1} con escalas FP16 por grupos de 128, lo que da un coste real de 1,72 bits por peso y un fichero de 5,95 GB (PTQ1_0) o 7,21 GB (PQ2_0), frente a los ~54 GB de la version FP16.

El objetivo es claro: permitir razonamiento de clase 27B en un portatil o en una unica GPU de consumo, manteniendo el modo thinking, el razonamiento matematico, la generacion de codigo y el tool calling agentico. Segun la informacion publicada, retiene el 98,2 % de la inteligencia del modelo FP16 (media de 84,78 en 14 benchmarks en modo thinking) y alcanza unos 47 tokens por segundo en un portatil Apple M5 Max. La arquitectura subyacente es la de Qwen3.8-27B, con atencion hibrida (aproximadamente 75 % lineal y 25 % completa), lo que hace viable un contexto de 262K tokens en dispositivo.

La relevancia del modelo esta en el regimen sub-4-bit: segun la model card, las representaciones convencionales de 2 bits colapsan en razonamiento y comportamiento agentico, mientras que esta construccion ternaria de extremo a extremo (embeddings, proyecciones de atencion, proyecciones MLP y LM head) mantiene matematicas a medio punto de la precision completa (96,57) y tool calling agentico en 74,92. Existe tambien una variante MLX de 2 bits mantenida por prism-ml para Apple Silicon.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal de atencion hibrida (~75 % atencion lineal / ~25 % atencion completa), SwiGLU MLP, RoPE, RMSNorm; 64 bloques en el backbone de lenguaje y 27 bloques en la torre de vision |
| Parametros totales | 26.895.998.464 (26,9 B) segun los metadatos de HuggingFace; la model card declara 27,36 B totales (24,35 B backbone de lenguaje + 2,54 B embeddings/LM head + 0,46 B torre de vision) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 262K tokens (heredada del modelo base) |
| Tipos de cuantizacion | Ternaria g128 ({−1, 0, +1} con escala FP16 compartida por grupo de 128 pesos): PTQ1_0 con trits densos (1,75 bits/peso, 5,95 GB) y PQ2_0 con cada trit en una ranura de 2 bits (2,13 bits/peso, 7,21 GB); la torre de vision se distribuye aparte en un pack mmproj Q8_0 de ~0,63 GB |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF para llama.cpp; variante separada en MLX 2-bit para Apple Silicon |

## Arquitectura y entrenamiento

El modelo no introduce una arquitectura nueva: es una derivacion cuantizada de Qwen3.8-27B con la arquitectura sin cambios. El backbone es un transformer causal con atencion hibrida en el que aproximadamente el 75 % de las capas usan atencion lineal y el 25 % restante atencion completa, lo que reduce el coste de contexto largo y hace practico el uso de 262K tokens en hardware de consumo. El MLP es SwiGLU, con RoPE y RMSNorm, y el modelo incluye una torre de vision de 27 bloques que solo se carga cuando hay entrada de imagen.

La innovacion tecnica principal es la representacion ternaria g128: cada peso toma un valor de {−1, 0, +1} con un unico factor de escala FP16 por cada grupo de 128 pesos. Como un valor ternario transporta log2(3) ≈ 1,585 bits, el coste efectivo es de ~1,71 bits por peso, y 1,72 bits por peso contando los pocos tensores que se mantienen por encima de la representacion ternaria. Los pesos se almacenan en una base rotada: cada matriz se transforma blockwise con una rotacion ortogonal de Hadamard (bloque 1024, signos ±1 fijos) antes de la asignacion ternaria, y el runtime aplica la transformacion equivalente sobre las activaciones. La rotacion se pliega en los pesos durante el proceso offline, por lo que no anade bits ni trafico de pesos, y el fichero declara la rotacion como metadato, de modo que un runtime o aplica la transformacion correspondiente o rechaza cargar el fichero. Los pesos empaquetados se consumen directamente, sin expandirse de nuevo a FP16.

No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens, la composicion de los datos ni sobre fases de RLHF o DPO, ya que se trata de una cuantizacion post-entrenamiento (los nombres PTQ1_0 y PQ2_0 apuntan a post-training quantization) del modelo base. Tampoco se detalla el procedimiento de calibracion mas alla de la rotacion Hadamard y del reparto ternario descritos.

## Capacidades

- Generacion de texto conversacional en modo thinking, con razonamiento multi-paso.
- Razonamiento matematico: segun la model card, se mantiene a medio punto de la precision completa, con 96,57 en la metrica de matematicas empleada por el autor.
- Generacion de codigo: 89,42 en la metrica de codigo, descrito como "al nivel del baseline" de precision completa.
- Tool calling y comportamiento agentico: 74,92 en la metrica de tool calling agentico, que el autor presenta como una de las capacidades que sobreviven en el regimen sub-4-bit.
- Procesamiento de imagenes: mediante la torre de vision opcional de 27 bloques, distribuida como pack mmproj Q8_0 (~0,63 GB) y cargada solo cuando hay entrada de imagen.
- Contexto largo: 262K tokens, viable en dispositivo gracias al backbone de atencion predominantemente lineal.
- Capacidades multilingues: no disponible; la model card no documenta el reparto de idiomas heredado del modelo base.
- Decodificacion especulativa: no disponible, no se menciona en la informacion proporcionada.

## Casos de uso

- Asistente de razonamiento en portatil: con 5,95 GB en formato PTQ1_0, el modelo cabe en un portatil con memoria unificada (se reportan ~47 tok/s en un Apple M5 Max) y permite mantener sesiones de razonamiento en modo thinking sin conexion a servicios externos.
- Atencion al cliente automatizada con contexto largo: los 262K tokens de ventana permiten incorporar historiales extensos, documentacion de producto y conversaciones multi-turno sin truncar, y el comportamiento conversacional esta declarado en las etiquetas del repositorio.
- Agentes con tool calling: el modelo conserva tool calling agentico en el regimen ternario (74,92 en la metrica del autor), lo que permite construir agentes que invocan APIs, consultan bases de datos o ejecutan tareas multi-paso en local.
- Generacion y revision de codigo en local: con 89,42 en la metrica de codigo y pesos de 5,95 GB, se puede integrar en flujos de trabajo de desarrollo (revision de diffs, generacion de tests, explicacion de fragmentos) ejecutandose en la maquina del desarrollador sin enviar codigo propietario a terceros.
- Analisis de documentos con imagenes: cargando el pack mmproj Q8_0 es posible procesar capturas, diagramas o paginas escaneadas junto con texto, por ejemplo para extraer informacion de facturas o resumir documentacion tecnica ilustrada.
- Despliegue en una unica GPU de consumo: al ocupar 7,21 GB en PQ2_0, cabe en GPUs de 12 GB o superiores, lo que permite servir el modelo en una estacion de trabajo o en un servidor de gama media para tareas internas.
- Procesamiento por lotes en CPU: al ser GGUF para llama.cpp con backend de CPU, es viable ejecutar resumenes, clasificacion o extraccion de informacion en servidores sin GPU, aceptando menor throughput.
- Investigacion sobre cuantizacion extrema: el modelo sirve como referencia reproducible para estudiar la degradacion en el regimen sub-4-bit, comparando PTQ1_0 y PQ2_0 frente a builds IQ2_XXS y Q4_K_XL.

## Benchmarks y rendimiento

Los datos disponibles provienen exclusivamente de la model card y del whitepaper del autor; no se han localizado evaluaciones independientes en la busqueda web realizada. La media de 84,78 corresponde a 14 benchmarks en modo thinking, cuya lista concreta no se detalla en la informacion proporcionada.

| Metrica | Ternary Bonsai 2 27B | IQ2_XXS convencional | UD-Q4_K_XL | FP16 (baseline) |
|---|---|---|---|---|
| Media de 14 benchmarks en modo thinking | 84,78 (98,2 % del FP16) | 72,59 | a menos de 0,4 puntos del resultado ternario | ~86,3 (derivado de 84,78 / 0,982) |
| Matematicas | 96,57 | no disponible | no disponible | a medio punto del resultado ternario |
| Codigo | 89,42 | no disponible | no disponible | "al nivel del baseline" |
| Tool calling agentico | 74,92 | no disponible | no disponible | no disponible |
| Tamano desplegado | 5,95 GB (PTQ1_0) / 7,21 GB (PQ2_0) | superior a dos tercios del tamano ternario | aproximadamente tres veces el tamano ternario | ~54 GB |
| Throughput | ~47 tok/s en Apple M5 Max | no disponible | no disponible | no disponible |

Los valores de FP16 marcados como derivados proceden de aritmetica sobre el porcentaje de retencion declarado (98,2 %), no de una cifra publicada directamente. El resto de cifras son las que aparecen en la model card.

## Requisitos de hardware

- Peso de los pesos: 5,95 GB en PTQ1_0, 7,21 GB en PQ2_0 y ~0,63 GB adicionales si se carga la torre de vision Q8_0.
- VRAM de inferencia: como minimo el tamano del fichero mas el overhead del runtime y la cache KV. El requisito exacto de cache KV para 262K tokens no esta publicado; al ser un backbone con ~75 % de atencion lineal, la parte de atencion completa es la que domina ese coste y crece con la longitud de contexto.
- GPU de consumo: si, cabe en GPUs de 12 GB o mas en ambos empaquetados (por ejemplo RTX 3060 12 GB, RTX 4070, RTX 4090), y en Mac con memoria unificada; el autor reporta ~47 tok/s en un Apple M5 Max.
- GPU de centro de datos: A100, H100 y similares pueden ejecutarlo, pero el modelo esta optimizado para despliegue en dispositivo, no para maximizar throughput en servidor.
- Backends soportados: llama.cpp en CUDA, Metal y CPU, a traves del fork de PrismML con kernels ternarios de atencion hibrida; en Apple Silicon existe ademas la variante MLX 2-bit y un fork de mlx-swift para iOS/macOS.
- Otros motores: no hay informacion sobre soporte en vLLM, TGI u Ollama. El repositorio incluye la etiqueta endpoints_compatible, pero la model card solo documenta llama.cpp y MLX.
- Latencia y throughput: el unico dato publicado es ~47 tok/s en Apple M5 Max; no hay cifras para CUDA ni CPU.

## Comparativa con modelos similares

No se dispone de comparativas con modelos de terceros en la informacion proporcionada. La comparacion publicada por el autor es interna, entre distintos formatos del mismo modelo.

| Formato | Tamano | Bits por peso | Media en 14 benchmarks | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ternary Bonsai 2 27B PTQ1_0 | 5,95 GB | 1,75 (1,72 real en el modelo completo) | 84,78 | Apache 2.0 | GGUF en este repositorio y en prism-ml |
| Ternary Bonsai 2 27B PQ2_0 | 7,21 GB | 2,13 | no desglosado | Apache 2.0 | GGUF |
| Build IQ2_XXS convencional | mas de dos tercios por encima del ternario | no disponible | 72,59 | depende del build | llama.cpp |
| UD-Q4_K_XL | aproximadamente tres veces el ternario | no disponible | a menos de 0,4 puntos del ternario | depende del build | llama.cpp |
| Qwen3.8-27B FP16 | ~54 GB | 16 | ~86,3 (derivado) | no disponible | modelo base |
| Ternary Bonsai 2 27B MLX 2-bit | no disponible | no disponible | no disponible | Apache 2.0 | repositorio prism-ml |

## Limitaciones y advertencias

- La cuantizacion ternaria degrada ligeramente el rendimiento: la propia model card reconoce una retencion del 98,2 % respecto a FP16, es decir, perdida de precision medible en la media de benchmarks.
- Las metricas publicadas provienen del autor del modelo (model card y whitepaper) y no se han verificado de forma independiente; la busqueda web no devolvio evaluaciones de terceros.
- No hay informacion sobre sesgos, comportamientos toxicos ni evaluaciones de seguridad. Al derivar de Qwen3.8-27B, hereda las caracteristicas de su modelo base, que no se documentan en la ficha.
- Riesgo de alucinacion no cuantificado: no se han publicado metricas de factualidad ni de tasa de alucinacion para esta cuantizacion.
- Idiomas soportados: no disponible. No se puede asumir cobertura multilingue sin datos.
- Los pesos estan almacenados en una base rotada por Hadamard. Un runtime sin el soporte correspondiente no cargara el fichero, por lo que no basta con cualquier version generica de llama.cpp: hace falta el fork con los kernels ternarios o una version que implemente la rotacion declarada en los metadatos.
- El soporte de motores alternativos (vLLM, TGI, Ollama) no esta documentado; la integracion en produccion queda limitada a llama.cpp (CUDA, Metal, CPU) y, en Apple Silicon, a MLX.
- El repositorio figura a nombre del usuario ldov, mientras que la model card apunta a repositorios de prism-ml y a la organizacion PrismML-Eng. Conviene verificar la correspondencia entre ambas fuentes antes de usarlo en produccion.
- Los metadatos de HuggingFace registran 0 descargas y 0 likes, y la fecha de creacion indicada es el 21 de septiembre de 2026, posterior a la fecha habitual de consulta; se trata de un artefacto poco rodado y sin validacion de la comunidad.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero la licencia del modelo base Qwen3.8-27B no se detalla en la informacion disponible y podria imponer condiciones adicionales; conviene comprobarla antes de un despliegue comercial.
- Contexto de 262K tokens heredado del modelo base: no se han publicado mediciones de rendimiento efectivo a esa longitud en esta cuantizacion concreta.

## Enlaces

- Pagina de HuggingFace del modelo: https://huggingface.co/ldov/Ternary-Bonsai-2-27B-gguf
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Variante MLX 2-bit: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-mlx-2bit
- Web de Prism ML: https://prismml.com
- Whitepaper: https://github.com/PrismML-Eng/Bonsai-demo/blob/main/bonsai-2-27b-whitepaper.pdf
- Demo y ejemplos: https://github.com/PrismML-Eng/Bonsai-demo
- Fork de llama.cpp con kernels ternarios (CUDA y Metal): https://github.com/PrismML-Eng/llama.cpp
- Fork de MLX (Apple Silicon): https://github.com/PrismML-Eng/mlx
- Fork de mlx-swift (iOS/macOS): https://github.com/PrismML-Eng/mlx-swift
- Discord de la comunidad: https://discord.gg/prismml
