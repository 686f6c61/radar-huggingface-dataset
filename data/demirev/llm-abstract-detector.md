# demirev/llm-abstract-detector

## Resumen

El detector de abstracts científicos asistidos por LLM de demirev es un clasificador binario construido sobre el encoder SPECTER2 de Allen AI. Su función es estimar la probabilidad de que un abstract de revista científica haya sido redactado con ayuda de un modelo de lenguaje grande, comparando el estilo del texto con el de abstracts humanos de contenido equivalente. No es un detector genérico de texto generado: está especializado en el registro discursivo de la escritura académica y calibrado para medir proporciones agregadas en corpus masivos, no para juzgar casos individuales.

El modelo se desarrolló para el artículo *Is AI Reviving the Renaissance Man? LLM Adoption and Scientific Novelty in 22 Million Abstracts* (Demirev, 2026), en el que se aplicó a 21,9 millones de abstracts publicados entre enero de 2018 y octubre de 2025. Su relevancia actual radica en que ofrece una herramienta reproducible para cuantificar la adopción de IA generativa en la literatura científica por campo, nivel de revista y periodo, con tasas de error documentadas y una corrección estadística explícita.

Técnicamente es un modelo pequeño y ligero: 109,9 millones de parámetros, ventana de 512 tokens, licencia Apache 2.0 y un repositorio de 0,4 GB. La cabeza de clasificación se distribuye por separado en `head.safetensors`, lo que exige un pequeño código de carga manual en lugar del pipeline estándar de `transformers`.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT (base: allenai/specter2_base) + capa lineal sobre el embedding `[CLS]` |
| Parámetros totales | 109.918.464 |
| Parámetros activos | no aplica (modelo denso) |
| Longitud de contexto | 512 tokens (truncado en entrenamiento e inferencia) |
| Tipos de cuantización | no disponible (pesos safetensors en fp32; no se documentan variantes GGUF, INT8 ni INT4) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (encoder completo en el repo + `head.safetensors` para la cabeza lineal) |

## Arquitectura y entrenamiento

La arquitectura es un encoder BERT de SPECTER2 (diseñado originalmente para embeddings de documentos científicos) al que se añade una capa lineal de una dimensión sobre el token `[CLS]`. La puntuación final es la sigmoide de esa salida. Todos los pesos del encoder se afinan, no se congelan: 3 épocas, learning rate 2e-5, batch size 16, truncado a 512 tokens y semilla 42.

El conjunto de entrenamiento combina 40.558 abstracts humanos de la base de datos Dimensions (publicados antes del 1 de noviembre de 2022, muestreados por 34 campos de evaluación con refuerzo de revistas Q1 y de una lista de revistas de élite) con 68.779 abstracts sintéticos generados por GPT-4o, GPT-4o-mini, GPT-5 y GPT-5-mini. Cada abstract sintético se produce a partir de un resumen destilado del original por GPT-5-mini, de modo que el contenido factual coincide y solo varía el estilo. La partición es 80/20 estratificada por fuente: 87.469 abstracts de entrenamiento y 21.868 de test.

La innovación metodológica principal es el uso de *online Group-DRO* sobre cinco niveles de revista (Q4, Q3, Q2, Q1 y revistas de élite) con paso de grupo 0,1, que sobrepondera el estrato con peor rendimiento durante el entrenamiento. Al terminar, el estrato de revistas de élite acumula un peso de 0,72. La pérdida es entropía cruzada binaria. Para evaluación se reservan cuatro generadores no vistos en entrenamiento: Claude Haiku 4.5, Claude Sonnet 5, Gemini 2.5 Flash y Gemini 3 Flash.

## Capacidades

- Clasificación binaria de texto: devuelve una puntuación continua (sigmoide) de probabilidad de escritura asistida por LLM.
- Detección especializada en abstracts científicos en inglés, con normalización de Markdown, HTML, enlaces y espacios aplicada de forma consistente en entrenamiento e inferencia.
- Generalización parcial a generadores no vistos en entrenamiento (Claude y Gemini), con AUROC entre 0,962 y 0,980.
- Procesamiento por lotes: el tokenizador admite listas de abstracts con padding y truncado, lo que permite puntuar corpus grandes.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- No genera texto: es exclusivamente un clasificador.
- Idiomas: únicamente inglés; no se documenta rendimiento en otros idiomas.

## Casos de uso

- Medición de adopción de IA en corpus editoriales: puntuar todos los abstracts de una revista o base de datos y estimar la proporción de textos asistidos por LLM por año, aplicando la corrección por tasas de error documentadas en el artículo.
- Estudios de ciencia de la ciencia: cruzar las puntuaciones con metadatos de campo, cuartil de revista y periodo para analizar cómo varía la adopción de IA entre disciplinas y niveles de prestigio.
- Auditoría de integridad editorial a escala agregada: detectar desplazamientos anómalos en la distribución de puntuaciones de un journal tras la irrupción de ChatGPT, sin señalar autores individuales.
- Investigación sobre novedad científica: el detector es un componente del trabajo que relaciona adopción de LLM con cambios en la novedad de los abstracts; puede reutilizarse para replicar o extender ese análisis.
- Filtrado y caracterización de datasets: etiquetar corpus de abstracts recopilados para otros proyectos y separar subconjuntos con distinta probabilidad de asistencia por LLM antes de entrenar modelos científicos.
- Monitorización longitudinal de repositorios preprint: aplicar el modelo a versiones sucesivas de un mismo abstract para estudiar si la edición con LLM se concentra en fases concretas del ciclo de publicación.
- Validación metodológica: usar el modelo como referencia en estudios que comparen detectores de texto generado en el dominio académico, gracias a sus tasas FPR/FNR publicadas por estrato.

