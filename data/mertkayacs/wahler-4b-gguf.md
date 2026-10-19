# mertkayacs/Wahler-4B-GGUF

## Resumen

Wähler-4B-GGUF es la versión cuantizada en formato GGUF de Wähler-4B, un modelo de 4.205.751.296 parámetros (aproximadamente 4,2 B) desarrollado por Eschatia Labs, un laboratorio de investigación en IA open source independiente y sin ánimo de lucro, liderado por Mert Kaya. No es un modelo generativo de propósito general: está diseñado y ajustado específicamente para tomar decisiones de clasificación en alemán, es decir, elegir una etiqueta entre un conjunto de opciones definidas por el usuario con criterios explícitos, y devolver una distribución de probabilidad calibrada sobre esas opciones.

El modelo resuelve un problema muy concreto en producción: el enrutado, etiquetado y triaje de texto en alemán sin depender de la nube ni de GPU. Los pesos GGUF permiten ejecutarlo en CPU con llama.cpp, Ollama o LM Studio, con un pico de RAM de 3,03 GB en la cuantización Q4_K_M a 4k de contexto. Según la model card, la versión completa obtiene un 92,0 % de acierto frente al 81,1 % de Kev-4B en decisiones alemanas mantenidas fuera del pipeline de entrenamiento.

La relevancia ahora mismo es doble: por un lado, cubre el hueco de modelos pequeños especializados en una lengua distinta del inglés con licencia Apache-2.0 y despliegue on-device; por otro, introduce un contrato de entrada/salida estructurado (estado del texto, preguntas con tipo *choice*, criterios por etiqueta, control de *reasoning* y posibilidad de abstención) pensado para integrarse en sistemas de ticketing y back-office, no para chat libre.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible de forma explícita en la informacion proporcionada; compatible con llama.cpp y empaquetada como GGUF, lo que presupone un transformer decoder-only (inferencia, no confirmado por el autor) |
| Parametros totales | 4.205.751.296 (aproximadamente 4,2 B), dato real de safetensors del modelo base |
| Parametros activos | No aplica (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | 4.096 tokens (4k) citados en las pruebas de RAM y latencia; maximo soportado no disponible |
| Tipos de cuantizacion | Q4_K_M (2,71 GB), Q5_K_M (3,08 GB), Q8_0 (4,48 GB); exportacion con imatrix |
| Idiomas soportados | Aleman (de) e ingles (en); el uso previsto y los datos de evaluacion son en aleman |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); el modelo base mertkayacs/Wahler-4B se distribuye en safetensors |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base (tipo de atención, número de capas, composición exacta del dataset ni si hubo RLHF o DPO). Lo que sí se documenta es el pipeline: Wähler-4B se entrena sobre el dataset `mertkayacs/jevalt-data`, dentro del proyecto JevAlt, orientado a "pequeños modelos de decisión" para inglés, turco y alemán. El resultado es un modelo que no genera texto libre, sino que lee probabilidades del siguiente token asociadas a las opciones (A, B, C, D) y las normaliza con un fichero `calibration.json` aplicado por el servidor JevAlt sobre llama-cpp-python.

La innovación técnica relevante no está en el bloque transformer, sino en la interfaz: la entrada es un JSON con el texto a clasificar (`state`), una lista de preguntas de tipo `choice` con instrucciones y criterios por etiqueta, un flag `reasoning` (on/off) y un flag `abstain`. La salida es una distribución de probabilidad calibrada por etiqueta, lo que permite fijar umbrales y derivar a un humano cuando la confianza es baja. El autor indica que, para alemán, el modo `reasoning` no mejora el acierto en las pruebas de fecha, número y política reportadas, por lo que recomienda dejarlo desactivado.

Las cuantizaciones se han validado contra la versión de precisión completa sobre 40 decisiones de validación por cuantización: Q4_K_M coincide en la misma opción en el 97,5 % de los casos (gap máximo de probabilidad 0,3419), Q5_K_M en el 95,0 % (gap 0,1494) y Q8_0 en el 97,5 % (gap 0,0315). El autor advierte explícitamente que se trata de una comprobación de cuantización y no de una puntuación de benchmark, y que más precisión no garantiza mayor coincidencia en una muestra tan pequeña.

## Capacidades

