# nokkela-ai/Hy4-Flash-Strata

## Resumen

Hy4-Flash-Strata es una cuantización comunitaria del modelo Hy4-Flash de Tencent, publicada por el colectivo strata-engine y replicada en este repositorio por nokkela-ai. El modelo original es un transformer de tipo mezcla de expertos (MoE) con 220.000 millones de parámetros totales, de los cuales 12.000 millones se activan por token, y una ventana de contexto de hasta 1.048.576 tokens. Acepta texto e imágenes como entrada y genera texto, lo que lo sitúa en la categoría image-text-to-text.

La aportación de esta ficha no es el modelo base, sino el formato de empaquetado Strata: un conjunto de "packs" cuantizados (SQ-64, SQ-96 y SQ-128) diseñados para ejecutar el modelo en ordenadores personales con entre 64 y 128 GiB de RAM y una GPU de 8 a 16 GiB de VRAM. Según la model card, el pack más pequeño ocupa 129,61 GB en disco y consume unos 59,4 GiB de memoria combinada, lo que rebaja drásticamente el umbral de hardware respecto a los pesos en BF16.

Es relevante ahora porque demuestra que un MoE de 220B con capacidades multimodales y contexto de un millón de tokens puede desplegarse localmente sin clúster, a costa de una pérdida de fidelidad medible frente al original (divergencia KL de 0,088 a 0,518 según el pack y el tipo de prompt). El repositorio tiene 333,8 GB y, en el momento de la consulta, cero descargas y un "me gusta".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mezcla de expertos) con componente Engram de búsqueda; el modelo base es tencent/Hy4-flash |
| Parametros totales | 220.000 millones (64.000 millones corresponden al lookup Engram) |
| Parametros activos | 12.000 millones por token |
| Longitud de contexto | Hasta 1.048.576 tokens (1M) |
| Tipos de cuantizacion | Packs propietarios Strata SQ-64, SQ-96 y SQ-128; lookup Engram en Q8 (Hy4-Flash-Engram-Q8.strata) |
| Idiomas soportados | no disponible |
| Licencia | tencent-hy-license (etiquetada como "other"; enlace a la licencia del modelo base) |
| Formato de pesos | Formato propietario .strata (no safetensors ni GGUF) |

## Arquitectura y entrenamiento

El modelo base Hy4-Flash es un transformer con arquitectura de mezcla de expertos: 220.000 millones de parámetros totales, de los que solo 12.000 millones se activan por token, lo que reduce el coste computacional por paso de decodificación. Una parte sustancial de esos parámetros (64.000 millones) reside en un componente denominado Engram, descrito en la model card como un "lookup" y empaquetado aparte en cuantización Q8; se trata, por tanto, de una tabla de búsqueda de gran tamaño más que de pesos densos convencionales. El modelo procesa texto e imágenes y soporta contextos de hasta 1.048.576 tokens.

La model card no detalla la composición del dataset de entrenamiento, el número de tokens vistos, ni si hubo fases de RLHF o DPO. Tampoco describe innovaciones de atención más allá de la mención al contexto largo. Lo que sí documenta es el proceso de cuantización propio de Strata: cada pack se genera comparando las predicciones del modelo cuantizado con las del modelo en BF16 y midiendo la divergencia KL media sobre dos conjuntos de prompts (razonamiento y tool calling). Los packs se distribuyen como un único fichero .strata junto con el lookup Engram compartido, y se ejecutan mediante la aplicación Strata (Windows, Linux y Mac) o su CLI.

## Capacidades

- Generación de texto a partir de entradas de texto e imagen (pipeline image-text-to-text).
- Razonamiento multi-paso, según los conjuntos de evaluación de prompts de razonamiento citados en la model card.
- Tool calling / function calling, evaluado explícitamente en la medición de divergencia del pack.
- Procesamiento de contexto muy largo, hasta 1.048.576 tokens, adecuado para documentos extensos o conversaciones prolongadas.
- Comprensión de imágenes combinada con texto (entrada multimodal; la salida es solo texto).
- Ejecución local en hardware de consumo mediante los packs SQ-64, SQ-96 y SQ-128.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Asistente local con privacidad estricta: al ejecutarse íntegramente en el equipo del usuario con el pack SQ-64 (59,4 GiB de memoria en uso), permite procesar documentos sensibles sin enviar datos a la nube, algo crítico en sectores regulados.
- Análisis de documentación extensa: la ventana de 1M tokens permite cargar manuales, expedientes o bases de código completas en una sola pasada y formular preguntas sobre ellos sin troceado ni recuperación externa.
- Automatización de soporte con herramientas: el soporte de tool calling y la evaluación específica de prompts de este tipo lo hacen apto para agentes que consultan APIs internas, abren tickets o consultan bases de datos.
- Procesamiento de documentos escaneados o capturas: la entrada de imagen permite extraer y razonar sobre información de facturas, formularios o diagramas combinándola con instrucciones textuales.
- Estación de trabajo para desarrolladores con GPU modesta: con una GPU de 8 GiB y 64 GiB de RAM se puede mantener un asistente de código y razonamiento siempre disponible sin depender de servicios externos.
- Evaluación e investigación de cuantización: los tres packs con divergencia KL publicada permiten estudiar el compromiso entre memoria y fidelidad en modelos MoE de gran tamaño dentro de un laboratorio con hardware limitado.
- Despliegue en estaciones con memoria unificada: equipos con 128 GiB de memoria unificada pueden usar SQ-128, el pack más próximo al original (KL de 0,088 en razonamiento), para tareas donde la fidelidad importa más que la huella.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. La model card únicamente reporta la divergencia KL media frente al modelo en BF16:

