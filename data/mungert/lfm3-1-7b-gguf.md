# Mungert/LFM3-1.7B-GGUF

## Resumen

LFM3-1.7B es un modelo de lenguaje de 1,73 mil millones de parámetros desarrollado por Liquid AI, distribuido originalmente en Hugging Face como `LiquidAI/LFM3-1.7B` y empaquetado en formato GGUF por el usuario Mungert bajo el identificador `Mungert/LFM3-1.7B-GGUF`. Está diseñado específicamente para ejecutarse en el borde (edge computing): según su model card, en cuantización de 4 bits ocupa aproximadamente 1 GB de memoria, lo que permite desplegarlo en teléfonos y portátiles convencionales. Es un modelo solo de texto, post-entrenado para tareas de agente local.

La arquitectura es una innovación propia de Liquid AI denominada "tri-hybrid": 24 capas que combinan 13 convoluciones cortas con compuertas (gated short convolutions), 5 capas de atención de ventana deslizante y 6 capas de atención global. Esta mezcla busca reducir el coste computacional de la atención tradicional manteniendo capacidad de modelado de contexto largo.

El modelo resulta relevante porque ofrece una ventana de contexto de 256K tokens en un tamaño muy reducido, con entrenamiento orientado a agentes (Hermes Agent, Pi, OpenClaw) y soporte para 16 idiomas, incluido el español. La versión GGUF facilita su despliegue con llama.cpp, Ollama y otras herramientas de inferencia local, lo que lo convierte en candidato para aplicaciones de agente en dispositivos con recursos limitados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Tri-hybrid: 24 capas (13 gated short convolutions, 5 sliding-window attention, 6 global attention) |
| Parámetros totales | 1.728.801.600 (1,73B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 256.000 tokens |
| Tipos de cuantización | GGUF (generado con llama.cpp, commit ca89968a2); niveles concretos no disponibles en la información |
| Idiomas soportados | en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl (16 idiomas) |
| Licencia | lfm1.0 (licencia propia de Liquid AI, marcada como "other") |
| Formato de pesos | GGUF (repo de 48,0 GB con múltiples cuantizaciones); pesos originales del base model en safetensors |

## Arquitectura y entrenamiento

LFM3-1.7B emplea una arquitectura híbrida de 24 capas que alterna tres tipos de bloques: 13 capas de convolución corta con compuertas, 5 capas de atención de ventana deslizante y 6 capas de atención global. Este diseño "tri-hybrid" reduce el coste cuadrático de la atención en la mayor parte de la red, reservando la atención global completa para un subconjunto de capas, lo que permite sostener un contexto de 256K tokens con un coste de memoria y cómputo contenido para un modelo de 1,73B de parámetros.

El checkpoint distribuido es un modelo post-entrenado (post-trained) solo de texto, construido sobre `LiquidAI/LFM3-1.7B-Base`. Según la model card, ha sido post-entrenado para "agentic harnesses" como Hermes Agent, Pi y OpenClaw, lo que implica ajuste orientado a uso de herramientas y razonamiento multi-paso. No se detalla en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas concretas de RLHF o DPO. La versión GGUF fue generada con llama.cpp en el commit `ca89968a2`.

## Capacidades

- Generación de texto conversacional y completado de texto (pipeline `text-generation`).
- Entrenamiento orientado a agentes: post-entrenado para harnesses agénticos como Hermes Agent, Pi y OpenClaw.
- Razonamiento multi-paso en el contexto de flujos agénticos, según la orientación declarada del post-entrenamiento.
- Manejo de contexto largo: ventana de 256K tokens, adecuada para documentos extensos y conversaciones multi-turno prolongadas.
- Capacidades multilingües en 16 idiomas: inglés, árabe, chino, francés, alemán, italiano, japonés, coreano, portugués, español, vietnamita, tailandés, indonesio, hindi, ruso y polaco.
- Especialización mediante fine-tuning: la model card indica que puede adaptarse a dominios, formatos y herramientas concretos con fine-tuning rápido en una sola GPU.
- Soporte de tool calling / function calling: no se detalla explícitamente en la información disponible, aunque el entrenamiento para harnesses agénticos sugiere compatibilidad; conviene verificar en la documentación oficial.

## Casos de uso

- Agentes locales en dispositivos móviles: con ~1 GB de memoria en 4 bits, el modelo puede ejecutar bucles de agente (planificación, llamada a herramientas, resumen) directamente en un teléfono o portátil sin conexión a la nube.
- Asistentes conversacionales embebidos: su ventana de 256K tokens permite mantener historiales de conversación muy largos y recuperar contexto de documentos extensos sin truncamiento agresivo.
- Procesamiento de documentos largos en el borde: resumen, extracción de entidades y respuesta a preguntas sobre contratos, informes o transcripciones que superen las decenas de miles de tokens, ejecutándose en hardware de consumo.
- Automatización de flujos con herramientas: al estar post-entrenado para harnesses agénticos, puede integrarse en pipelines que requieran invocar APIs, ejecutar comandos o encadenar pasos de razonamiento en entornos de escritorio.
- Atención al cliente multilingüe: con soporte para 16 idiomas, incluido el español, puede gestionar conversaciones multi-turno en centros de contacto con requisitos de privacidad (inferencia local, sin envío de datos a terceros).
- Prototipado rápido y experimentación: el formato GGUF y su reducido tamaño permiten iterar con llama.cpp u Ollama en estaciones de trabajo sin GPU dedicada, evaluando comportamientos agénticos antes de escalar a modelos mayores.
- Fine-tuning de dominio en una sola GPU: la model card destaca la adaptación rápida a dominios y formatos específicos, útil para verticales como legal, sanitario o soporte técnico interno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1 GB en cuantización de 4 bits según la model card; las cuantizaciones de 8 bits y superiores requerirán más memoria (el repo completo ocupa 48,0 GB por incluir múltiples variantes).
- GPU recomendadas: no se especifican en la información disponible; por tamaño, el modelo es apto para GPUs de consumo como RTX 3060, RTX 4060, RTX 4090, así como para Apple Silicon y CPUs modernas.
- Compatibilidad con GPU de consumo: sí, en 4 bits cabe holgadamente en cualquier GPU con 4 GB o más de VRAM, y también en teléfonos y portátiles según el fabricante.
- Opciones de despliegue: llama.cpp (herramienta con la que se generaron los GGUF), Ollama, y cualquier runtime compatible con GGUF; el repo está marcado como `endpoints_compatible` y la librería declarada es transformers.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| LFM3-1.7B (este) | 1,73B | 256K | lfm1.0 | GGUF / safetensors | Arquitectura tri-hybrid, post-entrenado para agentes |
| Alternativas de ~1-2B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

No se dispone de información suficiente en la documentación facilitada para establecer una comparativa rigurosa con modelos alternativos de la misma categoría (tamaño ~1-2B orientados a edge). Se recomienda consultar el blog de lanzamiento de Liquid AI y la colección LFM3 en Hugging Face para obtener datos comparativos oficiales.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan en la información disponible; como todo modelo entrenado con datos web, es previsible que herede sesgos de sus datos de entrenamiento.
- Riesgo de alucinación: inherente a los modelos de lenguaje de este tamaño; su reducida capacidad (1,73B) puede aumentar la tasa de errores factuales en tareas de conocimiento intensivo.
- Limitaciones de contexto: aunque la ventana es de 256K tokens, la calidad de recuperación en posiciones muy lejanas del contexto no está validada en la información disponible.
- Limitaciones de idioma: aunque declara 16 idiomas, el rendimiento relativo por idioma no se detalla; el español está soportado pero sin métricas publicadas.
- Restricciones de licencia: la licencia `lfm1.0` es propia de Liquid AI y está marcada como "other"; es imprescindible revisar el archivo LICENSE antes de cualquier uso comercial, ya que puede imponer condiciones específicas.
- Caveat de producción: el modelo es solo de texto (no visión ni audio en este checkpoint); para capacidades multimodales habría que acudir a otras variantes de la familia LFM3.
- El repo GGUF es una conversión de terceros (Mungert), no oficial de Liquid AI; conviene validar la fidelidad de las cuantizaciones frente a los pesos originales.

## Enlaces

- Repositorio GGUF: https://huggingface.co/Mungert/LFM3-1.7B-GGUF
- Modelo base original: https://huggingface.co/LiquidAI/LFM3-1.7B-Base
- Modelo post-entrenado de referencia: https://huggingface.co/LiquidAI/LFM3-1.7B
- Colección LFM3: https://huggingface.co/collections/LiquidAI/lfm3
- Blog de lanzamiento: https://www.liquid.ai/blog/lfm3
- Documentación: https://docs.liquid.ai/lfm/getting-started/welcome
- Playground: https://playground.liquid.ai/
- Consola/API: https://console.liquid.ai/dashboard
- llama.cpp (commit usado): https://github.com/ggerganov/llama.cpp/commit/ca89968a23a13e571a6b802a9891d22763153b61
- Guía de selección de formato GGUF del autor: https://readyforquantum.com/huggingface_gguf_selection_guide.html
