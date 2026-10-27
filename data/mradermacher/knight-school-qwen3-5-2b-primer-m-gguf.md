# mradermacher/knight-school-qwen3.5-2b-primer-m-GGUF

## Resumen

`mradermacher/knight-school-qwen3.5-2b-primer-m-GGUF` es la versión cuantizada en formato GGUF de `nikext/knight-school-qwen3.5-2b-primer-m`, un ajuste fino de 1.881.825.088 parámetros (≈1,88B) construido sobre Qwen3.5-2B de Alibaba Cloud y especializado en ajedrez: resolución de puzzles tácticos, notación algebraica y razonamiento sobre secuencias de jugadas. El autor del modelo base lo ha entrenado con una combinación de SFT y GRPO (Group Relative Policy Optimization) sobre el dataset `nikext/knight-school-chess-puzzles`, derivado de puzzles de Lichess, con Stockfish presente en el pipeline de datos o evaluación según las etiquetas del repositorio.

La aportación de mradermacher es puramente de empaquetado: genera cuantizaciones estáticas (Q2_K a f16, además de f16 y Q8_0 para el proyector multimodal) que reducen el peso desde 3,9 GB en f16 hasta 1,1 GB en Q2_K, lo que permite ejecutar el modelo en CPU, en GPUs de gama de entrada y en dispositivos móviles mediante llama.cpp u Ollama.

