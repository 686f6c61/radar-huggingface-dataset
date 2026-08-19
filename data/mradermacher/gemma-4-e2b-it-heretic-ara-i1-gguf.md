# mradermacher/gemma-4-E2B-it-heretic-ara-i1-GGUF

## Resumen

El modelo `mradermacher/gemma-4-E2B-it-heretic-ara-i1-GGUF` es una cuantización GGUF con matriz de importancia (imatrix) del modelo base `p-e-w/gemma-4-E2B-it-heretic-ara`, una variante modificada de Gemma 4 (de Google DeepMind) orientada a eliminar restricciones de contenido (etiquetado como "uncensored", "decensored" y "abliterated"). El autor, mradermacher, es conocido por publicar cuantizaciones de modelos open source para su uso con herramientas como llama.cpp u Ollama. Este repositorio en particular contiene únicamente el archivo de imatrix para que los usuarios puedan generar sus propias cuantizaciones, mientras que las cuantizaciones estáticas se encuentran en un repositorio hermano.

El modelo base es un modelo de lenguaje multimodal (texto e imagen) de aproximadamente 2 mil millones de parámetros (según la nomenclatura E2B), aunque el metadato de HuggingFace indica 694.291 parámetros, un valor inconsistente que probablemente sea un error del autor. La licencia declarada es Apache 2.0 y el idioma soportado es inglés. Su relevancia radica en ofrecer una alternativa sin censura para desarrolladores que necesitan un modelo pequeño y desplegable en entornos con recursos limitados, aunque la información técnica detallada es escasa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 694.291 (dato del metadato; probablemente 2B reales) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | imatrix (archivo de calibración); las cuantizaciones estáticas (Q2_K, IQ3_M, Q4_K_S, etc.) están en el repositorio hermano |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (archivo de imatrix) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura del modelo base. Por el nombre, se infiere que deriva de Gemma 4 de Google, que es una familia de modelos transformer con capacidad multimodal (texto e imagen). La variante "heretic-ara" ha sido sometida a un proceso de "abliteration" (eliminación de capas o pesos relacionados con el rechazo de contenido) para reducir la censura. No se han publicado datos sobre el dataset de entrenamiento, número de tokens, o si se aplicaron técnicas como RLHF o DPO. El repositorio actual solo contiene el archivo de imatrix, que se utiliza para calibrar cuantizaciones de mayor calidad.

## Capacidades

- Generación de texto libre y continuaciones de contexto.
- Procesamiento de imágenes (el modelo base es multimodal, aunque los archivos mmproj se encuentran en el repositorio estático).
- Razonamiento básico y respuesta a instrucciones, con un sesgo hacia contenido sin filtros (por su naturaleza "uncensored").
- Soporte de tool calling y function calling: no confirmado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado.
- Capacidades multilingües: limitadas al inglés según la metadata.
- Modo de pensamiento (thinking mode): no disponible.

## Casos de uso

- Generación de contenido creativo sin restricciones: el modelo puede producir textos de ficción, guiones o diálogos con temáticas adultas o controvertidas, gracias a la eliminación de capas de rechazo.
- Asistente local para desarrollo de código: al ser pequeño, puede ejecutarse en portátiles con GPU modesta para autocompletar código o generar scripts, aunque no se confirma soporte de tool calling.
- Prototipado rápido de chatbots con personalidad no censurada: ideal para pruebas internas donde se requiere un comportamiento menos "policiado" que los modelos comerciales.
- Análisis de imágenes en entornos edge: al ser multimodal, puede procesar imágenes locales sin conexión, por ejemplo para clasificación básica o descripción de escenas.
- Investigación sobre alineación y censura: sirve como caso de estudio para comparar el comportamiento de modelos abliterados frente a sus versiones originales.
- Despliegue en dispositivos con poca memoria: con cuantizaciones Q4 o inferiores, cabe en Raspberry Pi o smartphones para aplicaciones de demostración.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de datos de MMLU, HumanEval, GSM8K u otras pruebas estandarizadas para este modelo ni para su variante base.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de ~2B parámetros, una cuantización Q4_K_M ocuparía aproximadamente 1,5-2 GB, por lo que es ejecutable en GPUs con 4 GB o menos.
- GPU recomendadas: cualquier GPU con soporte CUDA (GTX 1060 6GB, RTX 2060, RTX 3060, etc.) o incluso CPU con suficiente RAM (8 GB).
- Compatibilidad con consumer GPU: sí, es uno de los tamaños más accesibles.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, o cualquier runtime que soporte GGUF.
- Latencia y throughput: no se dispone de datos medidos, pero en una GPU moderna (RTX 4090) se espera una generación de decenas de tokens por segundo.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa fiable. El modelo base (Gemma 4 E2B) podría compararse con otros modelos de 2B como Qwen2.5-1.5B o Phi-3-mini, pero al ser una variante modificada y sin datos de rendimiento, no se puede realizar una comparación objetiva. Se indica "no disponible".

## Limitaciones y advertencias

- Sesgos conocidos: al ser una versión "uncensored", puede generar contenido ofensivo, violento o sexualmente explícito sin filtros, lo que supone un riesgo en entornos de producción.
- Riesgo de alucinación: alto, especialmente en temas factuales, dado el tamaño reducido del modelo.
- Limitaciones de contexto: se desconoce la longitud de contexto exacta, pero es probable que sea corta (≤8K tokens) por el tamaño del modelo.
- Restricciones de licencia: aunque la licencia es Apache 2.0, el modelo base de Google puede tener términos adicionales; se recomienda revisar la licencia específica de Gemma 4.
- Caveat para producción: no es recomendable para aplicaciones que requieran moderación o cumplimiento normativo; su uso debe limitarse a entornos controlados.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/gemma-4-E2B-it-heretic-ara-i1-GGUF
- Repositorio estático con cuantizaciones: https://huggingface.co/mradermacher/gemma-4-E2B-it-heretic-ara-GGUF
- Modelo base: https://huggingface.co/p-e-w/gemma-4-E2B-it-heretic-ara
- Página de Gemma 4 de Google DeepMind: https://deepmind.google/models/gemma/gemma-4/
- Repositorio espejo en GitHub: https://github.com/Damacol/mradermacher-gemma-4-e2b-it-heretic-ara-gguf
