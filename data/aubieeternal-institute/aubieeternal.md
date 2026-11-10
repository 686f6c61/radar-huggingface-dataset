# aubieeternal-institute/AUBIEETERNAL

## Resumen

AUBIEETERNAL es un repositorio publicado en Hugging Face por la organización aubieeternal-institute que, a la vista de la model card, no contiene un modelo de lenguaje en el sentido convencional, sino el paquete de distribución de un programa educativo abierto denominado "Open Source Sovereign Learning Program". El repositorio incluye un currículo de 265 lecciones organizadas en 51 tracks, cuatro itinerarios de aprendizaje con credenciales ancladas en Bitcoin y una aplicación de escritorio con un tutor de IA ("SI tutor") que funciona de forma totalmente offline sobre hardware modesto. El tamaño del repositorio (0,1 GB) es coherente con un conjunto de materiales, scripts de instalación y una aplicación, no con pesos de un modelo neuronal de gran escala.

La relevancia del proyecto reside en su propuesta de despliegue: educación gratuita, sin conexión permanente a internet y sin dependencia de la nube, pensada para orphanatos, centros comunitarios y familias con un portátil de 8 GB de RAM. Sin embargo, la información disponible no permite caracterizar el modelo subyacente del tutor (arquitectura, parámetros, contexto, licencia de los pesos), por lo que esta ficha debe leerse como una descripción del artefacto publicado y de sus limitaciones documentales, no como una evaluación técnica de un LLM.

No se han publicado en la información proporcionada datos sobre arquitectura, número de parámetros, longitud de contexto, tipos de cuantización ni formato de pesos. La model card tampoco declara una licencia a nivel de modelo en los metadatos de Hugging Face (el campo de licencia aparece como "no disponible"), aunque el README menciona CC0 para el contenido del programa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible en metadatos; el README del proyecto menciona CC0 Public Domain para el contenido educativo |
| Formato de pesos | no disponible (el repositorio, de 0,1 GB, contiene material de programa y scripts, no pesos verificables) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del componente de IA del proyecto. La model card describe un "SI tutor" que se ejecuta localmente ("runs entirely on your hardware. No cloud, no subscriptions, no data sent anywhere"), lo que sugiere un modelo pequeño o un pipeline local, pero no se especifica familia, tamaño, tokenizador, datos de entrenamiento, número de tokens, ni si se aplicaron técnicas de RLHF o DPO. Tampoco se documenta ninguna innovación técnica de inferencia (decodificación especulativa, atención lineal, etc.).

El grueso de la documentación se centra en el programa educativo: 265 lecciones, 51 tracks, cuatro learning paths con "credits" y "coherence" asociados, y un mecanismo de credenciales selladas en Bitcoin. No hay evidencia en la información proporcionada de que estos itinerarios hayan sido evaluados con benchmarks de modelos; la insignia "HermesBench Verified" aparece como enlace a un repositorio GitHub, sin resultados reproducibles citados.

## Capacidades

- Tutoría educativa offline: la aplicación permite abrir una pantalla de bienvenida y elegir un itinerario de aprendizaje, con lecciones que funcionan "a edad 5 y a profundidad de investigación simultáneamente".
- Currículo estructurado: 265 lecciones en 51 tracks que cubren matemáticas y prueba formal, teoría de la decisión, epistemología, cosmología, mecánica cuántica, teoría de la información, biología evolutiva y ética.
- Ejecución local sin nube: el tutor "runs entirely on your hardware", sin envío de datos a servicios externos.
- Despliegue comunitario: guía para usar un ordenador con proyector y atender hasta 30 niños simultáneamente.
- Credenciales ancladas en Bitcoin: registros de finalización sellados en la cadena, presentados como "Bitcoin-anchored completions".
- Mecanismo de comprobación de estado: botones Verde / Amarillo / Rojo como alternativa a hardware de gafas (Halo glasses).
- Add-on hardware opcional: un robot cuadrúpedo de 12 servos ("Aubie the Robot Dog") que ejecuta el mismo asistente de voz/visión, aunque el programa funciona sin él.
- API denominada "Epistemic Commons API" mencionada en la model card, sin detalles de endpoints ni autenticación en la información disponible.
- Tool calling / function calling: no disponible.
- Razonamiento multi-paso y agentes: no disponible como capacidad del modelo; el programa describe protocolos de "red team" y STRIDE como contenido curricular, no como capacidades del sistema.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Alfabetización digital en orphanatos: un portátil de gama baja (~100-200 USD de segunda mano) con 8 GB de RAM puede servir lecciones a grupos de hasta 30 niños mediante un proyector, con instalación inicial conectada a internet y funcionamiento offline posterior.
- Educación comunitaria sin presupuesto: centros comunitarios que no pueden pagar licencias ni suscripciones cloud pueden desplegar el programa completo a coste cero, con el tutor ejecutándose en local.
- Formación de padres y tutores: adultos que acompañan a menores pueden recorrer los mismos itinerarios (por ejemplo, "Sovereign Groundwork", 60 créditos) para reforzar contenidos de lógica, decisión y epistemología.
- Estudio autodidacta avanzado: estudiantes de posgrado pueden usar tracks como "Cosmos Deep Track" o "Quantum Mechanics" para repasar fundamentos con profundidad de investigación, sin depender de acceso institucional.
- Entornos con conectividad intermitente o censura de red: al funcionar offline tras la instalación, el programa es adecuado para zonas rurales, aulas con red restringida o contextos donde el acceso a plataformas educativas está bloqueado.
- Prototipado de credenciales verificables: organizaciones que quieran experimentar con registros de finalización anclados en Bitcoin pueden usar el mecanismo descrito para sellar completions, asumiendo que no son títulos académicos.
- Robótica educativa opcional: grupos con acceso a impresión 3D y servos pueden montar el cuadrúpedo Aubie y usar el asistente de voz/visión como actividad de taller, aunque no es requisito para el currículo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card menciona una insignia "HermesBench Verified" que enlaza al repositorio GitHub del proyecto, pero no se aportan puntuaciones, conjuntos de evaluación ni comparaciones reproducibles. Cualquier cifra de rendimiento del tutor o del programa educativo no está disponible en la información proporcionada.

