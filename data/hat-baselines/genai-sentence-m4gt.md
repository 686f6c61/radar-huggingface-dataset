# HAT-Baselines/genai-sentence-m4gt

## Resumen

GenAI-Sentence M4GT es un checkpoint de deteccion de texto generado por IA a nivel de frase (sentence-level detection), publicado por el usuario HAT-Baselines. Se trata del checkpoint por defecto empleado para la evaluacion zero-shot en OpAI-Bench, un benchmark orientado a la deteccion de contenido sintetico. El modelo no es un generador de texto, sino un clasificador discriminativo: dado un texto, estima que frases concretas han sido producidas por un modelo generativo, en lugar de limitarse a etiquetar el documento completo.

Tecnicamente se construye sobre `microsoft/deberta-v3-base` como encoder, al que se anade una GRU bidireccional de dos capas con dimension oculta 512 y una capa CRF (conditional random field) para modelar la secuencia de etiquetas a nivel de frase. La configuracion conserva dropout 0.3 y una longitud maxima de entrada de 512 tokens. El repositorio contiene unicamente el state dict completo de PyTorch (`best.pt`, 774.251.090 bytes), la configuracion YAML de evaluacion y los checksums SHA256.

La relevancia del modelo es acotada y muy especifica: sirve como baseline reproducible para investigacion en deteccion de texto generado, especialmente en escenarios donde interesa localizar las frases sinteticas dentro de un documento mixto (parte humana, parte generada). No esta pensado como modelo de proposito general ni como servicio de inferencia listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DeBERTa-v3-base + GRU bidireccional de 2 capas (hidden 512) + CRF |
| Parametros totales | no disponible (el state dict ocupa 774.251.090 bytes) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens (longitud maxima de entrada configurada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | PyTorch state dict (`best.pt`) |
| Modelo base | microsoft/deberta-v3-base |
| Dropout | 0.3 |
| Tarea | Deteccion de texto generado por IA a nivel de frase |
| Tamano del repositorio | 0.8 GB |

## Arquitectura y entrenamiento

El modelo sigue un esquema de etiquetado de secuencias. Un encoder DeBERTa-v3-base produce representaciones contextuales de los tokens de entrada; sobre estas se aplica una GRU bidireccional de dos capas con dimension oculta 512 que agrega informacion secuencial, y finalmente una capa CRF que decodifica la secuencia de etiquetas a nivel de frase, imponiendo coherencia en las transiciones entre frases consecutivas. La entrada se trunca a 512 tokens y se mantiene dropout de 0.3 durante el entrenamiento.

No se dispone de informacion sobre el volumen de datos de entrenamiento, la composicion del corpus, el numero de tokens vistos ni si se aplicaron tecnicas de alineacion como RLHF o DPO; estos datos no aparecen en la model card. El autor remite a la descripcion metodologica en el repositorio `GenAI_Detect_Sentence_Level` para los detalles del procedimiento. La innovacion principal respecto a clasificadores de documento completo es la granularidad: el CRF permite etiquetar cada frase como humana o generada, lo que habilita analisis de documentos parcialmente sinteticos.

## Capacidades

- Deteccion de texto generado por IA a nivel de frase dentro de un documento.
- Etiquetado de secuencias con CRF, que impone coherencia entre etiquetas de frases contiguas.
- Evaluacion zero-shot sobre el benchmark OpAI-Bench.
- Clasificacion binaria por frase (humana / generada), segun la formulacion descrita.
- No soporta tool calling ni function calling.
- No implementa agentes ni razonamiento multi-paso.
- No dispone de capacidades multilingues declaradas.
- No dispone de modo thinking, vision ni audio.
- No es un modelo generativo: no produce texto.

## Casos de uso

- Investigacion en deteccion de texto generado: el checkpoint sirve como baseline reproducible para comparar metodos de deteccion a nivel de frase sobre OpAI-Bench, cargandolo con el loader del proyecto de evaluacion.
- Auditoria de documentos mixtos: permite localizar que frases concretas de un articulo, informe o entrega academica han sido generadas por IA, en lugar de emitir una unica etiqueta para todo el documento.
- Moderacion de contenido en plataformas: integrado en un pipeline de revision, puede marcar fragmentos sospechosos de origen sintetico para revision humana, reduciendo el volumen de texto a inspeccionar.
- Verificacion de integridad academica: analisis de trabajos de estudiantes para identificar secciones generadas, con la granularidad suficiente para distinguir parrafos propios de parrafos sinteticos.
- Analisis forense de textos periodisticos o corporativos: deteccion de inserciones generadas dentro de documentos de autoria humana, util en verificacion de fuentes.
- Reproduccion de experimentos: uso del checkpoint como referencia fija para validar nuevas implementaciones de detectores o para comparar arquitecturas alternativas bajo la misma configuracion de evaluacion.
- Construccion de datasets de deteccion: generacion de etiquetas a nivel de frase para anotar corpus de entrenamiento de detectores posteriores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente indica que el checkpoint es el utilizado por defecto para la evaluacion zero-shot en OpAI-Bench, sin aportar metricas numericas.

## Requisitos de hardware

- El state dict ocupa 774.251.090 bytes (aproximadamente 0,72 GB), lo que sugiere un modelo del orden de cientos de millones de parametros, coherente con DeBERTa-v3-base (~184 M) mas la GRU y el CRF.
- VRAM estimada para inferencia en FP32: en torno a 3-4 GB incluyendo activaciones para secuencias de 512 tokens.
- VRAM estimada en FP16: aproximadamente 1,5-2,5 GB.
- Cabe en cualquier GPU consumer moderna (RTX 3060 12 GB, RTX 4060, RTX 4090) y en GPUs de datacenter (A100, H100) sin problema.
- Tambien es viable la inferencia en CPU para volumenes moderados, dado el tamano reducido del modelo.
- Opciones de despliegue: al ser un state dict de PyTorch con arquitectura personalizada (DeBERTa + GRU + CRF), requiere el codigo del proyecto `GenAI_Detect_Sentence_Level` o el loader de OpAI-Bench; no es directamente compatible con vLLM, TGI, llama.cpp ni Ollama, que estan orientados a modelos generativos.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GenAI-Sentence M4GT | no disponible (state dict 774 MB) | 512 tokens | Deteccion de texto IA a nivel de frase | no disponible | Hugging Face, requiere codigo externo |
| Detectores basados en DeBERTa-v3-base (clasificacion de documento) | ~184 M | 512 tokens | Deteccion de texto IA a nivel de documento | variable segun autor | Hugging Face |
| Detectores basados en RoBERTa-base | ~125 M | 512 tokens | Deteccion de texto IA | variable segun autor | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada. La diferencia funcional principal de GenAI-Sentence M4GT frente a clasificadores de documento es la salida a nivel de frase mediante CRF, no necesariamente una mejora de exactitud global.

## Limitaciones y advertencias

- No se declara licencia, por lo que el uso comercial queda en un limbo juridico hasta que el autor la especifique.
- No se declaran idiomas soportados; el comportamiento fuera del ingles (idioma dominante en DeBERTa-v3) es incierto.
- La ventana de 512 tokens implica truncamiento en documentos largos; las frases mas alla del limite no se evaluan en una sola pasada.
- Riesgo de falsos positivos sobre texto humano formal o altamente predecible, comun en detectores de texto generado.
- Riesgo de degradacion frente a generadores no vistos durante el entrenamiento (generalizacion limitada a nuevos modelos y estilos).
- No se documentan sesgos especificos ni la composicion del dataset de entrenamiento, lo que dificulta evaluar su robustez por dominio.
- No es un modelo generativo: no debe emplearse para producir texto.
- Requiere codigo externo (loader de OpAI-Bench o el repositorio del autor) para la inferencia; no funciona con herramientas estandar de despliegue de LLMs.
- Sin descargas ni likes en el momento de la consulta, y sin pipeline declarado: ecosistema de soporte practicamente inexistente.

## Enlaces

- Hugging Face: https://huggingface.co/HAT-Baselines/genai-sentence-m4gt
- Codigo de evaluacion OpAI-Bench: https://huggingface.co/datasets/HAT-Baselines/tmp-opai-bench-code-2026-11-10-r3
- Repositorio metodologico: https://github.com/saitejalekkala33/GenAI_Detect_Sentence_Level
- Modelo base: https://huggingface.co/microsoft/deberta-v3-base
