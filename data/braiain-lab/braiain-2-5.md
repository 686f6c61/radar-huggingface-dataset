# braiain-lab/brAIAIn-2.5

## Resumen

brAIAIn-2.5 es un modelo de generacion de texto publicado por braiain-lab, presentado explicitamente como una parodia de los laboratorios de IA y de sus fichas de modelo. No es una red neuronal: es un modelo de lenguaje de trigramas de palabras basado en conteo, con retroceso (backoff) a bigramas y unigramas, implementado como un diccionario de frecuencias. Su "entrenamiento" consiste en contar palabras y secuencias de palabras sobre un corpus de 420 tokens repartidos en unas 16 frases.

El modelo resuelve, en la practica, el problema de ilustrar de forma satirica los generadores de texto estadisticos clasicos y los excesos retoricos de las fichas de modelos modernas. Su relevancia no es tecnica sino divulgativa: sirve como referencia minima y como contraste deliberado frente a los modelos transformer de gran escala. Tiene 118 palabras de vocabulario con tokenizador por espacios en blanco y una ventana de contexto declarada de 2 tokens.

La version 2.5 forma parte de una coleccion de lanzamientos congelados (cada version tiene su propio repositorio inmutable). Segun la model card, el 42,6% de sus tokens de entrenamiento proceden de textos escritos por versiones anteriores del propio modelo, un detalle que el autor presenta como "eficiente" dentro del tono parodico del proyecto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de lenguaje de trigramas autorregresivo basado en conteo, con retroceso (backoff) |
| Parametros totales | 407 (pares y triples de palabras distintos contados) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 2 tokens |
| Tipos de cuantizacion | no disponible (los pesos son recuentos en JSON, no tensores) |
| Idiomas soportados | en (ingles) |
| Licencia | cc0-1.0 (dominio publico) |
| Formato de pesos | JSON (`brAIAIn-2.5.json` con claves `tri`, `bi`, `uni`) |

## Arquitectura y entrenamiento

La arquitectura es un modelo de trigramas de palabras puramente estadistico: `tri` asocia dos palabras con recuentos de la siguiente palabra, `bi` asocia una palabra con recuentos de la siguiente y `uni` almacena recuentos de palabras sueltas. La generacion se realiza por muestreo sobre esas distribuciones con retroceso cuando falta contexto. El vocabulario es de 118 palabras con tokenizacion por espacios en blanco. No hay gradientes, ni descenso de gradiente, ni pasos de entrenamiento: la model card declara explicitamente "Gradient steps: 0".

El corpus de entrenamiento son 420 tokens compuestos por "The Ten Instructions" (12 lineas), 2 frases pagadas por terceros, 2 lanzamientos no pagados del propio laboratorio y texto generado por la version anterior del modelo (42,6% de los tokens). El autor describe el alineamiento como "RLHF (Reinforcement Learning from Human Funding)", un juego de palabras que hace referencia al pago de 5 dolares por anadir una frase al corpus. No hay innovaciones tecnicas reales: el interes del artefacto es exclusivamente conceptual y parodico.

## Capacidades

- Generacion de texto por muestreo de trigramas de palabras con retroceso a bigramas y unigramas.
- Continuacion de secuencias muy cortas (hasta 2 tokens de contexto).
- Reproduccion de frases presentes en su corpus de entrenamiento, con variacion estocastica.
- Vocabulario cerrado de 118 palabras en ingles; no generaliza fuera de el.
- No dispone de tool calling ni function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso.
- No dispone de modo thinking, vision, audio ni ninguna capacidad multimodal.
- Sin capacidades multilingues: unicamente ingles.

## Casos de uso

- Docencia sobre modelos de lenguaje: sirve para explicar de forma tangible la diferencia entre un modelo n-grama de conteo y un transformer, con un artefacto inspeccionable en JSON de un vistazo.
- Ejemplo minimo de generacion de texto en cursos introductorios de PLN: el script `generate.py` no tiene dependencias y permite mostrar muestreo, retroceso y limitaciones de contexto en pocas lineas.
- Prueba de concepto de pipelines de publicacion de modelos: el repositorio demuestra el flujo de model card, model-index, versionado congelado y collection en Hugging Face con un coste computacional nulo.
- Analisis critico de fichas de modelo: el proyecto parodia los campos habituales (intended use, limitations, benchmarks) y puede usarse en formacion sobre evaluacion honesta y reporte de metricas.
- Material de divulgacion y charlas: ilustra de forma humoristica conceptos como la contaminacion por datos generados por el propio modelo (self-consumption) sin necesidad de infraestructura.
- Test de integracion de herramientas de visualizacion de model cards: al ser un artefacto trivial, permite validar renderizadores de `model-index` y de tablas de benchmarks sin ruido.

