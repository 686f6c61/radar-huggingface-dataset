# nouli-ai/nouli-guard

## Resumen

Nouli Guard es un clasificador de discurso de odio en inglés desarrollado por Nouli AI. El modelo devuelve probabilidades calibradas para tres clases (`no`, `unclear`, `yes`) y se distribuye como un ensemble congelado de dos encoders afinados: Ettin-1B (jhu-clsp/ettin-encoder-1b) y ModernBERT-large (answerdotai/ModernBERT-large). El conjunto suma 1.424 mil millones de parámetros y procesa 256 tokens de entrada por encoder.

El modelo aborda un problema clásico de moderación de contenido: la clasificación binaria o ternaria de toxicidad y discurso de odio en textos cortos. Su propuesta diferencial es el uso de distribuciones de anotación humana (en lugar de etiquetas duras) durante el entrenamiento, junto con una capa de calibración que busca alinear las probabilidades de salida con la incertidumbre real de los anotadores.

Es relevante en el contexto de la moderación automatizada porque combina dos arquitecturas encoder modernas (una basada en atención lineal y otra en transformer encoder clásico) y ofrece inferencia local sin dependencia de una API alojada, con licencia Apache-2.0. El modelo se publica con un ecosistema de herramientas propio (Nouli CLI) y una comparación registrada frente a un baseline denominado Jev 1.14.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensemble congelado de dos encoders transformer (Ettin-1B y ModernBERT-large) con calibración posterior |
| Parametros totales | 1.424 mil millones |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 256 tokens por encoder |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0, con avisos de licencias upstream y atribución del dataset |
| Formato de pesos | PyTorch (repo de 5.7 GB); no se especifican otros formatos |
| Pipeline | text-classification |
| Salida | Probabilidades para `no`, `unclear`, `yes` |
| Runtime probado | macOS ARM64 / CPU; Linux ARM64 / CUDA |

## Arquitectura y entrenamiento

Nouli Guard no es un transformer monolítico, sino un ensemble congelado de dos encoders: Ettin-1B (jhu-clsp/ettin-encoder-1b) y ModernBERT-large (answerdotai/ModernBERT-large). Cada encoder procesa hasta 256 tokens de entrada y sus salidas se combinan mediante un mecanismo de ensemble congelado seguido de una etapa de calibración que produce las tres probabilidades finales. No se detalla en la información disponible el método exacto de combinación ni el algoritmo de calibración empleado.

El entrenamiento se realizó sobre el dataset ucberkeley-dlab/measuring-hate-speech, con 19.944 comentarios de entrenamiento. La model card indica que el modelo se entrenó sobre distribuciones de anotación humana para la clasificación de discurso de odio, es decir, no sobre etiquetas binarias duras sino sobre la distribución de etiquetas asignadas por los anotadores. No se especifica el número de tokens de entrenamiento, la composición completa del dataset ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Clasificación de discurso de odio en inglés con salida ternaria (`no`, `unclear`, `yes`) y probabilidades calibradas.
- Modelado de incertidumbre mediante la clase `unclear`, que permite distinguir casos ambiguos de casos claros.
- Entrenamiento sobre distribuciones de anotación humana, lo que busca reflejar el desacuerdo entre anotadores.
- Inferencia local sin API alojada: los pesos se descargan desde Hugging Face y se ejecutan en la máquina del usuario.
- Integración con Nouli CLI 0.4.2 y workflows definidos en JSON para orquestar la decisión.
- Soporte de ejecución en CPU (macOS ARM64, Linux ARM64) y CUDA (Linux ARM64).
- No se documentan capacidades de generación de texto, razonamiento general, código, matemáticas, visión, audio, tool calling ni agentes multi-paso; es un modelo exclusivamente de clasificación.

## Casos de uso