## Requisitos de hardware

- RAM mínima declarada: 8 GB para el portátil que ejecuta la aplicación y el tutor local.
- Coste de hardware orientativo: 100-200 USD para un equipo de segunda mano, según la model card.
- Capacidad de aula: un ordenador más un proyector para hasta 30 niños simultáneamente.
- Conectividad: internet solo durante la instalación inicial; funcionamiento completamente offline después.
- GPU recomendadas: no disponible; no se especifica ningún requisito de GPU dedicada.
- ¿Cabe en GPU consumer? No disponible; el proyecto está planteado para CPU y portátiles modestos, no para aceleradores dedicados.
- Opciones de despliegue: scripts `install_windows.bat` e `install_mac_linux.sh`, y arranque para desarrolladores mediante `git clone` y `python launcher.py`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.
- Almacenamiento: el repositorio de Hugging Face ocupa 0,1 GB; el espacio requerido tras la instalación no se detalla.

## Comparativa con modelos similares

No disponible. La información proporcionada no permite identificar el modelo de lenguaje subyacente del tutor ni establecer una comparación técnica con alternativas de la misma categoría (mismo tamaño, misma tarea o mismo tipo de despliegue). El artefacto publicado es un programa educativo con una aplicación local, no una ficha de pesos de modelo comparable con LLM convencionales.

## Limitaciones y advertencias

- Naturaleza del artefacto: el repositorio no documenta un modelo de lenguaje con arquitectura, parámetros, contexto o pesos verificables; tratarlo como un LLM evaluable sería un error de interpretación.
- Credenciales no acreditadas: la propia model card advierte que se trata de una "self-issued credential platform", no acreditada por ninguna agencia reconocida por un Department of Education, y que las credenciales son "Bitcoin-anchored completions, not academic degrees". AUBIEETERNAL Institute no es una universidad ni concede títulos.
- Licencia ambigua: el campo de licencia de Hugging Face aparece como "no disponible"; el README menciona CC0 para el contenido, pero no queda claro qué licencia aplica a la aplicación, al tutor o a los materiales auxiliares. Verificar antes de uso comercial o de redistribución.
- Riesgo de sobreventa: expresiones como "HermesBench Verified" o "Reliability" sin resultados reproducibles citados no constituyen evidencia de rendimiento; exigen verificación independiente.
- Dependencia de un único mantenedor: el proyecto se publica bajo una organización con cero descargas y cero likes en el momento de la consulta, lo que dificulta evaluar mantenimiento, issues y comunidad.
- Idiomas y sesgos: no disponibles; al no documentarse el modelo subyente ni los datos, no es posible evaluar sesgos, cobertura lingüística ni riesgo de alucinación del tutor.
- Contexto y limitaciones técnicas del tutor: no disponibles; no se especifica ventana de contexto, política de manejo de conversaciones multi-turno ni límites de tamaño de entrada.
- Hardware opcional: el robot cuadrúpedo requiere 12 servos y montaje físico; la model card lo presenta como add-on, no como parte del programa mínimo.
- Fechas: el repositorio figura creado y actualizado en noviembre de 2026 según los metadatos de Hugging Face; conviene contrastar la vigencia de enlaces y scripts antes de desplegar.

## Enlaces

- Hugging Face: https://huggingface.co/aubieeternal-institute/AUBIEETERNAL
- Repositorio GitHub del proyecto: https://github.com/AUBIEETERNAL-INSTITUTE-INC/AUBIEETERNAL
- Guía de despliegue comunitario: COMMUNITY_DEPLOYMENT.md (enlazada desde la model card, dentro del repositorio GitHub)
- Add-on robot cuadrúpedo: AUBIE_DOG.md (enlazado desde la model card, dentro del repositorio GitHub)
- API "Epistemic Commons API": mencionada en la model card, sin URL específica disponible en la información proporcionada
- Paper, blog o demo adicionales: no disponibles en la información proporcionada
