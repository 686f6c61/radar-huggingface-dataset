# AwakeningOS/ARO-BabyLM-1B-Cooldown

## Resumen

ARO-BabyLM-1B-Cooldown es un modelo de lenguaje causal de 116,6 millones de parametros desarrollado por AwakeningOS, entrenado desde cero sobre el corpus oficial BabyLM 2026 Strict. El modelo implementa una arquitectura propietaria denominada ARO (Asymmetric Relational Operator), disenada para explorar la eficiencia de datos en modelos compactos: fue entrenado con exactamente mil millones de palabras de exposicion, recorriendo diez veces un corpus unico de 100 millones de palabras. Su relevancia radica en que demuestra que es posible entrenar un modelo de lenguaje competitivo en una unica GPU de consumo (RTX 3090) con una arquitectura no convencional que combina atencion, memoria recurrente y modos relacionales aprendidos.

El modelo se publica como un checkpoint de continuacion ("cooldown") del verificado checkpoint ARO de 500M de palabras, con una programacion de tasa de aprendizaje decreciente y un curriculo de contexto conservador hasta completar exactamente 1B de palabras. Es un modelo base de generacion de texto, no ajustado para instrucciones, y su licencia Apache-2.0 permite uso comercial sin restricciones. La arquitectura esta documentada en un informe tecnico publicado en Zenodo, y el repositorio incluye material de auditoria completo con hashes SHA-256 de verificacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal ARO language model (atencion grouped-query + GatedDeltaNet recurrente + SwiGLU condicionado por relaciones) |
| Parametros totales | 116.876.691 (pesos safetensors); 116.647.315 segun model card |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | No disponible (solo se publica en bfloat16) |
| Idiomas soportados | Ingles (corpus detoxificado BabyLM 2026 Strict) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (exportacion Hugging Face) |

## Arquitectura y entrenamiento

ARO mantiene un unico estado "Presente" de ancho completo que evoluciona a traves de once bloques. Cada bloque combina: atencion grouped-query causal local/global, memoria recurrente GatedDeltaNet, informes enrutados desde profundidades anteriores, SwiGLU condicionado por doce modos de relacion aprendidos, relectura profunda del Presente sobre evidencia fija del pasado, una escritura de estado acotada y una ruta de caracteristicas adaptativa. Durante el entrenamiento se anaden predictores multi-horizonte "Future Cone" que modelan la representacion pero no exponen tokens futuros en inferencia, que es estrictamente causal.

El entrenamiento se realizo sobre el corpus BabyLM 2026 Strict (100M de palabras unicas, recorrido diez veces), con un tokenizador BPE a nivel de byte de 16.384 tokens entrenado solo sobre el corpus de entrenamiento. Se uso AdamW con semilla 1337, 11.550 pasos de optimizador y 1.513.881.600 tokens de subpalabras procesados. La fase de cooldown importo el checkpoint de 500M con su estado AdamW completo: de 500M a 800M palabras se mantuvo longitud de secuencia 256 con tasa de aprendizaje en decaimiento coseno desde 8,056641995e-4 hasta 1e-4; de 800M a 1B, longitud 512 y tasa decayendo hasta aproximadamente 1e-5. El entrenamiento completo se ejecuto en una unica NVIDIA RTX 3090.

## Capacidades

- Generacion de texto causal en ingles: el modelo produce continuaciones coherentes dado un prefijo, con una ventana de contexto de 1.024 tokens.
- Modelado de lenguaje de siguiente token: entrenado exclusivamente para prediccion de subpalabras, sin ajuste por instrucciones ni RLHF.
- Razonamiento basico de bajo nivel: al ser un modelo pequeno, muestra capacidades limitadas de razonamiento, pero puede mantener coherencia local en tareas de completado.
- Sin soporte de tool calling ni function calling: no se ha entrenado para ello y no se documenta ninguna capacidad de este tipo.
- Sin capacidades multimodales: no procesa vision, audio ni otros modos.
- Multilingue limitado: el corpus es exclusivamente ingles detoxificado; no se garantiza rendimiento en otros idiomas.
- Sin modo de pensamiento explicito: la arquitectura Future Cone es solo un auxiliar de entrenamiento, no un modo de inferencia.

## Casos de uso