- Moderación de comentarios en foros y comunidades: el modelo clasifica cada comentario en `no`, `unclear` o `yes`, y la clase `unclear` permite derivar casos ambiguos a revisión humana en lugar de forzar una decisión binaria.
- Filtrado previo en pipelines de contenido generado por usuarios: al ejecutarse en CPU, puede desplegarse como paso de pre-filtrado antes de un sistema de moderación más costoso, reduciendo el volumen que llega a revisión manual.
- Análisis de toxicidad en datasets de investigación: dado que se entrenó sobre distribuciones de anotación humana de Measuring Hate Speech, es adecuado para replicar o comparar etiquetados en estudios sobre discurso de odio en inglés.
- Auditoría de sesgos en sistemas de moderación: la salida calibrada y la clase `unclear` permiten analizar la confianza del modelo por subgrupos y detectar umbrales problemáticos.
- Clasificación por lotes en entornos sin GPU: el runtime probado en macOS ARM64 y Linux ARM64 con CPU facilita el procesamiento offline de corpus en estaciones de trabajo convencionales.
- Integración en flujos de decisión con Nouli CLI: mediante workflows JSON, el modelo puede encadenarse con otras herramientas de decisión de Nouli AI (Route, Clause, Push, Doom) para construir un pipeline de moderación completo.
- Evaluación comparativa de clasificadores: la comparación registrada frente a Jev 1.14.0 permite usar Nouli Guard como referencia en la evaluación de otros moderadores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye una comparación ilustrativa con Jev 1.14.0 (fechada el 31 de octubre de 2026) sobre un único ejemplo seleccionado tras el scoring, en la que Nouli Guard selecciona `Hate speech` y el baseline Jev flat, calibrado, selecciona `No hate speech`, con etiqueta de referencia `Hate speech`. El propio autor advierte que el ejemplo no es una muestra representativa. No se proporcionan métricas agregadas (precisión, recall, F1, AUROC) en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. El repo ocupa 5.7 GB en pesos PyTorch; en FP32 los 1.424 mil millones de parámetros requerirían aproximadamente 5,7 GB solo para pesos, más overhead de activaciones y del runtime.
- GPU recomendadas: no se especifican modelos concretos. El runtime probado incluye Linux ARM64 con CUDA; no se documentan requisitos mínimos de GPU.
- Cabe en GPU consumer: no confirmado en la información disponible; el tamaño de pesos (5.7 GB) sugiere que podría caber en GPUs con 8 GB o más en FP16, pero no se verifica en la model card.
- Opciones de despliegue: servidor Python propio (`serve.py`), Nouli CLI 0.4.2, Hugging Face CLI para descarga. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nouli Guard | 1.424 B (ensemble) | 256 tokens por encoder | `no` / `unclear` / `yes` calibrado | Apache-2.0 | Hugging Face, inferencia local |
| Jev 1.14.0 (baseline) | No disponible | No disponible | Probabilidades calibradas | No disponible | No disponible |
| Ettin-1B (base) | 1 B (aprox.) | No disponible | Embeddings / encoder | No disponible en esta ficha | Hugging Face |
| ModernBERT-large (base) | No disponible | No disponible | Embeddings / encoder | No disponible en esta ficha | Hugging Face |

La información disponible solo permite comparar con Jev 1.14.0 mediante un ejemplo ilustrativo, sin métricas agregadas. No se dispone de datos de rendimiento de los modelos base como clasificadores independientes.

## Limitaciones y advertencias

- Evaluado sobre un único corpus histórico en inglés (Measuring Hate Speech); las etiquetas de paneles humanos no definen todas las políticas de moderación posibles.
- Solo soporta la salida fija `no` / `unclear` / `yes`; no se ha establecido cobertura general de seguridad ni de cumplimiento de políticas.
- El ejemplo comparativo con Jev 1.14.0 fue seleccionado tras el scoring y no es una muestra representativa; no debe interpretarse como evidencia de superioridad general.
- Riesgo de alucinación no aplica en sentido generativo, pero sí existe riesgo de clasificación errónea en dominios distintos al corpus de entrenamiento.
- Limitación de idioma: solo inglés; no se documenta soporte multilingüe.
- Ventana de contexto corta (256 tokens por encoder), lo que limita el análisis de documentos largos o hilos de conversación extensos.
- Licencia Apache-2.0 permite uso comercial, pero se deben retener los avisos de licencias upstream y la atribución del dataset.
- El despliegue requiere Python 3.12 y la Nouli CLI 0.4.2; no se documentan integraciones con frameworks estándar de serving.
- No se especifican sesgos conocidos más allá de los inherentes al corpus de anotación humana utilizado.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/nouli-ai/nouli-guard)
- [Nouli AI](https://nouli.ai)
- [Nouli CLI 0.4.2](https://github.com/standing-desks/nouli/releases/tag/v0.4.2)
- [Modelo base Ettin-1B](https://huggingface.co/jhu-clsp/ettin-encoder-1b/tree/befd76be43d08b89ff9957012f3ff29d0842780b)
- [Modelo base ModernBERT-large](https://huggingface.co/answerdotai/ModernBERT-large/tree/45bb4654a4d5aaff24dd11d4781fa46d39bf8c13)
- [Dataset Measuring Hate Speech](https://huggingface.co/datasets/ucberkeley-dlab/measuring-hate-speech/tree/5468f6e118396646b02a2f691e771f6b6d9502ea)
- [Nouli Route](https://huggingface.co/nouli-ai/nouli-route)
- [Nouli Clause](https://huggingface.co/nouli-ai/nouli-clause)
- [Nouli Push](https://huggingface.co/nouli-ai/nouli-push)
- [Nouli Doom](https://huggingface.co/nouli-ai/nouli-doom)
