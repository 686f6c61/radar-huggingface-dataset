# drewbie/jazz-pianist-style-synthetic-classifier

## Resumen

El modelo `drewbie/jazz-pianist-style-synthetic-classifier` es un clasificador de estilo de pianista de jazz desarrollado por Drew Edwards y publicado en HuggingFace bajo licencia Apache-2.0. No es un modelo de lenguaje: se trata de una red neuronal en PyTorch que trabaja sobre musica simbolica (MIDI) y asigna cada fragmento o pista a uno de 12 pianistas de jazz, con condicionamiento por atencion cruzada y una receta de entrenamiento derivada de la arquitectura Aria.

Su particularidad es que se ha entrenado exclusivamente con musica generada: nunca ve una interpretacion real etiquetada durante el entrenamiento, solo continuaciones muestreadas de un generador condicional. A pesar de ello, evaluado sobre grabaciones reales alcanza un 87,1 % de acierto por fragmento y un 95,0 % por pista completa, lo que los autores presentan como evidencia de que la musica generada conserva estructura estilistica transferible a interpretaciones humanas.

El modelo acompana al articulo de ISMIR 2026 "Learning Jazz Pianist Style with Cross-Attention Conditioning" (Edwards, Maezawa y Dixon) y existe como instrumento de medida, no como clasificador de produccion: los propios autores indican que el modelo entrenado con datos reales de la misma familia es mas fuerte. El repositorio pesa 2,5 GB y contiene los pesos (`best.pt`) y un resumen de arquitectura (`config.json`).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red de clasificacion en PyTorch con condicionamiento por atencion cruzada, construida sobre Aria; variante "medium" |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (opera sobre fragmentos de musica simbolica y sobre pistas completas, sin tamano declarado) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de musica simbolica, no de texto) |
| Licencia | apache-2.0 |
| Formato de pesos | `best.pt` (state dict de PyTorch) y `config.json` |
| Tarea | clasificacion de estilo de pianista de jazz |
| Numero de clases | 12 pianistas |
| Datos de entrenamiento | exclusivamente musica generada (continuaciones de un generador condicional); ninguna interpretacion real etiquetada |
| Tamano del repositorio | 2,5 GB |
| Fecha de publicacion | 30 de septiembre de 2026 |

## Arquitectura y entrenamiento

La arquitectura sigue la receta del clasificador con datos reales de la misma familia, con condicionamiento por atencion cruzada, y esta construida sobre Aria, el modelo de musica simbolica de EleutherAI publicado bajo Apache-2.0. El paquete de inferencia es `llama_pijama` y la carga se realiza con `load_model("best.pt", model_name="medium", num_classes=12, device="cpu")`, lo que indica una configuracion de tamano "medium" y una cabeza de clasificacion de 12 clases.

El aspecto tecnico mas destacable es el regimen de entrenamiento: el modelo no consume ninguna actuacion real etiquetada, solo continuaciones muestreadas del generador condicional. Esto lo convierte en un experimento de transferencia sintetico-a-real en musica simbolica. No se especifican en la informacion disponible el numero de tokens o eventos de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de ajuste como RLHF o DPO (no procede en este dominio). El dataset de referencia citado es PiJAMA.

## Capacidades

- Clasificacion de estilo de pianista de jazz sobre musica simbolica, con 12 clases de salida.
- Evaluacion a dos granularidades: por fragmento ("chunk") y por pista completa.
- Generalizacion de datos sinteticos a grabaciones reales, con 87,1 % por fragmento y 95,0 % por pista.
- Reutilizacion de la interfaz del clasificador con datos reales: misma API de carga, mismo `num_classes` y mismo esquema de configuracion.
- No genera musica, no realiza tool calling ni function calling, no soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues, de vision ni de audio en bruto: la entrada es musica simbolica (MIDI).
- No dispone de modo "thinking" ni de ninguna capacidad especial adicional declarada.

## Casos de uso

- Validacion de modelos generativos de musica: medir que estructura estilistica sobrevive en las continuaciones generadas por un modelo condicional, comparando la prediccion del clasificador sobre material sintetico y sobre interpretaciones reales.
- Investigacion en musicologia computacional: cuantificar hasta que punto el estilo de un pianista queda codificado en rasgos simbolicos y no en la senal de audio.
- Pre-etiquetado de corpus MIDI sin anotar: usar las predicciones por fragmento como etiquetas debiles antes de una revision manual, siempre que el material pertenezca al conjunto cerrado de 12 pianistas.
- Analisis de "huella" estilistica: estudiar que fragmentos de una interpretacion concentran la mayor probabilidad de una clase concreta y correlacionarlo con rasgos armonicos o ritmicos.
- Baseline en experimentos de clasificacion de estilo: servir como punto de comparacion sin coste de anotacion real para medir la ganancia de un modelo entrenado con datos etiquetados.
- Auditoria de pipelines de aumento de datos: comprobar si el material generado empleado para aumentar un dataset conserva la identidad estilistica de origen o la diluye.
- Docencia y demostraciones: ilustrar en un aula el fenomeno de transferencia de estilo entre musica generada y real con un modelo pequeno y ejecutable en CPU.
- Analisis forense o de atribucion (con cautela): apoyo preliminar para agrupar interpretaciones por estilo, nunca como prueba concluyente dado el limite de 12 clases y la ausencia de validacion sobre material fuera de dominio.

## Benchmarks y rendimiento

