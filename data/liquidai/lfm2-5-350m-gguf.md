# LiquidAI/LFM2.5-350M-GGUF

## Resumen

LFM2.5-350M es un modelo de lenguaje de 354.483.968 parámetros desarrollado por Liquid AI, diseñado específicamente para despliegue en el borde (edge AI) y en dispositivo. Forma parte de la generación LFM2.5 de modelos híbridos de la compañía, que busca un equilibrio entre calidad, velocidad y eficiencia de memoria en entornos con recursos limitados. Esta ficha corresponde al repositorio GGUF, orientado a inferencia con llama.cpp y compatible con endpoints.

El modelo es la versión cuantizada y publicada en formato GGUF del checkpoint base LiquidAI/LFM2.5-350M, e incluye además una variante entrenada con Quantization-Aware Distillation (QAD) en Q4_0, así como los pesos fuente FP32 de dicha variante en safetensors. Soporta ocho idiomas (inglés, árabe, chino, francés, alemán, japonés, coreano y español) y se distribuye bajo licencia LFM1.0.

Su relevancia actual radica en la combinación de un tamaño muy reducido (350M) con soporte multilingüe amplio, formato GGUF listo para llama.cpp y variantes QAD que buscan preservar la calidad tras la cuantización. Con más de 214.000 descargas, es una opción práctica para prototipos, aplicaciones locales y entornos sin GPU dedicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida (LFM2; no se detalla la composición exacta en la información disponible) |
| Parametros totales | 354.483.968 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q4_0 (post-training) y QAD Q4_0; pesos fuente FP32 en safetensors |
| Idiomas soportados | en, ar, zh, fr, de, ja, ko, es |
| Licencia | lfm1.0 (other) |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento

LFM2.5-350M se presenta como un modelo de la familia LFM2 de tipo híbrido, desarrollada por Liquid AI para edge AI. La model card del repositorio GGUF no detalla la composición interna de la arquitectura (proporción de capas de atención, convolucionales o de estado), ni el volumen de tokens de entrenamiento, la composición del dataset o si se aplicaron fases de RLHF o DPO. Esos datos no están disponibles en la información proporcionada.

La innovación técnica destacable es la inclusión de un checkpoint entrenado con Quantization-Aware Distillation (QAD), distinto del Q4_0 obtenido por cuantización post-entrenamiento. Ambos usan el formato GGUF Q4_0, pero el QAD busca preservar mejor la calidad del modelo original bajo cuantización agresiva. Los resultados publicados de QAD se refieren específicamente al GGUF Q4_0; la inferencia directa en FP32/BF16 u otros formatos de cuantización puede comportarse de forma distinta. El repositorio también publica los pesos fuente FP32 de la variante QAD en la subcarpeta `qad/`, pensados para fine-tuning y experimentación, con su propia configuración, tokenizador, valores por defecto de generación y plantilla de chat.

## Capacidades

