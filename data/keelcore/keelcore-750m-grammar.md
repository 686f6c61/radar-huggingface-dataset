# KeelCore/KeelCore-750M-Grammar

## Resumen

KeelCore-750M-Grammar es un adaptador LoRA de rango 16 (18,29 M de parámetros entrenables, el 2,43 % del modelo base) diseñado para corregir ortografía, gramática, mayúsculas y puntuación en inglés. No es un modelo autónomo: requiere el modelo base congelado KeelCore-750M, un encoder-decoder de 750 M de parámetros. El adaptador ocupa unos 73 MB (0,1 GB de repositorio) y se distribuye en formato propietario de KeelCore (`adapter.safetensors` + `adapter_config.json`), no en formato PEFT, por lo que se carga mediante el código del repositorio GitHub del autor.

El modelo resuelve un problema acotado y bien delimitado: la corrección de texto sin reescritura. Según la model card, las salidas quedan dentro del 1 % de la longitud de la entrada y alcanzan 94 chrF de coincidencia a nivel de carácter con el texto original, lo que indica una fuerte preservación del contenido, el tono y el significado. Al ser un encoder-decoder, lee la entrada completa antes de generar, lo que le permite copiar literalmente nombres, URLs y correos electrónicos.

Su relevancia práctica radica en el despliegue ligero: puede ejecutarse en CPU o GPU con PyTorch, o directamente en el navegador mediante ONNX Runtime Web, lo que habilita corrección local sin que el texto salga del dispositivo del usuario. Está pensado para borradores de mensajes, correos, tickets y notas cortas, no como modelo conversacional ni como asistente de instrucciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (rango 16) sobre encoder-decoder KeelCore-750M |
| Parametros totales | 18,29 M entrenables en el adaptador (2,43 % del base); base de 750 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (salida limitada a 384 tokens nuevos por defecto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | keelcore-license-1.0 (KeelCore License, Version 1.0) |
| Formato de pesos | `adapter.safetensors` + `adapter_config.json` (formato KeelCore, no PEFT); soporte ONNX Runtime Web |

## Arquitectura y entrenamiento

El adaptador se aplica sobre KeelCore-750M, un transformer encoder-decoder. La elección de encoder-decoder es deliberada: el modelo lee toda la secuencia de entrada antes de decodificar, lo que facilita la copia fiel de fragmentos exactos (nombres propios, URLs, direcciones de correo) y reduce la tendencia a parafrasear. El adaptador es un LoRA de rango 16 con 18,29 M de parámetros entrenables, lo que supone el 2,43 % de los pesos del modelo base, que permanece congelado durante el entrenamiento.

La entrada se envuelve automáticamente con la plantilla ` <text_to_rewrite> … </text_to_rewrite> </s>`, y la salida se limita por defecto a 384 tokens nuevos. Según la model card, el entrenamiento se centró casi exclusivamente en ejemplos que contenían errores, lo que explica su sesgo a editar incluso texto ya correcto. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Corrección de ortografía en inglés, incluyendo errores tipográficos comunes ("recieve" → "received", "definately" → "definitely").
- Corrección gramatical: concordancia sujeto-verbo, tiempos verbales, condicionales ("If I would have known" → "If I had known").
- Corrección de mayúsculas y puntuación, incluyendo separación de oraciones y uso de punto y coma.
- Preservación de la formulación original: no reescribe ni cambia el tono, solo elimina errores.
- Copia literal de texto exacto (URLs, correos, números de teléfono) gracias a la arquitectura encoder-decoder.
- Ejecución en CPU, GPU (PyTorch) o navegador (ONNX Runtime Web).
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No es un modelo conversacional: no responde preguntas ni sigue instrucciones contenidas en el texto.
- Monolingüe: únicamente inglés.

## Casos de uso

- Revisión de borradores de correo electrónico: el adaptador corrige gramática y puntuación manteniendo el tono y la longitud del mensaje (variación media inferior al 1 %), por lo que el usuario no tiene que releer el texto completo tras la corrección.
- Corrección local en el navegador: mediante ONNX Runtime Web, una aplicación web puede ofrecer corrección de texto sin enviar el contenido a un servidor, adecuado para entornos con requisitos de privacidad.
- Preprocesado de tickets de soporte: normalizar la ortografía y gramática de las incidencias antes de clasificarlas o indexarlas, mejorando la calidad de los embeddings y de la búsqueda posterior.
- Corrección en aplicaciones de mensajería o notas: integrado como paso previo al envío, con latencia baja al ejecutarse en CPU y un adaptador de solo 73 MB.
- Limpieza de corpus para investigación: como paso de normalización en pipelines de datos en inglés, siempre que se excluyan campos donde cada carácter deba preservarse.
- Punto de partida para investigación sobre adaptadores pequeños: el adaptador sirve como referencia para estudiar LoRA de bajo rango sobre un modelo base compartido, con una tarea bien delimitada y métricas de preservación (chrF) publicadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta métricas de preservación sobre el conjunto de validación: variación de longitud inferior al 1 % respecto a la entrada y 94 chrF de coincidencia a nivel de carácter. No se proporcionan cifras de MMLU, HumanEval, GSM8K ni de precisión de corrección (F1, exact match) frente a otros correctores.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el adaptador pesa 73 MB y el modelo base 750 M de parámetros, por lo que la inferencia completa en fp16 rondaría 1,5 GB de pesos, más overhead de activaciones.
- GPU recomendadas: no especificadas en la información disponible; cualquier GPU con suficiente memoria para el modelo base de 750 M es apta.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU consumer con 4 GB o más de VRAM, aunque el dato no está confirmado en la model card.
- Despliegue: PyTorch en CPU o GPU; ONNX Runtime Web en navegador. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Formato |
|---|---|---|---|---|---|
| KeelCore-750M-Grammar | 18,29 M (adaptador) + 750 M (base) | no disponible | Corrección gramatical EN | keelcore-license-1.0 | Safetensors propietario, ONNX |
| Modelos de corrección gramatical tipo GECToR/T5-base | no disponible | no disponible | Corrección gramatical EN | variable | variable |
| LLM generalistas (p. ej. modelos de 7B+) | 7B+ | 4K-128K | Corrección vía prompting | variable | safetensors, GGUF |

No se dispone de datos de rendimiento comparativos en la información proporcionada. La comparativa se limita a parámetros, licencia y formato; no se han publicado métricas que permitan situar KeelCore-750M-Grammar frente a correctores dedicados como GECToR o frente a LLM generalistas usados con prompting.

## Limitaciones y advertencias

- Sesgo de edición: entrenado casi exclusivamente con ejemplos erróneos, tiende a modificar texto que ya es correcto.
- Texto muy degradado: puede introducir errores nuevos en entradas gravemente corruptas.
- No apto para contenido donde cada carácter deba preservarse: código, configuración, números de versión, cifras financieras o citas literales.
- No cambia el estilo ni el tono: no hace el texto más formal, más corto ni más largo.
- Monolingüe: solo inglés; no corrige otros idiomas.
- No es conversacional: no responde preguntas ni ejecuta instrucciones presentes en el texto de entrada.
- Licencia propietaria (keelcore-license-1.0): es necesario revisar los términos antes de cualquier uso comercial; la model card no detalla las restricciones.
- Formato no estándar: requiere el código del repositorio GitHub y verifica una huella de los pesos base, rechazando cargarse sobre cualquier modelo distinto de KeelCore-750M. No es compatible con PEFT.
- Riesgo de alucinación: no evaluado en la información disponible; al ser un corrector con alta preservación (94 chrF), el riesgo de inserción de contenido nuevo parece bajo, pero no hay métricas publicadas.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema muy incipiente, sin validación independiente conocida.

## Enlaces

- Hugging Face: https://huggingface.co/KeelCore/KeelCore-750M-Grammar
- Modelo base: https://huggingface.co/KeelCore/KeelCore-750M
- Informe técnico: https://saravanan-a-r.github.io/KeelCore/
- Repositorio GitHub: https://github.com/saravanan-a-r/KeelCore
- Licencia: https://huggingface.co/KeelCore/KeelCore-750M-Grammar/blob/main/LICENSE
- Autor (LinkedIn): https://www.linkedin.com/in/saravanan-a-r/
