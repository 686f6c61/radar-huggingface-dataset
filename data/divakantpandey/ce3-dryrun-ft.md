# divakantpandey/ce3-dryrun-ft

## Resumen

`ce3-dryrun-ft` es un modelo de embeddings de frases derivado de `Alibaba-NLP/gte-modernbert-base` mediante un ajuste fino (fine-tuning) realizado por el usuario divakantpandey. Se trata, según la propia model card, de un artefacto de prueba de pipeline ("pipeline test artefact") generado durante una ejecución de prueba ("dry-run") del proyecto code-embed-v3, cuyo objetivo era verificar que cada etapa del pipeline de entrenamiento funcionaba correctamente antes de lanzar una ejecución con coste real.

El modelo está construido sobre la arquitectura ModernBERT, una familia de encoders transformer optimizada para eficiencia y contexto largo, y cuenta con 149.014.272 parámetros totales en formato safetensors. Se entrenó sobre unos pocos cientos de filas por fuente durante unos pocos cientos de pasos, lo que, según el autor, es una cantidad de datos muy insuficiente para que el modelo resulte útil en tareas reales de búsqueda de código.

La relevancia de este modelo es, por tanto, exclusivamente metodológica y de trazabilidad: forma parte del conjunto de artefactos públicos del proyecto code-embed-v3 y del paper asociado sobre entrenamiento con "near-miss" verificado por ejecución. El autor advierte explícitamente de que no debe usarse para búsqueda de código y remite a `gte-modernbert-base` como alternativa funcional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer) |
| Parametros totales | 149.014.272 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en `Alibaba-NLP/gte-modernbert-base`, un encoder de la familia ModernBERT orientado a la generación de embeddings (representaciones densas de texto y código). ModernBERT incorpora mejoras sobre el transformer clásico como atención con rotación posicional (RoPE), atención local/global alternada para manejar contextos largos con coste reducido, y capas de activación y normalización optimizadas. El modelo se distribuye a través de la librería `sentence-transformers`, lo que implica que produce embeddings de frase/código utilizables directamente para similitud semántica o recuperación.

El ajuste fino se realizó sobre un conjunto de datos reducido: unos pocos cientos de filas por fuente y unos pocos cientos de pasos de entrenamiento, dentro de una ejecución de prueba del pipeline code-embed-v3 fechada el 2026-10-31. No se detalla en la información disponible la composición exacta del dataset, el número total de tokens de entrenamiento, ni si se aplicaron técnicas de RLHF o DPO (poco probables en un modelo de embeddings). El propósito del entrenamiento era validar el código del pipeline, no producir un modelo competitivo; el autor lo describe como parte de la etapa de fine-tuning de un "dry-run" a escala de juguete.

## Capacidades

- Generación de embeddings densos de texto y código mediante `sentence-transformers`.
- Similitud semántica y recuperación de información (retrieval) potencial, aunque no fiable por el escaso entrenamiento.
- Capacidad multilingüe: no disponible (no se especifica en la información).
- Tool calling / function calling: no aplica (es un modelo de embeddings, no generativo).
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Modo "thinking", visión o audio: no disponible.

## Casos de uso

- Validación de pipelines de entrenamiento: sirve como artefacto de referencia para comprobar que las etapas de preprocesado, entrenamiento y exportación de un pipeline de embeddings funcionan de extremo a extremo antes de una ejecución costosa. Es exactamente el uso para el que fue creado.
- Reproducibilidad de investigación: permite reproducir los pasos del dry-run descrito en el log de investigación R11/R14 del proyecto code-embed-v3 y comparar resultados con los modelos finales del paper.
- Pruebas de integración con `sentence-transformers`: útil para verificar que el código de carga, tokenización e inferencia funciona con un checkpoint ModernBERT ajustado, sin depender de un modelo grande.
- Depuración de formatos de pesos: al estar en safetensors y con 149 M de parámetros, permite probar rutinas de carga y conversión (por ejemplo, a otros formatos) con un coste mínimo.
- Docencia y demostración de fine-tuning: ejemplo de cómo se ajusta un encoder base sobre un dataset pequeño, mostrando el flujo completo desde el modelo base hasta el checkpoint final.
- Referencia negativa en experimentos: el propio autor lo cita como ejemplo de modelo insuficientemente entrenado, útil para contrastar con los modelos finales `code-embed-v3-150m-ft-behaviour` y `code-embed-v3-150m-ft-control`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 149 M de parámetros en fp32, aproximadamente 0,6 GB de pesos; en fp16, unos 0,3 GB; más memoria para activaciones y batch. Cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM (GTX 1650, RTX 3060, RTX 4090, A100, H100). Para pruebas, incluso CPU es suficiente.
- Cabe en GPU consumer: sí, en todas las GPU modernas e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: `sentence-transformers` (librería nativa), `transformers` con `AutoModel`, y potencialmente `vLLM` o `TGI` si se adapta como modelo de embeddings (no confirmado en la información). `llama.cpp`/`Ollama` no aplican directamente por ser un encoder, salvo conversión a GGUF (no documentada).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `ce3-dryrun-ft` | 149 M | no disponible | apache-2.0 | Hugging Face | Artefacto de prueba, no apto para producción |
| `Alibaba-NLP/gte-modernbert-base` | ~149 M | no disponible | apache-2.0 | Hugging Face | Modelo base original, recomendado por el autor para búsqueda de código |
| `code-embed-v3-150m-ft-behaviour` | ~150 M | no disponible | no disponible | Hugging Face | Modelo final del paper (variante behaviour) |
| `code-embed-v3-150m-ft-control` | ~150 M | no disponible | no disponible | Hugging Face | Modelo final del paper (variante control) |

## Limitaciones y advertencias

- Entrenado con muy pocos datos (unos cientos de filas por fuente, unos cientos de pasos): no es útil para búsqueda de código ni para tareas reales de recuperación.
- El autor indica explícitamente: "Do not use for code search".
- Riesgo elevado de embeddings de baja calidad y de resultados de similitud poco fiables.
- No se documentan sesgos conocidos, pero al derivar de un modelo base entrenado con datos web, puede heredar sesgos de este.
- Idiomas soportados no especificados; no se garantiza cobertura multilingüe.
- Licencia apache-2.0 permite uso comercial, pero el modelo no es apto para producción por su calidad.
- No se dispone de información sobre contexto máximo, cuantizaciones soportadas ni rendimiento medido.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/divakantpandey/ce3-dryrun-ft
- Modelo base: https://huggingface.co/Alibaba-NLP/gte-modernbert-base
- Modelo final (behaviour): https://huggingface.co/divakantpandey/code-embed-v3-150m-ft-behaviour
- Modelo final (control): https://huggingface.co/divakantpandey/code-embed-v3-150m-ft-control
- Repositorio y log de investigación: https://github.com/divakantpandey/code-embed-v3
