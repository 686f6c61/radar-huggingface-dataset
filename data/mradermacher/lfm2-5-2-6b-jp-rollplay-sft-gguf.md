# mradermacher/LFM2.5-2.6B-JP-RollPlay-SFT-GGUF

## Resumen

LFM2.5-2.6B-JP-RollPlay-SFT es un modelo de lenguaje de 2.697 millones de parametros, especializado en roleplay y dialogo en japones. Se trata de una version afinada del modelo base LFM2.5-2.6B de Liquid AI, que ha sido posteriormente cuantizada a formato GGUF por mradermacher para su ejecucion eficiente en hardware de consumo. El modelo esta disenado para conversaciones multi-turno de caracter narrativo y de interpretacion de personajes, con un enfoque exclusivo en el idioma japones.

La relevancia de este modelo reside en su tamano compacto, que permite su despliegue en dispositivos con recursos limitados, y en su especializacion en un nicho concreto: el roleplay textual en japones. Combina la arquitectura hibrida del modelo base de Liquid AI con un ajuste fino supervisado (SFT) realizado sobre datasets de dialogos de roleplay en japones. El resultado es un modelo ligero y especializado, disponible en multiples niveles de cuantizacion para adaptarse a diferentes capacidades de hardware.

Este repositorio concreto contiene las cuantizaciones GGUF del modelo afinado, facilitando su uso con herramientas como llama.cpp, Ollama o LM Studio. El modelo base, CloudGoat/LFM2.5-2.6B-JP-RollPlay-SFT, no esta disponible en el repositorio original, pero su version cuantizada aqui presentada ofrece una via de acceso practica para desarrolladores interesados en roleplay japones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base: LFM2.5-2.6B de Liquid AI, arquitectura hibrida LFM2) |
| Parametros totales | 2.697.198.592 (2,6B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la ficha del modelo (el modelo base soporta 128K tokens) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | ja (japones) |
| Licencia | no disponible (el modelo base usa licencia lfm1.0) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La informacion disponible sobre la arquitectura interna de este modelo es limitada. El modelo base, LFM2.5-2.6B de Liquid AI, emplea una arquitectura hibrida denominada LFM2, que combina capas de atencion con mecanismos de estado (SSM). Sin embargo, los detalles especificos de la arquitectura del afinado para roleplay no se han publicado en la model card.

El entrenamiento se realizo mediante ajuste fino supervisado (SFT) sobre dos datasets de roleplay en japones: CausalLM/Kingfall-Roleplay y OmniAICreator/Japanese-Roleplay-Dialogues. El proceso de cuantizacion posterior a GGUF fue realizado por mradermacher, quien genero doce niveles de cuantizacion diferentes para adaptarse a distintos requisitos de memoria y calidad. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion exacta de los datasets ni si se emplearon tecnicas adicionales como RLHF o DPO.

## Capacidades

- Generacion de texto narrativo en japones, especializado en dialogos de roleplay y ficcion interactiva.
- Conversaciones multi-turno con coherencia contextual, gracias al ajuste fino sobre dialogos de roleplay.
- Interpretacion de personajes con estilos de habla diferenciados, basado en los datasets de entrenamiento.
- Comprension del idioma japones como unico idioma soportado.
- Ejecucion local en hardware de consumo gracias al formato GGUF y al tamano compacto del modelo.
- Soporte para inferencia en CPU y GPU mediante herramientas compatibles con GGUF (llama.cpp, Ollama, LM Studio).

## Casos de uso

- Juegos de rol por texto en japones: el modelo puede actuar como maestro de juego o como personaje no jugador (PNJ) en partidas de rol escritas, manteniendo la coherencia narrativa a lo largo de multiples turnos.
- Creacion de novelas visuales interactivas: desarrolladores de novelas visuales pueden integrar el modelo como motor de dialogo para personajes, generando respuestas contextuales en japones.
- Practica de japones conversacional: estudiantes de japones pueden interactuar con el modelo en escenarios de roleplay para practicar expresiones coloquiales y formales en contexto.
- Chatbots de entretenimiento con personalidad: el modelo puede configurarse con distintos personajes para aplicaciones de chat tematico, aprovechando su especializacion en roleplay.
- Prototipado rapido de NPCs en juegos: desarrolladores de videojuegos pueden usar el modelo para generar dialogos de personajes secundarios durante la fase de prototipado, antes de implementar sistemas mas complejos.
- Generacion de historias colaborativas: escritores pueden usar el modelo como coautor en proyectos de ficcion interactiva en japones, explorando ramificaciones narrativas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks para la version afinada LFM2.5-2.6B-JP-RollPlay-SFT en la informacion disponible. El modelo base LFM2.5-2.6B de Liquid AI reporta puntuaciones de 59,2% en IFBench, 80,1% en Multi-IF y 77,8% en ToolSandbox, pero estos datos corresponden al modelo original, no al afinado para roleplay.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 1,2 GB (cuantizacion Q2_K) y 5,5 GB (f16), segun el nivel de cuantizacion elegido.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para las cuantizaciones Q4 o superiores. Modelos como GTX 1060 6GB, RTX 2060 o superiores son suficientes.
- Compatible con CPU: las cuantizaciones Q4_K_M y superiores pueden ejecutarse en CPU con 8 GB de RAM o mas, con velocidades aceptables.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, kobold.cpp y cualquier otra herramienta compatible con formato GGUF.
- Latencia y throughput: no disponible en la informacion proporcionada, aunque el modelo base alcanza 220 tokens/s en hardware optimizado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| LFM2.5-2.6B-JP-RollPlay-SFT (GGUF) | 2,6B | no disponible | ja | no disponible | GGUF |
| LFM2.5-2.6B (base) | 2,6B | 128K | 16 idiomas | lfm1.0 | safetensors |
| LFM2.5-2.6B-GGUF (base cuantizado) | 2,6B | 128K | 16 idiomas | lfm1.0 | GGUF |

La comparativa se limita al modelo base de Liquid AI, ya que no se dispone de informacion sobre otros modelos de roleplay japones de tamano similar en la informacion proporcionada. La principal diferencia entre el modelo afinado y el base es la especializacion en japones y roleplay, a costa de perder el soporte multilingue y posiblemente las capacidades de tool calling del modelo original.

## Limitaciones y advertencias

- El modelo solo soporta japones; cualquier consulta en otro idioma producira resultados incorrectos o incoherentes.
- La licencia del modelo no esta especificada en la ficha, lo que genera incertidumbre sobre su uso comercial. Se recomienda contactar con el autor o consultar la licencia del modelo base (lfm1.0) antes de usarlo en produccion.
- El modelo esta especializado en roleplay y puede producir contenido narrativo inapropiado o con sesgos presentes en los datasets de entrenamiento.
- No se dispone de informacion sobre la longitud de contexto efectiva tras el ajuste fino, que podria diferir de los 128K tokens del modelo base.
- La calidad de las cuantizaciones mas agresivas (Q2_K, Q3_K) puede degradar notablemente la coherencia del texto generado, especialmente en conversaciones largas.
- El modelo no ha sido evaluado en benchmarks publicos, por lo que su rendimiento real en tareas de roleplay no esta verificado de forma independiente.
- El repositorio no incluye el modelo en formato safetensors, solo las cuantizaciones GGUF, lo que limita su uso con frameworks que requieren pesos originales.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/LFM2.5-2.6B-JP-RollPlay-SFT-GGUF
- Modelo base (CloudGoat): https://huggingface.co/CloudGoat/LFM2.5-2.6B-JP-RollPlay-SFT
- Modelo base original (LiquidAI): https://huggingface.co/LiquidAI/LFM2.5-2.6B
- Cuantizacion del modelo base: https://huggingface.co/mradermacher/LFM2.5-2.6B-GGUF
- Documentacion del modelo base: https://docs.liquid.ai/lfm/models/lfm25-2.6b
- Blog de Liquid AI sobre LFM2.5-2.6B: https://www.liquid.ai/blog/lfm2-5-2-6b
- Pagina de benchmarks: https://benchgen.com/models/liquid-ai/lfm2-5-2-6b
