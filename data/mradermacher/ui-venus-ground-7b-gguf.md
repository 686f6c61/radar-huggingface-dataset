# mradermacher/UI-Venus-Ground-7B-GGUF

## Resumen

UI-Venus-Ground-7B es un modelo multimodal especializado en *grounding* de interfaces de usuario, es decir, en localizar elementos concretos dentro de capturas de pantalla de aplicaciones y sitios web a partir de instrucciones en lenguaje natural. El modelo original lo desarrolla inclusionAI, y esta ficha corresponde a la version cuantizada en formato GGUF publicada por mradermacher, que permite ejecutar el modelo en hardware de consumo mediante llama.cpp y herramientas compatibles con GGUF.

El modelo cuenta con 7.615.616.512 parametros (aproximadamente 7,6 mil millones) y esta construido sobre una arquitectura transformer multimodal que combina un codificador visual con un modelo de lenguaje. Su proposito es servir como componente de percepcion en agentes que operan sobre interfaces graficas: dado un par (imagen de pantalla, instruccion textual), devuelve las coordenadas del elemento relevante para que un agente pueda hacer clic, escribir o interactuar con el.

La relevancia actual radica en el auge de los agentes de navegador y de automatizacion de escritorio, que necesitan modelos capaces de interpretar la UI de forma fiable y con baja latencia. Esta version GGUF facilita el despliegue local sin GPU de datacenter, aunque la informacion disponible sobre el modelo base es limitada y muchos detalles tecnicos deben marcarse como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (codificador visual + modelo de lenguaje); detalles de la arquitectura interna no disponibles |
| Parametros totales | 7.615.616.512 (aproximadamente 7,6 mil millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K; ademas mmproj en f16 y Q8_0 para la parte multimodal |
| Idiomas soportados | Ingles (segun la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base original se distribuye en safetensors |
| Tamano del repositorio | 70,4 GB (incluye todas las cuantizaciones) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base inclusionAI/UI-Venus-Ground-7B. Por el tipo de tarea (grounding visual sobre capturas de pantalla) y el tamano (7,6 mil millones de parametros), se trata de un modelo multimodal que procesa imagenes mediante un codificador visual y genera texto o coordenadas mediante un modelo de lenguaje. La presencia de ficheros `mmproj` en el repositorio GGUF confirma que la parte visual se distribuye como un proyector multimodal separado, compatible con llama.cpp.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO. Tampoco se documentan innovaciones tecnicas especificas como decodificacion especulativa o atencion lineal. La model card del repositorio cuantizado se limita a describir el proceso de cuantizacion estatica y a listar los ficheros generados; no incluye detalles del entrenamiento original.

## Capacidades

- Grounding de interfaces de usuario: localizacion de elementos (botones, campos de texto, enlaces, iconos) en capturas de pantalla a partir de instrucciones en lenguaje natural.
- Comprension visual de pantallas: interpretacion de la estructura de una UI para identificar regiones interactivas.
- Generacion de coordenadas o regiones: salida orientada a la accion, pensada para que un agente ejecute clics o interacciones.
- Procesamiento multimodal: entrada conjunta de imagen y texto.
- Conversacion: el repositorio incluye la etiqueta `conversational`, lo que sugiere soporte de interaccion por turnos, aunque no se detalla su alcance.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado de forma explicita; el modelo esta pensado como componente de percepcion dentro de un agente, no necesariamente como planificador autonomo.
- Capacidades multilingues: limitadas al ingles segun la model card.
- Modo thinking, vision, audio: vision confirmada; thinking y audio no disponibles.

## Casos de uso

- Agentes de navegador web: el modelo recibe una captura de pantalla y una instruccion ("pulsa el boton de iniciar sesion") y devuelve la ubicacion del elemento, permitiendo que un agente automatice tareas de navegacion.
- Automatizacion de pruebas de interfaz (UI testing): integrado en pipelines de QA, permite localizar elementos por descripcion semantica en lugar de selectores fragiles, lo que reduce el mantenimiento de los tests ante cambios de diseno.
- RPA (automatizacion robótica de procesos): sustituye o complementa la deteccion por coordenadas fijas en flujos de escritorio, adaptandose a variaciones de resolucion y disposicion.
- Asistentes de accesibilidad: ayuda a usuarios con discapacidad visual a localizar y describir elementos interactivos de una aplicacion a partir de una captura de pantalla.
- Extraccion de datos de aplicaciones sin API: un agente puede identificar y leer campos de formularios o tablas en pantallas de sistemas legacy que no ofrecen integracion programatica.
- Agentes de operacion de escritorio: en combinacion con un modelo de planificacion, el modelo actua como modulo de percepcion para decidir donde hacer clic o que campo rellenar en tareas de automatizacion de back office.
- Despliegue local en entornos con requisitos de privacidad: al distribuirse en GGUF, puede ejecutarse en estaciones de trabajo sin enviar capturas de pantalla a servicios en la nube, lo que resulta adecuado para entornos con datos sensibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos del modelo de lenguaje, sin contar el proyector visual ni el contexto):
  - Q4_K_M: aproximadamente 4,8 GB.
  - Q5_K_M: aproximadamente 5,5 GB.
  - Q6_K: aproximadamente 6,4 GB.
  - Q8_0: aproximadamente 8,2 GB.
  - f16: aproximadamente 15,3 GB.
- Proyector multimodal adicional (`mmproj`): 1,0 GB en Q8_0 y 1,5 GB en f16.
- GPU recomendadas: para cuantizaciones Q4 y Q5, tarjetas consumer con 8 GB o mas de VRAM (RTX 3060 Ti, RTX 4060 Ti, RTX 4070). Para Q8_0, se recomienda 10-12 GB (RTX 3080, RTX 4070 Ti, RTX 4080). Para f16, 16 GB o mas (RTX 4090, A100, H100).
- Cabe en GPU de consumo: si, en cuantizaciones Q4_K_M y Q5_K_M con tarjetas de 8 GB o mas, dejando margen para el proyector visual y el contexto.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF (LM Studio, koboldcpp, entre otros). El repositorio incluye la etiqueta `endpoints_compatible`.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de comparativas publicadas en la informacion proporcionada para establecer una comparacion cuantitativa fiable con alternativas de la misma categoria (grounding de UI). Se indica "no disponible" para evitar inferencias sin respaldo.

## Limitaciones y advertencias

- Idioma: el modelo esta entrenado y documentado solo para ingles; su rendimiento en castellano u otros idiomas no esta garantizado.
- Tarea especifica: esta disenado para grounding de UI, no como modelo de proposito general; no debe esperarse un rendimiento competitivo en generacion de texto abierto, codigo o matematicas.
- Riesgo de alucinacion: como modelo de grounding, puede devolver coordenadas plausibles pero incorrectas cuando la instruccion es ambigua o el elemento no esta presente en la pantalla.
- Sesgos: no se documentan sesgos conocidos, pero al ser un modelo entrenado sobre capturas de UI, puede tener un rendimiento desigual segun el tipo de aplicacion, resolucion o estilo visual.
- Dependencia de la calidad de la captura: la precision puede degradarse con imagenes de baja resolucion, recortes o interfaces muy densas.
- Licencia: Apache 2.0, lo que permite uso comercial, pero conviene verificar las condiciones del modelo base original (inclusionAI/UI-Venus-Ground-7B) y de los datos de entrenamiento.
- Cuantizaciones agresivas: Q2_K y Q3_K_S pueden degradar notablemente la precision del grounding; para produccion se recomienda Q4_K_M o superior.
- El repositorio GGUF es una conversion de terceros (mradermacher); no es una publicacion oficial de inclusionAI, por lo que la fidelidad respecto al modelo original debe validarse en el caso de uso concreto.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/UI-Venus-Ground-7B-GGUF
- Modelo base original: https://huggingface.co/inclusionAI/UI-Venus-Ground-7B
- Cuantizaciones con imatrix: https://huggingface.co/mradermacher/UI-Venus-Ground-7B-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#UI-Venus-Ground-7B-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
