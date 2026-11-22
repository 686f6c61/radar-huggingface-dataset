# Peymandc/LFM3-1.7B-Heretic-Uncensored-GGUF

## Resumen

LFM3-1.7B-Heretic-Uncensored-GGUF es una versión cuantizada en formato GGUF del modelo Peymandc/LFM3-1.7B-Heretic-Uncensored, que a su vez es una modificación del LFM3-1.7B de Liquid AI. El autor, Peymandc, ha aplicado la herramienta Heretic v2.1.0 (concretamente su enfoque Arbitrary-Rank Ablation, ARA) sobre el checkpoint original para reducir el comportamiento de rechazo aprendido, y posteriormente ha generado cuatro variantes GGUF (Q4_K_M, Q6_K, Q8_0 y BF16) para facilitar la inferencia local mediante llama.cpp y otros motores compatibles.

El modelo base conserva la arquitectura Tri-hybrid de Liquid AI, con aproximadamente 1.730 millones de parámetros, 24 capas y un vocabulario de 128.000 tokens. Su longitud de contexto declarada alcanza los 256K tokens (entrada más salida), lo que lo sitúa en la categoría de modelos compactos de contexto largo orientados a despliegues en el borde (edge). Es relevante ahora porque ofrece una alternativa de inferencia local sin censura sobre un modelo de Liquid AI, con tamaños de archivo que van desde 1,10 GB (Q4_K_M) hasta 3,47 GB (BF16), lo que permite ejecutarlo en hardware de consumo.

La modificación no entrena un modelo nuevo: es un ajuste del comportamiento de rechazo sobre el checkpoint post-entrenado de Liquid AI. La evaluación reportada por el autor indica una reducción de las coincidencias de palabras clave de rechazo del 98% al 3% en un conjunto de 100 prompts de `mlabonne/harmful_behaviors`, con una divergencia KL de 0,0732 respecto al original medida sobre `mlabonne/harmless_alpaca`. No se han publicado benchmarks comparativos para las variantes GGUF.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tri-hybrid (Liquid AI LFM3) |
| Parametros totales | Aproximadamente 1,73B |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Hasta 256K tokens (entrada + salida) |
| Tipos de cuantizacion | Q4_K_M, Q6_K, Q8_0, BF16 |
| Idiomas soportados | 16 idiomas: en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl |
| Licencia | LFM Open License v1.0 (license_name: lfm1.0, license: other) |
| Formato de pesos | GGUF (safetensors disponible en el repo del checkpoint base) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura Tri-hybrid de Liquid AI, que combina mecanismos de atención y componentes de tipo convolucional/recurrente lineal para reducir el coste computacional en contextos largos, según la documentación del modelo base. Cuenta con 24 capas, un vocabulario de 128.000 tokens y una ventana de contexto declarada de hasta 256K tokens. El checkpoint base es un modelo post-entrenado de tipo text-only, es decir, no multimodal.

La innovación principal de esta ficha no reside en el entrenamiento, sino en la modificación del comportamiento de rechazo mediante Heretic v2.1.0 y su enfoque Arbitrary-Rank Ablation (ARA). La configuración documentada del trial #97 incluye capas de inicio y fin 9 y 24, peso de preservación de buen comportamiento 0,3616, peso de direccionamiento de mal comportamiento 0,0006, peso relativo de sobrecorrección 0,7002 y un recuento de vecinos de 14. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF/DPO en la información proporcionada.

## Capacidades

- Generación de texto conversacional y de tipo text-generation, según el pipeline declarado.
- Modelo text-only: no dispone de visión, audio ni otras modalidades.
- Soporte multilingüe para 16 idiomas, incluidos español, inglés, árabe, chino, francés, alemán, italiano, japonés, coreano, portugués, vietnamita, tailandés, indonesio, hindi, ruso y polaco.
- Capacidad de contexto largo de hasta 256K tokens, adecuada para documentos extensos y conversaciones multi-turno prolongadas.
- Comportamiento de rechazo reducido respecto al modelo original (3% de coincidencias de palabras clave de rechazo frente al 98% del original en la evaluación reportada).
- No se documenta soporte explícito de tool calling, function calling ni razonamiento multi-paso en la información disponible.
- No se documenta un modo "thinking" ni capacidades de agente en la información disponible.

## Casos de uso

- Asistente conversacional local en el borde: con cuantización Q4_K_M (1,10 GB) el modelo puede ejecutarse en portátiles y mini-PC con llama.cpp, gestionando diálogos multi-turno gracias a su contexto de hasta 256K tokens.
- Procesamiento de documentos largos en local: análisis y resumen de contratos, informes o transcripciones que superen la ventana típica de modelos pequeños, aprovechando el contexto extendido sin depender de la nube.
- Generación de texto creativo sin restricciones de contenido: escritura de ficción, guiones o material editorial donde el comportamiento de rechazo del modelo original resulta limitante, gracias a la modificación Heretic.
- Traducción y localización multilingüe: cobertura de 16 idiomas, útil para pipelines de traducción automática en entornos con recursos limitados.
- Prototipado rápido de aplicaciones de IA generativa: su tamaño reducido y formato GGUF permiten iterar en estaciones de trabajo sin GPU dedicada, integrándolo en scripts de Python con llama-cpp-python.
- Investigación sobre alineación y comportamiento de rechazo: el modelo sirve como caso de estudio reproducible de la técnica ARA de Heretic, con métricas de rechazo y divergencia KL documentadas.
- Despliegue en dispositivos con restricciones de memoria: la variante Q4_K_M cabe en sistemas con 2 GB de RAM libre, lo que facilita su uso en entornos embebidos o contenedores ligeros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se reclaman resultados comparativos para las variantes GGUF. La única evaluación reportada corresponde al checkpoint safetensors de origen:

