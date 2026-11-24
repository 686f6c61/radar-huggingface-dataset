# KeelCore/KeelCore-750M-Professional

## Resumen

KeelCore-750M-Professional es un adaptador LoRA de rango 16 construido sobre el modelo base Thelivu-750M, un transformer encoder-decoder de 750 millones de parámetros. Lo desarrolla el autor independiente Saravanan A R bajo el paraguas del proyecto Thelivu, y su única función es reescribir texto en inglés deficientemente redactado (mensajes, correos, notas, tickets) para convertirlo en escritura profesional clara y gramaticalmente correcta, preservando el significado original.

El adaptador añade 18,29 millones de parámetros entrenables (un 2,43 % del modelo base) y se distribuye como un archivo de 73 MB, no como un modelo completo: requiere el modelo base congelado Thelivu-750M para funcionar. La arquitectura encoder-decoder del modelo base permite que el adaptador copie literalmente nombres, URL y rutas de archivo del texto de entrada al de salida, lo que resulta útil en tareas de reescritura donde hay que conservar cadenas exactas.

Su relevancia actual reside en su ligereza y en las opciones de despliegue: funciona en CPU o GPU con PyTorch y también en navegador mediante ONNX Runtime Web, lo que permite integrar un paso de reescritura en aplicaciones locales o del lado del cliente sin que el texto salga del dispositivo del usuario. No es un modelo conversacional ni responde preguntas: solo reescribe el texto que recibe.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (modelo base Thelivu-750M) con adaptador LoRA de rango 16 |
| Parametros totales | 750M en el modelo base; el adaptador aporta 18,29M parametros entrenables (2,43 % del base) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | No disponible en la informacion proporcionada; el modelo base se carga en float32 (aproximadamente 3 GB de memoria) |
| Idiomas soportados | Ingles (en) |
| Licencia | Thelivu License, Version 1.0 (license_name: thelivu-license-1.0; license: other) |
| Formato de pesos | adapter.safetensors con adapter_config.json (formato propio Thelivu, no PEFT); tambien version ONNX en el repositorio |

## Arquitectura y entrenamiento

El adaptador se monta sobre Thelivu-750M, un transformer encoder-decoder de 750 millones de parámetros. La elección de encoder-decoder es deliberada: el encoder procesa el texto completo de entrada antes de generar la salida, lo que permite al modelo copiar cadenas exactas (nombres propios, URL, rutas como `/etc/app/prod.yaml`) directamente al texto reescrito. El adaptador es un LoRA de rango 16 que enseña al modelo base congelado la tarea específica de reescritura profesional, sin modificar los pesos originales.

El entrenamiento se centra exclusivamente en la tarea de reescritura de texto en inglés. El código de inferencia envuelve automáticamente la entrada con la plantilla ` <text_to_rewrite> … </text_to_rewrite> </s>`. La decodificación por defecto es greedy, con prohibición de repetir cualquier secuencia de tres tokens, y un límite de 384 tokens nuevos. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO. El adaptador incluye una comprobación de huella digital de los pesos del modelo base y rechaza cargarse sobre cualquier otro modelo que no sea Thelivu-750M.

## Capacidades

- Reescritura de texto en inglés: transforma borradores, mensajes, correos, notas y tickets en escritura profesional clara.
- Corrección de ortografía y gramática, con ajuste de tono y formulación sin alterar el significado.
- Preservación de cadenas exactas: nombres, URL y rutas de archivo se copian literalmente al texto de salida gracias a la arquitectura encoder-decoder.
- Ejecución en CPU o GPU con PyTorch, y en navegador mediante ONNX Runtime Web.
- Procesamiento por lotes: la función `rephrase()` acepta una lista de textos y devuelve una lista de reescrituras.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No es un modelo conversacional: no responde preguntas ni sigue instrucciones contenidas en el texto.
- No genera texto desde cero ni resume; únicamente reescribe el texto proporcionado.

## Casos de uso

