# DatKurai/Swift-1.5-Qwen3.8-Flash-Next-GSQ-RCO-Uncen-IQ1-332Exp-GGUF

## Resumen

Swift-1.5-Qwen3.8-Flash-Next-GSQ-RCO-Uncen-IQ1-332Exp-GGUF es una compilacion GGUF podada a nivel de expertos y con el sesgo de rechazo reducido (abliterated) de la familia Swift 1.5, publicada por el usuario DatKurai. Se apoya en el modelo base `SC117/Swift-1.5-Qwen3.8-Flash-Next-GSQ-RCO-abliterated-GGUF` y mantiene intactos los pesos y la cuantizacion originales: lo unico que cambia es el conjunto de expertos que se conserva en cada capa.

El problema que resuelve es de despliegue: el modelo original es una mezcla de expertos (MoE) demasiado grande para hardware de consumo, asi que se reduce el pool de 512 a 332 expertos por capa (aproximadamente el 64,8 %) y el resultado se sirve desde una sola GPU de 16 GB mas RAM como cache de expertos. El checkpoint final ocupa unos 60,65 GB repartidos en dos fragmentos GGUF, con proyector de vision incluido.

Es relevante porque aplica una mascara de expertos derivada de trazas reales de enrutamiento sobre modelos de codigo y agentes, en lugar de un podado uniforme, y porque conserva las capacidades multimodales y multilingues heredadas de Qwen3.8-Flash-Next. La pega principal es que depende del motor Strata y no se ha validado con llama.cpp, Ollama ni vLLM, ademas de no contar todavia con benchmarks estandarizados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) tipo transformer, con proyector de vision para entrada imagen-texto |
| Parametros totales | 134.454.453.120 (unos 134,5 mil millones, segun safetensors) |
| Parametros activos | no disponible (configuracion de 10 expertos enrutados por token sobre 332 por capa) |
| Longitud de contexto | Produccion verificada en 144K-192K tokens; 256K verificado en tiempo de ejecucion (se recupero correctamente un prompt de aproximadamente 251,5K tokens) |
| Tipos de cuantizacion | No hay recuantizacion: cada tensor conserva la cuantizacion original del origen (nivel IQ3_XXS). La etiqueta "IQ1" del nombre designa la clase de tamano efectivo del release (unos 60,65 GB), no una cuantizacion de 1 bit |
| Idiomas soportados | Ingles y multilingue (cobertura heredada de Qwen3.8-Flash-Next; pruebas de humo en ocho idiomas con alfabetos latino, CJK y cirilico) |
| Licencia | swift-open-license-1.0 (etiquetada como `license: other`) |
| Formato de pesos | GGUF, en 2 fragmentos (36,47 GB + 24,18 GB) |

## Arquitectura y entrenamiento

La arquitectura es una mezcla de expertos con 48 capas y 10 expertos enrutados por token. Este release no entrena nada nuevo: todos los tensores, incluidos los 332 expertos conservados por capa, se toman byte a byte del modelo abliterated de origen en su nivel IQ3_XXS. La intervencion consiste en un podado consciente del enrutamiento, en el que el mapa de expertos se obtiene combinando las trazas de enrutamiento medidas sobre prompts reales de agentes de codigo y multilingues con la mascara publicada por ISTA-DASLab en el release GSQ-RCO Coder (`rco-allocation.txt`).

La mascara de partida proviene del metodo RCO (Riemannian Constrained Optimization), descrito en *Model Compression with Exact Budget Constraints via Riemannian Manifolds* (Helcig y Alistarh, 2026). En este build RCO se usa unicamente como mascara de expertos publicada: no se aplica reasignacion de precision ni se tocan los bytes de cuantizacion. Un detalle tecnico relevante es que la transferencia de mascara es imperfecta: la mascara del Coder por si sola cubre aproximadamente el 72,4 % del enrutamiento de codigo y el 69,4 % del multilingue en este modelo, por lo que se reparo con trazas propias. El resultado se comporta como un mapa de expertos orientado a codigo y agentes, no como un muestreo generico.

