# peculiar-ragdoll/Tiel-Coder-35B-A3B-GGUF-MTP

## Resumen

Tiel-Coder-35B-A3B-GGUF-MTP es una cuantización dinámica en formato GGUF del modelo Ornith-1.5-35B-A3B, publicada por el usuario peculiar-ragdoll. Se trata de un modelo de arquitectura Mixture-of-Experts (MoE) orientado a programación agéntica y conversación multi-turno, con capacidad de visión (pipeline image-text-to-text). El autor aplica su propia matriz de importancia (imatrix) y una plantilla de chat propia denominada "Sharp", incrustada directamente en el archivo GGUF, que prioriza respuestas concisas frente a preguntas aclaratorias.

La relevancia de esta ficha radica en su orientación explícita a la eficiencia de tokens y al trabajo agéntico real: el autor reporta que en 25 problemas de SWE-bench-Live el modelo resuelve 12, el mismo resultado que Opus 4.6 en modo medium, y que en Claw-Eval multi-turno obtiene 67,2 frente a los 65,3 de su modelo base. A cambio, sacrifica rendimiento en conocimiento enciclopédico (73,7 en MMLU-Pro frente a 78,0 del base y 85,3 del Qwen3.6-35B-A3B original).

El repositorio incluye variantes con decodificación especulativa MTP (Multi-Token Prediction) y un conjunto amplio de cuantizaciones Unsloth Dynamic (UD), desde Q2_K_XL de 12,7 GB hasta niveles superiores de 5 bits, lo que permite desplegarlo en equipos de consumo con offloading parcial a GPU. La licencia es MIT y los idiomas declarados son inglés y chino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE), tag `qwen35moe` |
| Parametros totales | 35B (nominal, segun nombre del modelo); el campo safetensors del repo indica 446.571.248, dato no coherente con el nominal |
| Parametros activos | 3B (nominal, segun nombre A3B); no disponible el desglose exacto |
| Longitud de contexto | Hasta 262k tokens (referenciado en la model card); KV en RAM <5 GB a 262k con precisión 16-bit |
| Tipos de cuantizacion | UD-Q2_K_XL, UD-IQ3_XXS, UD-IQ3_S, UD-Q3_K_XL, UD-IQ4_XS, UD-Q4_K_S, UD-Q4_K_XL, UD-Q5_K_S y superiores |
| Idiomas soportados | Ingles (en), chino (zh) |
| Licencia | MIT |
| Formato de pesos | GGUF (llama.cpp), con variantes MLX en repositorio separado |
| Modelo base | ornith-ai/Ornith-1.5-35B-A3B |
| Tamano del repositorio | 660,6 GB |
| Pipeline | image-text-to-text (vision) |
| Decodificacion especulativa | Si, MTP (Multi-Token Prediction) integrado |
| Plantilla de chat | Sharp chat template, incrustada en el GGUF |

## Arquitectura y entrenamiento

El modelo base Ornith-1.5-35B-A3B emplea una arquitectura Mixture-of-Experts con 35B parametros totales y aproximadamente 3B activos por token, etiquetada con el tag `qwen35moe`, lo que sugiere una base derivada de la familia Qwen3.5. Esta estructura MoE es la responsable de que el modelo sea rapido incluso con offloading parcial a GPU y de que el KV cache de contexto sea reducido en RAM (menos de 5 GB para 262k tokens a 16-bit) en comparacion con un modelo denso de 27B.

Sobre el modelo base, el autor de esta ficha aplica una recuantización dinámica con su propia imatrix (matriz de importancia calibrada) y sustituye la plantilla de chat por la denominada Sharp, que favorece respuestas directas y reduce las preguntas aclaratorias. No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO en el modelo base. La innovacion tecnica destacable de esta variante es la inclusion de MTP para decodificacion especulativa, que acelera la generacion manteniendo la calidad del cuantizado.

## Capacidades

- Generacion de texto y razonamiento general, con un perfil claramente orientado a tareas practicas antes que a conocimiento enciclopedico.
- Programacion agéntica: resolucion de issues reales en bases de codigo, con edicion multi-archivo y ejecucion de comandos.
- Conversacion multi-turno de alta calidad, con puntuacion de 67,2 en Claw-Eval sobre 114 conversaciones evaluadas.
- Eficiencia de tokens: la plantilla Sharp acorta respuestas y reduce preguntas de aclaracion, lo que abarata las llamadas en pipelines agénticos.
- Capacidades de vision (pipeline image-text-to-text), heredadas del modelo base.
- Decodificacion especulativa MTP para acelerar la inferencia en llama.cpp.
- Soporte multilingue limitado a ingles y chino.
- No se documenta soporte explicito de tool calling ni function calling en la informacion disponible, aunque el perfil agéntico del modelo lo hace plausible; debe verificarse en la practica.

