# divinetribe/Llama-3.3-70B-Instruct-abliterated-8bit-mlx

## Resumen

Llama-3.3-70B-Instruct-abliterated-8bit-mlx es una cuantización en 8 bits del modelo huihui-ai/Llama-3.3-70B-Instruct-abliterated, publicada por el usuario divinetribe. Se trata de una variante "abliterated" (con los mecanismos de rechazo eliminados mediante edición de pesos) del Llama 3.3 70B Instruct de Meta, convertida al formato MLX para su ejecución nativa en Apple Silicon. El resultado es un modelo de 70.553.706.496 parámetros (unos 70,5 mil millones) pensado para inferencia local en Mac con chip de la serie M.

El modelo hereda la arquitectura transformer densa de Llama 3.3 y su ventana de contexto, y añade la particularidad de haber sido "abliterated": se han suprimido las direcciones de activación asociadas al rechazo de peticiones, de modo que el modelo responde a instrucciones que el Instruct original declinaría. Es relevante para investigadores que estudian alineación, robustez y comportamiento de modelos sin censura, así como para desarrolladores que necesitan un LLM grande ejecutándose íntegramente en local sobre hardware Apple.

La ficha se centra en los datos disponibles en la model card y en los metadatos de Hugging Face. No se han publicado resultados de benchmarks ni detalles del proceso de cuantización o abliteration en la información proporcionada, por lo que esos apartados se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Llama 3.3), pesos en formato MLX |
| Parametros totales | 70.553.706.496 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada de Llama 3.3 Instruct; valor exacto no confirmado) |
| Tipos de cuantizacion | 8 bits (esta publicacion); el modelo base abliterated ofrece otras variantes no detalladas aqui |
| Idiomas soportados | en, fr, it, pt, hi, es, th, de |
| Licencia | llama3.3 (Llama 3.3 Community License Agreement) |
| Formato de pesos | safetensors en formato MLX (libreria mlx) |

## Arquitectura y entrenamiento

El modelo es una cuantizacion a 8 bits del checkpoint huihui-ai/Llama-3.3-70B-Instruct-abliterated, que a su vez deriva de Llama 3.3 70B Instruct de Meta. La arquitectura subyacente es un transformer denso decoder-only de la familia Llama 3, con 70,5 mil millones de parametros. La publicacion de divinetribe no aporta detalles sobre el proceso de cuantizacion (calibracion, grupo de cuantizacion, precision de escalas) mas alla de la indicacion "8-bit" y el uso de la libreria MLX.

Sobre el entrenamiento original no se incluye informacion en la model card: no se detallan el numero de tokens, la composicion del dataset ni las fases de RLHF/DPO de Llama 3.3 Instruct. Tampoco se documenta el procedimiento de "abliteration" aplicado por huihui-ai (tipicamente, identificacion y ablacion de direcciones de rechazo en el espacio de activaciones). Todos estos datos deben considerarse no disponibles en la informacion proporcionada.

## Capacidades

- Generacion de texto conversacional y seguimiento de instrucciones, heredadas de Llama 3.3 Instruct.
- Razonamiento y respuesta a preguntas en los ocho idiomas declarados: ingles, frances, italiano, portugues, hindi, espanol, tailandes y aleman.
- Comportamiento "uncensored": al haberse ablacionado los mecanismos de rechazo, responde a peticiones que el modelo Instruct original declinaria.
- Ejecucion local en Apple Silicon mediante MLX y mlx-lm, sin dependencia de servicios en la nube.
- Soporte de tool calling y function calling: no confirmado explicitamente en la informacion proporcionada (Llama 3.3 Instruct lo soporta; la cuantizacion MLX no lo documenta).
- Capacidades de agente y razonamiento multi-paso: no documentadas en esta publicacion.
- Vision, audio o modo "thinking": no disponibles.

## Casos de uso

