# Muesli-HQ/lfm3-1.7b-muesli-cleanup-v14-mlx-8bit

## Resumen

`lfm3-1.7b-muesli-cleanup-v14-mlx-8bit` es un ajuste fino (LoRA fusionado y convertido a MLX de 8 bits) del modelo `LiquidAI/LFM3-1.7B`, publicado por Muesli-HQ. No es un modelo de propósito general: es un componente especializado de limpieza de dictado para Muesli, una aplicación de dictado para macOS. Recibe la salida cruda de un sistema de reconocimiento de voz (opcionalmente acompañada de contexto de la aplicación en foco, texto seleccionado u OCR de pantalla) y devuelve el texto corregido, sin reescribir ni parafrasear.

El modelo resuelve un problema muy concreto: la salida de un motor ASR contiene errores evidentes, muletillas, autocorrecciones habladas ("no, espera", "borra eso") y una puntuación que no se ajusta a la aplicación de destino. La ficha del autor insiste en que el modelo solo debe cambiar el texto cuando hay un error claro y devolver el original intacto en caso contrario. Con 1.728.801.536 parámetros y un tamaño de repositorio de 1,9 GB, está pensado para ejecutarse en local sobre Apple Silicon mediante MLX.

Es relevante por dos motivos. Primero, demuestra un patrón de despliegue on-device con un modelo de 1,7B cuantizado a 8 bits y latencias medianas de 0,48 s en un Apple M5. Segundo, ilustra un ajuste fino muy estrecho sobre una base reciente (LFM3), con instrucciones de prompt que deben reproducirse literalmente y con una licencia LFM Open License v1.0 que limita el uso comercial gratuito a organizaciones por debajo de 10 millones de dólares de facturación anual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base LFM3-1.7B de LiquidAI); pesos convertidos a MLX |
| Parametros totales | 1.728.801.536 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (la generacion se limita a 1.024 tokens nuevos) |
| Tipos de cuantizacion | 8 bits, group size 64 (unica variante publicada) |
| Idiomas soportados | en (ingles) |
| Licencia | LFM Open License v1.0 (license_name: lfm1.0, license: other) |
| Formato de pesos | safetensors (MLX), repositorio de 1,9 GB |
| Libreria de inferencia | mlx (Python: mlx-lm; Swift: mlx-swift-lm) |
| Pipeline | text-generation |
| Modelo base | LiquidAI/LFM3-1.7B |
| Metodo de ajuste | LoRA rank 16, fusionado en los pesos base |

## Arquitectura y entrenamiento

El modelo parte de `LiquidAI/LFM3-1.7B`, una base de tipo transformer de 1,7B parámetros, y aplica un LoRA de rango 16 sobre las proyecciones de atención, MLP y convolución corta. El entrenamiento se hizo en bf16 con transformers 5.20 y PEFT 0.21, durante 1 época (9.815 pasos), calculando la pérdida únicamente sobre la respuesta y fusionando después el adaptador en los pesos base. El resultado se convirtió a MLX con cuantización de 8 bits y group size 64.

Los datos de entrenamiento son el blend-v14: 157.037 pares de limpieza que cubren correo electrónico, chat, documentos, prompts para agentes de IA, código, hojas de cálculo y presentaciones, cajas de búsqueda y dictados largos. Aproximadamente el 24 % de los pares incluyen contexto de pantalla. Respecto al blend-v12, añade errores de reconocimiento realistas y hábitos de habla, unifica unos 15.000 objetivos de formato bajo una especificación escrita (las indicaciones habladas siempre generan lista; en notas y documentos solo se generan listas con 3 o más elementos; se conservan los encabezados dictados; numeración solo cuando se cuenta explícitamente), elimina filas que no pasaron una auditoría y añade 2.759 filas de formato verificadas por Claude.

