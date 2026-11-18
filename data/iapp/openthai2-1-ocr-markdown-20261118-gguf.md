# iapp/OpenThai2.1-OCR-Markdown-20261118-GGUF

## Resumen

OpenThai2.1-OCR-Markdown-20261118 es un modelo de visión-lenguaje especializado en el parseo de documentos tailandeses e ingleses a Markdown. Lo desarrolla iApp Technology (cuenta de Hugging Face `iapp`) como un fine-tune de NVIDIA Nemotron 3.5 Parse, un modelo base de 0,63B de parámetros. Su propósito es convertir páginas de documentos (diapositivas, formularios, informes, libros de texto) en Markdown estructurado, representando las tablas como HTML y las fórmulas como `$$...$$`.

La versión aquí descrita es la cuantización GGUF del modelo original, publicada para ejecutarse con llama.cpp en CPU, GPU de consumo o Apple Silicon sin necesidad de PyTorch ni vLLM. El decodificador tiene 189.722.624 parámetros (192M) y el codificador visual, empaquetado por separado en un fichero `mmproj`, suma 439M adicionales, lo que da un total cercano a los 630M de parámetros del modelo base.

Es relevante porque cubre un nicho poco atendido: OCR estructurado para tailandés, un idioma con escasa representación en modelos de documentos, con una licencia permisiva (OpenMDW-1.1) y un formato de despliegue ligero. La arquitectura no está incluida en el llama.cpp upstream, por lo que requiere compilar un fork específico del autor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje (encoder visual + decodificador transformer); fork de llama.cpp requerido |
| Parámetros totales | 189.722.624 (decodificador) + 439M (encoder visual y neck) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 16.384 tokens (configurado en los ejemplos de ejecución con `-c 16384`) |
| Tipos de cuantización | Q8_0 y F16 (decodificador); F16 para el `mmproj` |
| Idiomas soportados | tailandés (th), inglés (en) |
| Licencia | OpenMDW-1.1 (`license: other`) |
| Formato de pesos | GGUF (llama.cpp); el modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune de NVIDIA Nemotron 3.5 Parse, un sistema de parseo de documentos de 0,63B de parámetros. La arquitectura combina un codificador visual (439M, empaquetado en el fichero `mmproj` en F16) con un decodificador de 192M parámetros que genera una secuencia estructurada de bloques con coordenadas de caja delimitadora, etiquetas de clase y texto: `<x_..><y_..>text<x_..><y_..><class_..>`. Esa salida cruda se postprocesa después a Markdown mediante la clase `DocumentParser` de NVIDIA, que convierte las tablas a HTML y las fórmulas a notación `$$...$$`.

No se dispone de información detallada sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO; la model card remite a la ficha del modelo base para esos datos. La innovación técnica destacable es el formato de salida con cajas y clases integradas en la propia generación, junto con un template de chat que coloca la imagen antes de los tokens de tarea y unos valores de muestreo por defecto heredados de `DocumentParser` (temperatura 0,2, top-k 50, top-p 1,0, penalización de repetición 1,05 sobre 8.760 tokens).

## Capacidades

- Parseo de documentos a Markdown: convierte páginas de imagen en texto estructurado con títulos, listas y párrafos.
- Tablas como HTML: las tablas del documento se representan como tablas HTML dentro del Markdown de salida.
- Fórmulas matemáticas: se emiten en notación `$$...$$`.
- Detección de cajas delimitadoras y clases: la salida cruda incluye coordenadas `<x_..><y_..>` y etiquetas `<class_..>` por bloque, accesibles en `doc["blocks"]`.
- Texto dentro de imágenes: el token de tarea `<predict_text_in_pic>` activa la extracción de texto incrustado en figuras.
- Multilingüe limitado: tailandés e inglés.
- Integración como servidor: compatible con la API de OpenAI a través de `llama-server` y con el cliente `DocumentParser` de NVIDIA.
- Páginas en blanco: se omiten y devuelven vacías.
- No se documentan capacidades de tool calling, agentes, audio ni razonamiento multi-paso; el modelo está especializado exclusivamente en parseo de documentos.

## Casos de uso

