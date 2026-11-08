# nishtahir/ice40GPT

## Resumen

ice40GPT es un modelo de lenguaje experimental desarrollado por Nish Tahir (nishtahir) y publicado en Hugging Face bajo licencia MIT. Su particularidad no reside en el rendimiento bruto, sino en el objetivo de diseno: ejecutar un transformer generativo sobre una FPGA de la familia iCE40, concretamente el chip iCE40UP5k, un dispositivo de bajo coste con recursos muy limitados. El autor indica en su publicacion en Bluesky que ha escalado el modelo desde aproximadamente 200.000 parametros hasta 1 millon de parametros, lo que obligo a redisenar la estrategia de memoria.

Dado que el modelo ya no cabe completo en la RAM interna disponible en el iCE40UP5k, el autor opto por una arquitectura de mezcla de expertos (MoE) con streaming de expertos, de modo que solo una parte de los pesos reside en el dispositivo en cada momento y el resto se carga dinamicamente. Se trata, por tanto, de un trabajo de investigacion aplicada sobre inferencia en hardware reconfigurable de muy bajos recursos, no de un modelo destinado a produccion.

La informacion publica disponible es muy escasa: la model card esta practicamente vacia (solo declara la licencia MIT), no hay pipeline declarado, no consta ningun idioma soportado y el repositorio registra cero descargas y cero likes en el momento de la consulta. Esta ficha se limita a reflejar lo que puede confirmarse a partir de la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE) y streaming de expertos; disenado para FPGA iCE40UP5k |
| Parametros totales | Aproximadamente 1 millon (ampliacion desde unos 200.000) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

La arquitectura es un transformer con capas de mezcla de expertos. La decision de emplear MoE no responde a una busqueda de eficiencia computacional convencional, sino a una restriccion fisica: al crecer de 200.000 a 1 millon de parametros, el modelo deja de caber en la memoria disponible del iCE40UP5k, por lo que el autor implementa streaming de expertos, es decir, la carga bajo demanda de los expertos que se necesitan en cada paso de inferencia mientras el resto permanece fuera del dispositivo.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, si se aplicaron tecnicas de alineacion como RLHF o DPO, ni sobre innovaciones adicionales de decodificacion. Tampoco se detalla la configuracion concreta de expertos (numero, tamano, criterio de enrutamiento) ni el esquema de cuantizacion empleado para adaptar los pesos al hardware.

## Capacidades

- Generacion de texto a escala muy reducida: el modelo esta pensado como prueba de concepto de generacion autoregresiva en FPGA, no como asistente de proposito general.
- Ejecucion sobre hardware reconfigurable de bajos recursos (iCE40UP5k) con soporte de streaming de expertos.
- Razonamiento, codigo, matematicas, vision, audio y modo thinking: no disponible.
- Soporte de tool calling o function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.

## Casos de uso

- Investigacion en inferencia sobre FPGA: servir como base reproducible para estudiar como se comporta un transformer MoE con streaming de pesos en un dispositivo iCE40UP5k, midiendo latencia y uso de memoria.
- Docencia en arquitecturas eficientes: utilizar el diseno como ejemplo practico de compromiso entre tamano de modelo, memoria disponible y estrategia de enrutamiento de expertos.
- Pruebas de concepto de IA en el borde: evaluar si un modelo de aproximadamente 1 millon de parametros puede resolver tareas triviales de generacion en hardware sin GPU ni CPU convencional.
- Experimentacion con tecnicas de streaming de expertos: medir el coste de cargar expertos bajo demanda y compararlo con alternativas de particionado estatico.
- Benchmarking de herramientas de sintesis para FPGA: emplear el modelo como carga de trabajo realista para evaluar flujos de sintesis y colocacion en iCE40.
- Prototipado educativo de modelos de lenguaje: disponer de un ejemplo minimo y con licencia MIT para cursos sobre implementacion de transformers en hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Hardware objetivo: FPGA Lattice iCE40UP5k, con recursos de RAM interna insuficientes para alojar el millon de parametros completo, de ahi el streaming de expertos.
- VRAM estimada para inferencia: no aplicable; el modelo no esta pensado para ejecucion en GPU.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; el diseno apunta a FPGA, no a tarjetas graficas.
- Opciones de despliegue: no disponible (no consta soporte para vLLM, llama.cpp, Ollama o TGI).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada modelos comparables de la misma categoria (transformers MoE ejecutados sobre FPGA iCE40 con streaming de expertos).

## Limitaciones y advertencias

- Escala muy reducida: aproximadamente 1 millon de parametros, insuficiente para tareas de lenguaje de proposito general.
- Model card practicamente vacia: no se documentan datos de entrenamiento, tokenizador, contexto ni evaluacion, lo que impide reproducir o validar el modelo.
- Sin pipeline declarado en Hugging Face y sin descargas ni interacciones registradas, lo que sugiere un estado muy temprano o puramente experimental.
- Idiomas soportados no documentados; no puede asumirse un comportamiento multilingue.
- Riesgo de alucinacion y de salidas incoherentes no evaluado; a esta escala es esperable una calidad de generacion muy limitada.
- Licencia MIT: permite uso comercial y modificacion, pero al no haber documentacion tecnica ni garantias, cualquier uso en produccion requeriria una validacion propia completa.
- Dependencia de hardware especifico (iCE40UP5k) y de la implementacion de streaming de expertos del autor, no publicada en detalle en la informacion disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nishtahir/ice40GPT
- Publicacion del autor en Bluesky: https://bsky.app/profile/nishtahir.com/post/3mzkduu5ag22z
- Perfil de GitHub del autor: https://github.com/nishtahir
