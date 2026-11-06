# nalemi/Trinity_Demo_Win64

## Resumen

Trinity (Offline Demo Build) es una distribucion jugable de demostracion de un motor de juego narrativo y marco cognitivo desarrollado por el usuario nalemi y publicado en Hugging Face bajo el identificador `nalemi/Trinity_Demo_Win64`. No se trata de un modelo de lenguaje aislado, sino de un paquete autocontenido para Windows x64 que integra un modelo Gemma 2 9B en version abliterated ejecutado localmente mediante `llama-server`, un sistema determinista de seguimiento de estado de juego (constantes vitales, inventario, tiradas de habilidad D20) apoyado en SQLite, y una pipeline de sintesis de voz neuronal Piper basada en ONNX Runtime. El objetivo es demostrar que es posible construir una experiencia de rol narrativo completamente offline, sin telemetria y con baja latencia.

El repositorio ocupa 12,9 GB e incluye pesos cuantizados del modelo, el runtime de Piper y el cliente nativo escrito en Rust con `egui`. La distribucion esta pensada como demo tecnica, no como biblioteca reutilizable ni como modelo entrenado por el autor: el valor esta en la integracion de componentes (inferencia local, puente de estado determinista y TTS en streaming por frases) mas que en aportar un modelo nuevo.

Es relevante ahora porque ejemplifica el patron de aplicaciones de rol con IA local que combinan un LLM pequeno-mediano cuantizado, logica de juego verificable y voz sintetizada en el mismo equipo, sin dependencia de APIs en la nube. La ficha describe el paquete tal como se publica; los datos tecnicos del modelo subyacente (Gemma 2 9B) se indican solo cuando la model card los menciona explicitamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Aplicacion de escritorio en Rust (`egui`) con inferencia LLM local via `llama-server`; modelo subyacente Gemma 2 9B abliterated (arquitectura transformer, no detallada en la model card) |
| Parametros totales | 9B (modelo subyacente Gemma 2 9B); el paquete en si no es un modelo con parametros propios |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | pesos cuantizados incluidos en el paquete; el esquema concreto (GGUF Q4, Q5, etc.) no se especifica |
| Idiomas soportados | en, de |
| Licencia | MIT |
| Formato de pesos | pesos cuantizados para `llama-server` (formato exacto no disponible); Piper TTS en ONNX; distribucion como `Trinity_Demo_Win64.zip` |

## Arquitectura y entrenamiento

El paquete no entrena ningun modelo propio. La inferencia la realiza un Gemma 2 9B en version abliterated (es decir, con los rechazos del alignment eliminados) ejecutado a traves de un `llama-server` empaquetado, de forma totalmente offline y sin telemetria. Sobre esa base, Trinity anade un "State Bridge" que conecta la salida del LLM con mecanicas de juego deterministas: constantes vitales, gestion de inventario y tiradas de habilidad D20, comunicadas por IPC local y registradas en SQLite. Esta separacion entre generacion de texto y estado verificable es la innovacion principal del diseno: el LLM narra, pero el estado del mundo lo controla codigo determinista.

La capa de voz usa Piper, un sistema de TTS neuronal sobre ONNX Runtime, con bufferizacion de audio a nivel de frase para reducir la latencia percibida. El cliente es una aplicacion nativa de escritorio en Rust con `egui`. La model card no detalla el dataset de entrenamiento del modelo subyacente, el numero de tokens, ni si hubo fases de RLHF o DPO; esos datos corresponden a Gemma 2 y no se reproducen aqui por no estar en la informacion proporcionada.

## Capacidades

- Generacion de texto narrativo para roleplay y ficcion interactiva, en ingles y aleman.
- Gestion de estado de juego determinista: constantes vitales, inventario y tiradas D20 integradas con la narracion.
- Sintesis de voz neuronal local con Piper (ONNX) y streaming de audio por frases.
- Funcionamiento 100% offline, sin telemetria ni llamadas a servicios externos.
- Persistencia de eventos y estado en SQLite mediante IPC local.
- Cliente nativo de escritorio en Rust (`egui`) para Windows x64.
- No se documenta soporte de tool calling generico, function calling, agentes multi-paso, vision, audio de entrada ni modo de razonamiento explicito.

## Casos de uso