No se documentan innovaciones arquitectónicas propias más allá del ajuste fino; la particularidad técnica está en el contrato de prompt y en el proceso de curación de datos. El prompt debe construirse manualmente con los tokens `<|startoftext|>`, `<|im_start|>` y `<|im_end|>`, sin mensaje de sistema, con decodificación greedy (temperatura 0, `top_k=1`, sin penalización de repetición) y parada en `<|im_end|>`. El bloque de contexto de aplicación se limita a 1.200 caracteres.

## Capacidades

- Limpieza de transcripciones de voz: corrección de errores evidentes de reconocimiento, eliminación de muletillas ("um", "uh", "like") y aplicación de autocorrecciones habladas del tipo "scratch that".
- Formateo de listas: convierte elementos enumerados o claramente listados en listas con viñetas o numeradas según la especificación del blend-v14.
- Adaptación de puntuación al estilo de la aplicación de destino (correo, chat, documentos, cajas de búsqueda).
- Uso de contexto de pantalla: app en foco, campo de documento, URL, texto seleccionado y OCR de pantalla, exclusivamente para resolver errores de nombres, acrónimos y formato.
- Preservación del texto correcto: devuelve la entrada sin cambios cuando no detecta errores.
- Generación de texto conversacional a nivel de pipeline (`text-generation`), aunque el uso previsto es el de limpieza.
- No soporta tool calling, function calling, agentes multi-paso, visión ni audio de forma nativa; el contexto de pantalla llega como texto en el prompt.
- No es un reconocedor de voz: no transcribe audio.

## Casos de uso

- Dictado en macOS con Muesli: integración directa en la app para limpiar la salida del ASR antes de insertarla en el campo activo; el modelo está entrenado con el prompt exacto que usa la aplicación y con contexto de app en el 24 % de los pares.
- Correo electrónico dictado: el modelo ajusta la puntuación al estilo de la app de correo y corrige nombres y acrónimos usando el contexto del documento en foco, sin reescribir el mensaje.
- Notas y documentos largos: con dictados extensos, aplica la regla de listas solo a partir de 3 elementos y conserva los encabezados dictados, lo que reduce el reformateo no deseado.
- Prompts para agentes de IA: el blend-v14 incluye pares de prompts de agente, de modo que el modelo limpia la instrucción dictada sin añadir palabras ni cambiar el significado, algo crítico cuando el prompt se envía a otro modelo.
- Código y hojas de cálculo: limpieza de dictado de identificadores, fragmentos de código y celdas, apoyándose en el contexto de pantalla para resolver errores en nombres de variables o funciones.
- Búsquedas dictadas: corrección mínima de la consulta en cajas de búsqueda, manteniendo la formulación original del usuario y evitando paráfrasis que alteren los términos buscados.
- Despliegue local en Apple Silicon: al ser MLX de 8 bits y 1,9 GB, puede ejecutarse en un portátil Mac sin GPU dedicada, con latencia mediana de 0,48 s y p90 de 0,67 s en un M5 con unos 535 tokens de prompt.

## Benchmarks y rendimiento

Resultados publicados por el autor: tasa de error de palabra frente a la limpieza de referencia y coincidencia exacta (%, una petición a la vez).

| Build | Contexto de pantalla (400) | Dictado simple (512) | Categorias nuevas A (309) | Categorias nuevas B (284) | Realismo (310) | Formato (180) |
|---|---|---|---|---|---|---|
| este modelo (MLX 8-bit) | 8,01 / 53,8 | 3,00 / 75,4 | 2,54 / 36,6 | 2,61 / 42,3 | 2,57 / 38,1 | 1,49 / 24,4 |

Los conjuntos de prueba están fuera del entrenamiento, fueron escritos por modelos abiertos y filtrados por un juez modelo; el conjunto de formato lo escribió Kimi K3 y cada fila fue revisada por Claude. El autor advierte de que no son dictados reales de usuarios y que el conjunto de dictado simple usa convenciones de lista antiguas que el blend-v14 corrige, por lo que los modelos v14 puntúan peor en él.

Rendimiento en un Apple M5 con aproximadamente 535 tokens de prompt: mediana de 0,48 s, p90 de 0,67 s, 0,56 s tras 30 s de inactividad; prefill de unas 1.580 tok/s y decodificación de unas 48 tok/s.

