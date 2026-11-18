# DAINOO/siance-1.4-medium

## Resumen

Siance-1.4 (medium) es un modelo de lenguaje de aproximadamente 125 millones de parámetros desarrollado por DAINOO, publicado en Hugging Face el 18 de noviembre de 2026. Se trata de un modelo de tipo LoRA (adaptador de bajo rango) orientado al castellano y al inglés, entrenado mediante ajuste supervisado (SFT) sobre datos sintéticos organizados por módulos temáticos: memoria, matemáticas, base de conocimiento (KB), consulta de fuentes oficiales, identidad y conversación general. El repositorio ocupa 0,8 GB.

El modelo está pensado para tareas de chat ligero y razonamiento básico con recuperación simulada de información, no para aplicaciones de alta exigencia computacional. Su relevancia principal radica en ser un ejemplo de adaptación de bajo coste sobre un modelo base pequeño, con pesos en fp16 destinados a un entorno de chat web (`siance_web`) y un `tokenizer.json` incluido. La model card no especifica el modelo base sobre el que se aplica el adaptador LoRA.

La información pública disponible es muy escasa: no se detallan arquitectura del modelo base, número de tokens de entrenamiento, composición exacta del dataset sintético ni resultados de benchmarks. El propio autor advierte que, por su tamaño reducido, el modelo puede equivocarse o inventar información, y que su examen interno emplea recuperación simulada en lugar de herramientas reales. La licencia figura como "other", sin condiciones concretas publicadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (adaptador LoRA sobre modelo base no especificado) |
| Parametros totales | ~125 millones (modelo resultante) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en fp16) |
| Idiomas soportados | es, en |
| Licencia | other (condiciones no especificadas) |
| Formato de pesos | fp16 (uso previsto en chat web `siance_web`) + `tokenizer.json` |

## Arquitectura y entrenamiento

La model card indica únicamente que se trata de un modelo de aproximadamente 125 millones de parámetros obtenido mediante SFT (ajuste supervisado) sobre datos sintéticos estructurados por piezas temáticas: memoria, matemáticas, base de conocimiento, fuentes oficiales, identidad y charla. El tag `lora` sugiere que el artefacto publicado es un adaptador de bajo rango aplicado sobre un modelo base, aunque no se especifica cuál es ese modelo base, ni su arquitectura interna (transformer, MoE, SSM o híbrida), ni el número de tokens de entrenamiento, ni la composición detallada del dataset sintético.

No se documenta el uso de RLHF, DPO ni otras técnicas de alineación posteriores al SFT, ni innovaciones técnicas como decodificación especulativa o atención lineal. El examen interno del autor emplea "herramientas simuladas" con recuperación simulada, lo que indica que el entrenamiento incluye algún formato de uso de herramientas, pero sin acceso a herramientas reales durante la evaluación. La fecha de entrenamiento declarada es el 18 de noviembre de 2026.

## Capacidades

- Generación de texto y conversación general en castellano e inglés (etiquetas `es`, `en`).
- Razonamiento matemático básico, según el módulo "mates" mencionado en la receta de entrenamiento.
- Consulta de una base de conocimiento (KB) y de fuentes oficiales, con recuperación simulada durante el examen interno.
- Memoria conversacional, según el módulo "memoria" de la receta de entrenamiento.
- Identidad y charla general, según los módulos "identidad" y "charla".
- Uso de herramientas simuladas en el formato de examen del autor (no se documenta tool calling real ni function calling en producción).
- Capacidades de agente multi-paso: no disponibles.
- Capacidades de visión, audio o modo "thinking": no disponibles.

## Casos de uso

