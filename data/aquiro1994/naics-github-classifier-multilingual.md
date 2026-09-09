# aquiro1994/naics-github-classifier-multilingual

## Resumen

El modelo `aquiro1994/naics-github-classifier-multilingual` es un clasificador de texto desarrollado por aquiro1994 que asigna un sector industrial NAICS (North American Industry Classification System) a repositorios de GitHub. Se basa en un *encoder* BGE-M3 (que a su vez es una variante de XLM-RoBERTa) con 567.774.227 parámetros, afinado sobre 6.588 repositorios etiquetados en inglés. La salida es una de 19 clases de sector, que abarcan desde agricultura hasta servicios profesionales.

El modelo resuelve un problema práctico: clasificar automáticamente repositorios de código abierto por industria a partir de su nombre, descripción, *topics* y README. Su relevancia radica en que, frente a su versión monolingüe en inglés (`aquiro1994/naics-github-classifier`, basada en RoBERTa-large), este modelo aprovecha el vocabulario multilingüe de BGE-M3 (250.002 *tokens*, más de 100 idiomas) para transferir el conocimiento aprendido en inglés a otros idiomas mediante la representación compartida del espacio embedido. Así, puede clasificar repositorios escritos en español, francés, ruso, portugués o chino con una coherencia notable, aunque sin haber sido entrenado explícitamente con datos etiquetados en esos idiomas.

La arquitectura es un *transformer* encoder con cabeza de clasificación. El contexto útil de entrada está limitado a 512 *tokens*, por lo que la truncación es obligatoria. El modelo no es generativo; se usa mediante `pipeline` de `transformers` para clasificación de texto y produce puntuaciones calibradas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa / BGE-M3) con cabeza de clasificación |
| Parametros totales | 567.774.227 (567,8 millones) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 512 tokens (limite de los positional embeddings; la truncacion es obligatoria) |
| Tipos de cuantizacion | No disponible (solo safetensors; no hay cuantizaciones GGUF publicadas) |
| Idiomas soportados | Multilingue (vocabulario de 250.002 tokens, mas de 100 idiomas; idiomas declarados: en, es, fr, pt, ru, zh) |
| Licencia | MIT |
| Formato de pesos | Safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo parte de BAAI/bge-m3, un *encoder* multilingüe de tipo XLM-RoBERTa con 568 millones de parámetros. Sobre esta base se añade una cabeza de clasificación lineal que produce 19 clases NAICS. Los pesos del *encoder* se afinan con la misma receta de entrenamiento que el modelo monolingüe `aquiro1994/naics-github-classifier`, que usa RoBERTa-large y es exclusivamente en inglés. Los datos de entrenamiento son 6.588 repositorios de GitHub etiquetados manualmente en inglés, con texto limpio que combina nombre, descripción, *topics* y README.

El proceso de limpieza del texto es determinista y afecta al rendimiento: se eliminan *badges*, cabeceras de licencia, *markdown* y espacios en blanco; las URLs se reducen a su dominio. Además, todo el contenido posterior a la primera aparición de `pip install`, `npm install` o `git clone` se elimina, y los bloques de código que quedan dentro de los *fences* sobreviven al proceso. Este comportamiento es "load-bearing" porque el modelo fue entrenado con él, y cambiarlo sin nuevo entrenamiento degradaría la calidad. No se menciona RLHF, DPO ni ningún otro ajuste por preferencias.

## Capacidades

- Clasificación de repositorios de GitHub en 19 sectores NAICS a partir de nombre, descripción, *topics* y README.
- Clasificación multilingüe mediante transferencia cross-lingual: funciona sobre textos en los que el vocabulario de BGE-M3 tiene representaciones compartidas, aunque los datos de entrenamiento sean solo ingleses.
- Salidas de probabilidad calibradas: el modelo viene calibrado (T = 1,04, ECE = 0,028), por lo que un umbral de `score >= 0.8` retiene el 81,8% del conjunto de test y clasifica correctamente el 92,6% de lo que conserva.
- No soporta generación de texto, tool calling, agentes ni razonamiento multi-paso; es un clasificador de secuencia simple.
- No tiene capacidades de visión ni de audio.

## Casos de uso

- Análisis de tendencias en código abierto: un observatorio o consultora puede clasificar decenas de miles de repositorios de GitHub por sector NAICS para detectar qué industrias crecen más. El modelo procesa el nombre, descripción, *topics* y README de cada repositorio, y con un umbral alto (por ejemplo, `score >= 0.8`) puede filtrar automáticamente los casos ambiguos.
- Curación de datasets para investigación: al entrenar modelos sobre código o documentación, es útil segmentar por sector industrial. Este clasificador permite pre-etiquetar un corpus de repositorios y descartar ejemplos de dominios irrelevantes para el estudio.
- Inteligencia competitiva en empresas: una organización puede monitorizar repositorios de competidores identificando a qué sector industrial pertenecen. El modelo genera una etiqueta NAICS por repositorio, lo que facilita el seguimiento de la actividad de empresas en sectores concretos.
- Enriquecimiento de motores de búsqueda de código: plataformas como una versión interna de GitHub o un buscador de paquetes pueden añadir un campo "sector NAICS" a cada repositorio indexado. La ventaja de este modelo es que funciona en repositorios multilingües, donde el clasificador monolingüe en inglés falla.
- Análisis de ecosistemas multilingües: para evaluar la adopción de tecnologías en España, Francia, Rusia, Brasil o China, se puede clasificar repositorios directamente en su idioma original. El modelo obtiene un acuerdo del 73% entre la lectura multilingüe y la traducción al inglés, mucho mejor que el 19% del modelo monolingüe.
- Automatización de pipelines de datos internos: integrado en un CI/CD, el modelo etiqueta automáticamente los repositorios de una organización según su sector. Al ser compatible con `transformers` y `endpoints`, se puede desplegar como servicio HTTP y consumir desde un script de ingesta.
- Clasificación de documentación técnica de clientes: si un proveedor recibe documentación o READMEs de proyectos en varios idiomas, puede usar este modelo para segmentar el contenido por industria antes de su análisis o traducción.

