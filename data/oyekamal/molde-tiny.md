# oyekamal/molde-tiny

## Resumen

Molde Tiny es un modelo de lenguaje de 268 millones de parámetros obtenido por ajuste fino completo de Google Gemma 3 270M Instruct, desarrollado por Kamal (oyekamal) en el marco del proyecto Orenda. Su propósito es muy concreto: generar MoldeScript, un lenguaje de dominio específico para describir aplicaciones móviles sencillas, de forma que un teléfono Android pueda crear apps a partir de una petición en lenguaje natural sin conexión y sin plantillas predefinidas.

El modelo se distribuye principalmente en formato GGUF cuantizado (Q4_K_M, 241 MB) para ejecución en dispositivo, con un decodificador restringido por gramática (GBNF) integrado en llama.cpp que garantiza que la salida sea sintácticamente válida según el verificador de MoldeScript. El repositorio incluye además una variante opcional basada en Qwen 0.8B (504 MB) orientada a dispositivos con más memoria y mayor calidad.

Su relevancia radica en demostrar que un modelo de menos de 300 millones de parámetros, especializado en una única tarea y ejecutado íntegramente en local, puede sustituir a un conjunto de aplicaciones de propósito único en un teléfono. Es software de investigación temprana: funciona de extremo a extremo pero con tasas de acierto limitadas que el propio autor documenta con transparencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 3), ajuste fino completo del modelo instruct base |
| Parametros totales | 268.134.016 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (principal); se distribuyen ficheros GGUF; el repo contiene tambien safetensors |
| Idiomas soportados | Ingles (principal); urdu romanizado y peticiones mixtas de forma limitada |
| Licencia | Gemma (license: other, license_name: gemma) |
| Formato de pesos | GGUF y safetensors |
| Modelo base | google/gemma-3-270m-it |
| Tamano del repositorio | 11,7 GB |
| Dataset de entrenamiento | oyekamal/molde-data |
| Libreria | gguf |

## Arquitectura y entrenamiento

El modelo parte de Gemma 3 270M Instruct y se somete a un ajuste fino completo (no LoRA) sobre el dataset `oyekamal/molde-data`, compuesto por pares de peticiones en lenguaje natural y programas MoldeScript. La arquitectura subyacente es un transformer decoder-only de la familia Gemma 3, con 268 millones de parámetros, pensado para ejecución en dispositivo. No se documentan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo fases de RLHF o DPO.

La innovación técnica principal no reside en el modelo sino en el sistema que lo rodea: un decodificador restringido por gramática (GBNF) ejecutado sobre llama.cpp (build b12144) que fuerza la salida a ser un programa MoldeScript válido según su verificador. El proyecto está en una ronda de entrenamiento en curso (round 4) que cambia el paradigma de edición: en lugar de reescribir el programa completo, el modelo genera instrucciones cortas de edición contra líneas numeradas. Según el autor, esta ronda obtiene 141 de 296 cambios forzados correctos frente a 43 de la ronda 3, aunque el resultado no está confirmado dentro de la aplicación ni liberado en este repositorio.

## Capacidades

- Generación de programas MoldeScript a partir de una petición en lenguaje natural, con salida forzada a ser sintácticamente válida por gramática.
- Generación de interfaces de usuario para aplicaciones móviles sencillas (listas, formularios, gráficos básicos).
- Edición de programas existentes mediante reescritura completa del programa actualizado (ronda 3) o instrucciones de edición por líneas (ronda 4, no liberada).
- Funcionamiento completamente offline en dispositivo, sin envío de datos a servidores.
- Soporte de conversación multi-turno mediante plantilla de chat de Gemma (`<start_of_turn>`).
- Capacidad de solicitar aclaraciones cuando la petición es ambigua (documentado en la app).
- Multilingüismo limitado: inglés como idioma principal; urdu romanizado y peticiones mixtas con peor rendimiento por escasez de datos.
- No se documenta soporte de tool calling, function calling, agentes, visión ni audio en la información disponible.

## Casos de uso

- Creación de aplicaciones móviles sin conexión: un usuario describe en lenguaje natural la app que quiere (por ejemplo, un registro de lectura con gráfico de páginas) y el modelo genera el programa MoldeScript que la app Android interpreta y ejecuta, todo en local.
- Privacidad por diseño en dispositivos personales: al ejecutarse íntegramente en el teléfono, los datos del usuario (notas, registros, listas) nunca salen del dispositivo, lo que lo hace adecuado para aplicaciones sensibles.
- Prototipado rápido de interfaces: desarrolladores pueden generar esqueletos de UI funcionales en segundos (unos 2 s por app nueva en CPU de portátil con 4 hilos) para iterar sobre ideas antes de escribir código a mano.
- Educación y aprendizaje de DSL: sirve como ejemplo práctico de cómo un modelo pequeño más un decodificador restringido por gramática puede generar código válido en un lenguaje de dominio específico, útil en cursos de IA aplicada.
- Edición asistida de aplicaciones existentes: el usuario pide cambios sobre una app ya generada (por ejemplo, añadir un campo o modificar un gráfico) y el modelo reescribe el programa; en la ronda 3 acierta 14 de 40 cambios pequeños, con peor rendimiento en programas largos.
- Investigación sobre modelos en dispositivo: proporciona una base reproducible (con TRAINING.md y el dataset público) para estudiar ajuste fino completo de modelos de menos de 300 M de parámetros en tareas únicas y evaluar el equilibrio entre tamaño, latencia y calidad.
- Despliegue en entornos con recursos muy limitados: el fichero Q4_K_M de 241 MB cabe en teléfonos con 3-4 GB de memoria y puede ejecutarse con llama.cpp en CPU, lo que lo hace viable en hardware de gama baja.

