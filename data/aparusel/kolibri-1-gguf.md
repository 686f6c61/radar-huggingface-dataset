# aparusel/kolibri-1-gguf

## Resumen

Kolibri-1 GGUF es una conversión comunitaria a formato GGUF de los pesos de Aleph-Alpha/Kolibri-1, un modelo de razonamiento de tipo Mixture of Experts (MoE) desarrollado por Aleph Alpha GmbH. El modelo original cuenta con 78,10 mil millones de parámetros totales y 3,46 mil millones de parámetros activos por token, lo que lo convierte en un modelo disperso de gran tamaño pero bajo coste de cómputo por inferencia. Esta repositorio, publicado por el usuario aparusel, redistribuye tres cuantizaciones (Q8, Q4 y Q2) bajo la misma licencia Apache 2.0 del modelo original.

La particularidad técnica de esta conversión es que no emplea el formato GGUF estándar de llama.cpp, sino el formato propietario del motor DwarfStar (`ds4`), desarrollado en el repositorio antirez/ds4. Los ficheros solo cargan con dicho motor, en sus backends Metal o CPU de referencia, y no son compatibles con llama.cpp, Ollama, vLLM ni TGI. Está pensado para ejecutar un modelo MoE de gran tamaño en hardware de consumo o estaciones de trabajo sin GPU dedicada de gama alta, a costa de un ecosistema de despliegue mucho más restringido.

El modelo base está orientado a razonamiento y uso de herramientas (tool calling), con soporte nativo de alemán e inglés, y viene con el modo de pensamiento (thinking) activado por defecto. La relevancia actual radica en que Aleph Alpha liberó los pesos completos bajo Apache 2.0, lo que permite redistribuciones comunitarias como esta, aunque la conversión no está afiliada ni respaldada por Aleph Alpha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) dispersa, tipo transformer |
| Parametros totales | 78,10 mil millones (78.10B) |
| Parametros activos | 3,46 mil millones (3.46B) |
| Longitud de contexto | no disponible en la informacion (el ejemplo de despliegue usa `--ctx 32768`, pero no se especifica el maximo del modelo) |
| Tipos de cuantizacion | Q8_0, Q4_K, IQ2_XXS / Q2_K (tres artefactos: Q8, Q4 y Q2) |
| Idiomas soportados | aleman (de) e ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF en formato DwarfStar (`ds4`), no compatible con llama.cpp generico |

Detalle de los artefactos publicados:

| Fichero | Expertos enrutados | Atencion / compartidos / salida | Tamano | SHA-256 |
|---|---|---:|---:|---|
| `Kolibri-1-Q8.gguf` | Q8_0 | Q8_0, normas/router F32 | 77,42 GiB | `e33fb57c3ea7dfba7692e9a7055632cebf96625e1753d1b900e73db0ee6a03d8` |
| `Kolibri-1-Q4.gguf` | Q4_K | Q8_0, embedding F16, normas/router F32 | 42,56 GiB | `0b3d5bf9ae13b467be4fa4c8f63208a2fd837577d6ec2e1c636cbf185aa26930` |
| `Kolibri-1-Q2.gguf` | IQ2_XXS gate/up, Q2_K down | Q8_0, embedding F16, normas/router F32 | 22,78 GiB | `5aa002fc9c852a91fc47b3aaa04717dfb6d30001fcc1b85a33bbfe9cfa19cdb5` |

## Arquitectura y entrenamiento

El modelo base Kolibri-1 es un modelo de lenguaje disperso de tipo Mixture of Experts con 78,10 mil millones de parametros totales de los que solo 3,46 mil millones se activan por token. Aleph Alpha lo describe como un modelo de razonamiento para aleman e ingles. No se dispone en la informacion proporcionada de detalles sobre el numero de capas, el numero de expertos por capa, la dimension del estado oculto ni la estrategia de enrutamiento. Tampoco se especifica el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF, DPO u otras fases de alineamiento.

