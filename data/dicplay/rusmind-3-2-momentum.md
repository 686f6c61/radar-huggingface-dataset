# DICPlay/RusMind-3.2-Momentum

## Resumen

RusMind 3.2 Momentum es un modelo de lenguaje de tipo texto, desarrollado por DICPlay (Rusia), obtenido por ajuste fino supervisado de la base google/gemma-4-E2B-it. Está diseñado específicamente para ejecución en dispositivo (on-device) y sin conexión, con especial énfasis en el idioma ruso y en contenidos de historia, cultura, legislación y regiones de Rusia. Su tamaño total declarado en safetensors es de 4.647.450.147 parámetros, aunque la distribución oficial se ofrece en formato GGUF con cuantizaciones que reducen el peso a entre 2,5 y 5,0 GB.

El modelo se comercializa como la variante más ligera de la familia RusMind 3.2, pensada para teléfonos móviles y equipos de gama baja. La ficha del autor indica una ventana de contexto de 4096 tokens para los ficheros orientados a navegador y una licencia propia (RusMind License) que restringe el uso comercial y la redistribución de versiones modificadas.

Su relevancia actual radica en la combinación de un modelo base moderno (Gemma 4 E2B) con datos y ajustes orientados al mercado rusohablante, distribuido en GGUF para su uso con llama.cpp, LM Studio, Ollama, PocketPal y wllama en navegador. No se han publicado resultados de benchmarks en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de google/gemma-4-E2B-it; detalles internos no disponibles) |
| Parámetros totales | 4.647.450.147 (según safetensors) |
| Parámetros activos | no disponible |
| Longitud de contexto | 4096 tokens (indicado para los ficheros de navegador) |
| Tipos de cuantización | Q4_K_M (2,5 GB Lite con embeddings reducidos; 3,4 GB estándar), Q8_0 (5,0 GB), y particionado en 9 ficheros de hasta 1 GB para navegador |
| Idiomas soportados | Ruso (principal) e inglés |
| Licencia | RusMind License (DICPlay); modelo base Gemma 4 E2B bajo Apache 2.0 |
| Formato de pesos | GGUF (safetensors como referencia de parámetros) |

## Arquitectura y entrenamiento

El modelo parte de google/gemma-4-E2B-it, un transformer de la familia Gemma 4, y se ha sometido a un ajuste fino (finetune) con datos propios de DICPlay. La model card describe el entrenamiento sobre "un enorme conjunto de datos" y un posterior ajuste sobre conjuntos rusohablantes de DICPlay centrados en historia y cultura de Rusia, legislación de la Federación Rusa, regiones y pueblos del país, valores familiares tradicionales y acontecimientos clave, en ruso e inglés. No se especifican el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO.

La innovación principal declarada no es arquitectónica sino de despliegue: la distribución en GGUF con cuantización Q4_K_M y embeddings reducidos para una variante "Lite" de 2,5 GB, junto con el troceado en nueve ficheros de hasta 1 GB para carga progresiva en el navegador mediante wllama. No se documentan mecanismos como decodificación especulativa, atención lineal ni modos de razonamiento extendido.

## Capacidades

- Generación de texto conversacional en ruso e inglés, con especial cobertura de temática rusa (historia, cultura, legislación, regiones).
- Ejecución completamente offline y en dispositivo, sin envío de datos a servidores externos.
- Despliegue en navegador mediante wllama y en aplicaciones de escritorio y móvil con GGUF (LM Studio, Ollama, PocketPal, llama.cpp).
- Uso en productos propios de DICPlay, como DIC.Антивирус PRO, para explicar amenazas en lenguaje sencillo.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo de pensamiento explícito.
- No se documentan capacidades matemáticas o de código específicas más allá de las heredadas del modelo base.

## Casos de uso

