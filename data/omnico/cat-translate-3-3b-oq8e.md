# Omnico/CAT-Translate-3.3b-oQ8e

## Resumen

CAT-Translate-3.3b-oQ8e es una versión cuantizada del modelo CAT-Translate-3.3b, publicada por el usuario Omnico en Hugging Face. Se trata de un checkpoint de 3.355.609.600 parámetros (aproximadamente 3,3 mil millones) orientado, por su nombre, a tareas de traducción, aunque la model card no documenta explícitamente el modelo base ni sus capacidades. La versión aquí descrita ha sido cuantizada con oQ (oMLX v0.7.3), una técnica de cuantización de precisión mixta, y se distribuye en formato MLX para su ejecución en hardware Apple Silicon.

El interés de esta ficha radica en su formato: es un modelo cuantizado a una media efectiva de 8,500 bits por peso, con la práctica totalidad de los pesos almacenados en affine 8-bit con grupo de 64, lo que reduce el checkpoint a 3,321 GiB. Está etiquetado como modelo de la familia llama y empaquetado para la librería mlx, lo que lo hace directamente consumible en macOS con chip M-series mediante el stack de MLX.

La información pública disponible es muy limitada: no se declaran licencia, idiomas, pipeline ni resultados de evaluación, y el repositorio no registra descargas ni interacciones en el momento de la consulta. Por tanto, esta ficha describe con rigor lo que sí está documentado (arquitectura de almacenamiento, cuantización, formato) y marca explícitamente como no disponible todo lo que la model card omite.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer tipo llama (según tag del repositorio); detalles no disponibles |
| Parámetros totales | 3.355.609.600 (3,356B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Affine 8-bit con grupo de 64 (99,995 % de los pesos); BF16 (0,005 %); media efectiva 8,500 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors en formato MLX (librería mlx); cuantización oQ |
| Tamaño del repositorio | 3,6 GB (checkpoint: 3.565 GB / 3.321 GiB) |
| Fecha de publicación | 2026-11-03 |

## Arquitectura y entrenamiento

La model card no documenta la arquitectura interna del modelo base más allá de la etiqueta `llama`, que sugiere una familia de transformer decoder-only con atención causal estándar. No se especifican número de capas, dimensión oculta, cabezas de atención, tipo de normalización ni estrategia de atención (por ejemplo, GQA o atención lineal). Tampoco se detalla el proceso de entrenamiento: no hay información sobre volumen de tokens, composición del dataset, idiomas de entrenamiento ni si se aplicaron fases de RLHF, DPO o ajuste supervisado.

Lo que sí está documentado es el proceso de cuantización posterior. El checkpoint se generó con oQ (oMLX v0.7.3), una técnica de cuantización de precisión mixta que asigna 8 bits afines con grupo de 64 a prácticamente todos los pesos (3,355B parámetros, el 99,995 %) y mantiene una fracción ínfima en BF16 (0,000B lógicos, 0,005 % del total). El resultado es una media efectiva de 8,500 bits por peso y un almacenamiento de 3.321 GiB para el modelo de lenguaje, sin componentes adicionales (no se listan cabezas de visión, audio ni módulos separados). La model card indica una actualización del 3 de noviembre de 2026 con re-cuantización respecto a copias anteriores.

## Capacidades

- Generación de texto y traducción: el nombre del modelo sugiere orientación a traducción, pero la model card no detalla pares de idiomas ni calidad.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingüe concreta (idiomas no disponibles).
- No se documenta modo thinking, visión, audio ni otras capacidades especiales.
- Ejecución nativa en Apple Silicon mediante la librería MLX.

## Casos de uso

- Traducción local en macOS: al estar empaquetado en MLX y ocupar 3,321 GiB, puede cargarse en un Mac con chip M-series y ejecutarse sin conexión para traducir texto entre idiomas, siempre que se validen previamente los pares soportados, que no están documentados.
- Prototipado de pipelines de traducción en el portátil del desarrollador: el tamaño reducido y la cuantización a 8 bits permiten iterar sobre prompts y postprocesado sin depender de GPU dedicada.
- Procesamiento por lotes de documentos en local: la ventana de contexto no está documentada, por lo que su uso en documentos largos requiere verificación empírica antes de adoptarlo en producción.
- Evaluación comparativa de cuantizaciones: sirve como referencia para medir la degradación de calidad entre el modelo base (probablemente BF16) y esta versión oQ de 8,500 bits/peso en tareas de traducción.
- Integración en aplicaciones de escritorio para macOS: el formato MLX encaja con apps nativas que ya usan el stack de Apple para inferencia en el dispositivo.
- Filtrado y preprocesado lingüístico en entornos con requisitos de privacidad: al ejecutarse localmente, evita enviar texto a servicios externos, aunque la licencia no está declarada y debe aclararse antes de un uso comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/ memoria unificada estimada: aproximadamente 3,3 GiB para los pesos en 8 bits, más overhead de activaciones y KV cache (no cuantificado en la información disponible).
- Hardware objetivo: Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra), dado que el checkpoint está en formato MLX.
- Cabe en GPUs de consumo con al menos 8 GB de memoria si se convierte a otro runtime; en Mac, un equipo con 16 GB de memoria unificada debería alojarlo con margen para el contexto.
- Opciones de despliegue: mlx / mlx-lm en macOS; no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI, y el formato safetensors MLX no es directamente portable a esos runtimes sin conversión.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no identifica el modelo base ni ofrece alternativas comparables con parámetros, contexto, rendimiento y licencia verificables.

## Limitaciones y advertencias

- La licencia no está declarada, por lo que no puede asumirse uso comercial sin consultar al autor.
- No se documentan los idiomas soportados ni los pares de traducción, lo que impide garantizar cobertura lingüística.
- No hay información sobre sesgos, alucinación ni evaluación de calidad; el nombre "Translate" no garantiza precisión en dominios técnicos o especializados.
- La cuantización a 8,500 bits/peso puede introducir degradación respecto al modelo original, especialmente en tareas sensibles a precisión numérica; no se aportan métricas de dicha degradación.
- El formato MLX limita el despliegue a ecosistema Apple; no es directamente compatible con runtimes CUDA habituales.
- El repositorio no registra descargas ni likes, y la model card es mínima; conviene validar el modelo antes de integrarlo en producción.
- La fecha de creación indicada (2026-11-03) y la nota de re-cuantización sugieren posibles revisiones del checkpoint; fijar una revisión concreta del repositorio para reproducibilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Omnico/CAT-Translate-3.3b-oQ8e
- Repositorio de oQ / oMLX: https://github.com/jundot/omlx
