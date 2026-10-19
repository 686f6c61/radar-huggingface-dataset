# mikim869/qwen2.5-3b-jev-hard-v5.0-hard-blind-foundation

# mikim869/qwen2.5-3b-jev-hard-v5.0-hard-blind-foundation

## Resumen

Este repositorio contiene un ajuste fino del modelo Qwen2.5-3B-Instruct, publicado por el usuario mikim869 bajo el identificador qwen2.5-3b-jev-hard-v5.0-hard-blind-foundation. Se trata de un transformer decoder-only denso de 3.090 millones de parametros, con una ventana de contexto de 32.768 tokens en la variante 3B de la familia Qwen2.5 (el resto de la familia escala hasta 128K). El autor declara que el entrenamiento se realizo con Unsloth, una libreria de ajuste eficiente en memoria que acelera el proceso aproximadamente 2x.

El punto de partida es unsloth/Qwen2.5-3B-Instruct-unsloth-bnb-4bit, es decir, una version ya cuantizada a 4 bits del instructivo oficial de Qwen2.5-3B, sobre la que se aplica un ajuste adicional. La model card es minima: no documenta dataset, hiperparametros, numero de pasos ni objetivo del entrenamiento, y el nombre del repositorio (jev-hard, hard-blind) sugiere una especializacion en prompts dificiles o adversariales, aunque no se aporta ninguna evidencia al respecto.

