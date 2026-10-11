# cpral/instruktor-lotnictwa-1-hf

## Resumen

El modelo cpral/instruktor-lotnictwa-1-hf es un ajuste fino completo (full fine-tuning) del modelo polaco speakleash/Bielik-1.5B-v3.0-Instruct, orientado a la generación de instrucciones, razonamiento y respuestas en polaco dentro del dominio aeronáutico ("instruktor lotnictwa" significa instructor de aviación en polaco). Lo desarrolla el usuario cpral y se publica bajo licencia Apache 2.0, con un tamano de 1.596.507.648 parametros (aproximadamente 1,6 mil millones) y un repositorio de 3,2 GB en formato safetensors.

El modelo se presenta como una herramienta para la generación de datos sinteticos a escala industrial siguiendo la metodologia magpie. Segun la model card, fue entrenado sobre medio millon de conversaciones de un solo turno (single-turn), de las cuales unas cien mil incluyen razonamiento, todo en polaco. El autor afirma haber alcanzado una throughput de 100 instrucciones por segundo, cinco veces superior a la de Muse Glimmer 30B (20 instrucciones por segundo) en la generacion de instrucciones.

Su relevancia radica en dos factores: por un lado, es un modelo pequeno (1,6B) que cabe en hardware de consumo, lo que abarata la generacion masiva de datasets sinteticos; por otro, esta especializado en producir la traza completa (instruccion, razonamiento y respuesta) en una unica peticion /completions. La principal limitacion declarada por el autor es un rendimiento pobre en conversaciones multi-turno.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | transformer decoder-only (etiquetado como "llama" en HuggingFace; detalles especificos no disponibles) |
| Parametros totales | 1.596.507.648 (aprox. 1,6B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; cuantizacion GGUF/AWQ/GPTQ no indicada) |
| Idiomas soportados | polaco (pl) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del modelo base speakleash/Bielik-1.5B-v3.0-Instruct, un transformer decoder-only de aproximadamente 1,6 mil millones de parametros. La model card no detalla la arquitectura interna del base (numero de capas, dimensiones, mecanismo de atencion) ni la longitud de contexto soportada, por lo que esos datos figuran como no disponibles. La etiqueta "llama" en HuggingFace sugiere una arquitectura de tipo Llama, aunque no se confirma explicitamente.

En cuanto al entrenamiento, la model card indica que se realizo un ajuste fino completo (no LoRA) sobre un conjunto de medio millon de conversaciones de un solo turno, de las cuales aproximadamente cien mil incorporan razonamiento explicito, todas en polaco. El dataset asociado es cpral/nauka-lotnictwa-1 (aprendizaje de aviacion). Un detalle tecnico destacable es que la funcion de perdida se calcula sobre cada token (no solo sobre el token de respuesta), lo que segun el autor hace al modelo idoneo para generacion de datos sinteticos tipo magpie a escala industrial. No se menciona el uso de RLHF, DPO ni otras tecnicas de alineacion posteriores al ajuste supervisado.

## Capacidades

- Generacion de texto en polaco, con especializacion en el dominio aeronautico.
- Generacion de instrucciones sinteticas a partir de prompts, orientada a la creacion de datasets (metodologia magpie).
- Razonamiento explicito: el modelo produce cadenas de razonamiento (chain-of-thought) en polaco, segun la model card.
- Generacion de la traza completa (instruccion, razonamiento y respuesta) en una unica peticion a /completions.
- Uso como generador de datos para destilacion o entrenamiento posterior de otros modelos.
- No se documentan capacidades de tool calling, function calling ni agentes multi-paso.
- No se documentan capacidades multimodales (vision, audio) ni soporte multilingue mas alla del polaco.
- No se documenta un "modo de pensamiento" configurable ni decodificacion especulativa.

## Casos de uso

