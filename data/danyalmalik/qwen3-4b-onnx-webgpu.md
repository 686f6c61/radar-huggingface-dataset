# danyalmalik/Qwen3-4B-ONNX-WebGPU

## Resumen

Qwen3-4B-ONNX-WebGPU es una conversión del modelo Qwen3-4B de Alibaba Qwen a formato ONNX, publicada por el usuario danyalmalik, pensada para ejecutar inferencia de un LLM de 4.000 millones de parámetros directamente en el navegador mediante el backend WebGPU de ONNX Runtime Web, tal y como lo consume la herramienta Quick Inference. El repositorio no contiene los pesos originales en safetensors, sino un decoder exportado en el layout de ONNX Runtime GenAI (`input_ids`, `attention_mask`, `past_key_values.*` → `logits`, `present.*`), con las capas lineales cuantizadas a 4 bits.

La conversión incorpora además un cabezal draft EAGLE-3 (`draft/`), también en ONNX y 4 bits, que permite decodificación especulativa: el draft propone tokens a partir de estados intermedios del modelo y el modelo principal verifica cada propuesta, de modo que la salida coincide exactamente con la del modelo grande. Esto es relevante porque ataca el principal cuello de botella de la inferencia en cliente (la latencia por token en hardware modesto) sin degradar la distribución de salida, algo crítico cuando el usuario final ejecuta el modelo en su propia GPU integrada o discreta.

El atractivo práctico es la combinación de tres piezas: un modelo denso de 4B con licencia Apache 2.0, un artefacto ONNX listo para WebGPU y un mecanismo de speculative decoding empaquetado. El repositorio ocupa 3,4 GB y no incluye documentación sobre tokenizador, plantilla de chat ni resultados de evaluación, por lo que debe tratarse como un artefacto de despliegue más que como un modelo nuevo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3) exportado a ONNX Runtime GenAI; la model card no detalla número de capas ni dimensión oculta (usa la notación N/2 y N-3 para las capas de las que extrae `eagle_taps`) |
| Parametros totales | 4B (modelo base Qwen/Qwen3-4B); cifra exacta no disponible en la model card |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la model card; el modelo base Qwen3-4B declara 32.768 tokens nativos, extensibles a 131.072 con YaRN según la documentación de Qwen |
| Tipos de cuantizacion | Capas lineales y capa de salida en 4 bits (round to nearest, block size 32); embeddings, activaciones y KV cache en float16; el cabezal draft también en 4 bits (RTN, block 32) con KV cache estática |
| Idiomas soportados | no disponible en la model card (heredados del modelo base, que declara soporte multilingüe amplio) |
| Licencia | Apache 2.0 para el modelo; el cabezal draft se distribuye bajo sus propios términos (`draft/License_AngelSlim_model_and_dataset.txt`) |
| Formato de pesos | ONNX (layout ONNX Runtime GenAI), cuantizado en el propio grafo; repositorio de 3,4 GB con subcarpeta `draft/` |

## Arquitectura y entrenamiento

El artefacto es una conversión, no un entrenamiento. El exportador propio de Quick Inference transforma el decoder de Qwen3-4B al layout de ONNX Runtime GenAI, cuantiza las matrices lineales a 4 bits con redondeo al más cercano y bloques de 32 elementos, y mantiene en float16 los embeddings, las activaciones y la caché KV. La capa de salida también va en 4 bits porque los embeddings de tokens están atados a ella, de forma que una única tabla de 4 bits sirve para ambas funciones. La rotary embedding se aplica dentro del operador `GroupQueryAttention` y las RMSNorm por cabeza de q y k se pliegan en él mediante `qk_norm_epsilon` (entradas 14 y 15, estándar en ONNX Runtime 1.30), lo que reduce el número de operadores y el coste de ejecución en WebGPU.

La pieza diferencial es la salida adicional `eagle_taps`: el residual stream a la entrada de tres capas (2, N/2 y N-3, concatenados), que alimenta al cabezal draft. Ese cabezal es AngelSlim/Qwen3-4B_eagle3 (EAGLE-3) convertido a ONNX, con matrices a 4 bits, caché KV propia estática y salida como id de token. El flujo de decodificación especulativa es el habitual de EAGLE-3: el draft adivina varios tokens y el modelo principal los verifica, de modo que el resultado final es exactamente el del modelo, no una aproximación. El autor advierte explícitamente de que los ficheros son modificados y de que sus salidas son cercanas, pero no idénticas, a las del modelo original (consecuencia de la cuantización, no del draft).