- Clasificación de texto por elección entre opciones definidas por el usuario, con criterios descriptivos por etiqueta (por ejemplo, "Abrechnung": pagos, facturas, reembolsos).
- Salida de distribuciones de probabilidad calibradas por etiqueta, no solo la etiqueta ganadora, lo que permite umbrales de confianza.
- Abstención explícita mediante el campo `abstain`, pensada para derivar casos dudosos a revisión humana.
- Modo `reasoning` conmutable (on/off); según el autor, no aporta mejora en alemán en las pruebas realizadas.
- Soporte de múltiples preguntas por petición, cada una con su propio tipo y conjunto de criterios.
- Capacidad multilingüe limitada a alemán e inglés; el entrenamiento y la evaluación se centran en alemán.
- Integración con servidor propio (JevAlt) que expone un endpoint compatible con el estilo OpenAI (`/v1/systemone`) y aplica la calibración.
- Ejecución en CPU pura mediante llama.cpp, Ollama o LM Studio; en estos casos el endpoint devuelve texto generado (la letra de la opción), no probabilidades calibradas.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes multi-paso, visión, audio o modo thinking prolongado: no disponible en la informacion proporcionada.

## Casos de uso

- Enrutado de tickets de soporte en alemán: se envía el texto del ticket junto con las etiquetas de equipo (facturación, soporte técnico, ventas, cuenta) y el modelo devuelve la probabilidad de cada una. El ejemplo de la model card asigna 0,9176 a "Abrechnung" para una reclamación de doble cobro, lo que permite enrutar automáticamente por encima de un umbral.
- Triaje de correo entrante en back-office: clasificación de mensajes en categorías operativas (incidencia, solicitud comercial, consulta de cuenta) con abstención cuando la confianza es baja, evitando asignaciones erróneas en colas humanas.
- Etiquetado de reseñas y feedback de producto en alemán: categorización por temática (precio, usabilidad, envío, atención) usando los criterios por etiqueta para mantener consistencia entre analistas.
- Clasificación de reclamaciones con derivación a humano: gracias al campo `abstain` y a las probabilidades calibradas, el sistema puede fijar un umbral y escalar los casos ambiguos, algo crítico en sectores regulados.
- Procesamiento on-premise o air-gapped sin GPU: con 3,03 GB de pico de RAM en Q4_K_M cabe en servidores modestos o incluso en un portátil, lo que permite clasificar documentos internos sin que el texto salga de la infraestructura.
- Pre-clasificación en pipelines de CI/CD de datos: etiquetado masivo de corpus alemanes para construir datasets de entrenamiento o para validar la calidad de contenidos antes de publicarlos.
- Moderación y categorización de contenido generado por usuarios: asignación de categorías de riesgo o temática con umbrales calibrados, ejecutada en el mismo proceso que el resto del servicio.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible son el acierto en decisiones alemanas mantenidas fuera del pipeline de entrenamiento y la comprobación de cuantización. No hay resultados de MMLU, HumanEval, GSM8K ni similares.

| Metrica | Resultado |
|---|---|
| Acierto en decisiones alemanas (Wähler-4B, precision completa) | 92,0 % |
| Acierto en decisiones alemanas (Kev-4B, referencia) | 81,1 % |

Comprobación de cuantización frente a precisión completa (40 decisiones de validación por cuantización):

| Fichero | Tamano | Coincidencia en la opcion seleccionada | Gap maximo de probabilidad | Segundos por peticion | Pico de RAM |
|---|---|---|---|---|---|
| Q4_K_M | 2,71 GB | 97,5 % | 0,3419 | 10,03 | 3,03 GB |
| Q5_K_M | 3,08 GB | 95,0 % | 0,1494 | 17,33 | 3,39 GB |
| Q8_0 | 4,48 GB | 97,5 % | 0,0315 | 11,58 | 4,76 GB |

Las mediciones de RAM y velocidad se hicieron en una maquina de Hugging Face con 8 vCPU, 4 hilos, contexto de 4k, sin mmap y con repacking activado.

## Requisitos de hardware

- Inferencia en CPU: no requiere GPU. Pico de RAM de 3,03 GB con Q4_K_M a 4k de contexto, 3,39 GB con Q5_K_M y 4,76 GB con Q8_0.
- VRAM estimada si se ejecuta en GPU: no disponible en la informacion proporcionada; por tamano de fichero, Q4_K_M cabe holgadamente en cualquier GPU consumer con 4 GB o mas de VRAM.
- GPU recomendadas: no disponible. El proyecto está orientado a CPU y no publica perfiles de GPU (A100, H100, RTX 4090 u otras).
- Cabe en GPU consumer: sí, por tamano de pesos (2,71 GB en Q4_K_M), aunque el fabricante no publica cifras de rendimiento en GPU.
- Opciones de despliegue: llama.cpp, Ollama (`ollama run mertkayacs/wahler-4b`), LM Studio y el servidor JevAlt (`jevalt serve --model mertkayacs/Wahler-4B-GGUF --file Wahler-4B-Q4_K_M.gguf`), que aplica `calibration.json` y expone `/v1/systemone`. vLLM y TGI no están documentados para este formato.
- Latencia: 10,03 s por petición con Q4_K_M, 17,33 s con Q5_K_M y 11,58 s con Q8_0 en la máquina de referencia (8 vCPU, 4 hilos, 4k). Son cifras de CPU compartida, no de hardware dedicado; el throughput no se publica.

