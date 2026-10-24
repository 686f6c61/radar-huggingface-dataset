# ket0x4/ket-4b-GGUF

## Resumen

ket-4b-GGUF es un modelo de lenguaje y visión (vision-language model) publicado por el usuario ket0x4 en HuggingFace, distribuido exclusivamente en formato GGUF para su uso con llama.cpp. Según los tags del repositorio y los nombres de los ficheros (`gemma-4-E4B-it.*.gguf`), se trata de un ajuste fino del modelo Gemma 4 E4B en su variante instruct, convertido a GGUF mediante Unsloth. El repositorio no incluye model card técnica detallada: únicamente describe el proceso de conversión y los comandos de ejecución.

El dato objetivo disponible es el recuento de parámetros de los pesos en safetensors: 7.518.069.290 parámetros totales, con un tamaño de repositorio de 14,4 GB repartido entre tres ficheros (Q4_K_M, Q8_0 y el proyector multimodal en BF16). El sufijo "E4B" de la nomenclatura de Gemma indica parámetros efectivos en torno a 4B, aunque esta ficha no puede confirmar la arquitectura exacta ni el número de parámetros activos porque esa información no está publicada en el repositorio.

Su relevancia práctica es doble: por un lado, permite ejecutar un modelo multimodal de la familia Gemma en hardware de consumo mediante cuantización GGUF; por otro, el ajuste fino es obra de un tercero, no de Google DeepMind, y el repositorio no declara licencia ni idiomas soportados, lo que condiciona su adopción en producción. El interés ahora mismo es exploratorio: validar el ajuste frente al modelo base antes de considerarlo en cualquier pipeline real.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Derivada de Gemma 4 (tag `gemma4`); arquitectura exacta no disponible. La nomenclatura E4B de la familia Gemma corresponde a modelos con parámetros efectivos reducidos, no confirmado en este repositorio |
| Parametros totales | 7.518.069.290 (recuento real de safetensors) |
| Parametros activos | No disponible (no se confirma que sea MoE) |
| Parametros efectivos | ~4B según el sufijo E4B del nombre de fichero; no confirmado en la información disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF Q4_K_M y Q8_0; proyector de visión en BF16 (`gemma-4-E4B-it.BF16-mmproj.gguf`) |
| Idiomas soportados | No disponible (el modelo base Gemma es multilingüe, pero el repositorio no declara lista de idiomas) |
| Licencia | No disponible. El repositorio no declara licencia; el modelo base Gemma se distribuye bajo Gemma Terms of Use, extremo no confirmado para este derivado |
| Formato de pesos | GGUF (llama.cpp). Proyector multimodal en fichero `mmproj` separado en BF16 |

## Arquitectura y entrenamiento

La información disponible no documenta la arquitectura interna. Los tags (`gemma4`, `vision-language-model`) y el nombre de los ficheros indican que el modelo parte de Gemma 4 E4B instruct, un modelo de la familia Gemma de Google DeepMind con capacidad de procesamiento de imagen y texto. La nomenclatura "E" de esa familia se asocia a variantes con parámetros efectivos inferiores al total, pero el repositorio no detalla capas, mecanismo de atención, tipo de tokenizador ni configuración del codificador visual.

Respecto al entrenamiento, la model card solo indica que el modelo fue ajustado y convertido a GGUF con Unsloth, con una mención a un entrenamiento "2x más rápido" gracias a esa herramienta. No se especifican tokens de entrenamiento, composición del dataset, uso de RLHF/DPO ni hiperparámetros. Tampoco se documenta si el ajuste afectó al proyector multimodal o únicamente al decodificador de texto, ni si se aplicaron técnicas de decodificación especulativa, atención lineal u otras optimizaciones. Todo ello debe considerarse no disponible.

## Capacidades

- Generación de texto conversacional en formato instruct, según los tags `conversational` y `endpoints_compatible`.
- Procesamiento de imagen y texto (vision-language): el repositorio incluye un proyector multimodal `BF16-mmproj.gguf` y documenta el uso con `llama-mtmd-cli`.
- Ejecución local mediante llama.cpp, con soporte de plantillas de chat a través del flag `--jinja`.
- Compatibilidad declarada con endpoints (tag `endpoints_compatible`), lo que facilita su exposición como API compatible con OpenAI en servidores locales.
- Capacidades de tool calling, agentes, razonamiento multi-paso o modo "thinking": no confirmadas en la información disponible.
- Cobertura multilingüe: no declarada en el repositorio; no verificable.
- Capacidades de audio: no disponibles.

## Casos de uso

