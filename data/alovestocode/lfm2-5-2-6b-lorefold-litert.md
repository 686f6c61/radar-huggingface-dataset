# Alovestocode/LFM2.5-2.6B-Lorefold-LiteRT

## Resumen

LFM2.5-2.6B-Lorefold-LiteRT es un ajuste fino (fine-tune) del modelo LiquidAI/LFM2.5-2.6B, desarrollado por el usuario Alovestocode y publicado en Hugging Face. Se trata de un modelo especializado en roleplay conversacional para adultos, empaquetado en formato LiteRT-LM para su ejecución en dispositivos moviles (on-device). El modelo planifica brevemente en el canal de "thinking" de LiteRT-LM antes de escribir la respuesta del personaje, lo que le permite mantener coherencia narrativa con un presupuesto de razonamiento acotado.

El modelo base LFM2.5-2.6B emplea una arquitectura hibrida de convoluciones cortas y atencion, con 2.600 millones de parametros. Este fine-tune se ha entrenado con LoRA (rango 32) sobre 2.200 respuestas provenientes de 171 chats de roleplay generados por modelos en la nube, e incluye el razonamiento previo en 2.041 de esas respuestas. El resultado es un modelo que cabe en un telefono, con un archivo int8 de aproximadamente 2,8 GB y una ventana de contexto de 8.192 tokens.

Su relevancia radica en que demuestra la viabilidad de ejecutar modelos de roleplay de calidad aceptable completamente en local, sin conexion a la nube, con latencias de 45 a 64 segundos por respuesta en CPU de portatil. Es el modelo on-device de la aplicacion Lorefold y esta pensado exclusivamente para contenido de roleplay adulto entre personajes adultos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida de convoluciones cortas y atencion (LFM2.5) |
| Parametros totales | 2.600 millones (modelo base) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 8.192 tokens |
| Tipos de cuantizacion | int8 dinamica (archivo `.litertlm`); el modelo base en bf16 tambien existe |
| Idiomas soportados | Ingles (en) |
| Licencia | LFM Open License v1.0 (lfm1.0) |
| Formato de pesos | LiteRT-LM (`.litertlm`), int8; pesos base en safetensors via modelo original |
| Tamano del archivo | 2.796.075.632 bytes (~2,8 GB) |
| SHA-256 | `3a2eb5c4937aa40de691e3ec26dd1125de199a5a8dcb7b1962f84056fa9e432c` |
| Version minima de runtime | LiteRT-LM 0.19 o superior |
| Backend probado | CPU (laptop); GPU de telefono no medida |

## Arquitectura y entrenamiento

El modelo base LFM2.5-2.6B, desarrollado por LiquidAI, emplea una arquitectura hibrida que combina convoluciones cortas con mecanismos de atencion. Esta mezcla reduce el coste computacional en inferencia respecto a un transformer puro de atencion completa, lo que facilita su despliegue en dispositivos con recursos limitados. El fine-tune conserva esta arquitectura y solo modifica los pesos mediante LoRA.

El entrenamiento consistio en un LoRA de rango 32 aplicado a todas las capas lineales, durante 2 epocas con tasa de aprendizaje 1e-4, tras lo cual los pesos se fusionaron con el modelo base antes de la conversion a LiteRT-LM. Los datos de entrenamiento son 2.200 respuestas extraidas de 171 chats de roleplay ejecutados por el autor en la aplicacion Lorefold; las respuestas fueron escritas por modelos en la nube de mayor tamano, y 2.041 de ellas incluyen el razonamiento que el modelo genero antes de responder. El entrenamiento ensena tanto ese razonamiento como la respuesta final; la tarjeta de personaje, el historial de la historia y los turnos del usuario se usan solo como contexto. Los prompts siguen el formato on-device de Lorefold (tarjeta de personaje, persona, notas de memoria, ultimos turnos) truncados a 8.192 tokens. Se aplico un filtro de seguridad: un clasificador Qwen3.5-9B reviso cada tarjeta de personaje y solo se conservaron las que juzgo claramente adultas (178 tarjetas), descartando ejemplos que mencionaran ninos o edades escolares.

