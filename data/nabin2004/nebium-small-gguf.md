# nabin2004/nebium-small-gguf

## Resumen

Nebium-Small-GGUF es la version cuantizada en formato GGUF de Nebium-Small, un modelo de lenguaje causal de dominio muy restringido desarrollado por el usuario nabin2004 y especializado en la prediccion de jugadas de ajedrez en notacion UCI. No es un modelo de proposito general: su vocabario esta limitado a 5000 tokens BPE de notacion UCI, de modo que su tarea es continuar secuencias de jugadas ("e2e4 e7e5 g1f3") prediciendo la siguiente jugada legal en el contexto de una partida. La model card declara 117M de parametros, aunque la ficha de HuggingFace del repositorio notifica 6.441.472 parametros totales, una discrepancia que el autor no explica.

El interes practico del modelo reside en su formato de distribucion: los binarios GGUF estan pensados para inferencia local en CPU y GPU mediante llama.cpp, Ollama y los bindings de Python llama-cpp-python. Con una ventana de contexto de 1024 tokens y una arquitectura transformer causal con RoPE (768 dimensiones ocultas, 12 cabezas de atencion, 12 capas), el modelo esta disenado para ejecutarse en entornos con recursos muy limitados, incluidos dispositivos de borde, sin necesidad de GPU dedicada.

El momento de publicacion del repositorio (septiembre de 2026 segun los metadatos) y sus cero descargas y cero likes indican que se trata de un artefacto recien publicado y practicamente sin validacion externa por parte de la comunidad. No se ha publicado informacion sobre el dataset de entrenamiento, el numero de tokens vistos ni el proceso de ajuste, ni resultados de benchmarks, por lo que cualquier evaluacion debe hacerse por prueba directa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con Rotary Position Embeddings (RoPE) |
| Parametros totales | 117M segun la model card; 6.441.472 segun el dato de safetensors del repositorio en HuggingFace (discrepancia no aclarada por el autor) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | FP16, Q8_0 y Q4_K_M (tres binarios GGUF publicados) |
| Idiomas soportados | en (segun metadatos); en la practica el modelo opera sobre notacion UCI de ajedrez, no sobre lenguaje natural |
| Licencia | MIT |
| Formato de pesos | GGUF (los pesos base en PyTorch estan en nabin2004/nebium-small) |
| Dimension oculta (d_model) | 768 |
| Cabezas de atencion | 12 |
| Capas | 12 |
| Vocabulario | 5000 tokens BPE de notacion UCI |
| Token especial de parada | `<|eos|>` (y `<|pad|>` como token de relleno) |

## Arquitectura y entrenamiento

La arquitectura es un transformer causal clasico con codificacion posicional rotatoria (RoPE). Las especificaciones declaradas por el autor son: dimension oculta de 768, 12 cabezas de atencion, 12 capas y una longitud de contexto de 1024 tokens. El vocabario es deliberadamente reducido (5000 tokens BPE) y esta restringido a notacion UCI de ajedrez, lo que implica que el modelo no puede procesar lenguaje natural ni generar texto fuera del dominio de las jugadas. Con 12 capas y 768 dimensiones ocultas, el coste computacional por token es muy bajo en comparacion con modelos de proposito general del mismo rango de parametros.

No se dispone de informacion sobre el proceso de entrenamiento: la model card no detalla el numero de tokens de entrenamiento, la composicion del corpus (partidas de ajedrez, motores, bases de datos publicas, etc.), ni si hubo fases de ajuste por instrucciones, RLHF o DPO. Tampoco se documenta ninguna innovacion tecnica mas alla del uso estandar de RoPE y de la cuantizacion GGUF para despliegue local. No hay informacion sobre decodificacion especulativa, atencion lineal ni tecnicas de compresion adicionales.

## Capacidades

- Generacion de texto limitada a notacion UCI de ajedrez: el modelo predice la continuacion de una secuencia de jugadas, no texto en lenguaje natural.
- Continuacion de partidas: acepta un historial de jugadas separadas por espacios y devuelve las siguientes jugadas probables, con `--temp` y `--top-p` configurables.
- Inferencia local de alta eficiencia: al estar en GGUF, funciona con llama.cpp en CPU, con o sin aceleracion GPU parcial.
- Integracion con Ollama mediante un Modelfile que define un system prompt de "motor de continuacion de jugadas en notacion UCI".
- Integracion con Python a traves de llama-cpp-python, con control de `n_ctx`, `n_threads`, `max_tokens` y tokens de parada.
- Soporte de cuantizacion con perdida minima declarada por el autor en Q8_0 (perdida de perplejidad descrita como insignificante) y minima huella de memoria en Q4_K_M.
- No dispone de tool calling, function calling, capacidades de agente, razonamiento multi-paso, vision, audio ni modo de pensamiento. No se documenta soporte multilingue mas alla de la etiqueta `en`.

## Casos de uso

