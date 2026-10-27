# Jahirrrr/Klyrune-SFT-General-1

## Resumen

Klyrune-SFT-General-1 es un ajuste fino supervisado (SFT) del modelo openbmb/MiniCPM5-2B-Midtrain, publicado por el usuario Jahirrrr bajo el espacio de nombres "Klyrune". Se trata de un modelo de generación de texto de tipo decoder-only con 2.516.756.480 parámetros (≈2,52 B), distribuido en formato safetensors con un repositorio de 5,0 GB, lo que corresponde a pesos en bf16/fp16. La model card lo etiqueta explícitamente como "Experimental" y no aporta información sobre dataset, hiperparámetros ni proceso de alineación.

El interés del modelo es acotado y hay que enmarcarlo correctamente: es un checkpoint de 2,5 B orientado a instrucciones generales con etiquetas declaradas de ciencia, STEM, razonamiento matemático y educación, lo que sugiere un sesgo hacia contenido técnico-educativo. Sin embargo, no se han publicado resultados de benchmarks, no se declara licencia, no se declaran idiomas soportados y el repositorio acumula cero descargas y cero "likes" en el momento de la consulta, por lo que no existe validación independiente de su calidad.

Su relevancia práctica es la de un modelo pequeño, desplegable en hardware de consumo, útil para prototipado rápido y experimentación en dominios STEM, pero no apto para producción sin una evaluación propia previa. Cualquier afirmación sobre sus capacidades reales más allá de las etiquetas del autor debe contrastarse empíricamente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, familia Llama (según el tag `llama` de HuggingFace); derivada del modelo base openbmb/MiniCPM5-2B-Midtrain |
| Parámetros totales | 2.516.756.480 (≈2,52 B) |
| Parámetros activos | No aplica (no es un modelo MoE según la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible; el repositorio solo contiene pesos safetensors (presumiblemente bf16/fp16). No hay GGUF publicado |
| Idiomas soportados | No disponibles |
| Licencia | No disponible |
| Formato de pesos | safetensors (librería `transformers`) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de la familia Llama (así lo indica el tag `llama` del repositorio y la librería `transformers` declarada), inicializado desde openbmb/MiniCPM5-2B-Midtrain, un checkpoint intermedio ("midtrain") del proyecto MiniCPM. El modelo resultante conserva la topología y el tokenizador del modelo base; el repositorio no documenta ninguna modificación estructural (ni atención lineal, ni decodificación especulativa, ni capas MoE). El tamaño del repositorio, 5,0 GB, es coherente con 2,52 B de parámetros en precisión de 16 bits más ficheros auxiliares.

Sobre el entrenamiento solo puede afirmarse lo que declara el autor: es un ajuste fino supervisado (SFT) con etiquetas de ciencia, STEM, razonamiento matemático y educación, y con el descriptor "General" en el nombre. No se especifican el número de tokens de entrenamiento, la composición del dataset, la mezcla de idiomas, ni si hubo fases posteriores de RLHF, DPO o preferencias. La model card se limita a la palabra "Experimental" y a los metadatos YAML, sin sección de uso, limitaciones ni detalles de receta. El timestamp de creación y de actualización (27-10-2026, con tres minutos de diferencia) sugiere una publicación sin iteración posterior documentada.

## Capacidades

- Generación de texto conversacional: el modelo es un checkpoint instruction-tuned, por lo que se espera que responda a instrucciones en formato de diálogo, aunque el formato exacto de prompt no está documentado.
- Razonamiento matemático y resolución de problemas STEM: es la capacidad que el autor destaca en las etiquetas (`science`, `stem`, `mathematical-reasoning`, `education`), sin métricas que la respalden.
- Contenido educativo: generación de explicaciones, ejercicios y material didáctico orientado a asignaturas científicas, según las etiquetas declaradas.
- Tool calling / function calling: no documentado. No hay evidencia en la información disponible de soporte de esquemas de herramientas.
- Agentes y razonamiento multi-paso: no documentado. No se declara modo "thinking", ni capacidad de planificación explícita.
- Capacidades multilingües: no documentadas; no se declara lista de idiomas.
- Visión, audio o multimodalidad: no disponibles. El pipeline declarado es únicamente `text-generation`.
- Modo de razonamiento explícito (thinking): no documentado.

## Casos de uso

- Tutor de matemáticas y ciencias en aplicación educativa: el modelo puede generar explicaciones paso a paso de problemas de física, química o cálculo, aprovechando el ajuste declarado sobre corpus STEM. Requiere evaluar previamente la tasa de error en el dominio concreto, dado que no hay benchmarks.
- Generación de baterías de ejercicios y solucionarios: útil para producir enunciados y resoluciones en lote en una plataforma de e-learning, con revisión humana obligatoria por el riesgo de alucinación en pasos intermedios.
- Prototipado rápido en local: con 2,52 B de parámetros cabe en GPU de consumo, lo que permite iterar sobre prompts y flujos conversacionales sin coste de API antes de migrar a un modelo mayor.
- Asistente de documentación técnica interna: resumen y reescritura de notas de laboratorio, especificaciones o apuntes, siempre que se validen las longitudes de contexto reales del modelo (no declaradas) mediante pruebas de degradación.
- Generación de preguntas de evaluación (quiz, test de opción múltiple): a partir de un temario, el modelo puede producir ítems con distractores; útil en pipelines de evaluación formativa con filtrado automático posterior.
- Base para un segundo ajuste fino específico de dominio: al ser un checkpoint pequeño y abierto en pesos, sirve como punto de partida para LoRA/QLoRA en dominios STEM concretos con datasets propios.
- Componente de clasificación o extracción ligera: para tareas de etiquetado de texto científico donde no se requiere razonamiento profundo, con throughput alto por el reducido tamaño del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del autor no incluye MMLU, GSM8K, HumanEval, MATH ni ninguna otra métrica, y no se han localizado evaluaciones independientes en los resultados de búsqueda.

## Requisitos de hardware

Estimaciones calculadas a partir de los 2,52 B de parámetros; no son mediciones publicadas por el autor:

- VRAM para inferencia en bf16/fp16: ≈5,0 GB de pesos más caché KV y overhead del runtime, en torno a 6-7 GB para contextos moderados.
- VRAM en cuantización int8: ≈2,5-3,0 GB.
- VRAM en cuantización int4: ≈1,5-2,0 GB.
- GPU de consumo: cabe en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 en bf16; en una GPU de 8 GB conviene cuantizar. En int4 podría ejecutarse en GPUs de 4-6 GB e incluso en CPU.
- GPU de datacenter: A100, H100 o L40S están sobredimensionadas para un solo modelo de 2,5 B; su interés sería el batcheo masivo.
- Opciones de despliegue: `transformers` (librería declarada), TGI (el repositorio incluye el tag `text-generation-inference` y `endpoints_compatible`), y vLLM por compatibilidad con la familia Llama (no verificado oficialmente para este checkpoint). Para llama.cpp u Ollama sería necesaria una conversión propia a GGUF, ya que no hay ficheros GGUF en el repositorio.
- Latencia y throughput: no disponibles. No se han publicado mediciones.

## Comparativa con modelos similares

Datos de los modelos comparables tomados de sus model cards públicas y no verificados en esta ficha; el modelo analizado no dispone de métricas propias.

| Modelo | Parámetros | Contexto | Benchmarks públicos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Klyrune-SFT-General-1 | 2,52 B | No disponible | No | No disponible | Repositorio HF, 0 descargas |
| openbmb/MiniCPM5-2B-Midtrain (base) | ≈2 B (no confirmado) | No disponible | No disponible en esta ficha | No disponible en esta ficha | HF |
| Qwen2.5-1.5B-Instruct | 1,54 B | 32.768 tokens | Sí, publicados por el autor | Apache 2.0 | HF, amplia integración en runtimes |
| Gemma 2 2B IT | ≈2,6 B | 8.192 tokens | Sí, publicados por el autor | Términos de uso de Gemma | HF (acceso condicionado) |

La diferencia relevante no es de tamaño, sino de trazabilidad: los tres comparables tienen licencia explícita, contexto declarado y evaluaciones publicadas, mientras que Klyrune-SFT-General-1 no ofrece ninguno de esos tres elementos.

## Limitaciones y advertencias

- Ausencia de licencia: sin licencia declarada no puede asumirse permiso de uso comercial; en la práctica, el modelo debe tratarse como no licenciado hasta que el autor lo aclare.
- Estado "Experimental" declarado por el propio autor, sin documentación de receta, dataset ni hiperparámetros.
- Sin benchmarks ni evaluaciones de terceros; cero descargas y cero "likes" implican nula validación comunitaria.
- Riesgo de alucinación elevado en razonamiento matemático y científico: en modelos de 2-3 B los errores en cadenas de pasos aritméticos son frecuentes y no hay datos que permitan acotar la tasa.
- Idiomas no declarados: no puede asumirse un rendimiento correcto en castellano; es probable que el modelo esté centrado en inglés, pero esto no está confirmado.
- Longitud de contexto desconocida: no debe asumirse ninguna ventana concreta; hay que medirla empíricamente antes de diseñar flujos multi-turno o de documento largo.
- Sin soporte documentado de tool calling ni de agentes: no recomendable para pipelines que dependan de function calling estructurado.
- Sin cuantizaciones publicadas (GGUF, AWQ, GPTQ): el despliegue en CPU o en GPU de gama baja requiere trabajo adicional de conversión y validación.
- Herencia del modelo base: los sesgos y limitaciones de MiniCPM5-2B-Midtrain se trasladan al ajuste fino y no están documentados aquí.
- Fechas de creación y actualización separadas por tres minutos: indicio de una publicación sin revisión posterior; conviene comprobar si existe una versión más reciente en el mismo espacio de nombres.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jahirrrr/Klyrune-SFT-General-1
- Modelo base: https://huggingface.co/openbmb/MiniCPM5-2B-Midtrain
- Endpoint de inferencia en FriendliAI: https://friendli.ai/models/Jahirrrr/Klyrune-2B-General-1
- Registro en Free2AITools: https://free2aitools.com/model/jahirrrr/klyrune-2b-general-1
- Modelos etiquetados con `klyra` en HuggingFace: https://huggingface.co/models?other=klyra
- Modelos ajustados desde Jahirrrr/Klyra-Decision-16M-Generalist-V4: https://huggingface.co/models?other=base_model:finetune:Jahirrrr/Klyra-Decision-16M-Generalist-V4
- Referencia general sobre SFT en LLM: https://www.geeksforgeeks.org/artificial-intelligence/supervised-fine-tuning-sft-for-llms/
