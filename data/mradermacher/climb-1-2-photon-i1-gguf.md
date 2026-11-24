# mradermacher/Climb-1.2-Photon-i1-GGUF

## Resumen

Climb-1.2-Photon-i1-GGUF es la colección de cuantizaciones GGUF con imatrix del modelo Climb-1.2-Photon, publicada por el usuario mradermacher. El modelo base lo desarrolla Climb-Ai y está orientado a tareas de asistencia en terminal: generación y explicación de comandos de shell, automatización de flujos en Linux y soporte tipo copilot para entornos CLI. La model card etiqueta el modelo con los identificadores linux, bash, terminal, cli y copilot, además de qwen3_5, lo que sugiere una arquitectura derivada de la familia Qwen 3.5.

Se trata de un modelo compacto: los pesos en safetensors del modelo base suman 752.393.024 parámetros (aproximadamente 0,75 mil millones), lo que lo sitúa en la gama de modelos pequeños capaces de ejecutarse en hardware de consumo. El repositorio GGUF ocupa 11,1 GB en total porque incluye más de veinte variantes de cuantización, desde IQ1_S (0,4 GB) hasta Q6_K (0,7 GB); cada archivo individual es muy ligero.

Su relevancia práctica radica en la combinación de tamaño reducido, licencia Apache 2.0 y disponibilidad en formato GGUF, lo que permite desplegarlo localmente con llama.cpp u Ollama sin dependencia de servicios en la nube, algo útil para asistentes de terminal que operan sobre código y comandos potencialmente sensibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de la familia Qwen 3.5, segun el tag qwen3_5; detalles no disponibles) |
| Parametros totales | 752.393.024 |
| Parametros activos | No aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, Q2_K_S, Q2_K, Q3_K_S, IQ3_XS, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, Q4_0, Q4_K_S, IQ4_XS, IQ4_NL, Q4_1, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K (todas con imatrix) |
| Idiomas soportados | Ruso (ru) e ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado); pesos originales en safetensors en el modelo base |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla del tag qwen3_5, que apunta a una variante de la familia Qwen 3.5 de Alibaba. Con 752 millones de parametros se trata de un modelo denso de escala pequena, adecuado para inferencia en CPU y GPU de gama baja. No se han publicado en la informacion proporcionada datos sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO.

La aportacion tecnica de este repositorio concreto es la cuantizacion con imatrix (importance matrix), un proceso que calcula la importancia de cada tensor usando un corpus de calibracion y mejora la calidad de las cuantizaciones de baja precision respecto a las estaticas. El autor ofrece ademas cuantizaciones estaticas en un repositorio paralelo (Climb-1.2-Photon-GGUF) y publica el propio archivo imatrix para que terceros puedan generar sus propias variantes.

## Capacidades

- Generacion de texto conversacional en ruso e ingles.
- Asistencia especializada en terminal: generacion, explicacion y correccion de comandos de shell (bash) y flujos de trabajo en Linux.
- Soporte tipo copilot para entornos CLI, segun las etiquetas del modelo.
- Capacidad de conversacion multi-turno (etiqueta conversational).
- Compatibilidad con endpoints (etiqueta endpoints_compatible).
- No hay evidencia en la informacion disponible de soporte de tool calling, agentes, vision, audio ni modo thinking explicito.

## Casos de uso

- Asistente de terminal local: el modelo puede sugerir comandos bash a partir de una descripcion en lenguaje natural y explicar que hace cada opcion; su tamano permite ejecutarlo en la misma maquina donde se trabaja, sin enviar comandos a un servicio externo.
- Automatizacion de scripts de administracion: generar plantillas de scripts de shell para tareas repetitivas (backups, monitorizacion, limpieza de logs) y revisar scripts existentes en busca de errores.
- Documentacion de infraestructura: convertir secuencias de comandos en explicaciones paso a paso para wikis internas o runbooks de operaciones.
- Formacion de desarrolladores junior en Linux: un asistente interactivo que responde dudas sobre permisos, tuberias, procesos y utilidades del sistema en conversaciones multi-turno.
- Integracion en editores y herramientas CLI: al ser un GGUF pequeno, puede embeberse en plugins de terminal o entornos de desarrollo para autocompletado y explicacion de comandos con baja latencia.
- Despliegue en entornos con restricciones de privacidad: al ejecutarse localmente con licencia Apache 2.0, encaja en equipos donde no se permite enviar informacion de sistemas a APIs externas.
- Prototipado rapido de asistentes conversacionales bilingues ruso-ingles sobre hardware modesto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: cada cuantizacion ocupa entre 0,4 GB (IQ1_S) y 0,7 GB (Q6_K) en disco; en memoria se requiere un margen adicional para el contexto y el runtime, por lo que en la practica basta con aproximadamente 1-2 GB de RAM o VRAM.
- GPU recomendadas: cualquier GPU con 2 GB o mas de VRAM es suficiente; tambien funciona en CPU. No se requiere A100 ni H100.
- Cabe holgadamente en GPU de consumo: GTX 1050 Ti, GTX 1650, RTX 3050, RTX 4060 y superiores.
- Opciones de despliegue: llama.cpp, Ollama y otros runtimes compatibles con GGUF; el modelo base usa la libreria transformers.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Climb-1.2-Photon-i1-GGUF | 752 M | No disponible | ru, en | Apache 2.0 | GGUF |
| Qwen2.5-Coder-0.5B (referencia de la familia) | 0,5 B | 32 K (segun documentacion publica de Qwen) | Multilingue | Apache 2.0 | safetensors, GGUF |
| Qwen2.5-Coder-1.5B (referencia de la familia) | 1,5 B | 32 K (segun documentacion publica de Qwen) | Multilingue | Apache 2.0 | safetensors, GGUF |

La comparativa con modelos de la familia Qwen se ofrece como referencia de categoria por tamano y orientacion a codigo; no se dispone de datos de rendimiento de Climb-1.2-Photon para establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- Modelo de 752 millones de parametros: su capacidad de razonamiento complejo y de generacion de codigo es limitada en comparacion con modelos de mayor escala.
- Idiomas: solo se declaran ruso e ingles; el rendimiento en castellano no esta documentado y probablemente sea deficiente.
- Riesgo de alucinacion en comandos de shell: un comando incorrecto puede tener consecuencias destructivas; se recomienda validacion humana antes de ejecutar cualquier sugerencia en produccion.
- No hay informacion publicada sobre sesgos, datos de entrenamiento ni evaluaciones de seguridad.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base y este repositorio de cuantizaciones son artefactos distintos; conviene verificar la licencia del modelo base Climb-Ai/Climb-1.2-Photon antes de redistribuir.
- Las cuantizaciones de muy baja precision (IQ1_S, IQ1_M, Q2_K_S) degradan notablemente la calidad; el propio autor las describe como "for the desperate" o "very low quality".
- No se dispone de informacion sobre la longitud de contexto soportada, lo que impide garantizar conversaciones o ficheros largos.

## Enlaces

- Repositorio GGUF con imatrix: https://huggingface.co/mradermacher/Climb-1.2-Photon-i1-GGUF
- Modelo base: https://huggingface.co/Climb-Ai/Climb-1.2-Photon
- Cuantizaciones estaticas: https://huggingface.co/mradermacher/Climb-1.2-Photon-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Climb-1.2-Photon-i1-GGUF
- Guia de uso de GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Peticiones de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
- Notas sobre tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