- Investigacion sobre alineacion y rechazo: comparar las respuestas del modelo abliterated con las del Llama 3.3 Instruct original para estudiar que comportamientos se eliminan con la ablacion y como afecta a la utilidad y a la seguridad.
- Inferencia local en Mac de gama alta: desplegar un LLM de 70B en un MacBook o Mac Studio con memoria unificada suficiente, usando MLX para aprovechar la GPU integrada sin servidores externos.
- Procesamiento de documentos confidenciales: al ejecutarse integramente en el dispositivo, permite resumir, extraer y reescribir textos sensibles sin enviarlos a terceros.
- Generacion de contenido creativo sin restricciones editoriales: redaccion de ficcion, guiones o material divulgativo donde el modelo original aplicaria filtros de rechazo.
- Asistencia multilingue: traduccion y redaccion en espanol, frances, italiano, portugues, aleman, hindi y tailandes ademas del ingles, aprovechando el soporte declarado de ocho idiomas.
- Prototipado de pipelines de generacion de texto: validar prompts y flujos conversacionales en local antes de migrar a un despliegue en servidor con el modelo completo o con otra cuantizacion.
- Docencia y demostraciones: mostrar en un aula o laboratorio el comportamiento de un modelo grande sin censura y discutir sus implicaciones eticas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada: al estar en 8 bits, los pesos ocupan aproximadamente 70,5 GB; el repositorio completo pesa 75,0 GB. Se necesita memoria unificada libre por encima de esa cifra para el modelo mas la cache KV y el overhead de MLX.
- Hardware objetivo: Apple Silicon con memoria unificada de 96 GB o superior (Mac Studio M2/M3 Ultra, MacBook Pro M3/M4 Max con 128 GB). Con 64 GB no es viable cargar los pesos completos.
- GPU NVIDIA: el formato MLX no es compatible de forma nativa con CUDA; para A100/H100/RTX 4090 habria que usar otra cuantizacion del modelo base en GGUF o safetensors.
- Despliegue: MLX y mlx-lm en macOS; no se documentan integraciones con vLLM, TGI, llama.cpp u Ollama para este checkpoint concreto.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| divinetribe/Llama-3.3-70B-Instruct-abliterated-8bit-mlx | 70,5B | No disponible | MLX 8-bit | llama3.3 | Objetivo: inferencia local en Apple Silicon |
| huihui-ai/Llama-3.3-70B-Instruct-abliterated (modelo base) | 70,5B | No disponible | safetensors (BF16/FP16) | llama3.3 | Sin cuantizar; requiere mucha mas memoria |
| Llama-3.3-70B-Instruct (Meta) | 70,5B | No disponible | safetensors | llama3.3 | Version con alineacion y rechazo intactos |
| Otras cuantizaciones 8-bit del modelo base (GGUF, AWQ, etc.) | 70,5B | No disponible | GGUF/safetensors | llama3.3 | Compatibles con llama.cpp y GPUs NVIDIA |

La comparativa se limita a parametros, formato y licencia: no hay datos de rendimiento publicados para esta publicacion que permitan comparar calidad.

## Limitaciones y advertencias

- Modelo "abliterated": la supresion de los mecanismos de rechazo implica que puede generar contenido danino, ilegal o inseguro. No es adecuado para aplicaciones de cara al publico sin filtros adicionales.
- Riesgo de alucinacion: como cualquier LLM de su clase, puede inventar hechos; no hay evaluaciones publicadas que cuantifiquen su fiabilidad.
- Sin benchmarks: no se ha verificado el impacto de la cuantizacion a 8 bits ni de la ablacion en la calidad respecto al modelo original.
- Licencia Llama 3.3: uso comercial permitido con condiciones (atribucion "Built with Llama", inclusion de la licencia, nombre de modelos derivados empezando por "Llama", y solicitud de licencia a Meta si se superan los 700 millones de usuarios activos mensuales). El acceso esta sujeto a aceptacion del acuerdo (gated).
- Restricciones de hardware: el formato MLX limita el despliegue a Apple Silicon; no es portable a CUDA sin reconvertir.
- Idiomas: solo se declaran ocho; el rendimiento en espanol, hindi o tailandes no esta cuantificado y puede ser inferior al del ingles.
- Contexto: la longitud exacta soportada por esta cuantizacion no se documenta en la model card.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/divinetribe/Llama-3.3-70B-Instruct-abliterated-8bit-mlx
- Modelo base abliterated: https://huggingface.co/huihui-ai/Llama-3.3-70B-Instruct-abliterated
- Documentacion de Llama: https://llama.com/docs/overview
- Descarga de Llama: https://www.llama.com/llama-downloads
- Politica de uso aceptable de Llama 3.3: https://www.llama.com/llama3_3/use-policy
