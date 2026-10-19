# Ast3rixzz/fliqo-v4-q4f16_1-MLC

## Resumen

Fliqo v4 es un ajuste fino (fine-tune) del modelo Qwen3-1.7B de Alibaba Qwen, empaquetado en formato MLC (q4f16_1) para su ejecución en el navegador mediante WebLLM y WebGPU. Lo publica el usuario Ast3rixzz bajo licencia Apache 2.0 y su propósito declarado es actuar como "Fliqo's Buddy", un director creativo orientado a creadores de contenido. El repositorio ocupa aproximadamente 1,0 GB e incluye únicamente los pesos cuantizados y los artefactos necesarios para MLC-LLM, no los pesos originales en safetensors.

El interés técnico del modelo no reside en su arquitectura —heredada íntegramente del Qwen3-1.7B denso— sino en el pipeline de despliegue: al emplear la librería WebGPU estándar `Qwen3-1.7B-q4f16_1`, el modelo puede cargarse en un navegador de escritorio sin backend, sin instalación y sin enviar datos a un servidor. Esto lo convierte en un ejemplo práctico de inferencia en el edge (edge inference) para aplicaciones web estáticas.

Se trata de un modelo de nicho, con cero descargas y cero "likes" en el momento de la ficha, sin benchmarks publicados ni documentación sobre el dataset de ajuste. Es relevante como referencia para quien quiera evaluar el flujo completo "fine-tune con LoRA → merge → cuantización MLC → despliegue WebLLM", pero no como modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (heredada de Qwen3-1.7B) |
| Parametros totales | 1,7 mil millones (modelo base); pesos almacenados a 4 bits |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 32.768 tokens en el modelo base (extensible a 131.072 con YaRN); no verificado para el fine-tune |
| Tipos de cuantizacion | q4f16_1 de MLC: pesos de 4 bits con cuantizacion por grupos (group size 32) y escalas en fp16; activaciones fp16 |
| Idiomas soportados | no disponible en la model card; el modelo base Qwen3 declara soporte para 119 idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | MLC-LLM / WebLLM (artefactos `mlc-chat-config.json`, `ndarray-cache.json` y shards de params); tamano del repo ~1,0 GB |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-1.7B: un transformer decoder-only denso con normalizacion RMSNorm, activacion SwiGLU, codificacion posicional rotatoria (RoPE) y atencion con query grouping (GQA). El modelo base incorpora modos de razonamiento "thinking" y "non-thinking" conmutables, y fue entrenado por el equipo Qwen de Alibaba con un volumen de tokens no detallado en la informacion disponible. Sobre esa base, el autor aplica un ajuste fino con LoRA que posteriormente fusiona (merged) en los pesos, segun indica la propia model card.

No se especifica el numero de tokens de entrenamiento del fine-tune, la composicion del dataset, ni si se emplearon tecnicas de alineacion adicionales como RLHF o DPO. Tampoco se documenta el rango ni los targets del adaptador LoRA. Tras el merge, el modelo se convierte al formato MLC y se cuantiza a q4f16_1, un esquema de 4 bits por grupos con escalas en fp16 que reduce el peso a aproximadamente 1 GB a costa de una perdida de precision no cuantificada en la model card. El paquete es compatible con la libreria WebGPU `Qwen3-1.7B-q4f16_1` ya existente en WebLLM, lo que evita recompilar kernels y simplifica el despliegue.

## Capacidades

- Generacion de texto en ingles (idioma principal inferido del caso de uso; no confirmado en la model card) y potencialmente en los idiomas del modelo base.
- Razonamiento en modo "thinking" heredado de Qwen3, aunque el fine-tune no documenta si conserva o degrada esta capacidad.
- Generacion de codigo y matematicas basicas, limitada por el tamano de 1,7 B de parametros.
- Asistencia creativa: ideas de contenido, guiones, copys y calendarios editoriales, segun el proposito declarado del autor.
- Inferencia local en navegador mediante WebLLM y WebGPU, sin backend ni llamadas a API.
- Soporte de tool calling: el modelo base Qwen3 lo incluye, pero no hay confirmacion de que el fine-tune lo preserve ni de que WebLLM lo exponga en esta configuracion.
- Capacidades de agente y razonamiento multi-paso: teoricamente posibles por herencia del base, sin evaluacion publicada.
- Sin capacidades de vision, audio ni multimodalidad.

## Casos de uso

- **Asistente creativo embebido en una web de creadores:** el modelo se carga en el navegador del usuario y genera ideas, titulares y guiones sin backend, lo que elimina costes de servidor y mantiene el contenido del usuario en su dispositivo.
- **Prototipado de aplicaciones WebLLM:** sirve como ejemplo funcional de un fine-tune empaquetado en q4f16_1 que reutiliza una libreria WebGPU existente, util para equipos que quieran replicar el flujo sin escribir kernels propios.
- **Generacion de copys para redes sociales:** dado su enfoque en contenido, puede producir variaciones de texto corto (posts, descripciones, hashtags) en una interfaz web estatica con latencia de unos pocos segundos en GPU de escritorio.
- **Chatbot de soporte en sitios estaticos:** al no requerir servidor, puede desplegarse en GitHub Pages o Cloudflare Pages y ofrecer respuestas guionizadas sobre un dominio concreto, siempre que se acepte la tasa de alucinacion de un modelo de 1,7 B.
- **Herramientas de escritura offline:** integrado en una PWA, permite seguir generando texto sin conexion una vez cacheado el modelo (~1 GB) en el almacenamiento del navegador.
- **Evaluacion interna de pipelines de fine-tune:** util para comparar el coste y la calidad de un LoRA fusionado y cuantizado frente al modelo base en tareas creativas, sin infraestructura de inferencia.
- **Demos y talleres educativos:** permite mostrar en una sesion presencial como un modelo ajustado corre en WebGPU, sin instalar CUDA ni dependencias de Python.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye evaluaciones de MMLU, HumanEval, GSM8K ni metricas de calidad del fine-tune, y el autor no documenta comparaciones con el modelo base.

