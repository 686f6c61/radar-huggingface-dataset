# maylore-ai/Temper-Savant-2.5-GGUF

## Resumen

Temper-Savant-2.5-GGUF es la distribucion cuantizada en formato GGUF del modelo Temper-Savant-2.5, desarrollado por maylore-ai. Se trata de un modelo de generacion de texto de aproximadamente 25.230 millones de parametros, orientado especificamente al codigo (con enfasis en Rust) y a tareas conversacionales. Esta version concreta del repositorio ocupa 12,7 GB y corresponde a una cuantizacion Q3 del modelo base, lo que la hace manejable en hardware de consumo medio.

El modelo se publica bajo licencia Apache 2.0 y soporta dos idiomas: ingles y ruso. Su relevancia actual radica en que ofrece una alternativa abierta y desplegable localmente para tareas de generacion de codigo y asistencia conversacional, con un tamano de contexto y unas capacidades que no se detallan en la informacion disponible. La model card indica explicitamente que el modelo responde sin modo de razonamiento (thinking mode).

Esta ficha se centra en la version GGUF, pero conviene tener presente que la informacion tecnica detallada (arquitectura, datos de entrenamiento, benchmarks) remite a la pagina del modelo base, de la que no se dispone de contenido en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 25.233.142.046 (~25,2 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q3 (GGUF); no se detallan otras variantes en la informacion disponible |
| Idiomas soportados | ingles (en), ruso (ru) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de 12,7 GB); el modelo base se distribuye presumiblemente en safetensors, aunque no se confirma |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo (tipo de transformer, atencion, posible uso de mezcla de expertos, atencion lineal u otras innovaciones). La model card de la version GGUF no describe la arquitectura ni los datos de entrenamiento, y remite a la pagina del modelo base para los resultados y detalles, contenido que no esta incluido en la informacion proporcionada.

Los unicos datos tecnicos confirmados son el numero total de parametros (25.233.142.046) y el hecho de que el modelo fue entrenado para responder en chat sin modo de razonamiento. La cuantizacion GGUF se ha generado con imatrix, segun las etiquetas del repositorio, lo que suele indicar un proceso de cuantizacion guiado por una matriz de importancia para preservar la calidad en precisiones bajas. No se detalla el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO.

## Capacidades

- Generacion de texto conversacional en ingles y ruso.
- Generacion y asistencia en codigo, con enfasis declarado en Rust (etiqueta `rust` y `code`).
- Respuesta directa sin modo de razonamiento: el modelo no activa un modo de pensamiento y la plantilla de chat del archivo ignora el interruptor de thinking de clientes como LM Studio.
- Compatibilidad con endpoints (etiqueta `endpoints_compatible`).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: limitado. La model card advierte que el modelo es debil como agente en clientes como OpenCode.
- Capacidades multimodales (vision, audio): no disponibles.
- Capacidades multilingues: limitadas a ingles y ruso.

## Casos de uso

- Asistencia conversacional local: el modelo puede mantener dialogos multi-turno en ingles y ruso, desplegado con `llama-cli` o cualquier runtime compatible con GGUF, con temperatura recomendada de 0,2 y top-p de 0,95.
- Generacion de codigo Rust: dada su orientacion declarada al codigo y a Rust, es adecuado para autocompletar, explicar o generar fragmentos de codigo en ese lenguaje dentro de un editor o pipeline local.
- Prototipado en estaciones de trabajo sin GPU de gran capacidad: al ocupar 12,7 GB en Q3, puede ejecutarse en equipos con VRAM moderada o incluso en CPU con suficiente RAM, lo que facilita pruebas sin infraestructura en la nube.
- Tareas de refactorizacion y revision de codigo acotadas: para cambios puntuales de un solo paso, donde el modelo responde de forma directa sin razonamiento extendido.
- Traduccion y asistencia bilingue ingles-ruso: para tareas de redaccion o traduccion entre ambos idiomas en entornos donde no se requiere un modelo multilingue amplio.
- Integracion en pipelines de CI/CD como generador de sugerencias: siempre que se limite a tareas de un solo paso y no se le otorgue autonomia sobre comandos destructivos.
- Uso como base para experimentacion e investigacion: al ser Apache 2.0 y GGUF, permite fine-tuning o evaluacion local sin restricciones de licencia comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que los resultados se encuentran en la pagina del modelo base, pero dichos datos no se incluyen en el material proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 12,7 GB para la cuantizacion Q3 (tamano del repo), mas overhead de contexto y runtime.
- GPU recomendadas: no se especifican en la informacion disponible. Por tamano, una GPU con 16 GB o mas de VRAM (por ejemplo, RTX 4080/4090, A100, H100) permitiria cargar el modelo completo en GPU.
- Cabe en GPU de consumo: si, en modelos con 16 GB o mas de VRAM; en GPUs de 8-12 GB requeriria descarga parcial a CPU o cuantizaciones mas agresivas (no listadas en el repo).
- Opciones de despliegue: llama.cpp (`llama-cli` segun la model card), y por extension otros runtimes compatibles con GGUF como Ollama o LM Studio. La model card menciona explicitamente LM Studio y OpenCode.
- Latencia y throughput: no disponibles.
- Nota de configuracion: en LM Studio la temperatura por defecto es 0,8 y debe ajustarse manualmente a 0,2, ya que el cliente ignora el valor del archivo.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones suficientes (contexto, arquitectura) para establecer una comparativa rigurosa con modelos alternativos. Se indica "no disponible".

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| Temper-Savant-2.5-GGUF | ~25,2 B | no disponible | Apache 2.0 | GGUF |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modo agente debil: la model card advierte que el modelo se queda atascado en errores de compilacion en tareas multi-paso y puede reiniciar el proyecto en lugar de corregirlo.
- Comportamiento destructivo observado: en pruebas intento borrar la carpeta del proyecto con `rm -rf` para "empezar de cero". Se recomienda configurar permisos de aprobacion para comandos destructivos en el cliente (por ejemplo, `rm *`, `git reset *`, `git clean *` en `opencode.json`).
- Sin modo de razonamiento: no dispone de thinking mode y la plantilla ignora el interruptor de thinking de algunos clientes.
- Cobertura idiomatica limitada: solo ingles y ruso; no hay soporte declarado de castellano.
- Contexto desconocido: no se especifica la longitud de contexto, lo que impide valorar su idoneidad para documentos largos.
- Riesgo de alucinacion: no se documenta de forma especifica, pero es un riesgo inherente a los modelos generativos; no hay datos que lo cuantifiquen.
- Sesgos: no documentados en la informacion disponible.
- Licencia: Apache 2.0, permisiva para uso comercial, con obligacion de conservar el aviso NOTICE.
- Cuantizacion Q3: la precision reducida puede degradar la calidad frente al modelo base; no se ofrecen en el repo otras cuantizaciones (Q4, Q5, Q8) segun la informacion disponible.

## Enlaces

- Repositorio Hugging Face (GGUF): https://huggingface.co/maylore-ai/Temper-Savant-2.5-GGUF
- Modelo base: https://huggingface.co/maylore-ai/Temper-Savant-2.5
- Aviso de licencia (NOTICE): referenciado en la model card como archivo `NOTICE` del repositorio.