## Comparativa con modelos similares

Los datos disponibles solo permiten comparar con la referencia que cita el autor, Kev-4B, y con las propias cuantizaciones.

| Modelo | Parametros | Contexto | Acierto en decisiones alemanas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Wähler-4B (precision completa) | 4,2 B | 4k citado en pruebas | 92,0 % | Apache-2.0 | HuggingFace (mertkayacs/Wahler-4B) |
| Wähler-4B GGUF Q4_K_M | 4,2 B | 4k citado en pruebas | 97,5 % de coincidencia con precision completa (no es benchmark) | Apache-2.0 | HuggingFace, Ollama, llama.cpp |
| Kev-4B | No disponible | No disponible | 81,1 % | No disponible | No disponible |

No se dispone de datos verificables de otros modelos comparables de la misma categoria (modelos pequeños de clasificacion en aleman) en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo conversacional: con llama.cpp, Ollama o LM Studio en modo chat devuelve texto generado (la letra de la opción), no probabilidades calibradas. Para umbrales y decisiones calibradas hay que usar el servidor JevAlt.
- La calibración está ajustada por el autor; la model card recomienda reajustar `calibration.json` con datos propios antes de fijar umbrales en producción.
- Casos de fallo declarados por el autor: instrucciones plantadas en el texto (prompt injection), texto largo irrelevante y aritmética de fechas.
- La autorización y el control de permisos deben quedar fuera del modelo; no debe usarse como mecanismo de seguridad.
- El modo `reasoning` no mejora el acierto en alemán según las pruebas reportadas; activarlo añade coste sin beneficio documentado.
- La validación de cuantizaciones se hizo sobre 40 decisiones por cuantización, una muestra pequeña; el propio autor advierte que más precisión no garantiza mayor coincidencia.
- Idiomas: solo alemán e inglés. El rendimiento en otras lenguas no está evaluado y no debería asumirse.
- Contexto limitado (4k citado en las pruebas): textos largos pueden degradar la decisión o quedar truncados.
- Riesgo de alucinación en el sentido de asignar una etiqueta con alta confianza cuando el texto no encaja en ninguna; la abstención mitiga pero no elimina el problema.
- Licencia Apache-2.0: permite uso comercial y modificaciones, con obligación de conservar avisos de licencia y atribución; no hay cláusulas de uso aceptable adicionales documentadas.
- Sin datos publicados de sesgos; al ser un modelo entrenado para clasificación en alemán, puede heredar sesgos de `mertkayacs/jevalt-data`, cuya composición no está detallada.

## Enlaces

- [HuggingFace: mertkayacs/Wahler-4B-GGUF](https://huggingface.co/mertkayacs/Wahler-4B-GGUF)
- [Modelo base: mertkayacs/Wahler-4B](https://huggingface.co/mertkayacs/Wahler-4B)
- [Repositorio GitHub JevAlt](https://github.com/mertkayacs/jevalt)
- [Demo en HuggingFace Spaces](https://huggingface.co/spaces/mertkayacs/JevAlt)
- [Pagina del proyecto](https://jevalt.mertkayacs.com/models/wahler-4b/)
- [Dataset de entrenamiento: mertkayacs/jevalt-data](https://huggingface.co/datasets/mertkayacs/jevalt-data)
- [Resultados de benchmark: mertkayacs/jevalt-bench](https://huggingface.co/datasets/mertkayacs/jevalt-bench)
- [Pagina de benchmarks de Eschatia Labs](https://eschatialabs.com/benchmarks/jevalt-bench/)
- [Ficha en Ollama](https://ollama.com/mertkayacs/wahler-4b)
- [Informe de exportacion (export-report.json)](https://huggingface.co/mertkayacs/Wahler-4B-GGUF/blob/main/export-report.json)
- [Eschatia Labs](https://eschatialabs.com)
- [Sitio del autor, Mert Kaya](https://mertkayacs.com)
- Busqueda web: no se encontraron enlaces relevantes sobre el modelo; los resultados devueltos correspondian a contenido sin relacion.
