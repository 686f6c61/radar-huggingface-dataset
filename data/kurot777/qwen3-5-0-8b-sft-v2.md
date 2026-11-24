# kurot777/qwen3-5-0.8b-sft-v2

## Resumen

kurot777/qwen3-5-0.8b-sft-v2 es un ajuste fino supervisado (SFT) del modelo base Qwen/Qwen3.5-0.8B, publicado por el usuario kurot777 en Hugging Face. Se trata de un modelo multimodal de tipo image-text-to-text, es decir, acepta entradas que combinan imagen y texto y genera texto como salida. Con 873.438.784 parametros (aproximadamente 0,87 mil millones), se situa en la gama ultraligera, pensada para despliegues con recursos muy limitados.

El modelo se ha entrenado mediante SFT utilizando Unsloth y la libreria TRL de Hugging Face, segun indica el autor en la model card. No se documentan detalles sobre el dataset de ajuste, el numero de tokens de entrenamiento ni hiperparametros, y la model card es practicamente un esqueleto generado automaticamente por la plantilla de Unsloth. El repositorio ocupa 1,8 GB y los pesos se distribuyen en formato safetensors.

Su relevancia es limitada pero concreta: ofrece una variante afinada de un modelo base pequeno y multimodal con licencia Apache 2.0, lo que permite experimentacion y despliegue comercial sin las restricciones de licencias mas cerradas. No obstante, al no publicarse benchmarks, datos de entrenamiento ni evaluaciones, su utilidad practica debe validarse empiricamente antes de considerarlo en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), familia Qwen3.5; detalles internos no disponibles |
| Parametros totales | 873.438.784 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con cuantizacion posterior via herramientas externas) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del base Qwen/Qwen3.5-0.8B, que pertenece a la familia Qwen3.5 de Alibaba. Por la etiqueta image-text-to-text, el modelo base incorpora capacidad multimodal (procesamiento de imagen y texto), aunque la model card no detalla el codificador visual ni la configuracion exacta del transformer. El tamano de 873 millones de parametros lo situa en la gama ultraligera dentro de la familia.

El entrenamiento consistio en un SFT (supervised fine-tuning) realizado con Unsloth y TRL, segun el autor. No se especifican el volumen de datos, la composicion del dataset, si hubo etapas de RLHF o DPO, ni la metodologia de alineacion. Tampoco se documentan innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, etc.). La informacion disponible sobre el proceso de entrenamiento es, por tanto, minima.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del ajuste SFT sobre el base Qwen3.5-0.8B.
- Procesamiento de entradas imagen-texto (pipeline image-text-to-text), lo que permite describir imagenes o responder preguntas sobre ellas, segun la configuracion del modelo base.
- Generacion de texto autoregresiva estandar; no se documentan modos especiales como thinking mode.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado; la capacidad real dependera del base y del ajuste, sin evidencia publicada.
- Capacidades multilingues: limitadas al ingles segun la etiqueta de idioma.
- Capacidades de audio o vision avanzada mas alla de image-text: no disponibles.

## Casos de uso

- Prototipado rapido de asistentes multimodales: al ser un modelo de menos de 1.000 millones de parametros, puede ejecutarse en una unica GPU consumer para validar flujos de pregunta-respuesta sobre imagenes antes de escalar a modelos mayores.
- Descripcion automatica de imagenes en pipelines de bajo coste: el modelo puede generar leyendas o descripciones breves en ingles para catalogos, archivos o contenido generado por usuarios, con requisitos de VRAM muy reducidos.
- Clasificacion y extraccion de informacion de documentos escaneados: combinando imagen y texto, puede responder preguntas simples sobre capturas o formularios en entornos con recursos limitados.
- Educacion y demos interactivas: su tamano permite desplegarlo en portatiles o entornos de aula para demostrar tecnicas de ajuste fino (SFT con Unsloth/TRL) y evaluacion de modelos multimodales.
- Base para experimentacion en investigacion: sirve como punto de partida para estudiar el efecto del SFT en modelos pequenos, comparando con el base Qwen3.5-0.8B sin ajustar.
- Filtrado y moderacion de contenido visual en ingles: puede utilizarse como primer nivel de triaje para describir o etiquetar imagenes antes de pasarlas a un modelo mayor, reduciendo coste computacional.
- Integracion en entornos edge o embebidos: con cuantizacion a 4 u 8 bits, el modelo puede caber en dispositivos con poca memoria, aunque no se han publicado mediciones de latencia ni throughput.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP16/BF16, aproximadamente 1,8 GB solo para pesos, mas overhead de activaciones y KV cache; en la practica, entre 3 y 5 GB segun longitud de contexto y lote. En cuantizacion de 4 bits, los pesos rondarian los 0,5 GB.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM para FP16 (RTX 3060, RTX 4060, RTX 4090); para cuantizacion 4 bits, GPUs con 4 GB o incluso CPU.
- Cabe en GPU consumer: si, en practicamente toda la gama consumer moderna (RTX 30/40, Apple Silicon con Metal).
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag endpoints_compatible), llama.cpp/Ollama si se generan pesos GGUF (no incluidos en el repo), vLLM (compatibilidad no verificada para esta arquitectura).
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kurot777/qwen3-5-0.8b-sft-v2 | 873 M | no disponible | Si (image-text-to-text) | Apache 2.0 | Hugging Face |
| Qwen/Qwen3.5-0.8B (base) | ~0,8 B | no disponible | Si (segun familia) | Apache 2.0 | Hugging Face |
| SmolVLM-500M (Hugging Face) | ~0,5 B | no disponible | Si | Apache 2.0 | Hugging Face |
| PaliGemma-3B (Google) | ~3 B | no disponible | Si | Gemma license | Hugging Face |

La comparacion con SmolVLM y PaliGemma es orientativa por categoria (modelos multimodales pequenos); no se dispone de datos de rendimiento del modelo de kurot777 para establecer una comparacion cuantitativa. El base Qwen3.5-0.8B es la referencia directa, y el ajuste SFT no incluye evaluacion publicada frente a el.

## Limitaciones y advertencias

- Ausencia total de benchmarks y evaluaciones: no hay evidencia publicada sobre calidad, alucinacion o robustez; el ajuste SFT podria degradar capacidades del base sin que se documente.
- Model card practicamente vacia: no se detalla el dataset de entrenamiento, los hiperparametros ni el proceso de alineacion, lo que impide auditar sesgos o comportamientos no deseados.
- Idioma: solo se declara ingles; el rendimiento en castellano no esta garantizado y probablemente sea deficiente.
- Riesgo de alucinacion: inherente a modelos de este tamano; en tareas de descripcion de imagenes o QA visual puede inventar detalles no presentes en la imagen.
- Contexto: longitud de contexto no documentada; no debe asumirse una ventana larga sin verificacion empirica.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantias ni soporte; la responsabilidad de validacion recae en el integrador.
- Repositorio sin descargas ni likes en el momento de la consulta: no hay senales de uso comunitario ni validacion por terceros.
- Compatibilidad: aunque se etiqueta como endpoints_compatible y transformers, no se confirma soporte en vLLM, llama.cpp u otros motores; habria que convertir pesos para GGUF.

## Enlaces

- Hugging Face: https://huggingface.co/kurot777/qwen3-5-0.8b-sft-v2
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Unsloth (herramienta de entrenamiento): https://github.com/unslothai/unsloth
- TRL (libreria de Hugging Face): https://github.com/huggingface/trl
