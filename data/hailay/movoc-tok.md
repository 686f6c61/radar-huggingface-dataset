# Hailay/MoVoC-Tok

## Resumen

MoVoC-Tok es una familia de tokenizadores BPE con restricciones morfológicas para lenguas escritas en alfabeto ge'ez, concretamente amárico (am) y tigriña (ti). Lo desarrolla Hailay y acompaña al artículo *MoVoC: Morphology-Aware Subword Construction for Ge'ez Script Languages*, publicado en Findings of EMNLP 2025. No es un modelo de lenguaje, sino un componente de preprocesado: dos tokenizadores de vocabulario 32.000 (uno por lengua) más un vocabulario morfológico conjunto de 105.310 entradas.

El problema que aborda es específico de las lenguas de morfología rica: el BPE estándar fragmenta palabras a través de fronteras de morfema, lo que degrada la calidad de las representaciones en lenguas con poca cobertura de datos. MoVoC-Tok impone una restricción durante el entrenamiento (ninguna fusión BPE puede cruzar una frontera de morfema) y vuelve a aplicarla en tiempo de codificación, lo que eleva el cumplimiento de fronteras del 69,05% al 100%.

Es relevante ahora porque las lenguas de bajos recursos siguen infrarrepresentadas en los pipelines multilingües, y un tokenizador morfológicamente consciente es una mejora barata y determinista (sin semilla aleatoria) que se puede integrar en cualquier stack basado en `transformers`. El repositorio es pequeño, se cachea automáticamente y no requiere descarga manual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tokenizador BPE con fusión restringida por morfema (constrained-merge BPE), implementado como `PreTrainedTokenizerFast` |
| Parametros totales | No aplica (no es un modelo neuronal) |
| Parametros activos | No aplica |
| Longitud de contexto | No disponible (no aplica a un tokenizador) |
| Tipos de cuantizacion | No aplica |
| Idiomas soportados | Amárico (am) y tigriña (ti); ge'ez y tigre solo en evaluación, sin checkpoint |
| Licencia | CC-BY-4.0 |
| Formato de pesos | `tokenizer.json` y `tokenizer_config.json` por subcarpeta; vocabulario en `vocabulary/movoc_vocab.txt` |

Detalles adicionales: vocabulario de 32.000 por lengua (32.001 exportado, con un token añadido), 30.955 fusiones BPE en amárico y 30.840 en tigriña. Tamaño de alfabeto: 1.041 (am) y 1.156 (ti). Tiempo de entrenamiento: 12,6 y 13,9 minutos respectivamente.

## Arquitectura y entrenamiento

MoVoC-Tok es un BPE clásico con una restricción añadida: durante el entrenamiento no se permite ninguna fusión que cruce una frontera de morfema, según la formulación `max_V Σ_i log P(BPE(w_i; V, M_i))` sujeta a que ningún subword `s_j` cruce una frontera en `M_i`. Los corpus son `NLLB.am-en.am` y `NLLB.en-ti.ti`, con 400.000 líneas leídas en cada caso y 158.504 / 169.373 tipos de palabra (frecuencia mínima 2).

El número de fusiones rechazadas por cruzar fronteras es notable: 335.638 en amárico y 104.964 en tigriña, lo que da una idea de cuánta estructura morfológica destruye el BPE convencional en estas lenguas. Las fronteras de morfema provienen de HornMorpho, que devuelve formas de cita; el autor las proyecta sobre la forma superficial mediante alineamiento de izquierda a derecha con un fallback de bloque contiguo más largo, y las palabras cuya proyección falla no aportan restricción (no se inventan fronteras).

La innovación clave es la doble aplicación de la restricción. Restringir solo en entrenamiento es insuficiente: una fusión legal en una palabra puede cruzar una frontera en otra, y el cumplimiento medido cae al 69,05%. Reaplicar la restricción por palabra en tiempo de codificación lo lleva al 100%. El entrenamiento es determinista, sin semilla aleatoria.

El vocabulario MoVoC conjunto (105.310 entradas) se construye con el Algoritmo 1 (s = 224.000, r = 5/7): 32.000 de BPE amárico, 32.000 de BPE tigriña, 44.104 morfemas amáricos y 8.793 morfemas tigriñas, menos 11.587 duplicados. El presupuesto de morfemas no se agotó: quedaron sin usar 35.896 huecos en amárico y 71.207 en tigriña.

## Capacidades

- Segmentación subword morfológicamente consciente para amárico y tigriña, con cumplimiento de fronteras de morfema del 100% en codificación.
- Tokenización determinista y reproducible (sin semilla aleatoria), con revisión fijable para resultados byte a byte idénticos.
- Carga directa vía `AutoTokenizer` con `subfolder="amharic"` o `subfolder="tigrinya"`, o vía `PreTrainedTokenizerFast` para evitar la búsqueda de `config.json`.
- Vocabulario morfológico conjunto reutilizable (`movoc_vocab.txt`) para construir tokenizadores multilingües de ge'ez.
- Uso offline o en entornos aislados mediante `snapshot_download` y `HF_HUB_OFFLINE=1`, o descarga a directorio local con `hf download`.
- No soporta tool calling, agentes, razonamiento multi-step, visión ni audio: es exclusivamente un tokenizador.

## Casos de uso

