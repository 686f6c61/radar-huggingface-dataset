# llmfan46/gemma-4-31B-it-uncensored-heretic

## Resumen

Este modelo es una version "decensored" (descensurada) de **google/gemma-4-31B-it**, creada por el usuario independiente llmfan46 mediante la herramienta **Heretic v1.2.0** con el metodo de **Ablacion de Rango Arbitrario (ARA)**. El objetivo es reducir drásticamente las negativas del modelo original ante peticiones controvertidas, pasando de 99/100 rechazos a solo 10/100, manteniendo una divergencia KL de 0.0541 respecto al modelo base, lo que indica una alteracion minima del comportamiento general.

Se trata de un modelo multimodal (image-text-to-text) de 31.273 millones de parametros, con una ventana de contexto de hasta 262.144 tokens, derivado de la familia Gemma 4 de Google. La relevancia de este modelo radica en su enfoque de "abliteration", una tecnica que elimina selectivamente las direcciones de activacion responsables del comportamiento de rechazo sin un fine-tuning completo. Su licencia Apache 2.0 permite uso comercial sin restricciones significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Gemma 4, vision-language) |
| Parametros totales | 31.273.086.512 (31,3 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | GGUF (Q4_K_M y otros, segun repo derivado), safetensors en FP16/BF16 |
| Idiomas soportados | no disponible (heredados del modelo base Gemma 4) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo principal), GGUF (repo derivado) |

## Arquitectura y entrenamiento

El modelo parte de **google/gemma-4-31B-it**, un transformer multimodal de la familia Gemma 4 con capacidad de procesamiento de imagenes y texto. Sobre esta base, se aplica la tecnica de **abliteration** mediante la herramienta Heretic v1.2.0 con el metodo **Arbitrary-Rank Ablation (ARA)**, que identifica y elimina direcciones de activacion especificas en las capas 30 a 48 (atendiendo al componente `attn.o_proj`) responsables del comportamiento de rechazo. Los parametros de ablacion incluyen un peso de preservacion de buen comportamiento de 0.5437 y un peso de direccionamiento de mal comportamiento de 0.0005, lo que indica una intervencion quirurgica que busca minimizar el impacto en las capacidades generales del modelo.

No se ha realizado un fine-tuning clasico con datos adicionales ni se han aplicado tecnicas como RLHF o DPO sobre el modelo base. El proceso es puramente computacional sobre las activaciones del modelo original. El tamaño del repositorio es de 62,6 GB en precision nativa.

## Capacidades

- **Generacion de texto y razonamiento**: mantiene las capacidades del modelo base Gemma 4 31B, incluyendo razonamiento complejo, matematicas y conocimiento general.
- **Vision-language**: al ser un modelo image-text-to-text, puede procesar y comprender imagenes junto con texto.
- **Tool calling / function calling**: no se especifica explicitamente, pero es una capacidad heredada del modelo base Gemma 4 it.
- **Agentes y multi-step reasoning**: no se documenta de forma especifica en la model card.
- **Capacidades multilingues**: no se especifican idiomas concretos, aunque Gemma 4 soporta multiples lenguas.
- **Capacidad especial de descensura**: el modelo esta optimizado para responder a peticiones que el modelo original rechazaria, con una tasa de rechazo reducida del 99% al 10% (evaluado sobre 100 prompts de prueba).
- **Modo thinking**: no se menciona en la informacion disponible.

## Casos de uso

- **Investigacion sobre seguridad y alineacion de modelos**: permite estudiar el comportamiento de modelos descensurados y comparar la evolucion de las capacidades frente al modelo original, especialmente en lo relativo a sesgos y rechazos.
- **Generacion creativa sin restricciones**: escritura de ficcion, narrativa erotica, guiones o contenido creativo que los modelos comerciales rechazan por politicas de contenido.
- **Desarrollo de personajes conversacionales**: construccion de chatbots o asistentes con personalidades mas flexibles y menos "moralizantes" para entornos de rol o entretenimiento.
- **Analisis de contenido controvertido**: procesamiento de textos o preguntas sobre temas delicados (politica, religion, sexualidad) donde el modelo original ofreceria respuestas evasivas o rechazos.
- **Educacion e investigacion academica**: estudio de los efectos de la ablacion de direcciones de activacion en el comportamiento de modelos grandes, con fines academicos.
- **Despliegue local en entornos sin conexion**: al ser un modelo abierto con licencia permisiva, puede ejecutarse en infraestructura propia para aplicaciones donde la privacidad de los prompts sea critica.

## Benchmarks y rendimiento

| Benchmark | Modelo original (gemma-4-31B-it) | Modelo descensurado (este) |
|---|---|---|
| MMLU (accuracy global) | 0,8650 (86,50 %) | 0,8590 (85,90 %) |
| MMLU (parse failures) | 52 | 37 |
| Tasa de rechazo (100 prompts) | 99/100 | 10/100 |
| Divergencia KL | 0 (por definicion) | 0,0541 |

