# ravinarayanan/lfm3-1.7b-salesforce-soql-onnx-fp16

## Resumen

El modelo `ravinarayanan/lfm3-1.7b-salesforce-soql-onnx-fp16` es un ajuste fino por LoRA del modelo base LiquidAI/LFM3-1.7B, especializado en la generación de consultas SOQL (Salesforce Object Query Language), explicaciones sobre objetos y campos estándar de Salesforce, y un protocolo de herramientas basado en JSON para el descubrimiento de metadatos de organización. Lo desarrolla el usuario ravinarayanan y se distribuye exclusivamente como paquete de despliegue ONNX en FP16, no como checkpoint de PyTorch ni como adaptador LoRA.

El modelo resuelve un problema muy concreto: dotar a aplicaciones cliente de Salesforce de un generador local de consultas y llamadas a herramientas de metadatos, empaquetado para ejecutarse en el navegador mediante Transformers.js y WebGPU. Con 1.700 millones de parámetros y un contexto no especificado en la información disponible, está pensado para integrarse en herramientas de desarrollo o asistentes que necesiten traducir lenguaje natural a SOQL sin depender de una API remota.

Su relevancia es acotada pero clara: es un ejemplo de fine-tune de dominio empaquetado en ONNX para inferencia en el cliente, con un protocolo de salida estructurado (sobres JSON de tipo `soql`, `answer`, `clarification` o `tool_call`). El autor advierte explícitamente de que la compatibilidad con Chrome WebGPU, la precisión de ejecución real contra Salesforce y la preservación de capacidades generales no han sido establecidas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de LiquidAI/LFM3-1.7B); topología ONNX adaptada de onnx-community/LFM3-1.7B-ONNX |
| Parametros totales | 1.700 millones (1.7B) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP16 (Q4 excluido por fallar la comprobación de paridad) |
| Idiomas soportados | inglés (en) |
| Licencia | lfm1.0 (license: other, license_name: lfm1.0) |
| Formato de pesos | ONNX (FP16), paquete de despliegue para Transformers.js |

## Arquitectura y entrenamiento

El modelo parte de LiquidAI/LFM3-1.7B, un transformer de 1.700 millones de parámetros, y se ajusta mediante LoRA sobre 3.225 ejemplos preparados de Salesforce. El ajuste cubre SOQL, objetos y campos estándar, explicaciones de Salesforce y un protocolo de herramientas de metadatos en JSON para descubrir objetos personalizados y relaciones. Los metadatos reales de la organización deben ser aportados por las herramientas de la aplicación anfitriona, es decir, el modelo no los conoce por sí mismo.

El paquete distribuido es el resultado de fusionar el ajuste y exportarlo a ONNX en FP16. La topología ONNX se adaptó de onnx-community/LFM3-1.7B-ONNX, con los pesos aprendidos reajustados y las constantes RoPE corregidas para la implementación fijada de LFM3. El autor indica que la paridad numérica en FP16 en Python se superó, mientras que la cuantización Q4 falló la comprobación de paridad elegida y quedó excluida. No se detalla la composición del dataset más allá del número de ejemplos ni si hubo RLHF o DPO.

## Capacidades

- Generación de consultas SOQL a partir de lenguaje natural, con soporte para objetos y campos estándar de Salesforce.
- Explicaciones sobre conceptos, objetos y campos de Salesforce.
- Salida estructurada en sobres JSON con cuatro tipos: `soql`, `answer`, `clarification` y `tool_call`.
- Llamada a herramientas de metadatos entrenadas: `describe_object`, `find_objects`, `search_docs` y `get_limits`.
- Protocolo de descubrimiento de objetos personalizados y relaciones mediante JSON, con los metadatos aportados por la aplicación anfitriona.
- Modo de pensamiento desactivable: debe usarse la plantilla de chat exportada con `enable_thinking=false`.
- Capacidades multilingües: solo inglés declarado.
- No se documentan capacidades de visión, audio, código general ni matemáticas más allá de lo heredado del modelo base, cuyo comportamiento no ha sido validado según el autor.

## Casos de uso