## Requisitos de hardware

- VRAM/unificada estimada: el repositorio ocupa 1,9 GB en 8 bits con group size 64; en Apple Silicon la memoria unificada necesaria es del orden de 2 GB más el overhead del runtime.
- GPU recomendadas: no se documentan GPU NVIDIA; el modelo está empaquetado para MLX y el rendimiento publicado corresponde a un Apple M5.
- Cabe en GPU de consumo: sí, en equipos Apple Silicon con memoria unificada suficiente; no hay datos publicados para GPUs de consumo NVIDIA porque no se distribuye en GGUF.
- Opciones de despliegue: mlx-lm en Python y mlx-swift-lm en Swift. LFM3 es reciente y las versiones publicadas de mlx-lm y mlx-swift-lm no cargan `lfm3` todavía: en Swift hace falta el PR ml-explore/mlx-swift-lm#750 (requiere mlx-swift 0.33) y en Python el PR mlx-lm#2016, usado para convertir este modelo. El tokenizador usa `ignore_merges` en BPE y swift-transformers necesita huggingface/swift-transformers#397 (en `main`, sin publicar) para tokenizar igual que HF.
- Latencia y throughput: mediana 0,48 s, p90 0,67 s, prefill ~1.580 tok/s, decode ~48 tok/s en Apple M5 con ~535 tokens de prompt.
- No se documentan opciones para vLLM, llama.cpp, Ollama ni TGI.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| lfm3-1.7b-muesli-cleanup-v14-mlx-8bit | 1,73B | no disponible | MLX 8-bit | LFM Open License v1.0 | Limpieza de dictado en ingles |
| LiquidAI/LFM3-1.7B (base) | 1,7B | no disponible | safetensors | LFM Open License v1.0 | Modelo base de proposito general |
| Alternativas de limpieza de dictado | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks de la base LFM3-1.7B ni de otros modelos de limpieza de dictado en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa fiable.

## Limitaciones y advertencias

- Solo ingles: no soporta castellano ni otros idiomas.
- No es un reconocedor de voz; únicamente limpia texto ya transcrito.
- El prompt debe coincidir exactamente con el de entrenamiento (un turno de usuario, sin mensaje de sistema, tokens especiales literales, decodificación greedy, parada en `<|im_end|>`); desviarse degrada la calidad.
- Licencia LFM Open License v1.0: el uso comercial es gratuito solo para organizaciones con ingresos anuales inferiores a 10 millones de dólares.
- Riesgo de alucinación y de paráfrasis no deseada: el propio autor recomienda una salvaguarda en la app que pegue la transcripción cruda si la salida está vacía o supera 3 veces la longitud de la entrada.
- Riesgo de copiar contexto de pantalla en la salida; el prompt lo prohíbe explícitamente, pero es un modo de fallo conocido en este tipo de tareas.
- Los conjuntos de evaluación no son dictados reales de usuarios, sino generados por modelos y filtrados por un juez; los números pueden no trasladarse al uso real.
- Dependencias de runtime no publicadas: requiere PRs de mlx-lm, mlx-swift-lm y swift-transformers para cargar y tokenizar correctamente; sin ellas la integración falla o tokeniza distinto.
- El conjunto de dictado simple usa convenciones de lista antiguas, por lo que la métrica de ese conjunto subestima el comportamiento con las reglas actuales.
- Sin descargas ni likes en el momento de la consulta; ecosistema y soporte muy limitados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Muesli-HQ/lfm3-1.7b-muesli-cleanup-v14-mlx-8bit
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- PR de mlx-swift-lm para soporte LFM3: https://github.com/ml-explore/mlx-swift-lm/pull/750
- PR de mlx-lm usado en la conversion: https://github.com/ml-explore/mlx-lm/pull/2016
- PR de swift-transformers para `ignore_merges`: https://github.com/huggingface/swift-transformers/pull/397
- Licencia en el repositorio: LICENSE (LFM Open License v1.0)