| Pack | KL en prompts de razonamiento | KL en prompts de tool calling |
|---|---:|---:|
| SQ-128 | 0,088 | 0,180 |
| SQ-96 | 0,136 | 0,237 |
| SQ-64 | 0,232 | 0,518 |

Menor es mejor; cero indicaría predicciones idénticas al modelo completo. El pack SQ-64 pierde notablemente más fidelidad en tool calling (0,518) que en razonamiento (0,232).

## Requisitos de hardware

- RAM mínima: 64 GiB para el pack SQ-64, con 59,4 GiB de memoria en uso (RAM más VRAM aproximadas).
- RAM recomendada: 96 GiB para SQ-96 (85,1 GiB en uso) y 128 GiB para SQ-128 (107,5 GiB en uso); este último es el más fiel al original.
- VRAM: basta una GPU de 8, 12 o 16 GiB para SQ-64; 8 o 12 GiB para SQ-96 y SQ-128.
- Espacio en disco: 129,61 GB (SQ-64), 157,16 GB (SQ-96) y 181,23 GB (SQ-128), incluyendo el lookup Engram Q8 compartido.
- GPU recomendadas: no se especifican modelos concretos; los requisitos se expresan solo en GiB de VRAM, por lo que encajan tarjetas de gama media tipo RTX 3060/4060 (8-12 GiB) y superiores.
- Cabe en GPU de consumo: sí, siempre que se combine con la RAM indicada; el cuello de botella es la memoria del sistema, no la GPU.
- Opciones de despliegue: exclusivamente la aplicación Strata (Windows, Linux, Mac) o su CLI (`strata launch`). No hay soporte indicado para vLLM, llama.cpp, Ollama ni TGI, dado el formato propietario .strata.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / despliegue | Licencia | Notas |
|---|---|---|---|---|---|
| Hy4-Flash-Strata (esta ficha) | 220B totales, 12B activos | 1.048.576 | .strata, app Strata | tencent-hy-license | Tres packs de 64 a 128 GiB de RAM; multimodal |
| tencent/Hy4-flash (original) | 220B totales, 12B activos | 1.048.576 | Pesos del autor (formato no detallado) | tencent-hy-license | Referencia de fidelidad; requiere hardware muy superior |
| strata-engine/Hy4-Flash-Strata | 220B totales, 12B activos | 1.048.576 | .strata | tencent-hy-license | Repositorio original del que este es un fork |
| Alternativas de otros fabricantes | no disponible | no disponible | no disponible | no disponible | No se han proporcionado datos de modelos comparables de otros autores |

## Limitaciones y advertencias

- La cuantización introduce desviación respecto al modelo original: incluso el mejor pack (SQ-128) presenta KL de 0,088 en razonamiento y 0,180 en tool calling; SQ-64 degrada el tool calling hasta 0,518, lo que puede romper flujos de agentes en producción.
- El formato .strata es propietario y solo se ejecuta con la aplicación Strata; no hay integración con ecosistemas estándar (vLLM, llama.cpp, TGI), lo que limita el despliegue en servidores y pipelines existentes.
- La licencia tencent-hy-license es distinta de las licencias open source habituales y debe revisarse antes de cualquier uso comercial; la model card no aclara los términos de redistribución de los pesos cuantizados.
- El repositorio es un fork de un tercero (strata-engine) replicado por nokkela-ai; no hay garantía de mantenimiento, auditoría ni soporte, y en el momento de la consulta no tenía descargas.
- No se documentan idiomas soportados; el rendimiento en castellano no está verificado.
- No se han publicado evaluaciones de sesgo, alucinación o robustez para esta cuantización; los riesgos del modelo base se heredan sin cuantificar.
- El tamaño en disco (130-181 GB) y la necesidad de 64-128 GiB de RAM excluyen su uso en portátiles convencionales y en la mayoría de instancias cloud estándar.
- El contexto de 1M tokens no implica que la calidad se mantenga en toda la ventana; no hay datos publicados al respecto.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/nokkela-ai/Hy4-Flash-Strata
- Repositorio original del que es fork: https://huggingface.co/strata-engine/Hy4-Flash-Strata
- Modelo base: https://huggingface.co/tencent/Hy4-flash
- Licencia del modelo base: https://huggingface.co/tencent/Hy4-flash/blob/main/LICENSE
- Repositorio de Strata en GitHub: https://github.com/Niko1221/Strata
- Descargas de la aplicación Strata: https://github.com/Niko1221/Strata/releases/latest
- Banner del fork (Nokkela.AI): https://github.com/NokkelaAI/nokkela-huggingface-fork-banner
