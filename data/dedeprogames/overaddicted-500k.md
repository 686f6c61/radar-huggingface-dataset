# DedeProGames/Overaddicted-500K

## Resumen

Overaddicted-500K es un modelo de lenguaje decoder-only de escala nano, con 492.192 parámetros, entrenado desde cero (*pretrained-from-scratch*) por el usuario DedeProGames sobre el dataset fineweb-edu. Se trata de un artefacto de investigación educativa: su propósito no es asistir en tareas reales, sino hacer tangible y observable el proceso completo de preentrenamiento de un transformer, desde la tokenización hasta la convergencia de la pérdida. El modelo se generó con el NanoDex Trainer, un Space de Hugging Face orientado a entrenar modelos diminutos con recursos mínimos.

La arquitectura es un `LlamaForCausalLM` estándar pero reducido en anchura y profundidad hasta el presupuesto de parámetros: 3 capas, tamaño oculto 96, 6 cabezas de atención (2 para clave/valor), FFN de 256 y un vocabulario BPE personalizado de 2.048 tokens entrenado sobre fineweb-edu. La longitud de contexto es de 512 tokens y el entrenamiento consumió aproximadamente 1.500 millones de tokens en 11.444 pasos, con una pérdida final de 3,5919 (perplejidad 36,3) en apenas 33,9 minutos de cómputo.

Su relevancia actual es pedagógica y metodológica: sirve como referencia reproducible de un pipeline de preentrenamiento completo (optimizador, scheduler, dataset) a una escala que cabe en cualquier GPU de consumo. Está publicado bajo licencia ODC-BY, solo en inglés, y el autor advierte explícitamente de que no es un asistente útil y de que su salida no es factual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (`LlamaForCausalLM`): SiLU MLP, RMSNorm, RoPE, grouped-query attention, embeddings atados, sin biases |
| Parametros totales | 492.192 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | No disponible; el repositorio publica pesos en safetensors sin variantes cuantizadas documentadas |
| Idiomas soportados | Ingles (`en`) |
| Licencia | ODC-BY (Open Data Commons Attribution License) |
| Formato de pesos | safetensors |
| Tamano del vocabulario | 2.048 (BPE personalizado, entrenado sobre fineweb-edu) |
| Tamano oculto | 96 |
| Capas | 3 |
| Cabezas de atencion | 6 (KV: 2) |
| Tamano de FFN | 256 |

## Arquitectura y entrenamiento

El modelo sigue la plantilla de `LlamaForCausalLM`: un transformer decoder-only con normalizacion RMSNorm, activacion SiLU en el MLP, embeddings posicionales rotatorios (RoPE) y atencion con consultas agrupadas (6 cabezas de consulta frente a 2 de clave/valor). Los embeddings de entrada y de salida estan atados y no se emplean terminos de sesgo en ninguna capa. La unica desviacion respecto al Llama canonico es el escalado a la baja en anchura (hidden size 96, FFN 256) y profundidad (3 capas), ajustado para encajar en el presupuesto de ~492.000 parametros, junto con un vocabulario BPE propio de 2.048 tokens entrenado especificamente sobre fineweb-edu.

El entrenamiento se realizo desde cero sobre el dataset HuggingFaceFW/fineweb-edu, con un total de 1.499.987.968 tokens vistos a lo largo de 11.444 pasos (131.072 tokens por paso). Se utilizo el optimizador AdamW con betas (0,9; 0,95), weight decay de 0,1 y recorte de gradiente de 1,0. El scheduler de tasa de aprendizaje combinó un calentamiento del 2 % de los pasos seguido de un decaimiento coseno hasta el 10 % del valor pico, que fue de 4e-03. El entrenamiento completo duro 33,9 minutos. No se documenta ninguna fase de RLHF, DPO ni ajuste por instrucciones: es exclusivamente un preentrenamiento de lenguaje. La perdida final reportada es de 3,5919, equivalente a una perplejidad de 36,3.

## Capacidades

- Generacion de texto autoregresiva basica, limitada a continuaciones cortas y localmente coherentes.
- Aprendizaje de formas de palabra (*word shapes*) y colocaciones frecuentes del ingles presentes en fineweb-edu.
- Adquisicion de una sintaxis incipiente, segun la propia descripcion del autor.
- No dispone de soporte de tool calling ni function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso.
- Capacidad multilingue nula: entrenado unicamente en ingles.
- No incorpora modo de razonamiento (*thinking mode*), vision, audio ni ninguna modalidad adicional.
- No es un modelo ajustado por instrucciones: no sigue ordenes ni mantiene conversaciones.

## Casos de uso