Su relevancia practica es por ahora limitada: cero descargas y cero likes en el momento de redactar esta ficha, sin evaluaciones publicadas ni demos. Resulta util como base para experimentar con fine-tuning ligero sobre Qwen2.5-3B en hardware de consumo y como objeto de estudio de pipelines Unsloth, pero no deberia desplegarse en produccion sin una evaluacion propia y sin resolver la ambiguedad de licencia del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Qwen2) |
| Parametros totales | 3.090 millones (3,09 B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens en la variante 3B de Qwen2.5; el resto de la familia llega a 128K |
| Tipos de cuantizacion | El repo publicado no incluye cuantizaciones propias; el modelo base admite GGUF, AWQ, GPTQ y bitsandbytes (INT4/INT8) |
| Idiomas soportados | Ingles declarado en la model card; el modelo base Qwen2.5 cubre mas de 29 idiomas |
| Licencia | apache-2.0 declarada por el autor; el modelo base Qwen2.5-3B se distribuye bajo Qwen Research License |
| Formato de pesos | safetensors; el tamano del repo (0,1 GB) sugiere adaptadores LoRA/PEFT en lugar de pesos completos |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen2.5-3B: un transformer decoder-only denso con 36 capas, atencion con query grouping (GQA) de 16 cabezas de consulta y 2 de clave/valor, activacion SwiGLU, normalizacion RMSNorm, embeddings atados y codificacion posicional RoPE. Segun el informe tecnico de Qwen2.5, la familia se preentreno sobre un corpus de hasta 18 billones (18T) de tokens y se sometio a un post-entrenamiento con supervision (SFT) y optimizacion por preferencias (DPO).

Sobre esa base, mikim869 aplica un ajuste adicional con Unsloth partiendo de la variante bnb-4bit de Qwen2.5-3B-Instruct. Este detalle es relevante: entrenar sobre pesos ya cuantizados a 4 bits es propio de QLoRA, lo que apunta a un ajuste ligero con adaptadores (coherente con los 0,1 GB del repositorio) mas que a un reentrenamiento completo. La model card no indica dataset, numero de pasos, tasa de aprendizaje ni metodo de alineacion adicional; los sufijos "hard" y "hard-blind" del nombre no se explican en la documentacion y no hay publicaciones que los respalden.

## Capacidades

- Generacion de texto e instrucciones en ingles, heredadas de Qwen2.5-3B-Instruct.
- Razonamiento basico y resolucion de problemas matematicos de complejidad media, propio de un modelo de 3B parametros.
- Generacion y explicacion de codigo: Qwen2.5-Instruct incluye entrenamiento especifico para tareas de programacion, aunque el nivel es inferior al de variantes de 7B o superiores.
- Soporte de tool calling / function calling heredado del instructivo base, sujeto a validacion tras el fine-tune.
- Capacidades multilingues del modelo base (mas de 29 idiomas), aunque la model card solo declara ingles y no hay evaluacion del fine-tune en otros idiomas.
- Manejo de documentos largos de hasta 32.768 tokens, util para resumen y extraccion sobre contextos extensos.
- No dispone de vision, audio ni modalidades adicionales.
- La especializacion concreta del fine-tune no esta documentada; el nombre sugiere robustez ante prompts adversariales, pero no hay evidencia publica que lo confirme.

## Casos de uso

- Prototipado de asistentes conversacionales en local: el modelo cabe en GPUs de consumo y permite iterar sobre dialogos multi-turno sin enviar datos a la nube, lo que resulta util para pruebas de concepto con datos sensibles.
- Generacion de codigo en entornos de desarrollo: puede integrarse como asistente de autocompletado o explicacion de fragmentos en IDE, ejecutandose en una estacion de trabajo con 8-12 GB de VRAM en cuantizacion INT4.
- Extraccion de informacion de documentos largos: con 32K tokens de contexto puede procesar contratos o informes completos en una sola pasada, aunque su tamano limita la precision en tareas de razonamiento complejo.
- Base para investigacion en fine-tuning eficiente: el repo sirve como ejemplo de pipeline Unsloth/QLoRA sobre Qwen2.5-3B y puede reutilizarse como plantilla para reproducir experimentos con otros datasets.
- Pruebas de robustez y red teaming: por el nombre del ajuste, puede emplearse en ejercicios internos de evaluacion de resistencia a prompts maliciosos, siempre con supervision humana y sin exponerlo a usuarios finales.
- Enrutamiento y tool calling en pipelines de agentes: el soporte heredado de function calling permite usarlo como nodo ligero que decidiera que herramienta invocar en un flujo multi-paso.
- Tutoria o generacion de contenido en ingles con despliegue on-premise: adecuado para organizaciones que necesitan un modelo pequeno, autoalojado y con requisitos de hardware modestos.
- Evaluacion comparativa de ajustes: util como linea base en estudios que midan el efecto de un fine-tune sobre el modelo original en tareas concretas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no incluye metricas del fine-tune, y el informe tecnico de Qwen2.5 contiene evaluaciones del modelo base que no se reproducen aqui porque no han sido aportadas en la documentacion consultada.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: en torno a 8-9 GB contando pesos (6,2 GB), cache KV y activaciones.
- VRAM estimada en INT8: aproximadamente 4-5 GB.
- VRAM estimada en INT4 (GPTQ, AWQ o bitsandbytes): aproximadamente 3-4 GB.
- GGUF Q4_K_M: archivo de unos 1,9 GB y runtime de 2,5-3 GB, lo que permite ejecucion en GPUs de 4-6 GB.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB y RTX 4090 para FP16; tarjetas de 8 GB (RTX 3060 Ti, RTX 4060, RTX 3070) son suficientes en INT4.
- Si cabe en GPU de consumo: si, en practicamente cualquier GPU moderna de 8 GB o mas con cuantizacion INT4, y tambien en Apple Silicon mediante llama.cpp o MLX.
- Para despliegue en servidor: A10G, L4, L40S o A100 son sobredimensionadas para un 3B, pero ofrecen margen para lotes grandes.
- Opciones de despliegue: Transformers, TGI, vLLM, llama.cpp, Ollama y el propio stack de Unsloth; al tratarse probablemente de adaptadores, es necesario fusionarlos con el modelo base antes de servir.
- Latencia y throughput: no disponibles para este fine-tune; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Este fine-tune (mikim869) | 3,09 B | 32K | apache-2.0 declarada (base Qwen Research) | Sin evaluaciones; probablemente adaptadores LoRA |
| Qwen2.5-3B-Instruct | 3,09 B | 32K | Qwen Research License | Version oficial, documentada y evaluada por el equipo Qwen |
| Qwen2.5-1.5B-Instruct | 1,54 B | 32K | Apache-2.0 | Alternativa mas ligera y con licencia permisiva, menor calidad en tareas complejas |
| Llama-3.2-3B-Instruct | 3,21 B | 128K | Llama 3.2 Community License | Contexto mayor y ecosistema amplio, con restricciones de uso comercial en la licencia |
| Phi-3.5-mini-instruct | 3,8 B | 128K | MIT | Licencia muy permisiva y buen rendimiento en razonamiento, algo mas grande |

## Limitaciones y advertencias

- Ausencia total de evaluaciones: no hay benchmarks, demos ni descargas que permitan validar la calidad del ajuste.
- Dataset y procedimiento no documentados: se desconoce que datos se usaron, con que objetivo y si se aplico algun filtro de seguridad.
- Idioma: la model card solo declara ingles; el rendimiento en castellano no esta verificado y probablemente sea inferior al del modelo base en su conjunto de idiomas.
- Riesgo de alucinacion: inherente a un modelo de 3B parametros, agravado por la falta de evaluacion especifica y por el caracter potencialmente adversarial del ajuste.
- Licencia ambigua: aunque el autor declara apache-2.0, el modelo base Qwen2.5-3B se distribuye bajo Qwen Research License, que restringe el uso comercial; conviene revisar los terminos antes de cualquier despliegue productivo.
- Distribucion como adaptadores: el tamano del repositorio (0,1 GB) sugiere que faltan los pesos completos; es necesario fusionar con unsloth/Qwen2.5-3B-Instruct-unsloth-bnb-4bit o con Qwen2.5-3B-Instruct, lo que puede introducir diferencias respecto a lo publicado.
- Contexto limitado a 32K: suficiente para documentos medios, pero inferior a los 128K de otros modelos de la competencia en el mismo rango de tamano.
- Metadata anomala: la fecha de creacion indicada (2026) es posterior a la fecha actual de referencia, lo que sugiere un error de catalogacion.
- Sin garantias de mantenimiento: cero descargas, cero likes y ningun historial de actualizaciones mas alla del momento de publicacion.

## Enlaces

- Repositorio del modelo: https://huggingface.co/mikim869/qwen2.5-3b-jev-hard-v5.0-hard-blind-foundation
- Modelo base en HuggingFace (Qwen2.5-3B): https://huggingface.co/Qwen/Qwen2.5-3B
- Coleccion Qwen2.5: https://huggingface.co/collections/Qwen/qwen25
- Repositorio GitHub de la familia Qwen2.5: https://github.com/mx4ai/qwen2.5
- Blog oficial de Qwen2.5: https://qwen.ai/blog?id=qwen2.5-llm
- Informe tecnico Qwen2.5 (arXiv 2412.15115): https://arxiv.org/abs/2412.15115
- Unsloth (libreria de entrenamiento utilizada): https://github.com/unslothai/unsloth
