# mstrasser/jeff-adapter-equivalent

## Resumen

`mstrasser/jeff-adapter-equivalent` es un adaptador LoRA (PEFT) para el modelo base `mstrasser/jeff-base` v1.4, un modelo de decisión pequeño y abierto que, según la model card, es un fine-tune de Qwen3.5-0.8B. El adaptador está especializado en una única tarea: comprobar si dos elementos (registros, afirmaciones, valores, listados) tienen el mismo significado dentro de un ámbito definido, devolviendo una de tres etiquetas (`yes`, `no`, `unclear`) junto con una probabilidad calibrada por opción.

El modelo no genera texto libre para parsear, sino que produce una distribución de probabilidad sobre las opciones en un único forward pass, lo que reduce la latencia y facilita la integración en pipelines deterministas. Está orientado a casos de deduplicación, comparación de registros y validación de equivalencia semántica, con soporte explícito para diferencias de redacción, unidades y formato.

La relevancia actual radica en su enfoque de "modelo de decisión" con calibración publicada: el autor reporta precisión del 98,4 % en respuestas confiables con cobertura del 100 % sobre un conjunto de calibración de 2.000 filas, lo que lo hace atractivo para tareas de clasificación binaria/triple en producción donde se necesita una medida de confianza explícita. El modelo es de tamaño reducido (base de 0,8B), lo que permite despliegue local en hardware modesto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen3.5-0.8B según model card) con adaptador LoRA (PEFT) |
| Parametros totales | no disponible (base descrito como 0,8B; el adaptador LoRA añade parámetros no cuantificados en la información) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se monta sobre `mstrasser/jeff-base` v1.4, descrito en la model card como un fine-tune de Qwen3.5-0.8B. Se trata, por tanto, de un transformer decoder-only de pequeño tamaño al que se le aplica un adaptador LoRA para especializarlo en la tarea de equivalencia semántica. El motor de Jeff rechaza adaptadores entrenados sobre otra revisión del base, de modo que este adaptador solo carga sobre la revisión `v1.4`.

El adaptador fue entrenado el 2026-10-25 según la model card. No se detalla el número de tokens de entrenamiento ni la composición exacta del dataset, aunque se menciona que existe un "generador" interno que produjo datos de entrenamiento y tests in-house. La innovación técnica destacable es el enfoque de decisión calibrada: en lugar de generar texto, el modelo devuelve una probabilidad por etiqueta en un solo forward pass, con un umbral de confianza (0,499) a partir del cual una respuesta se considera "confident". No se documenta en la información disponible si hubo RLHF, DPO u otras etapas de alineamiento.

## Capacidades

- Clasificación de equivalencia semántica entre dos ítems (`item_a` e `item_b`) dentro de un `scope` declarado, devolviendo `yes`, `no` o `unclear`.
- Decisión calibrada: cada llamada devuelve un valor de etiqueta y una confianza numérica, con umbral de calibración publicado.
- Manejo de diferencias de redacción, orden (cuando el orden no importa), unidades y formato entre los dos ítems comparados.
- Detección de ambigüedad: emite `unclear` cuando la equivalencia depende de información que ninguno de los ítems resuelve (por ejemplo, fechas o números sin unidad).
- Contexto de llamada estructurado: `setting` (quién pregunta), `scope` (qué detalles cuentan), `item_a` (contexto) e `item_b` (entrada).
- Integración vía SDK Python (`jeff.Jeff.local` y `jeff.Jeff.remote`) y vía API HTTP (`/v1/decide`).
- No soporta generación de texto, tool calling, agentes multi-paso, visión ni audio según la información disponible.
- Capacidad multilingüe limitada al inglés (`en`).

## Casos de uso

- Deduplicación de registros de producto: comparar listados de proveedores distintos (título, autor, formato, páginas, año) para decidir si son la misma edición antes de fusionar duplicados; el `scope` permite fijar qué campos cuentan y el modelo tolera diferencias de formato como "312 pages" frente a "312 pp.".
- Validación de extracción de datos: verificar que un valor extraído por un OCR o un parser (por ejemplo, una fecha o un importe) coincide semánticamente con el valor de referencia, usando `unclear` para marcar casos ambiguos y derivarlos a revisión humana.
- Conciliación de facturas y albaranes: comparar líneas de documentos con redacciones distintas (unidades, abreviaturas, orden de tokens) y obtener una probabilidad calibrada para automatizar la conciliación con umbral de confianza configurable.
- Normalización de catálogos bibliográficos: comprobar equivalencia entre fichas MARC, registros de editoriales y metadatos de tiendas, tal como ilustra el ejemplo de la model card con dos listados del mismo libro.
- Verificación de reglas y políticas: comparar una regla escrita en dos redacciones (por ejemplo, una política interna y su versión resumida) para confirmar que no se ha alterado ningún detalle relevante bajo un `scope` dado.
- Control de calidad en pipelines de datos: como paso de validación en ETL, marcar pares de registros como equivalentes, no equivalentes o inciertos antes de aplicar transformaciones o merges, aprovechando que no hay texto generado que parsear.
- Moderación de duplicados en foros o tickets: detectar si dos mensajes o incidencias describen el mismo problema con palabras distintas, con la etiqueta `unclear` actuando como cola de revisión manual.