Es relevante ahora por dos motivos: primero, porque demuestra un patrón habitual en el ecosistema abierto, en el que un modelo de nicho entrenado con RL se distribuye en cuantizaciones listas para producción el mismo día de su publicación; segundo, porque un modelo de 1,88B especializado en un dominio con reglas verificables es un banco de pruebas barato para técnicas de RL y para pipelines de agentes que necesitan validación determinista de sus salidas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3.5-2B; no se detalla en la model card) |
| Parametros totales | 1.881.825.088 (≈1,88B) |
| Parametros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | No disponible en la model card; una fuente de terceros atribuye 4.096 tokens al Qwen3.5-2B base (sin confirmar) |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K; proyector multimodal en mmproj-f16 y mmproj-Q8_0 |
| Idiomas soportados | Inglés (etiqueta `language: en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base se distribuye en safetensors |
| Tamaño del repositorio | 19,1 GB (todas las cuantizaciones juntas) |
| Pipeline declarado | reinforcement-learning |
| Etiquetas | chess, chess-puzzles, grpo, sft, lichess, stockfish, conversational |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 2026-10-27 |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna más allá de su procedencia: es un fine-tune del Qwen3.5-2B, un modelo denso de la familia Qwen3.5 orientada a inferencia on-device, con mejoras en razonamiento y seguimiento de instrucciones respecto a Qwen3 según la documentación pública del modelo base. El repositorio incluye ficheros `mmproj` (proyector multimodal), lo que sugiere que el checkpoint base conserva un componente visual, aunque la model card de este ajuste no documenta capacidades de visión ni cómo se ha tratado ese proyector durante el entrenamiento.

El entrenamiento combina SFT con GRPO, un algoritmo de RL sin modelo crítico que normaliza las recompensas dentro de un grupo de muestras para la misma consulta. Los datos provienen del dataset `nikext/knight-school-chess-puzzles`, con etiquetas que apuntan a Lichess como origen de los puzzles y a Stockfish como referencia de evaluación o generación de recompensas. No se especifican el número de tokens de entrenamiento, la composición exacta del dataset, la mezcla de datos generales para evitar olvido catastrófico, ni los hiperparámetros del RL. El sufijo `primer-m` del nombre no está explicado en la documentación disponible.

## Capacidades

- Resolución de puzzles de ajedrez: identificación de la jugada o secuencia ganadora a partir de una posición en notación algebraica o FEN.
- Razonamiento multi-paso sobre secuencias de jugadas, apoyado en el entrenamiento con GRPO sobre recompensas verificables.
- Generación de texto conversacional en inglés, con formato de chat (`conversational` en las etiquetas del repositorio).
- Conocimiento del dominio ajedrecístico: terminología táctica, motivos (horquilla, clavada, descubierta), valoración relativa de piezas.
- Seguimiento de instrucciones heredado del Qwen3.5-2B base, según la documentación pública de la familia.
- Soporte de tool calling / function calling: no documentado en la model card de este ajuste.
- Soporte de agentes y multi-step reasoning: no documentado explícitamente; el entrenamiento con GRPO es multi-paso por naturaleza, pero no hay especificación de formato de agente.
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma; no se declaran otros idiomas.
- Capacidades especiales (modo thinking, visión, audio): no documentadas. La presencia de ficheros `mmproj` en el repositorio es el único indicio de un componente multimodal, sin confirmación de comportamiento.

## Casos de uso

- **Entrenador táctico para clubes y academias**: el modelo recibe una posición y devuelve la jugada correcta con una explicación breve del motivo táctico. Su tamaño (1,4 GB en Q4_K_M) permite desplegarlo en el portátil del entrenador o en una Raspberry Pi sin conexión.
- **Pre-filtro en aplicaciones de análisis**: integrar el modelo como primera pasada que propone 2-3 candidatos por posición y reservar Stockfish a profundidades altas solo para esos candidatos, reduciendo el coste computacional en apps móviles.
- **Anotación automática de partidas de Lichess**: dado un PGN, generar comentarios en inglés sobre los errores tácticos y los momentos críticos, usando la ventana de contexto para mantener la coherencia del relato de la partida.
- **Generación de datasets sintéticos de puzzles**: producir posiciones candidatas y soluciones que después se validan con un motor determinista, ampliando el corpus de entrenamiento para modelos mayores.
- **Sparring y evaluación de agentes RL**: servir como oponente o evaluador barato en bucles de entrenamiento de agentes de ajedrez, donde se necesita un contrincante con calidad no trivial y latencia baja.
- **Validación en pipelines de agentes con reglas verificables**: combinado con una librería de legalidad (python-chess, chess.js), el modelo actúa como generador de propuestas de jugadas mientras la librería rechaza las ilegales; es un patrón reutilizable para cualquier dominio con restricciones duras.
- **Demostración docente de RL aplicado**: caso de estudio reproducible de cómo SFT + GRPO sobre recompensas verificables especializa un modelo de 1,88B en una tarea concreta, ejecutable en hardware de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay cifras de precisión en puzzles, tasa de jugadas legales, MMLU, HumanEval ni GSM8K, ni comparaciones del autor con el modelo base. Tampoco se documentan métricas de latencia o throughput.

## Requisitos de hardware

| Cuantización | Tamaño en disco | VRAM estimada para inferencia | Notas |
|---|---|---|---|
| Q2_K | 1,1 GB | ~1,5 GB | Pérdida de calidad apreciable |
| Q4_K_S / Q4_K_M | 1,3 / 1,4 GB | ~2 GB | Recomendadas por el cuantizador para uso general |
| Q5_K_M | 1,5 GB | ~2,1 GB | Compromiso calidad/tamaño |
| Q6_K | 1,7 GB | ~2,3 GB | Calidad muy buena |
| Q8_0 | 2,1 GB | ~2,7 GB | Prácticamente sin pérdida |
| f16 | 3,9 GB | ~4,5 GB | 16 bits por peso; innecesario en la práctica |

Las cifras de VRAM son estimaciones a partir del tamaño del fichero más el coste del KV cache; no hay mediciones publicadas por el autor.

- **Cabe en GPU de consumo**: sí, en cualquier GPU con 4 GB o más de VRAM (RTX 3050, RTX 3060, RTX 4060, GTX 1660 Super, RTX 4090) y en Apple Silicon con Metal.
- **GPU de datacenter**: A100, H100 y L40S son sobredimensionadas para 1,88B; solo tienen sentido para servir muchas réplicas concurrentes.
- **CPU**: viable en solitario con llama.cpp; 1,4 GB en Q4_K_M entra en la caché de un portátil moderno y permite decenas de tokens por segundo.
- **Opciones de despliegue**: llama.cpp, Ollama, LM Studio, koboldcpp y llamafile para el fichero GGUF; vLLM con soporte GGUF (experimental) o TGI si se convierten los pesos originales del modelo base. Para el proyector multimodal se necesita un runtime que soporte `mmproj` en llama.cpp.
- **Latencia y throughput**: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Distribución |
|---|---|---|---|---|---|
| knight-school-qwen3.5-2b-primer-m (esta ficha) | 1,88B | No disponible | Apache-2.0 | Ajedrez y puzzles, SFT + GRPO | GGUF en este repo; safetensors en el base |
| Qwen3.5-2B (modelo base) | ≈2B | 4.096 tokens según fuente de terceros, sin confirmar | Apache-2.0 | Generalista, multilingüe, orientado a on-device | safetensors y GGUF (`mradermacher/Qwen3.5-2B-GGUF`) |
| Llama 3.2 3B Instruct | 3,21B | 128.000 tokens | Llama 3.2 Community License (restricciones para >700M usuarios activos) | Generalista multilingüe | safetensors, GGUF |
| Gemma 3 4B | ≈4B | 128.000 tokens | Gemma Terms of Use | Generalista multimodal | safetensors, GGUF |

No se han identificado en la información disponible alternativas especializadas en ajedrez con pesos abiertos y datos verificables. Las diferencias de contexto entre esta ficha y los modelos generalistas de la tabla son determinantes: la ventana de 128k de Llama 3.2 3B y Gemma 3 4B no tiene equivalente confirmado aquí, y no se dispone de benchmarks que permitan comparar calidad en puzzles.

## Limitaciones y advertencias

- **Riesgo de jugadas ilegales**: un modelo de lenguaje sin validador externo puede proponer movimientos imposibles. En producción hay que verificar la legalidad con python-chess o chess.js antes de mostrar la salida.
- **Alcance estrecho**: el ajuste está orientado a ajedrez. No se documenta ninguna mezcla de datos generales, por lo que es esperable (aunque no verificado) cierto deterioro en tareas generales respecto al Qwen3.5-2B base; conviene medirlo antes de reutilizarlo fuera del dominio.
- **Idioma**: solo inglés declarado. No hay evidencia de calidad en castellano; si se necesita, habría que evaluar y probablemente reentrenar.
- **Sesgos**: no documentados. Los puzzles de Lichess sobrerrepresentan posiciones tácticas de partidas de aficionados y no cubren finales teóricos ni aperturas de forma sistemática.
- **Alucinación**: el modelo puede inventar variantes plausibles pero incorrectas, especialmente en posiciones con muchas piezas o en finales con largas secuencias forzadas.
- **Contexto**: no confirmado. Si la ventana es de 4.096 tokens, no permite analizar partidas completas en una sola pasada; habría que trocear el PGN.
- **Cuantización**: Q2_K y Q3_K_S degradan la calidad de forma notable en tareas de razonamiento preciso; para ajedrez conviene Q4_K_M o superior.
- **Validación comunitaria nula**: 0 descargas y 0 likes en el momento del registro. Sin retroalimentación de terceros, los fallos documentados son inexistentes.
- **Licencia**: Apache-2.0 permite uso comercial, pero conviene verificar la licencia del modelo base (`nikext/knight-school-qwen3.5-2b-primer-m`) y del dataset de puzzles, ya que las condiciones de Lichess sobre los datos derivados pueden imponer atribución.
- **Procedencia de los pesos**: el repositorio solo contiene GGUF generados por un tercero; no hay garantía de reproducibilidad del proceso de cuantización más allá de las etiquetas internas de la herramienta.

## Enlaces

- HuggingFace (esta cuantización): https://huggingface.co/mradermacher/knight-school-qwen3.5-2b-primer-m-GGUF
- Modelo base: https://huggingface.co/nikext/knight-school-qwen3.5-2b-primer-m
- Dataset de puzzles: https://huggingface.co/datasets/nikext/knight-school-chess-puzzles
- Página de descargas del cuantizador para este modelo: https://hf.tst.eu/model#knight-school-qwen3.5-2b-primer-m-GGUF
- Cuantizaciones GGUF del Qwen3.5-2B base: https://huggingface.co/mradermacher/Qwen3.5-2B-GGUF
- Ficha de Qwen3.5-2B en Qualcomm AI Hub: https://aihub.qualcomm.com/models/qwen3_5_2b
- Listado de modelos de mradermacher: https://huggingface.co/mradermacher/models
- Solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- README de referencia sobre uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Comparativa de calidad entre tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Ficha de terceros con métricas del Qwen3.5-2B GGUF: https://free2aitools.com/model/mradermacher/qwen3.5-2b-gguf
