# curia007/pick3_llm_model

## Resumen
El modelo `curia007/pick3_llm_model` es un transformer causal autoregresivo de tamano muy reducido (163.072 parametros segun los pesos en safetensors, aunque la model card declara aproximadamente 147,5k) entrenado por el usuario curia007 sobre secuencias historicas de sorteos de la loteria Idaho Pick 3. No es un modelo de proposito general: su vocabulario de 17 tokens esta disenado especificamente para representar digitos, separadores y marcas de turno (dia/noche) del juego, por lo que su utilidad queda acotada a la generacion y manipulacion de secuencias de sorteos.

La arquitectura es un decoder transformer clasico con 3 capas, 4 cabezas de atencion, dimension de embedding de 64 y longitud maxima de secuencia de 128 tokens. Se ha entrenado y exportado principalmente para Apple MLX, con pesos tambien en safetensors, y se distribuye bajo licencia MIT. Su relevancia practica es limitada fuera del ambito del proyecto: sirve como ejemplo de modelado de series temporales discretas con un transformer minimo y como caso de estudio de sobreajuste a dominios muy cerrados.

El modelo no debe confundirse con un LLM de texto general: aunque la pipeline declarada es `text-generation` y los tags incluyen `conversational`, su vocabulario y entrenamiento no permiten conversacion libre ni comprension de lenguaje natural.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder causal autoregresivo |
| Parametros totales | 163.072 (safetensors); ~147,5k segun model card |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles, segun metadatos) |
| Licencia | MIT |
| Formato de pesos | safetensors, MLX |
| Dimension de embedding | 64 |
| Cabezas de atencion | 4 |
| Capas | 3 |
| Tamano de vocabulario | 17 |

## Arquitectura y entrenamiento
El modelo es un decoder transformer causal con 3 capas, 4 cabezas de atencion y dimension de embedding de 64, con una longitud maxima de secuencia de 128 tokens. El vocabulario de 17 tokens incluye los digitos 0-9 y los tokens especiales `<PAD>`, `<BOS>`, `<EOS>`, `<DAY>`, `<NIGHT>`, `<SEP>` y `<PRED>`, lo que refleja que la entrada se estructura como secuencias de sorteos con marcas de turno y separadores. El entrenamiento se realizo sobre secuencias historicas de sorteos de Idaho Pick 3, usando Apple MLX y PyTorch.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni sobre si se aplicaron tecnicas de RLHF, DPO o ajuste por instrucciones. La model card no documenta innovaciones tecnicas como decodificacion especulativa, atencion lineal o mecanismos hibridos; se trata de un transformer denso convencional a escala minima.

## Capacidades
- Generacion de secuencias de digitos asociadas a sorteos de Idaho Pick 3, con marcadores de dia/noche y separadores.
- Modelado autoregresivo de series temporales discretas de baja cardinalidad.
- Generacion de texto limitada al vocabulario de 17 tokens; no soporta lenguaje natural general.
- No dispone de soporte documentado de tool calling ni function calling.
- No dispone de soporte documentado de agentes ni razonamiento multi-paso.
- Capacidades multilingues: no disponibles; solo se declara ingles en metadatos, aunque el contenido real es numerico.
- No dispone de modo thinking, vision ni audio.
- Inferencia optimizada para Apple Silicon mediante MLX; tambien cargable con PyTorch/Transformers.

## Casos de uso
- Analisis exploratorio de series de sorteos: el modelo puede generar continuaciones de secuencias historicas de Idaho Pick 3 para estudiar patrones estadisticos, aunque sin valor predictivo demostrado.
- Docencia y prototipado de transformers minimos: sirve como ejemplo didactico de un decoder causal con vocabulario reducido y pocas capas, util para explicar tokenizacion, atencion y generacion autoregresiva.
- Pruebas de pipelines MLX en Apple Silicon: al ser un modelo de 163k parametros, permite validar flujos de carga, inferencia y exportacion en macOS sin requisitos de hardware.
- Generacion de datos sinteticos de secuencias de loteria: util para aumentar datasets de prueba en herramientas de analisis de sorteos, siempre con caracter sintetico y no predictivo.
- Benchmarking de herramientas de inferencia: su tamano minimo permite medir overhead de frameworks (MLX, Transformers) sin que el coste computacional del modelo domine la medicion.
- Integracion en demos de interfaces conversacionales sobre dominios cerrados: puede ilustrar como un modelo de vocabulario restringido se conecta a una UI, aunque la conversacion real requeriria un LLM de proposito general.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente `N/A` en validation cross-entropy loss, token accuracy y exact draw match rate.

## Requisitos de hardware
- VRAM estimada para inferencia: inferior a 1 GB; los pesos ocupan practicamente 0 GB (repo de 0.0 GB), por lo que cabe en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: no se requieren; cualquier GPU moderna (RTX 3060 o superior) es sobredimensionada. El entorno objetivo es Apple Silicon mediante MLX.
- Cabe en GPU consumer: si, en cualquier modelo, e incluso en CPU y en dispositivos con poca memoria.
- Opciones de despliegue: MLX (libreria nativa del modelo), PyTorch/Transformers mediante `Pick3ForCausalLM`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles; por el tamano del modelo, la latencia sera dominada por el overhead del framework mas que por el calculo.

## Comparativa con modelos similares
No disponible. No se han identificado en la informacion proporcionada modelos comparables de la misma categoria (transformers minimos entrenados sobre secuencias de loteria). Como referencia de escala, un GPT-2 small tiene 124 millones de parametros, aproximadamente tres ordenes de magnitud mas que este modelo.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| curia007/pick3_llm_model | 163.072 | 128 | MIT | Hugging Face |
| GPT-2 small (referencia de escala) | 124 M | 1024 | MIT | Hugging Face |
| Alternativas de la misma tarea | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias
- El modelo no predice sorteos de loteria de forma fiable; la propia model card deja las metricas de exactitud como `N/A`, y los sorteos son procesos aleatorios por diseno.
- Riesgo elevado de sobreajuste al conjunto historico de Idaho Pick 3; no hay evidencia de generalizacion a otras loterias ni a otros periodos.
- Vocabulario de 17 tokens: no comprende lenguaje natural ni puede mantener conversaciones, pese a los tags `conversational` y `text-generation`.
- Contexto maximo de 128 tokens, insuficiente para cualquier tarea de contexto largo.
- Sesgos conocidos: no documentados, pero el entrenamiento sobre una unica loteria regional limita cualquier extrapolacion.
- Restricciones de licencia: MIT permite uso comercial, pero el uso del modelo para promocionar apuestas o predecir sorteos puede entrar en conflicto con normativas de juego en distintas jurisdicciones.
- La discrepancia entre los parametros declarados en la model card (~147,5k) y los reales en safetensors (163.072) sugiere falta de rigor en la documentacion; conviene verificar los pesos antes de usarlos en produccion.
- El codigo de ejemplo de la model card importa modulos (`idaho.pick3.pick3_llm_ticket_model`) que no forman parte del repo de Hugging Face, por lo que la carga directa puede fallar sin el paquete correspondiente.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/curia007/pick3_llm_model
- Apple MLX: https://github.com/ml-explore/mlx
- PyTorch: https://pytorch.org
- Hugging Face Transformers: https://huggingface.co/docs/transformers