- Asistente de consultas en el navegador: integrado con Transformers.js 4.3.2 y `device="webgpu"`, `dtype="fp16"`, permite generar SOQL directamente en el cliente sin enviar el esquema ni las consultas a un servidor externo.
- Herramienta de desarrollo para administradores de Salesforce: traduce peticiones en lenguaje natural a SOQL y devuelve la consulta en el sobre JSON `soql`, lista para revisión humana antes de ejecutarse.
- Descubrimiento de metadatos guiado: el modelo emite `tool_call` hacia `describe_object` o `find_objects` para que la aplicación anfitriona recupere la definición de objetos personalizados y relaciones, y luego construye la consulta con esa información.
- Generación de documentación interna: responde con el sobre `answer` a preguntas sobre objetos y campos estándar de Salesforce, útil en portales de ayuda para equipos internos.
- Flujos de aclaración: cuando la petición es ambigua, el modelo devuelve el sobre `clarification` en lugar de inventar una consulta, lo que encaja en interfaces conversacionales que necesitan confirmar antes de ejecutar.
- Comprobación de límites de la organización: mediante la herramienta `get_limits`, el asistente puede consultar restricciones antes de proponer consultas costosas, siempre que el host exponga esa herramienta.
- Búsqueda documental asistida: con `search_docs`, el modelo puede solicitar fragmentos de documentación al host para fundamentar una respuesta, adecuado en asistentes de soporte técnico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor solo reporta que la paridad numérica en FP16 en Python se superó en el modelo exportado, que Q4 falló la comprobación de paridad y que la precisión de validación a nivel de token no equivale a corrección a nivel de consulta.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 3,4 GB solo para pesos (1.700 millones de parámetros a 2 bytes), más overhead de activaciones y del runtime; el repositorio ocupa 3,6 GB.
- GPU recomendadas: no especificadas por el autor; el paquete está orientado a WebGPU en navegador, por lo que depende de la GPU del cliente compatible con WebGPU.
- Cabe en GPU de consumo: sí, en términos de memoria, en tarjetas con al menos 4-6 GB de VRAM para FP16; no se han validado modelos concretos.
- Opciones de despliegue: Transformers.js 4.3.2 con `device="webgpu"` y `dtype="fp16"`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles. La compatibilidad con Chrome WebGPU no ha sido establecida según el autor.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Formato |
|---|---|---|---|---|---|
| ravinarayanan/lfm3-1.7b-salesforce-soql-onnx-fp16 | 1,7B | no disponible | SOQL y metadatos Salesforce | lfm1.0 | ONNX FP16 |
| LiquidAI/LFM3-1.7B (base) | 1,7B | no disponible | Propósito general | lfm1.0 | safetensors y variantes |
| onnx-community/LFM3-1.7B-ONNX | 1,7B | no disponible | Propósito general, exportación ONNX | lfm1.0 | ONNX |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- La compatibilidad con Chrome WebGPU no ha sido establecida por el autor.
- La precisión de ejecución contra Salesforce no ha sido validada; la precisión de validación a nivel de token no garantiza corrección a nivel de consulta.
- La preservación de las capacidades generales del modelo base no ha sido establecida.
- El modelo solo declara inglés; no hay soporte multilingüe documentado.
- Requiere que la aplicación anfitriona aporte los metadatos reales de la organización; el modelo no los conoce.
- Debe usarse la plantilla de chat exportada con `enable_thinking=false`; ignorarlo puede degradar la salida.
- La cuantización Q4 quedó excluida por fallar la comprobación de paridad, lo que limita las opciones de reducción de memoria.
- Licencia lfm1.0: aplican los términos del modelo base LiquidAI/LFM3-1.7B; es necesario revisar el archivo LICENSE antes de uso comercial.
- Riesgo de alucinación en nombres de objetos, campos y relaciones no cubiertos por los ejemplos de entrenamiento; conviene validar las consultas generadas antes de ejecutarlas.
- El repositorio contiene solo el paquete ONNX fusionado, no el checkpoint de PyTorch ni el adaptador LoRA, lo que dificulta reproducir o continuar el ajuste.
- Todos los archivos de pesos externos son obligatorios para el funcionamiento del paquete.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ravinarayanan/lfm3-1.7b-salesforce-soql-onnx-fp16
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Licencia del modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B/blob/main/LICENSE
- Exportación ONNX de referencia: https://huggingface.co/onnx-community/LFM3-1.7B-ONNX
