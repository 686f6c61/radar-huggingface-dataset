# ntc-ai/model-glue-sd15-sana-text

## Resumen

El modelo `ntc-ai/model-glue-sd15-sana-text` es un puente de condicionamiento (model glue) desarrollado por ntc-ai que conecta el codificador de texto CLIP de Stable Diffusion 1.5 con el modelo de texto a imagen SANA de NVIDIA. En concreto, traduce los 77 estados de texto de dimensión 768 que produce el CLIP de SD1.5 a los 77 estados de condicionamiento de dimensión 2304 que espera SANA, además de generar una máscara. El resultado es un forward determinista que no requiere ajuste fino, búsqueda ni muestreo de partículas durante la inferencia.

El proyecto forma parte del repositorio model-glue de 255BITS y no es un pipeline Diffusers completo: el codificador de texto donante, el transformer de SANA y el decodificador DC-AE se cargan por separado en revisiones fijadas. El puente tiene 7,54 millones de parámetros, está licenciado bajo MIT y soporta entrada en inglés limitada a 77 tokens. Su relevancia radica en la investigación de model stitching, permitiendo reutilizar un codificador de texto existente (CLIP de SD1.5) con un modelo generativo moderno (SANA 600M) sin necesidad de cargar el codificador Gemma nativo de SANA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Puente determinista (proyección lineal/MLP) que mapea 77×768 estados CLIP de SD1.5 a 77×2304 estados de condicionamiento de SANA más una máscara |
| Parametros totales | 7.540.114 (7,54 M) |
| Parametros activos | No disponible (no es un modelo MoE) |
| Longitud de contexto | 77 tokens (límite de entrada del CLIP de SD1.5) |
| Tipos de cuantizacion | No disponible; el despliegue probado usa CLIP FP16, puente FP32 y SANA BF16 |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo no es un transformer ni un MoE, sino una capa de adaptación entrenada. La arquitectura consta de una proyección lineal (o una variante expandida con acceso completo a la fuente) que transforma los 768 valores por token del CLIP de SD1.5 en los 2304 valores por token que necesita el transformer de SANA, más una máscara de condicionamiento. El puente se ejecuta como un forward determinista y, a continuación, se realiza el muestreo normal con SANA congelado.

El entrenamiento se realizó en el contexto del repositorio model-glue. La selección del checkpoint por defecto se basó en 58 prompts de validación y 16 prompts de prueba (3 semillas cada uno, 20 pasos, 512×512, guidance 4.5). El checkpoint por defecto es una continuación lineal seleccionada por validación con calibración fija de la máscara, entrenada en la actualización 1250. Existen dos alternativas: una sin calibrar (misma cabeza lineal, actualización 1250) y una con cabeza expandida y acceso completo a la fuente (actualización 1000). No se menciona RLHF ni DPO; la alineación se aborda mediante calibración de la máscara.

## Capacidades

- Traducción de embeddings de texto: convierte 77×768 estados CLIP de SD1.5 en 77×2304 estados de condicionamiento de SANA y una máscara.
- Inferencia determinista: no utiliza ajuste, búsqueda, muestreo de partículas ni selección de candidatos durante la generación.
- Compatibilidad con SANA: los pesos del puente incluyen el condicionamiento vacío nativo de SANA, por lo que no se necesita cargar el codificador Gemma.
- Generación de texto a imagen: el puente es el componente de texto; el resto del pipeline (SANA transformer y decodificador DC-AE) se carga por separado.
- Soporte de tres variantes de checkpoint: por defecto (calibrado), sin calibrar y con cabeza expandida.
- Entrada limitada a 77 tokens, con longitudes de secuencia coincidentes entre el origen y el destino.
- No soporta tool calling, funciones, agentes, razonamiento multi-paso, visión ni audio.

## Casos de uso

- Investigación en model stitching: permite estudiar cómo un codificador de texto de un modelo generativo puede reutilizarse en otro. El puente se usa como capa de adaptación entrenada, cargando el CLIP de SD1.5 y el transformer de SANA por separado, y se evalúa la fidelidad de la imagen generada con métricas como LPIPS y CLIP cosine.
- Migración de pipelines SD1.5 a SANA: en un entorno donde ya existe infraestructura basada en SD1.5 (prompts, embeddings CLIP), este puente permite generar imágenes con SANA sin reentrenar el modelo de texto a imagen completo. Basta con sustituir el codificador de texto por el puente.
- Reducción de memoria al eliminar el codificador Gemma: SANA nativo requiere el codificador Gemma; este puente lo sustituye por el CLIP de SD1.5, más ligero y ya cargado en muchos sistemas. El puente almacena el condicionamiento vacío de SANA, por lo que no se necesita el codificador extra.
- Comparación de estrategias de calibración: los tres checkpoints (calibrado, sin calibrar, expandido) permiten comparar el efecto de la calibración de la máscara y del acceso a la fuente en la fidelidad de la composición. Útil para investigación sobre la importancia del alineamiento del tokenizador.
- Reproducción de resultados de investigación: el repositorio model-glue incluye un CLI con revisiones fijadas y verificación de hash. Se puede reproducir el ejemplo de la playa con el prompt dado y semilla 87654, guardando render.json con el hash del checkpoint y la verificación del forward determinista.
- Generación de imágenes en entornos con presupuesto computacional limitado: con SANA 600M y salida 512×512, el despliegue completo (CLIP FP16, puente FP32, SANA BF16) es ligero. El puente en sí solo tiene 7,54 M parámetros, por lo que puede ejecutarse en GPUs de consumo.
- Prototipado de pipelines híbridos: al ser un componente de adaptación, permite combinar codificadores de texto de diferentes familias (CLIP vs Gemma) en un mismo modelo generativo, facilitando experimentos de transferencia de estilo o de semántica.

