# FoolDev/Thanatos-27B-HERETIC

## Resumen

Thanatos-27B-HERETIC es un modelo de lenguaje denso de 27.320.697.856 parámetros (unos 27,3 B) publicado por el usuario FoolDev en Hugging Face. No es un modelo entrenado desde cero: el propio autor lo describe como un reempaquetado y cuantización del modelo base `heretic-org/Qwen3.8-27B-heretic-ara`, una ablación por el método ARA (una variante de *abliteration*) del Qwen 3.8 27B denso, orientada a reducir el comportamiento de rechazo entrenado. El repositorio distribuye pesos en formato GGUF, con una cuantización Q4_K_M de mradermacher y la plantilla de chat del repositorio estampada.

El modelo se presenta como multimodal (pipeline `image-text-to-text`), con soporte de agentes, razonamiento y conversación, y con una ventana de contexto declarada de 262.144 tokens nativos y hasta 1.010.000 tokens extensibles. Incorpora, desde la versión 0.13.0, el bloque de predicción multi-token (MTP) del modelo base, que Ollama y llama.cpp pueden usar para decodificación especulativa. La licencia es Apache 2.0 y cubre 22 idiomas, entre ellos el castellano.

Su relevancia actual es doble: por un lado, ofrece un modelo denso de 27 B con contexto muy largo en un único archivo GGUF de aproximadamente 17 GB, desplegable en Ollama con un solo comando; por otro, ejemplifica el ecosistema de variantes «uncensored» derivadas de modelos Qwen, con las ventajas y los riesgos que eso conlleva. Conviene subrayar que el autor advierte explícitamente de que en este repositorio no se entrena nada y de que parte de la atribución de datasets y profesor es herencia de revisiones anteriores de la model card, sin verificar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen 3.8 27B), con bloque de predicción multi-token (MTP) conservado desde 0.13.0 |
| Parametros totales | 27.320.697.856 (unos 27,3 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens nativos; 1.010.000 tokens extensibles (según model card) |
| Tipos de cuantizacion | GGUF Q4_K_M incluido en el repositorio; otras cuantizaciones vía `make build` a partir de `mradermacher/Qwen3.8-27B-heretic-ara-GGUF` |
| Idiomas soportados | en, zh, ru, es, fr, it, ja, ko, de, ar, tr, pl, sv, nl, he, id, uk, fa, pt, ms, fi, el (22 idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repositorio de 301,3 GB con múltiples archivos; el blob Q4_K_M principal ronda los 17 GB) |

## Arquitectura y entrenamiento

La arquitectura es la de Qwen 3.8 27B en configuración densa: un transformer decoder-only con atención completa, sin mezcla de expertos. El repositorio no entrena ni afina el modelo; su aportación es de empaquetado y cuantización. El blob incluido es la cuantización Q4_K_M de mradermacher del modelo `heretic-org/Qwen3.8-27B-heretic-ara`, con la plantilla de chat del repositorio estampada y, desde la versión 0.13.0, el bloque MTP conservado; el autor afirma que todos los tensores son idénticos byte a byte al archivo de mradermacher y que se verifican con `make verify-arch`. El modelo base es, a su vez, una ablación por el método ARA de Qwen 3.8 27B, es decir, una modificación de pesos orientada a atenuar las respuestas de rechazo.

Sobre los datos de entrenamiento hay que ser especialmente cautos. La model card lista seis datasets (Crownelius/Creative_Writing_ShareGPT_Enhanced, microsoft/rStar-Coder, peteromallet/dataclaw-peteromallet, Crownelius/Opus-4.7-Reasoning, openbmb/UltraData-Math y Crownelius/Crow-Heretic-TeichAI-Unified) y nombra a «Claude Fable 5» como profesor de destilación, pero el propio autor aclara que esos campos son herencia de revisiones anteriores de la tarjeta y que el modelo base actual no los reclama: su card no lista datasets ni profesor. Además, `Crownelius/Opus-4.7-Reasoning` no es accesible públicamente (el Hub devuelve 401). No hay información verificable sobre número de tokens, composición del corpus ni si hubo RLHF o DPO en la cadena de entrenamiento.

La innovación técnica destacable es la conservación del bloque MTP para decodificación especulativa: según el autor, en respuestas de 300 tokens la generación resultó entre 1,1 y 1,5 veces más rápida en su equipo de pruebas con CPU. También se distribuye un proyector de visión que permite pasar imágenes al modelo a través de Ollama.

## Capacidades

- Generación de texto conversacional multi-turno con contexto muy largo (hasta 262.144 tokens nativos).
- Razonamiento y modo de pensamiento, heredado de la familia Qwen 3.8 y reforzado, según la atribución no verificada, por destilación de razonamiento.
- Generación de código, con datasets de código y matemáticas listados en la atribución (rStar-Coder, UltraData-Math).
- Capacidades matemáticas, presumiblemente reforzadas por el corpus de matemáticas citado.
- Multimodalidad imagen-texto: el repositorio incluye proyector de visión y la etiqueta de pipeline es `image-text-to-text`; probado con imágenes en Ollama 0.40.17.
- Soporte de tool calling y function calling mediante la plantilla de chat incluida en el repositorio.
- Capacidades de agente y razonamiento multi-paso (etiqueta `agent`).
- Multilingüismo en 22 idiomas, incluidos español, inglés, chino, ruso, francés, alemán, árabe, japonés, coreano, portugués, hebreo, turco, polaco, sueco, neerlandés, indonesio, ucraniano, persa, malayo, finlandés, griego e italiano.
- Comportamiento «uncensored»: la ablación ARA reduce los rechazos entrenados del modelo base.
- Decodificación especulativa mediante el bloque MTP integrado.

## Casos de uso

- Asistencia conversacional de largo alcance: el modelo puede mantener diálogos multi-turno sobre documentos extensos gracias a su ventana de 262.144 tokens, útil para análisis de contratos, informes o bases de código completas en una sola sesión.
- Generación de código en pipelines de desarrollo: con tool calling y plantilla de chat compatible con Ollama, puede integrarse en flujos de revisión de código, generación de tests o explicación de parches, siempre con revisión humana dado su carácter no censurado.
- Agentes autónomos de múltiples pasos: la etiqueta `agent` y el soporte de herramientas permiten construir bucles de planificación y ejecución con llamadas a APIs externas, por ejemplo para tareas de investigación o automatización de escritorio.
- Procesamiento multimodal de documentos: con el proyector de visión incluido, puede describir capturas, extraer información de imágenes o responder preguntas sobre diagramas en un flujo Ollama, adecuado para prototipos de digitalización documental.
- Escritura creativa y generación de contenido narrativo: el corpus de escritura creativa citado en la atribución y el comportamiento sin filtros lo hacen apto para borradores de ficción, guiones o material de marketing que requiera tono libre, con revisión editorial obligatoria.
- Investigación sobre alineación y seguridad: al ser una ablación ARA, sirve como objeto de estudio para medir cómo cambia la tasa de rechazo y la calidad de respuesta respecto al Qwen 3.8 27B original, en entornos controlados.
- Despliegue local en estaciones de trabajo: el GGUF Q4_K_M de unos 17 GB permite ejecutar un modelo de 27 B con contexto largo en una sola GPU de consumo alta o en CPU con suficiente RAM, útil para prototipado sin dependencia de la nube.
- Traducción y atención al cliente multilingüe: con 22 idiomas declarados, puede cubrir soporte en español, inglés, francés, alemán o árabe, aunque la calidad por idioma no está medida en la información disponible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K ni de ninguna otra evaluación estandarizada, ni comparaciones numéricas con modelos similares. El único dato de rendimiento medido que aporta el autor es la aceleración por decodificación especulativa con MTP: entre 1,1 y 1,5 veces más rápida en respuestas de 300 tokens en su equipo de pruebas con CPU, sin especificar el hardware exacto ni el throughput absoluto.

## Requisitos de hardware

- VRAM estimada para el GGUF Q4_K_M incluido: en torno a 17 GB de pesos, más overhead de contexto y caché KV; con contexto largo la VRAM necesaria crece de forma significativa.
- GPU recomendadas: para el Q4_K_M con contexto moderado, una RTX 4090 (24 GB) o RTX 3090 (24 GB) es suficiente; para contexto muy largo o cuantizaciones mayores se recomiendan A100 (40/80 GB) o H100 (80 GB).
- Cabe en GPU de consumo: sí, el Q4_K_M en tarjetas de 24 GB; en tarjetas de 16 GB requeriría cuantizaciones más agresivas u offload parcial a CPU.
- Opciones de despliegue: Ollama (versión 0.32.15 o posterior; 0.30.8 no carga el GGUF con bloque MTP), llama.cpp y cualquier runtime compatible con GGUF; el autor menciona el uso de `Modelfile` para construir variantes locales. No se documenta soporte de vLLM ni TGI para este repositorio GGUF.
- Latencia y throughput: no disponibles de forma absoluta; solo se conoce la mejora relativa de 1,1 a 1,5 veces con MTP en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Thanatos-27B-HERETIC (FoolDev) | 27,3 B denso | 262.144 nativos / 1.010.000 extensibles | GGUF, multimodal, uncensored | Apache 2.0 | Hugging Face, Ollama vía `hf.co/` |
| Qwen 3.8 27B (Qwen) | 27 B denso | No disponible en la información | Pesos originales alineados | No disponible en la información | Hugging Face (referenciado como base) |
| heretic-org/Qwen3.8-27B-heretic-ara | 27 B denso | No disponible en la información | Ablación ARA, sin cuantizar | No disponible en la información | Hugging Face |
| FoolDev/Janus-35B-HERETIC | 35 B totales, 3 B activos (MoE) | No disponible en la información | GGUF, MoE, uncensored | No disponible en la información | Hugging Face |

La comparación con Qwen 3.8 27B y con heretic-ara es estructural: Thanatos es una cuantización del segundo, que a su vez deriva del primero. Janus-35B-HERETIC es el modelo hermano del autor, pero con arquitectura MoE y base distinta (Qwen 3.6 35B-A3B), por lo que no son dos ablaciones del mismo modelo. No hay datos de rendimiento comparado en la información disponible.

## Limitaciones y advertencias

- Modelo «uncensored»: la ablación ARA reduce los rechazos entrenados, lo que aumenta el riesgo de generar contenido dañino, ilegal o sexualmente explícito; no es adecuado para aplicaciones de cara al público sin filtros adicionales.
- Atribución de entrenamiento no verificada: los datasets y el profesor listados en la model card son herencia de revisiones anteriores y el autor reconoce que el modelo base actual no los reclama; uno de los datasets no es accesible públicamente.
- Riesgo de alucinación: no hay evaluaciones publicadas de fidelidad factual; al ser un modelo de 27 B sin benchmarks conocidos, la fiabilidad en dominios especializados no está medida.
- Comportamiento multimodal poco documentado: el proyector de visión se ha probado en versiones concretas de Ollama, pero no hay evaluación de calidad de las respuestas sobre imágenes.
- Restricciones de licencia: la licencia declarada es Apache 2.0, pero al derivar de Qwen 3.8 27B conviene verificar las condiciones de la licencia del modelo original antes de un uso comercial; la información disponible no detalla posibles restricciones adicionales.
- Dependencia de versiones de Ollama: el GGUF con bloque MTP no carga en Ollama 0.30.8, y las versiones anteriores a 0.30 rechazan el parámetro `draft_num_predict` del `Modelfile`; se requiere Ollama 0.32.15 o posterior.
- Riesgo de confusión de revisiones: el autor advierte de que blobs descargados durante las ventanas de renombrado de mayo de 2026 corresponden a compilaciones antiguas sobre bases distintas; hay que volver a descargar el repositorio actual.
- Idiomas: aunque se declaran 22 idiomas, no hay evaluación por idioma; el rendimiento en lenguas menos representadas como el finlandés o el griego puede ser notablemente inferior.
- Contexto extensible no verificado: la cifra de 1.010.000 tokens extensibles proviene de la model card y no está respaldada por pruebas publicadas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/FoolDev/Thanatos-27B-HERETIC
- Modelo base: https://huggingface.co/heretic-org/Qwen3.8-27B-heretic-ara
- Modelo Qwen original referenciado: https://huggingface.co/Qwen/Qwen3.8-27B
- Modelo hermano: https://huggingface.co/FoolDev/Janus-35B-HERETIC
- Cuantizaciones GGUF del base: https://huggingface.co/mradermacher/Qwen3.8-27B-heretic-ara-GGUF
- Licencia Apache 2.0: https://opensource.org/licenses/Apache-2.0
- Banner del repositorio: https://huggingface.co/FoolDev/Thanatos-27B-HERETIC/resolve/main/banner.svg
- Apoyo al autor: https://buymeacoffee.com/cardoffoolm