## Benchmarks y rendimiento

Datos reportados en la model card del autor:

| Test | Filas | Accuracy |
|---|---:|---:|
| PAWS (benchmark público de paráfrasis) | 1.000 | 93,4 % |
| Test interno (generador) | 2.000 | 98,5 % |
| Test interno en dominios no vistos en entrenamiento (generador) | 1.931 | 97,8 % |

Calibración (función `equivalent`, umbral 0,499, 2.000 filas de calibración):

| Función | Umbral | Precisión | Cobertura |
|---|---:|---:|---:|
| `equivalent` | 0,499 | 98,4 % | 100,0 % |

Nota: el propio autor advierte que los tests de tipo "generator" miden menos que un test público o real, por lo que la cifra de PAWS (93,4 %) es la referencia más fiable para comparación externa. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; al tratarse de un base de 0,8B más un adaptador LoRA, la huella es reducida y compatible con GPUs de consumo, aunque no se publican cifras concretas.
- GPU recomendadas: no disponible en la información; por tamaño del base, cabría esperar funcionamiento en GPUs consumer (RTX 3060/4060 en adelante) y en GPUs de datacenter (A100, H100) sin problema, pero el autor no lo especifica.
- Cabe en GPU consumer: previsiblemente sí, dado el tamaño del base (0,8B), aunque no se confirma en la documentación.
- Opciones de despliegue: motor propio de Jeff (paquetes `jeff` desde GitHub; pendientes de publicación en PyPI según la model card), SDK Python local (`jeff.Jeff.local`) y API remota (`https://api.jeffhub.ai`). No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; la model card destaca que la decisión se obtiene en un único forward pass sin generación de texto, lo que reduce latencia frente a enfoques generativos, pero sin cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `mstrasser/jeff-adapter-equivalent` | base 0,8B + LoRA | no disponible | Clasificación de equivalencia semántica (3 clases) | Apache 2.0 | Hugging Face + API Jeff |
| `mstrasser/jeff-base` v1.4 | 0,8B (fine-tune de Qwen3.5-0.8B) | no disponible | Modelo de decisión base para adaptadores Jeff | no disponible en la información | Hugging Face |
| Modelos de paráfrasis tipo PAWS (p. ej. fine-tunes de RoBERTa) | ~0,1–0,4B | 512 tokens típicamente | Clasificación de paráfrasis binaria | variable | Hugging Face |
| LLM generativos pequeños (p. ej. Qwen3.5-0.8B) | 0,8B | no disponible | Generación de texto general | variable | Hugging Face |

La comparación con modelos de paráfrasis es aproximada: PAWS es el único benchmark público reportado y el adaptador Jeff emite tres clases con calibración, mientras que los modelos PAWS clásicos suelen ser binarios y sin calibración publicada. No se dispone de datos de benchmarks comparativos directos con alternativas en la información proporcionada.

## Limitaciones y advertencias

- Solo inglés: el modelo está etiquetado únicamente para `en`; no hay evidencia de rendimiento en castellano u otros idiomas.
- Tarea única: únicamente comprueba equivalencia; no determina qué ítem es mejor o más completo, ni genera explicaciones.
- Riesgo de ambigüedad no capturada: la etiqueta `unclear` solo se emite cuando la ambigüedad depende de algo que ninguno de los ítems resuelve; ambigüedades resueltas implícitamente por el `scope` pueden producir decisiones erróneas.
- Dependencia estricta del base: el adaptador solo carga sobre `mstrasser/jeff-base` en la revisión `v1.4`; el motor rechaza otras revisiones, lo que limita la portabilidad.
- Calibración dependiente del dominio: el umbral de 0,499 y la precisión del 98,4 % se midieron sobre un conjunto de calibración de 2.000 filas generado internamente; el rendimiento puede degradarse en dominios muy distintos.
- Tests internos generados por el mismo generador que los datos de entrenamiento: el propio autor advierte que estas cifras sobreestiman el rendimiento frente a tests públicos o reales.
- Sesgos: no se documentan sesgos conocidos en la información disponible.
- Riesgo de alucinación: al no generar texto libre, el riesgo de alucinación textual es bajo, pero puede haber falsos positivos/negativos en la clasificación.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base (`jeff-base`) y de Qwen3.5-0.8B, que no se detallan en la información disponible.
- Madurez: el repositorio no tiene descargas ni likes en el momento de la consulta, y los paquetes del SDK aún no están en PyPI según la model card; para producción conviene evaluar estabilidad del ecosistema Jeff.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mstrasser/jeff-adapter-equivalent
- Modelo base: https://huggingface.co/mstrasser/jeff-base
- Página de catálogo del adaptador: https://jeffhub.ai/catalogue/jeff.reasoning.equivalent
- Repositorio de código, servidor y SDKs: https://github.com/firelex/jeff
- Guía de instalación del SDK: https://jeffhub.ai/docs/sdk/install
- API remota: https://api.jeffhub.ai
- Benchmark PAWS (referencia pública citada): no se proporciona enlace en la información disponible
