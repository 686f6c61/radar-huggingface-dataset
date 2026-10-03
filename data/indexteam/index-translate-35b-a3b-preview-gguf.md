# IndexTeam/Index-Translate-35B-A3B-preview-GGUF

## Resumen

Index-Translate-35B-A3B-preview-GGUF es la conversion oficial al formato GGUF del modelo IndexTeam/Index-Translate-35B-A3B-preview, un modelo de traduccion automatica multilingue desarrollado por el equipo Index (vinculado al repositorio github.com/bilibili/Index-Translate). Forma parte de la familia Index-Translate, orientada a traduccion en 150 idiomas con tres capacidades destacadas: traduccion con restricciones de terminologia y formato, traduccion controlada para doblaje y traduccion de documentos largos. Esta publicacion concreta contiene el artefacto listo para llama.cpp, con todas las cuantizaciones en un unico repositorio.

El modelo sigue una arquitectura de mezcla de expertos (MoE): la nomenclatura 35B-A3B indica aproximadamente 35 000 millones de parametros totales y unos 3000 millones de parametros activos por token. Esa relacion hace que el coste de computo por token se acerque al de un modelo denso de 3B, mientras que la capacidad de representacion se aproxima a la de un modelo de 35B, lo que resulta atractivo para desplegar traduccion de alta calidad en hardware de gama alta de consumo. La publicacion incluye ademas un proyector multimodal (mmproj) que habilita la entrada de imagenes a traves de una torre de vision.

Su relevancia actual es doble: por un lado, ofrece una alternativa de pesos abiertos bajo licencia Apache 2.0 en un nicho dominado por modelos con licencias no comerciales; por otro, al estar cuantizado en llama.cpp, permite ejecucion local con privacidad total de los textos traducidos, algo critico para documentacion legal, medica o corporativa. La version es una "preview", por lo que conviene tratarla como candidata a evaluacion antes de un despliegue en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), segun la nomenclatura 35B-A3B; incluye torre de vision con proyector multimodal (mmproj) |
| Parametros totales | ~35 000 millones (inferido del nombre del modelo; no confirmado en la informacion disponible) |
| Parametros activos | ~3000 millones (sufijo A3B); no confirmado en la informacion disponible |
| Longitud de contexto | no disponible; la model card menciona soporte para traduccion de documentos largos |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 y f16; proyector multimodal en Q8_0 y f16 |
| Idiomas soportados | 150 idiomas segun la model card; los metadatos de HuggingFace no detallan la lista |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) en esta publicacion; el formato del repositorio base no se detalla en la informacion proporcionada |

## Arquitectura y entrenamiento

La informacion disponible no describe en detalle la arquitectura interna. Lo que se puede afirmar con los datos aportados es que se trata de un modelo de mezcla de expertos (MoE) con aproximadamente 35 000 millones de parametros totales y unos 3000 millones activos, convertido a GGUF con llama.cpp (rama master, octubre de 2026) mediante cuantizacion estatica posterior al entrenamiento. La publicacion incluye un proyector multimodal independiente que da soporte a entrada de imagenes mediante `llama-mtmd-cli`; para traduccion solo de texto, los ficheros GGUF estandar son suficientes. No se especifican en la informacion proporcionada el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de alineacion como RLHF o DPO.

Si se detalla el enfoque funcional de la familia: traduccion multilingue con restricciones de terminologia y formato (formato instTrans), traduccion controlada para doblaje y traduccion de documentos largos. El prompt de traduccion documentado esta en chino y fuerza la salida directa de la traduccion sin explicaciones, con decodificacion greedy y temperatura 0 recomendadas. Antes de la publicacion, cada nivel de cuantizacion se valido en GPU NVIDIA A100 contra la conversion F16 usando divergencia KL por token y RMS de la diferencia de probabilidades con `llama-perplexity`, ademas de comprobaciones puntuales de generacion greedy contra los pesos BF16 originales en transformers. Segun la model card, las salidas de Q4_K_M coinciden casi literalmente con la referencia.

## Capacidades

- Traduccion automatica multilingue en 150 idiomas, con ingles y chino documentados en el formato de prompt.
- Traduccion con restricciones de terminologia y formato (formato instTrans): permite imponer glossarios y mantener intactas etiquetas, marcadores de posicion o estructuras concretas.
- Traduccion controlada para doblaje, orientada a produccion audiovisual con restricciones de formato y duracion.
- Traduccion de documentos largos, apoyada en el procesamiento por fragmentos y en la ventana de contexto del modelo (longitud no especificada).
- Entrada de imagenes mediante el proyector multimodal mmproj, util para traducir texto presente en capturas o imagenes.
- Decodificacion determinista recomendada (greedy, temperatura 0) para maximizar la fidelidad y la reproducibilidad de la traduccion.
- Ejecucion local con llama.cpp, sin dependencia de servicios en la nube.
- No se documentan en la informacion disponible capacidades de tool calling, razonamiento multi-paso, agentes, audio ni modo de pensamiento explicito.

