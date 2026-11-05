# mradermacher/tawkeed-0.8b-GGUF

## Resumen

Tawkeed 0.8B es un modelo de lenguaje de pequeno tamano (752 millones de parametros) desarrollado originalmente por el equipo de tawkeed-sa y distribuido en formato GGUF por mradermacher. Esta disenado especificamente para su despliegue en el borde (edge computing) y en dispositivos, con un enfoque claro en el idioma arabe y el ingles. Su reducido tamano lo convierte en una opcion viable para inferencia local en hardware modesto, incluso en CPU.

La version aqui documentada es una cuantizacion estatica del modelo base `tawkeed-sa/tawkeed-0.8b`, publicada bajo licencia Apache 2.0. El repositorio incluye un amplio abanico de cuantizaciones GGUF que van desde Q2_K (0,5 GB) hasta f16 (1,6 GB), ademas de ficheros mmproj que sugieren capacidades multimodales en el modelo original. La existencia de estos ficheros mmproj es un indicio relevante, aunque la model card no detalla las capacidades de vision.

El modelo resulta relevante para desarrolladores que necesitan un LLM ligero, multilingue (arabe/ingles) y con licencia permisiva para integraciones en produccion sobre hardware limitado. No obstante, la informacion publica disponible es muy escasa: no se detallan la arquitectura interna, la longitud de contexto, los datos de entrenamiento ni los resultados de benchmarks, lo que limita una evaluacion tecnica profunda.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (transformer, segun la libreria transformers) |
| Parametros totales | 752.393.024 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, IQ4_XS, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; mmproj en Q8_0 y f16 |
| Idiomas soportados | arabe (ar), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones); safetensors en el modelo base |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base `tawkeed-sa/tawkeed-0.8b`. La libreria declarada es `transformers` y el recuento de parametros (752 millones) es coherente con un transformer decoder-only de escala sub-1B. La presencia de ficheros `mmproj` en el repositorio GGUF sugiere que el modelo base podria incorporar un proyector multimodal, aunque no se especifica que modalidad adicional soporta ni como se entreno.

Tampoco se documentan el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de alineacion como RLHF o DPO. La model card del repositorio GGUF es exclusivamente una ficha de cuantizacion generada por mradermacher y remite al modelo base para cualquier detalle de entrenamiento, sin aportar informacion adicional. No se han identificado innovaciones tecnicas documentadas (atencion lineal, decodificacion especulativa, etc.).

## Capacidades

- Generacion de texto conversacional en arabe e ingles, segun los tags `conversational`, `arabic` y `en`.
- Orientado a inferencia en dispositivo (`edge`, `on-device`), lo que implica un diseno para baja latencia y bajo consumo de memoria.
- Posible soporte multimodal: el repositorio incluye ficheros `mmproj` (Q8_0 y f16), lo que sugiere capacidad de procesamiento de imagenes en el modelo base, aunque no se detalla en la documentacion.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues limitadas a arabe e ingles.
- Modo de razonamiento explicito (thinking mode): no disponible en la informacion proporcionada.

## Casos de uso