## Benchmarks y rendimiento

Resultados autodeclarados por el autor en el `model-index` de la model card (no verificados):

| Benchmark | brAIAIn-2.5 | Referencia indicada por el autor |
|---|---|---|
| GSM8K (1.319 preguntas), accuracy | 0,0% (0 correctas) | no disponible |
| TruthfulQA MC1 (790 preguntas), log-verosimilitud por palabra | 29,9% (236 correctas) | Aleatorio 22,3%; responder siempre la mas corta 17,2%; responder siempre la mas larga 36,8% |
| TruthfulQA MC1, log-verosimilitud bruta | 20,3% | Aleatorio 22,3% |

El propio autor senala que la ventaja sobre el azar en TruthfulQA se debe unicamente a que la puntuacion por palabra favorece respuestas mas largas, y que elegir siempre la respuesta mas larga obtiene un resultado similar (36,8%). El resultado de 20,3% en log-verosimilitud bruta queda por debajo del azar.

## Requisitos de hardware

- VRAM: no requiere GPU. Los pesos son un fichero JSON de recuentos de palabras de tamano despreciable.
- GPU recomendadas: ninguna; la inferencia es CPU pura.
- Cabe en cualquier GPU de consumo y tambien en cualquier CPU, microcontrolador o entorno sin aceleracion.
- Despliegue: el repositorio incluye `generate.py` sin dependencias; tambien esta disponible una demo en Hugging Face Spaces y en braiain.com. No aplica soporte de vLLM, llama.cpp, Ollama o TGI, ya que no es un modelo de tensores.
- Latencia y throughput: no disponibles de forma oficial; por la naturaleza del artefacto (busqueda en diccionarios de conteo) la latencia es del orden de microsegundos y el throughput no esta limitado por computo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| brAIAIn-2.5 | 407 (recuentos) | 2 tokens | Trigramas de palabras con backoff | cc0-1.0 | Hugging Face (repo congelado) |
| Modelos n-grama clasicos (p. ej. KenLM) | variable segun corpus | configurable (n-grama) | n-gramas de conteo con suavizado | variable (habitualmente permisiva) | Herramientas open source |
| Modelos transformer pequenos (tipo GPT-2) | ~124 M | 1.024 tokens | Transformer decoder | variable | Ampliamente disponible |
| Modelos de juguete tipo "tiny" de Hugging Face | desde miles a millones | variable | Redes pequenas o estadisticos | variable | Hugging Face |

La comparativa directa con modelos neuronales pequenos no es significativa en rendimiento: brAIAIn-2.5 no compite en ninguna tarea de razonamiento o generacion util. Su unico paralelo razonable son los modelos n-grama clasicos de PLN y otras fichas parodicas de Hugging Face.

## Limitaciones y advertencias

- El modelo no tiene utilidad practica: la propia model card declara "Intended use: None" y "Limitations: Yes".
- Ventana de contexto de 2 tokens: no puede mantener coherencia mas alla de una palabra previa al momento de generar.
- Vocabulario cerrado de 118 palabras en ingles: cualquier texto fuera de ese lexico no se representa.
- Riesgo de alucinacion total en el sentido funcional: la generacion es muestreo estadistico sin conocimiento del mundo; el 0,0% en GSM8K y el 20,3% en TruthfulQA MC1 bruto lo evidencian.
- Sesgos: derivados del corpus de 420 tokens, compuesto en gran parte por textos del propio laboratorio y por generaciones de versiones anteriores (42,6% de los tokens). No hay evaluacion de sesgos.
- Restricciones de licencia: la licencia cc0-1.0 permite uso comercial sin restriccion, pero el contenido generado carece de valor y no debe presentarse como salida de un modelo de IA real.
- Advertencia de produccion: no debe integrarse en ningun sistema de atencion al cliente, generacion de codigo ni pipeline automatizado; su uso esta limitado a docencia, divulgacion y parodia.
- El proyecto es una parodia declarada y no esta afiliado a ninguna empresa real de IA; los datos de benchmarks son autodeclarados y no verificados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/braiain-lab/brAIAIn-2.5
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/braiain-lab/brAIAIn
- Ultima version del modelo: https://huggingface.co/braiain-lab/brAIAIn-0
- Coleccion de versiones: https://huggingface.co/braiain-lab
- Sitio del laboratorio: https://www.braiain.com
- Informe tecnico: https://www.braiain.com/paper.html?v=4
- Benchmarks declarados: https://www.braiain.com/benchmarks.html
- Historial de versiones y datos de entrenamiento: https://www.braiain.com/models.html
