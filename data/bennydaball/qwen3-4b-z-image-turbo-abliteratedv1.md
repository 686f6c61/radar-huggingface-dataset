# BennyDaBall/Qwen3-4b-Z-Image-Turbo-AbliteratedV1

## Resumen
Qwen3-4b-Z-Image-Turbo-AbliteratedV1 es una version "abliterada" (con los mecanismos de rechazo suprimidos) del codificador de texto de Qwen3-4B empleado por el modelo de generacion de imagenes Z-Image-Turbo de Tongyi-MAI (Alibaba). Lo publica BennyDaBall, un autor independiente que aplica la metodologia heretic de p-e-w mediante ablacion de direcciones de activacion, con el objetivo declarado de eliminar tanto los rechazos en la generacion de imagenes como los rechazos generales del modelo de lenguaje.

El modelo conserva la arquitectura transformer densa de Qwen3 con aproximadamente 4.022 millones de parametros (4,02 B) y se distribuye en safetensors y en una bateria de cuantizaciones GGUF que van de F16 (8,05 GB) a Q2_K (1,67 GB). Su funcion practica es la de text encoder sustituible ("drop-in") en pipelines de difusion que esperan el encoder de Z-Image-Turbo, de modo que el usuario pueda obtener imagenes que el encoder original rechazaria por sus filtros de seguridad.

