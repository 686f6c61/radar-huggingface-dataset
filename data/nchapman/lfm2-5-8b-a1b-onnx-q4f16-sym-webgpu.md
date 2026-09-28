# nchapman/LFM2.5-8B-A1B-ONNX-q4f16-sym-webgpu

## Resumen

Este repositorio no contiene un modelo entrenado desde cero, sino una reexportacion cuantizada en ONNX del modelo LFM2.5-8B-A1B de LiquidAI, preparada por el usuario nchapman para su ejecucion en navegador mediante Transformers.js y onnxruntime-web con backend WebGPU. Se trata de un export simetrico en int4 con formato q4f16: se eliminan los zero_points de los nodos fusionados de mezcla de expertos (QMoE) y se divide el grafo en doce fragmentos de como maximo 0,43 GB cada uno, con un total aproximado de 4,9 GB.

El modelo subyacente, LFM2.5-8B-A1B, es un Mixture-of-Experts de Liquid AI con 8.000 millones de parametros totales y una ventana de contexto de 128.000 tokens, orientado a ejecucion en dispositivo (on-device) y a llamadas a herramientas con razonamiento en cadena (chain of thought). La relevancia de esta ficha concreta es de ingenieria: el export oficial de LiquidAI no puede cargarse en un motor JavaScript porque sus fragmentos de datos externos pesan 2,15 GB cada uno (V8 no puede asignar ArrayBuffers de ~2^31 bytes) y porque su kernel WebGPU rechaza los zero_points de los nodos QMoE.

El resultado es un artefacto pensado exclusivamente para inferencia WebGPU en navegador, con el mismo objetivo de calidad que el export oficial pero con cuantizacion distinta, por lo que sus pesos no son identicos byte a byte a los de la referencia. No hay datos publicados de benchmarks especificos de esta reexportacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) con 32 expertos y 4 expertos activados por token |
| Parametros totales | 8.000 millones (8B) |
| Parametros activos | 1,5B segun la documentacion oficial de Liquid AI; ~1B segun la ficha de flackzz (las fuentes discrepan) |
| Longitud de contexto | 128.000 tokens (128K) |
| Tipos de cuantizacion | Int4 simetrica q4f16 (solo escalas, sin zero_points) |
| Idiomas soportados | No disponible |
| Licencia | No disponible en los metadatos de HuggingFace; el autor indica que los pesos son propiedad de LiquidAI y se distribuyen bajo su licencia |
| Formato de pesos | ONNX (grafo `onnx/model_q4f16.onnx` mas doce fragmentos `model_q4f16.onnx_data` a `_data_11`) |

## Arquitectura y entrenamiento

La arquitectura del modelo base es un transformer disperso de tipo Mixture-of-Experts: 8B parametros totales con activacion de 4 de sus 32 expertos por token, lo que reduce el coste computacional por paso a un regimen equivalente a un modelo denso mucho menor. La documentacion oficial de Liquid AI describe el modelo como orientado a llamadas a herramientas fiables y rapidas, con una ventana de contexto de 128K tokens y razonamiento en cadena. La model card de flackzz resume el diseno como una combinacion de la eficiencia de los modelos dispersos con la calidad de modelos densos mayores.

No hay informacion disponible sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO para LFM2.5-8B-A1B en la informacion proporcionada. El informe tecnico enlazado (LFM2 Technical Report) si menciona que un mayor reparto de datos de razonamiento produce ganancias sustanciales en el modelo LFM2-8B-A1B frente al de 2,6B, incluyendo +10,6 puntos en MATH 500 y +8 puntos en MATH Level 5.

En cuanto a la innovacion de esta ficha concreta, es puramente de formato y empaquetado: cuantizacion simetrica int4 sin zero_points para sortear la limitacion del kernel QMoE de onnxruntime-web en WebGPU, y resharding en doce trozos de tamano controlado, con la clave `transformers.js_config` ajustada al numero correcto de fragmentos (12) porque Transformers.js la necesita para precargar los datos. El trabajo de re-cuantizacion proviene del repositorio flackzz/LFM2.5-8B-A1B-ONNX-Q4F16-sym-resharded; este repositorio solo corrige el conteo de fragmentos y vuelve a alojar los archivos con documentacion.

## Capacidades