## Benchmarks y rendimiento

Los datos proceden de las pruebas propias del autor sobre los ficheros Q4_K_M con decodificación greedy. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

| Metrica | Resultado |
|---|---|
| Programa valido en 149 peticiones reservadas (ronda 3 Gemma) | 90,6% |
| App exactamente como se pidio, 407 peticiones nuevas (ronda 3 Gemma) | 37% |
| App al menos del tipo correcto, mismas 407 peticiones | 71% |
| Cambios pequenos, 40 casos: ronda 3 Gemma | 14 de 40 correctos |
| Cambios pequenos, 40 casos: Qwen 0.8B (ronda 4, pass 1) | 22 de 40 correctos (aproximadamente el doble de tamano y mas lento) |
| Velocidad en CPU de portatil, 4 hilos | ~2 s por app nueva; 5-6 s por cambio pequeno |
| Cambios forzados, ronda 4 en curso (no liberada) | 141 de 296 (frente a 43 de la ronda 3) |

El 90,6% mide validez sintáctica (el programa pasa el verificador de MoldeScript), no corrección funcional. Las cifras de 37% y 71% son las que miden si la app hace lo pedido. No se han medido tiempos en un teléfono real.

## Requisitos de hardware

- VRAM/memoria estimada: el fichero Q4_K_M ocupa 241 MB y está pensado para teléfonos con 3-4 GB de memoria; la variante Qwen 0.8B ocupa 504 MB y requiere unos 6 GB.
- GPU recomendadas: no se especifican; el modelo está diseñado para CPU y ejecución en dispositivo.
- GPU de consumo: cabe holgadamente en cualquier GPU de consumo moderna, aunque no es el objetivo del proyecto.
- Opciones de despliegue: llama.cpp (build b12144 o superior, con soporte de gramáticas GBNF), aplicación Android oficial (v0.3.0, arm64-v8a y x86_64), y cualquier runtime compatible con GGUF.
- Latencia y throughput: aproximadamente 2 s por app nueva y 5-6 s por cambio pequeño en CPU de portátil con 4 hilos; sin mediciones en teléfono.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Molde Tiny (Gemma 270M) | 268 M | no disponible | Generacion de apps en MoldeScript, on-device | Gemma | GGUF y safetensors en Hugging Face |
| Molde Qwen 0.8B (variante del mismo proyecto) | ~800 M | no disponible | Misma tarea, mayor calidad y lentitud | segun modelo base Qwen | GGUF en el mismo repositorio |
| google/gemma-3-270m-it | 270 M | no disponible | Modelo instruct generalista | Gemma | Hugging Face (con acceso restringido) |

La comparación con modelos generalistas de tamaño similar no es directa, ya que Molde Tiny está especializado en una única tarea y no se han publicado evaluaciones en benchmarks estándar que permitan situarlo frente a alternativas. No se dispone de datos de otros modelos especializados en generación de DSL o UI en este rango de tamaño.

## Limitaciones y advertencias

- Alrededor de 6 de cada 10 peticiones nuevas no producen exactamente la app solicitada.
- Las peticiones largas con muchos detalles pierden parte de las especificaciones.
- Las peticiones que el lenguaje no puede expresar (entrada de voz, internet, juegos) a veces se generan como si fueran posibles.
- Los cambios pequeños fallan con frecuencia: la ronda 3 acierta 14 de 40, y los cambios sobre programas largos fallan más.
- Las apps generadas tienen un aspecto más simple que las escritas a mano.
- El inglés funciona mejor; el urdu romanizado y las peticiones mixtas rinden peor por escasez de datos de entrenamiento.
- No se ha medido la velocidad en un teléfono real; las cifras proceden de un portátil.
- La licencia Gemma impone restricciones de uso comercial; debe revisarse el enlace de términos antes de cualquier despliegue en producción.
- Es software de investigación temprana: el propio autor advierte que comete muchos errores y que los resultados de la ronda 4 no están confirmados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/oyekamal/molde-tiny
- Dataset: https://huggingface.co/datasets/oyekamal/molde-data
- Codigo, lenguaje y app: https://github.com/Orenda-Project/molde
- Informe de fallos (failhunt): https://github.com/Orenda-Project/molde/blob/failhunt/failhunt/REPORT.md
- Guia de entrenamiento: https://github.com/Orenda-Project/molde/blob/main/TRAINING.md
- Demo en navegador (apps de ejemplo escritas a mano): https://orenda-project.github.io/molde/demo/
- Release Android v0.3.0: https://github.com/Orenda-Project/molde/releases/tag/v0.3.0
- Modelo base: https://huggingface.co/google/gemma-3-270m-it
- Terminos de licencia Gemma: https://ai.google.dev/gemma/terms