La innovacion destacable de esta publicacion no esta en el modelo, sino en el proceso de conversion. El autor ha convertido los pesos desde la version FP8 original (revision `e52eb4627d11516b0c01de49210ab5a4e4061444`) usando la herramienta `kolibri1_quantize.py` del proyecto DwarfStar. La cuantizacion es quirurgica: cada tensor publicado debe reclamarse exactamente una vez y solo se acepta el snapshot de origen que coincide exactamente con el plan de conversion, lo que justifica que la revision este fijada (pinned). La variante Q2 se genero con un bootstrap de energia de pesos al no disponer de matriz de importancia (imatrix). Cada artefacto puede auditarse con `kolibri1_validate_gguf.py --payload`.

## Capacidades

- Generacion de texto y razonamiento en aleman e ingles.
- Modo de pensamiento (thinking) activado por defecto, con niveles de esfuerzo bajo, medio y alto seleccionables mediante `--think-level N`.
- Soporte de tool calling / function calling (declarado en las etiquetas del repositorio).
- Perfil de modelo de razonamiento multi-paso orientado a agentes.
- Parametros de muestreo por defecto: temperatura 1, top-p 0,97, top-k 128.
- No se documentan capacidades de vision, audio ni multimodalidad; el motor DwarfStar indica explicitamente que vision no esta soportada para este modelo.

## Casos de uso

- Razonamiento y analisis en aleman: el modelo esta optimizado para aleman e ingles, por lo que resulta adecuado para tareas de sintesis, clasificacion o extraccion de informacion en corpus germanoparlantes donde otros modelos abiertos rinden peor.
- Agentes con uso de herramientas: gracias al soporte de tool calling, puede integrarse en flujos que consulten APIs, bases de datos o calculadoras, con el modelo decidiendo que herramienta invocar en cada paso.
- Asistentes de codigo con razonamiento explicito: activando el modo thinking puede descomponer problemas de programacion en pasos, aunque no se han publicado resultados de HumanEval ni similares que permitan cuantificar su rendimiento real en esta tarea.
- Despliegue local en estaciones de trabajo Apple Silicon: las variantes Q4 y Q2 caben en equipos con memoria unificada considerable y se ejecutan sobre Metal, lo que permite tener un MoE de 78B sin GPU dedicada.
- Procesamiento por lotes en CPU: el backend de referencia (`ds4 --cpu`) permite ejecutar inferencias sin acelerador, util para entornos aislados o sin acceso a GPUs.
- Investigacion en cuantizacion: los tres artefactos (Q8, Q4, Q2) permiten comparar el impacto de la precision en un mismo MoE, ya que el proceso de conversion esta documentado y es auditable.
- Prototipado soberano en la UE: al ser pesos Apache 2.0 de un fabricante europeo, encaja en proyectos que requieren trazabilidad y licencia permisiva sin dependencia de proveedores estadounidenses.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada por variante (solo pesos, sin cache KV): Q8 unos 77,42 GiB; Q4 unos 42,56 GiB; Q2 unos 22,78 GiB. Hay que sumar la memoria de la cache KV segun la longitud de contexto configurada.
- Backends soportados: Metal (Apple Silicon) y CPU de referencia (`ds4 --cpu`). No se soportan CUDA, ROCm, paralelismo de tensor o pipeline, streaming desde SSD, decodificacion especulativa ni vision para este modelo.
- GPU: no aplica en la configuracion documentada, ya que el motor `ds4` no ofrece backend CUDA/ROCm para Kolibri-1. El despliegue previsto es sobre Apple Silicon (Metal) o CPU.
- Consumer GPU: no es un escenario soportado por esta conversion. Las alternativas de ejecucion pasan por memoria unificada de equipos Apple o por RAM de sistema en CPU.
- Opciones de despliegue: exclusivamente el motor DwarfStar (`ds4` para CLI y `ds4-server` para servidor). No es compatible con llama.cpp, Ollama, vLLM ni TGI.
- Latencia y throughput: no disponible en la informacion proporcionada.
- Orden de preferencia recomendado por el autor: Q8 (mas cercano al release original), Q4 (buen equilibrio calidad/tamano) y Q2 (el mas pequeno).

