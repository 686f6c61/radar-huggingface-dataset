# florianvoss/Qwen2.5-7B-Instruct-Autoround-a16w4

## Resumen

Qwen2.5-7B-Instruct-Autoround-a16w4 es un artefacto compilado —no un conjunto de pesos entrenables— publicado por el usuario florianvoss dentro de la colección Neat 0.6.0. Parte del modelo simaai/Qwen2.5-7B-Instruct-Autoround-Safetensors, una versión del Qwen2.5-7B-Instruct afinada y cuantizada con AutoRound, y la traduce a un ModelGraph nativo ejecutable sobre el acelerador SiMa Modalix mediante el compilador de modelos y el runtime LLiMa.

El paquete resultante contiene 147 ejecutables ELF, los activos de runtime en `devkit/` y el script `compile.sh` con los argumentos exactos de compilación. La configuración de build fija un contexto máximo de 4.096 tokens, grupo de prefill de 128, pesos INT4 con excepciones de precisión mixta, activaciones BF16 y embeddings y caché KV en INT8.

Su relevancia es acotada pero clara: demuestra el flujo completo de despliegue de un LLM de 7.000 millones de parámetros en hardware de borde/NPU con cuantización agresiva de pesos (a16w4) y compilación ahead-of-time. No es un modelo utilizable en GPU convencional ni en pipelines estándar de HuggingFace; su interés es para ingenieros que integren LLMs en dispositivos SiMa Modalix.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-7B-Instruct), compilada a ModelGraph nativo para SiMa Modalix |
| Parametros totales | 7.000 millones (deducido del nombre del modelo base; no se detalla en la model card) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 4.096 tokens (maximo fijado en compilacion; grupo de prefill de 128) |
| Tipos de cuantizacion | Pesos INT4 (w4) con tamanos de grupo y excepciones de precision mixta preservados del origen; activaciones BF16; embeddings y cache KV en INT8 |
| Idiomas soportados | No disponible (la metadata del repo no declara idiomas) |
| Licencia | Apache 2.0 (se aplican los terminos del modelo fuente) |
| Formato de pesos | Grafo compilado: 147 ejecutables ELF, activos de runtime en `devkit/`, `compilation.json` y `compile.sh`; no se distribuyen safetensors ni GGUF |

Otros datos: tamano del repositorio 8,4 GB; libreria declarada `llima`; pipeline `text-generation`; `inference: false` en la model card; 0 descargas y 0 likes en el momento de la consulta; creado el 2026-10-18.

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-7B-Instruct: un transformer decoder-only de 7.000 millones de parametros con atencion por cabezas agrupadas (GQA) en su version original. Sobre esa base, simaai genero una variante "Autoround" que aplica cuantizacion post-entrenamiento con AutoRound, preservando tamanos de grupo y excepciones de precision mixta en capas sensibles. Esta ficha no dispone de los detalles del afinado realizado por simaai (volumen de datos, composicion del dataset, uso de RLHF o DPO): esa informacion no aparece en la model card consultada.

La innovacion tecnica de esta publicacion no esta en el entrenamiento sino en la compilacion. El modelo se traduce mediante compilacion nativa de ModelGraph con 16 procesos paralelos y un hilo de simulador por proceso, con "filter sharing" activado por defecto para los componentes de lenguaje. El resultado es un binario especifico de hardware en el que la longitud de contexto y las resoluciones de imagen soportadas se eligen en tiempo de compilacion, no en tiempo de ejecucion. Las revisiones exactas del modelo fuente y del compilador quedan registradas en `compilation.json`, lo que permite reproducir el build con un entorno de Model Compiler compatible.

## Capacidades

- Generacion de texto e instrucciones en ingles y otros idiomas heredados de Qwen2.5-7B-Instruct; el conjunto exacto de idiomas no esta declarado en esta publicacion.
- Conversacion multi-turno dentro de una ventana de 4.096 tokens, suficiente para dialogos de decenas de turnos breves.
- Razonamiento y respuesta a instrucciones complejas, condicionado a la perdida de precision de la cuantizacion INT4 en pesos.
- Generacion de codigo y matematicas basicas, como capacidad heredada del modelo base; no hay evaluacion publicada para esta compilacion concreta.
- Capacidades multimodales segun resoluciones de imagen seleccionadas durante la compilacion (la model card menciona este parametro, pero no especifica si esta build incluye vision).
- Tool calling y razonamiento multi-paso: no disponibles de forma confirmada; dependen de que el runtime LLiMa exponga el formato de plantilla y las primitivas de parada necesarias.
- Ejecucion offline total en el dispositivo, sin dependencia de servicios externos.

## Casos de uso

- Asistente conversacional embebido en dispositivos SiMa Modalix: el modelo corre integramente en el acelerador con weights INT4 y cache KV INT8, lo que permite dialogos multi-turno en local sin enviar datos a la nube y con 4.096 tokens de contexto.
- Extraccion de campos y clasificacion documental en el borde: para pipelines de digitalizacion industrial donde el texto de entrada cabe en 4.096 tokens, el modelo puede normalizar y etiquetar registros dentro del propio equipo.
- Interfaces de maquina en entornos industriales o sanitarios: sustituye a un servicio LLM remoto en HMIs donde la latencia de red o la normativa de proteccion de datos impiden la conexion externa.
- Resumen y respuesta sobre manuales tecnicos locales: con contexto de 4.096 tokens se pueden procesar secciones de manuales, fichas de producto o procedimientos y responder preguntas del operario en el puesto de trabajo.
- Prototipado de producto sobre NPU: sirve como referencia para medir el coste real de compilar y ejecutar un LLM de 7B en Modalix antes de comprometerse con un modelo mayor o con un dominio afinado.
- Validacion de la cadena de tooling Neat/LLiMa: el paquete incluye `compile.sh` y `compilation.json`, por lo que es util para reproducir builds, comparar argumentos del compilador y verificar el flujo de despliegue en una flota de dispositivos.
- Filtrado y moderacion de texto en el dispositivo: clasificacion de contenido sensible o deteccion de prompts anomalos sin salir del hardware local, con la ventaja de privacidad que implica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que la generacion en runtime sobre Modalix y las mediciones de precision y rendimiento "no son realizadas por esta cola" de trabajo; solo se confirma que la compilacion completa y el despliegue local terminaron correctamente y que los ficheros subidos se verificaron por checksum.