| Metrica | Modelo modificado | LFM3-1.7B original |
|---|---:|---:|
| Coincidencias de palabras clave de rechazo (KeywordRate, 100 prompts de `mlabonne/harmful_behaviors`) | 3/100 (3%) | 98/100 (98%) |
| Divergencia KL (100 prompts de `mlabonne/harmless_alpaca`) | 0,0732 | 0,0000 |

Estos resultados proceden de evaluaciones con puntuadores automáticos de Heretic y no constituyen una evaluación semántica ni revisada por humanos. No se han evaluado de forma independiente las cuantizaciones GGUF individuales.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia según cuantización: Q4_K_M ≈ 1,10 GB, Q6_K ≈ 1,43 GB, Q8_0 ≈ 1,85 GB, BF16 ≈ 3,47 GB (tamaños de archivo reportados por el autor).
- GPU recomendadas: no se especifican en la información disponible. Por tamaño, el modelo es compatible con GPU de consumo como RTX 3060, RTX 4060, RTX 4090 y superiores; también puede ejecutarse en CPU.
- Cabe en GPU de consumo: sí, todas las cuantizaciones caben en GPU con 4 GB o más de VRAM; Q4_K_M puede ejecutarse incluso en CPU con suficiente RAM.
- Opciones de despliegue: llama.cpp y aplicaciones compatibles con GGUF de LFM3 (según la model card); no se documentan otros motores como vLLM, TGI u Ollama en la información disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---:|---|---|---|---|
| LFM3-1.7B-Heretic-Uncensored-GGUF | ~1,73B | 256K | LFM Open License v1.0 | GGUF | Modificación Heretic, sin benchmarks publicados |
| LiquidAI/LFM3-1.7B (original) | ~1,73B | 256K | LFM Open License v1.0 | Safetensors | Modelo base sin modificar, rechazo del 98% |
| Peymandc/LFM3-1.7B-Heretic-Uncensored | ~1,73B | 256K | LFM Open License v1.0 | Safetensors | Checkpoint safetensors modificado del que derivan los GGUF |

No se dispone de información sobre otros modelos comparables de la misma categoría en la documentación proporcionada.

## Limitaciones y advertencias

- La modificación Heretic reduce el rechazo, pero no elimina sesgos subyacentes del modelo original; puede generar contenido inapropiado, ofensivo o factualmente incorrecto.
- Riesgo de alucinación inherente a modelos de 1,7B parámetros; la precisión factual es limitada en comparación con modelos de mayor tamaño.
- La evaluación de rechazo se basa en coincidencias de palabras clave, no en una revisión semántica o humana, por lo que los resultados deben interpretarse con cautela.
- La divergencia KL de 0,0732 respecto al original indica que la modificación altera la distribución de salida; puede degradar capacidades en tareas benignas no evaluadas.
- Las cuantizaciones GGUF no han sido evaluadas de forma independiente; su calidad puede diferir del checkpoint safetensors de origen.
- Licencia LFM Open License v1.0: es necesario revisar sus términos para uso comercial, ya que se trata de una licencia "other" con nombre específico y puede imponer restricciones.
- No se documenta soporte de tool calling ni de agentes; no debe asumirse su disponibilidad en producción.
- El contexto de 256K tokens puede no ser efectivo en todas las cuantizaciones o motores de inferencia; verificar el comportamiento real en el despliegue.
- Modelo text-only: no admite entrada de imágenes, audio ni vídeo.

## Enlaces

- Repositorio GGUF: https://huggingface.co/Peymandc/LFM3-1.7B-Heretic-Uncensored-GGUF
- Checkpoint safetensors modificado: https://huggingface.co/Peymandc/LFM3-1.7B-Heretic-Uncensored
- Modelo base original: https://huggingface.co/LiquidAI/LFM3-1.7B
- Proyecto Heretic: https://github.com/Heretic-Project/Heretic
- Página de soporte del autor: https://huggingface.co/spaces/Peymandc/support
- Descarga Q4_K_M: https://huggingface.co/Peymandc/LFM3-1.7B-Heretic-Uncensored-GGUF/resolve/main/LFM3-1.7B%20Heretic.Q4_K_M.gguf?download=true
- Descarga Q6_K: https://huggingface.co/Peymandc/LFM3-1.7B-Heretic-Uncensored-GGUF/resolve/main/LFM3-1.7B%20Heretic.Q6_K.gguf?download=true
- Descarga Q8_0: https://huggingface.co/Peymandc/LFM3-1.7B-Heretic-Uncensored-GGUF/resolve/main/LFM3-1.7B%20Heretic.Q8_0.gguf?download=true
- Descarga BF16: https://huggingface.co/Peymandc/LFM3-1.7B-Heretic-Uncensored-GGUF/resolve/main/LFM3-1.7B%20Heretic.BF16.gguf?download=true
