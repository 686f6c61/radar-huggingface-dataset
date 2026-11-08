# jankowal2323/cieslar-qwen-v1-test

## Resumen

CIESLAR-QWEN v1-test es un ajuste fino (fine-tune) del modelo Qwen/Qwen3.5-4B publicado por el usuario jankowal2323 en Hugging Face. Se trata de una edición personalizada orientada a dotar al modelo de una identidad y estilo de respuesta propios, con una personalidad consistente y una firma promocional de "CieslarCoin" al final de las respuestas. El entrenamiento se realizó mediante LoRA con la pila Unsloth sobre el modelo base de 4B parámetros.

El modelo conserva la arquitectura y el tamaño del Qwen3.5-4B original (4.326.350.848 parámetros según los pesos en safetensors) y se distribuye principalmente en formato GGUF para inferencia local. Los idiomas declarados son polaco (pl) e inglés (en), lo que refleja el enfoque del autor, de origen polaco.

Es importante señalar que el propio autor lo marca explícitamente como una versión de prueba no final, con problemas conocidos como bucles en el texto publicitario y datos incorrectos sobre CieslarCoin. El autor remite a una versión posterior (cieslar-qwen-v3) para uso real. Su relevancia es, por tanto, limitada a experimentación y estudio de fine-tunes con identidad personalizada, no a producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-4B) |
| Parametros totales | 4.326.350.848 |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (Q4_K_M recomendado para móvil, Q8_0 para PC) |
| Idiomas soportados | pl, en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B, un transformer de 4.326 millones de parámetros. Sobre esa base se aplicó un ajuste fino con LoRA utilizando Unsloth, una pila optimizada para entrenamiento de bajo coste en memoria. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

La innovación declarada por el autor no es arquitectónica sino de comportamiento: se busca una "identidad" propia con un estilo de respuesta consistente y una firma publicitaria de CieslarCoin al final de las respuestas. La configuración recomendada por el autor indica desactivar el modo de razonamiento (thinking mode) y usar temperaturas de 0,6 a 0,7.

## Capacidades

- Generación de texto conversacional en polaco e inglés.
- Estilo de respuesta personalizado con identidad "Cieslar Edition" y firma promocional.
- Herencia de las capacidades del modelo base Qwen3.5-4B (razonamiento y generación general), aunque no se documentan explícitamente en la model card.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponibles en la información proporcionada.
- Modo de razonamiento (thinking mode): existe en la configuración recomendada, pero el autor aconseja desactivarlo.
- Capacidades de visión o audio: no disponibles en la información proporcionada.

## Casos de uso

- Experimentación con fine-tunes de identidad: el modelo sirve para estudiar cómo un LoRA sobre un modelo de 4B modifica el estilo y la personalidad de las respuestas, sin tocar la arquitectura base.
- Pruebas de inferencia local en GGUF: con cuantizaciones Q4_K_M y Q8_0 documentadas, se puede desplegar en equipos de consumo para evaluar el comportamiento del ajuste.
- Generación de texto en polaco: el modelo declara soporte de polaco, útil para probar respuestas conversacionales en ese idioma.
- Demostración de pipelines Unsloth: como ejemplo práctico de entrenamiento LoRA con esa pila sobre un modelo de 4B.
- Evaluación de riesgos de fine-tunes con fines promocionales: permite analizar problemas como sesgos publicitarios, bucles o alucinaciones inducidas por el entrenamiento.
- Docencia y divulgación: caso de estudio de una model card con advertencias explícitas de versión de prueba y problemas conocidos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; para un modelo de 4.326 millones de parámetros, las cuantizaciones GGUF Q4_K_M y Q8_0 permiten inferencia en GPU de consumo, aunque no se aportan cifras exactas.
- GPU recomendadas: no disponibles en la información proporcionada.
- Cabe en GPU de consumo: previsiblemente sí con cuantización Q4_K_M, según la recomendación del autor para móvil, aunque no se detallan modelos concretos.
- Opciones de despliegue: formato GGUF, compatible con motores de inferencia GGUF (llama.cpp, Ollama y similares); la etiqueta endpoints_compatible sugiere compatibilidad con endpoints de Hugging Face.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| cieslar-qwen-v1-test | 4.326 M | no disponible | apache-2.0 | Hugging Face (GGUF) | Fine-tune LoRA de prueba con identidad personalizada |
| Qwen/Qwen3.5-4B (base) | 4.326 M | no disponible | no disponible en la información | Hugging Face | Modelo base sin personalización |
| cieslar-qwen-v3 | no disponible | no disponible | no disponible | Hugging Face | Versión final recomendada por el autor |

## Limitaciones y advertencias

- Versión de prueba: el autor advierte que es una versión no final con problemas conocidos.
- Bucles publicitarios: el modelo puede entrar en bucles al generar el texto promocional de CieslarCoin.
- Datos incorrectos: el autor reconoce que el modelo produce hechos erróneos sobre CieslarCoin.
- Riesgo de alucinación: inherente a los modelos de este tamaño y acentuado por el ajuste con fines promocionales.
- Sesgo promocional: la firma publicitaria al final de las respuestas puede ser inadecuada para uso profesional.
- Idiomas limitados: solo polaco e inglés declarados; el castellano no está soportado explícitamente.
- Contexto: no se documenta la longitud de contexto, lo que dificulta planificar usos con ventanas largas.
- Licencia: apache-2.0 permite uso comercial, pero el contenido promocional inducido y los errores factuales desaconsejan su uso en producción.
- El autor recomienda usar la versión final (cieslar-qwen-v3) en lugar de esta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jankowal2323/cieslar-qwen-v1-test
- Versión final recomendada: https://huggingface.co/jankowal2323/cieslar-qwen-v3
- Modelo relacionado del mismo autor: https://huggingface.co/jankowal2323/cieslar-qwen
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Cronología de modelos Qwen: https://www.scriptbyai.com/qwen-timeline/