- Asistentes conversacionales offline en móvil: el modelo, con 4096 tokens de contexto y ficheros Q4_K_M de 2,5 a 3,4 GB, permite mantener conversaciones multi-turno sin conexión en teléfonos de gama media mediante PocketPal o llama.cpp.
- Atención al cliente en ruso con privacidad: al ejecutarse en dispositivo, ninguna conversación sale del terminal, lo que resulta adecuado para entornos con requisitos de confidencialidad.
- Consultas sobre legislación y trámites rusos: el ajuste específico sobre legislación de la Federación Rusa lo hace útil como asistente informativo de referencia (con las advertencias de responsabilidad del autor).
- Educación y apoyo al estudio en ruso: explicación de conceptos de historia y cultura de Rusia para estudiantes, con respuestas en ruso e inglés.
- Integración en aplicaciones de escritorio ligeras: mediante GGUF y llama.cpp, puede embeberse en herramientas de productividad o utilidades de sistema que requieran generación de texto local.
- Despliegue web sin backend de inferencia: los nueve ficheros de hasta 1 GB permiten cargar el modelo en el navegador con wllama y ofrecer un chat que funciona tras la primera descarga.
- Explicación de resultados de seguridad: como en DIC.Антивирус PRO, el modelo puede redactar en lenguaje llano la descripción de amenazas detectadas y las acciones recomendadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: aproximadamente 3 GB para la variante Lite (2,5 GB de pesos), 4-4,5 GB para Q4_K_M (3,4 GB) y 6 GB o más para Q8_0 (5,0 GB), considerando el espacio adicional para contexto y caché KV.
- GPU recomendadas: no especificadas por el autor; por tamaño, cualquier GPU consumer con 6-8 GB de VRAM (por ejemplo, RTX 3060, RTX 4060) puede ejecutar Q4_K_M con holgura. Para Q8_0 se recomienda 8 GB o más.
- Cabe en GPU consumer: sí, en la mayoría de tarjetas con 6 GB o más para Q4_K_M; la variante Lite está pensada para teléfonos y equipos de gama baja.
- Opciones de despliegue: llama.cpp (llama-cli con `-cnv`), LM Studio, Ollama, PocketPal, wllama en navegador y la web rusmind.ru.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| RusMind 3.2 Momentum | 4.647.450.147 | 4096 | ru, en | RusMind License (uso comercial restringido) | GGUF |
| google/gemma-4-E2B-it (base) | no disponible en la información | no disponible | multilingüe (no detallado) | Apache 2.0 | safetensors |
| Otras variantes RusMind 3.2 (Вспышка, Знание, АТОМ) | no disponible | no disponible | ru, en | RusMind License | no disponible |

No se dispone de datos de rendimiento comparativo ni de especificaciones detalladas de las variantes hermanas en la información proporcionada.

## Limitaciones y advertencias

- Licencia restrictiva: la RusMind License permite uso personal, no comercial, investigación y evaluación, pero exige contrato escrito con DICPlay para uso comercial, reventa, distribución de versiones modificadas o integración en productos.
- Ventana de contexto limitada a 4096 tokens, insuficiente para documentos largos o conversaciones extensas.
- Cobertura lingüística reducida a ruso e inglés; el rendimiento en otros idiomas no está documentado.
- Riesgo de alucinación inherente a los modelos de lenguaje; el autor advierte que las respuestas sobre medicina, derecho y finanzas son meramente informativas.
- Posible sesgo derivado del ajuste con datos centrados en historia, cultura, legislación y "valores familiares tradicionales" de Rusia, que puede condicionar la perspectiva de las respuestas.
- El modelo base Gemma 4 E2B está sujeto a los términos de Google; la licencia Apache 2.0 del base no se extiende automáticamente a los pesos ajustados, que se rigen por la RusMind License.
- No hay información publicada sobre benchmarks, sesgos medidos ni evaluaciones de seguridad independientes.
- El recuento de descargas y las cifras de popularidad de la model card son afirmaciones del autor y no verificables de forma independiente en esta ficha.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DICPlay/RusMind-3.2-Momentum
- Repositorio de versiones anteriores: https://huggingface.co/DICPlay/RusMind-Momentum
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Demo y descarga en navegador: https://rusmind.ru
- Fichero Lite (2,5 GB): https://huggingface.co/DICPlay/RusMind-3.2-Momentum/blob/main/RusMind-Momentum-3.2-Lite.gguf
- Fichero Q4_K_M (3,4 GB): https://huggingface.co/DICPlay/RusMind-3.2-Momentum/blob/main/RusMind-Momentum-3.2-Q4_K_M.gguf
- Fichero Q8_0 (5,0 GB): https://huggingface.co/DICPlay/RusMind-3.2-Momentum/blob/main/RusMind-Momentum-3.2-Q8_0.gguf
- Texto de la licencia: LICENSE (en el repositorio)
- Texto de la licencia Apache 2.0 del modelo base: LICENSE-APACHE-2.0.txt (en el repositorio)
