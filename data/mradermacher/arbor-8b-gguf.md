# mradermacher/Arbor-8B-GGUF

## Resumen

Arbor-8B-GGUF es un repositorio de pesos cuantizados en formato GGUF generado por mradermacher a partir del modelo base pinkachu/Arbor-8B. No se trata, por tanto, de un modelo entrenado desde cero, sino de una conversión de un modelo ya existente (a su vez descrito por su autor como un merge realizado con mergekit) a los formatos de cuantización que consume la familia de herramientas llama.cpp. El modelo cuenta con 8.030.261.312 parámetros reales según los metadatos de safetensors, lo que lo sitúa en la categoría de ~8B.

El repositorio ofrece doce variantes de cuantización estática, desde Q2_K (3,3 GB) hasta f16 (16,2 GB), e indica que existen variantes ponderadas/imatrix en un repositorio hermano (mradermacher/Arbor-8B-i1-GGUF). Está etiquetado como `conversational`, `endpoints_compatible` y de idioma inglés (`en`), lo que sugiere un uso previsto de asistente conversacional en inglés; no se documenta soporte multilingüe.

La relevancia de esta ficha es práctica: permite ejecutar localmente un modelo de ~8B en hardware de consumo mediante cuantización, pero la documentación publicada es mínima. No se declara licencia, no se especifica la longitud de contexto, no se detalla el método de merge ni los modelos de origen, y no hay benchmarks ni evaluación publicada. Cualquier uso en producción debería partir de esa incertidumbre.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el autor del modelo base lo etiqueta como merge generado con mergekit; no se documenta la arquitectura subyacente) |
| Parametros totales | 8.030.261.312 (~8,03B) |
| Parametros activos | no aplica / no disponible (no se describe como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 (estaticas); existen variantes ponderadas/imatrix en mradermacher/Arbor-8B-i1-GGUF |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF (el modelo base usa safetensors) |
| Modelo base | pinkachu/Arbor-8B |
| Cuantizado por | mradermacher |
| Tamano del repositorio | 71,8 GB |
| Fecha de creacion (segun HuggingFace) | 2026-10-02 |
| Ultima actualizacion (segun HuggingFace) | 2026-10-02 |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo. Lo unico documentado es que pinkachu/Arbor-8B fue producido mediante mergekit, una herramienta de fusion de pesos que combina los tensores de varios modelos ya entrenados (mediante tecnicas como SLERP, TIES, DARE u otras) sin necesidad de reentrenamiento completo. El resultado de un merge de este tipo suele ser un modelo denso de la misma familia arquitectonica que sus progenitores, pero ni el README del GGUF ni la informacion disponible identifican los modelos de origen, el metodo de fusion exacto ni la receta de hiperparametros.

Tampoco hay datos sobre el entrenamiento original: no se indica el numero de tokens, la composicion del dataset ni si hubo fases de ajuste fino supervisado, RLHF o DPO. Las unicas etiquetas tecnicas relevantes son `mergekit`, `merge` y `conversational`. El proceso realizado por mradermacher consiste en convertir los pesos originales a GGUF y generar cuantizaciones estaticas de 2 a 16 bits por peso; los metadatos internos de la model card (`quantize_version: 2`, `output_tensor_quantised: 1`, `convert_type: hf`) confirman que se partio de un checkpoint en formato HuggingFace.

## Capacidades

- Generacion de texto conversacional en ingles: el modelo esta etiquetado como `conversational` y `endpoints_compatible`, orientado a dialogos de tipo asistente.
- Razonamiento y respuesta a instrucciones: no hay evaluacion publicada que cuantifique el rendimiento en tareas de razonamiento, matematicas o codigo.
- Soporte de tool calling / function calling: no disponible (no se documenta).
- Soporte de agentes y razonamiento multi-paso: no disponible (no se documenta).
- Capacidades multilingues: limitadas al ingles segun la etiqueta de idioma; no se declara soporte de otros idiomas.
- Capacidades especiales (modo thinking, vision, audio): no disponible (no se documenta ninguna).
- Despliegue local: al estar en GGUF, es compatible con el ecosistema llama.cpp, lo que permite ejecucion en CPU, GPU o modo hibrido.

## Casos de uso

- Asistente conversacional local en ingles: con la variante Q4_K_M (5,0 GB) el modelo cabe en GPUs de consumo y puede mantener dialogos de asistente sin enviar datos a servicios externos, lo que resulta adecuado para entornos con requisitos de privacidad.
- Prototipado rapido de chatbots: gracias a las doce cuantizaciones disponibles se puede probar primero una variante Q3_K_M (4,1 GB) para validar el comportamiento y despues subir a Q6_K o Q8_0 si la calidad no es suficiente.
- Procesamiento de texto por lotes en CPU: la variante Q2_K (3,3 GB) o Q3_K_S (3,8 GB) permite ejecutar generacion de texto en servidores sin GPU, por ejemplo para resumir o reformular documentos en ingles.
- Generacion de borradores y reescritura de contenido: para tareas de redaccion asistida en ingles donde se prioriza el coste por token bajo frente a la precision absoluta.
- Entornos educativos y de investigacion: sirve como banco de pruebas para comparar el efecto de distintas cuantizaciones (Q2_K frente a Q8_0) sobre la calidad de un mismo modelo de ~8B.
- Despliegue en edge o en portatiles: la variante IQ4_XS (4,6 GB) es un compromiso habitual entre tamano y calidad para equipos con 8 GB de VRAM o con memoria unificada.
- Base para experimentos de merge: dado que el modelo base es un merge de mergekit, este repositorio permite estudiar como se comportan los pesos fusionados tras cuantizacion agresiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Ni la model card del GGUF ni los metadatos del repositorio incluyen valores de MMLU, HumanEval, GSM8K, MT-Bench ni de ninguna otra evaluacion. Tampoco se ofrecen mediciones de perplejidad por tipo de cuantizacion, mas alla de la referencia generica a un grafico comparativo de terceros (ikawrakow) enlazado en el README, que no es especifico de este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: el peso del fichero es el componente dominante; hay que sumar la cache KV, que crece con la longitud de contexto (unos cientos de MB a varios GB adicionales, no cuantificados en la informacion disponible).
  - Q2_K (3,3 GB): ~4 GB de VRAM.
  - Q3_K_M (4,1 GB) / Q3_K_L (4,4 GB): ~5 GB.
  - IQ4_XS (4,6 GB) / Q4_K_S (4,8 GB): ~5,5 GB.
  - Q4_K_M (5,0 GB): ~6 GB.
  - Q5_K_S (5,7 GB) / Q5_K_M (5,8 GB): ~7 GB.
  - Q6_K (6,7 GB): ~8 GB.
  - Q8_0 (8,6 GB): ~10 GB.
  - f16 (16,2 GB): ~17-18 GB.
- GPU recomendadas:
  - RTX 3060 12 GB o RTX 4060 Ti 16 GB: ejecutan con holgura hasta Q8_0 con contexto moderado.
  - RTX 4070 / 4080 / 4090 (12-24 GB): Q4_K_M y Q5_K_M son las opciones mas equilibradas; Q8_0 entra sin problema en la 4090.
  - A100 40/80 GB y H100: pensadas para servir varias instancias concurrentes o contexto largo, no para una sola copia del modelo.
- Cabe en GPU de consumo: si. Practicamente cualquier GPU con 8 GB o mas puede ejecutar las cuantizaciones de 4 bits; las variantes Q2 y Q3 permiten incluso GPU de 6 GB, y las de 2-4 bits funcionan tambien en modo hibrido CPU+GPU.
- Opciones de despliegue: llama.cpp (formato nativo), Ollama, LM Studio, llama-cpp-python, y servidores compatibles con la API de endpoints de HuggingFace para GGUF. No se documenta soporte especifico de vLLM o TGI para este repositorio, aunque existen rutas de conversion de GGUF a otros runtimes.
- Latencia y throughput estimados: no disponible; no se han publicado mediciones.

## Comparativa con modelos similares

No hay datos de rendimiento de Arbor-8B-GGUF, por lo que la comparacion es estructural (tamano, contexto, licencia y disponibilidad en GGUF) y se apoya en caracteristicas publicas de modelos de referencia de la misma categoria. Los datos del modelo evaluado son los unicos verificados en la informacion proporcionada.

| Modelo | Parametros | Contexto | Licencia | GGUF disponible | Rendimiento publicado |
|---|---|---|---|---|---|
| mradermacher/Arbor-8B-GGUF | ~8,03B | no disponible | no disponible | si (12 cuantizaciones) | no disponible |
| meta-llama/Llama-3.1-8B-Instruct | ~8,03B | 128K | Llama 3.1 Community License | si (por terceros) | si, ampliamente documentado |
| Qwen/Qwen2.5-7B-Instruct | ~7,6B | 128K | Apache 2.0 | si (por terceros) | si, ampliamente documentado |
| mistralai/Mistral-7B-Instruct-v0.3 | ~7,25B | 32K | Apache 2.0 | si (por terceros) | si, ampliamente documentado |

Nota: los valores de los tres modelos de referencia son caracteristicas publicas conocidas de sus respectivos repositorios; no implican una comparacion de calidad con Arbor-8B, para la que no existe evaluacion.

## Limitaciones y advertencias

- Licencia no declarada: ni el repositorio GGUF ni la informacion disponible indican licencia. Sin una licencia explicita no hay autorizacion clara para uso comercial ni para redistribucion, y ademas habria que verificar las licencias de los modelos de origen del merge, que tampoco se identifican.
- Ausencia total de benchmarks: no hay ninguna evaluacion publicada, por lo que se desconoce su calidad real en razonamiento, codigo, matematicas o seguimiento de instrucciones.
- Riesgo de alucinacion: al no existir evaluacion ni documentacion de entrenamiento, no hay datos sobre tasas de alucinacion ni sobre fases de alineacion (RLHF/DPO).
- Idioma: soporte declarado unicamente en ingles. El uso en castellano no esta respaldado por la etiqueta de idioma y previsiblemente degradara la calidad.
- Longitud de contexto desconocida: no se puede planificar un caso de uso que dependa de ventanas largas sin verificarlo experimentalmente.
- Trazabilidad del merge: al no documentarse los modelos de origen ni la receta de mergekit, no se puede auditar la procedencia de los pesos ni los sesgos heredados.
- Cuantizaciones agresivas: las variantes Q2_K y Q3_K_S degradan la calidad de forma notable; el propio README marca Q3_K_M como "lower quality" y recomienda Q4_K_S/Q4_K_M como opciones rapidas. No se aportan mediciones de perplejidad para este modelo concreto.
- Metadatos incoherentes: las fechas de creacion y actualizacion del repositorio figuran como 2026, ademas de mostrar cero descargas y cero likes, lo que sugiere un artefacto de publicacion reciente o de escasa difusion; conviene verificar la vigencia antes de integrarlo.
- Sin garantias de mantenimiento: el repositorio es una cuantizacion de terceros; el autor de la cuantizacion no es el autor del modelo base.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Arbor-8B-GGUF
- Modelo base: https://huggingface.co/pinkachu/Arbor-8B
- Cuantizaciones ponderadas/imatrix: https://huggingface.co/mradermacher/Arbor-8B-i1-GGUF
- Pagina de resumen y descargas del autor: https://hf.tst.eu/model#Arbor-8B-GGUF
- Peticiones de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF referenciada en el README: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas sobre tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Grafico comparativo de perplejidad por cuantizacion (ikawrakow), enlazado en el README: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Empresa que soporta al autor: https://www.nethype.de/
