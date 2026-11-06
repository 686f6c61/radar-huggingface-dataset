# hellmans/Qwen3-4B-GGUF

## Resumen

Qwen3-4B-GGUF es una conversión a formato GGUF del modelo Qwen3-4B, desarrollado originalmente por el equipo Qwen de Alibaba Cloud y cuantizado por el usuario hellmans. Se trata de un modelo de lenguaje causal denso de 4.022 millones de parámetros (3.600 millones sin contar los embeddings) pensado para generación de texto, razonamiento, código y tareas de agente. La versión GGUF permite su ejecución en hardware de consumo mediante llama.cpp, Ollama y otras herramientas compatibles con este formato.

El modelo base Qwen3-4B forma parte de la tercera generación de la familia Qwen y destaca por integrar en un único modelo la capacidad de alternar entre un modo de razonamiento explícito (thinking mode) y un modo de respuesta directa (non-thinking mode). Esta característica lo hace versátil tanto para tareas de razonamiento complejo como para diálogo general de baja latencia, sin necesidad de cargar dos modelos distintos.

Con 36 capas, atención GQA (32 cabezas para Q y 8 para KV) y una ventana de contexto nativa de 32.768 tokens ampliable a 131.072 mediante YaRN, este modelo se posiciona como una opción compacta y funcional para despliegues locales. La licencia Apache 2.0 facilita su uso comercial y su integración en productos, aunque la model card del repositorio solo declara inglés como idioma soportado, a pesar de que el modelo base original soporta más de 100 idiomas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal denso (Qwen3) |
| Parametros totales | 4.022.468.096 (4,0B); 3,6B sin embeddings |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 32.768 tokens nativos; 131.072 con YaRN |
| Tipos de cuantizacion | GGUF (varias cuantizaciones, segun el repo; el detalle exacto no esta disponible) |
| Idiomas soportados | Ingles (declarado en la model card); el modelo base soporta 100+ idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de 66,2 GB con multiples archivos de cuantizacion) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer causal densa con 36 capas, normalizacion RMSNorm y atención con query-key normalization, tal como corresponde a la familia Qwen3. Utiliza Grouped Query Attention (GQA) con 32 cabezas para las consultas y 8 para las claves/valores, lo que reduce el uso de memoria en la caché KV durante la inferencia. El entrenamiento se realizó en dos fases: preentrenamiento sobre un corpus masivo multilingüe y post-entrenamiento con técnicas de alineación (preferencias humanas y datos sintéticos), aunque la model card no detalla el número exacto de tokens ni la composición del dataset.

La innovación principal de Qwen3 es la capacidad de alternar entre thinking mode y non-thinking mode dentro del mismo modelo. En thinking mode el modelo genera una cadena de razonamiento antes de la respuesta final, lo que mejora el rendimiento en matemáticas, código y lógica. En non-thinking mode responde directamente, con menor latencia. El cambio se controla mediante los tokens `/think` y `/no_think` en el prompt o el mensaje de sistema, y el modelo respeta la instrucción más reciente en conversaciones multi-turno. La versión GGUF de hellmans emplea la cuantización dinámica de Unsloth (Unsloth Dynamic 2.0), que según el autor logra mejor precisión que las cuantizaciones estándar.

## Capacidades

- Generación de texto y diálogo multi-turno con alineación para escritura creativa, role-playing e instrucciones.
- Razonamiento explícito en thinking mode para matemáticas, lógica y código.
- Generación y comprensión de código en múltiples lenguajes.
- Tool calling y function calling en ambos modos (thinking y non-thinking).
- Capacidades de agente: razonamiento multi-paso e integración con herramientas externas.
- Soporte multilingüe amplio en el modelo base (100+ idiomas), aunque la model card de esta conversión solo declara inglés.
- Cambio dinámico entre thinking y non-thinking mediante `/think` y `/no_think`.
- No incluye visión ni audio: es un modelo exclusivamente de texto.

## Casos de uso

