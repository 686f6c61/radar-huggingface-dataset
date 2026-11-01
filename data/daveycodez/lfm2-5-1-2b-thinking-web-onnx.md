# daveycodez/LFM2.5-1.2B-Thinking-Web-ONNX

## Resumen
LFM2.5-1.2B-Thinking-Web-ONNX es una compilacion ONNX comunitaria de 4 bits del modelo LFM2.5-1.2B-Thinking de Liquid AI, empaquetada para su ejecucion en navegador mediante Transformers.js sobre WebGPU, incluido Safari en iPhone. La publica el usuario daveycodez y no cuenta con el respaldo de Liquid AI. El modelo base es un transformer de 1.200 millones de parametros con modo de razonamiento explicito (thinking) y una ventana de contexto que la model card no detalla.

La aportacion tecnica de esta build es una modificacion del grafo ONNX que anade la entrada `num_logits_to_keep`, de forma que durante la generacion solo se calculan los logits de la ultima posicion en lugar de los de todo el prompt. Esto reduce el tensor de salida de un prompt de 800 tokens de 209.715.200 bytes a 262.144 bytes y evita los cierres de pestana por falta de memoria en Safari movil, donde una pestana dispone de unos 2 GB incluyendo memoria de GPU.

Es relevante porque demuestra que modelos de razonamiento de 1,2B pueden desplegarse integramente en el cliente sin servidor, con una latencia de unos 222 ms para un prompt de herramienta de 541 tokens y 24 tokens nuevos en WebGPU. El repo ocupa 1,6 GB e incluye unicamente la variante q4f16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia LFM2.5 de Liquid AI); detalles internos no disponibles en la informacion proporcionada |
| Parametros totales | 1.2B (segun el nombre del modelo) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | q4f16 (4 bits de pesos, activaciones en float16); unica variante incluida |
| Idiomas soportados | en, ja, ko, fr, es, de, it, pt, ar, zh |
| Licencia | LFM Open License v1.0 (lfm1.0); uso comercial solo para entidades con ingresos anuales inferiores a 10 millones de dolares |
| Formato de pesos | ONNX (model_q4f16.onnx y model_q4f16.onnx_data); repo de 1,6 GB |

## Arquitectura y entrenamiento
El modelo base es LFM2.5-1.2B-Thinking de Liquid AI, un transformer de 1.200 millones de parametros con capacidad de razonamiento explicito. La model card de esta build no aporta informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO; esos datos corresponden a la ficha del modelo original y no se detallan aqui.

La innovacion de esta compilacion es puramente de inferencia: se anaden tres nodos (`Neg`, `Unsqueeze`, `Slice`), tres constantes int64 y una nueva entrada `num_logits_to_keep` al grafo. Los hidden states tras la normalizacion final se recortan a las ultimas `num_logits_to_keep` posiciones antes de la cabeza LM; con `0` se conservan todas. Transformers.js pasa `1` durante `generate()`. Los pesos no se modifican: `onnx/model_q4f16.onnx_data` es identico byte a byte al original (SHA-256 `da02a690901817926fe4b8cda11e3fddc42604729dd4ce62c39df53a3ec2094d`). La pequena diferencia en los logits de la ultima posicion (maximo 0,0078 en valor absoluto con logits de hasta +-16) proviene de que el matmul de 4 bits de la cabeza LM opera sobre una fila en lugar de cientos, lo que altera el orden de las sumas en float16; el token mas probable coincide en todas las pruebas.

## Capacidades
- Generacion de texto conversacional en diez idiomas: ingles, japones, coreano, frances, espanol, aleman, italiano, portugues, arabe y chino.
- Modo de razonamiento explicito (thinking), segun la etiqueta `thinking` y el nombre del modelo base.
- Ejecucion en navegador sobre WebGPU mediante Transformers.js, incluido Safari en iPhone.
- Inferencia en CPU mediante onnxruntime como alternativa a WebGPU.
- Generacion codiciosa (greedy) verificada con tokens identicos a la build original.
- Soporte de tool calling: la model card menciona prompts con definicion de herramientas (541 tokens) como caso problematico en la version original, resuelto en esta build.
- No se documentan capacidades de vision, audio ni agentes multi-paso en la informacion disponible.

## Casos de uso
- Asistentes conversacionales en navegador sin backend: el modelo se ejecuta integramente en el cliente con Transformers.js y WebGPU, lo que elimina costes de servidor y mantiene las conversaciones en el dispositivo.
- Aplicaciones web progresivas y moviles en Safari iOS: la build esta optimizada para el limite de aproximadamente 2 GB por pestana, por lo que permite prompts largos y definiciones de herramientas que antes cerraban la pestana.
- Razonamiento local con modo thinking: util para tareas de analisis paso a paso en entornos sin conectividad o con requisitos de privacidad estrictos, al no enviar datos a ningun servidor.
- Prototipado rapido de funciones de IA en frontend: al integrarse con Transformers.js 4.3.2, se puede anadir generacion de texto a una web sin infraestructura de inferencia propia.
- Demos educativas y de investigacion: el repositorio permite estudiar el efecto de `num_logits_to_keep` en el coste de memoria y latencia de un grafo ONNX cuantizado.
- Procesamiento de texto multilingue en el cliente: cubre diez idiomas, incluido espanol, para tareas de resumen, reescritura o extraccion en aplicaciones web.
- Herramientas ligeras con function calling en navegador: la mejora de latencia (222 ms frente a 251 ms en el caso de prueba) hace viable invocar herramientas definidas por prompt en interfaces interactivas.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. La model card incluye mediciones comparativas entre la build original y esta:

| Metrica | Original q4f16 | Esta build |
|---|---|---|
| Logits para un prompt de 800 tokens | [1, 800, 65536], 209.715.200 bytes | [1, 1, 65536], 262.144 bytes |
| Diferencia maxima absoluta en logits de ultima posicion (5 prompts de 18 a 963 tokens) | referencia | <= 0,0078 (logits hasta +-16), mismo token top en todos los prompts |
| Diferencia maxima con todas las posiciones (`num_logits_to_keep = 0`) | referencia | 0 |
| Caches KV y de convolucion tras el prompt | referencia | identicas |
| 8 pasos de decodificacion greedy tras cada prompt | referencia | tokens y logits identicos |
| Prompt de herramienta de 541 tokens + 24 tokens nuevos, Transformers.js 4.3.2 en WebGPU (Node, Apple Silicon) | aprox. 251 ms | aprox. 222 ms |
| Prompt de 963 tokens, onnxruntime en CPU | 1.673 ms | 1.488 ms |

Las mediciones se realizaron con onnxruntime 1.31 en CPU salvo donde se indica.

## Requisitos de hardware
- VRAM estimada: no disponible de forma explicita; el repo pesa 1,6 GB y la build esta disenada para caber en el presupuesto de aproximadamente 2 GB por pestana de Safari en iPhone, incluyendo memoria de GPU.
- GPU recomendadas: cualquier GPU compatible con WebGPU; las pruebas se hicieron en Apple Silicon. No hay datos para A100, H100 ni RTX 4090.
- Cabe en GPU de consumo y en dispositivos moviles: el objetivo declarado es Safari en iPhone; tambien se ejecuta en CPU via onnxruntime.
- Opciones de despliegue: Transformers.js 4.3.2 o superior con `dtype: "q4f16"` y `device: "webgpu"`; onnxruntime directo pasando `num_logits_to_keep` como escalar int64 (`1` para generacion, `0` para todas las posiciones). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia: aproximadamente 222 ms para 541 tokens de prompt mas 24 tokens nuevos en WebGPU (Node, Apple Silicon); 1.488 ms para un prompt de 963 tokens en CPU. No se publica throughput agregado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| daveycodez/LFM2.5-1.2B-Thinking-Web-ONNX | 1.2B | no disponible | ONNX q4f16 | LFM Open License v1.0 (comercial bajo 10 M USD) | Build comunitaria optimizada para navegador |
| LiquidAI/LFM2.5-1.2B-Thinking-ONNX | 1.2B | no disponible | ONNX (incluye q4f16) | LFM Open License v1.0 | Version oficial; devuelve logits de todas las posiciones del prompt |
| LiquidAI/LFM2.5-1.2B-Thinking | 1.2B | no disponible | safetensors (presumiblemente) | LFM Open License v1.0 | Modelo base original |
| onnx-community/LFM3-1.7B-ONNX | 1.7B | no disponible | ONNX | no disponible | Ya incorpora la entrada `num_logits_to_keep`; sirvio de referencia para esta build |

## Limitaciones y advertencias
- Build no oficial: no esta creada, revisada ni respaldada por Liquid AI; para produccion conviene evaluar la version oficial.
- Solo incluye la variante q4f16; no hay otras cuantizaciones en el repositorio.
- La licencia LFM Open License v1.0 restringe el uso comercial a entidades con ingresos anuales inferiores a 10 millones de dolares; es imprescindible revisar el fichero LICENSE antes de desplegar.
- Riesgo de alucinacion inherente a los modelos de lenguaje de 1,2B; no se documentan evaluaciones de fidelidad.
- La ventana de contexto no se especifica en la informacion disponible, lo que impide planificar prompts largos con garantias.
- El limite de memoria por pestana en Safari (aproximadamente 2 GB) sigue siendo una restriccion de plataforma, aunque esta build lo mitiga.
- La diferencia numerica en los logits de la ultima posicion (hasta 0,0078) puede alterar resultados en decodificacion no greedy (muestreo, temperatura); las pruebas solo verificaron coincidencia en generacion greedy.
- No hay informacion sobre sesgos, composicion del dataset ni evaluaciones de seguridad del modelo base.

## Enlaces
- Repositorio HuggingFace: https://huggingface.co/daveycodez/LFM2.5-1.2B-Thinking-Web-ONNX
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Thinking
- Version ONNX oficial: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Thinking-ONNX
- Commit de referencia de la version oficial: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Thinking-ONNX/tree/e7fe61974e3a167dff77c5722db9a1cb7b57140f
- Modelo de referencia con `num_logits_to_keep`: https://huggingface.co/onnx-community/LFM3-1.7B-ONNX
- Transformers.js: https://github.com/huggingface/transformers.js
- Liquid AI: https://www.liquid.ai/