Es relevante ahora porque el ecosistema de generacion de imagenes open source depende cada vez mas de encoders de lenguaje de gran tamano (Qwen3 en este caso) y la comunidad demanda variantes sin censura para investigacion sobre alineacion, red teaming y usos creativos sin restricciones. La licencia Apache 2.0 facilita su redistribucion, aunque el contenido generado queda bajo responsabilidad del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3), usado como text encoder de Z-Image-Turbo |
| Parametros totales | 4.022.468.096 (4,02 B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q4_K_S, Q3_K_M, Q2_K (GGUF); safetensors en precision original |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento
La base es el modelo Qwen3-4B de Alibaba, un transformer denso decoder-only con atencion por cabezas y mecanismos propios de la familia Qwen3 (no se dispone en la informacion proporcionada de detalles sobre atencion lineal, decodificacion especulativa ni configuracion exacta de capas). Sobre esa base, el autor aplica el metodo heretic de p-e-w: ablacion de las direcciones de activacion asociadas al comportamiento de rechazo, ejecutada en 1000 ensayos dirigidos simultaneamente a los rechazos de generacion de imagenes y a los rechazos generales del modelo de lenguaje.

El autor reporta una divergencia KL de 0,0004 respecto al modelo original, lo que sugiere que la distribucion de salida se mantiene practicamente intacta fuera de las regiones de rechazo, y una tasa de rechazo de 4/100 en sus pruebas internas de estres ("torture tests"). No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO posteriores; el proceso es de edicion de pesos, no de reentrenamiento.

## Capacidades
- Generacion de texto conversacional como modelo de lenguaje Qwen3-4B, con el comportamiento de rechazo suprimido.
- Actua como codificador de texto ("text encoder") para el pipeline de generacion de imagenes Z-Image-Turbo de Tongyi-MAI.
- Acepta prompts que el encoder original rechazaria, tanto en el dominio de generacion de imagenes como en el conversacional general.
- Compatibilidad declarada con endpoints ("endpoints_compatible" en los tags de Hugging Face).
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Soporte de tool calling, function calling y agentes multi-paso: no disponible en la informacion proporcionada.
- Capacidades especiales (modo thinking, vision, audio): no disponible en la informacion proporcionada.

## Casos de uso
- Investigacion sobre alineacion y seguridad: permite estudiar como se comporta un encoder de Qwen3-4B sin capas de rechazo, comparando su distribucion (KL 0,0004) con la del modelo original para medir el coste real de la ablacion.
- Red teaming de filtros de seguridad: sirve para probar la robustez de pipelines de moderacion de contenido frente a un encoder que no bloquea prompts sensibles.
- Generacion de imagenes sin restricciones en entornos controlados: sustitucion directa del encoder de Z-Image-Turbo en flujos de difusion locales, gracias a su naturaleza drop-in y a las cuantizaciones GGUF de 1,67 a 8,05 GB.
- Despliegue en hardware de consumo: las versiones Q4_K_M (2,50 GB) y Q3_K_M (2,08 GB) permiten ejecutar el encoder en GPUs consumer de 8 GB o menos junto al modelo de difusion.
- Creacion artistica y experimental: escritores y artistas que necesitan prompts no filtrados para explorar estilos y tematicas que los encoders censurados bloquean.
- Evaluacion comparativa de cuantizaciones: la bateria GGUF (F16 a Q2_K) permite medir la degradacion de calidad del encoder en pipelines de imagen a distintos niveles de compresion.
- Integracion en herramientas de inferencia local: al estar en GGUF, encaja en llama.cpp y entornos compatibles con endpoints, facilitando prototipado rapido.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. El autor solo reporta dos metricas internas:

| Metrica | Valor reportado |
|---|---|
| Divergencia KL respecto al original | 0,0004 |
| Tasa de rechazo en pruebas de estres | 4/100 |

No hay datos de MMLU, HumanEval, GSM8K ni de calidad de imagen (FID, CLIP score) en la informacion proporcionada.

## Requisitos de hardware
- VRAM estimada para inferencia: aproximadamente 2,5 GB con Q4_K_M, 3,3 GB con Q6_K, 4,3 GB con Q8_0 y 8,1 GB con F16 (solo pesos; anadir overhead de contexto y del pipeline de difusion).
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM para cuantizaciones bajas; A100 o H100 no son necesarias para el encoder, aunque pueden usarse en pipelines de imagen a gran escala.
- Cabe en GPU consumer: si, en tarjetas como RTX 3060 (12 GB), RTX 4060 Ti (16 GB), RTX 4070/4080/4090 y equivalentes; las versiones Q2_K y Q3_K_M caben incluso en GPUs de 4-6 GB.
- Opciones de despliegue: llama.cpp y entornos compatibles con GGUF; el tag "endpoints_compatible" sugiere soporte en plataformas de inferencia con API compatible. No se confirma soporte de vLLM, TGI u Ollama en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3-4b-Z-Image-Turbo-AbliteratedV1 | 4,02 B | no disponible | Apache 2.0 | safetensors, GGUF | Encoder abliterado, KL 0,0004, rechazo 4/100 |
| Tongyi-MAI/Z-Image-Turbo (original) | no disponible | no disponible | no disponible | no disponible | Encoder original con filtros de rechazo intactos |
| Qwen3-4B (base de Alibaba) | 4 B | no disponible | Apache 2.0 | safetensors, GGUF | Modelo de lenguaje general sin modificacion |
| Z-Image-Engineer-V2.5 (mismo autor) | no disponible | no disponible | no disponible | no disponible | Variante previa orientada a ingenieria de prompts |

La comparativa se limita a estos modelos porque la informacion proporcionada no incluye datos de rendimiento de las alternativas.

## Limitaciones y advertencias
- La ablacion elimina los rechazos, por lo que el modelo puede generar contenido danino, ilegal o sexualmente explicito; el autor declina toda responsabilidad sobre los resultados.
- La tasa de rechazo residual es de 4/100 segun pruebas internas del autor, no de terceros; no hay validacion independiente.
- La divergencia KL de 0,0004 la reporta el propio autor y no se ha verificado externamente; puede haber degradacion sutil en tareas fuera de las pruebas realizadas.
- No hay informacion sobre sesgos, idiomas soportados ni rendimiento en tareas de razonamiento o codigo.
- La licencia Apache 2.0 permite uso comercial, pero el contenido generado puede infringir leyes locales; el usuario es responsable de su cumplimiento.
- Es un encoder de texto para generacion de imagenes, no un modelo de difusion completo; requiere el pipeline Z-Image-Turbo para producir imagenes.
- El modelo se actualizo por ultima vez en noviembre de 2026; verificar la version antes de desplegar en produccion.

## Enlaces
- Hugging Face: https://huggingface.co/BennyDaBall/Qwen3-4b-Z-Image-Turbo-AbliteratedV1
- Modelo base: https://huggingface.co/Tongyi-MAI/Z-Image-Turbo
- Variante previa: https://huggingface.co/BennyDaBall/Qwen3-4b-Z-Image-Engineer-V2.5
- Variante original: https://huggingface.co/BennyDaBall/qwen3-4b-Z-Image-Engineer
- Perfil del autor en X: https://x.com/BennyDaBall_OG
- Ko-fi del autor: https://ko-fi.com/bennydaball
- GGUF F16: https://huggingface.co/BennyDaBall/Qwen3-4b-Z-Image-Turbo-AbliteratedV1/blob/main/Z-Image-AbliteratedV1.f16.gguf
- GGUF Q8_0: https://huggingface.co/BennyDaBall/Qwen3-4b-Z-Image-Turbo-AbliteratedV1/blob/main/Z-Image-AbliteratedV1.Q8_0.gguf
- GGUF Q6_K: https://huggingface.co/BennyDaBall/Qwen3-4b-Z-Image-Turbo-AbliteratedV1/blob/main/Z-Image-AbliteratedV1.Q6_K.gguf
- GGUF Q5_K_M: https://huggingface.co/BennyDaBall/Qwen3-4b-Z-Image-Turbo-AbliteratedV1/blob/main/Z-Image-AbliteratedV1.Q5_K_M.gguf
- GGUF Q4_K_M: https://huggingface.co/BennyDaBall/Qwen3-4b-Z-Image-Turbo-AbliteratedV1/blob/main/Z-Image-AbliteratedV1.Q4_K_M.gguf
- GGUF Q4_K_S: https://huggingface.co/BennyDaBall/Qwen3-4b-Z-Image-Turbo-AbliteratedV1/blob/main/Z-Image-AbliteratedV1.Q4_K_S.gguf
- GGUF Q3_K_M: https://huggingface.co/BennyDaBall/Qwen3-4b-Z-Image-Turbo-AbliteratedV1/blob/main/Z-Image-AbliteratedV1.Q3_K_M.gguf
- GGUF Q2_K: https://huggingface.co/BennyDaBall/Qwen3-4b-Z-Image-Turbo-AbliteratedV1/blob/main/Z-Image-AbliteratedV1.Q2_K.gguf
