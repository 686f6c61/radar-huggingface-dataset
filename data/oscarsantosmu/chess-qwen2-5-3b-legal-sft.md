# OscarSantosMu/chess-qwen2.5-3b-legal-sft

## Resumen

chess-qwen2.5-3b-legal-sft es un adaptador LoRA de tipo PEFT entrenado mediante supervised fine-tuning (SFT) sobre el modelo base Qwen/Qwen2.5-3B-Instruct. Lo desarrolla el usuario OscarSantosMu y su proposito concreto es la seleccion de jugadas de ajedrez: dado un tablero en notacion FEN junto con la lista ordenada lexicograficamente de jugadas legales en notacion UCI, el modelo debe devolver exactamente una jugada legal en UCI. No es un modelo completo, sino un adaptador que debe cargarse junto al modelo base.

El interes tecnico del artefacto esta en el enfoque de representacion: en lugar de pedir al modelo que razone sobre el tablero de forma libre, se le entrega el conjunto cerrado de jugadas legales y se le entrena para elegir una. Esto convierte la tarea en una clasificacion restringida sobre un vocabulario de movimientos, lo que reduce el espacio de salida y simplifica la validacion. Es un trabajo de investigacion (tag `research`) con cero descargas y cero likes en el momento de la consulta, sin metricas publicadas.

La relevancia es acotada: sirve como banco de pruebas para evaluar hasta que punto un modelo de lenguaje de 3B de parametros, afinado con LoRA, puede aprender a jugar al ajedrez sin motores de busqueda. La model card es explicita: no garantiza jugadas legales ni optimas y su fuerza de juego no ha sido establecida mediante evaluaciones estandarizadas de motores de ajedrez.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base Qwen2.5-3B-Instruct) con adaptador LoRA (PEFT) |
| Parametros totales | 3B en el modelo base; parametros del adaptador no disponibles |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Qwen2.5-3B-Instruct) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantizacion aplicaria al modelo base) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador LoRA); requiere cargar el modelo base por separado |

## Arquitectura y entrenamiento

El adaptador se monta sobre Qwen2.5-3B-Instruct, un transformer decoder-only de 3.000 millones de parametros. El entrenamiento es SFT con LoRA, identificado en la model card con el experimento `e003_q25_3b_legal_20k_sft_s42`, lo que sugiere un conjunto de aproximadamente 20.000 ejemplos (por el sufijo `20k`) y una semilla 42. No se detallan hiperparametros de LoRA (rango, alpha, modulos objetivo), numero de tokens de entrenamiento ni composicion del dataset; la model card indica que los scripts de entrenamiento, manifiestos de experimento y resultados de evaluacion se mantienen en un repositorio de GitHub del proyecto y que los datos de entrenamiento no se incluyen en el repositorio del modelo.

La innovacion esta en la representacion de entrada denominada `legal`: el prompt de usuario incluye la posicion FEN y la lista de jugadas legales en UCI ordenada lexicograficamente, y la instruccion pide elegir la mejor jugada para el bando que mueve. El modelo se entrena con la plantilla de chat estandar de Qwen y una instruccion de sistema especifica de ajedrez que exige una unica jugada en UCI sin explicaciones ni puntuacion. Para reproducir el comportamiento en inferencia es necesario reutilizar la funcion `prompt_text()` de `examples/task.py` con `variant="legal"`, de modo que se mantengan la instruccion de sistema, el orden de las jugadas legales y la serializacion del chat usados en entrenamiento.

## Capacidades

- Generacion de texto conversacional heredada del modelo base Qwen2.5-3B-Instruct.
- Seleccion de jugadas de ajedrez en notacion UCI a partir de una posicion FEN y una lista de jugadas legales.
- Salida restringida a una unica jugada, sin explicaciones ni texto adicional, segun el formato de entrenamiento.
- Soporte de la plantilla de chat de Qwen con instruccion de sistema especifica de ajedrez.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Tool calling, function calling y razonamiento multi-paso orientado a agentes: no documentados para este adaptador.
- Modo thinking, vision o audio: no disponibles.

## Casos de uso

