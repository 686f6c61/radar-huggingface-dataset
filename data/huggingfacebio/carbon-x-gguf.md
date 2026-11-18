# HuggingFaceBio/Carbon-X-GGUF

## Resumen

Carbon-X es un modelo de lenguaje de 14.822.046.720 parámetros (aproximadamente 14,8B) desarrollado por Hugging Face Bio, diseñado específicamente para la comprensión y generación de ADN. Forma parte de la familia **Carbon** y se distribuye en este repositorio como cuantizaciones GGUF para inferencia local con llama.cpp. El modelo resuelve un problema concreto de la genómica computacional: leer secuencias de ADN en bruto dentro de una conversación de chat convencional y responder en inglés, prediciendo si una mutación es benigna o patógena, identificando regiones reguladoras de la actividad génica, clasificando secuencias por grupo de organismo y prediciendo las siguientes bases de una secuencia.

La innovación principal es su tokenizador híbrido `HybridDNATokenizer`, que mantiene un vocabulario BPE para texto y codifica el ADN como 6-mers no solapados. Esto permite que un transformer de propósito general procese ADN sin una arquitectura especializada, manteniendo la capacidad conversacional. El repositorio GGUF incluye cinco cuantizaciones (BF16, Q8_0, Q6_K, Q5_K_M y Q4_K_M) y está pensado para ejecutarse con llama.cpp a partir de la build b11742, la primera que soporta este tokenizador.

El modelo es relevante ahora porque democratiza el análisis genómico de variantes en hardware de consumo: la cuantización Q8_0 ocupa 15,8 GB con las mismas puntuaciones de benchmark que BF16, y Q4_K_M baja a 9,6 GB. Su licencia Apache 2.0 permite uso comercial sin restricciones adicionales, algo poco habitual en modelos de dominio científico.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con tokenizador híbrido (`HybridDNATokenizer`: BPE para texto, 6-mers para ADN) |
| Parámetros totales | 14.822.046.720 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | BF16, Q8_0, Q6_K, Q5_K_M, Q4_K_M (formato GGUF) |
| Idiomas soportados | Inglés (texto); ADN como secuencia de nucleótidos |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); el modelo base Carbon-X en safetensors |

## Arquitectura y entrenamiento

Carbon-X es un transformer de aproximadamente 14,8B parámetros. Su rasgo arquitectónico distintivo es el tokenizador híbrido `HybridDNATokenizer`, que conmuta entre un vocabulario BPE para el texto y una codificación de ADN en 6-mers no solapados. Las secuencias de al menos 6 bases A/C/G/T se etiquetan automáticamente con `<dna>…</dna>` y se tokenizan como 6-mers; las secuencias con hasta un 20% de códigos IUPAC de ambigüedad (N, R, Y, etc.) y longitud mínima de 12 bases también se etiquetan. Los 6-mers que contienen caracteres no canónicos se colapsan en un único token `<oov>`. Las longitudes que no son múltiplo de 6 se completan con tokens de cola dedicados, de modo que la decodificación devuelve la secuencia original exacta.

El modelo fue post-entrenado y evaluado con el modo *thinking* desactivado, y se recomienda usar `--chat-template-kwargs '{"enable_thinking": false}'` para reproducir ese comportamiento. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en la información proporcionada. Los archivos GGUF llevan incorporada la plantilla de chat y los parámetros de muestreo por defecto de Carbon-X.

## Capacidades

- Predicción de efecto de variantes (VEP): clasifica variantes de un solo nucleótido como benignas o patógenas a partir de una secuencia de referencia larga.
- Identificación de regiones reguladoras que controlan la actividad génica.
- Clasificación de secuencias por grupo de organismo.
- Predicción de las siguientes bases de una secuencia de ADN.
- Razonamiento explicativo: el modelo explica su razonamiento en inglés junto a la respuesta.
- Conversación multi-turno en inglés con secuencias de ADN embebidas en el mensaje del usuario.
- Manejo de secuencias de cualquier longitud, incluidas longitudes no múltiplo de 6, con reconstrucción exacta al decodificar.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés para texto.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- **Análisis de variantes en investigación genómica**: dado un alelo de referencia y una variante de un solo nucleótido, el modelo predice si la mutación es benigna o patógena (benchmark FrontierVEP, 70,4 de accuracy en el modelo original). Adecuado para triaje preliminar de variantes antes de validación experimental.
- **Anotación de regiones reguladoras**: el modelo identifica regiones que controlan la actividad génica a partir de la secuencia en bruto, útil para priorizar candidatos en estudios de expresión génica.
- **Clasificación taxonómica de secuencias**: clasifica secuencias de ADN por grupo de organismo, aplicable a la caracterización rápida de metagenomas o muestras ambientales.
- **Predicción de secuencia (NextBase)**: predice las siguientes bases de una secuencia (39,4 de precisión por base en el modelo original), útil para tareas de completado y diseño de secuencias.
- **Asistente de laboratorio en local**: con la cuantización Q4_K_M (9,6 GB) puede desplegarse en una estación de trabajo con GPU de consumo, permitiendo consultas sobre secuencias sin enviar datos genómicos a servicios externos, algo crítico por privacidad y cumplimiento.
- **Docencia y formación en bioinformática**: el modelo explica su razonamiento en inglés, lo que lo hace útil para ilustrar cómo se razona sobre variantes y regiones reguladoras en un entorno interactivo.
- **Integración en pipelines de análisis**: mediante `llama serve`, expone una API compatible con OpenAI que puede integrarse en flujos automatizados de anotación de variantes o clasificación de secuencias.

## Benchmarks y rendimiento

