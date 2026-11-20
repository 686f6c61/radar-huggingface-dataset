# RuFlect/LIBERO-CF-LingBot-VA-LDS

## Resumen

LIBERO-CF-LingBot-VA-LDS es un checkpoint de politica robotica (policy) derivado del modelo base `robbyant/lingbot-va-base`, publicado por RuFlect. Se trata de un ajuste fino orientado a tareas de manipulacion en el benchmark LIBERO-CF, entrenado hasta el paso 1600 y destinado a la evaluacion principal del benchmark. El modelo incorpora Linear Decodability Supervision (LDS), una tecnica de supervision auxiliar que se descarta en inferencia y que constituye la innovacion metodologica del release.

El modelo se distribuye en formato diffusers/safetensors con 5.088.872.670 parametros (aproximadamente 5,09 mil millones) y un repositorio de 10,2 GB. La arquitectura subyacente corresponde a LingBot-VA, un modelo de vision-lenguaje-accion (VLA) que combina un transformer de politica, un tokenizador, un codificador de texto y un VAE heredados del modelo base. La salida es una accion de 7 dimensiones en el espacio de LIBERO, con dos camaras como entrada.

Su relevancia es acotada pero especifica: no es un modelo de proposito general, sino un artefacto de investigacion reproducible para el benchmark LIBERO-CF, con verificacion criptografica (SHA256SUMS) y metadatos de procedencia (model-release.json). Resulta util para investigadores que quieran reproducir o comparar resultados de politicas VLA con supervision LDS en entornos de manipulacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de politica VLA (LingBot-VA) con tokenizador, codificador de texto y VAE del modelo base |
| Parametros totales | 5.088.872.670 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria diffusers) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura de LingBot-VA: un transformer de politica que consume observaciones visuales de dos camaras y produce acciones de 7 dimensiones en el codec nativo de LIBERO. El tokenizador, el codificador de texto y el VAE provienen del modelo base `robbyant/lingbot-va-base` y no se reentrenan en este release. El checkpoint sustituye unicamente el transformer y anade cabezas auxiliares de LDS (Linear Decodability Supervision), que se descartan en inferencia.

El entrenamiento parte de la base LIBERO continuada hasta el paso 30.000 y despues se realiza una continuacion especifica de LDS hasta el paso 1600. Se utilizan todas las escenas de supervision de localizacion disponibles, por lo que este release no representa una particion de escenas retenidas (held-out). La normalizacion de acciones debe tomarse de `norm_stat.json` con los cuantiles `q01`/`q99`; el autor advierte explicitamente de no usar la normalizacion de RoboTwin. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generacion de acciones roboticas de 7 dimensiones para manipulacion en el entorno LIBERO.
- Procesamiento de observaciones visuales de dos camaras como entrada.
- Integracion con tokenizador y codificador de texto del modelo base LingBot-VA (comprension de instrucciones en lenguaje natural segun el pipeline upstream).
- Politica de un solo paso de inferencia con cabezas LDS descartadas, es decir, sin coste adicional en produccion.
- Soporte de normalizacion de acciones especifica mediante `norm_stat.json` (`q01`/`q99`).
- No se documentan capacidades de tool calling, agentes multi-paso, vision general, audio ni modo thinking.

## Casos de uso

- Reproduccion de benchmarks VLA: permite replicar la evaluacion principal de LIBERO-CF con el checkpoint exacto usado por los autores, gracias a los metadatos de procedencia y a `SHA256SUMS`.
- Investigacion en supervision auxiliar: sirve para estudiar el efecto de Linear Decodability Supervision comparando este checkpoint con la base LIBERO sin LDS.
- Evaluacion de politicas de manipulacion: util para medir tasas de exito en tareas de LIBERO-CF con el codec nativo de 7 dimensiones y dos camaras.
- Desarrollo de pipelines de robotica simulada: puede integrarse en el repositorio upstream `Robbyant/lingbot-va` para experimentos de control en simulacion.
- Analisis de normalizacion de acciones: el `norm_stat.json` incluido permite estudiar el impacto de los cuantiles `q01`/`q99` frente a otras normalizaciones.
- Verificacion de integridad de releases: el esquema de checksums y metadatos sirve como referencia para publicar artefactos de investigacion reproducibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que este checkpoint es la politica "all-train" usada en la evaluacion principal del benchmark LIBERO-CF, pero no incluye cifras de tasa de exito ni metricas numericas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 5,09 mil millones de parametros, en FP16 se necesitarian aproximadamente 10,2 GB solo para pesos, mas memoria para activaciones y el VAE/codificador de texto; en cuantizacion de 8 bits rondaria los 5-6 GB y en 4 bits unos 3 GB, aunque estas cifras son estimaciones y no datos del autor.
- GPU recomendadas: no disponibles en la informacion proporcionada. Por tamano, una GPU con 16-24 GB de VRAM (RTX 4090, A100 40 GB, H100) seria el rango razonable para FP16.
- Compatibilidad con GPU de consumo: probable en GPUs de 16 GB o mas con cuantizacion, pero no confirmado por el autor.
- Opciones de despliegue: la model card indica usar la implementacion upstream `Robbyant/lingbot-va`; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LIBERO-CF-LingBot-VA-LDS | 5,09 B | no disponible | Politica VLA para LIBERO-CF | Apache 2.0 | Hugging Face |
| robbyant/lingbot-va-base | no disponible | no disponible | Modelo base VLA | no disponible | Hugging Face |
| Politica LIBERO base (paso 30.000) | no disponible | no disponible | Politica VLA para LIBERO | no disponible | Referenciada en la model card |

No se dispone de datos de rendimiento de los modelos comparables en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- Modelo especializado: no es un modelo de proposito general; solo produce acciones en el espacio de LIBERO con el codec nativo de 7 dimensiones y dos camaras.
- Normalizacion estricta: usar la normalizacion de RoboTwin produce resultados incorrectos; debe emplearse `norm_stat.json` con `q01`/`q99`.
- Sin particion held-out: el entrenamiento usa todas las escenas de supervision de localizacion disponibles, por lo que no debe interpretarse como una evaluacion de generalizacion a escenas no vistas.
- Dependencia del upstream: requiere la configuracion `va_libero_train_cfg` y la implementacion de `Robbyant/lingbot-va`; no es autonomo.
- Cabezas LDS descartadas: deben eliminarse en inferencia; conservarlas altera el pipeline esperado.
- Sin datos de sesgos, alucinacion o rendimiento multilingue: no disponibles en la informacion proporcionada.
- Licencia Apache 2.0: permite uso comercial con las obligaciones habituales de atribucion y aviso de cambios; el modelo base puede tener condiciones adicionales no detalladas.
- Cero descargas y likes en el momento de la consulta: release muy reciente y sin validacion comunitaria independiente.

## Enlaces

- Hugging Face: https://huggingface.co/RuFlect/LIBERO-CF-LingBot-VA-LDS
- Modelo base: https://huggingface.co/robbyant/lingbot-va-base
- Implementacion upstream LingBot-VA: https://github.com/Robbyant/lingbot-va
- Codigo LDS: https://github.com/RuFlect-Intelligence/Linear-Decodability-Supervision