## Casos de uso

- Localizacion de documentacion tecnica con terminologia controlada: el modelo permite fijar un glossario y preservar el formato de origen, de modo que los identificadores de API, fragmentos de codigo y nombres de parametros no se traduzcan. Es adecuado porque el formato instTrans esta disenado precisamente para imponer ese tipo de restricciones.
- Doblaje y subtitulado: la familia incluye traduccion controlada para doblaje, lo que permite generar lineas ajustadas a restricciones de formato y longitud. Se integraria en un pipeline que extraiga subtitulos, traduzca por segmentos y valide la sincronia despues de la traduccion.
- Traduccion de contratos y documentacion legal en local: al ejecutarse con llama.cpp sobre hardware propio, los textos confidenciales no salen de la infraestructura de la organizacion. Requiere revision humana posterior por el riesgo de alucinacion en terminologia juridica.
- Traduccion de expedientes y documentacion clinica: mismo argumento de privacidad, con la ventaja de poder fijar terminologia medica mediante glossario. La cuantizacion Q4_K_M o superior es recomendable para reducir perdida de fidelidad terminologica.
- Internacionalizacion de software (i18n): traduccion de ficheros de recursos manteniendo variables, etiquetas HTML y marcadores de posicion sin alterar, gracias a las restricciones de formato. Encaja en un pipeline de CI/CD que genere los ficheros de idioma a partir de la plantilla en el idioma origen.
- Traduccion de articulos y documentos largos: el modelo esta pensado para documentos extensos, de modo que se puede trocear el texto por secciones, traducir cada fragmento con el mismo prompt y recomponer el resultado, manteniendo coherencia terminologica con un glossario compartido.
- Traduccion de texto en imagenes (capturas, escaneos, interfaces): con los ficheros mmproj y `llama-mtmd-cli` se puede pasar una imagen como entrada y obtener la traduccion del texto que contiene, util para catalogos, manuales escaneados o capturas de aplicaciones.
- Asistencia a traductores profesionales: integrado como motor local detras de una API compatible con llama.cpp, sirve para pre-traduccion masiva en herramientas TAO/CAT, reduciendo coste por palabra y evitando enviar material bajo embargo a terceros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de evaluacion aportado es la validacion de consistencia de las cuantizaciones: cada nivel se comparo contra la conversion F16 en GPU NVIDIA A100 con divergencia KL por token y RMS de la diferencia de probabilidades mediante `llama-perplexity`, mas comprobaciones puntuales de generacion greedy contra los pesos BF16 de referencia. La model card indica que las salidas de Q4_K_M coincidieron casi literalmente con la referencia, y que Q2_K y los niveles Q3_K presentan perdida de calidad significativa o apreciable segun el propio autor.

| Metrica | Resultado |
|---|---|
| MMLU | no disponible |
| HumanEval | no disponible |
| GSM8K | no disponible |
| BLEU / COMET / chrF en traduccion | no disponible |
| Divergencia KL frente a F16 por cuantizacion | no disponible (se indica que se midio, sin valores publicados) |

## Requisitos de hardware

- VRAM estimada segun el fichero: Q2_K 13,25 GB; Q3_K_S 15,55 GB; Q3_K_M 17,17 GB; Q3_K_L 18,55 GB; IQ4_XS 19,39 GB; Q4_K_S 20,37 GB; Q4_K_M 21,71 GB; Q5_K_S 24,56 GB; Q5_K_M 25,35 GB; Q6_K 29,21 GB; Q8_0 37,80 GB; f16 71,07 GB (dos fragmentos).
- Proyector multimodal adicional: 0,61 GB en Q8_0 y 0,90 GB en f16, solo necesario si se usan entradas de imagen.
- GPU de consumo: Q4_K_M (21,71 GB) es el nivel mas alto que entra con holgura en una RTX 3090 o RTX 4090 de 24 GB, aunque con margen reducido para cache KV; Q3_K_L e inferiores dejan mas espacio para contexto. Q5_K_M y superiores no caben en 24 GB y requieren dos GPU o una tarjeta de 32 GB o mas.
- GPU profesionales: una A100 40 GB o una A6000 48 GB cubren hasta Q6_K; Q8_0 (37,80 GB) requiere 48 GB o mas; f16 (71,07 GB) necesita dos A100 80 GB, dos H100 80 GB o una H100 80 GB con contexto muy limitado.
- Despliegue: llama.cpp es el entorno de referencia (`llama serve` y `llama cli` con `-hf IndexTeam/Index-Translate-35B-A3B-preview-GGUF:Q4_K_M`), y `llama-mtmd-cli` para el modo multimodal. Otros servidores con soporte GGUF (Ollama, LM Studio, servidores basados en llama.cpp) son opciones naturales; no se documenta soporte nativo en vLLM o TGI en la informacion proporcionada.
- Latencia y throughput: no disponibles. Por arquitectura MoE con unos 3000 millones de parametros activos, el coste de decodificacion por token deberia ser muy inferior al de un modelo denso de 35B, pero no se aportan medidas.
- Nota de calidad: la propia model card desaconseja implicitamente los niveles bajos para uso serio (Q2_K con perdida de calidad significativa, Q3_K con perdida apreciable) y recomienda Q4_K_M como equilibrio entre tamano y fidelidad.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de Index-Translate en la informacion proporcionada, por lo que la comparacion se limita a caracteristicas verificables de alternativas conocidas en traduccion automatica de pesos abiertos. Los valores de modelos de terceros proceden de su documentacion publica y deben verificarse antes de tomar decisiones.

