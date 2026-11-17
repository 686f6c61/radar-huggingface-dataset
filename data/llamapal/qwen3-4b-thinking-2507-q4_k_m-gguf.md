# LlamaPal/Qwen3-4B-Thinking-2507-Q4_K_M-GGUF

## Resumen
Este repositorio contiene una cuantización GGUF de tipo Q4_K_M del modelo Qwen3-4B-Thinking-2507, desarrollado originalmente por Alibaba Qwen. El archivo es un espejo sin modificar del publicado por Unsloth en su repositorio GGUF, con el mismo hash SHA-256, y está empaquetado por LlamaPal para su descarga directa desde su aplicación de chat offline para Android. El propósito del repositorio no es introducir cambios en el modelo, sino servir como origen de distribución del binario que consume dicha aplicación.

El modelo base es un transformer denso de 4.022.468.096 parámetros (aproximadamente 4B) con modo de razonamiento explícito ("thinking"), orientado a matemáticas, lógica y generación de código. La cuantización Q4_K_M reduce el peso a 2,5 GB, un tamaño viable para ejecución en dispositivos móviles con llama.cpp, que es precisamente el caso de uso que motiva esta ficha.

La relevancia práctica es doble: por un lado, demuestra que un modelo de razonamiento de 4B puede ejecutarse íntegramente en un teléfono Android sin conexión; por otro, al ser una copia byte a byte de una cuantización de referencia, sirve como punto de verificación de integridad para quien quiera desplegar el mismo binario en otros entornos llama.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Qwen3-4B-Thinking-2507); pesos en formato GGUF para llama.cpp |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q4_K_M (esta ficha); el repositorio de origen Unsloth ofrece otras variantes GGUF |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (archivo `Qwen3-4B-Thinking-2507-Q4_K_M.gguf`, 2,5 GB, SHA-256 `ddd52e18200baab281c5c46f70d544ce4d4fe4846eab1608f2fff48a64554212`) |

## Arquitectura y entrenamiento
El repositorio no documenta la arquitectura interna ni el proceso de entrenamiento del modelo base; esa información corresponde a la model card de Qwen/Qwen3-4B-Thinking-2507, que no se ha incluido en la información proporcionada. Lo que sí consta es que se trata de un transformer denso de 4.022.468.096 parámetros y que el modelo base pertenece a la familia Qwen3 en su variante "Thinking", con razonamiento paso a paso expuesto de forma explícita.

La única transformación aplicada en este repositorio es la cuantización a Q4_K_M mediante el ecosistema llama.cpp, tomada de Unsloth. La model card menciona el uso de "imatrix" entre las etiquetas del repositorio, lo que sugiere que la cuantización se calibró con una matriz de importancia, aunque no se detalla el dataset de calibración ni los parámetros exactos del proceso. No se dispone de datos sobre tokens de entrenamiento, composición del dataset ni fases de RLHF o DPO.

## Capacidades
- Razonamiento explícito paso a paso: el modelo base está diseñado para mostrar su cadena de pensamiento antes de la respuesta final.
- Matemáticas y lógica: la model card describe mejoras notables en matemáticas y lógica respecto a versiones anteriores de la familia.
- Generación de código: capacidad propia de la familia Qwen3, aunque no se detallan benchmarks en la información disponible.
- Conversación multi-turno: etiquetado como "conversational" en el repositorio.
- Ejecución offline en Android: el binario está pensado para funcionar sin red ni cuenta de usuario mediante la aplicación LlamaPal.
- Compatibilidad con llama.cpp: al ser un GGUF estándar, carga en llama.cpp y en cualquier aplicación construida sobre él.
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multimodales (visión, audio): no disponibles; el modelo base es de texto.
- Idiomas: no disponible en la información proporcionada.