## Benchmarks y rendimiento

El autor proporciona métricas de fidelidad sobre un conjunto de prueba de 16 prompts × 3 semillas (20 pasos, 512×512, guidance 4.5). No se han publicado resultados en benchmarks estándar como MMLU o HumanEval, ya que no es un modelo de lenguaje.

| Metodo | LPIPS nativo ↓ | MAE de pixel ↓ | Coseno CLIP ↑ |
|---|---|---|---|
| Parent original (línea base de comparación) | 0.38347 | 0.14984 | 0.30620 |
| Continuación lineal sin calibrar | 0.37711 | 0.14652 | 0.30744 |
| Default seleccionado por validación | 0.37802 | 0.14609 | 0.30757 |
| Alternativa de fuente expandida | 0.37778 | 0.14716 | 0.30815 |
| Referencia nativa SANA | 0.00000 | 0.00000 | 0.30820 |

El checkpoint por defecto mejora el LPIPS un 1,42 % y el MAE de pixel un 2,50 % frente al parent original. Sin embargo, el intervalo de confianza bootstrap del 95 % para la diferencia pareada de LPIPS (−0.00545) es [−0.01769, +0.00817], que incluye el cero, por lo que la mejora no es estadísticamente significativa. La calibración de la máscara reduce los errores de validación de 6 a 4, pero aumenta las posiciones de prueba fallidas de 1 a 3 y reduce las máscaras exactas de 15/16 a 14/16.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Los componentes indicados (CLIP FP16, puente FP32, SANA BF16 y decodificador DC-AE) sugieren un consumo orientativo de 4–8 GB para salida 512×512.
- GPU recomendadas: no hay especificación oficial. El ejemplo de ejecución usa CUDA; una GPU con al menos 8 GB (por ejemplo RTX 3060/4060, A10) debería ser suficiente para 512×512.
- ¿Cabe en consumer GPU? Sí, previsiblemente en RTX 3060/4060 con 8-12 GB, dado el tamaño del modelo SANA 600M.
- Opciones de despliegue: model-glue (CLI Python en el repositorio 255BITS/model-glue). No se mencionan vLLM, Ollama, llama.cpp ni TGI.
- Latencia y throughput: no disponible. El ejemplo usa 20 pasos de muestreo a 512×512 con guidance 4.5; no se aportan medidas de tiempo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| ntc-ai/model-glue-sd15-sana-text (default) | 7,54 M (puente) | 77 tokens | MIT | HuggingFace |
| Alternativa sin calibrar (mismo repo) | 7,54 M (aprox.) | 77 tokens | MIT | HuggingFace |
| Alternativa expandida (mismo repo) | no disponible (cabeza expandida) | 77 tokens | MIT | HuggingFace |
| SANA 600M nativo (Efficient-Large-Model/Sana_600M_512px_diffusers) | 600 M | no disponible | no disponible | HuggingFace |
| Stable Diffusion 1.5 (parent) | no disponible | 77 tokens | no disponible | HuggingFace |

La referencia nativa SANA alcanza LPIPS 0 y coseno CLIP 0.30820 en la evaluación del autor, mientras que el puente por defecto se queda en 0.37802 y 0.30757 respectivamente. La diferencia con el parent original es pequeña y no significativa, lo que indica que el puente no restaura completamente la alineación del codificador nativo.

## Limitaciones y advertencias

- Errores de composición y atributos: la evaluación del autor indica que los errores de composición y atributos persisten. Ejemplos observados: "el coche pequeño entre camiones no se recupera" y "el cisne sigue pareciendo un ganso".
- Mejoras no estadísticamente significativas: el intervalo de confianza del 95 % para la diferencia de LPIPS incluye el cero, por lo que no se puede afirmar una ganancia real en fidelidad frente al parent original.
- Sin alineación palabra a palabra: el puente usa longitudes de secuencia coincidentes entre el CLIP y SANA, pero no establece alineación a nivel de palabra entre los tokenizadores. Esto puede causar desalineaciones semánticas.
- Entrada limitada a 77 tokens: los prompts más largos que 77 tokens no se pueden procesar.
- Sesgos heredados: no se documentan sesgos específicos, pero al usar CLIP de SD1.5 y SANA, el modelo puede heredar sesgos presentes en los datos de entrenamiento de ambos.
- Licencia MIT para el puente, pero los modelos base (SD1.5 y SANA) tienen sus propias licencias; el uso comercial debe verificar las condiciones de cada uno.
- No es un modelo independiente: requiere cargar por separado el codificador CLIP, el transformer SANA y el decodificador DC-AE en revisiones fijadas. El repositorio model-glue debe estar en el commit indicado.
- Alucinación: en el sentido de generación de contenido no solicitado, el modelo puede producir objetos o atributos no presentes en el prompt, como se observa en los errores de composición.
- Inferencia falsa: el modelo no soporta tool calling ni agentes; su capacidad se limita a la generación de imágenes a partir de texto.

## Enlaces

- Página del modelo en HuggingFace: https://huggingface.co/ntc-ai/model-glue-sd15-sana-text
- Repositorio model-glue: https://github.com/255BITS/model-glue (revisión probada: f67054d329fe5246510a094dd791d485526e3dd6)
- Repositorio SANA de NVIDIA: https://github.com/NVlabs/Sana
- Modelo base SANA: https://huggingface.co/Efficient-Large-Model/Sana_600M_512px_diffusers
- Modelo base SD1.5: https://huggingface.co/stable-diffusion-v1-5/stable-diffusion-v1-5
- Recurso general sobre SANA: https://www.aimodels.fyi/models/replicate/sana-nvidia
