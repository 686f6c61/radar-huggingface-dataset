# leok7v/Qwen3.5-4B

## Resumen

Qwen3.5-4B es un modelo de lenguaje denso de 4.326 millones de parámetros desarrollado por Qwen (Alibaba), que forma parte de la serie Qwen 3.5. Su arquitectura es híbrida: combina bloques de atención lineal Gated DeltaNet con bloques de atención completa en una proporción de tres a uno, lo que permite mantener un estado recurrente de tamaño fijo y un uso de memoria plano a medida que crece el contexto, que alcanza hasta 262.144 tokens. El modelo base es multimodal (texto, imagen y vídeo), aunque esta build concreta es solo de texto.

La versión aquí descrita, publicada por el usuario leok7v, es una cuantización 2-bit en formato GGUF v3 con un bloque personalizado basado en el retículo E8. El archivo incluye el tokenizador, la tabla de merge y la plantilla de chat embebidos, de modo que la inferencia no requiere llamadas a servidores externos. Está pensada para ejecutarse íntegramente en dispositivo (on-device), en entornos offline o con requisitos estrictos de privacidad. Es importante señalar que este formato 2-bit no es compatible con llama.cpp estándar, Ollama o LM Studio; requiere un runtime específico que implemente el bloque ggml personalizado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: Gated DeltaNet (atención lineal) + atención completa, ratio 3:1, con capa MTP (multi-token prediction) |
| Parametros totales | 4.326.350.848 (4,33 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | Hasta 262.144 tokens |
| Tipos de cuantizacion | 2-bit personalizado (E8 lattice, 2 bits por peso), BF16, Q4_0 y F32 para ciertos tensores |
| Idiomas soportados | Inglés y los idiomas del modelo base (el base es multilingüe, aunque la model card solo especifica "en") |
| Licencia | Apache 2.0 (heredada del modelo base) |
| Formato de pesos | GGUF v3 (1,47 GiB, 441 tensores, alineación de 16384 bytes) |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-4B es un transformer causal denso con una arquitectura híbrida innovadora: de cada cuatro capas, tres son bloques de atención lineal Gated DeltaNet y una es de atención completa. Los bloques lineales mantienen un estado recurrente de tamaño fijo (128 dimensiones, 16 grupos, tamaño interno 4096), lo que elimina el crecimiento del caché KV con el contexto, mientras que los bloques de atención completa preservan la recuperación exacta de información a largo plazo. La capa MTP (multi-token prediction) permite decodificación especulativa autorreferencial si el runtime la soporta; en caso contrario, se ignora.

El modelo base fue entrenado con aprendizaje por refuerzo a escala (RL) y destaca por su eficiencia arquitectónica y accesibilidad global. Esta build 2-bit no añade ningún ajuste de seguridad ni filtrado adicional; es el modelo original en un formato numérico distinto. El archivo GGUF incluye el tokenizador, la tabla de merge y la plantilla de chat, que documenta los roles, el bloque de pensamiento y el formato de tool-call. Los parámetros de muestreo recomendados se almacenan en `generation_config.json` y varían según el modo: Thinking (temperatura 1.0, top_p 0.95, top_k 20, presence_penalty 1.5) e Instruct no-thinking (temperatura 0.7, top_p 0.80, top_k 20, presence_penalty 1.5). La plantilla soporta `reasoning_effort` con niveles `low` y `medium` que reducen el gasto de tokens por turno.

## Capacidades

- Generación de texto autoregresiva con soporte de razonamiento explícito (modo Thinking) y modo Instruct estándar.
- Razonamiento multi-paso y cadenas de pensamiento, aunque la cuantización 2-bit degrada la precisión en pasos largos.
- Soporte de tool calling y formato de llamada a funciones documentado en la plantilla de chat.
- Capacidad de decodificación especulativa mediante la capa MTP (si el runtime la implementa).
- Contexto largo de hasta 262.144 tokens con memoria plana gracias a la atención lineal.
- Multilingüe en el modelo base, aunque esta build solo declara inglés en la model card.
- Solo texto: no incluye torre de visión, por lo que no procesa imágenes ni vídeo.
- Ejecución completamente on-device: tokenizador, plantilla y pesos embebidos, sin llamadas a servidores.

## Casos de uso

- Chat on-device en entornos offline: el modelo puede mantener conversaciones multi-turno con contexto largo (hasta 262K tokens) sin conexión a internet, ideal para dispositivos móviles o edge con restricciones de privacidad.
- Resumen de documentos extensos: gracias a la ventana de contexto de 262K tokens y la memoria plana, puede resumir informes, artículos o libros completos sin truncar el texto de entrada.
- Redacción y borradores de texto: genera borradores de correos, publicaciones o documentación técnica con un estilo coherente, útil en aplicaciones de productividad local.
- Preguntas y respuestas sobre texto suministrado: el usuario puede proporcionar un corpus (por ejemplo, manuales o bases de conocimiento) y el modelo responde basándose en ese contenido, sin necesidad de RAG externo.
- Asistente de programación en local: aunque la cuantización 2-bit degrada la precisión, puede generar fragmentos de código y explicaciones para tareas de desarrollo en entornos aislados.
- Prototipado de agentes con tool calling: la plantilla de chat incluye formato de tool-call, lo que permite construir agentes simples que ejecutan funciones locales (por ejemplo, consultas a bases de datos o APIs internas) sin salir del dispositivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks para esta cuantización 2-bit en la información disponible. El modelo base Qwen3.5-4B, según fuentes externas, se acerca al rendimiento de Qwen3-30B en MMLU-Pro y supera a GPT-5-Nano en benchmarks de visión, pero no se dispone de cifras exactas en los datos proporcionados. Dado que la cuantización 2-bit es agresiva, el rendimiento real será inferior al del modelo en precisión completa, especialmente en tareas de razonamiento aritmético y multi-paso. Se recomienda evaluar el modelo en la tarea específica antes de usarlo en producción.

## Requisitos de hardware

- VRAM estimada: el archivo de pesos ocupa 1,47 GiB, por lo que con overhead de runtime se necesitan aproximadamente 2-3 GB de VRAM para inferencia en GPU.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM (por ejemplo, GTX 1650, RTX 3050, RTX 4060) es suficiente. También puede ejecutarse en CPU con 4-8 GB de RAM.
- Compatibilidad: no es compatible con llama.cpp, Ollama ni LM Studio en sus versiones estándar debido al bloque 2-bit personalizado. Requiere un runtime on-device específico que implemente el bloque ggml E8.
- Opciones de despliegue: runtime propietario o personalizado que acompañe al archivo; no se mencionan integraciones con vLLM, TGI u otros servidores de inferencia.
- Latencia y throughput: no disponibles. La decodificación especulativa con la capa MTP podría mejorar el throughput si el runtime la soporta, pero no hay datos publicados.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.5-4B (base) | 4,33 B | 262.144 | Apache 2.0 | safetensors | Multimodal, precisión completa |
| Qwen3.5-4B (2-bit GGUF, esta build) | 4,33 B | 262.144 | Apache 2.0 | GGUF v3 personalizado | Solo texto, requiere runtime específico |
| Qwen3-4B (generación anterior) | ~4 B | no disponible | Apache 2.0 | safetensors/GGUF | Modelo denso de la serie Qwen3, sin arquitectura híbrida |

No se dispone de datos de rendimiento comparativo entre esta cuantización y otras versiones (por ejemplo, Q4_K_M o Q8_0) del mismo modelo, ya que el autor no las publica en este repositorio. La model card menciona que existen "standard-quant GGUF releases" pero no se especifican enlaces ni resultados.

## Limitaciones y advertencias

- La cuantización 2-bit es extremadamente agresiva: los resultados no coinciden token a token con el modelo en precisión completa, y la degradación es mayor en tareas donde el modelo ya era incierto.
- Errores aritméticos y de razonamiento multi-paso: una cadena de razonamiento puede estar bien estructurada pero contener fallos de cálculo; los errores se acumulan en derivaciones largas.
- Sesgos y fallos del modelo base se heredan sin cambios; esta build no añade alineación, ajuste de seguridad ni filtrado.
- Solo texto: no procesa imágenes ni vídeo, a pesar de que el modelo base es multimodal.
- Formato no estándar: el archivo GGUF usa un bloque 2-bit personalizado (E8 lattice) que llama.cpp estándar no puede leer; solo funciona con el runtime on-device específico.
- No apto para decisiones legales, médicas, financieras o de seguridad sin revisión humana; no debe usarse en sistemas automatizados de alto riesgo.
- Los parámetros de muestreo recomendados están en `generation_config.json`; un runtime que no encuentre este archivo debe negarse a adivinar en lugar de usar los ajustes de otro modelo.
- La licencia Apache 2.0 permite uso comercial, pero se debe verificar la licencia del modelo base y cumplir sus términos.

## Enlaces

- Repositorio de esta build: https://huggingface.co/leok7v/Qwen3.5-4B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Página del modelo en LM Studio: https://lmstudio.ai/models/qwen/qwen3.5-4b
- Página del modelo en Ollama: https://ollama.com/library/qwen3.5:4b
- Página del modelo en CanIRun.ai: https://www.canirun.ai/model/qwen3.5-4b
- Página del modelo en Awesome Agents: https://awesomeagents.ai/models/qwen-3-5-4b/
