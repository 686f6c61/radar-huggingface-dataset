# martinnavs/granite-4.0-h-350m-router-kd-web4-s0-GGUF

## Resumen

`martinnavs/granite-4.0-h-350m-router-kd-web4-s0-GGUF` es una distribucion cuantizada del adaptador LoRA `martinnavs/granite-4.0-h-350m-router-kd-web4-s0`, fusionado sobre el modelo base `ibm-granite/granite-4.0-h-350m` de IBM y convertido a formato GGUF en cuantizacion Q4_K_M. No es un asistente general: es el enrutador de produccion del agente de voz AI-231-ME3, un componente especializado que decide, para cada peticion entrante, que herramienta invocar y con que argumentos, o bien si debe escalar la peticion a un humano o a un nivel superior del sistema.

El modelo resuelve un problema muy concreto de los pipelines de agentes de voz: la seleccion determinista y de baja latencia de herramientas a partir de transcripciones. Su salida no es lenguaje natural libre, sino una unica linea con el formato `NAME|arg|arg` o `escalate|<reason>`, lo que permite parsearla de forma trivial y encadenarla con el resto del agente. Con 350 millones de parametros y una ventana de contexto de 8192 tokens (segun la configuracion de servicio documentada), esta pensado para ejecutarse en CPU con un coste de aproximadamente 0,2 segundos por llamada en un portatil con 3 hilos.

La relevancia de esta publicacion es practica: el autor distribuye el artefacto listo para servir (merge + conversion + cuantizacion) para que los usuarios del agente AI-231-ME3 no tengan que reproducir el pipeline de fusion y conversion. La ficha del adaptador original es la referencia obligada para entender el entrenamiento, la evaluacion y los modos de fallo del enrutador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de IBM Granite 4.0 H, modelo base `ibm-granite/granite-4.0-h-350m`) |
| Parametros totales | 350 millones (modelo base); el fichero GGUF Q4_K_M ocupa 222.662.144 bytes |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 8192 tokens (configuracion de servicio documentada con `llama-server -c 8192`); la longitud nativa del base no se detalla en la informacion disponible |
| Tipos de cuantizacion | Q4_K_M (unico fichero publicado); el pipeline descrito genera F16 intermedio antes de cuantizar |
| Idiomas soportados | ingles (en) y tagalo (tl) |
| Licencia | Apache 2.0 (heredada del modelo base Granite; la cuantizacion no altera los terminos) |
| Formato de pesos | GGUF (`router-Q4_K_M.gguf`) |
| SHA-256 del fichero | `51d2dd3c599db9225f514ed16db82ec9146c55caf8f4c74c28377470e9581e3e` |
| Herramientas de conversion | `convert_hf_to_gguf.py` (a F16) y `llama-quantize` (a Q4_K_M), llama.cpp commit `8ca4060b7e30e76baaa5670ee1ec1b760b7f8552` (2026-10-28) |
| Servidor de referencia | `llama-server --jinja -c 8192 -np 1 -fa on -t 3 -tb 3` |

## Arquitectura y entrenamiento

La arquitectura subyacente es el transformer denso de IBM Granite 4.0 H en su variante de 350 millones de parametros. Sobre esa base se entreno un adaptador LoRA (identificador `kd-web4-s0`) cuyo objetivo no es la generacion libre sino el enrutamiento de herramientas: dada la transcripcion de una peticion de voz y el mensaje de sistema exacto que envia el agente, el modelo emite una unica linea de llamada a herramienta con argumentos separados por barras verticales, o una linea de escalado con una razon. El detalle del dataset de entrenamiento, el numero de tokens vistos y si se aplicaron tecnicas de RLHF o DPO no se recoge en la informacion disponible; la model card remite a la ficha del adaptador y al repositorio `Martinnavs/ME3-LoRA-training` para esos datos.

La innovacion tecnica de esta publicacion no esta en el modelado sino en la cadena de distribucion: fusion del adaptador LoRA sobre el base en bf16, conversion a F16 con el script oficial de llama.cpp, cuantizacion a Q4_K_M y validacion funcional contra el servidor de produccion. El autor verifico que la version precompilada de llama.cpp `b12345` (Linux x64, CPU) reproduce las mismas lineas de enrutamiento que el servidor de produccion en 12 de 12 frases de prueba, lo que convierte el artefacto en un sustituto directo del sistema original sin reentrenamiento ni ajuste.

## Capacidades

- Enrutamiento de herramientas: genera una linea `NAME|arg|arg` por peticion, seleccionando la herramienta y rellenando sus argumentos a partir de la transcripcion.
- Escalado controlado: emite `escalate|<reason>` cuando la peticion no encaja en ninguna herramienta o requiere intervencion humana.
- Salida estructurada y parseable: el formato de separadores permite extraer nombre y argumentos sin necesidad de un parser de JSON ni de gramaticas complejas.
- Baja latencia en CPU: aproximadamente 0,2 segundos por llamada con 3 hilos en un portatil.
- Multilingue limitado: entrenado y etiquetado para ingles y tagalo.
- Integracion con agentes de voz: disenado para el mensaje de sistema y la gramatica exactos del agente AI-231-ME3.
- No soporta generacion libre, razonamiento abierto, codigo, matematicas, vision ni audio; es un componente de enrutamiento, no un asistente.

## Casos de uso