No se documentan en la model card datos de entrenamiento, composición del dataset, número de tokens, ni fases de RLHF/DPO o destilación aplicadas al modelo base.

## Capacidades

- Generación de texto y razonamiento en el cliente: hereda del modelo base Qwen3-4B, incluido su modo de razonamiento (thinking) según la documentación de Qwen, aunque la model card de esta conversión no lo verifica.
- Generación de código y matemáticas: capacidades propias de la familia Qwen3, sin evaluación publicada en este repositorio.
- Decodificación especulativa verificada: el draft EAGLE-3 propone tokens y el modelo los valida, con salida idéntica a la del modelo principal.
- Ejecución íntegra en navegador sobre WebGPU mediante ONNX Runtime Web, sin backend remoto.
- Soporte de tool calling / function calling: heredado del modelo base; requiere el tokenizador y la plantilla de chat, no documentados en la model card.
- Razonamiento multi-paso y uso como motor de agentes locales: posible por herencia del base, sin ejemplos ni recetas incluidas en el repositorio.
- Capacidades multilingües: heredadas del modelo base; el repositorio no enumera idiomas ni incluye evaluaciones por idioma.
- No incluye visión, audio ni otras modalidades: es un decoder de texto.

## Casos de uso

- Asistentes con privacidad estricta: el modelo se ejecuta en la GPU del usuario vía WebGPU, por lo que el texto nunca sale del dispositivo; adecuado para aplicaciones de salud, legal o RRHH donde enviar datos a una API externa no es viable.
- Procesamiento de documentos confidenciales en el cliente: resumen, extracción de entidades y reescritura de contratos o informes dentro de una pestaña del navegador, con la ventana de contexto del modelo base para documentos de varias decenas de miles de tokens.
- Autocompletado y edición de texto en aplicaciones SaaS: integración en editores web sin aprovisionar GPUs en servidor; el coste de inferencia se traslada al cliente y desaparece el coste marginal por token.
- Demos técnicas y documentación interactiva: playground que descarga 3,4 GB y ejecuta el modelo localmente, útil para mostrar capacidades de un LLM sin claves de API ni límites de cuota.
- Extensiones de navegador para clasificación y moderación offline: filtrado de contenido, etiquetado o triaje de textos sin conexión, usando el modelo como clasificador zero-shot mediante prompts.
- Bancos de pruebas de decodificación especulativa: el par decoder + draft EAGLE-3 permite medir tasas de aceptación y ganancia de latencia en hardware de cliente real, un escenario difícil de reproducir con servidores.
- Agentes locales con tool calling: orquestación de llamadas a funciones dentro de una aplicación web (por ejemplo, consultas a APIs locales o IndexedDB) aprovechando la ventana de contexto del modelo base.
- Prototipado educativo: análisis del grafo ONNX, de la cuantización por bloques y del plegado de operadores en `GroupQueryAttention` en cursos de optimización de inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra métrica, tampoco la tasa de aceptación del cabezal EAGLE-3 ni mediciones de latencia o throughput en WebGPU. Cualquier cifra de rendimiento de esta conversión tendría que medirse localmente.

## Requisitos de hardware