## Comparativa con modelos similares

La informacion proporcionada no incluye datos de rendimiento ni de modelos alternativos comparables con cifras verificables. La comparacion se limita a las tres variantes de cuantizacion del propio repositorio y al modelo base.

| Modelo | Parametros totales | Parametros activos | Formato | Tamano | Licencia | Motor |
|---|---:|---:|---|---:|---|---|
| Kolibri-1 Q8 (esta repo) | 78,10B | 3,46B | GGUF (ds4) | 77,42 GiB | Apache 2.0 | ds4 |
| Kolibri-1 Q4 (esta repo) | 78,10B | 3,46B | GGUF (ds4) | 42,56 GiB | Apache 2.0 | ds4 |
| Kolibri-1 Q2 (esta repo) | 78,10B | 3,46B | GGUF (ds4) | 22,78 GiB | Apache 2.0 | ds4 |
| Aleph-Alpha/Kolibri-1 (base) | 78,10B | 3,46B | FP8 (safetensors) | no disponible | Apache 2.0 | ecosistema HF |

Alternativas de otros fabricantes: no disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Compatibilidad restringida: estos GGUF no son archivos GGUF genericos; solo cargan con el motor DwarfStar (`ds4`). No funcionan con llama.cpp, Ollama, vLLM ni TGI.
- Sin soporte CUDA ni ROCm para este modelo, lo que limita el despliegue a Metal o CPU.
- Idiomas: solo aleman e ingles. No se garantiza un comportamiento fiable en castellano u otros idiomas.
- La variante Q2 puede degradar la calidad de forma notable respecto a Q8, especialmente por haberse cuantizado sin imatrix (bootstrap de energia de pesos).
- Riesgo de alucinacion: no se documentan tasas de error ni evaluaciones de fidelidad; como todo modelo generativo, puede producir contenido incorrecto con apariencia plausible.
- Sesgos: la model card del repositorio remite a la seccion de uso responsable del modelo original; no se detallan sesgos concretos en la informacion disponible.
- Licencia: Apache 2.0 cubre unicamente los pesos y ficheros de configuracion publicados por Aleph Alpha. No se extiende al codigo subyacente, la arquitectura, los ajustes de parametros ni los metodos de entrenamiento.
- Esta conversion es no oficial y no esta afiliada ni respaldada por Aleph Alpha.
- Fecha de creacion del repositorio: 2026-10-05, con 0 descargas y 0 likes, por lo que no hay evidencia de uso en produccion.
- Para produccion conviene leer previamente la seccion de uso responsable de la model card original.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/aparusel/kolibri-1-gguf
- Modelo base: https://huggingface.co/Aleph-Alpha/Kolibri-1
- Licencia del modelo base: https://huggingface.co/Aleph-Alpha/Kolibri-1/blob/main/LICENSE
- Motor DwarfStar (ds4): https://github.com/antirez/ds4
- Documentacion de modelos de ds4 (seccion Kolibri-1): https://github.com/antirez/ds4/blob/main/docs/MODELS.md#kolibri-1
- Script de cuantizacion: https://github.com/antirez/ds4/blob/main/gguf-tools/kolibri1_quantize.py
- Noticia sobre la publicacion de pesos de Kolibri: https://startupfortune.com/aleph-alpha-puts-kolibris-full-weights-on-hugging-face-under-apache-20/
- Analisis de Kolibri en online-tech-tips: https://www.online-tech-tips.com/aleph-alpha-kolibri-sovereign-open-weight-ai-model/
- Proyecto Colibri (JustVugg), motor C independiente: https://github.com/JustVugg/colibri
- Sitio de Colibri: https://justvugg.github.io/colibri/
- Cobertura de Colibri en Tom's Hardware: https://www.tomshardware.com/tech-industry/artificial-intelligence/colibri-proof-of-concept-gains-frontier-level-1-5-tb-ai-model-novel-approach-runs-on-only-25gb-of-ram-and-shows-promise-for-local-ai-setups