- Investigacion academica en eficiencia de datos: el modelo es un banco de pruebas ideal para estudiar como arquitecturas alternativas (ARO frente a transformers densos) se comportan con presupuestos de datos extremadamente bajos (1B palabras). Los investigadores pueden reproducir el entrenamiento completo en una GPU de consumo.
- Educacion y formacion en IA: por su tamano reducido y licencia permisiva, es adecuado para cursos de procesamiento de lenguaje natural donde los estudiantes necesitan inspeccionar y modificar un modelo completo sin requerir infraestructura costosa.
- Prototipado rapido de aplicaciones de texto: para validar ideas de productos que requieren generacion de texto basica (autocompletado, resumenes cortos) sin necesidad de un modelo de gran escala, este checkpoint ofrece una alternativa ligera y desplegable en CPU.
- Experimentos de alineacion y ajuste fino: al ser un modelo base, puede servir como punto de partida para estudios de ajuste fino con tecnicas como LoRA o PEFT, explorando como se comporta la arquitectura ARO bajo diferentes regimenes de adaptacion.
- Evaluacion comparativa de arquitecturas: el repositorio incluye material de auditoria completo (hashes, contratos de ejecucion, registros), lo que permite usarlo como referencia verificable en estudios que comparan eficiencia de parametros y datos entre arquitecturas.
- Despliegue en entornos con recursos limitados: con 116M de parametros, el modelo cabe en dispositivos de borde o en funciones serverless, permitiendo generacion de texto local sin depender de APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que la evaluacion oficial BabyLM 2026 (zero-shot y Reading) esta siendo ejecutada de forma independiente y que no se reporta ninguna puntuacion final no verificada. El repositorio solo incluye hashes de integridad, no metricas de rendimiento.

## Requisitos de hardware

- VRAM estimada para inferencia: con 116M de parametros en bfloat16, los pesos ocupan aproximadamente 233 MB. Con overhead de activaciones y cache KV para 1.024 tokens de contexto, el consumo total de VRAM se situa por debajo de 1 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; una RTX 3090 (como la usada en entrenamiento) permite inferencia con margen amplio. Tambien es viable en GPU integradas o incluso en CPU con cuantizacion.
- Compatibilidad con GPU de consumo: si, el modelo cabe en cualquier GPU consumer moderna, incluidas las series GTX 16xx, RTX 20xx/30xx/40xx y equivalentes de AMD.
- Opciones de despliegue: al ser un modelo Transformers con codigo personalizado, se puede cargar con la libreria `transformers` usando `trust_remote_code=True`. Para entornos de produccion, se puede exportar a formato ONNX o convertir a GGUF para usar con llama.cpp u Ollama, aunque no se proporcionan conversiones oficiales.
- Latencia y throughput: no se han publicado mediciones oficiales. Dado el tamano del modelo, se espera una latencia de decenas de milisegundos por token en GPU moderna y de cientos de milisegundos en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ARO-BabyLM-1B-Cooldown | 116,6M | 1.024 | ARO (híbrida atencion + recurrente) | Apache-2.0 | Hugging Face |
| TinyLlama-1.1B | 1.100M | 2.048 | Transformer denso (Llama) | Apache-2.0 | Hugging Face |
| SmolLM-135M | 135M | 2.048 | Transformer denso | Apache-2.0 | Hugging Face |
| GPT-2 (124M) | 124M | 1.024 | Transformer denso | MIT | Hugging Face |

La comparativa es orientativa: ARO usa una arquitectura hibrida no estandar, mientras que las alternativas son transformers densos convencionales. En terminos de parametros, ARO es comparable a GPT-2 small y SmolLM-135M, pero su entrenamiento con solo 1B de palabras (frente a los 40B de GPT-2 o los 600B de TinyLlama) lo situa en un regimen de eficiencia de datos muy distinto. No se dispone de benchmarks comparativos publicados para ARO.

## Limitaciones y advertencias

- Modelo base sin ajuste por instrucciones: no responde a prompts conversacionales ni sigue instrucciones; solo genera continuaciones de texto.
- Riesgo de alucinacion: al ser un modelo pequeno entrenado con datos limitados, puede producir texto incoherente o factualmente incorrecto, especialmente en contextos largos.
- Sesgos del corpus: el entrenamiento se realizo sobre un corpus detoxificado en ingles, pero no se documentan evaluaciones de sesgo; el modelo puede reflejar sesgos presentes en los datos originales.
- Limitaciones de idioma: solo se garantiza rendimiento en ingles; otros idiomas no han sido evaluados.
- Codigo personalizado: el modelo requiere `trust_remote_code=True` en Transformers, lo que implica ejecutar codigo arbitrario del repositorio; se recomienda revisar el codigo fuente antes de usarlo en entornos de produccion.
- Contexto limitado: 1.024 tokens es una ventana corta para tareas que requieren dependencias de largo alcance.
- Sin garantias de rendimiento: la evaluacion oficial BabyLM 2026 aun no ha publicado resultados; el rendimiento real en benchmarks estandarizados es desconocido.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el codigo personalizado y la arquitectura propietaria pueden requerir atribucion adicional segun los terminos del informe tecnico.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/AwakeningOS/ARO-BabyLM-1B-Cooldown
- Perfil del autor en Hugging Face: https://huggingface.co/AwakeningOS
- Organizacion en GitHub: https://github.com/AwakeningOS/
- Informe tecnico (Zenodo): https://doi.org/10.5281/zenodo.22167627