- Generacion de datasets sinteticos a gran escala: el modelo puede producir instrucciones y respuestas en polaco a razon de unas 100 instrucciones por segundo (cifra declarada por el autor), lo que resulta adecuado para crear corpus de entrenamiento de dominio especifico.
- Destilacion de conocimiento: al generar trazas de razonamiento completas en una sola peticion, sirve para producir datos de entrenamiento con cadena de pensamiento que luego pueden transferirse a modelos mayores o menores.
- Formacion aeronautica asistida: generar preguntas, explicaciones y respuestas sobre conceptos de aviacion en polaco para plataformas educativas o material didactico.
- Anotacion y aumento de datos de dominio: ampliar un dataset existente de aviacion (como cpral/nauka-lotnictwa-1) con ejemplos adicionales coherentes y tematicamente alineados.
- Prototipado rapido de asistentes en polaco: por su tamano (1,6B) se puede desplegar localmente para validar flujos de generacion antes de escalar a modelos mayores.
- Filtrado y curacion de corpus: dado que la perdida se calcula por token, puede emplearse para puntuar y priorizar ejemplos dentro de un pipeline de curacion de datos.
- Investigacion en generacion sintetica: comparar la eficiencia de un modelo pequeno especializado frente a modelos genericos grandes para tareas de generacion de instrucciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente aporta una comparacion de throughput en generacion de instrucciones: 100 instrucciones por segundo frente a 20 instrucciones por segundo de Muse Glimmer 30B, un factor de 5x. No se especifica el hardware utilizado para esa medicion.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir del numero de parametros; no confirmada por el autor): aproximadamente 3,2 GB en FP16/BF16, unos 1,6 GB en cuantizacion de 8 bits y en torno a 1 GB en cuantizacion de 4 bits, sin contar la memoria para el cache KV ni activaciones.
- GPU recomendadas: por su tamano, cualquier GPU con al menos 6-8 GB de VRAM puede ejecutarlo en precision reducida. GPU de datacenter (A100, H100) solo serian necesarias para batch grande o generacion masiva a alta throughput.
- Compatibilidad con GPU de consumo: si, cabe en tarjetas como RTX 3060 (12 GB), RTX 4070, RTX 4090 y similares, especialmente en cuantizacion de 4 u 8 bits. En FP16 tambien cabria en GPU con 8 GB o mas.
- Opciones de despliegue: no confirmadas en la model card. Por su formato safetensors y su naturaleza transformer, seria compatible con transformers (HuggingFace), vLLM y TGI; la conversion a GGUF permitiria su uso con llama.cpp y Ollama, aunque no se documenta que dichos formatos ya existan.
- Latencia y throughput estimados: el unico dato disponible es el declarado por el autor (100 instrucciones por segundo en generacion de instrucciones), sin especificacion del hardware empleado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cpral/instruktor-lotnictwa-1-hf | 1,6B | no disponible | polaco | apache-2.0 | HuggingFace |
| speakleash/Bielik-1.5B-v3.0-Instruct (base) | ~1,5B | no disponible | polaco | no disponible | HuggingFace |
| Muse Glimmer 30B (referencia del autor) | 30B | no disponible | no disponible | no disponible | no disponible |

La unica comparacion de rendimiento aportada es de throughput (100 instrucciones/s del modelo frente a 20 instrucciones/s de Muse Glimmer 30B). No se dispone de datos de benchmarks ni de especificaciones completas del modelo base ni de Muse Glimmer 30B en la informacion proporcionada, por lo que una comparativa cuantitativa de calidad no es posible.

## Limitaciones y advertencias

- Rendimiento multi-turno pobre: el propio autor indica que la calidad en conversaciones de varios turnos es debil, porque el entrenamiento se realizo exclusivamente sobre datos de un solo turno.
- Sesgos: no se documentan analisis de sesgos. Al ser un modelo especializado en un dominio concreto y entrenado sobre datos generados, puede heredar sesgos del corpus de entrenamiento y del modelo base.
- Riesgo de alucinacion: no se documenta evaluacion al respecto. En dominios tecnicos como la aviacion, cualquier contenido generado debe ser verificado por un experto antes de su uso; no debe emplearse como fuente de informacion operativa o de seguridad.
- Limitacion de idioma: el modelo solo declara soporte para polaco; no se garantiza un comportamiento correcto en otros idiomas.
- Contexto: la longitud de contexto no esta documentada, lo que dificulta planificar su uso en tareas que requieran ventanas largas.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones de la licencia y de los datos del modelo base (speakleash/Bielik) antes de un despliegue en produccion.
- Datos de entrenamiento sinteticos: parte del corpus parece haberse generado de forma sintetica, lo que puede amplificar errores o sesgos presentes en el modelo que los produjo.
- En produccion: dado que es un modelo de 1,6B especializado y con pocas descargas e interacciones en HuggingFace, se recomienda validarlo exhaustivamente en el caso de uso concreto antes de adoptarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/cpral/instruktor-lotnictwa-1-hf
- Modelo base: https://huggingface.co/speakleash/Bielik-1.5B-v3.0-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/cpral/nauka-lotnictwa-1
- Paper, blog o repositorio adicionales: no disponibles en la informacion proporcionada.
