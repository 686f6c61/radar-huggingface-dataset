# mradermacher/Kataguru-Sceptic-35B-A3B-Finnish-v3.2-GGUF

## Resumen

Kataguru-Sceptic-35B-A3B-Finnish-v3.2 es un modelo de lenguaje de tipo mezcla de expertos (MoE) con 35.505.251.456 parametros totales, desarrollado por kataguru y distribuido en formato GGUF por mradermacher. El modelo base se identifica con la arquitectura `qwen3_5_moe` y esta especializado en codigo industrial y automatizacion (PLC, CNC, G-code, IEC 61131-3, TwinCAT, Beckhoff, SCL de Siemens, OPC-UA, EtherCAT, PROFINET) ademas de programacion de sistemas en Rust, C++ y Python. Su nombre incluye el sufijo "Finnish", lo que indica un enfasis en el idioma finlandes junto con el ingles.

La relevancia de esta publicacion radica en que ofrece cuantizaciones estaticas listas para usar del modelo original, cubriendo desde Q2_K (13,3 GB) hasta Q8_0 (37,9 GB), lo que permite desplegar un MoE de 35B en hardware de consumo mediante llama.cpp u Ollama. Incorpora tambien un componente multimodal (`mmproj`) en precision Q8_0 y f16, lo que habilita entrada de vision.

La ficha describe la version GGUF; el modelo base es `kataguru/Kataguru-Sceptic-35B-A3B-Finnish-v3.2`, publicado bajo licencia Apache 2.0. No se dispone de informacion detallada sobre el entrenamiento, la composicion del dataset ni resultados de benchmarks en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE), familia `qwen3_5_moe` |
| Parametros totales | 35.505.251.456 (35,5B) |
| Parametros activos | no disponible (el sufijo A3B sugiere ~3B activos, sin confirmacion oficial) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; mmproj en Q8_0 y f16 |
| Idiomas soportados | Ingles (en) y finlandes (fi) segun la model card |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base en safetensors/bf16 |
| Tamano del repo | 244,4 GB |
| Pipeline declarado | translation |
| Cuantizaciones ponderadas (imatrix) | Disponibles en repositorio separado `-i1-GGUF` |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura transformer con mezcla de expertos (MoE), etiquetada en los metadatos como `qwen3_5_moe`, lo que indica una base derivada de la familia Qwen 3.5 con enrutamiento disperso de expertos. El numero total de parametros es de 35,5B y el sufijo "A3B" del nombre sugiere aproximadamente 3B parametros activos por token, aunque este dato no se confirma de forma explicita en la informacion disponible. El modelo base se distribuye en bfloat16/safetensors y esta orientado a tareas de codigo industrial, programacion de sistemas, razonamiento STEM, tool calling y traduccion.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni innovaciones tecnicas especificas (decodificacion especulativa, atencion lineal, etc.). La model card del repositorio GGUF es una plantilla generica de mradermacher centrada en el proceso de cuantizacion, no en el entrenamiento del modelo. El componente multimodal (`mmproj`) confirma capacidad de vision, pero no se detalla su arquitectura interna.

## Capacidades

- Generacion de texto y razonamiento general, con enfasis declarado en STEM y matematicas.
- Generacion de codigo en lenguajes de sistemas (Rust, C++, Python) y codigo industrial.
- Programacion de automatas y PLC: IEC 61131-3, Structured Text, SCL de Siemens, TwinCAT de Beckhoff.
- Generacion y analisis de G-code para CNC.
- Conocimiento de protocolos industriales: OPC-UA, EtherCAT, PROFINET.
- Razonamiento sobre seguridad funcional (functional safety).
- Tool calling y function calling, orientado a flujos agenticos.
- Soporte para RAG (recuperacion aumentada) segun etiquetas del autor.
- Capacidades multimodales de vision (vision-language) mediante el componente `mmproj`.
- Traduccion, con soporte declarado de ingles y finlandes.
- Modo "uncensored" segun etiquetas del autor (sin filtros de rechazo declarados).
- Conversacional multi-turno (tag `conversational`).

## Casos de uso