## Casos de uso

- Resolucion de issues en repositorios reales: el modelo esta disenado para leer un problema, localizar los archivos relevantes y aplicar un parche. Su resultado de 12/25 en SWE-bench-Live con un tiempo mediano de 8,6 minutos por intento lo hace adecuado para integrarse en un bucle agéntico de CI que proponga parches sobre los que un humano revise.
- Asistente de codigo en terminal o IDE con contexto largo: gracias a su ventana de hasta 262k tokens y a un KV cache reducido, puede mantener en contexto varios archivos y el historial de una sesion de depuracion sin agotar la RAM del equipo.
- Agentes de mantenimiento de codigo en produccion: la eficiencia de tokens de la plantilla Sharp reduce el coste por iteracion en bucles de razonamiento de varios pasos, donde cada turno adicional multiplica el gasto.
- Chatbot tecnico de soporte interno: su buena puntuacion en conversacion multi-turno (67,2 en Claw-Eval) y su tendencia a responder en lugar de preguntar lo hacen util para asistencia a desarrolladores que ya han descrito el problema y no quieren interrogatorios.
- Despliegue local en estaciones de trabajo con GPU de consumo: las variantes IQ3_XXS (13,6 GB) y IQ4_XS (18,1 GB) permiten ejecutarlo en equipos de 16 y 24 GB respectivamente, con offloading parcial, sin depender de la nube.
- Procesamiento de capturas y diagramas junto con codigo: al heredar la capacidad de vision del modelo base, puede analizar una captura de error o un diagrama de arquitectura y generar el codigo o la explicacion correspondiente.
- Prototipado rapido de herramientas internas: la licencia MIT permite incorporarlo a productos propietarios sin obligaciones de atribucion adicionales.

## Benchmarks y rendimiento

| Benchmark | Tiel-Coder 35B-A3B (4-bit) | Ornith-1.5-35B-A3B | Nail-Qwen3.6-35B-A3B | Qwen3.6-35B-A3B stock | Otros |
|---|---|---|---|---|---|
| SWE-bench-Live (aciertos/25) | 12 | 8 | 9 | 8 | Opus 4.6 medium: 12; Sonnet 5 medium: 8; Dirk (denso 27B): 15; Qwen3.8-27B: 16 |
| SWE-bench-Live (min mediana/intento) | 8,6 | no disponible | 7,2 | 5,5 | Qwen3.8-27B: 50,2; Dirk: 20,1 |
| SWE-bench-Live (min media/intento) | 12,3 | no disponible | 15,7 | no disponible | no disponible |
| Claw-Eval multi-turno (global) | 67,2 | 65,3 | 60,5 | no disponible | 114 conversaciones puntuadas por modelo |
| MMLU-Pro (4-bit) | 73,7 | 78,0 | 84,0 | 85,3 | no disponible |

Notas sobre los datos: el autor indica que la diferencia de MMLU-Pro no proviene de la cuantizacion, ya que el mismo cuantizado con la plantilla original de Ornith obtiene exactamente la puntuacion de Ornith. Los 4,3 puntos restantes se atribuyen a la plantilla Sharp, que acorta las respuestas. En Claw-Eval, Tiel mejora 3,8 puntos en calidad de respuesta y empeora 5,1 en preguntas de aclaracion respecto al base; la metrica pondera las respuestas cuatro a uno frente a las preguntas.

## Requisitos de hardware