## Requisitos de hardware

- Hardware obligatorio: acelerador SiMa Modalix con un runtime LLiMa compatible. El modelo no esta pensado para GPU ni CPU convencionales.
- VRAM estimada: no aplica en el sentido habitual; el consumo depende de la memoria del SoC Modalix, con pesos INT4, activaciones BF16, embeddings y cache KV en INT8, y un repositorio de 8,4 GB.
- GPU recomendadas: ninguna; no existe ruta de ejecucion en A100, H100 ni RTX 4090 para este paquete.
- Compatibilidad con GPU de consumo: no; el formato es un grafo compilado con 147 ejecutables ELF ligados a la plataforma.
- Opciones de despliegue: descarga con `hf download` y ejecucion con `llima run ./Qwen2.5-7B-Instruct-Autoround-a16w4`. No hay soporte para vLLM, llama.cpp, Ollama ni TGI.
- Recompilacion: requiere un entorno de Model Compiler compatible, con `MODEL_DIR`, `OUTPUT_DIR` y argumentos adicionales; el contexto y las resoluciones de imagen se fijan en ese paso.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Ejecutable en GPU estandar |
|---|---|---|---|---|---|
| florianvoss/Qwen2.5-7B-Instruct-Autoround-a16w4 | 7B | 4.096 (fijado en compilacion) | Grafo compilado + ELF (LLiMa) | Apache 2.0 | No |
| simaai/Qwen2.5-7B-Instruct-Autoround-Safetensors | 7B | No disponible en la informacion consultada | Safetensors cuantizados (AutoRound) | Apache 2.0 | Si, con runtime compatible con el formato |
| Qwen/Qwen2.5-7B-Instruct | 7B | 32.768 (modelo original, dato externo a esta ficha) | Safetensors BF16 | Apache 2.0 | Si |
| Variantes GGUF/AWQ de Qwen2.5-7B-Instruct | 7B | 32.768 (original) | GGUF / INT4 | Apache 2.0 | Si |

La diferencia clave no es de calidad sino de portabilidad: frente a las alternativas, esta build sacrifica ocho veces de ventana de contexto (4.096 frente a los 32.768 del original) y toda compatibilidad con tooling estandar a cambio de ejecucion nativa en un acelerador de borde. No hay datos de rendimiento comparado disponibles.

## Limitaciones y advertencias

- Contexto reducido a 4.096 tokens, muy por debajo del modelo original; no es adecuado para documentos largos, RAG con muchos fragmentos ni conversaciones extensas.
- La cuantizacion INT4 en pesos con activaciones BF16 puede degradar razonamiento aritmetico, codigo y seguir instrucciones complejas; no hay evaluacion publicada que cuantifique esa perdida en esta build.
- Riesgo de alucinacion propio de un modelo de 7B, sin mitigaciones adicionales documentadas en esta publicacion.
- Idiomas soportados no declarados en la metadata; no se puede asumir un rendimiento multilingue equivalente al del modelo base sin validacion previa.
- Ausencia total de senales de validacion por la comunidad: 0 descargas, 0 likes, publicacion de un unico autor y model card sin resultados de evaluacion.
- Ligadura estricta al hardware: el paquete no funciona fuera de SiMa Modalix con un runtime LLiMa compatible, lo que descarta su uso en infraestructura cloud convencional.
- La licencia Apache 2.0 se hereda del modelo fuente, pero la model card remite expresamente a los terminos del modelo original; conviene verificar ese enlace antes de un uso comercial.
- El flag `inference: false` en la model card indica que la plataforma de HuggingFace no puede servirlo; no es un modelo cargable con `transformers`.
- Advertencia sobre la fecha: la publicacion figura como creada el 2026-10-18, posterior a la fecha habitual de consulta; conviene confirmar la vigencia del artefacto y de sus checksums.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/florianvoss/Qwen2.5-7B-Instruct-Autoround-a16w4
- Coleccion Neat 0.6.0: https://huggingface.co/collections/florianvoss/neat-060
- Modelo base (simaai, Safetensors): https://huggingface.co/simaai/Qwen2.5-7B-Instruct-Autoround-Safetensors
- Arbol del modelo fuente en la revision compilada: https://huggingface.co/simaai/Qwen2.5-7B-Instruct-Autoround-Safetensors/tree/a64ec8343c657115338f5b5a758c97b20c77185e
- Modelo original Qwen2.5-7B-Instruct: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Licencia del modelo original: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct/blob/a09a35458c702b33eeacc393d103063234e8bc28/LICENSE
- Registro de compilacion: https://huggingface.co/florianvoss/Qwen2.5-7B-Instruct-Autoround-a16w4/blob/main/compilation.json
- Informacion de hardware SiMa Modalix: no disponible en la informacion proporcionada.
