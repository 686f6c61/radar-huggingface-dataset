# don0ox1/AEON-27B-RP-cn-abliterated

## Resumen

AEON-27B-RP-cn-abliterated es un modelo de lenguaje publicado en Hugging Face por el usuario don0ox1 bajo licencia Apache 2.0. Por el nombre se deduce que se trata de una variante de un modelo base de aproximadamente 27.000 millones de parametros, orientada a roleplay (RP), con algun tipo de ajuste relacionado con chino (cn) y sometida a un proceso de "abliteration", una tecnica de modificacion de pesos que busca eliminar los mecanismos de rechazo aprendidos durante el alineamiento.

La model card publicada es practicamente inexistente: unicamente contiene la declaracion de licencia Apache 2.0, sin descripcion, sin especificaciones tecnicas, sin datos de entrenamiento ni resultados de evaluacion. El repositorio registra cero descargas y cero likes en el momento de la consulta, y no declara pipeline, idiomas ni formatos de pesos.

Por tanto, esta ficha solo puede caracterizar el modelo de forma inferencial a partir de su denominacion y del ecosistema habitual de este tipo de publicaciones (modelos derivados de bases abiertas, fine-tuneados para conversacion creativa y despojados de filtros de rechazo). Cualquier dato concreto de arquitectura, contexto o rendimiento debe considerarse no disponible hasta que el autor publique documentacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (por el nombre, presumiblemente transformer denso de ~27B; no confirmado) |
| Parametros totales | no disponible (el nombre sugiere ~27.000 millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el sufijo "cn" sugiere enfasis en chino, sin confirmar) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura en la model card. El nombre del repositorio indica tres elementos que, en la practica habitual de Hugging Face, suelen corresponder a: un modelo base de gran tamano (~27B), un ajuste fino orientado a roleplay conversacional y una fase de abliteration, tecnica que identifica direcciones en el espacio de activaciones asociadas al rechazo y las proyecta fuera de los pesos para reducir las respuestas de negacion.

El sufijo "cn" podria indicar un ajuste o corpus centrado en chino, pero no hay ninguna evidencia documental en el repositorio que lo confirme. Tampoco se especifican volumen de tokens de entrenamiento, composicion del dataset, uso de RLHF/DPO ni innovaciones tecnicas como decodificacion especulativa o atencion lineal. Toda esta seccion queda como no disponible.

## Capacidades

- Generacion de texto conversacional: por su orientacion declarada a roleplay, se espera capacidad de mantener dialogos multi-turno con consistencia de personaje, aunque no hay documentacion que lo verifique.
- Escritura creativa: narrativa, ficcion y simulacion de personajes, uso coherente con el sufijo "RP".
- Reduccion de rechazos: la abliteration busca disminuir las negativas del modelo ante peticiones que el alineamiento original bloquearia; el alcance real no esta documentado.
- Posible soporte de chino: inferido del sufijo "cn", sin confirmacion.
- Tool calling / function calling: no disponible.
- Capacidades de agente y razonamiento multi-paso: no disponible.
- Vision, audio o modo thinking: no disponible.

## Casos de uso

- Roleplay conversacional: el modelo estaria pensado para mantener personajes consistentes en sesiones largas de chat; su utilidad real depende de un contexto suficiente, cuyo tamano no esta documentado.
- Escritura creativa asistida: generacion de ficcion, dialogos y tramas narrativas donde el ajuste "RP" suele producir un estilo mas expresivo que un modelo base generico.
- Prototipado de experiencias interactivas: chatbots de entretenimiento o videojuegos narrativos donde se prioriza la fluidez conversacional sobre la precision factual.
- Investigacion sobre alineamiento y abliteration: util como objeto de estudio para comparar el comportamiento de un modelo abliterado frente a su base original en tareas de rechazo y seguridad.
- Generacion de contenido en chino (si el sufijo se confirma): redaccion y conversacion en ese idioma, pendiente de validacion empirica.
- Experimentacion local con cuantizacion: si se publican pesos en formatos estandar, podria desplegarse en entornos con recursos limitados, aunque el tamano de 27B exige hardware de gama alta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa para un modelo denso de ~27B, en FP16 se requeririan aproximadamente 54 GB de VRAM solo para pesos; en cuantizacion de 8 bits, unos 27 GB; en 4 bits, unos 14-16 GB. Son estimaciones genericas, no datos del autor.
- GPU recomendadas: para FP16, A100 80GB o H100; para cuantizaciones de 4-8 bits, RTX 4090 (24 GB) o A6000 (48 GB) podrian ser suficientes.
- Compatibilidad con GPU de consumo: probable en cuantizacion de 4 bits en tarjetas con 16-24 GB, sin confirmacion.
- Opciones de despliegue: no documentadas; en funcion del formato de pesos publicado podrian aplicarse vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se conocen modelos comparables documentados en la informacion proporcionada, y el repositorio no ofrece datos que permitan establecer una comparacion rigurosa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Ausencia total de documentacion: no hay model card tecnica, lo que impide verificar arquitectura, contexto, idiomas o calidad.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; la falta de evaluacion publicada impide cuantificarlo.
- Sesgos: desconocidos, al no documentarse el dataset de entrenamiento.
- Efecto de la abliteration: la eliminacion de mecanismos de rechazo puede aumentar la probabilidad de generar contenido danino, ofensivo o inapropiado; requiere filtros externos en produccion.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantias sobre el origen de los datos ni sobre el cumplimiento de las licencias del modelo base subyacente.
- Idiomas: no confirmados; el sufijo "cn" no garantiza un soporte multilingue equilibrado.
- Madurez del repositorio: cero descargas y cero likes, sin historial de mantenimiento; no es una opcion recomendable para produccion sin validacion previa.

## Enlaces

- Hugging Face: https://huggingface.co/don0ox1/AEON-27B-RP-cn-abliterated
