# PUSHTYPE/talk-grammar-coreml

## Resumen

Talk grammar + paragraphs (Core ML) es un modelo compacto de correccion gramatical y segmentacion en parrafos desarrollado por PUSHTYPE para su producto Talk, orientado a inferencia en dispositivo (on-device) en plataformas Apple. Se trata de una reimplementacion propia de la arquitectura GECToR (Omelianchuk et al., 2020), un etiquetador de ediciones (edit tagger) construido sobre un encoder RoBERTa-base, al que se le anade una cabeza adicional de deteccion de saltos de parrafo sobre el mismo encoder, de modo que ambas tareas se resuelven en una sola pasada.

El modelo no genera texto libre: recibe una secuencia de tokens (hasta 128 posiciones) y emite, para cada pieza, una etiqueta de edicion (`best_id`), su probabilidad (`best_p`), la probabilidad de que el fragmento sea incorrecto (`p_incorrect`) y la probabilidad de que corresponda a un salto de parrafo (`p_paragraph`). Esta formulacion lo hace extremadamente ligero y adecuado para latencia baja en local, sin depender de servicios en la nube.

Su relevancia actual reside en el nicho de procesamiento de lenguaje en el borde: correccion de dictado, transcripcion o escritura asistida en tiempo real dentro de aplicaciones macOS/iOS. El repositorio es de apenas 0,1 GB, con pesos cuantizados a int8 en formato Core ML, lo que permite su despliegue en hardware de consumo Apple sin GPU dedicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (RoBERTa-base) con cabezas de etiquetado de ediciones estilo GECToR y de salto de parrafo |
| Parametros totales | no disponible (encoder RoBERTa-base, ~125 M por la arquitectura base citada; el autor no lo declara) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 128 tokens (entrada `input_ids` y `attention_mask` de 1 x 128) |
| Tipos de cuantizacion | int8 (pesos del paquete `.mlmodelc`) |
| Idiomas soportados | no disponible (la model card no declara idiomas; el entrenamiento con C4 y GECToR sugiere ingles) |
| Licencia | MIT |
| Formato de pesos | Core ML (`.mlmodelc`), mas `vocab.json`, `merges.txt`, `labels.txt`, `verbs.tsv` |

## Arquitectura y entrenamiento

El modelo sigue el paradigma GECToR: en lugar de generar la frase corregida token a token, predice una etiqueta de edicion por token (mantener, reemplazar, insertar, borrar, con transformaciones de formas verbales). Sobre el mismo encoder RoBERTa-base se anade una segunda cabeza que estima la probabilidad de salto de parrafo por pieza, compartiendo representaciones y resolviendo ambas tareas en una unica pasada. El vocabulario es byte-level BPE de RoBERTa mas un token especial `$START` con id 50265, y el archivo `verbs.tsv` contiene las transformaciones de formas verbales heredadas del vocabulario de ediciones de GECToR.

El entrenamiento se realizo con el corpus C4_200M de ediciones (licencia CC BY 4.0, texto ODC-BY) combinado con pares sinteticos de estilo hablado, y los saltos de parrafo se aprendieron a partir de documentos de C4. La model card indica que el vocabulario de ediciones y las formas verbales provienen de GECToR (Apache 2.0) y que el encoder base es RoBERTa-base (MIT). No se especifican en la informacion disponible el numero exacto de tokens de entrenamiento, la composicion detallada del dataset sintetico ni si se aplicaron etapas de RLHF o DPO.

## Capacidades

- Correccion gramatical a nivel de token mediante etiquetas de edicion (insercion, borrado, reemplazo y transformacion de formas verbales).
- Deteccion de saltos de parrafo en la misma pasada que la correccion, con una probabilidad por pieza (`p_paragraph`).
- Puntuacion de confianza por pieza: `best_p` (confianza de la etiqueta elegida) y `p_incorrect` (probabilidad de error en el fragmento).
- Inferencia on-device en formato Core ML con pesos int8, pensada para latencia baja y sin conexion.
- Procesamiento de secuencias de hasta 128 tokens por pasada.
- No soporta generacion de texto libre, tool calling, function calling, razonamiento multi-paso ni capacidades multimodales (vision, audio) segun la informacion disponible.
- Capacidades multilingues: no disponibles; el pipeline de entrenamiento descrito apunta a ingles.

## Casos de uso

