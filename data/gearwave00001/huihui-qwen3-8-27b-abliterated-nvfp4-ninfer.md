# gearwave00001/Huihui-Qwen3.8-27B-abliterated-nvfp4-NInfer

## Resumen

Huihui-Qwen3.8-27B-abliterated-nvfp4-NInfer es un artefacto de inferencia publicado por el usuario gearwave00001 que contiene el modelo huihui-ai/Huihui-Qwen3.8-27B-abliterated convertido al formato propietario .ninfer de NInfer, con pesos en precisión mixta nvfp4/fp8. No se trata de un checkpoint de Transformers, ni de una distribución de safetensors, ni de un fichero GGUF: es un artefacto empaquetado exclusivamente para el runtime NInfer, orientado a GPUs Blackwell (sm120) como la RTX 5090.

El modelo subyacente es un Qwen3.8 de 27B parámetros en su variante "abliterated", es decir, con las direcciones de rechazo eliminadas mediante técnicas de abliteración aplicadas por huihui-ai sobre el modelo original de Qwen. La cuantización nvfp4 reduce el peso del repositorio a 23,7 GB, lo que permite ejecutar un modelo de 27B en GPUs de consumo con memoria de 32 GB.

La relevancia de esta ficha es doble: por un lado documenta un caso práctico de empaquetado de precisión mixta para hardware Blackwell; por otro, advierte de que el formato cerrado y la modificación abliterated condicionan fuertemente su uso en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | transformer (heredada de Qwen/Qwen3.8-27B; detalles no disponibles) |
| Parámetros totales | 27B (según denominación del modelo base) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | nvfp4 y fp8 (precisión mixta); no se ofrece GGUF, AWQ ni GPTQ |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (heredada de Qwen/Qwen3.8-27B) |
| Formato de pesos | .ninfer (artefacto propietario de NInfer); no safetensors, no GGUF |

## Arquitectura y entrenamiento

La arquitectura corresponde al modelo base Qwen/Qwen3.8-27B, del que no se proporcionan detalles en la información disponible (número de capas, tipo de atención, composición del dataset ni número de tokens de entrenamiento). Sobre esa base, huihui-ai aplicó un proceso de abliteración que elimina las direcciones de activación asociadas al rechazo, dando lugar a Huihui-Qwen3.8-27B-abliterated. Posteriormente, gearwave00001 convirtió ese modelo al formato .ninfer con cuantización mixta nvfp4/fp8, una actualización fechada el 9-12-26 para la versión "dflash" de NInfer.

La innovación técnica destacable no está en el entrenamiento sino en el empaquetado: el uso de nvfp4 (formato de coma flotante de 4 bits con bloque de escala) combinado con fp8 para determinadas capas permite reducir el repositorio a 23,7 GB y explotar los tensor cores de quinta generación de las GPUs Blackwell (sm120). No se documentan datos de RLHF, DPO ni decodificación especulativa en la información disponible.

## Capacidades

- Generación de texto y razonamiento conversacional, heredados del modelo Qwen3.8 subyacente.
- Generación de código y matemáticas: capacidades esperables en la familia Qwen3.8, aunque no se detallan en la model card.
- Multilingüismo: no confirmado; la model card no enumera idiomas.
- Tool calling y function calling: no documentado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Modo thinking: no documentado.
- Visión y audio: no documentado; el nombre del modelo no sugiere modalidad adicional.
- Efecto de la abliteración: se eliminan los rechazos del modelo original, lo que amplía el rango de respuestas generadas, incluidas las que el modelo base declinaría.

## Casos de uso

