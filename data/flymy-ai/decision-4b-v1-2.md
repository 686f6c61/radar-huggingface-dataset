# flymy-ai/decision-4b-v1.2

## Resumen

Decision 4B v1.2 es un adaptador LoRA publicado por flymy-ai sobre el modelo base Qwen/Qwen3.5-4B, orientado a lo que el autor denomina "decisiones tipadas": se le entrega un estado (un ticket, una politica y un caso, un log, una respuesta que hay que juzgar) junto con una pregunta y un conjunto cerrado de opciones, y devuelve una distribucion de probabilidad sobre cada opcion declarada en un unico forward pass. No genera texto: la salida es una etiqueta con su probabilidad, y ninguna etiqueta fuera del conjunto declarado puede aparecer.

El adaptador tiene 14,4 millones de parametros entrenables (LoRA de rango 16, alpha 32, dropout 0,05) aplicados a las proyecciones de atencion de ambos tipos de capa de la base, admite entradas de hasta 16.384 tokens y esta licenciado bajo Apache-2.0. Es un proyecto independiente: el autor declara explicitamente que no es un release de TypeSafe, no esta afiliado a ella y no reconstruye la implementacion cerrada de Jev.

Su relevancia practica esta en el nicho de la clasificacion con calibracion: el autor publica ECE de 0,070 y una fidelidad de 87,3 a las distribuciones gold exactas en el tramo hard publico de JevBench, con latencias de 19,3 ms (p50) por decision corta en una RTX 4090. Se trata de una preview con 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre Qwen/Qwen3.5-4B; transformer con proyecciones de atencion de dos tipos de capa (q_proj, k_proj, v_proj, o_proj, in_proj_qkv, in_proj_z, in_proj_a, in_proj_b, out_proj) |
| Parametros totales | No disponible en la model card; la base Qwen3.5-4B implica del orden de 4.000 millones, mas 14,4 millones de parametros entrenables del adaptador |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | Hasta 16.384 tokens de entrada |
| Tipos de cuantizacion | No disponible (no se publican versiones cuantizadas) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 (adaptador, codigo y configuracion); base Qwen3.5-4B tambien Apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA/PEFT); la base se descarga por separado |
| Libreria | peft |
| Rango LoRA / alpha / dropout | 16 / 32 / 0,05 |
| Parametros entrenables | 14,4 millones |
| Temperatura de lectura | 1,45 (fijada en model.json, ajustada solo con datos propios) |
| Tamano del repositorio | 0,1 GB |
| Modo de pensamiento | Desactivado en la plantilla de chat utilizada |
| Pipeline declarado | No disponible |

## Arquitectura y entrenamiento

El modelo no es un generador de texto, sino un cabezal de decision sobre una base congelada. El adaptador LoRA se pliega en la base en el momento de la carga y se leen los logits de las letras de las opciones en el ultimo token del prompt (proyeccion en fp32 de su estado oculto), aplicando despues un softmax con temperatura 1,45. La entrada es un unico mensaje de usuario en JSON con la forma `{evidence, criterion, options[{letter, description}]}`, con descripciones del tipo `"<key>: <text>"` y, en las preguntas de si/no, la opcion `true` antes de `false`; el formato de prompt proviene de SemIf (MIT) y el autor adopto ese renderizado tras detectar que el suyo propio perdia unos 5 puntos en los items de si/no. Los nombres de las proyecciones (in_proj_qkv, in_proj_z, in_proj_a, in_proj_b, out_proj) apuntan a un bloque de atencion lineal o hibrido en la base, aunque la model card no detalla la arquitectura interna de Qwen3.5-4B.

El entrenamiento consistio en una sola ejecucion desde la base, sin fusion de runs ni ensembles: 2 epocas, 862 pasos de como maximo 12.288 tokens con padding (9,5 millones de tokens), learning rate 3e-05 con warm-up y decaimiento coseno, entropia cruzada sobre los logits de las letras de las opciones (distribucion exacta cuando el item declara una sola respuesta), opciones de tipo choice barajadas en cada pasada y semilla 99. La receta sigue la forma de JevK5 v0.2 (allebee/jevk5, Apache-2.0). Los datos son propios mas conjuntos publicos con licencia revisada; el autor afirma que ningun item de JevBench ni salida de Jev se uso para entrenamiento, ajuste ni seleccion de modelo. En cuanto al servicio, se usa un grafo CUDA por cada longitud de entrada con padding.

## Capacidades

- Decisión con conjunto cerrado de respuestas: devuelve una distribucion de probabilidad sobre cada opcion declarada en un unico forward pass, sin generar texto.
- Tipos de decision soportados: si/no (`noul`), eleccion multiple (`choice`) y puntuacion (`score`).
- Calibracion de probabilidades: ECE de 0,070 y fidelidad de 87,3 a las distribuciones gold exactas en el tramo hard publico, a la temperatura servida.
- Juzgar respuestas: uno de los casos de uso previstos es dar una respuesta candidata y un criterio para evaluarla.
- Decisiones sobre politicas largas: admite hasta 16.384 tokens de entrada, lo que permite meter politicas extensas junto con el caso.
- Robustez a parafrasis: la familia de parafrasis del conjunto de desarrollo propio pasa de 55 a 85 puntos frente a la base congelada.
- Abstención: la familia de abstención sube de 60 a 90 en el conjunto de desarrollo propio.
- Servicio compatible con JevBench: `server.py` expone el formato de cable `/v1/systemone` de TypeSafe para el adaptador `typesafe`, y `jevbench_adapter.py` funciona en proceso.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni capacidades multilingues.

