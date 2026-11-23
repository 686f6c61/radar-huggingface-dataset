# sirsqm/seger-qwen2.5-1.5b-onnx

## Resumen

Seger (ONNX) es una compilación en formato ONNX del ajuste fino LoRA denominado Seger, aplicado sobre Qwen 2.5 1.5B, publicada por el usuario sirsqm. El objetivo del artefacto no es tanto el modelo en sí como su formato: se trata de una conversión a int8 por canal (per-channel int8) pensada para ejecución de inferencia directamente en el navegador mediante transformers.js sobre el backend WASM de ONNX Runtime, con el dtype `q8`.

La relevancia de esta publicación es fundamentalmente práctica: según la model card, la variante de 4 bits basada en MatMulNBits aborta la sesión de ONNX Runtime WASM en todos los navegadores probados, por lo que el autor optó por una cuantización int8 por canal que sí resulta funcional en el entorno web. Esto convierte al artefacto en una referencia útil para quien necesite desplegar un modelo conversacional de 1.5B parámetros en cliente sin backend.

Al derivar de Qwen 2.5 1.5B, hereda la arquitectura transformer densa del modelo original, aunque la información publicada no detalla el proceso de ajuste LoRA ni los datos empleados. El repositorio ocupa 6.2 GB y acumula 486 descargas, sin likes ni métricas de validación publicadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen 2.5 1.5B); artefacto ONNX |
| Parametros totales | 1.5B (heredados del modelo base Qwen 2.5 1.5B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 por canal (per-channel int8); dtype `q8` en transformers.js |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | ONNX (repo de 6.2 GB); libreria transformers.js |

## Arquitectura y entrenamiento

El artefacto es una conversión ONNX de un ajuste fino LoRA sobre Qwen 2.5 1.5B, un transformer denso de la familia Qwen 2.5. La model card no aporta detalles sobre el dataset de instrucciones empleado en el LoRA, el número de tokens de entrenamiento, la composición del corpus ni si se aplicaron técnicas de alineación como RLHF o DPO. Tampoco se documenta el rango o la configuración del adaptador LoRA original.

La innovación técnica destacable es la decisión de cuantización: el autor indica explícitamente que la build de 4 bits basada en MatMulNBits provoca el aborto de la sesión de ONNX Runtime WASM en todos los navegadores, y que por ello se optó por int8 por canal. Esta elección prioriza la compatibilidad de ejecución en el runtime web sobre la reducción de tamaño, lo que explica el peso del repositorio (6.2 GB).

## Capacidades

- Generación de texto conversacional, según la etiqueta `conversational` del repositorio.
- Ejecución de inferencia en navegador mediante transformers.js con backend WASM y dtype `q8`.
- Herencia de las capacidades del modelo base Qwen 2.5 1.5B (no verificadas en esta build).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades especiales (modo thinking, visión, audio): no disponible en la información proporcionada.

## Casos de uso

- Asistente conversacional embebido en una aplicación web: el modelo puede cargarse con transformers.js en el cliente y mantener diálogos sin enviar datos a un servidor, aprovechando que la build int8 evita el fallo de sesión que provoca la variante de 4 bits en WASM.
- Demos y prototipos sin backend: permite publicar una página estática con un chatbot funcional, útil para validar una idea de producto antes de invertir en infraestructura de servidor.
- Procesamiento de texto en entornos con requisitos de privacidad: al ejecutarse íntegramente en el navegador del usuario, el contenido de las conversaciones no sale del dispositivo, lo que encaja en escenarios con datos sensibles.
- Aplicaciones de escritorio basadas en web (Electron, Tauri con webview): el artefacto ONNX puede integrarse en el runtime web de estas aplicaciones para ofrecer generación de texto local.
- Educación y experimentación: sirve como ejemplo práctico de conversión ONNX y de las limitaciones de las distintas cuantizaciones en ONNX Runtime WASM, documentadas por el propio autor.
- Pruebas de compatibilidad de navegadores: útil para evaluar el rendimiento de inferencia WASM en distintos clientes antes de adoptar un modelo mayor o una cuantización distinta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no aplica en el caso de ejecución en navegador (se ejecuta en CPU mediante WASM); para ejecución en GPU con ONNX Runtime no hay datos publicados.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; el caso de uso documentado es el navegador.
- Opciones de despliegue: transformers.js con backend ONNX Runtime WASM y dtype `q8`. Otras opciones (vLLM, llama.cpp, Ollama, TGI) no están documentadas para este artefacto.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Ejecucion en navegador |
|---|---|---|---|---|---|
| Seger (ONNX) | 1.5B | no disponible | ONNX int8 por canal | no disponible | Si, via transformers.js WASM |
| Qwen 2.5 1.5B (original) | 1.5B | no disponible | safetensors | no disponible | No de forma nativa |
| Seger (modelo base del LoRA) | 1.5B | no disponible | no disponible | no disponible | No disponible |

No se dispone de datos de rendimiento comparado entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- La licencia no está declarada en el repositorio, por lo que no puede confirmarse la viabilidad de uso comercial.
- No se documentan los idiomas soportados ni el proceso de entrenamiento del LoRA, lo que impide evaluar sesgos o calidad del ajuste.
- Al ser una cuantización int8, cabe esperar una degradación de calidad respecto al modelo en precisión completa, aunque no se han publicado mediciones.
- El tamaño del repositorio (6.2 GB) es elevado para una build destinada al navegador, lo que puede afectar a los tiempos de carga en conexiones lentas.
- La ejecución en WASM sobre CPU implica latencias superiores a las de una GPU; no hay cifras publicadas.
- El autor advierte que la variante de 4 bits basada en MatMulNBits falla en todos los navegadores probados; no debe asumirse que otras cuantizaciones funcionen sin validación previa.
- No hay métricas de evaluación ni validación por parte de terceros; el modelo acumula 0 likes y no consta revisión de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/sirsqm/seger-qwen2.5-1.5b-onnx
- Modelo base del LoRA: https://huggingface.co/sirsqm/seger-qwen2.5-1.5b
- Documentación de transformers.js: https://huggingface.co/docs/transformers.js
- ONNX Runtime: https://onnxruntime.ai/