## Capacidades

- Generacion de texto conversacional con contexto muy largo (144K-192K tokens en produccion, 256K verificado en pruebas).
- Codigo y flujos de agentes: la mascara de expertos esta orientada explicitamente a trazas de codigo y agentes.
- Tool calling y function calling, segun las etiquetas declaradas por el autor.
- Razonamiento multi-paso en entornos agénticos (pruebas A/B informales del autor a traves de OpenCode).
- Vision: entrada de imagen mas texto mediante el proyector incluido; probado en 5 imagenes (tarjeta OCR, diagrama de flujo, captura de ajustes, formas geometricas y render abstracto), todas leidas correctamente.
- Multilingue: pruebas de humo en ocho idiomas; aritmetica y explicacion superadas en los ocho, con escritura libre mostrada solo para los idiomas que alcanzaron el umbral.
- Modo sin censura: compilacion abliterated con rechazos drasticamente reducidos; el caracter "Uncen" es heredado del modelo fuente, no un ajuste adicional.
- Decodificacion especulativa MTP soportada en el motor Strata.

## Casos de uso

- Asistente de codigo en produccion: el mapa de expertos esta derivado de trazas de agentes de codigo, de modo que puede integrarse en flujos de edicion asistida y generacion de parches dentro de pipelines de CI/CD.
- Agentes autonomos con tool calling: soporta llamadas a funciones y razonamiento multi-paso, adecuado para orquestadores que encadenan busqueda, ejecucion y verificacion.
- Analisis de documentos extensos: con 144K-192K tokens de contexto en produccion puede procesar bases de codigo, expedientes o manuales completos sin troceado agresivo.
- Procesamiento de capturas y diagramas: el proyector de vision permite extraer texto de tarjetas (OCR) y entender diagramas de flujo o capturas de configuracion.
- Atencion al cliente multilingue: la cobertura multilingue heredada admite conversaciones multi-turno en varios alfabetos con contexto largo.
- Generacion de contenido sin filtros de rechazo: util en tareas creativas o de investigacion donde los rechazos del modelo base estorban, siempre bajo responsabilidad del operador.
- Prototipado en hardware de consumo: al caber en una GPU de 16 GB mas 32 GB de RAM, permite montar un entorno de desarrollo local para experimentar con un MoE de 134,5 mil millones de parametros.
- Analisis automatizado de repositorios: combinando codigo y vision puede revisar pull requests con capturas adjuntas o revisar documentacion con imagenes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que este release no incluye benchmarks estandarizados (sin afirmaciones de LiveCodeBench ni SWE-bench) y que sus pruebas A/B frente al modelo completo, realizadas con codificacion agéntica a traves de OpenCode, son informales y no mostraron una diferencia clara de calidad en las tareas evaluadas.

## Requisitos de hardware

- VRAM estimada: el payload completo es de 60,65 GB, por lo que no cabe integramente en una GPU de consumo. La configuracion verificada por el autor usa una RX 6800 de 16 GB con 32 GB de RAM de sistema y cache de expertos.
- Configuracion verificada: Windows 11, una AMD RX 6800 (16 GB) mas 32 GB de RAM, motor Strata con `--resident-experts` y cache de expertos, KV en int8 y decodificacion especulativa MTP.
- GPU recomendadas: no disponible. El autor solo documenta la RX 6800; otras GPU no han sido probadas ni reportadas en la model card.
- Cabe en GPU de consumo: si, con la salvedad de que requiere el uso de RAM como cache de expertos; una GPU de 16 GB no aloja el modelo completo por si sola.
- Opciones de despliegue: unicamente el motor Strata esta verificado. El autor advierte que llama.cpp, Ollama y vLLM no estan probados y no debe asumirse que carguen o ejecuten el modelo correctamente.
- Latencia y throughput: no disponible (el autor solicita a la comunidad que reporte numeros de PP/TG, lo que implica que no hay cifras publicadas).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Swift-1.5-...-Uncen-IQ1-332Exp (este) | 134,5 mil millones (332 expertos/capa) | 144K-192K en produccion, 256K verificado | Sin benchmarks; A/B informal sin diferencia clara frente al modelo completo | swift-open-license-1.0 | GGUF en HuggingFace, requiere motor Strata |
| SC117/Swift-1.5-Qwen3.8-Flash-Next-GSQ-RCO-abliterated | no disponible (512 expertos/capa) | no disponible | no disponible | no disponible | GGUF en HuggingFace (modelo base) |
| Release GSQ-RCO Coder IQ1_M | no disponible | no disponible | no disponible | no disponible | GGUF, unos 58,4 GB |