## Casos de uso

- Enrutado de tickets de soporte: dado el texto del ticket y un conjunto cerrado de categorias o colas, el modelo devuelve la probabilidad de cada una en un solo paso, lo que permite fijar umbrales de confianza y derivar a revision humana los casos con distribucion plana.
- Aplicacion de politicas con condiciones: con la politica completa (hasta 16.384 tokens) y los datos del caso, responde a preguntas del tipo "procede el reembolso" devolviendo la probabilidad de si y de no, en lugar de una justificacion generada.
- Automatizacion de reembolsos y devoluciones: la propia model card usa como ejemplo una politica de reembolso con recibo y plazo de 30 dias, adecuada para integrarse en un flujo transaccional donde se necesita una etiqueta y una confianza.
- Triaje de logs y alertas: dada una linea o un bloque de log y un criterio de clasificacion, asignar probabilidad a etiquetas como incidente, falso positivo o mantenimiento, con latencias de decenas de milisegundos compatibles con procesamiento por evento.
- Evaluacion automatica de respuestas: usar el modelo como juez binario o con escala, dandole la pregunta, la respuesta candidata y el criterio, para filtrar salidas en pipelines de generacion antes de mostrarlas.
- Control de calidad en procesos con reglas: comprobar si un formulario, una reclamacion o una solicitud cumple un conjunto de requisitos declarados, obteniendo una probabilidad por requisito y una decision agregada.
- Investigacion sobre calibracion y decision tipada: el paquete incluye adaptadores para el runner oficial de JevBench v1.4.2 y un script de ejecucion, lo que facilita reproducir mediciones sobre los 231 items publicos.
- Deteccion de trampas adversariales y de sesgo de primera opcion: la familia de trampas adversariales sube de 50 a 85 y el autor documenta que el entrenamiento elimina el habito de la base de elegir la opcion A (relevante porque en su conjunto v3 el gold esta en A en el 46 % de los items de eleccion).

## Benchmarks y rendimiento

Resultados publicados por el autor, medidos sobre la misma GPU, en la misma sesion y con el mismo prompt que la base congelada. Los cambios son pareados (items arreglados / items rotos).

| Conjunto | Qwen3.5-4B congelado | Decision 4B v1.2 | Arreglados / rotos | Referencia |
|---|---:|---:|---:|---|
| JevBench publico, hard (111) | 61,3 | 78,4 | 24 / 5 | Jev 1.13: 74,1 en el tramo hard completo (220 items, 109 reservados) |
| JevBench publico, standard (72) | 97,2 | 95,8 | 2 / 3 | No disponible |
| JevBench publico, easy (48) | 97,9 | 100,0 | 1 / 0 | No disponible |
| JevBench publico, 231 items | 80,1 | 88,3 | 27 / 8 | Jev 1.13: 86,6 |
| Conjunto hard propio de desarrollo (160, 8 familias) | 42,5 | 66,9 | 51 / 12 | Jev 1.13: 57,5 |
| Conjuntos de casos reales propios v1-v3 (407) | 88,9 | 90,9 | 24 / 16 | Jev 1.13: 94,6 / 97,8 / 98,9 en v1 / v2 / v3 |

Desglose por familia en el conjunto hard propio (base congelada -> este modelo, 20 items por familia): busquedas multi-salto 30 -> 70, decisiones de fecha y numero 10 -> 45, compromisos 25 -> 60, trampas adversariales 50 -> 85, abstención 60 -> 90, robustez a parafrasis 55 -> 85, politicas largas 55 -> 55, juicio de respuestas 55 -> 45.

Metricas adicionales comunicadas: ECE de 0,070 y fidelidad de 87,3 (1 menos la distancia de variacion total media) al gold exacto en el tramo hard publico, a la temperatura servida. Comprobacion del paquete (25 de septiembre de 2026) contra el harness JevBench v1.4.2 sobre los 231 items publicos: 203/231 con el runner oficial y con `server.py` (easy 48/48, standard 69/72, hard 86/111). El tramo de juez y el conjunto sellado de JevBench no son publicos y no se incluyen.

## Requisitos de hardware