- Análisis de documentos con imagen en local: el modelo puede recibir capturas o páginas escaneadas y generar descripciones o extracción de texto, ejecutándose íntegramente en una estación de trabajo con llama.cpp y sin enviar datos a la nube. Adecuado cuando la confidencialidad impide usar APIs externas.
- Asistente de soporte con capturas de pantalla: un usuario adjunta una imagen de un error y el modelo describe el problema y propone pasos. El formato GGUF permite desplegarlo en el mismo servidor que el resto del stack sin dependencias de Python pesadas.
- Descripción automática de imágenes en pipelines de contenido: generación de alt-text y metadatos para CMS o catálogos, procesando lotes con `llama-server` y el proyector multimodal.
- Prototipado rápido de aplicaciones multimodales: al estar en GGUF con versiones Q4_K_M y Q8_0, permite comparar calidad frente a coste computacional antes de comprometerse con una arquitectura mayor.
- Evaluación de ajustes finos de terceros: útil como caso de estudio para investigadores que quieran medir la degradación introducida por la cuantización y por el propio ajuste respecto al Gemma 4 E4B original.
- Despliegue en hardware de consumo para demos: con Q4_K_M el modelo cabe en GPUs de 8-12 GB, lo que permite demos presenciales en portátiles con GPU discreta.
- Filtrado y moderación de contenido visual: clasificación preliminar de imágenes con reglas posteriores, siempre que se valide previamente la licencia y la calidad del ajuste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para Q4_K_M: aproximadamente 4,5-5 GB de pesos, más caché KV; en la práctica, unos 6-8 GB de VRAM para contexto moderado (estimación a partir del recuento de parámetros, no verificada).
- VRAM estimada para Q8_0: aproximadamente 8 GB de pesos, más caché KV; en torno a 10-12 GB de VRAM en uso real (estimación).
- Proyector multimodal BF16: fichero adicional que debe cargarse junto al modelo; su tamaño exacto no está documentado en la información disponible.
- GPU recomendadas: RTX 3060 12 GB o RTX 4060 Ti 16 GB para Q8_0; RTX 4070/4080/4090 y A100/H100 sin problemas. Para Q4_K_M basta una GPU de 8 GB.
- Ejecución en CPU: viable con llama.cpp en Q4_K_M con 16 GB de RAM, a costa de latencia alta y throughput bajo.
- Opciones de despliegue: llama.cpp (`llama-cli` para texto, `llama-mtmd-cli` para multimodal, `llama-server` para API), Ollama con la salvedad de que no admite ficheros `mmproj` separados y exige crear un modelo BF16 unificado con el `Modelfile` incluido. vLLM y TGI no están documentados para este repositorio; vLLM solo soporta GGUF de forma experimental.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

Los datos de los modelos comparados provienen de su documentación pública y deben verificarse antes de usarse; los de ket-4b-GGUF son los únicos extraídos del repositorio analizado.

| Modelo | Parámetros | Contexto | Licencia | Formato | Rendimiento |
|---|---|---|---|---|---|
| ket-4b-GGUF | 7,52B totales (~4B efectivos, no confirmado) | No disponible | No declarada | GGUF | Sin benchmarks publicados |
| Gemma 3 4B IT | ~4B | 128K (según documentación de Google) | Gemma Terms of Use | Safetensors, GGUF | Benchmarks publicados por Google |
| Qwen2.5-VL-7B-Instruct | ~8B | 128K (según documentación de Alibaba) | Apache 2.0 | Safetensors, GGUF | Benchmarks publicados por Alibaba |
| Phi-4-multimodal | ~5,6B | 128K (según documentación de Microsoft) | MIT | Safetensors | Benchmarks publicados por Microsoft |

La ventaja diferencial de ket-4b-GGUF frente a estas alternativas no puede establecerse: no hay benchmarks, no hay licencia declarada y no se documenta el ajuste. Frente a Qwen2.5-VL-7B o Phi-4-multimodal, la licencia es el principal factor de riesgo; frente a Gemma 3 4B, la incógnita es si el ajuste de terceros aporta alguna mejora medible.

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explícita no hay permiso claro de uso comercial. Hay que asumir que hereda las Gemma Terms of Use del modelo base, pero el repositorio no lo confirma.
- Ausencia total de benchmarks: no hay evidencia publicada de que el ajuste fino mejore al Gemma 4 E4B original; podría degradarlo.
- Riesgo de alucinación: inherente a los modelos generativos de esta escala, agravado por la falta de evaluación del ajuste. En tareas de OCR o descripción de imágenes conviene validar con muestras propias.
- Idiomas no declarados: no se puede garantizar calidad en castellano ni en otros idiomas distintos del inglés sin pruebas previas.
- Contexto no documentado: planificar pipelines asumiendo ventanas cortas hasta verificar el límite real.
- Cuantización Q4_K_M: pérdida de calidad esperable frente a BF16, especialmente en tareas de visión y razonamiento numérico.
- Limitación de Ollama con visión: no admite `mmproj` separado; requiere crear un modelo BF16 unificado, con el consiguiente aumento de VRAM.
- Repositorio sin descargas ni likes y con fechas de creación anómalas (2026): señales de un artefacto poco validado por la comunidad.
- Sin información sobre sesgos: no se documenta ninguna evaluación de sesgo social, de género o cultural.
- No apto para producción crítica sin una evaluación propia previa, especialmente en dominios regulados.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ket0x4/ket-4b-GGUF
- Unsloth (herramienta de ajuste y conversión citada en la model card): https://github.com/unslothai/unsloth
- llama.cpp (runtime de los ficheros GGUF): https://github.com/ggml-org/llama.cpp
- No se han encontrado otros enlaces relevantes en la búsqueda web realizada: los resultados devueltos no guardaban relación con el modelo.