- Enrutamiento de llamadas a herramientas en agentes de voz: el modelo recibe la transcripcion y el mensaje de sistema del agente AI-231-ME3 y devuelve la herramienta a invocar con sus argumentos, lo que permite encadenar la accion sin un LLM grande en el bucle critico.
- Despliegue en dispositivos sin GPU: al ejecutarse en CPU con llama.cpp y 3 hilos, cabe en portatiles y servidores modestos, lo que abarata el coste por llamada frente a alternativas de mayor tamano.
- Sustitucion directa del adaptador original: al estar ya fusionado y cuantizado, elimina el paso de merge y conversion en los pipelines de CI/CD o en los scripts de instalacion (`make setup-router` del repositorio AI-231-ME3).
- Pruebas de regresion del enrutador: el SHA-256 publicado y la validacion en 12 frases permiten fijar el artefacto y detectar desviaciones al actualizar llama.cpp o el servidor.
- Escalado a operador humano: la salida `escalate|<reason>` se puede mapear directamente a una cola de atencion o a un traspaso de llamada cuando la peticion queda fuera del catalogo de herramientas.
- Prototipado de agentes de voz multilingues en ingles y tagalo: sirve como base para experimentar con enrutamiento en esos dos idiomas antes de invertir en un modelo mayor.
- Investigacion sobre destilacion de enrutadores: el par adaptador + GGUF documenta un caso completo de destilacion de conocimiento hacia un modelo de 350M para una tarea acotada, util como referencia metodologica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica evaluacion reportada es funcional: la version servida con llama.cpp `b12345` reproduce las mismas lineas de enrutamiento que el servidor de produccion en 12 de 12 frases de prueba. Como dato operativo, el autor reporta aproximadamente 0,2 segundos por llamada en CPU con 3 hilos.

## Requisitos de hardware

- VRAM estimada: no requiere GPU; el fichero Q4_K_M ocupa 222.662.144 bytes (unos 212 MiB), por lo que la inferencia en CPU necesita del orden de unos cientos de MiB de RAM incluyendo el contexto de 8192 tokens.
- GPU recomendadas: no aplica; el autor lo sirve en CPU. Cualquier GPU consumer con soporte de llama.cpp podria ejecutarlo, pero no es el escenario documentado.
- Cabe en GPU consumer: si, en cualquier GPU con al menos 1 GB de memoria libre, aunque el caso de uso previsto es CPU.
- Opciones de despliegue: `llama-server` de llama.cpp con la configuracion documentada (`--jinja -c 8192 -np 1 -fa on -t 3 -tb 3`); tambien es compatible con otros runners de llama.cpp y con Ollama, aunque no se documenta en la model card.
- Latencia y throughput: aproximadamente 0,2 segundos por llamada con 3 hilos en CPU; el throughput no se detalla, pero al generar una unica linea corta el coste dominante es el prefill del contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| `martinnavs/granite-4.0-h-350m-router-kd-web4-s0-GGUF` | 350M | 8192 (config. de servicio) | GGUF Q4_K_M | Apache 2.0 | Enrutador especializado para agente de voz |
| `ibm-granite/granite-4.0-h-350m` (base) | 350M | no disponible en la informacion proporcionada | safetensors y variantes | Apache 2.0 | Modelo de lenguaje general |
| `martinnavs/granite-4.0-h-350m-router-kd-web4-s0` (adaptador) | 350M + LoRA | no disponible | safetensors (adaptador) | Apache 2.0 | Mismo enrutador, sin fusionar ni cuantizar |

La comparativa con otros enrutadores especializados de la misma categoria no esta disponible en la informacion proporcionada. Frente al base y al adaptador, la diferencia practica es el formato listo para servir y la validacion funcional contra el servidor de produccion.

## Limitaciones y advertencias

- No es un asistente general: solo funciona con el mensaje de sistema y la gramatica exactos del agente AI-231-ME3; fuera de ese contexto su comportamiento es impredecible, segun advierte el propio autor.
- Riesgo de alucinacion en la seleccion de herramienta o en los argumentos: al ser un modelo de 350M, puede emitir nombres de herramienta inexistentes o argumentos mal formados si la transcripcion es ambigua o ruidosa.
- Cobertura linguistica limitada a ingles y tagalo; no se garantiza un comportamiento correcto en castellano ni en otros idiomas.
- Dependencia de la version de llama.cpp: la validacion se hizo con el commit `8ca4060b7e30e76baaa5670ee1ec1b760b7f8552` y la release `b12345`; cambios en el tokenizador o en el manejo de plantillas podrian alterar la salida.
- Un unico formato de cuantizacion publicado (Q4_K_M); no hay variantes Q5, Q8 ni F16 listas para descargar.
- Sin datos publicos de benchmarks, sesgos o evaluaciones de robustez mas alla de las 12 frases de prueba.
- Licencia Apache 2.0: permite uso comercial, pero se heredan las condiciones del modelo base Granite de IBM; conviene revisar los terminos del base antes de un despliegue en produccion.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en produccion por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/martinnavs/granite-4.0-h-350m-router-kd-web4-s0-GGUF
- Adaptador LoRA original: https://huggingface.co/martinnavs/granite-4.0-h-350m-router-kd-web4-s0
- Modelo base: https://huggingface.co/ibm-granite/granite-4.0-h-350m
- Codigo, datos y entrenamiento: https://github.com/Martinnavs/ME3-LoRA-training
- Agente de voz que lo utiliza: https://github.com/Martinnavs/AI-231-ME3
