# nwtgck/LFM2.5-230M-GGUF

## Resumen

LFM2.5-230M-GGUF es una cuantización en formato GGUF del modelo LiquidAI/LFM2.5-230M, publicada por el usuario nwtgck, no por el equipo de Liquid AI. Se trata de un modelo de generación de texto de 229.693.184 parámetros (aproximadamente 230 millones), perteneciente a la familia LFM2.5 de Liquid AI, descrita por su autor como una generación de modelos híbridos orientados a inteligencia artificial en el borde (edge AI) y despliegue en dispositivo.

El problema que resuelve es la ejecución local de un modelo conversacional en hardware muy limitado: al estar en GGUF, se puede cargar con llama.cpp y ejecutar en CPU, sin GPU y con un consumo de memoria del orden de cientos de megabytes o menos según la cuantización. Es relevante ahora porque permite integrar generación de texto multilingüe en entornos sin conectividad, con latencia baja y sin coste de API.

Al ser un modelo de 230 millones de parámetros, su utilidad está en tareas acotadas (clasificación, extracción, resumen corto, autocompletado ligero), no en razonamiento complejo. La ficha del repositorio no detalla la longitud de contexto ni los datos de entrenamiento, por lo que esos apartados se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida (familia LFM2.5, descrita por el autor como "hybrid model"); el detalle de capas no se especifica en la informacion disponible |
| Parametros totales | 229.693.184 (aproximadamente 230 M) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q4_0 post-entrenamiento y GGUF Q4_0 obtenido por QAD (Quantization-Aware Distillation); no se documentan otros niveles en la informacion disponible |
| Idiomas soportados | en, ar, zh, fr, de, ja, ko, es, pt, it (10 idiomas declarados) |
| Licencia | lfm1.0 (Liquid AI LFM Open License v1.0), etiquetada como "other" en HuggingFace |
| Formato de pesos | GGUF (llama.cpp); el modelo base original esta en safetensors |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Modelo base | LiquidAI/LFM2.5-230M |
| Tamano del repositorio | 2,0 GB (incluye varios ficheros GGUF) |
| Pipeline | text-generation |
| Descargas / likes | 0 descargas, 1 like en el momento de la consulta |

## Arquitectura y entrenamiento

Liquid AI describe LFM2.5 como una generación de modelos híbridos diseñados específicamente para edge AI y despliegue on-device, con foco en calidad, velocidad y eficiencia de memoria. La model card de esta cuantización no detalla la composición concreta de capas (proporción de atención frente a otros mecanismos), el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO. Toda esa información se considera no disponible en el material consultado.

La particularidad técnica documentada en este repositorio es la existencia de dos ficheros Q4_0: uno cuantizado a posteriori (post-training quantization) y otro generado mediante QAD (Quantization-Aware Distillation), un proceso en el que el modelo se adapta durante el entrenamiento o la destilación a la cuantización objetivo para reducir la pérdida de calidad. El autor indica que ambos usan el mismo formato GGUF Q4_0, pero proceden de checkpoints distintos.

## Capacidades

- Generación de texto conversacional: el repositorio está etiquetado como "conversational" y la model card muestra un ejemplo con plantilla de conversación en llama.cpp.
- Soporte multilingüe declarado para 10 idiomas: inglés, árabe, chino, francés, alemán, japonés, coreano, español, portugués e italiano.
- Ejecución local en CPU mediante llama.cpp, sin necesidad de GPU.
- Dos variantes de cuantización Q4_0 (post-entrenamiento y QAD) que permiten elegir entre fidelidad y tamaño.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo "thinking", visión, audio u otras capacidades especiales: no disponible en la información proporcionada (el pipeline declarado es únicamente text-generation).

## Casos de uso

- Asistentes conversacionales sin conexión: al ejecutarse con llama.cpp en CPU, el modelo puede gestionar diálogos multi-turno en aplicaciones de escritorio o móviles donde no hay acceso a red ni presupuesto para APIs en la nube.
- Clasificación y enrutado de intenciones: con 230 M de parámetros y cuantización Q4_0, es viable etiquetar consultas de usuario en un pipeline de atención al cliente para decidir a qué servicio derivarlas.
- Extracción de información estructurada: conversión de texto libre en campos concretos (fechas, importes, entidades) en procesos de digitalización de documentos, donde el coste por inferencia es prácticamente nulo.
- Resumen de textos cortos: síntesis de correos, tickets o incidencias de poca extensión en flujos de trabajo internos.
- Traducción asistida entre los 10 idiomas declarados: útil para pre-traducción o normalización de texto antes de un sistema mayor, siempre con revisión humana por el tamaño del modelo.
- Autocompletado y generación de fragmentos de código simples: integración en editores o scripts locales como ayuda de baja latencia, no como sustituto de un modelo de código grande.
- Prototipado y validación de pipelines GGUF: sirve como modelo de pruebas para verificar integraciones con llama.cpp, Ollama o llama-cpp-python antes de desplegar modelos mayores.
- Sistemas embebidos y robótica ligera: al caber en memoria reducida, puede dar respuestas textuales breves en dispositivos con recursos restringidos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye cifras de MMLU, HumanEval, GSM8K ni de ninguna otra evaluación, y la búsqueda web realizada no aportó resultados relevantes sobre este modelo.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia (cálculo propio a partir del número de parámetros, no dato publicado): aproximadamente 0,46 GB en FP16 y en torno a 0,13-0,15 GB en Q4_0, más el overhead del contexto y del runtime.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM es suficiente; no se requiere A100 ni H100. Funciona también en iGPU modernas.
- Compatibilidad con GPU de consumo: sí, cabe holgadamente en cualquier RTX de la familia 20/30/40, en GTX antiguas y en aceleradores integrados.
- Ejecución sin GPU: sí, es uno de los escenarios principales; llama.cpp permite correr el modelo en CPU y en placas tipo Raspberry Pi.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), llama-cpp-python, LM Studio, interfaces compatibles con GGUF. Los servidores que requieren safetensors (vLLM, TGI) no cargan GGUF directamente; para ellos habría que usar el modelo base LiquidAI/LFM2.5-230M.
- Latencia y throughput: no disponible. Dependerá del hardware, del tamaño de contexto y del backend utilizado.

