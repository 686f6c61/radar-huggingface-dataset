# software-mansion/Bielik-1.5B-v3.0-Instruct-ExecuTorch

## Resumen

Bielik-1.5B-v3.0-Instruct-ExecuTorch es la exportación del modelo de lenguaje Bielik-1.5B-v3.0-Instruct, desarrollado originalmente por SpeakLeash, al formato `.pte` de ExecuTorch para su ejecución en dispositivos (on-device). El repositorio lo publica Software Mansion, el equipo detrás de la librería React Native ExecuTorch, con el objetivo de ofrecer un modelo conversacional en polaco listo para integrarse en aplicaciones móviles mediante React Native sin necesidad de conexión a servidores externos.

El modelo base es un transformer decoder-only de 1.500 millones de parámetros, afinado para instrucciones y conversación, y entrenado principalmente en polaco. Esta exportación no modifica los pesos más allá de la cuantización: ofrece tres variantes compiladas (MLX int8, XNNPACK 8da4w y XNNPACK 8da8w) que cubren distintos backends de ejecución en dispositivo.

Su relevancia actual radica en que permite desplegar un LLM en polaco directamente en smartphones y dispositivos de borde, con tamaños de fichero entre 937 MB y 1,6 GB, lo que lo hace viable en hardware móvil de gama alta y media. Es una pieza clave para desarrolladores que construyen asistentes conversacionales offline en el ecosistema React Native.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base Bielik-1.5B-v3.0-Instruct) |
| Parametros totales | 1.500 millones (1.5B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (MLX), 8da4w (XNNPACK), 8da8w (XNNPACK) |
| Idiomas soportados | polaco (pl) |
| Licencia | Apache 2.0 |
| Formato de pesos | ExecuTorch `.pte` (variantes MLX y XNNPACK); tokenizer en JSON |

## Arquitectura y entrenamiento

El modelo subyacente es Bielik-1.5B-v3.0-Instruct, un transformer decoder-only de 1.500 millones de parámetros afinado para seguir instrucciones y mantener conversaciones. El repositorio no aporta detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO; esa información corresponde a la model card del modelo base de SpeakLeash, no incluida en la información proporcionada.

La innovación técnica de esta publicación no está en la arquitectura, sino en el proceso de exportación: los pesos se compilan a programas ExecuTorch `.pte` para dos backends distintos. La variante MLX usa cuantización int8 y está pensada para el backend MLX (Apple Silicon y dispositivos Apple). Las variantes XNNPACK emplean los esquemas 8da4w (8 bits de activación, 4 bits de pesos) y 8da8w (8 bits en ambos), orientados a CPUs ARM y x86 mediante la librería XNNPACK. Los ficheros están publicados para el runtime ExecuTorch v1.4.1, que no garantiza compatibilidad hacia delante.

## Capacidades

- Generación de texto conversacional en polaco, con formato de instrucciones.
- Razonamiento básico y respuesta a preguntas dentro de las limitaciones de un modelo de 1.5B.
- Generación de código y texto técnico en polaco e inglés (capacidad limitada por el tamaño).
- Soporte de conversaciones multi-turno mediante plantilla de chat (tokenizer_config.json incluido).
- Ejecución completamente offline en dispositivo, sin llamadas a API.
- Integración nativa con React Native ExecuTorch mediante constantes del registro de modelos de la librería.
- No se documenta soporte de tool calling, function calling, agentes, visión ni audio.

## Casos de uso

- Asistentes conversacionales offline en apps móviles: el modelo se ejecuta en el dispositivo mediante React Native ExecuTorch, permitiendo un chatbot en polaco sin conexión y sin enviar datos del usuario a servidores externos.
- Traducción y reescritura de texto en polaco: útil en apps de productividad o edición que necesitan parafrasear o corregir texto localmente con baja latencia.
- Clasificación y extracción de información en polaco: etiquetado de mensajes, resúmenes cortos o extracción de entidades en pipelines ligeros embebidos en la app.
- Autocompletado y sugerencias de texto en teclados o formularios: el tamaño reducido (937 MB en 8da4w) permite mantener el modelo cargado en memoria en dispositivos de gama alta.
- Atención al cliente en modo borrador: generación de respuestas preliminares que un humano revisa, con la ventaja de que los datos sensibles no salen del dispositivo.
- Prototipado rápido de funciones de IA generativa en React Native: el registro de modelos de la librería simplifica la integración y permite validar ideas sin infraestructura de servidores.
- Aplicaciones educativas o de accesibilidad: tutor o asistente de lectura en polaco que funciona sin red, útil en entornos con conectividad limitada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada: aproximadamente 1 GB para la variante XNNPACK 8da4w (937 MB de pesos), 1,6 GB para las variantes int8 y 8da8w, más overhead del runtime y del contexto.
- GPU recomendadas: no aplica en el caso de XNNPACK (ejecución en CPU); la variante MLX está pensada para Apple Silicon (iPhone, iPad, Mac con chip M-series).
- Cabe en dispositivos móviles de gama alta y media con al menos 4 GB de RAM; en consumer GPU de escritorio no es el objetivo principal de esta exportación.
- Opciones de despliegue: React Native ExecuTorch (runtime ExecuTorch v1.4.1) para apps móviles; también es posible cargar los `.pte` en un runtime ExecuTorch propio, consultando previamente la nota de compatibilidad del repositorio de PyTorch.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato / despliegue |
|---|---|---|---|---|---|
| Bielik-1.5B-v3.0-Instruct-ExecuTorch | 1.5B | no disponible | pl | Apache 2.0 | ExecuTorch `.pte` (MLX, XNNPACK) |
| Bielik-1.5B-v3.0-Instruct (base) | 1.5B | no disponible | pl | Apache 2.0 | safetensors (Hugging Face) |
| Modelos multilingues pequeños tipo Qwen2.5-1.5B-Instruct | 1.5B | no disponible en esta ficha | multilingue | Apache 2.0 | safetensors, GGUF, ExecuTorch |
| Modelos tipo Llama 3.2 1B Instruct | 1.2B | no disponible en esta ficha | multilingue | licencia Llama | safetensors, GGUF |

La comparativa con alternativas internacionales es orientativa: la ventaja diferencial de esta exportación es el soporte nativo de React Native ExecuTorch y su especialización en polaco, mientras que los modelos multilingues pequeños ofrecen mayor cobertura de idiomas pero requieren exportaciones propias para ejecución on-device.

## Limitaciones y advertencias

- Modelo especializado en polaco; su rendimiento en castellano u otros idiomas no está garantizado y probablemente sea deficiente.
- Con 1.5B de parámetros, la capacidad de razonamiento complejo, matemáticas y código es limitada en comparación con modelos de mayor tamaño.
- Riesgo de alucinación inherente a los LLM pequeños, especialmente en preguntas factuales y contextos largos.
- Sesgos potenciales heredados del corpus de entrenamiento del modelo base (predominantemente polaco); no se documentan evaluaciones de sesgo en esta ficha.
- La longitud de contexto no está especificada en la información disponible; conviene consultar la model card del modelo base antes de diseñar prompts largos.
- Los ficheros `.pte` están compilados para ExecuTorch v1.4.1 y no hay garantía de compatibilidad con versiones anteriores o posteriores del runtime.
- El repositorio ocupa 16,4 GB, aunque cada variante individual pesa entre 937 MB y 1,6 GB; hay que seleccionar la variante adecuada al backend y al dispositivo.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda revisar las condiciones del modelo base de SpeakLeash por si añaden requisitos adicionales.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/software-mansion/Bielik-1.5B-v3.0-Instruct-ExecuTorch
- Modelo base: https://huggingface.co/speakleash/Bielik-1.5B-v3.0-Instruct
- Librería React Native ExecuTorch (npm): https://www.npmjs.com/package/react-native-executorch
- Documentación de React Native ExecuTorch: https://docs.swmansion.com/react-native-executorch/docs/fundamentals/downloading-models
- Nota de compatibilidad de ExecuTorch: https://github.com/pytorch/executorch/blob/main/runtime/COMPATIBILITY.md