## Casos de uso
- Asistente personal offline en Android: descarga única del GGUF de 2,5 GB y uso posterior sin conexión, sin cuentas ni telemetría, adecuado para entornos con conectividad intermitente o requisitos de privacidad estrictos.
- Razonamiento matemático en movilidad: resolución de problemas paso a paso con la cadena de pensamiento visible, útil para estudiantes o técnicos que necesitan verificar el razonamiento sin depender de la nube.
- Verificación de integridad de artefactos: el hash SHA-256 publicado permite comprobar que un binario desplegado en producción coincide exactamente con la cuantización de referencia de Unsloth.
- Prototipado rápido en llama.cpp: al ser un GGUF estándar, sirve para validar pipelines de inferencia local en escritorio antes de escalar a otras cuantizaciones o tamaños.
- Sustitución de un modelo mayor en entornos con poca VRAM: con 2,5 GB en disco y un footprint de inferencia reducido, encaja en GPUs de gama baja y en CPU.
- Base para aplicaciones de chat integradas: la etiqueta "conversational" y el formato GGUF facilitan su integración en clientes de chat de escritorio o móvil construidos sobre llama.cpp.
- Evaluación comparativa de cuantizaciones: al existir la misma cuantización en el repositorio de Unsloth, permite contrastar calidad y latencia frente a otras variantes (Q5, Q8) del mismo modelo base.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada: el archivo pesa 2,5 GB; la inferencia con llama.cpp requiere además espacio para el contexto KV, por lo que conviene reservar varios cientos de MB adicionales según la longitud de contexto configurada. No se dispone de cifras oficiales de VRAM pico.
- GPU de escritorio: cabe en GPUs consumer con 4 GB o más de VRAM; con 6-8 GB se puede mantener contexto amplio y offload completo. No se dispone de datos específicos para A100, H100 o RTX 4090 en la información proporcionada.
- GPU consumer: sí, en tarjetas de gama media con al menos 4 GB de VRAM; también es viable en CPU.
- Móvil: es el destino principal; la aplicación LlamaPal lo ejecuta en Android, aunque no se especifican los requisitos mínimos de RAM del dispositivo.
- Opciones de despliegue: llama.cpp y cualquier aplicación construida sobre él (la model card cita explícitamente LlamaPal y llama.cpp). No se confirma soporte de vLLM, TGI u Ollama en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| LlamaPal/Qwen3-4B-Thinking-2507-Q4_K_M-GGUF (este) | 4,02B | no disponible | GGUF Q4_K_M, 2,5 GB | Apache 2.0 | Espejo byte a byte de Unsloth, orientado a Android offline |
| unsloth/Qwen3-4B-Thinking-2507-GGUF | 4,02B | no disponible | GGUF (varias cuantizaciones) | Apache 2.0 | Origen del binario; ofrece más variantes de cuantización |
| Qwen/Qwen3-4B-Thinking-2507 | 4,02B | no disponible | safetensors | Apache 2.0 | Modelo base sin cuantizar; requiere más VRAM |

No se dispone de datos de rendimiento comparado entre estas opciones en la información proporcionada.

## Limitaciones y advertencias
- Este repositorio no aporta información propia sobre sesgos del modelo base; deben consultarse en la model card original de Qwen.
- Riesgo de alucinación inherente a los modelos de lenguaje; el modo "thinking" expone el razonamiento, pero no garantiza su corrección.
- La cuantización Q4_K_M introduce pérdida de precisión respecto a los pesos originales en safetensors; el impacto exacto no está documentado en la información disponible.
- No se especifican los idiomas soportados; conviene validar el comportamiento en castellano antes de usarlo en producción.
- No se dispone de la longitud de contexto soportada, dato crítico para planificar aplicaciones con ventanas largas.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar el texto completo en el archivo LICENSE del repositorio y en la licencia del modelo base.
- El repositorio tiene cero descargas y cero likes en el momento de la consulta; es un espejo reciente sin validación comunitaria independiente.
- La model card incluye enlaces de afiliación o campaña hacia Google Play; no deben interpretarse como aval técnico del binario.
- El rendimiento en dispositivos móviles depende del SoC, la RAM disponible y la longitud de contexto; no hay cifras oficiales de latencia.

## Enlaces
- Repositorio en Hugging Face: https://huggingface.co/LlamaPal/Qwen3-4B-Thinking-2507-Q4_K_M-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Thinking-2507
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3-4B-Thinking-2507/blob/main/LICENSE
- Repositorio GGUF de origen (Unsloth): https://huggingface.co/unsloth/Qwen3-4B-Thinking-2507-GGUF
- Commit de origen del binario: https://huggingface.co/unsloth/Qwen3-4B-Thinking-2507-GGUF/tree/f40adb104d4d44aee52f398b60597c5866a973a3
- Aplicación LlamaPal en Google Play: https://play.google.com/store/apps/details?id=com.vishistv.llamapal
- Sitio web de LlamaPal: https://llamapal.cc/
- Instagram de LlamaPal: https://www.instagram.com/llamapalhq/
