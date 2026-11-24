# oyekamal/molde-tiny

## Resumen

Molde tiny es un modelo de lenguaje de muy pequeno tamano (268 millones de parametros) afinado a partir de google/gemma-3-270m-it para generar MoldeScript, un lenguaje estricto y compacto que describe herramientas personales como listas, contadores, planificadores o trackers. Lo desarrolla el autor independiente oyekamal dentro del proyecto Orenda-Project/molde, cuyo objetivo es que una aplicacion movil convierta un programa MoldeScript en una pantalla funcional, totalmente offline. El modelo actua como el componente que traduce una peticion en ingles natural a un programa MoldeScript de entre 130 y 200 tokens.

La relevancia del modelo esta en su enfoque de despliegue en dispositivo: se distribuye en formato GGUF con una cuantizacion Q4_K_M de 241 MB, pensada para ejecutarse en telefonos sin conexion. No compite en capacidades generales de razonamiento, sino que se especializa en una tarea de generacion estructurada guiada por gramatica, lo que reduce el espacio de salida valido y limita errores de sintaxis.

El proyecto se encuentra en estado de trabajo en curso: cada ronda de entrenamiento se publica en su propia carpeta y ninguna se considera una version estable. La ficha se basa en la informacion disponible en la model card y en los metadatos del repositorio, sin datos publicados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de google/gemma-3-270m-it); detalles internos no disponibles |
| Parametros totales | 268.134.016 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q4_K_M (fichero principal r1-gemma270m-Q4_K_M.gguf, 241 MB); no se detallan otras variantes |
| Idiomas soportados | en (ingles) |
| Licencia | gemma (Gemma Terms of Use y Gemma Prohibited Use Policy) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo parte de google/gemma-3-270m-it, un transformer decoder-only de 268 millones de parametros en su version instruct. Sobre esa base se ha realizado un ajuste fino supervisado para la tarea de generar MoldeScript, un lenguaje pequeno y estricto que describe la interfaz y el comportamiento de una herramienta personal. La generacion se guia mediante una gramatica, de modo que la sintaxis de la salida no pueda ser invalida; el programa resultante ocupa aproximadamente entre 130 y 200 tokens.

La model card no especifica el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO. Cada ronda de entrenamiento se publica en una carpeta independiente con su propia tarjeta, que incluye modelo base, tamano de datos, puntuaciones sobre un conjunto de validacion reservado y hashes de los ficheros; las puntuaciones se miden sobre el fichero cuantizado que se distribuiria. La carpeta smoke-r0 corresponde solo a una prueba del pipeline y no debe usarse.

## Capacidades

- Generacion de programas MoldeScript a partir de descripciones en ingles natural, con sintaxis garantizada por gramatica.
- Generacion de interfaces de herramienta: listas, contadores, trackers, planificadores y estructuras similares.
- Generacion de codigo en un dominio muy acotado (lenguaje MoldeScript), no codigo de proposito general.
- Conversacion basica en ingles, heredada del modelo base instruct.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible; el modelo esta disenado para una unica generacion de programa.
- Capacidades multilingues: limitadas al ingles.
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Generacion de herramientas personales en aplicaciones moviles: el usuario describe en ingles lo que quiere (por ejemplo, un contador de habitos) y el modelo emite un programa MoldeScript de 130 a 200 tokens que la app interpreta y dibuja como pantalla funcional.
- Procesamiento totalmente offline en telefono: con el fichero Q4_K_M de 241 MB, la generacion puede ejecutarse en el dispositivo sin conexion, lo que encaja en escenarios de privacidad o conectividad limitada.
- Creacion de plantillas de UI declarativas: el modelo puede producir variantes de una misma herramienta (listas, planificadores) que la app renderiza de forma determinista a partir del programa validado.
- Prototipado rapido de asistentes de configuracion: integrado en un flujo donde el usuario dicta requisitos y el sistema genera la definicion de la herramienta antes de persistirla, manteniendo los datos guardados entre cambios.
- Filtrado y validacion de entrada: al estar guiado por gramatica, sirve como generador controlado en pipelines donde la salida debe cumplir un esquema estricto antes de ejecutarse.
- Demostraciones de generacion estructurada con modelos diminutos: util para investigacion sobre decodificacion restringida por gramatica en modelos de menos de 300 millones de parametros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que cada carpeta de ronda incluye puntuaciones sobre un conjunto de validacion reservado, medidas sobre el fichero cuantizado, pero esos valores no se recogen en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero Q4_K_M ocupa 241 MB; la huella en memoria es del orden de unos pocos cientos de MB, apta para dispositivos moviles.
- GPU recomendadas: no se especifican; por tamano, cualquier GPU consumer moderna (RTX 3060 o superior) o incluso CPU es suficiente.
- Cabe en GPU consumer: si, con amplio margen; tambien en telefonos y en CPU.
- Opciones de despliegue: llama.cpp y Ollama por el formato GGUF; el tag endpoints_compatible sugiere compatibilidad con endpoints, aunque no se detalla la infraestructura.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Formato |
|---|---|---|---|---|---|
| oyekamal/molde-tiny | 268 M | no disponible | MoldeScript / UI on-device | gemma | GGUF |
| google/gemma-3-270m-it | 270 M | no disponible | Proposito general instruct | gemma | safetensors, GGUF |
| Qwen2.5-Coder-0.5B | 494 M | 32 K (segun variante) | Codigo general | Apache 2.0 | safetensors, GGUF |

La comparativa con modelos de codigo de proposito general es solo orientativa: molde-tiny esta limitado a un lenguaje de dominio especifico y no se ha evaluado en tareas generales de codigo. No se dispone de datos de rendimiento comparativo en la informacion proporcionada.

## Limitaciones y advertencias

- Estado de trabajo en curso: ninguna carpeta se considera una version estable; la API y el formato pueden cambiar entre rondas.
- Especializacion estrecha: solo genera MoldeScript en ingles; no es adecuado para tareas generales de codigo, razonamiento o conversacion.
- Idioma: unicamente ingles, sin soporte documentado de castellano.
- Riesgo de alucinacion: aunque la gramatica restringe la sintaxis, el contenido semantico del programa puede no corresponder a la peticion del usuario; la app debe validar el programa antes de dibujarlo.
- Licencia: sujeta a los Gemma Terms of Use y a la Gemma Prohibited Use Policy; el uso comercial esta condicionado por dichos terminos.
- Contexto: la longitud de contexto no esta documentada, lo que dificulta planificar integraciones con conversaciones largas.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad fuera de las puntuaciones internas de cada carpeta.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; proyecto privado en GitHub, lo que limita la verificacion externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/oyekamal/molde-tiny
- Modelo base: https://huggingface.co/google/gemma-3-270m-it
- Proyecto en GitHub (privado por ahora): https://github.com/Orenda-Project/molde
- Terminos de uso de Gemma: https://ai.google.dev/gemma/terms
- Politica de uso prohibido de Gemma: https://ai.google.dev/gemma/prohibited_use_policy
