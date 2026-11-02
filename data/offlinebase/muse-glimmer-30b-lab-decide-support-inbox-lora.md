# OfflineBase/Muse-Glimmer-30B-Lab-Decide-Support-Inbox-LoRA

## Resumen

Muse-Glimmer-30B-Lab-Decide-Support-Inbox-LoRA es un adaptador LoRA de rango 16 publicado por el usuario OfflineBase sobre el modelo base `unsloth/Muse-Glimmer-30B-unsloth-bnb-4bit`, una compilacion en 4 bits del modelo Muse Glimmer 30B de Meta. El adaptador esta entrenado para una tarea muy concreta: clasificar mensajes de la bandeja de entrada de atencion al cliente de una tienda en cuatro etiquetas fijas (Billing, Shipping, Returns, Account), segun el fichero `decide.json` que el autor menciona en la model card.

El repositorio tiene un tamano de 0,4 GB, coherente con un adaptador LoRA de rango bajo sobre un modelo de 30 000 millones de parametros, y se distribuye en formato safetensors bajo la libreria PEFT. La model card indica explicitamente que los datos de entrenamiento son inventados ("made-up data"), que se leyeron 400 filas y se conservaron 390 tras fusionar 10 casi duplicados, y que esas filas no se incluyen en el repositorio.

Es relevante ahora como ejemplo de flujo de trabajo de ajuste fino economico: el autor reporta un coste de ejecucion de 0,4975 dolares y un ajuste mediante Unsloth en 4 bits. No obstante, el propio autor advierte de que el repositorio es privado, que no ha pasado la revision de licencia y datos personales necesaria para una publicacion publica, y que no es un lanzamiento oficial de Meta. La informacion disponible sobre el modelo base (arquitectura, contexto, idiomas) no aparece en la model card, por lo que se marca como no disponible en esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre modelo base transformer; arquitectura del base no disponible |
| Parametros totales | No disponible (adaptador LoRA r=16; base de 30B) |
| Parametros activos | No aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Base en 4 bits (bnb-4bit); cuantizaciones del adaptador no disponibles |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 (sujeta a la Muse Glimmer Usage Policy) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de rango 16 (r=16) entrenado con la libreria PEFT sobre el checkpoint `unsloth/Muse-Glimmer-30B-unsloth-bnb-4bit`, es decir, sobre una version cuantizada a 4 bits del modelo Muse Glimmer 30B preparada por Unsloth. La model card no detalla la arquitectura interna del modelo base (tipo de atencion, numero de capas, dimension oculta ni ventana de contexto), por lo que esos datos no estan disponibles.

En cuanto a los datos, el autor indica que son sinteticos ("made-up"): 400 filas leidas, 390 conservadas tras fusionar 10 casi duplicados, y que las filas no se incluyen en el repositorio. La tarea de entrenamiento es una eleccion entre cuatro etiquetas (Billing, Shipping, Returns, Account) definidas en `decide.json`, junto con el prompt. No se documenta el uso de RLHF, DPO ni de tecnicas de alineacion adicionales, ni el numero de tokens de entrenamiento. El autor reporta que la ejecucion se completo con un coste de 0,4975 dolares y que la ventana de servicio ("serving window") estaba pendiente en el momento de escribir el registro.

## Capacidades

- Clasificacion de mensajes de soporte en cuatro categorias fijas: Billing, Shipping, Returns y Account, segun el esquema definido en `decide.json`.
- Generacion de texto y razonamiento heredados del modelo base Muse Glimmer 30B, aunque no documentados en la model card.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles; el autor no especifica idiomas.
- Capacidades especiales (modo thinking, vision, audio): no disponibles en la informacion proporcionada.

## Casos de uso

- Triaje automatico de la bandeja de entrada de soporte: el adaptador etiqueta cada mensaje entrante como Billing, Shipping, Returns o Account, lo que permite enrutarlo al equipo correspondiente sin intervencion manual. Es el caso de uso para el que fue entrenado explicitamente.
- Enrutamiento previo a un sistema de ticketing: integrado como paso de clasificacion antes de un CRM o helpdesk, reduce el tiempo de primera respuesta al asignar la cola correcta desde el primer momento.
- Etiquetado de historicos para analitica: aplicar el adaptador sobre conversaciones archivadas permite construir metricas de volumen por categoria y detectar picos de incidencias de facturacion o devoluciones.
- Filtrado y priorizacion en colas compartidas: clasificar en lote los mensajes de un buzon comun para separar consultas de cuenta (potencialmente sensibles) del resto y aplicarles flujos con mas controles.
- Prototipado rapido de clasificadores internos: al ser un LoRA de 0,4 GB sobre un base en 4 bits, sirve como plantilla para experimentar con ajuste fino barato (el autor reporta menos de 0,50 dolares por ejecucion) antes de invertir en un entrenamiento a mayor escala.
- Evaluacion de recetas de ajuste con datos sinteticos: util en laboratorio para medir como se comporta un adaptador de rango 16 entrenado con 390 filas sinteticas frente a datos reales, como paso previo a un despliegue con datos revisados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; al tratarse de un adaptador sobre un base de 30B en 4 bits, el requisito dominante es el del modelo base, no el del adaptador (0,4 GB). No se aportan cifras concretas en la model card.
- GPU recomendadas: no disponibles en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no confirmada; el autor indica que el modelo no se ha ejecutado en una Jetson "en ningun registro" del que disponga.
- Opciones de despliegue: PEFT es la libreria declarada; no se documentan vLLM, llama.cpp, Ollama ni TGI para este adaptador.
- Latencia y throughput: no disponibles. El autor solo reporta el coste de entrenamiento (0,4975 dolares) y deja la ventana de servicio pendiente.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria (clasificadores de soporte ajustados sobre Muse Glimmer 30B) ni datos de rendimiento que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- Datos de entrenamiento sinteticos: el autor declara explicitamente "made-up data", por lo que el adaptador puede no generalizar a mensajes reales de clientes.
- Volumen de datos muy reducido: 390 filas conservadas tras fusionar 10 casi duplicados; riesgo alto de sobreajuste y de baja cobertura de casos limite.
- Repositorio privado y sin revision: el autor afirma que "nothing here has had the license and personal-data review that a public release needs", por lo que no debe tratarse como un artefacto listo para produccion.
- No es un lanzamiento oficial de Meta: la model card lo declara explicitamente; Meta no ha revisado ni respaldado el adaptador.
- Restricciones de uso: aunque la licencia es Apache 2.0, el uso debe seguir la Muse Glimmer Usage Policy, que prohibe el uso por menores de 18 anos y presentar las salidas como escritas por una persona.
- Idiomas y contexto: no documentados; no se puede garantizar comportamiento multilingue ni ventanas largas.
- Riesgo de alucinacion: inherente al modelo base; en una tarea de clasificacion de cuatro etiquetas, el riesgo principal es la asignacion erronea de categoria, no la invencion de contenido.
- Ausencia de benchmarks y de validacion en servicio: no hay metricas de precision, recall ni latencia que respalden su uso en produccion.
- Sesgos: no documentados por el autor; al entrenar con datos sinteticos, los sesgos del generador de datos pueden propagarse al adaptador.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/OfflineBase/Muse-Glimmer-30B-Lab-Decide-Support-Inbox-LoRA
- Modelo base (Unsloth, 4 bits): https://huggingface.co/unsloth/Muse-Glimmer-30B-unsloth-bnb-4bit
- Muse Glimmer Usage Policy: `USAGE_POLICY.md` (referenciado en la model card; no se proporciona URL)
- Licencia Apache 2.0: `LICENSE` (referenciado en la model card; no se proporciona URL)
