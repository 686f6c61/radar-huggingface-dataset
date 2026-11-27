# netprojects/Hy-MT3-30B-A3B-LayerFit-MLX-3bit

## Resumen

Hy-MT3-30B-A3B LayerFit MLX 3-bit es una cuantizacion de 3 bits del modelo de traduccion tencent/Hy-MT3-30B-A3B, publicada por NetProjects y optimizada para ejecucion en Apple Silicon mediante la libreria MLX. El modelo base es un transformer de mezcla de expertos (MoE) de Tencent con unos 30.000 millones de parametros totales y aproximadamente 3.000 millones activos por token, disenado especificamente para traduccion automatica multilingue en torno a 100 idiomas. Esta version concreta aplica la tecnica propietaria LayerFit, que asigna presupuesto de bits de forma desigual por capa (expertos, experto compartido, atencion, embeddings y cabeza de salida) en lugar de cuantizar todas las capas por igual.

La relevancia de esta publicacion radica en que permite ejecutar un modelo de traduccion de 30B en equipos de consumo con memoria unificada de 18 GB, un escenario impensable con pesos en bf16. El autor reporta que, con el mismo tamano en disco que una cuantizacion estandar de 3 bits, LayerFit mejora la concordancia top-1 con bf16 del 81,5 % al 86,1 % y reduce la divergencia KL de 0,3768 a 0,2313 (un 39 % menos). El repositorio ocupa 13,2 GB y se distribuye bajo licencia Apache-2.0, la misma del modelo original.

Es importante senalar que se trata de una conversion no oficial: NetProjects no tiene vinculo con Tencent y el autor ha tenido que incluir su propia implementacion de la arquitectura `hy_v3` en MLX, ya que mlx-lm todavia no la soporta de forma nativa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (`hy_v3`), implementacion MLX incluida en el repo |
| Parametros totales | 30.064.725.888 (~30B) |
| Parametros activos | ~3B por token (segun model card del autor) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 3 bits (esta build); el autor publica tambien 4, 6 y 8 bits |
| Idiomas soportados | ~100 idiomas (segun model card del autor); lista concreta no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX), 13,2 GB en disco |
| Memoria recomendada | 18 GB de memoria unificada en Mac |
| Libreria | mlx-lm >= 0.32.2 |
| Router | float32, sin cuantizar |
| Temperatura recomendada | 0,7 (top_p 1,0, hasta 4096 tokens nuevos) |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos con unos 30B de parametros totales y aproximadamente 3B activos por token, lo que reduce el coste computacional por token a costa de mantener una huella de memoria elevada. La arquitectura se identifica como `hy_v3` y no esta soportada de forma nativa por mlx-lm, por lo que el repositorio incluye `hy_v3.py` con la implementacion MLX del autor y un `config.json` que apunta a ella; es obligatorio usar `--trust-remote-code`. El router de la MoE se mantiene en float32 y no se cuantiza, lo que preserva la seleccion de expertos.

Sobre el entrenamiento del modelo original (composicion del dataset, numero de tokens, uso de RLHF o DPO) no se aporta informacion en los datos disponibles; se remite a la model card de tencent/Hy-MT3-30B-A3B. La innovacion tecnica de esta publicacion es LayerFit: un procedimiento de busqueda por capa que mide la sensibilidad de cada componente (expertos, experto compartido, atencion, embeddings y cabeza de salida) a la cuantizacion agresiva y distribuye el presupuesto de bits donde mas ayuda, manteniendo el mismo tamano total. La receta exacta se publica en `layerfit-recipe.json`. Segun el autor, LayerFit aporta poco a partir de 6 bits, por lo que solo se aplica en las builds de 3 y 4 bits.

## Capacidades

- Traduccion automatica multilingue: el pipeline declarado es `translation` y el modelo base cubre en torno a 100 idiomas.
- Traduccion con instrucciones: acepta prompts del tipo "Translate the following text into Greek..." y devuelve solo el texto traducido si se le indica.
- Idiomas verificados en las pruebas del autor: griego, chino, japones, aleman, frances, espanol, arabe y ruso como destino, y griego y chino como origen hacia ingles.
- Generacion de texto autoregresiva con decodificacion por muestreo (temperatura 0,7, top_p 1,0).
- Capacidad de generar hasta 4096 tokens nuevos por peticion (ajuste recomendado por Tencent).
- Ejecucion local en Apple Silicon mediante MLX, sin dependencia de servicios en la nube.
- Soporte de tool calling, agentes, vision o audio: no disponible en la informacion proporcionada.

## Casos de uso

- Traduccion de documentacion tecnica en local: un equipo puede traducir manuales y guias a decenas de idiomas sin enviar contenido propietario a APIs externas, ejecutando el modelo en un Mac con 18 GB de memoria unificada.
- Localizacion de productos de software: integracion en pipelines de build que traduzcan ficheros de recursos (`.strings`, `.json`, `.po`) por lotes, aprovechando que el modelo acepta instrucciones para devolver solo la traduccion.
- Traduccion de correspondencia y contratos sensibles: al ejecutarse offline, es adecuado para despachos juridicos o sanitarios que no pueden externalizar texto confidencial.
- Prototipado y evaluacion de sistemas de traduccion: investigadores pueden comparar variantes de cuantizacion (3, 4, 6, 8 bits) del mismo modelo en hardware de consumo, midiendo el impacto de la compresion en la calidad.
- Traduccion en entornos con conectividad limitada: periodistas o trabajadores de campo con un MacBook pueden traducir material in situ sin conexion.
- Generacion de subtitulos y contenido editorial multilingue: traduccion de guiones o articulos a varios idiomas de destino en una sola pasada, con contexto suficiente para mantener coherencia terminologica.
- Aplicaciones de escritorio para macOS: al estar empaquetado para MLX y ocupar 13,2 GB, puede integrarse en apps nativas que ofrezcan traduccion privada sin backend.

