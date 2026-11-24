# Digitak2027/hamefan-chat-brain

## Resumen

Hamefan chat brain es una cuantización GGUF Q4_K_M del modelo Qwen3-4B-abliterated publicado por mlabonne, redistribuida por el usuario Digitak2027 para servir como motor de conversación offline de la aplicación Android Hamefan (همه‌فن‌حریف). No se trata de un modelo entrenado desde cero ni de un fine-tuning propio: el repositorio contiene únicamente los pesos cuantizados derivados del GGUF de bartowski, con un SHA-256 declarado para verificación de integridad.

El modelo subyacente es Qwen3-4B, un transformer denso de aproximadamente 4.022 millones de parámetros (4B) desarrollado por el equipo Qwen de Alibaba. La variante "abliterated" es una modificación de los pesos originales que elimina o atenúa la dirección de rechazo en el espacio de activaciones, de modo que el modelo responde a peticiones que el modelo base declinaría. Esta ficha describe el artefacto tal como se distribuye, sin avalar la modificación.

Su relevancia es acotada: se trata de un artefacto de despliegue para un caso de uso muy concreto (chat en dispositivo Android sin conexión), con cero descargas y cero likes en el momento de la consulta, sin model card técnica más allá de una línea de procedencia y sin licencia declarada en el repositorio. Cualquier evaluación rigurosa debe remitirse a la documentación del Qwen3-4B original y del GGUF de bartowski.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Qwen3-4B; sin confirmación en el repositorio) |
| Parametros totales | 4.022.468.096 (según safetensors del repositorio) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible en el repositorio (el modelo base Qwen3-4B soporta contexto largo nativo, pero este artefacto no lo declara) |
| Tipos de cuantizacion | GGUF Q4_K_M (única cuantización publicada) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el repositorio no declara licencia; la licencia aplicable depende del modelo Qwen3-4B original y de la cadena de derivación) |
| Formato de pesos | GGUF (también presentes pesos safetensors según el conteo de parámetros del repositorio) |

## Arquitectura y entrenamiento

La arquitectura corresponde a Qwen3-4B: un transformer decoder-only denso con atención por cabezas agrupadas (GQA) y las innovaciones introducidas en la familia Qwen3, que combina modos de razonamiento explícito y respuesta directa. El repositorio no documenta la arquitectura, los datos de entrenamiento ni el proceso de alineación; toda la información técnica debe tomarse de la documentación oficial del modelo base.

Sobre el pipeline de entrenamiento no hay datos en la información proporcionada: no se indica número de tokens, composición del corpus, ni si hubo RLHF, DPO o cualquier otra etapa de alineación. La única transformación documentada es la "abliteration" aplicada por mlabonne sobre Qwen3-4B, que modifica los pesos para suprimir el comportamiento de rechazo, seguida de la cuantización Q4_K_M realizada por bartowski y de la redistribución de este repositorio. No se declara ningún entrenamiento adicional, destilación ni calibración imatrix específica más allá de la etiqueta `imatrix` en los tags.

## Capacidades

- Generación de texto conversacional multi-turno, orientada a chat en dispositivo.
- Razonamiento y respuesta a instrucciones heredados de Qwen3-4B (sin verificación en este artefacto).
- Capacidad multilingüe heredada del modelo base, aunque el repositorio no declara idiomas soportados.
- Ejecución offline en Android mediante runtime GGUF, que es el propósito declarado del artefacto.
- Respuestas a peticiones que el modelo base rechazaría, como consecuencia de la abliteración.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de pensamiento explícito en este repositorio.

## Casos de uso

