# PARASITIKA/wan-2-7-spicy-uncensored-guide

## Resumen

PARASITIKA/wan-2-7-spicy-uncensored-guide es un repositorio alojado en HuggingFace que, segun los metadatos disponibles, no contiene un modelo con pesos entrenados sino una pagina estatica de documentacion (`sdk: static`) dedicada a un supuesto generador de video denominado Wan 2.7 Spicy Uncensored, atribuido a Alibaba Tongyi Lab. El repositorio declara 0 descargas y 0 likes, fue creado y actualizado el 23 de octubre de 2026 en el mismo instante y no especifica licencia, idiomas ni pipeline de inferencia.

El contenido del README es fundamentalmente promocional: enlaza a la plataforma Kenerate AI y a una pagina de documentacion externa, y describe tres capacidades del supuesto modelo (ausencia de filtros de contenido, resolucion 1080p nativa y preservacion de identidad facial en clips de 5, 10 y 15 segundos). No se aporta informacion sobre arquitectura mas alla de la mencion a un Diffusion Transformer (DiT), ni sobre numero de parametros, contexto, dataset de entrenamiento o resultados de benchmarks.

Por tanto, esta ficha documenta lo que el repositorio declara y marca explicitamente como no disponible todo aquello que no puede verificarse. Cualquier evaluacion tecnica del modelo subyacente requeriria acceder a los pesos o a documentacion oficial del mismo, que no forman parte de la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (DiT), segun declara el README; sin detalle de variante ni configuracion |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repositorio se declara como `sdk: static`, sin artefactos de modelo) |

## Arquitectura y entrenamiento

El unico dato arquitectonico presente en la informacion proporcionada es la referencia a un Diffusion Transformer (DiT), una familia de modelos generativos que sustituye el componente de difusion convolucional por bloques de atencion tipo transformer. El README no especifica el numero de parametros, la profundidad de la red, el tipo de encoder de texto, el VAE o tokenizer de video empleado, ni el esquema de atencion espaciotemporal.

Tampoco se documentan datos de entrenamiento: no se indica el volumen de tokens o de pares video-texto, la composicion del dataset, la resolucion y duracion de los clips de entrenamiento, ni si se aplicaron etapas de ajuste fino con preferencias humanas (RLHF, DPO) o tecnicas de destilacion. No hay informacion sobre innovaciones tecnicas como decodificacion especulativa, atencion lineal o compresion latente 3D. Todo ello debe considerarse no disponible.

## Capacidades

