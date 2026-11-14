# MuXue1230/Y-QB-2B-Omini

## Resumen

Y-QB-2B-Omini es un checkpoint experimental de tipo texto desarrollado por el usuario MuXue1230, construido como un adaptador LoRA sobre el modelo base Qwen/Qwen3.5-2B-Base. A pesar del nombre "Omini", que sugiere un modelo omnicomprensivo con audio y visión, el autor aclara explícitamente que se trata de una vista previa de desarrollo centrada únicamente en texto, y que el nombre del proyecto se conserva para el modelo completo que planea publicar en el futuro. El modelo no incluye pesos base: el repositorio contiene únicamente tensores LoRA en FP32 con rango 8 y alpha 16, distribuidos en rutas externas y de memoria separadas.

La relevancia de este modelo es limitada y debe entenderse en clave de investigación temprana. El propio autor reconoce que la aceptación conductual no ha sido superada ("NOT PASSED") y que las métricas de revisión local son bajas: 13/25 en respuestas externas, 17/25 en el canal de memoria y 0/8 en trayectorias completas. Estas cifras provienen de conjuntos de retención de desarrollo reutilizados repetidamente, no de un benchmark ciego e independiente, por lo que no deben interpretarse como una evaluación rigurosa de capacidades.

El modelo está pensado para experimentación con protocolos de memoria, validación de alcance e interrupciones, usando un arnés en C# que gestiona commits de memoria y olvido. No es un modelo listo para producción ni para uso general: es un artefacto de investigación con licencia MIT sobre el adaptador, mientras que el modelo base mantiene su licencia Apache 2.0 original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (adaptador LoRA sobre Qwen/Qwen3.5-2B-Base) |
| Parametros totales | no disponible (el adaptador LoRA tiene rango 8, alpha 16; el base es de 2B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los tensores del adaptador están en FP32; el base se distribuye en BF16 no cuantizado) |
| Idiomas soportados | chino (zh) |
| Licencia | MIT para el adaptador y la documentación; Apache 2.0 para el modelo base |
| Formato de pesos | safetensors (tensores LoRA con nombres exactos, no es un directorio PEFT estándar) |

## Arquitectura y entrenamiento

El modelo se basa en Qwen/Qwen3.5-2B-Base, un transformer de 2.000 millones de parámetros en precisión BF16, revisión `b1485b2fa6dfa1287294f269f5fb618e03d52d7c`. Sobre esta base se aplica un adaptador LoRA de rango 8 y alpha 16, con tensores entrenables en FP32 organizados en dos rutas separadas: una externa y otra de memoria. Los archivos bajo `checkpoints/r21-clean/` contienen estos tensores con nombres exactos y no constituyen un modelo base autónomo ni un directorio de adaptador PEFT convencional; requieren un cargador específico y un protocolo de inferencia propio disponible en el código fuente del Space del autor.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. El autor menciona que el corpus de entrenamiento incluye atribución del NUS SMS corpus (documentada en `NOTICE.md`), pero la licencia del modelo no relicencia dicho corpus. El entrenamiento y las pruebas se ejecutan localmente. La innovación técnica destacable es el protocolo de inferencia con rutas separadas para respuestas externas y memoria, junto con un arnés en C# que gestiona validación de alcance, commits de memoria, interrupciones y olvido. La percepción y el diálogo de corta duración están acotados, y el historial eliminado no se usa como fuente de recuperación en inferencia.

## Capacidades

- Generación de texto en chino, orientada a diálogo y respuestas externas.
- Canal de memoria separado para almacenar y recuperar información entre turnos, con commits gestionados por el arnés.
- Soporte de protocolo de inferencia con rutas externas y de memoria diferenciadas.
- Validación de alcance y gestión de interrupciones mediante el arnés en C#.
- Mecanismo de olvido: el historial eliminado no se recupera como fuente de inferencia.
- Capacidades de razonamiento multi-paso limitadas y no verificadas; el autor advierte que el modelo puede perder restricciones, atribuir mal acciones y confundir planes con resultados.
- No soporta tool calling ni function calling de forma documentada.
- No soporta visión ni audio, a pesar del nombre del proyecto.
- No hay soporte multilingüe documentado más allá del chino.
- No dispone de modo "thinking" ni capacidades especiales adicionales.

## Casos de uso