- VRAM/RAM combinada estimada segun cuantizacion: 16 GB para IQ3_XXS (13,6 GB) e IQ3_S (14,1 GB); 24 GB para Q3_K_XL (17,2 GB), IQ4_XS (18,1 GB) y Q4_K_S (21,3 GB); 24-32 GB para Q4_K_XL (22,7 GB); 32 GB para Q5_K_S (25,3 GB).
- El autor desaconseja bajar de UD-Q4 solo para meter el modelo completo en VRAM: recomienda elegir un Q4 o superior que quepa entre RAM y VRAM y ejecutarlo con contexto de 131k-262k y KV al menos en q8_0 para codificacion agéntica.
- La columna "fits" de la tabla del autor se refiere a la RAM+VRAM combinada disponible tras descontar el sistema operativo y otros procesos.
- GPU recomendadas: no se especifican modelos concretos en la informacion disponible. La arquitectura MoE con 3B activos permite offloading parcial, por lo que tarjetas de consumo de 16 y 24 GB son viables con las cuantizaciones indicadas.
- Cabe en GPU de consumo: si, en configuraciones de 16 GB (IQ3_XXS, IQ3_S) y 24 GB (Q3_K_XL, IQ4_XS, Q4_K_S) con offloading parcial.
- Opciones de despliegue: llama.cpp (formato nativo GGUF, con soporte MTP para decodificacion especulativa); existe una version MLX en repositorio separado para Apple Silicon. No se documenta soporte de vLLM ni TGI para esta variante.
- Latencia y throughput: no se publican tokens por segundo en la informacion disponible. El autor reporta tiempos por intento en SWE-bench-Live (8,6 minutos de mediana, 12,3 de media) como proxy de velocidad en tareas agénticas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | SWE-bench-Live (de 25) | MMLU-Pro | Licencia | Formato |
|---|---|---|---|---|---|---|
| Tiel-Coder-35B-A3B-MTP | 35B MoE (3B activos) | 262k | 12 | 73,7 | MIT | GGUF, MLX |
| Ornith-1.5-35B-A3B | 35B MoE (3B activos) | no disponible | 8 | 78,0 | no disponible | safetensors (base) |
| Nail-Qwen3.6-35B-A3B | 35B MoE | no disponible | 9 | 84,0 | no disponible | GGUF |
| Qwen3.6-35B-A3B stock | 35B MoE | no disponible | 8 | 85,3 | no disponible | no disponible |
| Dirk-Qwen3.8-27B | 27B denso | no disponible | 15 | no disponible | no disponible | GGUF |

La eleccion entre Tiel y Nail es un compromiso explicito segun el autor: Tiel para codificacion agéntica y conversaciones largas que deben seguir siendo utiles; Nail para conocimiento tipo examen y razonamiento duro, con 10,3 puntos mas en MMLU-Pro pero 6,7 menos en conversacion. Frente a Dirk, el denso de 27B resuelve mas problemas (15 frente a 12) pero a un coste temporal muy superior (20,1 minutos de mediana frente a 8,6).

## Limitaciones y advertencias

- Conocimiento enciclopedico debil: 73,7 en MMLU-Pro, por debajo de su propio modelo base (78,0) y muy lejos del Qwen3.6-35B-A3B stock (85,3). El autor lo describe como "cheerfully bad at trivia" y recomienda no usarlo para tareas tipo examen.
- La plantilla Sharp reduce las preguntas aclaratorias en 5,1 puntos respecto al base. En peticiones vagas o ambiguas, el modelo tiende a actuar antes que a preguntar, lo que puede producir soluciones equivocadas en dominios mal especificados.
- Riesgo de alucinacion: no se documentan evaluaciones especificas de factualidad; el perfil de bajo conocimiento enciclopedico sugiere cautela en tareas que requieran recuperar hechos sin contexto.
- Idiomas: solo ingles y chino declarados. El rendimiento en castellano no esta evaluado y previsiblemente sera inferior.
- La cuantizacion Q2_K_XL (12,7 GB) se describe como "last resort": pierde capacidad real y tiene dificultades con codificacion agéntica.
- El campo de parametros del repo safetensors (446.571.248) es incoherente con el nominal de 35B del nombre del modelo; debe tratarse como un dato no fiable.
- Los resultados de benchmarks son mediciones del autor sobre 25 problemas de SWE-bench-Live y 114 conversaciones de Claw-Eval; son muestras pequenas y no proceden de una evaluacion independiente.
- Licencia MIT: permite uso comercial sin restricciones adicionales, pero conviene verificar la licencia del modelo base Ornith-1.5-35B-A3B, no indicada en la informacion disponible.
- Existe una variante derivada, CyberTiel, descrita como sin censura y mejorada; su comportamiento y seguridad no estan cubiertos por esta ficha.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/peculiar-ragdoll/Tiel-Coder-35B-A3B-GGUF-MTP
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Variante GGUF sin MTP: https://huggingface.co/peculiar-ragdoll/Tiel-Coder-35B-A3B-GGUF
- Variante MLX sin MTP: https://huggingface.co/peculiar-ragdoll/Tiel-Coder-35B-A3B-MLX-oQ4e
- Plantillas de chat Sharp: https://huggingface.co/peculiar-ragdoll/Qwen-Sharp-Chat-Templates
- Variante CyberTiel: https://huggingface.co/peculiar-ragdoll/Cyber-Tiel-Coder-35B-A3B-GGUF-MTP
- Modelo comparativo Nail: https://huggingface.co/peculiar-ragdoll/Nail-Qwen3.6-35B-A3B-GGUF
- Modelo comparativo Dirk: https://huggingface.co/peculiar-ragdoll/Dirk-Qwen3.8-27B-GGUF
