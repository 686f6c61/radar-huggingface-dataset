# iris-hq/iris-names

## Resumen

`iris-hq/iris-names` es un paquete ONNX publicado por iris-hq que agrupa dos modelos preentrenados reempaquetados para su uso en la extraccion local de nombres dentro de la aplicacion Iris (funciones `namesFind` + `namesCheck` de `iris-voice-helper`). No se trata de un modelo entrenado desde cero ni de un modelo generativo: es un bundle reproducible de inferencia offline que combina un extractor de spans de entidades (GLiNER 2.5 Base, `fastino/gliner2.5-base-v1`) con un clasificador de inferencia natural (DeBERTa-v3 Base MNLI/FEVER/ANLI, `MoritzLaurer/DeBERTa-v3-base-mnli-fever-anli`, en variante Q4F16).

El paquete resuelve un problema muy concreto: ofrecer deteccion de nombres de persona en texto sin enviar contenido a servidores externos. Iris fija un commit del repositorio y verifica tamano y SHA-256 de cada fichero antes de usarlo, de modo que el bundle funciona como una dependencia determinista y auditable. Su relevancia es, por tanto, la de un artefacto de despliegue de NER/NLI en el borde (edge), no la de un modelo de proposito general.

La arquitectura subyacente combina un encoder transformer (GLiNER 2.5 para extraccion de spans y DeBERTa-v3 para verificacion de entidades), ambos exportados a ONNX con datos externos. El repositorio ocupa 1,0 GB y esta etiquetado con licencia compuesta `apache-2.0-and-mit` (con la salvedad de que parte del entrenamiento de DeBERTa-v3 uso ANLI, CC BY-NC 4.0).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Bundle de dos modelos transformer: GLiNER 2.5 Base (encoder + boundary head para spans de entidades) y DeBERTa-v3 Base (clasificador NLI MNLI/FEVER/ANLI), ambos exportados a ONNX |
| Parametros totales | no disponible (el repositorio no publica el recuento; los modelos base son de escala "base", ~86M en DeBERTa-v3-base) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GLiNER: FP32 (encoder con datos externos, boundary head FP32); DeBERTa-NLI: Q4F16 reempaquetado con datos externos |
| Idiomas soportados | no disponible (el bundle no declara lista de idiomas; los modelos base son multilingues/ingles segun su procedencia) |
| Licencia | `apache-2.0-and-mit` (GLiNER Apache-2.0; DeBERTa-v3 MIT, con entrenamiento parcial en ANLI CC BY-NC 4.0) |
| Formato de pesos | ONNX (`model.onnx` + `model.onnx_data`), tokenizers en JSON |

## Arquitectura y entrenamiento

El bundle no entrena ningun modelo nuevo: reempaqueta dos etapas. La primera es GLiNER 2.5 Base (`fastino/gliner2.5-base-v1`, commit `07d99c0ba5d15cb3b24e0a236fa99bdd4ef87a5c`), del que solo se exporta la ruta de spans de entidades: un encoder FP32 con datos externos y un boundary head FP32 (`candidate_pool="shared"`). La segunda es DeBERTa-v3 Base MNLI/FEVER/ANLI de MoritzLaurer (via Xenova, commit `72a1ce83a0144efaf828b3c3844320a61197a53d`), tomado como `onnx/model_q4f16.onnx` y reempaquetado con datos externos; su fuente FP32 es `MoritzLaurer/DeBERTa-v3-base-mnli-fever-anli` (commit `ef67fd0301dd3eebc5eed7fd3fae0ef2fc0bbd0a`).

La innovacion tecnica documentada esta en el proceso de exportacion, no en el modelo. El autor publica tres parches necesarios contra `gliner2==2.1.0` para exportar el BoundaryHead a ONNX (opset 18, `dynamo=False`) y ejecutarlo en ONNX Runtime 1.23.2 con longitudes dinamicas `L >= 1`: (1) symbolics personalizados para `aten::sort` y `aten::argsort` con `stable=True`, que delegan en `TopK(..., sorted=1)`; (2) sustitucion de `torch.eye(n, dtype=torch.bool)` por comparacion de coordenadas `int64` y de mutaciones in-place por `torch.cat`/`torch.where`, evitando el nodo `EyeLike` no implementado; (3) right-padding de los logits de frontera a `k=32` en `select_top_boundaries` para garantizar una rejilla estatica de 1024 pares candidatos (>=192) con cualquier `L >= 1`, con resultados identicos a PyTorch. Los tokenizers se reescriben para `swift-transformers 1.4.0` (clase `XLMRobertaTokenizer`, tokens anadidos al vocabulario Unigram) sin alterar los IDs. El entorno de referencia es Python 3.13.11, `gliner2==2.1.0`, `torch==2.15.0` (CPU), `transformers==4.57.6`, `tokenizers==0.22.2`, `onnx==1.23.2`, `onnxscript==0.7.2` y `onnxruntime==1.23.2`.

## Capacidades

- Extraccion de spans de nombres de entidad (NER) sobre texto local mediante GLiNER 2.5, limitada a la ruta de spans del modelo base.
- Verificacion de entidades candidatas mediante inferencia natural (NLI) con DeBERTa-v3 MNLI/FEVER/ANLI, en cuantizacion Q4F16.
- Flujo en dos etapas `namesFind` (deteccion) + `namesCheck` (verificacion) integrado en la aplicacion Iris.
- Inferencia completamente offline: no se envia texto de notas a ningun servidor.
- Verificacion de integridad por fichero (tamano y SHA-256) y commit fijado del repositorio.
- Ejecucion via ONNX Runtime con longitudes de palabra dinamicas (`L >= 1`).
- No se documentan capacidades de generacion de texto, razonamiento general, codigo, matematicas, vision, audio, tool calling ni uso como agente.

