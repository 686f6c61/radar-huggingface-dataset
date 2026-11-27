# jimmylearnML/DiffusorRT-iPhone-Qwen3.5-4B-DFlash-ANE-Q4

## Resumen

DiffusorRT-iPhone-Qwen3.5-4B-DFlash-ANE-Q4 es un modelo borrador (draft model) de decodificacion especulativa derivado de z-lab/Qwen3.5-4B-DFlash y empaquetado por jimmylearnML para ejecutarse en la Neural Engine (ANE) de dispositivos iPhone con iOS 18 o superior. No es un modelo de proposito general: su funcion es proponer tokens candidatos que el modelo objetivo Qwen3.5-4B (cuantizado a Q4) valida, acelerando la generacion en el dispositivo. El repositorio ocupa 0,6 GB y contiene pesos cuantizados a 4 bits mediante tablas de consulta (lookup tables), compilados para el runtime XInfer.

El modelo hereda la arquitectura de la familia Qwen3.5-4B, con aproximadamente 4.000 millones de parametros en el modelo base, aunque la model card no detalla la configuracion exacta del borrador ni la longitud de contexto efectiva. La licencia es MIT, lo que facilita su integracion en aplicaciones comerciales, y el autor advierte explicitamente de que se requiere el modelo objetivo Qwen3.5-4B Q4 por separado y de que esta variante no es la version Metal del borrador.

Su relevancia es practica: ejemplifica el patron de despliegue de inferencia local en movil combinando decodificacion especulativa con aceleracion por hardware dedicado (ANE), un enfoque que reduce la latencia percibida en asistentes y aplicaciones de texto en el propio telefono sin depender de la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-4B-DFlash); no se detalla configuracion interna |
| Parametros totales | ~4B en el modelo base; tamano del borrador no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4 (4 bits mediante lookup tables) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | pesos compilados para XInfer/ANE; checksums en iphone-pack.json |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del borrador mas alla de su origen en z-lab/Qwen3.5-4B-DFlash, un modelo de la familia Qwen3.5 con 4.000 millones de parametros. El prefijo DFlash sugiere una variante optimizada para decodificacion rapida o especulativa, pero no se confirma en la documentacion proporcionada. Tampoco se detallan datos de entrenamiento, numero de tokens, composicion del dataset ni si hubo fases de RLHF o DPO.

La innovacion tecnica documentada es el empaquetado: cuantizacion a 4 bits con lookup tables y compilacion especifica para la Neural Engine de Apple, gestionada por el runtime XInfer. El modelo esta disenado para operar en pareja con un modelo objetivo Qwen3.5-4B Q4 y no de forma autonoma. El autor distingue esta variante de la version Metal del mismo borrador, lo que implica dos rutas de ejecucion distintas segun el backend disponible en el dispositivo.

## Capacidades

- Decodificacion especulativa: genera tokens candidatos para que el modelo objetivo Qwen3.5-4B Q4 los verifique, reduciendo el numero de pasos de decodificacion.
- Inferencia local en iPhone: compilado para la Neural Engine con iOS 18 o superior.
- Ejecucion de baja memoria: pesos a 4 bits con lookup tables para minimizar el uso de memoria y energia.
- Integracion con el runtime XInfer: requiere el modelo objetivo Qwen3.5-4B Q4 instalado por separado.
- Capacidades generativas del modelo base (texto, razonamiento, codigo): no documentadas en esta ficha; dependen del modelo objetivo y del modelo base Qwen3.5-4B-DFlash.
- Tool calling, agentes, vision, audio y modo thinking: no disponible en la informacion proporcionada.

## Casos de uso

- Asistentes de texto offline en iPhone: el borrador acelera la generacion junto al modelo objetivo Qwen3.5-4B Q4, permitiendo respuestas con menor latencia sin conexion a la nube.
- Autocompletado y teclados predictivos: la decodificacion especulativa reduce el coste por token en sugerencias continuas dentro de apps de escritura.
- Resumen de notas y correos en el dispositivo: procesar texto del usuario localmente evita enviar datos personales a servidores externos.
- Chatbot integrado en aplicaciones iOS: combinado con el modelo objetivo, ofrece conversacion multi-turno en el telefono con consumo energetico contenido gracias a la ANE.
- Prototipado de inferencia en movil: util para desarrolladores que evaluan pipelines de decodificacion especulativa con XInfer antes de pasar a produccion.
- Traduccion o reescritura de texto en local: tareas de generacion corta donde la latencia por token es critica y el contexto requerido es moderado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Hardware objetivo: iPhone con Neural Engine y iOS 18 o superior; no se especifican modelos concretos de dispositivo.
- VRAM/memoria: el repositorio ocupa 0,6 GB; el consumo en ejecucion depende del modelo objetivo Qwen3.5-4B Q4, que debe cargarse adicionalmente.
- GPU de escritorio: no aplicable; esta variante esta compilada para ANE, no para CUDA ni Metal.
- Opciones de despliegue: runtime XInfer en iOS; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Plataforma | Notas |
|---|---|---|---|---|---|
| DiffusorRT-iPhone-Qwen3.5-4B-DFlash-ANE-Q4 | ~4B (base) | no disponible | MIT | iPhone ANE (XInfer) | Borrador especulativo Q4; requiere modelo objetivo Q4 |
| z-lab/Qwen3.5-4B-DFlash | ~4B | no disponible | no disponible | no disponible | Modelo base del que deriva este borrador |
| Qwen3.5-4B (objetivo Q4) | ~4B | no disponible | no disponible | iOS (XInfer) | Modelo objetivo necesario para la verificacion especulativa |

No se dispone de datos de rendimiento para establecer una comparacion cuantitativa con alternativas.

## Limitaciones y advertencias

- No es un modelo autonomo: sin el modelo objetivo Qwen3.5-4B Q4 no puede generar respuestas completas.
- No es la version Metal del borrador; no puede usarse como sustituto en pipelines Metal.
- Requiere iOS 18 o superior y hardware con Neural Engine; queda fuera de Android y de escritorio.
- La cuantizacion Q4 con lookup tables puede degradar la calidad de las propuestas de tokens frente a precisiones mayores.
- No se documentan sesgos, riesgo de alucinacion ni cobertura idiomatica del modelo; deben evaluarse con el modelo base y el objetivo.
- La licencia MIT permite uso comercial, pero conviene verificar las condiciones del modelo base z-lab/Qwen3.5-4B-DFlash y del modelo objetivo.
- El repositorio tiene cero descargas y cero likes en el momento de la consulta; no hay evidencia de validacion por la comunidad.
- Verificar la integridad de los pesos con los checksums de iphone-pack.json antes del despliegue.

## Enlaces

- Hugging Face: https://huggingface.co/jimmylearnML/DiffusorRT-iPhone-Qwen3.5-4B-DFlash-ANE-Q4
- Modelo base: https://huggingface.co/z-lab/Qwen3.5-4B-DFlash
- Checksums del paquete: https://huggingface.co/jimmylearnML/DiffusorRT-iPhone-Qwen3.5-4B-DFlash-ANE-Q4/blob/main/iphone-pack.json
- Licencia: https://huggingface.co/jimmylearnML/DiffusorRT-iPhone-Qwen3.5-4B-DFlash-ANE-Q4/blob/main/LICENSE
