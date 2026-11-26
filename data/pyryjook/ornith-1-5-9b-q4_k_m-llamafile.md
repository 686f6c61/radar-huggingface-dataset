# pyryjook/Ornith-1.5-9B-Q4_K_M.llamafile

## Resumen

Ornith-1.5-9B-Q4_K_M.llamafile es un empaquetado ejecutable del modelo Ornith-1.5-9B, distribuido por el usuario pyryjook a partir de la cuantizacion Q4_K_M publicada por el desarrollador original (ornith-ai) en formato GGUF. No se trata de un modelo nuevo: es un artefacto de conveniencia que combina los pesos cuantizados del modelo base con el runtime de llama.cpp y el cargador de llamafile de Mozilla.ai en un unico binario multiplataforma (BSD, Linux, macOS y Windows). El modelo subyacente tiene 9.197.093.888 parametros (aproximadamente 9,2 mil millones) y esta pensado para inferencia local en hardware modesto.

La relevancia de esta publicacion es practica: elimina la friccion de instalar dependencias y permite arrancar un servidor compatible con la API de OpenAI en http://localhost:8000 con un solo comando, sin compilacion ni gestion de entornos. El autor indica que el modelo cabe en unos 4 GB de VRAM con la cuantizacion Q4_K_M, lo que lo situa en el rango de GPU de consumo y portatiles con grafica dedicada basica. La ventana de contexto es descrita como "modesta" sin cifra concreta. La licencia es MIT y el pipeline no esta declarado en la ficha de Hugging Face.

Conviene subrayar que la model card no aporta informacion sobre arquitectura, datos de entrenamiento, idiomas ni evaluaciones. Todo lo que se detalla a continuacion relativo al modelo base queda marcado como no disponible cuando no consta en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el modelo base es un transformer de ~9B; no se detalla en la informacion disponible) |
| Parametros totales | 9.197.093.888 (~9,2B) |
| Parametros activos | no aplica (no consta que sea MoE) |
| Longitud de contexto | no disponible (la model card la describe como "modesta" sin cifra) |
| Tipos de cuantizacion | Q4_K_M (GGUF); el repo del modelo base podria ofrecer otras, no confirmado |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF embebido en un ejecutable .llamafile (runtime llama.cpp v0.10.6 + zipalign) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base Ornith-1.5-9B: la model card del llamafile no describe si emplea attention estandar, variantes lineales, mezcla de expertos u otra innovacion, ni detalla el numero de tokens de entrenamiento, la composicion del dataset o si hubo fases de RLHF o DPO. El unico dato estructural cierto es el recuento de parametros (9.197.093.888) y el hecho de que el artefacto distribuido es una cuantizacion Q4_K_M en formato GGUF, generada con imatrix segun las etiquetas del repositorio.

El componente tecnico diferencial de esta publicacion no es el modelo, sino el empaquetado llamafile: un unico binario que integra el runtime de llama.cpp (version 0.10.6 de llamafile) y los pesos, de modo que el mismo fichero se ejecuta en Linux, macOS, BSD y Windows. El autor documenta la verificacion de procedencia mediante comparacion de hashes SHA-256 entre el GGUF embebido y el GGUF original del repositorio ornith-ai, lo que permite auditar que los pesos no han sido alterados.

## Capacidades

- Generacion de texto conversacional: las etiquetas del repositorio incluyen "conversational", lo que sugiere un ajuste orientado a dialogo, aunque no se detalla el formato de prompt ni la plantilla de chat.
- Servidor compatible con la API de OpenAI: el binario arranca un endpoint en http://localhost:8000 utilizable desde clientes y agentes que hablen ese protocolo.
- Interfaz TUI integrada: ejecucion interactiva en terminal sin configuracion adicional.
- Modo headless: el flag `--server` permite lanzarlo como servicio sin interfaz, emitiendo logs por stdout.
- Tool calling, razonamiento multi-paso, capacidades multimodales, vision o audio: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; no se declaran idiomas soportados.
- Modo de razonamiento explicito (thinking mode): no disponible.

## Casos de uso

- Pruebas locales en portatil: un desarrollador puede descargar el binario, darle permisos de ejecucion y conversar con el modelo en minutos, sin instalar Python, CUDA ni dependencias, lo que lo hace adecuado para evaluar rapidamente si el modelo encaja en un flujo de trabajo antes de invertir en infraestructura.
- Prototipado de agentes con API OpenAI: al exponer un endpoint compatible, se puede apuntar cualquier framework de agentes (LangChain, LlamaIndex, AutoGen) a localhost:8000 y validar prompts y cadenas de herramientas sin coste de API ni latencia de red externa.
- Entornos aislados o sin conectividad: al ser un unico fichero ejecutable, encaja en maquinas air-gapped, laboratorios o demos en ferias donde no se puede depender de servicios en la nube.
- Educacion y talleres: instructores pueden distribuir un solo fichero a los alumnos y garantizar que todos ejecutan exactamente la misma version del modelo y del runtime, eliminando variabilidad de entorno.
- Automatizacion de tareas de texto en estaciones de trabajo modestas: generacion de resumenes, reescritura o clasificacion simple en equipos con ~4 GB de VRAM, donde un modelo mayor no cabria.
- Integracion en pipelines CI/CD como smoke test: verificar que el endpoint responde y produce salidas coherentes antes de desplegar variantes mayores o configuraciones de produccion.
- Verificacion de cadena de suministro: el flujo de comparacion de hashes SHA-256 documentado permite usar este artefacto como referencia reproducible en auditorias de procedencia de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra metrica, y tampoco se aportan cifras de latencia o throughput mas alla de la afirmacion cualitativa de que el modelo "cabe comodamente en 4 GB de VRAM".