- Chat web ligero en castellano: el modelo se publica con pesos fp16 pensados para `siance_web`, por lo que puede integrarse en un front-end de chat de navegador para conversación general en español e inglés sin infraestructura GPU dedicada.
- Asistente de consulta de base de conocimiento: el módulo KB de la receta permite responder preguntas sobre un corpus acotado, adecuado para demos de recuperación de información en entornos controlados.
- Prácticas de matemáticas básicas: el módulo "mates" lo hace útil para ejercicios escolares simples y verificación de operaciones aritméticas elementales.
- Experimentación con adaptadores LoRA: al ser un adaptador de bajo rango sobre un modelo pequeño, sirve como caso de estudio para investigar SFT sobre datos sintéticos por módulos temáticos.
- Prototipos de atención al cliente de bajo coste: con ~125 M de parámetros, puede desplegarse en CPU o GPU consumer para demos internas de conversación multi-turno, siempre con validación humana.
- Evaluación de pipelines de examen held-out: el formato de examen con herramientas simuladas del autor puede reutilizarse como plantilla para medir modelos pequeños en tareas de recuperación y identidad.
- Filtrado y clasificación de texto en español e inglés: un modelo de este tamaño puede usarse para tareas auxiliares de etiquetado o reformulación, aunque no se documenta un entrenamiento específico para ello.

## Benchmarks y rendimiento

La model card incluye una tabla de examen held-out propio con herramientas simuladas, pero todos los valores figuran como "sin datos":

| Modelo | Resultado |
|---|---|
| Siance-1.3 (baseline) | sin datos |
| Siance-1.4 medium | sin datos |

Además, el autor indica que "aún sin resultados de la batería externa para esta receta". No se han publicado resultados de benchmarks externos (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con ~125 M de parámetros en fp16, el peso ronda los 0,25 GB; en fp32, unos 0,5 GB. La VRAM real depende del modelo base sobre el que se aplica el LoRA, que no se especifica.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es suficiente; también tarjetas de gama baja y GPUs de datacenter (A100, H100) sobran para este tamaño.
- Cabe en GPU consumer: sí, con holgura, incluso en GPUs con 4-8 GB de VRAM.
- Opciones de despliegue: llama.cpp, Ollama, vLLM o TGI son viables para un modelo de este tamaño, siempre que se disponga del modelo base completo junto al adaptador LoRA; el repo publica fp16 para el chat web `siance_web` y `tokenizer.json`.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Siance-1.4 medium | ~125 M | no disponible | sin datos publicados | other | Hugging Face (DAINOO) |
| Alternativas de ~125 M (p. ej., GPT-2 small, distilgpt2) | ~117-124 M | 1024 tokens (GPT-2) | benchmarks públicos amplios | MIT / Apache-2.0 según variante | Hugging Face |
| Alternativas de ~135 M (p. ej., SmolLM-135M) | ~135 M | 2048 tokens | benchmarks publicados por el autor | Apache-2.0 | Hugging Face |

No se dispone de datos de rendimiento de Siance-1.4 que permitan una comparación cuantitativa directa; la comparativa se limita a tamaño, contexto y licencia. Los modelos de referencia citados son alternativas de tamaño similar ampliamente disponibles, pero sus cifras de rendimiento no se reproducen aquí por no formar parte de la información proporcionada.

## Limitaciones y advertencias

- Modelo pequeño (~125 M de parámetros): el propio autor advierte que puede equivocarse o inventar información; riesgo de alucinación elevado en tareas de conocimiento factual.
- El examen interno usa recuperación simulada y herramientas simuladas, por lo que los resultados no reflejan el comportamiento con herramientas reales ni con recuperación real.
- No se especifica el modelo base del adaptador LoRA, lo que dificulta reproducir el entrenamiento y evaluar sesgos heredados.
- Idiomas limitados a español e inglés; no se documenta soporte multilingüe adicional.
- Licencia "other" sin condiciones publicadas: es imprescindible contactar al autor antes de cualquier uso comercial.
- No hay resultados de benchmarks externos ni de la batería externa, por lo que no se puede verificar su calidad frente a alternativas.
- Longitud de contexto no documentada: no apto para tareas que requieran ventanas largas sin verificación previa.
- Sin datos sobre sesgos conocidos, robustez ante prompts adversarios ni comportamiento en producción.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ausencia de validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/DAINOO/siance-1.4-medium
- No se han encontrado papers, blogs, repositorios de código ni demos adicionales en la búsqueda web.