Una innovacion practica destacable es el uso del canal de "thinking" de LiteRT-LM con un presupuesto configurable (768 tokens en las pruebas), que permite al modelo planificar brevemente antes de responder. Ademas, la arquitectura hibrida implica que en LiteRT-LM una nueva conversacion sobre un motor que ya ha ejecutado otra puede heredar el estado de convolucion de la conversacion anterior; por ello la aplicacion Lorefold abre un motor nuevo para cada conversacion.

## Capacidades

- Generacion de texto conversacional orientada a roleplay: interpreta personajes descritos en tarjetas y mantiene coherencia con el historial de la conversacion.
- Modo "thinking" con presupuesto de tokens configurable: planifica brevemente antes de escribir la respuesta del personaje.
- Escritura de escenas explicitas entre adultos (contenido para adultos).
- Manejo de contexto multi-turno de hasta 8.192 tokens, incluyendo tarjeta de personaje, persona, notas de memoria y turnos recientes.
- Inferencia on-device en CPU mediante LiteRT-LM, sin necesidad de conexion a la nube.
- Capacidad multilingue limitada al ingles.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso agentico.
- No se documenta soporte de vision ni audio.

## Casos de uso

- Aplicacion de roleplay movil (Lorefold): el modelo es el motor on-device de la app, gestionando conversaciones con personajes definidos por tarjeta y manteniendo coherencia narrativa gracias a su contexto de 8.192 tokens y al canal de planificacion breve.
- Roleplay local sin conexion: usuarios que quieren conversar con personajes sin enviar datos a servidores externos; el modelo cabe en un telefono y funciona en CPU.
- Prototipado de personajes conversacionales: desarrolladores que necesitan probar tarjetas de personaje y flujos narrativos en local antes de desplegar en la nube, con un coste de iteracion bajo.
- Investigacion sobre fine-tuning de modelos pequenos para roleplay: el modelo sirve como referencia de como un LoRA de rango 32 sobre 2.200 respuestas puede mejorar la adherencia al personaje y reducir la longitud del razonamiento (de 1.996 a 505 caracteres de mediana).
- Evaluacion de despliegue LiteRT-LM: util para medir latencias y comportamiento de modelos hibridos en runtime on-device con presupuesto de thinking configurable.
- Generacion de ficcion interactiva entre adultos: escritura asistida de escenas narrativas con personajes consistentes, siempre que el contenido sea para adultos y en ingles.
- Pruebas de robustez de filtros de seguridad: el modelo permite estudiar como un fine-tune con filtrado de tarjetas afecta a las tasas de rechazo (3 rechazos frente a 7 del base en la evaluacion del autor).

## Benchmarks y rendimiento

Datos publicados por el autor en la model card, medidos sobre 18 chats reservados (239 respuestas para la perdida, 47 generaciones por modelo para el resto), comparando con el modelo base LFM2.5-2.6B con los mismos prompts y ajustes:

| Metrica | LFM2.5-2.6B | Este modelo |
|---|---|---|
| Perdida en respuestas reservadas (menor es mejor) | 2,698 | 2,047 |
| Preferido por juez Qwen3.5-9B (94 juicios, ambos ordenes) | 16% | 84% |
| Termino el thinking y escribio respuesta | 42 de 47 | 47 de 47 |
| Rechazos (recuento por palabras clave) | 7 | 3 |
| Longitud mediana del thinking | 1.996 caracteres | 505 caracteres |