Resultados de los dos benchmarks de ADN de la model card de Carbon-X, ejecutados sobre cada archivo GGUF con el servidor de llama.cpp, con *thinking* desactivado y una muestra por problema. La columna Carbon-X corresponde al modelo original servido con vLLM.

| Benchmark | Problemas | Métrica | Carbon-X | BF16 | Q8_0 | Q6_K | Q5_K_M | Q4_K_M |
|---|---:|---|---:|---:|---:|---:|---:|---:|
| FrontierVEP | 1.000 | Accuracy | 70,4 | 69,6 | 69,1 | 69,0 | 70,4 | 67,8 |
| NextBase | 600 | Precisión por base | 39,4 | 40,1 | 39,7 | 39,5 | 39,6 | 38,6 |

El error estándar es de aproximadamente 1,5 puntos en FrontierVEP y 1 punto en NextBase. BF16 hasta Q5_K_M quedan dentro de un error estándar del modelo original; Q4_K_M presenta una caída mayor en FrontierVEP (67,8 frente a 70,4). FrontierVEP evalúa la predicción benigno/patógeno sobre 500 variantes benignas y 500 patógenas; NextBase mide la fracción de bases predichas correctamente.

## Requisitos de hardware

- **VRAM estimada para inferencia**: BF16 requiere unos 29,7 GB; Q8_0 unos 15,8 GB; Q6_K unos 12,6 GB; Q5_K_M unos 11,1 GB; Q4_K_M unos 9,6 GB. Hay que sumar el espacio para el contexto KV.
- **GPU recomendadas**: A100 40/80 GB o H100 para BF16; RTX 4090 (24 GB) para Q8_0 y cuantizaciones menores; GPUs de 16 GB para Q6_K y Q5_K_M; GPUs de 12 GB para Q4_K_M.
- **Cabe en GPU de consumo**: sí. Q8_0 en RTX 4090; Q6_K y Q5_K_M en GPUs de 16 GB; Q4_K_M en GPUs de 12 GB (por ejemplo, RTX 3060 de 12 GB). En todos los K-quants, los tensores de embedding y salida que contienen los tokens de ADN se mantienen en Q8_0.
- **Opciones de despliegue**: llama.cpp (recomendado, build b11742 o superior), `llama serve` (API compatible con OpenAI y UI web de chat), `llama cli`, la aplicación de escritorio de llama.cpp para macOS y Windows, o descarga directa desde Hugging Face con `-hf HuggingFaceBio/Carbon-X-GGUF:Q8_0`. No se menciona soporte de vLLM para los GGUF (vLLM se usó para servir el modelo original).
- **Latencia y throughput**: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni especificaciones de modelos comparables de la misma categoría (modelos de lenguaje para genómica) en la información proporcionada. La model card solo compara las cuantizaciones GGUF entre sí y con el modelo original Carbon-X servido con vLLM.

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Carbon-X (este, GGUF) | 14,8B | No disponible | Apache 2.0 | GGUF | Hugging Face |
| Carbon-X (original) | 14,8B | No disponible | Apache 2.0 | Safetensors | Hugging Face |
| Alternativas de genómica | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- **Riesgo de alucinación**: la model card advierte que, sin contexto adicional (gen, hebra, coordenadas o anotaciones), el modelo puede adivinar la identidad o función de una secuencia. Conviene aportar siempre el contexto disponible.
- **Tokens `<oov>`**: cualquier 6-mer que contenga un carácter no canónico (por ejemplo, N) se colapsa en un único token `<oov>`, perdiendo resolución. Es necesario filtrar a bases canónicas antes de la inferencia si se quiere mantener la resolución completa.
- **Idioma**: el soporte de texto se limita al inglés; no hay capacidades multilingües declaradas.
- **Modo thinking**: el modelo fue post-entrenado y evaluado con *thinking* desactivado; usarlo activado puede degradar los resultados respecto a los benchmarks publicados.
- **Dependencia de versión de llama.cpp**: los archivos requieren la build b11742 o superior. Versiones anteriores, incluida la v0.7.0, cargan los archivos pero tokenizan el ADN de forma incorrecta.
- **Etiquetas `<dna>` en las respuestas**: el modelo escribe el ADN dentro de `<dna>…</dna>` y llama.cpp conserva las etiquetas en el texto devuelto; hay que eliminarlas si se necesita la secuencia desnuda.
- **Variabilidad de los benchmarks**: las puntuaciones son ejecuciones únicas con muestreo; el error estándar es de unos 1,5 puntos en FrontierVEP y 1 punto en NextBase, por lo que diferencias menores entre cuantizaciones no son significativas.
- **Licencia**: Apache 2.0 permite uso comercial, pero conviene revisar la model card del modelo base Carbon-X para limitaciones adicionales de uso científico.
- **Validación experimental**: las predicciones de patogenicidad y de regiones reguladoras no sustituyen la validación experimental ni el criterio clínico.

## Enlaces

- Repositorio GGUF: https://huggingface.co/HuggingFaceBio/Carbon-X-GGUF
- Modelo base Carbon-X: https://huggingface.co/HuggingFaceBio/Carbon-X
- Evaluación del modelo base: https://huggingface.co/HuggingFaceBio/Carbon-X#evaluation
- Blog / demo: https://huggingface.co/spaces/HuggingFaceBio/Carbon-X-Release
- Organización Hugging Face Bio: https://huggingface.co/HuggingFaceBio
- Código: https://github.com/huggingface/carbon/tree/main
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Build b11742 de llama.cpp: https://github.com/ggml-org/llama.cpp/releases/tag/b11742
- PR de soporte del HybridDNATokenizer: https://github.com/ggml-org/llama.cpp/pull/30825
- Aplicación de escritorio de llama.cpp: https://llama.app