- VRAM estimada en fp16/BF16: del orden de 8-9 GB para los pesos de una base de 4B mas el overhead del contexto; estimacion estandar, no publicada por el autor.
- VRAM estimada con cuantizacion: 4-5 GB en int8 y 2,5-3,5 GB en 4 bits para los pesos, mas la cache KV necesaria para entradas de hasta 16.384 tokens.
- GPU de consumo: si. El autor documenta una RTX 4090 con p50 de 19,3 ms y p95 de 22,7 ms por decision corta usando un grafo CUDA por longitud de entrada con padding; la ruta eager tarda 59 ms. El mismo resultado que la ruta eager en 120/120 items comprobados.
- GPU de datacenter: no documentado. No hay cifras publicadas para A100, H100 ni similares; el modelo es lo bastante pequeno como para no requerirlas.
- CPU: soportada mediante `FLYMYJEV_DEVICE=cpu`, descrita por el autor como lenta y sin grafos CUDA.
- Opciones de despliegue: el autor proporciona `model.py` (verifica cada archivo contra `manifest.json` y descarga la base fijada en el primer uso), `server.py` con el formato de cable `/v1/systemone` para el adaptador `typesafe`, `jevbench_adapter.py` como adaptador en proceso y `run_jevbench.py` para el runner oficial sin editar su registro. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Memoria en disco: 0,1 GB para el repositorio (el adaptador); la base se descarga aparte.
- Latencia y throughput: p50 19,3 ms / p95 22,7 ms por decision corta con grafos CUDA y 59 ms en eager, sobre una RTX 4090; no se publican cifras de throughput en lote.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en JevBench publico (231) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Decision 4B v1.2 (flymy-ai) | ~4B de base + 14,4 M de adaptador | 16.384 tokens | 88,3 | Apache-2.0 | Adaptador LoRA en HuggingFace; base Qwen3.5-4B aparte |
| Qwen3.5-4B congelado (base) | ~4B | No disponible | 80,1 | Apache-2.0 | HuggingFace |
| Decision 2B (FlyMy.AI, preview) | 2,28B totales, 26,2 M entrenables | No disponible | No disponible | No disponible | HuggingFace (base openbmb/MiniCPM5-2B) |
| Jev 1.13 (referencia cerrada) | No disponible | No disponible | 86,6 | No disponible (implementacion cerrada) | No disponible |

Advertencias sobre la comparativa: la cifra de 74,1 de Jev 1.13 en hard corresponde al tramo hard completo de 220 items (109 reservados), no a los 111 items publicos, por lo que no es directamente comparable con el 78,4 de este modelo; en el conjunto de casos reales propios, Jev 1.13 supera a este modelo (94,6 / 97,8 / 98,9 frente a 90,9 agregado). Las cifras de Decision 2B no se han publicado en la informacion disponible.

## Limitaciones y advertencias

- Una sola pasada de un modelo de 4B: no hay razonamiento paso a paso. La aritmetica encadenada y los documentos multi-salto largos siguen siendo debiles, segun el propio autor.
- La familia de juicio de respuestas empeora respecto a la base congelada en su conjunto hard propio (55 -> 45), y politicas largas se quedan igual (55 -> 55).
- Los mensajes en los que dos opciones son verdaderas bajo un esquema de respuesta unica no estan probados.
- Solo ingles. La calibracion se ajusto unicamente con datos propios, por lo que la temperatura servida puede no transferirse a otras distribuciones de entrada.
- Riesgo de alucinacion acotado por diseno en cuanto a la forma de salida (no puede emitir una etiqueta fuera del conjunto declarado), pero no en cuanto al contenido: una probabilidad alta sobre una opcion no implica que la evidencia la respalde.
- La temperatura (1,45) se ajusto sobre un split de calibracion propio y el conjunto hard de desarrollo; no se ajusto con items de benchmark, pero tampoco se garantiza su optimalidad fuera de esos datos.
- El modelo es una preview con 0 descargas y 0 likes, sin pipeline declarado y sin historial de uso en produccion.
- Licencia Apache-2.0 en adaptador, codigo y configuracion, y Apache-2.0 en la base, por lo que no hay restriccion conocida para uso comercial; el usuario debe verificar la licencia de la base en su revision fijada, `851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a`.
- El formato de prompt procede de SemIf (MIT) y la receta de entrenamiento sigue la forma de JevK5 v0.2 (Apache-2.0); conviene respetar esas atribuciones.
- El proyecto se declara independiente y no afiliado a TypeSafe ni a Jev; las referencias a Jev 1.13 son cifras publicadas de un sistema cerrado, no reproducibles a partir de este paquete.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/flymy-ai/decision-4b-v1.2
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B (revision 851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a)
- JevBench by Benchmark Heaven: https://benchmarkheaven.com/jev-models
- All about Jev (1116 replicaciones, modelos, runtimes y benchmarks): https://hanxiao.io/all-about-jev/
- Archivos citados en la model card sin URL publicada: `model.py`, `manifest.json`, `model.json`, `server.py`, `jevbench_adapter.py`, `run_jevbench.py`, `package_check.json`, `LICENSE`
- Referencias de terceros citadas sin URL en la model card: SemIf, de TheoLeeCJ (formato de prompt, MIT); JevK5 v0.2, de allebee/jevk5 (receta de entrenamiento, Apache-2.0); resultados de Jev 1.13