- Asistentes conversacionales locales en dispositivos moviles o embebidos: con 752 millones de parametros y cuantizaciones desde 0,5 GB, el modelo puede ejecutarse en telefonos de gama media o en placas tipo Raspberry Pi, ofreciendo conversacion en arabe e ingles sin conexion a la nube.
- Traduccion y atencion al cliente en arabe: el modelo esta especializado en arabe, lo que lo hace adecuado para chatbots de soporte en mercados de habla arabe, con la ventaja de que la inferencia puede residir en infraestructura local por motivos de privacidad.
- Procesamiento de texto en el borde para IoT: en escenarios donde no hay conectividad fiable, el modelo puede realizar tareas de clasificacion, resumen o extraccion de informacion sobre textos cortos en arabe o ingles.
- Prototipado rapido de aplicaciones NLP: gracias a su licencia Apache 2.0 y a la disponibilidad de cuantizaciones GGUF, es util para experimentar con pipelines de generacion de texto en entornos con recursos limitados antes de escalar a modelos mayores.
- Filtrado y moderacion de contenido en arabe: un modelo ligero puede desplegarse como primera capa de clasificacion de mensajes en plataformas de habla arabe, reduciendo costes frente a modelos de mayor tamano.
- Educacion y tutoria automatizada offline: aplicaciones educativas en zonas con conectividad limitada pueden integrar el modelo para responder preguntas en arabe e ingles sobre dominios acotados.
- Inferencia en CPU para pruebas de CI: al caber en menos de 1 GB en cuantizacion Q4_K_M, puede incluirse en pipelines de integracion continua para validar respuestas de modelos ligeros sin necesidad de GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5 GB en Q2_K, 0,6 GB en Q4_K_M, 0,9 GB en Q8_0 y 1,6 GB en f16 (tamanos de fichero GGUF, que incluyen overhead minimo).
- GPU recomendadas: cualquier GPU consumer con al menos 2 GB de VRAM puede ejecutar la version f16; una RTX 3060 o superior permite holgura para contexto extendido. En GPUs de datacenter (A100, H100) el modelo es sobredimensionado para su capacidad, pero puede usarse en despliegues multi-instancia.
- Cabe en GPU consumer: si, en practicamente cualquier GPU dedicada moderna e incluso en iGPUs con memoria compartida suficiente.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y cualquier runtime compatible con GGUF. Para el modelo base en safetensors, transformers con aceleracion CUDA o CPU.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. Por el tamano, se espera una latencia muy baja en hardware consumer, pero no hay datos medidos publicados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| tawkeed-0.8b-GGUF | 752 M | no disponible | ar, en | Apache 2.0 | GGUF |
| Qwen2.5-0.5B | 494 M | 32 K (segun documentacion publica de Qwen) | multilingue | Apache 2.0 | safetensors, GGUF |
| Llama 3.2 1B | 1,24 B | 128 K (segun documentacion publica de Meta) | multilingue | Llama 3.2 Community License | safetensors, GGUF |
| Gemma 2 2B | 2,6 B | 8 K (segun documentacion publica de Google) | multilingue | Gemma Terms of Use | safetensors, GGUF |

Nota: los datos de contexto y licencia de los modelos comparables provienen de documentacion publica general y no de la informacion proporcionada en esta ficha; se incluyen solo como referencia orientativa. No hay datos de rendimiento comparativo disponibles para tawkeed-0.8b.

## Limitaciones y advertencias

- Informacion tecnica muy escasa: no se documentan arquitectura, contexto, datos de entrenamiento ni benchmarks, lo que impide evaluar su calidad real frente a alternativas.
- Riesgo de alucinacion: como cualquier LLM de 752 millones de parametros, la tasa de alucinacion es previsiblemente alta, especialmente en tareas de conocimiento factual.
- Cobertura limitada de idiomas: solo arabe e ingles; no se garantiza un rendimiento aceptable en castellano ni en otras lenguas.
- Sesgos desconocidos: no se ha publicado informacion sobre sesgos demograficos, culturales o linguisticos del modelo base.
- Capacidad multimodal incierta: la presencia de ficheros `mmproj` sugiere vision, pero no se documenta ni se confirma su funcionamiento.
- Licencia Apache 2.0: permisiva para uso comercial, pero conviene verificar que el modelo base `tawkeed-sa/tawkeed-0.8b` mantiene la misma licencia y que no existen restricciones adicionales en los datos de entrenamiento.
- Para produccion: se recomienda validar el modelo en el dominio concreto antes de desplegarlo, dado que no hay benchmarks publicos que respalden su calidad.

## Enlaces

- Repositorio HuggingFace (GGUF): https://huggingface.co/mradermacher/tawkeed-0.8b-GGUF
- Modelo base: https://huggingface.co/tawkeed-sa/tawkeed-0.8b
- Cuantizaciones con imatrix: https://huggingface.co/mradermacher/tawkeed-0.8b-i1-GGUF
- Pagina de descarga del autor: https://hf.tst.eu/model#tawkeed-0.8b-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