- Generacion de texto y razonamiento con modo de cadena de pensamiento (chain of thought), segun la documentacion del modelo base.
- Llamada a herramientas (tool calling / function calling) rapida y fiable, rasgo destacado por Liquid AI para el modelo base.
- Razonamiento matematico reforzado mediante asignacion adicional de datos de razonamiento durante el entrenamiento (segun el informe tecnico de LFM2).
- Modelo de mezcla de expertos con activacion dispersa, lo que reduce el coste por token en inferencia.
- Ventana de contexto de 128.000 tokens, adecuada para entradas largas.
- Inferencia en navegador mediante WebGPU, con Transformers.js y onnxruntime-web.
- Capacidades multilingues: no disponible.
- Capacidades de vision o audio: no disponible.

## Casos de uso

- Asistentes conversacionales en navegador sin backend: el modelo puede ejecutarse integramente en el cliente con WebGPU, de modo que el texto del usuario no sale del dispositivo. Es adecuado para aplicaciones de privacidad estricta, aunque el rendimiento real dependera del soporte WebGPU del navegador.
- Agentes con tool calling en aplicaciones web: el modelo base esta optimizado para llamadas a herramientas, por lo que puede orquestar flujos de varios pasos (consultas a APIs, actualizacion de formularios, busqueda interna) dentro de una SPA sin necesidad de servidor de inferencia.
- Demos y prototipos de productos de IA directamente en una pagina estatica: al estar empaquetado para Transformers.js con el conteo de fragmentos correcto, se puede desplegar en un CDN o en GitHub Pages sin infraestructura de GPU.
- Procesamiento de documentos largos en el cliente: con 128K tokens de contexto, es viable resumir o extraer informacion de contratos, informes o transcripciones extensas que se carguen localmente en el navegador.
- Aplicaciones de escritorio o PWA con funcionamiento sin conexion: una vez descargados los 4,9 GB de pesos, el modelo puede funcionar offline, util en entornos con red intermitente o en auditorias sin acceso a internet.
- Educacion e investigacion sobre inferencia WebGPU: el repositorio sirve como caso de estudio de cuantizacion simetrica, reshards y limitaciones de asignacion de memoria en motores JavaScript (ArrayBuffers de ~2^31 bytes).
- Evaluacion comparativa de calidad de cuantizacion: al no ser identico al export oficial, permite medir el impacto de la cuantizacion simetrica int4 sobre las salidas del modelo base en tareas concretas.
- Automatizacion de bajo coste en hardware de consumo: la activacion de solo 4 de 32 expertos reduce el computo por token, lo que facilita su ejecucion en GPUs de gama media frente a alternativas densas de tamano similar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks especificos de esta reexportacion ONNX en la informacion disponible. El autor indica explicitamente que la calidad de salida debe validarse por el usuario, ya que los pesos no son identicos a los del export oficial al emplear una cuantizacion distinta.

Los unicos datos numericos presentes en la informacion de busqueda corresponden al modelo base de la generacion anterior, LFM2-8B-A1B, no a LFM2.5:

| Benchmark | Resultado | Contexto |
|---|---|---|
| MATH 500 | +10,6 puntos frente a LFM2-2.6B | Ganancias por mayor asignacion de datos de razonamiento (LFM2 Technical Report, modelo LFM2-8B-A1B) |
| MATH Level 5 | +8 puntos frente a LFM2-2.6B | Idem |

El export oficial LiquidAI/LFM2.5-8B-A1B-ONNX reporta una validacion de paridad frente a la referencia en PyTorch: paridad FP32 con lotes rellenados para padding izquierdo y derecho, similitud coseno de 1,0000 y solapamiento top-5 de 5/5 en el ultimo token valido de cada fila. Esos datos corresponden al export oficial, no a esta reexportacion.

## Requisitos de hardware

- Peso de los archivos: aproximadamente 4,9 GB en total (grafo ONNX mas doce fragmentos de como maximo 0,43 GB cada uno).
- Memoria necesaria para inferencia en navegador: el limite practico lo marca WebGPU y el motor JavaScript. La propia Liquid AI advierte que su export oficial es demasiado grande para inferencia WebGPU en navegador; esta reexportacion corrige el tamano de los fragmentos y la incompatibilidad de zero_points, pero no reduce el total de 4,9 GB.
- VRAM estimada: no disponible de forma oficial. Como referencia aritmetica, cargar los pesos q4f16 requiere del orden de 5 GB, a lo que hay que sumar la cache KV, cuyo tamano con contexto de 128K no esta publicado.
- GPU recomendadas: no disponible. Se requiere una GPU con soporte de WebGPU y memoria dedicada suficiente; en el entorno de escritorio, tarjetas con 8 GB o mas de VRAM son el punto de partida razonable para los pesos, aunque no hay cifras verificadas.
- GPU de consumo: no confirmado para esta reexportacion. Una RTX 4090 u otra GPU de gama alta con WebGPU podria ejecutarlo, pero no hay datos publicados de latencia ni de exito de carga en modelos concretos.
- Opciones de despliegue: Transformers.js junto con onnxruntime-web sobre WebGPU es el escenario de diseno. El uso con ONNX Runtime nativo, vLLM, llama.cpp, Ollama o TGI no esta documentado para este repositorio y requeriria conversion adicional.
- Latencia y throughput: no disponibles. El autor no publica mediciones de velocidad.

