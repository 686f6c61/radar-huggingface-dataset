# AhiskaAI/AhiskaAI-Experimental-v0.2-235m-IT

## Resumen

AhıskaAI-Experimental-v0.2-235M-IT es un modelo de lenguaje pequeño (SLM) de aproximadamente 235 millones de parámetros, desarrollado por AhiskaAI, una organización centrada en el procesamiento de lenguaje natural en turco. Se trata de la versión con ajuste por instrucciones (instruction-tuned) del checkpoint experimental base de 235M, y fue concebido originalmente como candidato para la serie estable AhıskaAI v0.4, pero no superó los controles de calidad y se publicó como versión experimental para documentar el proceso y servir de referencia reproducible.

El modelo utiliza una arquitectura Llama (LlamaForCausalLM) con 18 capas, tamaño oculto de 1024 y una ventana de contexto de 2048 tokens. Su entrenamiento se realizó sobre un corpus predominantemente sintético en turco, compuesto por unos 14 GB de datos brutos y aproximadamente 2.800 millones de tokens procesados durante el pre-entrenamiento. Tras identificar problemas de formato y de pipeline en el pre-entrenamiento, se aplicó una etapa de ajuste supervisado (SFT) con datos de instrucciones similares a los usados en la serie v0.3, con el objetivo de estudiar si el SFT podía corregir los comportamientos no deseados aprendidos durante el pre-entrenamiento.

La relevancia de este modelo radica en su carácter experimental: sirve como punto de comparación para estudiar cómo el aumento de capacidad (frente al modelo de 135M) afecta al comportamiento de un SLM entrenado sobre el mismo corpus, y documenta abiertamente las limitaciones encontradas en configuraciones de entrenamiento a pequeña escala. No está destinado a uso productivo, sino a investigación y experimentación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLM (Llama) |
| Parametros totales | 264.049.664 (según safetensors); ~235M declarados por el autor |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | turco (tr) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Llama estándar: 18 capas transformer, tamaño oculto de 1024, tamaño intermedio de 2736, 16 cabezas de atención con 4 cabezas clave/valor, dimensión de cabeza de 64, normalización RMSNorm, activación SiLU y codificación posicional RoPE con theta de 10.000. El vocabulario es de 32.000 tokens y la precisión de entrenamiento fue bfloat16. El peso tying estaba habilitado en la configuración original.

El pre-entrenamiento se realizó sobre una mezcla de datasets sintéticos turcos: BILGE Synthetic Web (~4 GB), BILGE Synthetic Math (~3 GB), BILGE Synthetic Stories (~6 GB) y BILGE Wiki-Tr-Plus (~1 GB), totalizando aproximadamente 14 GB de datos brutos y unos 2.800 millones de tokens procesados. El entrenamiento se ejecutó en un Kaggle TPU v5e-8 durante unas 7,6 horas.

Un hallazgo clave del experimento fue que una parte significativa del corpus de pre-entrenamiento seguía un patrón de formato repetido (`<s>## Title` seguido de texto), lo que provocó que el modelo base tendiera a reproducir estructuras de documento en lugar de responder directamente a las preguntas. El modelo de 235M mostró cierta mejora frente al de 135M en resistir estos patrones, pero no los eliminó por completo. Posteriormente se aplicó una etapa de SFT con datos de instrucciones del mismo tipo que los usados en el proceso v0.3.

## Capacidades

- Generación de texto en turco: puede producir continuaciones de texto y respuestas en turco, aunque con tendencia a reproducir formatos de documento.
- Razonamiento matemático básico: entrenado con datos sintéticos de matemáticas, puede abordar problemas sencillos, pero con fiabilidad limitada.
- Respuesta a preguntas: capacidad de QA en turco, sujeta a las limitaciones del pre-entrenamiento.
- Conversación: el SFT intentó mejorar el comportamiento conversacional, con resultados parciales.
- Seguimiento de instrucciones: limitado; el modelo no alcanza los estándares de la serie principal.
- No soporta tool calling, ni visión, ni audio, ni modos de razonamiento extendido.

## Casos de uso