- Asistente de código en local: el modelo puede generar y revisar código en un portátil con GPU de consumo gracias a su tamaño de 4B y su formato GGUF, integrándose en editores mediante llama.cpp u Ollama.
- Atención al cliente automatizada: con 32.768 tokens de contexto nativo puede gestionar conversaciones multi-turno con historial extenso y documentación de referencia, y el modo non-thinking reduce la latencia en respuestas rutinarias.
- Razonamiento matemático asistido: en thinking mode el modelo genera cadenas de razonamiento que mejoran la precisión en problemas de varios pasos, útil para herramientas educativas o de análisis.
- Agentes autónomos con tool calling: puede invocar APIs y ejecutar flujos multi-paso, adecuado para automatización de tareas internas con requisitos de privacidad (ejecución on-premise).
- Procesamiento de documentos largos: con la extensión YaRN hasta 131.072 tokens puede resumir o extraer información de contratos, informes o expedientes que no caben en modelos de contexto corto.
- Prototipado e investigación: al ser un modelo pequeño con licencia Apache 2.0, sirve como base para fine-tuning con LoRA/QLoRA en entornos académicos o para experimentar con técnicas de alineación.
- Traducción y generación multilingüe: aunque la model card declara solo inglés, el modelo base soporta más de 100 idiomas, por lo que puede emplearse en traducción con validación previa de calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio remite a la documentación oficial de Qwen3 para detalles de evaluación, pero no incluye cifras concretas en el material proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,5-3 GB en cuantización Q4_K_M, 4-5 GB en Q8_0 y en torno a 8 GB en FP16 (4B parámetros × 2 bytes).
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A100 o H100 para despliegues de mayor throughput.
- Cabe en GPU de consumo: sí, en cualquier GPU con 6 GB o más de VRAM usando cuantizaciones Q4 o Q5; incluso en CPU con llama.cpp a velocidades moderadas.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, vLLM (con soporte GGUF), TGI y servidores compatibles con la API de OpenAI.
- Latencia y throughput estimados: no disponibles en la información proporcionada; dependerán de la cuantización, el hardware y el backend.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3-4B (este, GGUF) | 4,0B | 32.768 (131.072 con YaRN) | Apache 2.0 | GGUF | Thinking/non-thinking, tool calling |
| Qwen2.5-3B | 3,1B | 32.768 | Apache 2.0 | Safetensors, GGUF | Generación anterior, sin thinking mode |
| Llama-3.2-3B | 3,2B | 131.072 | Llama 3.2 Community | Safetensors, GGUF | Contexto largo, licencia con restricciones |
| Phi-4-mini | 3,8B | 131.072 | MIT | Safetensors, GGUF | Fuerte en razonamiento, sin modo thinking explícito |

## Limitaciones y advertencias

- La model card de esta conversión solo declara inglés como idioma soportado, aunque el modelo base es multilingüe; conviene validar la calidad en castellano antes de usarlo en producción.
- Riesgo de alucinación inherente a los modelos de 4B, especialmente en dominios especializados y en respuestas sin thinking mode.
- El thinking mode incrementa la latencia y el consumo de tokens; en aplicaciones de tiempo real puede ser necesario desactivarlo con `/no_think`.
- La cuantización GGUF introduce pérdida de precisión respecto al modelo original en FP16/BF16; las cuantizaciones muy agresivas (Q2, Q3) pueden degradar notablemente el razonamiento.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta, por lo que no hay validación comunitaria extensa de esta conversión concreta.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los términos del modelo base Qwen3-4B y las licencias de las herramientas de inferencia empleadas.
- No soporta visión ni audio; para tareas multimodales se requiere otro modelo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/hellmans/Qwen3-4B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3-4B/blob/main/LICENSE
- Colección de Unsloth con todas las versiones de Qwen3: https://huggingface.co/collections/unsloth/qwen3-680edabfb790c8c34a242f95
- Guía de Unsloth para ejecutar y ajustar Qwen3: https://docs.unsloth.ai/basics/qwen3-how-to-run-and-fine-tune
- Documentación de Unsloth Dynamic 2.0 GGUF: https://docs.unsloth.ai/basics/unsloth-dynamic-v2.0-gguf
- Repositorio de Unsloth en GitHub: https://github.com/unslothai/unsloth/
- Blog de Unsloth sobre Qwen3: https://unsloth.ai/blog/qwen3
- Notebooks de Unsloth: https://docs.unsloth.ai/get-started/unsloth-notebooks
- Discord de Unsloth: https://discord.gg/unsloth
