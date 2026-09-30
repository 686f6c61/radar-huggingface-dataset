# mdagosta/waldito-python-basics-v1-r0000-merge

## Resumen

El modelo `mdagosta/waldito-python-basics-v1-r0000-merge` es un modelo de lenguaje causal de tipo decoder-only publicado por el usuario mdagosta en Hugging Face, con 9.541.632 parámetros reales (confirmados por el inventario de safetensors). Utiliza la arquitectura Llama estándar de la librería Transformers y el tokenizador de bytes «schema-1» del proyecto OpenWALDO, que requiere cargarse con `trust_remote_code=True`. El repositorio se presenta como un «OpenWALDO model export», con ficheros `BOM.json` y `EU-BOM.json` que inventarían los artefactos de la release y el mapeo de divulgación de contenido de entrenamiento exigido por el reglamento europeo de IA (GPAI).

Por el nombre y la nomenclatura del repositorio (`python-basics-v1`, `r0000`, `merge`), todo apunta a un experimento de ajuste fino sobre conceptos básicos de Python y posterior fusión (merge) de checkpoints, aunque la model card no documenta ni el procedimiento de fusión, ni el dataset, ni el número de tokens de entrenamiento. No se declaran licencia, idiomas soportados ni longitud de contexto.

Se trata, por tanto, de un modelo de investigación de escala muy reducida (menos de 10 millones de parámetros), relevante como banco de pruebas para experimentos de merging, para validar el tokenizador de bytes de OpenWALDO y para probar infraestructura de inferencia con coste prácticamente nulo. No es un modelo orientado a producción ni a tareas de razonamiento complejo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only, arquitectura Llama de Transformers |
| Parámetros totales | 9.541.632 |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (el repositorio solo publica pesos safetensors; no se ofrecen variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tokenizador | byte tokenizer «schema-1» de OpenWALDO, requiere `trust_remote_code=True` |
| Pipeline declarado | text-generation |
| Tamaño del repositorio | 0,0 GB (según la información de HuggingFace) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es la de un transformer causal decoder-only con la implementación Llama estándar de la librería Transformers, tal y como declara la propia model card («standard Transformers Llama causal-language-model architecture»). El elemento diferencial no está en el bloque transformer, sino en la capa de tokenización: emplea el tokenizador de bytes «schema-1» de OpenWALDO, lo que implica que la tokenización opera a nivel de byte y que el código del tokenizador debe cargarse con `trust_remote_code=True`. El repositorio incluye además un `BOM.json` con el inventario de todos los ficheros de la release y un `EU-BOM.json` con el mapeo de divulgación de contenido de entrenamiento del reglamento europeo de IA.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre si se aplicaron técnicas de alineación como RLHF, DPO o SFT. El sufijo `merge` del identificador sugiere que el checkpoint final procede de una fusión de pesos (una técnica habitual con PEFT o con utilidades de model merging que combina varios checkpoints preentrenados o ajustados sin entrenamiento adicional), pero la model card no describe el método, el número de modelos combinados ni los coeficientes empleados. Tampoco se documentan innovaciones técnicas como decodificación especulativa, atención lineal o variantes híbridas SSM.

## Capacidades

- Generación de texto causal en modo decoder-only, con pipeline declarado `text-generation`.
- Formato conversacional: la etiqueta `conversational` indica que el repositorio está preparado para plantillas de diálogo, aunque no se detalla la plantilla concreta.
- Procesamiento a nivel de byte: al usar un tokenizador de bytes, puede representar cualquier secuencia de bytes, incluidos fragmentos de código o texto con caracteres poco frecuentes, sin depender de un vocabulario cerrado de subpalabras.
- Ajuste temático aparente hacia «python-basics» según el nombre del repositorio, aunque no hay evidencia publicada de su rendimiento real en código Python.
- Compatibilidad declarada con text-generation-inference y con endpoints compatibles (`endpoints_compatible`), lo que permite desplegarlo con el stack estándar de inferencia.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking, visión, audio): no disponible; no se declara ninguna.

## Casos de uso

