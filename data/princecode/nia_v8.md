# Princecode/NIA_V8

## Resumen

NIA_V8 (Naabiga IA, versión 8) es un modelo de lenguaje de 4 022 millones de parámetros desarrollado por ICONEDOR, una empresa de Ouagadougou (Burkina Faso), y publicado en Hugging Face bajo el usuario Princecode. Está diseñado como una inteligencia artificial "soberana" para el contexto burkinabé y africano, con capacidades conversacionales en francés y mooré (lengua mossi), y orientado a funcionar en dispositivos móviles sin conexión. El nombre "Naabiga" significa "príncipe" en mooré, y la versión V8 hace referencia a un mecánico que logró montar ocho motores bajo un solo capó, simbolizando potencia y compacidad.

El modelo se distribuye exclusivamente en formato GGUF (cuantizaciones q4_k_m y q5_k_m), con un tamaño de archivo inferior a 3 GB, lo que permite su ejecución en teléfonos y hardware modesto. Se trata de un ajuste fino supervisado sobre un corpus de 50 164 ejemplos, con especial énfasis en diálogos multi-turno, memoria de conversación larga y datos bilingües francés-mooré. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones.

La relevancia de NIA_V8 radica en su enfoque en lenguas y contextos africanos poco representados, ofreciendo una alternativa local a los grandes modelos globales. Sin embargo, su tamaño y entrenamiento limitado implican carencias en razonamiento matemático complejo y en la fluidez del mooré conversacional, como reconoce el propio autor en la documentación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no especificada por el autor; los tags sugieren base Qwen3, sin confirmar) |
| Parametros totales | 4 022 468 096 (aprox. 4,02 B) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | 4 096 tokens (recomendado); entrenado con 2 048 |
| Tipos de cuantizacion | GGUF q4_k_m (2,50 GB) y q5_k_m (2,89 GB) |
| Idiomas soportados | frances (fr), mooré (mos) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors no disponible en el repo) |

## Arquitectura y entrenamiento

La arquitectura interna no se detalla en la documentación oficial. El tamaño de 4 022 millones de parámetros y el formato de conversación ChatML (`<|im_start|>`, `<|im_end|>`) sugieren una base tipo transformer decoder, probablemente derivada de un modelo abierto como Qwen, pero esta información no está confirmada por el autor. No se menciona el uso de mezcla de expertos ni arquitecturas alternativas.

El entrenamiento consistió en un ajuste fino supervisado (SFT) sobre 50 164 ejemplos, de los cuales 10 207 son diálogos multi-turno. Se realizaron 3 pasadas completas con un contexto de 2 048 tokens y un total de 7 horas y 27 minutos de cómputo en GPU. La función de pérdida se calculó únicamente sobre las respuestas, no sobre las preguntas, para que el modelo aprenda a generar respuestas en lugar de predecir el prompt. Los datos incluyen diálogos franceses de corpus abiertos filtrados, 24 000 pares paralelos francés-mooré, 4 000 traducciones adicionales al mooré, diálogos sintéticos de memoria larga (el usuario proporciona datos personales entremezclados con otras preguntas) y hechos sobre Burkina Faso y África redactados sin sesgos.

## Capacidades

- Generacion de texto conversacional en frances y mooré, con formato de dialogo multi-turno.
- Memoria de conversacion larga: el modelo puede recordar informacion personal (nombre, edad, ciudad, profesion, plato favorito) a lo largo de al menos 12 turnos y resumirla correctamente.
- Traduccion frances → mooré, con mejor rendimiento que la conversacion en mooré.
- Redaccion de textos profesionales (por ejemplo, solicitudes de aplazamiento de pago) y explicaciones cientificas basicas (fotosintesis).
- Generacion de codigo Python sencillo (funciones matematicas basicas).
- Conocimiento factual sobre Burkina Faso y Africa, presentado con el mismo estandar que cualquier otro pais.
- Funcionamiento offline en dispositivos moviles gracias a la cuantizacion GGUF.
- No incluye soporte para tool calling, function calling, vision ni audio (no documentado).

## Casos de uso

