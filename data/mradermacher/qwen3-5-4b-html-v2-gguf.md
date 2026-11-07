# mradermacher/Qwen3.5-4B-HTML-v2-GGUF

## Resumen

Qwen3.5-4B-HTML-v2-GGUF es la version cuantizada en formato GGUF del modelo wesjos/Qwen3.5-4B-HTML-v2, un ajuste fino de la familia Qwen3.5 orientado especificamente a la generacion de HTML, diseno web y comprension de interfaces visuales. El modelo original parte de una base de aproximadamente 4.326 millones de parametros (4,3B) y ha sido especializado mediante SFT sobre el dataset wesjos/mario-html-sft, lo que lo aleja de un uso generalista y lo concentra en tareas de codigo frontend y razonamiento visual.

La relevancia de esta publicacion radica en dos factores. Por un lado, ofrece una version multimodal (pipeline image-text-to-text, con soporte de visual-question-answering) que puede razonar sobre capturas de pantalla e imagenes de UI para producir HTML. Por otro lado, mradermacher publica una bateria completa de cuantizaciones estaticas (desde Q2_K hasta f16, incluyendo IQ4_XS y los archivos mmproj para el proyector multimodal), lo que permite desplegar el modelo en hardware de consumo.

Es importante subrayar que se trata de una cuantizacion estatica: el autor indica que en el momento de la publicacion no habia cuantizaciones ponderadas/imatrix disponibles. El modelo esta pensado para flujos de generacion de interfaces, prototipado web y tareas de vision-lenguaje, no como modelo de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) basada en Qwen3.5; detalles de capas y atencion no disponibles |
| Parametros totales | 4.326.350.848 (4,3B) |
| Parametros activos | no aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; proyector multimodal en mmproj-Q8_0 y mmproj-f16 |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base original en safetensors |

## Arquitectura y entrenamiento

El modelo base wesjos/Qwen3.5-4B-HTML-v2 es un ajuste fino supervisado (SFT) sobre una base Qwen3.5 de 4,3B parametros. La model card del repositorio cuantizado no detalla el numero de capas, la configuracion de atencion ni el volumen total de tokens de entrenamiento. Lo que si se explicita es el dataset de ajuste: wesjos/mario-html-sft, orientado a generacion de HTML y diseno web. Los tags del repositorio incluyen "reasoning", "zero-system-prompt" y "cot-purity", lo que sugiere que el ajuste trabaja el razonamiento en cadena (chain-of-thought) sin depender de un system prompt y busca mantener la pureza de ese razonamiento.

La componente multimodal se evidencia por el pipeline image-text-to-text, los tags de visual-question-answering y visual-ui, y la presencia de archivos mmproj en el repositorio GGUF, que actuan como proyector vision-lenguaje. No se dispone de informacion sobre la composicion exacta del dataset, el uso de RLHF/DPO ni innovaciones de decodificacion (por ejemplo, decodificacion especulativa). Las cuantizaciones son estaticas; el autor senala que las versiones ponderadas/imatrix no estaban disponibles en el momento de la publicacion.

## Capacidades

- Generacion de HTML y codigo frontend: especializacion principal del ajuste fino, orientada a producir marcado y estructuras de interfaz.
- Diseno web y UI visual: los tags visual-ui y web-design indican soporte para tareas de maquetacion y generacion de interfaces.
- Vision-lenguaje: pipeline image-text-to-text y visual-question-answering, con proyector multimodal (mmproj) para procesar imagenes junto a texto.
- Razonamiento en cadena: el tag reasoning y las referencias a cot-purity apuntan a modos de razonamiento explicito.
- Funcionamiento sin system prompt: el tag zero-system-prompt indica que el modelo esta ajustado para operar sin instrucciones de sistema iniciales.
- Conversacional: tag conversational y uso previsto en dialogos multi-turno.
- Multilingue limitado: solo ingles (en) y chino (zh) declarados.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible en la informacion proporcionada mas alla del tag generico de reasoning.

## Casos de uso