Estos numeros provienen del modelo en bf16 en Transformers. El archivo `.litertlm` se comprobo por separado en LiteRT-LM 0.19 sobre CPU de portatil: penso entre 430 y 550 caracteres y respondio en 45 a 64 segundos en chats reservados, frente a 106 a 362 segundos de una conversion base realizada de la misma forma. No se ha medido en GPU de telefono.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: aproximadamente 2,8 GB para el archivo int8, mas overhead del runtime; se recomienda al menos 4 GB de RAM libre en el dispositivo.
- GPU recomendadas: no se especifican; el unico backend probado es CPU. No hay mediciones en GPU de telefono ni en GPU de escritorio.
- Cabe en consumer GPU: si, en cualquier GPU con 4 GB o mas de VRAM si se convierte a otros formatos, aunque el formato publicado es LiteRT-LM y no se documenta su uso en GPU de escritorio.
- Opciones de despliegue: LiteRT-LM 0.19 o superior (unico runtime documentado); el modelo base LFM2.5-2.6B puede desplegarse con otros runtimes, pero este fine-tune solo se distribuye en `.litertlm`.
- Latencia y throughput estimados: 45 a 64 segundos por respuesta en CPU de portatil con thinking activado (presupuesto 768 tokens); no hay datos de throughput en tokens por segundo ni de latencia en movil.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / despliegue | Licencia | Enfoque |
|---|---|---|---|---|---|
| LFM2.5-2.6B-Lorefold-LiteRT (este) | 2,6B | 8.192 | LiteRT-LM int8, on-device | LFM Open License v1.0 | Roleplay adulto en dispositivo |
| LiquidAI/LFM2.5-2.6B (base) | 2,6B | 8.192 (segun configuracion del fine-tune) | safetensors, Transformers | LFM Open License v1.0 | Proposito general |
| Modelos de roleplay en la nube usados como profesores | No disponible | No disponible | API | No disponible | Generacion de respuestas de referencia |

No se dispone de datos publicos de benchmarks comparativos con otros modelos de roleplay on-device en la informacion proporcionada. La unica comparacion cuantitativa disponible es contra el modelo base, recogida en la seccion de benchmarks.

## Limitaciones y advertencias

- Contenido para adultos: el modelo esta entrenado para escribir escenas explicitas entre adultos y lleva la etiqueta `not-for-all-adult` (`not-for-all-audiences`). No debe usarse en entornos con menores ni en productos de consumo general sin filtrado adicional.
- Solo ingles: la model card declara unicamente el idioma ingles; el rendimiento en castellano no esta documentado y previsiblemente sera deficiente.
- Riesgo de alucinacion: como todo modelo generativo, puede inventar detalles inconsistentes con la tarjeta de personaje o el historial; el entrenamiento con solo 2.200 respuestas limita la diversidad de estilos.
- Sesgos: el filtrado de tarjetas con un clasificador Qwen3.5-9B puede introducir sesgos de seleccion; no se documenta una evaluacion de sesgos demograficos.
- Restricciones de licencia: LFM Open License v1.0; es una version modificada de LFM2.5-2.6B y su uso comercial esta sujeto a los terminos de dicha licencia, que deben revisarse antes de desplegar en produccion.
- Dependencia de runtime: requiere LiteRT-LM 0.19 o superior; no se distribuyen pesos en safetensors ni GGUF de este fine-tune, lo que limita su uso fuera del ecosistema LiteRT.
- Gestion de estado: en LiteRT-LM, una nueva conversacion sobre un motor ya usado puede heredar el estado de convolucion anterior; la app debe abrir un motor nuevo por conversacion para evitar contaminacion de contexto.
- Formato de salida: la respuesta empieza con una linea en blanco; hay que eliminar el espacio inicial antes de mostrarla.
- Sin mediciones en movil: el rendimiento en GPU de telefono no se ha medido; las latencias publicadas son de CPU de portatil.
- Sin soporte documentado de tool calling, agentes, vision ni audio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Alovestocode/LFM2.5-2.6B-Lorefold-LiteRT
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-2.6B
- LiteRT-LM (repositorio): https://github.com/google-ai-edge/LiteRT-LM
- Licencia LFM Open License v1.0: incluida en el repositorio como `LICENSE`