## Benchmarks y rendimiento

Datos aportados por el autor (comparacion de LayerFit 3-bit frente a una cuantizacion estandar de 3 bits creada por el propio autor para la prueba, ya que no existe una build estandar publica de este modelo):

| Metrica | 3-bit estandar | LayerFit 3-bit |
|---|---|---|
| Concordancia top-1 con bf16 | 81,5 % | 86,1 % |
| Divergencia KL respecto a bf16 | 0,3768 | 0,2313 (39 % menor) |
| Prompts de traduccion superados | no disponible | 10/10 |
| Coincidencia de siguiente token con bf16 (204 posiciones) | no disponible | 94,6 % |

El arnes de evaluacion compara los pesos contra una conversion bf16 propia del modelo de Tencent, con pasajes en varios idiomas. Medicion realizada en un MacBook Pro M5 Max el 27 de noviembre de 2026 con mlx-lm 0.32. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, BLEU, COMET) en la informacion disponible.

## Requisitos de hardware

- Memoria: 18 GB de memoria unificada recomendados para esta build de 3 bits (13,2 GB en disco); la build de 4 bits requiere 24 GB.
- Hardware objetivo: Apple Silicon (serie M). El autor reporta pruebas en un MacBook Pro con M5 Max.
- GPU NVIDIA: no aplicable directamente, ya que los pesos estan en formato MLX; para CUDA habria que recurrir a otra conversion (GGUF, safetensors estandar) del modelo base.
- Cabe en equipos de consumo Apple: si, en Mac con 18 GB o mas de memoria unificada.
- Despliegue: mlx-lm >= 0.32.2 con `--trust-remote-code`; no se mencionan vLLM, llama.cpp, Ollama ni TGI para esta build.
- Throughput y latencia: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Hy-MT3-30B-A3B LayerFit MLX 3-bit (este) | 30B totales, ~3B activos | no disponible | Apache-2.0 | MLX safetensors, 13,2 GB | Traduccion, Apple Silicon, 18 GB RAM |
| Hy-MT3-30B-A3B LayerFit MLX 4-bit | 30B totales, ~3B activos | no disponible | Apache-2.0 | MLX safetensors, 16,9 GB | Misma receta, 24 GB RAM |
| Hy-MT3-30B-A3B MLX 8-bit | 30B totales, ~3B activos | no disponible | Apache-2.0 | MLX safetensors, mayor | Build estandar sin LayerFit |
| tencent/Hy-MT3-30B-A3B (original) | 30B totales, ~3B activos | no disponible | Apache-2.0 | safetensors (bf16) | Referencia de calidad; requiere mucha mas memoria |

No se dispone de datos de benchmarks comparativos con otros modelos de traduccion (por ejemplo, NLLB o SeamlessM4T) en la informacion proporcionada.

## Limitaciones y advertencias

- Conversion no oficial: NetProjects no esta afiliado a Tencent; la calidad final depende de la implementacion MLX propia de la arquitectura `hy_v3`, no validada por el fabricante original.
- Requiere `--trust-remote-code`: se ejecuta codigo Python incluido en el repositorio, lo que implica un riesgo de seguridad que debe evaluarse antes de usarlo en produccion.
- Perdida de calidad por cuantizacion: aunque LayerFit mejora la fidelidad, la concordancia top-1 con bf16 es del 86,1 %, es decir, aproximadamente 1 de cada 7 predicciones difiere del modelo original.
- Evaluacion limitada: las pruebas se basan en 10 prompts de traduccion y 204 posiciones; no hay evaluacion con metricas estandar de traduccion (BLEU, COMET, chrF) ni en dominios especializados.
- Sesgos: no se documentan sesgos conocidos del modelo base ni de esta conversion en la informacion disponible.
- Riesgo de alucinacion: no cuantificado; como todo modelo generativo, puede inventar contenido en entradas ambiguas o idiomas poco representados.
- Idiomas: se declaran unos 100, pero solo se verifican 10 en las pruebas del autor; el rendimiento en el resto es desconocido.
- Contexto: la longitud de contexto no esta documentada, lo que limita la planificacion de cargas con documentos largos.
- Licencia: Apache-2.0 permite uso comercial, pero debe conservarse `LICENSE.txt` de Tencent y el `NOTICE` de la conversion; LayerFit es marca registrada de NetProjects.
- Exclusivo de Apple Silicon: no es desplegable en GPU NVIDIA o AMD sin reconvertir los pesos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/netprojects/Hy-MT3-30B-A3B-LayerFit-MLX-3bit
- Modelo base: https://huggingface.co/tencent/Hy-MT3-30B-A3B
- Build LayerFit 4-bit: https://huggingface.co/netprojects/Hy-MT3-30B-A3B-LayerFit-MLX-4bit
- Build estandar 6-bit: https://huggingface.co/netprojects/Hy-MT3-30B-A3B-MLX-6bit
- Build estandar 8-bit: https://huggingface.co/netprojects/Hy-MT3-30B-A3B-MLX-8bit
- NetProjects: https://netprojects.com
- Libreria MLX: https://github.com/ml-explore/mlx
- mlx-lm: https://github.com/ml-explore/mlx-lm