- Generación de texto conversacional multi-turno, con plantilla de chat propia.
- Razonamiento y respuesta a preguntas generales en ocho idiomas.
- Capacidades multilingües en inglés, árabe, chino, francés, alemán, japonés, coreano y español.
- Inferencia optimizada para dispositivo con llama.cpp, incluyendo ejecución local sin GPU.
- Soporte de cuantización QAD para mantener calidad en Q4_0.
- Pesos fuente QAD en FP32 para fine-tuning y ajuste posterior.
- No se documentan en la información disponible capacidades de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Asistentes conversacionales en local: el modelo puede mantener diálogos multi-turno en el dispositivo con llama.cpp, usando `--conversation` y la plantilla de chat incluida, sin depender de servicios en la nube.
- Aplicaciones móviles y de escritorio con IA embebida: su tamaño de 350M y el formato GGUF Q4_0 permiten integrarlo en apps de escritorio o dispositivos de recursos limitados con un consumo de memoria reducido.
- Prototipado rápido de chatbots multilingües: cubre ocho idiomas, lo que facilita validar experiencias de atención al usuario en varios mercados antes de escalar a modelos mayores.
- Generación de texto en entornos sin GPU: al ejecutarse con llama.cpp sobre CPU, sirve para procesamiento por lotes de textos, resúmenes o clasificación en servidores sin acelerador.
- Base para fine-tuning específico de dominio: la subcarpeta `qad/` ofrece pesos FP32 con tokenizador y plantilla, útiles para ajustar el modelo a tareas concretas y luego volver a cuantizar.
- Evaluación y benchmarking de modelos híbridos en el borde: útil para investigadores que comparan arquitecturas híbridas frente a transformers convencionales en latencia y memoria.
- Filtrado y moderación de contenido local: por su bajo coste de inferencia, puede desplegarse como primera capa de clasificación o generación de respuestas controladas en pipelines on-device.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia en Q4_0: en torno a 200-300 MB para los pesos del modelo, más la memoria del contexto y del runtime de llama.cpp (estimación a partir del tamaño de 350M parámetros; no confirmada por el autor).
- Pesos fuente FP32 en `qad/`: aproximadamente 1,4 GB solo para los parámetros (estimación a partir del recuento de parámetros; no confirmada).
- GPU recomendadas: no disponibles de forma explícita; por tamaño, el modelo está pensado para CPU y para GPUs de consumo.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU con 2 GB o más de VRAM; también en CPU.
- Opciones de despliegue: llama.cpp (`llama-cli -hf LiquidAI/LFM2.5-350M-GGUF`), Hugging Face Transformers cargando la subcarpeta `qad` con `subfolder="qad"`, y endpoints compatibles (tag `endpoints_compatible`).
- Parámetros de generación sugeridos por el autor: `--temp 0.1 --top-k 50 --repeat-penalty 1.05`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| LFM2.5-350M-GGUF | 354M | no disponible | 8 | lfm1.0 | safetensors, GGUF |
| LFM2.5-350M (base) | 354M | no disponible | 8 | lfm1.0 | safetensors |
| Alternativas de ~350M de otros autores | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos de benchmarks ni de especificaciones de modelos competidores equivalentes para establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; cabe esperar los sesgos inherentes a los datos de entrenamiento, no publicados.
- Riesgo de alucinación: presente como en cualquier modelo de lenguaje; su tamaño reducido (350M) aumenta la probabilidad de errores factuales frente a modelos mayores.
- Longitud de contexto: no disponible, lo que impide planificar casos de uso con ventanas largas sin validación previa.
- Idiomas: aunque declara ocho idiomas, no se publican métricas por idioma; el rendimiento puede ser desigual entre ellos.
- Licencia lfm1.0: es una licencia "other"; antes de un uso comercial es necesario revisar el archivo LICENSE del repositorio para conocer restricciones concretas.
- Cuantización: los resultados QAD publicados aplican solo al GGUF Q4_0; FP32/BF16 y otros formatos pueden diferir.
- Producción: al no haber benchmarks ni datos de contexto publicados, conviene validar calidad y latencia en el caso de uso concreto antes de desplegar.

## Enlaces

- Repositorio GGUF: https://huggingface.co/LiquidAI/LFM2.5-350M-GGUF
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-350M
- Pesos QAD en FP32: https://huggingface.co/LiquidAI/LFM2.5-350M-GGUF/tree/main/qad
- Documentación de la variante QAD: https://huggingface.co/LiquidAI/LFM2.5-350M-GGUF/blob/main/qad/README.md
- Licencia: https://huggingface.co/LiquidAI/LFM2.5-350M-GGUF/blob/main/LICENSE
- Playground: https://playground.liquid.ai/
- Documentación de Liquid AI: https://docs.liquid.ai/lfm/getting-started/welcome
- Plataforma LEAP: https://leap.liquid.ai/
- Discord de Liquid AI: https://discord.com/invite/liquid-ai
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Web de Liquid AI: https://www.liquid.ai/
