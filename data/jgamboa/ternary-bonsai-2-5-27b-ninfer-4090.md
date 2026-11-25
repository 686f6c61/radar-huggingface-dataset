# jgamboa/Ternary-Bonsai-2.5-27B-NInfer-4090

## Resumen

Ternary Bonsai 2.5 27B NInfer 4090 es un artefacto de inferencia empaquetado en formato `.ninfer` a partir del modelo Ternary Bonsai 2.5 27B de Prism ML, un transformer de 27.000 millones de parametros con pesos ternarios (PTQ1_0, 1,76 bits por peso en base rotada de Hadamard) construido sobre Qwen3.8-27B de Alibaba Cloud. El artefacto lo publica el usuario jgamboa y combina en un unico fichero autocontenido el modelo de texto, la torre de vision (`mmproj` en BF16) y la cabeza MTP (*multi-token prediction*) propia de Prism para decodificacion especulativa.

La relevancia de esta publicacion es de ingenieria de despliegue, no de modelado: demuestra que un modelo multimodal de 27B cuantizado a pesos ternarios puede ejecutarse a velocidades de decodificacion superiores a 280 tok/s en una unica GPU de consumo (RTX 4090, `sm_89`) con un peso de fichero de 6,4 GiB. Esto rebaja el umbral de hardware para servir un modelo de esa escala con vision y contexto largo (hasta 260K tokens en las pruebas de aguja reportadas).