- Generacion de logica de control industrial: el modelo puede producir bloques en Structured Text (IEC 61131-3) o SCL de Siemens a partir de una descripcion funcional, lo que acelera la programacion de PLC en entornos de automatizacion.
- Asistencia en programacion de CNC: traduccion de especificaciones de mecanizado a G-code y revision de trayectorias existentes, aprovechando el entrenamiento declarado en G-code.
- Integracion en pipelines agenticos de ingenieria: gracias al soporte de tool calling y function calling, puede actuar como agente que consulta documentacion tecnica, ejecuta validaciones o invoca APIs de OPC-UA en un flujo multi-paso.
- Copiloto de codigo de sistemas en Rust, C++ y Python: autocompletado, refactorizacion y explicacion de codigo de bajo nivel en entornos de desarrollo integrado.
- Traduccion tecnica ingles-finlandes: el pipeline declarado es `translation`, y el modelo cubre ambos idiomas, lo que lo hace util para documentacion tecnica bilingue en el contexto industrial finlandes.
- Analisis de documentacion tecnica con vision: el componente multimodal permite procesar esquemas, diagramas de cableado o capturas de HMI junto con texto para extraer informacion o generar codigo asociado.
- Despliegue local en estaciones de ingenieria: las cuantizaciones Q4_K_M (21,8 GB) permiten ejecutar el modelo en workstations con GPU de consumo, sin depender de servicios en la nube, algo relevante en entornos industriales con requisitos de confidencialidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada segun cuantizacion (pesos, sin contar cache KV): Q2_K ~13,3 GB; Q3_K_M ~17,3 GB; IQ4_XS ~19,5 GB; Q4_K_M ~21,8 GB; Q5_K_M ~25,4 GB; Q6_K ~29,3 GB; Q8_0 ~37,9 GB. Añadir ~0,7-1,0 GB si se usa el componente multimodal `mmproj`.
- Al ser un MoE con ~3B parametros activos (segun el nombre), el coste computacional por token es menor que el de un denso de 35B, pero el requisito de memoria viene dominado por los pesos totales.
- GPU recomendadas: para Q4_K_M y superiores, GPU con 24 GB o mas (RTX 3090/4090, A6000, L40S); para Q8_0, A100 40 GB o H100. Las cuantizaciones Q2_K y Q3 pueden caber en GPU de 16 GB con contexto reducido.
- En consumer GPU: Q4_K_S/Q4_K_M caben en RTX 4090 (24 GB) con margen limitado para contexto; Q3_K_M puede caber en RTX 4080 (16 GB). Alternativa CPU+GPU offloading con llama.cpp.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF. El modelo base (safetensors) puede servirse con vLLM o TGI si soportan la arquitectura `qwen3_5_moe`.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de contexto para establecer una comparativa cuantitativa fiable con alternativas. A continuacion se indica lo que se conoce estructuralmente:

| Modelo | Parametros | Arquitectura | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Kataguru-Sceptic-35B-A3B-Finnish-v3.2 (esta ficha) | 35,5B totales | MoE (`qwen3_5_moe`) | no disponible | Apache 2.0 | GGUF, safetensors |
| Modelos densos de ~30-35B de la familia Qwen | no disponible | transformer denso | no disponible | no disponible | safetensors, GGUF |
| MoE de ~30B de la familia Qwen | no disponible | MoE | no disponible | no disponible | safetensors, GGUF |

No se dispone de informacion verificada sobre benchmarks comparativos; cualquier comparacion de calidad seria especulativa.

## Limitaciones y advertencias

- No hay datos publicados de benchmarks, evaluaciones de sesgo ni pruebas de alucinacion; el comportamiento real en produccion no esta validado de forma independiente.
- El enfasis en finlandes e ingles limita el rendimiento esperado en castellano y otros idiomas; la model card solo declara `en` y `fi`.
- La etiqueta "uncensored" implica ausencia declarada de filtros de rechazo, lo que aumenta el riesgo de generar contenido inapropiado o inseguro sin moderacion adicional.
- El dominio industrial (PLC, seguridad funcional) es de alto riesgo: el codigo generado para automatizacion o seguridad funcional debe revisarse por ingenieros cualificados antes de cualquier despliegue fisico.
- Las cuantizaciones de baja precision (Q2_K, Q3_K_S) degradan la calidad; el autor recomienda Q4_K_S/Q4_K_M como equilibrio y Q8_0 para maxima calidad.
- El repositorio GGUF ocupa 244,4 GB por incluir todas las cuantizaciones; conviene descargar solo el archivo necesario.
- El modelo base es de terceros (kataguru); la licencia Apache 2.0 se hereda, pero la responsabilidad sobre el entrenamiento y los datos originales recae en el autor del modelo base.
- No se dispone de informacion sobre la longitud de contexto real soportada, lo que impide planificar cargas de contexto largo con garantias.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Kataguru-Sceptic-35B-A3B-Finnish-v3.2-GGUF
- Modelo base: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-Finnish-v3.2
- Cuantizaciones ponderadas (imatrix): https://huggingface.co/mradermacher/Kataguru-Sceptic-35B-A3B-Finnish-v3.2-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Kataguru-Sceptic-35B-A3B-Finnish-v3.2-GGUF
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas sobre tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