## Requisitos de hardware

- VRAM estimada: aproximadamente 4 GB con cuantizacion Q4_K_M, segun el autor; el tamano del repositorio es de 11,9 GB, aunque el peso efectivo del GGUF Q4_K_M de un modelo de 9,2B suele rondar los 5-6 GB, por lo que conviene verificar el tamano exacto del fichero antes de planificar el despliegue.
- GPU recomendadas: no se especifican modelos concretos; por el perfil de VRAM, encaja en GPU de consumo con 6-8 GB (por ejemplo, RTX 3060, RTX 4060) y en portatiles con grafica dedicada basica.
- Cabe en GPU de consumo: si, segun la propia model card, en hardware modesto tipo portatil.
- Opciones de despliegue: llamafile (runtime llama.cpp embebido, version 0.10.6); al ser un GGUF estandar en su interior, tambien podria cargarse con llama.cpp, Ollama u otros runners compatibles con GGUF, aunque esto no se documenta explicitamente en la ficha.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo base ni de sus competidores directos en la informacion proporcionada, por lo que no es posible establecer una comparativa cuantitativa fiable. A continuacion se ofrece una comparacion estructural limitada a lo que consta:

| Modelo | Parametros | Contexto | Formato de distribucion | Licencia |
|---|---|---|---|---|
| Ornith-1.5-9B-Q4_K_M.llamafile (esta ficha) | ~9,2B | no disponible | .llamafile con GGUF Q4_K_M embebido | MIT |
| Ornith-1.5-9B-GGUF (modelo base) | ~9,2B | no disponible | GGUF | MIT |
| Alternativas de ~7-9B en formato GGUF | no disponible | no disponible | GGUF | no disponible |

No se han identificado en la informacion disponible modelos comparables concretos con datos verificables de rendimiento, contexto o licencia.

## Limitaciones y advertencias

- Ventana de contexto reducida: el propio autor la califica de "modesta" sin dar cifra, lo que desaconseja tareas que requieran documentos largos o conversaciones multi-turno extensas.
- Ausencia total de evaluaciones: no hay benchmarks, por lo que el rendimiento real en razonamiento, codigo o matematicas es desconocido y no debe asumirse.
- Idiomas no declarados: no se especifica que lenguas soporta el modelo, lo que es un riesgo para despliegues en castellano u otros idiomas distintos del ingles.
- Riesgo de alucinacion: inherente a los modelos de lenguaje de este tamano; sin datos de evaluacion no es posible acotarlo.
- Sesgos: no disponible; no se documenta ninguna evaluacion de sesgo.
- Seguridad del formato .llamafile: el binario embebe un runtime ejecutable y puede disparar falsos positivos en antivirus, especialmente en Windows. El propio autor enlaza el aviso PAIT-LMAFL-300 de Palo Alto Networks sobre ejecucion de codigo malicioso durante la inferencia y la issue de seguridad del repositorio de llamafile. Descargar llamafiles de fuentes no confiables es riesgoso.
- Verificacion obligatoria: se recomienda comprobar el hash SHA-256 del GGUF embebido contra el original de ornith-ai antes de ejecutar el binario en produccion.
- Compatibilidad macOS: el autor advierte de posibles errores segun la version del SDK y propone exportar `SDKROOT` apuntando a MacOSX26.5.sdk como solucion temporal.
- Licencia MIT: permisiva para uso comercial, pero al ser un artefacto derivado conviene revisar tambien los terminos del modelo base ornith-ai/Ornith-1.5-9B-GGUF, que la ficha declara como MIT.
- Sin mantenimiento garantizado: cero descargas y cero likes en el momento de la consulta, con un unico autor no vinculado al desarrollo del modelo; no hay compromiso de actualizaciones.

## Enlaces

- Repositorio del llamafile: https://huggingface.co/pyryjook/Ornith-1.5-9B-Q4_K_M.llamafile
- GGUF embebido en el repo: https://huggingface.co/pyryjook/Ornith-1.5-9B-Q4_K_M.llamafile/blob/main/Ornith-1.5-9B-Q4_K_M.gguf
- Modelo base GGUF: https://huggingface.co/ornith-ai/Ornith-1.5-9B-GGUF
- GGUF original Q4_K_M: https://huggingface.co/ornith-ai/Ornith-1.5-9B-GGUF/blob/main/Ornith-1.5-9B-Q4_K_M.gguf
- Proyecto llamafile (Mozilla.ai): https://github.com/mozilla-ai/llamafile
- Release de llamafile v0.10.6: https://github.com/mozilla-ai/llamafile/releases/tag/0.10.6
- Runtime llama.cpp: https://llama-cpp.com/
- Documentacion de Xet en Hugging Face: https://huggingface.co/docs/hub/en/xet/index
- Aviso de seguridad PAIT-LMAFL-300: https://insights-db.paloaltonetworks.com/knowledge-base/runtime-threats/PAIT-LMAFL-300
- Issue de seguridad de llamafile: https://github.com/mozilla-ai/llamafile/issues/15
