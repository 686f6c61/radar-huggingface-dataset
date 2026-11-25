# Mytho0610/cinemago-rasa-bot

## Resumen

CinemaGo es un asistente conversacional para reserva de entradas de cine, construido sobre el framework Rasa 3.6 y orientado exclusivamente al idioma vietnamita. No se trata de un modelo de lenguaje con pesos publicados, sino de un paquete de proyecto Rasa que incluye configuracion de dominio, historias, reglas, datos NLU y acciones personalizadas para gestionar un flujo de reserva completo: seleccion de pelicula, cine, fecha, sesion, asientos concretos (por ejemplo D5 o D6) o asignacion automatica, multiples articulos de comida, datos del cliente, pago simulado y emision de codigo de entrada. Ademas responde a preguntas fuera de flujo sobre cartelera, asientos libres, precios, menu, cines, informacion de peliculas, consulta de entradas y puntos de fidelidad.

El repositorio de Hugging Face asociado (Mytho0610/cinemago-rasa-bot) tiene un tamano de 0.0 GB y cero descargas y likes en el momento de la consulta, lo que sugiere que el contenido pesado (modelos entrenados, base de datos) no esta alojado en el Hub o que el proyecto es un esqueleto de codigo. La model card describe el proceso de reconstruccion mediante tres scripts (`build_db.py`, `build_nlu.py`, `build_config.py`) y el entrenamiento con `rasa train`, lo que confirma que el artefacto distribuido es codigo y datos de entrenamiento, no un checkpoint neuronal.

Su relevancia es acotada: sirve como referencia de implementacion de un bot de reservas con Rasa en vietnamita, un idioma con escasez de recursos conversacionales abiertos. Los datos NLU en vietnamita se generan a partir de plantillas de frases, y los datos de referencia proceden de Taskmaster-1 (GEM/Taskmaster, ConvLab/tm1), originalmente en ingles. No hay informacion sobre arquitectura de modelo, parametros ni contexto, porque el proyecto no publica un modelo base propio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (proyecto Rasa 3.6; no se especifica el componente NLU ni la politica de dialogo) |
| Parametros totales | No disponible |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Vietnamita (vi) |
| Licencia | No disponible |
| Formato de pesos | No disponible (repositorio de codigo y datos Rasa; no se publican pesos) |

## Arquitectura y entrenamiento

El proyecto se apoya en Rasa 3.6, un framework de asistentes conversacionales que combina un componente NLU (clasificacion de intenciones y extraccion de entidades) con una politica de dialogo (normalmente basada en reglas y en aprendizaje por refuerzo sobre historias). La model card no detalla que pipeline NLU se usa (por ejemplo, si emplea un transformer multilingue como componente de features, un clasificador basado en embeddings o un enfoque lexico), ni que politica de dialogo se configura. Tampoco indica el numero de historias, reglas, intenciones o entidades del dominio.

El entrenamiento de los datos NLU en vietnamita se realiza mediante generacion a partir de plantillas de frases, segun indica el autor, y los datos de referencia provienen de Taskmaster-1 en su version GEM/Taskmaster y ConvLab/tm1, en ingles. No se documenta el uso de RLHF, DPO ni ajuste fino de un modelo generativo. La innovacion practica del proyecto es la modelizacion de un flujo de reserva con seleccion explicita de asientos y multiples articulos de comida, junto con respuestas fuera de flujo sobre cartelera y disponibilidad.

## Capacidades

- Gestion de un flujo de reserva multi-paso: pelicula, cine, fecha, sesion, seleccion de asiento concreto o automatica, varios articulos de comida, datos del cliente, pago simulado y codigo de entrada.
- Respuesta a consultas fuera de flujo: cartelera, asientos libres, precios de entradas, menu, listado de cines, informacion de peliculas, consulta de entradas emitidas y puntos de miembro.
- Extraccion de entidades especificas del dominio: identificadores de asiento (por ejemplo D5, D6), fechas, sesiones y articulos de comida.
- Soporte de tool calling / function calling: no disponible como capacidad de modelo; las acciones personalizadas de Rasa actuan como backend de logica de negocio.
- Soporte de agentes y razonamiento multi-paso: limitado al flujo definido en historias y reglas de Rasa; no se documenta razonamiento abierto.
- Capacidades multilingues: solo vietnamita.
- Capacidades especiales: pago simulado y generacion de codigo de entrada; no se documentan modos de razonamiento, vision ni audio.

