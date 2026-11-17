# jtuyls/nano-chess-20m-2p6b-bpe-2k-pretrain

## Resumen

Nano Chess 20M es un modelo de lenguaje causal de dominio especifico entrenado para jugar y razonar sobre ajedrez, publicado por el desarrollador jtuyls en Hugging Face. Se trata de un checkpoint final de preentrenamiento (no ajustado por instrucciones) de una arquitectura Qwen3 en miniatura: 6 capas, tamano oculto 512, 4 cabezas de atencion y aproximadamente 21,5 millones de parametros con embeddings de entrada y salida atados. El sufijo "2p6b" del nombre hace referencia al presupuesto de tokens de preentrenamiento (2.641.541.000), no al numero de parametros, un detalle que conviene tener presente para evitar confusiones.

El modelo emplea un tokenizador BPE propio y autocontenido con un vocabulario de solo 2.000 tokens, disenado especificamente para la notacion ajedrecistica, en lugar de reutilizar los identificadores de token del modelo original. Su longitud de contexto es de 1.024 tokens y los pesos se almacenan en bfloat16. Es, por tanto, una pieza de investigacion orientada a estudiar el comportamiento de modelos pequenos en un dominio cerrado y altamente estructurado, no un asistente conversacional de proposito general.

Su relevancia actual radica en que permite reproducir y analizar experimentos de escalado a muy baja escala (20M de parametros, 2,6B de tokens) sobre un dominio con reglas verificables, lo que facilita medir memorizacion, calidad de la tokenizacion y capacidad de razonamiento simbolico con recursos minimos. El autor publica tambien un modelo hermano ajustado por instrucciones (SFT) a partir de este checkpoint.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal tipo Qwen3 (6 capas, hidden size 512, 4 cabezas de atencion) |
| Parametros totales | 21.479.424 (embeddings atados); 22.503.424 elementos de tensor almacenados en safetensors |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16) |
| Idiomas soportados | no disponible (modelo de dominio ajedrez) |
| Licencia | no disponible |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura de un transformer causal estilo Qwen3 a escala reducida: 6 capas, dimension oculta de 512 y 4 cabezas de atencion, con embeddings de entrada y salida atados, lo que reduce el recuento de parametros unicos hasta los 21.479.424. El checkpoint se guardo con Transformers 4.57.1 y su `config.json` declara `architectures: ["Qwen3ForCausalLM"]` por compatibilidad con la libreria, sin modificar el resto de valores de configuracion.

El preentrenamiento se realizo sobre un presupuesto configurado de 2.641.541.000 tokens, con un tokenizador BPE propio de vocabulario 2.000 construido para el dominio del ajedrez. El repositorio incluye los pesos originales, la configuracion de generacion y los ficheros del tokenizador, pero excluye estados del optimizador, registros de entrenamiento y manifiestos del corpus local. No se dispone de informacion publica sobre la composicion exacta del dataset, el uso de RLHF o DPO, ni innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto autoregresiva en el dominio del ajedrez (secuencias de movimientos y notacion asociada).
- Razonamiento simbolico sobre posiciones y continuaciones de partida, limitado por la escala del modelo.
- Manejo de tokens especiales propios: `<T>`, `<sep>`, `</T>`, `<call_env>`, `<bos>` y `<eos>`.
- Tokenizacion BPE autocontenida de vocabulario 2.000, optimizada para la notacion ajedrecistica.
- No es un modelo de chat de proposito general ni esta ajustado por instrucciones en esta version.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma nativa (existe el token `<call_env>`, pero la model card no documenta un protocolo de agente).
- Capacidades multilingues: no disponibles.
- Capacidades especiales (vision, audio, modo thinking): no disponibles.

## Casos de uso

- Investigacion sobre escalado en dominios cerrados: permite estudiar como un modelo de 20M de parametros aprende las regularidades del ajedrez tras 2,6B de tokens, con un coste de computo minimo y resultados reproducibles.
- Analisis de tokenizacion especifica de dominio: al usar un BPE propio de 2.000 tokens, sirve para comparar la eficiencia de codificacion de notacion ajedrecistica frente a tokenizadores generalistas.
- Generacion de continuaciones de partidas en entornos de test: util para validar pipelines de evaluacion de modelos pequenos sobre posiciones con solucion verificable.
- Base para ajuste fino supervisado: el autor publica un modelo SFT derivado, de modo que este checkpoint sirve como punto de partida documentado para experimentos de post-entrenamiento.
- Prototipado de motores de ajedrez neuronales ligeros: su tamano permite ejecutarlo en CPU o en GPUs de gama baja para pruebas de concepto de generacion de movimientos.
- Docencia y divulgacion: ejemplo compacto y reproducible de un pipeline completo (tokenizador propio, preentrenamiento y publicacion) para cursos de machine learning.
- Experimentos de memorizacion y contaminacion de datos: con un corpus de dominio acotado y un presupuesto de tokens conocido, facilita medir hasta que punto el modelo reproduce secuencias vistas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en bfloat16 (unos 45 MB para los pesos de 22,5M de elementos, mas overhead de activaciones y cache KV para 1.024 tokens).
- GPU recomendadas: cualquier GPU moderna es suficiente; el modelo cabe holgadamente en tarjetas consumer como RTX 3060, RTX 4060 o superiores, e incluso en iGPU.
- Cabe en GPU consumer: si, sin restricciones practicas de memoria.
- Opciones de despliegue: `transformers` (version con soporte Qwen3, el checkpoint se guardo con 4.57.1), `text-generation-inference` (etiqueta declarada en el repo) y, previsiblemente, `llama.cpp` u Ollama si se convierte a GGUF, aunque no se documenta dicha conversion.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nano Chess 20M (este modelo) | 21,5M | 1.024 | Ajedrez | no disponible | Hugging Face |
| Nano Chess 20M SFT (modelo hermano) | no disponible | no disponible | Ajedrez (instrucciones) | no disponible | Hugging Face |
| Alternativas comparables de 20M en ajedrez | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de terceros que permitan una comparacion cuantitativa fiable con otros modelos de la misma categoria.

## Limitaciones y advertencias

- Es un checkpoint de preentrenamiento, no un modelo ajustado por instrucciones: no debe esperarse comportamiento conversacional ni seguimiento de ordenes.
- Modelo de dominio especifico del ajedrez; su uso fuera de ese ambito carece de garantias de calidad.
- Longitud de contexto muy limitada (1.024 tokens), insuficiente para partidas completas o documentos largos.
- Escala muy reducida (21,5M de parametros), lo que limita la profundidad de razonamiento y aumenta el riesgo de errores en posiciones complejas.
- Riesgo de alucinacion y de generar movimientos ilegales; se recomienda validacion con un motor de reglas externo.
- Sesgos conocidos: no documentados en la informacion disponible.
- Licencia no especificada: no se puede confirmar el uso comercial; conviene contactar con el autor antes de cualquier despliegue en produccion.
- El tokenizador debe ser el BPE incluido en el repositorio; usar los identificadores de token del modelo LAN original produciria resultados incorrectos.
- El recuento de parametros almacenados en safetensors (22.503.424) difiere del recuento unico (21.479.424) porque se guarda tambien el tensor de la cabeza de salida atada.
- No se publican estados del optimizador ni registros de entrenamiento, lo que limita la reproducibilidad exacta del preentrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jtuyls/nano-chess-20m-2p6b-bpe-2k-pretrain
- Modelo hermano SFT: https://huggingface.co/jtuyls/nano-chess-20m-2p6b-bpe-2k-sft
- Perfil del autor: https://huggingface.co/jtuyls