Los unicos resultados publicados en la informacion disponible corresponden a la evaluacion del propio autor sobre grabaciones reales:

| Metrica | Valor | Conjunto de evaluacion |
|---|---|---|
| Exactitud por fragmento (per chunk) | 87,1 % | grabaciones reales |
| Exactitud por pista (per track) | 95,0 % | grabaciones reales |
| Clasificador con datos reales de la misma familia | no disponible (los autores indican que es superior) | no disponible |

No se publican en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni metricas equivalentes, ya que no es un modelo de lenguaje. Los resultados de busqueda web mencionan un trabajo distinto de la Universidad de Cambridge (Huw Cheston y colaboradores) con un 94,4 % de exactitud sobre 20 pianistas usando modelos de lenguaje; se trata de otro modelo, otro dataset y otro numero de clases, por lo que no es comparable de forma directa.

## Requisitos de hardware

- Los pesos ocupan `best.pt` dentro de un repositorio de 2,5 GB; el tamano exacto del fichero de pesos no esta disponible.
- El ejemplo oficial de uso se ejecuta con `device="cpu"`, de modo que la inferencia no requiere GPU de forma obligatoria.
- VRAM estimada para inferencia: no disponible. Tampoco se especifica el consumo de memoria en CPU.
- GPU recomendadas: no disponible. No hay ninguna recomendacion de A100, H100 o RTX en la model card.
- Compatibilidad con GPU de consumo: no disponible; el ejemplo documentado emplea CPU, lo que sugiere que el modelo es ligero, pero no se aportan cifras.
- Opciones de despliegue: carga mediante `llama_pijama.evaluation.load_model` con PyTorch. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Tarea | Clases | Exactitud | Datos de entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este modelo (synthetic-only) | Clasificacion de estilo de pianista de jazz | 12 | 87,1 % por fragmento / 95,0 % por pista | Solo musica generada | apache-2.0 | Pesos en HuggingFace |
| Clasificador con datos reales de la misma familia | Clasificacion de estilo de pianista de jazz | 12 | no disponible (superior segun los autores) | Interpretaciones reales etiquetadas | no disponible | Repositorio GitHub del proyecto |
| Estudio de la Universidad de Cambridge (Cheston et al.) | Identificacion de pianistas de jazz | 20 | 94,4 % | 84 horas, 1.629 interpretaciones de 20 pianistas | no disponible | No disponible como pesos publicados en la informacion consultada |

La comparacion directa con alternativas es limitada: no se han encontrado en la informacion disponible pesos publicados de otros clasificadores de estilo de pianista de jazz bajo licencia abierta.

## Limitaciones y advertencias

- Cobertura cerrada de 12 pianistas: no reconoce estilos fuera de ese conjunto y forzara cualquier entrada a una de las 12 clases.
- Entrenado solo con musica generada: hereda los sesgos y las limitaciones del generador condicional que produjo las continuaciones; los autores lo declaran como instrumento de medida, no como mejor clasificador.
- El propio autor indica que el modelo entrenado con datos reales es mas fuerte; este modelo no debe usarse como sustituto en produccion.
- Riesgo de asignaciones incorrectas fuera de dominio (otros instrumentos, otros generos, transcripciones ruidosas), ya que la cabeza de clasificacion siempre devuelve una de las 12 clases.
- Ambito restringido a musica simbolica: no procesa audio en bruto ni texto, por lo que no aplican capacidades multilingues.
- Licencia apache-2.0 en los pesos, pero el modelo depende de Aria (Apache-2.0) y del dataset PiJAMA; conviene revisar los terminos del dataset antes de un uso comercial.
- El repositorio tiene 0 descargas y 0 likes, sin validacion independiente por parte de la comunidad.
- No se documentan cuantizaciones ni formatos alternativos de pesos, lo que limita el despliegue en entornos con restricciones de memoria.
- La fecha de publicacion (septiembre de 2026) y el articulo asociado (ISMIR 2026) implican que la revision por pares puede no estar cerrada en el momento de la consulta.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/drewbie/jazz-pianist-style-synthetic-classifier
- Codigo y scripts de evaluacion: https://github.com/almostimplemented/jazz-pianist-style
- Aria (EleutherAI), base de la arquitectura: https://github.com/EleutherAI/aria
- Dataset PiJAMA: https://github.com/almostimplemented/PiJAMA
- Articulo de referencia (sin enlace directo en la informacion disponible): Edwards, Maezawa y Dixon, "Learning Jazz Pianist Style with Cross-Attention Conditioning", ISMIR 2026

Enlaces encontrados en la busqueda web, no relacionados directamente con este modelo y aportados solo como contexto:

- Estudio de la Universidad de Cambridge sobre identificacion de pianistas de jazz (Cheston et al.): https://www.newsbreak.com/musicradar-1720759/4848119151782-ai-models-can-identify-jazz-pianists-based-on-their-recordings-and-reveal-their-musical-fingerprints
- Cobertura del mismo estudio: https://rombomagazine.com/ai-study-traces-the-harmonic-fingerprints-of-jazz-pianists/
- Clasificador de genero musical en navegador (Discogs EffNet): https://wutools.com/audio/music-genre-classifier
- deepjazz, generacion de jazz con LSTM: https://deepjazz.io/
- Magenta RealTime, modelo generativo de musica en tiempo real: https://arxiv.org/pdf/2508.04651v2