## Casos de uso

- Extraccion local de nombres en notas personales: el bundle aplica GLiNER 2.5 sobre el texto de la nota y devuelve spans candidatos de nombres de persona, sin salir del dispositivo; encaja porque el paquete esta disenado exactamente para la funcion `namesFind`.
- Verificacion de candidatos antes de mostrarlos al usuario: la segunda etapa DeBERTa-NLI evalua si el span propuesto es coherente con la hipotesis de "nombre de persona", reduciendo falsos positivos de la primera etapa; encaja por el diseno de dos etapas `namesFind` + `namesCheck`.
- Funcion "Names only" en ajustes de Iris: cuando el usuario elige descargar solo el modelo de nombres, la aplicacion descarga este bundle fijado y lo usa como dependencia de inferencia; encaja porque el repositorio esta pensado como artefacto de descarga con verificacion SHA-256.
- Despliegue en aplicaciones de escritorio o moviles con ONNX Runtime: al estar exportado a ONNX con datos externos y tokenizers compatibles con `swift-transformers 1.4.0`, puede integrarse en clientes nativos sin stack de PyTorch.
- Anonimizacion o etiquetado de PII en pipelines locales: la deteccion de nombres permite marcar o redactar entidades en textos antes de almacenarlos, con la ventaja de que no hay llamada a API externa.
- Auditoria y reproducibilidad de dependencias de IA: el bundle incluye la receta de exportacion, parches y versiones fijadas, lo que permite reconstruir el artefacto y verificar que el binario desplegado corresponde al codigo fuente declarado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita. El repositorio ocupa 1,0 GB en disco; la inferencia combina un encoder GLiNER FP32 y un DeBERTa Q4F16, por lo que el consumo de memoria en runtime sera del orden de cientos de MB a pocos GB, pero no se publica una cifra concreta.
- GPU recomendadas: no disponibles. El entorno de referencia del autor usa `torch==2.15.0` en CPU, lo que sugiere que el flujo de exportacion y verificacion se valido en CPU.
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible; el formato ONNX y la cuantizacion Q4F16 de la segunda etapa son compatibles con aceleracion en GPU, pero no se documenta una matriz de compatibilidad.
- Opciones de despliegue: ONNX Runtime (version de referencia 1.23.2); no se mencionan vLLM, llama.cpp, Ollama ni TGI, que ademas no aplican a este tipo de bundle NER/NLI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `iris-hq/iris-names` | Bundle ONNX NER + NLI (GLiNER 2.5 Base + DeBERTa-v3 Base) | no disponible (escala base) | no disponible | Apache-2.0 + MIT (ANLI CC BY-NC 4.0) | Hugging Face, ONNX |
| `fastino/gliner2.5-base-v1` | NER zero-shot (modelo base de la etapa 1) | no disponible (escala base) | no disponible | Apache-2.0 | Hugging Face |
| `MoritzLaurer/DeBERTa-v3-base-mnli-fever-anli` | NLI (modelo base de la etapa 2) | ~86M (escala base) | no disponible | MIT (entrenamiento parcial con ANLI CC BY-NC 4.0) | Hugging Face |
| `Xenova/DeBERTa-v3-base-mnli-fever-anli` | NLI en ONNX (origen del Q4F16) | ~86M (escala base) | no disponible | MIT | Hugging Face |

La comparativa relevante no es frente a modelos generativos, sino frente a sus propios componentes: `iris-names` anade al NER y al NLI originales el empaquetado ONNX reproducible, los parches de exportacion, la verificacion de integridad y la integracion en un flujo de dos etapas.

## Limitaciones y advertencias

- El bundle esta disenado para la funcion "Names only" de Iris; no es un modelo de proposito general ni sustituye a un LLM.
- Solo se exporta la ruta de spans de entidades de GLiNER 2.5; otras capacidades del modelo base pueden no estar presentes.
- La segunda etapa usa Q4F16, lo que introduce perdida de precision respecto al FP32 original; no se publican metricas de degradacion.
- El modelo DeBERTa-v3 de origen se entreno parcialmente con ANLI (CC BY-NC 4.0), lo que puede afectar al uso comercial pese a que la licencia declarada del bundle sea Apache-2.0 + MIT; debe revisarse `LICENSES.md`.
- No se declara lista de idiomas soportados; el rendimiento multilingue no esta documentado.
- No se publican benchmarks, sesgos conocidos ni tasas de alucinacion o falsos positivos.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion externa de la comunidad.
- La receta de exportacion depende de versiones muy concretas (`gliner2==2.1.0`, `onnxruntime==1.23.2`, `transformers==4.57.6`); cambios de version pueden romper la reproducibilidad.
- El proceso de exportacion requiere tres parches sobre el codigo de GLiNER; no es un export directo sin modificaciones.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/iris-hq/iris-names
- Licencias del bundle: https://huggingface.co/iris-hq/iris-names/blob/main/LICENSES.md
- Modelo base etapa 1 (GLiNER 2.5 Base): https://huggingface.co/fastino/gliner2.5-base-v1
- Modelo base etapa 2 (DeBERTa-v3 Base MNLI/FEVER/ANLI): https://huggingface.co/MoritzLaurer/DeBERTa-v3-base-mnli-fever-anli
- Version ONNX de etapa 2 (Xenova): https://huggingface.co/Xenova/DeBERTa-v3-base-mnli-fever-anli