- Correccion de dictado en tiempo real en apps de macOS/iOS: el modelo recibe la transcripcion tokenizada y devuelve las ediciones necesarias junto con la confianza por pieza, permitiendo aplicar correcciones locales sin enviar texto a un servidor.
- Escritura asistida en editores de texto: integrado como paso de post-proceso, corrige concordancia y formas verbales mientras el usuario escribe, usando `p_incorrect` para decidir si mostrar sugerencias.
- Segmentacion automatica de parrafos en notas de voz transcritas: la cabeza `p_paragraph` permite insertar saltos de parrafo en transcripciones largas divididas en ventanas de 128 tokens.
- Preprocesado de corpus para pipelines de NLP: normalizacion gramatical y estructuracion en parrafos de texto procedente de OCR o ASR antes de indexarlo o analizarlo.
- Filtrado de calidad en datasets: usar `p_incorrect` como senal para descartar o marcar fragmentos ruidosos en corpus generados por reconocimiento de voz.
- Asistencia a la accesibilidad: correccion ligera de texto introducido por voz en herramientas de comunicacion aumentativa, con inferencia local que preserva la privacidad del contenido.
- Moderacion de formato en plataformas de publicacion: deteccion de parrafos mal segmentados en textos enviados por usuarios antes de su publicacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el repositorio ocupa 0,1 GB y los pesos estan cuantizados a int8, por lo que la huella de memoria es del orden de decenas de MB.
- GPU recomendadas: no aplica en el sentido tradicional; el formato Core ML esta orientado a Apple Neural Engine (ANE) y GPU integrada de chips Apple Silicon (serie M) y A-series.
- Cabe en hardware de consumo: si, en cualquier dispositivo Apple compatible con Core ML; no esta pensado para GPU NVIDIA.
- Opciones de despliegue: Core ML (`.mlmodelc`) en macOS/iOS; no se mencionan exportaciones a vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Despliegue |
|---|---|---|---|---|---|
| Talk grammar + paragraphs (Core ML) | ~125 M (RoBERTa-base, no declarado) | 128 tokens | Correccion gramatical + parrafos | MIT | Core ML on-device |
| GECToR (referencia original) | ~125 M (RoBERTa-base) | 128 tokens | Correccion gramatical | Apache 2.0 | PyTorch |
| Modelos GEC generativos tipo T5-base | ~220 M | 512 tokens | Correccion gramatical | Apache 2.0 | PyTorch/ONNX |

La comparativa se limita a la referencia arquitectonica citada por el autor (GECToR) y a la familia de correctores generativos; no se dispone de datos de rendimiento comparado para este modelo concreto.

## Limitaciones y advertencias

- Ventana de contexto muy corta (128 tokens), lo que obliga a dividir textos largos en ventanas y puede perder coherencia entre fragmentos.
- No es un modelo generativo: no reescribe frases completas, solo aplica ediciones locales segun el vocabulario de etiquetas.
- Idiomas soportados no declarados; el entrenamiento descrito (C4_200M, GECToR) sugiere un sesgo fuerte hacia ingles.
- Riesgo de falsos positivos y negativos en la correccion: `p_incorrect` debe calibrarse antes de aplicar ediciones automaticas en produccion.
- La deteccion de parrafos se aprendio de documentos de C4, por lo que puede no generalizar a estilos conversacionales o transcripciones de ASR.
- Sin datos publicados de benchmarks ni evaluacion independiente; el modelo tiene 0 descargas y 0 likes en el momento de la consulta.
- Licencia MIT declarada por el autor, pero el pipeline combina componentes con licencias distintas (RoBERTa-base MIT, GECToR Apache 2.0, C4_200M CC BY 4.0 / ODC-BY); conviene verificar el cumplimiento de atribucion en uso comercial.
- Dependencia del ecosistema Apple: el formato Core ML limita su uso fuera de macOS/iOS sin conversion adicional.

## Enlaces

- Hugging Face: https://huggingface.co/PUSHTYPE/talk-grammar-coreml
- GECToR (paper de referencia, Omelianchuk et al. 2020): https://arxiv.org/abs/2005.12592
- Repositorio GECToR: https://github.com/grammarly/gector
- C4_200M (dataset de ediciones sinteticas): https://huggingface.co/datasets/grammarly/c4_200m
- RoBERTa (paper del encoder base): https://arxiv.org/abs/1907.11692