## Requisitos de hardware

- **Peso de los pesos:** aproximadamente 1,0 GB (tamano del repositorio), correspondiente a 1,7 B de parametros a 4 bits mas cabeceras y metadatos.
- **Memoria en tiempo de ejecucion:** estimacion de 1,5 a 2,5 GB de memoria de GPU/navegador considerando pesos, cache KV para contexto moderado y buffers de WebGPU; no confirmado oficialmente.
- **GPU compatibles:** cualquier GPU con soporte WebGPU, incluidas NVIDIA GTX 10xx y superiores, AMD RX 5000 y superiores, Intel Arc e Iris Xe, y Apple Silicon (M1 en adelante).
- **Cabe en GPU de consumo:** si, en practicamente cualquier GPU discreta o integrada moderna; tambien en moviles de gama alta con WebGPU.
- **Opciones de despliegue:** WebLLM (via `MLCEngine`), MLC-LLM para compilacion y servido; para llama.cpp u Ollama seria necesario reconvertir los pesos, ya que el repositorio solo contiene artefactos MLC.
- **Latencia y throughput:** no disponible. No hay mediciones publicadas de tokens por segundo ni de tiempo de carga para este paquete concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Despliegue |
|---|---|---|---|---|---|
| Fliqo v4 (este modelo) | 1,7 B | 32.768 (base) | MLC / q4f16_1 | Apache 2.0 | WebLLM, MLC-LLM |
| Qwen3-1.7B (base) | 1,7 B | 32.768, 131.072 con YaRN | safetensors | Apache 2.0 | Transformers, vLLM, SGLang |
| Qwen2.5-1.5B-Instruct | 1,5 B | 32.768 | safetensors, GGUF | Apache 2.0 | Amplia (llama.cpp, Ollama, vLLM) |
| Llama-3.2-1B-Instruct | 1,2 B | 131.072 | safetensors, GGUF | Llama 3.2 Community License | Amplia |
| SmolLM2-1.7B-Instruct | 1,7 B | 8.192 | safetensors, GGUF | Apache 2.0 | Amplia |

Frente al Qwen3-1.7B original, Fliqo v4 pierde precision por la cuantizacion a 4 bits y anade un sesgo de dominio creativo no evaluado, pero gana la posibilidad de ejecutarse en navegador. Frente a alternativas como Llama-3.2-1B o SmolLM2, la ventaja es el empaquetado WebGPU listo para usar; la desventaja es la ausencia total de evaluaciones y de comunidad.

## Limitaciones y advertencias

- **Sin evaluacion:** cero benchmarks publicados, cero descargas y cero likes; no hay evidencia objetiva de que el fine-tune mejore al modelo base en ninguna tarea.
- **Riesgo de alucinacion:** con 1,7 B de parametros y cuantizacion de 4 bits, la tasa de hechos inventados en tareas abiertas es alta; no es apto para dominios factuales sin verificacion.
- **Idioma:** la model card esta en ingles y el caso de uso es contenido creativo, por lo que el rendimiento en castellano no esta verificado y probablemente sea inferior al del ingles.
- **Alcance del fine-tune:** no se documentan datos de entrenamiento, hiperparametros, rango LoRA ni criterios de seleccion, lo que impide reproducir o auditar el ajuste.
- **Formato cerrado al ecosistema MLC:** no se incluyen safetensors ni GGUF; usar el modelo fuera de WebLLM/MLC requiere conversion y recompilacion.
- **Dependencia de WebGPU:** el navegador debe soportar WebGPU de forma estable; Safari y navegadores antiguos pueden no estar soportados, y la memoria disponible en el contexto del navegador limita el contexto efectivo.
- **Licencia:** Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte; conviene conservar el aviso de licencia y verificar los terminos del modelo base Qwen3.
- **Mantenimiento:** autor individual, sin repositorio de codigo, issues ni actualizaciones documentadas; el modelo se publico y actualizo el mismo dia.
- **Cuantizacion q4f16_1:** la perdida de calidad respecto a fp16 no esta medida; en tareas de razonamiento o codigo puede ser apreciable.

## Enlaces

- [Modelo en HuggingFace: Ast3rixzz/fliqo-v4-q4f16_1-MLC](https://huggingface.co/Ast3rixzz/fliqo-v4-q4f16_1-MLC)
- [Modelo base: Qwen/Qwen3-1.7B](https://huggingface.co/Qwen/Qwen3-1.7B)
- [Blog de Qwen3 (Alibaba Qwen)](https://qwenlm.github.io/blog/qwen3/)
- [Repositorio MLC-LLM](https://github.com/mlc-ai/mlc-llm)
- [Repositorio WebLLM](https://github.com/mlc-ai/web-llm)
- [Especificacion WebGPU (W3C)](https://www.w3.org/TR/webgpu/)