- Preprocesado de corpus amáricos y tigriñas para entrenar o ajustar modelos de lenguaje: sustituir el tokenizador por defecto de un modelo multilingüe por MoVoC-Tok reduce la fragmentación de palabras y preserva la estructura morfológica en la entrada.
- Traducción automática am-en y en-ti: los corpus de entrenamiento del tokenizador son precisamente los de NLLB, de modo que encaja de forma natural en pipelines de traducción de estas direcciones.
- Sistemas de búsqueda y recuperación en amárico o tigriña: una segmentación que respeta morfemas mejora la coincidencia entre variantes flexivas de una misma raíz en índices invertidos.
- Análisis morfológico y etiquetado lingüístico: las fronteras explícitas y el vocabulario de morfemas sirven como base para tareas de segmentación y anotación en lingüística computacional de lenguas etiópicas.
- Construcción de tokenizadores multilingües de ge'ez: el vocabulario conjunto de 105.310 entradas y el informe de derivación (`vocabulary_report.md`) permiten reproducir o adaptar el Algoritmo 1 a nuevos corpus.
- Despliegue en entornos con conectividad limitada o air-gapped: el repositorio se descarga una vez y se ejecuta desde caché local, algo relevante para instituciones que trabajan con estas lenguas en infraestructura restringida.
- Evaluación comparativa de tokenizadores: al ser determinista y tener revisión fijable, sirve como referencia reproducible en estudios de eficiencia de tokenización en lenguas de bajos recursos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta métricas internas del tokenizador: cumplimiento de fronteras de morfema del 69,05% con restricción solo en entrenamiento y del 100% al reaplicarla en codificación; 335.638 y 104.964 fusiones rechazadas en amárico y tigriña; y tiempos de entrenamiento de 12,6 y 13,9 minutos.

## Requisitos de hardware

- VRAM: no aplica; es un tokenizador, no un modelo neuronal, y se ejecuta en CPU.
- GPU: no requiere ninguna. Funciona en cualquier máquina capaz de ejecutar Python y `transformers`.
- GPU de consumo: irrelevante para este componente; cabe en cualquier equipo, incluidos portátiles de gama baja.
- Despliegue: `transformers` (`AutoTokenizer` o `PreTrainedTokenizerFast`), con gestión de caché vía `huggingface_hub`. No aplica a vLLM, llama.cpp, Ollama o TGI, que sirven modelos generativos.
- Latencia y throughput: no disponibles de forma publicada; al ser un tokenizador BPE en CPU, el coste dominante es el propio proceso de tokenización y no el modelo.

## Comparativa con modelos similares

| Tokenizador | Lenguas | Vocabulario | Restricción morfológica | Licencia |
|---|---|---|---|---|
| MoVoC-Tok (am) | Amárico | 32.000 | Sí (100% en codificación) | CC-BY-4.0 |
| MoVoC-Tok (ti) | Tigriña | 32.000 | Sí (100% en codificación) | CC-BY-4.0 |
| Tokenizador NLLB | Multilingüe (incluye am, ti) | 256.000 aprox. | No | CC-BY-NC-4.0 |
| BPE estándar entrenado ad hoc | Amárico / tigriña | Configurable | No | Según el corpus |

La comparación con NLLB se basa en que sus corpus (`NLLB.am-en.am`, `NLLB.en-ti.ti`) son la fuente de entrenamiento de MoVoC-Tok; no se dispone de datos de rendimiento comparativo publicados en la información disponible.

## Limitaciones y advertencias

- Solo cubre amárico y tigriña. Ge'ez y tigre son únicamente de evaluación en el artículo y no tienen checkpoint publicado.
- Este repositorio contiene exclusivamente los checkpoints de 32.000; la model card menciona checkpoints separados de 63.000 (texto truncado) que no están descritos aquí.
- Es imprescindible pasar `subfolder="amharic"` o `subfolder="tigrinya"`; sin él, la carga falla con un `ValueError` sobre `model_type`. El `config.json` de cada subcarpeta no es una configuración de modelo de `transformers`, sino el registro de ajustes de entrenamiento.
- Las fronteras de morfema dependen de HornMorpho y de una proyección superficial con fallback; las palabras cuya proyección falla no reciben restricción, por lo que la cobertura morfológica no es total.
- El presupuesto de morfemas del vocabulario conjunto quedó muy infrautilizado (35.896 huecos en amárico, 71.207 en tigriña), lo que puede limitar la cobertura morfológica del vocabulario de 105.310 entradas.
- Riesgo de sesgo y alucinación: no aplica directamente, al no generar texto; el sesgo relevante es el de los corpus NLLB empleados para entrenar el tokenizador.
- Licencia CC-BY-4.0: permite uso comercial con atribución; conviene verificar los términos de los corpus NLLB subyacentes si se redistribuyen derivados.
- Al ser un componente de preprocesado, cualquier evaluación de calidad final depende del modelo que lo use; no hay métricas de extremo a extremo publicadas en la información disponible.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Hailay/MoVoC-Tok
- Revisión fijada para reproducibilidad: `a4dfa487a40c9a9972598fb48d54067f338add72`
- Artículo asociado: *MoVoC: Morphology-Aware Subword Construction for Ge'ez Script Languages*, Findings of EMNLP 2025 (enlace directo no disponible en la información proporcionada)
- Documentación interna del repositorio: `movoc_tok_report.md` (informe de entrenamiento y notas de implementación), `vocabulary/vocabulary_report.md` (derivación del Algoritmo 1), `vocabulary/movoc_statistics.json` (composición del vocabulario)
- HornMorpho (herramienta de morfología usada para las fronteras): enlace no disponible en la información proporcionada
