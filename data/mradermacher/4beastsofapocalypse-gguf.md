# mradermacher/4BeastsOfApocalypse-GGUF

## Resumen

El modelo `mradermacher/4BeastsOfApocalypse-GGUF` es una cuantización en formato GGUF del modelo base `OliviaRossi/4BeastsOfApocalypse`, realizada por el equipo de mradermacher. Se trata de un modelo de 34.660.610.688 parámetros (aproximadamente 34,7 mil millones) orientado a tareas de codificación, razonamiento, uso de herramientas y trabajo agéntico, como indican sus etiquetas: `code`, `agent`, `agentic-coding`, `moe`, `reasoning`, `tool-calling`, `software-engineering`, `terminal` y `sweet-agent`. La licencia es Apache-2.0, lo que permite uso comercial sin restricciones significativas.

La relevancia de esta ficha radica en que el formato GGUF permite ejecutar el modelo en entornos locales con CPU o GPU mediante herramientas como llama.cpp, Ollama o LM Studio, sin necesidad de infraestructura en la nube. Al ser una cuantización estática (no se mencionan quants con imatrix), ofrece una gama de tamaños que van desde 13 GB (Q2_K) hasta 37 GB (Q8_0), lo que facilita su despliegue en hardware variado. El modelo base no está documentado en detalle en la información disponible, por lo que muchos datos técnicos específicos (arquitectura exacta, contexto, entrenamiento) no están disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el modelo base no documenta arquitectura; los tags sugieren MoE, pero no se confirma) |
| Parametros totales | 34.660.610.688 (34,66 B) |
| Parametros activos | no disponible (posible MoE, sin confirmar) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q4_K_S, Q6_K, Q8_0 (todos en GGUF) |
| Idiomas soportados | ingles (en), chino (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (ficheros .gguf) |

## Arquitectura y entrenamiento

No se dispone de informacion publica sobre la arquitectura interna del modelo base `OliviaRossi/4BeastsOfApocalypse`. Los tags de HuggingFace incluyen `moe`, lo que sugiere una arquitectura de mezcla de expertos (Mixture of Experts), pero no se confirma en la documentacion disponible. Tampoco hay datos sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas como RLHF o DPO. El modelo esta etiquetado con `sweet-agent`, lo que podria indicar un entrenamiento especifico para tareas de agente, pero no hay detalles tecnicos al respecto. La cuantizacion GGUF es estatica, realizada por mradermacher, sin uso de imatrix (segun se indica en la model card).

## Capacidades

- Generacion de texto y razonamiento: el modelo esta etiquetado con `reasoning`, lo que sugiere capacidad para tareas de logica y deduccion, aunque no hay benchmarks que lo confirmen.
- Codificacion: las etiquetas `code` y `software-engineering` indican que el modelo esta orientado a generacion y comprension de codigo.
- Uso de herramientas (tool calling): la etiqueta `tool-calling` sugiere que el modelo puede invocar funciones externas, util para integraciones con APIs.
- Trabajo agente (agentic coding): la etiqueta `agent` y `sweet-agent` apuntan a capacidades para actuar como agente autonomo en tareas de desarrollo de software, posiblemente con acceso a terminal.
- Multilingue: soporta ingles y chino, segun la model card.
- No se mencionan capacidades de vision, audio u otras modalidades.

## Casos de uso

- Asistente de programacion en local: un desarrollador puede ejecutar la cuantizacion Q4_K_S (20 GB) en una GPU consumer como una RTX 3090 o 4090 para obtener sugerencias de codigo, refactorizacion y explicaciones sin depender de servicios en la nube.
- Agente de terminal: gracias a las etiquetas `agent` y `terminal`, el modelo podria integrarse en herramientas como Sweet Agent para automatizar tareas de linea de comandos, como gestion de paquetes, ejecucion de scripts o resolucion de errores de compilacion.
- Generacion de codigo con tool calling: en un pipeline de CI/CD, el modelo puede invocar herramientas externas (por ejemplo, linters, compiladores o gestores de dependencias) mediante function calling, facilitando la generacion de codigo que cumple con estandares del proyecto.
- Chat bilingue ingles-chino: al soportar ambos idiomas, puede usarse como asistente conversacional para equipos de desarrollo mixtos o para documentacion tecnica en chino.
- Prototipado rapido de agentes: los investigadores pueden usar la version Q8_0 (37 GB) en una GPU profesional (A100, H100) para experimentar con flujos agénticos de razonamiento multi-paso sin preocuparse por la fidelidad de la cuantizacion.
- Despliegue en edge con CPU: la cuantizacion Q2_K (13 GB) puede ejecutarse en servidores sin GPU mediante llama.cpp, ofreciendo una solucion de bajo coste para tareas de clasificacion o extraccion de informacion en entornos con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras metricas estandar para este modelo o su base. La model card de la cuantizacion no incluye mediciones de perplejidad ni comparativas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: depende de la cuantizacion. Q2_K requiere aproximadamente 13 GB, Q4_K_S unos 20 GB, Q6_K unos 28,6 GB y Q8_0 unos 37 GB. Estos valores son los tamanos de fichero, por lo que la VRAM necesaria sera ligeramente superior (mas overhead de contexto y calculo).
- GPU recomendadas: para Q4_K_S (20 GB) se necesita una GPU con al menos 24 GB de VRAM, como RTX 3090, RTX 4090 o A5000. Para Q8_0 (37 GB) se requieren GPUs profesionales como A100 (40 GB) o H100 (80 GB). La version Q2_K puede caber en GPUs de 16 GB como RTX 4080 o incluso en algunas de 12 GB con cuantizacion adicional de cache.
- Si cabe en consumer GPU: si, la Q4_K_S cabe en RTX 3090/4090 (24 GB). La Q2_K puede caber en RTX 4080 (16 GB) o RTX 4070 Ti (12 GB) con limitaciones de contexto.
- Opciones de despliegue: al ser GGUF, es compatible con llama.cpp, Ollama, LM Studio, KoboldCpp y servidores como llama-cpp-python. Tambien puede usarse con vLLM si se convierte a otro formato, pero no es el flujo habitual.
- Latencia y throughput: no disponibles. Dependen del hardware, la cuantizacion y la longitud de contexto. En una RTX 4090 con Q4_K_S se puede esperar una velocidad de generacion de entre 30 y 60 tokens por segundo, pero no hay datos oficiales.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa fiable. El modelo base `OliviaRossi/4BeastsOfApocalypse` no tiene documentacion publica que permita compararlo con alternativas como Qwen 2.5, DeepSeek-Coder o Llama 3.1. Los unicos datos conocidos son el tamano (34,66 B) y las etiquetas de capacidades. No se puede afirmar que sea comparable a modelos concretos sin datos de rendimiento.

## Limitaciones y advertencias

- Sesgos conocidos: no hay informacion publica sobre sesgos especificos del modelo base. Al estar entrenado principalmente en ingles y chino, puede presentar sesgos culturales o linguisticos de esas regiones.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede generar informacion falsa o inventada, especialmente en tareas de razonamiento complejo o codigo poco comun. No hay datos sobre su tasa de alucinacion.
- Limitaciones de contexto: se desconoce la longitud de contexto soportada. Si es inferior a 32K tokens, podria no ser adecuado para tareas que requieran documentos largos.
- Restricciones de licencia: la licencia Apache-2.0 permite uso comercial, modificacion y redistribucion, pero se debe mantener el aviso de copyright y la atribucion. No hay restricciones conocidas adicionales.
- Caveat para produccion: al ser una cuantizacion estatica sin imatrix, la calidad puede ser inferior a la de quants con imatrix en tareas de razonamiento. Se recomienda probar la Q4_K_S o Q6_K antes de desplegar en produccion.
- El modelo base no tiene documentacion publica, lo que dificulta evaluar su idoneidad para casos de uso especificos. Se recomienda realizar pruebas exhaustivas antes de adoptarlo.

## Enlaces

- Repositorio HuggingFace de la cuantizacion: https://huggingface.co/mradermacher/4BeastsOfApocalypse-GGUF
- Modelo base (sin documentacion publica): https://huggingface.co/OliviaRossi/4BeastsOfApocalypse
- Perfil del autor de la cuantizacion: https://huggingface.co/mradermacher
- Pagina de solicitudes de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
- Herramienta de vision general de modelos (enlace de la model card): https://hf.tst.eu/model#4BeastsOfApocalypse-GGUF