- Digitalización de archivos administrativos tailandeses: el modelo convierte formularios y documentos oficiales escaneados en Markdown estructurado, preservando tablas como HTML, lo que facilita su indexación en sistemas de gestión documental.
- Extracción de contenido de libros de texto y temarios: con contexto de 16.384 tokens y soporte de tailandés e inglés, procesa páginas de manuales universitarios y los transforma en texto reutilizable para plataformas educativas.
- Pipeline de RAG sobre documentación corporativa: la salida Markdown con tablas en HTML se puede trocear e indexar directamente en un almacén vectorial, manteniendo la estructura semántica de informes y memorias anuales.
- Procesamiento de diapositivas de reuniones: convierte presentaciones con mezcla de tailandés e inglés en notas Markdown, incluyendo el texto incrustado en gráficos mediante `<predict_text_in_pic>`.
- Despliegue en local sin GPU dedicada: al ejecutarse con llama.cpp en CPU (unos 58 segundos por página en un M3 Max con 16 núcleos), es viable para digitalización por lotes en estaciones de trabajo sin acelerador.
- Servicio HTTP de parseo: `llama-server` expone una API compatible con OpenAI que el cliente `DocumentParser` consume directamente, permitiendo integrar el OCR en aplicaciones web existentes sin reescribir la capa de inferencia.
- Normalización de documentación técnica bilingüe: la conversión de fórmulas a `$$...$$` y de tablas a HTML permite reutilizar apuntes y guías técnicas en generadores de documentación estáticos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye únicamente una validación de calidad de la conversión GGUF frente al modelo PyTorch original sobre 30 páginas de desarrollo (CU-DocBench, diapositivas, temarios, formularios, informes y libros de texto en tailandés e inglés), decodificadas de forma greedy hasta el final (mediana de 617 tokens), sin penalización de repetición:

| Ficheros | Markdown idéntico a PyTorch | Error de caracteres vs PyTorch | Cortado en el límite de tokens | Bucles |
|---|---|---|---|---|
| Decodificador Q8_0 + mmproj F16 | 30 de 30 | 0,00% | 0 | 0 |
| Decodificador F16 + mmproj F16 | 30 de 30 | 0,00% | 0 | 0 |
| Decodificador F32 + mmproj F32 (no publicado) | 30 de 30 | 0,00% | 0 | 0 |

En la salida cruda, el F16 reproduce exactamente al F32 en todas las páginas, incluidas las coordenadas de caja; el Q8_0 difiere en 16 coordenadas de caja en 6 páginas, sin diferencias en el texto. En 5 páginas, los ficheros F32 reproducen el modelo PyTorch token a token durante más de 600 tokens, tanto en CPU como en Metal.

En cuanto a velocidad (páginas completas, una a una):

| Máquina | Modo | Decodificador | Segundos por página | De los cuales, codificación de imagen |
|---|---|---|---|---|
| Apple M3 Max, Metal | llama-server, modelo cargado | Q8_0 | 4,8–7,0 (4 páginas) | no disponible |
| Apple M3 Max, Metal | llama-mtmd-cli, carga incluida | Q8_0 | 7,7 (mediana de 30) | 5,9 |
| Apple M3 Max, Metal | llama-mtmd-cli, carga incluida | F16 | 8,2 (mediana de 30) | 5,9 |
| Apple M3 Max, solo CPU (16 núcleos) | llama-mtmd-cli | Q8_0 | 58 (mediana de 4) | 54 |
| Apple M3 Max, solo CPU (16 núcleos) | llama-mtmd-cli | F16 | 59 (mediana de 4) | 52 |
| Servidor Linux, 4 hilos de CPU (compartido, cargado) | llama-mtmd-cli | Q8_0 | 146 (mediana de 4) | 133 |
| Servidor Linux, 4 hilos de CPU (compartido, cargado) | llama-mtmd-cli | F16 | 154 (mediana de 4) | 131 |

El codificador visual determina el tiempo de ejecución: una página puede llegar a 1.664 x 2.04 (dato truncado en la model card).

## Requisitos de hardware