## Benchmarks y rendimiento

Según los datos de la model card, el conjunto de test tiene 1.318 filas. Las métricas principales son:

| Metrica | Valor |
|---|---|
| Precisión (test accuracy) | 86,95% |
| F1 ponderado | 86,39% |
| F1 macro | 83,06% |
| Acuerdo entre lecturas multilingües (n=93) | 73% |
| Calibración (T) | 1,04 |
| Error de calibración esperado (ECE) | 0,028 |

Comparación con el modelo monolingüe `aquiro1994/naics-github-classifier` (RoBERTa-large, 355M):

| Metrica | Este modelo (BGE-M3) | RoBERTa-large |
|---|---|---|
| Precisión | 86,95% | 86,72% |
| F1 ponderado | 86,39% | 86,33% |
| F1 macro | 83,06% | 82,95% |
| Acuerdo entre lecturas multilingües | 73% | 19% |

El desglose del acuerdo entre la lectura en el idioma original y una traducción al inglés, sobre 93 repositorios no ingleses, es el siguiente:

| Idioma | FR (31) | ES (28) | RU (14) | PT (11) | ZH (9) | Todos (93) |
|---|---:|---:|---:|---:|---:|---:|
| Este modelo | 84% | 57% | 79% | 91% | 56% | 73% |
| RoBERTa-large | 16% | 11% | 21% | 18% | 56% | 19% |

En texto inglés, ambos modelos son estadísticamente indistinguibles: la diferencia de 0,23 puntos en precisión está dentro del ruido de ejecución. El autor advierte que el acuerdo entre idiomas no es precisión y que la cifra puede variar con una segunda ejecución de entrenamiento.

## Requisitos de hardware

- VRAM estimada: 567,8 millones de parámetros en FP32 ocupan aproximadamente 2,27 GB. El repositorio pesa 2,3 GB, coherente con pesos en FP32. En FP16, la inferencia requiere unos 1,14 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM puede ejecutar el modelo en FP32. Son adecuadas RTX 3060, RTX 4060, T4 o A10. No se requiere una GPU de centro de datos.
- Sí cabe en GPU de consumo desde 4 GB, aunque se recomienda 8 GB para procesar lotes de textos largos sin problema.
- Opciones de despliegue: `pipeline` de `transformers` en Python, servicios de inferencia compatibles con Hugging Face (`endpoints_compatible`). No es un modelo generativo, por lo que no aplican opciones como vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | Idiomas | Licencia | Uso |
|---|---|---|---|---|---|---|
| aquiro1994/naics-github-classifier-multilingual | BGE-M3 (XLM-RoBERTa) | 567,8 M | 512 tokens | Multilingue (en, es, fr, pt, ru, zh) | MIT | Clasificacion NAICS |
| aquiro1994/naics-github-classifier | RoBERTa-large | 355 M | 512 tokens | Ingles | MIT | Clasificacion NAICS |
| BAAI/bge-m3 | BGE-M3 (XLM-RoBERTa) | 568 M | No disponible | Multilingue | MIT | Embeddings |

El modelo multilingüe es la opción recomendada por su autor cuando el corpus de repositorios no es completamente inglés. El modelo monolingüe es más ligero y rápido para textos en inglés, con un rendimiento equivalente.

## Limitaciones y advertencias

- Los datos de entrenamiento son exclusivamente en inglés; el modelo lee otros idiomas mediante transferencia cross-lingual, no por haber sido entrenado con datos etiquetados en esos idiomas.
- El acuerdo entre la clasificación en el idioma original y la traducción al inglés es del 73%, por lo que en repositorios no ingleses un porcentaje relevante de predicciones puede diferir según la lengua de entrada. Esta cifra no mide precisión y puede variar entre ejecuciones de entrenamiento (un segundo run obtuvo 81% de acuerdo).
- El rendimiento es desigual entre idiomas: el acuerdo es del 57% en español y 56% en chino, frente al 91% en portugués o 84% en francés. Esto implica que los repositorios en español y chino pueden resultar más difíciles de clasificar de forma consistente.
- El texto debe construirse con la función de limpieza del paquete `naics-github-train`; si se ensambla a mano el prompt, el modelo recibe *markdown* crudo no visto durante el entrenamiento y la calidad se degrada.
- `truncation=True` es obligatorio. Entradas de más de 512 *tokens* provocan un error en `transformers` porque el índice del *positional embedding* queda fuera de límites.
- La clasificación se limita a 19 sectores NAICS, un subconjunto del sistema completo. El modelo no puede distinguir códigos dentro de un mismo sector, como por ejemplo los distintos subsectores de manufactura.
- No es un modelo generativo ni de *embedding* de propósito general: solo produce una etiqueta de 19 clases.
- La licencia MIT permite uso comercial libre, pero no se ofrecen garantías sobre el mantenimiento del modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aquiro1994/naics-github-classifier-multilingual
- Modelo monolingüe en inglés: https://huggingface.co/aquiro1994/naics-github-classifier
- Repositorio de entrenamiento y limpieza de texto: https://github.com/alexanderquispe/naics-github-train
- Modelo base BGE-M3: https://huggingface.co/BAAI/bge-m3