- Motor de continuacion de jugadas en herramientas de analisis: integrado como libreria local, el modelo puede sugerir la siguiente jugada a partir del historial en UCI, util como componente auxiliar en un analizador ligero que no quiera depender de un motor clasico.
- Asistente de ajedrez en dispositivos de borde: con la cuantizacion Q4_K_M y una ventana de 1024 tokens, puede ejecutarse en una Raspberry Pi, un movil o un portatil sin GPU, ofreciendo predicciones de jugadas sin conexion a internet.
- Generacion de datos sinteticos para entrenamiento: puede producir secuencias de jugadas plausibles que sirvan como corpus auxiliar para entrenar modelos de ajedrez mas grandes o para aumentar datasets de notacion UCI.
- Evaluacion de pipelines de inferencia local: por su tamano minimo, es un banco de pruebas rapido para validar configuraciones de llama.cpp, Ollama o llama-cpp-python (numero de hilos, cuantizacion, parametros de muestreo) antes de pasar a modelos mayores.
- Prototipado de interfaces de tablero: un desarrollador puede conectar el modelo a una GUI de ajedrez para obtener sugerencias en tiempo real sin infraestructura de servidor, usando el binario FP16 o Q8_0.
- Analisis de aperturas y repeticiones: al aceptar secuencias de jugadas en formato UCI, puede usarse para explorar continuaciones frecuentes en posiciones dadas dentro del limite de 1024 tokens de contexto.
- Demostraciones educativas de modelos causales: sirve como ejemplo didactico de un transformer pequeno entrenado en un dominio cerrado, con vocabario reducido y despliegue en GGUF, para explicar el ciclo completo de entrenamiento a inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de perplejidad, precision de prediccion de jugadas, comparacion con motores de ajedrez ni evaluaciones de calidad de continuacion. Los resultados de la busqueda web proporcionada no contienen informacion relacionada con el modelo.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia (calculada a partir de los 117M de parametros declarados; cifras orientativas, no publicadas por el autor):
  - FP16: aproximadamente 234 MB de pesos.
  - Q8_0: aproximadamente 120-130 MB.
  - Q4_K_M: aproximadamente 70-80 MB.
- Si el recuento real fuese el reportado por HuggingFace (6,4M de parametros), las huellas serian aproximadamente 20 veces menores (del orden de 13 MB en FP16).
- GPU recomendadas: cualquier GPU con mas de 1 GB de VRAM es suficiente; no se requiere A100, H100 ni RTX 4090. Una GTX 1050, una GPU integrada moderna o incluso CPU pura son suficientes.
- Compatibilidad con GPU de consumo: si, cabe holgadamente en cualquier GPU de consumo y en la mayoria de SoC integrados.
- Opciones de despliegue: llama.cpp (CLI `llama-cli`), Ollama (via Modelfile), llama-cpp-python, y cualquier runtime compatible con GGUF.
- Latencia y throughput: no disponibles. Al ser un modelo de 12 capas y 768 dimensiones ocultas con contexto de 1024 tokens, el autor lo posiciona como apto para entornos de CPU y de borde, pero no se aportan mediciones de tokens por segundo ni de latencia.

## Comparativa con modelos similares

No se dispone de datos verificables sobre modelos comparables en la informacion proporcionada, y los resultados de la busqueda web no contienen referencias relevantes. La unica comparacion posible con los datos disponibles es entre las propias variantes publicadas en el repositorio:

| Variante | Precision | Uso recomendado por el autor | Licencia |
|---|---|---|---|
| `nebium-small.gguf` | FP16 | Linea base a precision completa para evaluacion local | MIT |
| `nebium-small-q8_0.gguf` | Q8_0 | Precision recomendada, con perdida de perplejidad descrita como insignificante | MIT |
| `nebium-small-q4_k_m.gguf` | Q4_K_M | Entornos de CPU y borde con recursos muy limitados | MIT |

Comparativa con alternativas externas (modelos de ajedrez de proposito especifico o modelos pequenos de proposito general): no disponible.

## Limitaciones y advertencias

- Discrepancia de parametros: la model card declara 117M de parametros mientras que la ficha de HuggingFace reporta 6.441.472. Cualquier estimacion de recursos o capacidad debe verificarse directamente sobre los binarios.
- Dominio extremadamente cerrado: el vocabario de 5000 tokens esta limitado a notacion UCI, por lo que el modelo no puede procesar ni generar lenguaje natural. No es util como chatbot ni como asistente general.
- Contexto muy corto: 1024 tokens, suficiente para un historial de jugadas pero insuficiente para incorporar comentarios, metadatos de partida o instrucciones largas.
- Riesgo de jugadas ilegales: al ser un modelo generativo y no un motor con validacion de reglas, puede producir secuencias que no son legales en la posicion dada. Se requiere validacion externa con una libreria de reglas de ajedrez en cualquier uso productivo.
- Riesgo de alucinacion: no hay mecanismo de verificacion interno; el modelo puede repetir bucles de jugadas o generar continuaciones incoherentes, especialmente con temperaturas altas.
- Sin resultados de benchmarks ni validacion de la comunidad: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia publica de calidad de prediccion.
- Idiomas: la etiqueta de idioma es `en`, pero el modelo no procesa lenguaje natural; cualquier expectativa multilingue no aplica.
- Licencia MIT: permite uso comercial y modificacion con atribucion, pero el autor no ofrece garantias sobre el contenido generado ni sobre el rendimiento.
- Tamano de repositorio reportado de 0.0 GB: conviene comprobar que los binarios GGUF estan efectivamente subidos antes de planificar un despliegue, ya que ese dato es compatible con un repositorio vacio o recien creado.
- Fecha de creacion del repositorio (2026-09-18) posterior a la fecha habitual de publicacion de modelos: conviene verificar la vigencia y la autenticidad del artefacto.
- Sin informacion de entrenamiento: se desconoce el origen de los datos, lo que impide evaluar sesgos, licencias de las partidas utilizadas o posibles fugas de datos.

## Enlaces

- Repositorio GGUF en HuggingFace: https://huggingface.co/nabin2004/nebium-small-gguf
- Pesos base en PyTorch: https://huggingface.co/nabin2004/nebium-small
- Codigo fuente del framework: https://github.com/nabin2004/nebium
- llama.cpp: https://github.com/ggerganov/llama.cpp
- Ollama: https://ollama.ai
- Resultados de la busqueda web: no se han encontrado enlaces relevantes al modelo en la informacion proporcionada.