- Evaluacion de investigacion sobre razonamiento ajedrecistico en LLM: usar el adaptador como sujeto de prueba para medir la tasa de jugadas legales y la coincidencia con jugadas de motores en posiciones de un conjunto de validacion, comparando contra el modelo base sin adaptador.
- Generacion de jugadas en prototipos de ajedrez automatizado: integrar el adaptador en un bucle de juego donde se construya el prompt con FEN y lista de jugadas legales y se valide la salida contra `python-chess` antes de aplicarla.
- Banco de pruebas de representaciones de tablero: el esquema `legal` permite comparar esta variante frente a otras representaciones (por ejemplo, FEN puro o PGN) en experimentos controlados del mismo proyecto.
- Generacion de datasets sinteticos de ajedrez: producir jugadas candidatas para posiciones masivas y filtrar despues con un motor, usando el adaptador como generador de propuestas de bajo coste.
- Educacion y analisis de partidas: en un entorno supervisado, mostrar la jugada propuesta por el modelo junto a la evaluacion de un motor para ilustrar diferencias entre seleccion estadistica y busqueda.
- Investigacion sobre LoRA y SFT en dominios cerrados: el adaptador sirve como caso de estudio de cuanto conocimiento especifico de dominio puede inyectarse en un modelo de 3B con un adaptador pequeno y un dataset de aproximadamente 20.000 ejemplos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que las metricas de evaluacion y los hiperparametros detallados de entrenamiento se anadiran a medida que se consoliden los experimentos, y que la fuerza de juego no ha sido establecida mediante evaluaciones estandarizadas de motores de ajedrez o competiciones.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 3B en FP16 requiere aproximadamente 6-7 GB solo para pesos; en cuantizacion de 8 bits, unos 3-4 GB; en 4 bits, unos 2-3 GB. El adaptador LoRA anade una cantidad marginal de memoria. Estas cifras son estimaciones a partir del tamano del modelo base, no datos publicados para este adaptador.
- GPU recomendadas: A100 o H100 para experimentos por lotes a gran escala; RTX 4090, RTX 3090 o L4 para inferencia interactiva.
- Cabe en GPU de consumo: si, en tarjetas con al menos 8 GB de VRAM en FP16 (por ejemplo, RTX 3060 Ti, RTX 4060 Ti, RTX 3070) y en tarjetas con 4-6 GB si se cuantiza el modelo base.
- Opciones de despliegue: transformers junto con peft (flujo documentado en la model card); vLLM, llama.cpp, Ollama o TGI requeririan fusionar el adaptador con el modelo base o soportar adaptadores LoRA de forma nativa, extremo no documentado en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| chess-qwen2.5-3b-legal-sft | 3B (base) + LoRA | no disponible | SFT con LoRA sobre Qwen2.5-3B-Instruct, entrada `legal` | no disponible | Hugging Face, 0 descargas |
| Qwen/Qwen2.5-3B-Instruct (modelo base) | 3B | no disponible en esta ficha | LLM instructivo generalista | no disponible en esta ficha | Hugging Face |
| Motores de ajedrez clasicos (Stockfish, Leela Chess Zero) | no aplica (no son LLM) | no aplica | Busqueda con evaluacion heuristica o redes neuronales | GPL (Stockfish) / licencias propias | Amplia distribucion |

La comparacion con el modelo base es la mas directa para aislar el efecto del adaptador; la comparacion con motores de ajedrez es pertinente porque la model card advierte que no se ha medido la fuerza de juego frente a ellos. No se dispone de datos de benchmarks para establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- El modelo no garantiza jugadas legales ni optimas; la salida debe validarse contra las reglas del ajedrez antes de usarse.
- La representacion `legal` debe reproducirse exactamente en inferencia (instruccion de sistema, FEN, lista de jugadas legales ordenada lexicograficamente y serializacion del chat); cualquier desviacion puede degradar la calidad de la salida.
- La fuerza de juego no ha sido establecida mediante evaluaciones estandarizadas de motores de ajedrez o competiciones.
- Sesgos conocidos: no disponibles; al heredar el modelo base Qwen2.5-3B-Instruct, puede arrastrar sesgos de sus datos de preentrenamiento, no documentados aqui.
- Riesgo de alucinacion: relevante en la seleccion de jugadas, ya que el modelo podria emitir una jugada no incluida en la lista legal o con formato incorrecto.
- Limitaciones de contexto o idioma: no disponibles en la informacion proporcionada.
- Restricciones de licencia para uso comercial: la licencia no esta disponible, por lo que no puede confirmarse el uso comercial; debe consultarse el repositorio antes de cualquier despliegue en produccion.
- Es un adaptador, no un modelo autonomo: requiere descargar y cargar Qwen/Qwen2.5-3B-Instruct por separado.
- Proyecto de investigacion con cero descargas y sin metricas publicadas; no apto para produccion sin una evaluacion propia previa.

## Enlaces

- Hugging Face: https://huggingface.co/OscarSantosMu/chess-qwen2.5-3b-legal-sft
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Repositorio del proyecto (scripts de entrenamiento y evaluacion): no disponible como URL en la informacion proporcionada; la model card lo menciona como repositorio de GitHub del proyecto.
- Paper, blog o demo: no disponibles en la informacion proporcionada.
