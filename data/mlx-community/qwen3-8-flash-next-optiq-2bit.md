# mlx-community/Qwen3.8-Flash-Next-OptiQ-2bit

## Resumen

Qwen3.8-Flash-Next-OptiQ-2bit es una cuantizacion extrema en 2 bits del modelo Qwen3.8-Flash-Next, publicada por el colectivo mlx-community y producida con la herramienta mlx-optiq. El modelo base, desarrollado por el equipo Qwen de Alibaba, es un transformer hibrido que combina Gated DeltaNet con Qwen Sparse Attention y anade una tabla de embeddings de n-gramas de 20 millones de entradas consultada en la capa 2. Cuenta con 125.000 millones de parametros en el transformer (6.000 millones activos por token) mas 51.000 millones en la tabla de n-gramas, y una ventana de contexto de 262.144 tokens.

La relevancia de esta publicacion es practica: demuestra que un modelo de 176.000 millones de parametros puede ejecutarse en Apple Silicon de consumo con un pico de memoria de aproximadamente 4,6 GB durante la generacion. Lo consigue manteniendo residentes la atencion, el router, el experto compartido y las hiperconexiones, mientras transmite desde el SSD los 512 expertos enrutados y la tabla de n-gramas fila a fila. El precio a pagar es una velocidad de decodificacion de unos 3,8 tokens por segundo en un M3 Max, limitada por el ancho de banda de lectura del disco.

No es un artefacto para produccion con requisitos de precision: es una cuantizacion con perdida sobre los expertos enrutados, pensada para experimentacion local y para validar que arquitecturas MoE de gran tamano caben en maquinas de 16 GB de RAM unificada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido: Gated DeltaNet + Qwen Sparse Attention (QSA), MoE con 512 expertos enrutados (10 activos + 1 compartido por token), 48 capas, mas embedding de n-gramas |
| Parametros totales | 177.392.830.611 (125 B en el transformer + 51 B en la tabla de n-gramas) |
| Parametros activos | 6 B por token en el transformer; 10 expertos enrutados + 1 compartido por capa |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | 2 bits en expertos enrutados; 4 bits en atencion, DeltaNet, experto compartido, embeddings, LM head y tabla de n-gramas; 8 bits en hiperconexiones; bf16 en el router y en la torre de vision |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (etiquetada como `other` en Hugging Face) |
| Formato de pesos | safetensors (libreria MLX) |

## Arquitectura y entrenamiento

El modelo base emplea una arquitectura hibrida que sustituye parte de la atencion clasica por Gated DeltaNet, un mecanismo de estado recurrente con compuertas, combinado con Qwen Sparse Attention. La capa MoE dispone de 512 expertos enrutados de los que se activan 10 por token, mas un experto compartido siempre activo, distribuidos en 48 capas. La innovacion mas singular es la tabla de n-gramas: 20 millones de entradas de bigramas y trigramas consultada en la capa 2, de la que cada token lee 16 filas. Esa estructura de acceso disperso es precisamente lo que hace viable la transmision desde SSD.

Sobre el entrenamiento del modelo base no se proporciona informacion en la documentacion disponible: no se detallan el numero de tokens, la composicion del corpus ni si hubo fases de RLHF o DPO. La cuantizacion, por su parte, es una mezcla de precisiones (mixed-precision) generada con mlx-optiq, con expertos enrutados a 2 bits y el resto de componentes a 4 y 8 bits. El cabezal de prediccion multi-token no se incluye en este artefacto.

## Capacidades

- Generacion de texto y codigo: la model card documenta la generacion de un juego completo de Flappy Bird en un unico archivo HTML (renderizado en canvas, fisica de gravedad, generacion de tuberias, puntuacion y pantalla de fin de partida con reinicio) en 2.310 tokens.
- Razonamiento y conversacion multi-turno, con 262.144 tokens de contexto.
- Soporte de tool calling: el servidor `optiq serve` expone un endpoint compatible con OpenAI y Anthropic con "tool-call healing".
- Prompt caching en el servidor de inferencia.
- Capacidades multimodales: la torre de vision se conserva en bf16, pero la entrada de imagen no se ha probado en esta cuantizacion; el autor recomienda tratarlo como modelo solo de texto.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Modo thinking o razonamiento extendido: no disponible en la informacion proporcionada.

## Casos de uso