- Investigación sobre alineación y abliteración: el artefacto permite estudiar empíricamente cómo cambia el comportamiento de un modelo de 27B al eliminar las direcciones de rechazo, comparando respuestas con el modelo base original.
- Evaluación de cuantización nvfp4 en Blackwell: sirve para medir la degradación de calidad y la ganancia de throughput al pasar de fp16/bf16 a nvfp4/fp8 en una RTX 5090, con un modelo de 27B que ocupa 23,7 GB.
- Despliegue local en estaciones de trabajo con RTX 5090: al caber en 32 GB de VRAM, permite ejecutar un modelo de 27B en una sola GPU de consumo mediante el runtime NInfer.
- Generación creativa sin restricciones de contenido: la variante abliterated es adecuada para escritura de ficción, guiones o roleplay donde el modelo base aplicaría filtros de rechazo.
- Prototipado de asistentes conversacionales de dominio general: el tamaño de 27B ofrece un equilibrio entre calidad y coste de inferencia para pruebas internas.
- Benchmarking de runtimes alternativos: útil para comparar NInfer frente a vLLM, llama.cpp o TGI en el mismo hardware, siempre que exista una ruta de conversión equivalente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: 23,7 GB de pesos en disco; en VRAM se requiere al menos esa cifra más overhead de KV cache y activaciones, por lo que se recomienda un mínimo de 32 GB.
- GPU recomendadas: NVIDIA RTX 5090 (32 GB, sm120) es el objetivo declarado; cualquier GPU Blackwell con soporte sm120. No se garantiza funcionamiento en arquitecturas anteriores (Ampere, Ada) por la dependencia de nvfp4.
- GPU de consumo: sí, cabe en RTX 5090. En RTX 4090 (24 GB) el margen es insuficiente para los pesos más el contexto.
- Despliegue: exclusivamente mediante el runtime NInfer (https://github.com/Neroued/ninfer). No es compatible con vLLM, llama.cpp, Ollama ni TGI sin conversión previa.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Huihui-Qwen3.8-27B-abliterated-nvfp4-NInfer | 27B | no disponible | .ninfer (nvfp4/fp8) | Apache 2.0 | Hugging Face, solo NInfer |
| huihui-ai/Huihui-Qwen3.8-27B-abliterated | 27B | no disponible | safetensors (presumiblemente) | Apache 2.0 | Hugging Face, Transformers |
| Qwen/Qwen3.8-27B | 27B | no disponible | safetensors | Apache 2.0 | Hugging Face, Transformers |

La diferencia principal frente a las alternativas es el formato: el artefacto NInfer solo se ejecuta en su runtime, mientras que los otros dos son checkpoints estándar compatibles con el ecosistema Transformers. En cuanto a comportamiento, la variante abliterated difiere del modelo Qwen original por la ausencia de rechazos.

## Limitaciones y advertencias

- Formato cerrado: el artefacto .ninfer no es un checkpoint de Transformers ni GGUF; no puede cargarse con bibliotecas estándar ni convertirse fácilmente a otros formatos sin herramientas específicas.
- Dependencia de hardware: la cuantización nvfp4 requiere GPUs Blackwell (sm120); no funcionará en Ampere, Ada ni en GPUs de otros fabricantes.
- Abliteración: la eliminación de las direcciones de rechazo incrementa el riesgo de generar contenido dañino, sesgado o inexacto, y reduce las salvaguardas del modelo original.
- Alucinación: no se documentan evaluaciones de fidelidad; el riesgo es el habitual de un modelo de 27B sin datos de benchmark publicados.
- Idiomas: no se especifican los idiomas soportados; no se debe asumir cobertura multilingüe sin verificación.
- Contexto: se desconoce la longitud máxima de contexto efectiva en este empaquetado.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo base Qwen y la modificación abliterated pueden estar sujetos a las condiciones de Qwen; conviene revisar el LICENSE enlazado antes de desplegar.
- Mantenimiento: el repositorio tiene 2 likes y 3265 descargas, con autor único no oficial; no hay garantía de soporte ni de actualizaciones más allá de la indicada el 9-12-26.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gearwave00001/Huihui-Qwen3.8-27B-abliterated-nvfp4-NInfer
- Modelo base abliterated: https://huggingface.co/huihui-ai/Huihui-Qwen3.8-27B-abliterated
- Modelo original Qwen: https://huggingface.co/Qwen/Qwen3.8-27B
- Licencia: https://huggingface.co/Qwen/Qwen3.8-27B/blob/main/LICENSE
- Repositorio NInfer: https://github.com/Neroued/ninfer