## Comparativa con modelos similares

Los datos de los modelos comparados proceden de la documentación pública de cada proyecto y deben verificarse antes de tomar decisiones de producción; los del modelo de esta ficha proceden del repositorio consultado.

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| nwtgck/LFM2.5-230M-GGUF (esta ficha) | 229,7 M | no disponible | lfm1.0 | GGUF |
| LiquidAI/LFM2.5-230M (base) | 229,7 M | no disponible | lfm1.0 | safetensors |
| SmolLM2-360M-Instruct (HuggingFace) | 362 M | 8.192 tokens | Apache 2.0 | safetensors, GGUF |
| Qwen2.5-0.5B-Instruct (Alibaba) | 494 M | 32.768 tokens | Apache 2.0 (la mayoría de variantes) | safetensors, GGUF |
| Gemma 3 270M (Google) | 268 M | 32.768 tokens | Gemma Terms of Use | safetensors, GGUF |

Diferencias clave: frente a SmolLM2 y Qwen2.5, la licencia lfm1.0 es una licencia propia de Liquid AI (no OSI), lo que exige revisar condiciones antes de un uso comercial. En tamaño, es el más pequeño del grupo junto con Gemma 3 270M, lo que se traduce en menor capacidad de razonamiento pero también en el menor consumo de memoria.

## Limitaciones y advertencias

- Tamaño muy reducido: con 230 M de parámetros, la coherencia en cadenas largas de razonamiento, matemáticas y generación de código complejo es limitada; es esperable que falle en tareas que requieran varios pasos.
- Riesgo de alucinación elevado: al ser un modelo pequeño, tiende a inventar datos factuales, especialmente en preguntas abiertas sobre conocimiento del mundo.
- Calidad tras cuantización: la variante Q4_0 introduce degradación respecto al modelo en precisión completa; la versión QAD está pensada para mitigarla, pero se desconoce la magnitud de la diferencia al no haber cifras publicadas.
- Contexto desconocido: al no documentarse la longitud de contexto, no se puede garantizar el comportamiento en conversaciones largas ni en tareas de contexto extenso.
- Idiomas: aunque se declaran 10 idiomas, no hay evaluación pública del rendimiento por idioma; es previsible una calidad desigual, con mejores resultados en inglés.
- Licencia: lfm1.0 es una licencia personalizada de Liquid AI, no una licencia de código abierto aprobada por OSI. Las condiciones exactas (uso comercial, atribución, restricciones) no se incluyen en la información disponible y deben consultarse en el fichero LICENSE y en los términos de Liquid AI.
- Repositorio de terceros: esta cuantización la publica el usuario nwtgck, no Liquid AI. Ante cualquier duda de integridad o de soporte, conviene usar el repositorio oficial LiquidAI/LFM2.5-230M-GGUF como referencia.
- Búsqueda web sin resultados relevantes: las consultas realizadas devolvieron únicamente páginas de turismo sin relación con el modelo, por lo que no se ha podido contrastar información adicional sobre benchmarks, contexto o datos de entrenamiento.

## Enlaces

- Repositorio de esta cuantización: https://huggingface.co/nwtgck/LFM2.5-230M-GGUF
- Modelo base original: https://huggingface.co/LiquidAI/LFM2.5-230M
- Repositorio GGUF oficial de Liquid AI: https://huggingface.co/LiquidAI/LFM2.5-230M-GGUF
- Fichero QAD Q4_0: https://huggingface.co/LiquidAI/LFM2.5-230M-GGUF/blob/main/LFM2.5-230M-QAD-Q4_0.gguf
- Licencia del modelo: LICENSE (en el repositorio de HuggingFace)
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Playground de Liquid AI: https://playground.liquid.ai/
- Documentación de LFM: https://docs.liquid.ai/lfm/getting-started/welcome
- LEAP (plataforma de Liquid AI): https://leap.liquid.ai/
- Discord de Liquid AI: https://discord.com/invite/liquid-ai
- Web de Liquid AI: https://www.liquid.ai/
