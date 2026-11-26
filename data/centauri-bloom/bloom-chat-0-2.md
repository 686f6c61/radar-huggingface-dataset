# Centauri-Bloom/Bloom-Chat-0.2

## Resumen

Bloom-Chat-0.2 es un modelo publicado en Hugging Face por el usuario Centauri-Bloom bajo licencia Apache 2.0. La model card asociada es practicamente vacia: unicamente declara la licencia, sin informacion sobre arquitectura, tamano, datos de entrenamiento ni capacidades. El repositorio no registra descargas ni interacciones en el momento de la consulta.

Por el nombre se infiere una posible relacion con la familia BLOOM (modelos transformer de tipo decoder-only desarrollados originalmente por BigScience), y el sufijo "Chat" sugiere un ajuste orientado a conversacion, pero no hay documentacion que confirme arquitectura, numero de parametros ni proceso de alineacion. El sufijo "0.2" apunta a una version temprana o experimental.

La relevancia practica es limitada sin documentacion tecnica: no se puede recomendar su uso en produccion sin una evaluacion propia. Esta ficha recoge lo que se puede verificar y marca explicitamente como "no disponible" todo aquello que el autor no ha publicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el nombre sugiere familia BLOOM, sin confirmar) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura en la model card. El identificador del repositorio remite nominalmente a BLOOM, una familia de transformers decoder-only entrenada originalmente por BigScience, pero el autor no confirma que este modelo derive de ella ni que reutilice sus pesos.

Tampoco hay datos sobre volumen de tokens de entrenamiento, composicion del dataset, tecnicas de alineacion (RLHF, DPO, SFT) ni innovaciones tecnicas. Cualquier afirmacion al respecto seria especulativa.

## Capacidades

- Generacion de texto conversacional: inferida del sufijo "Chat" del nombre, sin verificacion documental.
- Razonamiento, codigo, matematicas: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (modo thinking, vision, audio): no disponible.

## Casos de uso

- Evaluacion exploratoria en laboratorio: clonar el repositorio, inspeccionar los pesos y ejecutar pruebas controladas para determinar tamano, contexto y calidad antes de considerar cualquier uso posterior.
- Prototipado interno de chatbots: solo si la evaluacion previa confirma un comportamiento conversacional aceptable; el contexto y los idiomas reales deben medirse empiricamente.
- Fine-tuning experimental: la licencia Apache 2.0 permite adaptar los pesos, pero la ausencia de documentacion obliga a validar primero la arquitectura y el tokenizador.
- Investigacion sobre modelos de la familia BLOOM: util como posible punto de comparacion si se confirma la base arquitectonica, algo que hoy no esta verificado.
- Benchmarking propio: sirve como sujeto de prueba en pipelines de evaluacion internos, dado que no existen resultados publicados con los que contrastar.
- Docencia y formacion: ejemplo practico de por que la documentacion de un modelo es critica para evaluar su viabilidad.

No se recomienda su uso en atencion al cliente, generacion de codigo en produccion ni ningun escenario con requisitos de calidad o cumplimiento sin una evaluacion exhaustiva previa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible, al desconocerse el numero de parametros.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no verificadas; en funcion del formato de pesos que se encuentre en el repositorio podrian aplicarse llama.cpp, vLLM u Ollama, pero no hay confirmacion.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No es posible establecer una comparativa rigurosa sin conocer parametros, contexto y rendimiento del modelo. Como referencia de categoria, se incluyen alternativas conversacionales abiertas consolidadas:

| Modelo | Parametros | Contexto | Licencia | Documentacion |
|---|---|---|---|---|
| Centauri-Bloom/Bloom-Chat-0.2 | no disponible | no disponible | Apache 2.0 | practicamente inexistente |
| BLOOM (bigscience) | 176B (version principal) | 2.048 tokens | BigScience RAIL | completa |
| BLOOMZ (bigscience) | hasta 176B | 2.048 tokens | BigScience RAIL | completa |
| Modelos chat abiertos de 7B-8B (p. ej. variantes de Llama o Mistral) | 7B-8B | 8.192-32.768 tokens segun variante | licencias especificas por modelo | completa |

La comparacion directa con Bloom-Chat-0.2 queda marcada como "no disponible" por falta de datos del propio modelo.

## Limitaciones y advertencias

- Ausencia total de model card tecnica: no se puede verificar arquitectura, tamano, contexto ni datos de entrenamiento.
- Riesgo elevado de alucinacion y comportamiento impredecible al desconocerse el proceso de alineacion.
- Sesgos desconocidos: sin informacion sobre la composicion del dataset no es posible evaluar sesgos de genero, idioma o dominio.
- Cobertura idiomatica sin confirmar; el castellano podria no estar soportado o estarlo de forma deficitaria.
- Cero descargas y cero interacciones registradas: no existe validacion por parte de la comunidad.
- Fecha de creacion futura en los metadatos (2026-11-26), lo que sugiere metadatos anomalos o generados automaticamente; conviene tratarlos con cautela.
- La licencia Apache 2.0 permite uso comercial, pero ello no exime de evaluar calidad, seguridad y cumplimiento antes de desplegar el modelo.
- No apto para produccion sin auditoria previa de pesos, tokenizador y comportamiento.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Centauri-Bloom/Bloom-Chat-0.2
- Modelo original BLOOM (referencia de la familia nominal): https://huggingface.co/bigscience/bloom
- Modelo BLOOMZ (referencia de variante instruida): https://huggingface.co/bigscience/bloomz
- Paper de BLOOM: https://arxiv.org/abs/2211.05100
- Paper de BLOOMZ: https://arxiv.org/abs/2211.01786