- Prototipado de videojuegos narrativos offline: el paquete sirve como base jugable para evaluar la integracion de un LLM local con mecanicas de juego deterministas antes de invertir en un motor propio.
- Demostraciones de rol con IA en entornos sin conectividad: util para talleres, ferias o entornos air-gapped donde no se puede depender de APIs en la nube.
- Investigacion sobre separacion entre narracion generativa y estado verificable: el State Bridge con SQLite y tiradas D20 es un ejemplo concreto de como mantener coherencia de mundo sin confiar en el LLM para la logica.
- Evaluacion de latencia en pipelines TTS + LLM: la bufferizacion por frases de Piper permite medir la latencia percibida en una aplicacion real de escritorio.
- Base para experimentos de "abliterated" en roleplay: permite observar el comportamiento de Gemma 2 9B sin rechazos en dialogos narrativos, con las advertencias de seguridad correspondientes.
- Referencia de arquitectura para desarrolladores Rust: el cliente `egui` y la comunicacion IPC con `llama-server` sirven como plantilla para aplicaciones de escritorio con IA local.
- Demostracion de despliegue empaquetado en Windows: el ZIP autocontenido con pesos y runtime es un ejemplo de distribucion "todo en uno" para usuarios finales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Sistema operativo: Windows 10 u 11 de 64 bits (la distribucion es exclusivamente Win64).
- GPU: NVIDIA con al menos 6-8 GB de VRAM recomendados para inferencia fluida y streaming de audio.
- Almacenamiento: aproximadamente 8 GB libres tras la extraccion; el ZIP descargable pesa unos 6,4 GB.
- Cabe en GPUs de consumo con 8 GB o mas de VRAM (por ejemplo, RTX 3060 Ti, RTX 4060 Ti, RTX 3070); no se especifica compatibilidad con GPUs AMD o Intel ni con inferencia exclusiva en CPU.
- Despliegue: el paquete incluye `llama-server` y el runtime de Piper; no se documenta soporte para vLLM, TGI, Ollama u otros servidores alternativos.
- Latencia y throughput: no disponibles; la model card solo indica que la bufferizacion por frases busca una latencia de respuesta "casi nula", sin cifras.

## Comparativa con modelos similares

| Criterio | Trinity (Offline Demo Build) | Ability.ai Trinity | Gemma 2 9B (modelo base) |
|---|---|---|---|
| Tipo | Aplicacion de escritorio con LLM local empaquetado | Plataforma self-hosted de agentes de IA | Modelo de lenguaje |
| Parametros | 9B (modelo subyacente) | no disponible | 9B |
| Contexto | no disponible | no disponible | no disponible en esta ficha |
| Rendimiento | sin benchmarks publicados | sin benchmarks publicados | sin datos en esta ficha |
| Licencia | MIT | Apache 2.0 | no disponible en esta ficha |
| Disponibilidad | ZIP para Windows x64 en Hugging Face | Repositorio en GitHub | Pesos publicos de Google |

Nota: Ability.ai Trinity es un proyecto homonimo sin relacion tecnica conocida con este paquete; se incluye solo para evitar confusiones de nombre.

## Limitaciones y advertencias

- El modelo subyacente es una version abliterated de Gemma 2 9B: se han eliminado los mecanismos de rechazo, por lo que puede generar contenido inapropiado sin filtros; no es adecuado para uso con menores ni en produccion sin moderacion adicional.
- Solo soporta ingles y aleman; no hay soporte documentado de castellano.
- La distribucion es exclusiva para Windows x64; no hay builds para Linux ni macOS.
- Es una demo tecnica, no un producto mantenido: no se documentan actualizaciones, soporte ni hoja de ruta.
- Riesgo de alucinacion inherente al LLM; el diseno mitiga parte del problema delegando el estado del juego en codigo determinista, pero la narracion sigue siendo generativa.
- La licencia MIT cubre el paquete, pero el uso de los pesos de Gemma 2 esta sujeto a la licencia original de Google, que no se detalla en la model card; conviene verificarla antes de un uso comercial.
- No se especifican los sesgos del modelo subyacente ni las caracteristicas del dataset de entrenamiento.
- El rendimiento depende de la GPU; con menos de 6 GB de VRAM la experiencia puede degradarse y no se documenta un modo CPU.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion comunitaria del paquete.

## Enlaces

- Hugging Face: https://huggingface.co/nalemi/Trinity_Demo_Win64
- Ability.ai Trinity Docs (proyecto homonimo, sin relacion conocida): https://docs.ability.ai/announcements/2026-05-12-172650
- GitHub Abilityai/trinity (proyecto homonimo, sin relacion conocida): https://github.com/abilityai/trinity