- Investigación sobre protocolos de memoria en modelos de lenguaje: el modelo permite experimentar con rutas separadas de memoria y respuestas externas, usando el arnés en C# para gestionar commits y olvido. Es adecuado porque el autor ha diseñado explícitamente este mecanismo y lo documenta en `release.json`.
- Validación de alcance en agentes conversacionales: el arnés permite comprobar si el modelo respeta restricciones de alcance y gestiona interrupciones, lo que sirve para estudiar fallos de atribución de acciones en entornos controlados.
- Estudio de olvido selectivo: el modelo permite verificar que el historial eliminado no se utiliza como fuente de recuperación, un caso útil para investigar privacidad y gestión de contexto en diálogos multi-turno.
- Pruebas de evaluación conductual con conjuntos de retención: investigadores pueden replicar las métricas locales del autor (13/25, 17/25, 0/8) para comparar variantes del adaptador o protocolos de inferencia.
- Desarrollo de cargadores personalizados: dado que los tensores no son un directorio PEFT estándar, el modelo sirve como caso de prueba para implementar cargadores que respeten los nombres exactos y las dos rutas de tensores.
- Docencia sobre limitaciones de modelos pequeños: el modelo ilustra de forma concreta los fallos típicos de un adaptador LoRA de rango bajo sobre una base de 2B en tareas de memoria y razonamiento multi-paso, con métricas explícitas de fracaso.
- Experimentación con modelos base de 2B en chino: permite comparar el efecto del adaptador frente al base Qwen3.5-2B-Base en tareas de diálogo y memoria, siempre en un entorno de investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor proporciona únicamente métricas de revisión local sobre conjuntos de retención de desarrollo reutilizados, que no constituyen un benchmark ciego e independiente:

| Metrica local | Resultado |
|---|---|
| Respuestas externas | 13/25 |
| Canal de memoria | 17/25 |
| Trayectorias completas | 0/8 |
| Aceptacion conductual | NO SUPERADA |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma específica. El adaptador LoRA en FP32 es pequeño (rango 8 sobre una base de 2B), pero requiere cargar el modelo base Qwen3.5-2B-Base en BF16, que ocupa aproximadamente 4 GB de VRAM solo en pesos.
- GPU recomendadas: no disponible. Por el tamaño del base (2B), cabría en GPUs de consumo como RTX 3060 de 12 GB o RTX 4090, pero el autor no documenta requisitos ni pruebas en hardware concreto.
- Cabe en GPU de consumo: probablemente sí, dado el tamaño del base, pero no está confirmado por el autor.
- Opciones de despliegue: no se documentan vLLM, llama.cpp, Ollama ni TGI. El autor indica que el cargador y el protocolo de inferencia están en el código fuente del Space, y que las pruebas se ejecutan localmente con un arnés en C#.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Y-QB-2B-Omini | 2B (base) + LoRA r8 | no disponible | MIT (adaptador) / Apache 2.0 (base) | Hugging Face, experimental | Solo chino, aceptación conductual no superada |
| Qwen/Qwen3.5-2B-Base | 2B | no disponible | Apache 2.0 | Hugging Face | Modelo base sin adaptador; capacidades generales no evaluadas aquí |
| Alternativas de 2B comparables | no disponible | no disponible | no disponible | no disponible | No se dispone de información sobre modelos comparables en la documentación proporcionada |

## Limitaciones y advertencias

- Aceptación conductual no superada: el autor declara explícitamente "NOT PASSED" y advierte que el modelo puede perder restricciones, atribuir mal acciones, confundir planes con resultados y fallar al codificar memoria.
- Métricas de evaluación débiles y no independientes: los conjuntos de retención se han reutilizado repetidamente y no son un benchmark ciego; el éxito en el protocolo no implica corrección semántica.
- Riesgo elevado de alucinación y de errores de atribución en tareas multi-paso, reconocido por el autor.
- Idiomas: solo chino documentado; no hay soporte multilingüe verificado.
- Contexto: longitud no disponible; la percepción y el diálogo de corta duración están acotados según el autor.
- Licencia: el adaptador es MIT, pero el modelo base Qwen3.5-2B-Base se distribuye bajo Apache 2.0 y debe cumplirse por separado. La licencia del modelo no relicencia el corpus de entrenamiento (NUS SMS corpus, atribuido en `NOTICE.md`).
- Formato no estándar: los tensores no son un directorio PEFT convencional ni un modelo autónomo; requieren cargador y protocolo específicos, lo que complica su integración en pipelines estándar.
- No apto para producción: es una vista previa de desarrollo con 0 descargas y 0 likes en el momento de la consulta, sin validación externa.
- No incluye audio ni visión a pesar del nombre "Omini"; el proyecto completo está planificado pero no disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MuXue1230/Y-QB-2B-Omini
- Código fuente del Space (cargador y protocolo de inferencia): https://huggingface.co/spaces/MuXue1230/Y/tree/main
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B-Base
- Revisión del base: `b1485b2fa6dfa1287294f269f5fb618e03d52d7c`