## Comparativa con modelos similares

| Modelo / export | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nchapman/LFM2.5-8B-A1B-ONNX-q4f16-sym-webgpu | 8B totales, 1B-1,5B activos | 128K | Int4 simetrica q4f16, 12 fragmentos de <=0,43 GB | No disponible en metadatos; pesos de LiquidAI bajo su licencia | Publico en HuggingFace, 0 descargas, 0 likes |
| LiquidAI/LFM2.5-8B-A1B-ONNX | 8B totales, 1,5B activos | 128K | Export oficial ONNX (no apto para WebGPU en navegador) | Licencia de LiquidAI | Oficial en HuggingFace |
| flackzz/LFM2.5-8B-A1B-ONNX-Q4F16-sym-resharded | 8B totales, 1B activos | 128K | Int4 simetrica q4f16 con reshards | No disponible | Publico en HuggingFace |
| Alternativas de otros fabricantes en el mismo rango | No disponible | No disponible | No disponible | No disponible | No disponible |

La unica diferencia funcional relevante entre las tres variantes de LFM2.5-8B-A1B listadas es el empaquetado: el export oficial prioriza la fidelidad numerica, mientras que las dos reexportaciones simetricas sacrifican esa identidad byte a byte a cambio de compatibilidad con WebGPU en navegador.

## Limitaciones y advertencias

- No es un modelo original: es una re-cuantizacion de terceros. Los pesos no son identicos a los del export oficial y el propio autor recomienda validar la calidad de salida antes de usarla en produccion.
- Ausencia de benchmarks: no hay evaluaciones publicadas de esta reexportacion, ni de MMLU, HumanEval, GSM8K ni de calidad de tool calling tras la cuantizacion simetrica.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; no hay informacion especifica sobre tasas de alucinacion del modelo base en la documentacion proporcionada.
- Sesgos: no disponible. No se documentan sesgos conocidos del modelo base ni del proceso de cuantizacion en la informacion proporcionada.
- Idiomas soportados: no disponible, por lo que no puede garantizarse un rendimiento homogeneo en castellano u otros idiomas.
- Incertidumbre sobre parametros activos: las fuentes discrepan entre 1,5B (documentacion oficial de Liquid AI) y ~1B (ficha de flackzz). Esto afecta a cualquier estimacion de latencia o coste computacional.
- Compatibilidad de despliegue limitada: el artefacto esta pensado para Transformers.js y onnxruntime-web con WebGPU. Su uso en otros runtimes no esta documentado y puede requerir conversion.
- Requisitos de memoria en navegador: 4,9 GB de pesos mas cache KV implican un consumo de memoria alto para una pestana de navegador; en equipos con poca RAM o GPUs integradas la carga puede fallar.
- Restricciones de licencia: la licencia no aparece en los metadatos del repositorio y el autor remite a la licencia de LiquidAI. Antes de cualquier uso comercial es imprescindible verificar los terminos en el repositorio oficial del modelo base.
- Madurez del repositorio: 0 descargas y 0 likes en el momento de la consulta, sin proceso de validacion de la comunidad documentado.

## Enlaces

- Repositorio de esta ficha: https://huggingface.co/nchapman/LFM2.5-8B-A1B-ONNX-q4f16-sym-webgpu
- Export oficial ONNX de LiquidAI: https://huggingface.co/LiquidAI/LFM2.5-8B-A1B-ONNX
- Reexportacion simetrica de origen (flackzz): https://huggingface.co/flackzz/LFM2.5-8B-A1B-ONNX-Q4F16-sym-resharded
- Reexportacion reshards de flackzz: https://huggingface.co/flackzz/LFM2.5-8B-A1B-ONNX-Q4F16-resharded
- Documentacion de Liquid AI para LFM2.5-8B-A1B: https://docs.liquid.ai/lfm/models/lfm25-8b-a1b
- Blog de Liquid AI sobre LFM2.5-8B-A1B: https://www.liquid.ai/blog/lfm2-5-8b-a1b
- Informe tecnico de LFM2 (arXiv): https://arxiv.org/html/2511.23404v1