- Investigación académica sobre SLM: permite estudiar el efecto del SFT en modelos pequeños con arquitectura Llama y corpus sintético, comparando comportamientos entre 135M y 235M.
- Análisis de artefactos de entrenamiento: útil para investigar cómo los patrones repetitivos en los datos de pre-entrenamiento afectan a la generación y qué puede corregir el SFT.
- Desarrollo de pipelines de ajuste fino: sirve como banco de pruebas para experimentar con datos de instrucciones en turco y evaluar técnicas de mitigación de sesgos de formato.
- Evaluación de métricas de calidad en modelos pequeños: permite contrastar resultados con otros SLM experimentales del mismo autor.
- Documentación de fallos: como referencia reproducible para evitar errores de configuración y formato en futuros entrenamientos.
- Educación en PLN: adecuado para demostrar conceptos de arquitectura transformer y ajuste por instrucciones en un entorno de bajo coste computacional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica que el modelo no alcanzó los requisitos de calidad de la serie principal, pero no proporciona métricas cuantitativas (MMLU, HumanEval, etc.).

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo de ~264M parámetros en bfloat16, el peso ocupa aproximadamente 0,5 GB. Con overhead de activaciones y KV cache (contexto 2048), se puede ejecutar con menos de 2 GB de VRAM.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3050, o incluso integradas con soporte CUDA). También es viable en CPU con 4-8 GB de RAM.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU moderna de consumo.
- Opciones de despliegue: al ser un modelo Llama estándar, puede ejecutarse con transformers, llama.cpp (si se convierte a GGUF), Ollama (si se cuantiza) o vLLM para inferencia de baja latencia.
- Latencia y throughput: no disponible, pero por su tamaño se espera una generación rápida incluso en CPU (del orden de decenas de tokens por segundo en GPU).

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni comparativas publicadas con otros modelos. Como referencia interna, el autor señala que el modelo de 235M se comporta algo mejor que el modelo experimental de 135M (AhiskaAI-Experimental-v0.1-135M) frente a los patrones de formato dominantes, pero no alcanza la calidad de la serie estable v0.3. No se han encontrado comparaciones con SLM turcos de terceros.

## Limitaciones y advertencias

- Modelo experimental: no cumple los estándares de calidad de la serie principal AhıskaAI v0.x y no debe usarse en producción.
- Artefactos de formato: tendencia a generar respuestas con estructura de documento (`<s>## Título`) en lugar de responder directamente, especialmente con prompts simples.
- Alucinaciones: al ser un SLM entrenado con datos sintéticos, es probable que genere información incorrecta o inventada.
- Cobertura lingüística limitada: solo turco; no soporta otros idiomas.
- Contexto corto: 2048 tokens, insuficiente para tareas que requieran contexto largo.
- Sin garantías de seguridad: no se mencionan evaluaciones de sesgos ni alineación; el SFT no incluyó técnicas como RLHF o DPO.
- Licencia Apache 2.0: permite uso comercial, pero el autor desaconseja su uso en entornos reales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AhiskaAI/AhiskaAI-Experimental-v0.2-235m-IT
- Colección de datasets v0.2: https://huggingface.co/collections/AhiskaAI/ahiskaai-v02-dataset
- Perfil de AhiskaAI en Hugging Face: https://huggingface.co/AhiskaAI
- Organización en GitHub: https://github.com/AhiskaAI
- Repositorio de código de entrenamiento experimental v0.1: https://github.com/AhiskaAI/AhiskaAI-v0.1-Experimental-Training-code/tree/main
- Dataset BILGE Synthetic Web: https://huggingface.co/datasets/BILGEM-AI/BILGE-Synthetic-Web
- Dataset BILGE Synthetic Math: https://huggingface.co/datasets/BILGEM-AI/BILGE-Synthetic-Math
- Dataset BILGE Synthetic Stories: https://huggingface.co/datasets/BILGEM-AI/BILGE-Synthetic-Stories
- Dataset BILGE Wiki-Tr-Plus: https://huggingface.co/datasets/BILGEM-AI/BILGE-Wiki-Tr-Plus