- Generacion de video texto-a-video con resolucion nativa declarada de 1920x1080 (1080p), sin upscaling por pixel segun el README.
- Duraciones declaradas de 5, 10 y 15 segundos por clip.
- Preservacion de identidad facial ("Identity Lock") a lo largo de las distintas duraciones, orientada a personajes recurrentes.
- Ausencia declarada de filtros de contenido y de marcas de agua en la salida.
- Orientacion declarada a retrato artistico y clips de moda, donde el autor afirma que se evitan bloqueos por falsos positivos de moderacion.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Prototipado de clips publicitarios de moda: generacion de piezas verticales u horizontales de 5 a 15 segundos con un personaje consistente entre tomas, apoyandose en la funcion declarada de preservacion de identidad facial. Requiere validar primero la calidad real del modelo, no verificada en la informacion disponible.
- Previsualizacion de storyboards para produccion audiovisual: convertir descripciones textuales en clips 1080p de corta duracion para evaluar encuadre, iluminacion y ritmo antes de rodar.
- Creacion de avatares de marca recurrentes: mantener el rostro de un personaje virtual a lo largo de una serie de clips de 15 segundos, si la funcion Identity Lock opera segun lo declarado.
- Generacion de material para redes sociales: clips cortos en formato 1920x1080 exportables directamente a plataformas, sin necesidad de reescalado posterior.
- Iteracion conceptual en direccion de arte: comparar variantes de vestuario, paleta y puesta en escena mediante prompts sucesivos en la plataforma externa enlazada.
- Investigacion sobre moderacion en modelos generativos: analisis de como se comporta un sistema que declara operar sin filtros de contenido, util para estudiar falsos positivos y riesgos de uso indebido.
- Integracion en pipelines de contenido asistido: encadenar la generacion de clips con herramientas de edicion y montaje, siempre que exista acceso programatico a la API, extremo no documentado en la informacion proporcionada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye metricas objetivas de calidad de video (FVD, CLIP-score, VBench), ni comparaciones cuantitativas con otros generadores, ni datos de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. No se publica el numero de parametros ni el formato de pesos, por lo que no puede derivarse una estimacion fiable.
- GPU recomendadas: no disponible. Para modelos DiT de generacion de video en 1080p es habitual requerir aceleradores de centro de datos, pero el repositorio no confirma ninguna configuracion.
- Compatibilidad con GPU de consumo: no disponible. Sin datos de tamano del modelo no puede determinarse si cabria en una RTX 4090 u otras tarjetas consumer.
- Opciones de despliegue: el repositorio se declara como `sdk: static`, es decir, una pagina web estatica sin servidor de inferencia. No se mencionan vLLM, llama.cpp, Ollama, TGI ni ningun otro runtime.
- Latencia y throughput: no disponible. El README solo referencia una plataforma externa (Kenerate AI) como via de acceso, sin cifras de rendimiento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / duracion | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Wan 2.7 Spicy Uncensored (este repositorio) | no disponible | clips de 5, 10 y 15 s; 1080p declarado | no disponible | no disponible | solo guia estatica; 0 descargas |
| Familia Wan (versiones publicas de Alibaba Tongyi) | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible | no verificada en esta busqueda |
| HunyuanVideo | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible | no verificada en esta busqueda |
| CogVideoX | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible | no verificada en esta busqueda |

No se dispone de datos verificables para establecer una comparacion cuantitativa. La comparativa se limita a identificar alternativas de la misma categoria (generacion de video texto-a-video), sin cifras que las confronten.

## Limitaciones y advertencias

- El repositorio no contiene pesos ni artefactos de modelo: es una pagina estatica (`sdk: static`) con enlaces promocionales a un dominio externo. No es ejecutable ni descargable como modelo.
- No se declara licencia, por lo que no puede determinarse si el uso comercial esta permitido. La ausencia de licencia implica, por defecto, reserva de derechos.
- El modelo se atribuye a Alibaba Tongyi Lab, pero el repositorio no esta verificado ni vinculado oficialmente a dicho laboratorio; la denominacion "Wan 2.7" no puede confirmarse con la informacion disponible.
- La afirmacion de "cero filtros de contenido" y "cero marcas de agua" implica riesgos legales y de cumplimiento, especialmente en la UE bajo normativa de servicios digitales y de transparencia de contenido generado. No se documenta ningun mecanismo de trazabilidad.
- La funcionalidad Identity Lock y la resolucion 1080p nativa son afirmaciones del autor sin evidencia tecnica adjunta (no hay metricas, demos verificables ni muestras en el repositorio).
- Riesgo de alucinacion y de artefactos visuales: no disponible, al no existir evaluacion publicada.
- Idiomas soportados para los prompts: no disponible.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado en el mismo instante, lo que sugiere una publicacion sin validacion por parte de la comunidad.
- No debe tratarse como fuente tecnica fiable para decisiones de produccion sin acceso previo al modelo real y a su documentacion oficial.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/PARASITIKA/wan-2-7-spicy-uncensored-guide
- Plataforma externa citada en el README: https://kenerateai.com
- Documentacion externa citada en el README: https://kenerateai.com/wan-2-7-spicy
- Playground externo citado en el README: https://kenerateai.com/wan2-7-spicy
- Paper, blog oficial, repositorio de codigo o demo verificable del modelo: no disponible en la informacion proporcionada.