| Modelo | Parametros | Idiomas | Licencia | Contexto | Disponibilidad |
|---|---|---|---|---|---|
| Index-Translate-35B-A3B-preview | ~35B totales, ~3B activos (MoE) | 150 | Apache 2.0 | no disponible | GGUF en llama.cpp; base en HuggingFace |
| NLLB-200 (variante MoE) | ~54B totales (MoE) | 200 | CC-BY-NC-4.0 (no comercial) | no disponible | Pesos en HuggingFace, transformers |
| MADLAD-400 | 10,7B (denso) | 419 | Apache 2.0 | no disponible | Pesos en HuggingFace, transformers |
| SeamlessM4T v2 | ~2,3B | ~100 (texto) | CC-BY-NC-4.0 (no comercial) | no disponible | Pesos en HuggingFace |

El diferencial mas claro de Index-Translate frente a NLLB-200 y SeamlessM4T v2 es la licencia Apache 2.0, que permite uso comercial sin las restricciones no comerciales de aquellos. Frente a MADLAD-400, la ventaja declarada esta en las capacidades de traduccion restringida por terminologia y formato, y en el modo de doblaje controlado; el rendimiento relativo de traduccion no puede evaluarse sin benchmarks publicados.

## Limitaciones y advertencias

- Modelo en version "preview": puede cambiar sin aviso y no se garantiza estabilidad de comportamiento ni de API de prompt entre versiones.
- No se han publicado resultados de benchmarks (BLEU, COMET, chrF, MMLU) en la informacion disponible, por lo que no es posible cuantificar su calidad de traduccion frente a alternativas.
- Longitud de contexto no especificada: para documentos largos habra que trocear el texto, con el riesgo de perder coherencia entre fragmentos si no se gestiona un glossario y un contexto compartido.
- Riesgo de alucinacion y de omision de contenido, especialmente en textos con terminologia muy especializada o con referencias culturales; la propia familia de modelos se orienta a salida directa sin explicaciones, lo que dificulta detectar errores desde la propia salida.
- Sesgos inhererentes a los datos de entrenamiento, que no se describen en la informacion proporcionada; no se puede evaluar la cobertura real ni el equilibrio entre idiomas dentro de los 150 declarados.
- La lista completa de los 150 idiomas no esta disponible en los metadatos de HuggingFace; la cobertura real por idioma y su calidad relativa son desconocidas.
- Perdida de calidad por cuantizacion: Q2_K y la familia Q3_K presentan perdida significativa o apreciable segun el autor. Para produccion se recomienda Q4_K_M o superior, y validar con un conjunto propio.
- El formato de prompt documentado esta en chino; usarlo tal cual con otro idioma de instruccion puede degradar el resultado.
- La decodificacion recomendada es greedy con temperatura 0; configuraciones con muestreo aleatorio no estan validadas por el autor.
- Licencia Apache 2.0, permisiva para uso comercial, pero conviene revisar las condiciones del modelo base y las obligaciones de atribucion; algunos componentes (por ejemplo, la torre de vision) podrian tener condiciones distintas no detalladas.
- El identificador arXiv indicado en la model card (2609.40181) corresponde a una fecha de 2026; conviene verificar su disponibilidad y contenido antes de citarlo.
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo: los resultados obtenidos eran de un sitio para adultos sin relacion con el modelo, por lo que se han descartado.

## Enlaces

- Pagina HuggingFace del repositorio GGUF: https://huggingface.co/IndexTeam/Index-Translate-35B-A3B-preview-GGUF
- Modelo base: https://huggingface.co/IndexTeam/Index-Translate-35B-A3B-preview
- Informe tecnico (arXiv): https://arxiv.org/abs/2609.40181
- Codigo: https://github.com/bilibili/Index-Translate
- llama.cpp: https://github.com/ggml-org/llama.cpp
- La busqueda web no aporto enlaces adicionales relevantes sobre este modelo.