- VRAM estimada: el decodificador Q8_0 ocupa 204 MB y el F16 382 MB; el `mmproj` F16 ocupa 917 MB. En total, menos de 1,2 GB en disco para la combinación Q8_0 + mmproj F16, holgadamente dentro de cualquier GPU de consumo.
- GPU recomendadas: no se especifican modelos concretos; el fork soporta Metal en macOS y CUDA en NVIDIA mediante `-DGGML_CUDA=ON`.
- GPU de consumo: sí cabe en cualquier GPU con más de 2 GB de VRAM; también funciona en CPU pura.
- Opciones de despliegue: llama.cpp (fork `nemotron-parse` de iapp-technology) con `llama-mtmd-cli` y `llama-server`; cliente `DocumentParser` de NVIDIA instalado sin dependencias de torch (`pip install --no-deps`). No se menciona soporte para vLLM, Ollama ni TGI en la versión GGUF.
- Latencia y throughput: entre 4,8 y 7,0 segundos por página en un M3 Max con Metal y modelo cargado; 58 segundos por página en CPU de 16 núcleos; 146 segundos por página con 4 hilos en un servidor Linux compartido. La codificación de imagen supone la mayor parte del tiempo (5,9 s de 7,7 s en Metal; 133 s de 146 s en el servidor Linux).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| OpenThai2.1-OCR-Markdown-20261118 (este) | 192M decodificador + 439M visión | 16.384 | th, en | OpenMDW-1.1 | GGUF | Fine-tune de Nemotron 3.5 Parse; requiere fork de llama.cpp |
| NVIDIA Nemotron 3.5 Parse | 0,63B | no disponible | no disponible | no disponible | safetensors (PyTorch) | Modelo base; sin soporte nativo en llama.cpp upstream |
| Alternativas de OCR tailandés | no disponible | no disponible | no disponible | no disponible | no disponible | No se dispone de información sobre modelos comparables en la búsqueda realizada |

No se dispone de datos de benchmarks ni de especificaciones de modelos alternativos de la misma categoría en la información proporcionada, por lo que la comparativa cuantitativa de rendimiento no está disponible.

## Limitaciones y advertencias

- Idiomas limitados: solo tailandés e inglés; no se garantiza un comportamiento correcto en otros idiomas.
- Dependencia de un fork: la arquitectura no está en llama.cpp upstream; es obligatorio compilar el fork `nemotron-parse` de iapp-technology, lo que complica el mantenimiento y las actualizaciones.
- Salida cruda intermedia: la salida del modelo no es Markdown directamente, sino bloques `<x_..><y_..>text<x_..><y_..><class_..>` que requieren el postprocesado de `DocumentParser` para obtener Markdown con tablas HTML y fórmulas `$$...$$`.
- Riesgo de alucinación: no se documenta explícitamente, pero al ser un modelo generativo de 192M parámetros es plausible que introduzca texto incorrecto en documentos con baja legibilidad; no hay datos publicados al respecto.
- Sesgos: no se documentan sesgos conocidos en la información disponible.
- Restricciones de licencia: OpenMDW-1.1 es una licencia con condiciones específicas; es necesario revisar sus términos antes de un uso comercial. La model card incluye ficheros `LICENSE`, `THIRD_PARTY_NOTICES.md` y `TOKENIZER_ATTRIBUTION.md` que deben consultarse.
- Límite de tokens: la decodificación se corta en el límite configurado (`-n 8744` en el ejemplo de CLI); páginas muy densas podrían truncarse.
- Determinismo: para obtener salida determinista hay que arrancar el servidor con `--repeat-penalty 1.0` y pasar `fullpage=GenerationSettings(temperature=0.0, repetition_penalty=1.0)`; además, `llama-server` lee `repeat_penalty`, no `repetition_penalty` como vLLM, y `--repeat-last-n -1` desactiva la penalización en este fork en lugar de extenderla.
- Rendimiento en CPU: en servidores con pocos hilos compartidos la latencia puede superar los 140 segundos por página, lo que limita su uso en producción sin GPU.
- Adopción nula: 0 descargas y 0 likes en el momento de la consulta, sin comunidad que haya validado el modelo de forma independiente.

## Enlaces

- Modelo GGUF en Hugging Face: https://huggingface.co/iapp/OpenThai2.1-OCR-Markdown-20261118-GGUF
- Modelo base en Hugging Face: https://huggingface.co/iapp/OpenThai2.1-OCR-Markdown-20261118
- Modelo NVIDIA Nemotron 3.5 Parse: https://huggingface.co/nvidia/Nemotron-3.5-Parse
- Fork de llama.cpp: https://github.com/iapp-technology/llama.cpp (rama `nemotron-parse`)
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
- Assets de la model card: https://huggingface.co/datasets/iapp/OpenThai2.0-model-card-assets