- Atencion al cliente en frances y mooré para empresas locales: el modelo puede gestionar conversaciones multi-turno con contexto de hasta 4 096 tokens, recordando datos del cliente (nombre, pedido, historial) durante la sesion. Su formato ChatML permite integrarlo en sistemas de mensajeria o chatbots web.
- Asistente personal offline en moviles: gracias al archivo GGUF de 2,5 GB, puede ejecutarse en telefonos de gama media con aplicaciones como Ollama o llama.cpp, ofreciendo respuestas en frances o mooré sin conexion a internet, util en zonas con conectividad limitada.
- Traduccion frances-mooré para organizaciones y administraciones: el modelo puede traducir avisos, formularios o comunicados del frances al mooré, facilitando el acceso a servicios publicos a poblaciones que hablan esta lengua.
- Educacion y divulgacion sobre Burkina Faso y Africa: puede generar explicaciones sobre geografia, historia o cultura local con un enfoque neutral, util para materiales didacticos o contenido web.
- Generacion de codigo basico en entornos de aprendizaje: estudiantes de programacion pueden usarlo para obtener ejemplos de funciones Python simples, aunque se recomienda verificar la salida.
- Redaccion de correspondencia profesional: el modelo produce mensajes formales en frances (por ejemplo, solicitudes de prorroga de pago), adecuados para pequenas empresas o autónomos que necesitan plantillas rapidas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye ejemplos cualitativos de evaluacion (memoria, identidad, traduccion), pero no cifras estandar como MMLU, HumanEval o GSM8K. Se recomienda realizar una evaluacion propia antes de usar el modelo en produccion.

## Requisitos de hardware

- VRAM estimada para inferencia: con cuantizacion q4_k_m (2,50 GB), se necesitan aproximadamente 3 GB de RAM/VRAM; con q5_k_m (2,89 GB), unos 3,5 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (GTX 1650, RTX 3050, RTX 4060, etc.) puede ejecutar el modelo. Tambien funciona en CPU con 8 GB de RAM.
- Compatible con telefono: el archivo q4_k_m cabe en telefonos con 4 GB de RAM o mas, usando aplicaciones como Ollama o MLCChat.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, vLLM (si se convierte a otro formato), o cualquier motor que soporte GGUF.
- Latencia y throughput: no se proporcionan datos oficiales. En una GPU moderna (RTX 3090), se espera una velocidad de 20-40 tokens/s; en CPU, 5-10 tokens/s.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa fiable con otros modelos. NIA_V8 es un modelo de 4B parametros especializado en frances y mooré, un nicho sin alternativas publicas conocidas. Modelos generalistas de tamano similar (Qwen2.5-4B, Llama-3.2-3B) no ofrecen soporte para mooré ni el enfoque regional de NIA_V8. Se indica "no disponible" para esta seccion.

## Limitaciones y advertencias

- Razonamiento aritmetico debil: el modelo falla en calculos de varios pasos (por ejemplo, no multiplica correctamente la receta por el numero de unidades). Se recomienda pedir desglose paso a paso y verificar los resultados.
- Mooré limitado: la traduccion frances → mooré funciona mejor que la conversacion en mooré; puede repetir la pregunta en lugar de responder, y las traducciones de expresiones idiomaticas son imprecisas. Esto se debe a la escasez de corpus en esta lengua.
- Posibles errores factuales: como todo modelo de su tamano, puede equivocarse en fechas, datos tecnicos o detalles especificos. Verificar antes de citar.
- Sin acceso a internet: el modelo no realiza busquedas en linea; sus respuestas se basan exclusivamente en el entrenamiento.
- Sesgos de generacion: los personajes generados en ejemplos pueden no respetar el genero o la profesion solicitada.
- Prefijo de reflexion vacio: el modelo antepone un bloque de texto vacio ("thinking response") que debe filtrarse antes de mostrar la respuesta al usuario.
- Contexto limitado: aunque se recomiendan 4 096 tokens, el entrenamiento se realizo con 2 048, por lo que el rendimiento en contextos largos puede degradarse.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Princecode/NIA_V8
- Contacto del editor (ICONEDOR): contact@iconedor.com · +226 73 80 38 73 (Ouagadougou, Burkina Faso)
- No se han encontrado papers, repositorios de codigo ni demos adicionales en la busqueda web.