La degradacion en MMLU es de solo 0,6 puntos porcentuales, lo que sugiere que la ablacion apenas afecta al conocimiento general. En la model card se detallan puntuaciones por subconjunto de MMLU; los descensos mas notables se producen en virologia (0,5169 frente al original, aunque no se muestra el dato del original en la informacion disponible), matematicas de secundaria (0,5354) y quimica universitaria (0,5745).

## Requisitos de hardware

- **VRAM estimada**: en cuantizacion Q4_K_M (GGUF), el modelo requiere aproximadamente 20,39 GB de VRAM, segun la pagina llmrun.dev.
- **GPU recomendadas**: GPU con 24 GB de VRAM como la RTX 3090, RTX 4090 o A5000 pueden ejecutar la cuantizacion Q4_K_M. Para precision completa (FP16) se necesitarian al menos 62,6 GB, lo que requiere GPU profesionales como A100 (80 GB) o H100.
- **Consumer GPU**: si, cabe en GPUs de consumo con 24 GB de VRAM usando cuantizacion GGUF (Q4_K_M o inferior).
- **Opciones de despliegue**: llama.cpp, Ollama, vLLM, TGI y cualquier framework compatible con Transformers y GGUF.
- **Latencia y throughput**: no se proporcionan datos especificos de latencia o throughput en la informacion disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | MMLU | Descensurado |
|---|---|---|---|---|---|
| **Este modelo** | 31,3 B | 262.144 | Apache 2.0 | 85,90 % | Si (abliteration) |
| google/gemma-4-31B-it (original) | 31,3 B | 262.144 | Gemma license | 86,50 % | No |
| Llama 3.1 70B (referencia) | 70,6 B | 131.072 | Llama license | ~86 % | No |

La comparativa con Llama 3.1 70B es orientativa: este modelo ofrece un rendimiento similar en MMLU con menos de la mitad de parametros, aunque la comparacion directa no es exacta por diferencias de arquitectura y entrenamiento. La principal diferencia con el original es la tasa de rechazo (10 % frente a 99 %) y una ligera perdida de precision (0,6 puntos en MMLU).

## Limitaciones y advertencias

- **Riesgo de contenido inapropiado**: al reducir los rechazos, el modelo puede generar contenido ofensivo, ilegal o peligroso sin las salvaguardas del modelo original. No se recomienda su uso en produccion sin filtros adicionales.
- **Sesgos y alucinaciones**: no se han evaluado los sesgos especificos de este modelo descensurado; es probable que herede los sesgos del modelo base y que la ablacion afecte a ciertos dominios (se observa una caida notable en virologia y matematicas de secundaria en MMLU).
- **Evaluacion limitada**: solo se proporcionan resultados de MMLU y de tasa de rechazo; no hay datos sobre otros benchmarks (HumanEval, GSM8K, etc.) ni evaluaciones de seguridad.
- **Mantenimiento y soporte**: el modelo es obra de un contribuyente independiente que admite llegar al limite de almacenamiento gratuito de Hugging Face; no hay garantia de actualizaciones o soporte a largo plazo.
- **Riesgo legal**: aunque la licencia es Apache 2.0, el uso de modelos descensurados puede infringir las politicas de uso de las plataformas de despliegue o las leyes locales sobre contenido generado.
- **Sin garantias de calidad**: la divergencia KL de 0,0541 indica una alteracion minima, pero no hay garantia de que el comportamiento sea consistente en todos los dominios.

## Enlaces

- [Modelo en Hugging Face (safetensors)](https://huggingface.co/llmfan46/gemma-4-31B-it-uncensored-heretic)
- [Repo GGUF del mismo modelo](https://huggingface.co/llmfan46/gemma-4-31B-it-uncensored-heretic-GGUF)
- [Repo GGUF variante "Garnet"](https://huggingface.co/llmfan46/Gemma-4-Garnet-31B-it-uncensored-heretic-GGUF)
- [Modelo base original (google/gemma-4-31B-it)](https://huggingface.co/google/gemma-4-31B-it)
- [Herramienta Heretic (repositorio GitHub)](https://github.com/p-e-w/heretic)
- [Pull request con el metodo ARA](https://github.com/p-e-w/heretic/pull/211)
- [Pagina de requisitos de hardware en llmrun.dev](https://llmrun.dev/model/llmfan46-gemma-4-31b-it-uncensored-heretic)
- [Repositorio GitHub de terceros con documentacion](https://github.com/Damacol/llmfan46-gemma-4-31b-it-uncensored-heretic)
- [Pagina de descarga GGUF en local-ai-zone](https://local-ai-zone.github.io/models/gemma-4-31b-it-uncensored-heretic.html)