No se dispone de datos de rendimiento de ninguna de las tres variantes en la informacion proporcionada, por lo que la comparativa se limita a tamano y procedencia. No se han identificado en la informacion disponible otros modelos comparables de la misma categoria con cifras verificables.

## Limitaciones y advertencias

- Ausencia total de benchmarks estandarizados: no hay resultados de MMLU, HumanEval, GSM8K, LiveCodeBench ni SWE-bench, solo evaluaciones informales del autor.
- Compatibilidad restringida: solo el motor Strata esta verificado; llama.cpp, Ollama y vLLM no estan probados y pueden fallar al cargar el modelo.
- Etiqueta enganosa en el nombre: "IQ1" no implica cuantizacion de 1 bit; quien asuma lo contrario puede malinterpretar los requisitos de memoria y la calidad esperada.
- Perdida de cobertura de expertos: la mascara del Coder cubre solo aproximadamente el 72,4 % del enrutamiento de codigo y el 69,4 % del multilingue, lo que implica que hay comportamiento fuera de la mascara que depende de la reparacion con trazas propias.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; es un modelo abliterated, y la reduccion de rechazos puede aumentar la generacion de contenido incorrecto o inapropiado sin aviso.
- Idiomas: la model card solo lista ingles y "multilingual"; las pruebas de humo cubren ocho idiomas, pero no se especifica la lista completa ni el rendimiento por idioma.
- Licencia: `swift-open-license-1.0` bajo la etiqueta generica `license: other`. No se detallan en la informacion disponible las condiciones para uso comercial, por lo que debe revisarse el texto completo de la licencia antes de desplegar en produccion.
- Corto historial de validacion: el repositorio tiene 0 descargas y 3 likes, con una unica actualizacion el mismo dia de creacion, lo que indica una comunidad de pruebas practicamente inexistente.
- Procedencia: es un derivado de terceros sobre un modelo base de terceros; la trazabilidad de pesos y datos de entrenamiento depende de eslabones anteriores que no se documentan aqui.
- Advertencia de contenido: la fuente web consultada durante la busqueda devolvio resultados no relacionados con el modelo y de caracter adulto; no se ha utilizado ninguna informacion de esas fuentes en esta ficha.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/DatKurai/Swift-1.5-Qwen3.8-Flash-Next-GSQ-RCO-Uncen-IQ1-332Exp-GGUF
- Modelo base: https://huggingface.co/SC117/Swift-1.5-Qwen3.8-Flash-Next-GSQ-RCO-abliterated-GGUF
- Paper de RCO referenciado en la model card: Model Compression with Exact Budget Constraints via Riemannian Manifolds (Helcig y Alistarh, 2026), identificado con el tag `arxiv:2605.00649`
- Motor Strata: no disponible (no se incluye enlace en la informacion proporcionada)
- Carpeta de pruebas de vision `vision-smoke/` y de idiomas `i18n-smoke/`: referenciadas en la model card, sin URL directa disponible
- Mascara de expertos `rco-allocation.txt` del release GSQ-RCO Coder de ISTA-DASLab: referenciada en la model card, sin URL directa disponible