- VRAM estimada para los pesos: aproximadamente 2,1 GB para el decoder en 4 bits (4.000 M de parámetros a ~4,25 bits efectivos por el block size de 32); el repositorio completo son 3,4 GB, incluyendo el cabezal draft y ficheros auxiliares.
- Caché KV en float16: estimación de unos 4,7 GB para 32.768 tokens asumiendo la configuración pública de Qwen3-4B (36 capas, GQA con 8 cabezas KV de dimensión 128). Es un cálculo propio a partir de la configuración del modelo base, no una cifra publicada por el autor.
- GPU recomendadas: cualquier GPU con soporte WebGPU y 8 GB o más de memoria para contextos largos (RTX 3060/4060/4070, Apple Silicon M-series, GPUs integradas recientes con límites de contexto más bajos).
- Cabe en GPU de consumo: sí, es el objetivo del artefacto; con 4-6 GB de VRAM se puede trabajar con contextos moderados, no con la ventana completa.
- Restricciones del entorno: en navegador, el límite real suele ser la memoria asignada a la pestaña y la implementación de WebGPU del navegador, no solo la VRAM del sistema.
- Opciones de despliegue: ONNX Runtime Web con el execution provider WebGPU y ONNX Runtime GenAI para el layout de entradas/salidas. Este formato no es compatible con vLLM, TGI, llama.cpp ni Ollama; para esos motores haría falta el modelo en safetensors o una conversión GGUF aparte.
- Latencia y throughput: no disponibles. El cabezal EAGLE-3 está diseñado para reducir la latencia de decodificación, pero no se publican medidas de tokens por segundo ni de tasa de aceptación.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato y cuantización | Licencia | Ejecución |
|---|---|---|---|---|---|
| Qwen3-4B-ONNX-WebGPU | 4B (denso) | no disponible en la card; 32.768 en el base | ONNX, lineales 4 bits, KV fp16, draft EAGLE-3 4 bits | Apache 2.0 (+ licencia propia del draft) | Navegador, ONNX Runtime Web WebGPU |
| Qwen/Qwen3-4B (original) | 4B (denso) | 32.768 (131.072 con YaRN) | safetensors en bf16 | Apache 2.0 | GPU/servidor con PyTorch, vLLM, TGI |
| Qwen3-4B en GGUF (conversiones de la comunidad) | 4B (denso) | 32.768 (131.072 con YaRN) | GGUF, Q4_K_M y otras | Apache 2.0 | llama.cpp, Ollama, LM Studio en local |
| Llama-3.2-3B-Instruct | 3,21B (denso) | 128.000 | safetensors bf16 y GGUF | Llama 3.2 Community License | Local y servidor; sin soporte nativo en navegador |

No hay datos de rendimiento comparables publicados para esta conversión, por lo que la comparativa se limita a parámetros, contexto, formato y licencia. Frente al modelo original y a las versiones GGUF, la ventaja de este artefacto es la ejecución en navegador con decodificación especulativa incluida; la desventaja es la ausencia de evaluación y de soporte en los motores de inferencia habituales.

## Limitaciones y advertencias

- La cuantización a 4 bits con redondeo al más cercano y bloques de 32 introduce degradación frente a bf16; el propio autor indica que las salidas son cercanas pero no idénticas a las del modelo original.
- No hay benchmarks ni evaluaciones de calidad publicadas: la magnitud de esa degradación es desconocida.
- El cabezal draft se distribuye bajo una licencia distinta (AngelSlim), con un fichero de términos propio; hay que revisarlo antes de cualquier uso comercial del conjunto.
- Dependencia fuerte de WebGPU: el soporte varía entre navegadores y versiones, y la memoria disponible por pestaña puede impedir cargar el modelo o usar contextos largos.
- La descarga inicial es de 3,4 GB, un coste relevante para aplicaciones web orientadas a usuarios finales.
- La model card no documenta tokenizador, plantilla de chat ni formato de prompt incluidos en el repositorio, lo que complica reproducir el comportamiento conversacional del modelo base.
- Sin compatibilidad con vLLM, TGI, llama.cpp u Ollama; no sirve como artefacto de despliegue en servidor.
- Sin validación de la comunidad: 0 descargas y 0 likes en el momento de la consulta, sin issues ni informes de terceros.
- Hereda los sesgos y el riesgo de alucinación del modelo base, no evaluados ni mitigados en esta conversión.
- No se especifican idiomas soportados ni calidad por idioma en el artefacto; el comportamiento multilingüe debe verificarse empíricamente.

## Enlaces

- Repositorio del modelo: https://huggingface.co/danyalmalik/Qwen3-4B-ONNX-WebGPU
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Cabezal draft EAGLE-3: https://huggingface.co/AngelSlim/Qwen3-4B_eagle3
- La búsqueda web realizada no devolvió papers, blogs, repositorios ni demos relevantes sobre esta conversión; los resultados obtenidos no guardaban relación con el modelo.