## Casos de uso

- Reserva de entradas de cine en vietnamita: el bot guia al usuario por pelicula, cine, fecha, sesion y asiento, y emite un codigo de entrada tras un pago simulado; es adecuado porque el dominio y las historias estan modelados explicitamente para ese flujo.
- Seleccion de asientos concreta: el usuario puede indicar asientos como D5 y D6 o dejar que el sistema asigne automaticamente, lo que cubre el caso de grupos que quieren sentarse juntos.
- Venta complementaria de comida: el flujo admite multiples articulos de comida antes del pago, lo que permite integrar un carrito de concessionaria en la misma conversacion.
- Atencion al cliente sobre cartelera y disponibilidad: responde a preguntas sobre peliculas en cartel, horarios, asientos libres y precios sin necesidad de salir del flujo de reserva.
- Consulta de entradas y fidelidad: permite recuperar entradas emitidas y consultar puntos de miembro, util para un mostrador virtual o un canal de mensajeria.
- Base para un bot de reservas en vietnamita: al ser codigo Rasa reproducible con scripts de construccion, sirve como punto de partida para adaptar el dominio a otros cines o a otros servicios de reserva con flujo similar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al no publicarse pesos ni modelo base, no se puede estimar.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: Rasa (`rasa train`, `rasa run actions`, `rasa run --enable-api` con `credentials.yml` y `endpoints.yml`), segun la model card; requiere Python y el servidor de acciones para las custom actions.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Mytho0610/cinemago-rasa-bot | Proyecto Rasa 3.6 (bot de reservas, vietnamita) | No disponible | No disponible | No disponible | Hugging Face (repo de 0.0 GB) |
| Rasa Open Source (framework) | Framework de asistentes conversacionales | No aplica | No aplica | No disponible en la informacion | Codigo abierto |
| Taskmaster-1 (datos de referencia) | Dataset de dialogos orientados a tareas (ingles) | No aplica | No aplica | No disponible en la informacion | GEM/Taskmaster, ConvLab/tm1 |

No se dispone de datos de rendimiento ni de especificaciones de modelos comparables en la informacion proporcionada, por lo que la comparativa se limita a categoria y disponibilidad.

## Limitaciones y advertencias

- El repositorio tiene 0.0 GB: es probable que no incluya modelos entrenados ni la base de datos, solo codigo y datos; habria que reconstruirlo con los scripts indicados.
- Los datos NLU en vietnamita se generan a partir de plantillas, lo que puede producir baja cobertura ante variaciones linguisticas reales y aumentar los fallos de clasificacion de intenciones.
- Los datos de referencia proceden de Taskmaster-1 en ingles; la transferencia al vietnamita no esta validada en la informacion disponible.
- El pago es simulado: no debe usarse como sistema de pago real sin integrar y auditar un backend transaccional.
- No se especifica licencia, por lo que el uso comercial queda sin autorizacion explicita y debe consultarse con el autor.
- Solo soporta vietnamita; no hay capacidades multilingues documentadas.
- Riesgo de alucinacion y de respuestas incorrectas en consultas fuera de flujo (precios, disponibilidad) si las custom actions no consultan datos reales.
- No se documentan sesgos conocidos, pero al ser un dominio de reservas de cine los sesgos potenciales se limitan a la cobertura de plantillas y al sesgo de los datos de referencia en ingles.

## Enlaces

- Hugging Face: https://huggingface.co/Mytho0610/cinemago-rasa-bot
- Rasa Open Source: https://rasa.com/docs/rasa/
- Taskmaster-1 (GEM/Taskmaster): https://huggingface.co/datasets/GEM/taskmaster
- ConvLab/tm1: https://github.com/ConvLab/ConvLab