## Benchmarks y rendimiento

Conjunto de test retenido (21.868 abstracts); FPR y FNR al umbral 0,99:

| Estrato | N | AUROC | FPR (%) | FNR (%) |
|---|---:|---:|---:|---:|
| Todos los abstracts | 21.868 | 0,991 | 3,0 | 6,7 |
| Revistas Q4 | 1.385 | 0,994 | 0,7 | 8,4 |
| Revistas Q3 | 1.861 | 0,995 | 1,6 | 4,5 |
| Revistas Q2 | 4.080 | 0,994 | 1,6 | 4,9 |
| Revistas Q1 | 11.155 | 0,995 | 3,2 | 3,7 |
| Revistas de élite | 3.387 | 0,952 | 8,4 | 16,2 |

Por generador, comparado con todos los abstracts humanos del test (FPR constante del 3,0%):

| Generador | AUROC | FNR (%) |
|---|---:|---:|
| GPT-4o | 0,993 | 6,0 |
| GPT-4o-mini | 0,992 | 6,0 |
| GPT-5 | 0,982 | 14,1 |
| GPT-5-mini | 0,992 | 5,8 |
| Claude Haiku 4.5 (no visto) | 0,980 | 16,2 |
| Claude Sonnet 5 (no visto) | 0,962 | 25,1 |
| Gemini 2.5 Flash (no visto) | 0,977 | 17,5 |
| Gemini 3 Flash (no visto) | 0,979 | 15,7 |

Al umbral por defecto de 0,5: FPR del 12,1%, FNR del 1,9% y F1 de 0,956. Como comprobación externa, el detector marca el 2,9% de los 12,5 millones de abstracts de Dimensions publicados entre enero de 2018 y octubre de 2022 (antes de ChatGPT), frente al 2,5% esperado según las tasas de falsos positivos por estrato del test.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5 GB en fp32 para los 109,9 M de parámetros, más el overhead de activaciones y del tokenizador; en la práctica cabe holgadamente en cualquier GPU con 2 GB o más.
- GPU recomendadas: cualquier GPU consumer moderna sirve; una RTX 3060, RTX 4060 o superior procesa lotes grandes sin problema. Para corpus de millones de abstracts, una A100 o H100 reduce el tiempo total, aunque el cuello de botella será más probablemente la E/S que el cómputo.
- Cabe en GPU consumer: sí, en cualquier modelo con al menos 2 GB de VRAM; también funciona en CPU para lotes moderados.
- Opciones de despliegue: `transformers` con PyTorch es la vía documentada; la cabeza lineal debe cargarse manualmente desde `head.safetensors` con `safetensors.torch.load_file`. No se documentan integraciones con vLLM, TGI, llama.cpp ni Ollama, y al no ser un modelo generativo estas herramientas no aplican directamente.
- Latencia y throughput: no disponibles en la información proporcionada. Por el tamaño del modelo, se espera un throughput alto en GPU, pero no se han publicado cifras.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Dominio | Licencia |
|---|---|---|---|---|---|
| demirev/llm-abstract-detector | Clasificador BERT | 109,9 M | 512 | Abstracts científicos (inglés) | Apache 2.0 |
| Detectores genéricos de texto IA (p. ej. familias RoBERTa fine-tuned) | Clasificador | Variable | 512 | Texto general | Variable |
| Clasificadores de estilo académico basados en DeBERTa | Clasificador | ~140-300 M | 512 | Texto académico | Variable |

No se dispone en la información proporcionada de resultados de benchmarks de alternativas comparables evaluadas sobre el mismo conjunto de test, por lo que no es posible establecer una comparación numérica directa. La comparativa se limita a categoría, tamaño y dominio.

## Limitaciones y advertencias

- Las tasas de error son dos o tres veces mayores en revistas de élite: FPR del 8,4% y FNR del 16,2% frente al 3,0% y 6,7% globales.
- Los abstracts escritos con modelos más recientes y con modelos fuera de la familia GPT son más difíciles de detectar; el FNR llega al 25,1% con Claude Sonnet 5.
- La edición ligera de un borrador humano puede no ser detectada.
- El modelo solo ve el texto del abstract: no tiene acceso a metadatos, historial de versiones, figuras ni referencias, lo que limita el contexto disponible para la decisión.
- Una puntuación individual no es evidencia fiable de que un abstract concreto haya sido escrito con un LLM; el autor indica explícitamente que no debe usarse para juzgar a autores o envíos individuales.
- El uso previsto es la medición agregada con corrección por tasas de error conocidas, no la clasificación caso a caso.
- Solo inglés: no se documenta comportamiento en abstracts en otros idiomas.
- El umbral 0,99 está calibrado para el análisis del artículo; usar 0,5 cambia sustancialmente el equilibrio FPR/FNR (12,1% frente a 1,9%).
- Aunque la licencia es Apache 2.0 y permite uso comercial, el propio autor restringe el uso previsto a la medición agregada; conviene respetar esa indicación en aplicaciones de producción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación independiente de la comunidad publicada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/demirev/llm-abstract-detector
- Modelo base SPECTER2: https://huggingface.co/allenai/specter2_base
- Base de datos Dimensions: https://www.dimensions.ai/
- Artículo de referencia: *Is AI Reviving the Renaissance Man? LLM Adoption and Scientific Novelty in 22 Million Abstracts* (Demirev, 2026); no se dispone de URL directa en la información proporcionada.