- Generacion de maquetas HTML a partir de descripciones: el modelo puede transformar una especificacion textual de una pagina en marcado HTML, aprovechando su ajuste especifico sobre mario-html-sft para reducir iteraciones de correccion.
- Conversion de capturas de pantalla a HTML: gracias a su componente multimodal (image-text-to-text con mmproj), puede recibir una imagen de una interfaz y producir la estructura HTML correspondiente, util para prototipado rapido y reconstruccion de disenos.
- Asistente de diseno web en editores: integrado en un IDE o editor visual, puede sugerir componentes, corregir estructura semantica y proponer variantes de layout en ingles o chino.
- Prototipado de interfaces para validacion con usuarios: permite generar versiones estaticas de pantallas en minutos para pruebas de concepto, sin depender de un equipo de frontend.
- Automatizacion de documentacion visual: dado un conjunto de capturas de UI, el modelo puede describir elementos y generar fragmentos de codigo asociados (visual-question-answering aplicado a QA de interfaces).
- Despliegue en local para equipos con requisitos de privacidad: las cuantizaciones Q4_K_S y Q4_K_M (2,7-2,9 GB) permiten ejecutar el modelo en estaciones de trabajo consumer sin enviar capturas de UI a servicios externos.
- Educacion y formacion en desarrollo frontend: el modelo puede explicar y generar ejemplos de HTML a partir de imagenes o enunciados, con razonamiento intermedio visible (chain-of-thought).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos + overhead de contexto y proyector multimodal):
  - Q2_K (2,1 GB): en torno a 3-4 GB de VRAM.
  - Q4_K_S / Q4_K_M (2,7-2,9 GB): en torno a 4-5 GB de VRAM, recomendado para uso general.
  - Q6_K (3,7 GB) y Q8_0 (4,7 GB): en torno a 5-7 GB de VRAM.
  - f16 (8,8 GB): en torno a 10-12 GB de VRAM.
- Proyector multimodal: anadir 0,5 GB (mmproj-Q8_0) o 0,8 GB (mmproj-f16) si se usa la entrada de imagen.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A100 y H100 para despliegues con concurrencia. Cabe en GPUs consumer de 8 GB o mas con cuantizaciones Q4.
- Opciones de despliegue: llama.cpp y Ollama para GGUF; vLLM y TGI para el modelo base en safetensors. El repositorio incluye el tag endpoints_compatible.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.5-4B-HTML-v2-GGUF (este) | 4,3B | no disponible | HTML, UI visual, multimodal | apache-2.0 | GGUF |
| wesjos/Qwen3.5-4B-HTML-v2 (base) | 4,3B | no disponible | HTML, UI visual, multimodal | apache-2.0 | safetensors |
| mradermacher/Qwen3.5-4B-EBOS-v2-GGUF | no disponible | no disponible | conversacional general | apache-2.0 | GGUF |

No se dispone de datos de rendimiento ni de contexto para establecer una comparacion cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Especializacion estrecha: el ajuste sobre mario-html-sft puede degradar el rendimiento en tareas generales de lenguaje respecto al Qwen3.5 base.
- Idiomas limitados: solo ingles y chino declarados; el rendimiento en castellano no esta garantizado ni documentado.
- Riesgo de alucinacion: como todo modelo generativo, puede producir HTML sintacticamente valido pero semanticamente incorrecto o inventar APIs y frameworks; requiere validacion en pipelines de produccion.
- Cuantizaciones estaticas: no hay versiones ponderadas/imatrix, lo que puede implicar mayor perdida de calidad en los niveles bajos (Q2_K, Q3_K_M) frente a alternativas ponderadas.
- Licencia apache-2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base y del dataset de ajuste antes de desplegar en produccion.
- Datos incompletos: no se documentan sesgos, contexto maximo ni evaluaciones de seguridad; el repositorio tiene 0 descargas y 0 likes, por lo que no existe validacion comunitaria.
- Componente multimodal dependiente del mmproj: omitir el archivo mmproj desactiva la entrada de imagen, aunque el modelo siga funcionando como texto.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Qwen3.5-4B-HTML-v2-GGUF
- Modelo base: https://huggingface.co/wesjos/Qwen3.5-4B-HTML-v2
- Dataset de ajuste: https://huggingface.co/datasets/wesjos/mario-html-sft
- Pagina de descargas del autor: https://hf.tst.eu/model#Qwen3.5-4B-HTML-v2-GGUF
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Perfil del autor: https://huggingface.co/mradermacher
- Modelo comparable del mismo autor: https://huggingface.co/mradermacher/Qwen3.5-4B-EBOS-v2-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