- Experimentacion local en Apple Silicon: ejecutar un modelo de 176 B en un Mac de 16 GB de RAM unificada para evaluar arquitecturas MoE hibridas sin acceso a clústeres GPU. El streaming desde SSD hace posible lo que de otro modo requeriria cientos de GB de memoria.
- Generacion de prototipos de codigo: crear aplicaciones web pequenas y autocontenidas (como el juego HTML documentado) para validar ideas rapidamente, aceptando la latencia de minutos por respuesta.
- Pruebas de integracion de tool calling: usar el endpoint compatible con OpenAI y Anthropic de `optiq serve` para validar pipelines de agentes antes de migrar a pesos de mayor precision.
- Evaluacion de tecnicas de cuantizacion extrema: servir como referencia para investigar el impacto de 2 bits en expertos enrutados sobre la coherencia del modelo, comparando con el modelo base o cuantizaciones de 4 bits.
- Demostraciones educativas de arquitecturas hibridas: estudiar en la practica el comportamiento de Gated DeltaNet, Qwen Sparse Attention y la tabla de n-gramas en un entorno local.
- Procesamiento de documentos largos en local: aprovechar la ventana de 262.144 tokens para resumir o consultar corpus extensos en maquinas sin GPU dedicada, asumiendo un throughput bajo.
- No recomendado para atencion al cliente en produccion ni para tareas donde la exactitud sea critica, dado el caracter con perdida de la cuantizacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que no publica Capability Score para esta cuantizacion porque ejecutar la suite de seis benchmarks sobre un modelo que decodifica desde SSD llevaria dias. Los unicos datos de rendimiento disponibles son de velocidad y memoria:

| Metrica | Valor |
|---|---|
| Velocidad de decodificacion | ~3,8 tok/s en un M3 Max (limitada por SSD) |
| Memoria pico durante generacion | ~4,6 GB |
| Tamano en disco | 81 GB (frente a ~350 GB en bf16) |
| Tokens generados en el ejemplo de Flappy Bird | 2.310 en diez minutos |

## Requisitos de hardware

- Memoria: pico de ~4,6 GB de RAM durante la generacion; encaja en una maquina de 16 GB.
- Almacenamiento: 81 GB de pesos en disco; se recomienda un SSD rapido, ya que la velocidad de decodificacion depende directamente del throughput de lectura (cada token lee 10 expertos por capa y 16 filas de la tabla).
- GPU: no aplica; requiere Apple Silicon con memoria unificada. El ejemplo de referencia es un M3 Max.
- Cabe en GPU de consumo: no disponible para NVIDIA; el artefacto es exclusivo de MLX y Apple Silicon.
- Despliegue: `mlx-optiq>=0.5.14` mediante `optiq serve --model mlx-community/Qwen3.8-Flash-Next-OptiQ-2bit`. El streaming de expertos se activa automaticamente para cuantizaciones MoE que no caben en RAM; `--stream-experts` lo fuerza. No es compatible con mlx-lm estandar, vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: ~3,8 tok/s en M3 Max; el ejemplo de generacion de codigo tardo diez minutos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precision | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-OptiQ-2bit | 177 B (6 B activos) | 262.144 | 2-4 bits mixta | qwen-community-1.0 | MLX, Apple Silicon |
| Qwen/Qwen3.8-Flash-Next (base) | 177 B (6 B activos) | 262.144 | bf16 | qwen-community-1.0 | Pesos originales, ~350 GB |
| Otras cuantizaciones OptiQ del mismo base | 177 B (6 B activos) | 262.144 | mayor que 2 bits | qwen-community-1.0 | MLX, Apple Silicon |

No se dispone de datos de benchmarks que permitan comparar el rendimiento cualitativo frente a alternativas de otros fabricantes o tamanos. La comparacion relevante es interna a la familia: esta variante prioriza huella minima (81 GB en disco, 4,6 GB en RAM) a costa de precision y velocidad, mientras que los pesos originales en bf16 ofrecen la maxima fidelidad pero requieren ~350 GB.

## Limitaciones y advertencias

- Cuantizacion con perdida: 2 bits en los expertos enrutados degrada la precision; el propio autor recomienda usar los pesos originales o una cuantizacion de mayor numero de bits para tareas donde la exactitud importe.
- Riesgo de alucinacion: no se han publicado evaluaciones de fidelidad para esta cuantizacion, por lo que el nivel de alucinacion es desconocido y potencialmente superior al del modelo base.
- Entrada de imagen no probada: aunque la torre de vision se conserva en bf16, debe tratarse como modelo solo de texto.
- Cabezal de prediccion multi-token ausente, lo que puede afectar a la velocidad respecto al modelo base.
- Idiomas soportados no documentados; no se puede garantizar un rendimiento multilingue concreto.
- Licencia qwen-community-1.0: es necesario revisar el archivo LICENSE del repositorio antes de cualquier uso comercial; la informacion disponible no detalla las restricciones.
- Dependencia de hardware: exclusivo de Apple Silicon con MLX y mlx-optiq 0.5.14 o superior; no es desplegable en ecosistemas NVIDIA ni en servidores convencionales.
- Velocidad muy baja (~3,8 tok/s) y sensible al rendimiento del SSD; no apta para aplicaciones interactivas en tiempo real.
- No recomendada para produccion con requisitos de latencia o exactitud.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mlx-community/Qwen3.8-Flash-Next-OptiQ-2bit
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Proyecto mlx-optiq: https://mlx-optiq.com/
- Catalogo de cuantizaciones OptiQ: https://mlx-optiq.com/models
- Documentacion de mlx-optiq: https://mlx-optiq.com/docs/
- Paquete PyPI: https://pypi.org/project/mlx-optiq/
- Ejemplo incluido en el repositorio: `flappy_bird.html`