- Limpieza de borradores en herramientas de mensajería: el adaptador reescribe mensajes de chat informales ("hey team, the client call is moved to 3pm tmrw") en un registro profesional, adecuado para su integración como paso previo al envío en clientes de correo o mensajería.
- Reescritura en el navegador sin salida de datos: al ejecutarse mediante ONNX Runtime Web, el texto del usuario nunca abandona su máquina, lo que lo hace apto para entornos con requisitos estrictos de privacidad.
- Normalización de tickets de soporte: convierte descripciones de incidencias mal redactadas en textos claros y estructurados que facilitan el triaje y la asignación a equipos técnicos.
- Corrección de correos comerciales: ajusta el tono de comunicaciones con clientes (por ejemplo, reclamaciones de facturas) manteniendo las cifras y referencias exactas mediante la copia literal de cadenas.
- Preprocesado en pipelines de documentación: como paso intermedio antes de publicar notas de versión, actualizaciones de estado o documentación interna, garantizando un registro uniforme.
- Investigación sobre adaptadores pequeños: sirve como punto de partida para estudiar el comportamiento de adaptadores LoRA de bajo rango sobre un modelo base compartido, con un coste computacional reducido.
- Reescritura de textos técnicos con rutas y comandos: el modelo conserva rutas como `/etc/app/prod.yaml` intactas mientras profesionaliza el resto de la frase, útil en documentación de operaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base se carga en float32 y consume aproximadamente 3 GB de memoria; el adaptador añade 73 MB.
- GPU recomendadas: no se especifican modelos concretos en la información disponible; cualquier GPU con al menos 3-4 GB de memoria libre debería poder alojar el modelo base en float32.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU consumer con 4 GB o más de VRAM, dado el tamaño del modelo base en float32.
- Ejecución en CPU: soportada explícitamente (`device="cpu"`), lo que permite su uso en portátiles sin GPU.
- Ejecución en navegador: soportada mediante ONNX Runtime Web con los archivos de la carpeta `onnx/` del repositorio.
- Opciones de despliegue: el código del repositorio de GitHub del proyecto Thelivu (clonado e instalado con `torch`, `safetensors`, `sentencepiece`, `pyyaml` y `huggingface_hub`); no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones detalladas de modelos comparables en la información proporcionada. Como referencia estructural, se puede contrastar con el propio modelo base:

| Modelo | Parametros | Tipo | Tarea | Licencia | Formato |
|---|---|---|---|---|---|
| KeelCore-750M-Professional | 750M base + 18,29M adaptador | LoRA sobre encoder-decoder | Reescritura profesional (en) | Thelivu License 1.0 | safetensors (formato Thelivu) y ONNX |
| Thelivu-750M (base) | 750M | Encoder-decoder | Generacion de texto general | Thelivu License 1.0 | safetensors |
| Alternativas de reescritura de texto | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Solo admite inglés; no procesa otros idiomas.
- No es un modelo conversacional: no responde preguntas ni ejecuta instrucciones contenidas en el texto de entrada.
- No genera texto desde cero; únicamente reescribe el texto proporcionado.
- Riesgo de alteración de contenido crítico: no debe usarse en textos donde cada carácter deba conservarse intacto (cláusulas legales, código, configuración, cifras financieras) sin revisión humana posterior.
- Los documentos largos deben dividirse previamente; no se especifica la longitud de contexto soportada.
- El adaptador está ligado al modelo base Thelivu-750M mediante una comprobación de huella digital y no puede cargarse sobre otro modelo.
- Usa un formato de adaptador propio (no PEFT), lo que limita su integración con herramientas estándar del ecosistema Hugging Face.
- Licencia Thelivu License 1.0: es necesario revisar el texto completo de la licencia antes de cualquier uso comercial, ya que se trata de una licencia "other" no estándar.
- Riesgo de alucinación no cuantificado: no se han publicado evaluaciones de fidelidad semántica en la información disponible.
- Sesgos conocidos: no disponibles en la información proporcionada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/KeelCore/KeelCore-750M-Professional
- Modelo base: https://huggingface.co/Thelivu/Thelivu-750M
- Informe técnico: https://saravanan-a-r.github.io/Thelivu/
- Repositorio GitHub: https://github.com/saravanan-a-r/Thelivu
- Licencia: https://huggingface.co/Thelivu/Thelivu-750M-Professional/blob/main/LICENSE
- Perfil del autor: https://www.linkedin.com/in/saravanan-a-r/