El artefacto **no es portable**: solo carga con la build NInfer del repositorio JGamboa/ninfer-4090-windows (rama `main`), sobre RTX 4090 en Windows o Linux, y no funciona en llama.cpp, vLLM ni Transformers. Es, por tanto, un binario de despliegue especifico de hardware y runtime, no un checkpoint reutilizable de forma general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (base Qwen3.8-27B) con torre de vision y cabeza MTP para decodificacion especulativa; pesos ternarios en base rotada de Hadamard |
| Parametros totales | 27B (aproximado por nombre; el autor no desglosa el recuento exacto) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 65.536 tokens configurados en el ejemplo de servicio (`--max-context 65536`); probado con exito en pruebas de aguja a 64K y 260K tokens |
| Tipos de cuantizacion | Pesos ternarios `PTQ1_0` (1,76 bits/peso) almacenados como `t5_g128_fp16`; torre de vision BF16 cuantizada a formatos Vision oficiales; MTP en mezcla Q4/Q5 (Q4 para query/key y MLP gate/up, Q5 para el resto, Q8 para la proyeccion de entrada) |
| Idiomas soportados | no disponible (heredados de Qwen3.8-27B, sin listado explicito en la informacion) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.ninfer` (fichero unico de 6.869.420.800 bytes, 6,4 GiB), con fichero auxiliar `.conversion.json` |

## Arquitectura y entrenamiento

El modelo subyacente es Ternary Bonsai 2.5 27B de Prism ML, una cuantizacion ternaria post-entrenamiento (PTQ) de Qwen3.8-27B de Alibaba Cloud. Los pesos se almacenan como palabras ternarias en una base rotada mediante transformada de Hadamard, lo que reduce el coste por peso a 1,76 bits manteniendo el grafo de un transformer denso convencional. Sobre ese tronco se anaden dos componentes: una torre de vision (`mmproj` en BF16) que habilita la entrada de imagenes, y una cabeza MTP (*multi-token prediction*) propia de Prism, incluida en el GGUF `-mtp` y almacenada aqui en mezcla Q4/Q5, que actua como modelo borrador para decodificacion especulativa.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO; esos datos corresponden a Qwen3.8-27B y no se detallan en la informacion proporcionada. La innovacion tecnica destacable de este artefacto es la integracion de tres mecanismos de aceleracion en un solo fichero: decodificacion especulativa con MTP (3 tokens borrador), una estrategia de *shortlist* sobre la cabeza LM (`--lm-head-draft`, 131.072 filas indexadas) y un modo `--ngram chain`. El autor indica que la cabeza MTP no se reentreno en esta conversion: se usa la de Prism, no la de Bonsai 2.

## Capacidades

- Generacion de texto y razonamiento en un modelo denso de 27B con pesos ternarios, con modo *thinking* conmutable (desactivado en las mediciones reportadas).
- Procesamiento de imagen y texto (`image-text-to-text`): la torre de vision va incluida en el mismo fichero `.ninfer`.
- Codificacion agéntica y *tool calling*: Prism ML declara mejoras sustanciales en codificacion agéntica y uso de herramientas para Bonsai 2.5, aunque el autor de este artefacto no reprodujo esas cifras.
- Razonamiento multi-paso y soporte de agentes mediante llamadas a herramientas, segun la model card del modelo base.
- Contexto largo: recuperacion exacta en pruebas de aguja a 64K y 260K tokens.
- Decodificacion especulativa integrada (MTP + n-gram + shortlist de LM head), con aceptacion media de borradores del 60,3 %.
- Capacidades multilingues: no disponibles de forma explicita en la informacion proporcionada.

## Casos de uso

- **Servicio local de asistente multimodal en estacion de trabajo**: con 6,4 GiB de fichero y una RTX 4090, se puede levantar un endpoint OpenAI-compatible (`ninfer-serve.exe`) que acepte imagen y texto, adecuado para prototipado interno sin coste de API.
- **Analisis de documentos largos con recuperacion exacta**: los 65.536 tokens de contexto configurados y la recuperacion exacta verificada a 64K y 260K permiten resumir contratos, informes o expedientes completos en una sola pasada, sin troceado.
- **Codificacion agéntica en local**: el soporte de *tool calling* y el modo de razonamiento multi-paso permiten integrar el modelo en un bucle de agente que edite ficheros y ejecute comandos en un entorno de desarrollo aislado, con la ventaja de que los datos no salen de la maquina.
- **Generacion de codigo en pipelines de CI/CD**: con 287 tok/s de decodificacion media, es viable generar parches, tests o documentacion en tareas por lotes dentro de un runner con GPU, aunque el artefacto solo corra en la build NInfer y limite la portabilidad del pipeline.
- **Transcripcion y descripcion de capturas o diagramas**: la torre de vision integrada permite describir diagramas de arquitectura, capturas de error o tablas escaneadas y convertirlas a texto estructurado.
- **Evaluacion comparativa de cuantizacion ternaria**: util como banco de pruebas para medir la perdida de calidad de PTQ1_0 frente al modelo en BF16 en tareas de razonamiento y codigo, dado que el autor publica el conjunto `tools.eval` de 45 tareas.
- **Prototipado de decodificacion especulativa**: el artefacto expone los parametros `--spec mtp`, `--draft-tokens`, `--lm-head-draft` y `--ngram chain`, lo que permite experimentar con la aceptacion de borradores y el rendimiento por round sin reentrenar nada.

## Benchmarks y rendimiento

Mediciones del autor en RTX 4090, Windows 11, CUDA 13.4, KV `rk4v4-e8`, MTP 3 + `--ngram chain`, `--lm-head-draft`, greedy, thinking off, ocho prompts, una ejecucion por prompt y alternadas:

| Metrica | Bonsai 2 reentrenado | Bonsai 2.5 (este fichero) |
|---|---:|---:|
| Decodificacion media | 271,4 tok/s | 287,3 tok/s |
| Tokens medios por round | 2,87 | 3,03 |
| Aceptacion media de borradores | 55,1 % | 60,3 % |

| Medicion adicional | Resultado |
|---|---:|
| Prefill con prompt de 64K tokens (prueba de aguja) | 4,48k tok/s |
| Prefill con prompt de 260K tokens (prueba de aguja) | 2,49k tok/s |
| Respuesta de aguja a 64K y 260K (`ORCHID=493817; COLOR=COBALT`) | exacta |
| Suite `tools.eval`, 45 tareas, thinking off | 44/45 (Bonsai 2 reentrenado: 43/45) |

El autor advierte que la suite de tareas esta cerca de la saturacion (ambos modelos superan el 95 %) y no ejercita el trabajo de codificacion agéntica que persigue la version 2.5, por lo que el resultado indica ausencia de regresion, no mejora. Las cifras de mejora en codificacion agéntica y *tool calling* que cita Prism ML en su model card no fueron reproducidas por el autor de este artefacto y no se incluyen aqui. Bonsai 2.5 genera aproximadamente un 25 % mas de tokens en esa suite (media 153 frente a 122).

## Requisitos de hardware

- **VRAM estimada**: el fichero pesa 6,4 GiB; con KV cache en `rk4v4-e8`, capacidad de 65.536 tokens y concurrencia 3, el consumo real no esta medido para este fichero (el autor remite a las mediciones de Bonsai 2, que comparte arquitectura y 5,9 GB de pesos). Como referencia de orden de magnitud, cabe holgadamente en los 24 GB de una RTX 4090.
- **GPU soportada**: exclusivamente NVIDIA RTX 4090 (`sm_89`). El autor no garantiza funcionamiento en otras GPU.
- **Cabe en GPU de consumo**: si, en RTX 4090; no hay datos para otras consumer GPU.
- **Sistema operativo**: Windows o Linux.
- **Runtime**: solo la build NInfer de JGamboa/ninfer-4090-windows (rama `main`). No carga en llama.cpp, vLLM ni Transformers.
- **Latencia y throughput**: 287,3 tok/s de decodificacion media y 4,48k tok/s de prefill a 64K tokens en las condiciones medidas.
- **Opciones de despliegue**: `ninfer-serve.exe` con endpoint HTTP local (`--host 127.0.0.1 --port 8080 --model-id bonsai-2.5-27b`); no hay soporte de otros servidores de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / runtime | Licencia | Notas |
|---|---|---:|---|---|---|
| Ternary Bonsai 2.5 27B (este artefacto) | 27B denso, ternario PTQ1_0 | 65.536 configurados; probado a 260K | `.ninfer`, solo NInfer en RTX 4090 | Apache 2.0 | 287,3 tok/s; vision + MTP integrados |
| Ternary Bonsai 2 27B NInfer 4090 | 27B denso, ternario | mismo esquema | `.ninfer`, mismo runtime | Apache 2.0 | 271,4 tok/s; cabeza MTP reentrenada; 43/45 en `tools.eval` |
| Ternary Bonsai 2.5 27B GGUF (Prism ML) | 27B denso, ternario | no disponible | GGUF (`PTQ1_0`, `mmproj` BF16, `-mtp`) | Apache 2.0 | Fuente de esta conversion; portable a runtimes GGUF |
| Qwen3.8-27B (modelo original) | 27B denso | no disponible | safetensors / Transformers | Apache 2.0 | Modelo en precision completa del que deriva la cuantizacion ternaria |

La comparacion con modelos de otros fabricantes del mismo tamano no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- **Portabilidad nula**: el artefacto solo funciona con la build NInfer indicada y en RTX 4090; no es cargable en llama.cpp, vLLM ni Transformers, lo que descarta su uso en infraestructura cloud estandar.
- **Perdida de calidad por cuantizacion ternaria**: los pesos a 1,76 bits/peso implican degradacion respecto a Qwen3.8-27B en BF16; el autor no publica una comparacion directa contra el modelo sin cuantizar.
- **Benchmarks limitados**: la suite de tareas esta saturada (>95 % de acierto) y no mide codificacion agéntica ni *tool calling*, que son precisamente los objetivos declarados de la version 2.5.
- **Sesgos**: no documentados en la informacion proporcionada; se heredan los del modelo base Qwen3.8-27B.
- **Alucinacion**: riesgo estandar de un modelo de 27B cuantizado; no hay evaluacion de factualidad en la informacion disponible.
- **Idiomas**: no se detalla la cobertura linguistica del artefacto; las capacidades multilingues dependen del modelo base y no estan verificadas.
- **Memoria no medida para este fichero**: los limites de VRAM y concurrencia citados provienen de Bonsai 2, no de una medicion especifica de este artefacto.
- **Licencia**: Apache 2.0 permite uso comercial, pero se deben conservar `LICENSE` y `NOTICE.txt` de Prism ML, copiados sin modificar.
- **Repositorio sin traccion**: 0 descargas y 0 likes en el momento de la consulta; no hay validacion independiente de las cifras del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jgamboa/Ternary-Bonsai-2.5-27B-NInfer-4090
- Modelo base GGUF (Prism ML): https://huggingface.co/prism-ml/Ternary-Bonsai-2.5-27B-GGUF
- Artefacto precedente (Bonsai 2): https://huggingface.co/jgamboa/Ternary-Bonsai-2-27B-NInfer-4090
- Repositorio del runtime NInfer para RTX 4090: https://github.com/JGamboa/ninfer-4090-windows/tree/main
- Model card de Prism ML con las cifras de codificacion agéntica: https://huggingface.co/prism-ml/Ternary-Bonsai-2.5-27B-GGUF