- Banco de pruebas para experimentos de model merging: dado su tamaño mínimo (9,5 M de parámetros), permite iterar recetas de fusión de pesos (lineal, SVD, TIES, DARE) en minutos y en CPU, comparando el efecto de cada configuración antes de escalar a modelos grandes.
- Validación del tokenizador de bytes de OpenWALDO: sirve para probar de extremo a extremo la carga con `trust_remote_code=True`, la codificación/decodificación de bytes y la integración del tokenizador en pipelines de Transformers.
- Pruebas de humo (smoke tests) en CI/CD de infraestructura de inferencia: al ocupar menos de 40 MB en precisión completa, se puede levantar un servidor de text-generation-inference o de Transformers en cualquier runner para verificar que el pipeline, las plantillas de chat y los endpoints responden correctamente antes de desplegar modelos mayores.
- Material docente sobre ajuste fino y fusión de modelos: es lo bastante pequeño para que un estudiante lo entrene o lo fusione en un portátil, y lo bastante realista (arquitectura Llama, safetensors, BOM) para ilustrar el ciclo completo de publicación de un modelo.
- Investigación sobre trazabilidad y cumplimiento normativo: los ficheros `BOM.json` y `EU-BOM.json` lo convierten en un ejemplo práctico para estudiar cómo se documenta el inventario de artefactos y la divulgación de contenido de entrenamiento exigida a los modelos de propósito general en la UE.
- Despliegue en entornos con recursos extremadamente limitados: con menos de 20 MB en FP16 puede ejecutarse en CPU, en una Raspberry Pi o incluso embebido, lo que permite validar cadenas de inferencia completas (carga, tokenización, generación, streaming) sin GPU.
- Experimentos de destilación o de modelos «juguete» para comparar curvas de escalado: al tener un tamaño conocido y exacto, resulta útil como punto de referencia en estudios sobre relación entre parámetros, tokens y calidad de generación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio registra 0 descargas y 0 likes, no incluye tabla de evaluaciones y la model card no menciona MMLU, HumanEval, GSM8K ni ninguna otra métrica.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 19 MB con pesos en FP16/BF16 (9.541.632 parámetros × 2 bytes) y unos 38 MB con pesos en FP32. Añadiendo activaciones y overhead del runtime, el consumo total se mantiene por debajo de los 100 MB de memoria en la mayoría de configuraciones.
- GPU recomendadas: cualquiera, ya que no requiere GPU. Cabe holgadamente en una GTX 1050, una RTX 3060 o incluso en GPUs integradas.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo actual e incluso en GPUs antiguas o integradas.
- Cabe en CPU: sí, con holgura; es viable en CPU de escritorio, en placas tipo Raspberry Pi y en entornos embebidos.
- Opciones de despliegue: Transformers (librería declarada), text-generation-inference (etiqueta explícita) y endpoints compatibles. No se documentan pesos GGUF, por lo que llama.cpp u Ollama requerirían una conversión previa y la adaptación del tokenizador de bytes con código remoto.
- Latencia y throughput estimados: no disponible. Dado el tamaño, la latencia estará dominada por el overhead de carga del modelo y del tokenizador más que por el coste de cómputo.

## Comparativa con modelos similares

No hay datos de benchmarks ni de licencia en la información disponible que permitan una comparación rigurosa. Como referencia de categoría (modelos densos de menos de 50 millones de parámetros entrenados para generación de texto), la tabla siguiente recoge la comparación con alternativas conocidas; los datos de los modelos comparados no provienen de la información proporcionada y deben verificarse en sus respectivas fichas.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| mdagosta/waldito-python-basics-v1-r0000-merge | 9.541.632 | no disponible | no disponible | Hugging Face, safetensors |
| Familia TinyStories (1M–33M) | 1 M – 33 M | no verificado en la información disponible | no verificado | Hugging Face |
| Pythia-14M | 14 M | no verificado en la información disponible | no verificado | Hugging Face |
| SmolLM-135M | 135 M | no verificado en la información disponible | no verificado | Hugging Face |

## Limitaciones y advertencias

- Tamaño muy reducido: con 9,5 millones de parámetros, la capacidad de razonamiento, de coherencia a largo plazo y de conocimiento factual es extremadamente limitada. No es adecuado para tareas de producción que exijan fiabilidad.
- Sesgos conocidos: no disponible. No se documenta la composición del dataset de entrenamiento ni se han realizado evaluaciones de sesgo.
- Riesgo de alucinación: previsiblemente alto, como en cualquier modelo de esta escala, y no cuantificado por el autor.
- Limitaciones de contexto e idioma: ni la longitud de contexto ni los idiomas soportados están declarados, lo que impide garantizar un comportamiento correcto fuera de las condiciones de entrenamiento.
- Tokenizador con código remoto: la carga requiere `trust_remote_code=True`, lo que implica ejecutar código Python proporcionado por el repositorio. Es un riesgo de seguridad que debe evaluarse antes de usarlo en entornos no controlados.
- Licencia no declarada: al no especificarse licencia, no hay autorización explícita para uso comercial ni para redistribución. Cualquier uso en producción debería aclararse previamente con el autor.
- Ausencia de evaluación: 0 descargas y 0 likes, sin benchmarks ni métricas publicadas; no hay evidencia independiente de su calidad.
- Fechas del repositorio: la información de Hugging Face indica creación y actualización el 2026-09-30, una fecha posterior a la actual, lo que sugiere un posible error de metadatos o una publicación programada. Conviene verificarlo.
- Repositorio de 0,0 GB: el tamaño reportado no concuerda con el número de parámetros declarado, lo que puede indicar que los pesos no están efectivamente subidos o que la métrica no se ha actualizado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mdagosta/waldito-python-basics-v1-r0000-merge
- Documentación de model merging de PEFT: https://huggingface.co/docs/peft/v0.15.0/developer_guides/model_merging
- Repositorio de ejemplo de recetas de fusión de modelos: https://github.com/sudipta002/model-merge-recipe
- Curso abierto zero-to-ai (material de contexto sobre LLM, fine-tuning y MLOps): https://github.com/PavanMudigonda/zero-to-ai
- Ficheros citados en la model card, dentro del propio repositorio: `BOM.json` y `EU-BOM.json` (resolubles en la ruta `blob/main/` del repositorio anterior)
- Paper, blog o demo oficial del proyecto OpenWALDO: no disponible en la información proporcionada