- Docencia y divulgacion sobre preentrenamiento: permite mostrar en clase, de principio a fin y en poco mas de media hora de computo, como un transformer aprende desde pesos aleatorios hasta producir colocaciones plausibles en ingles.
- Reproducibilidad de pipelines de entrenamiento: sirve como caso de referencia para validar la configuracion del NanoDex Trainer (scheduler, optimizador, tamano de lote) antes de escalar a modelos mayores.
- Pruebas de infraestructura y CI/CD de machine learning: al ocupar unos pocos megabytes, es ideal para verificar que un pipeline de carga de safetensors, tokenizacion y generacion funciona de extremo a extremo sin consumir GPU.
- Experimentos de tokenizacion: el vocabulario BPE de 2.048 tokens entrenado sobre fineweb-edu permite estudiar el impacto de vocabularios diminutos en la calidad de la representacion.
- Ensayos de cuantizacion extrema y compresion: por su tamano irrisorio, es un banco de pruebas para evaluar tecnicas de cuantizacion a 8, 4 o incluso 2 bits sin coste relevante.
- Analisis de curvas de aprendizaje a escala nano: los registros de perdida (3,5919 final) permiten estudiar la relacion entre tokens vistos y capacidad del modelo en regimenes de datos muy por encima de los parametros (aproximadamente 3.000 tokens por parametro).
- Demostraciones de despliegue ligero: encaja en entornos con restricciones severas de memoria (microcontroladores, dispositivos embebidos o funciones serverless) como ejemplo de modelo ejecutable en CPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente reporta la perdida final de entrenamiento (3,5919) y la perplejidad asociada (36,3). No hay datos de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion estandar, y dadas las capacidades descritas por el propio autor (formas de palabra y colocaciones, sin factualidad) es razonable esperar un rendimiento muy bajo en dichas tareas, aunque no se aporta ninguna cifra.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,9 MB en fp32, 1 MB en fp16/bf16 y 0,5 MB en int8 para los pesos; el cache KV para 512 tokens y 2 cabezas KV es del orden de decenas de kilobytes. El consumo real lo dominara el runtime (PyTorch, CUDA context) y no el modelo.
- GPU recomendadas: cualquiera, incluida una GTX 1050 o integradas; tambien funciona enteramente en CPU. No requiere A100, H100 ni RTX 4090, que estarian enormemente sobredimensionadas.
- Cabe en cualquier GPU de consumo, e incluso en dispositivos sin GPU dedicada.
- Opciones de despliegue: `transformers` (via `AutoModelForCausalLM`), text-generation-inference (el repositorio incluye los tags correspondientes) y cualquier endpoint compatible con la API de inferencia de Hugging Face. Para llama.cpp u Ollama seria necesaria una conversion manual a GGUF, que no se proporciona en el repositorio.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No disponible. La busqueda web realizada no devolvio informacion relevante sobre modelos comparables (los resultados se referian a ChatGPT y otros productos de OpenAI, sin relacion con este modelo). El ecosistema NanoDex agrupa otros modelos entrenados con la misma herramienta y de escala similar, pero no se dispone de datos concretos de parametros, contexto o rendimiento para establecer una comparativa rigurosa.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Overaddicted-500K | 492.192 | 512 | ODC-BY | Hugging Face (safetensors) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; al entrenarse sobre fineweb-edu, heredaria los sesgos presentes en ese corpus, si bien a esta escala la capacidad de reflejarlos de forma coherente es muy limitada.
- Riesgo de alucinacion: total. El autor indica explicitamente que la salida no es factual; el modelo genera texto plausible a nivel de forma, no de contenido.
- Limitacion de contexto: 512 tokens, insuficiente para cualquier tarea que requiera contexto largo o conversaciones multi-turno.
- Limitacion de idioma: solo ingles; no hay soporte para castellano ni otras lenguas.
- Restricciones de licencia: ODC-BY es permisiva y permite uso comercial, pero exige atribucion al autor y a la licencia. Conviene revisar los terminos exactos antes de redistribuir.
- No es un asistente: no esta ajustado por instrucciones, no sigue ordenes y no debe integrarse en productos orientados a usuario final.
- Caveat de produccion: con 492.192 parametros y un vocabulario de 2.048 tokens, la calidad de generacion es deliberadamente baja; cualquier uso real requeriria un modelo de otra escala.
- Advertencia de uso: el propio autor lo define como un artefacto de investigacion a escala nano, no como un modelo funcional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DedeProGames/Overaddicted-500K
- Dataset de entrenamiento (fineweb-edu): https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- NanoDex Trainer (Space de entrenamiento): https://huggingface.co/spaces/hugging-science/nanodex-trainer
- Perfil del autor: https://huggingface.co/DedeProGames