- Chat offline en la aplicación Android Hamefan: el artefacto está empaquetado en GGUF Q4_K_M (unos 2,5 GB de repositorio) para cargarse en un runtime local en el dispositivo y mantener conversaciones sin conexión de red, que es exactamente el escenario para el que se publicó.
- Asistente personal sin conectividad: en entornos sin red (campo, avión, zonas con cobertura restringida) el modelo puede responder consultas generales y mantener contexto de conversación dentro de los límites del runtime móvil.
- Prototipado de aplicaciones de chat en Android: sirve como motor de referencia para validar interfaces conversacionales antes de integrar un modelo mayor o un servicio remoto.
- Pruebas de cuantización y despliegue GGUF: útil para medir latencia y consumo de memoria de un modelo de 4B en Q4_K_M en hardware móvil o en equipos de gama baja.
- Investigación sobre alineación y abliteración: permite reproducir experimentos sobre supresión de rechazo en un modelo de 4B, comparando el comportamiento con el Qwen3-4B original.
- Generación de texto creativo y divulgativo en local: redacción de borradores, resúmenes y respuestas conversacionales en un equipo sin GPU dedicada, dado el reducido tamaño del artefacto.
- Base para fine-tuning posterior: los pesos safetensors del repositorio pueden servir de punto de partida para ajustes específicos de dominio, aunque la licencia no declarada es un obstáculo para uso comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en Q4_K_M: en torno a 2,5-3 GB para los pesos, más el overhead del contexto (KV cache), que puede añadir entre 0,5 y 2 GB según la longitud de contexto configurada.
- GPU recomendadas: cualquier GPU con 6 GB o más de VRAM (RTX 3060, RTX 4060, RTX 4090) puede ejecutar el modelo con contexto amplio; en GPUs de 4 GB cabe con contexto reducido.
- Cabe en GPU de consumo: sí, en RTX 3050/3060, RTX 4060, RTX 4090 y equivalentes; también en iGPU con memoria unificada suficiente.
- Despliegue: llama.cpp, Ollama y cualquier runtime compatible con GGUF; el tag `endpoints_compatible` sugiere compatibilidad con endpoints tipo OpenAI, aunque no se detalla en el repositorio. vLLM y TGI no son la vía natural para este artefacto GGUF.
- Latencia y throughput: no disponibles. En un Snapdragon de gama alta con Q4_K_M es razonable esperar decenas de tokens por segundo, pero no hay mediciones publicadas en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Hamefan chat brain (este) | 4,02B | no disponible | GGUF Q4_K_M | no disponible | Derivado abliterated de Qwen3-4B, sin benchmarks ni idiomas declarados |
| Qwen3-4B (original) | 4B | contexto largo nativo (consultar model card oficial) | safetensors, GGUF | licencia Qwen (consultar términos) | Modelo base con documentación completa y benchmarks publicados |
| mlabonne/Qwen3-4B-abliterated | 4B | el del modelo base | safetensors, GGUF | derivada de Qwen3-4B | Variante abliterated de referencia, con model card propia |
| Llama 3.2 3B Instruct | 3B | 128K (según model card oficial) | safetensors, GGUF | licencia Llama | Alternativa de tamaño similar para chat en dispositivo |

## Limitaciones y advertencias

- La abliteración elimina los mecanismos de rechazo del modelo base: puede producir contenido dañino, ilegal o inexacto sin filtro, lo que exige moderación externa en cualquier despliegue público.
- Riesgo de alucinación propio de un modelo de 4B: baja fiabilidad en datos factuales, matemáticas complejas y citas.
- El repositorio no declara licencia, idiomas ni contexto: no hay garantía jurídica ni técnica documentada para uso comercial.
- La licencia aplicable depende en última instancia de los términos de Qwen3-4B y de la cadena de derivación (mlabonne, bartowski); conviene verificarla antes de redistribuir.
- Artefacto sin tracción: cero descargas y cero likes, sin issues ni validación comunitaria; el SHA-256 declarado permite verificar integridad, pero no hay auditoría independiente.
- La cuantización Q4_K_M introduce pérdida de precisión respecto a los pesos originales, especialmente en tareas de razonamiento y código.
- El contexto efectivo en Android está limitado por la RAM del dispositivo, no solo por la ventana del modelo.
- No se documenta soporte de tool calling ni de agentes; no debe asumirse en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Digitak2027/hamefan-chat-brain
- GGUF de origen (bartowski): https://huggingface.co/bartowski/mlabonne_Qwen3-4B-abliterated-GGUF
- Modelo abliterated de mlabonne: https://huggingface.co/mlabonne/Qwen3-4B-abliterated
- Modelo base Qwen3-4B: https://huggingface.co/Qwen/Qwen3-4B
